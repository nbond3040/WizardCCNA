import { useState } from 'react';
import { KeyRound, Plus, Send, Trash2 } from 'lucide-react';
import { b64, BASE, CREDS, handle, type ApiRequest, type ApiResponse, type ApiState } from './apiModel';
import './api.css';

const METHODS: ApiRequest['method'][] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const ENDPOINTS = [
  ['POST', '/dna/system/api/v1/auth/token', 'Get a token (HTTP Basic auth)'],
  ['GET', '/dna/intent/api/v1/network-device', 'Device inventory (query params filter any field)'],
  ['GET', '/dna/intent/api/v1/network-device/count', 'Number of devices'],
  ['GET', '/dna/intent/api/v1/network-device/{id}', 'One device by id'],
  ['GET', '/dna/intent/api/v1/site', 'Site hierarchy'],
  ['POST', '/dna/intent/api/v1/site', 'Create an area (JSON body)'],
  ['DELETE', '/dna/intent/api/v1/site/{id}', 'Delete a site'],
];

function JsonView({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  // light syntax coloring for keys, strings, numbers and literals
  const parts = text.split(/("(?:\\.|[^"\\])*"\s*:?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g);
  return (
    <pre className="api-json">
      {parts.map((p, i) => {
        if (!p) return null;
        if (/^"/.test(p)) return <span key={i} className={p.trimEnd().endsWith(':') ? 'j-key' : 'j-str'}>{p}</span>;
        if (/^(true|false|null)$/.test(p)) return <span key={i} className="j-lit">{p}</span>;
        if (/^-?\d/.test(p)) return <span key={i} className="j-num">{p}</span>;
        return <span key={i}>{p}</span>;
      })}
    </pre>
  );
}

export function ApiSandbox({ state, onState }: { state: ApiState; onState: (s: ApiState) => void }) {
  const [req, setReq] = useState<ApiRequest>({ method: 'POST', url: '/dna/system/api/v1/auth/token', headers: [{ key: 'Content-Type', value: 'application/json' }], body: '' });
  const [tab, setTab] = useState<'headers' | 'auth' | 'body'>('headers');
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [user, setUser] = useState(CREDS.user);
  const [pass, setPass] = useState('');
  const [resTab, setResTab] = useState<'body' | 'headers'>('body');

  const send = () => {
    const out = handle(state, { ...req, headers: req.headers.filter((h) => h.key.trim()) });
    setRes(out.res);
    onState(out.state);
  };
  const setHeader = (i: number, patch: Partial<{ key: string; value: string }>) => setReq({ ...req, headers: req.headers.map((h, j) => (j === i ? { ...h, ...patch } : h)) });
  const upsertHeader = (key: string, value: string) => {
    const i = req.headers.findIndex((h) => h.key.toLowerCase() === key.toLowerCase());
    setReq({ ...req, headers: i >= 0 ? req.headers.map((h, j) => (j === i ? { key, value } : h)) : [...req.headers, { key, value }] });
  };
  const lastToken = [...state.log].reverse().find((e) => e.res.status === 200 && (e.res.body as { Token?: string })?.Token)?.res.body as { Token?: string } | undefined;

  return (
    <div className="api">
      <div className="api-bar">
        <select className="select api-method" value={req.method} onChange={(e) => setReq({ ...req, method: e.target.value as ApiRequest['method'] })}>
          {METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <span className="api-base mono">{BASE}</span>
        <input className="input mono api-url" value={req.url} onChange={(e) => setReq({ ...req, url: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && send()} spellCheck={false} />
        <button className="btn accent" onClick={send}><Send size={14} /> Send</button>
      </div>

      <div className="api-grid">
        <div className="api-pane">
          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={tab === 'headers' ? 'on' : ''} onClick={() => setTab('headers')}>Headers ({req.headers.filter((h) => h.key).length})</button>
            <button className={tab === 'auth' ? 'on' : ''} onClick={() => setTab('auth')}>Auth</button>
            <button className={tab === 'body' ? 'on' : ''} onClick={() => setTab('body')}>Body</button>
          </div>
          {tab === 'headers' && (
            <div className="stack s">
              {req.headers.map((h, i) => (
                <div key={i} className="row" style={{ gap: 6 }}>
                  <input className="input mono api-h" placeholder="Header" value={h.key} onChange={(e) => setHeader(i, { key: e.target.value })} />
                  <input className="input mono api-h" style={{ flex: 2 }} placeholder="Value" value={h.value} onChange={(e) => setHeader(i, { value: e.target.value })} />
                  <button className="btn ghost icon sm" onClick={() => setReq({ ...req, headers: req.headers.filter((_, j) => j !== i) })} aria-label="Remove header"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="row">
                <button className="btn sm" onClick={() => setReq({ ...req, headers: [...req.headers, { key: '', value: '' }] })}><Plus size={13} /> Header</button>
                {lastToken?.Token && (
                  <button className="btn sm" onClick={() => upsertHeader('X-Auth-Token', lastToken.Token!)}><KeyRound size={13} /> Insert latest X-Auth-Token</button>
                )}
              </div>
            </div>
          )}
          {tab === 'auth' && (
            <div className="stack s">
              <div className="small muted">HTTP Basic authentication sends <code>Authorization: Basic base64(username:password)</code>. Use it only to obtain a token.</div>
              <div className="row" style={{ gap: 6 }}>
                <input className="input api-h" placeholder="username" value={user} onChange={(e) => setUser(e.target.value)} />
                <input className="input api-h" type="password" placeholder="password" value={pass} onChange={(e) => setPass(e.target.value)} />
              </div>
              <div>
                <button className="btn sm" onClick={() => { upsertHeader('Authorization', `Basic ${b64(`${user}:${pass}`)}`); setTab('headers'); }}>Add Authorization header</button>
              </div>
            </div>
          )}
          {tab === 'body' && (
            <textarea className="textarea mono api-body" value={req.body} onChange={(e) => setReq({ ...req, body: e.target.value })} placeholder={'{\n  "key": "value"\n}'} spellCheck={false} rows={10} />
          )}

          <div className="section-title" style={{ marginTop: 20 }}>API reference</div>
          <div className="api-ref">
            {ENDPOINTS.map(([m, p, d]) => (
              <button key={m + p} className="api-ref-row" onClick={() => setReq({ ...req, method: m as ApiRequest['method'], url: p })}>
                <span className={`api-m m-${m}`}>{m}</span>
                <span className="mono small">{p}</span>
                <span className="tiny muted">{d}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="api-pane">
          {res ? (
            <>
              <div className="row between">
                <div className="row">
                  <span className={`api-status s${Math.floor(res.status / 100)}`}>{res.status} {res.statusText}</span>
                  <span className="tiny muted">{res.ms} ms</span>
                </div>
                <div className="segmented">
                  <button className={resTab === 'body' ? 'on' : ''} onClick={() => setResTab('body')}>Body</button>
                  <button className={resTab === 'headers' ? 'on' : ''} onClick={() => setResTab('headers')}>Headers</button>
                </div>
              </div>
              {resTab === 'body' ? <JsonView value={res.body} /> : <JsonView value={res.headers} />}
            </>
          ) : (
            <div className="empty" style={{ padding: 32 }}>Send a request to see the response.</div>
          )}
          {state.log.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 16 }}>History</div>
              <div className="api-hist">
                {[...state.log].reverse().slice(0, 12).map((e, i) => (
                  <button key={i} className="api-ref-row" onClick={() => { setReq(e.req); setRes(e.res); }}>
                    <span className={`api-m m-${e.req.method}`}>{e.req.method}</span>
                    <span className="mono small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.req.url.replace(BASE, '')}</span>
                    <span className={`api-code s${Math.floor(e.res.status / 100)}`}>{e.res.status}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
