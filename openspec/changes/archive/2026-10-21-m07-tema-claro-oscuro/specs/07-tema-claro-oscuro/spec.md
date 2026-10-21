## ADDED Requirements

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

### Requirement: Aplicación del tema

Al aplicar un tema, el sistema SHALL actualizar el elemento `document.documentElement`: alternar las clases `dark-mode` y `light-mode` y establecer el atributo `data-theme` con el valor `"dark"` o `"light"`, de modo que coincidan con los selectores de `style.css`.

#### Scenario: Tema oscuro

- **WHEN** se aplica el tema oscuro
- **THEN** `<html>` tiene la clase `dark-mode`, no tiene `light-mode` y `data-theme="dark"`

### Requirement: Botón para alternar el tema

La barra de navegación SHALL incluir un botón `#btn-tema` que alterne entre tema claro y oscuro, guarde la elección en `localStorage` con la clave `tema-preferido` y actualice su texto y su `aria-label` con `textContent` y `setAttribute`. El texto visible y el `aria-label` MUST describir la acción siguiente (por ejemplo «Tema oscuro» y «Activar el tema oscuro»), y el texto visible MUST estar contenido en el `aria-label`. El botón MUST poder usarse con el teclado.

#### Scenario: Alternar

- **WHEN** el tema es claro y se pulsa el botón
- **THEN** se aplica el tema oscuro, se guarda `"dark"` y el botón pasa a ofrecer el tema claro

#### Scenario: Persistencia

- **WHEN** se alterna el tema y se recarga la página
- **THEN** se mantiene el tema elegido, sin mostrar antes el otro tema

### Requirement: Seguimiento del sistema sin elección manual

Mientras no exista una elección guardada, el sistema SHALL actualizar el tema cuando cambie la preferencia del sistema.

#### Scenario: Cambio del sistema

- **WHEN** no hay elección guardada y el sistema pasa de modo claro a oscuro
- **THEN** la interfaz pasa al tema oscuro y el botón actualiza su texto
