---
title: "Referencia de `awac.yml` (en stack repos)"
---

Cada **stack repo** (`<transversal-org>/agent-stack-*` o `<product-org>/agent-stack`) tiene un archivo `awac.yml` en su raíz. Este archivo declara metadata del stack: qué producto representa, qué repos auto-clona cuando se incluye en un workspace, qué convenciones especiales usa.

El **registry** (en `<transversal-org>/agent-stack-core/awac.yml`) tiene secciones adicionales que ningún otro stack tiene.

## Schema base (todos los stacks)

```yaml

## <stack-repo>/awac.yml

product: <nombre del producto / dominio>          # required
scope: <descriptor de scope>                      # optional, ayuda al humano

## Repos a clonar cuando este stack se incluye en un workspace

repos:                                            # optional, [] si no aplica
  - name: <repo-name>                             # required
    org: <github-org>                             # default: la org del propio stack
    path: <relative-path>                         # default: <name>/
    branch_default: <branch>                      # default: el branch default del repo

## Solo en stacks tipo Odoo: convención para módulos pedidos ad-hoc

module_convention:                                # optional
  default_org: <org>
  path_prefix: <path>
  branch_default: <branch>
  repo_pattern: "{module_name}"
```

## Tipos de stack y qué `awac.yml` esperar

## 1. Core (`<transversal-org>/agent-stack-core`) — el más rico

Contiene **registry**, **catálogo de templates** y **reglas de scaffolding** además del meta del propio stack:

```yaml

## <transversal-org>/agent-stack-core/awac.yml

product: <transversal-org>

## Sección 1: registry de shortcuts

shortcuts:
  core:         <transversal-org>/agent-stack-core
  aws:          <transversal-org>/agent-stack-aws
  mcp:          <transversal-org>/agent-stack-mcp
  cloudflare:   <transversal-org>/agent-stack-cloudflare
  research:     <transversal-org>/agent-stack-research
  erp-partners: erp-partners/agent-stack
  product-a:    <product-a-org>/agent-stack
  product-b:    <product-b-org>/agent-stack
  # add a shortcut per internal product

## Sección 2: catálogo de templates

templates:
  - name: blank
    description: "Workspace mínimo"
    path: <transversal-org>/agent-stack-core/templates/blank.yml
  - name: product-a-feature
    description: "Feature work on product A"
    path: <product-a-org>/agent-stack/templates/feature.yml
  - name: product-b-feature
    description: "Feature work on product B with Odoo modules"
    path: <product-b-org>/agent-stack/templates/feature.yml
  # ... add more per product

## Sección 3: reglas de scaffolding (consumidas por wsp scaffold-stack)

## Sección 3: reglas de scaffolding (consumidas por wsp scaffold-stack)

> **v2**: el `org_scaffold` refleja el modelo categorical A–E definido por el documento canónico de governance del equipo (un repo privado o público que el equipo mantiene como single source of truth). El bloque pasa de un `standard_repo_patterns` plano a categorías. Cualquier cambio acá DEBE propagarse al doc canónico en el mismo PR (validado por `wsp governance check`). ADR 008.

```yaml
org_scaffold:
  governance_doc: https://example.com/governance/product-structure.md
  audit_doc:      https://example.com/governance/product-structure.audit.md
  default_visibility: private
  transversal_orgs: [<transversal-org>, erp-partners]

  category_a_governance:
    mandatory: true
    repos:
      - { name: project_management, naming: snake_case, branch_default: main, visibility: private }
      - { name: agent-stack,        naming: kebab-case, branch_default: main, visibility: private }
      - { name: infrastructure,     naming: kebab-case, branch_default: main, visibility: private }

  category_b_public_surface:
    mandatory: false
    repos:
      - { name: web,            branch_default: main, visibility: private }
      - { name: docs,           branch_default: main, visibility: private }
      - { name: docs-users,     branch_default: main, optional: true }
      - { name: docs-developers, branch_default: main, optional: true }

  category_c_product_code:
    naming_freedom: true
    naming_rules:
      preferred: functional_descriptive   # platform, orchestrator, admin
      forbidden_names: [code, app, src, main]
    branch_default: declared_per_repo_in_agent_stack_awac_yml

  category_d_optional:
    repos:
      - { name: mcp-server,        branch_default: main }
      - { name: terraform-modules, branch_default: main }
      - { glob: "*-starter",       visibility: public }   # única excepción a privado
      - { glob: "*-build" }

  category_e_cross_org:
    odoo_modules:
      org: erp-partners
      naming: free_commercial            # NO mechanical pattern
      branch_default_dev: "{version}-dev"
      branch_default_stable: "{version}.0"
      cross_reference_required_in:
        - "<producto>/agent-stack#description"
        - "<producto>/agent-stack/awac.yml#repos"
        - "<producto>/project_management/00_Base/00_Mapa_Repositorios.md"

  excluded_names:
    - .github
    - agent-stack
    - infrastructure
    - project_management
    - docs
    - docs-users
    - docs-developers
    - web

  default_workspace_template:
    filename:    feature.yml
    description: "Feature en {product}."
    stacks:
      - core
      - "{product}"

  transversal_vs_product:
    test_questions:
      - "Could another internal product use this asset as-is?"
      - "Does the asset codify an organisation-wide (or technology) convention rather than a product-specific one?"
      - "If two products needed it, would two copies be a mistake?"
    if_any_yes: transversal               # → vive en la org transversal o en la org de ecosistema
    if_all_no:  product                   # → vive en la org del producto
    asset_destination:
      skill_universal:    <transversal-org>/agent-stack-core/skills/<skill>/
      skill_topical:      <transversal-org>/agent-stack-<topic>/skills/<skill>/
      skill_product:      <producto>/agent-stack/skills/<skill>/
      rule_universal:     <transversal-org>/agent-stack-core/rules/<rule>.md
      rule_topical:       <transversal-org>/agent-stack-<topic>/rules/<rule>.md
      rule_product:       <producto>/agent-stack/rules/<rule>.md
      workflow_universal: <transversal-org>/agent-stack-core/workflows/<wf>.md
      workflow_topical:   <transversal-org>/agent-stack-<topic>/workflows/<wf>.md
      workflow_product:   <producto>/agent-stack/workflows/<wf>.md
