/**
 * WizardCCNA network simulator — public API (docs/SIMULATOR_SPEC.md §1).
 */
import type { HostConfig, LabCheck, LabDevice, LabLink } from '../content/labTypes';
import type { CheckResult, IfStatus, PacketHop, PacketTrace, SimDeviceInfo, SimInterfaceInfo, SimLinkInfo, SimSnapshot, Terminal } from './api';
import { Net, ek } from './engine/net';
import { accrueBackground } from './engine/counters';
import { ifNames } from './engine/topo';
import { defaultVlans, newDevCfg, newDevDyn, type Device, type IosDevice } from './model/state';
import { shortIf } from './model/ifname';
import { applyConfigText } from './cli/apply';
import { TerminalImpl, type Core } from './cli/terminal';
import { savedConfigText, runningConfig } from './show/running';
import { evaluateCheck, primaryAddress } from './checks';
import { hostEffective } from './engine/l3';
import { roundTrip4, roundTrip6 } from './engine/packet';
import { ipStr, parseIp } from './util/ip';
import { parseV6, v6Str } from './util/ipv6';
import { hms, logStamp } from './util/format';

export type {
  CheckResult,
  DeviceKind,
  IfStatus,
  PacketHop,
  PacketTrace,
  SimDeviceInfo,
  SimInterfaceInfo,
  SimLinkInfo,
  SimSnapshot,
  Terminal,
  TerminalResult,
} from './api';

export type LabTopology = { devices: LabDevice[]; links: LabLink[] };

function bootText(dev: IosDevice): string[] {
  const xe = dev.hw.iosXe;
  return [
    '',
    xe ? 'Initializing Hardware ...' : 'System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE (fc1)',
    xe ? `System Bootstrap, Version ${dev.model === 'isr4321' ? '16.9(4r)' : '4.68'}, RELEASE SOFTWARE` : 'Technical Support: http://www.cisco.com/techsupport',
    'Copyright (c) 1994-2019 by cisco Systems, Inc.',
    '',
    `Loading "${dev.hw.imageFile}" ...`,
    '###############################################################################',
    '',
    '              Restricted Rights Legend',
    '',
    xe ? `Cisco IOS XE Software, Version ${dev.hw.version}` : `Cisco IOS Software, Version ${dev.hw.version}, RELEASE SOFTWARE`,
    '',
    dev.st.startup ? '' : '         --- System Configuration Dialog ---\n\nWould you like to enter the initial configuration dialog? [yes/no]: no',
    '',
    'Press RETURN to get started!',
    '',
  ];
}

export class NetworkSim {
  private net: Net;
  private terms = new Map<string, TerminalImpl>();
  private core: Core;

  constructor(lab: LabTopology) {
    const net = new Net(lab.devices, lab.links);
    this.net = net;
    net.applyConfigText = (dev, text) => applyConfigText(net, dev, text);
    net.sessionsOn = (id, cur) => this.sessionsOn(id, cur);
    this.core = {
      net,
      reload: (dev, from) => this.reloadDevice(dev, from),
      vtyCount: (id) => this.vtyCount(id),
    };
    net.clock = 5 * 60 * 1000 + 123;
    net.silent = true;
    net.batch(() => {
      for (const ld of lab.devices) {
        const dev = net.ios(ld.id);
        if (!dev) continue;
        if (ld.config) net.errors.push(...applyConfigText(net, dev, ld.config));
        net.touch();
      }
    });
    net.commit(true);
    for (const dev of net.iosDevices()) {
      dev.st.startup = savedConfigText(net, dev);
      dev.st.dyn.cfgChanged = null;
      dev.st.dyn.savedAt = null;
      dev.st.savedRsa = dev.st.dyn.rsa ? { ...dev.st.dyn.rsa } : undefined;
    }
    // faults present at load have been there since boot: CDP already reported them and their error counters have grown
    net.announceDiscoveries();
    accrueBackground(net, net.clock);
    net.console.clear();
    net.silent = false;
  }

  static fromSnapshot(lab: LabTopology, snap: SimSnapshot): NetworkSim {
    const sim = new NetworkSim(lab);
    const net = sim.net;
    const devs = (snap as { devices?: Record<string, unknown> }).devices ?? {};
    for (const d of net.allDevices()) {
      const st = devs[d.id];
      if (st) (d as { st: unknown }).st = structuredClone(st);
    }
    if (typeof (snap as { clock?: unknown }).clock === 'number') net.clock = (snap as unknown as { clock: number }).clock;
    net.touch();
    net.silent = true;
    net.commit(true);
    net.rebaseline();
    net.console.clear();
    net.silent = false;
    return sim;
  }

  snapshot(): SimSnapshot {
    const devices: Record<string, unknown> = {};
    for (const d of this.net.allDevices()) devices[d.id] = JSON.parse(JSON.stringify(d.st));
    return { version: 1, clock: this.net.clock, devices };
  }

