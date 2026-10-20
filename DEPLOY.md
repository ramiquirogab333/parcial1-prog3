# Despliegue (Docker + EasyPanel + GitHub Actions)

Guía de infraestructura. No modifica el código de la app: la imagen solo sirve
los archivos estáticos con nginx (sin build, sin npm, sin backend).

## Archivos

| Archivo | Para qué |
| ----- | ----- |
| `Dockerfile` | Imagen del sitio: nginx alpine + los archivos estáticos. |
| `nginx.conf` | Gzip, cabeceras de seguridad, caché `no-cache` y `try_files`. |
| `.dockerignore` | Deja fuera del contexto `.git`, `.github`, `openspec`, `*.md`, etc. |
| `docker-compose.yml` | Prueba local en `http://localhost:8080`. |
| `.github/workflows/deploy.yml` | En cada push a `main`: construye la imagen, la prueba y dispara el deploy en EasyPanel. |

## Probar en local

```bash
docker compose up -d --build
# http://localhost:8080
docker compose logs -f
docker compose down
```

## 1. Crear la app en EasyPanel (una sola vez)

1. **Create Service → App**.
2. Source: **GitHub** → repositorio `parcial1-prog3`, branch `main`.
3. Build: **Dockerfile**, build path `/`, Dockerfile `Dockerfile`.
4. **Port interno: 80** (EasyPanel rutea el dominio a ese puerto).
5. Domain: agregar el dominio y activar HTTPS (Let's Encrypt) desde EasyPanel.
6. Deploy una vez a mano para confirmar que construye.

> Si en lugar de App usás **Docker Compose**, quitá el bloque `ports:` de
> `docker-compose.yml` para no chocar con otros proyectos del VPS: EasyPanel se
> encarga de la red y del ruteo al puerto 80 del servicio.

## 2. Conectar GitHub Actions

1. En EasyPanel, dentro de la app: pestaña **Deploy** → copiar la URL del
   **Deploy Webhook** (incluye token, tratarla como secreto).
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
   - Nombre: `EASYPANEL_DEPLOY_WEBHOOK`
   - Valor: la URL del webhook.
3. Push a `main` → el workflow `Deploy a la VPS` corre y:
   - job **Verificar imagen Docker**: construye la imagen y verifica que `GET /`
     devuelva el HTML;
   - job **Desplegar en EasyPanel**: `POST` al webhook (con reintentos).

También se puede ejecutar a mano desde **Actions → Deploy a la VPS → Run workflow**.

## Notas

- El pipeline **no** commitea ni toca `openspec/`; el flujo SDD (propose → apply →
  archive) sigue siendo el único camino para cambiar código de los módulos M01–M06.
- Si el push solo cambia documentación, el deploy igual corre. Para evitarlo se
  puede agregar `paths-ignore: ['**.md', 'openspec/**']` al `on.push`.
- El healthcheck (`wget --spider`) permite que EasyPanel/Docker reinicie el
  contenedor si nginx deja de responder.
