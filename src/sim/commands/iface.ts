/** Interface configuration mode (config-if, config-subif, config-if-range). */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import type { ChMode, IfCfg } from '../model/state';
import { ifDyn, newOspfCfg } from '../model/state';
import { parentOf, shortIf, typeOfName } from '../model/ifname';
import { ensureIf, isPhysical } from '../engine/topo';
import { clearErrDisable } from '../engine/errdisable';
import { bcastOf, inNet, ipStr, isMask, maskLen, netOf } from '../util/ip';
import { normRanges, rangesSubtract, rangesToList, type Ranges } from '../util/format';
import { v6Str, v6Net } from '../util/ipv6';
import { createVlan } from './global';

type IfFn = (c: Ctx, cfg: IfCfg, name: string) => void;

/** Apply a handler to every interface of the current (range) context. */
function each(fn: IfFn) {
  return (c: Ctx) => {
    for (const name of c.s.ifs) {
      const cfg = c.dev.st.cfg.ifaces[name];
      if (cfg) fn(c, cfg, name);
    }
  };
}

/** Switchport commands configured on a Port-channel propagate to its members (IOS behaviour). */
function eachSw(fn: IfFn) {
  return (c: Ctx) => {
    const seen = new Set<string>();
    for (const name of c.s.ifs) {
      const cfg = c.dev.st.cfg.ifaces[name];
      if (!cfg) continue;
      if (!cfg.sw) {
        c.out.push(name.startsWith('Vlan') || name.startsWith('Loopback') ? "% Invalid input detected at '^' marker." : `Command rejected: ${name} is not a switching port.`);
        continue;
      }
      fn(c, cfg, name);
      seen.add(name);
      if (name.startsWith('Port-channel')) {
        const g = Number(name.slice(12));
        for (const [m, mc] of Object.entries(c.dev.st.cfg.ifaces)) if (mc.channel?.group === g && !seen.has(m)) fn({ ...c, out: [] }, mc, m);
      }
    }
  };
}

const isRouterDev = (c: Ctx) => c.dev.kind === 'router';

/* ---------------- handlers ---------------- */

const description = each((c, cfg) => {
  cfg.description = c.neg ? undefined : (c.a.desc as string);
});

const shutdown = each((c, cfg, name) => {
  if (c.neg) {
    cfg.shutdown = false;
    return;
  }
  cfg.shutdown = true;
  clearErrDisable(c.dev.st.dyn.ifd[name]);
});

function ipAddress(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    if (cfg.sw) {
      c.out.push('% IP addresses may not be configured on L2 links.');
      continue;
    }
    if (c.neg) {
      if (c.a.secondary && c.a.addr !== undefined) cfg.secondary = cfg.secondary.filter((s) => s.ip !== c.a.addr);
      else {
        cfg.ip = undefined;
        cfg.secondary = [];
        cfg.dhcp = false;
        cfg.method = 'unset';
        const dd = c.dev.st.dyn.ifd[name];
        if (dd) dd.lease = undefined;
      }
      continue;
    }
    if (c.a.dhcp) {
      cfg.ip = undefined;
      cfg.secondary = [];
      cfg.dhcp = true;
      cfg.method = 'DHCP';
      continue;
    }
    const ip = c.a.addr as number;
    const mask = c.a.mask as number;
    if (!isMask(mask)) {
      c.out.push(`Bad mask 0x${mask.toString(16).toUpperCase().padStart(8, '0')} for address ${ipStr(ip)}`);
      continue;
    }
    const len = maskLen(mask);
    if (len < 31 && (ip === netOf(ip, mask) || ip === bcastOf(ip, mask))) {
      c.out.push(`Bad mask /${len} for address ${ipStr(ip)}`);
      continue;
    }
    // overlap check against other interfaces
    let clash: string | undefined;
    for (const [other, oc] of Object.entries(c.dev.st.cfg.ifaces)) {
      if (other === name || !oc.ip) continue;
      const m = Math.min(len, maskLen(oc.ip.mask));
      const mm = m <= 0 ? 0 : (0xffffffff << (32 - m)) >>> 0;
      if (netOf(ip, mm) === netOf(oc.ip.ip, mm)) {
        clash = other;
        break;
      }
    }
    if (clash && !c.a.secondary) {
      c.out.push(`% ${ipStr(netOf(ip, mask))} overlaps with ${clash}`);
      continue;
    }
    if (c.a.secondary) {
      if (!cfg.ip) {
        c.out.push('% Secondary address not allowed without primary address');
        continue;
      }
      if (!cfg.secondary.some((s) => s.ip === ip)) cfg.secondary.push({ ip, mask });
    } else {
      cfg.ip = { ip, mask };
      cfg.dhcp = false;
    }
    cfg.method = c.s.via === 'nvram' ? 'NVRAM' : 'manual';
    const dd = c.dev.st.dyn.ifd[name];
    if (dd) dd.lease = undefined;
  }
}

const helper = each((c, cfg) => {
  const h = c.a.helper as number | undefined;
  if (c.neg) cfg.helpers = h === undefined ? [] : cfg.helpers.filter((x) => x !== h);
  else if (h !== undefined && !cfg.helpers.includes(h)) cfg.helpers.push(h);
});

const accessGroup = each((c, cfg) => {
  const name = String(c.a.agname);
  const dir = c.a.out ? 'out' : 'in';
  if (dir === 'in') cfg.aclIn = c.neg ? undefined : name;
  else cfg.aclOut = c.neg ? undefined : name;
});

const natRole = each((c, cfg) => {
  const role = c.a.inside ? 'inside' : 'outside';
  if (c.neg) {
    if (cfg.nat === role) cfg.nat = undefined;
  } else cfg.nat = role;
});

