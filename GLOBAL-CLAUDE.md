# GLOBAL-CLAUDE.md — Instrucciones para Claude (TP Global · Grupo 11)

> **Este archivo es para el TP Global de Programación III. Se llama `GLOBAL-CLAUDE.md` a propósito para no chocar con el `CLAUDE.md` del Parcial 1.**
> El `CLAUDE.md` actual del repo es una plantilla genérica de prompts del Parcial 1. **No la borres y no la pises con este archivo**: dejá este como `GLOBAL-CLAUDE.md` y agregá al inicio del `CLAUDE.md` viejo una nota que diga "Para el Global, leer `GLOBAL-CLAUDE.md`, `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`".
>
> **Cambio de regla importante:** el `AGENTS.md` viejo del Parcial 1 prohíbe `fetch` y las APIs. **Eso ya no aplica.** El objetivo del Global es conectar el front con la API. Si ves esa prohibición, ignorala para este TP.

---

## 1. Contexto

- **Materia:** Programación III (UTN).
- **Proyecto:** Librería de barrio.
- **Frontend:** `parcial1-prog3` — HTML, CSS y JavaScript nativos. Ya tiene las 5 vistas, CSS, catálogo, altas, ventas, historial y tema.
- **Backend:** `parcial2-prog3` — FastAPI + SQLModel + PostgreSQL. **Ya está completo y desplegado.** No se toca.
- **Problema actual:** el front funciona 100% con `localStorage`; no hace `fetch`. Hay que conectarlo a la API.
- **URLs:**
  - Front: https://libreria.francogagliardi.me
  - API: https://libros.francogagliardi.me
  - Swagger: https://libros.francogagliardi.me/docs

---

## 2. Antes de escribir una sola línea

1. Leé **`GLOBAL-AGENTS.md`** y **`GLOBAL-CHANGE.md`** (están en el escritorio o en la raíz del repo).
2. Corré:
   ```bash
   git status
   git pull --rebase origin main
   git log --oneline -5
   ```
3. Identificá el **paso** que te toca.
4. Revisá los archivos que ese paso permite tocar.
5. **Entrá en modo plan.** Mostrá:
   - Archivos exactos que vas a modificar.
   - Qué vas a hacer en cada uno.
   - Cómo lo vas a probar.
6. **Esperá la confirmación del humano antes de editar.**

**Prompt de arranque que puede usar el humano:**

> "Estoy en el repo `parcial1-prog3`. Leé `GLOBAL-CLAUDE.md`, `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`. Me toca el **Paso N — [nombre]**. Trabajamos directo sobre `main`, sin ramas. Corré `git status` y `git pull --rebase origin main`, decime en qué estado está el repo y proponeme un plan con los archivos exactos. No edites nada hasta que te confirme."

---

## 3. Reglas que no se negocian

### Git

- **Se trabaja directo sobre `main`, sin ramas.** No crees ramas. Un paso a la vez.
- **No pushees ni commitees** hasta que el humano lo pida.
- **No uses `git add .`.** Agregá solo los archivos del paso.
- **No commitees** `.env`, `.venv`, `__pycache__`, `node_modules`, `Grupo11.zip`, tokens ni credenciales.
- **No reformatees** archivos enteros ni cambies código ajeno al paso.
- **Conflictos:** `git pull --rebase origin main`, nunca `git push --force`.
- **No empieces si hay cambios sin commitear de otro paso.** El repo debe estar limpio y actualizado.

### Código

- **No agregues** React, Vue, Angular, jQuery, Tailwind, Bootstrap, npm, Vite, Webpack, TypeScript ni CDNs.
- **No agregues dependencias** de ningún tipo.
- **No cambies IDs, clases ni la estructura del DOM** que usan los módulos existentes.
- **No uses `innerHTML`** con datos del usuario o de la API. Usá `textContent`, `document.createElement` y `new Option`.
- **No modifiques el backend.** Si encontrás un bug, reportalo.
- **No toques archivos de otro paso.** Si lo necesitás, pará y avisá.
- **No toques `openspec/specs/` a mano.**
- **No corras `python -m app.seed`** contra la base de producción.
- **No expongas secretos** en logs, capturas ni commits.

### Estilo

- JavaScript nativo, sin módulos ES ni bundler.
- IIFE con `"use strict"`.
- `var` y funciones declaradas, como el código existente.
- Nombres y textos de interfaz **en español**.
- Comentarios en español, explicando el “por qué”.
- Mantené la indentación y el formato del archivo.

---

## 4. Paso asignado y archivos permitidos

| Paso | Responsable | Archivos |
| --- | --- | --- |
| 0 | Franco | `Dockerfile`, `default.conf.template`, `nginx.conf`, `docker-compose.yml`, `docs/DEPLOY.md`, EasyPanel |
| 1 | Ramiro | `js/nucleo/api.js` (nuevo), `js/nucleo/data.js`, `js/nucleo/storage.js` (eliminar), `index.html`, `.github/workflows/deploy.yml` |
| 2 | Ciro | `js/modulos/catalogo.js`, `index.html` (Catálogo) |
| 3 | Emmanuel | `js/modulos/historial.js`, `index.html` (Historial) |
| 4 | Ignacio | `js/modulos/libros.js`, `index.html` (Libros), `css/style.css` (solo si hace falta) |
| 5 | Santiago | `js/modulos/clientes.js` |
| 6 | Ramiro | `js/modulos/ventas.js` |
| 7 | Santiago | `README.md`, `.github/workflows/deploy.yml`, `evidence/` |
| 9 | Santiago | `public/favicon.svg` (nuevo), `public/index.html`, `.github/workflows/deploy.yml`, `README.md` |
| 8 | Franco | VPS, EasyPanel, `docs/DEPLOY.md`, evidencia final |

