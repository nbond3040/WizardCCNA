# WizardCCNA

A complete, self-paced course for the **Cisco CCNA 200-301** exam — built to take you from zero to a
top score on exam day. It covers **v1.1** (the live exam through 2 Feb 2027) and **v2.0** (from 3 Feb 2027);
your exam date picks the right blueprint automatically.

## What's inside

- **Goal-date study plan** — pick your exam date, study days and (optionally) a daily budget. WizardCCNA
  lays out every lesson, lab, checkpoint, practice exam and review across your calendar, and re-plans from
  your real progress every day (falling behind raises the daily load; working ahead frees days).
- **68 lessons, 1,350+ slides** — minimalist slides covering every exam topic, with diagrams drawn
  from a declarative DSL (topologies, packet headers, protocol sequences, binary math, layer stacks, flows)
  and a full instructor explanation for every slide.
- **Post-deck quizzes** — a short quiz at the end of each deck; 80% marks the lesson mastered.
- **1,900+ flashcards** — each lesson's cards unlock when you finish its deck. Spaced repetition (SM-2);
  every card you miss goes to a **missed queue** and comes back — later in the same session and in
  future sessions — until you recall it correctly.
- **32 hands-on labs** — a Packet-Tracer-style simulator in the browser: open consoles on routers,
  switches and PCs, type real IOS commands (modes, `?` help, error messages, `show` output), and watch
  tasks turn green as they're verified live. Includes troubleshooting labs with pre-broken networks, plus
  a wireless-controller GUI simulator and a REST API sandbox against a mock Catalyst Center.
- **Practice exams** — a 1,450-question exam bank (plus 490 deck-quiz questions); timed, blueprint-weighted
  simulations (100 questions / 120 minutes) with
  single/multiple choice, drag-and-drop matching, ordering, categorizing, fill-in and CLI/topology
  exhibits; scored 300–1000 with a per-domain report. Missed questions feed a review queue.
- **Speed drills** — unlimited generated subnetting, VLSM, wildcard, summarization, IPv6 and conversion
  problems with worked explanations.

Progress is stored locally in your browser (export/import from Settings). No account needed.

## Desktop app (Windows and Linux/Fedora)

The same app also ships as an offline desktop program (Electron, in `desktop/`), ~110 MB, no browser or internet
needed. Progress is stored on your computer (`%APPDATA%\WizardCCNA` on Windows, `~/.config/WizardCCNA` on Linux) and is
separate from the website's; use *Settings → Export/Import progress* to move it.

**Get the files:** *Actions → Build desktop apps → Run workflow*, then download the artifacts when it finishes
(`WizardCCNA-windows`, `WizardCCNA-linux`). Pushing a tag such as `v1.0.0` also attaches everything to a GitHub Release.
CI starts each packaged app, loads the dashboard, a lesson, the practice page and a lab, and fails on any error.

| Platform | File | Install |
|---|---|---|
| Windows | `WizardCCNA-Setup-<version>.exe` | Run the installer |
| Windows | `WizardCCNA-Portable-<version>.exe` | Just run it, nothing is installed |
| Fedora / RHEL | `WizardCCNA-<version>-x86_64.rpm` | `sudo dnf install ./WizardCCNA-*.rpm`, then start *WizardCCNA* from the menu or run `wizardccna` |
| Any Linux | `WizardCCNA-<version>-x86_64.AppImage` | `chmod +x` it and run it (needs FUSE 2: `sudo dnf install fuse-libs`, or start it with `--appimage-extract-and-run`) |
| Any Linux | `WizardCCNA-<version>-x86_64.tar.gz` | Unpack and run `wizardccna` |

The Windows files are **unsigned**, so SmartScreen shows "Windows protected your PC" on first run: click
*More info → Run anyway* (removing the warning needs a code-signing certificate). On a HiDPI Wayland desktop the window
can look soft; start it with `wizardccna --ozone-platform-hint=auto` to use native Wayland.

**Run from source** (any OS with Node 22+; on Fedora: `sudo dnf install nodejs npm git`):

```bash
npm ci && npm run build
cd desktop && npm install && npm start     # npm run smoke = the same headless check CI runs
```

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

The site is fully static (`base: './'`, hash routing), so `dist/` works on any static host.

**GitHub Pages:** open the repository's *Settings → Pages* and set *Build and deployment → Source* to
**GitHub Actions** (the default "Deploy from a branch" mode would serve the unbuilt source). Then publish by
running the **Deploy to GitHub Pages** workflow (*Actions → Deploy to GitHub Pages → Run workflow*) or by
pushing to `main`. The workflow runs the content validator and every test, builds, and deploys `dist/`;
the site appears at `https://<user>.github.io/<repo>/`. Pages only accepts deployments from branches the
`github-pages` environment allows (by default, the repository's default branch).

---

WizardCCNA is an independent study resource and is not affiliated with or endorsed by Cisco Systems.
CCNA and Cisco are trademarks of Cisco Systems, Inc. Always confirm the current exam topics on the
Cisco Learning Network before booking your exam.
