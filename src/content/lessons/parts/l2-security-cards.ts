import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Port security: default maximum', back: '**1** secure MAC address per port.' },
  { id: 'f2', front: 'Port security: default violation mode', back: '**shutdown** — the port is err-disabled on the first violation.' },
  { id: 'f3', front: 'Prerequisite for `switchport port-security`', back: 'The port must be a **static** access (or trunk) port. On a dynamic DTP port IOS replies "Command rejected: … is a dynamic port".' },
  { id: 'f4', front: 'Sticky secure MAC address', back: 'Learned dynamically, then written to the **running-config** as `switchport port-security mac-address sticky H.H.H`. Save the config to keep it after a reload.' },
  { id: 'f5', front: 'Violation mode `protect`', back: 'Drops frames from unauthorized MACs silently: no syslog, no SNMP trap, **no counter increase**. The port stays up.' },
  { id: 'f6', front: 'Violation mode `restrict`', back: 'Drops unauthorized frames, sends **syslog + SNMP trap** and increments the violation counter. The port stays up.' },
  { id: 'f7', front: 'Violation mode `shutdown`', back: 'Puts the port in the **err-disabled** state (Secure-shutdown), logs, sends a trap and increments the counter. Needs recovery.' },
  { id: 'f8', front: 'Two events that cause a port-security violation', back: 'A new source MAC arrives when the maximum is already reached, or a MAC secured on one port appears on another secure port in the same VLAN.' },
  { id: 'f9', front: 'Manually recover an err-disabled port', back: 'Remove the cause, then enter `shutdown` followed by `no shutdown` on the interface.' },
  { id: 'f10', front: 'Automatic err-disable recovery for port security', back: '`errdisable recovery cause psecure-violation`; default interval **300 seconds** (`errdisable recovery interval`).' },
  { id: 'f11', front: 'Port Status values in `show port-security interface`', back: '`Secure-up` (working), `Secure-down` (link down), `Secure-shutdown` (err-disabled by a violation).' },
  { id: 'f12', front: 'Port security aging default', back: 'Aging time **0** — secure addresses never age out; aging type absolute.' },
  { id: 'f13', front: 'MAC flooding', back: 'Frames from thousands of random source MACs fill the **CAM table**, so the switch floods unknown-unicast frames out every port in the VLAN. Mitigation: port security.' },
  { id: 'f14', front: 'DHCP snooping: default port state', back: '**Untrusted** — every port, until `ip dhcp snooping trust` is configured on it.' },
  { id: 'f15', front: 'DHCP messages dropped on an untrusted port', back: 'Server messages **DHCPOFFER, DHCPACK and DHCPNAK**, plus RELEASE or DECLINE messages that do not match the port in the binding table.' },
  { id: 'f16', front: 'Commands that enable DHCP snooping', back: '`ip dhcp snooping` **and** `ip dhcp snooping vlan X` — both global, both required.' },
  { id: 'f17', front: 'DHCP snooping binding table fields', back: 'Client MAC, IP address, lease time, type, VLAN and interface — `show ip dhcp snooping binding`.' },
  { id: 'f18', front: '`ip dhcp snooping limit rate 10`', back: 'Allows 10 DHCP packets per second on the port; exceeding it err-disables the port (cause `dhcp-rate-limit`). No limit by default.' },
  { id: 'f19', front: 'Clients get no address right after enabling snooping (IOS DHCP server, uplink trusted)', back: 'Option 82 is inserted with giaddr 0.0.0.0 and the server drops it. Fix: `no ip dhcp snooping information option`.' },
  { id: 'f20', front: 'What does DAI validate ARP messages against?', back: 'The **DHCP snooping binding table**, plus any ARP ACLs (which are checked first).' },
  { id: 'f21', front: 'DAI default rate limit on untrusted ports', back: '**15** ARP packets per second; exceeding it err-disables the port (cause `arp-inspection`). Trusted ports have no limit.' },
  { id: 'f22', front: '`ip arp inspection validate src-mac dst-mac ip`', back: 'Optional checks: Ethernet vs ARP sender MAC, Ethernet vs ARP target MAC (replies), and invalid IPs. List all in one command — each command replaces the previous one.' },
  { id: 'f23', front: 'Let a static-IP host pass DAI', back: '`arp access-list NAME` → `permit ip host A.B.C.D mac host H.H.H`, then `ip arp inspection filter NAME vlan X`.' },
  { id: 'f24', front: '`storm-control broadcast level 20.00 10.00`', back: 'Blocks broadcasts when they exceed **20%** of the port bandwidth, until they fall below **10%**.', tags: ['v2.0'] },
  { id: 'f25', front: 'Storm control: default action and options', back: 'Default: **filter** the excess traffic. `storm-control action shutdown` err-disables the port; `storm-control action trap` sends an SNMP trap.', tags: ['v2.0'] },
  { id: 'f26', front: 'IPv6 RA guard', back: 'Drops Router Advertisements (ICMPv6 type 134) entering ports whose policy says `device-role host`; applied with `ipv6 nd raguard attach-policy`.', tags: ['v2.0'] },
  { id: 'f27', front: 'Switch spoofing', back: 'The attacker negotiates a trunk with DTP on a dynamic port. Mitigation: `switchport mode access` + `switchport nonegotiate`.' },
  { id: 'f28', front: 'Double tagging', back: 'A frame with two 802.1Q tags: the outer (native VLAN) tag is removed at the first trunk and the inner tag delivers it to another VLAN. One-way. Mitigation: unused native VLAN or `vlan dot1q tag native`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'What is the default port-security violation mode?',
    options: ['protect', 'restrict', 'shutdown', 'drop'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**Shutdown** is the default: the first violation err-disables the port. Protect and restrict must be configured explicitly with `switchport port-security violation`, and there is no violation mode called drop.',
  },
  {
    id: 'q2',
    type: 'input',
    stem: 'After `switchport port-security` is entered on an access port with no other port-security options, how many secure MAC addresses may the port use?',
    answers: ['1', 'one'],
    placeholder: 'number',
    difficulty: 1,
    explanation:
      'The default maximum is **1**. Raise it with `switchport port-security maximum N`, for example when a PC and a second device share the port.',
  },
  {
    id: 'q3',
    type: 'match',
    stem: 'Match each port-security keyword to its effect.',
    pairs: [
      { left: '`protect`', right: 'Drops offending frames silently; counter unchanged' },
      { left: '`restrict`', right: 'Drops offending frames, logs them and increments the counter' },
      { left: '`shutdown`', right: 'Err-disables the whole port' },
      { left: '`sticky`', right: 'Writes learned MACs into the running-config' },
    ],
    difficulty: 1,
    explanation:
      'Protect is silent, restrict reports and counts, and shutdown (the default) err-disables the port. Sticky is not a violation mode: it controls how secure addresses are learned and stored.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two statements about sticky secure MAC addresses are true? (Choose two.)',
    options: [
      'They are learned dynamically from traffic on the port',
      'They are added to the running-config automatically',
      'They are saved to NVRAM automatically',
      'They must be typed in manually by the administrator',
      'They age out after 300 seconds by default',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Sticky addresses are **learned** like dynamic ones and then **written to the running-config**. They reach NVRAM only when the configuration is saved; manually typed addresses are static secure addresses; and port-security aging is disabled by default.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'DHCP snooping is enabled for the VLAN and Fa0/5 is untrusted. Which message arriving on Fa0/5 is dropped?',
    options: ['DHCPDISCOVER', 'DHCPREQUEST', 'DHCPOFFER', 'ARP request'],
    answer: 2,
    difficulty: 2,
    explanation:
      'Untrusted ports drop **server** messages such as DHCPOFFER, because no legitimate server sits behind an access port. DISCOVER and REQUEST are client messages and are allowed; ARP is not examined by DHCP snooping at all (that is DAI\'s job).',
  },
  {
    id: 'q6',
    type: 'input',
    stem: 'Which interface command marks the uplink toward the legitimate DHCP server as trusted for DHCP snooping?',
    answers: ['ip dhcp snooping trust'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`ip dhcp snooping trust` makes the port trusted, so OFFERs and ACKs from the real server are accepted. DAI has its own separate trust command, `ip arp inspection trust`.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Dynamic ARP Inspection validates ARP messages on untrusted ports against ARP ACLs and which other source of information?',
    options: ['The switch CAM table', 'The DHCP snooping binding table', "The router's ARP cache", 'The port-security address table'],
    answer: 1,
    difficulty: 2,
    explanation:
      'DAI checks that each sender IP/MAC pair matches a **DHCP snooping binding** for that port and VLAN. The CAM table maps MACs to ports but knows nothing about IP addresses, the switch cannot see a router\'s ARP cache, and port security tracks MACs only.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Which feature prevents a host on an access port from sending rogue IPv6 router advertisements?',
    options: ['Dynamic ARP Inspection', 'Storm control', 'DHCPv6 guard', 'IPv6 RA guard'],
    answer: 3,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      '**RA guard** drops router advertisements that enter ports whose policy role is host. DAI validates IPv4 ARP, storm control limits floods of broadcast or multicast traffic, and DHCPv6 guard blocks rogue DHCPv6 server messages rather than RAs.',
  },
];
