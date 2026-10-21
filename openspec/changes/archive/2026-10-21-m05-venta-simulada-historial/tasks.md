## 1. Ventas: lógica pura

- [x] 1.1 Crear `js/ventas.js` con el esqueleto del módulo (`IDS`, `TEXTOS`, `Datos.ventas`) y `validarCantidad`, `redondear`, `calcularSubtotal`, `calcularTotal`
- [x] 1.2 Agregar `agregarRenglon` (libro existente, cantidad válida, sin duplicados, precio copiado) y `cambiarCantidad` / `quitarRenglon` sobre el ticket

## 2. Ventas: interfaz y confirmación

- [x] 2.1 Dibujar la tabla de renglones (columna «Acciones» con input de cantidad y botón «Quitar»), el total en `#venta-total` y el mensaje de estado
- [x] 2.2 Conectar `#btn-agregar-renglon` con mensajes de error (sin libro, cantidad inválida, duplicado)
- [x] 2.3 Implementar `#btn-confirmar-venta`: validar cliente, renglones y cantidades; registrar la venta con valores históricos; vaciar el ticket; mensaje de éxito; disparar `datos-actualizados`

## 3. Historial

- [x] 3.1 Crear `js/historial.js` con `Historial.render()`: columna «Identificador», fila por venta, mensaje de lista vacía
- [x] 3.2 Botón «Ver detalle» / «Ocultar detalle» con los renglones guardados (sin consultar el catálogo)

## 4. Integración

- [x] 4.1 Agregar en `index.html` las etiquetas `<script>` de `js/ventas.js` y `js/historial.js` después de `clientes.js`
- [x] 4.2 Ejecutar `openspec validate --all`

## 5. Verificación

- [x] 5.1 CP-04: sin cliente, cantidad cero, negativa y decimal, libro repetido
- [x] 5.2 CP-05: dos unidades a 1500 y una a 2000 → subtotales 3000 y 2000, total 5000, detalle en el historial
- [x] 5.3 CP-06 (simulado sin M06): cambiar el precio en `Datos.libros` y comprobar que el detalle no cambia
- [x] 5.4 Comprobar que no hay errores en consola y que no se modificó ningún archivo ajeno salvo `index.html`
