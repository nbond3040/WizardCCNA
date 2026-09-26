/**
 * REFERENCE EXAMPLE — not part of the course. Shows every slide kind, every diagram type and every
 * question type with the house style. Real lessons live in src/content/lessons/<id>.ts.
 */
import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'example',
  slides: [
    {
      kind: 'title',
      title: 'ARP & the Default Gateway',
      subtitle: 'How a host finds the MAC address that goes in the frame',
      notes:
        'Every IPv4 packet that leaves a host is wrapped in an Ethernet frame, and the frame needs a destination **MAC address**. ARP is the protocol that maps a known IPv4 address to the unknown MAC. In this deck you will learn when a host ARPs for the destination itself versus its **default gateway**, what the messages look like, and how to verify ARP caches on hosts and routers.',
    },
    {
      kind: 'bullets',
      title: 'Local or remote?',
      bullets: [
        'Host compares **destination IP** with its own address and **subnet mask**',
        { text: 'Same subnet → deliver **directly**', sub: ['ARP for the destination host MAC'] },
        { text: 'Different subnet → send to the **default gateway**', sub: ['ARP for the gateway MAC, not the remote host'] },
        'The IP header never changes hop to hop; the **MAC header** does',
      ],
      diagram: {
        type: 'topology',
        width: 8,
        height: 3,
        nodes: [
          { id: 'a', icon: 'pc', label: 'PC-A', sub: '10.1.1.10/24', x: 1, y: 1.5 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 3.5, y: 1.5 },
          { id: 'r', icon: 'router', label: 'R1', sub: '10.1.1.1', x: 6, y: 1.5, tone: 'accent' },
        ],
        links: [
          { from: 'a', to: 'sw', fromLabel: 'Fa0', toLabel: 'Fa0/1' },
          { from: 'sw', to: 'r', toLabel: 'G0/0/0', label: 'VLAN 1' },
        ],
      },
      notes:
        'Before a host sends anything it performs a simple **AND** of its own IP with its mask, and of the destination IP with the same mask. If the two results match, the destination is on the local subnet and the host ARPs for that host directly. If they differ, the packet must go through a router, so the host ARPs for its **default gateway** instead. A classic exam trap: when PC-A pings a remote server, the destination MAC in the frame PC-A sends is **R1\'s** MAC, while the destination IP is still the server\'s IP.',
    },
    {
      kind: 'diagram',
      title: 'ARP request and reply',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'a', label: 'PC-A 10.1.1.10', icon: 'pc' },
          { id: 'sw', label: 'SW1', icon: 'switch' },
          { id: 'r', label: 'R1 10.1.1.1', icon: 'router' },
        ],
        steps: [
          { from: 'a', to: 'sw', label: 'ARP Request (broadcast)', sub: 'Who has 10.1.1.1? Tell 10.1.1.10 · dst FFFF.FFFF.FFFF' },
          { from: 'sw', to: 'r', label: 'Flooded out all ports in VLAN 1' },
          { from: 'r', to: 'a', label: 'ARP Reply (unicast)', sub: '10.1.1.1 is at 0011.2233.4455', tone: 'accent' },
          { note: 'Both sides cache the mapping (IOS: 4 hours; Windows: seconds to minutes)' },
        ],
      },
      caption: 'Requests are broadcast; replies are unicast.',
      notes:
        'The ARP **request** is a broadcast frame (destination MAC **FFFF.FFFF.FFFF**), so every device in the VLAN receives it, but only the owner of the target IP answers. The **reply** is sent unicast straight back to the requester. The requester stores the answer in its **ARP cache**; the target usually learns the requester\'s mapping from the request too. Cisco IOS keeps ARP entries for **4 hours** by default, while client operating systems age them much faster.',
    },
    {
      kind: 'diagram',
      title: 'Where ARP sits in the frame',
      diagram: {
        type: 'header',
        layout: 'line',
        unit: 'bytes',
        fields: [
          { label: 'Dest MAC', size: 6, tone: 'accent' },
          { label: 'Src MAC', size: 6 },
          { label: 'Type 0x0806', size: 2, sub: 'ARP' },
          { label: 'ARP payload', size: 28 },
          { label: 'FCS', size: 4, tone: 'muted' },
        ],
      },
      notes:
        'ARP rides directly inside an Ethernet frame — it is **not** carried in an IP packet. The EtherType value **0x0806** tells the receiver the payload is ARP (IPv4 is 0x0800). The 28-byte ARP payload carries the sender MAC and IP and the target MAC and IP; in a request, the target MAC is all zeros because that is exactly what the sender is trying to learn.',
    },
    {
      kind: 'diagram',
      title: 'The AND that decides',
      diagram: {
        type: 'bits',
        rows: [
          { label: 'PC-A', value: '10.1.1.10', prefix: 24 },
          { label: 'Mask /24', value: '255.255.255.0', prefix: 24 },
          { label: 'Server', value: '10.1.2.20', prefix: 24, tone: 'bad' },
        ],
      },
      caption: 'The third octet differs inside the network bits, so the server is remote.',
      notes:
        'Comparing only the **network bits** (the first 24 here) shows 10.1.1 versus 10.1.2 — different networks. PC-A therefore sends the frame to its gateway. If the mask had been /16, both addresses would share the network 10.1.0.0 and PC-A would ARP for the server directly — which fails if the server is really behind a router. Wrong masks cause exactly this kind of confusing, partial connectivity.',
    },
    {
      kind: 'diagram',
      title: 'Layers involved',
      diagram: {
        type: 'stack',
        columns: [
          { title: 'OSI', layers: [{ label: 'Network', sub: 'IPv4 — logical addressing' }, { label: 'Data Link', sub: 'Ethernet — MAC addressing', tone: 'accent' }] },
          { title: 'Protocol', layers: [{ label: 'IP', sub: 'what we want to reach' }, { label: 'ARP', sub: 'glue: IP → MAC', tone: 'accent' }] },
        ],
      },
      notes:
        'ARP is often called a "Layer 2.5" protocol because it bridges the two layers: it takes a Layer 3 address as input and produces a Layer 2 address as output. For the exam, remember that ARP messages are **Layer 2 frames**, not IP packets, and that **routers do not forward** ARP broadcasts — each subnet resolves its own addresses.',
    },
    {
      kind: 'diagram',
      title: 'Host sending decision',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'n1', label: 'Packet to send', shape: 'pill' },
          { id: 'n2', label: 'Same subnet?', shape: 'diamond' },
          { id: 'n3', label: 'ARP for gateway', sub: 'remote destination' },
          { id: 'n4', label: 'Frame to gateway MAC', tone: 'accent', shape: 'round' },
        ],
      },
      notes:
        'The flow is the same on every OS: decide local versus remote, look in the ARP cache, ARP only if the entry is missing, then build the frame. If the ARP request goes unanswered, the first packets are dropped — which is why the **first ping often shows a timeout** (`.!!!!` on Cisco IOS) when caches are empty.',
    },
    {
      kind: 'cli',
      title: 'Verifying ARP on a router',
      code: `R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   0011.2233.4455  ARPA   GigabitEthernet0/0/0
Internet  10.1.1.10              12   5254.00ab.cd01  ARPA   GigabitEthernet0/0/0
R1# clear arp-cache`,
      highlight: ['-', '12'],
      caption: 'A dash in the Age column marks the router\'s own interface address.',
      notes:
        '`show ip arp` (or `show arp`) lists IP-to-MAC mappings. The **Age** column shows minutes since the entry was learned; a **dash** means it is one of the router\'s own addresses, which never ages. `clear arp-cache` flushes dynamic entries — handy after swapping a device with the same IP. On Windows the equivalent is `arp -a`, and `arp -d *` clears the cache.',
    },
    {
      kind: 'table',
      title: 'ARP at a glance',
      columns: ['Property', 'Value'],
      rows: [
        ['EtherType', '`0x0806`'],
        ['Request destination MAC', 'Broadcast `FFFF.FFFF.FFFF`'],
        ['Reply', 'Unicast to requester'],
        ['IOS cache timeout', '**4 hours**'],
        ['IPv6 replacement', 'NDP Neighbor Solicitation / Advertisement'],
      ],
      notes:
        'Memorize these five facts — each one has appeared as an exam distractor. In particular, remember that **IPv6 has no ARP**: Neighbor Discovery Protocol uses ICMPv6 Neighbor Solicitation (sent to a solicited-node multicast address, not a broadcast) and Neighbor Advertisement messages to do the same job.',
    },
    {
      kind: 'compare',
      title: 'Local vs remote delivery',
      left: { heading: 'Same subnet', bullets: ['Dest MAC = **destination host**', 'No router involved', 'ARP for the host IP'] },
      right: { heading: 'Different subnet', bullets: ['Dest MAC = **default gateway**', 'Router rewrites the frame', 'ARP for the gateway IP'], tone: 'accent' },
      notes:
        'Use this comparison to answer "what is the destination MAC address" questions instantly. Find out whether source and destination share a subnet. If yes, the destination MAC is the destination host. If not, it is the MAC of the **next Layer 3 device** on the path — the default gateway on the first hop, and the next router on every hop after that.',
    },
    {
      kind: 'definitions',
      title: 'Key terms',
      terms: [
        { term: 'ARP', def: 'Address Resolution Protocol: resolves a known IPv4 address to a MAC address on the local subnet.' },
        { term: 'ARP cache', def: 'Table of recently learned IP-to-MAC mappings (`show ip arp`, `arp -a`).' },
        { term: 'Default gateway', def: 'Router interface IP a host uses to reach other subnets.' },
        { term: 'Proxy ARP', def: 'A router answers ARP requests for remote IPs with its own MAC.' },
      ],
      notes:
        '**Proxy ARP** deserves a special mention: when a host has a wrong (too short) mask or no gateway and ARPs for a remote address, a router with proxy ARP enabled (the IOS default on Ethernet interfaces) replies with its own MAC so traffic still flows. That can hide misconfigurations — keep it in mind when troubleshooting.',
    },
    {
      kind: 'steps',
      title: 'Troubleshooting "cannot reach remote hosts"',
      steps: [
        { title: 'Check the host IP and mask', text: '`ipconfig` — is the mask correct for the subnet?' },
        { title: 'Check the default gateway', text: 'Is it set and in the same subnet as the host?' },
        { title: 'Ping the gateway', text: 'Success proves Layer 1–3 on the local segment.' },
        { title: 'Check the ARP cache', text: '`arp -a` — is the gateway MAC present and correct?' },
      ],
      notes:
        'Work from the host outward. Most "can reach local but not remote" tickets come down to a missing or wrong **default gateway** or a wrong **mask**. If the gateway does not respond, look at the ARP cache: an incomplete or missing entry means Layer 2 to the router is broken (wrong VLAN, shut interface, or bad cable).',
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam tip',
      body: 'When a question asks for the **destination MAC** of a frame leaving a PC for a remote server, the answer is the **default gateway\'s MAC** — never the server\'s.',
      notes:
        'Cisco loves this question in many disguises: a topology exhibit with a PC, two switches, a router and a server, then "which destination MAC address and which destination IP address will be in the frame as it leaves PC1?" The IP is the server; the MAC is the router\'s LAN interface. On the far side of the router, the router builds a new frame whose source MAC is its own egress interface.',
    },
  ],
  flashcards: [
    { id: 'f1', front: 'What does ARP resolve?', back: 'A known **IPv4 address** to an unknown **MAC address** on the local subnet.' },
    { id: 'f2', front: 'ARP request destination MAC', back: 'Broadcast `FFFF.FFFF.FFFF`.' },
    { id: 'f3', front: 'EtherType value for ARP', back: '`0x0806` (IPv4 is `0x0800`).' },
    { id: 'f4', front: 'Default ARP cache timeout on Cisco IOS', back: '**4 hours** (240 minutes).' },
    { id: 'f5', front: 'IOS command to view the ARP cache', back: '`show ip arp` (or `show arp`).' },
    { id: 'f6', front: 'Destination MAC when a PC sends to a remote subnet', back: 'The MAC address of its **default gateway**.' },
    { id: 'f7', front: 'What replaces ARP in IPv6?', back: '**NDP** — ICMPv6 Neighbor Solicitation and Neighbor Advertisement.' },
    { id: 'f8', front: 'Proxy ARP', back: 'A router replies to an ARP request for a remote IP with its **own MAC**, forwarding the traffic on the host\'s behalf.' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'PC1 (10.1.1.10/24) pings 10.1.2.20. Which IP address does PC1 ARP for?',
      options: ['10.1.2.20', 'Its default gateway', '255.255.255.255', 'It does not need ARP'],
      answer: 1,
      explanation:
        '10.1.2.20 is on a different /24, so PC1 must send the packet to its **default gateway** and ARPs for the gateway\'s IP. It never ARPs for a remote host, and 255.255.255.255 is an IP broadcast, not an ARP target.',
    },
    {
      id: 'q2',
      type: 'multi',
      stem: 'Which two statements about ARP are true? (Choose two.)',
      options: ['ARP requests are broadcast', 'ARP replies are broadcast', 'Routers forward ARP requests between subnets', 'ARP is carried directly in Ethernet frames', 'ARP is used by IPv6'],
      answers: [0, 3],
      explanation:
        'Requests are **broadcast** and ARP is encapsulated **directly in Ethernet** (EtherType 0x0806). Replies are unicast, routers do not forward ARP broadcasts, and IPv6 uses NDP instead of ARP.',
    },
    {
      id: 'q3',
      type: 'input',
      stem: 'What EtherType value (hex) identifies an ARP message?',
      answers: ['0x0806', '0806', '806'],
      placeholder: '0x....',
      explanation: 'ARP uses EtherType **0x0806**; IPv4 uses 0x0800 and IPv6 uses 0x86DD.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Refer to the exhibit. PC1 sends a packet to Server1. What are the destination MAC and IP addresses of the frame as it leaves PC1?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 3,
          nodes: [
            { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1, y: 1.5 },
            { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0 MAC AAAA.AAAA.AAAA', x: 4, y: 1.5 },
            { id: 'r2', icon: 'router', label: 'R2', x: 6.5, y: 1.5 },
            { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.20 · BBBB.BBBB.BBBB', x: 9, y: 1.5 },
          ],
          links: [
            { from: 'pc', to: 'r1', toLabel: 'G0/0' },
            { from: 'r1', to: 'r2', label: '10.0.12.0/30' },
            { from: 'r2', to: 'srv' },
          ],
        },
      },
      options: [
        'MAC BBBB.BBBB.BBBB, IP 10.2.2.20',
        'MAC AAAA.AAAA.AAAA, IP 10.2.2.20',
        'MAC AAAA.AAAA.AAAA, IP 10.1.1.1',
        'MAC FFFF.FFFF.FFFF, IP 10.2.2.20',
      ],
      answer: 1,
      difficulty: 2,
      explanation:
        'The destination IP stays **10.2.2.20** end to end. Because the server is remote, the frame is addressed to the next-hop Layer 3 device — R1\'s G0/0 MAC **AAAA.AAAA.AAAA**. The server\'s MAC is only used on the last hop, and the broadcast MAC is only used by the ARP request itself.',
    },
    {
      id: 'e2',
      type: 'order',
      stem: 'Put the steps a host takes to send a packet to a remote subnet in order.',
      items: [
        'Compare the destination with its own subnet using the mask',
        'Select the default gateway as the next hop',
        'Look up the gateway in the ARP cache',
        'Broadcast an ARP request if no entry exists',
        'Send the frame to the gateway MAC',
      ],
      explanation:
        'The host first decides local vs remote, then picks the gateway, checks its cache, ARPs only on a miss, and finally transmits the frame to the gateway\'s MAC.',
    },
    {
      id: 'e3',
      type: 'match',
      stem: 'Match each value to its meaning.',
      pairs: [
        { left: '`0x0806`', right: 'EtherType for ARP' },
        { left: '`0x0800`', right: 'EtherType for IPv4' },
        { left: '`FFFF.FFFF.FFFF`', right: 'Ethernet broadcast' },
        { left: '4 hours', right: 'IOS ARP timeout' },
      ],
      explanation: 'ARP = 0x0806, IPv4 = 0x0800, all-Fs is the broadcast MAC, and IOS ages ARP entries after 4 hours.',
    },
    {
      id: 'e4',
      type: 'categorize',
      stem: 'Classify each message by how it is addressed.',
      categories: ['Broadcast', 'Unicast'],
      items: [
        { text: 'ARP request', category: 0 },
        { text: 'ARP reply', category: 1 },
        { text: 'Gratuitous ARP', category: 0 },
        { text: 'ICMP echo reply to a host', category: 1 },
      ],
      explanation:
        'ARP requests and gratuitous ARPs are sent to the broadcast MAC; ARP replies and ICMP echo replies go unicast to a single host.',
    },
    {
      id: 'e5',
      type: 'single',
      stem: 'Refer to the exhibit. What does the dash in the Age column indicate?',
      exhibit: {
        kind: 'cli',
        text: `R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   0011.2233.4455  ARPA   GigabitEthernet0/0/0
Internet  10.1.1.10              12   5254.00ab.cd01  ARPA   GigabitEthernet0/0/0`,
      },
      options: [
        'The entry is incomplete',
        'The address belongs to R1 itself',
        'The entry was configured statically on a host',
        'The entry expired and will be removed',
      ],
      answer: 1,
      explanation:
        'A dash marks one of the router\'s **own** interface addresses, which never ages out. Incomplete entries show "Incomplete" in the hardware address column instead.',
    },
    {
      id: 'e6',
      type: 'multi',
      stem: 'A host can ping its default gateway but not hosts on other subnets. Which two issues could cause this? (Choose two.)',
      options: [
        'The host has the wrong default gateway configured',
        'The router is missing a route to the destination subnet',
        'The host NIC is disabled',
        'The switch port is in the wrong VLAN',
        'The host has an invalid IP address for its subnet',
      ],
      answers: [0, 1],
      explanation:
        'Reaching the gateway proves the NIC, switch port/VLAN and local addressing work. Remaining causes are beyond the local segment or in the gateway setting itself: a **wrong gateway** (e.g. pointing to another reachable device that does not route) or a **missing route** on the router.',
    },
  ],
};

export default lesson;
