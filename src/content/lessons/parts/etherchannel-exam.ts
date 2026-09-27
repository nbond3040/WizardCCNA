import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which benefit does an EtherChannel provide compared with the same links configured as separate parallel links?',
    options: [
      'Spanning tree treats the bundle as one link, so every member forwards traffic',
      'Each individual flow can use the combined bandwidth of all members',
      'Spanning tree is no longer needed anywhere in the network',
      'Traffic between the switches is encrypted',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'STP runs on the logical port-channel, so no member is blocked and all of them carry traffic. A single flow is hashed onto **one** member, so it never exceeds one link\'s speed; STP is still required for the rest of the topology; and EtherChannel provides no encryption.',
  },
  {
    id: 'e2',
    type: 'categorize',
    stem: 'Classify each pair of EtherChannel modes configured on the two ends of a bundle.',
    categories: ['Channel forms', 'No channel'],
    items: [
      { text: 'active + passive', category: 0 },
      { text: 'desirable + auto', category: 0 },
      { text: 'on + on', category: 0 },
      { text: 'passive + passive', category: 1 },
      { text: 'auto + auto', category: 1 },
      { text: 'on + active', category: 1 },
      { text: 'active + desirable', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'A negotiated channel needs one initiating side: active for LACP, desirable for PAgP. Static `on` forms a channel only with `on`. passive + passive and auto + auto never start negotiation, `on` never negotiates with a protocol mode, and LACP (active) cannot interoperate with PAgP (desirable).',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. What is the problem with Po1?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SD)         LACP      Gi0/1(D)    Gi0/2(D)`,
    },
    options: [
      'Both member links are down, so the Layer 2 port-channel is down',
      'Both members are suspended because of a configuration mismatch',
      'The neighbor is configured in LACP passive mode',
      'Po1 is a Layer 3 channel that has no IP address',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `D` flag on each member means the ports are down (cabling, a powered-off neighbor or `shutdown`), which leaves the Layer 2 channel `SD`. Suspended members would show `s`, a negotiation problem such as passive + passive would show `I` on members that are up, and `S` identifies a Layer 2 channel, not a Layer 3 one.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The EtherChannel between SW1 and SW2 does not form. Which change fixes it?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SD)         LACP      Gi0/1(I)    Gi0/2(I)
SW1# show running-config interface gigabitethernet0/1 | include channel-group
 channel-group 1 mode passive

SW2# show running-config interface gigabitethernet0/1 | include channel-group
 channel-group 1 mode passive`,
    },
    options: [
      'Change the members on either switch to `channel-group 1 mode active`',
      'Change the members on both switches to `channel-group 1 mode auto`',
      'Change the members on SW1 to `channel-group 1 mode on`',
      'Change the channel-group number on SW2 to 2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Both ends are LACP **passive**, so neither sends the first LACPDU and the ports stay stand-alone (`I`). Making either side **active** starts negotiation. auto + auto is the PAgP version of the same deadlock, `on` cannot pair with a negotiating passive port, and channel-group numbers are locally significant, so changing one has no effect.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Which two statements about LACP are true? (Choose two.)',
    options: [
      'It is defined by IEEE 802.3ad, now part of IEEE 802.1AX',
      'A port in active mode sends LACPDUs to start negotiation',
      'It is a Cisco-proprietary protocol',
      'Its modes are desirable and auto',
      'It supports a maximum of four active links',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'LACP is the **IEEE** link aggregation protocol, and **active** ports initiate negotiation. The Cisco-proprietary protocol with desirable and auto modes is PAgP, and an EtherChannel supports up to eight active links, not four.',
  },
  {
    id: 'e6',
    type: 'order',
    stem: 'Starting in privileged EXEC mode, put the steps in order to bundle Gi0/1 and Gi0/2 into LACP channel 1 and verify the result.',
    items: [
      '`configure terminal`',
      '`interface range gigabitethernet0/1 - 2`',
      '`channel-group 1 mode active`',
      '`end`',
      '`show etherchannel summary`',
    ],
    difficulty: 2,
    explanation:
      'Enter global configuration, select both members at once with `interface range` so that their settings stay identical, add them to the channel with `channel-group 1 mode active` (which also creates Port-channel1), return to privileged EXEC with `end`, and verify with `show etherchannel summary`.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two configuration steps are required for a Layer 3 EtherChannel on a Catalyst 3560? (Choose two.)',
    options: [
      '`no switchport` on the member interfaces',
      '`ip address` on the port-channel interface',
      '`ip address` on each member interface',
      '`switchport mode trunk` on the port-channel interface',
      '`channel-protocol pagp` on the port-channel interface',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The members must be **routed ports** (`no switchport`), and the single **IP address belongs on the port-channel**. Member interfaces carry no addresses, a trunk is a Layer 2 construct, and PAgP is neither required nor the recommended protocol; LACP works for Layer 3 channels.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about Po2 is true?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
2      Po2(RU)         LACP      Gi0/1(P)    Gi0/2(P)`,
    },
    options: [
      'Po2 is a Layer 3 port-channel in use, with Gi0/1 and Gi0/2 bundled by LACP',
      'Po2 is a Layer 2 trunk carrying several VLANs',
      'Po2 is down, because R means removed',
      'Po2 was negotiated with PAgP desirable mode',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`R` marks a **Layer 3** (routed) port-channel and `U` means **in use**; both members show `P`, bundled, and the protocol column reads LACP. A Layer 2 channel would show `S`, a down channel would show `D`, and a PAgP channel would show PAgP in the Protocol column.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each flag in `show etherchannel summary` to its meaning.',
    pairs: [
      { left: '`P`', right: 'Bundled in the port-channel' },
      { left: '`s`', right: 'Suspended because its settings do not match' },
      { left: '`I`', right: 'Stand-alone, not bundled' },
      { left: '`D`', right: 'Down' },
      { left: '`H`', right: 'Hot-standby (LACP only)' },
      { left: '`R`', right: 'Layer 3 port-channel' },
    ],
    difficulty: 2,
    explanation:
      '`P` is a healthy member, `s` a member with mismatched settings, `I` a member with no negotiating partner, and `D` a down port or channel. `H` appears only with LACP when more than eight members are configured, and `R` (versus `S`) marks a routed, Layer 3 port-channel.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Almost all traffic flows from the 50 PCs to the single server, and nearly all of it uses one member of Po1. Which change on SW1 spreads the load best?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pcs', icon: 'pc', label: 'PC1 to PC50', sub: 'VLAN 10', x: 1.2, y: 2.5 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'load-balance dst-mac', x: 3.8, y: 2.5 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.4, y: 2.5 },
          { id: 'srv', icon: 'server', label: 'Server', sub: '10.10.10.100', x: 8.9, y: 2.5, tone: 'accent' },
        ],
        links: [
          { from: 'pcs', to: 'sw1' },
          { from: 'sw1', to: 'sw2', label: 'Po1: 4 x 1 Gbps', style: 'thick' },
          { from: 'sw2', to: 'srv' },
        ],
      },
    },
    options: [
      '`port-channel load-balance src-dst-ip`',
      '`port-channel load-balance dst-ip`',
      'Enable per-packet load balancing on Po1',
      'Add more member links to Po1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'With `dst-mac`, every frame to the server carries the same destination MAC, so the hash always selects the same member. Including the **source** address (`src-dst-ip`) gives 50 different inputs and spreads the flows. `dst-ip` has the same problem because the server has one IP, EtherChannel does not balance per packet, and extra members would still receive none of the traffic because the hash result does not change.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which global configuration command makes all EtherChannels on a switch hash on both source and destination IP addresses? Enter the full command.',
    answers: ['port-channel load-balance src-dst-ip'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`port-channel load-balance src-dst-ip` is a **global** command on Catalyst switches and applies to every port-channel. Verify it with `show etherchannel load-balance`. Other keywords include `src-mac`, `dst-mac`, `src-dst-mac`, `src-ip` and `dst-ip`.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Why is Gi0/2 not bundled, and what fixes it?',
    exhibit: {
      kind: 'cli',
      text: `SW1#
*Sep 27 10:05:12.114: %EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (vlan mask is different)
SW1# show running-config | section interface GigabitEthernet0/[12]
interface GigabitEthernet0/1
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
 switchport mode trunk
 channel-group 1 mode active
interface GigabitEthernet0/2
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,99
 switchport mode trunk
 channel-group 1 mode active`,
    },
    options: [
      'Its allowed VLAN list differs from Gi0/1; make the lists identical, ideally under interface port-channel 1',
      'Its native VLAN differs from Gi0/1; change the native VLAN on Gi0/2',
      'Its LACP mode is wrong; change Gi0/2 to passive mode',
      'Trunks cannot be bundled; convert both members to access ports',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The log says **vlan mask is different**, and the configuration shows why: Gi0/1 allows 10,20,99 while Gi0/2 allows only 10,99. Configuring the list on the port-channel pushes the same list to every member. Both members use native VLAN 99, active mode is correct (mixing active and passive members is not the issue), and trunk members bundle perfectly well when they match.',
  },
  {
    id: 'e13',
    type: 'categorize',
    stem: 'Classify each keyword or fact by the EtherChannel method it belongs to.',
    categories: ['LACP', 'PAgP', 'Static (no protocol)'],
    items: [
      { text: '`active`', category: 0 },
      { text: '`passive`', category: 0 },
      { text: 'IEEE 802.3ad', category: 0 },
      { text: '`desirable`', category: 1 },
      { text: '`auto`', category: 1 },
      { text: 'Cisco proprietary', category: 1 },
      { text: '`on`', category: 2 },
    ],
    difficulty: 1,
    explanation:
      'LACP is the IEEE standard (802.3ad, now 802.1AX) with active and passive modes. PAgP is Cisco proprietary with desirable and auto. `on` forces a static bundle with no negotiation protocol at all.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. Both switches use channel-group 1 on Gi0/1 and Gi0/2, with the modes shown. The EtherChannel does not form. What is the cause?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'channel-group 1 mode on', x: 2.5, y: 2.2 },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'channel-group 1 mode active', x: 7.5, y: 2.2 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', label: 'Gi0/1 + Gi0/2', fromLabel: 'Gi0/1-2', toLabel: 'Gi0/1-2', style: 'thick', tone: 'bad' },
        ],
      },
    },
    options: [
      'Mode `on` does not negotiate, so it cannot form a channel with an LACP active port',
      'Active mode forms a channel only with a passive neighbor',
      'Layer 2 EtherChannels must use PAgP between Cisco switches',
      'The channel-group numbers must be different on the two switches',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`on` builds a static bundle and never sends or answers LACPDUs, so SW2\'s active ports find no LACP partner. Both sides must be `on`, or both must use LACP with at least one active side. Active works with active or passive, LACP is fine between Cisco switches, and channel-group numbers are locally significant, so they may match or differ.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two settings must match on all member ports of a Layer 2 EtherChannel? (Choose two.)',
    options: [
      'Speed and duplex',
      'Native VLAN and allowed VLAN list (for trunk members)',
      'Interface descriptions',
      'LACP port priority',
      'Consecutive interface numbers',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Members must share **speed and duplex** and the same **VLAN settings** (switchport mode, access VLAN, or native and allowed VLANs), otherwise they are suspended. Descriptions are just labels, LACP port priority may differ (it only ranks ports for active or standby selection), and members do not need consecutive numbers.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. Po1 on DSW1 has four 1-Gbps member ports configured. How many members are currently bundled?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show interfaces port-channel 1
Port-channel1 is up, line protocol is up (connected)
  Hardware is EtherChannel, address is 0019.e8a4.3b82 (bia 0019.e8a4.3b82)
  MTU 1500 bytes, BW 3000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  ...`,
    },
    options: ['3', '4', '1', '2'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A port-channel\'s **BW** is the sum of its bundled members: 3,000,000 Kbit/sec equals three 1-Gbps links, so one of the four configured ports is not bundled (down, suspended or stand-alone). Four members would show 4,000,000 Kbit/sec, and one or two members would show 1,000,000 or 2,000,000.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'In `show etherchannel summary`, a member port shows the flag `H`. What does this mean?',
    options: [
      'It is an LACP hot-standby port that will be used if an active member fails',
      'It is a hardware failure on that member',
      'It is a member suspended because of a VLAN mismatch',
      'It is a PAgP member waiting for its partner',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`H` means **hot-standby**, which only LACP supports: with more than eight members configured, the extra ports wait to replace a failed active member. Hardware problems show as down (`D`), mismatches as suspended (`s`), and PAgP has no hot-standby state.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'SW1 Gi0/1 and Gi0/2 are configured with `channel-group 1 mode passive`. Which two configurations on the connected SW2 ports allow the EtherChannel to form? (Choose two.)',
    options: [
      '`channel-group 1 mode active`',
      '`channel-group 5 mode active`',
      '`channel-group 1 mode passive`',
      '`channel-group 1 mode desirable`',
      '`channel-group 1 mode on`',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'A passive LACP port needs an **active** LACP partner, and the channel-group number is **locally significant**, so group 1 and group 5 on SW2 both work. passive + passive never negotiates, desirable is PAgP and cannot talk to LACP, and `on` does not negotiate at all.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Which command shows one line per port-channel with its protocol and the flags of every member?',
    options: ['`show etherchannel summary`', '`show interfaces trunk`', '`show etherchannel load-balance`', '`show spanning-tree summary`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`show etherchannel summary` lists each group, its port-channel flags, the protocol and each member\'s flag. `show interfaces trunk` covers trunking only, `show etherchannel load-balance` shows the hash method, and `show spanning-tree summary` summarizes STP state.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'In `show etherchannel summary`, which two-letter flag combination follows the name of a Layer 2 port-channel that is in use?',
    answers: ['SU', '(SU)'],
    placeholder: 'flags',
    difficulty: 1,
    explanation:
      '**SU** combines `S` (Layer 2) and `U` (in use), as in `Po1(SU)`. A Layer 3 channel in use shows `RU`, and a Layer 2 channel with no bundled members shows `SD`.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Why does an EtherChannel send every frame of a given conversation over the same member link?',
    options: [
      'The hash of the flow\'s addresses always selects the same member, which prevents out-of-order delivery',
      'LACP allows only one member to forward at a time',
      'Spanning tree blocks all members except one',
      'Each VLAN is permanently pinned to one member',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Load balancing is a deterministic **hash** of header fields, so the same flow always maps to the same member and its frames stay in order. All active members forward simultaneously, STP sees the bundle as one port and blocks none of them, and the hash is based on addresses, not on VLAN assignment.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. Which action brings Gi0/2 into the bundle?',
    exhibit: {
      kind: 'cli',
      text: `SW2#
*Sep 27 10:02:41.338: %EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)
SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(s)
SW2# show running-config interface gigabitethernet0/2 | include speed
 speed 100`,
    },
    options: [
      'Remove `speed 100` from Gi0/2 so that it runs at 1000 Mbps like Gi0/1',
      'Change Gi0/2 to LACP passive mode',
      'Configure `speed 100` on interface port-channel 1',
      'Shut down Gi0/1 so that Gi0/2 can join the bundle',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Gi0/2 is **suspended** (`s`) because its hard-coded speed of 100 Mbps differs from Gi0/1\'s 1000 Mbps; removing the command (for example with `no speed`) lets it match, and LACP then bundles it. The LACP mode is not the problem, slowing the whole channel to 100 Mbps would waste bandwidth, and shutting down the healthy member would only take the channel down.',
  },
];

export default exam;
