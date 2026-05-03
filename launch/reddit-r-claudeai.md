# Reddit r/ClaudeAI

> Recommended posting time: **Tuesday/Wednesday 09:00–13:00 ET**.
> Avoid weekends. Subreddit values genuine technical content; mod-strict on self-promo.
> Always read the latest sticky rules before posting.

## Title

`I built a Terraform-style CLI for managing Claude Code workspaces — open-sourced today`

(Avoid "Show HN" framing. Reddit hates it. Lean into "I built" + concrete value.)

## Body

```
TL;DR: AWaC (Agent Workspace as Code) is a small CLI + manifest schema +
stack convention to declare your Claude Code workspace declaratively
and compose .agents/ + CLAUDE.md from versioned repos. MIT, local-only,
pipx-installable. github.com/getGanemo/workspace-cli

---

The problem (skip if you've felt it):

I run Claude Code across ~12 projects. After a few months, the .agents/
folder in each project had drifted — the AWS safety rule was a slightly
different paragraph in 4 places, the deploy skill was 3 versions in
parallel, and onboarding a new contributor meant "copy-paste from the
last project and hope".

The pattern (Terraform-borrowed):

  1. workspace.yml manifest declares which "stacks" the workspace uses.
  2. Stacks are plain GitHub repos (one per topic: core, aws, mcp,
     cloudflare, research, your-product).
  3. CLI `wsp` resolves the manifest, clones the stacks, composes
     .agents/{rules,skills,workflows}/, generates CLAUDE.md (canonical)
     + AGENTS.md (mirror), writes a lockfile.
  4. Same workspace, every machine. Update one stack, refresh all
     workspaces with `wsp sync`.

Concrete example, this is the entire workspace.yml of a new feature
workspace I just spun up:

  schema: workspace/1
  name: my-feature
  stacks:
    - core           # universal rules (anti-prompt-injection, git, learnings)
    - aws            # AWS safety + terraform parity
    - mcp            # MCP setup conventions
    - <product>/agent-stack    # product-specific stack

`wsp bootstrap` and you have a working .agents/ with ~50-150 files
composed deterministically.

What's nice for Claude Code specifically:

- CLAUDE.md is the canonical context file (per Anthropic docs).
- AGENTS.md is generated as a mirror so other agents (Codex, Cursor,
  Aider) can reuse the same rules.
- Skills get composed automatically from the active stacks.
- The CLI emits errors with `code` + `category` + `cause` + `remediation`
  fields so Claude can react to them programmatically (it doesn't have
  to guess what failed).

What I want from you:

- Honest feedback on the abstraction. What rule of yours doesn't fit?
- Stack ideas — what topical bundle should exist that I haven't built?
- Bugs. The CLI has 56 tests but real-world use will find edge cases.

Quick try (3 commands):

  TAG=$(gh release view --repo getGanemo/workspace-cli --json tagName -q .tagName)
  gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
  pipx install /tmp/wsp/wsp-*.whl

Then `wsp init my-test --template blank && cd my-test && wsp bootstrap`.

Repo: github.com/getGanemo/workspace-cli
Docs + 14 ADRs: github.com/getGanemo/awac-docs

Built solo, MIT licensed, no SaaS planned (ADR 014 explains why). I'll
respond to every comment that comes in over the next week.
```

## Anticipated comments + responses

| Likely comment | My response |
|---|---|
| "Why not just CLAUDE.md and a script?" | Works for 1-2 projects. Breaks at scale: drift, no versioning, no composition. Same answer Terraform gives to "why not just bash + AWS CLI". |
| "Why not PyPI?" | ADR 012 in the docs. GitHub Releases works for the agent-driven install path; PyPI on the roadmap once OSS adoption signals demand. |
| "Looks like overkill" | If you have 1-2 projects, it is. The pattern earns its complexity at 5+ workspaces or a team using the same tooling across repos. |
| "Will this work with Cursor / Aider / Codex?" | Yes — CLAUDE.md + AGENTS.md are written together, and the .cursorrules contract is on the roadmap (issue welcome). |
| "How do I publish my own stack?" | Any GitHub repo with awac.yml + a `.agents/{rules,skills,workflows}/` tree is a stack. See `creating-new-stack.md` in the docs. |
