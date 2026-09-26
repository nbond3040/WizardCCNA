/** Access-list evaluation (standard / extended / named), first match + implicit deny. */
import type { Acl, AclAddr, AclEntry, IosDevice, PortMatch } from '../model/state';
import { wildcardMatches } from '../util/ip';

export interface AclPkt {
  src: number;
  dst: number;
  proto: 'icmp' | 'tcp' | 'udp' | 'ospf' | string;
  sport?: number;
  dport?: number;
  icmp?: string;
  code?: number;
  est?: boolean;
}

export const PROTO_NUM: Record<string, number> = { icmp: 1, igmp: 2, ip: 0, tcp: 6, udp: 17, gre: 47, esp: 50, ahp: 51, eigrp: 88, ospf: 89, pim: 103 };

export const TCP_PORTS: Record<string, number> = {
  bgp: 179, chargen: 19, cmd: 514, daytime: 13, discard: 9, domain: 53, echo: 7, exec: 512, finger: 79, ftp: 21, 'ftp-data': 20,
  gopher: 70, hostname: 101, ident: 113, irc: 194, klogin: 543, kshell: 544, login: 513, lpd: 515, nntp: 119, 'pim-auto-rp': 496,
  pop2: 109, pop3: 110, smtp: 25, sunrpc: 111, tacacs: 49, talk: 517, telnet: 23, time: 37, uucp: 540, whois: 43, www: 80,
};

export const UDP_PORTS: Record<string, number> = {
  biff: 512, bootpc: 68, bootps: 67, discard: 9, dnsix: 195, domain: 53, echo: 7, isakmp: 500, 'mobile-ip': 434, nameserver: 42,
  'netbios-dgm': 138, 'netbios-ns': 137, 'netbios-ss': 139, 'non500-isakmp': 4500, ntp: 123, 'pim-auto-rp': 496, rip: 520,
  snmp: 161, snmptrap: 162, sunrpc: 111, syslog: 514, tacacs: 49, talk: 517, tftp: 69, time: 37, who: 513, xdmcp: 177,
};

export const ICMP_TYPES: Record<string, [number, number?]> = {
  'administratively-prohibited': [3, 13],
  echo: [8],
  'echo-reply': [0],
  'host-unreachable': [3, 1],
  'net-unreachable': [3, 0],
  'port-unreachable': [3, 3],
  'protocol-unreachable': [3, 2],
  'time-exceeded': [11],
  'ttl-exceeded': [11, 0],
  unreachable: [3],
  redirect: [5],
  'source-quench': [4],
  traceroute: [30],
  'parameter-problem': [12],
  'packet-too-big': [3, 4],
};

export function portName(proto: string, port: number): string {
  const table = proto === 'udp' ? UDP_PORTS : TCP_PORTS;
  for (const [k, v] of Object.entries(table)) if (v === port) return k;
  return String(port);
}

function addrMatch(a: AclAddr | undefined, ip: number): boolean {
  if (!a || a.any) return true;
  return wildcardMatches(ip, a.addr, a.wc);
}

function portMatch(m: PortMatch | undefined, p: number | undefined): boolean {
  if (!m) return true;
  if (p === undefined) return false;
  switch (m.op) {
    case 'eq':
      return m.ports.includes(p);
    case 'neq':
      return !m.ports.includes(p);
    case 'lt':
      return p < m.ports[0];
    case 'gt':
      return p > m.ports[0];
    case 'range':
      return p >= m.ports[0] && p <= m.ports[1];
  }
}

function pktIcmpType(pkt: AclPkt): [number, number] | null {
  if (pkt.proto !== 'icmp') return null;
  switch (pkt.icmp) {
    case 'echo':
      return [8, 0];
    case 'echo-reply':
      return [0, 0];
    case 'unreach':
      return [3, pkt.code ?? 0];
    case 'ttl':
      return [11, 0];
    default:
      return [8, 0];
  }
}

export function entryMatches(acl: Acl, e: AclEntry, pkt: AclPkt): boolean {
  if (e.action === 'remark') return false;
  if (acl.kind === 'standard') return addrMatch(e.src, pkt.src);
  const proto = e.proto ?? 'ip';
  if (proto !== 'ip') {
    const want = /^\d+$/.test(proto) ? Number(proto) : PROTO_NUM[proto];
    const have = PROTO_NUM[pkt.proto] ?? -1;
    if (want !== have) return false;
  }
  if (!addrMatch(e.src, pkt.src) || !addrMatch(e.dst, pkt.dst)) return false;
  if (proto === 'tcp' || proto === 'udp') {
    if (!portMatch(e.sport, pkt.sport) || !portMatch(e.dport, pkt.dport)) return false;
    if (e.established && !pkt.est) return false;
  }
  if (proto === 'icmp' && e.icmp) {
    const t = pktIcmpType(pkt);
    if (!t) return false;
    if (/^\d+$/.test(e.icmp)) return t[0] === Number(e.icmp);
    const want = ICMP_TYPES[e.icmp];
    if (!want) return false;
    if (t[0] !== want[0]) return false;
    if (want[1] !== undefined && t[1] !== want[1]) return false;
  }
  return true;
}

export interface AclVerdict {
  permit: boolean;
  exists: boolean;
  entry?: AclEntry;
  implicit: boolean;
}

/** Evaluate an ACL. Undefined or empty ACLs permit everything (IOS semantics for access-group). */
export function evalAcl(dev: IosDevice, name: string, pkt: AclPkt, count = true): AclVerdict {
  const acl = dev.st.cfg.acls[name];
  if (!acl) return { permit: true, exists: false, implicit: false };
  const entries = acl.entries.filter((e) => e.action !== 'remark');
  if (!entries.length) return { permit: true, exists: true, implicit: false };
  for (const e of [...entries].sort((x, y) => x.seq - y.seq)) {
    if (entryMatches(acl, e, pkt)) {
      if (count) e.matches++;
      return { permit: e.action === 'permit', exists: true, entry: e, implicit: false };
    }
  }
  return { permit: false, exists: true, implicit: true };
}

/** Standard-ACL style check used by NAT rules and VTY access-class (source address only for standard). */
export function aclMatchesForNat(dev: IosDevice, name: string, pkt: AclPkt): boolean {
  const acl = dev.st.cfg.acls[name];
  if (!acl) return false;
  for (const e of [...acl.entries].sort((x, y) => x.seq - y.seq)) {
    if (e.action === 'remark') continue;
    if (entryMatches(acl, e, pkt)) return e.action === 'permit';
  }
  return false;
}

export function aclKindForNumber(n: number): 'standard' | 'extended' | null {
  if ((n >= 1 && n <= 99) || (n >= 1300 && n <= 1999)) return 'standard';
  if ((n >= 100 && n <= 199) || (n >= 2000 && n <= 2699)) return 'extended';
  return null;
}
