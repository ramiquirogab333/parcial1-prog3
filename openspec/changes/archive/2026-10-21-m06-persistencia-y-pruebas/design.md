# Design

## Context

Los ejercicios 1 a 5 están implementados y archivados: `index.html` (M01), `style.css` (M02), `js/data.js` + `js/catalogo.js` + `js/navegacion.js` (M03), `js/libros.js` + `js/clientes.js` (M04) y `js/ventas.js` + `js/historial.js` (M05). La aplicación corre 100 % en el navegador, sin frameworks, sin build y sin red.

Estado relevante para este change:

- **`Datos` (M03)** expone `editoriales`, `generos`, `autores`, `libros` y `clientes` como objetos planos y serializables, más `Datos.buscarLibrosPorTitulo(texto)`. `Datos.ventas` **no** está declarado en `data.js`: lo crea `ventas.js` en su `iniciar()` si no es un array.
- **El gancho de persistencia ya existe**: M04 y M05 disparan `document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "libros" | "clientes" | "ventas" } }))` después de cada alta o venta confirmada. El `design.md` de M04 (decisión D7) explica explícitamente que ese evento existe para que M06 escuche y guarde sin que M04 dependa de `js/storage.js`.
- **El gancho de redibujado ya existe**: `Libros.render()`, `Clientes.render()` y `Historial.render()` están marcados en su código como "M06 lo puede llamar tras recuperar datos guardados". El `design.md` de M05 ("Contrato para M06") dice que M06 debe rellenar `Datos.ventas` **antes** de llamar a `Historial.render()`.
- **El `design.md` de M03 autoriza explícitamente** que M06 reemplace el contenido de los arrays (`Datos.libros.length = 0` y recarga) sin que `catalogo.js` necesite cambios.
- **M01 reservó dos contenedores de mensaje para M06**: `#mensaje-catalogo-error` ("Error de lectura de datos") y `#mensaje-historial-error` ("Error al leer ventas guardadas"). También dejó el bloque `<!-- M03-M06: scripts de la aplicación -->` en el `body` para las etiquetas `<script>` de los módulos.
- **Restricción del equipo**: nadie edita el archivo de otro módulo. El único archivo ajeno que este change toca es `index.html`, y sólo para agregar una etiqueta `<script>`.

Restricción de la consigna que condiciona el diseño: el docente debe poder **modificar únicamente el precio de un libro dentro del catálogo guardado en `localStorage`** con las herramientas de almacenamiento del navegador, y después comprobar que el historial conserva los importes confirmados. Eso obliga a que la clave y la estructura del catálogo guardado sean simples y estén documentadas.

## Goals / Non-Goals

**Goals:**

- Conservar libros, clientes y ventas entre sesiones, con siembra idempotente de los ejemplos y sin duplicar los datos iniciales.
- No romper la aplicación si lo guardado está corrupto o si `localStorage` no está disponible.
- Dejar la ubicación y la estructura de lo guardado documentadas de forma reproducible en el `README`.
- Poder registrar en el `README` el resultado **observado** de los ocho casos de prueba, sin declarar aprobado nada que no se haya ejecutado.

**Non-Goals:**

- No se persisten `editoriales`, `generos` ni `autores`: ninguna vista los modifica, de modo que siempre se toman de las semillas de `Datos`.
- No hay edición ni eliminación de registros desde la interfaz, ni una pantalla de edición de precios (la consigna dice que no se exige).
- No hay red, backend, sincronización entre dispositivos ni entre usuarios.
- No se cambia el comportamiento ya especificado de los ejercicios 1 a 5: este change no modifica ninguna requirement existente.

## Decisions

### D1 — Un módulo `Almacenamiento` con el patrón del proyecto

`js/storage.js` expone `var Almacenamiento = (function () { "use strict"; … })();` con `iniciar()`, `cargar()`, `guardar()`, `restablecer()` y `claves()`, siguiendo el mismo patrón de IIFE, `IDS`/`TEXTOS` y `iniciar()` idempotente que usan `Catalogo`, `Libros`, `Clientes`, `Ventas` y `Historial`.

