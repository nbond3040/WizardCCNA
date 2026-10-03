import type { Lab } from '../labTypes';

/**
 * Port Security lab.
 *
 * Incident state: Fa0/3 is locked to PC3's MAC address (0050.b6da.f581, the simulator's deterministic MAC for
 * PC3's FastEthernet0 - `ipconfig /all` on PC3 shows it as 00-50-B6-DA-F5-81). SW2 is a visitor's pocket
 * switch inserted between the wall jack and PC3. Its initial config pings from its SVI, which presents SW2's
 * own MAC on Fa0/3 and err-disables the port when the lab loads. SW1 must be listed before SW2 so that its
 * port-security configuration is already in place when that ping runs.
 */
const lab: Lab = {
  id: 'lab-port-security',
  title: 'Port Security: Sticky MACs, Violations and Recovery',
  summary: 'Lock down access ports with MAC limits and sticky learning, compare the shutdown and restrict violation actions, and restore an err-disabled port that a rogue pocket switch tripped.',
  difficulty: 2,
  minutes: 40,
  lessons: ['l2-security'],
  scenario:
    'The finance floor is served by access switch **SW1**; every host is in VLAN 1 (**192.168.10.0/24**) and the file server SRV1 hangs off G0/1. PC1 (Fa0/1) is the clerk\'s desktop, PC2 (Fa0/2) is the manager\'s desktop that is sometimes swapped for a docked laptop, and PC3 (Fa0/3) is Dave\'s PC. Port security has only been half rolled out: Fa0/1 and Fa0/2 are still wide open, and Fa0/3 is locked to PC3\'s MAC address with the default settings (maximum 1, violation shutdown).\n\n' +
    'At lunchtime Dave plugged a cheap pocket switch (**SW2**, not managed by IT) into his wall jack so he could attach his personal laptop (**ROGUE**) next to his work PC. SW2 announced itself with its own MAC address, a source that Fa0/3 does not allow, so SW1 error-disabled the port and PC3 has been offline ever since. The pocket switch cannot be removed until tomorrow.\n\n' +
    'Roll out port security on Fa0/1 and Fa0/2 (sticky learning, maximum 1 and 2 addresses), then get Dave\'s PC back online **without** letting the pocket switch or the laptop in: PC3 must stay the only allowed device, and the port must no longer go down when a stranger transmits. Finally make port-security violations recover automatically and save.',
  devices: [
    { id: 'PC1', model: 'pc', x: 1.4, y: 0.8, label: 'PC1 (Clerk)', host: { ip: '192.168.10.11', mask: '255.255.255.0' } },
    { id: 'PC2', model: 'pc', x: 1.4, y: 3.6, label: 'PC2 (Manager)', host: { ip: '192.168.10.12', mask: '255.255.255.0' } },
    {
      id: 'SW1',
      model: 'c2960',
      x: 5,
      y: 2.4,
      config: [
        'interface FastEthernet0/3',
        ' description Desk 3 - PC3 only',
        ' switchport mode access',
        ' switchport port-security',
        ' switchport port-security mac-address 0050.b6da.f581',
        'interface GigabitEthernet0/1',
        ' description Link to SRV1',
      ].join('\n'),
    },
    { id: 'SRV1', model: 'server', x: 9, y: 2.4, host: { ip: '192.168.10.100', mask: '255.255.255.0' }, services: { http: true } },
    {
      id: 'SW2',
      model: 'c2960',
      x: 5,
      y: 5.4,
      label: 'SW2 (visitor switch)',
      locked: true,
      config: ['interface Vlan1', ' ip address 192.168.10.99 255.255.255.0', ' no shutdown', 'do ping 192.168.10.100'].join('\n'),
    },
    { id: 'PC3', model: 'pc', x: 2, y: 6.4, label: 'PC3 (Dave)', host: { ip: '192.168.10.13', mask: '255.255.255.0' } },
    { id: 'ROGUE', model: 'laptop', x: 8.4, y: 6.4, label: 'ROGUE (laptop)', host: { ip: '192.168.10.66', mask: '255.255.255.0' } },
  ],
  links: [
    { a: 'PC1:fa0', b: 'SW1:fa0/1' },
    { a: 'PC2:fa0', b: 'SW1:fa0/2' },
    { a: 'SW2:g0/1', b: 'SW1:fa0/3' },
    { a: 'SRV1:fa0', b: 'SW1:g0/1' },
    { a: 'PC3:fa0', b: 'SW2:fa0/1' },
    { a: 'ROGUE:fa0', b: 'SW2:fa0/2' },
  ],
  tasks: [
    {
      id: 'secure-fa01',
      title: 'Secure Fa0/1 (PC1): static access port, port security with **maximum 1** MAC address, sticky learning and violation mode **shutdown**',
      details:
        '`switchport port-security` is only accepted on a port that is statically an access (or trunk) port, so set the mode first. With `switchport port-security mac-address sticky` the switch learns the first MAC it sees and writes it into the running configuration; the address only appears after PC1 has sent traffic, so ping SRV1 from PC1 and look at `show port-security address`. Shutdown is the default violation mode.',
      hint: 'Verify with `show port-security interface fa0/1`.',
      checks: [
        { type: 'switchport', device: 'SW1', iface: 'Fa0/1', mode: 'access' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/1', pattern: 'Port Security\\s*:\\s*Enabled' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/1', pattern: 'Maximum MAC Addresses\\s*:\\s*1\\b' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/1', pattern: 'Violation Mode\\s*:\\s*Shutdown' },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/1', pattern: '^ switchport port-security mac-address sticky$' },
        { type: 'ping', from: 'PC1', to: '192.168.10.100' },
      ],
    },
    {
      id: 'secure-fa02',
      title: 'Secure Fa0/2 (PC2, desktop or docked laptop): static access port, **maximum 2** MAC addresses, sticky learning and violation mode **restrict**',
      details:
        'The manager alternates between two machines, so the port must be able to hold two secure addresses. Violation mode `restrict` drops frames from unknown MACs, increments the violation counter and logs a syslog message, but the port stays up for the legitimate device.',
      hint: 'The same command family as Fa0/1: `switchport port-security maximum`, `... violation`, `... mac-address sticky`.',
      checks: [
        { type: 'switchport', device: 'SW1', iface: 'Fa0/2', mode: 'access' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/2', pattern: 'Port Security\\s*:\\s*Enabled' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/2', pattern: 'Maximum MAC Addresses\\s*:\\s*2\\b' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/2', pattern: 'Violation Mode\\s*:\\s*Restrict' },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/2', pattern: '^ switchport port-security mac-address sticky$' },
        { type: 'ping', from: 'PC2', to: '192.168.10.100' },
      ],
    },
    {
      id: 'restrict-fa03',
      title: 'Change the violation mode of Fa0/3 to **restrict** and keep PC3 as the only allowed device (maximum 1)',
      details:
        'Start with the evidence: `show interfaces status` lists Fa0/3 as err-disabled, `show logging` has the `PSECURE_VIOLATION` message and `show port-security interface fa0/3` names the offending MAC as the last source address. With mode `shutdown` any stranger can knock Dave off the network; `restrict` only drops the stranger\'s frames. Do not remove the configured secure MAC address.',
      hint: '`switchport port-security violation ...` under interface Fa0/3. `protect` also drops silently, but it does not count or log.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/3', pattern: 'Violation Mode\\s*:\\s*Restrict' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/3', pattern: 'Maximum MAC Addresses\\s*:\\s*1\\b' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/3', pattern: 'Configured MAC Addresses\\s*:\\s*1\\b' },
      ],
    },
    {
      id: 'recover-fa03',
      title: 'Bring Fa0/3 out of the err-disabled state so PC3 reaches SRV1 again while ROGUE stays blocked',
      details:
        'Changing the violation mode does not revive a port that is already err-disabled. Bounce it: `shutdown` followed by `no shutdown` in interface configuration mode. Afterwards `show port-security interface fa0/3` must report `Secure-up`, PC3 must ping SRV1, and the laptop behind the pocket switch must still get nowhere.',
      hint: 'Bounce the port, then test with `ping 192.168.10.100` from PC3 and from ROGUE.',
      checks: [
        { type: 'interface', device: 'SW1', iface: 'Fa0/3', status: 'up' },
        { type: 'show', device: 'SW1', command: 'show port-security interface fa0/3', pattern: 'Port Status\\s*:\\s*Secure-up' },
        { type: 'ping', from: 'PC3', to: '192.168.10.100' },
        { type: 'ping', from: 'ROGUE', to: '192.168.10.100', expect: false },
      ],
    },
    {
      id: 'auto-recovery',
      title: 'Let port-security violations recover automatically: enable the **psecure-violation** recovery cause with a **60** second interval',
      details:
        'Without error-disable recovery a port that was shut down by port security stays down until an administrator bounces it. The recovery timer applies to every port in shutdown mode, such as Fa0/1. Verify with `show errdisable recovery`.',
      hint: 'Two global commands starting with `errdisable recovery`.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show errdisable recovery', pattern: 'psecure-violation\\s+Enabled' },
        { type: 'show', device: 'SW1', command: 'show errdisable recovery', pattern: 'Timer interval:\\s*60 seconds' },
      ],
    },
    {
      id: 'verify',
      title: 'Verify the roll-out with `show port-security`: Fa0/1 max 1 shutdown, Fa0/2 max 2 restrict, Fa0/3 max 1 restrict',
      details: 'The summary table lists, per secured port, the maximum, the current number of secure addresses, the violation counter and the security action. The legitimate desks must still reach SRV1.',
      hint: '`show port-security` without arguments gives the summary.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show port-security', pattern: 'Fa0/1\\s+1\\s+\\d+\\s+\\d+\\s+Shutdown' },
        { type: 'show', device: 'SW1', command: 'show port-security', pattern: 'Fa0/2\\s+2\\s+\\d+\\s+\\d+\\s+Restrict' },
        { type: 'show', device: 'SW1', command: 'show port-security', pattern: 'Fa0/3\\s+1\\s+\\d+\\s+\\d+\\s+Restrict' },
        { type: 'ping', from: 'PC1', to: '192.168.10.100' },
        { type: 'ping', from: 'PC2', to: '192.168.10.100' },
        { type: 'ping', from: 'PC3', to: '192.168.10.100' },
      ],
    },
    {
      id: 'save',
      title: 'Save the configuration on SW1',
      details: 'Sticky addresses are only written to the startup configuration when you save; otherwise they are lost at the next reload.',
      hint: '`copy running-config startup-config` or `write memory`',
      checks: [{ type: 'saved', device: 'SW1' }],
    },
  ],
  solution: {
    SW1: [
      'enable',
      'configure terminal',
      'interface fa0/1',
      ' switchport mode access',
      ' switchport port-security',
      ' switchport port-security maximum 1',
      ' switchport port-security mac-address sticky',
      ' switchport port-security violation shutdown',
      'interface fa0/2',
      ' switchport mode access',
      ' switchport port-security',
      ' switchport port-security maximum 2',
      ' switchport port-security mac-address sticky',
      ' switchport port-security violation restrict',
      'interface fa0/3',
      ' switchport port-security violation restrict',
      ' shutdown',
      ' no shutdown',
      ' exit',
      'errdisable recovery cause psecure-violation',
      'errdisable recovery interval 60',
      'do write memory',
      'end',
    ].join('\n'),
  },
};

export default lab;
