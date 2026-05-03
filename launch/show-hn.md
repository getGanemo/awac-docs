# Show HN — three drafts

> Recommended posting time: **Tuesday or Wednesday, 09:00–12:00 ET** (peak HN traffic for technical audience). Avoid Mondays (worse engagement) and weekends (lower volume).
> Title length: **60–80 chars**. HN allows 80 max. Don't prepend "[Show HN]" — the form does it for you.

## Variant A — problem-first

**Title:** `Show HN: AWaC – stop copy-pasting agent rules across projects`

**URL:** `https://github.com/getGanemo/workspace-cli`

**Comment (first comment by author, posted ~30s after submission):**

```
Author here. AWaC (Agent Workspace as Code) came out of a frustration that
will sound familiar if you've used Claude Code, Cursor, or Aider seriously
across more than two projects: the .agents/ folder (or CLAUDE.md, or
.cursorrules, or whatever your tool calls it) starts as a copy-paste from
the last project, then quietly drifts. Six weeks later your AWS rule says
one thing in repo A and a slightly different thing in repo B and nobody
remembers which is right.

So I borrowed the Terraform pattern: a workspace.yml manifest, versioned
"stack" repos that hold rules/skills/workflows by topic, and a CLI (`wsp`)
that resolves and composes them deterministically. Add `aws` to your
manifest, get the AWS safety rules. Add `mcp`, get the MCP bootstrap
patterns. Same composition, same lockfile, same workspace on every machine.

The CLI is 100% local, MIT licensed, pipx-installable. The reference
stacks (core, aws, mcp, cloudflare, research) live in plain GitHub repos
(getGanemo/agent-stack-*). You can publish your own stacks and point your
manifest at them; nothing in this stack is hardcoded to my org.

I shipped 14 ADRs while building it because every design choice had a
"why are you doing it this way" explanation that needed recording. They're
all in the docs repo and worth a skim if you're considering this pattern
for your own setup.

Things I'd love feedback on:
1. The schema (workspace.yml + awac.yml) — is anything obviously missing?
2. The CLI surface — is `wsp doctor` doing the right diagnostics?
3. The agent-first error format (code + category + cause + remediation) —
   does this play well with how Claude / Cursor / Aider already react to
   command output, or does it just add noise?

Quick try:
  TAG=$(gh release view --repo getGanemo/workspace-cli --json tagName -q .tagName)
  gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
  pipx install /tmp/wsp/wsp-*.whl
  wsp init my-feature --template blank
  wsp bootstrap

Happy to answer anything.
```

## Variant B — solution-first

**Title:** `Show HN: AWaC – Terraform-style workspace composition for AI coding agents`

**URL:** `https://github.com/getGanemo/workspace-cli`

**Comment:**

```
Author here. AWaC (Agent Workspace as Code) lets you declare an AI-agent
workspace in a workspace.yml file and compose it from versioned stack
repos. Same idea as Infrastructure as Code, applied to the .agents/
folder (or CLAUDE.md, or .cursorrules — whatever your agent reads).

In one yaml:
  stacks:
    - core
    - aws
    - mcp
    - my-product/agent-stack

`wsp bootstrap` resolves the stacks, clones the repos they declare,
composes .agents/{rules,skills,workflows}/, writes CLAUDE.md + AGENTS.md
deterministically, and emits a lockfile. Idempotent. No drift, no copy-paste.

The CLI is MIT licensed, pipx-installable, local-only, agent-first
(every command emits structured errors with code/category/cause/
remediation so agents can react programmatically).

It started as Ganemo's internal tooling and got open-sourced once it was
load-bearing for the internal team. The public reference stacks (core,
aws, mcp, cloudflare, research) live in plain GitHub repos. You can
compose them, fork them, or replace them.

Docs + 14 ADRs at https://github.com/getGanemo/awac-docs.
```

## Variant C — gap in the ecosystem

**Title:** `Show HN: There's no "Terraform for agent workspaces" – AWaC is my attempt`

**URL:** `https://github.com/getGanemo/workspace-cli`

**Comment:**

```
Author here. There's a missing layer in the AI coding tooling ecosystem.

We have great agents (Claude Code, Cursor, Aider, Codex, Continue). We
have rule and skill conventions (CLAUDE.md, AGENTS.md, .cursorrules,
.aider.conf.yml). We have MCP servers, scripts, agent-readable docs.

What we don't have is a way to **declare** a workspace's tooling
composition once and reproduce it deterministically across machines and
projects. Every team I've talked to copy-pastes their .agents/ folder
between repos and watches it slowly diverge.

I built AWaC as the missing layer. It's a small CLI (`wsp`) plus a manifest
schema (`workspace.yml`) plus a stack convention (one repo per topic of
rules/skills/workflows + a registry).

If you're already happy hand-crafting CLAUDE.md per project, you don't
need this. If you've ever opened a fresh repo and thought "ugh, I have
to redo all my agent config", AWaC might fit.

MIT licensed, github.com/getGanemo/workspace-cli. Reference stacks under
the same org. Docs at github.com/getGanemo/awac-docs.

What I want from this thread: tell me what's wrong with the abstraction.
What rule/skill of yours doesn't fit cleanly?
```

## Hooks for A/B testing the title

If the chosen variant doesn't get traction in the first 30 minutes, alternates:

- `Show HN: I built a Terraform-style CLI for AI agent workspaces`
- `Show HN: Versioned, composable .agents/ folders for Claude / Cursor / Aider`
- `Show HN: AWaC – declare your AI-agent tooling once, reproduce it everywhere`
- `Show HN: An attempt at fixing the .agents/ drift problem`

## Follow-up channels

Within 48 hours of HN post (regardless of ranking):
- X/Twitter thread (see `twitter-thread.md`).
- LinkedIn post (see `linkedin-post.md`).
- dev.to long-form (see `dev-to-blog.md`).
- Reddit r/ClaudeAI + r/cursor (see corresponding files).
