# docs-screenshots

Automated screenshot pipeline for Bitwarden documentation.

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env values
```

## Usage

**1. Generate auth state (run once, or when session expires):**
```bash
node auth/setup-auth.js
```

**2. Run screenshot specs:**
```bash
npx playwright test
```

**3. Upload to Contentful:**
```bash
node scripts/upload.js
```

## Structure

```
auth/           Auth setup script and saved session state (gitignored)
screenshots/    Playwright specs, organized by client
  web/          Web app specs
scripts/        Upload and utility scripts
output/         Generated screenshots (gitignored)
```
