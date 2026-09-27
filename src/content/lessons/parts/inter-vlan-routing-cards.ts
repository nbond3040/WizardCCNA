import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Why is inter-VLAN routing needed?', back: 'Each VLAN is its own broadcast domain and subnet, and switches never forward frames between VLANs, so the traffic must be routed.' },
  { id: 'f2', front: 'Three inter-VLAN routing designs', back: 'Legacy (one router interface per VLAN), router-on-a-stick (trunk + subinterfaces) and Layer 3 switch (SVIs).' },
  { id: 'f3', front: 'Router-on-a-stick (ROAS)', back: 'One router interface connected to a switch trunk and split into one subinterface per VLAN.' },
  { id: 'f4', front: 'Create the VLAN 10 subinterface on G0/0/0', back: '`interface g0/0/0.10`, then `encapsulation dot1Q 10` and `ip address ...`.' },
  { id: 'f5', front: 'Must the subinterface number match the VLAN ID?', back: 'No. Only `encapsulation dot1Q <vlan>` decides the VLAN; matching the numbers is just a convention.' },
  { id: 'f6', front: 'Native VLAN on a ROAS subinterface', back: '`encapsulation dot1Q 99 native` (alternatively, put the native VLAN address on the physical interface).' },
  { id: 'f7', front: 'Command order on a subinterface', back: '`encapsulation dot1Q` first, then `ip address`; IOS rejects the address otherwise.' },
  { id: 'f8', front: 'Switch port facing a ROAS router', back: 'A static trunk (`switchport mode trunk`), because routers do not run DTP; allow every routed VLAN and match the native VLAN.' },
  { id: 'f9', front: 'ROAS physical interface', back: 'Needs `no shutdown` and usually no IP address; its subinterfaces go down if it goes down.' },
  { id: 'f10', front: 'Host default gateway with ROAS', back: 'The IP address of the router subinterface for the host\'s own VLAN.' },
  { id: 'f11', front: 'SVI', back: 'Switch virtual interface: a Layer 3 interface for a VLAN, such as `interface vlan 10`, used as that VLAN\'s gateway.' },
  { id: 'f12', front: 'Enable routing on a Catalyst 3560', back: '`ip routing` in global configuration mode; it is disabled by default.' },
  { id: 'f13', front: 'Three conditions for an SVI to be up/up', back: 'The VLAN exists, the SVI is not shut down, and at least one port in the VLAN is up and STP-forwarding.' },
  { id: 'f14', front: 'Does `interface vlan 30` create VLAN 30?', back: 'No. Create the VLAN separately with `vlan 30` (or learn it through VTP).' },
  { id: 'f15', front: 'SVI shows administratively down / down', back: 'The SVI is shut down; fix it with `no shutdown`.' },
  { id: 'f16', front: 'SVI shows up / down', back: 'The VLAN exists but no port in it is up and forwarding.' },
  { id: 'f17', front: 'Routed port', back: 'A multilayer switch port converted with `no switchport`; it takes an IP address and belongs to no VLAN.' },
  { id: 'f18', front: '"% IP addresses may not be configured on L2 links."', back: 'The port is still a switchport: enter `no switchport` first.' },
  { id: 'f19', front: 'Routed port in `show interfaces status`', back: 'The Vlan column shows `routed`.' },
  { id: 'f20', front: 'Main drawback of legacy inter-VLAN routing', back: 'One router interface and one switch port per VLAN, so it does not scale.' },
  { id: 'f21', front: 'Router-on-a-stick drawbacks', back: 'All inter-VLAN traffic hairpins over one link, and the router and that link are single points of failure.' },
  { id: 'f22', front: 'Layer 3 switch advantage', back: 'Routes between VLANs in hardware at wire speed, with no external link bottleneck.' },
  { id: 'f23', front: 'Routes added by a ROAS subinterface', back: 'A connected (`C`) route for its subnet and a local (`L`) /32 route for its own address.' },
  { id: 'f24', front: 'Symptom of a wrong `encapsulation dot1Q` VLAN', back: 'Hosts in the intended VLAN cannot reach their gateway, while the other VLANs work.' },
  { id: 'f25', front: 'One host cannot leave its subnet, but its neighbors can', back: 'Check that host\'s default gateway first.' },
  { id: 'f26', front: '`show ip route` on a switch with routing disabled', back: 'Shows "Default gateway is not set" instead of a routing table; the fix is `ip routing`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Why must traffic between two VLANs pass through a Layer 3 device?',
    options: [
      'Each VLAN is a separate broadcast domain and IP subnet',
      'Switches cannot forward unicast frames',
      'Trunks drop frames that travel between VLANs',
      'VLAN IDs must be translated by NAT',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'VLANs are separate broadcast domains, each with its own subnet, and a switch never forwards a frame from one VLAN into another, so a router or Layer 3 switch must route between them. Switches forward unicast frames all the time, trunks carry many VLANs without dropping them, and NAT has nothing to do with VLAN IDs.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which subinterface command binds G0/0/0.20 to VLAN 20?',
    options: ['`encapsulation dot1Q 20`', '`switchport access vlan 20`', '`vlan 20`', '`ip vlan 20`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`encapsulation dot1Q 20` tells the router which 802.1Q VLAN tag belongs to the subinterface. `switchport access vlan` is a switch command, `vlan 20` creates a VLAN on a switch, and `ip vlan` is not a valid IOS command.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two items are required for router-on-a-stick to route between VLANs 10 and 20? (Choose two.)',
    options: [
      'The switch port connected to the router is an 802.1Q trunk',
      'Each VLAN has a router subinterface with a matching `encapsulation dot1Q` command',
      'The router runs a dynamic routing protocol',
      'Each VLAN has its own physical router interface',
      '`ip routing` is enabled on the access switch',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The link must be a **trunk**, and each VLAN needs a **subinterface** tagged for it. The subnets are directly connected, so no routing protocol is needed; one physical interface per VLAN describes the legacy design; and the access switch only switches frames, so it does not need `ip routing`.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'An engineer types `interface gigabitethernet0/0/0.10` in global configuration mode on R1. Which prompt appears next?',
    answers: ['R1(config-subif)#', '(config-subif)#', 'config-subif'],
    placeholder: 'prompt',
    difficulty: 1,
    explanation:
      'Subinterfaces have their own configuration mode, shown as **R1(config-subif)#**. A physical interface would show `(config-if)#` instead, which is a quick way to confirm you are configuring the right thing.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'Which interface command converts a multilayer switch port into a routed port?',
    options: ['`no switchport`', '`switchport mode routed`', '`ip routing`', '`switchport mode access`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`no switchport` turns the port into a Layer 3 routed port that can take an IP address. `switchport mode routed` does not exist, `ip routing` is a global command that enables routing, and `switchport mode access` keeps the port at Layer 2.',
  },
  {
    id: 'q6',
    type: 'categorize',
    stem: 'Classify each situation by its effect on the SVI for that VLAN.',
    categories: ['SVI can be up/up', 'SVI stays down'],
    items: [
      { text: 'The VLAN exists and an access port in it is connected', category: 0 },
      { text: 'The VLAN exists and its only port is a trunk forwarding that VLAN', category: 0 },
      { text: 'The SVI is administratively shut down', category: 1 },
      { text: 'The VLAN was never created', category: 1 },
      { text: 'The VLAN exists but every port in it is disconnected', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'An SVI needs an existing VLAN, `no shutdown`, and at least one up, forwarding port in the VLAN; a trunk that carries the VLAN counts. A shutdown SVI, a missing VLAN or a VLAN with no live ports all keep it down.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'PC1 in VLAN 10 can ping other VLAN 10 hosts but cannot reach VLAN 20. Other VLAN 10 hosts reach VLAN 20 without problems. What is the most likely cause?',
    options: [
      'PC1 has a wrong default gateway',
      'The trunk does not allow VLAN 20',
      'The router subinterface for VLAN 20 has the wrong encapsulation',
      '`ip routing` is disabled on the Layer 3 switch',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Only PC1 fails, so the network path works; the difference must be on PC1, most likely its **default gateway**. A trunk, subinterface or `ip routing` problem would affect every VLAN 10 host, not just one.',
  },
];
