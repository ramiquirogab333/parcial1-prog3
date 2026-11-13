# GLOBAL-LEEME.md — Cómo usar los archivos del TP Global

> **Este archivo es el primero que hay que leer.** Los demás se llaman `GLOBAL-...` a propósito para no chocar con los archivos del Parcial 1 que ya están en el repo (`AGENTS.md`, `CLAUDE.md`, `CHANGE.md`).
>
> **Estructura final del repo:** el sitio vive en `public/` (`index.html`, `css/`, `js/`). El `Dockerfile` copia `public/`. Las rutas de los pasos en `GLOBAL-CHANGE.md` son históricas.

## 1. Qué hay en esta carpeta

| Archivo | Para qué | Quién lo lee |
| --- | --- | --- |
| **GLOBAL-LEEME.md** | Esta guía de uso. | Todos. |
| **GLOBAL-CHANGE.md** | Plan completo del TPI: 9 pasos, responsables, archivos, contrato de API, pruebas y checklist. | Todos. |
| **GLOBAL-AGENTS.md** | Reglas para agentes de IA (Cursor, Copilot, Codex, etc.). | La IA de cada compañero. |
| **GLOBAL-CLAUDE.md** | Reglas específicas para Claude / Claude Code. | Claude. |

## 2. Orden de lectura

1. `GLOBAL-LEEME.md` (este archivo).
2. `GLOBAL-CHANGE.md` (el plan).
3. `GLOBAL-AGENTS.md` o `GLOBAL-CLAUDE.md` (según la IA que uses).

## 3. Cómo pasárselos a la IA

**Opción A (recomendada):** copiá `GLOBAL-CHANGE.md`, `GLOBAL-AGENTS.md` y `GLOBAL-CLAUDE.md` a la **raíz del repo** `parcial1-prog3`. No reemplazan los archivos del Parcial 1: conviven con nombres distintos.

**Opción B:** pasalos como contexto en el chat, adjuntando los archivos.

Después, usá este prompt cambiando el número y el nombre:

> “Estoy en el repo `parcial1-prog3`. Leé `GLOBAL-AGENTS.md` (o `GLOBAL-CLAUDE.md`) y `GLOBAL-CHANGE.md`. Me toca el **Paso N — [nombre]**. Antes de tocar nada: corré `git status`, `git pull --rebase origin main`, decime en qué estado está el repo y proponeme un plan con los archivos exactos que vas a modificar. Esperá mi confirmación antes de editar.”

## 4. Advertencia importante sobre los archivos viejos

El repo tiene un `AGENTS.md` del **Parcial 1** que dice:

> “SIN Peticiones de Red o APIs: Prohibido el uso de `fetch()`…”

**Eso era para el Parcial 1 y ya no aplica.** En el TP Global, el objetivo es justamente conectar el front con la API.

Para que la IA no se confunda:

- **No borres** el `AGENTS.md` viejo.
- **No lo pises** con `GLOBAL-AGENTS.md`.
- Agregá al inicio del `AGENTS.md` viejo una nota como esta:

  > “Para el TP Global, leer `GLOBAL-AGENTS.md` y `GLOBAL-CHANGE.md`. La prohibición de `fetch` del Parcial 1 queda sin efecto.”

- Hacé lo mismo con el `CLAUDE.md` viejo, apuntando a `GLOBAL-CLAUDE.md`.

Así, si la IA lee el archivo viejo, encuentra la redirección y no rechaza la integración.

## 5. Regla de oro para todos

- Un paso = un commit/push directo a `main`. **Sin ramas.**
- El paso N+1 arranca después del push del paso N.
- No se trabaja en paralelo: dos personas no tocan el repo a la vez.
- Nadie toca archivos de otro paso.
- Si hay dudas, se pregunta antes de escribir código.

## 6. Reparto rápido

| Paso | Responsable | Qué hace |
| --- | --- | --- |
| 0 | Franco | Proxy `/api`, Dockerfile, EasyPanel, `API_UPSTREAM` |
| 1 | Ramiro | Fundación API + quitar `localStorage` |
| 2 | Ciro | Catálogo (E1) |
| 3 | Emmanuel | Historial (E3 lectura) |
| 4 | Ignacio | Alta de libros (E2) |
| 5 | Santiago | Alta de clientes (E2) |
| 6 | Ramiro | Ventas (E3 escritura) |
| 7 | Santiago | README, workflow del front y QA |
| 8 | Franco | Deploy final, evidencia y demo |

**Orden:** `0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8`.
