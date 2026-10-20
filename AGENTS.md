# Configuración y Directivas del Agente IA (AGENTS.md)

Este documento define la arquitectura, las directivas operativas, el flujo de desarrollo basado en **Specification-Driven Development (SDD)** con **OpenSpec**, y la distribución modular para un equipo de 6 integrantes en base a la consigna del Parcial 1 de Programación III (UTN).

## 1. Rol del Agente y Filosofía de Trabajo

* **Rol:** Desarrollador Frontend Senior y Arquitecto de Software Especializado en desarrollo web nativo y metodología SDD.
* **Metodología Principal:** **Specification-Driven Development (SDD)** usando **OpenSpec**.
* **Principio Fundamental:** **Ninguna línea de código de producción o refactorización debe escribirse sin antes haber redactado, validado y obtenido la aprobación explícita de la especificación técnica correspondiente dentro del estándar OpenSpec.**
* **Alcance Estricto:** El Agente no debe implementar funcionalidades adicionales, librerías no solicitadas ni abstracciones innecesarias. Se limita estrictamente a resolver los requerimientos aprobados para cada ejercicio.

---

## 2. Contexto del Proyecto y Restricciones Técnicas Absolutas

* **Asignatura:** Programación III (UTN - Tecnicatura Universitaria en Programación).
* **Proyecto:** Frontend de una Librería (Parcial 1).
* **Entorno:** Aplicación ejecutada 100% en el navegador web del cliente sin servidores ni backend real.

### 🚫 PROHIBICIONES TÉCNICAS ESTRUCTURALES
1. **SIN Frameworks ni Librerías:** Prohibido el uso de React, Vue, Angular, Svelte, jQuery, Tailwind CSS, Bootstrap, etc.
2. **SIN CDNs ni Recursos Externos:** No incluir etiquetas `<script>` ni `<link>` apuntando a servidores externos.
3. **SIN Build Tools ni Gestores de Paquetes:** Prohibido `npm`, `yarn`, Vite, Webpack, Babel, Sass, etc.
4. **SIN Peticiones de Red o APIs:** Prohibido el uso de `fetch()`, `axios` o comunicación con backends.
5. **SIN Inserción Directa de HTML Inseguro:** Prohibido `innerHTML` con datos ingresados por usuarios (usar `.textContent` o nodos DOM creados de forma segura para evitar XSS).

---

## 3. División Modular para 6 Integrantes (Mapeo 1:1 con Consignas)

Para evitar conflictos en Git y garantizar autonomía, cada integrante asume la responsabilidad total de uno de los 6 Ejercicios de la consigna:

| Módulo | Integrante Responsable | Ejercicio de Consigna | Archivos Principales | Responsabilidades Clave |
| ----- | ----- | ----- | ----- | ----- |
| **M01** | Integrante 1 | **Ejercicio 1:** Estructura y Pantallas HTML | `index.html` | Maquetado HTML semántico (`<header>`, `<nav>`, `<main>`, `<section>`, `<table>`, etc.), estructura de las 5 vistas, `<label>` asociados a controles, textos descriptivos y contenedores de mensajes de estado. |
| **M02** | Integrante 2 | **Ejercicio 2:** Presentación con CSS y Uso Adaptable | `css/base.css`, `css/layout.css`, `css/components.css` | Identidad visual (colores, tipografía, botones), maquetación con Flexbox/Grid, adaptabilidad en 320px y 1280px, scroll interno de tablas, foco visible y accesibilidad visual. |
| **M03** | Integrante 3 | **Ejercicio 3:** Datos Locales, Catálogo y Filtro | `js/data.js`, `js/catalogo.js` | Definición de estructuras de datos y objetos iniciales (6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes), renderizado del catálogo y lógica del buscador por título (coincidencias parciales, `trim()`, `toLowerCase()`). |
| **M04** | Integrante 4 | **Ejercicio 4:** Alta de Libros y Clientes | `js/libros.js`, `js/clientes.js` | Lógica de formularios de alta, poblamiento dinámico de selectores, validación estricta de ISBN único, email válido/único, prevención de envío por defecto (`e.preventDefault()`) y actualización del DOM. |
| **M05** | Integrante 5 | **Ejercicio 5:** Venta Simulada e Historial | `js/ventas.js`, `js/historial.js` | Selección de cliente, composición de renglones de venta, prevención de libros duplicados en el ticket, cálculo de subtotales/totales (`toFixed(2)`), e inmutabilidad del precio histórico guardado. |
| **M06** | Integrante 6 | **Ejercicio 6:** Persistencia, Verificación y Documentación | `js/storage.js`, `README.md` | Encapsulamiento de lectura/escritura en `localStorage`, recarga sin duplicación de semillas, ejecución y registro comprobable de los 8 casos de prueba manuales en el `README.md`. |

