/**
 * Content validation used by `npm run validate` (see validate.test.ts).
 * Returns human-readable errors (must fix) and warnings (should fix).
 */
import type { Diagram, LessonContent, Question, RichText, Slide } from './types';
import { LESSON_BY_ID } from './curriculum';

export interface Issues {
  errors: string[];
  warnings: string[];
}

const NODE_ICONS = new Set([
  'router', 'switch', 'l3switch', 'hub', 'firewall', 'ips', 'ap', 'wlc', 'controller', 'pc', 'laptop',
  'phone', 'tablet', 'printer', 'server', 'database', 'cloud', 'internet', 'vm', 'container', 'hypervisor',
  'user', 'attacker', 'iot', 'camera', 'modem', 'box',
]);

function checkRich(text: unknown, where: string, out: Issues) {
  if (typeof text !== 'string') {
    out.errors.push(`${where}: expected a string`);
    return;
  }
  const bold = (text.match(/\*\*/g) || []).length;
  if (bold % 2) out.warnings.push(`${where}: unbalanced **bold** markers`);
  const code = (text.match(/`/g) || []).length;
  if (code % 2) out.warnings.push(`${where}: unbalanced \`code\` markers`);
  const hl = (text.match(/==/g) || []).length;
  if (hl % 2) out.warnings.push(`${where}: unbalanced ==highlight== markers`);
  if (/<\/?[a-z][^>]*>/i.test(text) && !/`[^`]*<[^`]*`/.test(text)) {
    out.warnings.push(`${where}: looks like it contains HTML tags — use RichText markup instead`);
  }
}

function bulletText(b: unknown): string[] {
  if (typeof b === 'string') return [b];
  if (b && typeof b === 'object' && 'text' in b) {
    const o = b as { text: string; sub?: string[] };
    return [o.text, ...(o.sub ?? [])];
  }
  return [];
}

function isIPv4(s: string) {
  const p = s.split('.');
  return p.length === 4 && p.every((o) => /^\d{1,3}$/.test(o) && Number(o) <= 255);
}

export function validateDiagram(d: Diagram, where: string, out: Issues) {
  if (!d || typeof d !== 'object') {
    out.errors.push(`${where}: diagram missing`);
    return;
  }
  switch (d.type) {
    case 'topology': {
      const w = d.width ?? 10;
      const h = d.height ?? 5;
      const ids = new Set<string>();
      for (const n of d.nodes ?? []) {
        if (ids.has(n.id)) out.errors.push(`${where}: duplicate node id "${n.id}"`);
        ids.add(n.id);
        if (!NODE_ICONS.has(n.icon)) out.errors.push(`${where}: node "${n.id}" has unknown icon "${n.icon}"`);
        if (n.x < 0 || n.x > w || n.y < 0 || n.y > h) {
          out.errors.push(`${where}: node "${n.id}" at (${n.x},${n.y}) is outside the ${w}x${h} canvas`);
        }
      }
      const nodes = d.nodes ?? [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 1.0) out.warnings.push(`${where}: nodes "${nodes[i].id}" and "${nodes[j].id}" overlap (distance ${dist.toFixed(2)})`);
        }
      }
      for (const l of d.links ?? []) {
        if (!ids.has(l.from)) out.errors.push(`${where}: link from unknown node "${l.from}"`);
        if (!ids.has(l.to)) out.errors.push(`${where}: link to unknown node "${l.to}"`);
      }
      for (const g of d.groups ?? []) {
        if (g.x < 0 || g.y < 0 || g.x + g.w > w + 0.01 || g.y + g.h > h + 0.01) {
          out.warnings.push(`${where}: group "${g.label}" extends outside the canvas`);
        }
      }
      if (!nodes.length) out.errors.push(`${where}: topology has no nodes`);
      break;
    }
    case 'sequence': {
      const ids = new Set(d.actors.map((a) => a.id));
      if (d.actors.length < 2) out.errors.push(`${where}: sequence needs ≥ 2 actors`);
      if (ids.size !== d.actors.length) out.errors.push(`${where}: duplicate actor ids`);
      for (const s of d.steps) {
        if ('note' in s) continue;
        if (!ids.has(s.from)) out.errors.push(`${where}: step from unknown actor "${s.from}"`);
        if (!ids.has(s.to)) out.errors.push(`${where}: step to unknown actor "${s.to}"`);
      }
      if (!d.steps.length) out.errors.push(`${where}: sequence has no steps`);
      break;
    }
    case 'header': {
      if (!d.fields?.length) out.errors.push(`${where}: header has no fields`);
      for (const f of d.fields ?? []) if (!(f.size > 0)) out.errors.push(`${where}: field "${f.label}" needs size > 0`);
      if ((d.layout ?? 'rows') === 'rows') {
        const per = d.bitsPerRow ?? 32;
        const total = (d.fields ?? []).reduce((a, f) => a + f.size, 0);
        if (total % per !== 0) out.warnings.push(`${where}: header field sizes sum to ${total}, not a multiple of ${per}`);
        for (const f of d.fields ?? []) if (f.size > per && f.size % per !== 0) {
          out.warnings.push(`${where}: field "${f.label}" (${f.size}) spans rows unevenly`);
        }
      }
      break;
    }
    case 'stack': {
      if (!d.columns?.length) out.errors.push(`${where}: stack has no columns`);
      const totals = (d.columns ?? []).map((c) => c.layers.reduce((a, l) => a + (l.span ?? 1), 0));
      if (new Set(totals).size > 1) out.errors.push(`${where}: stack columns have different total spans (${totals.join(', ')})`);
      break;
    }
    case 'bits': {
      if (!d.rows?.length) out.errors.push(`${where}: bits diagram has no rows`);
      for (const r of d.rows ?? []) {
        if (!isIPv4(r.value) && !/^[01]{32}$/.test(r.value)) out.errors.push(`${where}: bits value "${r.value}" is not IPv4 or 32 binary digits`);
        if (r.prefix !== undefined && (r.prefix < 0 || r.prefix > 32)) out.errors.push(`${where}: prefix ${r.prefix} out of range`);
      }
      break;
    }
    case 'flow': {
      const ids = new Set<string>();
      for (const n of d.nodes ?? []) {
        if (ids.has(n.id)) out.errors.push(`${where}: duplicate flow node "${n.id}"`);
        ids.add(n.id);
      }
      const manual = (d.nodes ?? []).some((n) => n.x !== undefined || n.y !== undefined);
      if (manual && (d.nodes ?? []).some((n) => n.x === undefined || n.y === undefined)) {
        out.errors.push(`${where}: flow mixes positioned and unpositioned nodes`);
      }
      for (const e of d.edges ?? []) {
        if (!ids.has(e.from) || !ids.has(e.to)) out.errors.push(`${where}: flow edge ${e.from}→${e.to} references unknown node`);
      }
      if (!d.nodes?.length) out.errors.push(`${where}: flow has no nodes`);
      break;
    }
    default:
      out.errors.push(`${where}: unknown diagram type "${(d as { type: string }).type}"`);
  }
}

