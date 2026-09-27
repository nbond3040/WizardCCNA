import { describe, expect, it } from 'vitest';
import type { LabDevice, LabLink } from '../../content/labTypes';
import { build, cfg, pc, run, show } from './helpers';

const twoSwitches = (extra: LabDevice[] = [], links: LabLink[] = []) =>
  build(
    [
      { id: 'SW1', model: 'c2960', x: 0, y: 0 },
      { id: 'SW2', model: 'c2960', x: 2, y: 0 },
      pc('PC1', '192.168.10.11'),
      pc('PC2', '192.168.10.12'),
      ...extra,
    ],
    [{ a: 'SW1:g0/1', b: 'SW2:g0/1' }, { a: 'SW1:fa0/1', b: 'PC1:fa0' }, { a: 'SW2:fa0/1', b: 'PC2:fa0' }, ...links],
  );

const ping = (sim: ReturnType<typeof build>, from: string, to: string) => sim.check({ type: 'ping', from, to }).pass;

describe('VLANs and trunks', () => {
  it('isolates VLANs and carries them over an 802.1Q trunk', () => {
    const sim = twoSwitches();
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(true);
    for (const sw of ['SW1', 'SW2']) cfg(sim, sw, ['vlan 10', 'exit', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10']);
    // uplink still an access port in VLAN 1 → VLAN 10 cannot cross
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(false);
    cfg(sim, 'SW1', ['interface g0/1', 'switchport mode trunk']);
    expect(show(sim, 'SW2', 'show interfaces trunk')).toMatch(/^Gi0\/1\s+auto\s+802\.1q\s+trunking\s+1$/m);
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(true);
    cfg(sim, 'SW1', ['interface g0/1', 'switchport trunk allowed vlan 1,20']);
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(false);
    cfg(sim, 'SW1', ['interface g0/1', 'switchport trunk allowed vlan add 10']);
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(true);
    expect(sim.check({ type: 'switchport', device: 'SW1', iface: 'g0/1', mode: 'trunk', allowed: '1,10,20' }).pass).toBe(true);
  });

  it('creates missing access VLANs with the IOS message', () => {
    const sim = twoSwitches();
    const out = cfg(sim, 'SW1', ['interface fa0/1', 'switchport access vlan 30']);
    expect(out).toMatch(/% Access VLAN does not exist\. Creating vlan 30/);
    expect(sim.check({ type: 'vlan', device: 'SW1', vlan: 30, name: 'VLAN0030' }).pass).toBe(true);
    expect(show(sim, 'SW1', 'show vlan brief')).toMatch(/^30\s+VLAN0030\s+active\s+Fa0\/1$/m);
  });

  it('follows the DTP negotiation matrix', () => {
    const cases: [string, string, string][] = [
      ['dynamic auto', 'dynamic auto', 'access'],
      ['dynamic auto', 'dynamic desirable', 'trunk'],
      ['dynamic desirable', 'dynamic desirable', 'trunk'],
      ['trunk', 'dynamic auto', 'trunk'],
      ['access', 'dynamic desirable', 'access'],
    ];
    for (const [a, b, expected] of cases) {
      const sim = twoSwitches();
      cfg(sim, 'SW1', ['interface g0/1', `switchport mode ${a}`]);
      cfg(sim, 'SW2', ['interface g0/1', `switchport mode ${b}`]);
      const r = sim.check({ type: 'switchport', device: 'SW2', iface: 'g0/1', mode: expected as 'access' | 'trunk' });
      expect(r.pass, `${a} + ${b}: ${r.detail}`).toBe(true);
    }
    // nonegotiate on a static trunk stops DTP: the dynamic neighbour stays access
    const sim = twoSwitches();
    cfg(sim, 'SW1', ['interface g0/1', 'switchport mode trunk', 'switchport nonegotiate']);
    cfg(sim, 'SW2', ['interface g0/1', 'switchport mode dynamic desirable']);
    expect(sim.check({ type: 'switchport', device: 'SW2', iface: 'g0/1', mode: 'access' }).pass).toBe(true);
    expect(cfg(sim, 'SW2', ['interface g0/1', 'switchport nonegotiate'])).toMatch(/Command rejected: Conflict between 'nonegotiate' and 'dynamic' status/);
  });

  it('detects a native VLAN mismatch (CDP) and merges the native VLANs', () => {
    const sim = twoSwitches();
    cfg(sim, 'SW1', ['interface g0/1', 'switchport mode trunk', 'switchport trunk native vlan 99']);
    cfg(sim, 'SW2', ['interface g0/1', 'switchport mode trunk']);
    expect(show(sim, 'SW1', 'show logging')).toMatch(/%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \(99\), with SW\d GigabitEthernet0\/1 \(1\)/);
    // PC1 in VLAN 99 on SW1 reaches PC2 in VLAN 1 on SW2 because untagged frames change VLAN
    cfg(sim, 'SW1', ['interface fa0/1', 'switchport mode access', 'switchport access vlan 99']);
    expect(ping(sim, 'PC1', '192.168.10.12')).toBe(true);
  });

  it('brings an SVI up only when its VLAN has an active port', () => {
    const sim = twoSwitches();
    cfg(sim, 'SW1', ['interface vlan 10', 'ip address 192.168.10.2 255.255.255.0', 'no shutdown']);
    expect(show(sim, 'SW1', 'show ip interface brief')).toMatch(/^Vlan10\s+192\.168\.10\.2\s+YES manual down\s+down$/m);
    cfg(sim, 'SW1', ['vlan 10', 'exit']);
    expect(show(sim, 'SW1', 'show ip interface brief')).toMatch(/^Vlan10\s+192\.168\.10\.2\s+YES manual up\s+down$/m);
    cfg(sim, 'SW1', ['interface fa0/1', 'switchport access vlan 10']);
    expect(sim.check({ type: 'interface', device: 'SW1', iface: 'vlan10', status: 'up' }).pass).toBe(true);
    expect(ping(sim, 'PC1', '192.168.10.2')).toBe(true);
  });
});

describe('inter-VLAN routing', () => {
  it('routes between VLANs with router-on-a-stick', () => {
    const sim = build(
      [
        { id: 'R1', model: 'isr4321', x: 0, y: 0 },
        { id: 'SW1', model: 'c2960', x: 1, y: 0 },
        pc('PC1', '192.168.10.10', '192.168.10.1'),
        pc('PC2', '192.168.20.10', '192.168.20.1'),
      ],
      [{ a: 'R1:g0/0/0', b: 'SW1:g0/1' }, { a: 'SW1:fa0/1', b: 'PC1:fa0' }, { a: 'SW1:fa0/2', b: 'PC2:fa0' }],
    );
    cfg(sim, 'SW1', ['vlan 10', 'vlan 20', 'exit', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'interface g0/1', 'switchport mode trunk']);
    expect(ping(sim, 'PC1', '192.168.20.10')).toBe(false);
    cfg(sim, 'R1', ['interface g0/0/0', 'no shutdown', 'interface g0/0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0', 'interface g0/0/0.20', 'encapsulation dot1Q 20', 'ip address 192.168.20.1 255.255.255.0']);
    expect(ping(sim, 'PC1', '192.168.20.10')).toBe(true);
    const tr = sim.tracePing('PC1', 'PC2');
    expect(tr.success).toBe(true);
    expect(tr.forward.map((h) => h.device)).toContain('R1');
    expect(show(sim, 'R1', 'show ip route connected')).toMatch(/C +192\.168\.20\.0\/24 is directly connected, GigabitEthernet0\/0\/0\.20/);
  });

  it('routes between SVIs on a Layer 3 switch only after ip routing', () => {
    const sim = build(
      [{ id: 'DSW1', model: 'c3650', x: 0, y: 0 }, pc('PC1', '192.168.10.10', '192.168.10.1'), pc('PC2', '192.168.20.10', '192.168.20.1')],
      [{ a: 'DSW1:g1/0/1', b: 'PC1:fa0' }, { a: 'DSW1:g1/0/2', b: 'PC2:fa0' }],
    );
    cfg(sim, 'DSW1', ['vlan 10', 'vlan 20', 'exit', 'interface g1/0/1', 'switchport access vlan 10', 'interface g1/0/2', 'switchport access vlan 20', 'interface vlan 10', 'ip address 192.168.10.1 255.255.255.0', 'interface vlan 20', 'ip address 192.168.20.1 255.255.255.0']);
    expect(ping(sim, 'PC1', '192.168.10.1')).toBe(true);
    expect(ping(sim, 'PC1', '192.168.20.10')).toBe(false);
    cfg(sim, 'DSW1', 'ip routing');
    expect(ping(sim, 'PC1', '192.168.20.10')).toBe(true);
    // routed port
    const out = cfg(sim, 'DSW1', ['interface g1/0/24', 'no switchport', 'ip address 10.0.0.1 255.255.255.252']);
    expect(out).not.toMatch(/Invalid/);
    expect(show(sim, 'DSW1', 'show running-config interface g1/0/24')).toMatch(/ no switchport\n ip address 10\.0\.0\.1 255\.255\.255\.252/);
  });

  it('requires the trunk encapsulation command on the c3650 before trunk mode', () => {
    const sim = build([{ id: 'DSW1', model: 'c3650', x: 0, y: 0 }]);
    expect(cfg(sim, 'DSW1', ['interface g1/0/1', 'switchport mode trunk'])).toMatch(/Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode\./);
    expect(cfg(sim, 'DSW1', ['interface g1/0/1', 'switchport trunk encapsulation dot1q', 'switchport mode trunk']).trim()).toBe('');
    expect(show(sim, 'DSW1', 'show interfaces g1/0/1 switchport')).toMatch(/Administrative Mode: trunk\nOperational Mode: down\nAdministrative Trunking Encapsulation: dot1q/);
  });
});

describe('port security', () => {
  it('learns sticky MACs and err-disables on violation', () => {
    const sim = build([{ id: 'SW1', model: 'c2960', x: 0, y: 0 }, pc('PC1', '10.1.1.10'), pc('PC2', '10.1.1.20')], [
      { a: 'SW1:fa0/1', b: 'PC1:fa0' },
      { a: 'SW1:fa0/2', b: 'PC2:fa0' },
    ]);
    expect(cfg(sim, 'SW1', ['interface fa0/1', 'switchport port-security'])).toMatch(/Command rejected: FastEthernet0\/1 is a dynamic port\./);
    cfg(sim, 'SW1', ['interface fa0/1', 'switchport mode access', 'switchport port-security', 'switchport port-security mac-address sticky']);
    run(sim, 'PC1', 'ping 10.1.1.20');
    expect(sim.check({ type: 'config', device: 'SW1', section: 'interface FastEthernet0/1', pattern: '^ switchport port-security mac-address sticky [0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4}$' }).pass).toBe(true);
    expect(show(sim, 'SW1', 'show port-security interface fa0/1')).toMatch(/Port Status\s+: Secure-up/);
    // a different host behind the same port: static wrong MAC with maximum 1 → violation
    cfg(sim, 'SW1', ['interface fa0/2', 'switchport mode access', 'switchport port-security', 'switchport port-security mac-address 0000.1111.2222']);
    const out = run(sim, 'PC2', 'ping 10.1.1.10');
    expect(out).toMatch(/Request timed out|Destination host unreachable/);
    const logs = run(sim, 'SW1', '');
    expect(logs).toMatch(/%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0\/2, putting Fa0\/2 in err-disable state/);
    expect(sim.check({ type: 'interface', device: 'SW1', iface: 'fa0/2', status: 'up' }).detail).toMatch(/is err-disabled \(psecure-violation\)/);
    expect(show(sim, 'SW1', 'show interfaces status')).toMatch(/^Fa0\/2\s+err-disabled/m);
    // recover with shutdown / no shutdown after removing the wrong MAC
    cfg(sim, 'SW1', ['interface fa0/2', 'no switchport port-security mac-address 0000.1111.2222', 'shutdown', 'no shutdown']);
    expect(sim.check({ type: 'ping', from: 'PC2', to: '10.1.1.10' }).pass).toBe(true);
  });
});

describe('spanning tree', () => {
  const triangle = () =>
    build(
      [
        { id: 'SW1', model: 'c2960', x: 0, y: 0 },
        { id: 'SW2', model: 'c2960', x: 2, y: 0 },
        { id: 'SW3', model: 'c2960', x: 1, y: 2 },
      ],
      [
        { a: 'SW1:g0/1', b: 'SW2:g0/1' },
        { a: 'SW1:g0/2', b: 'SW3:g0/1' },
        { a: 'SW2:g0/2', b: 'SW3:g0/2' },
      ],
    );

  it('elects the lowest bridge ID as root and blocks exactly one port', () => {
    const sim = triangle();
    cfg(sim, 'SW3', 'spanning-tree vlan 1 priority 4096');
    expect(sim.check({ type: 'stpRoot', vlan: 1, device: 'SW3' }).pass).toBe(true);
    expect(show(sim, 'SW3', 'show spanning-tree')).toMatch(/This bridge is the root/);
    const blocked = sim.links().filter((l) => l.aBlocked || l.bBlocked);
    expect(blocked.length).toBe(1);
    expect(blocked[0].a.device === 'SW3' || blocked[0].b.device === 'SW3').toBe(false);
    // SW1-SW2 link: the switch with the higher bridge ID blocks its port
    const swA = sim.check({ type: 'stpPort', device: 'SW1', vlan: 1, iface: 'g0/1', role: 'alternate', state: 'blocking' }).pass;
    const swB = sim.check({ type: 'stpPort', device: 'SW2', vlan: 1, iface: 'g0/1', role: 'alternate', state: 'blocking' }).pass;
    expect(swA !== swB).toBe(true);
    expect(sim.check({ type: 'stpPort', device: 'SW1', vlan: 1, iface: 'g0/2', role: 'root', state: 'forwarding' }).pass).toBe(true);
  });

  it('uses root primary/secondary macros and port cost', () => {
    const sim = triangle();
    cfg(sim, 'SW1', 'spanning-tree vlan 1 root primary');
    cfg(sim, 'SW2', 'spanning-tree vlan 1 root secondary');
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/^spanning-tree vlan 1 priority 24576$/m);
    expect(sim.check({ type: 'stpRoot', vlan: 1, device: 'SW1' }).pass).toBe(true);
    // SW3 reaches the root directly (cost 4) — make it prefer SW2 by raising the direct cost
    cfg(sim, 'SW3', ['interface g0/1', 'spanning-tree cost 100']);
    expect(sim.check({ type: 'stpPort', device: 'SW3', vlan: 1, iface: 'g0/2', role: 'root' }).pass).toBe(true);
    expect(show(sim, 'SW3', 'show spanning-tree')).toMatch(/Root ID\s+Priority\s+24577[\s\S]*Cost\s+8\n\s+Port\s+26 \(GigabitEthernet0\/2\)/);
  });

  it('err-disables a BPDU guard port that hears a switch', () => {
    const sim = triangle();
    const out = cfg(sim, 'SW1', ['interface g0/1', 'spanning-tree portfast', 'spanning-tree bpduguard enable']);
    expect(out + run(sim, 'SW1', '')).toMatch(/%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port GigabitEthernet0\/1 with BPDU Guard enabled\. Disabling port\./);
    expect(sim.devices().find((d) => d.id === 'SW1')!.interfaces.find((i) => i.name === 'GigabitEthernet0/1')!.status).toBe('err-disabled');
  });

  it('shows rapid-pvst and summary output', () => {
    const sim = triangle();
    cfg(sim, 'SW1', 'spanning-tree mode rapid-pvst');
    expect(show(sim, 'SW1', 'show spanning-tree')).toMatch(/Spanning tree enabled protocol rstp/);
    expect(show(sim, 'SW1', 'show spanning-tree summary')).toMatch(/Switch is in rapid-pvst mode/);
  });
});

describe('EtherChannel', () => {
  const pair = () =>
    build(
      [
        { id: 'SW1', model: 'c2960', x: 0, y: 0 },
        { id: 'SW2', model: 'c2960', x: 2, y: 0 },
      ],
      [
        { a: 'SW1:fa0/23', b: 'SW2:fa0/23' },
        { a: 'SW1:fa0/24', b: 'SW2:fa0/24' },
      ],
    );

  it('bundles LACP active/passive members into a Port-channel', () => {
    const sim = pair();
    const out = cfg(sim, 'SW1', ['interface range fa0/23 - 24', 'channel-group 1 mode active']);
    expect(out).toMatch(/Creating a port-channel interface Port-channel 1/);
    expect(sim.check({ type: 'etherchannel', device: 'SW1', group: 1, up: true }).pass).toBe(false);
    cfg(sim, 'SW2', ['interface range fa0/23 - 24', 'channel-group 1 mode passive']);
    expect(sim.check({ type: 'etherchannel', device: 'SW1', group: 1, protocol: 'lacp', up: true, members: 2 }).pass).toBe(true);
    expect(show(sim, 'SW1', 'show etherchannel summary')).toMatch(/^1\s+Po1\(SU\)\s+LACP\s+Fa0\/23\(P\)\s+Fa0\/24\(P\)/m);
    // STP now sees a single logical port: nothing is blocked
    expect(sim.links().some((l) => l.aBlocked || l.bBlocked)).toBe(false);
    // trunk configured on the Port-channel propagates to the members
    cfg(sim, 'SW1', ['interface port-channel 1', 'switchport mode trunk']);
    expect(show(sim, 'SW1', 'show running-config interface fa0/23')).toMatch(/switchport mode trunk/);
    expect(show(sim, 'SW2', 'show interfaces trunk')).toMatch(/^Po1\s+auto\s+802\.1q\s+trunking\s+1$/m);
  });

  it('does not bundle passive/passive or mismatched protocols', () => {
    const sim = pair();
    cfg(sim, 'SW1', ['interface range fa0/23 - 24', 'channel-group 1 mode passive']);
    cfg(sim, 'SW2', ['interface range fa0/23 - 24', 'channel-group 1 mode passive']);
    expect(sim.check({ type: 'etherchannel', device: 'SW1', group: 1, up: true }).pass).toBe(false);
    expect(show(sim, 'SW1', 'show etherchannel summary')).toMatch(/Fa0\/23\(I\)/);
    const sim2 = pair();
    cfg(sim2, 'SW1', ['interface range fa0/23 - 24', 'channel-group 1 mode desirable']);
    cfg(sim2, 'SW2', ['interface range fa0/23 - 24', 'channel-group 1 mode desirable']);
    expect(sim2.check({ type: 'etherchannel', device: 'SW2', group: 1, protocol: 'pagp', up: true, members: 2 }).pass).toBe(true);
    const sim3 = pair();
    cfg(sim3, 'SW1', ['interface range fa0/23 - 24', 'channel-group 2 mode on']);
    cfg(sim3, 'SW2', ['interface range fa0/23 - 24', 'channel-group 2 mode on']);
    expect(sim3.check({ type: 'etherchannel', device: 'SW1', group: 2, protocol: 'on', members: 2 }).pass).toBe(true);
  });

  it('suspends a member whose configuration differs from the bundle', () => {
    const sim = pair();
    cfg(sim, 'SW1', ['interface range fa0/23 - 24', 'channel-group 1 mode active']);
    cfg(sim, 'SW2', ['interface range fa0/23 - 24', 'channel-group 1 mode active']);
    cfg(sim, 'SW1', ['interface fa0/24', 'switchport access vlan 5']);
    expect(show(sim, 'SW1', 'show etherchannel summary')).toMatch(/Fa0\/24\(s\)/);
    expect(sim.check({ type: 'etherchannel', device: 'SW1', group: 1, members: 1 }).pass).toBe(true);
  });
});

describe('MAC learning, CDP and LLDP', () => {
  it('learns MAC addresses from traffic and lists CDP/LLDP neighbours', () => {
    const sim = twoSwitches([{ id: 'R1', model: 'isr4321', x: 1, y: 1 }], [{ a: 'R1:g0/0/0', b: 'SW1:g0/2' }]);
    run(sim, 'PC1', 'ping 192.168.10.12');
    const mac = show(sim, 'SW1', 'show mac address-table dynamic');
    expect(mac).toMatch(/^ {3}1 {4}[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4} {4}DYNAMIC {5}Fa0\/1$/m);
    expect(mac).toMatch(/DYNAMIC {5}Gi0\/1$/m);
    cfg(sim, 'R1', ['interface g0/0/0', 'no shutdown']);
    const cdp = show(sim, 'SW1', 'show cdp neighbors');
    expect(cdp).toMatch(/^SW2 {14}Gig 0\/1 {11}\d{3} {16}S I WS-C2960- Gig 0\/1$/m);
    expect(cdp).toMatch(/^R1 {15}Gig 0\/2 {11}\d{3} {12}R B S I ISR4321\/K Gig 0\/0\/0$/m);
    expect(cdp).toMatch(/^R1 {15}Gig 0\/2/m);
    expect(show(sim, 'SW1', 'show lldp neighbors')).toBe('% LLDP is not enabled');
    cfg(sim, 'SW1', 'lldp run');
    cfg(sim, 'SW2', 'lldp run');
    expect(show(sim, 'SW1', 'show lldp neighbors')).toMatch(/^SW2 +Gi0\/1 +120 +B +Gi0\/1$/m);
  });
});
