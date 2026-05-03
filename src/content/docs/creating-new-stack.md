---
title: "Crear un agent-stack nuevo"
---

Esta guía cubre el onboarding de un producto nuevo a AWaC: crear su `agent-stack` repo, declararlo en el registry, sembrar su template inicial.

## Cuándo crear un agent-stack

## Cuándo crear un agent-stack

Creás un stack nuevo cuando:

- **Un producto SaaS nuevo** entra al portfolio del equipo.
- **Una nueva tecnología transversal** se agrega y merece su propia capa de capacidades (por ejemplo, si en el futuro tu equipo adopta Snowflake intensivamente, crearías `<transversal-org>/agent-stack-snowflake`).
- **Un dominio funcional nuevo** emerge (por ejemplo `agent-stack-mobile` si empiezan a aparecer apps móviles cross-producto).

> **Tip**: si lo que estás creando es un **producto SaaS nuevo end-to-end** (org GitHub, dominio, AWS, etc.), invocá el workflow `onboard_new_product` (publicado dentro del stack `agent-stack-core` de tu equipo) en vez de seguir esta guía paso a paso. El workflow conduce los 9 pasos (incluyendo `wsp scaffold-stack` con auto-register, los Cat A repos, el `project_management` scaffold, el `devvault.yml` catalog, el audit entry en el doc canónico de governance, y el primer workspace local). Esta guía es para los casos en los que querés crear un stack manualmente (educational reference + caso de stacks transversales nuevos).

## Cuándo NO crear un agent-stack

- Si es **solo unas pocas rules/skills nuevas** que aplican a un stack existente: agregalas al stack existente vía PR, no crees uno nuevo.
- Si es **específico de un workspace** (ej: una rule particular para una feature): vivirá en el workspace y se promueve al stack adecuado cuando madure.
- Si es **algo experimental** que no sabés si va a perdurar: dejalo en un workspace o private overlay hasta que demuestre valor.

## Las dos vías para crear un stack

## Vía A — Manual (siempre disponible, recomendada para v1)

Cuando tenés tiempo y querés control fino del contenido inicial.

## Paso 1 — Crear el repo en GitHub

```bash
gh repo create <org>/agent-stack --private --description "Agent stack for <product>"
```

Convenciones:
- Producto SaaS: `<product-org>/agent-stack` (ej: `my-product/agent-stack`).
- Stack transversal: `<transversal-org>/agent-stack-<topic>` (ej: `<transversal-org>/agent-stack-mobile`).

## Paso 2 — Sembrar la estructura mínima

```
<stack-repo>/
├── awac.yml                ← meta del stack
├── README.md               ← descripción
├── rules/                  ← vacío al inicio si no hay nada
├── skills/                 ← vacío al inicio
├── workflows/              ← vacío al inicio
└── templates/              ← al menos un template "feature.yml"
    └── feature.yml
```

## Paso 3 — Escribir `awac.yml`

Para un stack de producto:

```yaml

## <product-org>/agent-stack/awac.yml

product: <product-name>
scope: <product>-saas

repos:
  - name: project_management
    branch_default: main
  - name: infrastructure
    branch_default: main
  # Agregá los repos estándar del producto que ya existan
```

Para un stack transversal:

```yaml

## <transversal-org>/agent-stack-<topic>/awac.yml

product: <transversal-org>
scope: <topic>
repos: []
```

Para un stack tipo Odoo (caso especial):

```yaml

## erp-partners/agent-stack/awac.yml — ya existe, pero como referencia

product: erp-partners
scope: odoo-development

module_convention:
  default_org: erp-partners
  path_prefix: "addons/"
  branch_default: "19-dev"
  repo_pattern: "{module_name}"

repos: []
```

## Paso 4 — Escribir el template inicial

```yaml

## <stack-repo>/templates/feature.yml

## Workspace template: <product>-feature

## Feature work on <product>.

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
  - aws            # si usa AWS
  - <atajo>        # tu nuevo stack
```

## Paso 5 — Registrar en el registry de core

## Paso 5 — Registrar en el registry de core

