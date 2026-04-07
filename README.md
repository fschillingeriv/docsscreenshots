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
npm run screenshot                                    # all projects
npm run screenshot:web                                # web only
npx playwright test screenshots/web/policies.spec.js  # specific spec
```

## Authentication

Specs log in automatically using credentials from `.env`. Bitwarden's web vault keeps session tokens in memory rather than persisting them to `localStorage` or cookies, which means saved session state cannot be restored across browser contexts. For this reason, the full login flow runs at the start of every screenshot run — with email verification disabled on the account, this adds only a few seconds.

**Requirements:**
- Email verification must be disabled on the account used for screenshots
- `BW_EMAIL` and `BW_PASSWORD` must be set in `.env`

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
scripts/              Upload and utility scripts (Contentful pipeline — Phase 2)
output/               Generated screenshots (gitignored)
```
