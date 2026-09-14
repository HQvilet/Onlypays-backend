FROM kong:3.7

ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml
ENV KONG_PROXY_LISTEN="0.0.0.0:8000,0.0.0.0:8443 ssl"
ENV KONG_ADMIN_LISTEN="0.0.0.0:8001,0.0.0.0:8444 ssl"

COPY kong.yml /usr/local/kong/declarative/kong.yml

EXPOSE 8000 8443 8001 8444