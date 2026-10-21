# Tasks

> Estado: propuesta aprobada por el usuario el 2026-10-20 con las decisiones D6 (M04 puebla los selectores de venta), D7 (evento `datos-actualizados` para M06) y D8 (sin cambio de vista tras el alta).

## 0. Preparación

- [ ] 0.1 `git pull --rebase origin main` y `git status --short` sin cambios ajenos.
- [ ] 0.2 `openspec validate --all` sin errores con este change agregado.

## 1. Archivos y carga

- [x] 1.1 Crear `js/libros.js` y `js/clientes.js` con su comentario de cabecera (propósito y dueño M04).
- [x] 1.2 Agregar `<script src="js/libros.js">` y `<script src="js/clientes.js">` después de `js/navegacion.js`, dentro del bloque reservado. Verificación: `git diff index.html` muestra sólo esas dos líneas.

## 2. Libros (`js/libros.js`)

- [x] 2.1 Poblar `#libro-editorial`, `#libro-genero` («Sin clasificar») y `#libro-autores`. Verificación: 3, 3 y 3 opciones con las semillas.
- [x] 2.2 Implementar `Libros.validar(entrada)` con las reglas de D2/D3. Verificación en consola con ISBN duplicado con guiones, precio `""`, `"0"` y `"-5"`, sin autores, editorial inexistente y género inexistente.
- [x] 2.3 Implementar el `submit` con `preventDefault`, `aria-invalid`, mensajes de D8 y alta con `siguienteId` (D4). Verificación: el primer alta genera `lib-07` con `precio` numérico.
- [x] 2.4 Renderizar `#cuerpo-tabla-libros` y `#mensaje-libros-vacio`. Verificación: 6 filas de 6 celdas, una con «Sin clasificar».
- [x] 2.5 Tras el alta: listado, `Catalogo.render()`, `#venta-libro` y evento `datos-actualizados`.

## 3. Clientes (`js/clientes.js`)

- [x] 3.1 Implementar `Clientes.validar(entrada)`. Verificación en consola con email vacío, `ana.gomez@example`, `  ANA.GOMEZ@EXAMPLE.COM ` y uno nuevo.
- [x] 3.2 Implementar el `submit` con `preventDefault`, `aria-invalid`, mensajes y alta con `cli-04`.
- [x] 3.3 Renderizar `#cuerpo-tabla-clientes` y `#mensaje-clientes-vacio`. Verificación: 3 filas de 2 celdas.
- [x] 3.4 Tras el alta: listado, `#venta-cliente` y evento `datos-actualizados`.

## 4. Verificación

- [x] 4.1 CP-02: alta con ISBN de «Rayuela» (con guiones) → rechazo; alta con ISBN nuevo → aparece en listado, catálogo y `#venta-libro`. Registrar resultado literal.
- [x] 4.2 CP-03: email inválido → rechazo; email semilla en mayúsculas → rechazo; email nuevo → aparece en listado y `#venta-cliente`. Registrar resultado literal.
- [x] 4.3 Título `<b>Prueba</b>` se muestra literal en listado y catálogo.
- [x] 4.4 La página no se recarga en ningún envío; el catálogo sigue funcionando y la consola no muestra errores.
- [x] 4.5 `grep` sobre los dos archivos: sin `innerHTML`, `fetch`, `import`, `export` ni URLs externas.

## Resultados observados (Chromium headless, `file://`, 2026-10-20)

- **Selectores:** editorial «Seleccione una editorial…», Sudamericana, Emecé; género «Sin clasificar», Narrativa, Ensayo; autores Julio Cortázar, Ernesto Sabato, Jorge Luis Borges. `#venta-libro` 7 opciones y `#venta-cliente` 4 (inicial + registros).
- **Listados iniciales:** 6 filas de 6 celdas en libros (una con «Sin clasificar») y 3 filas en clientes.
- **Formulario de libros vacío:** «No se pudo dar de alta el libro: El título es obligatorio. El ISBN es obligatorio. El precio debe ser un número mayor que cero. Seleccioná una editorial existente. Seleccioná al menos un autor.»; esos cinco controles con `aria-invalid="true"`; sin recarga; `Datos.libros.length` sigue en 6.
- **`Libros.validar` en consola:** precio `""`, `"0"`, `"-5"` y `"abc"` → mensaje de precio; `gen-99`, `edi-99` y `aut-99` → mensaje de inexistente para cada uno.
- **CP-02 parte 1:** ISBN `978-84-376 0457-2` → «No se pudo dar de alta el libro: Ya existe un libro con el ISBN 9788437604572.»; `Datos.libros.length` sigue en 6.
- **CP-02 parte 2:** título `<b>Prueba</b>`, ISBN `978-0-00-000000-1`, precio 1234.5, sin género, dos autores → «Libro «<b>Prueba</b>» dado de alta correctamente.». Guardado: `{"id":"lib-07","titulo":"<b>Prueba</b>","isbn":"9780000000001","precio":1234.5,"editorialId":"edi-02","generoId":null,"autorIds":["aut-02","aut-03"]}`. Aparece en el listado (precio `1234.50`, «Sin clasificar»), en el catálogo (buscar «prueba» → 1 fila; búsqueda vacía → 7 filas) y en `#venta-libro`. El texto se muestra literal: 0 elementos `<b>` creados. Formulario vaciado.
- **CP-03 parte 1:** `ana.gomez@example` → «No se pudo dar de alta el cliente: El formato del email no es válido (ejemplo: nombre@dominio.com).»
- **CP-03 parte 2:** `  ANA.GOMEZ@EXAMPLE.COM ` → «No se pudo dar de alta el cliente: Ya existe un cliente con el email ana.gomez@example.com.»; `Datos.clientes.length` sigue en 3.
- **CP-03 parte 3:** `Diego Ruiz` / ` Diego.Ruiz@Example.com ` → «Cliente «Diego Ruiz» dado de alta correctamente.»; guardado `{"id":"cli-04","nombre":"Diego Ruiz","email":"Diego.Ruiz@Example.com"}`; aparece en el listado y en `#venta-cliente`.
- **Evento:** cada alta correcta dispara una vez `datos-actualizados` con `coleccion` `"libros"` o `"clientes"`.
- **Consola:** sin errores. **Revisión estática:** sin `innerHTML`, `fetch`, `import`, `export` ni URLs en los dos archivos.
- **Pendiente:** correr `openspec validate --all` (la CLI no estaba disponible en el entorno donde se implementó) y repetir CP-02/CP-03 en el navegador propio antes de archivar.

## 5. Cierre

- [ ] 5.1 `openspec validate --all` sin errores.
- [x] 5.2 Commit `feat(m04): implementar alta de libros y clientes con validaciones`.
- [ ] 5.3 Avisar a M05 de D6 (selectores de venta) y a M06 del evento `datos-actualizados` y de `Libros.render()` / `Clientes.render()`.
- [ ] 5.4 `/opsx-archive m04-altas-libros-clientes` una vez verificados CP-02 y CP-03.
