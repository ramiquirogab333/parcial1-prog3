## 1. Script del tema

- [x] 1.1 Crear `js/tema.js` con lectura/escritura protegida de `tema-preferido`, preferencia del sistema y `aplicar` (clases y `data-theme`)
- [x] 1.2 Agregar `alternar`, actualización del botón y seguimiento del sistema

## 2. Integración

- [x] 2.1 Agregar `<script src="js/tema.js">` en el `<head>` de `index.html`, sin `defer`
- [x] 2.2 Agregar el botón `#btn-tema` como último `<li>` de la navegación
- [x] 2.3 Ejecutar `openspec validate --all`

## 3. Verificación

- [x] 3.1 Sin clave guardada, el tema sigue al sistema
- [x] 3.2 Alternar cambia tema, texto y `aria-label`; recargar mantiene la elección
- [x] 3.3 Sin errores en consola y botón usable con teclado y a 320 px
