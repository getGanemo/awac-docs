---
title: "Migración desde una plantilla fija a AWaC"
---

Esta guía cubre cómo migrar de un setup donde cada nuevo proyecto se duplica desde una plantilla fija (un repo template, una carpeta sincronizada, etc.) a AWaC. La forma del problema es la misma para cualquier equipo que llegó a este punto.

## Contexto

Históricamente, muchos equipos arrancan cada nuevo proyecto duplicando una carpeta-plantilla compartida. Esa plantilla acumula `.agents/` (rules + skills + workflows) más estructura básica de directorios.

A escala (varios productos, decenas de workspaces nuevos por semana, equipo creciendo), el patrón se rompe por las dos grietas que motivan AWaC: **drift** (cada copia diverge sin que nadie consolide) y **bloat** (la plantilla acumula capacidades de cada producto y todas las copias las cargan).

## La decisión: soft cutover

Tres opciones suelen estar sobre la mesa cuando un equipo decide migrar:

**Hard cutover (descartado)**: dado X día, ningún workspace nuevo se duplica del template viejo, AWaC obligatorio. Demasiado violento — interrumpiría trabajos en vuelo.

**Coexistencia indefinida (descartado)**: cada quien elige hasta que el template viejo deje de ser útil. Nunca termina; el template viejo se mantiene "por si acaso" para siempre.

**Soft cutover (recomendado)**: a partir del día X:
- **Workspaces NUEVOS** se crean con AWaC (`wsp init`).
- **Workspaces EN VUELO** que arrancaron con el template viejo terminan con el template viejo y mueren naturalmente.
- El template viejo se considera **deprecated**: no recibe mejoras, no se documentan workarounds, su contenido va siendo migrado a los stacks AWaC.

## Lo que migrás

El contenido de `.agents/` del template viejo se distribuye en stack repos según su scope. Una matriz de migración típica:

| Stack destino | Contenido migrado |
|---|---|
| `<transversal-org>/agent-stack-core` | Rules universales, skills, workflows, templates blank, hooks |
| `<transversal-org>/agent-stack-aws` | Rules + skills + workflows AWS-específicas |
| `<transversal-org>/agent-stack-mcp` | Rules + workflows MCP-específicas |
| `<transversal-org>/agent-stack-cloudflare` | Skills + workflows de Cloudflare |
| `<transversal-org>/agent-stack-research` | Workflows + templates de research / branding / tesis |
| `erp-partners/agent-stack` | Rules + skills + workflows + templates Odoo |
| `<product-org>/agent-stack` (uno por producto) | Rules + workflows + templates específicos del producto |

## Lo que NO migrás (y por qué)

El template viejo tipicamente tiene carpetas que **no son contenido de stack** sino contenido **per-workspace**. Esas carpetas se vuelven repos per-producto en cada org cuando los productos se monten correctamente en GitHub:

- `addons/` y `addons_nativos/` (módulos Odoo) — workspace-específicos.
- `branding/` — workspace-específico.
- `infrastructure/` — la del template son ejemplos. Cada producto tendrá su propio `<org>/infrastructure`.
- `organization/` — docs org-level.
- `project_management/` — del template, no transferible. Cada producto tiene su propio `<org>/project_management`.

Los archivos root del template viejo (`CLAUDE.md`, `AGENTS.md`, `README.md`, `devvault.yml`, `odoo_deploy.yml`) son workspace-específicos y no migran.

## Proyectos en vuelo: qué hacer

### Si tu workspace nació antes del cutover

Tres opciones, según madurez del proyecto:

#### Opción A — Termínalo en el template viejo

Si está cerca de cerrar (semanas), no rompas nada. Termina, mergeá lo que tengas, archivá la carpeta. El template viejo seguirá funcionando sin mejoras hasta que el último workspace que dependa de él muera.

#### Opción B — Migrá tu workspace a AWaC manualmente

Si va a vivir varios meses más:

1. Identificá qué stacks debería tener tu workspace si lo crearas ahora desde cero.
2. Creá un nuevo workspace AWaC en otra carpeta:
   ```
   wsp init <new-name> --template <appropriate>
   wsp bootstrap
   ```
3. Compará los contenidos. Las cosas custom que tenías en el template viejo (notas en `CLAUDE.md`, configs específicas) las movés al bloque editable del nuevo `CLAUDE.md`.
4. El código de productos que estaba en el template viejo (en `addons/`, etc.) se preserva como repos clonados por el nuevo workspace.
5. Borrás la carpeta vieja cuando estés seguro.

