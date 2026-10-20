# Spec Delta

## Purpose

Define el esqueleto HTML único del frontend de la librería: las cinco vistas navegables, la estructura semántica del documento, los controles etiquetados, los contenedores de mensajes de estado y los identificadores estables que consumen los módulos posteriores.

## ADDED Requirements

### Requirement: Navegación entre las cinco vistas

La página SHALL ofrecer navegación explícita hacia las cinco vistas de la aplicación: Catálogo, Libros, Clientes, Ventas e Historial. Cada vista SHALL ser un elemento `<section>` identificable dentro del mismo documento, y la navegación MUST funcionar con anclas `<a href="#...">` que resuelvan al `id` de la sección destino sin depender de JavaScript.

#### Scenario: Navegación a cada vista desde la barra principal

- **WHEN** un usuario activa cualquiera de los cinco enlaces de la barra de navegación
- **THEN** el documento se desplaza a la sección correspondiente y esa sección queda identificada en la URL por su ancla

#### Scenario: Navegación disponible sin JavaScript

- **WHEN** la página se abre con JavaScript deshabilitado
- **THEN** los cinco enlaces de navegación siguen presentes y cada uno apunta a un `id` existente en el documento

### Requirement: Estructura semántica del documento

El documento SHALL usar HTML semántico: un `<header>` con el título de la aplicación, un `<nav>` con la navegación principal y un `<main>` que contenga las cinco `<section>` de vista. Las tablas de datos MUST usar `<table>` con `<thead>` y `<tbody>`, y ningún contenedor MUST simular una tabla con elementos genéricos.

#### Scenario: Elementos estructurales presentes

- **WHEN** se inspecciona el documento
- **THEN** existen un `<header>`, un `<nav>`, un `<main>` y cinco `<section>` dentro del `<main>`

#### Scenario: Tablas de datos tabuladas correctamente

- **WHEN** se inspecciona la tabla de libros, la de clientes, la de renglones de venta o la de historial
- **THEN** cada una es un `<table>` con `<thead>` y `<tbody>` y sus encabezados de columna están dentro de `<thead>`

### Requirement: Etiquetado accesible de controles

Todo control de formulario SHALL tener una etiqueta `<label>` asociada mediante el atributo `for`, cuyo valor MUST coincidir con el `id` existente del control etiquetado. No se MUST usar atributos `tabindex` ni roles artificiales para compensar controles sin etiqueta.

#### Scenario: Asociación label-control verificable

- **WHEN** se recorre el documento buscando cada `<label for="...">`
- **THEN** existe un elemento con ese `id` en el documento y es el control que la etiqueta describe

#### Scenario: Activación del control desde su etiqueta

- **WHEN** un usuario hace clic sobre el texto de una etiqueta de un campo de texto o selector
- **THEN** el control asociado recibe el foco

### Requirement: Botones con texto descriptivo de la acción

Cada `<button>` SHALL indicar en su texto la acción concreta que ejecuta, en español, sin abreviaturas ambiguas como «OK», «Aceptar» o «Enviar» por sí solas.

#### Scenario: Botones identificables por su texto

- **WHEN** se leen los textos de todos los botones de la página
- **THEN** cada texto describe la operación que realiza, por ejemplo «Buscar libro por título», «Dar de alta el libro», «Registrar venta» o «Confirmar venta»

### Requirement: Contenedores de mensajes de estado

La página SHALL incluir, en cada vista que muestra listados o recibe datos, contenedores dedicados a mensajes de estado: listado vacío, búsqueda sin resultados y alerta de error. Los contenedores MUST existir en el markup desde este change, con su `id` estable, aunque su visibilidad y su contenido los controlen módulos posteriores.

#### Scenario: Contenedores presentes con la vista sin datos

- **WHEN** se inspecciona el markup de las vistas Catálogo, Libros, Clientes e Historial
- **THEN** cada una contiene su contenedor de estado vacío y su contenedor de alerta o error, con `id` propio

#### Scenario: Mensaje de búsqueda sin resultados disponible

- **WHEN** se inspecciona la vista Catálogo
- **THEN** existe un contenedor de mensaje de «sin resultados» asociado al buscador

### Requirement: Identificadores estables del DOM

Los elementos que los módulos posteriores van a consultar o modificar SHALL exponer un `id` único en el documento, y ese `id` MUST coincidir con el contrato publicado en `design.md`. El documento MUST NOT contener `id` duplicados.

#### Scenario: Sin identificadores duplicados

- **WHEN** se listan todos los valores de `id` del documento
- **THEN** no hay valores repetidos

#### Scenario: Elementos del contrato localizables

- **WHEN** se busca por `id` cualquier elemento del contrato de ids del DOM
- **THEN** el elemento existe exactamente una vez y corresponde al tipo de control declarado en el contrato

### Requirement: Vista de catálogo con buscador

La vista Catálogo SHALL incluir un campo de búsqueda con su `<label>` asociado, un contenedor para el listado de libros y un contenedor para el mensaje de búsqueda sin resultados, listos para que otro módulo los pueble.

