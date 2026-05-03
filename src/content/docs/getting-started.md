---
title: "Getting Started — your first AWaC workspace in 5 minutes"
---

This guide walks you through composing your first AWaC workspace from scratch. It assumes you already use an AI coding agent (Claude Code, Cursor, Codex, Aider, or similar) in your editor.

## Prerequisites

You only need your AI agent configured in your editor. The agent will run the `wsp` CLI on your behalf — you do not need to type commands yourself.

> **Important**: you do not run commands. You talk to the agent; the agent runs the CLI. This guide describes the flow from your perspective.

## Two flow variants

### Variant A — you create the folder first (most natural)

1. **Create an empty folder** on your machine where you organise workspaces. For example: `BillingFeature/`.
2. **Open that folder in your editor** (Claude Code, Cursor, etc.).
3. **Tell the agent** what you want:
   > *"Set this up as an AWaC workspace for a billing feature."*
4. **The agent does the rest**:
   - Runs `wsp templates` to list available templates.
   - Picks an appropriate template (e.g. a generic feature template, or a product-specific one if your team has published one).
   - Runs `wsp init . --template <chosen>` (the `.` means "this folder, do not create a subfolder").
   - Runs `wsp bootstrap`, which clones the declared stacks and any product repositories they reference.
   - Generates `CLAUDE.md` and `AGENTS.md` with the composed context.
   - Confirms: *"Done. Stacks active, repos cloned, workspace ready."*
5. **You keep talking to the agent** about the task. The context is already loaded.

### Variant B — the agent creates the folder too

Useful when you are already inside a generic workspace and want to spin up a new one without leaving your editor.

1. **Tell the agent**:
   > *"Create a new AWaC workspace called `billing-feature`."*
2. **The agent**:
   - Runs `wsp init billing-feature --template <chosen>` (without the `.`, which creates the subfolder).
   - Runs `wsp bootstrap` inside it.
   - Tells you: *"Done, folder created at `./billing-feature/`."*
3. **You open** the folder in your editor when ready.

## What if you do not specify a template?

If you only say *"set this up"*, the agent will not guess. It will ask:

> I found these templates:
>
> | Template | Use case |
> |---|---|
> | `blank` | Minimal workspace |
> | `research-spike` | Research / spike, no product code |
> | `branding` | Brand asset for a product |
> | `<product>-feature` | Feature work on a specific product (if your team published one) |
> | ... | (whatever templates the registry exposes) |
>
> Which one do you want? I also need a name for the workspace.

You pick, and the agent continues.

> **Tip**: the more specific you are in your initial request, the fewer questions the agent asks. *"Set this up as an AWaC workspace using the `<template>` template, name it `billing-feature`"* resolves it without back-and-forth.

## What ends up in your folder after `bootstrap`

```
billing-feature/                   <-- your folder
|-- workspace.yml                  <-- the manifest (written by `wsp init`)
|-- wsp.lock                       <-- pinned SHAs of every stack and repo
|-- CLAUDE.md                      <-- composed context (read by Claude Code)
|-- AGENTS.md                      <-- mirror (read by Codex / Cursor / Aider)
|-- .gitignore                     <-- generated
|-- .agents/                       <-- composed capabilities
|   |-- rules/
|   |-- skills/
|   `-- workflows/
|-- project_management/            <-- cloned (if your stack declares it)
|-- infrastructure/                <-- cloned (if your stack declares it)
`-- ...                            <-- other repos declared by the active stacks
```

Each AI agent that opens this folder finds its context file:
- Claude Code reads `CLAUDE.md`
- Codex / Cursor / Aider read `AGENTS.md`
- Any other modern tool reads one of the two

## While you work

### If your agent edits a rule

If the agent (or you) edits a file inside `.agents/` while working — for example, you discover a stack rule is poorly worded — that change stays **local to the workspace**.

In a future CLI release, a `wsp promote` command will detect which stack the file came from and open a PR against that stack so the improvement propagates to the whole team. For now, if you want to promote an improvement, open the PR manually against the stack repo.

### If upstream stacks advance

When someone merges a PR into a stack you depend on, your workspace **does not auto-update**. When you want to pull the improvements:

> *"Refresh the workspace with the latest stack versions."*

The agent runs `wsp sync`, which fetches updates without overwriting your local changes (it warns you if there is drift).

## Special cases

### Workspace with no specific product (research, branding, thesis)

Ask the agent for the appropriate template:

> *"Set this up as a research spike."*

The agent uses a research template, which only declares lightweight stacks like `[core, mcp, research]` — no product code.

### Ad-hoc workspace with multiple stacks

If your project crosses products:

> *"Set this up with stacks core, aws, and `<my-product>`. Only clone `project_management` for now, not the other repos."*

The agent composes a `workspace.yml` with `include: [project_management]` for that stack and bootstraps it.

### Recreating a disposable workspace

If you deleted the folder and want the same workspace back:

> *"Recreate the `billing-feature` workspace using the `<same-template>` template."*

If you kept the old `workspace.yml`, even better: `wsp bootstrap` against that folder recreates it identically. If you also kept `wsp.lock`, the recreation pins **the exact SHAs** of each stack/repo at the original moment (temporal reproducibility).

## Two things to remember

1. **`wsp init`** creates the structure (the `workspace.yml`). **`wsp bootstrap`** materialises it (clones stacks and repos).
2. **The agent does it for you.** You only describe what you want.

## Next steps

- To understand why AWaC is shaped this way, see [Architecture](/architecture/).
- To learn how to publish your own stack, see [Create a new stack](/creating-new-stack/).
- If your workspace will be shared by more than one person, see [Workspace repo layout](/workspace-repo/).
- If you have a specific question, see the [FAQ](/faq/).