#### Opción C — Híbrido temporal

Si tenés trabajo en vuelo crítico y no podés migrar ahora pero querés empezar a usar AWaC para subtareas: creá workspaces AWaC nuevos para las subtareas mientras el principal sigue en el template viejo. Migrá el principal cuando puedas.

## Plan de piloto: el primer producto

Migrar uno solo primero. El piloto valida que el sistema funcione end-to-end con un equipo real antes de roll-out al resto.

### Plan típico del piloto

| Semana | Acción | Quién |
|---|---|---|
| 0 | Cutover formal. Stacks subidos a GitHub. | core maintainer |
| 1 | CLI v1 mínimo (`init`, `bootstrap`, `sync`, `status`, `templates`). | core maintainer |
| 2 | Primer workspace AWaC real para una feature del producto piloto. Iterar feedback. | equipo del producto piloto |
| 3 | Agregar `scaffold-stack` al CLI. Probar con un producto lazy. | core maintainer |
| 4 | 3-5 workspaces AWaC en uso simultáneo en el producto piloto. | equipo del producto piloto |
| 4-6 | Recolección de feedback: qué duele, qué falta, qué sobra. | todos |
| 8 | **Retrospectiva formal del piloto**. Decidir: roll-out a otros productos, mejoras al CLI, ajustes a stacks. | core maintainer + equipo |

### Criterios de éxito del piloto

Al mes:

- [ ] Al menos 5 workspaces AWaC creados y usados productivamente en el producto piloto.
- [ ] CLI v1 estable (sin bugs críticos en init/bootstrap/sync).
- [ ] Templates funcionan: nadie tuvo que escribir un `workspace.yml` desde cero.
- [ ] Al menos 2 PRs de mejora a stacks (manuales pre-promote, o vía promote v2 si está listo).
- [ ] Encuesta interna: 80%+ del equipo piloto prefiere AWaC sobre el template viejo.

Si no alcanzamos esos criterios: **iterar 1-2 semanas más** antes de roll-out a otros productos.

## Cómo se "retira" el template viejo

Cuando todos los workspaces que dependen del template viejo hayan muerto (estimado: ~3-6 meses post-cutover):

1. Renombrar el repo del template viejo a `<old-name>_DEPRECATED_<YYYY-MM>`.
2. Agregar README al template renombrado: "DEPRECATED. Migrado a AWaC."
3. Eventualmente (1 año post-cutover): mover a archive o eliminar definitivamente.

## Mantenimiento post-cutover

Conforme aparezcan dudas o problemas, agregalos a [`11-faq.md`](11-faq.md). Si descubrís que faltan capabilities en un stack, abrí PR a ese stack. Si descubrís que falta un stack entero, arrancá con [`08-creating-new-stack.md`](08-creating-new-stack.md).

### Nuevas convenciones recomendadas

Después del cutover, dos convenciones que vale la pena formalizar:

- **`<product-org>/agent-stack/deploy.yml`** (schema `deploy/1`) — declara qué se deploya por producto. Ver [`14-deploy-and-secrets.md`](14-deploy-and-secrets.md).
- **`<product-org>/agent-stack/devvault.yml`** (schema `devvault/1`) — catálogo per-producto de secretos requeridos.

### Deprecation pointers en el workspace root del template viejo

Si tu template viejo tenía archivos legacy en la raíz (`devvault.yml`, `<product>_deploy.yml`), conviene reescribirlos como **deprecation pointers**: ya no contienen lógica, solo redirecciones a las ubicaciones nuevas. Si encuentras a un agente leyendo estos archivos legacy, redirígelo:

- `devvault.yml` (legacy, root) → ahora vive como **catálogo per-producto** en `<product-org>/agent-stack/devvault.yml`. El `vault_path` per-machine vive en `~/.devvault/.config.yml`.
- `<product>_deploy.yml` (legacy, root) → ahora vive como **componente del deploy spec** en `<product-org>/agent-stack/deploy.yml#components[]`. El flujo lo ejecuta el workflow correspondiente (por ejemplo `deploy_to_odoo_sh` en `erp-partners/agent-stack/workflows/`).

Los pointers se mantienen 1 release cycle más; cuando ningún workspace activo los lea, se borran del template legacy.

## Ver también

- [`02-architecture.md`](02-architecture.md) — modelo conceptual.
- [`12-governance.md`](12-governance.md) — métricas del piloto y SLA.
- [`decisions/`](decisions/) — historial de decisiones del cutover.
