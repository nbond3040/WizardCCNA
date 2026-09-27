import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. All four routers on the LAN start OSPF at the same time with the priorities and router IDs shown. Which routers become the DR and the BDR?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.5 },
          { id: 'ra', icon: 'router', label: 'RA', sub: 'RID 192.168.1.1 · pri 1', x: 2, y: 1 },
          { id: 'rb', icon: 'router', label: 'RB', sub: 'RID 10.255.255.9 · pri 50', x: 8, y: 1 },
          { id: 'rc', icon: 'router', label: 'RC', sub: 'RID 172.16.9.9 · pri 50', x: 2, y: 4 },
          { id: 'rd', icon: 'router', label: 'RD', sub: 'RID 192.168.9.9 · pri 0', x: 8, y: 4 },
        ],
        links: [
          { from: 'ra', to: 'sw' },
          { from: 'rb', to: 'sw' },
          { from: 'rc', to: 'sw' },
          { from: 'rd', to: 'sw' },
        ],
      },
    },
    options: ['RC is DR and RB is BDR', 'RD is DR and RA is BDR', 'RB is DR and RC is BDR', 'RA is DR and RC is BDR'],
    answer: 0,
    difficulty: 2,
    explanation:
      'RD has priority 0 and is ineligible despite the highest RID. RB and RC tie on the highest priority (50), so the router ID decides: 172.16.9.9 is higher than 10.255.255.9, making **RC the DR** and **RB the BDR**; RA (priority 1) is a DROTHER. Choosing RD or RA ignores priority, and making RB the DR compares the RIDs wrongly — 172 beats 10 in the first octet.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'R1 (priority 1, RID 1.1.1.1) and R2 (priority 1, RID 2.2.2.2) start OSPF together on an Ethernet segment. Later, R3 (priority 100, RID 3.3.3.3) is connected. Some time after that, R2 fails. Which routers are the DR and BDR once OSPF has reconverged?',
    options: ['R3 is DR and R1 is BDR', 'R1 is DR and R3 is BDR', 'R3 is DR and there is no BDR', 'R1 is DR and there is no BDR'],
    answer: 1,
    difficulty: 3,
    explanation:
      'R2 wins the first election on router ID, with R1 as BDR. R3 arrives later and, because the election is **non-preemptive**, becomes a DROTHER despite its priority. When R2 fails, the BDR (R1) is promoted to DR, and a new BDR election among the remaining routers picks R3 (priority 100). R3 never jumps straight to DR, and a BDR is always re-elected when an eligible router exists.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1         100   FULL/DR         00:00:36    10.1.1.1        GigabitEthernet0/0/0
