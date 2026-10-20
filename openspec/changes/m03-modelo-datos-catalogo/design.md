# Design

## Context

M01 está archivado: `index.html` tiene las cinco vistas, el contrato de `id` del DOM y dos bloques reservados (hojas de estilo y scripts) para que los módulos siguientes no editen el resto del markup. `openspec/specs/01-estructura-html/spec.md` es la verdad vigente de esa estructura.

Dos huecos quedan a la vista:

1. La vista Catálogo está inerte: `#cuerpo-tabla-catalogo` está vacío, el buscador no tiene manejador y los tres contenedores de mensajes están vacíos y nunca se alternan.
2. Las cinco `<section>` están apiladas y visibles. El `design.md` de M01 (D2) delegó en M03 el intercambio de vistas con el atributo `hidden`, y el usuario pidió incorporarlo en este change.

Restricciones que condicionan el diseño:

- Aplicación 100% cliente, sin backend, sin build, sin frameworks, sin CDN y sin `fetch` (ver `AGENTS.md` §2).
- Prohibido `innerHTML` con datos: sólo `textContent` y nodos creados con `createElement`.
- `index.html` es propiedad de M01: M03 sólo puede agregar sus líneas de `<script src>` dentro del bloque reservado.
- Sin test runner (npm prohibido): la verificación es manual y observable en el navegador y en la consola.
- M04 y M05 consumen la API de datos; M06 serializa las semillas en `localStorage`. Las semillas deben ser objetos planos y serializables desde el primer día.
- Todo el código, los nombres de funciones y variables y los textos de la UI van en español.

## Goals / Non-Goals

**Goals:**

- Publicar un modelo de datos semilla mínimo, estable y con integridad referencial.
- Publicar una API global mínima y documentada (`Datos.*`, `Catalogo.render()`, `Navegacion.mostrarVista()`) que M04 y M05 consuman sin adivinar.
- Renderizar el catálogo con nodos DOM seguros y en el orden de columnas acordado.
- Filtrar por título en vivo, con `trim()`, sin distinguir mayúsculas y con coincidencias parciales.
- Cubrir los tres estados de la vista: catálogo vacío, búsqueda sin resultados y error de datos.
- Mostrar una sola vista a la vez, sincronizada con el hash de la URL, con el enlace activo señalado.
- Dejar la vista lista para que M06 la alimente desde `localStorage` sin reescribir el render.

**Non-Goals:**

- Altas de libros y clientes, pueblado de selectores y validación de formularios (M04).
- Composición de ventas, cálculo de totales e historial (M05).
- Lectura y escritura en `localStorage`, semillas idempotentes al recargar y documentación de CP (M06).
- Estilos, layout y responsividad (M02).
- ABM de editoriales, géneros o autores.
- **Mostrar el ISBN en el catálogo:** el usuario decidió no agregar la columna (ver D6). El dato se conserva en el modelo para la validación de unicidad de M04.
- Búsqueda por autor, editorial, ISBN o género; búsqueda insensible a acentos o por palabras sueltas.
- Historial de navegación (botones atrás/adelante del navegador) como mecanismo de cambio de vista: se usa el hash como estado, no `pushState`.

## Decisions

### D1 — Arrays de objetos con ids legibles y prefijo por entidad

Cada entidad es un objeto plano dentro de un array, con `id` de tipo string y prefijo estable: `lib-01`, `edi-01`, `gen-01`, `aut-01`, `cli-01`.

**Por qué:** los ids legibles aparecen en los datos guardados en `localStorage` y en las ventas de M05; un índice numérico se rompe en cuanto alguien reordena un array. El prefijo hace evidente a qué entidad pertenece un id suelto y evita cruces accidentales entre arrays.

**Contrato:**

```js
{ id: "lib-01", titulo: "Rayuela", isbn: "9788437604572", precio: 1500.00,
  editorialId: "edi-01", generoId: "gen-01", autorIds: ["aut-01"] }
```

- `precio` es un **número** (`1500`, `2500.5`), no un string. El formateo con `toFixed(2)` es exclusivamente de presentación y nunca se persiste.
- `generoId` admite `null` (libro sin clasificar) o el id de un género existente. `""` no es válido: el vacío es `null`.
- `autorIds` es un array de al menos un id de autor existente.
- `isbn` se guarda sin guiones ni espacios, como string (nunca como número: perdería ceros a la izquierda). **No se renderiza en el catálogo** (D6), pero se mantiene en el modelo porque M04 valida su unicidad y M06 lo persiste.

