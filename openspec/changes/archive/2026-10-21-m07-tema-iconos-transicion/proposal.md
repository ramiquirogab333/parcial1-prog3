## Why

El botón de tema muestra texto («Tema oscuro» / «Tema claro»). Se pide que use un ícono de sol o de luna según corresponda y que el cambio entre un tema y otro sea más suave.

## What Changes

- El botón `#btn-tema` pasa a ser un botón de solo ícono: una luna (cuando el tema actual es claro, para pasar a oscuro) y un sol (cuando es oscuro, para pasar a claro), como SVG en línea sin librerías.
- Los íconos se cruzan con una animación de opacidad, giro y escala.
- Al alternar, los colores de la página hacen una transición suave (fondo, texto y bordes) durante un instante, sin afectar la carga inicial.
- Se respeta `prefers-reduced-motion`: sin animaciones para quien las desactiva.
- `js/tema.js` deja de escribir el texto del botón: solo actualiza `aria-label` y `title`, y activa la clase temporal de transición.
- Nuevo `tema.css` con los estilos del botón y las transiciones, enlazado desde `index.html`. No se modifica `style.css`.

## Capabilities

### Modified Capabilities
- `07-tema-claro-oscuro`: cambia el requisito del botón (ícono en lugar de texto) y se agrega el requisito de transición suave.

## Impact

- Archivos: `tema.css` (nuevo), `js/tema.js` y `index.html` (botón y enlace a la hoja de estilos).
- Sin cambios en la persistencia ni en la detección del tema.

## Fuera de alcance

Cambios en `style.css`, más temas y una tercera opción «Sistema».
