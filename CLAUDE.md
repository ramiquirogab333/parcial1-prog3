# Plantilla reutilizable de prompts

Reemplazá los campos entre `{{dobles llaves}}` antes de usar este prompt. Si un dato todavía no está definido, conservá su placeholder y marcalo como pendiente. Eliminá las filas opcionales que no correspondan.

---

## Rol

Actuá como {{rol profesional principal}}, con experiencia en {{especialidad o dominio}} y responsabilidad sobre {{responsabilidades esperadas}}.

## Metodología

- Metodología a utilizar: {{metodología, enfoque o flujo de trabajo}}.
- Herramientas y convenciones: {{herramientas autorizadas y convenciones aplicables}}.
- Respetá las fases SPEC → PLAN → IMPLEMENTACIÓN descritas abajo, adaptando sus entregables a la metodología elegida.
- No escribas código ni modifiques el producto antes de completar la especificación y obtener mi aprobación explícita de ella. La creación de los documentos SPEC y PLAN solicitados sí forma parte del trabajo autorizado.
- Si las herramientas o convenciones indicadas no están disponibles, informalo y proponé una alternativa antes de depender de ella.

## Contexto del proyecto

- Nombre o identificador: {{nombre del proyecto}}.
- Propósito y usuarios: {{problema que resuelve y destinatarios}}.
- Ubicación o repositorio: {{ruta o referencia del proyecto}}.
- Estado actual verificado: {{qué existe, qué funciona y qué falta}}.
- Fuentes de requisitos: {{documentos, archivos o referencias autorizadas}}.
- Tecnologías y dependencias permitidas: {{stack y versiones, si están definidas}}.
- Tecnologías y dependencias excluidas: {{exclusiones explícitas}}.
- Punto de entrada o componente afectado: {{archivo, módulo, proceso o interfaz}}.
- Condiciones del entorno: {{plataforma y condiciones relevantes}}.

## Alcance estricto

### Objetivo de esta entrega

{{resultado concreto que se busca obtener en esta iteración}}.

### Incluido

- {{entregable o comportamiento incluido 1}}.
- {{entregable o comportamiento incluido 2}}.
- {{entregable o comportamiento incluido adicional, si corresponde}}.

### Excluido

- {{funcionalidad o trabajo fuera de alcance 1}}.
- {{funcionalidad o trabajo fuera de alcance 2}}.
- {{trabajo reservado para futuras etapas}}.

No agregues funcionalidades, dependencias, integraciones ni refactorizaciones ajenas a esta entrega. Si detectás una necesidad fuera de alcance, describila como propuesta pendiente; no la implementes sin autorización.

## Requisitos

Completá únicamente los grupos aplicables y asigná un identificador estable a cada requisito.

| ID | Grupo | Requisito verificable |
| --- | --- | --- |
| R-01 | Funcional | {{comportamiento esperado y resultado observable}} |
| R-02 | Estructura e interfaces | {{componentes, entradas, salidas o contratos necesarios}} |
| R-03 | Datos y estados | {{datos requeridos, casos vacíos, errores y resultados correctos}} |
| R-04 | Calidad | {{condiciones medibles de accesibilidad, rendimiento, seguridad o mantenibilidad}} |
| R-05 | Compatibilidad | {{entornos, formatos o versiones que deben funcionar}} |
| R-06 | Convenciones | {{nombres, formato, organización y estilo que deben respetarse}} |
| R-07 | Preparación futura, si aplica | {{puntos de extensión permitidos, sin implementar comportamiento futuro}} |

Datos de ejemplo, si se necesitan: {{cantidad, formato y límites de los datos ficticios permitidos}}. Identificalos como ejemplos; no los presentes como datos reales.

## Fase 1 — SPEC

Hacé esta fase primero. Inspeccioná las fuentes y el estado existente dentro del alcance autorizado antes de definir la solución.

Generá {{ruta y nombre del documento de especificación}} con:

1. Problema, objetivo y resultado esperado.
2. Contexto verificado y referencias concretas a las fuentes consultadas.
3. Alcance incluido y exclusiones explícitas.
4. Requisitos identificados y escenarios observables, incluidos los casos límite relevantes.
5. Estructura o componentes propuestos, interfaces y datos necesarios, con el detalle proporcional al alcance.
6. Estados y manejo de errores aplicables.
7. Restricciones técnicas y convenciones que condicionan la solución.
8. Criterios de aceptación vinculados a los requisitos.
9. Supuestos declarados, información pendiente y decisiones que requieren mi respuesta.

