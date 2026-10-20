# 03-modelo-datos-catalogo — Delta Specification

## Purpose

Define el modelo de datos local de la librería —libros, editoriales, géneros, autores y clientes—, su API global de consulta y el catálogo que se renderiza y se filtra por título, incluido el intercambio de las cinco vistas del documento.

## ADDED Requirements

### Requirement: Modelo de datos semilla con identificadores estables

El sistema SHALL exponer cinco colecciones de datos locales —libros, editoriales, géneros, autores y clientes— declaradas en `js/data.js`. Cada registro MUST tener un `id` de tipo string, único dentro de su colección y con el prefijo de su entidad (`lib-`, `edi-`, `gen-`, `aut-`, `cli-`). Las colecciones semilla MUST contener al menos 6 libros, 2 editoriales, 2 géneros, 3 autores y 3 clientes ficticios.

#### Scenario: Cantidades mínimas de las semillas

- **WHEN** se consultan las colecciones desde la consola del navegador
- **THEN** `Datos.libros` tiene 6 elementos, `Datos.editoriales` 2, `Datos.generos` 2, `Datos.autores` 3 y `Datos.clientes` 3

#### Scenario: Identificadores únicos y legibles

- **WHEN** se recorren los `id` de cada colección
- **THEN** cada `id` es un string con el prefijo de su entidad y no se repite dentro de la colección

### Requirement: Integridad referencial y tipos del modelo

Todo libro SHALL declarar `editorialId` de una editorial existente y `autorIds` con al menos un autor existente. `generoId` MUST ser `null` o el `id` de un género existente. `precio` MUST ser un número mayor que cero y `isbn` MUST ser un string sin guiones ni espacios. La ausencia de género MUST representarse con `null` y no con una cadena vacía.

#### Scenario: Libro con género sin clasificar

- **WHEN** se inspecciona el libro que declara `generoId: null`
- **THEN** el registro es válido y el catálogo lo muestra como «Sin clasificar»

#### Scenario: Referencias resolubles

- **WHEN** se resuelve el `editorialId` y cada elemento de `autorIds` de todos los libros contra sus colecciones
- **THEN** todas las referencias encuentran exactamente un registro existente

#### Scenario: Precio numérico

- **WHEN** se inspecciona el campo `precio` de cualquier libro semilla
- **THEN** su valor es de tipo número y no un string formateado

### Requirement: Semillas serializables

Los registros semilla MUST ser objetos planos: sin funciones, sin instancias de clases, sin referencias circulares y sin valores generados en tiempo de ejecución como `Date.now()` o identificadores aleatorios. Toda la estructura MUST sobrevivir a `JSON.stringify` seguido de `JSON.parse` sin pérdida de información, para que otro módulo pueda persistirla en `localStorage` tal cual.

#### Scenario: Ida y vuelta por JSON

- **WHEN** se serializa y se vuelve a parsear cualquiera de las cinco colecciones
- **THEN** la estructura resultante es equivalente al original y conserva los mismos `id` y relaciones

#### Scenario: Sin valores generados

- **WHEN** se recarga la página y se comparan las semillas
- **THEN** los `id` y los contenidos son idénticos a los de la carga anterior

### Requirement: API global de datos

El sistema SHALL publicar un namespace global único `Datos` con las propiedades `libros`, `editoriales`, `generos`, `autores`, `clientes` y la función `buscarLibrosPorTitulo`. El sistema MUST NOT requerir módulos ES, `import`, `export`, `type="module"` ni herramientas de build para consumir la API. `js/data.js` MUST cargarse antes que `js/catalogo.js`.

#### Scenario: API disponible desde la consola

- **WHEN** se ejecuta `typeof Datos.buscarLibrosPorTitulo` en la consola con la página cargada
- **THEN** el resultado es `"function"` y las cinco colecciones están accesibles como arrays

#### Scenario: Orden de carga de los scripts

- **WHEN** se inspeccionan las etiquetas `<script>` del bloque reservado al final del `body`
- **THEN** aparecen sólo las tres referencias locales `js/data.js`, `js/catalogo.js` y `js/navegacion.js`, en ese orden, sin `type="module"` ni atributos `async`

### Requirement: Búsqueda de libros por título

`Datos.buscarLibrosPorTitulo(texto, libros)` SHALL devolver un array nuevo con los libros cuyo título contenga el texto consultado. La comparación MUST ignorar mayúsculas y minúsculas y MUST aplicar `trim()` a la consulta. Una consulta vacía o compuesta sólo por espacios MUST devolver el catálogo completo.

#### Scenario: Coincidencia parcial en mayúsculas

- **WHEN** se busca `"RAYU"` con el catálogo semilla
- **THEN** el resultado contiene el libro cuyo título es «Rayuela»

#### Scenario: Coincidencia parcial en minúsculas

