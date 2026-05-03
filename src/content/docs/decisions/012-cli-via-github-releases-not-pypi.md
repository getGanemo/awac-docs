---
title: "ADR 012 — Distribución del CLI vía GitHub Releases (wheel attached), no PyPI"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado (fase actual; revisar al lanzamiento público).

## Contexto

Tras los primeros tags del CLI (`v0.1.0` → `v0.7.0` durante 2026-05-02 / 2026-05-03), el flujo de instalación era:

```bash
git clone https://github.com/getGanemo/workspace-cli ~/dev/workspace-cli
pipx install -e ~/dev/workspace-cli
```

Esto funciona, pero tiene fricción: clone editable en disco, working tree drift posible, onboarding requiere explicar `pipx`. Necesitábamos una forma "user mode" más limpia, sin abandonar la "dev mode" para los que hackean el CLI.

Las opciones reales eran:

1. **GitHub Releases** con wheel attached.
2. **PyPI privado** (self-hosted o GitHub Packages).
3. **PyPI público** (paquete real bajo el nombre `wsp-awac` o similar).

## Decisión

**Fase actual (durante la incubación interna):** GitHub Releases con wheel + sdist attached por cada tag.

Workflow `release.yml` en `getGanemo/workspace-cli/.github/workflows/`:
- Trigger en push de tag `v*`.
- `python -m build` arma wheel + sdist.
- `gh release create $TAG --notes... dist/*.whl dist/*.tar.gz`.

Instalación:

```bash
TAG=v0.7.0
gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
pipx install /tmp/wsp/wsp-*.whl
```

Workflow `install_wsp` en `<transversal-org>/agent-stack-core/workflows/` automatiza esto en 7 pasos para que el agente lo haga por el usuario.

**Fase futura (lanzamiento público de AWaC):** considerar publicar a PyPI público bajo `wsp-awac` o nombre disponible. Trigger: cuando AWaC se anuncie en HN/Reddit/X y haya audiencia externa que quiera probarlo sin tener acceso al repo privado.

## Consecuencias

**Positivas:**
- Cero infraestructura: GitHub ya hospeda los releases.
- El repo sigue privado.
- Versionado explícito (no más editable drift).
- 1 comando para upgrade (`gh release download` + `pipx install --force`).
- El workflow `install_wsp` automatiza todo para el agente.

**Negativas / trade-offs:**
- Devs sin `gh` autenticado no pueden bajar el wheel (los releases del repo privado requieren auth). Mitigación: `gh auth login` ya es requisito para usar `wsp` (clona stacks privados).
- No hay search-by-name como en PyPI. Mitigación: poco relevante mientras el alcance sea interno.
- Dependencias del paquete viajan en el wheel pero `pipx` resuelve transitivas via PyPI público (cualquier dep nuestra es estándar — `click`, `pyyaml`, `jsonschema`).

## Alternativas consideradas (y por qué descartadas en esta fase)

1. **PyPI privado self-hosted** (`pypiserver`) — más infra para mantener; releases de GitHub ya cubren el caso.
2. **GitHub Packages (PyPI namespace)** — similar a la opción elegida pero menos descubrible. Si se quisiera más adelante, el switch es trivial.
3. **PyPI público desde el día 1** — hubiera obligado a pelear con la licencia (`License: Proprietary`) y la dependencia de repos privados al runtime (clone `agent-stack-core` etc.). Mejor diferir hasta el lanzamiento público formal.

## Implementación

- Workflow: [`getGanemo/workspace-cli/.github/workflows/release.yml`](https://github.com/getGanemo/workspace-cli/blob/main/.github/workflows/release.yml).
- Releases vivos: <https://github.com/getGanemo/workspace-cli/releases>.
- README install: [`getGanemo/workspace-cli/README.md`](https://github.com/getGanemo/workspace-cli/blob/main/README.md).
- Workflow universal de instalación: `install_wsp` (publicado en `<transversal-org>/agent-stack-core/workflows/`).

## Ver también

- ADR 007 — CLI agent-first.
