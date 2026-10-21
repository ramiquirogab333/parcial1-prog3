# Librería — Parcial 1 de Programación III (UTN)

Aplicación web de una librería: catálogo de libros, alta de libros y clientes, venta
simulada e historial de ventas. Funciona **entera en el navegador**: no hay servidor,
no hay base de datos y no hay peticiones de red. Los datos se conservan entre sesiones
con `localStorage`.

- **Sin frameworks, sin librerías, sin CDN, sin build tools, sin gestor de paquetes.**
- **Sin `fetch`/`axios`:** la aplicación no se comunica con ningún backend.
- **Sin `innerHTML` con datos de usuario:** todo se inserta en el DOM con
  `textContent` y nodos creados a mano, para evitar XSS.

---

## 1. Cómo ejecutar la aplicación

La app es estática: alcanza con abrir `index.html` en un navegador moderno.

| Opción | Cómo | URL |
| --- | --- | --- |
| Archivo local | Doble clic en `index.html` | `file:///.../index.html` |
| Servidor local de la consigna | `docker compose up -d --build` | `http://localhost:8080` |
| Despliegue | Ver `docs/DEPLOY.md` (nginx + EasyPanel) | dominio configurado |

> **Importante:** cada una de estas tres formas es un **origen distinto** para el
> navegador y, por lo tanto, un almacén de datos distinto. Ver la sección 4.

---

## 2. Estructura del proyecto y mapa de módulos

```
.
├── index.html          # Maquetado de las 5 vistas (M01)
├── css/
│   ├── style.css       # Estilos y adaptabilidad (M02)
│   └── tema.css        # Estilos del tema claro/oscuro (M07)
├── js/
│   ├── nucleo/         # Scripts transversales: los usa más de un módulo
│   │   ├── data.js     # Semillas: 6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes (M03)
│   │   ├── navegacion.js # Cambio de vista a una sola vez (M03)
│   │   └── storage.js  # Persistencia en localStorage (M06)
│   └── modulos/        # Scripts de un módulo cada uno
│       ├── tema.js     # Tema claro/oscuro y preferencia guardada (M07)
│       ├── catalogo.js # Render del catálogo y buscador por título (M03)
│       ├── libros.js   # Alta de libros y validación (M04)
│       ├── clientes.js # Alta de clientes y validación (M04)
│       ├── ventas.js   # Ticket y confirmación de venta (M05)
│       └── historial.js # Historial de ventas con detalle desplegable (M05)
├── docs/
│   └── DEPLOY.md       # Infraestructura de despliegue
├── README.md           # Este documento (M06)
├── AGENTS.md           # Reglas del proyecto para el equipo y para los agentes (M06)
├── CLAUDE.md           # Alias de AGENTS.md para otros asistentes (M06)
├── Dockerfile          # Imagen del sitio: nginx alpine + los archivos estáticos
├── nginx.conf          # Gzip, cabeceras de seguridad, caché no-cache y try_files
├── docker-compose.yml  # Prueba local en http://localhost:8080
├── .dockerignore       # Qué queda fuera del contexto de build de la imagen
├── .gitignore          # Qué queda fuera del control de versiones
├── .gitattributes       # Normalización de fin de línea
├── .github/            # Workflow de despliegue (GitHub Actions)
├── openspec/           # Especificaciones y trazabilidad (OpenSpec)
└── .opencode/          # Comandos y skills de OpenSpec para los agentes
```

La separación de `js/` es **por rol, no por módulo**:

- `js/nucleo/` tiene los scripts que usa **más de un** módulo: las semillas
  (`data.js`), el cambio de vista (`navegacion.js`) y la persistencia
  (`storage.js`).
- `js/modulos/` tiene los scripts de **una sola responsabilidad**: el tema, el
  catálogo, el alta de libros, el alta de clientes, la venta y el historial.

