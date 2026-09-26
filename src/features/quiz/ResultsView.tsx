import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Question } from '../../content/types';
import { LESSON_BY_ID } from '../../content/curriculum';
import { plain } from '../../lib/rich';
import { QuestionView } from './QuestionView';
import type { Response } from './grading';

export interface ReviewItem {
  key: string;
  lessonId: string;
  question: Question;
  response: Response;
  points: number;
}

export function ReviewList({ items, seed, onlyMissedDefault = false }: { items: ReviewItem[]; seed: number; onlyMissedDefault?: boolean }) {
  const [onlyMissed, setOnlyMissed] = useState(onlyMissedDefault);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const shown = items.map((it, i) => ({ it, i })).filter(({ it }) => !onlyMissed || it.points < 0.999);
  return (
    <div>
      <div className="row between mb">
        <h3>Review answers</h3>
        <div className="segmented">
          <button className={!onlyMissed ? 'on' : ''} onClick={() => setOnlyMissed(false)}>
            All ({items.length})
          </button>
          <button className={onlyMissed ? 'on' : ''} onClick={() => setOnlyMissed(true)}>
            Missed ({items.filter((x) => x.points < 0.999).length})
          </button>
        </div>
      </div>
      <div className="list">
        {shown.length === 0 && <div className="list-item muted">Nothing missed — perfect.</div>}
        {shown.map(({ it, i }) => {
          const ok = it.points >= 0.999;
          const isOpen = open[i];
          return (
            <div key={it.key + i} className="review-item">
              <button className="list-item" onClick={() => setOpen({ ...open, [i]: !isOpen })}>
                <span className={`review-mark ${ok ? 'good' : 'bad'}`}>{ok ? <Check size={13} /> : <X size={13} />}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="title review-stem">
                    {i + 1}. {plain(it.question.stem)}
                  </div>
                  <div className="sub">{LESSON_BY_ID[it.lessonId]?.title}</div>
                </div>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {isOpen && (
                <div className="review-body">
                  <QuestionView q={it.question} value={it.response} onChange={() => {}} reveal seed={seed} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
