# 02-estilos-responsivos Specification

## Purpose

Define la capa visual del frontend de la librería: un sistema de tokens de diseño, una arquitectura de tema claro/oscuro reasignable sin duplicar selectores, una estética de tarjetas al estilo iOS, un layout adaptable entre 320 px y 1280 px, tablas con desplazamiento interno y estados de foco y mensajería accesibles.

## Requirements

### Requirement: Sistema de tokens de diseño centralizado

La hoja de estilos SHALL declarar en `:root` un conjunto de custom properties que actúe como única fuente de verdad de la identidad visual, organizado en cuatro categorías: color, elevación y bordes, tipografía y espaciado. Ningún componente MUST declarar un color, radio, sombra, familia tipográfica o valor de espaciado literal cuando exista un token equivalente.

Los tokens de color SHALL incluir al menos: primario borravino `--color-primary: #411016`, una variante de interacción `--color-primary-hover`, fondo principal neutro cálido `--color-bg-main`, superficie de tarjetas `--color-surface`, texto principal `--color-text-main` y texto atenuado `--color-text-muted`, más los necesarios para bordes y estados de éxito y error.

Los tokens de forma SHALL incluir `--radius-sm: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1.25rem`, `--shadow-flat` y `--shadow-elevated`, y estas dos últimas MUST usar `rgba` de baja opacidad para producir sombras suaves y MUST expresar sus desplazamientos y desenfoques en `rem`, con los valores `0 0.0625rem 0.125rem`, `0 0.125rem 0.5rem` y `0 0.5rem 1.5rem`. Los tokens tipográficos SHALL incluir `--font-stack` con la pila del sistema Apple y los de espaciado una escala modular `--space-xs: 0.25rem`, `--space-sm: 0.5rem`, `--space-md: 1rem`, `--space-lg: 1.5rem` y `--space-xl: 2.5rem`.

#### Scenario: Tokens disponibles en el documento

- **WHEN** se inspeccionan las custom properties computadas sobre el elemento raíz
- **THEN** existen todos los tokens de color, forma, tipografía y espaciado declarados por la capability

#### Scenario: Consumo de tokens en lugar de valores literales

- **WHEN** se revisa la declaración de color de fondo, color de texto, radio, sombra y espaciado de un componente
- **THEN** cada propiedad referencia un token de `:root` y no un valor literal duplicado

#### Scenario: Sombras suaves de baja opacidad

- **WHEN** se inspecciona el valor de `--shadow-flat` y de `--shadow-elevated`
- **THEN** ambas usan `rgba` con opacidad baja y producen una elevación perceptible pero sutil

### Requirement: Unidades relativas con `px` reservado a los trazos

La hoja de estilos SHALL expresar en `rem` los radios, las sombras, la escala de espaciado, el `font-size` base del documento (`1rem`), la altura mínima de los controles (`2.75rem`), el ancho del contenedor compartido (`73.75rem`), el ancho mínimo de las columnas de formulario (`13.75rem`), el ancho mínimo de `.tabla-datos` (`38.75rem`), el radio de desenfoque de `backdrop-filter` (`blur(1rem)`) y el desplazamiento de la elevación de tarjeta (`translateY(-0.125rem)`).

La hoja MUST NOT declarar en `px` ninguna de esas propiedades. Los `px` SHALL reservarse exclusivamente a los grosores de trazo —bordes de `1px`, borde de acento de `3px`— y al anillo de foco `outline: 2px` con `outline-offset: 2px`, porque expresados en `rem` esos grosores se redondean a subpíxeles y degradan el anillo de foco y las líneas de 1 px. Los anchos de viewport de 320 px y 1280 px que aparecen en los escenarios de verificación son referencias de prueba del navegador y no declaraciones de la hoja.

#### Scenario: Sin `px` fuera de los grosores de trazo

- **WHEN** se inspeccionan las declaraciones de la hoja de estilos
- **THEN** los únicos valores en `px` son grosores de borde, el borde de acento y el anillo de foco con su offset

#### Scenario: Los espaciados escalan con el tamaño de letra raíz

- **WHEN** se cambia el `font-size` del elemento raíz de `1rem` a `20px`
- **THEN** los espaciados, radios, alturas de control y anchos de contenedor crecen en la misma proporción sin romper el layout

#### Scenario: Valores equivalentes con raíz de 16 px

