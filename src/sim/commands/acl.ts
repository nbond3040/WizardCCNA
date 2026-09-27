/** ACL entry grammar and editing (numbered `access-list` and named ACL sub-modes). */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import type { Acl, AclAddr, AclEntry, IosDevice, PortMatch } from '../model/state';
import { ICMP_TYPES, TCP_PORTS, UDP_PORTS, aclKindForNumber } from '../engine/acl';

const PROTOS: [string, string][] = [
  ['ahp', 'Authentication Header Protocol'],
  ['eigrp', "Cisco's EIGRP routing protocol"],
  ['esp', 'Encapsulation Security Payload'],
  ['gre', "Cisco's GRE tunneling"],
  ['icmp', 'Internet Control Message Protocol'],
  ['igmp', 'Internet Gateway Message Protocol'],
  ['ip', 'Any Internet Protocol'],
  ['ospf', 'OSPF routing protocol'],
  ['pim', 'Protocol Independent Multicast'],
  ['tcp', 'Transmission Control Protocol'],
  ['udp', 'User Datagram Protocol'],
];

const PORT_HELP: Record<string, string> = {
  bgp: 'Border Gateway Protocol (179)',
  chargen: 'Character generator (19)',
  cmd: 'Remote commands (rcmd, 514)',
  daytime: 'Daytime (13)',
  discard: 'Discard (9)',
  domain: 'Domain Name Service (53)',
  echo: 'Echo (7)',
  exec: 'Exec (rsh, 512)',
  finger: 'Finger (79)',
  ftp: 'File Transfer Protocol (21)',
  'ftp-data': 'FTP data connections (20)',
  gopher: 'Gopher (70)',
  hostname: 'NIC hostname server (101)',
  ident: 'Ident Protocol (113)',
  irc: 'Internet Relay Chat (194)',
  klogin: 'Kerberos login (543)',
  kshell: 'Kerberos shell (544)',
  login: 'Login (rlogin, 513)',
  lpd: 'Printer service (515)',
  nntp: 'Network News Transport Protocol (119)',
  'pim-auto-rp': 'PIM Auto-RP (496)',
  pop2: 'Post Office Protocol v2 (109)',
  pop3: 'Post Office Protocol v3 (110)',
  smtp: 'Simple Mail Transport Protocol (25)',
  sunrpc: 'Sun Remote Procedure Call (111)',
  tacacs: 'TAC Access Control System (49)',
  talk: 'Talk (517)',
  telnet: 'Telnet (23)',
  time: 'Time (37)',
  uucp: 'Unix-to-Unix Copy Program (540)',
  whois: 'Nicname (43)',
  www: 'World Wide Web (HTTP, 80)',
  biff: 'Biff (mail notification, comsat, 512)',
  bootpc: 'Bootstrap Protocol (BOOTP) client (68)',
  bootps: 'Bootstrap Protocol (BOOTP) server (67)',
  dnsix: 'DNSIX security protocol auditing (195)',
  isakmp: 'Internet Security Association and Key Management Protocol (500)',
  'mobile-ip': 'Mobile IP registration (434)',
  nameserver: 'IEN116 name service (obsolete, 42)',
  'netbios-dgm': 'NetBios datagram service (138)',
  'netbios-ns': 'NetBios name service (137)',
  'netbios-ss': 'NetBios session service (139)',
  'non500-isakmp': 'Internet Security Association and Key Management Protocol (4500)',
  ntp: 'Network Time Protocol (123)',
  rip: 'Routing Information Protocol (router, in.routed, 520)',
  snmp: 'Simple Network Management Protocol (161)',
  snmptrap: 'SNMP Traps (162)',
  syslog: 'System Logger (514)',
  tftp: 'Trivial File Transfer Protocol (69)',
  who: 'Who service (rwho, 513)',
  xdmcp: 'X Display Manager Control Protocol (177)',
};

const ICMP_HELP: Record<string, string> = {
  'administratively-prohibited': 'Administratively prohibited',
  echo: 'Echo (ping)',
  'echo-reply': 'Echo reply',
  'host-unreachable': 'Host unreachable',
  'net-unreachable': 'Net unreachable',
  'packet-too-big': 'Fragmentation needed and DF set',
  'parameter-problem': 'All parameter problems',
  'port-unreachable': 'Port unreachable',
  'protocol-unreachable': 'Protocol unreachable',
  redirect: 'All redirects',
  'source-quench': 'Source quenches',
  'time-exceeded': 'All time exceededs',
  traceroute: 'Traceroute',
  'ttl-exceeded': 'TTL exceeded',
  unreachable: 'All unreachables',
};

