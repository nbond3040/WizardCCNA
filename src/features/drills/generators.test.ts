import { describe, expect, it } from 'vitest';
import { broadcastOf, compressIPv6, eui64, expandIPv6, ipv6Type, networkOf, usableHosts, wildcardOf } from './ip';
import { DRILLS, checkAnswer } from './generators';
import { seededRandom } from '../../lib/random';

describe('ip math', () => {
  it('subnets', () => {
    expect(networkOf('192.168.10.130', 26)).toBe('192.168.10.128');
    expect(broadcastOf('192.168.10.130', 26)).toBe('192.168.10.191');
    expect(networkOf('172.16.45.200', 20)).toBe('172.16.32.0');
    expect(broadcastOf('172.16.45.200', 20)).toBe('172.16.47.255');
    expect(networkOf('10.200.1.1', 12)).toBe('10.192.0.0');
    expect(usableHosts(26)).toBe(62);
    expect(usableHosts(30)).toBe(2);
    expect(wildcardOf(22)).toBe('0.0.3.255');
  });
  it('ipv6', () => {
    expect(compressIPv6('2001:0db8:0000:0000:0000:ff00:0042:8329')).toBe('2001:db8::ff00:42:8329');
    expect(compressIPv6('2001:0db8:0000:0001:0000:0000:0000:0001')).toBe('2001:db8:0:1::1');
    expect(compressIPv6('2001:0db8:0000:0000:0001:0000:0000:0001')).toBe('2001:db8::1:0:0:1');
    expect(compressIPv6('2001:0db8:0001:0000:0001:0001:0001:0001')).toBe('2001:db8:1:0:1:1:1:1');
    expect(expandIPv6('fe80::1')).toBe('fe80:0000:0000:0000:0000:0000:0000:0001');
    expect(eui64('0012.3456.789a')).toBe('212:34ff:fe56:789a');
    expect(eui64('00:1a:2b:3c:4d:5e')).toBe('21a:2bff:fe3c:4d5e');
    expect(ipv6Type('fe80::1')).toBe('link-local');
    expect(ipv6Type('fd12:3456::1')).toBe('unique local');
    expect(ipv6Type('ff02::1:ff00:1')).toBe('multicast');
    expect(ipv6Type('2001:db8::1')).toBe('global unicast');
  });
  it('every generator produces self-consistent problems', () => {
    const rand = seededRandom(42);
    for (const d of DRILLS) {
      for (let i = 0; i < 300; i++) {
        const p = d.gen(rand);
        expect(p.answers.length, d.id).toBeGreaterThan(0);
        expect(checkAnswer(p, p.answers[0]), `${d.id}: ${p.given} → ${p.answers[0]}`).toBe(true);
        if (p.choices) expect(p.choices, d.id).toContain(p.answers[0]);
      }
    }
  });
});
