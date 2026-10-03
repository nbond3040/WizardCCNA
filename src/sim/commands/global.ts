/** Global configuration mode commands. */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import { ensureIf, getIf, isPhysical } from '../engine/topo';
import { newOspfCfg, type DhcpPool, type IosDevice, type LineCfg, defaultLine } from '../model/state';
import { parseIfRange, shortIf } from '../model/ifname';
import { makeSecret, type7Decode, secretTypeOf, type SecretType } from '../util/crypto';
import { ipStr, isMask, maskFromLen, maskLen, netOf, parseIp } from '../util/ip';
import { normRanges, rangesStr, rangesToList, type Ranges } from '../util/format';
import { parseV6, v6Str, v6Net } from '../util/ipv6';
import { accessListNode, getAcl } from './acl';
import { candidateRid } from '../engine/ospf';
import { vlanExists } from '../engine/l2';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function defaultSecretType(dev: IosDevice): SecretType {
  return dev.hw.iosXe ? 9 : 5;
}

function storeSecret(c: Ctx, typeArg: number | undefined, text: string, algo?: string): string | null {
  const t = typeArg ?? 0;
  if (t === 5 || t === 8 || t === 9) {
    const kind = secretTypeOf(text);
    if (kind === null) {
      c.out.push(t === 5 ? 'ERROR: The secret you entered is not a valid encrypted secret.\nTo enter an UNENCRYPTED secret, do not specify type 5 encryption.\nWhen you properly enter an UNENCRYPTED secret, it will be encrypted.' : `% Invalid encrypted secret: ${text}`);
      return null;
    }
    return text;
  }
  let type: SecretType = defaultSecretType(c.dev);
  if (algo === 'md5') type = 5;
  else if (algo === 'sha256') type = 8;
  else if (algo === 'scrypt') type = 9;
  return makeSecret(text, type);
}

export function pwFrom(c: Ctx, typeArg: number | undefined, text: string): { plain: string; enc: boolean } | null {
  if (typeArg === 7) {
    const p = type7Decode(text);
    if (p === null) {
      c.out.push('Invalid encrypted password: ' + text);
      return null;
    }
    return { plain: p, enc: true };
  }
  return { plain: text, enc: c.dev.st.cfg.pwEnc };
}

export function configExitMessage(c: Ctx): void {
  if (c.s.via === 'nvram' || c.s.via === 'internal') return;
  const who = c.s.via === 'vty' ? `${c.s.user ?? 'vty'} on vty${c.s.vtyLine ?? 0} (${c.s.peerIp !== undefined ? ipStr(c.s.peerIp) : '0.0.0.0'})` : 'console';
  c.net.log(c.dev.id, `%SYS-5-CONFIG_I: Configured from console by ${who}`);
}

function lvl(n: string): string {
  return n;
}

const LOG_LEVELS: [string, string][] = [
  ['alerts', 'Immediate action needed           (severity=1)'],
  ['critical', 'Critical conditions                (severity=2)'],
  ['debugging', 'Debugging messages                 (severity=7)'],
  ['emergencies', 'System is unusable                 (severity=0)'],
  ['errors', 'Error conditions                   (severity=3)'],
  ['informational', 'Informational messages             (severity=6)'],
  ['notifications', 'Normal but significant conditions  (severity=5)'],
  ['warnings', 'Warning conditions                 (severity=4)'],
];

function levelNodes(key: string, run: (c: Ctx) => void): Node[] {
  return [num(0, 7, 'Logging severity level', { key, run }), ...LOG_LEVELS.map(([l, h]) => k(l, h, { key: `${key}=${l}`, run }))];
}

const LEVEL_NAMES = ['emergencies', 'alerts', 'critical', 'errors', 'warnings', 'notifications', 'informational', 'debugging'];

function levelFrom(c: Ctx, key: string): string | undefined {
  // IOS stores numeric severities by name (`logging trap 4` → `logging trap warnings`)
  if (typeof c.a[key] === 'number') return LEVEL_NAMES[c.a[key] as number];
  const kk = Object.keys(c.a).find((x) => x.startsWith(`${key}=`));
  return kk ? lvl(kk.split('=')[1]) : undefined;
}

function vlanDefaultName(v: number): string {
  return `VLAN${String(v).padStart(4, '0')}`;
}

export function createVlan(c: Ctx, v: number, name?: string): boolean {
  const dev = c.dev;
  if (dev.st.cfg.vtp.mode === 'client') {
    c.out.push('VTP VLAN configuration not allowed when device is in CLIENT mode.');
    return false;
  }
  if (v >= 1006 && dev.st.cfg.vtp.mode === 'server' && dev.st.cfg.vtp.version < 3) {
    c.out.push('Extended VLAN(s) not allowed in current VTP mode.\n%Failed to commit extended VLAN(s) changes.');
    return false;
  }
  const rec = dev.st.vlans[String(v)];
  if (!rec) dev.st.vlans[String(v)] = { name: name ?? vlanDefaultName(v) };
  else if (name) rec.name = name;
  dev.st.vlanDat = true;
  return true;
}

/* ------------------------------------------------------------------ */
/* handlers                                                            */
/* ------------------------------------------------------------------ */

function hostname(c: Ctx): void {
  if (c.neg) {
    c.dev.st.cfg.hostname = c.dev.kind === 'router' ? 'Router' : 'Switch';
    return;
  }
  const name = c.a.name as string;
  if (!/^[A-Za-z]([A-Za-z0-9-]*[A-Za-z0-9])?$/.test(name) || name.length > 63) {
    c.out.push('% Hostname contains one or more illegal characters.');
    return;
  }
  c.dev.st.cfg.hostname = name;
}

function enableSecret(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.neg) {
    cfg.enableSecret = undefined;
    return;
  }
  const algo = Object.keys(c.a).find((x) => x.startsWith('algo='))?.split('=')[1];
  const text = c.a.secret as string;
  const h = storeSecret(c, c.a.stype as number | undefined, text, algo);
  if (!h) return;
  if (cfg.enablePassword && cfg.enablePassword.plain === text && c.a.stype === undefined) {
    c.out.push('The enable secret you have chosen is the same as your enable password.\nThis is not recommended.  Re-enter the enable secret.');
  }
  cfg.enableSecret = h;
}

function enablePassword(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.neg) {
    cfg.enablePassword = undefined;
    return;
  }
  const p = pwFrom(c, c.a.ptype as number | undefined, c.a.password as string);
  if (!p) return;
  cfg.enablePassword = p;
}

function servicePwEnc(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  cfg.pwEnc = !c.neg;
  if (c.neg) return;
  if (cfg.enablePassword) cfg.enablePassword.enc = true;
  for (const u of Object.values(cfg.users)) if (u.password) u.password.enc = true;
  const lines: LineCfg[] = [cfg.lines.con, cfg.lines.aux, ...cfg.lines.vty];
  for (const l of lines) if (l.password) l.password.enc = true;
}

function serviceTimestamps(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const which = c.a.debug ? 'debug' : c.a.log ? 'log' : 'both';
  const v = !c.neg;
  if (which === 'debug' || which === 'both') cfg.tsDebug = v;
  if (which === 'log' || which === 'both') cfg.tsLog = v;
}

function serviceOther(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const name = c.a.svc as string;
  if (name === 'dhcp') {
    cfg.noServiceDhcp = c.neg;
    return;
  }
  const line = `service ${name}`;
  cfg.extra = cfg.extra.filter((x) => x !== line && x !== `no ${line}`);
  if (!c.neg) cfg.extra.push(line);
}

/** banner motd|login|exec — supports single-line and interactive multi-line forms. */
function bannerRun(kind: 'motd' | 'login' | 'exec') {
  return (c: Ctx) => {
    const cfg = c.dev.st.cfg;
    const setB = (t: string | undefined) => {
      if (kind === 'motd') cfg.bannerMotd = t;
      else if (kind === 'login') cfg.bannerLogin = t;
      else cfg.bannerExec = t;
    };
    if (c.neg) {
      setB(undefined);
      return;
    }
    let raw = (c.a.text as string).replace(/^\s+/, '');
    let delim: string;
    if (raw.startsWith('^C')) {
      delim = '^C';
      raw = raw.slice(2);
    } else {
      delim = raw[0];
      raw = raw.slice(1);
    }
    const end = raw.indexOf(delim);
    if (end >= 0) {
      setB(raw.slice(0, end));
      return;
    }
    if (c.io.interactive) c.out.push(`Enter TEXT message.  End with the character '${delim === '^C' ? '^C' : delim}'.`);
    const collected: string[] = [raw];
    const next = (input: string) => {
      const i = input.indexOf(delim);
      if (i >= 0) {
        collected.push(input.slice(0, i));
        setB(collected.join('\n'));
        c.dev.st.dyn.cfgChanged = c.net.clock;
        c.net.touch();
        return;
      }
      collected.push(input);
      c.io.ask('', next);
    };
    c.io.ask('', next);
  };
}

function usernameRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const name = c.a.user as string;
  if (c.neg) {
    delete cfg.users[name];
    return;
  }
  const u = cfg.users[name] ?? {};
  if (c.a.priv !== undefined) u.privilege = c.a.priv as number;
  if (c.a.secret !== undefined) {
    const algo = Object.keys(c.a).find((x) => x.startsWith('algo='))?.split('=')[1];
    const h = storeSecret(c, c.a.stype as number | undefined, c.a.secret as string, algo);
    if (!h) return;
    u.secret = h;
    u.password = undefined;
  }
  if (c.a.password !== undefined) {
    const p = pwFrom(c, c.a.ptype as number | undefined, c.a.password as string);
    if (!p) return;
    u.password = p;
    u.secret = undefined;
  }
  cfg.users[name] = u;
}

function domainName(c: Ctx): void {
  c.dev.st.cfg.domainName = c.neg ? undefined : (c.a.dname as string);
}

function domainLookup(c: Ctx): void {
  c.dev.st.cfg.domainLookup = !c.neg;
}

function nameServer(c: Ctx): void {
  const list = (c.a.servers as number[] | undefined) ?? [];
  const cfg = c.dev.st.cfg;
  if (c.neg) {
    cfg.nameServers = list.length ? cfg.nameServers.filter((s) => !list.includes(s)) : [];
    return;
  }
  for (const s of list) if (!cfg.nameServers.includes(s)) cfg.nameServers.push(s);
}

function ipHost(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const n = c.a.hname as string;
  for (const k of Object.keys(cfg.hosts)) if (k.toLowerCase() === n.toLowerCase()) delete cfg.hosts[k];
  if (!c.neg) cfg.hosts[n] = c.a.haddr as number;
}

function ipRouting(c: Ctx): void {
  const dev = c.dev;
  if (dev.kind === 'switch') {
    c.out.push('% IP routing is not supported on this platform');
    return;
  }
  dev.st.cfg.ipRouting = !c.neg;
}

function ipRoute(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const net = c.a.rnet as number;
  const mask = c.a.rmask as number;
  if (!isMask(mask)) {
    c.out.push('%Inconsistent address and mask');
    return;
  }
  if (netOf(net, mask) !== net) {
    c.out.push('%Inconsistent address and mask');
    return;
  }
  const nh = c.a.nh as number | undefined;
  const ifName = c.a.rif as string | undefined;
  const ad = (c.a.ad as number | undefined) ?? 1;
  const match = (r: (typeof cfg.routes)[number]) => r.net === net && r.mask === mask && (nh === undefined || r.nh === nh) && (ifName === undefined || r.ifName === ifName);
  if (c.neg) {
    cfg.routes = cfg.routes.filter((r) => !match(r));
    return;
  }
  if (nh !== undefined) {
    for (const [key, list] of c.net.d.addrs) {
      if (key.startsWith(c.dev.id + '|') && list.some((x) => x.ip === nh)) {
        c.out.push('%Invalid next hop address (it\'s this router)');
        return;
      }
    }
  }
  const existing = cfg.routes.find((r) => r.net === net && r.mask === mask && r.nh === nh && r.ifName === ifName);
  const rec = { net, mask, nh, ifName, ad, name: c.a.rname as string | undefined, permanent: !!c.a.permanent, tag: c.a.tag as number | undefined };
  if (existing) Object.assign(existing, rec);
  else cfg.routes.push(rec);
}

function ipv6Route(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const p = c.a.v6pfx as { addr: bigint; len: number };
  const netS = v6Str(v6Net(p.addr, p.len));
  const nh = c.a.v6nh !== undefined ? v6Str(c.a.v6nh as bigint) : undefined;
  const ifName = c.a.v6if as string | undefined;
  const ad = (c.a.ad as number | undefined) ?? 1;
  if (c.neg) {
    cfg.routes6 = cfg.routes6.filter((r) => !(r.net === netS && r.len === p.len && (nh === undefined || r.nh === nh) && (ifName === undefined || r.ifName === ifName)));
    return;
  }
  if (nh && nh.startsWith('fe80') && !ifName) {
    c.out.push('% Interface has to be specified for a link-local nexthop');
    return;
  }
  cfg.routes6 = cfg.routes6.filter((r) => !(r.net === netS && r.len === p.len && r.nh === nh && r.ifName === ifName));
  cfg.routes6.push({ net: netS, len: p.len, nh, ifName, ad });
}

function defaultGateway(c: Ctx): void {
  c.dev.st.cfg.defaultGw = c.neg ? undefined : (c.a.gw as number);
}

function interfaceRun(c: Ctx): void {
  const name = c.a.ifname as string;
  if (c.neg) {
    const t = name.replace(/[\d/.]+$/, '');
    if (isPhysical(c.dev, name)) {
      c.out.push('% Physical interfaces cannot be removed.');
      return;
    }
    if (!['Loopback', 'Vlan', 'Port-channel', 'Tunnel'].includes(t) && !name.includes('.')) return;
    delete c.dev.st.cfg.ifaces[name];
    delete c.dev.st.dyn.ifd[name];
    if (t === 'Port-channel') for (const ic of Object.values(c.dev.st.cfg.ifaces)) if (ic.channel && `Port-channel${ic.channel.group}` === name) ic.channel = undefined;
    return;
  }
  ensureIf(c.dev, name);
  c.s.ifs = [name];
  c.s.mode = name.includes('.') ? 'subif' : 'if';
}

function interfaceRange(c: Ctx): void {
  const names = parseIfRange(c.a.range as string, c.dev.hw.types);
  if (!names) {
    c.out.push('% Invalid input detected at \'^\' marker.');
    return;
  }
  for (const n of names) {
    if (!getIf(c.dev, n) && !n.startsWith('Vlan')) {
      c.out.push(`Command rejected: invalid interface ${n} in range`);
      return;
    }
  }
  for (const n of names) ensureIf(c.dev, n);
  c.s.ifs = names;
  c.s.mode = 'if-range';
}

function lineRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.con !== undefined) {
    c.s.line = { kind: 'con', from: 0, to: 0 };
  } else if (c.a.aux !== undefined) {
    if (c.dev.kind !== 'router') return;
    c.s.line = { kind: 'aux', from: 0, to: 0 };
  } else {
    const from = c.a.vfrom as number;
    const to = (c.a.vto as number | undefined) ?? from;
    if (to < from) {
      c.out.push('%Invalid line range');
      return;
    }
    while (cfg.lines.vty.length <= to) cfg.lines.vty.push(defaultLine('vty'));
    c.s.line = { kind: 'vty', from, to };
  }
  c.s.mode = 'line';
}

function routerOspf(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const pid = c.a.pid as number;
  if (c.neg) {
    delete cfg.ospf[String(pid)];
    delete c.dev.st.dyn.ospfRid[String(pid)];
    for (const k2 of Object.keys(c.dev.st.dyn.ospfRole)) if (k2.startsWith(`${pid}|`)) delete c.dev.st.dyn.ospfRole[k2];
    return;
  }
  if (!cfg.ospf[String(pid)]) {
    cfg.ospf[String(pid)] = newOspfCfg(pid);
    const d = c.net.d;
    if (candidateRid(c.net, d.l2, d.addrs, c.dev, cfg.ospf[String(pid)]) === null && c.s.via !== 'nvram') {
      c.net.log(c.dev.id, `%OSPF-4-NORTRID: OSPF process ${pid} failed to allocate unique router-id and cannot start`);
    }
  }
  c.s.pid = pid;
  c.s.mode = 'router';
}

function routerOspf6(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const pid = c.a.pid as number;
  if (c.neg) {
    delete cfg.ospf6[String(pid)];
    delete c.dev.st.dyn.ospf6Rid[String(pid)];
    return;
  }
  if (!cfg.v6Routing && c.s.via !== 'nvram') {
    c.out.push('% IPv6 routing not enabled');
    return;
  }
  if (!cfg.ospf6[String(pid)]) {
    cfg.ospf6[String(pid)] = newOspfCfg(pid);
    const d = c.net.d;
    if (candidateRid(c.net, d.l2, d.addrs, c.dev, cfg.ospf6[String(pid)]) === null && c.s.via !== 'nvram') {
      c.net.log(c.dev.id, `%OSPFv3-4-NORTRID: OSPFv3 process ${pid} could not pick a router-id,\nplease configure manually`);
    }
  }
  c.s.pid = pid;
  c.s.mode = 'rtr6';
}

