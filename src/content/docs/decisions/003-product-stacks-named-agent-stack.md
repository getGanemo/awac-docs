---
title: "ADR 003 — Stacks de productos se llaman simplemente \"agent-stack\""
---

## Status

Accepted — 2026-05-01

## Context

Cada producto SaaS tiene su propia organización en GitHub (en nuestro setup: una org per producto, naming libre — algunas usan el nombre del producto, otras lo prefijan, etc.). Necesitamos darle un nombre al repo que contiene su `agent-stack`.

Opciones evaluadas:

1. `<org>/agent-stack-<product>` (ej: `my-product/agent-stack-my-product`)
2. `<org>/agent-stack` (ej: `my-product/agent-stack`)
3. `<org>/awac-stack` (ej: `my-product/awac-stack`)

## Decision

**Repos de stacks de productos se llaman simplemente `agent-stack` cuando el org ES el producto.**

Path completo queda como: `<product-org>/agent-stack`. Ejemplos hipotéticos:
- `product-a/agent-stack`
- `product-b/agent-stack`
- `getproduct-c/agent-stack`

**Excepción**: en una org transversal (que tiene varios stacks transversales), se usa el prefijo descriptivo: `agent-stack-<topic>` (ej: `agent-stack-core`, `agent-stack-aws`).

## Options considered

### A. Siempre con prefijo (`agent-stack-<product>`)

```
product-a/agent-stack-product-a
product-b/agent-stack-product-b
getproduct-c/agent-stack-product-c
```

**Pros:**
- Convención uniforme en todos los repos.

**Cons:**
- **Redundante**: el org ya nombra el producto. `product-a/agent-stack-product-a` repite el nombre.
- **Lectura incómoda**: "agent stack del producto-a dentro del org producto-a".

### B. Sin prefijo cuando el org es el producto (la elección)

```
product-a/agent-stack
product-b/agent-stack
getproduct-c/agent-stack
```

**Pros:**
- **Lectura natural**: el path completo se lee como "el agent stack del producto A".
- **Cero redundancia**: el org provee el namespace.
- **Cuando alguien navega a la org del producto, el repo `agent-stack` está visible y obvio**.

**Cons:**
- **Inconsistencia con los stacks de la org transversal** que tienen prefijo (porque ahí hay varios). Hay que documentarlo.

### C. Otro nombre alternativo (`awac-stack`, `methodology`, etc.)

**Pros:**
- Distingue clarísimo qué es "metodología" vs "código".

**Cons:**
- **Menos descriptivo**: "agent-stack" dice más sobre el contenido que "awac-stack".
- **Abstracción innecesaria**: AWaC es la metodología que **organiza** stacks; los stacks son agent stacks, no AWaC stacks.

## Consequences

### Positivas

- Manifests legibles: `stacks: [..., my-product]` resuelve a `my-product/agent-stack`. Limpio.
- Los líderes de cada producto manejan permisos en su propio org sin depender de admins del transversal-org.
- Cuando alguien clona `my-product/infrastructure` o cualquier repo de la org del producto, ya tiene el `agent-stack` justo al lado en la misma org.

### Negativas

- **Asimetría con la org transversal** que tiene `agent-stack-X`. Hay que explicarlo en docs.
  - Mitigación: documentado en [`02-architecture.md`](../02-architecture.md) y [`04-stack-reference.md`](../04-stack-reference.md).
- **El registry necesita resolver atajos** para distinguir los dos casos:
  - `core` → `<transversal-org>/agent-stack-core`
  - `my-product` → `<my-product-org>/agent-stack`
  - Ya está implementado en `awac.yml/shortcuts` del registry.

## Cuándo aplica cada convención

| Caso | Convención de naming |
|---|---|
| Stack en la org transversal (varios stacks) | `agent-stack-<topic>` (ej: `agent-stack-aws`) |
| Stack en org de un producto | `agent-stack` (sin prefijo) |
| Hipotético: si en el futuro un producto tiene varios stacks | revisitar este ADR; volver al prefijo `agent-stack-<topic>` |

## Notes

Esta decisión surgió de una observación durante el diseño inicial: *"Si cada organización es un producto con su propio agent stack, ¿no es redundante repetir el nombre de la organización en el nombre del repo?"*

## Ver también

- [`02-architecture.md`](../02-architecture.md) — convención de naming en contexto.
- [`08-creating-new-stack.md`](../08-creating-new-stack.md) — cuándo usar qué naming al crear un stack nuevo.
