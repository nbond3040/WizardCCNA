import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'An engineer must allow hosts in 10.1.1.0/24 to reach the HTTPS service on server 10.2.2.20. The ACL will be applied inbound on the router interface that connects to 10.1.1.0/24. Which entry meets the requirement?',
    options: [
      '`access-list 110 permit tcp 10.1.1.0 0.0.0.255 eq 443 host 10.2.2.20`',
      '`access-list 110 permit tcp host 10.2.2.20 eq 443 10.1.1.0 0.0.0.255`',
      '`access-list 110 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443`',
      '`access-list 110 permit tcp 10.1.1.0 255.255.255.0 host 10.2.2.20 eq 443`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      "The clients send from ephemeral ports **to** destination port 443, so `eq 443` belongs **after the destination**: `permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443`. With `eq 443` after the source, the entry tests the client's source port, which is a random high port. The entry sourced from host 10.2.2.20 port 443 describes the server's replies, which never enter the LAN interface inbound. `255.255.255.0` is a subnet mask; used as a wildcard it ignores the first three octets and matches only sources whose last octet is 0.",
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. ACL 150 is applied inbound on the R1 interface that connects to LAN 10.1.1.0/24. Host 10.1.1.25 opens an SSH session to 10.2.2.20. What happens to the first packet of the session?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists 150
Extended IP access list 150
    10 deny tcp any host 10.2.2.20 eq telnet (12 matches)
    20 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 range ftp-data telnet (48 matches)
    30 permit udp 10.1.1.0 0.0.0.255 any eq domain (1022 matches)
    40 deny ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255 (7 matches)
    50 permit ip any any (8841 matches)`,
    },
    options: ['Entry 20 permits it', 'Entry 10 denies it', 'Entry 40 denies it', 'Entry 50 permits it'],
    answer: 0,
    difficulty: 3,
    explanation:
      'SSH is **TCP 22**. IOS displays `range 20 23` as `range ftp-data telnet`, and a range includes both ends, so port 22 falls inside it. Entry 10 matches only destination port 23, so it is skipped; entry 20 matches the source, the destination and the port, and the packet is **permitted**. Entry 40 would deny other traffic from the LAN to 10.2.2.0/24 and entry 50 would permit everything else, but the first match wins, so neither is reached.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two ACL numbers identify numbered extended IPv4 access lists? (Choose two.)',
    options: ['99', '100', '1300', '2000', '2700'],
    answers: [1, 3],
    difficulty: 1,
    explanation:
      'Extended IPv4 ACLs are numbered **100–199** and **2000–2699**, so 100 and 2000 — the first number of each range — are extended. 99 is the last standard number (1–99), 1300 starts the expanded standard range (1300–1999), and 2700 is one past the end of the expanded extended range.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each destination-port condition to the ports it matches.',
    pairs: [
      { left: '`gt 1023`', right: 'Ports 1024 through 65535' },
      { left: '`lt 1023`', right: 'Ports 0 through 1022' },
      { left: '`range 1023 1025`', right: 'Ports 1023, 1024 and 1025' },
      { left: '`neq 1023`', right: 'Every port except 1023' },
      { left: '`eq 1023`', right: 'Port 1023 only' },
    ],
    difficulty: 2,
    explanation:
      '`gt` and `lt` are strict comparisons, so the value itself is excluded: `gt 1023` begins at 1024 and `lt 1023` stops at 1022. `range` is inclusive at both ends, `neq` excludes exactly one port and `eq` matches exactly one. The classic mistake is assuming that `lt 1023` still includes 1023.',
  },
  {
    id: 'e5',
    type: 'order',
    stem: 'An engineer must insert a new entry above entry 20 of the named ACL BRANCH-IN (entries 10 and 20 exist) and then renumber the list with an increment of 10. Put the commands in the order they are entered, starting in privileged EXEC mode.',
    items: [
      '`configure terminal`',
      '`ip access-list extended BRANCH-IN`',
      '`15 permit tcp host 10.1.1.10 any eq 22`',
      '`exit`',
      '`ip access-list resequence BRANCH-IN 10 10`',
      '`end`',
    ],
    difficulty: 2,
    explanation:
      'Entries are inserted from ACL configuration mode, so the engineer enters global configuration, opens the list with `ip access-list extended BRANCH-IN` and types the entry with a number between 10 and 20. `resequence` is a **global** configuration command, so the engineer leaves ACL mode with `exit` before renumbering, then returns to privileged EXEC with `end` to verify with `show access-lists`.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'An engineer is writing extended ACL entries for common services. Drag each service to the transport keyword its entry must use.',
    categories: ['tcp', 'udp'],
    items: [
      { text: 'SSH to a router', category: 0 },
      { text: 'HTTPS to a web server', category: 0 },
      { text: 'SMTP to a mail server', category: 0 },
      { text: 'Telnet to a switch', category: 0 },
      { text: 'TFTP file transfer', category: 1 },
      { text: 'SNMP polling of a device', category: 1 },
      { text: 'NTP time synchronization', category: 1 },
      { text: 'DHCP Discover to a server', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'SSH (22), HTTPS (443), SMTP (25) and Telnet (23) are **TCP** services. TFTP (69), SNMP (161), NTP (123) and DHCP (67/68) run over **UDP**. Writing `tcp` for a UDP service creates an entry that never matches — a frequent reason why an ACL that looks right silently breaks NTP, SNMP or DHCP.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Refer to the exhibit. The engineer enters `ip access-list extended BRANCH-IN` and then `permit icmp 10.1.1.0 0.0.0.255 any` without a sequence number. Which sequence number does IOS assign to the new entry?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists BRANCH-IN
Extended IP access list BRANCH-IN
    10 permit tcp 10.1.1.0 0.0.0.255 any eq www
    20 permit tcp 10.1.1.0 0.0.0.255 any eq 443
    30 deny tcp 10.1.1.0 0.0.0.255 any eq 22
    45 permit udp 10.1.1.0 0.0.0.255 any eq domain`,
    },
    answers: ['55'],
    placeholder: 'sequence number',
    difficulty: 2,
    explanation:
      'An entry typed without a sequence number is appended to the **end** of the list with a number **10 greater than the current last entry**. The last entry is 45, so the new one becomes **55** — not 50, which assumes the default spacing is still intact. To place an entry anywhere else, type an explicit sequence number.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts in LAN A must not reach the FTP service (TCP 20 and 21) on server 10.3.3.21; all other traffic must keep flowing. Which configuration meets the requirement and follows Cisco placement best practice?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'a', icon: 'pc', label: 'LAN A', sub: '10.1.1.0/24', x: 1, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 3.5, y: 2.5 },
          { id: 'r2', icon: 'router', label: 'R2', x: 6.2, y: 2.5 },
          { id: 'ftp', icon: 'server', label: 'FTP server', sub: '10.3.3.21', x: 9, y: 1.2 },
          { id: 'b', icon: 'pc', label: 'LAN B', sub: '10.2.2.0/24', x: 9, y: 3.8 },
        ],
        links: [
          { from: 'a', to: 'r1', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', toLabel: 'G0/0/0', label: '10.0.12.0/30' },
          { from: 'r2', to: 'ftp', fromLabel: 'G0/0/1' },
          { from: 'r2', to: 'b', fromLabel: 'G0/0/2' },
        ],
      },
    },
    options: [
      'Extended ACL `deny tcp host 10.3.3.21 range 20 21 10.1.1.0 0.0.0.255` + `permit ip any any`, inbound on R1 G0/0/0',
      'Standard ACL `deny 10.1.1.0 0.0.0.255` + `permit any`, inbound on R1 G0/0/0',
      'Extended ACL `deny tcp 10.1.1.0 0.0.0.255 host 10.3.3.21 range 20 21` + `permit ip any any`, outbound on R1 G0/0/0',
      'Extended ACL `deny tcp 10.1.1.0 0.0.0.255 host 10.3.3.21 range 20 21` + `permit ip any any`, inbound on R1 G0/0/0',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The FTP requests have source 10.1.1.0/24 and destination 10.3.3.21 ports 20–21, and they **enter** R1 on G0/0/0 — the interface closest to the source — so the correctly written extended entry goes **inbound on R1 G0/0/0**, followed by `permit ip any any` so that everything else still flows. Outbound on G0/0/0 the ACL checks only packets heading **to** LAN A, which never match. The entry with the server as the source describes FTP replies, not the requests entering G0/0/0. The standard ACL would block every packet from LAN A, not just FTP.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. About 40 seconds after an engineer applied ACL FROM-R1 inbound on R2 G0/0/0, the OSPF adjacency with neighbor R1 went down. Which change restores the adjacency while keeping the rest of the policy?',
    exhibit: {
      kind: 'cli',
      text: `%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/0/0 from FULL to DOWN, Neighbor Down: Dead timer expired
R2# show access-lists FROM-R1
Extended IP access list FROM-R1
    10 permit tcp any 10.2.2.0 0.0.0.255 established (3120 matches)
    20 permit icmp any 10.2.2.0 0.0.0.255 echo-reply (18 matches)
    30 permit udp any eq domain 10.2.2.0 0.0.0.255 (402 matches)`,
    },
    options: [
      'Add `permit tcp any any eq 89` to FROM-R1',
      'Insert `5 permit ospf any any` in FROM-R1',
      'Apply FROM-R1 outbound instead of inbound on G0/0/0',
      'Add `permit udp any any eq 520` to FROM-R1',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "OSPF packets are **IP protocol 89** — neither TCP nor UDP — so no entry matches R1's hellos and the implicit deny drops them; when the 40-second dead interval expires, R2 declares R1 down. Inserting `permit ospf any any` (or a version limited to R1's address) restores the adjacency. `permit tcp any any eq 89` matches TCP port 89, not the OSPF protocol, and UDP 520 is RIP. Moving the ACL outbound would stop filtering traffic arriving from R1 and filter traffic toward R1 instead, breaking the policy.",
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'An engineer must allow SSH to R1 only from the management subnet 10.1.99.0/24, whichever R1 address the administrator connects to. Which configuration achieves this?',
    options: [
      '`access-list 5 permit 10.1.99.0 0.0.0.255`, then `access-class 5 in` under `line vty 0 15`',
      '`access-list 5 permit 10.1.99.0 0.0.0.255`, then `ip access-group 5 in` under `line vty 0 15`',
      '`access-list 5 permit 10.1.99.0 0.0.0.255`, then `ip access-group 5 in` under interface G0/0/0',
      '`access-list 5 permit 10.1.99.0 255.255.255.0`, then `access-class 5 in` under `line vty 0 15`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`access-class` applies an ACL to the VTY lines, so every Telnet or SSH session is checked by source address no matter which interface or router address it targets. `ip access-group` is an interface command and is not accepted under the VTY lines. Applied to G0/0/0, the standard ACL would drop **all** traffic from non-management hosts entering that interface — not just SSH — and would leave the other interfaces unprotected. `255.255.255.0` is a subnet mask; as a wildcard it matches only addresses ending in .0.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements about IPv6 ACLs on Cisco IOS are true? (Choose two.)',
    options: [
      'They are applied to an interface with `ipv6 traffic-filter`',
      'They match address ranges with wildcard masks',
      'They implicitly permit Neighbor Discovery NA and NS messages before the implicit deny',
      'They can be numbered in the range 100–199',
      'They are divided into standard and extended types',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'IPv6 ACLs are applied with `ipv6 traffic-filter NAME in|out`, and each one ends with implicit `permit icmp any any nd-na`, `permit icmp any any nd-ns` and `deny ipv6 any any`, so neighbor resolution keeps working. They use **prefix lengths** such as /64 rather than wildcard masks, they are **named only**, and there is no standard/extended split — every IPv6 ACL can match protocols and ports.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. ACL 120 is applied inbound on the R1 interface that connects to the user LAN. Users report that they cannot open the web page on 10.2.2.20 over HTTP. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists 120
Extended IP access list 120
    10 permit tcp any eq www host 10.2.2.20
    20 deny ip any host 10.2.2.20 (57 matches)
    30 permit ip any any (10423 matches)`,
    },
    options: [
      'The `www` keyword is not valid in an extended ACL',
      'Entry 10 tests the source port, so web requests fall through to entry 20 and are denied',
      'The ACL must be applied outbound to match traffic from the users',
      'The implicit deny is evaluated before entry 30',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "In entry 10, `eq www` follows the source `any`, so it matches packets **from** port 80. Web requests leave the users from ephemeral ports toward destination port 80, so entry 10 never matches (it shows no counter) and entry 20 denies everything to 10.2.2.20. The fix is `permit tcp any host 10.2.2.20 eq www`. `www` is IOS's display keyword for port 80, inbound is the correct direction for traffic arriving from the LAN, and the implicit deny is always evaluated last.",
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'An engineer applies an ACL inbound on the WAN interface of R1. Its only entry is `permit tcp any 10.1.1.0 0.0.0.255 established`. What is the effect?',
    options: [
      'All TCP, UDP and ICMP replies to 10.1.1.0/24 are permitted',
      'R1 builds a state table and permits only packets of sessions it has seen leave',
      'Outside hosts can open TCP connections to 10.1.1.0/24 once their first SYN is retransmitted',
      'TCP segments with ACK or RST set are permitted to 10.1.1.0/24; new inbound TCP connections and all other traffic are denied',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      "`established` matches TCP segments with **ACK or RST** set, which covers the replies to sessions opened from 10.1.1.0/24. An outside host's first SYN has no ACK and falls to the implicit deny, as does every UDP and ICMP packet. The router keeps no state table — it only checks flag bits — and a retransmitted SYN is still a SYN, so it is denied too.",
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'Which interface configuration command applies the named ACL `WEB-ONLY` to packets entering the interface?',
    answers: ['ip access-group WEB-ONLY in'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip access-group WEB-ONLY in` binds the IPv4 ACL to the interface in the inbound direction. `access-class` is used under the VTY lines, and `ipv6 traffic-filter` is the IPv6 interface command.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'Refer to the exhibit. After these commands are entered, which sequence number does the entry `deny udp any any eq tftp` have?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists EDGE
Extended IP access list EDGE
    10 permit tcp any host 10.2.2.20 eq www
    20 permit tcp any host 10.2.2.20 eq 443
    30 deny ip any 10.2.2.0 0.0.0.255
    40 permit ip any any
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# ip access-list extended EDGE
R1(config-ext-nacl)# no 20
R1(config-ext-nacl)# 35 deny udp any any eq tftp
R1(config-ext-nacl)# exit
R1(config)# ip access-list resequence EDGE 100 20`,
    },
    answers: ['140'],
    placeholder: 'sequence number',
    difficulty: 2,
    explanation:
      'After `no 20` the entries are 10, 30, 35 (the new TFTP deny) and 40. `ip access-list resequence EDGE 100 20` renumbers them in order starting at 100 with an increment of 20: 10 → 100, 30 → 120, 35 → **140** and 40 → 160. Resequencing changes only the numbers, never the order.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'R1 connects LAN 10.1.1.0/24 to a partner WAN on G0/0/1 (no NAT). An inbound ACL on G0/0/1 must permit DNS replies from the partner resolver 172.20.1.53 and replies to TCP sessions opened by LAN hosts. Which two entries are required? (Choose two.)',
    options: [
      '`permit udp host 172.20.1.53 10.1.1.0 0.0.0.255 eq domain`',
      '`permit tcp any 10.1.1.0 0.0.0.255 established`',
      '`permit udp any 10.1.1.0 0.0.0.255 established`',
      '`permit udp host 172.20.1.53 eq domain 10.1.1.0 0.0.0.255`',
      '`permit tcp 10.1.1.0 0.0.0.255 any eq www`',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      "DNS replies come **from** UDP port 53 on the resolver to the client's ephemeral port, so the port condition belongs after the **source**: `permit udp host 172.20.1.53 eq domain 10.1.1.0 0.0.0.255`. TCP replies carry ACK, so `permit tcp any 10.1.1.0 0.0.0.255 established` admits them while blocking new inbound connections. With `eq domain` after the destination, the entry matches traffic **to** port 53 on LAN hosts, not replies. `established` is valid only with TCP, so IOS rejects it on a UDP entry. The entry sourced from 10.1.1.0/24 describes outbound requests, which never arrive inbound on G0/0/1.",
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which single entry permits all TCP traffic from 10.1.1.0/24 to any destination **except** Telnet?',
    options: [
      '`permit tcp 10.1.1.0 0.0.0.255 neq telnet any`',
      '`permit tcp 10.1.1.0 0.0.0.255 any gt telnet`',
      '`permit tcp 10.1.1.0 0.0.0.255 any neq telnet`',
      '`deny tcp 10.1.1.0 0.0.0.255 any eq telnet`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      "`neq telnet` after the destination matches every destination port except 23, so all TCP except Telnet is permitted. Written after the source, `neq telnet` tests the client's source port and would still permit Telnet sessions. `gt telnet` permits only ports 24 and above, so it also blocks ports 1–22, including SSH and FTP. The deny entry blocks Telnet, but on its own the implicit deny then drops all remaining traffic.",
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two statements about IPv4 ACLs on Cisco IOS are true? (Choose two.)',
    options: [
      'A packet that matches no entry is dropped by the implicit deny',
      'The implicit deny appears in `show access-lists` with its own counter',
      'Entries are evaluated from most specific to least specific, regardless of their order',
      'Changes to a named ACL take effect immediately on interfaces where it is applied',
      'An interface can have several inbound IPv4 ACLs at the same time',
    ],
    answers: [0, 3],
    difficulty: 1,
    explanation:
      'Every IPv4 ACL ends with an invisible `deny ip any any`, and edits to an applied ACL take effect **at once**. The implicit deny is never displayed and has no counter — add an explicit `deny ip any any log` if you need one. IOS evaluates entries strictly **top-down** and stops at the first match; it never reorders them by specificity. An interface accepts only one IPv4 ACL per direction.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. LAB-IN is applied inbound on the interface facing 10.1.5.0/24. Host 10.1.5.10 must be able to SSH to server 10.2.2.20 while the rest of 10.1.5.0/24 stays blocked from 10.2.2.0/24, but SSH from 10.1.5.10 fails. Which action fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists LAB-IN
Extended IP access list LAB-IN
    10 deny ip 10.1.5.0 0.0.0.255 10.2.2.0 0.0.0.255 (86 matches)
    20 permit tcp host 10.1.5.10 host 10.2.2.20 eq 22
    30 permit ip any any (12055 matches)`,
    },
    options: [
      'Add `permit tcp host 10.1.5.10 host 10.2.2.20 eq 22` without a sequence number',
      'Insert `5 permit tcp host 10.1.5.10 host 10.2.2.20 eq 22` in ACL configuration mode',
      'Change entry 20 to `permit tcp host 10.1.5.10 eq 22 host 10.2.2.20`',
      'Apply LAB-IN outbound on the same interface',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "Entry 10 denies everything from 10.1.5.0/24 to 10.2.2.0/24 and the first match wins, so the SSH packets from 10.1.5.10 are dropped before entry 20 is ever checked — its counter shows no matches. The exception must sit **above** the broader deny, so it needs a sequence number lower than 10. Added without a number, the entry goes to the end (sequence 40), still below the deny. Moving `eq 22` after the source tests the client's source port. Applied outbound, the ACL would no longer filter the traffic arriving from 10.1.5.0/24 at all.",
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Refer to the exhibit. ACL 130 is applied inbound on the interface that connects to LAN 10.1.1.0/24. Classify each packet arriving from the LAN as permitted or denied.',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists 130
Extended IP access list 130
    10 permit tcp 10.1.1.0 0.0.0.127 host 10.2.2.20 eq www
    20 deny tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 lt 1024
    30 permit udp any any eq domain
    40 permit icmp 10.1.1.0 0.0.0.255 any echo`,
    },
    categories: ['Permitted', 'Denied'],
    items: [
      { text: 'TCP 10.1.1.100 → 10.2.2.20, destination port 80', category: 0 },
      { text: 'TCP 10.1.1.200 → 10.2.2.20, destination port 80', category: 1 },
      { text: 'TCP 10.1.1.50 → 10.2.2.20, destination port 8080', category: 1 },
      { text: 'UDP 10.1.1.200 → 8.8.8.8, destination port 53', category: 0 },
      { text: 'ICMP echo 10.1.1.200 → 10.2.2.20', category: 0 },
      { text: 'TCP 10.1.1.10 → 10.2.2.30, destination port 443', category: 1 },
    ],
    difficulty: 3,
    explanation:
      'Entry 10 covers only 10.1.1.0–10.1.1.127 (wildcard 0.0.0.127), so 10.1.1.100 to port 80 is permitted, while 10.1.1.200 to port 80 skips entry 10 and is denied by entry 20 (80 is less than 1024). Port 8080 is not below 1024, so entry 20 does not match it, and with no later entry covering it the implicit deny drops it. The UDP DNS query matches entry 30 and the ping matches entry 40, so both are permitted. TCP to 10.2.2.30 matches no entry at all — entry 20 names only host 10.2.2.20 — so the implicit deny drops it.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'An extended ACE must match source hosts 10.1.1.64 through 10.1.1.95 only. Which source address and wildcard should it use?',
    options: ['`10.1.1.64 0.0.0.63`', '`10.1.1.64 0.0.0.32`', '`10.1.1.64 255.255.255.224`', '`10.1.1.64 0.0.0.31`'],
    answer: 3,
    difficulty: 2,
    explanation:
      '64 through 95 is a block of 32 addresses (a /27), so the wildcard is 32 − 1 = **0.0.0.31**; in binary the last octet must be `010xxxxx`. `0.0.0.63` matches a block of 64, 10.1.1.64–10.1.1.127. `0.0.0.32` is a discontiguous wildcard that matches only 10.1.1.64 and 10.1.1.96. `255.255.255.224` is the /27 subnet mask, not a wildcard; used as a wildcard it would ignore the first three octets.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Which command shows whether an IPv4 ACL is applied inbound or outbound on interface GigabitEthernet0/0/0?',
    options: [
      '`show ip interface GigabitEthernet0/0/0`',
      '`show access-lists`',
      '`show interfaces GigabitEthernet0/0/0`',
      '`show ip route`',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '`show ip interface` lists the "Outgoing access list is …" and "Inbound access list is …" lines for the interface. `show access-lists` shows entries and counters but not where each ACL is applied, `show interfaces` shows Layer 1/2 status and traffic counters, and `show ip route` shows the routing table.',
  },
];
