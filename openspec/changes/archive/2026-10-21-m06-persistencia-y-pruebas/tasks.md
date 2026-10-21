# Tasks

## 1. Capa de persistencia — `js/storage.js`

- [x] 1.1 Crear `js/storage.js` con el esqueleto del módulo (`var Almacenamiento = (function () { "use strict"; … })();`), las constantes `CLAVES = { libros: "libreria.libros", clientes: "libreria.clientes", ventas: "libreria.ventas" }` y el helper `almacen()` que devuelve `null` cuando `window.localStorage` no está accesible. Verificación: el archivo existe, `node --check js/storage.js` no reporta errores de sintaxis y `Almacenamiento.claves()` devuelve las tres claves.
- [x] 1.2 Implementar `leer(clave)` y `escribir(clave, valor)` envueltos en `try/catch`, con `JSON.parse` protegido y `JSON.stringify` para el valor. Verificación: con un `localStorage` simulado, `leer` devuelve `null` ante una clave ausente y ante JSON inválido, y `escribir` no lanza cuando la cuota está agotada.
- [x] 1.3 Implementar los validadores estructurales de las tres colecciones según la tabla de la decisión D5 del `design.md` (libros, clientes y ventas, con la comprobación de los campos de cada renglón de venta). Verificación: un libro sin `precio` numérico, un cliente sin `email` y una venta sin `renglones` son rechazados por su validador; un libro, un cliente y una venta completos son aceptados.
- [x] 1.4 Implementar la siembra idempotente y la restauración in-place: para cada colección, si la clave no existe se escribe la semilla; si existe se valida y, si es válida, se restaura sobre el mismo array con `length = 0` y agregado secuencial (sin reasignar la referencia). Verificación: tras dos cargas consecutivas sobre el mismo almacenamiento, la cantidad de libros y de clientes es idéntica y no hay ningún registro repetido.
- [x] 1.5 Implementar la normalización del precio (D6): si el `precio` de un libro restaurado llega como texto numérico, convertirlo a número antes de validarlo. Verificación: un libro guardado con `"precio": "1500"` se restaura con `precio === 1500` (número) y el resto del catálogo sigue validando.
- [x] 1.6 Implementar el guardado reactivo: registrar `document.addEventListener("datos-actualizados", …)` y, ante cualquier disparo, re-escribir las tres colecciones con `guardar()`. Verificación: tras disparar el evento con `detail.coleccion = "ventas"`, las tres claves de `localStorage` quedan escritas y actualizadas.
- [x] 1.7 Implementar el redibujado posterior a la restauración: invocar `Catalogo.render()`, `Libros.render()`, `Clientes.render()`, `Historial.render()` y `Ventas.render()`, cada llamada protegida con `typeof X !== "undefined"`. Verificación: tras cargar con un libro y un cliente guardados que no están entre los ejemplos, `#venta-libro` y `#venta-cliente` los ofrecen y `#cuerpo-tabla-historial` muestra la venta recuperada.
- [x] 1.8 Implementar los avisos: escribir el mensaje de error de lectura en `#mensaje-catalogo-error` (libros y clientes) y en `#mensaje-historial-error` (ventas), **después** de los renders, con texto descriptivo. Verificación: con una clave guardada corrupta, el mensaje queda visible después de que `Catalogo.render()` haya terminado y la aplicación sigue operativa con la semilla repuesta.
- [x] 1.9 Implementar `restablecer()`: borrar las tres claves y volver a sembrar desde `Datos`. Verificación: tras `Almacenamiento.restablecer()` el almacenamiento queda con las tres claves y los conteos de ejemplos de partida.
- [x] 1.10 Implementar `iniciar()` con guarda de idempotencia (`iniciado`), la carga inicial, el registro del listener y el aviso por consola del estado. Verificación: `Almacenamiento.iniciar()` se puede invocar dos veces sin duplicar la siembra ni los registros.

## 2. Integración con la aplicación

- [x] 2.1 Agregar en `index.html`, dentro del bloque `<!-- M03-M06: scripts de la aplicación -->` y después de `<script src="js/historial.js"></script>`, la línea `<script src="js/storage.js"></script>`. Verificación: `git diff index.html` muestra exactamente una línea agregada y ninguna modificada.
- [x] 2.2 Confirmar que no se tocó ningún archivo de otro módulo. Verificación: `git status --short` sólo lista `js/storage.js`, `README.md`, `index.html` y `openspec/`.

## 3. Arnés de verificación en navegador real

- [x] 3.1 Escribir el arnés de control por el DevTools Protocol en la carpeta temporal del entorno (fuera del repositorio), usando el `WebSocket` nativo de Node y Chrome o Edge headless con `--remote-debugging-port`. Debe permitir: navegar a una URL, ejecutar JavaScript en la página, leer y escribir `localStorage`, y recargar. Verificación: el arnés abre `index.html` y devuelve por consola el título de la página.
- [x] 3.2 Preparar el arnés para trabajar sobre una **copia de prueba** del proyecto (copia de la carpeta en la carpeta temporal), tal como pide la consigna para el CP-06, y para dejar el almacenamiento limpio entre casos (`localStorage.clear()`). Verificación: la copia carga y `localStorage` queda vacío al empezar.

## 4. Verificación de los ocho casos de prueba

