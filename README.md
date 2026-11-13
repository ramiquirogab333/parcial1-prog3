# Librería — Frontend del TP Global (Programación III, UTN)

Aplicación web de una librería: catálogo, alta de libros y clientes, venta simulada e
historial de ventas. El frontend es **estático** (HTML, CSS y JavaScript nativo, sin build)
y se sirve con **nginx**. Los datos ya no viven en el navegador: se piden a una **API
FastAPI + PostgreSQL** a través del mismo origen, usando `/api` como base.

- Sin frameworks, sin librerías de terceros, sin CDN, sin `npm`, sin bundler.
- El único almacenamiento local es la **preferencia de tema** (`localStorage`, clave
  `tema-preferido`). Libros, clientes y ventas **no** se guardan en `localStorage`.
- Todo el contenido que viene del servidor se inserta con `textContent` y nodos creados a
  mano; nunca con `innerHTML`.

---

## 1. Enlaces y estado

| Qué | Dónde |
| --- | --- |
| Aplicación desplegada | <https://libreria.francogagliardi.me> |
| Estado del backend | `GET https://libreria.francogagliardi.me/api/health/ready` |
| Repositorio del frontend | `parcial1-prog3` (este repositorio) |
| Repositorio del backend | `parcial2-prog3` (FastAPI + PostgreSQL) |
| Guía de despliegue | [`docs/DEPLOY.md`](docs/DEPLOY.md) |

La verificación de QA documentada en este README se ejecutó el **2026-11-13** contra la URL
pública, con Chrome 156 headless. El detalle está en la sección 10 y en `evidence/paso-7/`.

---

## 2. Arquitectura

```
Navegador
  └─ index.html + css/ + js/            (sitio estático, sin build)
        │  fetch("/api/…")
        ▼
     nginx (contenedor del front)
        ├─ location /        → sirve los archivos estáticos
        └─ location /api/    → proxy_pass http://${API_UPSTREAM}/
                                   │
                                   ▼
                              FastAPI  →  PostgreSQL
```

### 2.1 Base de la API y proxy

- El cliente HTTP vive en `js/nucleo/api.js` y usa `BASE = "/api"`. Todas las llamadas del
  front son **relativas al mismo origen** (`/api/libros/`, `/api/clientes/`, …).
- nginx resuelve el backend con `proxy_pass http://${API_UPSTREAM}/`. La **barra final** es
  obligatoria: hace que `/api/libros/` llegue a FastAPI como `/libros/`.
- `API_UPSTREAM` tiene la forma `host:puerto`, **sin** `http://` y **sin** barra final
  (por ejemplo `libreria-api:8000`). Si falta la variable, nginx no arranca.
- Al ser mismo origen no hace falta CORS ni una URL absoluta en el JavaScript.

### 2.2 Una sola fuente de verdad

Los datos de la aplicación salen siempre de la API:

- `API.cargarTodo()` pide editoriales, géneros, autores, libros (con el detalle de cada
  libro para sus autorías), clientes y las últimas ventas. Recién cuando llegaron **todas**
  las respuestas reemplaza los arreglos de `Datos` y redibuja las vistas: se ve la
  información completa o un mensaje de error, nunca una mezcla.
- `Datos` (`js/nucleo/data.js`) es sólo un contenedor en memoria que se llena desde la API.
  Arranca vacío: no hay datos de respaldo locales.
- Los importes de una venta (precio unitario, subtotal y total) son los que devolvió el
  servidor al registrarla y se muestran tal cual; el front nunca los recalcula con el
  precio actual del catálogo.
- La única excepción es el tema claro/oscuro, que sí se guarda en `localStorage`.
- Si el navegador conserva claves viejas del Parcial 1 (por ejemplo `libreria.libros`), ya
  no se leen: se pueden borrar sin afectar la aplicación.

### 2.3 Arranque y sincronización entre vistas

- `index.html` carga los módulos y, al final, `js/nucleo/api.js`. Los módulos se dibujan
  primero con `Datos` vacío y registran sus eventos; cuando `API.cargarTodo()` termina,
  llama al `render()` de cada módulo con los datos del servidor.