3.3.3.3           1   FULL/BDR        00:00:32    10.1.1.3        GigabitEthernet0/0/0
4.4.4.4           0   2WAY/DROTHER    00:00:39    10.1.1.4        GigabitEthernet0/0/0`,
    },
    options: [
      'R2 is a DROTHER on this segment',
      '4.4.4.4 can never become DR or BDR on this segment',
      'The relationship with 4.4.4.4 has failed and must be investigated',
      '1.1.1.1 is the DR because it has the lowest router ID',
      'R2 sends its link-state updates for this segment to 224.0.0.5',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The DR (1.1.1.1) and BDR (3.3.3.3) are other routers, so R2 is a **DROTHER**, and 4.4.4.4 shows priority **0**, which makes it permanently ineligible. 2WAY/DROTHER between two DROTHERs is normal. 1.1.1.1 won with its priority of 100 — a lower RID never helps — and DROTHERs send updates to 224.0.0.6, the DR/BDR group.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The neighbor remains in this state for several minutes. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   EXSTART/DR      00:00:33    10.0.12.2       GigabitEthernet0/0/0`,
    },
    options: [
      'The IP MTUs of R1 and R2 do not match',
      'The hello intervals of R1 and R2 do not match',
      'R1 and R2 are configured in different areas',
      'R2 has a higher OSPF priority than R1',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'EXSTART and EXCHANGE are the Database Description stages, and DBDs carry the interface MTU; a router rejects DBDs that advertise a larger MTU than its own, so the exchange never completes. Hello-interval or area mismatches stop the Hellos themselves, so the neighbor would not be listed at all. Priority only decides the DR, and 2.2.2.2 being the DR is perfectly normal.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 do not become OSPF neighbors. Which command, applied to R2\'s G0/0/0, fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf interface GigabitEthernet0/0/0 | include Area|Timer
  Internet Address 10.0.12.1/30, Area 0, Attached via Network Statement
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
R2# show ip ospf interface GigabitEthernet0/0/0 | include Area|Timer
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Timer intervals configured, Hello 10, Dead 30, Wait 30, Retransmit 5`,
    },
    options: ['`ip ospf dead-interval 40`', '`ip ospf hello-interval 10`', '`ip ospf priority 0`', '`ip ospf network point-to-point`'],
    answer: 0,
    difficulty: 3,
    explanation:
      'The hello intervals already match (10 s), but R2\'s dead interval is 30 while R1\'s is 40. Both values travel in every Hello and must be identical, so `ip ospf dead-interval 40` (or `no ip ospf dead-interval`) on R2 fixes it. Re-entering the hello interval changes nothing, priority 0 only removes R2 from the DR election, and changing the network type on one end would create a new mismatch.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Two OSPF routers on the same Ethernet link reach the FULL state even though one parameter is configured differently on each. Which parameter is it?',
    options: ['Interface priority', 'Area ID', 'Hello interval', 'Subnet mask'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Priority only influences the DR/BDR election and may differ freely. The area ID, hello interval and — on broadcast links — the subnet mask are all checked in the Hello, so a difference in any of them prevents the neighbor relationship.',
  },
  {
    id: 'e7',
    type: 'categorize',
    stem: 'Classify each parameter according to whether it must match for two routers to become fully adjacent.',
    categories: ['Must match', 'May differ'],
    items: [
      { text: 'Area ID', category: 0 },
      { text: 'Hello and dead intervals', category: 0 },
      { text: 'Subnet and mask of the shared link', category: 0 },
      { text: 'Authentication settings', category: 0 },
      { text: 'IP MTU', category: 0 },
      { text: 'OSPF process ID', category: 1 },
      { text: 'Interface priority', category: 1 },
      { text: 'Interface cost', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Hello-carried values (area, timers, mask, authentication) must match for the neighbor to appear, and the MTU must match for the DBD exchange to complete. Process ID, priority and cost are local decisions that never block an adjacency.',
  },
  {
    id: 'e8',
    type: 'match',
    stem: 'Match each `show ip ospf neighbor` state to its meaning.',
    pairs: [
      { left: '`FULL/DR`', right: 'Fully adjacent; the neighbor is the designated router' },
      { left: '`FULL/  -`', right: 'Fully adjacent on a point-to-point link' },
      { left: '`2WAY/DROTHER`', right: 'Bidirectional but not adjacent; both routers are DROTHERs' },
      { left: '`INIT/DROTHER`', right: 'A Hello was received, but it does not list this router yet' },
      { left: '`EXSTART/BDR`', right: 'Negotiating master and slave for the database exchange' },
    ],
    difficulty: 2,
    explanation:
      'The part before the slash is the adjacency state and the part after it is the neighbor\'s role. A dash means no DR/BDR (point-to-point), 2-WAY between DROTHERs is normal, INIT is one-way, and EXSTART is the start of the DBD exchange.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. R5 connects to R1 G0/0/1 and uses default OSPF interface settings on its GigabitEthernet interface. Which result is expected?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section interface GigabitEthernet0/0/1
interface GigabitEthernet0/0/1
 ip address 10.0.15.1 255.255.255.252
 ip ospf network point-to-point
 ip ospf 1 area 0`,
    },
    options: [
      'The neighbors can reach FULL, but routes through the link are missing',
      'The neighbors never appear because the hello timers differ',
      'The link works normally because network types do not have to match',
      'R1 and R5 complete a DR/BDR election and routing works normally',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R5 defaults to the broadcast type while R1 is point-to-point. Both use 10/40 timers, so the Hellos are accepted and the adjacency can reach FULL, but R1 describes the link as point-to-point while R5 expects a DR and a network LSA, so SPF cannot use the link and routes are missing. The timers do not differ, network types must be compatible, and a point-to-point interface never takes part in a DR election. The fix is `ip ospf network point-to-point` on R5 too.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Why is R2 fully adjacent with only two of its three OSPF neighbors on this segment?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ip ospf interface GigabitEthernet0/0/0 | include State|Designated|Neighbor Count|Adjacent
  Transmit Delay is 1 sec, State DROTHER, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 10.1.1.1
  Backup Designated router (ID) 3.3.3.3, Interface address 10.1.1.3
  Neighbor Count is 3, Adjacent neighbor count is 2
    Adjacent with neighbor 1.1.1.1  (Designated Router)
    Adjacent with neighbor 3.3.3.3  (Backup Designated Router)`,
    },
    options: [
      'R2 is a DROTHER, and DROTHERs form full adjacencies only with the DR and BDR',
      'The third neighbor uses different hello and dead timers',
      'The third neighbor is stuck in EXSTART because of an MTU mismatch',
      'A priority of 1 limits a router to two adjacencies',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'R2 is a DROTHER and is adjacent with exactly the DR and the BDR. The third neighbor is neither, so it is another DROTHER and the pair correctly stops at 2-WAY — R2 never even starts a database exchange with it, so an MTU mismatch cannot be the reason. It is counted as a neighbor, so its Hellos (and timers) are accepted, and priority has no effect on the number of adjacencies.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'An engineer configures `ip ospf priority 200` on the LAN interface of R3, which is currently a DROTHER. Several minutes later, the DR and BDR have not changed. What explains this?',
    options: [
      'The election is non-preemptive; roles change only when the DR or BDR fails or OSPF is reset',
      'IOS ignores priority values above 100',
      'Priority is used only on point-to-point links',
      'The router ID must also be changed before a new priority takes effect',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'OSPF does not preempt an existing DR or BDR, so the new priority only matters at the next election — after a failure or an OSPF reset. Values up to 255 are valid, priority matters only on multiaccess (not point-to-point) links, and the router ID is unrelated to when a priority takes effect.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Which statement about the BDR on an OSPF broadcast segment is true?',
    options: [
      'It is promoted to DR immediately if the DR fails',
      'It forwards user traffic whenever the DR is busy',
      'It is elected only on point-to-point links',
      'It originates the Type 2 network LSA for the segment',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The BDR keeps full adjacencies and a synchronized LSDB precisely so that it can take over at once when the DR fails. Neither the DR nor the BDR forwards traffic for others — the roles are control-plane only — point-to-point links have no DR/BDR at all, and the Type 2 LSA is originated by the DR.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'A broadcast segment has six OSPF routers: one DR, one BDR and four DROTHERs. How many full adjacencies exist on the segment?',
    answers: ['9', 'nine'],
    placeholder: 'number',
    difficulty: 2,
    explanation:
      'The DR and BDR are adjacent to each other (1), and each of the four DROTHERs is adjacent to both the DR and the BDR (4 × 2 = 8), for **9** in total — the 2n − 3 formula. A full mesh would need 6 × 5 ÷ 2 = 15.',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'R4 is currently the DR on a LAN. Put the steps in order to make R1 the DR.',
    items: [
      'Enter interface configuration mode for R1\'s LAN interface',
      'Configure `ip ospf priority 255`',
      'Reset OSPF on the segment\'s routers so that a new election runs',
      'Verify that R1 shows State DR in `show ip ospf interface`',
    ],
    difficulty: 2,
    explanation:
      'Priority is an interface setting, so it is configured on R1\'s LAN interface. Because the election is non-preemptive, the new value has no effect until a new election runs, which requires resetting OSPF (or losing the current DR and BDR). Verification comes last.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 are directly connected through their G0/0/0 interfaces but have not formed a neighbor relationship. Which change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/0      1     0               10.0.12.1/30       1     DR    0/0

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/0      2     0               10.0.12.5/30       1     DR    0/0`,
    },
    options: [
      'Change R2\'s address to 10.0.12.2/30',
      'Change R2\'s OSPF process ID to 1',
      'Configure `ip ospf priority 0` on R2',
      'Move R2\'s G0/0/0 into area 1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'With a /30 mask, 10.0.12.1 belongs to 10.0.12.0/30 but 10.0.12.5 belongs to 10.0.12.4/30. The routers are in different subnets, so their Hellos are rejected and both show 0 neighbors. Giving R2 10.0.12.2/30 fixes it. The process IDs (1 and 2) are locally significant, priority only affects the election, and moving R2 to area 1 would add an area mismatch.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'R1 lists R2 in the INIT state. What does this indicate?',
    options: [
      'R1 receives Hellos from R2, but R2\'s Hellos do not list R1\'s router ID',
      'R1 and R2 disagree on the interface MTU',
      'R2 has just been elected DR',
      'The two LSDBs are fully synchronized',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'INIT means one-way communication: R1 hears R2, but R2 has not heard R1 — for example because an inbound ACL on R2 drops OSPF. An MTU disagreement shows up later, in EXSTART/EXCHANGE; the DR election happens after 2-Way; and synchronized databases are shown as FULL.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Which two statements about the OSPF DR/BDR election are true? (Choose two.)',
    options: [
      'A router with interface priority 0 cannot become DR or BDR',
      'When priorities tie, the router with the highest router ID wins',
      'The router with the highest interface IP address always becomes DR',
      'A new router with a higher priority immediately becomes DR',
      'A DR and a BDR are elected on point-to-point links',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'Priority 0 opts a router out, and the **router ID** breaks priority ties. Interface addresses matter only indirectly, when one of them supplied the RID; the election is non-preemptive; and point-to-point links have no DR or BDR.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Refer to the exhibit. This message appears on R2, which is directly connected to R1. Which two actions on R2 are required to resolve the problem? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `*Sep 26 11:02:15.321: %OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 1.1.1.1 from 10.0.12.1 on interface GigabitEthernet0/0/0`,
    },
    options: [
      'Configure a unique `router-id` under the OSPF process',
      'Reset the OSPF process with `clear ip ospf process`',
      'Change the OSPF process ID',
      'Configure `ip ospf priority 0` on G0/0/0',
      'Configure `ip ospf network point-to-point` on G0/0/0',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'R2 uses the same router ID as its neighbor, 1.1.1.1. A unique `router-id` must be configured, and because the process is already running, it takes effect only after `clear ip ospf process` (or a reload). The process ID is local and irrelevant, and neither priority nor network type makes the router IDs unique.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'All four routers on an Ethernet segment are configured with `ip ospf priority 0` on their LAN interfaces. Which two statements are true? (Choose two.)',
    options: [
      'No DR or BDR is elected on the segment',
      'Every router lists its neighbors on the segment as 2WAY/DROTHER',
      'The router with the highest router ID becomes DR',
      'The routers form full adjacencies directly with each other',
      'The segment automatically switches to the point-to-point network type',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'With every router ineligible, **no DR or BDR** exists. DROTHERs form full adjacencies only with a DR or BDR, so every pair stays at **2-WAY** and no database exchange happens over that segment. Priority 0 overrides the router ID, routers never fall back to a full mesh, and the network type does not change by itself.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'Refer to the exhibit. The four routers share one Ethernet segment and start OSPF at the same time. What is the router ID of the router that becomes the BDR?',
    exhibit: {
      kind: 'table',
      columns: ['Router', 'Router ID', 'LAN interface priority'],
      rows: [
        ['R1', '1.1.1.1', '10'],
        ['R2', '2.2.2.2', '10'],
        ['R3', '3.3.3.3', '5'],
        ['R4', '4.4.4.4', '0'],
      ],
    },
    answers: ['1.1.1.1'],
    placeholder: 'x.x.x.x',
    difficulty: 3,
    explanation:
      'R4 (priority 0) is ineligible. R1 and R2 share the highest priority (10); the higher RID, 2.2.2.2, becomes DR and the next-best candidate, R1 (**1.1.1.1**), becomes BDR. R3 has a higher RID than R1 but a lower priority (5), and priority is always compared first.',
  },
  {
    id: 'e21',
    type: 'categorize',
    stem: 'Classify each observation by its most likely cause.',
    categories: ['MTU mismatch', 'Hello parameter mismatch', 'Normal operation'],
    items: [
      { text: 'A neighbor remains in EXSTART', category: 0 },
      { text: 'A neighbor remains in EXCHANGE', category: 0 },
      { text: 'No neighbor appears; the dead intervals are 40 and 30 seconds', category: 1 },
      { text: 'No neighbor appears; one interface is in area 0, the other in area 1', category: 1 },
      { text: 'Two DROTHERs show each other as 2WAY/DROTHER', category: 2 },
      { text: 'A DROTHER shows the BDR as FULL/BDR', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Stalls in EXSTART/EXCHANGE come from DBD packets rejected because of the MTU. Timers and area IDs are compared in Hellos, so a mismatch keeps the neighbor out of the table entirely. 2-WAY between DROTHERs and FULL with the BDR are exactly what a healthy broadcast segment looks like.',
  },
];

export default exam;
