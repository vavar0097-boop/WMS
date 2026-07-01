# WMS Playwright Automation

End-to-end automation for the deployed WMS app.

## Setup

```bash
cd automation/playwright
npm install
npm run install:browsers
cp .env.example .env
```

Fill `.env` with live QA credentials. The `.env` file is ignored by git.

## Run

```bash
npm test
```

Run headed or through the Playwright VS Code extension:

```bash
npm run test:headed
npm run test:ui
```

Finance report only:

```bash
npm run test:finance
```

Enable the Google Sheets assertion only after Railway has Google env vars:

```env
WMS_SYNC_GOOGLE=true
```

The default tests verify:

- admin dashboard can open
- cashier POS route can open
- dashboard shows POS sales by outlet
- weekly movement card is gone
- finance report API returns daily sheet names
- audit log page renders the real table shell
