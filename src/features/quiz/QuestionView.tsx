import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, GripVertical, X } from 'lucide-react';
import type { Exhibit, Question } from '../../content/types';
import { Rich } from '../../lib/rich';
import { CliBlock } from '../../components/CliBlock';
import { Diagram } from '../diagrams/Diagram';
import { grade, matchChoices, optionOrder, type Response } from './grading';
import './quiz.css';

export function ExhibitView({ exhibit }: { exhibit: Exhibit }) {
  return (
    <div className="exhibit">
      <div className="exhibit-label">Exhibit</div>
      {exhibit.kind === 'cli' && <CliBlock code={exhibit.text} />}
      {exhibit.kind === 'diagram' && (
        <div className="exhibit-diagram">
          <Diagram d={exhibit.diagram} />
        </div>
      )}
      {exhibit.kind === 'table' && (
        <div className="sl-table-wrap">
          <table className="table exhibit-table">
            <thead>
              <tr>
                {exhibit.columns.map((c, i) => (
                  <th key={i}>
                    <Rich text={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exhibit.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const LETTERS = 'ABCDEFGHIJ';

interface Props {
  q: Question;
  value: Response;
  onChange: (r: Response) => void;
  /** Show correctness and the explanation. */
  reveal: boolean;
  seed: number;
  number?: number;
  total?: number;
}

export function QuestionView({ q, value, onChange, reveal, seed, number, total }: Props) {
  const points = reveal ? grade(q, value) : 0;
  const hint =
    q.type === 'multi'
      ? `Choose ${q.answers.length}.`
      : q.type === 'order'
        ? 'Drag or use the arrows to put the items in order.'
        : q.type === 'match'
          ? 'Match each item on the left with one on the right.'
          : q.type === 'categorize'
            ? 'Place each item in the correct category.'
            : null;
  return (
    <div className="question">
      {number !== undefined && (
        <div className="q-meta">
          Question {number}
          {total ? ` of ${total}` : ''}
          {q.difficulty === 3 && <span className="chip warn">Hard</span>}
        </div>
      )}
      <Rich as="div" className="q-stem" text={q.stem} />
      {q.exhibit && <ExhibitView exhibit={q.exhibit} />}
      {hint && !reveal && <div className="q-hint">{hint}</div>}
      <div className="q-body">
        {(q.type === 'single' || q.type === 'multi') && <Choices q={q} value={value} onChange={onChange} reveal={reveal} seed={seed} />}
        {q.type === 'order' && value.type === 'order' && <OrderList q={q} value={value} onChange={onChange} reveal={reveal} />}
        {q.type === 'match' && value.type === 'match' && <Matcher q={q} value={value} onChange={onChange} reveal={reveal} seed={seed} />}
        {q.type === 'categorize' && value.type === 'categorize' && <Categorizer q={q} value={value} onChange={onChange} reveal={reveal} />}
        {q.type === 'input' && value.type === 'input' && (
          <div className="q-input-row">
            <input
              className={`input mono q-input ${reveal ? (points ? 'ok' : 'no') : ''}`}
              value={value.text}
              placeholder={q.placeholder ?? 'Type your answer'}
              onChange={(e) => onChange({ type: 'input', text: e.target.value })}
              disabled={reveal}
              autoComplete="off"
              spellCheck={false}
            />
            {reveal && !points && (
              <div className="q-correct-input">
                Correct: <code>{q.answers[0]}</code>
                {q.answers.length > 1 && <span className="muted"> (also accepted: {q.answers.slice(1).join(', ')})</span>}
              </div>
            )}
          </div>
        )}
      </div>
      {reveal && (
        <div className={`q-feedback ${points >= 0.999 ? 'good' : points > 0 ? 'partial' : 'bad'}`}>
          <div className="q-verdict">
            {points >= 0.999 ? <Check size={16} /> : <X size={16} />}
            {points >= 0.999 ? 'Correct' : points > 0 ? `Partially correct (${Math.round(points * 100)}%)` : 'Incorrect'}
          </div>
          <Rich as="div" className="q-explain" text={q.explanation} />
        </div>
      )}
    </div>
  );
}

function Choices({ q, value, onChange, reveal, seed }: Omit<Props, 'number' | 'total'>) {
  const order = useMemo(() => optionOrder(q, seed), [q, seed]);
  if (q.type !== 'single' && q.type !== 'multi') return null;
  const multi = q.type === 'multi';
  const selected = (i: number) => (value.type === 'single' ? value.choice === i : value.type === 'multi' ? value.choices.includes(i) : false);
  const isRight = (i: number) => (q.type === 'single' ? q.answer === i : q.answers.includes(i));
  const toggle = (i: number) => {
    if (reveal) return;
    if (!multi) onChange({ type: 'single', choice: i });
    else if (value.type === 'multi') {
      const has = value.choices.includes(i);
      onChange({ type: 'multi', choices: has ? value.choices.filter((c) => c !== i) : [...value.choices, i] });
    }
  };
  return (
    <div className="choices" role={multi ? 'group' : 'radiogroup'}>
      {order.map((optIdx, pos) => {
        const sel = selected(optIdx);
        const cls = reveal ? (isRight(optIdx) ? 'right' : sel ? 'wrong' : 'dim') : sel ? 'sel' : '';
        return (
          <button key={optIdx} type="button" className={`choice ${cls}`} onClick={() => toggle(optIdx)} aria-pressed={sel}>
            <span className={`choice-key ${multi ? 'sq' : ''}`}>{reveal && isRight(optIdx) ? <Check size={13} /> : LETTERS[pos]}</span>
            <Rich text={q.options[optIdx]} className="choice-text" />
          </button>
        );
      })}
    </div>
  );
}

function OrderList({ q, value, onChange, reveal }: { q: Question; value: Extract<Response, { type: 'order' }>; onChange: (r: Response) => void; reveal: boolean }) {
  const [drag, setDrag] = useState<number | null>(null);
  if (q.type !== 'order') return null;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.order.length || from === to) return;
    const o = value.order.slice();
    const [x] = o.splice(from, 1);
    o.splice(to, 0, x);
    onChange({ type: 'order', order: o });
  };
  return (
    <div className="order-list">
      {value.order.map((itemIdx, pos) => {
        const cls = reveal ? (itemIdx === pos ? 'right' : 'wrong') : '';
        return (
          <div
            key={itemIdx}
            className={`order-item ${cls} ${drag === pos ? 'dragging' : ''}`}
            draggable={!reveal}
            onDragStart={() => setDrag(pos)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag !== null) move(drag, pos);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
          >
            {!reveal && <GripVertical size={15} className="grip" />}
            <span className="order-n">{pos + 1}</span>
            <Rich text={q.items[itemIdx]} className="order-text" />
            {reveal && itemIdx !== pos && <span className="order-should">should be #{itemIdx + 1}</span>}
            {!reveal && (
              <span className="order-btns">
                <button type="button" className="btn ghost icon sm" onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" className="btn ghost icon sm" onClick={() => move(pos, pos + 1)} disabled={pos === value.order.length - 1} aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Matcher({ q, value, onChange, reveal, seed }: { q: Question; value: Extract<Response, { type: 'match' }>; onChange: (r: Response) => void; reveal: boolean; seed: number }) {
  const choices = useMemo(() => matchChoices(q, seed), [q, seed]);
  const [picked, setPicked] = useState<number | null>(null);
  if (q.type !== 'match') return null;
  const used = new Set(value.map.filter((v): v is number => v !== null));
  const place = (slot: number, choice: number | null) => {
    const map = value.map.map((v) => (v === choice ? null : v));
    map[slot] = choice;
    onChange({ type: 'match', map });
    setPicked(null);
  };
  return (
    <div className="dnd">
      <div className="dnd-rows">
        {q.pairs.map((p, i) => {
          const v = value.map[i];
          const ok = reveal && v !== null && q.pairs[v].right === p.right;
          return (
            <div key={i} className="dnd-row">
              <div className="dnd-left">
                <Rich text={p.left} />
              </div>
              <div
                className={`dnd-slot ${v !== null ? 'filled' : ''} ${picked !== null && !reveal ? 'armed' : ''} ${reveal ? (ok ? 'right' : 'wrong') : ''}`}
                onClick={() => !reveal && (picked !== null ? place(i, picked) : v !== null && place(i, null))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const c = Number(e.dataTransfer.getData('text/plain'));
                  if (!reveal && !Number.isNaN(c)) place(i, c);
                }}
              >
                {v !== null ? <Rich text={q.pairs[v].right} /> : <span className="faint">Drop here</span>}
              </div>
              {reveal && !ok && (
                <div className="dnd-answer">
                  <Rich text={p.right} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!reveal && (
        <div className="dnd-pool">
          {choices
            .filter((c) => !used.has(c))
            .map((c) => (
              <button
                key={c}
                type="button"
                className={`dnd-chip ${picked === c ? 'picked' : ''}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(c))}
                onClick={() => setPicked(picked === c ? null : c)}
              >
                <Rich text={q.pairs[c].right} />
              </button>
            ))}
          {used.size === q.pairs.length && <span className="faint small">All placed — click a slot to remove.</span>}
        </div>
      )}
    </div>
  );
}

function Categorizer({ q, value, onChange, reveal }: { q: Question; value: Extract<Response, { type: 'categorize' }>; onChange: (r: Response) => void; reveal: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  if (q.type !== 'categorize') return null;
  const place = (item: number, cat: number | null) => {
    const map = value.map.slice();
    map[item] = cat;
    onChange({ type: 'categorize', map });
    setPicked(null);
  };
  const pool = q.items.map((_, i) => i).filter((i) => value.map[i] === null);
  return (
    <div className="dnd">
      <div className="cat-cols" style={{ gridTemplateColumns: `repeat(${Math.min(q.categories.length, 4)}, minmax(0, 1fr))` }}>
        {q.categories.map((c, ci) => (
          <div
            key={ci}
            className={`cat-col ${picked !== null && !reveal ? 'armed' : ''}`}
            onClick={() => picked !== null && !reveal && place(picked, ci)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const it = Number(e.dataTransfer.getData('text/plain'));
              if (!reveal && !Number.isNaN(it)) place(it, ci);
            }}
          >
            <div className="cat-head">{c}</div>
            {q.items.map((it, ii) =>
              value.map[ii] === ci ? (
                <button
                  key={ii}
                  type="button"
                  className={`dnd-chip placed ${reveal ? (it.category === ci ? 'right' : 'wrong') : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!reveal) place(ii, null);
                  }}
                  draggable={!reveal}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', String(ii))}
                >
                  <Rich text={it.text} />
                  {reveal && it.category !== ci && <span className="cat-should">→ {q.categories[it.category]}</span>}
                </button>
              ) : null,
            )}
          </div>
        ))}
      </div>
      {!reveal && pool.length > 0 && (
        <div className="dnd-pool">
          {pool.map((ii) => (
            <button
              key={ii}
              type="button"
              className={`dnd-chip ${picked === ii ? 'picked' : ''}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(ii))}
              onClick={() => setPicked(picked === ii ? null : ii)}
            >
              <Rich text={q.items[ii].text} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
