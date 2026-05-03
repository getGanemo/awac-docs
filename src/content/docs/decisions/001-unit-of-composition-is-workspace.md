---
title: "ADR 001 — La unidad de composición es el workspace, no el agente"
---

## Status

Accepted — 2026-04-15

## Context

Cuando arrancamos a diseñar AWaC, exploramos los frameworks existentes para configuración declarativa de agentes IA. Casi todos siguen el mismo patrón: definir **un agente** (sus tools, su prompt, su memoria, sus skills) en un manifest, y ese manifest es la fuente de verdad para ese agente.

Ejemplos que revisamos:
- AgentSpec (universal agent manifest system).
- Gitclaw / open-gitagent (agent IS a git repo).
- ADL (Agent Definition Language) — "OpenAPI for AI Agents".
- Oracle Open Agent Spec.
- Microsoft 365 Declarative Agents.

Todos centran la unidad de composición en **el agente**: declarar UN agente, sus capacidades, su identidad.

Para nuestro caso de uso (un equipo que trabaja con muchos productos cruzados), esto no encajaba. El agente no varía workspace a workspace — es siempre Claude / Cursor / Codex / Aider. Lo que varía es el **slice de contexto organizacional** que ese agente necesita para esta tarea concreta:

- Workspace para "fix bug en módulo X de Producto A": rules de A + ecosistema integrado + módulo + reglas universales.
- Workspace para "draft docs de Producto B": rules de B + research conventions + branding.
- Workspace para "spike de investigación con NotebookLM": rules de research + MCP.

Mismo agente, mismo modelo, contextos completamente distintos.

## Decision

**La unidad de composición de AWaC es el workspace, no el agente.**

El manifest (`workspace.yml`) describe el envelope de contexto de la tarea, no la identidad del agente.

Concretamente:
- El workspace declara qué stacks compone.
- Los stacks contienen rules / skills / workflows que aplican a un dominio (producto, tecnología, rol).
- El agente es invariante; el workspace lo "viste" con el contexto apropiado para esta tarea.

## Options considered

### A. Unidad = el agente (como AgentSpec, gitclaw, ADL)

**Pros:**
- Estándar emergente en la industria.
- Más fácil de explicar a quien viene de DevOps de agentes.

**Cons:**
- Fuerza a redefinir el agente cada vez que cambia el contexto. Repetitivo y propenso a divergencia entre agentes "del producto X" y agentes "del producto Y" cuando en realidad son el mismo agente con distinto contexto.
- No resuelve el problema de drift (cada agente independiente acumula derivas).
- No resuelve el problema de bloat (un agente "universal" termina cargando todo).

### B. Unidad = el workspace (la elección)

**Pros:**
- Matchea la realidad operativa: lo que cambia entre tareas es el contexto, no la identidad del agente.
- Permite componer al nivel correcto de granularidad (un workspace = una tarea).
- Habilita los loops de `sync` y `promote` para resolver drift.
- Permite que cada workspace cargue solo lo necesario (resuelve bloat).

**Cons:**
- Menos común en la industria (a 2026-04). Hay que explicar por qué.
- Riesgo de confusión con "Workspace as Code" tipo Gitpod/Coder (dev environments containerizados, otro problema).
  - Mitigación: incluir "Agent" en el nombre → AWaC.

### C. Unidad híbrida = workspace + agent profile

**Pros:**
- Lo mejor de ambos mundos: declarar agente + contexto.

**Cons:**
- Sobreingeniería para los casos reales.
- Duplica esfuerzo: la mayoría de los devs usan Claude Code o Cursor con configs default. Declarar el agente es ruido.
- Empuja a los devs a tomar decisiones que no necesitan tomar.

## Consequences

### Positivas

- **Reduce drift y bloat al mismo tiempo** — el problema central que motivó AWaC.
- **Manifests pequeños y legibles** (3-6 líneas en el caso típico).
- **Composición declarativa** — vos describís el qué, el CLI resuelve el cómo.
- **Diferenciación clara** vs frameworks tipo AgentSpec.

### Negativas

- **Educación necesaria**: hay que explicar por qué el workspace es la unidad correcta. Algunos devs van a venir esperando declarar el agente.
- **No cubre el caso edge "agente especial"**: si en algún momento se necesita un workspace donde el agente sea no-default (ej: un Claude con prompt fundacional muy específico), AWaC no lo resuelve directamente. Mitigable con `agent_context.extras` para sumar un archivo extra de instrucciones.
- **Apuesta**: si la industria converge fuerte en "agent as the unit", AWaC va a quedar mal alineado. Bajo riesgo dada la flexibilidad del patrón.

## Notes

Esta decisión se refleja en el nombre del patrón: **Agent Workspace as Code** (workspace, no agent). El blog post y el gist explican esto explícitamente para audiencia externa.

## Ver también

- [`02-architecture.md`](../02-architecture.md) — modelo conceptual completo.
- [`11-faq.md`](../11-faq.md) — preguntas frecuentes que vuelven sobre esta decisión.
