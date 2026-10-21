# 02-estilos-responsivos — Delta Specification

## MODIFIED Requirements

### Requirement: Restricciones técnicas de la capa de estilos

La hoja de estilos MUST ser un archivo CSS nativo único ubicado en el directorio `css/` del proyecto, MUST NOT usar frameworks, librerías, preprocesadores ni herramientas de build, y MUST NOT realizar peticiones de red. La capa de estilos MUST NOT depender de JavaScript para funcionar y MUST NOT requerir cambios en el markup ni en las clases publicadas por M01.

#### Scenario: CSS nativo sin dependencias

- **WHEN** se inspecciona el archivo de estilos
- **THEN** es CSS estándar sin `@import` de frameworks, sin variables de preprocesador y sin utilidades de build

#### Scenario: Estilos aplicados sin JavaScript

- **WHEN** la página se abre con JavaScript deshabilitado
- **THEN** la identidad visual, el layout adaptable y el desplazamiento interno de tablas funcionan igual

#### Scenario: Markup de M01 intacto

- **WHEN** se compara el documento con el entregado por M01
- **THEN** las cinco vistas, los `id` del contrato y todas las clases BEM se conservan sin renombrar ni eliminar

#### Scenario: La hoja de estilos vive en la carpeta de estilos

- **WHEN** se listan los archivos del directorio `css/` del repositorio
- **THEN** están `style.css` y `tema.css`, y el repositorio no tiene ninguna hoja de estilo en su raíz