function validateSlide(s: Slide, where: string, out: Issues) {
  if (!s.title?.trim()) out.errors.push(`${where}: missing title`);
  if (s.title && s.title.length > 70) out.warnings.push(`${where}: title is long (${s.title.length} chars)`);
  checkRich(s.notes, `${where}.notes`, out);
  const notesLen = (s.notes ?? '').length;
  const minNotes = s.kind === 'title' ? 60 : 150;
  if (notesLen < 60) out.errors.push(`${where}: notes too short (${notesLen} chars) — explain the slide`);
  else if (notesLen < minNotes) out.warnings.push(`${where}: notes are thin (${notesLen} chars)`);
  switch (s.kind) {
    case 'title':
      break;
    case 'bullets':
      if (!s.bullets?.length) out.errors.push(`${where}: bullets slide has no bullets`);
      if ((s.bullets?.length ?? 0) > 8) out.warnings.push(`${where}: ${s.bullets.length} bullets — keep slides focused (≤ 7)`);
      s.bullets?.forEach((b, i) => bulletText(b).forEach((t) => {
        checkRich(t, `${where}.bullets[${i}]`, out);
        if (t.length > 170) out.warnings.push(`${where}.bullets[${i}]: bullet is long (${t.length} chars)`);
      }));
      if (s.diagram) validateDiagram(s.diagram, `${where}.diagram`, out);
      break;
    case 'diagram':
      validateDiagram(s.diagram, `${where}.diagram`, out);
      s.bullets?.forEach((b, i) => bulletText(b).forEach((t) => checkRich(t, `${where}.bullets[${i}]`, out)));
      if (s.caption) checkRich(s.caption, `${where}.caption`, out);
      break;
    case 'table':
      if ((s.columns?.length ?? 0) < 2) out.errors.push(`${where}: table needs ≥ 2 columns`);
      s.rows?.forEach((r, i) => {
        if (r.length !== s.columns.length) out.errors.push(`${where}: row ${i} has ${r.length} cells, expected ${s.columns.length}`);
        r.forEach((c, j) => checkRich(c, `${where}.rows[${i}][${j}]`, out));
      });
      if (!s.rows?.length) out.errors.push(`${where}: table has no rows`);
      break;
    case 'cli':
      if (!s.code?.trim()) out.errors.push(`${where}: cli slide has no code`);
      if (s.code && s.code.split('\n').length > 32) out.warnings.push(`${where}: cli transcript is long (${s.code.split('\n').length} lines; ≤ 28 fits best)`);
      s.bullets?.forEach((b, i) => bulletText(b).forEach((t) => checkRich(t, `${where}.bullets[${i}]`, out)));
      break;
    case 'compare':
      if (!s.left?.bullets?.length || !s.right?.bullets?.length) out.errors.push(`${where}: compare needs bullets on both sides`);
      [...(s.left?.bullets ?? []), ...(s.right?.bullets ?? [])].forEach((b, i) =>
        bulletText(b).forEach((t) => checkRich(t, `${where}.side[${i}]`, out)),
      );
      break;
    case 'callout':
      if (!s.body?.trim()) out.errors.push(`${where}: callout needs a body`);
      checkRich(s.body, `${where}.body`, out);
      if (!['tip', 'exam', 'key', 'warning'].includes(s.tone)) out.errors.push(`${where}: bad callout tone "${s.tone}"`);
      break;
    case 'definitions':
      if ((s.terms?.length ?? 0) < 2) out.errors.push(`${where}: definitions need ≥ 2 terms`);
      if ((s.terms?.length ?? 0) > 8) out.warnings.push(`${where}: ${s.terms.length} terms — split across slides (≤ 7)`);
      s.terms?.forEach((t, i) => { checkRich(t.term, `${where}.terms[${i}].term`, out); checkRich(t.def, `${where}.terms[${i}].def`, out); });
      break;
    case 'steps':
      if ((s.steps?.length ?? 0) < 2) out.errors.push(`${where}: steps need ≥ 2 entries`);
      s.steps?.forEach((t, i) => { checkRich(t.title, `${where}.steps[${i}].title`, out); if (t.text) checkRich(t.text, `${where}.steps[${i}].text`, out); });
      if (s.diagram) validateDiagram(s.diagram, `${where}.diagram`, out);
      break;
    default:
      out.errors.push(`${where}: unknown slide kind "${(s as { kind: string }).kind}"`);
  }
}

