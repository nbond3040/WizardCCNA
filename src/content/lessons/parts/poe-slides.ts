import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Power over Ethernet (PoE)',
    subtitle: 'PSE and PD roles, 802.3af/at/bt and UPOE, power budgets, and power inline',
    notes:
      "Look up at the ceiling of any modern office and you will find wireless access points with a single Ethernet cable and no power outlet nearby. **Power over Ethernet** (PoE) makes that possible by sending DC power over the same twisted-pair cable that carries the data. In this lesson you will learn the roles of the **PSE** (power sourcing equipment) and the **PD** (powered device), how a switch safely detects and classifies a device before powering it, the IEEE standards and their per-port wattages — **802.3af** (15.4 W), **802.3at** (30 W) and **802.3bt** (60 W and 90 W) — plus Cisco's UPOE, how to plan a switch's **power budget**, and how to control and verify PoE with `power inline` and `show power inline`. PoE is v1.1 topic 1.1.h and part of v2.0 domain 2; both versions expect you to know the standards, the roles and the basic IOS commands. Pay special attention to the numbers: exam questions love to ask which standard a given wattage requires, or how many devices a switch's budget can support.",
  },
  {
    kind: 'bullets',
    title: 'Why PoE: one cable for data and power',
    bullets: [
      'Sends **DC power** and data over one twisted-pair cable',
      'No electrical outlet needed at the device',
      'A **UPS** behind the switch keeps phones and APs alive',
      'Power-cycle a hung device remotely from the switch',
      'Same **100 m** reach as the Ethernet link itself',
      'Powers APs, IP phones, cameras, IoT sensors, badge readers',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'ups', icon: 'box', label: 'UPS', sub: 'backup power', x: 1, y: 2.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'PoE switch (PSE)', x: 3.4, y: 2.5, tone: 'accent' },
        { id: 'ap', icon: 'ap', label: 'AP', x: 6.5, y: 0.9 },
        { id: 'ph', icon: 'phone', label: 'IP phone', x: 8.8, y: 1.6 },
        { id: 'iot', icon: 'iot', label: 'Sensor', x: 8.8, y: 3.4 },
        { id: 'cam', icon: 'camera', label: 'Camera', x: 6.5, y: 4.1 },
      ],
      links: [
        { from: 'ups', to: 'sw', label: 'AC' },
        { from: 'sw', to: 'ap', label: 'PoE+', tone: 'accent' },
        { from: 'sw', to: 'ph', label: 'PoE' },
        { from: 'sw', to: 'iot', label: 'PoE' },
        { from: 'sw', to: 'cam', label: 'PoE' },
      ],
    },
    notes:
      "PoE solves a practical problem: the best place for an access point, camera or door sensor is rarely next to a power outlet, and paying an electrician to install outlets on ceilings and poles is slow and expensive. With PoE, the switch port sends low-voltage **DC power** (about 48 V nominal) over the same cable as the data, so one Ethernet run does both jobs. Because every powered device now draws from the wiring closet, a single **UPS** behind the switch keeps phones, APs and cameras running during a power cut — important for emergency calls. PoE also gives you remote control: bouncing a switch port (or disabling and re-enabling its power) reboots a frozen AP without anyone climbing a ladder. The reach is the same **100 m** as the Ethernet link, using Cat5e or better cabling. Typical powered devices are wireless **APs**, **IP phones**, **IP cameras** and a growing list of **IoT** devices: sensors, badge readers, displays, even LED lighting. On the exam, PoE is usually tested through its roles (who supplies and who receives), its standards and wattages, and a couple of IOS commands.",
  },
  {
    kind: 'definitions',
    title: 'PoE vocabulary',
    terms: [
      { term: '**PSE**', def: 'Power sourcing equipment: the device that supplies power — a PoE switch port or an injector.' },
      { term: '**PD**', def: 'Powered device: the endpoint that receives power — AP, IP phone, camera, IoT sensor.' },
      { term: 'Endpoint PSE', def: 'PSE built into the switch port at the end of the cable run.' },
      { term: 'Midspan PSE', def: 'Injector or powered patch panel between a non-PoE switch and the PD.' },
      { term: 'Power budget', def: 'Total watts the switch power supplies can deliver to all PoE ports combined.' },
      { term: 'Class', def: 'Value (0–8) a PD signals during classification so the PSE knows how much power to allocate.' },
    ],
    notes:
      "Two acronyms carry the whole topic. The **PSE**, power sourcing equipment, is whatever puts power on the cable. Usually that is a PoE-capable switch port, called an **endpoint PSE** because it sits at the end of the link. When the switch cannot supply power, a **midspan PSE** — a single-port power injector or a multiport powered patch panel — sits in the middle of the link, passing data through while adding power. The **PD**, powered device, is the endpoint that consumes the power: access points, IP phones, cameras, sensors and similar devices. A PC with a normal NIC is neither: it is just a non-PoE device, and the PSE will not power it. The switch has a finite **power budget**, set by its power supplies, and every powered port consumes part of it. To manage that budget, each PD advertises a **class** during start-up, telling the PSE the maximum power it may need. Exam distractors often reverse these roles — for example, calling the switch the PD — so anchor them with a simple rule: the PSE sources power, and the PD is powered.",
  },
  {
    kind: 'bullets',
    title: 'Switch or injector: where the power comes from',
    bullets: [
      '**Endpoint PSE**: PoE built into the switch port',
      '**Midspan PSE**: injector between a non-PoE port and the PD',
      'Injector: data in, data + power out',
      'Handy for one or two PDs on an older switch',
      'The PSE must meet the PD\'s standard (PoE+ AP → PoE+ injector)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'PoE switch = PSE', x: 1.5, y: 1.3, tone: 'accent' },
        { id: 'ph', icon: 'phone', label: 'IP phone', sub: 'PD', x: 8.5, y: 1.3 },
        { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'no PoE', x: 1.5, y: 3.7 },
        { id: 'inj', icon: 'box', label: 'Injector', sub: 'midspan PSE', x: 5, y: 3.7, tone: 'accent' },
        { id: 'ap', icon: 'ap', label: 'AP', sub: 'PD', x: 8.5, y: 3.7 },
      ],
      links: [
        { from: 'sw1', to: 'ph', label: 'data + power', tone: 'accent' },
        { from: 'sw2', to: 'inj', label: 'data only' },
        { from: 'inj', to: 'ap', label: 'data + power', tone: 'accent' },
      ],
    },
    notes:
      "Power can enter the cable in two places. An **endpoint PSE** is the switch port itself: plug the PD in and the switch powers it, subject to its budget and configuration. This is the normal enterprise design because power is centrally managed, monitored with IOS commands and protected by the wiring closet's UPS. A **midspan PSE** sits between a non-PoE switch port and the PD. The most common form is a **power injector**: its data-in port connects to the switch, its data-and-power-out port connects to the PD, and it plugs into an AC outlet itself. Injectors are useful when you need to power one or two devices on an older switch, or when a PD needs more power than the switch can provide. The injector must support the standard the PD requires — an access point that needs PoE+ (30 W) will not run fully from an 802.3af injector limited to 15.4 W. Note that the injector does not change the data path; the switch still sees an ordinary Ethernet link. Exam questions often describe a non-PoE switch and a new AP and ask what device to add: the answer is a midspan PSE (injector) that matches the AP's standard.",
  },
  {
    kind: 'diagram',
    title: 'Detection and classification',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pse', label: 'SW1 port (PSE)', icon: 'switch' },
        { id: 'pd', label: 'Access point (PD)', icon: 'ap' },
      ],
      steps: [
        { from: 'pse', to: 'pd', label: '1 · Detection', sub: 'low-voltage probe looks for a 25 kΩ signature' },
        { from: 'pd', to: 'pse', label: 'Valid signature present', sub: 'a PoE device, not a plain NIC', dashed: true },
        { from: 'pse', to: 'pd', label: '2 · Classification', sub: 'PD draws a class current → Class 0–8' },
        { note: 'Switch compares the class allocation with its remaining budget' },
        { from: 'pse', to: 'pd', label: '3 · Power-up (about 48 V DC)', tone: 'accent' },
        { from: 'pd', to: 'pse', label: '4 · CDP / LLDP power negotiation', sub: 'optional fine-tuning after boot', dashed: true },
        { note: '5 · PSE monitors the load and removes power when the PD is unplugged' },
      ],
    },
    caption: 'Full voltage is applied only after a valid PD signature is detected.',
    notes:
      "A PSE never simply switches on 48 V. First comes **detection**: the port applies a low, harmless voltage (under 10 V) and measures the response. A genuine PD presents a **signature resistance of about 25 kΩ**; a normal NIC, a laptop or an open port does not, so they are never powered — which is why plugging a PC into a PoE port is perfectly safe. Next comes **classification**: the PSE applies a slightly higher probe voltage, and the PD draws a specific current that maps to a **class** (0–8). The class tells the switch the maximum power to allocate. The switch then checks its remaining **budget**; if enough power is left it **powers up** the port at full voltage, otherwise the port stays unpowered in a power-deny state. After the PD boots, Cisco devices can refine the allocation using **CDP** or **LLDP** (LLDP-MED power TLVs), asking for exactly what they need rather than the class maximum. Finally, the PSE keeps **monitoring** the port: when the PD is unplugged and the current disappears, power is removed quickly so the next device plugged in goes through detection again. The exam asks for the order of these phases and what each achieves.",
  },
  {
    kind: 'table',
    title: 'PoE standards and power per port',
    columns: ['Standard', 'Common name', 'Max at PSE port', 'Max at PD', 'Pairs'],
    rows: [
      ['IEEE **802.3af** (2003)', 'PoE (Type 1)', '**15.4 W**', '12.95 W', '2'],
      ['IEEE **802.3at** (2009)', 'PoE+ (Type 2)', '**30 W**', '25.5 W', '2'],
      ['IEEE **802.3bt** Type 3 (2018)', 'PoE++ / 4-pair PoE', '**60 W**', '51 W', '4'],
      ['IEEE **802.3bt** Type 4 (2018)', 'PoE++ / 4-pair PoE', '**90 W** (often quoted as up to 100 W)', '71.3 W', '4'],
      ['Cisco **UPOE**', 'Universal PoE (Cisco)', '**60 W**', '51 W', '4'],
      ['Cisco **UPOE+**', 'Cisco, 802.3bt Type 4 based', '**90 W**', '71.3 W', '4'],
    ],
    caption: 'Exam numbers are the PSE values: 15.4 W, 30 W, 60 W, 90 W.',
    notes:
      "This is the most tested table in the lesson. **802.3af**, the original PoE standard, delivers up to **15.4 W** per port at the PSE; after losses in up to 100 m of cable, the PD is guaranteed **12.95 W**. **802.3at**, marketed as **PoE+**, doubles that to **30 W** at the PSE and 25.5 W at the PD — enough for most Wi-Fi access points and pan-tilt cameras. Both use two of the cable's four pairs. **802.3bt**, often called **PoE++** or 4-pair PoE, uses all four pairs: Type 3 provides **60 W** (51 W at the PD) and Type 4 provides **90 W** (71.3 W at the PD); vendors and some study guides round Type 4 up to 'up to 100 W'. Cisco reached 60 W before the IEEE with **UPOE** (Universal PoE), which powers all four pairs, and later added **UPOE+** at 90 W, aligned with 802.3bt Type 4. Some references loosely call any 60 W PoE 'UPoE'. When a question gives a wattage, always ask whether it is measured at the switch port (PSE) or at the device (PD) — the exam's standard figures (15.4, 30, 60, 90) are the PSE values, and distractors often mix in the PD numbers.",
  },
  {
    kind: 'table',
    title: 'PoE power classes',
    columns: ['Class', 'Max at PSE', 'Defined by', 'Notes'],
    rows: [
      ['0', '15.4 W', '802.3af', 'Default when the PD signals no class'],
      ['1', '4.0 W', '802.3af', 'Very low-power PDs'],
      ['2', '7.0 W', '802.3af', 'Low-power phones and sensors'],
      ['3', '15.4 W', '802.3af', 'Full 802.3af power'],
      ['4', '30 W', '802.3at', 'PoE+ devices such as many APs'],
      ['5', '45 W', '802.3bt Type 3', '4-pair'],
      ['6', '60 W', '802.3bt Type 3', '4-pair'],
      ['7', '75 W', '802.3bt Type 4', '4-pair'],
      ['8', '90 W', '802.3bt Type 4', '4-pair, highest class'],
    ],
    notes:
      "During classification the PD tells the PSE its **class**, and the switch uses the class to decide how much of the budget to set aside. The allocation is the class maximum at the PSE, which already includes worst-case cable loss, so the switch may reserve more than the device actually draws. Two details trip people up. First, **class 0** means 'unclassified' and is allocated the full **15.4 W**, exactly like class 3 — so a cheap device that skips classification wastes budget. Second, **class 4** exists only from **802.3at** onward; an 802.3af-only port cannot deliver it. Classes 5 to 8 came with **802.3bt** and need all four pairs. Because class-based allocation is coarse, Cisco switches can refine it with **CDP** or **LLDP** power negotiation: an IP phone in class 3 may request only the few watts it really needs, freeing budget for other ports. When you read `show power inline`, the Class column shows the value each PD signaled and the Power column shows what the switch actually allocated. Exam questions may give you a list of classes and ask whether a switch's budget can power them all, so memorize the wattage for classes 0 to 4 at least.",
  },
  {
    kind: 'diagram',
    title: 'Matching devices to PoE standards',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Standard (per port at PSE)',
          layers: [
            { label: '802.3bt Type 4 / UPOE+', sub: '90 W · 4 pairs', tone: 'accent' },
            { label: '802.3bt Type 3 / UPOE', sub: '60 W · 4 pairs' },
            { label: '802.3at (PoE+)', sub: '30 W · 2 pairs' },
            { label: '802.3af (PoE)', sub: '15.4 W · 2 pairs' },
          ],
        },
        {
          title: 'Typical powered devices',
          layers: [
            { label: 'Lighting, displays, thin clients', sub: 'highest-draw PDs', tone: 'accent' },
            { label: 'Multi-radio APs, PTZ cameras with heaters', sub: '4-pair loads' },
            { label: 'Wi-Fi APs, PTZ cameras, video phones', sub: 'class 4' },
            { label: 'IP phones, fixed cameras, sensors', sub: 'classes 1–3' },
          ],
        },
      ],
    },
    notes:
      "Use this ladder to choose a standard from a device's needs. The bottom rung, **802.3af** at 15.4 W, covers most desk IP phones, fixed security cameras, badge readers and small sensors. **802.3at (PoE+)** at 30 W is the everyday standard for enterprise Wi-Fi access points, pan-tilt-zoom cameras and video phones; many current APs need PoE+ to enable all radios and features. The top two rungs use all four pairs. **60 W** (802.3bt Type 3 or Cisco UPOE) suits high-performance multi-radio access points and outdoor cameras with heaters or blowers, while **90 W** (802.3bt Type 4 or Cisco UPOE+) powers devices that would normally need an outlet: LED lighting fixtures, small displays and virtual-desktop thin clients. Always check the device datasheet, because the same product family can have different power needs by model, and some APs will boot on less power with features disabled. A higher standard is backward compatible: a PoE+ port happily powers an 802.3af phone, allocating only what the class requires. The reverse is not true: an 802.3af port cannot give a PoE+ AP its 30 W. Exam questions typically state a wattage and ask for the minimum standard.",
  },
  {
    kind: 'bullets',
    title: 'How the switch decides to power a port',
    bullets: [
      'Budget = what the **power supplies** can deliver to PoE',
      'Each powered port **subtracts its allocation** (class or negotiated)',
      'Enough left → power on; not enough → **power-deny**',
      '`static` ports reserve their power in advance',
      'Larger or additional supplies can raise the budget (platform-dependent)',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'n1', label: 'PD detected', shape: 'pill', x: 1.2, y: 2.5 },
        { id: 'n2', label: 'Class or CDP/LLDP request', x: 3.6, y: 2.5 },
        { id: 'n3', label: 'Enough budget left?', shape: 'diamond', x: 6.1, y: 2.5 },
        { id: 'n4', label: 'Power on', shape: 'round', tone: 'good', x: 8.6, y: 1.2 },
        { id: 'n5', label: 'power-deny', tone: 'bad', x: 8.6, y: 3.8 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: 'yes' },
        { from: 'n3', to: 'n5', label: 'no' },
      ],
    },
    notes:
      "A PoE switch has a fixed **power budget**: the wattage its power supplies can devote to PoE after running the switch itself. Data sheets list it separately from the switch's own consumption, and on many platforms adding a larger or second power supply increases it. Every time a PD is detected, the switch works out how much to allocate — the class maximum, or a smaller value negotiated by CDP or LLDP — and checks whether that much is still **remaining**. If yes, the port powers up and the allocation is subtracted from the budget. If not, the port is left unpowered in the **power-deny** state and a log message is generated, even though the device is plugged in and the link may carry data. Allocation is first come, first served for `auto` ports, which is why a critical device can lose out to a camera someone plugged in earlier. Ports configured with `power inline static` avoid this by **reserving** their power ahead of time, whether or not anything is connected. Planning therefore means adding up worst-case allocations for every PD you intend to connect and comparing the total with the budget, leaving headroom for growth.",
  },
  {
    kind: 'table',
    title: 'Budget math on a 370 W switch',
    columns: ['Device mix (24-port PoE+ switch)', 'Allocation', 'Total', 'Fits in 370 W?'],
    rows: [
      ['24 phones, class 2', '24 × 7.0 W', '168.0 W', 'Yes — 202.0 W left'],
      ['24 cameras, class 3', '24 × 15.4 W', '369.6 W', 'Yes — 0.4 W left'],
      ['12 APs, class 4', '12 × 30 W', '360.0 W', 'Yes — 10.0 W left'],
      ['10 APs (class 4) + 4 cameras (class 3)', '300 W + 61.6 W', '361.6 W', 'Yes — 8.4 W left'],
      ['13 APs, class 4', '13 × 30 W', '390.0 W', '**No** — 13th AP gets power-deny'],
    ],
    caption: 'Divide the budget by the per-port allocation and round down: 370 ÷ 30 = 12.3 → 12 PoE+ devices.',
    notes:
      "Budget questions are simple arithmetic, but they punish carelessness. Work with the **allocation** at the PSE, not the power the device actually uses. Take a 24-port PoE+ switch with a **370 W** budget. Twenty-four class 2 phones need 24 × 7.0 = 168.0 W, leaving 202.0 W. Twenty-four class 3 cameras need 24 × 15.4 = 369.6 W — they fit, with just 0.4 W to spare. Class 4 access points are allocated 30 W each, so 12 of them use 360 W and a 13th would need 390 W in total, more than the budget: that AP is denied power even though a port is free. Mixed loads work the same way: 10 APs (300 W) plus 4 cameras (61.6 W) total 361.6 W, leaving 8.4 W. The shortcut for 'how many devices' questions is to divide the budget by the per-device allocation and **round down**: 370 ÷ 30 = 12.33, so 12. Remember that a 24-port switch does not necessarily power 24 PoE+ devices at full allocation — port count and power budget are separate limits. In real designs, CDP or LLDP negotiation often lowers allocations, but exam math uses the class values unless told otherwise.",
  },
  {
    kind: 'cli',
    title: 'Configuring power inline modes',
    code: `SW1(config)# interface gigabitethernet1/0/5
SW1(config-if)# description Lobby AP - must always have power
SW1(config-if)# power inline static
SW1(config-if)# exit
SW1(config)# interface gigabitethernet1/0/6
SW1(config-if)# description Staff PC - no PoE needed
SW1(config-if)# power inline never
SW1(config-if)# exit
SW1(config)# interface range gigabitethernet1/0/9 - 16
SW1(config-if-range)# power inline auto max 15400
SW1(config-if-range)# end`,
    highlight: ['power inline static', 'power inline never', 'power inline auto max 15400'],
    caption: 'The max value is in milliwatts: 15400 = 15.4 W. Ports without a power inline command use auto.',
    notes:
      "Every PoE-capable Cisco switch port runs **`power inline auto`** by default: it detects PDs and powers them if the budget allows. You change that behavior per interface. **`power inline static`** pre-allocates the port's power so a critical device — here a lobby AP — is guaranteed power the moment it is plugged in, even if other PDs have used up the rest of the budget. The cost is that the reserved watts are subtracted from the budget even while nothing is connected. **`power inline never`** disables detection and power on the port; data still flows normally. Use it on ports for PCs, on unused ports, or anywhere you do not want someone plugging in a power-hungry device. The optional **`max`** keyword caps the power a port may deliver, in **milliwatts**: `power inline auto max 15400` limits ports 9 to 16 to 15.4 W so they cannot hand 30 W to a PoE+ device. Typing `15.4` instead of `15400` is a classic mistake — the value is an integer in mW, and on PoE+ switches the accepted range is 4000 to 30000. The `interface range` command applies the same setting to many ports at once.",
  },
  {
    kind: 'table',
    title: 'auto vs static vs never',
    columns: ['Mode', 'Detects PDs?', 'Budget use', 'Use it for'],
    rows: [
      ['`power inline auto` (default)', 'Yes', 'Allocated only after a PD is detected; first come, first served', 'Most ports'],
      ['`power inline static`', 'Yes', 'Reserved in advance, even with nothing plugged in', 'Critical PDs that must always get power'],
      ['`power inline never`', 'No', 'None — the port never supplies power', 'PCs, unused or untrusted ports'],
      ['`max <mW>` option', '—', 'Caps the power allowed on the port', 'Keep high-draw PDs off certain ports'],
    ],
    notes:
      "Compare the three modes by asking two questions: does the port look for PDs, and when does it take power from the budget? In **auto** mode the port detects PDs and allocates power only after a device is detected and classified. Allocation is dynamic and first come, first served, so if the budget is exhausted, the next device gets power-deny. In **static** mode the port also detects PDs, but its power is **reserved** as soon as you enter the command. That guarantees power for critical devices — a lobby AP, a door controller, an emergency phone — at the price of budget that sits idle until the device appears. In **never** mode the port does not run detection and never supplies power, which makes the port behave like a regular non-PoE port; data forwarding is untouched. The **max** option works with auto or static and limits the power allowed on the port, protecting the budget from unexpectedly power-hungry devices. For the exam, remember that `never` does not shut the port, that `auto` is the default, and that only `static` consumes budget with nothing connected.",
  },
  {
    kind: 'cli',
    title: 'Verifying with show power inline',
    code: `SW1# show power inline

Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0      127.8       242.2
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         30.0    Ieee PD             4     30.0
Gi1/0/2   auto   on         30.0    Ieee PD             4     30.0
Gi1/0/3   auto   on         7.0     Ieee PD             2     30.0
Gi1/0/4   auto   on         15.4    Ieee PD             3     30.0
Gi1/0/5   static on         30.0    Ieee PD             4     30.0
Gi1/0/6   off    off        0.0     n/a                 n/a   30.0
Gi1/0/7   auto   off        0.0     n/a                 n/a   30.0
Gi1/0/8   auto   on         15.4    Ieee PD             0     30.0
<output omitted>`,
    highlight: ['370.0', '127.8', '242.2', 'static'],
    caption: 'Used = sum of the Power column: 30 + 30 + 7 + 15.4 + 30 + 15.4 = 127.8 W.',
    notes:
      "`show power inline` answers both budget and per-port questions. The top section shows the **budget**: 370.0 W available, 127.8 W used and 242.2 W remaining. The per-interface table explains where the power went. **Admin** is the configured mode: `auto`, `static`, or `off` for a port set to `power inline never` (Gi1/0/6). **Oper** is what is happening now: `on` means the PD is powered, `off` means nothing is powered — for an auto port, no valid PD was detected (Gi1/0/7 might be empty or have a PC attached) — and you may also see `power-deny` when the budget cannot cover a PD, or `faulty` when the port detects a problem. **Power** is the watts allocated to the port, **Device** is the name learned through CDP or LLDP or simply `Ieee PD`, **Class** is the class the PD signaled and **Max** is the port's upper limit, 30.0 W on a PoE+ switch. Check the math: the powered ports add up to 30 + 30 + 7.0 + 15.4 + 30 + 15.4 = 127.8 W, and 370.0 − 127.8 = 242.2 W. Notice that the class 0 device on Gi1/0/8 is allocated 15.4 W, the same as the class 3 camera on Gi1/0/4.",
  },
  {
    kind: 'steps',
    title: 'Troubleshooting PoE',
    steps: [
      { title: 'Is the port allowed to supply power?', text: '`power inline never` shows Admin **off**; change it to `auto`.' },
      { title: 'Did the switch detect a PD?', text: 'Oper **off**, Device n/a: no valid signature — non-PoE device or bad cable.' },
      { title: 'Is the budget exhausted?', text: 'Oper **power-deny**: free budget, add supply capacity or move the PD.' },
      { title: 'Does the standard match?', text: 'A class 4 PD on an 802.3af-only port gets at most 15.4 W.' },
      { title: 'Is a max limit too low?', text: 'A `max` cap below the PD\'s needs keeps it from powering fully.' },
      { title: 'Power-cycle a hung PD', text: '`shutdown` then `no shutdown` removes and restores power.' },
    ],
    notes:
      "Troubleshoot PoE from configuration to physics. Start with `show power inline`. If Admin reads **off**, someone configured `power inline never`; the device will pass data (if it has its own power) but will never be powered from the switch. If Admin is auto but Oper is **off** with Device n/a, the switch did not detect a valid PD signature: the endpoint may not be a PoE device, the cable may be damaged, or an intermediate device may be blocking detection. **power-deny** means detection succeeded but the budget could not cover the allocation — look at the Remaining value, reclaim power from static reservations, lower allocations with CDP/LLDP negotiation, add power supply capacity if the platform supports it, or move the PD to another switch. A standards mismatch is next: a PoE+ access point on an 802.3af-only switch or injector receives at most 15.4 W and may stay dark or run with radios disabled. A `max` value set too low has the same effect. Finally, remember the simplest fix for a frozen AP or phone: shutting and re-enabling the interface removes and restores power, rebooting the device remotely. Exam troubleshooting items usually hinge on reading the Admin and Oper columns correctly.",
  },
  {
    kind: 'compare',
    title: '2-pair vs 4-pair PoE',
    left: {
      heading: '2-pair: 802.3af / 802.3at',
      bullets: [
        'Power on **two** of the four pairs',
        'Up to **15.4 W** (af) or **30 W** (at) per port',
        'Works with 10/100/1000 Mbps links',
        'Phones, cameras, many access points',
      ],
    },
    right: {
      heading: '4-pair: 802.3bt / Cisco UPOE',
      tone: 'accent',
      bullets: [
        'Power on **all four** pairs',
        '**60 W** (bt Type 3, UPOE) or **90 W** (bt Type 4, UPOE+)',
        'Less current per pair for the same power',
        'High-power APs, PTZ cameras, lighting, thin clients',
      ],
    },
    notes:
      "An Ethernet cable has four twisted pairs, and PoE sends DC current over them without disturbing the data, because data is carried as a difference between the two wires of a pair while power is applied to the pair as a whole. The original standards, **802.3af** and **802.3at**, use just **two pairs**: on 10/100 links these can be the two data pairs or the two spare pairs, and on gigabit links, which use all four pairs for data, power simply rides alongside the data on two of them. Two pairs cap the practical power at 30 W per port. To go higher without overheating the thin conductors, **802.3bt** and Cisco **UPOE** push current down **all four pairs**, spreading the load so each pair carries less current. That is how 60 W and 90 W become possible over standard Cat5e or better cabling within 100 m. Higher power does bring practical concerns — heat in large cable bundles and bigger power supplies in the wiring closet — so designers check cable category and budget before deploying 4-pair PoE widely. For the exam, associate 2-pair with 15.4 W and 30 W, and 4-pair with 60 W and 90 W.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: PoE',
    body: 'Memorize the ladder at the PSE port: **802.3af = 15.4 W**, **802.3at (PoE+) = 30 W**, **802.3bt = 60 W (Type 3) or 90 W (Type 4)**, Cisco **UPOE = 60 W**, **UPOE+ = 90 W**.',
    bullets: [
      'PSE **supplies** power (switch, injector); PD **receives** it',
      'Default is `power inline auto`; `never` stops power, not data',
      '`static` reserves budget even when nothing is connected',
      '`max` values are **milliwatts**: `15400`, not `15.4`',
      'Class 0 is allocated **15.4 W**, the same as class 3',
      '**power-deny** = budget exhausted; Admin **off** = `never`',
      'PD figures are lower: 12.95 W (af) and 25.5 W (at)',
    ],
    notes:
      "These are the PoE details that decide exam points. First, the numbers: the standard wattages quoted on the exam are **PSE** values — 15.4, 30, 60 and 90 W — and distractors love to offer the PD values (12.95 W and 25.5 W) or swap af and at. A handy memory hook: 'a' comes before 't', and af (15.4 W) comes before at (30 W). Second, the roles: the **switch or injector is the PSE** and the **AP, phone or camera is the PD** — never the reverse. Third, the modes: `auto` is the default; `static` guarantees power by reserving it in advance, even for an empty port; `never` turns off PoE only, leaving the port forwarding data. Fourth, syntax: the `max` keyword takes **milliwatts**. Fifth, allocation: class 0 devices are allocated the full 15.4 W, so a 370 W budget is used up by class allocations, not by actual draw. Finally, reading output: **power-deny** in the Oper column means the budget ran out, while an Admin value of **off** means the port was configured with `power inline never`. If you can explain each of these from memory, PoE questions become quick wins.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'PoE sends DC power plus data over one cable, up to 100 m',
      'PSE (switch or midspan injector) powers the PD (AP, phone, camera, IoT)',
      'Detection (25 kΩ signature) → classification → power-up → monitoring',
      '802.3af 15.4 W · 802.3at 30 W · 802.3bt 60/90 W · UPOE 60 W',
      'Budget = supply capacity; each port subtracts its allocation',
      '`power inline auto | static | never`, `max` in milliwatts',
      '`show power inline`: budget plus Admin, Oper, Power, Class',
    ],
    notes:
      "Power over Ethernet delivers low-voltage DC power and data over the same twisted-pair cable, within the normal 100 m Ethernet limit. The **PSE** — a PoE switch port (endpoint) or an injector (midspan) — supplies power to the **PD**: access points, IP phones, cameras and IoT devices. Before applying power the PSE performs **detection**, looking for a 25 kΩ signature so non-PoE devices are never powered, then **classification**, where the PD's class tells the switch how much to allocate; CDP or LLDP can then fine-tune the allocation, and the PSE removes power when the PD disconnects. The standards form a ladder: **802.3af** 15.4 W, **802.3at (PoE+)** 30 W, **802.3bt** 60 W (Type 3) and 90 W (Type 4), with Cisco **UPOE** at 60 W and **UPOE+** at 90 W; the higher two use all four pairs. Every switch has a **power budget** set by its supplies; each powered port subtracts its allocation, and when the budget runs out new PDs get **power-deny**. On Cisco switches, `power inline auto` is the default, `static` reserves power, `never` disables it, and `max` caps it in milliwatts. `show power inline` shows the budget summary and each port's Admin, Oper, Power, Device, Class and Max values.",
  },
];
