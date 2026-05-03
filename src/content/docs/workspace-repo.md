---
title: "Workspace como repo (`workspace_repo`)"
---

Por default, un workspace AWaC es **desechable**: vive en una carpeta local (típicamente en Drive), sin ser un repo Git por sí mismo. Esto es lo correcto cuando un solo dev arma un workspace efímero para un trabajo puntual.

Pero hay casos donde tiene sentido que el workspace mismo sea **un repo Git versionado**: cuando varios devs colaboran sobre el mismo workspace y necesitan arrancar todos desde el mismo estado.

Esta guía cubre `workspace_repo: enabled: true`.

## Cuándo activar `workspace_repo`

**Activá `workspace_repo: true`** cuando:
- 2+ devs van a trabajar en el mismo workspace de forma sostenida.
- Querés que un dev nuevo del equipo se sume con un solo `git clone + wsp bootstrap` y obtenga el mismo estado.
- El workspace tiene notas o documentación específica que merece historia.
- Querés reproducibilidad temporal exacta (recuperar el estado del workspace de hace 6 meses).

**Dejalo en `false` (default)** cuando:
- Es un workspace efímero para un trabajo puntual.
- Lo va a usar solo un dev.
- No necesitás compartir el manifest con más gente.

## Default sin `workspace_repo`

Sin `workspace_repo`, el workspace vive solo en tu carpeta local. El `workspace.yml` se backupea via tu mecanismo de sync de archivos (por ejemplo Drive: sincronización + papelera + version history). Si querés recrearlo, `wsp init <name> --template <X>` lo regenera idéntico.

Para equipos con workspaces desechables y alta cadencia, este es el caso más común — y está bien.

## Configuración

```yaml
# workspace.yml
workspace_repo:
  enabled: true                   # default false
  org: my-product                 # opcional; si falta, se infiere
  name: billing-feature           # opcional; default workspace-<name>
  visibility: private             # private | internal | public  (default: private)
```

### Resolución del destino del repo

El CLI necesita saber **qué org** y **qué nombre** usar. Reglas, en orden de precedencia:

#### Para `org`:

1. **Manifest explícito** (`workspace_repo.org`) → usa eso.
2. **Inferencia**: toma el primer stack de **producto** declarado en `stacks:` (no transversal). Ignorando `core`, `aws`, `mcp`, `cloudflare`, `research`. Ejemplo: `stacks: [core, aws, my-product]` → `org = my-product`.
3. **Si todos los stacks son transversales** (workspace de research o branding): `org = <transversal-org>`.

#### Para `name`:

1. **Manifest explícito** (`workspace_repo.name`) → usa eso.
2. **Default**: `workspace-<workspace_name>`. Ejemplo: workspace `billing-feature` → repo `workspace-billing-feature`.

### Ejemplos de resolución

| `workspace.yml` | Repo creado |
|---|---|
| `name: my-feat`, `stacks: [core, product-a]`, sin override | `product-a/workspace-my-feat` (private) |
| `name: my-feat`, `stacks: [core, aws, product-b]`, sin override | `product-b/workspace-my-feat` (private) |
| `name: my-spike`, `stacks: [core, research]`, sin override | `<transversal-org>/workspace-my-spike` (private) |
| `name: foo`, `stacks: [core, product-a]`, `workspace_repo.org: <transversal-org>` | `<transversal-org>/workspace-foo` |
| `name: foo`, `stacks: [...]`, `workspace_repo.name: bar` | `<org>/bar` |

## Qué se commitea y qué se gitignorea

El CLI genera un `.gitignore` automático. Estos archivos **SÍ van** al repo:

- `workspace.yml` — el manifest (la fuente de verdad).
- `wsp.lock` — los SHAs pineados (la reproducibilidad temporal).
- `.gitignore` — generado por el CLI.
- Cualquier archivo que vos crees a mano dentro del workspace que **no** matchee el `.gitignore` (notas del equipo, docs específicas).

Estos archivos **NO van** al repo (gitignored):

- `.agents/` — regenerable desde stacks + lock. Versionarlo sería ruido en cada sync.
- Cada path declarado en `repos:` — son repos separados con su propia historia.
- `CLAUDE.md`, `AGENTS.md` — generados desde stacks + bloque editable.
- `CLAUDE.local.md`, `WORKSPACE_PRIVATE.md` — locales por dev.
- `.worktrees/`, `~/.wsp/cache/`, `node_modules/`, etc.

## Flujo de creación

Cuando corrés `wsp bootstrap` por primera vez con `workspace_repo.enabled: true`:

```
1. git init en la carpeta
2. Genera .gitignore con las reglas de arriba
3. Stage: workspace.yml, wsp.lock, .gitignore
4. Initial commit: "AWaC workspace bootstrap from template <X>"
5. Resuelve destino: <org>/workspace-<name>
6. Verifica si el repo existe en GitHub (gh repo view ...)
   ├── Si NO existe → gh repo create <org>/workspace-<name> --<visibility>
   └── Si existe    → ver "manejo de conflictos" abajo
7. git remote add origin <URL>
8. git branch -M main
9. git push -u origin main
```

