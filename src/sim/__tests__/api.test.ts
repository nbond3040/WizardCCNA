import { describe, expect, it } from 'vitest';
import { NetworkSim } from '../index';
import type { LabDevice, LabLink } from '../../content/labTypes';
import { cfg, pc, run, show } from './helpers';

const devices: LabDevice[] = [
  { id: 'R1', model: 'isr2911', x: 1, y: 1, config: 'interface g0/0\n ip address 10.1.1.1 255.255.255.0\n no shutdown' },
  { id: 'SW1', model: 'c2960', x: 3, y: 1 },
  pc('PC1', '10.1.1.10', '10.1.1.1'),
  { id: 'NET', model: 'cloud', x: 5, y: 1, cloudIp: '8.8.8.8' },
];
const links: LabLink[] = [
  { a: 'R1:g0/0', b: 'SW1:g0/1' },
  { a: 'SW1:fa0/1', b: 'PC1:fa0' },
  { a: 'R1:g0/1', b: 'NET:e0' },
];

describe('public API', () => {
  it('describes devices and links', () => {
    const sim = new NetworkSim({ devices, links });
    const d = sim.devices();
    expect(d.map((x) => [x.id, x.kind])).toEqual([
      ['R1', 'router'],
      ['SW1', 'switch'],
      ['PC1', 'host'],
      ['NET', 'cloud'],
    ]);
    const r1 = d.find((x) => x.id === 'R1')!;
    expect(r1.interfaces[0]).toEqual({ name: 'GigabitEthernet0/0', short: 'Gi0/0', status: 'up', linkedTo: { device: 'SW1', iface: 'GigabitEthernet0/1' } });
    expect(r1.interfaces.find((i) => i.name === 'GigabitEthernet0/1')!.status).toBe('admin-down');
    const l = sim.links();
    expect(l.length).toBe(3);
    expect(l[0]).toMatchObject({ id: 'L1', type: 'copper', status: 'up', aBlocked: false, bBlocked: false });
    expect(l[2].status).toBe('down');
    cfg(sim, 'R1', 'hostname EDGE');
    expect(sim.devices()[0].hostname).toBe('EDGE');
  });

  it('notifies subscribers after state changes', () => {
    const sim = new NetworkSim({ devices, links });
    let n = 0;
    const off = sim.subscribe(() => n++);
    run(sim, 'R1', ['enable', 'configure terminal', 'hostname X']);
    expect(n).toBeGreaterThan(0);
    const before = n;
    sim.check({ type: 'ping', from: 'PC1', to: '10.1.1.1' });
    expect(n).toBe(before);
    off();
    run(sim, 'R1', 'hostname Y');
    expect(n).toBe(before);
  });

  it('round-trips through snapshots', () => {
    const sim = new NetworkSim({ devices, links });
    cfg(sim, 'R1', ['interface g0/1', 'ip address 8.8.8.1 255.255.255.0', 'no shutdown', 'exit', 'enable secret class']);
    cfg(sim, 'SW1', ['vlan 20', 'name DATA']);
    run(sim, 'PC1', 'ping 8.8.8.8');
    const snap = JSON.parse(JSON.stringify(sim.snapshot()));
    const copy = NetworkSim.fromSnapshot({ devices, links }, snap);
    expect(copy.runningConfig('R1')).toBe(sim.runningConfig('R1'));
    expect(copy.check({ type: 'vlan', device: 'SW1', vlan: 20, name: 'DATA' }).pass).toBe(true);
    expect(copy.check({ type: 'ping', from: 'PC1', to: '8.8.8.8' }).pass).toBe(true);
    expect(show(copy, 'SW1', 'show mac address-table dynamic')).toMatch(/DYNAMIC/);
  });

  it('traces pings hop by hop', () => {
    const sim = new NetworkSim({ devices, links });
    cfg(sim, 'R1', ['interface g0/1', 'ip address 8.8.8.1 255.255.255.0', 'no shutdown']);
    const t = sim.tracePing('PC1', 'NET');
    expect(t.success).toBe(true);
    expect(t.summary).toBe('Reply from 8.8.8.8');
    expect(t.forward.some((h) => /ARP for 10\.1\.1\.1/.test(h.action))).toBe(true);
    expect(t.forward.some((h) => h.device === 'SW1' && /Switched in VLAN 1/.test(h.action))).toBe(true);
    expect(t.reply.at(-1)!.action).toMatch(/Delivered to PC1/);
    const bad = sim.tracePing('PC1', '172.16.9.9');
    expect(bad.success).toBe(false);
  });

  it('never throws from checks and explains failures', () => {
    const sim = new NetworkSim({ devices, links });
    expect(sim.check({ type: 'interface', device: 'NOPE', iface: 'x' })).toEqual({ pass: false, detail: 'Unknown device NOPE' });
    expect(sim.check({ type: 'config', device: 'R1', pattern: '(' }).pass).toBe(false);
    expect(sim.check({ type: 'route', device: 'R1', prefix: 'garbage' }).pass).toBe(false);
    expect(sim.check({ type: 'switchport', device: 'SW1', iface: 'fa0/5', accessVlan: 10 }).detail).toBe('SW1 Fa0/5 is in VLAN 1, expected 10');
    cfg(sim, 'SW1', ['vlan 20', 'exit']);
    expect(sim.check({ type: 'vlan', device: 'SW1', vlan: 20, name: 'ENGINEERING' }).detail).toBe('VLAN 20 exists but is named VLAN0020 (expected ENGINEERING)');
  });

  it('re-applies its own running-config to an identical configuration', () => {
    const sim = new NetworkSim({ devices, links });
    cfg(sim, 'R1', [
      'hostname CORE',
      'enable secret class',
      'service password-encryption',
      'username admin privilege 15 secret cisco',
      'ip domain-name wizard.lab',
      'no ip domain-lookup',
      'banner motd #Keep out#',
      'interface loopback 0',
      'ip address 1.1.1.1 255.255.255.255',
      'interface g0/0',
      'description LAN',
      'ip ospf cost 5',
      'ip helper-address 10.9.9.9',
      'ip nat inside',
      'interface g0/1.10',
      'encapsulation dot1Q 10',
      'ip address 172.16.10.1 255.255.255.0',
      'router ospf 1',
      'router-id 1.1.1.1',
      'network 10.1.1.0 0.0.0.255 area 0',
      'passive-interface g0/0',
      'exit',
      'ip route 0.0.0.0 0.0.0.0 10.1.1.254',
      'ip access-list extended OUT',
      'deny tcp any any eq 23',
      'permit ip any any',
      'exit',
      'access-list 1 permit 10.1.1.0 0.0.0.255',
      'ip nat inside source list 1 interface g0/1 overload',
      'line con 0',
      'password cisco',
      'login',
      'line vty 0 4',
      'login local',
      'transport input ssh',
    ]);
    cfg(sim, 'SW1', ['vtp mode transparent', 'vlan 10', 'name USERS', 'exit', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'switchport port-security', 'switchport port-security maximum 2', 'spanning-tree portfast', 'interface g0/1', 'switchport mode trunk', 'switchport trunk native vlan 99', 'switchport trunk allowed vlan 10,99', 'exit', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 10 priority 4096']);
    for (const id of ['R1', 'SW1']) {
      const text = sim.runningConfig(id);
      const fresh = new NetworkSim({ devices: devices.map((d) => (d.id === id ? { ...d, config: text } : d)), links });
      const strip = (s: string) => s.split('\n').filter((l) => !/^(Current configuration|! Last configuration change|! NVRAM config)/.test(l)).join('\n');
      expect(strip(fresh.runningConfig(id))).toBe(strip(text));
      expect(fresh.configErrors()).toEqual([]);
    }
  });
});
