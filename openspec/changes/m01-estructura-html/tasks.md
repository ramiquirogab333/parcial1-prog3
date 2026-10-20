# Tasks

Todas las verificaciones son manuales en el navegador (no hay build ni tests automatizados en el proyecto). Abrir `index.html` directamente desde el sistema de archivos.

## 1. Base del documento y navegación

- [x] 1.1 Crear `index.html` con el documento base: `<!DOCTYPE html>`, `<html lang="es">` y `<head>` con `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` y `<title>` descriptivo. Verificar: abrir el archivo en el navegador, comprobar el título en la pestaña y que la consola no reporta errores.
- [x] 1.2 Agregar `<header id="cabecera">` con el `<h1>` de la aplicación y un `<p>` descriptivo. Verificar: el `<h1>` es único en el documento y se ve antes que cualquier vista.
- [x] 1.3 Agregar `<nav id="nav-principal">` con los cinco enlaces `enlace-catalogo`, `enlace-libros`, `enlace-clientes`, `enlace-ventas` y `enlace-historial`, con `href="#vista-..."` y `data-destino`. Verificar: cada `href` resuelve a un `id` existente y no hay enlaces con `href="#"`.
- [x] 1.4 Agregar `<main id="main-principal">` con las cinco secciones `vista-catalogo`, `vista-libros`, `vista-clientes`, `vista-ventas` y `vista-historial`, cada una con `data-vista` y su `<h2>`. Verificar: existen las cinco secciones, los cinco `<h2>` y ningún `id` repetido.
- [ ] 1.5 Verificar la navegación sin JavaScript: deshabilitar JavaScript en el navegador, hacer clic en cada uno de los cinco enlaces y comprobar que el documento se desplaza a la sección correspondiente.
- [x] 1.6 Agregar al final de `<head>` el bloque `<!-- M02: hojas de estilo ... -->` / `<!-- FIN M02 -->` y al final de `<body>` el bloque `<!-- M03-M06: scripts de la aplicación ... -->` / `<!-- FIN scripts -->`, ambos sólo con comentarios. Verificar: los dos bloques existen, están vacíos (ninguna etiqueta `<script>` ni `<link>` activa) y el bloque de scripts queda después de las cinco secciones.

## 2. Vista Catálogo (M03)

- [x] 2.1 Agregar el buscador: `<label for="buscador-catalogo">`, `<input type="search" id="buscador-catalogo">` y un texto de ayuda. Verificar: hacer clic sobre la etiqueta enfoca el campo y el `for` coincide con el `id` real.
- [x] 2.2 Agregar la tabla de catálogo dentro de `<div id="contenedor-tabla-catalogo" class="tabla-scroll">`, con clase `.tabla-datos`, `<thead>` de columnas Título, Autor/es, Editorial, Género y Precio, y `<tbody id="cuerpo-tabla-catalogo">` vacío. Verificar: la tabla es un `<table>` real, los encabezados están en `<thead>` con `scope="col"` y el `tbody` no tiene filas.
- [x] 2.3 Agregar los mensajes del catálogo: `mensaje-catalogo-vacio`, `mensaje-catalogo-sin-resultados` y `mensaje-catalogo-error`, vacíos y con `role="status"` o `role="alert"` según corresponda. Verificar: los tres existen, están vacíos y tienen `id` único.

## 3. Vista Libros (M04)

- [x] 3.1 Agregar `<form id="form-libro">` con los campos de título (`libro-titulo`, texto), ISBN (`libro-isbn`, texto) y precio (`libro-precio`, número con `min="0"` y `step="0.01"`), cada uno con su `<label for="...">`. Verificar: los tres controles se enfocan desde su etiqueta y no hay atributos `required` ni `pattern`.
- [x] 3.2 Agregar los selectores `libro-editorial`, `libro-genero` y `libro-autores` (`multiple`), sin opciones de datos y con una única opción inicial de tipo «Seleccione…». Verificar: los tres tienen `<label for="...">`, están vacíos de datos y `libro-autores` admite selección múltiple.
- [x] 3.3 Agregar `<button type="submit" id="btn-alta-libro">` con texto descriptivo («Dar de alta el libro») y `<p id="mensaje-libro" role="alert">` vacío. Verificar: el texto del botón describe la acción y el mensaje está vacío y asociado visualmente al formulario.
- [x] 3.4 Agregar el listado: `<div id="contenedor-tabla-libros" class="tabla-scroll">` con tabla `.tabla-datos`, `<thead>` de Título, ISBN, Editorial, Género, Autores y Precio, `<tbody id="cuerpo-tabla-libros">` vacío y `<p id="mensaje-libros-vacio" role="status">` vacío. Verificar: la estructura existe y el listado está vacío.

## 4. Vista Clientes (M04)

- [x] 4.1 Agregar `<form id="form-cliente">` con nombre completo (`cliente-nombre`, texto) y email (`cliente-email`, `type="email"`), cada uno con `<label for="...">`, más `<button type="submit" id="btn-alta-cliente">` con texto «Dar de alta el cliente» y `<p id="mensaje-cliente" role="alert">` vacío. Verificar: ambos controles se enfocan desde su etiqueta y no hay validación nativa bloqueante.
- [x] 4.2 Agregar el listado de clientes: `<div id="contenedor-tabla-clientes" class="tabla-scroll">` con tabla `.tabla-datos`, `<thead>` de Nombre completo y Email, `<tbody id="cuerpo-tabla-clientes">` vacío y `<p id="mensaje-clientes-vacio" role="status">` vacío. Verificar: la tabla existe, tiene encabezados y el `tbody` está vacío.

