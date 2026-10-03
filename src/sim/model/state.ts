/**
 * Device state model. Everything here is plain JSON-serializable data so that snapshots are trivial.
 * `cfg` is the running configuration, `dyn` holds dynamic tables that are lost on reload.
 */
import type { DeviceModel, HostConfig, ServerServices } from '../../content/labTypes';
import type { Ranges } from '../util/format';
import type { Hw } from './hardware';

/** A reversible password (line / enable password / username password). `enc` → shown as type 7. */
export interface Pw {
  plain: string;
  enc: boolean;
}

export interface Addr4 {
  ip: number;
  mask: number;
}

export interface Addr6 {
  /** compressed lowercase */
  addr: string;
  len: number;
  eui64: boolean;
  linkLocal: boolean;
  anycast?: boolean;
}

export type SwMode = 'access' | 'trunk' | 'dynamic auto' | 'dynamic desirable';
export type ChMode = 'active' | 'passive' | 'desirable' | 'auto' | 'on';

export interface IfOspf {
  pid?: number;
  area?: string;
  cost?: number;
  priority?: number;
  net?: 'broadcast' | 'point-to-point' | 'non-broadcast' | 'point-to-multipoint';
  hello?: number;
  dead?: number;
  mtuIgnore?: boolean;
  extra?: string[];
}

export interface HsrpGroup {
  ip?: number;
  priority?: number;
  preempt?: boolean;
  name?: string;
  hello?: number;
  hold?: number;
  track?: string[];
}

export interface PortSecCfg {
  enabled: boolean;
  max?: number;
  violation?: 'shutdown' | 'restrict' | 'protect';
  sticky: boolean;
  /** configured (static) and sticky-learned secure MACs */
  macs: { mac: string; vlan?: number; sticky: boolean }[];
  aging?: number;
}

export interface IfStp {
  portfast?: 'edge' | 'trunk' | 'disable';
  bpduguard?: 'enable' | 'disable';
  bpdufilter?: 'enable' | 'disable';
  guard?: 'root' | 'loop' | 'none';
  cost?: number;
  prio?: number;
  vlanCost: Record<string, number>;
  vlanPrio: Record<string, number>;
  link?: 'point-to-point' | 'shared';
}

export interface IfCfg {
  name: string;
  shutdown: boolean;
  description?: string;
  ip?: Addr4;
  secondary: Addr4[];
  dhcp: boolean;
  method: 'unset' | 'manual' | 'NVRAM' | 'DHCP';
  unnumbered?: string;
  v6: Addr6[];
  v6Enabled: boolean;
  v6Auto: boolean;
  speed: string;
  duplex: string;
  bandwidth?: number;
  delay?: number;
  mtu?: number;
  ipMtu?: number;
  dot1q?: { vlan: number; native: boolean };
  serialEncap: 'hdlc' | 'ppp';
  clockRate?: number;
  /** L2 switchport (switches); false on routers and on `no switchport` ports */
  sw: boolean;
  mode: SwMode;
  accessVlan: number;
  voiceVlan?: number;
  nativeVlan: number;
  allowed: Ranges;
  trunkEncap: 'dot1q' | 'negotiate' | 'isl';
  nonegotiate: boolean;
  ps: PortSecCfg;
  channel?: { group: number; mode: ChMode };
  lacpRate?: 'fast' | 'normal';
  stp: IfStp;
  ospf: IfOspf;
  ospf6: IfOspf;
  helpers: number[];
  nat?: 'inside' | 'outside';
  aclIn?: string;
  aclOut?: string;
  v6AclIn?: string;
  v6AclOut?: string;
  hsrp: Record<string, HsrpGroup>;
  hsrpVer: 1 | 2;
  cdp: boolean;
  lldpTx: boolean;
  lldpRx: boolean;
  poe: 'auto' | 'never' | 'static';
  storm: { broadcast?: string; multicast?: string; unicast?: string; action?: 'shutdown' | 'trap' };
  snoopTrust: boolean;
  snoopRate?: number;
  arpTrust: boolean;
  proxyArp: boolean;
  redirects: boolean;
  /** accepted-but-unmodeled lines, printed in running-config */
  extra: string[];
}

export interface User {
  privilege?: number;
  secret?: string;
  password?: Pw;
}

export interface LineCfg {
  password?: Pw;
  login: 'none' | 'line' | 'local';
  transport?: string[];
  transportOut?: string[];
  execTimeout?: [number, number];
  logSync: boolean;
  accessIn?: string;
  accessOut?: string;
  privilege?: number;
  history?: number;
  extra: string[];
}

export interface StaticRoute {
  net: number;
  mask: number;
  nh?: number;
  ifName?: string;
  ad: number;
  name?: string;
  permanent?: boolean;
  tag?: number;
}

