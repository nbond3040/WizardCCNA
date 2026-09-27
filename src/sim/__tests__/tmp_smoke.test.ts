import { NetworkSim } from '../index';

test('smoke', () => {
  const sim = new NetworkSim({
    devices: [
      { id: 'R1', model: 'isr4321', x: 0, y: 0 },
      { id: 'SW1', model: 'c2960', x: 1, y: 0 },
      { id: 'PC1', model: 'pc', x: 2, y: 0, host: { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' } },
    ],
    links: [
      { a: 'R1:g0/0/0', b: 'SW1:g0/1' },
      { a: 'SW1:fa0/1', b: 'PC1:fa0' },
    ],
  });
  const t = sim.terminal('R1');
  const run = (l: string) => { const r = t.execute(l); console.log(t.prompt() + ' <= ' + l + '\n' + r.output); };
  console.log(t.greeting());
  run('');
  run('en');
  run('conf t');
  run('int g0/0/0');
  run('ip add 192.168.1.1 255.255.255.0');
  run('no shut');
  run('end');
  run('sh ip int br');
  run('ping 192.168.1.10');
  run('ping 192.168.1.10');
  run('sh ip route');
  run('sh run');
  run('sh ip intx');
  run('sh i');
  run('xyz');
  const pc = sim.terminal('PC1');
  console.log(pc.execute('ping 192.168.1.1').output);
  console.log(pc.execute('ipconfig').output);
  console.log(sim.check({ type: 'ping', from: 'PC1', to: '192.168.1.1' }));
  console.log(t.help('show ip '));
  console.log(t.help(''));
  console.log(t.complete('sh ip int b'));
});
