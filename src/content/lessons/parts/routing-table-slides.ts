import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'The Routing Table',
    subtitle: 'Reading `show ip route` and `show ipv6 route`: codes, AD, metrics and the gateway of last resort',
    notes:
      "Every forwarding decision a router makes starts in one place: the **routing table**, also called the RIB (Routing Information Base). If you can read it fluently you can answer a large share of CCNA questions in seconds, because Cisco loves to hand you a `show ip route` exhibit and ask what the router knows or will do. In this deck you will decode every part of a route entry: the source code, the prefix and mask, the administrative distance and metric in brackets, the next hop, the age and the exit interface. You will see where connected and local routes come from, memorize the administrative distance table, learn why metrics from different protocols can never be compared, and find the gateway of last resort. We finish with the IPv6 table, which carries the same information in a slightly different layout. This material maps to v1.1 exam topics 3.1.a through 3.1.g and to the IP Connectivity domain (domain 3) of v2.0, so it is tested on both versions.",
  },
  {
    kind: 'bullets',
    title: 'Where routes come from',
    bullets: [
      '**Connected (`C`)**: subnet of every up/up interface with an IP',
      '**Local (`L`)**: the interface address itself as a /32',
      '**Static (`S`)**: typed by an administrator with `ip route`',
      '**Dynamic (`O`, `D`, `R`, `B`)**: learned from neighbors',
      'Only the **best** source for each prefix is installed',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'lan', icon: 'pc', label: 'LAN', sub: '10.1.1.0/24', x: 1, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'OSPF', x: 6, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'EIGRP', x: 6, y: 4 },
        { id: 'isp', icon: 'internet', label: 'ISP', sub: 'static default', x: 8.9, y: 2.5 },
      ],
      links: [
        { from: 'lan', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', label: '10.0.12.0/30' },
        { from: 'r1', to: 'r3', fromLabel: 'G0/0/2', label: '10.0.13.0/30' },
        { from: 'r1', to: 'isp', fromLabel: 'G0/1/0', label: '203.0.113.0/30' },
      ],
    },
    notes:
      "A router's table is filled from three kinds of sources. **Connected** routes appear automatically for the subnet of every interface that has an IP address and is up/up, and each one comes with a matching **local** route: the interface address itself with a /32 mask. **Static** routes are typed by an administrator. **Dynamic** routes are learned from neighbors through OSPF, EIGRP, RIP or BGP. In the reference topology used throughout this deck, R1 has a LAN on G0/0/0, learns R2's networks through OSPF, learns R3's networks through EIGRP and reaches the Internet through a static default route toward the ISP. Keep one principle in mind from the start: the routing table is not a list of everything the router has heard. Each routing protocol keeps its own database, and only the **single best source** for each prefix wins a place in the RIB. The losers stay in their protocol databases, ready to take over automatically if the winner disappears.",
  },
  {
    kind: 'cli',
    title: 'Anatomy of show ip route',
    code: `R1# show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       + - replicated route, % - next hop override

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 8 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.0.13.0/30 is directly connected, GigabitEthernet0/0/2
L        10.0.13.1/32 is directly connected, GigabitEthernet0/0/2
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
O        10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
O IA     10.22.0.0/24 [110/3] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
      172.16.0.0/24 is subnetted, 1 subnets
D        172.16.1.0 [90/3072] via 10.0.13.2, 1d02h, GigabitEthernet0/0/2
O E2  192.168.100.0/24 [110/20] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/1/0
L        203.0.113.2/32 is directly connected, GigabitEthernet0/1/0`,
    highlight: ['Gateway of last resort is 203.0.113.1 to network 0.0.0.0', '[110/2]', 'O IA', 'O E2'],
    caption: 'One real table: a static default, connected/local pairs, OSPF intra-area, inter-area and external routes, and an EIGRP route.',
    notes:
      "Read the output in three blocks. The **Codes legend** at the top is the key for the letters at the start of each route; exam exhibits often trim it, so you must know the common codes by heart. Next comes the **Gateway of last resort** line, which tells you whether a default route exists and which next hop it uses. Then come the routes themselves, grouped under their classful parent network. Lines such as `10.0.0.0/8 is variably subnetted, 8 subnets, 3 masks` are headers, not routes: they only say how many entries sit underneath and how many different prefix lengths they use. When every subnet of a classful network shares one mask, the header says `is subnetted` and carries that mask, and the entries below omit it, as with 172.16.1.0 here. Every line that starts with a code is a real route. Scan the first column: a static default, connected and local pairs, OSPF intra-area, inter-area and external type 2 routes, and one internal EIGRP route.",
  },
  {
    kind: 'table',
    title: 'Decoding one route entry',
    columns: ['Field', 'Example', 'Meaning'],
    rows: [
      ['Code', '`O`', 'Route source: OSPF, intra-area'],
      ['Prefix / length', '`10.2.2.0/24`', 'Destination network and mask (/24 = 255.255.255.0)'],
      ['[AD/metric]', '`[110/2]`', 'Administrative distance 110, OSPF cost 2'],
      ['Next hop', '`via 10.0.12.2`', 'Neighbor the packet is handed to'],
      ['Age', '`00:14:09`', 'Time since the route was installed or last changed'],
      ['Exit interface', '`GigabitEthernet0/0/1`', 'Local interface used to reach the next hop'],
    ],
    caption: 'Entry: `O 10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1`',
    notes:
      "Every learned route follows the same left-to-right pattern, so practice reading it aloud: OSPF says 10.2.2.0/24 is reachable with distance 110 and cost 2; send the packet to 10.0.12.2 out GigabitEthernet0/0/1; the route has been stable for 14 minutes. Two fields trip people up. The brackets hold **two** values: the first is the administrative distance, meaning how much the router trusts the source, and the second is the metric, meaning how far away the destination is in that protocol's own units. The age is not a countdown to expiry; it is the time since the route was installed or last changed. After 24 hours IOS switches to a compact format such as `1d02h` or `2w3d`. Connected and local routes have no brackets, next hop or age: they simply say `is directly connected` followed by the interface. Static routes show `[1/0]` and a next hop but no age, because no protocol refreshes them.",
  },
  {
    kind: 'table',
    title: 'Route source codes you must know',
    columns: ['Code', 'Source', 'Default AD'],
    rows: [
      ['`C`', 'Connected: subnet of an up/up interface', '0'],
      ['`L`', "Local: the interface's own address as a /32", '0'],
      ['`S` / `S*`', 'Static route / static candidate default', '1'],
      ['`O`', 'OSPF intra-area (same area)', '110'],
      ['`O IA`', 'OSPF inter-area (another area)', '110'],
      ['`O E1` / `O E2`', 'OSPF external (redistributed) type 1 / type 2', '110'],
      ['`D`', 'EIGRP internal', '90'],
      ['`D EX`', 'EIGRP external (redistributed)', '170'],
      ['`R`', 'RIP', '120'],
      ['`B`', 'BGP', '20 (eBGP) / 200 (iBGP)'],
    ],
    notes:
      "Learn each code as a pair of letter and source, then attach the default administrative distance. A few patterns make this easier. OSPF always begins with `O`, and a second tag refines it: `IA` marks a route from another area, while `E1` and `E2` mark routes redistributed into OSPF from outside. E2 is the default external type, and its metric does not grow as it crosses the OSPF domain. EIGRP uses `D` (think DUAL, its algorithm), and `D EX` marks external EIGRP routes, which receive a much worse distance of 170. The asterisk is not a source at all: it flags a **candidate default** route, so `S*` is a static default and `O*E2` is a default route advertised into OSPF. Do not confuse `L` (local) with the IS-IS level codes `L1` and `L2`. BGP shows a single `B` for routes from both external and internal peers; only the distance tells them apart, 20 for eBGP and 200 for iBGP.",
  },
  {
    kind: 'cli',
    title: 'Connected and local routes',
    code: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.0.12.1       YES manual up                    up
GigabitEthernet0/0/2   10.0.13.1       YES manual administratively down down
R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0`,
    highlight: ['administratively down', '10.1.1.1/32', '10.0.12.1/32'],
    caption: 'G0/0/2 is shut down, so 10.0.13.0/30 has neither a `C` nor an `L` route.',
    bullets: [
      'Needs an IP address **and** up/up status',
      'Adds a `C` subnet route plus an `L` /32 host route',
      'Interface goes down: both routes are removed at once',
    ],
    notes:
      "You never configure connected routes; IOS derives them. As soon as an interface has an IPv4 address **and** its status is up with line protocol up, the router installs two entries: a `C` route for the whole subnet and an `L` route for the exact interface address with a /32 mask. The local route tells the router that packets addressed to that IP are for the router itself and must be processed, not forwarded. Local routes arrived in IOS 15, so older study material may not show them. In the exhibit, G0/0/2 has an address configured but is administratively down, so neither 10.0.13.0/30 nor 10.0.13.1/32 appears, and any static route whose next hop lived on that subnet would disappear with it. The mask of the connected route comes straight from the interface configuration: configure the wrong mask and the router believes in the wrong subnet. Connected and local routes both have an administrative distance of **0**, the most trusted value possible.",
  },
  {
    kind: 'table',
    title: 'Administrative distance: trust, not distance',
    columns: ['Route source', 'Default AD'],
    rows: [
      ['Connected (and local)', '**0**'],
      ['Static route', '**1**'],
      ['eBGP (external BGP)', '20'],
      ['EIGRP internal', '90'],
      ['OSPF', '110'],
      ['IS-IS', '115'],
      ['RIP (v1 and v2)', '120'],
      ['EIGRP external', '170'],
      ['iBGP (internal BGP)', '200'],
      ['Unknown / unusable', '255: never installed'],
    ],
    caption: '==Lower AD wins== when the same prefix is learned from two sources.',
    notes:
      "Administrative distance is a number from 0 to 255 that ranks how **believable** each route source is. It only matters when a router hears about the **exact same prefix**, meaning the same network and the same prefix length, from two or more sources. The router installs the one with the lowest AD and ignores the rest. Memorize this table in order; the exam asks for these values directly and also hides them inside scenario questions. A memory hook: connected 0 and static 1 are things the router knows first-hand or was told by its administrator; eBGP is 20 because an external peer is authoritative for its own networks; then come the interior protocols in the order EIGRP 90, OSPF 110, IS-IS 115 and RIP 120. External EIGRP at 170 and iBGP at 200 sit near the bottom, and 255 means do not trust at all, so such a route never enters the table. AD is local to one router and is never advertised to neighbors. You can change it, for example per static route to build a floating static, but the exam assumes defaults unless an exhibit shows otherwise.",
  },
  {
    kind: 'diagram',
    title: 'AD in action: one prefix, two sources',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'OSPF neighbor', x: 4.2, y: 1 },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'RIP neighbor', x: 4.2, y: 4 },
        { id: 'r4', icon: 'router', label: 'R4', x: 7, y: 2.5 },
        { id: 'lan', icon: 'switch', label: 'LAN', sub: '10.9.9.0/24', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'r2', label: 'OSPF cost 3', tone: 'good' },
        { from: 'r1', to: 'r3', label: 'RIP 2 hops', style: 'dashed', tone: 'bad' },
        { from: 'r2', to: 'r4' },
        { from: 'r3', to: 'r4' },
        { from: 'r4', to: 'lan' },
      ],
      annotations: [
        { x: 7.6, y: 0.8, text: 'O [110/3] installed', tone: 'good' },
        { x: 7.6, y: 4.3, text: 'R [120/2] not installed', tone: 'bad' },
      ],
    },
    caption: 'RIP\'s 2 hops look smaller than OSPF\'s cost of 3, but AD is compared first: 110 beats 120.',
    notes:
      "Here R1 hears about R4's LAN, 10.9.9.0/24, from two different protocols. OSPF, through R2, offers it with a cost of 3. RIP, through R3, offers it with a hop count of 2. Beginners are tempted to pick RIP because 2 is smaller than 3, but those numbers are measured in different units and cannot be compared. The router first compares **administrative distance**: OSPF's 110 beats RIP's 120, so only the OSPF route is installed, shown as `O 10.9.9.0/24 [110/3]`. The RIP route stays in RIP's own database and would be installed automatically if the OSPF route disappeared, for example if the R1 to R2 link failed. Note the precondition: AD is consulted only because both sources offer the **same prefix length**. If RIP had offered 10.9.9.0/25 instead, the two routes would be different entries and both would be installed side by side. Which one a packet then uses is decided by longest prefix match, the subject of the next lesson.",
  },
  {
    kind: 'table',
    title: 'Metrics: each protocol has its own ruler',
    columns: ['Protocol', 'Metric', 'How it is calculated', 'Example'],
    rows: [
      ['RIP', 'Hop count', 'Routers crossed; maximum 15, 16 = unreachable', '`[120/2]`'],
      ['OSPF', 'Cost', 'Sum of outgoing interface costs; cost = 100 Mbps / bandwidth', '`[110/2]`'],
      ['EIGRP', 'Composite', 'Slowest bandwidth plus total delay (default K values)', '`[90/3072]`'],
      ['Static', 'None', 'Always shown as 0', '`[1/0]`'],
      ['BGP', 'Path attributes', 'Best-path algorithm, not a single metric', '`[20/0]`'],
    ],
    caption: 'A metric only ranks routes **from the same protocol**.',
    notes:
      "Once a source is chosen, the **metric** ranks multiple paths to the same prefix inside that one protocol, and the lowest wins. Each protocol measures differently. **RIP** counts hops, so a three-hop path of gigabit links loses to a two-hop path over slow links. **OSPF** adds up the cost of every outgoing interface along the path; with the default reference bandwidth of 100 Mbps, FastEthernet and GigabitEthernet both cost 1, which is why real networks usually raise the reference bandwidth. **EIGRP** builds a composite from the slowest bandwidth on the path plus the cumulative delay, then multiplies by 256, which is why EIGRP metrics look huge: 3072 for a destination two gigabit hops away. Static routes show a metric of 0. The golden rule for the exam: ==never compare metrics across protocols==. A RIP metric of 1 is not better than an OSPF cost of 20; the contest is settled by AD before any metric is examined. When two paths from one protocol tie on metric, the router keeps both and load-balances.",
  },
  {
    kind: 'cli',
    title: 'One route in detail',
    code: `R1# show ip route 10.2.2.77
Routing entry for 10.2.2.0/24
  Known via "ospf 1", distance 110, metric 2, type intra area
  Last update from 10.0.12.2 on GigabitEthernet0/0/1, 00:14:09 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 2.2.2.2, 00:14:09 ago, via GigabitEthernet0/0/1
      Route metric is 2, traffic share count is 1`,
    highlight: ['distance 110, metric 2', 'from 2.2.2.2'],
    caption: 'Give IOS an address and it shows the route it would use, spelled out.',
    notes:
      "When a one-line entry is not enough, add an address or prefix to the command. `show ip route 10.2.2.77` asks the router which entry it would use for that destination and prints the entry in long form. The bracket values from the short view are spelled out as **distance 110, metric 2**, and the source is named: `ospf 1`, meaning OSPF process ID 1, with the OSPF route type *intra area*. The Routing Descriptor Blocks list every next hop. The `from 2.2.2.2` field is the router ID of the OSPF router that originated the information, which is not necessarily the next hop. If several equal paths exist, each one gets its own block. This command is a great troubleshooting shortcut on the job and a direct way to confirm an answer in labs: instead of scanning a long table and working out the best match by hand, let the router tell you. To filter the table by source, use `show ip route ospf`, `show ip route static` or `show ip route connected`.",
  },
  {
    kind: 'cli',
    title: 'Equal-cost paths in the table',
    code: `R7# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.57.0/30 is directly connected, GigabitEthernet0/0/0
L        10.0.57.2/32 is directly connected, GigabitEthernet0/0/0
C        10.0.67.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.67.2/32 is directly connected, GigabitEthernet0/0/1
O        10.50.0.0/24 [110/3] via 10.0.67.1, 00:02:41, GigabitEthernet0/0/1
                      [110/3] via 10.0.57.1, 00:02:41, GigabitEthernet0/0/0`,
    highlight: ['[110/3] via 10.0.67.1', '[110/3] via 10.0.57.1'],
    caption: 'Two `via` lines under one prefix = equal-cost multipath (ECMP).',
    notes:
      "When a routing protocol finds two or more paths to the same prefix with the **same metric**, IOS installs all of them and lists each extra path on its own indented line beneath the prefix. Here R7 reaches 10.50.0.0/24 through two OSPF neighbors, 10.0.67.1 and 10.0.57.1, each with a total cost of 3. That is **equal-cost multipath (ECMP)**. CEF spreads traffic across both paths, by default per destination (per source and destination pair), so one conversation stays on one path while different flows share the load. OSPF and EIGRP install up to four equal paths by default, adjustable with `maximum-paths`. On the exam, do not read the second line as a separate route or as a standby path: it belongs to the same entry and both next hops are active. A backup path with a worse metric does not appear in the routing table at all until the better path disappears, so what you see in the table is always what the router is using right now.",
  },
  {
    kind: 'bullets',
    title: 'Default route and gateway of last resort',
    bullets: [
      'Default route **0.0.0.0/0** matches every destination',
      'Used only when no more specific route matches',
      'Static: `ip route 0.0.0.0 0.0.0.0 203.0.113.1`',
      'Shown as `S*`: the asterisk means **candidate default**',
      '**Gateway of last resort** = next hop of the best default',
      'No default at all: *Gateway of last resort is not set*',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'lan', icon: 'pc', label: 'LAN', sub: '10.1.1.0/24', x: 1, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.6, y: 2, tone: 'accent' },
        { id: 'isp', icon: 'router', label: 'ISP', sub: '203.0.113.1', x: 6.2, y: 2 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 8.8, y: 2 },
      ],
      links: [
        { from: 'lan', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'isp', fromLabel: 'G0/1/0', label: '203.0.113.0/30', arrow: 'forward', tone: 'accent' },
        { from: 'isp', to: 'net' },
      ],
      annotations: [{ x: 5, y: 0.6, text: 'Default route: 0.0.0.0/0 via 203.0.113.1', tone: 'accent' }],
    },
    notes:
      "A **default route** is the route of last resort. The prefix 0.0.0.0/0 has zero network bits, so it matches every possible destination, but because it is the least specific route in the table it is used only when nothing better matches. Edge routers typically point a static default toward the ISP with `ip route 0.0.0.0 0.0.0.0 203.0.113.1`, and interior routers often learn a default from OSPF or EIGRP instead of carrying every Internet prefix. In the table the route is flagged with an asterisk because IOS marks it as a **candidate default**, and the line above the routes summarizes the result: Gateway of last resort is 203.0.113.1 to network 0.0.0.0. If the router has no default route at all, the line reads *Gateway of last resort is not set*, and any packet that matches no route is dropped, normally with an ICMP destination unreachable message returned to the sender. Hosts have a default gateway; routers have a gateway of last resort. Same idea, different name.",
  },
  {
    kind: 'cli',
    title: 'Gateway of last resort: three displays',
    code: `! Static default route to a next-hop address
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 203.0.113.1

! Static default route to an exit interface only
Gateway of last resort is 0.0.0.0 to network 0.0.0.0
S*    0.0.0.0/0 is directly connected, GigabitEthernet0/1/0

! Default learned from OSPF (default-information originate upstream)
Gateway of last resort is 10.0.12.2 to network 0.0.0.0
O*E2  0.0.0.0/0 [110/1] via 10.0.12.2, 00:08:51, GigabitEthernet0/0/1`,
    highlight: ['Gateway of last resort is 203.0.113.1', 'Gateway of last resort is 0.0.0.0', 'O*E2'],
    caption: 'The asterisk marks a candidate default; the Gateway line names its next hop.',
    notes:
      "The same idea can look three different ways, and the exam expects you to recognize all of them. When the static default names a **next-hop IP address**, the gateway line shows that address. When it names only an **exit interface**, there is no next-hop IP to display, so IOS prints a gateway of 0.0.0.0 and the route says `is directly connected`, even though it is a static route with AD 1. That form is fine on point-to-point serial links but a poor choice on Ethernet, where the router must ARP for every destination and rely on proxy ARP upstream. The third form comes from a dynamic protocol: when the OSPF router at the Internet edge uses `default-information originate`, its neighbors learn `O*E2 0.0.0.0/0 [110/1]`, an external type 2 default with a metric of 1. Whatever the source, only one default wins: normal AD rules apply, so a static default with AD 1 beats an OSPF-learned default with AD 110.",
  },
  {
    kind: 'cli',
    title: 'Reading show ipv6 route',
    code: `R1# show ipv6 route
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
S   ::/0 [1/0]
     via 2001:DB8:0:12::2
C   2001:DB8:0:12::/64 [0/0]
     via GigabitEthernet0/0/1, directly connected
L   2001:DB8:0:12::1/128 [0/0]
     via GigabitEthernet0/0/1, receive
C   2001:DB8:1:1::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:1:1::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
O   2001:DB8:2:2::/64 [110/2]
     via FE80::2, GigabitEthernet0/0/1
L   FF00::/8 [0/0]
     via Null0, receive`,
    highlight: ['FE80::2', 'receive', '::/0 [1/0]'],
    caption: 'Two lines per route; OSPFv3 next hops are link-local addresses.',
    notes:
      "The IPv6 table carries the same information as the IPv4 table but lays it out differently. Each route takes **two lines**: the code, prefix and `[AD/metric]` on the first, and the next hop or interface on the second. There are no classful header lines, and the first line of output gives the table name and the number of entries. Connected and local routes appear in pairs just like IPv4, except that the local route is a **/128** and is marked `receive`; notice that IPv6 even prints `[0/0]` for them. Look carefully at the OSPF route: its next hop is **FE80::2**, a link-local address, followed by the exit interface. IPv6 routing protocols advertise link-local next hops, so the interface is needed to make the next hop meaningful. The default route is simply `::/0`, and there is no gateway of last resort line. Finally, every IOS router shows `L FF00::/8 via Null0, receive`, an automatic entry covering all multicast addresses. It is normal, not a misconfiguration. Administrative distances match IPv4: static 1, EIGRP 90, OSPF 110.",
  },
  {
    kind: 'table',
    title: 'IPv6 route codes',
    columns: ['Code', 'Meaning', 'Typical entry'],
    rows: [
      ['`C`', 'Connected prefix (usually a /64)', '`C 2001:DB8:1:1::/64 [0/0]`'],
      ['`L`', 'Local /128 interface address (and FF00::/8)', '`L 2001:DB8:1:1::1/128 [0/0]`'],
      ['`S`', 'Static route, including the default `::/0`', '`S ::/0 [1/0]`'],
      ['`O` / `OI`', 'OSPFv3 intra-area / inter-area', '`O 2001:DB8:2:2::/64 [110/2]`'],
      ['`OE1` / `OE2`', 'OSPFv3 external type 1 / type 2', '`OE2 2001:DB8:99::/48 [110/20]`'],
      ['`D` / `EX`', 'EIGRP for IPv6 internal / external', 'AD 90 / 170, as in IPv4'],
      ['`ND`', 'Default route learned from a Router Advertisement', 'Router interface acting as a SLAAC client'],
    ],
    notes:
      "Most IPv6 codes mirror their IPv4 cousins, with a few spelling differences worth memorizing. OSPFv3 uses `O` for intra-area routes, but inter-area routes are written `OI` rather than `O IA`, and external routes are `OE1` and `OE2` without a space. EIGRP for IPv6 keeps `D`, with `EX` for external routes. The one code with no IPv4 equivalent is `ND`, short for Neighbor Discovery. It appears when a router interface is configured as a client with `ipv6 address autoconfig default`: the router learns its default route from the Router Advertisements of an upstream router, exactly like a host doing SLAAC. There is no gateway of last resort line in the IPv6 table; you find the default by looking for `::/0`, the IPv6 equivalent of 0.0.0.0/0. Also remember that a router forwards IPv6 packets only after `ipv6 unicast-routing` is enabled globally; without it, the router behaves like an IPv6 host on each of its links.",
  },
  {
    kind: 'steps',
    title: 'Five questions for any route entry',
    steps: [
      { title: 'Which source?', text: 'Read the code: `C`, `L`, `S`, `O`, `D`, `R`, `B`, plus any asterisk.' },
      { title: 'Which prefix length?', text: 'From the entry itself, or from its `is subnetted` header line.' },
      { title: 'How trusted, how far?', text: '`[AD/metric]`: AD ranks sources, metric ranks paths in one protocol.' },
      { title: 'Where next?', text: 'Next hop after `via`; exit interface at the end of the line.' },
      { title: 'How fresh?', text: 'A seconds-old OSPF or EIGRP route in a stable network hints at flapping.' },
    ],
    notes:
      "Turn the reading process into a habit and exhibit questions become mechanical. First, the **source**: the code tells you who put the route there, and an asterisk flags a default candidate. Second, the **prefix length**: most entries show it directly, but when a classful network is subnetted with a single mask, IOS prints the mask once on the header line, as in `172.16.0.0/24 is subnetted, 1 subnets`, and omits it from the entries below. Third, the **[AD/metric]** pair: AD explains why this source beat others for the same prefix, and the metric explains why this path beat others inside the protocol. Fourth, **where next**: the address after `via` is the next-hop router and the interface at the end is the exit. Finally, the **age**: an OSPF or EIGRP route that is only seconds old in a network that should be stable hints at a flapping link. RIP is the exception, because its age keeps resetting as updates arrive every 30 seconds.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: the routing table',
    body: 'Read the brackets as **[AD/metric]**, never the other way round, and compare metrics only inside one protocol.',
    bullets: [
      '`[120/1]` is a one-hop RIP route, not AD 1',
      'A lower RIP metric never beats OSPF: AD is checked first',
      'AD only decides between routes with the **same prefix length**',
      '`L` routes are /32 (IPv4) or /128 (IPv6) interface addresses',
      'Exit-interface static default: gateway shown as 0.0.0.0',
      'External EIGRP (170) and iBGP (200) lose to RIP (120)',
      'Header lines such as `is variably subnetted` are not routes',
    ],
    notes:
      "These are the traps that catch well-prepared candidates. The bracket order is fixed, distance first and metric second, so `[120/1]` is a one-hop RIP route, not a route with AD 1. Metrics from different protocols live on different scales; AD settles the contest before any metric is compared. AD itself only arbitrates between identical prefixes: a /25 learned from RIP and a /24 learned from OSPF are two separate routes, and both are installed. Know what an `L` route is and that it exists only while its interface is up/up. Recognize a default route in all its forms, including a static default, an OSPF external default and the IPv6 `::/0`, and remember that an exit-interface default shows the gateway as 0.0.0.0. Watch the low-trust values: external EIGRP at 170 and iBGP at 200 are both less trusted than RIP at 120, which surprises people who assume EIGRP always wins. Finally, never count a classful header line as a route when a question asks how many routes use an interface.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Codes name the source: `C`, `L`, `S`, `O`, `O IA`, `O E2`, `D`, `D EX`, `R`, `B`',
      '`[AD/metric]`: trust of the source / cost inside the protocol',
      'AD: 0, 1, 20, 90, 110, 115, 120, 170, 200, 255',
      'Up/up interface with an IP: `C` subnet route + `L` host route',
      'Default route 0.0.0.0/0 sets the gateway of last resort',
      'IPv6: two-line entries, /128 locals, link-local next hops, `ND`',
    ],
    notes:
      "You can now read any IOS routing table. Start with the code to learn the source, then the prefix and its length, then the two numbers in brackets: administrative distance to rank sources and metric to rank paths inside one protocol. Follow the `via` address to the next hop and the interface at the end of the line to the exit. Connected and local routes come for free with every up/up interface that has an address. The administrative distance list should now be automatic: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, external EIGRP 170, iBGP 200 and 255 for unusable routes. The default route drives the gateway of last resort line, and in IPv6 you look for `::/0` instead. In the next lesson you will use this table to make real forwarding decisions with longest prefix match, which is where all of these reading skills pay off in exam scenarios.",
  },
];
