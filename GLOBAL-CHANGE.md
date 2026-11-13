# GLOBAL-CHANGE.md — Plan del TP Global (Programación III · Grupo 11)

> **Nombre del archivo:** `GLOBAL-CHANGE.md`. Se llama así a propósito para no chocar con el `CHANGE.md`, el `AGENTS.md` ni el `CLAUDE.md` del Parcial 1. Si el repo ya tiene archivos con esos nombres, **este es el del Global**.
>
> **Fecha:** 12/11/2026
> **Objetivo:** conectar el frontend del Parcial 1 con la API del Parcial 2 y dejarlo desplegado en EasyPanel.
> **Repositorios:**
> - Front: `parcial1-prog3` → https://github.com/ramiquirogab333/parcial1-prog3
> - Back: `parcial2-prog3` → https://github.com/ramiquirogab333/parcial2-prog3
> **URLs públicas:**
> - Front: https://libreria.francogagliardi.me
> - API: https://libros.francogagliardi.me
> - Docs de la API: https://libros.francogagliardi.me/docs

---

## 0. Resumen ejecutivo

El **backend ya está completo y desplegado**. El **frontend del Parcial 1 ya está completo** (HTML, CSS, catálogo, altas, ventas, historial y tema), pero funciona **100% con `localStorage`**: no hace ni un `fetch`. El TP Global pide reemplazar esa fuente local por la API real, sin romper la interfaz.

El trabajo se divide en **5 integrantes** (Franco queda aparte, a cargo de la VPS, EasyPanel y el Dockerfile del front, que ya hizo) y se ejecuta en **pasos secuenciales**: cada paso se pushea a `main` antes de que arranque el siguiente. Así se evitan conflictos de Git y se puede ver la conexión evolucionar en la URL pública.

**Estimación total:** 16–22 horas de trabajo efectivo entre los 5. Al ser secuencial, se hace de a un paso por vez; no se programa en paralelo.

---

## 1. Estado actual verificado

| Componente | Estado | Detalle |
| --- | --- | --- |
| Backend | **Completo y desplegado** | 7 módulos, PostgreSQL, Dockerfile, `DEPLOY.md`, `evidence/`. |
| API pública | **En línea** | `/health/ready` responde JSON 200. |
| Frontend | **Completo, pero local** | `index.html`, `css/style.css`, `css/tema.css`, `js/nucleo/*`, `js/modulos/*`. |
| Persistencia del front | **`localStorage`** | `js/nucleo/storage.js` guarda libros, clientes y ventas. No hay `fetch`. |
| Conexión front → API | **No existe** | `https://libreria.francogagliardi.me/api/health/ready` devuelve **HTML**, no JSON: falta el proxy `/api` en nginx. |
| CORS | **No configurado** | El front **debe** llamar por `/api` (same-origin). Llamar directo al dominio del backend falla por CORS. |
| Dockerfile del front | **Hecho por Franco, a ajustar** | Hoy usa `nginx:stable-alpine` y no tiene proxy `/api` ni `default.conf.template`. |
| GitHub Actions del back | **Activo** | Build + verificación con PostgreSQL OK; deploy por webhook de EasyPanel. |

> **Regla clave:** el backend **no se toca**. Todo el trabajo es en `parcial1-prog3`.

---

## 2. Equipo y responsabilidades

### Integrantes del front (5)

| Integrante | Pasos asignados | Perfil |
| --- | --- | --- |
| **Ramiro Quiroga** | Paso 1 (fundación API) + Paso 6 (ventas) | Es el que más sabe. Le tocan las dos partes más críticas. |
| **Ciro Cattaneo** | Paso 2 (catálogo) | Sabe lo suficiente. Conoce libros/autorías del backend. |
| **Ignacio Ceballos** | Paso 4 (alta de libros) | Sabe lo suficiente. Conoce autores/libros del backend. |
| **Emmanuel Miranda** | Paso 3 (historial) | Parte sencilla: lectura del historial. |
| **Santiago Copia** | Paso 5 (alta de clientes) + Paso 7 (docs/QA) | Partes sencillas: alta simple + documentación. |

### Franco (aparte)

- **Paso 0:** nginx `/api`, `default.conf.template`, Dockerfile del front, EasyPanel y `API_UPSTREAM`.
- **Paso 8:** deploy final, verificación end-to-end, evidencia y demo.
- **Backend:** Actions ya activo; secreto `EASYPANEL_DEPLOY_WEBHOOK` en GitHub.

---

## 3. Reglas de oro (Git y archivos)

