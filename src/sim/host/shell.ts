/** Windows-style command prompt for pc / laptop / server hosts. */
import type { Net } from '../engine/net';
import type { HostDevice } from '../model/state';
import { ifMac } from '../engine/topo';
import { hostEffective, hostEffective6 } from '../engine/l3';
import { pingSeries, roundTrip6, traceroute4, type RoundTrip } from '../engine/packet';
import { dhcpExchange, releaseHost } from '../engine/dhcp';
import { resolveName } from '../engine/services';
import { ek } from '../engine/net';
import { ipStr, parseIp } from '../util/ip';
import { parseV6, v6Str } from '../util/ipv6';
import { macDashed } from '../util/mac';
import { winDate, pad } from '../util/format';

export interface HostIO {
  net: Net;
  dev: HostDevice;
  out: string[];
  ask(prompt: string, handler: (input: string) => void, secret?: boolean): void;
  remote(proto: 'ssh' | 'telnet', ip: number, user?: string, label?: string): void;
  clear(): void;
}

const ADAPTER = 'Ethernet adapter Ethernet0:';

function llWin(net: Net, dev: HostDevice): string {
  const e6 = hostEffective6(net, net.d.l2, dev);
  const ll = e6.addrs.find((a) => a.linkLocal);
  return ll ? `${ll.addr}%12` : '';
}

function mediaUp(net: Net, dev: HostDevice): boolean {
  const st = net.d.l2.ifs.get(ek(dev.id, dev.hw.ifaces[0].name));
  return !!st && st.line === 'up';
}

function ipconfig(io: HostIO, all: boolean): void {
  const { net, dev, out } = io;
  const e = hostEffective(dev);
  const e6 = hostEffective6(net, net.d.l2, dev);
  out.push('', 'Windows IP Configuration', '');
  if (all) {
    out.push(`   Host Name . . . . . . . . . . . . : ${dev.id}`, '   Primary Dns Suffix  . . . . . . . : ', '   Node Type . . . . . . . . . . . . : Hybrid', '   IP Routing Enabled. . . . . . . . : No', '   WINS Proxy Enabled. . . . . . . . : No', '');
  } else out.push('');
  out.push(ADAPTER, '');
  if (!mediaUp(net, dev)) {
    out.push('   Media State . . . . . . . . . . . : Media disconnected', '   Connection-specific DNS Suffix  . : ');
    if (all) out.push('   Description . . . . . . . . . . . : Intel(R) PRO/1000 MT Network Connection', `   Physical Address. . . . . . . . . : ${macDashed(ifMac(dev, dev.hw.ifaces[0].name))}`, `   DHCP Enabled. . . . . . . . . . . : ${e.dhcp ? 'Yes' : 'No'}`, '   Autoconfiguration Enabled . . . . : Yes');
    return;
  }
  out.push('   Connection-specific DNS Suffix  . : ');
  if (all) out.push('   Description . . . . . . . . . . . : Intel(R) PRO/1000 MT Network Connection', `   Physical Address. . . . . . . . . : ${macDashed(ifMac(dev, dev.hw.ifaces[0].name))}`, `   DHCP Enabled. . . . . . . . . . . : ${e.dhcp ? 'Yes' : 'No'}`, '   Autoconfiguration Enabled . . . . : Yes');
  const pref = all ? '(Preferred) ' : '';
  for (const a of e6.addrs.filter((x) => !x.linkLocal)) out.push(`   IPv6 Address. . . . . . . . . . . : ${a.addr}${pref}`);
  out.push(`   Link-local IPv6 Address . . . . . : ${llWin(net, dev)}${pref}`);
  if (e.ip !== undefined && e.mask !== undefined) {
    if (e.apipa) out.push(`   Autoconfiguration IPv4 Address. . : ${ipStr(e.ip)}${pref}`);
    else out.push(`   IPv4 Address. . . . . . . . . . . : ${ipStr(e.ip)}${pref}`);
    out.push(`   Subnet Mask . . . . . . . . . . . : ${ipStr(e.mask)}`);
  }
  if (all && dev.st.lease) {
    out.push(`   Lease Obtained. . . . . . . . . . : ${winDate(dev.st.lease.t)}`, `   Lease Expires . . . . . . . . . . : ${winDate(dev.st.lease.expires)}`);
  }
  const gws: string[] = [];
  if (e6.gw) gws.push(e6.gw.startsWith('fe80') ? `${e6.gw}%12` : e6.gw);
  if (e.gw !== undefined) gws.push(ipStr(e.gw));
  out.push(`   Default Gateway . . . . . . . . . : ${gws[0] ?? ''}`);
  for (const g of gws.slice(1)) out.push(`                                       ${g}`);
  if (all) {
    if (dev.st.lease) out.push(`   DHCP Server . . . . . . . . . . . : ${ipStr(dev.st.lease.server)}`);
    if (e.dns !== undefined) out.push(`   DNS Servers . . . . . . . . . . . : ${ipStr(e.dns)}`);
    out.push('   NetBIOS over Tcpip. . . . . . . . : Enabled');
  }
}

