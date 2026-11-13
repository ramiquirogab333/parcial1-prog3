# Evidencia — Paso 8: verificación final del despliegue

**Fecha:** 2026-11-13
**Front:** https://libreria.francogagliardi.me
**API:** https://libros.francogagliardi.me
**Variable de EasyPanel:** `API_UPSTREAM=libreria-api:8000`

## Verificación de infraestructura

| Prueba | Resultado | Archivo |
| --- | --- | --- |
| `GET /` | 200 `text/html` | `curl-front.txt` |
| `GET /api/health/ready` | 200 `application/json` — `{"status":"ok","database":"up"}` | `curl-health.txt` |
| `GET /api/libros/?limit=2&offset=0` | 200 `application/json` con libros reales | `curl-libros.txt` |
| `GET /api/ventas/?limit=2&offset=0` | 200 `application/json` con ventas reales | `curl-ventas.txt` |

## Verificación funcional

La QA completa contra la URL pública se ejecutó el **2026-11-13** con Chrome
headless: **58/58 verificaciones OK**. Incluye:

- Catálogo desde la API, búsqueda por título y estados de carga/vacío/error.
- Paginación del catálogo.
- Alta de libro con stock y autores con rol/orden; ISBN repetido → 409.
- Alta de cliente; email inválido/repetido → validación/409.
- Venta con dos renglones; totales del servidor.
- Historial y detalle con importes históricos.
- Recarga sin duplicar registros.
- Navegación por teclado y anchos de 320 px y 1280 px.
- Estado visible cuando la API no responde y recuperación posterior.

El detalle está en [`../paso-7/`](../paso-7/):

- `qa-ejecucion.txt` — log completo de la corrida.
- `qa-resultados.json` — resultados estructurados (58/58 OK).
- `capturas/` — capturas de cada caso.
- `curl-*.txt` — salidas de API y del front.

## Demostración mínima

Desde la URL pública se verificó:

1. Consultar el catálogo.
2. Registrar una venta con dos renglones.
3. Recargar la página.
4. Abrir el detalle de la venta desde el historial.

Los importes del historial coinciden con los que devolvió la API. La venta de
referencia es la **id 5** (cliente QA), con total `78500.50`.

## Prueba manual adicional

El **2026-11-13**, desde la URL pública, se dio de alta un libro y se abrió la
aplicación en una ventana de **incógnito**. El libro apareció correctamente:
como el incógnito no comparte `localStorage`, eso confirma que el dato se leyó
de PostgreSQL a través de la API y no de una copia local del navegador.

## Conclusión

El frontend está integrado con la API, desplegado en EasyPanel y verificado
desde afuera. El backend sigue accesible en `https://libros.francogagliardi.me`
y los datos persisten en PostgreSQL.
