/**
 * M06 — Persistencia en localStorage.
 *
 * Conserva los libros, los clientes y las ventas en el almacenamiento local del navegador.
 * En el primer inicio siembra los ejemplos y los guarda; al volver a abrir recupera lo
 * guardado sin volver a sembrar, de modo que los datos iniciales no se duplican.
 *
 * Las tres colecciones viven en una clave cada una, con un array JSON de objetos planos:
 *
 *   libreria.libros    → [{ id, titulo, isbn, precio, editorialId, generoId, autorIds }]
 *   libreria.clientes  → [{ id, nombre, email }]
 *   libreria.ventas    → [{ id, fecha, clienteId, clienteNombre, renglones, total }]
 *
 * Las editoriales, los géneros y los autores no se guardan: ninguna vista los modifica.
 * Ningún dato sale del navegador: no hay red, ni servidor, ni envío de información.
 *
 * Namespace público: Almacenamiento.cargar(), Almacenamiento.guardar(),
 * Almacenamiento.restablecer(), Almacenamiento.claves()
 * (ver design.md de m06-persistencia-y-pruebas).
 */

var Almacenamiento = (function () {
  "use strict";

  var CLAVES = {
    libros: "libreria.libros",
    clientes: "libreria.clientes",
    ventas: "libreria.ventas"
  };

  var IDS = {
    errorCatalogo: "mensaje-catalogo-error",
    errorHistorial: "mensaje-historial-error"
  };

  var TEXTOS = {
    errorLecturaCatalogo: function (motivo) {
      return "No se pudieron leer los libros o los clientes guardados (" + motivo + "). Se restauraron los datos de ejemplo.";
    },
    errorLecturaHistorial: function (motivo) {
      return "No se pudieron leer las ventas guardadas (" + motivo + "). Se restauraron los datos de ejemplo.";
    },
    errorAlmacenIndisponible:
      "El almacenamiento local no está disponible en este navegador: los datos no se van a guardar al recargar la página.",
    errorEscritura:
      "No se pudieron guardar los datos: el almacenamiento local del navegador está lleno o bloqueado. Los cambios siguen visibles en esta sesión."
  };

  var SEMILLAS = null;
  var iniciado = false;

  // ---------- Helpers ----------

  function obtener(id) {
    return document.getElementById(id);
  }

  /**
   * Devuelve el objeto localStorage o null si el navegador no permite usarlo.
   * El acceso puede lanzar una excepción (navegación privada, cookies bloqueadas),
   * por eso va envuelto en try/catch.
   */
  function almacen() {
    try {
      return window.localStorage;
    } catch (excepcion) {
      return null;
    }
  }

  /**
   * Lee una clave y devuelve el valor ya parseado.
   * @returns {{ok: boolean, existe: boolean, valor: *, motivo: string}}
   *   existe dice si la clave está presente; ok dice si su contenido se pudo leer.
   */
  function leerJSON(clave) {
    var store = almacen();

    if (store === null) {
      return { ok: false, existe: false, valor: null, motivo: "el almacenamiento local no está disponible" };
    }

    var bruto;
    try {
      bruto = store.getItem(clave);
    } catch (excepcion) {
      return { ok: false, existe: false, valor: null, motivo: "no se pudo leer el almacenamiento local" };
    }

    if (bruto === null || bruto === undefined) {
      return { ok: false, existe: false, valor: null, motivo: "la clave todavía no existe" };
    }

    try {
      return { ok: true, existe: true, valor: JSON.parse(bruto), motivo: "" };
    } catch (excepcion) {
      return { ok: false, existe: true, valor: null, motivo: "el contenido guardado no es un JSON válido" };
    }
  }

  /** Escribe una clave. @returns {boolean} true si se pudo escribir. */
  function escribir(clave, valor) {
    var store = almacen();

    if (store === null) {
      return false;
    }

    try {
      store.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (excepcion) {
      return false;
    }
  }

  /** Borra una clave. No lanza si el almacenamiento no está disponible. */
  function borrar(clave) {
    var store = almacen();

    if (store === null) {
      return;
    }

    try {
      store.removeItem(clave);
    } catch (excepcion) {
      console.error("Almacenamiento: no se pudo borrar la clave " + clave + ".", excepcion);
    }
  }

  // ---------- Validación de lo recuperado ----------

  function esTexto(valor) {
    return typeof valor === "string";
  }

  function esTextoNoVacio(valor) {
    return typeof valor === "string" && valor.trim() !== "";
  }

  function esNumeroFinito(valor) {
    return typeof valor === "number" && isFinite(valor);
  }

  function esNumeroPositivo(valor) {
    return esNumeroFinito(valor) && valor > 0;
  }

  function esLibroValido(libro) {
    if (libro === null || typeof libro !== "object") {
      return false;
    }
    if (!esTextoNoVacio(libro.id)) {
      return false;
    }
    if (!esTexto(libro.titulo) || !esTexto(libro.isbn)) {
      return false;
    }
    if (!esNumeroPositivo(libro.precio)) {
      return false;
    }
    if (!esTextoNoVacio(libro.editorialId)) {
      return false;
    }
    if (!Array.isArray(libro.autorIds) || libro.autorIds.length === 0) {
      return false;
    }
    if (libro.generoId !== null && libro.generoId !== undefined && !esTextoNoVacio(libro.generoId)) {
      return false;
    }
    return true;
  }

  function esClienteValido(cliente) {
    if (cliente === null || typeof cliente !== "object") {
      return false;
    }
    if (!esTextoNoVacio(cliente.id)) {
      return false;
    }
    if (!esTextoNoVacio(cliente.nombre) || !esTextoNoVacio(cliente.email)) {
      return false;
    }
    return true;
  }

  function esRenglonValido(renglon) {
    if (renglon === null || typeof renglon !== "object") {
      return false;
    }
    if (!esTextoNoVacio(renglon.libroId) || !esTexto(renglon.titulo)) {
      return false;
    }
    if (!esNumeroFinito(renglon.cantidad) || !esNumeroFinito(renglon.precioUnitario) || !esNumeroFinito(renglon.subtotal)) {
      return false;
    }
    return true;
  }

  function esVentaValida(venta) {
    if (venta === null || typeof venta !== "object") {
      return false;
    }
    if (!esTextoNoVacio(venta.id) || !esTexto(venta.fecha)) {
      return false;
    }
    if (!esTextoNoVacio(venta.clienteId) || !esTexto(venta.clienteNombre)) {
      return false;
    }
    if (!Array.isArray(venta.renglones) || !esNumeroFinito(venta.total)) {
      return false;
    }
    return venta.renglones.every(esRenglonValido);
  }

  // ---------- Normalización ----------

  /**
   * Convierte a número el precio de un libro que llegó guardado como texto.
   * Así una edición manual del catálogo guardado con comillas no rompe el catálogo.
   */
  function normalizarLibros(libros) {
    return libros.map(function (libro) {
      if (libro !== null && typeof libro === "object" && typeof libro.precio === "string" && libro.precio.trim() !== "") {
        var numero = Number(libro.precio);

        if (isFinite(numero)) {
          return Object.assign({}, libro, { precio: numero });
        }
      }
      return libro;
    });
  }

  function sinNormalizar(valores) {
    return valores;
  }

  // ---------- Datos ----------

  /** Garantiza que Datos.ventas exista como array (data.js no lo declara). */
  function ventasVivas() {
    if (!Array.isArray(Datos.ventas)) {
      Datos.ventas = [];
    }
    return Datos.ventas;
  }

  /** Copia profunda: la semilla no se ve alterada por altas posteriores. */
  function copiarProfundo(valores) {
    return JSON.parse(JSON.stringify(valores));
  }

  /** Copia las semillas originales una sola vez, antes de que haya cambios en pantalla. */
  function capturarSemillas() {
    if (SEMILLAS !== null) {
      return;
    }

    SEMILLAS = {
      libros: copiarProfundo(Datos.libros),
      clientes: copiarProfundo(Datos.clientes),
      ventas: []
    };
  }

  /**
   * Vuelca los valores sobre el array vivo de Datos, sin reasignar la referencia.
   * Trabaja sobre una copia: destino y valores pueden ser el mismo array.
   */
  function restaurar(destino, valores) {
    var copia = copiarProfundo(valores);

    destino.length = 0;
    copia.forEach(function (valor) {
      destino.push(valor);
    });
  }

  /**
   * Carga una colección: siembra si la clave no existe, restaura si es válida,
   * y descarta la colección corrupta para volver a la semilla.
   * @returns {string} "" si todo bien; si no, el motivo del problema.
   */
  function cargarColeccion(nombre, destino, semilla, esValido, normalizar) {
    var lectura = leerJSON(CLAVES[nombre]);

    if (!lectura.existe) {
      escribir(CLAVES[nombre], semilla);
      restaurar(destino, semilla);
      return "";
    }

    if (!lectura.ok) {
      escribir(CLAVES[nombre], semilla);
      restaurar(destino, semilla);
      return lectura.motivo;
    }

    if (!Array.isArray(lectura.valor)) {
      escribir(CLAVES[nombre], semilla);
      restaurar(destino, semilla);
      return "el contenido guardado no es una lista";
    }

    var normalizados = normalizar(lectura.valor);

    if (!normalizados.every(esValido)) {
      escribir(CLAVES[nombre], semilla);
      restaurar(destino, semilla);
      return "algún registro guardado está incompleto o es inválido";
    }

    restaurar(destino, normalizados);
    return "";
  }

  // ---------- Mensajes ----------

  function mostrarMensaje(id, texto, esError) {
    var elemento = obtener(id);

    if (elemento === null) {
      return;
    }

    elemento.textContent = texto;
    elemento.classList.toggle("mensaje--error", esError);
    elemento.classList.toggle("mensaje--exito", !esError);
  }

  // ---------- Redibujado ----------

  /** Vuelve a dibujar las cinco vistas con los datos ya restaurados. */
  function redibujar() {
    if (typeof Catalogo !== "undefined") {
      Catalogo.render();
    }
    if (typeof Libros !== "undefined") {
      Libros.render();
    }
    if (typeof Clientes !== "undefined") {
      Clientes.render();
    }
    if (typeof Historial !== "undefined") {
      Historial.render();
    }
    if (typeof Ventas !== "undefined") {
      Ventas.render();
    }
  }

  // ---------- API ----------

  /**
   * Recupera los datos guardados, siembra los ejemplos si todavía no hay nada
   * guardado y redibuja las vistas.
   * @returns {boolean} true si las tres colecciones quedaron en un estado válido.
   */
  function cargar() {
    if (typeof Datos === "undefined" || Datos === null) {
      console.error("Almacenamiento: no están disponibles los datos de la librería.");
      return false;
    }

    capturarSemillas();

    var ventas = ventasVivas();
    var problemaLibros = cargarColeccion("libros", Datos.libros, SEMILLAS.libros, esLibroValido, normalizarLibros);
    var problemaClientes = cargarColeccion("clientes", Datos.clientes, SEMILLAS.clientes, esClienteValido, sinNormalizar);
    var problemaVentas = cargarColeccion("ventas", ventas, SEMILLAS.ventas, esVentaValida, sinNormalizar);

    redibujar();

    // Los mensajes van después del redibujado: Catalogo.render() vacía
    // #mensaje-catalogo-error en cada pasada.
    if (almacen() === null) {
      mostrarMensaje(IDS.errorCatalogo, TEXTOS.errorAlmacenIndisponible, true);
      console.info("Almacenamiento: el navegador no permite usar el almacenamiento local.");
      return false;
    }
    if (problemaLibros !== "" || problemaClientes !== "") {
      mostrarMensaje(
        IDS.errorCatalogo,
        TEXTOS.errorLecturaCatalogo(problemaLibros !== "" ? problemaLibros : problemaClientes),
        true
      );
    }
    if (problemaVentas !== "") {
      mostrarMensaje(IDS.errorHistorial, TEXTOS.errorLecturaHistorial(problemaVentas), true);
    }

    console.info(
      "Almacenamiento: datos cargados. libros=" + Datos.libros.length +
      ", clientes=" + Datos.clientes.length +
      ", ventas=" + ventas.length + "."
    );

    return problemaLibros === "" && problemaClientes === "" && problemaVentas === "";
  }

  /**
   * Escribe las tres colecciones en el almacenamiento local.
   * @returns {boolean} true si se pudieron escribir las tres.
   */
  function guardar() {
    if (typeof Datos === "undefined" || Datos === null) {
      return false;
    }

    var ventas = ventasVivas();
    var resultados = [
      escribir(CLAVES.libros, Datos.libros),
      escribir(CLAVES.clientes, Datos.clientes),
      escribir(CLAVES.ventas, ventas)
    ];
    var todoOk = resultados.every(function (resultado) {
      return resultado === true;
    });

    if (!todoOk) {
      mostrarMensaje(
        IDS.errorCatalogo,
        almacen() === null ? TEXTOS.errorAlmacenIndisponible : TEXTOS.errorEscritura,
        true
      );
    }

    return todoOk;
  }

  /**
   * Borra lo guardado y vuelve a sembrar los ejemplos.
   * Sirve para repetir las pruebas desde un estado conocido.
   * @returns {boolean} true si el almacenamiento quedó disponible.
   */
  function restablecer() {
    if (almacen() === null) {
      mostrarMensaje(IDS.errorCatalogo, TEXTOS.errorAlmacenIndisponible, true);
      return false;
    }

    Object.keys(CLAVES).forEach(function (nombre) {
      borrar(CLAVES[nombre]);
    });

    return cargar();
  }

  /** Devuelve una copia de las claves usadas en el almacenamiento local. */
  function claves() {
    return {
      libros: CLAVES.libros,
      clientes: CLAVES.clientes,
      ventas: CLAVES.ventas
    };
  }

  // ---------- Eventos ----------

  /** Se guarda todo cuando cualquier módulo avisa que cambió algo. */
  function alActualizar(evento) {
    var coleccion = evento && evento.detail ? evento.detail.coleccion : "";

    guardar();
    console.info("Almacenamiento: datos guardados (" + (coleccion || "todas las colecciones") + ").");
  }

  // ---------- Inicio ----------

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || Datos === null) {
      console.error("Almacenamiento: no están disponibles los datos de la librería.");
      return;
    }

    cargar();

    document.addEventListener("datos-actualizados", alActualizar);
  }

  return {
    cargar: cargar,
    guardar: guardar,
    restablecer: restablecer,
    claves: claves,
    iniciar: iniciar
  };
})();

Almacenamiento.iniciar();
