---
title: "Architecture Decision Records (ADRs) — AWaC"
---

Cada decisión arquitectónica importante de AWaC queda documentada acá con su contexto, las opciones consideradas, y por qué se eligió esa. En 6 meses cuando alguien se pregunta "¿por qué hicimos esto así?", la respuesta está versionada y es buscable.

## Formato

Cada ADR sigue el formato Michael Nygard:

```

## Título

## Status

Accepted | Superseded | Deprecated

## Context

La situación que motivó la decisión.

## Decision

Lo que decidimos hacer.

## Consequences

Los efectos esperados (positivos y negativos).
```

## Índice

| # | Título | Status | Fecha |
|---|---|---|---|
| 001 | [La unidad de composición es el workspace, no el agente](001-unit-of-composition-is-workspace.md) | Accepted | 2026-04-15 |
| 002 | [El registry vive en agent-stack-core](002-registry-in-agent-stack-core.md) | Accepted | 2026-04-20 |
| 003 | [Stacks de productos se llaman simplemente "agent-stack"](003-product-stacks-named-agent-stack.md) | Accepted | 2026-05-01 |
| 004 | [CLAUDE.md canónico + AGENTS.md mirror; AGENT.md y CONVENTIONS.md descartados](004-claude-canonical-agents-mirror.md) | Accepted | 2026-05-01 |
| 005 | [Some product stacks remain lazy until first use](005-lazy-stacks-until-first-use.md) | Accepted | 2026-05-01 |
| 006 | [docs-agentic como nombre del repo de documentación](006-docs-agentic-naming.md) | Accepted | 2026-05-02 |
| 007 | [CLI agent-first: optimizado para consumo por agentes IA](007-cli-agent-first.md) | Accepted | 2026-05-01 |
| 008 | [`wsp governance check` vive en el CLI, no en GitHub Actions](008-governance-mirror-cli-not-ci.md) | Accepted | 2026-05-03 |
| 009 | [`deploy.yml` separado de `awac.yml`; CLI plan-only, ejecución workflow-driven](009-deploy-spec-separated-from-awac-yml.md) | Accepted | 2026-05-03 |
| 010 | [DevVault two-layer model: catálogo per-producto + `vault_path` per-machine](010-devvault-two-layer-model.md) | Accepted | 2026-05-03 |
| 011 | [`wsp scaffold-repo --update` audita README existente y abre PR](011-scaffold-repo-audits-existing-readmes.md) | Accepted | 2026-05-03 |
| 012 | [Distribución del CLI vía GitHub Releases (wheel attached), no PyPI](012-cli-via-github-releases-not-pypi.md) | Accepted | 2026-05-03 |
| 013 | [`wsp scaffold-stack` auto-registra el producto en el core registry](013-scaffold-stack-auto-registers-in-core.md) | Accepted | 2026-05-03 |
| 014 | [AWaC se abre como open-source, no se monetiza como SaaS](014-awac-open-source-not-saas.md) | Accepted | 2026-05-03 |

## Cómo agregar un ADR

1. Identificá el siguiente número.
2. Copiá el template en un archivo `<NNN>-<slug-corto>.md`.
3. Llenalo con: contexto, decisión, opciones consideradas, consecuencias.
4. Agregá la entry al índice de arriba.
5. PR a `getGanemo/awac-docs`.

## Cuándo escribir un ADR

- Cualquier decisión que **afecta a la arquitectura** o al diseño del sistema (no a la implementación puntual).
- Cualquier decisión donde **se consideraron múltiples opciones** y elegir mal hubiera tenido consecuencias.
- Cualquier decisión que **futuros engineers se preguntarían por qué**.

NO escribir ADR para:
- Decisiones de implementación (cómo se llama una variable, qué library usar).
- Bugfixes triviales.
- Decisiones del día-a-día (qué task hacer primero).
