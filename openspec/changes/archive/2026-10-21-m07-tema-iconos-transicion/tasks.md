## 1. Estilos

- [x] 1.1 Crear `tema.css` con el botón circular, los dos íconos apilados, el cruce animado y `prefers-reduced-motion`
- [x] 1.2 Agregar la transición de colores bajo la clase temporal `tema-transicion`

## 2. Comportamiento y marcado

- [x] 2.1 Actualizar `js/tema.js`: sin texto en el botón, `aria-label` y `title`, y clase temporal de transición al alternar
- [x] 2.2 Cambiar el botón de `index.html` a solo íconos SVG y enlazar `tema.css`
- [x] 2.3 Ejecutar `openspec validate --all`

## 3. Verificación

- [x] 3.1 Luna en tema claro y sol en oscuro; `aria-label` correcto en cada caso
- [x] 3.2 La transición solo ocurre al pulsar, no al cargar; sin movimiento con `prefers-reduced-motion`
- [x] 3.3 Sin errores en consola; foco visible, teclado y 320 px
