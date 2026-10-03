import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Quality of Service (QoS)',
    subtitle: 'Classify, mark, queue, drop, police and shape so voice and video survive congestion',
    notes:
      "Every network eventually has more traffic trying to leave an interface than the interface can send. When that happens, some packets must wait and some may be thrown away. **Quality of Service (QoS)** is the toolkit that lets you decide which traffic waits and which traffic is dropped, instead of leaving it to chance. In this lesson you will learn why voice and video are so sensitive to **delay, jitter and loss**; how packets are **classified** and **marked** with CoS and DSCP; how queuing tools such as **CBWFQ** and **LLQ** decide what leaves first; how **WRED** avoids congestion; how **policing** differs from **shaping**; and how the best-effort, IntServ and DiffServ models compare. QoS appears on both the v1.1 blueprint (topic 4.7) and the v2.0 blueprint. The exam tests concepts and values rather than configuration, so focus on the numbers (EF 46, AFxy = 8x + 2y) and on which tool solves which problem.",
  },
  {
    kind: 'bullets',
    title: 'Why QoS: congestion at choke points',
    bullets: [
      'Queues build when traffic **arrives faster than it can leave**',
      '**Speed mismatch**: 1 Gbps LAN feeding a 100 Mbps WAN',
      '**Aggregation**: many access ports feeding one uplink',
      'Without QoS, everything waits in **one FIFO queue**',
      '==QoS decides who waits and who is dropped during congestion==',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PCs', x: 1, y: 1 },
        { id: 'ph', icon: 'phone', label: 'IP phones', x: 1, y: 3 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.4, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'egress queue fills', x: 6, y: 2, tone: 'accent' },
        { id: 'wan', icon: 'cloud', label: 'WAN', x: 8.8, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'ph', to: 'sw' },
        { from: 'sw', to: 'r1', label: '1 Gbps', toLabel: 'G0/0/1' },
        { from: 'r1', to: 'wan', label: '100 Mbps', fromLabel: 'G0/0/0', tone: 'accent' },
      ],
    },
    notes:
      "A queue only forms when packets arrive at an egress interface faster than it can transmit them. The two classic choke points are **speed mismatch** — a 1 Gbps LAN feeding a 100 Mbps WAN circuit — and **aggregation**, where dozens of access ports feed a single uplink. In the diagram, SW1 can deliver a full gigabit to R1, but R1 can only send 100 Mbps toward the WAN, so the **egress queue** on G0/0/0 fills during busy moments. Without QoS, that interface uses a single **FIFO** queue: a voice packet that arrives behind a burst of file-transfer packets simply waits its turn, and if the queue is full it is dropped. QoS does not create bandwidth. It decides **who waits and who is dropped** when there is not enough. That is why most QoS tools only take effect during congestion, and why the WAN edge is the most important place to apply them. Remember the direction too: queues build on the **outbound** side of the slower interface, not on the inbound side.",
  },
  {
    kind: 'definitions',
    title: 'Bandwidth, delay, jitter and loss',
    terms: [
      { term: 'Bandwidth', def: 'Capacity of a link in bits per second. QoS can reserve or limit a share of it per class.' },
      { term: 'Delay (latency)', def: 'One-way time from sender to receiver: serialization + propagation + queuing + processing.' },
      { term: 'Jitter', def: 'Variation in one-way delay between consecutive packets of the same flow.' },
      { term: 'Loss', def: 'Packets that never arrive, usually because a full queue discarded them (**tail drop**).' },
    ],
    notes:
      "These four characteristics are how Cisco describes what an application experiences. **Bandwidth** is simply capacity. **Delay** (latency) has several parts: **serialization** delay to clock the bits onto the wire, **propagation** delay across the distance, **processing** delay inside each device, and **queuing** delay while a packet waits in an egress queue. Of these, queuing delay is the part QoS really controls, because QoS decides the order in which packets leave. **Jitter** is the variation in delay: if one voice packet takes 40 ms and the next takes 90 ms, the jitter is 50 ms. Phones hide small amounts of jitter with a **jitter buffer**, but large variation causes choppy audio. **Loss** happens when a queue is full and new packets are discarded. TCP applications recover by retransmitting, but real-time voice and video cannot use a packet that arrives late, so loss is heard or seen immediately. Exam questions often describe a symptom — choppy, robotic or clipped audio — and expect you to connect it to jitter or loss rather than to bandwidth.",
  },
  {
    kind: 'table',
    title: 'What voice, video and data need',
    columns: ['Traffic', 'Bandwidth', 'One-way delay', 'Jitter', 'Loss'],
    rows: [
      ['**Voice**', '30–320 kbps per call', '==≤ 150 ms==', '≤ 30 ms', '≤ 1%'],
      ['Interactive video', '384 kbps to 20+ Mbps', '200–400 ms', '30–50 ms', '0.1–1%'],
      ['Data (TCP)', 'Elastic, bursty', 'Tolerant', 'Tolerant', 'Recovered by retransmission'],
    ],
    caption: 'One-way targets used in Cisco CCNA material; voice is the strictest.',
    notes:
      "Memorize the voice row: **one-way delay ≤ 150 ms, jitter ≤ 30 ms, loss ≤ 1%**. These are the values used in Cisco's CCNA material, and they appear in questions that ask which application is most sensitive or which numbers are acceptable. Voice uses RTP over UDP, sends small packets at a steady rate, and needs relatively little bandwidth per call; the exact amount depends on the codec. Interactive video (video conferencing) is similarly sensitive to loss and jitter, but it needs far more bandwidth and is **bursty**, because encoded frames vary in size. Data applications that use TCP are **elastic**: when packets are lost, TCP retransmits and slows down, and users rarely notice small delays. That difference drives every QoS design decision. Give voice a **priority queue** so it never waits behind other traffic, give video a **guaranteed share** of bandwidth, and let data share whatever is left. Note that these are one-way targets; a conversation experiences the delay in both directions, which is why the voice budget is so tight.",
  },
  {
    kind: 'diagram',
    title: 'The QoS toolbox, in packet order',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'c', label: 'Classify', sub: 'ACL, NBAR, markings', shape: 'pill' },
        { id: 'm', label: 'Mark', sub: 'CoS / DSCP' },
        { id: 'p', label: 'Police', sub: 'drop or re-mark' },
        { id: 'q', label: 'Queue', sub: 'CBWFQ + LLQ', tone: 'accent' },
        { id: 'w', label: 'Avoid', sub: 'WRED early drops' },
        { id: 's', label: 'Shape', sub: 'buffer to a rate', shape: 'round' },
      ],
    },
    caption: 'Classification, marking and policing usually happen on ingress; queuing, WRED and shaping on egress.',
    notes:
      "QoS is not one feature but a pipeline of tools, and exam questions often ask which tool does what. **Classification** identifies the traffic — by ACL, by NBAR application recognition, or by trusting an existing marking. **Marking** writes a value into a header field (CoS in the 802.1Q tag, DSCP in the IP header) so every later device can classify quickly by reading one field. **Policing** measures a rate and drops or re-marks the excess. Then, on the egress interface, **queuing** (congestion management) holds packets in several queues while a scheduler decides which leaves next; **congestion avoidance** (WRED) randomly drops some TCP packets before a queue fills; and **shaping** delays traffic so it leaves no faster than a configured rate. A good way to remember the split: tools that decide what a packet is work near the edge on the way in, and tools that decide when a packet leaves work on the way out. Policing can be applied in either direction, but queuing and shaping are outbound only.",
  },
  {
    kind: 'bullets',
    title: 'Classification: ACLs, NBAR and markings',
    bullets: [
      'Classification = **matching** packets into a traffic class',
      '**ACL**: addresses, protocol and port numbers',
      '**NBAR**: deep packet inspection recognizes applications',
      '**Markings**: trust CoS/DSCP set by a trusted device',
      'Classify and mark **once**, near the source',
      'MQC: `class-map` → `policy-map` → `service-policy`',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 4,
      nodes: [
        { id: 'p', label: 'Packet in', shape: 'pill', x: 1, y: 2.6 },
        { id: 'd1', label: 'VOICE?', sub: 'NBAR: rtp audio', shape: 'diamond', x: 3.6, y: 2.6 },
        { id: 'c1', label: 'Set DSCP EF', shape: 'round', tone: 'accent', x: 3.6, y: 0.8 },
        { id: 'd2', label: 'CRITICAL?', sub: 'ACL: ERP servers', shape: 'diamond', x: 6.2, y: 2.6 },
        { id: 'c2', label: 'Set DSCP AF21', shape: 'round', x: 6.2, y: 0.8 },
        { id: 'def', label: 'class-default', sub: 'DSCP 0', tone: 'muted', x: 8.8, y: 2.6 },
      ],
      edges: [
        { from: 'p', to: 'd1' },
        { from: 'd1', to: 'c1', label: 'yes' },
        { from: 'd1', to: 'd2', label: 'no' },
        { from: 'd2', to: 'c2', label: 'yes' },
        { from: 'd2', to: 'def', label: 'no' },
      ],
    },
    notes:
      "Before a router can treat voice differently, it has to recognize it. **Access control lists** classify by Layer 3 and 4 fields — source or destination addresses, protocol and port numbers — which works well for known servers and well-known ports. **NBAR (Network-Based Application Recognition)** goes further with deep packet inspection: it recognizes a large library of applications by their signatures and behavior, even when they use dynamic ports, so a class-map can say `match protocol rtp audio`. The cheapest classifier of all is an **existing marking**: if a trusted phone already set DSCP EF, the next device simply matches `dscp ef`. That is the reason for the design rule **classify and mark as close to the source as possible** — every later hop reads one field instead of repeating expensive inspection. On IOS all of this is built with the **Modular QoS CLI (MQC)**: a `class-map` defines the match conditions, a `policy-map` lists the action for each class, and `service-policy` applies it to an interface in one direction. Classes are checked in order, and anything that matches nothing lands in `class-default`.",
  },
  {
    kind: 'diagram',
    title: 'CoS: 3 bits inside the 802.1Q tag',
    diagram: {
      type: 'header',
      layout: 'line',
      fields: [
        { label: 'TPID 0x8100', size: 16, tone: 'muted' },
        { label: 'PCP (CoS)', size: 3, tone: 'accent', sub: '0–7' },
        { label: 'DEI', size: 1 },
        { label: 'VLAN ID', size: 12 },
      ],
      caption: '802.1Q tag: 32 bits inserted after the source MAC address',
    },
    bullets: [
      'CoS = the 3-bit **PCP** field → values **0–7**',
      'Voice media usually CoS 5; call signaling CoS 3',
      'Exists only on **802.1Q-tagged** frames: trunks, voice VLAN',
      'Lost when a router rebuilds the Layer 2 header',
    ],
    notes:
      "**Class of Service (CoS)** is the Layer 2 marking. It lives in the 3-bit **Priority Code Point (PCP)** field of the 802.1Q tag; the priority bits were originally defined by 802.1p, so you will see that name too. Three bits give eight values, **0 to 7**. Cisco IP phones mark their voice frames **CoS 5** and call-signaling frames CoS 3, while ordinary data stays at CoS 0. The catch is that CoS only exists when a frame carries an 802.1Q tag: on a trunk, or on the voice VLAN between a phone and its access switch. An untagged frame on an access port has no CoS field at all. Even more important for the exam: a router **discards the incoming Layer 2 header** and builds a new one for the next link, so CoS does not survive a routed hop. That is why switches and routers map CoS to DSCP at the edge — the Layer 3 marking travels end to end. The DEI bit (formerly CFI) flags frames that are eligible to be dropped and is rarely tested.",
  },
  {
    kind: 'diagram',
    title: 'IP Precedence and DSCP in the ToS byte',
    diagram: {
      type: 'header',
      layout: 'line',
      fields: [
        { label: 'DSCP', size: 6, tone: 'accent', sub: '0–63 · first 3 bits = IP Precedence' },
        { label: 'ECN', size: 2, tone: 'muted', sub: 'congestion notification' },
      ],
      caption: 'The IPv4 ToS byte and the IPv6 Traffic Class byte share this layout',
    },
    bullets: [
      '**IP Precedence**: first 3 bits, values 0–7',
      '**DSCP**: first 6 bits, values **0–63**',
      'Last 2 bits: **ECN**, not a priority marking',
      'Same byte in IPv4 (ToS) and IPv6 (Traffic Class)',
      'Survives routing end to end, unlike CoS',
    ],
    notes:
      "The Layer 3 marking lives in one byte of the IP header, called **Type of Service (ToS)** in IPv4 and **Traffic Class** in IPv6. The original design used only the first three bits as **IP Precedence**, giving values 0 to 7; values 6 and 7 are reserved for network control traffic such as routing protocols, and voice traditionally used precedence 5. **Differentiated Services** redefined the byte: the first **six** bits became the **DSCP** (Differentiated Services Code Point), giving 64 values from 0 to 63, and the last two bits became **ECN** (Explicit Congestion Notification), which lets routers signal congestion without dropping. Because DSCP reuses the precedence bits as its top three bits, the two schemes are backward compatible — a device that only understands precedence still sees something sensible. Unlike CoS, the DSCP value travels inside the packet from source to destination, so every router on the path can act on it, unless a provider re-marks it at its edge. Exam shortcut: CoS = 3 bits, IP Precedence = 3 bits, DSCP = 6 bits.",
  },
  {
    kind: 'table',
    title: 'DSCP values you must know',
    columns: ['PHB / name', 'DSCP', 'Binary', 'Typical traffic'],
    rows: [
      ['**EF** (Expedited Forwarding)', '==46==', '101110', 'Voice media (RTP)'],
      ['AF41', '34', '100010', 'Interactive video'],
      ['AF31', '26', '011010', 'Streaming video, critical data'],
      ['AF21', '18', '010010', 'Transactional data'],
      ['AF11', '10', '001010', 'Bulk data (backups, file transfer)'],
      ['CS6', '48', '110000', 'Routing protocols (network control)'],
      ['CS3', '24', '011000', 'Call signaling'],
      ['CS1', '8', '001000', 'Scavenger (less than best effort)'],
      ['DF (CS0)', '0', '000000', 'Best effort / default'],
    ],
    caption: 'Common Cisco DiffServ markings. EF 46 is the one to never forget.',
    notes:
      "DiffServ defines **per-hop behaviors (PHBs)** — the treatment a router gives a packet based on its DSCP. **Expedited Forwarding (EF, DSCP 46)** asks for low delay, low jitter and low loss, and is the standard marking for voice media. **Assured Forwarding (AF)** defines four classes, each with three drop levels, used for video and important data. **Class Selector (CS)** values reuse the old IP Precedence positions so legacy devices still understand them; CS6 is used for routing protocols and CS3 is Cisco's recommendation for call signaling. **Default Forwarding (DF)**, DSCP 0, is plain best effort. The mapping of applications to markings is a recommendation rather than a law, but the numbers themselves are fixed by the standards, so exam questions can safely ask for the decimal value of EF or the marking recommended for voice. Learn to convert both ways. EF is binary 101110, and its first three bits (101) equal IP Precedence 5, which is why EF still looks like precedence 5 to older devices. Scavenger (CS1) is for traffic that should get less than best effort, such as unsanctioned file sharing.",
  },
  {
    kind: 'table',
    title: 'AF classes: AFxy = 8x + 2y',
    columns: ['AF class', 'Low drop (y = 1)', 'Medium drop (y = 2)', 'High drop (y = 3)'],
    rows: [
      ['Class 1', 'AF11 = 10', 'AF12 = 12', 'AF13 = 14'],
      ['Class 2', 'AF21 = 18', 'AF22 = 20', 'AF23 = 22'],
      ['Class 3', 'AF31 = 26', 'AF32 = 28', 'AF33 = 30'],
      ['Class 4', 'AF41 = 34', 'AF42 = 36', 'AF43 = 38'],
    ],
    caption: 'Higher y is dropped first. Class selectors: CSn = 8n (CS1 = 8 … CS6 = 48, CS7 = 56).',
    notes:
      "You never need to memorize all twelve AF values — derive them with **AFxy = 8x + 2y**, where **x** is the class (1–4) and **y** is the drop precedence (1–3). AF31 is 8 × 3 + 2 × 1 = 26; AF42 is 8 × 4 + 2 × 2 = 36. The binary layout explains the formula: the first three bits hold the class, the next two hold the drop precedence, and the last bit is always 0. The critical exam trap is the meaning of **y**: a **higher drop precedence is dropped first**. AF13 is not better than AF11 — when the AF1 queue congests, WRED discards AF13 packets before AF12, and AF12 before AF11. Policers use this by re-marking traffic that exceeds a contract from AF11 to AF12 or AF13 instead of dropping it immediately. **Class Selector** values are even easier: CSn = 8n, so CS1 = 8, CS3 = 24, CS5 = 40, CS6 = 48 and CS7 = 56, while CS0 equals default forwarding (0). EF (46) belongs to neither family. Practice converting a few values in both directions until it is automatic.",
  },
  {
    kind: 'bullets',
    title: 'The trust boundary',
    bullets: [
      'Trust boundary = where the network **starts believing** markings',
      'Place it **as close to the source** as possible',
      'Cisco IP phone marks its voice **EF / CoS 5**',
      'Access switch trusts the phone, **not** the PC behind it',
      'Markings from untrusted devices are re-marked, usually to 0',
      'Trusting the phone = **extended** trust boundary',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC', sub: 'untrusted', x: 1, y: 2.2, tone: 'muted' },
        { id: 'ph', icon: 'phone', label: 'IP phone', sub: 'EF / CoS 5', x: 3.4, y: 2.2, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'access', x: 5.8, y: 2.2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'WAN edge', x: 8.4, y: 2.2 },
      ],
      links: [
        { from: 'pc', to: 'ph', label: 'PC port' },
        { from: 'ph', to: 'sw', label: 'voice VLAN', toLabel: 'G1/0/1' },
        { from: 'sw', to: 'r1', toLabel: 'G0/0/1' },
      ],
      groups: [
        { label: 'Untrusted', x: 0.2, y: 0.5, w: 2.0, h: 3.4, tone: 'bad' },
        { label: 'Trusted', x: 2.4, y: 0.5, w: 7.4, h: 3.4, tone: 'good' },
      ],
      annotations: [{ x: 2.3, y: 4.15, text: 'trust boundary', tone: 'accent' }],
    },
    notes:
      "The **trust boundary** is the point where the network starts believing the QoS markings it receives. Anything arriving from outside the boundary is re-marked, typically to 0, because otherwise a user could mark their own downloads as EF and jump the queue. Cisco's design rule is to place the boundary **as close to the source as possible**, so markings are correct from the very first link. In a typical access design, the **Cisco IP phone** marks its own voice as **DSCP EF and CoS 5** on the tagged voice VLAN. The access switch is configured to trust the phone — often conditionally, only after it detects a phone through CDP or LLDP — so the boundary is **extended** to the phone. The PC plugged into the phone's PC port stays outside the boundary: its markings are not trusted, and the phone can overwrite the CoS of frames it forwards from the PC. If no phone is present, the boundary sits at the access switch port. Exam questions show a PC–phone–switch–router topology and ask where the boundary belongs: the phone or the access switch, never the WAN router.",
  },
  {
    kind: 'diagram',
    title: 'Inside an egress interface: queues and a scheduler',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'in', label: 'Packets arrive', shape: 'pill', x: 1, y: 2.5 },
        { id: 'cls', label: 'Classifier', x: 3.2, y: 2.5 },
        { id: 'q1', label: 'Priority queue', sub: 'voice EF · policed', tone: 'accent', x: 5.8, y: 0.8 },
        { id: 'q2', label: 'CBWFQ queues', sub: 'video, data · min bandwidth', x: 5.8, y: 2.5 },
        { id: 'q3', label: 'class-default', sub: 'everything else', tone: 'muted', x: 5.8, y: 4.2 },
        { id: 'sch', label: 'Scheduler', sub: 'PQ first, then weighted turns', shape: 'round', x: 8.6, y: 2.5 },
      ],
      edges: [
        { from: 'in', to: 'cls' },
        { from: 'cls', to: 'q1' },
        { from: 'cls', to: 'q2' },
        { from: 'cls', to: 'q3' },
        { from: 'q1', to: 'sch', tone: 'accent' },
        { from: 'q2', to: 'sch' },
        { from: 'q3', to: 'sch' },
      ],
    },
    caption: 'LLQ = CBWFQ plus one strict-priority queue.',
    notes:
      "When an interface is congested, IOS stops relying on a single FIFO queue and uses the queues defined by its policy. Think of it in two halves. The **classifier** looks at each outbound packet (usually its DSCP) and places it in the matching queue. The **scheduler** then decides which queue sends next. With **CBWFQ**, each class gets its own queue and a **minimum bandwidth guarantee**; the scheduler serves the queues in a weighted round-robin fashion so each class gets at least its share, and any unused bandwidth is shared among the busy classes. The problem is that a voice packet in a CBWFQ queue still has to wait for the scheduler to come around to its queue, which adds jitter. **LLQ (Low Latency Queuing)** fixes that by adding a **strict-priority queue**: the scheduler always empties the priority queue first. To stop voice from starving everything else, the priority queue is **policed** to its configured rate during congestion — excess priority traffic is dropped rather than allowed to take over the link. Packets that match no class go into **class-default**.",
  },
  {
    kind: 'table',
    title: 'Queuing methods compared',
    columns: ['Method', 'How the scheduler works', 'What it guarantees', 'Best for'],
    rows: [
      ['**FIFO**', 'One queue; first in, first out', 'Nothing — all traffic is equal', 'Uncongested links'],
      ['**Round robin**', 'Takes turns across queues; weights give some queues more turns', 'A share of bandwidth per queue', 'Fairness between data classes'],
      ['**CBWFQ**', 'Weighted round robin across user-defined classes', 'Minimum bandwidth per class (`bandwidth`)', 'Video and business data'],
      ['**LLQ**', 'Priority queue served first, then CBWFQ', 'Low delay and jitter; PQ policed (`priority`)', 'Voice and interactive video'],
    ],
    caption: 'Queuing = congestion management. Drops from a full queue = tail drop.',
    notes:
      "**FIFO** is the simplest method and the default on most interfaces: one queue, no favorites. It is perfect when the link is never congested, but during congestion voice waits behind whatever arrived first. **Round robin** scheduling creates several queues and takes packets from each in turn; **weighted** round robin lets some queues send more per turn, which gives each queue a predictable share of the link. **CBWFQ (Class-Based Weighted Fair Queuing)** is Cisco's class-based version: you define classes with MQC and assign each a guaranteed minimum with the `bandwidth` command. It is fair and flexible, but because the scheduler still rotates between queues, it cannot promise low delay. **LLQ** adds a strict **priority queue** with the `priority` command, so delay-sensitive traffic always goes first, and polices that queue to its configured rate during congestion so it cannot starve the other classes. On the exam, the words low latency, strict priority or voice point to LLQ; the phrase minimum bandwidth guarantee per class points to CBWFQ.",
  },
  {
    kind: 'cli',
    title: 'Building LLQ and CBWFQ with MQC',
    code: `R1(config)# class-map match-any VOICE
R1(config-cmap)# match dscp ef
R1(config-cmap)# class-map match-any VIDEO
R1(config-cmap)# match dscp af41
R1(config-cmap)# class-map match-any DATA
R1(config-cmap)# match dscp af21 af22 af23
R1(config-cmap)# policy-map WAN-EDGE
R1(config-pmap)# class VOICE
R1(config-pmap-c)# priority percent 20
R1(config-pmap-c)# class VIDEO
R1(config-pmap-c)# bandwidth percent 30
R1(config-pmap-c)# class DATA
R1(config-pmap-c)# bandwidth percent 25
R1(config-pmap-c)# random-detect dscp-based
R1(config-pmap-c)# class class-default
R1(config-pmap-c)# fair-queue
R1(config-pmap-c)# interface GigabitEthernet0/0/0
R1(config-if)# service-policy output WAN-EDGE`,
    highlight: ['priority percent 20', 'bandwidth percent 30', 'bandwidth percent 25', 'random-detect dscp-based', 'service-policy output WAN-EDGE'],
    caption: '`priority` builds the LLQ; `bandwidth` builds CBWFQ guarantees; the policy is applied outbound.',
    notes:
      "You will not be asked to write this configuration on the CCNA exam, but reading it makes the concepts concrete, and exam exhibits sometimes show a policy. The three **class-maps** classify by DSCP, assuming the trust boundary already marked the traffic. The **policy-map** WAN-EDGE then gives each class an action. `priority percent 20` turns VOICE into the **LLQ**: served first, and policed to 20% of the interface bandwidth while the link is congested. `bandwidth percent 30` and `bandwidth percent 25` are **CBWFQ** minimum guarantees for VIDEO and DATA — during congestion each class gets at least that share, and it may use more when others are idle. `random-detect dscp-based` enables **WRED** for DATA, so AF23 and AF22 packets are dropped before AF21 as that queue fills. `class-default` catches everything else, with fair queuing between flows. Finally, `service-policy output` attaches the policy to G0/0/0; queuing policies only work in the **output** direction. Verify with `show policy-map interface GigabitEthernet0/0/0`, which displays per-class packet, queue and drop counters.",
  },
  {
    kind: 'bullets',
    title: 'Tail drop and TCP global synchronization',
    bullets: [
      'Full queue → every new arrival is discarded: **tail drop**',
      'Tail drop hits **many TCP flows at the same moment**',
      'All those senders shrink their windows together',
      'The link goes under-used, then all ramp up together',
      'This wave pattern = **TCP global synchronization**',
      'UDP voice/video does not back off; it just loses packets',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'Queue fills' },
        { id: 'b', label: 'Tail drop', sub: 'hits many flows at once', tone: 'bad' },
        { id: 'c', label: 'Every TCP sender slows down' },
        { id: 'd', label: 'Link under-used', tone: 'warn' },
        { id: 'e', label: 'All ramp up together', sub: 'and the cycle repeats', shape: 'round' },
      ],
    },
    notes:
      "A queue has a finite size. When it is full, the router has no choice but to discard each new packet that arrives — this is **tail drop**, because packets are lost at the tail of the queue. Tail drop is indiscriminate: it drops voice as readily as a backup, and it tends to hit **many TCP connections at the same moment**. TCP reacts to loss by shrinking its congestion window, so every affected sender slows down simultaneously. Suddenly the link is under-used. Then all of those senders increase their windows at the same pace, the queue fills again, tail drop strikes again, and the cycle repeats. This saw-tooth pattern is called **TCP global synchronization**, and it wastes bandwidth even though the link looks busy on average. UDP-based real-time traffic does not slow down at all when it loses packets, so it gains nothing from this behavior — it simply suffers the loss. The fix, covered next, is to drop a few packets from a few flows **early and randomly**, so the flows fall out of step and the queue rarely reaches the tail-drop point.",
  },
  {
    kind: 'bullets',
    title: 'RED and WRED: drop early, drop randomly',
    bullets: [
      '**RED** discards a few random packets **before** the queue is full',
      'Below the minimum threshold: no drops',
      'Between thresholds: drop probability rises with queue depth',
      'Above the maximum threshold: all new packets dropped',
      '**WRED**: separate thresholds per IP Precedence or DSCP',
      'AF13 reaches its drop threshold before AF11',
      'Never apply WRED to the voice queue',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'd', label: 'Average queue depth?', shape: 'diamond', x: 2.2, y: 2.5 },
        { id: 'a', label: 'Below min threshold', sub: 'enqueue, no drops', tone: 'good', x: 7, y: 0.8 },
        { id: 'b', label: 'Between min and max', sub: 'random drops, rising %', tone: 'warn', x: 7, y: 2.5 },
        { id: 'c', label: 'Above max threshold', sub: 'drop every new packet', tone: 'bad', x: 7, y: 4.2 },
      ],
      edges: [
        { from: 'd', to: 'a' },
        { from: 'd', to: 'b' },
        { from: 'd', to: 'c' },
      ],
    },
    notes:
      "**Random Early Detection (RED)** is a congestion-avoidance tool. Instead of waiting for the queue to overflow, it watches the **average queue depth**. Below a **minimum threshold**, nothing is dropped. Between the minimum and **maximum thresholds**, it discards a small, growing percentage of arriving packets at random. Above the maximum threshold, every new packet is dropped, which is the same as tail drop. Because the early drops hit only a few flows at a time, only those TCP senders slow down, the queue stays shorter, and **global synchronization** is avoided. **Weighted RED (WRED)** adds intelligence by using different thresholds for different IP Precedence or DSCP values. With DSCP-based WRED, AF13 traffic reaches its drop threshold first, then AF12, then AF11, which is exactly what the AF drop-precedence bits were designed for. WRED only helps traffic that reacts to loss, which in practice means TCP. Applying it to voice would just add loss to traffic that cannot recover, so voice lives in the LLQ instead. When a question asks which tool prevents TCP global synchronization, the answer is RED or WRED, not tail drop or LLQ.",
  },
  {
    kind: 'bullets',
    title: 'Policing vs shaping at the WAN edge',
    bullets: [
      '**Policer**: excess is **dropped or re-marked**, never buffered',
      'Policing adds no delay but causes loss and TCP retransmissions',
      '**Shaper**: excess is **queued** and sent later at the set rate',
      'Shaping adds delay and jitter but avoids drops; **outbound only**',
      'Provider polices customer traffic to the contracted **CIR**',
      'Customer shapes its egress to that CIR first',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'LAN', x: 1, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1 (CE)', sub: 'shapes to 200 Mbps', x: 3.4, y: 2, tone: 'accent' },
        { id: 'pe', icon: 'router', label: 'PE1', sub: 'polices at 200 Mbps', x: 6.6, y: 2 },
        { id: 'sp', icon: 'cloud', label: 'Provider', x: 9, y: 2 },
      ],
      links: [
        { from: 'sw', to: 'r1', label: '1 Gbps' },
        { from: 'r1', to: 'pe', label: '1 Gbps port · 200 Mbps CIR', fromLabel: 'G0/0/0', toLabel: 'G0/0/1', arrow: 'forward' },
        { from: 'pe', to: 'sp' },
      ],
    },
    notes:
      "Policing and shaping both enforce a rate, but they handle the excess in opposite ways. A **policer** measures traffic and, when it exceeds the configured rate, immediately **drops** it or **re-marks** it to a lower-priority DSCP. Nothing is buffered, so policing never adds delay — but the drops force TCP to retransmit. A **shaper** instead **buffers** the excess and releases it later at the configured rate, smoothing bursts at the cost of extra delay and jitter; it only drops when its own queue overflows. Shaping works on **outbound** traffic only, while policing works in either direction. The classic scenario is a **subrate** WAN service: the physical port is 1 Gbps, but the contract (the **CIR**, committed information rate) is 200 Mbps. The provider polices at the ingress of its network, PE1 here, and drops anything above 200 Mbps. If R1 sent at line rate, it would lose packets at random. So the customer **shapes** its egress to 200 Mbps, which moves the congestion — and the queue — onto R1, where R1's own LLQ and CBWFQ policy decides what waits.",
  },
  {
    kind: 'steps',
    title: 'Token bucket: how rates are measured',
    steps: [
      { title: 'Tokens refill at the configured rate', text: 'The CIR, e.g. 200 Mbps; the bucket holds at most **Bc** worth of tokens.' },
      { title: 'Each packet needs tokens equal to its size', text: 'The bucket is checked as the packet arrives.' },
      { title: 'Enough tokens → conform', text: 'The packet is sent now and its tokens are removed.' },
      { title: 'Too few tokens → exceed', text: 'A policer drops or re-marks; a shaper holds the packet until tokens refill.' },
      { title: 'Shapers work in Tc intervals', text: 'Bc = CIR × Tc: 200 Mbps × 10 ms = 2,000,000 bits.' },
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'p', label: 'Packet arrives', shape: 'pill', x: 1.2, y: 2.5 },
        { id: 'd', label: 'Enough tokens?', shape: 'diamond', x: 4, y: 2.5 },
        { id: 'ok', label: 'Conform: send now', shape: 'round', tone: 'good', x: 7.4, y: 0.8 },
        { id: 'pol', label: 'Policer: drop or re-mark', tone: 'bad', x: 7.4, y: 2.5 },
        { id: 'shp', label: 'Shaper: queue, send later', tone: 'warn', x: 7.4, y: 4.2 },
      ],
      edges: [
        { from: 'p', to: 'd' },
        { from: 'd', to: 'ok', label: 'yes' },
        { from: 'd', to: 'pol', label: 'no' },
        { from: 'd', to: 'shp', label: 'no' },
      ],
    },
    notes:
      "Both policers and shapers measure rate with a **token bucket**. Imagine a bucket that receives tokens at a steady speed equal to the configured rate, the **CIR**. Each token is permission to send a certain amount of data. When a packet arrives, the device checks whether the bucket holds enough tokens for that packet's size. If it does, the packet **conforms**: it is sent and the tokens are removed. If not, the packet **exceeds** the rate. A **policer** then applies its exceed action — drop, or re-mark and transmit — while a **shaper** holds the packet in its queue until enough tokens have refilled. The bucket has a maximum size, the **committed burst (Bc)**, which is why a short burst is allowed after a quiet period but a sustained excess is not. Shapers release traffic in small time slices called **Tc**, sending up to Bc bits per slice, so Bc = CIR × Tc. With a 200 Mbps CIR and a 10 ms Tc, Bc is 2,000,000 bits (250,000 bytes). A short Tc such as 10 ms is preferred when voice is present, because it limits how long a packet can wait for the next slice.",
  },
  {
    kind: 'cli',
    title: 'Policing and shaping in MQC',
    code: `PE1(config)# policy-map POLICE-CUST-A
PE1(config-pmap)# class class-default
PE1(config-pmap-c)# police cir 200000000
PE1(config-pmap-c-police)# conform-action transmit
PE1(config-pmap-c-police)# exceed-action drop
PE1(config-pmap-c-police)# interface GigabitEthernet0/0/1
PE1(config-if)# service-policy input POLICE-CUST-A

R1(config)# policy-map SHAPE-200M
R1(config-pmap)# class class-default
R1(config-pmap-c)# shape average 200000000
R1(config-pmap-c)# service-policy WAN-EDGE
R1(config-pmap-c)# interface GigabitEthernet0/0/0
R1(config-if)# service-policy output SHAPE-200M`,
    highlight: ['police cir 200000000', 'exceed-action drop', 'shape average 200000000', 'service-policy WAN-EDGE', 'service-policy input POLICE-CUST-A', 'service-policy output SHAPE-200M'],
    caption: 'The provider polices inbound; the customer shapes outbound with the LLQ policy nested inside.',
    notes:
      "Here both ends of the subrate link are configured. On the provider router **PE1**, the policy POLICE-CUST-A uses `police cir 200000000` (rates are in bits per second) with `conform-action transmit` and `exceed-action drop`, and it is applied **inbound** on the customer-facing interface. Instead of dropping, a provider could use `exceed-action set-dscp-transmit` to re-mark the excess to a lower class and still forward it — a policer can re-mark, a shaper cannot. On the customer router **R1**, the parent policy SHAPE-200M uses `shape average 200000000` to hold the output rate to the CIR, and the line `service-policy WAN-EDGE` nests the LLQ and CBWFQ policy from earlier inside the shaper. This **hierarchical** design matters: shaping creates a queue at 200 Mbps, so something must decide which packets wait in that queue, and the child policy makes sure voice still goes first. The shaper is attached with `service-policy output`, because shaping is outbound only. Remember the pairing for the exam: provider → police (inbound, drop or re-mark); customer → shape (outbound, buffer).",
  },
  {
    kind: 'table',
    title: 'QoS models: best effort, IntServ, DiffServ',
    columns: ['Model', 'How it works', 'Scales?', 'Key point'],
    rows: [
      ['**Best effort**', 'No classification; every packet treated alike (FIFO)', 'Yes', 'The default: no guarantees at all'],
      ['**IntServ**', 'Applications reserve bandwidth per flow, end to end, with **RSVP**', 'Poorly', 'Every router keeps state for every flow'],
      ['**DiffServ**', 'Mark at the edge; each hop applies a **PHB** chosen by DSCP', '==Yes==', 'Class-based model used in modern networks'],
    ],
    notes:
      "Cisco describes three overall QoS models. **Best effort** is no QoS at all: every packet is equal and waits in the same FIFO queue. It scales perfectly but guarantees nothing. **Integrated Services (IntServ)** is the reservation model: before sending, an application uses **RSVP (Resource Reservation Protocol)** to ask every router along the path to reserve bandwidth for that specific flow, and each router must admit or refuse the request. It can deliver hard guarantees, but every router has to track the state of every flow, which does not scale to large networks carrying thousands of calls and sessions. **Differentiated Services (DiffServ)** is the model everything else in this lesson belongs to. Traffic is classified and marked with a DSCP value at the edge, and each router independently applies a **per-hop behavior** based only on that marking — no signaling and no per-flow state. Because routers deal with a handful of classes instead of individual flows, DiffServ scales to any size, which is why enterprise and provider networks use it. If an exam question mentions RSVP or per-flow reservations, the answer is IntServ.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'QoS exam traps',
    body: 'Know the numbers cold: **EF = 46**, **AFxy = 8x + 2y**, **CSn = 8n**; CoS is **3 bits**, DSCP is **6 bits**.',
    bullets: [
      'AF13 is dropped **before** AF11: higher y, higher drop precedence',
      'Voice: ≤ 150 ms one-way delay, ≤ 30 ms jitter, ≤ 1% loss',
      'LLQ = CBWFQ + strict-priority queue, policed during congestion',
      'Policing drops or re-marks with no delay; shaping buffers, outbound only',
      'WRED prevents TCP global synchronization; it does not help UDP',
      'Trust boundary: IP phone or access switch, close to the source',
      'CoS dies at the first router; DSCP survives end to end',
    ],
    notes:
      "These are the points Cisco questions keep returning to. The number traps come first: EF is **46**, not 40 (that is CS5), AF41 is **34**, and CS values are multiples of eight. Many candidates assume a bigger AF drop-precedence digit means better service — it means the opposite, because AF13 is discarded first. Watch the direction of each tool: shaping and queuing are **outbound only**, policing can be inbound or outbound, and the provider typically polices while the customer shapes. Remember why LLQ polices its priority queue: without that limit, traffic in the priority queue could starve every other class. For congestion avoidance, the phrase TCP global synchronization always points to **RED/WRED**, and its cause is **tail drop**. For the trust boundary, choose the device nearest the source that the network team controls — the IP phone (extended trust) or the access switch port — never the user's PC and never deep in the core. Finally, CoS lives in the 802.1Q tag, so a router strips it when it builds a new frame, whereas DSCP stays in the IP header across every hop.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'QoS manages bandwidth, delay, jitter and loss during congestion',
      'Classify (ACL, NBAR) and mark (CoS 3 bits, DSCP 6 bits) near the source',
      'Key DSCP: EF 46 voice, AF41 video, CS3 signaling, CS6 routing, DF 0',
      'LLQ protects voice; CBWFQ guarantees minimum bandwidth; FIFO by default',
      'WRED drops early and randomly to avoid global synchronization',
      'Police at the provider edge; shape at the customer WAN egress',
      'DiffServ scales with per-hop behaviors; IntServ needs RSVP per flow',
    ],
    notes:
      "QoS is about choosing winners and losers when an interface is congested. Start with the needs: voice tolerates at most 150 ms of one-way delay, 30 ms of jitter and 1% loss, and interactive video is similar but bursty and bandwidth-hungry. Classify traffic with ACLs, NBAR or trusted markings, and mark it once near the source: CoS in the 802.1Q tag (3 bits, lost at routers) and DSCP in the IP header (6 bits, end to end). Learn the DiffServ values — EF 46, AFxy = 8x + 2y with higher y dropped first, CSn = 8n — and place the trust boundary at the phone or access switch. On egress, LLQ gives voice a policed strict-priority queue, CBWFQ guarantees each class a minimum share, and WRED drops early and randomly so TCP flows do not synchronize. Policers drop or re-mark excess without delay; shapers buffer excess and add delay, outbound only, which is why customers shape to the CIR that providers police. Finally, DiffServ is the scalable, class-based model used today, while IntServ relies on per-flow RSVP reservations.",
  },
];

export default slides;
