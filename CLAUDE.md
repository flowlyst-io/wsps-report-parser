<!-- The wsps-report-parser system contract. Set up by Codery; maintained in place — edit this file directly. -->

# The wsps-report-parser system

## What this project is

A client-side web app that turns a WSPS Detailed Expenditure Report CSV into four derived datasets — Elements, Chart of Accounts, Budget Tracker, Purchase Order — downloadable as CSV or as a ZIP. Next.js 16, React 19, TypeScript, Tailwind 4, about 1,100 lines. Everything runs in the browser: no backend, no database, no auth, nothing sent to a server. [`README.md`](README.md) describes the app.

**The user is one person in the West Springfield Public Schools business office.** They run their ERP export through this app and import the results into Budget Tracker. They use the app; they do not review changes.

Tural is the only person who builds here. Private repo in the `flowlyst-io` GitHub org. The scope here is deliberately small, which is why this file is short.

## The PRD is Tural's

[`docs/PRD.md`](docs/PRD.md) is his product spec, written by him in October 2025. **Do not contradict it, extend it, or re-specify it here.** This file says how work runs. It never says what the product should be.

So: no roadmap, no phased plan, no MVP split, no feature list, no success criteria. When a product question comes up, ask him and let him answer. Requirements flow from him; engineering flows from you.

**The app stays client-side.** That is his design, stated in the PRD. Adding a backend, a database, or anything that sends the file to a server is a product decision and a technology gate at once — his word first.

**His gates, and they are the only ones:**

- product direction, and anything the PRD covers;
- a new library, a new third-party service, or a major version bump — reaching him as a one-screen comparison: the options, what each buys, what each costs, and your recommendation;
- anything irreversible or outward-facing, including making this repo public;
- this contract, and any change to it.

Everything else proceeds without him.

## How work runs

You, the session lead, plan the work and adjudicate the findings; production goes to delegates against a tight brief. Before anything merges, an independent fresh-context reviewer reads the change — the fresh context is what makes it independent, so the review never goes to the agent that wrote the code. You self-merge once the review is clean and the evidence is in. Tural's merge is not a gate: this is his own tooling, and he does not open GitHub to approve it.

- **Tracker:** GitHub Issues on this repo.
- **Git:** trunk-based; `main` always releasable; feature branches `feature/<issue>-<slug>`; [Conventional Commits](https://www.conventionalcommits.org/) as a message style only, with no release trigger; squash merge.
- **Plain language everywhere** — short sentences, everyday words, no idioms, the point first. In this file, in PR bodies, and when you talk to Tural.
- **Delivery is in-session**, in plain language, with the thing he can check.

## Checks and evidence

**Vercel is the intended deploy target. Nothing is connected to it yet** — as of 2026-09-09 the repo has no Vercel project. Tural connects it and operates it; agents never deploy. Once it is connected, Vercel runs `npm run build` on a push and does not publish a build that fails, so a broken build leaves the previous version serving rather than taking the site down.

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm run lint` and `npm run build` on every pull request and on `main`. It earns its place either way: it shows a break on a branch rather than in a failed deploy, and it is the only place lint runs at all — a Next.js 16 build does not run ESLint.

**Evidence before any done-claim.** Ran-X-observed-Y, with counts, in every PR body and at every agent boundary. A claim that cannot carry evidence is a hypothesis, and saying so is the right move. **An empty or skipped check is a red state, not a green one** — a check that ran over nothing has not run, and stating the count is what makes the empty case visible instead of silent.

**The honest state today: no test framework has been chosen, and there are no tests.** Choosing one is a technology gate — his word first, as the one-screen comparison above. Until then, `lint` and `build` are the whole of the automated checking, and neither one checks that any output value is correct.

## Customer data

Real WSPS financial data runs through this app — account codes, vendor names, salary lines — and sample exports sit on disk.

**Never commit a CSV.** `*.csv` and `*.CSV` are gitignored. The repo's history was purged of one on 2026-09-09.
