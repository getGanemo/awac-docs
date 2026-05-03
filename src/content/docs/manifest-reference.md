---
title: "Referencia de `workspace.yml`"
---

El **manifest** de un workspace AWaC. Es el único archivo que escribís a mano (o, más precisamente, que el agente escribe por vos vía `wsp init`). Vive en la **raíz de la carpeta del workspace**.

## Schema completo

```yaml
# workspace.yml
name: <human-readable workspace name>            # required
schema: awac/1                                   # required, version del schema

stacks:                                          # required (al menos `core`)
  - core                                         # shortcut, resuelto vía registry
  - aws
  - <product-shortcut>
  - <org>/<repo>                                 # forma explícita
  - org: <org>                                   # forma verbose con opciones
    name: agent-stack
    include: [<repo-a>, <repo-b>]                # subset de standard_repos
    exclude: [<repo-x>]                          # exclusión sobre standard_repos
    capabilities_only: false                     # true → no clonar repos
    modules: [<module-a>, <module-b>]            # solo Odoo: módulos a clonar

extra_repos:                                     # optional, repos one-off
  - org: <github-org>
    repo: <repo-name>
    path: <relative-path>                        # default: <repo-name>/
    branch: <branch>                             # default: repo's default branch
    mode: clone | submodule | sparse             # default: clone
    sparse_paths: [<path>, <path>]               # solo si mode: sparse

private_overlay:                                 # optional, capa privada por dev
  org: <github-org>
  repo: <private-repo-name>
  path_in_repo: <subdirectory>                   # default: root

agent_context:                                   # optional, override del default
  canonical: CLAUDE.md
  mirrors: [AGENTS.md]
  extras:
    - path: .cursorrules
      header: false

worktrees:                                       # optional
  base_dir: ./.worktrees/
  auto_sync_on_create: true

workspace_repo:                                  # optional
  enabled: false                                 # true → versionar como git repo
  org: <github-org>                              # default: primer stack de producto
  name: <repo-name>                              # default: workspace-<name>
  visibility: private | internal | public        # default: private
```

## Forma mínima válida

```yaml
name: my-workspace
schema: awac/1
stacks:
  - core
```

## Campos top-level

### `name` (required)

Nombre del workspace. Pattern: `^[a-z][a-z0-9-]+$` (lowercase, dígitos, guiones medios; debe empezar con letra). Se usa para:
- El folder que crea `wsp init`.
- Como base para el nombre del repo si `workspace_repo.enabled: true`.

### `schema` (required)

Versión del schema del manifest. Hoy: `awac/1`. El CLI valida y rechaza schemas que no entiende, evitando que un workspace creado con AWaC v2 sea procesado mal por una CLI v1.

### `stacks` (required)

Lista de stacks que componen el workspace. Cada elemento puede ser:

#### Forma corta (atajo)

```yaml
stacks:
  - core
  - my-product
```

El CLI resuelve cada atajo contra el `shortcuts` del registry en `<transversal-org>/agent-stack-core/awac.yml`. Si el atajo no existe, falla con `E_UNKNOWN_SHORTCUT` listando los disponibles.

#### Forma explícita

```yaml
stacks:
  - <transversal-org>/agent-stack-core
  - <product-org>/agent-stack
```

Cualquier valor que contenga `/` se trata como `<org>/<repo>` literal y **no** se busca en el registry.

#### Forma verbose (con opciones)

```yaml
stacks:
  - org: my-product
    name: agent-stack                # default si org es atajo registrado
    include: [project_management, backend]
```

Opciones disponibles:

| Opción | Default | Para qué sirve |
|---|---|---|
| `name` | `agent-stack` (si org es producto) o el atajo | Repo name dentro del org |
| `include: [...]` | (todos los standard_repos) | Solo clona estos repos del stack |
| `exclude: [...]` | (ninguno) | Excluye estos repos de los standard |
| `capabilities_only: bool` | `false` | Si `true`, no clona ningún repo del stack — solo carga rules/skills/workflows |
| `modules: [...]` | — (solo válido para `erp-partners`) | Lista de módulos Odoo a clonar |

#### Caso especial Odoo: módulos

```yaml
stacks:
  - core
  - org: erp-partners
    modules: [my_module_a, my_module_b]
```

El CLI lee `erp-partners/agent-stack/awac.yml/module_convention` (path prefix `addons/`, branch default `19-dev`, repo name = nombre del módulo) y clona cada uno a `addons/<module>/`.

### `extra_repos` (optional)

Repos que **no** vienen de ningún stack. Útil para:
- Un repo externo (de otra org).
- Un repo one-off de un experimento que no merece estar en el agent-stack del producto.

```yaml
extra_repos:
  - org: external-org
    repo: legacy-tool
    path: tools/legacy/
    branch: main
```

### `private_overlay` (optional)

Capa privada por dev: configuración personal, refs a secretos personales, atajos individuales que **no deben** vivir en stacks compartidos. Aplica DESPUÉS de los stacks. Sus archivos no se promueven con `wsp promote` (no tiene upstream público).

```yaml
private_overlay:
  org: <my-personal-org>            # típicamente tu org personal
  repo: workspace-private
  path_in_repo: my-product/
```

### `agent_context` (optional)