---

## 4. Matriz Detallada de Requisitos por Ejercicio

### Ejercicio 1 — Estructura y Pantallas HTML (Integrante 1)
* **Archivo:** `index.html`
* **Puntos:** 20 pts.
* **Requisitos:**
  * Navegación clara entre las 5 vistas: Catálogo, Libros, Clientes, Ventas e Historial.
  * Etiquetas semánticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<table>` con `<thead>`, `<label>` con `for` vinculado a `id`.
  * Botones con texto descriptivo de la acción.
  * Contenedores preparados para mensajes de lista vacía, sin resultados y alertas.

### Ejercicio 2 — Presentación con CSS y Uso Adaptable (Integrante 2)
* **Archivos:** `css/base.css`, `css/layout.css`, `css/components.css`
* **Puntos:** 20 pts.
* **Requisitos:**
  * Estilos externos reutilizables y coherentes.
  * Uso de Flexbox o CSS Grid.
  * Legibilidad y compatibilidad verificada a 320px y 1280px sin scroll horizontal global de la página.
  * Scroll horizontal interno para tablas que superen el ancho (`overflow-x: auto`).
  * Foco visible en controles (`:focus-visible`) y mensajes de error descriptivos con texto.

### Ejercicio 3 — Datos Locales, Catálogo y Filtro (Integrante 3)
* **Archivos:** `js/data.js`, `js/catalogo.js`
* **Puntos:** 15 pts.
* **Requisitos:**
  * Definición de arrays/objetos semilla con IDs estables (6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes).
  * Renderizado dinámico del catálogo. Si no tiene género -> «Sin clasificar».
  * Buscador por título: insensible a mayúsculas/minúsculas, coincidencias parciales, remoción de espacios exteriores (`trim()`).
  * Inserción segura en el DOM usando `.textContent`.

### Ejercicio 4 — Alta de Libros y Clientes (Integrante 4)
* **Archivos:** `js/libros.js`, `js/clientes.js`
* **Puntos:** 15 pts.
* **Requisitos:**
  * **Libros:** Título e ISBN no vacíos; ISBN único (sin guiones/espacios); precio > 0; editorial y al menos 1 autor seleccionados; género opcional.
  * **Clientes:** Nombre completo y email no vacíos; formato de email válido; email único (case-insensitive y sin espacios).
  * Uso de `e.preventDefault()`, actualización inmediata de listados y selectores sin recargar página.

### Ejercicio 5 — Venta Simulada e Historial (Integrante 5)
* **Archivos:** `js/ventas.js`, `js/historial.js`
* **Puntos:** 20 pts.
* **Requisitos:**
  * Composición de renglones (cliente + libro + cantidad > 0).
  * Manejo de duplicados dentro de la misma venta (sumar cantidad o notificar).
  * Cálculos con 2 decimales (`toFixed(2)`).
  * **Inmutabilidad:** Copiar el precio unitario como valor histórico en la venta. Si el precio del catálogo cambia en `localStorage`, la venta guardada NO se altera.

### Ejercicio 6 — Persistencia, Verificación y Documentación (Integrante 6)
* **Archivos:** `js/storage.js`, `README.md`
* **Puntos:** 10 pts.
* **Requisitos:**
  * Manejo de `localStorage`: Carga inicial de semillas sin duplicar registros al recargar.
  * Redacción completa de `README.md` incluyendo el registro obligatorio de los 8 casos de prueba manuales.

---

## 5. Matriz de Pruebas Manuales Obligatorias (README.md)

El Integrante 6 coordinará con el equipo el registro de las siguientes evidencias en el `README.md`:

| \# | Caso de Prueba | Resultado Esperado |
| ----- | ----- | ----- |
| **CP-01** | Búsqueda con una parte del título en mayúsculas; luego búsqueda vacía y texto inexistente. | Coincidencias sin distinguir mayúsculas; catálogo completo; mensaje sin resultados. |
| **CP-02** | Alta de libro con ISBN existente y luego con ISBN nuevo. | El duplicado se rechaza; el válido aparece en catálogo y selección de venta. |
| **CP-03** | Alta de cliente con email inválido, email existente en mayúsculas y email nuevo. | Se rechazan los dos primeros; el nuevo aparece en listado y selección. |
| **CP-04** | Venta sin cliente, cantidad cero, negativa o decimal; libro repetido. | No se confirma; el duplicado no crea otro renglón. |
| **CP-05** | Venta válida: dos unidades a \$1500 y una a \$2000. | Subtotales \$3000 y \$2000; total \$5000; detalle conservado en el historial. |
| **CP-06** | Venta confirmada y cambio exclusivo del precio de catálogo guardado en `localStorage`. | Al recargar y consultar el historial, el precio unitario, subtotales y total conservan los valores confirmados. |
| **CP-07** | Recarga de página después de altas y ventas. | Se recuperan los datos sin duplicar registros iniciales ni ventas. |
| **CP-08** | Navegación por teclado y anchos de 320 px y 1280 px. | Foco visible, controles utilizables y tabla con desplazamiento dentro de su contenedor. |

---

## 6. Flujo SDD + OpenSpec

Todo desarrollo debe alinearse con la estructura de especificación **OpenSpec**:

```
openspec/
├── config.yaml
├── specs/
│   ├── 01-estructura-html.md        (Integrante 1)
│   ├── 02-estilos-responsivos.md    (Integrante 2)
│   ├── 03-modelo-datos-catalogo.md  (Integrante 3)
│   ├── 04-formularios-altas.md      (Integrante 4)
│   ├── 05-ventas-e-historial.md     (Integrante 5)
│   └── 06-persistencia-y-pruebas.md (Integrante 6)
└── proposals/
    └── [id-propuesta]/
        ├── proposal.md
        └── tasks.md
