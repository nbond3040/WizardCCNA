import type { Lab } from '../labTypes';

const lab: Lab = {
  id: 'lab-static-routing',
  title: 'Static, Default and Floating Static Routes',
  summary: 'Connect two branch LANs across three routers with network routes, default routes and a floating static backup over a serial link.',
  difficulty: 2,
  minutes: 40,
  lessons: ['static-routing', 'routing-table'],
  scenario:
    'Branch A (R1, LAN **192.168.1.0/24**) reaches the rest of the company through the core router R2, which also connects Branch C (R3, LAN **192.168.3.0/24**).\n' +
    'R1 has two uplinks to R2: a Gigabit link (**10.0.12.0/30**) that should carry all traffic, and a slower serial backup (**10.0.112.0/30**) that must only be used when the Gigabit link fails. R2 reaches R3 over **10.0.23.0/30**.\n' +
    'All interfaces are already addressed and up; no routing is configured. The branches are stubs, so they only need default routes; the core needs specific network routes.',
  devices: [
    {
      id: 'R1',
      model: 'isr4321',
      x: 2,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description Branch A LAN',
        ' ip address 192.168.1.1 255.255.255.0',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Primary to R2',
        ' ip address 10.0.12.1 255.255.255.252',
        ' no shutdown',
        'interface Serial0/1/0',
        ' description Backup to R2',
        ' ip address 10.0.112.1 255.255.255.252',
        ' no shutdown',
      ].join('\n'),
    },
    {
      id: 'R2',
      model: 'isr4321',
      x: 6,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description Primary to R1',
        ' ip address 10.0.12.2 255.255.255.252',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description To R3',
        ' ip address 10.0.23.1 255.255.255.252',
        ' no shutdown',
        'interface Serial0/1/0',
        ' description Backup to R1',
        ' ip address 10.0.112.2 255.255.255.252',
        ' clock rate 2000000',
        ' no shutdown',
      ].join('\n'),
    },
    {
      id: 'R3',
      model: 'isr4321',
      x: 10,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description To R2',
        ' ip address 10.0.23.2 255.255.255.252',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Branch C LAN',
        ' ip address 192.168.3.1 255.255.255.0',
        ' no shutdown',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 2, y: 6, host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
    { id: 'PC3', model: 'pc', x: 10, y: 6, host: { ip: '192.168.3.10', mask: '255.255.255.0', gateway: '192.168.3.1' } },
  ],
  links: [
    { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
    { a: 'R1:s0/1/0', b: 'R2:s0/1/0', type: 'serial' },
    { a: 'R2:g0/0/1', b: 'R3:g0/0/0' },
    { a: 'R1:g0/0/0', b: 'PC1:fa0' },
    { a: 'R3:g0/0/1', b: 'PC3:fa0' },
  ],
  tasks: [
    {
      id: 'core-routes',
      title: 'On R2, add static network routes to both branch LANs',
      details: 'R2 knows its connected networks only. Add a route to **192.168.1.0/24** via R1 (10.0.12.1) and to **192.168.3.0/24** via R3 (10.0.23.2). Verify with `show ip route static`.',
      hint: '`ip route 192.168.1.0 255.255.255.0 10.0.12.1` and `ip route 192.168.3.0 255.255.255.0 10.0.23.2`',
      checks: [
        { type: 'config', device: 'R2', pattern: '^ip route 192\\.168\\.1\\.0 255\\.255\\.255\\.0 10\\.0\\.12\\.1$' },
        { type: 'route', device: 'R2', prefix: '192.168.1.0/24', source: 'S' },
        { type: 'route', device: 'R2', prefix: '192.168.3.0/24', source: 'S', nextHop: '10.0.23.2' },
      ],
    },
    {
      id: 'branch-c-default',
      title: 'Give stub router R3 a default route pointing to R2',
      details: 'A default route (`0.0.0.0 0.0.0.0`) matches every destination and becomes the **gateway of last resort** (code `S*`).',
      hint: '`ip route 0.0.0.0 0.0.0.0 10.0.23.1`',
      checks: [
        { type: 'route', device: 'R3', prefix: '0.0.0.0/0', source: 'S*', nextHop: '10.0.23.1' },
        { type: 'show', device: 'R3', command: 'show ip route', pattern: '^Gateway of last resort is 10\\.0\\.23\\.1 to network 0\\.0\\.0\\.0' },
      ],
    },
    {
      id: 'branch-a-default',
      title: 'Give R1 a default route through the primary Gigabit link (next hop 10.0.12.2)',
      hint: '`ip route 0.0.0.0 0.0.0.0 10.0.12.2`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^ip route 0\\.0\\.0\\.0 0\\.0\\.0\\.0 10\\.0\\.12\\.2$' },
        { type: 'route', device: 'R1', prefix: '0.0.0.0/0', source: 'S*' },
      ],
    },
    {
      id: 'end-to-end',
      title: 'Verify end-to-end connectivity between the branch LANs',
      details: 'Ping PC3 from PC1. Both directions need a route: the request uses R1\'s default route and R2\'s route to 192.168.3.0/24, the reply uses R3\'s default route and R2\'s route to 192.168.1.0/24. `traceroute` from R1 shows the path.',
      checks: [{ type: 'ping', from: 'PC1', to: '192.168.3.10' }],
    },
    {
      id: 'floating',
      title: 'Add floating static routes (administrative distance **200**) over the serial link on R1 and R2',
      details: 'A floating static route has a higher AD than the primary route, so it stays out of the routing table until the primary disappears. On R1 add a backup default route via 10.0.112.2; on R2 add a backup route to 192.168.1.0/24 via 10.0.112.1. `show ip route` should still show only the primary routes.',
      hint: 'R1: `ip route 0.0.0.0 0.0.0.0 10.0.112.2 200` — R2: `ip route 192.168.1.0 255.255.255.0 10.0.112.1 200`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^ip route 0\\.0\\.0\\.0 0\\.0\\.0\\.0 10\\.0\\.112\\.2 200$' },
        { type: 'config', device: 'R2', pattern: '^ip route 192\\.168\\.1\\.0 255\\.255\\.255\\.0 10\\.0\\.112\\.1 200$' },
      ],
    },
    {
      id: 'failover',
      title: 'Test the backup: shut down R1 G0/0/1 and confirm traffic now uses the serial link',
      details: 'With the primary link down, its connected route disappears, the primary static routes lose their next hop and the floating routes are installed. PC1 must still reach PC3.',
      hint: 'R1: `interface g0/0/1` → `shutdown`. Then `show ip route` on R1 and R2.',
      checks: [
        { type: 'interface', device: 'R1', iface: 'Gi0/0/1', status: 'admin-down' },
        { type: 'route', device: 'R1', prefix: '0.0.0.0/0', source: 'S*', nextHop: '10.0.112.2' },
        { type: 'route', device: 'R2', prefix: '192.168.1.0/24', source: 'S', nextHop: '10.0.112.1' },
        { type: 'ping', from: 'PC1', to: '192.168.3.10' },
      ],
    },
  ],
  solution: {
    R2: [
      'enable',
      'configure terminal',
      'ip route 192.168.1.0 255.255.255.0 10.0.12.1',
      'ip route 192.168.3.0 255.255.255.0 10.0.23.2',
      'ip route 192.168.1.0 255.255.255.0 10.0.112.1 200',
      'end',
    ].join('\n'),
    R3: ['enable', 'configure terminal', 'ip route 0.0.0.0 0.0.0.0 10.0.23.1', 'end'].join('\n'),
    R1: [
      'enable',
      'configure terminal',
      'ip route 0.0.0.0 0.0.0.0 10.0.12.2',
      'ip route 0.0.0.0 0.0.0.0 10.0.112.2 200',
      'interface GigabitEthernet0/0/1',
      ' shutdown',
      ' end',
    ].join('\n'),
  },
};

export default lab;
