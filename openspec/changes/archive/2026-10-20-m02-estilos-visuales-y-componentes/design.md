# Design

## Context

M01 está archivado y `index.html` existe con las cinco vistas, los formularios, las tablas y las clases BEM publicadas. El repositorio **no tiene ninguna hoja de estilos**: `style.css` no existe y el bloque reservado `<!-- M02: hojas de estilo ... -->` de `<head>` sigue vacío (el commit `9aa8faa` sólo modificó `AGENTS.md`, no insertó el `<link>`). Ver `proposal.md` para la motivación.

Restricciones que condicionan el diseño:

- Aplicación 100% cliente, sin backend, sin build y sin dependencias externas (ver `AGENTS.md` §2).
- M02 es dueño de un único archivo nuevo: `style.css` en la raíz. No se crean ni modifican `.js`, no se renombran clases y no se agrega markup.
- Un solo archivo compartido (`index.html`) ya es de M01. M02 sólo puede consumir las clases y `data-*` existentes; si falta un gancho, se acuerda un change de M01 y no se parchea el HTML desde este módulo.
- Los mensajes de estado se entregan vacíos y visibles; M03–M06 los llenan con `.textContent` y alternan `hidden`.
- El equipo trabaja secuencialmente sobre `main`; M02 arranca cerrado M01.

## Goals / Non-Goals

**Goals:**

- Publicar el sistema de design tokens, el reset y la arquitectura de tema como contrato estable para toda la aplicación.
- Estilar las cinco vistas existentes sin agregar ni renombrar un solo selector del markup.
- Garantizar legibilidad y ausencia de scroll horizontal global entre 320 px y 1280 px.
- Dejar el foco visible y el desplazamiento interno de tablas verificables para CP-08.

**Non-Goals:**

- No se define comportamiento: ni filtrado, ni validación, ni cálculo, ni persistencia (M03–M06).
- No se agrega un selector de tema visible: no hay control en el markup y crear uno sería JS/markup nuevo. Sólo se deja la arquitectura lista para que un JS futuro aplique `.dark-mode`/`.light-mode`.
- No se agregan íconos, imágenes, fuentes descargadas ni animaciones de entrada que dependan de JS.
- No se resuelve el estado activo de la navegación (`aria-current` o clase activa): ningún gancho existe hoy en el HTML y agregarlo es un change de M01/M03.

## Decisions

### D1 — Carga de la hoja: una línea dentro del bloque reservado por M01

Para que `style.css` se aplique, `index.html` necesita exactamente una línea dentro del bloque que M01 dejó preparado:

```html
<!-- M02: hojas de estilo — M02 agrega acá sus etiquetas de hoja de estilo locales (css/...), sin recursos externos. -->
<link rel="stylesheet" href="style.css">
<!-- FIN M02 -->
```

**Por qué:** M01 publicó ese bloque en D3 justamente para que M02 no tuviera que tocar el resto del documento; la ruta es `style.css` en la raíz, coherente con `AGENTS.md` §3 y con el pedido del docente.

**Estado:** la consigna de esta fase prohíbe modificar `index.html`, así que la línea queda **pendiente de autorización explícita** antes del apply. Es la única edición de HTML que el change requiere y no altera clases, `id` ni estructura. Si el orquestador mantiene la prohibición, `style.css` se entrega igual pero no se aplica: el change no se puede verificar.

**Alternativas descartadas:** etiqueta `<style>` en línea (prohibida por el Ejercicio 2, que exige hoja externa); `@import` desde otro CSS (no existe otro CSS y agrega una petición).

### D2 — Tokens en `:root` como única fuente de verdad

Se declaran custom properties en `:root`, agrupadas por categoría con comentarios de sección. Los componentes consumen `var(--token)` y no repiten valores.

