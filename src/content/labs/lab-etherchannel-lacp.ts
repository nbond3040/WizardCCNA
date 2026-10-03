import type { Lab } from '../labTypes';

/** VLANs and access ports that are already in place on both switches. */
const switchBase = (pcA: string, pcB: string): string[] => [
  'vlan 10',
  ' name SALES',
  'vlan 20',
  ' name ENGINEERING',
  'vlan 99',
  ' name NATIVE',
  'interface FastEthernet0/1',
  ` description ${pcA} (SALES)`,
  ' switchport mode access',
  ' switchport access vlan 10',
  'interface FastEthernet0/2',
  ` description ${pcB} (ENGINEERING)`,
  ' switchport mode access',
  ' switchport access vlan 20',
];

const lab: Lab = {
  id: 'lab-etherchannel-lacp',
  title: 'EtherChannel with LACP',
  summary: 'Bundle two parallel Gigabit links into a LACP Port-channel, correct a leftover static-mode mismatch on the far switch and trunk VLANs 10, 20 and 99 over the logical link.',
  difficulty: 2,
  minutes: 40,
  lessons: ['etherchannel', 'trunking'],
  scenario:
    'Pinecrest Logistics connects two closet switches, **SW1** and **SW2**, with two parallel Gigabit cables (G0/1 and G0/2). Spanning tree blocks one of them, so half of the capacity is wasted. You are asked to bundle both cables into one logical link, **Port-channel 1**, using the open standard **LACP**.\n\n' +
    'Last week a colleague staged SW2 and put both uplinks into channel-group 1 with the static `on` mode; SW1 has not been touched. VLAN 10 (SALES), VLAN 20 (ENGINEERING) and VLAN 99 (NATIVE), the access ports and the PC addresses are already in place: PC1 and PC3 are in VLAN 10, PC2 and PC4 in VLAN 20.\n\n' +
    'Build the bundle from SW1 (LACP active), find out why it does not come up and correct SW2, then turn Port-channel 1 into a trunk and prove that the VLANs cross the bundle.',
  devices: [
    {
      id: 'SW1',
      model: 'c2960',
      x: 3,
      y: 2.5,
      config: [...switchBase('PC1', 'PC2'), 'interface GigabitEthernet0/1', ' description Link to SW2 G0/1', 'interface GigabitEthernet0/2', ' description Link to SW2 G0/2'].join('\n'),
    },
    {
      id: 'SW2',
      model: 'c2960',
      x: 9,
      y: 2.5,
      config: [
        ...switchBase('PC3', 'PC4'),
        'interface GigabitEthernet0/1',
        ' description Link to SW1 G0/1',
        ' channel-group 1 mode on',
        'interface GigabitEthernet0/2',
        ' description Link to SW1 G0/2',
        ' channel-group 1 mode on',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 1.5, y: 5.5, host: { ip: '192.168.10.11', mask: '255.255.255.0' } },
    { id: 'PC2', model: 'pc', x: 4.5, y: 5.5, host: { ip: '192.168.20.12', mask: '255.255.255.0' } },
    { id: 'PC3', model: 'pc', x: 7.5, y: 5.5, host: { ip: '192.168.10.13', mask: '255.255.255.0' } },
    { id: 'PC4', model: 'pc', x: 10.5, y: 5.5, host: { ip: '192.168.20.14', mask: '255.255.255.0' } },
  ],
  links: [
    { a: 'SW1:g0/1', b: 'SW2:g0/1' },
    { a: 'SW1:g0/2', b: 'SW2:g0/2' },
    { a: 'SW1:fa0/1', b: 'PC1:fa0' },
    { a: 'SW1:fa0/2', b: 'PC2:fa0' },
    { a: 'SW2:fa0/1', b: 'PC3:fa0' },
    { a: 'SW2:fa0/2', b: 'PC4:fa0' },
  ],
  tasks: [
    {
      id: 'sw1-lacp',
      title: 'On SW1 put G0/1 and G0/2 into channel-group 1 using LACP **active** mode',
      details: '`channel-group 1 mode active` on a physical interface creates **Port-channel 1** and starts LACP negotiation. `interface range g0/1 - 2` configures both members at once. Leave the trunk settings for later. Afterwards compare `show etherchannel summary` on both switches: flag (I) means stand-alone, (s) suspended and (P) bundled.',
      hint: '`interface range g0/1 - 2` → `channel-group 1 mode ...`',
      checks: [
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/1', pattern: '^ channel-group 1 mode active$' },
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/2', pattern: '^ channel-group 1 mode active$' },
      ],
    },
    {
      id: 'fix-sw2',
      title: 'Find out why Po1 does not form and correct SW2: G0/1 and G0/2 must be in channel-group 1 using LACP **passive** mode',
      details: 'SW2 was staged with the static `on` mode, which sends no LACP frames, so the two ends can never agree. Only the combinations active/active and active/passive form an LACP bundle (passive/passive does not), and LACP never bundles with a static `on` port. Remove the old static membership from the members first, then add them back with an LACP mode. When it works, both switches show `Po1(SU)` with protocol LACP and both members flagged (P).',
      hint: 'Compare the Protocol column of `show etherchannel summary` on SW1 and SW2. Re-create the membership with `no channel-group` and `channel-group`.',
      checks: [
        { type: 'etherchannel', device: 'SW1', group: 1, protocol: 'lacp', up: true, members: 2 },
        { type: 'etherchannel', device: 'SW2', group: 1, protocol: 'lacp', up: true, members: 2 },
        { type: 'show', device: 'SW2', command: 'show etherchannel summary', pattern: 'Po1\\(SU\\)\\s+LACP\\s+Gi0/1\\(P\\)\\s+Gi0/2\\(P\\)' },
      ],
    },
    {
      id: 'trunk',
      title: 'Make Port-channel 1 an 802.1Q trunk on both switches with native VLAN 99 and allowed VLANs 10, 20 and 99',
      details: 'Configure the logical interface (`interface port-channel 1`), not the member ports: IOS copies the settings to both members, which must stay identical. Check `show interfaces trunk`: the trunk is listed as Po1, not as Gi0/1 and Gi0/2.',
      hint: '`interface port-channel 1` → `switchport mode trunk` → trunk native and allowed VLAN commands.',
      checks: [
        { type: 'switchport', device: 'SW1', iface: 'Po1', mode: 'trunk', nativeVlan: 99, allowed: '10,20,99' },
        { type: 'switchport', device: 'SW2', iface: 'Po1', mode: 'trunk', nativeVlan: 99, allowed: '10,20,99' },
        { type: 'show', device: 'SW1', command: 'show interfaces trunk', pattern: '^Po1\\s+on\\s+802\\.1q\\s+trunking\\s+99$' },
      ],
    },
    {
      id: 'load-balance',
      title: 'Set the EtherChannel load-balancing method to **src-dst-ip** on both switches',
      details: 'The 2960 default is `src-mac`. Hashing on source and destination IP spreads flows over the two links more evenly. The method is a global setting: check it with `show running-config | include load-balance`.',
      hint: '`port-channel load-balance ...` in global configuration mode.',
      checks: [
        { type: 'config', device: 'SW1', pattern: '^port-channel load-balance src-dst-ip$' },
        { type: 'config', device: 'SW2', pattern: '^port-channel load-balance src-dst-ip$' },
      ],
    },
    {
      id: 'verify',
      title: 'Verify the bundle: PC1 reaches PC3 (VLAN 10), PC2 reaches PC4 (VLAN 20) and spanning tree blocks no port',
      details: 'Spanning tree treats the Port-channel as one logical link, so Po1 forwards and no port is in the blocking state. Check with `show spanning-tree vlan 10`.',
      hint: 'If a ping fails, compare the native VLAN and the allowed list on both ends of the trunk.',
      checks: [
        { type: 'ping', from: 'PC1', to: '192.168.10.13' },
        { type: 'ping', from: 'PC2', to: '192.168.20.14' },
        { type: 'stpPort', device: 'SW1', vlan: 10, iface: 'Po1', state: 'forwarding' },
        { type: 'stpPort', device: 'SW2', vlan: 10, iface: 'Po1', state: 'forwarding' },
        { type: 'show', device: 'SW1', command: 'show spanning-tree vlan 10', pattern: 'BLK', expect: false },
        { type: 'show', device: 'SW2', command: 'show spanning-tree vlan 10', pattern: 'BLK', expect: false },
      ],
    },
  ],
  solution: {
    SW1: [
      'enable',
      'configure terminal',
      'interface range g0/1 - 2',
      ' channel-group 1 mode active',
      ' exit',
      'interface port-channel 1',
      ' switchport mode trunk',
      ' switchport trunk native vlan 99',
      ' switchport trunk allowed vlan 10,20,99',
      ' exit',
      'port-channel load-balance src-dst-ip',
      'end',
    ].join('\n'),
    SW2: [
      'enable',
      'configure terminal',
      'interface range g0/1 - 2',
      ' no channel-group',
      ' channel-group 1 mode passive',
      ' exit',
      'interface port-channel 1',
      ' switchport mode trunk',
      ' switchport trunk native vlan 99',
      ' switchport trunk allowed vlan 10,20,99',
      ' exit',
      'port-channel load-balance src-dst-ip',
      'end',
    ].join('\n'),
  },
};

export default lab;