Las cinco vistas son **Catálogo**, **Libros**, **Clientes**, **Ventas** e **Historial**.
Se muestran de a una: `js/nucleo/navegacion.js` alterna el atributo `hidden` de cada
`<section class="vista">` y toma el hash de la URL como estado inicial.

---

## 3. Persistencia (M06)

### 3.1 Qué se guarda y dónde

Se guardan **tres colecciones**, cada una en su propia clave de `localStorage`. El valor
de cada clave es un **array JSON de objetos planos**.

| Clave | Contenido | Semilla inicial |
| --- | --- | --- |
| `libreria.libros` | Libros del catálogo | 6 libros |
| `libreria.clientes` | Clientes registrados | 3 clientes |
| `libreria.ventas` | Ventas confirmadas | array vacío |

Estructura real observada en `localStorage` (tras una venta de 2×Rayuela + 1×El túnel):

```jsonc
// libreria.libros
[{"id":"lib-01","titulo":"Rayuela","isbn":"9788437604572","precio":1500,
  "editorialId":"edi-01","generoId":"gen-01","autorIds":["aut-01"]},
 {"id":"lib-04","titulo":"Sobre héroes y tumbas","isbn":"9789507312694","precio":1800,
  "editorialId":"edi-01","generoId":null,"autorIds":["aut-02"]}]

// libreria.clientes
[{"id":"cli-01","nombre":"Ana María Gómez","email":"ana.gomez@example.com"}]

// libreria.ventas
[{"id":"ven-01","fecha":"2026-10-21T15:10:02.666Z","clienteId":"cli-01",
  "clienteNombre":"Ana María Gómez",
  "renglones":[{"libroId":"lib-01","titulo":"Rayuela","cantidad":2,
                "precioUnitario":1500,"subtotal":3000},
               {"libroId":"lib-02","titulo":"El túnel","cantidad":1,
                "precioUnitario":2000,"subtotal":2000}],
  "total":5000}]
```

**Qué NO se guarda:** las editoriales, los géneros y los autores. Son datos de
referencia fijos que ninguna vista modifica, así que se mantienen en `js/nucleo/data.js` y no
ocupan espacio ni se duplican. Cada libro y cada cliente guardan el **id** de su
editorial, género y autores, no el texto.

**Sobre la cuarta clave:** el módulo de tema (M07) guarda además la preferencia
manual de tema claro/oscuro en la clave `tema-preferido`, con los valores `"light"` o
`"dark"`. Esa clave es **independiente de los datos de la librería**: el módulo de
persistencia nunca la lee ni la borra, y `Almacenamiento.restablecer()` no la toca.
Mientras el usuario no elija un tema a mano, la clave no existe (se verificó que
`tema-preferido` queda en `null` tras cargar la aplicación). Con lo cual, en el
almacenamiento local conviven **3 claves de datos** y, opcionalmente, **1 clave de
preferencias de la interfaz**.

### 3.2 Reglas de comportamiento

- **Siembra idempotente.** La primera vez se siembran los ejemplos. Después, la decisión
  de «¿ya hay datos?» se toma por la **existencia de la clave**, no por su longitud: si
  `libreria.libros` existe, se recupera lo que haya; nunca se vuelven a copiar las
  semillas encima. Por eso recargar la página **no duplica** los registros iniciales.
- **Restauración en el lugar.** Los datos recuperados se escriben sobre los arrays vivos
  (`Datos.libros`, `Datos.clientes`, `Datos.ventas`) sin reasignar la referencia, para
  que los módulos que ya los tienen sigan viendo los mismos objetos.
- **Escritura reactiva.** `js/nucleo/storage.js` escucha el evento `datos-actualizados` que
  emiten M04 y M05 y vuelve a guardar las tres colecciones. No hace falta que cada vista
  llame a la persistencia.
- **Precio histórico inmutable.** Al confirmar una venta se copia el **valor** del
  precio unitario al renglón (`precioUnitario`) y se calcula el `subtotal` en el momento
  de la venta. Si después cambia el precio del catálogo, la venta guardada no cambia.
  Ver el caso CP-06 de la sección 6.