| Categoría | Token | Claro (por defecto) | Oscuro |
| --- | --- | --- | --- |
| Color | `--color-primary` | `#411016` | `#d98e97` |
| Color | `--color-primary-hover` | `#5a1a22` | `#e6aab1` |
| Color | `--color-on-primary` | `#fffaf7` | `#2a0c11` |
| Color | `--color-bg-main` | `#f6f1ea` | `#17110f` |
| Color | `--color-surface` | `#fffdf9` | `#221a18` |
| Color | `--color-surface-elevated` | `#ffffff` | `#2b2220` |
| Color | `--color-text-main` | `#241a18` | `#f5efeb` |
| Color | `--color-text-muted` | `#6b5a56` | `#c2b2ad` |
| Color | `--color-border` | `#e4d9cf` | `#3a2d29` |
| Color | `--color-success` | `#2f6b4f` | `#7fc9a1` |
| Color | `--color-danger` | `#a01e2b` | `#ff9aa5` |
| Color | `--color-danger-surface` | `#fbeaea` | `#3a1a1e` |
| Color | `--color-surface-translucent` | `rgba(255, 253, 249, 0.72)` | `rgba(23, 17, 15, 0.72)` |
| Forma | `--radius-sm` | `0.5rem` | igual |
| Forma | `--radius-md` | `0.75rem` | igual |
| Forma | `--radius-lg` | `1.25rem` | igual |
| Forma | `--shadow-flat` | `0 0.0625rem 0.125rem rgba(36, 26, 24, 0.06), 0 0.125rem 0.5rem rgba(36, 26, 24, 0.04)` | sombra con `rgba(0, 0, 0, 0.45)` |
| Forma | `--shadow-elevated` | `0 0.5rem 1.5rem rgba(36, 26, 24, 0.12)` | sombra con `rgba(0, 0, 0, 0.55)` |
| Tipografía | `--font-stack` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif` | igual |
| Espaciado | `--space-xs` | `0.25rem` | igual |
| Espaciado | `--space-sm` | `0.5rem` | igual |
| Espaciado | `--space-md` | `1rem` | igual |
| Espaciado | `--space-lg` | `1.5rem` | igual |
| Espaciado | `--space-xl` | `2.5rem` | igual |

**Por qué:** un solo lugar para cambiar la identidad visual; el tema oscuro se resuelve reasignando la misma lista. Se agrega `--space-xl` porque el espaciado entre secciones no entra en la escala de cuatro pasos exigida; es un token adicional, no un valor literal. Todos los valores de forma y espaciado se expresan en `rem` (base 16 px) para que la escala acompañe el tamaño de letra configurado por el usuario; ver D12.

**Alternativas descartadas:** valores literales por componente (imposible de tematizar); `light-dark()` (elegante, pero la consigna exige el bloque `@media` y la compatibilidad de navegadores del aula no está garantizada).

### D3 — Tema híbrido: `@media` primero, overrides manuales después

Orden de la hoja y reglas:

1. `:root` con la paleta clara y `color-scheme: light`.
2. `@media (prefers-color-scheme: dark) { :root { ...sólo color...; color-scheme: dark; } }`.
3. `:root.dark-mode { ... }` y `:root.light-mode { ... }` (equivalentes `[data-theme="dark"]`/`[data-theme="light"]`) al final, con `color-scheme` correspondiente.

**Por qué:** los overrides manuales ganan por dos motivos redundantes: mayor especificidad (`:root.dark-mode` = 0,2,0 contra `:root` = 0,1,0 del `@media`) y orden posterior en la cascada. Así el tema forzado funciona sobre cualquier preferencia del sistema.

**Regla estricta:** los tres bloques de tema contienen **sólo custom properties**. Ningún selector de componente se repite dentro de ellos. La duplicación de valores oscuros entre el `@media` y `.dark-mode` es deliberada: CSS plano no permite reutilizar un bloque de declaraciones, y duplicar tokens no viola la regla (lo prohibido es duplicar selectores de componentes).

**Detalle de tema oscuro:** `--color-primary` se reasigna a un borravino claro para que el `outline` de foco exigido contraste sobre fondo oscuro. Por eso existe `--color-on-primary`: mantiene legible el texto de los botones primarios en ambos temas.

**Alternativas descartadas:** clases de tema por componente (duplica selectores y rompe la regla); `filter: invert()` (arruina contraste y colores de marca).

### D4 — Estética iOS con superficies translúcidas y fallback opaco

- `#cabecera` y `#nav-principal` usan `--color-surface-translucent` + `backdrop-filter: blur(1rem) saturate(140%)`, con `#nav-principal` en `position: sticky; top: 0`.
- El fondo translúcido se declara primero de forma opaca y el desenfoque dentro de `@supports (backdrop-filter: blur(1px))`, de modo que sin soporte quede una barra sólida legible.
- `.tarjeta` usa `--color-surface`, `--radius-lg`, `--shadow-flat` y borde de 1 px; en `@media (hover: hover)` y sin movimiento reducido, `:hover` eleva con `translateY(-0.125rem)` y `--shadow-elevated`.
- Transiciones acotadas a `transform`, `box-shadow` y `background`; todas envueltas en `@media (prefers-reduced-motion: no-preference)`.

