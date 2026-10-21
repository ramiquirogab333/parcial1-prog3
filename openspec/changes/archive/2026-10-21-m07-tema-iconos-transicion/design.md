## Context

El botón de tema existe y funciona (`js/tema.js`, `#btn-tema` en la navbar). Se cambia su presentación a íconos y se suaviza el cambio. `style.css` no se toca: los estilos nuevos van en `tema.css`.

## Decisions

1. **Íconos como SVG en línea escritos en `index.html`**, ambos dentro del botón y con `aria-hidden="true"`. Evita `innerHTML` y archivos de imagen. El CSS decide cuál se ve según `:root[data-theme]`, así el ícono correcto aparece desde el primer pintado.
2. **Luna visible por defecto; el sol solo con `data-theme="dark"`.** El ícono muestra el tema al que se pasará, igual que el texto anterior.
3. **Cruce animado** con `opacity`, `rotate` y `scale` (`transform`), que se resuelven en la GPU y no provocan reflujo. Los dos SVG se apilan con posición absoluta dentro del botón.
4. **Transición de colores con clase temporal `tema-transicion` en `<html>`**: `tema.js` la agrega al alternar y la quita a los ~500 ms. Así la transición no ocurre en la carga y no pisa los efectos `:hover` y `:active` el resto del tiempo.
5. **`prefers-reduced-motion: reduce`** anula ambas animaciones.
6. **Accesibilidad:** sin texto visible, `aria-label` y `title` describen la acción; el botón mantiene `min-height` de `.boton` (2.75 rem) como área táctil y el foco visible global.
7. **Nuevo `tema.css`** en la raíz, junto a `style.css`, enlazado después de este en el `<head>`.

## Risks / Trade-offs

- La regla `html.tema-transicion *` se aplica por poco tiempo a todos los elementos; el costo es mínimo.
- `style.css` tiene una regla global `svg { height: auto; max-width: 100% }`: los SVG del botón fijan `width` y `height` con una clase propia, que tiene mayor especificidad.