type EntryRun = (c: Ctx) => void;

/** grammar nodes are memoized per entry handler (numbered vs named ACLs run different handlers) */
const memos = new WeakMap<EntryRun, Map<string, Node[]>>();
function memoFor(run: EntryRun): Map<string, Node[]> {
  let m = memos.get(run);
  if (!m) memos.set(run, (m = new Map()));
  return m;
}

function portNodes(proto: string, key: string, next: () => Node[], run?: EntryRun): Node[] {
  const table = proto === 'udp' ? UDP_PORTS : TCP_PORTS;
  const names = Object.keys(table).sort();
  // destination ports may end the command (`run`); source ports are always followed by the destination
  const mk = (k2: string, end: boolean, sub: () => Node[]): Node[] => [
    num(0, 65535, 'Port number', { key: k2, run: end ? run : undefined }, sub),
    ...names.map((n) => k(n, PORT_HELP[n] ?? n, { key: `${k2}#${n}`, run: end ? run : undefined }, sub)),
  ];
  const one = () => mk(`${key}p1`, true, next);
  return [
    k('eq', 'Match only packets on a given port number', { key: `${key}op=eq` }, one),
    k('gt', 'Match only packets with a greater port number', { key: `${key}op=gt` }, one),
    k('lt', 'Match only packets with a lower port number', { key: `${key}op=lt` }, one),
    k('neq', 'Match only packets not on a given port number', { key: `${key}op=neq` }, one),
    k('range', 'Match only packets in the range of port numbers', { key: `${key}op=range` }, () => mk(`${key}p1`, false, () => mk(`${key}p2`, true, next))),
  ];
}

function tailNodes(proto: string, run: EntryRun): Node[] {
  const id = `tail:${proto}`;
  const memo = memoFor(run);
  const hit = memo.get(id);
  if (hit) return hit;
  const nodes: Node[] = [];
  const self = () => tailNodes(proto, run);
  if (proto === 'icmp') {
    for (const t of Object.keys(ICMP_TYPES).sort()) nodes.push(k(t, ICMP_HELP[t] ?? t, { key: `icmp#${t}`, run }, [k('log', 'Log matches against this entry', { run })]));
    nodes.push(num(0, 255, 'ICMP message type', { key: 'icmpnum', run }, [k('log', 'Log matches against this entry', { run })]));
  }
  if (proto === 'tcp') nodes.push(k('established', 'Match established connections', { key: 'est', run }, self));
  nodes.push(k('log', 'Log matches against this entry', { run }, [k('input', 'Log matches against this entry, including input interface', { run })]));
  memo.set(id, nodes);
  return nodes;
}

function dstNodes(proto: string, run: EntryRun): Node[] {
  const id = `dst:${proto}`;
  const memo = memoFor(run);
  const hit = memo.get(id);
  if (hit) return hit;
  const after = (): Node[] => [...(proto === 'tcp' || proto === 'udp' ? portNodes(proto, 'd', () => tailNodes(proto, run), run) : []), ...tailNodes(proto, run)];
  const nodes: Node[] = [
    a('ipv4', 'A.B.C.D', 'Destination address', { key: 'daddr' }, [a('ipv4', 'A.B.C.D', 'Destination wildcard bits', { key: 'dwc', run }, after)]),
    k('any', 'Any destination host', { key: 'dany', run }, after),
    k('host', 'A single destination host', { key: 'dhost' }, [a('ipv4', 'A.B.C.D', 'Destination address', { key: 'daddr', run }, after)]),
  ];
  memo.set(id, nodes);
  return nodes;
}

function srcNodes(proto: string, run: EntryRun): Node[] {
  const id = `src:${proto}`;
  const memo = memoFor(run);
  const hit = memo.get(id);
  if (hit) return hit;
  const after = (): Node[] => [...(proto === 'tcp' || proto === 'udp' ? portNodes(proto, 's', () => dstNodes(proto, run)) : []), ...dstNodes(proto, run)];
  const nodes: Node[] = [
    a('ipv4', 'A.B.C.D', 'Source address', { key: 'saddr' }, [a('ipv4', 'A.B.C.D', 'Source wildcard bits', { key: 'swc' }, after)]),
    k('any', 'Any source host', { key: 'sany' }, after),
    k('host', 'A single source host', { key: 'shost' }, [a('ipv4', 'A.B.C.D', 'Source address', { key: 'saddr' }, after)]),
  ];
  memo.set(id, nodes);
  return nodes;
}

