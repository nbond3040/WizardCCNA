/**
 * Cumulative interface error counters.
 *
 * Like on real IOS, input errors / CRC / runts / collisions / late collisions / output errors are state: they
 * grow while a fault exists, survive fixing it and are only reset by `clear counters`. The fault the simulator
 * injects is a duplex mismatch: every frame crossing a mismatched wire makes the half-duplex end count
 * collisions and late collisions (and output errors) and the full-duplex end count runts and CRC errors
 * (and input errors). Background chatter (STP, CDP, keepalives, hellos) adds a few more as simulated time passes.
 *
 * All of it lives in `dev.st.dyn.ifd`, so it is part of `snapshot()` / `fromSnapshot()` and of dry-run rollbacks.
 */
import { ifDyn, type IfDyn, type IosDevice } from '../model/state';
import type { L2Wire } from './l2';
import { ek, type Net } from './net';

/** One background frame per mismatched wire every 10 s of simulated time (keepalives, CDP, STP BPDUs, hellos). */
export const BACKGROUND_MS = 10_000;

/** Error counts one frame crossing the mismatched wire adds at an end, by that end's duplex. */
function bump(dd: IfDyn, role: 'half' | 'full', frames: number): void {
  if (role === 'half') {
    dd.collisions += 2 * frames;
    dd.lateColl += frames;
    dd.outErrors = (dd.outErrors ?? 0) + frames;
  } else {
    dd.crc += 2 * frames;
    dd.runts += frames;
  }
}

function addErrors(net: Net, devId: string, ifName: string, role: 'half' | 'full', frames: number): void {
  const dev = net.ios(devId);
  if (!dev || frames <= 0) return; // hosts keep no per-interface error counters
  bump(ifDyn(dev, ifName), role, frames);
}

/** Frames crossed the given physical wires (transmitting ends): count the errors a duplex mismatch causes. */
export function noteFrames(net: Net, wires: readonly L2Wire[], frames = 1): void {
  if (!wires.length) return;
  const l1 = net.d.l2.l1;
  for (const w of wires) {
    const a = l1.get(ek(w.dev, w.ifName));
    if (!a?.carrier || !a.duplexMismatch || !a.peer) continue;
    addErrors(net, w.dev, w.ifName, a.duplex, frames);
    const b = l1.get(ek(a.peer.dev, a.peer.ifName));
    if (b) addErrors(net, a.peer.dev, a.peer.ifName, b.duplex, frames);
  }
}

/**
 * Simulated time passed: every mismatched wire carried background frames meanwhile. Each end keeps its own
 * remainder (`errMs`), so no peer bookkeeping is needed. Also used at lab load to age the initial faults
 * as if they had existed since boot.
 */
export function accrueBackground(net: Net, elapsedMs: number): void {
  if (elapsedMs <= 0) return;
  for (const [key, l1] of net.d.l2.l1) {
    if (!l1.carrier || !l1.duplexMismatch) continue;
    const i = key.indexOf('|');
    const dev = net.ios(key.slice(0, i));
    if (!dev) continue;
    const dd = ifDyn(dev, key.slice(i + 1));
    const total = (dd.errMs ?? 0) + elapsedMs;
    const frames = Math.floor(total / BACKGROUND_MS);
    dd.errMs = total - frames * BACKGROUND_MS;
    if (frames > 0) bump(dd, l1.duplex, frames);
  }
}

/** `clear counters [interface]`: zero the "show interface" counters and remember when. */
export function clearCounters(net: Net, dev: IosDevice, names: Iterable<string>): void {
  for (const name of names) {
    const d = ifDyn(dev, name);
    d.inPkts = d.outPkts = d.inBytes = d.outBytes = d.bcast = 0;
    d.crc = d.runts = d.collisions = d.lateColl = 0;
    d.giants = d.frame = d.outErrors = 0;
    d.errMs = 0;
    d.lastClear = net.clock;
  }
}
