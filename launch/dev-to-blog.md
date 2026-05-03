---
title: "Agent Workspace as Code: stop copy-pasting your CLAUDE.md across projects"
published: false
description: "AWaC borrows Terraform's pattern and applies it to the .agents/ folder your AI coding agents read. Declarative manifest + versioned stacks + a CLI that composes them deterministically. Open source under MIT."
tags: ai, agents, opensource, devtools
canonical_url: https://github.com/getGanemo/awac-docs
---

> Recommended posting time: **Tuesday or Thursday, 11:00 ET**. dev.to surfaces "trending" posts based on first-day engagement; aim for the morning slot. Cross-post to Hashnode + Medium with `canonical_url` pointing back to this docs site.

# The drift problem nobody told you about

If you have used Claude Code, Cursor, Aider, or any other AI coding agent across more than two projects, you have felt this:

You start project A. You copy the .agents/ folder (or CLAUDE.md, or .cursorrules) from your last project. You tweak two things. Done.

You start project B six weeks later. You copy from project A. You tweak three things this time. Now A and B are different.

You start project C. The AWS safety rule looks one way in A, slightly different in B, and you do not remember which one was correct. The deploy skill is in three subtly different versions. The MCP setup is in two of three repos.

This is **drift**. And it is the silent killer of productivity once you start using AI agents seriously across a team.

The other failure mode is **bloat**: every .agents/ folder ends up as 200 files no one owns, no one knows what is still relevant, and "let me add one more rule just in case" wins every code review.

## A pattern from infrastructure

The infrastructure world solved this 10 years ago. Pre-2014 you SSH-ed into a server, installed packages, edited nginx.conf, hoped you would remember to do the same on the next server. Then Terraform happened: declare the desired state in HCL, run terraform apply, and the world matches your file. State drift becomes detectable. Reproducibility becomes free.

**Agent Workspace as Code (AWaC)** is the same pattern, applied to the layer above your code: the rules, skills, workflows, and conventions your AI coding agent reads.

```yaml
# workspace.yml
schema: workspace/1
name: my-feature
stacks:
  - core           # universal foundation
  - aws            # AWS safety + terraform parity
  - mcp            # MCP server bootstrap
  - my-product/agent-stack    # product-specific stack
```

Run `wsp bootstrap` and the CLI:

1. Resolves the stack shortcuts via a registry in `<your-org>/agent-stack-core/awac.yml`.
2. Clones each stack repo at the latest commit on main.
3. Composes .agents/{rules,skills,workflows}/ deterministically — last stack wins on collisions.
4. Generates CLAUDE.md (canonical context file) and AGENTS.md (mirror for non-Claude agents).
5. Emits a workspace.lock.yml recording exact commits.

That is the whole loop. Same workspace, every machine. No copy-paste. No drift.

## What is a stack

A stack is a plain GitHub repo with this layout:

```
my-stack/
  awac.yml              # metadata: which product, which repos to clone
  rules/                # behavioral rules (always_on or trigger-based)
  skills/               # named procedures the agent invokes by reference
  workflows/            # multi-step processes
  templates/            # workspace.yml templates (optional)
```

The reference public stacks (under getGanemo/agent-stack-*) cover universal needs (core), AWS, MCP, Cloudflare, and research/branding/thesis templates. You can publish your own — anything matching the convention is a valid stack.

## Why agent-first matters

The CLI was designed from day one to be driven by agents, not humans. Concretely:

- Every command accepts --json and emits structured output.
- Errors carry four fields: code (stable identifier for retry logic), category (env/config/network/etc.), cause (what went wrong), remediation (what to do).

So when your agent runs `wsp doctor` and one of the checks fails, it sees:

```json
{
  "code": "WSP_007",
  "category": "environment",
  "cause": "gh CLI not authenticated",
  "remediation": "Run: gh auth login"
}
```

And it can either fix it (run the remediation) or escalate to the human with full context. No reading paragraphs. No guessing.

This matters more than it sounds. Anyone who has tried to make a long-running agent loop work in production knows that error-handling is 80% of the difficulty. Stable error codes are the closest thing we have to a contract between CLI and agent.

## What I gave up to keep AWaC simple

A few non-features that come up regularly:

**No SaaS, no hosted dashboard.** The CLI is 100% local. Stacks live in your GitHub. No telemetry, no backend. ADR 014 in the docs explains why: it is optimization for adoption + thought leadership, not for revenue.

**Not on PyPI yet.** Distribution goes through GitHub Releases (gh release download + pipx install). The reason (ADR 012): it works for agent-driven installation paths, does not need PyPI namespace bargaining, and PyPI joins the roadmap once OSS adoption signals demand for it.

**No interactive prompts in core commands.** AWaC is agent-first. Anything that needs ack uses an explicit flag (--yes, --update), never a TTY prompt. Wizards are user-friendly; they are agent-hostile.

**MIT, not Apache 2.0.** Simpler. Sufficient. Patent grants matter for big infrastructure projects; for a workspace CLI, MIT is the right minimum.

## The 14 ADRs

While building AWaC, every contentious choice generated an Architecture Decision Record. They are in the docs repo and worth a skim even if you do not adopt the tool — most of them are tradeoff discussions you will face if you build something similar.

A sample:

- **001** — The unit of composition is the workspace, not the project, the org, or the user.
- **004** — CLAUDE.md is canonical, AGENTS.md is a mirror. Reasoning explained.
- **007** — The CLI is agent-first, not human-first. Implications for command surface, errors, output.
- **010** — DevVault is a two-layer model (versioned per-product catalog + non-versioned per-machine vault path).
- **012** — Distribution via GitHub Releases, not PyPI (for now).
- **014** — AWaC stays open-source. No SaaS planned.

You can read all of them at github.com/getGanemo/awac-docs.

## Try it

```bash
# Install
TAG=$(gh release view --repo getGanemo/workspace-cli --json tagName -q .tagName)
gh release download "$TAG" --repo getGanemo/workspace-cli --pattern '*.whl' --dir /tmp/wsp
pipx install /tmp/wsp/wsp-*.whl

# Compose a workspace
mkdir my-feature && cd my-feature
wsp init my-feature --template blank
wsp bootstrap
```

Two minutes from clone to working workspace. Tell me what is wrong with it.

## What I am hoping for

The thing I most want from this launch is not stars (though they are nice). It is **honest feedback on the abstraction**:

- What rule of yours does not fit cleanly into a stack?
- What composition pattern do you have that AWaC cannot express?
- What error message confused you?
- What stack should exist that I have not built?

If you have 5 minutes after trying it, [open an issue](https://github.com/getGanemo/workspace-cli/issues) or reply on this post. The roadmap is public ([Roadmap issue](https://github.com/getGanemo/workspace-cli/issues/2)) and thumbs-up reactions move things up.

Thanks for reading. Built solo, MIT, no SaaS, fork-friendly. See you in the issues.

— Fernando
[github.com/GanemoCorp](https://github.com/GanemoCorp) · [ganemo.com](https://www.ganemo.com)
