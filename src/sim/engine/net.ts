/**
 * The network: devices, links, simulated clock, logging, and the commit loop that recomputes derived
 * protocol state after every change and emits IOS console log messages for observable transitions.
 */
import type { LabDevice, LabLink } from '../../content/labTypes';
import { parseIfName } from '../model/ifname';
import type { Device, HostDevice, IosDevice } from '../model/state';
import { DEFAULT_TS_FORMAT, EPOCH_MS, logTimestamp, parseTsFormat } from '../util/format';
import { buildDevice } from './topo';
import { computeDerived, type Derived } from './derived';
import { applySticky, summarize, emitTransitionLogs, emitDiscoveryLogs, type Summary } from './commit';
import { accrueBackground } from './counters';

export interface End {
  dev: string;
  ifName: string;
}

export interface LinkRec {
  id: string;
  a: End;
  b: End;
  type: 'copper' | 'fiber' | 'serial';
}

export function ek(dev: string, ifName: string): string {
  return `${dev}|${ifName}`;
}

export class Net {
  devs = new Map<string, Device>();
  order: string[] = [];
  links: LinkRec[] = [];
  peer = new Map<string, End>();
  /** ms since the sim epoch (Mar 1 1993) */
  clock = 0;
  errors: string[] = [];
  private derivedCache: Derived | null = null;
  private dirty = true;
  private listeners = new Set<() => void>();
  private batchDepth = 0;
  private pendingCommit = false;
  private prevSummary: Summary | null = null;
  /** suppress console log delivery (initial load, dry runs) */
  silent = false;
  /** true while a check runs: packet side effects are rolled back */
  dry = false;
  /** pending console output per device */
  console = new Map<string, string[]>();
  private tickCount = 0;
  /** hooks installed by the simulator core (avoids import cycles with the CLI layer) */
  applyConfigText?: (dev: IosDevice, text: string) => string[];
  sessionsOn?: (devId: string, current?: unknown) => { num: number; line: string; user: string; host: string; idle: string; location: string; self: boolean }[];

  constructor(devices: LabDevice[], links: LabLink[]) {
    const macs = new Set<string>();
    for (const ld of devices) {
      if (this.devs.has(ld.id)) {
        this.errors.push(`duplicate device id ${ld.id}`);
        continue;
      }
      this.devs.set(ld.id, buildDevice(ld, macs));
      this.order.push(ld.id);
    }
    links.forEach((l, i) => this.addLink(l, i));
  }

  private addLink(l: LabLink, i: number): void {
    const ea = this.resolveEnd(l.a);
    const eb = this.resolveEnd(l.b);
    if (!ea || !eb) {
      this.errors.push(`link ${i + 1}: cannot resolve "${!ea ? l.a : l.b}"`);
      return;
    }
    if (this.peer.has(ek(ea.dev, ea.ifName)) || this.peer.has(ek(eb.dev, eb.ifName))) {
      this.errors.push(`link ${i + 1}: interface already linked (${l.a} / ${l.b})`);
      return;
    }
    const isSerial = /^Serial/.test(ea.ifName) || /^Serial/.test(eb.ifName);
    const type = l.type ?? (isSerial ? 'serial' : 'copper');
    this.links.push({ id: `L${i + 1}`, a: ea, b: eb, type });
    this.peer.set(ek(ea.dev, ea.ifName), eb);
    this.peer.set(ek(eb.dev, eb.ifName), ea);
  }

  private resolveEnd(s: string): End | null {
    const idx = s.indexOf(':');
    if (idx < 0) return null;
    const devId = s.slice(0, idx).trim();
    const dev = this.devs.get(devId);
    if (!dev) return null;
    const p = parseIfName(s.slice(idx + 1).replace(/\s+/g, ''), dev.hw.types);
    if (!('ok' in p)) return null;
    if (!dev.hw.ifaces.some((f) => f.name === p.ok.name)) return null;
    return { dev: devId, ifName: p.ok.name };
  }

  /* ---------------- accessors ---------------- */

  dev(id: string): Device | undefined {
    return this.devs.get(id);
  }

  ios(id: string): IosDevice | undefined {
    const d = this.devs.get(id);
    return d && d.t === 'ios' ? d : undefined;
  }

  host(id: string): HostDevice | undefined {
    const d = this.devs.get(id);
    return d && d.t === 'host' ? d : undefined;
  }

  iosDevices(): IosDevice[] {
    return this.order.map((id) => this.devs.get(id)!).filter((d): d is IosDevice => d.t === 'ios');
  }

  allDevices(): Device[] {
    return this.order.map((id) => this.devs.get(id)!);
  }

  peerOf(dev: string, ifName: string): End | undefined {
    return this.peer.get(ek(dev, ifName));
  }

  /** Find a device by live hostname (case-insensitive) or id. */
  byName(name: string): Device | undefined {
    const n = name.toLowerCase();
    for (const d of this.allDevices()) {
      if (d.id.toLowerCase() === n) return d;
      if (d.t === 'ios' && d.st.cfg.hostname.toLowerCase() === n) return d;
    }
    return undefined;
  }

  /* ---------------- time ---------------- */

  now(): number {
    return EPOCH_MS + this.clock;
  }

