import type { Question } from '../../types';

const R1_TABLE = `R1# show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
<output omitted>

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 6 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
O        10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
O IA     10.22.0.0/24 [110/3] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
O E2  192.168.100.0/24 [110/20] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/1/0
L        203.0.113.2/32 is directly connected, GigabitEthernet0/1/0`;

const R3_V6_TABLE = `R3# show ipv6 route
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1
       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
S   ::/0 [1/0]
     via 2001:DB8:0:34::4
C   2001:DB8:0:34::/64 [0/0]
     via GigabitEthernet0/0/1, directly connected
L   2001:DB8:0:34::3/128 [0/0]
     via GigabitEthernet0/0/1, receive
C   2001:DB8:3:3::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:3:3::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
OI  2001:DB8:44:1::/64 [110/3]
     via FE80::4, GigabitEthernet0/0/1
L   FF00::/8 [0/0]
     via Null0, receive`;

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the route to 10.22.0.0/24?',
    exhibit: { kind: 'cli', text: R1_TABLE },
    options: [
      'It is an OSPF route to a prefix in a different area, with an OSPF cost of 3',
      'It is an external route redistributed into OSPF, with a metric of 3',
      'It is an OSPF route with an administrative distance of 3',
      'It is an intra-area OSPF route that was learned 3 hours ago',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "`O IA` marks an OSPF **inter-area** route: the prefix lives in another area and was advertised into R1's area by an ABR. In `[110/3]` the AD is 110 and the cost is **3**. An external route would carry `E1` or `E2`, like the 192.168.100.0/24 entry. The AD is not 3, the route is not intra-area, and the age `00:14:09` means 14 minutes and 9 seconds.",
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. R1 receives a packet destined to 198.51.100.25. What does R1 do with the packet?',
    exhibit: { kind: 'cli', text: R1_TABLE },
    options: [
      'Forwards it to 203.0.113.1 out GigabitEthernet0/1/0',
      'Drops it, because no route in the table matches 198.51.100.25',
      'Forwards it to 10.0.12.2, because OSPF supplied the most routes',
      'Floods it out every interface except the one it arrived on',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'No specific route covers 198.51.100.25, so the **default route** `0.0.0.0/0` matches, and the gateway of last resort 203.0.113.1 is reached through the connected 203.0.113.0/30 on G0/1/0. A packet is dropped only when nothing matches, and here the default always matches. The number of routes a protocol supplies is irrelevant, and flooding unknown destinations is switch behavior for unknown unicast frames, never router behavior for packets.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: R1_TABLE },
    options: [
      'R1 has the address 10.1.1.1 configured on GigabitEthernet0/0/0',
      'The route to 192.168.100.0/24 was redistributed into OSPF by an ASBR',
      'The route to 10.2.2.0/24 has an administrative distance of 2',
      'R1 learned the 10.0.12.0/30 network from OSPF neighbor 10.0.12.2',
      'R1 has no default route because no gateway of last resort is set',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "The local route `L 10.1.1.1/32` on GigabitEthernet0/0/0 is R1's own interface address, and `O E2` means the prefix was **redistributed into OSPF** by an ASBR elsewhere. The route to 10.2.2.0/24 has AD 110 and cost 2, not AD 2. 10.0.12.0/30 is coded `C`, a connected network R1 did not learn from anyone. The static default and the gateway line show that R1 does have a default route.",
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'In `show ipv6 route`, which prefix length is shown for a local (`L`) route that represents an interface address?',
    options: ['A /64 prefix', 'A /128 prefix', 'A /32 prefix', 'A /10 prefix'],
    answer: 1,
    difficulty: 1,
    explanation:
      'IPv6 local routes are **/128** host routes marked `receive`. /64 is the typical connected (`C`) prefix, /32 is the length of an IPv4 local route, and /10 is the size of the link-local block FE80::/10.',
  },
  {
    id: 'e5',
    type: 'categorize',
    stem: 'An engineer compares route sources with OSPF (AD 110). Drag each source into the correct category.',
    categories: ['More trusted than OSPF (lower AD)', 'Less trusted than OSPF (higher AD)'],
    items: [
      { text: 'Static route', category: 0 },
      { text: 'eBGP', category: 0 },
      { text: 'Internal EIGRP', category: 0 },
      { text: 'Connected', category: 0 },
      { text: 'IS-IS', category: 1 },
      { text: 'RIP', category: 1 },
      { text: 'External EIGRP', category: 1 },
      { text: 'iBGP', category: 1 },
    ],
    difficulty: 2,
    explanation:
      "Lower than 110: connected 0, static 1, eBGP 20 and internal EIGRP 90. Higher than 110: IS-IS 115, RIP 120, external EIGRP 170 and iBGP 200. IS-IS is often misplaced because 115 is so close to OSPF's 110, and external EIGRP is the other trap: internal EIGRP beats OSPF, but external EIGRP does not.",
  },
  {
    id: 'e6',
    type: 'match',
    stem: 'Match each IPv4 route code to its meaning.',
    pairs: [
      { left: '`O IA`', right: 'OSPF route to a prefix in another area' },
      { left: '`O E2`', right: 'Route redistributed into OSPF, external type 2' },
      { left: '`D EX`', right: 'Route redistributed into EIGRP' },
      { left: '`L`', right: "Address of one of the router's own interfaces" },
      { left: '`B`', right: 'Route learned from a BGP peer' },
      { left: '`R`', right: 'Route learned from RIP' },
    ],
    difficulty: 2,
    explanation:
      'OSPF codes add `IA` for inter-area and `E1`/`E2` for external routes. EIGRP uses `D`, with `D EX` for external routes (AD 170). `L` is the /32 local route, `B` is BGP (AD 20 or 200) and `R` is RIP (AD 120).',
  },
  {
    id: 'e7',
    type: 'single',
    stem: "Refer to the exhibit. R1 runs EIGRP with R3 and RIP with R4. R4 advertises 172.16.1.0/24 to R1 with a hop count of 1. Why is there no RIP route for 172.16.1.0/24 in R1's routing table?",
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route | include 172.16
      172.16.0.0/24 is subnetted, 1 subnets
D        172.16.1.0 [90/3072] via 10.0.13.2, 1d02h, GigabitEthernet0/0/2`,
    },
    options: [
      'EIGRP has a lower administrative distance than RIP, so only the EIGRP route is installed',
      'The RIP route is installed too, but IOS lists only the first of two equal paths',
      'RIP routes are installed only when their hop count is lower than the EIGRP metric divided by 256',
      'The EIGRP route has been in the table longer, and the oldest route always wins',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Both protocols offer the same prefix, 172.16.1.0/24, so R1 compares **administrative distance**: internal EIGRP (90) beats RIP (120), and the RIP route stays in the RIP database as a fallback. Metrics from different protocols are never compared, so the hop count of 1 is irrelevant and no conversion rule exists. Extra `via` lines appear only for equal-metric paths from the same source, and route age plays no part in route selection.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'R1 learns 10.2.2.0/24 through OSPF with a cost of 2. An engineer adds `ip route 10.2.2.0 255.255.255.0 10.0.13.2 130`. What is the result?',
    options: [
      'The OSPF route stays in the table; the static route is installed only if the OSPF route is lost',
      'The static route replaces the OSPF route, because static routes have AD 1',
      'Both routes are installed and R1 load-balances between 10.0.12.2 and 10.0.13.2',
      'IOS rejects the command, because a static route cannot have a higher AD than OSPF',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "The trailing **130** sets this static route's AD. Because 130 is higher than OSPF's 110, the OSPF route wins and the static becomes a **floating static route**, installed automatically if the OSPF route disappears. AD 1 is only the default for static routes; load balancing requires the same source with equal metrics; and IOS accepts any AD from 1 to 255 on a static route.",
  },
  {
    id: 'e9',
    type: 'input',
    stem: 'What is the default administrative distance of an internal EIGRP route? (Enter the number.)',
    answers: ['90'],
    placeholder: 'AD',
    difficulty: 1,
    explanation: 'Internal EIGRP routes (`D`) have AD **90**. External EIGRP routes (`D EX`) have AD 170, OSPF has 110 and RIP has 120.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Why is the next hop of the OSPF route a link-local address?',
    exhibit: { kind: 'cli', text: R3_V6_TABLE },
    options: [
      'OSPFv3 uses link-local next hops, so the exit interface is shown with them',
      'The neighbor has no global unicast address configured on its link to R3',
      'The route is a static route that an administrator pointed at FE80::4',
      'IPv6 routers can forward packets only to link-local next-hop addresses',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "IPv6 routing protocols such as OSPFv3 use the neighbor's **link-local** address as the next hop, and because the same FE80 address can exist on many links, the exit interface is always shown with it. The neighbor may well have a global address; OSPFv3 would still use its link-local one. The code is `OI` (OSPFv3 inter-area), not `S`. Static routes can use global next hops, as the `::/0` route via 2001:DB8:0:34::4 shows.",
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: R3_V6_TABLE },
    options: [
      "R3's address on GigabitEthernet0/0/0 is 2001:DB8:3:3::1",
      '2001:DB8:44:1::/64 is an OSPFv3 route to a prefix in another area',
      'The OSPFv3 route has an administrative distance of 3',
      'R3 learned its default route from a Router Advertisement',
      'The FF00::/8 entry shows that multicast routing is misconfigured',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "The `L` /128 entry on G0/0/0 is R3's own address, **2001:DB8:3:3::1**, and `OI` is an OSPFv3 **inter-area** route. The OSPFv3 route has AD 110 and metric 3, not AD 3. The default route is coded `S`, a static route; one learned from an RA would be coded `ND`. `L FF00::/8 via Null0` is an automatic entry on every IOS router, not an error.",
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Refer to the exhibit. The engineer expects connected routes for GigabitEthernet0/0/1 and GigabitEthernet0/0/2. Which two statements explain why they are missing? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.0.12.1       YES manual up                    down
GigabitEthernet0/0/2   unassigned      YES unset  up                    up
R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0`,
    },
    options: [
      'G0/0/1 has a physical or data link problem, so its line protocol is down',
      'G0/0/2 has no IPv4 address configured',
      'G0/0/1 is administratively shut down',
      'Connected routes appear only after a routing protocol is enabled on the interface',
      'Connected routes are hidden while the gateway of last resort is not set',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'A connected route needs an IP address **and** an up/up interface. G0/0/1 is up/down, which points to a Layer 1 or Layer 2 problem on that link, and G0/0/2 is up/up but `unassigned`. G0/0/1 is not administratively down; that would read `administratively down` in the Status column. No routing protocol is needed for connected routes, and the missing default route has no effect on them.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. The static default route is configured, but the router has no gateway of last resort. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip route
ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1# show ip interface brief | include 0/1/0
GigabitEthernet0/1/0   203.0.113.2     YES manual up                    down
R1# show ip route | include Gateway
Gateway of last resort is not set`,
    },
    options: [
      'The next hop 203.0.113.1 is unreachable because G0/1/0 is down, so the static route is not installed',
      'A router also needs `ip default-gateway 203.0.113.1` to set a gateway of last resort',
      'A static default route is installed only after `default-information originate` is configured',
      'The route must use an exit interface instead of a next-hop address to be installed',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A static route is installed only while its next hop is resolvable. With G0/1/0 up/down, the connected route 203.0.113.0/30 disappears, 203.0.113.1 becomes unreachable, and IOS withholds the static default. `ip default-gateway` is used only when IP routing is disabled, as on a Layer 2 switch. `default-information originate` advertises a default into OSPF and is not needed to install a static route. A default pointing out G0/1/0 would also be removed while that interface is down.',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'Put the fields of a learned IPv4 route entry in `show ip route` in the order they appear, from left to right.',
    items: [
      'Route source code',
      'Destination prefix and length',
      '[Administrative distance/metric]',
      'Next-hop address',
      'Age of the route',
      'Outgoing interface',
    ],
    difficulty: 2,
    explanation:
      'A learned route reads: code, prefix/length, `[AD/metric]`, `via` next hop, age, exit interface, for example `O 10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:09, GigabitEthernet0/0/1`.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'R1 learns 10.40.0.0/16 from OSPF with a cost of 30 and from RIP with a hop count of 2, and the OSPF route is installed. The team wants R1 to use the RIP path for this prefix while keeping OSPF running. Which change achieves this?',
    options: [
      'Configure an administrative distance lower than 110 for the RIP-learned route',
      'Increase the OSPF cost of the interface toward the OSPF neighbor',
      'Add a direct link so that RIP reports the prefix with a hop count of 1',
      'Configure a static route to the RIP next hop with an AD of 130',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Between sources for the same prefix only **AD** matters, so the RIP route must become more trusted than OSPF, for example with the `distance` command under the RIP process. Raising the OSPF cost or lowering the RIP hop count only changes metrics, which are never compared across protocols. A static route with AD 130 is a floating static that loses to OSPF (110) and would stay out of the table.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'What does an administrative distance of 255 indicate?',
    options: [
      'The route is the most trusted route possible',
      'The source is untrusted and the route will not be installed',
      'The route was learned from an iBGP peer',
      'The route is a floating static route waiting to be used',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'AD **255** means unknown or unusable: the route never enters the routing table. The most trusted value is 0 (connected), iBGP uses 200, and a floating static route uses an AD above the primary route but below 255 so that it can take over.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. How does R4 forward packets destined to 192.168.10.50?',
    exhibit: {
      kind: 'cli',
      text: `R4# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.14.0/30 is directly connected, GigabitEthernet0/0/0
L        10.0.14.2/32 is directly connected, GigabitEthernet0/0/0
C        10.0.24.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.24.2/32 is directly connected, GigabitEthernet0/0/1
D     192.168.10.0/24 [90/3072] via 10.0.24.1, 00:31:07, GigabitEthernet0/0/1
                      [90/3072] via 10.0.14.1, 00:31:07, GigabitEthernet0/0/0`,
    },
    options: [
      'It load-balances across both paths, because they have the same AD and metric',
      'It uses only 10.0.24.1, because that path is listed first in the table',
      'It uses only 10.0.14.1, because it is the lower next-hop address of the two',
      'It drops the packets, because two routes for one prefix are a conflict',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Two `via` lines under one prefix show **equal-cost multipath**: both EIGRP paths have AD 90 and metric 3072, and CEF shares traffic across them (per destination by default). The order of the lines means nothing, next-hop addresses are not a tiebreaker, and multiple equal paths are normal rather than a conflict.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Refer to the exhibit. What is the prefix length of the route to 172.16.5.32? (Answer in slash notation.)',
    exhibit: {
      kind: 'cli',
      text: `R2# show ip route | begin Gateway
Gateway of last resort is 10.0.12.1 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.0.12.1, 00:22:10, GigabitEthernet0/0/1
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.2/32 is directly connected, GigabitEthernet0/0/1
C        10.2.2.0/24 is directly connected, GigabitEthernet0/0/0
L        10.2.2.1/32 is directly connected, GigabitEthernet0/0/0
      172.16.0.0/27 is subnetted, 2 subnets
O IA     172.16.5.0 [110/4] via 10.0.12.1, 00:22:10, GigabitEthernet0/0/1
O IA     172.16.5.32 [110/4] via 10.0.12.1, 00:22:10, GigabitEthernet0/0/1`,
    },
    answers: ['/27', '27', '255.255.255.224'],
    placeholder: '/nn',
    difficulty: 2,
    explanation:
      'The header `172.16.0.0/27 is subnetted, 2 subnets` states the mask for every entry beneath it, so both 172.16.5.0 and 172.16.5.32 are **/27** routes (255.255.255.224). IOS omits the length on the entries when all subnets of a classful network share one mask. Guessing /16 from the class B address or /24 out of habit are the usual mistakes.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two conditions must be met for IOS to install a connected route for an interface? (Choose two.)',
    options: [
      'The interface has an IPv4 address and mask configured',
      'The interface status is up and its line protocol is up',
      'A routing protocol is enabled on the interface',
      'A neighbor has been discovered on the link with CDP',
      'A default route is configured on the router',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A connected route, with its local /32, appears as soon as the interface has an **address** and is **up/up**. Routing protocols advertise connected networks but do not create them, CDP has nothing to do with routing, and a default route is independent of connected routes.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: "Which code in `show ipv6 route` identifies a default route learned from an upstream router's Router Advertisement?",
    options: ['`ND`', '`NDp`', '`S`', '`L`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`ND` (ND Default) is a default route learned through Neighbor Discovery RAs, seen when an interface uses `ipv6 address autoconfig default`. `NDp` is a prefix learned from an RA, `S` is a manually configured static route and `L` is a local /128 interface address.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. The link on GigabitEthernet0/0/1 fails and OSPF has no alternate path. Where does R1 send a packet destined to 10.2.2.50?',
    exhibit: { kind: 'cli', text: R1_TABLE },
    options: [
      'To 203.0.113.1, using the default route',
      'To 10.0.12.2, until the age of the OSPF route reaches its limit',
      'Nowhere; R1 drops it because the specific route to 10.2.2.0/24 is gone',
      'Out GigabitEthernet0/0/0, because 10.2.2.50 is part of the classful 10.0.0.0/8 network',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'When G0/0/1 goes down, its connected and local routes vanish and the OSPF neighbor 10.0.12.2 is lost, so every OSPF route through it is removed. The only remaining match for 10.2.2.50 is the **default route**, so R1 forwards the packet to the ISP, a classic side effect of a default route. The age field is not an expiry timer, R1 does not drop packets that still match a route, and routers never forward based on classful boundaries.',
  },
];
