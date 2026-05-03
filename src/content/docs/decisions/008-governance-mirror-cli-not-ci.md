---
title: "ADR 008 — Governance mirror check vive en el CLI, no en GitHub Actions"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

El espejo machine-readable de governance (`<transversal-org>/agent-stack-core/awac.yml#org_scaffold`) debe mantenerse alineado con el documento canónico de governance del equipo (típicamente un repo privado `docs-company/governance/product-structure.md`). La regla "same-PR" requiere un guard que detecte divergencias.

La primera implementación fue un **GitHub Actions workflow** en `agent-stack-core/.github/workflows/governance-mirror.yml`. El workflow clonaba el repo de governance (privado) usando un PAT guardado como repo secret `DOCS_COMPANY_TOKEN` y corría un comparator Python.

Ese setup obligaba al maintainer a:
1. Crear un fine-grained PAT con read-access al repo de governance.
2. Agregarlo como repo secret en `agent-stack-core`.
3. Renovarlo cuando expire.

## Decisión

El chequeo se mueve al CLI: **`wsp governance check`** + un step `governance_mirror` dentro de `wsp doctor`. Se elimina el workflow GitHub Actions y el script standalone.

El CLI ya tiene `gh` autenticado en la máquina del developer (requisito para clone privados). Reutiliza esa autenticación, sin PAT/secret nuevo. El chequeo se corre antes de pushear cambios a `awac.yml` o al doc canónico.

## Consecuencias

**Positivas:**
- Cero setup extra para el maintainer actual o futuros.
- El chequeo se puede correr **localmente antes de commit**, no solo post-push.
- Removed surface: 1 workflow + 1 script + 1 secret requirement.
- `wsp doctor` cubre el chequeo automáticamente.

**Negativas / trade-offs:**
- El chequeo **no corre automáticamente** en cada PR — depende del developer/agente correrlo. Mitigación: la skill `manage_project_state` y el rule `use_deploy_spec` lo recuerdan; `wsp doctor` lo cubre como rutina.
- Devs que no tengan el CLI instalado no obtienen el guard. Mitigación: el workflow `install_wsp` automatiza la instalación, y los workspaces AWaC siempre lo traen via `wsp sync`.
- Si alguien edita el repo de governance directamente desde la web GitHub, el chequeo no lo detecta hasta que alguien con CLI hace `wsp governance check`. Mitigación aceptable porque ese flujo es marginal — la mayoría de los cambios llegan via PR de un dev con CLI.

## Alternativas consideradas

1. **Mantener el GitHub Actions workflow** — descartado por el setup PAT/secret y la fricción para nuevos maintainers.
2. **GitHub App con instalación cross-repo en la org transversal** — eliminaría el PAT, pero es complejidad no justificada para una org del tamaño actual.
3. **Hook git pre-commit** — fragmenta la responsabilidad (cada dev tiene que instalarlo); el CLI ya está instalado por convención.

## Implementación

- Comparator: [`getGanemo/workspace-cli/wsp/governance.py`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/governance.py).
- Comando: [`wsp governance check`](../05-cli-reference.md).
- `wsp doctor` step: `governance_mirror`.

## Ver también

- [`12-governance.md`](../12-governance.md)
- ADR 002 — Registry vive en `agent-stack-core`.
