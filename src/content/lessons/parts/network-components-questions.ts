import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: "A router's core job", back: 'Forward **packets between networks** using its routing table. Each router interface is a separate subnet and broadcast domain.' },
  { id: 'f2', front: 'Typical WAN edge router functions', back: 'Connect the site to the ISP/WAN, and commonly perform **NAT/PAT**, ACL filtering, QoS and VPN termination.' },
  { id: 'f3', front: 'Data plane', back: 'Per-packet forwarding work: table lookups, de/re-encapsulation, 802.1Q tagging, ACL filtering, NAT rewrites — done in hardware where possible.' },
  { id: 'f4', front: 'Control plane', back: 'Builds the tables the data plane uses: routing protocols such as **OSPF**, **ARP**, **STP**.' },
  { id: 'f5', front: 'Management plane', back: 'How administrators and tools manage the device: **SSH**, Telnet, **SNMP**, syslog, HTTPS GUI.' },
  { id: 'f6', front: 'What does a Layer 2 switch use to forward a frame?', back: 'The **destination MAC address**, looked up in a MAC address table built from learned source MACs.' },
  { id: 'f7', front: 'Multilayer (Layer 3) switch', back: 'A switch that also **routes between VLANs** in hardware using SVIs or routed ports; requires `ip routing`.' },
  { id: 'f8', front: 'Collision domain', back: 'Devices whose frames can collide. One per switch port or router interface; one for a hub and everything attached to it.' },
  { id: 'f9', front: 'Broadcast domain', back: 'Devices that receive each other\'s broadcasts. One per VLAN on switches; bounded by router (Layer 3) interfaces.' },
  { id: 'f10', front: 'Hub: collision and broadcast domains', back: '**One** collision domain and **one** broadcast domain for all ports; half duplex only.' },
  { id: 'f11', front: 'Stateful firewall', back: 'Tracks each session in a **state table** so return traffic for permitted sessions is allowed automatically.' },
  { id: 'f12', front: 'Firewall zones', back: '**Inside** (trusted), **outside** (untrusted) and **DMZ** (servers reachable from outside). By default inside-initiated sessions are allowed; outside-initiated traffic is denied.' },
  { id: 'f13', front: 'Five NGFW capabilities (Cisco list)', back: 'Stateful inspection, **AVC**, **URL filtering**, **NGIPS**, **AMP**.' },
  { id: 'f14', front: 'AVC', back: '**Application Visibility and Control**: identifies applications by content and behavior (Layer 7), not just by port number.' },
  { id: 'f15', front: 'URL filtering', back: 'Permits or blocks web requests by **URL category** and **reputation score**, using vendor threat intelligence.' },
  { id: 'f16', front: 'AMP', back: '**Advanced Malware Protection**: file reputation checks, sandboxing, and retrospective alerts when a file is later found malicious.' },
  { id: 'f17', front: 'How is an IDS deployed?', back: '**Promiscuous** (passive) mode on a **copy** of traffic from a SPAN port or TAP. It alerts but cannot stop the triggering packet.' },
  { id: 'f18', front: 'How is an IPS deployed?', back: '**Inline**: traffic flows through it, so it can **drop** malicious packets in real time. Adds latency and can be a point of failure.' },
  { id: 'f19', front: 'Main limitation of signature-based detection', back: 'It only recognizes **known** attacks, needs regular updates, and misses **zero-day** attacks.' },
  { id: 'f20', front: 'False positive vs false negative', back: '**False positive**: benign traffic flagged as an attack. **False negative**: a real attack that goes undetected.' },
  { id: 'f21', front: 'What NGIPS adds to a traditional IPS', back: 'AVC, **contextual awareness** of hosts, **reputation-based filtering** and **event impact levels**.' },
  { id: 'f22', front: 'Autonomous AP', back: 'Standalone AP configured individually; maps SSIDs to VLANs itself, so it usually connects to a **trunk** port.' },
  { id: 'f23', front: 'Lightweight AP', back: 'AP managed by a **WLC** using a **split-MAC** design; traffic is tunneled to the WLC in **CAPWAP**.' },
  { id: 'f24', front: 'CAPWAP ports', back: 'UDP **5246** = control (DTLS-encrypted); UDP **5247** = data.' },
  { id: 'f25', front: 'Key WLC functions', back: 'Central AP configuration, **RRM** (channel and power), client authentication, roaming, security policy, rogue AP detection.' },
  { id: 'f26', front: 'Cisco Catalyst Center', back: 'Formerly **Cisco DNA Center**: on-premises campus controller for automation (PnP, templates, SWIM), assurance and policy, with northbound REST APIs.' },
  { id: 'f27', front: 'Meraki dashboard', back: 'Cloud-based management: Meraki devices connect to the Meraki cloud; only management data goes there, user traffic stays local.' },
  { id: 'f28', front: 'Client-server model', back: 'Dedicated **servers** provide services (web, email, DNS, DHCP, files) that **clients** request; centralized control and backup.' },
  { id: 'f29', front: 'Peer-to-peer model', back: 'Each host is **both** client and server; no dedicated server, but hard to secure and manage at scale.' },
  { id: 'f30', front: 'Why segment IoT endpoints?', back: 'IoT devices are numerous, rarely patched and weakly secured — isolate them in their own **VLAN** and restrict them with ACLs.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which device separates broadcast domains by default?',
    options: ['Hub', 'Layer 2 switch', 'Router', 'Wireless access point'],
    answer: 2,
    difficulty: 1,
    explanation:
      'A **router** does not forward broadcasts between its interfaces, so each interface is its own broadcast domain. A hub repeats everything, a Layer 2 switch floods broadcasts throughout the VLAN, and an AP bridges wireless clients into the same broadcast domain as its wired VLAN.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two capabilities distinguish a next-generation firewall from a traditional stateful firewall? (Choose two.)',
    options: [
      'Application Visibility and Control',
      'URL filtering by category and reputation',
      'Tracking TCP session state',
      'Filtering on IP addresses and port numbers',
      'Network Address Translation',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**AVC** and **URL filtering** are NGFW additions (along with NGIPS and AMP). Session tracking, address/port filtering and NAT are all things a traditional stateful firewall already does, so they do not distinguish an NGFW.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'How is an intrusion detection system (IDS) typically deployed?',
    options: [
      'Inline, so that every packet passes through it',
      'In promiscuous mode, receiving a copy of the traffic',
      'On a wireless LAN controller as a CAPWAP endpoint',
      'Between two hubs to separate collision domains',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'An IDS works in **promiscuous** mode on a copy of the traffic (SPAN or TAP), so it can alert but not block the original packet. Inline deployment describes an IPS. WLCs terminate CAPWAP for APs, and separating collision domains is a switch function.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each component to its description.',
    pairs: [
      { left: 'Wireless LAN controller', right: 'Manages lightweight APs over CAPWAP' },
      { left: 'Cisco Catalyst Center', right: 'On-premises campus controller for automation and assurance' },
      { left: 'Meraki dashboard', right: 'Cloud-hosted management of Meraki devices' },
      { left: 'Autonomous AP', right: 'Configured and managed individually' },
    ],
    difficulty: 1,
    explanation:
      'The WLC controls lightweight APs through CAPWAP tunnels; Catalyst Center (formerly DNA Center) is the on-premises enterprise controller; the Meraki dashboard manages Meraki gear from Cisco\'s cloud; and an autonomous AP carries its own configuration and is managed one by one.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'A Layer 2 switch has 24 PCs connected, all in VLAN 1, and no other connections. How many collision domains does it provide?',
    answers: ['24'],
    placeholder: 'number',
    difficulty: 2,
    explanation:
      'Every switch port is its own collision domain, so 24 connected ports make **24** collision domains. Because all ports are in one VLAN, they still form a single broadcast domain.',
  },
  {
    id: 'q6',
    type: 'categorize',
    stem: 'Classify each device by the highest OSI layer it normally uses to forward traffic.',
    categories: ['Layer 1', 'Layer 2', 'Layer 3'],
    items: [
      { text: 'Hub', category: 0 },
      { text: 'Repeater', category: 0 },
      { text: 'Layer 2 switch', category: 1 },
      { text: 'Wireless access point', category: 1 },
      { text: 'Router', category: 2 },
      { text: 'Multilayer switch', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Hubs and repeaters regenerate bits (Layer 1). Switches and APs forward frames by MAC address (Layer 2) — an AP bridges 802.11 and Ethernet. Routers and multilayer switches forward packets by IP address (Layer 3).',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which statement describes the client-server model?',
    options: [
      'Dedicated servers provide services that many clients request',
      'Every host both requests and provides resources equally',
      'Clients forward packets between subnets for the servers',
      'Servers must be physical machines located on premises',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'In client-server, **dedicated servers** (web, email, DNS, DHCP, file) answer requests from clients. Equal requesting and serving describes peer-to-peer, forwarding between subnets is a router\'s job, and servers are frequently virtual machines or cloud instances rather than physical on-premises boxes.',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. How many collision domains and broadcast domains are shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 14,
        height: 6,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 6.7, y: 0.9 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 2.5, y: 2.8 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.7, y: 2.8 },
          { id: 'hub', icon: 'hub', label: 'Hub1', x: 11.1, y: 2.8 },
          { id: 'a1', icon: 'pc', label: 'A1', x: 0.9, y: 4.9 },
          { id: 'a2', icon: 'pc', label: 'A2', x: 2.5, y: 4.9 },
          { id: 'a3', icon: 'pc', label: 'A3', x: 4.1, y: 4.9 },
          { id: 'b1', icon: 'pc', label: 'B1', x: 5.9, y: 4.9 },
          { id: 'b2', icon: 'pc', label: 'B2', x: 7.5, y: 4.9 },
          { id: 'c1', icon: 'pc', label: 'C1', x: 9.5, y: 4.9 },
          { id: 'c2', icon: 'pc', label: 'C2', x: 11.1, y: 4.9 },
          { id: 'c3', icon: 'pc', label: 'C3', x: 12.7, y: 4.9 },
        ],
        links: [
          { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0' },
          { from: 'r1', to: 'sw2', fromLabel: 'G0/0/1' },
          { from: 'r1', to: 'hub', fromLabel: 'G0/1/0' },
          { from: 'sw1', to: 'a1' },
          { from: 'sw1', to: 'a2' },
          { from: 'sw1', to: 'a3' },
          { from: 'sw2', to: 'b1' },
          { from: 'sw2', to: 'b2' },
          { from: 'hub', to: 'c1' },
          { from: 'hub', to: 'c2' },
          { from: 'hub', to: 'c3' },
        ],
      },
    },
    options: [
      '8 collision domains and 3 broadcast domains',
      '6 collision domains and 3 broadcast domains',
      '11 collision domains and 3 broadcast domains',
      '8 collision domains and 1 broadcast domain',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Each of R1\'s three interfaces is a separate **broadcast domain** (3). Collision domains: SW1 has 3 PC ports plus its uplink to R1 (4), SW2 has 2 PC ports plus its uplink (3), and Hub1 with its PCs and R1 G0/1/0 is a single domain (1) — **8** in total. Six forgets the switch uplinks, eleven counts each hub port separately, and one broadcast domain ignores the router.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 and PC2 connect to SW1, a Layer 2 switch, and no router exists in the network. Which change allows PC1 and PC2 to communicate?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'Layer 2 switch', x: 5, y: 1.1 },
          { id: 'p1', icon: 'pc', label: 'PC1', sub: '10.1.10.11/24', x: 2, y: 3.1 },
          { id: 'p2', icon: 'pc', label: 'PC2', sub: '10.1.20.22/24', x: 8, y: 3.1 },
        ],
        links: [
          { from: 'sw', to: 'p1', toLabel: 'Gi1/0/1' },
          { from: 'sw', to: 'p2', toLabel: 'Gi1/0/2' },
        ],
        groups: [
          { label: 'VLAN 10', x: 0.4, y: 2.2, w: 3.2, h: 1.7 },
          { label: 'VLAN 20', x: 6.4, y: 2.2, w: 3.2, h: 1.7 },
        ],
      },
    },
    options: [
      'Replace SW1 with a Layer 3 switch that has `ip routing` enabled and an SVI in each VLAN',
      'Configure both switch ports as 802.1Q trunks that carry VLAN 10 and VLAN 20',
      'Set both switch ports to full duplex and the same speed so the VLANs can exchange frames',
      'Readdress PC2 into 10.1.10.0/24 while leaving it in VLAN 20 on the same switch',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 10 and VLAN 20 are separate broadcast domains and subnets, so traffic between them must be **routed**. A Layer 3 switch with `ip routing` and an SVI per VLAN acts as each VLAN\'s default gateway. Trunks carry VLANs between switches but do not route, duplex has nothing to do with it, and putting PC2 in PC1\'s subnet while it stays in a different VLAN still leaves no Layer 2 path between them.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements describe an intrusion prevention system deployed inline? (Choose two.)',
    options: [
      'It can drop a malicious packet before the packet reaches its target',
      'It adds some latency and can interrupt traffic if it fails closed',
      'It receives a copy of traffic from a SPAN port',
      'It can only alert after the malicious packet has been delivered',
      'It operates only at Layer 2 and cannot read application data',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Because traffic passes **through** an inline IPS, it can **drop** attacks in real time — at the cost of added latency and the risk of being a point of failure (fail-closed blocks traffic when the sensor fails). Receiving a SPAN copy and alerting after delivery describe an IDS, and IPS inspection reaches up to the application layer.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. FW1 is a stateful firewall with default zone behavior and one added rule: permit TCP 443 from the outside zone to the DMZ web server. Which statement describes how FW1 handles traffic?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'Users', sub: 'inside', x: 1.7, y: 2.3 },
          { id: 'fw', icon: 'firewall', label: 'FW1', x: 5, y: 2.3 },
          { id: 'inet', icon: 'internet', label: 'Internet', sub: 'outside', x: 8.3, y: 2.3 },
          { id: 'web', icon: 'server', label: 'Web server', sub: 'DMZ', x: 5, y: 4.2 },
        ],
        links: [
          { from: 'pc', to: 'fw' },
          { from: 'fw', to: 'inet' },
          { from: 'fw', to: 'web' },
        ],
        groups: [
          { label: 'Inside', x: 0.3, y: 1.1, w: 2.8, h: 2.4 },
          { label: 'Outside', x: 6.9, y: 1.1, w: 2.8, h: 2.4 },
          { label: 'DMZ', x: 3.6, y: 3.5, w: 2.8, h: 1.4 },
        ],
      },
    },
    options: [
      'Replies to web sessions that inside users start toward the Internet are permitted automatically',
      'Internet hosts can start SSH sessions to inside users because inside hosts are trusted',
      'Return traffic to inside users is dropped unless an outside-to-inside rule permits it',
      'Internet hosts can reach the DMZ web server on any TCP port',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A stateful firewall records sessions started from the inside and **automatically permits the matching return traffic**. Traffic *initiated* from the outside is denied unless a rule allows it — so SSH from the Internet to inside hosts is blocked, and the only outside-initiated traffic permitted is TCP 443 to the DMZ server, not every port. No explicit return rule is needed; that requirement describes a stateless ACL.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each next-generation firewall feature to its description.',
    pairs: [
      { left: 'Application Visibility and Control', right: 'Identifies applications regardless of the port they use' },
      { left: 'URL filtering', right: 'Blocks web sites by category and reputation' },
      { left: 'Advanced Malware Protection', right: 'Checks file reputation and alerts retrospectively on malicious files' },
      { left: 'NGIPS', right: 'Inspects permitted traffic for exploits using host context' },
      { left: 'Stateful inspection', right: 'Tracks sessions to permit matching return traffic' },
    ],
    difficulty: 2,
    explanation:
      'AVC recognizes applications at Layer 7; URL filtering enforces web categories and reputation; AMP handles file reputation, sandboxing and retrospective alerts; NGIPS finds exploits with contextual awareness; and stateful inspection — inherited from traditional firewalls — tracks sessions.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Which statement describes Cisco Catalyst Center?',
    options: [
      'An on-premises controller, formerly DNA Center, that provides automation, assurance and REST APIs',
      'A cloud-hosted dashboard that manages Meraki switches, APs and security appliances',
      'A wireless LAN controller that terminates CAPWAP tunnels from lightweight APs and manages their RF',
      'A next-generation firewall that performs URL filtering, AMP malware protection and IPS',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Catalyst Center** (the renamed DNA Center) is Cisco\'s on-premises campus controller for automation, assurance and policy, with REST APIs for external tools. Meraki devices are managed from the Meraki cloud dashboard, CAPWAP tunnels terminate on a WLC, and URL filtering, AMP and IPS are NGFW features.',
  },
  {
    id: 'e7',
    type: 'categorize',
    stem: 'Classify each activity by the plane of a network device that performs it.',
    categories: ['Control plane', 'Data plane', 'Management plane'],
    items: [
      { text: 'OSPF exchanging routing information with a neighbor', category: 0 },
      { text: 'ARP resolving a next-hop MAC address', category: 0 },
      { text: 'STP electing a root bridge', category: 0 },
      { text: 'Forwarding a packet out G0/0/1 after a route lookup', category: 1 },
      { text: 'Dropping a packet that matches an ACL deny entry', category: 1 },
      { text: 'Translating a source address for NAT', category: 1 },
      { text: 'An administrator logging in with SSH', category: 2 },
      { text: 'Sending a syslog message to a server', category: 2 },
      { text: 'An NMS polling the device with SNMP', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Control-plane protocols (OSPF, ARP, STP) build the tables and state that forwarding relies on. Data-plane actions happen to each packet in transit: forwarding, ACL filtering and NAT rewrites. Management-plane protocols (SSH, syslog, SNMP) let people and tools configure and monitor the device.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two functions does a wireless LAN controller perform for lightweight APs? (Choose two.)',
    options: [
      'Automatically tuning AP channels and transmit power (RRM)',
      'Authenticating wireless clients and managing roaming between APs',
      'Supplying Power over Ethernet to the APs through CAPWAP tunnels',
      'Acting as the Internet edge router with NAT for wireless clients',
      'Replacing the need for an 802.11 radio in each lightweight AP',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'A WLC centrally manages RF with **Radio Resource Management** and handles **client authentication and roaming**, plus configuration and security policy. PoE comes from the access switch or an injector, Internet edge routing and NAT belong to a router or firewall, and every AP still needs its own radios.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'A retailer is opening 200 small stores with no local IT staff. It wants each store\'s switches, APs and security appliance managed from a web dashboard with zero-touch provisioning and no controller hardware to buy or maintain. Which solution fits best?',
    options: [
      'Meraki cloud-managed devices with the Meraki dashboard',
      'Autonomous APs configured through each AP\'s web interface',
      'A Catalyst 9800 WLC appliance installed in every store',
      'A Cisco Catalyst Center appliance installed in every store',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The **Meraki** model is built for this: devices ship to the store, connect to the Internet, phone home to the Meraki cloud and pull their configuration, and administrators manage everything from the dashboard with no on-site controller. Autonomous APs mean touching 200+ devices individually and do not cover switches or security appliances. A WLC or Catalyst Center appliance per store adds exactly the hardware the requirement rules out.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Sensor1 receives traffic from a SPAN session on SW1 that mirrors the server port. Which statement about Sensor1 is true?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'inet', icon: 'internet', label: 'Internet', x: 1, y: 1.4 },
          { id: 'r1', icon: 'router', label: 'R1', x: 3.5, y: 1.4 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 6, y: 1.4 },
          { id: 'srv', icon: 'server', label: 'Server', x: 9, y: 1.4 },
          { id: 'sen', icon: 'ips', label: 'Sensor1', x: 6, y: 3.3 },
        ],
        links: [
          { from: 'inet', to: 'r1' },
          { from: 'r1', to: 'sw' },
          { from: 'sw', to: 'srv' },
          { from: 'sw', to: 'sen', label: 'SPAN destination', style: 'dashed', arrow: 'forward' },
        ],
      },
    },
    options: [
      'It works as an IDS: it alerts on malicious traffic but cannot block the original packets',
      'It works as an inline IPS and drops malicious packets before they reach the server',
      'It adds latency because the traffic to the server must pass through the sensor first',
      'If Sensor1 fails, traffic to the server stops until the sensor is replaced or bypassed',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A SPAN destination receives only a **copy** of the traffic, so Sensor1 is deployed in promiscuous (IDS) mode: it detects and alerts, while the original packets continue to the server regardless. Because it is not in the forwarding path it cannot drop packets, adds no latency, and its failure does not affect traffic — those traits belong to an inline IPS.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements describe lightweight access points? (Choose two.)',
    options: [
      'They are managed by a wireless LAN controller',
      'They tunnel control and data traffic to the WLC using CAPWAP',
      'Each one must be configured individually through its own CLI',
      'In local mode they must connect to an 802.1Q trunk port',
      'They cannot be powered by PoE',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Lightweight APs depend on a **WLC** and exchange control and client traffic with it inside **CAPWAP** tunnels. Individual configuration describes autonomous APs. Because client traffic is tunneled, a local-mode lightweight AP needs only an access port, and lightweight APs are commonly powered by PoE.',
  },
  {
    id: 'e12',
    type: 'input',
    stem: 'Which protocol (acronym) do lightweight APs use to build tunnels to a wireless LAN controller?',
    answers: ['CAPWAP'],
    placeholder: 'acronym',
    difficulty: 1,
    explanation:
      '**CAPWAP** (Control and Provisioning of Wireless Access Points) carries control messages on UDP 5246 (DTLS-encrypted) and client data on UDP 5247 between the AP and the WLC.',
  },
  {
    id: 'e13',
    type: 'categorize',
    stem: 'Classify each scenario as client-server or peer-to-peer.',
    categories: ['Client-server', 'Peer-to-peer'],
    items: [
      { text: 'Employees open documents stored on a central file server', category: 0 },
      { text: 'A DHCP server assigns addresses to every PC', category: 0 },
      { text: 'A browser loads a page from the company web server', category: 0 },
      { text: 'Two coworkers share a folder directly from their own PCs', category: 1 },
      { text: 'A file-sharing app downloads pieces of a file from many other users', category: 1 },
      { text: 'Every host both requests and serves resources with no dedicated server', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'When a dedicated server answers requests (file, DHCP, web), the model is client-server. When ordinary hosts both consume and provide resources — direct folder sharing or swarming file-sharing apps — the model is peer-to-peer.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. What can be concluded about DSW1?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show running-config | include ip routing
ip routing
DSW1# show ip interface brief | include Vlan
Vlan1                  unassigned      YES NVRAM  administratively down down
Vlan10                 10.1.10.1       YES manual up                    up
Vlan20                 10.1.20.1       YES manual up                    up`,
    },
    options: [
      'DSW1 is a multilayer switch that can route between VLAN 10 and VLAN 20',
      'DSW1 is a Layer 2 switch; its SVIs are only used for management access',
      'DSW1 needs an external router-on-a-stick to route between VLANs 10 and 20',
      'All ports on DSW1 belong to one broadcast domain',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'With **`ip routing`** enabled and up/up **SVIs** in VLAN 10 and VLAN 20, DSW1 is a Layer 3 switch acting as the default gateway for both VLANs and routing between them in hardware. A Layer 2 switch would not have routing enabled (it would use a single management SVI), no external router is required, and VLANs 10 and 20 are separate broadcast domains.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Which action is performed by the control plane of a router?',
    options: [
      'Exchanging OSPF LSAs with neighbors to build the routing table',
      'Decrementing the TTL and forwarding a packet out an interface',
      'Encapsulating a packet in a new Ethernet frame for the next hop',
      'Dropping a packet that matches an ACL deny statement',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Routing protocols such as **OSPF** are control-plane functions: they build the routing table the data plane uses. Decrementing the TTL, re-encapsulating the packet and ACL drops all happen to individual packets in transit, which is data-plane work.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each device to the role it usually plays in an enterprise network.',
    pairs: [
      { left: 'WAN edge router', right: 'Connects the site to the ISP and often performs NAT' },
      { left: 'Layer 3 switch', right: 'Routes between VLANs using SVIs at the distribution layer' },
      { left: 'Layer 2 access switch', right: 'Connects endpoints and supplies PoE' },
      { left: 'Next-generation firewall', right: 'Enforces application-aware policy between security zones' },
      { left: 'Wireless LAN controller', right: 'Centrally manages lightweight access points' },
    ],
    difficulty: 2,
    explanation:
      'Edge routers connect to providers and translate addresses; Layer 3 switches route between VLANs at the distribution layer; access switches connect and power endpoints; NGFWs enforce application-aware policy between zones; and WLCs manage lightweight APs.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. An engineer replaces Hub1 with a Layer 2 switch and changes nothing else. Which two results occur? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 0.9 },
          { id: 'hub', icon: 'hub', label: 'Hub1', x: 5, y: 2.5, tone: 'warn' },
          { id: 'p1', icon: 'pc', label: 'PC1', x: 1.5, y: 4.2 },
          { id: 'p2', icon: 'pc', label: 'PC2', x: 3.8, y: 4.2 },
          { id: 'p3', icon: 'pc', label: 'PC3', x: 6.2, y: 4.2 },
          { id: 'p4', icon: 'pc', label: 'PC4', x: 8.5, y: 4.2 },
        ],
        links: [
          { from: 'r1', to: 'hub', fromLabel: 'G0/0/0' },
          { from: 'hub', to: 'p1' },
          { from: 'hub', to: 'p2' },
          { from: 'hub', to: 'p3' },
          { from: 'hub', to: 'p4' },
        ],
      },
    },
    options: [
      'The number of collision domains increases',
      'The PCs and switch ports can operate in full duplex',
      'The number of broadcast domains increases',
      'Broadcasts sent by PC1 no longer reach PC2',
      'The PCs must be configured with a new default gateway',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'The hub segment was one collision domain; with a switch, each of the five ports (four PCs plus the router uplink) is its own, so collision domains **increase** from 1 to 5, and point-to-point switch links allow **full duplex**. A Layer 2 switch still floods broadcasts within the VLAN, so there is still one broadcast domain and PC2 still receives PC1\'s broadcasts. Nothing about IP addressing or the gateway changes.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Sensor-A raised an alert for an SQL injection attempt against a web server, yet the attack reached the server and succeeded. What explains this?',
    exhibit: {
      kind: 'table',
      columns: ['Sensor', 'Deployment', 'Traffic source', 'Action on signature match'],
      rows: [['Sensor-A', 'Promiscuous', 'SPAN copy of the server VLAN', 'Generate alert']],
    },
    options: [
      'Sensor-A only sees a copy of the traffic, so it cannot drop the original malicious packets',
      'Sensor-A must have been missing the SQL injection signature',
      'Sensor-A was deployed inline, and inline sensors cannot block attacks',
      'SPAN sessions forward traffic to the server only after the sensor approves it',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'In **promiscuous** mode the sensor analyzes a SPAN copy; the original packets are already on their way to the server, so the sensor can only alert (an **IDS** role). It clearly had the signature, because it raised the alert. The table shows promiscuous, not inline, deployment — and inline sensors are exactly the ones that *can* block. SPAN never holds traffic waiting for approval.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'An IPS drops traffic from a legitimate payroll application because the traffic matched an attack signature. What is this condition called?',
    options: ['False positive', 'False negative', 'True positive', 'Zero-day attack'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Benign traffic identified as malicious is a **false positive**. A false negative is a real attack that goes undetected, a true positive is a correctly detected attack, and a zero-day is a new attack for which no signature exists yet.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'A company must block employees from reaching gambling web sites, including sites registered yesterday that no administrator has listed yet. Which capability meets this requirement?',
    options: [
      'NGFW URL filtering based on category and reputation, updated by vendor threat intelligence',
      'A stateful firewall rule that denies outbound TCP 80 and 443 to any Internet destination',
      'An extended ACL on the edge router listing the IP addresses of known gambling sites',
      'An IDS on a SPAN port that alerts the administrator when users visit gambling sites',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**URL filtering** classifies sites into categories and reputation scores from continuously updated threat intelligence, so newly registered gambling sites are blocked without anyone listing them. Denying all web traffic blocks far too much, a hand-maintained ACL of IP addresses misses new sites (and sites move), and an IDS on a copy of traffic can only alert — it cannot block.',
  },
  {
    id: 'e21',
    type: 'order',
    stem: 'Put the events in order as a stateful firewall handles a web session started by an inside user.',
    items: [
      'An inside host sends a TCP SYN to an Internet web server',
      'The firewall checks its policy, permits the connection and creates a state-table entry',
      'The web server\'s SYN-ACK arrives on the outside interface',
      'The firewall matches the reply to the state entry and permits it',
      'The session closes and the firewall removes the state entry',
    ],
    difficulty: 2,
    explanation:
      'The first packet of a session is checked against policy; if permitted, the firewall records the session. Replies arriving from the outside are allowed only because they match that **state entry**, and the entry is removed when the session ends (or times out) — so later unsolicited outside traffic is denied again.',
  },
];
