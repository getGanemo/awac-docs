---
title: "ADR 007 — CLI agent-first: optimizado para consumo por agentes IA"
---

## Status

Accepted — 2026-05-01

## Context

`wsp` (el CLI de AWaC) lo van a usar principalmente **agentes IA**, no humanos. El flujo típico es:

1. Humano: *"Setupea esto como workspace AWaC para [producto]"*.
2. Agente: traduce el pedido a comandos del CLI y los ejecuta.
3. Humano: ve el resultado, no escribe comandos.

Este patrón es estructuralmente distinto a un CLI tradicional (humano lo invoca, lee output formateado, decide próximo paso).

La pregunta: **¿optimizamos `wsp` para humanos primero o para agentes primero?**

## Decision

**`wsp` se optimiza agent-first**: el target principal es un agente IA que invoca comandos, parsea outputs JSON, recupera de errores estructurados, y aprende a usar el CLI sin docs externas. La experiencia humana es secundaria pero no descuidada.

## Características concretas del diseño agent-first

### 1. `--json` en TODOS los comandos

Cada comando tiene `--json` que emite el resultado en formato máquina-parseable. El agente parsea, no scrappea texto.

### 2. Errores con `code` + `cause` + `remediation`

Cada error tiene un código predecible:

```json
{
  "status":      "error",
  "code":        "E_AUTH_REQUIRED",
  "category":    "auth",
  "message":     "GitHub authentication required.",
  "cause":       "gh CLI not authenticated.",
  "remediation": "Run `gh auth login`, then retry.",
  "exit_code":   2
}
```

El agente lee `code` y `remediation` y o bien aplica el fix automáticamente o te lo traslada como pregunta humana.

### 3. Cero prompts interactivos por default

Los comandos NO preguntan en stdin si falta info. Fallan con `E_MISSING_INPUT` listando exactamente qué falta y qué opciones existen. El agente recibe el error estructurado y o bien tiene la info para reintentar, o te pregunta a vos en lenguaje natural.

Hay un flag `--interactive` opt-in para casos donde un humano quiere usar el CLI directo.

### 4. Help exhaustivo, no resumido

`wsp <comando> --help` lista TODOS los flags, defaults, exit codes, y ejemplos. No "solo lo importante" — todo.

### 5. `wsp --agent-manifest`

Comando especial que emite el contrato completo del CLI en JSON: lista de comandos, args, flags, exit codes, JSON schemas de input/output, error codes, common workflows. El agente lo lee al inicio de la sesión y aprende a usar el CLI sin necesidad de docs externas.

### 6. Idempotencia garantizada

`bootstrap` y `sync` se pueden correr N veces sin efectos colaterales. El agente puede reintentar sin miedo.

### 7. Output predecible

- Sin colores ANSI cuando se detecta `--json` o stdout no es TTY.
- Logs con prefijo de nivel (`[INFO]`, `[WARN]`, `[ERROR]`) para filtrado fácil.
- UTF-8 limpio.

### 8. Comandos de auto-descripción

```bash
wsp templates --json
wsp shortcuts --json
wsp schema workspace
wsp doctor --json
```

El agente puede descubrir el estado del sistema sin docs.

## Options considered

### A. Human-first (CLI tradicional)

- Help conciso, output bonito con colores, prompts interactivos.

**Pros:**
- Familiar para devs que usan CLIs habituales.

**Cons:**
- **Inadecuado para nuestro flujo**: el agente tiene que parsear texto, manejar prompts (no puede), interpretar mensajes ambiguos.
- **Errores opacos**: "Could not find repo" no le dice al agente qué hacer.
- **Adivinanza**: el agente termina infiriendo intent, errando, vos resolvés.

### B. Hybrid (humano default, agent flag)

- Por default human-first, con `--agent` flag que activa modo agent.

**Pros:**
- "Mejor de los dos mundos".

**Cons:**
- **Doble carga de testing**: cada comando hay que validar dos modos.
- **Duplicación**: outputs y errores en dos formatos.
- **Confusión**: el agente puede olvidar el flag y romper.

### C. Agent-first (la elección)

- `--json` en todos los comandos.
- Outputs por default human-readable pero con `code` y estructura clara.
- Cero prompts interactivos por default.
- `--interactive` opt-in para humanos.

**Pros:**
- **Optimiza para el flujo real**: agentes invocan, humanos no.
- **Errores accionables**: el agente sabe recuperarse.
- **Discoverabilidad**: el agente aprende solo via `--agent-manifest`.
- **Testing único**: el contrato JSON es la fuente de verdad.

**Cons:**
- **CLI menos "lindo"** para uso humano directo. Mitigable: si un humano quiere usarlo, las salidas siguen siendo legibles, solo que sin colores chillones ni ASCII art.

## Consequences

### Positivas

- **Friction baja para el agente**: pocos casos de "no entendí qué pasó".
- **Recuperación automática** de errores comunes (auth, network, missing input).
- **Onboarding cero del agente**: lee `--agent-manifest` y sabe usar todo.
- **CLI testeable**: el contrato JSON es enforce-able.

### Negativas

- **No es un CLI "amigable" en el sentido tradicional**: no tiene wizard interactivo de onboarding ni outputs decorados. Esto es deseable para nuestro caso pero podría confundir a algún dev nuevo.
  - Mitigación: si un humano quiere usar el CLI, le decís *"el agente lo va a usar por vos, pero si querés invocarlo a mano, leé `wsp --help` o pasale `--interactive`"*.
- **Posible over-engineering** si AWaC se queda chico: para un equipo de 2-3 personas, agent-first puede sentirse demasiado. Mitigable: AWaC se diseñó para equipos medianos a grandes (15+ personas, decenas de workspaces/semana) — la inversión paga a esa escala.

## Implementación

El primer commit del repo `getGanemo/workspace-cli` será el **contrato** (`--agent-manifest` + JSON schemas), no la implementación. Eso garantiza que el contrato es estable desde día 1 y la implementación se construye encima.

## Notes

Esta decisión se tomó cuando el autor inicial observó durante el diseño: *"Yo ya no ejecuto comandos, todo lo hace el agente por mí — entonces, ¿qué significa que el CLI tenga 'buen help'?"*. La respuesta fue: el "buen help" tradicional no aplica — necesitamos un buen contrato para agentes.

## Ver también

- [`05-cli-reference.md`](../05-cli-reference.md) — referencia completa del CLI.
- [`11-faq.md`](../11-faq.md) — sección "Sobre el CLI".