export interface StaticRoute6 {
  net: string;
  len: number;
  nh?: string;
  ifName?: string;
  ad: number;
}

export interface OspfNet {
  addr: number;
  wc: number;
  area: string;
}

export interface OspfCfg {
  pid: number;
  rid?: number;
  networks: OspfNet[];
  passiveDefault: boolean;
  passive: string[];
  noPassive: string[];
  defOrig?: { always: boolean; metric?: number; type?: number };
  refBw?: number;
  maxPaths?: number;
  logAdj: boolean;
  redistribute: string[];
  extra: string[];
}

export interface AclAddr {
  any?: boolean;
  addr: number;
  wc: number;
}

export interface PortMatch {
  op: 'eq' | 'neq' | 'lt' | 'gt' | 'range';
  ports: number[];
}

export interface AclEntry {
  seq: number;
  action: 'permit' | 'deny' | 'remark';
  remark?: string;
  proto?: string;
  src?: AclAddr;
  dst?: AclAddr;
  sport?: PortMatch;
  dport?: PortMatch;
  icmp?: string;
  established?: boolean;
  log?: boolean;
  matches: number;
}

export interface Acl {
  name: string;
  kind: 'standard' | 'extended';
  numbered: boolean;
  entries: AclEntry[];
}

export interface NatStatic {
  local: number;
  global: number;
  proto?: 'tcp' | 'udp';
  lport?: number;
  gport?: number;
  outside?: boolean;
  gIf?: string;
}

export interface NatDynamic {
  acl: string;
  pool?: string;
  iface?: string;
  overload: boolean;
}

export interface NatPool {
  name: string;
  start: number;
  end: number;
  mask: number;
  byPrefix: boolean;
}

export interface DhcpPool {
  name: string;
  net?: number;
  mask?: number;
  gw: number[];
  dns: number[];
  domain?: string;
  lease?: [number, number, number] | 'infinite';
  extra: string[];
}

export interface Block {
  header: string;
  lines: string[];
}

export interface DevCfg {
  hostname: string;
  enableSecret?: string;
  enablePassword?: Pw;
  pwEnc: boolean;
  tsLog: boolean;
  tsDebug: boolean;
  bannerMotd?: string;
  bannerLogin?: string;
  bannerExec?: string;
  users: Record<string, User>;
  domainName?: string;
  domainLookup: boolean;
  nameServers: number[];
  hosts: Record<string, number>;
  ssh: { version?: 1 | 2; timeout?: number; retries?: number };
  ipRouting: boolean;
  v6Routing: boolean;
  cef: boolean;
  defaultGw?: number;
  routes: StaticRoute[];
  routes6: StaticRoute6[];
  ospf: Record<string, OspfCfg>;
  ospf6: Record<string, OspfCfg>;
  acls: Record<string, Acl>;
  v6acls: Record<string, Acl>;
  nat: { statics: NatStatic[]; dyn: NatDynamic[]; pools: Record<string, NatPool> };
  dhcpExcl: [number, number][];
  dhcpPools: Record<string, DhcpPool>;
  noServiceDhcp: boolean;
  snoop: boolean;
  snoopVlans: Ranges;
  snoopOpt82: boolean;
  relayTrustAll: boolean;
  daiVlans: Ranges;
  ntp: { servers: { ip: number; prefer: boolean }[]; master?: number; source?: string; extra: string[] };
  tz?: { name: string; h: number; m: number };
  log: { hosts: number[]; trap?: string; console?: string | false; buffered?: { size?: number; level?: string } | false; monitor?: string | false; source?: string };
  snmp: string[];
  cdp: boolean;
  cdpTimer: number;
  cdpHold: number;
  lldp: boolean;
  lldpTimer: number;
  lldpHold: number;
  stpMode: 'pvst' | 'rapid-pvst' | 'mst';
  stpPrio: Record<string, number>;
  stpOff: Ranges;
  stpPortfastDefault: boolean;
  stpBpduguardDefault: boolean;
  stpBpdufilterDefault: boolean;
  stpLoopguardDefault: boolean;
  errRecovery: string[];
  errInterval?: number;
  lb?: string;
  vtp: { mode: 'server' | 'client' | 'transparent' | 'off'; domain?: string; password?: string; version: number };
  http: boolean;
  https: boolean;
  aaa: boolean;
  aaaLines: string[];
  lines: { con: LineCfg; aux: LineCfg; vty: LineCfg[] };
  blocks: Block[];
  confReg: number;
  nextConfReg?: number;
  ifaces: Record<string, IfCfg>;
  extra: string[];
}

export interface VlanRec {
  name: string;
  shut?: boolean;
  suspend?: boolean;
}

export interface ArpEntry {
  mac: string;
  ifName: string;
  t: number;
}

export interface MacEntry {
  port: string;
  t: number;
}

