/**
 * WizardCCNA content schema.
 *
 * Every lesson lives in `src/content/lessons/<lessonId>.ts` and default-exports a `LessonContent`.
 * Every lab lives in `src/content/labs/<labId>.ts` and default-exports a `Lab` (see ./labTypes.ts).
 *
 * RichText strings support a tiny inline markup that the renderer understands:
 *   **bold**   `inline code`   *italic*   ==highlight==   and "\n" for a line break.
 * Keep markup balanced. Do not use HTML or Markdown headings/lists inside RichText.
 */

export type RichText = string;

/** Semantic color for diagrams and callouts. The palette is minimal: ink, one accent, and status colors. */
export type Tone = 'default' | 'accent' | 'muted' | 'good' | 'bad' | 'warn';

/* ------------------------------------------------------------------ */
/* Slides                                                              */
/* ------------------------------------------------------------------ */

/** A bullet is either a plain RichText string or a bullet with nested sub-bullets. */
export type Bullet = RichText | { text: RichText; sub?: RichText[] };

interface SlideBase {
  /** Slide heading (short, ≤ 60 chars). */
  title: string;
  /**
   * Instructor narration shown under the slide ("Explain" panel). This is where the real teaching
   * happens: 80–250 words of clear explanation, examples, gotchas and exam tips. Required on every slide.
   */
  notes: RichText;
}

/** Opening slide of a deck or a section divider. */
export interface TitleSlide extends SlideBase {
  kind: 'title';
  subtitle?: RichText;
}

/** Bullet list, optionally with a diagram shown beside it. */
export interface BulletsSlide extends SlideBase {
  kind: 'bullets';
  bullets: Bullet[];
  diagram?: Diagram;
}

/** A diagram as the hero of the slide, with an optional caption and a few bullets. */
export interface DiagramSlide extends SlideBase {
  kind: 'diagram';
  diagram: Diagram;
  caption?: RichText;
  bullets?: Bullet[];
}

/** A comparison or reference table. */
export interface TableSlide extends SlideBase {
  kind: 'table';
  columns: RichText[];
  rows: RichText[][];
  caption?: RichText;
}

/**
 * Cisco IOS (or host OS) terminal transcript.
 * `code` is the raw transcript. Lines that start with a prompt (e.g. `R1#`, `R1(config-if)#`, `SW1>`,
 * `C:\>`, `$ `) are rendered as typed commands; other lines are rendered as device output.
 * `highlight` lists substrings that should be emphasized wherever they appear.
 */
export interface CliSlide extends SlideBase {
  kind: 'cli';
  code: string;
  highlight?: string[];
  caption?: RichText;
  bullets?: Bullet[];
}

/** Two-column comparison (e.g. TCP vs UDP). */
export interface CompareSlide extends SlideBase {
  kind: 'compare';
  left: { heading: string; bullets: Bullet[]; tone?: Tone };
  right: { heading: string; bullets: Bullet[]; tone?: Tone };
}

/** Emphasized message: an exam tip, a key rule, a warning or a common trap. */
export interface CalloutSlide extends SlideBase {
  kind: 'callout';
  tone: 'tip' | 'exam' | 'key' | 'warning';
  body: RichText;
  bullets?: Bullet[];
}

/** Glossary-style slide of terms and definitions. */
export interface DefinitionsSlide extends SlideBase {
  kind: 'definitions';
  terms: { term: RichText; def: RichText }[];
}

/** Numbered process or procedure. */
export interface StepsSlide extends SlideBase {
  kind: 'steps';
  steps: { title: RichText; text?: RichText }[];
  diagram?: Diagram;
}

export type Slide =
  | TitleSlide
  | BulletsSlide
  | DiagramSlide
  | TableSlide
  | CliSlide
  | CompareSlide
  | CalloutSlide
  | DefinitionsSlide
  | StepsSlide;

/* ------------------------------------------------------------------ */
/* Diagrams (declarative, rendered as minimalist SVG)                   */
/* ------------------------------------------------------------------ */

