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
npm run screenshot                                                 # all projects
npm run screenshot:web                                             # admin console only
npm run screenshot:passwordmanager                                 # password manager only
npx playwright test screenshots/web/policies.spec.js               # specific spec
```

Output is written to the terminal and automatically saved to `last-run.log` for inspection.

## Debugging

When a spec fails, check the log:

```bash
cat last-run.log
```

Playwright also writes an `error-context.md` file to the `output/` directory for each failed test, containing the page snapshot and test source at the point of failure. These are useful for diagnosing wait selector issues.

## Authentication

Specs log in automatically using `BW_EMAIL` and `BW_PASSWORD` from `.env`. The login helper (`screenshots/web/helpers/login.js`) handles the full flow including dismissing any post-login prompts that appear after login.

**Requirements:**
- Email verification must be disabled on the account
- `BW_EMAIL` and `BW_PASSWORD` must be set in `.env`

**Important:** Bitwarden does not persist session tokens to `localStorage` in local development builds, so saved session state (`storageState`) cannot be reused across specs. Each spec performs a full login. To avoid rate limiting, specs run sequentially (`workers: 1`) and specs that require multiple screenshots on the same page perform all captures in a single test rather than separate tests.

## Environments

The target URL is controlled by `WEB_APP_URL` in `.env`. If not set, it defaults to `https://vault.bitwarden.com`. Two environments are documented in `.env.example`:

- `https://vault.bitwarden.com` — production
- `https://vault.qa.bitwarden.pw` — QA

After changing `WEB_APP_URL`, no other changes are needed — all specs read from `.env` at runtime.

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

## Known limitations

- **Session persistence:** Bitwarden's web vault keeps auth tokens in memory rather than `localStorage` in local dev builds. `storageState` cannot be used to share sessions across specs — each spec logs in independently.
- **Rate limiting:** Running many specs back-to-back can trigger login rate limiting. `workers: 1` mitigates this by running specs sequentially. Specs that need multiple screenshots on one page (e.g. `vault.spec.js`) consolidate all captures into a single test to minimize logins.
- **Self-signed certificates:** Local environments using `https://localhost` require `ignoreHTTPSErrors: true` in `playwright.config.js`, which is already set.
- **Viewport and layout:** The viewport is set to 1280×1100. Some pages use `min-height: 100vh` layouts that expand to fill the viewport — `fullPage: true` may capture excess whitespace on these pages. The current viewport height was chosen to minimize this for most pages.

## Specs

See [SPECS.md](./SPECS.md) for a full list of specs and their outputs.

## Structure

```
screenshots/              Playwright specs, organized by area
  web/                    Admin Console specs
    helpers/              Shared helpers (login.js)
  passwordmanager/        Password Manager specs
scripts/                  Upload and utility scripts (Contentful pipeline — Phase 2)
output/                   Generated screenshots (gitignored)
last-run.log              Output from the most recent run (gitignored)
```