- **Tolerancia a datos corruptos.** Si una clave guardada no es un JSON válido, no es una
  lista, o tiene registros incompletos, esa colección **se descarta entera**, se repone
  con la semilla y se avisa con un mensaje de texto visible en
  `#mensaje-catalogo-error` / `#mensaje-historial-error`.
- **Tolerancia a almacenamiento no disponible.** Si el navegador bloquea `localStorage`
  (navegación privada, cookies bloqueadas, cuota agotada), la aplicación **sigue
  funcionando con los datos en memoria** y lo avisa por pantalla en vez de romperse.
- **Reinicio.** Desde la consola del navegador:
  `Almacenamiento.restablecer()` borra las tres claves y vuelve a sembrar los ejemplos.

### 3.3 API pública del módulo

`js/nucleo/storage.js` expone el namespace `Almacenamiento`:

| Método | Qué hace |
| --- | --- |
| `Almacenamiento.cargar()` | Recupera lo guardado, siembra si no hay nada y redibuja las vistas. |
| `Almacenamiento.guardar()` | Escribe las tres colecciones en `localStorage`. |
| `Almacenamiento.restablecer()` | Borra lo guardado y vuelve a sembrar los ejemplos. |
| `Almacenamiento.claves()` | Devuelve los nombres de las tres claves. |

---

## 4. Las cuatro condiciones del almacenamiento local (la limitación a conocer)

El `localStorage` **no es una base de datos**: es un almacén del navegador, y eso tiene
consecuencias que hay que conocer.

1. **Depende del navegador.** Los datos viven en la instalación del navegador, en el
   disco del equipo. No están en un servidor: si se borra el perfil del navegador, o se
   desinstala o se reinstala el navegador, se pierden.
2. **Depende del perfil del navegador.** Cada perfil (perfil normal, ventana de
   incógnito, perfil de trabajo, otro navegador) tiene **su propio** almacén. Un dato
   cargado en la ventana de incógnito no aparece en la ventana normal.
3. **Depende de la ubicación de apertura.** El almacén se identifica por **origen**
   (esquema + dominio + puerto). Por lo tanto:
   - `file:///.../parcial1-prog3/index.html` → un almacén.
   - `http://localhost:8080` → **otro** almacén.
   - `https://<dominio-de-easypanel>` → **otro** almacén.

   Los datos **no viajan** entre esos tres. Es la razón por la que el CP-06 tiene que
   editarse en el mismo lugar donde se hizo la venta: si se abre la app por otra vía,
   se ve otra cosa (en este caso, la semilla inicial).
4. **No comparte información entre usuarios.** No hay servidor ni cuentas: cada
   visitante del equipo tiene los datos de **su propio** navegador. Si dos compañeros
   prueban la aplicación en la misma máquina con el mismo perfil, ven los mismos datos;
   con perfiles o navegadores distintos, ven almacenes distintos. **Los datos de un
   usuario no son visibles para otro**, y no hay forma de compartirlos ni de
   sincronizarlos: no hay red en esta aplicación.

> Consecuencia práctica: para probar el CP-06, hacé todo en la **misma pestaña, con la
> misma URL y el mismo perfil**.

---

## 5. Cómo se verificó

Las ocho comprobaciones de la consigna se ejecutaron **en un navegador real
(Google Chrome 155.0.8059.85 headless)**, automatizando las mismas acciones que haría una persona
—escribir en los campos, hacer clic, presionar Tab y Enter, recargar, y editar la clave
guardada desde la consola— con un script que maneja el navegador por el **DevTools
Protocol** (Node.js, sin dependencias).

El script se ejecutó sobre una **copia del proyecto en una carpeta temporal**, para no
alterar el repositorio ni el `localStorage` del navegador de desarrollo.

