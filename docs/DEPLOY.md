# Despliegue (Docker + EasyPanel + GitHub Actions)

Guía de infraestructura. La imagen sirve los archivos estáticos con nginx y
reenvía `/api/` al backend usando la variable `API_UPSTREAM` (sin build, sin npm).

> Este documento vive en `docs/DEPLOY.md`. Los archivos de infraestructura que
> describe **siguen en la raíz del repositorio**: este cambio sólo movió el
> documento, no los archivos que usa el despliegue.

## Estado actual del despliegue

- **URL pública del front:** <https://libreria.francogagliardi.me>
- **URL pública de la API:** <https://libros.francogagliardi.me>
- **Documentación interactiva:** <https://libros.francogagliardi.me/docs>
- **Fecha del despliegue:** 2026-11-13
- **Variable `API_UPSTREAM`:** `libreria-api:8000`
- **Servicios de EasyPanel:** `libreria` (front), `libreria-api` (back) y
  `libreria-bd` (PostgreSQL), en el mismo proyecto.

Verificación desde afuera:

```bash
curl -i https://libreria.francogagliardi.me/api/health/ready
# HTTP 200  {"status":"ok","database":"up"}

curl -s https://libreria.francogagliardi.me/api/libros/
# Lista de libros reales de PostgreSQL

curl -I https://libreria.francogagliardi.me/
# HTTP 200  text/html
```

## Arquitectura

```text
Navegador
  │  GET /api/libros/  (same-origin)
  ▼
nginx (contenedor del front)
  ├── location /      → sirve public/index.html, public/css/ y public/js/
  └── location /api/  → proxy_pass http://${API_UPSTREAM}/
                              │
                              ▼
                        FastAPI + PostgreSQL
```

- El front es estático: no hay build, ni npm, ni backend dentro de la imagen.
- nginx hace de único punto de entrada: sirve el sitio y reenvía `/api/` al
  backend por la red interna de EasyPanel.
- La barra final de `proxy_pass` es obligatoria: `/api/libros/` llega a FastAPI
  como `/libros/`.
- No hay CORS: el navegador siempre llama a `/api/...` en el mismo origen.

## Cómo se actualiza

1. Se hace `push` a la rama `main`.
2. GitHub Actions construye la imagen, corre el smoke test y dispara el webhook
   de EasyPanel.
3. EasyPanel reconstruye y recrea el contenedor del front.
4. Los datos **no se pierden**: viven en PostgreSQL, no en el contenedor del
   front.
5. Si cambió el backend, se redeploya su App service por separado; la base
   conserva los datos.

## Qué se agregó para que corra en el contenedor

- `default.conf.template` con `location /api/` y `proxy_pass` al upstream.
- `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$` para que nginx reemplace solo esa
  variable y no toque `$uri`, `$host`, etc.
- `Dockerfile` con `nginx:1.30-alpine`, copia de `public/` y `HEALTHCHECK`
  sobre `127.0.0.1`.
- `API_UPSTREAM` se carga en el entorno del servicio del front en EasyPanel;
  **no** está en la imagen ni en el repositorio.
- El front usa `/api` como base; no hay URL absoluta del backend en el JS.

## Verificación funcional

La QA completa contra la URL pública se ejecutó el **2026-11-13** con Chrome
headless: **58/58 verificaciones OK**. El detalle, las capturas y las salidas de
`curl` están en [`evidence/paso-7/`](../evidence/paso-7/). La demo mínima
(catálogo → venta con 2 renglones → recarga → detalle del historial) quedó
verificada en esa corrida.

## Archivos

| Archivo | Dónde está | Para qué |
| ----- | ----- | ----- |
| `Dockerfile` | raíz | Imagen del sitio: nginx alpine + los archivos estáticos. |
| `default.conf.template` | raíz | Plantilla de nginx: gzip, cabeceras, caché `no-cache`, `try_files` y proxy `/api/` con `${API_UPSTREAM}`. |
| `public/` | raíz | Sitio estático: `index.html`, `css/` y `js/`. Es lo único que entra a `/usr/share/nginx/html/`. |
| `.dockerignore` | raíz | Deja fuera del contexto `.git`, `.github`, `openspec`, `**/*.md`, etc. |
| `docker-compose.yml` | raíz | Prueba local en `http://localhost:8080`. |
| `.github/workflows/deploy.yml` | raíz | En cada push a `main`: construye la imagen, la prueba y dispara el deploy en EasyPanel. |

## Probar en local

```bash
# Con el backend corriendo en http://localhost:8000
docker compose up -d --build
# http://localhost:8080
docker compose logs -f
docker compose down
```

El `docker-compose.yml` define `API_UPSTREAM=host.docker.internal:8000` para
que nginx pueda llegar al backend desde el contenedor. Verificar:

```bash
curl -i http://localhost:8080/api/health/ready
```

## 1. Crear la app en EasyPanel (una sola vez)

1. **Create Service → App**.
2. Source: **GitHub** → repositorio `parcial1-prog3`, branch `main`.
3. Build: **Dockerfile**, build path `/` (raíz del repositorio), Dockerfile `Dockerfile` (también en la raíz).
4. **Port interno: 80** (EasyPanel rutea el dominio a ese puerto).
5. **Variables de entorno:** agregar `API_UPSTREAM` con el host interno del
   backend y el puerto 8000, **sin** `http://` y **sin** barra final. Ejemplo:
   `libreria-api:8000` o `grupo_11_libreria-api:8000` (verificar el DNS interno
   real en el servicio del backend). Si falta esta variable, nginx no arranca.
6. Domain: agregar el dominio y activar HTTPS (Let's Encrypt) desde EasyPanel.
7. Deploy una vez a mano para confirmar que construye y que
   `https://<dominio>/api/health/ready` devuelve JSON.

> Si en lugar de App usás **Docker Compose**, quitá el bloque `ports:` del
> `docker-compose.yml` de la raíz para no chocar con otros proyectos del VPS: EasyPanel se
> encarga de la red y del ruteo al puerto 80 del servicio.

## 2. Conectar GitHub Actions

1. En EasyPanel, dentro de la app: pestaña **Deploy** → copiar la URL del
   **Deploy Webhook** (incluye token, tratarla como secreto).
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
   - Nombre: `EASYPANEL_DEPLOY_WEBHOOK`
   - Valor: la URL del webhook.
3. Push a `main` → el workflow `Deploy a la VPS` corre y:
   - job **Verificar imagen Docker**: construye la imagen y verifica que `GET /`
     devuelva el HTML y que las rutas de assets (`/css/...`, `/js/nucleo/...`,
     `/js/modulos/...`) respondan `200`;
   - job **Desplegar en EasyPanel**: `POST` al webhook (con reintentos).

También se puede ejecutar a mano desde **Actions → Deploy a la VPS → Run workflow**.

## Notas

- El pipeline **no** commitea ni toca `openspec/` ni la documentación. El plan del
  TP Global vive en `GLOBAL-CHANGE.md`.
- Si el push solo cambia documentación, el deploy igual corre. Para evitarlo se
  puede agregar `paths-ignore: ['**.md', 'openspec/**']` al `on.push`.
- El healthcheck (`wget --spider`) permite que EasyPanel/Docker reinicie el
  contenedor si nginx deja de responder.
