# 07-tema-claro-oscuro Specification

## Purpose
Define la selección, aplicación y persistencia del tema claro u oscuro: tema inicial sin parpadeo según la elección guardada o la preferencia del sistema, aplicación sobre `<html>` con los selectores de `style.css`, botón accesible en la barra de navegación y seguimiento del sistema mientras no haya elección manual.

## Requirements

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

La barra de navegación SHALL incluir un botón `#btn-tema` que alterne entre tema claro y oscuro y guarde la elección en `localStorage` con la clave `tema-preferido`. El botón SHALL mostrar únicamente un ícono: una luna cuando el tema actual es claro y un sol cuando es oscuro, es decir, el ícono representa el tema al que se pasará. Los íconos MUST ser SVG en línea con `aria-hidden="true"`. Como el botón no tiene texto visible, su nombre accesible SHALL provenir de un `aria-label` que describa la acción siguiente (por ejemplo «Activar el tema oscuro»), que el sistema MUST actualizar con `setAttribute` junto con el atributo `title`. El botón MUST poder usarse con el teclado y conservar el foco visible.

#### Scenario: Alternar

- **WHEN** el tema es claro y se pulsa el botón
- **THEN** se aplica el tema oscuro, se guarda `"dark"`, el botón muestra el sol y su `aria-label` pasa a «Activar el tema claro»

#### Scenario: Ícono inicial

- **WHEN** se abre la página con el tema claro
- **THEN** el botón muestra la luna y su `aria-label` es «Activar el tema oscuro»

#### Scenario: Persistencia

- **WHEN** se alterna el tema y se recarga la página
- **THEN** se mantiene el tema elegido, sin mostrar antes el otro tema y con el ícono correspondiente

### Requirement: Seguimiento del sistema sin elección manual

Mientras no exista una elección guardada, el sistema SHALL actualizar el tema cuando cambie la preferencia del sistema.

#### Scenario: Cambio del sistema

- **WHEN** no hay elección guardada y el sistema pasa de modo claro a oscuro
- **THEN** la interfaz pasa al tema oscuro y el botón actualiza su ícono y su `aria-label`

### Requirement: Transición suave entre temas

Al alternar el tema con el botón, el sistema SHALL animar el cambio de colores de fondo, texto y bordes durante un intervalo breve, y SHALL animar el cruce entre los íconos de sol y luna con opacidad, giro y escala. La transición de colores MUST aplicarse solo durante el cambio manual: no MUST ocurrir en la carga inicial de la página. Cuando el usuario prefiera movimiento reducido (`prefers-reduced-motion: reduce`), el sistema MUST aplicar el cambio sin animaciones.

#### Scenario: Cambio manual

- **WHEN** se pulsa el botón de tema
- **THEN** los colores pasan de un tema al otro de forma gradual en menos de un segundo y los íconos se cruzan con animación

#### Scenario: Carga inicial

- **WHEN** se abre la página con el tema oscuro guardado
- **THEN** la página aparece directamente en oscuro, sin transición de colores desde el tema claro

#### Scenario: Movimiento reducido

- **WHEN** el sistema indica `prefers-reduced-motion: reduce` y se pulsa el botón
- **THEN** el tema y el ícono cambian al instante, sin animación