Override del default global (que está en `<transversal-org>/agent-stack-core/awac.yml/agent_context`). El default actual genera `CLAUDE.md` (canonical) + `AGENTS.md` (mirror). Si querés agregar archivos para agentes específicos:

```yaml
agent_context:
  canonical: CLAUDE.md
  mirrors:
    - AGENTS.md
  extras:
    - path: .cursorrules
      header: false                  # Cursor no parsea bien HTML comments
    - path: .github/copilot-instructions.md
      header: true
```

Detalles en [`10-agent-context-files.md`](10-agent-context-files.md).

### `worktrees` (optional)

Configuración de worktrees paralelos para cuando varios agentes trabajan simultáneamente sobre el mismo workspace (feature en v2 del CLI):

```yaml
worktrees:
  base_dir: ./.worktrees/
  auto_sync_on_create: true
```

### `workspace_repo` (optional)

Si querés que la carpeta del workspace sea su propio git repo (versionar el `workspace.yml` y `wsp.lock` para que un equipo entero pueda clonarlo y arrancar idéntico):

```yaml
workspace_repo:
  enabled: true
  org: my-product              # opcional; si falta, se infiere
  name: billing-feature             # opcional; default workspace-<name>
  visibility: private               # default
```

Lógica de creación detallada en [`09-workspace-repo.md`](09-workspace-repo.md).

## Ejemplos completos

### Ejemplo 1: workspace mínimo de research

```yaml
name: spike-llm-comparison
schema: awac/1
stacks:
  - core
  - mcp
  - research
```

Trae core, MCP (NotebookLM, Antigravity), research workflows. Sin código de producto.

### Ejemplo 2: feature en un producto interno (caso típico)

```yaml
name: my-product-billing-feature
schema: awac/1
stacks:
  - core
  - aws
  - my-product
```

El stack `my-product` declara en su `awac.yml` los repos estándar del producto (`project_management`, `infrastructure`, `orchestrator`). El CLI los clona automáticamente.

### Ejemplo 3: feature en un producto con conector Odoo

```yaml
name: my-product-payments-feature
schema: awac/1
stacks:
  - core
  - aws
  - my-product                      # incluye sus módulos Odoo asociados
  - erp-partners                    # capacidad Odoo para los módulos
```

El stack `my-product` declara que tiene `erp-partners/my_product_connector` como repo asociado (cross-org). Se clona automáticamente a `addons/my_product_connector/`.

### Ejemplo 4: módulo Odoo nuevo standalone

```yaml
name: l10n-pe-new-module
schema: awac/1
stacks:
  - core
  - org: erp-partners
    modules: [l10n_pe_new_module]
```

### Ejemplo 5: workspace cross-producto con subset

```yaml
name: cross-product-comparison
schema: awac/1
stacks:
  - core
  - org: product-a
    include: [project_management]   # solo los docs de gestión, no el código
  - org: product-b
    include: [project_management]
```

Útil para un análisis comparativo donde solo necesitás la documentación de ambos productos.

### Ejemplo 6: workspace con repo propio + capa privada

```yaml
name: my-product-q3-roadmap
schema: awac/1
stacks:
  - core
  - my-product
private_overlay:
  org: <my-personal-org>
  repo: workspace-private
  path_in_repo: my-product/
workspace_repo:
  enabled: true
  org: my-product
  visibility: private
```

Workspace versionado en `my-product/workspace-my-product-q3-roadmap` para que el equipo entero clone y trabaje sobre el mismo manifest.

## Resolución de conflictos

Si dos stacks definen un archivo en el mismo path dentro de `.agents/`, gana el **último declarado** en `stacks:`. Para invertir el orden, reordená la lista.

Para el caso edge donde necesitás composición más fina (un stack agrega secciones a un archivo de otro stack), está abierta la pregunta de diseño en la spec — por ahora, la convención es no hacerlo.

## Validación

`wsp` valida el manifest antes de cualquier operación. Errores típicos:

| Código | Causa | Fix |
|---|---|---|
| `E_INVALID_MANIFEST` | YAML mal formateado o campo requerido faltante | Revisá sintaxis YAML y que `name`, `schema`, `stacks` existan |
| `E_UNKNOWN_SHORTCUT` | Atajo en `stacks:` que no está en el registry | Usá la forma `<org>/<repo>` o agregá el atajo al registry |
| `E_INVALID_SCHEMA` | `schema:` no es `awac/1` | Actualizá el CLI o ajustá el schema |
| `E_INVALID_NAME` | `name:` no matchea pattern | Usá lowercase, dígitos, guiones medios, debe empezar con letra |
| `E_REPO_NOT_FOUND` | Repo declarado en stack o `extra_repos` no existe en GitHub | Verificá el path o creá el repo |

## Ver también

- [`04-stack-reference.md`](04-stack-reference.md) — qué declara cada stack en su `awac.yml`.
- [`05-cli-reference.md`](05-cli-reference.md) — comandos del CLI que consumen este manifest.
- [`06-templates.md`](06-templates.md) — templates pre-armados de `workspace.yml`.
- [`09-workspace-repo.md`](09-workspace-repo.md) — semántica completa de `workspace_repo`.
- [`10-agent-context-files.md`](10-agent-context-files.md) — semántica completa de `agent_context`.
