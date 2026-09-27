import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'EtherChannel', back: 'Bundles several parallel physical links into one logical port-channel for more bandwidth and redundancy.' },
  { id: 'f2', front: 'Maximum active links in one EtherChannel', back: '**8**.' },
  { id: 'f3', front: 'How does STP treat an EtherChannel?', back: 'As one logical port, so no member link is blocked.' },
  { id: 'f4', front: 'What happens when one member link fails?', back: 'Its traffic moves to the remaining members; bandwidth drops, but the port-channel stays up and STP does not reconverge.' },
  { id: 'f5', front: 'LACP standard', back: 'IEEE **802.3ad**, now part of **802.1AX**.' },
  { id: 'f6', front: 'LACP modes', back: '**active** (sends LACPDUs to start negotiation) and **passive** (only responds).' },
  { id: 'f7', front: 'PAgP', back: 'Cisco-proprietary Port Aggregation Protocol with modes **desirable** (initiates) and **auto** (responds).' },
  { id: 'f8', front: 'Static EtherChannel mode', back: '`on`: no negotiation protocol; it forms a channel only with `on` at the other end.' },
  { id: 'f9', front: 'LACP mode pairs that form a channel', back: 'active + active and active + passive.' },
  { id: 'f10', front: 'passive + passive', back: 'No channel: neither side sends LACPDUs.' },
  { id: 'f11', front: 'PAgP mode pairs that form a channel', back: 'desirable + desirable and desirable + auto.' },
  { id: 'f12', front: 'auto + auto', back: 'No channel: neither side initiates PAgP negotiation.' },
  { id: 'f13', front: '`on` + `active`', back: 'No channel: `on` never negotiates, and static and LACP modes cannot be mixed.' },
  { id: 'f14', front: 'LACP ports per channel', back: 'Up to 16 configured: 8 active and 8 hot-standby.' },
  { id: 'f15', front: 'Add ports to channel group 1 using LACP active mode', back: '`channel-group 1 mode active` under the interface or interface range.' },
  { id: 'f16', front: 'Member settings that must match', back: 'Speed, duplex, switchport mode, and the access VLAN or the trunk native and allowed VLANs.' },
  { id: 'f17', front: 'Where to change Layer 2 settings after bundling', back: 'On `interface port-channel N`; the settings are applied to every member.' },
  { id: 'f18', front: 'Layer 3 EtherChannel', back: '`no switchport` on the members and the port-channel; the IP address goes on the port-channel only.' },
  { id: 'f19', front: 'Flag `P`', back: 'The port is bundled in the port-channel.' },
  { id: 'f20', front: 'Flag `s`', back: 'Suspended: the port\'s settings do not match the other members.' },
  { id: 'f21', front: 'Flag `I`', back: 'Stand-alone: not bundled, usually because no negotiating partner answered.' },
  { id: 'f22', front: 'Flag `D`', back: 'The port (or port-channel) is down.' },
  { id: 'f23', front: 'Port-channel flags `SU` and `RU`', back: '`SU`: Layer 2 port-channel in use. `RU`: Layer 3 port-channel in use.' },
  { id: 'f24', front: 'Flag `H`', back: 'An LACP hot-standby member beyond the 8 active links.' },
  { id: 'f25', front: 'How EtherChannel load balancing works', back: 'Per flow: a hash of header fields (e.g. `src-dst-ip`) selects the member, so one flow always uses one link.' },
  { id: 'f26', front: 'Change the load-balancing method', back: 'Global command `port-channel load-balance src-dst-ip`; it applies to all port-channels.' },
  { id: 'f27', front: 'Show the load-balancing method', back: '`show etherchannel load-balance`.' },
  { id: 'f28', front: 'Default load-balancing method on a Catalyst 2960', back: '`src-mac`.' },
  { id: 'f29', front: 'Port-channel bandwidth with two 1-Gbps members', back: '`BW 2000000 Kbit/sec`: the sum of the bundled members.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'What is the maximum number of active member links in one EtherChannel?',
    options: ['8', '4', '16', '2'],
    answer: 0,
    difficulty: 1,
    explanation:
      'An EtherChannel carries traffic on up to **8** active members. LACP can have 16 ports configured, but the extra 8 are hot-standby, not active. 4 and 2 are simply common bundle sizes, not limits.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two LACP mode combinations form an EtherChannel? (Choose two.)',
    options: ['active + passive', 'active + active', 'passive + passive', 'active + desirable', 'on + active'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A channel needs at least one **active** side, so active + passive and active + active both work. passive + passive never starts negotiation, desirable is a PAgP mode that cannot pair with LACP, and `on` does not negotiate at all, so it only pairs with `on`.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'Which EtherChannel negotiation protocol is Cisco proprietary?',
    options: ['PAgP', 'LACP', 'IEEE 802.1AX', 'IEEE 802.3ad'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**PAgP** (Port Aggregation Protocol) is Cisco proprietary. LACP is the open standard, originally defined in IEEE 802.3ad and now maintained in IEEE 802.1AX, so the other three options all describe the standard protocol.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which interface command adds a port to channel group 1 so that it actively negotiates with LACP? Enter the full command.',
    answers: ['channel-group 1 mode active'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`channel-group 1 mode active` assigns the port to group 1 and makes it send LACPDUs. `mode passive` would only answer, `mode desirable` or `mode auto` would select PAgP, and `mode on` would skip negotiation entirely.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each member-port flag in `show etherchannel summary` to its meaning.',
    pairs: [
      { left: '`P`', right: 'Bundled in the port-channel' },
      { left: '`s`', right: 'Suspended because of a settings mismatch' },
      { left: '`I`', right: 'Stand-alone, not bundled' },
      { left: '`D`', right: 'Down' },
    ],
    difficulty: 1,
    explanation:
      '`P` is the healthy state. `s` means the member\'s configuration differs from the others, `I` means it found no negotiating partner and runs as an individual link, and `D` means the port is physically or administratively down.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Where is the IP address configured on a Layer 3 EtherChannel?',
    options: ['On the port-channel interface', 'On every member interface', 'On the first member interface only', 'On an SVI for the channel'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The members are routed ports without addresses, and the **port-channel** interface holds the single IP address for the bundle. Addresses on members would conflict with the bundle, and an SVI belongs to a VLAN, which a routed channel does not use.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'How does EtherChannel distribute traffic across its member links?',
    options: [
      'Per flow, using a hash of address fields to choose a member',
      'Per packet, in round-robin order',
      'Always on the lowest-numbered member until it is full',
      'By copying each frame onto every member',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A **hash** of selected fields, such as source and destination IP, picks one member per flow, which keeps each flow in order. Round-robin per packet could reorder frames, filling one link first is not how the hash works, and copying frames onto every member would create duplicates.',
  },
];
