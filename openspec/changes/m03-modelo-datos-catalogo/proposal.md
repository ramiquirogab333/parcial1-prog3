# Proposal

## Why

M01 ya entregó el markup de las cinco vistas y el contrato de `id` del DOM, pero la vista Catálogo está vacía: no hay datos, no hay filas renderizadas y el buscador no responde. Sin un modelo de datos semilla y un renderizado del catálogo, los módulos M04 (altas), M05 (ventas) y M06 (persistencia) no tienen de dónde leer libros, editoriales, géneros, autores ni clientes.

Además, las cinco vistas quedaron apiladas y visibles: el `design.md` de M01 delegó explícitamente en M03 el intercambio de vistas con el atributo `hidden` al hacer clic en el nav. Sin ese cableado la aplicación no se comporta como una aplicación de cinco pantallas.

Este change resuelve el Ejercicio 3 de la consigna (datos locales, catálogo y filtro), completa la navegación delegada por M01 y publica la API de datos que consumen los módulos posteriores, antes de que M04 empiece a escribir.

## What Changes

- Se crea `js/data.js` con las semillas de editoriales, géneros, autores, libros y clientes, y con la función de búsqueda por título.
- Se crea `js/catalogo.js` con el renderizado de la tabla de catálogo, el filtrado en vivo sobre el buscador y los tres estados de la vista (sin resultados, catálogo vacío, error).
- Se crea `js/navegacion.js` con el intercambio de vistas: sólo una `<section>` visible a la vez mediante el atributo `hidden`, sincronizada con el hash de la URL y con `aria-current` en el enlace activo.
- Se agregan tres etiquetas `<script src>` locales (`js/data.js`, `js/catalogo.js` y `js/navegacion.js`, en ese orden) dentro del bloque reservado «M03-M06: scripts de la aplicación» de `index.html`. Ninguna otra línea de `index.html` se modifica.
- Se publican dos namespaces globales mínimos (`Datos` y `Catalogo`, más `Navegacion`) como contrato para M04 y M05. Sin módulos ES, sin `import`/`export`, sin bundler.

## Decisiones de alcance ya tomadas por el usuario

### El ISBN no se muestra en el catálogo

El Ejercicio 3 pide mostrar el ISBN, pero la tabla de catálogo de `index.html` no tiene esa columna y el usuario decidió **no agregarla**. Consecuencias que este change asume y documenta:

- El catálogo renderiza **cinco** columnas: Título, Autor/es, Editorial, Género, Precio.
- `index.html` no se toca fuera del bloque reservado de scripts: no se agrega `<th>` ni celda de ISBN, y no se abre un change de M01.
- El campo `isbn` **se conserva en el modelo de datos** (`Datos.libros[i].isbn`), porque M04 lo necesita para validar unicidad y porque M06 lo persiste. La decisión es de presentación, no de modelo.
- Queda registrado como **desvío consciente** respecto de la matriz de requisitos de `AGENTS.md` §4 (Ejercicio 3) para que el docente y el equipo lo vean explicitado y no como un olvido. Si más adelante se quisiera mostrar, alcanza con un change de M01 sobre el `<thead>` y una celda adicional en el render: el dato ya está disponible.

### La navegación entre vistas se incorpora a este change

El `design.md` de M01 asigna a M03 interceptar el clic de los enlaces del nav. El usuario pidió incorporarlo ahora. Por eso este change suma `js/navegacion.js` y la etiqueta de script correspondiente, y la capability `03-modelo-datos-catalogo` pasa a cubrir también el intercambio de vistas.

## Capabilities

### New Capabilities

- `03-modelo-datos-catalogo`: modelo de datos semilla con integridad referencial, API global de datos, búsqueda por título con coincidencias parciales, renderizado del catálogo con sus estados de vacío, sin resultados y error, e intercambio de las cinco vistas con `hidden` sincronizado con la URL.

### Modified Capabilities

Ninguna. La capability `01-estructura-html` no cambia: su requisito de navegación por anclas se mantiene tal cual (los enlaces siguen resolviendo a `id` existentes y funcionan sin JavaScript), y el ocultamiento de vistas es comportamiento nuevo que agrega M03.

## Impact

- **Archivos nuevos:** `js/data.js`, `js/catalogo.js`, `js/navegacion.js`.
- **Archivo modificado:** `index.html`, únicamente el bloque delimitado por los comentarios «M03-M06: scripts de la aplicación» / «FIN scripts» (líneas 245–246), donde se agregan tres líneas `<script src>`.
- **Contrato publicado para otros módulos:** `Datos.libros`, `Datos.editoriales`, `Datos.generos`, `Datos.autores`, `Datos.clientes`, `Datos.buscarLibrosPorTitulo(texto)`, `Catalogo.render()` y `Navegacion.mostrarVista(idVista)`. M04 y M05 consumen este contrato; cambiarlo es un cambio de spec.
- **Dependencias:** ninguna externa. Sin frameworks, sin CDN, sin npm, sin build, sin `fetch`.
- **Dependencia de entrada:** M01 archivado (`openspec/specs/01-estructura-html/spec.md`) y su contrato de ids.
- **Consumidores aguas abajo:** M04 (poblar selectores de editorial, género, autor y libro; refrescar el catálogo tras un alta; navegar a la vista de libros), M05 (leer libros para la venta; navegar al historial tras confirmar), M06 (serializar las semillas en `localStorage` tal cual).
- **Riesgo de datos:** los precios se guardan como números y el formato con dos decimales es sólo de presentación; el precio histórico de una venta es responsabilidad de M05.
- **Riesgo de presentación (M02):** cuando M02 defina `display` sobre `.vista`, una regla de autor puede pisar el `display: none` que el navegador aplica a `[hidden]`. M02 debe incluir `[hidden] { display: none; }` en su hoja de estilos. Se documenta en `design.md` y se avisa al equipo.
- **Fuera de alcance:** altas de libros y clientes (M04), ventas e historial (M05), `localStorage` (M06), CSS (M02), ABM de editoriales, géneros y autores, y la columna ISBN (descartada por decisión del usuario).
