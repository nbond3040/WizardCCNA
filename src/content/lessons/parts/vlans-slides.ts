import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'VLANs & Access Ports',
    subtitle: 'Splitting one switched network into many broadcast domains',
    notes:
      "A switch fresh out of the box puts every port in the same broadcast domain, VLAN 1. That works for a handful of devices, but in a real building it means every ARP request, DHCP discover and stray broadcast reaches every host, and every user sits on the same network as the servers and printers. **Virtual LANs** fix that by dividing one physical switch, or a whole campus of switches, into separate Layer 2 networks. In this deck you will learn why VLANs exist, which VLAN IDs are usable and where the switch stores them, and how to create, name and delete VLANs. You will configure access ports, park unused ports safely and add a **voice VLAN** for IP phones. Most importantly, you will learn to read `show vlan brief`, `show interfaces switchport` and `show interfaces status` the way the exam expects, and to troubleshoot ports in the wrong VLAN or in a VLAN that does not exist. Everything here applies to both the v1.1 and v2.0 blueprints.",
  },
  {
    kind: 'bullets',
    title: 'Why VLANs?',
    bullets: [
      'A VLAN is a **separate broadcast domain** on shared switches',
      '==One VLAN = one IP subnet== by design',
      '**Segmentation**: broadcasts stay inside their own VLAN',
      '**Security**: traffic between VLANs must cross a router or firewall',
      '**Flexibility**: group users by function, not by physical location',
      'Default: every port in **VLAN 1**, one big broadcast domain',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 1.2 },
        { id: 's1', icon: 'pc', label: 'Sales-1', sub: '10.10.10.11', x: 1.3, y: 3.7 },
        { id: 's2', icon: 'pc', label: 'Sales-2', sub: '10.10.10.12', x: 3.4, y: 3.7 },
        { id: 'e1', icon: 'pc', label: 'Eng-1', sub: '10.10.30.11', x: 6.6, y: 3.7 },
        { id: 'e2', icon: 'pc', label: 'Eng-2', sub: '10.10.30.12', x: 8.7, y: 3.7 },
      ],
      links: [
        { from: 'sw', to: 's1', fromLabel: 'Fa0/1' },
        { from: 'sw', to: 's2', fromLabel: 'Fa0/2' },
        { from: 'sw', to: 'e1', fromLabel: 'Fa0/5' },
        { from: 'sw', to: 'e2', fromLabel: 'Fa0/6' },
      ],
      groups: [
        { label: 'VLAN 10 (SALES)', x: 0.4, y: 2.8, w: 4, h: 2 },
        { label: 'VLAN 30 (ENGINEERING)', x: 5.6, y: 2.8, w: 4, h: 2, tone: 'accent' },
      ],
    },
    notes:
      "A **VLAN** is a group of switch ports that behaves like its own separate switch: frames, including broadcasts, are forwarded only between ports in the same VLAN. Each VLAN is therefore its own **broadcast domain**, and by design each VLAN carries one **IP subnet**; in the diagram VLAN 10 uses 10.10.10.0/24 and VLAN 30 uses 10.10.30.0/24. The benefits are the ones the exam lists. **Segmentation** keeps broadcast domains small, so hosts waste less CPU and bandwidth on traffic that is not for them. **Security** improves because hosts in different VLANs cannot talk directly; their traffic must pass through a router or firewall, where ACLs can filter it. **Flexibility** comes from grouping users by function instead of by cable: a salesperson who moves to another floor keeps the same VLAN, just on a different port. Without any configuration, every port on a Cisco switch is in VLAN 1, so the whole switch is one big broadcast domain.",
  },
  {
    kind: 'diagram',
    title: 'Broadcasts stay inside the VLAN',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'a', label: 'Sales-1 (VLAN 10)', icon: 'pc' },
        { id: 'sw', label: 'SW1', icon: 'switch' },
        { id: 'b', label: 'Sales-2 (VLAN 10)', icon: 'pc' },
        { id: 'e', label: 'Eng-1 (VLAN 30)', icon: 'pc' },
      ],
      steps: [
        { from: 'a', to: 'sw', label: 'ARP request (broadcast)', sub: 'arrives on Fa0/1, VLAN 10' },
        { from: 'sw', to: 'b', label: 'Flooded out VLAN 10 ports only', tone: 'accent' },
        { note: 'Eng-1 in VLAN 30 never receives the broadcast', tone: 'good' },
        { from: 'b', to: 'a', label: 'ARP reply (unicast)', dashed: true },
        { note: 'Sales-1 to Eng-1 traffic must be routed by a Layer 3 device', tone: 'warn' },
      ],
    },
    caption: 'A switch never forwards a frame from one VLAN into another.',
    notes:
      "Watch what happens to a broadcast. Sales-1 sends an ARP request, which is an Ethernet broadcast. SW1 knows the frame arrived on a VLAN 10 port, so it floods it only out the other VLAN 10 ports; Eng-1 in VLAN 30 never sees it. The same rule applies to unknown unicast and multicast flooding, and the switch even keeps its MAC address table **per VLAN**, so a MAC address learned in VLAN 10 is never used to forward a VLAN 30 frame. The consequence is important: a switch never forwards a frame from one VLAN into another. If Sales-1 wants to reach Eng-1, the packet must go to Sales-1's default gateway, a router or Layer 3 switch that routes between the two subnets; that is covered in the inter-VLAN routing lesson. On the exam, remember the chain of equivalence: one VLAN equals one broadcast domain equals one subnet, and moving between VLANs always requires Layer 3.",
  },
  {
    kind: 'table',
    title: 'VLAN ID ranges',
    columns: ['VLAN IDs', 'Range', 'Notes'],
    rows: [
      ['0 and 4095', 'Reserved', 'Not usable'],
      ['1', 'Normal (default VLAN)', 'All ports start here; ==cannot be deleted=='],
      ['2 to 1001', 'Normal', 'Everyday usable VLANs; stored in `vlan.dat`'],
      ['1002 to 1005', 'Normal (reserved)', 'Legacy FDDI / Token Ring; cannot be deleted; `act/unsup`'],
      ['1006 to 4094', 'Extended', 'VTP v1/v2 require transparent mode (or VTP off); VTPv3 supports them'],
    ],
    caption: 'The 12-bit VLAN ID allows 4096 values, of which 1 to 4094 are usable.',
    notes:
      "The 802.1Q tag carries a **12-bit VLAN ID**, which gives 4096 values, 0 to 4095. The two end values, 0 and 4095, are reserved, leaving **1 to 4094** for real VLANs. Cisco divides them into two ranges. The **normal range** is 1 to 1005. VLAN 1 is the default VLAN and cannot be deleted. VLANs 1002 to 1005 are also created automatically, for the legacy FDDI and Token Ring technologies; they cannot be deleted either, and `show vlan brief` shows them as `act/unsup`. That leaves 2 to 1001 as the everyday usable pool. The **extended range** is 1006 to 4094, used by large enterprises and service providers. With VTP versions 1 and 2, you can create extended-range VLANs only when the switch is in VTP **transparent** mode (or VTP is off), and those VLANs are saved in the running-config rather than in vlan.dat; VTP version 3 can advertise them. Exam items commonly give a VLAN ID and ask which range it belongs to.",
  },
  {
    kind: 'bullets',
    title: 'VLAN 1 and the VLAN database',
    bullets: [
      '**VLAN 1** is the default VLAN: every port starts there; it cannot be deleted',
      'Best practice: keep users and management **out of VLAN 1**',
      'Normal-range VLANs are saved in **`flash:vlan.dat`**, not the startup-config',
      '==`erase startup-config` does not delete VLANs==; also `delete flash:vlan.dat`',
      'VTP **transparent** mode also lists VLANs in the running-config',
      'Trust `show vlan brief`, not `show running-config`, to see VLANs',
    ],
    notes:
      "VLAN 1 is special. Every port belongs to it by default, it is the default native VLAN on trunks, and it cannot be deleted. Because it is everywhere, security guides recommend keeping user devices and switch management in other VLANs and leaving VLAN 1 unused. The next surprise is where VLANs are stored. On a switch in VTP server or client mode (server is the default), normal-range VLAN definitions are written to a file called **vlan.dat** in flash, not to the startup-config, so `show running-config` does not list them. The classic lab trap follows: an engineer runs `erase startup-config` and `reload` to wipe a switch, yet all the old VLANs come back, because vlan.dat was never touched. A full reset needs `delete flash:vlan.dat` as well, before the reload. In VTP transparent mode the switch also writes its VLANs into the running-config, so they are saved in the startup-config too. Whatever the mode, `show vlan brief` is the authoritative view of which VLANs exist.",
  },
  {
    kind: 'cli',
    title: 'Creating and naming VLANs',
    code: `SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# vlan 10
SW1(config-vlan)# name SALES
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name VOICE
SW1(config-vlan)# vlan 30
SW1(config-vlan)# name ENGINEERING
SW1(config-vlan)# vlan 999
SW1(config-vlan)# name PARKING
SW1(config-vlan)# vlan 40
SW1(config-vlan)# end
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
                                                Fa0/5, Fa0/6, Fa0/7, Fa0/8
                                                Fa0/9, Fa0/10, Fa0/11, Fa0/12
                                                Fa0/13, Fa0/14, Fa0/15, Fa0/16
                                                Fa0/17, Fa0/18, Fa0/19, Fa0/20
                                                Fa0/21, Fa0/22, Fa0/23, Fa0/24
                                                Gi0/1, Gi0/2
10   SALES                            active
20   VOICE                            active
30   ENGINEERING                      active
40   VLAN0040                         active
999  PARKING                          active
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,
    highlight: ['name SALES', 'VLAN0040'],
    caption: 'New VLANs exist but own no ports until interfaces are assigned.',
    notes:
      "`vlan 10` creates VLAN 10, or opens it if it already exists, and moves you into VLAN configuration mode, prompt `(config-vlan)#`. `name SALES` gives it a name of up to 32 characters. Names are local labels only; they never travel inside frames, but consistent names make outputs far easier to read. You can move straight from one VLAN to the next without typing `exit`, as the transcript does. VLAN 40 was created without a name, so IOS named it **VLAN0040**: the word VLAN plus the ID padded to four digits. Changes made in VLAN configuration mode are applied when you leave that mode. You can also create several VLANs at once with a list or a range, such as `vlan 100,200` or `vlan 100-105`. In the output, the new VLANs are active but have no ports yet, because creating a VLAN does not assign any interfaces to it. Every port, including both uplinks, still sits in VLAN 1. Assigning ports is the next step, done on the interfaces themselves.",
  },
  {
    kind: 'bullets',
    title: 'Access ports: one VLAN, untagged frames',
    bullets: [
      'An **access port** belongs to exactly **one** data VLAN',
      'Frames leave the port **untagged**; the host never sees a VLAN ID',
      'The switch tracks each port\'s VLAN internally',
      '`switchport mode access` also disables DTP trunk negotiation',
      'Hosts in different VLANs need a router to communicate',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 4.2, y: 1.3 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'gateway for both VLANs', x: 8.3, y: 1.3 },
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'VLAN 10', x: 1.6, y: 3.8 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: 'VLAN 30', x: 6.8, y: 3.8 },
      ],
      links: [
        { from: 'sw', to: 'pc1', fromLabel: 'Fa0/1', label: 'untagged' },
        { from: 'sw', to: 'pc2', fromLabel: 'Fa0/5', label: 'untagged' },
        { from: 'sw', to: 'r1', fromLabel: 'Gi0/1', label: 'trunk', style: 'dashed' },
      ],
    },
    notes:
      "An **access port** connects an end device such as a PC, printer or server, and belongs to exactly one data VLAN. Frames enter and leave the port **untagged**: the host has no idea VLANs exist and simply sends normal Ethernet frames. The switch remembers which VLAN each port belongs to and uses that to decide where a frame may go. So PC1 on Fa0/1 lives in VLAN 10 and PC2 on Fa0/5 in VLAN 30, even though both cables plug into the same switch. To reach each other, their packets must go through R1, which acts as the default gateway for both subnets. Configuring `switchport mode access` explicitly is best practice for two reasons: it documents intent, and it turns off DTP, so the port can never be negotiated into a trunk by whatever is plugged into it. Trunks, which carry many VLANs between switches using 802.1Q tags, like the dashed link toward R1, are the subject of the next lesson.",
  },
  {
    kind: 'cli',
    title: 'Configuring access ports',
    code: `SW1(config)# interface range fastethernet0/1 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# exit
SW1(config)# interface fastethernet0/5
SW1(config-if)# description Eng-1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 30
SW1(config-if)# interface fastethernet0/9
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 50
% Access VLAN does not exist. Creating vlan 50`,
    highlight: ['switchport mode access', 'switchport access vlan 10', '% Access VLAN does not exist. Creating vlan 50'],
    caption: 'Two commands per port: the mode and the VLAN.',
    notes:
      "Two interface commands make an access port: `switchport mode access` fixes the port's role, and `switchport access vlan 10` chooses the VLAN; their order does not matter. `interface range` applies the same commands to many ports at once. Note the spaces around the dash in `fastethernet0/1 - 4`, and that the prompt becomes `(config-if-range)#`. You can also combine lists, as in `interface range fa0/1 - 4 , fa0/7`. A `description` costs nothing and appears in `show interfaces status`, which makes troubleshooting much faster. Watch the last command: VLAN 50 did not exist, so IOS created it automatically and printed `% Access VLAN does not exist. Creating vlan 50`. The new VLAN gets the default name VLAN0050. This auto-creation happens on switches in VTP server or transparent mode; a VTP client cannot create VLANs, so its port simply stays inactive until the VLAN arrives through VTP. Without any of these commands, a Catalyst 2960 port sits in VLAN 1 in `dynamic auto` mode.",
  },
  {
    kind: 'cli',
    title: 'Parking unused ports',
    code: `SW1(config)# vlan 999
SW1(config-vlan)# name PARKING
SW1(config-vlan)# exit
SW1(config)# interface range fastethernet0/13 - 24
SW1(config-if-range)# description UNUSED
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 999
SW1(config-if-range)# shutdown`,
    highlight: ['switchport access vlan 999', 'shutdown'],
    caption: 'Unused VLAN + static access + shutdown = a closed door.',
    notes:
      "Every unused port is an open door. If someone plugs a laptop into a live port left in VLAN 1, they land on whatever that VLAN reaches, often switch management. The recommended hardening is simple. Create a **parking VLAN** (sometimes called a black-hole VLAN) that has no SVI, no router interface and no hosts, such as VLAN 999. Put every unused port in it as a static access port, which also disables DTP so the port cannot be negotiated into a trunk. Then `shutdown` the ports, and add a description so the next engineer knows why. `interface range` makes this a short job even for dozens of ports. When a port is needed later, reverse the process: assign the correct VLAN and enter `no shutdown`. Exam items ask which two actions best secure unused ports; the pair is almost always **assign an unused VLAN** and **shut the port down**. Leaving ports in VLAN 1 or setting them to a dynamic trunking mode are the classic wrong answers.",
  },
  {
    kind: 'diagram',
    title: 'Voice VLAN: phone and PC share a port',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 1.5, y: 1.8 },
        { id: 'ph', icon: 'phone', label: 'IP phone', sub: 'voice VLAN 20', x: 5, y: 1.8, tone: 'accent' },
        { id: 'pc', icon: 'pc', label: 'PC', sub: 'data VLAN 10', x: 8.5, y: 1.8 },
      ],
      links: [
        { from: 'sw', to: 'ph', fromLabel: 'Fa0/1', label: 'VLAN 20 tagged + VLAN 10 untagged' },
        { from: 'ph', to: 'pc', label: 'untagged' },
      ],
      annotations: [{ x: 5, y: 3.4, text: 'voice frames: 802.1Q tag, CoS 5' }],
    },
    caption: 'The phone contains a small switch; the PC plugs into the phone.',
    bullets: [
      'PC frames: **untagged**, access (data) VLAN 10',
      'Phone frames: **802.1Q-tagged** VLAN 20, CoS 5',
      'The switch port is still an **access port**, not a trunk',
    ],
    notes:
      "Most desks have one network cable but two devices, a phone and a PC. A Cisco IP phone solves this with a small **built-in three-port switch**: one port toward the access switch, one port for the PC and one internal port for the phone itself. The switch port then carries two kinds of traffic. PC frames travel **untagged** and belong to the access, or data, VLAN, here VLAN 10. Phone frames carry an **802.1Q tag** with the voice VLAN ID, here 20, and the tag's 3-bit priority field, the **CoS** value, is normally set to **5** for voice so that switches can prioritize it. A separate voice VLAN gives voice its own subnet, which simplifies QoS policies, DHCP scopes and security filtering. Even though the link carries two VLANs, the switch port is still configured as an **access port** with one extra command, and it does not appear in `show interfaces trunk`. Exam questions often test which traffic is tagged (voice) and which is untagged (data).",
  },
  {
    kind: 'diagram',
    title: 'How the phone learns its voice VLAN',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sw', label: 'SW1 Fa0/1', icon: 'switch' },
        { id: 'ph', label: 'IP phone', icon: 'phone' },
        { id: 'pc', label: 'PC', icon: 'pc' },
      ],
      steps: [
        { from: 'sw', to: 'ph', label: 'CDP: voice VLAN is 20', tone: 'accent' },
        { from: 'ph', to: 'sw', label: 'DHCP Discover, tagged VLAN 20', sub: '802.1Q tag with CoS 5' },
        { from: 'pc', to: 'ph', label: 'DHCP Discover, untagged' },
        { from: 'ph', to: 'sw', label: 'Passed through untagged', sub: 'switch places it in access VLAN 10' },
        { note: 'Phone gets a voice-subnet address; PC gets a data-subnet address', tone: 'good' },
      ],
    },
    caption: 'CDP (Cisco) or LLDP-MED (multi-vendor) delivers the voice VLAN ID.',
    notes:
      "How does the phone know to tag its frames with VLAN 20? The switch tells it. When the link comes up, the switch sends **CDP** messages out of the port, and on a port with a voice VLAN configured those messages include the voice VLAN ID. The Cisco phone reads it, starts tagging its own traffic with VLAN 20 and CoS 5, and then requests an IP address with DHCP inside the voice VLAN. Non-Cisco phones use **LLDP-MED**, the standards-based equivalent, for the same purpose. The PC knows none of this: its frames enter the phone's PC port untagged and leave toward the switch still untagged, so the switch places them in the access VLAN. Two consequences appear on the exam. First, if CDP is disabled on the port and LLDP-MED is not in use, a Cisco phone cannot learn the voice VLAN automatically. Second, the phone and the PC end up with addresses in different subnets, which is exactly the goal of the design.",
  },
  {
    kind: 'cli',
    title: 'Configuring and verifying a voice VLAN',
    code: `SW1(config)# interface fastethernet0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 20
SW1(config-if)# end
SW1# show interfaces fastethernet0/1 switchport
Name: Fa0/1
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: Off
Access Mode VLAN: 10 (SALES)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: 20 (VOICE)
...`,
    highlight: ['switchport voice vlan 20', 'Access Mode VLAN: 10 (SALES)', 'Voice VLAN: 20 (VOICE)'],
    caption: 'One extra line turns a normal access port into a phone port.',
    notes:
      "The configuration adds a single line to a normal access port: `switchport voice vlan 20`. The data VLAN is still set by `switchport access vlan 10`, and the port stays in `switchport mode access`. `show interfaces switchport` confirms the result. **Administrative Mode** is what you configured and **Operational Mode** is what the port is actually doing; both read static access. **Negotiation of Trunking: Off** confirms that DTP is disabled. **Access Mode VLAN: 10 (SALES)** is the data VLAN and **Voice VLAN: 20 (VOICE)** is the voice VLAN, each followed by its name in parentheses. The trunking lines, such as the native VLAN, are listed for every port but take effect only if the port becomes a trunk. Make sure the voice VLAN exists on the switch, just like any other VLAN. QoS trust settings for the phone's CoS markings belong to the QoS material; for this lesson, focus on the two VLAN commands and on reading this output line by line.",
  },
  {
    kind: 'cli',
    title: 'Reading show vlan brief',
    code: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/10, Fa0/11, Fa0/12, Gi0/2
10   SALES                            active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
20   VOICE                            active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
30   ENGINEERING                      active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
50   VLAN0050                         active    Fa0/9
999  PARKING                          active    Fa0/13, Fa0/14, Fa0/15, Fa0/16
                                                Fa0/17, Fa0/18, Fa0/19, Fa0/20
                                                Fa0/21, Fa0/22, Fa0/23, Fa0/24
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,
    highlight: ['VLAN0050', 'act/unsup'],
    caption: 'Gi0/1 is missing because it is a trunk; Fa0/1 to Fa0/4 also carry voice VLAN 20.',
    notes:
      "`show vlan brief` is the most-used VLAN command, so learn every column. **VLAN** and **Name** identify each VLAN. **Status** is normally `active`, while `act/lshut` means locally shut down and `act/unsup` marks the legacy VLANs 1002 to 1005. **Ports** lists the **access ports** in each VLAN, four per line with continuation lines below. Three details trip people up. First, **trunk ports never appear** here; Gi0/1 is missing because it is a trunk, so use `show interfaces trunk` for trunks. Second, ports with a voice VLAN are listed twice: Fa0/1 to Fa0/4 appear under data VLAN 10 and again under voice VLAN 20. Third, a port assigned to a VLAN that does not exist is not listed anywhere. Also notice VLAN 50: its default name VLAN0050 hints that it was auto-created by `switchport access vlan 50`. When an exhibit asks why a host cannot talk to its neighbors, find the host's port in this output and compare its VLAN with theirs.",
  },
  {
    kind: 'cli',
    title: 'Reading show interfaces switchport',
    code: `SW1# show interfaces fastethernet0/10 switchport
Name: Fa0/10
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none
...`,
    highlight: ['Administrative Mode: dynamic auto', 'Operational Mode: static access', 'Negotiation of Trunking: On', 'Access Mode VLAN: 1 (default)'],
    caption: 'A port left at factory defaults: dynamic auto, DTP on, VLAN 1.',
    notes:
      "`show interfaces switchport` gives the full VLAN picture for one port, and it is the best place to spot a port left at its defaults. Fa0/10 was never configured. **Administrative Mode: dynamic auto** is the Catalyst 2960 default: the port runs DTP and will become a trunk if the other side asks for one. **Operational Mode: static access** shows that, for now, it is acting as an access port because the attached PC does not negotiate. **Negotiation of Trunking: On** confirms that DTP is running. **Access Mode VLAN: 1 (default)** shows the port is in the default VLAN. Compare this with a properly configured port: administrative mode static access, negotiation off and the intended VLAN. When the VLAN in the Access Mode line is followed by **(Inactive)** instead of a name, the VLAN does not exist on this switch, which is a common exam scenario. To fix Fa0/10, apply `switchport mode access` and `switchport access vlan` with the correct VLAN for the host.",
  },
  {
    kind: 'cli',
    title: 'Reading show interfaces status',
    code: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1     Sales-1            connected    10         a-full  a-100 10/100BaseTX
Fa0/2     Sales-2            connected    10         a-full  a-100 10/100BaseTX
Fa0/5     Eng-1              connected    30         a-full  a-100 10/100BaseTX
Fa0/9                        notconnect   50           auto   auto 10/100BaseTX
Fa0/10                       connected    1          a-full  a-100 10/100BaseTX
Fa0/13    UNUSED             disabled     999          auto   auto 10/100BaseTX
Gi0/1     Uplink to SW2      connected    trunk      a-full a-1000 10/100/1000BaseTX`,
    highlight: ['notconnect', 'disabled', 'trunk'],
    caption: 'Output trimmed to a few ports; one line per interface.',
    notes:
      "`show interfaces status` gives one line per port and is ideal for scanning a whole switch. **Name** is the interface description. **Status** shows `connected` for a working link, `notconnect` when nothing is plugged in or the far end is off, `disabled` when the port is administratively shut down, and `err-disabled` when a feature such as port security has shut it down. **Vlan** shows the access VLAN, or the word `trunk` for trunk ports. **Duplex** and **Speed** show the current values, with an `a-` prefix meaning auto-negotiated. In this output you can immediately spot two things worth a second look. Fa0/10 is connected but sits in VLAN 1, the sign of a port that was never configured. Fa0/13 is disabled in VLAN 999, which is exactly how a parked port should look. On the exam, pair this command with `show vlan brief`: link and status problems show up here, while VLAN membership problems show up in both outputs.",
  },
  {
    kind: 'cli',
    title: 'Deleting a VLAN strands its ports',
    code: `SW1(config)# no vlan 30
SW1(config)# end
SW1# show vlan brief | include Fa0/5
SW1# show interfaces fastethernet0/5 switchport | include Access Mode
Access Mode VLAN: 30 (Inactive)
SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# vlan 30
SW1(config-vlan)# name ENGINEERING
SW1(config-vlan)# end
SW1# show interfaces fastethernet0/5 switchport | include Access Mode
Access Mode VLAN: 30 (ENGINEERING)`,
    highlight: ['no vlan 30', 'Access Mode VLAN: 30 (Inactive)', 'Access Mode VLAN: 30 (ENGINEERING)'],
    caption: 'An empty include result is itself the evidence: Fa0/5 is in no existing VLAN.',
    notes:
      "Deleting a VLAN with `no vlan 30` does not move its ports anywhere. They remain assigned to VLAN 30, but because VLAN 30 no longer exists they become **inactive** and stop forwarding traffic. Every host on those ports loses connectivity, even though the links still show connected. The clues are distinctive: the ports vanish from `show vlan brief`, since there is no VLAN 30 to list them under, and `show interfaces switchport` shows `Access Mode VLAN: 30 (Inactive)`. The fix is either to recreate the VLAN, after which the ports resume forwarding automatically, or to assign the ports to another VLAN. The transcript uses output filters to keep things short; the empty result from `show vlan brief | include Fa0/5` is itself the evidence. Before deleting any VLAN, check which ports use it and move them first. IOS refuses to delete VLAN 1 and VLANs 1002 to 1005, and removing every VLAN at once is done by deleting vlan.dat and reloading.",
  },
  {
    kind: 'cli',
    title: 'A VLAN that is shut down',
    code: `SW1(config)# vlan 10
SW1(config-vlan)# shutdown
SW1(config-vlan)# end
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/9, Fa0/10, Fa0/11, Fa0/12
                                                Gi0/2
10   SALES                            act/lshut Fa0/1, Fa0/2, Fa0/3, Fa0/4
30   ENGINEERING                      active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
...
SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# no shutdown vlan 10`,
    highlight: ['act/lshut', 'no shutdown vlan 10'],
    caption: 'act/lshut: the VLAN exists but is shut down locally.',
    notes:
      "A VLAN can also exist yet be unusable. `shutdown` in VLAN configuration mode (or `shutdown vlan 10` in global configuration mode) stops all traffic for that VLAN on this switch. `show vlan brief` then shows the status **act/lshut**, meaning active in the database but locally shut down. The ports are still listed and their links still show connected, so the problem is easy to miss if you only check interfaces. Fix it with `no shutdown` under `vlan 10`, or `no shutdown vlan 10` in global configuration mode as shown. A related option, `state suspend` under the VLAN, suspends it; VTP propagates a suspended state to other switches in the domain, whereas `shutdown` affects only the local switch. Do not confuse VLAN shutdown with interface shutdown: an administratively down interface shows `disabled` in `show interfaces status`, while a shut VLAN leaves the interfaces up but silent. Exam exhibits sometimes hide `act/lshut` in a long `show vlan brief` output, so read the Status column for every VLAN.",
  },
  {
    kind: 'diagram',
    title: 'Troubleshooting a host in a VLAN',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'Port up?', sub: 'show interfaces status', shape: 'diamond' },
        { id: 'n2', label: 'Right VLAN?', sub: 'show interfaces switchport', shape: 'diamond' },
        { id: 'n3', label: 'VLAN exists?', sub: 'show vlan brief', shape: 'diamond' },
        { id: 'n4', label: 'VLAN active?', sub: 'not act/lshut', shape: 'diamond' },
        { id: 'n5', label: 'Check trunks, IP, gateway', shape: 'round', tone: 'accent' },
      ],
    },
    caption: 'Answer each question in order; fix the first "no" you find.',
    notes:
      "When a host cannot reach others in its own VLAN, work through the checks in order. First, is the port up? `show interfaces status` tells you whether it is connected, notconnect, disabled or err-disabled. Second, is the port in the **right VLAN**? Compare the VLAN in `show interfaces status` or `show interfaces switchport` with the documentation and with the other hosts in that subnet. Third, does the VLAN **exist**? If the port is missing from `show vlan brief` and shows `(Inactive)`, create the VLAN. Fourth, is the VLAN **active**, or does it show act/lshut or suspended? Only when all four checks pass do you move on to trunks between switches, covered next, and to host IP settings such as the mask and default gateway. This order matters on the exam, because simulation tickets often chain two faults together: for example, a port in the wrong VLAN plus a VLAN that was never created on a second switch.",
  },
  {
    kind: 'table',
    title: 'Symptoms, causes and fixes',
    columns: ['Symptom', 'Likely cause', 'Fix'],
    rows: [
      ['Port connected, host cannot reach its subnet', 'Port in the **wrong VLAN**', '`switchport access vlan` with the correct ID'],
      ['Port missing from `show vlan brief`; shows `(Inactive)`', 'VLAN **deleted or never created**', 'Create the VLAN (`vlan 30`)'],
      ['All ports of one VLAN silent at once', 'VLAN **shut down** (`act/lshut`)', '`no shutdown` under the VLAN'],
      ['Status `disabled`', 'Interface **shut down**', '`no shutdown` on the interface'],
      ['Access port turned into a trunk', 'Left in `dynamic` mode', '`switchport mode access`'],
      ['`vlan 60` rejected on a VTP client', 'Clients cannot create VLANs', 'Create it on the VTP server'],
    ],
    notes:
      "This table summarizes the faults you must recognize instantly. A port in the **wrong VLAN** looks perfectly healthy: connected, correct speed and duplex, yet the host cannot reach its neighbors because it is in another broadcast domain. The only clue is the VLAN number. A **deleted or never-created VLAN** makes its ports inactive: they disappear from `show vlan brief` and show `(Inactive)` in the switchport output. A **shut-down VLAN** shows act/lshut and silences every port in it at once. An **interface shutdown** shows disabled. A port left in a dynamic mode can unexpectedly become a trunk when it is plugged into another switch or any device that runs DTP, pulling it out of its access VLAN. Finally, a **VTP client** refuses VLAN creation with an error, so the VLAN must be created on a VTP server for the domain, or the switch must be changed to transparent mode. For each symptom the fix is a single command; the skill being tested is choosing the right one.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: VLANs and access ports',
    body: 'VLAN questions are won by reading `show vlan brief` and `show interfaces switchport` **line by line**.',
    bullets: [
      'Trunk ports never appear in `show vlan brief`',
      'Deleted VLAN: ports stay assigned but **inactive**; never back to VLAN 1',
      '`erase startup-config` keeps VLANs; delete `flash:vlan.dat` too',
      'VLAN 1 and VLANs 1002 to 1005 cannot be deleted',
      'Extended range 1006 to 4094; VTP v1/v2 need transparent mode',
      'Voice port = access port: phone tagged, PC untagged, CDP tells the phone',
      '`switchport access vlan` for a missing VLAN auto-creates it',
    ],
    notes:
      "Every item here has appeared as a distractor or trap. Trunk ports do not appear in `show vlan brief`, so a port missing from that list may be a trunk rather than broken; check `show interfaces trunk` before concluding anything. A deleted VLAN strands its ports: they stay assigned but inactive, and they never fall back to VLAN 1. A switch reset needs vlan.dat deleted as well as the startup-config erased. VLAN 1 and VLANs 1002 to 1005 are permanent. The extended range starts at 1006, and with VTP versions 1 and 2 it requires transparent mode. A voice VLAN port is still an access port: phone frames are tagged with the voice VLAN, PC frames are untagged in the data VLAN, and CDP tells Cisco phones which voice VLAN to use. Finally, remember that `switchport access vlan` for a missing VLAN quietly creates it on a VTP server or transparent switch, which can hide a typo such as VLAN 301 instead of 30.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'VLAN = broadcast domain = subnet; inter-VLAN traffic needs Layer 3',
      'Usable IDs 1 to 4094: normal 1 to 1005, extended 1006 to 4094',
      'VLAN 1 and 1002 to 1005 are permanent; VLANs live in `vlan.dat`',
      '`vlan 10` + `name SALES`; `switchport mode access` + `switchport access vlan 10`',
      'Park unused ports in an unused VLAN and shut them down',
      '`switchport voice vlan 20`: phone tagged, PC untagged, CDP / LLDP-MED',
      'Verify: `show vlan brief`, `show interfaces switchport`, `show interfaces status`',
    ],
    notes:
      "VLANs turn one physical switch into several logical ones. Each VLAN is a separate broadcast domain and normally a separate IP subnet, and traffic between VLANs must be routed. Usable IDs run from 1 to 4094: the normal range is 1 to 1005, with VLAN 1 and VLANs 1002 to 1005 permanent, and the extended range is 1006 to 4094. Normal-range VLANs live in vlan.dat in flash. You create VLANs with `vlan` and `name`, assign access ports with `switchport mode access` and `switchport access vlan`, park unused ports in an unused VLAN and shut them down, and add `switchport voice vlan` for IP phones, which learn the voice VLAN through CDP or LLDP-MED. You verify with `show vlan brief`, `show interfaces switchport` and `show interfaces status`, and you troubleshoot by checking port state, VLAN membership, VLAN existence and VLAN status, in that order. Next, trunks carry many VLANs between switches over a single link.",
  },
];

export default slides;
