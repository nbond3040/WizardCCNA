import { describe, expect, it } from 'vitest';
import { build, cfg, show } from './helpers';

/** R1 —(10.0.12.0/30)— R2, each with a loopback. */
const pair = () =>
  build(
    [
      { id: 'PC1', model: 'pc', x: 0, y: 1, host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
      { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'interface g0/0/0\n ip address 10.0.12.1 255.255.255.252\n no shutdown\ninterface loopback 0\n ip address 1.1.1.1 255.255.255.255\ninterface g0/0/1\n ip address 192.168.1.1 255.255.255.0\n no shutdown' },
      { id: 'R2', model: 'isr4321', x: 2, y: 0, config: 'interface g0/0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface loopback 0\n ip address 2.2.2.2 255.255.255.255' },
    ],
    [{ a: 'R1:g0/0/0', b: 'R2:g0/0/0' }, { a: 'R1:g0/0/1', b: 'PC1:fa0' }],
  );

/** Three routers on a shared switch segment. */
const segment = () =>
  build(
    [
      { id: 'SW1', model: 'c2960', x: 1, y: 0 },
      ...[1, 2, 3].map((n) => ({ id: `R${n}`, model: 'isr4321' as const, x: n, y: 2, config: `interface g0/0/0\n ip address 10.0.0.${n} 255.255.255.0\n no shutdown\ninterface loopback 0\n ip address ${n}.${n}.${n}.${n} 255.255.255.255` })),
    ],
    [1, 2, 3].map((n) => ({ a: `R${n}:g0/0/0`, b: `SW1:fa0/${n}` })),
  );

describe('OSPF adjacencies', () => {
  it('forms FULL adjacencies and installs routes', () => {
    const sim = pair();
    const log1 = cfg(sim, 'R1', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 1.1.1.1 0.0.0.0 area 0', 'network 192.168.1.0 0.0.0.255 area 0']);
    expect(log1).not.toMatch(/ADJCHG/);
    const log2 = cfg(sim, 'R2', ['router ospf 1', 'network 0.0.0.0 255.255.255.255 area 0']);
    expect(log2).toMatch(/%OSPF-5-ADJCHG: Process 1, Nbr 1\.1\.1\.1 on GigabitEthernet0\/0\/0 from LOADING to FULL, Loading Done/);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R2', neighbor: '1.1.1.1', state: 'FULL' }).pass).toBe(true);
    const nb = show(sim, 'R1', 'show ip ospf neighbor');
    expect(nb).toMatch(/^Neighbor ID {5}Pri {3}State {11}Dead Time {3}Address {9}Interface$/m);
    expect(nb).toMatch(/^2\.2\.2\.2 {11}1 {3}FULL\/(DR {6}|BDR {5}) {3}00:00:\d\d {4}10\.0\.12\.2 {7}GigabitEthernet0\/0\/0$/m);
    expect(sim.check({ type: 'route', device: 'R2', prefix: '192.168.1.0/24', source: 'O', nextHop: '10.0.12.1' }).pass).toBe(true);
    expect(sim.check({ type: 'route', device: 'R2', prefix: '1.1.1.1/32', source: 'O' }).pass).toBe(true);
    expect(show(sim, 'R2', 'show ip route ospf')).toMatch(/^O {8}192\.168\.1\.0 \[110\/2\] via 10\.0\.12\.1, \d\d:\d\d:\d\d, GigabitEthernet0\/0\/0$/m);
    expect(sim.check({ type: 'ospfRouterId', device: 'R1', rid: '1.1.1.1' }).pass).toBe(true);
  });

  it('refuses adjacencies on area, timer, subnet and passive mismatches', () => {
    const base = () => {
      const sim = pair();
      cfg(sim, 'R1', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0']);
      return sim;
    };
    let sim = base();
    cfg(sim, 'R2', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 1']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2' }).pass).toBe(false);
    sim = base();
    cfg(sim, 'R2', ['interface g0/0/0', 'ip ospf hello-interval 5', 'exit', 'router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2' }).pass).toBe(false);
    sim = base();
    cfg(sim, 'R2', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'passive-interface g0/0/0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2' }).pass).toBe(false);
    sim = base();
    cfg(sim, 'R2', ['interface g0/0/0', 'ip address 10.0.12.2 255.255.255.0', 'exit', 'router ospf 1', 'network 10.0.12.0 0.0.0.255 area 0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2' }).pass).toBe(false);
    sim = base();
    cfg(sim, 'R2', ['router ospf 1', 'router-id 1.1.1.1', 'network 10.0.12.0 0.0.0.3 area 0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '10.0.12.2' }).pass).toBe(false);
    expect(show(sim, 'R2', 'show logging')).toMatch(/%OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 1\.1\.1\.1 from 10\.0\.12\.1 on interface GigabitEthernet0\/0\/0/);
    // interface-mode configuration works like a network statement
    sim = base();
    cfg(sim, 'R2', ['interface g0/0/0', 'ip ospf 1 area 0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', state: 'FULL' }).pass).toBe(true);
  });

  it('selects router IDs and needs clear ip ospf process to change them', () => {
    const sim = pair();
    cfg(sim, 'R1', ['interface loopback 1', 'ip address 9.9.9.9 255.255.255.255', 'exit', 'router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0']);
    expect(sim.check({ type: 'ospfRouterId', device: 'R1', rid: '9.9.9.9' }).pass).toBe(true);
    cfg(sim, 'R2', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0']);
    const out = cfg(sim, 'R1', ['router ospf 1', 'router-id 1.1.1.1']);
    expect(out).toMatch(/% OSPF: Reload or use "clear ip ospf process" command, for this to take effect/);
    const r = sim.check({ type: 'ospfRouterId', device: 'R1', rid: '1.1.1.1' });
    expect(r.pass).toBe(false);
    expect(r.detail).toMatch(/clear ip ospf process/);
    const t = sim.terminal('R1');
    t.execute('clear ip ospf process');
    expect(t.prompt()).toBe('Reset ALL OSPF processes? [no]: ');
    t.execute('yes');
    expect(sim.check({ type: 'ospfRouterId', device: 'R1', rid: '1.1.1.1' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R2', neighbor: '1.1.1.1', state: 'FULL' }).pass).toBe(true);
  });

  it('uses point-to-point on serial links and reference bandwidth for cost', () => {
    const sim = build(
      [
        { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'interface s0/1/0\n ip address 10.1.1.1 255.255.255.252\n no shutdown' },
        { id: 'R2', model: 'isr4321', x: 2, y: 0, config: 'interface s0/1/0\n ip address 10.1.1.2 255.255.255.252\n no shutdown\ninterface loopback 0\n ip address 2.2.2.2 255.255.255.0' },
      ],
      [{ a: 'R1:s0/1/0', b: 'R2:s0/1/0', type: 'serial' }],
    );
    cfg(sim, 'R1', ['router ospf 1', 'network 10.0.0.0 0.255.255.255 area 0']);
    cfg(sim, 'R2', ['router ospf 1', 'network 0.0.0.0 255.255.255.255 area 0']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', state: 'FULL' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show ip ospf neighbor')).toMatch(/FULL\/ {2}- /);
    expect(show(sim, 'R1', 'show ip ospf interface brief')).toMatch(/^Se0\/1\/0 +1 +0 +10\.1\.1\.1\/30 +64 +P2P +1\/1$/m);
    // loopback advertised as a /32 host route
    expect(sim.check({ type: 'route', device: 'R1', prefix: '2.2.2.2/32', source: 'O' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show ip route ospf')).toMatch(/\[110\/65\]/);
    const out = cfg(sim, 'R1', ['router ospf 1', 'auto-cost reference-bandwidth 1000']);
    expect(out).toMatch(/% OSPF: Reference bandwidth is changed\./);
    expect(show(sim, 'R1', 'show ip ospf interface brief')).toMatch(/ 647 +P2P/);
  });
});

describe('DR/BDR election', () => {
  it('elects by priority then router ID when routers start together', () => {
    const sim = build(
      [
        { id: 'SW1', model: 'c2960', x: 1, y: 0 },
        ...[1, 2, 3].map((n) => ({ id: `R${n}`, model: 'isr4321' as const, x: n, y: 2, config: `interface g0/0/0\n ip address 10.0.0.${n} 255.255.255.0\n no shutdown\ninterface loopback 0\n ip address ${n}.${n}.${n}.${n} 255.255.255.255\nrouter ospf 1\n network 10.0.0.0 0.0.0.255 area 0` })),
      ],
      [1, 2, 3].map((n) => ({ a: `R${n}:g0/0/0`, b: `SW1:fa0/${n}` })),
    );
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', state: 'FULL', role: 'DR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', state: 'FULL', role: 'BDR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R2', neighbor: '1.1.1.1', state: 'FULL', role: 'DROTHER' }).pass).toBe(true);
  });

  it('is non-preemptive and re-elects after clear ip ospf process', () => {
    const sim = segment();
    for (const n of [1, 2, 3]) cfg(sim, `R${n}`, ['router ospf 1', 'network 10.0.0.0 0.0.0.255 area 0']);
    // R1 came up first → DR; R2 → BDR; R3 (highest RID) is DROTHER
    expect(sim.check({ type: 'ospfNeighbor', device: 'R3', neighbor: '1.1.1.1', role: 'DR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R3', neighbor: '2.2.2.2', role: 'BDR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', state: 'FULL', role: 'DROTHER' }).pass).toBe(true);
    // DROTHERs stay 2WAY with each other: add a 4th router
    cfg(sim, 'R3', ['interface g0/0/0', 'ip ospf priority 200']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R3', neighbor: '1.1.1.1', role: 'DR' }).pass).toBe(true);
    // clearing the DR promotes the BDR; R3 (priority 200) becomes the new BDR
    const t = sim.terminal('R1');
    run1(t, ['enable', 'clear ip ospf process', 'yes']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', role: 'DR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', role: 'BDR' }).pass).toBe(true);
    const r2 = sim.terminal('R2');
    run1(r2, ['clear ip ospf process', 'yes']);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', role: 'DR' }).pass).toBe(true);
    const oi = show(sim, 'R3', 'show ip ospf interface g0/0/0');
    expect(oi).toMatch(/State DR, Priority 200/);
    expect(oi).toMatch(/Designated Router \(ID\) 3\.3\.3\.3, Interface address 10\.0\.0\.3/);
  });

  it('keeps priority-0 routers out of the election and DROTHERs in 2WAY', () => {
    const sim = build(
      [
        { id: 'SW1', model: 'c2960', x: 1, y: 0 },
        ...[1, 2, 3, 4].map((n) => ({ id: `R${n}`, model: 'isr4321' as const, x: n, y: 2, config: `interface g0/0/0\n ip address 10.0.0.${n} 255.255.255.0\n no shutdown\n${n === 4 ? ' ip ospf priority 0\n' : ''}router ospf 1\n router-id ${n}.${n}.${n}.${n}\n network 10.0.0.0 0.0.0.255 area 0` })),
      ],
      [1, 2, 3, 4].map((n) => ({ a: `R${n}:g0/0/0`, b: `SW1:fa0/${n}` })),
    );
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '4.4.4.4', state: 'FULL' }).pass).toBe(false);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '3.3.3.3', role: 'DR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '2.2.2.2', role: 'BDR' }).pass).toBe(true);
    expect(sim.check({ type: 'ospfNeighbor', device: 'R1', neighbor: '4.4.4.4', state: '2WAY' }).pass).toBe(true);
    expect(show(sim, 'R4', 'show ip ospf interface brief')).toMatch(/DROTH +3\/3/);
    expect(show(sim, 'R1', 'show ip ospf neighbor')).toMatch(/^4\.4\.4\.4 {11}0 {3}2WAY\/DROTHER/m);
  });
});

describe('OSPF features', () => {
  it('originates a default route and honours passive interfaces', () => {
    const sim = pair();
    cfg(sim, 'R1', ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 192.168.1.0 0.0.0.255 area 0', 'passive-interface g0/0/1']);
    cfg(sim, 'R2', ['ip route 0.0.0.0 0.0.0.0 Null0', 'router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'default-information originate']);
    expect(sim.check({ type: 'route', device: 'R1', prefix: '0.0.0.0/0', source: 'O*E2', nextHop: '10.0.12.2' }).pass).toBe(true);
    expect(show(sim, 'R1', 'show ip route')).toMatch(/^O\*E2 {2}0\.0\.0\.0\/0 \[110\/1\] via 10\.0\.12\.2, \d\d:\d\d:\d\d, GigabitEthernet0\/0\/0$/m);
    expect(sim.check({ type: 'route', device: 'R2', prefix: '192.168.1.0/24', source: 'O' }).pass).toBe(true);
    const proto = show(sim, 'R1', 'show ip protocols');
    expect(proto).toMatch(/Routing Protocol is "ospf 1"/);
    expect(proto).toMatch(/Passive Interface\(s\):\n {4}GigabitEthernet0\/0\/1/);
    expect(proto).toMatch(/Routing for Networks:\n {4}10\.0\.12\.0 0\.0\.0\.3 area 0\n {4}192\.168\.1\.0 0\.0\.0\.255 area 0/);
    expect(show(sim, 'R1', 'show ip ospf interface g0/0/1')).toMatch(/No Hellos \(Passive interface\)/);
    expect(show(sim, 'R2', 'show ip ospf database')).toMatch(/Type-5 AS External Link States/);
  });

  it('runs OSPFv3 for IPv6', () => {
    const sim = pair();
    for (const [r, n] of [['R1', 1], ['R2', 2]] as const) {
      cfg(sim, r, ['ipv6 unicast-routing', 'ipv6 router ospf 1', `router-id ${n}.${n}.${n}.${n}`, 'exit', 'interface g0/0/0', `ipv6 address 2001:db8:12::${n}/64`, 'ipv6 ospf 1 area 0', 'interface loopback 0', `ipv6 address 2001:db8:${n}::1/64`, 'ipv6 ospf 1 area 0']);
    }
    expect(show(sim, 'R1', 'show ipv6 ospf neighbor')).toMatch(/^2\.2\.2\.2 +1 +FULL\/(DR|BDR)/m);
    expect(show(sim, 'R1', 'show ipv6 route ospf')).toMatch(/^O {3}2001:DB8:2::1\/128 \[110\/2\]\n {5}via FE80::[0-9A-F:]+, GigabitEthernet0\/0\/0$/m);
    expect(show(sim, 'R1', 'ping 2001:db8:2::1')).toMatch(/!!!!!/);
  });
});

function run1(t: { execute(l: string): unknown }, lines: string[]): void {
  for (const l of lines) t.execute(l);
}
