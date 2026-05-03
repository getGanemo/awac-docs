# X / Twitter — launch thread

> Recommended posting time: **Tuesday or Wednesday, 13:00–15:00 UTC** (after EU lunch, before US morning). Pin to profile for 7 days.
> Total length: 8 tweets. Each ≤ 280 chars (Twitter limit). First and last get the most engagement — make them count.

## Primary thread (English)

**Tweet 1/8 — hook**
```
Anyone using Claude Code / Cursor / Aider seriously hits two walls:

1. Drift: rules diverge across projects within weeks
2. Bloat: every .agents/ ends up a 200-file mess

I built a small thing. Spent a year inside the problem. Open-sourcing it today.

🧵
```

**Tweet 2/8 — show, don't tell**
```
AWaC = "Agent Workspace as Code".

You declare your workspace once in a yaml:

  schema: workspace/1
  stacks:
    - core
    - aws
    - mcp
    - your-product/agent-stack

A CLI (wsp) resolves it, clones the stacks, composes .agents/, writes
CLAUDE.md + AGENTS.md.

Same workspace. Every machine.
```

**Tweet 3/8 — the Terraform parallel**
```
The mental model is Infrastructure as Code, but for the layer above your
code: the rules, skills, workflows your AI agents read.

`workspace.yml` = main.tf
versioned stack repos = modules
`wsp bootstrap` = terraform apply
`workspace.lock.yml` = .terraform.lock.hcl
```

**Tweet 4/8 — the unlock**
```
Once you have versioned stacks, the unlock is huge:

- Add `aws` → AWS safety rules everywhere
- Add `mcp` → MCP setup for free
- Update one rule in one stack → propagates to every workspace on next sync
- Lockfile makes it reproducible across teammates and CI

No more copy-paste. No more drift.
```

**Tweet 5/8 — agent-first**
```
The CLI is agent-first by design.

Every command emits machine-readable JSON. Errors carry:
- `code` (stable identifier)
- `category` (why)
- `cause` (what went wrong)
- `remediation` (what to do)

So your agent can read the output, fix the problem, retry. Without
hand-holding.
```

**Tweet 6/8 — local-first**
```
Important: 100% local. No SaaS, no telemetry, no backend.

Stacks live in plain GitHub repos. The CLI is pipx-installable. MIT
licensed.

You own everything. Fork it, vendor it, embed it in your team's setup.
```

**Tweet 7/8 — quick try**
```
Try it in 90 seconds:

  TAG=$(gh release view --repo getGanemo/workspace-cli --json tagName -q .tagName)
  gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
  pipx install /tmp/wsp/wsp-*.whl
  wsp init my-feature --template blank
  wsp bootstrap

You get .agents/, CLAUDE.md, lockfile.
```

**Tweet 8/8 — call to action**
```
github.com/getGanemo/workspace-cli

14 ADRs documenting every design choice — useful even if you don't adopt
AWaC, just to see how someone else thought through the problem.

Tell me what's wrong with the abstraction. The faster I find out, the
faster v1 gets better.
```

## Spanish version (LATAM/Spain audience — separate thread)

**Tweet 1/8**
```
Si usás Claude Code, Cursor o Aider en serio, te chocaste con dos paredes:

1. Drift: las reglas divergen entre proyectos en semanas
2. Bloat: cada .agents/ termina siendo 200 archivos que nadie controla

Construí algo. Pasé un año dentro del problema. Hoy abro el código.

🧵
```

(Same body in Spanish, same structure. Translate iteratively per tweet — keep the tone direct, technical, no marketing-speak.)

## Hooks alternatives for tweet 1 (A/B)

If the primary hook doesn't land in 1 hour:

- `"Spent a year copy-pasting CLAUDE.md across projects. Open-sourced the fix today."`
- `"There's no Terraform for agent workspaces. Until now."`
- `"Drift is the silent killer of AI-agent productivity. Here's the pattern that fixes it."`
- `"I built the agent workspace manager I wished existed. MIT, local-only, pipx-install."`

## Follow-up tweets (post-thread)

Day 1+2: reply with screenshots of `wsp bootstrap` output, `.agents/` structure.
Day 3: thread on the 14 ADRs — pick the most contentious one (#7 agent-first, or #12 GitHub Releases not PyPI).
Day 5: reply to anyone who quoted with a shorter pitch.
Day 7: results-so-far update (stars, issues, top-3 surprises from feedback).
