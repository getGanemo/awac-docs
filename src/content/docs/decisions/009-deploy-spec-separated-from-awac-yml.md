---
title: "ADR 009 — `deploy.yml` separado de `awac.yml`; CLI plan-only, ejecución workflow-driven"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

Cuando formalizamos el flujo de deploy de cada producto (Odoo.SH, AWS, Cloudflare), tuvimos dos preguntas independientes:

1. **¿Dónde vive el spec del deploy de un producto?**
2. **¿La ejecución del deploy es responsabilidad del CLI o del workflow?**

Ambas opciones tenían defensores razonables al diseñar.

## Decisión

### 1. El spec vive en `<product-org>/agent-stack/deploy.yml`, NO en `awac.yml`.

Schema formal `deploy/1` (`wsp schema deploy`).

Razones:
- `awac.yml` ya carga: `product`, `scope`, `repos:`, `module_convention`. Sumar `deploy:` lo engorda y mezcla concerns (definición de stack vs definición de despliegue).
- Un PR que toca el deploy debería ser fácil de revisar separado de un PR que agrega un repo nuevo al stack.
- Schemas separados → validación independiente.

### 2. El CLI es plan-only; la ejecución vive en workflows.

`wsp deploy <product>` lee + valida + imprime el plan. **Nunca pushea a Odoo.SH ni AWS.** La ejecución la orquesta el workflow router universal `deploy_product` (publicado en `<transversal-org>/agent-stack-core/workflows/`), que delega a topical workflows por target (`deploy_to_odoo_sh` en `erp-partners/agent-stack/workflows/`, `deploy_to_aws_ecs` en `<transversal-org>/agent-stack-aws/workflows/`, etc.).

Razones:
- **Cada target tiene lógica rica target-específica** que no encaja en un comando genérico. Ejemplos del flow Odoo.SH: browser fallback cuando `ci/odoo.sh` reporta falsamente, polling rounds con back-off, `ir.logging` health check post-build, fast-forward-only promote a la rama canónica. Esto en CLI requeriría plugins por target o un blob enorme.
- **Los workflows son markdown ejecutado por agentes**: tienen contexto natural para hablar con el usuario, pedir ack humano, leer logs y razonar sobre fallos. El CLI ya hizo lo suyo (validar el spec) cuando el workflow toma el control.
- **Separation of concerns clean**: el CLI valida estructura y reporta; el workflow ejecuta y dialoga.

## Consecuencias

**Positivas:**
- `awac.yml` queda focused en definición del stack.
- Cada target puede tener su workflow rich sin engordar el CLI.
- Cambios al flow Odoo.SH no obligan a actualizar el CLI.
- Cualquier dev puede correr `wsp deploy <product>` para ver el plan antes de pedir ejecución, sin riesgo de side effects.

**Negativas / trade-offs:**
- El developer/agente debe seguir dos pasos (`wsp deploy --plan` → invocar workflow). Mitigación: el rule `use_deploy_spec` y la skill `create_deploy_spec` enseñan esto explícitamente.
- Si un usuario corre `wsp deploy` esperando que despliegue, no pasa nada. Mitigación: el output dice claramente "This is a plan. Actual execution is workflow-driven."

## Alternativas consideradas

1. **`awac.yml#deploy`** — engordaba el archivo y mezclaba concerns.
2. **CLI ejecuta el deploy** — descartado por la riqueza target-específica que requeriría.
3. **GitHub Actions per producto** — cada producto tendría su propio CI; pero lo que se quiere es agente-driven con human ack, no CI auto.

## Implementación

- Schema: [`getGanemo/workspace-cli/wsp/schemas/deploy.schema.json`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/schemas/deploy.schema.json).
- Action module: [`wsp/deploy_action.py`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/deploy_action.py).
- Comando: [`wsp deploy`](../05-cli-reference.md).
- Workflow router: [`deploy_product`](https://github.com/getGanemo/agent-stack-core/blob/main/workflows/deploy_product.md).
- Rule: [`use_deploy_spec`](https://github.com/getGanemo/agent-stack-core/blob/main/rules/use_deploy_spec.md).
- Skill: [`create_deploy_spec`](https://github.com/getGanemo/agent-stack-core/tree/main/skills/create_deploy_spec).
- Topical (Odoo): [`deploy_to_odoo_sh`](https://github.com/erp-partners/agent-stack/blob/main/workflows/deploy_to_odoo_sh.md).

## Ver también

- [`14-deploy-and-secrets.md`](../14-deploy-and-secrets.md).
- ADR 010 — DevVault two-layer (separación análoga: catálogo per-producto, vault path per-machine).
