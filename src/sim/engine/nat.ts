/** NAT: static, dynamic pool and PAT (overload) with IOS inside/outside semantics. */
import type { IosDevice, NatTrans } from '../model/state';
import { aclMatchesForNat } from './acl';
import type { Addr4 } from '../model/state';
import { ek, type Net } from './net';

export interface NatPkt {
  src: number;
  dst: number;
  proto: 'icmp' | 'tcp' | 'udp' | string;
  sport?: number;
  dport?: number;
  icmp?: string;
  inner?: { src: number; dst: number; sport?: number; dport?: number; proto: string };
}

function isErr(p: NatPkt): boolean {
  return p.proto === 'icmp' && (p.icmp === 'unreach' || p.icmp === 'ttl');
}

function l4(p: NatPkt): 'tcp' | 'udp' | 'icmp' | undefined {
  if (p.proto === 'tcp' || p.proto === 'udp' || p.proto === 'icmp') return p.proto;
  return undefined;
}

function poolAddrs(dev: IosDevice, name: string): number[] {
  const pool = dev.st.cfg.nat.pools[name];
  if (!pool) return [];
  const out: number[] = [];
  for (let a = pool.start; a <= pool.end && out.length < 1024; a++) out.push(a >>> 0);
  return out;
}

function portInUse(dev: IosDevice, proto: string | undefined, ig: number, igp: number, il: number, ilp: number | undefined): boolean {
  return dev.st.dyn.nat.some((t) => t.proto === proto && t.ig === ig && t.igp === igp && !(t.il === il && t.ilp === ilp));
}

function pickPort(dev: IosDevice, proto: string | undefined, ig: number, il: number, ilp: number): number {
  if (!portInUse(dev, proto, ig, ilp, il, ilp)) return ilp;
  for (let p = 1024; p < 65535; p++) if (!portInUse(dev, proto, ig, p, il, ilp)) return p;
  return ilp;
}

function addTrans(net: Net, dev: IosDevice, t: NatTrans): void {
  dev.st.dyn.nat.push(t);
  dev.st.dyn.natTransCounter++;
  dev.st.dyn.natPeak = Math.max(dev.st.dyn.natPeak, dev.st.dyn.nat.length + dev.st.cfg.nat.statics.length);
  void net;
}

/**
 * Inside → outside: translate the source. Returns the translated packet, or `null` when the packet
 * matched a dynamic rule but could not be translated (pool exhausted → dropped).
 */
export function natOut(net: Net, dev: IosDevice, pkt: NatPkt, egressIf: string, addrOf: (ifName: string) => Addr4 | undefined): { pkt: NatPkt; text?: string } | null {
  const egressAddr = addrOf(egressIf);
  const proto = l4(pkt);
  const cfg = dev.st.cfg.nat;
  const dyn = dev.st.dyn;
  const sport = pkt.sport;
  // existing extended translation
  const ext = dyn.nat.find((t) => t.proto === proto && t.il === pkt.src && t.ilp === sport && t.og === pkt.dst && t.ogp === pkt.dport);
  if (ext) {
    dyn.natHits++;
    return { pkt: { ...pkt, src: ext.ig, sport: ext.igp }, text: `NAT ${fmt(pkt.src, sport)} → ${fmt(ext.ig, ext.igp)}` };
  }
  // static PAT
  const sp = cfg.statics.find((s) => !s.outside && s.proto && s.proto === proto && s.local === pkt.src && s.lport === sport);
  if (sp) {
    const g = sp.gIf ? egressAddr?.ip ?? sp.global : sp.global;
    dyn.natHits++;
    addTrans(net, dev, { proto, il: pkt.src, ilp: sport, ig: g, igp: sp.gport, ol: pkt.dst, olp: pkt.dport, og: pkt.dst, ogp: pkt.dport, kind: 'static', t: net.clock });
    return { pkt: { ...pkt, src: g, sport: sp.gport }, text: `Static NAT ${fmt(pkt.src, sport)} → ${fmt(g, sp.gport)}` };
  }
  // static one-to-one
  const s1 = cfg.statics.find((s) => !s.outside && !s.proto && s.local === pkt.src);
  if (s1) {
    dyn.natHits++;
    if (proto) addTrans(net, dev, { proto, il: pkt.src, ilp: sport, ig: s1.global, igp: sport, ol: pkt.dst, olp: pkt.dport, og: pkt.dst, ogp: pkt.dport, kind: 'static', t: net.clock });
    return { pkt: { ...pkt, src: s1.global }, text: `Static NAT ${fmtIp(pkt.src)} → ${fmtIp(s1.global)}` };
  }
  // dynamic rules
  for (const rule of cfg.dyn) {
    if (!aclMatchesForNat(dev, rule.acl, { src: pkt.src, dst: pkt.dst, proto: pkt.proto, sport: pkt.sport, dport: pkt.dport, icmp: pkt.icmp })) continue;
    let globalIp: number | undefined;
    if (rule.iface) {
      globalIp = addrOf(rule.iface)?.ip;
      if (globalIp === undefined) {
        dyn.natMisses++;
        return null;
      }
    }
    if (rule.overload) {
      if (globalIp === undefined) {
        const addrs = poolAddrs(dev, rule.pool ?? '');
        if (!addrs.length) {
          dyn.natMisses++;
          return null;
        }
        globalIp = addrs[0];
      }
      const port = sport === undefined ? 0 : pickPort(dev, proto, globalIp, pkt.src, sport);
      dyn.natMisses++;
      addTrans(net, dev, { proto, il: pkt.src, ilp: sport, ig: globalIp, igp: port, ol: pkt.dst, olp: pkt.dport, og: pkt.dst, ogp: pkt.dport, kind: 'dynamic', t: net.clock });
      return { pkt: { ...pkt, src: globalIp, sport: port }, text: `PAT ${fmt(pkt.src, sport)} → ${fmt(globalIp, port)}` };
    }
    // dynamic one-to-one from pool
    let simple = dyn.nat.find((t) => !t.proto && t.il === pkt.src);
    if (!simple) {
      const used = new Set(dyn.nat.filter((t) => !t.proto).map((t) => t.ig));
      const statics = new Set(cfg.statics.map((s) => s.global));
      const free = poolAddrs(dev, rule.pool ?? '').find((a) => !used.has(a) && !statics.has(a));
      if (free === undefined) {
        dyn.natMisses++;
        return null;
      }
      simple = { il: pkt.src, ig: free, kind: 'dynamic', t: net.clock };
      addTrans(net, dev, simple);
      dyn.natMisses++;
    } else dyn.natHits++;
    if (proto) addTrans(net, dev, { proto, il: pkt.src, ilp: sport, ig: simple.ig, igp: sport, ol: pkt.dst, olp: pkt.dport, og: pkt.dst, ogp: pkt.dport, kind: 'dynamic', t: net.clock });
    return { pkt: { ...pkt, src: simple.ig }, text: `NAT ${fmtIp(pkt.src)} → ${fmtIp(simple.ig)}` };
  }
  return { pkt };
}

