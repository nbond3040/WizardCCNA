import type { Lab } from '../labTypes';

const lab: Lab = {
  id: 'lab-basic-device-config',
  title: 'Basic Device Configuration & Access Security',
  summary: 'Name, secure, address and save a new router and switch: secrets, console/VTY passwords, banner, encryption and a management SVI.',
  difficulty: 1,
  minutes: 30,
  lessons: ['ios-cli-basics', 'device-access-control'],
  scenario:
    'A branch office just received a new **ISR 4321** router and a **Catalyst 2960** switch, both still at factory defaults (hostnames `Router` and `Switch`).\n' +
    'Before the devices go into production you must give them their names, lock down every access method, add a legal warning, address the LAN and save your work.\n' +
    'PC1 is already configured as **192.168.10.10/24** with gateway **192.168.10.1**. Use the passwords given in each task exactly as written.',
  devices: [
    { id: 'R1', model: 'isr4321', x: 3, y: 3, config: 'hostname Router' },
    { id: 'SW1', model: 'c2960', x: 6, y: 3, config: 'hostname Switch' },
    { id: 'PC1', model: 'pc', x: 9, y: 3, host: { ip: '192.168.10.10', mask: '255.255.255.0', gateway: '192.168.10.1' } },
  ],
  links: [
    { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
    { a: 'SW1:fa0/1', b: 'PC1:fa0' },
  ],
  tasks: [
    {
      id: 'hostnames',
      title: 'Name the router **R1** and the switch **SW1**',
      details: 'Enter global configuration mode with `configure terminal` and use the `hostname` command. The prompt changes immediately.',
      hint: '`enable` → `configure terminal` → `hostname R1` (and `hostname SW1` on the switch).',
      checks: [
        { type: 'config', device: 'R1', pattern: '^hostname R1$' },
        { type: 'config', device: 'SW1', pattern: '^hostname SW1$' },
      ],
    },
    {
      id: 'enable-secret',
      title: 'Protect privileged EXEC mode on both devices with the secret **Cl@ss2026**',
      details: 'Use `enable secret` (hashed) rather than `enable password`. Look at `show running-config` afterwards: the secret is stored as a type 5 or type 9 hash.',
      hint: '`enable secret Cl@ss2026`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^enable secret [589] \\$' },
        { type: 'config', device: 'SW1', pattern: '^enable secret [589] \\$' },
      ],
    },
    {
      id: 'console',
      title: 'Secure the R1 console with the password **C0ns0le!** and stop log messages from interrupting your typing',
      details: 'Under `line console 0` set the password, require it with `login`, and add `logging synchronous`.',
      hint: '`line console 0` → `password C0ns0le!` → `login` → `logging synchronous`',
      checks: [
        { type: 'config', device: 'R1', section: 'line con 0', pattern: '^ password ' },
        { type: 'config', device: 'R1', section: 'line con 0', pattern: '^ login$' },
        { type: 'config', device: 'R1', section: 'line con 0', pattern: '^ logging synchronous$' },
      ],
    },
    {
      id: 'vty',
      title: 'Allow Telnet to R1 on VTY lines 0–4 with the password **T3lnet!**',
      details: 'Configure `line vty 0 4` with a password, `login` and `transport input telnet`. Then test from PC1 with `telnet 192.168.10.1` (this works once the LAN interface is addressed).',
      hint: '`line vty 0 4` → `password T3lnet!` → `login` → `transport input telnet`',
      checks: [
        { type: 'config', device: 'R1', section: 'line vty 0 4', pattern: '^ transport input telnet$' },
        { type: 'login', from: 'PC1', to: '192.168.10.1', protocol: 'telnet', password: 'T3lnet!' },
        { type: 'login', from: 'PC1', to: '192.168.10.1', protocol: 'telnet', password: 'wrong-password', expect: false },
      ],
    },
    {
      id: 'banner-encryption',
      title: 'Add the MOTD banner **Authorized access only!** and encrypt all plain-text passwords on R1',
      details: 'Use a delimiter character that does not appear in the text, e.g. `banner motd #Authorized access only!#`. Then enable `service password-encryption` and notice the console password turns into a type 7 string.',
      hint: '`banner motd #Authorized access only!#` and `service password-encryption`',
      checks: [
        { type: 'config', device: 'R1', pattern: '^banner motd \\^C.*Authorized access only!' },
        { type: 'config', device: 'R1', pattern: '^service password-encryption$' },
        { type: 'config', device: 'R1', section: 'line con 0', pattern: '^ password 7 [0-9A-F]+$' },
      ],
    },
    {
      id: 'addressing',
      title: 'Address the LAN: R1 G0/0/0 **192.168.10.1/24**, SW1 VLAN 1 SVI **192.168.10.2/24** with default gateway **192.168.10.1**',
      details: 'Router interfaces are shut down by default: remember `no shutdown`. Give R1 G0/0/0 the description **LAN**. On the switch, the management address lives on `interface vlan 1` (also shut by default) and the switch needs `ip default-gateway` to reach other subnets.',
      hint: 'R1: `interface g0/0/0` → `description LAN` → `ip address 192.168.10.1 255.255.255.0` → `no shutdown`. SW1: `interface vlan 1` → `ip address 192.168.10.2 255.255.255.0` → `no shutdown`, then `ip default-gateway 192.168.10.1`.',
      checks: [
        { type: 'interface', device: 'R1', iface: 'GigabitEthernet0/0/0', ip: '192.168.10.1', mask: '255.255.255.0', status: 'up', description: 'LAN' },
        { type: 'interface', device: 'SW1', iface: 'Vlan1', ip: '192.168.10.2', mask: '255.255.255.0', status: 'up' },
        { type: 'config', device: 'SW1', pattern: '^ip default-gateway 192\\.168\\.10\\.1$' },
        { type: 'ping', from: 'PC1', to: '192.168.10.1' },
        { type: 'ping', from: 'PC1', to: '192.168.10.2' },
      ],
    },
    {
      id: 'save',
      title: 'Save the running configuration of both devices to NVRAM',
      details: 'Use `copy running-config startup-config` (press Enter to accept the default file name) or `write memory`. A reload would otherwise lose all of your work.',
      hint: '`copy running-config startup-config` then Enter.',
      checks: [
        { type: 'saved', device: 'R1' },
        { type: 'saved', device: 'SW1' },
        { type: 'show', device: 'R1', command: 'show startup-config', pattern: '^hostname R1$' },
        { type: 'show', device: 'SW1', command: 'show startup-config', pattern: '^hostname SW1$' },
      ],
    },
  ],
  solution: {
    R1: [
      'enable',
      'configure terminal',
      'hostname R1',
      'enable secret Cl@ss2026',
      'line console 0',
      ' password C0ns0le!',
      ' login',
      ' logging synchronous',
      ' exit',
      'line vty 0 4',
      ' password T3lnet!',
      ' login',
      ' transport input telnet',
      ' exit',
      'banner motd #Authorized access only!#',
      'service password-encryption',
      'interface GigabitEthernet0/0/0',
      ' description LAN',
      ' ip address 192.168.10.1 255.255.255.0',
      ' no shutdown',
      ' end',
      'copy running-config startup-config',
      '',
    ].join('\n'),
    SW1: [
      'enable',
      'configure terminal',
      'hostname SW1',
      'enable secret Cl@ss2026',
      'interface vlan 1',
      ' ip address 192.168.10.2 255.255.255.0',
      ' no shutdown',
      ' exit',
      'ip default-gateway 192.168.10.1',
      'end',
      'write memory',
    ].join('\n'),
  },
};

export default lab;
