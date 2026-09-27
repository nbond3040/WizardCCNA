import { describe, expect, it } from 'vitest';
import { build, cfg, run, show } from './helpers';

const one = () => build([{ id: 'R1', model: 'isr4321', x: 0, y: 0 }]);

describe('modes and prompts', () => {
  it('walks the IOS mode hierarchy', () => {
    const sim = one();
    const t = sim.terminal('R1');
    expect(t.prompt()).toBe('R1>');
    t.execute('enable');
    expect(t.prompt()).toBe('R1#');
    expect(t.execute('configure terminal').output).toBe('Enter configuration commands, one per line.  End with CNTL/Z.');
    expect(t.prompt()).toBe('R1(config)#');
    t.execute('interface g0/0/0');
    expect(t.prompt()).toBe('R1(config-if)#');
    t.execute('exit');
    expect(t.prompt()).toBe('R1(config)#');
    t.execute('interface g0/0/0.10');
    expect(t.prompt()).toBe('R1(config-subif)#');
    t.execute('interface range g0/0/0 - 1');
    expect(t.prompt()).toBe('R1(config-if-range)#');
    t.execute('line vty 0 4');
    expect(t.prompt()).toBe('R1(config-line)#');
    t.execute('router ospf 1');
    expect(t.prompt()).toBe('R1(config-router)#');
    t.execute('ip dhcp pool LAN');
    expect(t.prompt()).toBe('R1(dhcp-config)#');
    t.execute('ip access-list standard MGMT');
    expect(t.prompt()).toBe('R1(config-std-nacl)#');
    t.execute('ip access-list extended WEB');
    expect(t.prompt()).toBe('R1(config-ext-nacl)#');
    t.execute('ipv6 unicast-routing');
    t.execute('ipv6 router ospf 1');
    expect(t.prompt()).toBe('R1(config-rtr)#');
    const r = t.execute('end');
    expect(t.prompt()).toBe('R1#');
    expect(r.output).toMatch(/%SYS-5-CONFIG_I: Configured from console by console/);
    t.execute('disable');
    expect(t.prompt()).toBe('R1>');
  });

  it('enters config-vlan on switches and applies the VLAN on exit', () => {
    const sim = build([{ id: 'SW1', model: 'c2960', x: 0, y: 0 }]);
    const t = sim.terminal('SW1');
    run(sim, 'SW1', ['enable', 'configure terminal', 'vlan 10', 'name SALES']);
    expect(t.prompt()).toBe('SW1(config-vlan)#');
    expect(sim.check({ type: 'vlan', device: 'SW1', vlan: 10 }).pass).toBe(false);
    t.execute('exit');
    expect(sim.check({ type: 'vlan', device: 'SW1', vlan: 10, name: 'SALES' }).pass).toBe(true);
  });

  it('falls back to global configuration commands from sub-modes', () => {
    const sim = one();
    const t = sim.terminal('R1');
    run(sim, 'R1', ['enable', 'conf t', 'int g0/0/0']);
    t.execute('hostname EDGE');
    expect(t.prompt()).toBe('EDGE(config)#');
  });

  it('handles Ctrl+Z and Ctrl+C in configuration mode', () => {
    const sim = one();
    const t = sim.terminal('R1');
    run(sim, 'R1', ['enable', 'conf t', 'int g0/0/0']);
    t.interrupt('ctrl-z');
    expect(t.prompt()).toBe('R1#');
    run(sim, 'R1', ['conf t']);
    t.interrupt('ctrl-c');
    expect(t.prompt()).toBe('R1#');
  });
});

