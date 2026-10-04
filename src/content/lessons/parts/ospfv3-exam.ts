import type { Question } from '../../types';

const V2: string[] = ['v2.0'];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which destination address does an OSPFv3 router use to send packets only to the DR and BDR on a broadcast link?',
    options: ['FF02::5', 'FF02::6', '224.0.0.6', 'FF02::2'],
    answer: 1,
    difficulty: 1,
    tags: V2,
    explanation:
      '**FF02::6** is the OSPFv3 AllDRouters group, used by non-DR routers to send updates to the DR and BDR. FF02::5 reaches all OSPF routers, 224.0.0.6 is the OSPFv2 equivalent, and FF02::2 is the all-routers group used by other protocols such as NDP.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ipv6 ospf neighbor

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           1   FULL/BDR        00:00:35    5               GigabitEthernet0/0/0
3.3.3.3           1   FULL/DR         00:00:38    6               GigabitEthernet0/0/1`,
    },
    options: [
      'The router with ID 3.3.3.3 is the DR on the link to Gi0/0/1',
      'R2 is the DR on the link connected to Gi0/0/1',
      '1.1.1.1 is the IPv6 link-local address of R1 on interface Gi0/0/0',
      'R2 has not yet synchronized its database with 3.3.3.3',
    ],
    answer: 0,
    difficulty: 2,
    tags: V2,
    explanation:
      'The role after FULL/ is the **neighbor\'s** role, so 3.3.3.3 is the **DR** on Gi0/0/1 and R2 cannot also be the DR there. The Neighbor ID column holds 32-bit **router IDs**, not IPv6 addresses. FULL means the databases are already synchronized.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. R4 has IPv6 routing enabled and no IPv4 addresses. What must the engineer do so that OSPFv3 starts?',
    exhibit: {
      kind: 'cli',
      text: `R4(config)# interface GigabitEthernet0/0/0