> **Desde `wsp` v0.8.0 este paso es automático**: `wsp scaffold-stack <org>` ya registra el shortcut + template entry en `<transversal-org>/agent-stack-core/awac.yml` con un commit directo a `main` (`--no-register` lo desactiva). ADR 013. Si seguís la Vía A (manual) o estás migrando un stack que no nació por scaffold-stack, hacelo a mano:

PR (o commit directo si sos owner) a `<transversal-org>/agent-stack-core/awac.yml` agregando:

**En `shortcuts:`:**

```yaml
shortcuts:
  # ... existentes ...
  <atajo>: <org>/<repo>
```

Convención de atajo:
- Para producto en su propia org: `<product-name>` → `<org>/agent-stack` (ej: `my-product: <my-product-org>/agent-stack`).
- Para stack transversal: `<topic>` → `<transversal-org>/agent-stack-<topic>`.

**En `templates:`:**

```yaml
templates:
  # ... existentes ...
  - name: <product>-feature
    description: "Feature en <Product>"
    path: <stack-repo>/templates/feature.yml
```

Después correr `wsp audit <product>` para verificar que `registry/shortcut` y `registry/template` queden en `[ok]`.

## Paso 6 — Documentar internamente

Si tu equipo mantiene un catálogo interno de stacks, agregá una entry para el nuevo stack ahí.

---

## Vía B — Automatizada (con `wsp scaffold-stack`)

Cuando el producto ya tiene varios repos en GitHub y querés autogenerar el agent-stack sin trabajo manual.

## Cómo funciona

```bash
wsp scaffold-stack <org-name>
```

El CLI:

1. **Introspecciona** el GitHub org `<org-name>`. Lista repos.
2. **Aplica las reglas** de `<transversal-org>/agent-stack-core/awac.yml/org_scaffold`:
   - Filtra repos contra `standard_repo_patterns`.
   - Asigna branches por convención.
   - Excluye los de `excluded_names`.
3. **Detecta módulos del ecosistema Odoo asociados** vía `odoo_module_detection` (busca `<product>_*` en `erp-partners`).
4. **Genera contenido propuesto**:
   - `<org>/agent-stack/awac.yml` con la lista resuelta de `repos`.
   - `<org>/agent-stack/templates/feature.yml` (default workspace template).
   - Updates a `<transversal-org>/agent-stack-core/awac.yml` (nuevo shortcut + template entry).
5. **Pregunta confirmación**.
6. Si acepta:
   - Crea repo `<org>/agent-stack` vía `gh repo create`.
   - Pushea contenido inicial.
   - Abre PR a `<transversal-org>/agent-stack-core` con la entry de registry.

## Ejemplo: scaffold de un producto nuevo

```bash
wsp scaffold-stack my-new-product
```

Output:

```
[1/4] Introspecting org 'my-new-product'...
  Repos found: 5
    ✓ project_management        → standard (main)
    ✓ infrastructure            → standard (main)
    ✓ backend                   → standard (develop)
    ✓ web                       → standard (develop)
    ✗ legacy-experiments        → no match in patterns, excluded

[2/4] Detecting Odoo modules associated with 'my-new-product'...
  Pattern: my_new_product_*  on org: erp-partners
  Found 0:
    (no Odoo modules detected)

[3/4] Proposed files:

  my-new-product/agent-stack/awac.yml:
  -----------------------------------
  product: my-new-product
  repos:
    - name: project_management
      branch_default: main
    - name: infrastructure
      branch_default: main
    - name: backend
      branch_default: develop
    - name: web
      branch_default: develop

  my-new-product/agent-stack/templates/feature.yml:
  -----------------------------------
  name: <CHANGE-ME>
  schema: awac/1
  stacks: [core, my-new-product]

  Updates to <transversal-org>/agent-stack-core/awac.yml:
  -----------------------------------
  shortcuts:
    + my-new-product: my-new-product/agent-stack
  templates:
    + - name: my-new-product-feature
        description: "Feature work on my-new-product"
        path: my-new-product/agent-stack/templates/feature.yml

[4/4] Apply?
  [a] Apply (creates my-new-product/agent-stack repo + opens PR to core registry)
  [d] Dry run
  [n] Cancel

> a

  Created repo my-new-product/agent-stack
  Pushed awac.yml + templates/feature.yml
  Opened PR #42 in <transversal-org>/agent-stack-core to update registry

Done. After PR #42 merges, run `wsp init <name> --template my-new-product-feature` to use it.
```

