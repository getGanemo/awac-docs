---
title: "ADR 005 — Some product stacks remain lazy until first use"
---

## Status

Accepted — 2026-05-01

## Context

When migrating from a fixed-template setup to AWaC, every product team in the portfolio needs a decision: create its `agent-stack` immediately, or defer until there is real content?

The reality of two of the products at the moment of cutover was:
- **No specific content** in the old template's `.agents/` for those products. No product-specific rules, skills or workflows.
- **No active project** that needed a stack for those products at the time.

## Decision

Some product stacks are kept as **"lazy"**: registered in the `shortcuts:` section of the registry but **with no repo created**.

```yaml
# <transversal-org>/agent-stack-core/awac.yml/shortcuts
product-c: <product-c-org>/agent-stack    # lazy - repo not created yet
product-d: <product-d-org>/agent-stack    # lazy - repo not created yet
```

When the first project that needs one of these arrives, run `wsp scaffold-stack <org>` to create the repo automatically.

## Options considered

### A. Create every stack upfront

Create `<product-c-org>/agent-stack` and `<product-d-org>/agent-stack` now, empty.

**Pros:**
- Complete topology from day 1.

**Cons:**
- **Debt**: empty repos that nobody maintains. When the first project arrives, somebody has to populate them by hand.
- **Confusion**: the team sees an `agent-stack` that contains nothing useful.
- **Misleading template catalogue**: `<product>-feature` shows up but using it bootstraps an empty stack.

### B. Fully lazy (no shortcut either)

Don't register product-c or product-d in the registry at all. When needed, add the shortcut + create the repo.

**Pros:**
- Zero debt.

**Cons:**
- **Not discoverable**: someone asking "which products are under AWaC?" doesn't see them.
- **Activation friction**: when needed, two steps (register + create) instead of one (create).

### C. Lazy with shortcut registered (the choice)

Register shortcuts in the registry with a `# lazy` comment, but DON'T create the repos until needed.

**Pros:**
- **Discoverable**: they appear in `wsp shortcuts` with a lazy flag.
- **Zero debt**: no empty repos.
- **Minimal activation friction**: run `wsp scaffold-stack <org>`, the shortcut is already there, everything fills in by itself.
- **Clarity**: anyone can see that these products exist but don't have content yet.

**Cons:**
- **If someone tries to use the shortcut before scaffolding**, the CLI fails with `E_REPO_NOT_FOUND`. Mitigable with a specific message for shortcuts marked lazy: "this stack is registered as lazy. Run `wsp scaffold-stack <org>` to create it."

## Consequences

### Positive

- Explicit topology: the team knows which products are planned without having to maintain empty repos.
- Low activation cost: one command.
- The registry reflects organisational reality without over-extending.

### Negative

- Possible initial confusion if someone tries to use a lazy shortcut before scaffolding. Mitigable with good error messages.

## Policy for future stacks

**New products start as lazy if:**
- There is no specific agent content yet (no rules/skills/workflows of their own).
- There is no active project that requires the stack.

**New products start active if:**
- There is content to migrate from the old template.
- There is an imminent project.

## Notes

This decision was taken jointly with [ADR 003](003-product-stacks-named-agent-stack.md) (stack naming) during the design of the initial registry.

## See also

- [`08-creating-new-stack.md`](../08-creating-new-stack.md) — how to activate a lazy stack with `wsp scaffold-stack`.