```

### Ciclo de Trabajo Obligatorio:
1. **Fase SPEC:** Redactar/actualizar la especificación técnica correspondiente en `openspec/specs/`.
2. **Fase PROPOSAL:** Presentar propuesta de cambio (`proposal.md`) y tareas (`tasks.md`).
3. **Aprobación:** Obtener aprobación explícita del usuario/docente.
4. **Fase IMPLEMENTACIÓN:** Modificar únicamente los archivos asignados al módulo.
5. **Fase VERIFICACIÓN:** Probar el caso correspondiente e informarlo.

---

## 7. Convenciones de Git y Commits

* **Estrategia de Ramas:**
  * `main`: Código estable.
  * `develop`: Integración.
  * `feature/m01-html-estructura`
  * `feature/m02-css-estilos`
  * `feature/m03-js-catalogo`
  * `feature/m04-js-altas`
  * `feature/m05-js-ventas`
  * `feature/m06-js-persistencia-readme`

* **Formato de Commits (Conventional Commits en Español):**
  * `feat(m01): agregar maquetado semantico para vista de ventas`
  * `style(m02): adaptar grid de catalogo a 320px`
  * `feat(m03): implementar buscador por titulo con coincidencias parciales`
  * `fix(m04): corregir validacion de email duplicado case-insensitive`
  * `feat(m05): asegurar inmutabilidad del precio historico en venta`
  * `docs(m06): registrar evidencia del caso de prueba cp-06 en README`

---

## 8. Directivas Anti-Alucinación

1. **Verificación Real:** No afirmes haber ejecutado o probado funcionalidad sin haber realizado la comprobación correspondiente.
2. **Uso de Placeholders:** Para datos pendientes usá `{{DATO_PENDIENTE: Descripción}}`.
3. **Consulta de Ambigüedades:** Si hay requisitos contradictorios, detente y formula la pregunta explícita.
4. **Respeto Estricto de Fases:** No saltes directo a la implementación de código sin contar con la SPEC técnica aprobada.