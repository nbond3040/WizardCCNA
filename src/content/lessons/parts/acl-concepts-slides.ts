import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'ACL Fundamentals & Standard ACLs',
    subtitle: 'Matching packets: wildcard masks, first-match logic and placement',
    notes:
      "An **access control list** (ACL) is an ordered list of permit and deny statements that a router uses to **match** packets. Filtering traffic on interfaces is the famous use, but the same match lists select addresses for NAT, classify traffic for QoS and restrict who can reach the VTY lines. In this lesson you will learn how IOS processes an ACL — top-down, first match, implicit deny — how **wildcard masks** work and how to calculate them quickly from a prefix or a range, how **standard ACLs** (numbered 1–99 and 1300–1999, or named) match only the source address, why they belong **close to the destination**, and how to apply and verify them with `ip access-group`, `show access-lists` and `show ip interface`. ACLs are exam topic 5.6 on v1.1 and part of domain 4 on v2.0. They generate some of the most calculation-heavy questions on the exam, so practise every wildcard until it is automatic.",
  },
  {
    kind: 'diagram',
    title: 'One tool, many jobs',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'acl', label: 'ACL', sub: 'ordered permit/deny list', shape: 'round', tone: 'accent', x: 5, y: 2.5 },
        { id: 'f', label: 'Packet filtering', sub: 'ip access-group in/out', x: 1.9, y: 1 },
        { id: 'n', label: 'NAT', sub: 'which sources to translate', x: 8.1, y: 1 },
        { id: 'q', label: 'QoS classification', sub: 'class-map match access-group', x: 1.9, y: 4 },
        { id: 'v', label: 'Management access', sub: 'VTY access-class, SNMP, NTP', x: 8.1, y: 4 },
      ],
      edges: [
        { from: 'acl', to: 'f' },
        { from: 'acl', to: 'n' },
        { from: 'acl', to: 'q' },
        { from: 'acl', to: 'v' },
      ],
    },
    caption: 'In filtering, permit = forward and deny = drop; elsewhere permit simply means “matched”.',
    notes:
      "An ACL by itself does nothing; it is a **match list** that other features reference. The most visible use is **packet filtering**: applied to an interface with `ip access-group`, a permit forwards the packet and a deny drops it. But look at the other uses. **NAT** references an ACL to decide which inside source addresses are eligible for translation — a deny there means “do not translate”, not “drop”. **QoS** class-maps use `match access-group` to classify traffic for marking or queuing. **Management-plane** protection uses ACLs to limit which hosts may reach the VTY lines (`access-class`), poll SNMP or synchronize with NTP. ACLs also filter routing updates, define the interesting traffic for IPsec VPNs and limit `debug` output to specific flows. The lesson for the exam is to read the context: in an interface ACL, permit and deny mean forward and drop; in NAT or QoS they mean matched and not matched. Questions that ask what ACLs are used for usually expect filtering plus one of these classification uses.",
  },
  {
    kind: 'diagram',
    title: 'Inbound vs outbound',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC-A', sub: '10.1.1.10', x: 1, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 2, tone: 'accent' },
        { id: 'srv', icon: 'server', label: 'Server', sub: '10.3.3.30', x: 9, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'r1', toLabel: 'G0/0/0', label: 'inbound ACL here', arrow: 'forward', tone: 'accent' },
        { from: 'r1', to: 'srv', fromLabel: 'G0/0/1', label: 'outbound ACL here', arrow: 'forward', tone: 'accent' },
      ],
      annotations: [
        { x: 5, y: 0.5, text: 'Packet PC-A → Server', tone: 'muted' },
        { x: 3, y: 3.5, text: 'checked before routing', tone: 'muted' },
        { x: 7, y: 3.5, text: 'checked after routing', tone: 'muted' },
      ],
    },
    caption: 'Direction is always judged from the router’s point of view.',
    notes:
      "Every interface ACL is applied in a **direction**, and the direction is always judged from the router's point of view, not the host's. An **inbound** ACL (`ip access-group … in`) checks packets as they arrive on the interface, **before** the router consults its routing table, so denied packets never cost a route lookup. An **outbound** ACL (`… out`) checks packets that the router has already routed and is about to transmit on that interface. In the diagram, PC-A's packet to the server enters R1 on G0/0/0 and leaves on G0/0/1, so it could be filtered by an ACL applied **in on G0/0/0** or **out on G0/0/1** — both see the same packet. The server's reply travels the other way, entering on G0/0/1 and leaving on G0/0/0, so neither of those two ACLs checks it. IOS allows ==one ACL per interface, per direction, per protocol==: at most one IPv4 ACL in and one IPv4 ACL out on each interface, plus one IPv6 ACL in each direction. Configuring a second `ip access-group` in the same direction replaces the first.",
  },
  {
    kind: 'diagram',
    title: 'Where the checks happen inside the router',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'n1', label: 'Packet arrives', sub: 'on G0/0/0', shape: 'pill', x: 1, y: 1.4 },
        { id: 'n2', label: 'Inbound ACL?', sub: 'G0/0/0 in', shape: 'diamond', x: 3, y: 1.4 },
        { id: 'n3', label: 'Routing lookup', sub: 'choose exit', x: 5, y: 1.4 },
        { id: 'n4', label: 'Outbound ACL?', sub: 'G0/0/1 out', shape: 'diamond', x: 7, y: 1.4 },
        { id: 'n5', label: 'Forward', sub: 'out G0/0/1', shape: 'round', tone: 'good', x: 9, y: 1.4 },
        { id: 'd1', label: 'Drop', sub: 'ICMP admin-prohibited', tone: 'bad', x: 3, y: 3.8 },
        { id: 'd2', label: 'Drop', sub: 'ICMP admin-prohibited', tone: 'bad', x: 7, y: 3.8 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3', label: 'permit' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5', label: 'permit' },
        { from: 'n2', to: 'd1', label: 'deny', tone: 'bad' },
        { from: 'n4', to: 'd2', label: 'deny', tone: 'bad' },
      ],
    },
    caption: 'Packets the router generates itself are not checked by its own outbound ACLs.',
    notes:
      "Follow a packet through the router. It arrives and, if the ingress interface has an **inbound ACL**, it is compared with that list first; a deny drops it immediately, and by default IOS returns an ICMP administratively-prohibited unreachable to the sender. A permitted packet goes to the **routing decision**, which picks the exit interface and next hop. If that exit interface has an **outbound ACL**, the packet is checked again; a deny drops it and a permit sends it on its way. Two consequences show up on the exam. First, filtering inbound is more efficient, because unwanted packets are discarded before the route lookup. Second, an outbound ACL does ==not filter packets the router itself originates==: pings, OSPF hellos, SSH sessions or syslog messages generated by R1 leave R1 regardless of R1's own outbound ACLs, although the next router's ACLs still apply. Inbound ACLs, by contrast, see everything that arrives — including routing protocol packets and replies addressed to the router itself — which is why a careless inbound ACL can break OSPF adjacencies or management access.",
  },
  {
    kind: 'bullets',
    title: 'How IOS processes an ACL',
    bullets: [
      'Entries (**ACEs**) are checked **top-down** in sequence order',
      '**First match wins** — its action applies and checking stops',
      'No match at all → **implicit `deny any`**',
      'The implicit deny is invisible: no line, no counter',
      'Specific entries first, broad entries last',
      'An ACL of only denies blocks **everything**',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'e1', label: 'Entry 10 matches?', shape: 'diamond', x: 2.5, y: 0.9 },
        { id: 'e2', label: 'Entry 20 matches?', shape: 'diamond', x: 2.5, y: 2.5 },
        { id: 'e3', label: 'Implicit deny any', sub: 'no line, no counter', tone: 'bad', x: 2.5, y: 4.1 },
        { id: 'act', label: 'Apply that action', sub: 'permit or deny, then stop', shape: 'round', tone: 'accent', x: 7, y: 1.7 },
      ],
      edges: [
        { from: 'e1', to: 'act', label: 'yes' },
        { from: 'e1', to: 'e2', label: 'no' },
        { from: 'e2', to: 'act', label: 'yes' },
        { from: 'e2', to: 'e3', label: 'no more entries' },
      ],
    },
    notes:
      "Each line in an ACL is an **access control entry** (ACE). IOS compares a packet with the ACEs one at a time, from the lowest sequence number to the highest, and the ==first entry that matches decides== — permit or deny — and nothing below it is ever checked. If the packet reaches the end without matching anything, it hits the **implicit deny**: every ACL ends with an invisible `deny any` (for extended ACLs, `deny ip any any`). You never see it in `show access-lists` and it has no counter, so if you want to count or log what it drops, add an explicit `deny any log` as the last line. Two design rules follow. Order matters: put specific entries (a single host) before broad ones (its whole subnet), or the broad entry matches first and the specific one never fires. And every filtering ACL needs at least one permit — an ACL made only of deny statements blocks all traffic on that interface, because anything not denied explicitly is denied implicitly. Exam items test this with “which packets will be permitted?” exhibits, so always finish your walk-through at the implicit deny.",
  },
  {
    kind: 'bullets',
    title: 'Wildcard masks: 0 = match, 1 = ignore',
    bullets: [
      'Written like a mask, but read **bit by bit**',
      '**0** bit: packet bit must equal the ACE address bit',
      '**1** bit: packet bit is ignored',
      '`10.1.1.0 0.0.0.255` → any 10.1.1.x address',
      'Usually the inverse of a subnet mask — any bit pattern is legal',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'ACE address', value: '10.1.1.0', prefix: 24 },
        { label: 'Wildcard', value: '0.0.0.255', prefix: 24, tone: 'accent' },
        { label: '10.1.1.77 matches', value: '10.1.1.77', prefix: 24, tone: 'good' },
        { label: '10.1.2.77 fails', value: '10.1.2.77', prefix: 24, tone: 'bad' },
      ],
    },
    notes:
      "An ACE matches addresses with an address plus a **wildcard mask**. Although it is written in dotted decimal like a subnet mask, it works on individual bits with inverted logic: a **0** wildcard bit means the corresponding bit of the packet's address must be **identical** to the ACE's address, and a **1** bit means **don't care**. In the example, `10.1.1.0 0.0.0.255` has zeros across the first 24 bits, so the first three octets must be exactly 10.1.1, and ones across the last octet, so any value there is accepted — 10.1.1.77 matches, while 10.1.2.77 fails in the third octet. Most wildcards are the inverse of a subnet mask and therefore match a whole subnet, but IOS accepts **any** bit pattern: `10.1.0.1 0.0.255.0`, for example, matches the .1 address in every 10.1.x.0/24 subnet, a trick for matching all gateways at once. Wildcards are not subnet masks, though. Typing a subnet mask by mistake, such as `10.1.1.0 255.255.255.0`, is accepted by IOS but matches every address that ends in .0 — a classic exam trap.",
  },
  {
    kind: 'table',
    title: 'Wildcard = 255.255.255.255 − subnet mask',
    columns: ['Prefix', 'Subnet mask', 'Wildcard', 'Addresses matched'],
    rows: [
      ['/8', '255.0.0.0', '`0.255.255.255`', '16,777,216'],
      ['/16', '255.255.0.0', '`0.0.255.255`', '65,536'],
      ['/20', '255.255.240.0', '`0.0.15.255`', '4,096'],
      ['/22', '255.255.252.0', '`0.0.3.255`', '1,024'],
      ['/23', '255.255.254.0', '`0.0.1.255`', '512'],
      ['/24', '255.255.255.0', '`0.0.0.255`', '256'],
      ['/25', '255.255.255.128', '`0.0.0.127`', '128'],
      ['/26', '255.255.255.192', '`0.0.0.63`', '64'],
      ['/27', '255.255.255.224', '`0.0.0.31`', '32'],
      ['/28', '255.255.255.240', '`0.0.0.15`', '16'],
      ['/29', '255.255.255.248', '`0.0.0.7`', '8'],
      ['/30', '255.255.255.252', '`0.0.0.3`', '4'],
      ['/32', '255.255.255.255', '`0.0.0.0` (`host`)', '1'],
    ],
    caption: 'Subtract each octet from 255: 255 − 240 = 15, so /20 → `0.0.15.255`.',
    notes:
      "For contiguous masks the quickest method is subtraction: ==wildcard = 255.255.255.255 − subnet mask==, octet by octet. A /26 (255.255.255.192) gives 0.0.0.63; a /20 (255.255.240.0) gives 0.0.15.255; a /30 gives 0.0.0.3. Notice the pattern in the last non-zero octet: the wildcard value is always the **block size minus one** — 64 − 1 = 63, 16 − 1 = 15, 4 − 1 = 3. That gives you a second way to check an answer: in a /22 the block size in the third octet is 4, so the wildcard there is 3 and the full wildcard is 0.0.3.255. Memorize at least the /24 to /30 rows, because the exam expects instant answers. Two special cases have keywords: `0.0.0.0` matches exactly one host (`host`) and `255.255.255.255` matches every address (`any`). Also check the address you pair with the wildcard: it should be the **network address** of the block, because a wildcard describes a range cleanly only when the address starts on a block boundary — otherwise IOS silently rounds the address down.",
  },
  {
    kind: 'diagram',
    title: 'Worked example: 172.16.32.0/20',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Network', value: '172.16.32.0', prefix: 20 },
        { label: 'Mask /20', value: '255.255.240.0', prefix: 20 },
        { label: 'Wildcard', value: '0.0.15.255', prefix: 20, tone: 'accent' },
        { label: 'Last match', value: '172.16.47.255', prefix: 20 },
      ],
    },
    caption: '255.255.255.255 − 255.255.240.0 = `0.0.15.255` → matches 172.16.32.0 – 172.16.47.255.',
    notes:
      "Let's work one fully. The requirement: match every address in 172.16.32.0/20. The /20 mask is 255.255.240.0; subtracting it from all-255s gives the wildcard ==0.0.15.255==. In binary, the first 20 wildcard bits are 0 — those bits of the packet must equal the ACE's bits, which fixes the first two octets at 172.16 and the top four bits of the third octet at 0010 — and the last 12 bits are 1, so they can be anything. The third octet can therefore vary only in its low four bits: from 32 (0010 0000) to 47 (0010 1111). The matched range is 172.16.32.0 through 172.16.47.255, exactly the /20 subnet. To test whether an address matches, look only at the interesting octet: 172.16.45.9 has 45 in the third octet, which lies between 32 and 47, so it **matches**; 172.16.48.1 has 48, outside the block, so it does **not**. This block-in-the-interesting-octet check is the fastest way to answer “does this packet match this ACE?” under exam time pressure — no full binary conversion needed.",
  },
  {
    kind: 'steps',
    title: 'From an address range to an ACE',
    steps: [
      { title: 'Find the interesting octet', text: 'Where first and last differ: 10.1.**8**.0 – 10.1.**15**.255.' },
      { title: 'Subtract last − first', text: '15 − 8 = 7 → wildcard `0.0.7.255`.' },
      { title: 'Check the block', text: 'Size 8 is a power of 2, and 8 is a multiple of 8: valid.' },
      { title: 'Write the ACE', text: '`permit 10.1.8.0 0.0.7.255`' },
      { title: 'Unaligned range? Split it', text: '10.1.6.0 – 10.1.9.255 needs `10.1.6.0 0.0.1.255` and `10.1.8.0 0.0.1.255`.' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'First', value: '10.1.8.0', prefix: 21 },
        { label: 'Last', value: '10.1.15.255', prefix: 21 },
        { label: 'Wildcard', value: '0.0.7.255', prefix: 21, tone: 'accent' },
      ],
    },
    notes:
      "Exam questions often describe a range instead of a prefix: “permit hosts 10.1.8.0 through 10.1.15.255”. Find the octet where the first and last addresses differ — here the third. Subtract: 15 − 8 = 7, and write 7 in that octet, 255 in every octet to its right and 0 to its left: `0.0.7.255`. Then check validity: the block size (7 + 1 = 8) must be a power of two, and the first value (8) must be a multiple of the block size. Both hold, so a single ACE, `10.1.8.0 0.0.7.255`, matches the range exactly — the binary view shows the 21 fixed bits. If the check fails, the range cannot be expressed with one contiguous wildcard. The range 10.1.6.0 – 10.1.9.255 covers four /24s, but 6 is not a multiple of 4, so it straddles two blocks and needs two entries: `10.1.6.0 0.0.1.255` and `10.1.8.0 0.0.1.255`. The tempting single answer `10.1.6.0 0.0.3.255` is wrong: IOS rounds the address down to 10.1.4.0, so it matches 10.1.4.0 – 10.1.7.255 instead.",
  },
  {
    kind: 'table',
    title: 'Keywords and how IOS stores entries',
    columns: ['You type', 'Equivalent', 'Matches'],
    rows: [
      ['`host 10.1.1.10`', '`10.1.1.10 0.0.0.0`', 'That one address'],
      ['`10.1.1.10` (standard ACL, no wildcard)', '`10.1.1.10 0.0.0.0`', 'That one address'],
      ['`any`', '`0.0.0.0 255.255.255.255`', 'Every IPv4 address'],
      ['`10.1.1.77 0.0.0.255`', 'Stored as `10.1.1.0 0.0.0.255`', '10.1.1.0 – 10.1.1.255'],
      ['`10.1.1.0 255.255.255.0` (mask by mistake)', 'Stored as `0.0.0.0 255.255.255.0`', 'Every address ending in .0'],
    ],
    caption: 'IOS zeroes the address bits that the wildcard ignores.',
    notes:
      "Two keywords save typing and prevent mistakes. `host 10.1.1.10` is shorthand for the wildcard `0.0.0.0` — all 32 bits must match — and in a **standard** ACL you can even omit the keyword: a lone address implies a host match, and `show access-lists` displays it as just the address. `any` is shorthand for `0.0.0.0 255.255.255.255`: every bit ignored, every address matched. IOS also normalizes what you type. Because wildcard-ignored bits can never influence a match, IOS stores the address with those bits set to zero: type `10.1.1.77 0.0.0.255` and the ACL shows `10.1.1.0, wildcard bits 0.0.0.255`. That is harmless when you meant the subnet, but it exposes mistakes — if a question shows `access-list 10 deny 10.1.1.10 0.0.0.255` and asks which hosts are denied, the answer is the entire 10.1.1.0/24, not the single host. The last row is the most dangerous typo of all: a subnet mask entered as a wildcard. IOS accepts it and stores it as `0.0.0.0 255.255.255.0`, which matches any address whose last octet is zero, while letting the intended subnet through.",
  },
  {
    kind: 'table',
    title: 'Standard vs extended: numbers and placement',
    columns: ['ACL type', 'Identifier', 'Matches on', 'Place it'],
    rows: [
      ['Standard numbered', '**1–99**, **1300–1999**', 'Source IPv4 address only', 'Close to the **destination**'],
      ['Extended numbered', '**100–199**, **2000–2699**', 'Protocol, source, destination, ports', 'Close to the **source**'],
      ['Standard named', '`ip access-list standard NAME`', 'Source IPv4 address only', 'Close to the destination'],
      ['Extended named', '`ip access-list extended NAME`', 'Protocol, source, destination, ports', 'Close to the source'],
    ],
    caption: 'For numbered ACLs, the number range tells IOS which type you are writing.',
    notes:
      "IPv4 ACLs come in two families. **Standard** ACLs can match only the **source IPv4 address** — nothing about the destination, the protocol or the ports. **Extended** ACLs match the protocol, source and destination addresses and TCP/UDP ports; they are covered in depth in the next lesson. With numbered ACLs the number itself tells IOS the type: **1–99** and the expanded range **1300–1999** are standard, **100–199** and **2000–2699** are extended. Named ACLs declare the type explicitly with `ip access-list standard` or `ip access-list extended`, so the name can be anything descriptive; names are case-sensitive, so `Servers` and `SERVERS` are two different ACLs. Functionally, a named standard ACL is identical to a numbered one — the difference is editing convenience. The placement column is the most tested rule in this topic: because a standard ACL cannot see the destination, it must sit **near the destination** so it does not block the source from everything else, while an extended ACL, which can be precise about destination and ports, should sit **near the source** so unwanted traffic is dropped before it crosses the network.",
  },
  {
    kind: 'diagram',
    title: 'Placing a standard ACL',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a', icon: 'pc', label: 'LAN A', sub: '10.1.1.0/24', x: 1, y: 1.3 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2.5 },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.3, y: 2.5, tone: 'accent' },
        { id: 'srv', icon: 'server', label: 'Servers', sub: '10.3.3.0/24', x: 9, y: 1.3 },
        { id: 'b', icon: 'pc', label: 'LAN B', sub: '10.2.2.0/24', x: 9, y: 3.7 },
      ],
      links: [
        { from: 'a', to: 'r1', toLabel: 'G0/0/0', label: '✗ in', tone: 'bad' },
        { from: 'r1', to: 'r2', label: '10.0.12.0/30' },
        { from: 'r2', to: 'srv', fromLabel: 'G0/0/1', label: '✓ out', tone: 'good' },
        { from: 'r2', to: 'b', fromLabel: 'G0/0/2' },
      ],
      annotations: [
        { x: 2.6, y: 4.5, text: 'Near the source: LAN A loses everything', tone: 'bad' },
        { x: 6.3, y: 0.5, text: 'Near the destination: only server-bound traffic', tone: 'good' },
      ],
    },
    caption: 'Goal: stop LAN A reaching the servers, but keep LAN A → LAN B working.',
    notes:
      "Here is why the placement rule exists. The requirement: stop LAN A (10.1.1.0/24) reaching the server LAN (10.3.3.0/24) while LAN A keeps access to LAN B and everything else. A standard ACL can only say “deny source 10.1.1.0/24”. Applied **inbound on R1 G0/0/0**, next to the source, it drops every packet from LAN A the moment it enters R1 — LAN A loses LAN B, the Internet and the servers alike, which violates the requirement. Instead, apply it where only traffic **toward the servers** passes: **outbound on R2 G0/0/1**. The only packets that ACL ever sees are those heading into the server LAN, so denying source 10.1.1.0/24 there blocks exactly the unwanted flow and nothing else. The cost is efficiency: LAN A's doomed packets cross R1 and the WAN link before they are dropped. That is acceptable for a standard ACL; if you want to drop them at the source, use an extended ACL that also names the destination. Exam questions give you a topology like this and ask for the router, the interface and the direction — find the interface that sees only the traffic you want to filter.",
  },
  {
    kind: 'cli',
    title: 'Configuring a numbered standard ACL',
    code: `R2(config)# access-list 10 remark Block LAN A from the server LAN
R2(config)# access-list 10 deny 10.1.1.0 0.0.0.255
R2(config)# access-list 10 permit any
R2(config)# interface GigabitEthernet0/0/1
R2(config-if)# ip access-group 10 out
R2(config-if)# end
R2# show access-lists 10
Standard IP access list 10
    10 deny   10.1.1.0, wildcard bits 0.0.0.255 (12 matches)
    20 permit any (847 matches)`,
    highlight: ['permit any', 'ip access-group 10 out', '(12 matches)'],
    caption: 'Without `permit any`, the implicit deny would block all traffic toward the servers.',
    notes:
      "Numbered standard ACLs are built with global `access-list` commands, one entry per command, and each new entry is appended to the end. The optional `remark` documents the intent — use it, because six months later nobody remembers why ACL 10 exists. The deny entry matches source 10.1.1.0/24, and the final `permit any` is essential: without it, the implicit deny would block **all** traffic toward the servers, not just LAN A. The ACL does nothing until it is applied: under the interface, `ip access-group 10 out` attaches it to packets leaving G0/0/1. `show access-lists 10` confirms the result. IOS numbered the entries 10 and 20 automatically, displays the standard wildcard as “wildcard bits 0.0.0.255”, and shows **match counters**: 12 packets from LAN A were dropped and 847 other packets were permitted. A counter appears only after an entry has matched at least one packet, and the implicit deny never has one. To delete the ACL, `no access-list 10` removes the **entire** list; remove the `ip access-group` line too, because an interface that references a missing ACL simply filters nothing.",
  },
  {
    kind: 'cli',
    title: 'Named standard ACLs',
    code: `R2(config)# ip access-list standard PROTECT-SERVERS
R2(config-std-nacl)# remark Admin PC may reach the servers; rest of LAN A may not
R2(config-std-nacl)# permit host 10.1.1.10
R2(config-std-nacl)# deny 10.1.1.0 0.0.0.255
R2(config-std-nacl)# permit any
R2(config-std-nacl)# exit
R2(config)# interface GigabitEthernet0/0/1
R2(config-if)# no ip access-group 10 out
R2(config-if)# ip access-group PROTECT-SERVERS out
R2(config-if)# end
R2# show access-lists PROTECT-SERVERS
Standard IP access list PROTECT-SERVERS
    10 permit 10.1.1.10
    20 deny   10.1.1.0, wildcard bits 0.0.0.255
    30 permit any`,
    highlight: ['ip access-list standard PROTECT-SERVERS', 'permit host 10.1.1.10', 'ip access-group PROTECT-SERVERS out'],
    caption: 'The host permit must come before the subnet deny.',
    notes:
      "Named ACLs are configured in their own sub-mode. `ip access-list standard PROTECT-SERVERS` enters `(config-std-nacl)#`, where each `permit`, `deny` or `remark` becomes an entry; IOS numbers them 10, 20, 30 unless you type your own sequence numbers. This version refines the policy: the administrator's PC, 10.1.1.10, may reach the servers, the rest of LAN A may not, and everyone else may. Order is everything — the **host permit must come before** the subnet deny, because the first match wins; reversed, the deny would catch 10.1.1.10 too (and newer IOS releases may even refuse to add a host entry that an earlier entry already covers). Applying a named ACL uses the same interface command with the name instead of the number. Because only one IPv4 ACL may exist per interface per direction, the engineer removes the old `ip access-group 10 out` first — entering the new command would replace it anyway, but being explicit avoids surprises. Named ACLs can be edited entry by entry: `no 20` inside the sub-mode deletes just that line, and a new line typed with sequence number 15 would slot in between 10 and 20.",
  },
  {
    kind: 'compare',
    title: 'Numbered vs named ACLs',
    left: {
      heading: 'Numbered (access-list)',
      bullets: [
        'Global `access-list 1–99 …` commands',
        'New entries always appended at the end',
        '`no access-list 10` deletes the whole ACL',
        'Editable by sequence via `ip access-list standard 10`',
      ],
    },
    right: {
      heading: 'Named (ip access-list)',
      tone: 'accent',
      bullets: [
        '`ip access-list standard NAME` sub-mode',
        'Descriptive, case-sensitive names',
        'Insert with a sequence number, delete with `no 20`',
        'Same matching logic and implicit deny',
      ],
    },
    notes:
      "The matching logic is identical — top-down, first match, implicit deny — so the choice is about management. Numbered ACLs date back to the earliest IOS releases. Each global `access-list` command appends a line to the end, so you cannot insert a line in the middle with that syntax, and `no access-list 10` removes the entire list at once. Modern IOS softens this: you can open a numbered ACL in ACL configuration mode with `ip access-list standard 10` and edit it by sequence number exactly like a named ACL. Named ACLs are the better habit. A name such as PROTECT-SERVERS or VTY-ADMINS documents the purpose wherever it is referenced — on interfaces, VTY lines, NAT rules and class-maps — and the sub-mode supports inserting and deleting individual entries. Names are case-sensitive and must be referenced exactly as created. For the exam, know both syntaxes, the prompts (`config-std-nacl` for standard, `config-ext-nacl` for extended), and that named ACLs are applied with the same `ip access-group` command. Sequence-number editing and `ip access-list resequence` get a full treatment in the extended ACL lesson.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show access-lists and show ip interface',
    code: `R2# show access-lists
Standard IP access list 10
    10 deny   10.1.1.0, wildcard bits 0.0.0.255 (12 matches)
    20 permit any (847 matches)
Standard IP access list PROTECT-SERVERS
    10 permit 10.1.1.10 (31 matches)
    20 deny   10.1.1.0, wildcard bits 0.0.0.255 (9 matches)
    30 permit any (1204 matches)
R2# show ip interface GigabitEthernet0/0/1
GigabitEthernet0/0/1 is up, line protocol is up
  Internet address is 10.3.3.1/24
<output omitted>
  Outgoing access list is PROTECT-SERVERS
  Inbound  access list is not set
<output omitted>
R2# clear access-list counters PROTECT-SERVERS`,
    highlight: ['(9 matches)', 'Outgoing access list is PROTECT-SERVERS'],
    caption: '`show access-lists` = what and how often; `show ip interface` = where and which direction.',
    notes:
      "Two commands answer the two verification questions. `show access-lists` (or `show ip access-lists` for IPv4 only) shows **what** each ACL contains: every entry with its sequence number and, in parentheses, how many packets have **matched** it since the counters were last cleared. Counters are your best troubleshooting tool: if a deny entry's counter climbs while users complain, you have found the entry that blocks them; if an entry you expect to be used never gets a counter, the traffic is not reaching the ACL — wrong interface, wrong direction, or a broader entry above it matching first. Standard entries show a single host as just the address and a range as “address, wildcard bits …”. Notice that ACL 10 still exists with its old counters even though it is no longer applied anywhere. `show ip interface` shows **where** ACLs are applied: “Outgoing access list is …” and “Inbound access list is …” name the ACL in each direction or say “not set”; `show running-config interface` shows the same thing as `ip access-group` lines. Finally, `clear access-list counters` (optionally with the ACL name) resets the counters so you can test with fresh traffic.",
  },
  {
    kind: 'table',
    title: 'Which entry does this packet match?',
    columns: ['Packet (source → destination)', 'First matching entry', 'Result'],
    rows: [
      ['10.1.1.10 → 10.3.3.30', '10 `permit 10.1.1.10`', 'Forwarded'],
      ['10.1.1.55 → 10.3.3.30', '20 `deny 10.1.1.0 0.0.0.255`', '**Dropped**'],
      ['10.2.2.20 → 10.3.3.30', '30 `permit any`', 'Forwarded'],
      ['172.16.9.9 → 10.3.3.30', '30 `permit any`', 'Forwarded'],
      ['10.1.1.55 → 10.2.2.20', 'None — exits G0/0/2, not G0/0/1', '==Not filtered=='],
    ],
    caption: 'PROTECT-SERVERS is applied outbound on R2 G0/0/1 (toward the servers).',
    notes:
      "This is the drill you will repeat in every ACL question: take a packet, find the interfaces it crosses, and walk down the ACL until the first match. PROTECT-SERVERS sits outbound on R2 G0/0/1, the server-facing interface. A packet from the administrator, 10.1.1.10, matches entry 10 immediately and is forwarded — it never reaches the deny below. Another LAN A host, 10.1.1.55, fails entry 10 because the address differs, matches entry 20 (the 10.1.1.0/24 deny) and is dropped; R2 returns an ICMP administratively-prohibited message, which an IOS ping displays as `U`. Hosts in LAN B or anywhere else fall through to entry 30, `permit any`. The last row is the one people miss: when 10.1.1.55 talks to LAN B, the packet leaves R2 through G0/0/2, so this ACL is never consulted at all. An ACL affects only traffic that actually passes the interface, in the direction where it is applied. So always ask two questions, in this order: does the packet cross this interface in this direction, and if so, which entry matches first?",
  },
  {
    kind: 'table',
    title: 'Common mistakes with standard ACLs',
    columns: ['Mistake', 'Effect', 'Fix'],
    rows: [
      ['Broad permit above a specific deny', 'The deny never matches', 'Most specific entries first'],
      ['Only deny entries', 'Implicit deny blocks everything else', 'End with `permit any` when intended'],
      ['Standard ACL near the source', 'Source loses access to every destination', 'Apply it near the destination'],
      ['Wrong interface or direction', 'Traffic never meets the ACL', 'Trace the path: in = arriving, out = leaving'],
      ['Subnet mask typed as a wildcard', 'Matches unintended addresses', 'Wildcard = 255.255.255.255 − mask'],
      ['ACL applied but never created', 'No filtering — everything permitted', 'Create it; check `show access-lists`'],
    ],
    notes:
      "Nearly every broken ACL in a lab or on the exam falls into one of these six patterns. Entry **order** errors let a broad entry swallow packets meant for a specific one. Forgetting the final **permit** turns a targeted filter into a total block because of the implicit deny. **Placement** errors with standard ACLs block a source from everything instead of from one destination. **Direction** and **interface** errors are the sneakiest: the ACL is correct but attached where the traffic never passes, or it faces the wrong way — for example, an ACL meant for packets leaving toward the servers applied inbound on the server interface, where it sees only the servers' own traffic. **Wildcard** errors come from typing a subnet mask, or from pairing a wildcard with an address that is not on a block boundary. Finally, IOS lets `ip access-group` reference an ACL that does not exist yet; until it is created, the interface **permits everything**, which gives a false sense of security. Read the fix column as a pre-flight checklist: order, final permit, placement, direction, wildcard, existence.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: ACL fundamentals',
    body: 'Find the interface and direction first, then the ==first matching entry== — and never forget the invisible `deny any`.',
    bullets: [
      'Wildcard = 255.255.255.255 − mask: /26 → `0.0.0.63`, /20 → `0.0.15.255`',
      'Standard 1–99 and 1300–1999; extended 100–199 and 2000–2699',
      'Standard = source only → place it near the destination',
      'One ACL per interface, per direction, per protocol',
      'Outbound ACLs never filter the router’s own traffic',
      'Implicit deny has no counter; a missing ACL filters nothing',
    ],
    notes:
      "Here are the ACL-fundamentals traps that decide exam items. Wildcards first: compute them by subtracting the mask from 255.255.255.255 and double-check with block size minus one; an address that is not on a block boundary is rounded down by IOS, and a subnet mask typed as a wildcard matches something completely different. Know the number ranges cold — a question may show `access-list 1350` and expect you to recognize a standard ACL. For placement, standard means source-only, so near the destination; extended means near the source. Remember the hard limit of one ACL per interface, per direction, per protocol, and that a second `ip access-group` in the same direction replaces the first. Outbound ACLs do not filter packets the router itself generates, which explains why a router can still ping through an outbound deny. The implicit deny never shows a counter, so zero counters everywhere with complaining users often means the implicit deny is doing the dropping. And an ACL referenced on an interface but never created permits all traffic.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'ACLs are ordered match lists: filtering, NAT, QoS, management',
      'Top-down, **first match wins**, implicit `deny any` at the end',
      'Wildcards: 0 = must match, 1 = ignore; 255.255.255.255 − mask',
      '`host` = `0.0.0.0` wildcard, `any` = `255.255.255.255`',
      'Standard ACLs (1–99, 1300–1999, named) match the source only',
      'Place standard ACLs near the destination; one per interface per direction',
      'Verify with `show access-lists` counters and `show ip interface`',
    ],
    notes:
      "Let's recap. An ACL is an ordered list of access control entries that other features use to match packets: interface filtering, NAT, QoS classification, management-plane restrictions and more. IOS checks entries top-down and stops at the first match; a packet that matches nothing is dropped by the invisible implicit deny, so every filtering ACL needs at least one permit. Wildcard masks work bit by bit — 0 means must match, 1 means ignore — and for subnets they are 255.255.255.255 minus the mask; `host` and `any` are shortcuts for the two extremes. Standard ACLs, numbered 1–99 and 1300–1999 or named with `ip access-list standard`, match only the source address, so they belong close to the destination. Each interface takes at most one IPv4 ACL per direction, applied with `ip access-group`. Verification uses `show access-lists` for entries and counters and `show ip interface` for placement. Next, extended ACLs add protocols, destinations and ports.",
  },
];
