import type { Diagram, Question } from '../../types';

const R2_TABLE = `R2# show ip route | begin Gateway
Gateway of last resort is 203.0.113.9 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.9
      172.20.0.0/16 is variably subnetted, 10 subnets, 6 masks
O IA     172.20.0.0/16 [110/50] via 172.20.255.2, 00:40:02, GigabitEthernet0/0/0
S        172.20.16.0/20 [1/0] via 172.20.255.6
D        172.20.24.0/21 [90/3328] via 172.20.255.10, 00:12:44, GigabitEthernet0/0/2
O        172.20.26.0/24 [110/3] via 172.20.255.2, 00:40:02, GigabitEthernet0/0/0
C        172.20.255.0/30 is directly connected, GigabitEthernet0/0/0
L        172.20.255.1/32 is directly connected, GigabitEthernet0/0/0
C        172.20.255.4/30 is directly connected, GigabitEthernet0/0/1
L        172.20.255.5/32 is directly connected, GigabitEthernet0/0/1
C        172.20.255.8/30 is directly connected, GigabitEthernet0/0/2
L        172.20.255.9/32 is directly connected, GigabitEthernet0/0/2
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.8/30 is directly connected, GigabitEthernet0/1/0
L        203.0.113.10/32 is directly connected, GigabitEthernet0/1/0`;

const R1_ECMP_TABLE = `R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 7 subnets, 5 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.0.13.0/30 is directly connected, GigabitEthernet0/0/2
L        10.0.13.1/32 is directly connected, GigabitEthernet0/0/2
O        10.60.0.0/16 [110/3] via 10.0.13.2, 00:10:10, GigabitEthernet0/0/2
                      [110/3] via 10.0.12.2, 00:10:10, GigabitEthernet0/0/1
S        10.60.64.0/18 [1/0] via 10.0.12.2
O        10.60.100.0/24 [110/4] via 10.0.13.2, 00:10:10, GigabitEthernet0/0/2`;

const R3_VIA = `R3# show ip route | include via
S*    0.0.0.0/0 [1/0] via 192.0.2.1
O        172.16.0.0/16 [110/20] via 10.1.1.2, 00:03:11, GigabitEthernet0/0/0
D        172.16.64.0/18 [90/3072] via 10.2.2.2, 00:03:40, GigabitEthernet0/0/1
R        172.16.96.0/19 [120/2] via 10.3.3.2, 00:00:21, GigabitEthernet0/0/2
S        172.16.100.0/22 [1/0] via 10.4.4.2`;

