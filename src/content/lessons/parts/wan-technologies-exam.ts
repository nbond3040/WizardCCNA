import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. The company buys a Layer 3 MPLS VPN and runs OSPF between each site router and the provider. With which device does CE1 form an OSPF adjacency?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 12,
        height: 3,
        nodes: [
          { id: 'ce1', icon: 'router', label: 'CE1', sub: 'Site A', x: 1, y: 1.5 },
          { id: 'pe1', icon: 'router', label: 'PE1', x: 3.5, y: 1.5 },
          { id: 'p1', icon: 'router', label: 'P1', x: 6, y: 1.5 },
          { id: 'pe2', icon: 'router', label: 'PE2', x: 8.5, y: 1.5 },
          { id: 'ce2', icon: 'router', label: 'CE2', sub: 'Site B', x: 11, y: 1.5 },
        ],
        links: [
          { from: 'ce1', to: 'pe1', label: '10.0.1.0/30' },
          { from: 'pe1', to: 'p1' },
          { from: 'p1', to: 'pe2' },
          { from: 'pe2', to: 'ce2', label: '10.0.2.0/30' },
        ],
        groups: [{ label: 'Provider MPLS network', x: 2.6, y: 0.3, w: 6.8, h: 2.4, tone: 'muted' }],
      },
    },
    options: ['CE2', 'PE1', 'P1', 'PE2'],
    answer: 1,
    difficulty: 2,
    explanation:
      'In a Layer 3 MPLS VPN each CE routes with its directly connected **PE**. PE1 puts CE1\'s routes into the customer VRF and carries them to PE2 with MP-BGP. CE1 never peers with CE2 — CE-to-CE adjacencies happen only with Layer 2 services such as VPLS. P1 holds no customer routes, and PE2 is not even directly connected to CE1.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Four routers connect to a Metro Ethernet E-Tree service in which R1 is the root and R2, R3 and R4 are leaves. All four interfaces are in 10.9.9.0/24 and run OSPF. How many OSPF neighbors does R3 have?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: 'root · 10.9.9.1', x: 5, y: 1.2, tone: 'accent' },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'leaf · 10.9.9.2', x: 1.8, y: 3.8 },
          { id: 'r3', icon: 'router', label: 'R3', sub: 'leaf · 10.9.9.3', x: 5, y: 3.8 },
          { id: 'r4', icon: 'router', label: 'R4', sub: 'leaf · 10.9.9.4', x: 8.2, y: 3.8 },
        ],
        links: [
          { from: 'r1', to: 'r2', style: 'dashed' },
          { from: 'r1', to: 'r3', style: 'dashed' },
          { from: 'r1', to: 'r4', style: 'dashed' },
        ],
        groups: [{ label: 'Metro Ethernet E-Tree', x: 0.6, y: 0.3, w: 8.8, h: 4.4, tone: 'muted' }],
      },
    },
    options: ['0', '1', '2', '3'],
    answer: 1,
    difficulty: 3,
    explanation:
      'An E-Tree delivers frames only between a **root** and the **leaves**, never leaf to leaf. R3 therefore receives hellos only from R1 and has exactly **one** neighbor. Three would be correct on an E-LAN, where every router hears every other; two would require some leaf-to-leaf reachability, which E-Tree forbids; zero would mean R3 could not even reach the root.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'A company connects its sites with a VPLS (Layer 2 MPLS VPN) service. Which two statements are true? (Choose two.)',
    options: [
      'The customer routers can form routing adjacencies directly with each other',
      'Each CE router forms a routing adjacency with the PE router at its own site',
      'The provider network behaves like one Ethernet switch connecting all sites',
      'P routers can learn the customer IP routes in order to forward traffic',
      'The service provides a point-to-point connection between two customer sites',
    ],
    answers: [0, 2],
    difficulty: 3,
    explanation:
      'VPLS emulates a **switch** between all sites, so the CE routers share a subnet and peer **with each other**. CE-to-PE routing adjacencies describe a **Layer 3** MPLS VPN. P routers never learn customer routes in any MPLS VPN — they forward on labels. A point-to-point service between two sites is VPWS (E-Line), not VPLS.',
  },
  {
    id: 'e4',
    type: 'categorize',
    stem: 'Classify each characteristic as belonging to a Layer 3 MPLS VPN or a Layer 2 MPLS VPN.',
    categories: ['Layer 3 MPLS VPN', 'Layer 2 MPLS VPN'],
    items: [
      { text: 'CE routers exchange routes with the PE', category: 0 },
      { text: 'The provider keeps customer routes in VRFs', category: 0 },
      { text: 'Sites can mix access types such as Ethernet and DSL', category: 0 },
      { text: 'CE routers are neighbors of each other on a shared subnet', category: 1 },
      { text: 'The provider emulates a wire (VPWS) or a switch (VPLS)', category: 1 },
      { text: 'The customer keeps complete control of routing', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'In a **Layer 3** VPN the provider routes: CEs peer with PEs, PEs hold VRFs, and because the service is IP-based each site can use a different access technology. In a **Layer 2** VPN the provider only forwards frames (VPWS or VPLS), so the CE routers become neighbors of each other and the customer controls all routing.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each Metro Ethernet term to its description.',
    pairs: [
      { left: 'E-Line', right: 'Point-to-point service between two UNIs' },
      { left: 'E-LAN', right: 'Any-to-any multipoint service' },
      { left: 'E-Tree', right: 'Root-to-leaf service with leaves isolated from each other' },
      { left: 'UNI', right: 'Ethernet demarcation between customer and provider' },
      { left: 'EVC', right: 'Logical connection that associates two or more UNIs' },
    ],
    difficulty: 1,
    explanation:
      'E-**Line** is a line between two points, E-**LAN** behaves like a LAN where everyone reaches everyone, and E-**Tree** has a root that reaches leaves that cannot reach each other. The **UNI** is the physical demarc port, and an **EVC** is the virtual connection the provider builds between UNIs.',
  },
  {
    id: 'e6',
    type: 'input',
    stem: 'A company with 8 sites wants a full mesh of point-to-point leased lines. How many leased lines are required?',
    answers: ['28'],
    placeholder: 'number of lines',
    difficulty: 2,
    explanation:
      'Full mesh = n(n − 1)/2 = 8 × 7 / 2 = **28**. The tempting 56 counts every link twice (once from each end), and 7 is the number of links a hub-and-spoke design would need.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Which provider device terminates cable modem connections using DOCSIS?',
    options: ['DSLAM', 'CMTS', 'ONT', 'CSU/DSU'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **CMTS** (cable modem termination system) at the cable head-end serves the cable modems. A DSLAM aggregates DSL lines, an ONT terminates fiber at the customer premises, and a CSU/DSU terminates a leased serial line.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 are connected back to back with a serial cable, and R1 holds the DCE end. The link remains in the state shown. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief | include Serial
Serial0/1/0            10.0.12.1       YES manual up                    down
R1# show running-config | section interface Serial0/1/0
interface Serial0/1/0
 ip address 10.0.12.1 255.255.255.252
 encapsulation ppp
 clock rate 64000

R2# show running-config | section interface Serial0/1/0
interface Serial0/1/0
 ip address 10.0.12.2 255.255.255.252`,
    },
    options: [
      'The clock rate is configured on R1 but belongs on the DTE end, R2',
      'R1 uses PPP while R2 still uses the default HDLC encapsulation',
      'The two IP addresses are in different subnets on the serial link',
      'R2 must also be configured with a clock rate to match R1',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'R2 shows no `encapsulation` command, so it runs the default **HDLC**, while R1 runs **PPP**. Mismatched Layer 2 encapsulation leaves the interface **up/down**. The clock rate is correctly on R1, the DCE end; the DTE (R2) never sets a clock. 10.0.12.1/30 and 10.0.12.2/30 are in the same subnet — and an addressing mistake would not bring the line protocol down anyway.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'Which two statements about a hub-and-spoke WAN are true? (Choose two.)',
    options: [
      'Traffic between two spokes passes through the hub',
      'It requires n(n − 1)/2 links, one link for each pair of sites',
      'The hub is a single point of failure unless it is made redundant',
      'Each spoke has its own direct link to each of the other spokes',
      'It gives the lowest-delay path between any two branches',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Spokes connect only to the hub, so spoke-to-spoke traffic **transits the hub**, and losing the hub isolates every spoke unless a second hub is added. The n(n − 1)/2 formula and direct spoke-to-spoke links describe a **full mesh**, which — not hub-and-spoke — gives the lowest delay between branches.',
  },
  {
    id: 'e10',
    type: 'order',
    stem: 'Put the events in order as a packet travels from Site A to Site B across a Layer 3 MPLS VPN.',
    items: [
      'CE1 forwards an ordinary IP packet to PE1',
      'PE1 finds the route in the customer VRF and pushes the VPN and transport labels',
      'P routers forward the packet based on the outer transport label',
      'PE2 uses the VPN label to select the customer VRF',
      'PE2 forwards an ordinary IP packet to CE2',
    ],
    difficulty: 2,
    explanation:
      'The CE sends plain IP to its PE. The ingress PE looks up the VRF and pushes an inner VPN label and an outer transport label. P routers forward on the outer label only. The egress PE uses the VPN label to find the right VRF, then delivers a normal IP packet to the destination CE.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'A company wants its provider to act like a single Ethernet switch that interconnects all of its sites, so that the company\'s routers share one subnet and run their own routing protocol with each other. Which service meets the requirement?',
    options: ['Metro Ethernet E-Line (VPWS)', 'Metro Ethernet E-LAN (VPLS)', 'Layer 3 MPLS VPN (L3VPN)', 'Site-to-site IPsec VPN'],
    answer: 1,
    difficulty: 2,
    explanation:
      '**E-LAN**, typically built with VPLS, is a multipoint Layer 2 service that behaves like one switch, so all routers share a subnet and peer with each other. E-Line connects only two sites per EVC. In a Layer 3 MPLS VPN the routers peer with the provider PE, not with each other. A site-to-site IPsec VPN is a routed tunnel between gateways, not a shared Ethernet segment.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. HQ reaches the Internet through two routers, each with one link to ISP-A. Which term describes this connectivity?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 1.5, y: 1.2 },
          { id: 'r2', icon: 'router', label: 'R2', x: 1.5, y: 3.8 },
          { id: 'isp', icon: 'cloud', label: 'ISP-A', x: 5.5, y: 2.5 },
          { id: 'net', icon: 'internet', label: 'Internet', x: 8.8, y: 2.5 },
        ],
        links: [
          { from: 'r1', to: 'isp', fromLabel: 'G0/0/1' },
          { from: 'r2', to: 'isp', fromLabel: 'G0/0/1' },
          { from: 'isp', to: 'net' },
        ],
        groups: [{ label: 'HQ', x: 0.5, y: 0.4, w: 2, h: 4.2, tone: 'muted' }],
      },
    },
    options: ['Single-homed', 'Dual-homed', 'Multihomed', 'Dual-multihomed'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Two links to the **same** provider is **dual-homed**. Single-homed would be one link. Multihomed requires connections to two or more **different** ISPs, and dual-multihomed means two links to each of at least two ISPs. Only one ISP appears in the exhibit.',
  },
  {
    id: 'e13',
    type: 'categorize',
    stem: 'Categorize each item by the access medium it is associated with.',
    categories: ['Telephone copper', 'Coaxial cable', 'Optical fiber', 'Cellular or satellite radio'],
    items: [
      { text: 'DSLAM', category: 0 },
      { text: 'ADSL', category: 0 },
      { text: 'CMTS', category: 1 },
      { text: 'DOCSIS', category: 1 },
      { text: 'ONT', category: 2 },
      { text: 'PON splitter', category: 2 },
      { text: '5G with a SIM', category: 3 },
      { text: 'Geostationary link with high latency', category: 3 },
    ],
    difficulty: 1,
    explanation:
      'DSL (and its DSLAM) uses the **telephone copper** pair. Cable Internet uses **coax** with DOCSIS and a CMTS. FTTH uses **fiber**: an ONT at the customer and passive optical splitters in the PON. 4G/5G and satellite are **radio** technologies; geostationary satellites are known for high latency.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Sales staff must reach internal servers securely from hotels and customer sites using company laptops. Which solution meets the requirement?',
    options: [
      'A site-to-site IPsec VPN between HQ and each hotel',
      'A remote-access VPN using client software on each laptop',
      'A Layer 3 MPLS VPN from the provider',
      'An E-Line from each hotel to HQ',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Individual devices connecting from arbitrary locations need a **remote-access VPN**: client software (TLS or IPsec) builds a tunnel to an HQ firewall or concentrator on demand. Site-to-site VPNs require a gateway you control at each location, and MPLS or E-Line circuits connect fixed company sites, not hotels.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about site-to-site IPsec VPNs are true? (Choose two.)',
    options: [
      'End hosts need no VPN client software',
      'Each user starts the tunnel on demand from a web browser',
      'Routers or firewalls acting as VPN gateways encrypt traffic between the sites',
      'The provider must run MPLS between the sites',
      'They are used mainly to connect individual teleworkers',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'In a site-to-site VPN the **gateways** (routers or firewalls) encrypt traffic between networks, so hosts send ordinary packets and need **no client**. Browser-started, per-user tunnels for teleworkers describe **remote-access** VPNs. Site-to-site IPsec runs over any IP transport, typically the Internet — no MPLS is required.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Which Cisco SD-WAN component authenticates WAN Edge devices as they join the overlay and helps them traverse NAT?',
    options: ['SD-WAN Manager (vManage)', 'SD-WAN Controller (vSmart)', 'SD-WAN Validator (vBond)', 'WAN Edge router'],
    answer: 2,
    difficulty: 1,
    explanation:
      'The **SD-WAN Validator** (formerly vBond) is the orchestration component: it authenticates devices during onboarding and assists with NAT traversal. The Manager provides management and the GUI, the Controller runs the control plane (OMP), and WAN Edge routers forward data.',
  },
  {
    id: 'e17',
    type: 'match',
    stem: 'Match each Cisco SD-WAN component with the plane it provides.',
    pairs: [
      { left: 'SD-WAN Manager (vManage)', right: 'Management plane' },
      { left: 'SD-WAN Controller (vSmart)', right: 'Control plane' },
      { left: 'SD-WAN Validator (vBond)', right: 'Orchestration plane' },
      { left: 'WAN Edge router', right: 'Data plane' },
    ],
    difficulty: 2,
    explanation:
      'Cisco SD-WAN separates the planes: the **Manager** configures and monitors, the **Controller** distributes routes and policy with OMP, the **Validator** onboards devices and helps with NAT traversal, and the **WAN Edge** routers carry user traffic through IPsec tunnels.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. An SD-WAN policy assigns voice to an SLA class with a 150 ms maximum latency and prefers the MPLS transport. Tunnel probes now report the latencies shown. What happens to voice traffic?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'br', icon: 'router', label: 'Branch', sub: 'WAN Edge', x: 1.2, y: 2.5 },
          { id: 'mpls', icon: 'cloud', label: 'MPLS', sub: 'latency 220 ms', x: 5, y: 1.2 },
          { id: 'net', icon: 'internet', label: 'Internet', sub: 'latency 40 ms', x: 5, y: 3.8 },
          { id: 'hq', icon: 'router', label: 'HQ', sub: 'WAN Edge', x: 8.8, y: 2.5 },
        ],
        links: [
          { from: 'br', to: 'mpls', tone: 'bad' },
          { from: 'mpls', to: 'hq', tone: 'bad' },
          { from: 'br', to: 'net', tone: 'good' },
          { from: 'net', to: 'hq', tone: 'good' },
        ],
      },
    },
    options: [
      'It stays on MPLS because MPLS is the preferred transport',
      'Application-aware routing moves it to the Internet tunnel, which meets the SLA',
      'The WAN Edge drops it until MPLS latency recovers',
      'An administrator must push a new configuration from SD-WAN Manager before it can move',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      '**Application-aware routing** compares live tunnel measurements with the SLA class. The preferred MPLS path (220 ms) violates the 150 ms SLA while the Internet tunnel (40 ms) complies, so voice moves automatically. A preference applies only while the preferred path meets the SLA, traffic is not dropped when a compliant path exists, and no manual configuration push is needed.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A router connects to a T1 leased line through an external CSU/DSU. Which statement is correct?',
    options: [
      'The router is the DCE and must set the clock rate',
      'The CSU/DSU is the DCE and provides clocking to the router',
      'The CSU/DSU is the DTE and receives clocking from the router',
      'Synchronous serial links do not use clocking',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The **CSU/DSU** is the DCE and supplies the clock; the router is the DTE. Routers set `clock rate` only in labs, when they hold the DCE end of a back-to-back cable. Synchronous serial links depend on a shared clock, so the last option is false.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. HQ connects to three branch routers through one Metro Ethernet UNI on G0/0/1. Which Metro Ethernet design is in use?',
    exhibit: {
      kind: 'cli',
      text: `HQ# show running-config | section GigabitEthernet0/0/1
interface GigabitEthernet0/0/1
 no ip address
 negotiation auto
interface GigabitEthernet0/0/1.101
 encapsulation dot1Q 101
 ip address 10.1.101.1 255.255.255.252
interface GigabitEthernet0/0/1.102
 encapsulation dot1Q 102
 ip address 10.1.102.1 255.255.255.252
interface GigabitEthernet0/0/1.103
 encapsulation dot1Q 103
 ip address 10.1.103.1 255.255.255.252`,
    },
    options: [
      'One E-LAN service connecting all four sites',
      'One E-Tree service with HQ as the root',
      'Three E-Line services multiplexed by VLAN on one UNI',
      'A Layer 3 MPLS VPN in which HQ peers with the PE',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Each branch has its own VLAN, its own subinterface and its own /30 — a two-host, point-to-point subnet per EVC. That is **three E-Lines** delivered VLAN-based (EVPL) on one UNI. E-LAN and E-Tree are single multipoint EVCs, so all sites would share one subnet on one interface. With a Layer 3 MPLS VPN, HQ would need just one link to its PE and would reach every branch through it.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Refer to the exhibit. Four routers connect to a Metro Ethernet E-LAN service and share subnet 10.5.5.0/24. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: '10.5.5.1', x: 1.5, y: 1.2 },
          { id: 'r2', icon: 'router', label: 'R2', sub: '10.5.5.2', x: 8.5, y: 1.2 },
          { id: 'r3', icon: 'router', label: 'R3', sub: '10.5.5.3', x: 1.5, y: 3.8 },
          { id: 'r4', icon: 'router', label: 'R4', sub: '10.5.5.4', x: 8.5, y: 3.8 },
          { id: 'me', icon: 'cloud', label: 'E-LAN', sub: '10.5.5.0/24', x: 5, y: 2.5 },
        ],
        links: [
          { from: 'r1', to: 'me', label: 'UNI' },
          { from: 'r2', to: 'me', label: 'UNI' },
          { from: 'r3', to: 'me', label: 'UNI' },
          { from: 'r4', to: 'me', label: 'UNI' },
        ],
      },
    },
    options: [
      'R2 can send frames directly to R4 without passing through R1',
      'Each router can become an OSPF neighbor of every other router',
      'R2 and R4 cannot exchange frames because they are leaves',
      'Each pair of routers needs its own subnet',
      'Each router forms its OSPF adjacency with the provider PE',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'An E-LAN is **any-to-any**, so R2 reaches R4 directly, and because all routers share one subnet and hear each other\'s hellos, each can become an OSPF **neighbor of every other**. Isolated leaves describe E-Tree, a subnet per pair describes separate E-Lines, and peering with the provider PE describes a Layer 3 MPLS VPN — the provider is invisible to routing on a Layer 2 service.',
  },
];
