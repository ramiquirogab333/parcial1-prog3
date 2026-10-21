# Proposal

## Why

El Ejercicio 6 de la consigna (10 puntos) pide persistir con `localStorage` los libros, los clientes y las ventas, sembrar los ejemplos en el primer inicio, recuperarlos al reabrir **sin duplicar los datos iniciales**, y documentar en un `README` las limitaciones del almacenamiento y el resultado observado de los ocho casos de prueba manuales.

Hoy el repositorio no persiste nada: `localStorage` no aparece en ningún archivo, así que cada recarga reinicia la aplicación desde cero y se pierden los libros y clientes dados de alta por M04 y las ventas confirmadas por M05. Tampoco existe `README.md` (sólo `DEPLOY.md`). Además, la consigna pide que la comprobación del precio histórico (CP-06) la guíe el docente **editando el precio dentro del catálogo guardado en `localStorage`**, lo que obliga a que la ubicación y la estructura de lo guardado queden documentadas de forma reproducible.

## What Changes

- Nuevo `js/storage.js`: capa de persistencia sobre `localStorage` para las tres colecciones que pide la consigna — **libros, clientes y ventas**. Las editoriales, los géneros y los autores no se persisten: son catálogos de referencia que ninguna vista modifica.
- **Siembra idempotente**: en el primer inicio se escriben los ejemplos (6 libros, 3 clientes) en `localStorage`; al volver a abrir se recuperan los registros guardados y **no se vuelven a sembrar**, de modo que los datos iniciales no se duplican.
- **Guardado reactivo**: el módulo escucha el evento `datos-actualizados` que M04 y M05 ya disparan en `document`, y re-escribe las colecciones cuando cambia alguna.
- **Recuperación y redibujado al arrancar**: tras restaurar los datos se invocan `Catalogo.render()`, `Libros.render()`, `Clientes.render()`, `Historial.render()` y `Ventas.render()` para que las cinco vistas muestren los datos guardados sin recargar la página.
- **Lectura defensiva**: si un valor guardado está corrupto (JSON inválido, no es un array, o registros sin `id`), esa colección se descarta, se vuelve a la semilla y se informa en los contenedores de mensaje que M01 reservó para M06 (`#mensaje-catalogo-error` y `#mensaje-historial-error`). Si `localStorage` no está disponible o falla al escribir, la aplicación sigue funcionando con los datos en memoria.
- Nuevo `README.md`: qué es el proyecto y cómo se ejecuta, la arquitectura por módulos, una sección de persistencia que explique que el almacenamiento depende del **navegador**, del **perfil** y de la **ubicación de apertura**, y que **no comparte información entre usuarios**; la **ubicación y estructura del catálogo guardado** (claves y JSON) para que el docente pueda reproducir la comprobación guiada del CP-06; y el **registro de los ocho casos de prueba manuales con el resultado observado**, incluyendo el comportamiento real si algún caso fallara o quedara pendiente.
- `index.html`: únicamente se agrega la etiqueta `<script src="js/storage.js"></script>` al final del bloque de scripts reservado por M01.

No se modifica `style.css` ni ningún archivo JavaScript de M03, M04 o M05.

## Capabilities

### New Capabilities

- `06-persistencia-y-pruebas`: persistencia en `localStorage` de libros, clientes y ventas con siembra idempotente, recuperación sin duplicados, lectura defensiva ante datos corruptos, y la documentación del proyecto con el registro verificable de los ocho casos de prueba manuales.

### Modified Capabilities

Ninguna. La consigna no cambia el comportamiento ya especificado de los ejercicios 1 a 5: M04 y M05 ya disparan `datos-actualizados` y ya exponen `Libros.render()`, `Clientes.render()` y `Historial.render()`; M06 los consume sin modificarlos.

## Impact

- **Archivos nuevos**: `js/storage.js`, `README.md`.
- **Archivo existente con cambio mínimo**: `index.html` (una sola etiqueta `<script>`, dentro del bloque `<!-- M03-M06: scripts de la aplicación -->`).
- **Dependencias**:
  - M03 — `Datos` y sus semillas (`Datos.libros`, `Datos.clientes`), y el permiso explícito de su `design.md` para reemplazar el contenido de los arrays (`Datos.libros.length = 0` y recarga) sin que `catalogo.js` necesite cambios.
  - M04 — evento `datos-actualizados` con `detail.coleccion`, y `Libros.render()` / `Clientes.render()` para repoblar `#venta-cliente` y `#venta-libro` tras recuperar datos.
  - M05 — `Datos.ventas` (array plano y serializable), `Historial.render()`, y el "Contrato para M06" de su `design.md`.
  - M01 — los contenedores `#mensaje-catalogo-error` ("Error de lectura de datos") y `#mensaje-historial-error` ("Error al leer ventas guardadas"), reservados para este módulo.
- **Contrato público nuevo**: `Almacenamiento.cargar()`, `Almacenamiento.guardar()`, `Almacenamiento.restablecer()` y `Almacenamiento.claves()`, más las constantes de las claves `libreria.libros`, `libreria.clientes` y `libreria.ventas`.
- **Fuera de alcance**: edición o eliminación de libros, clientes o ventas desde la interfaz; alta, edición o borrado de editoriales, géneros y autores; una pantalla de edición de precios (la consigna dice explícitamente que no se exige); cualquier servidor, backend o red; sincronización entre dispositivos o usuarios; y la persistencia de datos que la aplicación nunca modifica.
