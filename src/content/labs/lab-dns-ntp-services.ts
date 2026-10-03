import type { Lab } from '../labTypes';

const lab: Lab = {
  id: 'lab-dns-ntp-services',
  title: 'DNS Resolution and NTP Time Sync',
  summary: 'Point hosts and a router at the internal DNS server, add a static host entry, then make R1 an NTP master with a switch and a branch router as clients.',
  difficulty: 2,
  minutes: 35,
  lessons: ['dns', 'ntp'],
  scenario:
    'The Wizard Corp office has one LAN, 192.168.1.0/24, behind R1: switch SW1, the DNS and web server SRV1 (192.168.1.10) and two PCs. A branch router, R2, hangs off R1 over 10.0.12.0/30. Everything is addressed and routed, but users report that internal names do not resolve, and nobody trusts the logs because the devices disagree about the time.\n\n' +
    'SRV1 already serves A records for the **wizard.local** domain (www, r1, sw1 and r2). The PCs were never set up properly to use it, and R1 still carries `no ip domain-lookup` from the days when a mistyped command froze the console while the router tried to resolve it as a hostname.\n\n' +
    'Fix name resolution first, then bring the clocks in line: R1 has an accurate clock and becomes the **NTP master (stratum 3)**; SW1 and R2 become its NTP clients.',
  devices: [
    {
      id: 'SRV1',
      model: 'server',
      x: 1,
      y: 1.2,
      host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' },
      services: {
        dns: [
          { name: 'www.wizard.local', ip: '192.168.1.10' },
          { name: 'r1.wizard.local', ip: '192.168.1.1' },
          { name: 'sw1.wizard.local', ip: '192.168.1.2' },
          { name: 'r2.wizard.local', ip: '10.0.12.2' },
        ],
        http: true,
      },
    },
    {
      id: 'SW1',
      model: 'c2960',
      x: 3.5,
      y: 3,
      config: ['interface Vlan1', ' ip address 192.168.1.2 255.255.255.0', ' no shutdown', 'ip default-gateway 192.168.1.1'].join('\n'),
    },
    {
      id: 'R1',
      model: 'isr4321',
      x: 7,
      y: 3,
      config: [
        'no ip domain-lookup',
        'interface GigabitEthernet0/0/0',
        ' description LAN',
        ' ip address 192.168.1.1 255.255.255.0',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Link to R2',
        ' ip address 10.0.12.1 255.255.255.252',
        ' no shutdown',
      ].join('\n'),
    },
    {
      id: 'R2',
      model: 'isr4321',
      x: 10.5,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description Link to R1',
        ' ip address 10.0.12.2 255.255.255.252',
        ' no shutdown',
        'ip route 0.0.0.0 0.0.0.0 10.0.12.1',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 1.5, y: 5.6, host: { ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.1' } },
    { id: 'PC2', model: 'pc', x: 5, y: 5.6, host: { ip: '192.168.1.12', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.1.99' } },
  ],
  links: [
    { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
    { a: 'SW1:fa0/1', b: 'SRV1:fa0' },
    { a: 'SW1:fa0/2', b: 'PC1:fa0' },
    { a: 'SW1:fa0/3', b: 'PC2:fa0' },
    { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
  ],
  tasks: [
    {
      id: 'host-dns',
      title: 'Fix the DNS server setting on PC1 (none configured) and PC2 (wrong address) so that both use SRV1, **192.168.1.10**',
      details: 'Open each PC\'s IP configuration and set the DNS server, then test in the command prompt with `nslookup www.wizard.local`. A host sends its queries to the DNS server in its own configuration, so a wrong or missing address means no names, even though pinging by IP address works.',
      hint: 'PC2 has a DNS server configured, but nothing answers at that address. Compare it with SRV1\'s address.',
      checks: [
        { type: 'host', device: 'PC1', dns: '192.168.1.10' },
        { type: 'host', device: 'PC2', dns: '192.168.1.10' },
        { type: 'resolve', from: 'PC1', name: 'www.wizard.local', ip: '192.168.1.10' },
        { type: 'resolve', from: 'PC2', name: 'r2.wizard.local', ip: '10.0.12.2' },
      ],
    },
    {
      id: 'router-dns',
      title: 'Make R1 a DNS client: re-enable `ip domain-lookup`, set the domain name **wizard.local** and use **192.168.1.10** as the name server',
      details: '`no ip domain-lookup` also switches off name lookups for `ping` and `traceroute`. Re-enable it, define the server with `ip name-server` and the default domain with `ip domain-name`. Then test from R1 with `ping www.wizard.local` and `ping r2.wizard.local`.',
      hint: '`ip domain-lookup`, `ip name-server ...`, `ip domain-name ...`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^no ip domain[- ]lookup$', expect: false },
        { type: 'config', device: 'R1', pattern: '^ip name-server 192\\.168\\.1\\.10$' },
        { type: 'config', device: 'R1', pattern: '^ip domain[- ]name wizard\\.local$' },
        { type: 'show', device: 'R1', command: 'ping www.wizard.local', pattern: 'Success rate is (80|100) percent' },
        { type: 'show', device: 'R1', command: 'ping r2.wizard.local', pattern: 'Success rate is (80|100) percent' },
      ],
    },
    {
      id: 'host-table',
      title: 'On R2, add a static host table entry so that `ping HQ` reaches R1 at 192.168.1.1',
      details: 'A router can also resolve names locally, without any server, from its host table: `ip host NAME ADDRESS`. Local entries are consulted before DNS and keep working when the DNS server is down. Test with `ping HQ` on R2.',
      hint: '`ip host NAME ADDRESS` in global configuration mode',
      checks: [
        { type: 'config', device: 'R2', pattern: '^ip host HQ 192\\.168\\.1\\.1$' },
        { type: 'show', device: 'R2', command: 'ping HQ', pattern: 'Success rate is (80|100) percent' },
      ],
    },
    {
      id: 'ntp-master',
      title: 'Make R1 the time source of the network with `ntp master 3`',
      details: 'An NTP master serves its own clock at the configured stratum, so its clients end up one level lower (stratum 4). Real networks synchronize to a trusted upstream source; in this isolated lab R1 is the reference. `show ntp status` must report `Clock is synchronized, stratum 3`.',
      hint: '`ntp master 3` in global configuration mode',
      checks: [
        { type: 'config', device: 'R1', pattern: '^ntp master 3$' },
        { type: 'show', device: 'R1', command: 'show ntp status', pattern: 'Clock is synchronized, stratum 3' },
      ],
    },
    {
      id: 'ntp-clients',
      title: 'Make SW1 and R2 NTP clients of R1 (**192.168.1.1**)',
      details: 'A client uses `ntp server ADDRESS`. SW1 reaches R1 over its management VLAN, R2 across the routed link. A client synchronizes once its server is reachable and itself synchronized, and then reports stratum 4. Verify with `show ntp status` and `show ntp associations`.',
      hint: '`ntp server ADDRESS`; allow a moment for the association to synchronize and watch `show ntp associations`',
      checks: [
        { type: 'show', device: 'SW1', command: 'show ntp status', pattern: 'Clock is synchronized, stratum 4, reference is 192\\.168\\.1\\.1' },
        { type: 'show', device: 'R2', command: 'show ntp status', pattern: 'Clock is synchronized, stratum 4, reference is 192\\.168\\.1\\.1' },
        { type: 'show', device: 'SW1', command: 'show ntp associations', pattern: '192\\.168\\.1\\.1' },
        { type: 'show', device: 'R2', command: 'show ntp associations', pattern: '192\\.168\\.1\\.1' },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'ip domain-lookup',
      'ip domain-name wizard.local',
      'ip name-server 192.168.1.10',
      'ntp master 3',
      'end',
    ].join('\n'),
    SW1: ['enable', 'configure terminal', 'ntp server 192.168.1.1', 'end'].join('\n'),
    R2: ['enable', 'configure terminal', 'ip host HQ 192.168.1.1', 'ntp server 192.168.1.1', 'end'].join('\n'),
    PC1: { ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.1.10' },
    PC2: { ip: '192.168.1.12', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.1.10' },
  },
};

export default lab;