function renew(io: HostIO): void {
  const { net, dev, out } = io;
  if (!dev.st.cfg.dhcp) {
    out.push('', 'Windows IP Configuration', '', `The operation failed as no adapter is in the state permissible for`, 'this operation.');
    return;
  }
  dev.st.dhcpReleased = false;
  releaseHost(net, dev);
  net.touch();
  net.commit();
  const r = dhcpExchange(net, dev, dev.hw.ifaces[0].name);
  if (!r.ok) {
    if (!dev.st.apipa) {
      net.touch();
      net.commit();
    }
    out.push('', 'Windows IP Configuration', '', 'An error occurred while renewing interface Ethernet0 : unable to contact your DHCP server. Request has timed out.');
    return;
  }
  dev.st.lease = { ip: r.lease.ip, mask: r.lease.mask, gw: r.lease.gw, dns: r.lease.dns, server: r.lease.server, t: net.now(), expires: net.now() + r.lease.leaseSec * 1000 };
  dev.st.apipa = undefined;
  net.touch();
  net.commit();
  ipconfig(io, false);
}

function release(io: HostIO): void {
  const { net, dev, out } = io;
  if (!dev.st.cfg.dhcp) {
    out.push('', 'Windows IP Configuration', '', 'The operation failed as no adapter is in the state permissible for', 'this operation.');
    return;
  }
  releaseHost(net, dev);
  dev.st.apipa = undefined;
  dev.st.dhcpReleased = true;
  net.touch();
  net.commit();
  out.push('', 'Windows IP Configuration', '', '', ADAPTER, '', '   Connection-specific DNS Suffix  . : ', `   Link-local IPv6 Address . . . . . : ${llWin(net, dev)}`, '   Default Gateway . . . . . . . . . : ');
}

function resolveTarget(io: HostIO, t: string): { ip?: number; v6?: string; name?: string } | null {
  const ip = parseIp(t);
  if (ip !== null) return { ip };
  if (t.includes(':')) {
    const v = parseV6(t);
    if (v !== null) return { v6: v6Str(v) };
  }
  const r = resolveName(io.net, io.dev, t);
  if (r.ok) return { ip: r.ip, name: t };
  return null;
}