  /* ---------------- topology info ---------------- */

  private ifStatus(dev: Device, name: string): IfStatus {
    const st = this.net.d.l2.ifs.get(ek(dev.id, name));
    if (!st) return 'down';
    if (st.errdis) return 'err-disabled';
    if (st.line === 'admin-down') return 'admin-down';
    return st.line === 'up' && st.proto === 'up' ? 'up' : 'down';
  }

  devices(): SimDeviceInfo[] {
    return this.net.allDevices().map((d) => {
      const names = d.t === 'ios' ? ifNames(d) : d.hw.ifaces.map((p) => p.name);
      const interfaces: SimInterfaceInfo[] = names.map((n) => {
        const peer = this.net.peerOf(d.id, n);
        const info: SimInterfaceInfo = { name: n, short: shortIf(n), status: this.ifStatus(d, n) };
        if (peer) info.linkedTo = { device: peer.dev, iface: peer.ifName };
        return info;
      });
      return {
        id: d.id,
        model: d.model,
        kind: d.t === 'ios' ? d.kind : d.kind,
        hostname: d.t === 'ios' ? d.st.cfg.hostname : d.id,
        label: d.label,
        x: d.x,
        y: d.y,
        locked: d.locked,
        interfaces,
      };
    });
  }

  private endBlocked(dev: string, ifName: string): boolean {
    const d = this.net.d;
    const logical = d.l2.memberPo.get(ek(dev, ifName)) ?? ifName;
    const inst = d.l2.stp.get(dev);
    if (!inst) return false;
    const v1 = inst.get(1)?.ports.get(logical);
    if (v1) return v1.state === 'blocking';
    for (const i of inst.values()) {
      const p = i.ports.get(logical);
      if (p && p.state === 'blocking') return true;
    }
    return false;
  }

  links(): SimLinkInfo[] {
    const d = this.net.d;
    return this.net.links.map((l) => {
      const up = (e: { dev: string; ifName: string }) => {
        const st = d.l2.ifs.get(ek(e.dev, e.ifName));
        return !!st && st.line === 'up' && st.proto === 'up';
      };
      return {
        id: l.id,
        a: { device: l.a.dev, iface: l.a.ifName },
        b: { device: l.b.dev, iface: l.b.ifName },
        type: l.type,
        status: up(l.a) && up(l.b) ? 'up' : 'down',
        aBlocked: this.endBlocked(l.a.dev, l.a.ifName),
        bBlocked: this.endBlocked(l.b.dev, l.b.ifName),
      };
    });
  }

  /* ---------------- terminals ---------------- */

  terminal(deviceId: string): Terminal {
    let t = this.terms.get(deviceId);
    if (!t) {
      if (!this.net.dev(deviceId)) throw new Error(`Unknown device ${deviceId}`);
      t = new TerminalImpl(this.core, deviceId);
      this.terms.set(deviceId, t);
    }
    return t;
  }

  private vtyCount(devId: string): number {
    let n = 0;
    for (const t of this.terms.values()) n += t.sessionsFor(devId).vty.length;
    return n;
  }

  private sessionsOn(devId: string, current?: unknown) {
    const out: { num: number; line: string; user: string; host: string; idle: string; location: string; self: boolean }[] = [];
    const idle = (t?: number) => hms(Math.max(0, Math.floor((this.net.clock - (t ?? this.net.clock)) / 1000)));
    const con = this.terms.get(devId);
    const conS = con?.consoleSession();
    if (!con || con.sessionsFor(devId).console) out.push({ num: 0, line: 'con 0', user: '', host: 'idle', idle: conS === current ? '00:00:00' : idle(conS?.lastActive), location: '', self: !!conS && conS === current });
    const dev = this.net.ios(devId);
    const base = dev && dev.kind === 'router' ? 2 : 1;
    for (const t of this.terms.values()) {
      for (const f of t.sessionsFor(devId).vty) {
        const n = f.s.vtyLine ?? 0;
        const self = f.s === current;
        out.push({ num: base + n, line: `vty ${n}`, user: f.s.user ?? '', host: 'idle', idle: self ? '00:00:00' : idle(f.s.lastActive), location: f.s.peerIp !== undefined ? ipStr(f.s.peerIp) : '', self });
      }
    }
    return out;
  }