- **WHEN** se inspeccionan los valores computados con el `font-size` raíz por defecto
- **THEN** los radios resuelven 8 px, 12 px y 20 px y la escala de espaciado resuelve 4 px, 8 px, 16 px, 24 px y 40 px

### Requirement: Ritmo vertical diferenciado entre vistas y tarjetas

La hoja SHALL separar las cinco `<section class="vista">` dentro de `#main-principal` con `gap: var(--space-xl)` (2.5rem) y SHALL separar las tarjetas dentro de cada `.vista` con `gap: var(--space-lg)` (1.5rem). La separación entre vistas MUST ser mayor que la separación entre tarjetas y MUST declararse en una regla propia, porque una única regla compartida no puede expresar dos ritmos verticales distintos.

#### Scenario: Hueco entre secciones consecutivas

- **WHEN** se mide el hueco vertical entre dos `<section class="vista">` consecutivas con la raíz en 16 px
- **THEN** el hueco es de al menos 2.5rem (40 px)

#### Scenario: Gap interno de las tarjetas

- **WHEN** se mide la separación entre dos tarjetas hermanas dentro de una misma `.vista`
- **THEN** el hueco es de 1.5rem (24 px) y es menor que el hueco entre secciones

#### Scenario: Reglas de gap independientes

- **WHEN** se inspecciona la hoja de estilos
- **THEN** `#main-principal` y `.vista` declaran su `gap` en reglas separadas

### Requirement: Reset base universal

La hoja de estilos SHALL aplicar un reset que fije `box-sizing: border-box`, `margin: 0` y `padding: 0` a todos los elementos del documento, de modo que el dimensionado sea predecible y no dependa de los estilos por defecto del navegador.

#### Scenario: Dimensionado predecible

- **WHEN** se inspecciona cualquier elemento del documento
- **THEN** su `box-sizing` computado es `border-box` y no arrastra márgenes ni rellenos por defecto que alteren el layout

### Requirement: Arquitectura híbrida de tema claro y oscuro

La hoja de estilos SHALL declarar los colores claros por defecto en `:root`, SHALL reasignar únicamente variables de color dentro de `@media (prefers-color-scheme: dark)` y SHALL ofrecer overrides manuales mediante `:root.dark-mode` y `:root.light-mode` (o los selectores de atributo equivalentes `[data-theme="dark"]` y `[data-theme="light"]`), de modo que una capa de JavaScript futura pueda imponer el tema.

La regla de tema MUST ser exclusivamente de reasignación de variables sobre el elemento raíz: ningún componente MUST duplicar sus selectores para cambiar colores según el tema. Los overrides manuales MUST prevalecer sobre la preferencia del sistema operativo, tanto en tema oscuro forzado sobre un sistema claro como en tema claro forzado sobre un sistema oscuro.

#### Scenario: Tema oscuro por preferencia del sistema

- **WHEN** el sistema operativo informa preferencia por tema oscuro y no hay override manual aplicado
- **THEN** la interfaz usa los valores oscuros de los tokens de color y conserva el resto de la identidad visual

#### Scenario: Override manual gana a la preferencia del sistema

- **WHEN** el sistema prefiere tema oscuro y la raíz recibe la clase o el atributo de tema claro
- **THEN** la interfaz se muestra en tema claro, porque el override manual prevalece sobre el `@media`

#### Scenario: Sin duplicación de selectores por tema

- **WHEN** se recorre la hoja de estilos buscando selectores de componentes dentro de los bloques de tema
- **THEN** los bloques de tema sólo contienen declaraciones de custom properties y ningún selector de componente repetido

#### Scenario: Preparado para un control de tema futuro

- **WHEN** se agrega la clase o el atributo de tema oscuro a la raíz desde la consola del navegador, sin recargar
- **THEN** la interfaz cambia a tema oscuro sin modificar el markup de las vistas

### Requirement: Identidad visual de tarjetas al estilo iOS

La hoja de estilos SHALL dar a las tarjetas esquinas redondeadas, superficies diferenciadas del fondo, sombras sutiles de elevación y microinteracciones consistentes. Las microinteracciones SHALL usar transiciones sobre `transform`, `box-shadow` y `background`, y MUST respetar la preferencia de movimiento reducido cuando el sistema la declare.

Las superficies translúcidas SHALL usar `backdrop-filter: blur(...)` y MUST incluir un color de fondo de respaldo opaco para los navegadores que no soportan el filtro, de modo que el contenido siga siendo legible.

#### Scenario: Tarjeta con elevación y radio