- **WHEN** se busca `"fICC"` con el catálogo semilla
- **THEN** el resultado contiene el libro cuyo título es «Ficciones»

#### Scenario: Espacios exteriores en la consulta

- **WHEN** se busca `"  el túnel  "`
- **THEN** el resultado contiene el libro cuyo título es «El túnel» y no se descarta por los espacios

#### Scenario: Consulta sin coincidencias

- **WHEN** se busca un texto que no aparece en ningún título
- **THEN** el resultado es un array vacío

### Requirement: Pureza de la búsqueda

`Datos.buscarLibrosPorTitulo` MUST NOT modificar el array recibido ni acceder al DOM. Si se omite el segundo argumento, MUST usar `Datos.libros`. El array devuelto MUST ser siempre una instancia distinta a la de la lista original.

#### Scenario: Consulta vacía

- **WHEN** se busca una cadena vacía o compuesta sólo por espacios
- **THEN** el resultado contiene los 6 libros del catálogo y no es la misma referencia que `Datos.libros`

#### Scenario: Pureza de la función

- **WHEN** se invoca la función con una lista propia y se compara su longitud antes y después
- **THEN** la lista recibida conserva su longitud y su contenido, y el array devuelto es una instancia distinta

### Requirement: Renderizado seguro de la tabla de catálogo

`Catalogo.render()` SHALL reconstruir el contenido de `#cuerpo-tabla-catalogo` a partir de `Datos.libros`. Cada fila MUST representar un libro y MUST exponer las columnas en este orden: Título, Autor/es, Editorial, Género, Precio. Los valores SHALL insertarse con `textContent` sobre nodos creados con `document.createElement`; el sistema MUST NOT usar `innerHTML` para insertar datos.

#### Scenario: Catálogo inicial renderizado

- **WHEN** se abre `index.html` con el catálogo semilla
- **THEN** `#cuerpo-tabla-catalogo` contiene 6 filas y cada fila tiene 5 celdas

#### Scenario: Inserción segura de datos

- **WHEN** se busca en el código de `js/catalogo.js` la palabra `innerHTML`
- **THEN** no aparece ninguna ocurrencia

#### Scenario: Re-render solicitado por otro módulo

- **WHEN** se agrega un libro a `Datos.libros` y se invoca `Catalogo.render()`
- **THEN** la tabla muestra el nuevo libro sin recargar la página

### Requirement: El ISBN no se muestra en el catálogo

El catálogo MUST NOT renderizar el ISBN de los libros, por decisión del usuario sobre el alcance del Ejercicio 3. El campo `isbn` MUST conservarse en el modelo de datos porque otro módulo lo usa para validar unicidad y persistirlo.

#### Scenario: Filas sin columna de ISBN

- **WHEN** se inspeccionan las celdas de cualquier fila del catálogo
- **THEN** hay exactamente cinco celdas y ninguna corresponde al ISBN

#### Scenario: El ISBN sigue disponible en el modelo

- **WHEN** se consulta `Datos.libros[0].isbn` en la consola
- **THEN** el valor es un string no vacío, aunque no aparezca en la tabla


### Requirement: Resolución de relaciones y formato de presentación

El render SHALL resolver los nombres de autores y editorial a partir de sus `id`, unir los nombres de autores con el separador `", "` y mostrar el precio con exactamente dos decimales usando `toFixed(2)`. Un libro con `generoId: null` MUST mostrar el texto exacto «Sin clasificar».

#### Scenario: Libro con varios autores

- **WHEN** se inspecciona la fila de un libro con dos autores
- **THEN** la celda de Autor/es muestra ambos nombres separados por `", "`

#### Scenario: Libro sin género

- **WHEN** se inspecciona la fila del libro con `generoId: null`
- **THEN** la celda de Género contiene exactamente «Sin clasificar»

#### Scenario: Precio con dos decimales

- **WHEN** se inspeccionan las celdas de Precio del catálogo
- **THEN** todas muestran dos decimales, incluidas las que terminan en cero

### Requirement: Filtrado en vivo del catálogo

La vista Catálogo SHALL filtrar en vivo al producirse el evento `input` sobre `#buscador-catalogo`, sin botón de búsqueda ni recarga de la página. El render SHALL respetar el valor vigente del buscador, de modo que una nueva invocación de `Catalogo.render()` conserve el filtro aplicado.

#### Scenario: Filtrado al escribir

- **WHEN** el usuario escribe parte de un título en `#buscador-catalogo`
- **THEN** la tabla se actualiza en el mismo evento y muestra sólo los libros coincidentes

#### Scenario: Filtro conservado tras un re-render externo

- **WHEN** hay una búsqueda activa y otro módulo invoca `Catalogo.render()`
- **THEN** la tabla sigue mostrando sólo las coincidencias de esa búsqueda

### Requirement: Estados de la vista de catálogo

