/** Device construction, interface registry and per-interface MAC addresses. */
import type { LabDevice } from '../../content/labTypes';
import { HARDWARE, IF_TYPES, isIosModel } from '../model/hardware';
import { parseIfName, parentOf, typeOfName } from '../model/ifname';
import {
  defaultVlans,
  newDevCfg,
  newDevDyn,
  newIfCfg,
  type Device,
  type HostDevice,
  type IfCfg,
  type IosDevice,
} from '../model/state';
import { hash32, macAdd } from '../util/mac';
import { parseIp } from '../util/ip';
import type { IfPolicy } from '../cli/grammar';

export function buildDevice(ld: LabDevice, taken: Set<string>): Device {
  const hw = HARDWARE[ld.model];
  let base = hw.ouiPrefix + ((hash32(`${ld.id}/${ld.model}`) & 0xffffc0) >>> 0).toString(16).padStart(6, '0');
  while (taken.has(base)) base = macAdd(base, 0x40);
  taken.add(base);
  const common = {
    id: ld.id,
    model: ld.model,
    hw,
    label: ld.label ?? ld.id,
    x: ld.x,
    y: ld.y,
    locked: !!ld.locked,
    mac: base,
  };
  if (isIosModel(ld.model)) {
    const dev: IosDevice = {
      ...common,
      t: 'ios',
      kind: hw.kind as IosDevice['kind'],
      st: {
        cfg: newDevCfg(hw, ld.id),
        dyn: newDevDyn(0),
        startup: null,
        vlans: hw.kind === 'router' ? {} : defaultVlans(),
        vlanDat: hw.kind !== 'router',
      },
    };
    return dev;
  }
  const host: HostDevice = {
    ...common,
    t: 'host',
    kind: ld.model === 'cloud' ? 'cloud' : 'host',
    st: { cfg: { ...(ld.host ?? {}) }, arp: {}, counters: { inPkts: 0, outPkts: 0 } },
    services: ld.services,
    cloudIp: ld.cloudIp ? (parseIp(ld.cloudIp) ?? undefined) : undefined,
  };
  if (ld.model === 'cloud' && host.cloudIp !== undefined && !host.st.cfg.ip) {
    host.st.cfg.ip = ld.cloudIp;
  }
  return host;
}

export function isPhysical(dev: Device, name: string): boolean {
  return dev.hw.ifaces.some((p) => p.name === name);
}

export function physInfo(dev: Device, name: string) {
  return dev.hw.ifaces.find((p) => p.name === name);
}

/** Canonical names of all interfaces that currently exist on an IOS device (in display order). */
export function ifNames(dev: IosDevice): string[] {
  return Object.keys(dev.st.cfg.ifaces).sort((a, b) => ifOrder(dev, a) - ifOrder(dev, b) || a.localeCompare(b, undefined, { numeric: true }));
}

/** Sort key: physical interfaces in template order (subinterfaces after parent), then logical types. */
export function ifOrder(dev: Device, name: string): number {
  const parent = parentOf(name);
  const baseName = parent ?? name;
  const idx = dev.hw.ifaces.findIndex((p) => p.name === baseName);
  if (idx >= 0) return 1000 + idx * 100000 + (parent ? Number(name.slice(parent.length + 1)) % 99999 + 1 : 0) / 100000;
  const t = typeOfName(name);
  const n = Number(name.replace(/^[^\d]*/, '').split(/[/.]/)[0]) || 0;
  switch (t?.name) {
    case 'Vlan':
      return (dev.hw.kind === 'router' ? 9e8 : 10) + n / 10000;
    case 'Loopback':
      return 8e8 + n / 1e10;
    case 'Port-channel':
      return 7e8 + n;
    case 'Tunnel':
      return 8.5e8 + n / 1e10;
    default:
      return 9.5e8;
  }
}

