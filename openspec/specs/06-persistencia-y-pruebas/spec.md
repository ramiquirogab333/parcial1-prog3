# 06-persistencia-y-pruebas Specification

## Purpose
Define cómo la librería conserva libros, clientes y ventas en el navegador entre sesiones sin duplicar los datos iniciales, cómo se comporta cuando lo guardado está corrupto o el almacenamiento no está disponible, y qué debe documentar el `README` para que las ocho comprobaciones manuales de la consigna puedan reproducirse.

## Requirements

### Requirement: Persistencia de libros, clientes y ventas

El sistema SHALL conservar en `localStorage` las tres colecciones que exige la consigna —libros, clientes y ventas— en claves separadas y de nombre estable. Cada clave SHALL contener un array JSON de objetos planos, y cada registro SHALL conservar los campos que el módulo que lo produce ya define.

#### Scenario: Alta de libro persistida

- **WHEN** se da de alta un libro y se recarga la página
- **THEN** el libro sigue en el catálogo y en el listado de libros

#### Scenario: Alta de cliente persistida

- **WHEN** se da de alta un cliente y se recarga la página
- **THEN** el cliente sigue en el listado de clientes y en el selector de la venta

#### Scenario: Venta persistida

- **WHEN** se confirma una venta y se recarga la página
- **THEN** la venta sigue en el historial con su identificador, su fecha, su cliente y su total

### Requirement: Las colecciones de referencia no se persisten

Las editoriales, los géneros y los autores SHALL NOT persistirse: ninguna vista los modifica, de modo que siempre se toman de las semillas de `Datos`. El sistema MUST NOT crear claves de `localStorage` para ellas.

#### Scenario: Sólo existen tres claves de aplicación

- **WHEN** se abre la aplicación por primera vez
- **THEN** `localStorage` contiene una clave por cada colección persistida y ninguna más

### Requirement: Siembra inicial sin duplicar los datos iniciales

En el primer inicio, cuando no hay nada guardado, el sistema SHALL escribir los ejemplos de libros y clientes en `localStorage`. Al volver a abrir la aplicación, el sistema SHALL recuperar los registros guardados y MUST NOT volver a sembrar, de modo que los datos iniciales nunca aparecen duplicados.

#### Scenario: Primer inicio

- **WHEN** se abre la aplicación con el almacenamiento vacío
- **THEN** el catálogo muestra los libros de ejemplo y el listado de clientes muestra los clientes de ejemplo, y quedan guardados

#### Scenario: Apertura posterior

- **WHEN** se abre la aplicación con registros ya guardados
- **THEN** se recuperan exactamente esos registros y la cantidad de libros y de clientes es la misma que antes de cerrar, sin elementos repetidos

#### Scenario: Colección guardada vacía a propósito

- **WHEN** se abrió la aplicación con una colección guardada que no tiene registros
- **THEN** esa colección sigue vacía y no se vuelve a sembrar

### Requirement: Guardado ante cada cambio

El sistema SHALL escribir las colecciones persistidas cada vez que una alta o una venta se confirma. El guardado SHALL ocurrir sin que el usuario recargue la página y MUST NOT modificar lo que ya estaba guardado en otras colecciones.

#### Scenario: Se guarda una venta sin perder los libros

- **WHEN** se confirma una venta
- **THEN** las ventas guardadas incluyen la venta nueva y los libros guardados siguen siendo los mismos

#### Scenario: Se guarda una alta sin perder las ventas

- **WHEN** se da de alta un libro
- **THEN** los libros guardados incluyen el libro nuevo y las ventas guardadas siguen siendo las mismas

### Requirement: Recuperación visible al reabrir

Al restaurar los datos, el sistema SHALL redibujar las cinco vistas sin exigir la recarga de la página, de modo que el catálogo, el listado de libros, el listado de clientes, el selector de libros y de clientes de la venta y el historial muestren los registros guardados.

#### Scenario: Selectores de la venta repoblados

- **WHEN** se abre la aplicación con un libro y un cliente guardados que no están entre los ejemplos
- **THEN** el selector de libros y el selector de clientes de la venta los ofrecen

### Requirement: Tolerancia a datos guardados corruptos

Si un valor guardado no es un array JSON válido, o no es un array, o contiene registros sin identificador, el sistema SHALL descartar esa colección, SHALL volver a sus datos de ejemplo y SHALL informar el problema en un mensaje de texto visible.

#### Scenario: JSON inválido

- **WHEN** una clave guardada contiene texto que no es JSON válido
- **THEN** la aplicación abre igual con los datos de ejemplo y se muestra un mensaje de error con texto

#### Scenario: Colección con registros inválidos

- **WHEN** una clave guardada es un array con objetos sin identificador
- **THEN** la aplicación abre igual con los datos de ejemplo y se informa el problema

### Requirement: Tolerancia al almacenamiento no disponible

Si `localStorage` no está disponible o falla al leer o al escribir, la aplicación SHALL seguir funcionando con los datos en memoria y SHALL informar la limitación en un mensaje de texto visible. El sistema MUST NOT impedir la carga de la página.

#### Scenario: Almacenamiento bloqueado

- **WHEN** el navegador bloquea el acceso a `localStorage`
- **THEN** la aplicación carga y muestra los datos de ejemplo, y se informa que no se pudo guardar

#### Scenario: Cuota agotada al guardar

- **WHEN** la escritura en `localStorage` falla
- **THEN** la operación en pantalla se completa igual y se informa que no se pudo guardar

### Requirement: Documentación de las limitaciones del almacenamiento

El `README` SHALL explicar que el almacenamiento depende del navegador, del perfil del usuario y de la ubicación desde la que se abre la aplicación, y SHALL dejar claro que esa información no se comparte entre usuarios ni entre dispositivos.

#### Scenario: Límites explicados en el README

- **WHEN** se lee el `README`
- **THEN** explica las cuatro condiciones del almacenamiento local y sus consecuencias

### Requirement: Documentación de la ubicación y la estructura del catálogo guardado

El `README` SHALL identificar la clave exacta donde se guarda el catálogo de libros y SHALL mostrar la estructura del valor guardado, para que el precio de un libro pueda modificarse desde las herramientas de almacenamiento del navegador sin tocar los demás datos.

#### Scenario: Ubicación y estructura localizables

- **WHEN** se busca en el `README` la clave del catálogo guardado
- **THEN** aparece el nombre de la clave y un ejemplo del valor JSON con los campos de un libro

### Requirement: Registro verificable de los casos de prueba manuales

El `README` SHALL registrar el resultado observado de los ocho casos de prueba manuales de la consigna, con los pasos ejecutados y la evidencia correspondiente. Una prueba MUST NOT marcarse como aprobada si no se ejecutó; si un caso falla o una funcionalidad queda pendiente, SHALL registrarse el comportamiento real.

#### Scenario: Los ocho casos registrados

- **WHEN** se lee el `README`
- **THEN** los ocho casos aparecen con el resultado observado y su estado

#### Scenario: Un caso que falla

- **WHEN** alguno de los ocho casos no se cumple
- **THEN** el `README` lo registra con su comportamiento real y no lo declara aprobado
