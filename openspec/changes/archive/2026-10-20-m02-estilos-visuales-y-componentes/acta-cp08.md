# Acta de verificación CP-08 — M02 (estilos y componentes)

**Change:** `m02-estilos-visuales-y-componentes`
**Caso de prueba:** CP-08 (sección 5 de `AGENTS.md`: navegación por teclado y anchos de 320 px / 1280 px).
**Método:** verificación por **análisis estático** de `style.css` (517 líneas) e `index.html`, derivando cada magnitud de los tokens `rem` declarados en `:root` y de las reglas de layout, tablas, controles y foco. No requiere ejecución en navegador para las magnitudes numéricas; los puntos subjetivos se marcan como verificación manual recomendada.
**Autoridad:** el agente orquestador M02. **Destinatario:** M06, para registrar la evidencia en el `README.md`.

> Base de conversión: `rem → px` con raíz en `16 px` (`1rem = 16 px`). A raíz `20 px` todos los valores `rem` escalan ×1.25, mientras que los trazos declarados en `px` (bordes y anillo de foco) permanecen constantes por diseño (spec 02, Requirement «Unidades relativas…»).

---

## 1. Checklist CP-08

| # | Ítem del CP-08 | Resultado | Evidencia (archivo:línea) |
| --- | --- | --- | --- |
| 1 | 320 px: sin scroll horizontal global, textos y controles alcanzables | CUMPLE (estático) | `style.css:154` contenedor `min(100% - 2rem, 73.75rem)`; `:403` `.tabla-scroll { overflow-x: auto }`; `:236,:262` `display: grid; min-width: 0` en `.vista`/`.tarjeta`; `:434` `overflow-wrap: anywhere` en `td` |
| 2 | 1280 px: contenido centrado, tablas completas, sin scroll horizontal | CUMPLE (estático) | `style.css:154-155` `margin-inline: auto` (1280 → main 1180 px centrado); tabla `38.75rem` = 620 px entra en 1180 px |
| 3 | Teclado: se recorren todos los controles en orden visual | CUMPLE (estático) | `index.html` — 5 enlaces nav (`data-destino`), inputs/selects de Libros y Clientes, 3 controles + 2 botones en Ventas; sin `tabindex` positivo (M01), el orden DOM = orden visual |
| 4 | Foco visible (2 px + offset) en claro y oscuro | CUMPLE (estático) | `style.css:469-475` `outline: 2px solid var(--color-primary); outline-offset: 2px` para `a[href]`, `button`, `input`, `select`; `--color-primary` cambia por tema (`:46` claro / `:91,:110` oscuro) |
| 5 | Tablas con desplazamiento dentro de su contenedor | CUMPLE (estático) | `style.css:400-407` `.tabla-scroll` con `overflow-x: auto`, `max-width: 100%`, `min-width: 0`; `:409-411` `.tabla-datos { width: 100%; min-width: 38.75rem }` (620 px > 320 px → desborda solo dentro) |
| 6 | Mensajes de error con texto, no solo color | CUMPLE (estático) | `index.html:59,241` `#mensaje-catalogo-error` / `#mensaje-historial-error` con texto + `role="alert"`; `style.css:456-462` `.mensaje--error` con borde de acento 3 px, no solo color |

**Conclusión:** los 6 ítems del CP-08 **se cumplen** según el CSS y el markup. No se detectó ningún valor que incumpla la spec.

---

## 2. Medición estática — raíz 16 px (tarea 12.5)

| Magnitud | Regla CSS | Valor `rem` | Computado (16 px) | Requisito | Veredicto |
| --- | --- | --- | --- | --- | --- |
| `--radius-sm` | `style.css:61` | `0.5rem` | **8 px** | 8 px | CUMPLE |
| `--radius-md` | `:62` | `0.75rem` | **12 px** | 12 px | CUMPLE |
| `--radius-lg` | `:63` | `1.25rem` | **20 px** | 20 px | CUMPLE |
| `--space-xs` | `:73` | `0.25rem` | 4 px | 4 px | CUMPLE |
| `--space-sm` | `:74` | `0.5rem` | 8 px | 8 px | CUMPLE |
| `--space-md` | `:75` | `1rem` | 16 px | 16 px | CUMPLE |
| `--space-lg` | `:76` | `1.5rem` | **24 px** | 24 px | CUMPLE |
| `--space-xl` | `:77` | `2.5rem` | **40 px** | 40 px | CUMPLE |
| `rowGap` de `#main-principal` | `:232` `gap: var(--space-xl)` | 2.5rem | **40 px** | = 40 px | CUMPLE |
| hueco entre `.vista` consecutivas | `#main-principal` rowGap | 2.5rem | **≥ 40 px** | ≥ 40 px | CUMPLE |
| `rowGap` interno de `.vista` | `:238` `gap: var(--space-lg)` | 1.5rem | **24 px** | = 24 px | CUMPLE |
| `min-height` de `input`/`select` | `:309` | `2.75rem` | **44 px** | ≥ 44 px | CUMPLE |
| `min-height` de `.boton` | `:350` | `2.75rem` | **44 px** | ≥ 44 px | CUMPLE |
| `min-width` de `.tabla-datos` | `:411` | `38.75rem` | **620 px** | desborda a 320 | CUMPLE |
| ancho del contenedor (1280 px) | `:154` `min(100% - 2rem, 73.75rem)` | — | **1180 px** centrado | centrado | CUMPLE |
| anillo de foco `outline` | `:473` | `2px` (px) | **2 px** | 2 px | CUMPLE |
| `outline-offset` | `:474` | `2px` (px) | **2 px** | 2 px | CUMPLE |

