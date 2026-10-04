import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Preamble and SFD sizes', back: 'Preamble **7 bytes** (alternating 1s and 0s) + SFD **1 byte** (`10101011`). Used for synchronization; not counted in the frame size.' },
  { id: 'f2', front: 'Minimum Ethernet frame size', back: '**64 bytes**, counted from the destination MAC through the FCS.' },
  { id: 'f3', front: 'Maximum standard Ethernet frame size', back: '**1518 bytes** (1500-byte payload). With an 802.1Q tag: **1522 bytes**.' },
  { id: 'f4', front: 'Minimum Ethernet data (payload) field', back: '**46 bytes** — shorter payloads are padded.' },
  { id: 'f5', front: 'Ethernet header length (Ethernet II)', back: '**14 bytes**: destination MAC (6) + source MAC (6) + Type (2). The FCS trailer adds 4 more.' },
  { id: 'f6', front: 'FCS', back: 'Frame Check Sequence: a 4-byte **CRC** computed by the sender. If the receiver\'s CRC does not match, the frame is **discarded** (no retransmission at Layer 2).' },
  { id: 'f7', front: 'EtherType values for IPv4, IPv6, ARP', back: 'IPv4 `0x0800` · IPv6 `0x86DD` · ARP `0x0806`. Values ≥ `0x0600` are EtherTypes; ≤ 1500 are 802.3 lengths.' },
  { id: 'f8', front: 'MAC address length', back: '**48 bits** = 12 hex digits. Cisco format `0011.2233.4455`.' },
  { id: 'f9', front: 'OUI', back: 'Organizationally Unique Identifier: the **first 24 bits** of a MAC, assigned by the IEEE to the manufacturer.' },
  { id: 'f10', front: 'Ethernet broadcast MAC', back: '`FFFF.FFFF.FFFF` — all 48 bits set to 1; received by every device in the VLAN.' },
  { id: 'f11', front: 'How to spot a group (multicast/broadcast) MAC', back: 'The lowest bit of the first octet (the **I/G bit**) is 1, i.e. the first octet is **odd** (`01`, `33`, `FF`).' },
  { id: 'f12', front: 'IPv4 and IPv6 multicast MAC prefixes', back: 'IPv4: `0100.5E` · IPv6: `3333`.' },
  { id: 'f13', front: 'Which address does a switch learn from?', back: 'The **source MAC** of each incoming frame, recorded with the ingress **port** and **VLAN**.' },
  { id: 'f14', front: 'Default MAC address table aging time (Catalyst)', back: '**300 seconds** (5 minutes). Refreshed each time a frame arrives from that source.' },
  { id: 'f15', front: 'Command to change MAC aging', back: '`mac address-table aging-time <seconds>` (global config). `0` disables aging.' },
  { id: 'f16', front: 'Unknown unicast frame', back: 'Destination MAC not in the table → **flooded** out all ports in the VLAN except the ingress port.' },
  { id: 'f17', front: 'Filtering (switch)', back: 'The destination MAC is known on the **same port** the frame arrived on → the switch **discards** the frame.' },
  { id: 'f18', front: 'Show only learned MAC entries', back: '`show mac address-table dynamic` (filters: `interface`, `vlan`, `address`).' },
  { id: 'f19', front: 'Remove all learned MAC entries', back: '`clear mac address-table dynamic` (privileged EXEC). Static entries remain.' },
  { id: 'f20', front: 'Configure a static MAC entry', back: '`mac address-table static <mac> vlan <id> interface <port>` — never ages out.' },
  { id: 'f21', front: 'CAM table', back: 'Another name for the MAC address table (stored in **Content Addressable Memory**).' },
  { id: 'f22', front: 'Collision domain boundaries', back: 'Each **switch or router port** is its own collision domain. All ports of a **hub** share one.' },
  { id: 'f23', front: 'Broadcast domain boundaries', back: '**Router interfaces** (and VLANs). One VLAN = one broadcast domain; switches do not split broadcast domains on their own.' },
  { id: 'f24', front: 'CSMA/CD is used when…', back: 'The link runs **half duplex** (e.g. a hub). Full-duplex links disable CSMA/CD — no collisions possible.' },
  { id: 'f25', front: 'Autonegotiation fails (other side hard-coded): duplex chosen', back: '**Half** duplex at 10/100 Mb/s; **full** at 1000 Mb/s and above. Speed is still sensed.' },
  { id: 'f26', front: 'Duplex mismatch symptoms', back: 'Half-duplex side: collisions and **late collisions**. Full-duplex side: **FCS/CRC errors** and runts. Slow throughput.' },
  { id: 'f27', front: '`a-full` / `a-100` in `show interfaces status`', back: 'Duplex and speed were **autonegotiated** (full, 100 Mb/s). No `a-` prefix = set manually.' },
  { id: 'f28', front: 'Store-and-forward switching', back: 'Receives the **whole frame** and checks the FCS before forwarding. Drops bad frames; highest latency. Used by Catalyst access switches.' },
  { id: 'f29', front: 'Cut-through switching', back: 'Forwards after reading the **destination MAC**. Lowest latency; forwards frames with FCS errors.' },
  { id: 'f30', front: 'Fragment-free switching', back: 'Forwards after the **first 64 bytes** — filters collision fragments (runts) but not later errors.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'A switch receives a unicast frame whose destination MAC address is not in its MAC address table. What does it do?',
    options: [
      'Drops the frame and sends an ARP request to learn the destination MAC',
      'Floods the frame out all ports in the VLAN except the ingress port',
      'Returns the frame out the port it arrived on and waits for a reply',
      'Forwards the frame to its default gateway to find the destination',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'An **unknown unicast** is flooded out every port in the same VLAN except the one it arrived on, so it can still reach the destination. Switches never drop a frame just because the destination is unknown, never send a frame back out the ingress port, and have no concept of a default gateway for Layer 2 forwarding.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two statements about the Ethernet frame are true? (Choose two.)',
    options: [
      'The minimum frame size is 64 bytes',
      'The FCS field is used to retransmit corrupted frames',
      'The source MAC address can be a broadcast address',
      'The destination MAC address comes before the source MAC address',
      'The preamble is counted in the 1518-byte maximum',
    ],
    answers: [0, 3],
    difficulty: 1,
    explanation:
      'Frames are at least **64 bytes**, and the **destination MAC precedes the source MAC** so switches can decide early. The FCS only **detects** errors (bad frames are discarded, not retransmitted), a source MAC is always unicast, and the preamble/SFD are not counted in the 64–1518 range.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'What is the default MAC address table aging time on a Cisco Catalyst switch, in seconds?',
    answers: ['300', '300 seconds', '300 s', '300s'],
    placeholder: 'seconds',
    difficulty: 1,
    explanation:
      'Dynamic entries age out after **300 seconds** (5 minutes) without a frame from that source. The timer resets on every frame received from the MAC, and `mac address-table aging-time` changes it.',
  },
  {
    id: 'q4',
    type: 'categorize',
    stem: 'SW1 has learned PC-A on Fa0/1 and PC-B on Fa0/2 (both VLAN 1). Classify what SW1 does with each frame.',
    categories: ['Forward out one port', 'Flood', 'Filter (discard)'],
    items: [
      { text: 'Frame arriving on Fa0/1 destined to PC-B', category: 0 },
      { text: 'ARP request (destination FFFF.FFFF.FFFF)', category: 1 },
      { text: 'Frame to a MAC address SW1 has never seen', category: 1 },
      { text: 'Frame arriving on Fa0/2 destined to PC-B', category: 2 },
      { text: 'Frame arriving on Fa0/2 destined to PC-A', category: 0 },
    ],
    difficulty: 2,
    explanation:
      'Known unicasts on a different port are **forwarded** out that one port. Broadcasts and unknown unicasts are **flooded** within the VLAN. A frame whose destination is on the same port it arrived on is **filtered** — the destination already received it.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'What does the OUI portion of a MAC address identify?',
    options: [
      'The VLAN the host belongs to',
      'The manufacturer of the NIC',
      'The switch port the host is connected to',
      'Whether the frame is unicast or multicast',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **Organizationally Unique Identifier** is the first 24 bits of the MAC, assigned by the IEEE to the **vendor**. MAC addresses carry no VLAN or port information, and the unicast/group distinction is a single bit (the I/G bit), not the whole OUI.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A single switch with no VLANs configured connects six PCs. How many collision domains and broadcast domains exist?',
    options: [
      '1 collision domain, 1 broadcast domain',
      '6 collision domains, 6 broadcast domains',
      '6 collision domains, 1 broadcast domain',
      '1 collision domain, 6 broadcast domains',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Each **switch port** is its own collision domain (6), but all ports in the same VLAN share **one broadcast domain**. One collision domain would describe a hub; separate broadcast domains require a router or multiple VLANs.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which switching method verifies the FCS before forwarding a frame?',
    options: [
      'Cut-through switching mode',
      'Fragment-free switching mode',
      'Store-and-forward switching mode',
      'Fast-forward switching mode',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      '**Store-and-forward** buffers the entire frame, so it can check the FCS and drop corrupted frames. Cut-through (sometimes called fast-forward) starts sending after the destination MAC, and fragment-free after 64 bytes — neither has the FCS yet.',
  },
];
