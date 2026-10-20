# Proposal

## Why

El frontend de la librería (Parcial 1 de Programación III) se evalúa en 6 ejercicios y hoy el repositorio no tiene ninguna página: no existe `index.html`. El Ejercicio 1 —M01— es el cimiento de los otros cinco módulos, porque define el único archivo que todos los demás van a manipular con JavaScript. Sin un maquetado HTML semántico, con las 5 vistas, los controles etiquetados y los contenedores de mensajes, los módulos M02 a M06 no tienen dónde anclarse ni un contrato de `id` estable que respetar.

## What Changes

- Se crea `index.html` como única página de la aplicación: una SPA de un solo archivo, ejecutada 100% en el navegador, sin servidor ni backend.
- Se maquetan las **5 vistas** como elementos `<section>` dentro de la misma página (Catálogo, Libros, Clientes, Ventas, Historial), con navegación por anclas `<a href="#...">` que funciona desde el primer commit sin JavaScript.
- Se incorporan los **formularios completos** de alta de libro, alta de cliente y venta simulada, más el buscador del catálogo y las tablas de libros, clientes, renglones de venta e historial. M01 es dueño del markup; M04 y M05 sólo escribirán la lógica.
- Se incorporan los **contenedores de mensajes** de estado: listado vacío, búsqueda sin resultados y alertas de error.
- Se define un **contrato de `id` del DOM** estable para todos los elementos que los módulos posteriores van a consultar o modificar.
- Se respetan de forma explícita las restricciones técnicas absolutas del proyecto:
  - Sin frameworks ni librerías (nada de React, Vue, Angular, jQuery, Bootstrap ni Tailwind).
  - Sin CDNs ni recursos externos: ninguna etiqueta que apunte a un servidor de terceros.
  - Sin build tools ni gestores de paquetes.
  - Sin peticiones de red: no se usa `fetch()` ni `axios`.
  - Sin inserción insegura de HTML: prohibido `innerHTML` con datos ingresados por el usuario.

No hay cambios disruptivos (**BREAKING**): el repositorio no tiene código de producción previo.

## Capabilities

### New Capabilities
- `01-estructura-html`: estructura semántica de la página, navegación entre las 5 vistas, controles etiquetados, contenedores de mensajes de estado y contrato de `id` del DOM que consumen los módulos posteriores.

### Modified Capabilities
<!-- Ninguna: el proyecto no tiene specs previas. -->

## Impact

- **Archivos afectados:** `index.html` (nuevo y único archivo de este change).
- **Consumidores del contrato:** `css/*.css` (M02), `js/data.js` y `js/catalogo.js` (M03), `js/libros.js` y `js/clientes.js` (M04), `js/ventas.js` y `js/historial.js` (M05), `js/storage.js` (M06).
- **Dependencias técnicas:** ninguna. No se agregan librerías, ni archivos descargados, ni herramientas de build.
- **Sistemas externos:** ninguno. La aplicación no hace peticiones de red.
- **Riesgo principal:** que los `id` del contrato cambien después y rompan a los módulos que dependen de ellos; se degrada publicando el contrato en `design.md` y considerándolo estable.

## Fuera de Alcance

- **M02** — estilos, identidad visual, responsividad a 320 px y 1280 px, foco visible con `:focus-visible`.
- **M03** — datos semilla, renderizado del catálogo, carga de selectores y buscador por título.
- **M04** — validaciones de alta de libros y clientes (ISBN único, email válido y único).
- **M05** — composición de la venta, cálculo de subtotales y totales, inmutabilidad del precio histórico.
- **M06** — `localStorage`, carga inicial de semillas y `README.md` con los 8 casos de prueba.

Este change no incluye lógica de comportamiento ni hojas de estilo: sólo entrega el esqueleto HTML y su contrato.
