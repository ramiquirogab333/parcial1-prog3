# Tasks

## 1. Estructura de carpetas y movimientos con `git mv`

- [x] 1.1 Crear las carpetas `css/`, `js/nucleo/`, `js/modulos/` y `docs/`, y mover `style.css` y `tema.css` a `css/` con `git mv` — verificar con `git status` que Git registra los dos archivos como renames y no como borrados
- [x] 1.2 Mover con `git mv` los scripts transversales a `js/nucleo/`: `data.js`, `storage.js`, `navegacion.js` — verificar con `git status` que aparecen como renames bajo `js/nucleo/`
- [x] 1.3 Mover con `git mv` los scripts de módulo a `js/modulos/`: `catalogo.js`, `libros.js`, `clientes.js`, `ventas.js`, `historial.js`, `tema.js` — verificar con `git status` que aparecen como renames bajo `js/modulos/`
- [x] 1.4 Mover `DEPLOY.md` a `docs/DEPLOY.md` con `git mv` — verificar que el archivo conserva su contenido y que no queda copia en la raíz
- [x] 1.5 Confirmar que siguen en la raíz `index.html`, `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore` y `.gitattributes`, y que `openspec/` y `.opencode/` no se tocaron — verificar con `git status` que ninguno de esos paths figura como movido o modificado

## 2. Rutas de carga en `index.html`

- [x] 2.1 Actualizar las dos etiquetas `<link>` del `<head>` a `css/style.css` y `css/tema.css`, conservando ese orden — verificar con `grep` que ambas rutas aparecen y que `css/style.css` precede a `css/tema.css`
- [x] 2.2 Actualizar el `<script>` del `<head>` a `js/modulos/tema.js` **sin `defer`** ni `async` — verificar con `grep` que la etiqueta no lleva atributos de carga diferida
- [x] 2.3 Actualizar los ocho `<script>` del final del `<body>` a `js/nucleo/data.js`, `js/modulos/catalogo.js`, `js/nucleo/navegacion.js`, `js/modulos/libros.js`, `js/modulos/clientes.js`, `js/modulos/ventas.js`, `js/modulos/historial.js`, `js/nucleo/storage.js`, **en ese orden exacto** — verificar comparando la secuencia de las etiquetas `<script>` del documento con la lista esperada
- [x] 2.4 Verificar que no se agregó `type="module"`, `async`, `defer`, `<base href>` ni scripts en línea, y que las 11 rutas referenciadas existen en el disco — verificar con `grep` sobre `index.html` y listando los archivos

## 3. Comentarios que citan rutas

- [x] 3.1 Actualizar los comentarios de `index.html` que describen las rutas: el bloque de hojas de estilo (≈ línea 8), el bloque de scripts (≈ línea 379) y el de `storage.js` (≈ línea 387) — verificar que cada comentario menciona la ruta o carpeta correcta
- [x] 3.2 Actualizar los comentarios de `css/tema.css` (≈ líneas 4 y 7) que mencionan `style.css` y `js/tema.js` — verificar con `grep` que ya no citan las rutas viejas
- [x] 3.3 Actualizar el comentario de `js/modulos/tema.js` (≈ línea 8) que menciona `style.css` y `tema.css` — verificar con `grep` que ya no citan las rutas viejas
- [x] 3.4 Barrido general: confirmar que no queda ninguna referencia a `js/data.js`, `js/catalogo.js`, `js/navegacion.js`, `js/libros.js`, `js/clientes.js`, `js/ventas.js`, `js/historial.js`, `js/storage.js`, `js/tema.js`, `style.css` ni `tema.css` como rutas en código o comentarios — verificar con `grep` recursivo excluyendo `openspec/changes/archive/` y `openspec/changes/reorganizacion-estructura-repo/`

## 4. `README.md`

- [x] 4.1 Reescribir el árbol de directorios (líneas 32-50) con la estructura nueva: `css/`, `js/nucleo/`, `js/modulos/`, `docs/`, más los archivos de infraestructura que siguen en la raíz — verificar que el árbol refleja lo que hay realmente en el disco
- [x] 4.2 Actualizar las referencias sueltas a rutas: línea 23 (`DEPLOY.md` → `docs/DEPLOY.md`) y líneas 53, 94, 116, 135, 159 — verificar con `grep` que no queda ninguna mención a las rutas viejas
- [x] 4.3 Actualizar las referencias de la sección de trazabilidad (líneas 438 y 440) sin alterar el contenido de los archivos históricos — verificar con `grep` que las rutas de `openspec/` no cambiaron
- [x] 4.4 Registrar en el `README.md` la evidencia de la verificación funcional de este change (resultado del arnés de navegador del grupo 9) — verificar que el apartado nuevo describe lo realmente observado

## 5. `AGENTS.md`

