---
title: "Deploy + Secrets — la convención per-producto"
---

Cada producto tiene **su propio plan de deploy** y **su propio catálogo de secretos**. AWaC formaliza ambos como assets versionados que viven en `<product-org>/agent-stack/`. Los flujos (cómo se ejecuta cada deploy, cómo se resuelven los secretos) son universales y viven en `<transversal-org>/agent-stack-core` + topical stacks.

> Introducido en CLI v0.6.0 (schemas) + v0.7.0 (comandos `wsp deploy` y `wsp secrets check`). Extendido en **v1.1.0** con schemas `deploy/2` + `awac/2` que clarifican el modelo de capas y agregan overrides per-workspace (ver "Modelo three-layer" abajo).

## Modelo de dos archivos por producto

```
<product>/agent-stack/
├── awac.yml         ← stack repo + repos del producto + module_convention
├── deploy.yml       ← componentes deployables + targets + flujos pre/post
└── devvault.yml     ← catálogo de secretos (NUNCA vault_path local)
```

Schemas formales: `wsp schema deploy` y `wsp schema devvault`.

A partir de CLI v1.1.0 estos archivos se **materializan** como mirror read-only en el workspace local bajo `.stack/<product>/` cuando `wsp bootstrap` resuelve un template de producto. Cada archivo lleva un header `SYNCED FROM <repo>`. `wsp doctor` reporta drift si el dev edita el mirror sin propagar al stack repo. Para variaciones per-workspace (test → staging, sub-vaults distintos, target alternativo), el contrato es `workspace.yml#deploy_overrides` + `#devvault_overrides` — NO editar el mirror.

### Stacks transversales con artefactos desplegables

`deploy.yml` y `devvault.yml` no son exclusivos de stacks de producto. Un **stack transversal** los declara **iff tiene artefactos desplegables propios**.

| Stack | Tipo | ¿Tiene `deploy.yml` / `devvault.yml`? |
|---|---|---|
| `<transversal-org>/agent-stack-core` (`getGanemo`) | conocimiento puro (rules/skills/workflows/schemas) | **NO** |
| `<transversal-org>/agent-stack-aws`, `-cloudflare`, `-mcp`, `-research` | conocimiento puro (workflows + skills topicales) | **NO** |
| `odoopartners/agent-stack` | transversal con artefactos: cada módulo Odoo bajo su gobierno es un deployable | **SÍ** — declara `odoo_module_template` (Odoo.SH staging → promote a `odoopartners/<module>` en `{ver}.0`) |

Ejemplo concreto: `odoopartners/agent-stack/deploy.yml` define el componente `odoo_module_template` con los defaults del patrón Odoo.SH (target, pre_steps, rollback, branch convention). Workspaces standalone (creados con `templates/{single,existing}-modules.yml`) lo consumen vía `workspace.yml#deploy_overrides` rellenando `repo` (staging), `odoo_sh.project`, `odoo_sh.modules` y `promote_after_pass` por módulo. Workspaces compuestos con un producto SaaS (orquestio, emboux) hoy redeclaran la misma forma en el `deploy.yml` del producto, anotando comment-cross-reference; cuando `from_template` cross-stack ship en CLI, esos componentes migrarán a heredar.

**Regla de governance:** si un stack transversal no tiene artefactos desplegables propios, NO debe declarar `deploy.yml` / `devvault.yml`. Esto evita catálogos huecos y secretos sin owner. Inverso: cualquier transversal con artefactos (presente: odoopartners; futuro: stacks que publiquen libraries con su propio CI/CD) declara ambos archivos.

---

## `deploy.yml` (schema `deploy/2`)

Declara qué se deploya, en qué orden, contra qué targets, y qué pre-steps + aprobaciones humanas son obligatorios. **Cada campo de un componente es un STACK DEFAULT overrideable** por `workspace.yml#deploy_overrides[<name>]` (workspace gana por campo).

### Estructura

