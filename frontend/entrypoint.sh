#!/bin/sh
set -e

: "${PORT:=8080}"

envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