function vlanRun(c: Ctx): void {
  const list = rangesToList(c.a.vlist as Ranges);
  const dev = c.dev;
  if (dev.kind === 'router') return;
  if (c.neg) {
    for (const v of list) {
      if (v === 1) {
        c.out.push('%Default VLAN 1 may not be deleted.');
        continue;
      }
      if (v >= 1002 && v <= 1005) {
        c.out.push(`%Default VLAN ${v} may not be deleted.`);
        continue;
      }
      delete dev.st.vlans[String(v)];
    }
    return;
  }
  for (const v of list) {
    if (v >= 1002 && v <= 1005) {
      c.out.push(`%Default VLAN ${v} may not have its name changed.`);
      return;
    }
  }
  if (dev.st.cfg.vtp.mode === 'client') {
    c.out.push('VTP VLAN configuration not allowed when device is in CLIENT mode.');
    return;
  }
  c.s.vlanPend = { ids: list };
  c.s.vlans = list;
  c.s.mode = 'vlan';
}

function vtpRun(c: Ctx): void {
  const v = c.dev.st.cfg.vtp;
  if (c.a.mode !== undefined) {
    const m = Object.keys(c.a).find((x) => x.startsWith('vmode='))!.split('=')[1] as typeof v.mode;
    if (c.neg) {
      v.mode = 'server';
      return;
    }
    if (v.mode === m) {
      c.out.push(`Device mode already VTP ${m.toUpperCase()}.`);
      return;
    }
    v.mode = m;
    c.out.push(m === 'off' ? 'Setting device to VTP Off mode.' : `Setting device to VTP ${m === 'transparent' ? 'Transparent' : m === 'client' ? 'Client' : 'Server'} mode for VLANS.`);
    return;
  }
  if (c.a.domain !== undefined) {
    const old = v.domain ?? 'NULL';
    v.domain = c.neg ? undefined : (c.a.domain as string);
    if (!c.neg) c.out.push(`Changing VTP domain name from ${old} to ${v.domain}`);
    return;
  }
  if (c.a.vpass !== undefined) {
    v.password = c.neg ? undefined : (c.a.vpass as string);
    if (!c.neg) c.out.push(`Setting device VTP password to ${v.password}`);
    return;
  }
  if (c.a.ver !== undefined) v.version = c.neg ? 1 : (c.a.ver as number);
}

function stpMode(c: Ctx): void {
  const m = Object.keys(c.a).find((x) => x.startsWith('stpmode='))?.split('=')[1] as 'pvst' | 'rapid-pvst' | 'mst' | undefined;
  c.dev.st.cfg.stpMode = c.neg || !m ? 'pvst' : m;
}

function stpVlan(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const vl = rangesToList(c.a.svl as Ranges);
  if (c.a.prio !== undefined) {
    const p = c.a.prio as number;
    if (!c.neg && p % 4096 !== 0) {
      c.out.push('% Bridge Priority must be in increments of 4096.\n% Allowed values are:\n  0     4096  8192  12288 16384 20480 24576 28672\n  32768 36864 40960 45056 49152 53248 57344 61440');
      return;
    }
    for (const v of vl) {
      if (c.neg) delete cfg.stpPrio[String(v)];
      else cfg.stpPrio[String(v)] = p;
    }
    return;
  }
  if (c.a.primary || c.a.secondary) {
    const d = c.net.d;
    for (const v of vl) {
      if (c.neg) {
        delete cfg.stpPrio[String(v)];
        continue;
      }
      if (c.a.secondary) {
        cfg.stpPrio[String(v)] = 28672;
        continue;
      }
      const inst = d.l2.stp.get(c.dev.id)?.get(v);
      let p = 24576;
      if (inst && !inst.isRoot && inst.rootPrio - v <= 24576) {
        p = Math.max(0, Math.floor((inst.rootPrio - v - 1) / 4096) * 4096);
      }
      cfg.stpPrio[String(v)] = p;
    }
    return;
  }
  // "no spanning-tree vlan X" disables STP for the VLANs
  if (c.neg) cfg.stpOff = normRanges([...cfg.stpOff, ...(c.a.svl as Ranges)]);
  else cfg.stpOff = cfg.stpOff.filter(([x, y]) => !vl.some((v) => v >= x && v <= y));
}

function stpDefaults(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.bpduguard) cfg.stpBpduguardDefault = !c.neg;
  else if (c.a.bpdufilter) cfg.stpBpdufilterDefault = !c.neg;
  else {
    cfg.stpPortfastDefault = !c.neg;
    if (!c.neg && c.io.interactive)
      c.out.push(
        '%Warning: this command enables portfast by default on all interfaces. You\n should now disable portfast explicitly on switched ports leading to hubs,\n switches and bridges as they may create temporary bridging loops.',
      );
  }
}

function cryptoKeyGen(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const dyn = c.dev.st.dyn;
  if (cfg.hostname === 'Router' || cfg.hostname === 'Switch') {
    c.out.push(`% Please define a hostname other than ${cfg.hostname}.`);
    return;
  }
  if (!cfg.domainName) {
    c.out.push('% Please define a domain-name first.');
    return;
  }
  const label = (c.a.label as string | undefined) ?? `${cfg.hostname}.${cfg.domainName}`;
  const gen = (bits: number) => {
    const had = !!dyn.rsa;
    dyn.rsa = { modulus: bits, label, t: c.net.clock };
    c.out.push(`% Generating ${bits} bit RSA keys, keys will be non-exportable...`, `[OK] (elapsed time was ${bits >= 2048 ? 2 : bits >= 1024 ? 1 : 0} seconds)`);
    if (!had) c.net.log(c.dev.id, `%SSH-5-ENABLED: SSH ${cfg.ssh.version === 2 ? '2.0' : '1.99'} has been enabled`);
    c.net.touch();
  };
  const withModulus = (bits: number) => {
    if (bits < 360 || bits > 4096) {
      c.out.push('% Invalid modulus size');
      return;
    }
    gen(bits);
  };
  const proceed = () => {
    c.out.push(`The name for the keys will be: ${label}`);
    if (c.a.modulus !== undefined) {
      c.out.push('', `% The key modulus size is ${c.a.modulus} bits`);
      withModulus(c.a.modulus as number);
      return;
    }
    c.out.push('Choose the size of the key modulus in the range of 360 to 4096 for your', '  General Purpose Keys. Choosing a key modulus greater than 512 may take', '  a few minutes.', '');
    c.io.ask('How many bits in the modulus [512]: ', (inp) => {
      const t = inp.trim();
      const bits = t === '' ? 512 : Number(t);
      if (!Number.isInteger(bits)) {
        c.out.push('% Invalid modulus size');
        return;
      }
      withModulus(bits);
    });
  };
  if (dyn.rsa) {
    c.out.push(`% You already have RSA keys defined named ${dyn.rsa.label}.`);
    c.io.ask('% Do you really want to replace them? [yes/no]: ', (inp) => {
      if (/^y(es?)?$/i.test(inp.trim())) proceed();
    });
    return;
  }
  proceed();
}

function cryptoZeroize(c: Ctx): void {
  const dyn = c.dev.st.dyn;
  c.out.push('% All keys will be removed.', '% All router certs issued using these keys will also be removed.');
  c.io.ask('Do you really want to remove these keys? [yes/no]: ', (inp) => {
    if (/^y(es?)?$/i.test(inp.trim())) {
      dyn.rsa = undefined;
      c.net.log(c.dev.id, '%SSH-5-DISABLED: SSH 1.99 has been disabled');
      c.net.touch();
    }
  });
}

function ipSsh(c: Ctx): void {
  const s = c.dev.st.cfg.ssh;
  if (c.a.ver !== undefined) {
    if (c.neg) {
      s.version = undefined;
      return;
    }
    const v = c.a.ver as 1 | 2;
    if (v === 2 && (!c.dev.st.dyn.rsa || c.dev.st.dyn.rsa.modulus < 768)) {
      c.out.push('Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).');
      if (c.dev.st.dyn.rsa) return;
    }
    s.version = v;
    return;
  }
  if (c.a.timeout !== undefined) s.timeout = c.neg ? undefined : (c.a.timeout as number);
  if (c.a.retries !== undefined) s.retries = c.neg ? undefined : (c.a.retries as number);
}

function ipHttp(c: Ctx): void {
  if (c.a.secure) c.dev.st.cfg.https = !c.neg;
  else c.dev.st.cfg.http = !c.neg;
}

function natPool(c: Ctx): void {
  const pools = c.dev.st.cfg.nat.pools;
  const name = c.a.pname as string;
  if (c.neg) {
    delete pools[name];
    return;
  }
  let mask: number;
  let byPrefix = false;
  if (c.a.plen !== undefined) {
    mask = maskFromLen(c.a.plen as number);
    byPrefix = true;
  } else mask = c.a.pmask as number;
  if (!isMask(mask)) {
    c.out.push('%Bad netmask');
    return;
  }
  const start = c.a.pstart as number;
  const end = c.a.pend as number;
  if (netOf(start, mask) !== netOf(end, mask)) {
    c.out.push('%End address not in same subnet as start address');
    return;
  }
  if (end < start) {
    c.out.push('%End address less than starting address');
    return;
  }
  pools[name] = { name, start, end, mask, byPrefix };
}

