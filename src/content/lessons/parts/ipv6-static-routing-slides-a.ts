import type { Slide } from '../../types';

export const slidesA: Slide[] = [
  {
    kind: 'title',
    title: 'IPv6 Static Routing',
    subtitle: 'Static, default, host and floating routes for IPv6 — and the link-local rule',
    notes:
      'Everything you learned about IPv4 static routes carries over to IPv6: a destination prefix, a way to reach it, an optional administrative distance, and the same rules about installation and return paths. A few details change, and the exam targets exactly those details. In this deck you will enable IPv6 routing with `ipv6 unicast-routing`, write routes with `ipv6 route prefix/length`, build **default** (::/0), **host** (/128) and **floating** routes, and learn why a **link-local next hop** must be paired with an exit interface. You will read `show ipv6 route`, whose layout differs from the IPv4 table, verify with `ping` and `traceroute`, and troubleshoot the classic IPv6 static-routing faults. This lesson maps to v1.1 exam topics 3.3.a–3.3.d and to Domain 3 (IP Routing) of v2.0 — both versions expect IPv6 static routes at the same depth as IPv4.',
  },
  {
    kind: 'bullets',
    title: 'Same idea, new details',
    bullets: [
      'Routing for IPv6 is **off by default** — enable `ipv6 unicast-routing`',
      'Prefix length, not a mask: `ipv6 route 2001:db8:2::/64 ...`',
      'Next hop can be a **global unicast** or a **link-local** address',
      'Link-local next hop → exit interface is **mandatory**',
      'Default route is **::/0**, host route is **/128**',
      'No ARP: next-hop MACs come from **NDP** (NS/NA)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.2,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '2001:db8:1::10', x: 0.9, y: 1.3 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'LL FE80::1', x: 3.4, y: 1.3, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'LL FE80::2', x: 6.6, y: 1.3 },
        { id: 'srv', icon: 'server', label: 'Server1', sub: '2001:db8:2::100', x: 9.1, y: 1.3 },
      ],
      links: [
        { from: 'pc1', to: 'r1', toLabel: 'G0/0/0', label: '2001:db8:1::/64' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1 ::1', toLabel: '::2 G0/0/1', label: '2001:db8:12::/64' },
        { from: 'r2', to: 'srv', fromLabel: 'G0/0/0', label: '2001:db8:2::/64' },
        { from: 'r1', to: 'r2', fromLabel: 'S0/1/0 ::1', toLabel: '::2 S0/1/0', label: '2001:db8:99::/64 (backup)', style: 'serial', tone: 'muted' },
      ],
    },
    notes:
      'This topology mirrors the IPv4 lesson so you can focus on what is new. R1 owns LAN **2001:db8:1::/64**, R2 owns LAN **2001:db8:2::/64**, and they share the Gigabit transit prefix **2001:db8:12::/64**, where R1 is ::1 and R2 is ::2. Both routers also have manually configured **link-local** addresses on the transit link — FE80::1 on R1 and FE80::2 on R2 — which makes link-local next hops easy to read. A serial link, 2001:db8:99::/64, is the backup path for the floating static later. The big differences from IPv4: IOS routers do **not** route IPv6 until you enable it; routes are written with a **prefix length** instead of a dotted mask; there is **no ARP** (Neighbor Discovery finds the next hop\'s MAC); and you have a choice of next-hop address type — global or link-local — with one strict rule for link-local that we will cover shortly.',
  },
  {
    kind: 'cli',
    title: 'Prerequisite: ipv6 unicast-routing',
    code: `R1(config)# ipv6 unicast-routing
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 address 2001:db8:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ipv6 address 2001:db8:12::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::1
    2001:DB8:1::1
GigabitEthernet0/0/1   [up/up]
    FE80::1
    2001:DB8:12::1
Serial0/1/0            [administratively down/down]
    unassigned
Serial0/1/1            [administratively down/down]
    unassigned`,
    highlight: ['ipv6 unicast-routing', 'FE80::1'],
    caption: 'The same link-local address may be reused on every interface — it only has to be unique per link.',
    notes:
      'On IOS routers, IPv4 routing is on by default but **IPv6 routing is not**. Without `ipv6 unicast-routing` the router can still have IPv6 addresses and can ping its directly connected neighbors — it behaves like an IPv6 *host* — but it will **not forward** IPv6 packets from one interface to another and it will **not send Router Advertisements**, so SLAAC clients on its LANs never learn a prefix or default gateway. It is also required before OSPFv3 and other IPv6 routing features work. Every router on the path needs it. The interface configuration here assigns a global unicast address and, optionally, a manual **link-local** address; IOS otherwise builds one automatically from the MAC (EUI-64). Notice R1 uses FE80::1 on both interfaces: that is legal because a link-local address only has meaning on its own link. `show ipv6 interface brief` lists each interface\'s status with its link-local address first, then its global addresses — IOS always displays IPv6 addresses in uppercase.',
  },
  {
    kind: 'table',
    title: 'The ipv6 route command forms',
    columns: ['Form', 'Example on R1', 'Displayed as'],
    rows: [
      ['Next hop (global, recursive)', '`ipv6 route 2001:db8:2::/64 2001:db8:12::2`', '`S 2001:DB8:2::/64 [1/0]` / `via 2001:DB8:12::2`'],
      ['Exit interface only', '`ipv6 route 2001:db8:2::/64 Serial0/1/0`', '`via Serial0/1/0, directly connected`'],
      ['Fully specified, link-local', '`ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2`', '`via FE80::2, GigabitEthernet0/0/1`'],
      ['Default route', '`ipv6 route ::/0 2001:db8:12::2`', '`S ::/0 [1/0]` — no gateway of last resort line'],
      ['Host route', '`ipv6 route 2001:db8:2::100/128 2001:db8:12::2`', '`S 2001:DB8:2::100/128 [1/0]`'],
      ['Floating', '`ipv6 route 2001:db8:2::/64 2001:db8:99::2 130`', '`[130/0]` only when the primary is gone'],
    ],
    caption: 'Syntax: ipv6 route prefix/length {next-hop | exit-interface [next-hop]} [AD]',
    notes:
      'The IPv6 command is `ipv6 route`, followed by the prefix **with its length** in slash notation — there is no mask field. After the prefix you give a **next hop**, an **exit interface**, or **both** (interface first, then next hop), and optionally an AD from 1 to 255 (default 1). A global next hop triggers a recursive lookup exactly as in IPv4. An exit interface alone is fine on a **point-to-point** link such as serial; on Ethernet, prefer a next hop, because the router would otherwise have to treat every destination as on-link and resolve each one with Neighbor Discovery. When the next hop is **link-local**, the exit interface is not optional. The display differs from IPv4: each route takes **two lines** — code, prefix and [AD/metric] on the first, "via" details on the second — and even interface-only routes show their [1/0]. The default route is simply `S ::/0`; IPv6 has no "Gateway of last resort" line and no asterisk.',
  },
  {
    kind: 'cli',
    title: 'Configuring and reading show ipv6 route',
    code: `R1(config)# ipv6 route 2001:db8:2::/64 2001:db8:12::2
R1(config)# end
R1# show ipv6 route
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
C   2001:DB8:1::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:1::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
S   2001:DB8:2::/64 [1/0]
     via 2001:DB8:12::2
C   2001:DB8:12::/64 [0/0]
     via GigabitEthernet0/0/1, directly connected
L   2001:DB8:12::1/128 [0/0]
     via GigabitEthernet0/0/1, receive
L   FF00::/8 [0/0]
     via Null0, receive

R2(config)# ipv6 route 2001:db8:1::/64 2001:db8:12::1`,
    highlight: ['S   2001:DB8:2::/64 [1/0]', 'via 2001:DB8:12::2', 'ipv6 route 2001:db8:1::/64 2001:db8:12::1'],
    caption: 'Two lines per route. R2 needs the return route, exactly as in IPv4.',
    notes:
      'The IPv6 table opens with a header that counts its entries — six here — followed by the codes legend (trimmed in this transcript). Each route then uses **two lines**. Connected routes (**C**) show the interface and "directly connected"; local routes (**L**) are the router\'s own addresses as **/128** host routes marked "receive"; and **L FF00::/8 via Null0** is an automatic local entry covering multicast that is present on every IPv6 router — do not mistake it for something you configured. Our new static appears as **S 2001:DB8:2::/64 [1/0]** with "via 2001:DB8:12::2" underneath. Entries are sorted by prefix, so 2001:DB8:2::/64 appears before 2001:DB8:12::/64 (hex 2 is less than hex 12). The final line is the half that is easy to forget: R2 needs a route back to 2001:db8:1::/64, or replies from Server1 die at R2. Nothing about return routing changes with IPv6.',
  },
  {
    kind: 'diagram',
    title: 'Resolving a global next hop with NDP',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'r2', label: 'R2 2001:db8:12::2', icon: 'router' },
      ],
      steps: [
        { note: 'Packet to 2001:db8:2::100 matches S 2001:DB8:2::/64 via 2001:DB8:12::2' },
        { note: 'Recursive lookup: 2001:DB8:12::2 is in C 2001:DB8:12::/64 → exit G0/0/1' },
        { from: 'r1', to: 'r2', label: 'Neighbor Solicitation', sub: 'to solicited-node FF02::1:FF00:2 — "who has 2001:db8:12::2?"' },
        { from: 'r2', to: 'r1', label: 'Neighbor Advertisement', sub: 'unicast, carries R2\'s MAC', tone: 'accent' },
        { from: 'r1', to: 'r2', label: 'Packet forwarded in a frame to R2\'s MAC', tone: 'good' },
        { note: 'The mapping is cached in the neighbor table: show ipv6 neighbors' },
      ],
    },
    notes:
      'A next-hop IPv6 static route works like its IPv4 cousin: the router matches the destination, then performs a **recursive lookup** on the next-hop address to find the connected prefix and exit interface. The difference is how it learns the next hop\'s MAC. IPv6 has **no ARP**; instead the router sends an ICMPv6 **Neighbor Solicitation** to the target\'s **solicited-node multicast** address (FF02::1:FF plus the last 24 bits of the target — here FF02::1:FF00:2) and the neighbor answers with a **Neighbor Advertisement** containing its MAC. The result is cached in the neighbor table, visible with `show ipv6 neighbors`. Because there is no proxy-ARP safety net in IPv6, an exit-interface-only route on Ethernet is a poor idea: the router would try to resolve every destination as if it were on the local link. With a global next hop, only one neighbor ever needs to be resolved.',
  },
  {
    kind: 'diagram',
    title: 'Why a link-local next hop needs an interface',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'FE80::1 on every link', x: 5, y: 1.2, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'FE80::2', x: 1.6, y: 3.4 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'FE80::2', x: 8.4, y: 3.4 },
      ],
      links: [
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', label: 'link A' },
        { from: 'r1', to: 'r3', fromLabel: 'S0/1/0', label: 'link B' },
      ],
      annotations: [
        { x: 5, y: 3.6, text: '"via FE80::2" — which link?', tone: 'bad' },
        { x: 5, y: 4.1, text: 'ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2', tone: 'good' },
      ],
    },
    caption: 'Link-local addresses are unique only on their own link, so the router must be told which link.',
    notes:
      'A link-local address (FE80::/10) is valid only on the link where it lives; routers never forward packets sourced from or destined to one. That also means the **same** link-local address can legally exist on many different links at once — here both R2 and R3 use FE80::2, each on a different link to R1. If you tell R1 "send traffic for 2001:db8:2::/64 to FE80::2", it has no way of knowing which link you mean, and a routing table lookup cannot help, because link-local prefixes are not routed. So IOS insists on a **fully specified** route: exit interface **plus** link-local next hop. Entering only the link-local next hop is rejected at the prompt with an error saying an interface must be specified. Why use link-local next hops at all? They never change when you renumber global prefixes, and they are exactly what IPv6 routing protocols such as OSPFv3 use as next hops, so your static routes and dynamic routes look alike.',
  },
  {
    kind: 'cli',
    title: 'Configuring a link-local next hop',
    code: `R1(config)# no ipv6 route 2001:db8:2::/64 2001:db8:12::2
R1(config)# ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2
R1(config)# end
R1# show ipv6 route static
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:2::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1
R1# ping fe80::2
Output Interface: GigabitEthernet0/0/1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to FE80::2, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/1 ms`,
    highlight: ['GigabitEthernet0/0/1 fe80::2', 'via FE80::2, GigabitEthernet0/0/1', 'Output Interface:'],
    caption: 'Interface first, then the link-local next hop. Pinging a link-local address also needs an interface.',
    notes:
      'To change a static route you remove the old one with `no ipv6 route` plus the same parameters, then add the new one; otherwise both would be installed and share traffic, because they have the same prefix and the same AD. The fully specified route lists the **exit interface first**, then the link-local next hop. In the table it reads **via FE80::2, GigabitEthernet0/0/1** — the interface on the "via" line is your visual cue that this is a fully specified route. `show ipv6 route static` filters the display to static routes only, while the header still reports the total number of entries in the table. The same "which link?" problem appears when you test: pinging a link-local address makes IOS ask for the **output interface**, because FE80::2 could exist on any link. If you omit the interface in the route itself, the command is refused rather than accepted with a hidden problem — one of the few IPv6 static mistakes that IOS catches for you.',
  },
  {
    kind: 'bullets',
    title: 'IPv6 default and host routes',
    bullets: [
      '**Default**: `ipv6 route ::/0 2001:db8:100::1` — matches every destination',
      'Shown as `S ::/0 [1/0]` — **no** asterisk, **no** gateway-of-last-resort line',
      '**Host**: `/128` — e.g. steer one server over the backup link',
      'Longest prefix match: **/128 beats /64** beats ::/0',
      'Exit-interface-only default is fine on serial: `ipv6 route ::/0 Serial0/1/0`',
      'A default learned from Router Advertisements shows as **ND**',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3.4,
      nodes: [
        { id: 'lan', icon: 'switch', label: 'LAN', sub: '2001:db8:10::/64', x: 1, y: 1.6 },
        { id: 'br', icon: 'router', label: 'BR1', sub: '2001:db8:100::2', x: 3.9, y: 1.6, tone: 'accent' },
        { id: 'isp', icon: 'internet', label: 'ISP', sub: '2001:db8:100::1', x: 6.9, y: 1.6 },
      ],
      links: [
        { from: 'lan', to: 'br', toLabel: 'G0/0/0' },
        { from: 'br', to: 'isp', fromLabel: 'G0/0/1', label: '::/0', arrow: 'forward', tone: 'accent' },
      ],
    },
    notes:
      'The IPv6 default route is written **::/0** — the all-zeros address with a zero-length prefix, so every destination matches it and it is used only when nothing longer does. A stub branch router like BR1 typically needs just that one static route toward its provider. In `show ipv6 route` it looks like any other static, `S ::/0 [1/0]` with the next hop underneath; the IPv6 table has **no** "Gateway of last resort" line and no asterisk, a detail the exam uses to test whether you have really read IPv6 output. At the other end of the scale, a **/128 host route** matches a single address and, by longest prefix match, overrides the /64 for that host — useful to push one server or a management address over a different link. If a router is itself configured as a SLAAC client (for example with `ipv6 address autoconfig default` on an Internet-facing interface), the default it learns from Router Advertisements appears with the code **ND** rather than S.',
  },
];
