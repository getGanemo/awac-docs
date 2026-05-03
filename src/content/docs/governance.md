---
title: "Governance: AWaC + product structure + ownership"
---

How AWaC and broader repo governance fit together: what is authoritative, where it lives, who owns it, and how changes propagate. This page describes the **pattern**; concrete URLs and owners are decisions each adopting team makes for itself.

## The two levels of governance

AWaC governance has two layers that travel together:

| Layer | What it owns | Where it lives |
|---|---|---|
| **Product structure** (atemporal canonical) | What repos a product must have, naming rules, categories A–E, branch defaults, visibility rules. | A canonical doc in your team's docs repo (e.g. `docs-company/governance/product-structure.md`) — humans + agents read this. |
| **Machine-readable mirror** | The same rules expressed as YAML so the `wsp` CLI can consume them at scaffold/audit time. | `<transversal-org>/agent-stack-core/awac.yml#org_scaffold`. |

**Same-PR rule**: any change to either side MUST propagate to the other in the same PR. This is enforced by `wsp governance check` (which any developer can run locally) and by the `governance_mirror` step in `wsp doctor`.

## Live snapshot per product

The canonical doc above is **atemporal** — it describes what a product looks like, not the current state of any specific product. The current state (what is missing, what is pending) lives in a separate audit document (e.g. `docs-company/governance/product-structure.audit.md`).

When a product reaches full alignment, its section moves to a "Productos alineados" list with a closing date.

## How `wsp` consumes governance

Three integration points:

1. **`wsp scaffold-stack <org>`** — introspects `<org>` via `gh`, classifies each repo into Cat A/B/C/D using the rules from `org_scaffold`, and seeds the agent-stack `awac.yml#repos` accordingly.
2. **`wsp scaffold-repo <full> --category <X>`** — applies the per-category README convention defined alongside the category rules. New repo → creates with the right description + private/public + branch_default. Existing repo → audits the README against the category checklist and opens a PR with the missing required sections.
3. **`wsp governance check`** — clones the canonical governance repo, parses the canonical doc, and asserts that `agent-stack-core/awac.yml#org_scaffold` does not diverge on key invariants (5 categories present, Cat A/B/D repos, forbidden_names, excluded_names). Same check runs as a step inside `wsp doctor`.

## Ownership

### Stack ownership

A stack repo has a **single owner** (or a small owner pool for `core`). As a product team matures, ownership of `<product-org>/agent-stack` transfers to that product's functional lead. `<transversal-org>/agent-stack-core` keeps a broader review pool because changes there ripple through every workspace.

Sample ownership matrix (each adopting team fills this in for itself):

| Stack | Owner |
|---|---|
| `<transversal-org>/agent-stack-core` | core maintainer + 1-2 senior reviewers |
| `<transversal-org>/agent-stack-aws` | infra/DevOps lead |
| `<transversal-org>/agent-stack-mcp` | core maintainer |
| `<transversal-org>/agent-stack-cloudflare` | infra/DevOps lead |
| `<transversal-org>/agent-stack-research` | research lead |
| `erp-partners/agent-stack` | functional Odoo lead |
| `<product-org>/agent-stack` (one row per product) | product lead |

### Asset ownership inside a stack

Per the `transversal_vs_product` test (codified in `org_scaffold` and expanded in the meta-skills `create_skill` / `create_agent_rule`):

- **Universal asset** (applies to any product) → `<transversal-org>/agent-stack-core/`.
- **Topical transversal** (applies to all products using a tech) → `<transversal-org>/agent-stack-<topic>/` (`aws`, `mcp`, `cloudflare`, `research`).
- **Cross-org by ecosystem** (Odoo conventions used by multiple products) → `erp-partners/agent-stack/`. Despite the name not mentioning the ecosystem, placement decides scope — e.g. `create_po_translations` lives in `erp-partners` because `.po` files are an Odoo concept, not a product concept.
- **Product-specific** → `<product-org>/agent-stack/`.