1. **Se trabaja directo sobre `main`, sin ramas.** Un paso a la vez.
2. **Un paso = un commit (o unos pocos commits) = un push a `main`.** No mezclar dos pasos.
3. **El paso N+1 arranca recién cuando el paso N está pusheado en `main`.** Antes de arrancar: `git pull --rebase origin main`.
4. **Un dueño por archivo.** La tabla de abajo define quién toca qué. Si necesitás un cambio en un archivo de otro paso, **pará y coordiná**; no lo edites.
5. **`index.html` lo toca únicamente el dueño del paso que lo necesita.** Los demás no lo editan.
6. **No usar `git add .`.** Agregar solo los archivos del paso: `git add ruta/archivo`.
7. **No commitear** `.env`, `.venv`, `__pycache__`, `node_modules`, `Grupo11.zip`, credenciales ni tokens.
8. **No reformatear archivos enteros** ni cambiar código ajeno al paso. Diff chico y revisable.
9. **No tocar `openspec/specs/` a mano.** Si el equipo usa OpenSpec, cada paso puede ser un change; si no, alcanza con el commit directo.
10. **Ante conflicto:** `git pull --rebase origin main`, resolvés y volvés a pushear. **No uses `git push --force`.**
11. **Avisá al grupo cuando termines y pushees.** El siguiente hace `git pull` antes de empezar. Nadie más toca el repo mientras alguien está en un paso.

### Tabla de propiedad de archivos

| Archivo | Dueño | Otros |
| --- | --- | --- |
| `js/nucleo/api.js` (nuevo) | Ramiro (Paso 1) | Nadie más lo edita |
| `js/nucleo/data.js` | Ramiro (Paso 1) | Nadie más |
| `js/nucleo/storage.js` | Ramiro (Paso 1) → **se elimina** | Nadie más |
| `js/modulos/catalogo.js` | Ciro (Paso 2) | Nadie más |
| `js/modulos/historial.js` | Emmanuel (Paso 3) | Nadie más |
| `js/modulos/libros.js` | Ignacio (Paso 4) | Nadie más |
| `js/modulos/clientes.js` | Santiago (Paso 5) | Nadie más |
| `js/modulos/ventas.js` | Ramiro (Paso 6) | Nadie más |
| `index.html` | El dueño de cada paso, en su turno | Solo se toca la sección necesaria |
| `css/style.css` / `css/tema.css` | Ya están listos | No se tocan salvo que un paso lo pida |
| `README.md` | Santiago (Paso 7) | Nadie más |
| `docs/DEPLOY.md` | Franco (Pasos 0 y 8) | Nadie más |
| `.github/workflows/deploy.yml` (front) | Ramiro (Paso 1) + Santiago (Paso 7) | Coordinar |
| `Dockerfile`, `default.conf.template`, `docker-compose.yml` | Franco | Nadie más |

---

## 4. Orden de pasos

| Paso | Responsable | Entregable | Depende de | Tiempo |
| --- | --- | --- | --- | --- |
| **0** | **Franco** | Proxy `/api`, Dockerfile, EasyPanel, `API_UPSTREAM` | — | 1–2 h |
| **1** | **Ramiro** | Fundación: `api.js`, adaptador de datos, quitar `localStorage`, workflow | 0 (para probar en línea) | 3–4 h |
| **2** | **Ciro** | Catálogo (E1): `limit/offset/titulo`, autores, estados, paginación | 1 | 3–4 h |
| **3** | **Emmanuel** | Historial (E3 lectura): `limit/offset`, detalle `GET /ventas/{id}` | 1 | 2–3 h |
| **4** | **Ignacio** | Alta de libros (E2): `stock`, autores con rol/orden, `POST /libros/` | 1, 2 | 3–4 h |
| **5** | **Santiago** | Alta de clientes (E2): `POST /clientes/`, selector para venta | 1 | 1,5–2 h |
| **6** | **Ramiro** | Ventas (E3 escritura): `POST /ventas/`, respuesta del servidor, errores | 2, 4, 5 | 3–4 h |
| **7** | **Santiago** | README, workflow del front, QA y evidencia | todos | 2–3 h |
| **8** | **Franco** | Deploy final, verificación en la URL, demo y cierre | 7 | 1 h |
| **9** | **Santiago** | Favicon SVG, link en `public/index.html` y assets del workflow (12) | 7 | 15–30 min |

> **Importante:** no se programa en paralelo. Como se trabaja directo sobre `main`, dos personas no pueden tocar el repo a la vez. El orden es estricto: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.

---

## 5. Paso 0 — Franco: infraestructura y conexión (VPS)

**Objetivo:** que `https://libreria.francogagliardi.me/api/...` llegue a la API y devuelva JSON.

