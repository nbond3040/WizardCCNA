import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Where does a switch insert the 802.1Q tag in an Ethernet frame?',
    options: [
      'Between the source MAC address and the EtherType/Length field',
      'In front of the destination MAC address',
      'After the payload, just before the FCS',
      'Between the destination and source MAC addresses',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The 4-byte tag goes **after the source MAC** and before the EtherType/Length field, where its TPID (0x8100) sits in the position an EtherType normally occupies. Nothing is placed before the destination MAC or between the two MAC addresses, and the tag is not a trailer; the FCS is simply recalculated.',
  },
  {
    id: 'e2',
    type: 'match',
    stem: 'Match each 802.1Q tag field to its purpose.',
    pairs: [
      { left: 'TPID', right: 'Identifies the frame as tagged (0x8100)' },
      { left: 'PCP', right: 'Carries the Class of Service priority' },
      { left: 'DEI', right: 'Marks frames that may be dropped first during congestion' },
      { left: 'VID', right: 'Identifies the VLAN the frame belongs to' },
    ],
    difficulty: 2,
    explanation:
      'The 16-bit **TPID** announces the tag, the 3-bit **PCP** holds the CoS value 0 to 7, the 1-bit **DEI** (formerly CFI) flags drop-eligible frames, and the 12-bit **VID** carries the VLAN number. A common mix-up is to think the PCP identifies the VLAN; it only carries priority.',
  },
  {
    id: 'e3',
    type: 'categorize',
    stem: 'Classify the result of each DTP mode combination on the two ends of a link.',
    categories: ['Trunk', 'Access link', 'Mismatch, limited connectivity'],
    items: [
      { text: 'dynamic auto + dynamic auto', category: 1 },
      { text: 'dynamic desirable + dynamic auto', category: 0 },
      { text: 'trunk + dynamic auto', category: 0 },
      { text: 'dynamic desirable + dynamic desirable', category: 0 },
      { text: 'access + dynamic desirable', category: 1 },
      { text: 'trunk + access', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'A trunk forms when one side actively wants it (trunk or desirable) and the other is willing (trunk, desirable or auto). **auto + auto** stays access because neither side asks, and anything paired with access stays access, except **trunk + access**, where one side tags frames and the other does not: a mismatch with limited connectivity.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Users in VLAN 30 on SW1 cannot reach VLAN 30 users on SW2 across Gi0/1, while VLANs 10 and 20 work. VLAN 30 exists and is active on both switches, and SW2 Gi0/1 allows VLANs 10, 20, 30 and 99. Which command on SW1 Gi0/1 fixes the problem without affecting the other VLANs?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,99

Port        Vlans allowed and active in management domain
Gi0/1       10,20,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,99`,
    },
    options: [
      '`switchport trunk allowed vlan add 30`',
      '`switchport trunk allowed vlan 30`',
      '`switchport trunk native vlan 30`',
      '`switchport trunk allowed vlan except 30`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 30 is missing from the very first list, **Vlans allowed on trunk**, so SW1 never sends it over Gi0/1. `add 30` appends it and keeps 10, 20 and 99. Without `add`, the command would replace the list with VLAN 30 alone and break VLANs 10, 20 and 99; making 30 the native VLAN creates a native VLAN mismatch; and `except 30` allows everything except the one VLAN that is needed.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. SW2 connects to SW1 through Gi0/1 and to SW3 through Gi0/2. Hosts in VLAN 30 on SW1 cannot reach hosts in VLAN 30 on SW3, while VLANs 10 and 20 work end to end. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW2# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99
Gi0/2       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,30,99
Gi0/2       10,20,30,99

Port        Vlans allowed and active in management domain
Gi0/1       10,20,99
Gi0/2       10,20,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,99
Gi0/2       10,20,99`,
    },
    options: [
      'VLAN 30 does not exist on SW2',
      'VLAN 30 is missing from the allowed lists on SW2',
      'Spanning tree is blocking VLAN 30 on both trunks',
      'The native VLAN does not match on SW2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 30 is **allowed** on both trunks but absent from **allowed and active**, which means SW2 has no active VLAN 30. As a transit switch it drops VLAN 30 frames, even though no host on SW2 uses that VLAN; creating VLAN 30 on SW2 fixes it. The allowed lists do include 30, STP blocking would remove it only from the third list, and both trunks show native VLAN 99.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the problem and its fix?',
    exhibit: {
      kind: 'cli',
      text: `SW2#
*Sep 26 09:14:05.117: %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/2 (1), with SW3 GigabitEthernet0/1 (999).`,
    },
    options: [
      'SW2 Gi0/2 uses native VLAN 1 and SW3 Gi0/1 uses native VLAN 999; configure the same native VLAN on both ports',
      'VLAN 999 is not allowed on SW2 Gi0/2; add it with `switchport trunk allowed vlan add 999`',
      'The trunk failed to form; set both ports to `switchport mode trunk`',
      'CDP is disabled on SW3 Gi0/1; enable it with `cdp enable`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'CDP reports each side\'s native VLAN in parentheses: **1** on SW2 Gi0/2 and **999** on SW3 Gi0/1. The fix is a matching `switchport trunk native vlan` on both ends (999 is the better choice, as an unused VLAN). The message says nothing about the allowed list, the trunk itself is up (native mismatches do not stop DTP), and CDP is obviously working because it produced the message.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two statements about the native VLAN on an 802.1Q trunk are true? (Choose two.)',
    options: [
      'Frames in the native VLAN are sent untagged',
      'The native VLAN must match on both ends of the trunk',
      'The native VLAN is always VLAN 1 and cannot be changed',
      'ISL trunks also carry an untagged native VLAN',
      'Native VLAN frames are tagged with VLAN ID 0',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Native VLAN frames cross the trunk **untagged**, and both ends must use the **same** native VLAN or traffic leaks between VLANs and STP blocks them. The default is VLAN 1, but it can and should be changed with `switchport trunk native vlan`; ISL encapsulates every frame and has no native VLAN; and no tag of any kind (not even VID 0) is added to native frames.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. SW3 is a Catalyst 3560. Which command must the engineer enter before `switchport mode trunk` is accepted?',
    exhibit: {
      kind: 'cli',
      text: `SW3(config)# interface gigabitethernet0/2
SW3(config-if)# switchport mode trunk
Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.`,
    },
    options: [
      '`switchport trunk encapsulation dot1q`',
      '`switchport mode dynamic desirable`',
      '`switchport nonegotiate`',
      '`switchport trunk native vlan 1`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A multi-encapsulation switch defaults to **negotiate** (Auto) and will only become a static trunk once an encapsulation is chosen with `switchport trunk encapsulation dot1q`. Dynamic desirable avoids the error but leaves trunking to DTP instead of making a static trunk, `nonegotiate` is only valid on a port already in access or trunk mode, and the native VLAN has nothing to do with the encapsulation.',
  },
  {
    id: 'e9',
    type: 'input',
    stem: 'A trunk allows VLANs 10,20,30. An engineer enters `switchport trunk allowed vlan remove 20` and then `switchport trunk allowed vlan add 40`. Which VLANs are allowed now? Enter the IDs in ascending order, separated by commas.',
    answers: ['10,30,40', '10, 30, 40'],
    placeholder: 'e.g. 10,20',
    difficulty: 2,
    explanation:
      '`remove 20` leaves **10,30**, and `add 40` appends 40, giving **10,30,40**. Both keywords modify the existing list. A plain `switchport trunk allowed vlan 40` would instead have replaced the list with 40 alone.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'A trunk currently allows VLANs 10, 20 and 30. An engineer enters `switchport trunk allowed vlan 50` on it. What is the result?',
    options: [
      'Only VLAN 50 is allowed on the trunk',
      'VLANs 10, 20, 30 and 50 are allowed',
      'VLAN 50 becomes the native VLAN',
      'The command is rejected because an allowed list already exists',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Without a keyword, `switchport trunk allowed vlan` **replaces** the entire list, so only VLAN 50 remains and VLANs 10, 20 and 30 stop crossing the trunk. Appending requires `add 50`; the native VLAN is set with a different command; and IOS never rejects the command because of an existing list.',
  },
  {
    id: 'e11',
    type: 'order',
    stem: 'Put the steps in order to make Gi0/1 on a Catalyst 3560 a static 802.1Q trunk and verify it, starting in global configuration mode.',
    items: [
      '`interface gigabitethernet0/1`',
      '`switchport trunk encapsulation dot1q`',
      '`switchport mode trunk`',
      '`end`',
      '`show interfaces trunk`',
    ],
    difficulty: 2,
    explanation:
      'You must first enter the interface. On a multi-encapsulation switch the encapsulation has to be set **before** static trunk mode, or IOS rejects `switchport mode trunk`. `end` returns to privileged EXEC, where `show interfaces trunk` runs without the `do` prefix.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Why is VLAN 20 missing from the last section for Gi0/2?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99
Gi0/2       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       1-4094
Gi0/2       1-4094

Port        Vlans allowed and active in management domain
Gi0/1       1,10,20,30,99
Gi0/2       1,10,20,30,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       1,10,20,30,99
Gi0/2       1,10,30,99`,
    },
    options: [
      'Spanning tree is blocking Gi0/2 for VLAN 20, or VTP pruning removed VLAN 20 from it',
      'VLAN 20 is not in the allowed list of Gi0/2',
      'VLAN 20 does not exist on SW1',
      'Gi0/2 has a native VLAN mismatch in VLAN 20',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'VLAN 20 survives the first two filters (allowed 1-4094, and active on SW1) but drops out of **forwarding and not pruned**, which is controlled only by the STP state of the port in that VLAN and by VTP pruning. In a redundant design that is often expected. It cannot be the allowed list or a missing VLAN, because 20 appears in the first two lists, and both trunks use native VLAN 99.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'SW1 Gi0/1 is configured with `switchport mode dynamic auto`. Which two configurations on the connected SW2 port result in an operational trunk? (Choose two.)',
    options: [
      '`switchport mode trunk`',
      '`switchport mode dynamic desirable`',
      '`switchport mode dynamic auto`',
      '`switchport mode access`',
      '`switchport mode trunk` with `switchport nonegotiate`',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'A port in auto trunks only when the neighbor sends DTP asking for a trunk, which both **trunk** and **dynamic desirable** do. Auto on both ends never trunks, access never trunks, and a trunk with **nonegotiate** sends no DTP at all, so SW1 stays an access port and the link ends up mismatched.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about Gi0/1 is true?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces gigabitethernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 99 (NATIVE)
...
Trunking VLANs Enabled: 10,20,30,99
Pruning VLANs Enabled: 2-1001`,
    },
    options: [
      'It is a static 802.1Q trunk with native VLAN 99 that allows VLANs 10, 20, 30 and 99',
      'It became a trunk through DTP negotiation from dynamic desirable mode',
      'Frames in VLAN 99 cross the link with an 802.1Q tag',
      'It carries only VLAN 1, its access VLAN',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '**Administrative Mode: trunk** means `switchport mode trunk` was configured; **Negotiation of Trunking: On** only shows that DTP frames are still sent because `nonegotiate` is not set. The native VLAN is 99, whose frames are untagged, and **Trunking VLANs Enabled** is the allowed list. The Access Mode VLAN line is ignored while the port is trunking.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about VTP are true? (Choose two.)',
    options: [
      'A switch with a higher configuration revision number can overwrite the VLAN databases of other switches in the domain',
      'VTP clients cannot create, modify or delete VLANs',
      'VTP transparent switches apply the VLAN updates they receive',
      'VTP advertisements are exchanged on access ports',
      'VTP version 2 can advertise extended-range VLANs',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The database with the **highest revision** wins throughout the domain, and **clients** cannot change VLANs locally. Transparent switches forward VTP messages without applying them, VTP runs over trunks only, and only VTP version 3 can carry extended-range VLANs.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each VTP mode to its behavior.',
    pairs: [
      { left: 'Server', right: 'Creates VLANs and advertises them to the domain' },
      { left: 'Client', right: 'Learns VLANs from updates but cannot create them' },
      { left: 'Transparent', right: 'Keeps local VLANs and forwards VTP messages without applying them' },
      { left: 'Off', right: 'Keeps local VLANs and does not forward VTP messages' },
    ],
    difficulty: 2,
    explanation:
      'Server (the default) is the only mode that both edits and advertises the shared database. Clients follow the server. Transparent and off both keep a private VLAN database; the difference is that transparent relays VTP messages to other switches while off drops them.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which trunking protocol is an IEEE standard?',
    options: ['802.1Q', 'ISL', 'DTP', 'VTP'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**IEEE 802.1Q** is the open standard for VLAN tagging. ISL is Cisco\'s legacy proprietary encapsulation, DTP is Cisco\'s proprietary trunk negotiation protocol, and VTP is Cisco\'s proprietary VLAN database distribution protocol.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Gi0/1 on both switches is at its default setting, VLAN 10 exists on both switches, and both PC ports are access ports in VLAN 10. PC1 cannot ping PC2. What is the cause?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Catalyst 2960', x: 3, y: 1.4 },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'Catalyst 2960', x: 7, y: 1.4 },
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.10.10.11/24', x: 3, y: 3.8 },
          { id: 'pc2', icon: 'pc', label: 'PC2', sub: '10.10.10.12/24', x: 7, y: 3.8 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', label: 'default port settings' },
          { from: 'sw1', to: 'pc1', fromLabel: 'Fa0/1', label: 'VLAN 10' },
          { from: 'sw2', to: 'pc2', fromLabel: 'Fa0/1', label: 'VLAN 10' },
        ],
      },
    },
    options: [
      'Both ends are dynamic auto, so the link operates as an access link in VLAN 1',
      'The native VLAN does not match on the two ends',
      'VLAN 10 is missing from the allowed list',
      'DTP must be disabled on both ends before any trunk can form',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A Catalyst 2960 port defaults to **dynamic auto**; with auto on both ends nobody asks for a trunk, so Gi0/1 is an access link in VLAN 1 and VLAN 10 frames never cross it. Both ends default to native VLAN 1, the default allowed list is 1-4094, and DTP does not need to be disabled: setting either side to trunk or desirable would form the trunk.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements about 802.1Q trunking are true? (Choose two.)',
    options: [
      'The tag adds 4 bytes to the frame',
      'The FCS is recalculated after the tag is inserted',
      'The original frame is encapsulated inside a new 26-byte header',
      'Frames in every VLAN, including the native VLAN, are tagged',
      'The VLAN ID field is 10 bits long',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '802.1Q **inserts 4 bytes**, and because the frame changes, the **FCS is recalculated**. Encapsulation in a 26-byte header describes ISL, native VLAN frames stay untagged, and the VLAN ID field is 12 bits, not 10.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Which command shows, for every trunk, the VLANs that are allowed and active on it?',
    options: ['`show interfaces trunk`', '`show vlan brief`', '`show interfaces status`', '`show vtp status`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`show interfaces trunk` lists each trunk with its allowed, allowed-and-active and forwarding VLANs. `show vlan brief` omits trunk ports entirely, `show interfaces status` only shows the word trunk in the Vlan column, and `show vtp status` describes the VTP domain, not individual trunks.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'What hexadecimal TPID value identifies an 802.1Q-tagged frame?',
    answers: ['0x8100', '8100'],
    placeholder: '0x....',
    difficulty: 1,
    explanation:
      'The TPID is **0x8100**. It occupies the position of the EtherType field, so a receiver immediately knows that a VLAN tag follows. Do not confuse it with IPv4 (0x0800) or ARP (0x0806).',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. SW2 Gi0/1 is not trunking. Which change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config | section interface GigabitEthernet0/1
interface GigabitEthernet0/1
 switchport trunk native vlan 99
 switchport mode trunk
 switchport nonegotiate

SW2# show interfaces gigabitethernet0/1 switchport | include Mode:
Administrative Mode: dynamic auto
Operational Mode: static access`,
    },
    options: [
      'Configure `switchport mode trunk` on SW2 Gi0/1',
      'Configure `switchport nonegotiate` on SW2 Gi0/1',
      'Remove `switchport trunk native vlan 99` from SW1 Gi0/1',
      'Configure `switchport mode dynamic desirable` on SW2 Gi0/1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'SW1 is a static trunk with **nonegotiate**, so it sends no DTP frames and SW2, waiting in auto, never trunks. SW2 must be configured statically with `switchport mode trunk` (and, to avoid a native mismatch, `switchport trunk native vlan 99`). `nonegotiate` cannot be used on a dynamic port, removing the native VLAN setting does not create DTP messages, and desirable still needs a DTP reply that SW1 will never send.',
  },
];

export default exam;
