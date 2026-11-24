#!/bin/sh
# Starts Kasmin with demo data inside the development container (for scripts/screenshots.mjs).
# Usage: demo-instance.sh <de|en> <port> <organisation>
set -e
touch "$DB_DATABASE"
php artisan kasmin:install --organisation="$3" --locale="$1" --defaults="$1" --admin-name="Alex Demo" --admin-email=admin@example.org
php artisan kasmin:demo --locale="$1" --families=25 --staff=8 --force
cd public
exec php -S "0.0.0.0:$2" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
