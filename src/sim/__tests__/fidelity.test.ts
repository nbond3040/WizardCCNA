/**
 * Fidelity fixes: duplex/speed negotiation, persistent interface error counters, CDP native VLAN mismatch
 * logging at lab load and `service timestamps ... uptime`.
 */
import { describe, expect, it } from 'vitest';
import lab from '../../content/labs/lab-interface-errors-duplex';
import type { LabDevice, LabLink } from '../../content/labTypes';
import { NetworkSim } from '../index';
import { build, cfg, pc, run, show } from './helpers';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

interface Err {
  runts: number;
  giants: number;
  inErrors: number;
  crc: number;
  outErrors: number;
  collisions: number;
  late: number;
}

const ZERO: Err = { runts: 0, giants: 0, inErrors: 0, crc: 0, outErrors: 0, collisions: 0, late: 0 };

/** The error counters printed by `show interfaces <intf>`. */
function errors(sim: NetworkSim, dev: string, intf: string): Err {
  const out = show(sim, dev, `show interfaces ${intf}`);
  const num = (re: RegExp, i = 1): number => {
    const m = out.match(re);
    if (!m) throw new Error(`${re} not found in:\n${out}`);
    return Number(m[i]);
  };
  return {
    runts: num(/(\d+) runts, (\d+) giants/),
    giants: num(/(\d+) runts, (\d+) giants/, 2),
    inErrors: num(/(\d+) input errors, (\d+) CRC/),
    crc: num(/(\d+) input errors, (\d+) CRC/, 2),
    outErrors: num(/(\d+) output errors, (\d+) collisions/),
    collisions: num(/(\d+) output errors, (\d+) collisions/, 2),
    late: num(/(\d+) late collision/),
  };
}