### D2 — Integridad referencial garantizada por las semillas y verificada en el render

Toda editorial, autor y género referenciado por un libro existe en su array. No hay eliminación de entidades en el alcance del proyecto, así que la integridad no puede romperse desde la UI; sí podría romperse si M06 carga datos corruptos de `localStorage`.

**Por qué:** una referencia rota produciría una celda «undefined» silenciosa o un precio imposible de calcular en M05. Es preferible fallar de forma visible.

**Decisión:** `js/catalogo.js` valida la estructura antes de renderizar (arrays presentes, ids únicos dentro de cada array, tipos de campo, referencias resolubles). Si la validación falla, la vista entra en estado de error (D7) y no se dibuja ninguna fila. El modo de falla es cerrado: se prefiere una tabla vacía con mensaje de error antes que datos a medio resolver.

### D3 — Semillas estáticas, planas y serializables

Los arrays semilla se declaran como literales en `js/data.js`. No hay `Date.now()`, ni ids generados, ni funciones dentro de los objetos, ni referencias circulares.

**Por qué:** M06 va a persistir estas estructuras en `localStorage` tal cual, y M05 va a guardar copias del precio unitario. Un objeto con métodos o con ids generados en cada carga rompería la comparación entre sesiones y duplicaría registros al recargar. Todo valor debe sobrevivir a `JSON.stringify` / `JSON.parse` sin pérdida.

**Verificación de la regla:** las semillas se pueden copiar a la consola, serializar y volver a parsear obteniendo estructuras equivalentes.

### D4 — Namespace global único por archivo, sin módulos ES

`js/data.js` publica `Datos`; `js/catalogo.js` publica `Catalogo`; `js/navegacion.js` publica `Navegacion`. No se usan `import`, `export`, `type="module"`, bundler ni IIFE que oculte el contrato.

**Por qué:** con `type="module"` los scripts se cargan en modo estricto y diferido, y cualquier consumo desde la consola o desde otro archivo obliga a rutas y CORS que el proyecto no necesita. Objetos globales planos son consumibles por M04 y M05 con sólo incluir la etiqueta de script en orden. El costo —contaminar el scope global— se acota publicando exactamente tres nombres y dejando el resto en funciones internas de cada archivo.

**Alternativa descartada:** un único archivo `js/app.js` con todo. Rompería la división modular de `AGENTS.md` §3 y mezclaría responsabilidades distintas (datos, presentación del catálogo, navegación) en un mismo archivo.

### D5 — Búsqueda pura, con la lista inyectable

```js
Datos.buscarLibrosPorTitulo(texto, libros = Datos.libros) // → Libro[]
```

Recibe el texto y, opcionalmente, la lista; devuelve un **array nuevo** con las referencias que coinciden. No toca el DOM, no muta la lista recibida y no lee variables globales cuando se le pasa la lista.

**Por qué:** la consigna pide una función pura y verificable, pero la API pública que consumen M04/M05 se lee mejor como `Datos.buscarLibrosPorTitulo(texto)`. El segundo parámetro opcional resuelve las dos cosas sin duplicar funciones: la llamada pública sigue siendo de un argumento y la verificación manual puede probar casos con listas arbitrarias desde la consola.

**Regla de normalización:** `texto.trim().toLowerCase()` y `titulo.toLowerCase().includes(consulta)`. Texto vacío o sólo con espacios devuelve una copia del catálogo completo (`libros.slice()`), nunca la misma referencia, para que el llamador no pueda mutar el arreglo semilla por accidente.

**Lo que no hace:** no normaliza acentos ni separa en palabras. Se documenta como limitación conocida y no se agrega normalización Unicode, que excede la consigna.

### D6 — Render con `createElement` + `textContent` y cinco columnas (sin ISBN)

`Catalogo.render()` vacía `#cuerpo-tabla-catalogo` reconstruyendo el `<tbody>` con `document.createElement("tr")` y `document.createElement("td")`, asignando cada valor con `textContent`. Los nodos se acumulan en un `DocumentFragment` y se insertan una sola vez.

**Orden de columnas (contrato):** Título, Autor/es, Editorial, Género, Precio. **Cinco celdas por fila.**

- **Autor/es:** se resuelven los `autorIds` en orden contra `Datos.autores` y se unen con `", "` (coma y espacio). Sin duplicados.
- **Editorial:** se resuelve `editorialId` contra `Datos.editoriales`.
- **Género:** `null` se muestra exactamente como «Sin clasificar»; un id que no resuelve es error estructural (D2).
- **Precio:** `precio.toFixed(2)`, sin símbolo de moneda ni separador de miles (el encabezado ya dice «Precio» y M02 decide la presentación).