export interface NatTrans {
  proto?: 'tcp' | 'udp' | 'icmp';
  il: number;
  ilp?: number;
  ig: number;
  igp?: number;
  ol?: number;
  olp?: number;
  og?: number;
  ogp?: number;
  kind: 'static' | 'dynamic';
  t: number;
}

export interface DhcpBinding {
  ip: number;
  mac: string;
  clientId: string;
  expires: number | null;
  pool: string;
}

export interface IfDyn {
  errDisabled?: string;
  inPkts: number;
  outPkts: number;
  inBytes: number;
  outBytes: number;
  bcast: number;
  crc: number;
  runts: number;
  collisions: number;
  lateColl: number;
  resets: number;
  lastClear?: number;
  lease?: { ip: number; mask: number; gw?: number; dns?: number; server: number; t: number };
  psLearned: { mac: string; vlan: number }[];
  psViolations: number;
  psLast?: string;
  lastIn?: number;
  lastOut?: number;
}

export interface DevDyn {
  arp: Record<string, ArpEntry>;
  mac: Record<string, MacEntry>;
  nat: NatTrans[];
  natHits: number;
  natMisses: number;
  natPeak: number;
  dhcpBind: Record<string, DhcpBinding>;
  dhcpConflicts: Record<string, { t: number }>;
  snoopBind: { mac: string; ip: number; lease: number; vlan: number; ifName: string }[];
  logBuf: string[];
  logCount: number;
  ifd: Record<string, IfDyn>;
  ospfRid: Record<string, number>;
  ospfRole: Record<string, string>;
  ospfSpf: Record<string, number>;
  ospfStart: Record<string, number>;
  ospf6Rid: Record<string, number>;
  ospf6Role: Record<string, string>;
  nbrSince: Record<string, number>;
  routeSince: Record<string, number>;
  hsrp: Record<string, string>;
  hsrpChanges: Record<string, number>;
  boot: number;
  cfgChanged: number | null;
  cfgChangedBy?: string;
  savedAt: number | null;
  clockOffset: number;
  clockSet: boolean;
  rsa?: { modulus: number; label: string; t: number };
  ntpSync?: { server: number; stratum: number; t: number };
  cdpLogged: Record<string, boolean>;
  natTransCounter: number;
  icmpId: number;
  pingCount: number;
}

export interface IosState {
  cfg: DevCfg;
  dyn: DevDyn;
  startup: string | null;
  vlans: Record<string, VlanRec>;
  vlanDat: boolean;
  savedRsa?: { modulus: number; label: string; t: number };
}

export interface HostState {
  cfg: HostConfig;
  lease?: { ip: number; mask: number; gw?: number; dns?: number; server: number; t: number; expires: number } | null;
  apipa?: number;
  arp: Record<string, { mac: string; t: number }>;
  dhcpTried?: boolean;
  /** `ipconfig /release` was issued: do not auto-retry DHCP until /renew */
  dhcpReleased?: boolean;
  counters: { inPkts: number; outPkts: number };
}

export interface DeviceBase {
  id: string;
  model: DeviceModel;
  hw: Hw;
  label: string;
  x: number;
  y: number;
  locked: boolean;
  /** base MAC (12 hex) */
  mac: string;
}

export interface IosDevice extends DeviceBase {
  t: 'ios';
  kind: 'router' | 'switch' | 'l3switch';
  st: IosState;
}

export interface HostDevice extends DeviceBase {
  t: 'host';
  kind: 'host' | 'cloud';
  st: HostState;
  services?: ServerServices;
  cloudIp?: number;
  /** derived: mask/gateway a cloud uses when none is configured (from its attached router interface) */
  cloudAuto?: { mask: number; gw: number };
}

export type Device = IosDevice | HostDevice;

/* ------------------------------------------------------------------ */
/* factories                                                           */
/* ------------------------------------------------------------------ */

export function defaultLine(kind: 'con' | 'aux' | 'vty'): LineCfg {
  return { login: kind === 'vty' ? 'line' : 'none', logSync: false, extra: [] };
}

export function newIfCfg(name: string, opts: { router: boolean; sw: boolean; shutdown: boolean; trunkEncap?: 'dot1q' | 'negotiate' }): IfCfg {
  return {
    name,
    shutdown: opts.shutdown,
    secondary: [],
    dhcp: false,
    method: 'unset',
    v6: [],
    v6Enabled: false,
    v6Auto: false,
    speed: 'auto',
    duplex: 'auto',
    serialEncap: 'hdlc',
    sw: opts.sw,
    mode: 'dynamic auto',
    accessVlan: 1,
    nativeVlan: 1,
    allowed: [[1, 4094]],
    trunkEncap: opts.trunkEncap ?? 'dot1q',
    nonegotiate: false,
    ps: { enabled: false, sticky: false, macs: [] },
    stp: { vlanCost: {}, vlanPrio: {} },
    ospf: {},
    ospf6: {},
    helpers: [],
    hsrp: {},
    hsrpVer: 1,
    cdp: true,
    lldpTx: true,
    lldpRx: true,
    poe: 'auto',
    storm: {},
    snoopTrust: false,
    arpTrust: false,
    proxyArp: true,
    redirects: true,
    extra: [],
  };
}

