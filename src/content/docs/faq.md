---
title: "Preguntas Frecuentes (FAQ)"
---

Recopilación de las preguntas que surgieron durante el diseño y onboarding de AWaC. Si encontrás una pregunta no respondida acá, agregala vía PR junto con la respuesta.

---

## Conceptos básicos

### ¿Qué es AWaC en una frase?

Una metodología para componer **workspaces** de agentes IA declarativamente desde **stacks** versionados en GitHub, con sincronización bidireccional. Un solo manifest (`workspace.yml`) declara todo; un CLI (`wsp`) lo materializa.

### ¿Por qué AWaC y no usar una plantilla compartida copiada a mano?

A escala (múltiples productos, decenas de workspaces por semana, equipos creciendo), la plantilla duplicada genera dos problemas simultáneos: **drift** (cada copia diverge sin que nadie consolide) y **bloat** (la plantilla acumula capacidades de cada producto y todas las copias las cargan). AWaC ataca ambos al mismo tiempo. Para detalles: [`02-architecture.md`](02-architecture.md).

### ¿AWaC reemplaza a Claude Code / Cursor / Codex?

No. AWaC es **complementario**: arma el contexto que esos agentes necesitan. El agente sigue siendo el que tenés. AWaC garantiza que cuando vos abrís un workspace, el agente encuentra (en `CLAUDE.md` / `AGENTS.md`) un contexto consistente y actualizado.

### ¿Para quién es AWaC?

Para cualquier equipo o persona que cree workspaces para trabajar con un agente IA — ingeniería, soporte funcional, consultoría, marketing, finanzas. La era del "vibecoding" borró la línea entre quienes "hacen ingeniería" y quienes no — todos compartimos workspaces, todos abrimos carpetas en editores con agentes.

### ¿Por qué se llama "Workspace as Code" y no "Agent as Code"?

Porque la unidad de composición es el **workspace** (el slice de contexto para una tarea concreta), no el agente. El agente (Claude / Cursor / Codex) es constante. Lo que varía workspace a workspace es el contexto que necesita. AWaC declara el contexto.

---

## El flujo del usuario

### ¿Cómo arranco un workspace AWaC?

Tres pasos:

1. Creás carpeta vacía en tu máquina o folder sincronizado.
2. La abrís en tu editor.
3. Le decís al agente: *"Setupea esto como workspace AWaC para [producto]."*

El agente hace todo el resto. Detalles en [`01-getting-started.md`](01-getting-started.md).

### ¿Tengo que ejecutar comandos de CLI a mano?

No. El agente corre el CLI por vos. Vos solo describís lo que querés.

### ¿Y si el agente me pregunta "qué template?"?

Significa que no le diste suficiente info. Respondé con el template y nombre del workspace, y continúa.

### ¿Si no le indico el nombre de un proyecto, qué hace el agente?

Te pregunta. No adivina. Idealmente te lista todas las plantillas disponibles con sus descripciones para que elijas. Esto es comportamiento deseable, no un bug.

### El flujo sería: corro `wsp init`, eso crea el `workspace.yml` y luego ¿tengo que completar esa carpeta a mano?

No. Son dos comandos: `wsp init` crea el manifest, `wsp bootstrap` lo materializa (clona stacks, repos, genera `CLAUDE.md`/`AGENTS.md`). Después de los dos, no tocás nada más a mano.

### ¿El paso sería: creo carpeta, la abro en editor, le digo al agente que use AWaC?

Exactamente. El agente reconoce el contexto (carpeta vacía + tu pedido), corre `wsp init . --template <X>` y `wsp bootstrap`. Listo.

---

## Sobre el manifest (`workspace.yml`)

### ¿Dónde vive el `workspace.yml`?

En la **raíz de la carpeta del workspace al que pertenece**. Uno por proyecto. No se centraliza.

### ¿Hay un repo central de manifests?

No. Cada workspace tiene su propio `workspace.yml` localmente. Los workspaces son desechables; el `workspace.yml` es trivialmente recreable desde su template.

### ¿Cómo backupeo el `workspace.yml`?

Si tu workspace vive en un folder sincronizado (Drive, Dropbox, OneDrive), el sync lo backupea (sync + papelera + version history). Si querés versionarlo en Git, activá `workspace_repo: enabled: true` (ver [`09-workspace-repo.md`](09-workspace-repo.md)).

### Si pongo `workspace_repo: true`, ¿cuál es la lógica para creación del repo?

El CLI resuelve `org` y `name` así:
- **`org`**: manifest explícito > primer stack de producto declarado > org transversal default.
- **`name`**: manifest explícito > `workspace-<workspace_name>`.

Por default visibility = `private`. Si el repo ya existe → falla con `E_REPO_EXISTS` (no pisa). Detalles completos en [`09-workspace-repo.md`](09-workspace-repo.md).

### ¿Qué se commitea al workspace repo cuando uso `workspace_repo: true`?

