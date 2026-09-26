import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'rapid-pvst',
  slides: [
    {
      kind: 'title',
      title: 'Rapid PVST+',
      subtitle: "Cisco's per-VLAN RSTP: new roles, second-scale convergence, and a root you place on purpose",
      notes:
        "Classic 802.1D works, but 30 to 50 seconds of outage after every failure is unacceptable in a modern network, and a single tree for all VLANs leaves every blocked uplink idle. Cisco's answer — and the mode you should run on Catalyst switches today — is **Rapid PVST+**: a separate **RSTP (802.1w)** instance for every VLAN. In this deck you will compare the STP family (802.1D, PVST+, RSTP, Rapid PVST+ and MST), learn the RSTP port roles, states and link types, see how the proposal/agreement handshake converges in about a second, place the root with `root primary`, `root secondary` and explicit priorities, tune costs and port priorities, share load across two distribution switches, and read `show spanning-tree` line by line. The lesson covers v1.1 topics 2.5.a and 2.5.b; v2.0 keeps Rapid PVST+ in domain 2, so prepare for configuration items as well as output interpretation.",
    },
    {
      kind: 'table',
      title: 'The STP family',
      columns: ['Name', 'Standard', 'Instances', 'Convergence'],
      rows: [
        ['**STP**', 'IEEE 802.1D', 'One tree for all VLANs (CST)', 'Slow: 30–50 s'],
        ['**PVST+**', 'Cisco', 'One 802.1D instance per VLAN', 'Slow: 802.1D timers'],
        ['**RSTP**', 'IEEE 802.1w', 'One tree for all VLANs', 'Fast: about 1 s'],
        ['**Rapid PVST+**', 'Cisco', 'One RSTP instance per VLAN', '==Fast, per VLAN=='],
        ['**MST**', 'IEEE 802.1s', 'A few instances; VLANs mapped to them', 'Fast (RSTP-based)'],
      ],
      caption: '`show spanning-tree` protocol line: `ieee` = PVST+, `rstp` = Rapid PVST+, `mstp` = MST.',
      notes:
        "Five names describe the STP family, and exam items like to mix them up. **802.1D** is the original IEEE standard: one spanning tree — the Common Spanning Tree — for the whole switched network, regardless of VLANs. Cisco extended it as **PVST+**, which runs a separate 802.1D instance in every VLAN so each VLAN can have its own root and its own blocked ports. **802.1w (RSTP)** kept the same election but rewrote the convergence mechanics to recover in about a second; as an IEEE standard it again describes a single tree. Cisco's per-VLAN version of RSTP is **Rapid PVST+**, enabled with `spanning-tree mode rapid-pvst`. **802.1s (MST)** takes a different approach: you map groups of VLANs to a small number of instances, which scales far better when there are hundreds of VLANs. RSTP was later folded into 802.1D-2004 and MST into 802.1Q, but the CCNA still uses the original numbers. Classic Catalyst IOS switches such as the 2960 default to PVST+, while many newer IOS XE platforms default to Rapid PVST+ — always confirm with `show spanning-tree summary`.",
    },
    {
      kind: 'compare',
      title: '802.1D vs 802.1w at a glance',
      left: {
        heading: 'Classic STP (802.1D)',
        bullets: [
          'Five states, including **listening**',
          'Roles: root, designated, non-designated',
          'Only the root originates BPDUs',
          'Indirect failure: wait 20 s **max age** first',
          'Timer-driven convergence: **30–50 s**',
        ],
      },
      right: {
        heading: 'Rapid STP (802.1w)',
        tone: 'accent',
        bullets: [
          'Three states: **discarding**, learning, forwarding',
          'Adds **alternate** and **backup** roles',
          'Every switch sends BPDUs every hello (2 s)',
          'Neighbor lost after **3 missed hellos** (6 s)',
          '**Proposal/agreement**: about 1 s on point-to-point links',
        ],
      },
      notes:
        "RSTP keeps everything you learned about electing the root, root ports and designated ports — the BPDU comparison order, costs and tie-breakers are unchanged. What changes is how quickly a port may forward. Classic STP relies on timers: a port waits 15 seconds in listening and 15 in learning, and after an indirect failure a switch first waits 20 seconds for max age. RSTP instead treats BPDUs as **keepalives**: every switch sends its own BPDU every hello (2 s), not just the root, and if three hellos in a row are missed (**6 s**) the information is aged out. On point-to-point links a new designated port does not wait at all — it negotiates with its neighbor using a **proposal/agreement** handshake and forwards as soon as the neighbor agrees. RSTP also names the ports that 802.1D simply called non-designated: **alternate** and **backup**. The listening state disappears because explicit negotiation replaced waiting. RSTP is backward compatible: a port that hears an 802.1D BPDU falls back to legacy behavior for that neighbor, so mixed networks work, just without the rapid part on those links.",
    },
    {
      kind: 'bullets',
      title: 'One tree per VLAN: PVST+ and Rapid PVST+',
      bullets: [
        'Each VLAN runs its **own** STP instance with its own root and blocked ports',
        'The extended system ID gives every VLAN a unique BID on the same switch',
        'Different roots per VLAN let **both** uplinks carry traffic',
        'Every VLAN sends its own BPDUs on every trunk it crosses',
        'Cost: CPU and BPDU load grow with the number of VLANs',
        '==Rapid PVST+ = per-VLAN trees + RSTP convergence==',
      ],
      notes:
        "The 'PV' in PVST+ stands for **per VLAN**. Instead of one tree for the entire switched network, a Cisco switch runs an independent spanning-tree instance for every VLAN. Each instance has its own root bridge, its own root ports and its own blocked ports, which is what makes load sharing possible: VLAN 10 can block one uplink while VLAN 20 blocks the other. The extended system ID makes this work without extra MAC addresses — the VLAN number is added into the priority field, so the same switch has a distinct bridge ID in every VLAN. The price is overhead: every VLAN sends its own BPDUs every hello on every trunk that carries it, so a switch with hundreds of VLANs spends real CPU on spanning tree; that is the problem MST solves by grouping VLANs. PVST+ and Rapid PVST+ use exactly the same per-VLAN model; the only difference is the algorithm inside each instance — classic 802.1D timers versus 802.1w rapid convergence. On Cisco exams, when a question combines 'per VLAN' with 'rapid' or '802.1w', the answer is Rapid PVST+.",
    },
    {
      kind: 'table',
      title: 'RSTP port roles',
      columns: ['Role', 'What it is', 'Stable state'],
      rows: [
        ['**Root**', 'Best path to the root on a non-root switch', 'Forwarding'],
        ['**Designated**', 'Best port on a segment; forwards onto it', 'Forwarding'],
        ['**Alternate**', 'Backup path to the root through a **different** switch', 'Discarding'],
        ['**Backup**', 'Backup for this switch\'s **own** designated port on a shared segment', 'Discarding'],
        ['**Disabled**', 'Administratively down or excluded from STP', '—'],
      ],
      caption: 'Shown in `show spanning-tree` as Root, Desg, Altn and Back.',
      notes:
        "RSTP names five port roles. **Root** and **designated** are exactly the same as in 802.1D, and both forward in a stable topology. The old non-designated port is split into two roles that describe *why* it is not forwarding. An **alternate** port receives better BPDUs from a **different** switch — it is a ready-made second path to the root. If the root port fails, the switch promotes the best alternate port to root port and forwards on it almost instantly, which is how RSTP builds in the behavior of Cisco's old UplinkFast feature. A **backup** port receives better BPDUs from **its own switch**, which can happen only when two ports of the same switch connect to one shared segment, such as a hub; it backs up the designated port on that segment. Alternate and backup ports are both discarding. **Disabled** ports are shut down or not taking part in spanning tree. In `show spanning-tree` the roles appear as Root, Desg, Altn and Back. The key distinction for exam items is simple: alternate means another switch, backup means the same switch.",
    },
    {
      kind: 'diagram',
      title: 'The alternate port: a pre-computed backup',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1 (root)', sub: 'VLAN 10 · 24586', x: 2, y: 1.2, tone: 'accent' },
          { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'VLAN 10 · 28682', x: 8, y: 1.2 },
          { id: 'as1', icon: 'switch', label: 'AS1', sub: 'VLAN 10 · 32778', x: 5, y: 3.9 },
        ],
        links: [
          { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1 DP', toLabel: 'Gi0/1 RP' },
          { from: 'ds1', to: 'as1', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/1 RP', tone: 'good' },
          { from: 'ds2', to: 'as1', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/2 ALT', blocked: true },
        ],
      },
      caption: 'If AS1 Gi0/1 fails, Gi0/2 becomes the root port and forwards immediately — no listening or learning wait.',
      notes:
        "Look at AS1 in VLAN 10. Its root port Gi0/1 connects straight to the root, DS1. Its Gi0/2 connects to DS2, which is itself only one Gigabit hop from the root, so the BPDUs arriving on Gi0/2 describe a perfectly good path — just not the best one. RSTP marks Gi0/2 as an **alternate** port: discarding, but pre-computed. If the Gi0/1 link fails, AS1 does not wait for any timer: it immediately makes Gi0/2 its new root port, moves it to forwarding, and sends topology change BPDUs so that other switches flush MAC addresses learned through the old path. Recovery typically takes well under a second, compared with 30 seconds of listening and learning in 802.1D. Notice which port did **not** block: DS2's Gi0/2 is designated because DS2 (root secondary, 28682) has a lower BID than AS1 (32778) and both advertise the same root cost of 4 onto that link. Blocking on the access switch rather than between the distribution switches is exactly what a good design aims for, and it is the reason to configure a root secondary.",
    },
    {
      kind: 'table',
      title: 'RSTP states vs 802.1D states',
      columns: ['802.1D state', 'RSTP state', 'Forwards frames', 'Learns MACs'],
      rows: [
        ['Disabled', '**Discarding**', 'No', 'No'],
        ['Blocking', '**Discarding**', 'No', 'No'],
        ['Listening', '**Discarding**', 'No', 'No'],
        ['Learning', '**Learning**', 'No', 'Yes'],
        ['Forwarding', '**Forwarding**', 'Yes', 'Yes'],
      ],
      caption: 'IOS still displays a discarding port as `BLK` in the Sts column.',
      notes:
        "RSTP reduces five states to three by asking only two questions: does the port forward user frames, and does it learn MAC addresses? **Discarding** covers everything that does neither — the old disabled, blocking and listening states. **Learning** remains, because a port that is about to forward should build its MAC table first, and **forwarding** is unchanged. Keep in mind that states and roles are independent ideas: an alternate or backup port is discarding, a root or designated port in a stable topology is forwarding, and a designated port that is still negotiating can be briefly discarding or learning. One display quirk causes many wrong answers: Cisco IOS shows a discarding port as **BLK** in the Sts column of `show spanning-tree`, even in rapid-pvst mode, so 'Altn BLK' means an alternate port in the discarding state. Learning shows as LRN and forwarding as FWD; LIS (listening) belongs to classic PVST+. Exam items often list 'blocking' and 'discarding' side by side as options — pick discarding whenever the question asks for the RSTP state name.",
    },
    {
      kind: 'definitions',
      title: 'RSTP link types',
      terms: [
        { term: 'Point-to-point', def: 'Full-duplex link between two switches — the default for full-duplex ports; proposal/agreement allowed.' },
        { term: 'Shared', def: 'Half-duplex link (a hub); RSTP falls back to slower, timer-based transitions.' },
        { term: 'Edge', def: 'Port to an end device, created with **PortFast**; forwards immediately and causes no topology changes.' },
        { term: '`spanning-tree link-type`', def: 'Interface command to force `point-to-point` or `shared` when duplex-based detection is wrong.' },
      ],
      notes:
        "RSTP's fast handshake is only safe when exactly two switches share a link, so RSTP classifies every port by **link type**. A **point-to-point** link connects two switches directly; IOS assumes this for any port running **full duplex**, which today means virtually every switch-to-switch link, and proposal/agreement runs only on these links. A **shared** link is inferred from **half duplex**, which suggests a hub with possibly several bridges on it; RSTP cannot negotiate with a single partner there and falls back to timer-based transitions. An **edge** port connects to an end device and is created by configuring **PortFast**. It moves to forwarding immediately, is left alone during a sync, and its link flapping does not generate topology changes. If a BPDU ever arrives on an edge port, the port immediately loses edge status and behaves as a normal STP port. If duplex detection is misleading, override the type with `spanning-tree link-type point-to-point` or `shared`. In `show spanning-tree` the Type column displays these as P2p, Shr and Edge — for example `P2p Edge` for a PortFast port on a full-duplex link.",
    },
    {
      kind: 'diagram',
      title: 'Proposal and agreement',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'sw1', label: 'SW1 (toward root)', icon: 'switch' },
          { id: 'sw2', label: 'SW2', icon: 'switch' },
          { id: 'sw3', label: 'SW3 (downstream)', icon: 'switch' },
        ],
        steps: [
          { from: 'sw1', to: 'sw2', label: 'Proposal', sub: 'new designated port, still discarding' },
          { note: 'SW2 syncs: its non-edge designated ports go to discarding' },
          { from: 'sw2', to: 'sw1', label: 'Agreement', sub: 'sent out SW2\'s new root port', tone: 'accent' },
          { note: 'SW1 port and SW2 root port forward at once — no timers' },
          { from: 'sw2', to: 'sw3', label: 'Proposal', sub: 'the handshake ripples downstream' },
          { from: 'sw3', to: 'sw2', label: 'Agreement', tone: 'accent' },
        ],
      },
      caption: 'Works only on point-to-point (full-duplex) links.',
      notes:
        "This is the mechanism that makes RSTP rapid. When a link between two switches comes up, the upstream switch's port becomes **designated** but starts out **discarding**, and it sends BPDUs with the **proposal** flag set — in effect, 'I am your best path to the root; may I forward?' Before the downstream switch can agree, it must make sure agreeing cannot create a loop, so it performs a **sync**: it puts all of its own non-edge designated ports into discarding. Alternate and backup ports are already discarding, and edge ports are left alone because no switch can be behind them. Now it is safe, so SW2 replies with an **agreement** on its new root port. The upstream port moves to forwarding the moment the agreement arrives, and SW2's root port forwards too — no forward-delay timers at all. SW2's designated ports, which it just blocked, then send their own proposals, and the handshake ripples toward the edge of the network, each step taking milliseconds. This works only on point-to-point links, which is why duplex matters so much to RSTP.",
    },
    {
      kind: 'diagram',
      title: 'Root port failure in Rapid PVST+',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'r1', label: 'Root port fails', sub: 'link down detected', shape: 'pill', tone: 'bad' },
          { id: 'r2', label: 'Alternate → root port', sub: 'no timers' },
          { id: 'r3', label: 'Forwarding', sub: 'immediately' },
          { id: 'r4', label: 'TC BPDUs sent', sub: 'MACs flushed on non-edge ports' },
          { id: 'r5', label: 'Converged', sub: '≈ 1 second', shape: 'round', tone: 'good' },
        ],
      },
      caption: 'Indirect failures are detected after 3 missed hellos (6 s) instead of 20 s max age.',
      notes:
        "Here is what happens when AS1 loses its root port in Rapid PVST+. The switch detects the failure directly — the link goes down — so there is nothing to wait for. Because an **alternate** port already holds valid information about another path to the root, RSTP immediately promotes it to **root port** and moves it straight to **forwarding**. That is a topology change, so AS1 sends BPDUs with the **TC** flag set and flushes the MAC addresses learned on its non-edge ports; its neighbors do the same, so frames for hosts that are now reached over the new path are flooded briefly and relearned. If the failure is indirect — BPDUs stop arriving without any link going down — RSTP needs about **6 seconds** (three missed hellos) to notice, still far better than 802.1D's 20-second max age followed by 30 seconds of listening and learning. For the exam, remember three numbers: 802.1D needs 30–50 s, RSTP typically converges in about a second on point-to-point links, and RSTP ages out a neighbor's information after three missed 2-second hellos.",
    },
    {
      kind: 'cli',
      title: 'Enabling Rapid PVST+',
      code: `DS1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
DS1(config)# spanning-tree mode rapid-pvst
DS1(config)# end
DS1# show spanning-tree summary
Switch is in rapid-pvst mode
Root bridge for: VLAN0010, VLAN0020
Extended system ID           is enabled
Portfast Default             is disabled
PortFast BPDU Guard Default  is disabled
Portfast BPDU Filter Default is disabled
Loopguard Default            is disabled
EtherChannel misconfig guard is enabled
UplinkFast                   is disabled
BackboneFast                 is disabled
Pathcost method used         is short

Name                   Blocking Listening Learning Forwarding STP Active
---------------------- -------- --------- -------- ---------- ----------
VLAN0010                     0         0        0          2          2
VLAN0020                     0         0        0          2          2
---------------------- -------- --------- -------- ---------- ----------
2 vlans                      0         0        0          4          4`,
      highlight: ['spanning-tree mode rapid-pvst', 'Switch is in rapid-pvst mode', 'Root bridge for: VLAN0010, VLAN0020'],
      caption: 'The other mode keywords are `pvst` and `mst`.',
      notes:
        "Rapid PVST+ is one global command: `spanning-tree mode rapid-pvst`; the other choices of the same command are `pvst` and `mst`. Changing the mode restarts spanning tree in every VLAN, so all ports briefly reconverge — plan it for a maintenance window. Because RSTP is backward compatible, you can migrate one switch at a time: a Rapid PVST+ port that hears 802.1D BPDUs from a PVST+ neighbor runs legacy STP on that port, but you only get rapid convergence where both ends run RSTP. `show spanning-tree summary` is the fastest verification. The first line states the mode, `Root bridge for:` lists the VLANs for which this switch is root, the middle lines show global features such as the PortFast defaults and the path cost method, and the table at the bottom counts ports in each state per VLAN. Here DS1 is already root for VLANs 10 and 20 — but only because it happens to have the lowest MAC, which is luck rather than design. The next slides fix that deliberately. In per-VLAN output the protocol line changes from `ieee` to `rstp`.",
    },
    {
      kind: 'cli',
      title: 'Placing the root: root primary and secondary',
      code: `DS1(config)# spanning-tree vlan 10 root primary
DS1(config)# spanning-tree vlan 20 root secondary
DS1(config)# do show running-config | include spanning-tree
spanning-tree mode rapid-pvst
spanning-tree extend system-id
spanning-tree vlan 10 priority 24576
spanning-tree vlan 20 priority 28672

DS2(config)# spanning-tree vlan 20 root primary
DS2(config)# spanning-tree vlan 10 root secondary`,
      highlight: ['spanning-tree vlan 10 priority 24576', 'spanning-tree vlan 20 priority 28672'],
      caption: 'The macro runs once; the running-config stores the resulting priority.',
      notes:
        "Never leave the root election to the lowest MAC. The simplest control is the `root` macro. `spanning-tree vlan 10 root primary` looks at the current root for VLAN 10: if setting this switch to **24576** would make it root, it uses 24576; otherwise it sets its priority **4096 below** the current root's priority. `spanning-tree vlan 10 root secondary` sets **28672**, which beats every switch still at the default 32768, so this switch takes over if the primary fails. Two details are heavily tested. First, the macro runs **once**: the running configuration stores the resulting `spanning-tree vlan 10 priority 24576` line, not the macro, so if someone later adds a switch with priority 20480, the old primary silently loses the election. Second, the usual design places primary and secondary roots on the two distribution switches, mirrored per VLAN group, exactly as the load-sharing slide shows. The running-config also lists `spanning-tree extend system-id`, which is on by default and is the reason displayed priorities include the VLAN number.",
    },
    {
      kind: 'table',
      title: 'What the root macros actually set',
      columns: ['Situation', 'Command', 'Priority written'],
      rows: [
        ['Every switch still at 32768', '`root primary`', '**24576**'],
        ['Current root configured with 16384', '`root primary`', '**12288** (16384 − 4096)'],
        ['Current root configured with 4096', '`root primary`', '**0**'],
        ['Any situation', '`root secondary`', '**28672**'],
        ['You want an exact value', '`spanning-tree vlan 10 priority 8192`', '**8192**'],
      ],
      caption: 'Displayed values add the VLAN: 24576 in VLAN 10 shows as 24586.',
      notes:
        "This table turns the macro rule into numbers. With every switch at the default, `root primary` writes **24576** and `root secondary` writes **28672**. If the current root already has a lower priority — say 16384 — then 24576 would not win, so `root primary` goes 4096 below it and writes **12288**. If the current root sits at 4096, the result is **0**, the lowest possible value. The secondary macro never looks at the current root; it always writes 28672. Because the result depends on what the macro saw at the moment it ran, many engineers prefer explicit values such as `spanning-tree vlan 10 priority 4096` on the primary and `8192` on the secondary: predictable, self-documenting and immune to surprises. Either way, verify with `show spanning-tree vlan 10`: the intended root must show **This bridge is the root**, and every other switch must list that root's MAC in its Root ID section. Remember when reading exhibits that all of these numbers appear with the VLAN ID added.",
    },
    {
      kind: 'cli',
      title: 'Explicit priority, cost and port priority',
      code: `DS1(config)# spanning-tree vlan 30 priority 5000
% Bridge Priority must be in increments of 4096.
% Allowed values are:
  0     4096  8192  12288 16384 20480 24576 28672
  32768 36864 40960 45056 49152 53248 57344 61440
DS1(config)# spanning-tree vlan 30 priority 4096
DS1(config)# interface GigabitEthernet0/2
DS1(config-if)# spanning-tree vlan 30 cost 2
DS1(config-if)# spanning-tree port-priority 64
DS1(config-if)# end
DS1# show spanning-tree interface GigabitEthernet0/2

Vlan                Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
VLAN0010            Desg FWD 4         64.26    P2p
VLAN0020            Desg FWD 4         64.26    P2p
VLAN0030            Desg FWD 2         64.26    P2p`,
      highlight: ['priority 4096', 'cost 2', 'port-priority 64', '64.26'],
      notes:
        "Explicit values give you full control. `spanning-tree vlan 30 priority 4096` sets the bridge priority directly; IOS rejects anything that is not a multiple of 4096 and prints the sixteen allowed values, as the transcript shows. At the interface level, `spanning-tree cost` changes the port's cost in all VLANs, while `spanning-tree vlan 30 cost 2` changes it for one VLAN only — a handy way to steer a single VLAN onto a different path. `spanning-tree port-priority 64` changes the port ID that this switch **advertises**; the range is 0–240 in steps of 16, the default is 128, and lower is preferred. Remember whom it influences: a port-priority change on DS1 Gi0/2 can change which port the **neighbor** selects as its root port, but never DS1's own root port. A cost change, by contrast, directly changes the local switch's root path cost calculation. `show spanning-tree interface Gi0/2` confirms the result per VLAN: Prio.Nbr now reads 64.26 in every VLAN, while the Cost column shows 2 only in VLAN 30.",
    },
    {
      kind: 'diagram',
      title: 'Per-VLAN load sharing',
      diagram: {
        type: 'topology',
        width: 12,
        height: 5.5,
        groups: [
          { label: 'VLAN 10 — DS1 is root', x: 0.2, y: 0.2, w: 5.6, h: 5.1, tone: 'accent' },
          { label: 'VLAN 20 — DS2 is root', x: 6.2, y: 0.2, w: 5.6, h: 5.1 },
        ],
        nodes: [
          { id: 'ds1a', icon: 'switch', label: 'DS1', sub: 'root · 24586', x: 1.4, y: 1.4, tone: 'accent' },
          { id: 'ds2a', icon: 'switch', label: 'DS2', sub: '28682', x: 4.6, y: 1.4 },
          { id: 'as1a', icon: 'switch', label: 'AS1', sub: '32778', x: 3, y: 4.1 },
          { id: 'ds1b', icon: 'switch', label: 'DS1', sub: '28692', x: 7.4, y: 1.4 },
          { id: 'ds2b', icon: 'switch', label: 'DS2', sub: 'root · 24596', x: 10.6, y: 1.4, tone: 'accent' },
          { id: 'as1b', icon: 'switch', label: 'AS1', sub: '32788', x: 9, y: 4.1 },
        ],
        links: [
          { from: 'ds1a', to: 'ds2a' },
          { from: 'ds1a', to: 'as1a', toLabel: 'Gi0/1 RP', tone: 'good' },
          { from: 'ds2a', to: 'as1a', toLabel: 'Gi0/2 ALT', blocked: true },
          { from: 'ds1b', to: 'ds2b' },
          { from: 'ds2b', to: 'as1b', toLabel: 'Gi0/2 RP', tone: 'good' },
          { from: 'ds1b', to: 'as1b', toLabel: 'Gi0/1 ALT', blocked: true },
        ],
      },
      caption: 'Each uplink forwards for one VLAN and backs up the other.',
      notes:
        "With a single tree, AS1's second uplink would sit idle in every VLAN. Per-VLAN spanning tree lets you give each uplink a job. Make **DS1** root primary for VLAN 10 and root secondary for VLAN 20, and configure the mirror image on **DS2**. In VLAN 10, AS1's root port is Gi0/1 toward DS1 and Gi0/2 is an alternate port. In VLAN 20 the roles swap: Gi0/2 toward DS2 forwards and Gi0/1 is the alternate. Both uplinks now carry traffic, each one backs up the other, and the failure of either distribution switch still leaves a working tree in both VLANs. The secondary settings matter too: because each distribution switch has a lower BID than AS1 in both VLANs, the designated port on every AS1 uplink is on the distribution side, so the blocked port always lands on the access switch and the DS1–DS2 link keeps forwarding. In real networks you would also align the HSRP or VRRP active gateway for each VLAN with that VLAN's STP root, so traffic takes the most direct path to its default gateway.",
    },
    {
      kind: 'cli',
      title: 'Reading show spanning-tree on a non-root switch',
      code: `AS1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0019.e86a.6f80
             Cost        4
             Port        25 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     0019.e8aa.0b00
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/5               Desg FWD 19        128.5    P2p Edge
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p`,
      highlight: ['protocol rstp', 'Port        25 (GigabitEthernet0/1)', 'Altn BLK', 'P2p Edge'],
      notes:
        "Read the AS1 output top to bottom. `protocol rstp` confirms Rapid PVST+. The **Root ID** block is the root as AS1 sees it: priority 24586 (24576 + VLAN 10) with DS1's MAC. **Cost 4** is AS1's root path cost, and **Port 25 (GigabitEthernet0/1)** is its root port. The **Bridge ID** block is AS1 itself, still at the default 32768 plus the VLAN. In the port table, Gi0/1 is **Root FWD**, Gi0/2 is **Altn BLK** — an alternate port in the discarding state — and Fa0/5 is **Desg FWD** with type **P2p Edge**, a PortFast access port on a full-duplex link. The Cost column shows each port's own cost, not the root path cost; that distinction is a frequent exam trap, because the root path cost appears only in the Root ID block. Prio.Nbr is the port ID: priority 128 and internal port number 25 for Gi0/1. The timers appear twice — once as received from the root and once as configured locally — and the root's values are the ones actually in use.",
    },
    {
      kind: 'cli',
      title: "The root bridge's view",
      code: `DS1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0019.e86a.6f80
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    24586  (priority 24576 sys-id-ext 10)
             Address     0019.e86a.6f80
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.25   P2p
Gi0/2               Desg FWD 4         128.26   P2p`,
      highlight: ['This bridge is the root', 'priority 24576 sys-id-ext 10'],
      notes:
        "On the root bridge the Root ID and Bridge ID blocks contain the same priority and the same MAC, and the Cost and Port lines are replaced by **This bridge is the root** — the single fastest way to identify the root in an exhibit. Every port on the root is **Desg FWD**; a root bridge showing an alternate or backup port would mean two of its own ports share a segment, which points to a hub or a cabling mistake. The priority line tells you how the switch got there: 24586 = **24576** + 10, the value written by `root primary` when every other switch was at the default. Because the timers in the Root ID block are the root's own, changing `spanning-tree vlan 10 hello-time` or `forward-time` here would change them for the whole VLAN — one reason such tuning, if ever done, belongs on the root. When a switch carries many VLANs, `show spanning-tree root` gives a compact one-line-per-VLAN summary of root IDs, root costs and root ports, and `show spanning-tree bridge` does the same for the local bridge IDs.",
    },
    {
      kind: 'table',
      title: 'Decoding show spanning-tree',
      columns: ['Field', 'Meaning'],
      rows: [
        ['Root ID · Priority / Address', 'BID of the root bridge (priority includes the VLAN)'],
        ['Root ID · Cost', "This switch's **root path cost**"],
        ['Root ID · Port', 'The **root port** (internal number and name)'],
        ['This bridge is the root', 'Replaces Cost and Port on the root bridge'],
        ['Bridge ID', "This switch's own BID, e.g. `priority 32768 sys-id-ext 10`"],
        ['Role', '`Root`, `Desg`, `Altn`, `Back`'],
        ['Sts', '`FWD`, `BLK` (discarding), `LRN`, `BKN` (broken)'],
        ['Cost · Prio.Nbr · Type', 'Port cost · port ID · `P2p`, `Shr`, `Edge`'],
      ],
      notes:
        "Use this table as a checklist whenever an exhibit shows `show spanning-tree`. Start at the top: the **Root ID** block always describes the root bridge, and on a non-root switch its **Cost** line is the local root path cost while its **Port** line names the root port. The **Bridge ID** block always describes the local switch; compare its MAC with the Root ID MAC to know whether you are looking at the root. In the interface table, the Role column uses four-letter abbreviations: Root, Desg, Altn and Back. The Sts column shows FWD, BLK (which includes RSTP discarding), LRN, LIS in classic PVST+, and BKN (broken) when a guard feature or inconsistency has blocked the port — usually followed by a reason such as `*ROOT_Inc` in the Type column. The per-port Cost column changes only with link speed or `spanning-tree cost`. Prio.Nbr combines port priority and internal port number. Type shows P2p, Shr and Edge. With these fields you can answer nearly every STP exhibit question on the exam.",
    },
    {
      kind: 'steps',
      title: 'Troubleshooting: the wrong switch is root',
      steps: [
        { title: 'Find the root for the VLAN', text: '`show spanning-tree vlan 10` — the Root ID address, or "This bridge is the root" on the culprit.' },
        { title: 'Compare with the design', text: 'Is the root a distribution switch, or an access switch with a low MAC?' },
        { title: 'Check every priority', text: 'Bridge ID line on each switch, or `show spanning-tree bridge`.' },
        { title: 'Fix root placement', text: '`root primary` / `root secondary` or explicit priorities on the distribution pair.' },
        { title: 'Protect the design', text: 'Root Guard on distribution downlinks, BPDU Guard on access ports.' },
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.6,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1', sub: 'default · 0019.e86a.6f80', x: 2, y: 1.1 },
          { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'default · 0019.e86b.1200', x: 8, y: 1.1 },
          { id: 'as3', icon: 'switch', label: 'AS3 = root!', sub: 'default · 0001.4201.aa01', x: 5, y: 3.5, tone: 'bad' },
        ],
        links: [
          { from: 'as3', to: 'ds1', fromLabel: 'DP', toLabel: 'RP' },
          { from: 'as3', to: 'ds2', fromLabel: 'DP', toLabel: 'RP' },
          { from: 'ds1', to: 'ds2', label: 'core link blocked', blocked: true, tone: 'bad' },
        ],
      },
      notes:
        "A misplaced root is one of the most common STP problems in real networks and a favorite exam scenario. The symptom is rarely an outage; instead traffic takes strange paths. Here every switch is at the default priority, so the switch with the lowest MAC wins — AS3, an old access switch whose MAC begins 0001. DS1 and DS2 both use their links to AS3 as root ports, and the DS1–DS2 link, the fattest pipe in the building, ends up blocked on DS2 because DS1 has the lower BID. Traffic between the distribution switches now hairpins through a small access switch. It can also happen when a new switch arrives with a low priority left over from a lab. Work it methodically: identify the root for the affected VLAN, compare it with the design, check the Bridge ID priority on each switch, then fix it with `root primary` and `root secondary` or explicit priorities on the distribution pair, and verify that every switch now lists the intended root. Finally, prevent a repeat with the protection features in the next lesson.",
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam traps: Rapid PVST+',
      body: 'Rapid PVST+ = **one RSTP instance per VLAN**. MST is the one that maps many VLANs to a single instance.',
      bullets: [
        '`root primary` writes 24576 **or 4096 below** the current root — once',
        '`root secondary` writes **28672**',
        'Discarding appears as `BLK`; role (Altn/Back) is not the same as state',
        'Alternate = another switch\'s path; backup = same switch, shared segment',
        'Proposal/agreement needs **point-to-point** (full-duplex) links',
        "Port priority changes the **neighbor's** root port choice, not yours",
        '`protocol rstp` = Rapid PVST+; `ieee` = PVST+; `mstp` = MST',
      ],
      notes:
        "These are the Rapid PVST+ traps that appear most often. Know the family: per-VLAN RSTP is Rapid PVST+, while MST maps many VLANs to one instance. The root macros are not magic — `root primary` writes 24576 or 4096 below the current root, `root secondary` writes 28672, and both run once; if a stem says a new switch later arrives with a lower priority, the old root loses. Expect `BLK` for discarding in exhibits, and do not confuse the role (Altn, Back) with the state (BLK). Alternate ports lead to the root through a different switch; backup ports belong to the same switch on a shared segment. Proposal/agreement requires point-to-point links; a half-duplex link shows `Shr` and converges with timers. Port priority is advertised to neighbors, so it changes their root port choice, not yours, while `spanning-tree cost` changes your own calculation. Finally, the protocol line reveals the mode: `rstp` for Rapid PVST+, `ieee` for PVST+ and `mstp` for MST. If an option says RSTP 'uses listening', it is wrong.",
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'STP family: 802.1D, PVST+, 802.1w RSTP, Rapid PVST+, 802.1s MST',
        'RSTP roles: root, designated, alternate, backup, disabled',
        'RSTP states: discarding, learning, forwarding (shown as BLK/LRN/FWD)',
        'Link types: point-to-point, shared, edge; proposal/agreement on p2p only',
        '`spanning-tree mode rapid-pvst`; `root primary` 24576, `root secondary` 28672',
        'Different roots per VLAN = load sharing across both uplinks',
      ],
      notes:
        "Rapid PVST+ combines two ideas: per-VLAN spanning-tree instances from PVST+ and the fast convergence of 802.1w. The election is exactly the one you already know — lowest BID for the root, lowest root path cost for root ports, one designated port per segment. RSTP adds the alternate role (a pre-computed backup path through another switch) and the backup role (a second port on the same shared segment), collapses the states to discarding, learning and forwarding, and replaces timers with a proposal/agreement handshake on point-to-point links, so convergence drops from 30–50 seconds to about one. You enable it with `spanning-tree mode rapid-pvst`, place the root with `root primary` and `root secondary` or explicit multiples of 4096, and steer paths with per-VLAN costs and port priorities. Making different distribution switches root for different VLANs puts both uplinks to work. The next lesson protects this carefully designed tree at the edge with PortFast, BPDU Guard, BPDU Filter, Root Guard and Loop Guard.",
    },
  ],
  flashcards: [
    { id: 'f1', front: 'IEEE 802.1w', back: '**Rapid Spanning Tree Protocol (RSTP)** — same election as 802.1D, convergence in about a second.' },
    { id: 'f2', front: 'IEEE 802.1s', back: '**Multiple Spanning Tree (MST)** — maps groups of VLANs to a small number of STP instances.' },
    { id: 'f3', front: 'PVST+', back: 'Cisco per-VLAN 802.1D: one classic STP instance per VLAN. Shown as `protocol ieee`.' },
    { id: 'f4', front: 'Rapid PVST+', back: 'Cisco per-VLAN RSTP: one 802.1w instance per VLAN. Shown as `protocol rstp`.' },
    { id: 'f5', front: 'Command to enable Rapid PVST+', back: '`spanning-tree mode rapid-pvst` (global configuration). Other modes: `pvst`, `mst`.' },
    { id: 'f6', front: 'Default STP mode on a Catalyst 2960 (classic IOS)', back: '**PVST+**. Many newer IOS XE switches default to Rapid PVST+ — check `show spanning-tree summary`.' },
    { id: 'f7', front: 'RSTP port states', back: '**Discarding**, **learning**, **forwarding**.' },
    { id: 'f8', front: '802.1D states merged into RSTP discarding', back: 'Disabled, blocking and listening.' },
    { id: 'f9', front: 'RSTP port roles', back: 'Root, designated, alternate, backup, disabled.' },
    { id: 'f10', front: 'Alternate port', back: 'Discarding port with a backup path to the root through a **different switch**; it becomes the root port immediately if the root port fails.' },
    { id: 'f11', front: 'Backup port', back: "Discarding port backing up the **same switch's** designated port on a shared segment (e.g. two ports on one hub)." },
    { id: 'f12', front: 'RSTP link types', back: '**Point-to-point** (full duplex), **shared** (half duplex), **edge** (PortFast).' },
    { id: 'f13', front: 'Where does proposal/agreement work?', back: 'Only on **point-to-point** links — full duplex between two switches.' },
    { id: 'f14', front: 'RSTP sync', back: 'On receiving a proposal, a switch moves its non-edge designated ports to discarding, then sends the agreement.' },
    { id: 'f15', front: 'RSTP neighbor-loss detection', back: 'Three missed hellos: 3 × 2 s = **6 s** (802.1D waits 20 s max age).' },
    { id: 'f16', front: 'Which switches send BPDUs in RSTP?', back: '**Every** switch, every hello (2 s) — BPDUs act as keepalives. In 802.1D only the root originates them.' },
    { id: 'f17', front: '`spanning-tree vlan 10 root primary`', back: 'Sets priority **24576**, or 4096 below the current root if 24576 would not win. A one-time macro.' },
    { id: 'f18', front: '`spanning-tree vlan 10 root secondary`', back: 'Sets priority **28672**.' },
    { id: 'f19', front: 'What the running-config stores after `root primary`', back: 'The resulting priority, e.g. `spanning-tree vlan 10 priority 24576` — not the macro itself.' },
    { id: 'f20', front: 'Set an exact bridge priority for VLAN 10', back: '`spanning-tree vlan 10 priority 4096` — multiples of 4096 from 0 to 61440.' },
    { id: 'f21', front: 'Interface STP cost commands', back: '`spanning-tree cost <n>` for all VLANs, or `spanning-tree vlan <id> cost <n>` for one VLAN.' },
    { id: 'f22', front: 'Port priority command and values', back: '`spanning-tree [vlan <id>] port-priority <0-240>` in steps of 16; default **128**; lower is preferred.' },
    { id: 'f23', front: 'Whom does a port-priority change influence?', back: "The **neighbor's** root port choice (via the sender port ID) — never the local switch's own root port." },
    { id: 'f24', front: 'Per-VLAN load sharing', back: 'Make DS1 root for some VLANs and DS2 root for others, so each uplink forwards for part of the VLANs and backs up the rest.' },
    { id: 'f25', front: '"This bridge is the root"', back: 'Appears in the Root ID section of `show spanning-tree` on the root bridge, replacing the Cost and Port lines.' },
    { id: 'f26', front: '`Altn BLK` in rapid-pvst output', back: 'An alternate port in the discarding state — IOS displays discarding as **BLK**.' },
    { id: 'f27', front: 'Port type `P2p Edge`', back: 'An edge (PortFast) port on a full-duplex, point-to-point link.' },
    { id: 'f28', front: '`show spanning-tree summary`', back: 'Shows the STP mode, the VLANs this switch is root for, global defaults and port-state counts per VLAN.' },
    { id: 'f29', front: 'RSTP with a legacy 802.1D neighbor', back: 'Compatible: the port falls back to 802.1D behavior for that neighbor and loses rapid convergence on that link.' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'Which RSTP port state replaces the 802.1D blocking and listening states?',
      options: ['Discarding', 'Learning', 'Disabled', 'Backup'],
      answer: 0,
      difficulty: 1,
      explanation:
        'RSTP merges disabled, blocking and listening into **discarding**. Learning still exists as its own state, "disabled" is not an RSTP state name, and backup is a port **role**, not a state.',
    },
    {
      id: 'q2',
      type: 'multi',
      stem: 'Which two RSTP port roles are in the discarding state in a stable topology? (Choose two.)',
      options: ['Alternate', 'Backup', 'Root', 'Designated', 'Edge'],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        '**Alternate** and **backup** ports are pre-computed standby ports and discard frames. Root and designated ports forward. "Edge" is a link type created by PortFast, not a role — and edge ports forward.',
    },
    {
      id: 'q3',
      type: 'input',
      stem: 'Which bridge priority value does `spanning-tree vlan 10 root secondary` configure?',
      answers: ['28672'],
      placeholder: 'priority',
      difficulty: 1,
      explanation: '`root secondary` always writes **28672**, which beats switches left at the default 32768 but loses to a primary root at 24576 or lower. In VLAN 10 it displays as 28682.',
    },
    {
      id: 'q4',
      type: 'match',
      stem: 'Match each standard or protocol to its description.',
      pairs: [
        { left: '802.1D', right: 'Original STP with one tree for all VLANs' },
        { left: '802.1w', right: 'Rapid STP' },
        { left: '802.1s', right: 'MST: VLANs mapped to a few instances' },
        { left: 'Rapid PVST+', right: 'Cisco per-VLAN RSTP' },
      ],
      difficulty: 1,
      explanation:
        '802.1D is classic STP, 802.1w is RSTP, 802.1s is MST, and Rapid PVST+ is Cisco\'s per-VLAN implementation of RSTP (PVST+ is the per-VLAN version of 802.1D).',
    },
    {
      id: 'q5',
      type: 'single',
      stem: 'Which global configuration command enables Rapid PVST+ on a Catalyst switch?',
      options: ['`spanning-tree mode rapid-pvst`', '`spanning-tree mode rstp`', '`spanning-tree rapid-pvst enable`', '`spanning-tree mode pvst`'],
      answer: 0,
      difficulty: 1,
      explanation:
        'The keywords of `spanning-tree mode` are `pvst`, `rapid-pvst` and `mst`, so **`spanning-tree mode rapid-pvst`** is correct. There is no `rstp` keyword or `enable` form, and `pvst` selects classic PVST+.',
    },
    {
      id: 'q6',
      type: 'single',
      stem: 'In `show spanning-tree vlan 10`, where does the text "This bridge is the root" appear?',
      options: [
        'In the Root ID section, replacing the Cost and Port lines',
        'In the Bridge ID section, replacing the Address line',
        'In the interface table, in the Role column',
        'Only in the output of `show spanning-tree summary`',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'A root bridge has no root path cost and no root port, so IOS replaces those two **Root ID** lines with "This bridge is the root". The Bridge ID section still shows the local priority and MAC, and the Role column uses Root/Desg/Altn/Back.',
    },
    {
      id: 'q7',
      type: 'categorize',
      stem: 'Classify each port by its RSTP link type.',
      categories: ['Point-to-point', 'Shared', 'Edge'],
      items: [
        { text: 'Full-duplex uplink between two switches', category: 0 },
        { text: 'Half-duplex port connected to a hub', category: 1 },
        { text: 'PortFast access port connected to a PC', category: 2 },
        { text: 'Port configured with `spanning-tree link-type shared`', category: 1 },
        { text: 'PortFast port connected to a printer', category: 2 },
      ],
      difficulty: 2,
      explanation:
        'Full duplex implies **point-to-point**, half duplex (or the explicit `link-type shared` command) implies **shared**, and PortFast makes a port an **edge** port regardless of what end device is attached.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Refer to the exhibit. Which statement is true?',
      exhibit: {
        kind: 'cli',
        text: `AS1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0019.e86a.6f80
             Cost        4
             Port        25 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     0019.e8aa.0b00
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/5               Desg FWD 19        128.5    P2p Edge
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p`,
      },
      options: [
        "AS1's root path cost is 4, and Gi0/2 would take over as root port almost immediately if Gi0/1 failed",
        'Gi0/2 is discarding because it is a backup port for Fa0/5',
        'The root bridge for VLAN 10 was configured with priority 24586',
        'Fa0/5 connects to another switch over a point-to-point link',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'The Root ID Cost line shows a root path cost of **4**, and Gi0/2 is an **alternate** port — a pre-computed path to the root through another switch that RSTP promotes to root port without timers. A backup port would show `Back` and needs a shared segment. The configured root priority was 24576 (24586 includes VLAN 10). `P2p Edge` marks a PortFast port toward an end device, not a switch.',
    },
    {
      id: 'e2',
      type: 'multi',
      stem: 'Refer to the exhibit. Which two commands could have produced this bridge priority on DS2? (Choose two.)',
      exhibit: {
        kind: 'cli',
        text: `DS2# show spanning-tree vlan 10 | begin Bridge ID
  Bridge ID  Priority    28682  (priority 28672 sys-id-ext 10)
             Address     0019.e86b.1200
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec`,
      },
      options: [
        '`spanning-tree vlan 10 root secondary`',
        '`spanning-tree vlan 10 priority 28672`',
        '`spanning-tree vlan 10 priority 28682`',
        '`spanning-tree vlan 10 root primary`',
        '`spanning-tree vlan 1 priority 28672`',
      ],
      answers: [0, 1],
      difficulty: 3,
      explanation:
        'The configured priority is **28672**, which is exactly what `root secondary` writes, and the explicit `priority 28672` command sets the same value. 28682 is only the displayed sum and is rejected because it is not a multiple of 4096. `root primary` writes 24576 or a value 4096 below the current root — never 28672. The VLAN 1 command would not change VLAN 10.',
    },
    {
      id: 'e3',
      type: 'input',
      stem: 'Refer to the exhibit. The engineer now enters `spanning-tree vlan 10 root primary` on DS1. Which priority value will DS1 configure for VLAN 10? (Enter the configured value, not the displayed one.)',
      exhibit: {
        kind: 'cli',
        text: `DS1# show spanning-tree vlan 10 | include Priority|Address
  Root ID    Priority    16394
             Address     0019.e8ff.1a00
  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     0019.e86a.6f80`,
      },
      answers: ['12288'],
      placeholder: 'priority',
      difficulty: 3,
      explanation:
        'The current root is configured with 16394 − 10 = **16384**. Because 24576 would not beat it, `root primary` sets DS1 to 4096 below the current root: 16384 − 4096 = **12288** (displayed as 12298 in VLAN 10). Answering 24576 ignores the "4096 below" rule.',
    },
    {
      id: 'e4',
      type: 'single',
      stem: 'Which RSTP port role backs up a designated port when two ports of the same switch connect to the same shared segment?',
      options: ['Backup', 'Alternate', 'Root', 'Edge'],
      answer: 0,
      difficulty: 1,
      explanation:
        'A **backup** port receives better BPDUs from its own switch on a shared segment such as a hub. An alternate port backs up the root port through a *different* switch, the root port is the best path to the root, and edge is a PortFast link type rather than a role.',
    },
    {
      id: 'e5',
      type: 'multi',
      stem: 'Which two statements about the RSTP proposal/agreement process are true? (Choose two.)',
      options: [
        'It is used only on point-to-point links',
        'The downstream switch moves its non-edge designated ports to discarding before it agrees',
        'It waits two forward-delay intervals before the port forwards',
        'It is the normal mechanism on half-duplex links to a hub',
        'Edge ports are moved to discarding during the sync',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Proposal/agreement runs only on **point-to-point** links, and the receiving switch performs a **sync** — blocking its non-edge designated ports — before it sends the agreement, which guarantees no loop. The whole point is to avoid forward-delay waits. Shared (half-duplex) links fall back to timers, and edge ports are left forwarding during a sync because no switch can be behind them.',
    },
    {
      id: 'e6',
      type: 'match',
      stem: 'Match each description to the spanning-tree variant.',
      pairs: [
        { left: 'Runs one 802.1D instance per VLAN', right: 'PVST+' },
        { left: 'Runs one 802.1w instance per VLAN', right: 'Rapid PVST+' },
        { left: 'Maps groups of VLANs to a few instances', right: 'MST (802.1s)' },
        { left: 'One tree for all VLANs with 30–50 s convergence', right: 'STP (802.1D)' },
      ],
      difficulty: 1,
      explanation:
        '**PVST+** is per-VLAN 802.1D, **Rapid PVST+** is per-VLAN RSTP (802.1w), **MST** groups VLANs into instances, and plain **802.1D** builds one common tree with timer-based convergence.',
    },
    {
      id: 'e7',
      type: 'single',
      stem: 'Refer to the exhibit. The priorities shown are the values displayed in each VLAN, and all links are 1 Gbps. Which port is in the discarding state for VLAN 20?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'ds1', icon: 'switch', label: 'DS1', sub: 'V10 24586 · V20 28692', x: 2, y: 1.2 },
            { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'V10 28682 · V20 24596', x: 8, y: 1.2 },
            { id: 'as1', icon: 'switch', label: 'AS1', sub: 'V10 32778 · V20 32788', x: 5, y: 3.9 },
          ],
          links: [
            { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1' },
            { from: 'ds1', to: 'as1', fromLabel: 'Gi0/2', toLabel: 'Gi0/1' },
            { from: 'ds2', to: 'as1', fromLabel: 'Gi0/2', toLabel: 'Gi0/2' },
          ],
        },
      },
      options: ['AS1 Gi0/1', 'AS1 Gi0/2', 'DS1 Gi0/2', 'DS1 Gi0/1'],
      answer: 0,
      difficulty: 3,
      explanation:
        'In VLAN 20, **DS2** is root (24596). AS1\'s root port is Gi0/2 (direct, cost 4) and DS1\'s root port is its Gi0/1 (direct, cost 4). On the DS1–AS1 link both switches advertise a root cost of 4, so the lower BID wins: DS1 (28692) beats AS1 (32788), making DS1 Gi0/2 designated and **AS1 Gi0/1** an alternate, discarding port. AS1 Gi0/2 would be the answer for VLAN 10, where DS1 is root.',
    },
    {
      id: 'e8',
      type: 'single',
      stem: 'An engineer configures `spanning-tree vlan 10 priority 4096` on DS1. What does the Bridge ID section of `show spanning-tree vlan 10` display?',
      options: [
        '`Priority 4106 (priority 4096 sys-id-ext 10)`',
        '`Priority 4096 (priority 4096 sys-id-ext 10)`',
        '`Priority 4106 (priority 4106 sys-id-ext 0)`',
        '`Priority 32778 (priority 32768 sys-id-ext 10)`',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'The displayed priority is the configured value plus the extended system ID: 4096 + 10 = **4106**, followed by the breakdown `(priority 4096 sys-id-ext 10)`. The display never omits the VLAN, the breakdown never shows sys-id-ext 0 for VLAN 10, and 32778 would be the unconfigured default.',
    },
    {
      id: 'e9',
      type: 'single',
      stem: 'Refer to the exhibit. What is the most likely reason that Fa0/2 has the backup role?',
      exhibit: {
        kind: 'cli',
        text: `SW4# show spanning-tree vlan 1 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/1               Desg FWD 19        128.1    Shr
Fa0/2               Back BLK 19        128.2    Shr
Gi0/1               Root FWD 4         128.25   P2p`,
      },
      options: [
        'Fa0/1 and Fa0/2 connect to the same hub, and Fa0/1 won the designated role with the lower port ID',
        'Fa0/2 provides an alternate path to the root through a different switch',
        'Fa0/2 is a PortFast edge port connected to a PC',
        'Fa0/2 received a superior BPDU from the root bridge and is waiting for max age',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '`Shr` means half duplex, which suggests a hub, and **Back** means the port hears better BPDUs from its **own** switch: SW4 sends BPDUs out Fa0/1 (128.1), they return on Fa0/2 (128.2), and the lower port ID keeps Fa0/1 designated. A path through a different switch would be `Altn`, an edge port would show `Edge`, and RSTP does not park ports waiting for max age.',
    },
    {
      id: 'e10',
      type: 'order',
      stem: 'Put the RSTP proposal/agreement steps in order for a newly connected point-to-point link.',
      items: [
        'The upstream switch sends a proposal on its new designated port',
        'The downstream switch syncs, moving its non-edge designated ports to discarding',
        'The downstream switch sends an agreement out its root port',
        'The upstream designated port moves to forwarding',
        'The downstream switch sends proposals out its own designated ports',
      ],
      difficulty: 2,
      explanation:
        'Proposal → sync → agreement → forwarding on the upstream side, and then the handshake repeats one hop further downstream from the ports that were just synced. No step waits for forward delay.',
    },
    {
      id: 'e11',
      type: 'single',
      stem: 'DS1 is the root bridge for VLAN 10 (priority 24576). Which command on DS2 makes DS2 take over as root only if DS1 fails?',
      options: [
        '`spanning-tree vlan 10 root secondary`',
        '`spanning-tree vlan 10 root primary`',
        '`spanning-tree vlan 10 priority 0`',
        '`spanning-tree vlan 10 port-priority 16`',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        '`root secondary` sets **28672**: higher than DS1\'s 24576, so DS1 stays root, but lower than the default 32768, so DS2 wins when DS1 disappears. `root primary` or priority 0 would make DS2 root immediately, and port-priority changes the port ID, not the bridge ID.',
    },
    {
      id: 'e12',
      type: 'categorize',
      stem: 'Classify each item as part of 802.1D only, RSTP only, or both.',
      categories: ['802.1D only', 'RSTP only', 'Both'],
      items: [
        { text: 'Listening state', category: 0 },
        { text: 'Discarding state', category: 1 },
        { text: 'Proposal/agreement handshake', category: 1 },
        { text: 'Backup port role', category: 1 },
        { text: 'Learning state', category: 2 },
        { text: 'Root bridge elected by lowest bridge ID', category: 2 },
      ],
      difficulty: 2,
      explanation:
        'Listening exists only in 802.1D. Discarding, proposal/agreement and the backup role were introduced by RSTP. Both protocols have a learning state and elect the root by the lowest bridge ID — the election is unchanged.',
    },
    {
      id: 'e13',
      type: 'single',
      stem: 'Refer to the exhibit. The switch runs Rapid PVST+. The cable on Gi0/1 is unplugged. What happens next?',
      exhibit: {
        kind: 'cli',
        text: `AS2# show spanning-tree vlan 30 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/7               Desg FWD 19        128.7    P2p Edge
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p`,
      },
      options: [
        'Gi0/2 becomes the root port and moves to forwarding almost immediately',
        'Gi0/2 moves through listening and learning and forwards after about 30 seconds',
        'Gi0/2 waits 20 seconds for max age and forwards after about 50 seconds',
        'Fa0/7 becomes the root port because it is already forwarding',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Gi0/2 is an **alternate** port, so RSTP immediately promotes it to root port and forwarding when the root port link goes down. The 30 s and 50 s behaviors belong to classic 802.1D. Fa0/7 is an edge port toward an end device and cannot lead to the root.',
    },
    {
      id: 'e14',
      type: 'single',
      stem: 'Which interface command changes the STP cost of a port for VLAN 30 only?',
      options: [
        '`spanning-tree vlan 30 cost 10`',
        '`spanning-tree cost 10`',
        '`spanning-tree vlan 30 port-priority 10`',
        '`spanning-tree vlan 30 priority 10`',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        '**`spanning-tree vlan 30 cost 10`** changes the cost in VLAN 30 only. `spanning-tree cost 10` affects every VLAN on the port, port-priority changes the port ID (and 10 is not a multiple of 16), and `spanning-tree vlan 30 priority` is the global bridge-priority command.',
    },
    {
      id: 'e15',
      type: 'multi',
      stem: 'Refer to the exhibit. SW1 is the root bridge for VLAN 1 (priority 24577), and SW2 currently uses Gi0/1 as its root port. The engineer wants SW2 to use Gi0/2 instead. Which two changes achieve this? (Choose two.)',
      exhibit: {
        kind: 'table',
        columns: ['Link', 'SW1 port ID', 'SW2 port', 'Speed'],
        rows: [
          ['SW1 Gi0/1 – SW2 Gi0/1', '128.25', 'Gi0/1 (root port)', '1 Gbps'],
          ['SW1 Gi0/2 – SW2 Gi0/2', '128.26', 'Gi0/2 (alternate)', '1 Gbps'],
        ],
      },
      options: [
        'On SW2 Gi0/2: `spanning-tree vlan 1 cost 2`',
        'On SW2 Gi0/2: `spanning-tree vlan 1 port-priority 64`',
        'On SW1 Gi0/2: `spanning-tree vlan 1 port-priority 64`',
        'On SW1: `spanning-tree vlan 1 root primary`',
        'On SW2: `spanning-tree vlan 1 priority 4096`',
      ],
      answers: [0, 2],
      difficulty: 3,
      explanation:
        'Lowering the **cost of SW2 Gi0/2** to 2 makes its root path cost 2 instead of 4, so it wins on the first criterion. Lowering the **port priority on SW1 Gi0/2** makes SW2 receive sender port ID 64.26, which beats 128.25 on the sender-port-ID tie-breaker. SW2\'s own port priority is never compared for its root port. SW1 is already root, so `root primary` changes nothing. Priority 4096 on SW2 would make SW2 the root, leaving it with no root port at all.',
    },
    {
      id: 'e16',
      type: 'single',
      stem: 'What is the main advantage of MST (802.1s) compared with Rapid PVST+?',
      options: [
        'It maps many VLANs to a few instances, reducing CPU and BPDU overhead',
        'It is the only variant that allows different root bridges for different VLANs',
        'It removes the need to elect a root bridge',
        'It converges much faster than any RSTP-based protocol',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'MST groups VLANs into a small number of instances, so a switch runs a handful of trees instead of one per VLAN. Rapid PVST+ also allows per-VLAN roots, every variant elects a root, and MST uses RSTP mechanics, so its convergence is comparable rather than faster.',
    },
    {
      id: 'e17',
      type: 'single',
      stem: 'Which Cisco spanning-tree mode runs a separate IEEE 802.1w instance for each VLAN?',
      options: ['Rapid PVST+', 'PVST+', 'MST', 'CST'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Rapid PVST+** is per-VLAN RSTP (802.1w). PVST+ runs per-VLAN 802.1D, MST maps VLANs to shared instances, and CST is the single common tree of plain 802.1D.',
    },
    {
      id: 'e18',
      type: 'input',
      stem: 'Enter the global configuration command that enables Rapid PVST+ on a Catalyst switch.',
      answers: ['spanning-tree mode rapid-pvst'],
      placeholder: 'command',
      difficulty: 1,
      explanation: 'The command is **`spanning-tree mode rapid-pvst`**. The same command accepts `pvst` and `mst` for the other modes.',
    },
    {
      id: 'e19',
      type: 'single',
      stem: 'Refer to the exhibit. The design calls for distribution switch DS1 to be the root for VLAN 10, but access switch AS3 is the root. What is the most likely cause, and which action fixes it?',
      exhibit: {
        kind: 'cli',
        text: `AS3# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             Address     0001.4201.aa01
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     0001.4201.aa01
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/3               Desg FWD 19        128.3    P2p Edge
Gi0/1               Desg FWD 4         128.25   P2p
Gi0/2               Desg FWD 4         128.26   P2p`,
      },
      options: [
        'All switches use the default priority and AS3 has the lowest MAC; configure `spanning-tree vlan 10 root primary` on DS1',
        'AS3 has a lower configured priority; configure `spanning-tree vlan 10 root secondary` on AS3',
        'AS3 runs Rapid PVST+ while DS1 runs PVST+; configure `spanning-tree mode mst` on DS1',
        'AS3 has lower-cost uplinks; configure `spanning-tree cost 19` on AS3 Gi0/1',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'AS3 is at the **default** priority (32768 + 10) yet is root, so no switch has a lower priority and AS3 wins on its very low MAC (0001…). Setting `root primary` (or an explicit low priority) on DS1 fixes it. AS3\'s priority is not lowered — and `root secondary` on AS3 would make things worse. A mode mismatch does not choose the root, and port costs never influence root election.',
    },
    {
      id: 'e20',
      type: 'multi',
      stem: 'Which two statements about Rapid PVST+ are true? (Choose two.)',
      options: [
        'It runs a separate RSTP instance for each VLAN',
        'It interoperates with 802.1D neighbors by falling back to legacy STP on those ports',
        'It maps several VLANs into a single spanning-tree instance',
        'It moves ports through the listening state before learning',
        'It requires every switch to use the same bridge priority',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Rapid PVST+ is **per-VLAN RSTP** and is **backward compatible**, reverting to 802.1D behavior on ports that hear legacy BPDUs. Grouping VLANs into instances is MST, RSTP has no listening state, and bridge priorities are expected to differ — that is how you choose the root.',
    },
    {
      id: 'e21',
      type: 'match',
      stem: 'Match each field of `show spanning-tree vlan 10` to its meaning.',
      pairs: [
        { left: 'Cost (Root ID section)', right: "The switch's root path cost" },
        { left: 'Port (Root ID section)', right: 'The root port' },
        { left: 'sys-id-ext', right: 'The VLAN number added to the priority' },
        { left: 'Prio.Nbr', right: 'Port priority and port number (port ID)' },
        { left: 'Type P2p Edge', right: 'A PortFast port on a full-duplex link' },
      ],
      difficulty: 2,
      explanation:
        'The Root ID Cost and Port lines give the local root path cost and root port; sys-id-ext is the VLAN; Prio.Nbr is the port ID; and `P2p Edge` means an edge (PortFast) port on a point-to-point link. The per-port Cost column, by contrast, is only that port\'s own cost.',
    },
    {
      id: 'e22',
      type: 'single',
      stem: 'In `show spanning-tree` output from a switch running Rapid PVST+, which Sts value is shown for a port in the RSTP discarding state?',
      options: ['BLK', 'LIS', 'LRN', 'BKN'],
      answer: 0,
      difficulty: 1,
      explanation:
        'IOS keeps the classic abbreviation **BLK** for discarding ports. LRN is learning, LIS is the 802.1D listening state, and BKN (broken) marks a port blocked by an inconsistency such as Root Guard.',
    },
  ],
};

export default lesson;
