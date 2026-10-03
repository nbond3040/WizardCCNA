import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which term describes the likelihood that a threat will exploit a vulnerability, combined with the impact if it does?',
    options: ['Exploit', 'Mitigation', 'Risk', 'Asset'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**Risk** combines likelihood and impact. An exploit is the tool or technique that takes advantage of a vulnerability, a mitigation is a countermeasure, and an asset is something of value that needs protection.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'An attacker alters the contents of packets in transit without either party noticing. Which pillar of the CIA triad is violated?',
    options: ['Availability', 'Confidentiality', 'Authentication', 'Integrity'],
    answer: 3,
    difficulty: 1,
    explanation:
      'Undetected modification of data violates **integrity**. Confidentiality concerns unauthorized reading, availability concerns access to the service, and authentication is not one of the three CIA pillars.',
  },
  {
    id: 'e3',
    type: 'match',
    stem: 'Match each term to its definition.',
    pairs: [
      { left: 'Asset', right: 'Anything of value that must be protected' },
      { left: 'Vulnerability', right: 'A weakness that could be used to compromise an asset' },
      { left: 'Threat', right: 'A potential danger posed by an actor or event' },
      { left: 'Exploit', right: 'A tool or technique that takes advantage of a vulnerability' },
      { left: 'Risk', right: 'Likelihood of exploitation combined with its impact' },
      { left: 'Mitigation', right: 'A countermeasure that reduces likelihood or impact' },
    ],
    difficulty: 2,
    explanation:
      'The six terms form a chain: a threat uses an exploit against a vulnerability in an asset, the risk is the likelihood and impact of that happening, and mitigations remove vulnerabilities or reduce likelihood and impact.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Which attack is shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'att', icon: 'attacker', label: 'Attacker', x: 1, y: 2.5, tone: 'bad' },
          { id: 'd1', icon: 'server', label: 'Open DNS resolver', sub: '203.0.113.53', x: 5, y: 1 },
          { id: 'd2', icon: 'server', label: 'Open DNS resolver', sub: '203.0.113.54', x: 5, y: 4 },
          { id: 'vic', icon: 'server', label: 'Victim web server', sub: '198.51.100.7', x: 9, y: 2.5, tone: 'bad' },
        ],
        links: [
          { from: 'att', to: 'd1', label: '60-byte query, source 198.51.100.7', style: 'dashed', arrow: 'forward' },
          { from: 'att', to: 'd2', style: 'dashed', arrow: 'forward' },
          { from: 'd1', to: 'vic', label: '3000-byte replies', style: 'thick', tone: 'bad', arrow: 'forward' },
          { from: 'd2', to: 'vic', style: 'thick', tone: 'bad', arrow: 'forward' },
        ],
      },
    },
    options: [
      'ARP poisoning attack',
      'DHCP starvation attack',
      'DNS reflection and amplification attack',
      'Pharming attack',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Small queries carry the **victim\'s address as the spoofed source**, so the open resolvers send much larger replies to the victim: a reflection and amplification DDoS. ARP poisoning and DHCP starvation are Layer 2 attacks inside a LAN, and pharming redirects users to a fake site by corrupting name resolution.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each attack to the mitigation that most directly addresses it.',
    pairs: [
      { left: 'ARP poisoning', right: 'Dynamic ARP Inspection' },
      { left: 'Rogue DHCP server', right: 'DHCP snooping with trusted ports' },
      { left: 'MAC flooding', right: 'Port security' },
      { left: 'IP source spoofing', right: 'Ingress filtering (BCP 38) or uRPF' },
      { left: 'Phishing', right: 'User awareness training' },
      { left: 'Sniffing cleartext Telnet', right: 'Encryption such as SSH' },
    ],
    difficulty: 3,
    explanation:
      'Match the control to the mechanism the attack relies on: unauthenticated ARP is validated by DAI, DHCP server messages are restricted to trusted ports by DHCP snooping, port security caps the MAC addresses learned per port, ingress filtering drops forged source addresses, training defeats attacks on people, and encryption hides the cleartext.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Classify each attack by the CIA pillar it primarily targets.',
    categories: ['Confidentiality', 'Integrity', 'Availability'],
    items: [
      { text: 'Sniffing cleartext passwords from a Telnet session', category: 0 },
      { text: 'Stealing a customer database', category: 0 },
      { text: 'Modifying a file in transit so that its hash changes', category: 1 },
      { text: 'Altering routing updates with a man-in-the-middle', category: 1 },
      { text: 'TCP SYN flood against a web server', category: 2 },
      { text: 'DDoS against a DNS server', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Reading or stealing data attacks confidentiality, changing data without detection attacks integrity, and flooding a service so that legitimate users cannot reach it attacks availability.',
  },
  {
    id: 'e7',
    type: 'categorize',
    stem: 'Classify each social engineering attack by the channel it uses.',
    categories: ['Email', 'Voice call', 'SMS text', 'Physical'],
    items: [
      { text: 'Phishing', category: 0 },
      { text: 'Spear phishing', category: 0 },
      { text: 'Whaling', category: 0 },
      { text: 'Vishing', category: 1 },
      { text: 'Smishing', category: 2 },
      { text: 'Tailgating', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'Phishing, spear phishing and whaling normally arrive by email (whaling targets executives). Vishing uses voice calls, smishing uses SMS text messages, and tailgating is the physical act of following an authorized person through a secured door.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Which type of malware is disguised as legitimate software and does not replicate by itself?',
    options: ['Worm', 'Virus', 'Trojan horse', 'Botnet'],
    answer: 2,
    difficulty: 1,
    explanation:
      'A **trojan horse** pretends to be useful software that the user installs, and it does not self-replicate. A worm spreads by itself over the network, a virus attaches to a host file, and a botnet is a collection of infected machines rather than a malware type.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 (10.1.1.10) uses 10.1.1.1 as its default gateway, and 10.1.1.66 is a user workstation on the same VLAN. What does the ARP table indicate, and which feature mitigates it?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> arp -a

Interface: 10.1.1.10 --- 0x4
  Internet Address      Physical Address      Type
  10.1.1.1              00-aa-bb-66-66-66     dynamic
  10.1.1.66             00-aa-bb-66-66-66     dynamic
  10.1.1.255            ff-ff-ff-ff-ff-ff     static`,
    },
    options: [
      'DHCP starvation; DHCP snooping',
      'ARP poisoning; Dynamic ARP Inspection',
      'MAC flooding; port security',
      'Pharming; DNS security',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The gateway address and a workstation address map to the **same MAC address**, the signature of ARP poisoning: the workstation answered for the gateway with its own MAC to become a man-in-the-middle. Dynamic ARP Inspection validates ARP messages against the DHCP snooping bindings and drops forged ones. DHCP starvation exhausts address pools, MAC flooding overflows the switch CAM table, and pharming alters name resolution.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which attack is the switch reporting and blocking?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show logging | include DHCP_SNOOPING
Oct  3 09:12:44.101: %DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 0050.7966.6801`,
    },
    options: [
      'A DHCP starvation attack exhausting the address pool',
      'A rogue DHCP server answering clients from an untrusted port',
      'An ARP poisoning attempt against the default gateway',
      'A MAC flooding attack against the CAM table',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A DHCPOFFER is a server-to-client message and should arrive only on trusted ports that lead to the real DHCP server. A drop on an untrusted access port means a device there is acting as a DHCP server: **DHCP spoofing**. Starvation would show floods of client requests from spoofed MACs, ARP poisoning is blocked by Dynamic ARP Inspection, and MAC flooding is handled by port security.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. A web server at 192.0.2.10 has become unresponsive, and the output lists thousands of half-open connections from many different source addresses. What is occurring, and which control helps?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> netstat -an | find "SYN_RECEIVED"
  TCP    192.0.2.10:80          203.0.113.5:51022      SYN_RECEIVED
  TCP    192.0.2.10:80          198.51.100.77:40318    SYN_RECEIVED
  TCP    192.0.2.10:80          192.0.2.201:33910      SYN_RECEIVED
  TCP    192.0.2.10:80          203.0.113.149:60441    SYN_RECEIVED
  TCP    192.0.2.10:80          198.51.100.8:52617     SYN_RECEIVED
  TCP    192.0.2.10:80          203.0.113.230:12874    SYN_RECEIVED
  <output omitted>`,
    },
    options: [
      'A port scan; Dynamic ARP Inspection',
      'A dictionary attack; multifactor authentication',
      'A SYN flood DDoS; rate limiting, TCP intercept or an IPS',
      'A reflection attack; port security',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Many connections stuck in SYN_RECEIVED from varied sources mean the handshakes are never completed and the backlog is filling: a **TCP SYN flood**, and with many sources a DDoS. Rate limiting, TCP intercept or SYN cookies, an IPS and upstream scrubbing reduce it. A port scan probes many ports instead of filling one backlog, a dictionary attack targets logins, and DAI and port security are Layer 2 controls.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Which attack do these log messages indicate, and which control best reduces the risk?',
    exhibit: {
      kind: 'cli',
      text: `R1# show logging | include SEC_LOGIN
Oct  3 10:15:01.220: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 198.51.100.23] [localport: 22] [Reason: Login Authentication Failed] at 10:15:01 UTC Sat Oct 3 2026
Oct  3 10:15:03.481: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: root] [Source: 198.51.100.23] [localport: 22] [Reason: Login Authentication Failed] at 10:15:03 UTC Sat Oct 3 2026
Oct  3 10:15:05.907: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: cisco] [Source: 198.51.100.23] [localport: 22] [Reason: Login Authentication Failed] at 10:15:05 UTC Sat Oct 3 2026
Oct  3 10:15:08.130: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 198.51.100.23] [localport: 22] [Reason: Login Authentication Failed] at 10:15:08 UTC Sat Oct 3 2026`,
    },
    options: [
      'Reconnaissance with a ping sweep; block all ICMP on every interface',
      'A rogue DHCP server; enable DHCP snooping',
      'A reflection attack; configure Dynamic ARP Inspection',
      'Password guessing against SSH; use `login block-for`, strong passwords and MFA',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'Repeated failed SSH logins (local port 22) from one source with common user names is automated **password guessing**. Lockout with `login block-for`, long passwords and multifactor authentication reduce the risk. A ping sweep would show ICMP rather than login failures, and DHCP snooping and DAI protect against Layer 2 attacks on a LAN.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two are examples of social engineering? (Choose two.)',
    options: ['Pretexting', 'TCP SYN flood', 'Vishing', 'ARP poisoning', 'Port scanning'],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Pretexting (an invented scenario to gain trust) and vishing (voice phishing) manipulate people. A SYN flood is a denial of service, ARP poisoning is a Layer 2 man-in-the-middle technique, and port scanning is reconnaissance.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about a stateful firewall are true? (Choose two.)',
    options: [
      'It records sessions in a state table and permits their return traffic',
      'It receives only a copy of the traffic and can only alert',
      'It drops unsolicited traffic that matches no session and no permit rule',
      'Its primary function is to compare packet payloads with a signature database',
      'It requires an ACL entry for every return packet',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A stateful firewall remembers sessions, so replies to inside-initiated connections are allowed automatically while unsolicited packets are dropped. Receiving only a copy and alerting describes an IDS, signature matching is the primary job of an IPS, and needing a rule for each return packet describes simple static packet filtering.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'What is the main difference between an IDS and an IPS?',
    options: [
      'An IDS drops malicious packets, whereas an IPS only raises alerts',
      'An IDS analyzes a copy of the traffic and alerts, whereas an IPS sits inline and can drop malicious packets',
      'An IDS works at Layer 2, whereas an IPS works at Layer 7',
      'An IDS needs signatures, whereas an IPS does not',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The key difference is placement and action: an **IDS** inspects a mirrored copy and can only alert, while an **IPS** is inline and can block traffic in real time. Both can use signatures, and neither is defined by a single OSI layer.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. A public web server must be reachable from the Internet without exposing the internal LAN if the server is compromised. Where should the server be connected?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5.6,
        nodes: [
          { id: 'net', icon: 'internet', label: 'Internet', x: 1.4, y: 2.4 },
          { id: 'fw', icon: 'firewall', label: 'FW1', x: 5, y: 2.4, tone: 'accent' },
          { id: 'sw', icon: 'switch', label: 'Inside LAN', sub: 'employee PCs', x: 8.6, y: 2.4 },
          { id: 'dmz', icon: 'switch', label: 'DMZ switch', sub: 'free ports', x: 5, y: 4.6 },
        ],
        links: [
          { from: 'net', to: 'fw', toLabel: 'G0/0' },
          { from: 'fw', to: 'sw', fromLabel: 'G0/1' },
          { from: 'fw', to: 'dmz', fromLabel: 'G0/2' },
        ],
        groups: [
          { label: 'Outside', x: 0.3, y: 0.9, w: 2.2, h: 3, tone: 'bad' },
          { label: 'Inside', x: 7.2, y: 0.9, w: 2.6, h: 3, tone: 'good' },
          { label: 'DMZ', x: 3.6, y: 3.7, w: 2.8, h: 1.7, tone: 'warn' },
        ],
      },
    },
    options: [
      'To the inside LAN switch with the employee PCs',
      'Directly on the Internet side, outside the firewall',
      'To the same VLAN as the employee PCs',
      'To the DMZ switch on the third firewall interface',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'A **DMZ** is a separate firewall zone for servers that must be reachable from outside. The firewall allows the Internet to reach only specific DMZ services and does not let the DMZ initiate sessions to the inside, so a compromised web server cannot easily pivot into the LAN. Placing it on the inside or in an employee VLAN exposes the LAN, and placing it outside the firewall leaves it unprotected.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which security design principle layers multiple independent controls so that the failure of one does not expose the asset?',
    options: ['Least privilege', 'Defense in depth', 'Separation of duties', 'Security through obscurity'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**Defense in depth** uses overlapping layers (policy, physical, perimeter, network, endpoint, access and data controls). Least privilege limits what an account can do, separation of duties splits critical tasks between people, and obscurity is not a layered control.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'An attacker researches the CFO of a company, then sends an email addressed to the CFO by name that appears to come from the CEO and demands an urgent wire transfer. Which attack is this?',
    options: ['Whaling', 'Vishing', 'Pharming', 'Smishing'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A targeted email aimed at a senior executive is **whaling**, a form of spear phishing. Vishing uses voice calls, smishing uses SMS text messages, and pharming redirects a legitimate URL to a fake site.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. A user types www.examplebank.com correctly into a browser but reaches a look-alike site hosted at 203.0.113.66. Which attack does the file indicate?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> type C:\\Windows\\System32\\drivers\\etc\\hosts
# Copyright (c) 1993-2009 Microsoft Corp.
127.0.0.1       localhost
203.0.113.66    www.examplebank.com`,
    },
    options: ['Phishing', 'Smishing', 'Pharming', 'Watering hole'],
    answer: 2,
    difficulty: 3,
    explanation:
      'A modified hosts file maps a legitimate name to an attacker address, so even a correctly typed URL lands on a fake site: **pharming**. Phishing relies on a lure such as a link in a message, smishing uses SMS text messages, and a watering hole compromises a legitimate site that the victims visit.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. Which attack technique does this ACL on the customer-facing interface help prevent?',
    exhibit: {
      kind: 'cli',
      text: `ISP1(config)# ip access-list extended ANTI-SPOOF
ISP1(config-ext-nacl)# permit ip 192.0.2.0 0.0.0.255 any
ISP1(config-ext-nacl)# deny ip any any log
ISP1(config-ext-nacl)# exit
ISP1(config)# interface GigabitEthernet0/0/1
ISP1(config-if)# description Customer A (assigned 192.0.2.0/24)
ISP1(config-if)# ip access-group ANTI-SPOOF in`,
    },
    options: [
      'ARP poisoning between hosts in the customer network',
      'Brute-force logins against the router',
      'IP source address spoofing, including the first step of reflection attacks',
      'Phishing emails sent by the customer',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Only packets sourced from the customer\'s assigned 192.0.2.0/24 prefix may enter the ISP; packets with forged sources, such as a victim\'s address, are denied and logged. This is **ingress filtering** (BCP 38 / RFC 2827), which stops spoofed traffic at its origin. The ACL has no effect on Layer 2 ARP, on login attempts to the router, or on email.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'What is the acronym for a denial-of-service attack launched from many compromised hosts at the same time?',
    answers: ['DDoS', 'distributed denial of service', 'distributed denial-of-service'],
    placeholder: 'acronym',
    difficulty: 1,
    explanation:
      'A **DDoS** (distributed denial of service) uses many sources, typically a botnet. A plain DoS comes from a single source.',
  },
  {
    id: 'e22',
    type: 'input',
    stem: 'Enter the acronym of the Layer 2 security feature that validates ARP messages against the DHCP snooping binding table.',
    answers: ['DAI', 'dynamic arp inspection'],
    placeholder: 'acronym',
    difficulty: 2,
    explanation:
      '**Dynamic ARP Inspection (DAI)** drops ARP replies whose IP-to-MAC pairing does not match the DHCP snooping bindings, which defeats ARP poisoning.',
  },
  {
    id: 'e23',
    type: 'order',
    stem: 'Put the stages of a TCP SYN flood in order.',
    items: [
      'The attacker sends a flood of SYN segments, often with spoofed sources',
      'The server answers each SYN with a SYN-ACK and records a half-open connection',
      'The final ACK never arrives, so the half-open entries stay in the table',
      'The connection backlog fills up',
      'Legitimate clients can no longer open connections',
    ],
    difficulty: 2,
    explanation:
      'The server allocates state for every SYN it receives and waits for an ACK that never comes. When the backlog is full, there is no room for real clients, which is the loss of availability that defines a denial of service.',
  },
  {
    id: 'e24',
    type: 'multi',
    stem: 'A laptop infected at home is plugged into the office LAN, and a worm spreads to other PCs in the same VLAN even though the edge firewall logs nothing unusual. Which two controls best limit the spread? (Choose two.)',
    options: [
      'Configure DHCP snooping on the access ports',
      'Install the vendor patch for the vulnerability the worm exploits',
      'Lengthen the TCP session timeout on the edge firewall',
      'Enable endpoint protection with a host-based firewall on the PCs',
      'Enable Dynamic ARP Inspection',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'The worm moves from host to host inside the trusted LAN, where the edge firewall sees nothing. Patching removes the vulnerability it exploits, and endpoint protection with a host firewall detects or blocks the infection on each PC. DHCP snooping and DAI defend against rogue DHCP and ARP poisoning, and firewall session timers have nothing to do with worm propagation.',
  },
];
