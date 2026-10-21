# Design

## Context

Estado actual del repositorio (auditado exhaustivamente antes de redactar este
documento; los hallazgos están verificados sobre el código, no asumidos):

**Raíz.** `index.html`, `style.css`, `tema.css`, `README.md`, `AGENTS.md`, `CLAUDE.md`,
`DEPLOY.md`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.dockerignore`,
`.gitattributes`. Carpetas: `js/` con 9 archivos planos, `.github/workflows/deploy.yml`,
`.opencode/` (12 `.md` versionados + tooling del CLI) y `openspec/` (propiedad del CLI).

**Restricciones de `AGENTS.md` que condicionan el diseño.** Sin frameworks, sin
librerías, sin CDN, sin build tools ni gestores de paquetes, sin `fetch()`/APIs, sin
`innerHTML` con datos de usuario. Todo corre 100 % en el navegador. En particular, el
proyecto **no puede** adoptar un test runner ni una cadena de build para verificar el
cambio: la verificación tiene que apoyarse en las herramientas que ya existen.

**Scripts clásicos, no módulos.** Los 9 scripts son globales, sin `type="module"`, sin
`defer`. El orden de carga es **semánticamente significativo**, no cosmético:

- `js/data.js` DEBE preceder a `js/catalogo.js`. Si se invierte, `validarDatos()` lanza
  un `ReferenceError` que el propio catálogo captura, y la vista muestra el mensaje de
  «error de datos» en lugar de la tabla.
- `js/storage.js` DEBE ir último: al cargar redibuja los cinco módulos, que para entonces
  ya tienen que existir.
- `js/tema.js` DEBE seguir siendo bloqueante en el `<head>` (anti-FOUC). Si se moviera al
  final del `body`, la página aparecería un instante en el tema del sistema antes de aplicar
  el elegido, y volvería el parpadeo que M07 resolvió.

Orden exacto actual en `index.html`: `<head>` líneas 9, 11 y 12 (`style.css`,
`tema.css`, `js/tema.js`), y al final del `<body>` líneas 380-388 (`data.js`,
`catalogo.js`, `navegacion.js`, `libros.js`, `clientes.js`, `ventas.js`, `historial.js`,
`storage.js`). No hay scripts inline, ni `<base href>`, ni favicon, ni imágenes.

**Cadena CSS.** `tema.css` usa `var(--color-text-main)`, definida **sólo** en `style.css`,
y debe cargarse **después** para sobrescribir. `style.css` no depende de `tema.css`.
Cero `@import`, cero `url()` a archivos locales (sólo data URIs SVG), cero fuentes.

**El despliegue no depende de que los assets estén en la raíz.** `Dockerfile` usa
`COPY . .` (genérico) y `COPY --from=sitio /sitio/ /usr/share/nginx/html/`. `nginx.conf`
no declara `location` por tipo de asset ni globs: su único bloque es
`location / { try_files $uri $uri/ /index.html; }`. Por lo tanto, un subdirectorio nuevo
funciona sin tocar la infraestructura **siempre que** se respeten tres condiciones:

1. `index.html` queda en la raíz (lo exige `index index.html;` + `try_files`).
2. `Dockerfile` y `nginx.conf` quedan en la raíz (`COPY nginx.conf ...` y
   `RUN rm -f nginx.conf` son relativos al `WORKDIR`; `dockerfile: Dockerfile` es relativo
   a `context: .`).
3. La carpeta nueva no está excluida por `.dockerignore`.

**Archivos que no se pueden mover.** `index.html` (docroot de nginx + smoke test del CI
que hace `GET /`), `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore`
(Docker sólo lo lee desde la raíz del contexto de build), `openspec/` (propiedad del
CLI), `.opencode/` (tooling) y `.github/`.

**`.dockerignore` tiene `*.md`.** En Docker, el `*` no cruza `/`: ese patrón excluye
**sólo** los `.md` de la raíz. Si se crea `docs/`, sus `.md` entran a la imagen y quedan
públicos en `https://<host>/docs/...`. El arreglo es `**/*.md`.

**No existe `.gitignore` en la raíz.** No hay filtro para artefactos temporales ni para
carpetas de editor.