**Por qué:** los cinco módulos anteriores son el patrón de facto del equipo; un módulo con otra forma rompería la coherencia y dificultaría la revisión. El nombre es en español y sin tilde, igual que `Catalogo`, `Navegacion` y `Datos`.

**Alternativa considerada:** una clase ES6. Se descarta: el proyecto usa `var` + IIFE en todos los módulos y no usa ninguna otra sintaxis moderna salvo `Object.freeze` y `Array.isArray`.

### D2 — Tres claves, una por colección

| Clave | Contenido |
| --- | --- |
| `libreria.libros` | Array JSON de libros |
| `libreria.clientes` | Array JSON de clientes |
| `libreria.ventas` | Array JSON de ventas |

Cada valor es `JSON.stringify(array)`. Los nombres llevan el prefijo `libreria.` para no colisionar con otras aplicaciones que compartan origen.

**Por qué:** la consigna nombra exactamente "libros, clientes y ventas". Una clave por colección hace trivial la comprobación guiada del CP-06 (el docente edita un solo array: cambia `"precio": 1500` por `"precio": 9999` y no toca nada más), permite resetear una colección sin las otras, y aísla los fallos: un JSON inválido en `libreria.ventas` no impide recuperar los libros.

**Alternativas consideradas:**
- *Una sola clave con todo el estado* (`libreria.datos`): un solo `JSON.stringify` por guardado, pero el docente tendría que editar un objeto anidado y un error en una venta invalidaría todo el estado. Se descarta.
- *Una clave por registro* (`libreria.libro.lib-01`): fácil de editar un libro puntual, pero obliga a enumerar claves para listar y complica la siembra idempotente. Se descarta.

### D3 — La siembra se decide por existencia de la clave, no por tamaño

Al cargar, para cada colección: si **la clave no existe**, se escribe la semilla; si **existe**, se restaura lo que haya.

**Por qué:** el criterio "existe la clave" es el único que garantiza que los ejemplos no se dupliquen. Un criterio por tamaño (sembrar si el array está vacío) reintroduciría los ejemplos en el caso legítimo de una colección vacía.

**Por qué no se persisten las colecciones de referencia:** `editoriales`, `generos` y `autores` no los modifica ninguna vista; persistirlos agregaría claves que nunca cambian y que el docente tendría que ignorar al inspeccionar el almacenamiento.

### D4 — Restauración in-place, no reasignación de la referencia

Para cada colección se hace `coleccion.length = 0` y luego se agrega el contenido restaurado sobre el **mismo** array. No se asigna un array nuevo a `Datos.libros`, `Datos.clientes` ni `Datos.ventas`.

**Por qué:** es la forma que el `design.md` de M03 autorizó expresamente, y es la más conservadora: si algún módulo ya guardó una referencia al array, sigue siendo el mismo objeto. `libros.js`, `clientes.js`, `ventas.js` e `historial.js` leen `Datos.<coleccion>` en cada uso, de modo que none necesita cambios.

**Consecuencia:** `Datos.ventas` debe existir como array antes de restaurar. `storage.js` se encarga de garantizarlo (`si (!Array.isArray(Datos.ventas)) { Datos.ventas = []; }`) porque `data.js` no lo declara y `ventas.js` lo crea en su `iniciar()`.

### D5 — Validación estructural por colección; la colección inválida se descarta entera

Una colección guardada se acepta sólo si: el JSON se puede parsear, el resultado es un array, y **todos** sus registros son estructuralmente válidos:

| Colección | Campos que un registro debe tener |
| --- | --- |
| `libreria.libros` | `id` (string no vacío), `titulo` (string), `isbn` (string), `precio` (number > 0), `editorialId` (string), `autorIds` (array no vacío), `generoId` (string o `null`) |
| `libreria.clientes` | `id` (string no vacío), `nombre` (string no vacío), `email` (string no vacío) |
| `libreria.ventas` | `id` (string no vacío), `fecha` (string), `clienteId` (string), `clienteNombre` (string), `renglones` (array), `total` (number), y cada renglón con `libroId`, `titulo`, `cantidad` (number), `precioUnitario` (number) y `subtotal` (number) |

