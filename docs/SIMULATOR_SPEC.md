# WizardCCNA Network Simulator — Specification

A Packet-Tracer-like simulator that runs entirely in the browser (pure TypeScript, **no DOM access**)
in `src/sim/`. It powers the hands-on labs: learners open a console on each device, type real Cisco
IOS commands, and tasks are graded live by machine-checkable checks. The UI (topology canvas, terminal
emulator, task panel) is built separately in `src/features/labs/` against the API in §1.

Lab content schema: `src/content/labTypes.ts` (Lab, LabDevice, LabLink, LabCheck, HostConfig). Read it.

---

## 1. Public API (`src/sim/index.ts`) — keep these names and shapes stable

```ts
import type { DeviceModel, HostConfig, LabCheck, LabDevice, LabLink } from '../content/labTypes';

export type DeviceKind = 'router' | 'switch' | 'l3switch' | 'host' | 'cloud';
export type IfStatus = 'up' | 'down' | 'admin-down' | 'err-disabled';

export interface SimInterfaceInfo {
  name: string;          // canonical: "GigabitEthernet0/0/0"
  short: string;         // "Gi0/0/0"
  status: IfStatus;
  linkedTo?: { device: string; iface: string };
}
export interface SimDeviceInfo {
  id: string; model: DeviceModel; kind: DeviceKind;
  hostname: string;      // live hostname (changes with `hostname` command)
  label: string; x: number; y: number; locked: boolean;
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
  output: string;        // may be multi-line, may be ''
  clear?: boolean;       // UI should clear the screen (e.g. after reload)
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
  iface?: string;        // egress or ingress interface involved
  action: string;        // human text: "ARP for 10.1.1.1", "Routed via 10.0.12.2 (O)", "Denied by ACL 101 in"
  ok: boolean;
}
export interface PacketTrace {
  success: boolean;
  summary: string;       // "Reply from 10.2.2.20" / "Destination host unreachable" / "Request timed out"
  forward: PacketHop[];
  reply: PacketHop[];
}
export interface CheckResult { pass: boolean; detail: string }
export interface SimSnapshot { version: 1; [key: string]: unknown } // JSON-serializable

export class NetworkSim {
  constructor(lab: { devices: LabDevice[]; links: LabLink[] });
  static fromSnapshot(lab: { devices: LabDevice[]; links: LabLink[] }, snap: SimSnapshot): NetworkSim;
  snapshot(): SimSnapshot;                 // full state: running + startup configs, host settings, dynamic tables
  devices(): SimDeviceInfo[];
  links(): SimLinkInfo[];
  terminal(deviceId: string): Terminal;    // same instance on every call for a device
  hostConfig(deviceId: string): HostConfig & { assigned?: { ip: string; mask: string; gateway?: string; dns?: string } };
  setHostConfig(deviceId: string, cfg: HostConfig): void;   // dhcp:true triggers a DHCP exchange
  runningConfig(deviceId: string): string;
  check(check: LabCheck): CheckResult;
  tracePing(from: string, to: string): PacketTrace;          // from = device id; to = IP or device id
  subscribe(listener: () => void): () => void;               // fired after every state change
}
```
Create `src/sim/index.ts` with this API **first** (stubs are fine initially) so the UI can compile
against it, then implement.

---

## 2. Devices

| model | kind | interfaces | defaults |
|---|---|---|---|
| isr4321 | router | GigabitEthernet0/0/0, 0/0/1, Serial0/1/0, 0/1/1 | interfaces `shutdown`, IPv4 routing on |
| isr2911 | router | GigabitEthernet0/0, 0/1, 0/2, Serial0/0/0, 0/0/1 | same |
| c2960 | switch | FastEthernet0/1–24, GigabitEthernet0/1–2, Vlan1 | ports up, access VLAN 1, `dynamic auto`, STP PVST+ |
| c3650 | l3switch | GigabitEthernet1/0/1–24, GigabitEthernet1/1/1–4, Vlan1 | like c2960 + routed ports/SVIs; `ip routing` **off** until configured |
| pc/laptop/server | host | FastEthernet0 | static config from `host`, DHCP if `host.dhcp` |
| cloud | cloud | Ethernet0 | behaves like a host that answers pings (`cloudIp` or `host`) |

