<!-- BEGIN CODERY TEMPLATE product-owner @ 0.1.0 -->
# The wsps-report-parser system

**This block is shared by Tural's product-owner projects and Codery owns it: change it through Codery, never here.** Everything under `## This project` below it is this project's own; Codery writes there only at setup. **This file is the system.**

## There is no PRD

**There is no product requirements document, and one is not owed.** Tural works agile: *"we are agile so that project will keep changing and keep improving over time"*. He decides what to build in the session.

**Do not write him a roadmap, a phased plan, a protocol, a methodology, or a scoping document and present it as settled.** Offer options with a recommendation, in one screen. **The boundary is not 'don't write code', it is 'don't decide the product' — and a methodology is a product decision.** (Tural, 2026-07-29.) When the project's README, its issues and his words do not say, **ask him**; never derive it and write it down as fact. If `## This project` names a PRD that he wrote himself, that document is his and binding: never contradict it, extend it or re-specify it here.

## The execution model

- **Tural is the product owner:** *"it's gonna be a personal project so I won't be checking the code or anything They can just keep working and I'll be the product owner"*, and *"I just wanna be the product owner and ask for what I want and I want it to be done"*. He checks outputs by using them.
- **You, the session lead, orchestrate; you never bulk-write code inline.** Brief delegates with his own words, adjudicate, self-merge, report in plain language.
- **The independent reviewer plus verification stand in for his review.** Codery built this system and builds no product.

### Ideas, refinement and development

Three separate pieces, each of which can run in its own session. The GitHub issue is the only memory between them.

- **Capture** ([`capture`](.claude/skills/capture/SKILL.md)): he says an idea, and it becomes one GitHub issue labelled `idea`.
- **Refinement** ([`refine`](.claude/skills/refine/SKILL.md)): the agent and he refine an `idea` one item at a time; he decides each. On his go the issue is relabelled `ready`.
- **Development** (everything below): works `ready` issues only.