- **WHEN** se inspecciona visualmente una tarjeta de cualquiera de las cinco vistas
- **THEN** muestra esquinas redondeadas, superficie propia y una sombra suave que la separa del fondo

#### Scenario: Fallback sin soporte de desenfoque

- **WHEN** el navegador no aplica `backdrop-filter`
- **THEN** la superficie conserva un fondo de respaldo legible y el contenido no queda transparente sobre el fondo

#### Scenario: Movimiento reducido respetado

- **WHEN** el sistema operativo declara preferencia por movimiento reducido
- **THEN** las transiciones y animaciones decorativas se desactivan o se reducen sin perder información visual

### Requirement: Layout adaptable sin desplazamiento horizontal global

La hoja de estilos SHALL construir el layout con Flexbox para alineaciones en una dimensión y con CSS Grid para las estructuras bidimensionales de las vistas. El documento MUST NOT generar desplazamiento horizontal global en anchos de 320 px ni de 1280 px.

Los formularios SHALL apilarse en una columna en anchos reducidos y aprovechar el ancho disponible en anchos amplios, y los textos y controles MUST conservar legibilidad y áreas de toque utilizables en ambos extremos.

#### Scenario: Sin desplazamiento horizontal a 320 px

- **WHEN** la página se visualiza a 320 px de ancho
- **THEN** no aparece barra de desplazamiento horizontal en la página y todos los controles son alcanzables y utilizables

#### Scenario: Sin desplazamiento horizontal a 1280 px

- **WHEN** la página se visualiza a 1280 px de ancho
- **THEN** no aparece barra de desplazamiento horizontal y el contenido se distribuye sin dejar columnas ilegibles ni controles desproporcionados

#### Scenario: Distribución con Grid y Flexbox

- **WHEN** se inspecciona el layout de las vistas y de sus formularios
- **THEN** las alineaciones en una dimensión usan Flexbox y las estructuras bidimensionales usan CSS Grid, sin tablas de maquetación ni posicionamiento absoluto para armar la página

### Requirement: Tablas con desplazamiento interno

Cada contenedor de tabla de datos SHALL permitir el desplazamiento horizontal interno mediante `overflow-x: auto` y SHALL habilitar el desplazamiento táctil fluido con `-webkit-overflow-scrolling: touch`. La tabla MUST desbordar únicamente dentro de su contenedor y MUST NOT provocar desplazamiento horizontal en la página.

Las tablas SHALL mantener encabezados legibles y MUST NOT definir anchos fijos que impidan el ajuste en 320 px.

#### Scenario: Tabla desbordada dentro de su contenedor

- **WHEN** el contenido de una tabla supera el ancho disponible a 320 px
- **THEN** la tabla se desplaza horizontalmente dentro de su propio contenedor y la página permanece sin desplazamiento horizontal

#### Scenario: Desplazamiento táctil en móvil

- **WHEN** se arrastra horizontalmente sobre una tabla desbordada en un dispositivo táctil
- **THEN** el desplazamiento ocurre dentro del contenedor de la tabla con inercia táctil

#### Scenario: Encabezados legibles

- **WHEN** se visualiza cualquier tabla de datos en ambos anchos de referencia
- **THEN** los encabezados de columna se leen completos y no quedan superpuestos con las celdas

### Requirement: Foco visible y operabilidad por teclado

Todo elemento interactivo de la hoja de estilos SHALL mostrar un indicador de foco visible cuando recibe foco por teclado, con `outline: 2px solid var(--color-primary)` y `outline-offset: 2px`, sin depender del estilo por defecto del navegador y sin eliminar el contorno en ningún caso.

El foco MUST ser perceptible en tema claro y en tema oscuro, y el orden de tabulación MUST conservar el orden visual del documento.

#### Scenario: Foco visible en enlaces y botones

- **WHEN** se recorre la página con la tecla de tabulación
- **THEN** cada enlace de navegación y cada botón muestra un contorno visible de 2 px separado del elemento

#### Scenario: Foco visible en campos y selectores

- **WHEN** el foco por teclado llega a un campo de texto, un selector o el campo de búsqueda
- **THEN** el control muestra el contorno visible definido por la hoja y mantiene su legibilidad

#### Scenario: Foco perceptible en ambos temas

- **WHEN** se repite el recorrido por teclado con el tema claro y con el tema oscuro
- **THEN** el contorno de foco contrasta con el fondo en ambos casos

#### Scenario: Ningún control pierde el foco visible

