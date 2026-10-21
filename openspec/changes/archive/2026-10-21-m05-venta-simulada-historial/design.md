## Context

M01 dejó las vistas Ventas e Historial con contenedores vacíos; M03 definió `Datos`; M04 llena `#venta-cliente` y `#venta-libro` y dispara `datos-actualizados`. M05 solo agrega comportamiento. Restricción del equipo: no se editan los archivos de otros módulos, salvo las etiquetas `<script>` propias en `index.html`.

## Goals / Non-Goals

**Goals:** ticket editable, importes correctos, venta inmutable, historial con detalle, contrato claro para M06.
**Non-Goals:** persistencia, README, stock, edición de ventas, cambios en HTML/CSS ajenos.

## Decisions

1. **Dos módulos con el mismo patrón que M03/M04** (`var Ventas = (function(){...})()`, `IDS`, `TEXTOS`, `iniciar()`, `render()`). `Ventas` es dueño del ticket y de `Datos.ventas`; `Historial` solo lee `Datos.ventas`. `Ventas` llama a `Historial.render()` si existe, así el orden de los scripts no rompe nada.
2. **Lógica pura separada del DOM.** `Ventas.validarCantidad`, `calcularSubtotal`, `calcularTotal` y `agregarRenglon(ticket, libro, cantidad)` no tocan el DOM. Se verifican con casos manuales en la consola del navegador.
3. **Dinero.** `redondear(n) = Math.round((n + Number.EPSILON) * 100) / 100`, aplicado a cada subtotal y al total; se muestra con `toFixed(2)`.
4. **Cantidad válida** = texto no vacío, `Number.isInteger` y mayor que cero. Se valida igual al agregar, al editar y al confirmar.
5. **Duplicado: se informa y no se crea otro renglón** (el existente conserva su cantidad). El usuario cambia la cantidad desde la tabla.
6. **Estructura que falta en el HTML, construida desde JS.** Se agrega por JS una columna «Acciones» a la tabla de renglones (input de cantidad + botón «Quitar») y una columna «Identificador» a la del historial. El detalle se muestra como una fila extra bajo la venta con `colspan`. Se reutilizan las clases existentes (`.boton`, `.mensaje`, `.tabla-datos`); no se agrega CSS. Las columnas se agregan una sola vez (se comprueba antes de insertarlas).
7. **Forma de la venta**, plana y serializable para M06:
   `{ id, fecha, clienteId, clienteNombre, renglones: [{ libroId, titulo, cantidad, precioUnitario, subtotal }], total }`. `id` con el formato del equipo (`ven-01`), `fecha` en ISO 8601; se muestra con `toLocaleString("es-AR")`. Los renglones se copian al confirmar, no se comparte la referencia con el ticket.
8. **Inmutabilidad.** El historial lee solo `Datos.ventas`; no busca en `Datos.libros` ni `Datos.clientes`. No hay botones de editar ni eliminar.
9. **Evento.** Tras confirmar: `document.dispatchEvent(new CustomEvent("datos-actualizados", { detail: { coleccion: "ventas" } }))`.
10. **Seguridad.** Solo `textContent`, `createElement` y `new Option`. Nada de `innerHTML`.

## Contrato para M06

- `Datos.ventas` es un array; M06 debe asignarlo o rellenarlo antes de llamar a `Historial.render()`.
- Los módulos leen `Datos.ventas` en cada uso, así que se puede reemplazar la referencia.
- Si M06 recupera libros o clientes, debe llamar a `Libros.render()` y `Clientes.render()` (ya acordado) para refrescar los selectores de venta.

## Risks / Trade-offs

- El ticket vive en memoria: se pierde al recargar (es lo esperado, solo las ventas confirmadas se persisten).
- Si M01/M02 cambian los ids del DOM, los módulos fallan: se valida su presencia en `iniciar()` y se informa con `console.error`.
- Sin CSS propio, el input de cantidad y los botones de la tabla usan el estilo por defecto del navegador/`.boton`; es funcional y accesible, pero poco refinado.
