---
title: "ADR 002 — El registry vive en `agent-stack-core`"
---

## Status

Accepted — 2026-04-20

## Context

El manifest de un workspace usa atajos para declarar stacks:

```yaml
stacks:
  - core
  - aws
  - my-product
```

Esos atajos tienen que resolverse contra paths completos (`<transversal-org>/agent-stack-core`, `<transversal-org>/agent-stack-aws`, `<my-product-org>/agent-stack`). Hay un **mapping** que vivir en algún lado.

La pregunta: **¿dónde vive el registry de mappings?**

Opciones:
1. Hardcoded en el CLI.
2. En un repo dedicado (ej: `<transversal-org>/awac-registry`).
3. Dentro de `<transversal-org>/agent-stack-core/awac.yml`.
4. En un archivo de config local del workspace o del usuario.

## Decision

**El registry vive como una sección `shortcuts:` dentro de `<transversal-org>/agent-stack-core/awac.yml`.**

La única cosa hardcodeada en el CLI es la **ubicación del registry repo** (configurable via la env var `WSP_REGISTRY_REPO`). Todo lo demás se descubre leyendo el `awac.yml` de ese repo.

## Options considered

### A. Hardcoded en el CLI

**Pros:**
- Cero indirection. El CLI conoce todos los stacks built-in.

**Cons:**
- **Inflexible**: agregar un stack nuevo requiere release del CLI.
- **No portable**: otros equipos que adopten AWaC no pueden tener su propio registry sin forkear el CLI.
- **Acoplamiento**: el CLI deja de ser una herramienta agnóstica y se vuelve "el CLI de un solo equipo".

### B. Repo dedicado (`<transversal-org>/awac-registry`)

**Pros:**
- Separation of concerns: registry tiene su propio ciclo de vida.

**Cons:**
- **Sprawl**: un repo más a crear, mantener, dar permisos.
- **Bootstrap cost**: el CLI tiene que conocer la ubicación del registry de algún lado igual.
- **No aprovecha**: `agent-stack-core` ya se carga primero siempre. ¿Por qué no aprovechar?

### C. Dentro de `agent-stack-core/awac.yml` (la elección)

**Pros:**
- **Cero sprawl**: el registry vive en un repo que ya existe y ya se carga primero.
- **Single hardcoded thing**: solo la ubicación del registry repo.
- **Self-contained**: el contenido del registry se versiona junto con las rules/skills universales.
- **Otros equipos** pueden adoptar AWaC apuntando su CLI a su propio registry repo (config opcional, default Ganemo).

**Cons:**
- **Concern mixing**: `agent-stack-core/awac.yml` carga muchos roles (registry + templates catalog + scaffolding rules + meta del propio stack). Mitigable separando claramente las secciones del archivo.

### D. Config local por workspace o usuario

**Pros:**
- Flexibilidad máxima.

**Cons:**
- **Cada workspace replicando el registry** = el problema de drift que AWaC está tratando de resolver.
- **Inconsistencia**: distintos devs pueden tener distintas versiones del registry.

## Consequences

### Positivas

- **CLI minimalista**: una sola constante hardcoded (path del registry repo).
- **Onboarding sin fricción**: un dev nuevo no necesita configurar nada, el registry se descubre solo.
- **Escalable**: agregar un stack es 1 PR a `agent-stack-core/awac.yml`.
- **Portable**: otros equipos que quieran AWaC apuntan el CLI a su propio registry repo (con env var `WSP_REGISTRY_REPO`).

### Negativas

- **`agent-stack-core/awac.yml` se vuelve un archivo grande con varias secciones** (registry + templates + scaffolding + meta + agent_context default). Mitigable con buena estructura y comentarios.
- **Bootstrap requiere acceso al registry repo**: si el registry repo cae o pierde permisos, todo AWaC para. Mitigable con cache local agresivo (ya en el CLI: `~/.wsp/cache/`).

## Notes

El registry tiene tres secciones principales en `agent-stack-core/awac.yml`:
1. `shortcuts:` — mapeo nombre → path.
2. `templates:` — catálogo de templates.
3. `org_scaffold:` — reglas para `wsp scaffold-stack`.

Ver [`04-stack-reference.md`](../04-stack-reference.md) para el schema completo.

## Ver también

- [`02-architecture.md`](../02-architecture.md) — registry en el contexto general.
- [`04-stack-reference.md`](../04-stack-reference.md) — schema completo del registry.
- [`05-cli-reference.md`](../05-cli-reference.md) — env var `WSP_REGISTRY_REPO`.
