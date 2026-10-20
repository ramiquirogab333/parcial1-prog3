# Tasks

> Estado: propuesta aprobada por el usuario con dos decisiones de alcance: **el ISBN no se muestra** y **la navegación entre vistas se incorpora a este change**.

## 0. Preparación

- [x] 0.1 Confirmar el estado inicial: `openspec status --change m03-modelo-datos-catalogo` muestra `proposal`, `specs` y `design` completos; `openspec validate --all` pasa sin errores.
- [x] 0.2 Confirmar que no hay cambios sin commitear de otros módulos (`git status --short`) y traer el último estado de `main` (`git pull --rebase origin main`).
- [x] 0.3 Dejar registrado el desvío consciente del ISBN en el reporte final (el Ejercicio 3 lo pide y el usuario decidió no mostrarlo): no se agrega columna, no se toca el markup de M01, el campo `isbn` permanece en el modelo.

## 1. Estructura de archivos

- [x] 1.1 Crear `js/data.js` con el comentario de cabecera del módulo (propósito y dueño M03). Verificación: existe y no rompe la carga.
- [x] 1.2 Crear `js/catalogo.js` con el comentario de cabecera del módulo. Verificación: existe.
- [x] 1.3 Crear `js/navegacion.js` con el comentario de cabecera del módulo. Verificación: existe.

## 2. Modelo de datos (`js/data.js`)

- [x] 2.1 Declarar `Datos.editoriales` con 2 editoriales (`edi-01`, `edi-02`). Verificación en consola: `Datos.editoriales.length === 2` y los `id` son únicos.
- [x] 2.2 Declarar `Datos.generos` con 2 géneros (`gen-01`, `gen-02`). Verificación: `Datos.generos.length === 2`.
- [x] 2.3 Declarar `Datos.autores` con 3 autores (`aut-01`, `aut-02`, `aut-03`). Verificación: `Datos.autores.length === 3`.
- [x] 2.4 Declarar `Datos.libros` con 6 libros (`lib-01` … `lib-06`), precios numéricos, ISBN únicos sin guiones ni espacios, un libro con `generoId: null`, un libro con dos `autorIds` y al menos un precio con decimales no nulos. Verificación: `Datos.libros.length === 6` y todos los ISBN son distintos.
- [x] 2.5 Declarar `Datos.clientes` con 3 clientes ficticios (`cli-01` … `cli-03`) con nombre y email. Verificación: `Datos.clientes.length === 3`.
- [x] 2.6 Verificar integridad referencial en consola: todo `editorialId` existe, todo `autorIds` tiene al menos un id existente y todo `generoId` es `null` o existe.
- [x] 2.7 Verificar serialización: `JSON.parse(JSON.stringify(Datos))` conserva los mismos `id` y relaciones (comparar longitudes de los cinco arrays).
- [x] 2.8 Confirmar que no hay `Date.now()`, `Math.random()`, funciones ni clases dentro de los objetos semilla (`grep` sobre `js/data.js`).

## 3. Búsqueda por título (`js/data.js`)

- [x] 3.1 Implementar `Datos.buscarLibrosPorTitulo(texto, libros)` con `trim()`, `toLowerCase()`, `includes` y valor por defecto `libros = Datos.libros`. Verificación: devuelve arrays y no toca el DOM.
- [x] 3.2 Caso mayúsculas: `Datos.buscarLibrosPorTitulo("RAYU")` devuelve «Rayuela». Verificación literal en consola.
- [x] 3.3 Caso minúsculas y parcial: `Datos.buscarLibrosPorTitulo("ficc")` devuelve «Ficciones».
- [x] 3.4 Caso espacios exteriores: `Datos.buscarLibrosPorTitulo("  el túnel  ")` devuelve «El túnel».
- [x] 3.5 Caso consulta vacía: `Datos.buscarLibrosPorTitulo("   ")` devuelve 6 libros y el array devuelto **no** es la misma referencia que `Datos.libros`.
- [x] 3.6 Caso sin coincidencias: `Datos.buscarLibrosPorTitulo("zzz")` devuelve un array vacío.
- [x] 3.7 Caso pureza: pasar una lista propia, comprobar que no se muta (longitud y contenido intactos) y que el resultado es otro array.

