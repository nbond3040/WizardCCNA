/**
 * Dynamic ARP Inspection (DAI).
 *
 * On a switch every ARP request/reply that enters an inspected VLAN (`ip arp inspection vlan`) through an
 * untrusted port (no `ip arp inspection trust`) is validated before the switch forwards it:
 *  1. optional header validation (`ip arp inspection validate`),
 *  2. the ARP ACL applied to the VLAN (`ip arp inspection filter <acl> vlan <list> [static]`): a `permit` match
 *     passes the packet, an explicit `deny` drops it, no match drops it too when `static` is given,
 *  3. otherwise the (sender IP, sender MAC) pair must match an entry of the DHCP snooping binding table for
 *     that VLAN and ingress port.
 * Trusted ports and VLANs outside the DAI list are never inspected. Drops and permits are counted per VLAN
 * (`show ip arp inspection statistics`) and drops are logged with `%SW_DAI-4-...` (rate limited).
 */
import type { ArpAclEntry, DaiStats, IosDevice } from '../model/state';
import { shortIf } from '../model/ifname';
import { iosClock, rangesHas } from '../util/format';
import { ipStr, isMulticast, wildcardMatches } from '../util/ip';
import { macDotted } from '../util/mac';
import type { Net } from './net';

export const DAI_DEFAULT_RATE = 15;
export const DAI_DEFAULT_BURST = 1;
/** at most one DAI syslog message per VLAN/port/kind within this much simulated time */
export const DAI_LOG_INTERVAL_MS = 5000;
export const NO_MAC = '000000000000';

export interface ArpMsg {
  kind: 'req' | 'rep';
  sip: number;
  smac: string;
  tip: number;
  tmac: string;
}

export interface DaiVerdict {
  ok: boolean;
  /** why the ARP was dropped (shown in packet traces and ping details) */
  text?: string;
}

export function emptyDaiStats(): DaiStats {
  return { dhcpPermits: 0, aclPermits: 0, probePermits: 0, dhcpDrops: 0, aclDrops: 0, srcMacFail: 0, dstMacFail: 0, ipFail: 0, invalidProto: 0 };
}

/** Counters of a VLAN (created on first use). */
export function daiStats(sw: IosDevice, vlan: number): DaiStats {
  const all = (sw.st.dyn.daiStats ??= {});
  return (all[String(vlan)] ??= emptyDaiStats());
}

export const daiForwarded = (s: DaiStats): number => s.dhcpPermits + s.aclPermits + s.probePermits;
export const daiDropped = (s: DaiStats): number => s.dhcpDrops + s.aclDrops + s.srcMacFail + s.dstMacFail + s.ipFail + s.invalidProto;

function macMatches(mac: string, pat: string, wc: string): boolean {
  for (let i = 0; i < 12; i++) {
    const diff = parseInt(mac[i], 16) ^ parseInt(pat[i], 16);
    if ((diff & ~parseInt(wc[i], 16) & 0xf) !== 0) return false;
  }
  return true;
}

function entryMatches(e: ArpAclEntry, m: ArpMsg): boolean {
  if (e.dir === 'request' && m.kind !== 'req') return false;
  if (e.dir === 'response' && m.kind !== 'rep') return false;
  if (!e.ip.any && !wildcardMatches(m.sip, e.ip.addr, e.ip.wc)) return false;
  if (!e.mac.any && !macMatches(m.smac, e.mac.mac, e.mac.wc)) return false;
  return true;
}

function bound(sw: IosDevice, vlan: number, port: string, m: ArpMsg): boolean {
  return sw.st.dyn.snoopBind.some((b) => b.vlan === vlan && b.ifName === port && b.ip === m.sip && b.mac === m.smac);
}

function stamp(net: Net, sw: IosDevice): string {
  const tz = sw.st.cfg.tz;
  return iosClock(net.devClock(sw), tz?.name ?? 'UTC', tz ? tz.h * 60 + (tz.h < 0 ? -tz.m : tz.m) : 0).replace(/\.\d{3}/, '');
}