**Por qué `textContent`:** es la única forma segura de insertar datos sin interpretar HTML; un título con `<` no puede romper ni inyectar nada. El `DocumentFragment` evita el reflow por fila.

**Decisión del usuario — sin columna ISBN:** la tabla de `index.html` no tiene columna ISBN y el usuario decidió no agregarla aunque el Ejercicio 3 lo pida. El render se alinea con el markup existente (cinco columnas) y el campo `isbn` se conserva en el modelo. Queda como desvío consciente registrado en `proposal.md`; si se revierte, el cambio se limita a un `<th>`/`<td>` adicional.

### D7 — Tres estados excluyentes, derivados del mismo render

`render()` decide el estado al final de cada pasada y limpia los mensajes que no corresponden (`textContent = ""`):

| Condición | `#cuerpo-tabla-catalogo` | Mensaje |
| --- | --- | --- |
| Datos inválidos o contenedores ausentes | vacío | `#mensaje-catalogo-error`: «No se pudo cargar el catálogo. Recargá la página o revisá los datos guardados.» |
| `Datos.libros` vacío (sin importar la búsqueda) | vacío | `#mensaje-catalogo-vacio`: «Todavía no hay libros cargados en el catálogo.» |
| Búsqueda no vacía y cero coincidencias | vacío | `#mensaje-catalogo-sin-resultados`: «No se encontraron libros cuyo título coincida con la búsqueda.» |
| Coincidencias, o búsqueda vacía con libros | filas | los tres mensajes vacíos |

**Por qué:** los tres estados son excluyentes y el orden de precedencia (error > vacío > sin resultados > con datos) evita mensajes contradictorios del tipo «catálogo vacío» y «sin resultados» al mismo tiempo. No se usa `hidden` porque M01 entregó los contenedores visibles y vacíos: un `textContent` vacío no ocupa espacio visible ni lo anuncia el lector de pantalla.

**`render()` es idempotente y respeta el filtro vigente:** lee el valor actual de `#buscador-catalogo` en cada llamada. Por eso M04 puede llamar `Catalogo.render()` después de un alta y el usuario conserva lo que estaba buscando.

### D8 — Cableado del filtro en vivo y render inicial

El script se carga al final de `<body>`, inmediatamente después del markup, así que el DOM ya existe: no se usa `DOMContentLoaded`. Al evaluarse `js/catalogo.js` se registra un único listener `input` sobre `#buscador-catalogo` y se ejecuta `Catalogo.render()` una vez.

- Sin botón «Buscar» (M01 no lo entregó y el `design.md` de M01 lo confirma).
- La suscripción se hace una sola vez; se protege con una bandera interna para que una doble inclusión del script no duplique listeners.
- Si `#buscador-catalogo` no existe, se entra en estado de error y no se rompe el resto de la página.

**Por qué:** el evento `input` cubre tecleo, pegado y borrado, y es el que exige el filtrado en vivo. Evitar `DOMContentLoaded` reduce un punto de falla y hace el orden de carga explícito.

### D9 — El error de datos es visible y no silencioso

La validación y el render corren dentro de un `try`/`catch` propio. Cualquier excepción se traduce al estado de error de D7 y se registra con `console.error` conservando el detalle técnico para depurar.

**Por qué:** sin esto, un error de sintaxis en `data.js` o un `localStorage` corrupto dejaría la tabla vacía sin explicación, que es justo el síntoma que CP-07 debe poder distinguir de «no hay datos».

### D10 — Alcance de edición de `index.html`: tres líneas, en orden

Se agregan exactamente estas tres líneas dentro del bloque «M03-M06: scripts de la aplicación», respetando el orden de dependencia:

```html
<script src="js/data.js"></script>
<script src="js/catalogo.js"></script>
<script src="js/navegacion.js"></script>
```

No se agrega `defer`, `async`, `type="module"`, ni ninguna otra etiqueta. No se modifica ninguna otra zona del documento.

**Por qué:** el bloque reservado por M01 es el único punto de extensión válido; `defer` no es necesario porque el bloque ya está al final del `body`, y los scripts clásicos ejecutan en orden de aparición. `navegacion.js` va último porque no depende de los datos y así el catálogo ya está renderizado cuando se ocultan las vistas inactivas, lo que evita un parpadeo de contenido apilado.

### D11 — API pública y contrato para M04/M05

