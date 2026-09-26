import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. OSPF has just been enabled on R1, and no `router-id` command is configured. Which router ID does R1 use?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section router ospf
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   192.168.50.1    YES manual up                    up
GigabitEthernet0/0/1   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/2   203.0.113.9     YES manual administratively down down
Loopback0              10.255.0.1      YES manual up                    up
Loopback1              172.16.0.1      YES manual up                    up`,
    },
    options: ['203.0.113.9', '192.168.50.1', '172.16.0.1', '10.255.0.1'],
    answer: 2,
    difficulty: 3,
    explanation:
      'With no manual router ID, IOS picks the **highest IPv4 address on an up loopback**: Loopback1 (172.16.0.1) beats Loopback0 (10.255.0.1). Loopbacks take precedence over physical interfaces even though 192.168.50.1 and 203.0.113.9 are numerically higher, and G0/0/2 is shut down anyway. The loopback does not need to match a `network` statement — 172.16.0.1 lies outside 10.0.0.0/8 but is still eligible.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. R2 previously used 10.2.2.2 as its OSPF router ID. Why does the output still show 10.2.2.2?',
    exhibit: {
      kind: 'cli',
      text: `R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect
R2(config-router)# end
R2# show ip protocols | include Router ID
  Router ID 10.2.2.2`,
    },
    options: [
      'The `router-id` command was rejected because 2.2.2.2 is not assigned to any interface',
      'The new router ID takes effect only after `clear ip ospf process` or a reload',
      'A loopback address always overrides a manually configured router ID',
      'The new router ID is applied only after every neighbor\'s dead timer expires',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'IOS accepted the command — the message says so — but a running OSPF process keeps its current RID until it is reset with `clear ip ospf process` or the router reloads. A manual RID does not have to match any interface address, and it has the **highest** precedence, above any loopback. Dead timers play no part in RID selection.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two items are carried in an OSPF Hello packet? (Choose two.)',
    options: [
      'The router priority',
      'The complete link-state database',
      'The router IDs of neighbors already heard on the link',
      'The interface MTU',
      'The OSPF process ID',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Hellos carry the **router priority** (for DR/BDR election) and the **list of neighbor RIDs** heard on the link, along with the area ID, mask, timers, DR/BDR addresses and options. The MTU travels in Database Description packets, which is why MTU problems appear in ExStart/Exchange. LSDB contents move in DBD, LSR and LSU packets, never in Hellos, and the process ID is locally significant and never sent.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. All routers use the default OSPF reference bandwidth and default interface bandwidths. What metric does R1 install for 10.3.3.0/24?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 1.5 },
          { id: 'r2', icon: 'router', label: 'R2', x: 4.2, y: 1.5 },
          { id: 'r3', icon: 'router', label: 'R3', x: 7.2, y: 1.5 },
          { id: 'lan', icon: 'switch', label: 'LAN', x: 9.2, y: 1.5 },
        ],
        links: [
          { from: 'r1', to: 'r2', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', label: '10.0.12.0/30' },
          { from: 'r2', to: 'r3', fromLabel: 'S0/1/0', toLabel: 'S0/1/0', label: 'T1', style: 'serial' },
          { from: 'r3', to: 'lan', fromLabel: 'G0/0/1', label: '10.3.3.0/24' },
        ],
      },
    },
    options: ['64', '65', '66', '130'],
    answer: 2,
    difficulty: 3,
    explanation:
      'Add the **outgoing** interface costs from R1 toward the subnet: R1 G0/0/0 = 100 ÷ 1000, raised to the minimum **1**; R2 S0/1/0 at the default 1544 kbps = 100 ÷ 1.544 → **64**; R3 G0/0/1, the interface on the destination subnet = **1**. Total 1 + 64 + 1 = **66**. 65 forgets the destination LAN interface, 130 wrongly adds R3\'s incoming serial interface as well, and 64 counts only the serial hop.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. All routers run OSPF with default settings. Which statement describes R1\'s routing table entry for 10.4.4.0/24?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 2.5 },
          { id: 'r2', icon: 'router', label: 'R2', x: 4.2, y: 1 },
          { id: 'r3', icon: 'router', label: 'R3', x: 4.2, y: 4 },
          { id: 'r4', icon: 'router', label: 'R4', x: 7, y: 2.5 },
          { id: 'lan', icon: 'switch', label: '10.4.4.0/24', x: 9.1, y: 2.5 },
        ],
        links: [
          { from: 'r1', to: 'r2', label: 'GigabitEthernet' },
          { from: 'r2', to: 'r4', label: 'GigabitEthernet' },
          { from: 'r1', to: 'r3', label: 'FastEthernet' },
          { from: 'r3', to: 'r4', label: 'FastEthernet' },
          { from: 'r4', to: 'lan', label: 'Gig' },
        ],
      },
    },
    options: [
      'One route via R2 with metric 3',
      'Two equal-cost routes, via R2 and via R3, each with metric 3',
      'One route via R2 with metric 30',
      'One route via R3, because FastEthernet has the lower cost',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'With the default 100 Mbps reference, FastEthernet (100 ÷ 100) and Gigabit (100 ÷ 1000, raised to the minimum) **both cost 1**. Each path totals 1 + 1 + 1 = 3, so OSPF installs **two equal-cost routes** and load-balances. A metric of 30 would require a 10 000 Mbps reference on every router, and FastEthernet never costs less than Gigabit. This tie is the classic reason to raise `auto-cost reference-bandwidth` consistently.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'An engineer wants OSPF to assign different costs to FastEthernet and GigabitEthernet interfaces. Which command should be configured on every OSPF router?',
    options: ['`auto-cost reference-bandwidth 1000`', '`bandwidth 1000`', '`ip ospf cost 1`', '`maximum-paths 1`'],
    answer: 0,
    difficulty: 2,
    explanation:
      '`auto-cost reference-bandwidth 1000` (in **Mbps**) makes Gigabit cost 1000 ÷ 1000 = 1 and FastEthernet 1000 ÷ 100 = 10. `bandwidth 1000` is an interface command in **kbps** that would tell OSPF the link runs at 1 Mbps. `ip ospf cost 1` hard-codes the cost both link types already have, and `maximum-paths 1` only limits how many equal-cost routes are installed without making the costs differ.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each OSPF packet type to its function.',
    pairs: [
      { left: 'Hello', right: 'Discovers neighbors and acts as a keepalive' },
      { left: 'DBD', right: 'Lists the LSA headers in the sender\'s LSDB' },
      { left: 'LSR', right: 'Asks for specific missing or outdated LSAs' },
      { left: 'LSU', right: 'Carries one or more complete LSAs' },
      { left: 'LSAck', right: 'Confirms that an update was received' },
    ],
    difficulty: 1,
    explanation:
      'Hello (type 1) forms and maintains neighbors. DBD (type 2) summarizes the database during ExStart and Exchange. LSR (type 3) requests LSAs, LSU (type 4) delivers or floods them, and LSAck (type 5) makes flooding reliable. Do not confuse the LSU packet with the LSAs it carries.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the events in the order they occur as two OSPF routers on a point-to-point link become fully adjacent.',
    items: [
      'R1 receives a Hello from R2 that does not list R1\'s router ID',
      'R1 finds its own router ID in R2\'s Hello',
      'The routers negotiate master and slave roles',
      'The routers exchange DBD packets listing LSA headers',
      'Missing LSAs are requested with LSRs and delivered in LSUs',
      'Both routers hold synchronized LSDBs',
    ],
    difficulty: 2,
    explanation:
      'These events map to Init, 2-Way, ExStart, Exchange, Loading and Full. The master/slave decision (higher RID wins) must come before the DBD exchange, and LSRs can only be sent once the DBDs have revealed which LSAs are missing.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each characteristic or protocol as distance vector or link state.',
    categories: ['Distance vector', 'Link state'],
    items: [
      { text: 'Learns routes from the routing tables its neighbors advertise', category: 0 },
      { text: 'Floods advertisements that describe its own links', category: 1 },
      { text: 'Every router runs the SPF algorithm', category: 1 },
      { text: 'Sends periodic full-table updates', category: 0 },
      { text: 'RIP', category: 0 },
      { text: 'OSPF', category: 1 },
      { text: 'IS-IS', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Distance vector protocols such as RIP learn distance and direction from neighbors and (in RIP\'s case) send full tables every 30 seconds. Link-state protocols such as OSPF and IS-IS flood descriptions of their own links, build an identical database and run SPF locally.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'A router is configured with `auto-cost reference-bandwidth 10000`. What OSPF cost does it calculate for a GigabitEthernet interface with the default bandwidth?',
    answers: ['10'],
    placeholder: 'cost',
    difficulty: 2,
    explanation:
      '10 000 Mbps ÷ 1000 Mbps = **10**. With the same reference, FastEthernet costs 100 and 10-Gigabit Ethernet costs 1.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'A router uses the default OSPF reference bandwidth. An engineer enters `bandwidth 20000` on a WAN interface and does not configure `ip ospf cost`. What OSPF cost does the interface get?',
    answers: ['5'],
    placeholder: 'cost',
    difficulty: 3,
    explanation:
      'The `bandwidth` command is in **kbps**, so 20 000 kbps = 20 Mbps. The default reference is 100 Mbps: 100 ÷ 20 = **5**. Treating 20000 as Mbps would produce a fraction and therefore the minimum cost of 1, which is the tempting wrong answer.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'On an Ethernet segment with a DR and a BDR, which destination address does a DROTHER use when it sends a Link State Update describing a change?',
    options: ['224.0.0.5', '224.0.0.6', '224.0.0.9', '224.0.0.10'],
    answer: 1,
    difficulty: 1,
    explanation:
      'DROTHERs send updates to **224.0.0.6** (AllDRouters), which only the DR and BDR listen to; the DR then re-floods them to 224.0.0.5 (AllSPFRouters). 224.0.0.9 is used by RIPv2 and 224.0.0.10 by EIGRP.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Which LSA type is originated by the designated router to describe a multiaccess segment and the routers attached to it?',
    options: ['Type 1 router LSA', 'Type 2 network LSA', 'Type 3 summary LSA', 'Type 5 external LSA'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The DR originates the **Type 2 network LSA** for its segment. Every router originates its own Type 1 router LSA, Type 3 summaries come from ABRs, and Type 5 external LSAs come from ASBRs.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about OSPF areas and router roles are true? (Choose two.)',
    options: [
      'Every non-backbone area must connect to area 0',
      'An ABR has interfaces in area 0 and at least one other area',
      'An ASBR is any router that connects two OSPF areas',
      'Routers in different areas hold identical LSDBs',
      'Every router with an interface in area 0 is an ABR',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Area 0 is the backbone that all other areas attach to, and an **ABR** sits on the boundary between area 0 and another area. An **ASBR** injects routes from *outside* OSPF — joining areas is the ABR\'s job. LSDBs are identical only *within* an area, and a router whose interfaces are all in area 0 is a backbone (internal) router, not an ABR.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. What are R1 and neighbor 3.3.3.3 doing in their current state?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           0   EXCHANGE/  -    00:00:36    10.0.13.2       Serial0/1/0`,
    },
    options: [
      'Electing a DR and BDR for the link',
      'Sending DBD packets that describe the LSAs in each database',
      'Requesting and receiving the LSAs they are missing',
      'Nothing — their databases are already synchronized',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'In **Exchange** the routers trade Database Description packets listing their LSA headers. DR/BDR election belongs to the 2-Way stage and never happens on a point-to-point link (hence the dash). Requesting missing LSAs is the Loading state, and synchronized databases are shown as FULL.',
  },
  {
    id: 'e16',
    type: 'order',
    stem: 'Order the sources an IOS router uses to choose its OSPF router ID, from highest to lowest precedence.',
    items: [
      'The `router-id` command under the OSPF process',
      'The highest IPv4 address on an up loopback interface',
      'The highest IPv4 address on an active non-loopback interface',
    ],
    difficulty: 1,
    explanation:
      'A manually configured RID always wins. Without one, the highest loopback address is used, and only when no loopback is up does IOS fall back to the highest address on an active physical interface. None of these interfaces needs to be enabled for OSPF.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. GigabitEthernet0/0/1 runs at 1 Gbps with the default `bandwidth`, and no `ip ospf cost` command is configured. Which reference bandwidth is configured on R3?',
    exhibit: {
      kind: 'cli',
      text: `R3# show ip ospf interface GigabitEthernet0/0/1
GigabitEthernet0/0/1 is up, line protocol is up
  Internet Address 10.3.3.1/24, Area 0, Attached via Network Statement
  Process ID 1, Router ID 3.3.3.3, Network Type BROADCAST, Cost: 10
  Topology-MTID    Cost    Disabled    Shutdown      Topology Name
        0           10        no          no            Base
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 3.3.3.3, Interface address 10.3.3.1
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,
    },
    options: ['100 Mbps (the default)', '1000 Mbps', '10 000 Mbps', '100 000 Mbps'],
    answer: 2,
    difficulty: 3,
    explanation:
      'Cost = reference ÷ bandwidth, so reference = 10 × 1000 Mbps = **10 000 Mbps** (`auto-cost reference-bandwidth 10000`). The default 100 Mbps and a 1000 Mbps reference would both give cost 1, and 100 000 Mbps would give 100.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'R1 and R2 are OSPF neighbors on a GigabitEthernet link. Which two changes made on R1 alone would cause the neighbor relationship to fail? (Choose two.)',
    options: [
      'Configuring `ip ospf hello-interval 5` on the interface',
      'Changing the OSPF process ID from 1 to 10',
      'Moving the interface into area 1',
      'Configuring `ip ospf cost 100` on the interface',
      'Configuring `ip ospf priority 0` on the interface',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Hello/dead intervals and the area ID are carried in every Hello and must match. Setting the hello to 5 also moves R1\'s dead interval to 20, so both timers mismatch, and moving the interface into area 1 creates an area mismatch. The process ID is locally significant, cost affects only path selection, and priority 0 merely prevents R1 from becoming DR or BDR — it still forms a neighbor relationship.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Two OSPF routers with router IDs 10.1.1.1 and 10.2.2.2 enter the ExStart state. What happens next?',
    options: [
      'The router with RID 10.2.2.2 becomes master and controls the DBD sequence numbers',
      'The router with RID 10.1.1.1 becomes master because it has the lower RID',
      'The router with the higher interface priority becomes master',
      'The routers elect a DR and a BDR',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'In ExStart the **higher router ID** becomes master for the database exchange. Priority affects only the DR/BDR election, which takes place at 2-Way on multiaccess networks, not in ExStart. A lower RID never wins the master role.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'What is the default OSPF dead interval on a GigabitEthernet interface?',
    options: ['10 seconds', '30 seconds', '40 seconds', '120 seconds'],
    answer: 2,
    difficulty: 1,
    explanation:
      'Ethernet defaults to the broadcast network type with a **10-second hello and a 40-second dead** interval (four times the hello). 10 seconds is the hello itself, and 30/120 are the NBMA and point-to-multipoint values.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         412         0x80000006 0x00A3C1 3
2.2.2.2         2.2.2.2         398         0x80000005 0x0072D4 4
3.3.3.3         3.3.3.3         401         0x80000004 0x00B917 2
4.4.4.4         4.4.4.4         377         0x80000004 0x001E5A 2

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.123.3      3.3.3.3         401         0x80000002 0x00C4E9`,
    },
    options: [
      'Four routers have originated router LSAs in area 0',
      'The router with RID 3.3.3.3 is the DR on a multiaccess segment',
      'R1 is the DR on the 10.0.123.0 segment',
      'Four multiaccess segments have elected a DR',
      'R1 is an ABR',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Each router originates one **Type 1** router LSA per area, so four Router Link States entries mean four routers. A **Type 2** Net Link State is originated only by the DR of a multiaccess segment, so 3.3.3.3 is the DR there (its Link ID, 10.0.123.3, is that DR\'s interface address). There is only one network LSA, R1 did not originate it, and the database shows a single area, so R1 cannot be an ABR.',
  },
];

export default exam;