> La corrida final se hizo sobre la versión integrada de todos los módulos (con el tema
> claro/oscuro de M07 ya incorporado) y volvió a dar **13 de 13 casos aprobados, 99 pasos
> y 0 errores de consola**.

Método por caso:

| Tipo de prueba | Cómo se ejecutó |
| --- | --- |
| Búsqueda | Se escribió en `#buscador-catalogo` y se comprobó la cantidad de filas y el mensaje. |
| Altas | Se rellenó el formulario, se envió con `requestSubmit()` y se leyó el mensaje y los listados. |
| Ventas | Se eligieron cliente y libro, se hizo clic en «Agregar el libro al ticket» y en «Confirmar la venta», y se leyeron el ticket, el total, `Datos.ventas` y `localStorage`. |
| CP-06 | Se editó **sólo** el campo `precio` de `lib-01` dentro de `libreria.libros` (sin tocar `libreria.ventas`), se recargó y se revisó el historial. |
| Anchos | Se fijó el viewport en 320 px y 1280 px y se midió `scrollWidth` del documento y de los contenedores de tabla. |
| Teclado | Se enviaron pulsaciones reales de Tab y Enter y se registró `document.activeElement`, `:focus-visible` y el `outline` calculado. |

Total: **13 casos y 99 pasos verificados**, todos en verde y **sin errores de consola**
(0 excepciones y 0 `console.error` durante toda la corrida).

### 5.1 Verificación de la reorganización de la estructura del repositorio

La reorganización de carpetas (`css/`, `js/nucleo/`, `js/modulos/`, `docs/`) **no
cambia el comportamiento de la aplicación**, así que se verificó exactamente eso: que
la app siga funcionando igual antes y después de mover los archivos.

**Cómo se hizo:** el arnés quedó **fuera del repositorio** (en una carpeta temporal),
sirve una **copia** del proyecto con un servidor estático y maneja Chrome headless por
el **DevTools Protocol** (Node.js, sin dependencias). Se corrió **dos veces** con el
mismo arnés: una sobre la estructura vieja (**línea base**) y otra sobre la nueva.
Ninguna de las dos copias tocó el repositorio ni el `localStorage` del navegador de
desarrollo.

| #    | Comprobación                                                                                      | Antes del cambio | Después del cambio |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------- | ------------------ |
| C01  | Requests HTTP con status >= 400                                                                    | 0                | 0                  |
| C02  | Excepciones y `console.error`                                                                     | 0                | 0                  |
| C03  | Catálogo: 6 libros renderizados, sin mensaje de vacío ni de error                                  | aprobado         | aprobado           |
| C04  | Buscador: parcial insensible a mayúsculas, vacío = todo, inexistente = mensaje                     | aprobado         | aprobado           |
| C05  | Navegación: las 5 vistas se muestran de a una por hash                                             | aprobado         | aprobado           |
| C06  | Tema: alterna claro/oscuro y persiste tras recargar                                                | aprobado         | aprobado           |
| C07  | Alta de libro: ISBN duplicado rechazado, ISBN nuevo aceptado y visible                             | aprobado         | aprobado           |
| C08  | Alta de cliente: email inválido y duplicado rechazados, email nuevo aceptado                        | aprobado         | aprobado           |
| C09  | Venta: rechazos (sin cliente, cantidades inválidas, duplicado) y venta válida 3000 + 2000 = 5000    | aprobado         | aprobado           |
| C10  | Historial: muestra la venta con su detalle desplegado                                              | aprobado         | aprobado           |
| C11  | CP-06: el precio del catálogo cambia, la venta guardada no                                         | aprobado         | aprobado           |
| C12  | Recarga: los datos vuelven sin duplicar semillas ni ventas                                         | aprobado         | aprobado           |

