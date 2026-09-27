import type { Lab } from '../labTypes';

const routerBase = (lan: string, seg: string, extra: string[] = []): string =>
  [
    'interface GigabitEthernet0/0/0',
    ' description Shared segment',
    ` ip address ${seg} 255.255.255.0`,
    ' no shutdown',
    'interface GigabitEthernet0/0/1',
    ' description LAN',
    ` ip address ${lan} 255.255.255.0`,
    ' no shutdown',
    ...extra,
  ].join('\n');

const lab: Lab = {
  id: 'lab-ospf-single-area',
  title: 'Single-Area OSPFv2 with DR/BDR Election',
  summary: 'Run OSPF area 0 on three routers sharing an Ethernet segment: router IDs, network statements vs interface mode, passive interfaces, DR/BDR priorities and a default route.',
  difficulty: 2,
  minutes: 45,
  lessons: ['ospf-config', 'ospf-network-types'],
  scenario:
    'Three routers share the **10.0.123.0/24** backbone segment through switch SW1: R1 (.1), R2 (.2) and R3 (.3). R1 serves LAN **192.168.1.0/24**, R3 serves LAN **192.168.3.0/24**, and R2 has a loopback (**172.16.2.1/24**) plus the Internet edge.\n' +
    'Replace static routing with **OSPF process 1, area 0**. Use predictable router IDs, keep hellos off the user LANs, control the DR/BDR election on the shared segment and let R2 advertise a default route.\n' +
    'The DR election is **non-preemptive**: the first eligible router on the segment becomes DR. If the result is not what you want, reset OSPF on the current DR/BDR with `clear ip ospf process`.',
  devices: [
    { id: 'SW1', model: 'c2960', x: 6, y: 1 },
    { id: 'R1', model: 'isr4321', x: 2, y: 3, config: routerBase('192.168.1.1', '10.0.123.1') },
    {
      id: 'R2',
      model: 'isr4321',
      x: 6,
      y: 4,
      config: routerBase('192.168.2.1', '10.0.123.2', ['interface Loopback0', ' ip address 172.16.2.1 255.255.255.0']),
    },
    { id: 'R3', model: 'isr4321', x: 10, y: 3, config: routerBase('192.168.3.1', '10.0.123.3') },
    { id: 'PC1', model: 'pc', x: 1, y: 6, host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
    { id: 'PC3', model: 'pc', x: 11, y: 6, host: { ip: '192.168.3.10', mask: '255.255.255.0', gateway: '192.168.3.1' } },
  ],
  links: [
    { a: 'R1:g0/0/0', b: 'SW1:fa0/1' },
    { a: 'R2:g0/0/0', b: 'SW1:fa0/2' },
    { a: 'R3:g0/0/0', b: 'SW1:fa0/3' },
    { a: 'R1:g0/0/1', b: 'PC1:fa0' },
    { a: 'R3:g0/0/1', b: 'PC3:fa0' },
  ],
  tasks: [
    {
      id: 'router-ids',
      title: 'Start OSPF process 1 on each router with router IDs **1.1.1.1**, **2.2.2.2** and **3.3.3.3**',
      details: 'Set `router-id` before any adjacency forms. Changing it later requires `clear ip ospf process`. Verify with `show ip protocols` or `show ip ospf`.',
      hint: '`router ospf 1` → `router-id 1.1.1.1`',
      checks: [
        { type: 'ospfRouterId', device: 'R1', rid: '1.1.1.1' },
        { type: 'ospfRouterId', device: 'R2', rid: '2.2.2.2' },
        { type: 'ospfRouterId', device: 'R3', rid: '3.3.3.3' },
      ],
    },
    {
      id: 'dr-priorities',
      title: 'Make R2 the DR and R3 the BDR, and prevent R1 from ever becoming DR or BDR',
      details: 'Set the OSPF priority on the segment interfaces (G0/0/0): **0** on R1 (never DR/BDR), **255** on R2 and **100** on R3. Priorities only matter when an election runs, so set them before enabling OSPF on the interface (or clear the OSPF process afterwards).',
      hint: '`interface g0/0/0` → `ip ospf priority 255`',
      checks: [
        { type: 'config', device: 'R1', section: 'interface GigabitEthernet0/0/0', pattern: '^ ip ospf priority 0$' },
        { type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', state: 'FULL', role: 'DR' },
        { type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', state: 'FULL', role: 'BDR' },
        { type: 'ospfNeighbor', device: 'R3', neighbor: '1.1.1.1', state: 'FULL', role: 'DROTHER' },
        { type: 'show', device: 'R1', command: 'show ip ospf interface GigabitEthernet0/0/0', pattern: 'State DROTHER, Priority 0' },
      ],
    },
    {
      id: 'enable-ospf',
      title: 'Enable OSPF area 0 on all router interfaces: network statements on R1 and R3, interface mode on R2',
      details: 'On R1 and R3 use `network` statements with wildcard masks. On R2 use `ip ospf 1 area 0` directly on G0/0/0 and Loopback0. All three adjacencies on the segment must reach FULL with the DR and BDR.',
      hint: 'R1: `network 10.0.123.0 0.0.0.255 area 0` and `network 192.168.1.0 0.0.0.255 area 0`. R2: `interface g0/0/0` → `ip ospf 1 area 0`.',
      checks: [
        { type: 'config', device: 'R1', section: 'router ospf 1', pattern: '^ network 10\\.0\\.123\\.0 0\\.0\\.0\\.255 area 0$' },
        { type: 'config', device: 'R2', section: 'interface GigabitEthernet0/0/0', pattern: '^ ip ospf 1 area 0$' },
        { type: 'ospfNeighbor', device: 'R2', neighbor: '1.1.1.1', state: 'FULL' },
        { type: 'ospfNeighbor', device: 'R2', neighbor: '3.3.3.3', state: 'FULL' },
        { type: 'ospfNeighbor', device: 'R3', neighbor: '2.2.2.2', state: 'FULL' },
      ],
    },
    {
      id: 'passive',
      title: 'Stop sending hellos on the user LANs (G0/0/1 of R1 and R3) while still advertising them',
      details: 'A passive interface keeps its network in OSPF but never forms neighbors. Verify with `show ip protocols` (Passive Interface(s)) and `show ip ospf interface g0/0/1`.',
      hint: '`router ospf 1` → `passive-interface GigabitEthernet0/0/1`',
      checks: [
        { type: 'config', device: 'R1', section: 'router ospf 1', pattern: '^ passive-interface GigabitEthernet0/0/1$' },
        { type: 'config', device: 'R3', section: 'router ospf 1', pattern: '^ passive-interface GigabitEthernet0/0/1$' },
        { type: 'show', device: 'R3', command: 'show ip protocols', pattern: 'Passive Interface\\(s\\):\\s*\\n\\s+GigabitEthernet0/0/1' },
      ],
    },
    {
      id: 'default-route',
      title: 'Have R2 advertise a default route into OSPF',
      details: 'R2 is the Internet edge. `default-information originate always` injects **0.0.0.0/0** as an external type 2 route (`O*E2`) even though R2 itself has no default route yet.',
      hint: '`router ospf 1` → `default-information originate always`',
      checks: [
        { type: 'route', device: 'R1', prefix: '0.0.0.0/0', source: 'O*E2', nextHop: '10.0.123.2' },
        { type: 'route', device: 'R3', prefix: '0.0.0.0/0', source: 'O*E2' },
      ],
    },
    {
      id: 'routes',
      title: 'Verify the OSPF routes and end-to-end connectivity',
      details: 'R1 must learn 192.168.3.0/24 from R3, and R2\'s loopback appears as a **/32 host route** (OSPF advertises loopbacks as hosts unless their network type is changed). Finally PC1 must reach PC3.',
      checks: [
        { type: 'route', device: 'R1', prefix: '192.168.3.0/24', source: 'O', nextHop: '10.0.123.3' },
        { type: 'route', device: 'R3', prefix: '192.168.1.0/24', source: 'O', nextHop: '10.0.123.1' },
        { type: 'route', device: 'R1', prefix: '172.16.2.1/32', source: 'O' },
        { type: 'ping', from: 'PC1', to: '192.168.3.10' },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/0/0',
      ' ip ospf priority 0',
      ' exit',
      'router ospf 1',
      ' router-id 1.1.1.1',
      ' network 10.0.123.0 0.0.0.255 area 0',
      ' network 192.168.1.0 0.0.0.255 area 0',
      ' passive-interface GigabitEthernet0/0/1',
      ' end',
    ].join('\n'),
    R2: [
      'enable',
      'configure terminal',
      'router ospf 1',
      ' router-id 2.2.2.2',
      ' default-information originate always',
      ' exit',
      'interface GigabitEthernet0/0/0',
      ' ip ospf priority 255',
      ' ip ospf 1 area 0',
      'interface Loopback0',
      ' ip ospf 1 area 0',
      ' end',
    ].join('\n'),
    R3: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/0/0',
      ' ip ospf priority 100',
      ' exit',
      'router ospf 1',
      ' router-id 3.3.3.3',
      ' network 10.0.123.0 0.0.0.255 area 0',
      ' network 192.168.3.0 0.0.0.255 area 0',
      ' passive-interface GigabitEthernet0/0/1',
      ' end',
    ].join('\n'),
  },
};

export default lab;
