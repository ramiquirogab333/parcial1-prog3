/**
 * M03 — Catálogo de la librería.
 *
 * Renderiza la tabla de catálogo a partir de la API, filtra por título en vivo desde el
 * buscador y alterna los estados «catálogo vacío», «búsqueda sin resultados» y error.
 * Inserta datos sólo con textContent sobre nodos creados con document.createElement.
 *
 * El listado GET /libros/ no trae autores: por cada libro de la página se pide el detalle
 * GET /libros/{id} en paralelo para completar la columna de autor/es.
 *
 * Namespace público: Catalogo.render(), Catalogo.iniciar() y Catalogo.cargar().
 */

var Catalogo = (function () {
  "use strict";

  var LIMITE = 20;
  var ESPERA_BUSQUEDA = 300;

  var IDS = {
    buscador: "buscador-catalogo",
    cuerpo: "cuerpo-tabla-catalogo",
    vacio: "mensaje-catalogo-vacio",
    sinResultados: "mensaje-catalogo-sin-resultados",
    error: "mensaje-catalogo-error",
    anterior: "btn-catalogo-anterior",
    siguiente: "btn-catalogo-siguiente",
    pagina: "pagina-catalogo"
  };

  var TEXTOS = {
    cargando: "Cargando el catálogo…",
    vacio: "Todavía no hay libros cargados en el catálogo.",
    sinResultados: "No se encontraron libros cuyo título coincida con la búsqueda.",
    error: "No se pudo cargar el catálogo. Revisá tu conexión e intentá de nuevo.",
    sinGenero: "Sin clasificar",
    sinAutores: "—"
  };

  var estado = {
    desplazamiento: 0,
    texto: "",
    cargando: true,
    libros: [],
    error: "",
    numeroPeticion: 0,
    temporizador: null
  };

  var iniciado = false;

  function obtener(id) {
    return document.getElementById(id);
  }

  function crearCelda(texto) {
    var celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  function armarLibro(item, detalle) {
    var normalizado = API.normalizar.libro(detalle || item);
    var editorial = detalle && detalle.editorial ? detalle.editorial : item.editorial;
    var genero = detalle && detalle.genero !== undefined ? detalle.genero : item.genero;
    var autores = normalizado.autores.map(function (autor) {
      return autor.nombre;
    }).join(", ");

    return {
      titulo: normalizado.titulo,
      isbn: normalizado.isbn,
      precio: normalizado.precio,
      editorial: editorial && editorial.nombre ? editorial.nombre : "",
      genero: genero === null || genero === undefined ? TEXTOS.sinGenero : genero.nombre,
      autores: autores === "" ? TEXTOS.sinAutores : autores
    };
  }

  function crearFila(libro) {
    var fila = document.createElement("tr");

    fila.appendChild(crearCelda(libro.titulo));
    fila.appendChild(crearCelda(libro.isbn));
    fila.appendChild(crearCelda(libro.autores));
    fila.appendChild(crearCelda(libro.editorial));
    fila.appendChild(crearCelda(libro.genero));
    fila.appendChild(crearCelda(libro.precio.toFixed(2)));
    return fila;
  }

  function limpiarMensajes(contenedores) {
    contenedores.vacio.textContent = "";
    contenedores.sinResultados.textContent = "";
    contenedores.error.textContent = "";
  }

  function actualizarControles() {
    var anterior = obtener(IDS.anterior);
    var siguiente = obtener(IDS.siguiente);
    var pagina = obtener(IDS.pagina);

    if (anterior !== null) {
      anterior.disabled = estado.cargando || estado.desplazamiento === 0;
    }
    if (siguiente !== null) {
      siguiente.disabled = estado.cargando || estado.libros.length < LIMITE;
    }
    if (pagina !== null) {
      pagina.textContent = "Página " + (Math.floor(estado.desplazamiento / LIMITE) + 1);
    }
  }

  function render() {
    var cuerpo = obtener(IDS.cuerpo);
    var vacio = obtener(IDS.vacio);
    var sinResultados = obtener(IDS.sinResultados);
    var error = obtener(IDS.error);

    if (cuerpo === null || vacio === null || sinResultados === null || error === null) {
      console.error("Catálogo: faltan contenedores del DOM para dibujar la tabla.");
      return;
    }

    var contenedores = { vacio: vacio, sinResultados: sinResultados, error: error };
    var fragmento = document.createDocumentFragment();

    limpiarMensajes(contenedores);
    cuerpo.textContent = "";

    estado.libros.forEach(function (libro) {
      fragmento.appendChild(crearFila(libro));
    });
    cuerpo.appendChild(fragmento);

    if (estado.cargando) {
      vacio.textContent = TEXTOS.cargando;
    } else if (estado.error !== "") {
      error.textContent = estado.error;
    } else if (estado.libros.length === 0) {
      if (estado.texto !== "") {
        sinResultados.textContent = TEXTOS.sinResultados;
      } else {
        vacio.textContent = TEXTOS.vacio;
      }
    }

    actualizarControles();
  }

  async function cargar() {
    var numero = estado.numeroPeticion + 1;
    var resultado;
    var detalles;

    estado.numeroPeticion = numero;
    estado.cargando = true;
    estado.error = "";
    estado.libros = [];
    render();

    resultado = await API.get("/libros/", {
      limit: LIMITE,
      offset: estado.desplazamiento,
      titulo: estado.texto === "" ? undefined : estado.texto
    });

    if (numero !== estado.numeroPeticion) {
      return;
    }

    if (!resultado.ok || !Array.isArray(resultado.data)) {
      estado.cargando = false;
      estado.error = resultado.mensaje || TEXTOS.error;
      render();
      return;
    }

    detalles = await Promise.all(resultado.data.map(function (item) {
      return API.get("/libros/" + item.id).then(function (r) {
        return r.ok ? r.data : null;
      }).catch(function () {
        return null;
      });
    }));

    if (numero !== estado.numeroPeticion) {
      return;
    }

    estado.libros = resultado.data.map(function (item, i) {
      return armarLibro(item, detalles[i]);
    });
    estado.cargando = false;
    render();
  }

  function alBuscar() {
    var buscador = obtener(IDS.buscador);
    var texto;

    if (buscador === null) {
      return;
    }

    texto = buscador.value.trim();
    if (texto === estado.texto) {
      return;
    }

    estado.texto = texto;
    estado.desplazamiento = 0;
    cargar();
  }

  function alTeclear() {
    if (estado.temporizador !== null) {
      clearTimeout(estado.temporizador);
    }
    estado.temporizador = setTimeout(function () {
      estado.temporizador = null;
      alBuscar();
    }, ESPERA_BUSQUEDA);
  }

  function irAnterior() {
    if (estado.cargando || estado.desplazamiento === 0) {
      return;
    }
    estado.desplazamiento = Math.max(0, estado.desplazamiento - LIMITE);
    cargar();
  }

  function irSiguiente() {
    if (estado.cargando || estado.libros.length < LIMITE) {
      return;
    }
    estado.desplazamiento += LIMITE;
    cargar();
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    var buscador = obtener(IDS.buscador);
    var anterior = obtener(IDS.anterior);
    var siguiente = obtener(IDS.siguiente);

    if (buscador !== null) {
      buscador.addEventListener("input", alTeclear);
    }
    if (anterior !== null) {
      anterior.addEventListener("click", irAnterior);
    }
    if (siguiente !== null) {
      siguiente.addEventListener("click", irSiguiente);
    }

    render();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cargar);
    } else {
      cargar();
    }
  }

  return {
    render: render,
    iniciar: iniciar,
    cargar: cargar
  };
})();

Catalogo.iniciar();
