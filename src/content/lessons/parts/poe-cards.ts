import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Power over Ethernet (PoE)', back: 'Delivers **DC power and data** over the same twisted-pair Ethernet cable, within the normal 100 m limit.' },
  { id: 'f2', front: 'PSE', back: 'Power sourcing equipment: **supplies** power — a PoE switch port (endpoint PSE) or an injector (midspan PSE).' },
  { id: 'f3', front: 'PD', back: 'Powered device: **receives** power — access point, IP phone, IP camera, IoT sensor.' },
  { id: 'f4', front: 'Midspan PSE', back: 'A power injector or powered patch panel between a non-PoE switch and the PD: passes data through and adds power.' },
  { id: 'f5', front: '802.3af (PoE) power per port', back: '**15.4 W** at the PSE; 12.95 W guaranteed at the PD; two pairs.' },
  { id: 'f6', front: '802.3at (PoE+) power per port', back: '**30 W** at the PSE; 25.5 W at the PD; two pairs.' },
  { id: 'f7', front: '802.3bt Type 3 power per port', back: '**60 W** at the PSE (51 W at the PD) over all four pairs.' },
  { id: 'f8', front: '802.3bt Type 4 power per port', back: '**90 W** at the PSE (71.3 W at the PD) over four pairs — often quoted as up to 100 W.' },
  { id: 'f9', front: 'Cisco UPOE', back: 'Cisco Universal PoE: **60 W** per port over all four pairs; it pre-dated 802.3bt.' },
  { id: 'f10', front: 'Cisco UPOE+', back: '**90 W** per port over four pairs, aligned with 802.3bt Type 4.' },
  { id: 'f11', front: 'PoE detection', back: 'The PSE applies a low voltage and looks for a **~25 kΩ signature**. No signature → no power, so non-PoE devices are safe.' },
  { id: 'f12', front: 'PoE classification', back: 'The PD draws a class-specific current so the PSE learns its **class** (0–8) and how much power to allocate.' },
  { id: 'f13', front: 'Order of the PoE power-up process', back: 'Detection → classification → budget check and power-up → optional CDP/LLDP negotiation → monitoring until disconnect.' },
  { id: 'f14', front: 'Class 0 allocation', back: '**15.4 W** — an unclassified PD gets the full 802.3af allocation, the same as class 3.' },
  { id: 'f15', front: 'Class 1, 2 and 3 allocations at the PSE', back: 'Class 1 = 4.0 W, class 2 = 7.0 W, class 3 = 15.4 W.' },
  { id: 'f16', front: 'Class 4 allocation', back: '**30 W** — requires 802.3at (PoE+) or higher.' },
  { id: 'f17', front: 'Classes 5 to 8', back: '802.3bt, four pairs: 45 W, 60 W, 75 W and 90 W at the PSE.' },
  { id: 'f18', front: 'Default PoE mode on a Cisco switch port', back: '`power inline auto`.' },
  { id: 'f19', front: '`power inline static`', back: 'Reserves the port\'s power in advance, even with nothing connected — guarantees power for a critical PD.' },
  { id: 'f20', front: '`power inline never`', back: 'Disables PD detection and power on the port; data forwarding continues. Admin shows **off**.' },
  { id: 'f21', front: 'Units of `max` in `power inline auto max`', back: '**Milliwatts**: `power inline auto max 15400` = 15.4 W (range 4000–30000 on PoE+ switches).' },
  { id: 'f22', front: '`show power inline` summary section', back: 'Per module: **Available**, **Used** and **Remaining** watts of the PoE budget.' },
  { id: 'f23', front: 'Oper state **power-deny**', back: 'A PD was detected, but the remaining budget cannot cover its allocation.' },
  { id: 'f24', front: 'Class 4 PDs a 370 W budget can power', back: '**12** (370 ÷ 30 = 12.3, round down).' },
  { id: 'f25', front: 'Fine-grained PoE power negotiation', back: '**CDP** or **LLDP** (LLDP-MED) lets a booted PD request an exact wattage, freeing unused budget.' },
  { id: 'f26', front: 'Remotely rebooting a frozen PoE access point', back: '`shutdown` then `no shutdown` on its switch port removes and restores power.' },
  { id: 'f27', front: 'PoE nominal voltage', back: 'About **48 V DC**, applied only after successful detection.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which IEEE standard, known as PoE+, supplies up to 30 W per port at the PSE?',
    options: ['802.3af', '802.3at', '802.3bt', '802.1X'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**802.3at** (PoE+) provides 30 W per port. 802.3af provides 15.4 W, 802.3bt provides 60 or 90 W over four pairs, and 802.1X is port-based authentication, not PoE.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two devices are typically powered devices (PDs)? (Choose two.)',
    options: ['Wireless access point', 'PoE access switch', 'IP phone', 'Midspan power injector', 'Desktop PC'],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'Access points and IP phones **receive** PoE, so they are PDs. The switch and the injector **supply** power, so they are PSEs. A desktop PC with a normal NIC has its own power supply and is not a PD.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'How many watts per port does an 802.3af PSE provide? (Enter the number.)',
    answers: ['15.4', '15.4 W', '15.4W', '15.4 watts'],
    placeholder: 'watts',
    difficulty: 1,
    explanation:
      '802.3af provides **15.4 W** at the PSE port. The PD is guaranteed 12.95 W after cable loss; 30 W is 802.3at.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'What is the default PoE mode on a Cisco PoE switch port?',
    options: ['power inline never', 'power inline static', 'power inline auto', 'PoE stays disabled until configured'],
    answer: 2,
    difficulty: 1,
    explanation:
      'Ports default to `power inline auto`: they detect PDs and power them if the budget allows. `static` and `never` must be configured explicitly.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each interface command with its behavior.',
    pairs: [
      { left: '`power inline auto`', right: 'Detects PDs and allocates power only when one is found' },
      { left: '`power inline static`', right: 'Reserves power for the port even when nothing is connected' },
      { left: '`power inline never`', right: 'Never supplies power; data still flows' },
      { left: '`power inline auto max 15400`', right: 'Detects PDs but limits the port to 15.4 W' },
    ],
    difficulty: 2,
    explanation:
      '**auto** allocates dynamically after detection, **static** pre-allocates, **never** disables PoE without shutting the port, and **max** caps the power in milliwatts.',
  },
  {
    id: 'q6',
    type: 'order',
    stem: 'Put the PoE power-up process in order.',
    items: [
      'The PSE detects a valid PD signature',
      'The PD is classified',
      'The PSE checks its remaining budget',
      'The PSE applies full power',
      'CDP or LLDP fine-tunes the allocation after the PD boots',
    ],
    difficulty: 2,
    explanation:
      'Detection comes first so non-PoE devices are never powered. Classification tells the switch how much to allocate; the switch checks the budget, powers the port, and the booted PD can then negotiate a precise value with CDP or LLDP.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'A laptop with a standard NIC is plugged into a PoE switch port in auto mode. What happens?',
    options: [
      'The switch applies 15.4 W because class 0 is the default',
      'The switch detects no PD signature, applies no power, and the link works normally',
      'The port is err-disabled to protect the laptop',
      'The laptop charges its battery from the port',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Without a valid **signature resistance**, detection fails and the PSE never applies power, while the data link comes up as usual. Class 0 applies only to a detected PD that signals no class. Nothing is err-disabled, and a standard NIC cannot draw PoE.',
  },
];