describe('abbreviations, errors and do/no', () => {
  it('accepts unique-prefix abbreviations', () => {
    const sim = one();
    const out = run(sim, 'R1', ['en', 'conf t', 'int gi0/0/0', 'ip add 10.1.1.1 255.255.255.0', 'no shut', 'end', 'sh ip int br']);
    expect(out).toMatch(/GigabitEthernet0\/0\/0\s+10\.1\.1\.1\s+YES manual down\s+down/);
    expect(out).toMatch(/%LINK-3-UPDOWN: Interface GigabitEthernet0\/0\/0, changed state to down/);
  });

  it('accepts every interface naming style', () => {
    const sim = one();
    const t = sim.terminal('R1');
    run(sim, 'R1', ['enable', 'configure terminal']);
    for (const n of ['interface GigabitEthernet0/0/1', 'interface GigabitEthernet 0/0/1', 'int g0/0/1', 'int Gig0/0/1', 'int gi 0/0/1', 'int s0/1/0', 'int se0/1/0', 'int lo0', 'interface loopback 1']) {
      expect(t.execute(n).output).not.toMatch(/% (Invalid|Incomplete|Ambiguous)/);
      expect(t.prompt()).toBe('R1(config-if)#');
      t.execute('exit');
    }
  });

  it('prints the caret under the first invalid word', () => {
    const sim = one();
    run(sim, 'R1', 'enable');
    expect(show(sim, 'R1', 'show ip intx brief')).toBe("           ^\n% Invalid input detected at '^' marker.");
    const t = sim.terminal('R1');
    t.execute('configure terminal');
    expect(t.execute('hostnamex R1').output).toBe("           ^\n% Invalid input detected at '^' marker.");
    expect(t.execute('interface g0/0/7').output).toMatch(/\^\n% Invalid input detected at '\^' marker\./);
  });

  it('reports ambiguous and incomplete commands', () => {
    const sim = one();
    run(sim, 'R1', 'enable');
    expect(show(sim, 'R1', 'sh i')).toBe('% Ambiguous command:  "sh i"');
    expect(show(sim, 'R1', 'show ip')).toBe('% Incomplete command.');
    const t = sim.terminal('R1');
    t.execute('conf t');
    expect(t.execute('ip address').output).toBe("              ^\n% Invalid input detected at '^' marker.");
    t.execute('interface g0/0/0');
    expect(t.execute('ip address').output).toBe('% Incomplete command.');
  });

  it('treats an unknown EXEC word as a host name', () => {
    const sim = one();
    expect(run(sim, 'R1', 'xyz')).toBe('Translating "xyz"...domain server (255.255.255.255)\n% Unknown command or computer name, or unable to find computer address');
    cfg(sim, 'R1', 'no ip domain-lookup');
    expect(show(sim, 'R1', 'xyz')).toBe('Translating "xyz"\n% Unknown command or computer name, or unable to find computer address');
  });

  it('runs EXEC commands with do and removes settings with no', () => {
    const sim = one();
    run(sim, 'R1', ['enable', 'conf t', 'interface g0/0/0', 'ip address 10.1.1.1 255.255.255.0']);
    expect(run(sim, 'R1', 'do show ip interface brief')).toMatch(/GigabitEthernet0\/0\/0\s+10\.1\.1\.1/);
    run(sim, 'R1', ['no ip address', 'end']);
    expect(show(sim, 'R1', 'show running-config interface g0/0/0')).toMatch(/ no ip address/);
  });

  it('keeps command history', () => {
    const sim = one();
    run(sim, 'R1', ['enable', 'show clock', 'show version']);
    expect(sim.terminal('R1').history()).toEqual(['enable', 'show clock', 'show version']);
    expect(show(sim, 'R1', 'show history')).toMatch(/ {2}show clock\n {2}show version/);
  });

  it('rejects bad masks and overlapping addresses', () => {
    const sim = one();
    const out = cfg(sim, 'R1', ['interface g0/0/0', 'ip address 10.1.1.1 255.255.255.0', 'interface g0/0/1', 'ip address 10.1.1.5 255.255.255.0', 'ip address 10.2.2.0 255.255.255.0', 'exit', 'ip route 10.9.9.1 255.255.255.0 10.1.1.2']);
    expect(out).toMatch(/% 10\.1\.1\.0 overlaps with GigabitEthernet0\/0\/0/);
    expect(out).toMatch(/Bad mask \/24 for address 10\.2\.2\.0/);
    expect(out).toMatch(/%Inconsistent address and mask/);
  });
});

