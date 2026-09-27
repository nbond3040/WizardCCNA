/** Device-level show commands: version, interfaces, ip interface brief, clock, users, logging, arp... */
import type { Ctx } from '../cli/session';
import type { Net } from '../engine/net';
import { ek } from '../engine/net';
import { ifNames, ifMac, isPhysical } from '../engine/topo';
import { isL3If } from '../engine/l3';
import { ifBandwidth } from '../engine/ospf';
import type { IosDevice } from '../model/state';
import { parentOf, shortIf, typeOfName } from '../model/ifname';
import { iosClock, pad, padL, uptime, hms } from '../util/format';
import { ipStr, maskLen } from '../util/ip';
import { macDotted, macColon } from '../util/mac';
import { interfaceLines, runningConfig } from './running';

/* ---------------- show version ---------------- */

export function showVersion(c: Ctx): void {
  const dev = c.dev;
  const hw = dev.hw;
  const host = dev.st.cfg.hostname;
  const up = uptime(c.net.uptimeSec(dev));
  const reg = `0x${dev.st.cfg.confReg.toString(16).toUpperCase().replace(/^([0-9A-F]+)$/, (m) => m)}`;
  const regLine = `Configuration register is ${reg}${dev.st.cfg.nextConfReg !== undefined && dev.st.cfg.nextConfReg !== dev.st.cfg.confReg ? ` (will be 0x${dev.st.cfg.nextConfReg.toString(16).toUpperCase()} at next reload)` : ''}`;
  const o = c.out;
  if (dev.model === 'isr4321') {
    o.push(
      'Cisco IOS XE Software, Version 16.09.04',
      'Cisco IOS Software [Fuji], ISR Software (X86_64_LINUX_IOSD-UNIVERSALK9-M), Version 16.9.4, RELEASE SOFTWARE (fc2)',
      'Technical Support: http://www.cisco.com/techsupport',
      'Copyright (c) 1986-2019 by Cisco Systems, Inc.',
      'Compiled Thu 22-Aug-19 18:14 by mcpre',
      '',
      '',
      'Cisco IOS-XE software, Copyright (c) 2005-2019 by cisco Systems, Inc.',
      'All rights reserved.  Certain components of Cisco IOS-XE software are',
      'licensed under the GNU General Public License ("GPL") Version 2.0.  The',
      'software code licensed under GPL Version 2.0 is free software that comes',
      'with ABSOLUTELY NO WARRANTY.  You can redistribute and/or modify such',
      'GPL code under the terms of GPL Version 2.0.  For more details, see the',
      'documentation or "License Notice" file accompanying the IOS-XE software,',
      'or the applicable URL provided on the flyer accompanying the IOS-XE',
      'software.',
      '',
      '',
      'ROM: IOS-XE ROMMON',
      '',
      `${host} uptime is ${up}`,
      `Uptime for this control processor is ${up}`,
      'System returned to ROM by Reload Command',
      `System image file is "${hw.imageFile}"`,
      'Last reload reason: Reload Command',
      '',
      '',
      'Technology Package License Information:',
      '',
      '-----------------------------------------------------------------',
      'Technology    Technology-package           Technology-package',
      '              Current       Type           Next reboot',
      '------------------------------------------------------------------',
      'appxk9           None             None             None',
      'uck9             None             None             None',
      'securityk9       None             None             None',
      'ipbase           ipbasek9         Permanent        ipbasek9',
      '',
      'cisco ISR4321/K9 (1RU) processor with 1647778K/6147K bytes of memory.',
      `Processor board ID ${hw.serial}`,
      '2 Gigabit Ethernet interfaces',
      '2 Serial interfaces',
      '32768K bytes of non-volatile configuration memory.',
      '4194304K bytes of physical memory.',
      '3223551K bytes of flash memory at bootflash:.',
      '',
      regLine,
    );
    return;
  }
  if (dev.model === 'isr2911') {
    o.push(
      'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M3, RELEASE SOFTWARE (fc2)',
      'Technical Support: http://www.cisco.com/techsupport',
      'Copyright (c) 1986-2018 by Cisco Systems, Inc.',
      'Compiled Wed 01-Aug-18 16:45 by prod_rel_team',
      '',
      'ROM: System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE (fc1)',
      '',
      `${host} uptime is ${up}`,
      'System returned to ROM by power-on',
      `System image file is "${hw.imageFile}"`,
      'Last reload type: Normal Reload',
      'Last reload reason: power-on',
      '',
      'Cisco CISCO2911/K9 (revision 1.0) with 491520K/32768K bytes of memory.',
      `Processor board ID ${hw.serial}`,
      '3 Gigabit Ethernet interfaces',
      '2 Serial(sync/async) interfaces',
      '1 terminal line',
      'DRAM configuration is 64 bits wide with parity enabled.',
      '255K bytes of non-volatile configuration memory.',
      '250880K bytes of ATA System CompactFlash 0 (Read/Write)',
      '',
      regLine,
    );
    return;
  }
  const mac = macColon(dev.mac);
  if (dev.model === 'c2960') {
    o.push(
      'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4, RELEASE SOFTWARE (fc1)',
      'Technical Support: http://www.cisco.com/techsupport',
      'Copyright (c) 1986-2013 by Cisco Systems, Inc.',
      'Compiled Wed 26-Jun-13 02:49 by prod_rel_team',
      '',
      'ROM: Bootstrap program is C2960 boot loader',
      'BOOTLDR: C2960 Boot Loader (C2960-HBOOT-M) Version 12.2(25r)FX, RELEASE SOFTWARE (fc4)',
      '',
      `${host} uptime is ${up}`,
      'System returned to ROM by power-on',
      `System image file is "${hw.imageFile}"`,
      '',
      'cisco WS-C2960-24TT-L (PowerPC405) processor (revision B0) with 65536K bytes of memory.',
      `Processor board ID ${hw.serial}`,
      'Last reset from power-on',
      '1 Virtual Ethernet interface',
      '24 FastEthernet interfaces',
      '2 Gigabit Ethernet interfaces',
      'The password-recovery mechanism is enabled.',
      '',
      '64K bytes of flash-simulated non-volatile configuration memory.',
      `Base ethernet MAC Address       : ${mac}`,
      'Motherboard assembly number     : 73-10390-03',
      'Power supply part number        : 341-0097-02',
      'Motherboard serial number       : FOC10093R12',
      'Power supply serial number      : AZS1007032H',
      'Model revision number           : B0',
      'Motherboard revision number     : B0',
      'Model number                    : WS-C2960-24TT-L',
      `System serial number            : ${hw.serial}`,
      'Top Assembly Part Number        : 800-27221-02',
      'Top Assembly Revision Number    : A0',
      'Version ID                      : V02',
      'CLEI Code Number                : COM3L00BRA',
      'Hardware Board Revision Number  : 0x01',
      '',
      '',
      'Switch Ports Model              SW Version            SW Image',
      '------ ----- -----              ----------            ----------',
      '*    1 26    WS-C2960-24TT-L    15.0(2)SE4            C2960-LANBASEK9-M',
      '',
      '',
      regLine,
    );
    return;
  }
  o.push(
    'Cisco IOS XE Software, Version 16.03.07',
    'Cisco IOS Software [Denali], Catalyst L3 Switch Software (CAT3K_CAA-UNIVERSALK9-M), Version 16.3.7, RELEASE SOFTWARE (fc4)',
    'Technical Support: http://www.cisco.com/techsupport',
    'Copyright (c) 1986-2018 by Cisco Systems, Inc.',
    'Compiled Fri 20-Jul-18 03:14 by mcpre',
    '',
    '',
    'ROM: IOS-XE ROMMON',
    'BOOTLDR: CAT3K_CAA Boot Loader (CAT3K_CAA-HBOOT-M) Version 4.68, RELEASE SOFTWARE (P)',
    '',
    `${host} uptime is ${up}`,
    `Uptime for this control processor is ${up}`,
    'System returned to ROM by Reload Command',
    `System image file is "${hw.imageFile}"`,
    'Last reload reason: Reload command',
    '',
    'cisco WS-C3650-24PS (MIPS) processor (revision N0) with 865815K/6147K bytes of memory.',
    `Processor board ID ${hw.serial}`,
    '28 Gigabit Ethernet interfaces',
    '2048K bytes of non-volatile configuration memory.',
    '4194304K bytes of physical memory.',
    '252000K bytes of Crash Files at crashinfo:.',
    '1611414K bytes of Flash at flash:.',
    '',
    `Base Ethernet MAC Address          : ${mac.toLowerCase()}`,
    'Motherboard Assembly Number        : 73-15899-06',
    `System Serial Number               : ${hw.serial}`,
    'Model Revision Number              : N0',
    'Model Number                       : WS-C3650-24PS',
    '',
    '',
    'Switch Ports Model              SW Version        SW Image              Mode',
    '------ ----- -----              ----------        ----------            ----',
    '*    1 28    WS-C3650-24PS      16.3.7            CAT3K_CAA-UNIVERSALK9 INSTALL',
    '',
    '',
    regLine,
  );
}

