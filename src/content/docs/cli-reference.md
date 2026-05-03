---
title: "Referencia del CLI `wsp`"
---

`wsp` es la herramienta de línea de comandos de AWaC. **No la corrés vos directamente** — la corre tu agente IA por vos. Sin embargo, todos los flags y formatos de output están documentados acá para que cualquier persona (o agente) pueda entender qué hace cada cosa y diagnosticar problemas.

> Última actualización mayor: 2026-05-03 (v0.9.0).

## Roadmap del CLI

| Versión | Comandos shipped | Fecha |
|---|---|---|
| **v0.1.0** | `init`, `bootstrap`, `templates`, `shortcuts`, `doctor`, `schema`, `--agent-manifest` | 2026-05-02 |
| **v0.2.0** | + `sync`, `status` | 2026-05-03 |
| **v0.3.0** | + `scaffold-stack <org>` | 2026-05-03 |
| **v0.4.0** | + `governance check` | 2026-05-03 |
| **v0.5.0** | + `scaffold-repo <full> --category <X>` | 2026-05-03 |
| **v0.6.0** | + schemas `deploy/1` + `devvault/1`, doctor `devvault_config` step | 2026-05-03 |
| **v0.7.0** | + `deploy <product>`, `secrets check <product>` | 2026-05-03 |
| **v0.8.0** | + `audit <product>`, scaffold-stack auto-register en core, scaffold-repo `--aws-account`/`--domain` para Cat A descriptions | 2026-05-03 |
| **v0.9.0** | + scaffold-stack `--update --push-direct` (skip PR, push to main) | 2026-05-03 |
| v1.x (futuro) | `+ promote`, `worktree add/list/remove`, `explain`, `diff` | Planeado |

Repo: <https://github.com/getGanemo/workspace-cli>. Releases (wheels): <https://github.com/getGanemo/workspace-cli/releases>.

## Instalación

### Modo user (recomendado)

```bash
TAG=v0.9.0
gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
pipx install /tmp/wsp/wsp-*.whl
```

Para automatización, el workflow universal `install_wsp` (en `<transversal-org>/agent-stack-core/workflows/`) cubre detección + instalación + gh auth + `wsp doctor` en 7 pasos.

### Modo dev (para hackear el CLI)

```bash
git clone https://github.com/getGanemo/workspace-cli ~/dev/workspace-cli
pipx install -e ~/dev/workspace-cli
```

Requisitos: Python ≥ 3.10, `git`, `pipx`, `gh` autenticado.

## Filosofía: CLI agent-first

`wsp` está diseñado para ser consumido por un agente IA, no por humanos. Esto implica:

- **Help exhaustivo**, no resumido. Cada flag, cada exit code, cada error documentado.
- **Modo `--json`** en TODO comando. El agente parsea, no scrapea texto.
- **Errores accionables** con `code` + `category` + `cause` + `remediation`. El agente sabe qué hacer cuando algo falla.
- **Cero prompts interactivos por default**. Si falta info, falla con un error estructurado listando qué falta.
- **Idempotencia garantizada** en `bootstrap` y `sync`. Correrlos N veces da el mismo resultado.
- **Output predecible** sin colores ANSI cuando se detecta `--json` o stdout no es TTY.

## Comandos

### `wsp init <name> [options]`

Crea un workspace nuevo desde una plantilla. Escribe `workspace.yml` pero no clona nada (eso es trabajo de `bootstrap`).

```
ARGUMENTS:
  <name>                Nombre del workspace.

OPTIONS:
  --template <id>       ID del template del registry. Default: blank.
  --target <path>       Dónde crear la carpeta. Default: <cwd>/<name>.
  --json                Output JSON.
```

### `wsp bootstrap [options]`

Resuelve los stacks declarados, los clona/actualiza, clona repos de producto, compone `.agents/` + CLAUDE.md/AGENTS.md. Idempotente.

```
OPTIONS:
  --update-locks        Forzar resolución completa y reescribir el lock.
  --json                Output JSON.
```

### `wsp sync [options]`

