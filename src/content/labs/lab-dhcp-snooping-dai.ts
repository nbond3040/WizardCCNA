import type { Lab } from '../labTypes';

/**
 * DHCP snooping + DAI lab.
 *
 * At load both PCs lease an address from the rogue server (it wins the race in the simulator), so the host
 * checks fail until snooping filters the rogue's offers and the PCs renew. The simulator enforces Dynamic ARP
 * Inspection: ARP from an untrusted port is dropped unless it matches a snooping binding (or an ARP ACL), so the
 * DAI task is verified by behaviour as well as by configuration: the trust/rate table of
 * `show ip arp inspection interfaces`, the VLAN state of `show ip arp inspection vlan 10`, and a ping check proving
 * that ROGUE - a host with a static address and therefore no DHCP snooping binding - is cut off from the gateway.
 */
const lab: Lab = {
  id: 'lab-dhcp-snooping-dai',
  title: 'DHCP Snooping and Dynamic ARP Inspection',
  summary: 'Stop a rogue DHCP server on VLAN 10: enable DHCP snooping, trust only the uplink to the real server, rate-limit the access ports, renew the poisoned clients and add Dynamic ARP Inspection.',
  difficulty: 2,
  minutes: 40,
  lessons: ['l2-security', 'dhcp'],
  scenario:
    'The second-floor users sit in VLAN 10 (**192.168.10.0/24**) on access switch **SW1**. Router **R1**, connected to SW1 G0/1, is the legitimate DHCP server: pool USERS hands out addresses from .21 upwards with default gateway **192.168.10.1** and DNS server **192.168.10.2**. PC1 is on Fa0/1, PC2 on Fa0/2.\n\n' +
    'Somebody plugged an unauthorised DHCP server (**ROGUE**, 192.168.10.66) into the meeting-room wall socket on Fa0/3. It answers before R1, so PC1 and PC2 both leased an address from the rogue **192.168.10.200+** pool with the attacker as their default gateway and DNS server, a textbook man-in-the-middle. Check it with `ipconfig` on either PC.\n\n' +
    'Protect VLAN 10 with **DHCP snooping**: enable it globally and for VLAN 10, trust only the uplink towards the real DHCP server, and rate-limit the access ports. Snooping only filters new DHCP exchanges, so the PCs must then renew their leases. Finally add **Dynamic ARP Inspection** for VLAN 10, which validates ARP packets against the snooping binding table: the clients keep working because they have a binding, while ROGUE, which uses a static address and never asked a DHCP server, must no longer be able to ARP for anybody. Save the configuration on SW1.',
  devices: [
    {
      id: 'R1',
      model: 'isr4321',
      x: 9.5,
      y: 3,
      label: 'R1 (DHCP server)',
      config: [
        'interface GigabitEthernet0/0/0',
        ' description VLAN 10 users via SW1',
        ' ip address 192.168.10.1 255.255.255.0',
        ' no shutdown',
        'ip dhcp excluded-address 192.168.10.1 192.168.10.20',
        'ip dhcp pool USERS',
        ' network 192.168.10.0 255.255.255.0',
        ' default-router 192.168.10.1',
        ' dns-server 192.168.10.2',
      ].join('\n'),
    },
    {
      id: 'SW1',
      model: 'c2960',
      x: 5.5,
      y: 3,
      config: [
        'vlan 10',
        ' name USERS',
        'interface range FastEthernet0/1 - 3',
        ' switchport mode access',
        ' switchport access vlan 10',
        'interface FastEthernet0/1',
        ' description PC1',
        'interface FastEthernet0/2',
        ' description PC2',
        'interface FastEthernet0/3',
        ' description Meeting-room wall socket',
        'interface GigabitEthernet0/1',
        ' description Uplink to R1 (DHCP server)',
        ' switchport mode access',
        ' switchport access vlan 10',
      ].join('\n'),
    },
    { id: 'PC1', model: 'pc', x: 1.5, y: 1, host: { dhcp: true } },
    { id: 'PC2', model: 'pc', x: 1.5, y: 3.4, host: { dhcp: true } },
    {
      id: 'ROGUE',
      model: 'server',
      x: 5.5,
      y: 6,
      label: 'ROGUE (DHCP server)',
      host: { ip: '192.168.10.66', mask: '255.255.255.0', gateway: '192.168.10.1' },
      services: {
        dhcp: { pool: 'EVIL', network: '192.168.10.0', mask: '255.255.255.0', gateway: '192.168.10.66', dns: '192.168.10.66', start: '192.168.10.200', max: 20 },
      },
    },
  ],
  links: [
    { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
    { a: 'PC1:fa0', b: 'SW1:fa0/1' },
    { a: 'PC2:fa0', b: 'SW1:fa0/2' },
    { a: 'ROGUE:fa0', b: 'SW1:fa0/3' },
  ],
  tasks: [
    {
      id: 'snooping-on',
      title: 'Enable DHCP snooping on SW1 globally and for VLAN **10**, and stop inserting DHCP option 82',
      details:
        'Snooping must be enabled globally **and** for each VLAN to protect, otherwise it does nothing. R1 is a plain DHCP server and not a relay, so it would reject requests that carry option 82; turn off its insertion with the `no` form of `ip dhcp snooping information option`. Verify with `show ip dhcp snooping`.',
      hint: 'Two global commands start with `ip dhcp snooping`, one of them takes a VLAN list.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'Switch DHCP snooping is enabled' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'configured on following VLANs:\\s*\\n10\\b' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'Insertion of option 82 is disabled' },
      ],
    },
    {
      id: 'trust-uplink',
      title: 'Trust DHCP server messages only on the uplink: configure SW1 G0/1 (towards R1) as a trusted snooping port',
      details:
        'Untrusted ports drop DHCP **server** messages (OFFER, ACK, NAK), which is what silences the rogue. Trust belongs only on the port that leads to the real DHCP server. If you trust the wrong port, or none, either the rogue still wins or R1 is silenced too.',
      hint: '`ip dhcp snooping trust` is an interface command.',
      checks: [
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/1', pattern: '^ ip dhcp snooping trust$' },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/1', pattern: 'ip dhcp snooping trust', expect: false },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/2', pattern: 'ip dhcp snooping trust', expect: false },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/3', pattern: 'ip dhcp snooping trust', expect: false },
      ],
    },
    {
      id: 'rate-limit',
      title: 'Rate-limit DHCP packets to **15** per second on the access ports Fa0/1, Fa0/2 and Fa0/3',
      details:
        'A DHCP starvation attack floods the server with DISCOVERs from forged MAC addresses. A rate limit protects the switch CPU and the address pool: a port that exceeds it is error-disabled. `interface range` configures several ports at once; check the limit column of `show ip dhcp snooping`.',
      hint: '`ip dhcp snooping limit rate <pps>` under the interfaces.',
      checks: [
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'FastEthernet0/1\\s+no\\s+no\\s+15\\b' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'FastEthernet0/2\\s+no\\s+no\\s+15\\b' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'FastEthernet0/3\\s+no\\s+no\\s+15\\b' },
      ],
    },
    {
      id: 'renew',
      title: 'Make PC1 and PC2 drop the rogue lease and obtain a legitimate one from R1 (gateway 192.168.10.1, DNS 192.168.10.2)',
      details:
        'Snooping does not touch leases that were already granted. On each PC run `ipconfig /release` and then `ipconfig /renew`, and check `ipconfig`. Back on SW1, `show ip dhcp snooping binding` now lists each client with its MAC address, IP address and the port it was learned on; the rogue port must not appear there.',
      hint: 'Use the PC consoles. If a PC ends up with a 169.254.x.x address, the real server\'s replies are being dropped.',
      checks: [
        { type: 'host', device: 'PC1', gateway: '192.168.10.1', dns: '192.168.10.2', inSubnet: '192.168.10.0/24' },
        { type: 'host', device: 'PC2', gateway: '192.168.10.1', dns: '192.168.10.2', inSubnet: '192.168.10.0/24' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping binding', pattern: '192\\.168\\.10\\.2\\d\\s+\\d+\\s+dhcp-snooping\\s+10\\s+FastEthernet0/1\\b' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping binding', pattern: '192\\.168\\.10\\.2\\d\\s+\\d+\\s+dhcp-snooping\\s+10\\s+FastEthernet0/2\\b' },
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping binding', pattern: 'FastEthernet0/3\\b', expect: false },
      ],
    },
    {
      id: 'dai',
      title: 'Enable Dynamic ARP Inspection on SW1 for VLAN **10**, trust ARP only on the uplink G0/1 and check that ROGUE (static address, no binding) is blocked',
      details:
        'DAI checks every ARP packet that arrives on an untrusted port of the VLAN against the DHCP snooping binding table and drops the ones whose IP-to-MAC pairing is not in it, which stops ARP spoofing. The port towards R1 must be trusted because the router has no binding. Verify with `show ip arp inspection vlan 10` (the VLAN must be Enabled and Active) and `show ip arp inspection interfaces` (Gi0/1 Trusted, the access ports Untrusted with the default limit of 15 pps). ROGUE keeps the static address 192.168.10.66 and never used DHCP, so it has no binding: its ARP requests are dropped (see the counters of `show ip arp inspection statistics` and the `%SW_DAI-4-DHCP_SNOOPING_DENY` log message) and a ping from ROGUE to the gateway fails. A legitimate host with a static address would need an ARP ACL (`arp access-list` with `ip arp inspection filter`); here every client uses DHCP.',
      hint: 'Both commands start with `ip arp inspection`: one global with a VLAN list, one on the interface.',
      checks: [
        { type: 'config', device: 'SW1', pattern: '^ip arp inspection vlan 10$' },
        { type: 'config', device: 'SW1', section: 'interface GigabitEthernet0/1', pattern: '^ ip arp inspection trust$' },
        { type: 'config', device: 'SW1', section: 'interface FastEthernet0/3', pattern: 'ip arp inspection trust', expect: false },
        { type: 'show', device: 'SW1', command: 'show ip arp inspection vlan 10', pattern: '^\\s*10\\s+Enabled\\s+Active' },
        { type: 'show', device: 'SW1', command: 'show ip arp inspection interfaces', pattern: 'Gi0/1\\s+Trusted\\s+None\\s+N/A' },
        { type: 'show', device: 'SW1', command: 'show ip arp inspection interfaces', pattern: 'Fa0/1\\s+Untrusted\\s+15\\s+1\\b' },
        { type: 'show', device: 'SW1', command: 'show ip arp inspection interfaces', pattern: 'Fa0/2\\s+Untrusted\\s+15\\s+1\\b' },
        { type: 'show', device: 'SW1', command: 'show ip arp inspection interfaces', pattern: 'Fa0/3\\s+Untrusted\\s+15\\s+1\\b' },
        { type: 'ping', from: 'ROGUE', to: '192.168.10.1', expect: false },
      ],
    },
    {
      id: 'verify',
      title: 'Verify that snooping is operational on VLAN 10 and the clients work with their legitimate leases',
      details: 'From PC1 ping the gateway 192.168.10.1 and PC2; from PC2 ping the gateway too. `show ip dhcp snooping` must report VLAN 10 as operational. The clients keep working with DAI on because their leases are in the snooping binding table.',
      hint: 'If a ping fails after enabling DAI, check that the uplink is trusted, and that the PC renewed its lease after snooping was enabled (a lease from before has no binding).',
      checks: [
        { type: 'show', device: 'SW1', command: 'show ip dhcp snooping', pattern: 'operational on following VLANs:\\s*\\n10\\b' },
        { type: 'ping', from: 'PC1', to: '192.168.10.1' },
        { type: 'ping', from: 'PC2', to: '192.168.10.1' },
        { type: 'ping', from: 'PC1', to: 'PC2' },
      ],
    },
    {
      id: 'save',
      title: 'Save the configuration on SW1',
      hint: '`copy running-config startup-config` or `write memory`',
      checks: [{ type: 'saved', device: 'SW1' }],
    },
  ],
  solution: {
    SW1: [
      'enable',
      'configure terminal',
      'ip dhcp snooping',
      'ip dhcp snooping vlan 10',
      'no ip dhcp snooping information option',
      'interface GigabitEthernet0/1',
      ' ip dhcp snooping trust',
      ' ip arp inspection trust',
      ' exit',
      'interface range FastEthernet0/1 - 3',
      ' ip dhcp snooping limit rate 15',
      ' exit',
      'ip arp inspection vlan 10',
      'do write memory',
      'end',
    ].join('\n'),
    PC1: { dhcp: true },
    PC2: { dhcp: true },
  },
};

export default lab;
