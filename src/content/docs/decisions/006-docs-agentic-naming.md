---
title: "ADR 006 — Naming the documentation repo for AWaC and agent practices"
---

## Status

Accepted — 2026-05-02

## Context

A team adopting AWaC needs to choose where to put its internal documentation about how it works with AI agents. The natural pattern in many orgs is `docs-<scope>`:

- `docs-company` — company-wide policies, culture, talent.
- `docs-treasury` — treasury team processes.
- `docs-odoo` — technical Odoo documentation.

The question: **how do we name the new repo that documents AWaC and other agent-related practices?**

## Decision

**`<transversal-org>/docs-agentic`**, with description: *"How the team works with AI agents — methodologies, conventions, and shared practices for agent-driven and cross-team collaboration."*

AWaC lives as `docs-agentic/awac/`. Sibling practices (`prompts/`, `skills/`, `evaluation/`, etc.) come in as sibling folders when they emerge.

> The public version of these docs is hosted in a separate repo (`<transversal-org>/awac-docs`, this site). The internal `docs-agentic` repo can stay private and capture team-specific context (audits, postmortems, internal decisions).

## Options considered

### A. `docs-engineering`

**Pros:**
- Captures "engineering as practice".

**Cons:**
- **Team bias**: AWaC is cross-functional — used by engineering, support, consulting, marketing, finance. Calling it "engineering" semantically excludes other roles.
- With vibecoding and AI agents, the line between roles blurred. Documenting under "engineering" reproduces an old silo.

### B. `docs-practices`

**Pros:**
- Plural, neutral, scalable.

**Cons:**
- **Breaks the existing pattern**: in this taxonomy `docs-<X>` means "X = domain". `practices` is not a domain — it's a **type of content** that already lives inside each `docs-<X>` (treasury has its practices, HR has its own).
- Putting it at the same level as `docs-treasury` creates confusion: "are these treasury practices? general practices?".

### C. `docs-awac`

**Pros:**
- Concrete, clear identity.
- Matches the existing pattern.

**Cons:**
- **Too narrow**: AWaC will have sibling practices (prompt patterns, skills creation, evaluation, etc.) that are also "how the team works with agents". If each becomes its own `docs-X`, sprawl.
- Pre-supposes that AWaC is the only thing that deserves this level of documentation. Probably not.

### D. `docs-agentops`

**Pros:**
- Industry-standard term (parallel to DevOps, MLOps).

**Cons:**
- **Too technical/jargon**: "Ops" carries an engineering/infra connotation. Non-technical teams (marketing, support, consulting) might find it excluding, contradicting the cross-functional goal.

### E. `docs-agentic` (the choice)

**Pros:**
- Captures the broad domain: agent management + agent-mediated collaboration.
- "Agentic" is an emerging adjective recognised across teams.
- **Cross-functional by construction**: it's not a team, it's a functional domain.
- Distinguishable from team-domain naming (there is no "agentic team", that does not exist).
- **Future-proof**: sibling practices (prompts, skills, evaluation) come in as subfolders without sprawl.

**Cons:**
- Need to clarify that it's NOT team-scoped (done in the repo README).

## Consequences

### Positive

- Clear repo, accessible to all teams, scalable to future practices.
- Naming pattern consistent with `docs-<domain>`.
- AWaC has its own space (`docs-agentic/awac/`) without needing a dedicated repo.
- Coexists without overlap with `docs-treasury`, `docs-hr`, etc. (team-domain) and `docs-odoo` (tech-specific).

### Negative

- **Learning curve for the term "agentic"**: for someone unfamiliar with it, it needs explanation.
  - Mitigation: the repo README explains it on the first line.
- **If other technical practices that are NOT agentic emerge** (e.g. git conventions, secrets management) that don't fit in `docs-agentic`, they might end up in `docs-company` (engineering handbooks) or a new repo. Decided when they appear.

## When to create a new `docs-X` repo (criteria)

To avoid future sprawl, a new `docs-X` is created when X meets:

1. **It has a recognisable proper name** (e.g. AWaC, Treasury, agentic).
2. **It has an identifiable owner**.
3. **It has its own life cycle** (versions, evolution).
4. **It's a domain (not a content type)**.
5. **It coexists with other `docs-X` without semantic overlap**.

AWaC met 4 of 5 (it's not a domain in itself, it's a practice within the agentic domain). That's why `docs-agentic` (the domain) was chosen over `docs-awac` (the practice).

## Notes

Iteration during the design:
1. First proposal: `docs-engineering` → rejected for team bias.
2. Second proposal: `docs-practices` → rejected for breaking the naming pattern.
3. Third proposal: `docs-awac` → rejected for being too narrow.
4. Fourth proposal: `docs-agentic` → accepted.

## See also

- [`README.md`](../README.md) — overview of AWaC inside the docs site.