| Símbolo | Tipo | Firma | Uso |
| --- | --- | --- | --- |
| `Datos.libros` | `Libro[]` | — | Fuente de verdad del catálogo; M04 agrega, M05 lee |
| `Datos.editoriales` | `Editorial[]` | — | Poblar `#libro-editorial` (M04) y resolver nombres |
| `Datos.generos` | `Genero[]` | — | Poblar `#libro-genero` (M04) y resolver nombres |
| `Datos.autores` | `Autor[]` | — | Poblar `#libro-autores` (M04) y resolver nombres |
| `Datos.clientes` | `Cliente[]` | — | Poblar `#venta-cliente` (M04) |
| `Datos.buscarLibrosPorTitulo` | `function` | `(texto, libros = Datos.libros) → Libro[]` | Búsqueda parcial, sin distinguir mayúsculas, pura |
| `Catalogo.render` | `function` | `() → void` | Re-renderiza el catálogo respetando el filtro vigente |
| `Navegacion.mostrarVista` | `function` | `(idVista) → void` (`"catalogo" \| "libros" \| "clientes" \| "ventas" \| "historial"`) | Cambia la vista activa; la usan M04 (tras un alta) y M05 (tras confirmar una venta) |

**Formas de las entidades:**

```js
Editorial: { id, nombre }
Genero:    { id, nombre }
Autor:     { id, nombre }
Cliente:   { id, nombre, email }
Libro:     { id, titulo, isbn, precio, editorialId, generoId|null, autorIds[] }
```

**Regla de evolución:** agregar campos es compatible; renombrar o quitar los existentes es **BREAKING** para M04/M05/M06 y exige un change nuevo con aviso al equipo.

**Por qué un contrato explícito:** M04 y M05 trabajan en paralelo sobre estos arrays; sin una tabla normativa, cada uno inventaría su propio formato y M06 terminaría migrando datos a mano.

### D12 — Navegación entre vistas con `hidden`, hash de la URL y `aria-current`

`js/navegacion.js` implementa el intercambio delegado por M01:

- Las cinco vistas son las `<section class="vista">` con `id` `#vista-catalogo`, `#vista-libros`, `#vista-clientes`, `#vista-ventas` y `#vista-historial`.
- `Navegacion.mostrarVista(idVista)` oculta todas las secciones con `hidden = true`, muestra la pedida con `hidden = false` y marca su enlace del nav con `aria-current="page"` (quitándolo de los demás).
- **Estado en la URL:** el hash (`#vista-libros`) es la fuente de verdad. Al cargar se lee `location.hash`; si no corresponde a una vista válida, se muestra Catálogo sin reescribir la URL. Al hacer clic en un enlace se deja actuar al navegador (sin `preventDefault`) y el evento `hashchange` aplica el cambio.
- `mostrarVista(idVista)` aplica la vista y, si el hash no coincide, asigna `location.hash` (lo que dispara `hashchange` y vuelve a aplicar la misma vista de forma idempotente). **No se usa `history.replaceState`**: al abrir la página con `file://` el origen es `null` y el navegador bloquea `pushState`/`replaceState` con URL. La carga inicial no agrega hash: la URL sin hash equivale a la vista Catálogo.
- Si el `id` solicitado no existe, no se oculta nada y se registra el problema en consola: una vista en blanco es peor que una vista de más.
- La API expuesta es mínima: `Navegacion.mostrarVista(idVista)`. Lo demás (listeners, resolución de enlaces) queda encapsulado.

**Por qué `hidden`:** lo fijó el `design.md` de M01 (D2). Es nativo, accesible (saca la sección del árbol de accesibilidad), no depende de CSS y no obliga a M02 a saber qué vista está activa.

**Por qué el hash y no `preventDefault` + `pushState`:** dejar que el navegador cambie el hash conserva la semántica de los enlaces de M01, mantiene las URLs compartibles y no obliga a reimplementar el historial. El costo es que el navegador intenta desplazarse a la sección; como sólo una está visible, el desplazamiento es al inicio de esa vista, que es el comportamiento esperado.

**Riesgo conocido (M02):** una regla de autor como `.vista { display: grid; }` **pisa** el `display: none` que el navegador aplica a `[hidden]`, y las cinco vistas volverían a verse apiladas. M02 debe incluir `[hidden] { display: none; }` en su hoja de estilos. Hoy no existe CSS, así que el comportamiento es correcto; se avisa al equipo y se documenta en `proposal.md`.

