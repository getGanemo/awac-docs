---
title: "ADR 004 — `CLAUDE.md` canónico + `AGENTS.md` mirror; `AGENT.md` y `CONVENTIONS.md` descartados del default"
---

## Status

Accepted — 2026-05-01

## Context

Cada agente IA en el ecosistema 2026 lee un archivo de contexto distinto al abrir un workspace:

| Agente | Archivo |
|---|---|
| Claude Code | `CLAUDE.md` |
| OpenAI Codex | `AGENTS.md` |
| Cursor (moderno) | `AGENTS.md` |
| Cursor (legacy) | `.cursorrules` o `.cursor/rules/*.mdc` |
| Aider | `AGENTS.md` o `CONVENTIONS.md` |
| Algunos otros | `AGENT.md` (singular) |

Si un dev usa Cursor y otro Claude Code, no podemos pedirle a cada uno renombrar el archivo. AWaC tiene que generar los archivos necesarios automáticamente.

La pregunta: **¿cuáles incluir en el default?**

## Decision

**Default mínimo viable: `CLAUDE.md` (canónico) + `AGENTS.md` (mirror).**

```yaml
# <transversal-org>/agent-stack-core/awac.yml
agent_context:
  canonical: CLAUDE.md
  mirrors:
    - AGENTS.md
```

**Descartados del default:**
- `AGENT.md` (singular) — demasiado nicho.
- `CONVENTIONS.md` (Aider) — demasiado nicho; Aider también lee AGENTS.md.
- `.cursorrules` y `.cursor/rules/*.mdc` — opt-in vía `extras` solo si el equipo lo necesita.
- `.github/copilot-instructions.md` — opt-in.

## Options considered

### A. Default máximo (todos los archivos)

Generar `CLAUDE.md`, `AGENTS.md`, `AGENT.md`, `.cursorrules`, `.github/copilot-instructions.md`, `CONVENTIONS.md`.

**Pros:**
- Cubre 100% del ecosistema.

**Cons:**
- **Ruido**: cada workspace tiene 6 archivos casi idénticos en su raíz.
- **Mantenimiento**: cada uno hay que regenerarlo; chance de que alguno quede desactualizado.
- **Mayoría de los archivos no se usan**: la mayoría del equipo usa Claude Code o Cursor.

### B. Default mínimo (solo `CLAUDE.md`)

**Pros:**
- Mínimo posible.

**Cons:**
- **Excluye Codex y Cursor**: si un dev del equipo abre el workspace con Codex, no encuentra contexto y la experiencia es mala.

### C. Default balanceado: `CLAUDE.md` + `AGENTS.md` (la elección)

**Pros:**
- **Cubre Claude Code (CLAUDE.md) + el resto del ecosistema mainstream (Codex, Cursor moderno, Aider) vía AGENTS.md** — un mirror logra cubrir ~95% de los devs.
- **Solo dos archivos**: poco ruido visual.
- **AGENTS.md es estándar emergente**: OpenAI lo promovió específicamente para Codex; Cursor y Aider lo adoptaron. Apostarle ahí es alinearse con la dirección del ecosistema.
- **Extras opt-in**: si un workspace específico necesita `.cursorrules` o `CONVENTIONS.md`, los suma vía `agent_context.extras`.

**Cons:**
- **No cubre `AGENT.md` (singular)**: algún tool exótico podría no encontrar contexto.
  - Mitigación: si surge la necesidad, se agrega como mirror via PR.

## Consequences

### Positivas

- **Workspace agnóstico al editor** para ~95%+ de los devs en cualquier equipo, sin ruido extra.
- **AGENTS.md spec compliance** (estándar emergente) cubierto.
- **Override fácil por workspace**: si un workspace específico necesita más, lo declara en su `workspace.yml/agent_context`.

### Negativas

- **Si alguien usa exclusivamente un tool que solo lee `AGENT.md` o `CONVENTIONS.md`**: no funciona out-of-the-box. Requiere editar `agent_context.extras` en su workspace.
- **Si en el futuro emerge un nuevo tool con su propio archivo (ej: `.deepagent.md`)**: hay que decidir si sumar al default o dejarlo opt-in. Cada caso se evalúa.

## Cómo se eligió específicamente CLAUDE.md como canónico (vs AGENTS.md)

- **CLAUDE.md tiene más historia** en el ecosistema (Anthropic lo introdujo temprano).
- **El autor inicial usa primariamente Claude Code**, así que el canónico va a tener un editor/usuario activo desde el día 1.
- **Si en el futuro Codex o Cursor crecen tanto que conviene invertir**, cualquier workspace puede declarar `agent_context.canonical: AGENTS.md` y poner CLAUDE.md como mirror. Reversible.

## Notes

Esta decisión incluyó iteración:
1. Propuesta inicial: `CLAUDE.md` + `AGENTS.md` + `AGENT.md` (3 mirrors).
2. Observación durante review: "AGENT.md singular es nicho, descartemos del default".
3. También: "CONVENTIONS.md también, no incluir".
4. Resultado: solo `CLAUDE.md` + `AGENTS.md`.

Detalles del bloque editable y cómo se preserva entre regeneraciones: [`10-agent-context-files.md`](../10-agent-context-files.md).

## Ver también

- [`10-agent-context-files.md`](../10-agent-context-files.md) — comportamiento completo.
- [`03-manifest-reference.md`](../03-manifest-reference.md) — schema de `agent_context` en workspace.yml.
- [`04-stack-reference.md`](../04-stack-reference.md) — schema de `agent_context` en core.
