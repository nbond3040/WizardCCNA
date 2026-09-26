import type { Slide } from '../../types';

export const natSlidesA: Slide[] = [
  {
    kind: 'title',
    title: 'Network Address Translation',
    subtitle: 'Inside/outside local/global, static NAT, dynamic pools and PAT',
    notes:
      "Almost every packet that leaves a home, branch or campus for the Internet passes through NAT. Private RFC 1918 addresses cannot be routed on the Internet, so the border router swaps them for public addresses on the way out and swaps them back on the way in. In this deck you will learn the four address terms Cisco uses (the part most candidates get wrong), configure **static NAT**, **dynamic NAT** with a pool and **PAT** (overload), see how NAT interacts with routing and ACLs, and read `show ip nat translations`, `show ip nat statistics` and `debug ip nat` output with confidence. NAT is v1.1 exam topic 4.1 (configure and verify inside source NAT using static and pools) and sits in the Network Services and Security domain of v2.0 with the same scope, so expect configuration questions, exhibit questions and troubleshooting scenarios on both versions.",
  },
  {
    kind: 'bullets',
    title: 'Why NAT exists',
    bullets: [
      'Public IPv4 space is exhausted; **RFC 1918** ranges are not routed on the Internet',
      'The border router rewrites addresses and tracks them in a **translation table**',
      '**PAT** lets a whole site share **one** public address',
      'Internal addressing stays hidden and can be renumbered freely',
      'Trade-offs: breaks end-to-end addressing, harder tracing, some apps need NAT traversal',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1, y: 1.2 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: '10.1.1.11', x: 1, y: 2.9 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.2, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'NAT', x: 5.6, y: 2, tone: 'accent' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 8.6, y: 2 },
      ],
      links: [
        { from: 'pc1', to: 'sw' },
        { from: 'pc2', to: 'sw' },
        { from: 'sw', to: 'r1', label: '10.1.1.0/24', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'net', label: 'public', fromLabel: 'G0/0/1' },
      ],
      groups: [{ label: 'Private (RFC 1918)', x: 0.3, y: 0.4, w: 3.9, h: 3.3 }],
    },
    notes:
      "IPv4 offers about 4.3 billion addresses, and the regional registries ran out of fresh blocks years ago. What kept the Internet growing is private addressing plus NAT. Inside the organization, hosts use RFC 1918 space (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) freely, and Internet routers never carry routes to those ranges. The router at the edge rewrites the source address of outbound packets to a public address it owns, remembers the mapping in its **translation table**, and reverses the rewrite for returning packets. With **PAT** it also rewrites port numbers, so hundreds of hosts can share one public address — exactly what a home router does. NAT is not a security feature by itself, but because unsolicited inbound packets match no translation, it does hide internal addressing. The costs: end-to-end addressing is broken, logs show a shared address instead of the real host, and protocols that authenticate or embed IP addresses (IPsec AH, for example) need special handling such as NAT traversal.",
  },
  {
    kind: 'diagram',
    title: 'The four NAT addresses',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1.3, y: 2.6 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'NAT router', x: 4.3, y: 2.6, tone: 'accent' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 6.6, y: 2.6 },
        { id: 'srv', icon: 'server', label: 'Web server', sub: '192.0.2.80', x: 8.9, y: 2.6 },
      ],
      links: [
        { from: 'pc', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'net', fromLabel: 'G0/0/1' },
        { from: 'net', to: 'srv' },
      ],
      groups: [
        { label: 'Inside', x: 0.3, y: 1.0, w: 3.3, h: 3.2 },
        { label: 'Outside', x: 5.1, y: 1.0, w: 4.6, h: 3.2, tone: 'muted' },
      ],
      annotations: [
        { x: 1.95, y: 0.45, text: 'Inside local = 10.1.1.10' },
        { x: 7.4, y: 0.45, text: 'Inside global = 203.0.113.10', tone: 'accent' },
        { x: 1.95, y: 4.6, text: 'Outside local = 192.0.2.80' },
        { x: 7.4, y: 4.6, text: 'Outside global = 192.0.2.80' },
      ],
    },
    caption: '**Local** = the view from the inside network · **Global** = the view from the outside network',
    notes:
      "Cisco describes every address in a NAT scenario with two words. The first word — **inside** or **outside** — says where the host really lives: PC1 is an inside host, the web server is an outside host. The second word — **local** or **global** — says from which side of the router you are looking: local is the view from the inside network, global is the view from the outside. So PC1's own address 10.1.1.10 is its **inside local** address, while the public address R1 substitutes, 203.0.113.10, is its **inside global** address — that is how the Internet sees PC1. The web server's real public address, 192.0.2.80, is its **outside global** address. Inside hosts also see the server as 192.0.2.80, so its **outside local** address is identical. The two outside terms differ only when the router also translates outside addresses (outside source NAT), which is rare and not part of the CCNA configuration scope. Sketch this picture whenever a question asks which address is which.",
  },
  {
    kind: 'definitions',
    title: 'Inside/outside, local/global',
    terms: [
      { term: '**Inside local**', def: "The inside host's address as seen on the inside network — usually private (PC1 = `10.1.1.10`)." },
      { term: '**Inside global**', def: 'The address that represents the inside host to the outside — the public address NAT substitutes (`203.0.113.10`).' },
      { term: '**Outside global**', def: "The outside host's real address on the outside network (server = `192.0.2.80`)." },
      { term: '**Outside local**', def: "The outside host's address as seen by inside hosts; equals the outside global unless outside NAT is configured." },
      { term: '**Inside interface**', def: 'Faces the private network — configured with `ip nat inside`.' },
      { term: '**Outside interface**', def: 'Faces the ISP/Internet — configured with `ip nat outside`.' },
    ],
    notes:
      "Lock the terms in by asking two questions. First: **where does this host live?** If it sits on the private side of the NAT router the term starts with *inside*; if it is on the ISP or Internet side the term starts with *outside*. Second: **where is the packet I am looking at?** If it is on the inside network the address is *local*; if it is on the outside network it is *global*. Apply that to a packet captured on R1's outside interface whose source is 203.0.113.10: an inside host, seen from the outside — the inside global. The same flow captured on the LAN shows 10.1.1.10, the inside local. Many candidates assume global means public and local means private. For inside addresses that is usually true, but it is a consequence, not the definition, and the exam swaps these pairs in its options. Also learn the interface roles now: `ip nat inside` goes on every interface that faces the private network, and `ip nat outside` on the interface that faces the ISP. Without both, IOS never translates anything.",
  },
  {
    kind: 'table',
    title: 'One flow seen on both sides of R1',
    columns: ['Field', 'On the LAN (G0/0/0 side)', 'On the ISP link (G0/0/1 side)'],
    rows: [
      ['Request source', '`10.1.1.10` — inside local', '`203.0.113.10` — **inside global**'],
      ['Request destination', '`192.0.2.80` — outside local', '`192.0.2.80` — outside global'],
      ['Reply source', '`192.0.2.80` — outside local', '`192.0.2.80` — outside global'],
      ['Reply destination', '`10.1.1.10` — inside local', '`203.0.113.10` — **inside global**'],
    ],
    caption: 'Inside source NAT rewrites the **source** going out and the **destination** coming back.',
    notes:
      "Tracing one flow through R1 is the fastest way to make the vocabulary stick. PC1 opens a web session to 192.0.2.80. On the LAN the packet carries source 10.1.1.10 (inside local) and destination 192.0.2.80 (outside local). R1 routes the packet toward G0/0/1 and then NAT rewrites only the source, so on the ISP link the packet carries source 203.0.113.10 (inside global) and destination 192.0.2.80 (outside global). The server replies to the only address it knows, 203.0.113.10. When the reply arrives on the outside interface, R1 finds the matching entry, rewrites the **destination** back to 10.1.1.10 and routes the packet onto the LAN. Two points trip people up. First, inside source NAT changes the **source** of outbound packets but the **destination** of return packets. Second, the outside host never learns the private address at all. When a question shows a capture and asks which NAT term applies to an address, decide first which segment the capture was taken on.",
  },
  {
    kind: 'table',
    title: 'Static NAT vs dynamic NAT vs PAT',
    columns: ['Feature', 'Static NAT', 'Dynamic NAT', 'PAT (overload)'],
    rows: [
      ['Mapping', '1 local ↔ 1 global, fixed', '1 local ↔ 1 global from a pool', 'Many locals → one global + ports'],
      ['Entry created', 'At configuration (permanent)', 'On the first permitted packet', 'For each new flow'],
      ['Outside can initiate?', '**Yes**', 'Not reliably — entry is temporary', 'No (unless static PAT)'],
      ['Public addresses used', 'One per mapped host', 'One per simultaneous host', 'One can serve the whole site'],
      ['Key command', '`ip nat inside source static`', '`… list 1 pool NAME`', '`… list 1 interface G0/0/1 overload`'],
      ['Typical use', 'Servers published to the Internet', 'Legacy one-to-one designs', 'Home, branch and campus edge'],
    ],
    notes:
      "Inside source NAT comes in three flavors, and the exam expects you to pick the right one from a requirement. **Static NAT** is a permanent one-to-one mapping you type in; it exists before any traffic flows, so outside users can reach an inside server by its public address. It saves no addresses — one public IP per mapped server. **Dynamic NAT** also maps one-to-one, but it borrows a public address from a **pool** when a permitted host first sends traffic, and gives it back after the entry has been idle for the timeout (24 hours by default). If more inside hosts need the Internet at the same time than the pool holds, the extra hosts simply fail. **PAT**, which IOS calls **overload**, adds port numbers to each mapping so many hosts share one public address; nearly every Internet edge uses it. Read the stem for keywords: “server must be reachable from the Internet” points to static NAT, “only one public address” points to PAT, and “a pool of public addresses, one per host” points to dynamic NAT.",
  },
  {
    kind: 'cli',
    title: 'Configuring static NAT',
    code: `R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ip address 198.51.100.2 255.255.255.252
R1(config-if)# ip nat outside
R1(config-if)# exit
R1(config)# ip nat inside source static 10.1.1.10 203.0.113.10
R1(config)# ip route 0.0.0.0 0.0.0.0 198.51.100.1
R1(config)# end
R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
---  203.0.113.10          10.1.1.10             ---                   ---
Total number of translations: 1`,
    highlight: ['ip nat inside', 'ip nat outside', 'static 10.1.1.10 203.0.113.10'],
    caption: 'The ISP routes the public block 203.0.113.0/27 to R1; the static entry exists before any traffic.',
    notes:
      "Every NAT configuration has the same two halves: mark the interfaces, then define the translation. `ip nat inside` goes on G0/0/0 facing the LAN and `ip nat outside` on G0/0/1 facing the ISP. The static command reads left to right as **local, then global**: `ip nat inside source static 10.1.1.10 203.0.113.10` means “when inside host 10.1.1.10 sends traffic out, present it as 203.0.113.10, and send traffic arriving for 203.0.113.10 to 10.1.1.10.” Reversing the two addresses is a classic exam distractor. Notice that 203.0.113.10 is not configured on any interface. That is fine: the ISP routes the 203.0.113.0/27 block to R1, and R1 only needs to receive those packets. The entry appears in `show ip nat translations` immediately, with dashes in the protocol and outside columns because it is a simple, address-only entry not tied to any conversation. The default route is not a NAT command, but NAT depends on it: outbound packets must be routed out an outside interface before they are translated.",
  },
  {
    kind: 'bullets',
    title: 'Static NAT lets the Internet in',
    bullets: [
      'The static entry is **permanent** — no traffic is needed to create it',
      'Outside hosts can **initiate** sessions to the inside global address',
      'Costs one public address per mapped server',
      { text: '**Static PAT** (port forwarding) shares one public IP:', sub: ['`ip nat inside source static tcp 10.1.1.10 443 203.0.113.10 443`'] },
      'The order never changes: **inside local first**, inside global second',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.4,
      nodes: [
        { id: 'srv', icon: 'server', label: 'WEB1', sub: '10.1.1.10', x: 1.2, y: 1.7 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'static NAT', x: 4.2, y: 1.7, tone: 'accent' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 6.6, y: 1.7 },
        { id: 'cl', icon: 'laptop', label: 'Client', sub: '192.0.2.77', x: 8.9, y: 1.7 },
      ],
      links: [
        { from: 'cl', to: 'net', arrow: 'forward' },
        { from: 'net', to: 'r1', label: 'dst 203.0.113.10', arrow: 'forward' },
        { from: 'r1', to: 'srv', label: 'dst 10.1.1.10', arrow: 'forward', tone: 'accent' },
      ],
    },
    notes:
      "Because a static entry exists permanently, outside hosts can **initiate** connections to the inside global address. That is why static NAT is the tool for publishing servers: the client at 192.0.2.77 connects to 203.0.113.10, R1 translates the destination to 10.1.1.10 and routes the packet to WEB1. Dynamic NAT and PAT cannot do this reliably, because their entries only exist after an inside host has started a conversation. When you have only one public address but several servers, use **static PAT**, also called port forwarding: `ip nat inside source static tcp 10.1.1.10 443 203.0.113.10 443` forwards only TCP 443 on the public address to WEB1, and other ports can point to other inside hosts. You can even name the outside interface instead of an address, as in `ip nat inside source static tcp 10.1.1.10 443 interface GigabitEthernet0/0/1 443`. Whatever the variant, the inside local address comes first and the inside global second. For the exam, remember that static NAT allows inbound connections and consumes one public address per mapping.",
  },
  {
    kind: 'steps',
    title: 'Dynamic NAT in four pieces',
    steps: [
      { title: 'Mark the interfaces', text: '`ip nat inside` on the LAN side, `ip nat outside` on the ISP side.' },
      { title: 'Match the inside locals with an ACL', text: '`access-list 1 permit 10.1.1.0 0.0.0.255` — permit means “translate”.' },
      { title: 'Define the pool of inside globals', text: '`ip nat pool PUBLIC 203.0.113.20 203.0.113.29 netmask 255.255.255.224`' },
      { title: 'Bind the ACL to the pool', text: '`ip nat inside source list 1 pool PUBLIC`' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Packet from inside', shape: 'pill' },
        { id: 'b', label: 'Permitted by ACL 1?', shape: 'diamond' },
        { id: 'c', label: 'Take a free pool address', sub: '203.0.113.20–.29' },
        { id: 'd', label: 'Translate & forward', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "Dynamic NAT needs four pieces, and each answers one question. The interfaces: which side is inside and which is outside? The **ACL**: which inside local addresses may be translated? Here a standard ACL permits 10.1.1.0/24. This ACL does not filter traffic — a deny, or no match at all, simply means “do not translate,” and untranslated private packets are then dropped somewhere in the ISP. The **pool**: which inside global addresses can be lent out? The netmask or prefix length does not assign anything to an interface; IOS uses it to check that the start and end addresses belong to one subnet. Finally, the **binding** `ip nat inside source list 1 pool PUBLIC` ties the ACL to the pool. When a permitted host sends its first packet out an outside interface, R1 takes the next free pool address and creates an entry. IOS does not care in which order you type the four pieces, but leaving any one out breaks NAT silently — there is no error message, just no translation.",
  },
  {
    kind: 'cli',
    title: 'Configuring dynamic NAT',
    code: `R1(config)# access-list 1 permit 10.1.1.0 0.0.0.255
R1(config)# ip nat pool PUBLIC 203.0.113.20 203.0.113.29 netmask 255.255.255.224
R1(config)# ip nat inside source list 1 pool PUBLIC
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ip nat outside
R1(config-if)# end
R1# show running-config | include ip nat
 ip nat inside
 ip nat outside
ip nat pool PUBLIC 203.0.113.20 203.0.113.29 netmask 255.255.255.224
ip nat inside source list 1 pool PUBLIC`,
    highlight: ['list 1 pool PUBLIC', 'netmask 255.255.255.224'],
    bullets: [
      'Same pool by prefix: `ip nat pool PUBLIC 203.0.113.20 203.0.113.29 prefix-length 27`',
      'No `overload` → one public address per inside host (10 hosts at once, maximum)',
    ],
    notes:
      "This is a complete dynamic NAT configuration: ten public addresses, 203.0.113.20 through .29, shared by the 10.1.1.0/24 LAN. `netmask 255.255.255.224` and `prefix-length 27` are interchangeable, so use whichever form a question shows. The filtered `show running-config | include ip nat` output is a quick audit: two interface lines (one inside, one outside) plus the pool and the binding. In any exam exhibit, check three things. The ACL number or name in the binding must match an ACL that exists and permits the right hosts. The pool name in the binding must match the pool name exactly. And the inside and outside keywords must sit on the correct interfaces. Notice there is no `overload` keyword: this router gives each inside host its own public address, so at most ten hosts can be translated at the same moment. Named ACLs work too, as in `ip nat inside source list NAT-USERS pool PUBLIC`, and extended ACLs can be used when the translation decision must also consider destinations.",
  },
];
