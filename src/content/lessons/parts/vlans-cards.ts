import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'VLAN', back: 'A logical Layer 2 **broadcast domain**; ports in different VLANs cannot exchange frames without a router.' },
  { id: 'f2', front: 'VLAN-to-subnet relationship', back: 'By design, one VLAN carries one IP subnet.' },
  { id: 'f3', front: 'Three benefits of VLANs', back: 'Smaller broadcast domains (segmentation), isolation between groups (security) and grouping by function rather than location (flexibility).' },
  { id: 'f4', front: 'Normal-range VLAN IDs', back: '**1 to 1005**, with 1002 to 1005 reserved for legacy FDDI and Token Ring.' },
  { id: 'f5', front: 'Extended-range VLAN IDs', back: '**1006 to 4094**.' },
  { id: 'f6', front: 'VLAN IDs 0 and 4095', back: 'Reserved and unusable; the 12-bit VLAN ID has 4096 values but only 1 to 4094 are valid VLANs.' },
  { id: 'f7', front: 'VLAN 1', back: 'The default VLAN: every port starts in it, it is the default native VLAN, and it cannot be deleted.' },
  { id: 'f8', front: 'Where normal-range VLANs are stored', back: 'In `vlan.dat` in flash (VTP server or client mode), not in the startup-config.' },
  { id: 'f9', front: 'Fully reset a switch, including VLANs', back: '`delete flash:vlan.dat` and `erase startup-config`, then `reload`.' },
  { id: 'f10', front: 'Create VLAN 10 named SALES', back: '`vlan 10`, then `name SALES` in VLAN configuration mode (`(config-vlan)#`).' },
  { id: 'f11', front: 'Default name of VLAN 40', back: '`VLAN0040`: the word VLAN plus the ID padded to four digits.' },
  { id: 'f12', front: 'Make a port an access port in VLAN 10', back: '`switchport mode access` and `switchport access vlan 10`.' },
  { id: 'f13', front: 'Assigning a port to a VLAN that does not exist', back: 'On a VTP server or transparent switch, IOS creates the VLAN automatically: "% Access VLAN does not exist. Creating vlan X".' },
  { id: 'f14', front: 'What happens to ports when their VLAN is deleted?', back: 'They stay assigned to that VLAN but become **inactive**, stop forwarding and disappear from `show vlan brief`.' },
  { id: 'f15', front: 'Parking (black-hole) VLAN best practice', back: 'Put unused ports in an unused VLAN such as 999 as static access ports, then `shutdown` them.' },
  { id: 'f16', front: 'Command to add a voice VLAN to an access port', back: '`switchport voice vlan 20` (the data VLAN is still set with `switchport access vlan`).' },
  { id: 'f17', front: 'Tagged vs untagged on an IP phone port', back: 'Phone voice frames are **802.1Q-tagged** with the voice VLAN; PC frames are **untagged** in the access VLAN.' },
  { id: 'f18', front: 'How a Cisco IP phone learns its voice VLAN', back: 'From the switch through **CDP**; multi-vendor phones use **LLDP-MED**.' },
  { id: 'f19', front: 'CoS value normally used for voice', back: '**5**, carried in the 3-bit priority (PCP / CoS) field of the 802.1Q tag.' },
  { id: 'f20', front: '`show vlan brief`', back: 'Lists each VLAN with its name, status and access ports. Trunk ports are not shown.' },
  { id: 'f21', front: '`show interfaces switchport`', back: 'Per-port administrative and operational mode, DTP negotiation, access VLAN, voice VLAN and native VLAN.' },
  { id: 'f22', front: '`show interfaces status`', back: 'One line per port: description, status (connected, notconnect, disabled, err-disabled), VLAN, duplex, speed and type.' },
  { id: 'f23', front: '`act/lshut` in `show vlan brief`', back: 'The VLAN is shut down locally; fix with `no shutdown` under `vlan X` or `no shutdown vlan X`.' },
  { id: 'f24', front: '`act/unsup` in `show vlan brief`', back: 'The status of legacy VLANs 1002 to 1005 on an Ethernet switch.' },
  { id: 'f25', front: 'Default switchport mode on a Catalyst 2960', back: '`dynamic auto`: it becomes a trunk only if the neighbor actively negotiates one.' },
  { id: 'f26', front: 'Status `disabled` in `show interfaces status`', back: 'The interface is administratively shut down (`shutdown`).' },
  { id: 'f27', front: 'Extended-range VLANs with VTP versions 1 and 2', back: 'Can be created only in VTP transparent mode (or with VTP off); VTPv3 can advertise them.' },
  { id: 'f28', front: 'How do hosts in different VLANs communicate?', back: 'Through a **Layer 3** device (router or Layer 3 switch) acting as their default gateway.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which VLAN IDs make up the extended range?',
    options: ['1 to 1005', '1006 to 4094', '1002 to 1005', '2 to 1001'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The extended range is **1006 to 4094**. 1 to 1005 is the normal range, 1002 to 1005 are the reserved legacy VLANs inside it, and 2 to 1001 is the everyday usable part of the normal range.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two interface commands make Fa0/1 a static access port in VLAN 10? (Choose two.)',
    options: ['`switchport mode access`', '`switchport access vlan 10`', '`switchport trunk native vlan 10`', '`switchport voice vlan 10`', '`switchport mode dynamic auto`'],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      '`switchport mode access` fixes the port as an access port and `switchport access vlan 10` selects the VLAN. The native VLAN command applies to trunks, `switchport voice vlan` defines a tagged voice VLAN for phones, and `dynamic auto` leaves the port negotiating with DTP instead of making it static.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'An engineer creates VLAN 25 without giving it a name. What name does IOS display for it?',
    answers: ['VLAN0025'],
    placeholder: 'name',
    difficulty: 1,
    explanation:
      'IOS names an unnamed VLAN with the word VLAN followed by the ID padded to four digits: **VLAN0025**. The name is only a local label and can be changed at any time with `name` in VLAN configuration mode.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'An engineer deletes VLAN 30 while four ports are still assigned to it. What happens to those ports?',
    options: [
      'They become inactive until VLAN 30 is recreated or reassigned',
      'They move to VLAN 1 and keep forwarding traffic there',
      'They are administratively shut down and must be re-enabled manually',
      'They turn into trunk ports carrying the remaining VLANs',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The ports keep their VLAN 30 assignment but become **inactive** and stop forwarding. They do not fall back to VLAN 1, they are not shut down (the links stay connected), and deleting a VLAN never changes a port into a trunk.',
  },
  {
    id: 'q5',
    type: 'categorize',
    stem: 'Classify each VLAN ID.',
    categories: ['Normal range', 'Extended range', 'Reserved, not usable'],
    items: [
      { text: '10', category: 0 },
      { text: '1001', category: 0 },
      { text: '1500', category: 1 },
      { text: '4094', category: 1 },
      { text: '0', category: 2 },
      { text: '4095', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Normal range is 1 to 1005, so 10 and 1001 belong there. Extended range is 1006 to 4094, which covers 1500 and 4094. The values 0 and 4095 exist in the 12-bit field but are reserved and cannot be used as VLANs.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'How does a Cisco IP phone learn which voice VLAN to use?',
    options: [
      'From CDP messages sent by the switch',
      'Through DTP negotiation with the switch',
      'From VTP advertisements in the domain',
      'From STP BPDUs sent by the switch',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The switch advertises the voice VLAN ID to the phone in **CDP** (LLDP-MED does the same for other vendors). DTP negotiates trunking between switches, VTP synchronizes VLAN databases between switches, and STP BPDUs prevent loops; none of them tell a phone its VLAN.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Besides erasing the startup-config, which file must be deleted before a reload to remove all VLANs from a Catalyst switch?',
    options: ['`flash:vlan.dat`', '`nvram:startup-config`', '`system:running-config`', '`flash:config.text`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Normal-range VLANs are stored in **vlan.dat** in flash, which `erase startup-config` does not touch. The startup-config and config.text hold the saved configuration (already handled by the erase), and the running-config is rebuilt at every boot anyway.',
  },
];
