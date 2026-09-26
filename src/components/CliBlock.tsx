import { Fragment, type ReactNode } from 'react';

const PROMPT_RES: RegExp[] = [
  /^([A-Za-z0-9_.\-]+(?:\([A-Za-z0-9_.\-]+\))?[>#])(.*)$/, // IOS: R1#, SW1(config-if)#
  /^([A-Za-z]:\\[^>]*>)(.*)$/, // Windows: C:\>
  /^([\w.\-]+@[\w.\-]+:[^$#]*[$#])(\s.*|)$/, // user@host:~$
  /^([$#])(\s.*)$/, // "$ cmd" or "# cmd"
];

export function splitPrompt(line: string): [string, string] | null {
  for (const re of PROMPT_RES) {
    const m = re.exec(line);
    if (m) {
      // Avoid treating output such as "Load for five secs: 1%/0%; one minute: 1%" as a prompt.
      if (re === PROMPT_RES[0] && /\s/.test(m[1])) continue;
      return [m[1], m[2]];
    }
  }
  return null;
}

function highlightText(text: string, highlights: string[] | undefined, keyBase: string): ReactNode {
  if (!highlights?.length) return text;
  const hs = highlights.filter((h) => h.length > 0).sort((a, b) => b.length - a.length);
  const parts: ReactNode[] = [];
  let i = 0;
  let buf = '';
  let k = 0;
  while (i < text.length) {
    const h = hs.find((x) => text.startsWith(x, i));
    if (h) {
      if (buf) parts.push(buf);
      buf = '';
      parts.push(
        <mark key={`${keyBase}-${k++}`} className="cli-mark">
          {h}
        </mark>,
      );
      i += h.length;
    } else {
      buf += text[i++];
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

export function CliBlock({ code, highlight, title, className }: { code: string; highlight?: string[]; title?: string; className?: string }) {
  const lines = code.replace(/\s+$/, '').split('\n');
  return (
    <div className={`cli ${className ?? ''}`}>
      {title && <div className="cli-title">{title}</div>}
      <pre className="cli-body">
        {lines.map((line, i) => {
          const p = splitPrompt(line);
          return (
            <Fragment key={i}>
              {p ? (
                <span className="cli-line">
                  <span className="cli-prompt">{p[0]}</span>
                  <span className="cli-cmd">{highlightText(p[1], highlight, `c${i}`)}</span>
                </span>
              ) : (
                <span className="cli-line cli-out">{highlightText(line, highlight, `o${i}`)}</span>
              )}
              {'\n'}
            </Fragment>
          );
        })}
      </pre>
    </div>
  );
}
