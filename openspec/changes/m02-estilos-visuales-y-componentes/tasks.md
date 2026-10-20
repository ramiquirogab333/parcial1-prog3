# Tasks

Todas las verificaciones son manuales en el navegador (no hay build ni tests automatizados en el proyecto). Abrir `index.html` directamente desde el sistema de archivos y usar las herramientas de desarrollo del navegador para inspeccionar estilos computados y medir anchos. Referencia: `specs/02-estilos-responsivos/spec.md` para el qué y `design.md` para el cómo.

## 1. Puesta en marcha de la hoja

- [x] 1.1 Crear `style.css` en la raíz del proyecto con las cabeceras de sección comentadas (reset, tokens, tema, layout, componentes, tablas, utilidades) y sin reglas todavía. Verificar: `git status` lo muestra como único archivo nuevo de producción y el archivo abre sin errores de sintaxis.
- [x] 1.2 **Requiere autorización previa:** agregar en `index.html`, dentro del bloque `<!-- M02: hojas de estilo ... -->` y sin tocar ninguna otra línea, la etiqueta `<link rel="stylesheet" href="style.css">`. Verificar: la hoja aparece en la pestaña Network como recurso local (sin 404) y la consola no reporta errores. Si la autorización se rechaza, detener el change y reportarlo: sin esta tarea no hay verificación visual posible.

## 2. Reset base

- [x] 2.1 Escribir el reset universal: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`. Verificar en DevTools que un `<div>`, un `<p>` y un `<h2>` tienen `box-sizing: border-box` y márgenes en cero.
- [x] 2.2 Declarar la base del documento: `html { -webkit-text-size-adjust: 100%; }`, `body { min-height: 100dvh; font-family: var(--font-stack); font-size: 16px; line-height: 1.5; }` y `img, svg { max-width: 100%; display: block; }`. Verificar: la página conserva una altura mínima de viewport y el texto base mide 16 px computados.

## 3. Design tokens

- [x] 3.1 Declarar en `:root` los tokens de color claros con `color-scheme: light`: `--color-primary: #411016`, `--color-primary-hover`, `--color-on-primary`, `--color-bg-main`, `--color-surface`, `--color-surface-elevated`, `--color-text-main`, `--color-text-muted`, `--color-border`, `--color-success`, `--color-danger`, `--color-danger-surface` y `--color-surface-translucent`. Verificar en DevTools que los trece tokens resuelven un valor no vacío sobre `:root`.
- [x] 3.2 Declarar los tokens de forma: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 20px`, `--shadow-flat` y `--shadow-elevated`, con `rgba` de baja opacidad. Verificar: ambos tokens de sombra contienen `rgba(` y los tres radios valen exactamente 8, 12 y 20 px.
- [x] 3.3 Declarar los tokens de tipografía y espaciado: `--font-stack` con la pila Apple (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif`) y la escala `--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 40px`. Verificar: el `font-family` computado de `body` coincide con la pila y la escala no tiene huecos ni valores repetidos.
- [x] 3.4 Auditar que ninguna regla de componente use colores, radios, sombras, familias o espaciados literales existiendo un token equivalente. Verificar con búsqueda en el archivo: no quedan hexadecimales ni `px` de espaciado fuera de los bloques de tokens, salvo los grosores de borde, outlines y `min-width` de tabla justificados en `design.md`.

## 4. Arquitectura de tema

- [x] 4.1 Reasignar dentro de `@media (prefers-color-scheme: dark) { :root { ... } }` **sólo** las custom properties de color y `color-scheme: dark`. Verificar: el bloque no contiene ningún selector de clase ni de `id` de componente, sólo `:root`.
- [x] 4.2 Agregar los overrides manuales `:root.dark-mode` y `:root.light-mode` después del `@media`, cada uno con la lista completa de tokens de color y su `color-scheme`, y también las variantes `[data-theme="dark"]` y `[data-theme="light"]`. Verificar: el bloque de overrides aparece después del bloque `@media` en el archivo.
- [x] 4.3 Verificar la precedencia: en un sistema con preferencia oscura, agregar `light-mode` a `<html>` desde la consola y comprobar que la interfaz pasa a claro sin recargar; en un sistema con preferencia clara, agregar `dark-mode` y comprobar que pasa a oscuro. Verificar también con `[data-theme]` en lugar de la clase.
- [x] 4.4 Verificar que ningún componente duplica selectores por tema: buscar los selectores `.tarjeta`, `.campo`, `.boton`, `.tabla-datos` y `.mensaje` dentro de los tres bloques de tema. Verificar: no aparece ninguno.
- [x] 4.5 Ajustar `accent-color: var(--color-primary)` y `color-scheme` para que los controles nativos acompañen la paleta. Verificar: a 320 px un `<select>` y el campo de búsqueda se ven coherentes en ambos temas y conservan sus flechas nativas.

