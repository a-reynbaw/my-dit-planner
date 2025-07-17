#!/bin/bash

ulimit -c 0

# if [[ -z "${DUCKDNS_DOMAIN}" ]]; then
    export APACHE_DOMAIN="${NONDUCK_DOMAIN}"
    export CERTS_DIR="${PROJECT_DIR}/selfcerts"
# else
#     export APACHE_DOMAIN="${DUCKDNS_DOMAIN}"
#     export CERTS_DIR="${PROJECT_DIR}/certs/live/${DUCKDNS_DOMAIN}"
# fi

# Envsubst scripts
cd /etc/apache2/sites-available
for i in $(ls *.conf 2>/dev/null)
do
  echo "substituting environment variables for ${i}.."
  envsubst < "${i}" | sponge "${i}"
done

# Enable sites
a2ensite ditplanner-redir ditplanner-ssl

echo "Starting.."
exec "$@"