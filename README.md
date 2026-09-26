# WizardCCNA

A complete, self-paced course for the **Cisco CCNA 200-301** exam — built to take you from zero to a
top score on exam day. It covers **v1.1** (the live exam through 2 Feb 2027) and **v2.0** (from 3 Feb 2027);
your exam date picks the right blueprint automatically.

## What's inside

- **Goal-date study plan** — pick your exam date, study days and (optionally) a daily budget. WizardCCNA
  lays out every lesson, lab, checkpoint, practice exam and review across your calendar, and re-plans from
  your real progress every day (falling behind raises the daily load; working ahead frees days).
- **Slide decks for every exam topic** — minimalist slides with diagrams drawn from a declarative DSL
  (topologies, packet headers, protocol sequences, binary math, layer stacks, flows) and a full
  instructor explanation for every slide.
- **Post-deck quizzes** — a short quiz at the end of each deck; 80% marks the lesson mastered.
- **Flashcards** — each lesson's cards unlock when you finish its deck. Spaced repetition (SM-2);
  every card you miss goes to a **missed queue** and comes back — later in the same session and in
  future sessions — until you recall it correctly.
- **Network labs** — a Packet-Tracer-style simulator in the browser: open consoles on routers, switches
  and PCs, type real IOS commands, and watch tasks turn green as they're verified live.
- **Practice exams** — timed, blueprint-weighted simulations (100 questions / 120 minutes) with
  single/multiple choice, drag-and-drop matching, ordering, categorizing, fill-in and CLI/topology
  exhibits; scored 300–1000 with a per-domain report. Missed questions feed a review queue.
- **Speed drills** — unlimited generated subnetting, VLSM, wildcard, summarization, IPv6 and conversion
  problems with worked explanations.

Progress is stored locally in your browser (export/import from Settings). No account needed.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run validate     # content validator (schema, answer keys, diagrams, coverage)
npm test             # all unit tests (planner, drills, simulator, lab harness)
npm run build        # production build in dist/
```

## Architecture

| Path | What |
|---|---|
| `src/content/curriculum.ts` | The syllabus: modules → lessons, mapped to v1.1 topic codes and v2.0 domains, with a coverage checklist per lesson |
| `src/content/types.ts` | Content schema: slides, diagrams, flashcards, questions |
| `src/content/lessons/*.ts` | One file per lesson (slides, flashcards, quiz, exam bank) — code-split and lazy-loaded |
| `src/content/labTypes.ts`, `src/content/labs/*.ts` | Lab schema and lab definitions with machine-checkable tasks and reference solutions |
| `src/sim/` | The network simulator (IOS CLI, L2/L3 forwarding, STP, OSPF, ACL, NAT, DHCP, SSH, checks) |
| `src/features/` | App features: dashboard, plan, learn, flashcards, practice, labs, drills, settings |
| `docs/CONTENT_GUIDE.md` | House style for lesson authors |
| `docs/SIMULATOR_SPEC.md` | Simulator specification |

## Deploy

The site is fully static (`base: './'`), so `dist/` works on any static host. The included GitHub Actions
workflow (`.github/workflows/deploy.yml`) builds and publishes to **GitHub Pages** on pushes to `main`
— enable Pages with "GitHub Actions" as the source in the repository settings.

---

WizardCCNA is an independent study resource and is not affiliated with or endorsed by Cisco Systems.
CCNA and Cisco are trademarks of Cisco Systems, Inc. Always confirm the current exam topics on the
Cisco Learning Network before booking your exam.
