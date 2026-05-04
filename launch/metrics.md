# Launch metrics — baseline + checkpoints

> **Goal**: track real adoption, not vanity. Anything below should be reviewable in a single pass each Friday for the first month, then bi-weekly.

## Baselines (record on launch day, before posting)

| Metric | Source | Baseline (2026-05-04) |
|---|---|---|
| Stars on getGanemo/workspace-cli-oss | GitHub repo header | 0 |
| Watchers | GitHub repo | 0 |
| Forks | GitHub repo | 0 |
| Open issues | GitHub Issues | 3 (#4 Welcome, #5 Roadmap, #6 Contribute — all pinned, all by maintainer) |
| Open PRs | GitHub PRs | 0 |
| Discussions | GitHub Discussions | 0 |
| Release downloads (v1.0.0 wheel) | GitHub Releases | 0 |
| Release downloads (v1.0.0 sdist) | GitHub Releases | 0 |
| Site uniques (Cloudflare Pages analytics) | CF dashboard | _to be captured by Fernando from CF dashboard_ |
| Twitter followers @GanemoCorp | Twitter | _to be captured by Fernando_ |
| LinkedIn followers Fernando | LinkedIn | _to be captured by Fernando_ |
| dev.to reactions / comments | dev.to dashboard | 0 / 0 (post live since 2026-05-04) |
| Hashnode reactions | Hashnode dashboard | _to be captured by Fernando_ |
| Medium claps | Medium dashboard | _to be captured by Fernando + URL pending capture_ |

## Targets

| Window | Target | Why |
|---|---|---|
| First 24 hours | HN front page ≥ 4 hours | Single biggest amplifier for a developer-tool launch. |
| First week | 100 stars | Plausible for a focused dev-tool with quality docs + Show HN front page. |
| First week | 5 substantive issues | Signal that real people are trying it, not just bookmarking. |
| First week | 3 Twitter retweets from Tier 1 names (above) | Trust transfer. |
| First month | 500 stars | Threshold where the project becomes self-sustaining (more eyes on issues, occasional drive-by PRs). |
| First month | 1+ external PR merged | First true validation that the abstraction is workable. |
| First month | 200 unique site visitors/week | Enough that the docs site is doing work. |
| First quarter | 2-3 third-party stack repos | Real validation that the convention is publishable. |

## Checkpoints

### Day 0 (launch day)
- Post Show HN at 9:30 ET. Track ranking every 30 min for 6 hours.
- Post Twitter thread at 13:00 UTC.
- Post LinkedIn at 09:00 local.
- Reddit r/ClaudeAI and r/cursor at 11:00 ET.
- DM 5–8 people from `people-to-ping.md` over 48 hours, individually customized.
- **Snapshot**: stars, issues, downloads, site analytics — record in this file under `## Day 0 results`.

### Day 7 (week 1)
- Compare against baselines. Note surprising sources of traffic.
- Triage all incoming issues. Add labels (good first issue, help wanted, breaking, etc.).
- Reply to every Discussion thread.
- Pick 3 issues to ship in v1.1.0 (publicly committed in Roadmap issue).
- **Update**: this file with `## Week 1 results`.

### Day 30 (month 1)
- Roadmap update (close issues that were addressed, repromote what's next).
- Cross-post recap to dev.to + LinkedIn.
- Decide on next big swing (PyPI? wsp worktree? IDE extension?).
- **Update**: this file with `## Month 1 results`.

### Day 90 (quarter 1)
- Fork count, third-party stack count, contributor list.
- Decide on cadence: maintenance mode vs active push.
- Re-evaluate ADR 014 (still no SaaS? confirm yes/no based on adoption signals).

## What to track for content engagement

| Channel | Metric | Tool |
|---|---|---|
| HN | Comments + final ranking | hacker-news.firebaseio.com or HNRank tracker |
| Twitter | Quote tweets (signal > likes) | Twitter analytics |
| LinkedIn | Comment thread depth (>= 3 replies = engagement) | LinkedIn analytics |
| dev.to | Reactions + Reading time | dev.to dashboard |
| Reddit | Comment count vs upvote ratio | Reddit post stats |

## Anti-metrics (deliberately ignore)

- **Page views** without context — bots, social previews, etc.
- **Email signups** — there is no email list. Not building one.
- **Total impressions** — vanity, decoupled from outcomes.

## Reporting cadence

- Day 0 → Day 7: daily one-line note here.
- Week 2 → Month 1: weekly Friday summary here.
- Month 2+: bi-weekly.

Each note answers: what changed, what surprised me, what I'd do differently next launch.

---

## Day 0 results (2026-05-03 → 2026-05-04)

**Channels published**:
- ✅ dev.to: https://dev.to/fernando_pastor/agent-workspace-as-code-stop-copy-pasting-your-claudemd-across-projects-5845 (canonical https://awac.ganemo.com verified, cover_image og.png, tags ai/agents/opensource/devtools)
- ✅ Hashnode: https://ganemo.hashnode.dev/agent-workspace-as-code-stop-copy-pasting-your-claude-md-across-projects (canonical pointed to awac.ganemo.com per checklist)
- ✅ Medium: published (URL not captured in checklist yet — Fernando to fill in next session)
- ⏳ Twitter thread: drafted refined, scheduled by Fernando
- ⏳ LinkedIn: drafted refined (corta + larga ES), scheduled by Fernando
- ⏳ Reddit r/ClaudeAI: drafted refined, scheduled by Fernando (D+1 post-Twitter)
- ⏳ Reddit r/cursor: drafted refined, scheduled by Fernando (D+2)
- ⏳ Show HN: variant A recommended (problem-first); blocked on Fernando completing 5-10 substantive HN comments first

**Snapshot (2026-05-04)**:
- 0 stars / 0 forks / 0 PRs / 0 wheel downloads / 0 sdist downloads / 0 Discussions
- 3 issues open (all pinned by maintainer, no community-originated yet)
- dev.to: 0 comments, no reactions visible to anonymous fetch (would need dev.to dashboard for accurate count)
- Site analytics: pending CF dashboard capture by Fernando

**Outreach Tier 1 (drafts ready, all 6 customized to recent activity)**:
- Simon Willison (LLM 0.32a0 hook) — pending send
- Geoffrey Litt (notion-cc kanban hook) — pending send
- Mitchell Hashimoto (Ghostty-leaving-GitHub hook) — pending send
- Andrej Karpathy (LLM-as-wiki-builder hook) — pending send
- Alex Albert / Anthropic DevRel (CLAUDE.md alignment hook) — pending send
- Michael Truell / Cursor (vibe coding "shaky foundations" hook) — pending send

DM cadence guideline: 1-2 per day max, paired (Simon+Geoffrey D1, Mitchell+Karpathy D2, Albert+Truell D3).

**Surprises so far**: nothing material — pre-launch baseline is exactly 0 across the board, which is expected before Twitter/LinkedIn fire.

---

## Week 1 results

_To be filled at 2026-05-11 by next babysit session._