/** Running-config order: Loopback, Tunnel, Port-channel, physical (+subifs), Vlan. */
export function ifConfigOrder(dev: IosDevice): string[] {
  const rank = (name: string): number => {
    const t = typeOfName(name)?.name;
    if (t === 'Loopback') return 0;
    if (t === 'Tunnel') return 1;
    if (t === 'Port-channel') return 2;
    if (t === 'Vlan') return 4;
    return 3;
  };
  return Object.keys(dev.st.cfg.ifaces).sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    return ifOrder(dev, a) - ifOrder(dev, b) || a.localeCompare(b, undefined, { numeric: true });
  });
}

export function getIf(dev: IosDevice, name: string): IfCfg | undefined {
  return dev.st.cfg.ifaces[name];
}

/** Create a logical interface (Loopback/Vlan/Port-channel/Tunnel/subinterface) on first reference. */
export function ensureIf(dev: IosDevice, name: string): IfCfg {
  const existing = dev.st.cfg.ifaces[name];
  if (existing) return existing;
  const t = typeOfName(name);
  const parent = parentOf(name);
  const isPo = t?.name === 'Port-channel';
  const cfg = newIfCfg(name, {
    router: true,
    sw: isPo && dev.hw.kind !== 'router',
    shutdown: false,
    trunkEncap: dev.model === 'c3650' ? 'negotiate' : 'dot1q',
  });
  if (parent) cfg.sw = false;
  dev.st.cfg.ifaces[name] = cfg;
  return cfg;
}

/** Can this canonical name exist on the device (existing, or creatable logical)? */
export function ifResolve(dev: IosDevice, name: string, policy: IfPolicy): string | null {
  if (dev.st.cfg.ifaces[name]) {
    if (policy === 'phys' && !isPhysical(dev, name)) return null;
    return name;
  }
  if (policy === 'exist+null' && /^Null0$/.test(name)) return name;
  if (policy === 'exist' || policy === 'phys' || policy === 'exist+null') return null;
  const t = typeOfName(name);
  if (!t) return null;
  const parent = parentOf(name);
  if (parent) {
    if (!isPhysical(dev, parent)) return null;
    const pcfg = dev.st.cfg.ifaces[parent];
    if (!pcfg || pcfg.sw) return null;
    const sub = Number(name.slice(parent.length + 1));
    if (!(sub >= 1 && sub <= 4294967295)) return null;
    if (t.name === 'Serial') return null;
    return name;
  }
  if (!t.logical) return null;
  if (!dev.hw.types.includes(t.name)) return null;
  const numStr = name.slice(t.name.length);
  if (!/^\d+$/.test(numStr)) return null;
  const n = Number(numStr);
  let [lo, hi] = t.range ?? [0, 0];
  if (t.name === 'Port-channel') [lo, hi] = dev.hw.poRange;
  if (t.name === 'Null') return null;
  if (n < lo || n > hi) return null;
  return name;
}

/** Resolve a user-typed interface reference ("g0/0/0", "fa0/1") to a canonical existing name. */
export function lookupIf(dev: Device, text: string): string | null {
  const p = parseIfName(text.replace(/\s+/g, ''), dev.hw.types);
  if (!('ok' in p)) return null;
  if (dev.t === 'ios') return dev.st.cfg.ifaces[p.ok.name] ? p.ok.name : null;
  return dev.hw.ifaces.some((i) => i.name === p.ok.name) ? p.ok.name : null;
}

/** Per-interface MAC address. */
export function ifMac(dev: Device, name: string): string {
  const parent = parentOf(name);
  if (parent) return ifMac(dev, parent);
  const phys = dev.hw.ifaces.find((p) => p.name === name);
  if (phys) return macAdd(dev.mac, phys.port);
  const t = typeOfName(name);
  if (t?.name === 'Vlan') return macAdd(dev.mac, 0x40 + (dev.hw.kind === 'l3switch' ? Number(name.slice(4)) % 16 : 0));
  if (t?.name === 'Port-channel') return macAdd(dev.mac, 0x30 + (Number(name.slice(12)) % 16));
  return dev.mac;
}

export function ifTypeDef(name: string) {
  return typeOfName(name) ?? IF_TYPES.GigabitEthernet;
}
