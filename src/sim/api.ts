/**
 * Public types of the WizardCCNA network simulator (see docs/SIMULATOR_SPEC.md §1).
 * Re-exported by `src/sim/index.ts`. Keep names and shapes stable — the lab UI compiles against them.
 */
import type { DeviceModel } from '../content/labTypes';

export type DeviceKind = 'router' | 'switch' | 'l3switch' | 'host' | 'cloud';
export type IfStatus = 'up' | 'down' | 'admin-down' | 'err-disabled';

export interface SimInterfaceInfo {
  /** canonical: "GigabitEthernet0/0/0" */
  name: string;
  /** "Gi0/0/0" */
  short: string;
  status: IfStatus;
  linkedTo?: { device: string; iface: string };
}

export interface SimDeviceInfo {
  id: string;
  model: DeviceModel;
  kind: DeviceKind;
  /** live hostname (changes with `hostname` command) */
  hostname: string;
  label: string;
  x: number;
  y: number;
  locked: boolean;
  interfaces: SimInterfaceInfo[];
}

export interface SimLinkInfo {
  id: string;
  a: { device: string; iface: string };
  b: { device: string; iface: string };
  type: 'copper' | 'fiber' | 'serial';
  /** up when both ends are up/up (or up/down line protocol issues count as 'down'). */
  status: 'up' | 'down';
  /** STP: true when that end is discarding/blocking for VLAN 1 (or for any VLAN if not in VLAN 1). */
  aBlocked: boolean;
  bBlocked: boolean;
}

export interface TerminalResult {
  /** may be multi-line, may be '' */
  output: string;
  /** UI should clear the screen (e.g. after reload) */
  clear?: boolean;
}

export interface Terminal {
  readonly deviceId: string;
  /** Current prompt, e.g. "R1>", "R1(config-if)#", "Password: ", "C:\\>", "[confirm]". */
  prompt(): string;
  /** True while the terminal is asking for a password — the UI masks input. */
  isSecretInput(): boolean;
  /** Execute one line of input exactly as typed. */
  execute(line: string): TerminalResult;
  /** Tab completion of the last word; returns the completed line (unchanged if ambiguous) and candidates. */
  complete(line: string): { line: string; options: string[] };
  /** Output for context help when the user types "?" at the end of `line` (line excludes the "?"). */
  help(line: string): string;
  /** Ctrl+C / Ctrl+Z: abort prompts, leave config mode (Ctrl+Z → privileged EXEC). */
  interrupt(kind: 'ctrl-c' | 'ctrl-z'): TerminalResult;
  /** Previously executed commands (for arrow-key history), oldest first. */
  history(): string[];
  /** Text shown when the console window is first opened (e.g. "\nPress RETURN to get started."). */
  greeting(): string;
}

export interface PacketHop {
  device: string;
  /** egress or ingress interface involved */
  iface?: string;
  /** human text: "ARP for 10.1.1.1", "Routed via 10.0.12.2 (O)", "Denied by ACL 101 in" */
  action: string;
  ok: boolean;
}

export interface PacketTrace {
  success: boolean;
  /** "Reply from 10.2.2.20" / "Destination host unreachable" / "Request timed out" */
  summary: string;
  forward: PacketHop[];
  reply: PacketHop[];
}

export interface CheckResult {
  pass: boolean;
  detail: string;
}

/** JSON-serializable full simulator state. */
export interface SimSnapshot {
  version: 1;
  [key: string]: unknown;
}
