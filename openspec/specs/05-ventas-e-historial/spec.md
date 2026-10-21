# 05-ventas-e-historial Specification

## Purpose
TBD - created by archiving change m05-venta-simulada-historial. Update Purpose after archive.

## Requirements

### Requirement: Composición del ticket

El sistema SHALL permitir agregar renglones al ticket desde `#venta-libro`, `#venta-cantidad` y `#btn-agregar-renglon`. Un renglón MUST referenciar un libro existente en `Datos.libros` y tener una cantidad entera mayor que cero. El precio unitario del renglón MUST copiarse del libro en el momento de agregarlo. El sistema MUST NOT admitir dos renglones con el mismo libro: ante un libro repetido SHALL informar el duplicado y no crear otro renglón. Antes de confirmar, el sistema SHALL permitir cambiar la cantidad de un renglón y quitarlo.

#### Scenario: Renglón válido

- **WHEN** se elige un libro, se escribe la cantidad `2` y se pulsa «Agregar el libro al ticket»
- **THEN** la tabla de renglones muestra el libro, la cantidad, el precio unitario y el subtotal

#### Scenario: Cantidad inválida al agregar

- **WHEN** la cantidad es vacía, `0`, negativa o decimal (por ejemplo `1.5`)
- **THEN** no se agrega el renglón y se muestra un mensaje de texto que explica el motivo

#### Scenario: Sin libro elegido

- **WHEN** se pulsa agregar sin elegir un libro
- **THEN** no se agrega el renglón y se muestra un mensaje de texto

#### Scenario: Libro repetido

- **WHEN** el libro elegido ya está en el ticket
- **THEN** no se crea un segundo renglón, el existente conserva su cantidad y se informa el duplicado

#### Scenario: Cambiar cantidad o quitar

- **WHEN** se cambia la cantidad de un renglón a un entero mayor que cero, o se pulsa «Quitar»
- **THEN** el subtotal y el total se recalculan, o el renglón desaparece del ticket

#### Scenario: Cantidad inválida al editar

- **WHEN** se cambia la cantidad de un renglón a un valor vacío, cero, negativo o decimal
- **THEN** el renglón conserva su cantidad anterior y se muestra un mensaje de texto

### Requirement: Cálculo de importes

El subtotal de cada renglón SHALL ser cantidad por precio unitario y el total SHALL ser la suma de los subtotales. Los importes MUST mostrarse con dos decimales. El sistema SHALL redondear a centavos cada subtotal y el total para evitar errores de coma flotante. El total SHALL mostrarse en `#venta-total` y valer `0.00` con el ticket vacío.

#### Scenario: Venta de ejemplo

- **WHEN** el ticket tiene dos unidades de un libro a 1500 y una unidad de otro a 2000
- **THEN** los subtotales son `3000.00` y `2000.00` y el total es `5000.00`

#### Scenario: Precios con decimales

- **WHEN** el ticket tiene tres unidades de un libro a 2500.5
- **THEN** el subtotal es `7501.50`

### Requirement: Confirmación de la venta

El sistema SHALL impedir confirmar la venta si no hay un cliente existente seleccionado en `#venta-cliente`, si no hay renglones o si algún renglón tiene una cantidad inválida, y MUST mostrar en `#mensaje-venta` un texto que indique el motivo. Al confirmar, el sistema SHALL registrar en `Datos.ventas` una venta con identificador, fecha, cliente, renglones y total. Cada renglón registrado MUST conservar `libroId`, `titulo`, `cantidad`, `precioUnitario` y `subtotal`, y la venta MUST conservar `clienteId` y `clienteNombre`. Tras confirmar, el sistema SHALL vaciar el ticket, reiniciar el formulario, mostrar un mensaje de éxito y disparar el evento `datos-actualizados` en `document` con `detail.coleccion` igual a `"ventas"`.

#### Scenario: Sin cliente

- **WHEN** hay renglones pero no se eligió cliente y se pulsa «Confirmar la venta»
- **THEN** no se registra la venta y se informa que falta el cliente

#### Scenario: Sin renglones

- **WHEN** se elige cliente pero el ticket está vacío y se pulsa confirmar
- **THEN** no se registra la venta y se informa que faltan renglones

#### Scenario: Confirmación correcta

- **WHEN** hay cliente y al menos un renglón válido y se pulsa confirmar
- **THEN** `Datos.ventas` incorpora la venta, el ticket queda vacío, el total vuelve a `0.00`, se muestra un mensaje de éxito y se dispara `datos-actualizados`

### Requirement: Valores históricos inmutables

La venta confirmada MUST guardar el precio unitario, el título del libro y el nombre del cliente como valores propios. Al mostrar el historial, el sistema MUST NOT consultar el precio, el título ni el nombre actuales de `Datos.libros` o `Datos.clientes`. Las ventas confirmadas MUST NOT poder editarse ni eliminarse desde la interfaz.

#### Scenario: Cambia el precio del catálogo

- **WHEN** se confirma una venta y después cambia el precio del libro en `Datos.libros`
- **THEN** el detalle de esa venta en el historial sigue mostrando el precio unitario, los subtotales y el total confirmados

### Requirement: Historial de ventas

El sistema SHALL mostrar en la vista Historial una fila por venta con identificador, fecha, cliente y total, y SHALL ofrecer un botón por fila para consultar y ocultar los renglones (libro, cantidad, precio unitario y subtotal). Con `Datos.ventas` vacío SHALL mostrar un mensaje de lista vacía en `#mensaje-historial-vacio`. `Historial.render()` MUST redibujar el listado desde `Datos.ventas`. Los datos se insertan únicamente con `textContent`.

#### Scenario: Historial vacío

- **WHEN** no hay ventas confirmadas
- **THEN** la tabla no tiene filas y se muestra el mensaje de historial vacío

#### Scenario: Consultar el detalle

- **WHEN** se pulsa el botón de detalle de una venta
- **THEN** se muestran sus renglones con los valores confirmados, y al pulsarlo de nuevo se ocultan

#### Scenario: Venta nueva

- **WHEN** se confirma una venta
- **THEN** el historial la muestra sin recargar la página