### 5.1 nginx: crear `default.conf.template`

El `nginx.conf` actual no tiene `/api`. Hay que crear `default.conf.template` (en la raíz del front) conservando gzip, headers y caché, y agregando:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://${API_UPSTREAM}/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**La barra final de `proxy_pass` es obligatoria:** hace que `/api/libros/` llegue a FastAPI como `/libros/`.

### 5.2 Dockerfile del front

Alinear con la guía del Global. Si se mantiene la estructura plana (sin `public/`):

```dockerfile
FROM nginx:1.30-alpine
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
```

Si se migra a `public/` (lo pide la guía para el Ejercicio 4), usar:

```dockerfile
FROM nginx:1.30-alpine
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$
COPY public/ /usr/share/nginx/html/
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
```

> Si se mueve a `public/`, actualizar también `.dockerignore`, `docker-compose.yml` y el workflow del front (`public/index.html`).

### 5.3 EasyPanel

1. En el servicio del **front**, agregar la variable:
   - **Nombre:** `API_UPSTREAM`
   - **Valor:** `host:8000` del backend, **sin** `http://` y **sin** barra final.
   - Ejemplos: `libreria-api:8000` o `grupo_11_libreria-api:8000` (verificar el DNS interno real).
2. Si el front y el back están en **proyectos distintos**, compartir la red o mover el front al proyecto `grupo_11`; si no, el nombre interno no resuelve.
3. Redeploy del front.
4. Verificar desde afuera:
   ```bash
   curl -i https://libreria.francogagliardi.me/api/health/ready
   curl -s https://libreria.francogagliardi.me/api/libros/
   ```
   El primero debe devolver **JSON 200** (no HTML) y el segundo la lista de libros.

### 5.4 GitHub Actions del backend

- Ya está activo: build con PostgreSQL temporal + `/health/ready`.
- Para el deploy, configurar en el repo del backend el secret **`EASYPANEL_DEPLOY_WEBHOOK`** con la URL del webhook de la App del backend.
- El secret del front es otro, en el repo del front (`EASYPANEL_DEPLOY_WEBHOOK`).

### Criterio de aceptación del Paso 0

- [ ] `https://libreria.francogagliardi.me/api/health/ready` → 200 JSON.
- [ ] `https://libreria.francogagliardi.me/api/libros/` → lista con datos.
- [ ] El front sigue sirviendo el HTML y los assets.
- [ ] El workflow del backend puede deployar sin errores.

---

## 6. Paso 1 — Ramiro: fundación de datos (API + quitar `localStorage`)

**Objetivo:** que la app cargue los datos desde la API y deje de sembrar `localStorage`. Todavía no se conectan las altas; eso viene en los pasos 4, 5 y 6.

### Archivos

- **Nuevo:** `js/nucleo/api.js`
- **Modificar:** `js/nucleo/data.js`, `index.html`, `.github/workflows/deploy.yml`
- **Eliminar:** `js/nucleo/storage.js`

### Tareas

1. **Crear `js/nucleo/api.js`** con un namespace `API`:
   ```js
   var API = (function () {
     "use strict";
     var BASE = "/api";

     function construirUrl(ruta, query) {
       var url = BASE + ruta; // ruta SIEMPRE con barra final: "/libros/"
       if (query) {
         var partes = [];
         Object.keys(query).forEach(function (clave) {
           var valor = query[clave];
           if (valor !== undefined && valor !== null && valor !== "") {
             partes.push(encodeURIComponent(clave) + "=" + encodeURIComponent(valor));
           }
         });
         if (partes.length) url += "?" + partes.join("&");
       }
       return url;
     }

     async function pedir(ruta, opciones) { /* fetch, JSON, {ok,status,data,mensaje} */ }
     async function get(ruta, query) { return pedir(ruta, { method: "GET", query: query }); }
     async function post(ruta, cuerpo) { return pedir(ruta, { method: "POST", body: cuerpo }); }

     return { get: get, post: post, /* cargarTodo, refrescar... */ };
   })();
   ```

2. **Normalizar la API al modelo que ya usan los módulos.** Los IDs de la API son números; el front usa strings. Normalizar a string y convertir a número solo al enviar.
   - Editorial: `{ id: String(e.id), nombre: e.nombre, pais: e.pais }`
   - Género: `{ id: String(g.id), nombre: g.nombre }`
   - Autor: `{ id: String(a.id), nombre: a.nombre + " " + a.apellido, nacionalidad: a.nacionalidad }`
   - Libro: `{ id: String(l.id), titulo, isbn, precio: Number(l.precio), stock: l.stock, editorialId: String(l.editorial_id), generoId: l.genero_id == null ? null : String(l.genero_id), autorIds: (l.autores || []).map(a => String(a.autor_id)), autores: (l.autores || []).map(...) }`
   - Cliente: `{ id: String(c.id), nombre, email, perfil: c.perfil }`
   - Venta: `{ id: String(v.id), fecha: v.fecha, total: Number(v.total), clienteId: String(v.cliente.id), clienteNombre: v.cliente.nombre, renglones: (v.renglones || []).map(...) }`