- Después de un alta exitosa, el módulo correspondiente actualiza `Datos` y emite el evento
  `datos-actualizados` en `document` (`detail.coleccion = "libros" | "clientes" | "ventas"`).
  Así el catálogo y el historial se recargan sin acoplar los módulos entre sí.
- Una venta confirmada muestra el comprobante armado con la respuesta del servidor y dispara
  la recarga del historial.

---

## 3. Estructura del repositorio

```
parcial1-prog3/
├── index.html                     # Las 5 vistas en una sola página (navegación por hash)
├── css/
│   ├── style.css                  # Estilos generales, layout y componentes
│   └── tema.css                   # Variables de los temas claro y oscuro
├── js/
│   ├── nucleo/
│   │   ├── api.js                 # Cliente HTTP, normalización y carga inicial
│   │   ├── data.js                # Contenedor en memoria + búsqueda local por título
│   │   └── navegacion.js          # Cambio de vistas con hash y aria-current
│   └── modulos/
│       ├── catalogo.js            # Catálogo: búsqueda, paginación y estados
│       ├── libros.js              # Alta de libros (con autores y roles)
│       ├── clientes.js            # Alta de clientes
│       ├── ventas.js              # Ticket y confirmación de venta
│       ├── historial.js           # Listado y detalle de ventas
│       └── tema.js                # Tema claro/oscuro (se carga en el <head>)
├── Dockerfile                     # Imagen nginx con el sitio y la plantilla del proxy
├── default.conf.template          # nginx: estáticos + proxy /api/ con ${API_UPSTREAM}
├── docker-compose.yml             # Prueba local del front en http://localhost:8080
├── .github/workflows/deploy.yml   # Build, smoke test y deploy a la VPS
├── docs/DEPLOY.md                 # Detalle de infraestructura y EasyPanel
└── evidence/paso-7/               # Evidencia de la QA: JSON, log, capturas y curl
```

> `js/nucleo/storage.js` ya no existe: la persistencia pasó al backend. El front no escribe
> datos en `localStorage`.

---

## 4. Módulos y responsabilidades

| Módulo | Archivos | Responsabilidad actual |
| --- | --- | --- |
| **M01** | `index.html` | Las 5 vistas, etiquetas semánticas, formularios accesibles y contenedores de mensajes. |
| **M02** | `css/style.css` | Identidad visual, layout con Grid/Flexbox, tablas con scroll interno, foco visible y adaptabilidad a 320 px y 1280 px. |
| **M03** | `js/nucleo/data.js`, `js/modulos/catalogo.js` | Contenedor `Datos`, búsqueda por título (parcial, sin distinguir mayúsculas, con `trim()`), catálogo paginado de 20 y estados vacío/sin resultados/error. |
| **M04** | `js/modulos/libros.js`, `js/modulos/clientes.js` | Altas con validación en el navegador y `POST` a la API; los duplicados (ISBN, email) los rechaza el servidor con `409`. |
| **M05** | `js/modulos/ventas.js`, `js/modulos/historial.js` | Ticket, confirmación con importes del servidor, historial paginado y detalle bajo demanda. |
| **M06** | `README.md`, `Dockerfile`, `default.conf.template`, `docs/DEPLOY.md` | Documentación, imagen de despliegue, proxy `/api/` y registro de las pruebas. |
| **M07** | `css/tema.css`, `js/modulos/tema.js` | Tema claro/oscuro con preferencia del sistema y persistencia de la elección. |
| Global | `js/nucleo/api.js`, `js/nucleo/navegacion.js` | Cliente HTTP, normalización de respuestas, carga inicial y navegación entre vistas. |

---

## 5. API que consume el front

Todos los pedidos son `GET` salvo los `POST` indicados, y usan `/api` como prefijo. Las
rutas se llaman con barra final cuando la ruta del backend la tiene.

