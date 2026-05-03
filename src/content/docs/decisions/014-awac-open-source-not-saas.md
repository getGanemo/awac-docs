---
title: "ADR 014 — AWaC se abre como open-source, no se monetiza como SaaS"
---

**Fecha:** 2026-05-03.
**Estado:** aceptado.

## Contexto

AWaC nació como tooling interno de Ganemo (2026-04-30) y maduró rápido: en 4 días pasó de gist canónico a CLI v0.9.0 + governance v2 + 13 ADRs + docs completas hospedadas en un repo interno.

Una vez cerrado v1, surge la pregunta natural: ¿se abre al mundo como **open-source** o se empaqueta como **SaaS** (orchestrator hosteado, dashboard de workspaces, soporte enterprise)?

Las dos opciones tienen tracción potencial:

- **OSS**: marca personal del autor + thought leadership de la org de origen. AWaC ataca un problema real (drift + bloat de instrucciones para agentes IA) que ya viven equipos que usan Claude Code, Cursor, Aider, etc. Hay aire en el ecosistema (no hay un "Terraform para agent workspaces"). Costo marginal: bajo — la doc, el CLI y los stacks ya existen y son agnósticos al usuario.
- **SaaS**: requeriría multi-tenancy, dashboard web, billing, soporte, on-call. Distrae de los productos comerciales reales del equipo. Compite con potenciales adopters (¿por qué pagaría una empresa por hostear el CLI cuando puede correrlo gratis?).

## Decisión

**Ganemo decide abrir AWaC como proyecto open-source bajo licencia MIT, sin componente SaaS asociado.**

Concretamente:

1. El CLI (`getGanemo/workspace-cli`) y los stacks transversales del registry público (`getGanemo/agent-stack-{core,aws,mcp,cloudflare,research}`) se hacen públicos.
2. Los stacks de productos comerciales y los stacks privados de equipos siguen privados. AWaC puede componer stacks privados sin problema; los públicos sirven como ejemplo + base universal.
3. La documentación se extrae de un repo interno a un repo nuevo `getGanemo/awac-docs` (público) que hospeda solo la sección AWaC. Los docs internos quedan privados para conocimiento del equipo.
4. Distribución: GitHub Releases del CLI (ya en marcha) + sitio docs estático en dominio propio (Cloudflare Pages).
5. Marca: AWaC como proyecto independiente, con el autor inicial atribuido en README + LICENSE + sitio. Ganemo aparece como sponsor/origen institucional.
6. **No SaaS**: no se ofrece hosted dashboard, no se cobra licenciamiento, no hay tier enterprise pago.

## Consecuencias

**Positivas:**
- **Marca personal** del autor + **thought leadership** de la org de origen en agent dev tooling. Audiencia: developers que ya usan AI coding agents. Audiencia secundaria: empresas que están internalizando agent workflows y buscan patrones probados.
- **Distribución viral**: una herramienta open-source con buena DX y un blog post bien armado puede captar Show HN front page, Reddit r/ClaudeAI, X tech threads.
- **Validación externa**: si la comunidad adopta, los stacks transversales ganan contribuciones (más mcp servers cubiertos, más cloud providers, más rules y skills).
- **Foco**: la atención que hubiera consumido un AWaC SaaS se libera para los productos comerciales reales del equipo.
- **Reclutamiento**: developers que vean AWaC y les guste pueden converger orgánicamente.

**Negativas / trade-offs:**
- **Cero revenue directo de AWaC**. Todo el upside es indirecto (marca, leads, reclutamiento, contribuciones).
- **Costo de mantenimiento**: hay que babysittear issues, PRs, discussions, security advisories. Reservamos 2 semanas post-launch para active maintenance + un cap recurrente de horas/semana después.
- **Riesgo de fork**: alguien puede tomar AWaC, agregar SaaS-features, y montar un servicio comercial. Mitigación: licencia MIT lo permite explícitamente; no es un riesgo a evitar sino un upside del modelo.
- **Expectativas de comunidad**: un proyecto OSS con tracción genera expectativas de roadmap público, RFC process, governance abierta. Sostenible mientras el equipo dedique tiempo; insostenible si lo abandonamos.

## Alternativas consideradas

1. **AWaC como SaaS comercial** (orchestrator hosteado, dashboard de workspaces, billing per seat) — Rechazado: requiere multi-tenancy + ops + soporte que distrae de los productos comerciales. El CLI ya es 100% local y no necesita backend para funcionar; agregar SaaS-stack solo para cobrar es over-engineering.
2. **AWaC source-available con licencia restrictiva** (BSL, SSPL, AGPL) — Rechazado: contradice el objetivo de marca y adopción. Las licencias copyleft fuertes desincentivan adopción enterprise; las source-available generan fricción cultural en el ecosistema developer.
3. **AWaC privado para siempre** (solo uso interno) — Rechazado: la inversión hecha en doc + CLI + governance ya es de calidad publicable, y mantenerla privada desperdicia el upside de marca y validación externa.
4. **OSS dual-license (MIT + commercial enterprise)** — Rechazado por ahora: prematuro. No hay enterprise customers asking; agregar dual-license solo introduce fricción legal + percepción de "OSS de mentira". Reconsiderable si en 6+ meses aparece demanda enterprise concreta.

## Implementación

Sprint 1 (~1-2 días): hacer públicos los repos (CLI + stacks transversales), agregar LICENSE/CONTRIBUTING/SECURITY/CHANGELOG/COC, scrub de referencias internas, branch protection + Issues + Discussions habilitadas.

Sprint 2 (~1-2 días): extraer `getGanemo/awac-docs` desde el repo interno, sitio estático con Astro Starlight desplegado en Cloudflare Pages, branding mínimo (logo + tagline + OG image).

Sprint 3 (~3-5 días): drafts de posts de launch (Show HN, dev.to, blog, X thread, LinkedIn, Reddit), lista de personas a notificar manualmente, métricas baseline, CLI v1.0.0 release oficial, babysit checklist de 2 semanas.

## Ver también

- [`README.md` (overview)](../README.md) — overview de AWaC para audiencia externa.
- [`11-faq.md`](../11-faq.md) — sección "¿AWaC es público?" se actualiza con sitio + repos públicos.
- ADR 012 — Distribución vía GitHub Releases (no PyPI). Esta decisión también aplica al consumo público: pipx + gh release download sigue siendo el path canónico.
- ADR 007 — CLI agent-first. AWaC OSS sigue siendo agent-first; el README + docs explican esa decisión a la comunidad.
