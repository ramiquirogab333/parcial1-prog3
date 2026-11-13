/**
 * M05 — Venta (Global · Paso 6: registrada en la API).
 *
 * Compone el ticket en memoria (agregar, cambiar cantidad y quitar renglones) y muestra
 * subtotales y total como ESTIMACIÓN con el precio del catálogo. Al confirmar envía a
 * POST /ventas/ únicamente { cliente_id, renglones: [{ libro_id, cantidad }] }: el precio,
 * el total, la fecha y el id los decide el servidor, que copia el precio del catálogo.
 *
 * - 201: se muestra un comprobante con los precios unitarios, subtotales y total DE LA
 *   RESPUESTA, se limpia el ticket, se agrega la venta a Datos.ventas y se dispara
 *   "datos-actualizados" con detail.coleccion = "ventas" para que el historial se recargue.
 * - 409 / 422 / sin conexión: se muestra el mensaje y el borrador queda intacto.
 * - Mientras se envía, el ticket queda bloqueado para evitar ventas duplicadas.
 *
 * Inserta datos sólo con textContent / createElement, nunca como HTML.
 *
 * Namespace público: Ventas.validarCantidad, redondear, calcularSubtotal, calcularTotal,
 * agregarRenglon, construirCuerpo, Ventas.render() (ver design.md de m05-venta-simulada-historial).
 */

