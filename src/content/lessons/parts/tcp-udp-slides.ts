import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'TCP vs UDP',
    subtitle: 'Ports, sockets, reliability and speed at the transport layer',
    notes:
      "Every application on a network rides on one of two transport protocols. **TCP** gives applications a reliable, ordered byte stream at the cost of setup time and header overhead; **UDP** simply delivers datagrams as fast as possible and leaves reliability to the application, if it wants any. The CCNA blueprint (topic 1.5 in v1.1, and domain 1 in v2.0) expects you to compare the two in detail: how port numbers let many conversations share one address, how TCP opens and closes connections, how sequence numbers, acknowledgments and windowing provide reliability and flow control, what the two headers look like, and which well-known ports belong to which applications. Port numbers come up everywhere else in the course, because ACLs, NAT, firewalls, QoS and device management all match on them. This deck builds each idea with sequence diagrams and header layouts, then finishes with the port reference you must know cold and the traps Cisco likes to set.",
  },
  {
    kind: 'bullets',
    title: 'What the transport layer does',
    bullets: [
      '**Multiplexing**: port numbers keep conversations apart',
      '**Segmentation**: splits application data to fit the path',
      '**Connection management**: TCP opens and closes sessions',
      '**Reliability**: TCP acknowledges and retransmits',
      '**Flow control**: TCP windowing protects the receiver',
      'UDP adds only ports, a length and a checksum',
    ],
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'OSI',
          layers: [
            { label: 'Application' },
            { label: 'Presentation' },
            { label: 'Session' },
            { label: 'Transport', sub: 'Layer 4', tone: 'accent' },
            { label: 'Network' },
            { label: 'Data Link' },
            { label: 'Physical' },
          ],
        },
        {
          title: 'TCP/IP',
          layers: [
            { label: 'Application', sub: 'HTTP, DNS, SSH...', span: 3 },
            { label: 'Transport', sub: 'TCP segment · UDP datagram', tone: 'accent' },
            { label: 'Internet', sub: 'IP packet' },
            { label: 'Network Access', sub: 'frames and bits', span: 2 },
          ],
        },
      ],
    },
    notes:
      "The transport layer (Layer 4) sits between the applications and IP. IP delivers packets from host to host; the transport layer delivers data from **application to application**. Its most basic job is **multiplexing**: a PC may run a browser, an email client and an SSH session at once, and port numbers keep their data apart. It also **segments** a large application message into pieces that fit the path, and on the receiving side hands each piece to the correct application. TCP adds much more: it opens and closes connections, numbers every byte, acknowledges what arrived, retransmits what did not, and uses a window to stop a fast sender from overrunning a slow receiver. UDP deliberately does almost none of that. Learn the PDU names: a TCP unit is a **segment** and a UDP unit is usually called a **datagram**, and both ride inside an IP packet whose Protocol field says 6 for TCP or 17 for UDP. In the TCP/IP model, OSI Layers 5 to 7 collapse into a single application layer, while the transport layer keeps its own identity in both models.",
  },
  {
    kind: 'diagram',
    title: 'Multiplexing with port numbers',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.10.25', x: 1.2, y: 2.5, tone: 'accent' },
        { id: 'web', icon: 'server', label: 'Web server', sub: '10.2.20.80', x: 8.6, y: 1 },
        { id: 'dns', icon: 'server', label: 'DNS server', sub: '10.1.99.53', x: 8.6, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: '10.1.10.1', x: 8.6, y: 4 },
      ],
      links: [
        { from: 'pc', to: 'web', label: 'TCP 50512 → 443', style: 'dashed', arrow: 'forward' },
        { from: 'pc', to: 'dns', label: 'UDP 61000 → 53', style: 'dashed', arrow: 'forward' },
        { from: 'pc', to: 'r1', label: 'TCP 50600 → 22', style: 'dashed', arrow: 'forward' },
      ],
    },
    caption: 'One IP address, many conversations: the destination port picks the service, the source port picks the conversation.',
    bullets: [
      'Server side: a well-known port identifies the service',
      'Client side: a random ephemeral source port per session',
    ],
    notes:
      "Picture PC1 doing three things at once: loading a web page, resolving a name and managing R1 over SSH. All three conversations leave the same NIC with the same source IP address, so IP alone cannot tell them apart. The transport header can. Each server application **listens** on a well-known port (443 for HTTPS, 53 for DNS, 22 for SSH), so the **destination port** tells the receiving host which application gets the data. The client picks a random, unused **ephemeral** source port for each conversation, so when replies come back PC1 knows which application instance each one belongs to. Sending this way is multiplexing, and sorting the replies on arrival is demultiplexing. Notice that the DNS lookup uses UDP while the web and SSH sessions use TCP. TCP port 53 and UDP port 53 are separate ports, because each protocol has its own number space of 65,536 ports. On the exam, port questions often hide inside other topics: an extended ACL such as `permit tcp any host 10.2.20.80 eq 443` only works if you know which protocol and port the application uses.",
  },
  {
    kind: 'table',
    title: 'Sockets identify every conversation',
    columns: ['Client socket', 'Server socket', 'Protocol', 'Application'],
    rows: [
      ['10.1.10.25:50512', '10.2.20.80:443', 'TCP', 'HTTPS, browser tab 1'],
      ['10.1.10.25:50513', '10.2.20.80:443', 'TCP', 'HTTPS, browser tab 2'],
      ['10.1.10.25:61000', '10.1.99.53:53', 'UDP', 'DNS query'],
      ['10.1.10.25:50600', '10.1.10.1:22', 'TCP', 'SSH session to R1'],
      ['10.1.10.26:50512', '10.2.20.80:443', 'TCP', 'Another PC, same ports: still unique'],
    ],
    caption: 'A connection is identified by protocol, source IP and port, and destination IP and port (the 5-tuple).',
    notes:
      "A **socket** is the combination of an IP address, a transport protocol and a port, written like 10.1.10.25:50512. A TCP connection is uniquely identified by the pair of sockets at its two ends, often described as the **5-tuple**: protocol, source IP, source port, destination IP and destination port. Look at the first two rows. Both browser tabs talk to the same server socket, 10.2.20.80:443, but they use different client ports, so they are two independent connections with their own sequence numbers and windows. The last row shows that another PC may even choose the same source port, 50512, without any conflict, because its source IP differs and the 5-tuple is still unique. Servers depend on this: one web server listening on port 443 can serve thousands of clients at the same time. When a reply returns, the ports are simply swapped, so the server sends from 443 to 50512. Remember this swap for ACL and firewall questions: a filter applied to return traffic must match **source** port 443, not destination port 443.",
  },
  {
    kind: 'table',
    title: 'Port number ranges',
    columns: ['Range', 'Name', 'Used for'],
    rows: [
      ['0–1023', '**Well-known** (system)', 'Standard server services such as 22, 53, 80 and 443'],
      ['1024–49151', '**Registered** (user)', 'Applications registered with IANA, e.g. TCP 3389 for RDP'],
      ['49152–65535', '**Dynamic** / private / ephemeral', 'Temporary client source ports'],
    ],
    caption: 'Ports are 16-bit values, 0 to 65,535, counted separately for TCP and for UDP.',
    notes:
      "Port numbers are 16-bit fields, so each transport protocol has 65,536 ports, numbered 0 through 65,535. IANA divides them into three ranges, and the boundaries are classic exam material. **Well-known** ports, **0 to 1023**, belong to standard services such as SSH, DNS, HTTP and HTTPS; on Linux and macOS only privileged processes may listen on them. **Registered** ports, **1024 to 49151**, are assigned to specific applications on request, for example RDP on TCP 3389. **Dynamic** ports, also called private or ephemeral ports, **49152 to 65535**, are never assigned to services: clients grab them temporarily as source ports for outgoing connections and release them when the session ends. Real operating systems do not always follow the IANA suggestion. Windows uses 49152 to 65535 by default, while Linux defaults to 32768 to 60999. If an exam question asks for the range IANA defines for ephemeral ports, answer 49152 to 65535. Remember also that TCP 53 and UDP 53 are different ports that happen to share a number, and a service may register both.",
  },
  {
    kind: 'compare',
    title: 'TCP vs UDP at a glance',
    left: {
      heading: 'TCP: reliable',
      bullets: [
        'Connection-oriented: three-way handshake',
        'Sequence numbers and acknowledgments',
        'Retransmits lost data, delivers in order',
        'Flow control with sliding windows',
        'Header of 20 to 60 bytes',
        'Web, email, file transfer, SSH',
      ],
    },
    right: {
      heading: 'UDP: fast',
      tone: 'accent',
      bullets: [
        'Connectionless: just send',
        'No sequencing, no acknowledgments',
        'No retransmission: loss is the application\'s problem',
        'No flow control',
        'Fixed 8-byte header',
        'Voice, video, DNS, DHCP, TFTP, SNMP, syslog',
      ],
    },
    notes:
      "This comparison is the heart of the topic. **TCP** is connection-oriented: before any data flows, the two ends agree to talk with a handshake and synchronize sequence numbers. After that every byte is numbered and acknowledged, lost data is retransmitted, data reaches the application in order, and the receiver controls the pace with its window. All of that needs state on both hosts and a header of at least 20 bytes. **UDP** is connectionless: a host just sends a datagram to a port, with no setup, no acknowledgments, no ordering and no flow control, using an 8-byte header. That sounds worse, but it is exactly right for some traffic. Real-time voice and video would rather drop a late packet than wait for a retransmission, and short request-and-response protocols such as DNS, DHCP, SNMP and NTP gain nothing from a handshake that would double their traffic. When those applications need some reliability, they build it themselves, for example by resending a query that gets no reply. The exam phrasing to remember: TCP is **reliable** and **connection-oriented**; UDP is **best effort** and **connectionless**.",
  },
  {
    kind: 'diagram',
    title: 'Opening a connection: the three-way handshake',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client 10.1.10.25:50512', icon: 'pc' },
        { id: 's', label: 'Server 10.2.20.80:443', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'SYN', sub: 'seq=1000 (client ISN), MSS 1460' },
        { from: 's', to: 'c', label: 'SYN-ACK', sub: 'seq=5000 (server ISN), ack=1001', tone: 'accent' },
        { from: 'c', to: 's', label: 'ACK', sub: 'seq=1001, ack=5001' },
        { note: 'ESTABLISHED: data can now flow in both directions', tone: 'good' },
      ],
    },
    caption: 'SYN and SYN-ACK each consume one sequence number, so each side acknowledges the other\'s ISN + 1.',
    notes:
      "TCP opens a connection with three segments. The client sends a **SYN** (synchronize) carrying its randomly chosen **initial sequence number** (ISN), here 1000, plus options such as the maximum segment size it can receive, typically 1460 bytes on Ethernet (a 1500-byte MTU minus 20 bytes of IP header and 20 bytes of TCP header). The server answers with a **SYN-ACK**: its own ISN, 5000, and an acknowledgment number of **1001**. The acknowledgment number always names the next byte the sender expects, and a SYN consumes one sequence number even though it carries no data. The client completes the handshake with an **ACK** of 5001. Both sides are now ESTABLISHED, have agreed on starting sequence numbers for both directions, and have learned each other's window size. If nothing listens on the server port, the server answers the SYN with an **RST** instead and the connection is refused. Exam questions often give one side's ISN and ask for the acknowledgment number in the next segment: just add one. They also ask which flags are set in the second segment: SYN and ACK together.",
  },
  {
    kind: 'diagram',
    title: 'Sequence and acknowledgment numbers',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'pc' },
        { id: 's', label: 'Server', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'seq=1001, 1000 bytes', sub: 'carries bytes 1001–2000' },
        { from: 'c', to: 's', label: 'seq=2001, 1000 bytes', sub: 'carries bytes 2001–3000' },
        { from: 's', to: 'c', label: 'ACK=3001', sub: 'everything up to 3000 received; send 3001 next', tone: 'accent' },
        { from: 'c', to: 's', label: 'seq=3001, 500 bytes', sub: 'carries bytes 3001–3500' },
        { from: 's', to: 'c', label: 'ACK=3501', tone: 'good' },
      ],
    },
    caption: 'The ACK names the next byte expected, and one ACK can cover several segments.',
    notes:
      "TCP numbers **bytes**, not segments. After the handshake, the client's first data byte is 1001, so a 1000-byte segment starting at sequence number 1001 carries bytes 1001 to 2000, and the next segment starts at 2001. The receiver answers with an **acknowledgment number** equal to the next byte it expects, so ACK 3001 means that everything up to byte 3000 arrived and byte 3001 should come next. Acknowledgments are **cumulative**: one ACK can confirm several segments, which saves bandwidth and is why the server did not have to acknowledge the first segment separately. Sequence numbers also let the receiver put segments back in order when they arrive out of order and discard duplicates. The arithmetic is simple and it is tested: the next sequence number equals the current sequence number plus the number of data bytes. So a segment with sequence number 3001 carrying 500 bytes is acknowledged with 3501. Each direction of a connection has its own independent numbering, so the server's data is counted from its own ISN of 5000, starting with byte 5001.",
  },
  {
    kind: 'diagram',
    title: 'Lost segment and retransmission',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'pc' },
        { id: 's', label: 'Server', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'seq=3501, 1000 bytes', sub: 'lost in transit', tone: 'bad', dashed: true },
        { from: 'c', to: 's', label: 'seq=4501, 1000 bytes', sub: 'arrives, leaving a gap' },
        { from: 's', to: 'c', label: 'ACK=3501 (duplicate)', sub: 'still waiting for byte 3501', tone: 'warn' },
        { note: 'Retransmission timer expires, or 3 duplicate ACKs trigger fast retransmit' },
        { from: 'c', to: 's', label: 'seq=3501, 1000 bytes', sub: 'retransmitted copy', tone: 'accent' },
        { from: 's', to: 'c', label: 'ACK=5501', sub: 'gap filled; both segments acknowledged', tone: 'good' },
      ],
    },
    caption: 'The sender keeps a copy of unacknowledged data and resends it when the ACK does not come.',
    notes:
      "Reliability comes from combining acknowledgments with a **retransmission timer**. The sender keeps a copy of every segment until it is acknowledged. Here the segment carrying bytes 3501 to 4500 is lost, but the next one, carrying 4501 to 5500, arrives. The receiver cannot acknowledge past the gap, so it repeats **ACK 3501**, a duplicate acknowledgment that says it is still waiting for byte 3501. The sender retransmits the missing segment either when its retransmission timer expires or, sooner, after three duplicate ACKs, which is called fast retransmit. Modern receivers keep the out-of-order data they already hold, so once the gap is filled a single **ACK 5501** confirms both segments. Repeated loss also makes TCP slow down, because loss usually signals congestion somewhere on the path. UDP has none of this machinery: a lost datagram is simply gone unless the application notices and asks again. That is why TFTP, which runs over UDP, acknowledges every block itself and resends a block when its own timer expires. For the exam, connect the words: acknowledgment plus retransmission equals **reliability**.",
  },
  {
    kind: 'diagram',
    title: 'Flow control: the sliding window',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Sender', icon: 'pc' },
        { id: 's', label: 'Receiver', icon: 'server' },
      ],
      steps: [
        { from: 's', to: 'c', label: 'ACK=1001, window=3000', sub: 'receiver can accept 3000 bytes' },
        { from: 'c', to: 's', label: 'seq=1001, 1000 bytes' },
        { from: 'c', to: 's', label: 'seq=2001, 1000 bytes' },
        { from: 'c', to: 's', label: 'seq=3001, 1000 bytes' },
        { note: 'Window full: the sender must wait for an ACK', tone: 'warn' },
        { from: 's', to: 'c', label: 'ACK=4001, window=6000', sub: 'window slides forward and grows', tone: 'accent' },
        { from: 'c', to: 's', label: 'Up to 6000 more bytes', sub: 'bytes 4001–10000 may be outstanding', tone: 'good' },
      ],
    },
    caption: 'The receiver advertises how much it can accept; the window slides forward with every ACK.',
    notes:
      "Waiting for an acknowledgment after every segment would waste the link, so TCP lets the sender transmit several segments before it must stop and wait. How much is controlled by the **window**. Every segment a receiver sends carries a Window value: the number of bytes it is currently willing to accept beyond the acknowledged point. Here the receiver advertises 3000 bytes, so the sender transmits three 1000-byte segments and then must wait. When ACK 4001 arrives with a window of 6000, the window **slides** forward to start at byte 4001 and also grows, so the sender may now have bytes 4001 to 10000 outstanding. If the receiving application falls behind, its buffer fills and it advertises a smaller window, even zero, and the sender pauses. That receiver-driven pacing is **flow control**. The sender also limits itself: it starts with a small amount of data in flight, ramps up while acknowledgments keep arriving, and cuts back sharply when loss signals congestion. The 16-bit Window field allows up to 65,535 bytes, and a window-scale option negotiated in the SYN segments multiplies it for fast links.",
  },
  {
    kind: 'diagram',
    title: 'Closing a connection: four-way termination',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'pc' },
        { id: 's', label: 'Server', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'FIN', sub: 'seq=7000: client has finished sending' },
        { from: 's', to: 'c', label: 'ACK', sub: 'ack=7001: half-closed, server may still send' },
        { from: 's', to: 'c', label: 'FIN', sub: 'seq=12000: server has finished too', tone: 'accent' },
        { from: 'c', to: 's', label: 'ACK', sub: 'ack=12001: connection closed', tone: 'good' },
        { note: 'Client holds TIME_WAIT before releasing the socket; an RST would abort at once' },
      ],
    },
    caption: 'Each direction closes separately, so a graceful close takes FIN, ACK, FIN, ACK.',
    notes:
      "A TCP connection is really two independent byte streams, so each side closes its own direction. The side that finishes first, here the client, sends a **FIN**. The server acknowledges it; like a SYN, a FIN consumes one sequence number, so the acknowledgment is 7001. At this point the connection is **half-closed**: the client will send no more data, but the server can keep sending until its application is done, and the client keeps receiving. The server then sends its own **FIN**, and the client's final **ACK** completes the four-way termination. In practice the server often combines its ACK and FIN into one segment when it has nothing left to send, so a capture may show only three segments. The side that closed first then waits in the **TIME_WAIT** state, which you can see in `netstat` output, so that delayed duplicates of old segments cannot confuse a new connection that reuses the same sockets. An **RST** (reset) is different: it aborts a connection immediately without the orderly exchange, and it is also the reply to a SYN sent to a port on which nothing is listening.",
  },
  {
    kind: 'diagram',
    title: 'The TCP header',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'Source Port', size: 16 },
        { label: 'Destination Port', size: 16 },
        { label: 'Sequence Number', size: 32, tone: 'accent' },
        { label: 'Acknowledgment Number', size: 32, tone: 'accent' },
        { label: 'Data Offset', size: 4 },
        { label: 'Reserved', size: 4, tone: 'muted' },
        { label: 'Flags', size: 8, sub: 'CWR ECE URG ACK PSH RST SYN FIN' },
        { label: 'Window', size: 16 },
        { label: 'Checksum', size: 16 },
        { label: 'Urgent Pointer', size: 16, tone: 'muted' },
        { label: 'Options + padding', size: 32, tone: 'muted', sub: '0–40 bytes, e.g. MSS, window scale' },
      ],
      caption: '20 bytes without options, up to 60 bytes with options.',
    },
    caption: 'Ports for multiplexing, sequence/ACK for reliability, window for flow control.',
    notes:
      "Every TCP feature you have seen has a field in this header. The **source and destination ports**, 16 bits each, provide multiplexing. The **sequence number** and **acknowledgment number**, 32 bits each, provide ordering and reliability. **Data offset** gives the header length in 32-bit words, which is needed because options make the header variable: 5 words means 20 bytes and the maximum of 15 words means 60 bytes. The **flags** (control bits) include **SYN**, **ACK**, **FIN** and **RST**, used to open, acknowledge, close and abort connections, plus **PSH**, **URG** and two congestion-notification bits. The **window**, 16 bits, carries the flow-control value. The **checksum** covers the header, the data and a pseudo-header containing the IP addresses, so corrupted segments are detected and discarded. The **urgent pointer** is rarely used today. **Options** carry the maximum segment size, the window-scale factor, selective acknowledgments and timestamps, mostly negotiated in the SYN segments. Compare this 20-byte minimum with UDP's 8 bytes on the next slide: those extra 12 bytes are the price of reliability.",
  },
  {
    kind: 'diagram',
    title: 'The UDP header',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'Source Port', size: 16 },
        { label: 'Destination Port', size: 16, tone: 'accent' },
        { label: 'Length', size: 16, sub: 'header + data, minimum 8' },
        { label: 'Checksum', size: 16, sub: 'optional in IPv4' },
      ],
      caption: 'Fixed 8-byte header.',
    },
    caption: 'Just ports, length and checksum: no sequence numbers, no acknowledgments, no window.',
    notes:
      "The UDP header is almost trivial, and that is its strength. It contains only four 16-bit fields. The **source port** lets the receiver reply; it may be zero when no reply is expected, although in practice clients fill it with an ephemeral port. The **destination port** selects the receiving application. The **length** field gives the size of the header plus the data in bytes, with a minimum of 8. The **checksum** detects corruption; it is optional over IPv4, where a value of zero means it was not computed, but mandatory for UDP over IPv6. Notice everything that is missing compared with TCP: no sequence or acknowledgment numbers, so no ordering and no retransmission; no window, so no flow control; no flags, so no connection setup or teardown. Every datagram stands alone. For a DNS lookup that means two small packets in total, instead of a three-way handshake, the query, the response and a four-way close. For voice it means a steady stream of small packets with minimal overhead and no stalls while waiting for retransmissions.",
  },
  {
    kind: 'table',
    title: 'TCP and UDP headers compared',
    columns: ['Feature or field', 'TCP', 'UDP'],
    rows: [
      ['Header size', '20–60 bytes', '8 bytes'],
      ['Source and destination ports', 'Yes (16 bits each)', 'Yes (16 bits each)'],
      ['Sequence and acknowledgment numbers', 'Yes', 'No'],
      ['Flags (SYN, ACK, FIN, RST...)', 'Yes', 'No'],
      ['Window (flow control)', 'Yes', 'No'],
      ['Length field', 'No (data offset gives header length)', 'Yes'],
      ['Checksum', 'Mandatory', 'Optional in IPv4, mandatory in IPv6'],
      ['IP protocol number', '**6**', '**17**'],
    ],
    notes:
      "Use this table to answer any question about which field belongs to which protocol. Both headers start with the same two fields, the 16-bit source and destination ports, which is why ACLs, NAT and firewalls can match ports for either protocol in the same way. Everything after that differs. TCP carries sequence and acknowledgment numbers, flags, a window and an urgent pointer, plus variable-length options, so its header is 20 to 60 bytes. UDP carries only a length and a checksum, for a fixed 8 bytes. Watch the subtle rows. TCP has **no length field**: a segment's size is derived from the IP packet length minus the IP and TCP headers, and TCP's data offset only says where the data begins. UDP's checksum may be zero over IPv4, but IPv6 requires it because IPv6 dropped the header checksum from the IP layer. Finally, the IP header announces which one follows: protocol number **6** means TCP and **17** means UDP, values you will also meet in packet captures and in the protocol field of extended ACL entries.",
  },
  {
    kind: 'bullets',
    title: 'UDP in action: when speed beats reliability',
    bullets: [
      '**VoIP and video**: RTP over UDP; late packets are useless',
      '**DNS** queries: one request, one reply',
      '**DHCP**: the client has no address yet and uses broadcasts',
      '**TFTP**: simple file transfer with its own ACKs',
      '**SNMP**, **syslog**, **NTP**: small, frequent messages',
      'Reliability, if needed, is added by the application',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 port 61000', icon: 'pc' },
        { id: 'dns', label: 'DNS server port 53', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'dns', label: 'Query: srv1.corp.example.com?', sub: 'UDP 61000 → 53' },
        { from: 'dns', to: 'pc', label: 'Response: 10.2.20.80', sub: 'UDP 53 → 61000', tone: 'good' },
        { note: 'No handshake, no ACK, no close; if no reply arrives, the resolver asks again' },
      ],
    },
    notes:
      "UDP wins whenever a retransmission would arrive too late to matter or a connection would cost more than the data itself. **Voice and video** send media in RTP packets over UDP: a voice sample that arrives 300 ms late is worse than one that never arrives, so the codec simply conceals the gap. **DNS** is a single question and a single answer, and the resolver's own timeout and retry is all the reliability it needs, although DNS switches to TCP for zone transfers and for answers too large for a UDP response. **DHCP** must use UDP because a client with no IP address cannot complete a TCP handshake and relies on broadcasts. **TFTP** transfers files in lock-step: it sends one block, waits for that block's acknowledgment, then sends the next, all handled by TFTP itself. **SNMP**, **syslog** and **NTP** send small, frequent messages where connection overhead would dominate. Network devices generate a lot of this traffic, which is why so many management protocols are UDP-based. The rule for the exam: when an application needs reliability over UDP, the application provides it.",
  },
  {
    kind: 'table',
    title: 'Well-known ports to memorize',
    columns: ['Port', 'Protocol', 'Transport', 'Notes'],
    rows: [
      ['20, 21', 'FTP', 'TCP', '21 control, 20 data (active mode)'],
      ['22', 'SSH (also SCP, SFTP)', 'TCP', 'Encrypted remote access'],
      ['23', 'Telnet', 'TCP', 'Clear-text remote access'],
      ['25', 'SMTP', 'TCP', 'Sending and relaying email'],
      ['53', 'DNS', '**UDP and TCP**', 'UDP queries, TCP zone transfers'],
      ['67, 68', 'DHCP', 'UDP', '67 server, 68 client'],
      ['69', 'TFTP', 'UDP', 'IOS image and config transfers'],
      ['80', 'HTTP', 'TCP', 'Web, clear text'],
      ['110', 'POP3', 'TCP', 'Retrieve email (download)'],
      ['123', 'NTP', 'UDP', 'Time synchronization'],
      ['143', 'IMAP', 'TCP', 'Retrieve email (kept on the server)'],
      ['161, 162', 'SNMP', 'UDP', '161 agent is polled, 162 manager gets traps'],
      ['443', 'HTTPS', 'TCP', 'Web over TLS (HTTP/3 uses UDP 443)'],
      ['514', 'Syslog', 'UDP', 'Log messages to a server'],
    ],
    notes:
      "This is the list to know cold; Cisco tests it directly (which port does a protocol use?) and indirectly inside ACL, NAT and firewall questions. Learn protocol, port and transport together. TCP carries the interactive and file-oriented services: **FTP 20/21**, **SSH 22**, **Telnet 23**, **SMTP 25**, **HTTP 80**, **POP3 110**, **IMAP 143** and **HTTPS 443**. UDP carries the lightweight infrastructure services: **DHCP 67/68**, **TFTP 69**, **NTP 123**, **SNMP 161/162** and **syslog 514**. **DNS 53** uses both. A few details are favorite distractors. FTP uses two ports: 21 for the control connection and 20 for data in active mode, while passive mode negotiates a high port for data instead. DHCP servers listen on 67 and clients on 68. SNMP managers poll agents on 161, and agents send traps and informs to the manager on 162. SSH replaced Telnet because Telnet sends everything, passwords included, in clear text. Finally, HTTP/3 runs over QUIC on UDP 443, so HTTPS traffic can appear on UDP 443 as well as TCP 443.",
  },
  {
    kind: 'diagram',
    title: 'Applications grouped by transport',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Over TCP',
          layers: [
            { label: 'HTTP 80 · HTTPS 443' },
            { label: 'FTP 20/21 · SSH 22 · Telnet 23' },
            { label: 'SMTP 25 · POP3 110 · IMAP 143' },
            { label: 'TCP', sub: 'IP protocol 6', tone: 'accent' },
          ],
        },
        {
          title: 'Both',
          layers: [
            { label: 'DNS 53', sub: 'UDP queries, TCP zone transfers', span: 3 },
            { label: 'TCP or UDP', tone: 'muted' },
          ],
        },
        {
          title: 'Over UDP',
          layers: [
            { label: 'DHCP 67/68 · TFTP 69' },
            { label: 'NTP 123 · SNMP 161/162' },
            { label: 'Syslog 514 · voice/video (RTP)' },
            { label: 'UDP', sub: 'IP protocol 17', tone: 'accent' },
          ],
        },
      ],
    },
    caption: 'DNS is the one common service that uses both transports.',
    notes:
      "Grouping the ports by transport makes them easier to remember and helps with elimination on the exam. On the left are the TCP applications, which all need every byte delivered intact and in order: web pages, file transfers, remote CLI sessions and email. On the right are the UDP applications, which either exchange small independent messages (DHCP, NTP, SNMP, syslog), provide their own lightweight reliability (TFTP), or carry real-time media that cannot wait for retransmissions (voice and video in RTP). DNS sits in the middle because it uses both: UDP 53 for ordinary queries, and TCP 53 for zone transfers between servers and for answers too large for a UDP response. A handy pattern: the trivial and simple management protocols, TFTP and SNMP, use UDP, while their fuller relatives, FTP and the SSH-based SCP and SFTP, use TCP. When a question asks you to build an ACL entry for a service, pick the protocol keyword from this picture first (`tcp` or `udp`) and then the port with `eq`, for example `permit udp any any eq 69` for TFTP.",
  },
  {
    kind: 'cli',
    title: 'Seeing sockets on a host and a router',
    code: `C:\\>netstat -an

Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING
  TCP    10.1.10.25:50512       10.2.20.80:443         ESTABLISHED
  TCP    10.1.10.25:50513       10.2.20.80:443         ESTABLISHED
  TCP    10.1.10.25:50600       10.1.10.1:22           ESTABLISHED
  TCP    10.1.10.25:50611       10.2.20.80:80          TIME_WAIT
  UDP    0.0.0.0:123            *:*

R1# show tcp brief
TCB       Local Address               Foreign Address             (state)
7F0B5C3A  10.1.10.1.22                10.1.10.25.50600            ESTAB`,
    highlight: ['LISTENING', 'ESTABLISHED', 'TIME_WAIT', '10.1.10.1.22'],
    caption: 'The same SSH session from both ends: PC socket port 50600, router socket port 22.',
    notes:
      "You can watch transport-layer state on any host. On Windows, `netstat -an` lists every TCP connection and listening port numerically, and `-o` adds the owning process ID; on Linux, `ss -tuna` does the same job. Read the columns as local socket, foreign socket and state. **LISTENING** on 0.0.0.0:135 means a local service is waiting for connections on port 135 on every address. The two **ESTABLISHED** sessions to 10.2.20.80:443 are two HTTPS connections from different ephemeral ports. The session to 10.1.10.1:22 is SSH to the router, and the **TIME_WAIT** entry is a web connection this PC closed a moment ago, waiting out its timer. UDP lines have no state because UDP has no connections, and the wildcard foreign address simply means any remote socket may send to local port 123. On Cisco IOS, `show tcp brief` lists the router's own TCP sessions, not transit traffic. IOS writes a socket as address.port, so `10.1.10.1.22` is R1's SSH server socket and 10.1.10.25.50600 is the PC's client socket: the same connection seen from the other end.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: TCP and UDP',
    body: '==ACK = next byte expected==, and SYN and FIN each consume one sequence number.',
    bullets: [
      'DHCP is **UDP** 67/68, TFTP is **UDP** 69, FTP is **TCP** 20/21',
      'DNS uses **both**: UDP 53 queries, TCP 53 zone transfers',
      'SNMP: agents polled on **161**, traps sent to **162**',
      'The window is counted in **bytes** and set by the receiver',
      'Replies swap ports: from 443 to the client\'s ephemeral port',
      'IANA ephemeral range: **49152–65535**',
      'UDP header 8 bytes; TCP header 20 bytes minimum',
    ],
    notes:
      "These are the mistakes that cost points. Acknowledgment numbers name the **next** byte expected, not the last byte received, and SYN and FIN each count as one byte, so an ISN of 1000 is acknowledged with 1001. Transport choices are memorized as pairs: DHCP and TFTP ride on UDP even though they sound as if they need reliability, FTP and SSH ride on TCP, and DNS uses both. SNMP uses two ports in opposite directions: managers poll agents on 161, and agents send traps to the manager on 162. The TCP window is measured in bytes and set by the receiver; it is flow control, not error detection, which is the checksum's job. In replies the ports swap, so return traffic from a web server has source port 443 and a high destination port, and ACL questions test this constantly. Know the three IANA ranges and their exact boundaries, 1023/1024 and 49151/49152. Finally, when a stem says connectionless, best effort or lowest overhead, the answer is UDP; reliable, sequenced, acknowledged or windowing means TCP.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Ports multiplex many conversations onto one IP address',
      'Socket = IP + protocol + port; connection = a pair of sockets',
      'TCP: handshake, sequence/ACK numbers, retransmission, windowing',
      'TCP close: FIN, ACK, FIN, ACK; RST aborts',
      'UDP: 8-byte header, connectionless, best effort',
      'Ranges: 0–1023, 1024–49151, 49152–65535',
      'Memorize each well-known port with its transport',
    ],
    notes:
      "The transport layer delivers data between applications, and port numbers make that possible: a destination port selects the service, an ephemeral source port identifies the conversation, and the pair of sockets identifies each connection uniquely. TCP turns IP's best-effort packets into a reliable byte stream. It opens with SYN, SYN-ACK and ACK; numbers every byte; acknowledges cumulatively with the next byte expected; retransmits after a timeout or duplicate ACKs; and lets the receiver pace the sender with a sliding window. It closes each direction separately with FIN and ACK, or aborts with RST. UDP skips all of that for a fixed 8-byte header and no setup, which suits voice, video, DNS, DHCP, TFTP, SNMP, NTP and syslog, with reliability added by the application when it is needed. Finally, commit the IANA ranges and the well-known port table to memory, including the transport each protocol uses. You will reuse them in the ACL, NAT, firewall, QoS and device-management lessons throughout the course.",
  },
];
