# Design

## Context

Repositorio recién inicializado: no existe `index.html` ni ningún archivo de producción (sólo `openspec/`, `.opencode/` y `AGENTS.md`). Ver `proposal.md` para la motivación.

Restricciones que condicionan el diseño:

- Aplicación 100% cliente, sin backend, sin build y sin dependencias externas (ver `AGENTS.md` §2).
- Seis módulos con dueños distintos y **un único archivo compartido** (`index.html`). Para evitar escritores concurrentes, M01 entrega todo el markup en este change y M02–M06 sólo escriben CSS y JavaScript.
- Trabajo secuencial sobre `main`: M02, M03, M04, M05 y M06 arrancan cuando M01 está archivado.
- UI en español, con etiquetas y mensajes descriptivos.

## Goals / Non-Goals

**Goals:**

- Publicar un esqueleto HTML completo, semántico y navegable que funcione sin JavaScript.
- Congelar un **contrato de `id` del DOM** que los módulos posteriores puedan consumir sin editar el markup.
- Dejar preparados los contenedores de estado (vacío, sin resultados, error) y los formularios completos de alta y de venta.
- Publicar los ganchos de estilo (clases y atributos `data-*`) que M02 necesita para no tocar el HTML.

**Non-Goals:**

- No se define ningún estilo, color, tipografía ni comportamiento responsivo (M02).
- No se incluyen datos, renderizado, filtrado, validación, cálculo de ventas, persistencia ni pruebas documentadas (M03–M06).
- No se define el mecanismo definitivo de intercambio de vistas: M01 entrega las anclas; el ocultamiento con JavaScript se cablea desde M03.

## Decisions

### D1 — SPA de un solo archivo con cinco `<section>`

Todas las vistas viven en `index.html` como `<section>` hermanas dentro de `<main>`. En M01 las cinco se ven apiladas, una debajo de otra.

**Por qué:** el estado (libros, clientes, ventas) vive en memoria y en `localStorage`; repartir las vistas en cinco archivos obligaría a recargar y duplicar la carga de datos, algo imposible sin backend. Además, un solo archivo respeta la regla de un único dueño por archivo.

**Alternativas descartadas:** cinco HTML separados (pierde estado y multiplica la carga de semillas); una sola vista con contenido generado por JS (M01 quedaría vacío y el Ejercicio 1 no se podría evaluar).

### D2 — Navegación por anclas `<a href="#vista-...">`

Cada enlace del `<nav>` apunta al `id` de su sección.

**Por qué:** funciona desde el primer commit, sin JS y sin CSS, y es verificable con el Ejercicio 1. Cuando M03 cablee el intercambio de vistas, interceptará el clic y alternará el atributo `hidden` de cada `section`; la URL sigue siendo válida y los enlaces conservan su semántica.

**Decisión asociada:** el intercambio de vistas se hará con el atributo nativo `hidden`, **no** con clases ni con `display: none` en CSS. `hidden` es accesible (saca la sección del árbol de accesibilidad), no depende de M02 y evita el acoplamiento entre estilos y comportamiento.

**Alternativas descartadas:** `:target` en CSS (la vista por defecto queda indefinida y la visibilidad pasa a depender de la hoja de estilos); `display: none` por clase (M02 y M03 se pisarían).

### D3 — M01 es dueño de todos los formularios y tablas

El markup de las altas de libro, alta de cliente y venta simulada se entrega completo en este change; M04 y M05 sólo agregan `js/*.js`.

**Por qué:** cada integrante escribe únicamente los archivos de su módulo. Si M04 tuviera que agregar inputs, estaría editando `index.html`, que ya es de M01. Concentrar el markup permite además etiquetar todo de una vez y auditar la accesibilidad en un solo lugar.

**Trade-off:** M01 crece en tamaño. Se acepta porque el maquetado es exactamente el Ejercicio 1.

**Punto de extensión reservado (resuelve el hueco de los `<link>` y `<script>`):** si nadie más puede editar `index.html`, ningún módulo podría cargar su CSS ni su JS. Por eso M01 deja dos bloques delimitados por comentarios:

```html
<!-- M02: hojas de estilo (agregar una sola línea <link rel="stylesheet" href="css/...">) -->
<!-- FIN M02 -->

<!-- M03-M06: scripts de la aplicación (agregar una línea <script src="js/..."></script> por archivo, en orden de dependencia) -->
<!-- FIN scripts -->
```

Regla: cada módulo agrega **sólo sus propias líneas** dentro del bloque que le corresponde, sin reordenar ni tocar el resto del markup. El bloque de scripts va al final de `<body>` para que el DOM ya exista. En M01 ambos bloques quedan con comentarios y **sin ninguna etiqueta activa** (`<script>`/`<link>`), de modo que el Ejercicio 1 se entrega sin recursos externos y sin 404 en consola.

