import { describe, expect, it } from 'vitest';
import { build, cfg, pc, run, show } from './helpers';

/** PC1 (192.168.1.0/24) — R1 — (10.0.12.0/30) — R2 — SRV (192.168.2.0/24). */
const net = () =>
  build(
    [
      {
        id: 'R1',
        model: 'isr4321',
        x: 0,
        y: 0,
        config: 'interface g0/0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface g0/0/1\n ip address 10.0.12.1 255.255.255.252\n no shutdown\nip route 0.0.0.0 0.0.0.0 10.0.12.2',
      },
      {
        id: 'R2',
        model: 'isr4321',
        x: 2,
        y: 0,
        config: 'interface g0/0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface g0/0/1\n ip address 192.168.2.1 255.255.255.0\n no shutdown\nip route 192.168.1.0 255.255.255.0 10.0.12.1',
      },
      pc('PC1', '192.168.1.10', '192.168.1.1'),
      pc('PC2', '192.168.1.20', '192.168.1.1'),
      { id: 'SW1', model: 'c2960', x: 0, y: 2 },
      { id: 'SRV', model: 'server', x: 3, y: 1, host: { ip: '192.168.2.100', mask: '255.255.255.0', gateway: '192.168.2.1' }, services: { dns: [{ name: 'www.wizard.lab', ip: '192.168.2.100' }], http: true, ntp: true } },
    ],
    [
      { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
      { a: 'SW1:fa0/1', b: 'PC1:fa0' },
      { a: 'SW1:fa0/2', b: 'PC2:fa0' },
      { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
      { a: 'R2:g0/0/1', b: 'SRV:fa0' },
    ],
  );

describe('access control lists', () => {
  it('applies standard ACLs with first match, implicit deny and counters', () => {
    const sim = net();
    cfg(sim, 'R2', ['access-list 10 deny host 192.168.1.20', 'access-list 10 permit 192.168.1.0 0.0.0.255', 'interface g0/0/1', 'ip access-group 10 out']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100' }).pass).toBe(true);
    const denied = sim.check({ type: 'ping', from: 'PC2', to: '192.168.2.100' });
    expect(denied.pass).toBe(false);
    expect(denied.detail).toMatch(/denied by ACL 10 outbound on R2 Gi0\/0\/1/);
    run(sim, 'PC1', 'ping 192.168.2.100');
    run(sim, 'PC2', 'ping 192.168.2.100');
    const acl = show(sim, 'R2', 'show access-lists');
    expect(acl).toMatch(/^Standard IP access list 10\n {4}10 deny {3}192\.168\.1\.20 \(\d+ match(es)?\)\n {4}20 permit 192\.168\.1\.0, wildcard bits 0\.0\.0\.255 \(\d+ matches\)$/m);
    expect(show(sim, 'R2', 'show ip interface g0/0/1')).toMatch(/Outgoing access list is 10/);
    // PC2 gets administratively prohibited unreachables from R2
    expect(run(sim, 'PC2', 'ping 192.168.2.100')).toMatch(/Reply from 10\.0\.12\.2: Destination host unreachable\./);
  });

  it('matches extended ACL protocols and ports and edits named ACLs by sequence', () => {
    const sim = net();
    cfg(sim, 'R1', ['ip access-list extended WEB-ONLY', 'permit tcp 192.168.1.0 0.0.0.255 host 192.168.2.100 eq 80', 'permit udp any any eq domain', 'exit', 'interface g0/0/0', 'ip access-group WEB-ONLY in']);
    expect(sim.check({ type: 'traffic', from: 'PC1', to: '192.168.2.100', proto: 'tcp', port: 80 }).pass).toBe(true);
    expect(sim.check({ type: 'traffic', from: 'PC1', to: '192.168.2.100', proto: 'tcp', port: 443, expect: false }).pass).toBe(true);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100', expect: false }).pass).toBe(true);
    cfg(sim, 'R1', ['ip access-list extended WEB-ONLY', '15 permit icmp any any echo']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100' }).pass).toBe(true);
    const out = show(sim, 'R1', 'show access-lists WEB-ONLY');
    expect(out).toMatch(/^Extended IP access list WEB-ONLY\n {4}10 permit tcp 192\.168\.1\.0 0\.0\.0\.255 host 192\.168\.2\.100 eq www\n {4}15 permit icmp any any echo\n {4}20 permit udp any any eq domain$/m);
    cfg(sim, 'R1', ['ip access-list extended WEB-ONLY', 'no 15']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100', expect: false }).pass).toBe(true);
    cfg(sim, 'R1', 'ip access-list resequence WEB-ONLY 100 5');
    expect(show(sim, 'R1', 'show access-lists')).toMatch(/ {4}100 permit tcp[\s\S]* {4}105 permit udp/);
    expect(show(sim, 'R1', 'show running-config')).toMatch(/^ip access-list extended WEB-ONLY\n permit tcp 192\.168\.1\.0 0\.0\.0\.255 host 192\.168\.2\.100 eq www\n permit udp any any eq domain$/m);
  });

  it('removes a whole numbered ACL with no access-list', () => {
    const sim = net();
    cfg(sim, 'R1', ['access-list 101 permit tcp any any eq 22', 'access-list 101 deny ip any any']);
    cfg(sim, 'R1', 'no access-list 101 deny ip any any');
    expect(show(sim, 'R1', 'show access-lists')).toBe('');
  });

  it('restricts VTY access with access-class', () => {
    const sim = net();
    cfg(sim, 'R2', ['access-list 5 permit host 192.168.1.10', 'line vty 0 4', 'password telnet', 'login', 'access-class 5 in']);
    expect(sim.check({ type: 'login', from: 'PC1', to: '10.0.12.2', protocol: 'telnet', password: 'telnet' }).pass).toBe(true);
    const r = sim.check({ type: 'login', from: 'PC2', to: '10.0.12.2', protocol: 'telnet', password: 'telnet' });
    expect(r.pass).toBe(false);
    expect(r.detail).toMatch(/Connection refused by remote host/);
  });
});

describe('NAT', () => {
  const natNet = () => {
    const sim = net();
    // R2 no longer knows the private LAN: only NAT makes the traffic routable
    cfg(sim, 'R2', 'no ip route 192.168.1.0 255.255.255.0 10.0.12.1');
    cfg(sim, 'R1', ['interface g0/0/0', 'ip nat inside', 'interface g0/0/1', 'ip nat outside']);
    return sim;
  };

  it('translates with PAT (overload) on the outside interface', () => {
    const sim = natNet();
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100' }).pass).toBe(false);
    cfg(sim, 'R1', ['access-list 1 permit 192.168.1.0 0.0.0.255', 'ip nat inside source list 1 interface g0/0/1 overload']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100' }).pass).toBe(true);
    run(sim, 'PC1', 'ping 192.168.2.100');
    run(sim, 'PC2', 'ping 192.168.2.100');
    const tr = show(sim, 'R1', 'show ip nat translations');
    expect(tr).toMatch(/^Pro {2}Inside global {9}Inside local {10}Outside local {9}Outside global$/m);
    expect(tr).toMatch(/^icmp 10\.0\.12\.1:1 +192\.168\.1\.10:1 +192\.168\.2\.100:1 +192\.168\.2\.100:1$/m);
    expect(tr).toMatch(/^icmp 10\.0\.12\.1:1024 +192\.168\.1\.20:1 +192\.168\.2\.100:1 +192\.168\.2\.100:1$/m);
    expect(show(sim, 'R1', 'show ip nat statistics')).toMatch(/Outside interfaces:\n {2}GigabitEthernet0\/0\/1\nInside interfaces: \n {2}GigabitEthernet0\/0\/0/);
    run(sim, 'R1', 'clear ip nat translation *');
    expect(show(sim, 'R1', 'show ip nat translations')).toBe('');
  });

  it('translates with a dynamic pool and a static mapping', () => {
    const sim = natNet();
    cfg(sim, 'R2', 'ip route 203.0.113.0 255.255.255.0 10.0.12.1');
    cfg(sim, 'R1', ['access-list 1 permit 192.168.1.0 0.0.0.255', 'ip nat pool PUBLIC 203.0.113.10 203.0.113.10 netmask 255.255.255.0', 'ip nat inside source list 1 pool PUBLIC']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.100' }).pass).toBe(true);
    run(sim, 'PC1', 'ping 192.168.2.100');
    // pool of one address is exhausted for the second host
    expect(sim.check({ type: 'ping', from: 'PC2', to: '192.168.2.100' }).pass).toBe(false);
    expect(show(sim, 'R1', 'show ip nat translations')).toMatch(/^--- +203\.0\.113\.10 +192\.168\.1\.10 +--- +---$/m);
    // static NAT makes PC2 reachable from the outside
    cfg(sim, 'R1', 'ip nat inside source static 192.168.1.20 203.0.113.20');
    expect(sim.check({ type: 'ping', from: 'SRV', to: '203.0.113.20' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show ip nat translations')).toMatch(/^--- +203\.0\.113\.20 +192\.168\.1\.20 +--- +---$/m);
  });
});

describe('DHCP', () => {
  it('leases addresses from an IOS pool with exclusions and relays through ip helper-address', () => {
    const sim = net();
    cfg(sim, 'R1', ['ip dhcp excluded-address 192.168.1.1 192.168.1.10', 'ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'dns-server 192.168.2.100', 'domain-name wizard.lab']);
    sim.setHostConfig('PC1', { dhcp: true });
    const hc = sim.hostConfig('PC1');
    expect(hc.assigned).toEqual({ ip: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.2.100' });
    expect(sim.check({ type: 'host', device: 'PC1', dhcp: true, inSubnet: '192.168.1.0/24', gateway: '192.168.1.1' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show ip dhcp binding')).toMatch(/^192\.168\.1\.11 +01[0-9a-f]{2}\.[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{2} +\w{3} \d\d \d{4} \d\d:\d\d [AP]M +Automatic +Active +GigabitEthernet0\/0\/0$/m);
    expect(run(sim, 'PC1', 'ipconfig /all')).toMatch(/DHCP Server . . . . . . . . . . . : 192\.168\.1\.1/);
    // release and renew
    expect(run(sim, 'PC1', 'ipconfig /release')).not.toMatch(/IPv4 Address/);
    expect(sim.hostConfig('PC1').assigned).toBeUndefined();
    expect(run(sim, 'PC1', 'ipconfig /renew')).toMatch(/IPv4 Address. . . . . . . . . . . : 192\.168\.1\.11/);
    // relay: move the pool to R2 and point R1 at it
    cfg(sim, 'R1', 'no ip dhcp pool LAN');
    cfg(sim, 'R2', ['ip dhcp excluded-address 192.168.1.1 192.168.1.49', 'ip dhcp pool BRANCH', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1']);
    sim.setHostConfig('PC2', { dhcp: true });
    // no server reachable yet: Windows falls back to APIPA
    expect(sim.hostConfig('PC2').assigned?.ip).toMatch(/^169\.254\./);
    expect(sim.check({ type: 'host', device: 'PC2', inSubnet: '192.168.1.0/24' }).detail).toMatch(/APIPA/);
    cfg(sim, 'R1', ['interface g0/0/0', 'ip helper-address 10.0.12.2']);
    expect(sim.hostConfig('PC2').assigned?.ip).toBe('192.168.1.50');
  });

  it('breaks DHCP when snooping inserts option 82 unless the server trusts it', () => {
    const sim = net();
    cfg(sim, 'R1', ['ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1']);
    cfg(sim, 'SW1', ['ip dhcp snooping', 'ip dhcp snooping vlan 1']);
    sim.setHostConfig('PC1', { dhcp: true });
    // the uplink is untrusted: the OFFER is dropped (APIPA)
    expect(sim.hostConfig('PC1').assigned?.ip).toMatch(/^169\.254\./);
    cfg(sim, 'SW1', ['interface g0/1', 'ip dhcp snooping trust']);
    // trusted now, but option 82 with giaddr 0 is rejected by the IOS server
    expect(sim.hostConfig('PC1').assigned?.ip).toMatch(/^169\.254\./);
    cfg(sim, 'SW1', 'no ip dhcp snooping information option');
    expect(sim.hostConfig('PC1').assigned?.ip).toMatch(/^192\.168\.1\./);
    expect(show(sim, 'SW1', 'show ip dhcp snooping binding')).toMatch(/dhcp-snooping +1 +FastEthernet0\/1/);
  });

  it('gets a router interface address with ip address dhcp', () => {
    const sim = net();
    cfg(sim, 'R2', ['ip dhcp pool WAN', 'network 10.0.12.0 255.255.255.252', 'default-router 10.0.12.2', 'exit', 'ip dhcp excluded-address 10.0.12.2']);
    cfg(sim, 'R1', ['no ip route 0.0.0.0 0.0.0.0 10.0.12.2', 'interface g0/0/1', 'ip address dhcp']);
    expect(show(sim, 'R1', 'show ip interface brief')).toMatch(/^GigabitEthernet0\/0\/1 +10\.0\.12\.1 +YES DHCP +up +up$/m);
    expect(show(sim, 'R1', 'show ip route')).toMatch(/^S\* {4}0\.0\.0\.0\/0 \[254\/0\] via 10\.0\.12\.2$/m);
  });
});

describe('remote access', () => {
  it('opens nested SSH sessions with local users', () => {
    const sim = net();
    const fail = cfg(sim, 'R2', 'crypto key generate rsa modulus 1024');
    expect(fail).toMatch(/% Please define a domain-name first\./);
    const out = cfg(sim, 'R2', ['ip domain-name wizard.lab', 'crypto key generate rsa modulus 1024', 'ip ssh version 2', 'username admin privilege 15 secret S3cret!', 'line vty 0 4', 'login local', 'transport input ssh']);
    expect(out).toMatch(/The name for the keys will be: R2\.wizard\.lab/);
    expect(out).toMatch(/% Generating 1024 bit RSA keys, keys will be non-exportable\.\.\./);
    expect(sim.check({ type: 'login', from: 'PC1', to: '10.0.12.2', protocol: 'ssh', username: 'admin', password: 'S3cret!' }).pass).toBe(true);
    expect(sim.check({ type: 'login', from: 'PC1', to: '10.0.12.2', protocol: 'ssh', username: 'admin', password: 'nope', expect: false }).pass).toBe(true);
    expect(sim.check({ type: 'login', from: 'PC1', to: '10.0.12.2', protocol: 'telnet', password: 'S3cret!', expect: false }).pass).toBe(true);
    const t = sim.terminal('R1');
    t.execute('enable');
    t.execute('ssh -l admin 192.168.2.1');
    expect(t.prompt()).toBe('Password: ');
    expect(t.isSecretInput()).toBe(true);
    t.execute('S3cret!');
    expect(t.prompt()).toBe('R2#');
    const users = t.execute('show users').output;
    expect(users).toMatch(/^\*  2 vty 0     admin      idle                 00:00:00 10\.0\.12\.1$/m);
    expect(users).toMatch(/^   0 con 0 {16}idle {17}\d\d:\d\d:\d\d$/m);
    expect(t.execute('exit').output).toMatch(/\[Connection to 192\.168\.2\.1 closed by foreign host\]/);
    expect(t.prompt()).toBe('R1#');
    // from a PC
    const p = sim.terminal('PC1');
    p.execute('ssh -l admin 10.0.12.2');
    p.execute('S3cret!');
    expect(p.prompt()).toBe('R2#');
    p.execute('exit');
    expect(p.prompt()).toBe('C:\\>');
  });

  it('telnets with a line password and enforces enable on VTY', () => {
    const sim = net();
    cfg(sim, 'R2', ['line vty 0 4', 'password T3lnet', 'login']);
    const t = sim.terminal('PC1');
    expect(t.execute('telnet 10.0.12.2').output).toMatch(/Connecting To 10\.0\.12\.2\.\.\.[\s\S]*User Access Verification/);
    t.execute('T3lnet');
    expect(t.prompt()).toBe('R2>');
    expect(t.execute('enable').output).toBe('% No password set');
    t.execute('exit');
    cfg(sim, 'R2', ['line vty 0 4', 'no password']);
    expect(sim.terminal('PC1').execute('telnet 10.0.12.2').output).toMatch(/Password required, but none set/);
  });
});

describe('DNS, NTP, HSRP and logging', () => {
  it('resolves names through the DNS server', () => {
    const sim = net();
    sim.setHostConfig('PC1', { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.2.100' });
    expect(sim.check({ type: 'resolve', from: 'PC1', name: 'www.wizard.lab', ip: '192.168.2.100' }).pass).toBe(true);
    expect(run(sim, 'PC1', 'nslookup www.wizard.lab')).toMatch(/Server: {2}UnKnown\nAddress: {2}192\.168\.2\.100\n\nName: {4}www\.wizard\.lab\nAddress: {2}192\.168\.2\.100/);
    expect(run(sim, 'PC1', 'ping www.wizard.lab')).toMatch(/Pinging www\.wizard\.lab \[192\.168\.2\.100\] with 32 bytes of data:/);
    expect(run(sim, 'PC1', 'nslookup nothing.wizard.lab')).toMatch(/\*\*\* UnKnown can't find nothing\.wizard\.lab: Non-existent domain/);
    cfg(sim, 'R1', ['ip name-server 192.168.2.100', 'ip host CORE 10.0.12.2']);
    expect(show(sim, 'R1', 'ping www.wizard.lab')).toMatch(/Translating "www\.wizard\.lab"\.\.\.domain server \(192\.168\.2\.100\) \[OK\]/);
    expect(show(sim, 'R1', 'ping CORE')).toMatch(/Sending 5, 100-byte ICMP Echos to 10\.0\.12\.2/);
  });

  it('synchronizes NTP from a master', () => {
    const sim = net();
    expect(show(sim, 'R1', 'show ntp status')).toMatch(/^Clock is unsynchronized, stratum 16, no reference clock/);
    cfg(sim, 'R2', 'ntp master 3');
    cfg(sim, 'R1', 'ntp server 10.0.12.2');
    expect(show(sim, 'R1', 'show ntp status')).toMatch(/^Clock is synchronized, stratum 4, reference is 10\.0\.12\.2/);
    expect(show(sim, 'R1', 'show ntp associations')).toMatch(/^\*~10\.0\.12\.2/m);
    cfg(sim, 'R1', ['no ntp server 10.0.12.2', 'ntp server 192.168.2.100']);
    expect(show(sim, 'R1', 'show ntp status')).toMatch(/stratum 2, reference is 192\.168\.2\.100/);
  });

  it('elects HSRP active/standby and answers on the virtual IP', () => {
    const sim = build(
      [
        { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'interface g0/0/0\n ip address 192.168.1.2 255.255.255.0\n no shutdown' },
        { id: 'R2', model: 'isr4321', x: 2, y: 0, config: 'interface g0/0/0\n ip address 192.168.1.3 255.255.255.0\n no shutdown' },
        { id: 'SW1', model: 'c2960', x: 1, y: 1 },
        pc('PC1', '192.168.1.10', '192.168.1.1'),
      ],
      [
        { a: 'R1:g0/0/0', b: 'SW1:fa0/1' },
        { a: 'R2:g0/0/0', b: 'SW1:fa0/2' },
        { a: 'PC1:fa0', b: 'SW1:fa0/3' },
      ],
    );
    cfg(sim, 'R1', ['interface g0/0/0', 'standby 1 ip 192.168.1.1', 'standby 1 priority 110', 'standby 1 preempt']);
    cfg(sim, 'R2', ['interface g0/0/0', 'standby 1 ip 192.168.1.1']);
    expect(sim.check({ type: 'hsrp', device: 'R1', group: 1, state: 'Active', vip: '192.168.1.1' }).pass).toBe(true);
    expect(sim.check({ type: 'hsrp', device: 'R2', group: 1, state: 'Standby' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show standby brief')).toMatch(/^Gi0\/0\/0 +1 +110 P Active +local +192\.168\.1\.3 +192\.168\.1\.1$/m);
    expect(show(sim, 'R2', 'show standby')).toMatch(/Active virtual MAC address is 0000\.0c07\.ac01/);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.1.1' }).pass).toBe(true);
    // failover
    cfg(sim, 'R1', ['interface g0/0/0', 'shutdown']);
    expect(sim.check({ type: 'hsrp', device: 'R2', group: 1, state: 'Active' }).pass).toBe(true);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.1.1' }).pass).toBe(true);
    // preempt: R1 takes over again when it returns
    cfg(sim, 'R1', ['interface g0/0/0', 'no shutdown']);
    expect(sim.check({ type: 'hsrp', device: 'R1', group: 1, state: 'Active' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show logging')).toMatch(/%HSRP-5-STATECHANGE: GigabitEthernet0\/0\/0 Grp 1 state \w+ -> Active/);
  });

  it('keeps syslog messages in the buffer and records logging hosts', () => {
    const sim = net();
    cfg(sim, 'R1', ['logging host 192.168.2.100', 'logging trap warnings', 'interface g0/0/0', 'shutdown']);
    const log = show(sim, 'R1', 'show logging');
    expect(log).toMatch(/Trap logging: level warnings/);
    expect(log).toMatch(/Logging to 192\.168\.2\.100 {2}\(udp port 514/);
    expect(log).toMatch(/%LINK-5-CHANGED: Interface GigabitEthernet0\/0\/0, changed state to administratively down/);
    expect(show(sim, 'R1', 'show running-config')).toMatch(/^logging trap warnings\nlogging host 192\.168\.2\.100$/m);
  });
});
