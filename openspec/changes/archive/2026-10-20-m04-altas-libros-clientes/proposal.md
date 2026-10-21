# Proposal

## Why

M01 dejó en `index.html` los formularios de alta de libros y de clientes con sus listados y contenedores de mensajes, y M03 publicó el modelo de datos (`Datos.*`) y `Catalogo.render()`. Pero los formularios todavía no hacen nada: los selectores de editorial, género y autores están vacíos, el envío recarga la página y las tablas de libros y clientes registrados no muestran ningún registro.

Este change resuelve el Ejercicio 4 de la consigna (alta de libros y clientes): poblar los selectores desde los datos locales, validar cada alta antes de agregarla, mostrar errores junto al formulario y actualizar listados y selectores sin recargar. Sin este módulo, M05 no tiene forma de vender un libro o atender a un cliente recién dado de alta (CP-02 y CP-03).

## What Changes

- Se crea `js/libros.js` con el poblado de los selectores de editorial, género («Sin clasificar» como ausencia de género) y autores (selección múltiple), la validación y el alta de libros, y el listado de libros registrados.
- Se crea `js/clientes.js` con la validación y el alta de clientes y el listado de clientes registrados.
- Tras cada alta correcta se refrescan, sin recargar: el listado propio, el catálogo (`Catalogo.render()`) y el selector correspondiente de la vista Ventas (`#venta-libro` o `#venta-cliente`).
- Tras cada alta correcta se dispara el evento `datos-actualizados` sobre `document`, para que M06 persista sin que M04 dependa de `js/storage.js`.
- Se agregan dos etiquetas `<script src>` locales (`js/libros.js` y `js/clientes.js`, en ese orden y después de los scripts de M03) dentro del bloque reservado «M03-M06: scripts de la aplicación» de `index.html`. Ninguna otra línea de `index.html` se modifica.
- Se publican dos namespaces globales mínimos, `Libros` y `Clientes`, con funciones de validación puras verificables desde la consola.

## Capabilities

### New Capabilities

- `04-formularios-altas`: poblado de selectores desde los datos locales, validación de libros (título, ISBN único normalizado, precio, editorial, género opcional, autores) y de clientes (nombre, email con formato válido y único sin distinguir mayúsculas), control del envío con `preventDefault`, mensajes de error y de éxito junto al formulario, listados de libros y clientes registrados y actualización de catálogo y selectores de venta sin recargar.

### Modified Capabilities

- `03-modelo-datos-catalogo`: el escenario «Orden de carga de los scripts» del requisito «API global de datos» exigía que en el bloque reservado aparecieran **sólo** los tres scripts de M03. Ese texto describía el estado al cierre de M03 y queda incompatible con cualquier módulo posterior. Se modifica para exigir que los tres scripts de M03 vayan primero y en orden, permitiendo que M04–M06 agreguen los suyos a continuación. El resto del requisito no cambia.

## Impact

- **Archivos nuevos:** `js/libros.js`, `js/clientes.js`.
- **Archivo modificado:** `index.html`, únicamente dentro del bloque «M03-M06: scripts de la aplicación» / «FIN scripts», donde se agregan dos líneas `<script src>` después de `js/navegacion.js`.
- **Contrato consumido (M03):** `Datos.libros`, `Datos.editoriales`, `Datos.generos`, `Datos.autores`, `Datos.clientes`, `Catalogo.render()`. Se respetan los nombres de campo publicados: `autorIds` en libros y `nombre` en clientes.
- **Contrato publicado:** `Libros.validar(entrada)`, `Libros.render()`, `Clientes.validar(entrada)`, `Clientes.render()` y el evento `datos-actualizados` con `detail.coleccion` (`"libros"` o `"clientes"`).
- **Consumidores aguas abajo:** M05 encuentra `#venta-libro` y `#venta-cliente` poblados y actualizados tras cada alta; M06 escucha `datos-actualizados` para guardar en `localStorage` y, si recupera datos guardados después de la carga, puede llamar `Libros.render()` y `Clientes.render()` para redibujar listados y selectores.
- **Dependencias:** ninguna externa. Sin frameworks, sin CDN, sin npm, sin build, sin `fetch`.
- **Fuera de alcance:** edición y eliminación de libros o clientes (la consigna no lo exige), ABM de editoriales, géneros y autores, dígito de control del ISBN, persistencia en `localStorage` (M06), composición de ventas (M05) y estilos (M02).
