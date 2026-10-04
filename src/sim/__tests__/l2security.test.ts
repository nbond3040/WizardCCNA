/**
 * Layer 2 security behaviour (CCNA 5.7): Dynamic ARP Inspection, port security applied to DHCP frames, and
 * errdisable auto-recovery.
 */
import { describe, expect, it } from 'vitest';
import { NetworkSim, type LabTopology } from '../index';
import type { LabDevice } from '../../content/labTypes';
import portSecurityLab from '../../content/labs/lab-port-security';
import { cfg, pc, run, show } from './helpers';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const GW = '10.0.0.1';

const dhcpRouter: LabDevice = {
  id: 'R1',
  model: 'isr4321',
  x: 0,
  y: 0,
  config: [
    'interface GigabitEthernet0/0/0',
    ' ip address 10.0.0.1 255.255.255.0',
    ' no shutdown',
    'ip dhcp excluded-address 10.0.0.1 10.0.0.20',
    'ip dhcp pool LAN',
    ' network 10.0.0.0 255.255.255.0',
    ' default-router 10.0.0.1',
  ].join('\n'),
};

/** Dotted MAC of a host as the simulator derived it (`ipconfig /all` shows it dashed). */
function macOf(sim: NetworkSim, host: string): string {
  const m = /Physical Address[ .]*: ([0-9A-F]{2}(?:-[0-9A-F]{2}){5})/.exec(run(sim, host, 'ipconfig /all'));
  if (!m) throw new Error(`no MAC for ${host}`);
  const h = m[1].replace(/-/g, '').toLowerCase();
  return `${h.slice(0, 4)}.${h.slice(4, 8)}.${h.slice(8, 12)}`;
}

const checkPing = (sim: NetworkSim, from: string, to: string) => sim.check({ type: 'ping', from, to }).pass;

/** Let simulated time pass: every executed command advances the clock by two to three seconds. */
function elapse(sim: NetworkSim, commands: number, dev = 'SW1'): string {
  let out = '';
  for (let i = 0; i < commands; i++) out += `${run(sim, dev, 'show clock')}\n`;
  return out;
}

