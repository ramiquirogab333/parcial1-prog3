/**
 * M04 — Alta de clientes (Global · Paso 5: el alta ahora se guarda en la API).
 *
 * Valida localmente cada alta (nombre completo no vacío y email con formato válido y sin
 * espacios), la envía con POST /clientes/ y recién cuando el servidor responde 201 agrega el
 * cliente a Datos.clientes y actualiza sin recargar el listado y el selector de clientes de la
 * vista Ventas. Tras cada alta dispara "datos-actualizados" en document.
 * El email repetido no se revisa acá: lo decide el servidor (409), que es quien tiene todos los
 * clientes, así el mensaje sale del backend y funciona aunque Datos esté desactualizado.
 * Si el servidor rechaza el alta (409 o 422) se muestra su mensaje y se conserva lo que cargó
 * la persona. Inserta datos sólo con textContent / new Option, nunca como HTML.
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
    boton: "btn-alta-cliente",
    mensaje: "mensaje-cliente",
    cuerpo: "cuerpo-tabla-clientes",
    vacio: "mensaje-clientes-vacio",
    ventaCliente: "venta-cliente"
  };

  // Límites de las columnas de la base (nombre VARCHAR(120), email VARCHAR(254)).
  var LARGO_MAXIMO_NOMBRE = 120;
  var LARGO_MAXIMO_EMAIL = 254;

  var TEXTOS = {
    elegirCliente: "Seleccione un cliente…",
    vacio: "Todavía no hay clientes registrados.",
    rechazo: "No se pudo dar de alta el cliente: ",
    enviando: "Enviando el cliente al servidor…",
    respuestaInvalida: "El servidor respondió, pero no se pudo leer el cliente creado. Recargá la página para verlo.",
    exito: function (nombre) {
      return "Cliente «" + nombre + "» dado de alta correctamente.";
    }
  };

  // Mismo patrón que usa el backend en POST /clientes/.
  var FORMATO_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  var iniciado = false;
  var enviando = false;

  // ---------- Helpers ----------

  function obtener(id) {
    return document.getElementById(id);
  }

  function crearCelda(texto) {
    var celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  function aTextoLimpio(valor) {
    return String(valor === null || valor === undefined ? "" : valor).trim();
  }

  // ---------- Validación (pura) ----------

  /**
   * Revisa una entrada del formulario y devuelve los problemas encontrados,
   * cada uno con el campo afectado y su mensaje. No toca el DOM ni modifica Datos.
   * El email repetido no se revisa acá: lo decide el servidor (409).
   */
  function revisar(entrada) {
    var problemas = [];
    var nombre = aTextoLimpio(entrada.nombre);
    var email = aTextoLimpio(entrada.email);

    if (nombre === "") {
      problemas.push({ campo: IDS.nombre, mensaje: "El nombre completo es obligatorio." });
    } else if (nombre.length > LARGO_MAXIMO_NOMBRE) {
      problemas.push({ campo: IDS.nombre, mensaje: "El nombre no puede tener más de " + LARGO_MAXIMO_NOMBRE + " caracteres." });
    }

    if (email === "") {
      problemas.push({ campo: IDS.email, mensaje: "El email es obligatorio." });
    } else if (email.length > LARGO_MAXIMO_EMAIL) {
      problemas.push({ campo: IDS.email, mensaje: "El email no puede tener más de " + LARGO_MAXIMO_EMAIL + " caracteres." });
    } else if (!FORMATO_EMAIL.test(email)) {
      problemas.push({ campo: IDS.email, mensaje: "El formato del email no es válido (ejemplo: nombre@dominio.com)." });
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

  /** Redibuja listado y selector de venta; la API lo llama tras cargar los datos del servidor. */
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

  function limpiarInvalidos() {
    [IDS.nombre, IDS.email].forEach(function (id) {
      obtener(id).removeAttribute("aria-invalid");
    });
  }

  /** Deshabilita el botón mientras se envía, para que un doble clic no cree dos clientes. */
  function marcarEnvio(activo) {
    enviando = activo;
    obtener(IDS.boton).disabled = activo;
  }

  /**
   * Arma el cuerpo exacto de POST /clientes/. El email viaja recortado pero sin pasar a
   * minúsculas: el backend lo compara tal cual contra el UNIQUE de la base. El perfil es
   * opcional y no se envía.
   */
  function armarCuerpo(entrada) {
    return {
      nombre: aTextoLimpio(entrada.nombre),
      email: aTextoLimpio(entrada.email)
    };
  }

  /** Tras el 201: suma el cliente a Datos, limpia el formulario y refresca las vistas que lo muestran. */
  function registrarAlta(form, cliente) {
    Datos.clientes.push(cliente);

    form.reset();
    render();
    if (typeof Ventas !== "undefined" && typeof Ventas.render === "function") {
      Ventas.render();
    }

    mostrarMensaje(TEXTOS.exito(cliente.nombre), false);
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "clientes" } }));
  }

  async function alEnviar(evento) {
    var form = evento.currentTarget;
    evento.preventDefault();

    if (enviando) {
      return;
    }
    limpiarInvalidos();

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

    marcarEnvio(true);
    mostrarMensaje(TEXTOS.enviando, false);

    try {
      var resultado = await API.post("/clientes/", armarCuerpo(entrada));

      if (!resultado.ok) {
        // 409 y 422: el mensaje ya viene legible desde api.js y el formulario queda como estaba.
        mostrarMensaje(TEXTOS.rechazo + resultado.mensaje, true);
        return;
      }
      if (resultado.data === null || typeof resultado.data !== "object") {
        mostrarMensaje(TEXTOS.respuestaInvalida, true);
        return;
      }

      registrarAlta(form, API.normalizar.cliente(resultado.data));
    } finally {
      marcarEnvio(false);
    }
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    // API se carga después de este archivo: se usa recién al enviar el formulario, cuando ya existe.
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