| Endpoint | Uso en el front | Módulo |
| --- | --- | --- |
| `GET /editoriales/` | Opciones del formulario de libros. | Carga inicial, Libros |
| `GET /generos/` | Opciones del formulario de libros. | Carga inicial, Libros |
| `GET /autores/` | Autores disponibles para asociar a un libro. | Carga inicial, Libros |
| `GET /libros/?limit=20&offset=N&titulo=…` | Catálogo y búsqueda por título. | Catálogo |
| `GET /libros/{id}` | Detalle del libro (autorías) para la columna «Autores». | Catálogo, carga inicial |
| `POST /libros/` | Alta de libro. `201` agrega el libro devuelto y recarga el catálogo. | Libros |
| `GET /clientes/` | Listado de clientes y opciones del selector de Ventas. | Carga inicial, Clientes, Ventas |
| `POST /clientes/` | Alta de cliente. `201` agrega el cliente devuelto. | Clientes |
| `POST /ventas/` | Confirma el ticket. El servidor calcula y devuelve precios, subtotales, total, fecha e id. | Ventas |
| `GET /ventas/?limit=20&offset=N` | Listado del historial. | Historial, carga inicial |
| `GET /ventas/{id}` | Detalle de una venta, al abrir «Ver detalle». | Historial |

Manejo de errores (`js/nucleo/api.js`):

- `pedir()` nunca lanza excepciones: devuelve `{ ok, status, data, mensaje }`.
- `status: 0` significa que no hubo respuesta (red caída o backend inaccesible) y se muestra
  «No se pudo conectar con el servidor. Revisá tu conexión y recargá la página.».
- En `409`/`404` el mensaje del backend (`detail` de texto) se muestra tal cual.
- En `422` se arma un texto legible con el campo y el mensaje de cada error de validación;
  nunca se muestra el JSON crudo ni se pierde lo que el usuario escribió.

---

## 6. Las cinco vistas

La navegación usa el hash (`#vista-catalogo`, `#vista-libros`, …, `#vista-historial`), marca
el enlace activo con `aria-current="page"` y oculta la sección que no corresponde con el
atributo `hidden`.

### Catálogo

- Tabla con Título, ISBN, Autores, Editorial, Género y Precio; 20 libros por página.
- Buscador por título: recorta espacios exteriores (`trim()`), no distingue mayúsculas y
  acepta coincidencias parciales. La comparación la hace la API con el parámetro `titulo`
  (se espera 300 ms desde la última tecla para no pedir en cada letra) y la búsqueda vuelve
  a la primera página.
- Un libro sin género se muestra como «Sin clasificar»; si no tiene autores, «—».
- Estados previstos: cargando, catálogo vacío, sin resultados y error de conexión. Los
  botones «Anterior»/«Siguiente» se deshabilitan según corresponda.

### Libros

- Campos: título, ISBN, precio, stock, editorial, género (opcional) y uno o más autores con
  rol (`autor`, `coautor`, `traductor`, `ilustrador`) y orden.
- Validación en el navegador antes de enviar: título e ISBN no vacíos (ISBN de hasta 30
  caracteres), precio mayor que cero con hasta 2 decimales, stock entero mayor o igual que
  cero, editorial existente, al menos un autor, sin autores repetidos, orden entero mayor o
  igual que 1 y rol válido. Los campos con error se marcan con `aria-invalid`.
- El ISBN repetido lo rechaza el **servidor** con `409` («Ya existe un libro con ese ISBN»);
  el front muestra ese mensaje y no altera el catálogo. El ISBN viaja tal como se escribió
  (el backend compara sin normalizar, así que no se quitan guiones).
- `POST /libros/` envía `{ isbn, titulo, precio, stock, editorial_id, genero_id, autores[] }`.
  Con `201` se agrega el libro devuelto, se limpia el formulario, se recarga el catálogo y se
  actualizan el listado y el selector de venta. El botón se deshabilita mientras se envía.

### Clientes

- Campos: nombre completo (hasta 120 caracteres) y email (hasta 254). El formato del email
  se valida en el navegador con `^[^@\s]+@[^@\s]+\.[^@\s]+$`; si es inválido no se envía
  ningún `POST`.
- El email viaja recortado pero **sin** pasar a minúsculas: el backend compara contra su
  `UNIQUE` tal cual. Un email repetido se rechaza con `409` («Ya existe un cliente con ese
  email») y se muestra el mensaje del servidor sin recargar la página.
- Con `201` el cliente devuelto se agrega al listado y al selector de Ventas, y se emite
  `datos-actualizados`.

### Ventas

