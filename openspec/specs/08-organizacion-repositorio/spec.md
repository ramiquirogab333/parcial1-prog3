# 08-organizacion-repositorio Specification

## Purpose
Define la organización de archivos del repositorio de la librería —carpetas de estilos, de scripts y de documentación—, los archivos que deben permanecer en la raíz por requisito de la infraestructura, la preservación del orden de carga de los scripts y de la cadena CSS, la verificación de los assets en el pipeline de despliegue y la inmutabilidad del archivo histórico de especificaciones.

## Requirements

### Requirement: Carpetas de estilos, de scripts y de documentación

El repositorio SHALL organizar los assets de la aplicación en carpetas según su rol. Las hojas de estilo MUST vivir en el directorio `css/` (`css/style.css` y `css/tema.css`) y MUST NOT quedar en la raíz del repositorio. Los scripts MUST vivir en el directorio `js/`, separados en `js/nucleo/` para los scripts transversales (`data.js`, `storage.js`, `navegacion.js`) y `js/modulos/` para los scripts de cada módulo de negocio (`catalogo.js`, `libros.js`, `clientes.js`, `ventas.js`, `historial.js`, `tema.js`). La guía de despliegue MUST vivir en `docs/DEPLOY.md`.

#### Scenario: Estilos agrupados en la carpeta de estilos

- **WHEN** se listan los archivos del directorio `css/` del repositorio
- **THEN** están `style.css` y `tema.css`, y el repositorio no tiene ninguna hoja de estilo en su raíz

#### Scenario: Scripts separados por rol

- **WHEN** se listan los archivos de `js/nucleo/` y de `js/modulos/`
- **THEN** `js/nucleo/` contiene `data.js`, `storage.js` y `navegacion.js`, y `js/modulos/` contiene `catalogo.js`, `libros.js`, `clientes.js`, `ventas.js`, `historial.js` y `tema.js`

#### Scenario: Documentación de despliegue agrupada

- **WHEN** se busca la guía de despliegue en el repositorio
- **THEN** está en `docs/DEPLOY.md` y no queda una copia en la raíz

### Requirement: Archivos que permanecen en la raíz

El repositorio SHALL mantener en su raíz los archivos que la infraestructura y el tooling necesitan en esa ubicación: `index.html`, `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore` y `.gitattributes`, además de `README.md`, `AGENTS.md` y `CLAUDE.md`. El servidor web MUST NOT requerir que `index.html` se ubique en otro directorio, porque su raíz de publicación y la regla de reescritura de URLs apuntan a la raíz del sitio. La reorganización MUST NOT exigir modificaciones en `Dockerfile`, `nginx.conf` ni `docker-compose.yml`.

#### Scenario: Documento principal en la raíz

- **WHEN** se abre la raíz del repositorio publicado por el servidor web
- **THEN** `index.html` está en la raíz y el servidor lo sirve como documento inicial

#### Scenario: Infraestructura sin tocar

- **WHEN** se compara la imagen publicada antes y después de la reorganización
- **THEN** `Dockerfile`, `nginx.conf` y `docker-compose.yml` son idénticos y la imagen sigue sirviendo el sitio completo

### Requirement: Orden de carga de scripts preservado

El documento principal SHALL cargar los scripts del final del `body` en un orden que MUST preservar la semántica de dependencias: `js/nucleo/data.js`, `js/modulos/catalogo.js`, `js/nucleo/navegacion.js`, `js/modulos/libros.js`, `js/modulos/clientes.js`, `js/modulos/ventas.js`, `js/modulos/historial.js` y, en último lugar, `js/nucleo/storage.js`. El script de datos MUST preceder al de catálogo, y el de persistencia MUST ser el último porque redibuja los módulos ya inicializados. El script del tema MUST seguir cargándose de forma bloqueante en el `<head>` para evitar el parpadeo del primer pintado. Los scripts MUST NOT llevar `type="module"`, `async` ni `defer`, y el documento MUST NOT agregar `<base href>` ni scripts en línea.

#### Scenario: Orden de las etiquetas script

- **WHEN** se inspeccionan las etiquetas `<script>` del documento principal
- **THEN** las del final del `body` son, en ese orden, `js/nucleo/data.js`, `js/modulos/catalogo.js`, `js/nucleo/navegacion.js`, `js/modulos/libros.js`, `js/modulos/clientes.js`, `js/modulos/ventas.js`, `js/modulos/historial.js` y `js/nucleo/storage.js`, sin `type="module"` ni atributos `async` o `defer`

#### Scenario: El script de tema sigue bloqueando el primer pintado