/** Practice questions must not be solvable by picking the longest option: warn when the key is much longer than the distractors. */
function lengthGiveaway(options: string[], answers: number[], where: string, out: Issues) {
  const keys = new Set(answers);
  const avg = (xs: string[]) => xs.reduce((a, o) => a + o.length, 0) / Math.max(1, xs.length);
  const right = options.filter((_, i) => keys.has(i));
  const wrong = options.filter((_, i) => !keys.has(i));
  if (!wrong.length) return;
  const ratio = answers.length === 1 ? right[0].length / Math.max(...wrong.map((o) => o.length)) : avg(right) / avg(wrong);
  if (ratio >= 1.4) out.warnings.push(`${where}: the correct option(s) are ${ratio.toFixed(1)}x longer than the distractors — balance option lengths so length is not a giveaway`);
}

export function validateQuestion(q: Question, where: string, out: Issues) {
  if (!q.id) out.errors.push(`${where}: missing id`);
  checkRich(q.stem, `${where}.stem`, out);
  if (!q.stem?.trim()) out.errors.push(`${where}: empty stem`);
  checkRich(q.explanation, `${where}.explanation`, out);
  if ((q.explanation ?? '').length < 40) out.errors.push(`${where}: explanation too short — explain why`);
  if (q.exhibit) {
    if (q.exhibit.kind === 'diagram') validateDiagram(q.exhibit.diagram, `${where}.exhibit`, out);
    if (q.exhibit.kind === 'table') {
      const cols = q.exhibit.columns.length;
      if (q.exhibit.rows.some((r) => r.length !== cols)) out.errors.push(`${where}: exhibit table row length mismatch`);
    }
    if (q.exhibit.kind === 'cli' && !q.exhibit.text.trim()) out.errors.push(`${where}: empty cli exhibit`);
  }
  switch (q.type) {
    case 'single': {
      if ((q.options?.length ?? 0) < 3) out.errors.push(`${where}: single-answer needs ≥ 3 options`);
      if (!(q.answer >= 0 && q.answer < q.options.length)) out.errors.push(`${where}: answer index ${q.answer} out of range`);
      if (new Set(q.options).size !== q.options.length) out.errors.push(`${where}: duplicate options`);
      q.options.forEach((o, i) => checkRich(o, `${where}.options[${i}]`, out));
      lengthGiveaway(q.options, [q.answer], where, out);
      break;
    }
    case 'multi': {
      if ((q.options?.length ?? 0) < 4) out.errors.push(`${where}: multi-answer needs ≥ 4 options`);
      if ((q.answers?.length ?? 0) < 2) out.errors.push(`${where}: multi-answer needs ≥ 2 correct answers (use 'single' otherwise)`);
      if (q.answers.some((a) => !(a >= 0 && a < q.options.length))) out.errors.push(`${where}: answer index out of range`);
      if (new Set(q.answers).size !== q.answers.length) out.errors.push(`${where}: duplicate answer indices`);
      if (new Set(q.options).size !== q.options.length) out.errors.push(`${where}: duplicate options`);
      if (!/choose (two|three|four|2|3|4)/i.test(q.stem)) out.warnings.push(`${where}: multi-answer stem should say "(Choose two.)" etc.`);
      const n = ['', '', 'two', 'three', 'four'][q.answers.length];
      if (n && /choose (two|three|four)/i.test(q.stem) && !new RegExp(`choose ${n}`, 'i').test(q.stem)) {
        out.errors.push(`${where}: stem says a different "Choose N" than the ${q.answers.length} answers given`);
      }
      q.options.forEach((o, i) => checkRich(o, `${where}.options[${i}]`, out));
      lengthGiveaway(q.options, q.answers, where, out);
      break;
    }
    case 'order':
      if ((q.items?.length ?? 0) < 3) out.errors.push(`${where}: order question needs ≥ 3 items`);
      if (new Set(q.items).size !== q.items.length) out.errors.push(`${where}: duplicate order items`);
      break;
    case 'match':
      if ((q.pairs?.length ?? 0) < 3) out.errors.push(`${where}: match question needs ≥ 3 pairs`);
      if (new Set(q.pairs.map((p) => p.right)).size !== q.pairs.length) out.errors.push(`${where}: match right-hand values must be unique`);
      if (new Set(q.pairs.map((p) => p.left)).size !== q.pairs.length) out.errors.push(`${where}: match left-hand values must be unique`);
      break;
    case 'categorize':
      if ((q.categories?.length ?? 0) < 2) out.errors.push(`${where}: categorize needs ≥ 2 categories`);
      if ((q.items?.length ?? 0) < 3) out.errors.push(`${where}: categorize needs ≥ 3 items`);
      if (q.items.some((it) => !(it.category >= 0 && it.category < q.categories.length))) out.errors.push(`${where}: item category out of range`);
      if (new Set(q.items.map((i) => i.text)).size !== q.items.length) out.errors.push(`${where}: duplicate categorize items`);
      break;
    case 'input':
      if (!q.answers?.length || q.answers.some((a) => !a.trim())) out.errors.push(`${where}: input question needs accepted answers`);
      break;
    default:
      out.errors.push(`${where}: unknown question type "${(q as { type: string }).type}"`);
  }
}