- [x] 5.1 Actualizar la columna «Archivos Principales» de la tabla de módulos (líneas 36-41) con las rutas nuevas: `css/style.css`, `js/nucleo/data.js`, `js/modulos/catalogo.js`, `js/modulos/libros.js`, `js/modulos/clientes.js`, `js/modulos/ventas.js`, `js/modulos/historial.js`, `js/nucleo/storage.js`, `js/modulos/tema.js` — verificar con `grep` que la tabla no cita rutas viejas
- [x] 5.2 Actualizar los «Archivos:» de la matriz de requisitos por ejercicio (líneas 49, 59, 70, 80, 89, 99) — verificar que cada entrada apunta al archivo real tras la reorganización
- [x] 5.3 Actualizar la tabla de orden de trabajo (líneas 197-202): la fila de M02 ya decía `css/*.css` y ahora es cierto; corregir las rutas de `js/` de M03 a M06 — verificar que la tabla es consistente con el árbol del `README.md`
- [x] 5.4 Revisar que la tabla de capabilities de la sección 6 siga siendo válida: este change **no** crea una capability por módulo — verificar que no se inventó una capability `08` asociada a un módulo del equipo

## 6. `docs/DEPLOY.md`

- [x] 6.1 Actualizar la tabla de archivos de infraestructura (líneas 10-14) — los archivos de infraestructura **no** se mueven: sólo cambia el lugar del documento y la forma de nombrarlos — verificar que `Dockerfile`, `nginx.conf`, `.dockerignore` y `docker-compose.yml` se siguen describiendo como archivos de la raíz
- [x] 6.2 Actualizar las referencias de rutas de las líneas 29 y 35 (build path / Dockerfile path / `docker-compose.yml`) — verificar que siguen siendo relativas a la raíz del repositorio, porque así lo exige EasyPanel

## 7. Smoke test del CI

- [x] 7.1 Ampliar el paso «Smoke test» de `.github/workflows/deploy.yml` para verificar con `curl -fsS` las 11 rutas de asset: `/css/style.css`, `/css/tema.css`, `/js/nucleo/data.js`, `/js/modulos/catalogo.js`, `/js/nucleo/navegacion.js`, `/js/modulos/libros.js`, `/js/modulos/clientes.js`, `/js/modulos/ventas.js`, `/js/modulos/historial.js`, `/js/nucleo/storage.js`, `/js/modulos/tema.js` — verificar levantando la imagen localmente y confirmando que las 11 responden 200
- [x] 7.2 Hacer que cada asset inaccesible emita `::error::` con la ruta fallida y termine el paso con `exit 1` — verificar simulando una ruta inexistente y confirmando que el job falla
- [x] 7.3 Conservar la comprobación actual `curl -fsS http://localhost:8080/ | grep -qi "librer"` dentro del bucle de espera del sitio raíz — verificar que la comprobación sigue en el workflow
- [x] 7.4 Verificar que la lista de assets del smoke test cubre **todas** las rutas `src`/`href` locales del documento principal, sin omisiones ni duplicados — verificar comparando ambas listas

## 8. `.dockerignore` y `.gitignore`

- [x] 8.1 Cambiar `*.md` por `**/*.md` en `.dockerignore` para que los Markdown de cualquier subdirectorio queden fuera de la imagen — verificar construyendo la imagen y confirmando que `docs/DEPLOY.md` **no** está en ella ni se sirve en `/docs/DEPLOY.md`
- [x] 8.2 Crear `.gitignore` en la raíz con el conjunto mínimo: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `*.log` — verificar que el archivo existe en la raíz
- [x] 8.3 Confirmar que el `.gitignore` no excluye ningún archivo de la aplicación — verificar con `git status --ignored` que ningún archivo de `css/`, `js/` o `docs/` aparece como ignorado

## 9. Verificación de integración

- [x] 9.1 Revisar `git status` completo: no debe haber borrados accidentales ni archivos sin trackear de origen — verificar con `git status` y `git diff --stat`
- [x] 9.2 Confirmar que el historial se preservó en el movimiento — verificar con `git log --follow` sobre `css/style.css` y `js/nucleo/data.js` que llegan a sus commits originales
- [x] 9.3 Barrido final de referencias viejas (ver tarea 3.4) más `openspec/specs/`, `openspec/changes/archive/` y `.opencode/` — verificar que no quedan referencias fuera de las delta specs de este change
- [x] 9.4 Verificación funcional en navegador con Chrome headless por DevTools Protocol, con el arnés fuera del repositorio (copia en una carpeta temporal): catálogo renderiza, buscador filtra, las 5 vistas navegan, el tema cambia, los formularios validan, el historial muestra la venta y los datos sobreviven una recarga — verificar con 0 errores de consola
- [x] 9.5 Registrar el resultado del punto 9.4 en el `README.md` como evidencia (ver tarea 4.4) — verificar que el apartado existe con lo realmente observado
- [x] 9.6 Ejecutar `openspec validate --all` y confirmarlo en verde — verificar que el comando termina sin errores
- [x] 9.7 Commitear con Conventional Commits en español, en commits chicos y frecuentes por grupo de tareas (por ejemplo `refactor(repo): mover los assets a carpetas por rol`, `ci: verificar los assets en el smoke test del deploy`) — verificar con `git log --oneline` que los commits quedan legibles y que el árbol de trabajo queda limpio
