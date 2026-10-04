import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'input',
    stem: 'Which IEEE standard defines 1000BASE-T Gigabit Ethernet over twisted-pair copper? (Answer in the form 802.3xx.)',
    answers: ['802.3ab', 'ieee 802.3ab'],
    placeholder: '802.3xx',
    difficulty: 1,
    explanation:
      '1000BASE-T is **802.3ab**. 802.3z covers Gigabit Ethernet over fiber (1000BASE-SX/LX), 802.3u is Fast Ethernet, 802.3ae is 10 Gigabit Ethernet over fiber and 802.3an is 10GBASE-T.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Refer to the exhibit. Auto-MDIX is disabled on every device. Which two links require a crossover cable? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pc1', icon: 'pc', label: 'PC1', x: 1, y: 1.2 },
          { id: 'ap1', icon: 'ap', label: 'AP1', x: 1, y: 3.8 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 3.6, y: 2.5 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.4, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 9, y: 1.2 },
          { id: 'r2', icon: 'router', label: 'R2', x: 9, y: 3.8 },
        ],
        links: [
          { from: 'pc1', to: 'sw1', label: 'Link A' },
          { from: 'ap1', to: 'sw1', label: 'Link B' },
          { from: 'sw1', to: 'sw2', label: 'Link C' },
          { from: 'sw2', to: 'r1', label: 'Link D' },
          { from: 'r1', to: 'r2', label: 'Link E' },
        ],
      },
    },
    options: ['Link A', 'Link B', 'Link C', 'Link D', 'Link E'],
    answers: [2, 4],
    difficulty: 2,
    explanation:
      '**Link C** (switch to switch) and **Link E** (router to router) join like devices that transmit on the same pins, so they need crossover cables. Links A, B and D connect a PC, an AP and a router to switches: MDI to MDI-X, which is a straight-through connection.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. The two buildings are 2 km apart, and the new link must run at 10 Gbps. Which solution meets the requirement?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'a', icon: 'l3switch', label: 'Building A', sub: 'distribution', x: 1.5, y: 1.5 },
          { id: 'b', icon: 'l3switch', label: 'Building B', sub: 'distribution', x: 8.5, y: 1.5 },
        ],
        links: [{ from: 'a', to: 'b', label: '2 km · 10 Gbps required', style: 'dashed', tone: 'accent' }],
      },
    },
    options: [
      '10GBASE-SR optics over the existing OM4 multimode fiber',
      '10GBASE-LR optics over single-mode fiber',
      '10GBASE-T over Cat6a UTP',
      '1000BASE-LX optics over single-mode fiber',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      '**10GBASE-LR** runs at 10 Gbps over single-mode fiber for up to 10 km, so 2 km is well within range. 10GBASE-SR reaches only about 400 m even on OM4, 10GBASE-T is limited to 100 m, and 1000BASE-LX reaches the distance but only at 1 Gbps.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each standard to its maximum distance.',
    pairs: [
      { left: '10GBASE-T on Cat6a', right: '100 m' },
      { left: '10GBASE-SR on OM4 multimode', right: 'About 400 m' },
      { left: '1000BASE-SX', right: 'About 550 m' },
      { left: '1000BASE-LX on single-mode', right: '5 km' },
      { left: '10GBASE-LR', right: '10 km' },
    ],
    difficulty: 2,
    explanation:
      'All twisted-pair standards stop at 100 m. Short-wavelength multimode optics reach hundreds of meters (about 400 m for 10GBASE-SR on OM4 and 550 m for 1000BASE-SX), while long-wavelength single-mode optics reach kilometers: 5 km for 1000BASE-LX and 10 km for 10GBASE-LR.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Which two characteristics apply to multimode fiber? (Choose two.)',
    options: [
      'A larger core diameter than single-mode fiber',
      'LED or VCSEL light sources',
      'Longer maximum distances than single-mode fiber',
      'A core diameter of about 9 µm',
      'Required for 10GBASE-LR',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Multimode fiber has a **large core** (50 or 62.5 µm) and uses inexpensive **LED or VCSEL** sources. Single-mode fiber, with its 9 µm core and lasers, is the one that reaches longer distances, and 10GBASE-LR is a single-mode standard.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Drag each characteristic to the fiber type it describes.',
    categories: ['Single-mode fiber', 'Multimode fiber'],
    items: [
      { text: '8–10 µm core', category: 0 },
      { text: 'Laser light source at 1310 or 1550 nm', category: 0 },
      { text: 'Used by 10GBASE-LR', category: 0 },
      { text: 'Links of 10 km or more', category: 0 },
      { text: '50 or 62.5 µm core', category: 1 },
      { text: 'LED or VCSEL light source at 850 nm', category: 1 },
      { text: 'Used by 10GBASE-SR', category: 1 },
      { text: 'A few hundred meters at 10 Gbps', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Single-mode fiber has a tiny core, uses lasers at long wavelengths, carries LR (and ER) standards and reaches kilometers. Multimode fiber has a large core, uses cheaper 850 nm LED or VCSEL sources, carries SX and SR standards and reaches hundreds of meters.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Te1/1/2 connects over a 6 km single-mode fiber run to a switch in Building B that uses a 10GBASE-LR optic. The patch cords have been tested and are good. Why does the link stay down?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces status | include Te1/1
Te1/1/1      Dist-1             connected    trunk        full    10G SFP-10GBase-SR
Te1/1/2      Bldg-B             notconnect   1            full    10G SFP-10GBase-SR`,
    },
    options: [
      'The local 10GBASE-SR optic is for short multimode runs and does not match the far-end LR optic',
      'The port needs `duplex full` configured on both switches before the 10G link can come up',
      'A crossover fiber patch cord is required when two switches connect over single-mode fiber',
      'Te1/1/2 is administratively shut down and must be re-enabled with `no shutdown`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The Type column shows an **SFP-10GBase-SR** optic in Te1/1/2. SR is an 850 nm multimode optic good for a few hundred meters; it cannot interoperate with a 1310 nm LR optic over 6 km of single-mode fiber. Install a 10GBASE-LR optic. Fiber ports already run full duplex, the patch cords were verified, and an administratively shut port would show disabled rather than notconnect.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Which fiber connector is normally used with SFP and SFP+ transceivers?',
    options: ['LC', 'SC', 'ST', 'RJ-45'],
    answer: 0,
    difficulty: 1,
    explanation:
      'SFP and SFP+ optics use the small-form-factor duplex **LC** connector. SC is the larger push-pull connector found on older GBICs and patch panels, ST is a legacy bayonet connector, and RJ-45 is for copper.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'On which pins does a PC NIC transmit when using 100BASE-TX?',
    options: ['1 and 2', '3 and 6', '4 and 5', '7 and 8'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A PC NIC is an MDI device: it transmits on **pins 1 and 2** and receives on 3 and 6. Switches do the opposite, and pins 4, 5, 7 and 8 are unused at 10 and 100 Mbps.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. A technician connects PC1 directly to R1 with a straight-through cable. Neither device supports Auto-MDIX. What is the result?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10/24', x: 1.5, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 10.1.1.1/24', x: 8.5, y: 1.5 },
        ],
        links: [{ from: 'pc', to: 'r1', label: 'straight-through cable', tone: 'bad' }],
      },
    },
    options: [
      'The link works because a PC and a router are different kinds of device',
      'The link stays down because both devices are MDI and transmit on pins 1 and 2',
      'The link comes up at 10 Mbps half duplex after the devices fall back',
      'The link comes up, but data can flow in one direction from R1 to PC1',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'PCs and routers are both **MDI** devices that transmit on pins 1 and 2, so a straight-through cable joins transmitter to transmitter and no link forms. They count as like devices for cabling, even though they do different jobs, and need a **crossover** cable. Without a link there is no fallback speed and no one-way traffic.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements about hubs are true? (Choose two.)',
    options: [
      'All ports belong to one collision domain',
      'Connected devices must use half duplex',
      'Each port is a separate collision domain',
      'Hubs forward frames based on the destination MAC address',
      'Hubs separate broadcast domains',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A hub is a Layer 1 repeater, so every port shares **one collision domain** and devices must run **half duplex** with CSMA/CD. Per-port collision domains and MAC-based forwarding describe switches, and only routers (or VLANs) separate broadcast domains.',
  },
  {
    id: 'e12',
    type: 'order',
    stem: 'Put the CSMA/CD process in order, starting when a station has a frame to send.',
    items: [
      'Listen to check whether the medium is busy',
      'Transmit the frame when the medium is idle',
      'Detect a collision while transmitting',
      'Send a jam signal',
      'Wait a random backoff time, then try again',
    ],
    difficulty: 2,
    explanation:
      'Carrier sense comes first, then transmission while listening. When a collision is detected, the station sends a jam signal so all stations discard the frame, then waits a random (binary exponential) backoff before retrying, giving up after 16 attempts.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. All devices are in VLAN 1. How many collision domains are shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'a', icon: 'pc', label: 'PC-A', x: 1, y: 1 },
          { id: 'b', icon: 'pc', label: 'PC-B', x: 1, y: 4 },
          { id: 'hub', icon: 'hub', label: 'Hub1', x: 2.8, y: 2.5 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5.2, y: 2.5 },
          { id: 'c', icon: 'pc', label: 'PC-C', x: 5.2, y: 0.8 },
          { id: 'd', icon: 'pc', label: 'PC-D', x: 5.2, y: 4.2 },
          { id: 'e', icon: 'pc', label: 'PC-E', x: 7.6, y: 0.8 },
          { id: 'r1', icon: 'router', label: 'R1', x: 7.6, y: 2.5 },
        ],
        links: [
          { from: 'a', to: 'hub' },
          { from: 'b', to: 'hub' },
          { from: 'hub', to: 'sw' },
          { from: 'c', to: 'sw' },
          { from: 'd', to: 'sw' },
          { from: 'e', to: 'sw' },
          { from: 'sw', to: 'r1' },
        ],
      },
    },
    options: ['1', '3', '5', '7'],
    answer: 2,
    difficulty: 3,
    explanation:
      'The hub, PC-A, PC-B and the SW1 port facing the hub form **one** collision domain. Each of SW1\'s other four ports (PC-C, PC-D, PC-E and R1) is its own collision domain, giving 1 + 4 = **5**. Seven would count every cable, wrongly splitting the hub segment; one is the number of broadcast domains, since there is a single VLAN.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Which statement describes a switched point-to-point Ethernet link running full duplex?',
    options: [
      'Collisions cannot occur, so CSMA/CD is not used',
      'The link shares one collision domain with the other switch ports',
      'Only one device can transmit at a time',
      'The link uses CSMA/CA to avoid collisions',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'With only two devices and separate transmit and receive paths, a full-duplex link **cannot have collisions**, so CSMA/CD is disabled. Each switch port is its own collision domain, both ends transmit simultaneously, and CSMA/CA is the 802.11 wireless method.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'What is the default baud rate for a Cisco console connection?',
    answers: ['9600', '9600 baud', '9600 bps'],
    placeholder: 'baud',
    difficulty: 1,
    explanation: 'The console defaults to **9600 baud**, 8 data bits, no parity and 1 stop bit, with no flow control.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Which cable connects the DB-9 serial port of a PC to the RJ-45 console port of a Cisco router?',
    options: ['Rollover', 'Crossover', 'Straight-through', 'V.35 DTE'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The console cable is a **rollover** cable, RJ-45 to DB-9 with pins reversed end to end. Crossover and straight-through cables are Ethernet cables, and V.35 is a serial WAN connector.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. A 10 Gbps link must run 80 m through a workshop full of welding equipment and heavy motors. Which two options meet the requirement? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'a', icon: 'switch', label: 'SW-A', sub: 'office', x: 1.5, y: 1.5 },
          { id: 'b', icon: 'switch', label: 'SW-B', sub: 'production line', x: 8.5, y: 1.5 },
        ],
        links: [{ from: 'a', to: 'b', label: '80 m through welding shop', tone: 'warn' }],
      },
    },
    options: [
      '10GBASE-SR over multimode fiber',
      '10GBASE-LR over single-mode fiber',
      '10GBASE-T over Cat6a UTP copper',
      '10GBASE-T over Cat6 UTP copper',
      '1000BASE-T over Cat5e UTP copper',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Fiber is immune to the EMI generated by welders and motors, and both **10GBASE-SR** on multimode and **10GBASE-LR** on single-mode easily cover 80 m at 10 Gbps. Cat6a would reach the distance but copper is exposed to the interference; Cat6 supports 10GBASE-T only to 55 m; and 1000BASE-T is too slow.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Why must all four pairs of a UTP cable be terminated correctly for 1000BASE-T?',
    options: [
      'It transmits and receives on all four pairs at the same time',
      'It uses two pairs for data and two pairs for power',
      'It uses the spare pairs only for error correction',
      'It sends data on two pairs and uses the other two for collision detection',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '1000BASE-T sends and receives on **all four pairs simultaneously**, using echo cancellation to separate the two directions, so a fault on any pair breaks gigabit operation. Power over Ethernet is a separate feature, and there is no dedicated error-correction or collision-detection pair.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer connected SW1 Gi1/0/5 to SW2 with a straight-through cable, and the link came up normally. Which feature explains this?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces gigabitethernet1/0/5 status

Port         Name               Status       Vlan       Duplex  Speed Type
Gi1/0/5      To-SW2             connected    trunk      a-full a-1000 10/100/1000BaseTX`,
    },
    options: [
      'Auto-MDIX detected the cable and swapped the transmit and receive pairs',
      'Duplex autonegotiation corrected the transmit and receive pin mapping',
      'CSMA/CD resolved the collisions that the crossed pairs created',
      'Spanning Tree Protocol unblocked the port and brought the link up',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Two switches normally need a crossover cable. **Auto-MDIX**, enabled by default on modern Cisco switches while speed and duplex are on auto (as the a-full and a-1000 show), swaps the pairs internally so a straight-through cable works. Duplex negotiation cannot fix a wiring mismatch, CSMA/CD is not used on full-duplex links, and STP acts only after a link is already up.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Drag each Ethernet standard to the medium it uses.',
    categories: ['Copper UTP', 'Multimode fiber', 'Single-mode fiber'],
    items: [
      { text: '10BASE-T', category: 0 },
      { text: '1000BASE-T', category: 0 },
      { text: '10GBASE-T', category: 0 },
      { text: '1000BASE-SX', category: 1 },
      { text: '10GBASE-SR', category: 1 },
      { text: '10GBASE-LR', category: 2 },
      { text: '10GBASE-ER', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'T means twisted pair. S (short wavelength, 850 nm) standards use multimode fiber. LR (1310 nm, 10 km) and ER (1550 nm, 40 km) use single-mode fiber.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 are connected back to back with a serial cable. Which router provides the clock signal for the link?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: 'S0/1/0 · DTE cable end', x: 1.5, y: 1.5 },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'S0/1/0 · DCE cable end', x: 8.5, y: 1.5 },
        ],
        links: [{ from: 'r1', to: 'r2', label: 'back-to-back serial cable', style: 'serial' }],
      },
    },
    options: [
      'R1, because the DTE end of the cable is attached to it',
      'R2, because the DCE end of the cable is attached to it',
      'Both routers, each clocking its own transmit direction',
      'Neither; serial links do not use clocking',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The **DCE** supplies clocking. With the DCE end of the cable attached to R2, R2 provides the clock, set with `clock rate` on its serial interface. The DTE side (R1) receives the clock, both routers do not clock independently, and synchronous serial links always need a clock source.',
  },
];