function ospfIf(v6: boolean) {
  return each((c, cfg) => {
    const o = v6 ? cfg.ospf6 : cfg.ospf;
    if (c.a.opid !== undefined || c.a.oarea !== undefined) {
      if (c.neg) {
        o.pid = undefined;
        o.area = undefined;
      } else {
        o.pid = c.a.opid as number;
        o.area = c.a.oarea !== undefined ? String(c.a.oarea) : c.a.oareaip !== undefined ? ipStr(c.a.oareaip as number) : '0';
        // IOS creates the routing process on first reference from an interface
        const table = v6 ? c.dev.st.cfg.ospf6 : c.dev.st.cfg.ospf;
        if (!table[String(o.pid)]) {
          if (v6 && !c.dev.st.cfg.v6Routing && c.s.via !== 'nvram') {
            c.out.push('% IPv6 routing not enabled');
            o.pid = undefined;
            o.area = undefined;
            return;
          }
          table[String(o.pid)] = newOspfCfg(o.pid);
        }
      }
      return;
    }
    if (c.a.cost !== undefined || c.a.costkw) o.cost = c.neg ? undefined : (c.a.cost as number);
    else if (c.a.prio !== undefined || c.a.priokw) o.priority = c.neg ? undefined : (c.a.prio as number);
    else if (c.a.hello !== undefined || c.a.hellokw) o.hello = c.neg ? undefined : (c.a.hello as number);
    else if (c.a.dead !== undefined || c.a.deadkw) o.dead = c.neg ? undefined : (c.a.dead as number);
    else if (c.a.ntype !== undefined || c.a.ntkw) o.net = c.neg ? undefined : (c.a.ntype as IfCfg['ospf']['net']);
    else if (c.a.mtuignore) o.mtuIgnore = !c.neg;
  });
}

const proxyArp = each((c, cfg) => {
  cfg.proxyArp = !c.neg;
});
const redirects = each((c, cfg) => {
  cfg.redirects = !c.neg;
});
const ipMtu = each((c, cfg) => {
  cfg.ipMtu = c.neg ? undefined : (c.a.ipmtu as number);
});

const snoopTrust = each((c, cfg) => {
  cfg.snoopTrust = !c.neg;
});
const snoopRate = each((c, cfg) => {
  cfg.snoopRate = c.neg ? undefined : (c.a.rate as number);
});
const arpTrust = each((c, cfg) => {
  cfg.arpTrust = !c.neg;
});
/** `ip arp inspection limit {rate <pps> [burst interval <s>] | none}`; `no ...` restores the default (15 pps untrusted) */
const arpLimit = each((c, cfg) => {
  if (c.neg) {
    cfg.arpRate = undefined;
    cfg.arpBurst = undefined;
    return;
  }
  if (c.a.arpnone) {
    cfg.arpRate = 'none';
    cfg.arpBurst = undefined;
    return;
  }
  cfg.arpRate = c.a.arate as number;
  cfg.arpBurst = c.a.aburst as number | undefined;
});

function extraLine(text: (c: Ctx) => string) {
  return each((c, cfg) => {
    const line = text(c);
    const base = line.split(' ').slice(0, 3).join(' ');
    cfg.extra = cfg.extra.filter((x) => x !== line && !(c.neg && x.startsWith(base)));
    if (!c.neg) cfg.extra.push(line);
  });
}

const v6Address = each((c, cfg) => {
  if (c.a.autoconfig) {
    cfg.v6Auto = !c.neg;
    return;
  }
  if (c.neg && c.a.v6 === undefined && c.a.v6ll === undefined) {
    cfg.v6 = [];
    cfg.v6Auto = false;
    return;
  }
  if (c.a.v6ll !== undefined) {
    const addr = v6Str(c.a.v6ll as bigint);
    if (!addr.startsWith('fe80')) {
      c.out.push('% Invalid link-local address');
      return;
    }
    cfg.v6 = cfg.v6.filter((x) => !x.linkLocal);
    if (!c.neg) cfg.v6.push({ addr, len: 64, eui64: false, linkLocal: true });
    return;
  }
  const p = c.a.v6 as { addr: bigint; len: number };
  const eui = !!c.a.eui;
  const addr = v6Str(eui ? v6Net(p.addr, 64) : p.addr);
  if (c.neg) {
    cfg.v6 = cfg.v6.filter((x) => !(x.addr === addr && x.len === p.len));
    return;
  }
  if (cfg.v6.some((x) => x.addr === addr && x.len === p.len)) return;
  cfg.v6.push({ addr, len: p.len, eui64: eui, linkLocal: false, anycast: !!c.a.anycast });
});

const v6Enable = each((c, cfg) => {
  cfg.v6Enabled = !c.neg;
});

const v6Filter = each((c, cfg) => {
  const name = c.a.v6f as string;
  if (c.a.out) cfg.v6AclOut = c.neg ? undefined : name;
  else cfg.v6AclIn = c.neg ? undefined : name;
});

function speedRun(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    const ph = c.dev.hw.ifaces.find((p) => p.name === name);
    const v = c.neg ? 'auto' : String(Object.keys(c.a).find((x) => x.startsWith('sp='))?.split('=')[1] ?? 'auto');
    if (ph && v !== 'auto' && Number(v) > ph.speed) {
      c.out.push(`% Invalid input detected at '^' marker.`);
      continue;
    }
    cfg.speed = v;
  }
}

const duplexRun = each((c, cfg) => {
  cfg.duplex = c.neg ? 'auto' : String(Object.keys(c.a).find((x) => x.startsWith('dx='))?.split('=')[1] ?? 'auto');
});

const bandwidth = each((c, cfg) => {
  cfg.bandwidth = c.neg ? undefined : (c.a.bw as number);
});
const delay = each((c, cfg) => {
  cfg.delay = c.neg ? undefined : (c.a.delay as number);
});
const mtu = each((c, cfg) => {
  cfg.mtu = c.neg ? undefined : (c.a.mtu as number);
});

function encapDot1q(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    if (c.neg) {
      cfg.dot1q = undefined;
      continue;
    }
    const vlan = c.a.evlan as number;
    const parent = parentOf(name) ?? name;
    const dup = Object.values(c.dev.st.cfg.ifaces).find((x) => x.name !== name && (parentOf(x.name) ?? x.name) === parent && x.dot1q?.vlan === vlan);
    if (dup) {
      c.out.push(`Configuration of multiple subinterfaces of the same main\ninterface with the same VID (${vlan}) is not permitted.\nThis VID is already configured on ${dup.name}.`);
      continue;
    }
    if (c.a.native) {
      const nat = Object.values(c.dev.st.cfg.ifaces).find((x) => x.name !== name && (parentOf(x.name) ?? x.name) === parent && x.dot1q?.native);
      if (nat) {
        c.out.push(`% Native VLAN is already configured on ${nat.name}`);
        continue;
      }
    }
    cfg.dot1q = { vlan, native: !!c.a.native };
  }
}