## Modos de scaffold-stack

## Modos de scaffold-stack

| Comando | Comportamiento |
|---|---|
| `wsp scaffold-stack <org>` | Primer scaffold. Si `<org>/agent-stack` no existe, lo crea (`gh repo create --private`) y pushea seed directo a `main`. |
| `wsp scaffold-stack <org> --update` | Repo existe (o se crea con seed mínimo en main si no existía). Push a side-branch `awac/scaffold-<date>` + abre PR para review. Reemplaza solo el bloque `repos:` del awac.yml; preserva `templates/feature.yml` y `README.md` si ya existen. |
| `wsp scaffold-stack <org> --no-push` | Genera el seed en un tempdir local; imprime el path. No toca GitHub. |
| `wsp scaffold-stack <org> --branch <name>` | Override del nombre de la side-branch en `--update`. |

**Nota (2026-05-03):** la implementación final difiere del diseño v0 que circulaba en versiones anteriores de este doc. Los flags `--dry-run`, `--include-extra` y `--exclude` no se shippearon — el comportamiento real sigue las reglas de `org_scaffold` (categorías A–E + `excluded_names` + `forbidden_names` + Cat E heuristic) sin opciones manuales de filtro. Ver [`05-cli-reference.md`](05-cli-reference.md) para el contrato actual.

## Cuándo conviene `--update`

Cada vez que la org gana repos relevantes (ej: tu producto agrega un nuevo `mobile` repo, o aparece un nuevo módulo Odoo `<product>_payments`), corrés:

```bash
wsp scaffold-stack <product-org> --update
```

El CLI detecta los cambios y abre un PR con la actualización del `awac.yml` del stack. Vos revisás y mergeás.

---

## Después de crear el stack

Independientemente de la vía:

1. **Documentar internamente** (si tu equipo mantiene un catálogo de stacks).
2. **Agregar al README de `<transversal-org>/agent-stack-core`** la mención del nuevo stack en la lista (si es transversal).
3. **Comunicar al equipo** que está disponible.
4. **El primer workspace que lo use** valida que todo funcione end-to-end. Esperá feedback antes de declararlo "estable".

## Convenciones a respetar

- **Naming**: `<product-org>/agent-stack` o `<transversal-org>/agent-stack-<topic>`. NO mezclar.
- **Atajos en registry**: lowercase, una palabra preferentemente. El atajo "lee" para humanos: `mobile`, `analytics`, etc.
- **Description del template**: una frase corta, action-oriented. "Feature en X", "Setup de Y", "Spike de Z".
- **Branches default**: respetá lo que el repo de producto realmente usa. Si el producto usa `develop` en backend, usá `develop`. Si usa `main` en infra, usá `main`. No inventes.

## Owner del stack nuevo

Por default, el creador queda como owner. Si el stack es de un producto, idealmente el owner es el líder funcional de ese producto. Si es transversal, el owner es quien mantenga el stack core o quien sea designado.

El owner es responsable de:
- Aprobar PRs de `wsp promote` que apunten a este stack.
- Mantener el `awac.yml` actualizado cuando cambian los repos del producto.
- Velar por la calidad de las rules/skills/workflows del stack.

Detalles en [`12-governance.md`](12-governance.md).

## Lazy stacks: cuándo y cómo

Un stack lazy es uno **registrado en el shortcuts** del registry pero cuyo repo **no existe todavía**. Útil cuando sabés que el producto va a entrar a AWaC pero todavía no tiene contenido.

Para activarlos: corré `wsp scaffold-stack <org>`. El shortcut ya está registrado; el comando crea el repo y popula el contenido.

## Ver también

- [`04-stack-reference.md`](04-stack-reference.md) — schema completo del `awac.yml` de un stack.
- [`05-cli-reference.md`](05-cli-reference.md) — `wsp scaffold-stack` en detalle.
- [`12-governance.md`](12-governance.md) — ownership y PR review SLA.
