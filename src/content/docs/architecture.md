---
title: "Arquitectura de AWaC"
---

Este documento explica el **por qué** del diseño. Para el **qué** consultá las referencias técnicas (manifest, stack, CLI). Para el **cómo arrancar** consultá [`01-getting-started.md`](01-getting-started.md).

## Las dos grietas que motivan AWaC

Cuando un equipo crece y empieza a usar agentes IA en muchos proyectos, aparecen dos dolores **simultáneos** que tiran en direcciones opuestas:

### Drift

Los archivos que configuran al agente (rules, skills, workflows) se editan dentro de cada workspace. Esas mejoras locales no fluyen de regreso. La consolidación manual compite con shipear features y siempre pierde. Después de meses, hay 8 versiones distintas de la misma regla en 8 workspaces, y la "plantilla canónica" está atrás de todas.

### Bloat

Para servir a todos los productos, la plantilla acumula reglas y skills de cada uno. Cada nuevo workspace inherita TODO aunque toque solo uno. La ventana de contexto del agente se llena de material irrelevante. Sube costo de tokens, baja signal-to-noise.

**Las dos grietas no se resuelven con la misma palanca:**
- "Centralizá todo" empeora bloat.
- "Distribuí libremente" empeora drift.

AWaC necesita atacar ambas al mismo tiempo.

## La idea central: el workspace es la unidad de composición

Casi todos los frameworks de configuración de agentes IA disponibles hoy declaran **un agente** — sus tools, su prompt, su memoria. Funciona si el agente cambia mucho y el contexto cambia poco. Si es al revés (el mismo agente trabajando en muchos contextos distintos), están optimizando para la dimensión equivocada.

En un equipo multi-producto, lo que varía no es el agente — es el **slice de contexto organizacional** que el agente necesita para esta tarea. Cuando alguien abre un workspace para "fix bug en el módulo de integración del producto A", el contexto relevante es: rules del producto A + convenciones del ecosistema integrado + código del módulo + reglas universales del equipo. Una hora después, esa misma persona abre un workspace para "borrador de docs del producto B" y el contexto es completamente otro. Mismo agente. Lo que cambia es el envelope.

> **AWaC hace del workspace la unidad de composición**, no del agente. El manifiesto describe el envelope de contexto de la tarea, no la identidad del agente.

Esa decisión estructural es la que destraba todo lo demás.

## Las piezas

### 1. El **stack**

Un stack es una colección coherente y versionada de capacidades de agente (rules + skills + workflows + docs leíbles por agente) con un scope bien definido.

Ejemplos de scope significativo:
- **Core**: convenciones que aplican a todos los workspaces (commit style, branch policy, AWS safety, anti-prompt-injection).
- **Producto-específico**: una capa por producto interno (cada equipo declara su propio agent-stack).
- **Tecnología-específico**: por cada ecosistema con el que se integra (Odoo, AWS, Cloudflare, MCP).
- **Rol-específico**: por tipos de trabajo distintos (research, branding, tesis, etc.).

Cada stack vive en su propio repositorio de GitHub. **Una fuente de verdad por stack**.

### 2. El **manifest** (`workspace.yml`)

Cada workspace declara, en un único archivo, qué stacks compone:

```yaml
name: my-billing-feature
schema: awac/1
stacks:
  - core
  - aws
  - my-product
  - erp-partners
```

Cuatro líneas. El workspace no necesita escribir más. El resto se infiere desde los stacks.

### 3. El **registry** (en `getGanemo/agent-stack-core/awac.yml`)

Un único archivo central mapea nombres cortos (`my-product`) a paths completos (`my-product-org/agent-stack`). También cataloga las plantillas disponibles y las reglas que usa `wsp scaffold-stack` para introspectar orgs.

Es **lo único hardcodeado en el CLI**: la ubicación del registry. El resto del universo AWaC se descubre desde ahí.

### 4. El **CLI** (`wsp`)

Lee el manifest, resuelve los stacks vía registry, los clona, compone el `.agents/` resultante, clona los repos de código que cada stack declara como suyos, y genera los archivos de contexto del agente (`CLAUDE.md`, `AGENTS.md`).

### 5. Las **operaciones** (verbos del CLI)

- `init` — crear un workspace nuevo desde una plantilla.
- `bootstrap` — desde una carpeta vacía con `workspace.yml`, materializar todo.
- `sync` — re-aplicar el manifest, traer cambios upstream sin pisar locales.
- `status` — reportar drift, repos sucios, archivos editados sin promover.
- `templates` — listar plantillas disponibles.
- `scaffold-stack <org>` — introspectar un GitHub org y generar un agent-stack desde convenciones.
- `promote` (v2) — empujar una mejora local al stack que la origina, vía PR.
- `worktree` (v2) — aislar trabajo paralelo de múltiples agentes.

## Cómo se resuelven las dos grietas

### Bloat → resuelto por composición declarativa

Cada workspace declara **solo** los stacks que necesita. El equipo de Producto B nunca carga rules de Producto A. La ventana de contexto del agente se llena solo de material relevante a esta tarea concreta.

### Drift → resuelto por el loop bidireccional `sync` + `promote`

Cuando alguien edita un archivo localmente y quiere compartir la mejora, una sola línea de comando (`wsp promote <archivo>`) detecta de qué stack vino el archivo, abre un PR contra el repo de ese stack, y queda en gobernanza humana (review). Una vez merged, cualquier workspace que use ese stack lo recibe en su próximo `wsp sync`.

Antes: edit local → consolidar a mano cuando me acuerde → no se hace nunca.
Ahora: edit local → 1 comando → PR → review → merge → propagado a todos.

## La jerarquía de capas