const serialEncap = each((c, cfg) => {
  cfg.serialEncap = c.neg ? 'hdlc' : c.a.ppp ? 'ppp' : 'hdlc';
});

const clockRate = each((c, cfg) => {
  cfg.clockRate = c.neg ? undefined : (c.a.rate as number);
});

/* ---------------- switchport ---------------- */

function swMode(c: Ctx): void {
  const mode = Object.keys(c.a).find((x) => x.startsWith('swm='))?.split('=')[1] as IfCfg['mode'] | undefined;
  eachSw((cc, cfg, name) => {
    if (cc.neg) {
      cfg.mode = 'dynamic auto';
      return;
    }
    if (!mode) return;
    if (mode === 'trunk' && cfg.trunkEncap === 'negotiate') {
      cc.out.push('Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.');
      return;
    }
    if (mode.startsWith('dynamic') && cfg.nonegotiate) {
      cc.out.push(`Command rejected: Conflict between 'nonegotiate' and 'dynamic' status on this interface: ${shortIf(name)}`);
      return;
    }
    if (mode.startsWith('dynamic') && cfg.ps.enabled) {
      cc.out.push(`Command rejected: ${name} is a port-security enabled port.`);
      return;
    }
    cfg.mode = mode;
  })(c);
}

function swAccessVlan(c: Ctx): void {
  const v = c.a.avlan as number | undefined;
  if (!c.neg && v !== undefined && !c.dev.st.vlans[String(v)]) {
    if (c.dev.st.cfg.vtp.mode !== 'client') {
      if (c.s.via !== 'nvram') c.out.push(`% Access VLAN does not exist. Creating vlan ${v}`);
      createVlan(c, v);
    }
  }
  eachSw((cc, cfg) => {
    cfg.accessVlan = cc.neg || v === undefined ? 1 : v;
  })(c);
}

function swVoiceVlan(c: Ctx): void {
  const v = c.a.vvlan as number | undefined;
  if (!c.neg && v !== undefined && !c.dev.st.vlans[String(v)] && c.dev.st.cfg.vtp.mode !== 'client') {
    if (c.s.via !== 'nvram') c.out.push(`% Voice VLAN does not exist. Creating vlan ${v}`);
    createVlan(c, v);
  }
  eachSw((cc, cfg) => {
    cfg.voiceVlan = cc.neg || c.a.vnone ? undefined : v;
  })(c);
}

function swNative(c: Ctx): void {
  eachSw((cc, cfg) => {
    cfg.nativeVlan = cc.neg ? 1 : (c.a.nvlan as number);
  })(c);
}

function swAllowed(c: Ctx): void {
  eachSw((cc, cfg) => {
    if (cc.neg) {
      cfg.allowed = [[1, 4094]];
      return;
    }
    const list = c.a.alist as Ranges | undefined;
    if (c.a.all) cfg.allowed = [[1, 4094]];
    else if (c.a.none) cfg.allowed = [];
    else if (c.a.add && list) cfg.allowed = normRanges([...cfg.allowed, ...list]);
    else if (c.a.remove && list) cfg.allowed = rangesSubtract(cfg.allowed, list);
    else if (c.a.except && list) cfg.allowed = rangesSubtract([[1, 4094]], list);
    else if (list) cfg.allowed = list;
  })(c);
}

function swEncap(c: Ctx): void {
  eachSw((cc, cfg) => {
    if (cc.neg) {
      cfg.trunkEncap = c.dev.model === 'c3650' ? 'negotiate' : 'dot1q';
      return;
    }
    const e = c.a.isl ? 'isl' : c.a.negotiate ? 'negotiate' : 'dot1q';
    if (e === 'negotiate' && cfg.mode === 'trunk') {
      cc.out.push('Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.');
      return;
    }
    cfg.trunkEncap = e;
  })(c);
}

function swNonegotiate(c: Ctx): void {
  eachSw((cc, cfg, name) => {
    if (!cc.neg && cfg.mode.startsWith('dynamic')) {
      cc.out.push(`Command rejected: Conflict between 'nonegotiate' and 'dynamic' status on this interface: ${shortIf(name)}`);
      return;
    }
    cfg.nonegotiate = !cc.neg;
  })(c);
}

function swSwitchport(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    if (c.dev.kind === 'router') continue;
    if (!isPhysical(c.dev, name) && !name.startsWith('Port-channel')) {
      c.out.push("% Invalid input detected at '^' marker.");
      continue;
    }
    if (c.neg) {
      if (c.dev.kind === 'switch') {
        c.out.push("% Invalid input detected at '^' marker.");
        continue;
      }
      cfg.sw = false;
    } else {
      cfg.sw = true;
      cfg.ip = undefined;
      cfg.secondary = [];
    }
  }
}

function portSecurity(c: Ctx): void {
  eachSw((cc, cfg, name) => {
    const ps = cfg.ps;
    if (c.a.max !== undefined || c.a.maxkw) {
      ps.max = cc.neg ? undefined : (c.a.max as number);
      return;
    }
    if (c.a.violkw) {
      const v = Object.keys(c.a).find((x) => x.startsWith('viol='))?.split('=')[1] as 'shutdown' | 'restrict' | 'protect' | undefined;
      ps.violation = cc.neg ? undefined : v;
      return;
    }
    if (c.a.agingkw) {
      ps.aging = cc.neg ? undefined : (c.a.aging as number);
      return;
    }
    if (c.a.mackw) {
      if (c.a.sticky && c.a.mac === undefined) {
        ps.sticky = !cc.neg;
        if (cc.neg) ps.macs = ps.macs.filter((m) => !m.sticky);
        else {
          // convert dynamically learned secure addresses to sticky
          const dd = ifDyn(c.dev, name);
          for (const l of dd.psLearned) if (!ps.macs.some((m) => m.mac === l.mac)) ps.macs.push({ mac: l.mac, vlan: l.vlan, sticky: true });
          dd.psLearned = [];
        }
        return;
      }
      const mac = c.a.mac as string;
      if (cc.neg) {
        ps.macs = ps.macs.filter((m) => m.mac !== mac);
        return;
      }
      if (!ps.macs.some((m) => m.mac === mac)) ps.macs.push({ mac, vlan: c.a.psvlan as number | undefined, sticky: !!c.a.sticky });
      return;
    }
    if (!cc.neg && cfg.mode.startsWith('dynamic')) {
      cc.out.push(`Command rejected: ${name} is a dynamic port.`);
      return;
    }
    ps.enabled = !cc.neg;
    if (cc.neg) {
      const dd = ifDyn(c.dev, name);
      dd.psLearned = [];
    }
  })(c);
}

