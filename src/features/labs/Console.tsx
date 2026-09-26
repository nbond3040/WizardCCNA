import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Terminal } from '../../sim';

/** Scrollback is kept per terminal across tab switches. */
const scrollbacks = new WeakMap<Terminal, { text: string; started: boolean }>();

const MAX_SCROLLBACK = 200_000;

export function Console({ term, onActivity, autoFocus = true }: { term: Terminal; onActivity?: () => void; autoFocus?: boolean }) {
  const state = scrollbacks.get(term) ?? { text: term.greeting(), started: false };
  scrollbacks.set(term, state);
  const [text, setText] = useState(state.text);
  const [line, setLine] = useState('');
  const [prompt, setPrompt] = useState(term.prompt());
  const [secret, setSecret] = useState(term.isSecretInput());
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Reset local view when the terminal (device) changes.
  useEffect(() => {
    const st = scrollbacks.get(term)!;
    setText(st.text);
    setPrompt(term.prompt());
    setSecret(term.isSecretInput());
    setLine('');
    setHistIdx(null);
    if (autoFocus) inputRef.current?.focus();
  }, [term, autoFocus]);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [text, line]);

  const append = (s: string) => {
    const st = scrollbacks.get(term)!;
    let next = st.text + s;
    if (next.length > MAX_SCROLLBACK) next = next.slice(next.length - MAX_SCROLLBACK);
    st.text = next;
    setText(next);
  };

  const sync = () => {
    setPrompt(term.prompt());
    setSecret(term.isSecretInput());
  };

  const run = (input: string) => {
    const shown = term.isSecretInput() ? '' : input;
    const echo = `${term.prompt()}${shown}\n`;
    const res = term.execute(input);
    const st = scrollbacks.get(term)!;
    if (res.clear) {
      st.text = '';
      setText('');
      append(res.output ? res.output + (res.output.endsWith('\n') ? '' : '\n') : '');
    } else {
      append(echo + (res.output ? res.output + (res.output.endsWith('\n') ? '' : '\n') : ''));
    }
    setLine('');
    setHistIdx(null);
    sync();
    onActivity?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(line);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (secret) return;
      const r = term.complete(line);
      if (r.line !== line) setLine(r.line);
      else if (r.options.length > 1) {
        append(`${term.prompt()}${line}\n${r.options.join('  ')}\n`);
      }
    } else if (e.key === '?' && !secret) {
      e.preventDefault();
      const out = term.help(line);
      append(`${term.prompt()}${line}?\n${out}${out.endsWith('\n') ? '' : '\n'}`);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = term.history();
      if (!h.length) return;
      const idx = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setLine(h[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const h = term.history();
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= h.length) {
        setHistIdx(null);
        setLine('');
      } else {
        setHistIdx(idx);
        setLine(h[idx]);
      }
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'z')) {
      e.preventDefault();
      const res = term.interrupt(e.key === 'c' ? 'ctrl-c' : 'ctrl-z');
      append(`${term.prompt()}${secret ? '' : line}${e.key === 'z' ? '^Z' : '^C'}\n${res.output ? res.output + (res.output.endsWith('\n') ? '' : '\n') : ''}`);
      setLine('');
      sync();
      onActivity?.();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      scrollbacks.get(term)!.text = '';
      setText('');
    }
  };

  return (
    <div className="console" onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}>
      <div className="console-body" ref={bodyRef}>
        <pre className="console-text">{text}</pre>
        <div className="console-line">
          <span className="console-prompt">{prompt}</span>
          <input
              ref={inputRef}
              className="console-input"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label={`${term.deviceId} console`}
              type={secret ? 'password' : 'text'}
            />
        </div>
      </div>
    </div>
  );
}