`workspace.yml`, `wsp.lock`, `.gitignore`, y archivos a mano que crees. NO se commitea `.agents/` ni los repos de productos clonados (cada uno tiene su propio `.git/`).

### Si en el manifest declaro solo `core`, ¿cómo sabe el agente que viene de `<transversal-org>/agent-stack-core`?

Vía el **registry**. El registry vive en `<transversal-org>/agent-stack-core/awac.yml/shortcuts`. Mapea atajos cortos a paths completos. Es la **única cosa hardcodeada** en el CLI: la ubicación del registry. Todo lo demás se resuelve leyéndolo.

### Si los repos los declaro en el `awac.yml` de cada stack, ¿ya no los repito en el manifest?

Correcto. Declarar un stack de producto en `stacks:` automáticamente clona los repos que ese stack declara en su `awac.yml/repos`. Solo agregás repos al manifest si querés un subset (`include:`), excluir alguno (`exclude:`), o un repo extra que no está en ningún stack (`extra_repos:`).

### Si un producto no-Odoo tiene módulos Odoo asociados, ¿también puedo declararlos en el `awac.yml` del producto?

Sí. Es exactamente la idea. Por ejemplo, un `<product-org>/agent-stack/awac.yml` puede declarar sus repos propios + sus módulos Odoo en `erp-partners` (cross-org):

```yaml
repos:
  - name: project_management
  - name: backend
  - name: my_product_connector
    org: erp-partners
    path: addons/my_product_connector/
    branch_default: 19-dev
```

Cuando un workspace declara `stacks: [my-product]`, se clonan tanto los repos del producto como el módulo Odoo asociado, en sus paths correctos.

---

## Sobre stacks y registry

### ¿Cómo se mapea el nombre de un producto al repo de su agent-stack?

Vía el `shortcuts:` del registry. Si la org real en GitHub se llama `<my-org>`, podés registrar un atajo más corto y lectura natural (por ejemplo `my-product` → `<my-org>/agent-stack`). El CLI resuelve el atajo cuando el manifest declara `stacks: [..., my-product]`.

### ¿Por qué algunos stacks tienen prefijo `agent-stack-X` y otros solo `agent-stack`?

- Cuando una org tiene **varios** stacks (como una org transversal con `core`, `aws`, `mcp`, `cloudflare`, `research`), cada uno necesita un nombre distinto → prefijo `agent-stack-<topic>`.
- Cuando una org **es** un producto y solo tiene un stack, el repo se llama simplemente `agent-stack`. La org provee el namespace; no se repite el nombre del producto.

### Si querés ahorrarme escribir el `workspace.yml`, ¿podés tener una plantilla en alguna parte del registry?

Sí, son los **templates**. Catalogados en `<transversal-org>/agent-stack-core/awac.yml/templates`, con archivos en cada stack. Se usan vía `wsp init <name> --template <id>`. Detalles en [`06-templates.md`](06-templates.md).

### Las múltiples plantillas que el agente encuentra, ¿dónde es que las encuentra?

Dos niveles:
- **Catálogo**: `<transversal-org>/agent-stack-core/awac.yml/templates` (centralizado).
- **Archivos**: `<stack>/templates/<nombre>.yml` (distribuido por stack).

El catálogo apunta al archivo. Para editar una plantilla: editás el archivo en el stack. Para registrar / renombrar / borrar una plantilla: editás el catálogo. Detalles en [`06-templates.md`](06-templates.md).

### ¿Qué pasa si querés revisar los repos de una org y armar el `agent-stack` automáticamente?

Eso es `wsp scaffold-stack <org>`. Introspecciona la org en GitHub, aplica las reglas de `org_scaffold` declaradas en core, y genera el `awac.yml` y template del nuevo stack + abre PR al registry. Detalles en [`08-creating-new-stack.md`](08-creating-new-stack.md).

---

## Sobre el CLI

### ¿El CLI tiene buen help?

Sí, está diseñado **agent-first**. Eso significa:
- Help exhaustivo, no resumido.
- Modo `--json` en TODOS los comandos.
- Errores con `code` + `cause` + `remediation` accionables.
- Cero prompts interactivos por default.
- Comando `wsp --agent-manifest` que emite el contrato completo en JSON para que el agente aprenda a usarlo sin docs externas.

Detalles en [`05-cli-reference.md`](05-cli-reference.md).

### ¿Por qué el CLI está diseñado para agentes y no para humanos?

Porque cada vez más devs no corren el CLI directamente — el agente lo hace por ellos. Los humanos describen lo que quieren; el agente traduce a comandos. El CLI debe ser sin ambigüedad para que el agente no se equivoque ni tenga que preguntarte cosas obvias.

### ¿Necesito instalar el CLI?

Sí, una vez por máquina. La instalación canónica es vía `gh release download` + `pipx install`. Detalles en [`05-cli-reference.md`](05-cli-reference.md).

### ¿Qué pasa si el CLI falla?

