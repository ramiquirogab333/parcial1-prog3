# Proposal

## Why

El Ejercicio 1 (M01) ya entregó `index.html` con las cinco vistas, las tablas y todos los ganchos de estilo, pero el proyecto sigue sin ninguna hoja de estilos: la aplicación se ve como HTML sin formato, las tablas desbordan a 320 px y no hay foco visible propio ni mensajes de estado legibles. El Ejercicio 2 —M02— es el que convierte ese esqueleto en una interfaz usable, y es además el módulo del que dependen visualmente todos los casos de prueba manuales (CP-01 a CP-08), porque sin estilos no se puede verificar legibilidad, contraste ni desplazamiento contenido de tablas.

## What Changes

- Se crea **`style.css`** en la raíz del proyecto como única hoja de estilos de producción de este change. No se crean archivos CSS adicionales ni se usa ningún preprocesador.
- Se define un **sistema de design tokens** en `:root` organizado por categorías: color (primario borravino `#411016`, hover, fondos, superficie, texto, bordes y estados), elevación y bordes (`--radius-sm|md|lg`, `--shadow-flat`, `--shadow-elevated`), tipografía (`--font-stack` con la pila del sistema Apple) y escala de espaciado (`--space-xs|sm|md|lg`).
- Se adopta un **sistema de unidades relativas**: espaciados, radios, anchos de contenedor y tipografía se expresan en `rem` para que la interfaz escale con el tamaño de letra del usuario, con `px` reservado a los grosores de trazo y al anillo de foco; además, la separación entre las cinco vistas usa un **ritmo vertical mayor** que el de las tarjetas internas (`--space-xl` contra `--space-lg`).
- Se agrega un **reset base** universal: `box-sizing: border-box`, `margin: 0` y `padding: 0`.
- Se implementa una **arquitectura híbrida de tema**: variables claras por defecto, `@media (prefers-color-scheme: dark)` que sólo reasigna variables de color y overrides manuales `:root.dark-mode` / `:root.light-mode` con mayor precedencia que el `@media`, de modo que un JavaScript futuro pueda forzar el tema sin tocar selectores de componentes.
- Se estila la **estética iOS/Apple**: tarjetas con esquinas redondeadas, sombras suaves de elevación, transiciones de `transform`, `box-shadow` y `background`, y superficies translúcidas con `backdrop-filter: blur(...)` más su fallback opaco.
- Se define el **layout adaptable** con Flexbox para alineaciones en una dimensión y CSS Grid para las estructuras bidimensionales, legible y sin scroll horizontal global entre 320 px y 1280 px.
- Se hacen **responsivas las tablas**: los contenedores `.tabla-scroll` reciben `overflow-x: auto` y `-webkit-overflow-scrolling: touch`, con el desplazamiento siempre dentro del contenedor y nunca de la página.
- Se garantiza **accesibilidad visual**: `:focus-visible` con `outline: 2px solid var(--color-primary)` y `outline-offset: 2px` en todos los elementos interactivos, contraste suficiente en ambos temas y estilos legibles para los mensajes de estado y de error.
- Se resuelve la **iconografía** únicamente con símbolos Unicode nativos o formas CSS puras; no se incorporan fuentes de íconos ni imágenes externas.
- No hay cambios disruptivos (**BREAKING**): el markup, los `id` y las clases BEM de M01 se consumen tal como están publicados.

## Capabilities

### New Capabilities

- `02-estilos-responsivos`: identidad visual, sistema de tokens, arquitectura de tema claro/oscuro, layout adaptable de las cinco vistas, componentes de tarjeta, tablas con desplazamiento interno, estados de foco y mensajería visual accesible.

### Modified Capabilities

<!-- Ninguna: `01-estructura-html` no cambia sus requisitos; M02 sólo consume sus clases y su contrato de ids. -->

## Impact

- **Archivos afectados:** `style.css` (nuevo y único archivo de producción de este change).
- **Enlace de carga:** para que la hoja se aplique, `index.html` necesita una única línea `<link rel="stylesheet" href="style.css">` dentro del bloque reservado `<!-- M02: hojas de estilo ... -->` de `<head>`. Ese bloque fue creado por M01 justamente para esto. La edición se limita a esa línea y no altera markup, clases ni `id`; queda registrada como decisión a autorizar antes del apply (ver `design.md`, D1).
- **Consumidores del estilo:** todas las vistas de `index.html` (Catálogo, Libros, Clientes, Ventas e Historial); los módulos M03–M06 insertan filas y mensajes en el DOM y heredan estos estilos sin escribir CSS propio.
- **Dependencias técnicas:** ninguna. Sin frameworks, sin CDNs, sin preprocesadores, sin build tools y sin JavaScript nuevo.
- **Sistemas externos:** ninguno. La hoja no hace peticiones de red ni referencia recursos de terceros.
- **Riesgo principal:** que el CSS dependa de clases que no existen en el HTML y termine sin efecto; se degrada publicando en `design.md` el inventario exacto de selectores detectados en `index.html`.

## Fuera de Alcance

- **Datos, renderizado y buscador (M03)** — M02 no crea arrays semilla, no puebla `tbody` ni implementa el filtro.
- **Validaciones de alta (M04)** — M02 estiliza los mensajes de error, pero no valida ISBN, precio ni email.
- **Composición de venta e inmutabilidad de precios (M05)** — M02 no calcula subtotales, totales ni historial.
- **Persistencia y documentación de pruebas (M06)** — M02 no toca `localStorage` ni `README.md`; la evidencia de CP-08 la registra M06.
- **Cambios de markup o de JavaScript** — no se renombran clases BEM, no se agregan elementos y no se crea ni modifica ningún archivo `.js`.
- **CP-01 a CP-07 como verificación funcional** — dependen de lógica de M03–M05. M02 sólo aporta la legibilidad visual de esos flujos; su verificación funcional no forma parte de este change.

## Casos de prueba cubiertos

- **CP-08** (alcance principal): navegación por teclado con foco visible, controles utilizables y tabla con desplazamiento dentro de su contenedor a 320 px y 1280 px.
- **Soporte visual de CP-01 a CP-07** (alcance indirecto, no verificable hasta que existan M03–M05): mensajes de vacío, sin resultados, error y confirmación legibles en ambos temas.