  tick(ms = 2000): void {
    this.tickCount++;
    const step = ms + ((this.tickCount * 137) % 997);
    this.clock += step;
    // duplex-mismatched wires keep collecting errors from background frames while time passes
    accrueBackground(this, step);
  }

  /** Device wall clock in ms since 1970 (includes `clock set` offsets and timezone). */
  devClock(dev: IosDevice): number {
    return this.now() + dev.st.dyn.clockOffset;
  }

  uptimeSec(dev: IosDevice): number {
    return (this.clock - dev.st.dyn.boot) / 1000;
  }

  /* ---------------- derived state ---------------- */

  get d(): Derived {
    if (!this.derivedCache || this.dirty) {
      this.derivedCache = computeDerived(this);
      this.dirty = false;
    }
    return this.derivedCache;
  }

  /** Mark configuration/state as changed; derived state is recomputed on next access or commit. */
  touch(): void {
    this.dirty = true;
    this.pendingCommit = true;
  }

  get needsCommit(): boolean {
    return this.pendingCommit;
  }

  /** Recompute derived state, apply sticky protocol decisions, log transitions, notify listeners. */
  commit(force = false): void {
    if (this.batchDepth > 0) {
      this.pendingCommit = true;
      return;
    }
    if (!this.pendingCommit && !force && this.prevSummary) return;
    this.pendingCommit = false;
    for (let iter = 0; iter < 8; iter++) {
      this.dirty = true;
      const d = this.d;
      if (!applySticky(this, d)) break;
    }
    const cur = summarize(this);
    if (this.prevSummary) emitTransitionLogs(this, this.prevSummary, cur);
    this.prevSummary = cur;
    this.notify();
  }

  batch<T>(fn: () => T): T {
    this.batchDepth++;
    try {
      return fn();
    } finally {
      this.batchDepth--;
      if (this.batchDepth === 0 && this.pendingCommit) this.commit();
    }
  }

  /** Reset the transition baseline without logging (used after initial load and reload). */
  rebaseline(): void {
    this.dirty = true;
    this.prevSummary = summarize(this);
  }

  /**
   * CDP frames have crossed every link by the time a lab is loaded: log what they revealed (native VLAN and
   * duplex mismatches), once per end, as the baseline is taken.
   */
  announceDiscoveries(): void {
    this.dirty = true;
    const cur = summarize(this);
    emitDiscoveryLogs(this, cur);
    this.prevSummary = cur;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    if (this.dry) return;
    for (const fn of [...this.listeners]) {
      try {
        fn();
      } catch {
        /* listener errors must not break the sim */
      }
    }
  }

  /* ---------------- logging ---------------- */

  log(devId: string, msg: string): void {
    const dev = this.ios(devId);
    if (!dev || this.dry) return;
    const dyn = dev.st.dyn;
    const auth = dyn.clockSet || !!dyn.ntpSync;
    const tz = dev.st.cfg.tz ? { name: dev.st.cfg.tz.name, offsetMin: dev.st.cfg.tz.h * 60 + dev.st.cfg.tz.m } : undefined;
    const ts = dev.st.cfg.tsLog ? logTimestamp(parseTsFormat(dev.st.cfg.tsLogFmt ?? DEFAULT_TS_FORMAT), this.devClock(dev), this.uptimeSec(dev), auth, tz) : '';
    const line = ts + msg;
    dyn.logBuf.push(line);
    if (dyn.logBuf.length > 300) dyn.logBuf.splice(0, dyn.logBuf.length - 300);
    dyn.logCount++;
    if (this.silent || dev.st.cfg.log.console === false) return;
    const q = this.console.get(devId) ?? [];
    q.push(line);
    if (q.length > 40) q.splice(0, q.length - 40);
    this.console.set(devId, q);
  }

  takeConsole(devId: string): string[] {
    const q = this.console.get(devId);
    if (!q || !q.length) return [];
    this.console.set(devId, []);
    return q;
  }

  /* ---------------- dry runs (checks) ---------------- */

  /** Run `fn` against throw-away copies of all device state (checks must not have side effects). */
  dryRun<T>(fn: () => T): T {
    if (this.dry) return fn();
    const saved: Record<string, unknown> = {};
    for (const d of this.allDevices()) {
      saved[d.id] = d.st;
      (d as { st: unknown }).st = structuredClone(d.st);
    }
    const savedDerived = this.derivedCache;
    const savedDirty = this.dirty;
    const savedClock = this.clock;
    const savedTicks = this.tickCount;
    const savedPending = this.pendingCommit;
    const wasDry = this.dry;
    const wasSilent = this.silent;
    this.dry = true;
    this.silent = true;
    try {
      return fn();
    } finally {
      this.restoreStates(saved);
      this.derivedCache = savedDerived;
      this.dirty = savedDirty;
      this.clock = savedClock;
      this.tickCount = savedTicks;
      this.pendingCommit = savedPending;
      this.dry = wasDry;
      this.silent = wasSilent;
    }
  }

  saveStates(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const d of this.allDevices()) out[d.id] = structuredClone(d.st);
    return out;
  }

  restoreStates(s: Record<string, unknown>): void {
    for (const d of this.allDevices()) {
      if (s[d.id] !== undefined) (d as { st: unknown }).st = s[d.id];
    }
  }
}
