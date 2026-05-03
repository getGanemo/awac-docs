# LinkedIn — launch post (ES)

> Audiencia: LATAM + España, perfil técnico/founder. Tono: personal, story-driven, sin tecnicismos pesados de entrada.
> Recomendado: martes o jueves, 09:00–11:00 hora local (CDMX/Buenos Aires/Madrid). Largo: 1500–2500 caracteres (sweet spot LinkedIn).

---

## Versión principal (ES)

```
Hace un año empecé a usar Claude Code, Cursor y Aider en serio en mis proyectos.

A los tres meses tenía 12 proyectos abiertos. A los seis, cada uno tenía un
.agents/ folder ligeramente distinto. Una regla de seguridad de AWS estaba
escrita una forma en el repo de un cliente y otra en el de otro. Una skill
de despliegue estaba copiada en 5 lugares con 3 versiones diferentes.

Es lo que cualquier ingeniero llamaría "drift". Y es el asesino silencioso
de la productividad cuando usás agentes IA en escala.

Pasé los últimos meses construyendo la solución que necesitaba. Lo llamo
AWaC — Agent Workspace as Code. Es la idea de Infrastructure as Code,
pero aplicada a la carpeta .agents/ que tu agente IA lee.

Cómo funciona:

  1. Declarás tu workspace en un workspace.yml (5 líneas).
  2. Listás los "stacks" que necesitás (core, aws, mcp, tu-producto).
  3. Corrés `wsp bootstrap`.
  4. Tu .agents/ se compone determinísticamente desde repos versionados.
  5. Un lockfile garantiza que todos en el equipo tienen exactamente
     lo mismo.

El unlock es enorme:
- Actualizar una regla = actualizar un repo. Propaga a todos los workspaces.
- Agregar AWS al proyecto = agregar 'aws' al yaml.
- Onboarding nuevo dev = clone + wsp bootstrap. Sin "¿dónde están las reglas?".

Esta semana abro el código bajo MIT. CLI, 5 stacks de referencia, sitio
de docs con 14 ADRs documentando cada decisión de diseño.

100% local. Sin SaaS. Sin telemetría. Te lo bajás, lo usás, lo modificás
para tu equipo.

Si llegaste hasta acá: probalo. 90 segundos.

  github.com/getGanemo/workspace-cli

Y si tenés un equipo usando agentes IA en serio, escribime: lo que más me
sirve ahora son críticas a la abstracción. ¿Qué regla tuya no encaja
limpiamente en este modelo?

#AI #DevTools #OpenSource #AgentEngineering #ClaudeCode #Cursor
```

## Versión segunda (más corta, más directa)

```
Si usás Claude Code, Cursor o Aider en más de 2 proyectos, ya conocés
este dolor:

- Cada .agents/ es un copy-paste del último.
- Las reglas divergen en semanas.
- Onboarding de un dev nuevo = "¿dónde está el CLAUDE.md correcto?"

Construí AWaC para resolverlo: Infrastructure as Code, pero para la
carpeta que tu agente IA lee.

Un workspace.yml + stacks versionados + un CLI que compone
determinísticamente. Lockfile incluido. MIT, 100% local, pipx-install.

Hoy abro el código.

→ github.com/getGanemo/workspace-cli
→ Docs + 14 ADRs en github.com/getGanemo/awac-docs

Probálo en 90 segundos. Y decime qué le falta.

#AI #DevTools #OpenSource
```

## Hooks alternativos (si la primera versión no engagea)

- "Llevo un año peleando con el .agents/ folder. Hoy abro la solución."
- "Por qué tu CLAUDE.md va a divergir entre proyectos (y cómo evitarlo)."
- "El patrón Terraform aplicado a la configuración de agentes IA. Open source."
- "Construí la herramienta que querías existiera. AWaC, MIT, hoy."

## Versión EN (audiencia mixta)

Si querés también versión inglés para perfiles internacionales (Anthropic devrel, Cursor team, etc.) — usar la versión en `dev-to-blog.md` cortada al primer ~2000 caracteres.

## Follow-up activity

Día 1: comentar en cada respuesta sustantiva. No solo "thanks", traer al
respondedor a una conversación técnica concreta.

Día 3-7: posts cortos en LinkedIn cada 2 días — "primer issue de la
comunidad", "stack que alguien acaba de publicar", "una decisión que
revisaríamos en v2".