Output del CLI:

```
Initialized workspace repo at my-product/workspace-billing-feature (private)
Pushed initial commit (abc123): "AWaC workspace bootstrap from template my-product-feature"
Remote: git@github.com:my-product/workspace-billing-feature.git
```

## Manejo de conflictos al crear

Si el repo ya existe en GitHub:

```
ERROR [E_REPO_EXISTS]: my-product/workspace-billing-feature already exists.
  Options:
    - Choose a different name:        wsp init <new-name> --template <X>
    - Adopt the existing repo as is:  wsp adopt-repo <url>
    - Force overwrite (DESTRUCTIVE):  wsp bootstrap --force-create-repo
```

Por default falla. Nunca pisa silenciosamente.

`wsp adopt-repo` (v2): clona el repo existente, valida que tiene un `workspace.yml` AWaC válido, lo trata como base y materializa todo lo demás.

## Flujo de un segundo dev que se suma

Cuando un colega abre el workspace existente:

```bash
git clone git@github.com:my-product/workspace-billing-feature.git
cd workspace-billing-feature
wsp bootstrap
```

`wsp bootstrap` detecta que ya hay un `workspace.yml` + `wsp.lock` → no necesita preguntar template ni nombre → directamente clona stacks (a los SHAs del lock) + repos de productos (en sus branches default). El segundo dev arranca con el **mismo estado exacto** que el primero. Reproducibilidad garantizada.

Para él, el flujo desde su perspectiva es igual de simple:

> "Acá tenés el repo del workspace billing-feature."
> Dev clona, abre en su editor, le dice al agente:
> *"Bootstrapeame este workspace AWaC."*
> Agente corre `wsp bootstrap`, listo.

## Evolución del lock (sync compartido)

Cuando el dev A quiere actualizar las versiones de los stacks:

```bash
wsp sync --update-locks
# CLI: actualiza wsp.lock con nuevos SHAs
# CLI: commitea automáticamente
git push
```

El dev B la próxima vez que entre:

```bash
git pull
wsp sync
# CLI ve que wsp.lock cambió → re-clona stacks a los nuevos SHAs
```

`wsp.lock` es básicamente el `package-lock.json` del workspace. Cambia cuando deliberadamente avanzás los SHAs upstream; queda estable cuando no.

## Caso edge: repos de productos clonados adentro

Las carpetas como `project_management/`, `infrastructure/`, `orchestrator/` son **otros repos Git** clonados adentro del workspace. Tienen su propio `.git/`. Para evitar que aparezcan como nested repos:

- El `.gitignore` autogenerado los excluye explícitamente por path.
- `git status` del workspace repo no los muestra (ni como modified ni como untracked).
- Cada uno se trabaja con sus propios commits/PRs apuntando a su propio remote (ej: `my-product/orchestrator`, no al workspace repo).

**El workspace repo NO contiene el código de los productos.** Solo contiene el manifest que dice "este workspace ensambla estos productos en estas versiones". El código de los productos vive en sus repos canónicos.

## Visibilidad

El default es **`private`**. Razones:
- Un workspace típicamente referencia repos privados (productos no open-source).
- Si fuera público accidentalmente, expondría qué proyecto está trabajando el equipo.

Cambiarlo requiere ser explícito (`visibility: public` en el manifest) — fuerza al dev a tomar la decisión consciente.

## Resumen mental

| Aspecto | Comportamiento |
|---|---|
| Org destino | `workspace_repo.org:` > primer stack de producto > `<transversal-org>` |
| Nombre del repo | `workspace_repo.name:` > `workspace-<workspace_name>` |
| Visibilidad | Default `private` |
| Qué se commitea | `workspace.yml` + `wsp.lock` + `.gitignore` + notas a mano |
| Qué se gitignorea | `.agents/`, repos de productos, archivos locales, generados |
| Si el repo existe | Falla con `E_REPO_EXISTS` (no pisa) |
| 2do dev | Clone + `wsp bootstrap` → mismo estado exacto |
| Update versions | `wsp sync --update-locks` → commit + push |
| Repos productos adentro | NO se versionan en el workspace repo |

## Anti-patterns a evitar

- ❌ **Activar `workspace_repo: true` en cada workspace por default.** Solo cuando hay colaboración real. Si no, es repo sprawl en GitHub.
- ❌ **Versionar `.agents/`.** Es regenerable. Cada sync que actualice un stack genera commits ruidosos.
- ❌ **Versionar las carpetas de repos clonados.** Son otros repos. Su contenido pertenece a su propio remote.
- ❌ **Pushear secretos al workspace repo.** Si tu workspace tiene un private overlay con credenciales, asegurate que el overlay esté en su propio repo privado y NO en el workspace repo.

## Ver también

- [`03-manifest-reference.md`](03-manifest-reference.md) — schema de `workspace_repo` en el manifest.
- [`05-cli-reference.md`](05-cli-reference.md) — comportamiento de `bootstrap` con `workspace_repo: true`.
- [`12-governance.md`](12-governance.md) — quién puede crear repos en cada org.