- **WHEN** se busca `outline: none` o `outline: 0` sin reemplazo accesible en la hoja de estilos
- **THEN** no existe ninguna regla que elimine el indicador de foco de un control interactivo

### Requirement: Legibilidad de mensajes de estado y contraste

La hoja de estilos SHALL diferenciar visualmente los mensajes informativos de los mensajes de error, conservando siempre el texto como portador del significado. Los mensajes de error SHALL usar un color de estado con contraste suficiente sobre la superficie de la tarjeta en tema claro y en tema oscuro, y MUST NOT depender sólo del color para comunicar la condición.

Los estados vacíos, de búsqueda sin resultados, de error y de confirmación SHALL ser legibles y distinguibles entre sí en ambos temas.

#### Scenario: Error distinguible sin depender del color

- **WHEN** se muestra un mensaje de error en cualquier vista
- **THEN** el mensaje conserva su texto completo y se distingue visualmente del texto informativo por algo más que el color

#### Scenario: Contraste suficiente en ambos temas

- **WHEN** se comparan el color de texto y el fondo de una tarjeta con mensaje en tema claro y en tema oscuro
- **THEN** la relación de contraste permite leer el mensaje sin esfuerzo en ambos casos

#### Scenario: Mensajes vacíos no alteran el layout

- **WHEN** un contenedor de mensaje no tiene contenido
- **THEN** no introduce un espacio visible que rompa la separación entre tarjetas ni el flujo de la vista

### Requirement: Iconografía sin recursos externos

La hoja de estilos SHALL expresar cualquier icono mediante símbolos Unicode nativos o formas construidas con CSS. MUST NOT incorporar fuentes de íconos, imágenes remotas, sprites externos ni referencias a CDNs.

#### Scenario: Sin fuentes de íconos ni imágenes externas

- **WHEN** se inspeccionan las declaraciones `url(...)`, `@font-face` y `@import` de la hoja de estilos
- **THEN** ninguna referencia apunta a un origen externo ni carga una familia de íconos

#### Scenario: Iconos resueltos con el propio lenguaje del documento

- **WHEN** la interfaz necesita un indicador visual
- **THEN** se resuelve con un carácter Unicode presente en la pila tipográfica o con una forma CSS, sin descargar recursos

### Requirement: Restricciones técnicas de la capa de estilos

La hoja de estilos MUST ser un archivo CSS nativo único ubicado en la raíz del proyecto, MUST NOT usar frameworks, librerías, preprocesadores ni herramientas de build, y MUST NOT realizar peticiones de red. La capa de estilos MUST NOT depender de JavaScript para funcionar y MUST NOT requerir cambios en el markup ni en las clases publicadas por M01.

#### Scenario: CSS nativo sin dependencias

- **WHEN** se inspecciona el archivo de estilos
- **THEN** es CSS estándar sin `@import` de frameworks, sin variables de preprocesador y sin utilidades de build

#### Scenario: Estilos aplicados sin JavaScript

- **WHEN** la página se abre con JavaScript deshabilitado
- **THEN** la identidad visual, el layout adaptable y el desplazamiento interno de tablas funcionan igual

#### Scenario: Markup de M01 intacto

- **WHEN** se compara el documento con el entregado por M01
- **THEN** las cinco vistas, los `id` del contrato y todas las clases BEM se conservan sin renombrar ni eliminar

### Requirement: Verificación visual de CP-08 en los anchos de referencia

La capa de estilos SHALL permitir verificar el caso de prueba CP-08 en anchos de 320 px y 1280 px: navegación completa por teclado con foco visible, controles utilizables y tablas con desplazamiento contenido en su propio contenedor.

#### Scenario: Recorrido por teclado a 320 px

- **WHEN** se recorre la página sólo con teclado a 320 px de ancho
- **THEN** se alcanzan todos los controles en orden visual, cada uno muestra foco visible y la página no se desplaza horizontalmente

#### Scenario: Recorrido por teclado a 1280 px

- **WHEN** se recorre la página sólo con teclado a 1280 px de ancho
- **THEN** se alcanzan todos los controles en orden visual, cada uno muestra foco visible y el layout se mantiene estable

#### Scenario: Tabla contenida en ambos anchos

- **WHEN** se observa cada tabla de datos a 320 px y a 1280 px
- **THEN** el desplazamiento horizontal, si existe, ocurre sólo dentro del contenedor de la tabla y nunca en la página