describe('context help and completion', () => {
  it('lists commands with ?', () => {
    const sim = one();
    const t = sim.terminal('R1');
    const h = t.help('');
    expect(h.startsWith('Exec commands:')).toBe(true);
    expect(h).toMatch(/^ {2}enable +Turn on privileged commands$/m);
    expect(h).not.toMatch(/configure/);
    expect(t.help('sh')).toBe('show  ');
    t.execute('enable');
    expect(t.help('co')).toBe('configure  connect  copy  ');
    expect(t.help('show ')).toMatch(/^ {2}running-config +Current operating configuration$/m);
    expect(t.help('show ip route ')).toMatch(/<cr>$/);
    expect(t.help('show ip route ')).toMatch(/^ {2}\| +Output modifiers$/m);
    expect(t.help('show ipx ')).toBe("        ^\n% Invalid input detected at '^' marker.");
    t.execute('configure terminal');
    expect(t.help('')).toMatch(/^Configure commands:/);
    expect(t.help('interface ')).toMatch(/^ {2}GigabitEthernet +GigabitEthernet IEEE 802\.3z$/m);
    expect(t.help('interface GigabitEthernet ')).toBe('  <0-0>  GigabitEthernet interface number');
    expect(t.help('hostname ')).toMatch(/WORD/);
    t.execute('interface g0/0/0');
    expect(t.help('ip address ')).toMatch(/^ {2}A\.B\.C\.D +IP address$/m);
    expect(t.help('ip address ')).toMatch(/^ {2}dhcp +IP Address negotiated via DHCP$/m);
  });

  it('completes the last word with Tab', () => {
    const sim = one();
    const t = sim.terminal('R1');
    t.execute('enable');
    expect(t.complete('conf').line).toBe('configure ');
    expect(t.complete('sh ip int b').line).toBe('sh ip int brief ');
    expect(t.complete('c').line).toBe('c');
    expect(t.complete('c').options).toContain('configure');
    t.execute('conf t');
    expect(t.complete('int g0/0/0').line).toBe('int GigabitEthernet0/0/0 ');
  });
});

describe('interactive prompts', () => {
  it('asks for the enable secret and gives up after three tries', () => {
    const sim = one();
    cfg(sim, 'R1', 'enable secret class');
    const t = sim.terminal('R1');
    t.execute('disable');
    t.execute('enable');
    expect(t.prompt()).toBe('Password: ');
    expect(t.isSecretInput()).toBe(true);
    t.execute('a');
    t.execute('b');
    expect(t.execute('c').output).toBe('% Bad secrets');
    expect(t.prompt()).toBe('R1>');
    t.execute('enable');
    t.execute('class');
    expect(t.prompt()).toBe('R1#');
  });

  it('collects multi-line banners until the delimiter', () => {
    const sim = one();
    const out = cfg(sim, 'R1', ['banner motd #', 'Authorized access only', 'Violators will be prosecuted', '#']);
    expect(out).toMatch(/Enter TEXT message\.  End with the character '#'\./);
    expect(show(sim, 'R1', 'show running-config')).toMatch(/banner motd \^C\nAuthorized access only\nViolators will be prosecuted\n\^C/);
  });

  it('copies running-config to startup-config with a filename prompt', () => {
    const sim = one();
    cfg(sim, 'R1', 'hostname EDGE');
    const t = sim.terminal('R1');
    t.execute('copy running-config startup-config');
    expect(t.prompt()).toBe('Destination filename [startup-config]? ');
    expect(t.execute('').output).toBe('Building configuration...\n[OK]');
    expect(sim.check({ type: 'saved', device: 'R1' }).pass).toBe(true);
  });

  it('reloads to the startup configuration', () => {
    const sim = one();
    cfg(sim, 'R1', 'hostname TEMP');
    const t = sim.terminal('R1');
    t.execute('reload');
    expect(t.prompt()).toBe('System configuration has been modified. Save? [yes/no]: ');
    t.execute('no');
    expect(t.prompt()).toBe('Proceed with reload? [confirm]');
    const r = t.execute('');
    expect(r.clear).toBe(true);
    expect(r.output).toMatch(/Press RETURN to get started!/);
    t.execute('');
    expect(t.prompt()).toBe('R1>');
  });

  it('erases the startup-config', () => {
    const sim = one();
    const t = sim.terminal('R1');
    t.execute('enable');
    t.execute('erase startup-config');
    expect(t.prompt()).toMatch(/Continue\? \[confirm\]$/);
    expect(t.execute('').output).toMatch(/^\[OK\]\nErase of nvram: complete/);
    expect(show(sim, 'R1', 'show startup-config')).toBe('startup-config is not present');
    t.execute('reload');
    t.execute('');
    t.execute('');
    expect(t.prompt()).toBe('Router>');
  });

  it('requires the console password after logout', () => {
    const sim = one();
    cfg(sim, 'R1', ['line console 0', 'password cisco', 'login']);
    const t = sim.terminal('R1');
    expect(t.execute('logout').output).toMatch(/R1 con0 is now available[\s\S]*Press RETURN to get started\./);
    expect(t.prompt()).toBe('');
    expect(t.execute('').output).toMatch(/User Access Verification/);
    expect(t.prompt()).toBe('Password: ');
    t.execute('cisco');
    expect(t.prompt()).toBe('R1>');
  });
});