#### Scenario: Buscador presente y etiquetado

- **WHEN** se inspecciona la vista Catálogo
- **THEN** existe un control de búsqueda con su `<label for="...">` y su `id` figura en el contrato de ids del DOM

#### Scenario: Contenedores del catálogo presentes

- **WHEN** se inspecciona la vista Catálogo antes de ejecutarse JavaScript
- **THEN** existen el contenedor del listado y el contenedor del mensaje de «sin resultados», ambos vacíos y con `id` propio

### Requirement: Formulario de alta de libros presente en el markup

La vista Libros SHALL incluir el formulario completo de alta con los controles: título, ISBN, precio, editorial, género y autores (selección múltiple), más su botón de envío, su contenedor de mensajes y el listado de libros registrados. Los selectores de editorial y género SHALL existir vacíos para que otro módulo los pueble.

#### Scenario: Campos obligatorios del formulario disponibles

- **WHEN** se inspecciona el formulario de alta de libros
- **THEN** existen controles etiquetados para título, ISBN, precio, editorial, género y autores, y el de autores admite selección múltiple

#### Scenario: Selectores poblables desde otro módulo

- **WHEN** se inspecciona el markup inicial de los selectores de editorial y género
- **THEN** cada uno tiene `id` y no contiene opciones precargadas

### Requirement: Formulario de alta de clientes presente en el markup

La vista Clientes SHALL incluir el formulario de alta con los controles de nombre completo y email, su botón de envío, su contenedor de mensajes y el listado de clientes registrados.

#### Scenario: Campos del formulario de clientes disponibles

- **WHEN** se inspecciona el formulario de alta de clientes
- **THEN** existen controles etiquetados para nombre completo y email, un botón que describe el alta y un contenedor de mensajes

#### Scenario: Listado de clientes presente

- **WHEN** se inspecciona la vista Clientes
- **THEN** existe una tabla de clientes con `<thead>` y un contenedor de estado vacío

### Requirement: Vista de venta simulada presente en el markup

La vista Ventas SHALL incluir el selector de cliente, el selector de libro, el campo de cantidad, el botón de agregar renglón, la tabla de renglones del ticket, el total, el botón de confirmación y el contenedor de mensajes, todos etiquetados y con `id` estable.

#### Scenario: Controles de la venta presentes

- **WHEN** se inspecciona la vista Ventas
- **THEN** existen selector de cliente, selector de libro, campo de cantidad, botón de agregar renglón, tabla de renglones, total y botón de confirmar venta

#### Scenario: Contenedor para el total con formato

- **WHEN** se inspecciona el resumen de la venta
- **THEN** existe un elemento con `id` propio destinado a mostrar el total calculado

### Requirement: Vista de historial presente en el markup

La vista Historial SHALL incluir el listado de ventas registradas y un contenedor para el mensaje de historial vacío.

#### Scenario: Historial vacío contemplado

- **WHEN** se inspecciona la vista Historial antes de registrarse ventas
- **THEN** existen el contenedor del listado de ventas y el contenedor del mensaje de historial vacío

### Requirement: Restricciones técnicas del cliente

La página MUST NOT cargar frameworks, librerías, hojas de estilo ni scripts desde servidores externos, MUST NOT requerir herramientas de build ni gestores de paquetes, y MUST NOT realizar peticiones de red. La página MUST NOT insertar datos ingresados por el usuario mediante `innerHTML`.

#### Scenario: Sin recursos externos

- **WHEN** se inspeccionan las etiquetas `<script>` y `<link>` del documento
- **THEN** ninguna apunta a un origen distinto del propio proyecto y no hay CDNs declarados

#### Scenario: Sin peticiones de red en el markup

- **WHEN** se busca `fetch`, `axios` o una URL absoluta en el documento
- **THEN** no aparece ninguna referencia de red ni de librería externa

### Requirement: Compatibilidad con navegación por teclado y anchos reducidos

La estructura SHALL conservar el orden de tabulación natural del documento, sin `tabindex` positivos, y cada tabla de datos MUST estar envuelta en un contenedor propio que permita el desplazamiento interno de la tabla sin generar desplazamiento horizontal en la página.

#### Scenario: Recorrido completo por teclado

- **WHEN** un usuario recorre la página sólo con la tecla de tabulación
- **THEN** alcanza y activa todos los controles en el orden visual, empezando por la navegación principal

#### Scenario: Tabla contenida en su propio contenedor

- **WHEN** se inspecciona el markup de cada tabla de datos
- **THEN** la tabla está dentro de un contenedor con `id` propio que la envuelve y ningún atributo `tabindex` positivo aparece en el documento

## Fuera de Alcance

Los estilos, la responsividad visual, el foco visible, los datos semilla, el renderizado, las validaciones, el cálculo de ventas y la persistencia pertenecen a los módulos M02 a M06 y no forman parte de esta capability.