- Deterministic MACs per device+interface (Cisco dotted format `0001.4a2b.3c01`). Show IOS-like
  `show version` (model, IOS XE / IOS 15 version string, uptime text, config register 0x2102).
- Interface name parsing accepts every IOS abbreviation: `g0/0/0`, `gi0/0/0`, `Gig0/0/0`,
  `GigabitEthernet 0/0/0`, `fa0/1`, `f0/1`, `s0/1/0`, `se0/1/0`, `lo0`, `loopback 0`, `vlan 10`,
  `po1`, `port-channel 1`, subinterfaces `g0/0/0.10`, and `interface range f0/1 - 5 , f0/7`.
  Loopbacks, SVIs, subinterfaces and port-channels are created on first reference.

## 3. CLI (must feel like real IOS)

- Modes & prompts: `R1>` user EXEC, `R1#` privileged EXEC, `R1(config)#`, `(config-if)#`,
  `(config-subif)#`, `(config-if-range)#`, `(config-line)#`, `(config-router)#` (OSPFv2),
  `(config-rtr)#` (OSPFv3), `(config-vlan)#`, `(dhcp-config)#`, `(config-std-nacl)#`, `(config-ext-nacl)#`.
- Unique-prefix abbreviation of every keyword (`conf t`, `sh ip int br`, `no shut`, `int g0/0/0`),
  `do` in config modes, `no` forms, `exit`, `end`, Ctrl+Z, command history.
- Exact IOS error formats:
  - invalid keyword: the echoed command line, a line with `^` under the first bad character, then
    `% Invalid input detected at '^' marker.`
  - `% Incomplete command.`   `% Ambiguous command:  "sh i"`
  - unknown word in EXEC with `ip domain-lookup` on (default): `Translating "xyz"...domain server (255.255.255.255)`
    then `% Unknown command or computer name, or unable to find computer address`; without the
    translating line after `no ip domain-lookup`.
- Context help: `?` alone lists commands available in the mode with short descriptions; `sh?` lists
  keywords starting with `sh`; `show ?` lists next keywords/arguments (`A.B.C.D`, `WORD`, `<1-4094>`, `<cr>`).
- Output modifiers on show commands: `| include X`, `| exclude X`, `| begin X`, `| section X`.
- Interactive prompts: `enable` asks `Password:` when enable secret/password is set (3 tries,
  `% Bad secrets`); console login (`line con 0` + `login`/`login local`) shows `User Access Verification`,
  `Username:`/`Password:`; `copy running-config startup-config` asks `Destination filename [startup-config]?`;
  `reload` asks `Proceed with reload? [confirm]` then restores startup-config; `erase startup-config`
  confirms; `crypto key generate rsa` without `modulus` asks `How many bits in the modulus [512]:`;
  `banner motd #...#` supports multi-line input until the delimiter; `clear ip ospf process` confirms.
- IOS log messages to the console where natural (`%LINK-3-UPDOWN`, `%LINEPROTO-5-UPDOWN`,
  `%SYS-5-CONFIG_I: Configured from console by console`, `%OSPF-5-ADJCHG ... from LOADING to FULL`,
  `%SW_MATRIX`-free). Keep them realistic and not spammy.

### Commands to support
**EXEC**: enable, disable, configure terminal, exit, logout, end, show …, ping (`ping X`,
`ping X source IF|IP repeat N size N`, plain `ping` → extended ping dialogue), traceroute, ssh -l USER IP,
telnet IP, copy running-config startup-config, copy startup-config running-config, write memory,
reload, erase startup-config / write erase, clear ip nat translation *, clear mac address-table dynamic,
clear arp-cache, clear ip ospf process, clear counters, terminal length N, terminal monitor, clock set,
debug/undebug (acknowledge only), dir / show flash:.