function natSource(c: Ctx): void {
  const nat = c.dev.st.cfg.nat;
  const outside = !!c.a.outside;
  if (c.a.static) {
    const proto = c.a.tcp ? 'tcp' : c.a.udp ? 'udp' : undefined;
    const rec = {
      local: c.a.local as number,
      global: (c.a.global as number | undefined) ?? 0,
      proto: proto as 'tcp' | 'udp' | undefined,
      lport: c.a.lport as number | undefined,
      gport: c.a.gport as number | undefined,
      outside,
      gIf: c.a.gif as string | undefined,
    };
    const same = (s: typeof rec) => s.local === rec.local && s.proto === rec.proto && s.lport === rec.lport && !!s.outside === outside;
    if (c.neg) {
      nat.statics = nat.statics.filter((s) => !same(s as typeof rec));
      return;
    }
    if (nat.statics.some((s) => !s.proto && !proto && s.global === rec.global && s.local !== rec.local)) {
      c.out.push(`% similar static entry (${ipStr(nat.statics.find((s) => s.global === rec.global)!.local)} -> ${ipStr(rec.global)}) already exists`);
      return;
    }
    nat.statics = nat.statics.filter((s) => !same(s as typeof rec));
    nat.statics.push(rec);
    return;
  }
  const acl = String(c.a.natacl);
  const rec = { acl, pool: c.a.npool as string | undefined, iface: c.a.nif as string | undefined, overload: !!c.a.overload || !!c.a.nif };
  if (c.neg) {
    nat.dyn = nat.dyn.filter((d) => d.acl !== acl);
    if (c.io.interactive) c.dev.st.dyn.nat = c.dev.st.dyn.nat.filter((t) => t.kind === 'static');
    return;
  }
  if (rec.pool && !nat.pools[rec.pool] && c.s.via !== 'nvram') {
    c.out.push(`%Pool ${rec.pool} does not exist`);
  }
  nat.dyn = nat.dyn.filter((d) => d.acl !== acl);
  nat.dyn.push(rec);
}

function dhcpExcluded(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const lo = c.a.elo as number;
  const hi = (c.a.ehi as number | undefined) ?? lo;
  if (c.neg) {
    cfg.dhcpExcl = cfg.dhcpExcl.filter(([x, y]) => !(x === lo && y === hi));
    return;
  }
  if (hi < lo) {
    c.out.push('% Invalid address range');
    return;
  }
  if (!cfg.dhcpExcl.some(([x, y]) => x === lo && y === hi)) cfg.dhcpExcl.push([lo, hi]);
}

function dhcpPoolRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const name = c.a.poolname as string;
  if (c.neg) {
    delete cfg.dhcpPools[name];
    for (const [ip, b] of Object.entries(c.dev.st.dyn.dhcpBind)) if (b.pool === name) delete c.dev.st.dyn.dhcpBind[ip];
    return;
  }
  if (!cfg.dhcpPools[name]) cfg.dhcpPools[name] = { name, gw: [], dns: [], extra: [] } as DhcpPool;
  c.s.pool = name;
  c.s.mode = 'dhcp';
}

function dhcpSnooping(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.svlans !== undefined) {
    const r = c.a.svlans as Ranges;
    if (c.neg) cfg.snoopVlans = cfg.snoopVlans.filter(([x, y]) => !r.some(([p, q]) => p <= x && y <= q));
    else cfg.snoopVlans = normRanges([...cfg.snoopVlans, ...r]);
    return;
  }
  if (c.a.information) {
    cfg.snoopOpt82 = !c.neg;
    return;
  }
  cfg.snoop = !c.neg;
}

function aclModeRun(c: Ctx): void {
  const kind = c.a.standard ? 'standard' : 'extended';
  const name = String(c.a.aclname);
  const existing = c.dev.st.cfg.acls[name];
  if (c.neg) {
    delete c.dev.st.cfg.acls[name];
    return;
  }
  if (/^\d+$/.test(name)) {
    const n = Number(name);
    const numKind = (n >= 1 && n <= 99) || (n >= 1300 && n <= 1999) ? 'standard' : (n >= 100 && n <= 199) || (n >= 2000 && n <= 2699) ? 'extended' : null;
    if (numKind !== kind) {
      c.out.push(`% Invalid access list name.`);
      return;
    }
  }
  if (existing && existing.kind !== kind) {
    c.out.push(`% A named ${existing.kind} IP access list with this name already exists`);
    return;
  }
  getAcl(c.dev, name, kind, /^\d+$/.test(name));
  c.s.acl = name;
  c.s.mode = kind === 'standard' ? 'std-nacl' : 'ext-nacl';
}

function aclResequence(c: Ctx): void {
  const acl = c.dev.st.cfg.acls[String(c.a.rsname)];
  if (!acl) return;
  let seq = c.a.rstart as number;
  const step = c.a.rstep as number;
  for (const e of acl.entries) {
    e.seq = seq;
    seq += step;
  }
}

function ntpRun(c: Ctx): void {
  const n = c.dev.st.cfg.ntp;
  if (c.a.server !== undefined) {
    const ip = c.a.server as number;
    n.servers = n.servers.filter((s) => s.ip !== ip);
    if (!c.neg) n.servers.push({ ip, prefer: !!c.a.prefer });
    return;
  }
  if (c.a.master) {
    n.master = c.neg ? undefined : ((c.a.stratum as number | undefined) ?? 8);
    return;
  }
  if (c.a.nsrc !== undefined || c.a.source) {
    n.source = c.neg ? undefined : (c.a.nsrc as string);
    return;
  }
}

function ntpExtra(c: Ctx): void {
  const n = c.dev.st.cfg.ntp;
  const line = c.line.trim().replace(/^no\s+/, '');
  n.extra = n.extra.filter((x) => x !== line);
  if (!c.neg) n.extra.push(line);
}

function clockTz(c: Ctx): void {
  if (c.neg) {
    c.dev.st.cfg.tz = undefined;
    return;
  }
  c.dev.st.cfg.tz = { name: c.a.tzname as string, h: c.a.tzh as number, m: (c.a.tzm as number | undefined) ?? 0 };
}

function loggingRun(c: Ctx): void {
  const l = c.dev.st.cfg.log;
  if (c.a.lhost !== undefined) {
    const ip = c.a.lhost as number;
    l.hosts = l.hosts.filter((h) => h !== ip);
    if (!c.neg) l.hosts.push(ip);
    return;
  }
  if (c.a.trap) {
    l.trap = c.neg ? undefined : levelFrom(c, 'tlev') ?? 'informational';
    return;
  }
  if (c.a.console) {
    l.console = c.neg ? false : levelFrom(c, 'clev') ?? 'debugging';
    return;
  }
  if (c.a.buffered) {
    l.buffered = c.neg ? false : { size: c.a.bsize as number | undefined, level: levelFrom(c, 'blev') };
    return;
  }
  if (c.a.monitor) {
    l.monitor = c.neg ? false : levelFrom(c, 'mlev') ?? 'debugging';
    return;
  }
  if (c.a.lsrc !== undefined) l.source = c.neg ? undefined : (c.a.lsrc as string);
}

function snmpRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const rest = (c.a.snmp as string).trim();
  cfg.snmp = cfg.snmp.filter((x) => x !== rest && !(c.neg && x.startsWith(rest)));
  if (!c.neg) cfg.snmp.push(rest);
}

function extraGlobal(prefix: string) {
  return (c: Ctx) => {
    const cfg = c.dev.st.cfg;
    const rest = c.a.rest as string | undefined;
    const line = rest ? `${prefix} ${rest}` : prefix;
    cfg.extra = cfg.extra.filter((x) => x !== line && !(c.neg && x.startsWith(prefix + (rest ? ` ${rest.split(' ')[0]}` : ''))));
    if (!c.neg) cfg.extra.push(line);
  };
}

function aaaRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.newmodel) {
    cfg.aaa = !c.neg;
    return;
  }
  const rest = c.a.aaarest as string;
  cfg.aaaLines = cfg.aaaLines.filter((x) => x !== rest);
  if (!c.neg) {
    if (!cfg.aaa && c.io.interactive) {
      c.out.push('% Invalid input detected: aaa new-model must be enabled first');
      return;
    }
    cfg.aaaLines.push(rest);
  }
}

function blockRun(prefix: string, prompt: string) {
  return (c: Ctx) => {
    const cfg = c.dev.st.cfg;
    const header = `${prefix} ${c.a.bname as string}`;
    const idx = cfg.blocks.findIndex((b) => b.header === header);
    if (c.neg) {
      if (idx >= 0) cfg.blocks.splice(idx, 1);
      return;
    }
    let i = idx;
    if (i < 0) {
      cfg.blocks.push({ header, lines: [] });
      i = cfg.blocks.length - 1;
    }
    c.s.block = { idx: i, prompt };
    c.s.mode = 'block';
  };
}

function cdpRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.timer !== undefined) cfg.cdpTimer = c.neg ? 60 : (c.a.timer as number);
  else if (c.a.hold !== undefined) cfg.cdpHold = c.neg ? 180 : (c.a.hold as number);
  else cfg.cdp = !c.neg;
}

function lldpRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.timer !== undefined) cfg.lldpTimer = c.neg ? 30 : (c.a.timer as number);
  else if (c.a.hold !== undefined) cfg.lldpHold = c.neg ? 120 : (c.a.hold as number);
  else cfg.lldp = !c.neg;
}

function errdisableRun(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (c.a.interval !== undefined) {
    cfg.errInterval = c.neg ? undefined : (c.a.interval as number);
    return;
  }
  const cause = c.a.cause as string;
  cfg.errRecovery = cfg.errRecovery.filter((x) => x !== cause);
  if (!c.neg) cfg.errRecovery.push(cause);
}

function confReg(c: Ctx): void {
  const v = c.a.reg as number;
  c.dev.st.cfg.nextConfReg = c.neg ? undefined : v;
}

function arpInspection(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const r = c.a.dvlans as Ranges;
  if (c.neg) cfg.daiVlans = cfg.daiVlans.filter(([x, y]) => !r.some(([p, q]) => p <= x && y <= q));
  else cfg.daiVlans = normRanges([...cfg.daiVlans, ...r]);
}

function relayTrustAll(c: Ctx): void {
  c.dev.st.cfg.relayTrustAll = !c.neg;
}

function ipv6Routing(c: Ctx): void {
  c.dev.st.cfg.v6Routing = !c.neg;
}

function silent(): void {
  /* accepted for compatibility (default behaviour) */
}

/* ------------------------------------------------------------------ */
/* tree                                                                */
/* ------------------------------------------------------------------ */

let roots: Node[] | null = null;

