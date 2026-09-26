import type { Slide } from '../../types';

export const slidesB: Slide[] = [
  {
    kind: 'cli',
    title: 'Reading the MAC address table',
    code: `SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.aaaa.0001    DYNAMIC     Fa0/1
   1    0200.bbbb.0002    DYNAMIC     Fa0/2
   1    0200.cccc.0003    DYNAMIC     Gi0/1
   1    0200.dddd.0004    DYNAMIC     Gi0/1
Total Mac Addresses for this criterion: 4
SW1# show mac address-table aging-time
Global Aging Time:  300
Vlan    Aging Time
----    ----------`,
    highlight: ['DYNAMIC', 'Gi0/1', '300'],
    bullets: [
      'Filters: `interface Fa0/1`, `vlan 10`, `address 0200.aaaa.0001`',
      'Several MACs on one port → another switch (or hub) behind it',
    ],
    notes:
      "`show mac address-table` (the **CAM table**, after the Content Addressable Memory that stores it) lists four columns: **VLAN**, **MAC address**, **type** and **port**. Adding `dynamic` hides the permanent system entries that Catalyst switches install for control-plane multicasts (they appear as `STATIC` with port `CPU`), so you see only learned addresses. Read the output like a map: 0200.aaaa.0001 is directly on Fa0/1, and **two** MACs are learned on **Gi0/1**, which tells you another switch sits behind that uplink — a switch learns every host beyond a neighbor switch on the same uplink port. The `aging-time` output shows the default **300 seconds**: an entry that sees no frames from its source for five minutes is removed. You can narrow the table with `interface`, `vlan` or `address` keywords, which is how you trace a host through a network hop by hop. Exam exhibits often show this table and ask which port a frame will leave by, or what a multi-MAC port implies.",
  },
  {
    kind: 'cli',
    title: 'Static entries, aging and clearing',
    code: `SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# mac address-table static 0200.eeee.0005 vlan 1 interface FastEthernet0/5
SW1(config)# mac address-table aging-time 600
SW1(config)# end
SW1# show mac address-table address 0200.eeee.0005
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0200.eeee.0005    STATIC      Fa0/5
Total Mac Addresses for this criterion: 1
SW1# clear mac address-table dynamic
SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
Total Mac Addresses for this criterion: 0`,
    highlight: ['STATIC', 'clear mac address-table dynamic', 'aging-time 600'],
    notes:
      "Most entries are **dynamic** — learned from traffic and aged out. You can also add a **static** entry with `mac address-table static <mac> vlan <id> interface <port>`. A static entry is saved in the configuration, **never ages**, and is not overwritten if the same MAC shows up on another port; it is used for devices that rarely talk, or to pin a critical server to its port. `mac address-table aging-time <seconds>` changes the global aging timer (the default is **300**; a value of `0` disables aging). `clear mac address-table dynamic` flushes every learned entry — useful after moving hosts or while troubleshooting — and you can narrow it with `address`, `interface` or `vlan`. Static entries survive the clear, as the output shows: after clearing, no dynamic entries remain until hosts send traffic again, which triggers fresh learning (with some temporary flooding). A common exam question simply asks which command removes learned addresses; the answer is `clear mac address-table dynamic`, not `erase` or `no mac address-table`.",
  },
  {
    kind: 'diagram',
    title: 'Collision domains vs broadcast domains',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 0.9, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 2.6, y: 2.7 },
        { id: 'hub', icon: 'hub', label: 'Hub1', x: 7.6, y: 2.7 },
        { id: 'p1', icon: 'pc', label: 'PC1', x: 1, y: 4.3 },
        { id: 'p2', icon: 'pc', label: 'PC2', x: 2.6, y: 4.3 },
        { id: 'p3', icon: 'pc', label: 'PC3', x: 4.2, y: 4.3 },
        { id: 'p4', icon: 'pc', label: 'PC4', x: 6.8, y: 4.3 },
        { id: 'p5', icon: 'pc', label: 'PC5', x: 8.6, y: 4.3 },
      ],
      links: [
        { from: 'r1', to: 'sw', fromLabel: 'G0/0/0', toLabel: 'Gi0/1' },
        { from: 'r1', to: 'hub', fromLabel: 'G0/0/1' },
        { from: 'sw', to: 'p1' },
        { from: 'sw', to: 'p2' },
        { from: 'sw', to: 'p3' },
        { from: 'hub', to: 'p4', tone: 'warn' },
        { from: 'hub', to: 'p5', tone: 'warn' },
      ],
      groups: [
        { label: 'Broadcast domain 1', x: 0.3, y: 1.9, w: 4.6, h: 3, tone: 'accent' },
        { label: 'Broadcast domain 2', x: 5.8, y: 1.9, w: 3.9, h: 3 },
      ],
    },
    caption: 'SW1 side: 4 collision domains. Hub side: 1 shared collision domain. Total: 5 collision, 2 broadcast.',
    notes:
      "A **collision domain** is the set of devices whose transmissions can collide; a **broadcast domain** is the set of devices that receive each other's broadcasts. Count them with two rules. Every **switch port** (and every router port) is its own collision domain, while a **hub** repeats bits out all ports, so everything attached to a hub shares **one** collision domain. Only a **router** (or a VLAN boundary) separates broadcast domains; switches and hubs forward broadcasts everywhere in the VLAN. Apply that here: SW1 has four connected ports (the link to R1 plus three PCs) = 4 collision domains; the hub and everything on it, including R1's G0/0/1, = 1 more, for **5 collision domains**. R1 has two LAN interfaces, so there are **2 broadcast domains**. If SW1 were split into two VLANs, it would add a broadcast domain without changing the collision count. Expect at least one \"how many collision and broadcast domains\" exhibit on the exam.",
  },
  {
    kind: 'compare',
    title: 'Half duplex vs full duplex',
    left: {
      heading: 'Half duplex',
      bullets: [
        'Send **or** receive — never both at once',
        'Required on hubs and other shared media',
        '**CSMA/CD** active: listen, detect, jam, back off',
        'Collisions are normal (late collisions are not)',
      ],
    },
    right: {
      heading: 'Full duplex',
      tone: 'accent',
      bullets: [
        'Send **and** receive simultaneously',
        'Point-to-point link, e.g. host to switch port',
        'CSMA/CD disabled — collisions cannot occur',
        'Full speed in each direction at once',
      ],
    },
    notes:
      "**Half duplex** means a device can either transmit or receive at any moment. On shared media such as a hub, it must use **CSMA/CD**: listen until the wire is idle (carrier sense), transmit, and if a collision is detected, send a jam signal, wait a random **backoff** time, then retry. **Full duplex** uses separate transmit and receive pairs on a point-to-point link, so both ends talk at once and collisions are impossible — CSMA/CD is simply switched off. Every modern switch port connected to a single device runs full duplex, which is why collisions are essentially history on switched LANs. Two things to remember for the exam. First, a device attached to a **hub** must run half duplex. Second, collisions counted on a full-duplex link, or **late collisions** (after the first 64 bytes) on a half-duplex link, are symptoms of a problem — most often a **duplex mismatch**, where one side runs full and the other half.",
  },
  {
    kind: 'cli',
    title: 'Duplex and speed on switch ports',
    code: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1                        connected    1          a-full  a-100 10/100BaseTX
Fa0/2                        connected    1          a-half  a-100 10/100BaseTX
Fa0/3                        notconnect   1            auto   auto 10/100BaseTX
Gi0/1                        connected    trunk      a-full a-1000 10/100/1000BaseTX
SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# interface FastEthernet0/2
SW1(config-if)# speed 100
SW1(config-if)# duplex full
SW1(config-if)# end
SW1# show interfaces status | include Fa0/2
Fa0/2                        connected    1            full    100 10/100BaseTX`,
    highlight: ['a-half', 'duplex full', 'a-full'],
    notes:
      "`show interfaces status` gives one line per port. The `a-` prefix means the value was **autonegotiated**; a value without it was set manually. Fa0/2 shows `a-half`, a red flag on a switch port. Here is the story: the PC on Fa0/2 was hard-coded to 100/full, so it no longer negotiates. The switch port is still on auto, detects the speed from the signal, but **cannot learn the duplex**, so it falls back to the IEEE default: **half duplex at 10 or 100 Mb/s** (full at 1 Gb/s and above). The result is a **duplex mismatch** — the half-duplex side logs collisions and late collisions, while the full-duplex side sees FCS/CRC errors and runts, and throughput collapses. The fix is to make both ends match: either set both to auto, or hard-code both. Here the switch port is set to `speed 100` and `duplex full` to match the PC. The detailed error counters are covered in the interface-issues lesson.",
  },
  {
    kind: 'table',
    title: 'Switching methods compared',
    columns: ['Method', 'Starts forwarding after', 'Latency', 'Errored frames'],
    rows: [
      ['**Store-and-forward**', 'The **entire frame** arrives and the FCS is checked', 'Highest; grows with frame size', 'Discarded'],
      ['**Cut-through**', 'The **destination MAC** (first 6 bytes) is read', 'Lowest, fixed', 'Forwarded — FCS not checked'],
      ['**Fragment-free**', 'The **first 64 bytes** arrive', 'Low, fixed', 'Collision fragments dropped; later errors forwarded'],
    ],
    caption: 'Catalyst access switches such as the 2960 use store-and-forward.',
    notes:
      "Switches differ in how much of a frame they receive before they start sending it out. **Store-and-forward** buffers the entire frame and verifies the **FCS**, so corrupted frames are dropped instead of propagated; the cost is latency that grows with frame size. It is the method used by most Cisco Catalyst campus switches and it naturally handles ports of different speeds because the whole frame is buffered first. **Cut-through** begins forwarding as soon as it has read the **destination MAC** — the first field after the SFD — giving the lowest possible latency, which is why it appears in data centers and trading networks; the downside is that frames with bad FCS are forwarded anyway (the receiving host discards them). **Fragment-free** is the compromise: it waits for the first **64 bytes**, because collisions on a legal half-duplex segment happen within that window, so collision fragments (runts) are filtered. For the exam: lowest latency = cut-through; checks the FCS = store-and-forward; 64 bytes = fragment-free.",
  },
  {
    kind: 'steps',
    title: 'Following a host through the MAC tables',
    steps: [
      { title: 'Get the host MAC', text: '`ipconfig /all` on the PC, or `show ip arp` on the gateway' },
      { title: 'Look it up on the first switch', text: '`show mac address-table address 0200.aaaa.0001`' },
      { title: 'Uplink port? Move to the next switch', text: 'Repeat until the port is an access port' },
      { title: 'Entry missing?', text: 'Check cable, port status and VLAN; generate traffic (ping) and look again' },
      { title: 'MAC jumping between ports?', text: 'Suspect a Layer 2 loop or a duplicated MAC' },
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC-A', sub: '0200.aaaa.0001', x: 1, y: 1.5 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 4, y: 1.5 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 6.6, y: 1.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 9, y: 1.5 },
      ],
      links: [
        { from: 'pc', to: 'sw2', toLabel: 'Fa0/7', tone: 'accent' },
        { from: 'sw2', to: 'sw1', fromLabel: 'Gi0/1', toLabel: 'Gi0/2' },
        { from: 'sw1', to: 'r1', fromLabel: 'Gi0/1', toLabel: 'G0/0/0' },
      ],
    },
    notes:
      "The MAC table is one of the best troubleshooting tools you have, because it tells you where a device physically is. Start from something you know — usually the host's MAC from `ipconfig /all`, or the router's ARP table if you only know its IP. On SW1, `show mac address-table address 0200.aaaa.0001` points to **Gi0/2**, an uplink toward SW2, so the host is not on SW1 at all. Hop to SW2 and repeat: now the entry points to **Fa0/7**, an access port — you have found the host. If an entry is **missing**, the host may be silent (entries age out after 300 seconds of silence), the link may be down, or the port may be in a different VLAN than you are searching; a quick ping from the host refreshes the entry. If the same MAC keeps **moving** between two ports, Catalyst switches log a MAC-flap message — a classic sign of a bridging loop or two devices using the same MAC. The exam may give you tables from two switches and ask where a host is connected.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: Ethernet switching',
    body: 'Switches **learn** from the ==source MAC== and **forward** on the destination MAC — never the other way round.',
    bullets: [
      'Unknown unicast is **flooded**, not dropped',
      'Frame size 64–1518 counts destination MAC through FCS only',
      'Default aging **300 s**; static entries never age',
      'Every switch port = its own collision domain; a hub = one shared domain',
      'Only routers (and VLANs) split broadcast domains',
      'Cut-through = lowest latency; store-and-forward checks the FCS',
      'Auto side facing a hard-coded 10/100 port falls back to **half duplex**',
    ],
    notes:
      "These are the distractors Cisco uses most often in this topic. The biggest is the learn/forward confusion: tables are built from **source** addresses, and forwarding decisions use **destination** addresses. Second, beginners often think a switch drops frames for destinations it has not learned — it floods them. Third, frame-size questions deliberately include 1526 or 72 (which would include the preamble and SFD) — the standard numbers are **64** and **1518** (1522 with a tag). Fourth, domain-counting items hide a hub in the topology: all hub ports share one collision domain, and a switch does **not** separate broadcast domains unless VLANs are configured. Finally, duplex questions: if one side is hard-coded and the other is on auto at 10/100 Mb/s, the auto side selects **half** duplex, creating a mismatch with late collisions. Before you answer any switching item, ask yourself: what is the destination MAC, is it in the table, and which VLAN is the frame in?",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Frame: preamble, SFD, destination, source, type, data, FCS; **64–1518** bytes',
      'MAC = 24-bit **OUI** + 24-bit NIC part; broadcast `FFFF.FFFF.FFFF`; odd first octet = group',
      'Learn the **source** MAC per VLAN and port; dynamic entries age after **300 s**',
      '**Forward** known unicast, **filter** same-port, **flood** broadcast/multicast/unknown',
      '`show mac address-table`, static entries, `clear mac address-table dynamic`',
      'Switch port = collision domain; router or VLAN = broadcast domain; full duplex = no CSMA/CD',
      'Store-and-forward vs cut-through vs fragment-free',
    ],
    notes:
      "Let's pull it together. An Ethernet frame carries destination and source MACs, an EtherType and a payload, protected by an FCS that lets receivers discard corrupted frames; legal frames are 64 to 1518 bytes. MAC addresses are 48 bits: an IEEE-assigned OUI plus a vendor-assigned part, and the I/G bit tells unicast from group addresses. A switch learns source MACs into its table per VLAN and port, refreshes entries on every frame and ages them out after 300 seconds of silence. For each frame it forwards known unicasts out one port, filters frames whose destination is on the arrival port, and floods broadcasts, multicasts and unknown unicasts within the VLAN. You can view, filter, add static entries to and clear the table from the CLI. Each switch port is a separate collision domain running full duplex, while routers and VLANs define broadcast domains. With this model in your head, VLANs, trunks and STP in the next modules will make immediate sense.",
  },
];