- Composición del ticket: cliente + libro + cantidad entera mayor que cero. Un mismo libro
  no se agrega dos veces: se avisa y se invita a cambiar la cantidad en la tabla de
  renglones. Cada renglón se puede editar o quitar.
- Confirmar sin cliente, sin renglones o con cantidades inválidas se rechaza **antes** de
  llamar a la API. Mientras se envía, el ticket queda bloqueado para evitar dobles ventas.
  Si la API rechaza la venta o no hay conexión, el ticket y los datos cargados se conservan.
- `POST /ventas/` envía **sólo** `{ cliente_id, renglones: [{ libro_id, cantidad }] }`. El
  navegador no envía precios ni totales: el servidor toma el precio vigente, calcula los
  importes con 2 decimales y devuelve la venta con `id`, `fecha` y `total`. El comprobante
  se arma con esa respuesta.
- **Elección de `GET /clientes/` para el selector:** la venta necesita elegir entre los
  clientes que ya existen y la API no expone un buscador específico. Se usa el mismo listado
  que alimenta la vista Clientes (`GET /clientes/`, paginado con `limit`/`offset`), que es
  la fuente de verdad también en la carga inicial. Así no se inventa un endpoint nuevo, el
  selector muestra exactamente los clientes registrados y, tras un alta, el cliente devuelto
  por `POST /clientes/` se agrega a `Datos` y se emite `datos-actualizados` para refrescar el
  selector sin recargar la página.

### Historial

- Listado paginado de 20 ventas: Identificador, Fecha, Cliente, «Ver detalle» y Total. La
  columna «Identificador» se agrega desde el módulo para poder ubicar cada venta.
- «Ver detalle» pide `GET /ventas/{id}` la primera vez y muestra Libro, Cantidad, Precio
  unitario y Subtotal, más un pie con el Total. El detalle se guarda por id (una venta
  registrada no cambia) y el botón indica `aria-expanded` y un `aria-label` con el número de
  venta.
- Los importes del listado y del detalle son los que devolvió el servidor; no se recalculan
  con el precio actual del catálogo. Si el backend cambia el precio de un libro, las ventas
  ya registradas conservan sus importes.

---

## 7. Tema y accesibilidad

- Tema claro/oscuro: `js/modulos/tema.js` se carga en el `<head>` y aplica el tema antes de
  pintar para evitar el destello (FOUC). Respeta `prefers-color-scheme` si el usuario no
  eligió, y guarda la elección manual en `localStorage` con la clave `tema-preferido`. La
  transición de colores sólo se activa al alternar el tema.
- Foco visible: reglas `:focus-visible` con contorno sólido de 3 px (comprobado con el
  teclado en el formulario de Clientes).
- Los mensajes de estado usan regiones `role="status"`/`role="alert"` (con `aria-live`),
  los campos inválidos `aria-invalid` y los botones de detalle `aria-expanded`.
- No hay scroll horizontal global: a 320 px el ancho de contenido es 305 px y a 1280 px es
  1265 px. Las tablas que no entran tienen desplazamiento horizontal dentro de su propio
  contenedor (`overflow-x: auto`).

---

## 8. Cómo correr el proyecto en local

El frontend necesita el backend para mostrar datos. Son dos repositorios.

### 8.1 Backend (`parcial2-prog3`) + PostgreSQL

```bash
# 1) Base de datos local
docker run -d --name libreria-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=libreria \
  postgres:16-alpine

# 2) Configuración del backend
cd parcial2-prog3
# .env
#   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/libreria
#   SQL_ECHO=false

python -m venv .venv
# activar el entorno (.venv\Scripts\activate en Windows; source .venv/bin/activate en Linux/macOS)
pip install -r requirements.txt
python -m app.seed          # datos iniciales (sólo contra la base local)
uvicorn app.main:app --reload
```

El backend queda en `http://localhost:8000`. Comprobar:
`curl -i http://localhost:8000/health/ready`.

### 8.2 Frontend (este repositorio)

```bash
cd parcial1-prog3

# Opción A: docker compose (usa API_UPSTREAM=host.docker.internal:8000)
docker compose up -d --build
docker compose logs -f
docker compose down

# Opción B: docker build + run
docker build -t libreria-frontend .
docker run --rm -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=host.docker.internal:8000 \
  libreria-frontend
```

