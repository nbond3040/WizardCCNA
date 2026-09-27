import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Cabling & Physical Interfaces',
    subtitle: 'Copper, fiber, connectors and the cable that belongs on every link',
    notes:
      "Before any protocol can work, bits have to cross a physical medium, and recognizing and choosing that medium is part of the CCNA blueprint. Topic 1.3 in v1.1 asks you to compare physical interface and cabling types, including single-mode fiber, multimode fiber and copper, and Ethernet shared media versus point-to-point connections; v2.0 keeps this material in domain 1. Exam questions here are very concrete. Which cable connects two switches? Which standard reaches 10 km? Which pins does a PC transmit on? How many collision domains does this topology contain? What are the console settings? In this deck you will build the Ethernet standards table (IEEE name, speed, medium and maximum distance), learn the UTP categories and the 100 m rule, read RJ-45 pinouts and work out straight-through versus crossover cabling and Auto-MDIX, compare single-mode and multimode fiber with their connectors and transceivers, contrast shared hub-based Ethernet with switched point-to-point links, and finish with console and serial cables. Several of these facts are simply numbers to memorize, so expect to revisit the flashcards.",
  },
  {
    kind: 'bullets',
    title: 'Copper, fiber and console: the big picture',
    bullets: [
      '**UTP copper**: desks, phones, APs; cheap, up to 100 m',
      '**Multimode fiber**: uplinks inside a building, hundreds of meters',
      '**Single-mode fiber**: between buildings, kilometers',
      'Fiber is immune to EMI and isolates buildings electrically',
      '**Console** cable: out-of-band access for first setup',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', x: 1, y: 1.2 },
        { id: 'acc', icon: 'switch', label: 'Access SW', x: 3.6, y: 1.2 },
        { id: 'dist', icon: 'l3switch', label: 'Distribution', x: 6.4, y: 1.2, tone: 'accent' },
        { id: 'bldg', icon: 'switch', label: 'Building B', x: 9, y: 1.2 },
        { id: 'lap', icon: 'laptop', label: 'Admin laptop', x: 3.6, y: 3.8 },
        { id: 'r1', icon: 'router', label: 'R1', x: 6.4, y: 3.8 },
      ],
      links: [
        { from: 'pc', to: 'acc', label: 'Cat6 UTP' },
        { from: 'acc', to: 'dist', label: 'MMF 10GBASE-SR' },
        { from: 'dist', to: 'bldg', label: 'SMF 10GBASE-LR', style: 'thick' },
        { from: 'r1', to: 'dist', label: '1000BASE-T' },
        { from: 'lap', to: 'r1', label: 'console', style: 'dashed' },
      ],
    },
    notes:
      "A typical campus uses several kinds of physical media, each chosen for distance, speed, environment and cost. Desktops, phones and access points connect to the access switch with **unshielded twisted-pair (UTP)** copper, which is cheap, easy to terminate, can carry Power over Ethernet, and reaches 100 meters. Uplinks from the access layer to the distribution switches often run over **multimode fiber (MMF)**, which carries 10 Gbps or more for a few hundred meters inside a building. Links between buildings or across a campus use **single-mode fiber (SMF)**, which reaches kilometers. Fiber has two side benefits: it is immune to electromagnetic interference, and it isolates buildings electrically. Finally, every Cisco device has a **console** port for out-of-band management, reached with a rollover or USB cable, which you need for the first configuration or for password recovery. The rest of this lesson takes each medium in turn: which standards run on it, how far it reaches, which connector and transceiver it uses, and which cable goes where. Exam questions often describe exactly this kind of topology and ask which medium belongs on a given link.",
  },
  {
    kind: 'table',
    title: 'Ethernet standards at a glance',
    columns: ['Common name', 'IEEE', 'Speed', 'Media', 'Max distance'],
    rows: [
      ['10BASE-T', '802.3i', '10 Mbps', 'UTP, 2 pairs (Cat3 or better)', '100 m'],
      ['100BASE-TX (100BASE-T)', '802.3u', '100 Mbps', 'UTP, 2 pairs (Cat5 or better)', '100 m'],
      ['1000BASE-T', '802.3ab', '1 Gbps', 'UTP, 4 pairs (Cat5e or better)', '100 m'],
      ['10GBASE-T', '802.3an', '10 Gbps', 'UTP Cat6a (Cat6 only to 55 m)', '100 m'],
      ['1000BASE-SX', '802.3z', '1 Gbps', 'MMF, 850 nm', 'Up to 550 m'],
      ['1000BASE-LX', '802.3z', '1 Gbps', 'SMF, 1310 nm (also MMF to 550 m)', '5 km'],
      ['10GBASE-SR', '802.3ae', '10 Gbps', 'MMF, 850 nm', 'Up to 400 m (OM4)'],
      ['10GBASE-LR', '802.3ae', '10 Gbps', 'SMF, 1310 nm', '10 km'],
    ],
    caption: 'Every twisted-pair standard stops at 100 m; fiber distances depend on the fiber type and grade.',
    notes:
      "This table is the core of the lesson; memorize the pattern rather than every digit. All the **twisted-pair** standards (names ending in T or TX) share the same **100 m** maximum, whatever the speed. What changes is the cable quality required and the number of pairs used: 10BASE-T and 100BASE-TX use two pairs, while 1000BASE-T and 10GBASE-T use all four. Fast Ethernet over UTP is formally 100BASE-TX, although many books and the blueprint simply call it 100BASE-T. The **fiber** standards follow a naming pattern: an S (SX, SR) means a short wavelength of 850 nm on multimode fiber, reaching hundreds of meters; an L (LX, LR) means a long wavelength of 1310 nm, normally on single-mode fiber, reaching kilometers. Exact multimode distances depend on the fiber grade, OM1 to OM4, which is why the table says up to. Also learn the IEEE working-group names that exams like to use as options: **802.3u** is Fast Ethernet, **802.3z** is Gigabit Ethernet over fiber, **802.3ab** is Gigabit Ethernet over copper, **802.3ae** is 10 Gigabit Ethernet over fiber, and **802.3an** is 10GBASE-T.",
  },
  {
    kind: 'definitions',
    title: 'Reading an Ethernet standard name',
    terms: [
      { term: '10, 100, 1000, 10G', def: 'Speed in Mbps; G means Gbps.' },
      { term: 'BASE', def: 'Baseband signaling: the medium carries one Ethernet signal.' },
      { term: 'T / TX', def: 'Twisted-pair copper; TX is the two-pair Fast Ethernet version.' },
      { term: 'SX / SR', def: 'Short wavelength or short reach: 850 nm on multimode fiber.' },
      { term: 'LX / LR', def: 'Long wavelength or long reach: 1310 nm, usually on single-mode fiber.' },
      { term: 'ER', def: 'Extended reach: 1550 nm single-mode, e.g. 10GBASE-ER at 40 km.' },
      { term: 'Fast / Gigabit / 10 Gigabit', def: 'Common names for 100 Mbps, 1 Gbps and 10 Gbps Ethernet.' },
    ],
    notes:
      "Every Ethernet physical-layer name follows the same recipe, so you can decode names you have never seen. The first number is the **speed**: 10, 100 and 1000 are megabits per second, and a G means gigabits, as in 10G. **BASE** stands for baseband: the cable carries a single Ethernet signal rather than many frequency-divided channels. The suffix describes the **medium**. T means twisted pair; TX is the specific two-pair version of Fast Ethernet over Cat5 cable. For fiber, an S means a **short** wavelength, 850 nm, used with multimode fiber; an L means a **long** wavelength, 1310 nm, typically on single-mode fiber; and an E means **extended** reach at 1550 nm, such as 10GBASE-ER at 40 km. In the Gigabit names the second letter is X (SX, LX), marking the 1000BASE-X family; in the 10 Gigabit names it is R (SR, LR, ER), marking the 10GBASE-R family. So 10GBASE-LR reads as 10 gigabits per second, baseband, long reach, which tells you it belongs on single-mode fiber over kilometers. The informal names Fast Ethernet, Gigabit Ethernet and 10 Gigabit Ethernet simply mean 100 Mbps, 1 Gbps and 10 Gbps.",
  },
  {
    kind: 'table',
    title: 'UTP categories and the 100 m rule',
    columns: ['Category', 'Rated bandwidth', 'Typical Ethernet use', 'Max distance'],
    rows: [
      ['Cat5', '100 MHz', '100BASE-TX (older installs)', '100 m'],
      ['**Cat5e**', '100 MHz', '1000BASE-T', '100 m'],
      ['**Cat6**', '250 MHz', '1000BASE-T; 10GBASE-T only to 55 m', '100 m (55 m at 10 Gbps)'],
      ['**Cat6a**', '500 MHz', '10GBASE-T', '100 m'],
    ],
    caption: 'Structured cabling: a 90 m permanent link plus about 10 m of patch cords makes the 100 m channel.',
    notes:
      "UTP cable is sold in **categories** defined by TIA/EIA, and each higher category supports higher frequencies with tighter control of crosstalk. **Cat5e** (enhanced Cat5) is rated for 100 MHz and is the usual minimum for 1000BASE-T. **Cat6** is rated for 250 MHz; it runs Gigabit Ethernet comfortably and can carry 10GBASE-T, but only up to about 55 meters. **Cat6a** (augmented) is rated for 500 MHz and supports 10GBASE-T over the full 100 meters, so it is the common choice for new installations that need 10 Gbps at the access layer. Plain Cat5 supports 100BASE-TX and is found only in older buildings. Whatever the category, the **100 m** channel limit applies: structured cabling allows a 90 m permanent link in the wall plus about 10 m of patch cords at the two ends. Beyond that, attenuation and timing cause errors, so for longer distances you add a switch in between or move to fiber. On the exam, when a question describes a copper run longer than 100 meters, the right answer is almost never a better category of cable; it is fiber or another switch.",
  },
  {
    kind: 'table',
    title: 'RJ-45 pinouts: T568A and T568B',
    columns: ['Pin', 'T568A', 'T568B', 'PC NIC at 10/100 Mbps'],
    rows: [
      ['1', 'White/green', 'White/orange', '**Transmit +**'],
      ['2', 'Green', 'Orange', '**Transmit -**'],
      ['3', 'White/orange', 'White/green', '**Receive +**'],
      ['4', 'Blue', 'Blue', 'Unused (used by 1000BASE-T)'],
      ['5', 'White/blue', 'White/blue', 'Unused (used by 1000BASE-T)'],
      ['6', 'Orange', 'Green', '**Receive -**'],
      ['7', 'White/brown', 'White/brown', 'Unused (used by 1000BASE-T)'],
      ['8', 'Brown', 'Brown', 'Unused (used by 1000BASE-T)'],
    ],
    caption: 'T568A and T568B swap only the green and orange pairs.',
    notes:
      "UTP Ethernet uses the **RJ-45** connector, technically an 8P8C connector with eight positions and eight contacts. Two wiring standards define which colored wire lands on which pin: **T568A** and **T568B**. They differ only by swapping the green and orange pairs, so pins 1, 2, 3 and 6 change color while pins 4, 5, 7 and 8 (the blue and brown pairs) stay the same. Either standard works as long as both ends of a straight-through cable use the same one; T568B is the most common choice in commercial installations. For 10BASE-T and 100BASE-TX only two pairs matter: pins **1 and 2** form one pair and pins **3 and 6** form the other. Notice that 3 and 6 are not adjacent; they straddle the blue pair on pins 4 and 5. A PC NIC transmits on 1 and 2 and receives on 3 and 6. The blue and brown pairs are unused at 10 and 100 Mbps, but 1000BASE-T uses all four pairs, so every one of the eight wires must be terminated correctly for gigabit speed. Exam questions ask which pins are used, which colors sit on pins 1 and 2 in T568B, and which pairs a crossover cable swaps.",
  },
  {
    kind: 'diagram',
    title: 'Which pins transmit: MDI vs MDI-X',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'MDI: Tx on 1,2', x: 1.5, y: 1.2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'MDI: Tx on 1,2', x: 1.5, y: 3.8 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'MDI-X: Tx on 3,6', x: 5, y: 2.5, tone: 'accent' },
        { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'MDI-X: Tx on 3,6', x: 8.5, y: 1.2 },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'MDI: Tx on 1,2', x: 8.5, y: 3.8 },
      ],
      links: [
        { from: 'pc', to: 'sw1', label: 'straight-through', tone: 'good' },
        { from: 'r1', to: 'sw1', label: 'straight-through', tone: 'good' },
        { from: 'ap', to: 'sw1', label: 'straight-through', tone: 'good' },
        { from: 'sw1', to: 'sw2', label: 'crossover', tone: 'accent' },
      ],
    },
    caption: 'Unlike devices (MDI to MDI-X) use straight-through; like devices use crossover.',
    notes:
      "The cabling rule comes from one fact: devices do not all transmit on the same pins. Hosts and routers use the **MDI** pinout: they transmit on pins **1 and 2** and receive on **3 and 6**. This group includes PC NICs, servers, routers, printers and access points. Switches and hubs use the **MDI-X** pinout: they transmit on **3 and 6** and receive on **1 and 2**. When an MDI device meets an MDI-X device, a **straight-through** cable naturally connects each transmitter to the other side's receiver, which is why a PC, router or AP connects to a switch with a straight-through cable. When two devices of the same kind meet, such as switch to switch, router to router, PC to PC, or a PC directly to a router, both transmit on the same pins, so the cable must cross the pairs: a **crossover** cable. The memory aid is that like devices use crossover and unlike devices use straight-through, remembering that a router counts as a host for this purpose. In the diagram, every host-type device reaches SW1 with a straight-through cable, while SW1 reaches SW2 with a crossover.",
  },
  {
    kind: 'bullets',
    title: 'Inside the cables: straight-through vs crossover',
    bullets: [
      'Straight-through: same standard both ends; pin 1 to 1, 2 to 2',
      'Crossover: T568A on one end, T568B on the other',
      'Crossover maps **1 to 3** and **2 to 6** (and back)',
      'Each transmit pair lands on the far receive pair',
      'Gigabit crossover also swaps pairs 4,5 and 7,8',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 8,
      nodes: [
        { id: 'a1', label: 'PC-A pin 1', sub: 'Tx+', x: 2, y: 1, tone: 'accent' },
        { id: 'a2', label: 'PC-A pin 2', sub: 'Tx-', x: 2, y: 2.8, tone: 'accent' },
        { id: 'a3', label: 'PC-A pin 3', sub: 'Rx+', x: 2, y: 4.6 },
        { id: 'a6', label: 'PC-A pin 6', sub: 'Rx-', x: 2, y: 6.4 },
        { id: 'b1', label: 'PC-B pin 1', sub: 'Tx+', x: 8, y: 1 },
        { id: 'b2', label: 'PC-B pin 2', sub: 'Tx-', x: 8, y: 2.8 },
        { id: 'b3', label: 'PC-B pin 3', sub: 'Rx+', x: 8, y: 4.6, tone: 'accent' },
        { id: 'b6', label: 'PC-B pin 6', sub: 'Rx-', x: 8, y: 6.4, tone: 'accent' },
      ],
      edges: [
        { from: 'a1', to: 'b3', tone: 'accent' },
        { from: 'a2', to: 'b6', tone: 'accent' },
        { from: 'b1', to: 'a3' },
        { from: 'b2', to: 'a6' },
      ],
    },
    notes:
      "Inside the cable, the difference is simple. A **straight-through** cable uses the same standard at both ends, so pin 1 connects to pin 1, pin 2 to pin 2, and so on. A **crossover** cable is wired T568A at one end and T568B at the other. For 10 and 100 Mbps that connects **pin 1 to pin 3 and pin 2 to pin 6**, and back again, so each device's transmit pair lands on the other device's receive pair, as the diagram shows between two PCs. A full gigabit crossover also swaps the blue and brown pairs (pins 4 and 5 with 7 and 8), because 1000BASE-T uses all four pairs. You can identify a cable by holding both connectors side by side with the clips facing the same way: if the color order is identical, it is straight-through; if the orange and green pairs trade places, it is a crossover. Exam items sometimes show a pinout and ask which cable it represents, or which far-end pin connects to pin 1 in a crossover. The answer to that one is pin 3. Crossover cables are rare in modern networks thanks to Auto-MDIX, but the rule is still tested.",
  },
  {
    kind: 'table',
    title: 'Straight-through or crossover?',
    columns: ['Device A', 'Device B', 'Cable (without Auto-MDIX)'],
    rows: [
      ['PC or server', 'Switch', 'Straight-through'],
      ['Router', 'Switch', 'Straight-through'],
      ['Access point', 'Switch', 'Straight-through'],
      ['Switch', 'Switch', '**Crossover**'],
      ['Hub', 'Switch', '**Crossover**'],
      ['Router', 'Router', '**Crossover**'],
      ['PC', 'PC', '**Crossover**'],
      ['PC', 'Router', '**Crossover**'],
    ],
    caption: 'Like devices need a crossover; with Auto-MDIX either cable works.',
    notes:
      "This reference table turns the MDI rule into answers. **Straight-through** cables connect a host-type device to a switch: PCs, servers, routers, access points and IP phones to switch ports. **Crossover** cables connect devices with the same pinout: switch to switch, hub to switch, router to router, PC to PC, and, a favorite exam trap, a **PC directly to a router's** Ethernet port, because both are MDI devices that transmit on pins 1 and 2. When a question states that Auto-MDIX is disabled or unavailable, or simply asks which cable is required, apply the table. When Auto-MDIX is enabled on at least one end, either cable works, because that port swaps its own pairs. Cisco questions that ask which cable to use are testing the classic rule, so answer from the table unless the stem mentions Auto-MDIX. Also remember that the console connection uses a different cable entirely: the rollover cable is not an Ethernet cable and does not appear in this table. Fiber links have no crossover cable in the same sense, but the two strands must still connect transmit to receive, which standard duplex patch cords handle by design.",
  },
  {
    kind: 'bullets',
    title: 'Gigabit pairs and Auto-MDIX',
    bullets: [
      '10/100: pins 1,2 and 3,6; one pair each way',
      '1000BASE-T: **all four pairs**, each sending and receiving at once',
      '**Auto-MDIX** detects the cable and swaps Tx/Rx pairs itself',
      'On by default on modern Cisco switches: `mdix auto`',
      'Often needs `speed auto` and `duplex auto` to work',
      'Exam cable questions still use the classic rule',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', x: 1.2, y: 1.5 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'mdix auto', x: 5, y: 1.5, tone: 'accent' },
        { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'mdix auto', x: 8.8, y: 1.5 },
      ],
      links: [
        { from: 'pc', to: 'sw1', label: 'either cable works', tone: 'good' },
        { from: 'sw1', to: 'sw2', label: 'either cable works', tone: 'good' },
      ],
    },
    notes:
      "Two refinements complete the copper picture. First, **1000BASE-T uses all four pairs**, and each pair carries data in both directions at the same time, using hybrid circuits and echo cancellation to separate the signal a port sends from the one it receives. That is how gigabit speed fits on cable rated for 100 MHz, and it is why a cable with a damaged brown or blue pair can still work at 100 Mbps but fails at 1 Gbps. Second, **Auto-MDIX** (automatic medium-dependent interface crossover) lets a port detect which pins the neighbor transmits on and swap its own transmit and receive pairs if needed. With Auto-MDIX active, a straight-through cable works between two switches and a crossover cable works between a PC and a switch. Modern Cisco switches enable it by default, the interface command is `mdix auto`, and on many platforms it works only while `speed auto` and `duplex auto` are configured, so hard-coding speed and duplex can quietly disable it. For the exam, treat Auto-MDIX as a convenience that hides cabling mistakes, and still know the underlying straight-through and crossover rules.",
  },
  {
    kind: 'compare',
    title: 'Multimode vs single-mode fiber',
    left: {
      heading: 'Multimode (MMF)',
      bullets: [
        'Large core: **50 or 62.5 µm**',
        'Light source: LED or **VCSEL**, 850 nm',
        'Many light paths (modes) spread the pulse',
        'Shorter reach: hundreds of meters',
        'Cheaper optics; orange or aqua jacket',
        'Inside buildings and data centers',
      ],
    },
    right: {
      heading: 'Single-mode (SMF)',
      tone: 'accent',
      bullets: [
        'Small core: **8–10 µm** (typically 9 µm)',
        'Light source: **laser**, 1310 or 1550 nm',
        'One light path: pulses stay sharp',
        'Long reach: kilometers to tens of km',
        'More expensive optics; yellow jacket',
        'Between buildings, campus and provider links',
      ],
    },
    notes:
      "Fiber carries light instead of electricity, and the two families differ mainly in the size of the glass **core**. **Multimode fiber** has a large core, 50 or 62.5 micrometers, wide enough for light to travel along many paths, or modes, at different angles. Those paths have slightly different lengths, so a pulse spreads out as it travels (modal dispersion), which limits multimode links to hundreds of meters at high speeds. The large core accepts light from inexpensive sources, LEDs for older 100 Mbps links and **VCSELs** (vertical-cavity surface-emitting lasers) at 850 nm for Gigabit and 10 Gigabit Ethernet, so multimode optics are cheap. **Single-mode fiber** has a tiny core of about 9 micrometers, so light follows essentially one path, pulses stay sharp, and links reach 10, 40 or more kilometers. It needs precise **lasers** at 1310 or 1550 nm, which makes single-mode optics more expensive, although the cable itself costs about the same. The rule of thumb for the exam: single-mode means small core, laser, long distance and higher optic cost; multimode means large core, LED or VCSEL, short distance and lower cost.",
  },
  {
    kind: 'diagram',
    title: 'Inside the fiber: the core makes the difference',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Multimode',
          layers: [
            { label: 'Jacket', sub: 'orange (OM1/OM2) or aqua (OM3/OM4)', tone: 'muted' },
            { label: 'Coating / buffer', tone: 'muted' },
            { label: 'Cladding', sub: '125 µm' },
            { label: 'Core', sub: '50 or 62.5 µm: many modes', tone: 'accent' },
          ],
        },
        {
          title: 'Single-mode',
          layers: [
            { label: 'Jacket', sub: 'usually yellow', tone: 'muted' },
            { label: 'Coating / buffer', tone: 'muted' },
            { label: 'Cladding', sub: '125 µm' },
            { label: 'Core', sub: '8–10 µm: one mode', tone: 'accent' },
          ],
        },
      ],
    },
    caption: 'Both types have 125 µm cladding; only the core diameter differs.',
    notes:
      "Look inside either fiber type and you find the same structure. The **core** carries the light. Around it is the **cladding**, glass with a slightly lower refractive index, which keeps the light inside the core by total internal reflection. Both multimode and single-mode fibers have a cladding diameter of **125 micrometers**, so the strands look identical from the outside; only the core differs, 50 or 62.5 micrometers for multimode and 8 to 10 micrometers for single-mode. A protective **coating** or buffer and an outer **jacket** surround the glass. Jacket colors are a helpful clue in the field: yellow usually means single-mode, orange means older OM1 or OM2 multimode, and aqua means laser-optimized OM3 or OM4 multimode. Because light travels in only one direction on a strand, a normal duplex fiber link uses **two strands**, one to transmit and one to receive, which is why LC and SC patch cords come in pairs. Fiber's advantages over copper follow from its construction: it cannot pick up electromagnetic interference, it carries no electrical current between buildings, and it is much harder to tap without being noticed.",
  },
  {
    kind: 'table',
    title: 'Fiber connectors and transceivers',
    columns: ['Item', 'What it is', 'Where you see it'],
    rows: [
      ['**LC**', 'Small push-latch connector, usually a duplex pair', 'SFP and SFP+ optics, modern patch panels'],
      ['**SC**', 'Larger square push-pull connector', 'Older GBICs, patch panels, some provider handoffs'],
      ['**ST**', 'Round bayonet (twist-lock) connector', 'Legacy multimode installations'],
      ['**SFP**', 'Hot-pluggable 1 Gbps transceiver', 'Switch and router uplink ports'],
      ['**SFP+**', 'Same size as SFP, 10 Gbps', '10 Gbps uplinks; many also accept 1G SFPs'],
      ['**QSFP+ / QSFP28**', 'Four-lane module, 40 / 100 Gbps', 'Data center spine and core links'],
    ],
    caption: 'The optic must match the fiber and the optic at the far end: SR with SR on MMF, LR with LR on SMF.',
    notes:
      "Fiber cables end in connectors, and switches accept them through pluggable transceivers. The **LC** connector is today's small-form-factor standard: a small square ferrule with a push-latch, usually clipped together as a duplex pair, and it is what you plug into SFP and SFP+ modules. The **SC** connector is larger, square and push-pull; you still see it on patch panels, older GBIC transceivers and some service provider handoffs. The round, bayonet-style **ST** connector belongs to older multimode installations. Instead of building optics into the switch, Cisco uses hot-pluggable **transceivers**: the **SFP** (small form-factor pluggable) for 1 Gbps and the physically identical **SFP+** for 10 Gbps, with QSFP modules for 40 and 100 Gbps in data centers. Copper SFPs with an RJ-45 port also exist. The key operational rule is that the optic defines the standard: an SR module expects multimode fiber and must talk to another SR module, while an LR module expects single-mode fiber and another LR module at the far end. Mixing them, or using the wrong fiber type, leaves the link down or full of errors.",
  },
  {
    kind: 'cli',
    title: 'Verifying media types and optics',
    code: `SW1# show interfaces status

Port         Name               Status       Vlan       Duplex  Speed Type
Gi1/0/1      PC1                connected    10         a-full a-1000 10/100/1000BaseTX
Gi1/0/2      AP-2               connected    trunk      a-full a-1000 10/100/1000BaseTX
Te1/1/1      Dist-1             connected    trunk        full    10G SFP-10GBase-SR
Te1/1/2      Bldg-B             connected    trunk        full    10G SFP-10GBase-LR
Te1/1/3      Old-Bldg           connected    trunk        full   1000 1000BaseLX SFP

SW1# show interfaces te1/1/2 transceiver
If device is externally calibrated, only calibrated values are printed.
++ : high alarm, +  : high warning, -  : low warning, -- : low alarm.
NA or N/A: not applicable, Tx: transmit, Rx: receive.
mA: milliamperes, dBm: decibels (milliwatts).

                                           Optical   Optical
            Temperature  Voltage  Current  Tx Power  Rx Power
Port        (Celsius)    (Volts)  (mA)     (dBm)     (dBm)
---------   -----------  -------  -------- --------  --------
Te1/1/2       31.2       3.29      33.8      -2.1      -6.9`,
    highlight: ['10/100/1000BaseTX', 'SFP-10GBase-SR', 'SFP-10GBase-LR', '1000BaseLX SFP', 'Rx Power'],
    caption: 'The Type column names the medium; transceiver diagnostics show optical power.',
    notes:
      "You can confirm media types from the CLI of this Catalyst 9200-style switch. In `show interfaces status`, the **Type** column reveals what each port uses: 10/100/1000BaseTX for copper ports, SFP-10GBase-SR and SFP-10GBase-LR for 10 Gigabit short-reach and long-reach optics, and 1000BaseLX SFP for a gigabit optic sitting in a 10 Gigabit SFP+ slot, which many such slots accept. The copper ports show a-full and a-1000 because they autonegotiated; the fiber ports show full and a fixed speed, because optical Ethernet always runs full duplex at the rate of the optic. For modules that support digital optical monitoring, `show interfaces transceiver` displays temperature, supply voltage, laser bias current and the **transmit and receive optical power** in dBm. Receive power that is far below the far end's transmit power indicates loss along the path: a dirty or damaged connector, a tight bend, a bad splice, or a run too long for the optic. The legend at the top explains the markers IOS adds when a value crosses a warning or alarm threshold, and `show inventory` lists the installed transceivers with their product IDs and serial numbers.",
  },
  {
    kind: 'steps',
    title: 'Shared media: hubs and CSMA/CD',
    steps: [
      { title: 'Carrier sense', text: 'Listen: is another station transmitting? If so, wait.' },
      { title: 'Transmit', text: 'Send when the medium is idle, and keep listening.' },
      { title: 'Collision detect', text: 'Two stations sending at once means a collision.' },
      { title: 'Jam signal', text: 'Send a jam so every station discards the damaged frame.' },
      { title: 'Back off and retry', text: 'Wait a random time that grows after each collision; drop after 16 attempts.' },
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hub', icon: 'hub', label: 'Hub', sub: 'repeats bits out all ports', x: 5, y: 2.5, tone: 'warn' },
        { id: 'a', icon: 'pc', label: 'PC-A', x: 2, y: 1.2 },
        { id: 'b', icon: 'pc', label: 'PC-B', x: 8, y: 1.2 },
        { id: 'c', icon: 'pc', label: 'PC-C', x: 2, y: 3.8 },
        { id: 'd', icon: 'pc', label: 'PC-D', x: 8, y: 3.8 },
      ],
      links: [
        { from: 'a', to: 'hub' },
        { from: 'b', to: 'hub' },
        { from: 'c', to: 'hub' },
        { from: 'd', to: 'hub' },
      ],
      groups: [{ label: 'One collision domain · half duplex', x: 0.8, y: 0.3, w: 8.4, h: 4.4, tone: 'warn' }],
    },
    notes:
      "Original Ethernet was **shared media**: every station attached to one coaxial cable, or later to a **hub**, and whatever one station sent, all the others received. A hub is only a Layer 1 repeater. It regenerates the bits arriving on one port and sends them out every other port, without looking at MAC addresses. Everything connected to a hub therefore forms **one collision domain** that shares the bandwidth: ten PCs on a 100 Mbps hub share 100 Mbps between them. Because only one device can transmit at a time, devices must use **half duplex** and follow **CSMA/CD**, carrier sense multiple access with collision detection. They listen first, transmit only when the medium is idle, and keep listening while they send. If two stations start at nearly the same moment, both detect the collision, send a jam signal so that everyone discards the damaged frame, and then wait a random backoff time before trying again. The backoff range doubles after each collision (binary exponential backoff), and a frame is dropped after 16 failed attempts. Collisions are normal on a hub, but they grow with the number of stations, which is why hubs have disappeared from modern networks.",
  },
  {
    kind: 'bullets',
    title: 'Point-to-point: switched, full duplex',
    bullets: [
      'Each switch port is a dedicated link to one device',
      'Each port is its **own collision domain**',
      '**Full duplex**: send and receive at the same time',
      'No collisions, so CSMA/CD is not used',
      'Full port bandwidth per device, in each direction',
      'Still one broadcast domain per VLAN',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.5, tone: 'accent' },
        { id: 'a', icon: 'pc', label: 'PC-A', x: 2, y: 1.2 },
        { id: 'b', icon: 'pc', label: 'PC-B', x: 8, y: 1.2 },
        { id: 'c', icon: 'pc', label: 'PC-C', x: 2, y: 3.8 },
        { id: 'd', icon: 'pc', label: 'PC-D', x: 8, y: 3.8 },
      ],
      links: [
        { from: 'a', to: 'sw', label: 'full duplex', tone: 'good' },
        { from: 'b', to: 'sw', label: 'full duplex', tone: 'good' },
        { from: 'c', to: 'sw', label: 'full duplex', tone: 'good' },
        { from: 'd', to: 'sw', label: 'full duplex', tone: 'good' },
      ],
      annotations: [{ x: 5, y: 4.5, text: '4 collision domains, 1 broadcast domain' }],
    },
    notes:
      "A switch changes the picture completely. Each switch port connects to exactly one device over a dedicated **point-to-point** link, so every port is its own **collision domain**. With only two devices on a link and separate paths for each direction, both ends can transmit at the same time: **full duplex**. Collisions become impossible, so CSMA/CD is simply turned off, and each device gets the full bandwidth of its port in each direction, 1 Gbps up and 1 Gbps down on a gigabit port. The switch still floods broadcasts to every port in the VLAN, so all four PCs here remain in **one broadcast domain**; only a router, or separate VLANs, split broadcast domains. Fiber links and serial WAN links are point-to-point as well. Shared media has not vanished entirely: a hub, if you ever meet one, still forms a single collision domain, and **Wi-Fi** is shared media too, but radios cannot detect collisions while transmitting, so 802.11 uses CSMA/CA (collision avoidance) instead. In exam topologies, count collision domains by counting the switch and router ports in use, with everything behind a hub counting as one.",
  },
  {
    kind: 'bullets',
    title: 'Console cables: rollover and USB',
    bullets: [
      '**Rollover**: RJ-45 to DB-9, pins reversed (1 to 8, 2 to 7...)',
      'Usually paired with a USB-to-serial adapter',
      '**USB console**: mini-B or USB-C port plus a driver',
      'Settings: **9600** baud, 8 data bits, no parity, 1 stop bit',
      'No flow control; PuTTY or Tera Term as the terminal',
      'Out-of-band: needs no IP configuration at all',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'lap', icon: 'laptop', label: 'Admin laptop', sub: '9600 8-N-1', x: 1.5, y: 2.5, tone: 'accent' },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'RJ-45 CON port', x: 8.5, y: 1.2 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'USB console port', x: 8.5, y: 3.8 },
      ],
      links: [
        { from: 'lap', to: 'r1', label: 'rollover (RJ-45 to DB-9)', style: 'dashed' },
        { from: 'lap', to: 'sw1', label: 'USB cable', style: 'dashed' },
      ],
    },
    notes:
      "Every Cisco router and switch has a **console** port for out-of-band CLI access. It works with no IP configuration at all, so it is how you perform the first setup, recover a lost password, or fix a device that has dropped off the network. The classic cable is the light-blue **rollover** cable. It has an RJ-45 connector for the device's CON port and a DB-9 serial connector for the PC, and its pins are reversed end to end, 1 to 8, 2 to 7, 3 to 6 and 4 to 5, which is where the name comes from. Because modern laptops lack serial ports, you usually add a USB-to-serial adapter, which appears as a COM port. Newer devices also offer a **USB console** port (mini-B or USB-C) that connects with an ordinary USB cable after installing the Cisco USB console driver on Windows; on many platforms the USB console takes priority while it is connected. In the terminal emulator, such as PuTTY or Tera Term, use the defaults: ==9600 baud, 8 data bits, no parity, 1 stop bit, no flow control==. Exam questions ask for the cable type and for exactly these settings.",
  },
  {
    kind: 'bullets',
    title: 'Serial WAN cables (awareness)',
    bullets: [
      'Leased line: router serial interface = **DTE**',
      'CSU/DSU or modem = **DCE**, which supplies the clock',
      'Back-to-back lab cable: DCE end needs `clock rate`',
      'Router side: Smart Serial or DB-60; CSU/DSU side: often V.35',
      'Layer 2: HDLC (Cisco default) or PPP',
      'Largely replaced by Ethernet WAN over fiber',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DTE', x: 0.8, y: 1.5 },
        { id: 'c1', icon: 'modem', label: 'CSU/DSU', sub: 'DCE: clock', x: 2.9, y: 1.5 },
        { id: 'wan', icon: 'cloud', label: 'Leased line', x: 5, y: 1.5 },
        { id: 'c2', icon: 'modem', label: 'CSU/DSU', sub: 'DCE: clock', x: 7.1, y: 1.5 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'DTE', x: 9.2, y: 1.5 },
      ],
      links: [
        { from: 'r1', to: 'c1', style: 'serial' },
        { from: 'c1', to: 'wan' },
        { from: 'wan', to: 'c2' },
        { from: 'c2', to: 'r2', style: 'serial' },
      ],
    },
    notes:
      "Serial WAN links are an awareness-level topic today, but you should recognize the vocabulary. On a traditional leased line, the router's serial interface is the **DTE** (data terminal equipment). It connects to a **CSU/DSU** or modem, the **DCE** (data circuit-terminating equipment), which in turn connects to the provider's line. The DCE supplies the **clock** that sets the line speed. In a lab, two routers are often connected back to back with a DTE cable and a DCE cable joined together; the router attached to the DCE end must provide clocking, configured with `clock rate` on that interface, and `show controllers serial` reveals which cable end is attached. Router-side connectors include the older DB-60 and the compact **Smart Serial** connector, while the CSU/DSU side commonly uses **V.35**. The Layer 2 protocol on the link is **HDLC**, the Cisco default, or **PPP**, and an encapsulation mismatch between the two ends shows up as an up/down interface. Most organizations have replaced serial circuits with Ethernet WAN services delivered over fiber, but these terms still appear in exam questions.",
  },
  {
    kind: 'table',
    title: 'Choosing the right medium',
    columns: ['Scenario', 'Best choice', 'Why'],
    rows: [
      ['Desk to access switch, 40 m', 'Cat5e or Cat6 UTP, 1000BASE-T', 'Cheap, within 100 m, carries PoE'],
      ['10 Gbps uplink in the same closet, 15 m', 'Cat6a (10GBASE-T) or MMF (10GBASE-SR)', 'Short run: copper or multimode both work'],
      ['Between floors, 250 m', 'MMF with 10GBASE-SR (OM3/OM4)', 'Beyond 100 m copper; SR reaches 300–400 m'],
      ['Between buildings, 3 km', 'SMF with 10GBASE-LR', 'Multimode cannot reach; LR covers 10 km'],
      ['Factory floor beside heavy motors', 'Fiber', 'Immune to EMI'],
      ['First-time router setup', 'Rollover or USB console cable', 'Out-of-band, no IP needed'],
    ],
    caption: 'Decide by distance first, then speed, environment and cost.',
    notes:
      "Real design questions combine everything: distance, speed, environment and cost, in roughly that order. **Distance** first: within 100 m, copper is usually the cheapest answer; up to a few hundred meters, multimode fiber with short-reach optics; beyond that, single-mode fiber with long-reach optics. **Speed** next: 1 Gbps to the desk runs happily on Cat5e or Cat6, while 10 Gbps over copper needs Cat6a for the full 100 m, or Cat6 only up to 55 m. **Environment**: near motors, welding equipment, elevator machinery or high-voltage cabling, fiber avoids EMI entirely, and between buildings fiber also avoids ground-potential differences and lightning-induced surges that copper would carry. **Cost** last: multimode optics are cheaper than single-mode optics, so use multimode wherever its distance is enough. Management access is a category of its own: the console cable for the first setup. The exam typically describes a scenario like those in the table and offers several standard names; eliminate the options whose medium or distance cannot work, and the answer is usually obvious.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: cabling and interfaces',
    body: '==Like devices need a crossover, unlike devices a straight-through== (unless Auto-MDIX is in play).',
    bullets: [
      'Hosts, routers, APs transmit on pins 1,2; switches and hubs on 3,6',
      'Every UTP Ethernet standard: **100 m** maximum',
      '1000BASE-T uses **all four pairs**; 10/100 uses two',
      'SMF: small core, laser, long reach; MMF: large core, LED/VCSEL, short',
      'SX/SR = MMF 850 nm; LX/LR = long wavelength, usually SMF',
      'Hub = one collision domain, half duplex, CSMA/CD',
      'Console: rollover or USB, 9600 baud, 8-N-1',
    ],
    notes:
      "These are the facts that decide cabling questions. **Crossover versus straight-through**: hosts and routers transmit on pins 1 and 2, switches and hubs on 3 and 6; like devices need a crossover, unlike devices a straight-through, and a PC connected directly to a router is a like-device pair. Auto-MDIX makes either cable work, but questions that ask which cable is required expect the classic rule. **Distances**: every twisted-pair standard stops at 100 m, and 10GBASE-T on Cat6 stops at 55 m. **Pairs**: 10 and 100 Mbps use pins 1, 2, 3 and 6; gigabit uses all four pairs. **Fiber**: single-mode means small core, laser and long distance; multimode means large core, LED or VCSEL and short distance; S names are multimode at 850 nm, L names are long-wavelength and usually single-mode. **Shared media**: a hub is one collision domain running half duplex with CSMA/CD, while each switch port is its own collision domain running full duplex. **Console**: a rollover or USB cable at 9600 baud, 8 data bits, no parity and 1 stop bit.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'UTP standards: 100 m; gigabit and 10G use all four pairs',
      'Cat5e for 1 Gbps, Cat6a for 10 Gbps at 100 m',
      'MDI (hosts, routers) Tx on 1,2; MDI-X (switches) Tx on 3,6',
      'Unlike devices: straight-through; like devices: crossover',
      'MMF: large core, 850 nm, hundreds of m; SMF: 9 µm, laser, km',
      'LC/SC connectors; SFP 1G, SFP+ 10G; optics must match',
      'Hub: shared, half duplex, CSMA/CD; switch: full duplex links',
    ],
    notes:
      "The physical layer comes down to choosing the right medium and connecting it correctly. Twisted-pair Ethernet, from 10BASE-T to 10GBASE-T, always stops at 100 meters, and higher speeds need better categories: Cat5e for gigabit and Cat6a for 10 Gbps over the full length. RJ-45 connectors follow the T568A or T568B pinout, and the MDI/MDI-X difference decides the cable: straight-through between unlike devices and crossover between like devices, unless Auto-MDIX sorts it out. Fiber takes over for longer distances and for electrically noisy or outdoor paths: multimode, with its large core and inexpensive 850 nm optics, for hundreds of meters; single-mode, with its 9-micrometer core and lasers, for kilometers. LC connectors on SFP and SFP+ transceivers are the modern standard, and the optics at both ends must match each other and the fiber. Shared, hub-based Ethernet uses half duplex and CSMA/CD in a single collision domain, whereas switched links are point-to-point and full duplex with no collisions at all. And when you meet a new device for the first time, connect with the rollover or USB console cable at 9600 8-N-1.",
  },
];
