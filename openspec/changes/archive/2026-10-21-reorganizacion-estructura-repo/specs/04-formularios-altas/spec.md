# 04-formularios-altas — Delta Specification

## MODIFIED Requirements

### Requirement: Restricciones técnicas del módulo

`js/modulos/libros.js` y `js/modulos/clientes.js` MUST usar sólo JavaScript nativo, sin frameworks, librerías, CDN, módulos ES, `fetch` ni `innerHTML` con datos. MUST cargarse con etiquetas `<script src>` locales después de los tres scripts de M03, en el orden `js/modulos/libros.js`, `js/modulos/clientes.js`.

#### Scenario: Revisión estática

- **WHEN** se buscan `innerHTML`, `fetch`, `import`, `export` y URLs externas en los dos archivos
- **THEN** no hay coincidencias
