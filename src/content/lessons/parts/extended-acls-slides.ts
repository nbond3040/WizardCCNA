import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Extended & Named ACLs',
    subtitle: 'Protocols, destinations and ports — and how to edit, place and troubleshoot them',
    notes:
      "Standard ACLs can only ask “who sent this?”. **Extended ACLs** ask far more precise questions: which **protocol** is this (TCP, UDP, ICMP, OSPF…), **where** is it going, and which **port** — which application — does it use? That precision lets you permit web access to one server while blocking Telnet to the same host, allow replies to sessions your users started while rejecting new inbound connections, or let OSPF through a filter that blocks almost everything else. In this lesson you will build extended ACLs in numbered (100–199, 2000–2699) and named form, use the port operators `eq`, `neq`, `gt`, `lt` and `range` on the correct side of the entry, use `established`, edit named ACLs with sequence numbers and `ip access-list resequence`, protect the VTY lines with `access-class`, and design and troubleshoot ACLs from written requirements — the heart of exam topic 5.6 (v1.1) and of the ACL objectives in v2.0 domain 4. You will finish with the IPv6 ACL essentials: `ipv6 traffic-filter` and the implicit Neighbor Discovery permits.",
  },
  {
    kind: 'diagram',
    title: 'Anatomy of an extended ACE',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'permit | deny', sub: 'action', shape: 'pill' },
        { id: 'p', label: 'tcp', sub: 'protocol' },
        { id: 's', label: '10.1.1.0 0.0.0.255', sub: 'source + wildcard' },
        { id: 'sp', label: 'source port', sub: 'optional', tone: 'muted' },
        { id: 'd', label: 'host 10.2.2.20', sub: 'destination + wildcard' },
        { id: 'dp', label: 'eq 443', sub: 'destination port', tone: 'accent' },
      ],
    },
    caption: '`access-list 110 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443 log` — options such as `established` and `log` come last.',
    notes:
      "Every extended ACE follows the same left-to-right grammar, and reading it in that order is the key to every exam question. After the **action** comes the **protocol** — `ip` for any IPv4 packet, or a specific one such as `tcp`, `udp`, `icmp` or `ospf`. Next is the **source** address with its wildcard (or `host` / `any`). If the protocol is TCP or UDP, an optional **source port** condition may follow. Then comes the **destination** address and wildcard, and after it an optional **destination port** condition. Options such as `established` (TCP only) and `log` go at the very end. Both addresses are mandatory in an extended ACE: even if you only care about the destination, you must write `any` for the source. The example reads: permit TCP from any host in 10.1.1.0/24, from any source port, to host 10.2.2.20, destination port 443 (HTTPS), and log the matches. The same entry numbered in the 100–199 or 2000–2699 range, or typed inside `ip access-list extended NAME`, behaves identically — numbered and named extended ACLs differ only in how you manage them.",
  },
  {
    kind: 'table',
    title: 'Protocol keywords',
    columns: ['Keyword', 'Matches', 'Port operators?'],
    rows: [
      ['`ip`', 'Every IPv4 packet, whatever it carries', 'No'],
      ['`tcp`', 'IP protocol 6', '**Yes** — `eq`, `neq`, `gt`, `lt`, `range`'],
      ['`udp`', 'IP protocol 17', '**Yes**'],
      ['`icmp`', 'IP protocol 1; optional type such as `echo`, `echo-reply`', 'No — ICMP types instead'],
      ['`ospf`', 'IP protocol 89 (hellos, LSAs)', 'No'],
      ['`eigrp`', 'IP protocol 88', 'No'],
      ['`gre` / `esp`', 'IP protocols 47 / 50 (tunnels, IPsec)', 'No'],
    ],
    caption: 'Port numbers exist only in TCP and UDP.',
    notes:
      "The protocol field decides what else the entry may contain. `ip` matches every IPv4 packet regardless of what it carries, so `deny ip any any` really means everything. The named protocols match one value of the IPv4 header's Protocol field: TCP is 6, UDP 17, ICMP 1, OSPF 89, EIGRP 88, GRE 47 and ESP 50, and you can also type the number itself (0–255). Only **TCP and UDP** have ports, so only `tcp` and `udp` entries accept port operators; IOS rejects `permit ip any any eq 80` because IP has no ports. ICMP entries can instead name an ICMP message type — `echo` (a ping request), `echo-reply`, `unreachable`, `time-exceeded` and others — which lets you allow ping replies in while blocking inbound ping requests. Remember that OSPF and EIGRP are **not** carried in TCP or UDP: to permit them you write `permit ospf …` or `permit eigrp …`, never a port number. A frequent exam distractor claims that `permit tcp any any` also allows ping; it does not, because ICMP is a different protocol from TCP.",
  },
  {
    kind: 'table',
    title: 'Ports and IOS keywords to memorize',
    columns: ['Port', 'Service', 'Transport', 'IOS keyword'],
    rows: [
      ['20, 21', 'FTP data, control', 'TCP', '`ftp-data`, `ftp`'],
      ['22', 'SSH', 'TCP', '— (use `22`)'],
      ['23', 'Telnet', 'TCP', '`telnet`'],
      ['25', 'SMTP', 'TCP', '`smtp`'],
      ['53', 'DNS', 'UDP (and TCP)', '`domain`'],
      ['67, 68', 'DHCP server, client', 'UDP', '`bootps`, `bootpc`'],
      ['69', 'TFTP', 'UDP', '`tftp`'],
      ['80', 'HTTP', 'TCP', '`www`'],
      ['110', 'POP3', 'TCP', '`pop3`'],
      ['123', 'NTP', 'UDP', '`ntp`'],
      ['161, 162', 'SNMP, SNMP traps', 'UDP', '`snmp`, `snmptrap`'],
      ['443', 'HTTPS', 'TCP', '— (use `443`)'],
      ['514', 'Syslog', 'UDP', '`syslog`'],
    ],
    caption: 'IOS displays well-known ports by keyword: `eq 80` appears as `eq www`.',
    notes:
      "Extended ACL questions assume you know which transport and port each common service uses. Pay special attention to the transport column, because choosing `tcp` for a UDP service (or the reverse) creates an entry that never matches. DNS queries normally use **UDP** 53, with TCP 53 used for zone transfers and large responses; DHCP uses **UDP** 67 on the server side and 68 on the client side; and TFTP, NTP, SNMP and syslog are all UDP. SSH, Telnet, HTTP, HTTPS, SMTP, POP3 and FTP run over **TCP**. IOS accepts either numbers or keywords, and when it displays an ACL it prints the keyword for well-known ports: type `eq 80` and `show access-lists` shows `eq www`; type `range 20 21` and it shows `range ftp-data ftp`. Ports without a classic keyword, such as 22 and 443, appear as numbers. Exam exhibits use this display form, so be fluent in both directions: `www` is 80, `domain` is 53, `bootps` is 67, `telnet` is 23.",
  },
  {
    kind: 'bullets',
    title: 'Source port or destination port?',
    bullets: [
      'Port **after the source** = source port',
      'Port **after the destination** = destination port',
      'Requests: client ephemeral port → server well-known port',
      '`permit tcp any host 10.2.2.20 eq www` = traffic **to** the server',
      '`permit tcp host 10.2.2.20 eq www any` = its **replies**',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client 10.1.1.10', icon: 'pc' },
        { id: 's', label: 'Web server 10.2.2.20', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'Request', sub: 'src 10.1.1.10:51000 → dst 10.2.2.20:80', tone: 'accent' },
        { from: 's', to: 'c', label: 'Reply', sub: 'src 10.2.2.20:80 → dst 10.1.1.10:51000' },
        { note: 'Port 80 is the destination going in and the source coming back' },
      ],
    },
    notes:
      "This is the single most common extended-ACL trap. The position of a port condition decides which port it tests: a condition written **right after the source address** tests the **source port**; one written **after the destination address** tests the **destination port**. When a client opens a web session, it sends from a random high **ephemeral** port to the server's well-known port 80, and the server's replies come back from port 80 to that ephemeral port. So `permit tcp any host 10.2.2.20 eq www` matches requests **to** the web server, while `permit tcp host 10.2.2.20 eq www any` matches the server's **replies**. Both are valid syntax, and exam distractors swap them. When you read an entry, say it out loud in order: “permit TCP, from any source, to host 10.2.2.20, destination port 80”. When you write an entry that lets users reach a service, the service port almost always belongs after the destination. Source-port conditions are mainly used for return traffic, such as DNS replies that come **from** UDP port 53.",
  },
  {
    kind: 'table',
    title: 'Port operators',
    columns: ['Operator', 'Meaning', 'Example', 'Matches'],
    rows: [
      ['`eq`', 'Equal to', '`eq 443`', 'Port 443 only'],
      ['`neq`', 'Not equal to', '`neq telnet`', 'Every port except 23'],
      ['`gt`', 'Greater than', '`gt 1023`', 'Ports 1024–65535'],
      ['`lt`', 'Less than', '`lt 1024`', 'Ports 0–1023'],
      ['`range`', 'Inclusive range', '`range 20 21`', 'Ports 20 and 21'],
    ],
    caption: '`gt` and `lt` exclude the value itself; `range` includes both ends.',
    notes:
      "Five operators compare the port in the packet with the value in the entry. `eq` is by far the most common: one exact port. `neq` matches every port **except** the one given — `permit tcp any any neq telnet` allows all TCP except Telnet. `gt` and `lt` are strict comparisons that **exclude** the value itself: `gt 1023` means 1024 and above (the registered and ephemeral ranges), and `lt 1024` means 0 through 1023 (the well-known ports). `range` takes two values and **includes** both ends, so `range 20 21` covers FTP data and control. Operators can be used on either side of an entry, for the source port or the destination port. To match several unrelated ports — say 80 and 443 — the clear, exam-standard approach is one entry per port, which is exactly what exam answer options usually show. Typical calculation questions: “which ports does `gt 1023` match?” (1024–65535) and “which condition matches ports 20 through 25?” (`range 20 25`). Combining two operators on the same port, such as `gt 19 lt 26`, is not valid syntax.",
  },
  {
    kind: 'cli',
    title: 'A numbered extended ACL, designed and applied',
    code: `R1(config)# access-list 110 remark LAN1: web and DNS to 10.2.2.0/24 only
R1(config)# access-list 110 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq www
R1(config)# access-list 110 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443
R1(config)# access-list 110 permit udp 10.1.1.0 0.0.0.255 host 10.2.2.53 eq domain
R1(config)# access-list 110 deny ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255
R1(config)# access-list 110 permit ip any any
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip access-group 110 in
R1(config-if)# end
R1# show access-lists 110
Extended IP access list 110
    10 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq www (231 matches)
    20 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443 (1873 matches)
    30 permit udp 10.1.1.0 0.0.0.255 host 10.2.2.53 eq domain (96 matches)
    40 deny ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255 (14 matches)
    50 permit ip any any (5120 matches)`,
    highlight: ['ip access-group 110 in', 'permit ip any any', '(14 matches)'],
    caption: 'Specific permits → subnet deny → final permit; applied inbound on the LAN1 interface.',
    notes:
      "Here is a complete policy for LAN1 (10.1.1.0/24), which connects to R1 G0/0/0. The requirements: LAN1 users may reach web server 10.2.2.20 with HTTP and HTTPS and DNS server 10.2.2.53 with DNS; they may reach nothing else in the 10.2.2.0/24 server subnet; all other traffic is allowed. Each requirement becomes one entry — the specific permits first, then the broader deny for the server subnet, then `permit ip any any` so that the implicit deny does not block LAN1's Internet and inter-branch traffic. Because an extended ACL identifies the destination precisely, it is applied **inbound on G0/0/0**, the interface closest to the source, so unwanted packets are discarded as soon as they enter R1. The counters confirm the design: HTTPS is the busiest entry, 14 packets were blocked by the server-subnet deny and everything else flowed through entry 50. Notice that the ACL never mentions return traffic: replies from the servers enter R1 on a different interface, so this inbound ACL never sees them. The `remark` documents intent in the running-config but is not displayed by `show access-lists`.",
  },
  {
    kind: 'table',
    title: 'Predicting the effect: walk the packets',
    columns: ['Packet from 10.1.1.5', 'First match in ACL 110', 'Result'],
    rows: [
      ['TCP → 10.2.2.20 port 443', '20 (HTTPS permit)', 'Permitted'],
      ['TCP → 10.2.2.20 port 23 (Telnet)', '40 (server-subnet deny)', '**Denied**'],
      ['UDP → 10.2.2.53 port 53', '30 (DNS permit)', 'Permitted'],
      ['TCP → 10.2.2.53 port 53', '40 — entry 30 is UDP only', '==**Denied**=='],
      ['UDP → 8.8.8.8 port 53', '50 (`permit ip any any`)', 'Permitted'],
      ['ICMP echo → 10.2.2.20', '40 (server-subnet deny)', '**Denied**'],
    ],
    caption: 'For every entry, test protocol, source, destination and port — all must match.',
    notes:
      "Predicting what an ACL does to specific traffic is a core exam skill, and the method never changes: for each packet, walk the entries from the top and test **every** field of each entry — protocol, source, destination and port — until one entry matches completely. An HTTPS session to 10.2.2.20 fails entry 10 (wrong port) and matches entry 20. Telnet to the same server passes no permit, so it reaches entry 40, the deny for the whole server subnet. A normal DNS query over UDP matches entry 30, but a DNS request over **TCP** port 53 — used for large responses and zone transfers — does not, because entry 30 says `udp`; it falls to entry 40 and is denied. That subtle protocol mismatch is exactly the kind of detail exam questions hide. DNS to an outside resolver such as 8.8.8.8 is outside 10.2.2.0/24, so it skips entry 40 and is permitted by entry 50. Finally, a ping to the web server is ICMP, which no permit covers, so entry 40 denies it; an IOS ping would display `U`, unreachable because it is administratively prohibited.",
  },
  {
    kind: 'bullets',
    title: 'The established keyword',
    bullets: [
      'Matches TCP segments with the **ACK** or **RST** bit set',
      'Lets replies to inside-initiated sessions back in',
      'Blocks new inbound connections — a first SYN has no ACK',
      'TCP only: UDP and ICMP replies need their own entries',
      '**Not stateful**: a crafted ACK segment still matches',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'Inside PC 10.1.1.10', icon: 'pc' },
        { id: 'r1', label: 'R1 (WAN-IN inbound)', icon: 'router' },
        { id: 'ext', label: 'Outside hosts', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'ext', label: 'SYN to 172.20.1.80:80', sub: 'outbound — WAN-IN not involved' },
        { from: 'ext', to: 'r1', label: 'SYN-ACK', sub: 'ACK set → matches established', tone: 'good' },
        { from: 'r1', to: 'pc', label: 'SYN-ACK forwarded' },
        { from: 'ext', to: 'r1', label: 'New SYN from 203.0.113.9', sub: 'no ACK or RST → implicit deny', tone: 'bad', dashed: true },
        { note: 'permit tcp any 10.1.1.0 0.0.0.255 established' },
      ],
    },
    notes:
      "Often you want inside users to open TCP connections to the outside while refusing connections that start outside. The `established` keyword, placed at the end of a TCP entry, approximates that. It matches any TCP segment that has the **ACK** or **RST** flag set. The very first segment of a new connection, a SYN, has neither flag, so it does not match; every later segment of an existing connection — including the server's SYN-ACK and all data — carries ACK and does match. Applied inbound on the WAN interface, `permit tcp any 10.1.1.0 0.0.0.255 established` therefore lets replies to inside-initiated sessions in, while outside hosts cannot start new sessions toward the LAN. Know the limits, because the exam asks about them. It works only for **TCP**: UDP replies such as DNS answers and ICMP echo replies need their own entries. And it is **not stateful**: the router does not remember which sessions exist, it only inspects flag bits, so an attacker can craft segments with ACK set that pass. Real stateful inspection is the job of a firewall or the IOS zone-based firewall.",
  },
  {
    kind: 'cli',
    title: 'An edge ACL with OSPF, ICMP and established',
    code: `R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# permit ospf host 10.0.12.2 any
R1(config-ext-nacl)# permit tcp any 10.1.1.0 0.0.0.255 established
R1(config-ext-nacl)# permit icmp any 10.1.1.0 0.0.0.255 echo-reply
R1(config-ext-nacl)# permit icmp any 10.1.1.0 0.0.0.255 unreachable
R1(config-ext-nacl)# permit udp host 172.20.1.53 eq domain 10.1.1.0 0.0.0.255
R1(config-ext-nacl)# deny ip any any log
R1(config-ext-nacl)# exit
R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip access-group WAN-IN in
R1(config-if)# end
R1# show access-lists WAN-IN
Extended IP access list WAN-IN
    10 permit ospf host 10.0.12.2 any (1450 matches)
    20 permit tcp any 10.1.1.0 0.0.0.255 established (8812 matches)
    30 permit icmp any 10.1.1.0 0.0.0.255 echo-reply (41 matches)
    40 permit icmp any 10.1.1.0 0.0.0.255 unreachable (3 matches)
    50 permit udp host 172.20.1.53 eq domain 10.1.1.0 0.0.0.255 (380 matches)
    60 deny ip any any log (97 matches)`,
    highlight: ['permit ospf host 10.0.12.2 any', 'established', 'eq domain 10.1.1.0'],
    caption: 'Entry 50 uses a source port: DNS replies come from UDP 53.',
    notes:
      "This named ACL protects LAN 10.1.1.0/24 from a partner WAN attached to G0/0/1. Read it entry by entry. Entry 10 keeps the **OSPF** adjacency with the neighbor at 10.0.12.2 alive; without it, the hellos that arrive on this interface would hit the final deny. Entry 20 is the `established` rule for TCP replies. Entries 30 and 40 allow ICMP **echo-replies** (so inside users can ping out) and **unreachables** (so error messages, including those path MTU discovery depends on, get through), while inbound echo requests are refused. Entry 50 shows a **source-port** condition in action: it permits DNS **replies**, which come **from** UDP port 53 on the partner's resolver 172.20.1.53, to the LAN. Entry 60 replaces the silent implicit deny with an explicit `deny ip any any log`, which gives the final drop a counter and sends syslog messages for denied packets (IOS rate-limits them). The counters show a healthy picture, with 97 unsolicited packets blocked. Notice that no outbound ACL is needed: R1's own OSPF hellos leave through G0/0/1 without being checked by any ACL on R1.",
  },
  {
    kind: 'diagram',
    title: 'Place extended ACLs close to the source',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a', icon: 'pc', label: 'LAN A', sub: '10.1.1.0/24', x: 1, y: 1.3 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.3, y: 2.5 },
        { id: 'web', icon: 'server', label: 'Intranet web', sub: '10.3.3.80', x: 9, y: 1.3 },
        { id: 'b', icon: 'pc', label: 'LAN B', sub: '10.2.2.0/24', x: 9, y: 3.7 },
      ],
      links: [
        { from: 'a', to: 'r1', toLabel: 'G0/0/0', label: '✓ ACL 120 in', tone: 'good' },
        { from: 'r1', to: 'r2', label: 'WAN' },
        { from: 'r2', to: 'web', fromLabel: 'G0/0/1' },
        { from: 'r2', to: 'b', fromLabel: 'G0/0/2' },
      ],
      annotations: [{ x: 5, y: 4.5, text: 'Denied packets never cross the WAN', tone: 'good' }],
    },
    caption: 'ACL 120: `deny tcp 10.1.1.0 0.0.0.255 host 10.3.3.80 eq www`, then `permit ip any any` — inbound on R1 G0/0/0.',
    notes:
      "Because an extended ACL can describe the destination and the application, it can safely sit **next to the source**. In this topology LAN A must not reach the intranet web server 10.3.3.80 on port 80, but everything else must keep working. ACL 120 — `deny tcp 10.1.1.0 0.0.0.255 host 10.3.3.80 eq www` followed by `permit ip any any` — applied **inbound on R1 G0/0/0** stops those packets the moment they enter the network. Nothing else from LAN A is affected: traffic to LAN B, to other ports on the web server or to the Internet matches the final permit. Compare that with the standard ACL you placed near the destination in the previous lesson, whose doomed packets crossed the WAN before being dropped. Near-source placement saves bandwidth and CPU on every router along the path. It is a best practice rather than a technical requirement — the same ACL would also work outbound on R2 G0/0/1, and in real designs you can only filter on routers you manage. On the exam, when asked where an extended ACL should go, choose the interface **closest to the source**, inbound.",
  },
  {
    kind: 'steps',
    title: 'Designing an ACL from requirements',
    steps: [
      { title: 'Write each rule in plain words', text: '“LAN1 may use HTTPS to 10.2.2.20; nothing else to 10.2.2.0/24.”' },
      { title: 'Pin down every field', text: 'Protocol, source, destination, port — and which way the flow travels.' },
      { title: 'Order specific before general', text: 'Host entries before subnet entries; exceptions before the rule they carve out of.' },
      { title: 'Decide the ending', text: 'A final `permit ip any any`, or rely on the implicit deny?' },
      { title: 'Choose router, interface, direction', text: 'Extended ACLs: inbound, closest to the source.' },
      { title: 'Apply, test and read counters', text: 'Generate each flow; the expected entry’s counter must move.' },
    ],
    notes:
      "Most scenario items are really design exercises, and a fixed process prevents mistakes. First, restate each requirement as a sentence with an action. Second, translate each sentence into the fields of an ACE — protocol, source, destination and port — plus the direction the traffic flows, remembering which side the port belongs on. Third, **order** the entries: specific exceptions (one host, one port) above the broader rules they carve out of, because the first match wins. Fourth, decide explicitly how the ACL ends. If the policy is “block these things, allow the rest”, you need `permit ip any any`; if it is “allow only these things”, the implicit deny does the work — but check that you have not forgotten essential traffic such as DNS, DHCP or routing protocols. Fifth, place it: extended ACLs go inbound on the interface nearest the source. Finally, test each flow and watch the counter of the entry you expect to match. If the wrong counter moves, the order or a field is wrong; if no counter moves at all, the placement or direction is wrong.",
  },
  {
    kind: 'cli',
    title: 'Editing named ACLs with sequence numbers',
    code: `R1# show access-lists LAN1-IN
Extended IP access list LAN1-IN
    10 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq www
    20 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443
    30 deny ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255
    40 permit ip any any
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# ip access-list extended LAN1-IN
R1(config-ext-nacl)# 25 permit udp 10.1.1.0 0.0.0.255 host 10.2.2.53 eq domain
R1(config-ext-nacl)# no 10
R1(config-ext-nacl)# exit
R1(config)# ip access-list resequence LAN1-IN 10 10
R1(config)# end
R1# show access-lists LAN1-IN
Extended IP access list LAN1-IN
    10 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.20 eq 443
    20 permit udp 10.1.1.0 0.0.0.255 host 10.2.2.53 eq domain
    30 deny ip 10.1.1.0 0.0.0.255 10.2.2.0 0.0.0.255
    40 permit ip any any`,
    highlight: ['25 permit udp', 'no 10', 'ip access-list resequence LAN1-IN 10 10'],
    caption: 'Insert with a number in between, delete with `no <seq>`, renumber with `resequence`.',
    notes:
      "Named ACLs — and numbered ACLs opened with `ip access-list extended 110` — can be edited line by line using **sequence numbers**. To **insert** an entry, type it with a number that falls between existing ones: `25 permit udp …` lands between 20 and 30. To **delete** one entry, type `no` followed by its number: `no 10` removes only the HTTP permit and leaves the rest untouched, whereas the old global `no access-list 110 …` syntax risks deleting the whole list. After those two edits the entries are numbered 20, 25, 30 and 40; after many insertions the numbers become crowded and leave no gap for the next one. `ip access-list resequence LAN1-IN 10 10`, a global configuration command, renumbers the entries starting at 10 with an increment of 10, restoring the gaps without changing their order. Changes take effect **immediately** on every interface where the ACL is applied — there is no need to remove and re-apply `ip access-group`. That is convenient but risky on a live router: insert new permits before deleting old ones, and never remove the permit that carries your own management session.",
  },
  {
    kind: 'cli',
    title: 'Restricting VTY access with access-class',
    code: `R1(config)# ip access-list standard VTY-ADMINS
R1(config-std-nacl)# permit 10.1.99.0 0.0.0.255
R1(config-std-nacl)# deny any log
R1(config-std-nacl)# exit
R1(config)# line vty 0 15
R1(config-line)# access-class VTY-ADMINS in
R1(config-line)# end
R2# ssh -l admin 10.1.12.1
% Connection refused by remote host
R1# show access-lists VTY-ADMINS
Standard IP access list VTY-ADMINS
    10 permit 10.1.99.0, wildcard bits 0.0.0.255 (6 matches)
    20 deny   any log (1 match)`,
    highlight: ['access-class VTY-ADMINS in', 'line vty 0 15', '% Connection refused by remote host'],
    caption: 'R2 (10.1.12.2) is not in 10.1.99.0/24, so its SSH attempt is refused before any login prompt.',
    notes:
      "Interface ACLs are a clumsy way to protect the router's own management plane: you would have to filter SSH on every interface and remember every address the router owns. **`access-class`** solves this by applying an ACL directly to the **VTY lines**. With `access-class VTY-ADMINS in`, any Telnet or SSH session whose **source** address is not permitted is refused before the login prompt, no matter which interface or router address it targets. A standard ACL is the usual choice because only the source matters. Here only the management subnet 10.1.99.0/24 may connect; the explicit `deny any log` adds a counter and a syslog message for refused attempts — R2's attempt from 10.1.12.2 is the single match. Two rules for the exam. First, apply the same `access-class` to **every** VTY range (`line vty 0 15` here), because a session can land on any line. Second, the direction matters: `in` filters connections **to** the device, while `access-class … out` restricts where users who are logged in to the router may Telnet or SSH onward. For IPv6 management, the equivalent is `ipv6 access-class NAME in`.",
  },
  {
    kind: 'compare',
    title: 'access-class vs ip access-group',
    left: {
      heading: 'access-class (line vty)',
      bullets: [
        'Configured under `line vty`',
        'Filters Telnet/SSH sessions **to** the device',
        'Independent of which interface is used',
        'Usually a standard ACL (source only)',
      ],
    },
    right: {
      heading: 'ip access-group (interface)',
      tone: 'accent',
      bullets: [
        'Configured under an interface, `in` or `out`',
        'Filters **every** IPv4 packet crossing it',
        'Transit traffic and traffic to the router',
        'Standard or extended ACL',
      ],
    },
    notes:
      "Both commands attach an ACL, but they answer different questions. `access-class` lives under the VTY lines and asks only “may this source open a management session to me?”. It sees nothing else — not transit traffic, not OSPF, not pings — and it keeps protecting the device even when new interfaces or addresses are added later. `ip access-group` lives under an interface and checks **every** IPv4 packet that crosses that interface in the chosen direction, whether it is passing through the router or addressed to it. Protecting SSH with `ip access-group` would require an extended ACL on every interface that permits the admin subnet to the router's addresses on port 22 and permits all other traffic — far more fragile. A common exam distractor puts `ip access-group` under `line vty` or `access-class` under an interface; neither is correct. Another applies an admin-only standard ACL with `ip access-group` on a LAN interface, which blocks every user on that LAN rather than just their SSH sessions. Remember the pairing: lines use `access-class`, interfaces use `ip access-group` — and `ipv6 traffic-filter` for IPv6.",
  },
  {
    kind: 'table',
    title: 'Common extended ACL mistakes',
    columns: ['Mistake', 'Symptom', 'Fix'],
    rows: [
      ['Wrong interface or direction', 'Counters never move; traffic unaffected', 'Trace the flow; inbound nearest the source'],
      ['Specific entry below a broader one', 'The exception never matches', 'Re-insert it with a lower sequence number'],
      ['No final permit', 'Everything not listed is dropped', '`permit ip any any` if the policy allows'],
      ['Routing protocol not permitted', 'Neighbors drop after the dead timer', '`permit ospf …` / `permit eigrp …`'],
      ['Port on the wrong side', 'Requests or replies never match', 'Service port after the destination'],
      ['Wrong transport (TCP vs UDP)', 'DNS, NTP or SNMP silently fail', 'Check the service’s transport'],
      ['DHCP or DNS forgotten', 'No addresses, no name resolution', '`permit udp any any eq bootps`; permit DNS'],
    ],
    notes:
      "These seven mistakes cause almost every ACL outage. The **wrong interface or direction** is the most common: the ACL is perfect, but the traffic never passes where it is applied, so its counters stay at zero. **Order** errors let a broad entry match before the exception you wrote for it. A missing **final permit** turns a policy of “block a few things” into “block everything”. **Routing protocols** are easy to forget because nobody “uses” them: an inbound ACL without `permit ospf` drops the hellos, and the adjacency dies when the dead timer expires — 40 seconds later by default on Ethernet, long after you pressed Enter. **Port position** and **transport** errors create entries that look right but never match, such as DNS allowed only over TCP or a web port written after the source. Finally, allow-list ACLs often forget infrastructure traffic: DHCP clients send their first DISCOVER from 0.0.0.0 to 255.255.255.255 on UDP port 67, so a permit that names the LAN subnet as the source will not match it. When troubleshooting, the counters tell you which mistake you are facing.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: the ACL that broke OSPF',
    code: `R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# permit tcp any 10.1.1.0 0.0.0.255 established
R1(config-ext-nacl)# permit icmp any 10.1.1.0 0.0.0.255 echo-reply
R1(config-ext-nacl)# exit
R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip access-group WAN-IN in
R1(config-if)# end
%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/0/1 from FULL to DOWN, Neighbor Down: Dead timer expired
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# 5 permit ospf host 10.0.12.2 any
R1(config-ext-nacl)# end
%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/0/1 from LOADING to FULL, Loading Done`,
    highlight: ['Dead timer expired', '5 permit ospf host 10.0.12.2 any'],
    caption: 'OSPF is IP protocol 89: neither `established` nor an ICMP entry can match it.',
    notes:
      "Here is a classic outage. The engineer applies WAN-IN inbound on the WAN interface to allow only replies to inside users, and it works — for about 40 seconds. Then the OSPF adjacency with R2 (router ID 2.2.2.2) goes down with the reason **Dead timer expired**. Why? OSPF hellos from R2 arrive on G0/0/1 as IP protocol 89 packets addressed to 224.0.0.5. They are not TCP, so `established` cannot match them, and they are not ICMP, so they fall through to the implicit deny. R1 stops hearing hellos, and after the dead interval (four times the 10-second hello on Ethernet) it declares the neighbor down, withdrawing every OSPF route learned through R2. The fix is one line inserted at the top with a low sequence number: `permit ospf host 10.0.12.2 any` (or `permit ospf any any`). The adjacency returns to FULL as soon as hellos flow again. Two lessons for the exam: inbound ACLs on routed links must explicitly permit the routing protocol (OSPF 89, EIGRP 88), and the failure is delayed by the dead timer, so the symptom appears some time after the change. An outbound ACL would not have caused this, because R1's own hellos are never filtered by R1.",
  },
  {
    kind: 'cli',
    title: 'IPv6 ACLs: the essentials',
    code: `R1(config)# ipv6 access-list LAN6-IN
R1(config-ipv6-acl)# deny tcp 2001:DB8:1:1::/64 any eq telnet
R1(config-ipv6-acl)# permit ipv6 any any
R1(config-ipv6-acl)# exit
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 traffic-filter LAN6-IN in
R1(config-if)# end
R1# show ipv6 access-list LAN6-IN
IPv6 access list LAN6-IN
    deny tcp 2001:DB8:1:1::/64 any eq telnet (4 matches) sequence 10
    permit ipv6 any any (310 matches) sequence 20`,
    highlight: ['ipv6 traffic-filter LAN6-IN in', '2001:DB8:1:1::/64'],
    bullets: [
      'Named only; every IPv6 ACL can match ports and protocols',
      'Prefix notation such as `/64` — no wildcard masks',
      'Interfaces: `ipv6 traffic-filter`; VTYs: `ipv6 access-class`',
      'Implicit `permit icmp any any nd-na` and `nd-ns` before the implicit `deny ipv6 any any`',
    ],
    notes:
      "IPv6 filtering follows the same principles — top-down, first match, implicit deny — with a few differences worth knowing for the exam. IPv6 ACLs are always **named** (`ipv6 access-list NAME`, prompt `config-ipv6-acl`), and there is no standard/extended split: every entry can match protocol, source, destination and ports. Addresses are written as **prefixes** such as `2001:DB8:1:1::/64`; there are no wildcard masks, and `host` and `any` work as usual. You apply the ACL to an interface with **`ipv6 traffic-filter NAME in|out`**, not `ip access-group`, and to VTY lines with `ipv6 access-class`. The biggest difference is at the end: because IPv6 relies on **Neighbor Discovery** instead of ARP, every IPv6 ACL ends with implicit `permit icmp any any nd-na` and `permit icmp any any nd-ns` entries **before** the implicit `deny ipv6 any any`. That keeps neighbor resolution working through a filter. If you add your own `deny ipv6 any any` at the bottom, it is evaluated before those implicit permits and breaks ND, so add explicit `nd-na` and `nd-ns` permits above it. Note that IOS displays IPv6 sequence numbers at the end of each line.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: extended ACLs',
    body: 'Read every ACE in order — ==protocol, source, source port, destination, destination port== — then check which way the traffic flows.',
    bullets: [
      'Extended 100–199 and 2000–2699; place near the source, inbound',
      'Port after the source = source port; replies come **from** well-known ports',
      '`gt` and `lt` exclude the value; `range` includes both ends',
      '`established` = ACK or RST set; TCP only; not stateful',
      'Permit OSPF (89) or EIGRP (88) through inbound ACLs',
      '`access-class` for VTYs, `ip access-group` for interfaces, `ipv6 traffic-filter` for IPv6',
    ],
    notes:
      "These traps decide most extended-ACL items. First, parse entries strictly left to right; a port that follows the source address is a **source** port, and exam writers love an entry such as `permit tcp any eq 80 host 10.2.2.20`, which does not match web requests to that server. Second, remember the numbers and the placement rule: extended ACLs are 100–199 and 2000–2699 and belong near the source. Third, compute operators carefully: `gt 1023` starts at 1024, `lt 1024` ends at 1023, and `range` is inclusive. Fourth, `established` checks only the ACK and RST bits; it neither tracks sessions nor covers UDP or ICMP. Fifth, any inbound ACL on a routed link must permit the routing protocol, and the failure shows up only after the dead timer. Sixth, match each command to its place: `access-class` on lines, `ip access-group` on interfaces, `ipv6 traffic-filter` for IPv6 interfaces. Finally, when an entry must be inserted above an existing one, the answer is a sequence number lower than that entry's, typed in ACL configuration mode.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Extended ACLs match protocol, source, destination and ports',
      'Grammar: action, protocol, src [port], dst [port], options',
      'Operators `eq`, `neq`, `gt`, `lt`, `range`; `established` for TCP replies',
      'Place extended ACLs close to the source, usually inbound',
      'Edit named ACLs by sequence number; `ip access-list resequence`',
      'Protect VTYs with `access-class`; permit routing protocols explicitly',
      'IPv6: named, prefixes, `ipv6 traffic-filter`, implicit ND permits',
    ],
    notes:
      "Let's recap. Extended ACLs — numbered 100–199 and 2000–2699, or named with `ip access-list extended` — match the protocol, the source and destination addresses and, for TCP and UDP, the ports, so they can express precise policies and belong close to the source. Every entry reads left to right: action, protocol, source with optional source port, destination with optional destination port, then options such as `established` and `log`. The port operators are `eq`, `neq`, `gt`, `lt` and the inclusive `range`, and the side a port appears on decides whether it is a source or destination port. `established` matches TCP segments with ACK or RST set and is not stateful. Named ACLs are edited by sequence number and tidied with `ip access-list resequence`, with changes taking effect immediately. `access-class` protects the VTY lines on every range. Design from requirements, order specific before general, remember DNS, DHCP and routing protocols, and verify with counters. IPv6 ACLs are named, use prefixes, are applied with `ipv6 traffic-filter` and implicitly permit ND.",
  },
];