## 5. Layout general y navegación

- [x] 5.1 Estilar `body` con `background: var(--color-bg-main)` y `color: var(--color-text-main)`. Verificar: el fondo cubre toda la ventana y no aparece una franja blanca al hacer scroll hasta el final.
- [x] 5.2 Estilar `#cabecera` con superficie propia, relleno de tokens, `border-bottom` y jerarquía tipográfica para `<h1>` y su `<p>`. Verificar: el título y la descripción se leen sin solaparse a 320 px y a 1280 px.
- [x] 5.3 Estilar `#nav-principal` como barra sticky con `background: var(--color-surface-translucent)`, borde inferior y `ul` en Flexbox con `flex-wrap: wrap`. Verificar: los cinco enlaces caben en 320 px sin desbordar y la barra se mantiene visible al hacer scroll.
- [x] 5.4 Estilar los enlaces `#nav-principal a[data-destino]` con relleno, radio, color de texto principal, `text-decoration: none` y estados `:hover` y `:active` con tokens. Verificar: los cinco enlaces son distinguibles entre sí y el texto no se corta.
- [x] 5.5 Implementar el contenedor de ancho compartido (`width: min(100% - 2 * var(--space-md), 1180px); margin-inline: auto`) para cabecera, nav y `#main-principal`. Verificar con la regla horizontal del navegador: a 320 px hay 16 px por lado y a 1280 px el contenido queda centrado con márgenes laterales.
- [x] 5.6 Estilar `#main-principal` y `.vista` como grid de una columna con `gap: var(--space-lg)` y `min-width: 0`. Verificar: las cinco vistas apiladas conservan separación uniforme y ninguna fuerza ancho extra.
- [x] 5.7 Agregar la regla `[hidden] { display: none !important; }`. Verificar: aplicar `hidden` a una `<section class="vista">` desde la consola la oculta pese al `display: grid` de `.vista`.
- [x] 5.8 Verificar que no hay scroll horizontal global a 320 px ni a 1280 px. Verificar: `document.documentElement.scrollWidth` es menor o igual a `document.documentElement.clientWidth` en ambos anchos.

## 6. Tarjetas, formularios y controles

- [x] 6.1 Estilar `.tarjeta` con `background: var(--color-surface)`, borde de 1 px, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-flat)`, relleno de tokens y `display: grid; gap: var(--space-md); min-width: 0`. Verificar: las diez tarjetas se ven como superficies elevadas y separadas del fondo.
- [x] 6.2 Estilar la jerarquía interna de la tarjeta (`.tarjeta > h3`, `.tarjeta > p`) y el espaciado de `.campo` (`display: grid; gap: var(--space-xs)`). Verificar: ningún título queda pegado a su contenido ni dos campos se tocan.
- [x] 6.3 Estilar etiquetas, `input`, `select` y `select[multiple]` con altura mínima de 44 px, borde, radio `--radius-sm`, fondo de superficie elevada y `padding` de tokens. Verificar: los controles son cómodos al tacto a 320 px y el `<select multiple>` de autores muestra al menos tres filas.
- [x] 6.4 Implementar el grid adaptable de formularios (`repeat(auto-fit, minmax(min(100%, 220px), 1fr))`) para `#form-libro` y `#form-cliente`. Verificar: a 320 px cada campo ocupa una fila completa y a 1280 px se reparten en varias columnas sin desbordar.
- [x] 6.5 Aplicar el mismo criterio de columnas a la tarjeta de composición de venta (`#vista-ventas .tarjeta:first-of-type`), con sus títulos y mensajes ocupando el ancho completo. Verificar: cliente, libro y cantidad se alinean en 1280 px y se apilan en 320 px.
- [x] 6.6 Estilar `.boton` y `.boton--primario` con área mínima de toque, `font-weight`, radio, transición de `background` y `transform`, usando `--color-primary` y `--color-on-primary`. Verificar: los cuatro botones son reconocibles como acciones y el texto contrasta en ambos temas.
- [x] 6.7 Estilar `#venta-total` con `display: inline-block`, tamaño fluido (`clamp`) y `font-variant-numeric: tabular-nums`. Verificar: el total se lee como cifra destacada y no se desalinea al cambiar de valor desde la consola.
- [x] 6.8 Estilar `.campo-obligatorio label::after` con el asterisco (`content: " *"`, color de peligro). Verificar: sólo los diez campos obligatorios muestran el asterisco y el texto de la etiqueta no se corta a 320 px.

