import type { Slide } from '../../types';

export const slidesA: Slide[] = [
  {
    kind: 'title',
    title: 'Security Concepts & Threats',
    subtitle: 'The vocabulary of risk, the attacks you must recognize, and the defenses that stop them',
    notes:
      "Security is no longer a separate specialty that network engineers can ignore: every switch, router and access point is both a possible target and a place where defenses are enforced. This lesson builds the foundation for the whole security module. First you will learn the precise vocabulary Cisco uses — **asset, vulnerability, threat, exploit, risk and mitigation** — and the **CIA triad**. Then we walk through the attack families the exam expects you to recognize from a one-line description: reconnaissance, DoS and DDoS, reflection and amplification, spoofing, man-in-the-middle, malware, password attacks and social engineering. Finally we map each attack to the mitigation that defeats it and see where firewalls, IPS and endpoint security fit in a **defense-in-depth** design. This is exam topic 5.1 on CCNA v1.1 and part of domain 4 (Network Services and Security) on v2.0. Expect definition questions, drag-and-drop attack-to-mitigation matching, and scenario stems that describe an attack without naming it.",
  },
  {
    kind: 'bullets',
    title: 'Why security concepts matter',
    bullets: [
      'Every network device is a **target** and a **control point**',
      'Threats come from **outside** (Internet) and **inside** (users, insiders)',
      'Attackers need one gap; defenders must cover them all',
      'Most breaches start with **people** or **unpatched** systems',
      'Exam: recognize an attack from a short description',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'External attacker', x: 1, y: 1.3, tone: 'bad' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 3.6, y: 1.3 },
        { id: 'fw', icon: 'firewall', label: 'Edge firewall', x: 6.2, y: 1.3, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'Access switch', x: 8.8, y: 1.3 },
        { id: 'pc', icon: 'pc', label: 'Employee PC', x: 8.8, y: 3.8 },
        { id: 'ins', icon: 'user', label: 'Insider', sub: 'inside the perimeter', x: 6.2, y: 3.8, tone: 'bad' },
      ],
      links: [
        { from: 'att', to: 'net', style: 'dashed', tone: 'bad' },
        { from: 'net', to: 'fw' },
        { from: 'fw', to: 'sw' },
        { from: 'sw', to: 'pc' },
        { from: 'ins', to: 'sw', style: 'dashed', tone: 'bad' },
      ],
    },
    notes:
      "A common beginner assumption is that security is the firewall's job. In reality the firewall only sees traffic that crosses the perimeter. An **insider** — a careless employee, a contractor, or a laptop infected at home and plugged in on Monday — is already past it, which is why access switches need port security, DHCP snooping and 802.1X, and why routers need ACLs and hardened management access. Notice the asymmetry on this slide: an attacker needs to find **one** weakness, while defenders have to protect every path. That asymmetry is the reason for layered defenses, which we cover at the end of the deck. Statistically, most successful attacks begin with a human action (clicking a phishing link, reusing a password) or an unpatched vulnerability, not a clever zero-day. On the CCNA you will rarely be asked to configure anything in this lesson; instead you will be given a short scenario — ==an email that looks like it came from the CEO, a flood of traffic from thousands of IP addresses== — and asked to name the attack or pick the best mitigation.",
  },
  {
    kind: 'definitions',
    title: 'The vocabulary of risk',
    terms: [
      { term: '**Asset**', def: 'Anything of value to protect: data, devices, services, people, reputation.' },
      { term: '**Vulnerability**', def: 'A weakness that could be used to compromise an asset (bug, misconfiguration, human habit).' },
      { term: '**Threat**', def: 'Any potential danger to an asset — a threat actor or event that could exploit a vulnerability.' },
      { term: '**Exploit**', def: 'The actual tool, code or technique that takes advantage of a specific vulnerability.' },
      { term: '**Risk**', def: 'The likelihood that a threat exploits a vulnerability, combined with the impact if it does.' },
      { term: '**Mitigation**', def: 'A countermeasure that removes a vulnerability or reduces the likelihood or impact.' },
    ],
    notes:
      "Cisco tests these six terms directly, and the distractors are always the other five, so learn the distinctions precisely. A **vulnerability** is a weakness — an unpatched IOS bug, Telnet left enabled, a user who reuses passwords. A **threat** is the potential for harm: a threat actor (criminal group, disgruntled employee) or even an event such as a flood. An **exploit** is concrete: the script or technique that actually uses the vulnerability, such as code that triggers a **buffer overflow** in a vulnerable service. A vulnerability with no known exploit is still a vulnerability; when an exploit appears before a patch exists, it is called a **zero-day**. **Risk** combines likelihood and impact: an exposed web server with a public exploit is high risk; the same bug on an isolated lab router is low risk. **Mitigation** is what you do about it — patch, disable the service, filter with an ACL, add an IPS signature, or train users. Exam tip: if the stem says ==“a weakness”== the answer is vulnerability; if it says “a program that takes advantage of”, it is an exploit.",
  },
  {
    kind: 'diagram',
    title: 'How the terms connect',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'thr', label: 'Threat', sub: 'actor or event', shape: 'round', x: 1.2, y: 1.4 },
        { id: 'exp', label: 'Exploit', sub: 'tool or technique', x: 3.7, y: 1.4 },
        { id: 'vul', label: 'Vulnerability', sub: 'weakness', x: 6.2, y: 1.4, tone: 'accent' },
        { id: 'ast', label: 'Asset', sub: 'what we protect', x: 8.7, y: 1.4 },
        { id: 'mit', label: 'Mitigation', sub: 'patch, ACL, IPS, training', x: 6.2, y: 3.7, tone: 'good' },
        { id: 'rsk', label: 'Risk', sub: 'likelihood × impact', x: 8.7, y: 3.7, tone: 'warn' },
      ],
      edges: [
        { from: 'thr', to: 'exp', label: 'uses' },
        { from: 'exp', to: 'vul', label: 'targets' },
        { from: 'vul', to: 'ast', label: 'exposes' },
        { from: 'ast', to: 'rsk', label: 'value at stake' },
        { from: 'mit', to: 'vul', label: 'removes', tone: 'good' },
        { from: 'mit', to: 'rsk', label: 'lowers', tone: 'good', dashed: true },
      ],
    },
    caption: 'A threat uses an exploit against a vulnerability in an asset; mitigations break the chain.',
    notes:
      "Read the chain left to right with a concrete story. A ransomware gang (the **threat**) uses a publicly released script (the **exploit**) that abuses an unpatched remote-access service (the **vulnerability**) on a file server holding customer records (the **asset**). The **risk** is high because the exploit is public and the data is valuable. Now look at where mitigations act. **Patching** removes the vulnerability entirely, so the exploit no longer works. An **ACL** that allows the service only from the management subnet does not remove the bug, but it lowers the likelihood that the threat can reach it. **Backups** do not change likelihood at all, but they reduce the impact, and therefore the risk. This is why security people talk about reducing risk rather than eliminating it: you can rarely remove every threat (you cannot stop criminals from existing), but you can remove vulnerabilities and shrink likelihood and impact. Keep this model in mind when an exam question asks which action “eliminates the vulnerability” versus “reduces the risk”.",
  },
  {
    kind: 'table',
    title: 'The CIA triad',
    columns: ['Pillar', 'Means', 'Attacked by', 'Protected by'],
    rows: [
      ['**Confidentiality**', 'Only authorized parties can read data', 'Eavesdropping, MITM, data theft', 'Encryption (SSH, IPsec, TLS), ACLs, AAA'],
      ['**Integrity**', 'Data is not altered undetected', 'MITM modification, malware, spoofing', 'Hashing (SHA), digital signatures, HMAC'],
      ['**Availability**', 'Systems and data usable when needed', 'DoS, DDoS, ransomware', 'Redundancy, rate limiting, IPS, backups'],
    ],
    caption: 'Every attack in this lesson damages at least one pillar.',
    notes:
      "The **CIA triad** is the classic way to state what security is trying to achieve. **Confidentiality** means that data is readable only by those allowed to read it — a Telnet session sent in cleartext fails confidentiality because anyone capturing packets can read the password. **Integrity** means data cannot be changed without detection; a hash such as SHA-256 or an HMAC lets the receiver prove that a packet or file arrived exactly as sent. **Availability** means the service works when legitimate users need it; a DDoS attack does not steal anything, but it destroys availability. Use the triad to classify attacks: eavesdropping targets confidentiality, a man-in-the-middle who alters traffic targets integrity, and a SYN flood targets availability. Ransomware is interesting because it hits availability (your files are unusable) and often confidentiality too, since modern gangs also steal the data before encrypting it. On the exam, a question may describe a control such as “hashing” and ask which pillar it provides — ==hashing gives integrity, not confidentiality==.",
  },
  {
    kind: 'diagram',
    title: 'Reconnaissance: mapping the target',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'Attacker', x: 1, y: 2.5, tone: 'bad' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 3.6, y: 2.5 },
        { id: 'r', icon: 'router', label: 'Edge router', sub: '203.0.113.1', x: 6.2, y: 2.5 },
        { id: 'web', icon: 'server', label: 'Web server', sub: '203.0.113.10', x: 8.8, y: 1.2 },
        { id: 'dns', icon: 'server', label: 'DNS server', sub: '203.0.113.53', x: 8.8, y: 3.8 },
      ],
      links: [
        { from: 'att', to: 'net', label: 'ping sweep · port scan', style: 'dashed', tone: 'bad', arrow: 'forward' },
        { from: 'net', to: 'r' },
        { from: 'r', to: 'web' },
        { from: 'r', to: 'dns' },
      ],
      annotations: [{ x: 1.6, y: 4.3, text: 'Also: DNS lookups, whois, social media (OSINT)', tone: 'muted' }],
    },
    bullets: [
      '**Ping sweep**: which addresses are alive?',
      '**Port scan** (e.g. nmap): which TCP/UDP services listen?',
      'DNS queries, **whois**, public web and social media',
      'Goal: find targets and vulnerabilities before attacking',
    ],
    notes:
      "**Reconnaissance** is information gathering, and it almost always comes first. An attacker who knows nothing about your network starts with public sources: **whois** records reveal your registered address blocks and contacts, DNS lookups reveal host names such as vpn.example.com, and social media reveals employee names and job titles for later phishing. Active techniques follow. A **ping sweep** sends ICMP echo requests across a range to see which addresses respond. A **port scan** with a tool such as nmap probes TCP and UDP ports to learn which services are listening — finding TCP 23 open, for example, tells the attacker that Telnet is running and credentials may be sniffable. Banner grabbing can even reveal the software version, which maps directly to known vulnerabilities. Reconnaissance does not damage anything by itself, which is exactly why the exam likes it as a trick answer: ==it is the information-gathering phase that precedes an attack==. Mitigations include filtering unnecessary ICMP and ports at the edge with ACLs, disabling unused services, and using an IPS that detects scanning patterns.",
  },
  {
    kind: 'diagram',
    title: 'DoS and DDoS',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'Botmaster', sub: 'C2 commands', x: 1, y: 2.5, tone: 'bad' },
        { id: 'b1', icon: 'pc', label: 'Bot', x: 3.8, y: 0.9 },
        { id: 'b2', icon: 'iot', label: 'Bot', x: 3.8, y: 2.5 },
        { id: 'b3', icon: 'camera', label: 'Bot', x: 3.8, y: 4.1 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 6.3, y: 2.5 },
        { id: 'srv', icon: 'server', label: 'Victim server', x: 8.9, y: 2.5, tone: 'bad' },
      ],
      links: [
        { from: 'att', to: 'b1', style: 'dotted' },
        { from: 'att', to: 'b2', style: 'dotted' },
        { from: 'att', to: 'b3', style: 'dotted' },
        { from: 'b1', to: 'net', style: 'thick', tone: 'bad' },
        { from: 'b2', to: 'net', style: 'thick', tone: 'bad' },
        { from: 'b3', to: 'net', style: 'thick', tone: 'bad' },
        { from: 'net', to: 'srv', label: 'flood', style: 'thick', tone: 'bad', arrow: 'forward' },
      ],
    },
    bullets: [
      '**DoS**: one source exhausts bandwidth, CPU, memory or sessions',
      '**DDoS**: many sources at once — usually a **botnet**',
      'Example: **TCP SYN flood** fills the half-open connection table',
      'Target pillar: **availability**',
    ],
    notes:
      "A **denial-of-service** attack tries to make a service unavailable to legitimate users. It can do that by consuming bandwidth (a flood of packets), CPU (expensive requests), memory, or connection state. The classic example is the **TCP SYN flood**: the attacker sends SYN after SYN, often from spoofed source addresses, and never completes the three-way handshake. The server answers each one with a SYN-ACK and keeps a half-open entry, until its backlog is full and real clients cannot connect. A **distributed** DoS (DDoS) uses many sources at once. Attackers build **botnets** by infecting thousands of PCs, cameras and IoT devices with malware; a command-and-control (C2) server then tells every bot to attack the same target. Because the traffic arrives from thousands of legitimate-looking addresses, you cannot block a DDoS with one ACL entry. Defenses include rate limiting, IPS, TCP intercept or SYN cookies, and upstream scrubbing services from the ISP or a cloud provider. Exam wording: ==“multiple compromised hosts attacking one target” = DDoS==; one host = DoS.",
  },
  {
    kind: 'diagram',
    title: 'Reflection and amplification',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'Attacker', x: 1, y: 2.5, tone: 'bad' },
        { id: 'r1', icon: 'server', label: 'Open DNS resolver', sub: 'reflector', x: 5, y: 1 },
        { id: 'r2', icon: 'server', label: 'Public NTP server', sub: 'reflector', x: 5, y: 4 },
        { id: 'vic', icon: 'server', label: 'Victim', sub: '198.51.100.7', x: 9, y: 2.5, tone: 'bad' },
      ],
      links: [
        { from: 'att', to: 'r1', label: 'small query, src = victim', style: 'dashed', arrow: 'forward' },
        { from: 'att', to: 'r2', style: 'dashed', arrow: 'forward' },
        { from: 'r1', to: 'vic', label: 'large replies', style: 'thick', tone: 'bad', arrow: 'forward' },
        { from: 'r2', to: 'vic', style: 'thick', tone: 'bad', arrow: 'forward' },
      ],
    },
    caption: 'The reflectors are innocent: they answer the spoofed source address.',
    notes:
      "A **reflection** attack combines spoofing with an innocent third party. The attacker sends requests to a server — the **reflector** — with the source IP address forged to be the **victim's** address. The reflector does exactly what it should and replies to the source, so the victim is flooded with replies it never asked for, and the traffic appears to come from legitimate servers rather than from the attacker. An **amplification** attack is a reflection attack in which the reply is much larger than the request. UDP services are ideal because there is no handshake to verify the source: a tiny DNS query can trigger a large response, and older NTP servers could be asked for long lists of recent clients. With many reflectors, a modest attacker bandwidth becomes an overwhelming flood at the victim — a form of DDoS. Mitigations work at both ends: ISPs and enterprises should apply **ingress filtering** so packets with spoofed source addresses never leave their networks, and server owners should not run **open resolvers** or unnecessary UDP services. Exam key: ==reflection needs a spoofed source; amplification adds a bigger reply==.",
  },
  {
    kind: 'bullets',
    title: 'Spoofing: forging an identity',
    bullets: [
      '**IP spoofing**: forged source IP — hides attacker, enables reflection',
      '**MAC spoofing**: copy a trusted MAC to bypass MAC-based controls',
      '**DHCP spoofing**: rogue server hands out a malicious default gateway',
      '**DHCP starvation**: spoofed MACs drain the real pool (DoS)',
      'Mitigate: ingress ACLs, port security, **DHCP snooping**, 802.1X',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'Client', sub: 'DHCP Discover', x: 1.2, y: 2 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'real DHCP server', x: 8.8, y: 2, tone: 'good' },
        { id: 'rog', icon: 'attacker', label: 'Rogue DHCP', sub: 'gateway = itself', x: 5, y: 4.1, tone: 'bad' },
      ],
      links: [
        { from: 'pc', to: 'sw', fromLabel: 'Fa0', toLabel: 'Fa0/1' },
        { from: 'sw', to: 'r1', fromLabel: 'G0/1', label: 'trusted' },
        { from: 'rog', to: 'sw', fromLabel: 'Fa0', toLabel: 'Fa0/9', tone: 'bad', label: 'untrusted' },
      ],
    },
    notes:
      "**Spoofing** means pretending to be someone else by forging an identifier. With **IP spoofing** the attacker writes a false source address into the IP header; replies go to the forged address, so this is used for DoS and reflection rather than for two-way conversations. **MAC spoofing** copies the MAC address of a trusted device, for example to defeat a MAC-based filter or to impersonate a printer. **DHCP spoofing** is more dangerous: a rogue DHCP server on the LAN answers client Discover messages, often faster than the real server, and hands out its own address as the **default gateway** or DNS server. Every packet the victim sends off-subnet now passes through the attacker — a man-in-the-middle. A related attack, **DHCP starvation**, sends thousands of Discovers with random spoofed MACs to exhaust the legitimate pool, causing a DoS and clearing the way for a rogue server. The Layer 2 security lesson configures the fixes: **DHCP snooping** allows server messages only from trusted ports, port security limits MACs per port, and 802.1X authenticates the device before it gets access.",
  },
  {
    kind: 'diagram',
    title: 'Man-in-the-middle with ARP poisoning',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC-A 10.1.1.10', icon: 'pc' },
        { id: 'att', label: 'Attacker 10.1.1.66', icon: 'attacker' },
        { id: 'gw', label: 'R1 gateway 10.1.1.1', icon: 'router' },
      ],
      steps: [
        { from: 'att', to: 'pc', label: 'Unsolicited ARP reply', sub: '10.1.1.1 is at the attacker MAC', tone: 'bad' },
        { from: 'att', to: 'gw', label: 'Unsolicited ARP reply', sub: '10.1.1.10 is at the attacker MAC', tone: 'bad' },
        { note: 'Both ARP caches are now poisoned' },
        { from: 'pc', to: 'att', label: 'Traffic meant for the gateway', sub: 'framed to the attacker MAC' },
        { from: 'att', to: 'gw', label: 'Relayed after reading or changing it', tone: 'accent' },
        { note: 'Fix: Dynamic ARP Inspection checks ARP against DHCP snooping bindings', tone: 'good' },
      ],
    },
    notes:
      "In a **man-in-the-middle** (MITM) attack the attacker places itself between two parties that believe they are talking directly, so it can eavesdrop on (confidentiality) or modify (integrity) the conversation. On a LAN the easiest way is **ARP poisoning**, also called ARP spoofing. ARP has no authentication, and hosts accept unsolicited ARP replies (gratuitous ARPs) and overwrite their caches. The attacker tells PC-A that the gateway's IP maps to the attacker's MAC, and tells the gateway that PC-A's IP maps to the attacker's MAC. From then on, frames in both directions are switched to the attacker, who forwards them on so that nobody notices an outage. The attacker can capture cleartext credentials from Telnet, HTTP or FTP, or alter data in transit. Two mitigations matter for the CCNA. **Dynamic ARP Inspection (DAI)** on the switch drops ARP messages whose IP-to-MAC pairing does not match the DHCP snooping binding table. **Encryption** (SSH, HTTPS, IPsec) means that even a successful MITM sees only ciphertext. ==ARP poisoning → DAI== is a favorite drag-and-drop pairing.",
  },
  {
    kind: 'table',
    title: 'Malware families',
    columns: ['Type', 'How it spreads', 'Key trait'],
    rows: [
      ['**Virus**', 'Attached to a file or program; spreads when users run or share it', 'Needs a **host file** and user action'],
      ['**Worm**', 'Self-propagates across the network by exploiting vulnerabilities', '**No user action** needed; spreads fast'],
      ['**Trojan horse**', 'Disguised as legitimate software the user installs', 'Does not self-replicate; often opens a backdoor'],
      ['**Ransomware**', 'Via phishing, trojans or worms', 'Encrypts data and demands payment'],
      ['Spyware / keylogger', 'Bundled or dropped by other malware', 'Silently collects keystrokes and data'],
    ],
    notes:
      "**Malware** is any malicious software, and the exam distinguishes the types by how they spread. A **virus** inserts itself into a legitimate file or program and runs when that host program runs, so it depends on a person opening, running or sharing the infected file. A **worm** is a standalone program that copies itself from system to system by exploiting a network-reachable vulnerability — no user interaction required — which is why worms can infect huge numbers of hosts in hours. A **trojan horse** looks like something useful (a free game, a cracked tool, a fake update) and the user installs it willingly; it does not replicate but typically installs a backdoor or downloads more malware. **Ransomware** encrypts files and demands payment for the key; it arrives by any of the other routes, and some famous outbreaks combined ransomware with worm-like spreading. Mitigations: patching removes the vulnerabilities worms rely on, endpoint anti-malware detects known and suspicious files, least privilege limits damage, user training stops trojans, and ==offline backups== defeat ransomware. Exam cue: “spreads without user interaction” means worm.",
  },
];