```

Quien clasifica los repos del org en estas categorías es `wsp scaffold-stack <org>`. Quien valida que el espejo no diverja del documento canónico es `wsp governance check` (ver [`05-cli-reference.md`](05-cli-reference.md)).

## Sección 4: agent context files (default global)

agent_context:
  canonical: CLAUDE.md
  mirrors:
    - AGENTS.md
```

## 2. Stack transversal (`agent-stack-aws`, `mcp`, `cloudflare`, `research`)

No auto-clonan repos. Solo proveen capacidades.

```yaml

## getGanemo/agent-stack-aws/awac.yml

product: getGanemo
scope: aws-infrastructure
repos: []
```

## 3. Stack Odoo (`erp-partners/agent-stack`)

No tiene `standard_repos` (cada módulo Odoo es elegido ad-hoc por el workspace), pero declara la convención para resolver módulos pedidos:

```yaml

## erp-partners/agent-stack/awac.yml

product: erp-partners
scope: odoo-development

module_convention:
  default_org: erp-partners
  path_prefix: "addons/"
  branch_default: "19-dev"
  repo_pattern: "{module_name}"

repos: []
```

Cuando un workspace declara:

```yaml
stacks:
  - org: erp-partners
    modules: [my_module_a, my_module_b]
```

El CLI usa `module_convention` para resolver:
- `my_module_a` → `erp-partners/my_module_a` clonado a `addons/my_module_a/` rama `19-dev`.
- `my_module_b` → `erp-partners/my_module_b` clonado a `addons/my_module_b/` rama `19-dev`.

## 4. Stack de producto (uno por producto SaaS)

Declara los repos estándar del producto + módulos Odoo asociados (cross-org):

```yaml

## <product-a-org>/agent-stack/awac.yml

product: product-a
scope: product-a-saas

repos:
  - name: project_management
    branch_default: main
  - name: infrastructure
    branch_default: main
  - name: orchestrator
    branch_default: develop
```

```yaml

## <product-b-org>/agent-stack/awac.yml

product: product-b
scope: product-b-saas

repos:
  # repos en la propia org (org default)
  - name: project_management
    branch_default: main
  - name: infrastructure
    branch_default: main
  - name: backend
    branch_default: develop
  - name: frontend
    branch_default: develop

  # módulos Odoo asociados (cross-org)
  - name: product_b_connector
    org: erp-partners                  # override del org default
    path: "addons/product_b_connector/" # path explícito
    branch_default: "19-dev"
```

## Campos detallados

## `product` (required)

Nombre del producto o dominio que este stack representa. Usado para documentación, mensajes de log, y como `{product}` en `org_scaffold` templates. Para stacks transversales: el nombre de tu org transversal.

## `scope` (optional)

Descriptor humano del scope. No tiene efecto funcional, solo documentación interna. Ejemplos: `odoo-development`, `aws-infrastructure`, `<product>-saas`.

## `repos` (optional, defaults to `[]`)

