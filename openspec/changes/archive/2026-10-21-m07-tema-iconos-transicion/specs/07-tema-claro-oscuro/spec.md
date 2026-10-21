## MODIFIED Requirements

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

## ADDED Requirements

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