**Por qué:** el desenfoque sólo aporta sobre contenido que se desplaza detrás; aplicarlo a las diez tarjetas suma costo de pintado sin ganancia visual.

**Alternativas descartadas:** `backdrop-filter` en todas las tarjetas (rendimiento y riesgo de texto ilegible sobre tablas); sombras fuertes tipo neumorfismo (se aleja de la referencia Apple).

### D5 — Layout: Grid para la página, Flexbox para barras y grupos

- `body`: `display: flow-root`, `background: var(--color-bg-main)`, `color: var(--color-text-main)`, `min-height: 100dvh`.
- Contenedor de ancho: `#cabecera > *`, `#nav-principal > ul` y `#main-principal` comparten `width: min(100% - 2 * var(--space-md), 73.75rem)` y `margin-inline: auto`. A 1280 px quedan márgenes laterales; a 320 px se usan 16 px por lado.
- `#nav-principal ul`: `display: flex; flex-wrap: wrap; gap: var(--space-xs)` para que los cinco enlaces nunca desborden a 320 px.
- `#main-principal`: `display: grid; gap: var(--space-xl)` (2.5rem) para separar las cinco `<section class="vista">`.
- `.vista`: `display: grid; gap: var(--space-lg)` (1.5rem) para separar las tarjetas internas.
- `.tarjeta`: `display: grid; gap: var(--space-md)` y `min-width: 0` (clave para que las tablas no estiren el grid).
- Formularios: `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13.75rem), 1fr)); gap: var(--space-md)`. En 320 px cae a una columna; en 1280 px reparte campos en dos o tres columnas sin `:has()` ni clases nuevas.
- Botones dentro de `.campo`: `width: 100%` para que la celda no quede a media asta.

**Por qué:** `auto-fit` + `minmax(min(100%, 13.75rem), 1fr)` resuelve la adaptabilidad sin media queries por formulario ni selectores frágiles por posición. `min-width: 0` en los ítems de grid es la causa más común de scroll horizontal involuntario con tablas.

**Alternativas descartadas:** `overflow-x: hidden` en `html`/`body` para “esconder” el desborde (tapa el bug y rompe el `position: sticky`); anchos fijos en px por breakpoint (rígido y con más mantenimiento).

### D6 — Tablas con desplazamiento contenido