Cuando `wsp sync` materializa un workspace, las capas se componen en este orden, **lowest priority first**:

```
1. core stack
2. additional stacks, en el orden declarado en workspace.yml
3. cloned repositories (sus archivos propios)
4. private_overlay (opcional, capa privada por dev)
5. local files (CLAUDE.local.md, WORKSPACE_PRIVATE.md)
```

Si dos stacks definen el mismo path, **el último declarado gana**. Determinístico, fácil de razonar.

## Topología típica en GitHub

A continuación, una topología de ejemplo (los nombres `<transversal-org>` y `<product-org>` representan placeholders — adaptalos a las orgs reales de tu equipo):

```
<transversal-org>/                  ← org transversal del equipo
├── agent-stack-core                ← REGISTRY + capabilities universales
├── agent-stack-aws                 ← AWS / SSM / EC2 / Terraform
├── agent-stack-mcp                 ← MCP servers
├── agent-stack-cloudflare          ← Pages / Workers
├── agent-stack-research            ← spikes, tesis, branding
├── workspace-cli                   ← CLI `wsp` (Python, pipx)
└── awac-docs                       ← este repo (docs)

<ecosystem-org>/                    ← orgs de ecosistemas compartidos (ej: Odoo)
├── agent-stack                     ← capa transversal del ecosistema
└── <module-X>, <module-Y>, ...     ← un repo por componente del ecosistema

<product-org>/                      ← una org por producto SaaS interno
├── agent-stack                     ← capa específica del producto
├── project_management
├── infrastructure
└── <product-code-repos>
```

## Convenciones de naming

- **Org transversal** con **varios** stacks → prefijo `agent-stack-<topic>`.
- **Productos** donde el org **es** el producto → repo simplemente `agent-stack` (no se repite el nombre del producto).
- **Plantillas** viven en `<stack>/templates/<nombre>.yml`. El catálogo central está en `<transversal-org>/agent-stack-core/awac.yml`.

## Anatomía de un stack repo

Cada stack repo tiene la misma estructura interna:

```
<stack-repo>/
├── awac.yml                ← meta del stack (ver 04-stack-reference.md)
├── README.md               ← qué contiene, cuándo usarlo
├── rules/                  ← reglas (markdown, prompt-injectable)
├── skills/                 ← skills (subcarpetas con SKILL.md)
├── workflows/              ← workflows (markdown procedurales)
└── templates/              ← workspace.yml skeletons (en algunos stacks)
```

El contenido del `awac.yml` varía según el tipo de stack:
- **`agent-stack-core`** → contiene el **registry** de shortcuts + catálogo de templates + reglas de scaffolding.
- **Stacks transversales** (`agent-stack-aws`, `mcp`, `cloudflare`, `research`) → solo metadata, sin `repos:` (no auto-clonan).
- **Stack de ecosistema** (ej. el stack Odoo `erp-partners/agent-stack`) → declara `module_convention` (cada módulo del ecosistema es su propio repo).
- **Stacks de producto** (uno por producto SaaS) → lista `repos:` con sus repos estándar más módulos cross-org asociados.

## Anatomía de un workspace

```
my-feature/
├── workspace.yml           ← lo único hand-authored
├── wsp.lock                ← SHAs pineados de cada stack y repo
├── CLAUDE.md               ← contexto compuesto (canónico)
├── AGENTS.md               ← mismo contenido (mirror para Codex/Cursor/Aider)
├── .gitignore              ← generado
├── .agents/                ← composición de stacks
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── project_management/     ← clonado por sync
├── infrastructure/         ← clonado por sync
└── ...                     ← más repos según los stacks
```

## Diferenciación de patrones similares

AWaC se diseñó después de revisar el espacio de patrones existentes. Lo más cercano que existe es la *Multi-Repo Workspace Strategy* (Sunghyun Roh, febrero 2026) basada en git submodules + jerarquía de archivos `CLAUDE.md`. Es un patrón sólido para **un solo producto, varios servicios**, con workspaces estables.

AWaC ataca un caso distinto: **múltiples productos**, decenas de workspaces efímeros por semana, múltiples GitHub orgs, equipos que rotan entre productos. Tabla comparativa:

| Dimensión | Multi-repo workspace (submodules) | AWaC |
|---|---|---|
| Scope de un workspace | Un producto, varios servicios | Una tarea, posiblemente cross-producto |
| Mecanismo de composición | Submodules + scripts | Manifest declarativo |
| Vida del workspace | Largo (estable) | Efímero |
| Workspaces por equipo / semana | Pocos | Decenas |
| Drift de capacidades | PR manual | `wsp promote` |
| Detección de drift | A ojo | `wsp status` |
| Multi-org GitHub | Implícito | Explícito |

## Por qué Workspace ≠ Agent

El término "Agent Workspace as Code" mete deliberadamente "Agent" en el nombre porque sin esa palabra se confunde con conceptos como "Workspace as Code" de Gitpod/Coder (entornos de desarrollo containerizados, otro problema).

Lo que AWaC declara **no es** el agente. **Es el envelope de contexto** que el agente necesita para esta tarea concreta. El agente sigue siendo el mismo (Claude / Cursor / Codex / etc.) — lo que varía y se compone es el contexto.

## Lecturas posteriores

- Si todavía no ejecutaste un workspace AWaC: [`01-getting-started.md`](01-getting-started.md).
- Para los detalles del manifest: [`03-manifest-reference.md`](03-manifest-reference.md).
- Para el contrato de cada stack: [`04-stack-reference.md`](04-stack-reference.md).
- Para los comandos del CLI: [`05-cli-reference.md`](05-cli-reference.md).
- Para entender por qué se eligió X sobre Y: [`decisions/`](decisions/).
