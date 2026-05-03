---
title: "ADR 010 — DevVault two-layer model: catálogo per-producto + vault_path per-machine"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

El template viejo (un repo template fijo del que se duplicaban proyectos) tenía un `devvault.yml` en la raíz que mezclaba dos cosas:

1. **El catálogo de secretos** que el producto necesita (`aws: aws/<product>.yml`, `cloudflare: providers/cloudflare.yml`, ...).
2. **El path local del vault** en la máquina del developer (`vault_path: "C:/Users/<dev>/.devvault"`).

Cuando AWaC reemplaza el template, ese archivo no encaja: el catálogo es per-producto y debería estar versionado; el path es per-machine y NUNCA debería entrar a un repo.

## Decisión

Separar en dos archivos con dueños distintos:

| Layer | Path | Per | Versionado | Schema |
|---|---|---|---|---|
| **Catálogo** | `<product-org>/agent-stack/devvault.yml` | producto | ✅ | `devvault/1` |
| **Vault path** | `~/.devvault/.config.yml` | máquina | ❌ | (libre, una sola key `vault_path`) |
| **Secret values** | `~/.devvault/<vault_path>/<relative_path>` | máquina | ❌ | n/a |

El schema `devvault/1` **explícitamente prohíbe** una clave `vault_path` dentro del catálogo (tests cubren este caso). Es la barrera que impide la regresión al patrón viejo.

## Consecuencias

**Positivas:**
- El catálogo se vuelve versionable: cualquier dev del producto ve los mismos secretos requeridos.
- El path local se vuelve trivial de cambiar (un solo dev cambia su `~/.devvault/.config.yml`, los demás no se enteran).
- `wsp doctor` puede chequear que `~/.devvault/.config.yml` exista en cada máquina sin tocar el catálogo.
- `wsp secrets check <product>` valida cumplimiento per-producto contra el vault local (read-only).
- Onboarding nuevo dev: clona, instala wsp, crea `~/.devvault/.config.yml`, copia secretos del 1Password de la org. Tres pasos.

**Negativas / trade-offs:**
- Dos archivos en lugar de uno. Mitigación: la rule `use_devvault.md` codifica el modelo y el schema rechaza el camino fácil-pero-malo.
- Los devs pueden meter mal `vault_path` en el catálogo por hábito. Mitigación: el schema rechaza explícitamente.

## Alternativas consideradas

1. **Un solo archivo `<product>/devvault.yml` versionado con `vault_path` libre** — descartado: terminás versionando el path de un dev específico y los demás lo tienen que sobrescribir, perpetuando el patrón malo.
2. **Variables de entorno `DEVVAULT_PATH`** — funciona pero más friccionado para Windows + Git Bash (donde el flujo viejo vive). El archivo es más simple.
3. **Catálogo en variables de entorno** — perdés versioning + searchability + diff en PR. No.

## Implementación

- Schema: [`getGanemo/workspace-cli/wsp/schemas/devvault.schema.json`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/schemas/devvault.schema.json).
- Action module: [`wsp/secrets_action.py`](https://github.com/getGanemo/workspace-cli/blob/main/wsp/secrets_action.py).
- Rule universal: `use_devvault.md` (publicada en `<transversal-org>/agent-stack-core/rules/`).
- Comando: [`wsp secrets check <product>`](../05-cli-reference.md).
- `wsp doctor` step: `devvault_config`.
- Catálogos vivos: cada producto que adopta AWaC publica el suyo en `<product-org>/agent-stack/devvault.yml`.

## Ver también

- [`14-deploy-and-secrets.md`](../14-deploy-and-secrets.md).
- ADR 009 — Patrón análogo de separación: deploy spec separado del awac.yml.