- `.tabla-scroll`: `overflow-x: auto`, `-webkit-overflow-scrolling: touch`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`, `max-width: 100%`, `min-width: 0`.
- `.tabla-datos`: `width: 100%`, `min-width: 38.75rem` (fuerza scroll interno a 320 px), `border-collapse: collapse`, `font-variant-numeric: tabular-nums`.
- Celdas con `padding` de tokens; encabezados con `background: var(--color-surface-elevated)`, `position: sticky; top: 0` y `white-space: nowrap`; celdas de datos con `overflow-wrap: anywhere` para textos largos (detalle del historial).

**Por qué:** `min-width` en la tabla y no en el contenedor garantiza que el desborde ocurra dentro de `.tabla-scroll`, que es el único elemento con `overflow-x`. A 1280 px la tabla entra completa y no aparece scroll.

**Alternativas descartadas:** convertir tablas en tarjetas apiladas con `display: block` (pierde la semántica de tabla y el contrato de M01); `table-layout: fixed` (recorta contenido del historial).

### D7 — Foco visible sin excepciones

Regla única sobre `a[href]`, `button`, `input`, `select`:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Por qué:** cumple literalmente el requisito del Ejercicio 2 y CP-08, y funciona en ambos temas porque `--color-primary` se reasigna. No se declara ninguna regla `outline: none`; el foco de ratón se deja al criterio del navegador.

**Alternativas descartadas:** `box-shadow` como único indicador (se pierde en alto contraste de Windows); `outline` sobre `:focus` (se ve al hacer clic y ensucia la interfaz).

### D8 — Mensajes de estado legibles y sin huecos

- `.mensaje`: `margin: 0`, `color: var(--color-text-muted)`, `font-size` menor, `line-height` holgado.
- `.mensaje:empty { display: none; }` para que los once contenedores vacíos no dejen espacios entre tarjetas.
- `.mensaje--error` (los dos que ya traen la clase: `mensaje-catalogo-error` y `mensaje-historial-error`): `color: var(--color-danger)`, `background: var(--color-danger-surface)`, `border-inline-start: 3px solid currentColor`, `padding`, `border-radius: var(--radius-sm)`.
- `.mensaje[role="alert"]` sin `--error` (los de alta y venta): sólo énfasis tipográfico (`font-weight: 600`), sin color de error.

**Por qué:** `mensaje-libro`, `mensaje-cliente` y `mensaje-venta` se usan tanto para errores como para confirmaciones (`design.md` de M01, contrato de ids), así que pintarlos de rojo por su `role` sería incorrecto cuando anuncian éxito. Se necesita una clase de estado que M04/M05 puedan alternar; hoy no existe y este change no puede agregarla al markup. Queda registrado como inconsistencia para el orquestador.

**Alternativa descartada:** estilar `[role="alert"]` como error (marca de error permanente en mensajes de éxito).

### D9 — Marcado visual de campos obligatorios con CSS

`.campo-obligatorio label::after { content: " *"; color: var(--color-danger); }`.

**Por qué:** M01 publicó la clase pero no un texto de obligatoriedad; el asterisco es una pista visual redundante, porque las etiquetas ya describen la condición («Autores (seleccioná al menos uno)») y la validación real es de M04. No se agrega texto al HTML.

**Trade-off:** el contenido generado por CSS puede ser anunciado de forma inconsistente por lectores de pantalla. Como es redundante y no aporta información nueva, el riesgo es aceptable.

**Alternativa descartada:** `border-inline-start` de color en el campo (se confunde con el estilo de error).

### D10 — Tipografía, números y controles nativos

- `--font-stack` sólo con fuentes del sistema Apple/Windows; `font-size: 1rem` base para evitar el zoom automático de iOS al enfocar inputs; escala de títulos con `clamp()`.
- `font-variant-numeric: tabular-nums` en tablas y en `#venta-total`.
- `accent-color: var(--color-primary)` y `color-scheme` por tema para que checkboxes, selects y scrollbars nativos acompañen la paleta sin `appearance: none` (que rompería el `<select multiple>`).
- `#venta-total`: `display: inline-block`, `font-size: clamp(1.5rem, 4vw, 2rem)`, `font-weight: 700`.

**Por qué:** cero fuentes externas (prohibidas), controles nativos accesibles y números alineados en tablas de precios.

**Alternativas descartadas:** `appearance: none` con flechas CSS en los `<select>` (frágil y pierde el `<select multiple>`); fuentes de Google (CDN prohibido).

