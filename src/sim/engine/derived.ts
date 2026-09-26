/** Derived network state, recomputed after configuration changes. */
import type { Addr4, IosDevice } from '../model/state';
import { parseIp } from '../util/ip';
import { computeL2, type L2State } from './l2';
import {
  buildRib,
  buildRib6,
  computeAddrs,
  computeAddrs6,
  computeHsrp,
  connectedRoutes,
  type HsrpGroupState,
  type HsrpMember,
  type Route,
  type Route6,
  type V6Addr,
} from './l3';
import { computeOspf, ospf6ToRib, ospfToRib, type OspfResult } from './ospf';
import { ek, type Net } from './net';

export interface Derived {
  l2: L2State;
  addrs: Map<string, Addr4[]>;
  addrs6: Map<string, V6Addr[]>;
  hsrp: { groups: HsrpGroupState[]; byIf: Map<string, HsrpMember[]> };
  ospf: OspfResult;
  ospf6: OspfResult;
  rib: Map<string, Route[]>;
  rib6: Map<string, Route6[]>;
  connected: Map<string, Route[]>;
}

function dhcpDefault(dev: IosDevice): Route | undefined {
  for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
    if (!c.dhcp) continue;
    const l = dev.st.dyn.ifd[name]?.lease;
    if (l?.gw !== undefined) return { code: 'S*', proto: 'dhcp', net: 0, len: 0, ad: 254, metric: 0, hops: [{ nh: l.gw }] };
  }
  return undefined;
}

export function computeDerived(net: Net): Derived {
  const l2 = computeL2(net);
  const addrs = computeAddrs(net);
  const addrs6 = computeAddrs6(net, l2);
  const hsrp = computeHsrp(net, l2, addrs);
  const connected = new Map<string, Route[]>();
  const pre = new Map<string, Route[]>();
  const pre6 = new Map<string, Route6[]>();
  for (const dev of net.iosDevices()) {
    const c = connectedRoutes(net, l2, addrs, dev);
    connected.set(dev.id, c);
    if (dev.st.cfg.ipRouting) pre.set(dev.id, buildRib(net, l2, dev, { connected: c, ospf: [], dhcpDefault: dhcpDefault(dev) }));
    else pre.set(dev.id, c);
    pre6.set(dev.id, dev.st.cfg.v6Routing || dev.kind === 'router' ? buildRib6(net, l2, addrs6, dev, []) : []);
  }
  const ospf = computeOspf(net, l2, addrs, addrs6, pre, pre6, false);
  const ospf6 = computeOspf(net, l2, addrs, addrs6, pre, pre6, true);
  const rib = new Map<string, Route[]>();
  const rib6 = new Map<string, Route6[]>();
  for (const dev of net.iosDevices()) {
    if (!dev.st.cfg.ipRouting) {
      rib.set(dev.id, connected.get(dev.id)!);
    } else {
      const oroutes: Route[] = [];
      for (const p of ospf.procs.values()) if (p.dev === dev.id) oroutes.push(...ospfToRib(p, (k) => dev.st.dyn.routeSince[k]));
      rib.set(dev.id, buildRib(net, l2, dev, { connected: connected.get(dev.id)!, ospf: oroutes, dhcpDefault: dhcpDefault(dev) }));
    }
    const o6: Route6[] = [];
    for (const p of ospf6.procs.values()) if (p.dev === dev.id) o6.push(...ospf6ToRib(p));
    rib6.set(dev.id, dev.st.cfg.v6Routing || dev.kind === 'router' ? buildRib6(net, l2, addrs6, dev, dev.st.cfg.v6Routing ? o6 : []) : buildRib6(net, l2, addrs6, dev, []));
  }
  return { l2, addrs, addrs6, hsrp, ospf, ospf6, rib, rib6, connected };
}

/** Primary IPv4 address of an IOS interface (effective). */
export function ifAddr(d: Derived, dev: string, ifName: string): Addr4 | undefined {
  return d.addrs.get(ek(dev, ifName))?.[0];
}

export function ipOf(s: string | undefined): number | undefined {
  if (!s) return undefined;
  return parseIp(s) ?? undefined;
}