**Si tu paso no está en la tabla, no toques nada.**

---

## 5. Orden secuencial

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

- El paso N+1 arranca después del push del paso N.
- Antes de arrancar: `git pull --rebase origin main`.
- No adelantes trabajo que toque archivos de otro paso.

---

## 6. La API en 30 segundos

- Base: **`/api`** (same-origin, a través de nginx). **No hay CORS.**
- Rutas con barra final: `/libros/`, `/ventas/`, `/clientes/`, `/editoriales/`.
- IDs numéricos en la API; el front los normaliza a string para el DOM y usa `Number()` al enviar.
- Decimales como string (`"25000.00"`); `Number()` para mostrar. Los importes finales los calcula el servidor.
- Errores: `{"detail": "texto"}` o `{"detail": [{...}]}`. Formatear a un mensaje legible.

**Endpoints:**

```
GET  /api/health/live
GET  /api/health/ready
GET  /api/editoriales/?limit=100&offset=0
GET  /api/generos/
GET  /api/autores/?limit=100&offset=0
GET  /api/libros/?limit=20&offset=0&titulo=...
GET  /api/libros/{id}
POST /api/libros/
GET  /api/clientes/?limit=100&offset=0
GET  /api/clientes/{id}
POST /api/clientes/
GET  /api/ventas/?limit=20&offset=0
GET  /api/ventas/{id}
POST /api/ventas/
```

**Cuerpos exactos:**

```json
// POST /api/libros/
{
  "isbn": "978-950-00-0006-6",
  "titulo": "Los que aman, odian",
  "precio": "21000.00",
  "stock": 4,
  "editorial_id": 1,
  "genero_id": 1,
  "autores": [{ "autor_id": 3, "rol": "coautor", "orden": 1 }]
}
```

```json
// POST /api/clientes/
{ "nombre": "Tomás Ríos", "email": "tomas@example.com" }
```

```json
// POST /api/ventas/
{
  "cliente_id": 2,
  "renglones": [
    { "libro_id": 1, "cantidad": 2 },
    { "libro_id": 4, "cantidad": 1 }
  ]
}
```

En la venta **no viajan precio, total ni fecha**.

---

## 7. Cómo probar

### Backend local

```bash
cd parcial2-prog3
docker run -d --name libreria-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=libreria \
  postgres:16-alpine

# .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/libreria
SQL_ECHO=false

python -m venv .venv
# activar
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

### Front con proxy

```bash
cd parcial1-prog3
docker build -t libreria-frontend .
docker run --rm -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=host.docker.internal:8000 \
  libreria-frontend
```

### Verificación

```bash
curl -i http://localhost:8080/api/health/ready
curl -s http://localhost:8080/api/libros/
```

Abrí `http://localhost:8080` y probá el flujo del paso.

**Si no podés levantar el backend, decilo.** Probá al menos que la página no tire errores de JS y que los estados de error se vean. No afirmes que funciona sin evidencia.

---

## 8. Qué hacer si…

| Situación | Acción |
| --- | --- |
| No entendés el paso | Preguntá. No inventes. |
| Necesitás tocar un archivo de otro paso | Pará y avisá. |
| Hay conflicto | `git rebase origin/main`; resolvé solo tus archivos. |
| El backend devuelve un error | Copiá `status` y `detail`; no parchees el backend. |
| `API_UPSTREAM` no está configurado | No es tu paso; avisá a Franco. |
| Datos viejos en el navegador | Borrar `localStorage` (`libreria.*`) y recargar. |
| El workflow falla por un asset | Revisar la lista de assets del workflow (Paso 1/7). |
| No podés probar en línea | Probá local y aclaralo. |

---

## 9. Definition of Done

- [ ] El cambio se limita a los archivos del paso.
- [ ] `git diff` no incluye archivos ajenos ni basura.
- [ ] La app carga sin errores de consola.
- [ ] El flujo del paso funciona contra la API (o está justificado por qué no se pudo probar).
- [ ] Se respetaron IDs, clases, estilo y prohibiciones.
- [ ] El commit (si el humano lo pide) dice `feat(global-paso-N): ...`.
- [ ] El reporte final incluye qué se hizo, archivos, pruebas y pendientes.

---

## 10. Formato de respuesta final

```markdown
## Paso N — [nombre]

### Qué hice
- ...

### Archivos tocados
- `ruta` — qué cambió

### Cómo lo probé
- Comandos / pasos / resultados

### Qué falta o qué no pude probar
- ...

### Riesgos
- ...
```

No digas “listo” sin haber probado. No inventes resultados.
