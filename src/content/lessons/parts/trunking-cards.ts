import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Trunk port', back: 'A link that carries frames for multiple VLANs, identifying each frame\'s VLAN with an 802.1Q tag.' },
  { id: 'f2', front: '802.1Q tag: size and position', back: '**4 bytes**, inserted between the source MAC address and the EtherType/Length field.' },
  { id: 'f3', front: 'TPID value of an 802.1Q tag', back: '`0x8100` (16 bits).' },
  { id: 'f4', front: 'PCP field', back: '3-bit Priority Code Point that carries the **CoS** value (0 to 7) for Layer 2 QoS.' },
  { id: 'f5', front: 'DEI field', back: '1-bit Drop Eligible Indicator (formerly CFI): marks frames that may be dropped first during congestion.' },
  { id: 'f6', front: 'VID field', back: '**12 bits**: 4096 values, of which VLANs 1 to 4094 are usable.' },
  { id: 'f7', front: 'What happens to the FCS when a tag is added or removed?', back: 'It is **recalculated**, because the frame contents changed.' },
  { id: 'f8', front: 'ISL', back: 'Cisco-proprietary legacy trunking that encapsulates the whole frame (26-byte header + 4-byte trailer) and has no native VLAN.' },
  { id: 'f9', front: 'Native VLAN', back: 'The VLAN whose frames cross an 802.1Q trunk **untagged**; untagged frames received on a trunk join it. Default: VLAN 1.' },
  { id: 'f10', front: 'Native VLAN best practice', back: 'Use an unused VLAN (e.g. 99 or 999), identical on both ends, to reduce VLAN-hopping risk.' },
  { id: 'f11', front: 'Symptoms of a native VLAN mismatch', back: '`%CDP-4-NATIVE_VLAN_MISMATCH` messages, STP blocking of both affected VLANs, and traffic leaking between the two VLANs.' },
  { id: 'f12', front: 'Set native VLAN 99 on a trunk', back: '`switchport trunk native vlan 99`' },
  { id: 'f13', front: 'First command for a static trunk on a Catalyst 3560', back: '`switchport trunk encapsulation dot1q`, then `switchport mode trunk`.' },
  { id: 'f14', front: '`switchport trunk allowed vlan 40`', back: '**Replaces** the whole allowed list with VLAN 40 only.' },
  { id: 'f15', front: 'Add VLAN 50 to an existing allowed list', back: '`switchport trunk allowed vlan add 50`' },
  { id: 'f16', front: '`switchport trunk allowed vlan except 1-9`', back: 'Allows every VLAN except 1 to 9, that is 10 to 4094.' },
  { id: 'f17', front: 'DTP', back: 'Dynamic Trunking Protocol: Cisco-proprietary negotiation of whether a link becomes a trunk.' },
  { id: 'f18', front: 'dynamic desirable vs dynamic auto', back: 'Desirable actively asks to trunk; auto only trunks when the neighbor asks (trunk or desirable).' },
  { id: 'f19', front: 'dynamic auto + dynamic auto', back: '**Access link**: neither side asks, so no trunk forms.' },
  { id: 'f20', front: 'Default DTP mode of a Catalyst 2960 port', back: '`dynamic auto`.' },
  { id: 'f21', front: '`switchport nonegotiate`', back: 'Stops sending DTP frames; allowed only with access or trunk mode, so the neighbor must be set to `trunk` manually.' },
  { id: 'f22', front: 'Trunk on one end, access on the other', back: 'A misconfiguration with **limited connectivity**; avoid it.' },
  { id: 'f23', front: 'Four sections of `show interfaces trunk`', back: 'Mode/encapsulation/status/native VLAN; VLANs allowed; allowed and active; STP forwarding and not pruned.' },
  { id: 'f24', front: 'VLAN in "allowed" but not in "allowed and active"', back: 'The VLAN does not exist, or is shut or suspended, on that switch.' },
  { id: 'f25', front: 'VTP modes', back: 'Server (default), client, transparent and off.' },
  { id: 'f26', front: 'VTP client', back: 'Applies and forwards VTP updates but cannot create, modify or delete VLANs.' },
  { id: 'f27', front: 'VTP transparent', back: 'Keeps its own local VLANs, does not apply updates, but forwards VTP messages.' },
  { id: 'f28', front: 'VTP configuration revision risk', back: 'The database with the highest revision in the domain wins, so a stale switch can overwrite every switch\'s VLANs.' },
  { id: 'f29', front: 'VTP version 3 improvements', back: 'Only the primary server can make changes, extended-range VLANs are supported, and accidental overwrites are far less likely.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'How many bytes does an 802.1Q tag add to an Ethernet frame?',
    options: ['4', '2', '26', '30'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The 802.1Q tag is **4 bytes** (TPID 16 bits + PCP 3 + DEI 1 + VID 12). 2 bytes is the size of the TPID alone, while 26 and 30 bytes describe ISL, whose header is 26 bytes and total overhead 30 bytes.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which frames are sent without a tag on an 802.1Q trunk?',
    options: ['Frames in the native VLAN', 'Frames in the extended VLAN range', 'Frames in the voice VLAN', 'Frames in the VLAN with the lowest ID'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Only **native VLAN** frames cross an 802.1Q trunk untagged. Extended-range and voice VLAN frames are tagged like any other VLAN, and the lowest VLAN ID has no special meaning unless it happens to be the native VLAN.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two DTP mode combinations result in a trunk? (Choose two.)',
    options: [
      'dynamic desirable and dynamic auto',
      'trunk and dynamic auto',
      'dynamic auto and dynamic auto',
      'access and dynamic desirable',
      'access and trunk',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A trunk forms when one side actively wants it (desirable or trunk) and the other is willing. **auto + auto** never trunks because nobody asks, anything with access stays access, and access + trunk is a mismatch with limited connectivity.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which interface command adds VLAN 50 to a trunk\'s allowed list without removing any VLANs already allowed?',
    answers: ['switchport trunk allowed vlan add 50', 'sw trunk allowed vlan add 50', 'switchport trunk allow vlan add 50'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`switchport trunk allowed vlan add 50` appends VLAN 50. Without the `add` keyword, `switchport trunk allowed vlan 50` would replace the whole list with VLAN 50 alone.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each 802.1Q tag field to its size.',
    pairs: [
      { left: 'TPID', right: '16 bits' },
      { left: 'PCP', right: '3 bits' },
      { left: 'DEI', right: '1 bit' },
      { left: 'VID', right: '12 bits' },
    ],
    difficulty: 1,
    explanation:
      'TPID 16 + PCP 3 + DEI 1 + VID 12 = 32 bits, the 4-byte tag. The 12-bit VID is why VLAN IDs stop at 4094, and the 3-bit PCP gives the eight CoS values 0 to 7.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'In `show interfaces trunk`, VLAN 30 appears under "Vlans allowed on trunk" but not under "Vlans allowed and active in management domain". What is the most likely cause?',
    options: [
      'VLAN 30 does not exist on this switch',
      'VLAN 30 is blocked by spanning tree on this trunk',
      'VLAN 30 is the native VLAN',
      'VLAN 30 was removed from the allowed list',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The "allowed and active" list keeps only allowed VLANs that **exist and are active** on the switch, so VLAN 30 is missing (or shut) locally. STP blocking would remove it from the third list instead, the native VLAN is listed normally, and a VLAN removed from the allowed list would not appear in the first list at all.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which VTP mode cannot create, modify or delete VLANs?',
    options: ['Client', 'Server', 'Transparent', 'Off'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A **VTP client** only learns VLANs from updates. Servers create VLANs and advertise them, while transparent and off switches can create VLANs locally but do not apply updates from others.',
  },
];
