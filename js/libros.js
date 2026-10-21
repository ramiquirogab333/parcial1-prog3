/**
 * M04 — Alta de libros.
 *
 * Puebla los selectores del formulario de libros desde Datos, valida cada alta,
 * agrega el libro a Datos.libros con la forma publicada por M03 y actualiza sin
 * recargar el listado de libros, el catálogo (Catalogo.render) y el selector de
 * libros de la vista Ventas. Tras cada alta dispara "datos-actualizados" en document.
 * Inserta datos sólo con textContent / new Option, nunca como HTML.
 *
 * Namespace público: Libros.validar(entrada), Libros.render()
 * (ver design.md de m04-altas-libros-clientes).
 */

var Libros = (function () {
  "use strict";

  var IDS = {
    form: "form-libro",
    titulo: "libro-titulo",
    isbn: "libro-isbn",
    precio: "libro-precio",
    editorial: "libro-editorial",
    genero: "libro-genero",
    autores: "libro-autores",
    mensaje: "mensaje-libro",
    cuerpo: "cuerpo-tabla-libros",
    vacio: "mensaje-libros-vacio",
    ventaLibro: "venta-libro"
  };

  var TEXTOS = {
    elegirEditorial: "Seleccione una editorial…",
    sinGenero: "Sin clasificar",
    elegirLibro: "Seleccione un libro…",
    vacio: "Todavía no hay libros registrados.",
    rechazo: "No se pudo dar de alta el libro: ",
    exito: function (titulo) {
      return "Libro «" + titulo + "» dado de alta correctamente.";
    }
  };

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

  /** Devuelve el siguiente id libre del prefijo: lib-07, lib-08, … */
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

  function normalizarIsbn(isbn) {
    return String(isbn === null || isbn === undefined ? "" : isbn).replace(/[\s-]/g, "");
  }

  // ---------- Validación (pura) ----------

  /**
   * Revisa una entrada del formulario y devuelve los problemas encontrados,
   * cada uno con el campo afectado y su mensaje. No toca el DOM ni modifica Datos.
   */
  function revisar(entrada) {
    var problemas = [];
    var titulo = String(entrada.titulo || "").trim();
    var isbn = normalizarIsbn(entrada.isbn);
    var textoPrecio = String(entrada.precio === undefined || entrada.precio === null ? "" : entrada.precio).trim();
    var precio = Number(textoPrecio);
    var autorIds = Array.isArray(entrada.autorIds) ? entrada.autorIds : [];

    if (titulo === "") {
      problemas.push({ campo: IDS.titulo, mensaje: "El título es obligatorio." });
    }

    if (isbn === "") {
      problemas.push({ campo: IDS.isbn, mensaje: "El ISBN es obligatorio." });
    } else if (Datos.libros.some(function (libro) { return normalizarIsbn(libro.isbn) === isbn; })) {
      problemas.push({ campo: IDS.isbn, mensaje: "Ya existe un libro con el ISBN " + isbn + "." });
    }

    if (textoPrecio === "" || !isFinite(precio) || precio <= 0) {
      problemas.push({ campo: IDS.precio, mensaje: "El precio debe ser un número mayor que cero." });
    }

    if (buscarRegistro(Datos.editoriales, entrada.editorialId) === null) {
      problemas.push({ campo: IDS.editorial, mensaje: "Seleccioná una editorial existente." });
    }

    if (entrada.generoId !== "" && entrada.generoId !== null && entrada.generoId !== undefined &&
        buscarRegistro(Datos.generos, entrada.generoId) === null) {
      problemas.push({ campo: IDS.genero, mensaje: "El género seleccionado no existe." });
    }

    if (autorIds.length === 0) {
      problemas.push({ campo: IDS.autores, mensaje: "Seleccioná al menos un autor." });
    } else if (!autorIds.every(function (id) { return buscarRegistro(Datos.autores, id) !== null; })) {
      problemas.push({ campo: IDS.autores, mensaje: "Alguno de los autores seleccionados no existe." });
    }

    return problemas;
  }

  /**
   * Valida una entrada { titulo, isbn, precio, editorialId, generoId, autorIds }.
   * @returns {string[]} Mensajes de error; vacío si la entrada es válida.
   */
  function validar(entrada) {
    return revisar(entrada).map(function (problema) {
      return problema.mensaje;
    });
  }

  // ---------- Selectores ----------

  function llenarSelector(selector, registros, opcionInicial, textoDe) {
    selector.textContent = "";

    if (opcionInicial !== null) {
      selector.add(new Option(opcionInicial, ""));
    }

    registros.forEach(function (registro) {
      selector.add(new Option(textoDe(registro), registro.id));
    });
  }

  function nombre(registro) {
    return registro.nombre;
  }

  function poblarSelectoresFormulario() {
    llenarSelector(obtener(IDS.editorial), Datos.editoriales, TEXTOS.elegirEditorial, nombre);
    llenarSelector(obtener(IDS.genero), Datos.generos, TEXTOS.sinGenero, nombre);
    llenarSelector(obtener(IDS.autores), Datos.autores, null, nombre);
  }

  function poblarSelectorVenta() {
    var selector = obtener(IDS.ventaLibro);
    if (selector === null) {
      return;
    }

    var elegido = selector.value;
    llenarSelector(selector, Datos.libros, TEXTOS.elegirLibro, function (libro) {
      return libro.titulo + " — $ " + libro.precio.toFixed(2);
    });
    selector.value = elegido;
  }

  // ---------- Listado ----------

  function crearFila(libro) {
    var fila = document.createElement("tr");
    var editorial = buscarRegistro(Datos.editoriales, libro.editorialId);
    var genero = libro.generoId === null ? null : buscarRegistro(Datos.generos, libro.generoId);
    var autores = libro.autorIds.map(function (id) {
      var autor = buscarRegistro(Datos.autores, id);
      return autor === null ? "?" : autor.nombre;
    });

    fila.appendChild(crearCelda(libro.titulo));
    fila.appendChild(crearCelda(libro.isbn));
    fila.appendChild(crearCelda(editorial === null ? "?" : editorial.nombre));
    fila.appendChild(crearCelda(genero === null ? TEXTOS.sinGenero : genero.nombre));
    fila.appendChild(crearCelda(autores.join(", ")));
    fila.appendChild(crearCelda(libro.precio.toFixed(2)));
    return fila;
  }

  function renderListado() {
    var cuerpo = obtener(IDS.cuerpo);
    var vacio = obtener(IDS.vacio);
    var fragmento = document.createDocumentFragment();

    Datos.libros.forEach(function (libro) {
      fragmento.appendChild(crearFila(libro));
    });

    cuerpo.textContent = "";
    cuerpo.appendChild(fragmento);
    vacio.textContent = Datos.libros.length === 0 ? TEXTOS.vacio : "";
  }

  /** Redibuja listado y selectores; M06 lo puede llamar tras recuperar datos guardados. */
  function render() {
    poblarSelectoresFormulario();
    renderListado();
    poblarSelectorVenta();
  }

  // ---------- Formulario ----------

  function leerFormulario() {
    var autorIds = [];
    var opciones = obtener(IDS.autores).options;
    var i;

    for (i = 0; i < opciones.length; i += 1) {
      if (opciones[i].selected) {
        autorIds.push(opciones[i].value);
      }
    }

    return {
      titulo: obtener(IDS.titulo).value,
      isbn: obtener(IDS.isbn).value,
      precio: obtener(IDS.precio).value,
      editorialId: obtener(IDS.editorial).value,
      generoId: obtener(IDS.genero).value,
      autorIds: autorIds
    };
  }

  function limpiarInvalidos() {
    [IDS.titulo, IDS.isbn, IDS.precio, IDS.editorial, IDS.genero, IDS.autores].forEach(function (id) {
      obtener(id).removeAttribute("aria-invalid");
    });
  }

  function mostrarMensaje(texto, esError) {
    var mensaje = obtener(IDS.mensaje);
    mensaje.textContent = texto;
    mensaje.classList.toggle("mensaje--error", esError);
    mensaje.classList.toggle("mensaje--exito", !esError);
  }

  function alEnviar(evento) {
    evento.preventDefault();
    limpiarInvalidos();

    var entrada = leerFormulario();
    var problemas = revisar(entrada);

    if (problemas.length > 0) {
      problemas.forEach(function (problema) {
        obtener(problema.campo).setAttribute("aria-invalid", "true");
      });
      mostrarMensaje(TEXTOS.rechazo + problemas.map(function (p) { return p.mensaje; }).join(" "), true);
      return;
    }

    var libro = {
      id: siguienteId(Datos.libros, "lib"),
      titulo: entrada.titulo.trim(),
      isbn: normalizarIsbn(entrada.isbn),
      precio: Number(entrada.precio),
      editorialId: entrada.editorialId,
      generoId: entrada.generoId === "" ? null : entrada.generoId,
      autorIds: entrada.autorIds
    };

    Datos.libros.push(libro);

    evento.currentTarget.reset();
    renderListado();
    poblarSelectorVenta();
    if (typeof Catalogo !== "undefined") {
      Catalogo.render();
    }

    mostrarMensaje(TEXTOS.exito(libro.titulo), false);
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "libros" } }));
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || obtener(IDS.form) === null) {
      console.error("Libros: faltan los datos o el formulario de alta de libros.");
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

Libros.iniciar();