### D11 — `[hidden]` con prioridad para que funcione el cambio de vista de M03

```css
[hidden] { display: none !important; }
```

**Por qué:** M01 decidió que M03 alterna vistas con el atributo `hidden`. Cualquier `display: grid`/`flex` declarado por M02 sobre `.vista` o `.tarjeta` gana a la regla `display: none` del navegador para `[hidden]`, y las vistas quedarían todas visibles. Esta regla blinda el contrato entre M02 y M03.

**Alternativa descartada:** confiar en el estilo del agente de usuario (se rompe en cuanto M02 declara `display`).

### D12 — Política de unidades: `rem` para escala, `px` sólo para trazos

Toda magnitud que forma parte de la escala visual se declara en `rem`: los radios (`0.5rem`/`0.75rem`/`1.25rem`), la escala de espaciado (`0.25rem` a `2.5rem`), los offsets y desenfoques de las sombras (`0 0.0625rem 0.125rem`, `0 0.125rem 0.5rem`, `0 0.5rem 1.5rem`), el `font-size` base (`1rem`), el ancho del contenedor (`73.75rem`), el ancho mínimo de columna de formulario (`13.75rem`), el `min-width` de `.tabla-datos` (`38.75rem`), la altura mínima de controles (`2.75rem`), el `blur(1rem)` del `backdrop-filter` y el `translateY(-0.125rem)` del hover.

**Excepción explícita:** se mantienen en `px` los grosores de trazo —bordes de `1px`, borde de acento de `3px`— y el anillo de foco `outline: 2px` + `outline-offset: 2px`.

**Por qué:** con `rem` la interfaz respeta el tamaño de letra configurado por el usuario y escala de forma proporcional, que es la razón de ser del sistema de tokens. Los trazos no escalan porque a tamaños de letra grandes un borde de `0.0625rem` se redondea a subpíxeles, produce líneas borrosas o desaparece, y un anillo de foco de `0.125rem` deja de cumplir el requisito literal de accesibilidad de 2 px que la spec exige. La separación entre «magnitud de escala» y «grosor de trazo» es la regla que resuelve el conflicto.

**Alternativas descartadas:** todo en `px` (no respeta la preferencia de tamaño de letra del usuario y contradice el objetivo de tokens); todo en `rem` incluidos los trazos (anillo de foco subpíxel, incumple el requisito de 2 px y bordes borrosos); `em` (se compone en cascada y produce escalados no deseados en elementos anidados).

### D13 — El `gap` se desdobla: `#main-principal` y `.vista` con ritmos distintos

La regla combinada `#main-principal, .vista { display: grid; gap: var(--space-lg); }` se parte en dos:

- `#main-principal { display: grid; gap: var(--space-xl); }` (2.5rem entre las cinco `<section class="vista">`).
- `.vista { display: grid; gap: var(--space-lg); }` (1.5rem entre las tarjetas de una misma vista).

**Por qué:** una sola regla no puede dar dos ritmos verticales, y con el gap único de 1.5rem las cinco secciones quedaban tan juntas como las tarjetas internas, de modo que la jerarquía de la página no se leía. `--space-xl` ya existía en la escala precisamente para este nivel. La separación entre vistas pasa a ser 1.67 veces la interna, suficiente para agrupar sin dejar huecos de página.

**Alternativas descartadas:** `margin-block-start` en `.vista` (rompe la uniformidad del grid y complica el colapso de márgenes); aumentar `--space-lg` (encoge el aire dentro de las tarjetas y sube el alto total); un tercer token de espaciado (innecesario: `--space-xl` ya cubre el nivel).

## Inventario de selectores BEM detectados en `index.html`

Todos los nombres son los que existen hoy; no se inventa ninguno. Conteo sobre el documento completo (10 tarjetas, 17 `.campo`, 11 `.mensaje`, 5 tablas).

### Clases globales