3. **Implementar `API.cargarTodo()`:**
   - `GET /editoriales/?limit=100&offset=0`
   - `GET /generos/` (sin paginación)
   - `GET /autores/?limit=100&offset=0`
   - `GET /libros/?limit=100&offset=0` (paginar si hay más de 100)
   - `GET /clientes/?limit=100&offset=0`
   - `GET /ventas/?limit=20&offset=0` (solo listado; el detalle lo hace el Paso 3)
   - Volcar todo en `Datos` y llamar a `Catalogo.render()`, `Libros.render()`, `Clientes.render()`, `Ventas.render()`, `Historial.render()` si existen.
   - Si una llamada falla, mostrar un mensaje visible y no romper la página.

4. **`js/nucleo/data.js`:** dejar `Datos` con arrays vacíos (o mantener las semillas solo como fallback), agregar `Datos.ventas = []`. No borrar `Datos.buscarLibrosPorTitulo` si se usa como fallback.

5. **`index.html`:**
   - Agregar `<script src="js/nucleo/api.js"></script>` después de `data.js`.
   - Quitar `<script src="js/nucleo/storage.js"></script>`.
   - No cambiar IDs ni clases existentes.

6. **Eliminar `js/nucleo/storage.js`** (o dejarlo sin cargar; mejor eliminarlo para que nadie lo use).

7. **Actualizar `.github/workflows/deploy.yml` del front:** en la lista de assets, quitar `/js/nucleo/storage.js` y agregar `/js/nucleo/api.js`; actualizar la lista "esperado".

### Criterio de aceptación

- [ ] La página carga y el catálogo muestra datos de la API.
- [ ] Las tablas de libros y clientes muestran datos de la API.
- [ ] Recargar no duplica registros ni siembra datos locales.
- [ ] En DevTools → Network se ven las llamadas a `/api/...`.
- [ ] No hay errores de `Almacenamiento` en consola.
- [ ] El workflow del front pasa el smoke test de assets.

> **Estado transitorio:** las altas todavía guardan en memoria local (los pasos 4–6 las conectan). Es esperable.

---

## 7. Paso 2 — Ciro: catálogo (Ejercicio 1, 20 pts)

**Objetivo:** catálogo con búsqueda, paginación y autores desde la API.

### Archivos

- `js/modulos/catalogo.js`
- `index.html` (solo la sección Catálogo, para los controles de paginación)

### Tareas

1. Estado del catálogo: `limite = 20`, `desplazamiento = 0`, `texto = ""`, `cargando = false`.
2. `cargar()`:
   - `GET /libros/` con `{ limit: limite, offset: desplazamiento, titulo: texto || undefined }`.
   - Para los autores, hacer `GET /libros/{id}` por cada libro de la página (en paralelo con `Promise.all`) y mergear `autores`.
   - Renderizar título, ISBN, precio, editorial, género y autores.
   - Si `genero` es `null`, mostrar **«Sin clasificar»**.
3. Buscador:
   - `input` con debounce de 300 ms.
   - Al cambiar el texto: `desplazamiento = 0` y volver a cargar.
4. Paginación:
   - Agregar en `index.html` dos botones (`#btn-catalogo-anterior`, `#btn-catalogo-siguiente`) y un texto (`#pagina-catalogo`).
   - Anterior deshabilitado si `offset === 0`.
   - Siguiente deshabilitado si `data.length < limite`.
5. Estados visibles: **cargando**, **lista vacía**, **búsqueda sin coincidencias**, **error de conexión**.
6. Insertar con `textContent`; nunca `innerHTML` con datos de la API.

### Criterio de aceptación

- [ ] Buscar `rayu`, `RAYU` y `  rayu  ` devuelve lo mismo.
- [ ] Cambiar de página envía `offset` distinto.
- [ ] El detalle de autores sale de `GET /libros/{id}`.
- [ ] Género nulo → «Sin clasificar».
- [ ] Se ven los 4 estados.

---

## 8. Paso 3 — Emmanuel: historial (Ejercicio 3, lectura)

**Objetivo:** historial y detalle de ventas contra la API.

### Archivos

- `js/modulos/historial.js`
- `index.html` (solo la sección Historial, para paginación)