export function globalRoots(): Node[] {
  if (roots) return roots;
  const word = (label: string, help: string, key: string, run?: (c: Ctx) => void, sub?: Node[] | (() => Node[])) => a('word', label, help, { key, run }, sub);
  const line = (label: string, help: string, key: string, run: (c: Ctx) => void) => a('line', label, help, { key, run });
  const ipv4 = (help: string, key: string, run?: (c: Ctx) => void, sub?: Node[] | (() => Node[])) => a('ipv4', 'A.B.C.D', help, { key, run }, sub);
  const iface = (help: string, key: string, policy: 'exist' | 'create' | 'exist+null', run?: (c: Ctx) => void, sub?: Node[] | (() => Node[])) => ({ ...a('iface', 'IFACE', help, { key, run }, sub), ifPolicy: policy }) as Node;

  const secretBody = (runner: (c: Ctx) => void, keyText = 'secret'): Node[] => [
    k('0', 'Specifies an UNENCRYPTED password will follow', { key: 'stype#0' }, [line('LINE', "The UNENCRYPTED (cleartext) 'enable' secret", keyText, runner)]),
    k('5', 'Specifies a MD5 HASHED secret will follow', { key: 'stype#5' }, [line('LINE', "The MD5 HASHED 'enable' secret string", keyText, runner)]),
    k('8', 'Specifies a PBKDF2 HASHED secret will follow', { key: 'stype#8' }, [line('LINE', 'The PBKDF2 hashed enable secret string', keyText, runner)]),
    k('9', 'Specifies a SCRYPT HASHED secret will follow', { key: 'stype#9' }, [line('LINE', 'The SCRYPT hashed enable secret string', keyText, runner)]),
    line('LINE', "The UNENCRYPTED (cleartext) 'enable' secret", keyText, runner),
  ];
  const withType = (runner: (c: Ctx) => void) => (c: Ctx) => {
    const t = Object.keys(c.a).find((x) => x.startsWith('stype#') || x.startsWith('ptype#'));
    if (t) {
      const [kk, v] = t.split('#');
      c.a[kk] = Number(v);
    }
    runner(c);
  };
  const enSecret = withType(enableSecret);
  const enPw = withType(enablePassword);
  const userRun = withType(usernameRun);

  const pwBody = (runner: (c: Ctx) => void, help: string): Node[] => [
    k('0', 'Specifies an UNENCRYPTED password will follow', { key: 'ptype#0' }, [line('LINE', help, 'password', runner)]),
    k('7', 'Specifies a HIDDEN password will follow', { key: 'ptype#7' }, [line('LINE', help, 'password', runner)]),
    line('LINE', help, 'password', runner),
  ];

  const userOpts = (): Node[] => [
    k('privilege', 'Set user privilege level', [num(0, 15, 'User privilege level', { key: 'priv', run: userRun }, userOpts)]),
    k('secret', 'Specify the secret for the user', secretBody(userRun)),
    k('password', 'Specify the password for the user', pwBody(userRun, 'The UNENCRYPTED (cleartext) user password')),
    k('algorithm-type', 'Algorithm to use for hashing the plaintext secret for the user', [
      k('md5', 'Encode the password using the MD5 algorithm', { key: 'algo=md5' }, [k('secret', 'Specify the secret for the user', [line('LINE', 'The UNENCRYPTED (cleartext) user secret', 'secret', userRun)])]),
      k('scrypt', 'Encode the password using the SCRYPT hashing algorithm', { key: 'algo=scrypt' }, [k('secret', 'Specify the secret for the user', [line('LINE', 'The UNENCRYPTED (cleartext) user secret', 'secret', userRun)])]),
      k('sha256', 'Encode the password using the PBKDF2 hashing algorithm', { key: 'algo=sha256' }, [k('secret', 'Specify the secret for the user', [line('LINE', 'The UNENCRYPTED (cleartext) user secret', 'secret', userRun)])]),
    ]),
    k('nopassword', 'No password is required for the user to log in', { run: userRun }),
  ];

  const routeTail = (): Node[] => [
    num(1, 255, 'Distance metric for this route', { key: 'ad', run: ipRoute }, routeOpts),
    ...routeOpts(),
  ];
  const routeOpts = (): Node[] => [
    k('name', 'Specify name of the next hop', [word('WORD', 'Name of the next hop', 'rname', ipRoute)]),
    k('permanent', 'permanent route', { run: ipRoute }),
    k('tag', 'Set tag for this route', [num(1, 4294967295, 'Tag value', { key: 'tag', run: ipRoute })]),
  ];

  const ipNodes: Node[] = [
    k('access-list', 'Named access list', [
      k('extended', 'Extended Access List', [num(100, 2699, 'Extended IP access-list number', { key: 'aclname', run: aclModeRun }), word('WORD', 'Access-list name', 'aclname', aclModeRun)]),
      k('resequence', 'Resequence Access List', [word('WORD', 'Access-list name or number', 'rsname', undefined, [num(1, 2147483647, 'Starting Sequence Number', { key: 'rstart' }, [num(1, 2147483647, 'Step to increment the sequence number', { key: 'rstep', run: aclResequence })])])]),
      k('standard', 'Standard Access List', [num(1, 1999, 'Standard IP access-list number', { key: 'aclname', run: aclModeRun }), word('WORD', 'Access-list name', 'aclname', aclModeRun)]),
    ]),
    k('arp', 'IP ARP global configuration', [k('inspection', 'Arp Inspection configuration', [k('vlan', 'Enable/Disable ARP Inspection on vlans', { when: (e) => e.is('switch') }, [a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'dvlans', run: arpInspection })])])]),
    k('cef', 'Cisco Express Forwarding', { run: silent }),
    k('classless', 'Follow classless routing forwarding rules', { run: silent, hide: true }),
    k('default-gateway', 'Specify default gateway (if not routing IP)', [ipv4('IP address of default gateway', 'gw', defaultGateway)]),
    k('dhcp', 'Configure DHCP server and relay parameters', [
      k('excluded-address', 'Prevent DHCP from assigning certain addresses', [ipv4('Low IP address', 'elo', dhcpExcluded, [ipv4('High IP address', 'ehi', dhcpExcluded)])]),
      k('pool', 'Configure DHCP address pools', [word('WORD', 'Pool name', 'poolname', dhcpPoolRun)]),
      k('relay', 'DHCP relay agent parameters', [k('information', 'Relay agent information option', [k('trust-all', 'Received DHCP packets may contain relay info option with zero giaddr', { run: relayTrustAll })])]),
      k('snooping', 'DHCP Snooping', { run: dhcpSnooping, when: (e) => e.is('switch') }, [
        k('information', 'DHCP Snooping information', [k('option', 'DHCP Snooping information option', { run: dhcpSnooping })]),
        k('vlan', 'DHCP Snooping vlan', [a('vlanlist', 'WORD', 'DHCP Snooping vlan first number or vlan range,example: 1,3-5,7,9-11', { key: 'svlans', run: dhcpSnooping })]),
      ]),
    ]),
    k('domain', 'IP DNS Resolver', [
      k('lookup', 'Enable IP Domain Name System hostname translation', { run: domainLookup }),
      k('name', 'Define the default domain name', [word('WORD', 'Default domain name', 'dname', domainName)]),
    ]),
    k('domain-lookup', 'Enable IP Domain Name System hostname translation', { run: domainLookup }),
    k('domain-name', 'Define the default domain name', [word('WORD', 'Default domain name', 'dname', domainName)]),
    k('forward-protocol', 'Controls forwarding of physical and directed IP broadcasts', [k('nd', 'Sun\'s Network Disk protocol', { run: silent })]),
    k('host', 'Add an entry to the ip hostname table', [word('WORD', 'Name of host', 'hname', undefined, [ipv4('Host IP address', 'haddr', ipHost)])]),
    k('http', 'HTTP server configuration', [
      k('authentication', 'Set http server authentication method', [line('LINE', 'Authentication method', 'rest', extraGlobal('ip http authentication'))]),
      k('secure-server', 'Enable HTTP secure server', { key: 'secure', run: ipHttp }),
      k('server', 'Enable http server', { run: ipHttp }),
    ]),
    k('name-server', 'Specify address of name server to use', [a('ipv4', 'A.B.C.D', 'Domain server IP address (maximum of 6)', { key: 'servers[]', run: nameServer }, () => [a('ipv4', 'A.B.C.D', 'Domain server IP address (maximum of 6)', { key: 'servers[]', run: nameServer })])]),
    k('nat', 'NAT configuration commands', [
      k('inside', 'Inside address translation', [
        k('source', 'Source address translation', [
          k('list', 'Specify access list describing local addresses', [
            a('word', '<1-2699>', 'Access list number for local addresses', { key: 'natacl' }, [
              k('interface', 'Specify interface for global address', [iface('Interface', 'nif', 'exist', undefined, [k('overload', 'Overload an address translation', { run: natSource })])]),
              k('pool', 'Name pool of global addresses', [word('WORD', 'Pool name for global addresses', 'npool', natSource, [k('overload', 'Overload an address translation', { run: natSource })])]),
            ]),
          ]),
          k('static', 'Specify static local->global mapping', [
            ipv4('Inside local IP address', 'local', undefined, [ipv4('Inside global IP address', 'global', natSource), k('interface', 'Specify interface for global address', [iface('Interface', 'gif', 'exist', natSource)])]),
            k('tcp', 'Transmission Control Protocol', [ipv4('Inside local IP address', 'local', undefined, [num(1, 65535, 'Local UDP/TCP port', { key: 'lport' }, [ipv4('Inside global IP address', 'global', undefined, [num(1, 65535, 'Global UDP/TCP port', { key: 'gport', run: natSource })]), k('interface', 'Specify interface for global address', [iface('Interface', 'gif', 'exist', undefined, [num(1, 65535, 'Global UDP/TCP port', { key: 'gport', run: natSource })])])])])]),
            k('udp', 'User Datagram Protocol', [ipv4('Inside local IP address', 'local', undefined, [num(1, 65535, 'Local UDP/TCP port', { key: 'lport' }, [ipv4('Inside global IP address', 'global', undefined, [num(1, 65535, 'Global UDP/TCP port', { key: 'gport', run: natSource })])])])]),
          ]),
        ]),
      ]),
      k('outside', 'Outside address translation', [k('source', 'Source address translation', [k('static', 'Specify static global->local mapping', [ipv4('Outside global IP address', 'local', undefined, [ipv4('Outside local IP address', 'global', natSource)])])])]),
      k('pool', 'Define pool of addresses', [
        word('WORD', 'Pool name', 'pname', undefined, [
          ipv4('Start IP address', 'pstart', undefined, [
            ipv4('End IP address', 'pend', undefined, [
              k('netmask', 'Specify the network mask', [a('ipv4', 'A.B.C.D', 'Network mask', { key: 'pmask', run: natPool })]),
              k('prefix-length', 'Specify the prefix length', [num(1, 32, 'Prefix length', { key: 'plen', run: natPool })]),
            ]),
          ]),
        ]),
      ]),
    ]),
    k('route', 'Establish static routes', [
      ipv4('Destination prefix', 'rnet', undefined, [
        ipv4('Destination prefix mask', 'rmask', undefined, () => [
          ipv4('Forwarding router\'s address', 'nh', ipRoute, routeTail),
          iface('Interface', 'rif', 'exist+null', ipRoute, () => [ipv4('Forwarding router\'s address', 'nh', ipRoute, routeTail), ...routeTail()]),
        ]),
      ]),
    ]),
    k('routing', 'Enable IP routing', { run: ipRouting, when: (e) => e.is('l3') }),
    k('ssh', 'Configure ssh options', [
      k('authentication-retries', 'Specify number of authentication retries', [num(0, 5, 'Number of authentication retries', { key: 'retries', run: ipSsh })]),
      k('time-out', 'Specify SSH time-out interval', [num(1, 120, 'SSH time-out interval (secs)', { key: 'timeout', run: ipSsh })]),
      k('version', 'Specify protocol version to be supported', [num(1, 2, 'Protocol version', { key: 'ver', run: ipSsh })]),
    ]),
    k('subnet-zero', 'Allow "subnet zero" subnets', { run: silent, hide: true }),
  ];

  const ipv6Nodes: Node[] = [
    k('access-list', 'Configure access lists', [word('WORD', 'User selected string identifying this access list', 'v6acl', (c: Ctx) => {
      const name = c.a.v6acl as string;
      if (c.neg) {
        delete c.dev.st.cfg.v6acls[name];
        return;
      }
      c.dev.st.cfg.v6acls[name] ??= { name, kind: 'extended', numbered: false, entries: [] };
      c.s.acl = name;
      c.s.mode = 'v6-nacl';
    })]),
    k('cef', 'Cisco Express Forwarding for IPv6', { run: silent }),
    k('route', 'Configure static routes', [
      a('ipv6pfx', 'X:X:X:X::X/<0-128>', 'IPv6 prefix', { key: 'v6pfx' }, () => [
        a('ipv6', 'X:X:X:X::X', 'IPv6 address of next-hop', { key: 'v6nh', run: ipv6Route }, [num(1, 254, 'Administrative distance', { key: 'ad', run: ipv6Route })]),
        iface('Interface', 'v6if', 'exist+null', ipv6Route, [a('ipv6', 'X:X:X:X::X', 'IPv6 address of next-hop', { key: 'v6nh', run: ipv6Route }, [num(1, 254, 'Administrative distance', { key: 'ad', run: ipv6Route })]), num(1, 254, 'Administrative distance', { key: 'ad', run: ipv6Route })]),
      ]),
    ]),
    k('router', 'Enable an IPV6 routing process', [k('ospf', 'Open Shortest Path First (OSPF)', [num(1, 65535, 'Process ID', { key: 'pid', run: routerOspf6 })])]),
    k('unicast-routing', 'Enable unicast routing', { run: ipv6Routing }),
  ];

  const stpNodes: Node[] = [
    k('extend', 'Spanning Tree 802.1t extensions', [k('system-id', 'Extend system-id into priority portion of the bridge id (PVST & Rapid PVST only)', { run: silent })]),
    k('loopguard', 'Spanning tree loopguard options', [k('default', 'Enable loopguard by default on all ports', { run: (c: Ctx) => { c.dev.st.cfg.stpLoopguardDefault = !c.neg; } })]),
    k('mode', 'Spanning tree operating mode', { nr: stpMode }, [
      k('mst', 'Multiple spanning tree mode', { key: 'stpmode=mst', run: stpMode }),
      k('pvst', 'Per-Vlan spanning tree mode', { key: 'stpmode=pvst', run: stpMode }),
      k('rapid-pvst', 'Per-Vlan rapid spanning tree mode', { key: 'stpmode=rapid-pvst', run: stpMode }),
    ]),
    k('portfast', 'Spanning tree portfast options', [
      k('bpdufilter', 'Enable portfast bdpu filter on this switch', [k('default', 'Enable bdpu filter by default on all portfast ports', { key: 'bpdufilter', run: stpDefaults })]),
      k('bpduguard', 'Enable portfast bpdu guard on this switch', [k('default', 'Enable bdpu guard by default on all portfast ports', { key: 'bpduguard', run: stpDefaults })]),
      k('default', 'Enable portfast by default on all access ports', { run: stpDefaults }),
      k('edge', 'Enable portfast edge on this switch', [k('default', 'Enable portfast by default on all access ports', { run: stpDefaults }), k('bpduguard', 'Enable portfast edge bpdu guard on this switch', [k('default', 'Enable bpdu guard by default on all edge ports', { key: 'bpduguard', run: stpDefaults })])]),
    ]),
    k('vlan', 'VLAN Switch Spanning Tree', [
      a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'svl', nr: stpVlan }, [
        k('priority', 'Set the bridge priority for the spanning tree', [num(0, 61440, "bridge priority in increments of 4096", { key: 'prio', run: stpVlan })]),
        k('root', 'Configure switch as root', [k('primary', 'Configure this switch as primary root for this spanning tree', { run: stpVlan }), k('secondary', 'Configure switch as secondary root', { run: stpVlan })]),
        k('forward-time', 'Set the forward delay for the spanning tree', [num(4, 30, 'number of seconds for the forward delay timer', { key: 'fwd', run: silent })]),
        k('hello-time', 'Set the hello interval for the spanning tree', [num(1, 10, 'number of seconds between generation of config BPDUs', { key: 'hello', run: silent })]),
        k('max-age', 'Set the max age interval for the spanning tree', [num(6, 40, 'maximum number of seconds the information in a BPDU is valid', { key: 'maxage', run: silent })]),
      ]),
    ]),
  ];

  roots = [
    k('aaa', 'Authentication, Authorization and Accounting.', [
      k('new-model', 'Enable NEW access control commands and functions.(Disables OLD commands.)', { key: 'newmodel', run: aaaRun }),
      k('authentication', 'Authentication configurations parameters.', [line('LINE', 'Authentication method list', 'aaarest', (c) => { c.a.aaarest = `authentication ${c.a.aaarest}`; aaaRun(c); })]),
      k('authorization', 'Authorization configurations parameters.', [line('LINE', 'Authorization method list', 'aaarest', (c) => { c.a.aaarest = `authorization ${c.a.aaarest}`; aaaRun(c); })]),
      k('accounting', 'Accounting configurations parameters.', [line('LINE', 'Accounting method list', 'aaarest', (c) => { c.a.aaarest = `accounting ${c.a.aaarest}`; aaaRun(c); })]),
      k('session-id', 'AAA Session ID', { hide: true }, [line('LINE', 'session id', 'aaarest', silent)]),
    ]),
    accessListNode(),
    k('banner', 'Define a login banner', [
      k('exec', 'Set EXEC process creation banner', { run: bannerRun('exec') }, [line('LINE', "c banner-text c, where 'c' is a delimiting character", 'text', bannerRun('exec'))]),
      k('login', 'Set login banner', { run: bannerRun('login') }, [line('LINE', "c banner-text c, where 'c' is a delimiting character", 'text', bannerRun('login'))]),
      k('motd', 'Set Message of the Day banner', { run: bannerRun('motd') }, [line('LINE', "c banner-text c, where 'c' is a delimiting character", 'text', bannerRun('motd'))]),
    ]),
    k('boot', 'Modify system boot parameters', [line('LINE', 'Boot parameters', 'rest', extraGlobal('boot'))]),
    k('boot-end-marker', 'End of boot configuration', { hide: true, run: silent }),
    k('boot-start-marker', 'Start of boot configuration', { hide: true, run: silent }),
    k('cdp', 'Global CDP configuration subcommands', [
      k('holdtime', 'Specify the holdtime (in sec) to be sent in packets', [num(10, 255, 'Length  of time  (in sec) that receiver must keep this packet', { key: 'hold', run: cdpRun })]),
      k('run', 'Enable CDP', { run: cdpRun }),
      k('timer', 'Specify the rate at which CDP packets are sent (in sec)', [num(5, 254, 'Rate at which CDP packets are sent (in  sec)', { key: 'timer', run: cdpRun })]),
    ]),
    k('clock', 'Configure time-of-day clock', [
      k('summer-time', 'Configure summer (daylight savings) time', [line('LINE', 'Summer time parameters', 'rest', extraGlobal('clock summer-time'))]),
      k('timezone', 'Configure time zone', [word('WORD', 'name of time zone', 'tzname', undefined, [a('word', '<-23 - 23>', 'Hours offset from UTC', { key: 'tzhs', test: (t) => /^-?\d{1,2}$/.test(t) && Math.abs(Number(t)) <= 23, run: (c: Ctx) => { c.a.tzh = Number(c.a.tzhs); clockTz(c); } }, [num(0, 59, 'Minutes offset from UTC', { key: 'tzm', run: (c: Ctx) => { c.a.tzh = Number(c.a.tzhs); clockTz(c); } })])])]),
    ]),
    k('config-register', 'Define the configuration register', [a('hex', '<0x0-0xFFFF>', 'Config register number', { key: 'reg', run: confReg })]),
    k('control-plane', 'Configure control plane services', { hide: true, run: silent }),
    k('crypto', 'Encryption module', [
      k('key', 'Long term key operations', [
        k('generate', 'Generate new keys', [
          k('rsa', 'Generate RSA keys', { run: cryptoKeyGen }, () => {
            const opts = (): Node[] => [
              k('general-keys', 'Generate a general purpose RSA key pair for signing and encryption', { run: cryptoKeyGen }, opts),
              k('label', 'Provide a label', [word('WORD', 'RSA keypair label', 'label', cryptoKeyGen, opts)]),
              k('modulus', 'Provide number of modulus bits on the command line', [num(360, 4096, 'size of the key modulus [360-4096]', { key: 'modulus', run: cryptoKeyGen }, opts)]),
              k('usage-keys', 'Generate separate RSA key pairs for signing and encryption', { run: cryptoKeyGen }, opts),
              k('exportable', 'Allow the key to be exported', { run: cryptoKeyGen }, opts),
            ];
            return opts();
          }),
        ]),
        k('zeroize', 'Remove keys', [k('rsa', 'Remove RSA keys', { run: cryptoZeroize })]),
      ]),
    ]),
    k('diagnostic', 'Configure diagnostic information', { hide: true }, [line('LINE', 'diagnostic', 'rest', silent)]),
    k('enable', 'Modify enable password parameters', [
      k('algorithm-type', 'Algorithm to use for hashing the plaintext \'enable\' secret', [
        k('md5', 'Encode the password using the MD5 algorithm', { key: 'algo=md5' }, [k('secret', 'Assign the privileged level secret (MAX of 25 characters)', [line('LINE', "The UNENCRYPTED (cleartext) 'enable' secret", 'secret', enSecret)])]),
        k('scrypt', 'Encode the password using the SCRYPT hashing algorithm', { key: 'algo=scrypt' }, [k('secret', 'Assign the privileged level secret (MAX of 25 characters)', [line('LINE', "The UNENCRYPTED (cleartext) 'enable' secret", 'secret', enSecret)])]),
        k('sha256', 'Encode the password using the PBKDF2 hashing algorithm', { key: 'algo=sha256' }, [k('secret', 'Assign the privileged level secret (MAX of 25 characters)', [line('LINE', "The UNENCRYPTED (cleartext) 'enable' secret", 'secret', enSecret)])]),
      ]),
      k('password', 'Assign the privileged level password (MAX of 25 characters)', { nr: enPw }, pwBody(enPw, "The UNENCRYPTED (cleartext) 'enable' password")),
      k('secret', 'Assign the privileged level secret (MAX of 25 characters)', { nr: enSecret }, secretBody(enSecret)),
    ]),
    k('errdisable', 'Error disable', [
      k('recovery', 'Error disable recovery', [
        k('cause', 'Enable error disable recovery for application', ['all', 'arp-inspection', 'bpduguard', 'channel-misconfig', 'dhcp-rate-limit', 'link-flap', 'loopback', 'psecure-violation', 'security-violation', 'storm-control', 'udld'].map((x) => k(x, `Enable timer to recover from ${x} error disable state`, { key: `cause=${x}`, run: (c: Ctx) => { c.a.cause = x; errdisableRun(c); } }))),
        k('interval', 'Error disable recovery timer value', [num(30, 86400, 'timer-interval(sec)', { key: 'interval', run: errdisableRun })]),
      ]),
    ]),
    k('hostname', "Set system's network name", { nr: hostname }, [word('WORD', "This system's network name", 'name', hostname)]),
    k('interface', 'Select an interface to configure', [
      iface('Interface', 'ifname', 'create', interfaceRun),
      k('range', 'interface range command', [line('LINE', 'Interface range (e.g. fastEthernet0/1 - 5 , gigabitEthernet0/1)', 'range', interfaceRange)]),
    ]),
    k('ip', 'Global IP configuration subcommands', ipNodes),
    k('ipv6', 'Global IPv6 configuration commands', ipv6Nodes),
    k('key', 'Key management', [k('chain', 'Key-chain management', [word('WORD', 'Key-chain name', 'bname', blockRun('key chain', 'config-keychain'))])]),
    k('license', 'Configure license features', { hide: true }, [line('LINE', 'license', 'rest', silent)]),
    k('line', 'Configure a terminal line', [
      k('aux', 'Auxiliary line', { when: (e) => e.is('router') }, [num(0, 0, 'First Line number', { key: 'aux', run: lineRun })]),
      k('console', 'Primary terminal line', [num(0, 0, 'First Line number', { key: 'con', run: lineRun })]),
      k('vty', 'Virtual terminal', [num(0, 15, 'First Line number', { key: 'vfrom', run: lineRun }, [num(1, 15, 'Last Line number', { key: 'vto', run: lineRun })])]),
    ]),
    k('lldp', 'Global LLDP configuration subcommands', [
      k('holdtime', 'Specify the holdtime (in sec) to be sent in packets', [num(0, 65535, 'Length  of time  (in sec) that receiver must keep this packet', { key: 'hold', run: lldpRun })]),
      k('run', 'Enable LLDP', { run: lldpRun }),
      k('timer', 'Specify the rate at which LLDP packets are sent (in sec)', [num(5, 65534, 'Rate at which LLDP packets are sent (in  sec)', { key: 'timer', run: lldpRun })]),
    ]),
    k('logging', 'Modify message logging facilities', [
      a('ipv4', 'Hostname or A.B.C.D', 'IP address of the logging host', { key: 'lhost', run: loggingRun }),
      k('buffered', 'Set buffered logging parameters', { run: loggingRun }, [num(4096, 2147483647, 'Logging buffer size', { key: 'bsize', run: loggingRun }, levelNodes('blev', loggingRun)), ...levelNodes('blev', loggingRun)]),
      k('console', 'Set console logging parameters', { run: loggingRun }, levelNodes('clev', loggingRun)),
      k('host', 'Set syslog server IP address and parameters', [a('ipv4', 'Hostname or A.B.C.D', 'IP address of the syslog server', { key: 'lhost', run: loggingRun })]),
      k('monitor', 'Set terminal line (monitor) logging parameters', { run: loggingRun }, levelNodes('mlev', loggingRun)),
      k('on', 'Enable logging to all enabled destinations', { run: silent }),
      k('source-interface', 'Specify interface for source address in logging transactions', [iface('Interface', 'lsrc', 'exist', loggingRun)]),
      k('trap', 'Set syslog server logging level', { run: loggingRun }, levelNodes('tlev', loggingRun)),
    ]),
    k('login', 'Enable secure login checking', [line('LINE', 'login options', 'rest', extraGlobal('login'))]),
    k('multilink', 'PPP multilink global configuration', { hide: true }, [line('LINE', 'multilink', 'rest', silent)]),
    k('ntp', 'Configure NTP', [
      k('access-group', 'Control NTP access', [line('LINE', 'access group', 'rest', ntpExtra)]),
      k('authenticate', 'Authenticate time sources', { run: ntpExtra }),
      k('authentication-key', 'Authentication key for trusted time sources', [line('LINE', 'key', 'rest', ntpExtra)]),
      k('master', 'Act as NTP master clock', { run: ntpRun }, [num(1, 15, 'Stratum number', { key: 'stratum', run: ntpRun })]),
      k('server', 'Configure NTP server', [a('ipv4', 'Hostname or A.B.C.D', 'IP address of peer', { key: 'server', run: ntpRun }, [k('prefer', 'Prefer this peer when possible', { run: ntpRun }), k('key', 'Configure peer authentication key', [num(0, 4294967295, 'Peer key number', { key: 'nkey', run: ntpRun })])])]),
      k('source', 'Configure interface for source address', [iface('Interface', 'nsrc', 'exist', ntpRun)]),
      k('trusted-key', 'Key numbers for trusted time sources', [line('LINE', 'key', 'rest', ntpExtra)]),
      k('update-calendar', 'Periodically update calendar with NTP time', { run: ntpExtra }),
    ]),
    k('platform', 'platform specific configuration', { hide: true }, [line('LINE', 'platform', 'rest', silent)]),
    k('port-channel', 'EtherChannel configuration', { when: (e) => e.is('switch') }, [
      k('load-balance', 'Load Balancing method', ['dst-ip', 'dst-mac', 'src-dst-ip', 'src-dst-mac', 'src-ip', 'src-mac'].map((m) => k(m, `${m.replace(/-/g, ' ')} load balancing`, { run: (c: Ctx) => { c.dev.st.cfg.lb = c.neg ? undefined : m; } }))),
    ]),
    k('radius', 'RADIUS server configuration command', [k('server', 'Configure a radius server', [word('WORD', 'Name for the radius server configuration', 'bname', blockRun('radius server', 'config-radius-server'))])]),
    k('radius-server', 'Modify RADIUS query parameters', [line('LINE', 'RADIUS parameters', 'rest', extraGlobal('radius-server'))]),
    k('redundancy', 'Enter redundancy mode', { hide: true, run: silent }),
    k('router', 'Enable a routing process', [k('ospf', 'Open Shortest Path First (OSPF)', [num(1, 65535, 'Process ID', { key: 'pid', run: routerOspf })])]),
    k('security', 'Infra Security CLIs', [k('passwords', 'Password security configuration', [k('min-length', 'Minimum length of passwords', [num(0, 16, 'Minimum length of all user/enable passwords', { key: 'minlen', run: (c: Ctx) => { const cfg = c.dev.st.cfg; cfg.extra = cfg.extra.filter((x) => !x.startsWith('security passwords min-length')); if (!c.neg) cfg.extra.push(`security passwords min-length ${c.a.minlen}`); } })])])]),
    k('service', 'Modify use of network based services', [
      k('password-encryption', 'Encrypt system passwords', { run: servicePwEnc }),
      k('timestamps', 'Timestamp debug/log messages', { run: serviceTimestamps }, [
        k('debug', 'Timestamp debug messages', { run: serviceTimestamps }, [line('LINE', 'Timestamp format', 'tsfmt', serviceTimestamps)]),
        k('log', 'Timestamp log messages', { run: serviceTimestamps }, [line('LINE', 'Timestamp format', 'tsfmt', serviceTimestamps)]),
      ]),
      ...['dhcp', 'pad', 'tcp-keepalives-in', 'tcp-keepalives-out', 'config', 'finger', 'udp-small-servers', 'tcp-small-servers', 'sequence-numbers', 'call-home'].map((s2) => k(s2, `Service ${s2}`, { key: 'svc', run: (c: Ctx) => { c.a.svc = s2; serviceOther(c); } })),
    ]),
    k('snmp-server', 'Modify SNMP engine parameters', [line('LINE', 'SNMP parameters', 'snmp', snmpRun)]),
    k('spanning-tree', 'Spanning Tree Subsystem', { when: (e) => e.is('switch') || e.is('xe') }, stpNodes),
    k('subscriber', 'subscriber', { hide: true }, [line('LINE', 'subscriber', 'rest', silent)]),
    k('system', 'system', { hide: true }, [line('LINE', 'system', 'rest', silent)]),
    k('tacacs', 'TACACS+ server configuration', [k('server', 'Configure a TACACS+ server', [word('WORD', 'Name for the tacacs server configuration', 'bname', blockRun('tacacs server', 'config-server-tacacs'))])]),
    k('tacacs-server', 'Modify TACACS query parameters', [line('LINE', 'TACACS parameters', 'rest', extraGlobal('tacacs-server'))]),
    k('username', 'Establish User Name Authentication', [word('WORD', 'User name', 'user', usernameRun, userOpts)]),
    k('version', 'Version', { hide: true }, [line('LINE', 'version', 'rest', silent)]),
    k('vlan', 'Vlan commands', { when: (e) => e.is('switch') }, [
      a('vlanlist', 'WORD', 'ISL VLAN IDs 1-4094', { key: 'vlist', run: vlanRun }),
      k('internal', 'internal VLAN', { hide: true }, [line('LINE', 'internal', 'rest', silent)]),
    ]),
    k('vtp', 'Configure global VTP state', { when: (e) => e.is('switch') }, [
      k('domain', 'Set the name of the VTP administrative domain.', [word('WORD', 'The ascii name for the VTP administrative domain.', 'domain', vtpRun)]),
      k('mode', 'Configure VTP device mode', { key: 'mode' }, [
        k('client', 'Set the device to client mode.', { key: 'vmode=client', run: vtpRun }),
        k('off', 'Set the device to off mode.', { key: 'vmode=off', run: vtpRun }),
        k('server', 'Set the device to server mode.', { key: 'vmode=server', run: vtpRun }),
        k('transparent', 'Set the device to transparent mode.', { key: 'vmode=transparent', run: vtpRun }),
      ]),
      k('password', 'Set the password for the VTP administrative domain.', [word('WORD', 'The ascii password for the VTP administrative domain.', 'vpass', vtpRun)]),
      k('version', 'Set the administrative domain to VTP version', [num(1, 3, 'Set the adminstrative domain VTP version number', { key: 'ver', run: vtpRun })]),
    ]),
  ];
  return roots;
}

export { vlanExists, rangesStr, parseIp, maskLen, parseV6, shortIf };