| Clase | Ocurrencias | Elementos que la llevan | Uso de estilo previsto |
| --- | --- | --- | --- |
| `.vista` | 5 | Las cinco `<section>` | Grid de sección y separación entre tarjetas |
| `.tarjeta` | 10 | `<div>` contenedores de formularios, buscador y tablas | Superficie, radio, sombra y microinteracción |
| `.campo` | 17 | `<div>` que envuelve cada label + control y cada botón | Separación vertical, ancho completo |
| `.campo-obligatorio` | 10 | Campos de título, ISBN, precio, editorial, autores, nombre, email y los tres de venta | Asterisco visual en la etiqueta |
| `.tabla-scroll` | 5 | `<div>` contenedores con `id` `contenedor-tabla-*` | `overflow-x: auto` y borde redondeado |
| `.tabla-datos` | 5 | Las cinco `<table>` | Ancho mínimo, celdas, encabezados pegajosos |
| `.mensaje` | 11 | `<p>` de estado y error | Tipografía y ocultamiento cuando está vacío |
| `.mensaje--error` | 2 | `mensaje-catalogo-error`, `mensaje-historial-error` | Color, fondo y borde de error |
| `.boton` | 4 | Los cuatro `<button>` | Base de botón, transición y área de toque |
| `.boton--primario` | 3 | Alta de libro, alta de cliente y confirmar venta | Fondo borravino, texto `--color-on-primary` |

### Por vista

| Vista | `id` de sección | `.tarjeta` | `.campo` / `.campo-obligatorio` | Tablas | Mensajes |
| --- | --- | --- | --- | --- | --- |
| Catálogo | `vista-catalogo` (`data-vista="catalogo"`) | 2 | 1 / 0 | `contenedor-tabla-catalogo` | 3 (`sin-resultados`, `vacio`, `error`) |
| Libros | `vista-libros` (`data-vista="libros"`) | 2 | 7 / 5 | `contenedor-tabla-libros` | 2 (`mensaje-libro`, `mensaje-libros-vacio`) |
| Clientes | `vista-clientes` (`data-vista="clientes"`) | 2 | 3 / 2 | `contenedor-tabla-clientes` | 2 (`mensaje-cliente`, `mensaje-clientes-vacio`) |
| Ventas | `vista-ventas` (`data-vista="ventas"`) | 3 | 6 / 3 | `contenedor-tabla-renglones` | 2 (`mensaje-renglones-vacio`, `mensaje-venta`) |
| Historial | `vista-historial` (`data-vista="historial"`) | 1 | 0 / 0 | `contenedor-tabla-historial` | 2 (`mensaje-historial-vacio`, `mensaje-historial-error`) |

### Ganchos sin clase (se estilan por elemento o `id`)

- `#cabecera`, `#nav-principal`, `#main-principal`: no tienen clase; se estilan por `id`.
- `#nav-principal ul` y sus `li > a[data-destino]`: sin clase; el estilo de enlace usa `a` y `a[data-destino]`.
- `#venta-total` es un `<output>` sin clase: se estila por `id`.
- `<h1>` en `#cabecera`, `<h2>` en cada `.vista` y `<h3>` en cada `.tarjeta`: sin clase, se estilan por contexto (`.tarjeta > h3`, `.vista > h2`).
- Los `<form id="form-libro">` y `<form id="form-cliente">` no tienen clase: se estilan por `form` dentro de `.tarjeta`.

### Inconsistencias y huecos detectados (información para el orquestador)