**Resultado: 12 de 12 comprobaciones aprobadas en las dos corridas, 0 errores de
consola y 0 requests fallidos.** En la corrida posterior al cambio, el navegador pidió
los 11 assets **por sus rutas nuevas** (`/css/style.css`, `/css/tema.css`,
`/js/nucleo/...`, `/js/modulos/...`) y todas respondieron 200.

**Smoke test del CI (verificado contra la imagen real, no en teoría):**

- `docker build` de la imagen: entran `index.html` y los 11 assets, y **no entra ningún
  `.md`** (tampoco `docs/DEPLOY.md`, que antes quedaba en la imagen).
- El paso «Smoke test» del workflow se ejecutó **tal cual** contra el contenedor: `GET /`
  devuelve el sitio y **las 11 rutas de assets responden 200** → el paso termina con
  `exit 0`.
- Con una ruta inexistente, el paso emite `::error::No se pudo cargar el asset <ruta>` y
  **termina con `exit 1`**: un asset roto frena el deploy.
- El paso de cobertura compara la lista de assets del smoke test con las rutas `src`/`href`
  locales de `index.html`; si difieren (una omisión o un duplicado), el job falla.

**Corrida real del pipeline (no una reproducción local):** el `push` a `main` disparó el
workflow «Deploy a la VPS» (run `39641329934`), que terminó en **success**:

| Job | Resultado | Pasos clave |
| --- | --- | --- |
| Verificar imagen Docker | success | build de la imagen, smoke test de los 11 assets y paso de cobertura, los tres en verde |
| Desplegar en EasyPanel | success | webhook de deploy disparado con respuesta 2xx |

O sea: el blindaje del CI quedó comprobado **en el runner de GitHub**, no sólo contra un
contenedor local. A partir de ese push, un asset roto frena el deploy antes de llegar a
producción.

---

## 6. Registro de las ocho comprobaciones manuales

> Cada caso indica **qué se hizo**, **qué se esperaba** y **qué se observó realmente**.
> Ningún caso se da por aprobado sin haberse ejecutado.

### CP-01 — Búsqueda por título: mayúsculas, búsqueda vacía y texto inexistente

**Qué se hizo:** en el buscador del catálogo se buscó `RAYUELA`, luego se vació el
campo y luego se buscó un texto inexistente. Se repitió con espacios alrededor.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Buscar «RAYUELA» en mayúsculas | 1 resultado | 1 resultado |
| Aviso de «sin resultados» al hay coincidencia | vacío | vacío |
| Búsqueda vacía | 6 libros | 6 libros |
| Texto inexistente | 0 filas | 0 filas |
| Aviso de «sin resultados» | visible | visible |
| `  rAyUeLa  ` (espacios + mayúsculas) | 1 resultado | 1 resultado |

**Resultado: APROBADO.**

### CP-02 — Alta de libro: ISBN existente y ISBN nuevo

**Qué se hizo:** se intentó dar de alta *Libro repetido* con el ISBN `9788437604572`
(ya existente) y luego *Cien años de soledad* con el ISBN `9780307474728` (nuevo),
completando editorial, género y autores en ambos casos.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Alta con ISBN existente | mensaje de error | mensaje de error |
| Libros en el catálogo tras el rechazo | 6 | 6 |
| Alta con ISBN nuevo | mensaje de éxito | mensaje de éxito |
| Libros en el catálogo tras el alta | 7 | 7 |
| El libro aparece en la tabla del catálogo | sí | sí |
| El libro aparece en el selector de la vista Ventas | sí | sí |

**Resultado: APROBADO.**

### CP-03 — Alta de cliente: email inválido, email existente en mayúsculas y email nuevo

**Qué se hizo:** se intentó dar de alta un cliente con email `esto-no-es-un-email`, otro
con `ANA.GOMEZ@EXAMPLE.COM` (existente, todo en mayúsculas) y otro con
`diego.ramirez@example.com` (nuevo).

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Email inválido | mensaje de error | mensaje de error |
| Email existente en mayúsculas | mensaje de error | mensaje de error |
| Clientes tras los rechazos | 3 | 3 |
| Email nuevo | mensaje de éxito | mensaje de éxito |
| Clientes tras el alta | 4 | 4 |
| El selector de clientes de Ventas se repobló | 5 opciones | 5 opciones |

