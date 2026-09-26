import { useState } from 'react';
import { initialWlc, newWlan, type L2Security, type QosProfile, type RadiusServer, type Wlan, type WlcInterface, type WlcState } from './wlcModel';
import './wlc.css';

type View =
  | { page: 'monitor' }
  | { page: 'wlans' }
  | { page: 'wlan-new' }
  | { page: 'wlan-edit'; id: number; tab: 'general' | 'security' | 'qos' | 'advanced'; sub: 'l2' | 'l3' | 'aaa' }
  | { page: 'interfaces' }
  | { page: 'iface-new' }
  | { page: 'iface-edit'; name: string }
  | { page: 'radius' }
  | { page: 'radius-new' }
  | { page: 'wireless' }
  | { page: 'management' };

const TOP = [
  ['monitor', 'MONITOR'],
  ['wlans', 'WLANs'],
  ['interfaces', 'CONTROLLER'],
  ['wireless', 'WIRELESS'],
  ['radius', 'SECURITY'],
  ['management', 'MANAGEMENT'],
] as const;

const QOS_LABEL: Record<QosProfile, string> = { platinum: 'Platinum (voice)', gold: 'Gold (video)', silver: 'Silver (best effort)', bronze: 'Bronze (background)' };

export function WlcGui({ state, onApply }: { state: WlcState; onApply: (s: WlcState) => void }) {
  const [view, setView] = useState<View>({ page: 'wlans' });
  const [flash, setFlash] = useState<string | null>(null);
  const apply = (s: WlcState, msg = 'Configuration applied.') => {
    onApply(s);
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 1800);
  };
  const topKey = view.page.startsWith('wlan') ? 'wlans' : view.page.startsWith('iface') || view.page === 'interfaces' ? 'interfaces' : view.page.startsWith('radius') ? 'radius' : view.page;

  return (
    <div className="wlc">
      <div className="wlc-url">https://10.10.10.5/screens/frameset.html</div>
      <div className="wlc-top">
        <div className="wlc-logo">cisco</div>
        {TOP.map(([k, label]) => (
          <button key={k} className={topKey === k ? 'on' : ''} onClick={() => setView({ page: k } as View)}>
            {label}
          </button>
        ))}
        <div className="spacer" />
        <button onClick={() => apply(state, 'Configuration saved to NVRAM.')}>Save Config</button>
      </div>
      <div className="wlc-body">
        <div className="wlc-side">
          {topKey === 'wlans' && <SideItem label="WLANs" on onClick={() => setView({ page: 'wlans' })} />}
          {topKey === 'interfaces' && (
            <>
              <SideItem label="General" />
              <SideItem label="Interfaces" on onClick={() => setView({ page: 'interfaces' })} />
              <SideItem label="Ports" />
              <SideItem label="NTP" />
            </>
          )}
          {topKey === 'radius' && (
            <>
              <div className="wlc-side-h">AAA</div>
              <SideItem label="RADIUS › Authentication" on onClick={() => setView({ page: 'radius' })} />
              <SideItem label="TACACS+" />
              <SideItem label="Local Net Users" />
            </>
          )}
          {topKey === 'wireless' && <SideItem label="Access Points › All APs" on />}
          {topKey === 'monitor' && <SideItem label="Summary" on />}
          {topKey === 'management' && <SideItem label="Summary" on />}
        </div>
        <div className="wlc-main">
          {flash && <div className="wlc-flash">{flash}</div>}
          {view.page === 'monitor' && <Monitor state={state} />}
          {view.page === 'wlans' && <WlanList state={state} onNew={() => setView({ page: 'wlan-new' })} onEdit={(id) => setView({ page: 'wlan-edit', id, tab: 'general', sub: 'l2' })} onDelete={(id) => apply({ ...state, wlans: state.wlans.filter((w) => w.id !== id) }, 'WLAN removed.')} />}
          {view.page === 'wlan-new' && (
            <WlanNew
              state={state}
              onCancel={() => setView({ page: 'wlans' })}
              onApply={(w) => {
                apply({ ...state, wlans: [...state.wlans, w].sort((a, b) => a.id - b.id) }, `WLAN ${w.id} created.`);
                setView({ page: 'wlan-edit', id: w.id, tab: 'general', sub: 'l2' });
              }}
            />
          )}
          {view.page === 'wlan-edit' && state.wlans.find((w) => w.id === view.id) && (
            <WlanEdit
              key={view.id}
              wlan={state.wlans.find((w) => w.id === view.id)!}
              state={state}
              tab={view.tab}
              sub={view.sub}
              setTab={(tab, sub) => setView({ ...view, tab, sub: sub ?? view.sub })}
              onBack={() => setView({ page: 'wlans' })}
              onApply={(w) => apply({ ...state, wlans: state.wlans.map((x) => (x.id === w.id ? w : x)) })}
            />
          )}
          {view.page === 'interfaces' && <IfaceList state={state} onNew={() => setView({ page: 'iface-new' })} onEdit={(name) => setView({ page: 'iface-edit', name })} />}
          {view.page === 'iface-new' && (
            <IfaceNew
              state={state}
              onCancel={() => setView({ page: 'interfaces' })}
              onApply={(name, vlan) => {
                apply({ ...state, interfaces: [...state.interfaces, { name, vlan, ip: '', mask: '', gateway: '', port: 1, dhcp: '', kind: 'dynamic' }] }, `Interface ${name} created.`);
                setView({ page: 'iface-edit', name });
              }}
            />
          )}
          {view.page === 'iface-edit' && state.interfaces.find((i) => i.name === view.name) && (
            <IfaceEdit
              key={view.name}
              iface={state.interfaces.find((i) => i.name === view.name)!}
              onBack={() => setView({ page: 'interfaces' })}
              onApply={(i) => apply({ ...state, interfaces: state.interfaces.map((x) => (x.name === i.name ? i : x)) })}
            />
          )}
          {view.page === 'radius' && <RadiusList state={state} onNew={() => setView({ page: 'radius-new' })} />}
          {view.page === 'radius-new' && (
            <RadiusNew
              state={state}
              onCancel={() => setView({ page: 'radius' })}
              onApply={(r) => {
                apply({ ...state, radius: [...state.radius, r] }, 'RADIUS server added.');
                setView({ page: 'radius' });
              }}
            />
          )}
          {view.page === 'wireless' && <Aps />}
          {view.page === 'management' && <div className="wlc-panel"><h3>Management</h3><p className="small muted mt-s">HTTP/HTTPS access, SNMP and syslog settings are not part of this lab.</p></div>}
        </div>
      </div>
    </div>
  );
}

