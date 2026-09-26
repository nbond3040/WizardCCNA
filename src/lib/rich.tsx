import { Fragment, type ReactNode } from 'react';

/**
 * Renders the course's tiny inline markup: **bold**, `code`, *italic*, ==highlight== and \n line breaks.
 * Parsing is deliberately forgiving: unbalanced markers are rendered literally.
 */
const TOKEN = /(\*\*[^*]+?\*\*|`[^`]+?`|==[^=]+?==|\*[^*\s][^*]*?\*)/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) out.push(<strong key={k}>{renderInline(tok.slice(2, -2), k)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('==')) out.push(<mark key={k}>{renderInline(tok.slice(2, -2), k)}</mark>);
    else out.push(<em key={k}>{renderInline(tok.slice(1, -1), k)}</em>);
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text, as: Tag = 'span', className }: { text: string | undefined; as?: 'span' | 'p' | 'div'; className?: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <Tag className={className ? `rt ${className}` : 'rt'}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line, String(i))}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Split long narration into paragraphs on blank lines, rendering each as Rich text. */
export function RichParas({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n/);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <Rich key={i} as="p" text={p} />
      ))}
    </div>
  );
}

/** Plain text (markup stripped) — for titles, aria labels and search. */
export function plain(text: string): string {
  return text.replace(/\*\*|==|`/g, '').replace(/(^|\s)\*(\S[^*]*?)\*/g, '$1$2');
}