## 4. Renderizado del catálogo (`js/catalogo.js`)

- [x] 4.1 Implementar la validación interna de datos y contenedores (arrays presentes, ids únicos, tipos de campo, referencias resolubles). Verificación: con datos válidos no interrumpe el render.
- [x] 4.2 Implementar `Catalogo.render()` que vacía `#cuerpo-tabla-catalogo` y construye las filas con `document.createElement` + `textContent` dentro de un `DocumentFragment`. Verificación: `#cuerpo-tabla-catalogo` tiene 6 filas de **5** celdas.
- [x] 4.3 Orden de columnas: Título, Autor/es, Editorial, Género, Precio. **Sin columna de ISBN** (decisión del usuario). Verificación visual contra el `<thead>` de la tabla.
- [x] 4.4 Resolver autores por `autorIds` y unirlos con `", "`. Verificación: la fila del libro con dos autores muestra ambos nombres separados por coma y espacio.
- [x] 4.5 Resolver la editorial por `editorialId`. Verificación: ninguna celda de Editorial muestra un id crudo ni «undefined».
- [x] 4.6 Mostrar «Sin clasificar» cuando `generoId` es `null`. Verificación: la fila correspondiente muestra exactamente ese texto.
- [x] 4.7 Formatear el precio con `toFixed(2)`. Verificación: todas las celdas de Precio muestran dos decimales, incluidas las que terminan en cero.
- [x] 4.8 Verificar que no se usa `innerHTML` en `js/catalogo.js` (`grep` sin resultados).

## 5. Filtro en vivo y estados (`js/catalogo.js`)

- [x] 5.1 Registrar un único listener `input` sobre `#buscador-catalogo` que invoque `Catalogo.render()`, protegido por bandera contra doble suscripción. Verificación: escribir filtra sin recargar y el listener no se duplica.
- [x] 5.2 Hacer que `render()` lea el valor vigente del buscador y aplique el filtro. Verificación: una búsqueda activa se conserva tras invocar `Catalogo.render()` desde la consola.
- [x] 5.3 Estado «sin resultados»: búsqueda con texto y cero coincidencias deja el tbody vacío y escribe el mensaje en `#mensaje-catalogo-sin-resultados`. Verificación: mensaje visible y tabla vacía.
- [x] 5.4 Limpiar el mensaje de «sin resultados» cuando hay coincidencias o la búsqueda está vacía. Verificación: al borrar el texto, el mensaje queda vacío y vuelven las 6 filas.
- [x] 5.5 Estado «catálogo vacío»: con `Datos.libros` vacío, el tbody queda vacío y `#mensaje-catalogo-vacio` muestra el aviso. Verificación: vaciar `Datos.libros` desde la consola y llamar `Catalogo.render()`.
- [x] 5.6 Estado «error»: una referencia inexistente o una estructura inválida deja el tbody vacío y muestra el mensaje en `#mensaje-catalogo-error`. Verificación: inyectar un libro con `editorialId` inexistente, renderizar, comprobar el mensaje y revertir.
- [x] 5.7 Garantizar exclusividad de los tres mensajes: al mostrarse uno, los otros dos quedan sin texto. Verificación: recorrer los tres estados y comprobar los tres contenedores.
- [x] 5.8 Ejecutar `Catalogo.render()` al evaluarse el script (sin `DOMContentLoaded`). Verificación: al abrir `index.html` el catálogo ya aparece renderizado.

## 6. Navegación entre vistas (`js/navegacion.js`)

