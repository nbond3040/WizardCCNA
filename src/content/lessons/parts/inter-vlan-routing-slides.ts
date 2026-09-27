import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Inter-VLAN Routing',
    subtitle: 'Router-on-a-stick, Layer 3 switch SVIs and routed ports',
    notes:
      "VLANs split a switched network into separate broadcast domains, and each VLAN normally carries its own IP subnet. That separation is useful, but users in different VLANs still need to talk to each other and to reach servers and the internet. Because a switch never forwards a frame from one VLAN into another, that traffic must be **routed** by a Layer 3 device acting as each VLAN's default gateway. In this deck you will compare the three ways to do it: the legacy design with one router interface per VLAN, **router-on-a-stick** with 802.1Q subinterfaces, and the **Layer 3 switch** with switch virtual interfaces and routed ports. You will configure each approach, including `encapsulation dot1Q N native`, `ip routing` and `no switchport`, and learn exactly when an SVI comes up. Finally you will troubleshoot the classic faults: a wrong dot1Q VLAN, missing `ip routing`, a down SVI, a trunk that drops a VLAN and a host with the wrong gateway. The topic applies to both the v1.1 and v2.0 blueprints.",
  },
  {
    kind: 'bullets',
    title: 'Why VLANs need a router',
    bullets: [
      'Each VLAN is a separate broadcast domain and **IP subnet**',
      'A switch never forwards frames between VLANs',
      'Hosts send off-subnet traffic to their **default gateway**',
      '==Every VLAN needs a Layer 3 gateway address==',
      'Gateway options: router interface, subinterface or SVI',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'gateway .1 in each subnet', x: 5, y: 1.1, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.9 },
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '192.168.10.11/24', x: 1.7, y: 4.1 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: '192.168.20.12/24', x: 8.3, y: 4.1 },
      ],
      links: [
        { from: 'r1', to: 'sw', label: 'routes between VLANs', style: 'dashed' },
        { from: 'sw', to: 'pc1', fromLabel: 'Fa0/1' },
        { from: 'sw', to: 'pc2', fromLabel: 'Fa0/2' },
      ],
      groups: [
        { label: 'VLAN 10', x: 0.4, y: 3.3, w: 2.8, h: 1.6 },
        { label: 'VLAN 20', x: 6.8, y: 3.3, w: 2.8, h: 1.6 },
      ],
    },
    notes:
      "Consider PC1 in VLAN 10 (192.168.10.0/24) and PC2 in VLAN 20 (192.168.20.0/24) on the same switch. When PC1 wants to reach PC2, it compares PC2's address with its own subnet, sees that PC2 is remote, and sends the frame to its **default gateway** instead. SW1 would never deliver a VLAN 10 frame to a VLAN 20 port on its own, because VLANs are separate broadcast domains. The gateway must be a Layer 3 device with an interface in VLAN 10 that can route the packet into VLAN 20 and deliver it in a new frame. That is inter-VLAN routing. The design rule is one subnet per VLAN and one gateway address per subnet, conventionally the first usable address such as .1. The gateway can be a physical router interface, a router subinterface on a trunk, or a switch virtual interface on a multilayer switch. Each option has trade-offs in cost, performance and scalability, which the next slides compare in detail.",
  },
  {
    kind: 'bullets',
    title: 'Three inter-VLAN routing designs',
    bullets: [
      { text: '**Legacy**: one physical router interface per VLAN', sub: ['Each cabled to an access port in that VLAN', 'Simple, but burns router and switch ports'] },
      { text: '**Router-on-a-stick (ROAS)**: one trunk, many subinterfaces', sub: ['`G0/0/0.10`, `G0/0/0.20`, each tagged for one VLAN'] },
      { text: '**Layer 3 switch**: routing inside the switch', sub: ['One SVI per VLAN plus `ip routing`', 'Routed ports (`no switchport`) for uplinks'] },
    ],
    notes:
      "There are three classic designs, and exam questions expect you to recognize each one. The **legacy** design gives the router one physical interface per VLAN, each cabled to an access port in that VLAN. It needs no trunk and no special configuration, but a router with four interfaces can serve only four VLANs, so it does not scale and is rarely used today. **Router-on-a-stick** connects one router interface to a switch trunk. The router splits the interface into logical **subinterfaces**, one per VLAN, each with its own 802.1Q VLAN ID and IP address. It is cheap and common in small branches, but all routed traffic shares one link. The **Layer 3 switch** design moves routing into a multilayer switch: each VLAN gets a **switch virtual interface** that acts as the gateway, `ip routing` turns routing on, and physical ports can become **routed ports** for links to routers. That is the standard enterprise campus design. The rest of this deck configures, verifies and troubleshoots the last two approaches.",
  },
  {
    kind: 'diagram',
    title: 'Router-on-a-stick topology',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: '.10 = 192.168.10.1, .20 = 192.168.20.1', x: 5, y: 1.1, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.9 },
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'VLAN 10, gw 192.168.10.1', x: 1.8, y: 4.2 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: 'VLAN 20, gw 192.168.20.1', x: 8.2, y: 4.2 },
      ],
      links: [
        { from: 'r1', to: 'sw', label: '802.1Q trunk: VLANs 10, 20, 99', fromLabel: 'G0/0/0', toLabel: 'Gi0/1', style: 'thick', tone: 'accent' },
        { from: 'sw', to: 'pc1', fromLabel: 'Fa0/1' },
        { from: 'sw', to: 'pc2', fromLabel: 'Fa0/2' },
      ],
    },
    bullets: [
      'Router G0/0/0: one subinterface per VLAN',
      'Switch Gi0/1: static 802.1Q trunk',
      'Hosts use their subinterface IP as the default gateway',
    ],
    notes:
      "In router-on-a-stick, R1's G0/0/0 connects to SW1's Gi0/1, and that link is an **802.1Q trunk**. On the router side, the physical interface carries no IP address; instead it is divided into subinterfaces such as `G0/0/0.10` and `G0/0/0.20`. Each subinterface is bound to one VLAN with `encapsulation dot1Q` and owns the gateway address of that VLAN's subnet: 192.168.10.1 for VLAN 10 and 192.168.20.1 for VLAN 20. To the router these look like separate directly connected networks, so it can route between them with no routing protocol at all. On the switch side, Gi0/1 must be a static trunk, because routers do not negotiate trunks with DTP, and it must allow every VLAN the router serves. PC1 and PC2 are ordinary hosts on access ports that simply use their subinterface address as their default gateway. The name comes from the single link: the router hangs off the switch on one stick.",
  },
  {
    kind: 'diagram',
    title: "A packet's trip through router-on-a-stick",
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc1', label: 'PC1 (VLAN 10)', icon: 'pc' },
        { id: 'sw', label: 'SW1', icon: 'switch' },
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'pc2', label: 'PC2 (VLAN 20)', icon: 'pc' },
      ],
      steps: [
        { from: 'pc1', to: 'sw', label: 'Frame to gateway MAC', sub: 'untagged on access port Fa0/1' },
        { from: 'sw', to: 'r1', label: 'Tagged VLAN 10 on the trunk', sub: 'received by G0/0/0.10' },
        { note: 'R1 routes from 192.168.10.0/24 to 192.168.20.0/24', tone: 'accent' },
        { from: 'r1', to: 'sw', label: 'Tagged VLAN 20 on the trunk', sub: 'sent out G0/0/0.20' },
        { from: 'sw', to: 'pc2', label: 'Untagged out Fa0/2', sub: 'VLAN 20 access port' },
      ],
    },
    caption: 'Every routed packet crosses the trunk twice: up in one VLAN, down in another.',
    notes:
      "Follow one packet from PC1 in VLAN 10 to PC2 in VLAN 20. PC1 sends a frame to its gateway's MAC address; it enters SW1 untagged on access port Fa0/1, so SW1 treats it as VLAN 10. SW1 forwards it over the trunk with an 802.1Q tag of 10. R1 receives the tagged frame and hands it to subinterface G0/0/0.10, the one configured with `encapsulation dot1Q 10`. R1 then routes the packet: the destination 192.168.20.12 matches the connected network on G0/0/0.20, so R1 builds a new frame with its own MAC as the source and PC2's MAC as the destination, and sends it back out of the same physical link tagged with VLAN 20. SW1 removes the tag and delivers the frame untagged out of Fa0/2. Notice the key weakness: every routed packet crosses the trunk **twice**, once up and once down, so the single link carries all inter-VLAN traffic in both directions. That hairpin is the performance limit of router-on-a-stick.",
  },
  {
    kind: 'cli',
    title: 'Router-on-a-stick: router configuration',
    code: `R1(config)# interface gigabitethernet0/0/0
R1(config-if)# no shutdown
R1(config-if)# interface gigabitethernet0/0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# interface gigabitethernet0/0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# interface gigabitethernet0/0/0.99
R1(config-subif)# encapsulation dot1Q 99 native
R1(config-subif)# ip address 192.168.99.1 255.255.255.0
R1(config-subif)# end`,
    highlight: ['encapsulation dot1Q 10', 'encapsulation dot1Q 20', 'encapsulation dot1Q 99 native'],
    caption: 'One subinterface per VLAN; the native VLAN subinterface carries the native keyword.',
    notes:
      "The configuration starts with the physical interface. It needs `no shutdown`, because router interfaces are disabled by default, and it normally carries no IP address of its own. Next, create a subinterface for each VLAN with `interface gigabitethernet0/0/0.10`; the prompt changes to `(config-subif)#`. On each subinterface, `encapsulation dot1Q 10` binds it to VLAN 10, and `ip address` assigns the gateway address for that VLAN's subnet. The number after the dot is only a label, but matching it to the VLAN ID is a strong convention that makes troubleshooting far easier. Finally, `encapsulation dot1Q 99 native` tells R1 that VLAN 99 is the **native VLAN**, so untagged frames arriving on the trunk belong to G0/0/0.99. That must match the native VLAN on the switch trunk. An alternative for the native VLAN is to put its IP address directly on the physical interface, which also handles untagged frames. The running-config shows the keyword as `dot1Q` with a capital Q, but IOS accepts any capitalization when you type it.",
  },
  {
    kind: 'cli',
    title: 'Order matters on a subinterface',
    code: `R1(config)# interface gigabitethernet0/0/0.30
R1(config-subif)# ip address 192.168.30.1 255.255.255.0
% Configuring IP routing on a LAN subinterface is only allowed if that subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q, or ISL vLAN.
R1(config-subif)# encapsulation dot1Q 30
R1(config-subif)# ip address 192.168.30.1 255.255.255.0
R1(config-subif)# end
R1# show running-config | section interface GigabitEthernet0/0/0
interface GigabitEthernet0/0/0
 no ip address
 negotiation auto
interface GigabitEthernet0/0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface GigabitEthernet0/0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
interface GigabitEthernet0/0/0.99
 encapsulation dot1Q 99 native
 ip address 192.168.99.1 255.255.255.0`,
    highlight: ['% Configuring IP routing on a LAN subinterface', 'encapsulation dot1Q 30'],
    caption: 'Encapsulation first, then the IP address.',
    notes:
      "IOS enforces an order on subinterfaces: the encapsulation must exist before an IP address can be assigned. Try the address first and IOS rejects it with the long message shown, which mentions 802.10, 802.1Q and ISL because it predates most modern networks. Enter `encapsulation dot1Q 30` and the address is then accepted. The `show running-config | section` filter displays the physical interface and all of its subinterfaces together, which is the quickest way to audit a router-on-a-stick configuration. Check that every subinterface has the intended VLAN in its encapsulation line and a unique subnet, and that exactly one subinterface is marked `native`, matching the switch. The physical interface shows `no ip address`, as expected when every VLAN, including the native one, lives on a subinterface. Exam items like to hide a mismatch here, such as subinterface .20 with `encapsulation dot1Q 21`, and then ask why VLAN 20 hosts cannot reach their gateway while every other VLAN works normally.",
  },
  {
    kind: 'cli',
    title: 'Router-on-a-stick: switch side',
    code: `SW1(config)# interface gigabitethernet0/1
SW1(config-if)# description Trunk to R1 G0/0/0
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,30,99
SW1(config-if)# end
SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,30,99

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30,99`,
    highlight: ['switchport mode trunk', 'switchport trunk native vlan 99', '10,20,30,99'],
    caption: 'Routers do not run DTP, so the switch port must be a static trunk.',
    notes:
      "The switch side of router-on-a-stick is an ordinary 802.1Q trunk, with one twist: the router does not speak DTP, so the port must be a **static trunk** with `switchport mode trunk`. A port left in dynamic auto or desirable would never become a trunk toward a router. The native VLAN must match the router's `native` subinterface, here VLAN 99, or untagged traffic lands in the wrong place. The allowed list must include every VLAN the router serves: 10, 20, 30 and 99. `show interfaces trunk` confirms everything on one screen: mode on, 802.1q, trunking, native VLAN 99, and VLANs 10, 20, 30 and 99 allowed, active and forwarding. If a VLAN were missing from any of the three lists, hosts in that VLAN could not reach their gateway even though every other VLAN worked. Remember also that the VLANs must exist on SW1 itself, because a trunk only carries VLANs that are active on the switch; creating the subinterfaces on the router does not create any VLANs on SW1.",
  },
  {
    kind: 'cli',
    title: 'Verifying router-on-a-stick on the router',
    code: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   unassigned      YES unset  up                    up
GigabitEthernet0/0/0.10 192.168.10.1    YES manual up                    up
GigabitEthernet0/0/0.20 192.168.20.1    YES manual up                    up
GigabitEthernet0/0/0.30 192.168.30.1    YES manual up                    up
GigabitEthernet0/0/0.99 192.168.99.1    YES manual up                    up
GigabitEthernet0/0/1   unassigned      YES unset  administratively down down
R1# show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
...
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.0/24 is directly connected, GigabitEthernet0/0/0.10
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0/0.10
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/0/0.20
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0/0.20
...`,
    highlight: ['GigabitEthernet0/0/0.10', 'GigabitEthernet0/0/0.20'],
    caption: 'Each subinterface is its own connected network.',
    notes:
      "On the router, `show ip interface brief` lists each subinterface on its own line with its own address and status; the long names simply push the columns to the right. Subinterfaces depend on the physical interface: if G0/0/0 is down or shut down, every subinterface goes down with it. `show ip route` proves that routing between VLANs needs no routing protocol. Each subinterface contributes a **connected** route (`C`) for its subnet and a **local** route (`L`) for its own /32 address, and the outgoing interface is the subinterface itself. With those routes in place, R1 already knows how to reach every VLAN. If a subnet is missing from the routing table, the subinterface is down or has no address. If the table looks perfect but hosts still fail, the problem is at Layer 2 (a trunk, VLAN or encapsulation issue) or on the hosts themselves, usually a wrong default gateway. Checking the router first quickly tells you which half of the path to investigate next.",
  },
  {
    kind: 'diagram',
    title: 'Layer 3 switch with SVIs',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'WAN edge 10.0.0.2', x: 5, y: 0.9 },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', sub: 'Vlan10 .10.1, Vlan20 .20.1', x: 5, y: 2.6, tone: 'accent' },
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'VLAN 10', x: 1.8, y: 4.2 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: 'VLAN 20', x: 8.2, y: 4.2 },
      ],
      links: [
        { from: 'dsw', to: 'r1', label: 'routed port 10.0.0.0/30', fromLabel: 'Gi0/2', toLabel: 'G0/0/1' },
        { from: 'dsw', to: 'pc1', fromLabel: 'Fa0/1' },
        { from: 'dsw', to: 'pc2', fromLabel: 'Fa0/2' },
      ],
    },
    bullets: [
      'SVIs `Vlan10` and `Vlan20` are the host gateways',
      '`ip routing` makes the switch route between them',
      'Gi0/2 is a **routed port** toward R1',
    ],
    notes:
      "A **multilayer (Layer 3) switch** can do both jobs: switch frames within a VLAN and route packets between VLANs. Each VLAN gets a **switch virtual interface (SVI)**, a logical interface such as `interface vlan 10` that owns the gateway address for that VLAN's subnet. Because routing happens inside the switch, in hardware, there is no trunk to a router and no hairpin: a packet from PC1 to PC2 enters on Fa0/1, is routed internally from Vlan10 to Vlan20 and leaves on Fa0/2. For traffic leaving the campus, a physical port can be converted into a **routed port** with `no switchport` and given an IP address, like Gi0/2 toward R1 here; it then behaves like a router interface rather than a switch port. A default route pointing at R1 completes the design. This model scales to many VLANs at wire speed, which is why it is the standard design in enterprise distribution and core layers. DSW1 in this lesson is a Catalyst 3560, whose ports are named like those of a 2960.",
  },
  {
    kind: 'cli',
    title: 'Configuring SVIs and ip routing',
    code: `DSW1(config)# ip routing
DSW1(config)# vlan 10
DSW1(config-vlan)# name SALES
DSW1(config-vlan)# vlan 20
DSW1(config-vlan)# name ENG
DSW1(config-vlan)# exit
DSW1(config)# interface vlan 10
DSW1(config-if)# ip address 192.168.10.1 255.255.255.0
DSW1(config-if)# no shutdown
DSW1(config-if)# interface vlan 20
DSW1(config-if)# ip address 192.168.20.1 255.255.255.0
DSW1(config-if)# no shutdown
DSW1(config-if)# interface fastethernet0/1
DSW1(config-if)# switchport mode access
DSW1(config-if)# switchport access vlan 10
DSW1(config-if)# interface fastethernet0/2
DSW1(config-if)# switchport mode access
DSW1(config-if)# switchport access vlan 20
DSW1(config-if)# end`,
    highlight: ['ip routing', 'interface vlan 10', 'interface vlan 20'],
    caption: 'Routing on, VLANs created, one SVI per VLAN, access ports assigned.',
    notes:
      "Three things make a Layer 3 switch route between VLANs. First, `ip routing`: on Catalyst multilayer switches such as the 3560, IP routing is disabled by default, and without it the SVIs behave like host addresses rather than router interfaces. Second, the VLANs themselves must exist; creating an SVI with `interface vlan 10` does **not** create VLAN 10, so the `vlan 10` command (or VTP) is still needed. Third, each SVI needs an IP address and `no shutdown`, because SVIs can start out administratively down. Access ports are then assigned to the VLANs exactly as on any other switch. Hosts in VLAN 10 use 192.168.10.1 as their default gateway and hosts in VLAN 20 use 192.168.20.1. Unlike router-on-a-stick, nothing is tagged here, because routing happens inside the switch. On a Layer 2 switch such as the 2960, by contrast, a single SVI is used only for management and `ip default-gateway` points at a router, as you saw in the CLI basics lesson.",
  },
  {
    kind: 'table',
    title: 'When is an SVI up/up?',
    columns: ['Requirement', 'If it is not met'],
    rows: [
      ['The VLAN exists in the VLAN database', 'SVI is `down` / `down`'],
      ['The SVI is not shut down (`no shutdown`)', 'SVI is `administratively down` / `down`'],
      ['At least one port in the VLAN is up and STP-forwarding (access or trunk)', 'SVI is `up` / `down`'],
      ['Not required: `ip routing`', 'SVI can be up/up, but the switch does not route'],
    ],
    caption: 'The SVI state follows the VLAN behind it (autostate).',
    notes:
      "An SVI is a logical interface, so its status is derived from the VLAN behind it; Cisco calls this behavior autostate. For an SVI to be **up/up**, three conditions must hold. The VLAN must exist in the VLAN database; if it does not, the SVI stays down, and a VLAN that has been shut down locally keeps it down as well. The SVI itself must not be administratively shut down; otherwise it shows `administratively down`. And at least one Layer 2 port in that VLAN must be up and in the STP forwarding state, either an access port in the VLAN or a trunk that carries it; if none is, the SVI shows `up/down`. The design reason is sensible: an SVI with no live ports behind it cannot reach any host, so it should not attract traffic or be advertised by routing protocols. Notice what is not on the list: `ip routing`. An SVI can be perfectly up/up on a switch with routing disabled; it just will not route between VLANs. Exam questions often ask for the three required conditions.",
  },
  {
    kind: 'cli',
    title: 'SVI states in the real world',
    code: `DSW1# show ip interface brief | include Vlan
Vlan1                  unassigned      YES unset  administratively down down
Vlan10                 192.168.10.1    YES manual up                    up
Vlan20                 192.168.20.1    YES manual up                    up
Vlan30                 192.168.30.1    YES manual down                  down
Vlan40                 192.168.40.1    YES manual up                    down
DSW1# show vlan brief | include ^30|^40
40   GUEST                            active`,
    highlight: ['administratively down down', 'down                  down', 'up                    down'],
    caption: 'VLAN 30 does not exist; VLAN 40 exists but has no active ports.',
    notes:
      "This output shows every SVI state you need to recognize. **Vlan10** and **Vlan20** are up/up: their VLANs exist and have active ports. **Vlan1** is administratively down because it was shut down, a common hardening step when VLAN 1 is not used. **Vlan30** is down/down, and the filtered `show vlan brief` explains why: VLAN 30 does not appear at all, because someone configured `interface vlan 30` without ever creating the VLAN. Creating it with `vlan 30` and giving it an active port fixes that. **Vlan40** is up/down: VLAN 40 exists (named GUEST) but has no ports listed, so no port in the VLAN is up and forwarding; connecting a host to a VLAN 40 access port, or carrying VLAN 40 on an active trunk, brings the line protocol up. The regular expression in the filter uses `^` to anchor the VLAN number at the start of a line and `|` to match either value. On the exam, match each state to its cause quickly: administratively down means shutdown, and the other two point to the VLAN itself.",
  },
  {
    kind: 'cli',
    title: 'Routed ports with no switchport',
    code: `DSW1(config)# interface gigabitethernet0/2
DSW1(config-if)# ip address 10.0.0.1 255.255.255.252
% IP addresses may not be configured on L2 links.
DSW1(config-if)# no switchport
DSW1(config-if)# ip address 10.0.0.1 255.255.255.252
DSW1(config-if)# exit
DSW1(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2
DSW1(config)# end
DSW1# show interfaces status | include Gi0/2
Gi0/2     Uplink to R1       connected    routed     a-full a-1000 10/100/1000BaseTX`,
    highlight: ['% IP addresses may not be configured on L2 links.', 'no switchport', 'routed'],
    caption: 'A routed port belongs to no VLAN and behaves like a router interface.',
    notes:
      "Physical ports on a multilayer switch are Layer 2 **switchports** by default. Try to put an IP address on one and IOS refuses with `% IP addresses may not be configured on L2 links.` The fix is `no switchport`, which converts the port into a **routed port**: it no longer belongs to any VLAN, runs no DTP and behaves exactly like a router interface, so the IP address is now accepted. Routed ports are ideal for point-to-point links to routers or to other Layer 3 switches, often with /30 or /31 subnets. The static default route then sends all unknown destinations to R1 at 10.0.0.2. `show interfaces status` confirms the conversion: the Vlan column now reads `routed` instead of a VLAN number. To turn the port back into a Layer 2 port, use the `switchport` command. Do not confuse `no switchport`, an interface command for physical ports, with `ip routing`, a global command; and remember that an SVI never takes `no switchport`, because it is already a Layer 3 interface.",
  },
  {
    kind: 'table',
    title: 'Comparing the three designs',
    columns: ['Aspect', 'Legacy', 'Router-on-a-stick', 'Layer 3 switch'],
    rows: [
      ['Gateway interfaces', 'One physical per VLAN', 'One subinterface per VLAN', 'One SVI per VLAN'],
      ['Link to the switch', 'Access port per VLAN', 'One 802.1Q trunk', 'None (internal)'],
      ['Forwarding', 'Router', 'Router; traffic hairpins on one link', 'Switch hardware, wire speed'],
      ['Scalability', 'Poor', 'Moderate', 'High'],
      ['Single point of failure', 'Router', 'Router and its trunk link', 'Switch (often paired with an FHRP)'],
      ['Typical use', 'Labs, obsolete', 'Small sites and branches', 'Campus distribution and core'],
    ],
    notes:
      "This comparison appears on the exam as 'which design is best for...' questions. The **legacy** approach uses one router interface and one switch access port per VLAN, so its cost grows with every VLAN; it survives mainly in labs. **Router-on-a-stick** needs just one router interface and one trunk, making it the cheapest way to route a handful of VLANs, but every routed packet crosses that link twice, the router's forwarding capacity limits throughput, and the router and its link are single points of failure. The **Layer 3 switch** routes in hardware at wire speed, needs no external link at all for inter-VLAN traffic and scales to many VLANs, at the cost of a more capable switch. In campus designs, two distribution switches usually provide the SVIs together with a first-hop redundancy protocol such as HSRP, so hosts keep a working gateway if one switch fails. When a question stresses performance and scalability, choose the Layer 3 switch; when it stresses minimal hardware in a small branch, router-on-a-stick fits.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: wrong dot1Q VLAN',
    code: `SW1# show vlan brief | include ^20
20   ENG                              active    Fa0/2, Fa0/3, Fa0/4
SW1# show interfaces trunk | include Gi0/1
Gi0/1       on               802.1q         trunking      99
Gi0/1       10,20,30,99
Gi0/1       10,20,30,99
Gi0/1       10,20,30,99

R1# show running-config | section interface GigabitEthernet0/0/0.20
interface GigabitEthernet0/0/0.20
 encapsulation dot1Q 21
 ip address 192.168.20.1 255.255.255.0`,
    highlight: ['encapsulation dot1Q 21'],
    caption: 'VLAN 20 is healthy on the switch; the router listens for VLAN 21.',
    notes:
      "Here users in VLAN 20 cannot reach anything outside their own subnet, not even their gateway, while VLAN 10 users are fine. The switch checks out: VLAN 20 is active with its ports, and the filtered `show interfaces trunk` shows Gi0/1 trunking with VLAN 20 allowed, active and forwarding in all three lists. The router configuration reveals the fault: subinterface G0/0/0.20 has the right IP address but `encapsulation dot1Q 21`. Frames from VLAN 20 arrive at R1 tagged 20, no subinterface is configured for VLAN 20, and so R1 never answers the hosts' ARP requests for 192.168.20.1. The subinterface number 20 makes the configuration look correct at a glance, which is exactly why exam writers use this trap. The fix is `encapsulation dot1Q 20` under G0/0/0.20. The same symptom, one VLAN unable to reach its gateway while others work, can also come from the VLAN missing on the trunk's allowed list, so check the router and the switch together before changing anything.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: missing ip routing',
    code: `DSW1# show ip route
Default gateway is not set

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty
DSW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
DSW1(config)# ip routing
DSW1(config)# end
DSW1# show ip route | begin Gateway
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.0/24 is directly connected, Vlan10
L        192.168.10.1/32 is directly connected, Vlan10
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, Vlan20
L        192.168.20.1/32 is directly connected, Vlan20`,
    highlight: ['Default gateway is not set', 'ip routing', 'directly connected, Vlan10', 'directly connected, Vlan20'],
    caption: 'No routing table at all is the signature of a switch with routing disabled.',
    notes:
      "On a Layer 3 switch, the most common inter-VLAN routing fault is simply forgetting `ip routing`. The symptoms are distinctive: every SVI is up/up and hosts can ping their own gateway SVI, but they cannot reach hosts in any other VLAN. `show ip route` gives it away. Instead of a routing table, a switch with routing disabled prints `Default gateway is not set` followed by an ICMP redirect cache, the output of a device acting as a host. After `ip routing`, the familiar table appears, with a connected and a local route for every SVI, and packets are routed between VLANs immediately. Also remember the related command from the switching side: `ip default-gateway` is used only while routing is disabled; once `ip routing` is on, the switch needs routes, such as a static default route toward the upstream router, for destinations beyond its own connected networks. Exam exhibits sometimes show this exact output and ask which single command restores inter-VLAN connectivity.",
  },
  {
    kind: 'diagram',
    title: 'Troubleshooting inter-VLAN routing',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'h', label: 'Host settings OK?', sub: 'IP, mask, gateway', shape: 'diamond' },
        { id: 'g', label: 'Gateway reachable?', sub: 'VLAN, trunk, dot1Q, SVI', shape: 'diamond' },
        { id: 'r', label: 'Gateway routes?', sub: 'ip routing, routes', shape: 'diamond' },
        { id: 'b', label: 'Return path OK?', sub: 'far host and its VLAN', shape: 'diamond' },
        { id: 'ok', label: 'End-to-end ping', shape: 'round', tone: 'good' },
      ],
    },
    caption: 'Work from the host outward, and never forget the return path.',
    notes:
      "Inter-VLAN problems are easiest to solve in a fixed order. Start at the **host**: is its IP address in the right subnet for its VLAN, with the right mask, and is its default gateway the router or SVI address of **its own** VLAN? A host with a wrong gateway can still talk to neighbors in its VLAN, which makes the fault look like a routing problem. Next, can the host **ping its gateway**? If not, the Layer 2 path to the gateway is broken: the port may be in the wrong VLAN, the VLAN may be missing from the trunk's allowed list, the subinterface may have the wrong `encapsulation dot1Q`, or the SVI may be down. Then check that the gateway actually **routes**: `ip routing` on a Layer 3 switch, and connected routes for every VLAN in `show ip route`. Finally, remember the **return path**: the destination host needs a correct gateway too, and its VLAN must also reach the router. Many exam scenarios break the return path while the forward path looks perfect.",
  },
  {
    kind: 'table',
    title: 'Symptom, cause, fix',
    columns: ['Symptom', 'Likely cause', 'Fix'],
    rows: [
      ['VLAN 20 hosts cannot ping 192.168.20.1 (ROAS)', 'Wrong `encapsulation dot1Q` VLAN on G0/0/0.20', '`encapsulation dot1Q 20`'],
      ['One VLAN cannot reach the router; others can', 'VLAN missing from the trunk allowed list', '`switchport trunk allowed vlan add 20`'],
      ['No VLAN reaches the router', 'Switch port not trunking, or router interface shut', '`switchport mode trunk`; `no shutdown` on G0/0/0'],
      ['Hosts reach their own SVI only', '`ip routing` missing on the L3 switch', '`ip routing`'],
      ['SVI down/down or up/down', 'VLAN missing, or no active port in it', 'Create the VLAN; activate a port in it'],
      ['One host cannot leave its subnet; neighbors can', 'Wrong default gateway on that host', 'Use its own VLAN gateway address'],
    ],
    notes:
      "This table condenses the faults you must diagnose quickly. The first three are router-on-a-stick problems: a subinterface tagged with the wrong VLAN ID, a VLAN missing from the trunk's allowed list, and a switch port that is not trunking or a router interface that is shut down. The first two break a single VLAN, while the third breaks them all. The next two belong to Layer 3 switches: missing `ip routing` lets hosts reach their own gateway but nothing beyond it, and a down SVI means the VLAN is missing or has no active port. The last row is the host-side classic: when one host cannot leave its subnet but its neighbors can, compare its default gateway with theirs. In every case the verification command points straight at the cause: `show running-config` for the encapsulation, `show interfaces trunk` for the allowed list, `show ip interface brief` for SVI state and `show ip route` for routing. Practice matching symptoms to these commands until it feels automatic.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: inter-VLAN routing',
    body: 'Check the **dot1Q VLAN**, the **trunk**, **`ip routing`** and the **host gateway**, in that order.',
    bullets: [
      '`encapsulation dot1Q` sets the VLAN; the subinterface number is only a label',
      'On a subinterface, `encapsulation` comes before `ip address`',
      '`encapsulation dot1Q 99 native` must match the switch native VLAN',
      'Switch port to a router: static `switchport mode trunk` (no DTP)',
      'L3 switch needs `ip routing`; `interface vlan 30` does not create VLAN 30',
      'SVI up/up: VLAN exists, SVI not shut, a port in the VLAN is up',
      '`no switchport` before an IP on a physical switch port',
    ],
    notes:
      "These traps come up again and again. The subinterface number is only a label; `encapsulation dot1Q` decides the VLAN, so .20 with dot1Q 21 serves VLAN 21. The encapsulation must be configured before the IP address on a subinterface. The router's `native` subinterface must match the switch trunk's native VLAN. The switch port facing a router must be a static trunk, because routers do not run DTP. On a Layer 3 switch, `ip routing` is required, and `interface vlan 30` does not create VLAN 30. An SVI is up/up only when its VLAN exists, the SVI is not shut down and at least one port in the VLAN is up and forwarding. Physical switch ports need `no switchport` before they accept an IP address, and SVIs never use that command. Finally, when only one host fails while its neighbors work, suspect that host's default gateway before touching any network device, because the network path is clearly fine for everyone else.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'One subnet per VLAN; traffic between VLANs must be routed',
      'ROAS: `interface g0/0/0.10` + `encapsulation dot1Q 10` + IP; switch port = static trunk',
      'Native VLAN on ROAS: `encapsulation dot1Q 99 native`',
      'L3 switch: `ip routing`, VLANs created, `interface vlan 10` + IP + `no shutdown`',
      'SVI up/up: VLAN exists, not shut down, an active port in the VLAN',
      'Routed port: `no switchport` then an IP address',
      'Verify: `show ip interface brief`, `show ip route`, `show interfaces trunk`',
    ],
    notes:
      "Inter-VLAN routing exists because each VLAN is a separate subnet and switches never forward frames between VLANs. The legacy design uses one router interface per VLAN and does not scale. Router-on-a-stick uses one 802.1Q trunk and one subinterface per VLAN, configured with `encapsulation dot1Q N` (plus `native` for the native VLAN) before the IP address, with a static trunk on the switch side; it is cheap, but every routed packet hairpins over one link. The Layer 3 switch routes in hardware using SVIs, requires `ip routing` and existing VLANs, and uses `no switchport` to create routed ports for uplinks. SVIs come up only when the VLAN exists, the SVI is not shut down and a port in the VLAN is up and forwarding. Verify with `show ip interface brief`, `show ip route` and `show interfaces trunk`, and troubleshoot methodically: host settings, gateway reachability, routing and finally the return path.",
  },
];

export default slides;