**show**: running-config (+ `interface X` section form), startup-config, version, ip interface brief,
ip interface [X], interfaces [X], interfaces status, interfaces description, interfaces trunk,
interfaces switchport, interfaces X switchport, vlan [brief], mac address-table [dynamic|interface X|vlan N],
ip route [static|connected|ospf|A.B.C.D], ipv6 interface brief, ipv6 interface [X], ipv6 route,
ip ospf neighbor, ip ospf interface [brief|X], ip ospf, ip ospf database (summary), ip protocols,
ipv6 ospf neighbor, ipv6 ospf interface brief, spanning-tree [vlan N|summary|interface X detail],
etherchannel summary, etherchannel port-channel, cdp neighbors [detail], cdp, lldp neighbors [detail],
ip nat translations, ip nat statistics, access-lists, ip access-lists, ip dhcp binding, ip dhcp pool,
ip dhcp snooping [binding], ntp status, ntp associations, clock, port-security [interface X],
standby [brief], ip ssh, users, history, arp / ip arp, logging, errdisable recovery, power inline, flash:.

**Global config**: hostname, enable secret/password (types 0/5/8/9 accepted, `algorithm-type`),
service password-encryption, banner motd/login, username NAME [privilege N] secret|password X,
ip domain-name / ip domain name, [no] ip domain-lookup, ip name-server, ip host, crypto key generate rsa
[general-keys] [modulus N], ip ssh version 2 / time-out / authentication-retries, ip routing,
ipv6 unicast-routing, ip route, ipv6 route, ip default-gateway, interface, interface range, vlan N / name,
router ospf N, ipv6 router ospf N, access-list (standard/extended numbered, remark),
ip access-list standard|extended NAME (+ sequence numbers, `no N`, remark), ip access-list resequence,
ip nat inside source static|list … pool|interface … [overload], ip nat pool NAME a b netmask M|prefix-length N,
ip dhcp excluded-address, ip dhcp pool NAME (network, default-router, dns-server, domain-name, lease),
ip dhcp snooping, ip dhcp snooping vlan, [no] ip dhcp snooping information option, ip arp inspection vlan,
ntp server X [prefer], ntp master [N], ntp source IF, clock timezone, logging host / trap / console /
buffered, service timestamps, snmp-server community/location/contact/host/enable traps, cdp run, lldp run,
cdp/lldp timer/holdtime, spanning-tree mode pvst|rapid-pvst, spanning-tree vlan L priority N | root
primary|secondary, spanning-tree portfast default / bpduguard default / bpdufilter default,
errdisable recovery cause X / interval N, line con 0 / line vty A B, port-channel load-balance X,
vtp mode/domain, [no] ip http server, ip http secure-server, aaa new-model + aaa authentication login
(accept; `login local` semantics), login block-for, security passwords min-length, key/tacacs/radius
server blocks (accept syntactically, show in running-config).

**Interface**: description, ip address A M [secondary], ip address dhcp, no ip address, [no] shutdown,
speed, duplex, bandwidth, mtu, ipv6 address X/len [eui-64|link-local], ipv6 address autoconfig,
ipv6 enable, ip ospf N area A, ipv6 ospf N area A, ip ospf cost|priority|network|hello-interval|dead-interval,
ip helper-address, ip nat inside|outside, ip access-group X in|out, encapsulation dot1Q N [native],
switchport mode access|trunk|dynamic auto|dynamic desirable, switchport access vlan, switchport voice vlan,
switchport trunk native vlan, switchport trunk allowed vlan LIST|add|remove|except|all|none,
switchport trunk encapsulation dot1q (c3650), switchport nonegotiate, switchport port-security
[maximum|violation|mac-address [sticky] [MAC]], no switchport, channel-group N mode active|passive|desirable|auto|on,
spanning-tree portfast [trunk] | bpduguard enable|disable | bpdufilter enable|disable | guard root|loop|none |
cost N | port-priority N | vlan N cost|port-priority N, standby [G] ip X | priority N | preempt | version 2,
cdp enable, lldp transmit|receive, power inline auto|never|static, storm-control broadcast|multicast level X,
storm-control action shutdown|trap, ip dhcp snooping trust | limit rate N, ip arp inspection trust, clock rate N.