/* ---------------- interface status helpers ---------------- */

export function statusWords(net: Net, dev: IosDevice, name: string): { status: string; proto: string } {
  const st = net.d.l2.ifs.get(ek(dev.id, name));
  if (!st) return { status: 'down', proto: 'down' };
  const status = st.line === 'admin-down' ? 'administratively down' : st.line;
  return { status, proto: st.proto };
}

/* ---------------- show ip interface brief ---------------- */

export function showIpIntBrief(c: Ctx): void {
  const dev = c.dev;
  c.out.push('Interface              IP-Address      OK? Method Status                Protocol');
  for (const name of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[name];
    if (cfg.sw && name.startsWith('Port-channel') === false && !isPhysical(dev, name)) continue;
    const a4 = c.net.d.addrs.get(ek(dev.id, name))?.[0];
    const ip = !cfg.sw && a4 ? ipStr(a4.ip) : 'unassigned';
    const method = cfg.sw ? 'unset' : cfg.dhcp ? 'DHCP' : cfg.ip ? cfg.method : 'unset';
    const { status, proto } = statusWords(c.net, dev, name);
    c.out.push(`${pad(name, 23)}${pad(ip, 16)}YES ${pad(method, 7)}${pad(status, 22)}${proto}`);
  }
}

/* ---------------- show interfaces ---------------- */

