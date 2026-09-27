import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'OSPFv3 for IPv6',
    subtitle: 'Same link-state engine, new plumbing: link-local neighbors, FF02::5/6 and a 32-bit router ID',
    notes:
      "OSPF has two versions in everyday use. **OSPFv2**, which you already know, routes IPv4. **OSPFv3** (RFC 5340) was created for IPv6 and keeps the same link-state engine — areas, LSAs, SPF, cost, DR/BDR — while changing how the protocol attaches to interfaces and neighbors. ==OSPFv3 is tested only on the v2.0 exam== (from 3 February 2027); it is not a v1.1 exam topic, so if you are sitting v1.1 you can treat this lesson as background. In this deck you will compare OSPFv3 with OSPFv2, see why it runs per link and forms neighbors with **link-local addresses**, learn its multicast groups **FF02::5** and **FF02::6**, and understand why a **32-bit router ID** is still required even in a pure IPv6 network. Then you will configure it with `ipv6 unicast-routing`, `ipv6 router ospf 1`, `router-id` and the interface command `ipv6 ospf 1 area 0`, add passive interfaces and a default route, verify with the `show ipv6 ospf` family of commands, and troubleshoot the two classic failures: a missing router ID and an area mismatch.",
  },
  {
    kind: 'bullets',
    title: 'The lab network for this lesson',
    bullets: [
      'Three routers, **OSPFv3 process 1**, all in **area 0**',
      'IPv6-only: no IPv4 addresses anywhere',
      'Static link-locals: R1 **FE80::1**, R2 **FE80::2**, R3 **FE80::3**',
      'Router IDs set manually: 1.1.1.1, 2.2.2.2, 3.3.3.3',
      'LAN interfaces are **passive**',
      'R1 originates a **default route** from its ISP link',
    ],
    diagram: {
      type: 'topology',
      width: 11,
      height: 5,
      nodes: [
        { id: 'isp', icon: 'internet', label: 'ISP', sub: '::/0', x: 1, y: 2.3 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'RID 1.1.1.1 · FE80::1', x: 3.6, y: 2.3, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'RID 2.2.2.2 · FE80::2', x: 6.6, y: 2.3 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'RID 3.3.3.3 · FE80::3', x: 9.6, y: 2.3 },
        { id: 'l1', icon: 'switch', label: 'LAN 1', sub: '2001:DB8:1:1::/64', x: 3.6, y: 4.2 },
        { id: 'l2', icon: 'switch', label: 'LAN 2', sub: '2001:DB8:2:2::/64', x: 6.6, y: 4.2 },
        { id: 'l3', icon: 'switch', label: 'LAN 3', sub: '2001:DB8:3:3::/64', x: 9.6, y: 4.2 },
      ],
      links: [
        { from: 'isp', to: 'r1', toLabel: 'G0/0/2', style: 'dashed' },
        { from: 'r1', to: 'r2', label: '2001:DB8:0:12::/64', fromLabel: 'G0/0/0', toLabel: 'G0/0/0' },
        { from: 'r2', to: 'r3', label: '2001:DB8:0:23::/64', fromLabel: 'G0/0/1', toLabel: 'G0/0/1' },
        { from: 'r1', to: 'l1', fromLabel: 'G0/0/1' },
        { from: 'r2', to: 'l2', fromLabel: 'G0/0/2' },
        { from: 'r3', to: 'l3', fromLabel: 'G0/0/0' },
      ],
      groups: [{ label: 'OSPFv3 process 1 · area 0', x: 2.5, y: 1, w: 8.2, h: 3.9 }],
    },
    notes:
      "Every example in this lesson uses this small network, so you can follow one story from configuration to verification. Three routers run **OSPFv3 process 1** in **area 0**. R1 connects to the ISP and will advertise a default route into OSPFv3; each router also has a user LAN that must be advertised but should never form adjacencies. The transit links use 2001:DB8:0:12::/64 and 2001:DB8:0:23::/64, and to make the output easier to read, each router's interfaces use a static link-local address: FE80::1 on R1, FE80::2 on R2 and FE80::3 on R3. The network is **IPv6-only** — no router has an IPv4 address — and that matters later: OSPFv3 still needs a 32-bit router ID, so each router is given one manually (1.1.1.1, 2.2.2.2 and 3.3.3.3). Remember that this whole lesson is **v2.0-only** content; v1.1 does not test OSPFv3. When you study the show commands, trace them back to this drawing: which router is the DR on each link, which link-local address is each router's next hop, and what cost each route should have.",
  },
  {
    kind: 'compare',
    title: 'OSPFv3 vs OSPFv2: same engine, new plumbing',
    left: {
      heading: 'Unchanged from OSPFv2',
      bullets: [
        'Link-state database + **SPF** (Dijkstra)',
        'Cost metric, reference bandwidth 100 Mbps',
        'Areas, backbone **area 0**, DR/BDR election',
        'Same neighbor states and **10/40 s** timers',
        '**32-bit** router ID, AD **110**',
      ],
    },
    right: {
      heading: 'New in OSPFv3',
      tone: 'accent',
      bullets: [
        'Enabled **per interface** — no `network` command',
        'Runs **per link**, not per subnet',
        'Packets sourced from **link-local** addresses',
        'Multicast **FF02::5** and **FF02::6**',
        'IPsec for authentication; new prefix LSAs',
      ],
    },
    notes:
      "Most of what you learned about OSPFv2 carries straight over. OSPFv3 still builds a link-state database, runs **SPF** (Dijkstra) to find the lowest-**cost** paths, uses the same cost formula based on a 100 Mbps reference bandwidth, organizes routers into **areas** around backbone area 0, elects a **DR** and **BDR** on broadcast links, moves neighbors through the same states (Down, Init, 2-Way, ExStart, Exchange, Loading, Full) and uses the same default **hello and dead timers** — 10 and 40 seconds on broadcast and point-to-point links. Its administrative distance is still **110**, and even the router ID is still a **32-bit** dotted-decimal number. What changed is the plumbing. OSPFv3 is enabled **per interface** rather than with `network` statements, runs per **link** rather than per subnet, sends its packets from **link-local** addresses to the IPv6 multicast groups **FF02::5** and **FF02::6**, relies on IPv6 **IPsec** instead of built-in passwords for authentication, and separates addressing from topology with new LSA types that carry prefixes. Exam items often present a mix of statements about the two versions, so practice sorting each one into 'same' or 'changed'.",
  },
  {
    kind: 'table',
    title: 'OSPFv2 vs OSPFv3 at a glance',
    columns: ['Feature', 'OSPFv2', 'OSPFv3'],
    rows: [
      ['Routes', 'IPv4', 'IPv6 (IPv4 too with address families)'],
      ['How it is enabled', '`network` command or `ip ospf 1 area 0`', '`ipv6 ospf 1 area 0` on the interface'],
      ['Runs per', 'Subnet', 'Link'],
      ['Packet source address', 'Interface IPv4 address', 'Interface **link-local** (FE80::/10)'],
      ['All OSPF routers', '224.0.0.5', '**FF02::5**'],
      ['DR and BDR only', '224.0.0.6', '**FF02::6**'],
      ['Router ID', '32-bit', '32-bit — still required'],
      ['Authentication', 'Built in (plain text or cryptographic)', 'IPv6 IPsec (AH/ESP)'],
      ['AD / IP protocol', '110 / 89', '110 / 89'],
    ],
    notes:
      "Use this table as your OSPFv3 cheat sheet. The two multicast addresses map directly: OSPFv2's AllSPFRouters address 224.0.0.5 becomes **FF02::5**, and AllDRouters 224.0.0.6 becomes **FF02::6**. The FF02 prefix means link-local scope, so these packets never leave the link — exactly like their IPv4 counterparts, which routers never forward. Every OSPFv3 packet is sourced from the interface's **link-local address**, which is why IPv6 must be enabled on an interface (any IPv6 address automatically creates a link-local) before OSPFv3 can use it. The configuration model changed too: OSPFv3 has **no `network` command**, so you enable it on each interface with `ipv6 ospf <process> area <area>`. OSPFv2 can also be enabled per interface with `ip ospf 1 area 0`, which makes the two look similar in modern configurations. The router ID is still a 32-bit value, not an IPv6 address — a favorite trick question. Both versions use IP protocol number 89 and administrative distance 110. Finally, newer IOS releases can run OSPFv3 with **address families** to carry IPv4 as well, but the CCNA focuses on the classic IPv6 configuration shown in this lesson.",
  },
  {
    kind: 'diagram',
    title: 'Hellos: link-local sources, FF02::5 and FF02::6',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1 · FE80::1 · BDR', icon: 'router' },
        { id: 'r2', label: 'R2 · FE80::2 · DR', icon: 'router' },
      ],
      steps: [
        { from: 'r1', to: 'r2', label: 'Hello → FF02::5', sub: 'src FE80::1 · RID 1.1.1.1 · area 0 · 10/40 s' },
        { from: 'r2', to: 'r1', label: 'Hello → FF02::5', sub: 'src FE80::2 · lists 1.1.1.1 as seen' },
        { note: '2-Way, then DR/BDR election: higher RID 2.2.2.2 becomes DR' },
        { from: 'r1', to: 'r2', label: 'LSU → FF02::6 (DR and BDR)', sub: 'non-DR routers send updates to the DR' },
        { from: 'r2', to: 'r1', label: 'DR floods LSU → FF02::5', tone: 'accent' },
        { note: 'Routes learned from R2 use next hop FE80::2' },
      ],
    },
    caption: 'Every OSPFv3 packet on this link is sourced from a link-local address.',
    notes:
      "Here is OSPFv3 in action on the R1–R2 link. Each router sends **hellos** every 10 seconds to **FF02::5**, the all-OSPF-routers group, using its **link-local** address as the source — FE80::1 for R1 and FE80::2 for R2 — never its global unicast address. The hello carries the router ID, area, timers, priority and the list of neighbors already heard. When each router sees its own RID in the other's hello, they reach **2-Way**. On a broadcast link they then elect a DR and BDR exactly as in OSPFv2: highest priority wins, then highest router ID, so R2 (2.2.2.2) becomes DR and R1 becomes BDR when they start together. After the database exchange, routers that are not the DR send link-state updates to **FF02::6**, the DR/BDR group, and the DR re-floods them to everyone on **FF02::5**. Because neighbors know each other by link-local address, R1 will install routes learned through R2 with **FE80::2** as the next hop, plus the outgoing interface. That combination is required because the same link-local address can exist on many links. On the v2.0 exam, expect to identify these two multicast addresses and the link-local source.",
  },
  {
    kind: 'bullets',
    title: 'Runs per link, not per subnet',
    bullets: [
      'Enabled **per interface**; hellos carry **no prefix or mask**',
      'No subnet check between neighbors',
      'Different global prefixes on one link → still **neighbors**',
      'A transit link can run with **only link-local** addresses',
      'Prefixes travel in their own LSAs, apart from topology',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.4,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: '2001:DB8:0:12::1/64', x: 1.8, y: 1.5 },
        { id: 'r2', icon: 'router', label: 'R2', sub: '2001:DB8:0:99::2/64', x: 8.2, y: 1.5 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'FE80::1 ↔ FE80::2 · FULL', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', tone: 'good' },
      ],
      annotations: [{ x: 5, y: 2.9, text: 'Mismatched global prefixes do not block the adjacency', tone: 'accent' }],
    },
    notes:
      "OSPFv2 is tied to IPv4 subnets: its hello carries the interface's network mask, and neighbors on broadcast links must agree on the subnet before they talk. OSPFv3 was redesigned to run **per link**. You enable it on an interface, the router sends hellos from its link-local address, and the hello packet no longer contains any prefix or mask at all. As a result, two routers on the same link become neighbors even if their global unicast prefixes disagree — as in the drawing, where a typo put R2 in 2001:DB8:0:99::/64. The adjacency still reaches FULL, and each router simply advertises the prefix configured on its own interface. A transit link does not even need global addresses: an interface with just a link-local address (for example after `ipv6 enable`) can carry OSPFv3, because next hops are link-local anyway. This works because OSPFv3 separates topology from addressing: router and network LSAs describe who connects to whom, while dedicated prefix LSAs carry the IPv6 prefixes. For the exam, remember the consequence: mismatched global prefixes are **not** a cause of OSPFv3 neighbor failure, while a mismatched area, timers or a passive interface are.",
  },
  {
    kind: 'bullets',
    title: 'The 32-bit router ID is still required',
    bullets: [
      'RID = **32-bit** dotted-decimal value, never an IPv6 address',
      'Same selection order as OSPFv2',
      'No IPv4 addresses and no `router-id` → **no RID**',
      'Without a RID the OSPFv3 process **will not start**',
      'Best practice: always set `router-id` manually',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'router-id command', sub: '1st choice', tone: 'accent' },
        { id: 'n2', label: 'Highest loopback IPv4', sub: '2nd choice' },
        { id: 'n3', label: 'Highest active interface IPv4', sub: '3rd choice' },
        { id: 'n4', label: 'No router ID', sub: 'OSPFv3 cannot start', tone: 'bad', shape: 'round' },
      ],
    },
    notes:
      "Even though OSPFv3 routes IPv6, it identifies routers with the same **32-bit router ID** as OSPFv2, written in dotted decimal, such as 1.1.1.1. The RID appears in hellos, LSAs and the Neighbor ID column, and it decides DR elections when priorities tie. It is chosen in the familiar order: first a manually configured `router-id` under `ipv6 router ospf 1`; if there is none, the highest IPv4 address on an up **loopback** interface; if there is none, the highest IPv4 address on any other active interface. Notice what is missing: IPv6 addresses are never used, because they are 128 bits long and cannot fit. That creates the classic OSPFv3 failure. On a router with **no IPv4 addresses at all** and no `router-id` command, OSPFv3 cannot pick a router ID, logs a message saying it could not pick a router ID and asking you to configure one manually, and the process does not run — so no hellos, no neighbors and no routes. Dual-stack routers usually get a RID from IPv4, which hides the issue until the day IPv4 is removed. Always configure `router-id` explicitly; it keeps the RID stable and predictable.",
  },
  {
    kind: 'steps',
    title: 'Configuration roadmap',
    steps: [
      { title: 'Enable IPv6 routing', text: '`ipv6 unicast-routing` — IOS will not start OSPFv3 without it.' },
      { title: 'Create the process', text: '`ipv6 router ospf 1` — the process ID is locally significant.' },
      { title: 'Set the router ID', text: '`router-id 1.1.1.1` — mandatory on IPv6-only routers.' },
      { title: 'Enable OSPFv3 on interfaces', text: '`ipv6 ospf 1 area 0` in interface mode — no network command.' },
      { title: 'Tune the process', text: '`passive-interface`, `default-information originate`, `ipv6 ospf cost`.' },
      { title: 'Verify', text: '`show ipv6 ospf neighbor`, `show ipv6 ospf interface brief`, `show ipv6 route ospf`.' },
    ],
    notes:
      "Configuring OSPFv3 takes only a handful of commands, but order and placement matter. First, `ipv6 unicast-routing` turns the router into an IPv6 router; without it the router behaves like an IPv6 host and IOS refuses to create an IPv6 routing process. Second, `ipv6 router ospf 1` creates the process and enters router configuration mode, shown by the `(config-rtr)#` prompt. The process ID, like OSPFv2's, is **locally significant** — neighbors do not need matching process IDs. Third, `router-id` gives the process its 32-bit identity. Fourth, and most different from OSPFv2, you enable OSPFv3 **on each interface** with `ipv6 ospf 1 area 0`; the process ID and area are both specified here, and there is no `network` command to fall back on. Entering the interface command when the process does not yet exist creates it automatically. Fifth, tune the process: make LAN interfaces passive, originate a default route, or adjust costs with `ipv6 ospf cost` in interface mode. Finally, verify from the bottom up: neighbors, then interfaces, then routes. Remember that this configuration is v2.0-only exam material, and that the interface command is the one candidates most often forget.",
  },
  {
    kind: 'cli',
    title: 'Basic OSPFv3 configuration on R1',
    code: `R1(config)# ipv6 unicast-routing
R1(config)# ipv6 router ospf 1
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# exit
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 address 2001:DB8:0:12::1/64
R1(config-if)# ipv6 address FE80::1 link-local
R1(config-if)# ipv6 ospf 1 area 0
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ipv6 address 2001:DB8:1:1::1/64
R1(config-if)# ipv6 address FE80::1 link-local
R1(config-if)# ipv6 ospf 1 area 0
R1(config-if)# end`,
    highlight: ['ipv6 unicast-routing', 'router-id 1.1.1.1', 'ipv6 ospf 1 area 0'],
    caption: 'R2 and R3 mirror this with router IDs 2.2.2.2 and 3.3.3.3 and link-locals FE80::2 and FE80::3.',
    notes:
      "This is the complete core configuration for R1. `ipv6 unicast-routing` enables IPv6 forwarding. `ipv6 router ospf 1` creates OSPFv3 process 1, and `router-id 1.1.1.1` gives it an identity — essential here because R1 has no IPv4 addresses. Each interface then gets a global unicast address, an optional static link-local address and the key command **`ipv6 ospf 1 area 0`**, which both enables OSPFv3 on the link and places it in area 0. Setting link-local addresses manually is optional; routers otherwise build them automatically (typically from the MAC address using EUI-64), but short values like FE80::1 make neighbor and route output far easier to read. Reusing FE80::1 on two interfaces is legal, because a link-local address only has to be unique on its own link. As soon as R2's matching interface is configured, the routers exchange hellos from FE80::1 and FE80::2 and progress to FULL. Notice what you did **not** type: no `network` statements, no wildcard masks and no IPv4 at all. A common exam distractor offers `network 2001:DB8:0:12::/64 area 0`, which is not valid for OSPFv3. The interface command is also where you would set `ipv6 ospf cost` or `ipv6 ospf priority` if needed.",
  },
  {
    kind: 'cli',
    title: 'Passive interfaces and default route origination',
    code: `R1(config)# ipv6 route ::/0 2001:DB8:FFFF::2
R1(config)# ipv6 router ospf 1
R1(config-rtr)# passive-interface GigabitEthernet0/0/1
R1(config-rtr)# default-information originate
R1(config-rtr)# end
R1# show ipv6 ospf interface GigabitEthernet0/0/1 | include Area|Passive
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
    No Hellos (Passive interface)`,
    highlight: ['passive-interface GigabitEthernet0/0/1', 'default-information originate', 'No Hellos (Passive interface)'],
    caption: 'The LAN prefix is still advertised; the default route reaches R2 and R3 as an OE2 route.',
    notes:
      "Two refinements complete R1. First, the user LAN on G0/0/1 has no routers on it, so sending hellos there is pointless and risky — a rogue device could form an adjacency and inject routes. `passive-interface GigabitEthernet0/0/1` under `ipv6 router ospf 1` stops hellos on that interface while still **advertising its prefix**, which the output confirms with 'No Hellos (Passive interface)'. On routers with many LAN interfaces, `passive-interface default` followed by `no passive-interface` on the transit links is quicker. Second, R1 is the exit to the Internet. It has a static IPv6 default route, `ipv6 route ::/0 2001:DB8:FFFF::2`, and `default-information originate` tells OSPFv3 to advertise ::/0 to the rest of the domain, making R1 an ASBR. By default the default route is only advertised while R1 actually has a ::/0 route in its routing table; adding the keyword `always` advertises it regardless — useful in labs, dangerous in production if the ISP link fails. Other routers learn the route as **OE2 ::/0** with a metric of 1. Notice that the ISP-facing interface is not enabled for OSPFv3 at all, so no adjacency can form with the provider. These two commands are named in the v2.0 blueprint's OSPFv3 coverage, so know their exact placement: router configuration mode.",
  },
  {
    kind: 'cli',
    title: 'Verify neighbors: show ipv6 ospf neighbor',
    code: `R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    5               GigabitEthernet0/0/0
3.3.3.3           1   FULL/DR         00:00:38    6               GigabitEthernet0/0/1`,
    highlight: ['FULL/BDR', 'FULL/DR', '1.1.1.1', '3.3.3.3'],
    caption: 'Neighbor ID is the 32-bit router ID; the role after FULL/ is the neighbor\'s role on that link.',
    notes:
      "`show ipv6 ospf neighbor` is the first command to run, and it looks almost identical to its OSPFv2 counterpart. The header confirms the local router ID (2.2.2.2) and process. **Neighbor ID** is each neighbor's 32-bit router ID — not an IPv6 address — so a question asking for R1's 'address' from this output is a trap. **Pri** is the neighbor's priority. **State** shows the adjacency state and, after the slash, the **neighbor's role** on that link: 1.1.1.1 is the BDR on G0/0/0 (so R2 is the DR there), and 3.3.3.3 is the DR on G0/0/1 (so R2 is the BDR there). FULL means the databases are synchronized. **Dead Time** counts down from 40 seconds and resets with every hello received. The biggest difference from OSPFv2 is the column where you might expect the neighbor's address: OSPFv3 shows the neighbor's **Interface ID** instead, a number the neighbor uses to identify its own interface. To see the neighbor's link-local address, use `show ipv6 ospf neighbor detail`. If a neighbor you expect is missing entirely, move on to the interface checks on the next slides — area, timers and passive settings.",
  },
  {
    kind: 'cli',
    title: 'Verify interfaces: show ipv6 ospf interface',
    code: `R2# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/0/2      1     0               7          1     DR    0/0
Gi0/0/1      1     0               6          1     BDR   1/1
Gi0/0/0      1     0               5          1     DR    1/1
R2# show ipv6 ospf interface GigabitEthernet0/0/0 | include Link Local|Area|Timer
  Link Local Address FE80::2, Interface ID 5
  Area 0, Process ID 1, Instance ID 0, Router ID 2.2.2.2
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,
    highlight: ['Area', 'FE80::2', 'Hello 10, Dead 40'],
    caption: 'Nbrs F/C = neighbors fully adjacent / neighbor count. Gi0/0/2 is the passive LAN.',
    notes:
      "`show ipv6 ospf interface brief` lists every interface where OSPFv3 is enabled — so an interface missing from this list simply was not given `ipv6 ospf 1 area 0`. Each row shows the process ID, the **area**, the interface ID, the OSPF **cost**, the interface **state** and **Nbrs F/C** (fully adjacent neighbors / total neighbors). R2 is DR on Gi0/0/0, BDR on Gi0/0/1, and DR on its passive LAN Gi0/0/2 with 0/0 neighbors, because it is alone there. Cost 1 on gigabit links comes from the default 100 Mbps reference bandwidth; a loopback would show state LOOP. The Area column is the fastest way to find an area mismatch: compare it with the neighbor's output for the same link. The detailed form of the command adds the pieces you need for deeper troubleshooting. Filtering with `include` shows the interface's **link-local address** and interface ID, the area, process, instance ID and router ID, and the **hello and dead timers** — 10 and 40 seconds by default on Ethernet. Timers must match between neighbors, and the default instance ID of 0 must match too. On the exam, a pair of these outputs from two routers is a common exhibit for 'why are these routers not neighbors?' questions.",
  },
  {
    kind: 'cli',
    title: 'Verify routes: show ipv6 route ospf',
    code: `R3# show ipv6 route ospf
IPv6 Routing Table - default - 9 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
<output omitted>
OE2 ::/0 [110/1], tag 1
     via FE80::2, GigabitEthernet0/0/1
O   2001:DB8:0:12::/64 [110/2]
     via FE80::2, GigabitEthernet0/0/1
O   2001:DB8:1:1::/64 [110/3]
     via FE80::2, GigabitEthernet0/0/1
O   2001:DB8:2:2::/64 [110/2]
     via FE80::2, GigabitEthernet0/0/1`,
    highlight: ['OE2 ::/0', 'via FE80::2', '[110/3]'],
    caption: 'Next hops are link-local addresses plus the exit interface. [110/3] = AD 110, cost 3.',
    notes:
      "`show ipv6 route ospf` filters the IPv6 routing table down to OSPF-learned routes. The codes match OSPFv2 with an IPv6 flavor: **O** for intra-area routes, **OI** for inter-area routes, and **OE1/OE2** for external routes — here the default route ::/0 that R1 originated, arriving as OE2 with the default external metric of 1. The numbers in brackets are **administrative distance / metric**: [110/3] means AD 110 and a cost of 3. Check the cost to R1's LAN yourself: R3's link to R2 costs 1, R2's link to R1 costs 1 and R1's LAN interface costs 1, for a total of 3. The transit link 2001:DB8:0:12::/64 and R2's LAN each cost 2. The most important detail is the next hop: every route points to **FE80::2**, R2's link-local address, together with the exit interface GigabitEthernet0/0/1. Because link-local addresses are only unique per link, the interface is required to make the next hop meaningful. Candidates who expect to see R2's global address (2001:DB8:0:23::2) as the next hop pick the wrong answer. If a route you expect is missing, check that the remote interface is running OSPFv3 and that its prefix is not filtered, then return to the neighbor table.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: no router ID',
    code: `R4(config)# ipv6 unicast-routing
R4(config)# interface GigabitEthernet0/0/0
R4(config-if)# ipv6 address 2001:DB8:0:24::4/64
R4(config-if)# ipv6 ospf 1 area 0
%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id,
please configure manually
R4(config-if)# exit
R4(config)# ipv6 router ospf 1
R4(config-rtr)# router-id 4.4.4.4
R4(config-rtr)# end
R4# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/0/0      1     0               5          1     DR    0/0`,
    highlight: ['NORTRID', 'router-id 4.4.4.4'],
    caption: 'R4 has no IPv4 address, so OSPFv3 cannot choose a router ID until one is configured.',
    notes:
      "This transcript shows the most common OSPFv3 problem on IPv6-only routers. R4 has IPv6 routing enabled and a global address on G0/0/0, but no IPv4 address anywhere. Entering `ipv6 ospf 1 area 0` automatically creates OSPFv3 process 1, which immediately tries to choose a router ID. With no `router-id` command, no IPv4 loopback and no IPv4 interface address, it fails and logs the **NORTRID** message: the process could not pick a router ID, please configure one manually. The exact wording varies slightly between IOS releases, but the mnemonic NORTRID and the advice are consistent. Until you act, the process is not running: no hellos are sent, `show ipv6 ospf neighbor` stays empty and no OSPF routes appear. The fix is exactly what the message says — `router-id 4.4.4.4` under `ipv6 router ospf 1`. The process then starts, the interface appears in `show ipv6 ospf interface brief` (DR with 0/0 neighbors until a neighbor joins) and adjacencies can form. Adding an IPv6 loopback would not help, because IPv6 addresses are never used for the router ID. Expect this scenario on the v2.0 exam as an exhibit with an IPv6-only router and the question 'what must be configured?'",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: area mismatch',
    code: `R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:34    5               GigabitEthernet0/0/0
R2# show ipv6 ospf interface brief | include Gi0/0/1
Gi0/0/1      1     0               6          1     DR    0/0
R3# show ipv6 ospf interface brief | include Gi0/0/1
Gi0/0/1      1     1               6          1     DR    0/0`,
    highlight: ['1     1', 'DR    0/0'],
    caption: 'R2 has Gi0/0/1 in area 0, R3 has its end of the same link in area 1: no adjacency.',
    notes:
      "Here R3 is no longer listed as R2's neighbor. The interface output explains why: on the shared link, R2's Gi0/0/1 is in **area 0**, but R3's Gi0/0/1 is in **area 1** — someone typed `ipv6 ospf 1 area 1` on R3. Every hello carries the area ID, and a router ignores hellos whose area does not match the receiving interface, so the two routers never even reach Init. Each side, alone on the link as far as OSPF is concerned, declares itself **DR with 0/0 neighbors**. That 'DR, 0/0' pattern on a link that should have a neighbor is a strong hint to compare area, timers and passive settings on both ends. Note what is **not** the cause: both routers use process ID 1, but even different process IDs would be fine because the process ID is locally significant; the global prefixes do not matter either. The fix is to put both ends of the link in the same area — for example `ipv6 ospf 1 area 0` on R3's Gi0/0/1 — after which the routers exchange hellos and progress to FULL. Also keep the wider design in mind: in a multi-area design, every non-backbone area must connect to area 0 through an ABR, so a misplaced area can also isolate an entire section of the network.",
  },
  {
    kind: 'table',
    title: 'OSPFv3 neighbor checklist',
    columns: ['Parameter', 'Must match?', 'Symptom if wrong'],
    rows: [
      ['Area ID on the link', 'Yes', 'No neighbor at all'],
      ['Hello and dead timers', 'Yes', 'No neighbor at all'],
      ['Instance ID (default 0)', 'Yes', 'No neighbor at all'],
      ['Stub or NSSA area flag', 'Yes', 'No neighbor at all'],
      ['Authentication', 'Yes', 'No neighbor at all'],
      ['Interface MTU', 'Yes', 'Stuck in EXSTART/EXCHANGE'],
      ['Router IDs', 'Must be **unique**', 'Adjacency problems, duplicate-RID messages'],
      ['Passive interface', 'Must **not** be passive', 'No hellos sent → no neighbor'],
      ['Global IPv6 prefix / process ID', '**No**', 'Neighbors still form'],
    ],
    notes:
      "When two OSPFv3 routers on the same link refuse to become neighbors, work through this list — it is the OSPFv2 list with a couple of IPv6 twists. The values carried in the hello must match: the **area ID**, the **hello and dead intervals** (10/40 seconds by default on Ethernet), the **instance ID** (0 by default; it lets several OSPFv3 instances share a link), the stub or NSSA **area type**, and any **authentication**. A mismatch in any of these means the hellos are discarded and the neighbor never appears. **MTU** is different: hellos are accepted, but the database description exchange fails, so the neighbors hang in EXSTART or EXCHANGE. Router IDs must be **unique**; a duplicate — easy to create by copying a configuration template — causes adjacency problems and log messages about duplicate router IDs. A **passive** interface sends no hellos, so no neighbor can form across it. Finally, two items that do **not** need to match: the global unicast prefix, because OSPFv3 runs per link and hellos carry no prefix, and the process ID, which is locally significant. Exam troubleshooting questions frequently offer those two as tempting but wrong answers.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: OSPFv3 (v2.0 only)',
    body: 'OSPFv3 neighbors talk from **link-local** addresses to **FF02::5** (all routers) and **FF02::6** (DR/BDR), yet still need a **32-bit router ID** — no IPv4 address and no `router-id` means the process never starts.',
    bullets: [
      'Enable with `ipv6 ospf 1 area 0` on the interface — no `network` command',
      '`ipv6 unicast-routing` must be configured first',
      'Neighbor ID column = router ID, not an IPv6 address',
      'Route next hops = **FE80::** link-local + exit interface',
      'Area mismatch → no neighbor; different global prefixes → still neighbors',
      '`default-information originate` needs ::/0 in the table (or `always`)',
      'Process IDs are locally significant; AD is still 110',
    ],
    notes:
      "Remember first that OSPFv3 is **v2.0-only** material. When it appears, these are the points that decide the question. The multicast pair **FF02::5** and **FF02::6** replaces 224.0.0.5 and 224.0.0.6, and every packet is sourced from a **link-local** address. The router ID is still a 32-bit number chosen from the `router-id` command or IPv4 addresses; an IPv6-only router without `router-id` logs NORTRID and runs nothing. Configuration happens on the interface with `ipv6 ospf <pid> area <area>`; any answer that uses a `network` command with an IPv6 prefix is wrong. Without `ipv6 unicast-routing`, the router cannot route IPv6 at all. In show output, the Neighbor ID is a router ID, and routing-table next hops are **link-local addresses paired with an interface** — distractors often offer the neighbor's global address instead. For troubleshooting, an **area mismatch**, timer mismatch or passive interface prevents adjacency, while mismatched global prefixes and different process IDs do not. `default-information originate` only advertises ::/0 when the router has a default route, unless you add `always`. Finally, the administrative distance is 110, exactly as in OSPFv2.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'OSPFv3 = OSPF for IPv6; same SPF, areas, cost, DR/BDR, AD 110',
      'Runs per link; link-local sources; FF02::5 and FF02::6',
      'Still needs a 32-bit RID: `router-id` or an IPv4 address',
      '`ipv6 unicast-routing` → `ipv6 router ospf 1` → `ipv6 ospf 1 area 0`',
      '`passive-interface` and `default-information originate` in router mode',
      'Verify: neighbor, interface brief, route ospf',
      'Fix: missing RID (NORTRID) and area mismatches',
    ],
    notes:
      "OSPFv3 is the IPv6 version of OSPF and a **v2.0-only** exam topic. It keeps OSPF's link-state engine — SPF, cost, areas, DR/BDR elections, neighbor states, 10/40-second timers and an administrative distance of 110 — but runs **per link**, sends packets from **link-local** addresses to **FF02::5** and **FF02::6**, and carries prefixes separately from topology, so neighbors form even when global prefixes differ. It still requires a **32-bit router ID**, taken from the `router-id` command or, failing that, from IPv4 addresses; an IPv6-only router needs `router-id` or the process will not start. Configuration is short: `ipv6 unicast-routing`, `ipv6 router ospf 1`, `router-id`, and `ipv6 ospf 1 area 0` on every participating interface. In router mode, `passive-interface` silences hellos on LANs while still advertising them, and `default-information originate` advertises ::/0 when a default route exists. Verify with `show ipv6 ospf neighbor` (router IDs, states, roles), `show ipv6 ospf interface brief` (area, cost, state, neighbor counts) and `show ipv6 route ospf` (O, OI, OE2 routes with link-local next hops). When neighbors fail, check the router ID first, then area, timers, passive settings and MTU.",
  },
];
