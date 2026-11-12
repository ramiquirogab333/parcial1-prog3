/**
 * Global · Paso 1 — Cliente HTTP de la librería.
 *
 * Único punto de contacto con la API (FastAPI + PostgreSQL). Centraliza la URL base y las
 * peticiones con fetch, traduce las respuestas al modelo que ya usan los módulos y, al
 * iniciar, carga todas las colecciones en Datos y redibuja las vistas.
 *
 * La base es "/api": nginx recibe esa ruta en el mismo origen y la reenvía al backend sin
 * el prefijo, así que no hay CORS ni direcciones internas en el navegador. Las rutas se
 * escriben exactamente como en el backend, con su barra final cuando la tienen ("/libros/").
 *
 * La API usa IDs numéricos y decimales como texto ("25000.00"). Los módulos del front
 * trabajan con IDs de texto y precios numéricos: los normalizadores hacen esa traducción
 * en un solo lugar. Al enviar datos, cada módulo convierte los IDs con Number().
 *
 * Namespace público: API.get(), API.post(), API.construirUrl(), API.normalizar,
 * API.cargarTodo(), API.iniciar() y API.listo (promesa de la primera carga).
 */

var API = (function () {
  "use strict";

  var BASE = "/api";

  // El backend acepta limit entre 1 y 100; las ventas se listan de a 20 (el detalle es del Paso 3).
  var LIMITE_MAXIMO = 100;
  var LIMITE_VENTAS = 20;

  var IDS = {
    catalogoVacio: "mensaje-catalogo-vacio",
    catalogoError: "mensaje-catalogo-error",
    historialError: "mensaje-historial-error"
  };

  var TEXTOS = {
    cargando: "Cargando los datos de la librería…",
    sinConexion: "No se pudo conectar con el servidor. Revisá tu conexión y recargá la página.",
    respuestaIlegible: "El servidor devolvió una respuesta que no se pudo leer.",
    errorHttp: function (status) {
      return "El servidor respondió con un error (" + status + ").";
    },
    errorCarga: function (mensaje) {
      return "No se pudieron cargar los datos de la librería. " + mensaje;
    }
  };

  var VISTAS = ["Catalogo", "Libros", "Clientes", "Ventas", "Historial"];

  var iniciado = false;

  // ---------- URL ----------

  /**
   * Arma "/api" + ruta + query. Omite los parámetros vacíos para no mandar, por ejemplo,
   * "titulo=" cuando el buscador está en blanco.
   */
  function construirUrl(ruta, query) {
    var url = BASE + ruta;
    var partes = [];

    if (query) {
      Object.keys(query).forEach(function (clave) {
        var valor = query[clave];
        if (valor !== undefined && valor !== null && valor !== "") {
          partes.push(encodeURIComponent(clave) + "=" + encodeURIComponent(valor));
        }
      });
    }
    if (partes.length > 0) {
      url += "?" + partes.join("&");
    }
    return url;
  }

  // ---------- Errores ----------

  /** "body › renglones › 1 › cantidad" → "renglones › 1 › cantidad": el "body" no le dice nada al usuario. */
  function campoDelError(loc) {
    if (!Array.isArray(loc)) {
      return "";
    }
    return loc.filter(function (parte) {
      return parte !== "body" && parte !== "query" && parte !== "path";
    }).join(" › ");
  }

  /**
   * FastAPI responde {"detail": "texto"} en los 404/409 y {"detail": [{loc, msg}, ...]} en
   * los 422. Se arma un texto legible; nunca se muestra el JSON crudo.
   */
  function mensajeDeError(data, status) {
    if (data && typeof data.detail === "string" && data.detail !== "") {
      return data.detail;
    }
    if (data && Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map(function (problema) {
        var campo = campoDelError(problema && problema.loc);
        var texto = problema && problema.msg ? String(problema.msg) : TEXTOS.errorHttp(status);
        return campo === "" ? texto : campo + ": " + texto;
      }).join("; ");
    }
    return TEXTOS.errorHttp(status);
  }

  // ---------- Peticiones ----------

  /**
   * Hace la petición y siempre devuelve { ok, status, data, mensaje }, sin lanzar errores:
   * así cada módulo decide qué mostrar. status 0 significa que no hubo respuesta (red caída
   * o servidor inaccesible), distinto de un error que el servidor sí contestó (409, 422…).
   */
  async function pedir(ruta, opciones) {
    var config = opciones || {};
    var init = { method: config.method || "GET", headers: { Accept: "application/json" } };
    var respuesta;
    var texto = "";
    var data = null;

    if (config.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(config.body);
    }

    try {
      respuesta = await fetch(construirUrl(ruta, config.query), init);
      texto = await respuesta.text();
    } catch (error) {
      return { ok: false, status: 0, data: null, mensaje: TEXTOS.sinConexion };
    }

    if (texto !== "") {
      try {
        data = JSON.parse(texto);
      } catch (error) {
        // Un 502 de nginx trae HTML: si además falló, alcanza con informar el código.
        if (respuesta.ok) {
          return { ok: false, status: respuesta.status, data: null, mensaje: TEXTOS.respuestaIlegible };
        }
      }
    }

    if (respuesta.ok) {
      return { ok: true, status: respuesta.status, data: data, mensaje: "" };
    }
    return { ok: false, status: respuesta.status, data: data, mensaje: mensajeDeError(data, respuesta.status) };
  }

  function get(ruta, query) {
    return pedir(ruta, { method: "GET", query: query });
  }

  function post(ruta, cuerpo) {
    return pedir(ruta, { method: "POST", body: cuerpo });
  }

  // ---------- Normalización (API → modelo del front) ----------

  function aTexto(id) {
    return id === null || id === undefined ? null : String(id);
  }

  function editorial(e) {
    return { id: aTexto(e.id), nombre: e.nombre, pais: e.pais };
  }

  function genero(g) {
    return { id: aTexto(g.id), nombre: g.nombre };
  }

  function nombreCompleto(nombre, apellido) {
    return [nombre, apellido].filter(function (parte) {
      return typeof parte === "string" && parte !== "";
    }).join(" ");
  }

  function autor(a) {
    return {
      id: aTexto(a.id),
      nombre: nombreCompleto(a.nombre, a.apellido),
      nacionalidad: a.nacionalidad === undefined ? null : a.nacionalidad
    };
  }

  /** Autoría dentro de un libro: el id del autor es autor_id (id es el de la autoría). */
  function autoria(a) {
    return { id: aTexto(a.autor_id), nombre: nombreCompleto(a.nombre, a.apellido), rol: a.rol, orden: a.orden };
  }

  /**
   * El listado GET /libros/ no trae autores (autorIds queda vacío); el detalle
   * GET /libros/{id} sí, y se ordenan por "orden" como en la portada.
   */
  function libro(l) {
    var autores = Array.isArray(l.autores) ? l.autores.slice() : [];

    autores.sort(function (a, b) {
      return a.orden - b.orden;
    });
    autores = autores.map(autoria);

    return {
      id: aTexto(l.id),
      titulo: l.titulo,
      isbn: l.isbn,
      precio: Number(l.precio),
      stock: l.stock,
      editorialId: aTexto(l.editorial_id),
      generoId: aTexto(l.genero_id),
      autorIds: autores.map(function (a) {
        return a.id;
      }),
      autores: autores
    };
  }

  function cliente(c) {
    return { id: aTexto(c.id), nombre: c.nombre, email: c.email, perfil: c.perfil || null };
  }

  /** Importes históricos: se muestran los que devolvió el servidor, no se recalculan. */
  function renglon(r) {
    return {
      libroId: aTexto(r.libro_id),
      titulo: r.titulo,
      cantidad: r.cantidad,
      precioUnitario: Number(r.precio_unitario),
      subtotal: Number(r.subtotal)
    };
  }

  /** El listado GET /ventas/ no trae renglones (quedan vacíos); el detalle GET /ventas/{id} sí. */
  function venta(v) {
    return {
      id: aTexto(v.id),
      fecha: v.fecha,
      total: Number(v.total),
      clienteId: v.cliente ? aTexto(v.cliente.id) : null,
      clienteNombre: v.cliente ? v.cliente.nombre : "",
      renglones: Array.isArray(v.renglones) ? v.renglones.map(renglon) : []
    };
  }

  // ---------- Carga inicial ----------

  /** Convierte una respuesta fallida en excepción para cortar la carga completa en un solo lugar. */
  function exigirLista(resultado) {
    if (!resultado.ok) {
      throw new Error(resultado.mensaje);
    }
    if (!Array.isArray(resultado.data)) {
      throw new Error(TEXTOS.respuestaIlegible);
    }
    return resultado.data;
  }

  /**
   * Los listados no informan el total: si una página llega llena (100), puede haber otra.
   * Se sigue pidiendo con offset hasta recibir una página incompleta.
   */
  async function listarTodo(ruta) {
    var todos = [];
    var offset = 0;
    var pagina;

    do {
      pagina = exigirLista(await get(ruta, { limit: LIMITE_MAXIMO, offset: offset }));
      todos = todos.concat(pagina);
      offset += LIMITE_MAXIMO;
    } while (pagina.length === LIMITE_MAXIMO);

    return todos;
  }

  /**
   * Las vistas actuales muestran los autores de cada libro y el listado no los trae:
   * se pide el detalle de cada uno, en paralelo. Transitorio hasta que el Paso 2 consulte
   * el detalle bajo demanda.
   */
  async function traerDetalles(libros) {
    return Promise.all(libros.map(async function (l) {
      var resultado = await get("/libros/" + l.id);
      if (!resultado.ok) {
        throw new Error(resultado.mensaje);
      }
      return resultado.data;
    }));
  }

  /** Si un libro tiene un autor que no vino en el listado de autores, se lo agrega para poder mostrarlo. */
  function completarAutores(autores, libros) {
    var conocidos = {};

    autores.forEach(function (a) {
      conocidos[a.id] = true;
    });
    libros.forEach(function (l) {
      l.autores.forEach(function (a) {
        if (!conocidos[a.id]) {
          conocidos[a.id] = true;
          autores.push({ id: a.id, nombre: a.nombre, nacionalidad: null });
        }
      });
    });
    return autores;
  }

  /** Reemplaza el contenido sin cambiar el array: recargar nunca duplica registros. */
  function reemplazar(nombre, valores) {
    if (!Array.isArray(Datos[nombre])) {
      Datos[nombre] = [];
    }
    Datos[nombre].length = 0;
    Array.prototype.push.apply(Datos[nombre], valores);
  }

  function escribirMensaje(id, texto) {
    var elemento = document.getElementById(id);
    if (elemento !== null) {
      elemento.textContent = texto;
    }
  }

  /** Cada vista se redibuja por separado: si una falla, las demás igual se actualizan. */
  function redibujar() {
    VISTAS.forEach(function (nombre) {
      var vista = globalThis[nombre];
      if (vista && typeof vista.render === "function") {
        try {
          vista.render();
        } catch (error) {
          console.error("API: no se pudo redibujar la vista " + nombre + ".", error);
        }
      }
    });
  }

  /**
   * Pide todas las colecciones y recién cuando llegaron todas las vuelca en Datos:
   * o se ve la información completa del servidor, o se ve el error. Nunca una mezcla.
   */
  async function cargarTodo() {
    var mensaje;

    try {
      var respuestas = await Promise.all([
        listarTodo("/editoriales/"),
        get("/generos/").then(exigirLista),
        listarTodo("/autores/"),
        listarTodo("/libros/"),
        listarTodo("/clientes/"),
        get("/ventas/", { limit: LIMITE_VENTAS, offset: 0 }).then(exigirLista)
      ]);
      var libros = (await traerDetalles(respuestas[3])).map(libro);
      var autores = completarAutores(respuestas[2].map(autor), libros);

      reemplazar("editoriales", respuestas[0].map(editorial));
      reemplazar("generos", respuestas[1].map(genero));
      reemplazar("autores", autores);
      reemplazar("libros", libros);
      reemplazar("clientes", respuestas[4].map(cliente));
      reemplazar("ventas", respuestas[5].map(venta));

      redibujar();
      escribirMensaje(IDS.historialError, "");
      console.info(
        "API: datos cargados. libros=" + Datos.libros.length +
        ", clientes=" + Datos.clientes.length +
        ", ventas=" + Datos.ventas.length + "."
      );
      return { ok: true, mensaje: "" };
    } catch (error) {
      mensaje = TEXTOS.errorCarga(error && error.message ? error.message : TEXTOS.sinConexion);
      console.error("API: no se pudieron cargar los datos.", error);

      // Los mensajes van después del redibujado: Catalogo.render() limpia sus contenedores.
      redibujar();
      escribirMensaje(IDS.catalogoVacio, "");
      escribirMensaje(IDS.catalogoError, mensaje);
      escribirMensaje(IDS.historialError, mensaje);
      return { ok: false, mensaje: mensaje };
    }
  }

  // ---------- Inicio ----------

  var publico = {
    get: get,
    post: post,
    construirUrl: construirUrl,
    normalizar: {
      editorial: editorial,
      genero: genero,
      autor: autor,
      libro: libro,
      cliente: cliente,
      venta: venta
    },
    cargarTodo: cargarTodo,
    iniciar: iniciar,
    listo: null
  };

  /** Las vistas ya se dibujaron vacías; mientras llega la respuesta se avisa que está cargando. */
  function iniciar() {
    if (iniciado) {
      return publico.listo;
    }
    iniciado = true;

    if (typeof Datos === "undefined" || Datos === null) {
      console.error("API: no están disponibles los datos de la librería.");
      publico.listo = Promise.resolve({ ok: false, mensaje: "" });
      return publico.listo;
    }

    escribirMensaje(IDS.catalogoVacio, TEXTOS.cargando);
    publico.listo = cargarTodo();
    return publico.listo;
  }

  return publico;
})();

API.iniciar();