Abrir `http://localhost:8080` y verificar el proxy:

```bash
curl -i http://localhost:8080/api/health/ready
curl -s http://localhost:8080/api/libros/
```

Si el backend corre en otro host o puerto, cambiar `API_UPSTREAM` (formato `host:puerto`).
Abrir `index.html` con doble clic (`file://`) **no** funciona: sin nginx no existe `/api` y
la aplicación muestra su mensaje de error de conexión.

---

## 9. Despliegue

- **Imagen** (`Dockerfile`): nginx alpine. Copia `index.html`, `css/` y `js/`, y
  `default.conf.template` a `/etc/nginx/templates/`. El entrypoint de nginx reemplaza
  `${API_UPSTREAM}` al arrancar (`NGINX_ENVSUBST_FILTER` limita la sustitución a esa
  variable). Incluye `HEALTHCHECK` con `wget --spider`.
- **EasyPanel**: app desde el Dockerfile, puerto interno 80, variable `API_UPSTREAM` con el
  host interno del backend (por ejemplo `libreria-api:8000`) y HTTPS activado. Detalle paso a
  paso en [`docs/DEPLOY.md`](docs/DEPLOY.md).
- **GitHub Actions** (`.github/workflows/deploy.yml`), en cada push a `main`:
  1. construye la imagen;
  2. la arranca con `API_UPSTREAM=127.0.0.1:8000` (en CI no hay backend: el valor sólo
     permite que nginx resuelva el upstream y arranque);
  3. smoke test: `GET /` responde con la página y cada uno de los **11 assets** locales
     (`style.css`, `tema.css` y los 9 archivos de `js/`) responde `200`;
  4. un paso extra compara esa lista con los `href`/`src` de `index.html`, para que el smoke
     test falle si se agrega o quita un archivo;
  5. dispara el webhook de EasyPanel (`EASYPANEL_DEPLOY_WEBHOOK`, guardado como secret) con
     reintentos.

El pipeline **no** llama a `/api` (no hay backend en CI); la API se verifica sobre el
despliegue, como se describe en la sección 10.

---

## 10. Pruebas manuales (CP-01 a CP-08) y resultados

La QA se ejecutó sobre la aplicación desplegada, en Chrome headless controlado por DevTools
Protocol (script sin dependencias, ver sección 11). La corrida final fue el **2026-11-13 a
las 16:40 UTC**: **10 bloques, 58 verificaciones, 0 fallidos, 0 excepciones**. Hubo un único
error en consola, esperado: el del bloque extra que bloquea `/api` a propósito. Se
registraron 74 entradas de red; los dos `POST` de la corrida son los rechazos `409` de
CP-02 y CP-03, así que no se creó ningún registro nuevo.

Estado del servidor en el momento de la QA: 4 libros, 3 clientes y 3 ventas (ids `1`, `4`,
`5`).

> **Datos creados en producción durante la QA:** un cliente «QA Prueba Paso 7»
> (`qa.paso7@example.com`, id `4`) y una venta del mismo cliente (id `5`, total
> `78500.50`). No se crearon libros. En la corrida final ambos registros se **reutilizaron**,
> no se duplicaron. La venta se puede consultar con
> `GET /api/ventas/5` (respuesta guardada en `evidence/paso-7/curl-api-venta-5.txt`).