- [x] 6.1 Implementar `Navegacion.mostrarVista(idVista)` recorriendo las cinco `<section class="vista">`: `hidden = true` en todas y `hidden = false` en la pedida. Verificación: sólo una sección queda visible.
- [x] 6.2 Sincronizar el estado con la URL: al cargar, leer `location.hash` y mostrar la vista correspondiente, con Catálogo como valor por defecto. Verificación: abrir `index.html#vista-historial` muestra sólo Historial.
- [x] 6.3 Escuchar `hashchange` para aplicar el cambio de vista al hacer clic en el nav, sin `preventDefault`. Verificación: los cinco enlaces cambian la vista y actualizan el hash.
- [x] 6.4 Marcar `aria-current="page"` sólo en el enlace de la vista activa y quitarlo de los demás. Verificación: inspeccionar el nav después de cada cambio.
- [x] 6.5 Ignorar sin romper un `idVista` desconocido y registrarlo en consola. Verificación: `Navegacion.mostrarVista("inexistente")` no deja la pantalla en blanco.
- [x] 6.6 Verificar que no se oculta ninguna sección si el `id` pedido no existe (evitar la página vacía). Verificación: llamada inválida desde consola.

## 7. Punto de extensión (`index.html`)

- [x] 7.1 Agregar `<script src="js/data.js"></script>`, `<script src="js/catalogo.js"></script>` y `<script src="js/navegacion.js"></script>`, en ese orden, dentro del bloque «M03-M06: scripts de la aplicación» (líneas 245–246). Verificación: `git diff index.html` muestra sólo esas tres líneas agregadas.
- [x] 7.2 Confirmar que no se agregó `defer`, `async`, `type="module"` ni ningún recurso externo. Verificación: inspección del bloque y `grep` de `http` en `index.html`.
- [x] 7.3 Confirmar que **no** se agregó ninguna columna de ISBN ni otra modificación al markup. Verificación: `git diff index.html` sin cambios fuera del bloque de scripts.

## 8. Verificación manual (CP-01, navegación y consola)

- [x] 8.1 Abrir `index.html` en el navegador con la consola abierta. Verificación: sin errores ni advertencias de carga de scripts, y sólo la vista Catálogo visible.
- [x] 8.2 CP-01, parte 1: buscar `RAYU` en mayúsculas → coincidencias parciales (al menos «Rayuela»). Registrar el resultado observado.
- [x] 8.3 CP-01, parte 2: borrar la búsqueda → catálogo completo (6 libros). Registrar.
- [x] 8.4 CP-01, parte 3: buscar un texto inexistente → mensaje de «sin resultados» y tabla vacía. Registrar.
- [x] 8.5 Comprobar en consola: 6 filas de 5 celdas, exactamente una fila con «Sin clasificar», todas las celdas de Precio con dos decimales, `Datos.libros.length === 6`.
- [x] 8.6 Navegación: recorrer los cinco enlaces del nav y comprobar una sola vista visible, hash actualizado y `aria-current` en el enlace activo. Registrar.
- [x] 8.7 `grep` de los tres archivos: sin `innerHTML`, sin `fetch`, sin `XMLHttpRequest`, sin URLs externas.
- [x] 8.8 Anotar en el reporte cualquier desvío, fallo o comportamiento inesperado con el resultado literal observado (no declarar aprobado nada que no se haya visto en pantalla).

## 9. Cierre

- [x] 9.1 `openspec validate --all` sin errores.
- [x] 9.2 Commit con el formato del proyecto: `feat(m03): implementar modelo de datos, catalogo con filtro y navegacion entre vistas`.
- [ ] 9.3 Reportar a M04 y M05 la API publicada (`Datos.*`, `Catalogo.render()` y `Navegacion.mostrarVista()`) antes de que empiecen a escribir.
- [ ] 9.4 Avisar a M02 que debe incluir `[hidden] { display: none; }` en su hoja de estilos para no pisar el ocultamiento de vistas.
- [ ] 9.5 Siguiente paso: `/opsx-archive m03-modelo-datos-catalogo` una vez verificado el CP-01 y la navegación.
