/**
 * M03 — Datos locales de la librería.
 *
 * Semillas estáticas de editoriales, géneros, autores, libros y clientes, y búsqueda
 * de libros por título. Los registros son objetos planos y serializables: M06 los
 * persiste en localStorage tal cual y M04/M05 los consumen sin transformarlos.
 *
 * Namespace público: Datos (ver design.md de m03-modelo-datos-catalogo).
 */

var Datos = {
  editoriales: [
    { id: "edi-01", nombre: "Sudamericana" },
    { id: "edi-02", nombre: "Emecé" }
  ],

  generos: [
    { id: "gen-01", nombre: "Narrativa" },
    { id: "gen-02", nombre: "Ensayo" }
  ],

  autores: [
    { id: "aut-01", nombre: "Julio Cortázar" },
    { id: "aut-02", nombre: "Ernesto Sabato" },
    { id: "aut-03", nombre: "Jorge Luis Borges" }
  ],

  libros: [
    {
      id: "lib-01",
      titulo: "Rayuela",
      isbn: "9788437604572",
      precio: 1500,
      editorialId: "edi-01",
      generoId: "gen-01",
      autorIds: ["aut-01"]
    },
    {
      id: "lib-02",
      titulo: "El túnel",
      isbn: "9789507312274",
      precio: 2000,
      editorialId: "edi-01",
      generoId: "gen-01",
      autorIds: ["aut-02"]
    },
    {
      id: "lib-03",
      titulo: "Ficciones",
      isbn: "9788420633126",
      precio: 2500.5,
      editorialId: "edi-02",
      generoId: "gen-01",
      autorIds: ["aut-03"]
    },
    {
      id: "lib-04",
      titulo: "Sobre héroes y tumbas",
      isbn: "9789507312694",
      precio: 1800,
      editorialId: "edi-01",
      generoId: null,
      autorIds: ["aut-02"]
    },
    {
      id: "lib-05",
      titulo: "Historia de la eternidad",
      isbn: "9789507312038",
      precio: 1200,
      editorialId: "edi-02",
      generoId: "gen-02",
      autorIds: ["aut-03"]
    },
    {
      id: "lib-06",
      titulo: "Antología del cuento argentino",
      isbn: "9789507312885",
      precio: 3100.75,
      editorialId: "edi-02",
      generoId: "gen-01",
      autorIds: ["aut-01", "aut-02"]
    }
  ],

  clientes: [
    { id: "cli-01", nombre: "Ana María Gómez", email: "ana.gomez@example.com" },
    { id: "cli-02", nombre: "Bruno Pérez", email: "bruno.perez@example.com" },
    { id: "cli-03", nombre: "Carla Fernández", email: "carla.fernandez@example.com" }
  ]
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