Si una colección no cumple, se descarta **completa**, se vuelve a la semilla y se avisa. El aviso va a `#mensaje-catalogo-error` (libros y clientes) o a `#mensaje-historial-error` (ventas), los dos contenedores que M01 reservó para M06.

**Por qué:** el `design.md` de M03 anticipa exactamente este riesgo ("se podrá romper si M06 carga datos corruptos de `localStorage`"). Descartar la colección entera y volver a la semilla deja la aplicación siempre en un estado coherente y con un mensaje visible; el criterio "todo o nada" es simple de explicar y de verificar.

**Por qué una validación tan específica y no sólo "es un array":** porque los consumidores no toleran registros a medio construir. `catalogo.js` valida el modelo de libros por su cuenta (`validarDatos()`), pero `historial.js` **no** valida: itera `venta.renglones` sin comprobar nada, y una venta con `renglones` ausente rompe el render. La validación de M06 tiene que ser anterior y más estricta que la del consumidor.

**Consecuencia aceptada:** una sola venta inválida descarta el historial completo y lo repone con la semilla. Se acepta porque el escenario es de corrupción manual, es detectable (queda un aviso visible) y es preferible a dejar el historial a medias.

### D6 — El precio se normaliza al restaurar

Si el `precio` de un libro guardado llega como texto numérico (`"1500"`), se convierte a número al restaurar.

**Por qué:** el CP-06 lo guía el docente editando el catálogo guardado con las herramientas de almacenamiento del navegador, y es fácil que el precio quede entre comillas. Sin esta normalización, el catálogo no pasaría la validación y el catálogo guardado se descartaría —justo el escenario que la comprobación necesita observar. Con ella, un precio escrito como texto sigue funcionando y el catálogo guardado se vuelve a persistir con el precio como número.

**Consecuencia:** la normalización cambia el valor persistido respecto del que el docente editó a mano. Se documenta en el `README`.

### D7 — `js/storage.js` se carga último

En `index.html`, la etiqueta `<script src="js/storage.js"></script>` va al final del bloque `<!-- M03-M06: scripts de la aplicación -->`, después de `js/historial.js`.

**Por qué:** (a) no intercala el archivo de M06 entre archivos de otro módulo; (b) al cargarse, los cinco módulos anteriores ya se inicializaron y ya exploraron el DOM, así que `storage.js` puede pedirles que se redibujen; (c) los scripts son síncronos y se ejecutan en la misma tarea de renderizado, de modo que el usuario no llega a ver el estado con los ejemplos: el repintado ocurre después de que `storage.js` haya restaurado los datos.

**Alternativa considerada:** cargar `storage.js` justo después de `data.js`, para que los demás módulos arrancaran directamente con los datos restaurados. Se descarta porque intercala el archivo de M06 entre los de M03 y obliga a `storage.js` a guardarse referencias a módulos que todavía no existen.

**Consecuencia:** `Historial.iniciar()` dibuja el historial vacío y `storage.js` lo vuelve a dibujar con las ventas recuperadas. `Ventas.render()` hace lo mismo con el ticket, que además siempre arranca vacío (el ticket no se persiste).

### D8 — El guardado es reactivo y total

`storage.js` registra `document.addEventListener("datos-actualizados", …)` y, ante cualquier disparo, re-escribe **las tres** colecciones.

**Por qué:** el evento ya existe y M04/M05 lo publican tras cada alta y cada venta. Se guardan las tres colecciones en vez de usar `detail.coleccion` porque `detail.coleccion` es informativo: si algún módulo lo disparara sin `detail` o con un valor inesperado, guardar sólo esa colección dejaría las demás desactualizadas. El costo es despreciable (tres arrays chicos) y la simplicity evita un modo de fallo silencioso. `detail.coleccion` se usa sólo para el texto informativo del mensaje de consola.

**Alternativa considerada:** guardar únicamente la colección indicada en `detail.coleccion`. Se descarta por el modo de fallo descrito.

### D9 — Tras restaurar se redibujan las cinco vistas

En este orden: `Catalogo.render()`, `Libros.render()`, `Clientes.render()`, `Historial.render()`, `Ventas.render()`. Cada llamada va protegida con `typeof X !== "undefined"` para que el orden de los scripts no rompa nada.