function hwDesc(dev: IosDevice, name: string): string {
  const t = typeOfName(name)?.name;
  if (t === 'Loopback') return 'Loopback';
  if (t === 'Vlan') return 'EtherSVI';
  if (t === 'Port-channel') return 'EtherChannel';
  if (t === 'Tunnel') return 'Tunnel';
  if (t === 'Serial') return dev.model === 'isr4321' ? 'NIM-2T' : 'WIC MBRD Serial';
  if (dev.model === 'isr4321') return 'ISR4321-2x1GE';
  if (dev.model === 'isr2911') return 'CN Gigabit Ethernet';
  if (t === 'FastEthernet') return 'Fast Ethernet';
  return 'Gigabit Ethernet';
}

export function interfaceDetail(c: Ctx, name: string): string[] {
  const dev = c.dev;
  const net = c.net;
  const cfg = dev.st.cfg.ifaces[name];
  const st = net.d.l2.ifs.get(ek(dev.id, name));
  const t = typeOfName(name)?.name;
  const out: string[] = [];
  const line = !st ? 'down' : st.line === 'admin-down' ? 'administratively down' : st.line;
  let proto: string = st?.proto ?? 'down';
  if (cfg.sw || (dev.kind !== 'router' && isPhysical(dev, name))) {
    const why = st?.errdis ? 'err-disabled' : st?.status === 'connected' ? 'connected' : st?.line === 'admin-down' ? 'disabled' : st?.status === 'suspended' ? 'suspended' : 'notconnect';
    proto = `${proto} (${why})`;
  }
  out.push(`${name} is ${line}, line protocol is ${proto} `);
  const mac = t === 'Loopback' || t === 'Tunnel' || t === 'Serial' ? undefined : macDotted(ifMac(dev, name));
  out.push(`  Hardware is ${hwDesc(dev, name)}${mac ? `, address is ${mac} (bia ${mac})` : ''}`);
  if (cfg.description) out.push(`  Description: ${cfg.description}`);
  const a4 = net.d.addrs.get(ek(dev.id, name))?.[0];
  if (a4 && !cfg.sw) out.push(`  Internet address is ${ipStr(a4.ip)}/${maskLen(a4.mask)}`);
  const bw = ifBandwidth(net, net.d.l2, dev, name);
  const dly = cfg.delay !== undefined ? cfg.delay * 10 : (typeOfName(name)?.dly ?? 10);
  out.push(`  MTU ${cfg.mtu ?? 1500} bytes, BW ${bw} Kbit/sec, DLY ${dly} usec, `, '     reliability 255/255, txload 1/255, rxload 1/255');
  if (t === 'Serial') out.push(`  Encapsulation ${cfg.serialEncap === 'ppp' ? 'PPP' : 'HDLC'}, loopback not set`, '  Keepalive set (10 sec)');
  else if (cfg.dot1q) out.push(`  Encapsulation 802.1Q Virtual LAN, Vlan ID  ${cfg.dot1q.vlan}.`);
  else if (t === 'Loopback') out.push('  Encapsulation LOOPBACK, loopback not set', '  Keepalive set (10 sec)');
  else out.push('  Encapsulation ARPA, loopback not set', t === 'Vlan' ? '  Keepalive not supported ' : '  Keepalive set (10 sec)');
  if (isPhysical(dev, name) && t !== 'Serial') {
    const l1 = net.d.l2.l1.get(ek(dev.id, name));
    const up = !!l1?.carrier;
    const dup = up ? (l1!.duplex === 'full' ? 'Full-duplex' : 'Half-duplex') : cfg.duplex === 'auto' ? 'Auto-duplex' : cfg.duplex === 'full' ? 'Full-duplex' : 'Half-duplex';
    const sp = up ? `${l1!.speed}Mb/s` : cfg.speed === 'auto' ? 'Auto-speed' : `${cfg.speed}Mb/s`;
    out.push(`  ${dup}, ${sp}, media type is ${t === 'FastEthernet' ? '10/100BaseTX' : dev.kind === 'router' ? 'RJ45' : '10/100/1000BaseTX'}`);
    out.push('  input flow-control is off, output flow-control is unsupported ');
  }
  if (t === 'Port-channel') {
    const b = net.d.l2.bundles.get(ek(dev.id, name));
    const mem = b?.members.filter((m) => m.flag === 'P').map((m) => shortIf(m.ifName)) ?? [];
    out.push(`  Members in this channel: ${mem.join(' ')} `);
  }
  if (t !== 'Loopback') out.push('  ARP type: ARPA, ARP Timeout 04:00:00');
  const dd = dev.st.dyn.ifd[name];
  const lastIn = dd?.inPkts ? '00:00:01' : 'never';
  out.push(`  Last input ${lastIn}, output ${dd?.outPkts ? '00:00:01' : 'never'}, output hang never`);
  out.push(`  Last clearing of "show interface" counters ${dd?.lastClear !== undefined ? hms((net.clock - dd.lastClear) / 1000) : 'never'}`);
  out.push('  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0', '  Queueing strategy: fifo', '  Output queue: 0/40 (size/max)');
  out.push('  5 minute input rate 0 bits/sec, 0 packets/sec', '  5 minute output rate 0 bits/sec, 0 packets/sec');
  const l1 = net.d.l2.l1.get(ek(dev.id, name));
  const dm = !!l1?.duplexMismatch && l1.carrier;
  const inP = (dd?.inPkts ?? 0) + (st?.line === 'up' ? 12 : 0);
  const outP = (dd?.outPkts ?? 0) + (st?.line === 'up' ? 15 : 0);
  const crc = (dd?.crc ?? 0) + (dm && l1?.duplex === 'full' ? 17 : 0);
  const runts = (dd?.runts ?? 0) + (dm && l1?.duplex === 'full' ? 9 : 0);
  const late = (dd?.lateColl ?? 0) + (dm && l1?.duplex === 'half' ? 23 : 0);
  const coll = (dd?.collisions ?? 0) + (dm && l1?.duplex === 'half' ? 41 : 0);
  out.push(
    `     ${inP} packets input, ${(dd?.inBytes ?? 0) + inP * 64} bytes, 0 no buffer`,
    `     Received ${Math.floor(inP / 3)} broadcasts (0 IP multicasts)`,
    `     ${runts} runts, 0 giants, 0 throttles `,
    `     ${crc + runts} input errors, ${crc} CRC, 0 frame, 0 overrun, 0 ignored`,
    '     0 watchdog, 0 multicast, 0 pause input',
    `     ${outP} packets output, ${(dd?.outBytes ?? 0) + outP * 64} bytes, 0 underruns`,
    `     0 output errors, ${coll} collisions, ${dd?.resets ?? 1} interface resets`,
    '     0 unknown protocol drops',
    `     0 babbles, ${late} late collision, 0 deferred`,
    '     0 lost carrier, 0 no carrier, 0 pause output',
    '     0 output buffer failures, 0 output buffers swapped out',
  );
  return out;
}

