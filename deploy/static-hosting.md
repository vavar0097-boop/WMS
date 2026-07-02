# Static Frontend Hosting

Use Vercel first. Netlify is the fallback if Vercel is unavailable.

## Vercel

Import this GitHub repository into Vercel and keep the defaults from
`vercel.json`.

Expected settings:

```txt
Framework Preset: Other
Install Command: npm install
Build Command: VITE_API_BASE_URL=https://wms-production-23d1.up.railway.app npm run build:web
Output Directory: apps/web/dist
```

The `vercel.json` rewrite sends `/login`, `/dashboard`, and all other frontend
routes to `index.html`.

## Netlify

Import this GitHub repository into Netlify. Netlify reads `netlify.toml`.

Expected settings:

```txt
Build command: VITE_API_BASE_URL=https://wms-production-23d1.up.railway.app npm run build:web
Publish directory: apps/web/dist
```

For a quick manual deploy, upload this zip through Netlify Drop:

```txt
deploy/netlify/wms-web-netlify.zip
```

## After Deploy

Set the Playwright production URL to the new frontend domain:

```txt
automation/playwright/.env
WMS_APP_URL=https://YOUR_NEW_FRONTEND_DOMAIN
```

Then run:

```bash
cd automation/playwright
npm test
```