  private reloadDevice(dev: IosDevice, from: TerminalImpl): void {
    const net = this.net;
    const old = dev.st;
    const nextReg = old.cfg.nextConfReg;
    net.log(dev.id, `%SYS-5-RELOAD: Reload requested by console. Reload Reason: Reload Command.`);
    const lastLog = old.dyn.logBuf.slice(-1);
    const cfg = newDevCfg(dev.hw, dev.kind === 'router' ? 'Router' : 'Switch');
    const dyn = newDevDyn(net.clock);
    dev.st = {
      cfg,
      dyn,
      startup: old.startup,
      vlans: old.vlanDat ? old.vlans : dev.kind === 'router' ? {} : defaultVlans(),
      vlanDat: old.vlanDat || dev.kind !== 'router',
      savedRsa: old.savedRsa,
    };
    if (old.savedRsa) dyn.rsa = { ...old.savedRsa };
    const reg = nextReg ?? old.cfg.confReg;
    const ignoreStartup = (reg & 0x40) !== 0;
    net.silent = true;
    if (old.startup && !ignoreStartup) applyConfigText(net, dev, old.startup, { boot: true });
    dev.st.cfg.confReg = reg;
    dev.st.cfg.nextConfReg = undefined;
    dyn.cfgChanged = null;
    net.touch();
    net.commit(true);
    net.silent = false;
    net.takeConsole(dev.id);
    const boot = bootText(dev);
    void lastLog;
    for (const t of this.terms.values()) {
      if (t.deviceId === dev.id) t.resetConsole([`*${logStamp(net.devClock(dev))}: %SYS-5-RELOAD: Reload requested by console. Reload Reason: Reload Command.`, ...boot], t === from);
      else t.dropSessionsTo(dev.id);
    }
  }

  /* ---------------- hosts ---------------- */

  hostConfig(deviceId: string): HostConfig & { assigned?: { ip: string; mask: string; gateway?: string; dns?: string } } {
    const d = this.net.host(deviceId);
    if (!d) return {};
    const out: HostConfig & { assigned?: { ip: string; mask: string; gateway?: string; dns?: string } } = { ...d.st.cfg };
    if (d.st.cfg.dhcp) {
      const e = hostEffective(d);
      if (e.ip !== undefined && e.mask !== undefined) {
        out.assigned = { ip: ipStr(e.ip), mask: ipStr(e.mask) };
        if (e.gw !== undefined) out.assigned.gateway = ipStr(e.gw);
        if (e.dns !== undefined) out.assigned.dns = ipStr(e.dns);
      }
    }
    return out;
  }

  setHostConfig(deviceId: string, cfg: HostConfig): void {
    const d = this.net.host(deviceId);
    if (!d) return;
    d.st.cfg = { ...cfg };
    d.st.lease = null;
    d.st.apipa = undefined;
    d.st.dhcpReleased = false;
    d.st.arp = {};
    this.net.touch();
    this.net.commit();
  }

  runningConfig(deviceId: string): string {
    const d = this.net.ios(deviceId);
    return d ? runningConfig(this.net, d) : '';
  }

  /** Lines of lab device `config` that did not parse (authoring aid; not part of the spec API). */
  configErrors(): string[] {
    return [...this.net.errors];
  }

  check(check: LabCheck): CheckResult {
    return evaluateCheck(this.net, check);
  }

  tracePing(from: string, to: string): PacketTrace {
    const net = this.net;
    const src = net.dev(from) ?? net.byName(from);
    if (!src) return { success: false, summary: `Unknown device ${from}`, forward: [], reply: [] };
    let ip = parseIp(to);
    let v6: string | undefined;
    if (ip === null && to.includes(':')) {
      const v = parseV6(to);
      if (v !== null) v6 = v6Str(v);
    }
    if (ip === null && !v6) {
      const dst = net.dev(to) ?? net.byName(to);
      const a = dst ? primaryAddress(net, dst) : undefined;
      if (a === undefined) return { success: false, summary: `Cannot determine an address for ${to}`, forward: [], reply: [] };
      ip = a;
    }
    let result: PacketTrace;
    if (v6) {
      const r = roundTrip6(net, src, v6);
      result = { success: r.ok, summary: r.ok ? `Reply from ${v6}` : r.detail, forward: r.fwd.hops, reply: r.rep?.hops ?? [] };
    } else {
      const pkt = { src: 0, dst: ip!, proto: 'icmp' as const, icmp: 'echo' as const, ttl: src.t === 'ios' ? 255 : 128, size: 64, sport: 1, dport: 1 };
      let r = roundTrip4(net, src, pkt);
      const firstHops: PacketHop[] = [...r.fwd.hops];
      if (!r.ok && r.arpDrop) r = roundTrip4(net, src, pkt);
      const summary = r.ok
        ? `Reply from ${ipStr(ip!)}`
        : r.symbol === 'U'
          ? `Destination host unreachable (${r.detail})`
          : r.fwd.fail?.kind === 'arp' && r.fwd.fail.dev === src.id
            ? `Destination host unreachable (${r.detail})`
            : `Request timed out (${r.detail})`;
      const forward = r.fwd.hops.length ? r.fwd.hops : firstHops;
      result = { success: r.ok, summary, forward, reply: r.rep?.hops ?? r.err?.hops ?? [] };
    }
    net.touch();
    net.commit();
    return result;
  }

  subscribe(listener: () => void): () => void {
    return this.net.subscribe(listener);
  }
}