export function showInterfaces(c: Ctx): void {
  const names = c.a.ifn ? [c.a.ifn as string] : ifNames(c.dev);
  for (const n of names) c.out.push(...interfaceDetail(c, n));
}

export function showIntStatus(c: Ctx): void {
  const dev = c.dev;
  const d = c.net.d;
  c.out.push('', 'Port      Name               Status       Vlan       Duplex  Speed Type ');
  const list = ifNames(dev).filter((n) => isPhysical(dev, n) || n.startsWith('Port-channel'));
  for (const n of list) {
    if (c.a.errdis && !d.l2.ifs.get(ek(dev.id, n))?.errdis) continue;
    const cfg = dev.st.cfg.ifaces[n];
    const st = d.l2.ifs.get(ek(dev.id, n));
    const status = st?.errdis ? 'err-disabled' : st?.status === 'disabled' ? 'disabled' : st?.status ?? 'notconnect';
    const o = d.l2.oper.get(ek(dev.id, n));
    const vlan = !cfg.sw ? 'routed' : o?.mode === 'trunk' ? 'trunk' : String(cfg.accessVlan);
    const l1 = d.l2.l1.get(ek(dev.id, n));
    const up = !!l1?.carrier;
    const dup = cfg.duplex !== 'auto' ? cfg.duplex : up ? `a-${l1!.duplex}` : 'auto';
    const sp = cfg.speed !== 'auto' ? cfg.speed : up ? `a-${l1!.speed}` : 'auto';
    const ph = dev.hw.ifaces.find((p) => p.name === n);
    const type = n.startsWith('Port-channel') ? '' : ph?.type === 'FastEthernet' ? '10/100BaseTX' : '10/100/1000BaseTX';
    c.out.push(`${pad(shortIf(n), 10)}${pad((cfg.description ?? '').slice(0, 18), 19)}${pad(status, 13)}${pad(vlan, 11)}${padL(dup, 6)} ${padL(sp, 6)} ${type}`);
  }
}