Refresca stacks (cache pulls) y recompone `.agents/` + CLAUDE.md/AGENTS.md **sin re-clonar product repos**.

```
OPTIONS:
  --json                Output JSON.
```

### `wsp status [options]`

Read-only diff entre `workspace.lock.yml` y el estado actual: stacks (commit lockfile vs upstream), repos (modified, ahead/behind), agents_drift.

```
OPTIONS:
  --json                Output JSON.
```

### `wsp scaffold-stack <org> [options]`

Introspecciona un GitHub org y autogenera su `agent-stack` siguiendo `agent-stack-core/awac.yml#org_scaffold`. Clasifica cada repo en categorías A–E, detecta módulos Odoo Cat E, y genera `awac.yml` + `templates/feature.yml` + `README.md`. **Desde v0.8.0 también auto-registra** el shortcut `<product>` y el template `<product>-feature` en el core registry.

```
ARGUMENTS:
  <org>                 GitHub org name.

OPTIONS:
  --update              Repo existe — refrescar awac.yml repos block (ver --push-direct).
  --no-push             Generar el seed localmente; imprimir el path. No tocar GH.
  --no-register         Saltar el auto-register en core. (v0.8.0+)
  --push-direct         (v0.9.0+) Con --update: push directo a main en vez de abrir PR.
                        Para cuando sos owner del repo y el cambio es additive
                        (e.g. durante onboard_new_product Step 4).
  --branch <name>       Override side-branch en --update (sin efecto con --push-direct).
  --json                Output JSON.

BEHAVIOR (default — repo doesn't exist):
  1. gh repo create <org>/agent-stack --private (con descripción governance-compliant).
  2. Clasifica cada repo del org en Cat A/B/C/D + detecta Cat E.
  3. Genera awac.yml + templates/feature.yml + README.md.
  4. Push directo a main.
  5. (v0.8.0+) Auto-register en agent-stack-core/awac.yml (shortcut + template).

BEHAVIOR (--update sin --push-direct, default):
  1. Clona el repo existente.
  2. Reemplaza el bloque `repos:` del awac.yml.
  3. Push a side-branch + abre PR.
  4. (v0.8.0+) Auto-register en core.

BEHAVIOR (--update --push-direct):
  1. Clona el repo existente.
  2. Reemplaza el bloque `repos:` del awac.yml.
  3. Push directo a main (sin PR).
  4. (v0.8.0+) Auto-register en core.

EXAMPLES:
  wsp scaffold-stack <new-product-org>                # primer scaffold
  wsp scaffold-stack <existing-org> --update          # refresh via PR (third-party / sensitive)
  wsp scaffold-stack <my-org> --update --push-direct  # refresh sin PR (own product onboard)
  wsp scaffold-stack <product-org> --no-push          # preview local, no GH calls
```

### `wsp scaffold-repo <full> --category <A|B|C|D|E> [options]`

Crea un repo de producto siguiendo la convención de README + descripción codificada en governance, o **audita un README existente y abre PR con las secciones requeridas que falten**.

```
ARGUMENTS:
  <full>                <org>/<name>.

OPTIONS:
  --category {A,B,C,D,E}    Required.
  --update              Repo existe — auditar README y abrir PR si falla.
  --no-push             Generar seed localmente.
  --branch <name>       Override side-branch (--update).
  --aws-account <ID>    (v0.8.0+) AWS account ID para Cat A `infrastructure`.
  --domain <DOMAIN>     (v0.8.0+) Cloudflare domain para Cat A `infrastructure`.
  --json                Output JSON.

CATEGORÍAS REQUIRED SECTIONS:
  A: Purpose · Structure · Usage · Cross-references
  B: Purpose · Public URL · Stack · Local development · Cross-references
  C: Purpose · Stack · Architecture role · Primary consumers · Local development · Tests · Deployment · Cross-references
  D: Purpose · Stack · Usage · Cross-references
  E: Producer product · Manifest · Cross-references
```

### `wsp governance check [options]`

Verifica que `awac.yml#org_scaffold` no diverja del documento canónico. Reemplaza al CI workflow previo (ADR 008). `wsp doctor` corre el mismo chequeo.

