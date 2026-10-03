import { it } from 'vitest';
import { build, pc } from './helpers';
import type { NetworkSim } from '../index';

const topo = () => build(
  [
    { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'hostname R1\ninterface g0/0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface g0/0/1\n ip address 10.0.12.1 255.255.255.252\n no shutdown' },
    { id: 'R2', model: 'isr2911', x: 2, y: 0, config: 'hostname R2\ninterface g0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface g0/1\n ip address 192.168.2.1 255.255.255.0\n no shutdown' },
    { id: 'SW1', model: 'c2960', x: 0, y: 2, config: 'hostname SW1' },
    { id: 'L3', model: 'c3650', x: 2, y: 2, config: 'hostname L3' },
    pc('PC1', '192.168.1.10', '192.168.1.1'),
    { id: 'SRV', model: 'server', x: 3, y: 1, host: { ip: '192.168.2.100', mask: '255.255.255.0', gateway: '192.168.2.1' } },
  ],
  [
    { a: 'R1:g0/0/0', b: 'SW1:g0/1' }, { a: 'SW1:fa0/1', b: 'PC1:fa0' }, { a: 'R1:g0/0/1', b: 'R2:g0/0' }, { a: 'R2:g0/1', b: 'L3:g1/0/1' }, { a: 'L3:g1/0/2', b: 'SRV:fa0' }, { a: 'SW1:g0/2', b: 'L3:g1/1/1' },
  ],
);

function runAll(sim: NetworkSim, dev: string, lines: string[], label: string, showOut = false) {
  const t = sim.terminal(dev);
  for (const l of lines) {
    const r = t.execute(l);
    const bad = /% ?(Invalid|Incomplete|Ambiguous|Unknown)/.test(r.output);
    if (bad || showOut || process.env.ALLP) console.log(`[${label} ${dev}] ${t.prompt()} <= ${JSON.stringify(l)}\n${r.output.split('\n').slice(0, showOut ? 400 : 6).join('\n')}`);
  }
}