Lista de repos que se clonan cuando un workspace incluye este stack (sin `capabilities_only: true`).

Por entrada:

| Campo | Default | Descripción |
|---|---|---|
| `name` (required) | — | Nombre del repo en GitHub |
| `org` | la org de **este** stack | Override para cross-org references (ej: módulos Odoo de un producto SaaS) |
| `path` | `{name}/` | Path relativo dentro del workspace |
| `branch_default` | el default branch del repo | Branch a clonar |

## `module_convention` (optional, solo Odoo)

Define cómo resolver módulos Odoo pedidos vía `modules: [...]` en un workspace:

| Campo | Descripción |
|---|---|
| `default_org` | Org donde viven los módulos |
| `path_prefix` | Prefijo donde se clonan en el workspace (ej: `addons/`) |
| `branch_default` | Branch default para todos los módulos |
| `repo_pattern` | Patrón para construir el nombre del repo desde el nombre del módulo. Default: `{module_name}` (uno-a-uno) |

## Secciones exclusivas del core (`<transversal-org>/agent-stack-core/awac.yml`)

## `shortcuts`

Mapa `<short-name>: <org>/<repo>`. Usado para resolver atajos en `workspace.yml/stacks`.

## `templates`

Lista de templates de `workspace.yml` disponibles. Cada entry:

| Campo | Descripción |
|---|---|
| `name` | Identificador usado con `--template <name>` |
| `description` | Frase corta visible en `wsp templates` |
| `path` | Path al archivo template real (`<org>/<stack>/templates/<file>.yml`) |

## `org_scaffold`

Reglas que `wsp scaffold-stack <org>` usa para introspeccionar un GitHub org y generar su `agent-stack`:

| Campo | Descripción |
|---|---|
| `standard_repo_patterns` | Lista de nombres de repos que califican como "standard product repos" |
| `branch_defaults` | Mapa `<repo-name>: <branch>` con branches por convención |
| `excluded_names` | Lista de nombres que nunca son productos (ej: `.github`, `agent-stack`) |
| `odoo_module_detection` | Patrón para detectar módulos Odoo asociados a un producto (ej: `{product}_*` en `erp-partners`) |
| `default_workspace_template` | Plantilla del template a generar para el agent-stack nuevo |
| `org_overrides` | Overrides per-org para casos especiales |

## `agent_context` (default global)

Configuración de qué archivos generar en cada workspace tras `bootstrap`/`sync`. Detalles en [`10-agent-context-files.md`](10-agent-context-files.md).

```yaml
agent_context:
  canonical: CLAUDE.md
  mirrors:
    - AGENTS.md
```

## Anatomía completa de un stack repo

```
<stack-repo>/
├── awac.yml                ← este archivo
├── README.md               ← descripción para humanos
├── rules/                  ← reglas markdown que el agente lee
│   ├── <rule_name>.md
│   └── ...
├── skills/                 ← skills (subcarpeta por skill)
│   ├── <skill_name>/
│   │   ├── SKILL.md
│   │   └── evals/          ← opcional
│   └── ...
├── workflows/              ← workflows markdown procedurales
│   ├── <workflow_name>.md
│   └── ...
└── templates/              ← workspace.yml skeletons (en stacks que tienen)
    └── <template_name>.yml
```

## Cómo se compone `.agents/` en el workspace

Cuando `wsp bootstrap` o `wsp sync` corren, materializan `.agents/` componiendo en este orden:

1. Stack `core` primero (siempre).
2. Stacks adicionales en el orden declarado en `workspace.yml/stacks`.
3. Archivos en `repos:` de cada stack (los repos clonados, no su `.agents/`).
4. `private_overlay` si está configurado.
5. Archivos locales (`CLAUDE.local.md`, `WORKSPACE_PRIVATE.md`).

Si dos stacks definen el mismo path en `.agents/`, **el último gana**. Determinístico.

## Versionado

Cada stack repo se versiona como cualquier otro repo del equipo. Convenciones de branch / commit / PR review aplican al stack repo igual que al código de producto.

El CLI consume el branch `main` por default. Cuando se quieren adoptar SHAs anteriores (ej: para reproducir un workspace de hace 6 meses), el `wsp.lock` del workspace pinea SHAs específicos.

## Ver también

- [`02-architecture.md`](02-architecture.md) — modelo conceptual completo.
- [`03-manifest-reference.md`](03-manifest-reference.md) — `workspace.yml` (qué consume estos `awac.yml`).
- [`08-creating-new-stack.md`](08-creating-new-stack.md) — cómo crear un agent-stack para un producto nuevo.