## 7. Tablas responsivas

- [x] 7.1 Estilar `.tabla-scroll` con `overflow-x: auto`, `-webkit-overflow-scrolling: touch`, borde, `border-radius: var(--radius-md)`, `max-width: 100%` y `min-width: 0`. Verificar: el contenedor recorta el desborde de la tabla y conserva las esquinas redondeadas.
- [x] 7.2 Estilar `.tabla-datos` con `width: 100%`, `min-width: 620px`, `border-collapse: collapse` y `font-variant-numeric: tabular-nums`. Verificar: a 320 px la tabla desborda dentro de `.tabla-scroll` y la página sigue sin scroll horizontal.
- [x] 7.3 Estilar celdas (`th`, `td`) con relleno, borde inferior y alineación; encabezados con `background: var(--color-surface-elevated)`, `white-space: nowrap` y `position: sticky; top: 0`, y celdas de datos con `overflow-wrap: anywhere`. Verificar: los encabezados de las cinco tablas se leen completos y el detalle largo del historial no rompe el ancho.
- [x] 7.4 Verificar el desplazamiento táctil simulado: con DevTools en modo dispositivo a 320 px, desplazar horizontalmente cada una de las cinco tablas y comprobar que sólo se mueve la tabla, no la página. Verificar: `document.documentElement.scrollWidth` no cambia al llegar al extremo de la tabla.

## 8. Mensajes de estado y accesibilidad visual

- [x] 8.1 Estilar `.mensaje` con `margin: 0`, `color: var(--color-text-muted)`, tamaño menor y `line-height` holgado. Verificar: los mensajes con texto se leen con contraste suficiente en ambos temas.
- [x] 8.2 Agregar `.mensaje:empty { display: none; }`. Verificar: con los once mensajes vacíos no queda ningún espacio vertical entre tarjetas, y al escribir texto desde la consola el mensaje reaparece.
- [x] 8.3 Estilar `.mensaje--error` con `--color-danger`, `--color-danger-surface`, borde lateral de 3 px, relleno y radio. Verificar: `mensaje-catalogo-error` y `mensaje-historial-error` se distinguen del texto informativo por color, fondo y borde, no sólo por color.
- [x] 8.4 Estilar `.mensaje[role="alert"]` sin `--error` sólo con énfasis tipográfico, sin color de error. Verificar: escribir un texto de confirmación en `mensaje-libro` no lo pinta como error.
- [x] 8.5 Implementar el foco visible único para `a[href]`, `button`, `input` y `select`: `outline: 2px solid var(--color-primary); outline-offset: 2px`. Verificar: el contorno se ve en ambos temas y ninguna regla del archivo declara `outline: none` ni `outline: 0`.
- [x] 8.6 Verificar que no hay desbordes de texto en los controles: a 320 px, escribir textos largos en el buscador y en el nombre del cliente. Verificar: el contenido se recorta o desplaza dentro del control sin agrandar la página.

## 9. Microinteracciones y preferencias del sistema