it('smoke', () => {
  const sim = topo();
  runAll(sim, 'R1', ['enable', 'configure terminal',
    'enable secret class', 'enable password cisco', 'enable algorithm-type scrypt secret test', 'service password-encryption', 'banner motd #Hello#', 'banner login ^Login^',
    'username admin privilege 15 secret cisco', 'username bob password pass', 'ip domain-name lab.local', 'ip domain name lab.local', 'no ip domain-lookup', 'ip domain-lookup', 'ip name-server 8.8.8.8', 'ip host SRV 192.168.2.100',
    'crypto key generate rsa general-keys modulus 2048', 'ip ssh version 2', 'ip ssh time-out 60', 'ip ssh authentication-retries 3', 'ip routing', 'ipv6 unicast-routing', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2', 'ip route 0.0.0.0 0.0.0.0 g0/0/1 10.0.12.2 200',
    'ipv6 route ::/0 2001:db8::1', 'ip default-gateway 1.1.1.1',
    'router ospf 1', 'router-id 1.1.1.1', 'network 10.0.12.0 0.0.0.3 area 0', 'passive-interface g0/0/0', 'passive-interface default', 'no passive-interface g0/0/1', 'default-information originate', 'default-information originate always', 'auto-cost reference-bandwidth 1000', 'maximum-paths 4', 'exit',
    'ipv6 router ospf 1', 'router-id 1.1.1.1', 'passive-interface g0/0/0', 'default-information originate', 'exit',
    'access-list 1 permit 192.168.1.0 0.0.0.255', 'access-list 1 remark LAN', 'access-list 100 permit tcp any host 192.168.2.100 eq 80', 'access-list 100 remark web',
    'ip access-list standard MGMT', 'permit host 192.168.1.10', 'remark admins', '20 deny any', 'no 20', 'exit', 'ip access-list extended OUT', '10 permit ip any any', 'exit', 'ip access-list resequence OUT 10 10',
    'ip nat pool P 203.0.113.1 203.0.113.10 netmask 255.255.255.0', 'ip nat pool Q 203.0.113.11 203.0.113.20 prefix-length 24', 'ip nat inside source list 1 pool P overload', 'ip nat inside source static 192.168.1.5 203.0.113.5', 'ip nat inside source static tcp 192.168.1.6 80 203.0.113.6 8080',
    'ip dhcp excluded-address 192.168.1.1 192.168.1.10', 'ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'dns-server 8.8.8.8', 'domain-name lab.local', 'lease 7', 'exit',
    'ntp server 10.0.12.2 prefer', 'ntp master 5', 'ntp source g0/0/1', 'clock timezone EST -5', 'logging host 192.168.2.100', 'logging trap informational', 'logging console warnings', 'logging buffered 16384', 'service timestamps log datetime msec', 'service timestamps debug datetime msec',
    'snmp-server community public RO', 'snmp-server location Lab', 'snmp-server contact admin', 'snmp-server host 192.168.2.100 version 2c public', 'snmp-server enable traps',
    'cdp run', 'lldp run', 'cdp timer 30', 'cdp holdtime 120', 'lldp timer 30', 'lldp holdtime 120', 'errdisable recovery cause bpduguard', 'errdisable recovery interval 30',
    'no ip http server', 'ip http secure-server', 'aaa new-model', 'aaa authentication login default local', 'login block-for 60 attempts 3 within 30', 'security passwords min-length 8',
    'tacacs server T1', 'address ipv4 192.168.2.100', 'key cisco', 'exit', 'radius server R1', 'address ipv4 192.168.2.100 auth-port 1812 acct-port 1813', 'key cisco', 'exit',
    'key chain K', 'key 1', 'key-string cisco', 'exit', 'exit',
    'interface g0/0/0', 'description LAN', 'ip address 192.168.1.1 255.255.255.0', 'ip address 192.168.100.1 255.255.255.0 secondary', 'speed 1000', 'duplex full', 'bandwidth 10000', 'mtu 1500', 'ipv6 address 2001:db8:1::1/64', 'ipv6 address 2001:db8:2::/64 eui-64', 'ipv6 address fe80::1 link-local', 'ipv6 enable',
    'ip ospf 1 area 0', 'ipv6 ospf 1 area 0', 'ip ospf cost 10', 'ip ospf priority 100', 'ip ospf network point-to-point', 'ip ospf hello-interval 5', 'ip ospf dead-interval 20', 'ip helper-address 10.0.12.2', 'ip nat inside', 'ip access-group 1 in', 'ip access-group OUT out',
    'standby 1 ip 192.168.1.254', 'standby 1 priority 110', 'standby 1 preempt', 'standby version 2', 'cdp enable', 'lldp transmit', 'lldp receive', 'no shutdown', 'exit',
    'interface g0/0/0.10', 'encapsulation dot1Q 10', 'ip address 172.16.10.1 255.255.255.0', 'interface g0/0/0.99', 'encapsulation dot1Q 99 native', 'exit',
    'interface s0/1/0', 'clock rate 64000', 'ip address 10.9.9.1 255.255.255.252', 'no shutdown', 'exit',
    'interface loopback 0', 'ip address 1.1.1.1 255.255.255.255', 'exit', 'interface g0/0/1', 'ip address dhcp', 'ip address 10.0.12.1 255.255.255.252', 'ipv6 address autoconfig', 'ip nat outside', 'exit',
    'line con 0', 'password cisco', 'login', 'exec-timeout 5 0', 'logging synchronous', 'history size 20', 'privilege level 15', 'line vty 0 4', 'login local', 'transport input ssh', 'transport input telnet ssh', 'transport input all', 'transport input none', 'access-class MGMT in', 'exec-timeout 10', 'exit', 'line vty 5 15', 'no login', 'end'], 'cfg');
  runAll(sim, 'R1', ['show running-config'], 'run', true);
});
it('switch smoke', () => {
  const sim = topo();
  runAll(sim, 'SW1', ['enable', 'configure terminal', 'vlan 10', 'name USERS', 'vlan 20,30', 'exit', 'vtp mode transparent', 'vtp domain LAB', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 1,10 priority 4096', 'spanning-tree vlan 20 root primary', 'spanning-tree vlan 30 root secondary',
    'spanning-tree portfast default', 'spanning-tree portfast bpduguard default', 'spanning-tree portfast bpdufilter default', 'port-channel load-balance src-dst-ip', 'ip dhcp snooping', 'ip dhcp snooping vlan 10', 'no ip dhcp snooping information option', 'ip arp inspection vlan 10', 'ip default-gateway 192.168.1.1',
    'interface range fa0/1 - 5 , fa0/7', 'switchport mode access', 'switchport access vlan 10', 'switchport voice vlan 20', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'exit',
    'interface fa0/6', 'switchport mode access', 'switchport port-security', 'switchport port-security maximum 2', 'switchport port-security violation restrict', 'switchport port-security mac-address sticky', 'switchport port-security mac-address 0001.0002.0003', 'storm-control broadcast level 50', 'storm-control multicast level 50.5', 'storm-control action shutdown', 'storm-control action trap', 'ip dhcp snooping limit rate 10', 'ip arp inspection trust', 'power inline auto', 'power inline never', 'spanning-tree guard root', 'spanning-tree guard loop', 'spanning-tree guard none', 'spanning-tree cost 10', 'spanning-tree port-priority 64', 'spanning-tree vlan 10 cost 5', 'spanning-tree vlan 10 port-priority 32', 'spanning-tree bpdufilter enable', 'spanning-tree bpduguard disable', 'spanning-tree portfast trunk', 'exit',
    'interface g0/1', 'switchport mode trunk', 'switchport trunk native vlan 99', 'switchport trunk allowed vlan 10,20', 'switchport trunk allowed vlan add 30', 'switchport trunk allowed vlan remove 20', 'switchport trunk allowed vlan except 5', 'switchport trunk allowed vlan all', 'switchport trunk allowed vlan none', 'switchport trunk allowed vlan 1-4094', 'switchport nonegotiate', 'ip dhcp snooping trust', 'exit',
    'interface range fa0/20 - 21', 'channel-group 1 mode active', 'exit', 'interface range fa0/22 - 23', 'channel-group 2 mode desirable', 'exit', 'interface fa0/24', 'channel-group 3 mode on', 'exit', 'interface port-channel 1', 'switchport mode trunk', 'exit',
    'interface fa0/8', 'switchport mode dynamic auto', 'switchport mode dynamic desirable', 'speed 100', 'duplex full', 'description test', 'shutdown', 'no shutdown', 'exit',
    'interface vlan 1', 'ip address 192.168.1.2 255.255.255.0', 'no shutdown', 'end'], 'sw');
  runAll(sim, 'L3', ['enable', 'configure terminal', 'ip routing', 'interface g1/0/3', 'no switchport', 'ip address 10.3.3.1 255.255.255.0', 'interface g1/0/4', 'switchport trunk encapsulation dot1q', 'switchport mode trunk', 'interface vlan 10', 'ip address 10.10.10.1 255.255.255.0', 'end'], 'l3');
});
it('shows', () => {
  const sim = topo();
  runAll(sim, 'R1', ['enable', 'conf t', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2', 'router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 192.168.1.0 0.0.0.255 area 0', 'end'], 'r1');
  runAll(sim, 'R2', ['enable', 'conf t', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1', 'router ospf 1', 'network 0.0.0.0 255.255.255.255 area 0', 'end'], 'r2');
  runAll(sim, 'L3', ['enable', 'conf t', 'ip routing', 'interface g1/0/1', 'no switchport', 'ip address 192.168.2.2 255.255.255.0', 'end'], 'l3');
  runAll(sim, 'PC1', ['ping 192.168.2.100'], 'pc');
  const shows = ['show version', 'show ip interface brief', 'show ip interface g0/0/0', 'show interfaces g0/0/0', 'show interfaces description', 'show ip route', 'show ip route static', 'show ip route connected', 'show ip route ospf', 'show ip route 192.168.2.100', 'show ipv6 interface brief', 'show ipv6 route', 'show ip ospf neighbor', 'show ip ospf interface brief', 'show ip ospf interface g0/0/1', 'show ip ospf', 'show ip ospf database', 'show ip protocols', 'show cdp neighbors', 'show cdp neighbors detail', 'show cdp', 'show lldp neighbors', 'show arp', 'show ip arp', 'show clock', 'show ntp status', 'show ntp associations', 'show ip ssh', 'show users', 'show history', 'show logging', 'show flash:', 'dir', 'show startup-config', 'show running-config interface g0/0/0', 'show ip nat statistics', 'show ip dhcp pool', 'show ip dhcp binding', 'show standby', 'show standby brief', 'show access-lists', 'show ip access-lists', 'show interfaces status', 'show protocols', 'show ip ospf database router', 'show controllers serial 0/1/0', 'show inventory', 'show processes cpu', 'show memory', 'show license', 'show privilege', 'show terminal', 'show hosts', 'show snmp'];
  runAll(sim, 'R1', shows, 'R1show', true);
});
it('switch shows', () => {
  const sim = topo();
  runAll(sim, 'SW1', ['enable', 'conf t', 'vlan 10', 'name USERS', 'exit', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'switchport port-security', 'interface g0/2', 'switchport mode trunk', 'interface range fa0/20 - 21', 'channel-group 1 mode active', 'end'], 'sw');
  runAll(sim, 'L3', ['enable', 'conf t', 'interface g1/1/1', 'switchport trunk encapsulation dot1q', 'switchport mode trunk', 'end'], 'l3');
  runAll(sim, 'PC1', ['ping 192.168.1.1'], 'pc');
  const shows = ['show vlan', 'show vlan brief', 'show interfaces trunk', 'show interfaces switchport', 'show interfaces fa0/1 switchport', 'show interfaces status', 'show mac address-table', 'show mac address-table dynamic', 'show mac address-table interface fa0/1', 'show mac address-table vlan 1', 'show spanning-tree', 'show spanning-tree vlan 1', 'show spanning-tree summary', 'show spanning-tree interface g0/2 detail', 'show etherchannel summary', 'show etherchannel port-channel', 'show port-security', 'show port-security interface fa0/1', 'show ip dhcp snooping', 'show ip dhcp snooping binding', 'show errdisable recovery', 'show power inline', 'show vtp status', 'show interfaces fa0/1', 'show running-config', 'show version', 'show interfaces counters', 'show env all', 'show cdp neighbors', 'show lldp neighbors detail'];
  runAll(sim, 'SW1', shows, 'SWshow', true);
  runAll(sim, 'L3', ['show version', 'show ip interface brief', 'show interfaces trunk', 'show running-config'], 'L3show', true);
});
