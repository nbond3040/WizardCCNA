import { AlertTriangle, GraduationCap, KeyRound, Lightbulb } from 'lucide-react';
import type { Bullet, Slide } from '../../content/types';
import { Rich } from '../../lib/rich';
import { Diagram } from '../diagrams/Diagram';
import { CliBlock } from '../../components/CliBlock';

function Bullets({ items, className }: { items: Bullet[]; className?: string }) {
  return (
    <ul className={`sl-bullets ${className ?? ''}`}>
      {items.map((b, i) =>
        typeof b === 'string' ? (
          <li key={i}>
            <Rich text={b} />
          </li>
        ) : (
          <li key={i}>
            <Rich text={b.text} />
            {b.sub && b.sub.length > 0 && (
              <ul>
                {b.sub.map((s, j) => (
                  <li key={j}>
                    <Rich text={s} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

const CALLOUT_ICON = { tip: Lightbulb, exam: GraduationCap, key: KeyRound, warning: AlertTriangle } as const;
const CALLOUT_LABEL = { tip: 'Tip', exam: 'Exam tip', key: 'Key idea', warning: 'Watch out' } as const;

export function SlideView({ slide, meta }: { slide: Slide; meta?: { module?: string; minutes?: number; index: number; total: number } }) {
  switch (slide.kind) {
    case 'title':
      return (
        <div className="sl sl-title">
          {meta?.module && <div className="sl-eyebrow">{meta.module}</div>}
          <h1 className="sl-h1">{slide.title}</h1>
          {slide.subtitle && <Rich as="p" className="sl-subtitle" text={slide.subtitle} />}
          <div className="sl-title-rule" />
        </div>
      );
    case 'bullets':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          {slide.diagram ? (
            <div className="sl-split">
              <Bullets items={slide.bullets} />
              <div className="sl-split-visual">
                <Diagram d={slide.diagram} compact />
              </div>
            </div>
          ) : (
            <Bullets items={slide.bullets} className="large" />
          )}
        </div>
      );
    case 'diagram':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <div className="sl-visual">
            <Diagram d={slide.diagram} />
          </div>
          {slide.caption && <Rich as="p" className="sl-caption" text={slide.caption} />}
          {slide.bullets && slide.bullets.length > 0 && <Bullets items={slide.bullets} className="inline" />}
        </div>
      );
    case 'table':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  {slide.columns.map((c, i) => (
                    <th key={i}>
                      <Rich text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.rows.map((r, i) => (
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
          {slide.caption && <Rich as="p" className="sl-caption" text={slide.caption} />}
        </div>
      );
    case 'cli':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <div className={slide.bullets?.length ? 'sl-split cli-split' : ''}>
            <CliBlock code={slide.code} highlight={slide.highlight} />
            {slide.bullets && slide.bullets.length > 0 && <Bullets items={slide.bullets} />}
          </div>
          {slide.caption && <Rich as="p" className="sl-caption" text={slide.caption} />}
        </div>
      );
    case 'compare':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <div className="sl-compare">
            {[slide.left, slide.right].map((side, i) => (
              <div key={i} className={`sl-compare-col tone-${side.tone ?? 'default'}`}>
                <div className="sl-compare-head">{side.heading}</div>
                <Bullets items={side.bullets} />
              </div>
            ))}
          </div>
        </div>
      );
    case 'callout': {
      const Icon = CALLOUT_ICON[slide.tone] ?? Lightbulb;
      return (
        <div className={`sl sl-callout tone-${slide.tone}`}>
          <div className="sl-callout-badge">
            <Icon size={16} strokeWidth={2} />
            {CALLOUT_LABEL[slide.tone]}
          </div>
          <h2 className="sl-h2">{slide.title}</h2>
          <Rich as="p" className="sl-callout-body" text={slide.body} />
          {slide.bullets && slide.bullets.length > 0 && <Bullets items={slide.bullets} />}
        </div>
      );
    }
    case 'definitions':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <dl className="sl-defs">
            {slide.terms.map((t, i) => (
              <div key={i} className="sl-def">
                <dt>
                  <Rich text={t.term} />
                </dt>
                <dd>
                  <Rich text={t.def} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case 'steps':
      return (
        <div className="sl">
          <h2 className="sl-h2">{slide.title}</h2>
          <div className={slide.diagram ? 'sl-split' : ''}>
            <ol className="sl-steps">
              {slide.steps.map((s, i) => (
                <li key={i}>
                  <span className="sl-step-n">{i + 1}</span>
                  <div>
                    <div className="sl-step-title">
                      <Rich text={s.title} />
                    </div>
                    {s.text && <Rich as="div" className="sl-step-text" text={s.text} />}
                  </div>
                </li>
              ))}
            </ol>
            {slide.diagram && (
              <div className="sl-split-visual">
                <Diagram d={slide.diagram} compact />
              </div>
            )}
          </div>
        </div>
      );
    default:
      return <div className="sl muted">Unsupported slide</div>;
  }
}
