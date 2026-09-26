import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'OSI & TCP/IP Models',
    subtitle: 'The layered map every network conversation is built on',
    notes:
      "Welcome to WizardCCNA. Before you configure a single router you need a shared map of *where* each networking job happens, and that map is the layered model. In this deck you will learn the seven **OSI** layers by number, name and job; how the **TCP/IP** model (the original four-layer version and the updated five-layer version) lines up with OSI; how data is wrapped in headers on the way down the stack (**encapsulation**) and unwrapped on the way up; the correct **PDU** name at each layer; and which devices work at which layer. Nearly every CCNA topic hangs off this map: a MAC address question is a Layer 2 question, an IP address question is Layer 3, a port number question is Layer 4. This lesson supports v1.1 exam topics 1.1 and 1.5 and sits in Domain 1 (Network Infrastructure and Connectivity) of v2.0 — both exam versions assume you know it cold.",
  },
  {
    kind: 'bullets',
    title: 'Why networks are described in layers',
    bullets: [
      'Break one huge problem into **smaller, separate jobs**',
      'Each layer provides a **service** to the layer above it',
      'Change one layer without touching the others',
      'Vendors **interoperate** by building to the same layer standards',
      "Shared **vocabulary**: 'a Layer 2 issue' means the same to everyone",
      'Troubleshoot **layer by layer** instead of guessing',
    ],
    notes:
      "Networking is complicated: electrical signaling, addressing, routing, reliability, encryption and application behavior all have to work together. A layered model splits that work into separate jobs with clean hand-offs. Each layer only needs to know how to use the layer below it and how to serve the layer above it. The payoff is **modularity**: the same web browser works over Ethernet, Wi-Fi or 5G because only the lower layers changed. Standards bodies and vendors can build products to one layer's rules and still interoperate with everyone else's, and engineers gain a common language — say 'it is a Layer 1 problem' and everyone pictures cables and transceivers. Classic Cisco material lists the benefits as: reduced complexity, standardized interfaces, modular engineering, interoperable technology, faster evolution, and simpler teaching and learning. If an exam question asks why layered models exist, it wants one of those ideas — not 'to make the network faster' or 'to encrypt traffic'.",
  },
  {
    kind: 'diagram',
    title: 'The OSI reference model',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'OSI layer',
          layers: [
            { label: '7 · Application', sub: 'network services for apps' },
            { label: '6 · Presentation', sub: 'format, encrypt, compress' },
            { label: '5 · Session', sub: 'open, manage, close dialogs' },
            { label: '4 · Transport', sub: 'ports, segments, reliability' },
            { label: '3 · Network', sub: 'logical addressing, routing' },
            { label: '2 · Data Link', sub: 'frames, MACs, error detection' },
            { label: '1 · Physical', sub: 'bits, signals, media' },
          ],
        },
        {
          title: 'Examples',
          layers: [
            { label: 'HTTP · DNS · SMTP · SSH' },
            { label: 'ASCII · JPEG · MPEG' },
            { label: 'NetBIOS · RPC' },
            { label: 'TCP · UDP' },
            { label: 'IPv4 · IPv6 · ICMP' },
            { label: 'Ethernet · 802.11 · PPP' },
            { label: 'UTP · fiber · RJ-45' },
          ],
        },
      ],
    },
    caption: 'Upper layers (7–5) handle application data; lower layers (4–1) move it.',
    notes:
      "Read the model from the top. **Layer 7, Application**, is where network-aware software meets the network — it is the *protocol* (HTTP, DNS, SMTP), not the browser or mail program itself. **Layer 6, Presentation**, makes sure both sides understand the data's format: character encoding, image and video formats, compression and encryption. **Layer 5, Session**, sets up, manages and tears down the dialog between two applications. **Layer 4, Transport**, delivers data between applications using port numbers and, with TCP, adds reliability and flow control. **Layer 3, Network**, provides logical (IP) addressing and routing so packets can cross many networks. **Layer 2, Data Link**, moves frames across one link using MAC addresses and detects corrupted frames with the FCS. **Layer 1, Physical**, turns bits into electrical, optical or radio signals and defines cables, connectors and pinouts. The exam tests Layers 1–4 and the Application layer constantly; Presentation and Session mostly appear as 'which layer does this job' recall questions.",
  },
  {
    kind: 'table',
    title: 'OSI layers at a glance',
    columns: ['Layer', 'PDU', 'Identifier', 'Typical devices'],
    rows: [
      ['7 Application', 'Data', 'Hostnames, URLs', 'Hosts, servers (NGFWs inspect it)'],
      ['6 Presentation', 'Data', '—', 'Hosts'],
      ['5 Session', 'Data', '—', 'Hosts'],
      ['4 Transport', '**Segment** (TCP) / datagram (UDP)', 'Port number (16 bits)', 'Stateful firewalls, load balancers'],
      ['3 Network', '**Packet**', 'IP address (32 or 128 bits)', 'Routers, multilayer switches'],
      ['2 Data Link', '**Frame**', 'MAC address (48 bits)', 'Switches, bridges, APs, NICs'],
      ['1 Physical', '**Bits**', 'None — pins and signals', 'Hubs, repeaters, cables, transceivers'],
    ],
    notes:
      "This table is the one to memorize. Every layer has a **PDU** name (protocol data unit): Layers 7 to 5 simply call it data; Layer 4 calls it a **segment** for TCP (UDP's unit is usually called a **datagram**); Layer 3 a **packet**; Layer 2 a **frame**; Layer 1 **bits**. Each of the middle layers also has its own identifier: 16-bit **port numbers** at Layer 4, 32-bit IPv4 or 128-bit IPv6 **addresses** at Layer 3, and 48-bit **MAC addresses** at Layer 2. Layer 1 has no addresses at all — it only cares about signals, pins and media. The device column tells you the highest layer a device *normally* uses to make its forwarding decision. Keep in mind that devices can work at more than one layer: a router also has Layer 1 and 2 interfaces, and a next-generation firewall looks all the way into Layer 7. When a question describes an identifier ('uses a 48-bit hardware address'), map it straight to the layer.",
  },
  {
    kind: 'diagram',
    title: 'OSI vs TCP/IP: original and updated',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'OSI',
          layers: [
            { label: 'Application', sub: 'L7' },
            { label: 'Presentation', sub: 'L6' },
            { label: 'Session', sub: 'L5' },
            { label: 'Transport', sub: 'L4' },
            { label: 'Network', sub: 'L3' },
            { label: 'Data Link', sub: 'L2' },
            { label: 'Physical', sub: 'L1' },
          ],
        },
        {
          title: 'TCP/IP original (RFC 1122)',
          layers: [
            { label: 'Application', sub: 'HTTP, DNS, SMTP…', span: 3 },
            { label: 'Transport', sub: 'TCP, UDP' },
            { label: 'Internet', sub: 'IPv4, IPv6', tone: 'accent' },
            { label: 'Link', sub: 'a.k.a. Network Access', span: 2 },
          ],
        },
        {
          title: 'TCP/IP updated (5-layer)',
          layers: [
            { label: 'Application', span: 3 },
            { label: 'Transport' },
            { label: 'Network' },
            { label: 'Data Link' },
            { label: 'Physical' },
          ],
        },
      ],
    },
    caption: 'TCP/IP Application spans OSI 5–7; the original Link layer spans OSI 1–2.',
    notes:
      "Line the models up and the mapping is easy. The TCP/IP **Application** layer does the work of OSI Layers 5, 6 and 7 — TCP/IP never separated session and presentation functions; each application protocol handles them itself. **Transport** maps one-to-one (TCP and UDP). The original model's **Internet** layer is OSI Layer 3, where IP lives. The original **Link** layer (also called **Network Access** or Network Interface) covers both OSI Layers 1 and 2. Cisco's certification guides mostly use the *updated* five-layer TCP/IP model, which splits Link into **Data Link** and **Physical** and renames Internet to **Network**, so its numbering matches OSI Layers 1–4 exactly. Expect questions such as 'Which TCP/IP layer corresponds to OSI Layer 3?' (Internet, or Network in the updated model) or 'Which OSI layers map to the TCP/IP Application layer?' (5–7). A common trap is choosing 'Network Access' for Layer 3 just because the word 'network' appears in it.",
  },
  {
    kind: 'bullets',
    title: 'TCP/IP: the model the Internet runs',
    bullets: [
      'Defined by the **IETF** in RFCs (RFC 1122); OSI was published by **ISO**',
      'Original: Application · Transport · **Internet** · **Link**',
      'Updated: Link split into **Data Link** + **Physical** (5 layers)',
      'TCP/IP Application = OSI **5 + 6 + 7**',
      'Link layer is also called **Network Access** or Network Interface',
      "Engineers still say 'Layer 3' for IP — OSI numbers are the lingua franca",
    ],
    notes:
      "The TCP/IP model describes the protocol suite that actually carries Internet traffic, and its standards are published as **RFCs** (Requests for Comments) by the **IETF**. RFC 1122 describes four layers — application, transport, internet and link. Because 'link' hides two very different jobs (framing and signaling), most modern texts, including Cisco's, teach an updated five-layer view: Application, Transport, Network, Data Link and Physical. The five-layer view is convenient because its numbers match OSI: Layer 3 is IP in both, Layer 2 is Ethernet in both. The OSI protocol suite itself never won in the marketplace, yet OSI's *vocabulary* stuck — engineers say 'Layer 2 switch' and 'Layer 4 port number' every day. So on the exam, answer layer-number questions with OSI numbering, but be ready to name the TCP/IP layers too, especially **Internet** for Layer 3 and **Link/Network Access** for Layers 1–2.",
  },
  {
    kind: 'compare',
    title: 'OSI vs TCP/IP in one view',
    left: {
      heading: 'OSI model',
      bullets: [
        '7 layers, published by **ISO**',
        'A reference model: vocabulary and teaching',
        'Separate Session and Presentation layers',
        'Its own protocol suite never caught on',
      ],
    },
    right: {
      heading: 'TCP/IP model',
      tone: 'accent',
      bullets: [
        '4 layers (original) or 5 (updated), **IETF** RFCs',
        'The protocols the Internet actually runs',
        'Application layer covers OSI 5–7',
        'Link / Network Access covers OSI 1–2',
      ],
    },
    notes:
      "Think of OSI as the **dictionary** and TCP/IP as the **language people actually speak**. OSI is a seven-layer reference model from the International Organization for Standardization; its detailed functions are the best way to describe *what* has to happen, which is why troubleshooting and certification material still uses its layer numbers. TCP/IP is the working protocol suite — IPv4, IPv6, TCP, UDP, HTTP, DNS and friends — documented in IETF RFCs. The two differ mainly at the top and bottom: TCP/IP folds OSI's Application, Presentation and Session layers into one Application layer, and (in its original form) folds Data Link and Physical into one Link layer. Exam questions typically ask you to identify the standards body (ISO versus IETF), to count layers (7 versus 4 or 5), or to map a layer across models. None of them expects you to know OSI's own historical protocols.",
  },
  {
    kind: 'diagram',
    title: 'Encapsulation and PDU names',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Layer',
          layers: [
            { label: 'Application' },
            { label: 'Transport' },
            { label: 'Network' },
            { label: 'Data Link' },
            { label: 'Physical' },
          ],
        },
        {
          title: 'What is added',
          layers: [
            { label: 'Application data', tone: 'muted' },
            { label: 'TCP or UDP header' },
            { label: 'IP header' },
            { label: 'Ethernet header + FCS trailer' },
            { label: 'Encoded as signals', tone: 'muted' },
          ],
        },
        {
          title: 'PDU',
          layers: [
            { label: 'Data' },
            { label: 'Segment', sub: 'UDP: datagram' },
            { label: 'Packet' },
            { label: 'Frame', tone: 'accent' },
            { label: 'Bits' },
          ],
        },
      ],
    },
    caption: "Top-down PDU order: Data, Segment, Packet, Frame, Bits — 'Do Some People Fear Birthdays'.",
    notes:
      "Encapsulation is the heart of this lesson. When an application sends data, each layer on the way down wraps what it received from above in its own **header**. The transport layer adds a TCP or UDP header — now the unit is a **segment** (UDP's is usually called a **datagram**). The network layer adds an IP header, producing a **packet**. The data link layer adds an Ethernet header *and* a trailer, the FCS, producing a **frame**. Finally the physical layer transmits the frame as **bits**. The generic term for any of these units is **PDU** (protocol data unit), and Cisco material sometimes writes L4PDU, L3PDU and L2PDU for segment, packet and frame. The mnemonic 'Do Some People Fear Birthdays' gives the order top-down. The exam loves to ask for the PDU at a given layer, or to describe a unit ('contains source and destination MAC addresses and an FCS') and ask what it is called — that description is a **frame**.",
  },
  {
    kind: 'steps',
    title: 'Encapsulation step by step',
    steps: [
      { title: 'Application creates data', text: 'A browser builds an HTTP request: `GET /index.html`' },
      { title: 'Transport adds a TCP header', text: 'Source port 51544, destination port 80, sequence numbers → **segment**' },
      { title: 'Network adds an IPv4 header', text: 'Source and destination IP, TTL, Protocol = 6 → **packet**' },
      { title: 'Data link adds header and trailer', text: 'Destination and source MAC, EtherType, FCS → **frame**' },
      { title: 'Physical sends bits', text: 'Voltage, light or radio signals on the medium' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'd', label: 'Data', shape: 'pill' },
        { id: 's', label: 'Segment', sub: 'L4' },
        { id: 'p', label: 'Packet', sub: 'L3' },
        { id: 'f', label: 'Frame', sub: 'L2', tone: 'accent' },
        { id: 'b', label: 'Bits', sub: 'L1', shape: 'pill' },
      ],
    },
    notes:
      "Walk one web request down the stack. The browser's HTTP software produces the request. TCP adds a header containing a **source port** (a random high number chosen by the client) and **destination port 80**, plus sequence and acknowledgment numbers for reliability — that is a segment. IP adds a header with the client's and server's IP addresses, a TTL and a Protocol value of 6 (meaning 'TCP is inside') — that is a packet. Ethernet adds destination and source MAC addresses and an EtherType of 0x0800 (meaning 'IPv4 is inside') in front, and the FCS behind — that is a frame. The NIC then signals the bits onto the cable. The receiver runs the process in reverse, which is **de-encapsulation**: it checks the FCS and destination MAC, strips the frame, checks the destination IP, strips the IP header, uses the port to find the right application and hands over the original data. Each header is read only by the matching layer on the other side.",
  },
  {
    kind: 'diagram',
    title: 'The frame that goes on the wire',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Dst MAC', size: 6, sub: 'L2 header' },
        { label: 'Src MAC', size: 6, sub: 'L2 header' },
        { label: 'Type', size: 2, sub: '0x0800' },
        { label: 'IPv4 header', size: 20, sub: 'L3' },
        { label: 'TCP header', size: 20, sub: 'L4' },
        { label: 'Data', size: 1460, sub: 'up to 1460 B', tone: 'muted' },
        { label: 'FCS', size: 4, sub: 'L2 trailer', tone: 'accent' },
      ],
      caption: 'Everything between the Ethernet header and the FCS is the IP packet (max 1500 bytes).',
    },
    notes:
      "Here is a complete Ethernet II frame carrying a TCP segment, drawn to show where each layer's contribution sits. The 14-byte Ethernet header (destination MAC, source MAC, EtherType) comes first; the IPv4 header (20 bytes without options) and the TCP header (20 bytes without options) follow; then the application data; and finally the 4-byte **FCS** (Frame Check Sequence) trailer. Only the data link layer adds a trailer. The FCS is a CRC value the sender calculates over the frame; the receiver recalculates it and, if the values differ, silently **discards** the frame and counts a CRC error. Ethernet never repairs or retransmits — if the data mattered, TCP notices the gap and retransmits it. Sizes worth knowing: the standard Ethernet payload (the IP packet) is at most **1500 bytes** (the MTU), leaving 1460 bytes for TCP data when there are no options; a full frame from destination MAC through FCS is at most 1518 bytes (1522 with an 802.1Q tag). The 8-byte preamble and SFD sent before the frame are physical-layer signaling and are not counted in the frame size.",
  },
  {
    kind: 'diagram',
    title: 'How the receiver knows what is inside',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'f', label: 'Frame', sub: 'EtherType 0x0800 → IPv4' },
        { id: 'p', label: 'Packet', sub: 'Protocol 6 → TCP' },
        { id: 's', label: 'Segment', sub: 'Dst port 80 → web server' },
        { id: 'a', label: 'Application', sub: 'HTTP process', shape: 'round', tone: 'accent' },
      ],
    },
    caption: "Every header carries a 'next protocol' pointer that drives de-encapsulation.",
    notes:
      "De-encapsulation works because every header points to the next one. In an Ethernet II frame, the **EtherType** field identifies the payload: 0x0800 for IPv4, 0x86DD for IPv6, 0x0806 for ARP. In the IPv4 header, the **Protocol** field identifies what the packet carries: 6 for TCP, 17 for UDP, 1 for ICMP, 89 for OSPF. In the TCP or UDP header, the **destination port** identifies the receiving application — 80 for HTTP, 443 for HTTPS, 53 for DNS. Each layer reads its own pointer, strips its header and hands the rest to the right upper-layer process. This is also how one host runs many network applications at once: port numbers let the transport layer **demultiplex** incoming segments to the correct process. You will meet these values again and again — EtherTypes in the switching lessons, protocol numbers in ACLs, and port numbers in the TCP vs UDP lesson that closes this module.",
  },
  {
    kind: 'bullets',
    title: 'Same-layer and adjacent-layer interaction',
    bullets: [
      '**Same-layer**: layer N on one host works with layer N on the *other* host',
      'Peers communicate through **header fields** — e.g. TCP sequence and ACK numbers',
      '**Adjacent-layer**: layer N serves layer N+1 on the *same* host',
      'Example: IP delivers segments for TCP; TCP gives HTTP reliable delivery',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a7', label: 'HTTP', sub: 'Host A · L7', x: 2, y: 0.9 },
        { id: 'a4', label: 'TCP', sub: 'Host A · L4', x: 2, y: 2.5 },
        { id: 'a3', label: 'IP', sub: 'Host A · L3', x: 2, y: 4.1 },
        { id: 'b7', label: 'HTTP', sub: 'Host B · L7', x: 8, y: 0.9 },
        { id: 'b4', label: 'TCP', sub: 'Host B · L4', x: 8, y: 2.5, tone: 'accent' },
        { id: 'b3', label: 'IP', sub: 'Host B · L3', x: 8, y: 4.1 },
      ],
      edges: [
        { from: 'a7', to: 'a4', label: 'adjacent' },
        { from: 'a4', to: 'a3', label: 'adjacent' },
        { from: 'b3', to: 'b4' },
        { from: 'b4', to: 'b7' },
        { from: 'a7', to: 'b7', label: 'same layer', dashed: true },
        { from: 'a4', to: 'b4', label: 'same layer: seq / ACK', dashed: true, tone: 'accent' },
        { from: 'a3', to: 'b3', label: 'same layer', dashed: true },
      ],
    },
    notes:
      "Two kinds of interaction make the stack work. **Same-layer interaction** happens between the *same* layer on *different* computers: the sender's TCP puts a sequence number in its header, and the receiver's TCP answers with an acknowledgment number in its own header. Neither application ever sees these fields — the two TCP processes are having their own conversation through the headers, which is exactly why each layer needs a header. **Adjacent-layer interaction** happens *inside one computer* between neighboring layers: the application relies on TCP to deliver bytes reliably, and TCP relies on IP to get each segment to the other host. The lower layer provides a service; the upper layer consumes it. On exam questions, the key phrase is 'same host' versus 'other host'. 'The web server's TCP acknowledges data sent by the client's TCP' is same-layer. 'IP on the client carries the segment that TCP handed it' is adjacent-layer.",
  },
  {
    kind: 'diagram',
    title: 'How far up the stack each device looks',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'PC-A',
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
          title: 'Switch',
          layers: [
            { label: 'not examined', span: 5, tone: 'muted' },
            { label: 'Data Link', sub: 'reads MACs', tone: 'accent' },
            { label: 'Physical' },
          ],
        },
        {
          title: 'Router',
          layers: [
            { label: 'not examined', span: 4, tone: 'muted' },
            { label: 'Network', sub: 'reads IPs', tone: 'accent' },
            { label: 'Data Link', sub: 'builds a new frame' },
            { label: 'Physical' },
          ],
        },
        {
          title: 'Server',
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
      ],
    },
    caption: 'Switches read up to Layer 2, routers up to Layer 3; end hosts use every layer.',
    notes:
      "Follow a packet from PC-A to a server through one switch and one router. PC-A builds the whole stack. The **switch** receives the bits, reads the **Ethernet header** — learning the source MAC and looking up the destination MAC in its table — and forwards the frame unchanged; it never looks at the IP header. The **router** de-encapsulates up to **Layer 3**: it checks the FCS, discards the old frame, looks up the destination IP in its routing table, decrements the TTL, and then builds a brand-new frame with new source and destination MAC addresses for the next link. The server de-encapsulates all the way to the application. A **hub** would sit below even the switch — it only regenerates bits at Layer 1. This picture explains a favorite exam fact: MAC addresses change at every router hop, but the source and destination IP addresses stay the same end to end (unless NAT is in the path).",
  },
  {
    kind: 'table',
    title: 'Devices and the layers they work at',
    columns: ['Device', 'Layer', 'Decides using', 'Key fact'],
    rows: [
      ['Hub / repeater', 'L1', 'Nothing — repeats bits out all other ports', 'One shared collision domain'],
      ['Switch / bridge', 'L2', 'Destination **MAC** address', 'Each port is its own collision domain'],
      ['Wireless AP', 'L2', 'MAC — bridges 802.11 and Ethernet', 'Shared, half-duplex radio medium'],
      ['Router', 'L3', 'Destination **IP** address', 'Each interface is its own broadcast domain'],
      ['Multilayer switch', 'L2 + L3', 'MAC within a VLAN, IP between VLANs', 'Routes in hardware (SVIs)'],
      ['Stateful firewall', 'L3–L4', 'IPs, ports and session state', 'Permits return traffic automatically'],
      ['NGFW / NGIPS', 'L3–L7', 'Applications, URLs, threat signatures', 'Application-aware policy'],
    ],
    notes:
      "Associate each device with the **highest layer it uses to make its decision**. A **hub** (or repeater) is pure Layer 1: it regenerates the electrical signal out every other port with no idea what a frame is. A **switch** (a multiport bridge) is Layer 2: it forwards frames by destination MAC address. An **access point** is also Layer 2 — it bridges frames between the 802.11 radio side and the Ethernet side. A **router** is Layer 3: it forwards packets by destination IP address. A **multilayer (Layer 3) switch** does both: switching inside a VLAN and routing between VLANs in hardware. A traditional **stateful firewall** filters on Layer 3 and 4 information — addresses, protocols, ports — and tracks sessions. A **next-generation firewall** or **NGIPS** inspects up to Layer 7, identifying applications and malicious content regardless of port. The next lesson covers every one of these devices in depth; for now, lock in the layer numbers: hub 1, switch 2, router 3.",
  },
  {
    kind: 'table',
    title: 'Addresses and protocols by layer',
    columns: ['Layer', 'Identifier', 'Size', 'Protocols you will meet'],
    rows: [
      ['7 Application', 'Hostnames, URLs', 'varies', 'HTTP/HTTPS, DNS, DHCP, SMTP, SSH, SNMP'],
      ['4 Transport', '**Port** number', '16 bits', 'TCP, UDP'],
      ['3 Network', '**IP** address', '32 bits (IPv4) / 128 bits (IPv6)', 'IPv4, IPv6, ICMP, OSPF'],
      ['2 Data Link', '**MAC** address', '48 bits', 'Ethernet, 802.11, PPP, HDLC, STP, CDP/LLDP'],
      ['1 Physical', 'None — pins and signals', '—', 'UTP and fiber media, RJ-45, 1000BASE-T signaling'],
    ],
    notes:
      "This is the cheat sheet behind many 'which layer' questions: ==MAC = Layer 2, IP = Layer 3, port = Layer 4==. A few protocols deserve a note. **ICMP** (used by ping) is carried inside IP packets but is a Network-layer protocol. **OSPF** runs directly over IP as protocol 89 and is usually classed at Layer 3. **DHCP** and **DNS** help configure and use the network, but they are Application-layer protocols carried by UDP (and TCP for some DNS traffic). **STP**, **CDP** and **LLDP** are Layer 2 protocols that never leave the local link. **ARP** is the odd one out: it resolves a Layer 3 address to a Layer 2 address and is carried directly in Ethernet frames, so it is often described as working between Layers 2 and 3. If a question names ARP, look for answers that mention Ethernet frames and MAC resolution rather than routing.",
  },
  {
    kind: 'diagram',
    title: 'Layers make troubleshooting systematic',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'l1', label: 'L1 Physical', sub: 'link light, cable, SFP', shape: 'pill' },
        { id: 'l2', label: 'L2 Data Link', sub: 'MAC, VLAN, duplex' },
        { id: 'l3', label: 'L3 Network', sub: 'IP, mask, gateway, route', tone: 'accent' },
        { id: 'l4', label: 'L4 Transport', sub: 'ports, ACLs' },
        { id: 'l7', label: 'L7 Application', sub: 'DNS, service running?', shape: 'pill' },
      ],
    },
    caption: 'Bottom-up: prove each layer before moving to the next.',
    notes:
      "Layered models are not just theory — they give you a troubleshooting plan. In a **bottom-up** approach you start at Layer 1 (is the link light on, is the cable good, is the SFP seated?), then Layer 2 (right VLAN, MAC learned, duplex matching?), then Layer 3 (correct IP, mask, default gateway, routes?), then Layer 4 (is the port open, is an ACL or firewall blocking it?), and finally the application itself. A **top-down** approach starts at the application and works down. **Divide and conquer** often starts in the middle with a ping: if a ping to the server succeeds, Layers 1–3 are working end to end, so you jump straight to Layer 4 and above. Exam scenarios lean on this logic: 'the user can ping the server by IP address but cannot open the web page' tells you the problem is at Layer 4 or higher, not in the cabling or the IP addressing. The final lesson of the course expands these methods.",
  },
  {
    kind: 'definitions',
    title: 'Mnemonics that stick',
    terms: [
      { term: 'Please Do Not Throw Sausage Pizza Away', def: 'OSI Layers **1 → 7**: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      { term: 'All People Seem To Need Data Processing', def: 'OSI Layers **7 → 1**: Application, Presentation, Session, Transport, Network, Data Link, Physical.' },
      { term: 'Do Some People Fear Birthdays', def: 'PDUs top-down: **Data, Segment, Packet, Frame, Bits**.' },
      { term: '2-3-4 = MAC-IP-port', def: 'MAC address = Layer 2, IP address = Layer 3, port number = Layer 4.' },
      { term: 'Hub 1, switch 2, router 3', def: 'The highest layer each classic device uses to forward traffic.' },
    ],
    notes:
      "Mnemonics are worth the small effort because the exam asks layer questions under time pressure. Pick one direction for the OSI stack and stick with it: 'Please Do Not Throw Sausage Pizza Away' climbs from Layer 1, while 'All People Seem To Need Data Processing' descends from Layer 7 — they are the same list in opposite orders. For PDUs, 'Do Some People Fear Birthdays' walks down the stack: data, segment, packet, frame, bits. Then attach the anchors that answer most questions instantly: **MAC = 2, IP = 3, port = 4**, and **hub 1, switch 2, router 3**. When a question describes a job instead of naming a layer, translate the job first: 'path selection' means Layer 3; 'reliable delivery and flow control' means Layer 4; 'error detection with a trailer' means Layer 2; 'encryption and formatting' means Layer 6; 'dialog control' means Layer 5; 'voltage levels and pinouts' means Layer 1.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: models and layers',
    body: 'Match the **identifier** to the layer — MAC = L2, IP = L3, port = L4 — and remember that only Layer 2 adds a **trailer** (the FCS).',
    bullets: [
      'TCP/IP Application covers OSI 5–7; original Link covers OSI 1–2',
      'PDU order: data → segment → packet → frame → bits',
      'Routers build a **new frame** each hop; IP addresses stay the same (no NAT)',
      'Hub = L1, switch = L2, router and multilayer switch = L3',
      "The 'Application layer' is protocols like HTTP, not the browser itself",
      'The FCS detects errors — it never corrects or retransmits',
    ],
    notes:
      "These are the traps that catch people who half-learned the models. Questions often describe a feature and hide the layer: 'uses 48-bit addresses' is Layer 2; 'uses 16-bit numbers to identify applications' is Layer 4. A question about the TCP/IP model will try to make you pick 'Network Access' for Layer 3 — the right answer is **Internet** (or Network in the five-layer model). When a packet crosses routers, the **frame** is rebuilt at every hop with new MAC addresses, while the IP addresses do not change unless NAT is involved. A multilayer switch is a Layer 3 device even though it is called a switch. The Application layer is a set of protocols — the browser is an application that *uses* the Application layer. And the FCS is only an error-*detection* mechanism: a bad frame is dropped, and recovery (if any) is TCP's job, not Ethernet's.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'OSI: 7 layers from **ISO**; TCP/IP: 4 or 5 layers from the **IETF**',
      'Encapsulation adds headers going down; de-encapsulation strips them going up',
      'PDUs: **segment** (L4), **packet** (L3), **frame** (L2), **bits** (L1)',
      'Same-layer = peers via headers; adjacent-layer = service to the layer above',
      'Hub L1, switch L2, router L3, NGFW up to L7',
      '==MAC = L2, IP = L3, port = L4==',
    ],
    notes:
      "Let us recap. Layered models divide networking into separate jobs so that technologies can evolve independently, vendors can interoperate and engineers can troubleshoot methodically. OSI has seven layers — Physical, Data Link, Network, Transport, Session, Presentation, Application — and TCP/IP has four (Link, Internet, Transport, Application) or five in the updated form that matches OSI's lower numbering. Sending hosts encapsulate: data becomes a segment, then a packet, then a frame, then bits; receivers reverse the process, each layer reading only its own header and following the 'next protocol' pointers (EtherType, IP Protocol, port). Same-layer interaction is between peers on different hosts; adjacent-layer interaction is between neighboring layers on one host. Devices map to layers by the address they use to forward. Before you move on, make sure you can draw both models side by side from memory and name the PDU at each layer — the next lessons build on this constantly.",
  },
];
