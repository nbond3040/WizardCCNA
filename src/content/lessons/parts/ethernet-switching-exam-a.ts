import type { Question } from '../../types';

export const examA: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. A host with MAC address 0200.eeee.0005, connected to Fa0/5, sends a frame to 0200.bbbb.0002. What does SW1 do?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.aaaa.0001    DYNAMIC     Fa0/1
   1    0200.bbbb.0002    DYNAMIC     Fa0/2
   1    0200.cccc.0003    DYNAMIC     Gi0/1
Total Mac Addresses for this criterion: 3`,
    },
    options: [
      'Adds 0200.eeee.0005 on Fa0/5 to the table and forwards the frame out Fa0/2 only',
      'Floods the frame out every port except Fa0/5 because the source is unknown',
      'Forwards the frame out Fa0/2 without changing the MAC table',
      'Adds 0200.bbbb.0002 on Fa0/5 to the table and floods the frame',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The switch first **learns the source** (0200.eeee.0005 on Fa0/5, VLAN 1), then looks up the **destination**, which is known on Fa0/2, so the frame is **forwarded out Fa0/2 only**. An unknown *source* never causes flooding — only an unknown destination does. The table is always updated from the source, and switches never learn destination addresses.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Refer to the exhibit. PC1 and PC2 connect to SW1 Fa0/1 and Fa0/2. PC3 (0200.0000.0003) and PC4 (0200.0000.0004) connect to SW2 Fa0/1 and Fa0/2. SW1 Gi0/1 connects to SW2 Gi0/1, and all ports are in VLAN 1. An engineer has just cleared the dynamic table on SW2. PC1 now sends a unicast frame to PC4. Which two PCs receive a copy of the frame? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.0000.0001    DYNAMIC     Fa0/1
   1    0200.0000.0002    DYNAMIC     Fa0/2
   1    0200.0000.0004    DYNAMIC     Gi0/1
Total Mac Addresses for this criterion: 3

SW2# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
Total Mac Addresses for this criterion: 0`,
    },
    options: ['PC1', 'PC2', 'PC3', 'PC4'],
    answers: [2, 3],
    difficulty: 3,
    explanation:
      'SW1 knows PC4 on **Gi0/1**, so it forwards the frame out Gi0/1 only — **PC2 does not receive it**. SW2 learns PC1 on Gi0/1 but has no entry for PC4, so it treats the frame as an **unknown unicast** and floods it out every other VLAN 1 port: Fa0/1 (**PC3**, which discards it after checking the destination MAC) and Fa0/2 (**PC4**). PC1 never gets its own frame back because a switch never sends a frame out its ingress port.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. No VLANs are configured on the switches. How many collision domains and broadcast domains are shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 0.8 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 2.4, y: 2.4 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.4, y: 2.4 },
          { id: 'p1', icon: 'pc', label: 'PC1', x: 1, y: 4.2 },
          { id: 'p2', icon: 'pc', label: 'PC2', x: 3, y: 4.2 },
          { id: 'hub', icon: 'hub', label: 'Hub1', x: 5.8, y: 3.4 },
          { id: 'p3', icon: 'pc', label: 'PC3', x: 4.6, y: 4.5 },
          { id: 'p4', icon: 'pc', label: 'PC4', x: 7, y: 4.5 },
          { id: 'p6', icon: 'pc', label: 'PC5', x: 9, y: 4.2 },
        ],
        links: [
          { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0' },
          { from: 'r1', to: 'sw2', fromLabel: 'G0/0/1' },
          { from: 'sw1', to: 'p1' },
          { from: 'sw1', to: 'p2' },
          { from: 'sw2', to: 'hub' },
          { from: 'hub', to: 'p3' },
          { from: 'hub', to: 'p4' },
          { from: 'sw2', to: 'p6' },
        ],
      },
    },
    options: [
      '6 collision domains and 2 broadcast domains',
      '8 collision domains and 2 broadcast domains',
      '6 collision domains and 1 broadcast domain',
      '4 collision domains and 2 broadcast domains',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Count one collision domain per switch or router link: R1–SW1, SW1–PC1, SW1–PC2, R1–SW2, SW2–PC5, and the whole **hub segment** (SW2 port, Hub1, PC3, PC4) as a single shared domain = **6**. R1 has two LAN interfaces, so there are **2 broadcast domains**. Eight would wrongly count PC3 and PC4 separately even though a hub does not split collision domains; one broadcast domain ignores that routers do not forward broadcasts.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'What is the minimum size of a standard Ethernet frame, measured from the destination MAC address through the FCS?',
    options: ['46 bytes', '64 bytes', '1500 bytes', '1518 bytes'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The minimum frame is **64 bytes**: 6 + 6 + 2 header bytes, a 46-byte minimum data field and a 4-byte FCS. **46** is the minimum *payload*, **1500** is the maximum payload (MTU), and **1518** is the maximum frame size.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'A switch receives a broadcast frame on Fa0/3, an access port in VLAN 10. Which two actions does the switch take? (Choose two.)',
    options: [
      'Adds or refreshes the frame\'s source MAC address for Fa0/3 in VLAN 10',
      'Floods the frame out all other ports in VLAN 10',
      'Floods the frame out all ports in every VLAN',
      'Adds FFFF.FFFF.FFFF to the MAC address table on Fa0/3',
      'Forwards the frame only to the port connected to the default gateway',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Every frame triggers **source learning**, and broadcasts are **flooded within their VLAN** except out the ingress port. Flooding never crosses into other VLANs — that is what makes a VLAN a separate broadcast domain. The broadcast address is never learned (it can only be a destination), and a Layer 2 switch has no notion of a default gateway for forwarding frames.',
  },
  {
    id: 'e6',
    type: 'match',
    stem: 'Match each Ethernet frame field to its purpose.',
    pairs: [
      { left: 'Preamble', right: 'Lets the receiving NIC synchronize its clock' },
      { left: 'SFD', right: 'Marks the point where the frame content begins' },
      { left: 'Destination MAC', right: 'Identifies the intended receiver or group' },
      { left: 'Type', right: 'Identifies the protocol carried in the payload' },
      { left: 'FCS', right: 'Detects bits corrupted in transit' },
    ],
    difficulty: 2,
    explanation:
      'The **preamble** is a sync pattern and the **SFD** (`10101011`) flags the start of the frame. The **destination MAC** names the receiver (unicast, multicast or broadcast), the **Type** (EtherType) names the payload protocol such as `0x0800` for IPv4, and the **FCS** is a CRC that detects — but does not correct — errors.',
  },
  {
    id: 'e7',
    type: 'order',
    stem: 'Place the fields of an Ethernet II frame in the order they are transmitted.',
    items: ['Preamble', 'Start Frame Delimiter', 'Destination MAC address', 'Source MAC address', 'Type', 'Data', 'Frame Check Sequence'],
    difficulty: 2,
    explanation:
      'Preamble (7 bytes) and SFD (1 byte) come first for synchronization, then the **destination** MAC (first, so switches can decide early), the **source** MAC, the 2-byte Type, the payload, and finally the 4-byte FCS trailer.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each destination MAC address.',
    categories: ['Unicast', 'Multicast', 'Broadcast'],
    items: [
      { text: '`0050.56A1.2B3C`', category: 0 },
      { text: '`0100.5E00.00FB`', category: 1 },
      { text: '`FFFF.FFFF.FFFF`', category: 2 },
      { text: '`3333.0000.0002`', category: 1 },
      { text: '`0200.1111.2222`', category: 0 },
      { text: '`0100.0CCC.CCCC`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Check the lowest bit of the first octet: an **odd** first octet means a group address. `01` and `33` are odd, so `0100.5E..` (IPv4 multicast), `3333..` (IPv6 multicast) and `0100.0CCC.CCCC` (CDP/VTP/DTP) are multicast. All Fs is the broadcast. `00` and `02` are even, so those addresses are unicast (`02` just marks a locally administered address — still unicast).',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Users on Fa0/2 report very slow file transfers. The PC on Fa0/2 has its NIC hard-coded to 100 Mb/s full duplex, and SW1 Fa0/2 is left at its defaults. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces FastEthernet0/2
FastEthernet0/2 is up, line protocol is up (connected)
  Hardware is Fast Ethernet, address is 0019.e86a.6f82 (bia 0019.e86a.6f82)
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Half-duplex, 100Mb/s, media type is 10/100BaseTX
     0 babbles, 412 late collision, 0 deferred`,
    },
    options: [
      'A duplex mismatch: SW1 could not negotiate with the PC and fell back to half duplex',
      'A speed mismatch between SW1 and the PC',
      'SW1 is using cut-through switching and forwarding corrupted frames',
      'The MAC address table is full, so SW1 floods all traffic to Fa0/2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A hard-coded NIC stops autonegotiating. SW1 still senses 100 Mb/s but cannot learn the duplex, so it falls back to **half duplex** (the default at 10/100 Mb/s). With the PC at full and SW1 at half, SW1 logs **late collisions** — the signature of a **duplex mismatch**. A speed mismatch would bring the link down instead of leaving it up/up at 100 Mb/s, the switching method does not cause collisions, and a full MAC table causes flooding, not late collisions. Fix: set both ends to auto, or hard-code both to 100/full.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'Which privileged EXEC command removes all dynamically learned entries from a Catalyst switch MAC address table?',
    answers: ['clear mac address-table dynamic', 'clear mac-address-table dynamic'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`clear mac address-table dynamic` flushes every learned entry (optionally narrowed with `address`, `interface` or `vlan`); static entries are kept. Older IOS releases spelled it `clear mac-address-table dynamic`. Commands such as `erase` or `no mac address-table` do not exist for this purpose.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Which switching method provides the lowest forwarding latency?',
    options: ['Store-and-forward', 'Fragment-free', 'Cut-through', 'Store-and-forward with FCS verification'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**Cut-through** starts transmitting as soon as the destination MAC has been read, so it has the lowest, fixed latency — at the price of forwarding frames with FCS errors. Fragment-free waits for 64 bytes, and store-and-forward waits for the entire frame and checks the FCS, adding the most latency.',
  },
];
