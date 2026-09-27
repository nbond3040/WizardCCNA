import { describe, expect, it } from 'vitest';
import { build, cfg, pc, run, show } from './helpers';

/** PC1 — R1 — R2 — PC2, links addressed, no routes. */
const line = () => {
  const sim = build(
    [
      { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'interface g0/0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface g0/0/1\n ip address 10.0.12.1 255.255.255.252\n no shutdown' },
      { id: 'R2', model: 'isr4321', x: 2, y: 0, config: 'interface g0/0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface g0/0/1\n ip address 192.168.2.1 255.255.255.0\n no shutdown' },
      pc('PC1', '192.168.1.10', '192.168.1.1'),
      pc('PC2', '192.168.2.10', '192.168.2.1'),
    ],
    [
      { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
      { a: 'R1:g0/0/0', b: 'PC1:fa0' },
      { a: 'R2:g0/0/1', b: 'PC2:fa0' },
    ],
  );
  return sim;
};

describe('static routing', () => {
  it('needs routes in both directions', () => {
    const sim = line();
    const r1 = sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' });
    expect(r1.pass).toBe(false);
    expect(r1.detail).toMatch(/R1 has no route to 192\.168\.2\.10/);
    cfg(sim, 'R1', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2');
    const r2 = sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' });
    expect(r2.pass).toBe(false);
    expect(r2.detail).toMatch(/R2 has no route to 192\.168\.1\.10/);
    cfg(sim, 'R2', 'ip route 0.0.0.0 0.0.0.0 10.0.12.1');
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' }).pass).toBe(true);
    expect(sim.check({ type: 'route', device: 'R2', prefix: '0.0.0.0/0', source: 'S*', nextHop: '10.0.12.1' }).pass).toBe(true);
    expect(sim.check({ type: 'route', device: 'R1', prefix: '192.168.2.0/24', source: 'S', nextHop: '10.0.12.2' }).pass).toBe(true);
  });

  it('prints the IOS routing table format', () => {
    const sim = line();
    cfg(sim, 'R1', ['ip route 192.168.2.0 255.255.255.0 10.0.12.2', 'ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0/1', 'ip route 172.16.0.0 255.255.0.0 10.0.12.2 200']);
    const out = show(sim, 'R1', 'show ip route');
    expect(out).toMatch(/^Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP$/m);
    expect(out).toMatch(/^Gateway of last resort is 0\.0\.0\.0 to network 0\.0\.0\.0$/m);
    expect(out).toMatch(/^S\* {4}0\.0\.0\.0\/0 is directly connected, GigabitEthernet0\/0\/1$/m);
    expect(out).toMatch(/^ {6}10\.0\.0\.0\/8 is variably subnetted, 2 subnets, 2 masks$/m);
    expect(out).toMatch(/^C {8}10\.0\.12\.0\/30 is directly connected, GigabitEthernet0\/0\/1$/m);
    expect(out).toMatch(/^L {8}10\.0\.12\.1\/32 is directly connected, GigabitEthernet0\/0\/1$/m);
    expect(out).toMatch(/^S {5}172\.16\.0\.0\/16 \[200\/0\] via 10\.0\.12\.2$/m);
    expect(out).toMatch(/^S {5}192\.168\.2\.0\/24 \[1\/0\] via 10\.0\.12\.2$/m);
    expect(show(sim, 'R1', 'show ip route static')).not.toMatch(/^C /m);
    expect(show(sim, 'R1', 'show ip route 192.168.2.55')).toBe(['Routing entry for 192.168.2.0/24', '  Known via "static", distance 1, metric 0', '  Routing Descriptor Blocks:', '  * 10.0.12.2', '      Route metric is 0, traffic share count is 1'].join('\n'));
    expect(show(sim, 'R1', 'show ip route 10.9.9.9')).toBe('% Subnet not in table');
  });

  it('uses floating static routes only when the primary fails', () => {
    const sim = line();
    cfg(sim, 'R1', ['ip route 192.168.2.0 255.255.255.0 10.0.12.2', 'ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/0/0 250']);
    expect(sim.check({ type: 'route', device: 'R1', prefix: '192.168.2.0/24', nextHop: '10.0.12.2' }).pass).toBe(true);
    cfg(sim, 'R1', ['interface g0/0/1', 'shutdown']);
    const r = sim.check({ type: 'route', device: 'R1', prefix: '192.168.2.0/24', exitIf: 'g0/0/0' });
    expect(r.pass, r.detail).toBe(true);
    expect(show(sim, 'R1', 'show ip route static')).toMatch(/^S {5}192\.168\.2\.0\/24 is directly connected, GigabitEthernet0\/0\/0$/m);
  });

  it('resolves recursive next hops and prefers the longest match', () => {
    const sim = line();
    cfg(sim, 'R2', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1');
    cfg(sim, 'R1', ['ip route 10.200.0.0 255.255.0.0 10.0.12.2', 'ip route 192.168.2.0 255.255.255.0 10.200.1.1']);
    expect(sim.check({ type: 'route', device: 'R1', prefix: '192.168.2.0/24', nextHop: '10.200.1.1' }).pass).toBe(true);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' }).pass).toBe(true);
    // longest prefix match beats AD: a /25 static to Null0 wins for the upper half only
    cfg(sim, 'R1', 'ip route 192.168.2.0 255.255.255.128 Null0');
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' }).pass).toBe(false);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.200', expect: false }).pass).toBe(true);
  });

  it('uses proxy ARP for exit-interface routes on Ethernet', () => {
    const sim = line();
    cfg(sim, 'R1', 'ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/0/1');
    cfg(sim, 'R2', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1');
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' }).pass).toBe(true);
    cfg(sim, 'R2', ['interface g0/0/0', 'no ip proxy-arp']);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.2.10' }).pass).toBe(false);
  });

  it('installs equal-cost static routes and rejects a next hop on this router', () => {
    const sim = line();
    expect(cfg(sim, 'R1', 'ip route 8.8.8.0 255.255.255.0 10.0.12.1')).toMatch(/%Invalid next hop address \(it's this router\)/);
    cfg(sim, 'R1', ['ip route 8.8.8.0 255.255.255.0 10.0.12.2', 'ip route 8.8.8.0 255.255.255.0 192.168.1.10']);
    expect(show(sim, 'R1', 'show ip route static')).toMatch(/ {6}8\.0\.0\.0\/24 is subnetted, 1 subnets\nS {8}8\.8\.8\.0\/24 \[1\/0\] via 10\.0\.12\.2\n {20}\[1\/0\] via 192\.168\.1\.10/);
  });
});

describe('ping and traceroute', () => {
  it('drops the first packet while ARP resolves', () => {
    const sim = line();
    cfg(sim, 'R1', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2');
    cfg(sim, 'R2', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1');
    const first = show(sim, 'R1', 'ping 192.168.2.10');
    expect(first).toMatch(/^Sending 5, 100-byte ICMP Echos to 192\.168\.2\.10, timeout is 2 seconds:$/m);
    expect(first).toMatch(/^\.!!!!$/m);
    expect(first).toMatch(/Success rate is 80 percent \(4\/5\)/);
    expect(show(sim, 'R1', 'ping 192.168.2.10 repeat 10')).toMatch(/^!{10}$/m);
    expect(show(sim, 'R1', 'ping 192.168.2.10 source g0/0/0')).toMatch(/Packet sent with a source address of 192\.168\.1\.1/);
  });

  it('reports unreachables and traces the path', () => {
    const sim = line();
    cfg(sim, 'R1', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2');
    // sourced from the LAN, R2 has no return route: replies are lost → timeouts
    expect(show(sim, 'R1', 'ping 192.168.2.10 source g0/0/0')).toMatch(/Success rate is 0 percent \(0\/5\)/);
    // sourced from the link, the reply uses R2's connected route
    expect(show(sim, 'R1', 'ping 192.168.2.10')).toMatch(/Success rate is 100 percent|Success rate is 80 percent/);
    // PC1 pinging an unknown network behind R1 → U from R1? R1 has no route → Destination net unreachable
    const out = run(sim, 'PC1', 'ping 172.31.1.1');
    expect(out).toMatch(/Reply from 192\.168\.1\.1: Destination net unreachable\./);
    expect(out).toMatch(/Packets: Sent = 4, Received = 4, Lost = 0 \(0% loss\)/);
    cfg(sim, 'R2', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1');
    const tr = show(sim, 'R1', 'traceroute 192.168.2.10');
    expect(tr).toMatch(/^Tracing the route to 192\.168\.2\.10$/m);
    expect(tr).toMatch(/^ {2}1 10\.0\.12\.2 \d+ msec/m);
    expect(tr).toMatch(/^ {2}2 192\.168\.2\.10 \d+ msec/m);
    const win = run(sim, 'PC1', 'tracert 192.168.2.10');
    expect(win).toMatch(/^ {2}1 +<1 ms +<1 ms +<1 ms {2}192\.168\.1\.1$/m);
    expect(win).toMatch(/Trace complete\./);
  });

  it('shows Windows-style ping failures', () => {
    const sim = build([pc('PC1', '10.1.1.10'), pc('PC2', '10.1.1.20')], [{ a: 'PC1:fa0', b: 'PC2:fa0' }]);
    expect(run(sim, 'PC1', 'ping 10.1.1.99')).toMatch(/Reply from 10\.1\.1\.10: Destination host unreachable\./);
    expect(run(sim, 'PC1', 'ping 8.8.8.8')).toMatch(/PING: transmit failed\. General failure\./);
    expect(run(sim, 'PC1', 'ping 10.1.1.20')).toMatch(/Reply from 10\.1\.1\.20: bytes=32 time<1ms TTL=128/);
    expect(run(sim, 'PC1', 'arp -a')).toMatch(/ {2}10\.1\.1\.20 +[0-9a-f-]{17} +dynamic/);
  });
});

describe('IPv6', () => {
  it('routes IPv6 with static routes and SLAAC hosts', () => {
    const sim = build(
      [
        { id: 'R1', model: 'isr4321', x: 0, y: 0 },
        { id: 'R2', model: 'isr4321', x: 2, y: 0 },
        { id: 'PC1', model: 'pc', x: 0, y: 1, host: { ipv6Auto: true } },
        { id: 'PC2', model: 'pc', x: 2, y: 1, host: { ipv6: '2001:db8:2::10/64', ipv6Gateway: 'fe80::2' } },
      ],
      [
        { a: 'R1:g0/0/1', b: 'R2:g0/0/0' },
        { a: 'R1:g0/0/0', b: 'PC1:fa0' },
        { a: 'R2:g0/0/1', b: 'PC2:fa0' },
      ],
    );
    cfg(sim, 'R1', ['ipv6 unicast-routing', 'interface g0/0/0', 'ipv6 address 2001:db8:1::1/64', 'no shutdown', 'interface g0/0/1', 'ipv6 address 2001:db8:12::1/64', 'no shutdown', 'exit', 'ipv6 route 2001:db8:2::/64 2001:db8:12::2']);
    cfg(sim, 'R2', ['ipv6 unicast-routing', 'interface g0/0/0', 'ipv6 address 2001:db8:12::2/64', 'no shutdown', 'interface g0/0/1', 'ipv6 address 2001:db8:2::1/64', 'ipv6 address fe80::2 link-local', 'no shutdown', 'exit', 'ipv6 route ::/0 2001:db8:12::1']);
    expect(show(sim, 'R1', 'show ipv6 interface brief')).toMatch(/^GigabitEthernet0\/0\/0 +\[up\/up\]\n {4}FE80::[0-9A-F:]+\n {4}2001:DB8:1::1$/m);
    const rt = show(sim, 'R1', 'show ipv6 route');
    expect(rt).toMatch(/^S {3}2001:DB8:2::\/64 \[1\/0\]\n {5}via 2001:DB8:12::2$/m);
    expect(rt).toMatch(/^C {3}2001:DB8:1::\/64 \[0\/0\]\n {5}via GigabitEthernet0\/0\/0, directly connected$/m);
    expect(rt).toMatch(/^L {3}FF00::\/8 \[0\/0\]$/m);
    const slaac = run(sim, 'PC1', 'ipconfig');
    expect(slaac).toMatch(/IPv6 Address\. . . . . . . . . . . : 2001:db8:1:0:[0-9a-f:]+/);
    const pc2 = sim.hostConfig('PC2');
    expect(pc2.ipv6).toBe('2001:db8:2::10/64');
    expect(show(sim, 'R1', 'ping 2001:db8:2::10')).toMatch(/!!!!!/);
    expect(sim.check({ type: 'route', device: 'R2', prefix: '::/0', source: 'S', nextHop: '2001:db8:12::1' }).pass).toBe(true);
    expect(sim.check({ type: 'interface', device: 'R2', iface: 'g0/0/1', ipv6: '2001:db8:2::1/64' }).pass).toBe(true);
  });

  it('computes EUI-64 interface IDs', () => {
    const sim = build([{ id: 'R1', model: 'isr4321', x: 0, y: 0 }]);
    cfg(sim, 'R1', ['interface g0/0/0', 'ipv6 address 2001:db8:5::/64 eui-64']);
    const out = show(sim, 'R1', 'show ipv6 interface g0/0/0');
    const ll = /link-local address is FE80::([0-9A-F:]+)/.exec(out)![1];
    expect(out).toMatch(new RegExp(`2001:DB8:5:0:${ll.replace(/:/g, ':')}, subnet is 2001:DB8:5::/64 \\[EUI\\]`));
  });
});
