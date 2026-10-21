# Tasks

> Estado: propuesta pendiente de aprobación. No se escribe código hasta que se apruebe.

## 0. Preparación

- [ ] 0.1 `git pull --rebase origin main` y `git status --short` sin cambios ajenos.
- [ ] 0.2 `openspec validate --all` sin errores con este change agregado.

## 1. Archivos y carga

- [ ] 1.1 Crear `js/libros.js` y `js/clientes.js` con su comentario de cabecera (propósito y dueño M04).
- [ ] 1.2 Agregar `<script src="js/libros.js">` y `<script src="js/clientes.js">` después de `js/navegacion.js`, dentro del bloque reservado. Verificación: `git diff index.html` muestra sólo esas dos líneas.

## 2. Libros (`js/libros.js`)

- [ ] 2.1 Poblar `#libro-editorial`, `#libro-genero` («Sin clasificar») y `#libro-autores`. Verificación: 3, 3 y 3 opciones con las semillas.
- [ ] 2.2 Implementar `Libros.validar(entrada)` con las reglas de D2/D3. Verificación en consola con ISBN duplicado con guiones, precio `""`, `"0"` y `"-5"`, sin autores, editorial inexistente y género inexistente.
- [ ] 2.3 Implementar el `submit` con `preventDefault`, `aria-invalid`, mensajes de D8 y alta con `siguienteId` (D4). Verificación: el primer alta genera `lib-07` con `precio` numérico.
- [ ] 2.4 Renderizar `#cuerpo-tabla-libros` y `#mensaje-libros-vacio`. Verificación: 6 filas de 6 celdas, una con «Sin clasificar».
- [ ] 2.5 Tras el alta: listado, `Catalogo.render()`, `#venta-libro` y evento `datos-actualizados`.

## 3. Clientes (`js/clientes.js`)

- [ ] 3.1 Implementar `Clientes.validar(entrada)`. Verificación en consola con email vacío, `ana.gomez@example`, `  ANA.GOMEZ@EXAMPLE.COM ` y uno nuevo.
- [ ] 3.2 Implementar el `submit` con `preventDefault`, `aria-invalid`, mensajes y alta con `cli-04`.
- [ ] 3.3 Renderizar `#cuerpo-tabla-clientes` y `#mensaje-clientes-vacio`. Verificación: 3 filas de 2 celdas.
- [ ] 3.4 Tras el alta: listado, `#venta-cliente` y evento `datos-actualizados`.

## 4. Verificación

- [ ] 4.1 CP-02: alta con ISBN de «Rayuela» (con guiones) → rechazo; alta con ISBN nuevo → aparece en listado, catálogo y `#venta-libro`. Registrar resultado literal.
- [ ] 4.2 CP-03: email inválido → rechazo; email semilla en mayúsculas → rechazo; email nuevo → aparece en listado y `#venta-cliente`. Registrar resultado literal.
- [ ] 4.3 Título `<b>Prueba</b>` se muestra literal en listado y catálogo.
- [ ] 4.4 La página no se recarga en ningún envío; el catálogo sigue funcionando y la consola no muestra errores.
- [ ] 4.5 `grep` sobre los dos archivos: sin `innerHTML`, `fetch`, `import`, `export` ni URLs externas.

## 5. Cierre

- [ ] 5.1 `openspec validate --all` sin errores.
- [ ] 5.2 Commit `feat(m04): implementar alta de libros y clientes con validaciones`.
- [ ] 5.3 Avisar a M05 de D6 (selectores de venta) y a M06 del evento `datos-actualizados` y de `Libros.render()` / `Clientes.render()`.
- [ ] 5.4 `/opsx-archive m04-altas-libros-clientes` una vez verificados CP-02 y CP-03.
