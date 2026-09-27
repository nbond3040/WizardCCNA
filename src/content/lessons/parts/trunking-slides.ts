import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Trunking with 802.1Q',
    subtitle: 'Carrying many VLANs over one link: tags, native VLAN, DTP and VTP',
    notes:
      "In the VLAN lesson every port belonged to exactly one VLAN. That breaks down as soon as a VLAN spans two switches: you cannot run a separate cable for every VLAN between every pair of switches. **Trunks** solve this by carrying frames from many VLANs over one link, marking each frame with its VLAN in an **802.1Q tag**. In this deck you will dissect the 4-byte tag field by field, learn why the **native VLAN** travels untagged and what happens when the two ends disagree, and configure trunks, including the extra encapsulation command on multi-encapsulation switches and the allowed-VLAN list with its add, remove, except and none keywords. You will master the **DTP** negotiation matrix, especially the classic auto plus auto result, and read every section of `show interfaces trunk`. Finally you will get an awareness-level view of **VTP**, its modes and its revision-number danger, plus a systematic approach to trunk troubleshooting. The material applies equally to the v1.1 and v2.0 blueprints.",
  },
  {
    kind: 'bullets',
    title: 'Why trunks?',
    bullets: [
      'VLANs usually span **several switches**',
      'One cable per VLAN between switches does not scale',
      'A **trunk** carries many VLANs over a single link',
      'Each frame is marked with its VLAN in an **802.1Q tag**',
      'Access ports send untagged frames; trunks tag them',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 2.5, y: 1.3 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.5, y: 1.3 },
        { id: 's1', icon: 'pc', label: 'Sales-1', sub: 'VLAN 10', x: 1.2, y: 3.8 },
        { id: 'e1', icon: 'pc', label: 'Eng-1', sub: 'VLAN 30', x: 3.8, y: 3.8 },
        { id: 's2', icon: 'pc', label: 'Sales-2', sub: 'VLAN 10', x: 6.2, y: 3.8 },
        { id: 'e2', icon: 'pc', label: 'Eng-2', sub: 'VLAN 30', x: 8.8, y: 3.8 },
      ],
      links: [
        { from: 'sw1', to: 'sw2', label: '802.1Q trunk: VLANs 10 and 30', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', style: 'thick', tone: 'accent' },
        { from: 'sw1', to: 's1', fromLabel: 'Fa0/1' },
        { from: 'sw1', to: 'e1', fromLabel: 'Fa0/5' },
        { from: 'sw2', to: 's2', fromLabel: 'Fa0/1' },
        { from: 'sw2', to: 'e2', fromLabel: 'Fa0/5' },
      ],
    },
    notes:
      "Sales-1 and Sales-2 are both in VLAN 10 but connect to different switches, and the same is true for the two engineering hosts in VLAN 30. When SW1 sends a frame to SW2, SW2 must know which VLAN it belongs to, otherwise it cannot tell whether to deliver it to Sales-2 or Eng-2. The old answer was one physical link per VLAN, which wastes ports and cabling and collapses as soon as you have dozens of VLANs. A **trunk** is a single link that carries frames for many VLANs. The sending switch adds an **802.1Q tag** containing the VLAN ID; the receiving switch reads it, removes it and delivers the original frame out of its access ports in that VLAN. End hosts never see the tag, because access ports always send untagged frames. Trunks connect switches to switches, and also switches to routers and servers that understand tags, such as a router-on-a-stick, which you will meet in the inter-VLAN routing lesson.",
  },
  {
    kind: 'diagram',
    title: 'The 802.1Q tag in the frame',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Dest MAC', size: 6 },
        { label: 'Src MAC', size: 6 },
        { label: '802.1Q tag', size: 4, tone: 'accent', sub: 'inserted' },
        { label: 'Type/Len', size: 2 },
        { label: 'Payload', size: 1500, sub: '46 to 1500' },
        { label: 'FCS', size: 4, tone: 'muted', sub: 'recalculated' },
      ],
    },
    caption: 'The tag sits after the source MAC; the frame grows by 4 bytes and gets a new FCS.',
    notes:
      "802.1Q does not wrap the frame in a new header. Instead, the sending switch **inserts a 4-byte tag** between the source MAC address and the EtherType/Length field. Everything else stays in place, but because the frame's contents changed, the switch must compute a **new FCS**. The tag also makes the frame 4 bytes longer, so a maximum-size frame grows from 1518 to 1522 bytes; switches that support 802.1Q accept these slightly larger frames. The receiving switch reads the tag to learn the VLAN, and removes it before forwarding the frame out of access ports in that VLAN, or keeps it when forwarding the frame onto another trunk. End hosts on access ports never see tags. Exam questions about the tag usually ask where it goes (after the source MAC), how big it is (4 bytes) and what happens to the FCS (it is recalculated). Compare this with Cisco's old ISL method, covered two slides later, which encapsulated the whole original frame instead.",
  },
  {
    kind: 'diagram',
    title: 'Inside the 4-byte tag',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'TPID', size: 16, sub: '0x8100' },
        { label: 'PCP', size: 3, sub: 'CoS 0-7' },
        { label: 'DEI', size: 1 },
        { label: 'VID', size: 12, sub: 'VLAN 1-4094', tone: 'accent' },
      ],
    },
    caption: 'TPID 16 + PCP 3 + DEI 1 + VID 12 = 32 bits.',
    notes:
      "The 32 bits of the tag split into four fields. The **TPID** (Tag Protocol Identifier) is 16 bits and always `0x8100`. It sits exactly where the EtherType would normally be, so any device reading the frame immediately knows a tag follows. The remaining 16 bits are the Tag Control Information. **PCP** (Priority Code Point) is 3 bits and carries the **CoS** value, 0 to 7, used for Layer 2 QoS; voice is typically marked 5. **DEI** (Drop Eligible Indicator, formerly called CFI) is 1 bit that marks frames which may be discarded first during congestion. The **VID** (VLAN Identifier) is 12 bits, giving 4096 values, of which 0 and 4095 are reserved, so VLANs 1 to 4094 are usable. That 12-bit limit is exactly why the extended VLAN range ends at 4094. Expect a drag-and-drop item that matches each field to its size or purpose, and remember the TPID value 0x8100, which also appears as the EtherType of tagged frames in packet captures.",
  },
  {
    kind: 'compare',
    title: '802.1Q vs ISL',
    left: {
      heading: 'IEEE 802.1Q',
      tone: 'accent',
      bullets: [
        'Open standard, supported by every vendor',
        '**Inserts** a 4-byte tag into the frame',
        'Native VLAN frames are sent **untagged**',
        'VLAN IDs 1 to 4094',
        'Only option on many current switches (e.g. Catalyst 2960)',
      ],
    },
    right: {
      heading: 'Cisco ISL (legacy)',
      bullets: [
        'Cisco proprietary and obsolete',
        '**Encapsulates** the whole frame: 26-byte header + 4-byte trailer',
        'No native VLAN: every frame is encapsulated',
        'Found only on older multi-encapsulation switches',
      ],
    },
    notes:
      "Two trunking encapsulations exist, but only one matters in practice. **IEEE 802.1Q** is the open standard. It inserts a small tag into the existing frame, leaves the native VLAN untagged, supports VLAN IDs up to 4094 and works between any vendors' equipment. **Inter-Switch Link (ISL)** was Cisco's proprietary method. Rather than inserting a tag, it encapsulated the entire original frame inside a new 26-byte header plus a 4-byte trailer, 30 bytes of overhead in total, and because every frame was encapsulated it had no concept of a native VLAN. ISL is obsolete: many current Catalyst switches, including the 2960, support only 802.1Q, and the `switchport trunk encapsulation` command simply does not exist on them. On older multi-encapsulation switches such as the 3560 and 3750, you still have to choose the encapsulation, as you will see shortly. For the exam, know that ISL is Cisco proprietary and legacy, that it encapsulates rather than tags, and that 802.1Q is the answer to any 'which standard' question.",
  },
  {
    kind: 'diagram',
    title: 'The native VLAN travels untagged',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sw1', label: 'SW1 (native 99)', icon: 'switch' },
        { id: 'sw2', label: 'SW2 (native 99)', icon: 'switch' },
      ],
      steps: [
        { from: 'sw1', to: 'sw2', label: 'VLAN 10 frame', sub: '802.1Q tag, VID 10' },
        { from: 'sw1', to: 'sw2', label: 'VLAN 30 frame', sub: '802.1Q tag, VID 30' },
        { from: 'sw1', to: 'sw2', label: 'VLAN 99 frame', sub: 'native VLAN: no tag', tone: 'accent' },
        { note: 'SW2 places every untagged frame into its own native VLAN' },
      ],
    },
    bullets: [
      'Default native VLAN: **VLAN 1**',
      '==The native VLAN must match on both ends of the trunk==',
      'Best practice: an unused VLAN (e.g. 99 or 999) on every trunk',
    ],
    notes:
      "802.1Q defines one VLAN per trunk whose frames are sent **without a tag**: the **native VLAN**. Any untagged frame arriving on a trunk is placed into the receiving switch's native VLAN. The feature exists for backward compatibility with devices that do not understand tags, but its real importance for the exam is that both ends must agree. The default native VLAN is VLAN 1 on every Cisco switch. Security guidance says to change it to an unused VLAN, identical on every trunk, and to keep user traffic out of it. That defeats the double-tagging form of VLAN hopping, in which an attacker in the native VLAN crafts frames with two tags: the first switch strips the outer tag as native traffic and the next switch delivers the frame into the VLAN named by the inner tag. Remember that ISL has no native VLAN at all, and that the native VLAN must also be in the trunk's allowed list if you expect any untagged traffic to cross it.",
  },
  {
    kind: 'cli',
    title: 'Configuring a trunk on a Catalyst 2960',
    code: `SW1(config)# vlan 99
SW1(config-vlan)# name NATIVE
SW1(config-vlan)# exit
SW1(config)# interface gigabitethernet0/1
SW1(config-if)# description Trunk to SW2
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,30,99
SW1(config-if)# switchport nonegotiate
SW1(config-if)# end`,
    highlight: ['switchport mode trunk', 'switchport trunk native vlan 99', 'switchport trunk allowed vlan 10,20,30,99', 'switchport nonegotiate'],
    caption: 'Mirror the mode, native VLAN and allowed list on SW2 Gi0/1.',
    notes:
      "On a Catalyst 2960, which supports only 802.1Q, a trunk needs just `switchport mode trunk`. The other lines are best practice. First create the VLAN you will use as the native VLAN, here VLAN 99 named NATIVE, so that it exists on the switch. `switchport trunk native vlan 99` changes the native VLAN from the default VLAN 1; configure the identical command on the neighbor's port. `switchport trunk allowed vlan 10,20,30,99` limits the trunk to the VLANs that actually need to cross it, instead of the default of all VLANs 1 to 4094; this reduces unnecessary flooding and limits the impact of problems in other VLANs. `switchport nonegotiate` stops the port from sending DTP frames. Because the neighbor then receives no DTP at all, it must also be configured with `switchport mode trunk`, or no trunk will form. A `description` identifies the link for the next engineer. Verification comes later with `show interfaces trunk`; for now, note that all of these are interface commands entered under the trunk port itself.",
  },
  {
    kind: 'cli',
    title: 'Multi-encapsulation switches',
    code: `SW3(config)# interface gigabitethernet0/1
SW3(config-if)# switchport mode trunk
Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.
SW3(config-if)# switchport trunk encapsulation dot1q
SW3(config-if)# switchport mode trunk
SW3(config-if)# end
SW3# show interfaces gigabitethernet0/1 switchport | include Encapsulation
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q`,
    highlight: ['Command rejected', 'switchport trunk encapsulation dot1q'],
    caption: 'SW3 is a Catalyst 3560, which supports both ISL and 802.1Q.',
    notes:
      "Switches that support both ISL and 802.1Q, such as the Catalyst 3560 and 3750, default to a trunk encapsulation of **negotiate** (called Auto in the error message). IOS refuses to make such a port a static trunk until you choose an encapsulation, producing the rejection in the transcript. The fix is to enter `switchport trunk encapsulation dot1q` first, then `switchport mode trunk`. On a Catalyst 2960, which only speaks 802.1Q, the encapsulation command does not exist, so do not look for it there. Ports left in a dynamic mode on a multi-encapsulation switch negotiate the encapsulation through DTP as well as the trunk status, and ISL is preferred when both sides support it; that is one more reason to configure trunks statically. Verify with `show interfaces switchport`, whose Administrative and Operational Trunking Encapsulation lines should read dot1q, or with the Encapsulation column of `show interfaces trunk`, which shows `802.1q`, or `n-802.1q` when the encapsulation was negotiated. Exam simulations often use Layer 3 switches, so remember this order.",
  },
  {
    kind: 'table',
    title: 'Controlling the allowed VLAN list',
    columns: ['Interface command', 'Resulting list (if it was 10,20)'],
    rows: [
      ['`switchport trunk allowed vlan 30,40`', '`30,40`: ==the list is replaced=='],
      ['`switchport trunk allowed vlan add 30`', '`10,20,30`'],
      ['`switchport trunk allowed vlan remove 20`', '`10`'],
      ['`switchport trunk allowed vlan except 1-9`', '`10-4094`'],
      ['`switchport trunk allowed vlan none`', 'No VLANs allowed'],
      ['`switchport trunk allowed vlan all`', '`1-4094` (the default)'],
    ],
    notes:
      "By default a trunk allows **all** VLANs, 1 to 4094. The `switchport trunk allowed vlan` command changes that, and its keywords behave very differently. With just a list, the command **replaces** the entire allowed list. `add` appends VLANs to the current list and `remove` deletes them from it. `except` allows every VLAN except the ones you name, which is handy for excluding a small range. `none` blocks everything and `all` restores the default. The table assumes the list was 10,20 before each command, and the second column shows what the list becomes. The classic outage is typing `switchport trunk allowed vlan 40` to add VLAN 40 to a production trunk: every other VLAN is instantly removed and the trunk carries only VLAN 40. Exam questions give a starting list and a sequence of commands and ask for the result, so compute carefully, one command at a time, remembering that only `add` and `remove` depend on the previous list; the other forms ignore it completely.",
  },
  {
    kind: 'cli',
    title: 'The allowed-list trap in action',
    code: `SW1(config)# interface gigabitethernet0/1
SW1(config-if)# switchport trunk allowed vlan 40
SW1(config-if)# do show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       40

Port        Vlans allowed and active in management domain
Gi0/1       40

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       40
SW1(config-if)# switchport trunk allowed vlan add 10,20,30,99`,
    highlight: ['switchport trunk allowed vlan 40', 'switchport trunk allowed vlan add 10,20,30,99'],
    caption: 'The engineer meant to add VLAN 40 but replaced the whole list.',
    notes:
      "Here an engineer wanted to add VLAN 40 to a trunk that carried VLANs 10, 20, 30 and 99, but forgot the `add` keyword. The very next `show interfaces trunk` shows the damage: VLAN 40 is now the only VLAN allowed, active and forwarding. Every user in VLANs 10, 20 and 30 on the far switch has just lost connectivity to everything on this side, and the native VLAN 99 is no longer allowed either. The recovery is the command at the bottom: `add` puts the missing VLANs back while keeping 40. In production you would type the full intended list in one command, or use `add` from the start. Notice how useful the `do` keyword is here: the engineer verified from interface configuration mode without leaving it. When you meet an exhibit in which one or several VLANs suddenly fail across a trunk while others still work, the allowed list on both ends should be the first thing you check, before looking at VLAN existence or spanning tree.",
  },
  {
    kind: 'table',
    title: 'DTP modes',
    columns: ['Interface mode', 'Behavior', 'Trunks with a neighbor in'],
    rows: [
      ['`switchport mode access`', 'Never trunks', 'No mode (always an access link)'],
      ['`switchport mode trunk`', 'Always trunks; DTP invites the neighbor', 'trunk, desirable, auto'],
      ['`switchport mode dynamic desirable`', 'Actively asks to trunk', 'trunk, desirable, auto'],
      ['`switchport mode dynamic auto`', 'Waits to be asked (2960 default)', 'trunk, desirable'],
      ['`switchport nonegotiate`', 'Sends no DTP; only with access or trunk', 'A neighbor hard-set to trunk'],
    ],
    notes:
      "**DTP**, the Dynamic Trunking Protocol, is a Cisco-proprietary protocol that lets two switch ports agree whether their link should be a trunk. Each port uses one of four administrative modes. `access` never trunks. `trunk` always trunks and uses DTP to encourage the neighbor to trunk too. `dynamic desirable` actively asks the neighbor to form a trunk and succeeds if the neighbor is trunk, desirable or auto. `dynamic auto` never asks; it only agrees when the neighbor asks, so it trunks with trunk or desirable neighbors. On a Catalyst 2960 the default is `dynamic auto`; some older platforms defaulted to desirable. `switchport nonegotiate` turns off DTP frames entirely and can only be combined with access or trunk mode. Because an attacker's device could speak DTP to a dynamic port and become a trunk (switch spoofing), best practice is to hard-code every port as access or trunk and disable negotiation where possible. DTP negotiation also fails when the two switches have different VTP domain names.",
  },
  {
    kind: 'table',
    title: 'DTP combination matrix',
    columns: ['Side A \\ Side B', 'Access', 'Trunk', 'Dynamic desirable', 'Dynamic auto'],
    rows: [
      ['**Access**', 'Access', 'Limited connectivity', 'Access', 'Access'],
      ['**Trunk**', 'Limited connectivity', 'Trunk', 'Trunk', 'Trunk'],
      ['**Dynamic desirable**', 'Access', 'Trunk', 'Trunk', 'Trunk'],
      ['**Dynamic auto**', 'Access', 'Trunk', 'Trunk', '==Access=='],
    ],
    caption: 'A trunk needs at least one side that actively wants it: trunk or desirable.',
    notes:
      "Memorize this grid; it is one of the most tested facts in the trunking topic. Read a cell as 'side A mode plus side B mode gives this link state'. A trunk forms whenever at least one side **actively** wants it (trunk or desirable) and the other side is willing (trunk, desirable or auto). The famous trap is **auto plus auto**: both sides are willing but neither asks, so the link stays an access link and only the access VLAN crosses it. Any combination with `access` ends as an access link, except access plus trunk, which is a misconfiguration: one side tags frames while the other expects untagged traffic, giving **limited connectivity** in which the native VLAN on one side and the access VLAN on the other are effectively merged. Also remember that `nonegotiate` takes DTP out of the conversation: a trunk port with nonegotiate facing a neighbor in auto or desirable does not form a trunk, because the dynamic side never receives a request or an answer.",
  },
  {
    kind: 'cli',
    title: 'auto + auto = no trunk',
    code: `SW1# show interfaces gigabitethernet0/1 switchport | include Mode:
Administrative Mode: dynamic auto
Operational Mode: static access

SW2# show interfaces gigabitethernet0/1 switchport | include Mode:
Administrative Mode: dynamic auto
Operational Mode: static access

SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# interface gigabitethernet0/1
SW1(config-if)# switchport mode dynamic desirable
SW1(config-if)# end
SW1# show interfaces gigabitethernet0/1 switchport | include Mode:
Administrative Mode: dynamic desirable
Operational Mode: trunk`,
    highlight: ['Administrative Mode: dynamic auto', 'Operational Mode: static access', 'Operational Mode: trunk'],
    caption: 'Two switches left at defaults never trunk; one active side fixes it.',
    notes:
      "This transcript shows the auto plus auto trap on two new switches connected through Gi0/1. Both ports are at the 2960 default, `dynamic auto`, so each waits for the other to ask, and both end up with **Operational Mode: static access**. The link works for VLAN 1 only, which is why the problem often goes unnoticed until someone creates VLAN 10 on both switches and finds that its hosts cannot reach each other. The filter `include Mode:` shows just the two mode lines, because the colon excludes the Access Mode VLAN and Native Mode VLAN lines. The fix shown here is to change one side to `dynamic desirable`; after DTP negotiates, SW1 reports **Operational Mode: trunk**, and SW2, still in auto, becomes a trunk too. Changing either side to `switchport mode trunk` works as well, and hard-coding both sides as `trunk`, optionally with `nonegotiate`, is the most predictable choice. On the exam, whenever two switches are left at defaults and VLAN traffic does not cross the link, think auto plus auto.",
  },
  {
    kind: 'cli',
    title: 'Verifying with show interfaces trunk',
    code: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99
Gi0/2       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,30,99
Gi0/2       1-4094

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30,99
Gi0/2       1,10,20,30,99,999

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30,99
Gi0/2       1,10,30,99,999`,
    highlight: ['Native vlan', '1-4094', '1,10,30,99,999'],
    caption: 'Four sections: status, allowed, allowed and active, forwarding and not pruned.',
    notes:
      "`show interfaces trunk` is the key trunk command, and exam exhibits love it. The first section lists each **operational** trunk with its DTP **Mode** (`on` means `switchport mode trunk`; `desirable` or `auto` means negotiated), the **Encapsulation**, the **Status** and the **Native vlan**. Compare the native VLAN on both ends to detect mismatches. The next three sections form a funnel. **Vlans allowed on trunk** is the configured allowed list: Gi0/1 was restricted to 10,20,30,99 while Gi0/2 still allows the default 1-4094. **Vlans allowed and active in management domain** keeps only the allowed VLANs that actually exist and are active on this switch, which is why Gi0/2 shows only the handful of VLANs SW1 has. **Vlans in spanning tree forwarding state and not pruned** keeps only those for which STP is forwarding on this port and VTP pruning has not removed them. On Gi0/2, VLAN 20 is missing from the last line, so STP is blocking that port for VLAN 20, a normal result of loop prevention in a redundant design.",
  },
  {
    kind: 'diagram',
    title: 'Reading the three VLAN lists as a funnel',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Allowed on trunk', sub: 'allowed vlan list', shape: 'box' },
        { id: 'b', label: 'Allowed and active', sub: 'VLAN exists, not shut', shape: 'box' },
        { id: 'c', label: 'Forwarding, not pruned', sub: 'STP state, VTP pruning', shape: 'box' },
        { id: 'd', label: 'Traffic crosses', shape: 'round', tone: 'good' },
      ],
      edges: [
        { from: 'a', to: 'b', label: 'exists here?' },
        { from: 'b', to: 'c', label: 'STP forwarding?' },
        { from: 'c', to: 'd', label: 'yes' },
      ],
    },
    caption: 'Find the first list a failing VLAN drops out of; that names the cause.',
    notes:
      "Use the three VLAN sections as a funnel when a VLAN fails across a trunk. If the VLAN is missing from the **first** list, it is not allowed: fix the allowed list with `add`, on whichever end removed it. If it appears in the first list but not the **second**, the VLAN does not exist, or is shut down or suspended, on this switch: create or re-enable it. This is the classic **transit switch** problem, in which the VLAN exists on the two edge switches but not on the switch in the middle, which silently drops the traffic. If it appears in the second list but not the **third**, spanning tree is blocking it on this port or VTP pruning removed it; that is often correct behavior on a redundant link, so check the STP design before changing anything. Always check both ends of the trunk, because each switch builds its own lists, and a VLAN must survive all three filters on every trunk along the path between the two hosts.",
  },
  {
    kind: 'cli',
    title: 'Native VLAN mismatch',
    code: `SW1#
*Sep 26 09:14:05.117: %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (99), with SW2 GigabitEthernet0/1 (1).
*Sep 26 09:14:07.201: %SPANTREE-2-RECV_PVID_ERR: Received BPDU with inconsistent peer vlan id 1 on GigabitEthernet0/1 VLAN99.
*Sep 26 09:14:07.201: %SPANTREE-2-BLOCK_PVID_PEER: Blocking GigabitEthernet0/1 on VLAN0001. Inconsistent peer vlan.
*Sep 26 09:14:07.201: %SPANTREE-2-BLOCK_PVID_LOCAL: Blocking GigabitEthernet0/1 on VLAN0099. Inconsistent local vlan.
SW1# show interfaces trunk | include Gi0/1.*trunking
Gi0/1       on               802.1q         trunking      99
SW2# show interfaces trunk | include Gi0/1.*trunking
Gi0/1       on               802.1q         trunking      1`,
    highlight: ['%CDP-4-NATIVE_VLAN_MISMATCH', '(99)', '(1)', 'Blocking'],
    caption: 'The trunk is up, but CDP complains and STP blocks the affected VLANs.',
    notes:
      "When the two ends of a trunk disagree about the native VLAN, the trunk still comes up, because DTP does not compare native VLANs. The trouble is subtler. Untagged frames that SW1 sends from VLAN 99 arrive at SW2, which places them in its native VLAN 1, so the two VLANs are silently bridged together. Cisco switches detect this in two ways. **CDP** logs `%CDP-4-NATIVE_VLAN_MISMATCH`, naming both ports and both native VLANs (the number in parentheses after each interface), and repeats the message periodically. **PVST+** notices that its BPDUs arrive with an inconsistent VLAN ID and **blocks** the port for both affected VLANs, which is why users in those VLANs lose connectivity across the link. The `show interfaces trunk` lines confirm the cause: native VLAN 99 on SW1 and 1 on SW2. The fix is simply to configure the same `switchport trunk native vlan` on both ends. On the exam, the CDP message is the giveaway, so learn to read which native VLAN each side is using from it.",
  },
  {
    kind: 'table',
    title: 'VTP modes (awareness)',
    columns: ['VTP mode', 'Create or change VLANs?', 'Applies received updates?', 'Forwards VTP messages?'],
    rows: [
      ['**Server** (default)', 'Yes', 'Yes', 'Yes'],
      ['**Client**', '==No==', 'Yes', 'Yes'],
      ['**Transparent**', 'Yes, locally only', 'No', 'Yes'],
      ['**Off**', 'Yes, locally only', 'No', 'No'],
    ],
    caption: 'VTP shares VLAN IDs and names, never port assignments, over trunks within one domain.',
    notes:
      "**VTP**, the VLAN Trunking Protocol, is a Cisco-proprietary protocol that distributes the VLAN database (VLAN IDs and names, not port assignments) to all switches in the same **VTP domain**, over trunk links. It is awareness-level material, but you should know the modes. A **server**, the default mode, can create, modify and delete VLANs and advertises them. A **client** accepts and forwards updates but cannot change VLANs locally; trying produces an error. A **transparent** switch keeps its own local VLAN database and ignores updates for itself, but it forwards VTP messages on to other switches; in version 1 it does so only when the domain name and version match, in version 2 regardless. **Off** mode behaves like transparent but does not forward VTP messages at all. Switches must share the same domain name, and the same password if one is set, to exchange VTP updates. A switch with no domain name configured adopts the first domain name it hears in an advertisement on a trunk.",
  },
  {
    kind: 'bullets',
    title: 'VTP risks and VTPv3',
    bullets: [
      'Every change on a server increments the **configuration revision**',
      '==The highest revision in the domain wins==',
      'A stale switch with a higher revision can wipe production VLANs',
      'Reset the revision: change the domain name, or go transparent and back',
      '**VTPv3**: one primary server, extended VLANs, fewer accidents',
      'Many networks simply run **transparent** or **off** everywhere',
    ],
    notes:
      "Every change on a VTP server increases the **configuration revision number**, and all switches in the domain adopt the database with the highest revision. That creates the famous VTP disaster: an old lab switch with the same domain name and a higher revision number is plugged into production over a trunk. Its database, perhaps missing most VLANs, wins everywhere, the production VLANs vanish, and every access port in those VLANs becomes inactive. In VTP versions 1 and 2 even a client can cause this. Before connecting any used switch, reset its revision to zero, for example by changing its domain name to a dummy value and back, or by switching it to transparent mode and back. **VTP version 3** reduces the risk: only the single **primary server** can change the database, it supports the extended VLAN range, and it can also distribute other databases such as MST instances. Because of these risks, many networks simply run every switch in **transparent** or **off** mode and manage VLANs locally on each switch.",
  },
  {
    kind: 'table',
    title: 'Trunk troubleshooting',
    columns: ['Symptom', 'Cause', 'Fix'],
    rows: [
      ['One VLAN fails across the trunk; others work', 'Not in **Vlans allowed on trunk**', '`switchport trunk allowed vlan add X`'],
      ['Allowed but not **allowed and active**', 'VLAN missing or shut on this switch', 'Create or re-enable the VLAN'],
      ['Active but not **forwarding and not pruned**', 'STP blocking or VTP pruning', 'Usually by design; check STP'],
      ['`NATIVE_VLAN_MISMATCH` logs', 'Different native VLAN on each end', 'Same `switchport trunk native vlan` both sides'],
      ['No trunk forms', 'auto + auto, or nonegotiate vs dynamic', '`switchport mode trunk` on both ends'],
      ['`mode trunk` rejected', 'Encapsulation still negotiate', '`switchport trunk encapsulation dot1q` first'],
    ],
    notes:
      "Trunk problems fall into a few patterns, and each has a signature. If exactly one VLAN fails while others cross the trunk, look at the three VLAN lists in `show interfaces trunk` on both ends: a VLAN absent from the allowed list needs `add`; a VLAN allowed but not active does not exist, or is shut, on that switch; a VLAN active but not forwarding is being blocked by spanning tree or pruned by VTP. If the whole trunk behaves strangely, check the native VLAN: CDP mismatch messages and STP blocking of the two native VLANs are the clues. If the port never becomes a trunk at all, compare DTP modes: auto on both sides, or nonegotiate on one side facing a dynamic port, both leave the link as access. Finally, on a multi-encapsulation switch, `switchport mode trunk` is rejected until the encapsulation is set. In every case, remember that `show vlan brief` will not help much, because trunk ports never appear in it.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: trunking',
    body: 'Most trunk questions are answered by the **DTP matrix**, the **allowed list** or the **native VLAN**.',
    bullets: [
      'auto + auto = **access**, no trunk',
      '`allowed vlan X` **replaces** the list; use `add` to append',
      'Native VLAN frames are **untagged**; both ends must match',
      'Allowed is not active: the VLAN must exist on every switch in the path',
      '802.1Q tag = 4 bytes: TPID 0x8100, PCP 3, DEI 1, VID 12 bits',
      '`switchport trunk encapsulation dot1q` before `mode trunk` on multi-encap switches',
      'Higher VTP revision overwrites the whole domain',
    ],
    notes:
      "These traps cover most trunking questions. The DTP matrix decides whether a link trunks at all, and auto plus auto is the combination Cisco loves to test because it looks as if it should work. The allowed-list keyword trap turns a harmless change into an outage: without `add`, the command replaces the list. The native VLAN is the only untagged VLAN on an 802.1Q trunk, and a mismatch produces CDP messages and STP blocking rather than a trunk that fails to come up. A VLAN that is allowed but not active is missing from that switch, which is the transit-switch problem. Know the tag inside out: 4 bytes after the source MAC, TPID 0x8100, a 3-bit PCP carrying CoS, a 1-bit DEI and a 12-bit VID. On multi-encapsulation switches such as the 3560, the encapsulation must be set before static trunk mode. And for VTP, remember that the highest configuration revision wins, even from a client, which is why switches should be reset before they join a domain.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Trunks carry many VLANs; 802.1Q inserts a 4-byte tag after the source MAC',
      'Tag: TPID 0x8100, PCP (CoS) 3 bits, DEI 1 bit, VID 12 bits',
      'Native VLAN is untagged, default 1, must match; change it to an unused VLAN',
      'Configure: `switchport mode trunk`, native VLAN, allowed list (`add`/`remove`/`except`/`none`)',
      'DTP: desirable asks, auto waits; auto + auto = access; `nonegotiate` stops DTP',
      'Verify with `show interfaces trunk`: allowed, active, forwarding',
      'VTP: server, client, transparent, off; beware the revision number',
    ],
    notes:
      "Trunks let VLANs span switches by tagging each frame with its VLAN. The 802.1Q tag is 4 bytes long and is inserted after the source MAC address; its TPID is 0x8100, its 3-bit PCP carries the CoS, its 1-bit DEI marks drop-eligible frames and its 12-bit VID identifies the VLAN. The native VLAN is sent untagged, defaults to VLAN 1, must match on both ends, and should be moved to an unused VLAN. You configure trunks with `switchport mode trunk` (after `switchport trunk encapsulation dot1q` on multi-encapsulation switches), set the native VLAN, and control the allowed list carefully with `add`, `remove`, `except` and `none`. DTP negotiates dynamic links; remember that auto plus auto never trunks and that `nonegotiate` requires a static trunk on the other side. `show interfaces trunk` reveals the allowed, active and forwarding VLANs, and VTP distributes VLAN databases, with the revision number as its biggest risk. Next, you will route between VLANs using these trunks.",
  },
];

export default slides;