export function validateLesson(fileId: string, lesson: LessonContent): Issues {
  const out: Issues = { errors: [], warnings: [] };
  if (!lesson || typeof lesson !== 'object') {
    out.errors.push('default export missing');
    return out;
  }
  if (lesson.id !== fileId) out.errors.push(`id "${lesson.id}" must equal file name "${fileId}"`);
  if (!LESSON_BY_ID[lesson.id]) out.errors.push(`id "${lesson.id}" is not in curriculum.ts`);

  const slides = lesson.slides ?? [];
  if (slides.length < 8) out.errors.push(`only ${slides.length} slides (need 12–22)`);
  else if (slides.length < 12) out.warnings.push(`${slides.length} slides — aim for 12–22`);
  if (slides.length > 26) out.warnings.push(`${slides.length} slides — consider trimming (≤ 24)`);
  if (slides[0] && slides[0].kind !== 'title') out.warnings.push('first slide should be kind "title"');
  slides.forEach((s, i) => validateSlide(s, `slide[${i}]`, out));
  const visual = slides.filter((s) => s.kind === 'diagram' || s.kind === 'cli' || s.kind === 'table' || ('diagram' in s && s.diagram)).length;
  if (slides.length >= 8 && visual < Math.ceil(slides.length * 0.25)) {
    out.warnings.push(`only ${visual} visual slides (diagram/cli/table) — aim for ≥ 30%`);
  }

  const cards = lesson.flashcards ?? [];
  if (cards.length < 8) out.errors.push(`only ${cards.length} flashcards (need 15–30)`);
  else if (cards.length < 15) out.warnings.push(`${cards.length} flashcards — aim for 15–30`);
  const cardIds = new Set<string>();
  const fronts = new Set<string>();
  cards.forEach((c, i) => {
    if (!c.id) out.errors.push(`flashcards[${i}]: missing id`);
    if (cardIds.has(c.id)) out.errors.push(`flashcards[${i}]: duplicate id "${c.id}"`);
    cardIds.add(c.id);
    if (!c.front?.trim() || !c.back?.trim()) out.errors.push(`flashcards[${i}]: empty front/back`);
    checkRich(c.front, `flashcards[${i}].front`, out);
    checkRich(c.back, `flashcards[${i}].back`, out);
    const f = (c.front ?? '').toLowerCase().trim();
    if (fronts.has(f)) out.warnings.push(`flashcards[${i}]: duplicate front "${c.front}"`);
    fronts.add(f);
  });

  const quiz = lesson.quiz ?? [];
  const exam = lesson.exam ?? [];
  if (quiz.length < 3) out.errors.push(`only ${quiz.length} quiz questions (need 5–8)`);
  else if (quiz.length < 5) out.warnings.push(`${quiz.length} quiz questions — aim for 5–8`);
  if (quiz.length > 10) out.warnings.push(`${quiz.length} quiz questions — the post-deck quiz should be short (5–8)`);
  if (exam.length < 8) out.errors.push(`only ${exam.length} exam questions (need 12–25)`);
  else if (exam.length < 12) out.warnings.push(`${exam.length} exam questions — aim for 12–25`);
  const qIds = new Set<string>();
  [...quiz.map((q, i) => [q, `quiz[${i}]`] as const), ...exam.map((q, i) => [q, `exam[${i}]`] as const)].forEach(([q, where]) => {
    if (qIds.has(q.id)) out.errors.push(`${where}: duplicate question id "${q.id}"`);
    qIds.add(q.id);
    validateQuestion(q, where, out);
  });
  const examTypes = new Set(exam.map((q) => q.type));
  if (exam.length >= 12 && examTypes.size < 3) out.warnings.push(`exam bank uses only ${[...examTypes].join('/')} — mix in multi, match/order/categorize or input`);
  return out;
}

export function textOf(r: RichText) {
  return r.replace(/\*\*|==|`/g, '');
}