function channelGroup(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    if (!isPhysical(c.dev, name)) {
      c.out.push("% Invalid input detected at '^' marker.");
      continue;
    }
    if (c.neg) {
      cfg.channel = undefined;
      continue;
    }
    const group = c.a.group as number;
    const mode = Object.keys(c.a).find((x) => x.startsWith('chm='))?.split('=')[1] as ChMode;
    const [lo, hi] = c.dev.hw.poRange;
    if (group < lo || group > hi) {
      c.out.push("% Invalid input detected at '^' marker.");
      continue;
    }
    const proto = (m: ChMode) => (m === 'active' || m === 'passive' ? 'lacp' : m === 'on' ? 'on' : 'pagp');
    const other = Object.values(c.dev.st.cfg.ifaces).find((x) => x.name !== name && x.channel?.group === group);
    if (other && proto(other.channel!.mode) !== proto(mode)) {
      c.out.push(`Command rejected (Port-channel${group}, ${shortIf(name)}): Invalid etherchnl mode`);
      continue;
    }
    const po = `Port-channel${group}`;
    if (!c.dev.st.cfg.ifaces[po]) {
      const pc = ensureIf(c.dev, po);
      if (c.s.via !== 'nvram') c.out.push(`Creating a port-channel interface Port-channel ${group}`);
      pc.sw = cfg.sw;
      pc.mode = cfg.mode;
      pc.accessVlan = cfg.accessVlan;
      pc.nativeVlan = cfg.nativeVlan;
      pc.allowed = cfg.allowed;
      pc.trunkEncap = cfg.trunkEncap;
      pc.nonegotiate = cfg.nonegotiate;
    }
    cfg.channel = { group, mode };
  }
}

function stpIf(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    const s = cfg.stp;
    if (c.a.portfast) {
      if (c.neg) s.portfast = undefined;
      else if (c.a.trunk) s.portfast = 'trunk';
      else if (c.a.disable) s.portfast = 'disable';
      else {
        s.portfast = 'edge';
        if (c.io.interactive) {
          c.out.push('%Warning: portfast should only be enabled on ports connected to a single', ' host. Connecting hubs, concentrators, switches, bridges, etc... to this', ' interface  when portfast is enabled, can cause temporary bridging loops.', ' Use with CAUTION', '');
          if (cfg.mode !== 'access') c.out.push(`%Portfast has been configured on ${name} but will only`, ' have effect when the interface is in a non-trunking mode.');
          else c.out.push(`%Portfast has been configured on ${name} but will only`, ' have effect when the interface is in a non-trunking mode.');
        }
      }
    } else if (c.a.bpduguard) s.bpduguard = c.neg ? undefined : c.a.disable ? 'disable' : 'enable';
    else if (c.a.bpdufilter) s.bpdufilter = c.neg ? undefined : c.a.disable ? 'disable' : 'enable';
    else if (c.a.guard) s.guard = c.neg ? undefined : ((Object.keys(c.a).find((x) => x.startsWith('g='))?.split('=')[1] as 'root' | 'loop' | 'none') ?? 'none');
    else if (c.a.svlan !== undefined) {
      for (const v of rangesToList(c.a.svlan as Ranges)) {
        if (c.a.pcost !== undefined || c.a.costkw) {
          if (c.neg) delete s.vlanCost[String(v)];
          else s.vlanCost[String(v)] = c.a.pcost as number;
        } else {
          if (c.neg) delete s.vlanPrio[String(v)];
          else s.vlanPrio[String(v)] = c.a.pprio as number;
        }
      }
    } else if (c.a.pcost !== undefined || c.a.costkw) s.cost = c.neg ? undefined : (c.a.pcost as number);
    else if (c.a.pprio !== undefined || c.a.priokw) {
      const p = c.a.pprio as number;
      if (!c.neg && p % 16 !== 0) {
        c.out.push('% Port Priority in increments of 16 is required');
        continue;
      }
      s.prio = c.neg ? undefined : p;
    } else if (c.a.linktype) s.link = c.neg ? undefined : c.a.shared ? 'shared' : 'point-to-point';
  }
}

function standby(c: Ctx): void {
  for (const name of c.s.ifs) {
    const cfg = c.dev.st.cfg.ifaces[name];
    if (!cfg) continue;
    if (c.a.version !== undefined) {
      cfg.hsrpVer = c.neg ? 1 : (c.a.version as 1 | 2);
      continue;
    }
    const g = String(c.a.sgroup ?? 0);
    if (c.neg && !c.a.ipkw && !c.a.priokw && !c.a.preempt && !c.a.namekw && !c.a.timers && !c.a.track) {
      delete cfg.hsrp[g];
      continue;
    }
    const grp = (cfg.hsrp[g] ??= {});
    if (c.a.ipkw) {
      if (c.neg) {
        delete cfg.hsrp[g];
        continue;
      }
      if (c.a.vip !== undefined) {
        const vip = c.a.vip as number;
        if (cfg.ip && !inNet(vip, cfg.ip.ip, cfg.ip.mask)) {
          c.out.push(`% Warning: address is not within a subnet on this interface`);
        }
        grp.ip = vip;
      }
    } else if (c.a.priokw) grp.priority = c.neg ? undefined : (c.a.sprio as number);
    else if (c.a.preempt) grp.preempt = !c.neg;
    else if (c.a.namekw) grp.name = c.neg ? undefined : (c.a.sname as string);
    else if (c.a.timers) {
      grp.hello = c.neg ? undefined : (c.a.hello as number);
      grp.hold = c.neg ? undefined : (c.a.hold as number);
    }
  }
}