/** `%SW_DAI-4-<tag>: 1 Invalid ARPs (Req) on Fa0/2, vlan 10.([smac/sip/tmac/tip/time])`, at most one per few seconds. */
function logDrop(net: Net, sw: IosDevice, port: string, vlan: number, m: ArpMsg, tag: string): void {
  const book = (sw.st.dyn.daiLog ??= {});
  const rec = (book[`${vlan}|${port}|${m.kind}|${tag}`] ??= { t: -DAI_LOG_INTERVAL_MS * 2, n: 0 });
  rec.n++;
  if (net.clock - rec.t < DAI_LOG_INTERVAL_MS) return;
  net.log(sw.id, `%SW_DAI-4-${tag}: ${rec.n} Invalid ARPs (${m.kind === 'req' ? 'Req' : 'Res'}) on ${shortIf(port)}, vlan ${vlan}.([${macDotted(m.smac)}/${ipStr(m.sip)}/${macDotted(m.tmac)}/${ipStr(m.tip)}/${stamp(net, sw)}])`);
  rec.t = net.clock;
  rec.n = 0;
}

function dropText(sw: IosDevice, port: string, vlan: number, m: ArpMsg, why: string): string {
  const what = m.kind === 'req' ? 'request' : 'reply';
  return `Dynamic ARP Inspection on ${sw.st.cfg.hostname} dropped the ARP ${what} from ${ipStr(m.sip)} (${macDotted(m.smac)}) on ${shortIf(port)}, VLAN ${vlan}: ${why}`;
}

/**
 * Inspect one ARP message arriving on `port` (the logical ingress port) of `sw` in `vlan`.
 * `quiet` leaves the permit counters alone (the sender already had the ARP entry cached, so a real host would
 * not have sent the ARP): the enforcement is the same, only the bookkeeping of forwarded packets differs.
 */
export function daiInspect(net: Net, sw: IosDevice, port: string, vlan: number, m: ArpMsg, quiet: boolean): DaiVerdict {
  const cfg = sw.st.cfg;
  if (!rangesHas(cfg.daiVlans, vlan)) return { ok: true };
  if (cfg.ifaces[port]?.arpTrust) return { ok: true };
  const st = daiStats(sw, vlan);
  // 1. header validation (the simulated hosts always send consistent Ethernet and ARP addresses; only `ip` can fail)
  const v = cfg.daiValidate;
  if (v?.ip) {
    const bad = (ip: number, allowZero: boolean) => (ip === 0 && !allowZero) || ip === 0xffffffff || isMulticast(ip);
    if (bad(m.sip, v.zeros) || (m.kind === 'rep' && bad(m.tip, false))) {
      st.ipFail++;
      logDrop(net, sw, port, vlan, m, 'IP_VALID_FAILURE');
      return { ok: false, text: dropText(sw, port, vlan, m, 'invalid IP address in the ARP packet') };
    }
  }
  // 2. ARP ACL of the VLAN
  let decision: 'permit' | 'deny' | undefined;
  let implicit: string | undefined;
  for (const f of cfg.daiFilters ?? []) {
    if (!rangesHas(f.vlans, vlan)) continue;
    const hit = cfg.arpAcls?.[f.acl]?.entries.find((e) => entryMatches(e, m));
    if (hit) {
      decision = hit.action;
      implicit = f.acl;
    } else if (f.static) {
      decision = 'deny';
      implicit = `${f.acl} (static, implicit deny)`;
    }
    break;
  }
  if (decision === 'permit') {
    if (!quiet) st.aclPermits++;
    return { ok: true };
  }
  if (decision === 'deny') {
    st.aclDrops++;
    logDrop(net, sw, port, vlan, m, 'ACL_DENY');
    return { ok: false, text: dropText(sw, port, vlan, m, `denied by ARP ACL ${implicit}`) };
  }
  // 3. DHCP snooping binding table
  if (bound(sw, vlan, port, m)) {
    if (!quiet) st.dhcpPermits++;
    return { ok: true };
  }
  st.dhcpDrops++;
  logDrop(net, sw, port, vlan, m, 'DHCP_SNOOPING_DENY');
  return { ok: false, text: dropText(sw, port, vlan, m, 'no matching DHCP snooping binding') };
}
