/**
 * M05 — Historial de ventas.
 *
 * Dibuja el listado de Datos.ventas (identificador, fecha, cliente y total) y permite
 * mostrar u ocultar el detalle de cada venta. Lee sólo los valores guardados en la venta:
 * nunca consulta el precio, el título ni el nombre actuales de Datos.libros / Datos.clientes.
 * Las ventas no se editan ni se eliminan. Inserta datos sólo con textContent.
 *
 * Namespace público: Historial.render() (ver design.md de m05-venta-simulada-historial).
 */

var Historial = (function () {
  "use strict";

  var IDS = {
    contenedorTabla: "contenedor-tabla-historial",
    cuerpo: "cuerpo-tabla-historial",
    vacio: "mensaje-historial-vacio"
  };

  var TEXTOS = {
    vacio: "Todavía no hay ventas confirmadas.",
    identificador: "Identificador",
    verDetalle: "Ver detalle",
    ocultarDetalle: "Ocultar detalle"
  };

  var COLUMNAS = 5;

  var abiertas = {};
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

    tabla.appendChild(cabecera);
    tabla.appendChild(cuerpo);
    return tabla;
  }

  function crearFilaDetalle(venta) {
    var fila = document.createElement("tr");
    var celda = document.createElement("td");

    celda.colSpan = COLUMNAS;
    celda.appendChild(crearTablaDetalle(venta));
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
      abiertas[venta.id] = !abiertas[venta.id];
      render();
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

  /** Redibuja el historial desde Datos.ventas; M06 lo puede llamar tras recuperar datos guardados. */
  function render() {
    var cuerpo = obtener(IDS.cuerpo);
    var fragmento = document.createDocumentFragment();

    asegurarColumnaIdentificador();

    Datos.ventas.forEach(function (venta) {
      fragmento.appendChild(crearFila(venta));
      if (abiertas[venta.id] === true) {
        fragmento.appendChild(crearFilaDetalle(venta));
      }
    });

    cuerpo.textContent = "";
    cuerpo.appendChild(fragmento);
    obtener(IDS.vacio).textContent = Datos.ventas.length === 0 ? TEXTOS.vacio : "";
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || obtener(IDS.cuerpo) === null || obtener(IDS.vacio) === null) {
      console.error("Historial: faltan los datos o los elementos de la vista Historial.");
      return;
    }
    if (!Array.isArray(Datos.ventas)) {
      Datos.ventas = [];
    }

    render();
  }

  return {
    render: render,
    iniciar: iniciar
  };
})();

Historial.iniciar();
