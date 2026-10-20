# ---------------------------------------------------------------------------
# Imagen de despliegue del frontend de la Librería (Programación III - UTN)
#
# El proyecto es 100% estático: no hay build, ni npm, ni backend. Por eso la
# imagen no compila nada: arma la carpeta pública y la sirve nginx.
# Los módulos M02–M06 (css/, js/) se publican solos al estar en el contexto,
# sin necesidad de tocar este archivo.
# ---------------------------------------------------------------------------

# Etapa 1: arma el sitio público.
# Se usa la misma imagen base para no descargar una extra y reusar capas.
FROM nginx:stable-alpine AS sitio
WORKDIR /sitio
COPY . .
# La config del servidor viaja en el contexto (la necesita la etapa 2) pero no
# debe quedar accesible como archivo estático del sitio.
RUN rm -f nginx.conf

# Etapa 2: servidor final. No incluye nada de la etapa 1 salvo la carpeta del sitio.
FROM nginx:stable-alpine

LABEL org.opencontainers.image.title="parcial1-prog3-libreria" \
      org.opencontainers.image.description="Frontend estático de la Librería (HTML, CSS y JS nativos)" \
      org.opencontainers.image.licenses="MIT"

# Configuración propia del servidor: gzip, cabeceras de seguridad y
# comportamiento de caché pensado para un sitio que se redespliega seguido.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sitio estático. Qué entra y qué no lo define .dockerignore.
COPY --from=sitio /sitio/ /usr/share/nginx/html/

EXPOSE 80

# EasyPanel / Docker reinician el contenedor si nginx deja de responder.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# La imagen base ya trae ENTRYPOINT (scripts de /docker-entrypoint.d) y
# CMD ["nginx", "-g", "daemon off;"], así que no hace falta repetirlos.