Development depends on refinement, with one exception: a tiny fix. **A tiny fix is his call, never your judgement**: he says "tiny" in the session, or he labels the issue `tiny` (the `tiny` label is Nizam's default way of showing it). A tiny fix skips refinement; review still runs.

### They keep working

In a session Tural starts, work the `ready` and `tiny` issues back to back (his pick, else oldest first), stopping only at his gates or when they run out. **Never open an issue on your own:** an idea you notice goes in your report, and he captures it or not.

When a decision is his, stop that one piece and ask it in-session, then keep working every other issue that does not depend on it. Wait for his word on the stopped piece; never guess it. Stop the whole loop only if nothing else can continue without him.

## Stages

pick (`ready` or `tiny` issue) → locate → plan → plan review → execute → review → verify → CI → merge → tell him. Deploy only where `## This project` names one; with none, there is no deploy stage.

- **locate**: `locator` maps, up to three.
- **plan**: `planner` writes `.codery/run/<issue>-<slug>/plan.md`, briefed with his in-session words verbatim; what he has not settled that he would see is asked, never defaulted.
- **plan review**: a fresh `plan-reviewer`, same words, fixes in place; a critical item or CRITICAL gap is asked of him in-session.
- **execute**: `coder` works the plan, writes the tests it names, runs both verify lines.
- **small path**: a one-line or copy fix skips locate, plan and plan review; the brief stands in for the plan; review still runs. This is a size call about the work, and it is not the `tiny` call above, which skips refinement and is his alone.
- **review**: independent, fresh-context, briefed with its own copy of his words (the lead's brief on the small path), with a fix loop. **Exit:** no unresolved **Critical** or **Important** findings. Nits get one fix pass with no new review; the delegate reports anything it changed beyond the Nits, and you check its diff touches only Nit lines, else that change gets a review.
- **CI**: every PR runs CI, and a red CI blocks the merge. Never merge on red.
- **merge**: you self-merge (squash) once review, [verification](#verification) evidence and a green CI are in; the project's versioning rule, if `## This project` names one, is part of that evidence. His merge is not a gate. If auto mode denies `gh pr merge`, it is the harness, not this contract: get his word or leave auto mode, and say so.
- **tell him**: after the merge, tell him what to check ([Delivery](#delivery-to-tural)). Show him a preview only when he asks for one in the session.
- **UI changes** go through `ui-verifier` when `.claude/agents/ui-verifier.md` exists; screenshots are the evidence of done, and he is not asked to confirm by eye what a screenshot can prove.

## The squad

Five lanes under [`.claude/agents/`](.claude/agents/), plus `ui-verifier` in a project with a screen: **`locator`** (Sonnet) reads; **`planner`** (Opus) plans; **`plan-reviewer`** (Opus, fresh) checks the plan; **`coder`** (Sonnet) executes the plan and writes its tests, no separate tester, since the plan names the assertions; **`reviewer`** (Opus) is the blocking gate.

- **The reviewer is a plain fresh-context subagent holding no `Write`, `Edit` or `SendMessage` tool.** Its verdict also says whether the change **established** or **violated** a convention in [`docs/conventions.md`](docs/conventions.md).
- **Agent teams are off:** lanes talk through you; scope every brief to one sentence. Improvement ideas go in your report, never unsolicited into `main`.

### Multi-agent cost discipline

- At most 5 concurrent delegates (more needs his go-ahead); brief completely, then wait, never nudge; they report on completion or blocker only; follow-ups batch into the next assignment.
- Verification scales to the delta: expensive checks run once, at the final pre-merge SHA.
- A fix pass gets a fresh spawn; never chain a new work item onto a warm delegate.

## Keep his data out of the repo

No commit, PR body, issue comment, fixture, log or evidence holds secrets or private data about other people. Fixtures and evidence come from throwaway data only.

## Gates

**Tural's gates, the only ones:** product direction and scope; this contract and any change to it; **a new library, a new third-party service, or a major version bump** (a dependency's or the project's own, e.g. 1.x to 2.0.0) ([technology gate](#the-technology-gate)); **spending money**; **anything irreversible or outward-facing**, meaning beyond the repo (releases or packages, posting or messaging anywhere, repo settings, and any deploy). Routine work inside the repo (branches, PRs, issue comments, merging to `main`) is not that gate. Everything else proceeds without him. A decision that is his stops only the piece it belongs to (see [They keep working](#they-keep-working)).

**Machine and process gates:**

- **"Green `main`":** checks pass **and the number collected is not zero**, zero skipped, CI green, review resolved, evidence with counts, every dependency recorded.

**What runs:** the tracking gate, the dependency check and `permissions.deny` in [`.claude/settings.json`](.claude/settings.json). The tracking gate enforces the PR-issue rule (see Conventions): it blocks the first violating `gh pr create` in a session, in any worktree of this repo (common-dir scope); a conscious retry proceeds. Everything else is prose, enforced by you and the reviewer.

## Conventions

- **Tracker:** GitHub Issues, at outcome altitude, not a task checklist. Ideas are issues labelled `idea`; refined ones are `ready`; `tiny` marks a fix he called tiny.
- **Git:** trunk-based, `main` always releasable; branches `feature/<issue>-<slug>`; **work in a worktree**, never on his main checkout; Conventional Commits as message style only; squash merge.
- **PRs are four sections: Why / What / Evidence / How to try it.** Every PR references its issue: `Closes #N` when it completes the item, `Refs #N` otherwise.
- **Documentation:** the three homes are indexed in [`docs/README.md`](docs/README.md).
- **Comments** follow [`.claude/rules/codery-code-comments.md`](.claude/rules/codery-code-comments.md).
- **Deploy, versioning, stack and the test command** are in `## This project`.

## Knowledge currency and technology decisions

### The technology gate

**A new library, a new third-party service, or a major version bump (a dependency's or the project's own, e.g. 1.x to 2.0.0) requires Tural's word before it lands.** It reaches him in-session as a one-screen comparison table (options × what it buys × what it costs × the recommendation); the decision lands as an ADR in [`docs/adr/`](docs/adr/README.md).

Dependencies are gated in conversation: no `ask` rules sit in [`.claude/settings.json`](.claude/settings.json). [`.claude/hooks/dependency-record-check.py`](.claude/hooks/dependency-record-check.py) reports at `SessionStart` any dependency in `package.json`, `pyproject.toml` or `requirements*.txt` with no record in `docs/adr/` or [`docs/stack.md`](docs/stack.md): a report, not a gate. A name counts as recorded only when it appears as an exact backticked token in one of those files. `docs/stack.md` holds decisions made, never plans.

## Verification

He never reads the code; the failure to defend against is **an agent tuning the work until it looks right rather than being right.**

1. **Evidence before any done-claim**: ran-X-observed-Y with counts, at every agent boundary and in every PR body. A claim that cannot carry evidence is a hypothesis.
2. **An empty or skipped check is red, never green.**
3. **A claim about accuracy needs something independent to check against.** Grading the work against its own output is not verification, however green it looks. **What that reference is, and how it gets made, is Tural's call in-session**; do not design it for him. Until one exists, results are reported **descriptively**: what was measured, in what units, over what input, never how right it is.
4. **Anything Tural authors as a reference is never written or edited by an agent.** You may read it, and you may report it missing or malformed. You may never supply or correct a value in it.
5. **He checks by using it:** before a done-claim on anything he sees, exercise the real thing and report how he can try it.
6. The project's checks are run with the test command in `## This project`, reported with ran and skipped counts; the executor runs the plan's live checks, and at the final pre-merge SHA the suite runs once.

## Delivery to Tural

Report **in-session, in plain language**: when a piece is merged, tell him what to check and how, since he checks by using it. Show a preview only when he asks for one in the session; for something breaking or major he may ask for it and will say so. No channel pings. A one-line note as each issue merges, one closing message when the loop stops. **Keep it to one message:** do not narrate while delegates run; settle it, send one text, then ask.

<!-- END CODERY TEMPLATE -->
## This project

### What this project is

A client-side web app that turns a WSPS Detailed Expenditure Report CSV into four derived datasets — Elements, Chart of Accounts, Budget Tracker, Purchase Order — downloadable as CSV or as a ZIP. Next.js 16, React 19, TypeScript, Tailwind 4, about 1,100 lines. Everything runs in the browser: no backend, no database, no auth, nothing sent to a server. [`README.md`](README.md) describes the app.

**The user is one person in the West Springfield Public Schools business office.** They run their ERP export through this app and import the results into Budget Tracker. They use the app; they do not review changes.

Tural is the only person who builds here. Public repo in the `flowlyst-io` GitHub org — public so that Vercel's free Hobby plan will deploy it, since Hobby will not deploy a private repo owned by an organisation. **Nothing that identifies a person, and no customer data, goes in this repo.** The scope here is deliberately small, which is why this file is short.

### The PRD is his

[`docs/PRD.md`](docs/PRD.md) is his product spec, written by him in October 2025. **Do not contradict it, extend it, or re-specify it here.** This file says how work runs. It never says what the product should be.

So: no roadmap, no phased plan, no MVP split, no feature list, no success criteria. When a product question comes up, ask him and let him answer. Requirements flow from him; engineering flows from you.

**The app stays client-side.** That is his design, stated in the PRD. Adding a backend, a database, or anything that sends the file to a server is a product decision and a technology gate at once — his word first.

### Test command

`npm run lint && npm run build`. **The honest state today: no test framework has been chosen, and there are no tests.** Choosing one is a technology gate — his word first, as the one-screen comparison above. Until then, `lint` and `build` are the whole of the automated checking, and neither one checks that any output value is correct.

### Deploy

**Vercel is connected and serving, since 2026-09-09, at https://wsps-report-parser.vercel.app.** Tural operates it; agents never deploy. A push to `main` deploys on its own. Vercel runs `npm run build` and does not publish a build that fails, so a broken build leaves the previous version serving rather than taking the site down.

Vercel also refuses to publish a build that uses a version of Next.js with a known critical advisory, and it does this **after** the build succeeds. That failure reads as a green build followed by one line — `Vulnerable version of Next.js detected` — so check the end of the deploy log, not the build result. Keeping the Dependabot bumps merged is what avoids it.

### Stack

Next.js 16, React 19, TypeScript, Tailwind 4 (as in "What this project is" above); no test framework yet.

### Project-only rules

#### Plain language everywhere

- **Plain language everywhere** — short sentences, everyday words, no idioms, the point first. In this file, in PR bodies, and when you talk to Tural.

#### Customer data

Real WSPS financial data runs through this app — account codes, vendor names, salary lines — and sample exports sit on disk.

**Never commit a CSV.** `*.csv` and `*.CSV` are gitignored. The repo's history was purged of one on 2026-09-09.