| # | Caso | Resultado observado | Estado |
| --- | --- | --- | --- |
| **CP-01** | Búsqueda por título: mayúsculas, espacios, vacía e inexistente. | «RAYU» devolvió 1 resultado (Rayuela); «  rayu  » devolvió lo mismo (se recortan espacios y no distingue mayúsculas); búsqueda vacía devolvió los 4 libros; un texto inexistente dio 0 filas con el aviso «No se encontraron libros cuyo título coincida con la búsqueda.». Se registraron 3 pedidos a `/api/libros/` con el parámetro `titulo`. | OK |
| **CP-01b** | Paginación del catálogo (caso adicional). | «Página 1», «Anterior» y «Siguiente» deshabilitados con 4 libros (menos de 20). No se pudo probar el cambio de offset: hace falta una segunda página. | OK / parcial |
| **CP-02** | Alta de libro con ISBN existente y con ISBN nuevo. | ISBN `978-950-07-0001-1`: el servidor respondió `409` y se mostró «No se pudo dar de alta el libro: Ya existe un libro con ese ISBN»; los libros siguieron en 4. **No se probó el ISBN nuevo**: la QA tenía prohibido crear libros. | OK / parcial |
| **CP-03** | Alta de cliente con email inválido, repetido y nuevo. | Email inválido: rechazado en el navegador, 0 `POST`, clientes en 3. Email existente `ana@example.com`: `409` con «Ya existe un cliente con ese email», clientes en 3. El cliente QA aparece en la tabla y en el selector de Ventas. **No se probó el email existente en MAYÚSCULAS** (ver limitaciones). | OK / parcial |
| **CP-04** | Venta sin cliente, cantidad cero, negativa o decimal, libro repetido. | Sin cliente: «Elegí un cliente para confirmar la venta.» y 0 `POST`. Cantidades `0`, `-1` y `1.5`: «La cantidad debe ser un número entero mayor que cero.» y el ticket conserva 1 renglón. Libro repetido: ««Rayuela» ya está en el ticket. Cambiá su cantidad en la tabla de renglones.» y no se duplica el renglón. | OK |
| **CP-05** | Venta válida: dos unidades a $25.000 y una a $28.500,50. | La venta QA (id `5`) existe en el servidor con total `78500.50` y 2 renglones: Rayuela 2 × `25000.00` = `50000.00` y Ficciones 1 × `28500.50` = `28500.50`. El alta se hizo desde la interfaz en la sesión de QA; la respuesta de `GET /api/ventas/5` quedó guardada en `curl-api-venta-5.txt` y en la corrida final se reutilizó la misma venta. | OK |
| **CP-06** | Ventas confirmadas y precio del catálogo cambiado. | El detalle de la venta id `5` en el historial mostró 2 renglones, precio unitario `25000.00`, subtotal `50000.00` y total `78500.50`, idénticos a `GET /api/ventas/5`. **No se probó cambiando el precio del catálogo** (ver limitaciones). | OK / parcial |
| **CP-07** | Recarga de página después de altas y ventas. | Tras recargar: 4 libros, 3 clientes y 3 ventas; catálogo con 4 filas; 0 ids de cliente y de venta repetidos; el cliente y la venta QA aparecen una sola vez. En toda la corrida se registraron 50 pedidos a `/api/`. | OK |
| **CP-08** | Navegación por teclado y anchos de 320 px y 1280 px. | A 320 px: `305 <= 320` (sin scroll horizontal global), 5 contenedores de tabla con `overflow-x: auto` y 1 tabla que desborda dentro de su contenedor. A 1280 px: `1265 <= 1280` y los mismos contenedores. El tabulador recorre los 5 enlaces, el buscador y el botón de tema; el foco se ve (`outline` sólido de 3 px); Enter sobre «Clientes» abre la vista. | OK |
| **Extra** | API bloqueada. | Con `/api` bloqueado se ve «No se pudo conectar con el servidor. Revisá tu conexión y recargá la página.». Al desbloquear y recargar, el catálogo vuelve con 4 filas (recuperación). | OK |

### Casos no cubiertos y por qué

- **Paginación con más de 20 libros**: el catálogo tiene 4 libros, así que «Siguiente» queda
  deshabilitado y no se puede ejercitar el cambio de `offset`. Se verificó la lógica de
  habilitación/deshabilitación y las etiquetas de página.
- **Alta con ISBN nuevo**: la QA tenía prohibido crear libros. El camino de rechazo (`409`)
  está verificado; el de éxito (`201` → alta, catálogo y selector) está implementado pero no
  se probó contra la API.
- **Email repetido en MAYÚSCULAS**: el backend compara el email tal cual contra su `UNIQUE`
  (el front no lo pasa a minúsculas). Repetir un email con otra capitalización podría crear
  un cliente duplicado; no se ejecutó porque implicaba una escritura extra fuera del límite
  de la QA. Queda como riesgo conocido.