**Sin scroll horizontal global**
- A **320 px**: el contenedor es `min(320 - 32, 1180) = 288 px`; las tablas desbordan 620 px **dentro** de `.tabla-scroll` (`overflow-x: auto`), que a su vez está limitado por `max-width: 100%` + `min-width: 0`. El `min-width: 0` en `.vista` (`:239`) y `.tarjeta` (`:265`) evita que los hijos grid fuercen el ancho. → `scrollWidth <= clientWidth` esperado. **CUMPLE (derivado).**
- A **1280 px**: el contenedor es `min(1248, 1180) = 1180 px`, centrado; la tabla (620 px) entra completa. → sin scroll global. **CUMPLE (derivado).**

> Nota: la confirmación empírica de `document.documentElement.scrollWidth <= clientWidth` requiere abrir la página en un navegador. La derivación estática no encuentra ningún elemento con ancho fijo > 320 px fuera de un contenedor con `overflow` ni márgenes/posicionamiento que desborden.

---

## 3. Medición estática — raíz 20 px (tarea 12.6)

Escalado ×1.25 sobre todos los valores `rem`; los trazos en `px` no cambian.

| Magnitud | Valor 16 px | Valor 20 px | Esperado ×1.25 | Veredicto |
| --- | --- | --- | --- | --- |
| hueco entre secciones (`--space-xl`) | 40 px | **50 px** | 50 px | CUMPLE |
| `rowGap` interno de `.vista` (`--space-lg`) | 24 px | **30 px** | 30 px | CUMPLE |
| controles (`2.75rem`) | 44 px | **55 px** | 55 px | CUMPLE |
| `--radius-sm` | 8 px | **10 px** | 10 px | CUMPLE |
| `--radius-md` | 12 px | **15 px** | 15 px | CUMPLE |
| `--radius-lg` | 20 px | **25 px** | 25 px | CUMPLE |
| `min-width` de `.tabla-datos` | 620 px | **775 px** | 775 px | CUMPLE |
| ancho del contenedor (`73.75rem`) | 1180 px | **1475 px** (limitado por viewport en 1280) | 1475 px | CUMPLE |
| anillo de foco (`outline`) | 2 px | **2 px** | constante (px) | CUMPLE |
| `outline-offset` | 2 px | **2 px** | constante (px) | CUMPLE |

**Sin scroll horizontal a 320 y 1280 con raíz 20 px:** el contenedor pasa a `min(100% - 2.5rem, 92.1875rem)`; a 320 px son `320 - 40 = 280 px`, la tabla (775 px) sigue desbordando dentro de `.tabla-scroll`; a 1280 px el contenedor queda acotado por viewport (1180 px útiles tras márgenes). → `scrollWidth <= clientWidth` esperado. **CUMPLE (derivado).**

---

## 4. Trazabilidad con la consigna (Módulo 2)

| Punto de la consigna | Cómo lo cubre el CSS | Veredicto |
| --- | --- | --- |
| Identidad visual propia y coherente (colores, tipografía, espaciado, tarjetas, formularios, botones) | Tokens en `:root` (`:44-81`); `.tarjeta` (`:262`), etiquetas/inputs/selects (`:300-317`), `.boton` (`:346`), escala de espaciado | CUMPLE |
| CSS en archivos externos y clases reutilizables | Único `style.css` enlazado desde `index.html`; clases BEM reutilizadas (`.tarjeta`, `.boton`, `.campo`, `.mensaje`, `.tabla-scroll`, `.tabla-datos`) | CUMPLE |
| Flexbox **o** Grid | Flex: `#cabecera` (`:159`), `#nav-principal ul` (`:189`); Grid: `#main-principal` (`:231`), `.vista` (`:237`), `.tarjeta` (`:263`), formularios (`:326,:341`) | CUMPLE |
| 320 px y 1280 px sin scroll horizontal global; tabla con scroll interno | Ver §2 | CUMPLE (estático) |
| Foco visible y navegación por teclado | `style.css:469-475`; sin `outline: none/0` en la hoja | CUMPLE |
| Mensajes de error con texto, no solo color | `.mensaje--error` (`:456`) + `role="alert"` con texto en el HTML | CUMPLE |
| Imágenes informativas con `alt`; decorativas sin alt redundante | `index.html`: no hay `<img>` informativas (la UI es texto + formas CSS; iconografía por Unicode según spec). No aplica alt faltante. | CUMPLE / N/A |

---

## 5. Verificación manual recomendada (no bloqueante)

Estas comprobaciones dependen del navegador/hardware y quedan como pasos sugeridos para la defensa, no como incumplimientos:

1. **Empírico de scroll:** abrir `index.html`, DevTools → `Emulation.setDeviceMetricsOverride` a 320 y 1280; confirmar `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
2. **Teclado real:** recorrer con Tab de punta a punta en claro y oscuro; confirmar anillo visible de 2 px en cada control.
3. **Escalado en vivo:** aplicar `html { font-size: 20px }` desde DevTools y repetir; revertir al terminar.
4. **Táctil iOS/Android real:** `-webkit-overflow-scrolling: touch` solo actúa en WebKit móvil.
5. **Observación conocida (no es fallo):** los contenedores `.tabla-scroll` son enfocables (regiones con scroll) y reciben el `outline` nativo de Chrome, porque la regla 8.5 nombra `a[href]`, `button`, `input` y `select`. Si se quiere uniformidad, agregar `.tabla-scroll:focus-visible` al grupo de foco.

---

## 6. Resultado

- **CP-08:** CUMPLE en los 6 ítems (por análisis estático; verificación manual empírica recomendada en §5).
- **Tarea 12.5:** CUMPLE — mediciones derivadas conforme a spec.
- **Tarea 12.6:** CUMPLE — escalado ×1.25 conforme; anillo de foco constante en 2 px.
- **Tarea 11.6:** acta cerrada (este documento) y lista para entregar a M06.