### D4 — Selectores vacíos en el markup, poblados desde datos

`libro-editorial`, `libro-genero`, `libro-autores`, `venta-cliente` y `venta-libro` se entregan sin `<option>` (o sólo con una opción inicial de tipo «Seleccione…»), para que M03/M04 los pueblen desde los arrays semilla.

**Por qué:** una única fuente de verdad para los datos (M03); si el markup tuviera opciones fijas, quedarían desincronizadas al dar de alta libros o clientes. `libro-autores` lleva el atributo `multiple` porque el Ejercicio 4 exige al menos un autor y la consigna admite varios.

### D5 — Contrato de `id` con nomenclatura en español y prefijo por área

Convención: `<área>-<elemento>` en minúsculas y sin acentos (`buscador-catalogo`, `libro-isbn`, `venta-total`). Los contenedores de tabla usan el prefijo `contenedor-`; los `tbody`, `cuerpo-`; los mensajes, `mensaje-`.

**Por qué:** nombres previsibles permiten que cada integrante escriba su JS sin adivinar, y el prefijo por área evita colisiones entre módulos. Los `id` son **parte del contrato**: cambiarlos es un cambio de spec, no un detalle de implementación.

### D6 — Contenedores de mensajes anunciados a lectores de pantalla

Los mensajes usan `role="status"` con `aria-live="polite"` para los avisos informativos y `role="alert"` para los errores, y arrancan vacíos.

**Por qué:** el Ejercicio 2 exige mensajes de error descriptivos con texto y el CP-08 evalúa usabilidad por teclado; anunciar los mensajes evita que un error quede invisible para quien navega con lector de pantalla.

### D7 — Controles nativos, sin `tabindex` y con etiqueta explícita

Se usan `<input>`, `<select>`, `<button>` y `<table>` nativos; todo control tiene `<label for="...">` con un `id` existente. No se usan `tabindex` positivos ni roles ARIA que dupliquen la semántica nativa.

**Por qué:** el orden de tabulación queda correcto sin trabajo extra, M02 puede aplicar `:focus-visible` sobre los controles reales y CP-08 se verifica sin trucos.

### D8 — Tablas envueltas en un contenedor de desplazamiento

Cada tabla de datos está dentro de un `div` con `id` propio (`contenedor-tabla-*`), y las tablas llevan la clase `.tabla-datos`.

**Por qué:** a 320 px la tabla no cabe; el contenedor permite `overflow-x: auto` (M02) sin provocar desplazamiento horizontal de la página. M01 sólo aporta el contenedor y la clase.

### D9 — Ganchos de estilo publicados por M01

M01 asigna clases base (`.vista`, `.tarjeta`, `.campo`, `.tabla-scroll`, `.tabla-datos`, `.mensaje`, `.mensaje--error`, `.boton`, `.boton--primario`, `.campo-obligatorio`) y atributos `data-vista="catalogo|libros|clientes|ventas|historial"` en cada `<section>` y `data-destino` en cada enlace del nav.

**Por qué:** M02 escribe sólo CSS; sin ganchos estables tendría que editar `index.html`. Si M02 necesita un gancho nuevo, se acuerda con M01 y se agrega en un change posterior de ese módulo, no por edición directa.

### D10 — Cabecera del documento en español y apta para móvil

`<html lang="es">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` y `<title>` descriptivo («Librería — Gestión y ventas»).

**Por qué:** el `lang` es requisito de accesibilidad y corrección idiomática; sin `viewport` la verificación a 320 px no mide el layout real.

### D11 — Sin validación nativa bloqueante

Los formularios no llevan `required`, `pattern` ni `minlength`; sólo se usan `type`, `min`, `step` e `inputmode` como ayudas de teclado y de teclado numérico en móvil.

**Por qué:** los mensajes de validación del navegador aparecen en el idioma del navegador, no se pueden estilizar y competirían con los mensajes en español que exige el Ejercicio 4 (CP-02, CP-03 y CP-04). La validación y sus mensajes son responsabilidad de M04/M05.

**Alternativa descartada:** combinar `required` con `novalidate` en el `<form>`; deja atributos contradictorios y ensucia la auditoría del markup.

**Corrección durante la implementación:** no alcanza con omitir `required`/`pattern`. `type="email"` valida el formato y `min`/`step` validan rango y escala, y en todos esos casos el navegador **bloquea el `submit`** antes de que el JS muestre su mensaje, con un texto en el idioma del navegador. Por eso `form-libro` y `form-cliente` llevan el atributo `novalidate`: la validación y los mensajes en español son responsabilidad exclusiva de M04. La vista de venta no tiene `<form>`, así que `venta-cantidad` (con `min`/`step`) tampoco dispara validación nativa; M05 valida al agregar el renglón.

