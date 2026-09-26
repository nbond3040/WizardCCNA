import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'How Routers Forward Packets',
    subtitle: 'Longest prefix match, AD versus metric, and what really changes at every hop',
    notes:
      "Knowing how to read a routing table is only half the skill; the exam also asks you to predict what a router **does** with a packet. This deck answers three questions. First, when several routes match a destination, which one wins? The answer is **longest prefix match**, and you will practice it on many worked examples until it is automatic. Second, how do administrative distance and metric fit in? They decide which routes enter the table in the first place, which is a separate job from forwarding. Third, what physically happens to a packet inside a router and on each link: the frame is checked, stripped and looked up, the TTL is decremented, and the packet is re-encapsulated with new MAC addresses while the IP addresses stay the same. We close with Cisco Express Forwarding, whose FIB and adjacency table make all of this fast. The material maps to v1.1 exam topics 3.2.a to 3.2.c and to the IP Connectivity domain (domain 3) of v2.0.",
  },
  {
    kind: 'diagram',
    title: 'Two jobs: build the table, then use it',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'src', label: 'Route sources', sub: 'connected, static, OSPF, EIGRP', shape: 'round' },
        { id: 'sel', label: 'Route selection', sub: 'same prefix: AD, then metric' },
        { id: 'rib', label: 'RIB', sub: 'best route per prefix' },
        { id: 'fib', label: 'FIB (CEF)', sub: 'copy built for forwarding' },
        { id: 'pkt', label: 'Per-packet lookup', sub: 'longest prefix match', shape: 'pill', tone: 'accent' },
      ],
    },
    bullets: [
      '**Control plane**: sources compete on AD, then metric, for identical prefixes',
      '**Data plane**: each packet is matched by **longest prefix**',
      'AD and metric are never consulted per packet',
    ],
    notes:
      "Routing is two separate jobs, and most exam mistakes come from mixing them up. The first job is **building the routing table**. Connected interfaces, static routes and routing protocols all offer candidate routes. When several sources offer the same prefix with the same length, the router keeps the one with the lowest administrative distance, and inside one protocol the path with the lowest metric. The winners form the RIB, which CEF copies into the FIB for fast forwarding. This happens in the background, whenever the topology changes. The second job is **forwarding packets**, and it happens for every single packet. The router takes the destination IP address and finds the entry in the table that matches it with the **longest prefix**. At this point AD and metric are finished: they did their work when the table was built. Keep the two phases apart in your head, and questions such as which route will be used for 10.1.1.130 become simple.",
  },
  {
    kind: 'bullets',
    title: 'Longest prefix match',
    bullets: [
      'A route matches if the destination falls inside its prefix range',
      'Several routes often match the same destination',
      'The match with the **longest prefix** (most specific) wins',
      '0.0.0.0/0 matches everything, so it is the last resort',
      '==Prefix length beats AD and metric==, every time',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Destination', value: '10.1.1.130', tone: 'accent' },
        { label: '10.1.0.0/16', value: '10.1.0.0', prefix: 16 },
        { label: '10.1.1.0/24', value: '10.1.1.0', prefix: 24 },
        { label: '10.1.1.128/25', value: '10.1.1.128', prefix: 25, tone: 'good' },
      ],
    },
    notes:
      "A route **matches** a destination when the destination address falls inside the range the prefix describes; in binary, when the first N bits of the destination equal the first N bits of the route, where N is the prefix length. Because networks are summarized and subdivided, one destination often matches several routes at once. The tie-breaker is simple: the router uses the match with the **longest prefix**, the most specific description of where the destination lives. In the bit view, 10.1.1.130 agrees with 10.1.0.0/16 in its first 16 bits, with 10.1.1.0/24 in its first 24 bits and with 10.1.1.128/25 in its first 25 bits, so the /25 wins. The default route 0.0.0.0/0 compares zero bits, so it matches every destination, but any other match is longer and beats it. Most important of all, longest match is evaluated without looking at administrative distance or metric: a /25 learned from RIP beats a /24 static route for any destination inside the /25.",
  },
  {
    kind: 'table',
    title: 'Worked example: one destination, five routes',
    columns: ['Route in the table', 'Range covered', 'Matches 172.16.45.200?', 'Length'],
    rows: [
      ['`O 172.16.0.0/16`', '172.16.0.0 to 172.16.255.255', 'Yes', '/16'],
      ['`S 172.16.32.0/19`', '172.16.32.0 to 172.16.63.255', 'Yes', '/19'],
      ['`D 172.16.44.0/22`', '172.16.44.0 to 172.16.47.255', '**Yes: longest match**', '**/22**'],
      ['`R 172.16.45.0/25`', '172.16.45.0 to 172.16.45.127', 'No (.200 is outside)', '/25'],
      ['`S* 0.0.0.0/0`', 'Every address', 'Yes', '/0'],
    ],
    caption: 'Destination 172.16.45.200 uses the EIGRP /22, even though the static /19 has a better AD.',
    notes:
      "Work through the table exactly as the router does. First list every route whose range contains 172.16.45.200. The /16 covers all of 172.16.x.x, so it matches. The /19 has a block size of 32 in the third octet, so its range is 172.16.32.0 through 172.16.63.255, and 45 falls inside. The /22 has a block size of 4 in the third octet, giving 172.16.44.0 through 172.16.47.255, which also contains 45. The /25 is the most specific route in the table, but it covers only 172.16.45.0 to 172.16.45.127, and .200 is outside it, so it does **not** match. The default route matches everything. Among the four matches the longest prefix is /22, so the router forwards using the EIGRP route. Notice the two traps. The static /19 has a far better AD, 1 versus 90, yet it loses, because AD is never used in the lookup. And the /25 is the longest route in the table but is irrelevant, because only matching routes compete.",
  },
  {
    kind: 'bullets',
    title: 'Does the route match? The block-size test',
    bullets: [
      'Find the **interesting octet**, where the prefix boundary falls',
      'Block size = 256 minus the mask value in that octet',
      'Networks start at multiples of the block size',
      'The range ends one address before the next block',
      'Destination inside the range: the route matches',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Route /19', value: '172.16.32.0', prefix: 19 },
        { label: 'Mask', value: '255.255.224.0', prefix: 19 },
        { label: 'Destination', value: '172.16.45.200', prefix: 19, tone: 'good' },
      ],
    },
    notes:
      "You do not need to write out all 32 bits to test a match; the block-size method is faster and less error-prone under exam time pressure. Find the octet where the prefix boundary falls: for a /19 it is the third octet, because 16 bits cover the first two octets and 3 more bits fall in the third. The mask value in that octet is 224, so the block size is 256 minus 224, which is 32. Networks in that octet start at multiples of 32: 0, 32, 64, 96 and so on. The route 172.16.32.0/19 therefore spans 172.16.32.0 through 172.16.63.255, the address just before the next block at 64. Now check the destination: 172.16.45.200 has 45 in the third octet, between 32 and 63, so it matches. The bit view confirms it, because the first 19 bits of the route and of the destination are identical. Practice the common block sizes until they are instant: in the last octet a /25 is 128, /26 is 64, /27 is 32, /28 is 16, /29 is 8 and /30 is 4.",
  },
  {
    kind: 'cli',
    title: 'Exhibit practice: pick the route',
    code: `R1# show ip route | begin Gateway
Gateway of last resort is 198.51.100.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 198.51.100.1
      10.0.0.0/8 is variably subnetted, 10 subnets, 6 masks
S        10.0.0.0/8 [1/0] via 10.255.0.2
O        10.10.0.0/16 [110/30] via 10.255.1.2, 00:21:40, GigabitEthernet0/0/1
D        10.10.4.0/22 [90/3328] via 10.255.2.2, 00:18:03, GigabitEthernet0/0/2
O        10.10.5.64/26 [110/40] via 10.255.1.2, 00:21:40, GigabitEthernet0/0/1
C        10.255.0.0/30 is directly connected, GigabitEthernet0/0/0
L        10.255.0.1/32 is directly connected, GigabitEthernet0/0/0
C        10.255.1.0/30 is directly connected, GigabitEthernet0/0/1
L        10.255.1.1/32 is directly connected, GigabitEthernet0/0/1
C        10.255.2.0/30 is directly connected, GigabitEthernet0/0/2
L        10.255.2.1/32 is directly connected, GigabitEthernet0/0/2
      198.51.100.0/24 is variably subnetted, 2 subnets, 2 masks
C        198.51.100.0/30 is directly connected, GigabitEthernet0/1/0
L        198.51.100.2/32 is directly connected, GigabitEthernet0/1/0`,
    highlight: ['10.0.0.0/8 [1/0]', '10.10.0.0/16', '10.10.4.0/22', '10.10.5.64/26'],
    bullets: [
      'Where does R1 send **10.10.5.100**?',
      'Where does R1 send **10.10.5.130**?',
      'Where does R1 send **10.10.9.1**?',
      'Where does R1 send **10.20.1.1**?',
      'Where does R1 send **172.16.1.1**?',
    ],
    notes:
      "Now practice on a realistic exhibit. R1 has a static default toward the ISP, a static summary for all of 10.0.0.0/8 toward R2, an OSPF route for 10.10.0.0/16, an EIGRP route for 10.10.4.0/22 and a more specific OSPF route for 10.10.5.64/26. The overlapping prefixes are deliberate: this is exactly how exam exhibits are built. Before looking at the answers on the next slide, work out the next hop for each destination listed. Use the same method every time. Write down the range of each candidate, starting from the most specific route and moving toward the least specific, and stop at the first one whose range contains the destination; that is the longest match. For the /26, the block size in the last octet is 64, so 10.10.5.64/26 covers .64 to .127. For the /22, the block size in the third octet is 4, so 10.10.4.0/22 covers 10.10.4.0 to 10.10.7.255. Ignore the AD and metric values completely while you do this.",
  },
  {
    kind: 'table',
    title: 'Exhibit practice: answers',
    columns: ['Destination', 'Matching routes', 'Winner', 'Next hop'],
    rows: [
      ['10.10.5.100', '/0, /8, /16, /22, /26', '**10.10.5.64/26** (OSPF)', '10.255.1.2'],
      ['10.10.5.130', '/0, /8, /16, /22', '**10.10.4.0/22** (EIGRP)', '10.255.2.2'],
      ['10.10.9.1', '/0, /8, /16', '**10.10.0.0/16** (OSPF)', '10.255.1.2'],
      ['10.20.1.1', '/0, /8', '**10.0.0.0/8** (static)', '10.255.0.2'],
      ['172.16.1.1', '/0 only', '**0.0.0.0/0** (static default)', '198.51.100.1'],
    ],
    caption: 'Scan from the most specific candidate down; the first range that contains the destination wins.',
    notes:
      "Check your answers. 10.10.5.100 falls inside the /26 range of .64 to .127, so the most specific OSPF route wins, even though its cost of 40 is worse than the /16's cost of 30; metrics play no part between different prefixes. 10.10.5.130 is just past the /26 range, so the next longest match is the EIGRP /22 and the packet goes to 10.255.2.2. 10.10.9.1 falls outside the /22, whose third octet stops at 7, leaving the OSPF /16. 10.20.1.1 is not inside 10.10.0.0/16 at all, so apart from the default only the static 10.0.0.0/8 summary matches. Finally, 172.16.1.1 matches nothing except 0.0.0.0/0, so it goes to the ISP. Notice that every destination matched the default route and most matched the /8, yet those routes were used only when nothing more specific existed. This top-down scan, most specific first, is the fastest reliable technique under exam time pressure, and it works for any table.",
  },
  {
    kind: 'diagram',
    title: 'Specific beats trusted: LPM ignores AD',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC', sub: 'to 10.50.8.20', x: 0.9, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'static /16, AD 1', x: 6, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'OSPF /24, AD 110', x: 6, y: 4 },
        { id: 'site', icon: 'cloud', label: 'Site B', sub: '10.50.0.0/16', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'pc', to: 'r1' },
        { from: 'r1', to: 'r2', label: '10.50.0.0/16', style: 'dashed', tone: 'muted' },
        { from: 'r1', to: 'r3', label: '10.50.8.0/24', tone: 'good', arrow: 'forward' },
        { from: 'r2', to: 'site' },
        { from: 'r3', to: 'site' },
      ],
    },
    caption: 'To 10.50.8.20, R1 uses the OSPF /24 via R3; the static /16 serves the rest of 10.50.0.0/16.',
    notes:
      "This is the single most tested routing concept on the CCNA. R1 has a static route for 10.50.0.0/16 toward R2, with an administrative distance of 1, and it learns 10.50.8.0/24 from OSPF through R3, with an administrative distance of 110. Many candidates reason that static beats OSPF, so every 10.50 packet must go to R2. That is wrong. The two routes have **different prefix lengths**, so they are different entries: both are installed, and AD never compares them. When a packet for 10.50.8.20 arrives, both routes match and the /24 is longer, so R1 forwards it to R3. A packet for 10.50.9.20 matches only the /16, so it goes to R2. AD would matter only if both sources offered exactly 10.50.8.0/24; then the static route would win and the OSPF route would not be installed at all. Train yourself to ask the right first question: are these the same prefix and length, or different prefixes?",
  },
  {
    kind: 'diagram',
    title: 'Choosing what enters the table',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'cand', label: 'Candidate route', shape: 'pill', x: 1.2, y: 1.4 },
        { id: 'same', label: 'Same prefix/length?', shape: 'diamond', x: 3.7, y: 1.4 },
        { id: 'ad', label: 'Lowest AD wins', sub: 'between sources', x: 6.3, y: 1.4 },
        { id: 'metric', label: 'Lowest metric wins', sub: 'inside one protocol', x: 8.8, y: 1.4 },
        { id: 'both', label: 'Install both', sub: 'LPM decides per packet', x: 3.7, y: 3.8 },
        { id: 'ecmp', label: 'Tie: keep all paths', sub: 'ECMP load sharing', shape: 'round', tone: 'accent', x: 8.8, y: 3.8 },
      ],
      edges: [
        { from: 'cand', to: 'same' },
        { from: 'same', to: 'ad', label: 'yes' },
        { from: 'same', to: 'both', label: 'no' },
        { from: 'ad', to: 'metric' },
        { from: 'metric', to: 'ecmp', label: 'equal' },
      ],
    },
    notes:
      "This is the other half of the story: the rules that decide what gets **into** the table in the first place. For each candidate route, the router asks whether another source already offers the exact same prefix with the same length. If not, there is no contest; the route is installed alongside the others, and longest prefix match sorts things out per packet. If the prefix and length are identical, the sources compete on **administrative distance**, and only the lowest AD survives. If the competing paths come from the same protocol, the **metric** decides and the lowest wins. If two or more paths from the same protocol tie on metric, the router installs them all, up to the maximum-paths limit, and shares the load: equal-cost multipath. EIGRP can also load-balance over unequal-cost paths with the `variance` command, but by default every protocol requires an exact tie. Remember that this whole process runs when the topology changes, not once per packet.",
  },
  {
    kind: 'table',
    title: 'Prefix length, AD, metric: who decides what',
    columns: ['Criterion', 'Compares', 'Used when', 'Winner'],
    rows: [
      ['**Prefix length**', 'Routes that match one destination', 'Every packet lookup', '**Longest**'],
      ['Administrative distance', 'Different sources, identical prefix', 'Building the table', 'Lowest'],
      ['Metric', 'Paths inside one protocol, identical prefix', 'Building the table', 'Lowest'],
      ['Equal metrics', 'Tied paths from one protocol', 'Building the table', 'All kept (ECMP)'],
    ],
    caption: 'Scenario order: find the matching routes, pick the longest, and use AD or metric only to explain why a route is in the table.',
    notes:
      "This table puts the three criteria side by side, because the exam loves questions that blur them. **Prefix length** is the only criterion used for every packet: among the routes in the table that match the destination, the longest wins. **Administrative distance** is used only while the table is being built, and only between different sources that offer exactly the same prefix and length. **Metric** is also a table-building criterion, but inside a single routing protocol: OSPF compares costs with other OSPF costs, and EIGRP compares composite metrics with other EIGRP metrics. When a protocol finds equal metrics, it installs several next hops for the same prefix and the router load-balances across them. A reliable thinking order for scenario questions is therefore: identify the routes that match, pick the longest, and only if the question asks why a particular source's route is in the table at all, reason about AD and then metric. Never let a better AD or metric rescue a shorter prefix.",
  },
  {
    kind: 'diagram',
    title: 'Per hop: new frame, same packet',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 10.1.1.10', icon: 'pc' },
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'r2', label: 'R2', icon: 'router' },
        { id: 'srv', label: 'Server1 10.3.3.30', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'r1', label: 'Frame 1: 0050.7966.0001 to 0c11.1111.0000', sub: 'IP 10.1.1.10 to 10.3.3.30, TTL 128' },
        { from: 'r1', to: 'r2', label: 'Frame 2: 0c11.1111.0001 to 0c22.2222.0001', sub: 'IP 10.1.1.10 to 10.3.3.30, TTL 127' },
        { from: 'r2', to: 'srv', label: 'Frame 3: 0c22.2222.0000 to 0050.7966.0003', sub: 'IP 10.1.1.10 to 10.3.3.30, TTL 126', tone: 'accent' },
        { note: 'MAC addresses change on every link; IP addresses never change (no NAT)' },
      ],
    },
    caption: 'Each router builds a brand-new frame; the IP header only loses one TTL per hop.',
    notes:
      "Follow one packet from PC1 to Server1. PC1 sees that 10.3.3.30 is on a different subnet, so it builds a frame addressed to its default gateway: the source MAC is PC1's own and the destination MAC is R1's G0/0/0 address. R1 strips that frame, routes the packet, and builds a **brand-new frame** for the next link: the source MAC is now R1's G0/0/1 address and the destination MAC is R2's G0/0/1 address, which R1 learned through ARP. R2 does the same again, and the last frame carries R2's G0/0/0 MAC as its source and the server's MAC as its destination. Through all three links the **IP header keeps the same source and destination addresses**. Only the TTL goes down, from 128 to 127 to 126, and the header checksum is recomputed to match. The exam asks this in many forms: which MAC addresses are in the frame between R1 and R2, and which IP addresses? The MACs always belong to the two devices on that link, and the IPs belong to the original endpoints unless NAT is translating along the path.",
  },
  {
    kind: 'steps',
    title: 'Inside the router: the per-packet steps',
    steps: [
      { title: 'Receive and check the frame', text: 'Verify the FCS; a corrupted frame is discarded silently.' },
      { title: 'De-encapsulate', text: 'Destination MAC is ours; EtherType `0x0800` means an IPv4 packet is inside.' },
      { title: 'Look up the destination IP', text: 'Longest prefix match gives the next hop and exit interface.' },
      { title: 'Decrement the TTL', text: 'If it reaches 0, drop the packet and send ICMP Time Exceeded.' },
      { title: 'Recompute the header checksum', text: 'The TTL changed, so the IPv4 checksum must be recalculated.' },
      { title: 'Resolve the next-hop MAC', text: 'ARP cache or CEF adjacency; send an ARP request if missing.' },
      { title: 'Re-encapsulate and transmit', text: 'New source and destination MACs, new FCS, out the exit interface.' },
    ],
    notes:
      "Here is the router's work for every packet, in order. It first receives the frame and verifies the **FCS**; a frame that fails the check is discarded silently, because Ethernet has no retransmission of its own. It checks that the frame is addressed to it, then removes the Layer 2 header and trailer, using the EtherType value 0x0800 to know that an IPv4 packet is inside. Next comes the **lookup**: longest prefix match on the destination IP gives the exit interface and next hop. With no match and no default route, the packet is dropped and an ICMP destination unreachable message may be returned. The router decrements the **TTL**, dropping the packet with an ICMP Time Exceeded message if it reaches zero, and recomputes the header checksum. It then needs the next hop's MAC address from its ARP cache, sending an ARP request if the entry is missing. Finally it builds a new frame with its own exit interface MAC as the source and a fresh FCS, and transmits it.",
  },
  {
    kind: 'diagram',
    title: 'The IPv4 fields a router rewrites',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'Version', size: 4 },
        { label: 'IHL', size: 4 },
        { label: 'DSCP / ECN', size: 8 },
        { label: 'Total Length', size: 16 },
        { label: 'Identification', size: 16 },
        { label: 'Flags', size: 3 },
        { label: 'Fragment Offset', size: 13 },
        { label: 'TTL', size: 8, tone: 'accent', sub: 'minus 1' },
        { label: 'Protocol', size: 8 },
        { label: 'Header Checksum', size: 16, tone: 'accent', sub: 'recomputed' },
        { label: 'Source Address', size: 32, tone: 'good', sub: 'unchanged' },
        { label: 'Destination Address', size: 32, tone: 'good', sub: 'unchanged' },
      ],
    },
    caption: 'Every hop: TTL minus 1 and a new checksum. Addresses change only when NAT is configured.',
    notes:
      "Zoom into the IPv4 header to see exactly what a router touches. In normal forwarding only two fields change. The **TTL** is decremented by one at every router; its job is to stop packets from looping forever, and a packet whose TTL would reach zero is dropped and answered with an ICMP Time Exceeded message, which is exactly how traceroute discovers each hop. Because the TTL changed, the **header checksum**, which covers only the header, must be recalculated before the packet leaves. The source and destination addresses are **not** modified: they identify the two endpoints for the entire journey. Only special features change more. NAT rewrites addresses, QoS policies can remark the DSCP value, and a router that must fragment a packet for a smaller MTU adjusts the length, flags and offset fields. IPv6 simplifies the job further: routers decrement the **Hop Limit**, and there is no header checksum at all to recompute.",
  },
  {
    kind: 'cli',
    title: 'Verifying the forwarding path',
    code: `R1# show ip route 10.3.3.30
Routing entry for 10.3.3.0/24
  Known via "ospf 1", distance 110, metric 2, type intra area
  Last update from 10.0.12.2 on GigabitEthernet0/0/1, 00:09:12 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 2.2.2.2, 00:09:12 ago, via GigabitEthernet0/0/1
      Route metric is 2, traffic share count is 1
R1# show ip cef 10.3.3.30
10.3.3.0/24
  nexthop 10.0.12.2 GigabitEthernet0/0/1
R1# show ip arp 10.0.12.2
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.0.12.2              23   0c22.2222.0001  ARPA   GigabitEthernet0/0/1`,
    highlight: ['Routing entry for 10.3.3.0/24', 'nexthop 10.0.12.2 GigabitEthernet0/0/1', '0c22.2222.0001'],
    caption: 'RIB entry, FIB entry and next-hop MAC: the three pieces of one forwarding decision.',
    notes:
      "Three commands let you trace a forwarding decision exactly as the router makes it. `show ip route 10.3.3.30` performs the longest-prefix lookup against the RIB and shows the winning entry, here the OSPF route 10.3.3.0/24 with next hop 10.0.12.2. `show ip cef 10.3.3.30` shows the same decision as CEF will actually execute it from the FIB: the prefix, the next hop and the exit interface. In a healthy router the two always agree, because the FIB is built from the RIB. The last piece is Layer 2: `show ip arp 10.0.12.2` confirms that R1 knows the MAC address of its next hop, which it needs to build the outgoing frame. If that entry were missing, the first packets would wait for ARP to complete, which is why the first ping through a new path often shows a timeout. On the exam, expect these outputs as exhibits, followed by a question about which interface or next hop a given packet will use.",
  },
  {
    kind: 'diagram',
    title: 'CEF: the FIB and the adjacency table',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'rib', label: 'RIB', sub: 'show ip route', x: 1.6, y: 1.2 },
        { id: 'arp', label: 'ARP table', sub: 'show ip arp', x: 1.6, y: 3.8 },
        { id: 'fib', label: 'FIB', sub: 'show ip cef', tone: 'accent', x: 5, y: 1.2 },
        { id: 'adj', label: 'Adjacency table', sub: 'show adjacency', x: 5, y: 3.8 },
        { id: 'out', label: 'Rewrite and send', sub: 'fast path or hardware', shape: 'pill', x: 8.4, y: 2.5 },
      ],
      edges: [
        { from: 'rib', to: 'fib', label: 'best routes' },
        { from: 'arp', to: 'adj', label: 'next-hop MACs' },
        { from: 'fib', to: 'adj', label: 'points to' },
        { from: 'adj', to: 'out' },
      ],
    },
    notes:
      "**Cisco Express Forwarding (CEF)** is the default forwarding method on modern IOS routers and multilayer switches, and it works by doing the hard work before packets arrive. The control plane builds the RIB as usual; CEF then copies the best routes into the **Forwarding Information Base (FIB)**, a structure optimized for longest-prefix lookups. In parallel, CEF builds an **adjacency table** from ARP and other Layer 2 information: for every next hop, the complete rewrite, meaning the new Ethernet header, is precomputed. Each FIB entry simply points to an adjacency. When a packet arrives, one lookup in the FIB returns the adjacency, and the router can rewrite and send the frame immediately, often in hardware. Because both tables are updated whenever the RIB or the ARP cache changes, no packet has to wait for a routing-table search by the CPU. Use `show ip cef` to display the FIB and `show adjacency` to display the adjacency table.",
  },
  {
    kind: 'compare',
    title: 'Process switching vs CEF',
    left: {
      heading: 'Process switching',
      tone: 'muted',
      bullets: [
        'The CPU handles every packet',
        'Full routing-table lookup for each packet',
        'Slowest method; scales poorly',
        'Still used for packets **punted** to the CPU',
      ],
    },
    right: {
      heading: 'CEF (default)',
      tone: 'good',
      bullets: [
        'FIB and adjacency table built in advance',
        'One lookup plus a precomputed Layer 2 rewrite',
        'Fast, often performed in hardware',
        'On by default: `ip cef`',
      ],
    },
    notes:
      "**Process switching** is the original method: every packet interrupts the CPU, which searches the routing table, finds the next hop, looks up the MAC address and builds the new frame. It works, but it scales badly because the CPU repeats the full job for each packet. **Fast switching** improved on this by caching the result of the first packet to each destination, a route-once, switch-many approach, but its cache had to be built on demand as traffic arrived. **CEF** replaced both by precomputing everything from the RIB and the ARP table, so no packet triggers a routing-table search at all. CEF is enabled by default with `ip cef`. For the exam, remember the names of its two tables, the FIB and the adjacency table, and that CEF is what lets routers and Layer 3 switches forward at high speed. Process switching has not disappeared: packets addressed to the router itself, packets whose TTL expires and other exceptions are **punted** to the CPU and handled there.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: forwarding decisions',
    body: 'For a given destination, find every matching route first; ==the longest prefix wins==, whatever the AD or metric.',
    bullets: [
      'The longest route in the table may not match: check its range',
      'Different prefix lengths: both installed, no AD contest',
      'Same prefix: lower AD wins; same protocol: lower metric',
      'MACs change on every link; IP addresses stay (no NAT)',
      'TTL drops by 1 per router and the checksum is recomputed',
      'The default route is used only when nothing else matches',
      'CEF tables: FIB (routes) and adjacency table (Layer 2 rewrite)',
    ],
    notes:
      "Most forwarding questions are lost to one of a handful of traps. The biggest is letting AD override prefix length: a static route with AD 1 loses to a RIP route with AD 120 if the RIP prefix is longer and matches the destination. The second is picking the longest route in the table without checking that its range actually contains the destination; always verify with the block size. Third, remember that different prefix lengths are different routes, so both are installed and there is no AD contest between them. For identical prefixes, AD decides between sources and the metric decides inside one protocol; equal metrics produce load sharing rather than a winner. For per-hop questions, the MAC addresses belong to the two devices on the current link, while the IP addresses stay those of the original sender and final destination unless NAT is involved, and the TTL drops by one at each router. Finally, know CEF's vocabulary: the FIB holds the routes and the adjacency table holds the Layer 2 rewrite.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Control plane builds the table: AD, then metric, for identical prefixes',
      'Data plane forwards each packet by **longest prefix match**',
      'Test a match with the block size of the interesting octet',
      'Per hop: FCS, strip, lookup, TTL, checksum, ARP, new frame',
      'IP addresses unchanged end to end; MACs rewritten per link',
      'CEF: FIB and adjacency table replace per-packet process switching',
    ],
    notes:
      "Routing is two jobs. In the control plane, the router builds its table: routes with identical prefixes compete on administrative distance and then on metric, equal metrics become ECMP, and the winners are copied into CEF's FIB. In the data plane, every packet is matched against that table using **longest prefix match**, which ignores AD and metric entirely. Use the block-size method to check whether a destination falls inside a prefix, and scan from the most specific candidate down to the default route. At each router the frame is verified with the FCS and stripped, the packet is looked up, its TTL is decremented and its checksum recomputed, and it is re-encapsulated with new MAC addresses resolved by ARP. The IP source and destination never change unless NAT is configured. CEF makes the whole process fast by precomputing the FIB and adjacency table, leaving process switching for the packets that must be punted to the CPU.",
  },
];