```yaml
schema: deploy/2
product: <slug>                       # debe coincidir con awac.yml#product
description: <texto opcional>

components:
  - name: <stable_id>                 # snake_case o kebab-case (estable; los workspaces lo referencian)
    target: <target_type>             # default; overrideable
    targets_available: [<target>, ...] # opcional; constraint para overrides del workspace
    repo: <org>/<name>                # opcional default (para componentes cross-repo)
    requires_human_approval: true     # default true; overrideable
    pre_steps:                        # workflow IDs que deben PASAR antes
      - run_tests_local
      - terraform_plan
    promote_after_pass:               # opcional, para flujos two-step
      - target_repo: <org>/<name>
        target_branch: <branch>
        require_pass_on: <target>     # solo promueve si ese target acka
    rollback_window_minutes: 30       # opcional
    <target>:                          # sub-bloque target-específico (defaults)
      ...
```

`deploy/1` specs siguen siendo válidos. `wsp migrate-deploy <product>` reescribe el spec en cache + deja un patch para PR al stack repo (agrega `targets_available` con un solo elemento — el target actual; broaden manualmente).

### Targets soportados

| Target | Descripción | Topical workflow |
|---|---|---|
| `odoo_sh` | Odoo SaaS hosting (push GH → Odoo.SH watches branch). | `erp-partners/agent-stack/workflows/deploy_to_odoo_sh.md` |
| `aws_ecs` | ECS Fargate / EC2-backed. | `getGanemo/agent-stack-aws/workflows/deploy_to_aws_ecs.md` |
| `aws_lambda` | Lambda functions. | `getGanemo/agent-stack-aws/workflows/deploy_to_aws_lambda.md` |
| `aws_ec2_ssm` | EC2 con SSH cerrado, deploy vía SSM. | `<transversal-org>/agent-stack-aws/workflows/deploy_to_aws_ec2_ssm.md` |
| `cloudflare_pages` | Cloudflare Pages static + workers. | `<transversal-org>/agent-stack-cloudflare/workflows/deploy_to_cloudflare_pages.md` |
| `cloudflare_workers` | Cloudflare Workers serverless. | `<transversal-org>/agent-stack-cloudflare/workflows/deploy_to_cloudflare_workers.md` |
| `github_pages` | GitHub Pages. | `<transversal-org>/agent-stack-core/workflows/deploy_to_github_pages.md` |
| `manual` | Pasos no automatizados (último recurso, documentar en `pre_steps`). | n/a |

### Cómo se ejecuta

El **workflow router** `deploy_product` (en `<transversal-org>/agent-stack-core/workflows/`):

1. Lee `<product-org>/agent-stack/deploy.yml`.
2. Para cada componente: corre `pre_steps` en orden. Cualquier fallo → abort.
3. Si `requires_human_approval: true`: imprime el plan, **PARA**, espera ack explícito por componente.
4. Delega al `deploy_to_<target>.md` topical workflow.
5. Tras success del target, ejecuta `promote_after_pass` (si declara `require_pass_on` y el target ackó).
6. Honra `rollback_window_minutes` post-deploy.
7. Reporta resultado y registra entrada en `<product-org>/project_management/...progreso.md`.

El CLI **no ejecuta el deploy** — solo planifica. La ejecución es workflow-driven (ADR 009).

### El flujo Odoo en detalle

`deploy_to_odoo_sh` codifica el patrón completo:

| Step | Acción |
|---|---|
| 0 | Pre-condition: `run_odoo_tests_docker_wsl` PASS (mandatorio). |
| 1 | Lee la sección del componente del `deploy.yml`. |
| 2 | **Ack humano explícito** — un "ok" anterior en el chat NO cuenta. |
| 3 | Resuelve dependencias recursivas (`__manifest__.py#depends`). |
| 4 | Push al repo Odoo.SH-watched (staging). |
| 5 | Recupera token GH (Windows Credential Manager). |
| 6 | Polling del build status vía GH commit statuses + browser fallback. |
| 7 | Recupera `instance_url` via browser y actualiza `deploy.yml`. |
| 8 | **Verifica `ir.logging`** — entries W/E/C en módulos custom = BLOCK. |
| 9 | En falla real: lee logs, fix, restart desde Step 3. |
| 10 | **Promote a `erp-partners/<module>:<19.0>`** solo si Step 8 limpió. Fast-forward only — refuse force-push. |
| 11 | Reporta SUCCESS/FAILURE al router. |

