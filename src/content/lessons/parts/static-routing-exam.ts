import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. Which command produced the static route shown in R1\'s routing table?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
S        10.2.2.0/24 is directly connected, GigabitEthernet0/0/1`,
    },
    options: [
      '`ip route 10.2.2.0 255.255.255.0 10.0.12.2`',
      '`ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1`',
      '`ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1 10.0.12.2`',
      '`ip route 10.2.2.0 0.0.0.255 GigabitEthernet0/0/1`',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Only a static route that names **just an exit interface** is displayed as "is directly connected" with no [AD/metric] brackets. A next-hop route would show `[1/0] via 10.0.12.2`, and a fully specified route would show `[1/0] via 10.0.12.2, GigabitEthernet0/0/1`. The last option uses a wildcard mask, which `ip route` does not accept.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. BR1 must send all traffic for unknown destinations to the ISP, and it should ARP only for the ISP router\'s address. Which command should the engineer configure on BR1?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 9,
        height: 3,
        nodes: [
          { id: 'lan', icon: 'switch', label: 'LAN', sub: '172.16.1.0/24', x: 1, y: 1.4 },
          { id: 'br', icon: 'router', label: 'BR1', sub: 'G0/0/1 203.0.113.2/30', x: 4.3, y: 1.4 },
          { id: 'isp', icon: 'internet', label: 'ISP', sub: '203.0.113.1', x: 7.8, y: 1.4 },
        ],
        links: [
          { from: 'lan', to: 'br', toLabel: 'G0/0/0' },
          { from: 'br', to: 'isp', fromLabel: 'G0/0/1', label: '203.0.113.0/30' },
        ],
      },
    },
    options: [
      '`ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0/1`',
      '`ip route 0.0.0.0 0.0.0.0 203.0.113.1`',
      '`ip default-gateway 203.0.113.1`',
      '`ip route 0.0.0.0 0.0.0.0 203.0.113.2`',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A default route with the ISP\'s address as **next hop** makes BR1 ARP only for 203.0.113.1. Naming only the Ethernet exit interface would make BR1 ARP for every Internet destination and rely on proxy ARP. `ip default-gateway` is used by devices that are not routing (such as an L2 switch) and does not create a route on a router with IP routing enabled. 203.0.113.2 is BR1\'s own address, which IOS rejects as a next hop.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. R1 learns 10.2.2.0/24 through OSPF over GigabitEthernet0/0/1. The static route was added as a backup over the serial link, but all traffic to 10.2.2.0/24 now uses the serial link even though the OSPF adjacency is up. What should the engineer do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip route
ip route 10.2.2.0 255.255.255.0 192.168.12.2 100
R1# show ip route | include 10.2.2.0
S        10.2.2.0/24 [100/0] via 192.168.12.2
R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:35    10.0.12.2       GigabitEthernet0/0/1`,
    },
    options: [
      'Reconfigure the static route with an AD greater than 110',
      'Reconfigure the static route with an AD lower than 100',
      'Lower the OSPF cost on GigabitEthernet0/0/1',
      'Configure the static route with exit interface Serial0/1/0 instead of a next hop',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The static route has AD **100**, which is lower (better) than OSPF\'s **110**, so it replaces the OSPF route for the same prefix. To float, its AD must be **above 110** (for example 130). Lowering the AD makes the problem worse. OSPF cost only compares OSPF routes with each other, never against a static route. Changing the route to an exit-interface form keeps AD 1 and still beats OSPF.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Which two conditions cause IOS to keep a configured static route out of the routing table? (Choose two.)',
    options: [
      'The exit interface named in the route goes down',
      'No route in the table covers the next-hop address',
      'The next-hop router does not have a route to the destination',
      'The route was configured with the default AD',
      'The next hop is reachable through a connected route',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A static route is installed only when it is usable: its **exit interface must be up** and its **next hop must be resolvable**. The local router cannot know whether the next-hop router has a route onward — that failure only shows up as dropped traffic. The default AD (1) is normal, and a next hop in a connected subnet is exactly what makes the route installable.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 (10.1.1.10) on R1\'s G0/0/0 LAN cannot ping Server1 (10.2.2.100) on R2\'s LAN. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
S        10.2.2.0/24 [1/0] via 10.0.12.2
R1# ping 10.2.2.100
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.2.2.100, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/1 ms
R1# ping 10.2.2.100 source 10.1.1.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.2.2.100, timeout is 2 seconds:
Packet sent with a source address of 10.1.1.1
.....
Success rate is 0 percent (0/5)`,
    },
    options: [
      'R1 has no route to 10.2.2.0/24',
      'R2 has no route to 10.1.1.0/24',
      'Server1 has an incorrect default gateway',
      'R1 GigabitEthernet0/0/0 is down',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The unsourced ping uses 10.0.12.1, a subnet R2 knows as connected, and succeeds — proving R1\'s route, R2\'s LAN and Server1\'s gateway all work (Server1 had to use its gateway to reply to 10.0.12.1). Sourcing from 10.1.1.1 fails, so the reply toward 10.1.1.0/24 is being dropped: **R2 lacks a return route**. R1 clearly has the static route, and G0/0/0 is up because its connected route is in the table.',
  },
  {
    id: 'e6',
    type: 'input',
    stem: 'Type the global configuration command that creates an IPv4 static default route with next hop 203.0.113.1.',
    answers: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'],
    placeholder: 'R1(config)# ...',
    difficulty: 1,
    explanation:
      'The default route uses prefix **0.0.0.0** and mask **0.0.0.0**: `ip route 0.0.0.0 0.0.0.0 203.0.113.1`. It appears as `S*` and sets the gateway of last resort. IOS does not accept `/0` notation in the IPv4 `ip route` command.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each command to the type of static route it creates.',
    pairs: [
      { left: '`ip route 10.2.2.100 255.255.255.255 10.0.12.2`', right: 'Host route' },
      { left: '`ip route 0.0.0.0 0.0.0.0 10.0.12.2`', right: 'Default route' },
      { left: '`ip route 10.2.2.0 255.255.255.0 192.168.12.2 130`', right: 'Floating static route' },
      { left: '`ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1 10.0.12.2`', right: 'Fully specified route' },
      { left: '`ip route 10.2.2.0 255.255.255.0 10.0.12.2`', right: 'Recursive network route' },
    ],
    difficulty: 2,
    explanation:
      'A /32 mask makes a **host route**; 0.0.0.0/0 is the **default route**; a trailing AD higher than the primary\'s makes a **floating** route; naming interface and next hop makes it **fully specified**; and a next hop alone to a subnet is a **recursive network route**.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. R1 receives a packet destined to 10.2.2.50. Which next hop does R1 use, and why?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route | begin Gateway
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.12.2
      10.0.0.0/8 is variably subnetted, 7 subnets, 4 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
S        10.2.0.0/16 [1/0] via 10.0.12.2
S        10.2.2.0/24 [5/0] via 192.168.12.2
S        10.2.2.100/32 [1/0] via 10.0.12.2
      192.168.12.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.12.0/30 is directly connected, Serial0/1/0
L        192.168.12.1/32 is directly connected, Serial0/1/0`,
    },
    options: [
      '10.0.12.2, because the 10.2.0.0/16 route has a lower AD than the /24 route',
      '192.168.12.2, because 10.2.2.0/24 is the longest prefix that matches',
      '10.0.12.2, because the host route 10.2.2.100/32 covers the destination',
      '10.0.12.2, because the gateway of last resort is preferred for remote subnets',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Longest prefix match comes first: 10.2.2.50 matches 0.0.0.0/0, 10.2.0.0/16 and 10.2.2.0/24, and the **/24** is the longest, so R1 uses **192.168.12.2**. AD is only compared between routes to the *same* prefix and length, so the /24\'s AD of 5 does not matter here. The /32 host route matches only 10.2.2.100, and the default route is used only when nothing more specific matches.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'An engineer configures `ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1` on R1. Which two statements are true? (Choose two.)',
    options: [
      'R1 sends an ARP request for each destination address in 10.2.2.0/24',
      'Forwarding depends on the neighboring router answering with proxy ARP',
      'The route is installed with an administrative distance of 0',
      'The route appears as `S 10.2.2.0/24 [1/0] via GigabitEthernet0/0/1`',
      'R1 performs a recursive lookup to find the next hop and exit interface',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'With only an Ethernet exit interface, R1 treats every destination as on-link, **ARPs for each one**, and succeeds only because the neighbor answers with **proxy ARP**. The AD is 1 (not 0); the display is "is directly connected, GigabitEthernet0/0/1" with no brackets; and no recursive lookup is needed because the interface is already known.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. R1 has `ip route 10.2.2.0 255.255.255.0 10.0.12.2` and `ip route 10.2.2.0 255.255.255.0 192.168.12.2 5`. The cable between SW1 and R2 fails, but R1 GigabitEthernet0/0/1 stays up/up. What happens to traffic from R1 to 10.2.2.0/24?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: '10.0.12.1', x: 1.2, y: 1.3 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 1.3 },
          { id: 'r2', icon: 'router', label: 'R2', sub: '10.0.12.2', x: 8.8, y: 1.3 },
        ],
        links: [
          { from: 'r1', to: 'sw', fromLabel: 'G0/0/1', label: 'up/up', tone: 'good' },
          { from: 'sw', to: 'r2', toLabel: 'G0/0/1', label: 'cable failed', tone: 'bad', style: 'dashed' },
          { from: 'r1', to: 'r2', fromLabel: 'S0/1/0', toLabel: 'S0/1/0', label: '192.168.12.0/30', style: 'serial' },
        ],
      },
    },
    options: [
      'The floating static route is installed and traffic uses the serial link',
      'The primary static route stays installed and traffic toward 10.0.12.2 is lost',
      'Both static routes are installed and traffic is load-balanced',
      'Both static routes are removed and R1 sends ICMP unreachables',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'R1\'s interface is still up, so the connected route 10.0.12.0/30 remains and the next hop 10.0.12.2 is still "resolvable". The primary static route therefore **stays installed**, and the AD 5 backup never floats in; packets are black-holed (ARP for 10.0.12.2 fails). A floating static only takes over when the primary **leaves the table**. The routes have different ADs, so they are never load-balanced. Detecting this kind of failure needs a routing protocol or object tracking.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'What is the default administrative distance of an IPv4 static route on a Cisco router?',
    options: ['0', '1', '90', '110'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Static routes default to AD **1**, beaten only by connected routes (0). 90 is internal EIGRP and 110 is OSPF. Even a static route that names only an exit interface uses AD 1, although it is displayed as directly connected.',
  },
  {
    id: 'e12',
    type: 'categorize',
    stem: 'R1 has up/up interfaces in 10.0.12.0/30 (G0/0/1) and 10.1.1.0/24 only; Serial0/1/0 is administratively down. R1 also learns 10.2.2.0/24 from OSPF. Classify each static route by whether IOS installs it.',
    categories: ['Installed', 'Not installed'],
    items: [
      { text: '`ip route 10.9.9.0 255.255.255.0 10.0.12.2`', category: 0 },
      { text: '`ip route 10.8.8.0 255.255.255.0 10.0.21.2`', category: 1 },
      { text: '`ip route 10.2.2.0 255.255.255.0 10.0.12.2 150`', category: 1 },
      { text: '`ip route 0.0.0.0 0.0.0.0 10.0.12.2`', category: 0 },
      { text: '`ip route 10.7.7.0 255.255.255.0 10.0.12.2 255`', category: 1 },
      { text: '`ip route 10.6.6.0 255.255.255.0 GigabitEthernet0/0/1`', category: 0 },
      { text: '`ip route 10.5.5.0 255.255.255.0 Serial0/1/0`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Routes whose next hop is in a connected subnet (10.0.12.2) or whose exit interface is up are **installed**. 10.0.21.2 is not covered by any route, so that route is not installed. The AD 150 route loses to OSPF (110) for the same prefix and floats. AD 255 is never used. A route out of an administratively down interface is not installed.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. Why is the static route to 10.2.2.0/24 missing from R1\'s routing table?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip route
ip route 10.2.2.0 255.255.255.0 10.0.21.2
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.0.12.1       YES manual up                    up
Serial0/1/0            unassigned      YES unset  administratively down down
Serial0/1/1            unassigned      YES unset  administratively down down
R1# show ip route 10.2.2.0
% Subnet not in table`,
    },
    options: [
      'The next hop 10.0.21.2 is not reachable through any route in R1\'s table',
      'The mask 255.255.255.0 is invalid for network 10.2.2.0',
      'A static route over Ethernet must include the exit interface',
      'A connected route with a lower AD already covers 10.2.2.0/24',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'R1\'s only subnets are 10.1.1.0/24 and 10.0.12.0/30, so the next hop **10.0.21.2** (a typo for 10.0.12.2) cannot be resolved and the route is not installed. The mask is valid for 10.2.2.0. Next-hop-only routes are legal on Ethernet — in fact preferred. No connected route covers 10.2.2.0/24, as the "% Subnet not in table" result confirms.',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'R1 forwards a packet to 10.2.2.100 using `ip route 10.2.2.0 255.255.255.0 10.0.12.2`. Put the steps in order.',
    items: [
      'Match the destination 10.2.2.100 to the static route 10.2.2.0/24',
      'Look up the next hop 10.0.12.2 and match the connected route 10.0.12.0/30',
      'Select GigabitEthernet0/0/1 as the exit interface',
      'Resolve the MAC address of 10.0.12.2 from the ARP cache or with an ARP request',
      'Encapsulate the packet in a frame addressed to R2\'s MAC and transmit it',
    ],
    difficulty: 2,
    explanation:
      'A next-hop route triggers a **recursive lookup**: first the destination matches the static route, then the next hop is looked up to find the connected route and exit interface, then the next hop\'s MAC is resolved, and finally the frame is built with R2\'s MAC as the destination.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'R1 learns 10.2.2.0/24 through OSPF. Which two commands create a static route to 10.2.2.0/24 via 192.168.12.2 that is used only if the OSPF route disappears? (Choose two.)',
    options: [
      '`ip route 10.2.2.0 255.255.255.0 192.168.12.2 120`',
      '`ip route 10.2.2.0 255.255.255.0 192.168.12.2 100`',
      '`ip route 10.2.2.0 255.255.255.0 192.168.12.2 250`',
      '`ip route 10.2.2.0 255.255.255.0 192.168.12.2 255`',
      '`ip route 10.2.2.0 255.255.255.0 192.168.12.2`',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A floating static must have an AD **above 110** but below 255: **120** and **250** both qualify. AD 100 and the default AD 1 are better than OSPF and would replace the OSPF route immediately. AD 255 marks the route as unusable, so it would never be installed, even after OSPF fails.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'In the output of `show ip route`, what does the code `S*` identify?',
    options: [
      'A static route that is the candidate default route',
      'A static route learned from a neighboring router',
      'A floating static route that is not currently in use',
      'A static route that points to a summary address',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '**S** means static and the **asterisk** marks the candidate default, normally 0.0.0.0/0. Static routes are never learned from neighbors; floating statics that are not in use do not appear in the table at all; and summaries have no special asterisk code.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. Users on 10.1.1.0/24 cannot reach 10.2.2.100. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> tracert -d 10.2.2.100

Tracing route to 10.2.2.100 over a maximum of 30 hops

  1     1 ms     1 ms     1 ms  10.1.1.1
  2     1 ms     1 ms     1 ms  10.0.12.2
  3     2 ms     1 ms     1 ms  10.0.12.1
  4     2 ms     2 ms     1 ms  10.0.12.2

R2# show ip route | begin Gateway
Gateway of last resort is 10.0.12.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.12.1
      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/1
L        10.0.12.2/32 is directly connected, GigabitEthernet0/0/1
S        10.1.1.0/24 [1/0] via 10.0.12.1`,
    },
    options: [
      'R2 has no route to 10.2.2.0/24, so its default route sends traffic back to R1',
      'R1 has no route to 10.2.2.0/24, so it cannot forward the traffic to R2',
      'R2 has no return route to 10.1.1.0/24, so replies cannot reach the PC',
      'Server1 has an incorrect default gateway and cannot reply to the PC',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The trace alternates between R2 (10.0.12.2) and R1 (10.0.12.1): a **routing loop**. R2\'s table has no 10.2.2.0/24 entry — its LAN interface is down or unconfigured — so R2 uses its **default route back to R1**, and R1 sends the packet to R2 again. R1 clearly has a route (hop 2 is R2), R2 does have `S 10.1.1.0/24`, and the packets never reach Server1, so its gateway is not the issue.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'What subnet mask must be used in an IPv4 static host route?',
    answers: ['255.255.255.255', '/32'],
    placeholder: 'mask',
    difficulty: 1,
    explanation:
      'A host route matches a single address, so all 32 bits are network bits: **255.255.255.255** (/32). Because it is the longest possible prefix, it overrides any broader route covering the same host.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes this route?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route 10.2.2.0
Routing entry for 10.2.2.0/24
  Known via "static", distance 1, metric 0 (connected)
  Routing Descriptor Blocks:
  * directly connected, via GigabitEthernet0/0/1
      Route metric is 0, traffic share count is 1`,
    },
    options: [
      'It is a static route configured with only an exit interface',
      'It is a connected route created by the IP address on GigabitEthernet0/0/1',
      'It is a fully specified static route with a next hop',
      'It is a floating static route with an AD of 0',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '"Known via static" with "directly connected, via GigabitEthernet0/0/1" and no next-hop address is the signature of an **exit-interface-only** static route. A connected route would say "Known via connected" with distance 0; a fully specified route would list a next-hop IP; and the distance shown is 1, not 0.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'R1 is configured with `ip route 10.2.2.0 255.255.255.128 10.0.12.2` and has no other route toward R2\'s LAN 10.2.2.0/24 and no default route. R2 routes correctly back to R1. Which two hosts can PC1 on R1\'s LAN NOT reach? (Choose two.)',
    options: ['10.2.2.10', '10.2.2.100', '10.2.2.126', '10.2.2.129', '10.2.2.254'],
    answers: [3, 4],
    difficulty: 3,
    explanation:
      'Mask 255.255.255.128 (/25) makes the route cover only **10.2.2.0–10.2.2.127**. Hosts .10, .100 and .126 match it; **10.2.2.129** and **10.2.2.254** fall in the upper half, match no route and are dropped by R1. The fix is mask 255.255.255.0. Partial reachability like this is a classic sign of a wrong mask.',
  },
];
