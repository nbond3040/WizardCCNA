import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'First Hop Redundancy: HSRP, VRRP, GLBP',
    subtitle: 'Keeping the default gateway alive when a router fails',
    notes:
      "Every host on a subnet sends off-subnet traffic to a single **default gateway** address. If the router that owns that address fails, those hosts are cut off, even when a perfectly healthy second router sits on the same LAN — hosts do not run routing protocols and will not look for another exit. **First Hop Redundancy Protocols** solve this by letting two or more routers share a **virtual IP address** and a **virtual MAC address**, so the gateway never disappears from the hosts' point of view. This deck compares the three FHRPs you must know: Cisco's **HSRP** with its active and standby routers, the open-standard **VRRP** with master and backup, and Cisco's **GLBP**, which adds load balancing through an AVG and several AVFs. You will memorise the defaults the exam loves — priorities, preemption, timers, multicast addresses and virtual MAC formats — and configure and verify HSRP and VRRP. The v1.1 blueprint (topic 3.5) asks you to describe the purpose, functions and concepts of FHRPs; interpreting VRRP show output is v2.0 material in this course and is flagged where it appears.",
  },
  {
    kind: 'bullets',
    title: 'The problem: one default gateway',
    bullets: [
      'Hosts know **one** gateway IP (static or from DHCP)',
      'Gateway router fails → no off-subnet access at all',
      'A second router on the LAN does not help by itself',
      'Hosts run no routing protocol to find another exit',
      '==Goal: a gateway address that survives a router failure==',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'GW 10.1.1.1', x: 1, y: 2 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.2, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: '10.1.1.1 — failed', x: 5.8, y: 1, tone: 'bad' },
        { id: 'r2', icon: 'router', label: 'R2', sub: '10.1.1.2 — idle', x: 5.8, y: 3 },
        { id: 'wan', icon: 'internet', label: 'WAN', x: 8.8, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'sw', to: 'r1', tone: 'bad' },
        { from: 'sw', to: 'r2' },
        { from: 'r1', to: 'wan', tone: 'bad' },
        { from: 'r2', to: 'wan' },
      ],
    },
    notes:
      "Look at the problem from PC1's point of view. Its IP configuration contains a single default gateway, 10.1.1.1, learned from DHCP or typed in by hand. For every destination outside its own subnet, PC1 ARPs for that address and sends frames to R1's MAC. When R1 fails, PC1 keeps sending to a MAC that no longer answers, and all off-subnet traffic stops — even though R2 is connected to the same LAN and has a perfectly good path to the WAN. Hosts do not run routing protocols, and although some operating systems accept several gateways, failover between them is slow and unreliable, so you cannot count on it. Changing the gateway on hundreds of PCs by hand is not an option either. What we need is a gateway address that does not belong to one physical router: an address that stays reachable, with the same MAC, whichever router is healthy. That is exactly what a First Hop Redundancy Protocol provides. The 'first hop' is simply the first router a packet reaches when it leaves its subnet — the default gateway.",
  },
  {
    kind: 'diagram',
    title: 'The FHRP idea: a virtual router',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'GW 10.1.1.254', x: 1, y: 2 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.2, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1 — Active', sub: 'real 10.1.1.1', x: 5.8, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2 — Standby', sub: 'real 10.1.1.2', x: 5.8, y: 3 },
        { id: 'wan', icon: 'internet', label: 'WAN', x: 8.9, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'sw', to: 'r1', tone: 'accent' },
        { from: 'sw', to: 'r2' },
        { from: 'r1', to: 'wan' },
        { from: 'r2', to: 'wan' },
      ],
      groups: [{ label: 'VIP 10.1.1.254 · 0000.0c07.ac01', x: 4.4, y: 0.2, w: 3, h: 3.6, tone: 'accent' }],
    },
    caption: 'Each router keeps its own real IP; the virtual IP and virtual MAC belong to the group.',
    bullets: [
      'Hosts use the **virtual IP** as their default gateway',
      'ARP for it returns the **virtual MAC**',
      'One router forwards; the other monitors it',
      'Failover moves the VIP and VMAC — hosts change nothing',
    ],
    notes:
      "An FHRP groups two or more routers into one **virtual router**. The group owns a **virtual IP address** — 10.1.1.254 here — which is what DHCP hands out, or what administrators configure, as the hosts' default gateway. Each physical router keeps its own real interface address (10.1.1.1 and 10.1.1.2) for management and for the protocol's own messages. When PC1 ARPs for 10.1.1.254, the reply carries a **virtual MAC address** derived from the group number, not the burned-in MAC of either router. One router — the active router in HSRP terms — owns the virtual addresses and forwards all traffic sent to them; the other watches it through periodic hello messages. If the active router fails, the standby takes over the same virtual IP **and** the same virtual MAC, so PC1's ARP cache is still correct and nothing on the hosts needs to change. The new active router sends a gratuitous ARP so that the switches update their MAC address tables and deliver frames for the virtual MAC to its port. With default HSRP timers, failover completes within about ten seconds.",
  },
  {
    kind: 'diagram',
    title: 'Failover step by step',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1', icon: 'pc' },
        { id: 'r1', label: 'R1 (active)', icon: 'router' },
        { id: 'r2', label: 'R2 (standby)', icon: 'router' },
      ],
      steps: [
        { from: 'pc', to: 'r1', label: 'Frames to VMAC 0000.0c07.ac01', sub: 'default gateway 10.1.1.254' },
        { from: 'r1', to: 'r2', label: 'Hello every 3 s', sub: 'the active router is alive' },
        { note: 'R1 fails — its Hellos stop', tone: 'bad' },
        { note: 'Hold time (10 s) expires on R2 → R2 becomes active', tone: 'warn' },
        { from: 'r2', to: 'pc', label: 'Gratuitous ARP', sub: '10.1.1.254 is at 0000.0c07.ac01 — switches relearn the port', tone: 'accent' },
        { from: 'pc', to: 'r2', label: 'Same frames, now forwarded by R2', tone: 'good' },
      ],
    },
    caption: 'The hosts never change their gateway or their ARP cache.',
    notes:
      "Here is an HSRP failover in slow motion. In normal operation PC1 sends its off-subnet frames to the virtual MAC, and the switch delivers them to R1, the active router. R1 and R2 exchange **hello** messages every **3 seconds**. If R2 hears nothing from R1 for the **hold time** of **10 seconds**, it concludes that R1 is gone and becomes active. Its first job is to send a **gratuitous ARP** — an unsolicited ARP reply announcing that 10.1.1.254 is at 0000.0c07.ac01. PC1 already had that mapping, so the message is really for the switches: they learn the virtual MAC on R2's port and start forwarding frames there. From PC1's perspective nothing happened except a few seconds of lost packets. Timers can be tuned for faster failover — for example `standby 1 timers 1 3` — but both routers should use the same values. VRRP follows the same pattern with different names and timers: the master advertises every second, and a backup takes over after roughly three seconds of silence. On the exam, remember that hosts never change their gateway or their ARP entry during a failover.",
  },
  {
    kind: 'table',
    title: 'HSRP vs VRRP vs GLBP',
    columns: ['', 'HSRP', 'VRRP', 'GLBP'],
    rows: [
      ['Standard', 'Cisco proprietary', '**Open** (IETF RFC 3768 / 5798)', 'Cisco proprietary'],
      ['Roles', 'Active / Standby', 'Master / Backup', 'AVG / AVF'],
      ['Default priority', '100', '100', '100'],
      ['Preemption default', '**Off**', '**On**', 'Off (AVG)'],
      ['Timers', 'Hello 3 s · hold 10 s', 'Advertisement 1 s', 'Hello 3 s · hold 10 s'],
      ['Multicast', 'v1 224.0.0.2 · v2 224.0.0.102', '224.0.0.18', '224.0.0.102'],
      ['Virtual MAC', 'v1 0000.0c07.acXX · v2 0000.0c9f.fXXX', '0000.5e00.01XX', '0007.b400.XXYY'],
      ['Load balancing', 'Only with multiple groups', 'Only with multiple groups', '**Built in**: one VIP, several forwarders'],
      ['VIP = a real interface IP?', 'No', 'Yes (address owner)', 'No'],
    ],
    notes:
      "This table is the core of the lesson; most FHRP exam items can be answered from it. HSRP and GLBP are **Cisco proprietary**, while VRRP is an **IETF open standard** — VRRPv2 in RFC 3768 and VRRPv3, which adds IPv6, in RFC 5798 — so VRRP is the answer whenever a question mentions a multivendor network. The role names identify the protocol instantly: active/standby is HSRP, master/backup is VRRP, and AVG/AVF is GLBP. All three default to priority **100**, but only VRRP **preempts** by default. HSRP and GLBP share 3-second hellos and a 10-second hold time, while a VRRP master advertises every second. Learn the multicast addresses as a set: HSRPv1 uses 224.0.0.2, HSRPv2 and GLBP use 224.0.0.102, and VRRP uses 224.0.0.18. The virtual MAC formats are the most-tested detail of all and get their own slide. Finally, only GLBP load-balances within a single group — HSRP and VRRP need several groups to spread traffic — and only VRRP lets the virtual IP be a router's real interface address.",
  },
  {
    kind: 'bullets',
    title: 'HSRP roles, priority and preemption',
    bullets: [
      '**Active** router forwards; **standby** takes over; others listen',
      'Priority 0–255, default **100** — highest wins',
      'Tie → highest **interface IP address**',
      'Preemption **off** by default: `standby 1 preempt`',
      'Hello **3 s**, hold **10 s**',
      'Messages: UDP port 1985',
    ],
    notes:
      "HSRP elects one **active** router, which owns the virtual IP and MAC and forwards traffic, and one **standby** router, which monitors the active router and replaces it if it fails. Any additional routers in the group sit in the listen state. The election uses the HSRP **priority**, from 0 to 255 with a default of **100**; the highest priority wins, and if priorities tie, the router with the **highest interface IP address** wins. Configuring `standby 1 priority 110` on the router you want active is the standard approach. The trap is **preemption**, which is **disabled** by default. Without it, the election result sticks: a router with a higher priority that boots later — or recovers from a failure — becomes standby and waits instead of taking over. `standby 1 preempt` changes that behaviour. HSRP routers exchange hellos every **3 seconds** and declare a peer dead after a **hold time of 10 seconds**, sending their messages over UDP port 1985 to 224.0.0.2 in version 1. A classic exam question gives two priorities and a boot order and asks who is active; always check for the preempt command before answering.",
  },
  {
    kind: 'steps',
    title: 'HSRP states',
    steps: [
      { title: '**Initial**', text: 'HSRP is starting, e.g. the interface just came up' },
      { title: '**Learn**', text: 'Virtual IP not yet known; waiting to hear from the active router' },
      { title: '**Listen**', text: 'Knows the virtual IP; neither active nor standby' },
      { title: '**Speak**', text: 'Sends Hellos and takes part in the election' },
      { title: '**Standby**', text: 'Next in line; monitors the active router' },
      { title: '**Active**', text: 'Owns the virtual IP and MAC; forwards traffic' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 's1', label: 'Initial', shape: 'pill', tone: 'muted' },
        { id: 's2', label: 'Learn', shape: 'pill' },
        { id: 's3', label: 'Listen', shape: 'pill' },
        { id: 's4', label: 'Speak', shape: 'pill' },
        { id: 's5', label: 'Standby', shape: 'pill' },
        { id: 's6', label: 'Active', shape: 'pill', tone: 'accent' },
      ],
    },
    notes:
      "An HSRP router moves through six states on its way to a role, and Cisco occasionally asks for the order or the meaning of one of them. In **Initial**, HSRP is just starting, for example because the interface has come up. In **Learn**, the router does not yet know the virtual IP address and is waiting to hear it from the active router, which happens when the virtual IP is not configured locally. In **Listen**, it knows the virtual IP but is neither active nor standby; it simply monitors hellos. In **Speak**, it sends its own hellos and takes part in the election. The winner of the standby role enters **Standby** and is next in line; the winner of the active role enters **Active**, answers ARP for the virtual IP and forwards traffic. After the election only the active and standby routers keep sending hellos, and any third router stays quietly in Listen. The `show standby` output and the `%HSRP-5-STATECHANGE` log messages both use these state names, so together they form a handy troubleshooting timeline. Two routers that both report Active cannot hear each other's hellos.",
  },
  {
    kind: 'table',
    title: 'HSRP version 1 vs version 2',
    columns: ['', 'HSRPv1 (default)', 'HSRPv2'],
    rows: [
      ['Group numbers', '0–255', '0–4095'],
      ['Multicast address', '**224.0.0.2**', '**224.0.0.102**'],
      ['Virtual MAC', '**0000.0c07.acXX** (XX = group in hex)', '**0000.0c9f.fXXX** (XXX = group in hex)'],
      ['Transport', 'UDP 1985', 'UDP 1985'],
      ['IPv6 gateways', 'No', 'Yes'],
      ['Enabled by', 'Default', '`standby version 2` on the interface'],
    ],
    caption: 'The versions do not interoperate: both routers in a group must run the same one.',
    notes:
      "HSRP comes in two versions, and they are not compatible with each other, so both routers in a group must run the same one. **Version 1** is the default. It supports group numbers 0 to 255, sends hellos to **224.0.0.2** — the all-routers group — and builds its virtual MAC as **0000.0c07.acXX**, where XX is the group number in hexadecimal. **Version 2** is enabled per interface with `standby version 2`. It extends the group range to 0–4095, which lets large networks number HSRP groups after VLAN IDs; sends hellos to its own multicast address, **224.0.0.102**; and uses the virtual MAC range **0000.0c9f.fXXX**, with 12 bits for the group number. Version 2 also adds support for IPv6 gateways. Both versions use UDP port 1985 and the same timers, priorities and preemption rules. If one router runs version 1 and the other version 2, they do not recognise each other's hellos, and each router becomes active for the same virtual IP — a classic cause of duplicate-gateway problems. On the exam, pair each version with its multicast address and MAC prefix without hesitation.",
  },
  {
    kind: 'diagram',
    title: 'Decoding virtual MAC addresses',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 48,
      fields: [
        { label: 'HSRPv1 · Cisco OUI 0000.0c', size: 24, tone: 'muted' },
        { label: '07ac', size: 16 },
        { label: 'group XX', size: 8, sub: '8 bits: 0–255', tone: 'accent' },
        { label: 'HSRPv2 · Cisco OUI 0000.0c', size: 24, tone: 'muted' },
        { label: '9f.f', size: 12 },
        { label: 'group XXX', size: 12, sub: '12 bits: 0–4095', tone: 'accent' },
        { label: 'VRRP · IANA OUI 0000.5e', size: 24, tone: 'muted' },
        { label: '0001', size: 16 },
        { label: 'VRID XX', size: 8, sub: '8 bits: 1–255', tone: 'accent' },
      ],
      caption: 'The fixed prefix identifies the protocol; the last bits carry the group number in hex.',
    },
    bullets: [
      'HSRPv1: group 1 → 0000.0c07.ac**01** · group 10 → ac**0a**',
      'HSRPv2: group 1 → 0000.0c9f.f**001** · group 100 → f**064**',
      'VRRP: VRID 1 → 0000.5e00.01**01**',
      'GLBP: 0007.b400.**XXYY** — group, then forwarder',
    ],
    notes:
      "Virtual MAC questions are almost guaranteed, and they all use the same trick: the group number is written in **hexadecimal** at the end of a fixed prefix. For **HSRPv1**, the prefix is 0000.0c07.ac and the last 8 bits are the group: group 1 is 0000.0c07.ac01, group 10 is 0000.0c07.ac0a and group 255 is 0000.0c07.acff. For **HSRPv2**, the prefix is 0000.0c9f.f and the last 12 bits are the group: group 1 is 0000.0c9f.f001 and group 100 is 0000.0c9f.f064. For **VRRP**, the prefix 0000.5e00.01 uses the IANA OUI 00-00-5E, and the last byte is the virtual router ID: VRID 1 is 0000.5e00.0101. **GLBP** uses 0007.b400 followed by the group and the forwarder number, so group 1's first two forwarders are 0007.b400.0101 and 0007.b400.0102. The distractors are predictable: the decimal group number pasted in as if it were hex (ac10 for group 10), or the right number with another protocol's prefix. Convert the group to hex first, then check the prefix, and you will not miss one.",
  },
  {
    kind: 'cli',
    title: 'Configuring HSRP',
    code: `R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# standby 1 ip 10.1.1.254
R1(config-if)# standby 1 priority 110
R1(config-if)# standby 1 preempt
R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# ip address 10.1.1.2 255.255.255.0
R2(config-if)# standby 1 ip 10.1.1.254
*Sep 27 09:14:22.531: %HSRP-5-STATECHANGE: GigabitEthernet0/0/0 Grp 1 state Speak -> Standby`,
    highlight: ['standby 1 ip 10.1.1.254', 'standby 1 priority 110', 'standby 1 preempt'],
    caption: 'Same group and virtual IP on both routers; priority and preempt decide who is active.',
    notes:
      "HSRP is configured under the LAN interface, and every command starts with `standby` followed by the **group number**. Both routers must agree on the group number and the virtual IP. `standby 1 ip 10.1.1.254` creates group 1 with virtual IP 10.1.1.254; the address must be in the interface's subnet but must not be assigned to any router interface. On R1, `standby 1 priority 110` beats R2's default of 100, and `standby 1 preempt` lets R1 reclaim the active role after a reload. R2 keeps the defaults and, as its log message shows, settles into the Standby state. Many engineers add `standby 1 preempt` on both routers so that whichever has the better priority always ends up active. Optional commands include `standby version 2`, `standby 1 timers` to shorten failover, and `standby 1 track` to lower the priority when an uplink fails. Finally, the hosts must use the virtual IP as their gateway — typically through the DHCP pool's `default-router 10.1.1.254`. Pointing hosts at a router's real address, 10.1.1.1, would bypass HSRP completely.",
  },
  {
    kind: 'cli',
    title: 'Verifying with show standby brief',
    code: `R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/0     1    110 P Active  local           10.1.1.2        10.1.1.254
R2# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/0     1    100   Standby 10.1.1.1        local           10.1.1.254`,
    highlight: ['Active  local', 'Standby 10.1.1.1', '10.1.1.254'],
    caption: '"local" means this router. P = configured to preempt.',
    notes:
      "`show standby brief` is the one-line summary per group, and exam exhibits use it constantly. Read it left to right. **Interface** and **Grp** identify the group. **Pri** is this router's priority. **P** shows whether this router is configured to preempt — the header lines explain the letter. **State** is this router's own HSRP state. **Active** and **Standby** name the routers holding those roles by their real IP addresses, with **local** meaning this router. **Virtual IP** is the gateway address the hosts use. On R1 the line reads: group 1, priority 110, preempt configured, state Active, active router local, standby router 10.1.1.2, virtual IP 10.1.1.254. On R2: priority 100, no preempt, state Standby, active router 10.1.1.1, standby router local. If the Standby column shows **unknown**, there is no standby router and the group has lost its redundancy; if two routers both show Active, they are not hearing each other's hellos. Practise translating each line into a sentence like these — the exam's answer options are usually written exactly that way.",
  },
  {
    kind: 'cli',
    title: 'show standby in detail',
    code: `R1# show standby
GigabitEthernet0/0/0 - Group 1
  State is Active
    2 state changes, last state change 00:12:31
  Virtual IP address is 10.1.1.254
  Active virtual MAC address is 0000.0c07.ac01
    Local virtual MAC address is 0000.0c07.ac01 (v1 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.456 secs
  Preemption enabled
  Active router is local
  Standby router is 10.1.1.2, priority 100 (expires in 9.328 sec)
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0/0-1" (default)`,
    highlight: ['0000.0c07.ac01', 'Hello time 3 sec, hold time 10 sec', 'Preemption enabled', 'Priority 110'],
    caption: 'Virtual MAC, timers, preemption and both roles in one place.',
    notes:
      "The detailed `show standby` output adds the facts the brief form hides. The first line names the interface and group, and **State is Active** confirms R1's role, with a count of state changes that helps you spot a flapping group. **Virtual IP address** is 10.1.1.254. **Active virtual MAC address** is 0000.0c07.ac01 — group 1 in HSRP version 1 format — and the next line confirms that this is the v1 default MAC. **Hello time 3 sec, hold time 10 sec** shows the timers, which must match between peers. **Preemption enabled** confirms the preempt command. **Active router is local** and **Standby router is 10.1.1.2, priority 100** identify both roles, with a countdown showing when R1 would declare the standby dead. **Priority 110 (configured 110)** shows the current and the configured priority; the two differ when object tracking has lowered the priority after an uplink failure. The group name is generated automatically. When a question asks for the virtual MAC, the timers, or whether preemption is enabled, this is the output it will show you.",
  },
  {
    kind: 'diagram',
    title: 'Preemption: taking the active role back',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1 · priority 110', icon: 'router' },
        { id: 'r2', label: 'R2 · priority 100', icon: 'router' },
      ],
      steps: [
        { note: 'R1 active, R2 standby' },
        { note: 'R1 reloads — R2 becomes active after the 10 s hold time', tone: 'bad' },
        { from: 'r1', to: 'r2', label: 'Hello: priority 110', sub: 'R1 is back online' },
        { note: 'Without preempt: R1 becomes standby, R2 stays active', tone: 'muted' },
        { from: 'r1', to: 'r2', label: 'Coup (preempt configured)', sub: 'higher priority takes over', tone: 'accent' },
        { note: 'With preempt: R1 active again, R2 back to standby', tone: 'good' },
      ],
    },
    bullets: [
      'HSRP and GLBP: preemption **off** by default',
      'VRRP: preemption **on** by default',
      'Tracking lowers priority on uplink failure — the peer needs preempt',
    ],
    notes:
      "Preemption decides what happens when a better router appears after the election. Follow the timeline. R1, priority 110, is active and R2, priority 100, is standby. R1 reloads, and after the 10-second hold time R2 becomes active. When R1 returns, it sends hellos announcing priority 110. **Without preempt**, HSRP keeps the current active router: R1 simply becomes standby, and R2 stays active even though its priority is lower. **With preempt** configured on R1, R1 sends a **coup** message and takes the active role back, and R2 returns to standby. HSRP, and GLBP for its AVG role, have preemption disabled by default; VRRP enables it by default. Preemption also matters for **tracking**: `track 1 interface GigabitEthernet0/0/1 line-protocol` together with `standby 1 track 1 decrement 20` lowers R1's priority from 110 to 90 when its uplink fails. That moves the active role only if R2 — now the router with the higher priority — has preempt configured. Without preempt on the peer, tracking changes the priority number and nothing else.",
  },
  {
    kind: 'compare',
    title: 'HSRP vs VRRP',
    left: {
      heading: 'HSRP (Cisco)',
      bullets: [
        'Roles: **active** / **standby**',
        'Preemption **off** by default',
        'Hello 3 s · hold 10 s',
        '224.0.0.2 (v1) or 224.0.0.102 (v2)',
        'Virtual IP must be a spare address',
      ],
    },
    right: {
      heading: 'VRRP (open standard)',
      tone: 'accent',
      bullets: [
        'Roles: **master** / **backup**',
        'Preemption **on** by default',
        'Master advertises every 1 s; backups stay silent',
        '224.0.0.18 · IP protocol 112',
        'Virtual IP may be a router\'s real IP (owner, priority 255)',
      ],
    },
    notes:
      "VRRP does the same job as HSRP with different vocabulary and defaults, and questions often hinge on the differences. VRRP is an **open standard**, so it is the choice in multivendor networks. Its roles are **master** and **backup** instead of active and standby, and only the master sends advertisements — every **1 second** by default — to **224.0.0.18** using IP protocol 112. Backups stay silent and take over when the master's advertisements stop for about three intervals. Priority defaults to **100**, just as in HSRP, but VRRP **preempts by default**, so a backup with a higher priority takes over automatically. VRRP's virtual MAC is **0000.5e00.01XX**, where XX is the virtual router ID in hex. The most unusual difference is that the virtual IP may be the **real interface address** of one of the routers. That router is the **IP address owner**, automatically uses priority 255 and is master whenever it is up. HSRP, by contrast, requires a spare address for the virtual IP. On the exam, identify the protocol from its role names first, then apply its defaults.",
  },
  {
    kind: 'cli',
    title: 'Configuring VRRP and reading show vrrp brief',
    code: `R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# vrrp 1 ip 10.1.1.254
R1(config-if)# vrrp 1 priority 110
R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# vrrp 1 ip 10.1.1.254
R1# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0/0            1   110 3570       Y  Master  10.1.1.1        10.1.1.254
R2# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0/0            1   100 3609       Y  Backup  10.1.1.1        10.1.1.254`,
    highlight: ['vrrp 1 ip 10.1.1.254', 'Master', 'Backup'],
    caption: 'No preempt command needed — VRRP preempts by default (Pre = Y). Output reading is v2.0 material.',
    notes:
      "VRRP configuration mirrors HSRP with the keyword `vrrp` instead of `standby`: `vrrp 1 ip 10.1.1.254` creates group 1 on both routers, and `vrrp 1 priority 110` makes R1 the preferred master. No preempt command is needed, because VRRP preempts by default. In a real network you run one FHRP per subnet, so picture this as the alternative to the HSRP example. Reading `show vrrp brief` is **v2.0 exam material**; for v1.1 you only need to describe VRRP. The columns are **Grp** and **Pri**; **Time**, the master-down interval in milliseconds — three advertisement intervals plus a skew that shrinks as priority rises (3570 for priority 110, 3609 for 100); **Own**, marked when the router owns the virtual IP; **Pre**, Y when preemption is enabled; **State**, Master or Backup; **Master addr**, the real IP of the current master; and **Group addr**, the virtual IP. So R1 is master with priority 110, R2 is backup with priority 100 and knows the master is 10.1.1.1, and both would preempt. The detailed `show vrrp` adds the virtual MAC, 0000.5e00.0101, and the advertisement interval. Newer IOS XE releases also offer VRRPv3, with a different command syntax.",
  },
  {
    kind: 'diagram',
    title: 'GLBP: one virtual IP, several forwarders',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'gets 0007.b400.0101', x: 1, y: 1 },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: 'gets 0007.b400.0102', x: 1, y: 4 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.4, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'AVG + AVF 1', x: 6.2, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'AVF 2', x: 6.2, y: 4 },
        { id: 'wan', icon: 'internet', label: 'WAN', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'pc1', to: 'sw' },
        { from: 'pc2', to: 'sw' },
        { from: 'sw', to: 'r1', tone: 'accent' },
        { from: 'sw', to: 'r2', tone: 'accent' },
        { from: 'r1', to: 'wan' },
        { from: 'r2', to: 'wan' },
      ],
      groups: [{ label: 'GLBP group 1 · VIP 10.1.1.254', x: 5.1, y: 0.2, w: 2.2, h: 4.6 }],
    },
    caption: 'PC1 and PC2 share gateway 10.1.1.254 but send their traffic through different routers.',
    bullets: [
      '**AVG** answers ARP for the VIP with different virtual MACs',
      'Each **AVF** forwards frames sent to its own virtual MAC',
      'Up to 4 AVFs per group; round-robin by default',
      'A failed AVF\'s MAC is taken over by another router',
    ],
    notes:
      "HSRP and VRRP leave the standby router idle. **GLBP**, Cisco's Gateway Load Balancing Protocol, lets every router in the group forward traffic while the hosts still share one gateway address. One router is elected **Active Virtual Gateway** (AVG) — highest priority, default 100, then highest IP, with preemption off by default — and it answers every ARP request for the virtual IP. The trick is in those replies: the AVG hands out a **different virtual MAC** to different hosts, one per **Active Virtual Forwarder** (AVF). Here PC1 receives 0007.b400.0101, owned by R1's forwarder, and PC2 receives 0007.b400.0102, owned by R2's forwarder, so both uplinks carry traffic. A group supports up to **four** AVFs, and the AVG assigns MACs round-robin by default; weighted and host-dependent methods are also available. If an AVF fails, another router takes over forwarding for its virtual MAC, so hosts are unaffected; if the AVG fails, a standby AVG takes over. GLBP uses 224.0.0.102 on UDP port 3222, with HSRP-like 3-second hellos and a 10-second hold time. Remember the one-liner: the **AVG answers ARP, the AVFs forward**.",
  },
  {
    kind: 'bullets',
    title: 'Load sharing with HSRP or VRRP',
    bullets: [
      'One group = one forwarding router per subnet',
      'Use **one group per VLAN** and alternate the active router',
      'R1 active for VLAN 10, R2 active for VLAN 20',
      'Each router backs up the other VLAN',
      'Make each VLAN\'s active router its **STP root** too',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'Active G10 · Standby G20', x: 2.5, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'Active G20 · Standby G10', x: 7.5, y: 1 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.8 },
        { id: 'pa', icon: 'pc', label: 'PC-A', sub: 'VLAN 10 · GW 10.1.10.254', x: 2.6, y: 4.3 },
        { id: 'pb', icon: 'pc', label: 'PC-B', sub: 'VLAN 20 · GW 10.1.20.254', x: 7.4, y: 4.3 },
      ],
      links: [
        { from: 'r1', to: 'sw', label: 'trunk' },
        { from: 'r2', to: 'sw', label: 'trunk' },
        { from: 'sw', to: 'pa' },
        { from: 'sw', to: 'pb' },
      ],
    },
    notes:
      "With a single HSRP or VRRP group, only one router forwards traffic for a subnet while the other waits. To use both routers, create **one group per VLAN** and alternate the active role. In the diagram, R1 has priority 110 in group 10 (VLAN 10, virtual IP 10.1.10.254) and the default 100 in group 20, while R2 has the opposite; with preemption on both routers, R1 normally forwards VLAN 10 traffic and R2 forwards VLAN 20 traffic, and each router backs up the other's VLAN. Numbering groups after VLAN IDs keeps the configuration readable — HSRP version 2 allows group numbers up to 4095 for exactly this purpose. The routers can use subinterfaces on a trunk, as here, or SVIs on multilayer switches. One design rule matters in switched networks: make the HSRP active router for a VLAN the **STP root bridge** for that VLAN as well, so traffic takes the direct Layer 2 path to its gateway instead of crossing an extra switch. This multiple-group approach balances load by subnet, whereas GLBP balances by host inside a single subnet.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: FHRPs',
    body: 'FHRP questions are mostly about defaults and formats — know them cold.',
    bullets: [
      'HSRP: priority **100**, preempt **off**, hello **3 s** / hold **10 s**',
      'HSRPv1 **0000.0c07.acXX** @ 224.0.0.2 · v2 **0000.0c9f.fXXX** @ 224.0.0.102',
      'VRRP: open standard, preempt **on**, **0000.5e00.01XX**, 224.0.0.18',
      'GLBP: the AVG answers ARP, the AVFs forward — true load balancing',
      'Group number → **hex** in the MAC (group 10 = 0a)',
      'Hosts use the **virtual IP**; nothing changes on them at failover',
      'Higher priority without preempt does **not** take over',
    ],
    notes:
      "FHRP questions reward precise memory, so run this list before the exam. For HSRP, know the defaults — priority 100, preemption off, 3-second hello and 10-second hold — and both version formats: version 1 with 0000.0c07.acXX on 224.0.0.2, version 2 with 0000.0c9f.fXXX on 224.0.0.102. For VRRP, remember that it is the open standard, that preemption is on by default, and that its MAC is 0000.5e00.01XX with advertisements to 224.0.0.18. For GLBP, remember that the AVG answers ARP and the AVFs forward, which gives load balancing within a single group. In virtual MAC questions, convert the group number to hexadecimal before choosing an answer. In scenario questions, check for preemption: a router with a higher priority that lacks preempt will not take over, and tracking only causes a failover if the peer preempts. Finally, remember what the hosts see — a single virtual IP and virtual MAC that never change during a failover, so hosts need no reconfiguration and no ARP refresh.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'FHRPs share a **virtual IP + virtual MAC** as the hosts\' gateway',
      'HSRP: active/standby, priority 100, preempt off, 3/10 s timers',
      'HSRPv1 0000.0c07.acXX · v2 0000.0c9f.fXXX (224.0.0.2 / .102)',
      'VRRP: open standard, master/backup, preempt on, 0000.5e00.01XX',
      'GLBP: AVG answers ARP, up to 4 AVFs forward — load balancing',
      '`standby 1 ip`, `standby 1 priority`, `standby 1 preempt`; `vrrp 1 ip`',
      'Read `show standby brief` / `show vrrp brief`: state, roles, VIP',
    ],
    notes:
      "A First Hop Redundancy Protocol hides router failures from hosts by giving them a virtual gateway: a virtual IP address and a virtual MAC address shared by a group of routers, owned at any moment by one of them and taken over by another when it fails. HSRP, Cisco's protocol, uses active and standby routers, priority 100 by default, preemption disabled, 3-second hellos and a 10-second hold time; version 1 uses 0000.0c07.acXX and 224.0.0.2, version 2 uses 0000.0c9f.fXXX and 224.0.0.102. VRRP, the open standard, uses master and backup routers, preempts by default, can use a router's real IP as the virtual IP, and builds its MAC as 0000.5e00.01XX. GLBP adds load balancing to a single group: the AVG answers ARP with different virtual MACs so that up to four AVFs forward traffic at once. Configure HSRP with `standby` commands and VRRP with `vrrp` commands on the LAN interface, and verify with `show standby brief` and `show vrrp brief` — the latter being v2.0 material — reading each router's state, the active or master router and the virtual IP.",
  },
];

export default slides;