## 5. Vista Ventas (M05)

- [x] 5.1 Agregar los controles de composición: `venta-cliente` (`<select>` sin opciones de datos), `venta-libro` (`<select>` sin opciones de datos), `venta-cantidad` (número con `min="1"` y `step="1"`) y `<button type="button" id="btn-agregar-renglon">` con texto «Agregar el libro al ticket»; todos con su `<label for="...">`. Verificar: cada control se enfoca desde su etiqueta y los selectores no tienen datos precargados.
- [x] 5.2 Agregar el ticket: `<div id="contenedor-tabla-renglones" class="tabla-scroll">` con tabla `.tabla-datos`, `<thead>` de Libro, Precio unitario, Cantidad, Subtotal, `<tbody id="cuerpo-tabla-renglones">` vacío y `<p id="mensaje-renglones-vacio" role="status">` vacío. Verificar: la tabla existe y no tiene filas.
- [x] 5.3 Agregar el resumen: `<output id="venta-total">` con su etiqueta o texto asociado, `<button type="button" id="btn-confirmar-venta">` con texto «Confirmar la venta» y `<p id="mensaje-venta" role="alert">` vacío. Verificar: el total se muestra asociado a una etiqueta legible y el botón describe la acción.

## 6. Vista Historial (M05)

- [x] 6.1 Agregar `<div id="contenedor-tabla-historial" class="tabla-scroll">` con tabla `.tabla-datos`, `<thead>` de Fecha, Cliente, Detalle y Total, `<tbody id="cuerpo-tabla-historial">` vacío. Verificar: la tabla existe con encabezados y sin filas.
- [x] 6.2 Agregar `<p id="mensaje-historial-vacio" role="status">` y `<p id="mensaje-historial-error" role="alert">`, ambos vacíos. Verificar: existen, están vacíos y sus `id` son únicos.

## 7. Pasada semántica y de accesibilidad

- [x] 7.1 Auditar las etiquetas: recorrer todos los `<label for="...">` y comprobar que cada valor corresponde a un `id` existente y al control que describe. Verificar: no queda ningún control visible sin etiqueta ni ninguna etiqueta huérfana.
- [x] 7.2 Auditar la unicidad de identificadores: comparar la lista completa de `id` del documento con el contrato de `design.md`. Verificar: no hay duplicados y no falta ningún `id` del contrato.
- [x] 7.3 Revisar la jerarquía de encabezados: un solo `<h1>`, un `<h2>` por vista y `<h3>` para formularios y tablas dentro de cada vista. Verificar: no se salta ningún nivel en el orden del documento.
- [ ] 7.4 Revisar la navegación por teclado: recorrer la página sólo con Tab desde el inicio. Verificar: se alcanzan todos los controles en orden visual, el foco es visible con el estilo por defecto del navegador y no existe ningún `tabindex` positivo ni `role` que duplique la semántica nativa.
- [x] 7.5 Revisar los textos de los botones: leer cada `<button>` del documento. Verificar: todos están en español, ninguno dice sólo «OK», «Aceptar» o «Enviar», y cada uno describe la acción concreta.
- [x] 7.6 Revisar las restricciones técnicas en el markup: buscar etiquetas `<script>` y `<link>`, `fetch`, `axios`, `innerHTML` y URLs absolutas. Verificar: no hay recursos externos, ni peticiones de red, ni inserción de HTML, ni `style` en línea que reemplace a M02.
- [x] 7.7 Revisar la estructura semántica final: `<header>`, `<nav>`, `<main>`, cinco `<section>` y tablas con `<thead>`/`<tbody>` dentro de su contenedor `.tabla-scroll`. Verificar: cada tabla está envuelta en su contenedor con `id` propio y ningún contenedor genérico simula una tabla.

## 8. Verificación final e integración

- [x] 8.1 Verificar el alcance del change: listar los archivos modificados con `git status` y comprobar que sólo aparece `index.html` como archivo de producción. Verificar: no hay CSS, JS ni `README.md` creados por M01.
- [ ] 8.2 Verificar la navegación entre las cinco vistas: hacer clic en cada enlace del nav y comprobar que se llega a la sección correcta, que cada vista muestra sus controles y que no queda ninguna vista sin contenido.
- [x] 8.3 Verificar el aporte de M01 a CP-08: existen los 5 contenedores `.tabla-scroll` con `id` propio y ninguna tabla define anchos fijos ni `style` en línea, de modo que M02 puede aplicar `overflow-x: auto` sin tocar el markup. La medición real de desplazamiento a 320 px y 1280 px y el recorrido completo por teclado corresponden a M02 (es quien aplica CSS); la evidencia de CP-08 la registra M06 en el `README.md`.

## Workflow follow-up

- Informar a M02–M06 que el contrato de ids del DOM quedó publicado en `design.md` y que ningún `id` se renombra sin un change de M01.
- Archivar el change cuando la verificación esté completa y el equipo haya aprobado el resultado.
- M02 arranca después del archive, consumiendo las clases y los `data-*` publicados por M01.