**Resultado: APROBADO.**

### CP-04 — Venta: sin cliente, cantidad inválida y libro repetido

**Qué se hizo:** se agregó Rayuela × 2 al ticket y se intentó confirmar sin elegir
cliente. Después se intentó agregar con cantidad `0`, `-1` y `1.5`, y finalmente se
intentó agregar Rayuela otra vez.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Se agrega el primer renglón | 1 | 1 |
| Confirmar sin cliente | se rechaza | se rechaza |
| Ventas registradas | 0 | 0 |
| Cantidad `0` | se rechaza | se rechaza |
| Ticket tras el intento con `0` | 1 renglón | 1 renglón |
| Cantidad `-1` | se rechaza | se rechaza |
| Ticket tras el intento con `-1` | 1 renglón | 1 renglón |
| Cantidad `1.5` | se rechaza | se rechaza |
| Ticket tras el intento con `1.5` | 1 renglón | 1 renglón |
| Libro repetido | se avisa duplicado | se avisa duplicado |
| Renglones tras el duplicado | 1 | 1 |
| Ventas registradas al final | 0 | 0 |

**Resultado: APROBADO.**

### CP-05 — Venta válida: 2 × $1500 y 1 × $2000

**Qué se hizo:** se eligió a *Ana María Gómez*, se agregó Rayuela × 2 y El túnel × 1, y
se confirmó la venta.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Subtotal del primer renglón | `3000.00` | `3000.00` |
| Total del ticket con un renglón | `3000.00` | `3000.00` |
| Total del ticket con los dos renglones | `5000.00` | `5000.00` |
| Confirmación | mensaje de éxito | mensaje de éxito |
| `total` de la venta guardada | 5000 | 5000 |
| `subtotal` del renglón 1 | 3000 | 3000 |
| `subtotal` del renglón 2 | 2000 | 2000 |
| `precioUnitario` del renglón 1 | 1500 | 1500 |
| Filas en el historial | 1 | 1 |
| Venta persistida en `libreria.ventas` | total 5000 | total 5000 |
| Renglón persistido | subtotal 3000 | subtotal 3000 |

**Resultado: APROBADO.**

### CP-06 — El precio histórico no cambia si se edita el precio del catálogo guardado

**Qué se hizo:** con la venta de CP-05 ya confirmada y guardada, se editó **únicamente**
el campo `precio` de `lib-01` (Rayuela) dentro de la clave `libreria.libros`, de `1500`
a `9999`. **No se tocó `libreria.ventas`.** Después se recargó la página y se revisó el
historial.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Precio de `lib-01` antes de editar | 1500 | 1500 |
| `libreria.ventas` intacta durante la edición | 1 venta | 1 venta |
| Precio del catálogo tras recargar | 9999 | 9999 |
| `precioUnitario` de la venta recuperada | 1500 | 1500 |
| `subtotal` del renglón 1 | 3000 | 3000 |
| `subtotal` del renglón 2 | 2000 | 2000 |
| `total` de la venta recuperada | 5000 | 5000 |
| El botón «Ver detalle» despliega el detalle | sí | sí |
| El detalle muestra «1500.00» como precio unitario | sí | sí |
| El detalle muestra «3000.00» y «2000.00» como subtotales | sí | sí |

**Resultado: APROBADO.**

#### Cómo reproducirlo a mano (para el docente)

1. Abrir la app y realizar una venta (por ejemplo, 2 × Rayuela y 1 × El túnel), y
   confirmarla.
2. Abrir la consola del navegador con `F12` → pestaña **Application** (Chrome) o
   **Almacenamiento** (Firefox) → **Local Storage** → elige el origen desde el que
   abriste la app.
