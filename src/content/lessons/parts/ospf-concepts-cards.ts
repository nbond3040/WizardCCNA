import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'What kind of routing protocol is OSPF?', back: 'An open-standard **link-state** interior gateway protocol (IGP). OSPFv2 is defined in RFC 2328.' },
  { id: 'f2', front: 'IP protocol number used by OSPF', back: '**89** — OSPF runs directly over IP with no TCP or UDP port.' },
  { id: 'f3', front: 'OSPF administrative distance', back: '**110**.' },
  { id: 'f4', front: 'OSPF metric', back: '**Cost**, calculated per interface as reference bandwidth ÷ interface bandwidth; a route\'s metric is the sum of outgoing interface costs.' },
  { id: 'f5', front: '`224.0.0.5`', back: '**AllSPFRouters**: every OSPF router listens. Used for Hellos and for the DR\'s re-flooding.' },
  { id: 'f6', front: '`224.0.0.6`', back: '**AllDRouters**: only the DR and BDR listen. DROTHERs send their updates here.' },
  { id: 'f7', front: 'IGP vs EGP', back: 'An IGP routes inside one autonomous system (OSPF, EIGRP, RIP, IS-IS); an EGP routes between autonomous systems (BGP).' },
  { id: 'f8', front: 'Distance vector vs link state', back: 'Distance vector learns distance and direction from neighbors; link state learns the full area topology from LSAs and computes paths itself with SPF.' },
  { id: 'f9', front: 'LSDB', back: 'Link-state database: every LSA a router holds for an area — identical on all routers in that area. View it with `show ip ospf database`.' },
  { id: 'f10', front: 'Algorithm OSPF uses to choose best paths', back: '**Dijkstra\'s Shortest Path First (SPF)** — each router builds a shortest-path tree with itself as the root.' },
  { id: 'f11', front: 'Type 1 LSA', back: '**Router LSA**: originated by every router in each of its areas; lists its links, their costs and its neighbors. Flooded within the area.' },
  { id: 'f12', front: 'Type 2 LSA', back: '**Network LSA**: originated by the **DR** of a multiaccess segment; lists the routers attached to it. Flooded within the area.' },
  { id: 'f13', front: 'OSPF backbone area', back: '**Area 0** (also written 0.0.0.0). Every other area must connect to it.' },
  { id: 'f14', front: 'ABR', back: 'Area Border Router: has interfaces in area 0 **and** at least one other area.' },
  { id: 'f15', front: 'ASBR', back: 'Autonomous System Boundary Router: injects routes from outside OSPF, such as a default route or redistributed routes.' },
  { id: 'f16', front: 'Internal router vs backbone router', back: 'Internal: all OSPF interfaces in one area. Backbone: at least one interface in area 0. A router can be both.' },
  { id: 'f17', front: 'OSPF router ID selection order', back: '1. `router-id` command\n2. Highest IPv4 address on an up loopback\n3. Highest IPv4 address on an active (up/up) interface' },
  { id: 'f18', front: 'Command needed after changing the router ID of a running OSPF process', back: '`clear ip ospf process` (or a reload). Until then the old RID stays in use.' },
  { id: 'f19', front: 'OSPF hello/dead timers on broadcast and point-to-point links', back: '**10 s / 40 s** (dead = 4 × hello by default).' },
  { id: 'f20', front: 'OSPF hello/dead timers on NBMA and point-to-multipoint networks', back: '**30 s / 120 s**.' },
  { id: 'f21', front: 'OSPF neighbor states in order', back: 'Down → Init → 2-Way → ExStart → Exchange → Loading → Full.' },
  { id: 'f22', front: 'Meaning of the Init state', back: 'A Hello was received from the neighbor, but it does not yet list this router\'s RID — communication is one-way.' },
  { id: 'f23', front: 'What happens in ExStart?', back: 'The neighbors pick master and slave for the database exchange; the **higher router ID** becomes master.' },
  { id: 'f24', front: 'The five OSPF packet types', back: '1 Hello · 2 DBD · 3 LSR · 4 LSU · 5 LSAck.' },
  { id: 'f25', front: 'Default OSPF reference bandwidth', back: '**100 Mbps**.' },
  { id: 'f26', front: 'OSPF cost of FastEthernet, GigabitEthernet and 10GE with the default reference', back: 'All **1** — any result below 1 is raised to the minimum cost of 1.' },
  { id: 'f27', front: 'OSPF cost of a T1 serial link (1.544 Mbps), default reference', back: '**64** (100 ÷ 1.544 = 64.77, fraction dropped).' },
  { id: 'f28', front: '`auto-cost reference-bandwidth 10000`', back: 'Sets the reference to 10 000 Mbps: GigE = 10, FastE = 100, 10GE = 1. Configure it identically on every router.' },
  { id: 'f29', front: '`ip ospf cost` vs `bandwidth`', back: '`ip ospf cost` sets the cost directly and overrides the formula; `bandwidth` (in kbps) changes the denominator of the formula.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'OSPF packets are carried directly inside IP. Which protocol number identifies them?',
    options: ['89', 'TCP port 89', 'UDP port 520', '88'],
    answer: 0,
    difficulty: 1,
    explanation:
      'OSPF uses **IP protocol 89** and has no TCP or UDP port. UDP 520 is RIP, and IP protocol 88 is EIGRP.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two statements describe OSPF? (Choose two.)',
    options: [
      'It is a link-state routing protocol',
      'It is an exterior gateway protocol',
      'It is an open standard',
      'It uses hop count as its metric',
      'It sends its full routing table to neighbors every 30 seconds',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'OSPF is an **open-standard link-state** IGP. BGP is the exterior gateway protocol, hop count is RIP\'s metric (OSPF uses cost), and periodic full-table updates every 30 seconds describe RIP, not OSPF.',
  },
  {
    id: 'q3',
    type: 'order',
    stem: 'Put the OSPF neighbor states in order, from first to last.',
    items: ['Down', 'Init', '2-Way', 'ExStart', 'Exchange', 'Loading', 'Full'],
    difficulty: 1,
    explanation:
      'Hellos move a neighbor from Down to Init (one-way) and 2-Way (two-way). Adjacency building then runs ExStart (master/slave), Exchange (DBDs), Loading (LSR/LSU) and finally Full.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'With the default reference bandwidth, what is the OSPF cost of a 10 Mbps Ethernet interface?',
    answers: ['10'],
    placeholder: 'cost',
    difficulty: 2,
    explanation: '100 Mbps ÷ 10 Mbps = **10**. FastEthernet and faster interfaces all cost 1 with the default reference.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'R1 has no `router-id` command. Loopback0 is 10.0.0.1 and G0/0/0 is 192.168.1.1, and both are up. What is R1\'s OSPF router ID?',
    options: ['192.168.1.1', '10.0.0.1', '0.0.0.0', 'The address of the first OSPF-enabled interface'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Without a manual RID, the **highest loopback** address wins, even though the physical interface address 192.168.1.1 is numerically higher. Physical interfaces are considered only when no loopback is up, and OSPF-enabled status plays no part in the choice.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each item to its description.',
    pairs: [
      { left: '`224.0.0.5`', right: 'All OSPF routers' },
      { left: '`224.0.0.6`', right: 'DR and BDR only' },
      { left: 'Type 1 LSA', right: 'Originated by every router' },
      { left: 'Type 2 LSA', right: 'Originated by the DR of a multiaccess segment' },
    ],
    difficulty: 1,
    explanation:
      '224.0.0.5 is AllSPFRouters and 224.0.0.6 is AllDRouters. Every router originates a Type 1 router LSA, while only the DR originates the Type 2 network LSA for its segment.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which command displays the OSPF link-state database?',
    options: ['`show ip ospf neighbor`', '`show ip ospf database`', '`show ip route ospf`', '`show ip ospf interface brief`'],
    answer: 1,
    difficulty: 1,
    explanation:
      '`show ip ospf database` lists the LSAs in the LSDB. The neighbor command shows the neighbor table, `show ip route ospf` shows the SPF results that were installed, and the interface brief shows per-interface area, cost and state.',
  },
];
