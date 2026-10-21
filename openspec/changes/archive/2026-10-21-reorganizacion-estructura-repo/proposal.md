# Proposal

## Why

El repositorio mixes la aplicación con la infraestructura y la documentación en la
misma raíz: 9 archivos JavaScript y 2 hojas de estilo conviven con `Dockerfile`,
`nginx.conf`, `docker-compose.yml` y los documentos de despliegue. Además, `AGENTS.md`
promete una carpeta `css/*.css` que nunca existió, y el único verificador automático
del proyecto —el smoke test del CI— sólo comprueba `GET /`, sin validar que los
assets respondan: un error de rutas pasa el CI en verde y recién se descubre en el
navegador.

Esta reorganización agrupa los assets en carpetas cohesionadas (`css/`, `js/nucleo/`,
`js/modulos/`, `docs/`) sin tocar una sola línea de comportamiento, y cierra el hueco
de verificación que permite que un error de rutas pase inadvertido.

## What Changes

- `style.css` y `tema.css` se mueven a `css/`. `DEPLOY.md` se mueve a `docs/`.
- Los 9 scripts se mueven a `js/nucleo/` (`data.js`, `storage.js`, `navegacion.js`) y
  `js/modulos/` (`catalogo.js`, `libros.js`, `clientes.js`, `ventas.js`, `historial.js`,
  `tema.js`), según su rol: núcleo transversal vs. módulo de negocio.
- `index.html` actualiza sus 11 rutas de carga (2 `<link>` + 9 `<script>`) **preservando
  el orden exacto** y dejando `js/modulos/tema.js` como script bloqueante en el `<head>`
  (anti-FOUC). No se agrega `defer`, `type="module"`, `<base href>` ni scripts inline.
- Se actualizan los comentarios que citan rutas (`index.html`, `tema.css`, `tema.js`) y
  la documentación afectada: `README.md` (árbol de directorios y referencias sueltas),
  `AGENTS.md` (tabla de módulos por archivo) y `docs/DEPLOY.md`.
- El smoke test de `.github/workflows/deploy.yml` se amplía para verificar que **cada
  asset** referenciado por `index.html` responda 200, con `::error::` y `exit 1` ante
  cualquier fallo.
- `.dockerignore` cambia `*.md` por `**/*.md`, para que `docs/` no quede publicado en
  la imagen. Se crea un `.gitignore` mínimo en la raíz.

**No hay cambios de comportamiento, de funcionalidad, de UI, de persistencia ni de
modelo de datos.** Es un cambio puramente estructural más una mejora de la verificación.

## Capabilities

### New Capabilities
- `08-organizacion-repositorio`: organización de archivos del repositorio (carpetas de
  assets y de documentación), archivos que deben permanecer en la raíz, preservación del
  orden de carga de scripts, verificación de assets en el smoke test del CI y
  inmutabilidad de `openspec/changes/archive/`.

### Modified Capabilities
- `02-estilos-responsivos`: la capa de estilos deja de exigir una hoja CSS "única
  ubicada en la raíz del proyecto" y pasa a vivir en el directorio `css/`.
- `03-modelo-datos-catalogo`: las rutas de los tres scripts de M03 y el orden de carga
  pasan de `js/data.js`, `js/catalogo.js`, `js/navegacion.js` a
  `js/nucleo/data.js`, `js/modulos/catalogo.js`, `js/nucleo/navegacion.js`.
- `04-formularios-altas`: las rutas de los dos scripts de M04 y su orden pasan de
  `js/libros.js`, `js/clientes.js` a `js/modulos/libros.js`, `js/modulos/clientes.js`.
- `07-tema-claro-oscuro`: la ruta de `style.css` pasa a `css/style.css`.

Las capabilities `01-estructura-html`, `05-ventas-e-historial` y
`06-persistencia-y-pruebas` se auditaron y **no** nombran rutas concretas de archivos,
por lo que no requieren delta spec: sus requisitos siguen siendo válidos sin cambios.

## Impact

- **Archivos movidos (13):** `style.css`, `tema.css`, `DEPLOY.md`, `js/data.js`,
  `js/storage.js`, `js/navegacion.js`, `js/catalogo.js`, `js/libros.js`,
  `js/clientes.js`, `js/ventas.js`, `js/historial.js`, `js/tema.js`.
- **Archivos editados (7):** `index.html`, `README.md`, `AGENTS.md`, `docs/DEPLOY.md`,
  `.dockerignore`, `.github/workflows/deploy.yml`, y los comentarios internos de
  `css/tema.css` y `js/modulos/tema.js`.
- **Archivo nuevo (1):** `.gitignore` en la raíz.
- **API pública:** sin cambios. Los namespaces `Datos`, `Catalogo`, `Navegacion`,
  `Libros`, `Clientes`, `Ventas`, `Historial`, `Almacenamiento` y `Tema` conservan sus
  nombres, su contenido y su semántica.
- **Persistencia:** sin cambios. Las tres claves de `localStorage` (`libreria.libros`,
  `libreria.clientes`, `libreria.ventas`) y `tema-preferido` no se tocan. Los datos ya
  guardados en el navegador siguen siendo válidos porque la reorganización no altera
  el esquema de datos.
- **Despliegue:** no se modifica `Dockerfile`, `nginx.conf` ni `docker-compose.yml`.
  `COPY . .` y `try_files $uri $uri/ /index.html` siguen funcionando con subdirectorios
  nuevos, siempre que `index.html` permanezca en la raíz.
- **Dependencias:** ninguna nueva. Se siguen sin frameworks, sin CDN, sin build tools y
  sin peticiones de red.

## Fuera de alcance

- Cualquier cambio de comportamiento, de interfaz, de modelo de datos o de
  persistencia.
- Mover `index.html`, `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore`,
  `.gitattributes`, `openspec/` o `.opencode/`.
- Reescribir los `.md` de `openspec/changes/archive/` (registro histórico congelado).
- Agregar un test runner, un gestor de paquetes o una cadena de build: el proyecto los
  prohíbe y este change no los necesita.
- Mover `README.md`, `AGENTS.md` o `CLAUDE.md` de la raíz.
- Cambiar la cadena CSS (`style.css` antes que `tema.css`) o el orden de los scripts.