const cdpEnable = each((c, cfg) => {
  cfg.cdp = !c.neg;
});
const lldpTx = each((c, cfg) => {
  if (c.a.transmit) cfg.lldpTx = !c.neg;
  else cfg.lldpRx = !c.neg;
});
const powerInline = each((c, cfg) => {
  cfg.poe = c.neg ? 'auto' : ((Object.keys(c.a).find((x) => x.startsWith('poe='))?.split('=')[1] as IfCfg['poe']) ?? 'auto');
});
const storm = each((c, cfg) => {
  if (c.a.actionkw) {
    cfg.storm.action = c.neg ? undefined : c.a.trap ? 'trap' : 'shutdown';
    return;
  }
  const kind = c.a.broadcast ? 'broadcast' : c.a.multicast ? 'multicast' : 'unicast';
  cfg.storm[kind] = c.neg ? undefined : String(c.a.level);
});
const lacpRate = each((c, cfg) => {
  cfg.lacpRate = c.neg ? undefined : c.a.fast ? 'fast' : 'normal';
});

function silent(): void {
  /* accepted */
}

/* ---------------- tree ---------------- */

let roots: Node[] | null = null;

export function ifRoots(): Node[] {
  if (roots) return roots;
  const ipv4 = (help: string, key: string, run?: (c: Ctx) => void, sub?: Node[] | (() => Node[])) => a('ipv4', 'A.B.C.D', help, { key, run }, sub);
  const sw = { when: (e: { is(f: string): boolean }) => e.is('switch') };
  const areaNodes = (run: (c: Ctx) => void): Node[] => [num(0, 4294967295, 'OSPF area ID as a decimal value', { key: 'oarea', run }), a('ipv4', 'A.B.C.D', 'OSPF area ID in IP address format', { key: 'oareaip', run })];
  const ospfNodes = (run: (c: Ctx) => void, v6: boolean): Node[] => [
    num(1, 65535, 'Process ID', { key: 'opid' }, [k('area', 'Set the OSPF area ID', areaNodes(run))]),
    k('cost', 'Interface cost', { key: 'costkw', nr: run }, [num(1, 65535, 'Cost', { key: 'cost', run })]),
    k('dead-interval', 'Interval after which a neighbor is declared dead', { key: 'deadkw', nr: run }, [num(1, 65535, 'Seconds', { key: 'dead', run })]),
    k('hello-interval', 'Time between HELLO packets', { key: 'hellokw', nr: run }, [num(1, 65535, 'Seconds', { key: 'hello', run })]),
    k('mtu-ignore', 'Ignores the MTU in DBD packets', { key: 'mtuignore', run }),
    k('network', 'Network type', { key: 'ntkw', nr: run }, [
      k('broadcast', 'Specify OSPF broadcast multi-access network', { key: 'ntype', run: (c: Ctx) => { c.a.ntype = 'broadcast'; run(c); } }),
      k('non-broadcast', 'Specify OSPF NBMA network', { key: 'ntype', run: (c: Ctx) => { c.a.ntype = 'non-broadcast'; run(c); } }),
      k('point-to-multipoint', 'Specify OSPF point-to-multipoint network', { key: 'ntype', run: (c: Ctx) => { c.a.ntype = 'point-to-multipoint'; run(c); } }),
      k('point-to-point', 'Specify OSPF point-to-point network', { key: 'ntype', run: (c: Ctx) => { c.a.ntype = 'point-to-point'; run(c); } }),
    ]),
    k('priority', 'Router priority', { key: 'priokw', nr: run }, [num(0, 255, 'Priority', { key: 'prio', run })]),
    ...(v6 ? [] : [
      k('authentication', 'Enable authentication', { run: extraLine((c) => `ip ospf authentication${c.a.md ? ' message-digest' : c.a.nullauth ? ' null' : ''}`) }, [
        k('message-digest', 'Use message-digest authentication', { key: 'md', run: extraLine(() => 'ip ospf authentication message-digest') }),
        k('null', 'Use no authentication', { key: 'nullauth', run: extraLine(() => 'ip ospf authentication null') }),
      ]),
      k('authentication-key', 'Authentication password (key)', [a('line', 'LINE', 'The OSPF password (key) (only the first 8 characters are used)', { key: 'akey', run: extraLine((c) => `ip ospf authentication-key ${c.a.akey}`) })]),
      k('message-digest-key', 'Message digest authentication password (key)', [num(1, 255, 'Key ID', { key: 'kid' }, [k('md5', 'Use MD5 algorithm', [a('line', 'LINE', 'The OSPF password (key)', { key: 'mkey', run: extraLine((c) => `ip ospf message-digest-key ${c.a.kid} md5 ${c.a.mkey}`) })])])]),
    ]),
  ];
  const v4ospf = ospfIf(false);
  const v6ospf = ospfIf(true);
  const allowedTail = (): Node[] => [a('vlanlist', 'WORD', 'VLAN IDs of the allowed VLANs when this port is in trunking mode', { key: 'alist', run: swAllowed })];

  roots = [
    k('arp', 'Set arp type (arpa, probe, snap) or timeout or log options', [k('timeout', 'Set ARP cache timeout', [num(0, 2147483, 'Seconds', { key: 'arpt', run: extraLine((c) => `arp timeout ${c.a.arpt}`) })])]),
    k('bandwidth', 'Set bandwidth informational parameter', { nr: bandwidth }, [num(1, 10000000, 'Bandwidth in kilobits', { key: 'bw', run: bandwidth })]),
    k('cdp', 'CDP interface subcommands', [k('enable', 'Enable CDP on interface', { run: cdpEnable })]),
    k('channel-group', 'Etherchannel/port bundling configuration', { nr: channelGroup }, [
      num(1, 128, 'Channel group number', { key: 'group', nr: channelGroup }, [
        k('mode', 'Etherchannel Mode of the interface', [
          k('active', 'Enable LACP unconditionally', { key: 'chm=active', run: channelGroup }),
          k('auto', 'Enable PAgP only if a PAgP device is detected', { key: 'chm=auto', run: channelGroup, when: (e) => e.is('switch') }),
          k('desirable', 'Enable PAgP unconditionally', { key: 'chm=desirable', run: channelGroup, when: (e) => e.is('switch') }),
          k('on', 'Enable Etherchannel only', { key: 'chm=on', run: channelGroup }),
          k('passive', 'Enable LACP only if a LACP device is detected', { key: 'chm=passive', run: channelGroup }),
        ]),
      ]),
    ]),
    k('clock', 'Configure serial interface clock', [k('rate', 'Configure serial interface clock speed', [num(300, 8000000, 'Choose clockrate from list above', { key: 'rate', run: clockRate })])]),
    k('delay', 'Specify interface throughput delay', { nr: delay }, [num(1, 16777215, 'Throughput delay (tens of microseconds)', { key: 'delay', run: delay })]),
    k('description', 'Interface specific description', { nr: description }, [a('line', 'LINE', 'Up to 240 characters describing this interface', { key: 'desc', run: description })]),
    k('duplex', 'Configure duplex operation.', { nr: duplexRun }, [
      k('auto', 'Enable AUTO duplex configuration', { key: 'dx=auto', run: duplexRun }),
      k('full', 'Force full duplex operation', { key: 'dx=full', run: duplexRun }),
      k('half', 'Force half-duplex operation', { key: 'dx=half', run: duplexRun }),
    ]),
    k('encapsulation', 'Set encapsulation type for an interface', { when: (e) => e.is('router') }, [
      k('dot1Q', 'IEEE 802.1Q Virtual LAN', { nr: encapDot1q }, [num(1, 4094, 'IEEE 802.1Q VLAN ID', { key: 'evlan', run: encapDot1q }, [k('native', 'Make this as native vlan', { run: encapDot1q })])]),
      k('hdlc', 'Serial HDLC synchronous', { run: serialEncap }),
      k('ppp', 'Point-to-Point protocol', { run: serialEncap }),
    ]),
    k('ip', 'Interface Internet Protocol config commands', [
      k('access-group', 'Specify access control for packets', [
        a('word', '<1-2699>', 'IP access list (standard or extended)', { key: 'agname' }, [k('in', 'inbound packets', { run: accessGroup }), k('out', 'outbound packets', { run: accessGroup })]),
      ]),
      k('address', 'Set the IP address of an interface', { nr: ipAddress }, [
        ipv4('IP address', 'addr', undefined, [ipv4('IP subnet mask', 'mask', ipAddress, [k('secondary', 'Make this IP address a secondary address', { run: ipAddress })])]),
        k('dhcp', 'IP Address negotiated via DHCP', { run: ipAddress }),
      ]),
      k('arp', 'Configure ARP features', { when: (e) => e.is('switch') }, [
        k('inspection', 'Arp Inspection configuration', [
          k('limit', 'Configure Rate limit of incoming ARP packets', { nr: arpLimit }, [
            k('none', 'No limit on the rate of incoming ARP packets', { key: 'arpnone', run: arpLimit }),
            k('rate', 'Set the rate limit value', { nr: arpLimit }, [
              k('none', 'No limit on the rate of incoming ARP packets', { key: 'arpnone', run: arpLimit }),
              num(0, 2048, 'Rate limit in packets per second (pps)', { key: 'arate', run: arpLimit }, [
                k('burst', 'Configure Burst parameters', [k('interval', 'Burst interval', [num(1, 15, 'Burst interval in seconds', { key: 'aburst', run: arpLimit })])]),
              ]),
            ]),
          ]),
          k('trust', 'Configure Trust state', { run: arpTrust }),
        ]),
      ]),
      k('dhcp', 'Configure DHCP parameters for this interface', [
        k('relay', 'DHCP relay configuration', [k('information', 'DHCP relay information option', [k('trusted', 'Received DHCP packets may contain relay info option with zero giaddr', { run: extraLine(() => 'ip dhcp relay information trusted') })])]),
        k('snooping', 'DHCP Snooping', { when: (e) => e.is('switch') }, [
          k('limit', 'DHCP Snooping limit', [k('rate', 'DHCP Snooping limit rate', [num(1, 2048, 'DHCP snooping rate limit', { key: 'rate', run: snoopRate })])]),
          k('trust', 'DHCP Snooping trust config', { run: snoopTrust }),
        ]),
      ]),
      k('helper-address', 'Specify a destination address for UDP broadcasts', { nr: helper }, [ipv4('IP destination address', 'helper', helper)]),
      k('mtu', 'Set IP Maximum Transmission Unit', { nr: ipMtu }, [num(68, 9198, 'MTU (bytes)', { key: 'ipmtu', run: ipMtu })]),
      k('nat', 'NAT interface commands', [k('inside', 'Inside interface for address translation', { run: natRole }), k('outside', 'Outside interface for address translation', { run: natRole })]),
      k('ospf', 'OSPF interface commands', ospfNodes(v4ospf, false)),
      k('proxy-arp', 'Enable proxy ARP', { run: proxyArp }),
      k('redirects', 'Enable sending ICMP Redirect messages', { run: redirects }),
      k('route-cache', 'Enable fast-switching cache for outgoing packets', { hide: true, run: silent }),
      k('unreachables', 'Enable sending ICMP Unreachable messages', { run: extraLine(() => 'ip unreachables') }),
      k('virtual-reassembly', 'Virtual Reassembly', { hide: true, run: silent }),
    ]),
    k('ipv6', 'IPv6 interface subcommands', [
      k('address', 'Configure IPv6 address on interface', { nr: v6Address }, [
        a('ipv6pfx', 'X:X:X:X::X/<0-128>', 'IPv6 prefix', { key: 'v6', run: v6Address }, [k('anycast', 'Configure as an anycast', { run: v6Address }), k('eui-64', 'Use eui-64 interface identifier', { key: 'eui', run: v6Address })]),
        a('ipv6', 'X:X:X:X::X', 'IPv6 link-local address', { key: 'v6ll' }, [k('link-local', 'Use link-local address', { run: v6Address })]),
        k('autoconfig', 'Obtain address using autoconfiguration', { run: v6Address }, [k('default', 'Insert default route', { run: v6Address })]),
        k('dhcp', 'Obtain a ipv6 address using dhcp', { run: extraLine(() => 'ipv6 address dhcp') }),
      ]),
      k('enable', 'Enable IPv6 on interface', { run: v6Enable }),
      k('nd', 'IPv6 interface Neighbor Discovery subcommands', [a('line', 'LINE', 'ND parameters', { key: 'nd', run: extraLine((c) => `ipv6 nd ${c.a.nd}`) })]),
      k('ospf', 'OSPF interface commands', ospfNodes(v6ospf, true)),
      k('traffic-filter', 'Access control list for packets', [a('word', 'WORD', 'Access-list name', { key: 'v6f' }, [k('in', 'inbound packets', { run: v6Filter }), k('out', 'outbound packets', { run: v6Filter })])]),
    ]),
    k('lacp', 'LACP interface subcommands', { when: (e) => e.is('switch') }, [
      k('port-priority', 'LACP priority on this interface', [num(1, 65535, 'Priority', { key: 'lpp', run: extraLine((c) => `lacp port-priority ${c.a.lpp}`) })]),
      k('rate', 'Rate at which LACP packets are sent', [k('fast', 'Request LACP packets are sent at the fast rate', { run: lacpRate }), k('normal', 'Request LACP packets are sent at the normal rate', { run: lacpRate })]),
    ]),
    k('lldp', 'LLDP interface subcommands', [k('receive', 'Enable LLDP reception on interface', { key: 'receive', run: lldpTx }), k('transmit', 'Enable LLDP transmission on interface', { key: 'transmit', run: lldpTx })]),
    k('mtu', 'Set the interface Maximum Transmission Unit (MTU)', { nr: mtu }, [num(64, 9216, 'MTU size in bytes', { key: 'mtu', run: mtu })]),
    k('negotiation', 'Select Autonegotiation mode', { when: (e) => e.is('xe') && e.is('router') }, [k('auto', 'Enable link autonegotiation', { run: (c: Ctx) => { if (!c.neg) { for (const n of c.s.ifs) { const x = c.dev.st.cfg.ifaces[n]; if (x) { x.speed = 'auto'; x.duplex = 'auto'; } } } } })]),
    k('power', 'Power configuration', sw, [k('inline', 'Inline power configuration', [
      k('auto', 'Automatically detect and power inline devices', { key: 'poe=auto', run: powerInline }),
      k('never', 'Never apply inline power', { key: 'poe=never', run: powerInline }),
      k('static', 'High priority inline power interface', { key: 'poe=static', run: powerInline }),
    ])]),
    k('shutdown', 'Shutdown the selected interface', { run: shutdown }),
    k('spanning-tree', 'Spanning Tree Subsystem', sw, [
      k('bpdufilter', "Don't send or receive BPDUs on this interface", { nr: stpIf }, [k('disable', 'Disable BPDU filtering for this interface', { run: stpIf }), k('enable', 'Enable BPDU filtering for this interface', { run: stpIf })]),
      k('bpduguard', "Don't accept BPDUs on this interface", { nr: stpIf }, [k('disable', 'Disable BPDU guard for this interface', { run: stpIf }), k('enable', 'Enable BPDU guard for this interface', { run: stpIf })]),
      k('cost', 'Change an interface\'s spanning tree port path cost', { key: 'costkw', nr: stpIf }, [num(1, 200000000, 'port path cost', { key: 'pcost', run: stpIf })]),
      k('guard', 'Change an interface\'s spanning tree guard mode', { nr: stpIf }, [k('loop', 'Set guard mode to loop guard on interface', { key: 'g=loop', run: stpIf }), k('none', 'Set guard mode to none', { key: 'g=none', run: stpIf }), k('root', 'Set guard mode to root guard on interface', { key: 'g=root', run: stpIf })]),
      k('link-type', 'Specify a link type for spanning tree protocol use', { key: 'linktype', nr: stpIf }, [k('point-to-point', 'Consider the interface as point-to-point', { run: stpIf }), k('shared', 'Consider the interface as shared', { run: stpIf })]),
      k('portfast', 'Portfast options for the interface', { run: stpIf }, [k('disable', 'Disable portfast for this interface', { run: stpIf }), k('edge', 'Enable portfast edge on the interface', { run: stpIf }, [k('trunk', 'Enable portfast edge on the interface even in trunk mode', { run: stpIf })]), k('trunk', 'Enable portfast on the interface even in trunk mode', { run: stpIf })]),
      k('port-priority', 'Change an interface\'s spanning tree port priority', { key: 'priokw', nr: stpIf }, [num(0, 240, 'port priority in increments of 16', { key: 'pprio', run: stpIf })]),
      k('vlan', 'VLAN Switch Spanning Tree', [a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'svlan' }, [k('cost', 'Change an interface\'s per VLAN spanning tree path cost', { key: 'costkw', nr: stpIf }, [num(1, 200000000, 'Change an interface\'s per VLAN spanning tree path cost', { key: 'pcost', run: stpIf })]), k('port-priority', 'Change an interface\'s spanning tree port priority', { key: 'priokw', nr: stpIf }, [num(0, 240, 'port priority in increments of 16', { key: 'pprio', run: stpIf })])])]),
    ]),
    k('speed', 'Configure speed operation.', { nr: speedRun }, [
      k('10', 'Force 10 Mbps operation', { key: 'sp=10', run: speedRun }),
      k('100', 'Force 100 Mbps operation', { key: 'sp=100', run: speedRun }),
      k('1000', 'Force 1000 Mbps operation', { key: 'sp=1000', run: speedRun }),
      k('auto', 'Enable AUTO speed configuration', { key: 'sp=auto', run: speedRun }),
    ]),
    k('standby', 'HSRP interface configuration commands', { when: (e) => e.is('l3') }, () => {
      const groupCmds = (): Node[] => [
        k('ip', 'Enable HSRP and set the virtual IP address', { key: 'ipkw', run: standby }, [ipv4('Virtual IP address', 'vip', standby, [k('secondary', 'Make this IP address a secondary virtual IP address', { run: standby })])]),
        k('name', 'Redundancy name string', { key: 'namekw', nr: standby }, [a('word', 'WORD', 'name string', { key: 'sname', run: standby })]),
        k('preempt', 'Overthrow lower priority Active routers', { run: standby }, [k('delay', 'Wait before preempting', [k('minimum', 'Delay at least this long', [num(0, 3600, 'Number of seconds for minimum delay', { key: 'pdelay', run: standby })])])]),
        k('priority', 'Priority level', { key: 'priokw', nr: standby }, [num(0, 255, 'Priority value', { key: 'sprio', run: standby })]),
        k('timers', 'Hello and hold timers', { nr: standby }, [num(1, 254, 'Hello interval in seconds', { key: 'hello' }, [num(1, 255, 'Hold time in seconds', { key: 'hold', run: standby })])]),
        k('track', 'Priority tracking', [a('line', 'LINE', 'Tracked object', { key: 'trk', run: silent })]),
      ];
      return [
        num(0, 4095, 'group number', { key: 'sgroup', nr: standby }, groupCmds),
        k('version', 'HSRP version', [num(1, 2, 'Version', { key: 'version', run: standby })]),
        ...groupCmds(),
      ];
    }),
    k('storm-control', 'storm configuration', sw, [
      k('action', 'Action to take for storm-control', { key: 'actionkw', nr: storm }, [k('shutdown', 'Shutdown this interface if a storm occurs', { run: storm }), k('trap', 'Send SNMP trap if a storm occurs', { run: storm })]),
      k('broadcast', 'Broadcast address storm control', [k('level', 'Set storm suppression level on this interface', [a('word', '<0.00 - 100.00>', 'Enter rising threshold', { key: 'level', test: (t) => /^\d{1,3}(\.\d{1,2})?$/.test(t) && Number(t) <= 100, run: storm })])]),
      k('multicast', 'Multicast address storm control', [k('level', 'Set storm suppression level on this interface', [a('word', '<0.00 - 100.00>', 'Enter rising threshold', { key: 'level', test: (t) => /^\d{1,3}(\.\d{1,2})?$/.test(t) && Number(t) <= 100, run: storm })])]),
      k('unicast', 'Unicast address storm control', [k('level', 'Set storm suppression level on this interface', [a('word', '<0.00 - 100.00>', 'Enter rising threshold', { key: 'level', test: (t) => /^\d{1,3}(\.\d{1,2})?$/.test(t) && Number(t) <= 100, run: storm })])]),
    ]),
    k('switchport', 'Set switching mode characteristics', { run: swSwitchport, when: (e) => e.is('switch') }, [
      k('access', 'Set access mode characteristics of the interface', [k('vlan', 'Set VLAN when interface is in access mode', { nr: swAccessVlan }, [num(1, 4094, 'VLAN ID of the VLAN when this port is in access mode', { key: 'avlan', run: swAccessVlan })])]),
      k('mode', 'Set trunking mode of the interface', { nr: swMode }, [
        k('access', 'Set trunking mode to ACCESS unconditionally', { key: 'swm=access', run: swMode }),
        k('dynamic', 'Set trunking mode to dynamically negotiate access or trunk mode', [
          k('auto', 'Set trunking mode dynamic negotiation parameter to AUTO', { key: 'swm=dynamic auto', run: swMode }),
          k('desirable', 'Set trunking mode dynamic negotiation parameter to DESIRABLE', { key: 'swm=dynamic desirable', run: swMode }),
        ]),
        k('trunk', 'Set trunking mode to TRUNK unconditionally', { key: 'swm=trunk', run: swMode }),
      ]),
      k('nonegotiate', 'Device will not engage in negotiation protocol on this interface', { run: swNonegotiate }),
      k('port-security', 'Security related command', { run: portSecurity }, [
        k('aging', 'Port-security aging commands', { key: 'agingkw', nr: portSecurity }, [k('time', 'Port-security aging time', [num(1, 1440, 'Aging time in minutes. Enter a value between 1 and 1440', { key: 'aging', run: portSecurity })])]),
        k('mac-address', 'Secure mac address', { key: 'mackw', nr: portSecurity }, [
          a('mac', 'H.H.H', '48 bit mac address', { key: 'mac', run: portSecurity }, [k('vlan', 'VLAN ID', [num(1, 4094, 'VLAN ID', { key: 'psvlan', run: portSecurity })])]),
          k('sticky', 'Configure dynamic secure addresses as sticky', { run: portSecurity }, [a('mac', 'H.H.H', '48 bit mac address', { key: 'mac', run: portSecurity }, [k('vlan', 'VLAN ID', [num(1, 4094, 'VLAN ID', { key: 'psvlan', run: portSecurity })])])]),
        ]),
        k('maximum', 'Max secure addresses', { key: 'maxkw', nr: portSecurity }, [num(1, 132, 'Maximum addresses', { key: 'max', run: portSecurity }, [k('vlan', 'Max secure addresses per vlan', [a('line', 'LINE', 'vlan', { key: 'x', run: portSecurity })])])]),
        k('violation', 'Security violation mode', { key: 'violkw', nr: portSecurity }, [
          k('protect', 'Security violation protect mode', { key: 'viol=protect', run: portSecurity }),
          k('restrict', 'Security violation restrict mode', { key: 'viol=restrict', run: portSecurity }),
          k('shutdown', 'Security violation shutdown mode', { key: 'viol=shutdown', run: portSecurity }),
        ]),
      ]),
      k('trunk', 'Set trunking characteristics of the interface', [
        k('allowed', 'Set allowed VLAN characteristics when interface is in trunking mode', [
          k('vlan', 'Set allowed VLANs when interface is in trunking mode', { nr: swAllowed }, [
            a('vlanlist', 'WORD', 'VLAN IDs of the allowed VLANs when this port is in trunking mode', { key: 'alist', run: swAllowed }),
            k('add', 'add VLANs to the current list', allowedTail),
            k('all', 'all VLANs', { run: swAllowed }),
            k('except', 'all VLANs except the following', allowedTail),
            k('none', 'no VLANs', { run: swAllowed }),
            k('remove', 'remove VLANs from the current list', allowedTail),
          ]),
        ]),
        k('encapsulation', 'Set trunking encapsulation when interface is in trunking mode', { nr: swEncap, when: (e) => e.is('c3650') }, [
          k('dot1q', 'Interface uses only 802.1q trunking encapsulation when trunking', { run: swEncap }),
          k('isl', 'Interface uses only ISL trunking encapsulation when trunking', { run: swEncap }),
          k('negotiate', 'Device will negotiate trunking encapsulation with peer on interface', { run: swEncap }),
        ]),
        k('native', 'Set trunking native characteristics when interface is in trunking mode', [k('vlan', 'Set native VLAN when interface is in trunking mode', { nr: swNative }, [num(1, 4094, 'VLAN ID of the native VLAN when this port is in trunking mode', { key: 'nvlan', run: swNative })])]),
      ]),
      k('voice', 'Voice appliance attributes', [k('vlan', 'Vlan for voice traffic', { nr: swVoiceVlan }, [
        num(1, 4094, 'Vlan for voice traffic', { key: 'vvlan', run: swVoiceVlan }),
        k('dot1p', 'Priority tagged on PVID', { run: silent }),
        k('none', "Don't tell telephone about voice vlan", { key: 'vnone', run: swVoiceVlan }),
        k('untagged', 'Untagged on PVID', { run: silent }),
      ])]),
    ]),
  ];
  return roots;
}

export { typeOfName, isRouterDev };
