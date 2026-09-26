/** Router configuration mode: OSPFv2 (config-router) and OSPFv3 (config-rtr). */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import type { OspfCfg } from '../model/state';
import { ipStr } from '../util/ip';

function proc(c: Ctx, v6: boolean): OspfCfg | undefined {
  const table = v6 ? c.dev.st.cfg.ospf6 : c.dev.st.cfg.ospf;
  return table[String(c.s.pid)];
}

function areaFrom(c: Ctx): string {
  return c.a.area !== undefined ? String(c.a.area) : ipStr(c.a.areaip as number);
}

function network(c: Ctx): void {
  const p = proc(c, false);
  if (!p) return;
  const wc = c.a.wc as number;
  const addr = ((c.a.naddr as number) & ~wc) >>> 0;
  const area = areaFrom(c);
  if (c.neg) {
    p.networks = p.networks.filter((n) => !(n.addr === addr && n.wc === wc));
    return;
  }
  const existing = p.networks.find((n) => n.addr === addr && n.wc === wc);
  if (existing) {
    if (existing.area !== area) c.out.push(`% OSPF: "network ${ipStr(addr)} ${ipStr(wc)} area ${existing.area}" is already configured`);
    return;
  }
  p.networks.push({ addr, wc, area });
}

function routerId(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    const dyn = c.dev.st.dyn;
    const ridMap = v6 ? dyn.ospf6Rid : dyn.ospfRid;
    const newRid = c.neg ? undefined : (c.a.rid as number);
    p.rid = newRid;
    const active = ridMap[String(p.pid)];
    if (active === undefined) return;
    const res = (v6 ? c.net.d.ospf6 : c.net.d.ospf).procs.get(`${c.dev.id}|${p.pid}`);
    const hasNbrs = !!res && res.nbrs.length > 0;
    if (newRid === undefined) {
      if (!hasNbrs) delete ridMap[String(p.pid)];
      else if (c.s.via !== 'nvram') c.out.push(`% OSPF${v6 ? 'v3' : ''}: Reload or use "clear ${v6 ? 'ipv6' : 'ip'} ospf process" command, for this to take effect`);
      return;
    }
    if (active === newRid) return;
    if (hasNbrs && c.s.via !== 'nvram') {
      c.out.push(`% OSPF${v6 ? 'v3' : ''}: Reload or use "clear ${v6 ? 'ipv6' : 'ip'} ospf process" command, for this to take effect`);
      return;
    }
    ridMap[String(p.pid)] = newRid;
  };
}

function passive(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    if (c.a.default) {
      p.passiveDefault = !c.neg;
      p.passive = [];
      p.noPassive = [];
      return;
    }
    const name = c.a.pif as string;
    if (p.passiveDefault) {
      p.noPassive = p.noPassive.filter((x) => x !== name);
      if (c.neg) p.noPassive.push(name);
    } else {
      p.passive = p.passive.filter((x) => x !== name);
      if (!c.neg) p.passive.push(name);
    }
  };
}

function defInfo(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    if (c.neg) {
      p.defOrig = undefined;
      return;
    }
    p.defOrig = {
      always: !!c.a.always || !!p.defOrig?.always,
      metric: (c.a.metric as number | undefined) ?? p.defOrig?.metric,
      type: (c.a.mtype as number | undefined) ?? p.defOrig?.type,
    };
  };
}

function autoCost(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    p.refBw = c.neg ? undefined : (c.a.refbw as number);
    if (!c.neg && c.s.via !== 'nvram') c.out.push(`% OSPF: Reference bandwidth is changed.`, `        Please ensure reference bandwidth is consistent across all routers.`);
  };
}

function maxPaths(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    p.maxPaths = c.neg ? undefined : (c.a.paths as number);
  };
}

function logAdj(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (p) p.logAdj = !c.neg;
  };
}

function redistribute(c: Ctx): void {
  const p = proc(c, false);
  if (!p) return;
  const src = c.a.static ? 'static' : 'connected';
  const opts: string[] = [];
  if (c.a.metric !== undefined) opts.push(`metric ${c.a.metric}`);
  if (c.a.mtype !== undefined) opts.push(`metric-type ${c.a.mtype}`);
  if (c.a.subnets) opts.push('subnets');
  const text = [src, ...opts].join(' ');
  p.redistribute = p.redistribute.filter((r) => !r.startsWith(src));
  if (c.neg) return;
  if (!c.a.subnets && c.s.via !== 'nvram' && !c.dev.hw.iosXe) c.out.push('% Only classful networks will be redistributed');
  p.redistribute.push(text);
}

