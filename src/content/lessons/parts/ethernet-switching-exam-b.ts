import type { Question } from '../../types';

export const examB: Question[] = [
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. SW1 has learned both PC5 and PC6 on Fa0/3. PC5 sends a unicast frame to PC6. What does SW1 do with the frame?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 2, y: 2 },
          { id: 'hub', icon: 'hub', label: 'Hub1', x: 5, y: 2 },
          { id: 'p5', icon: 'pc', label: 'PC5', sub: '0200.0000.0005', x: 8, y: 0.9 },
          { id: 'p6', icon: 'pc', label: 'PC6', sub: '0200.0000.0006', x: 8, y: 3.1 },
        ],
        links: [
          { from: 'sw', to: 'hub', fromLabel: 'Fa0/3' },
          { from: 'hub', to: 'p5' },
          { from: 'hub', to: 'p6' },
        ],
      },
    },
    options: [
      'Discards (filters) the frame',
      'Floods the frame out all ports except Fa0/3',
      'Forwards the frame back out Fa0/3',
      'Forwards the frame out all ports including Fa0/3',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The destination (PC6) is known on **Fa0/3**, the same port the frame arrived on. The hub has already repeated the frame to PC6, so SW1 **filters** it. Switches never send a frame back out its ingress port, and flooding only happens for broadcasts, multicasts and unknown unicasts.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 (0200.0000.0001) was just unplugged from Fa0/1 and reconnected to Fa0/7 on the same switch and VLAN. What happens when SW1 receives the first frame from PC1 on Fa0/7?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table address 0200.0000.0001
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.0000.0001    DYNAMIC     Fa0/1
Total Mac Addresses for this criterion: 1`,
    },
    options: [
      'SW1 drops frames from PC1 until the old entry ages out after 300 seconds',
      'SW1 updates the entry to Fa0/7 and restarts its aging timer',
      'SW1 keeps both entries and load-balances traffic to PC1 across Fa0/1 and Fa0/7',
      'SW1 err-disables Fa0/7 because the MAC address is already in the table',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'A dynamic entry is simply **overwritten** when the same MAC appears on a different port in the same VLAN, and the aging timer restarts. Frames are not dropped while an old entry ages, a MAC maps to only one port per VLAN, and err-disabling for a moved MAC only happens if a feature such as port security is configured to do so. Until PC1 sends something from Fa0/7, frames to it would still be sent to Fa0/1 — one reason to let a moved host generate traffic.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about the MAC address table on a Cisco Catalyst switch are true? (Choose two.)',
    options: [
      'By default, a dynamic entry is removed after 300 seconds without frames from that source',
      'Static entries do not age out',
      'Entries are learned from the destination MAC address of incoming frames',
      'The table maps IP addresses to MAC addresses',
      '`clear mac address-table dynamic` also removes static entries',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Dynamic entries age out after **300 seconds** of silence by default, and **static** entries are permanent. Switches learn from **source** addresses, the table maps MAC + VLAN to a **port** (IP-to-MAC mapping is ARP\'s job), and the `dynamic` keyword leaves static entries in place.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'A server with MAC address 0200.5555.0010 is connected to Fa0/10 in VLAN 20. Which command permanently binds this MAC address to that port in the MAC address table?',
    options: [
      '`mac address-table static 0200.5555.0010 vlan 20 interface FastEthernet0/10`',
      '`mac address-table static 0200.5555.0010 interface FastEthernet0/10`',
      '`switchport port-security mac-address 0200.5555.0010`',
      '`arp 10.1.20.10 0200.5555.0010 arpa`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A static entry needs the MAC, the **VLAN** and the interface: `mac address-table static <mac> vlan <id> interface <port>`. Leaving out the VLAN is incomplete, because the table is kept per VLAN. The port-security command restricts which MACs may use a port (a different feature), and `arp` creates a static IP-to-MAC mapping, not a switching entry.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. What can the engineer conclude about interface Gi0/1?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table interface GigabitEthernet0/1
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.1a2b.0011    DYNAMIC     Gi0/1
   1    0200.1a2b.0012    DYNAMIC     Gi0/1
   1    0200.1a2b.0013    DYNAMIC     Gi0/1
   1    0200.1a2b.0014    DYNAMIC     Gi0/1
   1    0200.1a2b.0015    DYNAMIC     Gi0/1
Total Mac Addresses for this criterion: 5`,
    },
    options: [
      'Several devices are reachable through Gi0/1, for example through another switch',
      'Gi0/1 is under a MAC flooding attack and has been err-disabled',
      'The entries on Gi0/1 were configured statically by an administrator',
      'SW1 floods frames destined to these five MAC addresses',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A switch learns every source MAC arriving on a port, so **multiple MACs on one port** means several devices sit behind it — typically another switch (an uplink) or a hub. Five entries are normal and do not indicate an attack; an err-disabled port would be down and learn nothing. The Type column says `DYNAMIC`, not `STATIC`. Because the destinations are known, frames to them are **forwarded** out Gi0/1, not flooded.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'A host sends an Ethernet frame whose payload is only 20 bytes long. How does the NIC handle this?',
    options: [
      'It pads the data field to 46 bytes, so the frame is 64 bytes long',
      'It sends a 38-byte frame, which switches forward as a runt',
      'It waits and merges the payload with the next packet to fill the frame',
      'It pads the payload to 64 bytes, making an 82-byte frame',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The data field must be at least **46 bytes**, so the NIC **pads** the 20-byte payload with 26 bytes, giving the 64-byte minimum frame (6 + 6 + 2 + 46 + 4). A 38-byte frame would be an illegal runt, Ethernet never merges packets, and the pad targets 46 bytes of data, not 64.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'How many bits long is the Organizationally Unique Identifier (OUI) in a MAC address?',
    answers: ['24', '24 bits'],
    placeholder: 'bits',
    difficulty: 1,
    explanation:
      'A 48-bit MAC address is split in half: the **24-bit OUI** assigned to the vendor by the IEEE, and a 24-bit vendor-assigned NIC-specific part.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements describe full-duplex Ethernet operation? (Choose two.)',
    options: [
      'Both devices can transmit and receive at the same time',
      'CSMA/CD is disabled on the link',
      'It is required when a PC connects to a hub',
      'Collisions are expected and resolved with random backoff',
      'It is only supported at 1 Gb/s and faster',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Full duplex uses separate transmit and receive paths on a point-to-point link, so both ends **send and receive simultaneously** and **CSMA/CD is turned off**. Hubs require half duplex, collisions and backoff belong to half duplex, and full duplex works at 10 and 100 Mb/s too.',
  },
  {
    id: 'e20',
    type: 'match',
    stem: 'Match each value seen in `show interfaces status` to its meaning.',
    pairs: [
      { left: '`a-full` in the Duplex column', right: 'Full duplex learned through autonegotiation' },
      { left: '`full` in the Duplex column', right: 'Full duplex set manually with the `duplex` command' },
      { left: '`a-half` at 100 Mb/s', right: 'Negotiation fallback, often caused by a hard-coded neighbor' },
      { left: '`notconnect` in the Status column', right: 'No link detected on the port' },
      { left: '`trunk` in the Vlan column', right: 'The port is operating as a trunk' },
    ],
    difficulty: 2,
    explanation:
      'The `a-` prefix means **autonegotiated**; no prefix means **configured**. `a-half` on a 10/100 port is the IEEE fallback when the neighbor does not negotiate — a warning sign of a duplex mismatch. `notconnect` means no link (no cable or device off), and a trunk shows `trunk` instead of a VLAN number.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'An attacker connected to an access port sends frames with thousands of random source MAC addresses until the switch MAC address table is full. What is the result?',
    options: [
      'The switch floods unknown unicast frames, so the attacker can capture traffic',
      'The switch stops forwarding frames until the MAC address table entries age out',
      'The switch automatically shuts down the attacker\'s port once the table is full',
      'The switch converts to store-and-forward mode and drops the fake frames',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'With a full table the switch cannot learn legitimate hosts, so frames to them become **unknown unicasts** and are **flooded** — including to the attacker, who can now sniff them (a **MAC flooding** attack). The switch does not stop forwarding, and it only shuts a port down if **port security** is configured. The switching method is irrelevant: the fake frames are valid frames.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'A single Layer 2 switch has access ports in VLANs 10, 20 and 30. How many broadcast domains does the switch provide?',
    options: ['1', '3', 'One per switch port', 'None — only routers create broadcast domains'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Each VLAN is a **separate broadcast domain**, because a switch floods broadcasts only to ports in the same VLAN — so there are **3**. One per port describes collision domains, not broadcast domains. Routers *separate* broadcast domains, but VLANs split a single switch into several of them too; hosts in different VLANs then need a router to communicate.',
  },
];
