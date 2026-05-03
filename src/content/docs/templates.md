---
title: "Templates de `workspace.yml`"
---

Los templates son **skeletons** de `workspace.yml` reusables. Cuando el agente corre `wsp init <name> --template <id>`, el CLI fetchea el template, substituye placeholders (`<CHANGE-ME>` con el nombre del workspace), y escribe el `workspace.yml` resultante en la carpeta del workspace.

## Arquitectura: catálogo central + archivos distribuidos

El sistema de templates tiene **dos niveles** que conviene tener claros:

### Nivel 1 — Catálogo (índice + descripciones)

Vive en **un solo lugar**: `<transversal-org>/agent-stack-core/awac.yml`, sección `templates:`.

```yaml
templates:
  - name: product-a-feature
    description: "Feature work on product A (orchestrator API + infra)"
    path: <product-a-org>/agent-stack/templates/feature.yml
  - name: product-b-feature
    description: "Feature work on product B with Odoo modules"
    path: <product-b-org>/agent-stack/templates/feature.yml
  ...
```

Es **la fuente única del catálogo**. Cuando `wsp templates` lista, lee de acá.

### Nivel 2 — Archivos (el contenido `workspace.yml` real)

Cada archivo de template vive en el `templates/` del stack al que pertenece — distribuido, no centralizado:

```
<transversal-org>/agent-stack-core/templates/
└── blank.yml

<transversal-org>/agent-stack-research/templates/
├── spike.yml
├── branding.yml
├── empresarial.yml
└── tesis.yml

erp-partners/agent-stack/templates/
├── single-module.yml
└── existing-modules.yml

<product-a-org>/agent-stack/templates/
└── feature.yml

<product-b-org>/agent-stack/templates/
└── feature.yml
```

## Ejemplo de templates en una topología típica

| Template | Path real | Descripción |
|---|---|---|
| `blank` | `<transversal-org>/agent-stack-core/templates/blank.yml` | Workspace mínimo. Editá a tu gusto. |
| `research-spike` | `<transversal-org>/agent-stack-research/templates/spike.yml` | Investigación / spike, sin código de producto |
| `branding` | `<transversal-org>/agent-stack-research/templates/branding.yml` | Workspace para crear archivo de marca de un producto |
| `empresarial` | `<transversal-org>/agent-stack-research/templates/empresarial.yml` | Proyecto empresarial generalista |
| `tesis` | `<transversal-org>/agent-stack-research/templates/tesis.yml` | Proyecto académico / tesis |
| `odoo-module` | `erp-partners/agent-stack/templates/single-module.yml` | Desarrollo de un módulo Odoo standalone |
| `odoo-modules-existing` | `erp-partners/agent-stack/templates/existing-modules.yml` | Trabajar sobre módulos Odoo existentes |
| `<product>-feature` | `<product-org>/agent-stack/templates/feature.yml` | Feature work on a specific product (one entry per product) |

## Cómo usar un template

### Variante normal — el agente lo elige

```
Vos: "Setupeame este folder como workspace para una feature de mi producto."
Agente: corre `wsp init . --template <product>-feature` y `wsp bootstrap`.
```

### Variante interactiva — sin saber el nombre

```
Vos: "Necesito armar un workspace AWaC."
Agente: corre `wsp templates`, te muestra la lista, vos elegís.
```

### Variante manual — vos sabés exactamente qué querés

```
Vos: "Setupea con plantilla `<product>-feature`, llamalo `payments-v2`."
Agente: corre `wsp init payments-v2 --template <product>-feature` y `wsp bootstrap`.
```

## Anatomía de un template

Un template es un `workspace.yml` con placeholders. El placeholder canónico es `<CHANGE-ME>` (el CLI lo reemplaza con el nombre del workspace). Otros placeholders quedan para que el dev los ajuste manualmente después.

### Ejemplo: `blank.yml`

```yaml
# Workspace template: blank
# El workspace mínimo válido. Editá a tu gusto.
#
# Usage: wsp init <name>                  (default si --template se omite)
#        wsp init <name> --template blank

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
```

### Ejemplo: `<product>-feature.yml`

```yaml
# Workspace template: <product>-feature
# Feature work on a single product (orchestrator API + infra).
#
# Auto-clones (per <product-org>/agent-stack awac.yml):
#   <product-org>/project_management   → ./project_management/
#   <product-org>/infrastructure       → ./infrastructure/
#   <product-org>/orchestrator         → ./orchestrator/
#
# Usage: wsp init <name> --template <product>-feature

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
  - aws
  - <product>
```

