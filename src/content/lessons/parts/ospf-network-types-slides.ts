import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'OSPF Network Types, DR/BDR & Adjacencies',
    subtitle: 'Who becomes DR, when links skip the election, and why neighbors refuse to form',
    notes:
      "Two OSPF routers that should be neighbors but are not — or a DR that is not the router you expected — are among the most common OSPF problems in real networks and in exam simulations. This deck covers v1.1 exam topics 3.4.a to 3.4.c, neighbor adjacencies, point-to-point and broadcast networks with DR/BDR selection, and the same material in the v2.0 blueprint's domain 3. You will learn how the **network type** of an interface changes OSPF's behaviour, why multiaccess segments elect a **Designated Router** and a **Backup DR**, exactly how the election works — priority, router ID, and the non-preemptive rule that surprises so many candidates — and how to read DR, BDR and DROTHER roles in `show ip ospf neighbor`. The second half is a troubleshooting toolkit: the complete list of parameters two routers must agree on, and the symptom each mismatch produces, from a neighbor that never appears, to one stuck in INIT or EXSTART, to a FULL adjacency that still delivers no routes.",
  },
  {
    kind: 'table',
    title: 'OSPF network types',
    columns: ['Network type', 'Default on', 'DR/BDR?', 'Hello / Dead', 'Neighbors found by'],
    rows: [
      ['**Broadcast**', 'Ethernet', 'Yes', '10 / 40 s', 'Multicast Hellos (224.0.0.5)'],
      ['**Point-to-point**', 'Serial (HDLC, PPP)', 'No', '10 / 40 s', 'Multicast Hellos (224.0.0.5)'],
      ['Non-broadcast (NBMA)', 'Frame Relay (legacy)', 'Yes', '30 / 120 s', 'Manual `neighbor` commands'],
      ['Point-to-multipoint', 'Configured manually', 'No', '30 / 120 s', 'Multicast Hellos'],
      ['Loopback', 'Loopback interfaces', '—', 'No Hellos', 'Advertised as a /32 host route'],
    ],
    caption: 'The CCNA focuses on broadcast (3.4.c) and point-to-point (3.4.b).',
    notes:
      "OSPF behaves differently depending on the **network type** of each interface, and IOS picks a default from the interface's encapsulation. Ethernet defaults to **broadcast**: routers discover each other with multicast Hellos and elect a DR and BDR. Serial links running HDLC or PPP default to **point-to-point**: exactly two routers, no election. Both use 10-second Hellos and a 40-second dead interval, which is why they can even talk to each other — a fact that matters later in this deck. The **non-broadcast** (NBMA) type was designed for Frame Relay clouds that cannot carry multicast, so neighbors are configured manually with the `neighbor` command and timers are 30 and 120 seconds; point-to-multipoint also uses 30 and 120 but elects no DR. Loopbacks have their own type and are advertised as /32 host routes. The CCNA blueprint names exactly two of these types — point-to-point and broadcast — so concentrate on them, and recognise the others mainly as sources of timer mismatches. `show ip ospf interface` displays the network type of any interface.",
  },
  {
    kind: 'bullets',
    title: 'Why elect a designated router?',
    bullets: [
      'Full mesh of adjacencies: n(n−1)/2',
      '5 routers without a DR → **10** adjacencies',
      'With DR/BDR: each router peers only with them → **7**',
      'DR re-floods updates and originates the **Type 2 LSA**',
      'BDR is already synchronized → takes over at once',
      'Control-plane role only — the DR forwards no extra traffic',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.3 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DR', x: 1.6, y: 1.2, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'BDR', x: 8.4, y: 1.2 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'DROTHER', x: 1.6, y: 3.8 },
        { id: 'r4', icon: 'router', label: 'R4', sub: 'DROTHER', x: 5, y: 4.3 },
        { id: 'r5', icon: 'router', label: 'R5', sub: 'DROTHER', x: 8.4, y: 3.8 },
      ],
      links: [
        { from: 'r1', to: 'sw', tone: 'accent' },
        { from: 'r2', to: 'sw' },
        { from: 'r3', to: 'sw' },
        { from: 'r4', to: 'sw' },
        { from: 'r5', to: 'sw' },
      ],
    },
    notes:
      "Imagine five routers on one Ethernet switch. If every router formed a full adjacency with every other, there would be n(n−1)/2 = 5 × 4 ÷ 2 = **10** adjacencies, and every topology change would be flooded by each router to each of the others. OSPF avoids this on multiaccess networks by electing a **Designated Router**. Every router forms a full adjacency with the DR and with a **Backup DR**, and with nobody else. With five routers that is one adjacency between the DR and BDR plus two for each of the three DROTHERs — **7** in total — and the saving grows quickly as routers are added. The DR acts as the segment's spokesperson: it receives updates from the others on 224.0.0.6, re-floods them to 224.0.0.5, and originates the **Type 2 network LSA** that describes the segment. The BDR listens to the same updates and keeps a synchronized database, so if the DR fails it can take over immediately without a new database exchange. The DR is a control-plane role only; it does not forward user traffic on behalf of the other routers.",
  },
  {
    kind: 'steps',
    title: 'DR/BDR election rules',
    steps: [
      { title: 'Highest **priority** wins', text: '`ip ospf priority` 0–255 per interface; default **1**' },
      { title: 'Tie → highest **router ID**', text: 'The RID — not the highest interface IP address' },
      { title: 'Priority **0** = never DR or BDR', text: 'Always a DROTHER on that segment' },
      { title: 'Election follows the wait timer', text: 'Wait = dead interval (40 s) on a segment with no DR yet' },
      { title: '**Non-preemptive**', text: 'A better router arriving later does not take over' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Eligible routers', sub: 'priority 1–255', shape: 'pill' },
        { id: 'b', label: 'Highest priority?', shape: 'diamond' },
        { id: 'c', label: 'Tie: highest RID', sub: 'router ID only' },
        { id: 'd', label: 'Best = DR', sub: 'second = BDR', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "The election compares two values in order. First the **OSPF priority** of the interface, set with `ip ospf priority` from 0 to 255; the default is **1**, so out of the box every router ties. The highest priority becomes DR and the second highest becomes BDR. Second, if priorities tie, the **highest router ID** wins — the router ID, not the highest interface IP address, a distinction exam options love to blur. A priority of **0** removes a router from the election completely: it can never be DR or BDR on that segment and always ends up a DROTHER. Priority is set per interface, so one router can be DR on one LAN and a DROTHER on another. Timing matters too. When an interface comes up on a segment where no DR exists yet, the router waits for the **wait timer**, equal to the dead interval of 40 seconds, listening for Hellos before it elects; that is why a new Ethernet adjacency takes noticeably longer than a point-to-point one. Finally, the election is **non-preemptive**: once a DR and BDR exist, they keep their roles when better routers appear.",
  },
  {
    kind: 'diagram',
    title: 'Election example: all routers boot together',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: '10.1.1.0/24', x: 5, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1 → DR', sub: 'pri 100 · RID 1.1.1.1', x: 2, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2 → DROTHER', sub: 'pri 1 · RID 2.2.2.2', x: 8, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3 → BDR', sub: 'pri 1 · RID 3.3.3.3', x: 2, y: 4 },
        { id: 'r4', icon: 'router', label: 'R4 → DROTHER', sub: 'pri 0 · RID 4.4.4.4', x: 8, y: 4, tone: 'muted' },
      ],
      links: [
        { from: 'r1', to: 'sw', fromLabel: '.1' },
        { from: 'r2', to: 'sw', fromLabel: '.2' },
        { from: 'r3', to: 'sw', fromLabel: '.3' },
        { from: 'r4', to: 'sw', fromLabel: '.4' },
      ],
    },
    caption: 'Strike out priority 0, sort by priority, then break ties with the router ID.',
    notes:
      "Apply the rules to this segment, assuming all four routers boot at the same moment. R4 has priority 0, so it is out of the running before any comparison starts, even though it has the highest router ID. R1 has priority 100, the highest of the remaining three, so R1 becomes the **DR** despite having the lowest router ID. R2 and R3 tie on the default priority of 1, so the router ID breaks the tie: 3.3.3.3 beats 2.2.2.2 and R3 becomes the **BDR**. R2 and R4 are **DROTHERs**. Notice how often intuition fails here: the router with the highest RID is a DROTHER, and the DR has the lowest RID. Exam questions of this type give you a table or topology of priorities and router IDs — answer by striking out priority-0 routers, then sorting by priority, then by RID. Remember that this result only holds if the routers start together; the next slide shows what changes when they do not. This same four-router LAN, 10.1.1.0/24 with each router using its number as the host address, appears in the show outputs for the rest of the deck.",
  },
  {
    kind: 'diagram',
    title: 'Non-preemptive: arrival order beats priority',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1 · RID 1.1.1.1 · pri 1', icon: 'router' },
        { id: 'r2', label: 'R2 · RID 2.2.2.2 · pri 1', icon: 'router' },
        { id: 'r3', label: 'R3 · RID 3.3.3.3 · pri 200', icon: 'router' },
      ],
      steps: [
        { note: 'R1 and R2 boot together with default priority 1' },
        { note: 'Wait timer expires: R2 = DR (higher RID), R1 = BDR', tone: 'accent' },
        { from: 'r3', to: 'r2', label: 'Hello: priority 200', sub: 'R3 joins the segment later' },
        { from: 'r2', to: 'r3', label: 'Hello: DR = R2, BDR = R1', sub: 'roles already taken → R3 stays DROTHER' },
        { note: 'R2 fails: its dead timer expires on R1 and R3', tone: 'bad' },
        { from: 'r1', to: 'r3', label: 'Hello: DR = R1, BDR = R3', sub: 'BDR promoted; only the BDR is re-elected', tone: 'good' },
      ],
    },
    caption: 'A better router that arrives late waits until the DR or BDR role becomes free.',
    notes:
      "In real networks routers rarely boot at the same instant, and because the election is **non-preemptive**, arrival order often matters more than priority. Follow the timeline. R1 and R2 come up together with the default priority of 1; after the wait timer, R2 wins DR on router ID and R1 becomes BDR. Later, R3 is connected with priority 200. Its Hellos arrive on a segment that already has a DR and BDR, so R3 accepts them and becomes a DROTHER — no re-election and no disruption. Now R2 fails. When R2's dead timer expires, the BDR, R1, is promoted to DR at once, and only the **BDR** role is re-elected among the remaining routers: R3, with priority 200, becomes BDR. If R2 comes back later, it too becomes a DROTHER. This stability is deliberate, because every change of DR forces the routers on the segment to rebuild adjacencies. The exam tells exactly this story — a better router joins later, then the DR fails — and asks who holds each role at the end.",
  },
  {
    kind: 'cli',
    title: 'Controlling the election with ip ospf priority',
    code: `R4(config)# interface GigabitEthernet0/0/0
R4(config-if)# ip ospf priority 0
R4(config-if)# end
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip ospf priority 100
R1(config-if)# end
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes
R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/0      1     0               10.1.1.1/24        1     DR    3/3`,
    highlight: ['ip ospf priority 0', 'ip ospf priority 100', 'DR    3/3'],
    caption: 'Priorities change nothing until OSPF is reset on the segment\'s routers.',
    notes:
      "To choose the DR deliberately, raise the priority on the router you want and set priority 0 on routers that should never hold the role, such as small branch routers. Priority is an **interface** command, so it only affects the segment connected to that interface. Here the engineer sets R4's LAN interface to priority 0 and R1's to 100. Because the election is non-preemptive, nothing changes yet: the current DR keeps its role. A new election happens only when the existing DR and BDR disappear, so the engineer resets OSPF with `clear ip ospf process` on all four routers during a maintenance window, and a fresh election runs with the new values. `show ip ospf interface brief` on R1 then shows state **DR** with **3/3** — three neighbors, all fully adjacent, exactly what a DR should see. A frequent exam distractor claims that changing the priority immediately triggers a new election; another claims that the maximum value of 255 forces preemption. Neither is true: only a reset or a failure moves the DR role. Priority 0 on R4 takes effect at the next election and keeps it out permanently.",
  },
  {
    kind: 'diagram',
    title: 'DROTHERs stop at 2-WAY with each other',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DR', x: 2.5, y: 1.2, tone: 'accent' },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'BDR', x: 7.5, y: 1.2 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'DROTHER', x: 2.5, y: 3.8 },
        { id: 'r4', icon: 'router', label: 'R4', sub: 'DROTHER', x: 7.5, y: 3.8 },
      ],
      links: [
        { from: 'r1', to: 'r3', label: 'FULL', tone: 'good' },
        { from: 'r1', to: 'r2', label: 'FULL', tone: 'good' },
        { from: 'r3', to: 'r4', label: 'FULL', tone: 'good' },
        { from: 'r1', to: 'r4', tone: 'good' },
        { from: 'r3', to: 'r2', tone: 'good' },
        { from: 'r2', to: 'r4', label: '2-WAY', style: 'dotted', tone: 'muted' },
      ],
    },
    caption: 'Logical view of one LAN: everyone is FULL with the DR and BDR; DROTHER pairs stay 2-WAY.',
    bullets: [
      'DR ↔ every router: **FULL**',
      'BDR ↔ every router: **FULL**',
      'DROTHER ↔ DROTHER: **2-WAY** — normal',
      'DROTHER updates → 224.0.0.6; DR re-floods → 224.0.0.5',
    ],
    notes:
      "On a multiaccess segment, the relationships form a pattern worth drawing from memory. The DR is **FULL** with every router, the BDR is **FULL** with every router, and each pair of DROTHERs stops at **2-WAY**. They have seen each other's Hellos and know the relationship is bidirectional, but they never exchange databases directly, because every update reaches them through the DR. This is not a fault. One classic exam trap shows `show ip ospf neighbor` on a DROTHER with a 2WAY/DROTHER entry and asks what is wrong — the answer is nothing. The multicast addresses follow the same logic. DROTHERs send their Link State Updates to **224.0.0.6**, which only the DR and BDR listen to. The DR then re-floods the update to **224.0.0.5**, reaching every OSPF router on the segment, and all Hellos use 224.0.0.5. This diagram is a logical view of the single Ethernet segment from the election example: R1 is the DR, R3 the BDR, and R2 and R4 the DROTHERs. The lines are relationships, not cables — physically, all four routers still connect to the same switch.",
  },
  {
    kind: 'cli',
    title: 'Reading show ip ospf neighbor on a LAN',
    code: `R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1         100   FULL/DR         00:00:36    10.1.1.1        GigabitEthernet0/0/0
3.3.3.3           1   FULL/BDR        00:00:32    10.1.1.3        GigabitEthernet0/0/0
4.4.4.4           0   2WAY/DROTHER    00:00:39    10.1.1.4        GigabitEthernet0/0/0
R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DROTHER    00:00:33    10.1.1.2        GigabitEthernet0/0/0
3.3.3.3           1   FULL/BDR        00:00:38    10.1.1.3        GigabitEthernet0/0/0
4.4.4.4           0   FULL/DROTHER    00:00:35    10.1.1.4        GigabitEthernet0/0/0`,
    highlight: ['2WAY/DROTHER', 'FULL/DR', 'FULL/BDR'],
    caption: 'The role after the slash is the neighbor\'s. Deduce your own role from what is missing.',
    notes:
      "Here is the same segment seen from two routers. On **R2**, a DROTHER, the DR 1.1.1.1 appears as FULL/DR with priority 100, the BDR 3.3.3.3 as FULL/BDR, and the other DROTHER, 4.4.4.4, as **2WAY/DROTHER** with priority 0. On **R1**, the DR, every neighbor is **FULL**: FULL/BDR for R3 and FULL/DROTHER for R2 and R4. The label after the slash is always the *neighbor's* role; you deduce the local router's role from what is missing. On R2 both the DR and the BDR are other routers, so R2 must be a DROTHER. On R1 no neighbor is the DR while one is the BDR, so R1 must be the DR. The Pri column lets you check the election: R1's 100 explains why it won with the lowest RID, and R4's 0 explains why it can never win. Exam exhibits frequently use a DROTHER's view like R2's and ask how many full adjacencies it has — two, one with the DR and one with the BDR — or which neighbor is 'having a problem', when in fact none is.",
  },
  {
    kind: 'cli',
    title: 'Roles and adjacency counts per interface',
    code: `R2# show ip ospf interface GigabitEthernet0/0/0 | include State|Designated|Neighbor Count|Adjacent
  Transmit Delay is 1 sec, State DROTHER, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 10.1.1.1
  Backup Designated router (ID) 3.3.3.3, Interface address 10.1.1.3
  Neighbor Count is 3, Adjacent neighbor count is 2
    Adjacent with neighbor 1.1.1.1  (Designated Router)
    Adjacent with neighbor 3.3.3.3  (Backup Designated Router)`,
    highlight: ['State DROTHER', 'Neighbor Count is 3, Adjacent neighbor count is 2'],
    caption: 'On a DROTHER, neighbors > adjacencies is normal. On a DR or BDR, the counts should match.',
    notes:
      "`show ip ospf interface` confirms the election from the interface's point of view; the filtered output keeps the relevant lines. **State DROTHER, Priority 1** gives R2's own role and priority. The next two lines name the DR and BDR by router ID and interface address: 1.1.1.1 at 10.1.1.1 and 3.3.3.3 at 10.1.1.3. The counters are the most useful part for troubleshooting. **Neighbor Count is 3** means R2 accepts Hellos from three routers — so their timers, area, subnet and authentication all match. **Adjacent neighbor count is 2** means only two of them are fully adjacent, and the next lines say which: the DR and the BDR. On a DROTHER, three neighbors with two adjacencies is perfectly normal. On a DR or BDR, the two counts should be equal; if a DR shows fewer adjacencies than neighbors, some pair is stuck before FULL, and the MTU is the first thing to check. The unfiltered command also displays the network type, cost, timers and passive status covered in the configuration lesson.",
  },
  {
    kind: 'compare',
    title: 'Broadcast vs point-to-point',
    left: {
      heading: 'Broadcast (Ethernet default)',
      bullets: [
        'DR/BDR elected — up to a 40 s wait',
        'DR originates a Type 2 network LSA',
        'Roles: FULL/DR, FULL/BDR, 2WAY/DROTHER',
        'Hello 10 s / dead 40 s',
        'Any number of routers on the segment',
      ],
    },
    right: {
      heading: 'Point-to-point',
      tone: 'accent',
      bullets: [
        '**No DR/BDR** — no election, no wait',
        'No Type 2 LSA; smaller LSDB',
        'Neighbor shown as **FULL/  -**; interface state P2P',
        'Hello 10 s / dead 40 s',
        'Exactly two routers; default on serial links',
      ],
    },
    notes:
      "When a link connects exactly two routers — the usual case for router-to-router Ethernet today — electing a DR adds nothing but delay and extra LSAs. The **point-to-point** network type removes the election entirely. There is no DR or BDR, so there is no wait: as soon as the routers see each other in 2-Way, they go straight to ExStart and on to Full. There is no Type 2 network LSA either, because each router simply lists the other as a point-to-point neighbor in its own router LSA, keeping the LSDB smaller and SPF simpler. In `show ip ospf neighbor` the role field shows a dash, **FULL/  -**, and `show ip ospf interface brief` shows the state **P2P**. Timers are the same as broadcast, 10 and 40 seconds. Point-to-point is the default on serial interfaces with HDLC or PPP encapsulation; on Ethernet it must be configured by hand. The trade-off is that the point-to-point type assumes only two OSPF routers exist on the link, so never use it on a shared LAN segment with three or more routers.",
  },
  {
    kind: 'cli',
    title: 'Point-to-point on an Ethernet link',
    code: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip ospf network point-to-point
R1(config-if)# end
R5(config)# interface GigabitEthernet0/0/0
R5(config-if)# ip ospf network point-to-point
R5(config-if)# end
R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/1      1     0               10.0.15.1/30       1     P2P   1/1
Gi0/0/0      1     0               10.1.1.1/24        1     DR    3/3
R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
5.5.5.5           0   FULL/  -        00:00:35    10.0.15.2       GigabitEthernet0/0/1
3.3.3.3           1   FULL/BDR        00:00:31    10.1.1.3        GigabitEthernet0/0/0
2.2.2.2           1   FULL/DROTHER    00:00:38    10.1.1.2        GigabitEthernet0/0/0
4.4.4.4           0   FULL/DROTHER    00:00:33    10.1.1.4        GigabitEthernet0/0/0`,
    highlight: ['ip ospf network point-to-point', 'P2P', 'FULL/  -'],
    caption: 'Configure both ends. The dash means no DR and no BDR on that link.',
    notes:
      "Converting an Ethernet link is one interface command, **`ip ospf network point-to-point`**, and it must be applied on **both** ends; a one-sided change creates a network type mismatch, covered later in this deck. Here R1's G0/0/1 connects to R5 over a /30. After both ends are changed, the adjacency re-forms quickly, without waiting for an election. The brief output shows the difference between R1's two interfaces: G0/0/1 in state **P2P** with one full neighbor, and the LAN interface G0/0/0 still in state **DR** with 3/3. The neighbor table shows the same contrast. R5, at 10.0.15.2, appears as **FULL/  -** with priority shown as 0, because priority is irrelevant on point-to-point links, while the LAN neighbors show FULL/BDR and FULL/DROTHER. On the exam, a dash in the role field means point-to-point: no DR, no BDR, no election, so a question asking which router is the DR on that link has the answer 'none'. Serial links produce the same output with no configuration at all, because point-to-point is their default network type.",
  },
  {
    kind: 'table',
    title: 'Adjacency requirements',
    columns: ['Requirement', 'If it is not met…', 'Typical symptom'],
    rows: [
      ['Same **subnet** (and **mask** on broadcast links)', 'Hellos rejected', 'Neighbor never listed'],
      ['Same **area ID**', 'Hellos rejected', 'Neighbor never listed'],
      ['Same **hello and dead** intervals', 'Hellos rejected', 'Neighbor never listed'],
      ['Same **authentication** settings', 'Packets rejected', 'Neighbor never listed'],
      ['Same **stub area** flag', 'Hellos rejected', 'Neighbor never listed'],
      ['Interface **not passive**', 'No Hellos sent', 'No neighbor on that link'],
      ['**Unique** router IDs', 'Duplicate detected', 'No adjacency; `DUP_RTRID` log'],
      ['Matching **IP MTU**', 'DBDs rejected', 'Stuck in **EXSTART/EXCHANGE**'],
      ['Compatible **network type**', 'Link described two ways', 'Can reach FULL, but routes missing'],
    ],
    caption: 'May differ: process ID, priority, interface cost, reference bandwidth.',
    notes:
      "Before two routers become OSPF neighbors, their Hellos must agree on several parameters, and a few more checks follow later. Anything carried in the Hello must match: the **area ID**, the **hello and dead intervals**, the **authentication** type and key, the **stub area flag**, and — on broadcast networks — the **subnet mask**; the two interfaces must also be in the same subnet. If any of these differ, the Hello is discarded and the neighbor never appears in the table. **Router IDs** must be different; a duplicate is detected and logged, and no adjacency forms. The **MTU** is checked later, in DBD packets, so an MTU mismatch lets the neighbor appear but traps it in EXSTART or EXCHANGE. The **network type** is not in the Hello at all, which is why a broadcast/point-to-point mismatch can reach FULL and still break routing. And of course the interface must not be **passive**. Parameters that may differ without harm: process ID, priority, interface cost and reference bandwidth. Rebuild this table from memory — it is the single most useful OSPF troubleshooting tool you can carry into the exam.",
  },
  {
    kind: 'table',
    title: 'Reading the symptom',
    columns: ['What you see', 'Most likely cause', 'Confirm with'],
    rows: [
      ['Neighbor **not listed**', 'Passive interface; subnet, area, timer or auth mismatch; ACL', '`show ip ospf interface`, `show ip protocols`'],
      ['Stuck in **INIT**', 'Hellos arrive in one direction only (e.g. inbound ACL on the far side)', '`show ip interface` (ACLs) on both routers'],
      ['Stuck in **EXSTART/EXCHANGE**', '**MTU mismatch**', '`show ip interface` MTU on both ends'],
      ['**2WAY/DROTHER**', 'Normal between DROTHERs; a fault only if no router is DR (all priority 0)', '`show ip ospf interface` DR/BDR lines'],
      ['**FULL**, routes missing', 'Network type mismatch, or subnet not advertised', '`show ip ospf interface` network type'],
      ['`DUP_RTRID` log message', 'Two routers share a router ID', '`show ip protocols` on both routers'],
    ],
    notes:
      "Troubleshooting becomes fast when you let the neighbor state tell you where to look. If the neighbor is **not listed at all**, Hellos are not getting through or are being rejected: check that the interface is enabled for OSPF and not passive, then compare subnet, mask, area, timers and authentication on both ends, and look for ACLs. If the neighbor is stuck in **INIT**, Hellos are arriving in one direction only — typically an inbound ACL on the far router dropping OSPF — so the far router never lists your router ID. **EXSTART or EXCHANGE** that never progresses points to an **MTU mismatch**. **2WAY/DROTHER** is normal between DROTHERs; it becomes a problem only if nobody reaches FULL, which happens when every router on the segment has priority 0 and no DR exists. **FULL with routes missing** suggests a network type mismatch or a subnet that is simply not advertised. Finally, a duplicate router ID announces itself in the log. Match the symptom first, then confirm with the command in the last column — that is exactly how the exam's troubleshooting items are built.",
  },
  {
    kind: 'cli',
    title: 'Mismatch 1: hello and dead timers',
    code: `R1# show ip ospf interface GigabitEthernet0/0/0 | include Timer
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
R2# show ip ospf interface GigabitEthernet0/0/0 | include Timer
  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5
R2# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# no ip ospf hello-interval
R2(config-if)# no ip ospf dead-interval
R2(config-if)# end
*Sep 26 11:20:44.512: %OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/0/0 from LOADING to FULL, Loading Done`,
    highlight: ['Hello 10, Dead 40', 'Hello 5, Dead 20', 'LOADING to FULL'],
    caption: 'Timers are never negotiated: different values simply block the neighbor.',
    notes:
      "Mismatched timers are the most common reason a neighbor never appears. The filtered output shows R1 using the defaults, hello 10 and dead 40, while R2 has hello 5 and dead 20 — someone configured `ip ospf hello-interval 5` on R2, and IOS moved the dead interval to four times the new hello automatically. Because both values are carried in every Hello, each router discards the other's Hellos, and neither lists the other as a neighbor. `debug ip ospf hello` would reveal the mismatched parameters, but comparing `show ip ospf interface` on both ends is faster and safer on a production router. The fix is to make the values identical on both ends, either by applying the same custom timers to R1 or, as here, by removing the custom settings from R2 with the `no` forms of the commands. Within seconds the adjacency comes up and IOS logs the change to FULL. A common distractor suggests that only the dead interval matters, or that a router adapts to its neighbor's timers. OSPF never negotiates timers: mismatched values simply block the neighbor relationship.",
  },
  {
    kind: 'cli',
    title: 'Mismatch 2: MTU leaves the neighbor in EXSTART',
    code: `R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   EXSTART/BDR     00:00:37    10.0.12.1       GigabitEthernet0/0/0
R2# show ip interface GigabitEthernet0/0/0 | include MTU
  MTU is 1400 bytes
R1# show ip interface GigabitEthernet0/0/0 | include MTU
  MTU is 1500 bytes
R2# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# no ip mtu
R2(config-if)# end`,
    highlight: ['EXSTART/BDR', 'MTU is 1400 bytes', 'MTU is 1500 bytes'],
    caption: 'Hellos do not carry the MTU; DBD packets do — so the failure appears after 2-Way.',
    notes:
      "An MTU mismatch produces a completely different symptom. Hellos do not carry the MTU, so the routers discover each other, pass through Init and 2-Way, and even elect a DR and BDR. The MTU is carried in the **Database Description** packets exchanged in ExStart and Exchange, and a router rejects DBDs that advertise an MTU larger than its own. The adjacency therefore stalls: one or both routers stay in **EXSTART** or **EXCHANGE**, retrying, and may eventually drop back and start over. In the exhibit, R2 shows neighbor 1.1.1.1 stuck in EXSTART/BDR, and comparing the IP MTU of both interfaces finds the culprit: 1400 bytes on R2 against 1500 on R1. The correct fix is to make the MTUs match — here by removing the `ip mtu 1400` setting from R2 with `no ip mtu`. IOS also offers `ip ospf mtu-ignore`, which skips the check, but that only hides the difference; large packets can still be dropped on the link. On the exam, EXSTART or EXCHANGE in a neighbor table is the signature of an MTU problem.",
  },
  {
    kind: 'cli',
    title: 'Mismatch 3: duplicate router IDs',
    code: `*Sep 26 11:02:15.321: %OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 1.1.1.1 from 10.0.12.1 on interface GigabitEthernet0/0/0
R2# show ip protocols | include Router ID
  Router ID 1.1.1.1
R1# show ip protocols | include Router ID
  Router ID 1.1.1.1
R2# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect
R2(config-router)# end
R2# clear ip ospf process
Reset ALL OSPF processes? [no]: yes`,
    highlight: ['DUP_RTRID_NBR', 'Router ID 1.1.1.1', 'router-id 2.2.2.2'],
    caption: 'A copied configuration is the usual cause. Fix the ID, then reset the process.',
    notes:
      "Router IDs must be unique, because they identify the originator of every LSA. When two directly connected routers share a router ID, IOS detects it from the Hello and logs **%OSPF-4-DUP_RTRID_NBR**, naming the duplicate ID, the neighbor's address and the local interface, and the adjacency does not form. This often happens when a configuration is copied from one router to another, `router-id` line included. `show ip protocols` on both routers confirms the clash. The fix is to configure a unique router ID on one of them and then — because the process is already running — reset it with `clear ip ospf process`, exactly as the IOS reminder says. Duplicate IDs between routers that are *not* neighbors are sneakier: both originate LSAs with the same advertising router, each keeps replacing the other's LSA, and the result is unstable routing rather than a missing neighbor. Either way the lesson is the same: configure unique router IDs manually on every router, and check them first whenever a configuration has been cloned from another device.",
  },
  {
    kind: 'bullets',
    title: 'Mismatch 4: network type',
    bullets: [
      'R1: `ip ospf network point-to-point` · R2: default broadcast',
      'Both use 10/40 → Hellos accepted, adjacency can reach **FULL**',
      'R1 describes a p2p link; R2 expects a DR and a Type 2 LSA',
      '==SPF cannot match the two descriptions → routes missing==',
      'Broadcast vs NBMA or P2MP: timers differ → no neighbor',
      'Fix: the same network type on both ends',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'POINT_TO_POINT', x: 2, y: 1.5 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'BROADCAST', x: 8, y: 1.5 },
      ],
      links: [{ from: 'r1', to: 'r2', label: 'FULL — but no routes', tone: 'warn', fromLabel: 'G0/0/0', toLabel: 'G0/0/0' }],
    },
    notes:
      "The network type is not carried in Hellos, so a mismatch between broadcast and point-to-point does not stop the Hellos: both use a 10-second hello and a 40-second dead interval, so each router accepts the other and the adjacency can even reach **FULL**. The damage appears in the LSDB. R1, configured as point-to-point, describes the link in its router LSA as a point-to-point connection to R2. R2, still broadcast, describes the same link as a transit network that should have a DR and a Type 2 network LSA. When SPF runs, it checks that every link is described consistently from both ends; these descriptions do not match, so routes through the link are **missing** even though the neighbor table looks healthy. Mismatches between broadcast or point-to-point and the older NBMA or point-to-multipoint types behave differently: their default timers differ (10/40 versus 30/120), so the Hellos are rejected and no neighbor appears at all. In both cases the fix is the same — configure the same network type on both ends of the link, and verify it in `show ip ospf interface`.",
  },
  {
    kind: 'steps',
    title: 'A repeatable troubleshooting method',
    steps: [
      { title: '`show ip ospf neighbor`', text: 'Listed? Which state? Let the state point to the fault' },
      { title: '`show ip ospf interface brief`', text: 'Right interface, right area, neighbor counts' },
      { title: '`show ip ospf interface <int>`', text: 'Timers, network type, DR/BDR, passive' },
      { title: '`show ip protocols` + `show ip interface`', text: 'RID, networks, passive list; mask, MTU, ACLs' },
      { title: 'Fix one thing, re-verify', text: 'Wait for `%OSPF-5-ADJCHG` … to FULL, then check routes' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Neighbor state', shape: 'pill' },
        { id: 'b', label: 'OSPF interface' },
        { id: 'c', label: 'Compare both ends' },
        { id: 'd', label: 'FULL + routes', shape: 'round', tone: 'good' },
      ],
    },
    notes:
      "A consistent method beats guessing, on the job and in exam simulations. Start with **show ip ospf neighbor**, because the state points you toward the fault. Next, **show ip ospf interface brief** confirms that OSPF is running on the expected interface, in the expected area, and shows how many neighbors are fully adjacent. The detailed **show ip ospf interface** exposes timers, network type, DR and BDR, and whether the interface is passive. **show ip protocols** reveals the router ID, network statements and passive list, while **show ip interface** shows the address, mask, MTU and any ACLs applied. Compare the outputs from **both** routers — many faults, such as timer or MTU mismatches, are invisible from one side alone. Then change one thing at a time and re-verify, watching for the `%OSPF-5-ADJCHG` message that reports the neighbor moving to FULL. Finally, confirm the result where it matters: the routes in `show ip route ospf`. A neighbor at FULL together with the expected routes is the only real proof that the problem is solved.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: network types and adjacencies',
    body: 'Election and adjacency questions reward careful reading of every value in the exhibit.',
    bullets: [
      'Default priority **1**; range 0–255; **0 = never** DR/BDR',
      'Priority first, then highest **router ID** — never interface IP',
      '**Non-preemptive**: a late, better router stays DROTHER',
      'DR fails → BDR promoted; only the BDR is re-elected',
      '2WAY/DROTHER is **normal**; FULL/  - means point-to-point',
      'Not listed = Hello mismatch · INIT = one-way · EXSTART = **MTU**',
      'FULL but no routes → network type mismatch',
    ],
    notes:
      "These are the traps Cisco uses most often with network types and elections. Priority questions test the default of 1, the range 0 to 255, and the special meaning of 0. Election questions hide a higher router ID on a router with lower priority, or a higher interface IP on a router whose RID was set manually — always compare priority first, then RID. Timeline questions test non-preemption: a better router that arrives late stays a DROTHER until the DR or BDR fails, and when the DR fails only the BDR is promoted, with a new BDR elected. Neighbor-table questions test the meaning of 2WAY/DROTHER, which is normal, and FULL/ with a dash, which means point-to-point with no DR. Troubleshooting questions pair a symptom with a cause: not listed means a Hello mismatch or a passive interface, INIT means one-way Hellos, EXSTART or EXCHANGE means MTU, FULL without routes means a network type mismatch, and a DUP_RTRID log means a duplicate router ID. And one more time: the OSPF process ID never has to match.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Ethernet = broadcast (DR/BDR); serial = point-to-point (no DR)',
      'Election: highest priority (default 1, 0 = never), then highest RID',
      'Non-preemptive; the BDR is promoted when the DR fails',
      'DROTHERs: FULL with DR/BDR, 2-WAY with each other',
      '`ip ospf network point-to-point` on both ends → FULL/ -',
      'Must match: subnet/mask, area, timers, auth, stub flag, MTU',
      'INIT = one-way · EXSTART = MTU · FULL, no routes = network type',
    ],
    notes:
      "Network types decide whether OSPF elects a designated router. Ethernet defaults to broadcast, where a DR and BDR reduce the number of adjacencies and the DR originates the Type 2 network LSA; serial HDLC and PPP links default to point-to-point, where there is no election, no wait and no network LSA, and Ethernet links between two routers can be converted with `ip ospf network point-to-point` on both ends. The election chooses the highest interface priority, default 1, with priority 0 opting out, and breaks ties with the highest router ID. It is non-preemptive, so arrival order often decides the result, and when the DR fails the BDR is promoted and a new BDR is elected. DROTHERs are FULL with the DR and BDR and remain in 2-WAY with each other by design. Adjacencies require matching subnet and mask, area, timers, authentication, stub flag and MTU, compatible network types, unique router IDs and non-passive interfaces. Finally, read the neighbor state as a diagnosis: not listed, INIT, EXSTART or FULL-without-routes each point to a different fault.",
  },
];

export default slides;