3. En la clave **`libreria.libros`** (no en `libreria.ventas`) editá el valor del
   campo `"precio"` del objeto con `"id":"lib-01"`: pasalo de `1500` a `9999`. Guardá.
4. Recargá la página (`F5`).
5. Entrá a **Historial**, desplegá el detalle de la venta con el botón «Ver detalle»:
   el precio unitario sigue siendo `1500.00`, los subtotales `3000.00` y `2000.00`, y el
   total `5000.00`.
6. En cambio, en el **Catálogo**, Rayuela ahora muestra `9999.00`: el catálogo sí
   cambió, la venta registrada no.

> Si al recargar los datos no aparecen, es que se abrió la app por **otra URL** (por
> ejemplo `http://localhost:8080` en lugar del `file://` original). Son almacenes
> distintos. Volvé a abrirla exactamente como la abriste antes.

### CP-07 — Recarga de la página: los datos vuelven sin duplicar los registros

**Qué se hizo:** con 7 libros, 4 clientes y 1 venta guardados, se recargó la página y se
comparó el estado antes y después.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| Cantidad de libros | 7 | 7 |
| Cantidad de clientes | 4 | 4 |
| Cantidad de ventas | 1 | 1 |
| Ids de libro repetidos | 0 | 0 |
| Ids de cliente repetidos | 0 | 0 |
| Ids de venta repetidos | 0 | 0 |
| Ids antes y después | iguales | iguales |
| Claves en `localStorage` | 3 | 3 |
| Claves presentes | las 3 esperadas | las 3 esperadas |
| Total de registros guardados vs. en pantalla | 12 | 12 |

**Resultado: APROBADO.**

### CP-08 — Navegación por teclado y anchos de 320 px y 1280 px

**Qué se hizo:** se fijó el viewport en 320 px y 1280 px midiendo el desbordamiento
horizontal del documento y de los contenedores de tabla. Después se recorrió la
aplicación con el tabulador y se activó cada vista con `Enter` sobre su enlace.

| Verificación | Esperado | Observado |
| --- | --- | --- |
| A 320 px: scroll horizontal global de la página | no | no |
| A 320 px: `overflow-x` del contenedor de tabla | `auto` | `auto` |
| A 320 px: la tabla desborda dentro de su contenedor | sí | sí |
| A 1280 px: scroll horizontal global de la página | no | no |
| A 1280 px: `overflow-x` del contenedor de tabla | `auto` | `auto` |
| A 1280 px: la tabla no desborda su contenedor | no | no |
| El tabulador recorre los 5 enlaces de navegación | sí | sí |
| El tabulador alcanza el buscador del catálogo | sí | sí |
| `Enter` sobre «Libros» abre la vista Libros | sí | sí |
| El tabulador alcanza `libro-titulo` | sí | sí |
| Controles de la vista Libros con foco visible | 0 sin foco visible | 0 |
| Controles de la vista Libros con contorno de 2px | 0 sin contorno | 0 |
| `Enter` sobre «Clientes» abre la vista Clientes | sí | sí |
| El tabulador alcanza `cliente-nombre` | sí | sí |
| Controles de la vista Clientes con foco visible | 0 sin foco visible | 0 |
| Controles de la vista Clientes con contorno de 2px | 0 sin contorno | 0 |
| `Enter` sobre «Ventas» abre la vista Ventas | sí | sí |
| El tabulador alcanza `venta-cliente` | sí | sí |
| Controles de la vista Ventas con foco visible | 0 sin foco visible | 0 |
| Controles de la vista Ventas con contorno de 2px | 0 sin contorno | 0 |

**Resultado: APROBADO.**

---

## 7. Casos de robustez adicionales (M06)

Estos casos no están pedidos por la consigna, pero verifican el comportamiento de la
persistencia ante situaciones anómalas. También se ejecutaron.