## Contrato de ids del DOM

Tabla normativa. Cualquier módulo que necesite un `id` adicional lo solicita como cambio de M01; no se renombra ninguno de los existentes.

### Estructura común

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `cabecera` | `<header>` | M02 | Contenedor del título y la identidad visual |
| `nav-principal` | `<nav>` | M02, M03 | Barra de navegación entre vistas |
| `enlace-catalogo` | `<a href="#vista-catalogo" data-destino="catalogo">` | M03 | Interceptar clic para mostrar la vista |
| `enlace-libros` | `<a href="#vista-libros" data-destino="libros">` | M03 | Interceptar clic para mostrar la vista |
| `enlace-clientes` | `<a href="#vista-clientes" data-destino="clientes">` | M03 | Interceptar clic para mostrar la vista |
| `enlace-ventas` | `<a href="#vista-ventas" data-destino="ventas">` | M03 | Interceptar clic para mostrar la vista |
| `enlace-historial` | `<a href="#vista-historial" data-destino="historial">` | M03 | Interceptar clic para mostrar la vista |
| `main-principal` | `<main>` | M02 | Contenedor de las cinco vistas |
| `vista-catalogo` | `<section data-vista="catalogo">` | M02, M03 | Vista Catálogo (destino del ancla) |
| `vista-libros` | `<section data-vista="libros">` | M02, M04 | Vista Libros |
| `vista-clientes` | `<section data-vista="clientes">` | M02, M04 | Vista Clientes |
| `vista-ventas` | `<section data-vista="ventas">` | M02, M05 | Vista Ventas |
| `vista-historial` | `<section data-vista="historial">` | M02, M05 | Vista Historial |

### Vista Catálogo (M03)

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `buscador-catalogo` | `<input type="search">` con `<label for="buscador-catalogo">` | M03 | Filtro por título (parcial, sin distinguir mayúsculas, con `trim()`) |
| `contenedor-tabla-catalogo` | `<div class="tabla-scroll">` | M02, M03 | Desplazamiento interno de la tabla |
| `cuerpo-tabla-catalogo` | `<tbody>` de la tabla de catálogo | M03 | Renderizado de las filas de libros |
| `mensaje-catalogo-vacio` | `<p role="status">` vacío | M03 | Aviso de catálogo sin libros |
| `mensaje-catalogo-sin-resultados` | `<p role="status">` vacío | M03 | Aviso de búsqueda sin coincidencias |
| `mensaje-catalogo-error` | `<p role="alert">` vacío | M03, M06 | Error de lectura de datos |

### Vista Libros (M03 + M04)

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `form-libro` | `<form>` de alta | M04 | Escuchar `submit` y aplicar `e.preventDefault()` |
| `libro-titulo` | `<input type="text">` | M04 | Título del libro |
| `libro-isbn` | `<input type="text">` | M04 | ISBN sin guiones ni espacios, único |
| `libro-precio` | `<input type="number" min="0" step="0.01">` | M04 | Precio mayor que cero |
| `libro-editorial` | `<select>` sin opciones | M03 (poblar), M04 (leer) | Editorial seleccionada |
| `libro-genero` | `<select>` sin opciones | M03 (poblar), M04 (leer) | Género opcional (vacío = «Sin clasificar») |
| `libro-autores` | `<select multiple>` sin opciones | M03 (poblar), M04 (leer) | Al menos un autor |
| `btn-alta-libro` | `<button type="submit">` | M04 | Enviar el formulario de alta |
| `mensaje-libro` | `<p role="alert">` vacío | M04 | Errores y confirmación del alta |
| `contenedor-tabla-libros` | `<div class="tabla-scroll">` | M02 | Desplazamiento interno de la tabla |
| `cuerpo-tabla-libros` | `<tbody>` de la tabla de libros | M04 | Renderizado del listado |
| `mensaje-libros-vacio` | `<p role="status">` vacío | M04 | Aviso de listado sin libros |

### Vista Clientes (M04)

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `form-cliente` | `<form>` de alta | M04 | Escuchar `submit` y aplicar `e.preventDefault()` |
| `cliente-nombre` | `<input type="text">` | M04 | Nombre completo |
| `cliente-email` | `<input type="email">` | M04 | Email válido y único (comparación sin mayúsculas ni espacios) |
| `btn-alta-cliente` | `<button type="submit">` | M04 | Enviar el formulario de alta |
| `mensaje-cliente` | `<p role="alert">` vacío | M04 | Errores y confirmación del alta |
| `contenedor-tabla-clientes` | `<div class="tabla-scroll">` | M02 | Desplazamiento interno de la tabla |
| `cuerpo-tabla-clientes` | `<tbody>` de la tabla de clientes | M04 | Renderizado del listado |
| `mensaje-clientes-vacio` | `<p role="status">` vacío | M04 | Aviso de listado sin clientes |

