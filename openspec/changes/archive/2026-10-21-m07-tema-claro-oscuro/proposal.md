## Why

`style.css` ya define los temas claro y oscuro (variables por defecto, `prefers-color-scheme: dark` y los selectores `:root.dark-mode`, `:root[data-theme="dark"]`, `:root.light-mode`, `:root[data-theme="light"]`), pero la interfaz no ofrece forma de alternar entre ellos ni de recordar la elección.

## What Changes

- Nuevo `js/tema.js`: aplica el tema antes del primer pintado, da prioridad a la elección guardada en `localStorage` (clave `tema-preferido`) sobre la preferencia del sistema y alterna el tema desde un botón.
- `index.html`: se agrega la etiqueta `<script src="js/tema.js">` en el `<head>` (sin `defer`, para evitar el parpadeo) y un botón `#btn-tema` como último elemento de la lista de la barra de navegación.
- No se modifica `style.css`: el botón reutiliza la clase `.boton`.

## Capabilities

### New Capabilities
- `07-tema-claro-oscuro`: selección, aplicación y persistencia del tema claro/oscuro.

### Modified Capabilities
Ninguna.

## Impact

- Archivos: `js/tema.js` (nuevo), `index.html` (dos inserciones).
- No depende de `Datos` ni de otros módulos. La clave `tema-preferido` es independiente de los datos de la librería: M06 no debe borrarla.

## Fuera de alcance

Más de dos temas, selector con tercera opción «Sistema», y cambios en `style.css`.