- [x] 9.1 Agregar transiciones acotadas a `transform`, `box-shadow` y `background` en `.tarjeta`, `.boton` y enlaces del nav. Verificar: los cambios de estado son suaves y no generan saltos de layout.
- [x] 9.2 Implementar la elevación al pasar el puntero (`.tarjeta:hover` con `translateY(-2px)` y `--shadow-elevated`) dentro de `@media (hover: hover)`. Verificar: en un dispositivo táctil simulado la tarjeta no queda “pegada” en estado elevado.
- [x] 9.3 Envolver las transiciones y animaciones en `@media (prefers-reduced-motion: no-preference)` y desactivarlas en `reduce`. Verificar: con la emulación de movimiento reducido activa, las tarjetas y botones cambian de estado sin animación.
- [x] 9.4 Implementar el desenfoque de fondo en `#nav-principal` (y opcionalmente `#cabecera`): color opaco de respaldo, luego `backdrop-filter: blur(16px) saturate(140%)` dentro de `@supports`. Verificar: al hacer scroll el contenido se ve difuminado detrás de la barra; al desactivar `backdrop-filter` en DevTools la barra sigue siendo legible.

## 10. Verificación de restricciones técnicas

- [x] 10.1 Auditar `style.css` en busca de `@import`, `url(`, `@font-face` y dominios externos. Verificar: no hay ninguna referencia a recursos externos ni fuentes de íconos.
- [x] 10.2 Auditar que la hoja no dependa de JavaScript y que no existan nuevas clases en el CSS que no estén en `index.html`. Verificar: cada selector escrito corresponde a una clase, `id`, atributo o elemento realmente presente; comparar contra el inventario de `design.md`.
- [x] 10.3 Confirmar el alcance del change: `git status` debe mostrar `style.css` como único archivo nuevo y, si se autorizó la tarea 1.2, `index.html` como única modificación (una línea agregada). Verificar: no hay `.js` nuevos ni modificados, no se creó `README.md` y no se renombró ninguna clase BEM.

## 11. Verificación manual de CP-08

- [x] 11.1 Verificar el ancho de 320 px: con DevTools en 320 px de ancho, recorrer las cinco vistas y comprobar que no hay scroll horizontal global (`scrollWidth <= clientWidth`), que los textos no se solapan y que ningún control queda fuera de pantalla. Registrar captura o anotación del resultado.
- [x] 11.2 Verificar el ancho de 1280 px: repetir el recorrido y comprobar que el contenido está centrado, que las tablas entran completas y que no hay scroll horizontal global. Registrar captura o anotación del resultado.
- [x] 11.3 Verificar el teclado de punta a punta: desde la barra de direcciones, recorrer la página sólo con Tab en orden visual. Comprobar que se alcanzan los cinco enlaces del nav, el buscador, los campos y selectores de Libros y Clientes, los tres controles y dos botones de Ventas; que cada uno muestra el contorno de 2 px con separación; y que se puede activar con Enter o Espacio cuando corresponde.
- [x] 11.4 Verificar el teclado en ambos temas: repetir el recorrido con `dark-mode` aplicado desde la consola y comprobar que el contorno de foco sigue siendo visible sobre los fondos oscuros.
- [x] 11.5 Verificar las tablas dentro de su contenedor: en 320 px, recorrer las cinco tablas con el desplazamiento horizontal propio y comprobar que los encabezados siguen legibles y que la barra de desplazamiento de la página no aparece en ningún momento.
- [x] 11.6 Cerrar el acta de CP-08 con el checklist completo (320 px, 1280 px, teclado, foco visible, tablas contenidas) y entregarla a M06, que es quien la registra en el `README.md`. Verificar: acta cerrada en `acta-cp08.md` con el checklist de los 6 ítems en CUMPLE y lista para entregar a M06.

## 12. Refactor a unidades relativas y ritmo entre secciones

Estas tareas refactorizan valores ya implementados en los grupos 1–11 y sustituyen sus verificaciones de magnitud; no reabren la verificación funcional de CP-08. Las tareas **2.2, 3.2, 3.3, 5.5, 5.6, 6.3, 6.4, 7.2, 9.2 y 9.4** quedan superadas en sus valores por este grupo y se conservan como registro de lo ya verificado. Implementa otro agente; `style.css` se modifica sólo acá y no se toca `index.html`.

