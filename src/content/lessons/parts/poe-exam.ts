import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'What is the maximum power per port at the PSE defined by IEEE 802.3bt Type 4?',
    options: ['15.4 W', '30 W', '60 W', '90 W'],
    answer: 3,
    difficulty: 1,
    explanation:
      '802.3bt Type 4 delivers **90 W** at the PSE (71.3 W at the PD) over four pairs. 60 W is 802.3bt Type 3 (and Cisco UPOE), 30 W is 802.3at (PoE+) and 15.4 W is 802.3af.',
  },
  {
    id: 'e2',
    type: 'match',
    stem: 'Match each PoE standard to its maximum power per port at the PSE.',
    pairs: [
      { left: '802.3af', right: '15.4 W' },
      { left: '802.3at', right: '30 W' },
      { left: '802.3bt Type 3', right: '60 W' },
      { left: '802.3bt Type 4', right: '90 W' },
    ],
    difficulty: 1,
    explanation:
      'The ladder doubles and then adds: af = **15.4 W**, at (PoE+) = **30 W**, bt Type 3 = **60 W**, bt Type 4 = **90 W**. The last two use all four pairs.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. SW2 does not support PoE, and the new access point requires 802.3at power. Which device should be installed at position X?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW2', sub: 'no PoE support', x: 1.2, y: 1.5 },
          { id: 'x', icon: 'box', label: 'X', sub: '?', x: 5, y: 1.5, tone: 'accent' },
          { id: 'ap', icon: 'ap', label: 'AP', sub: 'requires 802.3at', x: 8.8, y: 1.5 },
        ],
        links: [
          { from: 'sw', to: 'x', label: 'data' },
          { from: 'x', to: 'ap', label: 'data + power' },
        ],
      },
    },
    options: [
      'An 802.3af midspan injector',
      'An 802.3at (PoE+) midspan injector',
      'A PoE splitter',
      'A second non-PoE switch',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A **midspan PSE** (injector) adds power between a non-PoE switch and the PD, and it must meet the PD\'s standard: an 802.3at AP needs a **PoE+** injector (30 W). An 802.3af injector provides only 15.4 W. A PoE splitter works the other way round, taking power off a PoE link to feed a non-PoE device, and another non-PoE switch supplies no power at all.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. A new access point connected to Gi1/0/13 does not power on. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show power inline

Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0      360.0        10.0
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         30.0    Ieee PD             4     30.0
Gi1/0/2   auto   on         30.0    Ieee PD             4     30.0
<output omitted>
Gi1/0/12  auto   on         30.0    Ieee PD             4     30.0
Gi1/0/13  auto   power-deny 0.0     Ieee PD             4     30.0
Gi1/0/14  auto   off        0.0     n/a                 n/a   30.0`,
    },
    options: [
      'Gi1/0/13 is configured with power inline never',
      'The access point is not a valid PD, so detection failed',
      'The remaining PoE budget is smaller than the 30 W the class 4 AP needs',
      'The port maximum on Gi1/0/13 is set below 30 W',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Oper **power-deny** with only **10.0 W remaining** means the switch detected the PD but cannot cover its class 4 allocation of 30 W — twelve class 4 APs already use 360 W. Admin is `auto`, not `off`, so `power inline never` is not configured. Detection clearly succeeded because the port shows `Ieee PD` and class 4. The Max column still shows 30.0 W, so no lower cap is set.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. All ports use power inline auto, several ports are free, and each device is allocated its class maximum. Which newly connected device will receive power?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show power inline

Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0      360.0        10.0
<output omitted>`,
    },
    options: ['A class 4 access point', 'A class 3 IP camera', 'A class 0 IoT sensor', 'A class 2 IP phone'],
    answer: 3,
    difficulty: 3,
    explanation:
      'Only **10.0 W** remains. A class 2 phone is allocated **7.0 W**, which fits. A class 4 AP needs 30 W, and both the class 3 camera and the class 0 sensor are allocated 15.4 W — class 0 means unclassified and gets the full 802.3af allocation, so it is not the cheapest option despite the low number.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two statements about the power inline static command are true? (Choose two.)',
    options: [
      'Power is reserved for the port even when no device is connected',
      'It is the default PoE mode on Cisco switch ports',
      'It guarantees that a critical PD receives power when it is connected',
      'It disables PD detection on the port',
      'It allocates power only after a PD has been detected',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '`static` **pre-allocates** the port\'s power, so it is subtracted from the budget immediately and a critical PD is **guaranteed** power when plugged in. The default mode is `auto`, which is also the mode that allocates only after detection. Disabling detection describes `never`.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Enter the interface configuration command that stops a Cisco switch port from supplying PoE while leaving data forwarding enabled.',
    answers: ['power inline never'],
    placeholder: 'interface command',
    difficulty: 1,
    explanation:
      '`power inline never` disables detection and power on the port; the port still forwards data. `shutdown` would stop data too, and `power inline static` reserves power instead of disabling it.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each device as power sourcing equipment (PSE) or a powered device (PD).',
    categories: ['PSE', 'PD'],
    items: [
      { text: 'PoE access switch', category: 0 },
      { text: 'Midspan power injector', category: 0 },
      { text: 'Powered patch panel', category: 0 },
      { text: 'Wireless access point', category: 1 },
      { text: 'IP phone', category: 1 },
      { text: 'IP security camera', category: 1 },
      { text: 'Badge reader', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'Anything that **puts power on the cable** is a PSE: the switch (endpoint PSE) and injectors or powered patch panels (midspan PSEs). Endpoints that **consume** that power — APs, phones, cameras, badge readers — are PDs.',
  },
  {
    id: 'e9',
    type: 'order',
    stem: 'Put the steps of the PoE power-up process in the correct order.',
    items: [
      'Detection: the PSE looks for a valid signature resistance',
      'Classification: the PD signals its power class',
      'The PSE checks its remaining power budget',
      'The PSE applies full voltage and powers the PD',
      'CDP or LLDP refines the allocation after the PD boots',
    ],
    difficulty: 2,
    explanation:
      'The PSE must first **detect** a PD so that non-PoE devices are never powered, then **classify** it to know the allocation. It checks the **budget**, applies **full power**, and only after the PD has booted can CDP or LLDP negotiate a more precise value.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'A switch has a 740 W PoE budget. With class-based allocation, how many class 4 PDs can it power at the same time?',
    answers: ['24'],
    placeholder: 'number of PDs',
    difficulty: 2,
    explanation:
      'Class 4 is allocated 30 W: 740 ÷ 30 = 24.67, rounded **down** to **24** (24 × 30 = 720 W; a 25th would need 750 W). Answering 25 rounds up, and 48 wrongly assumes 15.4 W per device.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. An IP phone connected to Gi1/0/3 does not power up, although the same phone works on Gi1/0/1. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show power inline

Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0       60.0       310.0
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         30.0    Ieee PD             4     30.0
Gi1/0/2   auto   on         30.0    Ieee PD             4     30.0
Gi1/0/3   off    off        0.0     n/a                 n/a   30.0
<output omitted>`,
    },
    options: [
      'The PoE budget is exhausted',
      'Gi1/0/3 is configured with power inline never',
      'The phone requires 802.3bt power',
      'Gi1/0/3 is configured with power inline static',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'An Admin value of **off** is how `show power inline` displays a port configured with `power inline never`. The budget is not the problem — 310.0 W remains, and an exhausted budget would show Oper `power-deny`. The phone works on Gi1/0/1, so its standard is supported, and a static port would show Admin `static`.',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Which two statements about PoE detection and classification are true? (Choose two.)',
    options: [
      'The PSE checks for a signature resistance before applying full power',
      'The PSE applies full voltage as soon as an Ethernet link is detected',
      'Classification tells the PSE how much power to allocate',
      'A PC with a standard NIC can be damaged by a compliant PSE',
      'Classification requires the PD to boot and send CDP messages',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Detection looks for a **~25 kΩ signature** at low voltage, and full power is applied only if it is present — so a standard NIC is never powered or damaged. **Classification** is a hardware exchange that tells the PSE the class to allocate. CDP or LLDP negotiation is optional and happens later, after the PD has booted.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements about Cisco UPOE are true? (Choose two.)',
    options: [
      'It delivers up to 60 W per port',
      'It uses all four pairs of the cable',
      'It is another name for IEEE 802.3at',
      'It is limited to 15.4 W per port',
      'It uses a single pair of the cable',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Cisco **UPOE** delivers **60 W** by powering **all four pairs**; UPOE+ extends this to 90 W. 802.3at (PoE+) is a 30 W two-pair standard, 15.4 W is 802.3af, and no PoE standard uses a single pair of a standard Ethernet cable.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. How many cameras can be added before the switch starts denying power?',
    exhibit: {
      kind: 'table',
      columns: ['Item', 'Value'],
      rows: [
        ['Switch PoE budget', '370 W'],
        ['Already connected', '8 access points, class 4'],
        ['To be added', 'IP cameras, class 3'],
        ['Allocation method', 'Class maximum (no CDP/LLDP negotiation)'],
      ],
    },
    options: ['4', '8', '9', '18'],
    answer: 1,
    difficulty: 3,
    explanation:
      'Eight class 4 APs use 8 × 30 = 240 W, leaving 130 W. Each class 3 camera is allocated 15.4 W: 130 ÷ 15.4 = 8.4, so **8** cameras fit (123.2 W) and a 9th would need 138.6 W. Answering 9 rounds up, 4 wrongly allocates 30 W per camera, and 18 wrongly uses the class 2 value of 7.0 W.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. A user\'s laptop is connected to Gi1/0/7 and its network connection works normally. What explains the output?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show power inline | include Gi1/0/7
Gi1/0/7   auto   off        0.0     n/a                 n/a   30.0`,
    },
    options: [
      'The switch detected no PD signature, so it applied no power',
      'The PoE budget is exhausted',
      'The port is configured with power inline never',
      'The laptop is drawing power but the counter has not updated',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Admin `auto` with Oper `off` and Device `n/a` means detection found **no PD signature** — exactly what should happen with a laptop NIC — so no power is applied while data flows normally. An exhausted budget shows `power-deny`, `power inline never` shows Admin `off`, and a powered port would show Oper `on` with an allocation.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `SW2# show power inline

Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           740.0       52.4       687.6
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   static on         30.0    Ieee PD             4     30.0
Gi1/0/2   auto   on         15.4    Ieee PD             3     30.0
Gi1/0/3   auto   on         7.0     Ieee PD             2     30.0
Gi1/0/4   off    off        0.0     n/a                 n/a   30.0
<output omitted>`,
    },
    options: [
      'The PD on Gi1/0/1 keeps its power even if the rest of the budget is used up',
      'Gi1/0/4 is configured with power inline never',
      'The PD on Gi1/0/2 is a PoE+ class 4 device',
      'The switch has used more than half of its PoE budget',
      'The PD on Gi1/0/3 is being denied power',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Gi1/0/1 is **static**, so its 30 W is reserved and guaranteed. Admin **off** on Gi1/0/4 means `power inline never`. Gi1/0/2 is class 3 (15.4 W), not class 4. Only 52.4 W of 740.0 W is used. Gi1/0/3 shows Oper `on` with 7.0 W allocated, so it is powered, not denied.',
  },
  {
    id: 'e17',
    type: 'match',
    stem: 'Match each value seen in show power inline output with its meaning.',
    pairs: [
      { left: 'Admin static', right: 'Power reserved for the port in advance' },
      { left: 'Admin off', right: 'Port configured with power inline never' },
      { left: 'Oper on', right: 'PD detected and receiving power' },
      { left: 'Oper power-deny', right: 'PD detected but not enough budget remains' },
    ],
    difficulty: 2,
    explanation:
      '**Admin** shows the configured mode (auto, static, or off for `never`); **Oper** shows the current state — `on` when powered, `power-deny` when the budget cannot cover the PD, and `off` when nothing is powered.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'A new pan-tilt-zoom camera needs 22 W at the device. What is the minimum PoE standard the switch port must support?',
    options: ['802.3af', '802.3at (PoE+)', '802.3bt Type 3', '802.3bt Type 4'],
    answer: 1,
    difficulty: 2,
    explanation:
      '**802.3at** guarantees 25.5 W at the PD (30 W at the PSE), which covers 22 W. 802.3af guarantees only 12.95 W at the PD. Both 802.3bt types would work, but the question asks for the **minimum** standard.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'An engineer must ensure that a PD on Gi1/0/10 can never be given more than 15.4 W, without reserving any power while no device is connected. Which command meets the requirement?',
    options: [
      'power inline auto max 15400',
      'power inline static max 15400',
      'power inline auto max 15.4',
      'power inline never',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`power inline auto max 15400` keeps dynamic allocation (nothing reserved while the port is empty) and caps the port at **15400 mW**. The `static` version also caps the power but reserves it in advance, which violates the requirement. The `max` value is in milliwatts, so `15.4` is not a valid value, and `never` removes PoE entirely.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Classify each PoE standard by the number of cable pairs it uses to deliver its maximum power.',
    categories: ['2-pair PoE', '4-pair PoE'],
    items: [
      { text: '802.3af (15.4 W)', category: 0 },
      { text: '802.3at PoE+ (30 W)', category: 0 },
      { text: 'Cisco UPOE (60 W)', category: 1 },
      { text: 'Cisco UPOE+ (90 W)', category: 1 },
      { text: '802.3bt Type 4 (90 W)', category: 1 },
    ],
    difficulty: 2,
    explanation:
      '802.3af and 802.3at power **two** pairs, which limits them to 30 W. Anything at 60 W or 90 W — Cisco UPOE, UPOE+ and 802.3bt — spreads the current over **all four** pairs.',
  },
];