### Vista Ventas (M03 + M04 + M05)

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `venta-cliente` | `<select>` sin opciones | M04 (poblar), M05 (leer) | Cliente de la venta |
| `venta-libro` | `<select>` sin opciones | M03 (poblar), M05 (leer) | Libro del renglón |
| `venta-cantidad` | `<input type="number" min="1" step="1">` | M05 | Cantidad entera mayor que cero |
| `btn-agregar-renglon` | `<button type="button">` | M05 | Agregar el renglón al ticket |
| `contenedor-tabla-renglones` | `<div class="tabla-scroll">` | M02 | Desplazamiento interno de la tabla |
| `cuerpo-tabla-renglones` | `<tbody>` de la tabla de renglones | M05 | Renderizado del ticket en curso |
| `mensaje-renglones-vacio` | `<p role="status">` vacío | M05 | Aviso de ticket sin renglones |
| `venta-total` | `<output>` del total | M05 | Total calculado con `toFixed(2)` |
| `btn-confirmar-venta` | `<button type="button">` | M05 | Confirmar la venta |
| `mensaje-venta` | `<p role="alert">` vacío | M05 | Errores de composición y confirmación de venta |

### Vista Historial (M05 + M06)

| id | Elemento | Módulo que lo consume | Uso previsto |
| --- | --- | --- | --- |
| `contenedor-tabla-historial` | `<div class="tabla-scroll">` | M02 | Desplazamiento interno de la tabla |
| `cuerpo-tabla-historial` | `<tbody>` de la tabla de historial | M05 | Renderizado de ventas confirmadas |
| `mensaje-historial-vacio` | `<p role="status">` vacío | M05, M06 | Aviso de historial sin ventas |
| `mensaje-historial-error` | `<p role="alert">` vacío | M05, M06 | Error al leer ventas guardadas |

## Assumptions

- El filtrado del catálogo se dispara en vivo sobre el evento `input` del buscador; M01 no entrega un botón «Buscar». Si M03 necesita uno, se agrega en un change de M01 (nadie más edita `index.html`).
- El total de la venta se muestra en `<output id="venta-total">`; el formato con dos decimales lo aplica M05.
- El intercambio de vistas con `hidden` y el poblado de selectores ocurren recién en M03/M04; hasta entonces las cinco secciones quedan visibles y apiladas.
- Los contenedores de mensajes se entregan vacíos y visibles; cada módulo decide cuándo alternarlos.

## Risks / Trade-offs

- **Un `id` renombrado rompe a los módulos que ya lo consumen** → el contrato se publica acá, se versiona en el repo y cualquier cambio de `id` exige un change de M01 con aviso al equipo.
- **M02 necesita un gancho de estilo que M01 no publicó** → se publican clases base y atributos `data-*` desde este change; si falta algo, se agrega por change (nunca editando `index.html` desde otro módulo).
- **Las cinco vistas quedan apiladas y visibles hasta que M03 cablee el intercambio** → es el estado esperado de M01: el ancla navega igual y la demo del Ejercicio 1 se ve completa. El CP-08 se verifica de forma parcial en M01 (orden de tabulación y ausencia de scroll horizontal) y completa al cerrar M03.
- **Entregar formularios y tablas adelanta markup de M04 y M05** → se acepta para respetar la regla de un único dueño por archivo; el costo es que M01 es el change más grande.
- **`<select multiple>` es incómodo en pantallas táctiles a 320 px** → se documenta como limitación conocida; M02 puede ajustar su altura y M04 compensa la validación con mensajes textuales.
- **Contenedores de mensaje vacíos pueden mostrarse como espacios en blanco** → se entregan vacíos y sin estilos; cada módulo alterna su atributo `hidden` y M02 ajusta el espaciado. Al estar vacíos no afectan a los lectores de pantalla.
- **El icono o el título se modifican en M02 y se pierde el texto descriptivo** → el texto del `<h1>` es contenido, no estilo; M02 no lo reemplaza por imágenes.

## Migration Plan

No aplica: no hay código previo que migrar. El "rollback" de este change es eliminar `index.html`, que deja el repositorio como está hoy.

## Open Questions

Ninguna que afecte las specs, el enfoque o el desglose de tareas.
