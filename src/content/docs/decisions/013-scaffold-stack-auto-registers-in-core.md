---
title: "ADR 013 — `wsp scaffold-stack` auto-registra el producto en el core registry"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

Hasta v0.7.0 del CLI, `wsp scaffold-stack <org>` creaba el repo `<org>/agent-stack` con seed completo (awac.yml + templates/feature.yml + README.md), pero **no actualizaba el registry de core** (`<transversal-org>/agent-stack-core/awac.yml`). El usuario tenía que editar ese archivo a mano para:

1. Agregar `shortcut <product>: <org>/agent-stack` bajo `shortcuts:`.
2. Agregar entry `<product>-feature` bajo `templates:` apuntando al `templates/feature.yml` recién creado.

Sin ese paso manual, comandos como `wsp init my-feature --template <product>-feature` fallaban con `WSP_008 template_unknown` y `wsp shortcuts` no listaba el producto. Era exactamente el gap identificado durante un ejercicio de onboarding teórico de un producto nuevo.

## Decisión

`wsp scaffold-stack <org>` ahora **auto-registra** shortcut + template entry en el core registry como último paso del flujo, con un commit directo a `main` de `getGanemo/agent-stack-core/awac.yml`. Implementación en [`scaffold_stack_action.py#_register_in_core_registry`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/scaffold_stack_action.py).

Detalles:
- **Idempotente**: si el shortcut o template ya existen (string match), no-op.
- **Push directo a main** (sin PR): el cambio es additive (agregar líneas), de bajísimo riesgo, y `core` lo posee el maintainer del registry. El same-PR rule de governance no aplica acá porque no se toca `org_scaffold` (que es el espejo de la canonical doc).
- **Flag `--no-register`** para opt-out (debug, dry-run, casos edge donde el usuario quiere registrar a mano vía PR).
- **Reportado en el output** (`registry: ok — <product> registered in <transversal-org>/agent-stack-core` o `registry: skipped/no-op — <product> already registered`).

`wsp audit <product>` (mismo release v0.8.0) chequea explícitamente que `registry/shortcut` y `registry/template` estén presentes en core, validando que el auto-register hizo lo suyo.

## Consecuencias

**Positivas:**
- Onboardear un producto nuevo es **un solo comando** para el agent-stack + registry. El workflow `onboard_new_product` se simplifica un paso (Step 2 ya cubre el registry).
- Cero olvidos: imposible que el agent-stack quede creado pero no usable desde `wsp templates` / `wsp init`.
- `wsp audit` cierra el loop: si el auto-register fallara silenciosamente (corner case), el audit lo detecta inmediatamente.

**Negativas / trade-offs:**
- **Push directo a main de un repo crítico** (`agent-stack-core` lo cargan TODOS los workspaces). Mitigación: el cambio es estrictamente additive (agregar entries, nunca modificar/borrar) y el comando lo invoca solo el owner de la org transversal. Si el equipo crece a múltiples maintainers de core, se puede cambiar a PR mode con un flag `--register-via-pr`.
- **Falla silenciosa posible**: si el push a core falla por permisos, el comando no aborta el flujo (el agent-stack ya existe). Reporta el error en `registry_message` y exit code sigue 0. Mitigación: `wsp audit` lo detecta cuando el usuario lo corre.

## Alternativas consideradas

1. **PR en vez de push directo** — Más seguro, pero agrega un step humano (review + merge) que rompería la fluidez del workflow `onboard_new_product`. Mantenerlo como fallback opt-in (`--register-via-pr`) si en el futuro hace falta.
2. **Comando separado `wsp register-stack`** — Cleaner separation, pero introduce un step extra que el usuario olvida. La regla "sane defaults" gana: scaffold-stack hace lo correcto by default.
3. **Mantener manual y solo documentar** — El gap descubierto al diseñar el onboarding de un producto nuevo demostró que la friction era real (3+ pasos manuales fáciles de olvidar). No.

## Implementación

- Función: [`_register_in_core_registry`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/scaffold_stack_action.py).
- Flag: `--no-register` para opt-out.
- Output fields: `registry_updated: bool`, `registry_message: str`.
- Validación post-cambio: `wsp audit <product>` checks `registry/shortcut` + `registry/template`.

## Ver también

- [`05-cli-reference.md` § wsp scaffold-stack](../05-cli-reference.md).
- [`08-creating-new-stack.md` § Paso 5](../08-creating-new-stack.md).
- Workflow `onboard_new_product` (publicado en `<transversal-org>/agent-stack-core/workflows/`) — Step 2 depende de este auto-register.
- ADR 011 — `scaffold-repo --update` audita y abre PR (patrón análogo de "do the right thing by default").
