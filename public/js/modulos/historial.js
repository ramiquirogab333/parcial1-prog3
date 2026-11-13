/**
 * M05 — Historial de ventas.
 *
 * Global · Paso 3: el historial se lee de la API, no de Datos.ventas.
 * - Listado: GET /ventas/?limit=20&offset=N (identificador, fecha, cliente y total).
 * - Detalle: GET /ventas/{id} al pedirlo (renglones con libro, cantidad, precio unitario
 *   y subtotal). Se guarda por id: una venta registrada no cambia, así que no hace falta
 *   volver a pedirla.
 *
 * Los importes que se muestran son SIEMPRE los que devolvió el servidor: nunca se
 * recalculan con el precio actual del libro. Así, si un libro cambia de precio, las ventas
 * ya registradas conservan sus importes históricos.
 *
 * Las ventas no se editan ni se eliminan. Inserta datos sólo con textContent.
 *
 * Namespace público: Historial.render(), Historial.iniciar() y Historial.cargar().
 * Ventas (Paso 6) puede llamar a Historial.cargar() después de un POST /ventas/ exitoso,
 * o disparar el evento "datos-actualizados" con { coleccion: "ventas" }.
 */

var Historial = (function () {
  "use strict";

  var LIMITE = 20;

  var IDS = {
    contenedorTabla: "contenedor-tabla-historial",
    cuerpo: "cuerpo-tabla-historial",
    vacio: "mensaje-historial-vacio",
    error: "mensaje-historial-error",
    anterior: "btn-historial-anterior",
    siguiente: "btn-historial-siguiente",
    pagina: "pagina-historial"
  };

  var TEXTOS = {
    cargando: "Cargando el historial de ventas…",
    vacio: "Todavía no hay ventas registradas.",
    paginaVacia: "No hay más ventas en esta página.",
    error: "No se pudo cargar el historial. Revisá tu conexión e intentá de nuevo.",
    cargandoDetalle: "Cargando el detalle de la venta…",
    errorDetalle: "No se pudo cargar el detalle de la venta.",
    identificador: "Identificador",
    verDetalle: "Ver detalle",
    ocultarDetalle: "Ocultar detalle",
    total: "Total"
  };

  var COLUMNAS = 5;

  var estado = {
    desplazamiento: 0,
    ventas: [],
    cargando: true,
    error: "",
    numeroPeticion: 0
  };

  // Detalles ya traídos (id → venta normalizada) y estado de cada detalle abierto.
  var detalles = {};
  var abiertas = {};
  var cargandoDetalle = {};
  var erroresDetalle = {};

  var iniciado = false;

  // ---------- Helpers ----------

  function obtener(id) {
    return document.getElementById(id);
  }

  function crearElemento(etiqueta, texto) {
    var elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    return elemento;
  }

  function formatearFecha(iso) {
    var fecha = new Date(iso);
    return isNaN(fecha.getTime()) ? String(iso) : fecha.toLocaleString("es-AR");
  }

  function importe(numero) {
    return Number(numero).toFixed(2);
  }

  // ---------- Tabla ----------

  /** El HTML de M01 no trae columna de identificador: se agrega una sola vez desde acá. */
  function asegurarColumnaIdentificador() {
    var fila = document.querySelector("#" + IDS.contenedorTabla + " thead tr");

    if (fila === null || fila.querySelector("[data-columna='identificador']") !== null) {
      return;
    }

    var encabezado = crearElemento("th", TEXTOS.identificador);
    encabezado.scope = "col";
    encabezado.setAttribute("data-columna", "identificador");
    fila.insertBefore(encabezado, fila.firstChild);
  }

  function crearTablaDetalle(venta) {
    var tabla = document.createElement("table");
    var cabecera = document.createElement("thead");
    var filaCabecera = document.createElement("tr");
    var cuerpo = document.createElement("tbody");
    var pie = document.createElement("tfoot");
    var filaTotal = document.createElement("tr");
    var etiquetaTotal = crearElemento("td", TEXTOS.total);

    tabla.className = "tabla-datos";
    ["Libro", "Cantidad", "Precio unitario", "Subtotal"].forEach(function (titulo) {
      var encabezado = crearElemento("th", titulo);
      encabezado.scope = "col";
      filaCabecera.appendChild(encabezado);
    });
    cabecera.appendChild(filaCabecera);

    venta.renglones.forEach(function (renglon) {
      var fila = document.createElement("tr");
      fila.appendChild(crearElemento("td", renglon.titulo));
      fila.appendChild(crearElemento("td", String(renglon.cantidad)));
      fila.appendChild(crearElemento("td", importe(renglon.precioUnitario)));
      fila.appendChild(crearElemento("td", importe(renglon.subtotal)));
      cuerpo.appendChild(fila);
    });

    // El total también sale del detalle del servidor, no de sumar los renglones acá.
    // Celda común (no th): la tabla pinta los th como encabezado y cortaría la fila.
    etiquetaTotal.colSpan = 3;
    filaTotal.appendChild(etiquetaTotal);
    filaTotal.appendChild(crearElemento("td", importe(venta.total)));
    pie.appendChild(filaTotal);

    tabla.appendChild(cabecera);
    tabla.appendChild(cuerpo);
    tabla.appendChild(pie);
    return tabla;
  }

  /** La fila de detalle muestra la tabla de renglones, o el estado de carga / error del pedido. */
  function crearFilaDetalle(id) {
    var fila = document.createElement("tr");
    var celda = document.createElement("td");
    var mensaje;

    celda.colSpan = COLUMNAS;

    if (detalles[id]) {
      celda.appendChild(crearTablaDetalle(detalles[id]));
    } else if (erroresDetalle[id]) {
      mensaje = crearElemento("p", erroresDetalle[id]);
      mensaje.className = "mensaje mensaje--error";
      mensaje.setAttribute("role", "alert");
      celda.appendChild(mensaje);
    } else {
      mensaje = crearElemento("p", TEXTOS.cargandoDetalle);
      mensaje.className = "mensaje";
      mensaje.setAttribute("role", "status");
      celda.appendChild(mensaje);
    }

    fila.appendChild(celda);
    return fila;
  }

  function crearBotonDetalle(venta) {
    var boton = document.createElement("button");
    var abierta = abiertas[venta.id] === true;

    boton.type = "button";
    boton.className = "boton";
    boton.textContent = abierta ? TEXTOS.ocultarDetalle : TEXTOS.verDetalle;
    boton.setAttribute("aria-expanded", abierta ? "true" : "false");
    boton.setAttribute("aria-label", boton.textContent + " de la venta " + venta.id);
    boton.addEventListener("click", function () {
      alternarDetalle(venta.id);
    });
    return boton;
  }

  function crearFila(venta) {
    var fila = document.createElement("tr");
    var celdaDetalle = document.createElement("td");

    celdaDetalle.appendChild(crearBotonDetalle(venta));

    fila.appendChild(crearElemento("td", venta.id));
    fila.appendChild(crearElemento("td", formatearFecha(venta.fecha)));
    fila.appendChild(crearElemento("td", venta.clienteNombre));
    fila.appendChild(celdaDetalle);
    fila.appendChild(crearElemento("td", importe(venta.total)));
    return fila;
  }

  function actualizarControles() {
    var anterior = obtener(IDS.anterior);
    var siguiente = obtener(IDS.siguiente);
    var pagina = obtener(IDS.pagina);

    if (anterior !== null) {
      anterior.disabled = estado.cargando || estado.desplazamiento === 0;
    }
    // El listado no informa el total: si la página no llegó llena, no hay otra.
    if (siguiente !== null) {
      siguiente.disabled = estado.cargando || estado.error !== "" || estado.ventas.length < LIMITE;
    }
    if (pagina !== null) {
      pagina.textContent = "Página " + (Math.floor(estado.desplazamiento / LIMITE) + 1);
    }
  }

  /** Redibuja la página actual del historial desde el estado del módulo (no hace pedidos). */
  function render() {
    var cuerpo = obtener(IDS.cuerpo);
    var vacio = obtener(IDS.vacio);
    var error = obtener(IDS.error);
    var fragmento = document.createDocumentFragment();

    if (cuerpo === null || vacio === null || error === null) {
      console.error("Historial: faltan contenedores del DOM para dibujar la tabla.");
      return;
    }

    asegurarColumnaIdentificador();

    estado.ventas.forEach(function (venta) {
      fragmento.appendChild(crearFila(venta));
      if (abiertas[venta.id] === true) {
        fragmento.appendChild(crearFilaDetalle(venta.id));
      }
    });

    cuerpo.textContent = "";
    cuerpo.appendChild(fragmento);

    vacio.textContent = "";
    error.textContent = "";

    if (estado.cargando) {
      vacio.textContent = TEXTOS.cargando;
    } else if (estado.error !== "") {
      error.textContent = estado.error;
    } else if (estado.ventas.length === 0) {
      vacio.textContent = estado.desplazamiento === 0 ? TEXTOS.vacio : TEXTOS.paginaVacia;
    }

    actualizarControles();
  }

  // ---------- API ----------

  /**
   * Trae la página actual del listado. numeroPeticion descarta respuestas viejas si el
   * usuario cambió de página antes de que llegara la anterior.
   */
  async function cargar() {
    var numero = estado.numeroPeticion + 1;
    var resultado;

    estado.numeroPeticion = numero;
    estado.cargando = true;
    estado.error = "";
    render();

    resultado = await API.get("/ventas/", { limit: LIMITE, offset: estado.desplazamiento });

    if (numero !== estado.numeroPeticion) {
      return;
    }

    estado.cargando = false;
    if (!resultado.ok || !Array.isArray(resultado.data)) {
      estado.ventas = [];
      estado.error = resultado.mensaje || TEXTOS.error;
    } else {
      estado.ventas = resultado.data.map(API.normalizar.venta);
    }
    render();
  }

  async function cargarDetalle(id) {
    var resultado;

    cargandoDetalle[id] = true;
    delete erroresDetalle[id];
    render();

    resultado = await API.get("/ventas/" + encodeURIComponent(id));

    cargandoDetalle[id] = false;
    if (resultado.ok && resultado.data) {
      detalles[id] = API.normalizar.venta(resultado.data);
    } else {
      erroresDetalle[id] = TEXTOS.errorDetalle + " " + (resultado.mensaje || "");
    }
    render();
  }

  /** Abre o cierra el detalle; sólo pide a la API si todavía no lo tiene (o si falló antes). */
  function alternarDetalle(id) {
    abiertas[id] = !abiertas[id];

    if (abiertas[id] && !detalles[id] && !cargandoDetalle[id]) {
      cargarDetalle(id);
      return;
    }
    render();
  }

  // ---------- Paginación ----------

  function irAnterior() {
    if (estado.cargando || estado.desplazamiento === 0) {
      return;
    }
    estado.desplazamiento = Math.max(0, estado.desplazamiento - LIMITE);
    cargar();
  }

  function irSiguiente() {
    if (estado.cargando || estado.ventas.length < LIMITE) {
      return;
    }
    estado.desplazamiento += LIMITE;
    cargar();
  }

  /** Cuando se registra una venta nueva, se vuelve a pedir la página para que aparezca. */
  function alActualizarDatos(evento) {
    if (evento && evento.detail && evento.detail.coleccion === "ventas") {
      cargar();
    }
  }

  // ---------- Inicio ----------

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof API === "undefined" || obtener(IDS.cuerpo) === null || obtener(IDS.vacio) === null) {
      console.error("Historial: falta el cliente de la API o los elementos de la vista Historial.");
      return;
    }

    var anterior = obtener(IDS.anterior);
    var siguiente = obtener(IDS.siguiente);

    if (anterior !== null) {
      anterior.addEventListener("click", irAnterior);
    }
    if (siguiente !== null) {
      siguiente.addEventListener("click", irSiguiente);
    }
    document.addEventListener("datos-actualizados", alActualizarDatos);

    render();
    cargar();
  }

  return {
    render: render,
    iniciar: iniciar,
    cargar: cargar
  };
})();

// api.js se carga después de este archivo (index.html): se espera al DOM completo para
// que API ya exista. Catálogo usa el mismo criterio.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", Historial.iniciar);
} else {
  Historial.iniciar();
}
