/** Small sub-modes: config-vlan, dhcp-config, named ACLs and generic accepted blocks. */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx, Session } from '../cli/session';
import type { Net } from '../engine/net';
import { isMask, maskFromLen } from '../util/ip';
import { namedAclNodes } from './acl';
import { createVlan } from './global';

/* ---------------- config-vlan ---------------- */

export function applyVlanPending(net: Net, s: Session): void {
  const p = s.vlanPend;
  if (!p) return;
  s.vlanPend = undefined;
  const dev = s.dev;
  const ctx = { net, dev, s, a: {}, neg: false, dflt: false, line: '', out: [] as string[], io: { interactive: false } } as unknown as Ctx;
  for (const v of p.ids) {
    if (!createVlan(ctx, v)) continue;
    const rec = dev.st.vlans[String(v)];
    if (p.name !== undefined) rec.name = p.name;
    if (p.shut !== undefined) rec.shut = p.shut || undefined;
    if (p.suspend !== undefined) rec.suspend = p.suspend || undefined;
  }
  dev.st.dyn.cfgChanged = net.clock;
  net.touch();
}

function vlanName(c: Ctx): void {
  const p = c.s.vlanPend;
  if (!p) return;
  if (p.ids.includes(1) && !c.neg) {
    c.out.push('%Default VLAN 1 may not have its name changed.');
    return;
  }
  if (c.neg) {
    p.name = undefined;
    for (const v of p.ids) {
      const rec = c.dev.st.vlans[String(v)];
      if (rec) rec.name = `VLAN${String(v).padStart(4, '0')}`;
    }
    return;
  }
  if (p.ids.length > 1) {
    c.out.push('% Applying VLAN changes may take few minutes.  Please wait...');
  }
  p.name = c.a.vname as string;
}

function vlanState(c: Ctx): void {
  const p = c.s.vlanPend;
  if (!p) return;
  if (c.a.shutdown) p.shut = !c.neg;
  else p.suspend = c.neg ? false : !!c.a.suspend;
}

let vRoots: Node[] | null = null;
export function vlanRoots(): Node[] {
  if (vRoots) return vRoots;
  vRoots = [
    k('name', 'Ascii name of the VLAN', { nr: vlanName }, [a('word', 'WORD', 'The ascii name for the VLAN', { key: 'vname', run: vlanName })]),
    k('shutdown', 'Shutdown VLAN switching', { run: vlanState }),
    k('state', 'Operational state of the VLAN', [k('active', 'VLAN Active State', { run: vlanState }), k('suspend', 'VLAN Suspended State', { run: vlanState })]),
  ];
  return vRoots;
}

/* ---------------- dhcp-config ---------------- */

function pool(c: Ctx) {
  return c.dev.st.cfg.dhcpPools[c.s.pool ?? ''];
}

function network(c: Ctx): void {
  const p = pool(c);
  if (!p) return;
  if (c.neg) {
    p.net = undefined;
    p.mask = undefined;
    return;
  }
  const mask = c.a.pmask !== undefined ? (c.a.pmask as number) : c.a.plen !== undefined ? maskFromLen(c.a.plen as number) : undefined;
  if (mask === undefined || !isMask(mask)) {
    c.out.push('% Invalid network mask');
    return;
  }
  p.net = ((c.a.pnet as number) & mask) >>> 0;
  p.mask = mask;
}

function listRun(key: 'gw' | 'dns') {
  return (c: Ctx) => {
    const p = pool(c);
    if (!p) return;
    const vals = (c.a.addrs as number[] | undefined) ?? [];
    if (c.neg) {
      p[key] = vals.length ? p[key].filter((x) => !vals.includes(x)) : [];
      return;
    }
    p[key] = vals;
  };
}

function domainName(c: Ctx): void {
  const p = pool(c);
  if (p) p.domain = c.neg ? undefined : (c.a.dn as string);
}

function lease(c: Ctx): void {
  const p = pool(c);
  if (!p) return;
  if (c.neg) {
    p.lease = undefined;
    return;
  }
  if (c.a.infinite) p.lease = 'infinite';
  else p.lease = [c.a.days as number, (c.a.hours as number | undefined) ?? 0, (c.a.mins as number | undefined) ?? 0];
}

function extra(c: Ctx): void {
  const p = pool(c);
  if (!p) return;
  const line = c.line.trim().replace(/^no\s+/, '');
  p.extra = p.extra.filter((x) => x !== line);
  if (!c.neg) p.extra.push(line);
}