**Por qué:** `Libros.render()` repuebla `#libro-editorial`, `#libro-genero`, `#libro-autores` y `#venta-libro`; `Clientes.render()` repuebla `#venta-cliente`. Sin ellos, los selectores de la vista Ventas mostrarían los ejemplos y no los registros guardados. `Historial.render()` redibuja el historial desde `Datos.ventas`, que ya fue rellenado.

### D10 — Los mensajes de error se escriben después de los renders

`Catalogo.render()` llama a `limpiarMensajes()`, que vacía `#mensaje-catalogo-error` en cada ejecución. Por eso `storage.js` escribe sus avisos **después** de pedir los renders.

**Por qué:** si se escribieran antes, el propio render de M03 los borraría y el usuario nunca vería el aviso.

### D11 — Acceso a `localStorage` siempre protegido

Ninguna operación toca `window.localStorage` directamente: un helper `almacen()` devuelve `null` cuando el acceso no está disponible (navegación privada, cookies de terceros bloqueadas, `file://` restringido) y todas las lecturas y escrituras van en `try/catch`.

**Por qué:** en algunos navegadores el acceso a `localStorage` **lanza una excepción** al leer la propiedad, no sólo al escribir. Un acceso directo sin proteger rompería la carga de la página entera.

### D12 — `Almacenamiento.restablecer()`

Borra las tres claves y vuelve a sembrar desde `Datos`. Es la herramienta de apoyo para repetir los casos de prueba desde un estado conocido y para la defensa.

**Por qué:** sin ella, quien quiera reproducir el CP-07 tiene que borrar el almacenamiento a mano en cada navegador, y el estado de la aplicación quedaría atado a una máquina concreta.

## Risks / Trade-offs

- **Un registro corrupto descarta la colección entera de esa clave** → se avisa por mensaje visible, se repone la semilla y la aplicación queda usable. Aceptado: la corrupción es manual y detectable.
- **El `README` describe una estructura que puede desactualizarse si cambia el modelo de datos** → las claves y la forma de los registros se documentan desde el propio código (`Almacenamiento.claves()` y el ejemplo JSON del `README`), y el `README` se actualiza en el mismo change que cambie el modelo.
- **`localStorage` no es una base de datos**: no hay consultas, ni índices, ni control de concurrencia → la consigna no lo pide y la cantidad de datos es de escala humana. Se acepta.
- **El almacenamiento depende del origen**: la misma aplicación abierta desde `file://` y desde `http://localhost:8080` guarda en lugares distintos → se documenta en el `README` como parte de las limitaciones del almacenamiento.
- **Un `localStorage` preexisting con las mismas claves y otro formato** se detectaría como colección inválida → se descarta y se repone la semilla, con aviso.
- **La normalización del precio (D6) reescribe el valor editado a mano** → se documenta en el `README`; el efecto buscado por el CP-06 (que el historial conserve los importes confirmados) no se ve afectado, porque la venta guarda su propio `precioUnitario`.

## Migration Plan

No hay migración: es una funcionalidad nueva sobre datos que hoy no se persisten.

**Puesta en marcha:** agregar `js/storage.js` y su etiqueta `<script>` en `index.html`. En la primera apertura el almacenamiento queda sembrado con los ejemplos.

**Reversión:** borrar `js/storage.js`, quitar la etiqueta `<script>` de `index.html` y borrar el `README.md`. Las tres claves quedan huérfanas en el navegador, sin efecto sobre la aplicación.

## Verification Approach

Los ocho casos de la consigna se ejecutan de verdad en un navegador real (Chrome o Edge headless, controlado por el DevTools Protocol sobre el `WebSocket` nativo de Node, sin dependencias externas) y en el `README` se registra la salida observada, con la fecha y el navegador usados. Si algún caso no se cumple, el `README` lo registra con su comportamiento real y no se declara aprobado.

El CP-06 se ejecuta de forma guiada, como pide la consigna: se confirma una venta, se anota el precio guardado del libro y se edita **únicamente** el `precio` de ese libro dentro de `libreria.libros` desde las herramientas de almacenamiento, sin tocar `libreria.ventas`; se recarga y se comprueba el detalle de la venta.
