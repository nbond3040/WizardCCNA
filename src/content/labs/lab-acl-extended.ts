import type { Lab, LabCheck } from '../labTypes';

/** Match one entry of numbered ACL 101 inside `show access-lists` (the sequence number is free). */
const in101 = (entry: string): LabCheck => ({
  type: 'show',
  device: 'BR1',
  command: 'show access-lists',
  pattern: `Extended IP access list 101\\n(?:\\s+\\d+ .*\\n)*?\\s+\\d+ ${entry}`,
});

const STAFF_HDR = 'Extended IP access list STAFF-IN\\n(?:\\s+\\d+ .*\\n)*?';
const STAFF_NET = '192\\.168\\.10\\.0 0\\.0\\.0\\.255';

const lab: Lab = {
  id: 'lab-acl-extended',
  title: 'Extended ACLs on the Branch Router',
  summary: 'Filter guest traffic with a numbered extended ACL placed next to the source, then repair and renumber a named ACL with sequence numbers and prove it with protocol/port traffic tests.',
  difficulty: 2,
  minutes: 45,
  lessons: ['extended-acls'],
  scenario:
    'The Riverside branch reaches head office over the routed WAN link **10.255.0.0/30**. Branch router **BR1** serves two LANs: Guest Wi-Fi (**192.168.20.0/24**, GUEST1) on G0/0 and Staff (**192.168.10.0/24**, STAFF1) on G0/1. At head office **HQ1** fronts the server LAN **10.0.0.0/24**: the web server **WEB1 (10.0.0.10)** also runs FTP, and HQ1 itself (10.0.0.1) still accepts Telnet for management. Routing works and today every host can reach everything.\n\n' +
    'Guests may only **browse the intranet web server** (HTTP and HTTPS to WEB1) and **ping**. Telnet, and every other kind of traffic from the Guest subnet, must be denied, and the ACL ends with an explicit permit for the rest. Write it as numbered extended ACL **101**. An extended ACL can match source, destination and port, so unlike a standard ACL it belongs **close to the source**: apply it inbound on BR1 where the guests connect.\n\n' +
    'A colleague has also applied a named ACL, **STAFF-IN**, on the Staff interface to stop Telnet and FTP across the WAN. It does not work because its entries were typed in the wrong order. Repair it with ACL **sequence numbers** instead of deleting and retyping it.',
  devices: [
    { id: 'GUEST1', model: 'laptop', x: 1.2, y: 1.2, label: 'GUEST1', host: { ip: '192.168.20.10', mask: '255.255.255.0', gateway: '192.168.20.1' } },
    { id: 'STAFF1', model: 'pc', x: 1.2, y: 4.8, label: 'STAFF1', host: { ip: '192.168.10.10', mask: '255.255.255.0', gateway: '192.168.10.1' } },
    {
      id: 'BR1',
      model: 'isr2911',
      x: 4.6,
      y: 3,
      config: [
        'interface GigabitEthernet0/0',
        ' description Guest Wi-Fi LAN',
        ' ip address 192.168.20.1 255.255.255.0',
        ' no shutdown',
        'interface GigabitEthernet0/1',
        ' description Staff LAN',
        ' ip address 192.168.10.1 255.255.255.0',
        ' ip access-group STAFF-IN in',
        ' no shutdown',
        'interface GigabitEthernet0/2',
        ' description WAN to HQ1',
        ' ip address 10.255.0.1 255.255.255.252',
        ' no shutdown',
        'ip route 0.0.0.0 0.0.0.0 10.255.0.2',
        'ip access-list extended STAFF-IN',
        ' 10 permit ip any any',
        ' 20 deny tcp 192.168.10.0 0.0.0.255 any eq 23',
      ].join('\n'),
    },
    {
      id: 'HQ1',
      model: 'isr4321',
      x: 8,
      y: 3,
      config: [
        'interface GigabitEthernet0/0/0',
        ' description WAN to BR1',
        ' ip address 10.255.0.2 255.255.255.252',
        ' no shutdown',
        'interface GigabitEthernet0/0/1',
        ' description Server LAN',
        ' ip address 10.0.0.1 255.255.255.0',
        ' no shutdown',
        'ip route 192.168.10.0 255.255.255.0 10.255.0.1',
        'ip route 192.168.20.0 255.255.255.0 10.255.0.1',
        'line vty 0 4',
        ' password cisco',
        ' login',
        ' transport input telnet',
      ].join('\n'),
    },
    {
      id: 'WEB1',
      model: 'server',
      x: 11,
      y: 3,
      label: 'WEB1',
      host: { ip: '10.0.0.10', mask: '255.255.255.0', gateway: '10.0.0.1' },
      services: { http: true, https: true, ftp: true },
    },
  ],
  links: [
    { a: 'GUEST1:fa0', b: 'BR1:g0/0' },
    { a: 'STAFF1:fa0', b: 'BR1:g0/1' },
    { a: 'BR1:g0/2', b: 'HQ1:g0/0/0' },
    { a: 'HQ1:g0/0/1', b: 'WEB1:fa0' },
  ],
  tasks: [
    {
      id: 'acl101',
      title: 'On BR1 create numbered extended ACL **101** for the Guest subnet **192.168.20.0/24**, in this order: permit HTTP and HTTPS to **10.0.0.10**, permit ICMP echo to any, deny Telnet to any, deny all other IP, permit the rest',
      details:
        'Extended numbered ACLs use 100-199 and 2000-2699. Entries are evaluated top-down and the first match wins, so the specific permits must come before the broad `deny ip`. Syntax: `access-list 101 permit tcp <source> <wildcard> host <server> eq <port>`; ICMP echo requests are matched with `permit icmp ... any echo`. The last line, `permit ip any any`, is the "permit the rest" entry: without it the invisible `deny ip any any` at the end of every ACL would drop whatever the earlier lines did not match. Check the result, with its sequence numbers, in `show access-lists`.',
      hint: 'Port numbers or names both work after `eq` (`80` or `www`). The guest wildcard mask is `0.0.0.255`.',
      checks: [
        in101('permit tcp 192\\.168\\.20\\.0 0\\.0\\.0\\.255 host 10\\.0\\.0\\.10 eq (www|80)\\b'),
        in101('permit tcp 192\\.168\\.20\\.0 0\\.0\\.0\\.255 host 10\\.0\\.0\\.10 eq 443\\b'),
        in101('permit icmp 192\\.168\\.20\\.0 0\\.0\\.0\\.255 any echo\\b'),
        in101('deny tcp 192\\.168\\.20\\.0 0\\.0\\.0\\.255 any eq (telnet|23)\\b'),
        in101('deny ip 192\\.168\\.20\\.0 0\\.0\\.0\\.255 any\\b'),
        in101('permit ip any any\\b'),
      ],
    },
    {
      id: 'apply101',
      title: 'Apply ACL 101 inbound on BR1 G0/0, the interface the guests connect to',
      details:
        'Place an extended ACL as close to the source as you can, so unwanted packets die before they cross the WAN. **In** is the direction of packets arriving from GUEST1. Then test from GUEST1: web, HTTPS and ping to WEB1 must work, while FTP and Telnet must not.',
      hint: 'ACLs are attached with `ip access-group <acl> {in|out}` under the interface. `show ip interface g0/0` shows which ACL is attached.',
      checks: [
        { type: 'config', device: 'BR1', section: 'interface GigabitEthernet0/0', pattern: '^ ip access-group 101 in$' },
        { type: 'traffic', from: 'GUEST1', to: '10.0.0.10', proto: 'tcp', port: 80 },
        { type: 'traffic', from: 'GUEST1', to: '10.0.0.10', proto: 'tcp', port: 443 },
        { type: 'traffic', from: 'GUEST1', to: '10.0.0.10', proto: 'icmp' },
        { type: 'traffic', from: 'GUEST1', to: '10.0.0.10', proto: 'tcp', port: 21, expect: false },
        { type: 'traffic', from: 'GUEST1', to: '10.0.0.1', proto: 'tcp', port: 23, expect: false },
        { type: 'login', from: 'GUEST1', to: '10.0.0.1', protocol: 'telnet', password: 'cisco', expect: false },
      ],
    },
    {
      id: 'staff-order',
      title: 'Repair STAFF-IN: delete entry **10** (`permit ip any any`) so the Telnet deny can match, then add a permit for the rest at the end',
      details:
        'Look at the entry numbers with `show access-lists STAFF-IN`. The catch-all permit was entered first, so it matches every packet before the deny is ever reached. Enter the ACL with `ip access-list extended STAFF-IN`; inside it, `no <sequence>` removes one entry, and a new entry without a number is appended at the bottom. Do not delete the whole ACL: it is applied to a live interface.',
      hint: 'If you delete entry 10 and add nothing back, the implicit deny blocks all Staff traffic, so web and ping must keep working when you are done.',
      checks: [
        { type: 'traffic', from: 'STAFF1', to: '10.0.0.1', proto: 'tcp', port: 23, expect: false },
        { type: 'login', from: 'STAFF1', to: '10.0.0.1', protocol: 'telnet', password: 'cisco', expect: false },
        { type: 'traffic', from: 'STAFF1', to: '10.0.0.10', proto: 'tcp', port: 80 },
        { type: 'traffic', from: 'STAFF1', to: '10.0.0.10', proto: 'tcp', port: 443 },
        { type: 'ping', from: 'STAFF1', to: '10.0.0.10' },
        {
          type: 'show',
          device: 'BR1',
          command: 'show access-lists',
          pattern: `${STAFF_HDR}\\s+\\d+ deny tcp ${STAFF_NET} any eq (telnet|23)[^\\n]*\\n(?:\\s+\\d+ .*\\n)*?\\s+\\d+ permit ip any any`,
        },
      ],
    },
    {
      id: 'staff-ftp',
      title: 'Insert an entry in STAFF-IN that denies FTP (tcp 21) from **192.168.10.0/24** to any, numbered **25** so it sits between the Telnet deny and the final permit',
      details:
        'Sequence numbers let you insert a rule exactly where it is needed, without retyping the entries around it. After the repair the Telnet deny is entry 20 and the permit is entry 30, so a line that starts with `25` lands between them and is evaluated before the permit can match FTP. Only FTP and Telnet are blocked: everything else from the Staff LAN must still flow.',
      hint: 'Inside `ip access-list extended STAFF-IN`, start the line with the number you want the entry to have.',
      checks: [
        { type: 'show', device: 'BR1', command: 'show access-lists', pattern: '^\\s+25 deny tcp 192\\.168\\.10\\.0 0\\.0\\.0\\.255 any eq (ftp|21)' },
        { type: 'traffic', from: 'STAFF1', to: '10.0.0.10', proto: 'tcp', port: 21, expect: false },
        { type: 'traffic', from: 'STAFF1', to: '10.0.0.10', proto: 'tcp', port: 443 },
      ],
    },
    {
      id: 'staff-resequence',
      title: 'Renumber STAFF-IN so its entries are numbered **10, 20 and 30**',
      details:
        'After a few inserts the numbering is irregular and there is no room left to insert between neighbours. `ip access-list resequence <name> <start> <increment>` (global configuration mode) renumbers every entry without changing their order.',
      hint: 'Check the new numbers with `show access-lists STAFF-IN`.',
      checks: [
        { type: 'show', device: 'BR1', command: 'show access-lists', pattern: `^\\s+10 deny tcp ${STAFF_NET} any eq (telnet|23)` },
        { type: 'show', device: 'BR1', command: 'show access-lists', pattern: `^\\s+20 deny tcp ${STAFF_NET} any eq (ftp|21)` },
        { type: 'show', device: 'BR1', command: 'show access-lists', pattern: '^\\s+30 permit ip any any' },
      ],
    },
    {
      id: 'save',
      title: 'Save the configuration on BR1',
      hint: '`copy running-config startup-config` or `write memory`',
      checks: [{ type: 'saved', device: 'BR1' }],
    },
  ],
  solution: {
    BR1: [
      'enable',
      'configure terminal',
      'access-list 101 permit tcp 192.168.20.0 0.0.0.255 host 10.0.0.10 eq 80',
      'access-list 101 permit tcp 192.168.20.0 0.0.0.255 host 10.0.0.10 eq 443',
      'access-list 101 permit icmp 192.168.20.0 0.0.0.255 any echo',
      'access-list 101 deny tcp 192.168.20.0 0.0.0.255 any eq 23',
      'access-list 101 deny ip 192.168.20.0 0.0.0.255 any',
      'access-list 101 permit ip any any',
      'interface GigabitEthernet0/0',
      ' ip access-group 101 in',
      ' exit',
      'ip access-list extended STAFF-IN',
      ' no 10',
      ' permit ip any any',
      ' 25 deny tcp 192.168.10.0 0.0.0.255 any eq 21',
      ' exit',
      'ip access-list resequence STAFF-IN 10 10',
      'do write memory',
      'end',
    ].join('\n'),
  },
};

export default lab;
