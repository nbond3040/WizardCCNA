import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Numbered extended IPv4 ACL ranges', back: '**100–199** and the expanded range **2000–2699**. (Standard ACLs use 1–99 and 1300–1999.)' },
  { id: 'f2', front: 'Where should an extended ACL be placed?', back: 'As **close to the source** as possible — normally inbound on the interface nearest the source — so unwanted packets never cross the network.' },
  { id: 'f3', front: 'Field order in an extended ACE', back: 'Action → protocol → source + wildcard → [source port] → destination + wildcard → [destination port] → options such as `established` and `log`.' },
  { id: 'f4', front: 'Which protocol keywords accept port operators?', back: 'Only `tcp` and `udp`. `ip`, `icmp`, `ospf` and `eigrp` have no ports.' },
  { id: 'f5', front: 'IP protocol numbers of TCP, UDP and ICMP', back: 'TCP **6**, UDP **17**, ICMP **1**.' },
  { id: 'f6', front: 'IP protocol numbers of OSPF and EIGRP', back: 'OSPF **89**, EIGRP **88**. Permit them with `permit ospf …` or `permit eigrp …` — they have no ports.' },
  { id: 'f7', front: '`gt 1023`', back: 'Ports **1024–65535**. `gt` excludes the value itself.' },
  { id: 'f8', front: '`lt 1024`', back: 'Ports **0–1023** (the well-known ports). `lt` excludes the value itself.' },
  { id: 'f9', front: '`range 20 25`', back: 'Ports 20 through 25 **inclusive** — both ends are matched.' },
  { id: 'f10', front: '`neq 23`', back: 'Every port **except** 23 (Telnet).' },
  { id: 'f11', front: 'A port condition written right after the source address', back: 'Tests the **source port**. A condition after the destination address tests the destination port.' },
  { id: 'f12', front: '`established` keyword', back: 'Matches TCP segments with the **ACK or RST** bit set, so a new connection\'s first SYN does not match. TCP only; not stateful.' },
  { id: 'f13', front: 'IOS port keywords `www`, `domain`, `telnet`', back: '`www` = TCP 80, `domain` = port 53 (UDP or TCP), `telnet` = TCP 23.' },
  { id: 'f14', front: 'IOS port keywords `bootps` and `bootpc`', back: 'UDP **67** (DHCP server) and UDP **68** (DHCP client).' },
  { id: 'f15', front: 'Default ACL sequence numbering', back: 'The first entry is **10** and each new entry adds **10**. An entry typed without a number goes to the end, 10 higher than the last one.' },
  { id: 'f16', front: 'Insert an entry between sequence numbers 20 and 30 of ACL LAN1-IN', back: '`ip access-list extended LAN1-IN`, then type the entry with a number in between, e.g. `25 permit …`.' },
  { id: 'f17', front: 'Delete only entry 40 of a named ACL', back: 'In ACL configuration mode: `no 40`.' },
  { id: 'f18', front: '`ip access-list resequence LAN1-IN 100 5`', back: 'Global config command: renumbers LAN1-IN starting at **100** with an increment of **5**, keeping the entry order.' },
  { id: 'f19', front: 'Filter incoming Telnet/SSH sessions with ACL MGMT', back: '`line vty 0 15` → `access-class MGMT in`. Apply it to every VTY range.' },
  { id: 'f20', front: '`access-class … out` on the VTY lines', back: 'Restricts the destinations that a user logged in to the device can Telnet or SSH to onward.' },
  { id: 'f21', front: 'Apply IPv4 ACL 110 to packets entering an interface', back: '`ip access-group 110 in` in interface configuration mode.' },
  { id: 'f22', front: 'Apply an IPv6 ACL to an interface', back: '`ipv6 traffic-filter NAME in|out`. VTY lines use `ipv6 access-class NAME in`.' },
  { id: 'f23', front: 'Implicit entries at the end of every IPv6 ACL', back: '`permit icmp any any nd-na`, `permit icmp any any nd-ns`, then `deny ipv6 any any`.' },
  { id: 'f24', front: 'Implicit deny of an IPv4 ACL', back: 'An invisible `deny ip any any` (standard ACL: `deny any`) after the last entry. It is not displayed and has no counter.' },
  { id: 'f25', front: 'How many ACLs can an interface have?', back: 'One per protocol per direction: one IPv4 ACL in and one out, plus one IPv6 ACL in and one out.' },
  { id: 'f26', front: 'Does an outbound ACL filter packets the router itself originates?', back: 'No. Router-generated traffic such as OSPF hellos is not checked by the router\'s own outbound ACLs.' },
  { id: 'f27', front: 'Verify ACL counters and interface placement', back: '`show access-lists` shows entries and match counters; `show ip interface` shows the inbound and outgoing ACL. Reset counters with `clear access-list counters`.' },
  { id: 'f28', front: 'When does an edit to an applied named ACL take effect?', back: '**Immediately** — there is no need to remove and re-apply `ip access-group`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which ACL number creates a numbered **extended** IPv4 ACL?',
    options: ['99', '1350', '150', '2750'],
    answer: 2,
    difficulty: 1,
    explanation:
      'Extended IPv4 ACLs use **100–199** and **2000–2699**, so 150 is extended. 99 is a standard ACL (1–99), 1350 is in the expanded standard range (1300–1999), and 2750 is outside every IPv4 ACL range.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which ports does the condition `gt 1023` match?',
    options: ['1023–65535', '1024–65535', '0–1023', '1–1022'],
    answer: 1,
    difficulty: 1,
    explanation:
      '`gt` means strictly greater than, so 1023 itself is excluded and the match starts at **1024**. 1023–65535 wrongly includes the value; 0–1023 is what `lt 1024` matches.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about the `established` keyword are true? (Choose two.)',
    options: [
      'It matches TCP segments that have the ACK or RST bit set',
      'It can be used in UDP entries to permit DNS replies',
      'It does not match the initial SYN of a connection opened from outside',
      'It makes the router keep a state table of active sessions',
      'It must be written immediately after the protocol keyword',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '`established` matches TCP segments with **ACK or RST** set, so the first SYN of a new connection (no ACK) is not matched. It is valid only for TCP, it does not track sessions (it only checks flag bits), and it is written at the **end** of the entry, not after the protocol.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Standard ACL `MGMT` permits the admin subnet. Which command, entered under `line vty 0 15`, applies it to incoming Telnet and SSH sessions?',
    answers: ['access-class MGMT in'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`access-class MGMT in` filters sessions **to** the device by source address. `ip access-group` is an interface command and is not accepted under the VTY lines; `out` would restrict onward sessions from the device instead.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each port condition to the ports it matches.',
    pairs: [
      { left: '`eq 443`', right: 'Only port 443' },
      { left: '`neq 23`', right: 'Every port except 23' },
      { left: '`lt 1024`', right: 'Ports 0–1023' },
      { left: '`gt 1023`', right: 'Ports 1024–65535' },
      { left: '`range 20 21`', right: 'Ports 20 and 21' },
    ],
    difficulty: 1,
    explanation:
      '`eq` is one exact port and `neq` is every port but one. `lt` and `gt` exclude the value itself, so `lt 1024` ends at 1023 and `gt 1023` starts at 1024. `range` includes both of its end values.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Following Cisco best practice, where should an extended ACL be applied?',
    options: [
      'As close to the destination as possible',
      'On the VTY lines of the core router',
      'As close to the source as possible',
      'Outbound on every WAN interface',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'An extended ACL can identify the destination and the application, so it can sit **near the source** and drop unwanted packets before they use bandwidth. Standard ACLs, which check only the source, go near the destination. VTY lines use `access-class`, which only filters management sessions.',
  },
  {
    id: 'q7',
    type: 'input',
    stem: 'Which global configuration command renumbers the named ACL `LAN1-IN` so that it starts at 10 and increments by 10?',
    answers: ['ip access-list resequence LAN1-IN 10 10'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`ip access-list resequence LAN1-IN 10 10` takes the starting number and then the increment, and keeps the entries in the same order. It is entered in global configuration mode, not inside the ACL.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'In `access-list 120 permit tcp any eq 80 host 10.2.2.20`, what does `eq 80` test?',
    options: [
      'The destination port',
      'The source port',
      'Both the source and the destination port',
      'Nothing — IOS rejects the entry',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The condition follows the **source** (`any`), so it tests the **source port**. The entry is valid syntax, but it matches packets coming **from** port 80 — such as a web server\'s replies — not web requests **to** 10.2.2.20, which would need `host 10.2.2.20 eq 80`.',
  },
];
