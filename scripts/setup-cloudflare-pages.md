# Cloudflare Pages setup for awac.ganemo.com

Cloudflare's Pages API requires an Account-scoped token; the current token
in `~/.devvault/providers/cloudflare.yml` is Zone-scoped only. Do these
5 clicks in the Cloudflare dashboard, then the site is live.

## Steps

1. **Sign in** to <https://dash.cloudflare.com> with the Ganemo account.
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Authenticate against `getGanemo` GitHub org. Select **`awac-docs`** repository (the one without `-oss` — see governance note below).
4. Configure the build:
   - **Project name**: `awac-docs`
   - **Production branch**: `main`
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node version**: `20`
5. **Save and Deploy**.

When the first build completes, Pages assigns the project a URL like
`awac-docs-<hash>.pages.dev`. Note that URL.

## Custom domain

In the Pages project → **Custom domains** → **Set up a custom domain**:

- Domain: `awac.ganemo.com`
- Click **Activate domain**.

Cloudflare creates the necessary DNS record automatically (CNAME from
`awac` in zone `ganemo.com` to the `*.pages.dev` URL). It also issues a
Universal SSL certificate.

Verify in 2-5 minutes:

```bash
curl -sI https://awac.ganemo.com | head -5
# Expect: HTTP/2 200, server: cloudflare
```

## Why awac-docs and not awac-docs-oss?

Per `governance/product-structure.md`, repos prefixed with `docs-` are
internal knowledge documentation. The AWaC public docs site is a
discrete project — it gets its own canonical name, not the `docs-`
prefix. The `-oss` sufix is reserved for the public OSS-counterparts
of repos that have private internal counterparts. AWaC docs has no
private internal counterpart (the canonical doc lives in the same
repo), so no suffix is needed.

This is documented in the governance doc under "naming exceptions for
OSS docs sites".
