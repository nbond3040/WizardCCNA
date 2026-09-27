/**
 * Lab harness. For every lab in src/content/labs/*.ts:
 *   1. build the simulator from the lab topology,
 *   2. assert that at least one task fails before the solution is applied,
 *   3. apply the reference solution (CLI lines per IOS device, HostConfig objects per host) and fail on any
 *      "% Invalid", "% Incomplete", "% Ambiguous" or "% Unknown" output,
 *   4. assert that every check of every task passes (failure details are printed).
 *
 * Run all labs:     npm run test:labs
 * Run one lab:      LAB=lab-vlans-trunking npm run test:labs
 */
import { describe, expect, it } from 'vitest';
import type { HostConfig, Lab } from '../labTypes';
import { LESSONS } from '../curriculum';
import { NetworkSim } from '../../sim';

const modules = import.meta.glob<{ default: Lab }>(['./*.ts', '!./labs.test.ts'], { eager: true });
const only = (process.env.LAB ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const entries = Object.entries(modules)
  .map(([path, mod]) => [path.replace('./', '').replace(/\.ts$/, ''), mod.default] as const)
  .filter(([id]) => !only.length || only.includes(id));

const ERROR_RE = /% (Invalid|Incomplete|Ambiguous|Unknown)/;
const lessonIds = new Set(LESSONS.map((l) => l.id));

function taskResults(sim: NetworkSim, lab: Lab) {
  return lab.tasks.map((t) => ({ task: t, results: t.checks.map((c) => ({ check: c, ...sim.check(c) })) }));
}

describe('labs', () => {
  it('found lab files', () => {
    expect(Object.keys(modules).length + (only.length ? 1 : 0)).toBeGreaterThan(0);
  });

  for (const [fileId, lab] of entries) {
    describe(fileId, () => {
      it('metadata', () => {
        expect(lab, `${fileId} must default-export a Lab`).toBeTruthy();
        expect(lab.id, 'lab id must equal the file name').toBe(fileId);
        const unknown = lab.lessons.filter((l) => !lessonIds.has(l));
        expect(unknown, 'lessons must be ids from curriculum.ts').toEqual([]);
        expect(lab.tasks.length).toBeGreaterThan(0);
      });

      it('initial state fails at least one task, solution completes every task', () => {
        const sim = new NetworkSim({ devices: lab.devices, links: lab.links });
        const cfgErrors = sim.configErrors();
        if (cfgErrors.length) console.warn(`\n[${fileId}] initial config lines not accepted:\n  - ${cfgErrors.join('\n  - ')}`);

        const before = taskResults(sim, lab);
        const failingBefore = before.filter((t) => t.results.some((r) => !r.pass));
        expect(failingBefore.length, `[${fileId}] every task already passes before the solution is applied`).toBeGreaterThan(0);

        const cliErrors: string[] = [];
        for (const [deviceId, sol] of Object.entries(lab.solution)) {
          if (typeof sol === 'string') {
            const term = sim.terminal(deviceId);
            for (const line of sol.split('\n')) {
              const prompt = term.prompt();
              const res = term.execute(line);
              if (ERROR_RE.test(res.output)) cliErrors.push(`${deviceId} ${prompt}${line}\n${res.output}`);
            }
          } else sim.setHostConfig(deviceId, sol as HostConfig);
        }
        if (cliErrors.length) console.error(`\n[${fileId}] solution CLI errors:\n${cliErrors.join('\n---\n')}`);
        expect(cliErrors, `[${fileId}] solution lines produced IOS errors`).toEqual([]);

        const after = taskResults(sim, lab);
        const failures: string[] = [];
        for (const t of after) for (const r of t.results) if (!r.pass) failures.push(`task ${t.task.id} [${r.check.type}] ${r.detail}`);
        if (failures.length) console.error(`\n[${fileId}] failing checks after solution:\n  - ${failures.join('\n  - ')}`);
        expect(failures, `[${fileId}] checks failing after the solution`).toEqual([]);
      });
    });
  }
});
