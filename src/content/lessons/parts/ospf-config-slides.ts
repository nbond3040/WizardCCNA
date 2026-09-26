import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Configuring Single-Area OSPFv2',
    subtitle: 'From `router ospf` to a verified, load-balanced area 0 with a default route',
    notes:
      "In the previous lesson you built the theory; now you will make three routers speak OSPF and prove that it works. Exam topic 3.4 in v1.1 says *configure and verify single-area OSPFv2*, and the v2.0 blueprint keeps OSPF in its domain 3, so expect both configuration questions (which command achieves this?) and exhibit questions built on show output. This deck uses one small lab throughout: R1, R2 and R3 in area 0, a LAN behind R2 and R3, and an Internet link on R1. You will enable OSPF with **network** statements and with the interface command **ip ospf area**, silence Hellos on user LANs with **passive-interface**, inject a default route with **default-information originate**, align costs with **auto-cost reference-bandwidth**, and control equal-cost load balancing with **maximum-paths**. Then we read five verification commands line by line, because exam exhibits come from exactly these outputs: `show ip ospf neighbor`, `show ip ospf interface`, `show ip protocols`, `show ip route ospf` and `show ip ospf database`.",
  },
  {
    kind: 'diagram',
    title: 'The lab: three routers in area 0',
    diagram: {
      type: 'topology',
      width: 10,
      height: 6,
      nodes: [
        { id: 'isp', icon: 'internet', label: 'ISP', sub: '203.0.113.1', x: 9.2, y: 1 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'RID 1.1.1.1', x: 5, y: 1.4, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'RID 2.2.2.2', x: 2.6, y: 3.4 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'RID 3.3.3.3', x: 7.4, y: 3.4 },
        { id: 'lan2', icon: 'switch', label: 'LAN', sub: '192.168.2.0/24', x: 2.6, y: 5.2 },
        { id: 'lan3', icon: 'switch', label: 'LAN', sub: '192.168.3.0/24', x: 7.4, y: 5.2 },
      ],
      links: [
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', label: '10.0.12.0/30' },
        { from: 'r1', to: 'r3', fromLabel: 'G0/0/1', toLabel: 'G0/0/0', label: '10.0.13.0/30' },
        { from: 'r2', to: 'r3', fromLabel: 'G0/0/2', toLabel: 'G0/0/2', label: '10.0.23.0/30' },
        { from: 'r1', to: 'isp', fromLabel: 'G0/0/2', label: '203.0.113.0/30', style: 'dashed' },
        { from: 'r2', to: 'lan2', fromLabel: 'G0/0/1' },
        { from: 'r3', to: 'lan3', fromLabel: 'G0/0/1' },
      ],
      groups: [{ label: 'OSPF area 0', x: 0.4, y: 0.4, w: 8, h: 5.4 }],
    },
    caption: 'Lower-numbered router takes .1 on each /30; LAN gateways are .1; Loopback0 = router ID.',
    notes:
      "Every example in this deck uses this topology, so take a minute to learn it. Three routers form a triangle of Ethernet links, each a /30: 10.0.12.0/30 between R1 and R2, 10.0.13.0/30 between R1 and R3, and 10.0.23.0/30 between R2 and R3. The lower-numbered router takes the .1 address on each link, so R1 is .1 on both of its links, R3 is .2 on both of its links, and R2 is .2 toward R1 and .1 toward R3. R2 and R3 each have a user LAN, 192.168.2.0/24 and 192.168.3.0/24, with the router at .1. Each router has a Loopback0 that matches its router ID: 1.1.1.1, 2.2.2.2 and 3.3.3.3. R1 also connects to an ISP on 203.0.113.0/30. That link must **not** run OSPF — you never want an adjacency with a provider — so R1 uses a static default route and advertises it into OSPF instead. Each router is configured a different way: R1 with broad network statements, R2 with interface commands, and R3 with exact network statements plus passive-interface default, so you see every method the exam can ask about.",
  },
  {
    kind: 'bullets',
    title: 'router ospf: the process ID is local',
    bullets: [
      '`router ospf 1` — process ID 1–65535',
      '==The process ID is locally significant== — neighbors may differ',
      'The **area** must match on both ends of a link',
      'Set `router-id` first, before any neighbor forms',
      'Then enable interfaces: `network` or `ip ospf … area`',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3,
      nodes: [
        { id: 'a', icon: 'router', label: 'RA', sub: 'router ospf 1', x: 1.5, y: 1.5 },
        { id: 'b', icon: 'router', label: 'RB', sub: 'router ospf 20', x: 6.5, y: 1.5 },
      ],
      links: [{ from: 'a', to: 'b', label: 'area 0 · FULL', tone: 'good' }],
    },
    notes:
      "Configuration starts with `router ospf` followed by a **process ID** from 1 to 65535. The process ID only identifies the OSPF instance inside this one router; it is never carried in any OSPF packet, so it is **locally significant** and neighbors do not need to agree on it. In the diagram RA runs process 1 and RB runs process 20, and they still reach Full. What must match is the **area**, plus the Hello parameters from the previous lesson. A router can run more than one OSPF process, but that is unusual and beyond the CCNA. The first command inside the process should be `router-id`: setting it before any interface is enabled means the ID is in place when the first neighbor forms, so you never need `clear ip ospf process`. Next you choose how to enable OSPF on interfaces, either with network statements in router configuration mode or with a command on each interface; the next slides cover both. Exam writers love to offer 'the process IDs must match' as the cause in troubleshooting questions — it is always wrong.",
  },
  {
    kind: 'diagram',
    title: 'How a network statement matches interfaces',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'G0/0/0 10.0.12.1', value: '10.0.12.1', prefix: 30 },
        { label: 'network 10.0.12.0', value: '10.0.12.0', prefix: 30, tone: 'accent' },
        { label: 'wildcard 0.0.0.3', value: '0.0.0.3', prefix: 30 },
        { label: 'G0/0/3 10.0.12.5', value: '10.0.12.5', prefix: 30, tone: 'bad' },
      ],
    },
    caption: 'Wildcard 0-bits must match and 1-bits are ignored: 10.0.12.1 matches, 10.0.12.5 does not.',
    bullets: [
      'IOS compares each interface IP with the statement address',
      'Match → OSPF enabled on that interface, in that area',
    ],
    notes:
      "A `network` statement has three parts: an address, a **wildcard mask** and an area. IOS compares the address with the primary IPv4 address of every interface on the router. Wildcard bits set to **0** mean 'this bit must match'; bits set to **1** mean 'ignore this bit'. If every must-match bit agrees, OSPF is enabled on that interface in the stated area. In the diagram, `network 10.0.12.0 0.0.0.3 area 0` fixes the first 30 bits. Interface address 10.0.12.1 has the same first 30 bits as 10.0.12.0, so it matches. Address 10.0.12.5 differs within the first 30 bits — its last octet is 00000101 — so it belongs to the next block, 10.0.12.4 to 10.0.12.7, and does not match. The fastest way to solve these questions is to turn the wildcard into a range: the range starts at the statement's address, and in the last non-zero octet it spans the wildcard value plus one. So 0.0.0.3 covers four addresses, 0.0.0.255 covers 256, and 0.0.15.255 covers sixteen values of the third octet. Then simply check whether each interface IP falls inside.",
  },
  {
    kind: 'table',
    title: 'Network statements, verified',
    columns: ['Statement', 'Interface IPs matched', 'Typical use'],
    rows: [
      ['`network 10.0.12.1 0.0.0.0 area 0`', 'Only 10.0.12.1', 'Exactly one interface'],
      ['`network 10.0.12.0 0.0.0.3 area 0`', '10.0.12.0 – 10.0.12.3', 'One /30 link'],
      ['`network 192.168.3.0 0.0.0.255 area 0`', '192.168.3.0 – 192.168.3.255', 'One /24 LAN'],
      ['`network 172.16.0.0 0.0.15.255 area 0`', '172.16.0.0 – 172.16.15.255', 'A block of subnets'],
      ['`network 10.0.0.0 0.255.255.255 area 0`', 'Any 10.x.x.x address', 'Broad, quick'],
      ['`network 0.0.0.0 255.255.255.255 area 0`', 'Every IPv4 interface', 'Labs only'],
    ],
    notes:
      "Here are the network statements you will meet most often, each checked bit by bit. A wildcard of **0.0.0.0** is the most precise form: it matches exactly one interface address, so `network 10.0.12.1 0.0.0.0 area 0` enables only the interface that owns 10.0.12.1. Many engineers prefer this style because adding a new interface later never enables OSPF on it by accident. A wildcard that mirrors the subnet — 0.0.0.3 for a /30, 0.0.0.255 for a /24 — matches every address in that subnet. The wildcard is simply the subnet mask subtracted from 255.255.255.255, so a /20 mask of 255.255.240.0 becomes 0.0.15.255 as in the fourth row, and a /21 becomes 0.0.7.255. Broad statements such as 10.0.0.0 0.255.255.255 are quick to type but also enable any future 10.x interface — perhaps a link toward a partner you never intended to peer with. The final row matches every interface that has an IPv4 address; it appears in labs and in exam distractors, rarely in production. And remember: the area number is a mandatory part of every statement.",
  },
  {
    kind: 'compare',
    title: 'What a network statement really does',
    left: {
      heading: 'It does',
      bullets: [
        'Enable OSPF on each **matching interface**',
        'Start sending Hellos out of that interface',
        'Advertise the interface\'s **own subnet and mask**',
        'Place the interface in the stated area',
      ],
    },
    right: {
      heading: 'It does not',
      tone: 'accent',
      bullets: [
        'Advertise the statement\'s range as a route',
        'Summarize: a /8 wildcard is not a /8 route',
        'Require the exact subnet — any matching IP works',
        'Touch interfaces that do not match',
      ],
    },
    notes:
      "This is the most misunderstood point about OSPF configuration. A `network` statement does **not** tell OSPF which routes to advertise; it tells OSPF which **interfaces** to enable. Once an interface is enabled, three things happen: OSPF starts sending Hellos out of it (unless it is passive), it places the interface in the stated area, and it advertises the interface's own connected subnet with the interface's real mask. So on R1, `network 10.0.0.0 0.0.255.255 area 0` does not advertise 10.0.0.0/16. It enables G0/0/0 and G0/0/1, and R1 advertises 10.0.12.0/30 and 10.0.13.0/30 — exactly the subnets configured on those interfaces. Likewise, the statement does not have to name the subnet exactly: any address and wildcard that match the interface IP will do. If an interface matches no statement, its subnet is simply absent from OSPF — a classic reason why a remote LAN is missing from the neighbors' routing tables. Summarization in OSPF is a separate feature configured on ABRs and ASBRs; no wildcard, however wide, creates a summary route.",
  },
  {
    kind: 'cli',
    title: 'R1: enabling OSPF with network statements',
    code: `R1(config)# interface Loopback0
R1(config-if)# ip address 1.1.1.1 255.255.255.255
R1(config-if)# exit
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.
R1(config-router)# network 10.0.0.0 0.0.255.255 area 0
R1(config-router)# network 1.1.1.1 0.0.0.0 area 0
*Sep 26 10:14:07.123: %OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/0/0 from LOADING to FULL, Loading Done
*Sep 26 10:14:09.456: %OSPF-5-ADJCHG: Process 1, Nbr 3.3.3.3 on GigabitEthernet0/0/1 from LOADING to FULL, Loading Done`,
    highlight: ['network 10.0.0.0 0.0.255.255 area 0', 'network 1.1.1.1 0.0.0.0 area 0', 'LOADING to FULL'],
    caption: 'The 10.0.0.0/16 wildcard enables G0/0/0 and G0/0/1 but not the ISP-facing G0/0/2.',
    notes:
      "R1 uses two network statements. The first, `10.0.0.0 0.0.255.255`, matches any interface whose address begins with 10.0, so it enables G0/0/0 (10.0.12.1) and G0/0/1 (10.0.13.1) in area 0. It does not match the ISP-facing G0/0/2 (203.0.113.2), which is exactly what we want: no Hellos are sent to the provider and that subnet is not advertised. The second statement uses a 0.0.0.0 wildcard to enable only Loopback0, so 1.1.1.1/32 is advertised and the other routers can reach R1's router ID address. Notice the order inside the process: `router-id` first, then `auto-cost reference-bandwidth 10000` — which IOS answers with its reminder to keep the reference consistent — and only then the network statements. Because R2 and R3 were already configured, the adjacencies come up within seconds, and IOS logs an `%OSPF-5-ADJCHG` message for each neighbor as it moves from LOADING to FULL. Those log messages name the process, the neighbor's router ID and the local interface, so they are also a quick troubleshooting aid when an adjacency flaps.",
  },
  {
    kind: 'cli',
    title: 'R2: enabling OSPF per interface',
    code: `R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
R2(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.
R2(config-router)# passive-interface GigabitEthernet0/0/1
R2(config-router)# interface GigabitEthernet0/0/0
R2(config-if)# ip ospf 1 area 0
R2(config-if)# interface GigabitEthernet0/0/2
R2(config-if)# ip ospf 1 area 0
R2(config-if)# interface GigabitEthernet0/0/1
R2(config-if)# ip ospf 1 area 0
R2(config-if)# interface Loopback0
R2(config-if)# ip ospf 1 area 0
R2(config-if)# end
R2# show ip ospf interface GigabitEthernet0/0/0 | include Attached
  Internet Address 10.0.12.2/30, Area 0, Attached via Interface Enable`,
    highlight: ['ip ospf 1 area 0', 'Attached via Interface Enable'],
    caption: 'No wildcards: the command applies to exactly the interface you are on.',
    notes:
      "R2 shows the alternative: enabling OSPF directly on each interface with `ip ospf <process-id> area <area-id>`. There is no wildcard to get wrong — the command applies to exactly the interface you are configuring, which makes the configuration easy to read and audit. The process-level commands (`router-id`, `auto-cost`, `passive-interface`) still live under `router ospf 1`. Verification shows the difference: `show ip ospf interface` reports *Attached via Interface Enable* rather than *Attached via Network Statement*, and `show ip protocols` lists these interfaces under *Routing on Interfaces Configured Explicitly* instead of *Routing for Networks*. Both methods produce identical OSPF behaviour, and you can mix them, even on the same router. If an interface is covered by both a network statement and an interface command, the interface command takes precedence. For the exam, be ready to recognise either style in a configuration exhibit, and remember that the interface command needs two values in this order: the process ID, then the area. R2 also makes its LAN interface, G0/0/1, passive — the topic of the next slides.",
  },
  {
    kind: 'table',
    title: 'Network statement vs interface command',
    columns: ['', '`network` statement', '`ip ospf <pid> area <n>`'],
    rows: [
      ['Entered in', 'Router mode (`router ospf 1`)', 'Interface mode'],
      ['Selects interfaces by', 'Interface IP vs address + wildcard', 'The interface being configured'],
      ['`show ip ospf interface`', 'Attached via Network Statement', 'Attached via Interface Enable'],
      ['`show ip protocols`', 'Routing for Networks', 'Routing on Interfaces Configured Explicitly'],
      ['Both cover one interface', 'Overridden', '**Takes precedence**'],
      ['Main risk', 'Broad wildcard enables future interfaces', 'Forgetting a new interface'],
    ],
    notes:
      "Use this table to recognise the two methods from any angle. The network statement is a single router-mode command that can enable many interfaces at once; its weakness is that a broad wildcard silently enables any future interface whose address happens to match. The interface command is explicit and precise, but you must remember to add it to every new interface that should run OSPF. The two methods leave different fingerprints in verification output, which is how exam exhibits reveal which one was used: *Attached via Network Statement* versus *Attached via Interface Enable* in `show ip ospf interface`, and the *Routing for Networks* list versus *Routing on Interfaces Configured Explicitly* in `show ip protocols`. When both apply to the same interface, the interface-level command wins, including its area. Whichever method you choose, the advertised prefix is always the interface's own subnet and mask, the Hellos are identical, and neighbors cannot tell the difference. In real networks, pick one style per router and stick to it, because mixed configurations are harder to troubleshoot at three in the morning.",
  },
  {
    kind: 'bullets',
    title: 'Passive interfaces',
    bullets: [
      '`passive-interface GigabitEthernet0/0/1` under `router ospf`',
      'No Hellos sent → **no neighbor** can form on that link',
      '==The subnet is still advertised==',
      'Use on LANs with hosts only — no routers',
      'Security: no rogue router can peer from a user LAN',
      'Never make a router-to-router (transit) link passive',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 2 },
        { id: 'r2', icon: 'router', label: 'R2', x: 4.4, y: 2, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW', x: 6.8, y: 2 },
        { id: 'pc1', icon: 'pc', label: 'PC1', x: 9, y: 1 },
        { id: 'pc2', icon: 'pc', label: 'PC2', x: 9, y: 3 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'Hellos · neighbor', tone: 'good' },
        { from: 'r2', to: 'sw', fromLabel: 'G0/0/1', label: 'passive', tone: 'muted' },
        { from: 'sw', to: 'pc1' },
        { from: 'sw', to: 'pc2' },
      ],
      annotations: [{ x: 6.8, y: 3.6, text: '192.168.2.0/24 still advertised', tone: 'accent' }],
    },
    notes:
      "On R2, G0/0/1 connects to a user LAN with PCs and printers but no other routers. If OSPF were fully active there, R2 would send a Hello every 10 seconds to devices that ignore it, and — more importantly — anyone who plugged a router, or a laptop running routing software, into that LAN could form an adjacency and inject false routes. The `passive-interface` command solves both problems. On a passive interface OSPF stops sending Hellos, so no neighbor relationship can form there, yet the interface stays enabled for OSPF, so its subnet, 192.168.2.0/24, is **still advertised** to R1 and R3 in R2's router LSA. That last point is the heart of most exam questions: passive does not remove the network from OSPF. Contrast it with deleting the network statement, which stops advertising the subnet entirely, or shutting the interface, which takes the subnet down. Loopbacks never send Hellos anyway, so marking them passive changes nothing. The mistake to avoid is making a *transit* interface passive — a link between two routers — because that silently breaks the adjacency.",
  },
  {
    kind: 'cli',
    title: 'R3: passive-interface default',
    code: `R3(config)# router ospf 1
R3(config-router)# router-id 3.3.3.3
R3(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.
R3(config-router)# network 10.0.13.2 0.0.0.0 area 0
R3(config-router)# network 10.0.23.2 0.0.0.0 area 0
R3(config-router)# network 192.168.3.0 0.0.0.255 area 0
R3(config-router)# network 3.3.3.3 0.0.0.0 area 0
R3(config-router)# passive-interface default
R3(config-router)# no passive-interface GigabitEthernet0/0/0
R3(config-router)# no passive-interface GigabitEthernet0/0/2
R3(config-router)# end
R3# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               3.3.3.3/32         1     LOOP  0/0
Gi0/0/1      1     0               192.168.3.1/24     10    DR    0/0
Gi0/0/2      1     0               10.0.23.2/30       10    DR    1/1
Gi0/0/0      1     0               10.0.13.2/30       10    DR    1/1`,
    highlight: ['passive-interface default', 'no passive-interface', '0/0'],
    caption: 'Everything passive by default; only the two router links send Hellos.',
    notes:
      "When a router has many interfaces and only a few links to other routers, it is simpler to flip the logic. `passive-interface default` makes **every** OSPF interface passive, and you then re-enable Hellos only on transit links with `no passive-interface`. R3 uses precise 0.0.0.0 wildcards for its two router links and its loopback, a /24 wildcard for its LAN, and then passive-interface default with two exceptions: G0/0/0 toward R1 and G0/0/2 toward R2. The brief output proves the result. G0/0/1, the LAN, shows state DR with 0/0 neighbors — it is passive, so R3 is alone on that segment and is its DR by default — while the two transit links each show one fully adjacent neighbor. Careful with timing: entering passive-interface default on a live router immediately silences every interface and drops all existing adjacencies until the `no passive-interface` lines are in place, so paste the whole block at once or use a maintenance window. On the exam, if a router configured with passive-interface default has no neighbors at all, look for the missing `no passive-interface` commands.",
  },
  {
    kind: 'bullets',
    title: 'Advertising a default route',
    bullets: [
      'R1: static default route toward the ISP',
      '`default-information originate` → **Type 5 LSA** for 0.0.0.0/0',
      'R1 becomes an **ASBR**',
      'Other routers: ==O*E2 0.0.0.0/0 [110/1]==',
      'Needs a default route in R1\'s table — unless `always`',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'r2', icon: 'router', label: 'R2', sub: 'O*E2 0.0.0.0/0', x: 1.4, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'O*E2 0.0.0.0/0', x: 1.4, y: 3 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'ASBR', x: 4.8, y: 2, tone: 'accent' },
        { id: 'isp', icon: 'internet', label: 'ISP', x: 8.4, y: 2 },
      ],
      links: [
        { from: 'r1', to: 'isp', label: 'static default', style: 'dashed' },
        { from: 'r1', to: 'r2', label: 'Type 5 LSA', arrow: 'forward', tone: 'accent' },
        { from: 'r1', to: 'r3', label: 'Type 5 LSA', arrow: 'forward', tone: 'accent' },
        { from: 'r2', to: 'r3' },
      ],
    },
    notes:
      "Remote routers need a way out to the Internet, but you do not want to type a static default route on every router. The standard solution is to configure one static default on the edge router, R1, pointing at the ISP, and then enter `default-information originate` under R1's OSPF process. R1 then originates a **Type 5 external LSA** for 0.0.0.0/0, which is flooded throughout the area, and R1 becomes an **ASBR** because it injects a route from outside OSPF. On R2 and R3 the route appears as `O*E2 0.0.0.0/0 [110/1]`: O for OSPF, the asterisk for candidate default, and E2 for external type 2. E2 is the default metric type, and its metric stays at the value set by the ASBR — 1 by default — no matter how far away the receiving router is. The command has one important condition: R1 must itself have a default route in its routing table, or nothing is advertised. Adding the `always` keyword removes that condition, advertising the default even when R1's own default disappears — convenient but risky, because traffic could be drawn to a router that has no exit.",
  },
  {
    kind: 'cli',
    title: 'default-information originate on R1',
    code: `R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1(config)# router ospf 1
R1(config-router)# default-information originate
R1(config-router)# end
R1# show ip ospf | include boundary
 It is an autonomous system boundary router`,
    highlight: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'default-information originate', 'autonomous system boundary router'],
    caption: 'One static default on the edge router, advertised to the whole area.',
    notes:
      "The configuration is two commands. First, the static default route on R1 toward the ISP's address, 203.0.113.1. Second, `default-information originate` under `router ospf 1`. `show ip ospf` then confirms that R1 now considers itself an autonomous system boundary router. If you ever find the command configured but no O*E2 route on the neighbors, check R1's routing table first: is there really a 0.0.0.0/0 route installed? A static default pointing to a next hop that is not reachable will not be installed, and then nothing is originated. Optional parameters let you set the advertised `metric`, or change `metric-type` to 1 (E1), in which case receiving routers add their internal cost to reach R1 — useful when there are several exit points and each router should prefer the nearest one. For the CCNA, remember the default type **E2**, the default metric **1**, and the requirement for an existing default route unless `always` is used. The resulting route on R2 appears on the `show ip route ospf` slide later in this deck, together with the gateway of last resort it creates.",
  },
  {
    kind: 'cli',
    title: 'Reference bandwidth and equal-cost multipath',
    code: `R1(config)# router ospf 1
R1(config-router)# maximum-paths 2
R1(config-router)# end
R1# show ip protocols | include Maximum
  Maximum path: 2
R1# show ip route ospf
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/11] via 10.0.12.2, 00:00:41, GigabitEthernet0/0/0
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/11] via 10.0.13.2, 00:00:41, GigabitEthernet0/0/1
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/20] via 10.0.13.2, 00:00:41, GigabitEthernet0/0/1
                      [110/20] via 10.0.12.2, 00:00:41, GigabitEthernet0/0/0
O     192.168.2.0/24 [110/20] via 10.0.12.2, 00:00:41, GigabitEthernet0/0/0
O     192.168.3.0/24 [110/20] via 10.0.13.2, 00:00:41, GigabitEthernet0/0/1`,
    highlight: ['maximum-paths 2', 'Maximum path: 2', '10.0.23.0/30'],
    caption: 'Two equal-cost paths (10 + 10 = 20) to 10.0.23.0/30 are both installed.',
    notes:
      "Two process-level settings shape path selection. The first is in every router's configuration already: `auto-cost reference-bandwidth 10000`. Each router calculates the cost of its **own** interfaces and advertises those costs in its router LSA, so if R1 used 10 000 while R2 kept the default 100, R1's Gigabit links would cost 10 and R2's would cost 1, and SPF would be comparing apples with oranges. That is why IOS reminds you to keep the value consistent on all routers. The second setting is **maximum-paths**, which caps how many equal-cost routes OSPF installs for one destination; the IOS default is **4**. In the output, R1 has two routes to 10.0.23.0/30, via R2 and via R3, each costing 10 + 10 = **20**, so both are installed and traffic is shared between them — equal-cost multipath, or ECMP. OSPF balances only across paths with exactly the same cost; it has no unequal-cost load balancing. `maximum-paths 1` disables load balancing so that a single path is installed. `show ip protocols` displays the current limit on its *Maximum path* line.",
  },
  {
    kind: 'cli',
    title: 'Verify neighbors: show ip ospf neighbor',
    code: `R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           1   FULL/DR         00:00:31    10.0.13.2       GigabitEthernet0/0/1
2.2.2.2           1   FULL/DR         00:00:38    10.0.12.2       GigabitEthernet0/0/0`,
    highlight: ['FULL/DR', 'Neighbor ID', 'Address'],
    caption: 'After the slash is the neighbor\'s role, not R1\'s.',
    notes:
      "`show ip ospf neighbor` is the first command to run when OSPF misbehaves, and the one most often used in exhibits. Read it column by column. **Neighbor ID** is the neighbor's router ID — not an interface address — here 3.3.3.3 and 2.2.2.2. **Pri** is the neighbor's OSPF priority on that link. **State** has two halves: before the slash is the adjacency state, which should be FULL, and after it is the **neighbor's** role on the segment — DR, BDR or DROTHER, or a dash on point-to-point links. So FULL/DR on both lines means R1 is fully adjacent to both routers and each of them is the DR on its link, which also tells you that R1 must be the BDR on both. **Dead Time** counts down from 40 seconds and resets on every Hello. **Address** is the neighbor's IP address on the shared link, and **Interface** is R1's own interface toward it. The classic trap is reading the role as R1's own role. Another is confusing the Neighbor ID with the Address column when a question asks which IP address to ping or use as a next hop.",
  },
  {
    kind: 'cli',
    title: 'Verify interfaces: show ip ospf interface',
    code: `R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
Gi0/0/2      1     0               10.0.23.1/30       10    BDR   1/1
Gi0/0/1      1     0               192.168.2.1/24     10    DR    0/0
Gi0/0/0      1     0               10.0.12.2/30       10    DR    1/1
R2# show ip ospf interface GigabitEthernet0/0/1
GigabitEthernet0/0/1 is up, line protocol is up
  Internet Address 192.168.2.1/24, Area 0, Attached via Interface Enable
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 10
  Topology-MTID    Cost    Disabled    Shutdown      Topology Name
        0           10        no          no            Base
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 2.2.2.2, Interface address 192.168.2.1
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    oob-resync timeout 40
    No Hellos (Passive interface)`,
    highlight: ['Nbrs F/C', 'No Hellos (Passive interface)', 'Cost: 10'],
    caption: 'Brief: one line per OSPF interface. Detail: timers, network type, DR/BDR, passive status.',
    notes:
      "`show ip ospf interface brief` answers four questions in one line per interface: is OSPF enabled here, in which area, at what cost, and with how many neighbors? R2 has four OSPF interfaces. Lo0 is in state LOOP and is advertised as a /32 host route. Gi0/0/2 is BDR with 1/1 — one fully adjacent neighbor out of one neighbor seen, because F/C means Full/Count. Gi0/0/0 is DR with 1/1. Gi0/0/1, the passive LAN interface, is DR with 0/0: no Hellos are sent, so no other router is there. Every Gigabit interface costs **10** because of the 10 000 Mbps reference. The detailed version for Gi0/0/1 adds what the brief form hides: how OSPF was enabled (*Attached via Interface Enable*), the network type (BROADCAST), the DR and BDR, the hello and dead timers, and the telltale line *No Hellos (Passive interface)*. When an interface is missing from the brief list altogether, OSPF is not enabled on it — check the network statements or interface commands. When it is listed with 0 neighbors, look instead at passive settings, timers and areas.",
  },
  {
    kind: 'cli',
    title: 'Verify the process: show ip protocols',
    code: `R3# show ip protocols
*** IP Routing is NSF aware ***

Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 3.3.3.3
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.13.2 0.0.0.0 area 0
    10.0.23.2 0.0.0.0 area 0
    192.168.3.0 0.0.0.255 area 0
    3.3.3.3 0.0.0.0 area 0
  Passive Interface(s):
    GigabitEthernet0/0/1
    Loopback0
  Routing Information Sources:
    Gateway         Distance      Last Update
    1.1.1.1              110      00:21:37
    2.2.2.2              110      00:21:37
  Distance: (default is 110)`,
    highlight: ['Router ID 3.3.3.3', 'Maximum path: 4', 'Routing for Networks:', 'Passive Interface(s):'],
    caption: 'RID, network statements, passive interfaces and route sources on one screen.',
    notes:
      "`show ip protocols` summarizes the whole OSPF process on one screen. The first line names the process — *ospf 1* — and a few lines down you find the **Router ID**. *Number of areas* confirms a single normal area. *Maximum path: 4* is the default ECMP limit, because R3 has no maximum-paths command. *Routing for Networks* lists each network statement as configured, wildcard and area included, which makes this the fastest way to spot a wrong wildcard or area number in an exhibit. *Passive Interface(s)* lists every passive interface; on R3, passive-interface default left only G0/0/1 and Loopback0 in the list after the two `no passive-interface` exceptions. *Routing Information Sources* lists the router IDs of the routers that supplied routes, with administrative distance 110 and the time since the last update. Finally, *Distance: (default is 110)* confirms the AD is unchanged. On the exam this output is often paired with a question such as 'why is the LAN on G0/0/1 not advertised?' or 'why does R3 have no neighbor on G0/0/0?' — and the answer hides in the network list or the passive list.",
  },
  {
    kind: 'cli',
    title: 'Verify routes: show ip route ospf',
    code: `R2# show ip route ospf
Gateway of last resort is 10.0.12.1 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.12.1, 00:21:40, GigabitEthernet0/0/0
      1.0.0.0/32 is subnetted, 1 subnets
O        1.1.1.1 [110/11] via 10.0.12.1, 00:21:40, GigabitEthernet0/0/0
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/11] via 10.0.23.2, 00:21:40, GigabitEthernet0/0/2
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.13.0/30 [110/20] via 10.0.23.2, 00:21:40, GigabitEthernet0/0/2
                      [110/20] via 10.0.12.1, 00:21:40, GigabitEthernet0/0/0
O     192.168.3.0/24 [110/20] via 10.0.23.2, 00:21:40, GigabitEthernet0/0/2`,
    highlight: ['O*E2', '[110/1]', '[110/20]'],
    caption: '[AD/metric] · via = neighbor\'s IP · last field = R2\'s exit interface.',
    notes:
      "`show ip route ospf` filters the routing table down to OSPF routes; the code legend is omitted here, as it often is in exam exhibits. The *Gateway of last resort* line shows that R2 sends unknown traffic to 10.0.12.1 — R1 — because of the **O*E2** default route, which carries metric 1 exactly as R1 originated it. Every other line starts with O for an intra-area OSPF route, then the prefix, then **[110/metric]**: administrative distance 110 and the OSPF cost. 1.1.1.1/32 costs 11: 10 for R2's Gigabit exit plus 1 for R1's loopback. 192.168.3.0/24 costs 20: 10 to leave R2 plus 10 for R3's LAN interface. 10.0.13.0/30 has **two** next hops — via R3 (10.0.23.2) and via R1 (10.0.12.1) — each costing 20, so R2 load-balances. The *via* address is the neighbor's interface IP, followed by the route's age and R2's exit interface. Note what is absent: R2's connected subnets and its own LAN, which appear with codes C and L in the full table. The exam loves asking for the metric or next hop of one specific line, so practise decoding every field.",
  },
  {
    kind: 'cli',
    title: 'Verify the LSDB: show ip ospf database',
    code: `R2# show ip ospf database

            OSPF Router with ID (2.2.2.2) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         1302        0x80000005 0x00B51E 3
2.2.2.2         2.2.2.2         1298        0x80000006 0x004C2F 4
3.3.3.3         3.3.3.3         1297        0x80000006 0x00D7A1 4

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.12.2       2.2.2.2         1298        0x80000002 0x0012AB
10.0.13.2       3.3.3.3         1302        0x80000002 0x00E4C0
10.0.23.2       3.3.3.3         1297        0x80000002 0x0077F1

                Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         1.1.1.1         1302        0x80000001 0x00A7C4 1`,
    highlight: ['Router Link States (Area 0)', 'Net Link States (Area 0)', 'Type-5 AS External Link States'],
    caption: 'Three router LSAs, three network LSAs (one per DR), one external default route.',
    notes:
      "The LSDB view ties configuration back to the concepts lesson. The header shows R2's router ID and process. Under *Router Link States (Area 0)* there is one Type 1 LSA per router — three routers, three entries — and the Link count reflects each router's OSPF links: R1 has its two transit links plus its loopback, while R2 and R3 each have two transit links, a LAN and a loopback. Under *Net Link States* there is one Type 2 LSA for each Ethernet segment whose DR has at least one neighbor; the Link ID is the DR's interface address and ADV Router is the DR's router ID, so R2 is DR on 10.0.12.0/30 and R3 is DR on the other two links. The passive LANs have no network LSA, because no neighbor exists there; they appear as stub links inside their router's Type 1 LSA. Finally, the *Type-5 AS External Link States* section holds the default route that R1 originated with default-information originate. All three routers show exactly the same database, because they share area 0 — only the header's router ID differs.",
  },
  {
    kind: 'table',
    title: 'Verification cheat sheet',
    columns: ['Question', 'Command', 'Look for'],
    rows: [
      ['Who are my neighbors — are they Full?', '`show ip ospf neighbor`', 'Neighbor ID (RID), FULL/DR, FULL/BDR, FULL/ -'],
      ['Which interfaces run OSPF, area, cost?', '`show ip ospf interface brief`', 'Area, Cost, State, Nbrs F/C'],
      ['Timers, network type, passive?', '`show ip ospf interface <int>`', 'Hello 10, Dead 40 · No Hellos (Passive interface)'],
      ['RID, networks, passive list, ECMP?', '`show ip protocols`', 'Router ID · Routing for Networks · Maximum path'],
      ['Which OSPF routes are installed?', '`show ip route ospf`', 'O, O*E2, [110/cost], extra next-hop lines'],
      ['What is in the LSDB?', '`show ip ospf database`', 'Router, Net and Type-5 LSAs'],
    ],
    notes:
      "Memorize which command answers which question, because exam items often ask 'which command would verify…' with four plausible show commands as options. Work top-down when troubleshooting. Start with **show ip ospf neighbor**: if the expected neighbor is FULL, the adjacency is fine and the problem lies in what is advertised or preferred. If it is missing, move to **show ip ospf interface brief** to confirm OSPF is enabled on the right interface and area, then the detailed **show ip ospf interface** to compare timers and network type and to spot a passive interface. **show ip protocols** reveals the router ID, every network statement, the passive list and the ECMP limit in one place. **show ip route ospf** proves what was actually installed — metric, next hop and the number of equal-cost paths. **show ip ospf database** is the deepest view, showing exactly which LSAs the router holds; for the CCNA you mainly need to recognise its router, network and external sections. Each of these commands appears as an exhibit somewhere in the exam bank for this lesson.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: OSPF configuration',
    body: 'Most OSPF configuration questions hinge on one of these details.',
    bullets: [
      'Network statements use **wildcard masks**, not subnet masks',
      'Process IDs may differ between neighbors; **area IDs** must match',
      'A network statement advertises the interface subnet, not its own range',
      'Passive = no Hellos, no neighbors — the **subnet is still advertised**',
      '`default-information originate` needs a default route unless `always`',
      'The default appears as **O*E2 [110/1]** on other routers',
      'Reference bandwidth must match on **all** routers; ECMP default = 4',
    ],
    notes:
      "Before answering any OSPF configuration question, run this checklist. Wildcard questions often include an option that uses a subnet mask where a wildcard belongs, or a wildcard one bit too narrow; convert the wildcard to a range and test each interface address. Process ID mismatches are the most common red herring in adjacency scenarios — they never matter — while an area mismatch always breaks the adjacency. Remember that the network statement selects interfaces and that the advertised prefix is the interface's own subnet. Passive interface questions ask either why no neighbor forms (the link was made passive) or whether the subnet is still reachable (yes, it is advertised). Default route questions test the O*E2 code, the metric of 1 that does not grow with distance, and the requirement for an existing default route on the ASBR. Finally, cost questions reward consistent reference bandwidth, and ECMP questions test the default of four paths and the fact that OSPF balances only across exactly equal costs.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '`router ospf <pid>`: process ID is locally significant',
      '`network <addr> <wildcard> area <n>` selects interfaces by IP',
      '`ip ospf <pid> area <n>` enables one interface directly',
      '`passive-interface [default]`: no Hellos, subnet still advertised',
      '`default-information originate` → O*E2 default on all routers',
      '`auto-cost reference-bandwidth` everywhere; `maximum-paths` sets ECMP',
      'Verify: neighbor · interface brief · protocols · route ospf · database',
    ],
    notes:
      "Configuring single-area OSPFv2 comes down to a short, repeatable recipe. Start the process with `router ospf` and a locally significant process ID, and set the router ID immediately. Enable OSPF on interfaces, either with network statements — whose wildcard selects interfaces by IP address, while the advertised prefix is always the interface's own subnet — or with `ip ospf <pid> area <n>` directly on each interface. Make user-facing LANs passive so no Hellos leave them while their subnets stay advertised, using `passive-interface default` plus exceptions when most interfaces face hosts. Inject a default route from the edge router with `default-information originate`, remembering that it needs a default route of its own, and that other routers see it as O*E2 with metric 1. Set the same `auto-cost reference-bandwidth` on every router so Gigabit and faster links get meaningful costs, and adjust `maximum-paths` if you need a different ECMP limit than the default of four. Finally, verify from the neighbor table outward: neighbors, interfaces, the process summary, installed routes and the LSDB. The next lesson explains DR/BDR elections, network types and how to fix adjacencies that refuse to form.",
  },
];

export default slides;