describe('output modifiers', () => {
  it('supports include / exclude / begin / section', () => {
    const sim = one();
    cfg(sim, 'R1', ['interface g0/0/0', 'description UPLINK', 'ip address 10.1.1.1 255.255.255.0']);
    expect(show(sim, 'R1', 'show running-config | include hostname')).toBe('hostname R1');
    expect(show(sim, 'R1', 'sh run | i ^interface')).toBe(['interface GigabitEthernet0/0/0', 'interface GigabitEthernet0/0/1', 'interface Serial0/1/0', 'interface Serial0/1/1'].join('\n'));
    expect(show(sim, 'R1', 'show running-config | section GigabitEthernet0/0/0')).toBe(['interface GigabitEthernet0/0/0', ' description UPLINK', ' ip address 10.1.1.1 255.255.255.0', ' shutdown', ' negotiation auto'].join('\n'));
    expect(show(sim, 'R1', 'show ip interface brief | exclude unassigned')).not.toMatch(/Serial/);
    expect(show(sim, 'R1', 'show running-config | begin line con')).toMatch(/^line con 0/);
  });
});

describe('passwords and secrets', () => {
  it('hashes secrets and encrypts passwords', () => {
    const sim = build([
      { id: 'R1', model: 'isr4321', x: 0, y: 0 },
      { id: 'SW1', model: 'c2960', x: 1, y: 0 },
    ]);
    cfg(sim, 'R1', ['enable secret class', 'username admin privilege 15 secret cisco123', 'line vty 0 4', 'password cisco', 'login local', 'exit', 'service password-encryption']);
    const r = show(sim, 'R1', 'show running-config');
    expect(r).toMatch(/^enable secret 9 \$9\$/m);
    expect(r).toMatch(/^username admin privilege 15 secret 9 \$9\$/m);
    expect(r).toMatch(/^ password 7 [0-9A-F]+$/m);
    expect(r).toMatch(/^service password-encryption$/m);
    cfg(sim, 'SW1', ['enable secret class']);
    expect(show(sim, 'SW1', 'show running-config')).toMatch(/^enable secret 5 \$1\$/m);
  });

  it('decodes type 7 passwords from configuration files', () => {
    const sim = build([{ id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'line con 0\n password 7 0822455D0A16\n login' }]);
    const t = sim.terminal('R1');
    t.execute('');
    expect(t.prompt()).toBe('Password: ');
    t.execute('cisco');
    expect(t.prompt()).toBe('R1>');
  });
});
