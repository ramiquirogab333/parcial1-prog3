## Context

`style.css` ya trae los dos temas. Falta el comportamiento. Restricciones de AGENTS.md: JavaScript nativo, sin `innerHTML` con datos, sin librerías ni herramientas de compilación, y no se tocan archivos de otros módulos más allá de las inserciones mínimas en `index.html`.

## Decisions

1. **Archivo nuevo `js/tema.js` (no `navegacion.js`).** Evita el parpadeo (FOUC): debe ejecutarse en el `<head>` antes del primer pintado, mientras que los demás scripts van al final del `<body>`. Además mantiene la responsabilidad única: `navegacion.js` maneja las vistas.
2. **Dos fases en el mismo archivo.** Al cargar se aplica el tema de inmediato (no necesita el DOM, solo `<html>`); el botón se enlaza en `DOMContentLoaded`.
3. **`localStorage` protegido con `try/catch`**: puede lanzar error en modo privado o con el almacenamiento bloqueado.
4. **Valores `"light"` / `"dark"`** guardados en `tema-preferido`; cualquier otro valor se ignora.
5. **Botón como último `<li>` de la lista de navegación** con la clase `.boton` existente, sin CSS nuevo. Su texto y `aria-label` describen la acción siguiente.
6. **Seguimiento del sistema** con `matchMedia(...).addEventListener("change")` solo si no hay elección guardada.

## Risks / Trade-offs

- Un script bloqueante en el `<head>` retrasa mínimamente el primer pintado: es el costo de evitar el parpadeo.
- Si M06 usara `localStorage.clear()`, se perdería la preferencia.
