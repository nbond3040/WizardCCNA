import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'OSI Layer 1 — name and job', back: '**Physical**: sends raw bits as electrical, light or radio signals; defines cables, connectors, pinouts and voltages.' },
  { id: 'f2', front: 'OSI Layer 2 — name and job', back: '**Data Link**: framing, MAC addressing, media access and error detection (FCS) on one link.' },
  { id: 'f3', front: 'OSI Layer 3 — name and job', back: '**Network**: logical (IP) addressing and routing / path selection between networks.' },
  { id: 'f4', front: 'OSI Layer 4 — name and job', back: '**Transport**: delivery between applications using port numbers; segmentation, and with TCP reliability and flow control.' },
  { id: 'f5', front: 'OSI Layer 5 — name and job', back: '**Session**: establishes, manages and terminates sessions (dialogs) between applications.' },
  { id: 'f6', front: 'OSI Layer 6 — name and job', back: '**Presentation**: data format and syntax — encoding, compression and encryption (e.g. ASCII, JPEG).' },
  { id: 'f7', front: 'OSI Layer 7 — name and job', back: '**Application**: the interface between applications and the network (HTTP, DNS, SMTP, SSH) — the protocols, not the program.' },
  { id: 'f8', front: 'Mnemonic for OSI Layers 1 → 7', back: '**Please Do Not Throw Sausage Pizza Away** — Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  { id: 'f9', front: 'Mnemonic for OSI Layers 7 → 1', back: '**All People Seem To Need Data Processing** — Application, Presentation, Session, Transport, Network, Data Link, Physical.' },
  { id: 'f10', front: 'PDU name at Layer 4', back: '**Segment** (TCP). A UDP PDU is usually called a **datagram**.' },
  { id: 'f11', front: 'PDU name at Layer 3', back: '**Packet**.' },
  { id: 'f12', front: 'PDU name at Layer 2', back: '**Frame**.' },
  { id: 'f13', front: 'PDU name at Layer 1', back: '**Bits**.' },
  { id: 'f14', front: 'Layers of the original TCP/IP model (RFC 1122)', back: 'Application, Transport, **Internet**, **Link** (Link is also called Network Access).' },
  { id: 'f15', front: 'Layers of the updated (5-layer) TCP/IP model', back: 'Application, Transport, Network, Data Link, Physical.' },
  { id: 'f16', front: 'TCP/IP Application layer = which OSI layers?', back: 'OSI Layers **5, 6 and 7** (Session, Presentation, Application).' },
  { id: 'f17', front: 'TCP/IP Link (Network Access) layer = which OSI layers?', back: 'OSI Layers **1 and 2** (Physical and Data Link).' },
  { id: 'f18', front: 'Encapsulation', back: 'Each layer adds its header (Layer 2 also adds a trailer) to the data from the layer above as it moves **down** the sender\'s stack.' },
  { id: 'f19', front: 'De-encapsulation', back: 'The receiver reads and removes each header as data moves **up** its stack, passing the payload to the next layer.' },
  { id: 'f20', front: 'Same-layer interaction', back: 'Layer N on one host communicating with layer N on **another** host through that layer\'s header (e.g. TCP acknowledgments).' },
  { id: 'f21', front: 'Adjacent-layer interaction', back: 'On the **same** host, a layer provides a service to the layer directly above it (e.g. IP carries segments for TCP).' },
  { id: 'f22', front: 'Which layer adds a trailer?', back: 'Only the **data link** layer — Ethernet appends a 4-byte **FCS** (Frame Check Sequence).' },
  { id: 'f23', front: 'What happens to a frame that fails the FCS check?', back: 'It is **discarded** (and counted as a CRC error). Ethernet does not retransmit; upper layers such as TCP recover the data.' },
  { id: 'f24', front: 'Layer at which a hub operates', back: '**Layer 1** — it regenerates bits out every other port.' },
  { id: 'f25', front: 'Layer at which a Layer 2 switch operates', back: '**Layer 2** — it forwards frames by destination MAC address.' },
  { id: 'f26', front: 'Layer at which a router operates', back: '**Layer 3** — it forwards packets by destination IP address.' },
  { id: 'f27', front: 'How far up the stack does a next-generation firewall inspect?', back: 'Up to **Layer 7** — it identifies applications and URLs, not just addresses and ports.' },
  { id: 'f28', front: 'Identifier used at L2 / L3 / L4', back: 'MAC address (48 bits) / IP address (32 bits IPv4, 128 bits IPv6) / port number (16 bits).' },
  { id: 'f29', front: 'Ethernet field that identifies the Layer 3 protocol inside a frame', back: 'The **EtherType**: 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP.' },
  { id: 'f30', front: 'IPv4 Protocol field values for ICMP, TCP and UDP', back: '**1** = ICMP, **6** = TCP, **17** = UDP.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which OSI layer provides logical addressing and selects a path between networks?',
    options: ['Data Link', 'Network', 'Transport', 'Session'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **Network layer** (Layer 3) owns logical IP addressing and routing. The Data Link layer only moves frames across one link using MAC addresses, the Transport layer delivers data between applications using ports, and the Session layer manages dialogs between applications.',
  },
  {
    id: 'q2',
    type: 'order',
    stem: 'Put the OSI layers in order from Layer 1 to Layer 7.',
    items: ['Physical', 'Data Link', 'Network', 'Transport', 'Session', 'Presentation', 'Application'],
    difficulty: 1,
    explanation:
      "Bottom to top: Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7) — 'Please Do Not Throw Sausage Pizza Away'.",
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about the data link layer are true? (Choose two.)',
    options: [
      'It uses MAC addresses to deliver frames on a link',
      'It adds a trailer containing the FCS',
      'It uses port numbers to identify applications',
      'Its PDU is called a packet',
      'It selects the best path between remote networks',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'Layer 2 frames are addressed with **MAC addresses** and end with an **FCS trailer** used for error detection. Port numbers belong to Layer 4, the packet is the Layer 3 PDU (the Layer 2 PDU is a frame), and path selection between networks is routing at Layer 3.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each PDU name to its OSI layer.',
    pairs: [
      { left: 'Segment', right: 'Layer 4 — Transport' },
      { left: 'Packet', right: 'Layer 3 — Network' },
      { left: 'Frame', right: 'Layer 2 — Data Link' },
      { left: 'Bits', right: 'Layer 1 — Physical' },
    ],
    difficulty: 1,
    explanation:
      "Top-down the PDUs are data, segment, packet, frame, bits ('Do Some People Fear Birthdays'): segments at Layer 4, packets at Layer 3, frames at Layer 2 and bits at Layer 1.",
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'In the original four-layer TCP/IP model, what is the name of the layer that corresponds to OSI Layer 3? (one word)',
    answers: ['Internet', 'Internet layer'],
    placeholder: 'layer name',
    difficulty: 1,
    explanation:
      'The original TCP/IP model (RFC 1122) calls it the **Internet** layer — that is where IP lives. The updated five-layer model renames it Network. The Link (Network Access) layer maps to OSI Layers 1 and 2, not Layer 3.',
  },
  {
    id: 'q6',
    type: 'categorize',
    stem: 'Place each protocol into its layer of the original TCP/IP model.',
    categories: ['Application', 'Transport', 'Internet', 'Link'],
    items: [
      { text: 'HTTP', category: 0 },
      { text: 'DNS', category: 0 },
      { text: 'TCP', category: 1 },
      { text: 'UDP', category: 1 },
      { text: 'IPv4', category: 2 },
      { text: 'ICMP', category: 2 },
      { text: 'Ethernet', category: 3 },
      { text: '802.11 Wi-Fi', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'HTTP and DNS are application protocols; TCP and UDP are the transport protocols; IPv4 and ICMP live in the Internet layer (ICMP is carried in IP but is a network-layer protocol); Ethernet and 802.11 define framing and media access in the Link layer.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'A host receives a frame, checks its FCS, reads the IP header and then passes the segment to TCP. Which process is being described?',
    options: ['Encapsulation', 'De-encapsulation', 'Segmentation', 'Routing'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Removing and processing headers as data moves **up** the stack is **de-encapsulation**. Encapsulation is the reverse process on the sender, segmentation is TCP splitting data into segments, and routing is a router choosing a path — none of which describes a host unwrapping a received frame.',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which OSI layer splits application data into segments and uses port numbers so that multiple applications can share one network connection?',
    options: ['Network', 'Transport', 'Session', 'Data Link'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Segmentation and port-based multiplexing are **Transport layer** (Layer 4) functions performed by TCP and UDP. The Network layer uses IP addresses rather than ports, the Session layer manages dialogs but does not multiplex with ports, and the Data Link layer frames data for a single link.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. A protocol analyzer captured this frame. Which statement is correct?',
    exhibit: {
      kind: 'cli',
      text: `Frame 57: 66 bytes on wire (528 bits), 66 bytes captured (528 bits)
Ethernet II, Src: 00:1a:2b:3c:4d:5e, Dst: 00:25:9c:11:22:33
Internet Protocol Version 4, Src: 192.168.10.25, Dst: 203.0.113.80
Transmission Control Protocol, Src Port: 51544, Dst Port: 443, Seq: 0, Len: 0`,
    },
    options: [
      'The value 443 is in the Layer 4 header and identifies the destination application (HTTPS)',
      'Routers use the two MAC addresses to choose the best path to 203.0.113.80',
      'The value 51544 is the well-known port of the web server',
      'The IP addresses are carried in the Layer 2 header',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Port numbers live in the **TCP header** (Layer 4); destination port **443** identifies HTTPS on the server. MAC addresses are Layer 2 and only matter on the local link — routers choose paths by IP address. 51544 is the client\'s ephemeral **source** port, not a well-known port. The IP addresses are in the Layer 3 header, which sits inside the frame\'s payload, not in the Ethernet header.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Refer to the exhibit. PC1 sends a packet to Server1. Which two intermediate devices use the destination IP address of the packet to make a forwarding decision? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 12,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1, y: 1.5 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 3, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.5 },
          { id: 'r2', icon: 'router', label: 'R2', x: 7, y: 1.5 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 9, y: 1.5 },
          { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.20', x: 11, y: 1.5 },
        ],
        links: [
          { from: 'pc', to: 'sw1' },
          { from: 'sw1', to: 'r1' },
          { from: 'r1', to: 'r2', label: '10.0.12.0/30' },
          { from: 'r2', to: 'sw2' },
          { from: 'sw2', to: 'srv' },
        ],
      },
    },
    options: ['SW1', 'R1', 'R2', 'SW2', 'PC1'],
    answers: [1, 2],
    difficulty: 2,
    explanation:
      '**R1 and R2** are Layer 3 devices: each de-encapsulates the frame, looks up the destination IP in its routing table and forwards the packet in a new frame. SW1 and SW2 are Layer 2 switches that forward on destination MAC address and never examine the IP header. PC1 originates the packet; it compares the destination with its own subnet to pick the gateway, but it is not forwarding someone else\'s packet.',
  },
  {
    id: 'e4',
    type: 'order',
    stem: 'Put the de-encapsulation steps performed by a receiving host in the correct order.',
    items: [
      'Convert the received signals into bits',
      'Check the FCS and destination MAC address of the frame',
      'Check the destination IP address and Protocol field of the packet',
      'Read the destination port in the segment header',
      'Deliver the data to the application',
    ],
    difficulty: 2,
    explanation:
      'De-encapsulation moves up the stack: Layer 1 turns signals into bits, Layer 2 verifies the FCS and destination MAC, Layer 3 checks the destination IP and uses the Protocol field to pick TCP or UDP, Layer 4 uses the destination port to find the process, and finally the application receives the data.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each function to the OSI layer that performs it.',
    pairs: [
      { left: 'Encryption, compression and data formatting', right: 'Presentation (Layer 6)' },
      { left: 'Establishing and terminating dialogs between applications', right: 'Session (Layer 5)' },
      { left: 'Port-based multiplexing and reliable delivery', right: 'Transport (Layer 4)' },
      { left: 'Logical addressing and path selection', right: 'Network (Layer 3)' },
      { left: 'Framing, MAC addressing and error detection', right: 'Data Link (Layer 2)' },
      { left: 'Signaling bits onto copper, fiber or radio', right: 'Physical (Layer 1)' },
    ],
    difficulty: 1,
    explanation:
      'Presentation handles format and encryption; Session manages dialogs; Transport multiplexes with ports and (TCP) provides reliability; Network handles IP addressing and routing; Data Link frames data, uses MAC addresses and detects errors with the FCS; Physical signals the bits on the medium.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Drag each item to the OSI layer it is associated with.',
    categories: ['Layer 2', 'Layer 3', 'Layer 4'],
    items: [
      { text: 'MAC address', category: 0 },
      { text: 'FCS', category: 0 },
      { text: 'Frame', category: 0 },
      { text: 'IPv4 address', category: 1 },
      { text: 'TTL', category: 1 },
      { text: 'Packet', category: 1 },
      { text: 'Port number', category: 2 },
      { text: 'TCP window size', category: 2 },
      { text: 'Segment', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Layer 2 owns MAC addresses, the FCS trailer and the frame. Layer 3 owns IP addresses, the TTL field of the IP header and the packet. Layer 4 owns port numbers, TCP header fields such as the window size, and the segment.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'A user can reach hosts in her own subnet but no hosts on other subnets. The engineer finds an incorrect default gateway configured on her PC. At which OSI layer is the problem?',
    options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The default gateway is an IP (Layer 3) setting that decides where packets for remote subnets are sent, so this is a **Layer 3** problem. Layers 1 and 2 are clearly working because local hosts are reachable, and nothing points to a Layer 4 port or ACL issue.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 sends a packet to Server1. Which addresses are in the frame while it crosses the link between R1 and R2?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 12,
        height: 3.5,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10 · MAC A', x: 1, y: 1.6 },
          { id: 'r1', icon: 'router', label: 'R1', x: 4.3, y: 1.6 },
          { id: 'r2', icon: 'router', label: 'R2', x: 7.7, y: 1.6 },
          { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.20 · MAC F', x: 11, y: 1.6 },
        ],
        links: [
          { from: 'pc', to: 'r1', toLabel: 'G0/0/0 · MAC B' },
          { from: 'r1', to: 'r2', fromLabel: 'G0/0/1 · MAC C', toLabel: 'G0/0/0 · MAC D' },
          { from: 'r2', to: 'srv', fromLabel: 'G0/0/1 · MAC E' },
        ],
      },
    },
    options: [
      'Source MAC C, destination MAC D; source IP 10.1.1.10, destination IP 10.2.2.20',
      'Source MAC A, destination MAC F; source IP 10.1.1.10, destination IP 10.2.2.20',
      'Source MAC C, destination MAC D; source IP of R1, destination IP of R2',
      'Source MAC A, destination MAC B; source IP 10.1.1.10, destination IP 10.2.2.20',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Each router builds a **new frame** for the next link, so between R1 and R2 the source MAC is R1\'s G0/0/1 (**C**) and the destination MAC is R2\'s G0/0/0 (**D**). The IP header is not rewritten (no NAT), so the addresses are still PC1 (10.1.1.10) to Server1 (10.2.2.20). MACs A and F never appear together on any link, the router interface IPs are never placed in the header of transit traffic, and A-to-B is the frame on the first link only.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'Which two statements about the TCP/IP model are true? (Choose two.)',
    options: [
      'Its Application layer covers the functions of OSI Layers 5, 6 and 7',
      'Its Link (Network Access) layer corresponds to OSI Layers 1 and 2',
      'It has seven layers, just like the OSI model',
      'Its Internet layer corresponds to the OSI Transport layer',
      'It was published by ISO as the reference for all networking',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'TCP/IP folds OSI\'s Application, Presentation and Session layers into one **Application** layer and (in the original model) combines Data Link and Physical into the **Link** layer. It has four layers (five in the updated view), not seven; its Internet layer maps to OSI Layer 3, not Layer 4; and it comes from the IETF\'s RFCs — ISO published OSI.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which name belongs in the TCP/IP layer marked with a question mark?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'stack',
        columns: [
          {
            title: 'OSI',
            layers: [
              { label: 'Application' },
              { label: 'Presentation' },
              { label: 'Session' },
              { label: 'Transport' },
              { label: 'Network' },
              { label: 'Data Link' },
              { label: 'Physical' },
            ],
          },
          {
            title: 'TCP/IP (original)',
            layers: [
              { label: 'Application', span: 3 },
              { label: 'Transport' },
              { label: '?', tone: 'accent' },
              { label: 'Link', span: 2 },
            ],
          },
        ],
      },
    },
    options: ['Internet', 'Network Access', 'Session', 'Data Link'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The layer aligned with OSI Layer 3 is the **Internet** layer, home of IPv4 and IPv6. Network Access is another name for the Link layer (OSI 1–2), Session is an OSI layer absorbed into TCP/IP Application, and Data Link is an OSI (and updated TCP/IP) name for Layer 2.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Which PDU contains source and destination MAC addresses and ends with a trailer used for error detection?',
    options: ['Segment', 'Packet', 'Frame', 'Datagram'],
    answer: 2,
    difficulty: 1,
    explanation:
      'A **frame** (Layer 2) carries MAC addresses in its header and the FCS in its trailer. Segments (and UDP datagrams) carry port numbers, packets carry IP addresses, and none of them has a trailer.',
  },
  {
    id: 'e12',
    type: 'input',
    stem: 'At which OSI layer number do TCP and UDP port numbers operate? Enter the number.',
    answers: ['4', 'layer 4', 'l4'],
    placeholder: 'layer number',
    difficulty: 1,
    explanation:
      'Port numbers are carried in the TCP and UDP headers at **Layer 4**, the Transport layer. IP addresses are Layer 3 and MAC addresses are Layer 2.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. The user\'s ping to the web server succeeds, but the browser reports that the connection to https://203.0.113.80 was refused. Using a bottom-up approach, what can the engineer conclude?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> ping 203.0.113.80

Pinging 203.0.113.80 with 32 bytes of data:
Reply from 203.0.113.80: bytes=32 time=18ms TTL=52
Reply from 203.0.113.80: bytes=32 time=17ms TTL=52
Reply from 203.0.113.80: bytes=32 time=18ms TTL=52
Reply from 203.0.113.80: bytes=32 time=19ms TTL=52

Ping statistics for 203.0.113.80:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 17ms, Maximum = 19ms, Average = 18ms`,
    },
    options: [
      'Layers 1–3 work end to end; continue at Layer 4 and above (is the service listening on TCP 443, or is it filtered?)',
      'Only Layer 1 is proven; the user\'s cable should be replaced first',
      'Layers 1–4 work end to end, so the problem must be DNS',
      'Layer 2 is failing because the PC does not know the server\'s MAC address',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'ICMP echo replies prove that the physical links, the frames on every hop and IP routing in both directions all work — **Layers 1–3 are verified**. A refused connection means something answered at the transport layer (typically a TCP reset because nothing is listening on 443, or a firewall rejecting it), so troubleshooting continues at **Layer 4+**. A bad cable would break the ping too. DNS is not involved because the user browsed to an IP address, and ping does not test TCP port 443. The PC never needs the remote server\'s MAC — it sends frames to its gateway.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. What happens to the frames counted in the CRC field, and how is the lost data recovered for a file transfer that uses TCP?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces gigabitethernet1/0/5 | include CRC
     57 input errors, 57 CRC, 0 frame, 0 overrun, 0 ignored`,
    },
    options: [
      'The switch discards them at Layer 2; TCP on the sending host retransmits the missing data',
      'The switch corrects the errors using the FCS and forwards the repaired frames',
      'The switch requests retransmission from its neighbor using Ethernet acknowledgments',
      'The switch forwards the frames and the destination host\'s IP layer repairs them',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A CRC error means the recalculated FCS did not match, so the frame is **discarded**. The FCS only *detects* errors — it cannot correct them — and Ethernet has no acknowledgments or retransmissions. Recovery is left to upper layers: **TCP** notices the missing bytes (no acknowledgment) and retransmits them. IP does not repair corrupted frames, and switches never knowingly forward frames that fail the FCS check (store-and-forward switching).',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about same-layer and adjacent-layer interaction are true? (Choose two.)',
    options: [
      'A receiving host\'s TCP setting an acknowledgment number that the sending host\'s TCP reads is same-layer interaction',
      'IP on a host carrying a segment handed to it by TCP on the same host is adjacent-layer interaction',
      'Adjacent-layer interaction occurs between the same layer on two different hosts',
      'Same-layer interaction requires both hosts to run the same operating system',
      'The data link layer of one host reads the TCP header added by the other host',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      '**Same-layer** interaction is between peers on different hosts using header fields — TCP acknowledgments are the classic example. **Adjacent-layer** interaction is between neighboring layers on one host, such as IP providing delivery for TCP. Option three swaps the two definitions. Interoperability comes from shared protocol standards, not a shared OS. The data link layer reads only the Layer 2 header, never the TCP header.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each technology to its layer in the updated five-layer TCP/IP model.',
    pairs: [
      { left: 'HTTP', right: 'Application' },
      { left: 'UDP', right: 'Transport' },
      { left: 'IPv6', right: 'Network' },
      { left: 'Ethernet MAC framing', right: 'Data Link' },
      { left: 'Cat 6 UTP with RJ-45 connectors', right: 'Physical' },
    ],
    difficulty: 2,
    explanation:
      'HTTP is an application protocol, UDP is a transport protocol, IPv6 is the network-layer protocol, Ethernet framing with MAC addresses is data link, and cabling and connectors are physical-layer specifications.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'A security team needs a device that can permit Webex traffic while blocking a peer-to-peer file-sharing application that uses the same TCP port. Which device and inspection depth does this require?',
    options: [
      'A next-generation firewall inspecting up to Layer 7',
      'A traditional stateful firewall filtering on port numbers at Layer 4',
      'A Layer 2 switch filtering on MAC addresses',
      'A hub inspecting bits at Layer 1',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Both applications share a port, so the device must identify the **application itself** — Application Visibility and Control on a **next-generation firewall** works at Layer 7. A traditional stateful firewall sees only addresses, protocols and ports, so it cannot tell the two apart. Switches forward on MAC addresses, and hubs have no filtering ability at all.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'An application hands 1000 bytes of data to TCP. The segment travels in an IPv4 packet inside an Ethernet II frame; no IP or TCP options and no VLAN tag are used. How many bytes long is the frame, counting from the destination MAC address through the FCS?',
    answers: ['1058', '1058 bytes'],
    placeholder: 'bytes',
    difficulty: 3,
    explanation:
      'Add each layer\'s overhead: 1000 bytes of data + 20-byte TCP header + 20-byte IPv4 header + 14-byte Ethernet header (6 + 6 + 2) + 4-byte FCS = **1058 bytes**. The 8-byte preamble and SFD are physical-layer signaling and are not part of the frame.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which three fields belong to the Ethernet frame header or trailer rather than to the packet it carries? (Choose three.)',
    options: ['Destination MAC address', 'EtherType', 'Frame Check Sequence', 'Time to Live', 'Destination port', 'Source IP address'],
    answers: [0, 1, 2],
    difficulty: 2,
    explanation:
      'The Ethernet header holds the **destination and source MAC addresses** and the **EtherType**, and the trailer holds the **FCS**. TTL and the source IP address are IPv4 header fields (Layer 3), and the destination port is in the TCP or UDP header (Layer 4) — all of them sit inside the frame\'s payload.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Refer to the exhibit. PC1 sends a DNS query to the DNS server. Which two statements describe the frame when it arrives at the DNS server? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1.2, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.5 },
          { id: 'dns', icon: 'server', label: 'DNS server', sub: '10.2.2.53', x: 8.8, y: 1.5 },
        ],
        links: [
          { from: 'pc', to: 'r1', label: '10.1.1.0/24', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'dns', label: '10.2.2.0/24', fromLabel: 'G0/0/1' },
        ],
      },
    },
    options: [
      'The source MAC address is PC1\'s MAC address',
      'The source MAC address is the MAC of R1 G0/0/1',
      'The destination IP address is the IP address of R1 G0/0/1',
      'The destination port is UDP 53',
      'The source port is UDP 53',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'R1 built a new frame for the server\'s subnet, so the **source MAC is R1 G0/0/1**; PC1\'s MAC only appeared on the first link. The destination IP is still the DNS server (10.2.2.53) — routers never substitute their own address without NAT. DNS servers listen on **UDP 53**, so that is the destination port; the client\'s source port is an ephemeral high-numbered port, not 53.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'An engineer says a problem is at the layer where MAC addresses are used. Which issue fits that description?',
    options: [
      'A switch port assigned to the wrong VLAN',
      'An ACL blocking TCP port 443',
      'A host configured with the wrong subnet mask',
      'A fiber strand broken inside a conduit',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'MAC addresses are Layer 2, and VLAN membership is a **Layer 2** switching function — a port in the wrong VLAN puts the host in the wrong broadcast domain. Blocking a TCP port is a Layer 4 filter, a wrong subnet mask is a Layer 3 addressing error, and a broken fiber is a Layer 1 media fault.',
  },
];