export type NodeIcon =
  | 'router'
  | 'switch'
  | 'l3switch'
  | 'hub'
  | 'firewall'
  | 'ips'
  | 'ap'
  | 'wlc'
  | 'controller'
  | 'pc'
  | 'laptop'
  | 'phone'
  | 'tablet'
  | 'printer'
  | 'server'
  | 'database'
  | 'cloud'
  | 'internet'
  | 'vm'
  | 'container'
  | 'hypervisor'
  | 'user'
  | 'attacker'
  | 'iot'
  | 'camera'
  | 'modem'
  | 'box';

/**
 * Network topology drawing.
 * Coordinates are in abstract grid units: x ∈ [0, width], y ∈ [0, height]. Defaults: width 10, height 5.
 * Leave ≥ 1.6 units between node centers and keep nodes ≥ 0.6 units from the edges.
 */
export interface TopologyDiagram {
  type: 'topology';
  width?: number;
  height?: number;
  nodes: {
    id: string;
    icon: NodeIcon;
    label?: string;
    /** Small second line under the label, e.g. an IP address or role. */
    sub?: string;
    x: number;
    y: number;
    tone?: Tone;
  }[];
  links: {
    from: string;
    to: string;
    /** Label at the middle of the link (e.g. subnet or VLAN). */
    label?: string;
    /** Labels near each end (usually interface names like G0/1). */
    fromLabel?: string;
    toLabel?: string;
    style?: 'solid' | 'dashed' | 'dotted' | 'wireless' | 'serial' | 'thick';
    tone?: Tone;
    /** Draw a block marker (e.g. STP blocked port) near the `to` end. */
    blocked?: boolean;
    arrow?: 'none' | 'forward' | 'back' | 'both';
  }[];
  /** Shaded rectangles behind nodes: VLANs, OSPF areas, sites, trust zones. */
  groups?: { label: string; x: number; y: number; w: number; h: number; tone?: Tone }[];
  /** Free text annotations. */
  annotations?: { x: number; y: number; text: string; tone?: Tone }[];
}

/**
 * Message sequence between actors (DHCP DORA, TCP handshake, ARP, DNS, SSH, OSPF...).
 * Steps are drawn top to bottom in order.
 */
export interface SequenceDiagram {
  type: 'sequence';
  actors: { id: string; label: string; icon?: NodeIcon }[];
  steps: (
    | { from: string; to: string; label: string; sub?: string; tone?: Tone; dashed?: boolean }
    | { note: string; tone?: Tone }
  )[];
}

/**
 * Packet/frame header layout.
 * layout 'rows' (default): fields wrap into rows of `bitsPerRow` bits (32 for IPv4/TCP/UDP headers).
 *   The sum of field sizes should be a multiple of bitsPerRow unless the last row is intentionally partial.
 * layout 'line': a single row (e.g. an Ethernet frame) — sizes are shown under each field, widths scale softly.
 */
export interface HeaderDiagram {
  type: 'header';
  layout?: 'rows' | 'line';
  bitsPerRow?: number;
  /** Unit shown with sizes. Default 'bits'. */
  unit?: 'bits' | 'bytes';
  fields: { label: string; size: number; tone?: Tone; sub?: string }[];
  caption?: string;
}

/**
 * Side-by-side layer stacks (OSI vs TCP/IP, encapsulation, PDUs).
 * Layers are listed top → bottom. `span` lets one layer cover several rows (default 1).
 * Every column's spans should add up to the same total.
 */
export interface StackDiagram {
  type: 'stack';
  columns: {
    title?: string;
    layers: { label: string; sub?: string; tone?: Tone; span?: number }[];
  }[];
}

/**
 * Binary view of IPv4 addresses/masks, 32 bits per row, grouped by octet.
 * `prefix` highlights the first N bits as network bits (accent) and the rest as host bits (muted).
 * `value` is dotted decimal ("192.168.1.130") or a 32-char binary string.
 */
export interface BitsDiagram {
  type: 'bits';
  rows: { label?: string; value: string; prefix?: number; tone?: Tone }[];
  /** Show the decimal value of each octet under its bits. Default true. */
  showDecimal?: boolean;
}

