#!/bin/bash
# Runs once, when the MySQL data volume is first created.
# `prisma migrate dev` creates and drops a temporary "shadow" database named
# prisma_migrate_shadow_db_<uuid>. Allow the app user to manage only those.
set -euo pipefail

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
GRANT ALL PRIVILEGES ON \`prisma\_migrate\_shadow\_db\_%\`.* TO '${MYSQL_USER}'@'%';
SQL
