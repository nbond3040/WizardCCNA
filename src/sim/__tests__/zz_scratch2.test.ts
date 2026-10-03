import { it } from 'vitest';
import { build, pc } from './helpers';

const topo = () => build(
  [
    { id: 'R1', model: 'isr4321', x: 0, y: 0, config: 'hostname R1\ninterface g0/0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface g0/0/1\n ip address 10.0.12.1 255.255.255.252\n no shutdown\nip route 192.168.2.0 255.255.255.0 10.0.12.2' },
    { id: 'R2', model: 'isr2911', x: 2, y: 0, config: 'hostname R2\ninterface g0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface g0/1\n ip address 192.168.2.1 255.255.255.0\n no shutdown\nip route 192.168.1.0 255.255.255.0 10.0.12.1' },
    { id: 'SW1', model: 'c2960', x: 0, y: 2, config: 'hostname SW1' },
    pc('PC1', '192.168.1.10', '192.168.1.1'),
    { id: 'SRV', model: 'server', x: 3, y: 1, host: { ip: '192.168.2.100', mask: '255.255.255.0', gateway: '192.168.2.1' } },
  ],
  [ { a: 'R1:g0/0/0', b: 'SW1:g0/1' }, { a: 'SW1:fa0/1', b: 'PC1:fa0' }, { a: 'R1:g0/0/1', b: 'R2:g0/0' }, { a: 'R2:g0/1', b: 'SRV:fa0' } ],
);

it('exec', () => {
  const sim = topo();
  const t = sim.terminal('R1');
  for (const l of ['enable', 'ping', '', '192.168.2.100', '', '', '', '', 'y', '', '', '', '', '', '', '', '', '', '', '',
    'ping 192.168.2.100 source g0/0/0 repeat 3 size 200', 'ping 192.168.2.100 source 192.168.1.1', 'traceroute 192.168.2.100', 'clock set 10:00:00 1 Jan 2024', 'show clock', 'debug ip ospf adj', 'undebug all', 'no debug all', 'terminal length 0', 'terminal monitor', 'terminal no monitor', 'clear counters', '', 'clear arp-cache', 'clear mac address-table dynamic', 'clear ip nat translation *', 'write memory', 'write erase', '', 'copy startup-config running-config', '', 'show ip route | include S', 'show running-config | section interface', 'show running-config | begin line', 'show ip interface brief | exclude unassigned', 'show running-config | count interface', 'disable', 'enable', 'logout']) {
    const r = t.execute(l);
    console.log(`${t.prompt()} <= ${JSON.stringify(l)}\n${r.output}`);
  }
});
it('host', () => {
  const sim = topo();
  const t = sim.terminal('PC1');
  for (const l of ['help', 'ipconfig', 'ipconfig /all', 'ping 192.168.2.100', 'ping -n 2 192.168.2.100', 'ping 10.99.99.99', 'tracert 192.168.2.100', 'arp -a', 'arp -d', 'arp -a', 'nslookup www.x.com', 'ipconfig /release', 'ipconfig /renew', 'telnet 192.168.1.1', 'ssh -l admin 192.168.1.1', 'foo', 'ipv6config', 'netstat', 'hostname', 'ping', 'ping -t 1.1.1.1']) {
    const r = t.execute(l);
    console.log(`${t.prompt()} <= ${JSON.stringify(l)}\n${r.output}`);
  }
});
