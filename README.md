# docs-screenshots

Automated screenshot pipeline for Bitwarden documentation.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
# Fill in .env values
```

## Usage

**1. Generate auth state (run once, or when session expires):**
```bash
npm run auth
```

**2. Run screenshot specs:**
```bash
npm run screenshot        # all projects
npm run screenshot:web    # web only
```

**3. Upload to Contentful:**
```bash
node scripts/upload.js
```

## Authentication

Specs run against an authenticated session saved locally to `auth/storageState.json`. This file is **gitignored** and will never be committed — it only ever exists on your local machine.

To generate it, run `npm run auth`. This opens a real browser window and navigates to the target URL. Log in with your credentials, complete any 2FA, and fully unlock your vault — then return to the terminal and press Enter. The session is saved and the browser closes.

All specs load this saved state at startup, so no credentials ever appear in code.

**Re-run `npm run auth` when:**
- Your session expires
- You switch target environments via `WEB_APP_URL`
- Someone else is setting up the project on their own machine (each person generates their own local session)

## Environments

The target URL is controlled by `WEB_APP_URL` in your `.env` file. If not set, it defaults to `https://vault.bitwarden.com`. To point at a different environment, update `.env` and re-run `npm run auth` to generate a fresh session for that environment.

## Structure

```
auth/           Auth setup script and saved session state (gitignored)
screenshots/    Playwright specs, organized by client
  web/          Web app specs
scripts/        Upload and utility scripts
output/         Generated screenshots (gitignored)
```