/**
 * Boxes-and-arrows process/decision flow.
 * If no node has x/y, nodes are laid out in order along `direction` and consecutive nodes are
 * connected automatically unless `edges` is given. If x/y are given (grid units like topology),
 * the layout is manual and `edges` should be provided.
 */
export interface FlowDiagram {
  type: 'flow';
  direction?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  nodes: {
    id: string;
    label: string;
    sub?: string;
    shape?: 'box' | 'round' | 'diamond' | 'pill';
    tone?: Tone;
    x?: number;
    y?: number;
  }[];
  edges?: { from: string; to: string; label?: string; dashed?: boolean; tone?: Tone }[];
}

export type Diagram =
  | TopologyDiagram
  | SequenceDiagram
  | HeaderDiagram
  | StackDiagram
  | BitsDiagram
  | FlowDiagram;

/* ------------------------------------------------------------------ */
/* Flashcards                                                          */
/* ------------------------------------------------------------------ */

export interface Flashcard {
  /** Unique within the lesson, e.g. "f1", "f2". Never reuse or renumber existing ids. */
  id: string;
  /** A term, command, number or question. Short. */
  front: RichText;
  /** The answer: precise and concise (1–3 sentences or a short list separated by \n). */
  back: RichText;
  tags?: string[];
}

/* ------------------------------------------------------------------ */
/* Questions (post-deck quizzes and the practice-exam bank)             */
/* ------------------------------------------------------------------ */

export type Exhibit =
  | { kind: 'cli'; text: string }
  | { kind: 'diagram'; diagram: Diagram }
  | { kind: 'table'; columns: RichText[]; rows: RichText[][] };

interface QuestionBase {
  /** Unique within the lesson, e.g. "q1" (quiz) or "e1" (exam bank). */
  id: string;
  stem: RichText;
  exhibit?: Exhibit;
  /** Why the answer is right AND why the tempting wrong answers are wrong. */
  explanation: RichText;
  /** 1 = recall, 2 = application, 3 = analysis/troubleshooting (exam-hard). */
  difficulty?: 1 | 2 | 3;
  tags?: string[];
}

/** One correct option. */
export interface SingleQuestion extends QuestionBase {
  type: 'single';
  options: RichText[];
  /** Index into options. */
  answer: number;
}

/** Several correct options. The stem must say how many, e.g. "(Choose two.)". */
export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: RichText[];
  answers: number[];
}

/** Put the items in the correct order. `items` is listed in the CORRECT order; the UI shuffles. */
export interface OrderQuestion extends QuestionBase {
  type: 'order';
  items: RichText[];
}

/** Drag-and-drop matching. Each left item matches exactly one right item. The UI shuffles rights. */
export interface MatchQuestion extends QuestionBase {
  type: 'match';
  pairs: { left: RichText; right: RichText }[];
}

/** Drag items into categories (Cisco's classic drag-and-drop). */
export interface CategorizeQuestion extends QuestionBase {
  type: 'categorize';
  categories: string[];
  /** `category` is an index into categories. */
  items: { text: RichText; category: number }[];
}

/**
 * Free-response answer (subnetting math, a command, a number).
 * Answers are compared case-insensitively after trimming and collapsing whitespace.
 * List every acceptable form, e.g. ["192.168.1.63"] or ["255.255.255.192", "/26"].
 */
export interface InputQuestion extends QuestionBase {
  type: 'input';
  answers: string[];
  placeholder?: string;
}

export type Question =
  | SingleQuestion
  | MultiQuestion
  | OrderQuestion
  | MatchQuestion
  | CategorizeQuestion
  | InputQuestion;

/* ------------------------------------------------------------------ */
/* Lessons                                                             */
/* ------------------------------------------------------------------ */

export interface LessonContent {
  /** Must equal the file name and an id in curriculum.ts. */
  id: string;
  /** 12–22 slides. First slide should be kind 'title'. */
  slides: Slide[];
  /** 15–30 cards. Unlocked for review once the learner finishes the deck. */
  flashcards: Flashcard[];
  /** 5–8 short comprehension questions shown right after the deck. */
  quiz: Question[];
  /** 12–25 exam-style questions for practice exams and domain quizzes. */
  exam: Question[];
}