- **WHEN** se inspecciona el `<head>` del documento principal
- **THEN** contiene `<script src="js/modulos/tema.js"></script>` sin `defer`, y no hay `<base href>` ni scripts en línea

#### Scenario: Los datos preceden al catálogo

- **WHEN** se inspecciona el orden de las etiquetas `<script>` del final del `body`
- **THEN** `js/nucleo/data.js` aparece antes que `js/modulos/catalogo.js`

### Requirement: Cadena de hojas de estilo preservada

El documento principal SHALL cargar `css/style.css` antes que `css/tema.css`, porque la hoja del tema declara reglas que usan variables definidas únicamente en la hoja principal y MUST sobrescribirlas. Ninguna de las dos hojas MUST usar `@import` ni `url()` hacia archivos locales.

#### Scenario: Orden de las etiquetas link

- **WHEN** se inspeccionan las etiquetas `<link rel="stylesheet">` del documento principal
- **THEN** la primera es `css/style.css` y la segunda es `css/tema.css`

#### Scenario: Sin importaciones entre hojas

- **WHEN** se buscan `@import` y `url(` en las dos hojas de estilo
- **THEN** no hay ninguna coincidencia

### Requirement: Verificación de los assets en el pipeline

El pipeline de despliegue MUST verificar, además de que el sitio raíz responde, que cada asset referenciado por el documento principal responde con código HTTP exitoso. La verificación MUST cubrir las dos hojas de estilo y los nueve scripts de la aplicación. El pipeline MUST conservar la comprobación de que la respuesta raíz contiene el texto identificador del sitio. Ante cualquier asset inaccesible, el pipeline MUST emitir un error de anotación y MUST terminar con código de salida distinto de cero.

#### Scenario: Todos los assets responden

- **WHEN** se ejecuta el pipeline sobre un commit con la estructura reorganizada
- **THEN** el sitio raíz responde con el texto esperado y cada una de las once rutas de asset responde con código HTTP 200

#### Scenario: Un asset con ruta incorrecta

- **WHEN** una de las rutas de asset del documento principal no resuelve en el contenedor
- **THEN** el pipeline emite una anotación `::error::` con la ruta fallida y termina con código de salida distinto de cero

#### Scenario: El sitio raíz sigue verificándose

- **WHEN** se inspecciona el paso de verificación del pipeline
- **THEN** conserva la comprobación de que la respuesta raíz contiene el texto identificador del sitio

### Requirement: Documentación excluida de la imagen publicada

El archivo de exclusión del contexto de construcción MUST excluir los archivos Markdown de cualquier nivel de directorio, no sólo los de la raíz. Así, la carpeta de documentación MUST NOT quedar publicada ni accesible en el sitio.

#### Scenario: Los Markdown del subdirectorio quedan fuera

- **WHEN** se construye la imagen con la carpeta `docs/` presente en el contexto
- **THEN** el archivo de exclusión de Docker contiene el patrón `**/*.md` y la documentación de la carpeta `docs/` no está en la imagen final

### Requirement: Archivo de exclusión de Git en la raíz

El repositorio SHALL contar con un archivo de exclusión de Git en su raíz, que MUST cubrir los archivos temporales del sistema operativo y las carpetas de los editores de código usados por el equipo. El archivo MUST NOT excluir ningún archivo que forme parte de la aplicación publicada.

#### Scenario: Artefactos temporales ignorados

- **WHEN** se consulta el estado de Git con un archivo `.DS_Store` o `Thumbs.db` presente
- **THEN** Git no lo lista como cambio no rastreado

#### Scenario: La aplicación no queda fuera del seguimiento

- **WHEN** se consulta el estado de Git tras la reorganización
- **THEN** los archivos de `css/`, `js/` y `docs/` aparecen como modificados o agregados, nunca como ignorados

### Requirement: El archivo histórico de especificaciones es inmutable

Los cambios ya archivados en `openspec/changes/archive/` MUST NOT reescribirse: son el registro congelado de decisiones tomadas. La reorganización del repositorio MUST NOT alterar su contenido, y las Specifications de referencia activas MUST actualizarse únicamente mediante el mecanismo de sincronización del flujo de trabajo.

#### Scenario: El archivo histórico no cambia

- **WHEN** se compara el contenido de `openspec/changes/archive/` antes y después de la reorganización
- **THEN** no hay diferencias en ninguno de los cambios archivados

#### Scenario: Las especificaciones activas no se editan a mano

- **WHEN** se revisa el diff del cambio de reorganización
- **THEN** los archivos bajo `openspec/specs/` no están modificados por la implementación y sólo se actualizan mediante la sincronización posterior
