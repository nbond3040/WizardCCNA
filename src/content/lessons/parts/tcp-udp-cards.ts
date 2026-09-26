import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Transport-layer PDU names', back: 'TCP: **segment**. UDP: **datagram**.' },
  { id: 'f2', front: 'IP protocol numbers for TCP and UDP', back: 'TCP = **6**, UDP = **17** (IPv4 Protocol / IPv6 Next Header field).' },
  { id: 'f3', front: 'Multiplexing (transport layer)', back: 'Using port numbers so many applications and conversations share one IP address at the same time.' },
  { id: 'f4', front: 'Socket', back: 'IP address + transport protocol + port, e.g. 10.1.10.25:50512 over TCP. A connection is identified by its pair of sockets.' },
  { id: 'f5', front: 'Well-known port range', back: '**0–1023**.' },
  { id: 'f6', front: 'Registered port range', back: '**1024–49151**.' },
  { id: 'f7', front: 'Dynamic / ephemeral port range (IANA)', back: '**49152–65535**; clients choose temporary source ports here (Linux defaults to 32768–60999).' },
  { id: 'f8', front: 'TCP three-way handshake', back: '**SYN** → **SYN-ACK** → **ACK**.' },
  { id: 'f9', front: 'Client ISN is 1000. Acknowledgment number in the SYN-ACK?', back: '**1001**: the SYN consumes one sequence number.' },
  { id: 'f10', front: 'Meaning of a TCP acknowledgment number', back: 'The **next byte** the receiver expects; acknowledgments are cumulative.' },
  { id: 'f11', front: 'TCP four-way termination', back: '**FIN** → **ACK** → **FIN** → **ACK**; each side closes its own direction.' },
  { id: 'f12', front: 'TCP RST flag', back: 'Aborts a connection immediately; also the reply to a SYN sent to a port where nothing listens.' },
  { id: 'f13', front: 'TCP Window field', back: 'Bytes the receiver can accept before the sender must wait for an ACK: **flow control**.' },
  { id: 'f14', front: 'Sliding window', back: 'As ACKs arrive the window moves forward; it grows while delivery is clean and shrinks when the receiver is busy or loss occurs.' },
  { id: 'f15', front: 'When does TCP retransmit?', back: 'When the retransmission timer expires, or after **3 duplicate ACKs** (fast retransmit).' },
  { id: 'f16', front: 'TCP header size', back: '**20 bytes** minimum, up to **60 bytes** with options.' },
  { id: 'f17', front: 'UDP header size and fields', back: '**8 bytes**: Source Port, Destination Port, Length, Checksum.' },
  { id: 'f18', front: 'TCP header fields that UDP lacks', back: 'Sequence and acknowledgment numbers, data offset, flags, window, urgent pointer and options.' },
  { id: 'f19', front: 'Typical TCP MSS on Ethernet', back: '**1460 bytes** (1500 MTU minus 20 IP and 20 TCP), announced in the SYN.' },
  { id: 'f20', front: 'Why do voice and video use UDP?', back: 'Late packets are useless and retransmission adds delay; UDP has low overhead and no handshake.' },
  { id: 'f21', front: 'FTP ports', back: 'TCP **21** control, TCP **20** data (active mode).' },
  { id: 'f22', front: 'SSH and Telnet ports', back: 'SSH TCP **22** (encrypted); Telnet TCP **23** (clear text).' },
  { id: 'f23', front: 'SMTP, POP3 and IMAP ports', back: 'SMTP TCP **25**, POP3 TCP **110**, IMAP TCP **143**.' },
  { id: 'f24', front: 'DNS port and transport', back: 'Port **53**: UDP for normal queries, TCP for zone transfers and large responses.' },
  { id: 'f25', front: 'DHCP ports', back: 'UDP **67** (server) and UDP **68** (client).' },
  { id: 'f26', front: 'TFTP port', back: 'UDP **69**; TFTP acknowledges each block itself.' },
  { id: 'f27', front: 'HTTP and HTTPS ports', back: 'HTTP TCP **80**; HTTPS TCP **443** (HTTP/3 uses UDP 443).' },
  { id: 'f28', front: 'NTP port', back: 'UDP **123**.' },
  { id: 'f29', front: 'SNMP ports', back: 'UDP **161**: agent receives get/set polls. UDP **162**: manager receives traps and informs.' },
  { id: 'f30', front: 'Syslog port', back: 'UDP **514**.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which TCP flags are set in the second segment of the three-way handshake?',
    options: ['SYN only', 'SYN and ACK', 'ACK only', 'FIN and ACK'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The server answers the client\'s SYN with a **SYN-ACK**: SYN to send its own initial sequence number and ACK to acknowledge the client\'s. The first segment is SYN only, the third is ACK only, and FIN is used to close a connection.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two application protocols use UDP? (Choose two.)',
    options: ['TFTP', 'SSH', 'SNMP', 'HTTPS', 'SMTP'],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      '**TFTP** (UDP 69) and **SNMP** (UDP 161/162) use UDP. SSH (22), HTTPS (443) and SMTP (25) all run over TCP because they need reliable, ordered delivery.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'A client sends a SYN with sequence number 4000. What acknowledgment number does the server place in its SYN-ACK?',
    answers: ['4001'],
    placeholder: 'number',
    difficulty: 2,
    explanation:
      'The acknowledgment number is the next byte expected. The SYN consumes one sequence number, so the server acknowledges **4001**.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'Which IANA port range do client applications normally use for their temporary source ports?',
    options: ['0–1023', '1024–49151', '49152–65535', '65536–131071'],
    answer: 2,
    difficulty: 1,
    explanation:
      'The dynamic (ephemeral) range is **49152–65535**. 0–1023 is well-known and 1024–49151 is registered; ports are 16-bit values, so nothing above 65535 exists.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each port to its protocol.',
    pairs: [
      { left: 'TCP 21', right: 'FTP control' },
      { left: 'TCP 25', right: 'SMTP' },
      { left: 'UDP 53', right: 'DNS queries' },
      { left: 'TCP 110', right: 'POP3' },
      { left: 'TCP 143', right: 'IMAP' },
    ],
    difficulty: 2,
    explanation:
      'FTP control uses TCP 21 (data 20), SMTP uses TCP 25, DNS queries use UDP 53, POP3 uses TCP 110 and IMAP uses TCP 143.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which TCP mechanism prevents a fast sender from overwhelming a slow receiver?',
    options: ['Windowing', 'The three-way handshake', 'The checksum', 'Port multiplexing'],
    answer: 0,
    difficulty: 2,
    explanation:
      '**Windowing** is TCP flow control: the receiver advertises how many bytes it can accept. The handshake opens the connection, the checksum detects corruption and ports separate conversations.',
  },
  {
    id: 'q7',
    type: 'categorize',
    stem: 'Classify each characteristic as TCP or UDP.',
    categories: ['TCP', 'UDP'],
    items: [
      { text: 'Connection-oriented', category: 0 },
      { text: 'Sequence and acknowledgment numbers', category: 0 },
      { text: 'Flow control with windowing', category: 0 },
      { text: '8-byte header', category: 1 },
      { text: 'No handshake before sending data', category: 1 },
      { text: 'Preferred for VoIP media', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'TCP is connection-oriented and uses sequence numbers, acknowledgments and windowing. UDP has a fixed 8-byte header, sends without a handshake and is preferred for real-time media.',
  },
];
