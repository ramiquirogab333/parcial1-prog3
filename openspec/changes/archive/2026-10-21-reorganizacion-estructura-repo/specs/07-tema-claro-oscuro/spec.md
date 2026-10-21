# 07-tema-claro-oscuro — Delta Specification

## MODIFIED Requirements

### Requirement: Aplicación del tema

Al aplicar un tema, el sistema SHALL actualizar el elemento `document.documentElement`: alternar las clases `dark-mode` y `light-mode` y establecer el atributo `data-theme` con el valor `"dark"` o `"light"`, de modo que coincidan con los selectores de `css/style.css`.

#### Scenario: Tema oscuro

- **WHEN** se aplica el tema oscuro
- **THEN** `<html>` tiene la clase `dark-mode`, no tiene `light-mode` y `data-theme="dark"`

### Requirement: Tema inicial sin parpadeo

El sistema SHALL determinar el tema antes del primer pintado, mediante un script síncrono cargado en el `<head>`. La elección manual guardada en `localStorage` con la clave `tema-preferido` (valores `"light"` o `"dark"`) MUST tener prioridad sobre la preferencia del sistema (`prefers-color-scheme`). Sin elección guardada válida, el sistema SHALL usar la preferencia del sistema. Si `localStorage` no está disponible o falla, el sistema MUST continuar sin error usando la preferencia del sistema.

#### Scenario: Sin elección guardada

- **WHEN** se abre la página sin la clave `tema-preferido` y el sistema prefiere el modo oscuro
- **THEN** se aplica el tema oscuro

#### Scenario: Elección guardada

- **WHEN** `tema-preferido` vale `"light"` y el sistema prefiere el modo oscuro
- **THEN** se aplica el tema claro

#### Scenario: Valor guardado inválido

- **WHEN** `tema-preferido` contiene un valor distinto de `"light"` y `"dark"`
- **THEN** se ignora y se usa la preferencia del sistema

#### Scenario: El script del tema se carga de forma bloqueante

- **WHEN** se inspecciona el `<head>` del documento principal
- **THEN** contiene `<script src="js/modulos/tema.js"></script>` sin `defer`, y el tema se aplica antes del primer pintado