/** Outside → inside: translate the destination (before routing). */
export function natIn(net: Net, dev: IosDevice, pkt: NatPkt): { pkt: NatPkt; text?: string } {
  const proto = l4(pkt);
  const cfg = dev.st.cfg.nat;
  const dyn = dev.st.dyn;
  if (isErr(pkt) && pkt.inner) {
    const inner = pkt.inner;
    const t = dyn.nat.find((x) => x.ig === inner.src && (x.igp === undefined || x.igp === inner.sport));
    if (t) return { pkt: { ...pkt, dst: t.il, inner: { ...inner, src: t.il, sport: t.ilp } }, text: `NAT ${fmtIp(pkt.dst)} → ${fmtIp(t.il)}` };
  }
  const ext = dyn.nat.find((t) => t.proto === proto && t.ig === pkt.dst && t.igp === pkt.dport && (t.og === undefined || t.og === pkt.src));
  if (ext) {
    dyn.natHits++;
    return { pkt: { ...pkt, dst: ext.il, dport: ext.ilp }, text: `NAT ${fmt(pkt.dst, pkt.dport)} → ${fmt(ext.il, ext.ilp)}` };
  }
  const sp = cfg.statics.find((s) => !s.outside && s.proto && s.proto === proto && s.global === pkt.dst && s.gport === pkt.dport);
  if (sp) {
    dyn.natHits++;
    addTrans(net, dev, { proto, il: sp.local, ilp: sp.lport, ig: sp.global, igp: sp.gport, ol: pkt.src, olp: pkt.sport, og: pkt.src, ogp: pkt.sport, kind: 'static', t: net.clock });
    return { pkt: { ...pkt, dst: sp.local, dport: sp.lport }, text: `Static NAT ${fmt(pkt.dst, pkt.dport)} → ${fmt(sp.local, sp.lport)}` };
  }
  const s1 = cfg.statics.find((s) => !s.outside && !s.proto && s.global === pkt.dst);
  if (s1) {
    dyn.natHits++;
    if (proto) addTrans(net, dev, { proto, il: s1.local, ilp: pkt.dport, ig: s1.global, igp: pkt.dport, ol: pkt.src, olp: pkt.sport, og: pkt.src, ogp: pkt.sport, kind: 'static', t: net.clock });
    return { pkt: { ...pkt, dst: s1.local }, text: `Static NAT ${fmtIp(pkt.dst)} → ${fmtIp(s1.local)}` };
  }
  const simple = dyn.nat.find((t) => !t.proto && t.ig === pkt.dst);
  if (simple) {
    dyn.natHits++;
    return { pkt: { ...pkt, dst: simple.il }, text: `NAT ${fmtIp(pkt.dst)} → ${fmtIp(simple.il)}` };
  }
  return { pkt };
}

export function natIfRole(dev: IosDevice, ifName: string): 'inside' | 'outside' | undefined {
  return dev.st.cfg.ifaces[ifName]?.nat;
}

/** Is `ip` an address on one of the device's NAT inside interfaces? */
export function isInsideAddr(dev: IosDevice, addrs: Map<string, Addr4[]>, ip: number): boolean {
  for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
    if (c.nat !== 'inside') continue;
    if (addrs.get(ek(dev.id, name))?.some((a) => a.ip === ip)) return true;
  }
  return false;
}

function fmtIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function fmt(ip: number, port?: number): string {
  return port === undefined ? fmtIp(ip) : `${fmtIp(ip)}:${port}`;
}