/** Numbers of the row for `vlan` in each counter table of `show ip arp inspection [statistics]`. */
function daiRows(out: string, vlan: number): number[][] {
  const rows: number[][] = [];
  for (const line of out.split('\n')) {
    const m = new RegExp(`^\\s*${vlan}((?:\\s+\\d+){2,})\\s*$`).exec(line);
    if (m) rows.push(m[1].trim().split(/\s+/).map(Number));
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Dynamic ARP Inspection                                              */
/* ------------------------------------------------------------------ */

/**
 * R1 (DHCP server) on the trusted Gi0/1; PC1 is a DHCP client (snooping binding), PC2 has a static address in
 * VLAN 10 (no binding); PC3 and PC4 are static hosts in VLAN 20, which never gets DAI.
 */
function daiLab(): LabTopology {
  return {
    devices: [
      dhcpRouter,
      {
        id: 'SW1',
        model: 'c2960',
        x: 1,
        y: 0,
        config: [
          'vlan 10',
          'vlan 20',
          'interface range FastEthernet0/1 - 2',
          ' switchport mode access',
          ' switchport access vlan 10',
          'interface range FastEthernet0/3 - 4',
          ' switchport mode access',
          ' switchport access vlan 20',
          'interface GigabitEthernet0/1',
          ' switchport mode access',
          ' switchport access vlan 10',
          ' ip dhcp snooping trust',
          'ip dhcp snooping',
          'ip dhcp snooping vlan 10',
          'no ip dhcp snooping information option',
        ].join('\n'),
      },
      { id: 'PC1', model: 'pc', x: 2, y: 0, host: { dhcp: true } },
      pc('PC2', '10.0.0.50', GW),
      pc('PC3', '10.0.20.30'),
      pc('PC4', '10.0.20.40'),
    ],
    links: [
      { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
      { a: 'PC1:fa0', b: 'SW1:fa0/1' },
      { a: 'PC2:fa0', b: 'SW1:fa0/2' },
      { a: 'PC3:fa0', b: 'SW1:fa0/3' },
      { a: 'PC4:fa0', b: 'SW1:fa0/4' },
    ],
  };
}

const enableDai = ['ip arp inspection vlan 10', 'interface g0/1', 'ip arp inspection trust'];

describe('Dynamic ARP Inspection: enforcement', () => {
  it('starts with a snooping binding for the DHCP client and no inspection at all', () => {
    const sim = new NetworkSim(daiLab());
    expect(show(sim, 'SW1', 'show ip dhcp snooping binding')).toMatch(/10\.0\.0\.21 +\d+ +dhcp-snooping +10 +FastEthernet0\/1/);
    // DAI is not configured: the static host works
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
    expect(show(sim, 'SW1', 'show ip arp inspection')).not.toMatch(/Enabled/);
  });

  it('drops ARP from an untrusted port without a binding, counts it and logs it', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', enableDai);
    run(sim, 'SW1', ''); // swallow the configuration logs
    expect(checkPing(sim, 'PC2', GW)).toBe(false);
    const out = run(sim, 'PC2', `ping ${GW}`);
    expect(out).toMatch(/Destination host unreachable/);
    expect(out).not.toMatch(/Reply from 10\.0\.0\.1: bytes/);
    // one syslog message for the burst, in the IOS format
    const logs = run(sim, 'SW1', '');
    // the check explains who dropped the ARP
    expect(sim.check({ type: 'ping', from: 'PC2', to: GW }).detail).toMatch(/Dynamic ARP Inspection on SW1 dropped the ARP request from 10\.0\.0\.50 .* on Fa0\/2, VLAN 10: no matching DHCP snooping binding/);
    const stats = show(sim, 'SW1', 'show ip arp inspection statistics vlan 10');
    const [t1, t2] = daiRows(stats, 10);
    expect(t1[1], 'Dropped').toBeGreaterThanOrEqual(4);
    expect(t1[2], 'DHCP Drops').toBe(t1[1]);
    expect(t1[3], 'ACL Drops').toBe(0);
    expect(t2[0], 'DHCP Permits').toBe(0);
    const dai = logs.split('\n').filter((l) => l.includes('%SW_DAI-4-DHCP_SNOOPING_DENY'));
    expect(dai).toHaveLength(1);
    expect(dai[0]).toMatch(/%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs \(Req\) on Fa0\/2, vlan 10\.\(\[[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}\/10\.0\.0\.50\/0000\.0000\.0000\/10\.0\.0\.1\/\d\d:\d\d:\d\d UTC Mon Mar 1 1993\]\)/);
    expect(dai[0]).toContain(`[${macOf(sim, 'PC2')}/10.0.0.50/`);
  });

  it('rate-limits the DAI syslog: later drops are batched into the next message', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', enableDai);
    run(sim, 'SW1', '');
    run(sim, 'PC2', `ping ${GW}`);
    expect(run(sim, 'SW1', '').match(/SW_DAI/g)).toHaveLength(1);
    // five seconds later the pending drops are reported together
    for (let i = 0; i < 4; i++) run(sim, 'PC2', `ping ${GW}`);
    const later = run(sim, 'SW1', '');
    expect(later).toMatch(/%SW_DAI-4-DHCP_SNOOPING_DENY: ([2-9]|\d\d+) Invalid ARPs \(Req\) on Fa0\/2, vlan 10/);
  });

  it('lets a DHCP-snooping-bound host work, and the static host cannot reach it either', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', enableDai);
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
    expect(run(sim, 'PC1', `ping ${GW}`)).toMatch(/Reply from 10\.0\.0\.1: bytes=32/);
    const [t1, t2] = daiRows(show(sim, 'SW1', 'show ip arp inspection statistics'), 10);
    expect(t1[0], 'Forwarded').toBeGreaterThan(0);
    expect(t1[1], 'Dropped').toBe(0);
    expect(t2[0], 'DHCP Permits').toBe(t1[0]);
    // PC2 has no binding: its ARP replies are dropped too, so PC1 cannot resolve it
    expect(checkPing(sim, 'PC1', '10.0.0.50')).toBe(false);
    expect(sim.check({ type: 'ping', from: 'PC1', to: '10.0.0.50' }).detail).toMatch(/Dynamic ARP Inspection on SW1 dropped the ARP reply from 10\.0\.0\.50 .* on Fa0\/2, VLAN 10/);
    expect(run(sim, 'PC1', 'ping 10.0.0.50')).toMatch(/Destination host unreachable/);
    expect(show(sim, 'SW1', 'show ip arp inspection statistics')).toMatch(/\n\s+10\s+\d+\s+[1-9]\d*\s+[1-9]\d*\s+0\n/);
  });

  it('never inspects trusted ports', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', [...enableDai, 'interface fa0/2', 'ip arp inspection trust']);
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
    run(sim, 'PC2', `ping ${GW}`);
    const [t1] = daiRows(show(sim, 'SW1', 'show ip arp inspection statistics vlan 10'), 10);
    expect(t1).toEqual([0, 0, 0, 0]);
    const ifs = show(sim, 'SW1', 'show ip arp inspection interfaces');
    expect(ifs).toMatch(/^ Fa0\/2 +Trusted +None +N\/A$/m);
    // trust is per port: removing it blocks the host again
    cfg(sim, 'SW1', ['interface fa0/2', 'no ip arp inspection trust']);
    expect(checkPing(sim, 'PC2', GW)).toBe(false);
  });

  it('leaves VLANs that are not in the DAI list alone', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', enableDai);
    // VLAN 20 hosts have static addresses and no binding, yet nothing is inspected there
    expect(checkPing(sim, 'PC3', '10.0.20.40')).toBe(true);
    expect(run(sim, 'PC3', 'ping 10.0.20.40')).toMatch(/Reply from 10\.0\.20\.40: bytes=32/);
    const all = show(sim, 'SW1', 'show ip arp inspection');
    expect(daiRows(all, 20)).toEqual([]);
    expect(all).not.toMatch(/^\s+20\s/m);
    // ... while VLAN 10 is
    expect(checkPing(sim, 'PC2', GW)).toBe(false);
    cfg(sim, 'SW1', ['no ip arp inspection vlan 10']);
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
  });

  it('honours ARP ACLs: permit for static hosts, explicit deny over a binding, and `static`', () => {
    const sim = new NetworkSim(daiLab());
    const mac2 = macOf(sim, 'PC2');
    const mac1 = macOf(sim, 'PC1');
    cfg(sim, 'SW1', [...enableDai, 'arp access-list STATIC', `permit ip host 10.0.0.50 mac host ${mac2}`, 'exit', 'ip arp inspection filter STATIC vlan 10']);
    // the ACL permits the static host, bound hosts still fall through to the binding table
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
    run(sim, 'PC2', `ping ${GW}`);
    const [t1, t2] = daiRows(show(sim, 'SW1', 'show ip arp inspection statistics vlan 10'), 10);
    expect(t2[1], 'ACL Permits').toBeGreaterThan(0);
    expect(t1[3], 'ACL Drops').toBe(0);
    const vlan = show(sim, 'SW1', 'show ip arp inspection vlan 10');
    expect(vlan).toMatch(/^ +10 +Enabled +Active +STATIC +No$/m);
    // an explicit deny wins over the binding
    cfg(sim, 'SW1', ['arp access-list STATIC', `deny ip host 10.0.0.21 mac host ${mac1}`, 'exit']);
    expect(show(sim, 'SW1', 'show running-config | section arp access-list')).toMatch(/permit ip host 10\.0\.0\.50 mac host/);
    cfg(sim, 'SW1', ['no arp access-list STATIC', 'arp access-list STATIC', `deny ip host 10.0.0.21 mac host ${mac1}`, `permit ip host 10.0.0.50 mac host ${mac2}`, 'exit']);
    expect(checkPing(sim, 'PC1', GW)).toBe(false);
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
    run(sim, 'PC1', `ping ${GW}`);
    expect(run(sim, 'SW1', '')).toMatch(/%SW_DAI-4-ACL_DENY: \d+ Invalid ARPs \(Req\) on Fa0\/1, vlan 10/);
    expect(daiRows(show(sim, 'SW1', 'show ip arp inspection statistics vlan 10'), 10)[0][3], 'ACL Drops').toBeGreaterThan(0);
    // `static`: no match means deny, the binding table is not consulted
    cfg(sim, 'SW1', ['no arp access-list STATIC', 'arp access-list STATIC', `permit ip host 10.0.0.50 mac host ${mac2}`, 'exit', 'ip arp inspection filter STATIC vlan 10 static']);
    expect(show(sim, 'SW1', 'show ip arp inspection vlan 10')).toMatch(/^ +10 +Enabled +Active +STATIC +Yes$/m);
    expect(checkPing(sim, 'PC2', GW)).toBe(true);
    expect(checkPing(sim, 'PC1', GW)).toBe(false);
  });

  it('breaks every host when the router uplink is not trusted: the router\'s ARP replies are dropped', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', ['ip arp inspection vlan 10']);
    expect(checkPing(sim, 'PC1', GW)).toBe(false);
    expect(sim.check({ type: 'ping', from: 'PC1', to: GW }).detail).toMatch(/Dynamic ARP Inspection on SW1 dropped the ARP reply from 10\.0\.0\.1 .* on Gi0\/1, VLAN 10/);
    cfg(sim, 'SW1', ['interface g0/1', 'ip arp inspection trust']);
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
  });
});

