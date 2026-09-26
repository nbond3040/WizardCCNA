/**
 * Lab schema for the WizardCCNA network simulator.
 *
 * A lab is a topology of simulated devices plus tasks. Each task has machine-checkable `checks`
 * that the simulator evaluates live against the current network state. Every lab ships with a
 * `solution` that the automated test harness (src/content/labs/labs.test.ts) applies to prove the
 * lab is solvable: all checks must fail-or-partially-fail before, and all must pass after.
 */
import type { RichText } from './types';

/**
 * Hardware templates. Interfaces per model:
 *  - isr4321 (router):   GigabitEthernet0/0/0, GigabitEthernet0/0/1, Serial0/1/0, Serial0/1/1
 *  - isr2911 (router):   GigabitEthernet0/0, GigabitEthernet0/1, GigabitEthernet0/2, Serial0/0/0, Serial0/0/1
 *  - c2960   (L2 switch): FastEthernet0/1–24, GigabitEthernet0/1–2
 *  - c3650   (L3 switch): GigabitEthernet1/0/1–24, GigabitEthernet1/1/1–4
 *  - pc, laptop, server: FastEthernet0 (single NIC)
 *  - cloud: an opaque "Internet" endpoint with interface Ethernet0 that answers pings to its IP
 */
export type DeviceModel = 'isr4321' | 'isr2911' | 'c2960' | 'c3650' | 'pc' | 'laptop' | 'server' | 'cloud';

export interface HostConfig {
  dhcp?: boolean;
  ip?: string;
  mask?: string;
  gateway?: string;
  dns?: string;
  ipv6?: string; // "2001:db8:1::10/64"
  ipv6Gateway?: string;
  /** SLAAC for IPv6 (address from router advertisements). */
  ipv6Auto?: boolean;
}

export interface ServerServices {
  /** Authoritative DNS records served by this host (A records). */
  dns?: { name: string; ip: string }[];
  http?: boolean;
  https?: boolean;
  ftp?: boolean;
  tftp?: boolean;
  ntp?: boolean;
  syslog?: boolean;
  /** Simple DHCP server on a host (in addition to IOS DHCP). */
  dhcp?: { pool: string; network: string; mask: string; gateway: string; dns?: string; start: string; max: number };
}

export interface LabDevice {
  /** Short id used in links and checks, e.g. "R1", "SW1", "PC1". Also the initial hostname for IOS devices. */
  id: string;
  model: DeviceModel;
  /** Canvas position in grid units (0–12 wide, 0–7 tall). */
  x: number;
  y: number;
  /** Optional display label (defaults to id). */
  label?: string;
  /**
   * Initial IOS configuration, written like `show running-config` output (indented lines and "!" are
   * fine). Applied in global configuration mode when the lab loads. Also becomes startup-config.
   */
  config?: string;
  /** Initial host settings for pc/laptop/server. */
  host?: HostConfig;
  services?: ServerServices;
  /** For model 'cloud': the IP it answers on. */
  cloudIp?: string;
  /** Learner cannot open this device's console (e.g. an ISP router). */
  locked?: boolean;
}

export interface LabLink {
  /** "DEVICE:interface", interface may be abbreviated: "R1:g0/0/0", "SW1:fa0/1", "PC1:fa0". */
  a: string;
  b: string;
  type?: 'copper' | 'fiber' | 'serial';
}