R4(config-if)# ipv6 address 2001:DB8:0:24::4/64
R4(config-if)# ipv6 ospf 1 area 0
%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id,
please configure manually`,
    },
    options: [
      'Configure router-id 4.4.4.4 under ipv6 router ospf 1',
      'Configure an IPv6 address on a loopback interface',
      'Replace ipv6 ospf 1 area 0 with a network command',
      'Configure ipv6 address FE80::4 link-local on the interface',
    ],
    answer: 0,
    difficulty: 3,
    tags: V2,
    explanation:
      'The OSPFv3 router ID is a **32-bit** value; with no IPv4 address available, it must be set manually with `router-id` under the process. An IPv6 loopback does not help, because IPv6 addresses are never used as the router ID. OSPFv3 has no `network` command, and the interface already has an automatic link-local address, so changing it fixes nothing.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. R2 Gi0/0/1 connects to R3 Gi0/0/1, but the routers do not become OSPFv3 neighbors. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/0/1      1     0               6          1     DR    0/0
Gi0/0/0      1     0               5          1     DR    1/1

R3# show ipv6 ospf interface brief
Interface    PID   Area            Intf ID    Cost  State Nbrs F/C
Gi0/0/0      1     1               5          1     DR    0/0
Gi0/0/1      1     1               6          1     DR    0/0`,
    },
    options: [
      'The two ends of the link are in different OSPFv3 areas',
      'The routers use different OSPFv3 process IDs',
      'Both interfaces became DR, so the election failed',
      'The interface costs on both ends are identical',
    ],
    answer: 0,
    difficulty: 3,
    tags: V2,
    explanation:
      'R2 has Gi0/0/1 in **area 0** while R3 has its end in **area 1**; hellos with a mismatched area are ignored, so no neighbor forms. Both routers use process ID 1, and process IDs are locally significant anyway. Each side being DR with 0/0 neighbors is a **symptom** of being alone on the link, not the cause. Equal costs are normal and never block an adjacency.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Which two statements about OSPFv3 are true? (Choose two.)',
    options: [
      'Neighbors exchange hellos using their link-local addresses',
      'It is enabled with network commands under the routing process',
      'It is enabled directly on each participating interface',
      'Hellos are sent to the IPv4 multicast address 224.0.0.5',
      'It requires a 128-bit router ID based on its IPv6 address',
    ],
    answers: [0, 2],
    difficulty: 2,
    tags: V2,
    explanation:
      'OSPFv3 sources its packets from **link-local** addresses and is enabled **per interface** with `ipv6 ospf <pid> area <area>`. There is no `network` command in OSPFv3, hellos go to FF02::5 (224.0.0.5 is OSPFv2), and the router ID is a 32-bit value.',
  },
  {
    id: 'e6',
    type: 'order',
    stem: 'Put the commands in the recommended order to bring up OSPFv3 on a new IPv6-only router and verify it.',
    items: [
      'ipv6 unicast-routing',
      'ipv6 router ospf 1',
      'router-id 1.1.1.1',
      'interface GigabitEthernet0/0/0',
      'ipv6 ospf 1 area 0',
      'show ipv6 ospf neighbor',
    ],
    difficulty: 2,
    tags: V2,
    explanation:
      'Enable IPv6 routing first, create the process and give it a router ID (mandatory without IPv4), then enter each interface and enable OSPFv3 with `ipv6 ospf 1 area 0`. Verification with `show ipv6 ospf neighbor` comes last. Configuring the interface before the router ID would trigger the NORTRID message.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each OSPFv2 item with its OSPFv3 equivalent.',
    pairs: [
      { left: '224.0.0.5', right: 'FF02::5' },
      { left: '224.0.0.6', right: 'FF02::6' },
      { left: 'router ospf 1', right: 'ipv6 router ospf 1' },
      { left: 'network 10.1.1.0 0.0.0.255 area 0', right: 'ipv6 ospf 1 area 0 (interface mode)' },
      { left: 'show ip ospf neighbor', right: 'show ipv6 ospf neighbor' },
    ],
    difficulty: 1,
    tags: V2,
    explanation:
      'The multicast groups map to **FF02::5** and **FF02::6**, the process command gains an `ipv6` prefix, and because OSPFv3 has no `network` command, interfaces are enabled with `ipv6 ospf 1 area 0`. The show commands simply replace `ip` with `ipv6`.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'Enter the interface configuration command that enables OSPFv3 process 10 in area 0 on an interface.',
    answers: ['ipv6 ospf 10 area 0', 'ipv6 ospf 10 area 0.0.0.0'],
    placeholder: 'interface command',
    difficulty: 2,
    tags: V2,
    explanation:
      '`ipv6 ospf 10 area 0` names both the process and the area. The area can also be written in dotted-decimal form as 0.0.0.0. `ipv6 router ospf 10` only creates the process, and `network` statements do not exist in OSPFv3.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Which address does R1 use as the next hop to reach 2001:DB8:3:3::/64?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 route ospf
IPv6 Routing Table - default - 11 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
<output omitted>
O   2001:DB8:0:23::/64 [110/2]
     via FE80::2, GigabitEthernet0/0/0
O   2001:DB8:2:2::/64 [110/2]
     via FE80::2, GigabitEthernet0/0/0
O   2001:DB8:3:3::/64 [110/3]
     via FE80::2, GigabitEthernet0/0/0`,
    },
    options: ['FE80::2', '2001:DB8:0:12::2', '2001:DB8:0:23::3', 'FF02::5'],
    answer: 0,
    difficulty: 2,
    tags: V2,
    explanation:
      'OSPFv3 routes use the neighbor\'s **link-local** address, here **FE80::2** out GigabitEthernet0/0/0. R2\'s global address 2001:DB8:0:12::2 is not used as a next hop, 2001:DB8:0:23::3 belongs to a router two hops away, and FF02::5 is the multicast destination for hellos.',
  },
  {
    id: 'e10',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R2# show ipv6 route ospf
IPv6 Routing Table - default - 10 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
<output omitted>
OE2 ::/0 [110/1], tag 1
     via FE80::1, GigabitEthernet0/0/0
O   2001:DB8:1:1::/64 [110/2]
     via FE80::1, GigabitEthernet0/0/0
O   2001:DB8:3:3::/64 [110/2]
     via FE80::3, GigabitEthernet0/0/1`,
    },
    options: [
      'The default route is an external route injected into OSPFv3 by an ASBR',
      'Each OSPF route uses a neighbor link-local address as its next hop',
      'The default route is an OSPF intra-area route learned from FE80::1',
      'The route to 2001:DB8:1:1::/64 has an administrative distance of 2',
      'R2 reaches 2001:DB8:3:3::/64 through the router at FE80::1',
    ],
    answers: [0, 1],
    difficulty: 3,
    tags: V2,
    explanation:
      '**OE2** marks an external type 2 route — here ::/0 advertised by an ASBR with `default-information originate` — and every next hop is a **link-local** address with an exit interface. An intra-area route would be coded O. In [110/2], 110 is the administrative distance and 2 is the cost. The route to 2001:DB8:3:3::/64 uses FE80::3 on Gi0/0/1, not FE80::1.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'R1 and R2 are directly connected on Gi0/0/0, have IPv6 enabled and are configured for OSPFv3 on the link, but they never become neighbors. Which two misconfigurations could cause this? (Choose two.)',
    options: [
      'R1 has the interface in area 0 and R2 has it in area 1',
      'R1 uses OSPFv3 process 1 and R2 uses process 2',
      'R2 has the interface configured as passive',
      'The routers use different global unicast prefixes on the link',
      'The routers have different link-local addresses',
    ],
    answers: [0, 2],
    difficulty: 3,
    tags: V2,
    explanation:
      'An **area mismatch** makes each router discard the other\'s hellos, and a **passive** interface sends no hellos at all. Process IDs are locally significant, OSPFv3 hellos carry no prefix so global prefixes do not need to match, and link-local addresses are always different between neighbors.',
  },
  {
    id: 'e12',
    type: 'categorize',
    stem: 'Categorize each characteristic as OSPFv2 only, OSPFv3 only, or both.',
    categories: ['OSPFv2 only', 'OSPFv3 only', 'Both'],
    items: [
      { text: 'Hellos sent to 224.0.0.5', category: 0 },
      { text: 'Can be enabled with the network command', category: 0 },
      { text: 'Hellos sent to FF02::5', category: 1 },
      { text: 'Packets sourced from link-local addresses', category: 1 },
      { text: 'Authentication provided by IPsec', category: 1 },
      { text: '32-bit router ID', category: 2 },
      { text: 'Administrative distance 110', category: 2 },
      { text: 'Default hello/dead of 10/40 seconds on Ethernet', category: 2 },
    ],
    difficulty: 2,
    tags: V2,
    explanation:
      'OSPFv2 uses 224.0.0.5 and supports `network` commands. OSPFv3 uses FF02::5, link-local sources and IPsec. Both versions share the **32-bit router ID**, **AD 110** and the **10/40-second** default timers on Ethernet.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'An engineer is enabling OSPFv3 on a router that has only IPv6 addresses. In addition to ipv6 ospf 1 area 0 on each interface, which two commands are required? (Choose two.)',
    options: [
      'ipv6 unicast-routing',
      'router-id 1.1.1.1 under ipv6 router ospf 1',
      'network 2001:DB8::/32 area 0',
      'ip routing in global configuration mode',
      'ipv6 address autoconfig',
    ],
    answers: [0, 1],
    difficulty: 2,
    tags: V2,
    explanation:
      '**`ipv6 unicast-routing`** lets the router route IPv6 and run OSPFv3, and a manual **`router-id`** is required because there is no IPv4 address to derive one from. `network` commands do not exist in OSPFv3, `ip routing` concerns IPv4 (and is already on by default on routers), and SLAAC autoconfiguration is for hosts, not a requirement for OSPFv3.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'R1 is configured with default-information originate under ipv6 router ospf 1, but no other router learns a default route. R1 has no static routes. Which change fixes the problem?',
    options: [
      'Add an IPv6 default route on R1, such as ipv6 route ::/0 2001:DB8:FFFF::2',
      'Make R1\'s ISP-facing interface passive',
      'Enable ipv6 ospf 1 area 0 on R1\'s ISP-facing interface',
      'Configure default-information originate on every other router',
    ],
    answer: 0,
    difficulty: 2,
    tags: V2,
    explanation:
      'Without the `always` keyword, `default-information originate` advertises ::/0 only while the router **has a default route** in its routing table, so R1 needs one. Making the ISP interface passive or running OSPFv3 toward the ISP does not create a default route, and other routers should learn the default from R1, not originate their own.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 are connected through their Gi0/0/0 interfaces but do not form an OSPFv3 adjacency. What must be changed?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 ospf interface GigabitEthernet0/0/0 | include Area|Timer
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5

R2# show ipv6 ospf interface GigabitEthernet0/0/0 | include Area|Timer
  Area 0, Process ID 1, Instance ID 0, Router ID 2.2.2.2
  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5`,
    },
    options: [
      'Configure matching hello and dead intervals on both ends',
      'Move R2\'s interface into area 1 and keep R1 in area 0',
      'Configure the same router ID on both routers in the area',
      'Put both global unicast addresses in the same /64 prefix',
    ],
    answer: 0,
    difficulty: 3,
    tags: V2,
    explanation:
      'Area, instance ID and process look fine, but the **timers** differ: R1 uses 10/40 seconds and R2 uses 5/20. Hello and dead intervals must match, so set them equal on both ends. Moving R2 to area 1 would add an area mismatch, identical router IDs would cause a new failure, and global prefixes do not affect OSPFv3 adjacencies.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'What does the Neighbor ID column in show ipv6 ospf neighbor display?',
    options: [
      'The neighbor\'s link-local address',
      'The neighbor\'s 32-bit router ID',
      'The neighbor\'s global unicast address',
      'The neighbor\'s interface ID',
    ],
    answer: 1,
    difficulty: 1,
    tags: V2,
    explanation:
      'Neighbor ID is the neighbor\'s **router ID**, a 32-bit dotted-decimal value. The link-local address appears only in the detail output, global addresses are not shown, and the interface ID has its own column.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. What is the effect of the configuration on R2 Gi0/0/2?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ipv6 ospf interface GigabitEthernet0/0/2 | include Area|Passive
  Area 0, Process ID 1, Instance ID 0, Router ID 2.2.2.2
    No Hellos (Passive interface)`,
    },
    options: [
      'R2 advertises the Gi0/0/2 prefix but sends no hellos on that interface',
      'R2 stops advertising the Gi0/0/2 prefix to its neighbors',
      'The interface is administratively shut down and removed from OSPFv3',
      'Neighbors on Gi0/0/2 form adjacencies but receive no LSAs',
    ],
    answer: 0,
    difficulty: 2,
    tags: V2,
    explanation:
      'A **passive** interface stays in OSPFv3 — its prefix is still advertised — but sends no hellos, so no neighbor can form on it. The prefix is not withdrawn, the interface is not shut down, and without hellos no adjacency is possible at all.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. R5 runs OSPFv3 and has no router-id command configured. Which router ID does OSPFv3 use?',
    exhibit: {
      kind: 'cli',
      text: `R5# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   192.168.50.1    YES manual up                    up
GigabitEthernet0/0/1   172.16.5.1      YES manual up                    up
Loopback0              10.5.5.5        YES manual up                    up`,
    },
    options: ['192.168.50.1', '10.5.5.5', '172.16.5.1', 'None — OSPFv3 needs an IPv6 router ID'],
    answer: 1,
    difficulty: 2,
    tags: V2,
    explanation:
      'Without `router-id`, OSPFv3 uses the highest IPv4 address on an up **loopback** — **10.5.5.5** — before considering physical interfaces, even though 192.168.50.1 is numerically higher. 172.16.5.1 would never win, and OSPFv3 router IDs are 32-bit values, never IPv6 addresses.',
  },
  {
    id: 'e19',
    type: 'match',
    stem: 'Match each command with the information it provides.',
    pairs: [
      { left: 'show ipv6 ospf neighbor', right: 'Neighbor router IDs, states and dead timers' },
      { left: 'show ipv6 ospf interface brief', right: 'Area, cost, state and neighbor count per interface' },
      { left: 'show ipv6 route ospf', right: 'OSPF-learned prefixes with link-local next hops' },
      { left: 'show ipv6 ospf interface GigabitEthernet0/0/0', right: 'Timers, link-local address and DR/BDR details for one interface' },
    ],
    difficulty: 2,
    tags: V2,
    explanation:
      'Use the **neighbor** command for adjacencies, the **interface brief** command for area and state per interface, the **route** command for learned prefixes, and the full **interface** command for timers, link-local address and DR/BDR details.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. Both interfaces are configured with ipv6 ospf 1 area 0 and the hello/dead timers match, but the global unicast addresses were mistyped into different /64 prefixes. What is the result?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: '2001:DB8:0:12::1/64 · FE80::1', x: 2, y: 1.5 },
          { id: 'r2', icon: 'router', label: 'R2', sub: '2001:DB8:0:99::2/64 · FE80::2', x: 8, y: 1.5 },
        ],
        links: [{ from: 'r1', to: 'r2', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', label: 'area 0' }],
      },
    },
    options: [
      'R1 and R2 become neighbors, because hellos use link-local addresses',
      'R1 and R2 do not become neighbors until the global prefixes match',
      'R1 and R2 stay in 2-WAY state until the global prefixes match',
      'R1 and R2 become neighbors only if one of them is made passive',
    ],
    answer: 0,
    difficulty: 3,
    tags: V2,
    explanation:
      'OSPFv3 runs **per link**: hellos are sourced from link-local addresses and contain no prefix or mask, so the adjacency forms normally and each router advertises its own prefix. Prefix mismatches block OSPFv2 on broadcast links, not OSPFv3. 2-WAY is not caused by prefixes, and a passive interface would prevent the adjacency rather than enable it.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'Enter the IPv6 multicast address to which OSPFv3 hello packets are sent.',
    answers: ['FF02::5', 'FF02:0:0:0:0:0:0:5'],
    placeholder: 'IPv6 address',
    difficulty: 1,
    tags: V2,
    explanation:
      'Hellos go to **FF02::5**, the all-OSPF-routers group (224.0.0.5 in OSPFv2). FF02::6 is only for the DR and BDR.',
  },
];