Devuelve un `code` de error específico (`E_AUTH_REQUIRED`, `E_REPO_NOT_FOUND`, etc.) con `remediation` clara. El agente lee el error y o bien aplica el fix automáticamente o te lo traslada como pregunta humana. Lista de error codes en [`05-cli-reference.md`](05-cli-reference.md#errores-con-código).

---

## Sobre archivos de contexto

### ¿Qué archivos de contexto se generan en el workspace?

Por default, dos: `CLAUDE.md` (canónico) y `AGENTS.md` (mirror). Ambos con el mismo contenido, regenerados en cada `wsp sync`.

### ¿Por qué dos archivos con el mismo contenido?

Porque cada agente busca su archivo "de fábrica" en lugares distintos:
- Claude Code lee `CLAUDE.md`.
- OpenAI Codex, Cursor, Aider leen `AGENTS.md`.

Generamos los dos para que cualquier agente que abra el workspace encuentre su archivo. Detalles en [`10-agent-context-files.md`](10-agent-context-files.md).

### ¿Y para Codex de OpenAI específicamente?

`AGENTS.md` (plural). Es el estándar que OpenAI promovió para Codex. Ya está cubierto en el default.

### ¿Y `AGENT.md` (singular)?

Demasiado nicho. No está en el default. Si algún workspace específico lo necesita, se agrega como `extras` opt-in en `agent_context`.

### Si edito `CLAUDE.md` a mano, ¿se pierde en el próximo sync?

**Solo lo que escribas dentro del bloque editable** (entre `<!-- @awac:editable-start -->` y `<!-- @awac:editable-end -->`) se preserva. El resto se regenera desde los stacks. Si necesitás escribir algo persistente, hacelo dentro del bloque editable.

### ¿Y si edito `AGENTS.md` a mano?

`wsp status` te avisa que es un mirror y tus cambios se van a perder en el próximo sync. Movelos al bloque editable de `CLAUDE.md`.

---

## Sobre estructura organizacional y documentación

### ¿Dónde se publica esta documentación?

En `getGanemo/awac-docs` (este repo). Es el sitio público de docs de AWaC.

### ¿Cómo organizar la documentación interna de un equipo que adopta AWaC?

Si tu equipo ya tiene un patrón `docs-<dominio>` (`docs-engineering`, `docs-treasury`, etc.), un repo `docs-agentic` o `docs-awac` interno es el lugar natural para notas que NO son públicas (postmortems, decisiones internas, audits). Lo importante: la doc pública (este sitio) describe AWaC en general, y la doc interna describe cómo lo usa tu equipo en particular.

---

## Sobre publicación pública

### ¿AWaC es público?

Sí. El CLI vive en [`getGanemo/workspace-cli`](https://github.com/getGanemo/workspace-cli) (MIT). Estos docs viven en [`getGanemo/awac-docs`](https://github.com/getGanemo/awac-docs).

### ¿Quién acuñó AWaC?

Fernando Pastor. La cuenta de GitHub `GanemoCorp` (que parece de organización pero es personal) es donde vive la versión inicial del gist con la spec.

---

## Diseño y decisiones

### ¿Por qué la unidad de composición es el workspace y no el agente?

Porque el agente no varía workspace a workspace — sigue siendo Claude / Cursor / Codex. Lo que varía es el envelope de contexto que el agente necesita. Componer al nivel del agente es optimizar para la dimensión equivocada. Detalles en [`02-architecture.md`](02-architecture.md) y [`decisions/001-unit-of-composition-is-workspace.md`](decisions/001-unit-of-composition-is-workspace.md).

### ¿Por qué el registry vive en `agent-stack-core` y no en un repo separado?

Para reducir hardcoded en el CLI a una sola cosa: la ubicación del registry repo. Dado que `core` siempre se carga primero (es la fundación universal), aprovechamos para meter el registry ahí. Sin sprawl de repos. Detalles en [`decisions/002-registry-in-agent-stack-core.md`](decisions/002-registry-in-agent-stack-core.md).

### ¿Por qué algunos stacks son "lazy"?

Porque crear repos vacíos por anticipado es deuda. Un stack lazy queda registrado en `shortcuts:` (visible en `wsp shortcuts`) pero su repo no se crea hasta que hay contenido real (primer proyecto que lo necesita). Ver ADR 005.

### ¿Por qué se descartó AGENT.md (singular) del default?

Demasiado nicho. AGENTS.md (plural) cubre el ecosistema mainstream (Codex, Cursor, Aider) con un solo archivo. Sumar AGENT.md sin uso real era ruido innecesario.

### ¿Por qué CLAUDE.md como canónico y no AGENTS.md?

Porque CLAUDE.md es el archivo de contexto con más historia en el ecosistema y el primer ciudadano del agente más usado por el autor inicial. Cualquier workspace puede invertir esto vía override en `agent_context`.

---

## ¿No encontraste tu pregunta?

Agregala vía PR a este archivo junto con la respuesta. Si no tenés la respuesta, abrí un issue en [`getGanemo/awac-docs`](https://github.com/getGanemo/awac-docs/issues) y la resolvemos juntos.
