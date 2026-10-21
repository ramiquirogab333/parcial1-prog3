# 04-formularios-altas — Delta Specification

## Purpose

Define el alta de libros y de clientes desde los formularios de las vistas Libros y Clientes: poblado de selectores a partir de los datos locales, validaciones previas al alta, mensajes de resultado, listados de registros y actualización del catálogo y de los selectores de venta sin recargar la página.

## ADDED Requirements

### Requirement: Poblado de selectores del formulario de libros

Al cargar la página, el sistema SHALL generar las opciones de `#libro-editorial`, `#libro-genero` y `#libro-autores` a partir de `Datos.editoriales`, `Datos.generos` y `Datos.autores`, con el `id` del registro como `value` y su `nombre` como texto. El selector de editorial MUST conservar una opción inicial con `value` vacío que pida elegir una editorial. El selector de género MUST incluir una opción «Sin clasificar» con `value` vacío que represente la ausencia de género. El selector de autores MUST admitir selección múltiple y MUST NOT contener opciones con `value` vacío.

#### Scenario: Opciones generadas desde los datos

- **WHEN** se abre la vista Libros con los datos semilla
- **THEN** el selector de editorial ofrece la opción inicial más 2 editoriales, el de género ofrece «Sin clasificar» más 2 géneros y el de autores ofrece exactamente 3 autores

#### Scenario: Valores de las opciones

- **WHEN** se inspeccionan las opciones generadas
- **THEN** cada `value` es el `id` del registro correspondiente y cada texto es su `nombre`

### Requirement: Validación del alta de libros

Antes de agregar un libro, el sistema SHALL comprobar: que el título no esté vacío tras `trim()`; que el ISBN no esté vacío una vez quitados espacios y guiones; que ese ISBN normalizado no coincida con el ISBN normalizado de ningún libro existente; que el precio sea numérico, finito y mayor que cero; que la editorial exista en `Datos.editoriales`; que haya al menos un autor seleccionado y que todos existan en `Datos.autores`; y que, si se eligió un género, exista en `Datos.generos`. Cada comprobación fallida MUST producir un mensaje de texto propio. La validación MUST ser una función pura expuesta como `Libros.validar(entrada)` que devuelve un array de mensajes (vacío si es válida).

#### Scenario: ISBN existente con guiones y espacios

- **WHEN** se intenta dar de alta un libro con ISBN `978-84-376 0457-2` y el libro semilla «Rayuela» tiene ISBN `9788437604572`
- **THEN** el alta se rechaza con un mensaje que indica que el ISBN ya existe

#### Scenario: Precio inválido

- **WHEN** se intenta dar de alta un libro con precio vacío, `0` o negativo
- **THEN** el alta se rechaza con un mensaje que indica que el precio debe ser un número mayor que cero

#### Scenario: Sin autores

- **WHEN** se envía el formulario sin seleccionar ningún autor
- **THEN** el alta se rechaza con un mensaje que pide seleccionar al menos un autor

#### Scenario: Género opcional

- **WHEN** se da de alta un libro válido con «Sin clasificar» seleccionado
- **THEN** el alta se acepta y el libro guardado tiene `generoId: null`

### Requirement: Registro del libro dado de alta

Si la validación pasa, el sistema SHALL agregar a `Datos.libros` un objeto plano y serializable con la forma publicada por M03: `id` con el siguiente número disponible del prefijo `lib-` (`lib-07`, `lib-08`, …), `titulo` sin espacios exteriores, `isbn` normalizado sin espacios ni guiones, `precio` como número, `editorialId`, `generoId` (`null` si no se eligió) y `autorIds` como array de ids. Si la validación falla, `Datos.libros` MUST quedar sin cambios.

#### Scenario: Alta válida

- **WHEN** se da de alta un libro válido sobre las semillas
- **THEN** `Datos.libros` pasa a tener 7 elementos y el nuevo tiene `id` `"lib-07"` y `precio` de tipo número

#### Scenario: Alta rechazada no modifica los datos

- **WHEN** se envía el formulario con cualquier dato inválido
- **THEN** la cantidad de elementos de `Datos.libros` no cambia

### Requirement: Validación del alta de clientes

Antes de agregar un cliente, el sistema SHALL comprobar que el nombre completo no esté vacío tras `trim()`, que el email no esté vacío tras `trim()`, que tenga un formato válido (texto sin espacios, una `@`, y un dominio con al menos un punto) y que no exista otro cliente con el mismo email comparado tras `trim()` y sin distinguir mayúsculas de minúsculas. La validación MUST ser una función pura expuesta como `Clientes.validar(entrada)` que devuelve un array de mensajes.

#### Scenario: Email con formato inválido

