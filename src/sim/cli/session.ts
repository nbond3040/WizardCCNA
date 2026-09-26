/** CLI session state (one per console / VTY connection) and the handler context. */
import type { IosDevice } from '../model/state';
import type { Args } from './grammar';
import type { Net } from '../engine/net';

export type Mode =
  | 'user'
  | 'priv'
  | 'config'
  | 'if'
  | 'subif'
  | 'if-range'
  | 'line'
  | 'router'
  | 'rtr6'
  | 'vlan'
  | 'dhcp'
  | 'std-nacl'
  | 'ext-nacl'
  | 'v6-nacl'
  | 'block';

export interface Session {
  dev: IosDevice;
  mode: Mode;
  ifs: string[];
  line?: { kind: 'con' | 'aux' | 'vty'; from: number; to: number };
  pid?: number;
  vlans?: number[];
  pool?: string;
  acl?: string;
  block?: { idx: number; prompt: string };
  via: 'console' | 'vty' | 'internal' | 'nvram';
  user?: string;
  peerIp?: number;
  vtyLine?: number;
  proto?: 'ssh' | 'telnet';
  priv: number;
  monitor: boolean;
  hist: string[];
  termLength?: number;
  /** pending `vlan` sub-mode changes, committed when the mode is left */
  vlanPend?: { ids: number[]; name?: string; shut?: boolean; suspend?: boolean };
}

export function newSession(dev: IosDevice, via: Session['via'], priv = 1): Session {
  return { dev, mode: priv >= 15 ? 'priv' : 'user', ifs: [], via, priv, monitor: false, hist: [] };
}

const SUFFIX: Record<Mode, string> = {
  user: '>',
  priv: '#',
  config: '(config)#',
  if: '(config-if)#',
  subif: '(config-subif)#',
  'if-range': '(config-if-range)#',
  line: '(config-line)#',
  router: '(config-router)#',
  rtr6: '(config-rtr)#',
  vlan: '(config-vlan)#',
  dhcp: '(dhcp-config)#',
  'std-nacl': '(config-std-nacl)#',
  'ext-nacl': '(config-ext-nacl)#',
  'v6-nacl': '(config-ipv6-acl)#',
  block: '(config)#',
};

export function promptOf(s: Session): string {
  if (s.mode === 'block' && s.block) return `${s.dev.st.cfg.hostname}(${s.block.prompt})#`;
  return s.dev.st.cfg.hostname + SUFFIX[s.mode];
}

export function isConfigMode(m: Mode): boolean {
  return m !== 'user' && m !== 'priv';
}

/** Terminal services available to command handlers. */
export interface TermIO {
  /** ask for one line of input; the handler runs with the typed text */
  ask(prompt: string, handler: (input: string) => void, opts?: { secret?: boolean }): void;
  /** open a nested remote session (ssh/telnet) */
  remote(proto: 'ssh' | 'telnet', target: number, user?: string, hostLabel?: string): void;
  /** end the current session (exit/logout) */
  exitSession(): void;
  /** reload the device this session is on */
  reload(): void;
  clearScreen(): void;
  /** number of VTY sessions currently open to a device */
  vtyBusy(devId: string): number;
  /** interactive session? (false while applying configuration files) */
  interactive: boolean;
  /** length of the prompt the command was typed at (for ^ markers) */
  promptLen: number;
}

export interface Ctx {
  net: Net;
  dev: IosDevice;
  s: Session;
  a: Args;
  neg: boolean;
  dflt: boolean;
  line: string;
  out: string[];
  io: TermIO;
}
