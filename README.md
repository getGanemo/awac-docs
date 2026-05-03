# awac-docs

Public source for the [AWaC](https://github.com/getGanemo/workspace-cli) (Agent Workspace as Code) documentation site.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build), deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site -> ./dist
npm run preview
```

## Content layout

```
src/content/docs/
  index.mdx                      # homepage (splash hero)
  getting-started.md             # install + first workspace
  architecture.md                # manifest, stacks, composition, lockfile
  manifest-reference.md          # workspace.yml schema
  stack-reference.md             # awac.yml schema (stack metadata + registry)
  cli-reference.md               # every wsp command
  templates.md                   # template authoring
  creating-new-stack.md          # how to publish your own stack
  workspace-repo.md              # workspace repo conventions
  agent-context-files.md         # CLAUDE.md / AGENTS.md
  faq.md                         # what AWaC is and isn't
  governance.md                  # mirror + check
  migration-from-template.md     # migrating off a fixed template
  deploy-and-secrets.md          # deploy + devvault
  decisions/                     # ADRs (001-014, append as we go)
```

## Editing

Most pages live in `src/content/docs/` as plain Markdown with Starlight frontmatter. The "Edit on GitHub" link in the rendered page deep-links to the file in this repo on `main`.

For ADRs, follow the existing numbering (`NNN-title.md`) and link them from `decisions/README.md`.

## Deploy

Pushes to `main` deploy automatically via Cloudflare Pages connected to this repo. The build command is `npm run build`; the output dir is `dist`.

## License

MIT — see [LICENSE](LICENSE).
