import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Vulnerability', back: 'A **weakness** that could be used to compromise an asset — e.g. an unpatched bug, Telnet enabled, a reused password.' },
  { id: 'f2', front: 'Threat', back: 'Any **potential danger** to an asset: a threat actor or event that could exploit a vulnerability.' },
  { id: 'f3', front: 'Exploit', back: 'The specific **tool, code or technique** that takes advantage of a vulnerability (e.g. a buffer-overflow script).' },
  { id: 'f4', front: 'Risk', back: 'The **likelihood** that a threat exploits a vulnerability, combined with the **impact** if it does.' },
  { id: 'f5', front: 'Mitigation', back: 'A countermeasure that removes a vulnerability or reduces the likelihood or impact of an attack (patch, ACL, IPS, training).' },
  { id: 'f6', front: 'CIA triad', back: '**Confidentiality** (encryption), **Integrity** (hashing, signatures), **Availability** (redundancy, DoS protection).' },
  { id: 'f7', front: 'Reconnaissance attack', back: 'Information gathering before an attack: ping sweeps, port scans, DNS and whois lookups, social media (OSINT).' },
  { id: 'f8', front: 'DoS vs DDoS', back: 'DoS comes from **one** source; DDoS comes from **many** sources at once, usually a **botnet** of compromised hosts.' },
  { id: 'f9', front: 'TCP SYN flood', back: 'Many SYNs (often spoofed) that never complete the handshake, filling the server\'s half-open connection table — a DoS.' },
  { id: 'f10', front: 'Reflection attack', back: 'Attacker sends requests with the **victim\'s IP as the spoofed source**, so innocent reflector servers send their replies to the victim.' },
  { id: 'f11', front: 'Amplification attack', back: 'A reflection attack in which each **reply is much larger than the request** (typically UDP services such as DNS or NTP).' },
  { id: 'f12', front: 'Mitigation for IP source spoofing', back: '**Ingress filtering** (RFC 2827 / BCP 38) with ACLs, or uRPF — drop packets whose source cannot legitimately arrive on that interface.' },
  { id: 'f13', front: 'DHCP spoofing', back: 'A **rogue DHCP server** hands clients a malicious default gateway or DNS server → MITM. Mitigation: **DHCP snooping**.' },
  { id: 'f14', front: 'ARP poisoning (ARP spoofing)', back: 'Unsolicited ARP replies map a victim IP (often the gateway) to the attacker\'s MAC → MITM. Mitigation: **Dynamic ARP Inspection**.' },
  { id: 'f15', front: 'Man-in-the-middle (MITM)', back: 'Attacker secretly sits between two parties to **eavesdrop** on or **modify** their traffic. Encryption limits the damage.' },
  { id: 'f16', front: 'Virus', back: 'Malicious code attached to a **host file or program**; spreads when a user runs or shares the infected file.' },
  { id: 'f17', front: 'Worm', back: 'Standalone, **self-replicating** malware that spreads across the network by exploiting vulnerabilities — **no user action** needed.' },
  { id: 'f18', front: 'Trojan horse', back: 'Malware **disguised as legitimate software** the user installs; does not self-replicate; often opens a backdoor.' },
  { id: 'f19', front: 'Ransomware', back: '**Encrypts** the victim\'s data and demands payment for the key. Best defenses: patching, endpoint security, **offline backups**.' },
  { id: 'f20', front: 'Dictionary vs brute-force attack', back: 'Dictionary tries a **wordlist** of likely passwords; brute force tries **every possible combination**.' },
  { id: 'f21', front: 'Spear phishing vs whaling', back: 'Spear phishing targets a **specific person or group**; whaling is spear phishing aimed at **senior executives**.' },
  { id: 'f22', front: 'Vishing vs smishing', back: 'Vishing = social engineering by **voice/phone**; smishing = by **SMS text** message.' },
  { id: 'f23', front: 'Pharming', back: 'Redirects users who type a **legitimate URL** to a fake site by poisoning DNS or the hosts file — no malicious link needed.' },
  { id: 'f24', front: 'Watering hole attack', back: 'Compromises a website that the **target group visits often**, so victims are infected on a site they trust.' },
  { id: 'f25', front: 'Pretexting', back: 'Social engineering with an **invented scenario** (e.g. "I\'m from IT") to gain trust and extract information.' },
  { id: 'f26', front: 'Tailgating (piggybacking)', back: '**Physical** social engineering: following an authorized person through a secured door without badging in.' },
  { id: 'f27', front: 'Primary mitigation for social engineering', back: '**User awareness and training**, backed by verification procedures and MFA.' },
  { id: 'f28', front: 'IDS vs IPS', back: 'An **IDS** analyzes a **copy** of traffic and only alerts; an **IPS** sits **inline** and can drop malicious packets.' },
  { id: 'f29', front: 'Stateful firewall', back: 'Tracks sessions in a **state table** and automatically permits **return traffic**; blocks unsolicited inbound sessions.' },
  { id: 'f30', front: 'Defense in depth', back: 'Layering independent controls (policy, physical, perimeter, network, endpoint, access, data) so one failure does not expose the asset.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which term describes a weakness in a system that could be used to compromise it?',
    options: ['Threat actor', 'Vulnerability', 'Exploit code', 'Risk rating'],
    answer: 1,
    difficulty: 1,
    explanation:
      'A **vulnerability** is the weakness itself. A threat is the potential danger (an actor or event), an exploit is the tool or technique that uses the weakness, and risk is the likelihood and impact of it being exploited.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which type of malware spreads from host to host across a network without any user interaction?',
    options: ['Virus', 'Worm', 'Trojan horse', 'Keylogger'],
    answer: 1,
    difficulty: 1,
    explanation:
      'A **worm** is self-replicating and exploits network-reachable vulnerabilities, so it needs no user action. A virus needs a host file that a user runs or shares, a trojan relies on the user installing it, and a keylogger only records keystrokes.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about reflection and amplification attacks are true? (Choose two.)',
    options: [
      'The attacker spoofs the victim\'s IP address as the source of its requests',
      'The reflector servers must first be infected with malware',
      'In an amplification attack each reply is larger than the request',
      'The attacker must complete a TCP three-way handshake with each reflector',
      'The attack targets the reflector servers themselves',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Reflection works by **spoofing the victim\'s address** so that innocent servers reply to the victim, and amplification adds **replies larger than the requests**. The reflectors are not infected — they simply answer. A spoofed source cannot complete a TCP handshake, which is why these attacks use UDP services, and the victim, not the reflector, is the target.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each attack to the mitigation that best addresses it.',
    pairs: [
      { left: 'ARP poisoning', right: 'Dynamic ARP Inspection' },
      { left: 'Rogue DHCP server', right: 'DHCP snooping' },
      { left: 'Phishing email', right: 'User awareness training' },
      { left: 'Sniffing Telnet passwords', right: 'SSH (encryption)' },
    ],
    difficulty: 2,
    explanation:
      '**DAI** validates ARP messages against DHCP snooping bindings; **DHCP snooping** allows DHCP server messages only on trusted ports; phishing targets people, so **training** is the primary control; and cleartext Telnet credentials are protected by switching to encrypted **SSH**.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'Which element of the CIA triad does a DDoS attack primarily target? (one word)',
    answers: ['availability'],
    placeholder: 'pillar',
    difficulty: 1,
    explanation:
      'A DDoS makes a service unusable for legitimate users, so it attacks **availability**. It does not normally read data (confidentiality) or alter it (integrity).',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'An attacker phones an employee, claims to be from the help desk, and asks for the employee\'s password. Which attack is this?',
    options: ['Smishing', 'Vishing', 'Whaling', 'Pharming'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Social engineering over a voice call is **vishing**. Smishing uses SMS text messages, whaling targets executives (usually by email), and pharming redirects a legitimate URL to a fake site.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which security device receives only a copy of the traffic and can alert on attacks but cannot block them?',
    options: ['IPS', 'IDS', 'Stateful firewall', 'Next-generation firewall'],
    answer: 1,
    difficulty: 1,
    explanation:
      'An **IDS** works on a mirrored copy of traffic, so it can only generate alerts. An IPS, a stateful firewall and an NGFW are all inline and can drop packets.',
  },
];