La vista SHALL comunicar por texto los estados «catálogo vacío», «búsqueda sin resultados» y «error de datos». Una búsqueda con texto y cero coincidencias MUST dejar `#cuerpo-tabla-catalogo` vacío y mostrar el mensaje de «sin resultados». El estado de error MUST mostrarse cuando la estructura de datos sea inválida o falte un contenedor del contrato del DOM.

#### Scenario: Búsqueda sin resultados

- **WHEN** se busca un texto que no coincide con ningún título
- **THEN** `#cuerpo-tabla-catalogo` queda sin filas y `#mensaje-catalogo-sin-resultados` muestra un texto que explica que no hubo coincidencias

#### Scenario: Catálogo sin libros

- **WHEN** `Datos.libros` está vacío
- **THEN** la tabla queda sin filas y `#mensaje-catalogo-vacio` muestra un aviso de catálogo sin libros

#### Scenario: Error de datos

- **WHEN** `Datos.libros` contiene una referencia a una editorial inexistente o una estructura inválida
- **THEN** la tabla queda sin filas y `#mensaje-catalogo-error` muestra un mensaje de error comprensible

### Requirement: Mensajes de estado mutuamente excluyentes

Los tres contenedores de mensaje del catálogo (`#mensaje-catalogo-vacio`, `#mensaje-catalogo-sin-resultados`, `#mensaje-catalogo-error`) MUST ser excluyentes: al mostrarse uno, los otros MUST quedar sin texto. Al volver a un estado con datos, los tres MUST quedar vacíos.

#### Scenario: Vuelta a una búsqueda con resultados

- **WHEN** después de una búsqueda sin resultados se borra el texto del buscador
- **THEN** el catálogo vuelve a mostrar los 6 libros y los tres contenedores de mensaje quedan sin texto

### Requirement: Intercambio de vistas con el atributo hidden

La aplicación SHALL mostrar una sola de las cinco vistas a la vez. Al cargar, la vista visible MUST ser la que indica el hash de la URL si corresponde a una vista existente, o la vista Catálogo en cualquier otro caso. Cambiar de vista MUST alternar el atributo `hidden` de cada `<section class="vista">` y MUST marcar con `aria-current="page"` únicamente el enlace del nav de la vista activa.

#### Scenario: Una sola vista visible al cargar

- **WHEN** se abre `index.html` sin hash en la URL
- **THEN** la vista Catálogo está visible y las otras cuatro secciones tienen el atributo `hidden`

#### Scenario: Cambio de vista desde el nav

- **WHEN** el usuario activa el enlace «Clientes» del nav
- **THEN** sólo la vista Clientes queda visible, la URL incluye `#vista-clientes` y ese enlace queda marcado con `aria-current="page"`

#### Scenario: Carga directa con hash

- **WHEN** se abre `index.html` con `#vista-historial` en la URL
- **THEN** la vista Historial es la única visible

#### Scenario: Hash inválido

- **WHEN** se abre `index.html` con un hash que no corresponde a ninguna vista
- **THEN** se muestra la vista Catálogo y no se ocultan todas las secciones

### Requirement: API de navegación para otros módulos

El sistema SHALL publicar `Navegacion.mostrarVista(idVista)` para que otros módulos cambien la vista activa sin simular clics. La función MUST aceptar los valores `catalogo`, `libros`, `clientes`, `ventas` e `historial` y MUST ignorar sin romper la página un valor desconocido.

#### Scenario: Cambio de vista programático

- **WHEN** se ejecuta `Navegacion.mostrarVista("ventas")` en la consola
- **THEN** la vista Ventas queda visible y las demás ocultas

#### Scenario: Valor desconocido

- **WHEN** se ejecuta `Navegacion.mostrarVista("inexistente")`
- **THEN** la vista actual no cambia, la página sigue funcionando y la consola registra el problema

### Requirement: Restricciones técnicas del módulo

El código del módulo MUST ser JavaScript nativo sin frameworks, librerías, CDN, gestores de paquetes, herramientas de build ni peticiones de red. MUST NOT contener `fetch`, `XMLHttpRequest` ni URLs absolutas. Los nombres de funciones, variables y textos de la interfaz MUST estar en español. El módulo MUST limitarse a crear `js/data.js`, `js/catalogo.js` y `js/navegacion.js`, y a agregar sus tres etiquetas `<script src>` en el bloque reservado de `index.html`.

#### Scenario: Sin recursos ni peticiones de red

- **WHEN** se busca `fetch`, `XMLHttpRequest` o `http` en los tres archivos JavaScript del módulo
- **THEN** no aparece ninguna referencia de red

#### Scenario: Alcance de archivos respetado

- **WHEN** se revisa el cambio aplicado
- **THEN** sólo se crearon los tres archivos JavaScript y las únicas líneas modificadas de `index.html` son las del bloque reservado de scripts
