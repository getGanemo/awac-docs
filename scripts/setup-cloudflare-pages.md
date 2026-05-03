# Cloudflare Pages — awac.ganemo.com

The site is deployed at <https://awac.ganemo.com> via Cloudflare Pages
(project name: `awac-docs`).

## Status

- **Project**: `awac-docs`
- **Subdomain**: `awac-docs.pages.dev`
- **Custom domain**: `awac.ganemo.com` (active, status verified, CA: Google Trust Services)
- **DNS**: CNAME `awac.ganemo.com → awac-docs.pages.dev` in zone `ganemo.com`, proxied through Cloudflare.
- **SSL**: Universal TLS issued automatically by Cloudflare.

## Deploy mode: Direct Upload + GitHub Action

Pages projects can be either GitHub-connected (OAuth) or Direct Upload.
This project uses **Direct Upload** with a GitHub Action that runs
`wrangler pages deploy dist --project-name=awac-docs` on push to `main`.

### Required GitHub secrets (set once)

The `Deploy to Cloudflare Pages` workflow at `.github/workflows/deploy.yml`
needs two secrets:

- `CLOUDFLARE_API_TOKEN` — token with `Account.Cloudflare Pages:Edit`
  scope. Reuse the existing `api_token_pages` from
  `~/.devvault/providers/cloudflare.yml` or create a new one in
  the CF dashboard → My Profile → API Tokens.
- `CLOUDFLARE_ACCOUNT_ID` — `0a0bbf33ec9e54b7ebcccc08af6bcb35`.

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo getGanemo/awac-docs --body "<token>"
gh secret set CLOUDFLARE_ACCOUNT_ID --repo getGanemo/awac-docs --body "0a0bbf33ec9e54b7ebcccc08af6bcb35"
```

After secrets are set, every push to `main` triggers the workflow,
builds Astro Starlight, and uploads `dist/` to Pages. New version goes
live within 1-2 minutes.

## Manual deploy (escape hatch)

If the workflow fails or you want to deploy from local:

```bash
export CLOUDFLARE_API_TOKEN="cfut_..."
export CLOUDFLARE_ACCOUNT_ID="0a0bbf33ec9e54b7ebcccc08af6bcb35"
npm install
npm run build
npx wrangler pages deploy dist --project-name=awac-docs --branch=main
```

## Verify

```bash
curl -sI https://awac.ganemo.com | head -5
# Expect: HTTP/1.1 200 OK, server: cloudflare
```

## Why Direct Upload + Action and not GitHub-connected?

Cloudflare Pages' GitHub Connected mode requires an OAuth grant that
can only be done in the browser dashboard. Direct Upload + Action gives
the same outcome (auto-deploy on push) without an OAuth step.