### Tareas

1. `GET /ventas/?limit=20&offset=` para el listado.
2. Renderizar fecha, cliente, total y botón **Ver detalle**.
3. Al abrir el detalle: `GET /ventas/{id}` y mostrar renglones con libro, cantidad, precio unitario y subtotal. Cachear el detalle por id.
4. Paginación anterior/siguiente (mismo criterio que el catálogo: `data.length < limit`).
5. Mostrar estados de carga, vacío y error.
6. Usar los importes que devuelve el servidor; no recalcular con el precio actual del libro.

### Criterio de aceptación

- [ ] La tabla muestra las ventas reales.
- [ ] El detalle coincide con `GET /ventas/{id}`.
- [ ] Recargar la página conserva las ventas.
- [ ] La paginación funciona.
- [ ] Los importes históricos no cambian si se modifica el precio de un libro.

---

## 9. Paso 4 — Ignacio: alta de libros (Ejercicio 2, 10 pts)

**Objetivo:** dar de alta libros con editorial, género opcional, stock y autores con rol/orden.

### Archivos

- `js/modulos/libros.js`
- `index.html` (sección Libros: campo `stock` y UI de autores)
- `css/style.css` (solo si hace falta estilo para la tabla de autores)

### Tareas

1. **Agregar el campo `stock`** al formulario (entero ≥ 0). Hoy el HTML no lo tiene.
2. **Autores con rol y orden:**
   - Opción completa: al seleccionar autores, mostrar una fila por autor con `select` de rol (`autor`, `coautor`, `traductor`, `ilustrador`) y un `input` de orden (≥ 1).
   - Opción mínima válida: mantener el `select multiple` y asignar `rol: "autor"` y `orden` según el orden de selección. Documentar la decisión en el commit/README.
3. Cargar los selectores desde `Datos.editoriales`, `Datos.generos`, `Datos.autores` (ya vienen de la API en el Paso 1).
4. Validar:
   - Título e ISBN no vacíos.
   - Precio > 0.
   - Stock entero ≥ 0.
   - Editorial seleccionada.
   - Al menos un autor.
   - Orden entero ≥ 1.
   - Sin autores repetidos.
5. Enviar `POST /libros/`:
   ```json
   {
     "isbn": "978-950-00-0006-6",
     "titulo": "Los que aman, odian",
     "precio": "21000.00",
     "stock": 4,
     "editorial_id": 1,
     "genero_id": 1,
     "autores": [
       { "autor_id": 3, "rol": "coautor", "orden": 1 }
     ]
   }
   ```
   Convertir los IDs a número con `Number()`; `genero_id` en `null` si está vacío.
6. En 201: normalizar el libro devuelto, actualizarlo en `Datos.libros`, re-renderizar catálogo, tabla de libros y selector de venta. Mostrar mensaje de éxito.
7. En 409 (ISBN repetido, editorial/autor inexistente) y 422: mostrar el mensaje del servidor, sin perder lo cargado.
8. Quitar `siguienteId` y la generación local de IDs.

### Criterio de aceptación

- [ ] Alta válida → 201 y aparece en catálogo, tabla y selector de venta.
- [ ] ISBN repetido → 409 con mensaje claro.
- [ ] Autor/editorial inexistente → 409.
- [ ] Precio ≤ 0, stock negativo, sin autores u orden inválido → 422 o validación local.
- [ ] El precio y el stock se guardan en PostgreSQL (recargar lo confirma).

---

## 10. Paso 5 — Santiago: alta de clientes (Ejercicio 2, 10 pts)

**Objetivo:** dar de alta clientes y usarlos en la venta.

### Archivos

- `js/modulos/clientes.js`

### Tareas

1. `POST /clientes/` con `{ "nombre": "...", "email": "..." }` (el perfil es opcional).
2. Validar en el cliente: nombre no vacío, email con formato y sin espacios.
3. En 201: normalizar el cliente devuelto, agregarlo a `Datos.clientes`, re-renderizar tabla y selector de venta.
4. En 409 (email repetido) y 422: mostrar el mensaje del servidor.
5. Cargar la tabla con `GET /clientes/?limit=100&offset=0`. **Documentar en el commit/README que se eligió el listado** porque el backend lo expone; usar `GET /clientes/{id}` para confirmar el nombre al seleccionar un cliente para la venta.
6. Quitar `siguienteId`.

### Criterio de aceptación

- [ ] Alta válida → 201, aparece en la tabla y en el selector de venta.
- [ ] Email repetido → 409 con mensaje claro.
- [ ] Email inválido → 422/validación local.
- [ ] Recargar conserva los clientes (vienen de PostgreSQL).