let dRoots: Node[] | null = null;
export function dhcpRoots(): Node[] {
  if (dRoots) return dRoots;
  const addrList = (run: (c: Ctx) => void): Node[] => {
    const more = (): Node[] => [a('ipv4', 'A.B.C.D', 'IP address', { key: 'addrs[]', run }, more)];
    return [a('ipv4', 'Hostname or A.B.C.D', 'IP address', { key: 'addrs[]', run }, more)];
  };
  dRoots = [
    k('client-identifier', 'Client identifier', [a('word', 'WORD', 'Dotted-hexadecimal string', { key: 'x', run: extra })]),
    k('default-router', 'Default routers', { nr: listRun('gw') }, addrList(listRun('gw'))),
    k('dns-server', 'DNS servers', { nr: listRun('dns') }, addrList(listRun('dns'))),
    k('domain-name', 'Domain name', { nr: domainName }, [a('word', 'WORD', 'Domain name', { key: 'dn', run: domainName })]),
    k('host', 'Client IP address and mask', [a('line', 'LINE', 'IP address', { key: 'x', run: extra })]),
    k('lease', 'Address lease time', { nr: lease }, [
      num(0, 365, 'Days', { key: 'days', run: lease }, [num(0, 23, 'Hours', { key: 'hours', run: lease }, [num(0, 59, 'Minutes', { key: 'mins', run: lease })])]),
      k('infinite', 'Infinite lease', { run: lease }),
    ]),
    k('netbios-name-server', 'NetBIOS (WINS) name servers', [a('line', 'LINE', 'Servers', { key: 'x', run: extra })]),
    k('network', 'Network number and mask', { nr: network }, [
      a('ipv4', 'A.B.C.D', 'Network number in dotted-decimal notation', { key: 'pnet' }, [
        a('ipv4', 'A.B.C.D', 'Network mask', { key: 'pmask', run: network }),
        a('word', '/nn', 'Mask length', { key: 'plens', test: (t) => /^\/\d{1,2}$/.test(t) && Number(t.slice(1)) <= 32, run: (c: Ctx) => { c.a.plen = Number(String(c.a.plens).slice(1)); network(c); } }),
      ]),
    ]),
    k('option', 'Raw DHCP options', [a('line', 'LINE', 'option', { key: 'x', run: extra })]),
  ];
  return dRoots;
}

/* ---------------- named ACL modes ---------------- */

let sRoots: Node[] | null = null;
let eRoots: Node[] | null = null;
export function stdAclRoots(): Node[] {
  return (sRoots ??= namedAclNodes('standard'));
}
export function extAclRoots(): Node[] {
  return (eRoots ??= namedAclNodes('extended'));
}

/* ---------------- generic blocks (key chain, tacacs server, radius server) ---------------- */

function blockLine(c: Ctx): void {
  const b = c.s.block;
  if (!b) return;
  const blk = c.dev.st.cfg.blocks[b.idx];
  if (!blk) return;
  const text = (c.a.text as string).trim().replace(/\s+/g, ' ');
  // key chain → key N → key-string: the key's own lines are nested one level deeper
  const inKey = b.prompt === 'config-keychain-key' && b.key !== undefined;
  const line = inKey ? ` ${text}` : text;
  if (c.neg) {
    const at = blk.lines.indexOf(line);
    if (at >= 0) blk.lines.splice(at, /^key \d+$/.test(text) ? 1 + subCount(blk.lines, at) : 1);
    return;
  }
  if (!inKey && /^key \d+$/.test(text) && blk.header.startsWith('key chain')) {
    b.prompt = 'config-keychain-key';
    b.key = text;
    if (!blk.lines.includes(text)) blk.lines.push(text);
    return;
  }
  if (inKey) {
    const at = blk.lines.indexOf(b.key!);
    const end = at + 1 + subCount(blk.lines, at);
    const word = line.trim().split(' ')[0];
    const same = blk.lines.slice(at + 1, end).findIndex((x) => x.trim().split(' ')[0] === word);
    if (same >= 0) blk.lines[at + 1 + same] = line;
    else blk.lines.splice(end, 0, line);
    return;
  }
  if (!blk.lines.includes(line)) blk.lines.push(line);
}

function subCount(lines: string[], at: number): number {
  let n = 0;
  while (at + 1 + n < lines.length && lines[at + 1 + n].startsWith(' ')) n++;
  return n;
}

let bRoots: Node[] | null = null;
export function blockRoots(): Node[] {
  if (bRoots) return bRoots;
  bRoots = [a('line', 'LINE', 'Configuration line', { key: 'text', run: blockLine })];
  return bRoots;
}