function pingCmd(io: HostIO, args: string[]): void {
  const { net, dev, out } = io;
  let count = 4;
  let size = 32;
  let target: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i].toLowerCase();
    if (a === '-n' && args[i + 1]) count = Math.max(1, Math.min(100, Number(args[++i]) || 4));
    else if (a === '-l' && args[i + 1]) size = Number(args[++i]) || 32;
    else if (a === '-t') count = 10;
    else if (a === '-4' || a === '-6') continue;
    else target = args[i];
  }
  if (!target) {
    out.push('', 'Usage: ping [-t] [-a] [-n count] [-l size] [-f] [-i TTL] [-v TOS]', '            [-r count] [-s count] [[-j host-list] | [-k host-list]]', '            [-w timeout] [-R] [-S srcaddr] [-c compartment] [-p]', '            [-4] [-6] target_name');
    return;
  }
  const t = resolveTarget(io, target);
  if (!t) {
    out.push(`Ping request could not find host ${target}. Please check the name and try again.`);
    return;
  }
  const e = hostEffective(dev);
  if (t.v6) {
    out.push('', `Pinging ${t.v6} with ${size} bytes of data:`);
    let ok = 0;
    for (let i = 0; i < count; i++) {
      const r = roundTrip6(net, dev, t.v6);
      if (r.ok) {
        ok++;
        out.push(`Reply from ${t.v6}: time<1ms `);
      } else out.push(r.fwd.fail?.kind === 'nogw' ? 'PING: transmit failed. General failure. ' : 'Request timed out.');
    }
    out.push('', `Ping statistics for ${t.v6}:`, `    Packets: Sent = ${count}, Received = ${ok}, Lost = ${count - ok} (${Math.round(((count - ok) * 100) / count)}% loss),`);
    if (ok) out.push('Approximate round trip times in milli-seconds:', '    Minimum = 0ms, Maximum = 1ms, Average = 0ms');
    return;
  }
  const dst = t.ip!;
  out.push('', `Pinging ${t.name ? `${t.name} [${ipStr(dst)}]` : ipStr(dst)} with ${size} bytes of data:`);
  const res: RoundTrip[] = pingSeries(net, dev, dst, count, { size });
  let received = 0;
  let replies = 0;
  const times: number[] = [];
  for (const r of res) {
    if (r.symbol === '!' && r.rep) {
      received++;
      replies++;
      const hops = r.fwd.hops.filter((h) => h.action.startsWith('Routed')).length;
      const tm = hops <= 1 ? 0 : hops - 1;
      times.push(tm);
      out.push(`Reply from ${ipStr(dst)}: bytes=${size} ${tm === 0 ? 'time<1ms' : `time=${tm}ms`} TTL=${r.replyTtl ?? 128}`);
      continue;
    }
    const f = r.fwd.fail;
    if (f && f.dev === dev.id && (f.kind === 'nogw' || f.kind === 'noip' || f.kind === 'down')) {
      out.push('PING: transmit failed. General failure. ');
      continue;
    }
    if (f && f.dev === dev.id && f.kind === 'arp') {
      received++;
      out.push(`Reply from ${e.ip !== undefined ? ipStr(e.ip) : '0.0.0.0'}: Destination host unreachable.`);
      continue;
    }
    if (r.symbol === 'U' && r.unreachFrom !== undefined) {
      received++;
      const what = r.unreachCode === 0 ? 'Destination net unreachable.' : 'Destination host unreachable.';
      out.push(`Reply from ${ipStr(r.unreachFrom)}: ${what}`);
      continue;
    }
    out.push('Request timed out.');
  }
  const lost = count - received;
  out.push('', `Ping statistics for ${ipStr(dst)}:`, `    Packets: Sent = ${count}, Received = ${received}, Lost = ${lost} (${Math.round((lost * 100) / count)}% loss),`);
  if (replies) {
    const mn = Math.min(...times);
    const mx = Math.max(...times);
    const avg = Math.round(times.reduce((s2, x) => s2 + x, 0) / times.length);
    out.push('Approximate round trip times in milli-seconds:', `    Minimum = ${mn}ms, Maximum = ${mx}ms, Average = ${avg}ms`);
  }
}

function tracert(io: HostIO, args: string[]): void {
  const { net, dev, out } = io;
  const target = args.filter((a) => !a.startsWith('-'))[0];
  if (!target) {
    out.push('', 'Usage: tracert [-d] [-h maximum_hops] [-j host-list] [-w timeout]', '               [-R] [-S srcaddr] [-4] [-6] target_name');
    return;
  }
  const t = resolveTarget(io, target);
  if (!t || t.ip === undefined) {
    out.push(`Unable to resolve target system name ${target}.`);
    return;
  }
  out.push('', `Tracing route to ${t.name ? `${t.name} [${ipStr(t.ip)}]` : ipStr(t.ip)}`, 'over a maximum of 30 hops:', '');
  const hops = traceroute4(net, dev, t.ip, 30, true);
  for (const h of hops) {
    const n = String(h.ttl).padStart(3);
    if (h.from === undefined) out.push(`${n}     *        *        *     Request timed out.`);
    else if (h.unreach) out.push(`${n}  ${ipStr(h.from)}  reports: Destination net unreachable.`);
    else out.push(`${n}    <1 ms    <1 ms    <1 ms  ${ipStr(h.from)}`);
  }
  out.push('', 'Trace complete.');
}

function nslookup(io: HostIO, args: string[]): void {
  const { net, dev, out } = io;
  const name = args[0];
  const e = hostEffective(dev);
  const server = e.dns;
  if (!name) {
    out.push(server !== undefined ? `Default Server:  UnKnown\nAddress:  ${ipStr(server)}` : '*** Default servers are not available', '> ');
    return;
  }
  if (server === undefined) {
    out.push('*** Default servers are not available', 'Server:  UnKnown', 'Address:  127.0.0.1', '', `*** UnKnown can't find ${name}: No response from server`);
    return;
  }
  const r = resolveName(net, dev, name);
  if (!r.ok && r.reason === 'timeout') {
    out.push('DNS request timed out.', '    timeout was 2 seconds.', 'Server:  UnKnown', `Address:  ${ipStr(server)}`, '', 'DNS request timed out.', '    timeout was 2 seconds.', `*** Request to UnKnown timed-out`);
    return;
  }
  out.push('Server:  UnKnown', `Address:  ${ipStr(server)}`, '');
  if (!r.ok) {
    out.push(`*** UnKnown can't find ${name}: Non-existent domain`);
    return;
  }
  out.push(`Name:    ${name}`, `Address:  ${ipStr(r.ip)}`, '');
}

