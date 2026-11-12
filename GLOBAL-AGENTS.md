# GLOBAL-AGENTS.md — Guía para agentes de IA (TP Global · Grupo 11)

> **Este archivo es para el TP Global de Programación III. Se llama `GLOBAL-AGENTS.md` a propósito para no chocar con el `AGENTS.md` del Parcial 1.**
> Reemplaza las reglas del `AGENTS.md` del Parcial 1 **solo en lo que respecta a la integración con la API**.
> El `AGENTS.md` viejo del repo dice "prohibido `fetch` / sin API": **eso era para el Parcial 1 y ya no aplica**. En el Global, el objetivo es justamente conectar el front con la API.
>
> **Importante:** si el repo ya tiene un `AGENTS.md` del Parcial 1, **no lo borres y no lo pises con este archivo**. Dejá este como `GLOBAL-AGENTS.md` y agregá al inicio del `AGENTS.md` viejo una nota que diga: "Para el TP Global, leer `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`; la prohibición de `fetch` queda sin efecto". Si la IA lee el `AGENTS.md` viejo, esa nota la redirige al correcto.

---

## 1. Qué es este proyecto

- **Materia:** Programación III (UTN).
- **Proyecto:** Librería de barrio.
- **Dos repositorios:**
  - `parcial1-prog3` → **frontend** (HTML, CSS y JavaScript nativos, sin frameworks).
  - `parcial2-prog3` → **backend** (FastAPI + SQLModel + PostgreSQL, ya completo y desplegado).
- **Objetivo del Global:** conectar el frontend con la API del backend y desplegarlo en EasyPanel.
- **URLs:**
  - Front: https://libreria.francogagliardi.me
  - API: https://libros.francogagliardi.me
  - Swagger: https://libros.francogagliardi.me/docs

**El backend no se modifica.** Todo el trabajo es en `parcial1-prog3`.

---

## 2. Cómo empezar (prompt para el humano)

Cuando el humano te pase la carpeta del repo, pedile que te diga **qué paso** le toca. Después:

1. Leé `GLOBAL-AGENTS.md` (este archivo) y `GLOBAL-CHANGE.md`.
2. Corré:
   ```bash
   git status
   git pull --rebase origin main
   git log --oneline -5
   ```
3. Identificá el paso asignado en `GLOBAL-CHANGE.md`.
4. Revisá los archivos que ese paso permite tocar.
5. **No edites nada todavía.** Proponé un plan con:
   - Archivos exactos que vas a modificar.
   - Qué vas a hacer en cada uno.
   - Cómo lo vas a probar.
6. Esperá la confirmación del humano.
7. No crees ramas: verificá que estás en `main` (`git branch --show-current`). Si no, `git checkout main`.
8. Implementá, probá y mostrá el diff.
9. No hagas `git push` ni `git commit` hasta que el humano lo pida.

**Prompt sugerido para el humano:**

> "Estoy en el repo `parcial1-prog3`. Leé `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`. Me toca el **Paso N — [nombre]**. Antes de tocar nada: corré `git status`, `git pull --rebase origin main`, decime en qué estado está el repo y proponeme un plan con los archivos exactos que vas a modificar. Esperá mi confirmación antes de editar."

---

## 3. Reglas duras (no negociables)

### Git

1. **Se trabaja directo sobre `main`, sin ramas.** Un paso a la vez.
2. **No commitear ni pushear sin que el humano lo pida.**
3. **No usar `git add .`.** Agregar solo los archivos del paso.
4. **No commitear** `.env`, `.venv`, `__pycache__`, `node_modules`, `Grupo11.zip`, tokens ni credenciales.
5. **No reformatear archivos enteros.** Diff chico y revisable.
6. **Ante conflicto:** `git pull --rebase origin main`; resolvé y volvé a pushear. Nunca uses `git push --force`.
7. **No tocar archivos de otro paso.** Si necesitás un cambio ahí, pará y avisá.
8. **No empieces si el repo tiene cambios sin commitear de otro paso.** El repo debe estar limpio y actualizado.

### Código

8. **No agregar frameworks, librerías, CDNs, npm, bundlers ni TypeScript.** El front es HTML/CSS/JS nativo.
9. **No cambiar los IDs, clases ni la estructura del DOM** que usan los módulos existentes.
10. **No usar `innerHTML` con datos del usuario o de la API.** Usar `textContent`, `document.createElement` y `new Option`.
11. **No cambiar el contrato de la API.** Si encontrás un bug del backend, reportalo; no lo parchees desde el front.
12. **No borrar ni mover archivos** fuera de lo que pide el paso.
13. **No tocar `openspec/specs/` a mano.** Si el equipo usa OpenSpec, cada paso puede ser un change; si no, alcanza con el commit directo.
14. **No ejecutar `python -m app.seed` contra la base de producción.** Si necesitás datos, usá la base local.
15. **No exponer secretos** en logs, capturas, commits ni documentación.

### Comportamiento

16. **Si el paso es ambiguo, preguntá.** No inventes requisitos.
17. **Si el cambio se sale del alcance del paso, no lo hagas.** Describilo como propuesta.
18. **Si no podés probar algo, decilo.** No afirmes que funciona sin evidencia.
19. **Mantené el estilo existente:** `var`, IIFE, `"use strict"`, funciones con nombres en español, comentarios en español.
20. **Respondé en español** y explicá qué archivos tocaste y cómo lo probaste.

---

## 4. División de pasos y propiedad de archivos

