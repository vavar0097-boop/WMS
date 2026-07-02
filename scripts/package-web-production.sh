#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: scripts/package-web-production.sh https://URL_API_PUBLIC"
  exit 1
fi

API_URL="${1%/}"
DEPLOY_DIR="deploy/app-ku.unaux.com"
UPLOAD_DIR="$DEPLOY_DIR/upload-public_html"

VITE_API_BASE_URL="$API_URL" npm run build:web

rm -rf "$UPLOAD_DIR"
mkdir -p "$UPLOAD_DIR"
cp -a apps/web/dist/. "$UPLOAD_DIR/"

cat > "$UPLOAD_DIR/deploy-check.txt" <<EOF
Enterprise WMS frontend package
API_URL=$API_URL
Built at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
Upload contents of this folder directly into the hosting web root.
EOF

if [ -f "$UPLOAD_DIR/sw.js" ]; then
  CACHE_VERSION="enterprise-wms-$(date +%Y%m%d%H%M%S)"
  sed -i "s/const CACHE_NAME = \"[^\"]*\";/const CACHE_NAME = \"$CACHE_VERSION\";/" "$UPLOAD_DIR/sw.js"
fi

cat > "$UPLOAD_DIR/.htaccess" <<'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^api(/.*)?$ - [L]
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF

rm -f "$DEPLOY_DIR/upload-public_html.zip"
rm -f "$DEPLOY_DIR/upload-public_html-no-htaccess.zip"

(
  cd "$UPLOAD_DIR"
  zip -qr "../upload-public_html.zip" .
  zip -qr "../upload-public_html-no-htaccess.zip" . -x ".htaccess"
)

cat > "$DEPLOY_DIR/env.web.production" <<EOF
VITE_API_BASE_URL=$API_URL
EOF

echo "Frontend package ready:"
echo "$DEPLOY_DIR/upload-public_html.zip"
echo "$DEPLOY_DIR/upload-public_html-no-htaccess.zip"