**No hay test runner en el repo.** Cero `package.json`, `playwright.config`, `vitest`,
`jest`, `pytest`, `Makefile`, `*.test.js` — y el proyecto los prohíbe. El único
verificador automático es el smoke test del CI, que hoy hace únicamente
`curl http://localhost:8080/ | grep -qi "librer"`: **no valida que los assets respondan
200**. Un error de rutas pasa el CI en verde y sólo falla en el navegador. Este change
debe cerrar ese hueco, porque la reorganización multiplica las rutas y con ella la
superficie de error.

**Specs vivas que nombran rutas concretas con MUST/SHALL.** No se editan a mano: van
como delta specs de este change y se aplican después con `/opsx-sync`:

| Capability | Ubicación | Qué nombra |
| --- | --- | --- |
| `02-estilos-responsivos` | `spec.md` ~231-248 | «un archivo CSS nativo **único ubicado en la raíz del proyecto**» |
| `03-modelo-datos-catalogo` | `spec.md` ~10, 57, 67, 118, 241 | `js/data.js`, `js/catalogo.js`, `js/navegacion.js` y el orden de carga |
| `04-formularios-altas` | `spec.md` ~127 | `js/libros.js`, `js/clientes.js` y su orden |
| `07-tema-claro-oscuro` | `spec.md` ~4, 29 | `style.css` |

`01-estructura-html`, `05-ventas-e-historial` y `06-persistencia-y-pruebas` se auditaron
y **no** nombran rutas de archivos: sus requisitos siguen siendo válidos sin cambios y
no requieren delta spec.

**Documentación a actualizar.** `README.md` líneas 32-50 (árbol de directorios literal) más
23, 53, 94, 116, 135, 159, 438, 440. `AGENTS.md` líneas 36-41, 49, 59, 70, 80, 89, 99,
197-202 (tabla de módulos por archivo). `DEPLOY.md` líneas 10-14, 29, 35. `CLAUDE.md` y
`openspec/config.yaml` no tienen referencias: no se tocan. Ojo: `AGENTS.md:198` ya
prometía `css/*.css` cuando hoy **no existe** carpeta `css/` — es una inconsistencia
preexistente que este change resuelve.

Los `.md` de `openspec/changes/archive/` son registros históricos congelados: **no se
reescriben**.

**`.opencode/` (12 `.md`) tiene cero referencias a rutas del proyecto.** No se toca.
`.gitattributes` tiene reglas por extensión (`.css`, `.js`, `.md`, `.html` → `eol=lf`), no
por ruta: se aplican solas a los archivos movidos, sin cambios.

## Goals / Non-Goals

**Goals:**

- Agrupar los assets en carpetas cohesivas (`css/`, `js/nucleo/`, `js/modulos/`,
  `docs/`) sin una sola línea de cambio de comportamiento.
- Preservar byte a byte el **orden de carga** de los scripts y el **orden de la cadena
  CSS**, que son contratos de ejecución y no preferencias estéticas.
- Cerrar el hueco de verificación: el pipeline debe comprobar que **cada** asset
  referenciado por el documento responde, no sólo que la raíz responde.
- Dejar el repositorio y la documentación internamente consistentes (la tabla de
  módulos de `AGENTS.md`, el árbol del `README.md`, el `.gitignore` que faltaba).
- Preservar el historial de Git de los archivos movidos (`git mv`, no borrar y recrear).

**Non-Goals:**

- Cualquier cambio de comportamiento, de UI, de modelo de datos o de persistencia. Los
  namespaces públicos (`Datos`, `Catalogo`, `Navegacion`, `Libros`, `Clientes`,
  `Ventas`, `Historial`, `Almacenamiento`, `Tema`) no se tocan.
- Introducir un test runner, un gestor de paquetes o una cadena de build: el proyecto
  los prohíbe y no hacen falta para verificar este change.
- Reorganizar `openspec/` o `.opencode/`.
- Reescribir el archivo histórico de `openspec/changes/archive/`.
- Mover `README.md`, `AGENTS.md` o `CLAUDE.md` de la raíz.

## Decisions

### 1. Estructura objetivo: `css/`, `js/nucleo/`, `js/modulos/`, `docs/`