| Paso | Responsable | Archivos que puede tocar |
| --- | --- | --- |
| 0 | Franco | `Dockerfile`, `default.conf.template`, `nginx.conf`, `docker-compose.yml`, `docs/DEPLOY.md`, EasyPanel |
| 1 | Ramiro | `js/nucleo/api.js` (nuevo), `js/nucleo/data.js`, `js/nucleo/storage.js` (eliminar), `index.html`, `.github/workflows/deploy.yml` |
| 2 | Ciro | `js/modulos/catalogo.js`, `index.html` (sección Catálogo) |
| 3 | Emmanuel | `js/modulos/historial.js`, `index.html` (sección Historial) |
| 4 | Ignacio | `js/modulos/libros.js`, `index.html` (sección Libros), `css/style.css` (solo si hace falta) |
| 5 | Santiago | `js/modulos/clientes.js` |
| 6 | Ramiro | `js/modulos/ventas.js` |
| 7 | Santiago | `README.md`, `.github/workflows/deploy.yml`, `evidence/` |
| 8 | Franco | VPS, EasyPanel, `docs/DEPLOY.md`, evidencia final |

**Regla:** si tu paso no está en esta tabla, **no toques nada**. Preguntá.

---

## 5. Orden de trabajo (secuencial)

```
Paso 0 (Franco, infra)
  → Paso 1 (Ramiro, fundación)
    → Paso 2 (Ciro, catálogo)
      → Paso 3 (Emmanuel, historial)
        → Paso 4 (Ignacio, libros)
          → Paso 5 (Santiago, clientes)
            → Paso 6 (Ramiro, ventas)
              → Paso 7 (Santiago, docs/QA)
                → Paso 8 (Franco, deploy final)
```

- El paso N+1 arranca **después** del push del paso N.
- Antes de arrancar: `git pull --rebase origin main`.
- Si el humano te pide adelantar trabajo, verificá que no toque archivos de otro paso; si los toca, esperá.

---

## 6. Contexto técnico que tenés que entender

### El front hoy

- `index.html` tiene 5 vistas: Catálogo, Libros, Clientes, Ventas e Historial.
- `js/nucleo/data.js` tiene semillas locales.
- `js/nucleo/storage.js` guarda todo en `localStorage` y **se elimina en el Paso 1**.
- `js/modulos/*.js` renderizan y validan; hoy **no hacen `fetch`**.
- `css/style.css` y `css/tema.css` ya están listos.
- `js/modulos/tema.js` usa `localStorage` solo para el tema claro/oscuro: **eso se mantiene**.

### La API

- Base pública del front: **`/api`** (same-origin, a través de nginx).
- No hay CORS: **no llames directo a `https://libros.francogagliardi.me` desde el navegador**.
- Rutas con barra final: `/libros/`, `/ventas/`, `/clientes/`, `/editoriales/`.
- IDs numéricos en la API; el front los normaliza a string para el DOM y los convierte con `Number()` al enviar.
- Decimales como string (`"25000.00"`): usar `Number()` para mostrar; para cuentas de dinero, usar el valor del servidor.
- Errores: `{"detail": "texto"}` o `{"detail": [{...}]}`. Mostrar un mensaje legible.

### Endpoints que vas a usar

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
  "autores": [
    { "autor_id": 3, "rol": "coautor", "orden": 1 }
  ]
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

**En la venta no viajan precio, total ni fecha.** Los calcula el servidor.

---

## 7. Estilo de código del proyecto

- JavaScript nativo, sin módulos ES ni bundler.
- Patrón IIFE con `"use strict"`.
- `var` y funciones declaradas (el código existente usa ese estilo).
- Nombres y textos de interfaz **en español**.
- Insertar datos con `textContent`, `document.createElement`, `new Option`.
- Comentarios claros, en español, explicando el “por qué”.
- No agregar dependencias.
- No cambiar la indentación ni el formato general del archivo.

---

## 8. Cómo probar antes de commitear

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

### Verificación mínima

```bash
curl -i http://localhost:8080/api/health/ready
curl -s http://localhost:8080/api/libros/
```

Abrir `http://localhost:8080` y probar el flujo del paso.

**Si no podés levantar el backend, probá al menos:**
- Que la página no tire errores de JavaScript.
- Que los estados de error se muestren.
- Que el diff no rompa IDs/clases existentes.

Y decilo explícitamente en el reporte.

---

## 9. Qué hacer si…

| Situación | Qué hacer |
| --- | --- |
| No entendés el paso | Preguntá; no inventes. |
| Necesitás tocar un archivo de otro paso | Pará y avisá; no lo edites. |
| Hay conflicto | `git pull --rebase origin main`; resolvé solo tus archivos; si es grande, pedí ayuda. |
| El backend devuelve un error raro | Copiá el `status` y el `detail`; no parchees el backend. |
| `API_UPSTREAM` no está configurado | No es tu paso; avisá a Franco. |
| El navegador muestra datos viejos | Borrar `localStorage` (`libreria.*`) y recargar. |
| El workflow falla por un asset | Revisar la lista de assets del workflow; es parte del Paso 1/7. |
| No podés probar en línea | Probá local y aclaralo; no afirmes que funciona. |

---

## 10. Definition of Done (para que el humano commitee)

- [ ] El cambio está limitado a los archivos del paso.
- [ ] `git diff` no incluye archivos ajenos ni basura.
- [ ] La app carga sin errores de consola.
- [ ] El flujo del paso funciona contra la API (o está justificado por qué no se pudo probar).
- [ ] Se respetaron IDs, clases, estilo y prohibiciones.
- [ ] El commit (si el humano lo pide) tiene un mensaje claro: `feat(global-paso-N): ...`.
- [ ] El reporte final incluye: qué se hizo, archivos tocados, cómo se probó, qué falta.

---

## 11. Formato de respuesta final

Cuando termines, respondé:

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