- **Cambio de precio que afecte el historial**: no hay interfaz ni endpoint de edición de
  precios en el front. La garantía se apoya en que los importes mostrados son los del
  servidor (verificado contra `GET /api/ventas/5`), no en un recálculo local.
- **Flujo Docker local**: la QA corrió contra la URL pública. La imagen y el workflow se
  validaron por inspección (incluida la réplica del chequeo de assets de `index.html`); el
  entorno local con Docker no se ejecutó en la máquina de QA porque no había Docker
  instalado.
- **CI en GitHub Actions**: no se ejecutó localmente; se verificó que la lista de assets del
  smoke test coincide exactamente con los 11 archivos locales de `index.html` y que
  `deploy.yml` es coherente con el `Dockerfile` y `default.conf.template`.

---

## 11. Evidencia

Todo en `evidence/paso-7/`:

| Archivo | Contenido |
| --- | --- |
| `qa-resultados.json` | Resultado estructurado de la corrida final: 10 bloques, 58 verificaciones, importes y notas. |
| `qa-consola-red.json` | Errores de consola, excepciones y las 74 entradas de red (método, URL, estado). |
| `qa-ejecucion.txt` | Log completo, con la hora de cada verificación. |
| `capturas/01…11` | Capturas de catálogo, estados, rechazos, venta, historial, 320 px, 1280 px y error de conexión. |
| `curl-api-venta-5.txt` | `GET /api/ventas/5` (200) con la venta QA: fecha, cliente y renglones. |
| `curl-api-health.txt`, `curl-api-libros.txt` | Respuestas del backend desplegado. |
| `curl-front-index.txt`, `curl-front-api-js.txt` | Lo que sirve nginx para el HTML y para `api.js`. |
| `qa-paso7.js` | Script de QA (Node + Chrome headless + DevTools Protocol, sin dependencias). |

Cómo se generó: el script abre Chrome headless, se conecta por CDP, recorre las vistas con
clics y teclado como un usuario, registra consola y red, y guarda capturas y JSON. Los
bloques de escritura tenían un límite explícito (un cliente y una venta «QA Prueba Paso 7»,
sin libros); en la corrida final ya existían y se reutilizaron.

Los datos de la venta QA, según `GET /api/ventas/5`:

- Fecha: `2026-11-13T16:10:16.691286Z`; total: `78500.50`.
- Cliente: id `4`, «QA Prueba Paso 7», `qa.paso7@example.com`.
- Renglones: Rayuela (libro `1`) 2 × `25000.00` = `50000.00`; Ficciones (libro `2`)
  1 × `28500.50` = `28500.50`.

---

## 12. Convenciones del proyecto

- Sin frameworks, sin librerías, sin CDN, sin build tools y sin gestor de paquetes.
- Nada de `innerHTML` con datos: siempre `textContent` y nodos creados a mano.
- El front no inventa datos ni cálculos de importes: los libros, clientes, ventas y precios
  salen de la API.
- Trabajo directo sobre `main`, sin ramas; commits con Conventional Commits en español
  (`feat(m05): …`, `docs(m06): …`).
- Los módulos M01–M07 tienen sus especificaciones en `openspec/specs/` (con los changes
  archivados en `openspec/changes/archive/`). Los pasos del TP Global se registran como
  commits `feat(global-paso-N)` y su documentación vive en este README.

---

## 13. Limitaciones conocidas

- **Paginación de ventas**: el listado pide 20 y no conoce el total; «Siguiente» se habilita
  sólo si la página vino completa. Es suficiente para el volumen actual (3 ventas).
- **Email único sin normalizar**: el `UNIQUE` del backend distingue mayúsculas de minúsculas;
  el front envía el email recortado y tal cual se escribió. Un email repetido con otra
  capitalización podría duplicarse.
- **Catálogo con pedidos por fila**: para mostrar los autores, el catálogo pide el detalle de
  cada libro de la página (hasta 20 pedidos por página). Es aceptable para este tamaño y
  evita una respuesta más pesada del listado.
- **Sin edición de precios**: no hay interfaz para modificar el precio de un libro; el
  historial conserva los importes porque los recibe del servidor al registrar la venta.
- **CI sin backend**: el workflow valida la imagen y los assets, pero no la API; esa
  verificación se hace contra el despliegue (sección 10).