**Line**: password, login, login local, transport input ssh|telnet|all|none, exec-timeout M [S],
logging synchronous, access-class N|NAME in, privilege level N, history size N.

**Router OSPF**: router-id, network A W area N, passive-interface IF|default, no passive-interface IF,
default-information originate [always], auto-cost reference-bandwidth N, maximum-paths N.
OSPFv3 (`ipv6 router ospf`): router-id, passive-interface, default-information originate.

`show running-config` must print a realistic IOS-ordered config (version/hostname/…/interfaces/router/
ip routes/access-lists/lines/end) with defaults omitted, `service password-encryption` producing type 7
strings, `enable secret` stored as `$...` type 5/9 hashes (fake but stable), and "!" separators.

## 4. Network engine (derived state, recomputed lazily after config changes)

- **L1**: link up when both ends are not shutdown/err-disabled; router ports admin-down by default.
  Speed/duplex: mismatched hard-coded speeds → link down; duplex mismatch → up but mark errors (show
  interfaces counters increase) — keep simple.
- **L2**: VLAN database per switch (VLAN 1 default; `switchport access vlan N` auto-creates with the IOS
  message "% Access VLAN does not exist. Creating vlan N"). Access ports, trunks via DTP
  (trunk/desirable/auto matrix; auto+auto → access; nonegotiate), allowed lists, native VLAN (mismatch
  merges VLANs and logs `%CDP-4-NATIVE_VLAN_MISMATCH`). Router subinterfaces (`encapsulation dot1Q`)
  and untagged/native frames on trunks to routers. SVIs up/up only if the VLAN exists and has at least
  one up forwarding port (access or trunk). EtherChannel: LACP active/passive, PAgP desirable/auto,
  static on; compatible members bundle into a Port-channel (SU/RU/P flags); incompatible → suspended (s)
  or stand-alone (I). STP per VLAN (PVST+/Rapid PVST+): bridge ID = priority + VLAN (sys-id-ext) + MAC,
  802.1D short costs (10M=100, 100M=19, 1G=4, 10G=2) or configured costs, port IDs 128.N, root election,
  root/designated/alternate(blocking) ports; PortFast/BPDU guard (err-disable when a switch is attached to
  a BPDU-guard port), root guard (root-inconsistent) as feasible. MAC tables learned from simulated
  traffic (pings, ARP, DHCP) along the actual loop-free L2 path; aging not required.
- **L3**: connected (C) and local (L) routes for up/up interfaces with IPs; static routes (recursive
  next hop, exit interface, AD, floating); default routes and gateway of last resort; longest prefix
  match; ECMP. OSPFv2 single area: adjacency requires same subnet/mask, same area, matching hello/dead,
  compatible network type, not passive, unique RIDs (log duplicate RID), (MTU optional); RID selection
  (router-id > highest loopback > highest up interface); DR/BDR on broadcast segments (priority, then RID;
  priority 0 never), DROTHERs 2WAY with each other; SPF over the adjacency graph with interface costs
  (ref-bw 100 Mbps default: Gi/Fa = 1, Serial 1544 kbps = 64, loopback 1); passive interfaces advertised;
  `default-information originate` → O*E2 0.0.0.0/0 metric 1 elsewhere. OSPFv3 for IPv6 similarly (single
  area) if time allows. HSRP: active = highest priority then highest interface IP (preempt semantics may
  be simplified); virtual IP answers ARP/pings for hosts using it as gateway. IPv6: connected/local/static
  routes, SLAAC for hosts (`ipv6Auto`) from routers with `ipv6 unicast-routing`, EUI-64.
