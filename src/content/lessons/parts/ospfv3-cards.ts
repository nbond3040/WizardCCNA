import type { Flashcard, Question } from '../../types';

const V2: string[] = ['v2.0'];

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'OSPFv3', back: 'The OSPF version for **IPv6** (RFC 5340): same link-state engine as OSPFv2. Tested on CCNA v2.0 only.', tags: V2 },
  { id: 'f2', front: 'OSPFv3 multicast address for all OSPF routers', back: '**FF02::5** (the IPv6 equivalent of 224.0.0.5).', tags: V2 },
  { id: 'f3', front: 'OSPFv3 multicast address for the DR and BDR', back: '**FF02::6** (the IPv6 equivalent of 224.0.0.6).', tags: V2 },
  { id: 'f4', front: 'Source address of OSPFv3 packets', back: 'The interface\'s **link-local** address (FE80::/10), never its global address.', tags: V2 },
  { id: 'f5', front: 'Next hop of an OSPFv3-learned route', back: 'The neighbor\'s **link-local** address plus the outgoing interface.', tags: V2 },
  { id: 'f6', front: 'OSPFv3 router ID format', back: 'A **32-bit** dotted-decimal value (e.g. 1.1.1.1) — even in an IPv6-only network.', tags: V2 },
  { id: 'f7', front: 'OSPFv3 router ID selection order', back: '`router-id` command → highest up loopback **IPv4** address → highest active interface **IPv4** address.', tags: V2 },
  { id: 'f8', front: 'IPv6-only router with no `router-id` configured', back: 'OSPFv3 cannot pick a router ID (NORTRID message) and the process does not start. Fix: configure `router-id`.', tags: V2 },
  { id: 'f9', front: 'Global command needed before OSPFv3 can run', back: '`ipv6 unicast-routing`.', tags: V2 },
  { id: 'f10', front: 'Create OSPFv3 process 1', back: '`ipv6 router ospf 1` — prompt `R1(config-rtr)#`; the process ID is locally significant.', tags: V2 },
  { id: 'f11', front: 'Enable OSPFv3 process 1 in area 0 on an interface', back: '`ipv6 ospf 1 area 0` in interface mode — OSPFv3 has **no network command**.', tags: V2 },
  { id: 'f12', front: 'Passive interface in OSPFv3', back: '`passive-interface <intf>` under `ipv6 router ospf 1`: no hellos sent, but the prefix is still advertised.', tags: V2 },
  { id: 'f13', front: 'Advertise a default route into OSPFv3', back: '`default-information originate` under `ipv6 router ospf 1`; needs ::/0 in the routing table unless `always` is added.', tags: V2 },
  { id: 'f14', front: 'Route code for the OSPFv3 default route from an ASBR', back: '**OE2** — e.g. `OE2 ::/0 [110/1]` (external type 2, metric 1).', tags: V2 },
  { id: 'f15', front: 'OSPFv3 administrative distance', back: '**110** — the same as OSPFv2.', tags: V2 },
  { id: 'f16', front: 'OSPFv3 default hello/dead on Ethernet', back: '**10 s / 40 s** — the same as OSPFv2.', tags: V2 },
  { id: 'f17', front: '`show ipv6 ospf neighbor`', back: 'Neighbor router IDs, priority, state and role (e.g. FULL/DR), dead time, neighbor interface ID and local interface.', tags: V2 },
  { id: 'f18', front: '`show ipv6 ospf interface brief`', back: 'Per OSPFv3 interface: process ID, **area**, interface ID, cost, state (DR, BDR, DROTH, P2P, LOOP) and neighbors F/C.', tags: V2 },
  { id: 'f19', front: '`show ipv6 route ospf`', back: 'Only OSPF-learned IPv6 routes (O, OI, OE1, OE2) with [110/cost] and link-local next hops.', tags: V2 },
  { id: 'f20', front: 'Must OSPFv3 neighbors share a global IPv6 prefix?', back: '**No.** OSPFv3 runs per link; hellos carry no prefix, so neighbors form over link-local addresses.', tags: V2 },
  { id: 'f21', front: 'Effect of an area mismatch on an OSPFv3 link', back: 'Hellos are ignored and **no neighbor** forms; each side shows itself as DR with 0/0 neighbors.', tags: V2 },
  { id: 'f22', front: 'How OSPFv3 advertises a loopback interface', back: 'As a **/128** host route by default.', tags: V2 },
  { id: 'f23', front: 'OSPFv3 authentication', back: 'No built-in password fields: it relies on IPv6 **IPsec** (AH/ESP).', tags: V2 },
  { id: 'f24', front: 'OSPFv3 symptom of an MTU mismatch', back: 'Neighbors stuck in **EXSTART/EXCHANGE**.', tags: V2 },
  { id: 'f25', front: 'OSPFv3 IP protocol number', back: '**89** (IPv6 Next Header 89), the same as OSPFv2.', tags: V2 },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'To which multicast address do OSPFv3 routers send hello packets?',
    options: ['224.0.0.5', 'FF02::5', 'FF02::6', 'FF02::1'],
    answer: 1,
    difficulty: 1,
    tags: V2,
    explanation:
      'OSPFv3 hellos go to **FF02::5**, all OSPF routers. FF02::6 reaches only the DR and BDR, 224.0.0.5 is the OSPFv2 equivalent, and FF02::1 is the all-nodes group.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which interface command enables OSPFv3 process 1 in area 0?',
    options: ['network 2001:DB8:1::/64 area 0', 'ipv6 ospf 1 area 0', 'ip ospf 1 area 0', 'ospf ipv6 1 area 0'],
    answer: 1,
    difficulty: 1,
    tags: V2,
    explanation:
      '`ipv6 ospf 1 area 0` enables OSPFv3 on the interface. OSPFv3 has no `network` command, `ip ospf 1 area 0` enables OSPFv2, and the last option is not valid syntax.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about the OSPFv3 router ID are true? (Choose two.)',
    options: [
      'It is a 32-bit value written in dotted decimal',
      'It is taken from the highest IPv6 global unicast address',
      'It can be set with the router-id command',
      'It must be a link-local address',
      'It is optional because OSPFv3 identifies routers by IPv6 address',
    ],
    answers: [0, 2],
    difficulty: 2,
    tags: V2,
    explanation:
      'The OSPFv3 RID is a **32-bit** value, set with `router-id` or taken from IPv4 addresses. IPv6 addresses are never used for it, and it is not optional: without one the process does not start.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which global configuration command must be entered before a router can route IPv6 and run OSPFv3?',
    answers: ['ipv6 unicast-routing'],
    placeholder: 'global command',
    difficulty: 1,
    tags: V2,
    explanation:
      '`ipv6 unicast-routing` turns on IPv6 forwarding. Without it the router acts as an IPv6 host and IOS will not create the OSPFv3 process.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each item with its role in OSPFv3.',
    pairs: [
      { left: 'FF02::5', right: 'Destination of hellos to all OSPF routers' },
      { left: 'FF02::6', right: 'Destination reaching only the DR and BDR' },
      { left: 'FE80:: link-local address', right: 'Source of OSPFv3 packets and next hop of routes' },
      { left: 'Router ID', right: '32-bit value that identifies the router' },
    ],
    difficulty: 2,
    tags: V2,
    explanation:
      'Hellos go to **FF02::5**, updates for the DR/BDR go to **FF02::6**, packets are sourced from **link-local** addresses (which also become next hops), and the **router ID** is a 32-bit identifier.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'In the output of show ipv6 route ospf, what type of address follows the word via?',
    options: ['The neighbor\'s global unicast address', 'The neighbor\'s link-local address', 'The neighbor\'s router ID', 'The multicast address FF02::5'],
    answer: 1,
    difficulty: 2,
    tags: V2,
    explanation:
      'OSPFv3 installs the neighbor\'s **link-local** address, paired with the exit interface, as the next hop. Global addresses are not used as next hops, the router ID is not an address, and FF02::5 is only a hello destination.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'What is the effect of passive-interface GigabitEthernet0/0/1 under ipv6 router ospf 1?',
    options: [
      'The interface is shut down',
      'OSPFv3 stops advertising the interface prefix',
      'No hellos are sent on the interface, but its prefix is still advertised',
      'Neighbors still form on the interface, but LSAs are filtered',
    ],
    answer: 2,
    difficulty: 2,
    tags: V2,
    explanation:
      'A passive interface sends **no hellos**, so no neighbor can form there, but its prefix is **still advertised** into OSPFv3. The interface is not shut down, and nothing is filtered.',
  },
];