### Comando CLI

```bash
wsp deploy <product> [--component <name>] [--no-overrides] [--json]
```

Plan-only: imprime los componentes resueltos, sus targets, pre_steps, ack requirement, promotions. Validación schema antes de imprimir. Para ejecutar de verdad → invocar el workflow router.

Cuando se ejecuta dentro de un workspace, **aplica `workspace.yml#deploy_overrides`** sobre el spec del stack (workspace gana). El plaintext output marca componentes con `(workspace override applied)` y lista los campos que difieren del stack default. Pasar `--no-overrides` para ver el raw stack default.

---

## Workspace overrides (CLI v1.1.0+)

Un workspace puede declarar variaciones per-feature **sin tocar el spec del stack** (que es prod-truth para todos los workspaces del producto). Útil para workspaces de prueba que apuntan a staging, sub-vaults distintos, etc.

```yaml
# workspace.yml
schema: awac/2                        # required cuando hay overrides

deploy_overrides:
  api:
    target: aws_lambda                # swap target (válido si stack tiene targets_available que lo permita)
    odoo_sh:                          # mergea field-by-field con stack default
      project: my-product-staging
      branch: 19.0-staging
  optional_module:
    skip: true                        # excluye componente del plan en este workspace

devvault_overrides:
  cloudflare: providers/cloudflare-staging.yml   # path alternativo para el secreto lógico
```

**Reglas de merge**:
- Scalars (`target`, `repo`, `requires_human_approval`, `rollback_window_minutes`) → workspace override directo.
- Arrays (`pre_steps`, `promote_after_pass`) → REPLACE entirely.
- Objects (`odoo_sh`, `aws_ecs`, etc.) → mergean field-by-field; arrays internos como `modules` REPLACE.
- `skip: true` → excluye el componente del plan resuelto.
- Override de `target` a un valor fuera de `targets_available` → CLI emite WSP_019.
- Cualquier override en un workspace con schema `awac/1` → CLI emite WSP_018 ("schema awac/2 required for overrides").

---

## `devvault.yml` (schema `devvault/1`)

Declara los secretos que el producto necesita, mapeados de **nombre lógico** a **path relativo** dentro del vault local del developer.

### Modelo two-layer

| Layer | Vive en | Per | Versionado |
|---|---|---|---|
| **Catálogo** (logical → relative path) | `<product-org>/agent-stack/devvault.yml` | producto | ✅ |
| **Vault path local** | `~/.devvault/.config.yml` | máquina | ❌ |
| **Secret values** | `~/.devvault/<vault_path>/<relative-path>` | máquina | ❌ |

Esta separación es la decisión central (ADR 010): el catálogo es per-producto y compartido entre devs; el path local NUNCA va a un repo (cada developer mantiene su propio `~/.devvault/`).

### Estructura del catálogo

```yaml
schema: devvault/1
product: <slug>
description: <opcional>

secrets:
  <logical_name>: <relative_path>
  aws: aws/<product>.yml
  cloudflare: providers/cloudflare.yml
  odoo: odoo/general.yml
  github_app: github/<product>-app.yml
  github_pem: github/<product>-app.pem
```

El schema **prohíbe explícitamente** la clave `vault_path` dentro del catálogo — meterla ahí es el error más común y el motivo por el que el modelo se separó en dos.

### Setup per-machine (una sola vez)

```yaml
# ~/.devvault/.config.yml
vault_path: "/absolute/path/to/your/devvault"
```

Los secret values mismos los popula el developer desde su password manager (1Password, Bitwarden, etc.). Eso queda fuera del scope de AWaC.

### Cómo se lee un secreto

Patrón canónico (codificado en la rule `use_devvault.md`):