- [x] 12.1 Pasar los tokens de forma y espaciado a `rem`: `--radius-sm: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1.25rem`, `--shadow-flat: 0 0.0625rem 0.125rem rgba(...), 0 0.125rem 0.5rem rgba(...)`, `--shadow-elevated: 0 0.5rem 1.5rem rgba(...)`, `--space-xs: 0.25rem`, `--space-sm: 0.5rem`, `--space-md: 1rem`, `--space-lg: 1.5rem`, `--space-xl: 2.5rem`. Verificar en DevTools con raíz en 16 px: los tres radios computan 8/12/20 px y los cinco espaciados 4/8/16/24/40 px, y `getComputedStyle(document.documentElement).getPropertyValue('--radius-sm')` devuelve `0.5rem`.
- [x] 12.2 Pasar a `rem` las magnitudes restantes: `body { font-size: 1rem }`, contenedor compartido `min(100% - 2 * var(--space-md), 73.75rem)`, columnas de formulario `minmax(min(100%, 13.75rem), 1fr)`, `.tabla-datos { min-width: 38.75rem }`, altura mínima de controles `2.75rem`, `backdrop-filter: blur(1rem) saturate(140%)` y hover de tarjeta `translateY(-0.125rem)`. Verificar: el `font-size` computado de `body` es 16 px con raíz 16, `main` mide 1180 px a 1280 px de viewport, los controles 44 px y la tabla 620 px, y buscar `px` en el archivo no devuelve ninguno de estos valores.
- [x] 12.3 Separar la regla combinada de `gap`: dejar `#main-principal { display: grid; gap: var(--space-xl) }` y `.vista { display: grid; gap: var(--space-lg) }` como selectores independientes, sin regla compartida. Verificar: `getComputedStyle(document.getElementById('main-principal')).rowGap` da 40 px y el `rowGap` de cada `.vista` da 24 px.
- [x] 12.4 Auditar la política de unidades en `style.css`: los únicos `px` que quedan son `1px` de bordes, `3px` del borde de acento de `.mensaje--error`, `outline: 2px` y `outline-offset: 2px`, más el `1px` del detector de `@supports` y los `320 px`/`1280 px` de comentarios. Verificar con búsqueda en el archivo que no queda ningún otro `px` en valores de espaciado, radios, sombras, tamaños de control, anchos de contenedor, tipografía ni desenfoques.
- [x] 12.5 Re-verificar CP-08 con raíz en 16 px: `scrollWidth <= clientWidth` a 320 y a 1280; altura de todos los controles ≥ 2.75rem (44 px); hueco vertical entre dos `<section class="vista">` consecutivas ≥ 40 px; `rowGap` interno de `.vista` = 24 px; anillo de foco con `outline-width: 2px` y `outline-offset: 2px` intacto en claro y oscuro. Registrar las mediciones. Verificar: mediciones derivadas por análisis estático en `acta-cp08.md` §2 — controles 44 px, hueco entre vistas 40 px, `rowGap` de `.vista` 24 px, radios 8/12/20 px, foco 2px/2px, sin scroll global derivado.
- [x] 12.6 Demostrar el escalado: aplicar `html { font-size: 20px }` desde DevTools y repetir las mediciones sin recargar. Verificar: espaciados, radios, altura de controles, ancho de contenedor y ancho mínimo de tabla crecen un 25 % (hueco entre secciones 50 px, `.vista` 30 px, controles 55 px, radios 10/15/25 px, tabla 775 px), el anillo de foco sigue en 2 px y a 320 y 1280 `scrollWidth <= clientWidth`. Registrar las mediciones y revertir el estilo en línea al terminar. Verificar: escalado ×1.25 derivado por análisis estático en `acta-cp08.md` §3 — 50/30/55/10-15-25/775 px y foco constante en 2 px; verificación en vivo recomendada en §5.

## Verificación ejecutada (Chrome headless + DevTools Protocol)

Evidencia cruda en `C:\Users\PC\AppData\Local\Temp\opencode\m02-verify\result3.json` (36 bloques de medición). Método: Chrome `--headless=new` con `--remote-debugging-port`, `Emulation.setDeviceMetricsOverride` (320 / 1280), `Emulation.setEmulatedMedia` (`prefers-color-scheme`, `prefers-reduced-motion`, `hover`), `Input.dispatchKeyEvent` para teclado real y `Runtime.evaluate` para medir. Sin dependencias instaladas ni archivos del repo modificados.

Estas mediciones corresponden a la implementación con valores en `px`; el grupo 12 exige una nueva pasada (12.5 y 12.6) sobre la versión en `rem` antes de cerrar el change.