export function showIntDescription(c: Ctx): void {
  const dev = c.dev;
  c.out.push('Interface                      Status         Protocol Description');
  for (const n of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[n];
    const { status, proto } = statusWords(c.net, dev, n);
    const s = status === 'administratively down' ? 'admin down' : status;
    c.out.push(`${pad(shortIf(n), 31)}${pad(s, 15)}${pad(proto, 9)}${cfg.description ?? ''}`.replace(/\s+$/, ''));
  }
}

export function showIpInterface(c: Ctx): void {
  const dev = c.dev;
  const names = c.a.ifn ? [c.a.ifn as string] : ifNames(dev).filter((n) => isL3If(dev, n));
  for (const n of names) {
    const cfg = dev.st.cfg.ifaces[n];
    const { status, proto } = statusWords(c.net, dev, n);
    c.out.push(`${n} is ${status}, line protocol is ${proto}`);
    const a4 = c.net.d.addrs.get(ek(dev.id, n));
    if (!a4?.length || cfg.sw) {
      c.out.push('  Internet protocol processing disabled');
      continue;
    }
    c.out.push(`  Internet address is ${ipStr(a4[0].ip)}/${maskLen(a4[0].mask)}`, '  Broadcast address is 255.255.255.255');
    c.out.push(`  Address determined by ${cfg.dhcp ? 'DHCP' : cfg.method === 'NVRAM' ? 'non-volatile memory' : 'setup command'}`);
    c.out.push(`  MTU is ${cfg.ipMtu ?? cfg.mtu ?? 1500} bytes`);
    for (const s of a4.slice(1)) c.out.push(`  Secondary address ${ipStr(s.ip)}/${maskLen(s.mask)}`);
    c.out.push(cfg.helpers.length ? `  Helper addresses are ${cfg.helpers.map(ipStr).join('\n                      ')}` : '  Helper address is not set');
    c.out.push('  Directed broadcast forwarding is disabled');
    const ospfOn = [...c.net.d.ospf.procs.values()].some((p) => p.dev === dev.id && p.ifs.some((i) => i.ifName === n));
    if (ospfOn) c.out.push('  Multicast reserved groups joined: 224.0.0.5 224.0.0.6');
    c.out.push(
      '  Outgoing Common access list is not set ',
      `  Outgoing access list is ${cfg.aclOut ?? 'not set'}`,
      '  Inbound Common access list is not set ',
      `  Inbound  access list is ${cfg.aclIn ?? 'not set'}`,
      `  Proxy ARP is ${cfg.proxyArp ? 'enabled' : 'disabled'}`,
      '  Local Proxy ARP is disabled',
      '  Security level is default',
      '  Split horizon is enabled',
      `  ICMP redirects are ${cfg.redirects ? 'always sent' : 'never sent'}`,
      '  ICMP unreachables are always sent',
      '  ICMP mask replies are never sent',
      '  IP fast switching is enabled',
      '  IP Flow switching is disabled',
      '  IP CEF switching is enabled',
      '  IP CEF switching turbo vector',
      '  IP multicast fast switching is enabled',
      '  IP multicast distributed fast switching is disabled',
      '  IP route-cache flags are Fast, CEF',
      '  Router Discovery is disabled',
      '  IP output packet accounting is disabled',
      '  IP access violation accounting is disabled',
      '  TCP/IP header compression is disabled',
      '  RTP/IP header compression is disabled',
      '  Probe proxy name replies are disabled',
      '  Policy routing is disabled',
      `  Network address translation is ${cfg.nat ? `enabled, interface in domain ${cfg.nat}` : 'disabled'}`,
      '  BGP Policy Mapping is disabled',
      '  Input features: MCI Check',
    );
  }
}

