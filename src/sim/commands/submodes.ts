/** Small sub-modes: config-vlan, dhcp-config, named ACLs and generic accepted blocks. */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx, Session } from '../cli/session';
import type { Net } from '../engine/net';
import type { ArpAclEntry } from '../model/state';
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

/* ---------------- ARP access list (Dynamic ARP Inspection) ---------------- */

function arpAclRun(c: Ctx): void {
  const acl = c.dev.st.cfg.arpAcls?.[c.s.acl ?? ''];
  if (!acl) return;
  const ip: ArpAclEntry['ip'] = c.a.ipany ? { any: true, addr: 0, wc: 0xffffffff } : c.a.iphost !== undefined ? { addr: c.a.iphost as number, wc: 0 } : { addr: c.a.ipaddr as number, wc: c.a.ipwc as number };
  const mac: ArpAclEntry['mac'] = c.a.macany ? { any: true, mac: '000000000000', wc: 'ffffffffffff' } : c.a.machost !== undefined ? { mac: c.a.machost as string, wc: '000000000000' } : { mac: c.a.macaddr as string, wc: c.a.macwc as string };
  const e: ArpAclEntry = { action: c.a.permit ? 'permit' : 'deny', ip, mac };
  if (c.a.request) e.dir = 'request';
  else if (c.a.response) e.dir = 'response';
  if (c.a.alog) e.log = true;
  const same = (x: ArpAclEntry) =>
    x.action === e.action && x.dir === e.dir && !!x.ip.any === !!e.ip.any && x.ip.addr === e.ip.addr && x.ip.wc === e.ip.wc && !!x.mac.any === !!e.mac.any && x.mac.mac === e.mac.mac && x.mac.wc === e.mac.wc;
  if (c.neg) {
    acl.entries = acl.entries.filter((x) => !same(x));
    return;
  }
  if (!acl.entries.some(same)) acl.entries.push(e);
}

let aRoots: Node[] | null = null;
/** `permit|deny [request|response] ip {any | host A.B.C.D | A.B.C.D wildcard} mac {any | host H.H.H | H.H.H wildcard} [log]` */
export function arpAclRoots(): Node[] {
  if (aRoots) return aRoots;
  const logN = (): Node[] => [k('log', 'Log on match', { key: 'alog', run: arpAclRun })];
  const macPart = (): Node[] => [
    k('any', 'Any source MAC address', { key: 'macany', run: arpAclRun }, logN),
    k('host', 'A single source MAC host', [a('mac', 'H.H.H', 'Source MAC address', { key: 'machost', run: arpAclRun }, logN)]),
    a('mac', 'H.H.H', 'Source MAC address', { key: 'macaddr' }, [a('mac', 'H.H.H', 'Source MAC wildcard bits (1 = ignore)', { key: 'macwc', run: arpAclRun }, logN)]),
  ];
  const ipPart = (): Node[] => [
    k('any', 'Any source IP address', { key: 'ipany' }, [k('mac', 'MAC address', macPart)]),
    k('host', 'A single source IP host', [a('ipv4', 'A.B.C.D', 'Source IP address', { key: 'iphost' }, [k('mac', 'MAC address', macPart)])]),
    a('ipv4', 'A.B.C.D', 'Source IP address', { key: 'ipaddr' }, [a('ipv4', 'A.B.C.D', 'Source IP wildcard bits', { key: 'ipwc' }, [k('mac', 'MAC address', macPart)])]),
  ];
  const body = (): Node[] => [k('ip', 'IP address', ipPart), k('request', 'ARP requests', [k('ip', 'IP address', ipPart)]), k('response', 'ARP responses', [k('ip', 'IP address', ipPart)])];
  aRoots = [k('deny', 'Specify packets to reject', body), k('permit', 'Specify packets to forward', body)];
  return aRoots;
}

/* ---------------- generic blocks (key chain, tacacs server, radius server) ---------------- */

function blockLine(c: Ctx, kw: string): void {
  const b = c.s.block;
  if (!b) return;
  const blk = c.dev.st.cfg.blocks[b.idx];
  if (!blk) return;
  const text = `${kw} ${(c.a.text as string | undefined) ?? ''}`.trim().replace(/\s+/g, ' ');
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

/** sub-commands of key chain / tacacs server / radius server blocks (anything else falls back to global config) */
const BLOCK_WORDS: [string, string, boolean][] = [
  ['accept-lifetime', 'Set accept lifetime of key', false],
  ['address', 'Server address', false],
  ['automate-tester', 'Configure server automated testing', false],
  ['cryptographic-algorithm', 'Set cryptographic authentication algorithm', false],
  ['key', 'Configure a key / per-server encryption key', false],
  ['key-string', 'Set key string', false],
  ['port', 'TCP port for TACACS+ server (default is 49)', false],
  ['retransmit', 'Number of retries to active server (overrides default)', false],
  ['send-lifetime', 'Set send lifetime of key', false],
  ['single-connection', 'Multiplex all packets over a single tcp connection to server', true],
  ['timeout', 'Time to wait for this server to reply (overrides default)', false],
];

let bRoots: Node[] | null = null;
export function blockRoots(): Node[] {
  if (bRoots) return bRoots;
  bRoots = BLOCK_WORDS.map(([w, h, alone]) => {
    const run = (c: Ctx) => blockLine(c, w);
    return k(w, h, { run: alone ? run : undefined, nr: run }, [a('line', 'LINE', h, { key: 'text', run })]);
  });
  return bRoots;
}