const PATH: Diagram = {
  type: 'topology',
  width: 12,
  height: 3,
  nodes: [
    { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1, y: 1.5 },
    { id: 'r1', icon: 'router', label: 'R1', x: 4.3, y: 1.5 },
    { id: 'r2', icon: 'router', label: 'R2', x: 7.7, y: 1.5 },
    { id: 'srv', icon: 'server', label: 'Server1', sub: '10.3.3.30', x: 11, y: 1.5 },
  ],
  links: [
    { from: 'pc', to: 'r1', label: '10.1.1.0/24', fromLabel: '0050.7966.0001', toLabel: 'G0/0/0 0c11.1111.0000' },
    { from: 'r1', to: 'r2', label: '10.0.12.0/30', fromLabel: 'G0/0/1 0c11.1111.0001', toLabel: 'G0/0/1 0c22.2222.0001' },
    { from: 'r2', to: 'srv', label: '10.3.3.0/24', fromLabel: 'G0/0/0 0c22.2222.0000', toLabel: '0050.7966.0003' },
  ],
};

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. Which next hop does R2 use for a packet destined to 172.20.27.9?',
    exhibit: { kind: 'cli', text: R2_TABLE },
    options: ['172.20.255.10', '172.20.255.2', '172.20.255.6', '203.0.113.9'],
    answer: 0,
    difficulty: 2,
    explanation:
      '172.20.27.9 matches 172.20.0.0/16, 172.20.16.0/20 (third octet 16 to 31), 172.20.24.0/21 (24 to 31) and the default, but not 172.20.26.0/24, which covers only third-octet value 26. The longest match is the EIGRP **/21**, next hop **172.20.255.10**. 172.20.255.2 serves the /24 and the /16; the static /20 has the best AD but a shorter prefix; and the default is only a last resort.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two destinations does R2 forward to 172.20.255.2? (Choose two.)',
    exhibit: { kind: 'cli', text: R2_TABLE },
    options: ['172.20.26.200', '172.20.40.9', '172.20.27.9', '172.20.18.1', '172.21.26.1'],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      '172.20.26.200 falls inside the OSPF /24, the longest match, and 172.20.40.9 matches only the OSPF /16 because it is outside 172.20.16.0/20 (16 to 31) and 172.20.24.0/21 (24 to 31). Both use **172.20.255.2**. 172.20.27.9 uses the EIGRP /21 via 172.20.255.10, 172.20.18.1 uses the static /20 via 172.20.255.6, and 172.21.26.1 is outside 172.20.0.0/16 entirely, so it follows the default route to 203.0.113.9.',
  },
  {
    id: 'e3',
    type: 'input',
    stem: 'Refer to the exhibit. R2 receives a packet for 172.20.20.9. Which next-hop IP address does R2 use?',
    exhibit: { kind: 'cli', text: R2_TABLE },
    answers: ['172.20.255.6'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation:
      '172.20.20.9 is inside 172.20.16.0/20 (third octet 16 to 31) but outside 172.20.24.0/21 (24 to 31) and 172.20.26.0/24, so the longest match is the static **/20** with next hop **172.20.255.6**. The OSPF /16 also matches but is shorter.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. R1 receives a packet destined to 10.8.1.77. What does R1 do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip route
ip route 10.8.0.0 255.255.0.0 10.0.13.3
R1# show ip route | include 10.8
S        10.8.0.0/16 [1/0] via 10.0.13.3
O        10.8.1.0/24 [110/11] via 10.0.12.2, 00:05:30, GigabitEthernet0/0/1`,
    },
    options: [
      'Forwards it to 10.0.12.2, because the OSPF /24 is the longest match',
      'Forwards it to 10.0.13.3, because the static route has the lower AD',
      'Shares the load between 10.0.12.2 and 10.0.13.3',
      'Forwards it to 10.0.13.3, because the static metric of 0 is lower than 11',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Both routes match 10.8.1.77, and they are different prefixes, so there is no AD contest: the **/24** is longer and sends the packet to **10.0.12.2**. The static route has the better AD but a shorter prefix, so it serves only the rest of 10.8.0.0/16. Load sharing needs equal-cost paths for one prefix from one source, and metrics are never compared across sources.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'R1 learns 192.168.50.0/24 from internal EIGRP, from OSPF and from RIP. An administrator also configures a static route to 192.168.50.0/25. Which two routes appear in the routing table? (Choose two.)',
    options: [
      'The EIGRP route to 192.168.50.0/24',
      'The static route to 192.168.50.0/25',
      'The OSPF route to 192.168.50.0/24',
      'The RIP route to 192.168.50.0/24',
      'One 192.168.50.0/24 route that shares the load across all three protocols',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'The three dynamic routes are the **same prefix and length**, so AD decides: internal EIGRP (90) beats OSPF (110) and RIP (120), and only the EIGRP /24 is installed. The static /25 is a **different prefix**, so it does not compete and is installed as well. Addresses 192.168.50.0 to .127 then use the static /25, and .128 to .255 use the EIGRP /24. Routes from different protocols are never load-balanced together.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'A router has routes to 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 and 0.0.0.0/0. A packet to which destination is forwarded using the default route?',
    options: ['172.32.1.1', '172.31.255.1', '10.255.255.1', '192.168.200.1'],
    answer: 0,
    difficulty: 2,
    explanation:
      '172.16.0.0/12 has a block size of 16 in the second octet, so it covers 172.16.0.0 through **172.31.255.255**. 172.32.1.1 matches no specific route and uses the **default**. 172.31.255.1 is still inside the /12, 10.255.255.1 is inside 10.0.0.0/8, and 192.168.200.1 is inside 192.168.0.0/16.',
  },
  {
    id: 'e7',
    type: 'order',
    stem: 'Put these steps in order, from building the routing table to forwarding a packet.',
    items: [
      'Collect candidate routes from connected, static and dynamic sources',
      'For identical prefixes, keep the source with the lowest AD',
      'Within that protocol, keep the path or paths with the lowest metric',
      'Copy the best routes into the CEF FIB',
      'For each packet, select the longest-prefix match',
    ],
    difficulty: 2,
    explanation:
      'The control plane gathers candidates, lets AD choose between sources and the metric choose within the winning protocol, and CEF copies the result into the FIB. Only then does the data plane perform a longest-prefix lookup for each packet.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Refer to the exhibit. PC1 sends a packet to Server1. Which two statements describe the frame on the link between R1 and R2? (Choose two.)',
    exhibit: { kind: 'diagram', diagram: PATH },
    options: [
      'The source MAC is 0c11.1111.0001 and the destination MAC is 0c22.2222.0001',
      'The source IP is 10.1.1.10 and the destination IP is 10.3.3.30',
      'The source MAC is 0050.7966.0001, the MAC address of PC1',
      'The destination MAC is 0050.7966.0003, the MAC address of Server1',
      'The source IP is 10.0.12.1, the address of R1 G0/0/1',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "On each link the frame is addressed between the two devices on that link: from **R1 G0/0/1 (0c11.1111.0001)** to **R2 G0/0/1 (0c22.2222.0001)**. The IP header still carries the original endpoints, **10.1.1.10 to 10.3.3.30**, because routers do not change addresses without NAT. PC1's MAC appears only on the first link, the server's MAC only on the last link, and R1 never substitutes its own IP address as the source.",
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'A router receives an IPv4 packet with a TTL of 1 that must be forwarded to another network. What does the router do?',
    options: [
      'Drops it and sends an ICMP Time Exceeded message to the source',
      'Forwards it with a TTL of 0',
      'Forwards it unchanged, because only the destination host checks the TTL',
      'Resets the TTL to 255 and forwards it',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Decrementing a TTL of 1 gives 0, so the router **drops** the packet and returns ICMP **Time Exceeded**, the mechanism traceroute relies on. A packet is never forwarded with TTL 0, every router decrements the TTL (not only the destination), and routers never reset it.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Which CEF table stores the precomputed Layer 2 header used to reach each next hop?',
    options: ['Adjacency table', 'FIB prefix table', 'RIB routing table', 'Switch CAM table'],
    answer: 0,
    difficulty: 1,
    explanation:
      "The **adjacency table** holds the rewrite information, the next-hop MAC and outgoing interface, built from ARP. The FIB holds the prefixes and points to adjacencies, the RIB is the routing table the FIB is built from, and the CAM table is a switch's MAC address table.",
  },
  {
    id: 'e11',
    type: 'match',
    stem: 'Match each term to its role in the forwarding decision.',
    pairs: [
      { left: 'Longest prefix match', right: 'Selects the route used for each packet' },
      { left: 'Administrative distance', right: 'Chooses between sources offering the same prefix' },
      { left: 'Metric', right: 'Chooses between paths inside one routing protocol' },
      { left: 'Equal metrics', right: 'Several next hops installed for one prefix' },
      { left: 'FIB', right: 'CEF copy of the routes, searched for each packet' },
      { left: 'Adjacency table', right: 'Precomputed Layer 2 rewrite for each next hop' },
    ],
    difficulty: 2,
    explanation:
      'Prefix length decides per packet; AD and metric decide what enters the table, with equal metrics producing ECMP. CEF turns the result into the FIB (routes) and the adjacency table (Layer 2 rewrites).',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: R1_ECMP_TABLE },
    options: [
      'Packets to 10.60.101.5 are sent only to 10.0.12.2',
      'Packets to 10.60.200.5 are shared between 10.0.12.2 and 10.0.13.2',
      'Packets to 10.60.100.5 are sent to 10.0.12.2, because the static route has AD 1',
      'Packets to 10.60.63.5 are sent only to 10.0.12.2 through the static route',
      'Packets to 10.61.0.1 are shared over both OSPF paths',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      '10.60.101.5 is inside 10.60.64.0/18 (third octet 64 to 127) but not inside the /24, so the static /18 sends it to **10.0.12.2** only. 10.60.200.5 matches only the /16, which has two equal-cost OSPF paths, so the load is **shared**. 10.60.100.5 matches the OSPF /24, which is longer than the static /18, so it goes to 10.0.13.2. 10.60.63.5 is below the /18 range and uses the ECMP /16. 10.61.0.1 matches nothing and there is no default route, so it is dropped.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. What happens to a packet that R1 receives for 10.61.0.1?',
    exhibit: { kind: 'cli', text: R1_ECMP_TABLE },
    options: [
      'R1 drops it and may send an ICMP destination unreachable to the source',
      'R1 forwards it using 10.60.0.0/16, the closest route',
      'R1 floods it out all interfaces except the incoming one',
      'R1 forwards it to 10.0.12.2, the next hop of the static route',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '10.61.0.1 is outside every prefix in the table (10.60.0.0/16 covers only 10.60.x.x), and the gateway of last resort is not set, so R1 **drops** the packet and may return an ICMP unreachable. Routers have no closest-route logic, never flood packets, and use a static route only for destinations inside its prefix.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Which statement describes CEF compared with process switching?',
    options: [
      'CEF precomputes the FIB and adjacency table to avoid per-packet CPU lookups',
      'CEF builds a route cache from the first packet sent to each destination',
      'CEF sends every packet to the CPU for a full routing-table lookup each time',
      'CEF must be enabled manually on each interface before a router can route',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'CEF prepares the **FIB** and **adjacency table** in advance from the RIB and ARP table, so each packet needs only a fast lookup. Building a cache from the first packet describes the older fast switching, sending every packet to the CPU is process switching, and CEF is enabled globally by default with `ip cef`.',
  },
  {
    id: 'e15',
    type: 'categorize',
    stem: 'Classify each task as part of building the routing table or forwarding a packet.',
    categories: ['Building the routing table (control plane)', 'Forwarding a packet (data plane)'],
    items: [
      { text: 'Comparing administrative distances', category: 0 },
      { text: 'Comparing the OSPF costs of two paths', category: 0 },
      { text: 'Exchanging updates with routing neighbors', category: 0 },
      { text: 'Longest-prefix-match lookup', category: 1 },
      { text: 'Decrementing the TTL', category: 1 },
      { text: 'Rewriting the Ethernet header', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'AD, metrics and routing updates all serve to build the table, which happens when the topology changes. The lookup, the TTL decrement and the frame rewrite happen for every packet in the data plane.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'A router has routes to 10.0.0.0/8, 10.4.0.0/14, 10.6.0.0/16 and 10.6.12.0/22. Which prefix length does it use for a packet destined to 10.6.15.9? (Answer in slash notation.)',
    answers: ['/22', '22', '255.255.252.0'],
    placeholder: '/nn',
    difficulty: 3,
    explanation:
      '10.6.12.0/22 has a block size of 4 in the third octet, covering 10.6.12.0 to **10.6.15.255**, so 10.6.15.9 matches it. It also matches 10.6.0.0/16, 10.4.0.0/14 (10.4.0.0 to 10.7.255.255) and 10.0.0.0/8, but **/22** is the longest match. The usual slips are ending the /22 at 10.6.14.255 or stopping at the /16.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. To which next hop does R3 forward a packet destined to 172.16.104.1?',
    exhibit: { kind: 'cli', text: R3_VIA },
    options: ['10.3.3.2', '10.4.4.2', '10.2.2.2', '192.0.2.1'],
    answer: 0,
    difficulty: 3,
    explanation:
      '172.16.104.1 is outside 172.16.100.0/22, which covers only 100 to 103 in the third octet. It is inside 172.16.96.0/19 (96 to 127), 172.16.64.0/18 (64 to 127) and 172.16.0.0/16, so the longest match is the **RIP /19** via **10.3.3.2**, even though RIP has the worst AD in the table. The static /22 does not match, the EIGRP /18 is shorter, and the default is only a last resort.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Refer to the exhibit. Which next-hop address does R3 use for a packet destined to 172.16.130.1?',
    exhibit: { kind: 'cli', text: R3_VIA },
    answers: ['10.1.1.2'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation:
      'In the third octet, 130 is above the /18 range (64 to 127), the /19 range (96 to 127) and the /22 range (100 to 103), so the only specific match is **172.16.0.0/16** via **10.1.1.2**. The default route would be used only for addresses outside 172.16.0.0/16.',
  },
  {
    id: 'e19',
    type: 'input',
    stem: 'Refer to the exhibit. PC1 sends a packet to Server1 with a TTL of 128. What TTL does the packet carry when Server1 receives it? (Enter the number.)',
    exhibit: { kind: 'diagram', diagram: PATH },
    answers: ['126'],
    placeholder: 'TTL',
    difficulty: 2,
    explanation:
      'Each router decrements the TTL by one: R1 changes 128 to 127 and R2 changes 127 to **126**. The end hosts do not decrement it in transit, so Server1 receives 126.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer adds `ip route 10.60.100.0 255.255.255.0 10.0.12.2` on R1. How are packets to 10.60.100.5 forwarded afterward?',
    exhibit: { kind: 'cli', text: R1_ECMP_TABLE },
    options: [
      'To 10.0.12.2, because the new static /24 replaces the OSPF /24',
      'To 10.0.13.2, because the OSPF /24 remains the longest match',
      'Shared between 10.0.12.2 and 10.0.13.2, because both /24 routes are installed',
      'To 10.0.13.2, because the OSPF route was learned first',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The static route has the **same prefix and length** as the OSPF route, so AD decides: static (1) beats OSPF (110). The OSPF /24 leaves the routing table, and 10.60.100.5 now uses the static /24 via **10.0.12.2**. Both routes are /24, so longest match cannot separate them; routes from different sources are never load-balanced together; and the order in which routes were learned does not matter.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'What does a router do with a received Ethernet frame that fails the FCS check?',
    options: [
      'Discards it',
      'Asks the sender to retransmit it',
      'Forwards it and lets the destination host decide',
      'Returns an ICMP parameter problem message',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'A frame with a bad **FCS** is corrupted, so the router **discards** it silently. Ethernet itself has no retransmission (recovery, if any, is left to upper layers such as TCP), the frame is never forwarded, and no ICMP message is generated for a Layer 2 error.',
  },
];
