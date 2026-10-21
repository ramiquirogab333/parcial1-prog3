/**
 * M03 — Catálogo de la librería.
 *
 * Renderiza la tabla de catálogo a partir de Datos.libros, filtra en vivo desde el
 * buscador y alterna los estados «catálogo vacío», «búsqueda sin resultados» y error.
 * Inserta datos sólo con textContent sobre nodos creados con document.createElement.
 *
 * Namespace público: Catalogo.render() (ver design.md de m03-modelo-datos-catalogo).
 */

var Catalogo = (function () {
  "use strict";

  var IDS = {
    buscador: "buscador-catalogo",
    cuerpo: "cuerpo-tabla-catalogo",
    vacio: "mensaje-catalogo-vacio",
    sinResultados: "mensaje-catalogo-sin-resultados",
    error: "mensaje-catalogo-error"
  };

  var TEXTOS = {
    vacio: "Todavía no hay libros cargados en el catálogo.",
    sinResultados: "No se encontraron libros cuyo título coincida con la búsqueda.",
    error: "No se pudo cargar el catálogo. Recargá la página o revisá los datos guardados.",
    sinGenero: "Sin clasificar"
  };

  var iniciado = false;

  function obtener(id) {
    return document.getElementById(id);
  }

  function exigir(condicion, mensaje) {
    if (!condicion) {
      throw new Error("Catálogo: " + mensaje);
    }
  }

  function validarColeccion(coleccion, nombre) {
    exigir(Array.isArray(coleccion), "la colección «" + nombre + "» no es un array.");

    var vistos = {};
    coleccion.forEach(function (registro) {
      exigir(registro !== null && typeof registro === "object", "hay un registro inválido en «" + nombre + "».");
      exigir(typeof registro.id === "string" && registro.id !== "", "hay un registro sin id en «" + nombre + "».");
      exigir(!vistos[registro.id], "el id «" + registro.id + "» está duplicado en «" + nombre + "».");
      vistos[registro.id] = true;
    });
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

  function validarDatos() {
    exigir(typeof Datos !== "undefined" && Datos !== null, "no están disponibles los datos de la librería.");

    validarColeccion(Datos.editoriales, "editoriales");
    validarColeccion(Datos.generos, "generos");
    validarColeccion(Datos.autores, "autores");
    validarColeccion(Datos.libros, "libros");
    validarColeccion(Datos.clientes, "clientes");

    Datos.libros.forEach(function (libro) {
      var referencia = "el libro «" + libro.id + "»";

      exigir(typeof libro.titulo === "string" && libro.titulo.trim() !== "", referencia + " no tiene título.");
      exigir(typeof libro.isbn === "string" && libro.isbn.trim() !== "", referencia + " no tiene ISBN.");
      exigir(typeof libro.precio === "number" && isFinite(libro.precio) && libro.precio > 0, referencia + " tiene un precio inválido.");
      exigir(buscarRegistro(Datos.editoriales, libro.editorialId) !== null, referencia + " referencia una editorial inexistente.");
      exigir(libro.generoId === null || buscarRegistro(Datos.generos, libro.generoId) !== null, referencia + " referencia un género inexistente.");
      exigir(Array.isArray(libro.autorIds) && libro.autorIds.length > 0, referencia + " no tiene autores.");

      libro.autorIds.forEach(function (autorId) {
        exigir(buscarRegistro(Datos.autores, autorId) !== null, referencia + " referencia un autor inexistente.");
      });
    });
  }

  function crearCelda(texto) {
    var celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  function nombresDeAutores(libro) {
    var nombres = libro.autorIds.map(function (autorId) {
      return buscarRegistro(Datos.autores, autorId).nombre;
    });
    return nombres.join(", ");
  }

  function crearFila(libro) {
    var fila = document.createElement("tr");
    var editorial = buscarRegistro(Datos.editoriales, libro.editorialId);
    var genero = libro.generoId === null ? TEXTOS.sinGenero : buscarRegistro(Datos.generos, libro.generoId).nombre;

    fila.appendChild(crearCelda(libro.titulo));
    fila.appendChild(crearCelda(nombresDeAutores(libro)));
    fila.appendChild(crearCelda(editorial.nombre));
    fila.appendChild(crearCelda(genero));
    fila.appendChild(crearCelda(libro.precio.toFixed(2)));
    return fila;
  }

  function limpiarMensajes(contenedores) {
    contenedores.vacio.textContent = "";
    contenedores.sinResultados.textContent = "";
    contenedores.error.textContent = "";
  }

  function render() {
    var cuerpo = obtener(IDS.cuerpo);
    var vacio = obtener(IDS.vacio);
    var sinResultados = obtener(IDS.sinResultados);
    var error = obtener(IDS.error);
    var buscador = obtener(IDS.buscador);
    var contenedores = { vacio: vacio, sinResultados: sinResultados, error: error };

    try {
      exigir(cuerpo !== null, "falta el contenedor de la tabla de catálogo.");
      exigir(vacio !== null && sinResultados !== null && error !== null, "faltan los contenedores de mensajes del catálogo.");
      exigir(buscador !== null, "falta el buscador del catálogo.");

      validarDatos();

      var libros = Datos.buscarLibrosPorTitulo(buscador.value);
      var fragmento = document.createDocumentFragment();

      libros.forEach(function (libro) {
        fragmento.appendChild(crearFila(libro));
      });

      cuerpo.textContent = "";
      cuerpo.appendChild(fragmento);
      limpiarMensajes(contenedores);

      if (Datos.libros.length === 0) {
        vacio.textContent = TEXTOS.vacio;
      } else if (libros.length === 0) {
        sinResultados.textContent = TEXTOS.sinResultados;
      }
    } catch (excepcion) {
      console.error("Catálogo: no se pudo renderizar la tabla.", excepcion);

      if (cuerpo !== null) {
        cuerpo.textContent = "";
      }
      if (vacio !== null && sinResultados !== null && error !== null) {
        limpiarMensajes(contenedores);
        error.textContent = TEXTOS.error;
      }
    }
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    var buscador = obtener(IDS.buscador);
    if (buscador !== null) {
      buscador.addEventListener("input", render);
    }

    render();
  }

  return {
    render: render,
    iniciar: iniciar
  };
})();

Catalogo.iniciar();