function extra(v6: boolean) {
  return (c: Ctx) => {
    const p = proc(c, v6);
    if (!p) return;
    const line = c.line.trim().replace(/^no\s+/, '');
    p.extra = p.extra.filter((x) => x !== line);
    if (!c.neg) p.extra.push(line);
  };
}

function common(v6: boolean): Node[] {
  const pif = (run: (c: Ctx) => void) => ({ ...a('iface', 'IFACE', 'Interface', { key: 'pif', run }), ifPolicy: 'exist' as const });
  const dio = defInfo(v6);
  const dioOpts = (): Node[] => [
    k('always', 'Always advertise default route', { run: dio }, dioOpts),
    k('metric', 'OSPF default metric', [num(0, 16777214, 'OSPF metric', { key: 'metric', run: dio }, dioOpts)]),
    k('metric-type', 'OSPF metric type for default routes', [num(1, 2, 'OSPF Link State type', { key: 'mtype', run: dio }, dioOpts)]),
  ];
  return [
    k('area', 'OSPF area parameters', [a('line', 'LINE', 'Area parameters', { key: 'x', run: extra(v6) })]),
    k('auto-cost', 'Calculate OSPF interface cost according to bandwidth', { nr: autoCost(v6) }, [k('reference-bandwidth', "Use reference bandwidth method to assign OSPF cost", { nr: autoCost(v6) }, [num(1, 4294967, 'The reference bandwidth in terms of Mbits per second', { key: 'refbw', run: autoCost(v6) })])]),
    k('default-information', 'Control distribution of default information', [k('originate', 'Distribute a default route', { run: dio }, dioOpts)]),
    k('log-adjacency-changes', 'Log changes in adjacency state', { run: logAdj(v6) }, [k('detail', 'Log all state changes', { run: logAdj(v6) })]),
    k('maximum-paths', 'Forward packets over multiple paths', { nr: maxPaths(v6) }, [num(1, 32, 'Number of paths', { key: 'paths', run: maxPaths(v6) })]),
    k('passive-interface', 'Suppress routing updates on an interface', [pif(passive(v6)), k('default', 'Suppress routing updates on all interfaces', { run: passive(v6) })]),
    k('router-id', 'router-id for this OSPF process', { nr: routerId(v6) }, [a('ipv4', 'A.B.C.D', 'OSPF router-id in IP address format', { key: 'rid', run: routerId(v6) })]),
  ];
}

let r4: Node[] | null = null;
let r6: Node[] | null = null;

export function ospfRoots(): Node[] {
  if (r4) return r4;
  const redOpts = (): Node[] => [
    k('metric', 'Metric for redistributed routes', [num(0, 16777214, 'OSPF default metric', { key: 'metric', run: redistribute }, redOpts)]),
    k('metric-type', 'OSPF/IS-IS exterior metric type for redistributed routes', [num(1, 2, 'Set OSPF External Type metrics', { key: 'mtype', run: redistribute }, redOpts)]),
    k('subnets', 'Consider subnets for redistribution into OSPF', { run: redistribute }, redOpts),
  ];
  r4 = [
    ...common(false),
    k('distance', 'Define an administrative distance', [a('line', 'LINE', 'Distance', { key: 'x', run: extra(false) })]),
    k('network', 'Enable routing on an IP network', [
      a('ipv4', 'A.B.C.D', 'Network number', { key: 'naddr' }, [
        a('ipv4', 'A.B.C.D', 'OSPF wild card bits', { key: 'wc' }, [
          k('area', 'Set the OSPF area ID', [num(0, 4294967295, 'OSPF area ID as a decimal value', { key: 'area', run: network }), a('ipv4', 'A.B.C.D', 'OSPF area ID in IP address format', { key: 'areaip', run: network })]),
        ]),
      ]),
    ]),
    k('redistribute', 'Redistribute information from another routing protocol', [
      k('connected', 'Connected', { run: redistribute }, redOpts),
      k('static', 'Static routes', { run: redistribute }, redOpts),
    ]),
  ];
  return r4;
}

export function ospf6Roots(): Node[] {
  if (r6) return r6;
  r6 = [...common(true)];
  return r6;
}
