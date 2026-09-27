import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Point-to-point WAN', back: 'A single link between exactly **two sites**; the two routers are each other\'s only neighbor on that link.' },
  { id: 'f2', front: 'Hub-and-spoke WAN', back: 'Each branch (spoke) connects only to a central **hub**; spoke-to-spoke traffic transits the hub. n sites need **n − 1** links.' },
  { id: 'f3', front: 'Number of links in a full mesh of n sites', back: '**n(n − 1)/2** — e.g. 5 sites = 10 links, 8 sites = 28 links, 10 sites = 45 links.' },
  { id: 'f4', front: 'Partial mesh', back: 'Only some site pairs have direct links (usually the busiest or most critical) — a compromise between full mesh and hub-and-spoke.' },
  { id: 'f5', front: 'Single-homed', back: 'One connection to **one** ISP — no redundancy.' },
  { id: 'f6', front: 'Dual-homed (Internet connectivity)', back: 'Two connections to the **same** ISP: survives a link or router failure, but not an outage of that ISP.' },
  { id: 'f7', front: 'Multihomed', back: 'Connections to **two or more different** ISPs, so the site survives the loss of a whole provider.' },
  { id: 'f8', front: 'Dual-multihomed', back: '**Two connections to each** of two (or more) ISPs — the most resilient and most expensive option.' },
  { id: 'f9', front: 'CSU/DSU', back: 'Channel service unit/data service unit: terminates a leased digital line at the customer site and acts as the **DCE**.' },
  { id: 'f10', front: 'DCE vs DTE on a serial link', back: 'The **DCE** (CSU/DSU, or the DCE end of a lab cable) supplies the **clock**; the **DTE** (the router) receives it.' },
  { id: 'f11', front: 'T1 and E1 line rates', back: 'T1 = **1.544 Mbps** (24 × 64 kbps + framing); E1 = **2.048 Mbps** (32 × 64 kbps).' },
  { id: 'f12', front: 'Default encapsulation on a Cisco serial interface', back: '**Cisco HDLC** — a proprietary HDLC that adds a protocol-type field.' },
  { id: 'f13', front: 'What PPP offers that Cisco HDLC does not', back: 'Open standard; **authentication** (PAP/CHAP) negotiated by LCP; NCPs such as IPCP; multilink.' },
  { id: 'f14', front: 'Symptom of a PPP-vs-HDLC encapsulation mismatch', back: 'Interface **up**, line protocol **down** (up/down): Layer 1 works, Layer 2 fails.' },
  { id: 'f15', front: 'CE router (MPLS)', back: 'Customer edge: the router at the customer site that connects to the provider; in a Layer 3 MPLS VPN it routes with the **PE**.' },
  { id: 'f16', front: 'PE router (MPLS)', back: 'Provider edge: faces customers, keeps a **VRF** per customer, pushes and removes labels, and exchanges VPN routes with other PEs using **MP-BGP**.' },
  { id: 'f17', front: 'P router (MPLS)', back: 'Provider core router that forwards by **label only** and holds **no customer routes**.' },
  { id: 'f18', front: 'Layer 2 MPLS VPN service types', back: '**VPWS** (point-to-point wire, like E-Line) and **VPLS** (multipoint switch, like E-LAN). CE routers peer with **each other**.' },
  { id: 'f19', front: 'Does an MPLS VPN encrypt customer traffic?', back: '**No.** Labels and VRFs keep customers separate; confidentiality needs IPsec or similar.' },
  { id: 'f20', front: 'UNI and EVC (Metro Ethernet)', back: '**UNI**: the Ethernet demarcation port between customer and provider. **EVC**: the logical connection that associates two or more UNIs.' },
  { id: 'f21', front: 'E-Line', back: 'MEF **point-to-point** Ethernet service between two UNIs — conceptually a leased line.' },
  { id: 'f22', front: 'E-LAN', back: 'MEF **multipoint-to-multipoint** service: any site to any site, like one big switch (logical full mesh).' },
  { id: 'f23', front: 'E-Tree', back: 'MEF **rooted multipoint** service: roots reach every leaf, but **leaves cannot reach each other** (hub-and-spoke).' },
  { id: 'f24', front: 'DSL: medium and provider device', back: 'Telephone **copper pair**; the DSL modem connects to a **DSLAM** in the telco central office.' },
  { id: 'f25', front: 'Cable Internet: provider device and standard', back: '**CMTS** at the cable head-end, using **DOCSIS** over coax (hybrid fiber-coax).' },
  { id: 'f26', front: 'FTTH customer device', back: '**ONT** (optical network terminal), connected over a PON to the provider\'s **OLT**.' },
  { id: 'f27', front: 'Main drawback of geostationary satellite Internet', back: '**High latency** — roughly half a second or more round trip; low-earth-orbit service reduces it.' },
  { id: 'f28', front: 'Site-to-site vs remote-access VPN', back: 'Site-to-site: gateways tunnel whole networks (usually IPsec), no host software. Remote access: one device runs a client (TLS or IPsec).' },
  { id: 'f29', front: 'Cisco SD-WAN components and planes', back: 'Manager (vManage) = management · Controller (vSmart) = control, OMP · Validator (vBond) = orchestration · WAN Edge = data.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'In an MPLS VPN, which router type forwards packets by label only and holds no customer routes?',
    options: ['CE', 'PE', 'P', 'CSU/DSU'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**P** (provider core) routers switch on the outer label and never need customer routes. PE routers hold a VRF per customer, CE routers are at the customer site, and a CSU/DSU is a serial line termination device, not an MPLS router.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two statements describe a Metro Ethernet E-Tree service? (Choose two.)',
    options: [
      'Leaf sites can exchange frames directly with each other',
      'Root sites can reach every leaf site',
      'It is a rooted multipoint, hub-and-spoke service',
      'It always connects exactly two sites',
      'Every router becomes a neighbor of every other router',
    ],
    answers: [1, 2],
    difficulty: 2,
    explanation:
      'E-Tree is **rooted multipoint**: roots reach all leaves, and leaves are blocked from each other. Leaf-to-leaf reachability and all routers being neighbors describe **E-LAN**; exactly two sites describes **E-Line**.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'A company wants a full mesh of direct links between 6 sites. How many links are required?',
    answers: ['15'],
    placeholder: 'number of links',
    difficulty: 2,
    explanation:
      'Full mesh = n(n − 1)/2 = 6 × 5 / 2 = **15**. Answering 30 forgets to divide by two (each link is counted from both ends); 5 is the hub-and-spoke count.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each access technology with the device most associated with it.',
    pairs: [
      { left: 'DSL', right: 'DSLAM in the central office' },
      { left: 'Cable', right: 'CMTS at the head-end' },
      { left: 'Fiber to the home', right: 'ONT at the customer site' },
      { left: '4G/5G', right: 'Cellular router with a SIM' },
    ],
    difficulty: 1,
    explanation:
      'DSL modems connect to a **DSLAM**, cable modems to a **CMTS** (DOCSIS), FTTH terminates on an **ONT** at the customer, and cellular access needs a **SIM** in a cellular router or modem.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'On a leased line, which device provides clocking to the router?',
    options: ['The router, acting as DTE', 'The CSU/DSU, acting as DCE', 'The PE router', 'The DSLAM'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **CSU/DSU** is the DCE and supplies the clock; the router is the DTE and receives it. PE routers and DSLAMs belong to MPLS and DSL services, not to clocking a serial line.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A teleworker needs encrypted access to headquarters from a home Internet connection using a company laptop. Which solution fits best?',
    options: ['Site-to-site IPsec VPN', 'Remote-access VPN', 'Layer 2 MPLS VPN', 'Metro Ethernet E-Line'],
    answer: 1,
    difficulty: 2,
    explanation:
      'One user device connecting on demand is the definition of a **remote-access VPN** (client software using TLS or IPsec). Site-to-site VPNs join whole networks through gateways, and MPLS or E-Line services are private provider circuits that do not reach a home Internet user.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which Cisco SD-WAN component provides the control plane and distributes routes and policy using OMP?',
    options: ['SD-WAN Manager (vManage)', 'SD-WAN Controller (vSmart)', 'SD-WAN Validator (vBond)', 'WAN Edge router'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **SD-WAN Controller** (formerly vSmart) is the control plane and speaks OMP to the edges. The Manager is management, the Validator is orchestration (onboarding and NAT traversal), and WAN Edge routers form the data plane.',
  },
];