---

## 11. Paso 6 — Ramiro: ventas (Ejercicio 3, 15 pts)

**Objetivo:** registrar la venta en la API y usar los importes del servidor.

### Archivos

- `js/modulos/ventas.js`

### Tareas

1. Mantener la composición del ticket: cliente, libro, cantidad entera > 0, cambiar cantidad, quitar renglón.
2. Un solo renglón por libro (informar si se repite; no duplicar).
3. Preview local de precio unitario, subtotal y total (solo para mostrar).
4. Al confirmar:
   - Exigir al menos un renglón.
   - Deshabilitar el botón mientras se envía.
   - Enviar **solo**:
     ```json
     {
       "cliente_id": 2,
       "renglones": [
         { "libro_id": 1, "cantidad": 2 },
         { "libro_id": 4, "cantidad": 1 }
       ]
     }
     ```
     Nunca precio, total ni fecha.
   - Convertir IDs a número.
5. En 201:
   - Mostrar el total y los importes **de la respuesta**.
   - Limpiar el formulario.
   - Agregar la venta normalizada a `Datos.ventas` y disparar la recarga del historial (`document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "ventas" } }))` o llamar a `Historial.render()`).
6. En 409 (cliente/libro inexistente) y 422 (renglones repetidos, cantidad inválida): mostrar el mensaje y **conservar el borrador**.
7. Quitar `siguienteId` y la generación local de la venta.
8. No implementar PATCH de ventas: las ventas no se modifican.

### Criterio de aceptación

- [ ] Venta con 2 renglones → 201, total del servidor.
- [ ] Recargar y abrir el detalle muestra los mismos importes.
- [ ] Libro repetido → 422 y el borrador sigue armado.
- [ ] El botón no se puede disparar dos veces.
- [ ] El total mostrado coincide con el de la API.

---

## 12. Paso 7 — Santiago: documentación, workflow y QA

**Objetivo:** que la documentación refleje la realidad y que el pipeline del front siga verde.

### Archivos

- `README.md`
- `.github/workflows/deploy.yml` (front)
- `evidence/` (opcional)

### Tareas

1. Actualizar `README.md`:
   - Ya no funciona “entera en el navegador”: ahora usa la API.
   - Explicar la base `/api`, el proxy nginx y `API_UPSTREAM`.
   - Cómo correr local: backend + PostgreSQL + front por Docker.
   - Documentar la elección de `GET /clientes/` para el selector.
   - Actualizar la sección de pruebas manuales.
2. Revisar `.github/workflows/deploy.yml`:
   - Assets esperados: incluir `api.js`, quitar `storage.js`.
   - Smoke test de `/` y de los assets.
3. Ejecutar el checklist de QA (ver §14) y guardar evidencia (capturas o `curl`) si el docente la pide.
4. Verificar que `git status` no incluya `.env`, `.venv`, `__pycache__` ni `Grupo11.zip`.

### Criterio de aceptación

- [ ] El README no dice “sin servidor” ni “localStorage” como fuente de verdad.
- [ ] El workflow del front pasa.
- [ ] El checklist de QA está completo.
- [ ] No hay secretos ni archivos basura en el repo.

---

## 13. Paso 8 — Franco: deploy final y demo

1. Terminar y pushear el Paso 7 y esperar el deploy automático del front.
2. Verificar en la URL pública:
   - `/api/health/ready` → 200 JSON.
   - `/api/libros/` → lista.
   - Catálogo con datos.
   - Alta de un libro y un cliente de prueba.
   - Venta con 2 renglones.
   - Recargar y abrir el detalle desde el historial.
3. Guardar evidencia en `parcial1-prog3/evidence/` (capturas, `curl`, logs).
4. Actualizar `docs/DEPLOY.md` con la fecha, `API_UPSTREAM` y los comandos.
5. Armar el ZIP final sin `.env`, `.venv` ni `__pycache__`.

---

## 13.1. Paso 9 — Santiago: favicon y ajuste de assets

> **Estado:** implementado en el cierre de la entrega. Se deja documentado como
> change extra para que quede en el plan.

**Objetivo:** que la pestaña del navegador muestre el ícono de la librería.

### Archivos

- `public/favicon.svg` (nuevo)
- `public/index.html` (link en el `<head>`)
- `.github/workflows/deploy.yml` (lista de assets del smoke test)
- `README.md` (conteo de assets: 11 → 12)

### Tareas

1. Crear un SVG con los colores del sitio, sin recursos externos.
2. Agregar `<link rel="icon" type="image/svg+xml" href="favicon.svg" />`.
3. Sumar `/favicon.svg` al smoke test y a la lista esperada (12 assets).
4. Actualizar el README.
5. Verificar que la pestaña muestra el ícono y que el workflow pasa.

