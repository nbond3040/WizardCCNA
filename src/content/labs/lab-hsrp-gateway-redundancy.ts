import type { Lab } from '../labTypes';

const distribution = (id: number, lanHost: number): string =>
  [
    'interface GigabitEthernet0/0/0',
    ' description LAN to SW1',
    ` ip address 192.168.10.${lanHost} 255.255.255.0`,
    ' no shutdown',
    'interface GigabitEthernet0/0/1',
    ' description Uplink to R3',
    ` ip address 10.0.${id}3.1 255.255.255.252`,
    ' no shutdown',
    'router ospf 1',
    ` router-id ${id}.${id}.${id}.${id}`,
    ' passive-interface GigabitEthernet0/0/0',
    ` network 10.0.${id}3.0 0.0.0.3 area 0`,
    ' network 192.168.10.0 0.0.0.255 area 0',
  ].join('\n');

const lab: Lab = {
  id: 'lab-hsrp-gateway-redundancy',
  title: 'HSRP Gateway Redundancy',
  summary: 'Give an access LAN a redundant default gateway: HSRP group, virtual IP, priority and preemption on two distribution routers, hosts pointed at the virtual IP, and a failover test.',
  difficulty: 2,
  minutes: 40,
  lessons: ['fhrp'],
  scenario:
    'On the second floor of Fabrikam Logistics, PC1 and PC2 share the access LAN **192.168.10.0/24** through SW1. Two distribution routers serve it: R1 (192.168.10.2) and R2 (192.168.10.3). Both connect upstream to the core router R3, whose loopback **10.255.0.1** stands in for the application servers. OSPF between the three routers is already running, and both distribution routers advertise the LAN.\n\n' +
    'Today the PCs use R1\'s own address as default gateway, so a failure of R1\'s LAN port cuts off the whole floor even though R2 sits idle right next to it. Remove that single point of failure with **HSRP group 1** and the virtual gateway address **192.168.10.1**: R1 is the intended primary (priority **110**, with preemption so it takes the role back), R2 is the standby at the default priority 100.\n\n' +
    'Move the PCs to the virtual IP, then prove the design: shut down R1\'s LAN port and watch R2 take over the Active role while both PCs keep reaching the core.',
  devices: [
    {
      id: 'R3',
      model: 'isr4321',
      x: 6,
      y: 0.9,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description Downlink to R1',
        ' ip address 10.0.13.2 255.255.255.252',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Downlink to R2',
        ' ip address 10.0.23.2 255.255.255.252',
        ' no shutdown',
        'interface Loopback0',
        ' description Application servers',
        ' ip address 10.255.0.1 255.255.255.255',
        'router ospf 1',
        ' router-id 3.3.3.3',
        ' network 10.0.13.0 0.0.0.3 area 0',
        ' network 10.0.23.0 0.0.0.3 area 0',
        ' network 10.255.0.1 0.0.0.0 area 0',
      ].join('\n'),
    },
    { id: 'R1', model: 'isr4321', x: 3, y: 3, config: distribution(1, 2) },
    { id: 'R2', model: 'isr4321', x: 9, y: 3, config: distribution(2, 3) },
    { id: 'SW1', model: 'c2960', x: 6, y: 4.8 },
    { id: 'PC1', model: 'pc', x: 4, y: 6.5, host: { ip: '192.168.10.11', mask: '255.255.255.0', gateway: '192.168.10.2' } },
    { id: 'PC2', model: 'pc', x: 8, y: 6.5, host: { ip: '192.168.10.12', mask: '255.255.255.0', gateway: '192.168.10.2' } },
  ],
  links: [
    { a: 'R1:g0/0/0', b: 'SW1:fa0/1' },
    { a: 'R2:g0/0/0', b: 'SW1:fa0/2' },
    { a: 'PC1:fa0', b: 'SW1:fa0/3' },
    { a: 'PC2:fa0', b: 'SW1:fa0/4' },
    { a: 'R1:g0/0/1', b: 'R3:g0/0/0' },
    { a: 'R2:g0/0/1', b: 'R3:g0/0/1' },
  ],
  tasks: [
    {
      id: 'primary',
      title: 'Configure R1 as the primary gateway: on G0/0/0 enable HSRP **group 1** with virtual IP **192.168.10.1**, **priority 110** and **preempt**',
      details: 'HSRP elects the router with the highest priority as Active (the default priority is 100; equal priorities fall back to the highest interface IP). Without `preempt`, a router that comes up later with a better priority does **not** take the Active role away from a router that already holds it. Verify with `show standby brief`.',
      hint: '`interface g0/0/0` → `standby 1 ip ...` → `standby 1 priority ...` → `standby 1 preempt`',
      checks: [
        { type: 'hsrp', device: 'R1', group: 1, vip: '192.168.10.1' },
        { type: 'config', device: 'R1', section: 'interface GigabitEthernet0/0/0', pattern: '^ standby 1 priority 110$' },
        { type: 'config', device: 'R1', section: 'interface GigabitEthernet0/0/0', pattern: '^ standby 1 preempt$' },
      ],
    },
    {
      id: 'standby',
      title: 'Configure R2 as the standby gateway: on G0/0/0 join **HSRP group 1** with the same virtual IP **192.168.10.1** and keep the default priority 100',
      details: 'Both routers must use the same group number and virtual IP. Leave R2 at priority 100 so that R1 (110) wins the election. On R2, `show standby brief` should report Standby with R1 as the Active router, and R1\'s address 192.168.10.2 in the Active column.',
      hint: '`interface g0/0/0` → `standby 1 ip 192.168.10.1`',
      checks: [
        { type: 'hsrp', device: 'R2', group: 1, vip: '192.168.10.1' },
        { type: 'config', device: 'R2', section: 'interface GigabitEthernet0/0/0', pattern: '^ standby 1 ip 192\\.168\\.10\\.1$' },
      ],
    },
    {
      id: 'gateway',
      title: 'Change the default gateway of PC1 (192.168.10.11) and PC2 (192.168.10.12) to the virtual IP **192.168.10.1**',
      details: 'Hosts never learn which physical router is Active: they ARP for the virtual IP and receive the HSRP virtual MAC address (0000.0c07.acXX for version 1, where XX is the group number in hex). Before you move on, confirm with `show standby brief` that R1 is Active (priority 110, preempt flag P) and R2 is Standby.',
      hint: 'Open the IP configuration of each PC and change only the default gateway.',
      checks: [
        { type: 'host', device: 'PC1', gateway: '192.168.10.1' },
        { type: 'host', device: 'PC2', gateway: '192.168.10.1' },
      ],
    },
    {
      id: 'reachability',
      title: 'Verify that both PCs reach the virtual IP **192.168.10.1** and the core address **10.255.0.1**',
      details: 'A ping to the virtual IP is answered by whichever router is Active. The ping to 10.255.0.1 crosses the Active router, the OSPF-learned path to R3 and back through the OSPF routes that both distribution routers advertise for the LAN.',
      hint: 'On a PC: `ping 192.168.10.1`, then `ping 10.255.0.1` (or `tracert 10.255.0.1`).',
      checks: [
        { type: 'ping', from: 'PC1', to: '192.168.10.1' },
        { type: 'ping', from: 'PC2', to: '192.168.10.1' },
        { type: 'ping', from: 'PC1', to: '10.255.0.1' },
        { type: 'ping', from: 'PC2', to: '10.255.0.1' },
      ],
    },
    {
      id: 'failover',
      title: 'Simulate a failure of R1\'s LAN port: shut down **G0/0/0** on R1, confirm that **R2 becomes the Active router** and that both PCs still reach **10.255.0.1**',
      details: 'Run `show standby brief` on R2 right after the shutdown: R2 is now Active for group 1 and the PCs keep working without any change on their side. R1 also stops advertising 192.168.10.0/24 into OSPF, so the core returns traffic through R2. The checks of this task look at the failed state, so leave the port down until the task turns green; afterwards `no shutdown` lets you watch preemption hand the Active role back to R1.',
      hint: '`interface g0/0/0` → `shutdown` on R1, then `show standby brief` on R2.',
      checks: [
        { type: 'interface', device: 'R1', iface: 'Gi0/0/0', status: 'admin-down' },
        { type: 'hsrp', device: 'R2', group: 1, state: 'Active', vip: '192.168.10.1' },
        { type: 'ping', from: 'PC1', to: '10.255.0.1' },
        { type: 'ping', from: 'PC2', to: '10.255.0.1' },
      ],
    },
  ],
  solution: {
    R2: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/0/0',
      ' standby 1 ip 192.168.10.1',
      ' end',
    ].join('\n'),
    R1: [
      'enable',
      'configure terminal',
      'interface GigabitEthernet0/0/0',
      ' standby 1 ip 192.168.10.1',
      ' standby 1 priority 110',
      ' standby 1 preempt',
      ' shutdown',
      ' end',
    ].join('\n'),
    PC1: { ip: '192.168.10.11', mask: '255.255.255.0', gateway: '192.168.10.1' },
    PC2: { ip: '192.168.10.12', mask: '255.255.255.0', gateway: '192.168.10.1' },
  },
};

export default lab;
