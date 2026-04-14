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

```bash
npm run screenshot        # all projects
npm run screenshot:web    # web only
npx playwright test screenshots/web/policies.spec.js  # specific spec
```

Before the suite runs, Playwright automatically logs in once via `global-setup.js` and saves the session to `auth/storageState.json`. All specs reuse that session — no per-spec login.

## Authentication

Login is handled once per suite run by `global-setup.js`. It logs in headlessly, saves the session to `auth/storageState.json`, and all specs load that state automatically.

**Requirements:**
- Email verification must be disabled on the account
- Vault timeout must be set to **Never** (so the token is persisted to `localStorage`)
- `BW_EMAIL` and `BW_PASSWORD` must be set in `.env`

**If the session expires or `storageState.json` is missing**, just re-run `npm run screenshot:web` — global setup runs automatically at the start of every suite run.

**Reverting to per-spec login:** If the global setup approach stops working, restore `playwright.config.backup.js` → `playwright.config.js` and `screenshots/web/helpers/login.backup.js` → `screenshots/web/helpers/login.js`, then re-add `await login(page)` calls to each spec.

## Environments

The target URL is controlled by `WEB_APP_URL` in `.env`. If not set, it defaults to `https://vault.bitwarden.com`.

## Configuration

All configuration lives in `.env`. Copy `.env.example` to get started:

| Variable | Description | Default |
|---|---|---|
| `WEB_APP_URL` | Target web vault URL | `https://vault.bitwarden.com` |
| `ORG_ID` | Your Bitwarden organization GUID | _(required for org-scoped specs)_ |
| `BW_EMAIL` | Login email for the screenshot account | _(required)_ |
| `BW_PASSWORD` | Master password for the screenshot account | _(required)_ |

Your org GUID can be found in the URL when navigating to your organization in the web vault:
`https://vault.bitwarden.com/#/organizations/<ORG_ID>/...`

## Specs

See [SPECS.md](./SPECS.md) for a full list of specs and their outputs.

## Structure

```
screenshots/          Playwright specs, organized by client
  web/                Web app specs
    helpers/          Shared helpers (login.js)
scripts/              Upload and utility scripts (Contentful pipeline — Phase 2)
output/               Generated screenshots (gitignored)
global-setup.js       Runs once before the suite — logs in and saves session
playwright.config.js  Playwright configuration
```
