import type { Lab } from '../labTypes';

const lab: Lab = {
  id: 'lab-interface-errors-duplex',
  title: 'Interface Errors: Duplex and Speed Mismatches',
  summary:
    'Read show interfaces and show interfaces status to diagnose a duplex mismatch (late collisions on one end, CRC errors on the other), a hard-coded speed that keeps a link down and a legacy 10 Mb/s port, then restore auto-negotiation and prove the counters are clean.',
  difficulty: 2,
  minutes: 30,
  lessons: ['interface-issues', 'cabling-interfaces'],
  scenario:
    '**Initech\'s** branch office has one router, **R1**, and one access switch, **SW1**. R1 G0/0/0 connects to SW1 Gi0/1 and serves the staff LAN **192.168.10.0/24** (PC1 and PC2); R1 G0/0/1 connects to the server SRV1 (**10.10.10.10/24**). Over the years several people hard-coded speed and duplex on these ports.\n\n' +
    'The monitoring system now raises error alarms for the SW1–R1 uplink: **CRC errors and runts** on the switch and **collisions and late collisions** on the router, and users say file transfers crawl. Separately, SRV1 was swapped for a temporary Fast Ethernet server last week and has had no link light since, and PC2\'s desk port is still configured for a decade-old 10 Mb/s device.\n\n' +
    'Use `show interfaces`, `show interfaces status` (the `a-` prefix marks auto-negotiated values) and `show ip interface brief` to find every hard-coded setting that causes trouble, restore auto-negotiation, and prove the counters stay clean. Late collisions are counted by the **half-duplex** side, CRC errors and runts by the **full-duplex** side.',
  devices: [
    {
      id: 'SW1',
      model: 'c2960',
      x: 3.5,
      y: 3,
      config: [
        'interface FastEthernet0/1',
        ' description PC1',
        'interface FastEthernet0/2',
        ' description PC2',
        ' speed 10',
        ' duplex half',
        'interface GigabitEthernet0/1',
        ' description Uplink to R1',
        ' speed 100',
        ' duplex full',
      ].join('\n'),
    },
    {
      id: 'R1',
      model: 'isr4321',
      x: 7,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description LAN uplink to SW1',
        ' ip address 192.168.10.1 255.255.255.0',
        ' speed 100',
        ' duplex half',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Server SRV1',
        ' ip address 10.10.10.1 255.255.255.0',
        ' speed 1000',
        ' no shutdown',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 0.8, y: 1, host: { ip: '192.168.10.11', mask: '255.255.255.0', gateway: '192.168.10.1' } },
    { id: 'PC2', model: 'pc', x: 0.8, y: 5, host: { ip: '192.168.10.12', mask: '255.255.255.0', gateway: '192.168.10.1' } },
    { id: 'SRV1', model: 'server', x: 10.5, y: 3, host: { ip: '10.10.10.10', mask: '255.255.255.0', gateway: '10.10.10.1' } },
  ],
  links: [
    { a: 'SW1:fa0/1', b: 'PC1:fa0' },
    { a: 'SW1:fa0/2', b: 'PC2:fa0' },
    { a: 'SW1:g0/1', b: 'R1:g0/0/0' },
    { a: 'R1:g0/0/1', b: 'SRV1:fa0' },
  ],
  tasks: [
    {
      id: 'uplink-r1',
      title: 'Remove the hard-coded speed and duplex from **R1 G0/0/0** so it auto-negotiates',
      details: '`show interfaces g0/0/0` on R1 reports `Half-duplex, 100Mb/s` with *collisions* and *late collision* counters, while SW1\'s port runs `Full-duplex` and counts *runts* and *CRC* errors: the two ends disagree about duplex. A half-duplex port expects to see collisions in the first 64 bytes of a frame; a full-duplex peer simply transmits whenever it likes, so the half side logs late collisions and the full side receives truncated, corrupted frames. Start with R1 and remove the hard-coded values it carries.',
      hint: 'The `no` form of the `speed` and `duplex` interface commands puts the port back on auto.',
      checks: [
        { type: 'config', device: 'R1', section: 'interface GigabitEthernet0/0/0', pattern: '^ speed ', expect: false },
        { type: 'config', device: 'R1', section: 'interface GigabitEthernet0/0/0', pattern: '^ duplex ', expect: false },
      ],
    },
    {
      id: 'uplink-sw1',
      title: 'Restore auto-negotiation on **SW1 Gi0/1** and confirm the uplink comes up as **a-full / a-1000**',
      details: '`show interfaces status` on SW1 shows `full` and `100` without the `a-` prefix: the switch is hard-coded and counts CRC errors and runts because the router side disagrees about duplex. With both ends on auto the link negotiates the best common mode, 1000 Mb/s full duplex. Hard-coding both ends to the same values would also work, but auto is the recommended setting for modern ports.',
      hint: '`show interfaces status` on SW1, then undo the hard-coded values on Gi0/1.',
      checks: [
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/1', pattern: '^ speed ', expect: false },
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/1', pattern: '^ duplex ', expect: false },
        { type: 'show', device: 'SW1', command: 'show interfaces status', pattern: '^Gi0/1\\s+Uplink to R1\\s+connected\\s+1\\s+a-full\\s+a-1000\\b' },
      ],
    },
    {
      id: 'clean-counters',
      title: 'Prove the uplink is clean: zero CRC errors, runts, collisions and late collisions on both ends',
      details: 'On real devices error counters survive until they are cleared, so run `clear counters` on SW1 and R1, send traffic (for example `ping 192.168.10.1` from PC1) and look at the counters again with `show interfaces` on both ends. Only counters that still grow after the fix point to a problem that remains.',
      hint: '`show interfaces gigabitEthernet 0/1` on SW1 and `show interfaces g0/0/0` on R1: read the `runts`, `CRC`, `collisions` and `late collision` lines.',
      checks: [
        { type: 'ping', from: 'PC1', to: '192.168.10.1' },
        { type: 'show', device: 'SW1', command: 'show interfaces GigabitEthernet0/1', pattern: '^\\s*Full-duplex, 1000Mb/s' },
        { type: 'show', device: 'R1', command: 'show interfaces GigabitEthernet0/0/0', pattern: '^\\s*Full-duplex, 1000Mb/s' },
        { type: 'show', device: 'SW1', command: 'show interfaces GigabitEthernet0/1', pattern: '^\\s*0 runts, 0 giants' },
        { type: 'show', device: 'SW1', command: 'show interfaces GigabitEthernet0/1', pattern: '^\\s*0 input errors, 0 CRC' },
        { type: 'show', device: 'R1', command: 'show interfaces GigabitEthernet0/0/0', pattern: '^\\s*0 output errors, 0 collisions' },
        { type: 'show', device: 'R1', command: 'show interfaces GigabitEthernet0/0/0', pattern: '^\\s*0 babbles, 0 late collision' },
      ],
    },
    {
      id: 'server-link',
      title: 'Bring up **R1 G0/0/1** so PC1 can reach SRV1 (**10.10.10.10**)',
      details: '`show ip interface brief` on R1 shows G0/0/1 as down/down although the cable is connected. SRV1\'s network card is Fast Ethernet, so it can never link at 1000 Mb/s, and a port whose speed is hard-coded to a rate the other end cannot do stays down. Check the speed shown by `show interfaces g0/0/1`, then let the ports agree.',
      hint: '`show ip interface brief`, then `show running-config interface g0/0/1`.',
      checks: [
        { type: 'interface', device: 'R1', iface: 'Gi0/0/1', status: 'up' },
        { type: 'show', device: 'R1', command: 'show interfaces GigabitEthernet0/0/1', pattern: 'Full-duplex, 100Mb/s' },
        { type: 'ping', from: 'PC1', to: '10.10.10.10' },
      ],
    },
    {
      id: 'pc2-port',
      title: 'Return **SW1 Fa0/2** (PC2) to auto-negotiation: the port must run **a-full / a-100**',
      details: 'PC2 works, but `show interfaces status` shows its port at `half` and `10`: ten megabits, half duplex, hard-coded for a legacy device that no longer exists. Nothing is broken, so this fault is easy to overlook, yet the PC is throttled to a fraction of what the port can do.',
      hint: 'Look at the Duplex and Speed columns of `show interfaces status` for Fa0/2.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show interfaces status', pattern: '^Fa0/2\\s+PC2\\s+connected\\s+1\\s+a-full\\s+a-100\\b' },
        { type: 'ping', from: 'PC2', to: '192.168.10.1' },
      ],
    },
    {
      id: 'save',
      title: 'Save the corrected configuration on **SW1** and **R1**',
      details: 'A hard-coded setting that returns after the next reload would bring the errors back. Confirm in `show startup-config` that the old `speed` and `duplex` lines are gone.',
      hint: '`copy running-config startup-config` or `write memory`.',
      checks: [
        { type: 'saved', device: 'SW1' },
        { type: 'saved', device: 'R1' },
        { type: 'show', device: 'R1', command: 'show startup-config', pattern: '^ duplex half', expect: false },
        { type: 'show', device: 'SW1', command: 'show startup-config', pattern: '^ duplex full', expect: false },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/0/0',
      ' no speed',
      ' no duplex',
      'interface GigabitEthernet0/0/1',
      ' no speed',
      ' exit',
      'do write memory',
      'end',
    ].join('\n'),
    SW1: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/1',
      ' no speed',
      ' no duplex',
      'interface FastEthernet0/2',
      ' no speed',
      ' no duplex',
      ' exit',
      'do write memory',
      'end',
    ].join('\n'),
  },
};

export default lab;
