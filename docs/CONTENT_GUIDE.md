# WizardCCNA Content Guide

This is the house style for every lesson in WizardCCNA. The goal of the course is that a learner who
works through it can **score perfectly on the CCNA 200-301 exam** (v1.1 now, v2.0 from 3 Feb 2027).
Content must therefore be **exhaustive, precise and exam-realistic**.

## 1. Files and workflow

- One file per lesson: `src/content/lessons/<lessonId>.ts`, where `<lessonId>` is an `id` from
  `src/content/curriculum.ts`. The file default-exports a `LessonContent` (`src/content/types.ts`).
- Start the file with `import type { LessonContent } from '../types';` — import nothing else.
- Read the lesson's `focus` list in `curriculum.ts`: **every focus item must be taught on the slides and
  tested by flashcards and questions.** You may add closely related, exam-relevant material.
- The reference example showing every slide kind, diagram type and question type:
  `src/content/_example/example-lesson.ts`. Match its tone and density.
- Validate your lessons and fix every error (and as many warnings as practical):
  ```bash
  LESSON=subnetting,vlsm npx vitest run src/content/validate.test.ts
  npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep 'lessons/<your-lesson>'   # type errors in your files
  ```
- Do **not** run git commands and do not edit files you do not own.

## 2. Accuracy rules (non-negotiable)

- Facts must match Cisco IOS / IOS XE behavior and the official CCNA cert guides: defaults, timers,
  ranges, AD values, port numbers, command syntax, show-command output formats.
- CLI transcripts must be commands that actually work in IOS, in the right mode, with realistic output.
  Routers are ISR 4321-style (`GigabitEthernet0/0/0`), access switches are Catalyst 2960/9200-style
  (`FastEthernet0/1`, `GigabitEthernet0/1` or `GigabitEthernet1/0/1`) — be consistent inside a lesson.
- Where v1.1 and v2.0 differ in scope, say so in the notes (e.g. "OSPFv3 is tested on v2.0").
- If you are not sure a detail is right, leave it out rather than guess.
- Write everything originally. Never copy text from books, Cisco docs or other courses.

## 3. Slides (12–22 per lesson)

A good deck flows: **title → why it matters → concepts with diagrams → how it works step by step →
configuration (CLI) → verification (show output) → troubleshooting → comparison/reference table →
exam traps → summary.**

- **Titles** ≤ 60 characters. **Bullets**: ≤ 7 per slide, ≤ ~15 words each, fragments not paragraphs.
- **Notes** are the lecture: 100–250 words per slide explaining the slide as a great instructor would —
  the why, a concrete example, the gotcha, and how the exam tests it. Slides without real notes fail
  validation.
- At least **30%** of slides should be visual: `diagram`, `cli`, `table`, or a `bullets`/`steps` slide
  with a `diagram`.
- End with a `callout` (tone `exam`) listing the classic traps, and a summary slide.
- Use RichText markup sparingly: `**bold**` for key terms, `` `code` `` for commands/values,
  `==highlight==` for the single most important fact on a slide.

## 4. Diagrams (minimalist, declarative)

The renderer draws clean monoline SVG. You describe structure; it handles style.

- **topology** — devices and links. Grid units: default 10×5 canvas (`width`/`height` to change).
  Keep ≥ 1.6 units between nodes and ≥ 0.6 from edges. Put interface names in `fromLabel`/`toLabel`,
  subnets/VLANs in `label`, IPs/roles in node `sub`. Use `groups` for VLANs, areas, sites.
- **sequence** — protocol exchanges (DORA, handshake, ARP, OSPF states, REST calls). 3–8 steps.
- **header** — packet/frame formats (`rows` with 32 bits per row for IPv4/TCP/UDP; `line` for frames).
- **stack** — layered models; spans must add up equally in every column.
- **bits** — IPv4 binary with network/host highlighting (subnetting, wildcards, summarization).
- **flow** — processes/decisions (auto layout in order, or manual x/y with explicit edges).
- Tone: use `accent` to draw the eye to the ONE thing that matters; `bad`/`good` for failure/success;
  `muted` for context. Most elements should use the default tone.

## 5. Flashcards (15–30 per lesson)

- One atomic fact per card. Front: a term, command, number or crisp question. Back: 1–3 sentences.
- Cover every acronym, default value, timer, range, port, command and key comparison in the lesson.
- Good: "OSPF default hello/dead on broadcast links" → "10 s / 40 s". Bad: "Explain OSPF".
- Ids `f1`, `f2`, … unique within the lesson; never renumber.

## 6. Post-deck quiz (5–8 questions)

Short comprehension checks the learner takes right after finishing the deck. Difficulty 1–2, directly
answerable from the slides. Mix `single`, `multi`, `input` and one drag-and-drop style question.
Ids `q1`, `q2`, …

## 7. Exam bank (12–25 questions)

These feed timed practice exams, so they must feel like the real CCNA:

- Mix: ~50% `single`, ~20% `multi` ("(Choose two.)"), ~30% `match`/`order`/`categorize`/`input`.
- ≥ 30% use an **exhibit**: CLI output (`show ip route`, `show interfaces trunk`, `show ip ospf neighbor`,
  `show running-config` excerpts…) or a topology diagram. Scenario stems: "Refer to the exhibit…",
  "An engineer must… Which command…", "Which configuration…".
- Difficulty mix: ~20% level 1, ~50% level 2, ~30% level 3 (analysis/troubleshooting).
- Distractors must be plausible (real commands, real values, common misconceptions) — never silly.
- Every explanation says why the right answer is right **and** why the tempting wrong ones are wrong.
- `input` answers: list all acceptable forms (e.g. `["/26", "255.255.255.192"]`).
- Ids `e1`, `e2`, … unique within the lesson.

## 8. TypeScript gotchas

- Use template literals (backticks) for multi-line CLI code; escape any backtick inside them as `` \` ``
  and `${` as `\${`.
- In single-quoted strings escape apostrophes (`'R1\'s MAC'`) or use double quotes.
- Keep objects strictly to the schema — the compiler and validator will reject unknown shapes.
