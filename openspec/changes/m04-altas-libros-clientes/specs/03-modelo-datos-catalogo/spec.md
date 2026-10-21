# 03-modelo-datos-catalogo — Delta Specification

## MODIFIED Requirements

### Requirement: API global de datos

El sistema SHALL publicar un namespace global único `Datos` con las propiedades `libros`, `editoriales`, `generos`, `autores`, `clientes` y la función `buscarLibrosPorTitulo`. El sistema MUST NOT requerir módulos ES, `import`, `export`, `type="module"` ni herramientas de build para consumir la API. `js/data.js` MUST cargarse antes que `js/catalogo.js`.

#### Scenario: API disponible desde la consola

- **WHEN** se ejecuta `typeof Datos.buscarLibrosPorTitulo` en la consola con la página cargada
- **THEN** el resultado es `"function"` y las cinco colecciones están accesibles como arrays

#### Scenario: Orden de carga de los scripts

- **WHEN** se inspeccionan las etiquetas `<script>` del bloque reservado al final del `body`
- **THEN** las tres primeras son las referencias locales `js/data.js`, `js/catalogo.js` y `js/navegacion.js`, en ese orden, sin `type="module"` ni atributos `async`, y cualquier script de un módulo posterior aparece a continuación de ellas