/** Extended entry: "<proto> <src> [ports] <dst> [ports] [options]" */
export function extBody(run: EntryRun): Node[] {
  return [
    num(0, 255, 'An IP protocol number', { key: 'protonum' }, () => srcNodes('ip', run)),
    ...PROTOS.map(([p, h]) => k(p, h, { key: `proto#${p}` }, () => srcNodes(p, run))),
  ];
}

/** Standard entry: "<src> [wildcard] [log]" */
export function stdBody(run: EntryRun): Node[] {
  const log = [k('log', 'Log matches against this entry', { run })];
  return [
    a('ipv4', 'Hostname or A.B.C.D', 'Address to match', { key: 'saddr', run }, [a('ipv4', 'A.B.C.D', 'Wildcard bits', { key: 'swc', run }, log), ...log]),
    k('any', 'Any source host', { key: 'sany', run }, log),
    k('host', 'A single host address', { key: 'shost' }, [a('ipv4', 'Hostname or A.B.C.D', 'Host address', { key: 'saddr', run }, log)]),
  ];
}

/* ---------------- building entries from parsed args ---------------- */

function keyWith(args: Record<string, unknown>, prefix: string): string | undefined {
  return Object.keys(args).find((x) => x.startsWith(prefix));
}

function portsFrom(args: Record<string, unknown>, side: 's' | 'd', proto: string): PortMatch | undefined {
  const opKey = keyWith(args, `${side}op=`);
  if (!opKey) return undefined;
  const op = opKey.split('=')[1] as PortMatch['op'];
  const table = proto === 'udp' ? UDP_PORTS : TCP_PORTS;
  const val = (k2: string): number | undefined => {
    if (typeof args[k2] === 'number') return args[k2] as number;
    const nk = keyWith(args, `${k2}#`);
    return nk ? table[nk.split('#')[1]] : undefined;
  };
  const p1 = val(`${side}p1`);
  const p2 = val(`${side}p2`);
  const ports = [p1, p2].filter((x): x is number => x !== undefined);
  return { op, ports };
}

export function entryFromArgs(kind: 'standard' | 'extended', action: 'permit' | 'deny', args: Record<string, unknown>): Omit<AclEntry, 'seq'> {
  const src: AclAddr = args.sany ? { any: true, addr: 0, wc: 0 } : { addr: (args.saddr as number) ?? 0, wc: (args.swc as number) ?? 0 };
  if (!src.any) src.addr = (src.addr & ~src.wc) >>> 0;
  const e: Omit<AclEntry, 'seq'> = { action, src, matches: 0, log: !!args.log };
  if (kind === 'extended') {
    const pk = keyWith(args, 'proto#');
    const proto = pk ? pk.split('#')[1] : String(args.protonum ?? 'ip');
    e.proto = proto;
    const dst: AclAddr = args.dany ? { any: true, addr: 0, wc: 0 } : { addr: (args.daddr as number) ?? 0, wc: (args.dwc as number) ?? 0 };
    if (!dst.any) dst.addr = (dst.addr & ~dst.wc) >>> 0;
    e.dst = dst;
    e.sport = portsFrom(args, 's', proto);
    e.dport = portsFrom(args, 'd', proto);
    const ik = keyWith(args, 'icmp#');
    if (ik) e.icmp = ik.split('#')[1];
    else if (args.icmpnum !== undefined) e.icmp = String(args.icmpnum);
    if (args.est) e.established = true;
  }
  return e;
}

function sameEntry(x: Omit<AclEntry, 'seq' | 'matches'>, y: Omit<AclEntry, 'seq' | 'matches'>): boolean {
  const strip = (e: Omit<AclEntry, 'seq' | 'matches'>) => JSON.stringify({ ...e, matches: 0, seq: 0 });
  return strip(x) === strip(y);
}

export function getAcl(dev: IosDevice, name: string, kind: 'standard' | 'extended', numbered: boolean): Acl {
  let acl = dev.st.cfg.acls[name];
  if (!acl) {
    acl = { name, kind, numbered, entries: [] };
    dev.st.cfg.acls[name] = acl;
  }
  return acl;
}

export function nextSeq(acl: Acl): number {
  const max = acl.entries.reduce((m, e) => Math.max(m, e.seq), 0);
  return Math.floor(max / 10) * 10 + 10;
}

