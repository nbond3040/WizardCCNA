/** Shared helpers for simulator unit tests. */
import { NetworkSim } from '../index';
import type { LabDevice, LabLink } from '../../content/labTypes';

export function build(devices: LabDevice[], links: LabLink[] = []): NetworkSim {
  return new NetworkSim({ devices, links });
}

/** Execute lines on a device terminal; returns the combined output. */
export function run(sim: NetworkSim, dev: string, lines: string | string[]): string {
  const t = sim.terminal(dev);
  const list = Array.isArray(lines) ? lines : lines.split('\n');
  return list.map((l) => t.execute(l).output).join('\n');
}

/** Run config lines in global configuration mode (enters and leaves config mode). */
export function cfg(sim: NetworkSim, dev: string, lines: string | string[]): string {
  const t = sim.terminal(dev);
  const list = Array.isArray(lines) ? lines : lines.split('\n');
  if (t.prompt().endsWith('>')) t.execute('enable');
  if (!t.prompt().includes('(config')) t.execute('configure terminal');
  const out = list.map((l) => t.execute(l).output).join('\n');
  t.execute('end');
  return out;
}

/** Privileged EXEC command output (enters enable mode if needed). */
export function show(sim: NetworkSim, dev: string, cmd: string): string {
  const t = sim.terminal(dev);
  if (t.prompt().endsWith('>')) t.execute('enable');
  return t.execute(cmd).output;
}

export const pc = (id: string, ip: string, gw?: string, mask = '255.255.255.0', x = 0, y = 0): LabDevice => ({
  id,
  model: 'pc',
  x,
  y,
  host: { ip, mask, gateway: gw },
});