export function showProtocols(c: Ctx): void {
  const dev = c.dev;
  c.out.push('Global values:', `  Internet Protocol routing is ${dev.st.cfg.ipRouting && dev.kind !== 'switch' ? 'enabled' : 'disabled'}`);
  for (const n of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[n];
    const { status, proto } = statusWords(c.net, dev, n);
    c.out.push(`${n} is ${status}, line protocol is ${proto}`);
    const a4 = c.net.d.addrs.get(ek(dev.id, n))?.[0];
    if (a4 && !cfg.sw) c.out.push(`  Internet address is ${ipStr(a4.ip)}/${maskLen(a4.mask)}`);
  }
}

export function showControllers(c: Ctx): void {
  const n = c.a.ifn as string;
  const cfg = c.dev.st.cfg.ifaces[n];
  if (!n.startsWith('Serial')) {
    c.out.push(`Interface ${n}`, `Hardware is ${hwDesc(c.dev, n)}`);
    return;
  }
  const dce = cfg.clockRate !== undefined || (() => {
    const peer = c.net.peerOf(c.dev.id, n);
    const link = c.net.links.find((l) => (l.a.dev === c.dev.id && l.a.ifName === n) || (l.b.dev === c.dev.id && l.b.ifName === n));
    return !!peer && !!link && link.a.dev === c.dev.id && link.a.ifName === n;
  })();
  c.out.push(`Interface ${n}`, `Hardware is ${hwDesc(c.dev, n)}`, dce ? `DCE V.35, clock rate ${cfg.clockRate ?? 2000000}` : 'DTE V.35 TX and RX clocks detected.');
}

