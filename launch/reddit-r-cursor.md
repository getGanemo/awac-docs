# Reddit r/cursor

> Posting time: **Tuesday/Wednesday 09:00–13:00 ET**, like r/ClaudeAI.
> r/cursor users care about IDE integration + practical workflow; pitch differently than r/ClaudeAI.

## Title

`Built a CLI to compose Cursor / agent rules from versioned shared repos — open source`

## Body

```
Sharing something I built that solved a real pain for me — wanted to see
if anyone else feels this.

The problem: I use Cursor (and a few other agents) across maybe a dozen
projects. Every project has its .cursorrules / .agents/ / CLAUDE.md, and
they slowly diverge. New project starts as a copy-paste from the last
one. Updating a rule means updating it in N places.

What I built: AWaC (Agent Workspace as Code). A small CLI that lets you
declare your workspace's tooling in a `workspace.yml`, list the "stacks"
you want (core, aws, mcp, etc. — these are versioned GitHub repos), and
compose them into your project deterministically.

Concretely:

  workspace.yml:
    name: my-feature
    schema: workspace/1
    stacks:
      - core
      - aws
      - <my-product>/agent-stack

  $ wsp bootstrap
  → clones stacks
  → composes .agents/{rules,skills,workflows}/
  → writes CLAUDE.md + AGENTS.md
  → emits workspace.lock.yml (reproducible)

Why this is interesting for r/cursor specifically:

- Both .cursorrules-style content and CLAUDE.md content compose from the
  same source (in stacks, you author once and it lands as both).
- The composition is deterministic — your teammate runs `wsp bootstrap`
  and gets exactly your workspace.
- Stacks are plain GitHub repos. You can fork them, add your own, replace
  the public ones.
- 100% local. No SaaS, no telemetry. MIT licensed.

Things I haven't done yet (would love a hand):

- A stack specifically for Cursor IDE quirks (custom rules, context
  patterns, MCP servers Cursor users love).
- An IDE extension that runs `wsp bootstrap` from the command palette.
- More language-stack templates (Rails, Django, Phoenix, etc.).

Repo: github.com/getGanemo/workspace-cli
Docs: github.com/getGanemo/awac-docs

Try it (1 minute install via pipx, see the readme). Tell me what's wrong
with the model — that's the thing I most want to hear right now.
```

## Anticipated comments

| Likely comment | Response |
|---|---|
| "Not Cursor-specific enough" | Fair. Looking for a Cursor-experienced contributor to seed `agent-stack-cursor`. |
| "I just use a dotfile sync" | Same idea, more disciplined. AWaC adds versioning + composition + lockfile. |
| "How does this compare to <other tool>?" | Show the differences honestly. Don't trash competitors. |
