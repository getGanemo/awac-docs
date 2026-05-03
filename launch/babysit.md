# Post-launch babysit checklist

> Active maintenance for **2 weeks** post-launch. After that, transition to bi-weekly cadence + ad-hoc as issues arrive.

## Daily (first 14 days)

- [ ] Triage new issues within 24 hours. Apply labels, ask for missing info, link to existing issues.
- [ ] Reply to every Discussion thread within 48 hours. "Thanks" is not enough — bring the conversation forward with a question or a concrete next step.
- [ ] Scan HN/Reddit/X for mentions of "AWaC" or "workspace-cli". Reply only if there is a real question, never to "promote" the post.
- [ ] Review CI on every push (it should never be red — but verify).
- [ ] Check release download counts on workspace-cli releases.

## Issue triage flow

1. **Read it fully** — including code blocks. Half of issues are confusingly titled but solvable in 2 minutes.
2. **Reproduce locally** — does the issue reproduce with `wsp init && bootstrap` from a clean `/tmp` dir?
3. **Apply labels**:
   - `bug` — confirmed breakage. If reproducible, write a failing test first.
   - `feature` — new capability. Move to `discussion needed` if it's a big abstraction change.
   - `question` — answer + close + suggest moving to Discussions next time.
   - `good first issue` — small, well-bounded, no architecture risk.
   - `help wanted` — well-bounded but nontrivial.
   - `breaking` — schema or CLI break. Needs an ADR before any PR.
4. **Estimate** — 30-min, 2-hour, 1-day, 1-week. Anything > 1 day moves to the Roadmap issue.

## Reply templates

### Bug, reproduced locally
> Confirmed reproducing here. Looks like [hypothesis]. I'll [next step] today/this week.
> If you have a workaround in the meantime: [option].

### Bug, can't reproduce
> I cannot reproduce this with [exact commands tried + my versions]. Could you share:
> - `wsp --version`
> - the exact `workspace.yml` (sanitize secrets)
> - full output of the failing command with `--json`
> Once I can see the failure, I can ship a fix.

### Feature request, in scope
> Good idea, fits the [Roadmap](https://github.com/getGanemo/workspace-cli/issues/2) under [section]. I'll add a checkbox there. If you want to tackle it yourself, comment on the roadmap and I'll mark it `help wanted`.

### Feature request, out of scope
> This is interesting but lives outside the AWaC abstraction because [specific reason]. The cleanest path is to publish a custom stack with this behavior — see [creating-new-stack](https://github.com/getGanemo/awac-docs/blob/main/src/content/docs/creating-new-stack.md). Happy to review the stack repo when you have one.

### Question that should have been a Discussion
> Closing as a question — answers below. For future questions, please use [Discussions](https://github.com/getGanemo/workspace-cli/discussions/categories/q-a) since they get more visibility and other users can find the answer later.
> [answer]

## PR review flow

1. **Acknowledge within 48 hours** even if the review takes longer. "Thanks for sending — I'll review by [day]."
2. **Read the test first.** A PR without a test for non-trivial change should be paused: ask for a test, or write one yourself if the change is small.
3. **Run locally** before approving. CI is necessary, not sufficient.
4. **Squash merge** by default (the repo is configured for squash merging only). Include the contributor's name and a clean commit message.
5. **Update CHANGELOG.md** in the PR (or in a follow-up commit).
6. **Add to Acknowledgements** — first PR from a new contributor goes in `## Acknowledgements` of README.

## When to merge an external PR vs ask for changes

| Situation | Action |
|---|---|
| Bug fix with test, no architecture change | Merge after local repro of fix. |
| Feature adding to existing surface, well-tested | Merge if it fits Roadmap; otherwise discuss first. |
| Feature changing schema or core abstraction | **Always** request ADR before any code review. |
| Doc-only PR | Merge after a quick read for accuracy. |
| Refactor with no behavior change | Cautious — runs the risk of regressions for no user value. Ask "what does this enable?" |
| Stylistic / formatting | Generally accept if consistent; reject if it's just personal preference churn. |

## Monitoring HN / Reddit / Twitter

- HN: refresh the post page hourly for first 4 hours. Reply to top-level comments. Flag any flame-bait to mods (rare but possible).
- Reddit: comment_count and upvote_ratio matter more than karma. If upvote ratio drops below 0.7, the post may have been brigaded — don't argue, just step back.
- Twitter: quote tweets > replies > likes. Engage with quote tweets (they amplify); skim replies for substance.

## When to slow down

If issue volume drops below ~1 per week, switch from daily to weekly cadence. Set a 30-min `awac-triage` reminder weekly. Hard cap: never spend more than 4 hours/week on AWaC during the maintenance phase unless a launch-style spike happens.

## What to escalate to Fernando (he's the project owner)

(This section is here as a reminder to **myself** — me, future Fernando — what I should NOT defer to "someone else".)

- Anything involving a vulnerability disclosure → SECURITY.md flow.
- Any DMCA / IP claim against AWaC content.
- Any PR from a known security researcher.
- Anything ADR-level: schema change, license change, governance change.

## Sunset trigger

If at month 6 the project has < 50 stars, < 1 external PR, < 5 Discussions/issues per month — switch to formal `## Maintenance only` mode in the README. Honest about it. Better than silent abandonment.
