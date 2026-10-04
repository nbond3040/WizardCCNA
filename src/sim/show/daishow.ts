/** Dynamic ARP Inspection show commands: `show ip arp inspection [vlan <list> | interfaces [<if>] | statistics [vlan <list>]]`. */
import type { Ctx } from '../cli/session';
import { DAI_DEFAULT_BURST, DAI_DEFAULT_RATE, daiDropped, daiForwarded, emptyDaiStats } from '../engine/dai';
import { vlanExists } from '../engine/l2';
import { ifNames, isPhysical } from '../engine/topo';
import { shortIf } from '../model/ifname';
import { pad, padL, rangesHas, rangesToList, type Ranges } from '../util/format';

function noSwitch(c: Ctx): boolean {
  if (c.dev.kind === 'router') {
    c.out.push("% Invalid input detected at '^' marker.");
    return true;
  }
  return false;
}

const onOff = (b: boolean | undefined): string => (b ? 'Enabled' : 'Disabled');

function validationFlags(c: Ctx): string[] {
  const v = c.dev.st.cfg.daiValidate;
  return ['', `Source Mac Validation      : ${onOff(v?.src)}`, `Destination Mac Validation : ${onOff(v?.dst)}`, `IP Address Validation      : ${onOff(v?.ip)}`];
}

/** The `Vlan Configuration Operation ACL Match Static ACL` and `Vlan ACL Logging DHCP Logging Probe Logging` tables. */
function configTables(c: Ctx, vlans: number[]): string[] {
  const cfg = c.dev.st.cfg;
  const out = ['', ' Vlan     Configuration    Operation   ACL Match          Static ACL', ' ----     -------------    ---------   ---------          ----------'];
  for (const v of vlans) {
    const on = rangesHas(cfg.daiVlans, v);
    const f = (cfg.daiFilters ?? []).find((x) => rangesHas(x.vlans, v));
    const oper = on && vlanExists(c.dev, v) ? 'Active' : 'Inactive';
    out.push(` ${padL(v, 4)}     ${pad(onOff(on), 17)}${pad(oper, 12)}${pad(f?.acl ?? '', 19)}${f ? (f.static ? 'Yes' : 'No') : ''}`.trimEnd());
  }
  out.push('', ' Vlan     ACL Logging      DHCP Logging      Probe Logging', ' ----     -----------      ------------      -------------');
  for (const v of vlans) out.push(` ${padL(v, 4)}     ${pad('Deny', 17)}${pad('Deny', 18)}Off`);
  return out;
}

/** The three packet-counter tables. */
function statTables(c: Ctx, vlans: number[]): string[] {
  const all = c.dev.st.dyn.daiStats ?? {};
  const st = (v: number) => all[String(v)] ?? emptyDaiStats();
  const out = ['', ' Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops', ' ----      ---------        -------     ----------      ---------'];
  for (const v of vlans) {
    const x = st(v);
    out.push(` ${padL(v, 4)}${padL(daiForwarded(x), 15)}${padL(daiDropped(x), 15)}${padL(x.dhcpDrops, 15)}${padL(x.aclDrops, 15)}`);
  }
  out.push('', ' Vlan   DHCP Permits    ACL Permits  Probe Permits   Source MAC Failures', ' ----   ------------    -----------  -------------   -------------------');
  for (const v of vlans) {
    const x = st(v);
    out.push(` ${padL(v, 4)}${padL(x.dhcpPermits, 15)}${padL(x.aclPermits, 15)}${padL(x.probePermits, 15)}${padL(x.srcMacFail, 22)}`);
  }
  out.push('', ' Vlan   Dest MAC Failures   IP Validation Failures   Invalid Protocol Data', ' ----   -----------------   ----------------------   ---------------------');
  for (const v of vlans) {
    const x = st(v);
    out.push(` ${padL(v, 4)}${padL(x.dstMacFail, 20)}${padL(x.ipFail, 25)}${padL(x.invalidProto, 24)}`);
  }
  return out;
}

/** VLANs a command talks about: the `vlan <list>` argument, else every VLAN with DAI configured. */
function vlansOf(c: Ctx, extra: number[] = []): number[] {
  const asked = c.a.vlans as Ranges | undefined;
  if (asked) return rangesToList(asked);
  return [...new Set([...rangesToList(c.dev.st.cfg.daiVlans), ...extra])].sort((x, y) => x - y);
}

/** `show ip arp inspection` (flags, configuration, logging and counters) and `... vlan <list>` (without the counters). */
export function showArpInspection(c: Ctx): void {
  if (noSwitch(c)) return;
  const vlans = vlansOf(c);
  c.out.push(...validationFlags(c), ...configTables(c, vlans));
  if (c.a.vlans === undefined) c.out.push(...statTables(c, vlans));
}

export function showArpInspectionStatistics(c: Ctx): void {
  if (noSwitch(c)) return;
  const seen = Object.keys(c.dev.st.dyn.daiStats ?? {}).map(Number);
  c.out.push(...statTables(c, vlansOf(c, seen)));
}

export function showArpInspectionInterfaces(c: Ctx): void {
  if (noSwitch(c)) return;
  const dev = c.dev;
  c.out.push('', ' Interface        Trust State     Rate (pps)    Burst Interval', ' ---------------  -----------     ----------    --------------');
  for (const n of ifNames(dev)) {
    const ic = dev.st.cfg.ifaces[n];
    if (!ic?.sw || !(isPhysical(dev, n) || n.startsWith('Port-channel'))) continue;
    if (c.a.ifn !== undefined && c.a.ifn !== n) continue;
    // trusted ports are not rate limited unless a limit was configured; untrusted ones default to 15 pps, burst interval 1 s
    const unlimited = ic.arpRate === 'none' || (ic.arpRate === undefined && ic.arpTrust);
    const rate = unlimited ? 'None' : String(ic.arpRate ?? DAI_DEFAULT_RATE);
    const burst = unlimited ? 'N/A' : String(ic.arpBurst ?? DAI_DEFAULT_BURST);
    c.out.push(` ${pad(shortIf(n), 17)}${pad(ic.arpTrust ? 'Trusted' : 'Untrusted', 16)}${padL(rate, 10)}${padL(burst, 18)}`);
  }
}