| # | Situación | Resultado observado |
| --- | --- | --- |
| R-01 | `libreria.libros` con un JSON inválido (`{esto-no-es-json`) | Se avisa el error de lectura en `#mensaje-catalogo-error`, el catálogo vuelve a las 6 semillas y la clave queda reparada. |
| R-02 | `libreria.clientes` con un objeto que no es una lista (`{"a":1}`) | Se avisa el error de lectura y los clientes vuelven a las 3 semillas. |
| R-03 | El navegador bloquea `localStorage` (se simuló con un `localStorage` que lanza) | Se muestra el mensaje «El almacenamiento local no está disponible en este navegador…» y la aplicación sigue funcionando con los datos en memoria. |
| R-04 | `Almacenamiento.restablecer()` | Borra las tres claves y vuelve a sembrar: 6 libros, 3 clientes, 0 ventas, y Rayuela vuelve a `1500` (descartando el `9999` editado). |
| R-05 | Un libro guardado con el precio como texto (`"precio": "1500"`) | Se restaura con `precio === 1500` **de tipo número**, el catálogo completo sigue validando y no se muestra ningún error de lectura. |
| F-01 | La app abierta con `file://` en lugar de `http://` | El almacenamiento local también funciona: tras recargar siguen los 6 libros, 3 clientes y 0 ventas, **sin duplicar**. Es un almacén **distinto** del de `http://localhost:8080`. |

---

## 8. Limitaciones conocidas

- **Los datos son del navegador, no del usuario.** No hay cuentas ni sincronización: cada
  navegador y cada perfil guarda lo suyo (ver la sección 4).
- **No hay servidor.** No se puede compartir el estado entre dispositivos ni recuperar
  los datos si se borra el perfil del navegador.
- **El ticket en construcción no se guarda.** Solo se persisten las ventas confirmadas.
  Si se recarga la página con un ticket a medio armar, ese ticket se pierde.
- **No hay pantalla de edición de precios.** El CP-06 se hace editando la clave
  guardada desde la consola o las herramientas de desarrollo, como se documenta arriba.
- **Los datos guardados se validan por estructura.** Si alguien edita a mano una clave
  guardada y deja un registro incompleto, esa colección entera se descarta y se repone
  con la semilla (con aviso en pantalla).

---

## 9. Trazabilidad

### 9.1 Módulo de persistencia (M06)

La especificación de este módulo vive en
`openspec/changes/archive/2026-10-21-m06-persistencia-y-pruebas/` (propuesta, diseño,
tareas y especificación) y, ya archivada, en
`openspec/specs/06-persistencia-y-pruebas/spec.md`. Cada requisito de la consigna del
Ejercicio 6 está mapeado a un requisito verificable de esa especificación.

### 9.2 Organización del repositorio

La reorganización de carpetas está especificada en el change
`openspec/changes/archive/2026-10-21-reorganizacion-estructura-repo/` (propuesta,
diseño, 37 tareas y los cinco delta specs) y, ya sincronizada, en la capability
`openspec/specs/08-organizacion-repositorio/spec.md`. Esa capability fija:

- las carpetas `css/`, `js/nucleo/`, `js/modulos/` y `docs/`, y qué va en cada una;
- los archivos que **deben permanecer en la raíz** (`index.html`, `Dockerfile`,
  `nginx.conf`, `docker-compose.yml`, `.dockerignore`);
- el **orden de carga** de los scripts, que no es libre: `data.js` antes que
  `catalogo.js`, `storage.js` al último y `tema.js` bloqueante en el `<head>`;
- la verificación de **cada asset** en el pipeline y la exclusión de la documentación de
  la imagen publicada;
- la inmutabilidad de `openspec/changes/archive/`, que es el registro histórico.

Los cambios de rutas que esas specs nombraban están trazados además en las specs
sincronizadas de `02-estilos-responsivos`, `03-modelo-datos-catalogo`,
`04-formularios-altas` y `07-tema-claro-oscuro`.