/* ---------------- misc ---------------- */

export function showClock(c: Ctx): void {
  const dev = c.dev;
  const dyn = dev.st.dyn;
  const tz = dev.st.cfg.tz;
  const auth = dyn.clockSet || !!dyn.ntpSync;
  c.out.push(`${auth ? '' : '*'}${iosClock(c.net.devClock(dev), tz?.name ?? 'UTC', tz ? tz.h * 60 + (tz.h < 0 ? -tz.m : tz.m) : 0)}`);
}

export function showHistory(c: Ctx): void {
  for (const h of c.s.hist.slice(-10)) c.out.push(`  ${h}`);
}

export function showUsers(c: Ctx): void {
  c.out.push('    Line       User       Host(s)              Idle       Location');
  const list = c.net.sessionsOn?.(c.dev.id, c.s) ?? [];
  for (const s of list) c.out.push(`${s.self ? '*' : ' '}${padL(s.num, 3)} ${pad(s.line, 10)}${pad(s.user, 11)}${pad(s.host, 21)}${s.idle} ${s.location}`.trimEnd());
  c.out.push('', '  Interface    User               Mode         Idle     Peer Address', '');
}

export function showPrivilege(c: Ctx): void {
  c.out.push(`Current privilege level is ${c.s.priv}`);
}

export function showSessions(c: Ctx): void {
  c.out.push('% No connections open');
}

export function showLogging(c: Ctx): void {
  const dev = c.dev;
  const l = dev.st.cfg.log;
  const n = dev.st.dyn.logCount;
  c.out.push(
    'Syslog logging: enabled (0 messages dropped, 0 messages rate-limited,',
    '                0 flushes, 0 overruns, xml disabled, filtering disabled)',
    '',
    'No Active Message Discriminator.',
    '',
    '',
    'No Inactive Message Discriminator.',
    '',
    '',
    `    Console logging: ${l.console === false ? 'disabled' : `level ${l.console ?? 'debugging'}, ${n} messages logged, xml disabled,`}`,
  );
  if (l.console !== false) c.out.push('                     filtering disabled');
  c.out.push(`    Monitor logging: ${l.monitor === false ? 'disabled' : `level ${l.monitor ?? 'debugging'}, 0 messages logged, xml disabled,`}`);
  if (l.monitor !== false) c.out.push('                     filtering disabled');
  c.out.push(`    Buffer logging:  ${l.buffered === false ? 'disabled' : `level ${(l.buffered && l.buffered.level) || 'debugging'}, ${n} messages logged, xml disabled,`}`);
  if (l.buffered !== false) c.out.push('                    filtering disabled');
  c.out.push('    Exception Logging: size (4096 bytes)', '    Count and timestamp logging messages: disabled', '    Persistent logging: disabled', '', 'No active filter modules.', '');
  c.out.push(`    Trap logging: level ${l.trap ?? 'informational'}, ${n + 3} message lines logged`);
  for (const h of l.hosts) {
    c.out.push(`        Logging to ${ipStr(h)}  (udp port 514, audit disabled,`, '              link up),', `              ${n} message lines logged, `, '              0 message lines rate-limited, ', '              0 message lines dropped-by-MD, ', '              xml disabled, sequence number disabled', '              filtering disabled');
  }
  c.out.push(`        Logging Source-Interface:       VRF Name:`, '');
  const size = l.buffered && l.buffered.size ? l.buffered.size : 8192;
  c.out.push(`Log Buffer (${size} bytes):`, '');
  if (l.buffered !== false) c.out.push(...dev.st.dyn.logBuf);
}