/** Duplex and speed columns of `show interfaces status` for one port. */
function row(sim: NetworkSim, dev: string, port: string): { status: string; duplex: string; speed: string } {
  const line = show(sim, dev, 'show interfaces status')
    .split('\n')
    .find((l) => l.startsWith(`${port} `));
  const m = line?.match(/\s(connected|notconnect|disabled|err-disabled|suspended)\s+\S+\s+(\S+)\s+(\S+)\s+10\//);
  if (!m) throw new Error(`no status row for ${dev} ${port}: ${line}`);
  return { status: m[1], duplex: m[2], speed: m[3] };
}

/** Duplex/speed word of `show interfaces`, e.g. "Half-duplex, 100Mb/s". */
function mode(sim: NetworkSim, dev: string, intf: string): string {
  return show(sim, dev, `show interfaces ${intf}`).match(/^\s*((?:Full|Half|Auto)-duplex, [^,]+),/m)?.[1] ?? '';
}

const count = (text: string, re: RegExp): number => (text.match(re) ?? []).length;

/**
 * Two switches joined on `port`, one PC behind each; `a` / `b` are interface commands for the joined ports,
 * either part of the lab (`load`: the faults exist when the lab opens) or typed later (`cli`).
 */
function pair(a: string[] = [], b: string[] = [], port = 'g0/1', via: 'load' | 'cli' = 'load'): NetworkSim {
  const conf = (lines: string[]) => (via === 'load' && lines.length ? [`interface ${port}`, ...lines.map((l) => ` ${l}`)].join('\n') : undefined);
  const sim = build(
    [
      { id: 'SW1', model: 'c2960', x: 0, y: 0, config: conf(a) },
      { id: 'SW2', model: 'c2960', x: 2, y: 0, config: conf(b) },
      pc('PC1', '192.168.10.11'),
      pc('PC2', '192.168.10.12'),
    ],
    [{ a: `SW1:${port}`, b: `SW2:${port}` }, { a: 'SW1:fa0/2', b: 'PC1:fa0' }, { a: 'SW2:fa0/2', b: 'PC2:fa0' }],
  );
  if (via === 'cli') {
    if (a.length) cfg(sim, 'SW1', [`interface ${port}`, ...a]);
    if (b.length) cfg(sim, 'SW2', [`interface ${port}`, ...b]);
  }
  return sim;
}

const VIA = ['load', 'cli'] as const;

/**
 * The log buffer only: messages generated since the last command are echoed to an open console after its next
 * command, so drain the console first and they are not counted twice.
 */
function logBuffer(sim: NetworkSim, dev: string): string {
  sim.terminal(dev).execute('');
  return show(sim, dev, 'show logging | begin Log Buffer');
}

/** Send real traffic across the pair (ARP + echo requests and replies). */
const traffic = (sim: NetworkSim): string => run(sim, 'PC1', 'ping 192.168.10.12');

const labSim = (): NetworkSim => new NetworkSim({ devices: lab.devices, links: lab.links });

/* ------------------------------------------------------------------ */
/* Fix 1: duplex / speed negotiation                                   */
/* ------------------------------------------------------------------ */

describe('duplex and speed negotiation', () => {
  /** Assert the classic mismatch between SW1 and SW2 on `port`: `full` is the full-duplex end, the other one half. */
  function expectMismatch(sim: NetworkSim, full: 'SW1' | 'SW2', port = 'fa0/1', speed = '100Mb/s'): void {
    const half = full === 'SW1' ? 'SW2' : 'SW1';
    const long = port.startsWith('g') ? 'GigabitEthernet0/1' : 'FastEthernet0/1';
    // the link stays up/up: the symptoms are errors, not an outage
    for (const d of [full, half]) expect(sim.check({ type: 'interface', device: d, iface: port, status: 'up' }).pass).toBe(true);
    expect(mode(sim, full, port)).toBe(`Full-duplex, ${speed}`);
    expect(mode(sim, half, port)).toBe(`Half-duplex, ${speed}`);
    const before = { full: errors(sim, full, port), half: errors(sim, half, port) };
    traffic(sim);
    const f = errors(sim, full, port);
    const h = errors(sim, half, port);
    // the half-duplex end counts collisions and late collisions (output errors) ...
    expect(h.collisions).toBeGreaterThan(before.half.collisions);
    expect(h.late).toBeGreaterThan(before.half.late);
    expect(h.outErrors).toBeGreaterThan(before.half.outErrors);
    expect([h.crc, h.runts, h.inErrors]).toEqual([0, 0, 0]);
    // ... the full-duplex end CRC errors and runts, which are input errors
    expect(f.crc).toBeGreaterThan(before.full.crc);
    expect(f.runts).toBeGreaterThan(before.full.runts);
    expect(f.inErrors).toBe(f.crc + f.runts + f.giants);
    expect([f.collisions, f.late, f.outErrors]).toEqual([0, 0, 0]);
    // CDP reported it on both ends
    expect(logBuffer(sim, full)).toMatch(new RegExp(`%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on ${long} \\(not half duplex\\), with SW\\d ${long} \\(half duplex\\)\\.`));
    expect(logBuffer(sim, half)).toMatch(new RegExp(`%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on ${long} \\(half duplex\\), with SW\\d ${long} \\(not half duplex\\)\\.`));
  }

  it('auto/auto negotiates the highest common speed and full duplex without errors', () => {
    for (const port of ['fa0/1', 'g0/1']) {
      const sim = pair([], [], port);
      const short = port === 'fa0/1' ? 'Fa0/1' : 'Gi0/1';
      const speed = port === 'fa0/1' ? 'a-100' : 'a-1000';
      expect(row(sim, 'SW1', short)).toEqual({ status: 'connected', duplex: 'a-full', speed });
      expect(row(sim, 'SW2', short)).toEqual({ status: 'connected', duplex: 'a-full', speed });
      expect(mode(sim, 'SW1', port)).toBe(`Full-duplex, ${port === 'fa0/1' ? 100 : 1000}Mb/s`);
      traffic(sim);
      expect(errors(sim, 'SW1', port)).toEqual(ZERO);
      expect(errors(sim, 'SW2', port)).toEqual(ZERO);
      expect(logBuffer(sim, 'SW1')).not.toMatch(/DUPLEX_MISMATCH/);
    }
  });

  it('hard-coded full against auto: the auto end matches the speed but falls back to half duplex', () => {
    for (const via of VIA) {
      const sim = pair(['duplex full'], [], 'fa0/1', via);
      // the hard-coded end shows its duplex without the a- prefix, the auto end shows what it fell back to
      expect(row(sim, 'SW1', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'full', speed: 'a-100' });
      expect(row(sim, 'SW2', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'a-half', speed: 'a-100' });
      expectMismatch(sim, 'SW1');
    }
  });

  it('speed 100 + duplex full against auto is the same mismatch', () => {
    for (const via of VIA) {
      const sim = pair(['speed 100', 'duplex full'], [], 'fa0/1', via);
      expect(row(sim, 'SW1', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'full', speed: '100' });
      expect(row(sim, 'SW2', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'a-half', speed: 'a-100' });
      expectMismatch(sim, 'SW1');
    }
  });

  it('hard-coded full against hard-coded half is a mismatch whichever end is full', () => {
    for (const via of VIA) {
      const sim = pair(['duplex full'], ['duplex half'], 'fa0/1', via);
      expect(row(sim, 'SW1', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'full', speed: 'a-100' });
      expect(row(sim, 'SW2', 'Fa0/1'), via).toEqual({ status: 'connected', duplex: 'half', speed: 'a-100' });
      expectMismatch(sim, 'SW1');
      expectMismatch(pair(['duplex half'], ['duplex full'], 'fa0/1', via), 'SW2');
    }
  });

  it('identical hard-coded settings are fine, and so is half against half', () => {
    for (const duplex of ['full', 'half']) {
      const sim = pair(['speed 100', `duplex ${duplex}`], ['speed 100', `duplex ${duplex}`], 'fa0/1');
      expect(row(sim, 'SW1', 'Fa0/1')).toEqual({ status: 'connected', duplex, speed: '100' });
      expect(row(sim, 'SW2', 'Fa0/1')).toEqual({ status: 'connected', duplex, speed: '100' });
      traffic(sim);
      expect(errors(sim, 'SW1', 'fa0/1')).toEqual(ZERO);
      expect(errors(sim, 'SW2', 'fa0/1')).toEqual(ZERO);
      expect(logBuffer(sim, 'SW1')).not.toMatch(/DUPLEX_MISMATCH/);
    }
  });

  it('a hard-coded speed alone still negotiates the duplex', () => {
    const sim = pair(['speed 100'], [], 'fa0/1');
    expect(row(sim, 'SW1', 'Fa0/1')).toEqual({ status: 'connected', duplex: 'a-full', speed: '100' });
    expect(row(sim, 'SW2', 'Fa0/1')).toEqual({ status: 'connected', duplex: 'a-full', speed: 'a-100' });
    traffic(sim);
    expect(errors(sim, 'SW2', 'fa0/1')).toEqual(ZERO);
    const slow = pair(['speed 10'], [], 'fa0/1');
    expect(row(slow, 'SW2', 'Fa0/1')).toEqual({ status: 'connected', duplex: 'a-full', speed: 'a-10' });
  });

  it('different hard-coded speeds never link and count no errors', () => {
    const sim = pair(['speed 10'], ['speed 100'], 'fa0/1');
    for (const d of ['SW1', 'SW2']) {
      expect(row(sim, d, 'Fa0/1').status).toBe('notconnect');
      expect(sim.check({ type: 'interface', device: d, iface: 'fa0/1', status: 'down' }).pass).toBe(true);
    }
    expect(row(sim, 'SW1', 'Fa0/1')).toMatchObject({ speed: '10' });
    expect(row(sim, 'SW2', 'Fa0/1')).toMatchObject({ speed: '100' });
    expect(mode(sim, 'SW1', 'fa0/1')).toBe('Auto-duplex, 10Mb/s');
    expect(mode(sim, 'SW2', 'fa0/1')).toBe('Auto-duplex, 100Mb/s');
    expect(sim.check({ type: 'ping', from: 'PC1', to: '192.168.10.12' }).pass).toBe(false);
    traffic(sim);
    expect(errors(sim, 'SW1', 'fa0/1')).toEqual(ZERO);
    expect(errors(sim, 'SW2', 'fa0/1')).toEqual(ZERO);
    // a speed the other end cannot do (gigabit against a Fast Ethernet port) keeps the link down as well
    const gig = build([{ id: 'R1', model: 'isr4321', x: 0, y: 0 }, pc('PC1', '10.0.0.10')], [{ a: 'R1:g0/0/1', b: 'PC1:fa0' }]);
    cfg(gig, 'R1', ['interface g0/0/1', 'ip address 10.0.0.1 255.255.255.0', 'no shutdown', 'speed 1000']);
    expect(show(gig, 'R1', 'show ip interface brief')).toMatch(/^GigabitEthernet0\/0\/1\s+10\.0\.0\.1\s+YES manual down\s+down$/m);
    cfg(gig, 'R1', ['interface g0/0/1', 'no speed']);
    expect(show(gig, 'R1', 'show ip interface brief')).toMatch(/^GigabitEthernet0\/0\/1\s+10\.0\.0\.1\s+YES manual up\s+up$/m);
    expect(mode(gig, 'R1', 'g0/0/1')).toBe('Full-duplex, 100Mb/s');
  });

  it('gigabit always autonegotiates: no duplex mismatch at 1000 Mb/s', () => {
    for (const [a, b] of [
      [['duplex full'], []],
      [['duplex half'], ['duplex full']],
      [['duplex half'], []],
      [['speed 1000', 'duplex full'], []],
    ] as [string[], string[]][]) {
      const sim = pair(a, b, 'g0/1');
      expect(mode(sim, 'SW1', 'g0/1'), `${a} / ${b}`).toBe('Full-duplex, 1000Mb/s');
      expect(mode(sim, 'SW2', 'g0/1'), `${a} / ${b}`).toBe('Full-duplex, 1000Mb/s');
      expect(row(sim, 'SW2', 'Gi0/1')).toEqual({ status: 'connected', duplex: 'a-full', speed: 'a-1000' });
      traffic(sim);
      expect(errors(sim, 'SW1', 'g0/1'), `${a} / ${b}`).toEqual(ZERO);
      expect(errors(sim, 'SW2', 'g0/1'), `${a} / ${b}`).toEqual(ZERO);
      expect(logBuffer(sim, 'SW1')).not.toMatch(/DUPLEX_MISMATCH/);
    }
    // but the same hard-coding on a gigabit port that is held to 100 Mb/s does mismatch
    for (const via of VIA) expectMismatch(pair(['speed 100', 'duplex full'], [], 'g0/1', via), 'SW1', 'g0/1');
  });

  it('a host NIC is always on auto: hard-coded full on the switch port mismatches, half does not', () => {
    const sim = pair();
    cfg(sim, 'SW1', ['interface fa0/2', 'speed 100', 'duplex full']);
    expect(row(sim, 'SW1', 'Fa0/2')).toEqual({ status: 'connected', duplex: 'full', speed: '100' });
    traffic(sim);
    expect(errors(sim, 'SW1', 'fa0/2').crc).toBeGreaterThan(0);
    expect(errors(sim, 'SW1', 'fa0/2').collisions).toBe(0);
    expect(logBuffer(sim, 'SW1')).not.toMatch(/DUPLEX_MISMATCH/); // PCs do not speak CDP

    const legacy = pair([], [], 'g0/1', 'load');
    cfg(legacy, 'SW1', ['interface fa0/2', 'speed 10', 'duplex half']);
    expect(row(legacy, 'SW1', 'Fa0/2')).toEqual({ status: 'connected', duplex: 'half', speed: '10' });
    traffic(legacy);
    expect(errors(legacy, 'SW1', 'fa0/2')).toEqual(ZERO);
    cfg(legacy, 'SW1', ['interface fa0/2', 'no speed', 'no duplex']);
    expect(row(legacy, 'SW1', 'Fa0/2')).toEqual({ status: 'connected', duplex: 'a-full', speed: 'a-100' });
  });
});

/* ------------------------------------------------------------------ */
/* Fix 2: persistent interface error counters                          */
/* ------------------------------------------------------------------ */

describe('persistent interface error counters', () => {
  /** Fix the lab's uplink the way the lab asks: remove the hard-coded values from R1. */
  const fixUplink = (sim: NetworkSim) => cfg(sim, 'R1', ['interface g0/0/0', 'no speed', 'no duplex']);

  it('a fault present at lab load has already collected errors on the right ends', () => {
    const sim = labSim();
    expect(row(sim, 'SW1', 'Gi0/1')).toEqual({ status: 'connected', duplex: 'a-half', speed: 'a-100' });
    expect(mode(sim, 'R1', 'g0/0/0')).toBe('Full-duplex, 100Mb/s');
    const sw = errors(sim, 'SW1', 'g0/1');
    const r1 = errors(sim, 'R1', 'g0/0/0');
    expect(sw.collisions).toBeGreaterThan(0);
    expect(sw.late).toBeGreaterThan(0);
    expect(sw.outErrors).toBeGreaterThan(0);
    expect(sw.crc + sw.runts).toBe(0);
    expect(r1.crc).toBeGreaterThan(0);
    expect(r1.runts).toBeGreaterThan(0);
    expect(r1.inErrors).toBe(r1.crc + r1.runts);
    expect(r1.collisions + r1.late).toBe(0);
    // CDP reported the mismatch on both ends when the link came up
    expect(count(logBuffer(sim, 'SW1'), /%CDP-4-DUPLEX_MISMATCH/g)).toBe(1);
    expect(count(logBuffer(sim, 'R1'), /%CDP-4-DUPLEX_MISMATCH/g)).toBe(1);
    // an interface that never saw a fault has clean counters
    expect(errors(sim, 'SW1', 'fa0/1')).toEqual(ZERO);
    expect(errors(sim, 'R1', 'g0/0/1')).toEqual(ZERO);
  });

  it('grow with traffic through the mismatched link', () => {
    const sim = labSim();
    const before = { sw: errors(sim, 'SW1', 'g0/1'), r1: errors(sim, 'R1', 'g0/0/0') };
    run(sim, 'PC1', 'ping 192.168.10.1');
    const after = { sw: errors(sim, 'SW1', 'g0/1'), r1: errors(sim, 'R1', 'g0/0/0') };
    expect(after.sw.collisions).toBeGreaterThan(before.sw.collisions);
    expect(after.sw.late).toBeGreaterThan(before.sw.late);
    expect(after.r1.crc).toBeGreaterThan(before.r1.crc);
    expect(after.r1.runts).toBeGreaterThan(before.r1.runts);
  });

  it('grow with simulated time while the mismatch exists (background frames)', () => {
    const sim = labSim();
    const before = errors(sim, 'R1', 'g0/0/0');
    for (let i = 0; i < 8; i++) run(sim, 'R1', 'show ip interface brief'); // each command is a couple of seconds
    const after = errors(sim, 'R1', 'g0/0/0');
    expect(after.crc).toBeGreaterThan(before.crc);
    expect(after.runts).toBeGreaterThan(before.runts);
  });

  it('survive fixing the fault and stop growing', () => {
    const sim = labSim();
    run(sim, 'PC1', 'ping 192.168.10.1');
    fixUplink(sim);
    expect(row(sim, 'SW1', 'Gi0/1')).toEqual({ status: 'connected', duplex: 'a-full', speed: 'a-1000' });
    expect(mode(sim, 'R1', 'g0/0/0')).toBe('Full-duplex, 1000Mb/s');
    expect(show(sim, 'SW1', 'show interfaces g0/1')).toMatch(/Full-duplex, 1000Mb\/s/);
    const sw = errors(sim, 'SW1', 'g0/1');
    const r1 = errors(sim, 'R1', 'g0/0/0');
    expect(sw.collisions).toBeGreaterThan(0);
    expect(sw.late).toBeGreaterThan(0);
    expect(r1.crc).toBeGreaterThan(0);
    expect(r1.runts).toBeGreaterThan(0);
    // more traffic and a lot more simulated time: nothing changes any more
    run(sim, 'PC1', 'ping 192.168.10.1');
    for (let i = 0; i < 10; i++) run(sim, 'SW1', 'show clock');
    expect(errors(sim, 'SW1', 'g0/1')).toEqual(sw);
    expect(errors(sim, 'R1', 'g0/0/0')).toEqual(r1);
  });

  it('are reset by clear counters, which asks for confirmation and reports the time', () => {
    const sim = labSim();
    run(sim, 'PC1', 'ping 192.168.10.1');
    fixUplink(sim);
    const t = sim.terminal('R1');
    t.execute('enable');
    expect(show(sim, 'R1', 'show interfaces g0/0/0')).toMatch(/Last clearing of "show interface" counters never/);
    t.execute('clear counters');
    expect(t.prompt()).toBe('Clear "show interface" counters on all interfaces [confirm]');
    // declining leaves everything as it was
    t.execute('n');
    expect(t.prompt()).toBe('R1#');
    expect(errors(sim, 'R1', 'g0/0/0').crc).toBeGreaterThan(0);
    t.execute('clear counters');
    t.execute('');
    expect(errors(sim, 'R1', 'g0/0/0')).toEqual(ZERO);
    expect(show(sim, 'R1', 'show interfaces g0/0/0')).toMatch(/Last clearing of "show interface" counters \d\d:\d\d:\d\d/);
    expect(show(sim, 'R1', 'show logging')).toMatch(/%CLEAR-5-COUNTERS: Clear counter on all interfaces by console/);
    // every interface remembers the clearing, also the ones that never carried traffic
    expect(show(sim, 'R1', 'show interfaces g0/0/1')).toMatch(/Last clearing of "show interface" counters \d\d:\d\d:\d\d/);
    // the other device keeps its counters until it is cleared itself
    expect(errors(sim, 'SW1', 'g0/1').collisions).toBeGreaterThan(0);
    // cleared counters stay clean once the fault is gone
    run(sim, 'PC1', 'ping 192.168.10.1');
    for (let i = 0; i < 10; i++) run(sim, 'R1', 'show clock');
    expect(errors(sim, 'R1', 'g0/0/0')).toEqual(ZERO);
  });

  it('clear counters <interface> clears just that interface', () => {
    const sim = labSim();
    run(sim, 'PC1', 'ping 192.168.10.1');
    const t = sim.terminal('SW1');
    t.execute('enable');
    t.execute('clear counters g0/2');
    expect(t.prompt()).toBe('Clear "show interface" counters on this interface [confirm]');
    t.execute('');
    expect(t.prompt()).toBe('SW1#');
    expect(errors(sim, 'SW1', 'g0/1').collisions).toBeGreaterThan(0);
    expect(show(sim, 'SW1', 'show interfaces g0/1')).toMatch(/Last clearing of "show interface" counters never/);
    expect(show(sim, 'SW1', 'show interfaces g0/2')).toMatch(/Last clearing of "show interface" counters \d\d:\d\d:\d\d/);
    t.execute('clear counters g0/1');
    t.execute('');
    expect(errors(sim, 'SW1', 'g0/1')).toEqual(ZERO);
    expect(show(sim, 'SW1', 'show interfaces g0/1')).toMatch(/Last clearing of "show interface" counters \d\d:\d\d:\d\d/);
    expect(show(sim, 'SW1', 'show logging')).toMatch(/%CLEAR-5-COUNTERS: Clear counter on interface GigabitEthernet0\/1 by console/);
    // SW1 Fa0/2 was never cleared
    expect(show(sim, 'SW1', 'show interfaces fa0/2')).toMatch(/Last clearing of "show interface" counters never/);
  });

  it('start growing again after a clear if the fault is still there', () => {
    const sim = labSim();
    for (const [d, intf] of [['R1', 'g0/0/0'], ['SW1', 'g0/1']]) {
      const t = sim.terminal(d);
      t.execute('enable');
      t.execute('clear counters');
      t.execute('');
      expect(errors(sim, d, intf), d).toEqual(ZERO);
    }
    run(sim, 'PC1', 'ping 192.168.10.1');
    expect(errors(sim, 'R1', 'g0/0/0').crc).toBeGreaterThan(0);
    expect(errors(sim, 'SW1', 'g0/1').collisions).toBeGreaterThan(0);
    // and without any traffic they creep up with the background frames
    const t = sim.terminal('R1');
    t.execute('clear counters');
    t.execute('');
    expect(errors(sim, 'R1', 'g0/0/0')).toEqual(ZERO);
    for (let i = 0; i < 8; i++) run(sim, 'R1', 'show ip interface brief');
    expect(errors(sim, 'R1', 'g0/0/0').crc).toBeGreaterThan(0);
  });

  it('are part of the snapshot and survive a restore', () => {
    const sim = labSim();
    run(sim, 'PC1', 'ping 192.168.10.1');
    fixUplink(sim);
    const t = sim.terminal('SW1');
    t.execute('enable');
    t.execute('clear counters g0/2');
    t.execute('');
    const saved = errors(sim, 'R1', 'g0/0/0');
    const savedSw = errors(sim, 'SW1', 'g0/1');
    expect(saved.crc).toBeGreaterThan(0);
    expect(savedSw.late).toBeGreaterThan(0);
    const snap = JSON.parse(JSON.stringify(sim.snapshot()));
    const copy = NetworkSim.fromSnapshot({ devices: lab.devices, links: lab.links }, snap);
    expect(errors(copy, 'R1', 'g0/0/0')).toEqual(saved);
    expect(errors(copy, 'SW1', 'g0/1')).toEqual(savedSw);
    expect(show(copy, 'SW1', 'show interfaces g0/2')).toMatch(/Last clearing of "show interface" counters \d\d:\d\d:\d\d/);
    expect(show(copy, 'SW1', 'show interfaces g0/1')).toMatch(/Last clearing of "show interface" counters never/);
    // the restored simulator keeps working: clear counters on it resets them
    const ct = copy.terminal('R1');
    ct.execute('enable');
    ct.execute('clear counters');
    ct.execute('');
    expect(errors(copy, 'R1', 'g0/0/0')).toEqual(ZERO);
    expect(errors(sim, 'R1', 'g0/0/0')).toEqual(saved); // the original is untouched
  });

  it('a mismatch that is still present keeps accumulating after a restore, also from snapshots without the newer counters', () => {
    const sim = labSim();
    run(sim, 'PC1', 'ping 192.168.10.1');
    const crc = errors(sim, 'R1', 'g0/0/0').crc;
    const snap = JSON.parse(JSON.stringify(sim.snapshot()));
    const copy = NetworkSim.fromSnapshot({ devices: lab.devices, links: lab.links }, snap);
    run(copy, 'PC1', 'ping 192.168.10.1');
    expect(errors(copy, 'R1', 'g0/0/0').crc).toBeGreaterThan(crc);
    // snapshots written before giants / frame / output errors / the background timer existed
    const old = JSON.parse(JSON.stringify(snap)) as { devices: Record<string, { dyn: { ifd: Record<string, Record<string, unknown>> } }> };
    for (const d of Object.values(old.devices)) for (const dd of Object.values(d.dyn?.ifd ?? {})) for (const k of ['giants', 'frame', 'outErrors', 'errMs']) delete dd[k];
    const legacy = NetworkSim.fromSnapshot({ devices: lab.devices, links: lab.links }, old as never);
    expect(show(legacy, 'SW1', 'show interfaces g0/1')).not.toMatch(/NaN|undefined/);
    run(legacy, 'PC1', 'ping 192.168.10.1');
    for (let i = 0; i < 6; i++) run(legacy, 'SW1', 'show ip interface brief');
    const out = show(legacy, 'SW1', 'show interfaces g0/1');
    expect(out).not.toMatch(/NaN|undefined/);
    expect(errors(legacy, 'SW1', 'g0/1').outErrors).toBeGreaterThan(0);
    expect(errors(legacy, 'R1', 'g0/0/0').crc).toBeGreaterThan(crc);
  });
});

/* ------------------------------------------------------------------ */
/* Fix 3a: CDP native VLAN mismatch present at lab load                */
/* ------------------------------------------------------------------ */

describe('native VLAN mismatch at lab load', () => {
  const trunkLab = (nativeOnSw1: string, nativeOnSw2 = ''): { devices: LabDevice[]; links: LabLink[] } => ({
    devices: [
      { id: 'SW1', model: 'c2960', x: 0, y: 0, config: ['interface GigabitEthernet0/1', ' switchport mode trunk', nativeOnSw1].filter(Boolean).join('\n') },
      { id: 'SW2', model: 'c2960', x: 2, y: 0, config: ['interface GigabitEthernet0/1', ' switchport mode trunk', nativeOnSw2].filter(Boolean).join('\n') },
    ],
    links: [{ a: 'SW1:g0/1', b: 'SW2:g0/1' }],
  });
  const MISMATCH = /%CDP-4-NATIVE_VLAN_MISMATCH/g;

  it('is logged once on both switches, as CDP does when the frames cross the link', () => {
    const sim = new NetworkSim(trunkLab(' switchport trunk native vlan 99'));
    expect(sim.configErrors()).toEqual([]);
    const sw1 = logBuffer(sim, 'SW1');
    const sw2 = logBuffer(sim, 'SW2');
    expect(count(sw1, MISMATCH)).toBe(1);
    expect(count(sw2, MISMATCH)).toBe(1);
    expect(sw1).toMatch(/%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \(99\), with SW2 GigabitEthernet0\/1 \(1\)\./);
    expect(sw2).toMatch(/%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0\/1 \(1\), with SW1 GigabitEthernet0\/1 \(99\)\./);
    // the same line is not repeated by later commits (not even after a rename), and nothing is echoed to a console that opens later
    cfg(sim, 'SW1', ['hostname EDGE1', 'interface fa0/5', 'description x']);
    run(sim, 'SW2', ['enable', 'show version']);
    expect(count(logBuffer(sim, 'SW1'), MISMATCH)).toBe(1);
    expect(count(logBuffer(sim, 'SW2'), MISMATCH)).toBe(1);
    const t = sim.terminal('SW2');
    expect(count(t.execute('show logging').output, MISMATCH)).toBe(1);
  });

  it('stays quiet when the native VLANs agree, and still reports mismatches created interactively', () => {
    const sim = new NetworkSim(trunkLab(''));
    expect(count(logBuffer(sim, 'SW1'), MISMATCH)).toBe(0);
    expect(count(logBuffer(sim, 'SW2'), MISMATCH)).toBe(0);
    cfg(sim, 'SW1', ['interface g0/1', 'switchport trunk native vlan 99']);
    expect(count(logBuffer(sim, 'SW1'), MISMATCH)).toBe(1);
    expect(count(logBuffer(sim, 'SW2'), MISMATCH)).toBe(1);
    // fix and break again: a new discovery is logged again (interactive behaviour is unchanged)
    cfg(sim, 'SW1', ['interface g0/1', 'no switchport trunk native vlan']);
    cfg(sim, 'SW1', ['interface g0/1', 'switchport trunk native vlan 77']);
    expect(count(logBuffer(sim, 'SW1'), MISMATCH)).toBe(2);
    expect(logBuffer(sim, 'SW1')).toMatch(/discovered on GigabitEthernet0\/1 \(77\), with SW2 GigabitEthernet0\/1 \(1\)/);
  });

  it('is not logged at load when CDP is off on a switch', () => {
    const l = trunkLab(' switchport trunk native vlan 99');
    l.devices[1].config += '\nno cdp run';
    const sim = new NetworkSim(l);
    expect(count(logBuffer(sim, 'SW1'), MISMATCH)).toBe(0);
    expect(count(logBuffer(sim, 'SW2'), MISMATCH)).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* Fix 3b: service timestamps ... uptime                               */
/* ------------------------------------------------------------------ */

describe('service timestamps', () => {
  const withConfig = (config: string): NetworkSim =>
    build([{ id: 'R1', model: 'isr4321', x: 0, y: 0, config }, { id: 'SW1', model: 'c2960', x: 2, y: 0 }], [{ a: 'R1:g0/0/0', b: 'SW1:g0/1' }]);
  /** Bring the link up so IOS logs %LINK-3-UPDOWN, then return `show logging`. */
  const linkUp = (sim: NetworkSim): string => {
    cfg(sim, 'R1', ['interface g0/0/0', 'no shutdown']);
    return logBuffer(sim, 'R1');
  };

  it('keeps uptime in the running and startup configuration', () => {
    const sim = withConfig('service timestamps debug uptime\nservice timestamps log uptime');
    const running = sim.runningConfig('R1');
    expect(running).toMatch(/^service timestamps debug uptime$/m);
    expect(running).toMatch(/^service timestamps log uptime$/m);
    expect(running).not.toMatch(/datetime/);
    expect(show(sim, 'R1', 'show running-config | include timestamps')).toBe('service timestamps debug uptime\nservice timestamps log uptime');
    run(sim, 'R1', ['enable', 'write memory']);
    expect(show(sim, 'R1', 'show startup-config')).toMatch(/^service timestamps log uptime$/m);
    // the default is unchanged
    const dflt = build([{ id: 'R1', model: 'isr4321', x: 0, y: 0 }]);
    expect(dflt.runningConfig('R1')).toMatch(/^service timestamps debug datetime msec$/m);
    expect(dflt.runningConfig('R1')).toMatch(/^service timestamps log datetime msec$/m);
  });

  it('stamps log messages with the uptime instead of the date', () => {
    const sim = withConfig('service timestamps debug uptime\nservice timestamps log uptime');
    const log = linkUp(sim);
    expect(log).toMatch(/^\d\d:\d\d:\d\d: %LINK-3-UPDOWN: Interface GigabitEthernet0\/0\/0, changed state to up$/m);
    expect(log).toMatch(/^\d\d:\d\d:\d\d: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0\/0\/0, changed state to up$/m);
    expect(log).not.toMatch(/Mar\s+1|\*/);
    // uptime is the time since boot (the lab has been up for five minutes), not the wall clock
    expect(log).toMatch(/^00:0[5-9]:\d\d: %LINK-3-UPDOWN/m);
  });

  it('keeps dated stamps with milliseconds by default', () => {
    const log = linkUp(withConfig(''));
    expect(log).toMatch(/^\*Mar {2}1 \d\d:\d\d:\d\d\.\d{3}: %LINK-3-UPDOWN: Interface GigabitEthernet0\/0\/0, changed state to up$/m);
  });

  it('honours the other format keywords and `no service timestamps`', () => {
    const plain = withConfig('service timestamps log datetime');
    expect(linkUp(plain)).toMatch(/^\*Mar {2}1 \d\d:\d\d:\d\d: %LINK-3-UPDOWN/m);
    expect(plain.runningConfig('R1')).toMatch(/^service timestamps log datetime$/m);

    const full = withConfig('service timestamps log datetime year show-timezone msec');
    expect(full.runningConfig('R1')).toMatch(/^service timestamps log datetime msec show-timezone year$/m);
    expect(linkUp(full)).toMatch(/^\*Mar {2}1 1993 \d\d:\d\d:\d\d\.\d{3} UTC: %LINK-3-UPDOWN/m);

    const bare = withConfig('service timestamps log');
    expect(bare.runningConfig('R1')).toMatch(/^service timestamps log uptime$/m); // IOS: no keyword means uptime
    expect(linkUp(bare)).toMatch(/^\d\d:\d\d:\d\d: %LINK-3-UPDOWN/m);

    const off = withConfig('no service timestamps log');
    expect(off.runningConfig('R1')).not.toMatch(/service timestamps log/);
    expect(linkUp(off)).toMatch(/^%LINK-3-UPDOWN: Interface GigabitEthernet0\/0\/0, changed state to up$/m);
  });

  it('can be switched interactively and applies to messages logged afterwards only', () => {
    const sim = withConfig('');
    cfg(sim, 'R1', ['interface g0/0/0', 'no shutdown']);
    cfg(sim, 'R1', ['service timestamps log uptime']);
    cfg(sim, 'R1', ['interface g0/0/0', 'shutdown']);
    const log = logBuffer(sim, 'R1');
    expect(log).toMatch(/^\*Mar {2}1 \d\d:\d\d:\d\d\.\d{3}: %LINK-3-UPDOWN: Interface GigabitEthernet0\/0\/0, changed state to up$/m);
    expect(log).toMatch(/^\d\d:\d\d:\d\d: %LINK-5-CHANGED: Interface GigabitEthernet0\/0\/0, changed state to administratively down$/m);
    expect(show(sim, 'R1', 'show running-config | include timestamps log')).toBe('service timestamps log uptime');
  });
});