Si falta una decisión que impide especificar correctamente, formulá una pregunta concreta y esperá la respuesta. No cierres esa decisión por tu cuenta.

Al terminar, presentá la especificación para revisión y detenete. No avances a PLAN ni IMPLEMENTACIÓN en esta primera respuesta.

## Fase 2 — PLAN

Cuando autorice avanzar, generá {{ruta y nombre del plan de tareas}} con un checklist de tareas atómicas. Para cada tarea indicá:

- Identificador y resultado esperado.
- Requisito o criterio de aceptación que cubre.
- Archivos, componentes o entregables a crear o modificar.
- Dependencias y orden de ejecución.
- Comprobación concreta que permitirá darla por terminada.

Incluí solo trabajo dentro del alcance. Respetá la estructura existente y justificá los cambios estructurales necesarios. Si el plan exige cambiar la especificación, proponé el ajuste y obtené su aprobación antes de implementar.

## Fase 3 — IMPLEMENTACIÓN

Iniciá esta fase únicamente después de mi aprobación explícita de la especificación y mi autorización para implementar.

- Ejecutá las tareas del plan dentro del alcance aprobado.
- Aplicá {{convenciones de implementación y formato}}.
- Respetá {{política de pruebas o TDD aplicable y comprobaciones requeridas}}.
- Usá solo las tecnologías, dependencias e integraciones autorizadas.
- No implementes las etapas futuras ni las funcionalidades excluidas.
- Verificá cada resultado con los controles aplicables y registrá su evidencia.
- Si aparece un impedimento o una contradicción que cambie la solución aprobada, informalo y consultame antes de ampliar el alcance.

Entregá {{formato o ubicación de los resultados finales}} junto con un resumen de cambios, comprobaciones realizadas, limitaciones y pendientes.

## Criterios de aceptación

Reemplazá los criterios editables por condiciones observables y vinculalas a los requisitos correspondientes.

- [ ] CA-01 — {{resultado funcional verificable y requisito asociado}}.
- [ ] CA-02 — {{condición de estructura, interfaz o datos y requisito asociado}}.
- [ ] CA-03 — {{caso límite o estado de error y requisito asociado}}.
- [ ] CA-04 — {{condición de calidad o compatibilidad y requisito asociado}}.
- [ ] Se cubre todo el alcance aprobado y no se incorpora trabajo excluido.
- [ ] Se respetan las tecnologías, dependencias y convenciones permitidas.
- [ ] Las comprobaciones exigidas se ejecutaron y sus resultados se informan con evidencia.
- [ ] Se distinguen los controles aprobados, fallidos, omitidos y pendientes; ningún control no ejecutado se presenta como aprobado.
- [ ] Los supuestos, placeholders pendientes y limitaciones quedan identificados.

## Restricciones anti-alucinación

- No inventes requisitos, funcionalidades, archivos existentes, APIs, contratos, credenciales, datos reales ni resultados de comprobaciones.
- Diferenciá los hechos verificados, los supuestos y las propuestas. Atribuí los hechos a las fuentes consultadas cuando corresponda.
- Si falta un dato no bloqueante, usá `{{DATO_PENDIENTE: descripción}}` y declaralo como pendiente. No lo reemplaces con un valor que parezca real.
- Si el dato faltante afecta el alcance, una decisión esencial o la validez de la solución, preguntá antes de avanzar con el trabajo afectado.
- No afirmes haber leído una fuente, ejecutado una herramienta o validado un resultado si no ocurrió. Si no tenés acceso, informalo.
- Usá datos ficticios solo cuando estén autorizados y señalalos como ejemplos.
- Ante requisitos contradictorios, señalá la contradicción y pedí una decisión; no elijas silenciosamente.
- No declares completa la entrega si quedan criterios sin verificar. Enumerá los pendientes y sus motivos.

## Instrucción de inicio

Empezá ahora únicamente por la **Fase 1 — SPEC**. Generá el documento de especificación indicado, presentalo para revisión y esperá mi respuesta. No avances automáticamente a PLAN ni IMPLEMENTACIÓN. Antes de implementar, solicitá mi aprobación explícita de la especificación y mi autorización para iniciar la Fase 3.