export type LabCheck =
  /** ICMP echo from a device (host or IOS) to an IP or a device id; `source` = source interface/IP for IOS. */
  | { type: 'ping'; from: string; to: string; expect?: boolean; source?: string }
  /** Simulated application traffic (e.g. HTTP = tcp 80) for ACL/NAT validation. */
  | { type: 'traffic'; from: string; to: string; proto: 'tcp' | 'udp' | 'icmp'; port?: number; expect?: boolean }
  /**
   * Regex (JavaScript syntax, case-insensitive by default) tested against the device's running-config.
   * `section` restricts the match to one block, e.g. "interface GigabitEthernet0/1" or "router ospf 1" or
   * "line vty 0 4". Section headers are matched case-insensitively on the full canonical name.
   */
  | { type: 'config'; device: string; pattern: string; section?: string; expect?: boolean }
  /** Run a show/exec command on an IOS device and regex-match its output. The universal escape hatch. */
  | { type: 'show'; device: string; command: string; pattern: string; expect?: boolean }
  /** Interface state/addressing. status: 'up' = up/up, 'down' = up/down or down/down, 'admin-down'. */
  | { type: 'interface'; device: string; iface: string; ip?: string; mask?: string; ipv6?: string; status?: 'up' | 'down' | 'admin-down'; description?: string }
  | { type: 'vlan'; device: string; vlan: number; name?: string; exists?: boolean }
  /** Operational switchport state (`allowed` like "10,20,99"; compares the effective allowed list). */
  | { type: 'switchport'; device: string; iface: string; mode?: 'access' | 'trunk'; accessVlan?: number; voiceVlan?: number; nativeVlan?: number; allowed?: string }
  /** Routing-table entry. prefix "10.1.1.0/24" or "::/0". source is the route code letter(s), e.g. "S", "O", "C", "S*". */
  | { type: 'route'; device: string; prefix: string; source?: string; nextHop?: string; exitIf?: string; expect?: boolean }
  | { type: 'ospfNeighbor'; device: string; neighbor: string; state?: 'FULL' | '2WAY'; role?: 'DR' | 'BDR' | 'DROTHER' }
  | { type: 'ospfRouterId'; device: string; rid: string }
  | { type: 'stpRoot'; vlan: number; device: string }
  | { type: 'stpPort'; device: string; vlan: number; iface: string; role?: 'root' | 'designated' | 'alternate' | 'backup' | 'disabled'; state?: 'forwarding' | 'blocking' }
  | { type: 'etherchannel'; device: string; group: number; protocol?: 'lacp' | 'pagp' | 'on'; up?: boolean; members?: number }
  /** Host (pc/laptop/server) settings. `inSubnet` like "192.168.10.0/24" checks a (DHCP-)assigned address. */
  | { type: 'host'; device: string; ip?: string; mask?: string; gateway?: string; dns?: string; dhcp?: boolean; inSubnet?: string }
  /** Remote login from a host or IOS device to an IP using SSH or Telnet with credentials. */
  | { type: 'login'; from: string; to: string; protocol: 'ssh' | 'telnet'; username?: string; password: string; expect?: boolean }
  /** startup-config matches running-config. */
  | { type: 'saved'; device: string }
  | { type: 'hsrp'; device: string; group: number; state?: 'Active' | 'Standby'; vip?: string }
  /** DNS name resolution from a host. */
  | { type: 'resolve'; from: string; name: string; ip: string };

export interface LabTask {
  id: string;
  /** Imperative instruction: "Configure VLAN 10 named SALES on SW1". */
  title: RichText;
  details?: RichText;
  hint?: RichText;
  /** All checks must pass for the task to be complete. */
  checks: LabCheck[];
}

export interface Lab {
  id: string;
  title: string;
  summary: string;
  /** 1 = guided, 2 = standard, 3 = challenge/troubleshooting. */
  difficulty: 1 | 2 | 3;
  minutes: number;
  /** Lesson ids this lab reinforces (from curriculum.ts). */
  lessons: string[];
  /** Scenario briefing shown before starting. */
  scenario: RichText;
  devices: LabDevice[];
  links: LabLink[];
  tasks: LabTask[];
  /**
   * Reference solution. For IOS devices: the exact CLI lines a learner would type starting at the user
   * EXEC prompt (e.g. "enable", "configure terminal", ...). Each line must execute without an error.
   * For hosts: a HostConfig to apply.
   */
  solution: Record<string, string | HostConfig>;
}
