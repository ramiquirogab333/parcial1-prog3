/**
 * M04 — Alta de libros (Global · Paso 4: el alta ahora se guarda en la API).
 *
 * Puebla los selectores del formulario de libros desde Datos (editoriales, géneros y autores
 * vienen de la API), valida localmente cada alta y la envía con POST /libros/. Recién cuando el
 * servidor responde 201 agrega el libro a Datos.libros y actualiza sin recargar el listado, el
 * selector de libros de la vista Ventas y el catálogo (que pide sus datos a la API por su cuenta,
 * por eso se llama a Catalogo.cargar()). Tras cada alta dispara "datos-actualizados" en document.
 * Si el servidor rechaza el alta (409 o 422) se muestra su mensaje y se conserva lo que cargó la
 * persona. Inserta datos sólo con textContent / new Option, nunca como HTML.
 *
 * Cada autor elegido tiene su fila con rol (autor, coautor, traductor, ilustrador) y orden (>= 1).
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
    stock: "libro-stock",
    editorial: "libro-editorial",
    genero: "libro-genero",
    autores: "libro-autores",
    autoresDetalle: "libro-autores-detalle",
    boton: "btn-alta-libro",
    mensaje: "mensaje-libro",
    cuerpo: "cuerpo-tabla-libros",
    vacio: "mensaje-libros-vacio",
    ventaLibro: "venta-libro"
  };

  // Roles que acepta el backend; el valor viaja tal cual, la etiqueta es lo que se ve.
  var ROLES = [
    { valor: "autor", etiqueta: "Autor" },
    { valor: "coautor", etiqueta: "Coautor" },
    { valor: "traductor", etiqueta: "Traductor" },
    { valor: "ilustrador", etiqueta: "Ilustrador" }
  ];

  // Límite de la columna isbn en la base (VARCHAR(30)).
  var LARGO_MAXIMO_ISBN = 30;

  var TEXTOS = {
    elegirEditorial: "Seleccione una editorial…",
    sinGenero: "Sin clasificar",
    elegirLibro: "Seleccione un libro…",
    vacio: "Todavía no hay libros registrados.",
    rechazo: "No se pudo dar de alta el libro: ",
    enviando: "Enviando el libro al servidor…",
    respuestaInvalida: "El servidor respondió, pero no se pudo leer el libro creado. Recargá la página para verlo.",
    exito: function (titulo) {
      return "Libro «" + titulo + "» dado de alta correctamente.";
    }
  };

  var iniciado = false;
  var enviando = false;

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

  function aTextoLimpio(valor) {
    return String(valor === null || valor === undefined ? "" : valor).trim();
  }

  function esEnteroNoNegativo(texto) {
    return /^\d+$/.test(texto);
  }

  function rolValido(rol) {
    return ROLES.some(function (opcion) {
      return opcion.valor === rol;
    });
  }

  // ---------- Validación (pura) ----------

  /**
   * Normaliza los autores de la entrada. Acepta la forma nueva [{ autorId, rol, orden }] y,
   * por compatibilidad, la anterior autorIds: ["1", "2"] (rol "autor", orden por posición).
   */
  function autoresDeEntrada(entrada) {
    if (Array.isArray(entrada.autores)) {
      return entrada.autores;
    }
    if (Array.isArray(entrada.autorIds)) {
      return entrada.autorIds.map(function (id, indice) {
        return { autorId: id, rol: "autor", orden: String(indice + 1) };
      });
    }
    return [];
  }

  /**
   * Revisa una entrada del formulario y devuelve los problemas encontrados,
   * cada uno con el campo afectado y su mensaje. No toca el DOM ni modifica Datos.
   * El ISBN repetido no se revisa acá: lo decide el servidor (409), que es quien tiene todos los libros.
   */
  function revisar(entrada) {
    var problemas = [];
    var titulo = aTextoLimpio(entrada.titulo);
    var isbn = aTextoLimpio(entrada.isbn);
    var textoPrecio = aTextoLimpio(entrada.precio);
    var precio = Number(textoPrecio);
    var textoStock = aTextoLimpio(entrada.stock);
    var autores = autoresDeEntrada(entrada);
    var vistos = {};
    var hayRepetido = false;
    var hayOrdenInvalido = false;
    var hayRolInvalido = false;
    var hayInexistente = false;

    if (titulo === "") {
      problemas.push({ campo: IDS.titulo, mensaje: "El título es obligatorio." });
    }

    if (isbn === "") {
      problemas.push({ campo: IDS.isbn, mensaje: "El ISBN es obligatorio." });
    } else if (isbn.length > LARGO_MAXIMO_ISBN) {
      problemas.push({ campo: IDS.isbn, mensaje: "El ISBN no puede tener más de " + LARGO_MAXIMO_ISBN + " caracteres." });
    }

    // El servidor guarda el precio con 2 decimales: se rechaza lo que no cabe en vez de redondearlo en silencio.
    if (textoPrecio === "" || !isFinite(precio) || precio <= 0 || !/^\d+(\.\d{1,2})?$/.test(textoPrecio)) {
      problemas.push({ campo: IDS.precio, mensaje: "El precio debe ser un número mayor que cero, con hasta 2 decimales." });
    }

    if (!esEnteroNoNegativo(textoStock)) {
      problemas.push({ campo: IDS.stock, mensaje: "El stock debe ser un número entero mayor o igual que cero." });
    }

    if (buscarRegistro(Datos.editoriales, entrada.editorialId) === null) {
      problemas.push({ campo: IDS.editorial, mensaje: "Seleccioná una editorial existente." });
    }

    if (entrada.generoId !== "" && entrada.generoId !== null && entrada.generoId !== undefined &&
        buscarRegistro(Datos.generos, entrada.generoId) === null) {
      problemas.push({ campo: IDS.genero, mensaje: "El género seleccionado no existe." });
    }

    if (autores.length === 0) {
      problemas.push({ campo: IDS.autores, mensaje: "Seleccioná al menos un autor." });
    } else {
      autores.forEach(function (autor) {
        if (buscarRegistro(Datos.autores, autor.autorId) === null) {
          hayInexistente = true;
        }
        if (vistos[autor.autorId]) {
          hayRepetido = true;
        }
        vistos[autor.autorId] = true;
        if (!esEnteroNoNegativo(aTextoLimpio(autor.orden)) || Number(autor.orden) < 1) {
          hayOrdenInvalido = true;
        }
        if (!rolValido(autor.rol)) {
          hayRolInvalido = true;
        }
      });

      if (hayInexistente) {
        problemas.push({ campo: IDS.autores, mensaje: "Alguno de los autores seleccionados no existe." });
      }
      if (hayRepetido) {
        problemas.push({ campo: IDS.autores, mensaje: "No se puede repetir un autor en el mismo libro." });
      }
      if (hayOrdenInvalido) {
        problemas.push({ campo: IDS.autores, mensaje: "El orden de cada autor debe ser un número entero mayor o igual que 1." });
      }
      if (hayRolInvalido) {
        problemas.push({ campo: IDS.autores, mensaje: "El rol de cada autor debe ser autor, coautor, traductor o ilustrador." });
      }
    }

    return problemas;
  }

  /**
   * Valida una entrada { titulo, isbn, precio, stock, editorialId, generoId, autores: [{ autorId, rol, orden }] }.
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

  // ---------- Autores con rol y orden ----------

  /** Lee las filas actuales: [{ autorId, rol, orden }] en el orden en que se muestran. */
  function leerFilasAutores() {
    var filas = obtener(IDS.autoresDetalle).querySelectorAll(".fila-autor");
    var autores = [];
    var i;

    for (i = 0; i < filas.length; i += 1) {
      autores.push({
        autorId: filas[i].getAttribute("data-autor-id"),
        rol: filas[i].querySelector("select").value,
        orden: filas[i].querySelector("input").value
      });
    }
    return autores;
  }

  function crearFilaAutor(autor, rol, orden) {
    var fila = document.createElement("div");
    var etiqueta = document.createElement("span");
    var selectorRol = document.createElement("select");
    var campoOrden = document.createElement("input");

    fila.className = "fila-autor";
    fila.setAttribute("data-autor-id", autor.id);

    etiqueta.className = "fila-autor__nombre";
    etiqueta.textContent = autor.nombre;

    selectorRol.setAttribute("aria-label", "Rol de " + autor.nombre);
    ROLES.forEach(function (opcion) {
      selectorRol.add(new Option(opcion.etiqueta, opcion.valor));
    });
    selectorRol.value = rol;

    campoOrden.type = "number";
    campoOrden.min = "1";
    campoOrden.step = "1";
    campoOrden.inputMode = "numeric";
    campoOrden.value = orden;
    campoOrden.setAttribute("aria-label", "Orden de " + autor.nombre);

    fila.appendChild(etiqueta);
    fila.appendChild(selectorRol);
    fila.appendChild(campoOrden);
    return fila;
  }

  /**
   * Dibuja una fila por cada autor elegido en el selector múltiple. Si el autor ya tenía fila,
   * conserva el rol y el orden que la persona había cargado; si es nuevo, arranca como "autor"
   * con el siguiente orden libre.
   */
  function renderAutoresDetalle() {
    var contenedor = obtener(IDS.autoresDetalle);
    var previos = {};
    var opciones = obtener(IDS.autores).options;
    var fragmento = document.createDocumentFragment();
    var cantidad = 0;
    var i;

    leerFilasAutores().forEach(function (fila) {
      previos[fila.autorId] = fila;
    });

    for (i = 0; i < opciones.length; i += 1) {
      if (opciones[i].selected) {
        var autor = buscarRegistro(Datos.autores, opciones[i].value);
        if (autor !== null) {
          cantidad += 1;
          var previo = previos[autor.id];
          fragmento.appendChild(crearFilaAutor(
            autor,
            previo ? previo.rol : "autor",
            previo ? previo.orden : String(cantidad)
          ));
        }
      }
    }

    contenedor.textContent = "";
    contenedor.appendChild(fragmento);
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

  /** Redibuja listado y selectores; la API lo llama tras cargar los datos del servidor. */
  function render() {
    poblarSelectoresFormulario();
    renderAutoresDetalle();
    renderListado();
    poblarSelectorVenta();
  }

  // ---------- Formulario ----------

  function leerFormulario() {
    return {
      titulo: obtener(IDS.titulo).value,
      isbn: obtener(IDS.isbn).value,
      precio: obtener(IDS.precio).value,
      stock: obtener(IDS.stock).value,
      editorialId: obtener(IDS.editorial).value,
      generoId: obtener(IDS.genero).value,
      autores: leerFilasAutores()
    };
  }

  /**
   * Arma el cuerpo exacto de POST /libros/. Los IDs viajan como número, el género vacío como
   * null, el precio como texto con 2 decimales y el ISBN tal como se escribió (el backend lo
   * compara sin normalizar, así que no se le quitan los guiones).
   */
  function armarCuerpo(entrada) {
    return {
      isbn: aTextoLimpio(entrada.isbn),
      titulo: aTextoLimpio(entrada.titulo),
      precio: Number(aTextoLimpio(entrada.precio)).toFixed(2),
      stock: Number(aTextoLimpio(entrada.stock)),
      editorial_id: Number(entrada.editorialId),
      genero_id: entrada.generoId === "" ? null : Number(entrada.generoId),
      autores: entrada.autores.map(function (autor) {
        return { autor_id: Number(autor.autorId), rol: autor.rol, orden: Number(autor.orden) };
      })
    };
  }

  function limpiarInvalidos() {
    [IDS.titulo, IDS.isbn, IDS.precio, IDS.stock, IDS.editorial, IDS.genero, IDS.autores].forEach(function (id) {
      obtener(id).removeAttribute("aria-invalid");
    });
  }

  function mostrarMensaje(texto, esError) {
    var mensaje = obtener(IDS.mensaje);
    mensaje.textContent = texto;
    mensaje.classList.toggle("mensaje--error", esError);
    mensaje.classList.toggle("mensaje--exito", !esError);
  }

  /** Deshabilita el botón mientras se envía, para que un doble clic no cree dos libros. */
  function marcarEnvio(activo) {
    enviando = activo;
    obtener(IDS.boton).disabled = activo;
  }

  /** Tras el 201: suma el libro a Datos, limpia el formulario y refresca todas las vistas que lo muestran. */
  function registrarAlta(form, libro) {
    Datos.libros.push(libro);

    form.reset();
    renderAutoresDetalle();
    renderListado();
    poblarSelectorVenta();
    if (typeof Ventas !== "undefined" && typeof Ventas.render === "function") {
      Ventas.render();
    }
    // El catálogo pide sus datos a la API por su cuenta: Catalogo.render() solo redibujaría lo viejo.
    if (typeof Catalogo !== "undefined" && typeof Catalogo.cargar === "function") {
      Catalogo.cargar();
    }

    mostrarMensaje(TEXTOS.exito(libro.titulo), false);
    document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "libros" } }));
  }

  async function alEnviar(evento) {
    var form = evento.currentTarget;
    evento.preventDefault();

    if (enviando) {
      return;
    }
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

    marcarEnvio(true);
    mostrarMensaje(TEXTOS.enviando, false);

    try {
      var resultado = await API.post("/libros/", armarCuerpo(entrada));

      if (!resultado.ok) {
        // 409 y 422: el mensaje ya viene legible desde api.js y el formulario queda como estaba.
        mostrarMensaje(TEXTOS.rechazo + resultado.mensaje, true);
        return;
      }
      if (resultado.data === null || typeof resultado.data !== "object") {
        mostrarMensaje(TEXTOS.respuestaInvalida, true);
        return;
      }

      registrarAlta(form, API.normalizar.libro(resultado.data));
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
      console.error("Libros: faltan los datos o el formulario de alta de libros.");
      return;
    }

    render();
    obtener(IDS.form).addEventListener("submit", alEnviar);
    obtener(IDS.autores).addEventListener("change", renderAutoresDetalle);
  }

  return {
    validar: validar,
    render: render,
    iniciar: iniciar
  };
})();

Libros.iniciar();
