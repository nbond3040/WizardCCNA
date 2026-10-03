import type { Lab } from '../labTypes';

/** Router interface block: description, address, no shutdown. */
const iface = (name: string, desc: string, ip: string, mask = '255.255.255.0'): string[] => [
  `interface ${name}`,
  ` description ${desc}`,
  ` ip address ${ip} ${mask}`,
  ' no shutdown',
];

const lab: Lab = {
  id: 'lab-troubleshoot-routing',
  title: 'Troubleshooting Static and OSPF Routing',
  summary:
    'Follow packets across three routers and repair four routing faults: a wrong next hop, a missing return route, an OSPF passive-interface mistake and a floating static whose administrative distance beats OSPF.',
  difficulty: 3,
  minutes: 45,
  lessons: ['routing-table', 'static-routing', 'forwarding-decision', 'troubleshooting-methodology'],
  scenario:
    'Contoso\'s WAN has three routers. **R1** serves HQ (LAN 192.168.1.0/24), **R3** serves the Branch (LAN 192.168.3.0/24) and **R2** is the carrier-edge router that hosts the shared-services network **172.16.2.0/24** (server SRV1, 172.16.2.10). R1 and R3 are joined by a direct leased line (10.0.13.0/24) that runs **OSPF area 0** and is the primary HQ-to-Branch path. R2 sits on 10.0.12.0/24 (to R1) and 10.0.23.0/24 (to R3) and does not run OSPF.\n\n' +
    'By design the shared-services network is reached with static routes, and the paths through R2 are **floating static backups** (administrative distance 200) that must only carry HQ-to-Branch traffic if the direct line fails. Since last night\'s change window the Branch cannot use the shared services, HQ and Branch cannot talk reliably, and monitoring shows HQ-to-Branch traffic crossing the carrier instead of the leased line.\n\n' +
    'Work from the symptoms with `ping` and `traceroute` (from the PCs and from the routers), `show ip route`, `show ip ospf neighbor` and `show ip protocols`. Find each fault on the router that really owns it, fix it, and finish by confirming that the primary and the backup paths behave as designed.',
  devices: [
    {
      id: 'R1',
      model: 'isr2911',
      x: 2.5,
      y: 4.2,
      config: [
        ...iface('GigabitEthernet0/0', 'To R2 carrier edge', '10.0.12.1'),
        ...iface('GigabitEthernet0/1', 'HQ LAN', '192.168.1.1'),
        ...iface('GigabitEthernet0/2', 'Direct line to R3 (primary)', '10.0.13.1'),
        'router ospf 1',
        ' router-id 1.1.1.1',
        ' network 10.0.13.0 0.0.0.255 area 0',
        ' network 192.168.1.0 0.0.0.255 area 0',
        ' passive-interface GigabitEthernet0/1',
        'ip route 172.16.2.0 255.255.255.0 10.0.12.2',
        'ip route 192.168.3.0 255.255.255.0 10.0.12.2 100',
      ].join('\n'),
    },
    {
      id: 'R2',
      model: 'isr2911',
      x: 6.5,
      y: 2.2,
      config: [
        ...iface('GigabitEthernet0/0', 'To R1', '10.0.12.2'),
        ...iface('GigabitEthernet0/1', 'To R3', '10.0.23.2'),
        ...iface('GigabitEthernet0/2', 'Shared services LAN', '172.16.2.1'),
        'ip route 192.168.1.0 255.255.255.0 10.0.12.1',
      ].join('\n'),
    },
    {
      id: 'R3',
      model: 'isr2911',
      x: 10.5,
      y: 4.2,
      config: [
        ...iface('GigabitEthernet0/0', 'To R2 carrier edge', '10.0.23.3'),
        ...iface('GigabitEthernet0/1', 'Branch LAN', '192.168.3.1'),
        ...iface('GigabitEthernet0/2', 'Direct line to R1 (primary)', '10.0.13.3'),
        'router ospf 1',
        ' router-id 3.3.3.3',
        ' network 10.0.13.0 0.0.0.255 area 0',
        ' network 192.168.3.0 0.0.0.255 area 0',
        ' passive-interface GigabitEthernet0/2',
        'ip route 172.16.2.0 255.255.255.0 10.0.23.20',
        'ip route 192.168.1.0 255.255.255.0 10.0.23.2 200',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 2.5, y: 6.5, host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
    { id: 'PC3', model: 'pc', x: 10.5, y: 6.5, host: { ip: '192.168.3.10', mask: '255.255.255.0', gateway: '192.168.3.1' } },
    { id: 'SRV1', model: 'server', x: 6.5, y: 0.4, host: { ip: '172.16.2.10', mask: '255.255.255.0', gateway: '172.16.2.1' }, services: { http: true } },
  ],
  links: [
    { a: 'R1:g0/0', b: 'R2:g0/0' },
    { a: 'R2:g0/1', b: 'R3:g0/0' },
    { a: 'R1:g0/2', b: 'R3:g0/2' },
    { a: 'R1:g0/1', b: 'PC1:fa0' },
    { a: 'R3:g0/1', b: 'PC3:fa0' },
    { a: 'R2:g0/2', b: 'SRV1:fa0' },
  ],
  tasks: [
    {
      id: 'branch-services',
      title: 'Restore the Branch\'s path to the shared services: R3 must reach **172.16.2.0/24** through R2 (**10.0.23.2**)',
      details: 'From R3, `ping 172.16.2.10` fails and `traceroute` dies at the first hop. Read `show ip route 172.16.2.0` on R3 and compare the next hop with the address R2 really owns on the 10.0.23.0/24 link (`show ip interface brief` on R2). A static route is only as good as its next hop.',
      hint: '`show ip route static` on R3, then `no ip route …` for the bad entry and add the right one.',
      checks: [
        { type: 'route', device: 'R3', prefix: '172.16.2.0/24', source: 'S', nextHop: '10.0.23.2' },
        { type: 'ping', from: 'R3', to: '172.16.2.10' },
      ],
    },
    {
      id: 'return-route',
      title: 'Give R2 the missing return route to the Branch LAN: **192.168.3.0/24** via R3 (**10.0.23.3**)',
      details: 'Even with the Branch route repaired, PC3 cannot ping SRV1, and a ping from PC3 to PC1 reaches PC1 but is never answered: the packets arrive, the replies cannot get back. Check the routing table of every router on the reply path and find the one with no entry for 192.168.3.0/24. A router-sourced ping uses the exit interface address as its source, so it can succeed where a PC ping fails.',
      hint: '`show ip route 192.168.3.0` on each router along the reply path.',
      checks: [
        { type: 'route', device: 'R2', prefix: '192.168.3.0/24', source: 'S', nextHop: '10.0.23.3' },
        { type: 'ping', from: 'R2', to: '192.168.3.10' },
      ],
    },
    {
      id: 'ospf-adjacency',
      title: 'Bring up the OSPF adjacency between R1 and R3 on **10.0.13.0/24**, leaving only the Branch LAN interface passive on R3',
      details: '`show ip ospf neighbor` is empty on both routers. A passive interface sends no hellos, so run `show ip protocols` on each router and read the *Passive Interface(s)* list: the user LAN (G0/1) should be passive, the leased line to R1 must not be.',
      hint: '`show ip protocols` on R3, then `no passive-interface …` and `passive-interface …` under `router ospf 1`.',
      checks: [
        { type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', state: 'FULL' },
        { type: 'ospfNeighbor', device: 'R3', neighbor: '1.1.1.1', state: 'FULL' },
        { type: 'config', device: 'R3', section: 'router ospf 1', pattern: '^ passive-interface GigabitEthernet0/1$' },
        { type: 'config', device: 'R3', section: 'router ospf 1', pattern: '^ passive-interface GigabitEthernet0/2$', expect: false },
      ],
    },
    {
      id: 'floating-static',
      title: 'Make the backup route on R1 a true floating static: administrative distance **200**, so OSPF (**110**) wins',
      details: 'With the adjacency up, R1 still prefers `S 192.168.3.0/24 [100/0] via 10.0.12.2`: the lowest administrative distance wins, and 100 beats OSPF\'s 110. A floating static must be *higher* than the primary protocol. Fix the distance but keep the backup route in the configuration. R3\'s mirror-image backup for 192.168.1.0/24 should already be right: verify that OSPF wins there too.',
      hint: '`show ip route 192.168.3.0` on R1. To change a distance, remove the old static route and enter it again.',
      checks: [
        { type: 'route', device: 'R1', prefix: '192.168.3.0/24', source: 'O', nextHop: '10.0.13.3' },
        { type: 'route', device: 'R3', prefix: '192.168.1.0/24', source: 'O', nextHop: '10.0.13.1' },
        { type: 'config', device: 'R1', pattern: '^ip route 192\\.168\\.3\\.0 255\\.255\\.255\\.0 10\\.0\\.12\\.2 200$' },
        { type: 'config', device: 'R1', pattern: '^ip route 192\\.168\\.3\\.0 255\\.255\\.255\\.0 10\\.0\\.12\\.2 100$', expect: false },
      ],
    },
    {
      id: 'verify',
      title: 'Verify the design end to end: HQ and Branch talk over the leased line, and both sites reach the shared services',
      details: 'Ping between PC1, PC3 and SRV1, then run `traceroute 192.168.3.10` on R1: it must take a single hop over the leased line (10.0.13.3), not two hops through the carrier. Optional failover test: shut R1 G0/2, confirm that pings still work through R2, then `no shutdown` it again before you finish.',
      hint: 'If a ping fails in one direction only, check the routing table on every hop of the other direction.',
      checks: [
        { type: 'ping', from: 'PC1', to: '192.168.3.10' },
        { type: 'ping', from: 'PC3', to: '192.168.1.10' },
        { type: 'ping', from: 'PC3', to: '172.16.2.10' },
        { type: 'ping', from: 'PC1', to: '172.16.2.10' },
        { type: 'ping', from: 'SRV1', to: '192.168.3.10' },
        { type: 'show', device: 'R1', command: 'traceroute 192.168.3.10', pattern: '^\\s*1\\s+10\\.0\\.13\\.3\\b' },
        { type: 'show', device: 'R3', command: 'traceroute 192.168.1.10', pattern: '^\\s*1\\s+10\\.0\\.13\\.1\\b' },
        { type: 'interface', device: 'R1', iface: 'Gi0/2', status: 'up' },
      ],
    },
    {
      id: 'save',
      title: 'Save the configuration on **R1**, **R2** and **R3**',
      details: 'Routing fixes that exist only in the running-config vanish at the next reload. Confirm with `show startup-config` or `show running-config | include ip route`.',
      hint: '`copy running-config startup-config` or `write memory` on each router.',
      checks: [
        { type: 'saved', device: 'R1' },
        { type: 'saved', device: 'R2' },
        { type: 'saved', device: 'R3' },
        { type: 'show', device: 'R1', command: 'show startup-config', pattern: 'ip route 192\\.168\\.3\\.0 255\\.255\\.255\\.0 10\\.0\\.12\\.2 200' },
        { type: 'show', device: 'R2', command: 'show startup-config', pattern: 'ip route 192\\.168\\.3\\.0 255\\.255\\.255\\.0 10\\.0\\.23\\.3' },
        { type: 'show', device: 'R3', command: 'show startup-config', pattern: 'ip route 172\\.16\\.2\\.0 255\\.255\\.255\\.0 10\\.0\\.23\\.2$' },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'no ip route 192.168.3.0 255.255.255.0 10.0.12.2 100',
      'ip route 192.168.3.0 255.255.255.0 10.0.12.2 200',
      'do write memory',
      'end',
    ].join('\n'),
    R2: [
      'enable',
      'configure terminal',
      'ip route 192.168.3.0 255.255.255.0 10.0.23.3',
      'do write memory',
      'end',
    ].join('\n'),
    R3: [
      'enable',
      'configure terminal',
      'no ip route 172.16.2.0 255.255.255.0 10.0.23.20',
      'ip route 172.16.2.0 255.255.255.0 10.0.23.2',
      'router ospf 1',
      ' no passive-interface GigabitEthernet0/2',
      ' passive-interface GigabitEthernet0/1',
      ' exit',
      'do write memory',
      'end',
    ].join('\n'),
  },
};

export default lab;
