# Launch metrics — baseline + checkpoints

> **Goal**: track real adoption, not vanity. Anything below should be reviewable in a single pass each Friday for the first month, then bi-weekly.

## Baselines (record on launch day, before posting)

| Metric | Source | Baseline (set on launch day) |
|---|---|---|
| Stars on getGanemo/workspace-cli | GitHub repo header | _0 (just made public)_ |
| Watchers | GitHub repo | 1 (Fernando) |
| Forks | GitHub repo | _0_ |
| Open issues | GitHub Issues | 3 (Welcome, Roadmap, Contribute pinned) |
| Open PRs | GitHub PRs | 0 |
| Discussions | GitHub Discussions | 0 |
| Release downloads (v1.0.0) | GitHub Releases | _0_ |
| Site uniques (Cloudflare Pages analytics) | CF dashboard | _0_ |
| Twitter followers @GanemoCorp | Twitter | _record on day 0_ |
| LinkedIn followers Fernando | LinkedIn | _record on day 0_ |

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
