import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'multi',
    stem: 'Refer to the exhibit. On which two interfaces is OSPF enabled? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief | exclude unassigned
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   172.16.1.1      YES manual up                    up
GigabitEthernet0/0/1   172.16.2.65     YES manual up                    up
GigabitEthernet0/0/2   172.16.4.1      YES manual up                    up
GigabitEthernet0/0/3   10.10.10.1      YES manual up                    up
R1# show running-config | section router ospf
router ospf 1
 network 172.16.0.0 0.0.3.255 area 0
 network 10.10.10.0 0.0.0.0 area 0`,
    },
    options: ['GigabitEthernet0/0/0', 'GigabitEthernet0/0/1', 'GigabitEthernet0/0/2', 'GigabitEthernet0/0/3'],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'The wildcard 0.0.3.255 lets the third octet vary from 0 to 3, so 172.16.1.1 (G0/0/0) and 172.16.2.65 (G0/0/1) match, while 172.16.4.1 (third octet 4) does not. The second statement has a 0.0.0.0 wildcard, so it matches only an interface whose address is exactly 10.10.10.0 — G0/0/3 is 10.10.10.1 and stays disabled. `network 10.10.10.1 0.0.0.0 area 0` or `network 10.10.10.0 0.0.0.255 area 0` would include it.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'An interface on R5 is configured with 192.168.10.65/27. Which network statement enables OSPF on this interface without matching any address outside 192.168.10.64/27?',
    options: [
      '`network 192.168.10.64 0.0.0.31 area 0`',
      '`network 192.168.10.64 255.255.255.224 area 0`',
      '`network 192.168.10.0 0.0.0.255 area 0`',
      '`network 192.168.10.96 0.0.0.31 area 0`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A /27 mask is 255.255.255.224, so the wildcard is **0.0.0.31**, and 192.168.10.64 0.0.0.31 covers .64 to .95, which contains .65. The version written with 255.255.255.224 puts a subnet mask where OSPF expects a wildcard, `192.168.10.0 0.0.0.255` matches the whole /24 and could enable other interfaces, and `192.168.10.96 0.0.0.31` covers .96 to .127, which does not include .65.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. R1 has no OSPF neighbor on G0/0/1, although R3 at the other end of the link is configured correctly. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               1.1.1.1/32         1     LOOP  0/0
Gi0/0/1      1     0               10.0.13.1/30       1     DR    0/0
Gi0/0/0      1     0               10.0.12.1/30       1     BDR   1/1
R1# show ip ospf interface GigabitEthernet0/0/1 | include Hellos
    No Hellos (Passive interface)`,
    },
    options: [
      'G0/0/1 is configured as a passive interface',
      'G0/0/1 is in the wrong OSPF area',
      'R1 is the DR on G0/0/1, and a DR does not form adjacencies',
      'OSPF is not enabled on G0/0/1',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '"No Hellos (Passive interface)" shows that G0/0/1 is passive, so R1 never sends Hellos and R3 can never list R1 as a neighbor. The interface appears in the brief output, so OSPF *is* enabled on it, in area 0 like G0/0/0. R1 shows DR only because it is alone on the segment — a DR forms adjacencies with every router on its segment. The fix is `no passive-interface GigabitEthernet0/0/1`.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Which statement about the OSPF process ID is true?',
    options: [
      'It is locally significant and need not match between neighbors',
      'It must be identical on all routers that belong to the same area',
      'It identifies the OSPF area that the router interfaces belong to',
      'It is carried in Hello packets and must match between neighbors',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The process ID only names the OSPF instance inside one router and is never sent in packets, so neighbors may use different values. The **area ID** is what identifies the area and must match on a link.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R4# show ip route ospf
Gateway of last resort is 10.1.45.2 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 10.1.45.2, 00:08:15, GigabitEthernet0/0/1
      10.0.0.0/8 is variably subnetted, 7 subnets, 3 masks
O        10.1.5.0/24 [110/20] via 10.1.45.2, 00:08:15, GigabitEthernet0/0/1
O        10.1.6.0/24 [110/20] via 10.1.46.2, 00:08:15, GigabitEthernet0/0/2
O        10.1.56.0/30 [110/20] via 10.1.46.2, 00:08:15, GigabitEthernet0/0/2
                      [110/20] via 10.1.45.2, 00:08:15, GigabitEthernet0/0/1`,
    },
    options: [
      'R4 load-balances traffic to 10.1.56.0/30 over two paths',
      'The default route is an external type 2 route injected by an ASBR',
      'The default route has an administrative distance of 1',
      'Every OSPF route is reachable through both GigabitEthernet0/0/1 and GigabitEthernet0/0/2',
      'The OSPF metric to 10.1.5.0/24 is 110',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      '10.1.56.0/30 has two next hops with the same metric (20), so R4 load-balances. **O*E2** marks an external type 2 candidate default, which only an ASBR can originate, for example with `default-information originate`. In [110/1] the 110 is the AD, not 1, and for 10.1.5.0/24 the metric is 20 — 110 is its AD. Only 10.1.56.0/30 has two paths.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'R1 is configured with `default-information originate` under OSPF, but no other router learns a default route. R1 has no static default route and learns none from any protocol. Which change fixes the problem?',
    options: [
      'Add a default route on R1, or use `default-information originate always`',
      'Add `network 0.0.0.0 255.255.255.255 area 0` under the OSPF process on R1',
      'Configure `passive-interface default` under the OSPF process on R1',
      'Configure `maximum-paths 1` under the OSPF process on every router',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Without `always`, the command advertises a default only while R1 itself has one in its routing table. The all-zeros network statement just enables OSPF on every interface — it never creates a default route. Passive interfaces would break adjacencies, and `maximum-paths` only limits ECMP.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Each link connects only two routers. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           1   FULL/DR         00:00:37    10.0.23.2       GigabitEthernet0/0/2
1.1.1.1           1   FULL/BDR        00:00:33    10.0.12.1       GigabitEthernet0/0/0`,
    },
    options: [
      'R2 is the DR on the link connected to GigabitEthernet0/0/0',
      'R3 is the BDR on the link connected to GigabitEthernet0/0/2',
      '1.1.1.1 is the next-hop IP address R2 uses toward R1',
      'The adjacency with 3.3.3.3 is still being built',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The role after the slash belongs to the **neighbor**. R1 (1.1.1.1) is the BDR on the G0/0/0 link, and with only two routers there, R2 must be the DR. On G0/0/2 the neighbor 3.3.3.3 is the DR, not the BDR. 1.1.1.1 is R1\'s router ID — the next-hop address is 10.0.12.1 from the Address column. FULL means both adjacencies are complete.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. All interfaces are GigabitEthernet with the default bandwidth, and no `ip ospf cost` commands are configured. What explains the different costs?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/1      1     0               10.0.13.1/30       10    BDR   1/1
Gi0/0/0      1     0               10.0.12.1/30       10    BDR   1/1

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0/2      1     0               10.0.23.1/30       1     BDR   1/1
Gi0/0/0      1     0               10.0.12.2/30       1     DR    1/1`,
    },
    options: [
      'R1 uses `auto-cost reference-bandwidth 10000`, while R2 uses the default',
      'R2 is the DR on Gi0/0/0, so it always advertises cost 1 on each of its links',
      'R1 and R2 are configured with different OSPF process IDs in area 0',
      'R1 is configured with `maximum-paths 10` under the OSPF process',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'With default bandwidth, a Gigabit interface costs 100 ÷ 1000 → 1 with the default reference, and 10 000 ÷ 1000 = 10 with a 10 000 Mbps reference. R1 therefore has the raised reference and R2 does not — a mismatch that skews path selection until the same `auto-cost` value is configured everywhere. DR status has no effect on cost, both outputs show PID 1, and `maximum-paths` controls ECMP, not cost.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'A router has twelve OSPF-enabled interfaces, but OSPF neighbors exist only on G0/0/0 and G0/0/1. All twelve subnets must remain advertised. Which configuration achieves this most efficiently?',
    options: [
      '`passive-interface default`, then `no passive-interface` for G0/0/0 and G0/0/1',
      '`passive-interface` on G0/0/0 and G0/0/1, leaving the other ten active',
      'Remove from OSPF the network statements that cover the ten host-facing interfaces',
      'Shut down the ten host-facing interfaces that have no OSPF neighbors',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`passive-interface default` silences Hellos on all twelve interfaces with one command, and two exceptions re-enable the router links, while every subnet stays advertised. Making G0/0/0 and G0/0/1 passive does the opposite and breaks the only adjacencies. Removing network statements or shutting interfaces would stop advertising those subnets.',
  },
  {
    id: 'e10',
    type: 'order',
    stem: 'Following best practice, put the commands in order to start OSPF on R1 with router ID 1.1.1.1, enable G0/0/0 (10.0.12.1/30) in area 0 with a network statement, and verify.',
    items: [
      '`configure terminal`',
      '`router ospf 1`',
      '`router-id 1.1.1.1`',
      '`network 10.0.12.0 0.0.0.3 area 0`',
      '`end`',
      '`show ip ospf interface brief`',
    ],
    difficulty: 2,
    explanation:
      'Enter global configuration, start the process, set the router ID **before** enabling interfaces (so no `clear ip ospf process` is needed), enable the interface with the network statement, leave configuration mode, then verify.',
  },
  {
    id: 'e11',
    type: 'categorize',
    stem: 'Classify each command by the configuration mode in which it is entered.',
    categories: ['Router configuration (router ospf)', 'Interface configuration'],
    items: [
      { text: '`network 10.0.12.0 0.0.0.3 area 0`', category: 0 },
      { text: '`ip ospf 1 area 0`', category: 1 },
      { text: '`passive-interface default`', category: 0 },
      { text: '`ip ospf cost 50`', category: 1 },
      { text: '`default-information originate`', category: 0 },
      { text: '`bandwidth 10000`', category: 1 },
      { text: '`maximum-paths 2`', category: 0 },
      { text: '`auto-cost reference-bandwidth 10000`', category: 0 },
    ],
    difficulty: 1,
    explanation:
      'Process-wide commands — network statements, passive-interface, default-information originate, maximum-paths and auto-cost — live under `router ospf`. Commands that describe a single interface — `ip ospf … area`, `ip ospf cost` and `bandwidth` — are entered in interface mode.',
  },
  {
    id: 'e12',
    type: 'input',
    stem: 'Which wildcard mask lets a single network statement match every interface address in 172.16.8.0/21?',
    answers: ['0.0.7.255'],
    placeholder: 'x.x.x.x',
    difficulty: 2,
    explanation:
      'A /21 mask is 255.255.248.0. Subtracting it from 255.255.255.255 gives **0.0.7.255**, which covers 172.16.8.0 through 172.16.15.255.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'Enter the interface configuration command that enables OSPF process 5 on the current interface in area 0.',
    answers: ['ip ospf 5 area 0', 'ip ospf 5 area 0.0.0.0'],
    placeholder: 'command',
    difficulty: 1,
    explanation: '`ip ospf 5 area 0` — the process ID first, then the area. The area may also be written in dotted-decimal form, 0.0.0.0.',
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'Refer to the exhibit. Every router uses `auto-cost reference-bandwidth 10000`. R3\'s G0/0/1 is configured with `bandwidth 100000`; every other interface uses its default bandwidth. What OSPF metric does R2 show for 192.168.3.0/24?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'r2', icon: 'router', label: 'R2', x: 1.5, y: 1.5 },
          { id: 'r3', icon: 'router', label: 'R3', x: 5, y: 1.5 },
          { id: 'lan', icon: 'switch', label: 'LAN', sub: '192.168.3.0/24', x: 8.3, y: 1.5 },
        ],
        links: [
          { from: 'r2', to: 'r3', fromLabel: 'G0/0/2', toLabel: 'G0/0/2', label: '1 Gbps' },
          { from: 'r3', to: 'lan', fromLabel: 'G0/0/1', label: 'bandwidth 100000' },
        ],
      },
    },
    answers: ['110'],
    placeholder: 'metric',
    difficulty: 3,
    explanation:
      'R2\'s Gigabit exit costs 10 000 ÷ 1000 = 10. R3\'s LAN interface is set to 100 000 kbps = 100 Mbps, so it costs 10 000 ÷ 100 = 100. The metric is 10 + 100 = **110**, and the route shows [110/110] — AD and metric happen to be equal. Forgetting the destination interface gives 10, and ignoring the `bandwidth` command gives 20.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Refer to the exhibit. R3\'s G0/0/1 is 192.168.3.1/24. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R3# show ip protocols
*** IP Routing is NSF aware ***

Routing Protocol is "ospf 10"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 3.3.3.3
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 2
  Routing for Networks:
    10.0.0.0 0.0.255.255 area 0
    192.168.3.0 0.0.0.255 area 0
  Passive Interface(s):
    GigabitEthernet0/0/1
  Routing Information Sources:
    Gateway         Distance      Last Update
    1.1.1.1              110      00:03:12
    2.2.2.2              110      00:03:12
  Distance: (default is 110)`,
    },
    options: [
      'R3 installs at most two equal-cost OSPF paths per destination',
      'R3 cannot become adjacent with neighbors that run OSPF process 1',
      'No OSPF neighbor can form on GigabitEthernet0/0/1',
      'The 192.168.3.0/24 subnet is not advertised to other routers',
      'R3 advertises a summary route for 10.0.0.0/16',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '*Maximum path: 2* limits ECMP to two routes, and G0/0/1 is listed under *Passive Interface(s)*, so it sends no Hellos and forms no neighbors. Process ID 10 is local only — the route sources 1.1.1.1 and 2.2.2.2 prove adjacencies exist. The passive LAN is still advertised because 192.168.3.1 matches the 192.168.3.0 0.0.0.255 statement, and a network statement never creates a summary route.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Which command displays the router, network and external LSAs that a router holds?',
    options: ['`show ip ospf database`', '`show ip ospf neighbor`', '`show ip route ospf`', '`show ip ospf interface brief`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The LSDB is displayed with `show ip ospf database`. The other commands show neighbors, installed routes and per-interface status respectively.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'R1 advertises a default route with `default-information originate` and default settings. Every link in the area costs 10. What metric does a router three hops away from R1 show for 0.0.0.0/0?',
    options: ['1', '3', '31', '110'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The default is an **E2** route, and E2 metrics do not grow with distance, so every router shows [110/1]. 31 would be an E1 result (30 of internal cost plus 1), 3 counts hops, which OSPF does not use, and 110 is the administrative distance.',
  },
  {
    id: 'e18',
    type: 'match',
    stem: 'Match each piece of output to the command that displays it.',
    pairs: [
      { left: '"Attached via Interface Enable"', right: '`show ip ospf interface`' },
      { left: '"Routing for Networks:"', right: '`show ip protocols`' },
      { left: '"FULL/BDR"', right: '`show ip ospf neighbor`' },
      { left: '"O*E2 0.0.0.0/0 [110/1]"', right: '`show ip route ospf`' },
      { left: '"Net Link States (Area 0)"', right: '`show ip ospf database`' },
    ],
    difficulty: 2,
    explanation:
      'Per-interface details, including how OSPF was enabled, come from `show ip ospf interface`; the network statement list from `show ip protocols`; neighbor states from `show ip ospf neighbor`; installed routes from `show ip route ospf`; and LSA sections from `show ip ospf database`.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. R1 G0/0/0 (10.0.12.1/30) and R2 G0/0/0 (10.0.12.2/30) are connected, but the routers do not become OSPF neighbors. Which change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section router ospf
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0

R2# show running-config | section router ospf
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.3 area 1
 network 192.168.2.0 0.0.0.255 area 0`,
    },
    options: [
      'On R2, change the 10.0.12.0 network statement to area 0',
      'On R2, change the OSPF process ID to 2',
      'On R1, change the wildcard in the 10.0.12.0 statement to 0.0.0.255',
      'On R1, add `passive-interface GigabitEthernet0/0/0`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 places the link in area 0 and R2 places it in area 1. The area ID travels in every Hello and must match, so each router rejects the other\'s Hellos. Process IDs are locally significant, a wider wildcard on R1 still puts the link in area 0 and changes nothing, and a passive link would stop Hellos altogether.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. R1 has two equal-cost paths to 10.0.23.0/30, one via R2 and one via R3, but only one is installed. What is the reason?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip protocols | include Maximum
  Maximum path: 1
R1# show ip route ospf | begin 10.0.0.0
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/20] via 10.0.12.2, 00:04:51, GigabitEthernet0/0/0
O     192.168.2.0/24 [110/20] via 10.0.12.2, 00:04:51, GigabitEthernet0/0/0
O     192.168.3.0/24 [110/20] via 10.0.13.2, 00:04:51, GigabitEthernet0/0/1`,
    },
    options: [
      'The OSPF process on R1 is configured with `maximum-paths 1`',
      'OSPF cannot load-balance; only EIGRP can',
      'R1\'s link to R3 is passive, so the second path is ignored',
      'Only one path can be installed because both paths cost 20',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '*Maximum path: 1* tells OSPF to install a single route per destination, so the second equal-cost path is dropped. OSPF load-balances across up to four equal-cost paths by default. R3 is clearly an active neighbor — 192.168.3.0/24 is learned via 10.0.13.2 — and equal cost is exactly what ECMP requires, not a reason to drop a path.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements about `default-information originate` are true? (Choose two.)',
    options: [
      'It makes the router an ASBR',
      'Without the `always` keyword, the router must have a default route in its routing table',
      'It advertises the default route as an intra-area (O) route',
      'It must be configured on every router that needs the default route',
      'It advertises the default route with an administrative distance of 1',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The command floods a Type 5 external LSA, so the router becomes an **ASBR**, and by default it advertises only while it has a default route of its own. Receivers see an external O*E2 route, not an intra-area O route; only the edge router needs the command; and receiving routers use OSPF\'s AD of 110 for it.',
  },
];

export default exam;
