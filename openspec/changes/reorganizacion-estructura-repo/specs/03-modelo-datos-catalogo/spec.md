# 03-modelo-datos-catalogo — Delta Specification

## MODIFIED Requirements

### Requirement: Modelo de datos semilla con identificadores estables

El sistema SHALL exponer cinco colecciones de datos locales —libros, editoriales, géneros, autores y clientes— declaradas en `js/nucleo/data.js`. Cada registro MUST tener un `id` de tipo string, único dentro de su colección y con el prefijo de su entidad (`lib-`, `edi-`, `gen-`, `aut-`, `cli-`). Las colecciones semilla MUST contener al menos 6 libros, 2 editoriales, 2 géneros, 3 autores y 3 clientes ficticios.

#### Scenario: Cantidades mínimas de las semillas

- **WHEN** se consultan las colecciones desde la consola del navegador
- **THEN** `Datos.libros` tiene 6 elementos, `Datos.editoriales` 2, `Datos.generos` 2, `Datos.autores` 3 y `Datos.clientes` 3

#### Scenario: Identificadores únicos y legibles

- **WHEN** se recorren los `id` de cada colección
- **THEN** cada `id` es un string con el prefijo de su entidad y no se repite dentro de la colección

### Requirement: API global de datos

El sistema SHALL publicar un namespace global único `Datos` con las propiedades `libros`, `editoriales`, `generos`, `autores`, `clientes` y la función `buscarLibrosPorTitulo`. El sistema MUST NOT requerir módulos ES, `import`, `export`, `type="module"` ni herramientas de build para consumir la API. `js/nucleo/data.js` MUST cargarse antes que `js/modulos/catalogo.js`.

#### Scenario: API disponible desde la consola

- **WHEN** se ejecuta `typeof Datos.buscarLibrosPorTitulo` en la consola con la página cargada
- **THEN** el resultado es `"function"` y las cinco colecciones están accesibles como arrays

#### Scenario: Orden de carga de los scripts

- **WHEN** se inspeccionan las etiquetas `<script>` del bloque reservado al final del `body`
- **THEN** las tres primeras son las referencias locales `js/nucleo/data.js`, `js/modulos/catalogo.js` y `js/nucleo/navegacion.js`, en ese orden, sin `type="module"` ni atributos `async`, y cualquier script de un módulo posterior aparece a continuación de ellas

### Requirement: Renderizado seguro de la tabla de catálogo

`Catalogo.render()` SHALL reconstruir el contenido de `#cuerpo-tabla-catalogo` a partir de `Datos.libros`. Cada fila MUST representar un libro y MUST exponer las columnas en este orden: Título, Autor/es, Editorial, Género, Precio. Los valores SHALL insertarse con `textContent` sobre nodos creados con `document.createElement`; el sistema MUST NOT usar `innerHTML` para insertar datos.

#### Scenario: Catálogo inicial renderizado

- **WHEN** se abre `index.html` con el catálogo semilla
- **THEN** `#cuerpo-tabla-catalogo` contiene 6 filas y cada fila tiene 5 celdas

#### Scenario: Inserción segura de datos

- **WHEN** se busca en el código de `js/modulos/catalogo.js` la palabra `innerHTML`
- **THEN** no aparece ninguna ocurrencia

#### Scenario: Re-render solicitado por otro módulo

- **WHEN** se agrega un libro a `Datos.libros` y se invoca `Catalogo.render()`
- **THEN** la tabla muestra el nuevo libro sin recargar la página

### Requirement: Restricciones técnicas del módulo

El código del módulo MUST ser JavaScript nativo sin frameworks, librerías, CDN, gestores de paquetes, herramientas de build ni peticiones de red. MUST NOT contener `fetch`, `XMLHttpRequest` ni URLs absolutas. Los nombres de funciones, variables y textos de la interfaz MUST estar en español. El módulo MUST limitarse a crear `js/nucleo/data.js`, `js/modulos/catalogo.js` y `js/nucleo/navegacion.js`, y a agregar sus tres etiquetas `<script src>` en el bloque reservado de `index.html`.

#### Scenario: Sin recursos ni peticiones de red

- **WHEN** se busca `fetch`, `XMLHttpRequest` o `http` en los tres archivos JavaScript del módulo
- **THEN** no aparece ninguna referencia de red

#### Scenario: Alcance de archivos respetado

- **WHEN** se revisa el cambio aplicado
- **THEN** sólo se crearon los tres archivos JavaScript y las únicas líneas modificadas de `index.html` son las del bloque reservado de scripts
