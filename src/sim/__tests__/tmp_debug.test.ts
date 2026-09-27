import { NetworkSim } from '../index';
import ospfLab from '../../content/labs/lab-ospf-single-area';
import vlanLab from '../../content/labs/lab-vlans-trunking';
import staticLab from '../../content/labs/lab-static-routing';
import type { Lab } from '../../content/labTypes';

function solve(lab: Lab) {
  const sim = new NetworkSim({ devices: lab.devices, links: lab.links });
  for (const [id, sol] of Object.entries(lab.solution)) {
    if (typeof sol === 'string') { const t = sim.terminal(id); for (const l of sol.split('\n')) t.execute(l); }
    else sim.setHostConfig(id, sol);
  }
  return sim;
}
function show(sim: NetworkSim, dev: string, cmd: string) {
  const t = sim.terminal(dev);
  const p = t.prompt();
  console.log(`${p}${cmd}\n${t.execute(cmd).output}`);
}
test('ospf', () => {
  const sim = solve(ospfLab);
  show(sim, 'R1', 'show ip ospf neighbor');
  show(sim, 'R2', 'show ip ospf neighbor');
  show(sim, 'R3', 'show ip ospf interface brief');
  show(sim, 'R1', 'show ip route');
  show(sim, 'R1', 'show ip ospf interface g0/0/0');
  show(sim, 'R3', 'show ip protocols');
  show(sim, 'R2', 'show ip ospf database');
  show(sim, 'R1', 'traceroute 192.168.3.10');
});
test('vlan', () => {
  const sim = solve(vlanLab);
  show(sim, 'SW1', 'show vlan brief');
  show(sim, 'SW1', 'show interfaces trunk');
  show(sim, 'SW1', 'show spanning-tree vlan 10');
  show(sim, 'SW2', 'show spanning-tree vlan 10');
  show(sim, 'SW1', 'show mac address-table dynamic');
  show(sim, 'SW1', 'show interfaces fa0/1 switchport');
  show(sim, 'SW1', 'show interfaces status');
});
test('static', () => {
  const sim = solve(staticLab);
  show(sim, 'R1', 'show ip route');
  show(sim, 'R2', 'show ip route');
  show(sim, 'R2', 'show ip route 192.168.1.0');
  const pc = sim.terminal('PC1');
  console.log(pc.execute('tracert 192.168.3.10').output);
  show(sim, 'R1', 'show ip interface brief');
});