### Criterio de aceptación

- [ ] La pestaña muestra el favicon.
- [ ] `/favicon.svg` responde `200`.
- [ ] El workflow del front pasa.
- [ ] No hay recursos externos.

## 14. Contrato de API (resumen para el front)

**Base:** `/api` (same-origin, a través de nginx). **Siempre con barra final** en las rutas que la traen.

| Método | Ruta | Parámetros / cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | `/health/live` | — | `{"estado":"vivo"}` |
| GET | `/health/ready` | — | 200 si la base responde; 503 si no |
| GET | `/editoriales/` | `limit` (1–100, def. 20), `offset` | Lista de editoriales |
| GET | `/generos/` | — | Lista de géneros |
| GET | `/autores/` | `limit`, `offset` | Lista de autores |
| GET | `/autores/{id}` | — | Autor |
| GET | `/libros/` | `limit`, `offset`, `titulo`, `genero_id` | Lista con editorial y género (sin autores) |
| GET | `/libros/{id}` | — | Detalle con editorial, género y autores |
| POST | `/libros/` | `LibroCreate` con `autores` | 201, detalle; 409/422 |
| GET | `/clientes/` | `limit`, `offset` | Lista con perfil |
| GET | `/clientes/{id}` | — | Cliente con perfil |
| POST | `/clientes/` | `{nombre, email, perfil?}` | 201; 409/422 |
| GET | `/ventas/` | `limit`, `offset` | Lista con cliente (sin renglones) |
| GET | `/ventas/{id}` | — | Detalle con cliente y renglones |
| POST | `/ventas/` | `{cliente_id, renglones:[{libro_id, cantidad}]}` | 201, detalle; 409/422 |

### Formas importantes

**Libro detalle (`GET /libros/{id}`):**
```json
{
  "id": 1,
  "isbn": "978-950-00-0006-6",
  "titulo": "Los que aman, odian",
  "precio": "21000.00",
  "stock": 4,
  "editorial_id": 1,
  "genero_id": 1,
  "editorial": { "id": 1, "nombre": "Sudamericana", "pais": "Argentina" },
  "genero": { "id": 1, "nombre": "Narrativa" },
  "autores": [
    { "id": 10, "autor_id": 3, "nombre": "Julio", "apellido": "Cortázar", "nacionalidad": "Argentina", "rol": "coautor", "orden": 1 }
  ]
}
```

**Venta detalle (`GET /ventas/{id}`):**
```json
{
  "id": 2,
  "fecha": "2026-10-08T21:14:11.751581Z",
  "total": "77000.00",
  "cliente": { "id": 2, "nombre": "Tomás Ríos", "email": "tomas@example.com" },
  "renglones": [
    { "libro_id": 1, "titulo": "Rayuela", "cantidad": 2, "precio_unitario": "25000.00", "subtotal": "50000.00" }
  ]
}
```

### Reglas de datos

- **IDs:** la API usa números; el front normaliza a string para el DOM y convierte a `Number()` al enviar.
- **Decimales:** la API devuelve strings (`"25000.00"`). Para mostrar, `Number()`; para cuentas de dinero, usar el valor del servidor.
- **Errores:** `{"detail": "texto"}` o `{"detail": [{...}]}`. Mostrar un mensaje legible; nunca el JSON crudo ni trazas.
- **CORS:** no existe. Usar siempre `/api`.
- **Listados:** no hay total; para saber si hay página siguiente, comparar `data.length === limit`.

---

## 15. Pruebas locales (antes de pushear)

### Backend local

```bash
cd parcial2-prog3
# PostgreSQL local (o usar el de Docker)
docker run -d --name libreria-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=libreria \
  postgres:16-alpine

# .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/libreria
SQL_ECHO=false

python -m venv .venv
# activar el entorno
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

### Front con el proxy

```bash
cd parcial1-prog3
docker build -t libreria-frontend .
docker run --rm -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=host.docker.internal:8000 \
  libreria-frontend
```

Abrir `http://localhost:8080` y verificar:

```bash
curl -i http://localhost:8080/api/health/ready
curl -s http://localhost:8080/api/libros/
```

### Checklist manual

- [ ] Catálogo carga desde la API.
- [ ] Buscar por título (mayúsculas/minúsculas/espacios).
- [ ] Paginación del catálogo.
- [ ] Alta de libro con 2 autores, roles y stock.
- [ ] ISBN repetido → 409.
- [ ] Alta de cliente; email repetido → 409.
- [ ] Venta con 2 renglones; total del servidor.
- [ ] Recargar y ver el detalle en el historial.
- [ ] Libro repetido en la venta → 422 y borrador conservado.
- [ ] Género nulo → «Sin clasificar».

