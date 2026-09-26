import { useEffect, useState } from 'react';
import type { HostConfig } from '../../content/labTypes';
import type { NetworkSim } from '../../sim';

/** Packet-Tracer-style "IP Configuration" desktop app for PCs, laptops and servers. */
export function HostPanel({ sim, deviceId, onChange }: { sim: NetworkSim; deviceId: string; onChange: () => void }) {
  const cur = sim.hostConfig(deviceId);
  const [cfg, setCfg] = useState<HostConfig>(cur);
  useEffect(() => setCfg(sim.hostConfig(deviceId)), [sim, deviceId]);
  const assigned = sim.hostConfig(deviceId).assigned;
  const dirty = JSON.stringify(stripAssigned(cfg)) !== JSON.stringify(stripAssigned(sim.hostConfig(deviceId)));

  const apply = () => {
    sim.setHostConfig(deviceId, stripAssigned(cfg));
    setCfg(sim.hostConfig(deviceId));
    onChange();
  };
  const field = (k: keyof HostConfig, label: string, placeholder: string) => (
    <label className="field">
      <span className="label">{label}</span>
      <input
        className="input mono"
        value={(cfg[k] as string | undefined) ?? ''}
        placeholder={placeholder}
        disabled={k !== 'ipv6' && k !== 'ipv6Gateway' && cfg.dhcp}
        onChange={(e) => setCfg({ ...cfg, [k]: e.target.value.trim() || undefined })}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
      />
    </label>
  );

  return (
    <div className="host-panel">
      <div className="row between">
        <div className="card-title">IP Configuration</div>
        <div className="segmented">
          <button className={cfg.dhcp ? 'on' : ''} onClick={() => setCfg({ ...cfg, dhcp: true })}>DHCP</button>
          <button className={!cfg.dhcp ? 'on' : ''} onClick={() => setCfg({ ...cfg, dhcp: false })}>Static</button>
        </div>
      </div>
      <div className="grid c2 mt" style={{ gap: 12 }}>
        {field('ip', 'IPv4 address', '192.168.1.10')}
        {field('mask', 'Subnet mask', '255.255.255.0')}
        {field('gateway', 'Default gateway', '192.168.1.1')}
        {field('dns', 'DNS server', '192.168.1.53')}
        {field('ipv6', 'IPv6 address / prefix', '2001:db8:1::10/64')}
        {field('ipv6Gateway', 'IPv6 gateway', 'fe80::1')}
      </div>
      {cfg.dhcp && (
        <div className="callout mt small">
          {assigned?.ip ? (
            <span>
              DHCP lease: <code>{assigned.ip}</code> / <code>{assigned.mask}</code>
              {assigned.gateway && <> · gateway <code>{assigned.gateway}</code></>}
              {assigned.dns && <> · DNS <code>{assigned.dns}</code></>}
            </span>
          ) : (
            <span>No DHCP lease yet{cur.ip?.startsWith('169.254.') ? ` — using APIPA ${cur.ip}` : ''}. Apply to request an address.</span>
          )}
        </div>
      )}
      <div className="row mt">
        <button className="btn primary sm" onClick={apply}>
          {cfg.dhcp ? 'Request DHCP address' : 'Apply'}
        </button>
        {dirty && <span className="tiny muted">Unsaved changes</span>}
      </div>
    </div>
  );
}

function stripAssigned(c: HostConfig & { assigned?: unknown }): HostConfig {
  const { assigned: _a, ...rest } = c;
  void _a;
  return rest;
}