var Ventas = (function () {
  "use strict";

  var IDS = {
    cliente: "venta-cliente",
    libro: "venta-libro",
    cantidad: "venta-cantidad",
    agregar: "btn-agregar-renglon",
    confirmar: "btn-confirmar-venta",
    contenedorTabla: "contenedor-tabla-renglones",
    cuerpo: "cuerpo-tabla-renglones",
    vacio: "mensaje-renglones-vacio",
    total: "venta-total",
    mensaje: "mensaje-venta"
  };

  var TEXTOS = {
    renglonesVacio: "Todavía no agregaste libros al ticket.",
    accionesTitulo: "Acciones",
    quitar: "Quitar",
    sinLibro: "Elegí un libro para agregar al ticket.",
    libroInexistente: "El libro elegido no existe en el catálogo.",
    cantidadInvalida: "La cantidad debe ser un número entero mayor que cero.",
    sinCliente: "Elegí un cliente para confirmar la venta.",
    sinRenglones: "Agregá al menos un libro al ticket para confirmar la venta.",
    duplicado: function (titulo) {
      return "«" + titulo + "» ya está en el ticket. Cambiá su cantidad en la tabla de renglones.";
    },
    agregado: function (titulo) {
      return "«" + titulo + "» agregado al ticket.";
    },
    cantidadActualizada: function (titulo) {
      return "Cantidad de «" + titulo + "» actualizada.";
    },
    quitado: function (titulo) {
      return "«" + titulo + "» quitado del ticket.";
    },
    rechazo: "No se pudo confirmar la venta: ",
    sinApi: "No está disponible la conexión con el servidor.",
    enviando: "Registrando la venta en el servidor…",
    botonEnviando: "Registrando venta…",
    exito: function (id, total) {
      return "Venta " + id + " registrada por $ " + total.toFixed(2) + ".";
    },
    comprobanteTitulo: function (id) {
      return "Comprobante de la venta " + id;
    },
    comprobanteDatos: function (fecha, cliente) {
      return "Fecha: " + fecha + " · Cliente: " + cliente;
    },
    comprobanteTotal: function (total) {
      return "Total registrado: $ " + total.toFixed(2);
    }
  };

  // El comprobante no existe en el HTML: se crea al confirmar y no forma parte de IDS
  // (iniciar() exige que todos los IDS estén presentes desde el principio).
  var ID_COMPROBANTE = "comprobante-venta";

  var ticket = [];
  var iniciado = false;
  var enviando = false;
  var textoBotonConfirmar = "";

  // ---------- Helpers ----------

  function obtener(id) {
    return document.getElementById(id);
  }

  function buscarRegistro(coleccion, id) {
    var i;
    for (i = 0; i < coleccion.length; i += 1) {
      if (coleccion[i].id === id) {
        return coleccion[i];
      }
    }
    return null;
  }

  function crearCelda(texto) {
    var celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  function formatearFecha(iso) {
    var fecha = new Date(iso);
    return isNaN(fecha.getTime()) ? String(iso) : fecha.toLocaleString("es-AR");
  }

  // ---------- Lógica pura ----------

  /**
   * Comprueba que el texto sea un entero mayor que cero (sin signo ni decimales).
   * @returns {{ok: boolean, valor: number}} valor es 0 si no es válido.
   */
  function validarCantidad(texto) {
    var limpio = String(texto === null || texto === undefined ? "" : texto).trim();

    if (!/^\d+$/.test(limpio) || Number(limpio) <= 0) {
      return { ok: false, valor: 0 };
    }
    return { ok: true, valor: Number(limpio) };
  }

  /** Redondea a centavos para evitar errores de coma flotante. */
  function redondear(numero) {
    return Math.round((numero + Number.EPSILON) * 100) / 100;
  }

  function calcularSubtotal(cantidad, precioUnitario) {
    return redondear(cantidad * precioUnitario);
  }

  function calcularTotal(renglones) {
    var suma = renglones.reduce(function (acumulado, renglon) {
      return acumulado + calcularSubtotal(renglon.cantidad, renglon.precioUnitario);
    }, 0);
    return redondear(suma);
  }

  /**
   * Agrega un renglón a la lista recibida (la modifica) copiando el precio del libro.
   * @returns {string} "" si se agregó; "duplicado" o "cantidad" si se rechazó.
   */
  function agregarRenglon(renglones, libro, cantidad) {
    if (!validarCantidad(cantidad).ok) {
      return "cantidad";
    }
    if (renglones.some(function (renglon) { return renglon.libroId === libro.id; })) {
      return "duplicado";
    }

    renglones.push({
      libroId: libro.id,
      titulo: libro.titulo,
      cantidad: validarCantidad(cantidad).valor,
      precioUnitario: libro.precio
    });
    return "";
  }

  /**
   * Cuerpo exacto de POST /ventas/: solo identificadores numéricos y cantidades.
   * Nunca viaja precio, total ni fecha: el servidor los toma del catálogo y los calcula.
   */
  function construirCuerpo(clienteId, renglones) {
    return {
      cliente_id: Number(clienteId),
      renglones: renglones.map(function (renglon) {
        return { libro_id: Number(renglon.libroId), cantidad: renglon.cantidad };
      })
    };
  }

  // ---------- Mensajes ----------

  function mostrarMensaje(texto, esError) {
    var mensaje = obtener(IDS.mensaje);
    mensaje.textContent = texto;
    mensaje.classList.toggle("mensaje--error", esError);
    mensaje.classList.toggle("mensaje--exito", !esError);
  }

  // ---------- Tabla de renglones ----------

  /** El HTML de M01 no trae columna de acciones: se agrega una sola vez desde acá. */
  function asegurarColumnaAcciones() {
    var fila = document.querySelector("#" + IDS.contenedorTabla + " thead tr");

    if (fila === null || fila.querySelector("[data-columna='acciones']") !== null) {
      return;
    }

    var encabezado = document.createElement("th");
    encabezado.scope = "col";
    encabezado.textContent = TEXTOS.accionesTitulo;
    encabezado.setAttribute("data-columna", "acciones");
    fila.appendChild(encabezado);
  }

  function crearCeldaCantidad(renglon) {
    var celda = document.createElement("td");
    var entrada = document.createElement("input");

    entrada.type = "number";
    entrada.min = "1";
    entrada.step = "1";
    entrada.value = String(renglon.cantidad);
    entrada.setAttribute("inputmode", "numeric");
    entrada.setAttribute("aria-label", "Cantidad de " + renglon.titulo);
    entrada.disabled = enviando;
    entrada.addEventListener("change", function () {
      alCambiarCantidad(renglon, entrada.value);
    });

    celda.appendChild(entrada);
    return celda;
  }

  function crearCeldaQuitar(renglon) {
    var celda = document.createElement("td");
    var boton = document.createElement("button");

    boton.type = "button";
    boton.className = "boton";
    boton.textContent = TEXTOS.quitar;
    boton.setAttribute("aria-label", TEXTOS.quitar + " " + renglon.titulo + " del ticket");
    boton.disabled = enviando;
    boton.addEventListener("click", function () {
      alQuitar(renglon);
    });

    celda.appendChild(boton);
    return celda;
  }

  function crearFila(renglon) {
    var fila = document.createElement("tr");

    fila.appendChild(crearCelda(renglon.titulo));
    fila.appendChild(crearCelda(renglon.precioUnitario.toFixed(2)));
    fila.appendChild(crearCeldaCantidad(renglon));
    fila.appendChild(crearCelda(calcularSubtotal(renglon.cantidad, renglon.precioUnitario).toFixed(2)));
    fila.appendChild(crearCeldaQuitar(renglon));
    return fila;
  }

  /** Redibuja la tabla de renglones y el total del ticket. */
  function render() {
    var cuerpo = obtener(IDS.cuerpo);
    var fragmento = document.createDocumentFragment();

    asegurarColumnaAcciones();

    ticket.forEach(function (renglon) {
      fragmento.appendChild(crearFila(renglon));
    });

    cuerpo.textContent = "";
    cuerpo.appendChild(fragmento);
    obtener(IDS.vacio).textContent = ticket.length === 0 ? TEXTOS.renglonesVacio : "";
    obtener(IDS.total).textContent = calcularTotal(ticket).toFixed(2);
  }

  // ---------- Acciones del ticket ----------

  function alAgregar() {
    if (enviando) {
      return;
    }

    var libro = buscarRegistro(Datos.libros, obtener(IDS.libro).value);
    var campoCantidad = obtener(IDS.cantidad);

    if (obtener(IDS.libro).value === "") {
      mostrarMensaje(TEXTOS.sinLibro, true);
      return;
    }
    if (libro === null) {
      mostrarMensaje(TEXTOS.libroInexistente, true);
      return;
    }

    var resultado = agregarRenglon(ticket, libro, campoCantidad.value);

    if (resultado === "cantidad") {
      campoCantidad.setAttribute("aria-invalid", "true");
      mostrarMensaje(TEXTOS.cantidadInvalida, true);
      return;
    }
    if (resultado === "duplicado") {
      mostrarMensaje(TEXTOS.duplicado(libro.titulo), true);
      return;
    }

    campoCantidad.removeAttribute("aria-invalid");
    campoCantidad.value = "";
    quitarComprobante(); // empezó una venta nueva: el comprobante anterior ya no corresponde
    render();
    mostrarMensaje(TEXTOS.agregado(libro.titulo), false);
  }

  function alCambiarCantidad(renglon, texto) {
    if (enviando) {
      return;
    }

    var resultado = validarCantidad(texto);

    if (!resultado.ok) {
      mostrarMensaje(TEXTOS.cantidadInvalida, true);
    } else {
      renglon.cantidad = resultado.valor;
      mostrarMensaje(TEXTOS.cantidadActualizada(renglon.titulo), false);
    }
    render();
  }

  function alQuitar(renglon) {
    if (enviando) {
      return;
    }

    ticket = ticket.filter(function (existente) {
      return existente !== renglon;
    });
    render();
    mostrarMensaje(TEXTOS.quitado(renglon.titulo), false);
  }

  // ---------- Confirmación ----------

  /** Devuelve los motivos por los que el ticket no puede confirmarse; vacío si puede. */
  function revisarVenta(cliente) {
    var problemas = [];

    if (cliente === null) {
      problemas.push(TEXTOS.sinCliente);
    }
    if (ticket.length === 0) {
      problemas.push(TEXTOS.sinRenglones);
    } else if (!ticket.every(function (renglon) { return validarCantidad(String(renglon.cantidad)).ok; })) {
      problemas.push(TEXTOS.cantidadInvalida);
    }
    return problemas;
  }

  // ---------- Comprobante (importes del servidor) ----------

  function quitarComprobante() {
    var anterior = obtener(ID_COMPROBANTE);
    if (anterior !== null && anterior.parentNode !== null) {
      anterior.parentNode.removeChild(anterior);
    }
  }

  function crearElemento(etiqueta, texto) {
    var elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    return elemento;
  }

  function crearTablaComprobante(venta) {
    var contenedor = document.createElement("div");
    var tabla = document.createElement("table");
    var cabecera = document.createElement("thead");
    var filaCabecera = document.createElement("tr");
    var cuerpo = document.createElement("tbody");

    contenedor.className = "tabla-scroll";
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
      fila.appendChild(crearElemento("td", renglon.precioUnitario.toFixed(2)));
      fila.appendChild(crearElemento("td", renglon.subtotal.toFixed(2)));
      cuerpo.appendChild(fila);
    });

    tabla.appendChild(cabecera);
    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
    return contenedor;
  }

  /**
   * Muestra debajo del mensaje la venta tal como la registró el servidor. Todos los
   * importes salen de la respuesta, nunca de la estimación local del ticket.
   */
  function mostrarComprobante(venta) {
    var mensaje = obtener(IDS.mensaje);
    var bloque = document.createElement("div");

    quitarComprobante();
    bloque.id = ID_COMPROBANTE;
    bloque.appendChild(crearElemento("h4", TEXTOS.comprobanteTitulo(venta.id)));
    bloque.appendChild(crearElemento("p", TEXTOS.comprobanteDatos(formatearFecha(venta.fecha), venta.clienteNombre)));
    bloque.appendChild(crearTablaComprobante(venta));
    bloque.appendChild(crearElemento("p", TEXTOS.comprobanteTotal(venta.total)));
    mensaje.parentNode.insertBefore(bloque, mensaje.nextSibling);
  }

  // ---------- Envío ----------

  /** Bloquea el ticket mientras viaja la venta: ni doble clic ni cambios a mitad de camino. */
  function bloquear(estado) {
    var confirmar = obtener(IDS.confirmar);

    enviando = estado;
    confirmar.disabled = estado;
    confirmar.textContent = estado ? TEXTOS.botonEnviando : textoBotonConfirmar;
    confirmar.setAttribute("aria-busy", estado ? "true" : "false");
    obtener(IDS.agregar).disabled = estado;
    render();
  }

  function registrarExito(datos) {
    var venta = API.normalizar.venta(datos);

    Datos.ventas.unshift(venta);
    limpiarFormulario();
    mostrarComprobante(venta);
    mostrarMensaje(TEXTOS.exito(venta.id, venta.total), false);
    // Historial escucha este aviso y vuelve a pedir GET /ventas/ al servidor.
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "ventas" } }));
  }

  function limpiarFormulario() {
    ticket = [];
    obtener(IDS.cliente).value = "";
    obtener(IDS.libro).value = "";
    obtener(IDS.cantidad).value = "";
    obtener(IDS.cantidad).removeAttribute("aria-invalid");
    render();
  }

  /**
   * Envía la venta. Ante cualquier rechazo (409, 422, sin conexión) el ticket no se toca:
   * el usuario corrige el borrador y vuelve a confirmar.
   */
  async function alConfirmar() {
    if (enviando) {
      return;
    }

    var cliente = obtener(IDS.cliente).value === "" ? null : buscarRegistro(Datos.clientes, obtener(IDS.cliente).value);
    var problemas = revisarVenta(cliente);
    var resultado;

    if (problemas.length > 0) {
      mostrarMensaje(TEXTOS.rechazo + problemas.join(" "), true);
      return;
    }
    if (typeof API === "undefined") {
      mostrarMensaje(TEXTOS.rechazo + TEXTOS.sinApi, true);
      return;
    }

    bloquear(true);
    mostrarMensaje(TEXTOS.enviando, false);
    try {
      resultado = await API.post("/ventas/", construirCuerpo(cliente.id, ticket));
    } finally {
      bloquear(false);
    }

    if (!resultado.ok) {
      mostrarMensaje(TEXTOS.rechazo + resultado.mensaje, true);
      return;
    }
    registrarExito(resultado.data);
  }

  // ---------- Inicio ----------

  function hayElementos() {
    return Object.keys(IDS).every(function (clave) {
      return obtener(IDS[clave]) !== null;
    });
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || !hayElementos()) {
      console.error("Ventas: faltan los datos o los elementos de la vista Ventas.");
      return;
    }
    if (!Array.isArray(Datos.ventas)) {
      Datos.ventas = [];
    }

    textoBotonConfirmar = obtener(IDS.confirmar).textContent.trim();
    render();
    obtener(IDS.agregar).addEventListener("click", alAgregar);
    obtener(IDS.confirmar).addEventListener("click", alConfirmar);
  }

  return {
    validarCantidad: validarCantidad,
    redondear: redondear,
    calcularSubtotal: calcularSubtotal,
    calcularTotal: calcularTotal,
    agregarRenglon: agregarRenglon,
    construirCuerpo: construirCuerpo,
    render: render,
    iniciar: iniciar
  };
})();

Ventas.iniciar();
