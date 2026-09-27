import type { Question } from '../../types';

const DSW1_CDP = `DSW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
EDGE-R1          Gig 1/0/48        139           R B S I  ISR4331/K Gig 0/0/1
ASW1             Gig 1/0/1         171               S I  C9200-48P Gig 1/1/1
ASW2             Gig 1/0/2         126               S I  C9200-48P Gig 1/1/1
ASW2             Gig 1/0/3         126               S I  C9200-48P Gig 1/1/2

Total cdp entries displayed : 4`;

const SW3_LLDP = `SW3# show lldp neighbors
Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
CORE-SW             Gi1/0/1        101        B,R             Gi1/0/24
FLOOR2-SW           Gi1/0/2        95         B               Gi1/0/48
AP-FL3-01           Gi1/0/10       112        W               Gi0
db-server-01        Gi1/0/20       88         S               eth0

Total entries displayed: 4`;

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'What are the default CDP advertisement interval and holdtime on Cisco IOS?',
    options: ['60 seconds and 180 seconds', '30 seconds and 120 seconds', '30 seconds and 90 seconds', '90 seconds and 270 seconds'],
    answer: 0,
    difficulty: 1,
    explanation:
      'CDP advertises every **60 seconds** with a **180-second** holdtime. 30 and 120 seconds are the LLDP defaults, and the other pairs are not default values for either protocol.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which statement describes LLDP on a Cisco IOS switch with a default configuration?',
    options: [
      'LLDP is disabled and must be enabled globally with `lldp run`',
      'LLDP is enabled on all interfaces, like CDP',
      'LLDP is enabled only on trunk ports',
      'LLDP cannot run while CDP is enabled',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'LLDP is **off by default** on Cisco IOS; `lldp run` enables it globally, after which interfaces transmit and receive by default. It is not limited to trunks, and CDP and LLDP can run side by side.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Which interface on EDGE-R1 connects to DSW1?',
    exhibit: { kind: 'cli', text: DSW1_CDP },
    options: ['GigabitEthernet0/0/1', 'GigabitEthernet1/0/48', 'GigabitEthernet0/0/0', 'GigabitEthernet1/1/1'],
    answer: 0,
    difficulty: 2,
    explanation:
      "The **Port ID** column shows the neighbor's interface, so EDGE-R1 uses **Gi0/0/1**. Gi1/0/48 is DSW1's own port (Local Intrfce), Gi0/0/0 does not appear in the output, and Gi1/1/1 is the uplink port on ASW1 and ASW2.",
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: DSW1_CDP },
    options: [
      'ASW2 is connected to DSW1 by two separate links',
      'DSW1 port Gi1/0/1 connects to port Gi1/1/1 on ASW1',
      'EDGE-R1 connects to DSW1 port Gi0/0/1',
      'ASW1 is a router',
      'DSW1 will remove ASW2 from the table in 126 minutes unless it hears from it again',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'ASW2 appears **twice**, on DSW1 ports Gi1/0/2 and Gi1/0/3, so there are two links. The ASW1 line pairs DSW1\'s Gi1/0/1 with ASW1\'s **Gi1/1/1**. Gi0/0/1 is a port on EDGE-R1, not on DSW1; ASW1 advertises `S I`, a switch; and the holdtime is in seconds, not minutes.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each CDP capability code to its meaning.',
    pairs: [
      { left: '`R`', right: 'Router' },
      { left: '`S`', right: 'Switch' },
      { left: '`H`', right: 'Host' },
      { left: '`P`', right: 'Phone' },
      { left: '`I`', right: 'IGMP' },
    ],
    difficulty: 2,
    explanation:
      'In CDP, R is router, S is switch, H is host, P is phone and I means the device processes IGMP. Do not carry these letters over to LLDP, where S means station and P means repeater.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Classify each command by the configuration mode where it is entered.',
    categories: ['Global configuration', 'Interface configuration'],
    items: [
      { text: '`cdp run`', category: 0 },
      { text: '`lldp run`', category: 0 },
      { text: '`cdp timer 30`', category: 0 },
      { text: '`lldp holdtime 90`', category: 0 },
      { text: '`no cdp enable`', category: 1 },
      { text: '`no lldp transmit`', category: 1 },
      { text: '`lldp receive`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Turning either protocol on or off for the whole device and changing its timers are **global** commands. `cdp enable`, `lldp transmit` and `lldp receive` (and their `no` forms) act on a single **interface**.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'An engineer wants SW1 to stop sending CDP advertisements on port Gi1/0/5, which connects to a user PC, while CDP keeps running on every other port. Which command meets the requirement?',
    options: [
      '`no cdp enable` under interface Gi1/0/5',
      '`no cdp run` in global configuration mode',
      '`no cdp advertise-v2` in global configuration mode',
      '`no lldp transmit` under interface Gi1/0/5',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`no cdp enable` disables CDP on **one interface**. `no cdp run` disables CDP on every port, `no cdp advertise-v2` only falls back to CDP version 1 advertisements, and `no lldp transmit` affects LLDP, not CDP.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'Refer to the exhibit. How many of the LLDP neighbors of SW3 are switches? (Enter a number.)',
    exhibit: { kind: 'cli', text: SW3_LLDP },
    answers: ['2', 'two'],
    placeholder: 'number',
    difficulty: 3,
    explanation:
      'LLDP marks a switch with **B** (bridge). CORE-SW (B,R, a Layer 3 switch that is also routing) and FLOOR2-SW (B) are switches, so the answer is **2**. AP-FL3-01 is a WLAN access point (W), and db-server-01 shows **S**, which in LLDP means station, an end host, not a switch.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'SW1 receives the last CDP advertisement from R1 at 10:00:00, and then R1 stops sending. With default timers, at about what time does SW1 remove R1 from its CDP neighbor table?',
    options: ['10:03:00', '10:01:00', '10:02:00', '10:04:00'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The entry lives for the **180-second** holdtime carried in the last advertisement, so it expires at about **10:03:00**. 10:01:00 would use the 60-second send interval, and 10:02:00 would match the 120-second LLDP holdtime.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show cdp entry EDGE-R1
-------------------------
Device ID: EDGE-R1
Entry address(es):
  IP address: 172.16.99.1
Platform: cisco ISR4331/K9,  Capabilities: Router Source-Route-Bridge Switch IGMP
Interface: GigabitEthernet1/0/48,  Port ID (outgoing port): GigabitEthernet0/0/1
Holdtime : 139 sec

Version :
Cisco IOS XE Software, Version 17.06.05
<output omitted>

advertisement version: 2
Duplex: full
Management address(es):
  IP address: 172.16.99.1`,
    },
    options: [
      'EDGE-R1 can be managed at 172.16.99.1, and its Gi0/0/1 connects to DSW1 Gi1/0/48',
      'EDGE-R1 connects to DSW1 using its own port Gi1/0/48',
      'The neighbor sends CDP version 1 advertisements, so mismatches are not reported',
      'The neighbor is a Layer 2 switch, because Switch appears in its capabilities',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "The entry address and management address are **172.16.99.1**, and the Interface line pairs DSW1's local Gi1/0/48 with EDGE-R1's outgoing port **Gi0/0/1**. Gi1/0/48 is DSW1's port, *advertisement version: 2* shows CDPv2, and the platform and Router capability identify an ISR router; the historical Switch capability does not make it a LAN switch.",
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the problem?',
    exhibit: {
      kind: 'cli',
      text: `ASW1#
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/1/1 (99), with DSW1 GigabitEthernet1/0/1 (1).`,
    },
    options: [
      'The trunk uses native VLAN 99 on ASW1 Gi1/1/1 and native VLAN 1 on DSW1 Gi1/0/1',
      'The trunk uses native VLAN 1 on ASW1 Gi1/1/1 and native VLAN 99 on DSW1 Gi1/0/1',
      'DSW1 is sending CDP version 1, so it cannot report its native VLAN',
      'The duplex settings on ASW1 Gi1/1/1 and DSW1 Gi1/0/1 do not match',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "CDPv2 compared the native VLANs: the local interface and value come first, so ASW1's Gi1/1/1 uses **VLAN 99**, and the neighbor DSW1's Gi1/0/1 uses **VLAN 1**. The second option reverses the two sides. DSW1 must be sending CDPv2, since the native VLAN is only advertised in version 2, and a duplex problem would produce a DUPLEX_MISMATCH message instead.",
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Which two statements about CDP are true? (Choose two.)',
    options: [
      'It is a Cisco-proprietary protocol',
      'It works even when no IP address is configured on the interface',
      'It is defined in IEEE 802.1AB',
      'It is disabled by default on Cisco routers',
      'Routers forward CDP advertisements to remote subnets',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'CDP is **Cisco proprietary** and runs at **Layer 2**, so it needs no IP address. IEEE 802.1AB defines LLDP, CDP is enabled by default, and CDP information never travels beyond directly connected neighbors.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: '`lldp run` is configured on SW1 and R1. `show lldp neighbors` on SW1 lists R1, but the same command on R1 shows no entry for SW1. Which interface configuration on R1 explains this?',
    options: [
      '`no lldp receive` on the interface facing SW1',
      '`no lldp transmit` on the interface facing SW1',
      '`no cdp enable` on the interface facing SW1',
      '`lldp holdtime 30` in global configuration mode',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 still **transmits**, so SW1 learns about R1, but with **`no lldp receive`** R1 ignores SW1\'s advertisements and builds no entry. `no lldp transmit` would produce the opposite result (SW1 would not see R1), CDP settings do not affect LLDP, and a shorter holdtime only changes how long SW1 keeps R1\'s information.',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'Order the columns of `show cdp neighbors` output from left to right.',
    items: ['Device ID', 'Local Intrfce', 'Holdtme', 'Capability', 'Platform', 'Port ID'],
    difficulty: 2,
    explanation:
      'The summary reads: neighbor name, local interface, remaining holdtime, capability codes, hardware platform and, last, the neighbor\'s own port.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer unplugs the cable from DSW1 port Gi1/0/3. Which ASW2 interface loses its link?',
    exhibit: {
      kind: 'cli',
      text: `${DSW1_CDP}

ASW2# show cdp neighbors
<legend omitted>
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
DSW1             Gig 1/1/1         144               S I  C9300-48P Gig 1/0/2
DSW1             Gig 1/1/2         144               S I  C9300-48P Gig 1/0/3
SEP00AA11BB22DD  Gig 1/0/7         155             H P M  IP Phone  Port 1`,
    },
    options: ['GigabitEthernet1/1/2', 'GigabitEthernet1/1/1', 'GigabitEthernet1/0/3', 'GigabitEthernet1/0/7'],
    answer: 0,
    difficulty: 3,
    explanation:
      "DSW1 lists ASW2 on local Gi1/0/3 with Port ID **Gi1/1/2**, and ASW2 confirms it: its local Gi1/1/2 shows DSW1's Gi1/0/3 as the Port ID. Gi1/1/1 is the other parallel link (to DSW1 Gi1/0/2), Gi1/0/3 is the DSW1 port itself, and Gi1/0/7 connects ASW2 to an IP phone.",
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two reasons justify disabling CDP on an Internet-facing router interface? (Choose two.)',
    options: [
      'CDP advertisements reveal the device model and software version',
      'CDP advertisements can include the device management IP address',
      'CDP consumes a large share of the interface bandwidth',
      'Routing protocols cannot form adjacencies while CDP is enabled',
      'CDP advertisements are routed across the Internet to other Cisco devices',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Anyone on the link receives the platform, **software version** and **management address**, which helps an attacker target known vulnerabilities. CDP traffic is tiny, has no effect on routing adjacencies, and is never routed beyond the directly connected neighbor.',
  },
  {
    id: 'e17',
    type: 'input',
    stem: 'What is the default LLDP holdtime on Cisco IOS, in seconds?',
    answers: ['120'],
    placeholder: 'seconds',
    difficulty: 1,
    explanation: 'LLDP defaults to a **120-second** holdtime with 30-second advertisements. CDP uses 180 and 60 seconds.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Which configuration produces this output?',
    exhibit: {
      kind: 'cli',
      text: `R1# show cdp
Global CDP information:
        Sending CDP packets every 30 seconds
        Sending a holdtime value of 90 seconds
        Sending CDPv2 advertisements is  enabled`,
    },
    options: [
      '`cdp timer 30` and `cdp holdtime 90`',
      '`lldp timer 30` and `lldp holdtime 90`',
      '`cdp timer 90` and `cdp holdtime 30`',
      'No configuration: these are the CDP defaults',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`show cdp` reports the CDP send interval (**`cdp timer 30`**) and the holdtime sent to neighbors (**`cdp holdtime 90`**). LLDP timers appear in `show lldp`, the third option swaps the values, and the defaults would be 60 and 180 seconds.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'SW1 and R1 are directly connected and the link is up/up, but `show cdp neighbors` on SW1 does not list R1. Which two configurations on R1 could cause this? (Choose two.)',
    options: [
      '`no cdp run`',
      '`no cdp enable` on the interface facing SW1',
      '`no ip address` on the interface facing SW1',
      '`no lldp run`',
      '`cdp holdtime 255`',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'R1 stops advertising if CDP is disabled **globally** or **on that interface**. CDP is a Layer 2 protocol, so a missing IP address does not stop it; LLDP settings do not affect CDP; and a longer holdtime only makes SW1 keep R1 longer.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'An engineer needs a Cisco switch to discover a directly connected switch from another vendor. Which protocol should be used?',
    options: ['LLDP', 'CDP', 'VTP', 'DTP'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**LLDP** is the vendor-neutral IEEE 802.1AB standard. CDP is Cisco proprietary, and VTP and DTP are Cisco protocols for VLAN database distribution and trunk negotiation, not neighbor discovery.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about the neighbor is true?',
    exhibit: {
      kind: 'cli',
      text: `SW3# show lldp neighbors GigabitEthernet1/0/3 detail
------------------------------------------------
Local Intf: Gi1/0/3
Chassis id: 7c21.0e4d.9a80
Port id: Gi0/0/1
Port Description: GigabitEthernet0/0/1
System Name: BR-RTR2

System Description:
Cisco IOS XE Software, Version 17.06.05
<output omitted>

Time remaining: 97 seconds
System Capabilities: B,R
Enabled Capabilities: R
Management Addresses:
    IP: 192.168.50.2

Total entries displayed: 1`,
    },
    options: [
      'BR-RTR2 is acting as a router, and its Gi0/0/1 connects to SW3 Gi1/0/3',
      'BR-RTR2 is acting as a switch, because Bridge appears in its System Capabilities',
      'BR-RTR2 connects to SW3 port Gi0/0/1',
      'The entry expires in 97 minutes if no further advertisement arrives',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "**Enabled Capabilities: R** shows what the device is doing now, so BR-RTR2 is acting as a **router**; System Capabilities lists what it could do. Port id Gi0/0/1 is BR-RTR2's own port, and Local Intf Gi1/0/3 is SW3's port. Time remaining is in seconds.",
  },
];