describe('Dynamic ARP Inspection: configuration and show commands', () => {
  it('prints the IOS tables for `show ip arp inspection` and `... vlan 10`', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', [...enableDai, 'ip arp inspection validate src-mac dst-mac ip']);
    const out = show(sim, 'SW1', 'show ip arp inspection');
    expect(out).toMatch(/^Source Mac Validation +: Enabled$/m);
    expect(out).toMatch(/^Destination Mac Validation : Enabled$/m);
    expect(out).toMatch(/^IP Address Validation +: Enabled$/m);
    expect(out).toContain(' Vlan     Configuration    Operation   ACL Match          Static ACL');
    expect(out).toContain(' Vlan     ACL Logging      DHCP Logging      Probe Logging');
    expect(out).toContain(' Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops');
    expect(out).toContain(' Vlan   DHCP Permits    ACL Permits  Probe Permits   Source MAC Failures');
    expect(out).toContain(' Vlan   Dest MAC Failures   IP Validation Failures   Invalid Protocol Data');
    expect(out).toMatch(/^ +10 +Enabled +Active\s*$/m);
    expect(out).toMatch(/^ +10 +Deny +Deny +Off$/m);
    const only = show(sim, 'SW1', 'show ip arp inspection vlan 10');
    expect(only).toContain('Vlan     Configuration    Operation');
    expect(only).not.toContain('Forwarded');
    // a VLAN without DAI is listed as disabled when asked for explicitly
    expect(show(sim, 'SW1', 'show ip arp inspection vlan 20')).toMatch(/^ +20 +Disabled +Inactive\s*$/m);
    expect(show(sim, 'R1', 'show ip arp inspection')).toMatch(/Invalid input/);
  });

  it('shows trust, rate and burst per interface', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', [...enableDai, 'interface fa0/2', 'ip arp inspection limit rate 100 burst interval 2', 'interface fa0/3', 'ip arp inspection limit rate none']);
    const out = show(sim, 'SW1', 'show ip arp inspection interfaces');
    expect(out).toContain(' Interface        Trust State     Rate (pps)    Burst Interval');
    expect(out).toContain(' ---------------  -----------     ----------    --------------');
    expect(out).toContain(' Fa0/1            Untrusted               15                 1');
    expect(out).toContain(' Gi0/1            Trusted               None               N/A');
    expect(out).toContain(' Fa0/2            Untrusted              100                 2');
    expect(out).toContain(' Fa0/3            Untrusted             None               N/A');
    expect(show(sim, 'SW1', 'show ip arp inspection interfaces fa0/1')).not.toContain('Fa0/2');
    // back to the default
    cfg(sim, 'SW1', ['interface fa0/2', 'no ip arp inspection limit rate']);
    expect(show(sim, 'SW1', 'show ip arp inspection interfaces')).toContain(' Fa0/2            Untrusted               15                 1');
  });

  it('stores the configuration in the running-config', () => {
    const sim = new NetworkSim(daiLab());
    const mac2 = macOf(sim, 'PC2');
    cfg(sim, 'SW1', [
      ...enableDai,
      'ip arp inspection validate src-mac',
      'ip arp inspection validate dst-mac ip',
      'ip arp inspection log-buffer entries 64',
      'arp access-list STATIC',
      `permit ip host 10.0.0.50 mac host ${mac2}`,
      'exit',
      'ip arp inspection filter STATIC vlan 10 static',
      'interface fa0/2',
      'ip arp inspection limit rate 100 burst interval 2',
    ]);
    const run1 = show(sim, 'SW1', 'show running-config');
    expect(run1).toMatch(/^ip arp inspection validate dst-mac ip$/m); // each validate command replaces the previous one
    expect(run1).not.toMatch(/validate src-mac/);
    expect(run1).toMatch(/^ip arp inspection log-buffer entries 64$/m);
    expect(run1).toMatch(/^ip arp inspection vlan 10$/m);
    expect(run1).toMatch(/^ip arp inspection filter STATIC vlan 10 static$/m);
    expect(run1).toMatch(new RegExp(`^arp access-list STATIC\\n permit ip host 10\\.0\\.0\\.50 mac host ${mac2.replace(/\./g, '\\.')}$`, 'm'));
    expect(show(sim, 'SW1', 'show running-config interface g0/1')).toMatch(/^ ip arp inspection trust$/m);
    expect(show(sim, 'SW1', 'show running-config interface fa0/2')).toMatch(/^ ip arp inspection limit rate 100 burst interval 2$/m);
    expect(sim.check({ type: 'config', device: 'SW1', pattern: '^ip arp inspection validate dst-mac ip$' }).pass).toBe(true);
    // `no` forms
    cfg(sim, 'SW1', ['no ip arp inspection validate', 'no ip arp inspection log-buffer entries', 'no ip arp inspection filter STATIC vlan 10', 'no arp access-list STATIC']);
    const run2 = show(sim, 'SW1', 'show running-config');
    expect(run2).not.toMatch(/validate|log-buffer|filter STATIC|arp access-list/);
    // the saved configuration replays (ARP ACL sub-mode included)
    cfg(sim, 'SW1', ['arp access-list KEEP', `permit ip host 10.0.0.50 mac host ${mac2}`, 'exit', 'ip arp inspection validate ip allow-zeros']);
    run(sim, 'SW1', 'write memory');
    expect(sim.check({ type: 'saved', device: 'SW1' }).pass).toBe(true);
    expect(show(sim, 'SW1', 'show startup-config')).toMatch(/^ip arp inspection validate ip allow-zeros$/m);
  });

  it('replays the DAI, ARP ACL and errdisable configuration from the startup-config after a reload', () => {
    const sim = new NetworkSim(daiLab());
    cfg(sim, 'SW1', [
      ...enableDai,
      'ip arp inspection validate src-mac ip allow-zeros',
      'ip arp inspection log-buffer entries 64',
      'ip arp inspection log-buffer logs 20 interval 10',
      'arp access-list STATIC',
      'permit ip host 10.0.0.50 mac host 0050.b6aa.0001',
      'deny request ip 10.0.1.0 0.0.0.255 mac any log',
      'permit response ip any mac 0050.b6aa.0000 0000.0000.00ff',
      'exit',
      'ip arp inspection filter STATIC vlan 10 static',
      'errdisable recovery cause psecure-violation',
      'errdisable recovery cause bpduguard',
      'errdisable recovery interval 45',
      'no errdisable detect cause link-flap',
      'interface fa0/2',
      'ip arp inspection limit rate 100 burst interval 3',
      'interface fa0/3',
      'ip arp inspection limit rate none',
    ]);
    const l2 = (text: string) => text.split('\n').filter((l) => /arp|errdisable|permit|deny|^ *log/.test(l)).join('\n');
    const before = l2(sim.runningConfig('SW1'));
    expect(before).toContain('deny request ip 10.0.1.0 0.0.0.255 mac any log');
    expect(before).toContain('permit response ip any mac 0050.b6aa.0000 0000.0000.00ff');
    expect(before).toContain('ip arp inspection log-buffer logs 20 interval 10');
    expect(before).toContain(' ip arp inspection limit rate none');
    run(sim, 'SW1', ['end', 'copy running-config startup-config', '', 'reload', '']);
    expect(l2(sim.runningConfig('SW1'))).toBe(before);
    // the restored policy is live
    sim.terminal('SW1').execute(''); // press RETURN to get started
    expect(show(sim, 'SW1', 'show ip arp inspection vlan 10')).toMatch(/^ +10 +Enabled +Active +STATIC +Yes$/m);
  });

  it('accepts the commands with IOS error handling', () => {
    const sim = new NetworkSim(daiLab());
    expect(cfg(sim, 'SW1', ['ip arp inspection vlan 10', 'ip arp inspection validate src-mac dst-mac ip', 'ip arp inspection log-buffer entries 32', 'ip arp inspection log-buffer logs 10 interval 5']).trim()).toBe('');
    expect(cfg(sim, 'SW1', ['interface fa0/1', 'ip arp inspection limit rate 15', 'ip arp inspection trust', 'no ip arp inspection trust']).trim()).toBe('');
    expect(cfg(sim, 'SW1', ['ip arp inspection validate bogus'])).toMatch(/Invalid input/);
    expect(cfg(sim, 'SW1', ['interface fa0/1', 'ip arp inspection limit rate 99999'])).toMatch(/Invalid input/);
    expect(cfg(sim, 'R1', ['ip arp inspection vlan 10'])).toMatch(/Invalid input/);
    // ARP ACL sub-mode prompt and ACL syntax
    const t = sim.terminal('SW1');
    t.execute('configure terminal');
    t.execute('arp access-list X');
    expect(t.prompt()).toBe('SW1(config-arp-nacl)#');
    expect(t.execute('permit ip any mac any log').output).toBe('');
    expect(t.execute('permit request ip 10.0.0.0 0.0.0.255 mac 0050.b6aa.0000 0000.0000.ffff').output).toBe('');
    expect(t.execute('permit ip host 10.0.0.5').output).toMatch(/Incomplete/);
    t.execute('end');
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/arp access-list X\n permit ip any mac any log\n permit request ip 10\.0\.0\.0 0\.0\.0\.255 mac 0050\.b6aa\.0000 0000\.0000\.ffff/);
    // entries can be removed again, and the whole list with `no arp access-list`
    cfg(sim, 'SW1', ['arp access-list X', 'no permit ip any mac any log']);
    expect(show(sim, 'SW1', 'show running-config')).not.toMatch(/permit ip any mac any/);
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/permit request ip 10\.0\.0\.0/);
    cfg(sim, 'SW1', ['no arp access-list X']);
    expect(show(sim, 'SW1', 'show running-config')).not.toMatch(/arp access-list X/);
  });

  it('accumulates counters, clears them, and keeps counters, bindings and policy across snapshot/restore', () => {
    const lab = daiLab();
    const sim = new NetworkSim(lab);
    const mac2 = macOf(sim, 'PC2');
    cfg(sim, 'SW1', [...enableDai, 'arp access-list STATIC', `permit ip host 10.0.0.99 mac host ${mac2}`, 'exit', 'ip arp inspection filter STATIC vlan 10', 'ip arp inspection validate ip']);
    run(sim, 'PC1', `ping ${GW}`);
    run(sim, 'PC2', `ping ${GW}`);
    const before = show(sim, 'SW1', 'show ip arp inspection statistics');
    const [t1] = daiRows(before, 10);
    expect(t1[0]).toBeGreaterThan(0);
    expect(t1[1]).toBeGreaterThan(0);
    // counters only ever grow while ARP traffic is processed
    run(sim, 'PC2', `ping ${GW}`);
    expect(daiRows(show(sim, 'SW1', 'show ip arp inspection statistics'), 10)[0][1]).toBeGreaterThan(t1[1]);

    const mid = show(sim, 'SW1', 'show ip arp inspection statistics');
    const restored = NetworkSim.fromSnapshot(lab, JSON.parse(JSON.stringify(sim.snapshot())));
    expect(show(restored, 'SW1', 'show ip arp inspection statistics')).toBe(mid);
    expect(show(restored, 'SW1', 'show ip dhcp snooping binding')).toMatch(/10\.0\.0\.21/);
    expect(show(restored, 'SW1', 'show running-config')).toMatch(/^arp access-list STATIC$/m);
    expect(show(restored, 'SW1', 'show running-config')).toMatch(/^ip arp inspection filter STATIC vlan 10$/m);
    expect(show(restored, 'SW1', 'show running-config')).toMatch(/^ip arp inspection validate ip$/m);
    // enforcement survives the restore and the counters keep accumulating from the restored values
    expect(checkPing(restored, 'PC2', GW)).toBe(false);
    expect(checkPing(restored, 'PC1', GW)).toBe(true);
    run(restored, 'PC2', `ping ${GW}`);
    expect(daiRows(show(restored, 'SW1', 'show ip arp inspection statistics'), 10)[0][1]).toBeGreaterThan(daiRows(mid, 10)[0][1]);

    show(sim, 'SW1', 'clear ip arp inspection statistics');
    expect(daiRows(show(sim, 'SW1', 'show ip arp inspection statistics vlan 10'), 10)[0]).toEqual([0, 0, 0, 0]);
  });

  it('stops a host from claiming the gateway address: its ARP reply is dropped and the real answer wins', () => {
    const sim = new NetworkSim(daiLab());
    const routerMac = /address is ([0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4})/.exec(show(sim, 'R1', 'show interfaces g0/0/0'))![1];
    const dashed = (m: string) => m.replace(/\./g, '').replace(/(..)(?=.)/g, '$1-');
    const gwEntry = (host: string) => /10\.0\.0\.1 +([0-9a-f]{2}(?:-[0-9a-f]{2}){5})/.exec(run(sim, host, 'arp -a'))?.[1];
    // PC2 pretends to be the router
    sim.setHostConfig('PC2', { ip: '10.0.0.1', mask: '255.255.255.0' });
    const evil = macOf(sim, 'PC2');
    run(sim, 'PC1', `ping ${GW}`);
    expect(gwEntry('PC1'), 'without DAI the attacker answers first').toBe(dashed(evil));
    cfg(sim, 'SW1', enableDai);
    run(sim, 'PC1', 'arp -d');
    expect(run(sim, 'PC1', `ping ${GW}`)).toMatch(/Reply from 10\.0\.0\.1/);
    expect(gwEntry('PC1'), 'with DAI only the router is believed').toBe(dashed(routerMac));
    expect(run(sim, 'SW1', '')).toMatch(/%SW_DAI-4-DHCP_SNOOPING_DENY: \d+ Invalid ARPs \(Res\) on Fa0\/2, vlan 10\.\(\[[0-9a-f.]{14}\/10\.0\.0\.1\//);
    const [t1] = daiRows(show(sim, 'SW1', 'show ip arp inspection statistics vlan 10'), 10);
    expect(t1[1], 'Dropped').toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/* Port security and DHCP                                              */
/* ------------------------------------------------------------------ */

/**
 * SW1 Fa0/1 is a secured access port that leads to SW2: PC1 (DHCP client) and PC2 (a second MAC) sit behind it.
 * PC3 is a DHCP client directly on the secured Fa0/2. R1 is the DHCP server.
 */
function psLab(portSec: string[]): LabTopology {
  return {
    devices: [
      dhcpRouter,
      {
        id: 'SW1',
        model: 'c2960',
        x: 1,
        y: 0,
        config: [
          'interface GigabitEthernet0/1',
          ' switchport mode access',
          'interface FastEthernet0/1',
          ' switchport mode access',
          ' switchport port-security',
          ...portSec.map((l) => ` ${l}`),
          'interface FastEthernet0/2',
          ' switchport mode access',
          ' switchport port-security',
        ].join('\n'),
      },
      { id: 'SW2', model: 'c2960', x: 2, y: 0 },
      { id: 'PC1', model: 'pc', x: 3, y: 0, host: { dhcp: true } },
      { id: 'PC2', model: 'pc', x: 3, y: 1, host: {} },
      { id: 'PC3', model: 'pc', x: 3, y: 2, host: { dhcp: true } },
    ],
    links: [
      { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
      { a: 'SW1:fa0/1', b: 'SW2:fa0/1' },
      { a: 'PC1:fa0', b: 'SW2:fa0/2' },
      { a: 'PC2:fa0', b: 'SW2:fa0/3' },
      { a: 'PC3:fa0', b: 'SW1:fa0/2' },
    ],
  };
}

const iface = (sim: NetworkSim, n: string) => sim.devices().find((d) => d.id === 'SW1')!.interfaces.find((i) => i.name === n)!;

describe('port security applies to DHCP frames', () => {
  it('learns the MAC of a DHCP client as a sticky secure address', () => {
    const sim = new NetworkSim(psLab(['switchport port-security mac-address sticky']));
    const mac1 = macOf(sim, 'PC1');
    expect(run(sim, 'PC1', 'ipconfig')).toMatch(/IPv4 Address[ .]*: 10\.0\.0\.2\d/);
    const addr = show(sim, 'SW1', 'show port-security address');
    expect(addr).toMatch(new RegExp(`^ +1 +${mac1.replace(/\./g, '\\.')} +SecureSticky +Fa0/1 +-$`, 'm'));
    const intf = show(sim, 'SW1', 'show port-security interface fa0/1');
    expect(intf).toMatch(/Port Status +: Secure-up/);
    expect(intf).toMatch(/Total MAC Addresses +: 1/);
    expect(intf).toMatch(/Sticky MAC Addresses +: 1/);
    expect(intf).toMatch(new RegExp(`Last Source Address:Vlan +: ${mac1.replace(/\./g, '\\.')}:1`));
    expect(intf).toMatch(/Security Violation Count +: 0/);
    expect(show(sim, 'SW1', 'show running-config interface fa0/1')).toContain(`switchport port-security mac-address sticky ${mac1}`);
    expect(show(sim, 'SW1', 'show port-security')).toMatch(/^ +Fa0\/1 +1 +1 +0 +Shutdown$/m);
  });

  it('learns a dynamic secure address when sticky learning is off', () => {
    const sim = new NetworkSim(psLab([]));
    const mac3 = macOf(sim, 'PC3');
    expect(show(sim, 'SW1', 'show port-security address')).toMatch(new RegExp(`^ +1 +${mac3.replace(/\./g, '\\.')} +SecureDynamic +Fa0/2 +-$`, 'm'));
    expect(show(sim, 'SW1', 'show port-security interface fa0/2')).toMatch(/Sticky MAC Addresses +: 0/);
    expect(show(sim, 'SW1', 'show running-config interface fa0/2')).not.toMatch(/mac-address sticky/);
  });

  it('err-disables the port when a second MAC sends a DHCP DISCOVER (violation shutdown)', () => {
    const sim = new NetworkSim(psLab(['switchport port-security mac-address sticky']));
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
    run(sim, 'SW1', '');
    sim.setHostConfig('PC2', { dhcp: true });
    const mac2 = macOf(sim, 'PC2');
    const logs = run(sim, 'SW1', '');
    expect(logs).toMatch(/%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0\/1, putting Fa0\/1 in err-disable state/);
    expect(logs).toContain(`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${mac2} on port FastEthernet0/1.`);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    const intf = show(sim, 'SW1', 'show port-security interface fa0/1');
    expect(intf).toMatch(/Port Status +: Secure-shutdown/);
    expect(intf).toMatch(/Security Violation Count +: 1/);
    expect(intf).toContain(`Last Source Address:Vlan   : ${mac2}:1`);
    expect(show(sim, 'SW1', 'show interfaces status')).toMatch(/^Fa0\/1\s+err-disabled/m);
    expect(show(sim, 'SW1', 'show interfaces status err-disabled')).toMatch(/^Fa0\/1\s+err-disabled\s+psecure-violation$/m);
    // the legitimate client behind the same port is cut off as well; the lease is gone with the link
    expect(checkPing(sim, 'PC1', GW)).toBe(false);
    // the rogue got nothing
    expect(run(sim, 'PC2', 'ipconfig')).toMatch(/169\.254\./);
  });

  it('drops the DISCOVER, counts and logs it, and keeps the port up (violation restrict)', () => {
    const sim = new NetworkSim(psLab(['switchport port-security mac-address sticky', 'switchport port-security violation restrict']));
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
    run(sim, 'SW1', '');
    sim.setHostConfig('PC2', { dhcp: true });
    const mac2 = macOf(sim, 'PC2');
    const logs = run(sim, 'SW1', '');
    expect(logs).toContain(`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${mac2} on port FastEthernet0/1.`);
    expect(logs).not.toMatch(/ERR_DISABLE/);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    const intf = show(sim, 'SW1', 'show port-security interface fa0/1');
    expect(intf).toMatch(/Port Status +: Secure-up/);
    expect(intf).toMatch(/Violation Mode +: Restrict/);
    expect(Number(/Security Violation Count +: (\d+)/.exec(intf)![1])).toBeGreaterThanOrEqual(1);
    expect(intf).toContain(`Last Source Address:Vlan   : ${mac2}:1`);
    expect(show(sim, 'SW1', 'show port-security')).toMatch(/^ +Fa0\/1 +1 +1 +[1-9]\d* +Restrict$/m);
    // the second MAC is not learned, the first client keeps working and the rogue has no address
    expect(show(sim, 'SW1', 'show port-security address')).not.toContain(mac2);
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
    expect(run(sim, 'PC2', 'ipconfig')).toMatch(/169\.254\./);
  });

  it('drops the DISCOVER silently in protect mode: no counter, no log', () => {
    const sim = new NetworkSim(psLab(['switchport port-security mac-address sticky', 'switchport port-security violation protect']));
    run(sim, 'SW1', '');
    sim.setHostConfig('PC2', { dhcp: true });
    const logs = run(sim, 'SW1', '');
    expect(logs).not.toMatch(/PSECURE_VIOLATION|ERR_DISABLE/);
    const intf = show(sim, 'SW1', 'show port-security interface fa0/1');
    expect(intf).toMatch(/Security Violation Count +: 0/);
    expect(intf).toMatch(/Port Status +: Secure-up/);
    expect(run(sim, 'PC2', 'ipconfig')).toMatch(/169\.254\./);
    expect(checkPing(sim, 'PC1', GW)).toBe(true);
  });

  it('lets a second MAC lease an address while the port has room', () => {
    const sim = new NetworkSim(psLab(['switchport port-security maximum 2', 'switchport port-security mac-address sticky']));
    sim.setHostConfig('PC2', { dhcp: true });
    expect(run(sim, 'PC2', 'ipconfig')).toMatch(/IPv4 Address[ .]*: 10\.0\.0\.2\d/);
    expect(show(sim, 'SW1', 'show port-security interface fa0/1')).toMatch(/Sticky MAC Addresses +: 2/);
    expect(show(sim, 'SW1', 'show port-security address').match(/SecureSticky +Fa0\/1/g)).toHaveLength(2);
  });

  it('applies port security to DHCP server frames too: a rogue server behind a full port cannot answer', () => {
    const rogueLab = (secure: boolean): LabTopology => ({
      devices: [
        {
          id: 'SW1',
          model: 'c2960',
          x: 0,
          y: 0,
          config: [
            'interface FastEthernet0/1',
            ' switchport mode access',
            ...(secure ? [' switchport port-security', ' switchport port-security mac-address 0000.1111.2222', ' switchport port-security violation restrict'] : []),
            'interface FastEthernet0/3',
            ' switchport mode access',
          ].join('\n'),
        },
        { id: 'SRV', model: 'server', x: 1, y: 0, host: { ip: '10.0.0.77', mask: '255.255.255.0' }, services: { dhcp: { pool: 'EVIL', network: '10.0.0.0', mask: '255.255.255.0', gateway: '10.0.0.77', start: '10.0.0.200', max: 5 } } },
        { id: 'PC4', model: 'pc', x: 2, y: 0, host: { dhcp: true } },
      ],
      links: [
        { a: 'SRV:fa0', b: 'SW1:fa0/1' },
        { a: 'PC4:fa0', b: 'SW1:fa0/3' },
      ],
    });
    // control: nothing is secured, the rogue server hands out an address
    const open = new NetworkSim(rogueLab(false));
    expect(run(open, 'PC4', 'ipconfig')).toMatch(/IPv4 Address[ .]*: 10\.0\.0\.200/);
    // the same server behind a port whose only secure address belongs to somebody else: its OFFER is a violation
    const sim = new NetworkSim(rogueLab(true));
    const macS = macOf(sim, 'SRV');
    expect(run(sim, 'PC4', 'ipconfig')).toMatch(/169\.254\./);
    const intf = show(sim, 'SW1', 'show port-security interface fa0/1');
    expect(Number(/Security Violation Count +: (\d+)/.exec(intf)![1])).toBeGreaterThanOrEqual(1);
    expect(intf).toContain(`Last Source Address:Vlan   : ${macS}:1`);
    expect(show(sim, 'SW1', 'show logging')).toContain(`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${macS} on port FastEthernet0/1.`);
  });
});

describe('ping and traffic checks go through the same port-security path as real frames', () => {
  it('real traffic learns the sticky MAC, a check does not leave any trace', () => {
    const lab: LabTopology = {
      devices: [
        { id: 'SW1', model: 'c2960', x: 0, y: 0, config: ['interface FastEthernet0/1', ' switchport mode access', ' switchport port-security', ' switchport port-security mac-address sticky', 'interface FastEthernet0/2', ' switchport mode access'].join('\n') },
        pc('PC1', '10.1.1.11'),
        pc('PC2', '10.1.1.12'),
      ],
      links: [
        { a: 'PC1:fa0', b: 'SW1:fa0/1' },
        { a: 'PC2:fa0', b: 'SW1:fa0/2' },
      ],
    };
    const sim = new NetworkSim(lab);
    expect(show(sim, 'SW1', 'show port-security address')).not.toMatch(/Sticky/);
    // a check is a dry run: it behaves like real traffic (it passes through port security) but changes nothing
    expect(checkPing(sim, 'PC1', '10.1.1.12')).toBe(true);
    expect(sim.check({ type: 'traffic', from: 'PC1', to: '10.1.1.12', proto: 'icmp' }).pass).toBe(true);
    expect(show(sim, 'SW1', 'show port-security address')).not.toMatch(/Sticky/);
    expect(show(sim, 'SW1', 'show running-config interface fa0/1')).not.toMatch(/sticky [0-9a-f]/);
    // the first real frame learns the address
    run(sim, 'PC1', 'ping 10.1.1.12');
    expect(show(sim, 'SW1', 'show port-security address')).toMatch(/SecureSticky +Fa0\/1/);
    expect(show(sim, 'SW1', 'show running-config interface fa0/1')).toMatch(/mac-address sticky [0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}/);
    // another MAC on the full port is a violation for checks too, without changing the live port
    const rogueLab: LabTopology = { devices: [...lab.devices, { id: 'SW9', model: 'c2960', x: 0, y: 1 }, pc('PC9', '10.1.1.99')], links: [{ a: 'PC1:fa0', b: 'SW9:fa0/1' }, { a: 'SW9:fa0/2', b: 'SW1:fa0/1' }, { a: 'PC9:fa0', b: 'SW9:fa0/3' }, { a: 'PC2:fa0', b: 'SW1:fa0/2' }] };
    const sim2 = new NetworkSim(rogueLab);
    run(sim2, 'PC1', 'ping 10.1.1.12'); // PC1 becomes the secure address
    expect(checkPing(sim2, 'PC9', '10.1.1.12')).toBe(false);
    expect(sim2.devices().find((d) => d.id === 'SW1')!.interfaces.find((i) => i.name === 'FastEthernet0/1')!.status).toBe('up');
    expect(show(sim2, 'SW1', 'show port-security interface fa0/1')).toMatch(/Security Violation Count +: 0/);
    // real traffic from the second MAC is the violation
    run(sim2, 'PC9', 'ping 10.1.1.12');
    expect(show(sim2, 'SW1', 'show port-security interface fa0/1')).toMatch(/Security Violation Count +: 1/);
    expect(sim2.devices().find((d) => d.id === 'SW1')!.interfaces.find((i) => i.name === 'FastEthernet0/1')!.status).toBe('err-disabled');
  });
});

/* ------------------------------------------------------------------ */
/* errdisable recovery                                                 */
/* ------------------------------------------------------------------ */

/** SW1 Fa0/1 (sticky, maximum 1, shutdown) leads to SW2 with two hosts; the server hangs off SW1 Fa0/2. */
function errLab(extra: string[] = []): LabTopology {
  return {
    devices: [
      {
        id: 'SW1',
        model: 'c2960',
        x: 0,
        y: 0,
        config: ['interface FastEthernet0/1', ' switchport mode access', ' switchport port-security', ' switchport port-security mac-address sticky', ...extra].join('\n'),
      },
      { id: 'SW2', model: 'c2960', x: 1, y: 0 },
      pc('PC1', '10.1.1.11'),
      pc('PC2', '10.1.1.12'),
      { id: 'SRV', model: 'server', x: 0, y: 1, host: { ip: '10.1.1.100', mask: '255.255.255.0' } },
    ],
    links: [
      { a: 'SW1:fa0/1', b: 'SW2:fa0/1' },
      { a: 'PC1:fa0', b: 'SW2:fa0/2' },
      { a: 'PC2:fa0', b: 'SW2:fa0/3' },
      { a: 'SRV:fa0', b: 'SW1:fa0/2' },
    ],
  };
}

/** PC1 claims the only secure address, then PC2 sends a frame from a second MAC: Fa0/1 is err-disabled. */
function trip(sim: NetworkSim): void {
  run(sim, 'PC1', 'ping 10.1.1.100');
  run(sim, 'PC2', 'ping 10.1.1.100');
}

describe('errdisable recovery', () => {
  it('re-enables a port after the interval when its cause has recovery enabled', () => {
    const sim = new NetworkSim(errLab());
    cfg(sim, 'SW1', ['errdisable recovery cause psecure-violation', 'errdisable recovery interval 30']);
    trip(sim);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    run(sim, 'SW1', '');
    const early = show(sim, 'SW1', 'show errdisable recovery');
    expect(early).toMatch(/^psecure-violation +Enabled$/m);
    expect(early).toMatch(/^Timer interval: 30 seconds$/m);
    expect(early).toContain('Interfaces that will be enabled at the next timeout:');
    expect(early).toContain('Interface       Errdisable reason       Time left(sec)');
    const left = Number(/^Fa0\/1 +psecure-violation +(\d+)$/m.exec(early)![1]);
    expect(left).toBeGreaterThan(0);
    expect(left).toBeLessThanOrEqual(30);
    // not yet: a few commands are well under 30 simulated seconds
    elapse(sim, 3);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    const later = Number(/^Fa0\/1 +psecure-violation +(\d+)$/m.exec(show(sim, 'SW1', 'show errdisable recovery'))![1]);
    expect(later).toBeLessThan(left);
    // after the interval the port comes back, with the IOS messages
    const logs = elapse(sim, 20);
    expect(logs).toContain('%PM-4-ERR_RECOVER: Attempting to recover from psecure-violation err-disable state on Fa0/1');
    expect(logs).toMatch(/%LINK-3-UPDOWN: Interface FastEthernet0\/1, changed state to up/);
    expect(logs).toMatch(/%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0\/1, changed state to up/);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    expect(show(sim, 'SW1', 'show interfaces status')).toMatch(/^Fa0\/1\s+connected/m);
    expect(show(sim, 'SW1', 'show interfaces status err-disabled')).not.toMatch(/Fa0\/1/);
    expect(show(sim, 'SW1', 'show errdisable recovery')).not.toMatch(/^Fa0\/1 /m);
    expect(show(sim, 'SW1', 'show port-security interface fa0/1')).toMatch(/Port Status +: Secure-up/);
    expect(checkPing(sim, 'PC1', '10.1.1.100')).toBe(true);
  });

  it('errs again after the recovery when the violating device is still there', () => {
    const sim = new NetworkSim(errLab());
    cfg(sim, 'SW1', ['errdisable recovery cause psecure-violation', 'errdisable recovery interval 30']);
    trip(sim);
    elapse(sim, 20);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    // the next frame from the second MAC is the next violation
    run(sim, 'SW1', '');
    run(sim, 'PC2', 'ping 10.1.1.100');
    expect(run(sim, 'SW1', '')).toMatch(/%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0\/1/);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    expect(Number(/^Fa0\/1 +psecure-violation +(\d+)$/m.exec(show(sim, 'SW1', 'show errdisable recovery'))![1])).toBeGreaterThan(20);
    // and the cycle repeats
    expect(elapse(sim, 20)).toContain('%PM-4-ERR_RECOVER');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    expect(show(sim, 'SW1', 'show port-security interface fa0/1')).toMatch(/Security Violation Count +: 2/);
  });

  it('leaves the port down when the cause is not enabled, however long it waits', () => {
    const sim = new NetworkSim(errLab());
    cfg(sim, 'SW1', ['errdisable recovery interval 30', 'errdisable recovery cause bpduguard']);
    trip(sim);
    const out = elapse(sim, 30);
    expect(out).not.toContain('ERR_RECOVER');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    const rec = show(sim, 'SW1', 'show errdisable recovery');
    expect(rec).toMatch(/^psecure-violation +Disabled$/m);
    expect(rec).toMatch(/^bpduguard +Enabled$/m);
    expect(rec).not.toMatch(/^Fa0\/1 +psecure-violation/m);
    // enabling the cause later recovers the port at the next timer check
    cfg(sim, 'SW1', ['errdisable recovery cause psecure-violation']);
    elapse(sim, 3);
    expect(show(sim, 'SW1', 'show logging')).toContain('%PM-4-ERR_RECOVER: Attempting to recover from psecure-violation err-disable state on Fa0/1');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
  });

  it('does nothing by default (300 s) and `all` covers every cause', () => {
    const sim = new NetworkSim(errLab());
    trip(sim);
    expect(show(sim, 'SW1', 'show errdisable recovery')).toMatch(/^Timer interval: 300 seconds$/m);
    expect(elapse(sim, 40)).not.toContain('ERR_RECOVER');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    cfg(sim, 'SW1', ['errdisable recovery cause all', 'errdisable recovery interval 30']);
    const rec = show(sim, 'SW1', 'show errdisable recovery');
    for (const cause of ['arp-inspection', 'bpduguard', 'dhcp-rate-limit', 'link-flap', 'psecure-violation', 'storm-control', 'udld']) expect(rec).toMatch(new RegExp(`^${cause} +Enabled$`, 'm'));
    elapse(sim, 3);
    expect(show(sim, 'SW1', 'show logging')).toContain('%PM-4-ERR_RECOVER');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/^errdisable recovery cause all\nerrdisable recovery interval 30$/m);
  });

  it('keeps manual shutdown / no shutdown recovery working', () => {
    const sim = new NetworkSim(errLab());
    cfg(sim, 'SW1', ['errdisable recovery cause psecure-violation', 'errdisable recovery interval 30']);
    trip(sim);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    cfg(sim, 'SW1', ['interface fa0/1', 'shutdown']);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('admin-down');
    expect(show(sim, 'SW1', 'show errdisable recovery')).not.toMatch(/^Fa0\/1 /m);
    // an administratively down port is never "recovered" by the timer
    expect(elapse(sim, 20)).not.toContain('ERR_RECOVER');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('admin-down');
    cfg(sim, 'SW1', ['interface fa0/1', 'no shutdown']);
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
    // clear errdisable interface works too
    run(sim, 'PC2', 'ping 10.1.1.100');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('err-disabled');
    run(sim, 'SW1', 'clear errdisable interface fa0/1');
    expect(iface(sim, 'FastEthernet0/1').status).toBe('up');
  });

  it('recovers BPDU guard ports and lets the guard strike again while the switch is still attached', () => {
    const lab: LabTopology = {
      devices: [
        { id: 'SW1', model: 'c2960', x: 0, y: 0 },
        { id: 'SW2', model: 'c2960', x: 1, y: 0 },
      ],
      links: [{ a: 'SW1:g0/1', b: 'SW2:g0/1' }],
    };
    const sim = new NetworkSim(lab);
    cfg(sim, 'SW1', ['errdisable recovery cause bpduguard', 'errdisable recovery interval 30', 'interface g0/1', 'spanning-tree portfast', 'spanning-tree bpduguard enable']);
    expect(iface(sim, 'GigabitEthernet0/1').status).toBe('err-disabled');
    let out = '';
    for (let i = 0; i < 40 && !out.includes('ERR_RECOVER'); i++) out += `${run(sim, 'SW1', 'show clock')}\n`;
    expect(out).toContain('%PM-4-ERR_RECOVER: Attempting to recover from bpduguard err-disable state on Gi0/1');
    // the BPDUs are still arriving: the guard errs the port again, and the recovery timer starts over
    expect(out).toMatch(/%PM-4-ERR_DISABLE: bpduguard error detected on Gi0\/1/);
    expect(iface(sim, 'GigabitEthernet0/1').status).toBe('err-disabled');
    expect(Number(/^Gi0\/1 +bpduguard +(\d+)$/m.exec(show(sim, 'SW1', 'show errdisable recovery'))![1])).toBeGreaterThan(20);
  });

  it('lists the detection state with `show errdisable detect`', () => {
    const sim = new NetworkSim(errLab());
    const out = show(sim, 'SW1', 'show errdisable detect');
    expect(out).toContain('ErrDisable Reason            Detection    Mode');
    expect(out).toMatch(/^psecure-violation +Enabled +port\/vlan$/m);
    expect(out).toMatch(/^link-flap +Enabled +port$/m);
    cfg(sim, 'SW1', ['no errdisable detect cause link-flap']);
    expect(show(sim, 'SW1', 'show errdisable detect')).toMatch(/^link-flap +Disabled +port$/m);
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/^no errdisable detect cause link-flap$/m);
    cfg(sim, 'SW1', ['errdisable detect cause link-flap']);
    expect(show(sim, 'SW1', 'show errdisable detect')).toMatch(/^link-flap +Enabled +port$/m);
    expect(show(sim, 'SW1', 'show running-config')).not.toMatch(/errdisable detect/);
  });

  it('keeps the recovery timer across snapshot/restore', () => {
    const lab = errLab();
    const sim = new NetworkSim(lab);
    cfg(sim, 'SW1', ['errdisable recovery cause psecure-violation', 'errdisable recovery interval 30']);
    trip(sim);
    elapse(sim, 3);
    const restored = NetworkSim.fromSnapshot(lab, JSON.parse(JSON.stringify(sim.snapshot())));
    expect(iface(restored, 'FastEthernet0/1').status).toBe('err-disabled');
    expect(show(restored, 'SW1', 'show errdisable recovery')).toMatch(/^Fa0\/1 +psecure-violation +\d+$/m);
    expect(elapse(restored, 20)).toContain('%PM-4-ERR_RECOVER');
    expect(iface(restored, 'FastEthernet0/1').status).toBe('up');
  });
});

/* ------------------------------------------------------------------ */
/* lab-port-security                                                   */
/* ------------------------------------------------------------------ */

describe('lab-port-security', () => {
  const lab = (): LabTopology => ({ devices: portSecurityLab.devices, links: portSecurityLab.links });

  it('hard-codes the MAC address the simulator derives for PC3 (the pocket switch trips Fa0/3 at load)', () => {
    const sim = new NetworkSim(lab());
    const sw1 = portSecurityLab.devices.find((d) => d.id === 'SW1')!;
    expect(sw1.config, 'PC3 MAC in the lab config').toContain(`switchport port-security mac-address ${macOf(sim, 'PC3')}`);
    expect(iface(sim, 'FastEthernet0/3').status).toBe('err-disabled');
  });

  it('turns the sticky-learning checks green only after real traffic from the PCs', () => {
    const sim = new NetworkSim(lab());
    const task = (id: string) => portSecurityLab.tasks.find((t) => t.id === id)!;
    const failing = (id: string) => task(id).checks.map((c) => sim.check(c)).filter((r) => !r.pass);
    // the learner's configuration, without any traffic
    const sw1 = (portSecurityLab.solution.SW1 as string).split('\n').filter((l) => !/^do (ping|write)/.test(l));
    const t = sim.terminal('SW1');
    for (const l of sw1) t.execute(l);
    expect(failing('secure-fa01').map((r) => r.detail).join('\n')).toMatch(/show port-security address/);
    expect(failing('secure-fa02').map((r) => r.detail).join('\n')).toMatch(/show port-security address/);
    run(sim, 'PC1', 'ping 192.168.10.100');
    run(sim, 'PC2', 'ping 192.168.10.100');
    expect(failing('secure-fa01')).toEqual([]);
    expect(failing('secure-fa02')).toEqual([]);
    const addr = show(sim, 'SW1', 'show port-security address');
    expect(addr).toMatch(/SecureSticky +Fa0\/1/);
    expect(addr).toMatch(/SecureSticky +Fa0\/2/);
    expect(addr).toMatch(/SecureConfigured +Fa0\/3/);
  });
});
