import type { Lab } from '../labTypes';

const lab: Lab = {
  id: 'lab-ipv6-addressing-static',
  title: 'IPv6 Addressing and Static Routing',
  summary: 'Enable IPv6 routing, assign global unicast addresses (one of them with EUI-64), pin link-local addresses on the transit link, and connect two LANs with an IPv6 default route and a link-local static route.',
  difficulty: 2,
  minutes: 40,
  lessons: ['ipv6-fundamentals', 'ipv6-address-types', 'ipv6-static-routing'],
  scenario:
    'Northwind Dental is piloting IPv6 between its head office (R1, LAN **2001:db8:acad:1::/64**) and a branch office (R2, LAN **2001:db8:acad:2::/64**). The routers are joined by a transit link, **2001:db8:acad:12::/64**. All interfaces are cabled and enabled, and the two PCs already carry static IPv6 addresses (::10 on their LAN) with their router\'s ::1 address as default gateway.\n\n' +
    'Nothing else is configured: the routers do not forward IPv6, have no global addresses and no routes. Give the LAN interfaces their ::1 addresses, let R2 build its transit-link address with **EUI-64**, and set recognisable **link-local** addresses on the transit link (**FE80::1** on R1, **FE80::2** on R2) so they can be used as next hops.\n\n' +
    'Then route between the sites: the branch gets a **default route** towards head office, and head office gets a **specific route** to the branch LAN whose next hop is a link-local address. A link-local next hop is only meaningful on one link, so IOS requires the exit interface as well. Prove it with pings between the PCs.',
  devices: [
    { id: 'PC1', model: 'pc', x: 1.5, y: 3.5, host: { ipv6: '2001:db8:acad:1::10/64', ipv6Gateway: '2001:db8:acad:1::1' } },
    {
      id: 'R1',
      model: 'isr4321',
      x: 4.5,
      y: 3.5,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description LAN1 to PC1',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Transit link to R2',
        ' no shutdown',
      ].join('\n'),
    },
    {
      id: 'R2',
      model: 'isr4321',
      x: 7.5,
      y: 3.5,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description Transit link to R1',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description LAN2 to PC2',
        ' no shutdown',
      ].join('\n'),
    },
    { id: 'PC2', model: 'pc', x: 10.5, y: 3.5, host: { ipv6: '2001:db8:acad:2::10/64', ipv6Gateway: '2001:db8:acad:2::1' } },
  ],
  links: [
    { a: 'PC1:fa0', b: 'R1:g0/0/0' },
    { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
    { a: 'R2:g0/0/1', b: 'PC2:fa0' },
  ],
  tasks: [
    {
      id: 'routing',
      title: 'Enable IPv6 forwarding on R1 and R2 with `ipv6 unicast-routing`',
      details: 'Without this global command a Cisco router can hold IPv6 addresses but never forwards IPv6 packets or sends router advertisements. Unlike IPv4, IPv6 routing is **off** by default.',
      hint: 'Global configuration mode: `ipv6 unicast-routing`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^ipv6 unicast-routing$' },
        { type: 'config', device: 'R2', pattern: '^ipv6 unicast-routing$' },
      ],
    },
    {
      id: 'lan-addresses',
      title: 'Address the LAN interfaces: R1 G0/0/0 = **2001:db8:acad:1::1/64** and R2 G0/0/1 = **2001:db8:acad:2::1/64**',
      details: 'Use `ipv6 address <address>/<prefix-length>`. These are the addresses the PCs use as default gateway. Check them with `show ipv6 interface brief`.',
      hint: '`interface g0/0/0` → `ipv6 address 2001:db8:acad:1::1/64`',
      checks: [
        { type: 'interface', device: 'R1', iface: 'Gi0/0/0', ipv6: '2001:db8:acad:1::1/64', status: 'up' },
        { type: 'interface', device: 'R2', iface: 'Gi0/0/1', ipv6: '2001:db8:acad:2::1/64', status: 'up' },
      ],
    },
    {
      id: 'transit-eui64',
      title: 'Address the transit link **2001:db8:acad:12::/64**: R1 G0/0/1 uses **::1**, R2 G0/0/0 builds its interface ID automatically with **eui-64**',
      details: 'With `eui-64` you give only the 64-bit prefix and the router appends an interface ID derived from the interface MAC address (inserting FFFE in the middle and flipping the U/L bit). Look at the result in `show ipv6 interface brief`: you cannot predict the last 64 bits in advance, which is why the route towards R2 uses R2\'s link-local address as its next hop.',
      hint: '`ipv6 address 2001:db8:acad:12::/64 eui-64`',
      checks: [
        { type: 'interface', device: 'R1', iface: 'Gi0/0/1', ipv6: '2001:db8:acad:12::1/64', status: 'up' },
        { type: 'config', device: 'R2', section: 'interface GigabitEthernet0/0/0', pattern: '^ ipv6 address 2001:DB8:ACAD:12::/64 eui-64$' },
        { type: 'show', device: 'R2', command: 'show ipv6 interface brief', pattern: '2001:DB8:ACAD:12:[0-9A-F]{1,4}:[0-9A-F]{0,2}FF:FE[0-9A-F]{2}:[0-9A-F]{1,4}' },
      ],
    },
    {
      id: 'link-local',
      title: 'Set the link-local addresses of the transit link to **FE80::1** (R1 G0/0/1) and **FE80::2** (R2 G0/0/0), then confirm that the LAN interfaces still hold an automatic FE80:: address',
      details: 'Every IPv6-enabled interface gets a link-local address automatically (EUI-64 based). You may replace it by hand with the `link-local` keyword so that it is easy to type and remember. `show ipv6 interface brief` lists the link-local address first, then the global addresses.',
      hint: '`ipv6 address fe80::1 link-local` (no prefix length)',
      checks: [
        { type: 'show', device: 'R1', command: 'show ipv6 interface brief', pattern: 'GigabitEthernet0/0/1\\s+\\[up/up\\]\\s+FE80::1\\b' },
        { type: 'show', device: 'R2', command: 'show ipv6 interface brief', pattern: 'GigabitEthernet0/0/0\\s+\\[up/up\\]\\s+FE80::2\\b' },
        { type: 'show', device: 'R1', command: 'show ipv6 interface brief', pattern: 'GigabitEthernet0/0/0\\s+\\[up/up\\]\\s+FE80::[0-9A-F:]+' },
        { type: 'show', device: 'R2', command: 'show ipv6 interface brief', pattern: 'GigabitEthernet0/0/1\\s+\\[up/up\\]\\s+FE80::[0-9A-F:]+' },
      ],
    },
    {
      id: 'static-routes',
      title: 'Add the static routes: on R2 a default route (`::/0`) via **2001:db8:acad:12::1**; on R1 a route to **2001:db8:acad:2::/64** via the link-local next hop **FE80::2** out of **G0/0/1**',
      details: 'A global next hop is resolved recursively, but a link-local next hop is ambiguous (every link has an FE80::/10 network), so `ipv6 route` needs the exit interface in front of it. Verify with `show ipv6 route static`.',
      hint: '`ipv6 route <prefix>/<length> <interface> <next-hop>`',
      checks: [
        { type: 'route', device: 'R1', prefix: '2001:db8:acad:2::/64', source: 'S', nextHop: 'FE80::2' },
        { type: 'route', device: 'R2', prefix: '::/0', source: 'S', nextHop: '2001:db8:acad:12::1' },
      ],
    },
    {
      id: 'verify',
      title: 'Verify end-to-end IPv6 connectivity: PC1 and PC2 must ping each other, and R1 must reach R2\'s LAN address',
      details: 'From a PC run `ping 2001:db8:acad:2::10` (or `ping 2001:db8:acad:1::10` from the other side). If a ping fails, walk the path: the PC\'s gateway, each router\'s `show ipv6 route`, and the return route.',
      hint: '`show ipv6 route` on each router',
      checks: [
        { type: 'ping', from: 'PC1', to: '2001:db8:acad:2::10' },
        { type: 'ping', from: 'PC2', to: '2001:db8:acad:1::10' },
        { type: 'ping', from: 'R1', to: '2001:db8:acad:2::1' },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'ipv6 unicast-routing',
      'interface GigabitEthernet0/0/0',
      ' ipv6 address 2001:db8:acad:1::1/64',
      'interface GigabitEthernet0/0/1',
      ' ipv6 address 2001:db8:acad:12::1/64',
      ' ipv6 address fe80::1 link-local',
      ' exit',
      'ipv6 route 2001:db8:acad:2::/64 GigabitEthernet0/0/1 fe80::2',
      'end',
    ].join('\n'),
    R2: [
      'enable',
      'configure terminal',
      'ipv6 unicast-routing',
      'interface GigabitEthernet0/0/0',
      ' ipv6 address 2001:db8:acad:12::/64 eui-64',
      ' ipv6 address fe80::2 link-local',
      'interface GigabitEthernet0/0/1',
      ' ipv6 address 2001:db8:acad:2::1/64',
      ' exit',
      'ipv6 route ::/0 2001:db8:acad:12::1',
      'end',
    ].join('\n'),
  },
};

export default lab;
