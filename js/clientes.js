/**
 * M04 — Alta de clientes.
 *
 * Valida cada alta (nombre completo y email con formato válido y único sin
 * distinguir mayúsculas), agrega el cliente a Datos.clientes y actualiza sin
 * recargar el listado de clientes y el selector de clientes de la vista Ventas.
 * Tras cada alta dispara "datos-actualizados" en document.
 * Inserta datos sólo con textContent / new Option, nunca como HTML.
 *
 * Namespace público: Clientes.validar(entrada), Clientes.render()
 * (ver design.md de m04-altas-libros-clientes).
 */

var Clientes = (function () {
  "use strict";

  var IDS = {
    form: "form-cliente",
    nombre: "cliente-nombre",
    email: "cliente-email",
    mensaje: "mensaje-cliente",
    cuerpo: "cuerpo-tabla-clientes",
    vacio: "mensaje-clientes-vacio",
    ventaCliente: "venta-cliente"
  };

  var TEXTOS = {
    elegirCliente: "Seleccione un cliente…",
    vacio: "Todavía no hay clientes registrados.",
    rechazo: "No se pudo dar de alta el cliente: ",
    exito: function (nombre) {
      return "Cliente «" + nombre + "» dado de alta correctamente.";
    }
  };

  var FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var iniciado = false;

  // ---------- Helpers ----------

  function obtener(id) {
    return document.getElementById(id);
  }

  function crearCelda(texto) {
    var celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  /** Devuelve el siguiente id libre del prefijo: cli-04, cli-05, … */
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

  function normalizarEmail(email) {
    return String(email === null || email === undefined ? "" : email).trim().toLowerCase();
  }

  // ---------- Validación (pura) ----------

  /**
   * Revisa una entrada del formulario y devuelve los problemas encontrados,
   * cada uno con el campo afectado y su mensaje. No toca el DOM ni modifica Datos.
   */
  function revisar(entrada) {
    var problemas = [];
    var nombre = String(entrada.nombre || "").trim();
    var email = normalizarEmail(entrada.email);

    if (nombre === "") {
      problemas.push({ campo: IDS.nombre, mensaje: "El nombre completo es obligatorio." });
    }

    if (email === "") {
      problemas.push({ campo: IDS.email, mensaje: "El email es obligatorio." });
    } else if (!FORMATO_EMAIL.test(email)) {
      problemas.push({ campo: IDS.email, mensaje: "El formato del email no es válido (ejemplo: nombre@dominio.com)." });
    } else if (Datos.clientes.some(function (cliente) { return normalizarEmail(cliente.email) === email; })) {
      problemas.push({ campo: IDS.email, mensaje: "Ya existe un cliente con el email " + email + "." });
    }

    return problemas;
  }

  /**
   * Valida una entrada { nombre, email }.
   * @returns {string[]} Mensajes de error; vacío si la entrada es válida.
   */
  function validar(entrada) {
    return revisar(entrada).map(function (problema) {
      return problema.mensaje;
    });
  }

  // ---------- Selector de venta ----------

  function poblarSelectorVenta() {
    var selector = obtener(IDS.ventaCliente);
    if (selector === null) {
      return;
    }

    var elegido = selector.value;
    selector.textContent = "";
    selector.add(new Option(TEXTOS.elegirCliente, ""));

    Datos.clientes.forEach(function (cliente) {
      selector.add(new Option(cliente.nombre + " (" + cliente.email + ")", cliente.id));
    });

    selector.value = elegido;
  }

  // ---------- Listado ----------

  function renderListado() {
    var cuerpo = obtener(IDS.cuerpo);
    var vacio = obtener(IDS.vacio);
    var fragmento = document.createDocumentFragment();

    Datos.clientes.forEach(function (cliente) {
      var fila = document.createElement("tr");
      fila.appendChild(crearCelda(cliente.nombre));
      fila.appendChild(crearCelda(cliente.email));
      fragmento.appendChild(fila);
    });

    cuerpo.textContent = "";
    cuerpo.appendChild(fragmento);
    vacio.textContent = Datos.clientes.length === 0 ? TEXTOS.vacio : "";
  }

  /** Redibuja listado y selector de venta; M06 lo puede llamar tras recuperar datos guardados. */
  function render() {
    renderListado();
    poblarSelectorVenta();
  }

  // ---------- Formulario ----------

  function mostrarMensaje(texto, esError) {
    var mensaje = obtener(IDS.mensaje);
    mensaje.textContent = texto;
    mensaje.classList.toggle("mensaje--error", esError);
    mensaje.classList.toggle("mensaje--exito", !esError);
  }

  function alEnviar(evento) {
    evento.preventDefault();
    obtener(IDS.nombre).removeAttribute("aria-invalid");
    obtener(IDS.email).removeAttribute("aria-invalid");

    var entrada = {
      nombre: obtener(IDS.nombre).value,
      email: obtener(IDS.email).value
    };
    var problemas = revisar(entrada);

    if (problemas.length > 0) {
      problemas.forEach(function (problema) {
        obtener(problema.campo).setAttribute("aria-invalid", "true");
      });
      mostrarMensaje(TEXTOS.rechazo + problemas.map(function (p) { return p.mensaje; }).join(" "), true);
      return;
    }

    var cliente = {
      id: siguienteId(Datos.clientes, "cli"),
      nombre: entrada.nombre.trim(),
      email: entrada.email.trim()
    };

    Datos.clientes.push(cliente);

    evento.currentTarget.reset();
    render();

    mostrarMensaje(TEXTOS.exito(cliente.nombre), false);
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "clientes" } }));
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || obtener(IDS.form) === null) {
      console.error("Clientes: faltan los datos o el formulario de alta de clientes.");
      return;
    }

    render();
    obtener(IDS.form).addEventListener("submit", alEnviar);
  }

  return {
    validar: validar,
    render: render,
    iniciar: iniciar
  };
})();

Clientes.iniciar();