**Alternativas descartadas:** ocultar con `style.display` (mezcla presentación con comportamiento y pelea con M02); interceptar el clic con `preventDefault()` y manipular el hash a mano (duplica lógica que el navegador ya resuelve).

## Contrato de datos semilla

Cantidades mínimas exigidas por la consigna y por `AGENTS.md` §4 (Ejercicio 3): **6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes**.

| Entidad | Cantidad | Ids |
| --- | --- | --- |
| Editoriales | 2 | `edi-01`, `edi-02` |
| Géneros | 2 | `gen-01`, `gen-02` |
| Autores | 3 | `aut-01`, `aut-02`, `aut-03` |
| Libros | 6 | `lib-01` … `lib-06` |
| Clientes | 3 | `cli-01`, `cli-02`, `cli-03` |

Condiciones que las semillas deben cumplir y que se verifican a mano:

1. Al menos un libro con `generoId: null` (ejercita «Sin clasificar»).
2. Al menos un libro con dos autores (ejercita el separador `", "`).
3. Al menos un precio con decimales no nulos (ejercita `toFixed(2)`).
4. Todos los ISBN únicos, sin guiones ni espacios (M04 validará duplicados sobre esta base); el campo existe y no se muestra.
5. Todos los `editorialId` y `autorIds` resolubles; ningún `generoId` apunta a un id inexistente.

## Assumptions

- M01 no cambia los `id` del contrato; M03 los consume tal cual están hoy.
- El catálogo semilla nunca queda vacío en la entrega (las 6 semillas se cargan siempre), así que el estado «catálogo vacío» se verifica vaciando `Datos.libros` desde la consola.
- M06 puede reemplazar el contenido de los arrays (`Datos.libros.length = 0` y recarga) sin que `catalogo.js` necesite cambios, porque el render siempre lee el array actual.
- M02 no definirá `display` sobre `.vista` sin incluir la regla `[hidden] { display: none; }`.

## Risks / Trade-offs

- **El catálogo no muestra el ISBN aunque el Ejercicio 3 lo pida** → desvío consciente aprobado por el usuario y registrado en `proposal.md`. Mitigación: el dato está en el modelo y revertirlo es un cambio de markup más una celda.
- **M02 puede romper el ocultamiento con una regla `display`** → se avisa al equipo y se documenta la regla `[hidden]` requerida; la verificación de CP-08 al cerrar M02 debe incluir que sólo se vea una vista.
- **Ids legibles y precios como números pueden parecer «datos rígidos» al dar de alta** → M04 debe generar el siguiente id disponible (`lib-07`, …) y parsear el precio con `Number`. Se documenta en la API para que no invente otro esquema.
- **Validación estricta = falla cerrada** → un solo registro corrupto oculta el catálogo completo. Se acepta porque el mensaje es explícito y el origen típico (edición manual de `localStorage`) es un error que conviene ver, no ocultar.
- **Búsqueda sin normalización de acentos** → «cortazar» no encuentra «Cortázar». Se acepta por alcance; la consigna sólo exige mayúsculas/minúsculas y `trim()`.
- **Tres namespaces globales** → `Datos`, `Catalogo` y `Navegacion` en `window`. Se acepta por la prohibición de módulos y build; el resto de cada archivo queda encapsulado.
- **`render()` reconstruye toda la tabla en cada tecla** → con 6 libros es despreciable; con cientos seguiría siendo aceptable porque no hay nodos complejos ni imágenes. No se agrega debounce para no introducir latencia artificial.
- **Dependencia del hash para el estado de la vista** → si el usuario abre `index.html` con un hash de otra página, se cae a Catálogo. Se acepta y se documenta.
- **`history.replaceState` bloqueado en `file://`** → el origen es `null` y el navegador lanza `SecurityError`. Por eso la navegación usa sólo `location.hash` y el evento `hashchange`, y la carga inicial no reescribe la URL. Afecta a cualquier módulo futuro que quiera manipular el historial: no debe usar `pushState`/`replaceState` mientras la aplicación se abra como archivo local.

## Migration Plan

No hay datos previos que migrar: la aplicación aún no persiste nada (M06 lo hará). El rollback consiste en borrar `js/data.js`, `js/catalogo.js` y `js/navegacion.js` y quitar las tres líneas de `<script>` del bloque reservado; `index.html` vuelve al estado de M01 y las cinco vistas quedan apiladas como antes.

## Open Questions

Ninguna pendiente que bloquee la implementación. Las dos decisiones que estaban abiertas —columna ISBN y navegación entre vistas— fueron resueltas por el usuario: no se muestra el ISBN y la navegación se incorpora a este change.