function arpCmd(io: HostIO, args: string[]): void {
  const { dev, out } = io;
  const a = (args[0] ?? '').toLowerCase();
  if (a === '-d') {
    if (args[1] && args[1] !== '*') delete dev.st.arp[String(parseIp(args[1]) ?? -1)];
    else dev.st.arp = {};
    return;
  }
  if (a === '-a' || a === '-g') {
    const e = hostEffective(dev);
    const entries = Object.entries(dev.st.arp);
    if (!entries.length) {
      out.push('No ARP Entries Found.');
      return;
    }
    out.push('', `Interface: ${e.ip !== undefined ? ipStr(e.ip) : '0.0.0.0'} --- 0xb`, '  Internet Address      Physical Address      Type');
    for (const [ip, en] of entries.sort((x, y) => Number(x[0]) - Number(y[0]))) out.push(`  ${pad(ipStr(Number(ip)), 22)}${pad(macDashed(en.mac, false), 22)}dynamic   `);
    return;
  }
  out.push('', 'Displays and modifies the IP-to-Physical address translation tables used by', 'address resolution protocol (ARP).', '', 'ARP -s inet_addr eth_addr [if_addr]', 'ARP -d inet_addr [if_addr]', 'ARP -a [inet_addr] [-N if_addr] [-v]');
}

export function hostExecute(io: HostIO, line: string): void {
  const toks = line.trim().split(/\s+/).filter(Boolean);
  if (!toks.length) return;
  const cmd = toks[0].toLowerCase();
  const args = toks.slice(1);
  const out = io.out;
  switch (cmd) {
    case 'ipconfig': {
      const a = (args[0] ?? '').toLowerCase();
      if (a === '/all') ipconfig(io, true);
      else if (a === '/release') release(io);
      else if (a === '/renew') renew(io);
      else if (a === '/?' || (a && a.startsWith('/'))) out.push('', 'USAGE:', '    ipconfig [/allcompartments] [/? | /all | ', '                                 /renew [adapter] | /release [adapter] |', '                                 /flushdns | /displaydns ]');
      else ipconfig(io, false);
      return;
    }
    case 'ping':
      pingCmd(io, args);
      return;
    case 'tracert':
    case 'traceroute':
      tracert(io, args);
      return;
    case 'nslookup':
      nslookup(io, args);
      return;
    case 'arp':
      arpCmd(io, args);
      return;
    case 'ssh': {
      let user: string | undefined;
      let host: string | undefined;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-l') user = args[++i];
        else if (args[i].includes('@')) [user, host] = args[i].split('@');
        else if (!args[i].startsWith('-')) host = args[i];
      }
      if (!host) {
        out.push('usage: ssh -l username target');
        return;
      }
      const t = resolveTarget(io, host);
      if (!t || t.ip === undefined) {
        out.push(`ssh: Could not resolve hostname ${host}: No such host is known.`);
        return;
      }
      io.remote('ssh', t.ip, user, host);
      return;
    }
    case 'telnet': {
      if (!args[0]) {
        out.push('Usage: telnet host');
        return;
      }
      const t = resolveTarget(io, args[0]);
      if (!t || t.ip === undefined) {
        out.push(`Connecting To ${args[0]}...Could not open connection to the host, on port 23: Connect failed`);
        return;
      }
      io.remote('telnet', t.ip, undefined, args[0]);
      return;
    }
    case 'cls':
      io.clear();
      return;
    case 'hostname':
      out.push(io.dev.id);
      return;
    case 'getmac':
      out.push('', 'Physical Address    Transport Name', '=================== ==========================================================', `${macDashed(ifMac(io.dev, io.dev.hw.ifaces[0].name))}   \\Device\\Tcpip_{4D36E972-E325-11CE-BFC1-08002BE10318}`);
      return;
    case 'help':
    case '?':
      out.push(
        'Available commands:',
        '  arp -a | arp -d          Display or clear the ARP cache',
        '  cls                      Clear the screen',
        '  getmac                   Display the NIC MAC address',
        '  hostname                 Display the host name',
        '  ipconfig [/all|/release|/renew]',
        '                           Display or renew IP configuration',
        '  nslookup NAME            Query the DNS server',
        '  ping [-n N] [-l SIZE] TARGET',
        '  ssh -l USER TARGET       Open an SSH session',
        '  telnet TARGET            Open a Telnet session',
        '  tracert TARGET           Trace the route to a destination',
      );
      return;
    case 'exit':
      return;
    default:
      out.push(`'${toks[0]}' is not recognized as an internal or external command,`, 'operable program or batch file.');
  }
}