/** Add (or with `neg` remove) an entry. Returns an error message or null. */
export function addEntry(acl: Acl, e: Omit<AclEntry, 'seq'>, seq?: number): string | null {
  if (seq !== undefined && acl.entries.some((x) => x.seq === seq)) return '% Duplicate sequence number';
  const dup = acl.entries.find((x) => x.action !== 'remark' && sameEntry(x, e));
  if (dup && e.action !== 'remark') return null;
  acl.entries.push({ ...e, seq: seq ?? nextSeq(acl) });
  acl.entries.sort((x, y) => x.seq - y.seq);
  return null;
}

export function removeEntry(acl: Acl, e: Omit<AclEntry, 'seq'>): void {
  acl.entries = acl.entries.filter((x) => !sameEntry(x, e));
}

/* ---------------- global `access-list` command ---------------- */

function numberedRun(c: Ctx): void {
  const n = c.a.aclnum as number;
  const kind = aclKindForNumber(n)!;
  const name = String(n);
  if (c.neg) {
    // IOS removes the whole numbered ACL, whatever follows the number
    delete c.dev.st.cfg.acls[name];
    return;
  }
  const existing = c.dev.st.cfg.acls[name];
  if (existing && existing.kind !== kind) return;
  const acl = getAcl(c.dev, name, kind, true);
  if (c.a.remark !== undefined) {
    acl.entries.push({ seq: nextSeq(acl), action: 'remark', remark: c.a.remark as string, matches: 0 });
    return;
  }
  const action = c.a.permit ? 'permit' : 'deny';
  const err = addEntry(acl, entryFromArgs(kind, action, c.a));
  if (err) c.out.push(err);
}

export function accessListNode(): Node {
  const stdRun = numberedRun;
  const extRun = numberedRun;
  const remark = k('remark', 'Access list entry comment', [a('line', 'LINE', 'Comment up to 100 characters', { key: 'remark', run: numberedRun })]);
  const std = (min: number, max: number, help: string) =>
    num(min, max, help, { key: 'aclnum', nr: numberedRun }, [
      k('deny', 'Specify packets to reject', stdBody(stdRun)),
      k('permit', 'Specify packets to forward', stdBody(stdRun)),
      remark,
    ]);
  const ext = (min: number, max: number, help: string) =>
    num(min, max, help, { key: 'aclnum', nr: numberedRun }, [
      k('deny', 'Specify packets to reject', extBody(extRun)),
      k('permit', 'Specify packets to forward', extBody(extRun)),
      remark,
    ]);
  return k('access-list', 'Add an access list entry', [
    std(1, 99, 'IP standard access list'),
    ext(100, 199, 'IP extended access list'),
    std(1300, 1999, 'IP standard access list (expanded range)'),
    ext(2000, 2699, 'IP extended access list (expanded range)'),
  ]);
}

/* ---------------- named ACL sub-mode ---------------- */

function namedRun(c: Ctx): void {
  const acl = c.dev.st.cfg.acls[c.s.acl ?? ''];
  if (!acl) return;
  if (c.a.remark !== undefined) {
    if (c.neg) acl.entries = acl.entries.filter((e) => !(e.action === 'remark' && e.remark === c.a.remark));
    else acl.entries.push({ seq: (c.a.seq as number) ?? nextSeq(acl), action: 'remark', remark: c.a.remark as string, matches: 0 });
    return;
  }
  if (c.neg && c.a.seq !== undefined && !c.a.permit && !c.a.deny) {
    acl.entries = acl.entries.filter((e) => e.seq !== c.a.seq);
    return;
  }
  const action = c.a.permit ? 'permit' : 'deny';
  const e = entryFromArgs(acl.kind, action, c.a);
  if (c.neg) {
    removeEntry(acl, e);
    return;
  }
  const err = addEntry(acl, e, c.a.seq as number | undefined);
  if (err) c.out.push(err);
}

export function namedAclNodes(kind: 'standard' | 'extended'): Node[] {
  const body = kind === 'standard' ? stdBody(namedRun) : extBody(namedRun);
  const actions = (): Node[] => [
    k('deny', 'Specify packets to reject', body),
    k('permit', 'Specify packets to forward', body),
    k('remark', 'Access list entry comment', [a('line', 'LINE', 'Comment up to 100 characters', { key: 'remark', run: namedRun })]),
  ];
  return [num(1, 2147483647, 'Sequence Number', { key: 'seq', nr: namedRun }, actions), ...actions()];
}
