import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'OSPF Concepts',
    subtitle: 'How a link-state protocol maps the network and picks the cheapest path',
    notes:
      "Open Shortest Path First is the interior routing protocol you are most likely to meet in an enterprise network, and it is the only dynamic routing protocol the CCNA asks you to configure and verify in depth. This deck builds the mental model you need before you touch a single command. You will learn how link-state routing differs from distance vector, what **LSAs** and the **link-state database** are, how Dijkstra's **SPF** algorithm turns that database into routes, and why OSPF networks are divided into **areas** around a backbone area 0. Then we zoom in on the three details the exam tests relentlessly: how a router picks its **router ID**, how two routers climb through the **neighbor states** from Down to Full, and how OSPF calculates **cost** from the reference bandwidth. The next two lessons build on this foundation with configuration, verification, DR/BDR elections and adjacency troubleshooting, so make every term on these slides feel familiar. Everything here is OSPFv2 for IPv4 and applies to both the v1.1 and v2.0 exam blueprints.",
  },
  {
    kind: 'bullets',
    title: 'IGP vs EGP',
    bullets: [
      '**IGP**: routes *inside* one autonomous system (AS)',
      { text: 'Examples: **OSPF**, EIGRP, RIP, IS-IS', sub: ['Metric-driven, fast convergence'] },
      '**EGP**: routes *between* autonomous systems',
      { text: 'The only EGP in use today: **BGP**', sub: ['Policy-driven; carries Internet routes'] },
      '==OSPF is an open-standard link-state IGP==',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.3, y: 2 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'border', x: 3.6, y: 2 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'border', x: 6.4, y: 2 },
        { id: 'r4', icon: 'router', label: 'R4', x: 8.7, y: 2 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'OSPF' },
        { from: 'r2', to: 'r3', label: 'BGP', tone: 'accent' },
        { from: 'r3', to: 'r4', label: 'OSPF' },
      ],
      groups: [
        { label: 'AS 65001', x: 0.3, y: 0.4, w: 4.3, h: 3.2 },
        { label: 'AS 65002', x: 5.4, y: 0.4, w: 4.3, h: 3.2 },
      ],
    },
    notes:
      "An **autonomous system** is a set of networks under one administrative control — a company, a university or a service provider. Protocols that route *within* an AS are **Interior Gateway Protocols**: OSPF, EIGRP, RIP and IS-IS. Their job is to find the best path quickly and reconverge fast when a link fails, using a technical metric such as cost or hop count. Protocols that route *between* autonomous systems are **Exterior Gateway Protocols**, and today that means **BGP** alone. BGP cares less about the fastest path and more about business policy: which provider to prefer and which prefixes to announce. In the diagram each organisation runs OSPF internally, and the two border routers speak BGP to each other. For the CCNA you configure OSPF in depth, while BGP only needs to be recognised as the EGP. A common distractor calls OSPF an EGP or a distance vector protocol; it is neither. OSPF is an **open standard** (RFC 2328 for OSPFv2), so it runs on routers from any vendor, unlike EIGRP, which was historically Cisco-proprietary.",
  },
  {
    kind: 'compare',
    title: 'Distance vector vs link state',
    left: {
      heading: 'Distance vector (e.g. RIP)',
      bullets: [
        'Learns routes **from neighbors** — "routing by rumor"',
        'Knows only distance and direction',
        'Periodic full-table updates (RIP: every 30 s)',
        'Needs loop-prevention rules; slower convergence',
        'RIP metric: hop count (15 max)',
      ],
    },
    right: {
      heading: 'Link state (e.g. OSPF)',
      tone: 'accent',
      bullets: [
        'Every router learns the **whole area topology**',
        'Floods **LSAs** describing its own links',
        'Each router runs **SPF** on an identical LSDB',
        'Event-driven updates plus a 30-minute refresh',
        'OSPF metric: **cost**, based on bandwidth',
      ],
    },
    notes:
      "The two families differ in *what* a router knows. A **distance vector** router only knows, for each destination, a distance (the metric) and a vector (the neighbor to send to). It learns this from neighbors, who learned it from their neighbors, which is why it is nicknamed routing by rumor. RIP sends its whole table every 30 seconds and relies on split horizon, route poisoning and hold-down timers to avoid loops. A **link-state** router instead collects a description of every router and link in its area. Each router describes only its own links in **link-state advertisements**, floods them, and every router in the area ends up with the same database. Each router then independently runs Dijkstra's shortest path first algorithm with itself as the root. The result is fast, loop-free convergence at the cost of more memory and CPU. Updates are event-driven, and each LSA is also refreshed every 30 minutes. EIGRP is described as an *advanced distance vector* protocol — it is not link state, a distinction the exam likes to test.",
  },
  {
    kind: 'table',
    title: 'OSPF at a glance',
    columns: ['Property', 'OSPFv2 value'],
    rows: [
      ['Type', 'Link-state **IGP**, open standard (RFC 2328)'],
      ['Transport', 'Directly over IP — **protocol number 89** (no TCP/UDP)'],
      ['Administrative distance', '**110**'],
      ['Metric', '**Cost** = reference bandwidth ÷ interface bandwidth'],
      ['Multicast groups', '`224.0.0.5` all OSPF routers · `224.0.0.6` DR/BDR'],
      ['Addressing', 'Classless (VLSM); summarization only at ABRs/ASBRs'],
      ['IPv6 counterpart', 'OSPFv3 (RFC 5340)'],
    ],
    notes:
      "Commit this table to memory — every row is fair game on the exam. OSPF does not use TCP or UDP; its packets sit directly inside IP with **protocol number 89**, so an ACL that must allow OSPF uses `permit ospf` rather than a port number. Its **administrative distance** is 110, which is why a prefix learned from both OSPF (110) and EIGRP (90) is installed from EIGRP, while a static route (AD 1) beats both. The metric is **cost**, derived from interface bandwidth, so higher-bandwidth links are preferred. OSPF sends most packets to the multicast group **224.0.0.5**, which every OSPF router listens to, and on multiaccess segments some packets go to **224.0.0.6**, which only the DR and BDR listen to. OSPF is classless: the mask travels with every route, so VLSM works naturally, but it can summarize only at area and domain boundaries. OSPFv2 carries IPv4 routes; OSPFv3 is the separate version for IPv6. If an answer option offers a port number for OSPF, it is a trap.",
  },
  {
    kind: 'bullets',
    title: 'Three tables, one process',
    bullets: [
      '**Neighbor table** — routers heard via Hellos (`show ip ospf neighbor`)',
      '**LSDB** (topology table) — every LSA in the area (`show ip ospf database`)',
      '**Routing table** — best paths from SPF (`show ip route ospf`)',
      '==Same area → identical LSDB on every router==',
      'SPF result differs per router: each is its own root',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'h', label: 'Hello packets', sub: 'discover neighbors', shape: 'pill' },
        { id: 'n', label: 'Neighbor table', sub: 'who is adjacent' },
        { id: 'l', label: 'LSDB', sub: 'flooded LSAs' },
        { id: 's', label: 'Dijkstra SPF', sub: 'shortest-path tree' },
        { id: 'r', label: 'Routing table', sub: 'O routes, AD 110', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "OSPF keeps three separate data structures, and knowing which show command displays each one is a common exam item. First, **Hello** packets discover neighbors and populate the **neighbor table**; `show ip ospf neighbor` lists them with their state. Second, adjacent neighbors exchange LSAs until each router holds a complete **link-state database**, sometimes called the topology table; `show ip ospf database` displays it. Every router in the same area must end up with an *identical* LSDB — that is the whole point of flooding. Third, each router runs the **SPF** algorithm on that database, placing itself at the root of a shortest-path tree, and installs the best route to every subnet in the **routing table**, where OSPF routes appear with the code `O` and `[110/cost]`. Notice the separation of duties: the LSDB is shared knowledge, but the SPF result is personal, because every router calculates paths from its own position. When a link changes, new LSAs are flooded, the LSDB changes and SPF runs again.",
  },
  {
    kind: 'table',
    title: 'LSAs: the building blocks',
    columns: ['LSA', 'Originated by', 'Describes', 'Flooding scope'],
    rows: [
      ['**Type 1** Router', 'Every OSPF router', 'Its own links, their costs and its neighbors', 'Within its area'],
      ['**Type 2** Network', 'The **DR** of a multiaccess segment', 'The segment and every router attached to it', 'Within its area'],
      ['Type 3 Summary', 'ABR', 'Networks located in another area', 'Into the other area(s)'],
      ['Type 5 External', 'ASBR', 'Routes injected from outside OSPF', 'All normal areas'],
    ],
    caption: 'A single-area network without external routes holds only Type 1 and Type 2 LSAs.',
    notes:
      "A **link-state advertisement** is a small record that describes one piece of the topology. For the CCNA you must know two types in depth. Every OSPF router originates exactly one **Type 1 Router LSA** per area it belongs to, listing each of its OSPF-enabled links, the cost of each link and the neighbors on it. The **Type 2 Network LSA** exists only on multiaccess segments such as Ethernet that have elected a **Designated Router**: the DR originates it on behalf of the segment, listing the subnet mask and every router attached to that segment. Both types stay inside their area. LSAs are stored in the **LSDB**, each identified by its type, link-state ID and advertising router, with a sequence number that increases every time the originator updates it, so routers always keep the newest copy. The originator refreshes each LSA every 30 minutes, and an LSA that reaches the maximum age of one hour is flushed. Types 3 and 5 appear only with multiple areas or external routes: recognise them, but do not over-study them.",
  },
  {
    kind: 'diagram',
    title: 'Flooding to 224.0.0.5 and 224.0.0.6',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DR', x: 2, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'BDR', x: 8, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'DROTHER', x: 2, y: 4 },
        { id: 'r4', icon: 'router', label: 'R4', sub: 'DROTHER', x: 8, y: 4 },
      ],
      links: [
        { from: 'r3', to: 'sw', label: '1 · LSU to 224.0.0.6', arrow: 'forward', tone: 'accent' },
        { from: 'r1', to: 'sw', label: '2 · re-flood to 224.0.0.5', arrow: 'forward', tone: 'accent' },
        { from: 'r2', to: 'sw' },
        { from: 'r4', to: 'sw' },
      ],
    },
    caption: 'DROTHERs send updates to 224.0.0.6; the DR re-floods them to 224.0.0.5.',
    bullets: [
      '`224.0.0.5` AllSPFRouters — Hellos and DR re-floods',
      '`224.0.0.6` AllDRouters — updates sent *to* the DR/BDR',
      'Point-to-point links: everything goes to 224.0.0.5',
    ],
    notes:
      "Flooding is how every router in the area learns about a change. On a point-to-point link there are only two routers, so each simply sends its OSPF packets to **224.0.0.5**, the *AllSPFRouters* group that every OSPF interface listens to. On a multiaccess segment like Ethernet, having every router flood to every other router would create a burst of duplicate updates, so OSPF elects a **Designated Router** (DR) and a **Backup DR** (BDR). A router that is neither — a **DROTHER** — sends its Link State Update to **224.0.0.6**, the *AllDRouters* group, which only the DR and BDR listen to. The DR then re-floods that update to 224.0.0.5 so every router on the segment receives it once, and the receivers acknowledge it. Hellos always go to 224.0.0.5. On the exam, match the address to its audience: .5 means all OSPF routers, .6 means only the DR and BDR. The DR/BDR election itself is covered in the network types lesson.",
  },
  {
    kind: 'diagram',
    title: 'Dijkstra SPF: the shortest-path tree',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'SPF root', x: 1.2, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 4.2, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', x: 4.2, y: 4 },
        { id: 'r4', icon: 'router', label: 'R4', x: 7, y: 2.5 },
        { id: 'lan', icon: 'switch', label: '10.4.4.0/24', x: 9.1, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'cost 10', tone: 'good' },
        { from: 'r2', to: 'r4', label: 'cost 10', tone: 'good' },
        { from: 'r1', to: 'r3', label: 'cost 5', tone: 'muted' },
        { from: 'r3', to: 'r4', label: 'cost 20', tone: 'muted' },
        { from: 'r4', to: 'lan', label: 'cost 1', tone: 'good' },
      ],
    },
    caption: 'Via R2: 10 + 10 + 1 = 21. Via R3: 5 + 20 + 1 = 26. The lowest total cost wins.',
    notes:
      "Once the LSDB is complete, each router runs **Dijkstra's Shortest Path First** algorithm. SPF places the calculating router at the root and grows a tree outward, always adding the closest not-yet-reached node next, until every router and subnet in the area hangs off exactly one best branch — the **shortest-path tree**. The cost of a route is the sum of the costs of the *outgoing* interfaces along the path, including the interface on the last router that connects to the destination subnet. In the diagram, R1 can reach 10.4.4.0/24 via R2 for 10 + 10 + 1 = **21** or via R3 for 5 + 20 + 1 = **26**, so it installs the path via R2 with metric 21. If the two totals were equal, OSPF would install both paths and load-balance across them (equal-cost multipath, up to four paths by default on IOS). Because every router runs SPF from its own root, R3 computes a completely different tree from the very same database. A change to any Type 1 or Type 2 LSA in the area triggers a new SPF run, one reason large networks are split into areas.",
  },
  {
    kind: 'diagram',
    title: 'Areas and router roles',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'Backbone', x: 5, y: 1.2 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'ABR', x: 3.4, y: 2.8, tone: 'accent' },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'ABR', x: 6.6, y: 2.8, tone: 'accent' },
        { id: 'r4', icon: 'router', label: 'R4', sub: 'Internal', x: 1.4, y: 4.1 },
        { id: 'r5', icon: 'router', label: 'R5', sub: 'ASBR', x: 8.4, y: 4 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 8.9, y: 1.2 },
      ],
      links: [
        { from: 'r1', to: 'r2' },
        { from: 'r1', to: 'r3' },
        { from: 'r2', to: 'r4' },
        { from: 'r3', to: 'r5' },
        { from: 'r5', to: 'net', style: 'dashed', label: 'external' },
      ],
      groups: [
        { label: 'Area 0 (backbone)', x: 2.6, y: 0.3, w: 4.8, h: 2.4, tone: 'accent' },
        { label: 'Area 1', x: 0.2, y: 2.9, w: 4.6, h: 1.9 },
        { label: 'Area 2', x: 5.2, y: 2.9, w: 4.6, h: 1.9 },
      ],
    },
    bullets: [
      '**Internal**: all OSPF interfaces in one area',
      '**Backbone**: at least one interface in area 0',
      '**ABR**: interfaces in area 0 *and* another area',
      '**ASBR**: injects external routes into OSPF',
    ],
    notes:
      "An **area** is a group of routers and links that share the same LSDB. Every multi-area design has a **backbone area 0**, and every other area must connect to it — traffic between two non-backbone areas always crosses area 0. Router roles follow from where the interfaces sit. An **internal router** has all of its OSPF interfaces in a single area. A **backbone router** has at least one interface in area 0. An **Area Border Router** (ABR) has interfaces in area 0 and at least one other area, keeps a separate LSDB for each area, and advertises summary information between them. An **Autonomous System Boundary Router** (ASBR) injects routes from outside OSPF, such as a default route toward the Internet or redistributed static routes. The roles overlap: in the diagram R2 and R3 are both ABRs and backbone routers, and R1 is both an internal router and a backbone router. Exam questions often describe a router's interfaces and ask for its role, so read which areas each interface belongs to before answering.",
  },
  {
    kind: 'bullets',
    title: 'Why areas, and why single-area on the CCNA',
    bullets: [
      'Smaller LSDB per router → less memory',
      'A topology change reruns SPF **only inside its area**',
      'ABRs can summarize routes between areas',
      { text: 'CCNA configures **single-area OSPFv2**', sub: ['Usually area 0: one LSDB shared by all routers'] },
      'Multi-area: know the terms and roles, not the design',
      'Area 0 can also be written as 0.0.0.0',
    ],
    notes:
      "Why not put every router in one giant area? Because link-state protocols scale with the size of the LSDB. Every router in an area stores every Type 1 and Type 2 LSA in that area and reruns SPF whenever any of them changes, so a flapping link in one corner of a very large area costs CPU everywhere. Splitting the network into areas contains that churn: routers see full detail for their own area, but only summary information (Type 3 LSAs) about other areas, and an ABR can summarize a range of subnets into a single route. The CCNA exam topics say **single-area OSPFv2**, and that is what you configure in labs: every interface in the same area, usually area 0, so every router is an internal backbone router with an identical LSDB. You should still recognise the multi-area vocabulary — area 0, ABR, ASBR, internal and backbone routers — because it appears in questions and in `show` output. The area ID is a 32-bit number that IOS accepts in decimal or dotted-decimal form, so `area 0` and `area 0.0.0.0` are the same backbone.",
  },
  {
    kind: 'steps',
    title: 'Router ID selection',
    steps: [
      { title: 'Manually configured `router-id`', text: 'Set under `router ospf` — always wins, need not match an interface' },
      { title: 'Highest loopback IPv4 address', text: 'Loopback must be up; it does not need to run OSPF' },
      { title: 'Highest active interface IPv4 address', text: 'Used only when no loopback exists' },
      { title: 'Chosen once, when the process starts', text: 'Changes need `clear ip ospf process` or a reload' },
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'd1', label: 'router-id set?', shape: 'diamond', x: 1.8, y: 1.3 },
        { id: 'd2', label: 'Loopback up?', shape: 'diamond', x: 5, y: 1.3 },
        { id: 'p', label: 'Highest active interface IP', shape: 'round', x: 8.2, y: 1.3 },
        { id: 'a1', label: 'Use configured RID', shape: 'round', x: 1.8, y: 3.8, tone: 'accent' },
        { id: 'a2', label: 'Highest loopback IP', shape: 'round', x: 5, y: 3.8 },
      ],
      edges: [
        { from: 'd1', to: 'a1', label: 'yes' },
        { from: 'd1', to: 'd2', label: 'no' },
        { from: 'd2', to: 'a2', label: 'yes' },
        { from: 'd2', to: 'p', label: 'no' },
      ],
    },
    notes:
      "Every OSPF router needs a unique **router ID** (RID): a 32-bit value written like an IPv4 address that names the router in every LSA it originates and in its neighbors' tables. IOS chooses it in strict order. First, a value set with the `router-id` command under the OSPF process always wins, and it does not even need to match an address on the router. Second, if there is none, OSPF uses the **highest IPv4 address on any loopback** interface that is up. Third, if there are no loopbacks, it uses the **highest IPv4 address on an active physical interface**. The interface chosen does *not* have to be enabled for OSPF, and 'highest' is compared numerically, so 10.10.10.1 beats 10.9.200.1. The RID is chosen when the process starts and then stays put: adding a higher loopback later does not change it until the process is reset with `clear ip ospf process` or the router reloads. Loopbacks and manual IDs are best practice precisely because they keep the RID stable and predictable. If no RID can be found at all, the OSPF process cannot start.",
  },
  {
    kind: 'cli',
    title: 'Setting and verifying the router ID',
    code: `R1(config)# interface Loopback0
R1(config-if)# ip address 10.255.255.1 255.255.255.255
R1(config-if)# router ospf 1
R1(config-router)# router-id 1.1.1.1
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect
R1(config-router)# end
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes
R1# show ip protocols | include Router ID
  Router ID 1.1.1.1`,
    highlight: ['router-id 1.1.1.1', 'clear ip ospf process', 'Router ID 1.1.1.1'],
    caption: 'The manual RID beats the loopback, but only after the process is reset.',
    notes:
      "This transcript shows the classic sequence. R1 already runs OSPF process 1, and the engineer adds a loopback and then sets `router-id 1.1.1.1`. Because the process is already running, IOS accepts the command but warns that it will not take effect until a reload or `clear ip ospf process`. Clearing the process tears down every OSPF adjacency on the router and rebuilds them, so in production you schedule it — the prompt defaults to *no* for a reason. After the reset, `show ip protocols` confirms the new RID. Other places to see the RID: the first line of `show ip ospf` (Routing Process \"ospf 1\" with ID 1.1.1.1), the header of `show ip ospf database`, and the Neighbor ID column that *other* routers display in `show ip ospf neighbor`. On the exam, if a question says a router ID was configured but the output still shows the old value, the missing step is the process reset. Also remember that two routers with the **same RID** cannot form a working adjacency, which is another reason unique, manually assigned RIDs are best practice.",
  },
  {
    kind: 'diagram',
    title: 'Inside the Hello packet',
    diagram: {
      type: 'header',
      bitsPerRow: 32,
      fields: [
        { label: 'Router ID', size: 32, sub: 'OSPF header — sender', tone: 'accent' },
        { label: 'Area ID', size: 32, sub: 'OSPF header — must match', tone: 'accent' },
        { label: 'Network Mask', size: 32, sub: 'must match on broadcast links' },
        { label: 'Hello Interval', size: 16, sub: 'must match' },
        { label: 'Options', size: 8, sub: 'stub flag' },
        { label: 'Rtr Priority', size: 8, sub: 'DR election' },
        { label: 'Router Dead Interval', size: 32, sub: 'must match' },
        { label: 'Designated Router', size: 32, sub: 'DR interface IP' },
        { label: 'Backup Designated Router', size: 32, sub: 'BDR interface IP' },
        { label: 'Neighbor', size: 32, sub: 'one RID per neighbor heard', tone: 'muted' },
      ],
      caption: 'Router ID and Area ID come from the common OSPF header; the rest is the Hello body.',
    },
    bullets: [
      '==Must match==: area, hello/dead timers, mask, authentication, stub flag',
      'Neighbor list drives the Init → 2-Way transition',
    ],
    notes:
      "Hellos do three jobs: they discover neighbors, act as keepalives, and carry the parameters two routers must agree on before they can become neighbors. Every OSPF packet starts with a common header that includes the sender's **router ID** and the **area ID** of the interface. The Hello body then carries the **network mask**, the **hello interval**, an options field (including the flag that marks a stub area), the **router priority** used in DR elections, the **dead interval**, the IP addresses of the current **DR** and **BDR**, and a list of the **router IDs of every neighbor** heard on that link. That last list drives the state machine: when R1 sees its own RID in R2's Hello, R1 knows communication is two-way. If the area ID, hello or dead interval, authentication or stub flag differ — or the mask on a broadcast link — the Hello is ignored and no neighbor forms. When a question asks which fields must match, think of the Hello contents; remember that the MTU is checked later, in Database Description packets, and that the router IDs must be *different*.",
  },
  {
    kind: 'table',
    title: 'Hello and dead timers',
    columns: ['Network type', 'Default on', 'Hello', 'Dead'],
    rows: [
      ['Broadcast', 'Ethernet', '**10 s**', '**40 s**'],
      ['Point-to-point', 'Serial (HDLC, PPP)', '**10 s**', '**40 s**'],
      ['Non-broadcast (NBMA)', 'Frame Relay (legacy)', '30 s', '120 s'],
      ['Point-to-multipoint', 'Configured manually', '30 s', '120 s'],
    ],
    caption: 'Dead = 4 × hello by default. Changing only the hello interval moves the dead interval with it.',
    notes:
      "The **hello interval** is how often a router sends Hellos on an interface; the **dead interval** is how long it waits without hearing a Hello before declaring the neighbor down. On the two network types you meet on the CCNA — **broadcast**, the Ethernet default, and **point-to-point**, the default on serial HDLC and PPP links — the defaults are **10 and 40 seconds**. The older non-broadcast and point-to-multipoint types use 30 and 120. By default the dead interval is four times the hello interval, and on IOS, if you change only the hello with `ip ospf hello-interval 5`, the dead interval follows it to 20 seconds. Both values must match between neighbors because they are compared in every Hello. The dead timer is how OSPF detects failures the physical layer cannot see, such as a neighbor behind a switch that crashes while the local port stays up. In `show ip ospf neighbor` the Dead Time column counts down from 40 and snaps back each time a Hello arrives, so a value that keeps falling well below 30 hints at lost Hellos.",
  },
  {
    kind: 'steps',
    title: 'Neighbor states: Down to Full',
    steps: [
      { title: '**Down**', text: 'No Hello heard (or the dead timer expired)' },
      { title: '**Init**', text: 'Hello received, but my RID is not listed in it' },
      { title: '**2-Way**', text: 'My RID is in its Hello; DR/BDR elected here' },
      { title: '**ExStart**', text: 'Master/slave chosen: higher RID is master' },
      { title: '**Exchange**', text: 'DBD packets summarize each LSDB' },
      { title: '**Loading**', text: 'LSRs and LSUs fetch the missing LSAs' },
      { title: '**Full**', text: 'LSDBs synchronized: adjacency complete' },
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 's1', label: 'Down', shape: 'pill', tone: 'muted' },
        { id: 's2', label: 'Init', shape: 'pill' },
        { id: 's3', label: '2-Way', sub: 'neighbors', shape: 'pill', tone: 'accent' },
        { id: 's4', label: 'ExStart', shape: 'pill' },
        { id: 's5', label: 'Exchange', shape: 'pill' },
        { id: 's6', label: 'Loading', shape: 'pill' },
        { id: 's7', label: 'Full', sub: 'adjacent', shape: 'pill', tone: 'good' },
      ],
    },
    notes:
      "Memorize the seven states in order — Cisco asks for the sequence, for the meaning of a single state, and for the state that points to a specific fault. In **Down**, nothing has been heard. When a router receives a Hello that does not yet list its own RID, the neighbor is in **Init**: communication is one-way so far. When the router finds its own RID in the neighbor's Hello, it moves to **2-Way** — both routers now know each other, and on a multiaccess segment this is where the DR and BDR are elected. Routers that are to become fully adjacent continue to **ExStart**, where they decide who is master for the database exchange (the higher RID wins), then **Exchange**, trading Database Description packets that list the headers of every LSA they hold. In **Loading** each router requests the LSAs it is missing or holds older copies of, and when nothing is outstanding the pair reaches **Full**. Two diagnostic shortcuts: stuck in Init usually means Hellos are getting through in one direction only; stuck in ExStart or Exchange usually means an **MTU mismatch**.",
  },
  {
    kind: 'diagram',
    title: 'Building an adjacency, packet by packet',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1 · RID 1.1.1.1', icon: 'router' },
        { id: 'r2', label: 'R2 · RID 2.2.2.2', icon: 'router' },
      ],
      steps: [
        { note: 'Both routers start in Down', tone: 'muted' },
        { from: 'r1', to: 'r2', label: 'Hello', sub: 'neighbors seen: none → R2 lists R1 as Init' },
        { from: 'r2', to: 'r1', label: 'Hello', sub: 'neighbors seen: 1.1.1.1 → R1 moves R2 to 2-Way' },
        { from: 'r1', to: 'r2', label: 'Hello', sub: 'neighbors seen: 2.2.2.2 → R2 moves R1 to 2-Way' },
        { from: 'r2', to: 'r1', label: 'DBD (ExStart)', sub: 'higher RID 2.2.2.2 becomes master', tone: 'accent' },
        { from: 'r1', to: 'r2', label: 'DBDs both ways (Exchange)', sub: 'LSA headers only' },
        { from: 'r1', to: 'r2', label: 'LSR → LSU → LSAck (Loading)', sub: 'missing LSAs requested and delivered' },
        { note: 'Full: identical LSDBs', tone: 'good' },
      ],
    },
    caption: 'On a point-to-point link the two routers always continue to Full.',
    notes:
      "Here is the same state machine as a packet exchange between two routers on a point-to-point link. R1 speaks first, and its Hello lists no neighbors, so R2 records R1 in **Init**. R2's reply lists 1.1.1.1; when R1 sees its own RID it moves R2 straight to **2-Way**, and R1's next Hello does the same for R2. Now both routers decide to become adjacent and enter **ExStart**, exchanging empty Database Description packets to pick a **master**: the higher router ID, R2, wins and controls the DBD sequence numbers. In **Exchange** they send DBDs listing the header of every LSA in their databases. Each router compares those headers with its own LSDB and, in **Loading**, sends **Link State Requests** for anything missing or newer; the other side answers with **Link State Updates**, which are confirmed with **LSAcks**. When no requests remain, the neighbors are **Full**. This one exchange uses all five OSPF packet types: Hello, DBD, LSR, LSU and LSAck. Note that master/slave depends only on the higher RID, not on which router spoke first.",
  },
  {
    kind: 'table',
    title: 'The five OSPF packet types',
    columns: ['Type', 'Name', 'Purpose'],
    rows: [
      ['1', '**Hello**', 'Discover neighbors, keepalive, agree on parameters'],
      ['2', '**DBD** (Database Description)', 'List LSA headers during ExStart/Exchange'],
      ['3', '**LSR** (Link State Request)', 'Ask for specific missing or outdated LSAs'],
      ['4', '**LSU** (Link State Update)', 'Carry one or more complete LSAs — the actual flooding'],
      ['5', '**LSAck** (Link State Acknowledgment)', 'Confirm receipt of LSUs (reliable flooding)'],
    ],
    notes:
      "OSPF defines exactly five packet types, all carried in IP protocol 89 and all sharing the same header with the router ID and area ID. **Hello** (type 1) builds and maintains neighbor relationships. **Database Description** (type 2), abbreviated DBD or DD, is used during ExStart and Exchange; it carries LSA *headers*, not complete LSAs, plus the interface MTU, which is why an MTU mismatch shows up at that stage. **Link State Request** (type 3) asks a neighbor for specific LSAs. **Link State Update** (type 4) carries complete LSAs; it is the packet used both to answer requests and to flood changes. **Link State Acknowledgment** (type 5) confirms each update, so flooding is reliable even though OSPF does not use TCP. A frequent trap is confusing the LSA with the LSU: an LSA is a *record* that describes part of the topology, while an LSU is the *packet* that carries one or more LSAs across a link. Another trap: DBDs describe the database but never contain the full LSAs themselves.",
  },
  {
    kind: 'table',
    title: 'Cost = reference bandwidth ÷ interface bandwidth',
    columns: ['Interface', 'Bandwidth', 'Cost (ref 100 Mbps)', 'Cost (ref 10 000 Mbps)'],
    rows: [
      ['Serial T1 (default)', '1.544 Mbps', '**64**', '6476'],
      ['Ethernet', '10 Mbps', '10', '1000'],
      ['FastEthernet', '100 Mbps', '**1**', '100'],
      ['GigabitEthernet', '1 Gbps', '**1**', '10'],
      ['10-Gigabit Ethernet', '10 Gbps', '**1**', '1'],
    ],
    caption: 'Fractions are dropped, and the minimum cost is 1.',
    notes:
      "OSPF's metric is **cost**, and IOS calculates each interface's cost as **reference bandwidth ÷ interface bandwidth**, dropping any fraction, with a minimum of 1. The default reference bandwidth is **100 Mbps**, a value chosen when 100 Mbps was fast. Work the table: a 10 Mbps Ethernet link costs 100 ÷ 10 = 10; FastEthernet costs 100 ÷ 100 = 1; a T1 serial link at 1.544 Mbps costs 100 ÷ 1.544 = 64.77, truncated to **64**. Now the problem: Gigabit Ethernet gives 100 ÷ 1000 = 0.1, which is raised to the minimum of **1**, so FastEthernet, Gigabit and 10-Gigabit links all cost the same and OSPF cannot tell them apart. The fix is to raise the reference bandwidth with `auto-cost reference-bandwidth`, entered in Mbps. With 10 000 Mbps, costs become 100 for FastEthernet, 10 for Gigabit and 1 for 10-Gigabit. The route metric is the **sum** of outgoing interface costs along the path, so always compute from the router's point of view, adding each exit interface the packet would leave through.",
  },
  {
    kind: 'diagram',
    title: 'Cost math: why the reference matters',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 4.2, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', x: 4.2, y: 4 },
        { id: 'r4', icon: 'router', label: 'R4', x: 7, y: 2.5 },
        { id: 'lan', icon: 'switch', label: '10.4.4.0/24', x: 9.1, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'Gig', tone: 'good' },
        { from: 'r2', to: 'r4', label: 'Gig', tone: 'good' },
        { from: 'r1', to: 'r3', label: 'FastE' },
        { from: 'r3', to: 'r4', label: 'FastE' },
        { from: 'r4', to: 'lan', label: 'Gig' },
      ],
    },
    caption: 'Ref 100 Mbps: 1+1+1 = 3 on both paths (a tie). Ref 10 000 Mbps: via R2 = 30, via R3 = 210.',
    notes:
      "Let us compute R1's cost to 10.4.4.0/24 with both reference values. The upper path leaves R1 on Gigabit toward R2, leaves R2 on Gigabit toward R4, and finally uses R4's Gigabit LAN interface. The lower path uses FastEthernet links through R3 and the same R4 LAN interface. With the default reference of **100 Mbps**, every one of those interfaces costs 1, so the upper path is 1 + 1 + 1 = **3** and the lower path is also 1 + 1 + 1 = **3**. OSPF sees a tie and load-balances across a Gigabit path and a FastEthernet path — clearly not what the designer wants. With `auto-cost reference-bandwidth 10000` on all routers, Gigabit costs 10 and FastEthernet costs 100: the upper path is 10 + 10 + 10 = **30**, the lower is 100 + 100 + 10 = **210**, and only the Gigabit path is installed. The destination LAN interface is counted once, but *incoming* interfaces are never added. Exam questions usually give the reference bandwidth and interface speeds and ask for the metric in the routing table, so practise summing outgoing costs only.",
  },
  {
    kind: 'cli',
    title: 'Tuning cost: three knobs',
    code: `R1(config)# router ospf 1
R1(config-router)# auto-cost reference-bandwidth 10000
% OSPF: Reference bandwidth is changed.
        Please ensure reference bandwidth is consistent across all routers.
R1(config-router)# interface GigabitEthernet0/0/1
R1(config-if)# ip ospf cost 50
R1(config-if)# interface GigabitEthernet0/0/2
R1(config-if)# bandwidth 10000
R1(config-if)# end
R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/2      1     0               10.1.14.1/30       1000  BDR   1/1
Gi0/0/1      1     0               10.1.13.1/24       50    DR    1/1
Gi0/0/0      1     0               10.1.12.1/24       10    BDR   1/1`,
    highlight: ['auto-cost reference-bandwidth 10000', 'ip ospf cost 50', 'bandwidth 10000'],
    caption: '`ip ospf cost` overrides the formula; `bandwidth` (kbps) changes its denominator.',
    notes:
      "Three commands influence cost, and the exam expects you to know which one wins. **`auto-cost reference-bandwidth`** (in Mbps, under the OSPF process) changes the numerator for every interface on that router; IOS immediately reminds you to set the same value on *all* routers, because a mismatch makes routers disagree about path costs and can cause suboptimal routing. **`bandwidth`** (in kbps, under the interface) changes the denominator — here 10 000 kbps on a 10 Mbps provider circuit gives 10 000 000 ÷ 10 000 = **1000**. It changes only what routing protocols and QoS believe, never the real line speed. **`ip ospf cost`** (under the interface) skips the calculation entirely and sets the cost directly; it always overrides the formula, which is why Gi0/0/1 shows 50 even though a Gigabit link would otherwise cost 10 with this reference. Gi0/0/0 shows exactly that calculated value of 10. The brief output confirms each result in the Cost column. Remember the units — Mbps for the reference, kbps for bandwidth — because answer options love to mix them up.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: OSPF concepts',
    body: 'OSPF concept questions hide small details — check each of these before you answer.',
    bullets: [
      'OSPF = IP protocol **89**, never a TCP/UDP port',
      'RID: `router-id` > highest **loopback** > highest active interface',
      'A new RID needs `clear ip ospf process` (or a reload)',
      '224.0.0.5 = all OSPF routers · 224.0.0.6 = DR/BDR only',
      'Default reference: FastE, GigE and 10GE all cost **1**',
      'Stuck in **ExStart/Exchange** → suspect an MTU mismatch',
      'LSA = record; LSU = packet that carries LSAs',
    ],
    notes:
      "Run through this checklist whenever an OSPF concept question looks too easy. Protocol number versus port is a favourite distractor: OSPF has no port. For the router ID, remember that a configured value wins even if it matches no interface, that loopbacks beat physical interfaces regardless of which address is numerically higher overall, and that nothing changes on a running process until it is reset. Multicast questions often swap .5 and .6; the DR and BDR listen on both, DROTHERs only on .5. Cost questions frequently rely on the default reference bandwidth making Gigabit and FastEthernet equal, or on forgetting to add the destination interface's cost. State questions test the order — Init comes *before* 2-Way, ExStart before Exchange — and the meaning of being stuck: Init points to one-way Hellos, ExStart or Exchange to an MTU problem. Finally, distinguish neighbors from adjacencies: DROTHERs on a LAN stay in 2-Way with each other, and that is normal, not a fault. The next lesson turns all of this theory into configuration.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'OSPF: open-standard **link-state IGP**, IP protocol 89, AD 110',
      'LSAs (Type 1 router, Type 2 network) → identical **LSDB** → **SPF**',
      'Area 0 = backbone; ABRs join areas, ASBRs import external routes',
      'RID: `router-id` > highest loopback > highest active interface',
      'Hello 10 s / dead 40 s on broadcast and point-to-point',
      'Down → Init → 2-Way → ExStart → Exchange → Loading → Full',
      '==Cost = reference bandwidth (100 Mbps) ÷ interface bandwidth==',
    ],
    notes:
      "Let us tie the deck together. OSPF is an open-standard, link-state interior gateway protocol that runs directly over IP as protocol 89, with an administrative distance of 110. Routers describe their own links in LSAs — Type 1 from every router, Type 2 from the DR on each multiaccess segment — and flood them using 224.0.0.5 and 224.0.0.6 until every router in the area holds an identical LSDB. Each router then runs Dijkstra's SPF algorithm with itself as the root and installs the lowest-cost routes. Areas contain flooding and SPF work; area 0 is the backbone, ABRs connect areas and ASBRs bring in external routes, but the CCNA focuses on single-area designs. Each router is identified by a router ID taken from the `router-id` command, then the highest loopback, then the highest active interface, and fixed until the process restarts. Neighbors meet through Hellos every 10 seconds with a 40-second dead interval and climb through seven states to Full. Finally, cost equals the reference bandwidth divided by the interface bandwidth, and the default 100 Mbps reference should be raised consistently on modern networks.",
  },
];

export default slides;