### Ejemplo: `single-module.yml` (Odoo)

```yaml
# Workspace template: odoo-module
# Develop a single new (or existing standalone) Odoo module.
#
# Usage: wsp init <name> --template odoo-module
# After init, edit the modules: list to point to the actual module(s).

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
  - org: erp-partners
    modules:
      - <MODULE-NAME>           # cambia esto al nombre del módulo
                                # cloned to addons/<MODULE-NAME>/ on 19-dev
```

Acá hay un placeholder adicional `<MODULE-NAME>` que el dev edita a mano después de `wsp init`.

### Ejemplo: feature template para un producto con conector Odoo

```yaml
# Workspace template: <product>-feature
# Feature work on a product whose stack also declares Odoo connector modules.
#
# Auto-clones (per <product-org>/agent-stack awac.yml):
#   <product-org>/project_management         → ./project_management/
#   <product-org>/infrastructure             → ./infrastructure/
#   <product-org>/backend                    → ./backend/
#   <product-org>/frontend                   → ./frontend/
#   erp-partners/<product>_connector         → ./addons/<product>_connector/  (19-dev)
#
# Usage: wsp init <name> --template <product>-feature

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
  - aws
  - <product>
  - erp-partners        # required because the Odoo connector modules need
                        # the Odoo capability stack
```

## Mantenimiento: dónde se edita qué

| Querés... | Editás... |
|---|---|
| Cambiar el contenido de una plantilla (qué stacks declara, qué placeholders) | El archivo `templates/X.yml` en el stack al que pertenece |
| Renombrar una plantilla, cambiar su descripción, o cambiar a qué archivo apunta | `getGanemo/agent-stack-core/awac.yml` (sección `templates:`) |
| Agregar una plantilla **nueva** | Dos pasos: (1) crear `templates/X.yml` en el stack que tiene sentido, (2) agregar entry al catálogo de core via PR |
| Eliminar una plantilla | Dos pasos: (1) borrar la entry del catálogo, (2) borrar el archivo del stack |

## Por qué dividido (catálogo + archivos)

**El catálogo en core (centralizado):**
- Es lo que el CLI lee SIEMPRE (porque core se carga primero).
- Da una sola fuente para "qué existe".
- Cualquier cambio al catálogo pasa por PR review en `<transversal-org>/agent-stack-core` — gobernanza fuerte.

**Los archivos en cada stack (distribuidos):**
- El dueño de cada producto cura sus propias plantillas sin tener que tocar el repo de core.
- Si un producto quiere agregar un `<product>-hotfix.yml`, su owner lo crea en su agent-stack y abre PR a su propio repo + un PR chico al catálogo de core para registrarlo.
- Las plantillas evolucionan al ritmo del producto, no al ritmo del registry central.

## Crear una plantilla nueva

### Paso 1 — Crear el archivo

```yaml
# <product-org>/agent-stack/templates/hotfix.yml
# Workspace template: <product>-hotfix
# Hotfix urgente (rama hotfix, CI específico).
#
# Usage: wsp init <name> --template <product>-hotfix

name: <CHANGE-ME>
schema: awac/1
stacks:
  - core
  - aws
  - <product>
# El dev debe editar el branch del orchestrator a la rama hotfix después.
```

PR a `<product-org>/agent-stack`. Merge.

### Paso 2 — Registrar en el catálogo

PR a `<transversal-org>/agent-stack-core/awac.yml` agregando:

```yaml
templates:
  # ... existentes ...
  - name: <product>-hotfix
    description: "Hotfix urgente (rama y CI específicos)"
    path: <product-org>/agent-stack/templates/hotfix.yml
```

Merge. La próxima vez que cualquier agente corra `wsp templates`, ya aparece.

## Plantillas y `wsp scaffold-stack`

Cuando `wsp scaffold-stack <org>` crea un agent-stack nuevo (ej: para un producto que recién entra a AWaC), genera automáticamente:

1. `<org>/agent-stack/templates/feature.yml` (default workspace template).
2. PR a `<transversal-org>/agent-stack-core/awac.yml` agregando la entry de template al catálogo.

Vos revisás y mergeás. La plantilla queda registrada sin intervención manual extra.

## Ver también

- [`03-manifest-reference.md`](03-manifest-reference.md) — los campos de `workspace.yml` que cada template puede usar.
- [`05-cli-reference.md`](05-cli-reference.md) — `wsp init` y `wsp templates`.
- [`08-creating-new-stack.md`](08-creating-new-stack.md) — cómo `scaffold-stack` genera templates por producto.