- **Packets**: `ping`/`traceroute`/`tracePing`/host ping walk real forwarding: host decides local vs
  gateway, ARP within the broadcast domain, route lookups, TTL, inbound/outbound ACLs (standard,
  extended, named; implicit deny; per-entry match counters shown in `show access-lists`), NAT inside↔outside
  (static, dynamic pool, PAT/overload with port translation; translation table for `show ip nat
  translations` with realistic formatting), and the reply path. IOS ping output: `Type escape sequence to
  abort.` / `Sending 5, 100-byte ICMP Echos to X, timeout is 2 seconds:` / `.!!!!` (first packet lost if
  ARP was needed) / `Success rate is 80 percent (4/5), round-trip min/avg/max = 1/1/2 ms`. Unreachable
  codes: `U` when a router has no route. Host (Windows-style) ping output with `Reply from …`,
  `Request timed out.`, `Destination host unreachable.`.
- **Services**: DHCP (IOS server pools + exclusions, relay via `ip helper-address` using giaddr to pick
  the pool, router DHCP client `ip address dhcp`, host DHCP; `show ip dhcp binding`); DNS (server
  `services.dns` records; hosts resolve names for ping/nslookup via their DNS server if reachable on UDP 53;
  IOS `ip host` and `ip name-server`); SSH/Telnet logins (TCP 22/23 reachability + VTY config: transport input,
  login / login local credentials, `access-class`; SSH requires hostname ≠ Router/Switch, ip domain-name,
  RSA keys ≥ 768 bits for v2) — opens a nested CLI session to the target inside the source terminal
  until `exit`; NTP (client synchronized when `ntp server X` is reachable and X is an `ntp master` or an
  NTP-service server; stratum = server + 1; `show ntp status/associations`); syslog (`show logging`
  lists generated messages; `logging host` recorded); port security (secure MACs learned from the host
  attached to the port when traffic flows; sticky writes `switchport port-security mac-address sticky
  XXXX` into running-config; a different host MAC than allowed triggers the configured violation —
  shutdown → err-disabled); DHCP snooping (untrusted ports drop server messages, binding table) as feasible.

## 5. Hosts

Host terminal emulates a Windows command prompt (`C:\>`): `ipconfig`, `ipconfig /all`, `ipconfig /release`,
`ipconfig /renew`, `ping X [-n N]`, `tracert X`, `nslookup NAME`, `arp -a`, `arp -d`, `ssh -l USER IP`,
`telnet IP`, `help`. Output formats like Windows 10/11. Settings come from the UI via `setHostConfig`.

## 6. Checks

Implement every `LabCheck` variant in `labTypes.ts`. `detail` must be specific and helpful:
"PC1 → 10.1.2.20: Request timed out (R1 has no route to 10.1.2.0)", "SW1 Fa0/5 is in VLAN 1, expected 10",
"VLAN 20 exists but is named VLAN0020 (expected ENGINEERING)". Checks must never throw.

## 7. Tests (vitest; `npm run test:sim`, `npm run test:labs`)

- Unit tests under `src/sim/__tests__/` for parsing/abbreviation/errors/help, show formats, and each
  protocol area (VLAN/trunk reachability, ROAS, SVIs, static & floating static, OSPF adjacency + DR/BDR +
  routes, NAT/PAT, ACLs, DHCP server/relay, SSH login, STP election, EtherChannel).
- Lab harness `src/content/labs/labs.test.ts`: for every lab file in `src/content/labs/*.ts`: build the sim,
  assert at least one task fails initially, apply the `solution` (execute each line in that device's
  terminal and fail if any output contains `% Invalid`, `% Incomplete`, `% Ambiguous` or `% Unknown`; apply
  HostConfig objects with `setHostConfig`), then assert every check of every task passes (print details
  of failures). Support `LAB=<id>` env var to run one lab.

## 8. Engineering notes

- No DOM, no timers required for correctness (the sim is event-driven: state changes happen on commands).
  Protocol convergence is instantaneous (OSPF goes FULL as soon as conditions are met).
- Keep modules small and typed: `src/sim/model`, `cli`, `commands`, `engine`, `show`, `host`, `checks`.
- Topologies are small (≤ 20 devices): favor clarity over micro-optimization, but cache derived state and
  recompute only when dirty.
