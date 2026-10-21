/**
 * Tema claro / oscuro.
 *
 * Se carga en el <head>, sin defer, para aplicar el tema antes del primer pintado y evitar
 * el parpadeo (FOUC). La elección manual guardada en localStorage ("tema-preferido") tiene
 * prioridad sobre la preferencia del sistema (prefers-color-scheme). Aplica la clase
 * .dark-mode / .light-mode y el atributo data-theme en <html>, que son los selectores de
 * style.css. El botón (sólo íconos, ver tema.css) se enlaza cuando el DOM está listo; su
 * nombre accesible se actualiza con aria-label y title, y el cambio manual activa unos
 * instantes la clase .tema-transicion para fundir los colores.
 *
 * Namespace público: Tema.alternar(), Tema.actual().
 */

var Tema = (function () {
  "use strict";

  var CLAVE = "tema-preferido";
  var TEMAS = ["light", "dark"];
  var ID_BOTON = "btn-tema";

  var CLASE_TRANSICION = "tema-transicion";
  var DURACION_TRANSICION = 600;

  var ETIQUETAS = {
    haciaOscuro: "Activar el tema oscuro",
    haciaClaro: "Activar el tema claro"
  };

  var temporizador = null;

  var raiz = document.documentElement;

  // ---------- Preferencia ----------

  /** localStorage puede lanzar error (modo privado, bloqueado): se trata como "sin dato". */
  function leerGuardado() {
    try {
      var guardado = window.localStorage.getItem(CLAVE);
      return TEMAS.indexOf(guardado) !== -1 ? guardado : null;
    } catch (error) {
      return null;
    }
  }

  function guardar(tema) {
    try {
      window.localStorage.setItem(CLAVE, tema);
    } catch (error) {
      // Sin almacenamiento: el tema sigue funcionando durante esta sesión.
    }
  }

  function consultaSistema() {
    return window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  }

  function preferenciaDelSistema() {
    var consulta = consultaSistema();
    return consulta !== null && consulta.matches ? "dark" : "light";
  }

  // ---------- Aplicación ----------

  function actual() {
    return raiz.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function aplicar(tema) {
    raiz.classList.toggle("dark-mode", tema === "dark");
    raiz.classList.toggle("light-mode", tema === "light");
    raiz.setAttribute("data-theme", tema);
  }

  // ---------- Botón ----------

  function actualizarBoton() {
    var boton = document.getElementById(ID_BOTON);
    if (boton === null) {
      return;
    }

    var etiqueta = actual() === "dark" ? ETIQUETAS.haciaClaro : ETIQUETAS.haciaOscuro;
    boton.setAttribute("aria-label", etiqueta);
    boton.setAttribute("title", etiqueta);
  }

  /** Activa la transición de colores sólo un instante, para que no ocurra al cargar la página. */
  function animarCambio() {
    raiz.classList.add(CLASE_TRANSICION);
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(function () {
      raiz.classList.remove(CLASE_TRANSICION);
    }, DURACION_TRANSICION);
  }

  function alternar() {
    var nuevo = actual() === "dark" ? "light" : "dark";

    animarCambio();
    aplicar(nuevo);
    guardar(nuevo);
    actualizarBoton();
  }

  function iniciarBoton() {
    var boton = document.getElementById(ID_BOTON);
    if (boton === null) {
      console.error("Tema: falta el botón #" + ID_BOTON + ".");
      return;
    }

    boton.addEventListener("click", alternar);
    actualizarBoton();
  }

  // ---------- Inicio inmediato (antes del primer pintado) ----------

  aplicar(leerGuardado() || preferenciaDelSistema());

  // Si no hay elección manual, el tema acompaña los cambios del sistema.
  var consulta = consultaSistema();
  if (consulta !== null && typeof consulta.addEventListener === "function") {
    consulta.addEventListener("change", function () {
      if (leerGuardado() === null) {
        aplicar(preferenciaDelSistema());
        actualizarBoton();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", iniciarBoton);

  return {
    alternar: alternar,
    actual: actual
  };
})();
