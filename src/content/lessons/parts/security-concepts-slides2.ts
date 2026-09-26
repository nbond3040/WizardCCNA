import type { Slide } from '../../types';

export const slidesB: Slide[] = [
  {
    kind: 'bullets',
    title: 'Password attacks',
    bullets: [
      '**Guessing**: defaults and obvious choices (`cisco`, `admin`, company name)',
      '**Dictionary attack**: tries every entry in a wordlist of likely passwords',
      '**Brute force**: tries every possible combination — slow but exhaustive',
      'Online (live logins) vs **offline** (cracking stolen hashes)',
      'Credential reuse lets one leak unlock many systems',
      'Mitigate: long passphrases, **MFA**, lockout (`login block-for`), strong hashes',
    ],
    notes:
      "Passwords are the most attacked control because they are the most common one. **Guessing** tries defaults and obvious values — a router still using `cisco` as its enable password falls in seconds. A **dictionary attack** automates guessing with a wordlist of common passwords, leaked passwords and simple variations such as `Summer2026!`. A **brute-force attack** tries every possible combination of characters; it is guaranteed to succeed eventually, so the defense is to make “eventually” impossibly long, and **length** grows the search space much faster than complexity rules do. Attacks can be **online**, against a live login prompt, or **offline**, against password hashes stolen from a configuration or database — which is why weak IOS type 7 or unsalted hashes are dangerous even when the device itself is locked down. Mitigations: enforce long passphrases, add **multifactor authentication** so a stolen password alone is useless, lock out or slow down repeated failures (IOS `login block-for 120 attempts 3 within 60`), store only strong hashes such as type 8 or 9, and centralize accounts with AAA. The password-policy lesson covers these controls in depth.",
  },
  {
    kind: 'table',
    title: 'Social engineering: attacking people',
    columns: ['Attack', 'Channel', 'Trick'],
    rows: [
      ['**Phishing**', 'Email (mass)', 'Fake message lures many users to a link or attachment'],
      ['**Spear phishing**', 'Email (targeted)', 'Personalized for a specific person or group'],
      ['**Whaling**', 'Email (targeted)', 'Spear phishing aimed at **executives**'],
      ['**Vishing**', 'Voice / phone', 'Caller poses as help desk, bank or vendor'],
      ['**Smishing**', 'SMS text', 'Text message with a malicious link or request'],
      ['**Pharming**', 'DNS / hosts file', 'Redirects a real URL to a fake site'],
      ['**Watering hole**', 'Website', 'Infects a site the target group visits often'],
      ['**Pretexting**', 'Any', 'Invented scenario builds trust to extract information'],
      ['**Tailgating**', 'Physical', 'Follows an authorized person through a secure door'],
    ],
    notes:
      "**Social engineering** manipulates people into breaking security for the attacker, and no firewall rule can stop an employee who willingly types a password into a fake page. The exam distinguishes the variants by **channel** and **target**. **Phishing** is broad: one fraudulent email sent to thousands of recipients. **Spear phishing** is researched and personalized — it uses the victim's name, manager and current projects, often gathered during reconnaissance. **Whaling** is spear phishing aimed at senior executives, the “big fish” who can approve payments. **Vishing** uses voice calls and **smishing** uses SMS text messages. **Pharming** does not need a click on a bad link at all: it poisons DNS or a hosts file so that typing the correct URL still lands on a fake site. A **watering hole** attack compromises a website that the target group trusts and visits often. **Pretexting** builds a believable story (“I'm from IT and need to verify your account”), and **tailgating** (piggybacking) is the physical version: walking in behind someone who badged through a door. The mitigation for all of them is ==user awareness and training==, backed by verification procedures and MFA.",
  },
  {
    kind: 'table',
    title: 'Mapping attacks to mitigations',
    columns: ['Attack', 'Primary mitigations'],
    rows: [
      ['Reconnaissance', 'Edge ACLs, disable unused services, IPS scan detection'],
      ['DoS / DDoS', 'Rate limiting, IPS, ISP or cloud scrubbing, redundancy'],
      ['Reflection / amplification', 'Anti-spoofing ingress filtering, no open resolvers'],
      ['IP spoofing', 'Ingress ACLs (RFC 2827 / BCP 38), uRPF'],
      ['MAC spoofing / MAC flooding', '**Port security**, 802.1X'],
      ['DHCP spoofing / starvation', '**DHCP snooping** (trusted ports, rate limits)'],
      ['ARP poisoning (MITM)', '**Dynamic ARP Inspection**, encryption'],
      ['Malware (virus, worm, trojan, ransomware)', '**Patching**, endpoint security, NGFW/IPS, backups'],
      ['Password attacks', 'Strong policy, **MFA**, lockout, AAA'],
      ['Social engineering', '**User awareness and training**, verification'],
      ['Eavesdropping', '**Encryption**: SSH, HTTPS, IPsec'],
    ],
    notes:
      "This table is the heart of the lesson and the source of the classic drag-and-drop question. The trick is to match the control to the **mechanism** the attack depends on. Spoofing depends on forged source addresses, so filter packets whose source cannot legitimately arrive on that interface — **ingress ACLs** following BCP 38, or Unicast Reverse Path Forwarding (uRPF), which checks that the source is reachable back through the arrival interface. Rogue DHCP depends on server messages arriving on access ports, so **DHCP snooping** trusts only uplinks. ARP poisoning depends on unauthenticated ARP, so **DAI** validates it. Worms depend on unpatched vulnerabilities, so **patching** removes their path. Password attacks depend on the password being the only factor, so **MFA** breaks them. Social engineering depends on people, so the fix is **training**. Eavesdropping depends on cleartext, so **encryption** defeats it. Notice that AAA appears as a mitigation for password and access abuse, and that an IPS helps against many attacks because it recognizes attack signatures. When a question offers several good controls, choose the one that addresses ==the specific mechanism named in the stem==.",
  },
  {
    kind: 'diagram',
    title: 'Defense in depth',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Layers of defense',
          layers: [
            { label: 'Policies and people', sub: 'security policy, awareness, training' },
            { label: 'Physical', sub: 'badges, locks, secured wiring closets' },
            { label: 'Perimeter', sub: 'firewall / NGFW, VPN termination', tone: 'accent' },
            { label: 'Network', sub: 'ACLs, IPS, segmentation, Layer 2 security' },
            { label: 'Endpoint', sub: 'anti-malware, host firewall, patching' },
            { label: 'Application and access', sub: 'AAA, MFA, least privilege' },
            { label: 'Data', sub: 'encryption, integrity checks, backups' },
          ],
        },
      ],
    },
    caption: 'No single control is trusted to stop everything.',
    notes:
      "**Defense in depth** means layering independent controls so that when one fails — and eventually one will — the next still protects the asset. Imagine a phishing email that slips past the email filter (layer one fails). The user clicks the link, but **training** makes them suspicious, or the **NGFW's URL filtering** blocks the known-bad domain. If the malware still downloads, **endpoint security** may quarantine it. If it runs, **segmentation** with VLANs and ACLs limits what it can reach, **least privilege** limits what the stolen account can do, and **encrypted, backed-up data** limits the damage. Each layer covers weaknesses of the others: a firewall cannot stop an insider, training cannot stop a worm, and patching cannot stop a stolen password. The model also includes non-technical layers — written **security policy** and **physical** security — which the next lesson covers as security program elements. On the exam, “defense in depth” or “layered security” is the correct answer whenever a question asks for the design principle of using multiple, overlapping security mechanisms rather than relying on a single device.",
  },
  {
    kind: 'diagram',
    title: 'Where the security devices sit',
    diagram: {
      type: 'topology',
      width: 12,
      height: 6,
      nodes: [
        { id: 'net', icon: 'internet', label: 'Internet', x: 1.2, y: 3 },
        { id: 'fw', icon: 'firewall', label: 'NGFW', sub: 'stateful + AVC + IPS', x: 3.8, y: 3, tone: 'accent' },
        { id: 'web', icon: 'server', label: 'Web server', x: 3.8, y: 5.1 },
        { id: 'ips', icon: 'ips', label: 'IPS', sub: 'inline', x: 6.3, y: 3 },
        { id: 'core', icon: 'l3switch', label: 'Core', x: 8.6, y: 3 },
        { id: 'ise', icon: 'server', label: 'ISE', sub: 'AAA, posture', x: 8.6, y: 1 },
        { id: 'pc', icon: 'laptop', label: 'Endpoint', sub: 'anti-malware', x: 10.8, y: 3 },
      ],
      links: [
        { from: 'net', to: 'fw', label: 'outside' },
        { from: 'fw', to: 'web' },
        { from: 'fw', to: 'ips', label: 'inside' },
        { from: 'ips', to: 'core' },
        { from: 'core', to: 'ise' },
        { from: 'core', to: 'pc' },
      ],
      groups: [
        { label: 'Outside', x: 0.2, y: 1.6, w: 2.1, h: 2.8, tone: 'bad' },
        { label: 'DMZ', x: 2.7, y: 4.3, w: 2.2, h: 1.6, tone: 'warn' },
        { label: 'Inside (trusted)', x: 5.2, y: 0.2, w: 6.6, h: 4.1, tone: 'good' },
      ],
    },
    bullets: [
      '**Firewall** separates zones: outside, DMZ, inside',
      '**DMZ** hosts public servers, isolated from inside',
      '**IPS** inspects permitted traffic inline',
      '**Endpoint** software protects the host itself',
    ],
    notes:
      "This drawing shows a typical enterprise edge. The **firewall** divides the network into **security zones** with different trust levels: the untrusted **outside** (Internet), the trusted **inside**, and a **DMZ** (demilitarized zone) for servers that must be reachable from the Internet, such as a public web server. The policy usually allows inside users to start sessions outward, allows the Internet to reach only specific DMZ services, and blocks the Internet from starting sessions to the inside. If the web server is compromised, the attacker is still in the DMZ and must get through the firewall again to reach inside hosts. An **IPS** sits inline behind (or inside) the firewall and looks deeper into the traffic the firewall already allowed. On the inside, **Cisco ISE** provides AAA and can check a device's posture before granting access, and **endpoint security** on each laptop is the last line of defense — it is the only layer that still protects the laptop on a hotel Wi-Fi network, far from the corporate firewall. Modern **NGFWs** often combine firewall and IPS functions in one appliance.",
  },
  {
    kind: 'compare',
    title: 'Firewall vs IPS',
    left: {
      heading: 'Stateful firewall',
      bullets: [
        'Filters by zone, address, port and **session state**',
        'Tracks connections; permits **return traffic** automatically',
        'Blocks sessions started from outside unless allowed',
        'Question it answers: **should** this flow exist?',
      ],
    },
    right: {
      heading: 'IPS',
      tone: 'accent',
      bullets: [
        'Sits **inline** and inspects packet contents',
        'Matches **signatures** of known attacks and anomalies',
        'Drops malicious packets in real time',
        'Question it answers: is this allowed flow **malicious**?',
        'An **IDS** only receives a copy and raises alerts',
      ],
    },
    notes:
      "Firewalls and intrusion prevention systems are complementary, and the exam checks that you know which does what. A **stateful firewall** makes access decisions from header information — zones, IP addresses, protocols and ports — plus the **state** of each connection. When an inside host opens a TCP session to a web server, the firewall records it, so the server's replies are allowed back in without a separate permit rule, while an unsolicited packet from outside matches no session and is dropped. What a firewall does not do, in its traditional form, is judge whether the contents of an allowed flow are an attack: a worm exploit sent to TCP 443 on a permitted server looks like any other HTTPS connection. That is the **IPS's** job. It sits inline, compares traffic against a **signature database** of known attacks (plus anomaly rules), and drops matching packets before they reach the target. An **IDS** does the same analysis on a mirrored copy of the traffic, so it can only alert, not block. Signatures must be updated constantly, which is why Cisco devices subscribe to threat intelligence such as Talos.",
  },
  {
    kind: 'diagram',
    title: 'Stateful filtering in action',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'Inside host 10.1.1.10', icon: 'pc' },
        { id: 'fw', label: 'Firewall', icon: 'firewall' },
        { id: 'srv', label: 'Web server 203.0.113.10', icon: 'server' },
        { id: 'att', label: 'Outside attacker', icon: 'attacker' },
      ],
      steps: [
        { from: 'pc', to: 'fw', label: 'TCP SYN to 203.0.113.10:443' },
        { from: 'fw', to: 'srv', label: 'Permitted by policy', sub: 'session added to the state table' },
        { from: 'srv', to: 'fw', label: 'SYN-ACK (return traffic)' },
        { from: 'fw', to: 'pc', label: 'Matches a known session: allowed', tone: 'good' },
        { from: 'att', to: 'fw', label: 'Unsolicited SYN to 10.1.1.10', tone: 'bad' },
        { note: 'No session and no permit rule: dropped', tone: 'bad' },
      ],
    },
    notes:
      "This sequence shows why stateful inspection is so much more practical than static packet filtering. When the inside host sends a SYN to the web server, the firewall checks its policy, permits the flow, and writes an entry into its **state table**: source and destination addresses, ports, protocol and TCP state. The server's SYN-ACK arrives on the outside interface, but because it matches an existing session the firewall allows it without any explicit inbound rule. When the conversation ends (FIN/RST or an idle timeout), the entry is removed. Now compare the attacker's unsolicited SYN aimed at the same inside host: there is no matching session and no rule permitting outside-initiated connections to the inside, so it is dropped. A plain router ACL cannot remember sessions; to allow return traffic it needs broad rules (for example permitting anything to high port numbers), which attackers can abuse. That is why a firewall is placed at the Internet edge even when routers already have ACLs. Remember: ==stateful = remembers sessions and allows the return traffic automatically==.",
  },
  {
    kind: 'bullets',
    title: 'Next-generation firewalls and endpoints',
    bullets: [
      '**NGFW**: stateful firewall + **Application Visibility and Control** (AVC)',
      'Adds URL filtering, integrated **NGIPS** and advanced malware protection',
      '**NGIPS**: context-aware; uses reputation and threat intelligence (Cisco **Talos**)',
      '**Endpoint security**: anti-malware, host firewall, disk encryption',
      'Cisco Secure Endpoint (formerly AMP for Endpoints) tracks file behavior',
      'Posture checks (e.g. ISE) keep unhealthy hosts off the network',
    ],
    notes:
      "Traditional firewalls identify applications by port numbers, but modern applications all run over TCP 443, so a port-based rule cannot tell a business application from a file-sharing tool. A **next-generation firewall** such as Cisco Secure Firewall adds **Application Visibility and Control (AVC)**, which identifies the actual application regardless of port, **URL filtering** by category and reputation, an integrated **next-generation IPS**, and **advanced malware protection** that checks files against cloud intelligence. A **next-generation IPS** improves on signature matching with context: it knows which hosts, operating systems and applications exist on your network, so it can rank an attack against a vulnerable Windows server higher than the same attack against a Linux host it cannot affect, and it can block traffic from addresses with a bad reputation. Both rely on threat intelligence feeds — Cisco's research group is **Talos**. On the host, **endpoint security** combines anti-malware, a host-based firewall, encryption and behavior monitoring; Cisco Secure Endpoint can even trace where a malicious file went after it was first seen. With 802.1X and **ISE posture**, a laptop without current protection can be quarantined before it joins the LAN.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Identify the attack from its **mechanism**, then pick the control that breaks that mechanism.',
    bullets: [
      'Weakness = **vulnerability**; the tool that uses it = **exploit**',
      'Many sources = **DDoS**; spoofed source + third-party replies = **reflection**',
      'A **worm** spreads without user action; a virus needs a host file',
      'Whaling = executives · vishing = voice · smishing = SMS',
      'Tailgating is **physical**; pharming redirects DNS',
      'ARP poisoning → **DAI**; rogue DHCP → **DHCP snooping**',
      '**IDS** alerts on a copy; **IPS** sits inline and drops',
    ],
    notes:
      "These are the traps that catch prepared candidates. The first is vocabulary: Cisco will offer threat, vulnerability and exploit as three options for the same stem, so anchor on the key word — a weakness, a potential danger, or the thing that takes advantage. Second, DoS versus DDoS versus reflection: count the sources and ask whether a third party is replying to a forged address. Third, malware: worm means self-propagating with no user interaction; trojan means it pretends to be legitimate; virus means it rides inside another file. Fourth, the social-engineering family is distinguished by channel (email, voice, SMS, web, physical) and by target (everyone, a specific person, executives). Fifth, Layer 2 mitigations are paired precisely: DAI for ARP, DHCP snooping for rogue DHCP, port security for MAC flooding and spoofing. Sixth, an IDS is passive and cannot drop packets; an IPS is inline and can. Finally, remember that training is the answer for human attacks — ==no technical control is the primary mitigation for social engineering==.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Asset, vulnerability, threat, exploit, risk, mitigation — know each precisely',
      '**CIA**: confidentiality (encryption), integrity (hashing), availability (redundancy)',
      'Attacks: recon, DoS/DDoS, reflection, spoofing, MITM, malware, passwords, people',
      'Every attack has a matching mitigation — learn the pairs',
      'Stateful firewall, IPS, endpoint security and AAA work as **layers**',
      '**Defense in depth**: assume any single control can fail',
    ],
    notes:
      "Let's pull the lesson together. You now have the vocabulary: an **asset** has **vulnerabilities**; **threats** use **exploits** against them; **risk** is likelihood times impact; **mitigations** remove vulnerabilities or reduce likelihood and impact. You can classify any attack by the CIA pillar it damages. You can recognize the attack families from a description — reconnaissance gathers information, DoS and DDoS attack availability, reflection and amplification bounce spoofed requests off innocent servers, spoofing forges identities, MITM intercepts conversations (ARP poisoning and rogue DHCP on a LAN), malware spreads in distinct ways, password attacks guess or crack credentials, and social engineering attacks people through email, phone, text, web and physical access. You know the matching mitigations and where firewalls, IPS, NGFWs, endpoint security and ISE sit in a layered design. The following lessons turn these ideas into practice: security program elements, password policy and MFA, AAA with RADIUS and TACACS+, device management access, ACLs, Layer 2 security and VPNs. Review the flashcards next, then take the quiz.",
  },
];
