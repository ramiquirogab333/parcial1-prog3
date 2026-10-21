## Why

La consigna (Ejercicio 5, 20 puntos) pide registrar ventas simuladas: elegir un cliente, componer renglones con libros y cantidades, calcular subtotales y total, confirmar la venta y consultarla en un historial que conserve los valores confirmados. Las vistas Ventas e Historial existen en `index.html` (M01) y los selectores de cliente y libro ya se llenan solos (M04), pero ningún script las conecta con los datos.

## What Changes

- Nuevo `js/ventas.js`: composición del ticket (agregar, cambiar cantidad y quitar renglones), validaciones, cálculo de subtotales y total con dos decimales, y confirmación de la venta.
- Nuevo `js/historial.js`: listado de ventas confirmadas (identificador, fecha, cliente, total) y consulta del detalle de cada una.
- `Datos.ventas`: nuevo array de ventas confirmadas, creado por `ventas.js`. Cada venta copia el precio unitario y los datos descriptivos (título, nombre del cliente) como valores históricos.
- Evento `datos-actualizados` con `detail.coleccion = "ventas"` tras cada venta confirmada, para que M06 persista.
- `index.html`: únicamente se agregan las etiquetas `<script>` de los dos archivos nuevos.

Todo lo que el HTML no trae (columna de acciones, identificador de venta, panel de detalle) se construye desde JavaScript dentro de los contenedores existentes. No se modifican `style.css` ni los archivos de M01 a M04.

## Capabilities

### New Capabilities
- `05-ventas-e-historial`: composición, validación y confirmación de ventas simuladas, y su historial inmutable.

### Modified Capabilities
Ninguna.

## Impact

- Archivos nuevos: `js/ventas.js`, `js/historial.js`.
- Archivo existente con cambio mínimo: `index.html` (dos etiquetas `<script>`).
- Dependencias: M03 (`Datos`), M04 (selectores `#venta-cliente` y `#venta-libro` ya poblados).
- Contrato hacia M06: `Datos.ventas`, `Ventas.render()`, `Historial.render()` y el evento `datos-actualizados`.

## Fuera de alcance

Persistencia en `localStorage` y README (M06), stock, cobros, edición o eliminación de ventas confirmadas, y edición de precios del catálogo.
