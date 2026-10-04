import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Data plane', back: 'Forwards each frame or packet, in hardware, using the tables the control plane built: MAC and IP lookups, NAT, ACLs, QoS marking.' },
  { id: 'f2', front: 'Control plane', back: 'Builds the tables the data plane uses: routing protocols (OSPF, EIGRP, BGP), STP, ARP and MAC learning.' },
  { id: 'f3', front: 'Management plane', back: 'How people and tools configure and monitor a device: SSH, Telnet, SNMP, syslog, NETCONF and REST APIs.' },
  { id: 'f4', front: 'Traditional vs controller-based control plane', back: 'Traditional: **distributed**, each device runs its own control plane and is configured box by box. Controller-based: a central controller with a global view automates the devices.' },
  { id: 'f5', front: 'Pure SDN vs the Cisco approach', back: 'Pure SDN (OpenFlow) centralizes the control plane in the controller. Cisco solutions are usually hybrid: devices keep some control plane and the controller is **not in the data path**.' },
  { id: 'f6', front: 'The three SDN layers', back: '**Application** layer (apps), **control** layer (SDN controller), **infrastructure** layer (network devices).' },
  { id: 'f7', front: 'Northbound API (NBI)', back: 'Between applications and the controller; typically **REST over HTTPS with JSON**.' },
  { id: 'f8', front: 'Southbound API (SBI)', back: 'Between the controller and network devices: NETCONF, RESTCONF, OpenFlow, OpFlex, SSH/CLI and SNMP.' },
  { id: 'f9', front: 'NETCONF', back: 'XML over **SSH, TCP 830**; manages YANG-modeled data with get-config, edit-config and commit.' },
  { id: 'f10', front: 'RESTCONF', back: 'HTTP access to YANG data over **HTTPS (TCP 443)** using GET, POST, PUT, PATCH and DELETE with JSON or XML. Southbound despite the name.' },
  { id: 'f11', front: 'OpenFlow', back: 'ONF protocol where the controller installs **match-action flow entries** in switches (imperative, pure SDN). TCP 6653.' },
  { id: 'f12', front: 'OpFlex', back: 'Cisco **declarative** southbound protocol (ACI): the controller sends policy, the devices decide how to implement it.' },
  { id: 'f13', front: 'Legacy southbound methods', back: 'CLI over SSH or Telnet, and SNMP (UDP 161 queries, UDP 162 traps). Catalyst Center still uses them for many devices.' },
  { id: 'f14', front: 'Underlay', back: 'The physical network and IP routing that provide reachability between fabric nodes.' },
  { id: 'f15', front: 'Overlay', back: 'A virtual network of tunnels (for example VXLAN) built on the underlay that carries endpoint traffic and enables segmentation.' },
  { id: 'f16', front: 'Fabric', back: 'The whole domain, underlay plus overlay, managed as one logical network.' },
  { id: 'f17', front: 'VXLAN', back: 'MAC-in-UDP encapsulation: **UDP 4789**, 24-bit VNI (about 16.7 million segments), about 50 bytes of overhead. The SD-Access data plane.' },
  { id: 'f18', front: 'LISP in SD-Access', back: 'The **control plane**: maps endpoint IDs (EIDs) to locations (RLOCs, the edge node addresses) through the control plane node.' },
  { id: 'f19', front: 'SD-Access policy plane', back: 'Cisco **TrustSec** security group tags (SGTs), carried in the VXLAN header, give group-based policy; identity comes from ISE.' },
  { id: 'f20', front: 'Fabric edge node', back: 'Connects endpoints (wired clients, APs); VXLAN ingress and egress; registers endpoints with the control plane node.' },
  { id: 'f21', front: 'Fabric border node', back: 'Connects the fabric to **external networks**: WAN, data center or Internet.' },
  { id: 'f22', front: 'Fabric control plane node', back: 'Runs the LISP map server and resolver; tracks which edge node each endpoint is behind.' },
  { id: 'f23', front: 'Intermediate node', back: 'Underlay-only switch that routes IP between fabric nodes; it takes no part in the overlay.' },
  { id: 'f24', front: 'Cisco Catalyst Center', back: 'Formerly **Cisco DNA Center**: the controller for design, policy, provisioning and assurance of campus and branch networks. Not in the data path.' },
  { id: 'f25', front: 'Catalyst Center workflow areas', back: '**Design, Policy, Provision, Assurance** (plus Platform for APIs and integrations).' },
  { id: 'f26', front: 'Plug and Play discovery methods', back: '**DHCP option 43**, a DNS name such as pnpserver.example.com, or Cisco Plug and Play Connect cloud redirection.' },
  { id: 'f27', front: 'SWIM and templates', back: '**SWIM** manages golden software images and upgrades; **templates** push reusable configuration with variables.' },
  { id: 'f28', front: 'Assurance and Path Trace', back: 'Assurance turns telemetry into health scores and issues; Path Trace shows the hop-by-hop path, including ACL results, between two endpoints.' },
  { id: 'f29', front: 'Cisco SD-WAN components', back: 'SD-WAN **Manager** (vManage, management), **Controller** (vSmart, control), **Validator** (vBond, orchestration), **WAN Edge** (vEdge or cEdge, data).' },
  { id: 'f30', front: 'OMP and application-aware routing', back: 'OMP, the Overlay Management Protocol, lets the SD-WAN Controller distribute routes, policy and keys; policy can steer each application over the best transport.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which plane builds the routing table by running protocols such as OSPF?',
    options: ['Data plane', 'Control plane', 'Management plane', 'Application plane'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Routing protocols belong to the **control plane**, which builds the tables. The data plane uses those tables to forward packets, and the management plane (SSH, SNMP) is how you configure and monitor the device. There is no application plane.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: "Which two technologies are used on a controller's southbound interface? (Choose two.)",
    options: [
      'NETCONF',
      'An application calling the controller through a REST API',
      'OpenFlow',
      'A dashboard reading controller data over HTTPS and JSON',
      'A web browser session to an application server',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'NETCONF and OpenFlow carry configuration and flow rules from the controller to devices, which is southbound. REST calls and dashboards using HTTPS and JSON are applications talking to the controller, which is northbound.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'Which SD-Access node type connects the fabric to external networks such as the WAN?',
    options: ['Edge node', 'Intermediate node', 'Control plane node', 'Border node'],
    answer: 3,
    difficulty: 1,
    explanation:
      'Border nodes link the fabric to outside networks. Edge nodes connect endpoints, the control plane node tracks endpoint locations with LISP, and intermediate nodes only route underlay IP traffic.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each term with its description.',
    pairs: [
      { left: 'Underlay', right: 'Physical network and IP routing between fabric nodes' },
      { left: 'Overlay', right: 'Virtual tunnels built on top of the underlay' },
      { left: 'Fabric', right: 'Underlay plus overlay managed as one system' },
      { left: 'Northbound API', right: 'Connects applications to the controller' },
    ],
    difficulty: 1,
    explanation:
      'The underlay is the physical IP network, the overlay is the tunneled virtual network, the fabric is both together, and the northbound API faces the applications that use the controller.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'Which protocol (acronym) provides the control plane of the Cisco SD-Access fabric?',
    answers: ['LISP'],
    placeholder: 'Acronym',
    difficulty: 1,
    explanation:
      '**LISP** maps endpoint identifiers to the locations of the edge nodes behind which they sit. VXLAN is the data plane and Cisco TrustSec provides policy.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which Catalyst Center feature lets a new switch obtain its configuration automatically when it is connected and powered on?',
    options: ['Command Runner', 'Plug and Play', 'Assurance', 'Intent API'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Plug and Play provides zero-touch onboarding with a day-0 configuration. Command Runner sends read-only commands to devices, Assurance monitors health, and the Intent API is the northbound REST interface.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'In Cisco SD-WAN, which component runs the Overlay Management Protocol (OMP) and acts as the control plane?',
    options: ['SD-WAN Controller (vSmart)', 'SD-WAN Manager (vManage)', 'SD-WAN Validator (vBond)', 'WAN Edge router'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The SD-WAN Controller distributes routes, policy and keys using OMP. The Manager is the management plane, the Validator authenticates devices and orchestrates onboarding, and the WAN Edge forwards user traffic.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Which is a benefit of Catalyst Center compared with traditional box-by-box management?',
    options: [
      'It forwards user traffic faster than the switch hardware can',
      'It replaces the routing protocols that run on the switches',
      'It pushes consistent configuration to many devices from templates',
      'It removes the need for credentials on the devices it manages',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Centralized templates and workflows give consistency and speed. Catalyst Center is not in the data path, does not replace routing protocols, and still needs credentials or other trust to manage devices.',
  },
];