- **WHEN** se intenta dar de alta un cliente con email `ana.gomez@example`
- **THEN** el alta se rechaza con un mensaje que indica que el formato del email no es válido

#### Scenario: Email existente en mayúsculas

- **WHEN** se intenta dar de alta un cliente con email `  ANA.GOMEZ@EXAMPLE.COM ` y existe el cliente semilla con `ana.gomez@example.com`
- **THEN** el alta se rechaza con un mensaje que indica que ya existe un cliente con ese email

### Requirement: Registro del cliente dado de alta

Si la validación pasa, el sistema SHALL agregar a `Datos.clientes` un objeto plano con `id` con el siguiente número disponible del prefijo `cli-`, `nombre` y `email` sin espacios exteriores. Si la validación falla, `Datos.clientes` MUST quedar sin cambios.

#### Scenario: Alta válida de cliente

- **WHEN** se da de alta un cliente válido sobre las semillas
- **THEN** `Datos.clientes` pasa a tener 4 elementos y el nuevo tiene `id` `"cli-04"`

### Requirement: Control del envío y mensajes de resultado

Los formularios `#form-libro` y `#form-cliente` SHALL interceptar el evento `submit` con `preventDefault()`, de modo que la página nunca se recargue. Los mensajes MUST mostrarse como texto en `#mensaje-libro` y `#mensaje-cliente`: ante un rechazo, todos los motivos precedidos por un texto que indique que el alta no se realizó; ante un éxito, un texto que lo confirme. El tipo de resultado MUST expresarse con texto y no sólo con color. Los campos con error MUST marcarse con `aria-invalid="true"`, que se retira al volver a enviar. Tras un alta correcta el formulario MUST vaciarse.

#### Scenario: Envío sin recarga

- **WHEN** se envía cualquiera de los dos formularios, válido o no
- **THEN** la URL y el estado de la página se conservan y no hay recarga

#### Scenario: Mensaje de rechazo con todos los motivos

- **WHEN** se envía el formulario de libros completamente vacío
- **THEN** `#mensaje-libro` muestra un texto de rechazo con los motivos de título, ISBN, precio, editorial y autores

### Requirement: Listados de libros y clientes registrados

El sistema SHALL renderizar `#cuerpo-tabla-libros` con una fila por libro (Título, ISBN, Editorial, Género, Autores, Precio con dos decimales, «Sin clasificar» si no tiene género) y `#cuerpo-tabla-clientes` con una fila por cliente (Nombre completo, Email). Si una colección está vacía, el contenedor `#mensaje-libros-vacio` o `#mensaje-clientes-vacio` MUST mostrar un mensaje de lista vacía. Los datos MUST insertarse con `textContent` sobre nodos creados con `document.createElement`.

#### Scenario: Listado inicial

- **WHEN** se abren las vistas Libros y Clientes con las semillas
- **THEN** la tabla de libros tiene 6 filas de 6 celdas y la de clientes 3 filas de 2 celdas

#### Scenario: Texto ingresado se muestra literal

- **WHEN** se da de alta un libro con título `<b>Prueba</b>`
- **THEN** la celda muestra el texto `<b>Prueba</b>` literal y no se crea ningún elemento `<b>`

### Requirement: Actualización sin recargar tras un alta

Tras un alta correcta de libro, el sistema SHALL redibujar el listado de libros, llamar `Catalogo.render()` y regenerar las opciones de `#venta-libro`. Tras un alta correcta de cliente, SHALL redibujar el listado de clientes y regenerar las opciones de `#venta-cliente`. En ambos casos MUST dispararse sobre `document` un `CustomEvent` llamado `datos-actualizados` con `detail.coleccion` igual a `"libros"` o `"clientes"`.

#### Scenario: Libro nuevo visible en catálogo y venta (CP-02)

- **WHEN** se da de alta un libro con ISBN nuevo
- **THEN** aparece en el listado de libros, en la tabla del catálogo y como opción de `#venta-libro`, sin recargar

#### Scenario: Cliente nuevo visible en listado y venta (CP-03)

- **WHEN** se da de alta un cliente con email nuevo
- **THEN** aparece en el listado de clientes y como opción de `#venta-cliente`, sin recargar

### Requirement: Restricciones técnicas del módulo

`js/libros.js` y `js/clientes.js` MUST usar sólo JavaScript nativo, sin frameworks, librerías, CDN, módulos ES, `fetch` ni `innerHTML` con datos. MUST cargarse con etiquetas `<script src>` locales después de los tres scripts de M03, en el orden `js/libros.js`, `js/clientes.js`.

#### Scenario: Revisión estática

- **WHEN** se buscan `innerHTML`, `fetch`, `import`, `export` y URLs externas en los dos archivos
- **THEN** no hay coincidencias