export function showArp(c: Ctx): void {
  const dev = c.dev;
  const d = c.net.d;
  c.out.push('Protocol  Address          Age (min)  Hardware Addr   Type   Interface');
  const rows: { ip: number; line: string }[] = [];
  for (const n of Object.keys(dev.st.cfg.ifaces)) {
    const a4 = d.addrs.get(ek(dev.id, n))?.[0];
    const st = d.l2.ifs.get(ek(dev.id, n));
    if (!a4 || !st || st.line !== 'up' || n.startsWith('Loopback') || n.startsWith('Serial')) continue;
    rows.push({ ip: a4.ip, line: `Internet  ${pad(ipStr(a4.ip), 17)}${padL('-', 9)}   ${macDotted(ifMac(dev, n))}  ARPA   ${n}` });
  }
  for (const g of d.hsrp.groups) {
    if (g.active?.dev === dev.id && g.vip !== undefined) rows.push({ ip: g.vip, line: `Internet  ${pad(ipStr(g.vip), 17)}${padL('-', 9)}   ${macDotted(g.vmac)}  ARPA   ${g.active.ifName}` });
  }
  for (const [ipS, e] of Object.entries(dev.st.dyn.arp)) {
    const ip = Number(ipS);
    if (rows.some((r) => r.ip === ip)) continue;
    const ageMin = Math.floor((c.net.clock - e.t) / 60000);
    rows.push({ ip, line: `Internet  ${pad(ipStr(ip), 17)}${padL(String(ageMin), 9)}   ${macDotted(e.mac)}  ARPA   ${e.ifName}` });
  }
  rows.sort((x, y) => x.ip - y.ip);
  c.out.push(...rows.map((r) => r.line));
}

export function showRunning(c: Ctx): void {
  const dev = c.dev;
  if (c.a.ifn) {
    const lines = interfaceLines(dev, c.a.ifn as string);
    const text = ['!', ...lines, 'end'].join('\n');
    c.out.push('Building configuration...', '', `Current configuration : ${text.length} bytes`, text);
    return;
  }
  c.out.push(...runningConfig(c.net, dev).split('\n'));
}

export function showStartup(c: Ctx): void {
  const text = c.dev.st.startup;
  if (!text) {
    c.out.push('startup-config is not present');
    return;
  }
  const total = c.dev.kind === 'router' ? (c.dev.hw.iosXe ? 33554432 : 262136) : c.dev.hw.iosXe ? 2097152 : 65536;
  c.out.push(`Using ${text.length} out of ${total} bytes`, ...text.split('\n'));
}

export function showFlash(c: Ctx): void {
  const dev = c.dev;
  if (dev.hw.iosXe || dev.kind === 'router') {
    c.out.push(`-#- --length-- -----date/time------ path`);
    c.out.push(`1    ${dev.hw.iosXe ? 392573971 : 107155888} Mar 1 1993 00:00:00 +00:00 ${dev.hw.imageFile.replace(/^[^:]+:/, '')}`);
    c.out.push('', `${dev.hw.iosXe ? 6294573056 : 146919424} bytes available (${dev.hw.iosXe ? 900079616 : 107155888} bytes used)`);
    return;
  }
  c.out.push('Directory of flash:/', '');
  c.out.push(`    2  -rwx    33591768   Mar 1 1993 00:00:00 +00:00  ${dev.hw.imageFile.replace(/^[^:]+:/, '')}`);
  if (dev.st.vlanDat) c.out.push(`    3  -rwx        1048   Mar 1 1993 00:02:11 +00:00  vlan.dat`);
  c.out.push('', '64016384 bytes total (30424616 bytes free)');
}

export function showHosts(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  c.out.push(`Default domain is ${cfg.domainName ?? 'not set'}`, `Name/address lookup uses ${cfg.domainLookup ? 'domain service' : 'static mappings'}`, `Name servers are ${cfg.nameServers.length ? cfg.nameServers.map(ipStr).join(', ') : '255.255.255.255'}`, '', 'Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate', '       temp - temporary, perm - permanent', '       NA - Not Applicable None - Not defined', '', 'Host                      Port  Flags      Age Type   Address(es)');
  for (const [h, ip] of Object.entries(cfg.hosts)) c.out.push(`${pad(h, 26)}None  (perm, OK)  0   IP    ${ipStr(ip)}`);
}

export function parentName(n: string): string | undefined {
  return parentOf(n);
}