export function newIfDyn(): IfDyn {
  return {
    inPkts: 0,
    outPkts: 0,
    inBytes: 0,
    outBytes: 0,
    bcast: 0,
    crc: 0,
    runts: 0,
    collisions: 0,
    lateColl: 0,
    resets: 0,
    psLearned: [],
    psViolations: 0,
  };
}

/** `ip host` lookup: names are stored as typed and matched case-insensitively. */
export function ipHostAddr(cfg: DevCfg, name: string): number | undefined {
  const n = name.toLowerCase();
  const hit = Object.entries(cfg.hosts).find(([k]) => k.toLowerCase() === n);
  return hit?.[1];
}

export function newDevCfg(hw: Hw, hostname: string): DevCfg {
  const router = hw.kind === 'router';
  const ifaces: Record<string, IfCfg> = {};
  for (const p of hw.ifaces) {
    ifaces[p.name] = newIfCfg(p.name, {
      router,
      sw: !router,
      shutdown: router,
      trunkEncap: hw.model === 'c3650' ? 'negotiate' : 'dot1q',
    });
  }
  if (!router) {
    const v1 = newIfCfg('Vlan1', { router: true, sw: false, shutdown: true });
    ifaces['Vlan1'] = v1;
  }
  const vty: LineCfg[] = [];
  for (let i = 0; i < hw.vtyDefault; i++) vty.push(defaultLine('vty'));
  return {
    hostname,
    pwEnc: false,
    tsLog: true,
    tsDebug: true,
    users: {},
    domainLookup: true,
    nameServers: [],
    hosts: {},
    ssh: {},
    ipRouting: hw.kind === 'router',
    v6Routing: false,
    cef: true,
    routes: [],
    routes6: [],
    ospf: {},
    ospf6: {},
    acls: {},
    v6acls: {},
    nat: { statics: [], dyn: [], pools: {} },
    dhcpExcl: [],
    dhcpPools: {},
    noServiceDhcp: false,
    snoop: false,
    snoopVlans: [],
    snoopOpt82: true,
    relayTrustAll: false,
    daiVlans: [],
    ntp: { servers: [], extra: [] },
    log: { hosts: [] },
    snmp: [],
    cdp: true,
    cdpTimer: 60,
    cdpHold: 180,
    lldp: false,
    lldpTimer: 30,
    lldpHold: 120,
    stpMode: 'pvst',
    stpPrio: {},
    stpOff: [],
    stpPortfastDefault: false,
    stpBpduguardDefault: false,
    stpBpdufilterDefault: false,
    stpLoopguardDefault: false,
    errRecovery: [],
    vtp: { mode: 'server', version: 1 },
    http: hw.kind !== 'router',
    https: true,
    aaa: false,
    aaaLines: [],
    lines: { con: defaultLine('con'), aux: defaultLine('aux'), vty },
    blocks: [],
    confReg: hw.confReg,
    ifaces,
    extra: [],
  };
}

export function newDevDyn(boot: number): DevDyn {
  return {
    arp: {},
    mac: {},
    nat: [],
    natHits: 0,
    natMisses: 0,
    natPeak: 0,
    dhcpBind: {},
    dhcpConflicts: {},
    snoopBind: [],
    logBuf: [],
    logCount: 0,
    ifd: {},
    ospfRid: {},
    ospfRole: {},
    ospfSpf: {},
    ospfStart: {},
    ospf6Rid: {},
    ospf6Role: {},
    nbrSince: {},
    routeSince: {},
    hsrp: {},
    hsrpChanges: {},
    boot,
    cfgChanged: null,
    savedAt: null,
    clockOffset: 0,
    clockSet: false,
    cdpLogged: {},
    natTransCounter: 0,
    icmpId: 1,
    pingCount: 0,
  };
}

export function defaultVlans(): Record<string, VlanRec> {
  return {
    '1': { name: 'default' },
    '1002': { name: 'fddi-default' },
    '1003': { name: 'token-ring-default' },
    '1004': { name: 'fddinet-default' },
    '1005': { name: 'trnet-default' },
  };
}

export function newOspfCfg(pid: number): OspfCfg {
  return { pid, networks: [], passiveDefault: false, passive: [], noPassive: [], logAdj: true, redistribute: [], extra: [] };
}

export function ifDyn(dev: IosDevice, name: string): IfDyn {
  return (dev.st.dyn.ifd[name] ??= newIfDyn());
}
