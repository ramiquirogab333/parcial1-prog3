# Design

## Context

M01 y M03 están archivados. `index.html` ya tiene `#form-libro` y `#form-cliente` con sus controles, sus contenedores `#mensaje-libro` y `#mensaje-cliente` (con `role="alert"`), las tablas `#cuerpo-tabla-libros` y `#cuerpo-tabla-clientes` y los mensajes de lista vacía. `js/data.js` publica `Datos.*` y `js/catalogo.js` publica `Catalogo.render()`, idempotente y respetuoso del filtro vigente (D7 de M03).

Restricciones:

- JavaScript nativo, sin frameworks, CDN, módulos ES, build ni `fetch` (`AGENTS.md` §2).
- Prohibido `innerHTML` con datos: sólo `textContent` y nodos creados con `createElement`.
- `index.html` es de M01: M04 sólo agrega sus `<script src>` en el bloque reservado.
- Contrato de datos de M03 (D11): campos `autorIds` en libros y `nombre` en clientes; renombrarlos sería BREAKING.
- Sin test runner: la verificación es manual en el navegador y en la consola.

## Goals / Non-Goals

**Goals:**

- Poblar los selectores del formulario de libros desde los datos locales.
- Validar cada alta con funciones puras, verificables desde la consola.
- Agregar registros con la misma forma que las semillas, para que el catálogo de M03 y la persistencia de M06 los traten igual.
- Mostrar todos los motivos de rechazo juntos, en texto, cerca del formulario.
- Actualizar listados, catálogo y selectores de venta sin recargar.

**Non-Goals:**

- Editar o eliminar libros y clientes.
- ABM de editoriales, géneros y autores.
- Dígito de control del ISBN.
- Guardar en `localStorage` (M06), composición de ventas (M05), estilos (M02).

## Decisions

### D1 — Un archivo por entidad, cada uno con su namespace

`js/libros.js` publica `Libros` y `js/clientes.js` publica `Clientes`, ambos con el patrón IIFE que ya usa `Catalogo`. Cada archivo es autocontenido: los tres helpers chicos que necesitan los dos (`obtener`, `crearCelda`, `siguienteId`) se repiten en vez de crear un cuarto archivo compartido.

**Por qué:** respeta la división de archivos de `AGENTS.md` §3 y evita una abstracción que la consigna no pide. La duplicación son menos de diez líneas.

### D2 — Validación pura separada del manejo del DOM

`Libros.validar(entrada)` y `Clientes.validar(entrada)` reciben un objeto plano con los valores leídos del formulario y devuelven un array de mensajes. No tocan el DOM ni modifican `Datos`. El manejador de `submit` lee el formulario, llama a la validación, y sólo si el array está vacío construye el registro y lo agrega.

**Por qué:** permite probar cada regla desde la consola sin completar el formulario (por ejemplo `Libros.validar({ titulo: "X", isbn: "978-84-376-0457-2", precio: "10", editorialId: "edi-01", generoId: "", autorIds: ["aut-01"] })`) y garantiza que un rechazo nunca deja datos a medio agregar.

**Entrada de libros:** `{ titulo, isbn, precio, editorialId, generoId, autorIds }`, donde `precio` es el string del input y `generoId` es `""` para «Sin clasificar».
**Entrada de clientes:** `{ nombre, email }`.

### D3 — Normalización para comparar y para guardar

- **ISBN:** se quitan espacios y guiones (`/[\s-]/g`) tanto para comparar como para guardar, coherente con D1 de M03 (el ISBN se guarda sin guiones ni espacios).
- **Email:** se compara con `trim().toLowerCase()`; se guarda con `trim()` tal como lo escribió el usuario.
- **Precio:** `Number(valor)`; un string vacío se rechaza antes de convertir porque `Number("")` es `0`.
- **Formato de email:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Es deliberadamente simple: alcanza para los casos de la consigna y no pretende cubrir el RFC.

### D4 — Ids con el siguiente número del prefijo

`siguienteId(coleccion, prefijo)` busca el mayor número entre los `id` con forma `<prefijo>-NN` y devuelve el siguiente con dos dígitos mínimos (`lib-07`, `cli-04`).

**Por qué:** es lo que pide la sección de riesgos del `design.md` de M03. Un id basado en `Date.now()` no sería estable ni legible, y contar `length + 1` se rompe si M06 alguna vez recupera colecciones con huecos.

### D5 — Selectores: qué se conserva del markup de M01

- `#libro-editorial`: se conserva una opción inicial con `value=""` («Seleccione una editorial…»), así el envío sin elegir falla con un mensaje claro.
- `#libro-genero`: la opción inicial pasa a ser «Sin clasificar» con `value=""`, como exige la consigna.
- `#libro-autores` (`multiple`): se quitan todas las opciones, incluida la de `value=""` del markup inicial, porque en un selector múltiple una opción vacía es seleccionable y confundiría la validación.

Las opciones se crean con `new Option(texto, valor)`, que asigna el texto como texto y nunca como HTML.

### D6 — Selectores de la vista Ventas pobladas por M04

M04 regenera `#venta-libro` (texto: título y precio con dos decimales) y `#venta-cliente` (texto: nombre y email) al cargar y tras cada alta, conservando su opción inicial `value=""`.

**Por qué:** la tabla D11 de M03 asigna a M04 el poblado de `#venta-cliente`, y CP-02/CP-03 exigen que el registro nuevo aparezca en la selección de venta. Hacerlo desde M04 evita que M05 tenga que enterarse de cada alta. Si M05 prefiere poblarlos él, alcanza con escuchar `datos-actualizados` y M04 puede dejar de hacerlo en un change chico.

### D7 — Evento `datos-actualizados` en vez de llamar a M06

Tras cada alta correcta se ejecuta `document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "libros" } }))` (o `"clientes"`).

**Por qué:** M06 todavía no existe y M04 no puede depender de un nombre que no se publicó. Con el evento, M06 sólo escucha y guarda; el orden de los `<script>` no importa para la persistencia.

### D8 — Mensajes y campos inválidos

Ante un rechazo, `#mensaje-libro` recibe `"No se pudo dar de alta el libro: "` seguido de los motivos separados por espacios, y la clase `mensaje--error`. Ante un éxito, `"Libro «<título>» dado de alta correctamente."` y la clase `mensaje--exito`. El texto ya dice el resultado; el color de M02 es complementario. Los controles asociados a cada motivo reciben `aria-invalid="true"`, que se limpia al comienzo de cada envío. No se fuerza el cambio de vista tras el alta: el usuario ve el registro en el listado de la misma vista.

### D9 — Orden de carga

```html
<script src="js/data.js"></script>
<script src="js/catalogo.js"></script>
<script src="js/navegacion.js"></script>
<script src="js/libros.js"></script>
<script src="js/clientes.js"></script>
```

Igual que M03, cada archivo llama a su `iniciar()` al final; el DOM ya está parseado porque los scripts van al final del `body`.

## Risks / Trade-offs

- **Regex de email simple** → acepta direcciones raras como `a@b.c`. Se acepta: la consigna pide formato válido básico, no verificación real.
- **Sin persistencia hasta M06** → las altas se pierden al recargar. Es esperado; el evento D7 es el punto de enganche.
- **M04 toca selectores de la vista Ventas** → posible solapamiento con M05. Mitigación: queda documentado en D6 y M05 decide al escribir su propuesta.
- **Precio sin redondeo** → si alguien ingresa `10.555`, se guarda tal cual y se muestra `10.56`. Se acepta: el input ya tiene `step="0.01"` y el cálculo con precio histórico es de M05.