function SideItem({ label, on, onClick }: { label: string; on?: boolean; onClick?: () => void }) {
  return (
    <button className={`wlc-side-item ${on ? 'on' : ''}`} onClick={onClick} disabled={!onClick}>
      {label}
    </button>
  );
}

function Monitor({ state }: { state: WlcState }) {
  return (
    <div className="wlc-panel">
      <h3>Summary</h3>
      <table className="wlc-table mt">
        <tbody>
          <tr><td>Controller model</td><td>Cisco 3504 Wireless Controller</td></tr>
          <tr><td>Software version</td><td>8.10.185.0</td></tr>
          <tr><td>Management IP</td><td>{state.interfaces.find((i) => i.kind === 'management')?.ip}</td></tr>
          <tr><td>Access points joined</td><td>4</td></tr>
          <tr><td>WLANs</td><td>{state.wlans.length} ({state.wlans.filter((w) => w.enabled).length} enabled)</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function secSummary(w: Wlan) {
  if (w.l2 === 'none') return 'None';
  if (w.l2 === 'static-wep') return 'Static WEP';
  if (w.l2 === '802.1x') return '802.1X';
  const parts = [w.wpa2 ? 'WPA2' : '', w.wpa ? 'WPA' : ''].filter(Boolean).join('+');
  const akm = [w.akm8021x ? '802.1X' : '', w.akmPsk ? 'PSK' : ''].filter(Boolean).join(' + ');
  return `[${parts}][Auth(${akm || 'none'})]`;
}

function WlanList({ state, onNew, onEdit, onDelete }: { state: WlcState; onNew: () => void; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>WLANs</h3>
        <div className="row">
          <select className="select wlc-in" defaultValue="new"><option value="new">Create New</option></select>
          <button className="btn sm" onClick={onNew}>Go</button>
        </div>
      </div>
      <table className="wlc-table mt">
        <thead>
          <tr><th>WLAN ID</th><th>Type</th><th>Profile Name</th><th>WLAN SSID</th><th>Admin Status</th><th>Security Policies</th><th></th></tr>
        </thead>
        <tbody>
          {state.wlans.map((w) => (
            <tr key={w.id}>
              <td><button className="wlc-link" onClick={() => onEdit(w.id)}>{w.id}</button></td>
              <td>WLAN</td>
              <td><button className="wlc-link" onClick={() => onEdit(w.id)}>{w.profile}</button></td>
              <td>{w.ssid}</td>
              <td>{w.enabled ? 'Enabled' : 'Disabled'}</td>
              <td>{secSummary(w)}</td>
              <td><button className="wlc-link danger" onClick={() => confirm(`Remove WLAN ${w.id}?`) && onDelete(w.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WlanNew({ state, onCancel, onApply }: { state: WlcState; onCancel: () => void; onApply: (w: Wlan) => void }) {
  const free = Array.from({ length: 16 }, (_, i) => i + 1).filter((i) => !state.wlans.some((w) => w.id === i));
  const [profile, setProfile] = useState('');
  const [ssid, setSsid] = useState('');
  const [id, setId] = useState(free[0] ?? 1);
  const [err, setErr] = useState('');
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>WLANs › New</h3>
        <div className="row">
          <button className="btn sm" onClick={onCancel}>&lt; Back</button>
          <button
            className="btn sm primary"
            onClick={() => {
              if (!profile.trim() || !ssid.trim()) return setErr('Profile Name and SSID are required.');
              if (state.wlans.some((w) => w.profile.toLowerCase() === profile.trim().toLowerCase())) return setErr('A WLAN with this profile name already exists.');
              onApply(newWlan(id, profile.trim(), ssid.trim()));
            }}
          >
            Apply
          </button>
        </div>
      </div>
      {err && <div className="wlc-err">{err}</div>}
      <div className="wlc-form mt">
        <label>Type</label><select className="select wlc-in"><option>WLAN</option></select>
        <label>Profile Name</label><input className="input wlc-in" value={profile} onChange={(e) => setProfile(e.target.value)} />
        <label>SSID</label><input className="input wlc-in" value={ssid} onChange={(e) => setSsid(e.target.value)} />
        <label>ID</label>
        <select className="select wlc-in" value={id} onChange={(e) => setId(Number(e.target.value))}>
          {free.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
    </div>
  );
}

function WlanEdit({ wlan, state, tab, sub, setTab, onBack, onApply }: {
  wlan: Wlan;
  state: WlcState;
  tab: 'general' | 'security' | 'qos' | 'advanced';
  sub: 'l2' | 'l3' | 'aaa';
  setTab: (t: 'general' | 'security' | 'qos' | 'advanced', s?: 'l2' | 'l3' | 'aaa') => void;
  onBack: () => void;
  onApply: (w: Wlan) => void;
}) {
  const [w, setW] = useState<Wlan>(wlan);
  const [err, setErr] = useState('');
  const set = (patch: Partial<Wlan>) => setW({ ...w, ...patch });
  const doApply = () => {
    if (w.l2 === 'wpa+wpa2' && w.akmPsk && (w.pskFormat === 'ascii' ? w.psk.length < 8 || w.psk.length > 63 : !/^[0-9a-fA-F]{64}$/.test(w.psk))) {
      return setErr(w.pskFormat === 'ascii' ? 'PSK must be 8–63 ASCII characters.' : 'HEX PSK must be 64 hex digits.');
    }
    if (w.l2 === 'wpa+wpa2' && !w.wpa && !w.wpa2) return setErr('Select at least one of WPA Policy or WPA2 Policy.');
    if (w.l2 === 'wpa+wpa2' && (w.wpa2 && !w.aes && !w.tkip)) return setErr('Select an encryption cipher.');
    setErr('');
    onApply(w);
  };
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>WLANs › Edit ‘{wlan.profile}’</h3>
        <div className="row">
          <button className="btn sm" onClick={onBack}>&lt; Back</button>
          <button className="btn sm primary" onClick={doApply}>Apply</button>
        </div>
      </div>
      {err && <div className="wlc-err">{err}</div>}
      <div className="wlc-tabs mt">
        {(['general', 'security', 'qos', 'advanced'] as const).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'qos' ? 'QoS' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'general' && (
        <div className="wlc-form">
          <label>Profile Name</label><div>{w.profile}</div>
          <label>Type</label><div>WLAN</div>
          <label>SSID</label><input className="input wlc-in" value={w.ssid} onChange={(e) => set({ ssid: e.target.value })} />
          <label>Status</label><label className="check"><input type="checkbox" checked={w.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> Enabled</label>
          <label>Security Policies</label><div className="mono small">{secSummary(w)}<div className="tiny muted">(Modifications done under security tab will appear after applying the changes.)</div></div>
          <label>Radio Policy</label>
          <select className="select wlc-in" value={w.radioPolicy} onChange={(e) => set({ radioPolicy: e.target.value as Wlan['radioPolicy'] })}>
            {['All', '802.11a only', '802.11g only', '802.11b/g only', '802.11a/g only'].map((r) => <option key={r}>{r}</option>)}
          </select>
          <label>Interface/Interface Group(G)</label>
          <select className="select wlc-in" value={w.iface} onChange={(e) => set({ iface: e.target.value })}>
            {state.interfaces.filter((i) => i.kind !== 'virtual').map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
          </select>
          <label>Broadcast SSID</label><label className="check"><input type="checkbox" checked={w.broadcastSsid} onChange={(e) => set({ broadcastSsid: e.target.checked })} /> Enabled</label>
        </div>
      )}
      {tab === 'security' && (
        <>
          <div className="wlc-subtabs">
            {(['l2', 'l3', 'aaa'] as const).map((s) => (
              <button key={s} className={sub === s ? 'on' : ''} onClick={() => setTab('security', s)}>
                {s === 'l2' ? 'Layer 2' : s === 'l3' ? 'Layer 3' : 'AAA Servers'}
              </button>
            ))}
          </div>
          {sub === 'l2' && (
            <div className="wlc-form">
              <label>Layer 2 Security</label>
              <select className="select wlc-in" value={w.l2} onChange={(e) => set({ l2: e.target.value as L2Security })}>
                <option value="none">None</option>
                <option value="wpa+wpa2">WPA+WPA2</option>
                <option value="802.1x">802.1X</option>
                <option value="static-wep">Static WEP</option>
              </select>
              {w.l2 === 'wpa+wpa2' && (
                <>
                  <div className="wlc-form-h">WPA+WPA2 Parameters</div>
                  <label>WPA Policy</label><label className="check"><input type="checkbox" checked={w.wpa} onChange={(e) => set({ wpa: e.target.checked })} /></label>
                  <label>WPA2 Policy</label><label className="check"><input type="checkbox" checked={w.wpa2} onChange={(e) => set({ wpa2: e.target.checked })} /></label>
                  <label>WPA2 Encryption</label>
                  <div className="row">
                    <label className="check"><input type="checkbox" checked={w.aes} onChange={(e) => set({ aes: e.target.checked })} /> AES</label>
                    <label className="check"><input type="checkbox" checked={w.tkip} onChange={(e) => set({ tkip: e.target.checked })} /> TKIP</label>
                  </div>
                  <div className="wlc-form-h">Authentication Key Management</div>
                  <label>802.1X</label><label className="check"><input type="checkbox" checked={w.akm8021x} onChange={(e) => set({ akm8021x: e.target.checked })} /> Enable</label>
                  <label>PSK</label><label className="check"><input type="checkbox" checked={w.akmPsk} onChange={(e) => set({ akmPsk: e.target.checked })} /> Enable</label>
                  {w.akmPsk && (
                    <>
                      <label>PSK Format</label>
                      <div className="row">
                        <select className="select wlc-in" value={w.pskFormat} onChange={(e) => set({ pskFormat: e.target.value as 'ascii' | 'hex' })} style={{ width: 110 }}>
                          <option value="ascii">ASCII</option>
                          <option value="hex">HEX</option>
                        </select>
                        <input className="input wlc-in mono" type="password" value={w.psk} onChange={(e) => set({ psk: e.target.value })} placeholder="passphrase" />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {sub === 'l3' && (
            <div className="wlc-form">
              <label>Layer 3 Security</label>
              <select className="select wlc-in"><option>None</option><option>Web Policy</option></select>
              <div className="tiny muted" style={{ gridColumn: '1 / -1' }}>Web authentication (captive portal) is typically used for guest WLANs.</div>
            </div>
          )}
          {sub === 'aaa' && (
            <div className="wlc-form">
              <label>Authentication Servers</label>
              <select className="select wlc-in" value={w.radius ?? ''} onChange={(e) => set({ radius: e.target.value ? Number(e.target.value) : null })}>
                <option value="">None</option>
                {state.radius.map((r) => <option key={r.index} value={r.index}>IP:{r.ip}, Port:{r.port}</option>)}
              </select>
              {state.radius.length === 0 && <div className="tiny muted" style={{ gridColumn: '1 / -1' }}>No RADIUS servers configured (SECURITY › AAA › RADIUS).</div>}
            </div>
          )}
        </>
      )}
      {tab === 'qos' && (
        <div className="wlc-form">
          <label>Quality of Service (QoS)</label>
          <select className="select wlc-in" value={w.qos} onChange={(e) => set({ qos: e.target.value as QosProfile })}>
            {(Object.keys(QOS_LABEL) as QosProfile[]).map((q) => <option key={q} value={q}>{QOS_LABEL[q]}</option>)}
          </select>
          <label>WMM Policy</label>
          <select className="select wlc-in" value={w.wmm} onChange={(e) => set({ wmm: e.target.value as Wlan['wmm'] })}>
            <option value="disabled">Disabled</option>
            <option value="allowed">Allowed</option>
            <option value="required">Required</option>
          </select>
        </div>
      )}
      {tab === 'advanced' && (
        <div className="wlc-form">
          <label>Allow AAA Override</label><label className="check"><input type="checkbox" checked={w.aaaOverride} onChange={(e) => set({ aaaOverride: e.target.checked })} /> Enabled</label>
          <label>Enable Session Timeout</label>
          <div className="row"><input className="input wlc-in" type="number" value={w.sessionTimeout} onChange={(e) => set({ sessionTimeout: Number(e.target.value) })} style={{ width: 110 }} /> <span className="tiny muted">seconds</span></div>
          <label>Client Exclusion</label><label className="check"><input type="checkbox" checked={w.clientExclusion} onChange={(e) => set({ clientExclusion: e.target.checked })} /> Enabled (60 s timeout)</label>
          <label>DHCP Addr. Assignment</label><label className="check"><input type="checkbox" checked={w.dhcpRequired} onChange={(e) => set({ dhcpRequired: e.target.checked })} /> Required</label>
          <label>FlexConnect Local Switching</label><label className="check"><input type="checkbox" checked={w.flexLocalSwitching} onChange={(e) => set({ flexLocalSwitching: e.target.checked })} /> Enabled</label>
          <label>Maximum Allowed Clients</label><input className="input wlc-in" type="number" value={w.maxClients} onChange={(e) => set({ maxClients: Number(e.target.value) })} style={{ width: 110 }} />
        </div>
      )}
    </div>
  );
}

function IfaceList({ state, onNew, onEdit }: { state: WlcState; onNew: () => void; onEdit: (n: string) => void }) {
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>Interfaces</h3>
        <button className="btn sm" onClick={onNew}>New…</button>
      </div>
      <table className="wlc-table mt">
        <thead><tr><th>Interface Name</th><th>VLAN Identifier</th><th>IP Address</th><th>Interface Type</th></tr></thead>
        <tbody>
          {state.interfaces.map((i) => (
            <tr key={i.name}>
              <td>{i.kind === 'virtual' ? i.name : <button className="wlc-link" onClick={() => onEdit(i.name)}>{i.name}</button>}</td>
              <td>{i.kind === 'virtual' ? 'N/A' : i.vlan}</td>
              <td>{i.ip || '—'}</td>
              <td>{i.kind === 'dynamic' ? 'Dynamic' : 'Static'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IfaceNew({ state, onCancel, onApply }: { state: WlcState; onCancel: () => void; onApply: (name: string, vlan: number) => void }) {
  const [name, setName] = useState('');
  const [vlan, setVlan] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>Interfaces › New</h3>
        <div className="row">
          <button className="btn sm" onClick={onCancel}>&lt; Back</button>
          <button
            className="btn sm primary"
            onClick={() => {
              const v = Number(vlan);
              if (!name.trim()) return setErr('Interface name is required.');
              if (!(v >= 1 && v <= 4094)) return setErr('VLAN id must be 1–4094.');
              if (state.interfaces.some((i) => i.name.toLowerCase() === name.trim().toLowerCase())) return setErr('Interface already exists.');
              onApply(name.trim(), v);
            }}
          >
            Apply
          </button>
        </div>
      </div>
      {err && <div className="wlc-err">{err}</div>}
      <div className="wlc-form mt">
        <label>Interface Name</label><input className="input wlc-in" value={name} onChange={(e) => setName(e.target.value)} />
        <label>VLAN Id</label><input className="input wlc-in" value={vlan} onChange={(e) => setVlan(e.target.value)} />
      </div>
    </div>
  );
}

function IfaceEdit({ iface, onBack, onApply }: { iface: WlcInterface; onBack: () => void; onApply: (i: WlcInterface) => void }) {
  const [i, setI] = useState(iface);
  const [err, setErr] = useState('');
  const ipOk = (s: string) => /^(\d{1,3})(\.\d{1,3}){3}$/.test(s) && s.split('.').every((o) => Number(o) <= 255);
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>Interfaces › Edit ‘{iface.name}’</h3>
        <div className="row">
          <button className="btn sm" onClick={onBack}>&lt; Back</button>
          <button
            className="btn sm primary"
            onClick={() => {
              if (![i.ip, i.mask, i.gateway].every(ipOk)) return setErr('Enter a valid IP address, netmask and gateway.');
              if (i.dhcp && !ipOk(i.dhcp)) return setErr('Primary DHCP server is not a valid address.');
              setErr('');
              onApply(i);
            }}
          >
            Apply
          </button>
        </div>
      </div>
      {err && <div className="wlc-err">{err}</div>}
      <div className="wlc-form mt">
        <div className="wlc-form-h">Physical Information</div>
        <label>Port Number</label><input className="input wlc-in" type="number" value={i.port} onChange={(e) => setI({ ...i, port: Number(e.target.value) })} style={{ width: 90 }} />
        <div className="wlc-form-h">Interface Address</div>
        <label>VLAN Identifier</label><input className="input wlc-in" type="number" value={i.vlan} onChange={(e) => setI({ ...i, vlan: Number(e.target.value) })} style={{ width: 90 }} />
        <label>IP Address</label><input className="input wlc-in mono" value={i.ip} onChange={(e) => setI({ ...i, ip: e.target.value.trim() })} />
        <label>Netmask</label><input className="input wlc-in mono" value={i.mask} onChange={(e) => setI({ ...i, mask: e.target.value.trim() })} />
        <label>Gateway</label><input className="input wlc-in mono" value={i.gateway} onChange={(e) => setI({ ...i, gateway: e.target.value.trim() })} />
        <div className="wlc-form-h">DHCP Information</div>
        <label>Primary DHCP Server</label><input className="input wlc-in mono" value={i.dhcp} onChange={(e) => setI({ ...i, dhcp: e.target.value.trim() })} />
      </div>
    </div>
  );
}

function RadiusList({ state, onNew }: { state: WlcState; onNew: () => void }) {
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>RADIUS Authentication Servers</h3>
        <button className="btn sm" onClick={onNew}>New…</button>
      </div>
      <table className="wlc-table mt">
        <thead><tr><th>Server Index</th><th>Server Address</th><th>Port</th><th>Admin Status</th></tr></thead>
        <tbody>
          {state.radius.length === 0 && <tr><td colSpan={4} className="muted">No servers configured.</td></tr>}
          {state.radius.map((r) => (
            <tr key={r.index}><td>{r.index}</td><td>{r.ip}</td><td>{r.port}</td><td>{r.enabled ? 'Enabled' : 'Disabled'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RadiusNew({ state, onCancel, onApply }: { state: WlcState; onCancel: () => void; onApply: (r: RadiusServer) => void }) {
  const [ip, setIp] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmSecret, setConfirm] = useState('');
  const [port, setPort] = useState(1812);
  const [enabled, setEnabled] = useState(true);
  const [err, setErr] = useState('');
  const index = Math.max(0, ...state.radius.map((r) => r.index)) + 1;
  return (
    <div className="wlc-panel">
      <div className="row between">
        <h3>RADIUS Authentication Servers › New</h3>
        <div className="row">
          <button className="btn sm" onClick={onCancel}>&lt; Back</button>
          <button
            className="btn sm primary"
            onClick={() => {
              if (!/^(\d{1,3})(\.\d{1,3}){3}$/.test(ip)) return setErr('Enter a valid server IP address.');
              if (!secret || secret !== confirmSecret) return setErr('Shared secrets are empty or do not match.');
              onApply({ index, ip, secret, port, enabled });
            }}
          >
            Apply
          </button>
        </div>
      </div>
      {err && <div className="wlc-err">{err}</div>}
      <div className="wlc-form mt">
        <label>Server Index (Priority)</label><div>{index}</div>
        <label>Server IP Address</label><input className="input wlc-in mono" value={ip} onChange={(e) => setIp(e.target.value.trim())} />
        <label>Shared Secret Format</label><select className="select wlc-in"><option>ASCII</option></select>
        <label>Shared Secret</label><input className="input wlc-in" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <label>Confirm Shared Secret</label><input className="input wlc-in" type="password" value={confirmSecret} onChange={(e) => setConfirm(e.target.value)} />
        <label>Port Number</label><input className="input wlc-in" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} style={{ width: 100 }} />
        <label>Server Status</label>
        <select className="select wlc-in" value={enabled ? 'on' : 'off'} onChange={(e) => setEnabled(e.target.value === 'on')}>
          <option value="on">Enabled</option>
          <option value="off">Disabled</option>
        </select>
      </div>
    </div>
  );
}

function Aps() {
  const aps = [
    ['AP-FLOOR1-EAST', 'C9120AXI', 'Local', '10.10.40.21'],
    ['AP-FLOOR1-WEST', 'C9120AXI', 'Local', '10.10.40.22'],
    ['AP-FLOOR2-EAST', 'C9130AXI', 'Local', '10.10.40.23'],
    ['AP-BRANCH-01', 'C9115AXI', 'FlexConnect', '172.16.8.10'],
  ];
  return (
    <div className="wlc-panel">
      <h3>All APs</h3>
      <table className="wlc-table mt">
        <thead><tr><th>AP Name</th><th>AP Model</th><th>AP Mode</th><th>IP Address</th><th>Operational Status</th></tr></thead>
        <tbody>
          {aps.map((a) => <tr key={a[0]}><td>{a[0]}</td><td>{a[1]}</td><td>{a[2]}</td><td>{a[3]}</td><td>REG</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export { initialWlc };