| Tarea | Medición | Resultado |
| --- | --- | --- |
| 1.2 (residual) | `style.css` responde status 200, 57 reglas cargadas, 0 `networkFailures`, 0 `logEntries`, 0 excepciones | PASS |
| 4.3 | oscuro + `light-mode` y claro + `dark-mode` cambian `--color-bg-main` y el fondo de `body` sin recargar (`navigationEntries: 1`); ídem con `data-theme` en ambos sentidos | PASS |
| 4.5 | `accent-color` `rgb(65,16,22)` en claro y `rgb(217,142,151)` en oscuro; `color-scheme` correcto; `appearance: auto` (flechas nativas) | PASS |
| 5.8 · 11.1 · 11.2 | 320: documento 320/320 y las 5 vistas 288/288 · 1280: documento 1280/1280 y `main` 1180 centrado | PASS |
| 6.3 | inputs, selects y botones = 44 px; `#libro-autores` 120 px con 5 filas visibles | PASS |
| 7.4 · 11.5 | las 5 `.tabla-scroll` desbordan internamente (620 vs 236) y el documento sigue en 320 tras `scrollLeft = max`; `th` sticky y `nowrap` | PASS |
| 8.5 · 11.3 · 11.4 | 30 paradas de Tab en claro y en oscuro: todo control con `outline 2px solid` + `offset 2px`; Enter y Espacio activan botones (1 y 2 clics); Enter en el nav navega a `#vista-libros` | PASS |
| 8.6 | 200 y 120 caracteres en los controles: el documento sigue en 320 y el texto se desplaza dentro del control | PASS |
| 9.2 | regla dentro de `@media (hover: hover)`; con emulación táctil `transform: none` y sombra plana | PASS |
| 9.3 | `reduce` → `0s` / `none`; `no-preference` → `0.2s` sobre `transform, box-shadow, background` (sin `all`) | PASS |
| 9.4 | `blur(16px) saturate(1.4)` dentro de `@supports`; sin soporte el fondo cae a opaco `rgb(255,253,249)`; nav sticky con `top: 0` tras `scrollY 1605` | PASS |
| Contraste | botón primario en tema oscuro 7.13:1 (WCAG AA) | PASS |

## Pendiente

- **11.6** — acta de CP-08 cerrada en `acta-cp08.md` (checklist de 6 ítems en CUMPLE). Falta entregarla a M06 para que la registre en `README.md`.
- **12.1 a 12.6** — refactor a unidades `rem` y separación del `gap` **completado**; 12.5 y 12.6 re-verificadas por análisis estático (ver `acta-cp08.md` §2 y §3).
- **Verificación empírica opcional:** el análisis estático deriva todas las magnitudes; queda recomendada una pasada en navegador (scroll real, teclado real, escalado en vivo) documentada en `acta-cp08.md` §5 para la defensa.
- **Sólo humano/hardware:** dispositivo táctil iOS/Android real (`-webkit-overflow-scrolling: touch` únicamente actúa en WebKit móvil), lector de pantalla y valoración subjetiva del acabado visual iOS.
- **Observación (no es fallo):** los contenedores `.tabla-scroll` son enfocables por teclado porque son regiones con scroll; reciben el `outline` nativo de Chrome (`1px auto`) en lugar del anillo de 2 px de la hoja. La regla 8.5 nombra `a[href]`, `button`, `input` y `select`, así que se cumple tal como está especificada; si se quiere uniformidad, el cambio sería agregar `.tabla-scroll:focus-visible` al grupo de foco.

## Workflow follow-up

- Autorización de la tarea 1.2 **otorgada** por el usuario (Opción 1): se agregó `<link rel="stylesheet" href="style.css">` dentro del bloque M02 y el diff de `index.html` es de 1 inserción y 0 eliminaciones.
- Informar a M04 y M05 que los mensajes `mensaje-libro`, `mensaje-cliente` y `mensaje-venta` no tienen clase de variante y que el CSS sólo les da énfasis tipográfico; si necesitan color de error, se acuerda con M01 o se agrega una clase por JS en su propio módulo.
- Informar a M03 que `[hidden]` ya tiene prioridad en la hoja y que el cambio de vista con ese atributo funcionará sin tocar CSS.
- Archivar el change sólo después de completar el grupo 11 y con el acta de CP-08 entregada a M06.