---

## 16. Checklist final del Global

### Ejercicio 1 — Catálogo y cliente HTTP (20)
- [ ] Base `/api` centralizada y `fetch` con manejo de errores.
- [ ] `GET /libros/` con `limit` (1–100, def. 20), `offset`, `titulo`.
- [ ] Búsqueda parcial sin distinguir mayúsculas; reset de offset al filtrar.
- [ ] Título, ISBN, precio, editorial, género y autores.
- [ ] «Sin clasificar» si el género es nulo.
- [ ] Estados: carga, vacío, sin resultados, error.

### Ejercicio 2 — Altas de libros y clientes (20)
- [ ] `POST /libros/` con precio > 0, stock ≥ 0, editorial, género opcional y al menos un autor con rol/orden.
- [ ] Selectores desde `GET /editoriales/`, `GET /generos/`, `GET /autores/`.
- [ ] `POST /clientes/` con nombre y email; selector para la venta.
- [ ] 201 actualiza las vistas; 409/422 muestran mensaje.

### Ejercicio 3 — Ventas e historial (25)
- [ ] Ticket con cliente, libros, cantidades editables y quitar renglones.
- [ ] Al menos un renglón, cantidades enteras positivas, un libro por renglón.
- [ ] `POST /ventas/` solo con IDs y cantidades.
- [ ] Precios, subtotales y total de la respuesta; limpiar formulario.
- [ ] Botón deshabilitado durante el envío.
- [ ] Historial con `limit/offset` y detalle `GET /ventas/{id}`.
- [ ] Importes históricos inmutables.
- [ ] 409/422 con mensaje y borrador conservado.

### Ejercicio 4 — Dockerfile del frontend (15) — Franco
- [ ] `nginx:1.30-alpine`.
- [ ] `default.conf.template` con `API_UPSTREAM`.
- [ ] Puerto 80 y healthcheck.
- [ ] `.dockerignore` sin secretos.

### Ejercicio 5 — Servicios en EasyPanel (20) — Franco
- [ ] Front y API como servicios App.
- [ ] `API_UPSTREAM` por red interna.
- [ ] `/api/` bajo el dominio del front.
- [ ] Backend con PostgreSQL.

### Demostración mínima
- [ ] Desde la URL: catálogo → venta con 2 renglones → recargar → abrir detalle.
- [ ] Los importes coinciden con la API.

---

## 17. Troubleshooting

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `/api/...` devuelve HTML | Falta `location /api/` o `API_UPSTREAM` | Revisar `default.conf.template` y la variable en EasyPanel |
| 404 en `/api/libros` | Falta barra final | Usar `/api/libros/` |
| 502 en `/api/...` | El front no resuelve el host del back | Mismo proyecto/red; probar `wget` dentro del contenedor |
| 422 con `detail` en array | Validación de FastAPI | Formatear el array a un texto legible |
| 409 | ISBN/email repetido, FK inexistente | Mostrar el `detail` del servidor |
| CORS | Se llamó directo al dominio del backend | Usar `/api` |
| Datos viejos en el navegador | `localStorage` del Parcial 1 | Borrar claves `libreria.*` y recargar |
| nginx no arranca | `API_UPSTREAM` vacío | Configurar la variable antes del deploy |
| El deploy del back falla | Falta el secret del webhook | Agregar `EASYPANEL_DEPLOY_WEBHOOK` en GitHub |

---

## 18. Definition of Done (por paso)

Un paso está terminado cuando:

1. Estás en `main` y el repo está actualizado (`git pull --rebase origin main`).
2. El código funciona localmente con el backend y el proxy.
3. Se probaron los criterios de aceptación del paso.
4. `git diff` solo incluye los archivos del paso.
5. El commit tiene un mensaje claro: `feat(global-paso-N): ...`.
6. El commit se pusheó a `main`.
7. El workflow del front pasó (build + deploy).
8. Se avisó al grupo que el siguiente paso puede arrancar.

---

## 19. Frase para arrancar cada paso

Copiar y pegar en la IA, cambiando el número y el nombre:

> "Estoy en el repo `parcial1-prog3`. Leé `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`. Me toca el **Paso N — [nombre]**. Trabajamos directo sobre `main`, sin ramas. Antes de tocar nada: corré `git status`, `git pull --rebase origin main`, decime en qué estado está el repo y proponeme un plan con los archivos exactos que vas a modificar. Esperá mi confirmación antes de editar."