```python
import yaml
from pathlib import Path

# 1. Path local del vault
config = yaml.safe_load((Path.home() / ".devvault" / ".config.yml").read_text())
vault_path = Path(config["vault_path"])

# 2. Catálogo del producto
catalog = yaml.safe_load(Path("<product-org>/agent-stack/devvault.yml").read_text())

# 3. Resolver y leer
secret_path = vault_path / catalog["secrets"]["aws"]
aws_secrets = yaml.safe_load(secret_path.read_text())
```

### Comando CLI

```bash
wsp secrets check <product> [--json]
```

Read-only. Reporta por entrada `[ok]` / `[missing]` / `[unreadable]`. Nunca abre ni imprime el contenido. Exit 0 si todos OK; 1 si alguno falta.

`wsp doctor` también incluye un check `devvault_config` que verifica que `~/.devvault/.config.yml` exista y `vault_path` resuelva.

---

## Ejemplos sintéticos

### Producto con orchestrator AWS + módulo Odoo

```yaml
# <product-org>/agent-stack/deploy.yml
schema: deploy/1
product: my-product
components:
  - name: orchestrator
    target: aws_ec2_ssm
    repo: my-product/orchestrator
    requires_human_approval: true
    pre_steps: [run_tests_local]
    rollback_window_minutes: 30

  - name: my_product_portal_module
    target: odoo_sh
    requires_human_approval: true
    odoo_sh:
      project: my-org-my-product-portal
      branch: main
      modules: [my_product_portal]
    pre_steps: [run_odoo_tests_docker_wsl]
    promote_after_pass:
      - target_repo: erp-partners/my_product_portal
        target_branch: "19.0"
        require_pass_on: odoo_sh
```

```yaml
# <product-org>/agent-stack/devvault.yml
schema: devvault/1
product: my-product
secrets:
  aws_account: aws/account.yml
  aws: aws/my-product.yml
  cloudflare: providers/cloudflare.yml
  odoo: odoo/general.yml
  github_app: github/my-product-app.yml
  github_pem: github/my-product-app.pem
```

### Producto con varios módulos Odoo + API en ECS

Combina varios módulos Odoo (`<product>_saas` + `<product>_core`) con un servicio backend (target `aws_ecs`).

### Producto con frontend en CF Pages

`api` (`aws_ecs`) + `web` (`cloudflare_pages`, sin `requires_human_approval` porque CF Pages auto-publica preview por push) + `deploy_orchestration` (`manual`, Docker+Nginx).

---

## Anti-patterns

1. **Hardcodear secretos** en cualquier archivo del repo, incluso "placeholder" tipo `API_KEY="changeme"`. Usar `<placeholder>` en config files committeados y resolver del vault en runtime.
2. **Meter `vault_path` en `<product>/agent-stack/devvault.yml`**. El schema lo rechaza; el dev path es per-machine.
3. **Saltar `pre_steps`** "porque tarda". Los `pre_steps` existen porque el alternative (deployar código roto) es peor.
4. **Saltar `requires_human_approval`** porque "el usuario dijo deployá hace 5 minutos". El ack es **per-componente, per-deploy**.
5. **`promote_after_pass` ejecutado antes que el target acka**. Esa es exactamente la falla que `require_pass_on` previene.
6. **Force-push en promote**. La rama canónica es producción truth — reconciliar, no overwriting.
7. **Inventar un deploy procedure** porque el spec no existe. La acción correcta es invocar la skill `create_deploy_spec`, no improvisar.

---

## Cross-references

- Schemas: `wsp schema deploy` / `wsp schema devvault`.
- Skill `create_deploy_spec` (publicada en `<transversal-org>/agent-stack-core/skills/`).
- Rules `use_deploy_spec`, `use_devvault` (publicadas en `<transversal-org>/agent-stack-core/rules/`).
- Workflow router `deploy_product` (publicado en `<transversal-org>/agent-stack-core/workflows/`).
- Topical (Odoo): workflow `deploy_to_odoo_sh` (publicado en `erp-partners/agent-stack/workflows/`).
- ADRs: 009 (deploy.yml separado de awac.yml), 010 (devvault two-layer model).
- Comandos: `wsp deploy`, `wsp secrets check`, `wsp doctor`. Ver [`05-cli-reference.md`](05-cli-reference.md).
