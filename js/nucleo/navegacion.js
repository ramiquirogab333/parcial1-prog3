/**
 * M03 — Navegación entre las cinco vistas de la librería.
 *
 * Muestra una sola <section class="vista"> a la vez alternando el atributo hidden,
 * toma el hash de la URL como estado inicial y marca el enlace activo del nav con
 * aria-current. Los enlaces del nav conservan su comportamiento nativo: el navegador
 * cambia el hash y el evento hashchange aplica la vista.
 *
 * Namespace público: Navegacion.mostrarVista(idVista) (ver design.md de m03-modelo-datos-catalogo).
 */

var Navegacion = (function () {
  "use strict";

  var VISTAS = ["catalogo", "libros", "clientes", "ventas", "historial"];
  var iniciado = false;

  function esVistaValida(idVista) {
    return VISTAS.indexOf(idVista) !== -1;
  }

  function seccionDe(idVista) {
    return document.getElementById("vista-" + idVista);
  }

  function enlaceDe(idVista) {
    return document.getElementById("enlace-" + idVista);
  }

  function vistaDesdeHash() {
    var hash = String(window.location.hash || "").replace(/^#/, "");
    var idVista = hash.indexOf("vista-") === 0 ? hash.slice("vista-".length) : "";
    return esVistaValida(idVista) ? idVista : "catalogo";
  }

  function marcarEnlaceActivo(idVista) {
    VISTAS.forEach(function (vista) {
      var enlace = enlaceDe(vista);

      if (enlace === null) {
        return;
      }
      if (vista === idVista) {
        enlace.setAttribute("aria-current", "page");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });
  }

  function aplicarVista(idVista) {
    var destino = seccionDe(idVista);

    if (destino === null) {
      console.error("Navegación: falta la sección de la vista «" + idVista + "».");
      return false;
    }

    VISTAS.forEach(function (vista) {
      var seccion = seccionDe(vista);

      if (seccion !== null) {
        seccion.hidden = vista !== idVista;
      }
    });

    marcarEnlaceActivo(idVista);
    return true;
  }

  /**
   * Cambia la vista activa. Si el hash de la URL no coincide, lo actualiza: el
   * navegador dispara hashchange y la vista se aplica de nuevo de forma idempotente.
   * No se usa history.replaceState porque en file:// el navegador lo bloquea.
   */
  function mostrarVista(idVista) {
    if (!esVistaValida(idVista)) {
      console.error("Navegación: la vista «" + idVista + "» no existe.");
      return;
    }

    if (!aplicarVista(idVista)) {
      return;
    }

    var destino = "#vista-" + idVista;
    if (window.location.hash !== destino) {
      window.location.hash = destino;
    }
  }

  function iniciar() {
    if (iniciado) {
      return;
    }
    iniciado = true;

    aplicarVista(vistaDesdeHash());

    window.addEventListener("hashchange", function () {
      aplicarVista(vistaDesdeHash());
    });
  }

  return {
    mostrarVista: mostrarVista,
    iniciar: iniciar
  };
})();

Navegacion.iniciar();
