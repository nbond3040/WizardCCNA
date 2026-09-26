import type { Slide } from '../../types';

export const slidesA: Slide[] = [
  {
    kind: 'title',
    title: 'IPv4 Static Routing',
    subtitle: 'Network, host, default and floating static routes — configured, verified and fixed',
    notes:
      'A router only knows the subnets on its own interfaces until something teaches it more. **Static routes** are the simplest teacher: you type the destination, the mask and where to send the traffic. In this deck you will learn the three forms of the `ip route` command (next hop, exit interface, fully specified), how the router resolves a next hop with a **recursive lookup**, how to build **host**, **default** and **floating** static routes, why an exit-interface-only route on Ethernet leans on proxy ARP, and exactly when IOS refuses to install a static route. We finish with verification (`show ip route static`, `show ip route <prefix>`, ping and traceroute) and the troubleshooting classics: missing return routes, wrong masks and wrong next hops. This lesson maps to v1.1 exam topics 3.3.a–3.3.d and to Domain 3 (IP Routing) of v2.0; both versions test it heavily, often inside a larger routing-table exhibit.',
  },
  {
    kind: 'bullets',
    title: 'Why static routes still matter',
    bullets: [
      '**Stub networks**: one way in, one way out — a default route is enough',
      'Point a branch or small office at its **ISP** with one command',
      '**Floating** statics back up a dynamic route over a second link',
      'No routing protocol overhead: no hellos, no CPU for SPF, nothing to attack',
      { text: 'Downside: **no automatic reaction** to topology change', sub: ['Every new subnet means touching every router that needs it'] },
      'Default AD **1** — trusted more than any routing protocol',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3,
      nodes: [
        { id: 'lan', icon: 'pc', label: 'Branch LAN', sub: '172.16.1.0/24', x: 1, y: 1.5 },
        { id: 'br', icon: 'router', label: 'BR1', sub: 'stub router', x: 3.8, y: 1.5, tone: 'accent' },
        { id: 'isp', icon: 'internet', label: 'ISP', sub: '203.0.113.1', x: 6.8, y: 1.5 },
      ],
      links: [
        { from: 'lan', to: 'br', toLabel: 'G0/0/0' },
        { from: 'br', to: 'isp', fromLabel: 'G0/0/1', label: 'only exit', arrow: 'forward' },
      ],
    },
    notes:
      'Dynamic routing protocols exist because networks change, so why would anyone type routes by hand? Because many networks barely change. A **stub** network — a branch with a single uplink — has exactly one way out, so running OSPF there buys nothing: a single default route pointing at the upstream router does the job with no hello packets, no neighbor state and no SPF runs. Static routes are also predictable and secure: nothing is advertised, so there is nothing for an attacker to spoof. Their weakness is that they are **blind**: if a link fails or a subnet is added, a static route does not notice or adapt unless the local interface itself goes down. Because a static route has an administrative distance of **1**, it beats every dynamic protocol for the same prefix — which is why a floating static must deliberately be given a *higher* AD. On the exam, expect static routes inside mixed routing tables, where you must know which one wins and why.',
  },
  {
    kind: 'diagram',
    title: 'The topology used in this deck',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.1.10/24', x: 0.9, y: 1.4 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'LAN 10.1.1.1', x: 3.3, y: 1.4, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'LAN 10.2.2.1', x: 6.7, y: 1.4 },
        { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.100/24', x: 9.1, y: 1.4 },
      ],
      links: [
        { from: 'pc1', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1 .1', toLabel: '.2 G0/0/1', label: '10.0.12.0/30' },
        { from: 'r2', to: 'srv', fromLabel: 'G0/0/0' },
        { from: 'r1', to: 'r2', fromLabel: 'S0/1/0 .1', toLabel: '.2 S0/1/0', label: '192.168.12.0/30 (backup)', style: 'serial', tone: 'muted' },
      ],
      annotations: [
        { x: 5, y: 3.9, text: 'Primary path: Gigabit link · Backup path: serial link (used for the floating static)', tone: 'muted' },
      ],
    },
    caption: 'R1 knows only its connected subnets until we add routes.',
    notes:
      'Every example in this lesson uses this small network, so take a moment to memorize it. **R1** owns LAN 10.1.1.0/24 on G0/0/0 (PC1 is 10.1.1.10) and **R2** owns LAN 10.2.2.0/24 on G0/0/0 (Server1 is 10.2.2.100). The two routers are joined by a Gigabit point-to-point subnet, **10.0.12.0/30**, where R1 is .1 and R2 is .2. A second, slower **serial** link, 192.168.12.0/30, will become the backup path when we build a floating static route. Out of the box, R1\'s table contains only connected (C) and local (L) routes for its own interfaces; it has no idea 10.2.2.0/24 exists. For PC1 to reach Server1, R1 needs a route to 10.2.2.0/24 **and** R2 needs a route back to 10.1.1.0/24 — forgetting the second half is the single most common static routing mistake, and one the exam loves.',
  },
  {
    kind: 'table',
    title: 'Three ways to write ip route',
    columns: ['Form', 'Command on R1', 'How the route appears'],
    rows: [
      ['**Next hop** (recursive)', '`ip route 10.2.2.0 255.255.255.0 10.0.12.2`', '`S 10.2.2.0/24 [1/0] via 10.0.12.2`'],
      ['**Exit interface** (directly attached)', '`ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1`', '`S 10.2.2.0/24 is directly connected, GigabitEthernet0/0/1`'],
      ['**Fully specified**', '`ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1 10.0.12.2`', '`S 10.2.2.0/24 [1/0] via 10.0.12.2, GigabitEthernet0/0/1`'],
      ['Optional **AD**', 'Add `1`–`255` at the end, e.g. `... 10.0.12.2 130`', 'Shown as `[130/0]` — only if the route wins'],
    ],
    caption: 'Syntax: ip route prefix mask {next-hop | exit-interface | exit-interface next-hop} [AD]',
    notes:
      'The command is always `ip route <prefix> <mask>` followed by *where to send it*. The mask is a **dotted-decimal subnet mask** — IOS does not accept a `/24` prefix length or a wildcard here. With a **next hop** only, the router must later look up that next-hop address to discover which interface to use; this is called a **recursive** route and is the most common form. With an **exit interface** only, IOS lists the route as *directly connected* even though it is static — note that the `[AD/metric]` brackets disappear from the display, but the AD is still **1**. A **fully specified** route names both the interface and the next hop, so no recursive lookup is needed and ARP targets the correct neighbor. An optional number at the end sets the **administrative distance** (default 1); that is how floating static routes are made. Exam questions often show one of these table lines and ask which command produced it, so learn to recognize all three displays.',
  },
  {
    kind: 'cli',
    title: 'Configuring routes in both directions',
    code: `R1(config)# ip route 10.2.2.0 255.255.255.0 10.0.12.2
R1(config)# end
R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
S        10.2.2.0/24 [1/0] via 10.0.12.2

R2(config)# ip route 10.1.1.0 255.255.255.0 10.0.12.1`,
    highlight: ['S        10.2.2.0/24 [1/0] via 10.0.12.2', 'ip route 10.1.1.0 255.255.255.0 10.0.12.1'],
    caption: 'R1 reaches 10.2.2.0/24; R2 needs the mirror-image route back to 10.1.1.0/24.',
    notes:
      'Here R1 gets a next-hop static route to R2\'s LAN. Read the new line carefully: code **S** (static), prefix **10.2.2.0/24**, then **[1/0]** — administrative distance 1, metric 0 (static routes have no metric) — and **via 10.0.12.2**, the next hop. There is no exit interface and no age timer on a next-hop static line. The header line "10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks" counts every 10.x entry in the table: two connected subnets, two local /32s and the new static — five subnets using /30, /32 and /24. The last command is the one beginners forget: **R2 must also route back** to 10.1.1.0/24. Without it, PC1\'s ping reaches Server1, but the echo reply dies at R2, and the ping fails even though R1\'s routing table looks perfect. Routing is always a two-way requirement; the exam hides this by showing you only one router\'s output.',
  },
  {
    kind: 'diagram',
    title: 'Recursive lookup for a next-hop route',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'p', label: 'Packet to 10.2.2.100', shape: 'pill' },
        { id: 'm', label: 'Match S 10.2.2.0/24', sub: 'via 10.0.12.2 — no interface yet' },
        { id: 'r', label: 'Look up 10.0.12.2', sub: 'C 10.0.12.0/30 → G0/0/1', tone: 'accent' },
        { id: 'a', label: 'ARP for 10.0.12.2', sub: 'R2 G0/0/1 MAC' },
        { id: 'f', label: 'Forward out G0/0/1', shape: 'round', tone: 'good' },
      ],
    },
    caption: 'A next hop must itself be reachable through another route — usually a connected one.',
    notes:
      'A next-hop-only static route tells the router *who* to hand the packet to, but not *which interface* leads there. So the router performs a second, **recursive lookup** on the next-hop address. In our example, 10.0.12.2 matches the connected route 10.0.12.0/30 on G0/0/1, which supplies the exit interface; the router then ARPs for 10.0.12.2 (once, then caches it) and forwards the frame to R2\'s MAC. With **CEF**, IOS pre-computes this result in the FIB and adjacency table, so the recursion does not slow every packet down, but the logic is the same. The recursion can go deeper: a next hop that is a remote loopback (say 2.2.2.2 learned via OSPF) is legal, and the router follows the chain until it reaches a connected interface. The practical consequence for the exam: if the next hop cannot be resolved by any route, the static route is **not installed** in the routing table at all.',
  },
  {
    kind: 'diagram',
    title: 'Exit-interface-only routes on Ethernet',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'r2', label: 'R2 (proxy ARP on)', icon: 'router' },
        { id: 's', label: 'Server1', icon: 'server' },
      ],
      steps: [
        { from: 'r1', to: 'r2', label: 'ARP: who has 10.2.2.100?', sub: 'R1 treats all of 10.2.2.0/24 as on-link out G0/0/1' },
        { from: 'r2', to: 'r1', label: 'Proxy ARP reply: use R2\'s MAC', sub: 'Only because ip proxy-arp is enabled (IOS default)', tone: 'warn' },
        { from: 'r1', to: 'r2', label: 'Packet to 10.2.2.100 in a frame to R2' },
        { from: 'r2', to: 's', label: 'R2 routes it normally' },
        { note: 'R1 repeats this ARP for EVERY destination in the prefix — one cache entry per host' },
        { note: 'Proxy ARP disabled on R2 → no reply → R1 drops the packets', tone: 'bad' },
      ],
    },
    notes:
      'When a static route names only an **Ethernet exit interface**, R1 believes every address in the prefix lives directly on that link. To build a frame it must ARP for the **final destination** — 10.2.2.100 — not for R2. That only works because IOS enables **proxy ARP** by default: R2 sees a request for an address it can route to and answers with its own MAC. It works, but badly: R1 sends an ARP for every single destination and keeps an ARP entry for each one, and for a default route pointing out an Ethernet interface that means potentially one entry per Internet host. IOS even prints a performance warning when you configure a default route that way. If the neighbor has `no ip proxy-arp`, the route is still in the table but traffic fails. On **point-to-point serial** links the problem disappears, because there is only one possible neighbor and no ARP. The fix on Ethernet: add the next hop (next-hop or fully specified form).',
  },
  {
    kind: 'bullets',
    title: 'Host routes and default routes',
    bullets: [
      '**Host route**: mask `255.255.255.255` → one address, e.g. `ip route 10.2.2.100 255.255.255.255 192.168.12.2`',
      'Longest prefix match: the **/32 beats the /24** for that one host',
      '**Default route**: `ip route 0.0.0.0 0.0.0.0 203.0.113.1` matches any destination',
      'Displayed as **S*** — the asterisk marks the candidate default',
      '"Gateway of last resort is 203.0.113.1 to network 0.0.0.0"',
      'Used only when **no more specific** route matches',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3.4,
      nodes: [
        { id: 'lan', icon: 'switch', label: 'LAN', sub: '172.16.1.0/24', x: 1, y: 1.6 },
        { id: 'br', icon: 'router', label: 'BR1', sub: '203.0.113.2', x: 3.9, y: 1.6, tone: 'accent' },
        { id: 'isp', icon: 'internet', label: 'ISP', sub: '203.0.113.1', x: 6.9, y: 1.6 },
      ],
      links: [
        { from: 'lan', to: 'br', toLabel: 'G0/0/0' },
        { from: 'br', to: 'isp', fromLabel: 'G0/0/1', label: '0.0.0.0/0', arrow: 'forward', tone: 'accent' },
      ],
    },
    notes:
      'Two special masks produce two special routes. A **host route** uses mask 255.255.255.255 (/32) and matches exactly one address. It is handy for steering a single server or a management address over a different path: if R1 has both 10.2.2.0/24 via the Gigabit link and 10.2.2.100/32 via the serial link, traffic to Server1 takes the serial link while the rest of the subnet uses Gigabit, purely because of **longest prefix match**. At the other extreme, a **default route** uses prefix 0.0.0.0 and mask 0.0.0.0 (/0); zero network bits means it matches every destination, but because it is the *least* specific route possible, the router uses it only when nothing longer matches. Stub routers like BR1 typically carry nothing but connected routes plus one static default toward the ISP. When a default route is installed, `show ip route` flags it with **S*** and fills in the "Gateway of last resort" line — both are frequent exam clues.',
  },
  {
    kind: 'cli',
    title: 'Verifying a static default route',
    code: `BR1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
BR1(config)# end
BR1# show ip route | begin Gateway
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
C        172.16.1.0/24 is directly connected, GigabitEthernet0/0/0
L        172.16.1.1/32 is directly connected, GigabitEthernet0/0/0
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/0/1
L        203.0.113.2/32 is directly connected, GigabitEthernet0/0/1`,
    highlight: ['Gateway of last resort is 203.0.113.1 to network 0.0.0.0', 'S*    0.0.0.0/0 [1/0] via 203.0.113.1'],
    caption: 'Before the route existed, the first line read "Gateway of last resort is not set".',
    notes:
      'After one command, BR1 can reach the whole Internet (assuming the ISP routes back to BR1\'s public addresses or NAT is in place). Three details are exam material. First, the **Gateway of last resort** line changes from "not set" to the next hop and the network 0.0.0.0. Second, the route itself is listed first as **S\*** with [1/0]; the asterisk means *candidate default*. Third, the default route does not hide anything: packets to 172.16.1.50 still match the connected /24, because a /24 is longer than a /0. If you see "Gateway of last resort is not set" on a router that should reach the Internet, the default route is missing or was not installed — often because its next hop is unreachable. Note that a default route learned from OSPF would appear as **O\*E2** instead; that is covered in the OSPF configuration lesson.',
  },
  {
    kind: 'diagram',
    title: 'Floating static route: the backup path',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.2,
      nodes: [
        { id: 'l1', icon: 'switch', label: 'LAN 10.1.1.0/24', x: 0.9, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.6, y: 2 },
        { id: 'l2', icon: 'switch', label: 'LAN 10.2.2.0/24', x: 9.1, y: 2 },
      ],
      links: [
        { from: 'l1', to: 'r1' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', toLabel: 'G0/0/1', label: 'Primary: OSPF [110/2]', style: 'thick', tone: 'good' },
        { from: 'r1', to: 'r2', fromLabel: 'S0/1/0', toLabel: 'S0/1/0', label: 'Backup: static AD 130', style: 'dashed', tone: 'muted' },
        { from: 'r2', to: 'l2' },
      ],
      annotations: [
        { x: 5, y: 3.9, text: 'ip route 10.2.2.0 255.255.255.0 192.168.12.2 130', tone: 'accent' },
      ],
    },
    caption: 'The static waits outside the routing table until the OSPF route disappears.',
    notes:
      'A **floating static route** is an ordinary static route configured with an administrative distance *higher* than the route it backs up, so it "floats" above the table and is not installed while the better route exists. Here R1 learns 10.2.2.0/24 from **OSPF** (AD 110) over the Gigabit link. We add `ip route 10.2.2.0 255.255.255.0 192.168.12.2 130` pointing over the serial link. Because 130 is worse than 110, the router keeps the OSPF route. If the Gigabit path fails and OSPF withdraws its route, the static with AD 130 is the best remaining candidate and is installed immediately; when OSPF recovers, its AD 110 route displaces the static again. The AD you pick must be higher than the primary\'s: above 110 for OSPF, above 90 for EIGRP, or simply 2 or more (5 is common) when the primary is itself a static route. Remember the return path — R2 needs its own floating static back to 10.1.1.0/24 over the serial link.',
  },
];
