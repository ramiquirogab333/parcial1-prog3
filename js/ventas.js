/**
 * M05 — Venta simulada.
 *
 * Compone el ticket (agregar, cambiar cantidad y quitar renglones), calcula subtotales
 * y total con dos decimales y confirma la venta en Datos.ventas. Cada venta confirmada
 * copia el precio unitario y los datos descriptivos (título, nombre del cliente), de modo
 * que el historial nunca los vuelve a leer del catálogo. Tras confirmar dispara
 * "datos-actualizados" en document con detail.coleccion = "ventas".
 * Inserta datos sólo con textContent / new Option, nunca como HTML.
 *
 * Namespace público: Ventas.validarCantidad, redondear, calcularSubtotal, calcularTotal,
 * agregarRenglon, Ventas.render() (ver design.md de m05-venta-simulada-historial).
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
    exito: function (id, total) {
      return "Venta " + id + " confirmada por $ " + total.toFixed(2) + ".";
    }
  };

  var ticket = [];
  var iniciado = false;

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

  /** Devuelve el siguiente id libre del prefijo: ven-01, ven-02, … */
  function siguienteId(coleccion, prefijo) {
    var patron = new RegExp("^" + prefijo + "-(\\d+)$");
    var mayor = 0;

    coleccion.forEach(function (registro) {
      var coincidencia = patron.exec(registro.id);
      if (coincidencia !== null) {
        mayor = Math.max(mayor, Number(coincidencia[1]));
      }
    });

    var numero = String(mayor + 1);
    return prefijo + "-" + (numero.length < 2 ? "0" + numero : numero);
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
    render();
    mostrarMensaje(TEXTOS.agregado(libro.titulo), false);
  }

  function alCambiarCantidad(renglon, texto) {
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

  function construirVenta(cliente) {
    var renglones = ticket.map(function (renglon) {
      return Object.freeze({
        libroId: renglon.libroId,
        titulo: renglon.titulo,
        cantidad: renglon.cantidad,
        precioUnitario: renglon.precioUnitario,
        subtotal: calcularSubtotal(renglon.cantidad, renglon.precioUnitario)
      });
    });

    return Object.freeze({
      id: siguienteId(Datos.ventas, "ven"),
      fecha: new Date().toISOString(),
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      renglones: Object.freeze(renglones),
      total: calcularTotal(renglones)
    });
  }

  function limpiarFormulario() {
    ticket = [];
    obtener(IDS.cliente).value = "";
    obtener(IDS.libro).value = "";
    obtener(IDS.cantidad).value = "";
    obtener(IDS.cantidad).removeAttribute("aria-invalid");
    render();
  }

  function alConfirmar() {
    var cliente = obtener(IDS.cliente).value === "" ? null : buscarRegistro(Datos.clientes, obtener(IDS.cliente).value);
    var problemas = revisarVenta(cliente);

    if (problemas.length > 0) {
      mostrarMensaje(TEXTOS.rechazo + problemas.join(" "), true);
      return;
    }

    var venta = construirVenta(cliente);
    Datos.ventas.push(venta);

    limpiarFormulario();
    if (typeof Historial !== "undefined") {
      Historial.render();
    }

    mostrarMensaje(TEXTOS.exito(venta.id, venta.total), false);
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "ventas" } }));
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
    render: render,
    iniciar: iniciar
  };
})();

Ventas.iniciar();
