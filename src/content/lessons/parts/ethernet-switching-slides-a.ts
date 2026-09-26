import type { Slide } from '../../types';

export const slidesA: Slide[] = [
  {
    kind: 'title',
    title: 'Ethernet & Switching Concepts',
    subtitle: 'Frames, MAC addresses, and how a switch learns, forwards, filters and floods',
    notes:
      "Almost every packet you will ever troubleshoot crosses an Ethernet switch, so this lesson is the foundation for VLANs, trunking, STP and Layer 2 security. You will take apart the **Ethernet frame** field by field, decode **MAC addresses**, and then watch a switch build its **MAC address table** and decide, frame by frame, whether to **forward**, **filter** or **flood**. We finish with collision versus broadcast domains, duplex, and the three classic switching methods. This maps to v1.1 exam topic 1.13 (switching concepts: MAC learning and aging, frame switching, frame flooding, MAC address table) and to v2.0 domain 2 (Switching and Network Access), where the same behavior is tested.",
  },
  {
    kind: 'bullets',
    title: 'What a LAN switch actually does',
    bullets: [
      'Reads the **Ethernet header** of every frame — a Layer 2 device',
      '**Learns** which MAC address lives behind which port',
      '**Forwards** a known unicast out exactly one port',
      '**Filters** frames whose destination is on the arrival port',
      '**Floods** broadcasts, multicasts and unknown unicasts',
      'Never sends a frame back out the port it arrived on',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a', icon: 'pc', label: 'PC-A', sub: '0200.aaaa.0001', x: 1.4, y: 1.1 },
        { id: 'b', icon: 'pc', label: 'PC-B', sub: '0200.bbbb.0002', x: 1.4, y: 3.9 },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'MAC table', x: 5, y: 2.5, tone: 'accent' },
        { id: 'c', icon: 'pc', label: 'PC-C', sub: '0200.cccc.0003', x: 8.6, y: 1.1 },
        { id: 'd', icon: 'server', label: 'Server', sub: '0200.dddd.0004', x: 8.6, y: 3.9 },
      ],
      links: [
        { from: 'a', to: 'sw', toLabel: 'Fa0/1' },
        { from: 'b', to: 'sw', toLabel: 'Fa0/2' },
        { from: 'c', to: 'sw', toLabel: 'Fa0/3' },
        { from: 'd', to: 'sw', toLabel: 'Fa0/4' },
      ],
    },
    notes:
      "A switch is a multiport **transparent bridge**: hosts do not know it exists, and it does not change the frames it moves. Its whole job is to get each frame to the right port as fast as possible. To do that it keeps a table that maps **MAC address + VLAN → port**, built entirely by watching traffic. Every decision it makes comes down to five verbs: **learn** the source, then **forward** the frame out one port, **filter** it (drop it because the destination is on the same port it came in on), or **flood** it out every other port in the VLAN when it cannot be more precise. One rule underlies them all: a switch never sends a frame back out its ingress port. Keep this picture of SW1 with four hosts in mind — we will reuse it to trace learning step by step. On the exam, questions about switch behavior almost always reduce to identifying which of these verbs applies.",
  },
  {
    kind: 'diagram',
    title: 'Ethernet II frame format',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Preamble', size: 7, tone: 'muted', sub: 'clock sync' },
        { label: 'SFD', size: 1, tone: 'muted', sub: '10101011' },
        { label: 'Destination MAC', size: 6, tone: 'accent' },
        { label: 'Source MAC', size: 6 },
        { label: 'Type', size: 2, sub: 'EtherType' },
        { label: 'Data + pad', size: 1500, sub: '46–1500 bytes' },
        { label: 'FCS', size: 4, sub: 'CRC-32' },
      ],
    },
    caption: 'Frame size is counted from Destination MAC through FCS: 64–1518 bytes.',
    bullets: [
      'Header = Destination + Source + Type = **14 bytes**',
      'Trailer = **FCS** (4 bytes)',
    ],
    notes:
      "This is the **Ethernet II** frame that carries virtually all IPv4 and IPv6 traffic. The **preamble** (7 bytes of alternating 1s and 0s) lets the receiver lock onto the sender's clock, and the **Start Frame Delimiter** (1 byte, `10101011`) marks the exact bit where the frame begins. Many texts treat these 8 bytes as part of the physical layer, which is why they are **not counted** in the frame size. Next come the **destination MAC** — deliberately first, so a switch can start deciding before the rest arrives — and the **source MAC**. The 2-byte **Type** field (EtherType) tells the receiver which protocol is inside: `0x0800` IPv4, `0x86DD` IPv6, `0x0806` ARP. The **data** field holds the packet, and the 4-byte **Frame Check Sequence** holds a CRC computed by the sender. The receiver recomputes it; a mismatch means the frame was corrupted and it is **discarded** — Ethernet detects errors but never corrects or retransmits them. Recovery is left to upper layers such as TCP.",
  },
  {
    kind: 'table',
    title: 'Frame fields and their jobs',
    columns: ['Field', 'Bytes', 'Purpose'],
    rows: [
      ['Preamble', '7', 'Alternating 1s and 0s that synchronize the receiver'],
      ['SFD', '1', 'Start Frame Delimiter `10101011` — the frame starts now'],
      ['Destination MAC', '6', 'Intended receiver: unicast, multicast or broadcast'],
      ['Source MAC', '6', 'Sender — always a unicast address; what switches learn'],
      ['Type / Length', '2', '≥ `0x0600` = EtherType (`0x0800` IPv4, `0x86DD` IPv6, `0x0806` ARP); ≤ 1500 = 802.3 length'],
      ['Data (+ pad)', '46–1500', 'The payload, e.g. an IP packet; padded up to 46 bytes'],
      ['FCS', '4', 'CRC-32 check; a mismatch means the frame is discarded'],
    ],
    notes:
      "Use this table to answer \"which field does X\" questions. Two details deserve attention. First, the **Type/Length** field is dual-purpose. In the original IEEE 802.3 format it carried the length of the data; in Ethernet II it carries the protocol type. Receivers tell them apart by value: anything **1536 (`0x0600`) or higher** is an EtherType, and anything **1500 or lower** is a length (those frames then use an 802.2 LLC header, which some control protocols still use). Second, the **source MAC is always unicast** — a broadcast or multicast address can only ever appear as a destination. That is exactly why switches learn from the source field: it is guaranteed to identify one real interface. When an exam item asks which field a switch uses to build its table, the answer is the source MAC; which field it uses to make a forwarding decision, the destination MAC; and which field detects corruption, the FCS.",
  },
  {
    kind: 'bullets',
    title: 'Frame size limits: 64 to 1518 bytes',
    bullets: [
      '**Minimum 64 bytes**, counted from destination MAC to FCS',
      'Payload under 46 bytes is **padded** up to 46',
      '**Maximum 1518 bytes** with a 1500-byte payload (the **MTU**)',
      'An 802.1Q VLAN tag adds 4 bytes → **1522** on trunks',
      'Under 64 bytes = **runt**; over the maximum = **giant**',
      'Preamble and SFD are not part of the size',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Dest MAC', size: 6 },
        { label: 'Src MAC', size: 6 },
        { label: 'Type', size: 2 },
        { label: 'Data + pad', size: 46, tone: 'accent' },
        { label: 'FCS', size: 4 },
      ],
      caption: 'Smallest legal frame: 6 + 6 + 2 + 46 + 4 = 64 bytes',
    },
    notes:
      "Memorize the two numbers: **64** and **1518**. The minimum exists because of half-duplex CSMA/CD: a sender must still be transmitting when news of a collision can travel back from the far end of the segment, and 64 bytes (512 bits, the \"slot time\") guarantees that on legal cable lengths. If an IP packet is smaller than 46 bytes — a tiny ARP message, for example — the NIC adds **padding** so the frame reaches 64 bytes. The maximum payload of 1500 bytes is the Ethernet **MTU**, giving 1518 bytes on the wire (6 + 6 + 2 + 1500 + 4). An **802.1Q** tag inserted between the source MAC and Type adds 4 bytes, so tagged frames on trunks may be up to **1522** bytes. Interface counters call undersized frames **runts** and oversized ones **giants**; both usually point to collisions, duplex problems or a faulty NIC. You may also meet **jumbo frames** (commonly around 9000 bytes) — a vendor extension that must be enabled end to end, not part of the classic limits.",
  },
  {
    kind: 'diagram',
    title: 'MAC address structure',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'OUI', size: 24, tone: 'accent', sub: 'IEEE-assigned to the vendor' },
        { label: 'NIC-specific', size: 24, sub: 'assigned by the vendor' },
      ],
      caption: '0011.2233.4455 → OUI 00-11-22, NIC part 33-44-55',
    },
    bullets: [
      '**48 bits** written as **12 hex digits**',
      'Cisco: `0011.2233.4455` · Windows: `00-11-22-33-44-55` · Linux/macOS: `00:11:22:33:44:55`',
      'Also called the **BIA** (burned-in address) or physical address',
    ],
    notes:
      "A MAC address is **48 bits**, always shown as **12 hexadecimal digits**. The first 24 bits are the **Organizationally Unique Identifier (OUI)**, which the IEEE assigns to a manufacturer; the last 24 bits are chosen by that manufacturer so that every NIC it ships is unique. That is why the address is often called the **burned-in address (BIA)** or universally administered address. The notation changes with the operating system, but the value does not: Cisco IOS groups four hex digits separated by dots, Windows uses dashes between pairs, and Linux and macOS use colons. Be ready to convert between them — `0011.2233.4455`, `00-11-22-33-44-55` and `00:11:22:33:44:55` are the same address. Note that `show interfaces` prints both the current address and the `bia`, because an administrator can override the MAC in software. On the exam, expect \"how many bits in a MAC address\" (48), \"what does the OUI identify\" (the vendor), and conversions between notations.",
  },
  {
    kind: 'table',
    title: 'Unicast, broadcast and multicast MACs',
    columns: ['Type', 'Example', 'Delivered to', 'How to recognize it'],
    rows: [
      ['Unicast', '`0011.2233.4455`', 'One NIC', 'First octet is **even** (I/G bit = 0)'],
      ['Broadcast', '`FFFF.FFFF.FFFF`', 'Every device in the VLAN', 'All 48 bits set to 1'],
      ['Multicast (IPv4)', '`0100.5E00.0005`', 'Members of a group', 'Starts with `0100.5E`'],
      ['Multicast (IPv6)', '`3333.0000.0001`', 'Members of a group', 'Starts with `3333`'],
      ['Multicast (Cisco)', '`0100.0CCC.CCCC`', 'CDP, VTP, DTP, PAgP', 'First octet is **odd** (I/G bit = 1)'],
    ],
    notes:
      "Destination MACs come in three flavors. A **unicast** address identifies a single interface. The **broadcast** address, `FFFF.FFFF.FFFF`, is received by every device in the broadcast domain (the VLAN) — ARP requests and DHCP Discovers use it. A **multicast** address identifies a group of interested receivers. The quick test is the lowest-order bit of the first octet, the **Individual/Group (I/G) bit**: if the first octet is **odd**, the address is a group address (multicast or broadcast); if it is even, it is unicast. Try it: `01` and `33` are odd, so `0100.5E..` and `3333..` are multicast. IPv4 multicast MACs begin `0100.5E` (the example is the MAC for 224.0.0.5, OSPF's all-routers group), IPv6 multicast MACs begin `3333`, and Cisco's own Layer 2 protocols such as CDP, VTP, DTP and PAgP send to `0100.0CCC.CCCC`. Remember that a source MAC is always unicast; group addresses only appear as destinations.",
  },
  {
    kind: 'diagram',
    title: 'MAC learning in action',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'a', label: 'PC-A (Fa0/1)', icon: 'pc' },
        { id: 'sw', label: 'SW1', icon: 'switch' },
        { id: 'b', label: 'PC-B (Fa0/2)', icon: 'pc' },
        { id: 'c', label: 'PC-C (Fa0/3)', icon: 'pc' },
      ],
      steps: [
        { from: 'a', to: 'sw', label: 'Frame src A → dst B', sub: 'MAC table empty' },
        { note: 'SW1 learns A = Fa0/1 · B unknown → flood' },
        { from: 'sw', to: 'b', label: 'Flooded copy' },
        { from: 'sw', to: 'c', label: 'Flooded copy — PC-C discards it', tone: 'muted', dashed: true },
        { from: 'b', to: 'sw', label: 'Reply src B → dst A' },
        { note: 'SW1 learns B = Fa0/2 · A is known' },
        { from: 'sw', to: 'a', label: 'Forwarded out Fa0/1 only', tone: 'accent' },
      ],
    },
    caption: 'Learn from the source MAC; decide using the destination MAC.',
    notes:
      "Here is the whole learning process on a switch that has just booted with an empty table. PC-A sends a frame to PC-B. SW1 first looks at the **source** MAC and records \"A lives on Fa0/1, VLAN 1\". Then it looks up the **destination**: B is not in the table yet, so the frame is an **unknown unicast** and SW1 floods it out every other port in the VLAN. PC-B accepts it; PC-C's NIC sees a destination MAC that is not its own and silently discards it. When PC-B replies, SW1 learns \"B lives on Fa0/2\" and — because A is now known — forwards the reply out **Fa0/1 only**. From here on, traffic between A and B is never flooded again. Each time a frame arrives from a known source, the entry's **aging timer** is reset. If a host moves to a different port, the next frame it sends simply updates the entry to the new port. The exam loves the trap answer \"the switch learns the destination address\": switches only ever learn from the source.",
  },
  {
    kind: 'diagram',
    title: 'The switch decision process',
    diagram: {
      type: 'flow',
      width: 10,
      height: 6,
      nodes: [
        { id: 'in', label: 'Frame in', shape: 'pill', x: 1.2, y: 1 },
        { id: 'learn', label: 'Learn source MAC', sub: 'add or refresh entry', x: 3.6, y: 1 },
        { id: 'bc', label: 'Broadcast or multicast?', shape: 'diamond', x: 6.2, y: 1 },
        { id: 'known', label: 'Destination known?', shape: 'diamond', x: 6.2, y: 3 },
        { id: 'same', label: 'Same port as ingress?', shape: 'diamond', x: 6.2, y: 5 },
        { id: 'flood', label: 'Flood', sub: 'all VLAN ports except ingress', shape: 'round', tone: 'warn', x: 8.8, y: 2 },
        { id: 'filter', label: 'Filter', sub: 'discard', shape: 'round', tone: 'muted', x: 3.6, y: 5 },
        { id: 'fwd', label: 'Forward', sub: 'out one port', shape: 'round', tone: 'good', x: 8.8, y: 5 },
      ],
      edges: [
        { from: 'in', to: 'learn' },
        { from: 'learn', to: 'bc' },
        { from: 'bc', to: 'flood', label: 'yes' },
        { from: 'bc', to: 'known', label: 'no' },
        { from: 'known', to: 'flood', label: 'no' },
        { from: 'known', to: 'same', label: 'yes' },
        { from: 'same', to: 'filter', label: 'yes' },
        { from: 'same', to: 'fwd', label: 'no' },
      ],
    },
    notes:
      "Every frame follows this exact flow. Step one is always **learning**: the source MAC and ingress port are added to the table, or the existing entry's timer is refreshed. Then the destination decides the action. A **broadcast** (and, on a basic switch, a **multicast**) is flooded out every port in the same VLAN except the one it arrived on. A unicast destination that is **not in the table** is also flooded — this is called **unknown unicast flooding**. If the destination is known and lives on a **different** port, the frame is **forwarded** out that single port. If it lives on the **same** port the frame arrived on (for example, two hosts behind a hub or another switch on one port), the frame is **filtered**: the destination has already seen it, so the switch drops it. Notice that flooding is always confined to the **VLAN** the frame belongs to; a switch never floods into other VLANs. That scoping is the whole reason VLANs create separate broadcast domains.",
  },
  {
    kind: 'table',
    title: 'Forward, filter or flood?',
    columns: ['Destination MAC', 'MAC table says', 'Switch action'],
    rows: [
      ['Unicast', 'Known, on a **different** port', '**Forward** out that one port'],
      ['Unicast', 'Known, on the **same** port it arrived on', '**Filter** (discard)'],
      ['Unicast', 'Not in the table', '**Flood** (unknown unicast)'],
      ['Broadcast `FFFF.FFFF.FFFF`', 'Not looked up', '**Flood** in the VLAN'],
      ['Multicast', 'Not looked up (no snooping)', '**Flood** in the VLAN'],
    ],
    notes:
      "Here is the flow chart reduced to a lookup table. Only **known unicast** frames are forwarded out a single port; everything else is either flooded or filtered. Two refinements matter in real networks. First, Catalyst switches run **IGMP snooping** by default, which listens to hosts joining IPv4 multicast groups and sends that multicast only to interested ports — but the CCNA baseline answer is still that a switch floods multicast like a broadcast unless a feature such as IGMP snooping constrains it. Second, when the MAC table is **full** a switch cannot learn new addresses, so it floods their traffic as unknown unicast. Attackers exploit this with **MAC flooding** (filling the table with fake sources so traffic is flooded to them); port security, covered in the Layer 2 security lesson, is the defense. On the exam, read the destination MAC and the table carefully: a frame to a MAC that is simply missing from the table is flooded, never dropped.",
  },
];