1. **`index.html` no carga `style.css`.** El bloque `<!-- M02 ... -->` está vacío y el commit `9aa8faa` sólo tocó `AGENTS.md`. Sin la línea de D1, este change no se puede verificar.
2. **Los mensajes de error de Libros, Clientes y Ventas no tienen `.mensaje--error`.** Sólo lo llevan catálogo e historial. M04/M05 necesitan alternar una clase para pintar error; el HTML no la ofrece y M02 no puede crearla. Propuesta: que M04/M05 agreguen la clase por JS (`classList`) o que M01 publique variantes `--exito`/`--error` en un change posterior.
3. **No existe gancho de vista activa.** Ni el `<nav>` ni las secciones tienen `aria-current`, `.activo` o similar. M02 no puede resaltar la vista actual; corresponde a M03, que es quien intercepta los clics.
4. **`.vista` se entrega visible y apilada.** Hasta que M03 aplique `hidden`, las cinco vistas se ven una debajo de otra; el layout debe verse correcto en ese estado, sin asumir una sola vista visible.
5. **Los contenedores de tabla y los `<tbody>` están vacíos.** A 320 px la tabla se ve como encabezados con scroll interno; el estado sin filas lo cubre el `.mensaje` vacío, que se oculta con `:empty`.
6. **`<select multiple>` (`libro-autores`) no tiene gancho propio.** Se estila por atributo `select[multiple]` dentro de `#form-libro` (altura mínima y `padding`), sin clase nueva.
7. **`.campo` envuelve también los botones.** No debe asumirse que todo `.campo` contiene un control de formulario al escribir selectores; conviene usar `.campo > label`, `.campo > input`, `.campo > select` y `.campo > button`.

## Risks / Trade-offs

- **Sin el `<link>` la hoja no se aplica** → la tarea de D1 queda explícitamente bloqueada hasta autorización; se reporta en el cierre y no se da por verificada ninguna prueba visual si falta.
- **El tema oscuro duplica la lista de tokens** → se acepta: son declaraciones de custom properties, no selectores de componentes; la regla de no duplicación se cumple y la lista es corta.
- **`backdrop-filter` no soportado** → fondo opaco declarado antes del `@supports`; el desenfoque es una mejora, no un requisito de legibilidad.
- **`min-width: 38.75rem` en las tablas podría ser excesivo en pantallas de 640–700 px** → es el ancho mínimo para que las seis columnas de Libros no se aplasten; por encima de ese ancho la tabla entra completa y el scroll desaparece.
- **Un `font-size` raíz distinto de 16 px reescala toda la interfaz** → es el comportamiento buscado (accesibilidad), pero si un navegador o el usuario fija una raíz pequeña, la altura mínima de toque de `2.75rem` queda por debajo de los 44 px de referencia y los anchos mínimos de tabla (`38.75rem`) encogen. No se fija `font-size` en `html` justamente para no anular la preferencia; la verificación con raíz de 20 px demuestra que el layout escala sin desbordar.
- **El asterisco de `.campo-obligatorio` puede anunciarse de forma inconsistente** → es redundante con el texto de la etiqueta y no participa de la validación.
- **M03–M06 insertan contenido que M02 no puede verificar hoy** → los estilos usan selectores estructurales (`tbody td`, `output`, `.mensaje`) y no dependen de clases que el JS vaya a inventar.
- **Estilar `#venta-total` sin clase acopla el CSS a un `id`** → el `id` es parte del contrato estable de M01; es el mismo criterio que M03–M05 usan para consultarlo.
- **Fuentes del sistema Apple en Windows** → `--font-stack` degrada a `Segoe UI` y `system-ui`; no hay descarga ni parpadeo de fuentes.

## Migration Plan

No aplica: no hay estilos previos que migrar. El rollback es eliminar `style.css` y la línea `<link>` de D1, y el documento vuelve al estado de M01.

## Open Questions

1. **Autorización para la línea `<link rel="stylesheet" href="style.css">` en `index.html`.** Es la única edición de HTML del change y la condición para que los estilos se apliquen. Debe resolverla el docente/orquestador antes del apply; si se rechaza, el alcance verificable de M02 queda limitado a la existencia y validación del CSS, no a su efecto en pantalla.
2. **Quién publica las variantes de mensaje de éxito y error para Libros, Clientes y Ventas.** No cambia la spec ni el desglose de tareas de M02; afecta a M04/M05 y, eventualmente, a un change de M01.