- [x] 4.1 Ejecutar el **CP-01** (búsqueda con una parte del título en mayúsculas; luego búsqueda vacía y texto inexistente) sobre la copia de prueba. Verificación: se registra en la bitácora la cantidad de filas de la tabla del catálogo y el texto de `#mensaje-catalogo-sin-resultados` en cada uno de los tres pasos.
- [x] 4.2 Ejecutar el **CP-02** (alta de libro con ISBN existente y luego con ISBN nuevo). Verificación: se registra el texto de `#mensaje-libro` en ambos intentos y la presencia del libro nuevo en `#cuerpo-tabla-catalogo` y en `#venta-libro`.
- [x] 4.3 Ejecutar el **CP-03** (alta de cliente con email inválido, email existente en mayúsculas y email nuevo). Verificación: se registra el texto de `#mensaje-cliente` en los tres intentos y la presencia del cliente nuevo en `#cuerpo-tabla-clientes` y en `#venta-cliente`.
- [x] 4.4 Ejecutar el **CP-04** (venta sin cliente, cantidad cero, negativa o decimal; libro repetido). Verificación: se registra el texto de `#mensaje-venta` en cada intento y la cantidad de filas de `#cuerpo-tabla-renglones` (debe quedar en 1 con el duplicado).
- [x] 4.5 Ejecutar el **CP-05** (venta válida: dos unidades a 1500 y una a 2000). Verificación: se registran los subtotales de los dos renglones, el total de `#venta-total` y las filas del historial.
- [x] 4.6 Ejecutar el **CP-06** de forma guiada: confirmar una venta y anotar sus importes; modificar **únicamente** el `precio` del libro dentro de `libreria.libros` con las herramientas de almacenamiento, sin modificar ni borrar `libreria.ventas`; recargar y consultar el detalle de la venta anterior. Verificación: se registra el precio del catálogo antes y después del cambio y el precio unitario, los subtotales y el total de la venta en el historial después de recargar.
- [x] 4.7 Ejecutar el **CP-07** (recarga después de altas y venta). Verificación: se registran los conteos de libros, clientes y ventas antes y después de recargar, y se comprueba que no hay identificadores repetidos.
- [x] 4.8 Ejecutar el **CP-08** (navegación por teclado y anchos de 320 px y 1280 px). Verificación: se registra el `scrollWidth` frente al `clientWidth` del documento a 320 px y a 1280 px, la presencia de foco visible y el desplazamiento interno de las tablas; se contrasta con el acta de CP-08 de M02 (`acta-cp08.md`).
- [x] 4.9 Ejecutar los casos de robustez: clave con JSON inválido, clave que no es un array y almacenamiento no disponible. Verificación: la aplicación carga en los tres escenarios, se muestra el mensaje de texto correspondiente y no hay excepciones en la consola.

## 5. `README.md`

- [x] 5.1 Redactar la sección de descripción del proyecto, la de cómo ejecutarlo (abrir `index.html` en el navegador; sin build, sin dependencias, sin red) y la de arquitectura por módulos con el archivo de cada uno y su responsabilidad. Verificación: el `README` nombra los seis módulos y sus archivos.
- [x] 5.2 Redactar la sección de persistencia: las tres claves, qué guarda cada una, cuándo se escribe, cómo se comporta la siembra inicial y cómo restablecer el estado. Verificación: la sección incluye un ejemplo real del JSON guardado.
- [x] 5.3 Redactar la sección de limitaciones del almacenamiento: dependencia del navegador, del perfil y de la ubicación de apertura, y que la información no se comparte entre usuarios. Verificación: las cuatro condiciones aparecen explícitamente.
- [x] 5.4 Redactar la sección con la ubicación y la estructura del catálogo guardado, para que el docente pueda reproducir la comprobación guiada del CP-06: nombre exacto de la clave, ejemplo del JSON de un libro y el paso a paso de la edición con las herramientas de almacenamiento del navegador. Verificación: siguiendo el paso a paso del `README` se llega a la clave y se distingue dónde está el precio.
- [x] 5.5 Registrar los ocho casos de prueba con los pasos ejecutados, el resultado esperado de la consigna, el **resultado observado** en la ejecución real, la evidencia (archivo y línea, o salida de la ejecución) y el estado. Verificación: los ocho casos aparecen con resultado observado; ninguno está marcado como aprobado si no se ejecutó.
- [x] 5.6 Registrar el comportamiento real de cualquier caso fallido o funcionalidad pendiente, en vez de omitirlo o declararlo aprobado. Verificación: si algún caso no se cumple, el `README` lo dice con su comportamiento real.
- [x] 5.7 Anotar en el `README` las limitaciones conocidas y el alcance, y verificar que no contradice el código. Verificación: se relee el `README` contra `js/storage.js` y los nombres de clave, de campos y de función coinciden.

## 6. Cierre técnico

- [x] 6.1 Ejecutar `openspec validate --all` y confirmar que pasa sin errores. Verificación: el comando termina con `0 failed`.
- [x] 6.2 Confirmar que el repositorio no tiene errores de sintaxis en los archivos JavaScript. Verificación: `node --check` pasa sobre `js/data.js`, `js/catalogo.js`, `js/navegacion.js`, `js/libros.js`, `js/clientes.js`, `js/ventas.js`, `js/historial.js` y `js/storage.js`.
- [x] 6.3 Revisar el diff completo contra `main` y confirmar que sólo se agregaron archivos nuevos más la línea de `<script>` en `index.html`. Verificación: `git diff main --stat` coincide con lo esperado y `git diff main -- index.html` muestra una única línea agregada.

## Workflow follow-up

- Sincronizar las delta specs con `/opsx-sync m06-persistencia-y-pruebas` y archivar el change con `/opsx-archive m06-persistencia-y-pruebas` cuando la implementación y las ocho verificaciones estén cerradas.
- Confirmar que `openspec/specs/06-persistencia-y-pruebas/spec.md` queda creado con su `## Purpose` y que `openspec validate --all` sigue pasando después del archivado.
- Commit con mensajes del Conventional Commits en español: `feat(m06): agregar persistencia en localStorage de libros, clientes y ventas` y `docs(m06): registrar en README el resultado observado de los ocho casos de prueba`.