### Naming inside product stacks

When a product stack adds a rule/skill/workflow whose base name could collide with a transversal one, **add a `_<product>` suffix** to avoid silent last-stack-wins shadowing during composition:

- `aws_resource_safety_<product>.md` (extends, doesn't shadow, `aws_resource_safety.md` from core).
- `init_project_<product>.md`.
- `use_orchestrator_api.md` is OK as-is when `orchestrator` is already a recognised entity within that product's domain.

## SLA de PR review

Si un PR queda sin revisar más de 5 días, el owner debería ser pinged explícitamente. Si hay back-log persistente, es señal de que hay que sumar co-owners.

| Tipo de stack | SLA objetivo |
|---|---|
| `agent-stack-core` | **24 horas** (afecta a todos los workspaces) |
| Topical transversal (`aws`, `mcp`, `cloudflare`, `research`, `erp-partners`) | **48 horas** |
| Stacks de producto | **48 horas** (lo define el equipo del producto) |

## Cómo se aprueba un cambio

### Cambio a un stack (rules / skills / workflows)

1. PR contra el stack repo. Tests + evals deben pasar.
2. Owner del stack revisa.
3. Tras merge, **cualquier workspace** corre `wsp sync` y trae el cambio.

### Cambio a la governance canónica

1. PR contra el repo de governance canónica de tu equipo.
2. Mismo PR (o uno coordinado) actualiza el espejo en `<transversal-org>/agent-stack-core/awac.yml#org_scaffold`.
3. Antes de mergear, correr `wsp governance check` localmente — si el chequeo no pasa, el PR no se mergea.

### Cambio a `wsp` (CLI)

1. PR contra `getGanemo/workspace-cli`. Tests deben pasar.
2. Tras merge, taggear `vX.Y.Z`. El workflow `release.yml` arma el wheel y lo publica como GitHub Release.
3. Cualquier dev/agente actualiza con el flujo del workflow `install_wsp` (en `<transversal-org>/agent-stack-core/workflows/`).

## Por qué este modelo (vs. alternativas)

- **Por qué no monorepo de stacks**: cada stack tiene un owner natural distinto. El monorepo bottlenequea el review en una persona.
- **Por qué no submódulos git**: editar transversales sin clonar todos los productos era un requisito; submódulos lo rompen.
- **Por qué no copiar todo a cada workspace**: drift garantizado a 6 meses. AWaC compose-on-pull resuelve esto.
- **Por qué governance v2 atemporal + audit separado**: atemporal sobrevive cambios de calendario; el audit es el cementerio donde van los TODOs.
- **Por qué `wsp governance check` en el CLI y no GitHub Actions**: el CLI ya tiene `gh` autenticado en cada máquina del developer, así que evita el PAT/secret setup. Trade-off documentado en ADR 008.

## Anti-patterns de gobernanza

1. **Editar `awac.yml#org_scaffold` sin tocar el doc canónico** (o viceversa). El same-PR rule está para evitar esto. `wsp governance check` lo detecta.
2. **Crear assets transversales en stacks de producto.** Un agente que duda dónde poner una skill debería revisar la sección 1 de la skill `create_skill` (decisión de ubicación obligatoria).
3. **Editar archivos en `.agents/` de un workspace y commitearlos.** Esa carpeta se regenera por `wsp sync`. Cualquier cambio que valga la pena vive en el stack repo upstream.
4. **Pushear directo a `main` de un stack para fixes urgentes** sin PR. Aunque el owner sea uno solo, el commit log + el evaluación de evals son la trazabilidad.

## Ver también

- [Skill `manage_project_state`](https://github.com/getGanemo/agent-stack-core/tree/main/skills/manage_project_state) — define la estructura interna de cualquier `<product-org>/project_management`.
- ADRs 008, 011, 013 — decisiones específicas de governance (CLI vs CI, scaffold-repo audit, scaffold-stack auto-register).