```
parcial1-prog3/
├── index.html                       # RAÍZ — obligatorio (docroot nginx + smoke test CI)
├── README.md                        # RAÍZ — convención
├── AGENTS.md                        # RAÍZ — requerido por el tooling
├── CLAUDE.md                        # RAÍZ
├── Dockerfile                       # RAÍZ — `dockerfile:` relativo a `context: .`
├── docker-compose.yml               # RAÍZ
├── nginx.conf                       # RAÍZ — `COPY nginx.conf` + `RUN rm -f nginx.conf`
├── .dockerignore                    # RAÍZ — Docker sólo lo lee desde la raíz del contexto
├── .gitattributes                   # RAÍZ
├── .gitignore                       # NUEVO (raíz) — mínimo: .DS_Store, Thumbs.db, .vscode/, .idea/, *.log
├── css/
│   ├── style.css                    # movido desde la raíz
│   └── tema.css                     # movido desde la raíz
├── js/
│   ├── nucleo/
│   │   ├── data.js                  # M03 — semillas del modelo de datos
│   │   ├── storage.js               # M06 — persistencia localStorage
│   │   └── navegacion.js            # M03 — cambio de vista
│   └── modulos/
│       ├── catalogo.js              # M03 — render + buscador
│       ├── libros.js                # M04 — alta de libros
│       ├── clientes.js              # M04 — alta de clientes
│       ├── ventas.js                # M05 — ticket y confirmación
│       ├── historial.js             # M05 — historial
│       └── tema.js                  # M07 — tema claro/oscuro
├── docs/
│   └── DEPLOY.md                    # movido desde la raíz
├── openspec/                        # NO se toca
├── .opencode/                       # NO se toca
└── .github/workflows/deploy.yml     # NO se mueve (se EDITA el smoke test)
```

**Por qué dos carpetas de JS y no una.** `js/nucleo/` aloja lo que los demás módulos
consumen o de lo que dependen —el modelo de datos, la persistencia y la navegación— y
`js/modulos/` lo que es la implementación de una vista concreta. El corte no es
arbitrario: `data.js` publica el namespace `Datos` que consume el catálogo, `storage.js`
redibuja las cinco vistas y `navegacion.js` decide cuál se ve. La distinction refleja el
grafo de dependencias real, no la pertenencia a un ejercicio: `navegacion.js` es de M03
pero vive en `nucleo/` porque su API es transversal (`Navegacion.mostrarVista` la usan
otros módulos), igual que `tema.js` es de M07 pero su script vive en `modulos/` porque
es la implementación de una función de la interfaz.

**Por qué `css/` y no `styles/`.** `AGENTS.md:198` ya prometía `css/*.css`. La
reorganización alinea el repositorio con la documentación que el equipo ya maneja.

**Por qué `docs/` para `DEPLOY.md`.** Es el único documento de infraestructura que no
pertenece a la raíz de la aplicación, y `docs/` es la convención estándar para
documentación. `README.md`, `AGENTS.md` y `CLAUDE.md` se quedan en la raíz por
convención y por requisito del tooling.

### 2. Alternativas descartadas

**(A) Aplanar `js/` en subcarpetas por capability OpenSpec** (`m03-modelo-datos/`,
`m04-altas/`, `m05-ventas/`, `m06-persistencia/`, `m07-tema/`). **Descartada por
fragmentación excesiva**: cinco carpetas donde tres de ellas contendrían un único
archivo (`m03` tendría 2, `m07` tendría 1, y `m04`/`m05`/`m06` 2, 2 y 1). El árbol
resultante comunica una taxonomía de *ejercicios*, no de *roles*, y envejece mal: el
próximo módulo nuevo obligaría a elegir entre meterlo en una carpeta existente que no
corresponde o abrir una sexta carpeta. Además acopla la organización del código a la
nomenclatura de las specs, que es un artefacto del flujo de trabajo y no del producto.

**(B) Mover `index.html` a `app/`.** **Descartada por incompatibilidad con el
docroot y con el smoke test**: `nginx.conf` declara `root /usr/share/nginx/html` con
`index index.html;` y `try_files $uri $uri/ /index.html;`, de modo que el documento
tiene que estar en la raíz de la imagen. Además el CI hace `GET /` esperando el sitio,
y una app en un subdirectorio obligaría a `<base href>`, que a su vez rompería las
anclas `#vista-*` del nav (el `href` relativo se resolvería contra el `<base>`) y con
ello el intercambio de vistas por hash, que es un requisito de `03-modelo-datos-catalogo`.

### 3. Rutas resultantes en `index.html` — el orden se preserva exactamente

`<head>`:

```
css/style.css  →  css/tema.css  →  js/modulos/tema.js   (sigue siendo bloqueante)
```

Final del `<body>`:

```
js/nucleo/data.js  →  js/modulos/catalogo.js  →  js/nucleo/navegacion.js
→  js/modulos/libros.js  →  js/modulos/clientes.js  →  js/modulos/ventas.js
→  js/modulos/historial.js  →  js/nucleo/storage.js
```

Son 11 rutas: 2 `<link>` + 9 `<script>`. Ninguna gana `defer`, `async` ni
`type="module"`. No se agrega `<base href>` ni scripts inline.

### 4. Los archivos se mueven con `git mv`, no se borran y recrean

`git mv` conserva el historial: el archivo movido aparece como un *rename* y `git log
--follow` sigue siendo capaz de recorrer su historia. Borrar y recrear el mismo contenido
haría que Git lo interpretara como un archivo nuevo y el diff de un cambio puramente
estructural se llenaría de archivos eliminados y agregados, que es exactamente lo que
hace ruido en la revisión.

### 5. Ampliación del smoke test del CI

El paso actual es:

```bash
if curl -fsS http://localhost:8080/ | grep -qi "librer"; then
```

Se mantiene esa comprobación (es la que garantiza que el sitio raíz se sirve) y se le
agrega la verificación de los 11 assets. Por cada ruta:

```bash
for ruta in /css/style.css /css/tema.css /js/nucleo/data.js ... ; do
  if ! curl -fsS -o /dev/null "http://localhost:8080$ruta"; then
    echo "::error::El asset $ruta no responde"
    exit 1
  fi
done
```

`curl -fsS` falla con código distinto de cero ante un 404 y no imprime el cuerpo, así
que un asset roto se detecta por el código de salida del `if`. La anotación `::error::`
es la que GitHub Actions muestra como error real en la vista del workflow, y el `exit 1`
marca el job como fallido y bloquea el deploy.

**Por qué 11 assets y no "los que referencie el documento":** una lista explícita es
verificable a ojo, falla de forma determinista y no depende de parsear HTML en el runner.
El riesgo de que la lista se quede desactualizada se cubre con la tarea de verificación
por grep que exige que todo `src`/`href` del documento tenga su contraparte en el smoke
test.

### 6. `.dockerignore`: `*.md` → `**/*.md`

En el patrón de Docker, `*` no cruza el separador de directorios: `*.md` excluye
`README.md` pero **no** `docs/DEPLOY.md`. Como el `Dockerfile` hace `COPY . .` con todo
el contexto, ese archivo terminaría servido en `https://<host>/docs/DEPLOY.md`, que
expone la topología de la infraestructura. `**/*.md` excluye los Markdown de cualquier
nivel. El resto de las exclusiones (`openspec`, `.opencode`, `.github`, `.git`) se
mantienen: ya son correctas porque son directorios completos.

### 7. `.gitignore` mínimo en la raíz

No existe hoy. Se crea con lo mínimo que el equipo necesita en una máquina de
desarrollo con Windows + macOS/Linux + editores comunes: `.DS_Store`, `Thumbs.db`,
`.vscode/`, `.idea/`, `*.log`. Se **verifica** que no excluya ningún archivo de la
aplicación: `git status` debe seguir listando los archivos movidos.

### 8. Los comentarios que citan rutas también se actualizan

No son sólo las etiquetas: hay comentarios que describen la ruta y quedarían mintiendo.

- `index.html:8` — el comentario del bloque M02 ya anuncia `css/...` (dice «(css/...)»),
  por lo que pasa a ser exacto con la estructura nueva.
- `index.html:379` — el comentario del bloque de scripts anuncia `js/...`; se ajusta
  para que describa la separación `js/nucleo/` y `js/modulos/`.
- `index.html:387` — el comentario de `storage.js` explica por qué va último; se conserva
  el motivo y se actualiza la ruta.
- `tema.css:4` y `tema.css:7` — mencionan `style.css` y `js/tema.js`.
- `tema.js:8` — menciona `style.css` y `tema.css`.

### 9. Verificación en navegador, con el arnés fuera del repo

El proyecto no tiene test runner y no puede adoptarlo (lo prohíbe `AGENTS.md`), así que
la verificación funcional se hace como en M02 y M06: automatizando Chrome headless por
**DevTools Protocol** con un script Node sin dependencias, ejecutado sobre una **copia del
proyecto en una carpeta temporal** para no alterar el repositorio ni el `localStorage` del
navegador de desarrollo.

