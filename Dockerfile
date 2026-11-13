# ---------------------------------------------------------------------------
# Imagen de despliegue del frontend de la Librería (Programación III - UTN)
#
# El proyecto es 100% estático: no hay build, ni npm, ni backend. La imagen no
# compila nada: copia el sitio y lo sirve con nginx.
#
# La conexión con la API se resuelve con nginx: el front llama a /api/... y
# nginx lo reenvía al backend usando la variable API_UPSTREAM.
# ---------------------------------------------------------------------------

FROM nginx:1.30-alpine

# Solo se sustituye ${API_UPSTREAM} en la plantilla; el resto de las variables
# de nginx ($uri, $host, etc.) quedan intactas.
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$

# Sitio estático. public/ contiene index.html, css/ y js/; la configuración
# (Dockerfile, default.conf.template, docs) queda fuera de la imagen.
COPY public/ /usr/share/nginx/html/

# Plantilla del proxy: el entrypoint de nginx la procesa al arrancar y genera
# /etc/nginx/conf.d/default.conf con el valor real de API_UPSTREAM.
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# EasyPanel / Docker reinician el contenedor si nginx deja de responder.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# La imagen base ya trae ENTRYPOINT (scripts de /docker-entrypoint.d) y
# CMD ["nginx", "-g", "daemon off;"], así que no hace falta repetirlos.
