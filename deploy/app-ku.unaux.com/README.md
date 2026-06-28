# Deploy app-ku.unaux.com

Folder `upload-public_html` berisi file static frontend yang bisa di-upload ke File Manager hosting.

Upload isi folder ini ke root web hosting, biasanya:

```txt
htdocs/
```

atau:

```txt
public_html/
```

Jangan upload folder `upload-public_html`-nya, upload isi di dalamnya.

Package ulang frontend production dengan script ini:

```bash
scripts/package-web-production.sh https://wms-production-23d1.up.railway.app
```

Script ini akan membuat ulang:

```txt
deploy/app-ku.unaux.com/upload-public_html/
deploy/app-ku.unaux.com/upload-public_html.zip
deploy/app-ku.unaux.com/env.web.production
```

File `.htaccess` ikut dibuat untuk fallback route React seperti
`/login`, `/pos`, dan `/dashboard`.

## Catatan API

Hosting dari screenshot terlihat seperti static/shared hosting. Frontend React bisa di-upload lewat File Manager, tapi Express API `apps/api` butuh server Node.js.

Kalau hosting ini tidak menyediakan Node.js app, API harus naik di tempat lain, misalnya Render/Railway/Fly/VPS. Setelah API punya URL publik, rebuild frontend dengan:

```bash
VITE_API_BASE_URL=https://URL_API_PUBLIC npm run build:web
```

Kalau API dibuat satu domain dengan reverse proxy `/api`, frontend bisa dibuild tanpa `VITE_API_BASE_URL`.

## API Production

Frontend production saat ini diarahkan ke:

```txt
https://wms-production-23d1.up.railway.app
```

Repo ini juga punya `render.yaml` kalau API mau dipindah atau dibuat ulang di
Render.

Environment variable yang wajib diisi di API host:

```txt
NODE_ENV=production
CLIENT_ORIGIN=https://app-ku.unaux.com,http://app-ku.unaux.com
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

Setelah API host memberi URL publik, package ulang frontend:

```bash
scripts/package-web-production.sh https://URL_API_PUBLIC
```

Lalu upload ulang:

```txt
deploy/app-ku.unaux.com/upload-public_html.zip
```

## File Env

Template env ada di:

```txt
deploy/app-ku.unaux.com/env.api.production
deploy/app-ku.unaux.com/env.web.production
```
