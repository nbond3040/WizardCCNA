import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement describes router-on-a-stick?',
    options: [
      'A single trunked router interface with one subinterface per VLAN',
      'One router interface per VLAN, each connected to an access port',
      'A Layer 3 switch that routes between VLANs using its SVIs',
      'A router that learns the VLAN database from the switch through VTP',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Router-on-a-stick uses **one trunk link** and a **subinterface per VLAN**. One interface per VLAN is the legacy design, routing between SVIs is the Layer 3 switch design, and routers do not take part in VTP.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts in VLAN 20 (192.168.20.0/24) cannot ping their default gateway, 192.168.20.1, while VLAN 10 hosts work. The switch trunk allows VLANs 10 and 20. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section interface GigabitEthernet0/0/0
interface GigabitEthernet0/0/0
 no ip address
 negotiation auto
interface GigabitEthernet0/0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0/0.20
 encapsulation dot1Q 30
 ip address 192.168.20.1 255.255.255.0`,
    },
    options: [
      'Subinterface G0/0/0.20 is tagged for VLAN 30 instead of VLAN 20',
      'The subinterfaces must be renumbered to match their subnets',
      'The physical interface needs an IP address in VLAN 20',
      'The `native` keyword is missing from G0/0/0.20',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The VLAN is decided by `encapsulation dot1Q`, not by the subinterface number. G0/0/0.20 listens for **VLAN 30** tags, so VLAN 20 frames, including ARP requests for 192.168.20.1, are never processed; `encapsulation dot1Q 20` fixes it. Subinterface numbers are labels only, the physical interface correctly has no address, and VLAN 20 is not the native VLAN, so `native` would be wrong.',
  },
  {
    id: 'e3',
    type: 'order',
    stem: 'Put the steps in order to add a VLAN 10 gateway subinterface on R1 and verify it, starting in global configuration mode.',
    items: [
      '`interface gigabitethernet0/0/0.10`',
      '`encapsulation dot1Q 10`',
      '`ip address 192.168.10.1 255.255.255.0`',
      '`end`',
      '`show ip interface brief`',
    ],
    difficulty: 2,
    explanation:
      'The subinterface must exist before it can be configured, and IOS only accepts an IP address on a subinterface **after** its `encapsulation dot1Q` command. `end` returns to privileged EXEC, where `show ip interface brief` runs without the `do` prefix.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Which three conditions must be true for interface Vlan20 on a Layer 3 switch to be up/up? (Choose three.)',
    options: [
      'VLAN 20 exists in the VLAN database',
      'At least one port in VLAN 20 (access or trunk) is up and forwarding',
      'Interface Vlan20 is not administratively shut down',
      '`ip routing` is enabled in global configuration',
      'A routed port is configured with `no switchport`',
      'The switch is configured in VTP transparent mode',
    ],
    answers: [0, 1, 2],
    difficulty: 2,
    explanation:
      'An SVI follows its VLAN: the **VLAN must exist**, the **SVI must not be shut down**, and at least one **port in the VLAN must be up and forwarding**. `ip routing` controls whether the switch routes between SVIs, not whether they come up; routed ports are unrelated to SVI state; and the VTP mode does not matter.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. DSW1 has SVIs for VLANs 10 and 20, and both are up/up. Hosts can ping their own gateway SVI but cannot reach hosts in the other VLAN. Which command fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show ip route
Default gateway is not set

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty`,
    },
    options: [
      '`ip routing`',
      '`no switchport` under interface Vlan10 and interface Vlan20',
      '`ip default-gateway 192.168.10.1`',
      '`switchport mode trunk` on the host ports',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The output is what a switch prints when **IP routing is disabled**: no routing table, just a default gateway setting and the ICMP redirect cache. `ip routing` enables routing between the SVIs. SVIs never take `no switchport`, `ip default-gateway` only serves the switch\'s own traffic when routing is off, and making host ports trunks would break the hosts.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. The engineer configured interface Vlan30 with an IP address and `no shutdown`. What must be done to bring the SVI up?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show ip interface brief | include Vlan30
Vlan30                 192.168.30.1    YES manual down                  down
DSW1# show vlan id 30
VLAN id 30 not found in current VLAN database`,
    },
    options: [
      'Create VLAN 30 and make sure at least one port in it is up',
      'Bounce interface Vlan30 with `shutdown` and `no shutdown`',
      'Enable `ip routing` in global configuration mode on DSW1',
      'Enter `no switchport` on interface Vlan30 to make it routed',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`interface vlan 30` does not create VLAN 30, and the exhibit confirms the VLAN is missing. Create it with `vlan 30` and give it an active port. The status is `down`, not `administratively down`, so the SVI is not shut down; `ip routing` does not affect SVI state; and `no switchport` is not valid on an SVI.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each design element to its description.',
    pairs: [
      { left: 'Legacy inter-VLAN routing', right: 'One router physical interface per VLAN' },
      { left: 'Router-on-a-stick', right: 'One 802.1Q trunk to a router with a subinterface per VLAN' },
      { left: 'Layer 3 switch with SVIs', right: 'Routing between VLAN interfaces inside the switch hardware' },
      { left: 'Routed port', right: 'A switch port converted with `no switchport` and given an IP address' },
    ],
    difficulty: 2,
    explanation:
      'The legacy design dedicates a physical router interface to each VLAN; router-on-a-stick multiplexes VLANs over one trunk with subinterfaces; a Layer 3 switch routes internally between SVIs; and a routed port is a physical switch port turned into a Layer 3 interface, typically for uplinks.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'Which subinterface command makes G0/0/0.99 handle the untagged frames of native VLAN 99? Enter the full command.',
    answers: ['encapsulation dot1q 99 native', 'encap dot1q 99 native'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`encapsulation dot1Q 99 native` binds the subinterface to VLAN 99 and marks it as the native VLAN, so untagged frames arriving on the trunk are processed there. It must match `switchport trunk native vlan 99` on the switch. The alternative is to configure the native VLAN address on the physical interface itself.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. PC2 can ping PC3 but cannot reach PC1. PC3 can reach PC1. What is the cause?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0.10 .10.1, G0/0/0.20 .20.1', x: 5, y: 0.8 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.4 },
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'VLAN 10, 192.168.10.11, gw 192.168.10.1', x: 1.5, y: 4.1 },
          { id: 'pc2', icon: 'pc', label: 'PC2', sub: 'VLAN 20, 192.168.20.12, gw 192.168.10.1', x: 5, y: 4.1, tone: 'bad' },
          { id: 'pc3', icon: 'pc', label: 'PC3', sub: 'VLAN 20, 192.168.20.13, gw 192.168.20.1', x: 8.5, y: 4.1 },
        ],
        links: [
          { from: 'r1', to: 'sw', label: '802.1Q trunk', fromLabel: 'G0/0/0', toLabel: 'Gi0/1' },
          { from: 'sw', to: 'pc1', fromLabel: 'Fa0/1' },
          { from: 'sw', to: 'pc2', fromLabel: 'Fa0/2' },
          { from: 'sw', to: 'pc3', fromLabel: 'Fa0/3' },
        ],
      },
    },
    options: [
      'PC2 is configured with the wrong default gateway',
      'The trunk does not allow VLAN 20',
      'Subinterface G0/0/0.20 has the wrong encapsulation',
      'SW1 needs `ip routing`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'PC2\'s gateway, 192.168.10.1, is not in its own subnet (192.168.20.0/24), so PC2 cannot send traffic off-subnet; it must use **192.168.20.1**. PC3, in the same VLAN, reaches PC1, which proves that the trunk carries VLAN 20, that G0/0/0.20 is tagged correctly and that routing works. SW1 is a Layer 2 switch in a router-on-a-stick design and needs no `ip routing`.',
  },
  {
    id: 'e10',
    type: 'multi',
    stem: 'Which two statements about router-on-a-stick are true? (Choose two.)',
    options: [
      'The switch port connected to the router must be a trunk',
      'Each VLAN uses a subinterface with an `encapsulation dot1Q` command',
      'The subinterface number must match the VLAN ID it routes',
      'The router negotiates the trunk with the switch using DTP',
      'Each VLAN requires its own physical interface on the router',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The switch side is a **trunk** and each VLAN gets a **subinterface** with its own `encapsulation dot1Q`. Subinterface numbers are labels that merely conventionally match the VLAN, routers do not run DTP (so the switch port must be a static trunk), and one physical interface per VLAN describes the legacy design.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which global configuration command must be entered on a Catalyst 3560 before it routes packets between its SVIs?',
    answers: ['ip routing'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip routing` enables IPv4 routing on a multilayer switch; it is disabled by default on the 3560. Without it the SVIs still come up, but the switch acts like a host in each VLAN and does not route between them.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. What must the engineer do so that the subinterface accepts the address?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# interface gigabitethernet0/0/0.30
R1(config-subif)# ip address 192.168.30.1 255.255.255.0
% Configuring IP routing on a LAN subinterface is only allowed if that subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q, or ISL vLAN.`,
    },
    options: [
      'Enter `encapsulation dot1Q 30` on the subinterface first',
      'Enter `no shutdown` on the subinterface first',
      'Enable `ip routing` in global configuration mode',
      'Configure `switchport mode trunk` on G0/0/0',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS requires a subinterface to be assigned to a VLAN with `encapsulation dot1Q` **before** it accepts an IP address, which is exactly what the message says. The subinterface is not shut down, routers route by default so `ip routing` is not the issue, and `switchport` commands do not exist on a router interface.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'On a Layer 3 switch, which interface acts as the default gateway for hosts in VLAN 10?',
    options: [
      '`interface vlan 10`',
      '`interface gigabitethernet0/0/0.10`',
      'A routed port configured with `no switchport`',
      'The trunk port that carries the native VLAN',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'On a Layer 3 switch the VLAN\'s gateway is its **SVI**, `interface vlan 10`. A dotted subinterface is the router-on-a-stick equivalent on a router, a routed port belongs to no VLAN, and a trunk port is a Layer 2 interface with no gateway address.',
  },
  {
    id: 'e14',
    type: 'categorize',
    stem: 'In a router-on-a-stick design, classify each command by the device on which it is configured.',
    categories: ['Router R1', 'Access switch SW1'],
    items: [
      { text: '`interface gigabitethernet0/0/0.10`', category: 0 },
      { text: '`encapsulation dot1Q 10`', category: 0 },
      { text: '`encapsulation dot1Q 99 native`', category: 0 },
      { text: '`switchport mode trunk`', category: 1 },
      { text: '`switchport trunk native vlan 99`', category: 1 },
      { text: '`switchport access vlan 10`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'The router uses subinterfaces with `encapsulation dot1Q` (including the `native` form). The switch uses `switchport` commands: a static trunk toward the router with the matching native VLAN, and access ports for the hosts. Note that both devices must agree on the native VLAN, set with a different command on each.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. SW1 Gi0/1 connects to R1, which routes VLANs 10, 20 and 99 with subinterfaces. VLAN 20 exists on SW1, but hosts in VLAN 20 cannot ping their gateway, 192.168.20.1. Which command fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,99

Port        Vlans allowed and active in management domain
Gi0/1       10,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,99`,
    },
    options: [
      '`switchport trunk allowed vlan add 20` on SW1 Gi0/1',
      '`encapsulation dot1Q 20` on interface R1 G0/0/0',
      '`switchport access vlan 20` on SW1 Gi0/1 toward R1',
      '`ip routing` in global configuration on SW1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 20 is missing from **Vlans allowed on trunk**, so SW1 never sends VLAN 20 frames to R1. Adding it with `add` keeps VLANs 10 and 99. Encapsulation belongs on the subinterface G0/0/0.20, not on the physical interface; making Gi0/1 an access port would break the trunk; and SW1 is a Layer 2 switch, so `ip routing` is irrelevant.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route | begin Gateway
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.0/24 is directly connected, GigabitEthernet0/0/0.10
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0/0.10
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/0/0.20
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0/0.20`,
    },
    options: [
      'R1 can route between 192.168.10.0/24 and 192.168.20.0/24 without any static or dynamic routes',
      'R1 needs a static route to each VLAN subnet before inter-VLAN routing works',
      'The L entries are the subnets where the hosts reside',
      'R1 routes these VLANs only if a routing protocol is enabled on the subinterfaces',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Both VLAN subnets are **directly connected** through the subinterfaces, so R1 already knows how to route between them; no static or dynamic routes are needed. The `L` entries are R1\'s own /32 interface addresses, while the host subnets are the `C` entries. Routing protocols matter only for subnets that are not directly connected.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which configuration is required on the switch port that connects to a router-on-a-stick router?',
    options: ['`switchport mode trunk`', '`switchport mode dynamic auto`', '`switchport mode access`', '`no switchport`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The link carries several VLANs, so the switch port must be a **static trunk**; routers do not run DTP, so dynamic auto would never form a trunk. An access port carries a single VLAN, and `no switchport` would make the port a routed port that cannot carry VLAN tags.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'An engineer replaces router-on-a-stick with a Catalyst 3560 for VLANs 10 and 20, which already exist on it. Which two actions are required on the 3560? (Choose two.)',
    options: [
      'Enable `ip routing`',
      'Create `interface vlan 10` and `interface vlan 20` with gateway IP addresses and `no shutdown`',
      'Enter `no switchport` on every access port',
      'Configure `encapsulation dot1Q` under each SVI',
      'Configure `ip default-gateway` pointing to the old router',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The switch needs routing enabled and an **SVI per VLAN** holding the gateway address. Access ports must stay switchports so that hosts remain in their VLANs, SVIs have no `encapsulation` command because nothing is tagged internally, and `ip default-gateway` is ignored once routing is enabled.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two are disadvantages of router-on-a-stick compared with a Layer 3 switch? (Choose two.)',
    options: [
      'All inter-VLAN traffic crosses one link to the router and back',
      'The router and its single link are a single point of failure',
      'It needs a separate physical router interface for every VLAN',
      'It cannot route traffic in the native VLAN of the trunk',
      'It requires the switch to be a VTP server for the VLANs',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Routed traffic **hairpins** over the one trunk, which limits throughput, and the router plus that link form a **single point of failure**. A separate interface per VLAN describes the legacy design, the native VLAN can be routed with the `native` keyword, and VTP plays no part in router-on-a-stick.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'A router subinterface must receive and send VLAN 30 traffic on an 802.1Q trunk. Which subinterface command sets this? Enter the full command.',
    answers: ['encapsulation dot1q 30', 'encap dot1q 30'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`encapsulation dot1Q 30` binds the subinterface to VLAN 30 tags. The subinterface number does not matter to IOS, although naming it `.30` keeps the configuration readable. Remember that this command must precede the IP address.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Which command must be entered on Gi0/2 before the address is accepted?',
    exhibit: {
      kind: 'cli',
      text: `DSW1(config)# interface gigabitethernet0/2
DSW1(config-if)# ip address 10.0.0.1 255.255.255.252
% IP addresses may not be configured on L2 links.`,
    },
    options: ['`no switchport`', '`ip routing`', '`switchport mode access`', '`no shutdown`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Gi0/2 is still a Layer 2 switchport; `no switchport` converts it into a routed port that accepts an IP address. `ip routing` is a global command that enables routing but does not change the port type, `switchport mode access` keeps it at Layer 2, and the interface state has nothing to do with the error.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. Why is the line protocol of Vlan40 down?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show ip interface brief | include Vlan40
Vlan40                 192.168.40.1    YES manual up                    down
DSW1# show vlan brief | include ^40
40   GUEST                            active`,
    },
    options: [
      'VLAN 40 exists, but no port in VLAN 40 is up and forwarding',
      'Interface Vlan40 is administratively shut down on switch DSW1',
      'VLAN 40 does not exist in the VLAN database on DSW1',
      'IP routing is disabled in global configuration on DSW1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 40 is **active** but lists no ports, so no interface in the VLAN is up and forwarding, which leaves the SVI up/down. A shutdown SVI would read `administratively down`, the `show vlan brief` line proves VLAN 40 exists, and IP routing does not influence SVI state.',
  },
];

export default exam;
