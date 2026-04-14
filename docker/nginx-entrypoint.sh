#!/bin/sh
set -e

# Remplace DOMAIN_PLACEHOLDER par le domaine réel dans les fichiers statiques
if [ -n "$DOMAIN" ]; then
  echo "[entrypoint] Remplacement DOMAIN_PLACEHOLDER → $DOMAIN"
  SAFE_DOMAIN=$(printf '%s' "$DOMAIN" | sed 's/[&|\\\/]/\\&/g')
  find /usr/share/nginx/html -type f \( -name '*.html' -o -name '*.xml' -o -name '*.txt' \) \
    -exec sed -i "s|DOMAIN_PLACEHOLDER|$SAFE_DOMAIN|g" {} +
else
  echo "[entrypoint] DOMAIN non défini — DOMAIN_PLACEHOLDER non remplacé"
fi

# Lancer nginx normalement
exec nginx -g 'daemon off;'