```
EXIT CODES:
  0   aligned
  1   divergence detected
```

### `wsp audit <product> [options]`

(v0.8.0+) Read-only audit de un producto contra governance + AWaC convention.

```
ARGUMENTS:
  <product>             Slug del producto.

OPTIONS:
  --json                Output JSON.

CHECKS (~11):
  cat_a/<repo>_exists           # los 3 Cat A repos en GitHub
  cat_a/<repo>_description      # matcheas governance pattern
  agent_stack/awac_yml_repos    # awac.yml lista repos
  agent_stack/feature_template  # templates/feature.yml presente
  agent_stack/devvault_yml      # válido contra schema devvault/1
  agent_stack/deploy_yml        # válido contra schema deploy/1 (warn si falta)
  registry/shortcut             # shortcut <product> en core
  registry/template             # template <product>-feature en core

EXIT CODES:
  0   PASS
  1   FAIL (al menos un check falla)
```

Step 8 obligatorio del workflow `onboard_new_product` (incluido en el stack core de tu equipo).

### `wsp deploy <product> [options]`

Lee `<product>/agent-stack/deploy.yml`, valida contra schema `deploy/1`, e **imprime el plan**. Plan-only por diseño — la ejecución es workflow-driven (router `deploy_product`). ADR 009.

### `wsp secrets check <product> [options]`

Resuelve `<product>/agent-stack/devvault.yml` + `~/.devvault/.config.yml`, reporta por entrada `[ok]/[missing]/[unreadable]`. Read-only, nunca imprime valores.

### `wsp templates / shortcuts / doctor / schema`

| Comando | Output |
|---|---|
| `wsp templates [--json]` | Lista templates del registry. |
| `wsp shortcuts [--json]` | Lista shortcuts del registry. |
| `wsp doctor [--json]` | 6 checks: git, gh, cache, registry, devvault_config, governance_mirror. |
| `wsp schema <workspace\|awac\|lock\|deploy\|devvault>` | JSON Schema crudo. |
| `wsp --agent-manifest` | Catálogo machine-readable de comandos para auto-discovery. |

## Códigos de error estructurados

Todos los errores llevan `code` (WSP_NNN), `category`, `cause`, `remediation`, opcionalmente `details`. Surface en plaintext y `--json`.

| Code | Category | Cuándo |
|---|---|---|
| WSP_001 | filesystem | workspace.yml no encontrado |
| WSP_002 | schema | workspace.yml inválido |
| WSP_003 | input | shortcut desconocido |
| WSP_004 | network | clone falló |
| WSP_005 | network | registry inalcanzable |
| WSP_006 | filesystem | target dir no vacío |
| WSP_007 | env | tool requerido faltante |
| WSP_008 | input | template desconocido |
| WSP_011 | schema | versión schema no soportada |
| WSP_012 | network | gh repo list falló |
| WSP_013–WSP_016 | varios | scaffold-stack errors |
| WSP_017–WSP_021 | varios | scaffold-repo errors |
| WSP_022–WSP_024 | varios | deploy errors |
| WSP_025–WSP_026 | varios | secrets errors |

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `WSP_CACHE_DIR` | `~/.wsp/cache/` | Cache local de stacks clonados |
| `WSP_REGISTRY_REPO` | `<transversal-org>/agent-stack-core` | Override del registry (apuntá al registry de tu equipo) |
| `WSP_REGISTRY_BRANCH` | `main` | Branch del registry repo |

## Ver también

- [`02-architecture.md`](02-architecture.md) — modelo conceptual.
- [`03-manifest-reference.md`](03-manifest-reference.md) — `workspace.yml`.
- [`04-stack-reference.md`](04-stack-reference.md) — `awac.yml` + `org_scaffold`.
- [`08-creating-new-stack.md`](08-creating-new-stack.md) — `scaffold-stack` en detalle.
- [`14-deploy-and-secrets.md`](14-deploy-and-secrets.md) — `deploy/1` + `devvault/1` + sus comandos.