Se verifica que el catálogo renderiza, que el buscador filtra, que las cinco vistas
navegan, que el tema cambia, que los formularios validan, que el historial muestra la
venta y que los datos sobreviven una recarga. El resultado se registra en el `README.md`
como evidencia, tal como se hizo con los 8 casos de prueba.

### 10. Los delta specs, no la edición a mano de `openspec/specs/`

Las cuatro capabilities vivas que nombran rutas (`02`, `03`, `04`, `07`) reciben delta
specs en `changes/reorganizacion-estructura-repo/specs/`. `openspec/specs/` se actualiza
después con `/opsx-sync` (o `/opsx-archive`). El archivo de
`openspec/changes/archive/` no se toca: es el registro congelado de las decisiones ya
tomadas.

## Risks / Trade-offs

- **[Un asset con ruta mal escrita rompe la página en silencio, sin error de
  consola obvious]** → El smoke test del CI verifica las 11 rutas con `curl -fsS` y
  falla el pipeline. Es la mitigación principal y el motivo por el que la ampliación del
  CI es parte de este change y no un extra.
- **[El orden de carga se altera por accidente al reordenar las etiquetas]** → El
  orden exacto queda escrito en la delta spec de `08-organizacion-repositorio` y en la
  tarea de verificación que compara la secuencia de las etiquetas `<script>` del
  documento con la lista esperada.
- **[`tema.js` deja de ser bloqueante y vuelve el parpadeo del tema]** → La tarea de
  actualización de `index.html` exige explícitamente que siga en el `<head>` sin
  `defer`, y la verificación en navegador comprueba que el tema elegido se aplica antes
  del primer pintado.
- **[El `.dockerignore` cambia y algo deja de entrar en la imagen]** → Se verifica
  levantando la imagen y comprobando que el sitio y los 11 assets responden, y que
  `docs/DEPLOY.md` **no** está publicado.
- **[Un `git mv` deja el árbol en un estado intermedio si la tarea se corta]** → El
  trabajo se commitea en commits chicos y frecuentes (uno por paso verificable), de modo
  que el historial nunca queda a medio camino y `git status` es legible en todo momento.
- **[El smoke test se alarga y consume tiempo de CI]** → Doce `curl` contra un contenedor
  local son del orden de un segundo. El costo es despreciable frente al beneficio de
  detectar un asset roto antes del deploy.
- **[La reorganización ensucia el diff de revisión]** → `git mv` produce *renames*
 detectados por Git; el diff se lee como movimientos más unas pocas líneas de rutas.
- **[`AGENTS.md` y el `README.md` quedan desactualizados si se olvida actualizarlos]**
  → Son tareas obligatorias del checklist, y la verificación por grep exige que no
  quede ninguna referencia a las rutas viejas fuera del archivo histórico.

## Migration Plan

1. `git mv` de los 2 CSS a `css/` y de los 9 JS a `js/nucleo/` y `js/modulos/`.
2. `git mv DEPLOY.md docs/`.
3. Actualizar las 11 rutas de `index.html` y sus comentarios.
4. Actualizar los comentarios que citan rutas en `css/tema.css` y `js/modulos/tema.js`.
5. Actualizar `README.md`, `AGENTS.md` y `docs/DEPLOY.md`.
6. Ampliar el smoke test del CI y corregir `.dockerignore`.
7. Crear `.gitignore`.
8. Verificar: `git status` sin borrados accidentales, `git log --follow` de un archivo
   movido, grep de referencias viejas, validación en navegador y
   `openspec validate --all`.

**Rollback.** El cambio es reversible con un `git revert` del commit: los archivos
vuelven a sus rutas y las etiquetas de `index.html` se restauran. No hay migración de
datos ni de estado: `localStorage` guarda `libreria.libros`, `libreria.clientes`,
`libreria.ventas` y `tema-preferido`, y ninguna de esas claves depende de la
estructura de carpetas del repositorio, así que los datos de un usuario que ya usó la
aplicación siguen intactos tras la actualización. La caché del navegador puede servir
un `index.html` viejo durante un momento; `Cache-Control: no-cache` en `nginx.conf`
hace que nginx revalide siempre.
