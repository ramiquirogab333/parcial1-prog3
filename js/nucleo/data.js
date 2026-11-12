/**
 * M03 — Datos de la librería (adaptado en el Global · Paso 1).
 *
 * Contenedor en memoria de editoriales, géneros, autores, libros, clientes y ventas, y
 * búsqueda de libros por título. Arranca vacío a propósito: api.js lo llena con lo que
 * devuelve la API al cargar la página. No hay datos de ejemplo de respaldo: si la API
 * falla, el error se ve en lugar de quedar escondido detrás de registros inventados.
 *
 * Los registros son objetos planos con IDs de texto (api.js normaliza los IDs numéricos
 * de la API) para que los módulos los consuman sin transformarlos.
 *
 * Namespace público: Datos (ver design.md de m03-modelo-datos-catalogo).
 */

var Datos = {
  editoriales: [],
  generos: [],
  autores: [],
  libros: [],
  clientes: [],
  ventas: []
};

/**
 * Devuelve un array nuevo con los libros cuyo título contiene el texto consultado.
 * Ignora mayúsculas y minúsculas, y descarta los espacios de los extremos.
 * Una consulta vacía devuelve el catálogo completo.
 *
 * Es pura: no modifica la lista recibida, no accede al DOM ni a variables globales
 * cuando se le pasa la lista. El segundo parámetro es opcional para que la API
 * pública se pueda usar como Datos.buscarLibrosPorTitulo(texto).
 *
 * @param {string} texto Texto a buscar dentro del título.
 * @param {Array} [libros] Lista donde buscar; por defecto, Datos.libros.
 * @returns {Array} Libros coincidentes, en el orden de la lista original.
 */
Datos.buscarLibrosPorTitulo = function (texto, libros) {
  var catalogo = libros || Datos.libros;
  var consulta = String(texto === null || texto === undefined ? "" : texto).trim().toLowerCase();

  if (consulta === "") {
    return catalogo.slice();
  }

  return catalogo.filter(function (libro) {
    var titulo = String(libro.titulo === null || libro.titulo === undefined ? "" : libro.titulo);
    return titulo.toLowerCase().indexOf(consulta) !== -1;
  });
};
