---
title: "ADR 011 — `wsp scaffold-repo --update` audita README existente y abre PR"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

La governance del equipo define una convención de README per-categoría (A–E) para todo repo de producto. Para hacer cumplir la convención necesitábamos dos modos:

1. **Crear un repo nuevo** con README seed que ya cumpla.
2. **Auditar un repo existente** y mejorarlo si no cumple, sin destruir el contenido que ya tenga.

La pregunta era cuán "agresivo" debía ser el modo audit: ¿overwrite, o append, o solo report?

## Decisión

`wsp scaffold-repo <full> --category <X> --update` opera así:

1. Lee el README live via `gh api repos/<full>/readme`.
2. Audita contra el checklist de la categoría: `missing_required`, `missing_recommended`, `too_short` (< 200 chars).
3. Si pasa el audit → no-op. Reporta OK y exit 0.
4. Si falla → clona el repo, **append** las secciones faltantes con placeholders `<TODO: …>` al final del README, **preservando todo el contenido existente verbatim**, push a side-branch `awac/readme-audit-<date>`, abre PR.

Sin `--update`, contra un repo existente, el comando refusa con remediation explícita ("use --update").

## Consecuencias

**Positivas:**
- Cero destrucción de contenido humano. Lo que el dev escribió antes queda intacto.
- El PR es revisable: el reviewer ve exactamente qué se agregó y reemplaza los placeholders con el contenido real.
- El audit es reusable como signal: `wsp scaffold-repo <full> --category <X> --no-push` reporta el estado sin tocar nada.
- Cubre el caso "el repo nació sin README" (genera completo) y "el README está incompleto" (parchea) con la misma flag.

**Negativas / trade-offs:**
- Los placeholders `<TODO: …>` quedan en main si nadie los reemplaza. Mitigación: el checklist en la skill `create_repo_readme` lista la sustitución de placeholders como step obligatorio antes de cerrar.
- El audit es estructural (busca headings) — no detecta secciones presentes con contenido pobre. Mitigación: el `too_short` chequeo (< 200 chars) es la red de seguridad para README stubs.

## Alternativas consideradas

1. **Reemplazar el README completo con el template** — descartado: destruye contenido humano, los devs verían el cambio como hostil.
2. **Solo reportar (no parchear)** — descartado: quien lee el reporte es el agente, que entonces tiene que hacer el parche manualmente. Mejor que el CLI lo haga consistentemente.
3. **Modo interactivo** que pregunta sección por sección — descartado: contra la filosofía CLI agent-first (cero interactivo por default).

## Implementación

- Action module: [`wsp/scaffold_repo_action.py`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/scaffold_repo_action.py).
- Funciones clave: `audit_readme()`, `patch_existing_readme()`, `run_scaffold_repo()`.
- Comando: [`wsp scaffold-repo`](../05-cli-reference.md).
- Skill `create_repo_readme` (publicada en `<transversal-org>/agent-stack-core/skills/`).
- Primera validación live: un PR en un repo `<product-org>/orchestrator` con audit FAIL (README ausente) generó un seed Cat C de 48 líneas.

## Ver también

- [`05-cli-reference.md`](../05-cli-reference.md) — sección `wsp scaffold-repo`.
