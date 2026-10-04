import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which transport layer protocol provides connectionless, best-effort delivery without acknowledgments?',
    options: ['TCP', 'UDP', 'IP', 'ICMP'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**UDP** is the connectionless, best-effort transport protocol. TCP is connection-oriented and acknowledges data. IP is also connectionless but works at the network layer, and ICMP is a network-layer control protocol carried inside IP, not a transport protocol.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Which two statements describe TCP? (Choose two.)',
    options: [
      'It establishes a session with a three-way handshake before sending data',
      'It uses a fixed 8-byte header with ports, length and checksum',
      'It numbers bytes so the receiver can reorder segments and detect loss',
      'It is preferred for real-time voice because it retransmits late packets',
      'It sends data immediately without waiting for any acknowledgments',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'TCP opens connections with SYN, SYN-ACK, ACK and uses **sequence numbers** for ordering and loss detection. The 8-byte header belongs to UDP. Retransmitting late voice packets would only add delay, which is why voice uses UDP. TCP never sends without acknowledgments; its window limits how much may be unacknowledged.',
  },
  {
    id: 'e3',
    type: 'order',
    stem: 'Put the segments of a normal TCP connection in order, from opening to closing. The client closes first.',
    items: [
      'Client sends SYN',
      'Server sends SYN-ACK',
      'Client sends ACK',
      'Data segments and acknowledgments are exchanged',
      'Client sends FIN',
      'Server acknowledges the client\'s FIN',
      'Server sends its own FIN',
      'Client sends the final ACK',
    ],
    difficulty: 2,
    explanation:
      'The three-way handshake (SYN, SYN-ACK, ACK) establishes the connection, data flows with acknowledgments, and the four-way termination closes each direction separately: FIN, ACK from the client\'s side, then FIN, ACK from the server\'s side.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The capture on host 10.1.10.40 shows only packets sent by 10.2.20.80. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `$ sudo tcpdump -n -S -i enp0s3 src host 10.2.20.80
10:15:01.101002 IP 10.2.20.80.443 > 10.1.10.40.51000: Flags [S.], seq 8000, ack 3001, win 65160, options [mss 1460], length 0`,
    },
    options: [
      '10.2.20.80 is the client that opened the session, and its ISN was 3000',
      '10.2.20.80 is answering a SYN from 10.1.10.40 that had an ISN of 3000',
      'The segment carries 1460 bytes of application data from the server',
      'The next segment sent by 10.1.10.40 will use sequence number 8001',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Flags [S.] means SYN plus ACK, the second step of the handshake, sent from well-known port 443 by the **server**. Its ack of 3001 acknowledges the client\'s SYN, which consumed one sequence number, so the client\'s ISN was 3000. The length is 0; `mss 1460` is an option announcing the maximum segment size, not data. The client\'s next segment uses sequence number 3001 and acknowledgment number 8001; 8001 is the ack, not the seq.',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'Refer to the exhibit. The receiver advertised a window of 4000 bytes, and the sender has sent the segments shown with no acknowledgment yet. How many more bytes can the sender transmit before it must wait for an ACK?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 's', label: 'Sender', icon: 'pc' },
          { id: 'r', label: 'Receiver', icon: 'server' },
        ],
        steps: [
          { from: 'r', to: 's', label: 'ACK=1001, window=4000' },
          { from: 's', to: 'r', label: 'seq=1001, 1000 bytes' },
          { from: 's', to: 'r', label: 'seq=2001, 1000 bytes' },
          { from: 's', to: 'r', label: 'seq=3001, 1000 bytes' },
          { note: 'How many more bytes before an ACK is required?', tone: 'accent' },
        ],
      },
    },
    answers: ['1000', '1000 bytes'],
    placeholder: 'bytes',
    difficulty: 3,
    explanation:
      'The window allows 4000 unacknowledged bytes starting at byte 1001, so bytes 1001–5000. The sender already has 3000 bytes outstanding (1001–4000), so it may send **1000** more (4001–5000) and must then wait. When the next ACK arrives, the window slides forward and the sender can continue.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Which TCP header field allows the receiver to put segments back in the correct order?',
    options: ['Sequence Number', 'Window', 'Checksum', 'Urgent Pointer'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The **Sequence Number** identifies the position of each segment\'s first byte in the stream, so the receiver can reorder segments and spot gaps. The Window is for flow control, the Checksum detects corruption, and the Urgent Pointer marks urgent data.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each protocol to its well-known port.',
    pairs: [
      { left: 'SSH', right: '22' },
      { left: 'Telnet', right: '23' },
      { left: 'SMTP', right: '25' },
      { left: 'TFTP', right: '69' },
      { left: 'NTP', right: '123' },
      { left: 'Syslog', right: '514' },
    ],
    difficulty: 1,
    explanation:
      'SSH is TCP 22, Telnet is TCP 23, SMTP is TCP 25, TFTP is UDP 69, NTP is UDP 123 and syslog is UDP 514.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Drag each application protocol to the transport protocol it uses by default.',
    categories: ['TCP', 'UDP'],
    items: [
      { text: 'HTTP', category: 0 },
      { text: 'SSH', category: 0 },
      { text: 'SMTP', category: 0 },
      { text: 'FTP', category: 0 },
      { text: 'IMAP', category: 0 },
      { text: 'TFTP', category: 1 },
      { text: 'DHCP', category: 1 },
      { text: 'SNMP', category: 1 },
      { text: 'NTP', category: 1 },
      { text: 'Syslog', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'HTTP (80), SSH (22), SMTP (25), FTP (20/21) and IMAP (143) need reliable, ordered delivery and use TCP. TFTP (69), DHCP (67/68), SNMP (161/162), NTP (123) and syslog (514) use UDP. Do not be misled by TFTP and DHCP sounding important: TFTP adds its own acknowledgments, and DHCP clients have no address for a TCP session.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'Which two statements about DNS transport are true? (Choose two.)',
    options: [
      'Standard name queries normally use UDP port 53',
      'Zone transfers between DNS servers use TCP port 53',
      'DNS uses only TCP port 53 because it needs reliability',
      'DNS queries are sent to UDP port 67',
      'DNS responses are always sent over TCP',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Ordinary queries and responses use **UDP 53**; **TCP 53** is used for zone transfers and for responses too large for UDP. DNS is not TCP-only, UDP 67 is the DHCP server port, and a UDP query normally gets a UDP response.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>netstat -an

Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING
  TCP    10.1.10.25:50512       10.2.20.80:443         ESTABLISHED
  TCP    10.1.10.25:50513       10.2.20.80:443         ESTABLISHED
  TCP    10.1.10.25:50600       10.1.10.1:22           ESTABLISHED
  UDP    0.0.0.0:123            *:*`,
    },
    options: [
      'The PC is hosting an HTTPS server on port 443 that 10.2.20.80 connects to',
      'The PC has two HTTPS connections to 10.2.20.80 with different source ports',
      'The two connections to 10.2.20.80 share a single local socket on the PC',
      'The PC is acting as an SSH server and accepting connections from 10.1.10.1',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Port 443 appears in the Foreign Address column, so it is the server\'s port. The local sockets 10.1.10.25:50512 and 10.1.10.25:50513 use two different ephemeral ports, so these are **two independent connections**, each identified by its own socket pair; they do not share a socket. In the SSH line the local port is 50600 and the foreign port is 22, so the PC is the SSH **client** of 10.1.10.1, not a server accepting SSH.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes this session?',
    exhibit: {
      kind: 'cli',
      text: `R1# show tcp brief
TCB       Local Address               Foreign Address             (state)
7F0B5C3A  10.1.10.1.22                10.1.10.25.50600            ESTAB`,
    },
    options: [
      'R1 opened an SSH session to 10.1.10.25',
      'Host 10.1.10.25 has an established SSH session to R1',
      'Host 10.1.10.25 has a Telnet session to R1 using port 50600',
      'The session uses UDP port 22',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'IOS writes sockets as address.port. R1\'s local socket 10.1.10.1.22 is the **SSH server** port, and the foreign socket uses ephemeral port 50600, so 10.1.10.25 is the client and R1 the server. Had R1 initiated the session, R1 would use an ephemeral local port and the foreign port would be 22. Telnet would use port 23, and SSH runs over TCP, which is why it appears in `show tcp`.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 opened an HTTPS connection to the web server with the ports shown. Which source and destination ports does the server use in its replies?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.10.25', x: 1.2, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.5 },
          { id: 'web', icon: 'server', label: 'Web server', sub: '10.2.20.80', x: 8.8, y: 1.5 },
        ],
        links: [
          { from: 'pc', to: 'r1', label: 'TCP src 51000 → dst 443', arrow: 'forward' },
          { from: 'r1', to: 'web', arrow: 'forward' },
        ],
      },
    },
    options: [
      'Source 51000, destination 443',
      'Source 443, destination 51000',
      'Source 443, destination 443',
      'Source 80, destination 51000',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A reply swaps the sockets: it leaves the server\'s port **443** and is addressed to the client\'s ephemeral port **51000**, which is how PC1 matches it to the right connection. Source 51000 to 443 is the original request direction. Destination 443 would not reach the client\'s socket, and port 80 is HTTP; the server must answer from the port the client connected to.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'To which UDP port on the network management station does an SNMP agent send trap messages?',
    answers: ['162', 'udp 162', 'udp/162'],
    placeholder: 'port',
    difficulty: 1,
    explanation:
      'Traps and informs go to UDP **162** on the manager. UDP 161 is the port on which agents receive get and set requests from the manager.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. What is the purpose of the highlighted field?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'header',
        layout: 'rows',
        bitsPerRow: 32,
        fields: [
          { label: 'Source Port', size: 16 },
          { label: 'Destination Port', size: 16 },
          { label: 'Sequence Number', size: 32 },
          { label: 'Acknowledgment Number', size: 32 },
          { label: 'Data Offset', size: 4 },
          { label: 'Reserved', size: 4, tone: 'muted' },
          { label: 'Flags', size: 8 },
          { label: '?', size: 16, tone: 'accent' },
          { label: 'Checksum', size: 16 },
          { label: 'Urgent Pointer', size: 16 },
        ],
      },
    },
    options: [
      'It tells the sender how many bytes the receiver can currently accept',
      'It identifies the next byte that the receiver expects to receive',
      'It detects corruption in the TCP header and in the data payload',
      'It limits how many routers a segment may cross before being dropped',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The highlighted 16-bit field after the flags is the **Window**, used for flow control: the receiver advertises how many bytes it can accept beyond the acknowledged point. The next byte expected is the Acknowledgment Number, corruption is detected by the Checksum, and the hop limit is the TTL in the IP header, not a TCP field.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'A team is building a real-time voice application. Which two characteristics make UDP a better choice than TCP for the media stream? (Choose two.)',
    options: [
      'No connection setup before data is sent',
      'Lower header overhead of 8 bytes',
      'Retransmission of lost media datagrams',
      'Windowing for end-to-end flow control',
      'Guaranteed in-order packet delivery',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'UDP sends immediately without a handshake and adds only an 8-byte header, keeping delay and overhead low. Retransmission, windowing and guaranteed ordering are TCP features, and UDP provides none of them; for voice they would add delay, since a retransmitted voice sample arrives too late to be played.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two statements about TFTP are true? (Choose two.)',
    options: [
      'It uses UDP port 69',
      'It acknowledges each block and retransmits after a timeout',
      'It uses TCP port 20 for the data connection',
      'It requires a username and password',
      'It encrypts file transfers in transit',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'TFTP runs on **UDP 69** and provides its own simple reliability: each block must be acknowledged before the next is sent, and unacknowledged blocks are resent. TCP 20 is FTP\'s active-mode data port. TFTP has no authentication and no encryption, which is why it is used only on trusted networks.',
  },
  {
    id: 'e17',
    type: 'categorize',
    stem: 'Drag each port number into its IANA range.',
    categories: ['Well-known', 'Registered', 'Dynamic / ephemeral'],
    items: [
      { text: '23', category: 0 },
      { text: '443', category: 0 },
      { text: '1023', category: 0 },
      { text: '1024', category: 1 },
      { text: '3389', category: 1 },
      { text: '49151', category: 1 },
      { text: '49152', category: 2 },
      { text: '51000', category: 2 },
      { text: '65535', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Well-known ports are 0–1023, registered ports are 1024–49151, and dynamic (ephemeral) ports are 49152–65535. The boundary values 1023/1024 and 49151/49152 are the ones exam items like to test.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the connection after these two segments?',
    exhibit: {
      kind: 'cli',
      text: `$ sudo tcpdump -n -S -i enp0s3 host 10.2.20.80
10:20:44.310512 IP 10.1.10.40.51000 > 10.2.20.80.443: Flags [F.], seq 7000, ack 12000, win 501, length 0
10:20:44.311020 IP 10.2.20.80.443 > 10.1.10.40.51000: Flags [.], ack 7001, win 510, length 0`,
    },
    options: [
      'The connection is closed in both directions once the server ACKs the FIN',
      'The client has finished sending, but the server can still send until its own FIN',
      'The client can no longer receive data from the server after sending its FIN',
      'The server rejected the client\'s close request and will send an RST',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Flags [F.] is a FIN (with ACK) from the client, and the server\'s ACK 7001 acknowledges it; the FIN consumed one sequence number. The connection is now **half-closed**: the client-to-server direction is finished, but the server can keep sending, and the client keeps receiving, until the server sends its own FIN and gets the final ACK. A rejection would appear as Flags [R], and a plain ACK is the normal response.',
  },
  {
    id: 'e19',
    type: 'input',
    stem: 'Refer to the exhibit. The capture was taken on 10.1.10.40, and the segment carrying bytes 6461–7920 never arrived. Which acknowledgment number does 10.1.10.40 send after receiving the last segment shown?',
    exhibit: {
      kind: 'cli',
      text: `$ sudo tcpdump -n -S -i enp0s3 host 10.2.20.80
10:15:02.204118 IP 10.2.20.80.443 > 10.1.10.40.51000: Flags [.], seq 5001:6461, ack 1518, win 509, length 1460
10:15:02.204170 IP 10.1.10.40.51000 > 10.2.20.80.443: Flags [.], ack 6461, win 501, length 0
10:15:02.205302 IP 10.2.20.80.443 > 10.1.10.40.51000: Flags [.], seq 7921:9381, ack 1518, win 509, length 1460`,
    },
    answers: ['6461'],
    placeholder: 'number',
    difficulty: 3,
    explanation:
      'TCP acknowledgments are cumulative and name the next byte expected. Bytes 6461–7920 are missing, so even though bytes 7921–9380 arrived, the host can only acknowledge up to byte 6460 and sends **ACK 6461** again: a duplicate ACK. Three duplicate ACKs trigger a fast retransmit of the missing segment. Acknowledging 9381 would falsely confirm the lost bytes.',
  },
  {
    id: 'e20',
    type: 'match',
    stem: 'Match each TCP header field to its purpose.',
    pairs: [
      { left: 'Sequence Number', right: 'Position of the segment\'s first data byte in the stream' },
      { left: 'Acknowledgment Number', right: 'Next byte the receiver expects' },
      { left: 'Window', right: 'Bytes the receiver can accept before an ACK' },
      { left: 'Checksum', right: 'Detects errors in the header and data' },
      { left: 'Flags (SYN, FIN, RST)', right: 'Open, close or abort a connection' },
    ],
    difficulty: 2,
    explanation:
      'Sequence numbers order the byte stream, acknowledgment numbers confirm delivery by naming the next byte expected, the window provides flow control, the checksum detects corruption, and the control flags manage the connection life cycle.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 sends the DNS query shown. Which transport protocol and ports does the DNS server use for its reply?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.10.25', x: 1.2, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.5 },
          { id: 'dns', icon: 'server', label: 'DNS server', sub: '10.1.99.53', x: 8.8, y: 1.5 },
        ],
        links: [
          { from: 'pc', to: 'r1', label: 'Query: UDP 52011 → 53', arrow: 'forward' },
          { from: 'r1', to: 'dns', arrow: 'forward' },
        ],
      },
    },
    options: [
      'UDP, source port 52011, destination port 53',
      'UDP, source port 53, destination port 52011',
      'TCP, source port 53, destination port 52011',
      'UDP, source port 67, destination port 68',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The reply uses the same transport as the query and swaps the ports: **UDP from 53 to 52011**. Source 52011 to 53 is the query direction. TCP 53 is used for zone transfers and oversized answers, not for this ordinary query, and UDP 67/68 are the DHCP server and client ports.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'By default, which transport protocol and port does a Cisco router use to send syslog messages to a syslog server?',
    options: ['UDP 514', 'TCP 514', 'UDP 162', 'UDP 123'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Syslog uses **UDP 514** by default. TCP transport for syslog must be configured explicitly, UDP 162 receives SNMP traps, and UDP 123 is NTP.',
  },
];
