import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'stp-fundamentals',
  slides: [
    {
      kind: 'title',
      title: 'STP Fundamentals',
      subtitle: 'How 802.1D turns a redundant switched mesh into one loop-free tree',
      notes:
        "Redundant links between switches are essential — one cut cable should never isolate a floor of users — but in a switched LAN every redundant path also creates a **Layer 2 loop**. The **Spanning Tree Protocol** (STP, IEEE **802.1D**) fixes this by electing a single **root bridge**, choosing each switch's best path toward it, and **blocking** every other port that would complete a loop. In this deck you will see why loops are so destructive, what a BPDU and a bridge ID contain, how the root bridge, root ports and designated ports are chosen, which port costs and timers apply, and you will solve a complete election on a three-switch triangle. The material maps to v1.1 exam topics 2.5.a and 2.5.b and is tested just as heavily in v2.0 domain 2 (Switching and Network Access).",
    },
    {
      kind: 'bullets',
      title: 'Redundant links create Layer 2 loops',
      bullets: [
        'Redundant links keep users connected when a cable or switch fails',
        'Switches **flood** broadcasts, multicasts and unknown unicasts out every other port',
        'In a physical loop, a flooded frame comes back around — and is flooded again',
        'Ethernet has **no TTL**, so nothing ever retires the looping copies',
        '==Without STP, a single broadcast can saturate every link in seconds==',
      ],
      diagram: {
        type: 'topology',
        width: 8,
        height: 5,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC-A', x: 0.9, y: 1.4 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.5, y: 1.1 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 2.2, y: 3.9 },
          { id: 'sw3', icon: 'switch', label: 'SW3', x: 6.8, y: 3.9 },
        ],
        links: [
          { from: 'pc', to: 'sw2', label: 'ARP broadcast', arrow: 'forward' },
          { from: 'sw2', to: 'sw1', arrow: 'both', tone: 'bad' },
          { from: 'sw1', to: 'sw3', arrow: 'both', tone: 'bad' },
          { from: 'sw3', to: 'sw2', arrow: 'both', tone: 'bad' },
        ],
        annotations: [{ x: 4.5, y: 2.9, text: 'copies circle in both directions', tone: 'bad' }],
      },
      notes:
        "Picture three switches cabled in a triangle so that any single link can fail without isolating anyone. Now PC-A sends one ARP request — a **broadcast**. SW2 floods it out every port except the one it arrived on, so one copy goes to SW1 and another to SW3. SW1 floods its copy to SW3, SW3 floods its copy to SW1, and each then floods again toward SW2, which floods to the others once more. Two copies now circle the triangle in opposite directions, and every host in the VLAN receives a fresh copy on every lap. Switches are designed to be transparent: they do not modify the frame, and an Ethernet frame carries **no Time-To-Live** or hop count, so nothing ever retires the looping copies. New broadcasts join the old ones until links run at 100% and switch CPUs are overwhelmed. Remember the root cause in one phrase: **redundant Layer 2 paths + flooding + no TTL**. STP keeps the physical redundancy while removing the logical loop.",
    },
    {
      kind: 'definitions',
      title: 'What a loop does to a switched network',
      terms: [
        { term: 'Broadcast storm', def: 'Looping broadcasts multiply until links and switch CPUs are saturated; the LAN effectively stops working.' },
        { term: 'MAC table instability', def: 'Copies of one source MAC arrive on different ports, so the MAC table entry **flaps** between them.' },
        { term: 'Duplicate frames', def: 'Flooded unicast frames reach the destination several times over different paths.' },
        { term: 'No TTL in Ethernet', def: 'The Ethernet header has no hop count, so a looping frame is never discarded.' },
      ],
      notes:
        "These are the three classic loop symptoms Cisco expects you to name. A **broadcast storm** is the most visible: looping broadcasts accumulate until the links are saturated, applications time out, and switch CPUs spike because broadcasts such as ARP requests for the management SVI must be processed in software. **MAC address table instability** is subtler: a switch learns source MACs from incoming frames, so when copies of PC-A's frame arrive alternately on Gi0/1 and Gi0/2, the entry for PC-A keeps moving between ports — Catalyst switches log `%SW_MATM-4-MACFLAP_NOTIF` messages when they detect this flapping — and frames for PC-A are sent the wrong way. **Duplicate frames** occur when a unicast for an unknown destination is flooded around the loop and the host receives several copies. All three share one root cause: Ethernet has **no TTL**. Compare IPv4, whose TTL makes a routing loop die after at most 255 hops and generates ICMP Time Exceeded messages. A Layer 2 loop produces no such messages — a useful clue when an exam question asks you to tell a switching loop from a routing loop.",
    },
    {
      kind: 'bullets',
      title: "STP's job: exactly one active path",
      bullets: [
        'STP logically **blocks** just enough ports to break every loop',
        'Cables stay connected — a blocked port still **receives BPDUs**',
        'Result: a loop-free **tree** rooted at one switch per VLAN',
        'If an active link fails, STP **unblocks** a backup port',
        'Standardized as **IEEE 802.1D**; hosts never take part',
      ],
      diagram: {
        type: 'topology',
        width: 8,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'root bridge', x: 4, y: 1.1, tone: 'accent' },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 1.8, y: 3.9 },
          { id: 'sw3', icon: 'switch', label: 'SW3', x: 6.2, y: 3.9 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', tone: 'good' },
          { from: 'sw1', to: 'sw3', tone: 'good' },
          { from: 'sw2', to: 'sw3', label: 'BPDUs only', blocked: true, style: 'dashed' },
        ],
      },
      notes:
        "STP does not remove cables — it removes **logical** paths. Each switch runs the algorithm and decides, port by port, whether that port forwards user frames or discards them. The goal is a **tree**: exactly one active path between any two switches, with every redundant path held in reserve. A blocked port is still very much alive: it keeps **receiving BPDUs** from its neighbor, which is how the switch knows the backup path is usable and how it notices when the active path breaks. When a failure occurs, STP recalculates and moves a blocked port to forwarding so the tree reconnects. The algorithm was invented by Radia Perlman at DEC and standardized as **IEEE 802.1D**; Cisco's PVST+ and Rapid PVST+, covered in the next lesson, are built on the same election. End hosts never participate — they neither send nor understand BPDUs. In the diagram, SW3's end of the SW2–SW3 link is the single port that must block to break the triangle; the rest of this deck explains exactly why that port is chosen.",
    },
    {
      kind: 'diagram',
      title: 'Inside a configuration BPDU',
      diagram: {
        type: 'header',
        layout: 'line',
        unit: 'bytes',
        fields: [
          { label: 'Proto · Ver · Type · Flags', size: 5, tone: 'muted' },
          { label: 'Root BID', size: 8, tone: 'accent' },
          { label: 'Root path cost', size: 4, tone: 'accent' },
          { label: 'Sender BID', size: 8 },
          { label: 'Sender port ID', size: 2 },
          { label: 'Timers', size: 8, tone: 'muted', sub: 'msg age · max age · hello · fwd delay' },
        ],
        caption: 'Four fields are compared, in order: root BID, root path cost, sender BID, sender port ID.',
      },
      caption: 'Lower is better in every field that STP compares.',
      notes:
        "Switches exchange STP information in **Bridge Protocol Data Units (BPDUs)**, sent as Ethernet frames to the reserved multicast MAC `0180.c200.0000` (Cisco's per-VLAN BPDUs use a Cisco multicast address instead, but the logic is identical). The normal message is the 35-byte **configuration BPDU**. Four fields do all the work: the **root bridge ID** the sender believes in, the sender's **root path cost**, the **sender's own bridge ID** and the **sender port ID**. When a switch compares two BPDUs it checks those fields in exactly that order, and the **lower value wins** at each step; a BPDU that wins is called **superior**. In classic 802.1D the root originates a configuration BPDU every **hello time** (2 s), and each other switch sends its own updated BPDU out its designated ports whenever one arrives on its root port. The timer fields carry the root's hello, max age and forward delay values, so the whole tree runs on the root's timers. A second type, the **Topology Change Notification (TCN)** BPDU, travels toward the root after a port changes state so that switches can flush stale MAC entries quickly.",
    },
    {
      kind: 'diagram',
      title: 'The bridge ID: 8 bytes',
      diagram: {
        type: 'header',
        layout: 'line',
        unit: 'bits',
        fields: [
          { label: 'Priority', size: 4, tone: 'accent', sub: 'steps of 4096' },
          { label: 'Extended system ID', size: 12, sub: 'VLAN number' },
          { label: 'MAC address', size: 48, sub: 'switch base MAC' },
        ],
        caption: 'The 16-bit priority field = configured priority + VLAN ID; the MAC breaks ties.',
      },
      notes:
        "Every switch has an 8-byte **bridge ID (BID)**. The last 6 bytes are a MAC address from the switch's pool of base MACs. The first 2 bytes are the priority field — but since the 802.1t amendment only the top **4 bits** are a true priority, and the lower **12 bits** hold the **extended system ID**, which Cisco fills with the **VLAN number**. That lets one physical switch present a different BID in every VLAN without burning a separate MAC per VLAN. Because the bottom 12 bits are taken, the priority you configure can only change the top 4 bits, so it moves in steps of **4096** (2 to the 12th): 0, 4096, 8192 and so on up to 61440 — sixteen possible values. The default is **32768**, which is simply the top bit set. When switches compare BIDs, the full 8 bytes are treated as one number, so a lower priority always beats any MAC, and the MAC decides only between switches with identical priority fields. Exam items often show priority and MAC separately and ask which switch wins: compare the priority first, then the MAC digit by digit from the left in hex.",
    },
    {
      kind: 'table',
      title: 'Priority + VLAN = the number you see',
      columns: ['Configured priority', 'VLAN', 'Priority field', 'As shown by `show spanning-tree`'],
      rows: [
        ['32768 (default)', '1', '**32769**', '`32769 (priority 32768 sys-id-ext 1)`'],
        ['32768 (default)', '10', '**32778**', '`32778 (priority 32768 sys-id-ext 10)`'],
        ['24576', '10', '**24586**', '`24586 (priority 24576 sys-id-ext 10)`'],
        ['4096', '20', '**4116**', '`4116 (priority 4096 sys-id-ext 20)`'],
        ['0', '100', '**100**', '`100 (priority 0 sys-id-ext 100)`'],
      ],
      caption: 'Configurable values: 0, 4096, 8192 … 61440 — sixteen in all.',
      notes:
        "`show spanning-tree` always displays the **sum** of the configured priority and the VLAN ID, then spells out both parts in parentheses. A switch left at the default in VLAN 10 therefore shows **32778 (priority 32768 sys-id-ext 10)**. That creates two classic traps. First, when an exhibit shows a root priority of 24586 in VLAN 10, the value that was configured is **24576**, not 24586. Second, you can never configure a number like 32769 or 24586 yourself: IOS accepts only multiples of 4096 and rejects anything else with a list of allowed values. Notice also that every switch adds the same VLAN number within a given VLAN, so the extended system ID never changes who wins an election inside that VLAN — it only makes each VLAN's BID unique. A priority of **0** is legal and is the strongest possible setting. In the Rapid PVST+ lesson you will use `spanning-tree vlan 10 root primary` and `spanning-tree vlan 10 priority` to set these values deliberately instead of leaving the election to chance.",
    },
    {
      kind: 'steps',
      title: 'The election in three steps',
      steps: [
        { title: 'Elect one **root bridge**', text: 'The switch with the lowest bridge ID in the VLAN.' },
        { title: 'Pick one **root port** on every non-root switch', text: 'The port with the lowest total cost back to the root.' },
        { title: 'Pick one **designated port** on every segment', text: 'The port on the switch closest to the root forwards onto that link.' },
        { title: '**Block** everything else', text: 'Ports that are neither root nor designated stop forwarding user frames.' },
      ],
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'n1', label: 'Root bridge', sub: 'lowest BID', shape: 'pill', tone: 'accent' },
          { id: 'n2', label: 'Root ports', sub: 'lowest cost to root' },
          { id: 'n3', label: 'Designated ports', sub: 'one per segment' },
          { id: 'n4', label: 'Blocked ports', sub: 'everything else', tone: 'bad', shape: 'round' },
        ],
      },
      notes:
        "Every STP calculation, however large the network, follows the same three steps, and you should work every exam question in this order. First, the whole VLAN agrees on one **root bridge** — the switch with the lowest bridge ID. Second, every switch that is **not** the root picks exactly one **root port**: the port that offers the cheapest path back to the root. Third, every **segment** — each link between two switches — gets exactly one **designated port**, the port that forwards frames onto that link, which always sits on the switch closer to the root. Any port that is neither a root port nor a designated port becomes a **non-designated** port and is placed in the **blocking** state. Keep one rule in mind throughout: at every comparison STP prefers the **lowest** value — lowest BID, lowest cost, lowest port ID. There is no 'highest wins' anywhere in 802.1D. The next slides zoom into each step, and then you will solve a full triangle yourself.",
    },
    {
      kind: 'bullets',
      title: 'Step 1: electing the root bridge',
      bullets: [
        'At boot, every switch claims to be root and sends BPDUs',
        'On hearing a **superior BPDU** (lower root BID), a switch stops claiming',
        'Compare **priority** first; only if equal does the lowest **MAC** win',
        'Every active port on the root bridge is **designated** and forwarding',
        '==Lowest bridge ID wins: priority, then MAC==',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: '32769 · 0011.1111.1111', x: 2, y: 1.2 },
          { id: 'sw2', icon: 'switch', label: 'SW2 = root', sub: '24577 · 0022.2222.2222', x: 8, y: 1.2, tone: 'accent' },
          { id: 'sw3', icon: 'switch', label: 'SW3', sub: '32769 · 0033.3333.3333', x: 5, y: 3.9 },
        ],
        links: [
          { from: 'sw1', to: 'sw2' },
          { from: 'sw2', to: 'sw3' },
          { from: 'sw1', to: 'sw3' },
        ],
      },
      notes:
        "When switches boot, each one assumes it is the root and sends BPDUs listing **itself** as the root bridge. As soon as a switch receives a BPDU naming a root with a lower BID than the one it currently believes in — a **superior BPDU** — it accepts that switch as root, stops advertising itself, and starts passing the better information along. Within a few hello intervals every switch in the VLAN agrees. In the diagram, SW2 wins even though SW1 has the lowest MAC of the three, because its priority field (**24577** = 24576 + VLAN 1) is lower than 32769. Only when priorities tie does the MAC matter: between SW1 and SW3, the lower MAC (0011…) would win. By default every switch has the same priority, so the root ends up being the switch with the lowest MAC — often the **oldest** switch in the building and rarely the best-placed one. That is why engineers always set root priorities by hand. Once elected, every active port on the root bridge becomes a **designated port** in the forwarding state; the root never has a root port.",
    },
    {
      kind: 'table',
      title: 'STP port costs',
      columns: ['Link speed', 'Short cost (802.1D-1998)', 'Long cost (802.1t)'],
      rows: [
        ['10 Mbps', '**100**', '2,000,000'],
        ['100 Mbps', '**19**', '200,000'],
        ['1 Gbps', '**4**', '20,000'],
        ['10 Gbps', '**2**', '2,000'],
      ],
      caption: 'The CCNA uses short costs; `spanning-tree pathcost method long` switches to long values.',
      notes:
        "Each port has an STP **cost** based on its operating speed: the faster the link, the lower the cost. The values in the middle column are the **short** (16-bit) costs from the 1998 revision of 802.1D and are the ones used throughout the CCNA: **100** for 10 Mbps, **19** for 100 Mbps, **4** for 1 Gbps and **2** for 10 Gbps. Memorize them — nearly every election question depends on them. The original 1990 standard simply divided 1000 by the speed in Mbps, which could not tell anything faster than 1 Gbps apart. The **802.1t** amendment later introduced **long** 32-bit costs (20,000 for 1 Gbps, 2,000 for 10 Gbps) so that 100 Gbps and faster links can be distinguished. Cisco switches move to long costs with `spanning-tree pathcost method long`, `show spanning-tree summary` reports which method is in use, and every switch in the network should use the same method. Cost follows the **negotiated** speed, so a Gigabit port that autonegotiates to 100 Mbps costs 19. You can also override a port's cost by hand, as you will see in the Rapid PVST+ lesson.",
    },
    {
      kind: 'bullets',
      title: 'Step 2: root path cost and the root port',
      bullets: [
        'The root sends BPDUs with a **root path cost of 0**',
        'Each switch **adds the cost of the port that received** the BPDU',
        'Root path cost = sum of inbound port costs back to the root',
        'Root port = the port with the **lowest** root path cost',
        'Ties: lowest **sender BID**, then lowest **sender port ID**',
        'The root bridge itself has **no** root port',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1 (root)', sub: 'advertises cost 0', x: 1.3, y: 2, tone: 'accent' },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'root cost 0 + 4 = 4', x: 5, y: 2 },
          { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'root cost 4 + 19 = 23', x: 8.7, y: 2 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', label: '1 Gbps · cost 4', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', arrow: 'forward' },
          { from: 'sw2', to: 'sw3', label: '100 Mbps · cost 19', fromLabel: 'Fa0/1', toLabel: 'Fa0/1', arrow: 'forward' },
        ],
      },
      notes:
        "The **root path cost** is a switch's total cost to reach the root. The root advertises a cost of **0** in its BPDUs. When a switch receives a BPDU it adds the cost of the **port that received it** to the advertised value; that sum is the root path cost through that port. The switch then advertises its best root cost to the switches below it. In this chain, SW2 hears cost 0 on its Gigabit port, adds 4, and has a root cost of **4**. SW3 hears 4 from SW2 on a FastEthernet port, adds 19, and ends up at **23**. Notice what does **not** count: the cost of the upstream switch's sending port. Each switch pays only for the ports where BPDUs come **in**. The port with the lowest root path cost becomes the **root port**. If two ports tie, STP prefers the port whose BPDU came from the neighbor with the lower **sender bridge ID**; if that also ties — two links to the same neighbor — it prefers the lower **sender port ID**. The root bridge never has a root port, because it is the destination.",
    },
    {
      kind: 'table',
      title: 'Tie-breaker: two links to the same neighbor',
      columns: ['SW2 port', 'Root path cost', 'Sender BID', 'Sender port ID', 'Result'],
      rows: [
        ['Gi0/1 (to SW1 Gi0/1)', '4', '32769.0011.1111.1111', '**128.25**', '==Root port=='],
        ['Gi0/2 (to SW1 Gi0/2)', '4', '32769.0011.1111.1111', '128.26', 'Blocked (alternate)'],
      ],
      caption: 'Cost and sender BID tie, so the lower sender port ID (on root bridge SW1) decides.',
      notes:
        "Two parallel links between the same pair of switches create a perfect tie on the first two criteria: the root path cost is identical and the sender bridge ID is the same switch. STP then compares the **sender port ID** carried in each BPDU — the port priority and port number of the **neighbor's** transmitting port. Here SW1's Gi0/1 has port ID **128.25** and its Gi0/2 has **128.26** (on a 24-port Catalyst 2960 the Gigabit uplinks are internal port numbers 25 and 26). SW2 therefore picks the port that hears 128.25 as its root port and blocks the other. The trap is that SW2's own port numbers are irrelevant. If you want SW2 to prefer the other link, lower the port priority on **SW1**'s interface (lower is better, in steps of 16, default 128) or lower the cost of SW2's other port. Changing the port priority on SW2 only influences switches downstream of SW2. The local port ID matters only in rare cases such as two ports of one switch cabled to the same hub. In production, parallel links are usually bundled into an EtherChannel, which STP treats as a single port.",
    },
    {
      kind: 'bullets',
      title: 'Step 3: designated ports and blocked ports',
      bullets: [
        'Every **segment** (link) gets exactly one designated port',
        'Winner: the switch advertising the **lowest root path cost** onto the link',
        'Ties: lowest **bridge ID**, then lowest port ID',
        'Ports on the root bridge are always designated',
        'Neither root nor designated → **non-designated**, blocking',
      ],
      diagram: {
        type: 'flow',
        direction: 'vertical',
        nodes: [
          { id: 'd1', label: 'A link between two switches', shape: 'pill' },
          { id: 'd2', label: 'Lower advertised root cost?', shape: 'diamond' },
          { id: 'd3', label: 'Tie → lower bridge ID', shape: 'diamond' },
          { id: 'd4', label: 'Tie → lower port ID', shape: 'diamond' },
          { id: 'd5', label: 'Designated port', sub: 'forwards onto the link', shape: 'round', tone: 'accent' },
        ],
      },
      notes:
        "Once root ports are chosen, STP looks at each **segment** — every link between two switches — and elects one **designated port** to forward traffic onto it. The winner is the port on the switch that advertises the **lowest root path cost** onto that link, which simply means the switch that is closer to the root. If both switches advertise the same root path cost, the switch with the **lower bridge ID** wins, and in the unusual case of the same switch on both sides (a hub or a looped cable) the lower **port ID** decides. Because the root bridge advertises cost 0, **every port on the root is designated**. A switch's root port is never the designated port of its own segment — the far end is. Any port that ends up as neither a root port nor a designated port becomes **non-designated** and blocks. A useful sanity check: on every point-to-point link between switches, one end must be designated and the other end is either a root port or blocked. If you find a link with two root ports or two blocked ends, you have made an arithmetic mistake somewhere.",
    },
    {
      kind: 'diagram',
      title: 'Worked example: the triangle',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: '32769 · 0011.1111.1111', x: 5, y: 1.1 },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: '32769 · 0022.2222.2222', x: 2, y: 3.9 },
          { id: 'sw3', icon: 'switch', label: 'SW3', sub: '32769 · 0033.3333.3333', x: 8, y: 3.9 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', label: '1 Gbps · 4' },
          { from: 'sw1', to: 'sw3', fromLabel: 'Gi0/2', toLabel: 'Gi0/1', label: '1 Gbps · 4' },
          { from: 'sw2', to: 'sw3', fromLabel: 'Gi0/2', toLabel: 'Gi0/2', label: '1 Gbps · 4' },
        ],
      },
      caption: 'VLAN 1, default priorities, every link costs 4. Find the root, root ports, designated ports and the blocked port.',
      notes:
        "Time to solve a full election. The exhibit is the classic three-switch triangle: every switch is at the default priority, so each shows **32769** in VLAN 1, and every link is Gigabit Ethernet with a cost of **4**. Before moving to the next slide, work through the three steps on paper. Which switch is root, and which tie-breaker decided it? For each non-root switch, compute the root path cost through each of its two ports and choose the root port. Then look at each of the three links and decide which end is designated. Finally, identify the one port that must block. Write down the tie-breaker you used at every decision, because the exam frequently offers answers that are right for the wrong reason. A tip for speed: once you know the root, its ports are designated immediately, which settles two of the three links at once — only the link between the two non-root switches needs any real thought. This is the most common STP exhibit on the CCNA, usually with priorities or link speeds changed to create a twist.",
    },
    {
      kind: 'steps',
      title: 'Solving the triangle',
      steps: [
        { title: 'Root bridge: **SW1**', text: 'All priority fields are 32769, so the lowest MAC (0011.1111.1111) wins.' },
        { title: 'Root ports: SW2 **Gi0/1** and SW3 **Gi0/1**', text: 'The direct link costs 4; the path through the other switch costs 8.' },
        { title: 'Designated: both SW1 ports and SW2 **Gi0/2**', text: 'On SW2–SW3 both advertise cost 4, so the lower BID (SW2) wins.' },
        { title: 'Blocked: SW3 **Gi0/2**', text: 'Neither root nor designated — it discards frames but keeps receiving BPDUs.' },
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1 (root)', sub: '32769 · 0011.1111.1111', x: 5, y: 1.1, tone: 'accent' },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'root cost 4', x: 2, y: 3.9 },
          { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'root cost 4', x: 8, y: 3.9 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1 DP', toLabel: 'Gi0/1 RP' },
          { from: 'sw1', to: 'sw3', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/1 RP' },
          { from: 'sw2', to: 'sw3', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/2 BLK', blocked: true },
        ],
      },
      notes:
        "**Root bridge:** all three priority fields are 32769, so the MAC decides; 0011.1111.1111 is the lowest, so **SW1** is root and both of its ports are designated. **Root ports:** SW2 can reach SW1 directly through Gi0/1 (cost 4) or through SW3 via Gi0/2 (4 + 4 = 8). Gi0/1 wins on cost, so it becomes SW2's root port; SW3 runs the same calculation and picks its own Gi0/1. **Designated port on SW2–SW3:** both switches advertise a root path cost of 4 onto this link, so cost ties, and the tie-breaker is the lower bridge ID: SW2 (0022…) beats SW3 (0033…), so **SW2 Gi0/2 is designated**. **Blocked port:** SW3 Gi0/2 is neither root nor designated, so it becomes non-designated and **blocks**. Result: frames between SW2 and SW3 travel through SW1, and the direct SW2–SW3 link carries only BPDUs until something fails. Notice that the blocked port always sits at one end of a link, on the switch that lost the designated election — here the switch with the higher BID.",
    },
    {
      kind: 'diagram',
      title: 'Change one link speed, change the tree',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1 (root)', sub: '32769 · 0011.1111.1111', x: 5, y: 1.1, tone: 'accent' },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'root cost 4', x: 2, y: 3.9 },
          { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'root cost 8', x: 8, y: 3.9 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1 DP', toLabel: 'Gi0/1 RP', label: '1 Gbps · 4' },
          { from: 'sw1', to: 'sw3', fromLabel: 'Fa0/1 DP', toLabel: 'Fa0/1 BLK', label: '100 Mbps · 19', blocked: true, tone: 'muted' },
          { from: 'sw2', to: 'sw3', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/2 RP', label: '1 Gbps · 4' },
        ],
      },
      caption: 'SW3: direct path costs 19; the path via SW2 costs 4 + 4 = 8, so its root port moves to Gi0/2.',
      notes:
        "Now replace the SW1–SW3 link with a 100 Mbps FastEthernet link (cost **19**) and run the election again. The root does not change: root election depends only on bridge IDs, never on costs, so **SW1** is still root. SW2 still reaches SW1 through Gi0/1 at cost 4. SW3's options change, though: its direct link now costs **19**, while the path through SW2 costs 4 (SW3's own Gi0/2) plus SW2's advertised 4, for a total of **8**. SW3's root port moves to **Gi0/2**. On the SW2–SW3 link, SW2 advertises 4 and SW3 advertises 8, so SW2 Gi0/2 is designated and SW3's end is its root port. On the SW1–SW3 link, SW1 is the root, so its Fa0/1 is designated; SW3's Fa0/1 is neither root nor designated and **blocks**. The slow link ends up idle, which is exactly what you want — STP naturally avoids expensive paths when a cheaper one exists. It is also why a single speed change, or a Gigabit port that negotiates down to 100 Mbps, can move traffic in ways that surprise people.",
    },
    {
      kind: 'table',
      title: '802.1D port states',
      columns: ['State', 'Forwards user frames', 'Learns MACs', 'BPDUs', 'How long'],
      rows: [
        ['**Blocking**', 'No', 'No', 'Receives only', 'While non-designated (up to max age 20 s after a change)'],
        ['**Listening**', 'No', 'No', 'Sends and receives', 'Forward delay (15 s)'],
        ['**Learning**', 'No', '**Yes**', 'Sends and receives', 'Forward delay (15 s)'],
        ['**Forwarding**', '**Yes**', 'Yes', 'Sends and receives', 'Stable while root or designated'],
        ['**Disabled**', 'No', 'No', 'None', 'Administratively shut down'],
      ],
      notes:
        "802.1D defines five port states. **Blocking** ports discard user frames and do not learn MACs, but they keep receiving BPDUs so the switch can react to changes; a non-designated port lives here. When STP decides a port should forward, the port does not jump straight to forwarding — that could create a temporary loop while other switches are still converging. Instead it enters **listening** for one forward delay (15 s), sending and receiving BPDUs but still neither learning nor forwarding, then **learning** for another 15 s, during which it adds source MACs to the table so it will not flood everything the moment it opens. Only then does it reach **forwarding**. **Disabled** is the state of an administratively shut port, which takes no part in STP. Two facts are tested constantly: only **learning** and **forwarding** populate the MAC address table, and only **forwarding** passes user traffic. Listening differs from blocking mainly in that a listening port sends BPDUs and is on its way to forwarding.",
    },
    {
      kind: 'diagram',
      title: 'Timers and convergence time',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 't1', label: 'Blocking', sub: 'wait ≤ 20 s (max age)', tone: 'muted' },
          { id: 't2', label: 'Listening', sub: '15 s (forward delay)' },
          { id: 't3', label: 'Learning', sub: '15 s (forward delay)' },
          { id: 't4', label: 'Forwarding', sub: 'user traffic flows', shape: 'round', tone: 'good' },
        ],
      },
      caption: 'Direct failure ≈ 30 s (listening + learning). Indirect failure ≈ 50 s (20 + 15 + 15).',
      bullets: [
        '**Hello** 2 s — how often the root sends BPDUs',
        '**Max age** 20 s — how long stored BPDU information is trusted',
        '**Forward delay** 15 s — time in listening, then again in learning',
      ],
      notes:
        "Three timers drive 802.1D, and every switch uses the values advertised by the root. **Hello** (2 s) is how often the root generates BPDUs. **Max age** (20 s, ten hellos) is how long a switch keeps the last BPDU it heard on a port before concluding that information is gone. **Forward delay** (15 s) is the time a port spends in listening and then again in learning. Together they explain the famous convergence times. After a **direct** failure — the switch's own root port goes down — the switch knows immediately and moves a blocked port through listening and learning: about **30 seconds**. After an **indirect** failure — something upstream breaks and BPDUs simply stop arriving on a blocked port — the switch must first wait for max age to expire: 20 + 15 + 15 = **50 seconds**. Users on affected paths lose connectivity the whole time. Tuning the timers is possible but risky, because they must suit the diameter of the whole network; the real fix was **Rapid STP (802.1w)**, covered next, which typically converges in about a second on point-to-point links.",
    },
    {
      kind: 'cli',
      title: 'Verifying the triangle on SW3',
      code: `SW3# show spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0011.1111.1111
             Cost        4
             Port        25 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     0033.3333.3333
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/10              Desg FWD 19        128.10   P2p
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p`,
      highlight: ['Root FWD', 'Altn BLK', '0011.1111.1111'],
      caption: 'Modern IOS labels the non-designated port "Altn BLK" even in classic PVST+ mode.',
      notes:
        "This is SW3 from the solved triangle. The **Root ID** section describes the root bridge as SW3 sees it: priority 32769 and address 0011.1111.1111, which is SW1. The **Cost** line is SW3's root path cost (4) and the **Port** line names the root port — internal port 25, which is Gi0/1. On the root bridge itself those two lines are replaced by the words **This bridge is the root**. The **Bridge ID** section describes SW3 itself, and the parentheses split its priority field into the configured priority and the VLAN (`sys-id-ext`). In the port table, **Role** shows Root, Desg or Altn, **Sts** shows the state (FWD, BLK, LIS, LRN), **Cost** is the port's own cost and **Prio.Nbr** is the port ID. Fa0/10 is a PC port, which is designated because nothing else competes for that segment. Modern IOS labels the non-designated port **Altn BLK** even in classic 802.1D mode; the alternate role is explained properly in the Rapid PVST+ lesson. `protocol ieee` means Cisco's per-VLAN 802.1D (PVST+), the default on classic IOS switches such as the Catalyst 2960.",
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam traps: STP fundamentals',
      body: '**Lowest wins at every step** — lowest BID, lowest root cost, lowest sender BID, lowest sender port ID.',
      bullets: [
        'Displayed priority includes the VLAN: 32778 = 32768 + VLAN 10',
        'Priority must be a multiple of **4096** — 32769 cannot be configured',
        'Root path cost adds only the **receiving** port costs',
        "Root port tie-breaker uses the **neighbor's** port ID, not the local one",
        'The root bridge has **no root port**; all its ports are designated',
        'Blocking ports still **receive BPDUs**; learning ports learn MACs but forward nothing',
      ],
      notes:
        "Run through these before any STP question — almost every wrong answer on the exam comes from one of them. Always subtract the VLAN when you read a priority from show output, and remember that a configured priority must be a multiple of 4096. When adding costs, include only the ports on which BPDUs arrive, never the sending port of the upstream switch, and use the negotiated speed rather than the interface name. For root port tie-breakers, the port ID that matters belongs to the **neighbor** that sent the BPDU; the local port ID is used only in unusual cases such as two ports of the same switch cabled into one hub. The root bridge has only designated ports, while each non-root switch has exactly one root port per VLAN. Root election never looks at cost, and port roles never change who is root. Finally, keep the states straight: blocking ports still receive BPDUs, listening ports send them, learning ports fill the MAC table but forward nothing, and only forwarding ports pass user frames. If a stem mentions a port that waited 20 seconds after BPDUs stopped, think **max age**.",
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'Loops cause broadcast storms, MAC flapping and duplicate frames — Ethernet has no TTL',
        'Bridge ID = priority (default 32768, steps of 4096) + VLAN + MAC',
        'Root bridge = lowest BID; root port = lowest cost to root; one designated port per segment',
        'Short costs: 100 / 19 / 4 / 2 for 10 Mbps / 100 Mbps / 1 Gbps / 10 Gbps',
        'States: blocking → listening → learning → forwarding (plus disabled)',
        'Timers 2 / 20 / 15 s give 30–50 s convergence — the reason RSTP exists',
      ],
      notes:
        "Lock in the core of 802.1D before moving on. Loops happen because switches flood and Ethernet has no TTL, producing broadcast storms, MAC table flapping and duplicate frames. STP breaks loops by electing a root bridge — the lowest bridge ID, where the ID is a priority in steps of 4096 plus the VLAN number plus a MAC — then a root port on every other switch (lowest root path cost, then lowest sender BID, then lowest sender port ID), then a designated port on every segment, and it blocks everything else. Short port costs are 100, 19, 4 and 2. Ports move from blocking through listening and learning to forwarding under the control of the 2-second hello, 20-second max age and 15-second forward delay, which is why classic STP needs 30 to 50 seconds to recover from a failure. The next lesson keeps exactly the same election but shows how Rapid PVST+ adds new port roles and a proposal/agreement handshake to converge in about a second, and how to control the root placement per VLAN.",
    },
  ],
  flashcards: [
    { id: 'f1', front: 'Original Spanning Tree Protocol standard', back: '**IEEE 802.1D** — elects a root bridge and blocks redundant ports to create a loop-free tree.' },
    { id: 'f2', front: 'Three problems caused by a Layer 2 loop', back: 'Broadcast storms, MAC address table instability (flapping) and duplicate frame delivery.' },
    { id: 'f3', front: 'Why frames in a Layer 2 loop never expire', back: 'The Ethernet header has **no TTL** or hop-count field, so switches never discard a looping frame.' },
    { id: 'f4', front: 'BPDU', back: '**Bridge Protocol Data Unit** — the STP message between switches. IEEE BPDUs are sent to multicast MAC `0180.c200.0000`.' },
    { id: 'f5', front: 'Fields STP compares in a BPDU, in order', back: 'Root bridge ID → root path cost → sender bridge ID → sender port ID. The lower value wins at each step.' },
    { id: 'f6', front: 'Bridge ID structure', back: '8 bytes: 4-bit priority + 12-bit extended system ID (the VLAN) + 48-bit MAC address.' },
    { id: 'f7', front: 'Default STP bridge priority', back: '**32768** — displayed as 32768 + VLAN ID (e.g. 32769 in VLAN 1).' },
    { id: 'f8', front: 'Valid configurable bridge priorities', back: 'Multiples of **4096** from 0 to 61440 — sixteen values.' },
    { id: 'f9', front: 'Priority shown in VLAN 20 by a switch at the default', back: '**32788** (32768 + 20).' },
    { id: 'f10', front: 'Root bridge election rule', back: 'Lowest bridge ID: lowest priority first; if priorities tie, lowest MAC address.' },
    { id: 'f11', front: 'Root port tie-breakers, in order', back: '1. Lowest root path cost\n2. Lowest sender (neighbor) bridge ID\n3. Lowest sender port ID' },
    { id: 'f12', front: 'Root path cost', back: 'Sum of the costs of the ports that **receive** BPDUs along the path to the root. The root advertises 0.' },
    { id: 'f13', front: 'Designated port', back: 'The single forwarding port on a segment, on the switch advertising the lowest root path cost (ties: lowest BID, then lowest port ID).' },
    { id: 'f14', front: 'Port roles on the root bridge', back: 'Every active port is **designated** (forwarding). The root bridge has no root port.' },
    { id: 'f15', front: 'Non-designated port', back: 'A port that is neither root nor designated; STP places it in the **blocking** state.' },
    { id: 'f16', front: 'STP short cost: 10 Mbps', back: '**100**' },
    { id: 'f17', front: 'STP short cost: 100 Mbps', back: '**19**' },
    { id: 'f18', front: 'STP short cost: 1 Gbps', back: '**4**' },
    { id: 'f19', front: 'STP short cost: 10 Gbps', back: '**2**' },
    { id: 'f20', front: 'Long (802.1t) STP costs', back: '100 Mbps = 200,000; 1 Gbps = 20,000; 10 Gbps = 2,000. Enable with `spanning-tree pathcost method long`.' },
    { id: 'f21', front: 'STP port ID', back: '16 bits: port priority (default **128**, steps of 16) + port number, shown as e.g. `128.25`.' },
    { id: 'f22', front: '802.1D port states', back: 'Blocking, listening, learning, forwarding — plus disabled (administratively down).' },
    { id: 'f23', front: 'Which 802.1D states learn MAC addresses?', back: '**Learning** and **forwarding**. Only forwarding passes user frames.' },
    { id: 'f24', front: 'STP hello time', back: '**2 seconds** — how often the root generates configuration BPDUs.' },
    { id: 'f25', front: 'STP max age', back: '**20 seconds** (10 × hello) — how long a port trusts its last stored BPDU.' },
    { id: 'f26', front: 'STP forward delay', back: '**15 seconds** — time spent in listening, and again in learning.' },
    { id: 'f27', front: '802.1D convergence time', back: 'About **30 s** after a direct failure (2 × forward delay); up to **50 s** after an indirect failure (max age + 2 × forward delay).' },
    { id: 'f28', front: 'Topology Change Notification (TCN) BPDU', back: 'Sent toward the root after a port changes state; switches then age MAC entries after 15 s (forward delay) instead of 300 s.' },
    { id: 'f29', front: 'Superior BPDU', back: 'A BPDU with better (lower) values than the one stored on the port, such as a lower root BID. It replaces the stored information.' },
    { id: 'f30', front: 'How many root ports and designated ports?', back: 'One root port per non-root switch per VLAN; one designated port per segment.' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'Why does a broadcast frame caught in a Layer 2 loop never die out on its own?',
      options: [
        'The Ethernet header has no TTL field',
        'Switches decrement the TTL only once per VLAN',
        'Broadcast frames bypass the MAC address table checks',
        'The FCS is recalculated by every switch',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        'Ethernet frames carry **no TTL or hop count**, so switches forward a looping frame forever. Switches never touch an IP TTL, and neither MAC table checks nor the FCS limit how long a frame can circulate.',
    },
    {
      id: 'q2',
      type: 'single',
      stem: 'Four switches all use the default STP priority. Which one becomes the root bridge?',
      options: ['SW-A 0019.e8a1.2c00', 'SW-B 0019.e8a0.ff00', 'SW-C 0019.e8a1.0100', 'SW-D 001a.0000.0001'],
      answer: 1,
      difficulty: 1,
      explanation:
        'With equal priorities the **lowest MAC** wins. Comparing from the left, 0019.e8a0… is lower than 0019.e8a1… (SW-A and SW-C), and every 0019… address is lower than 001a… (SW-D), so **SW-B** is root. SW-D looks tempting because it ends in 0001, but MACs are compared from the most significant digit.',
    },
    {
      id: 'q3',
      type: 'input',
      stem: 'A switch uses the default bridge priority. Which priority value does `show spanning-tree vlan 10` display for it in the Bridge ID section?',
      answers: ['32778'],
      placeholder: 'number',
      difficulty: 2,
      explanation:
        'The displayed value is the configured priority plus the extended system ID (VLAN): 32768 + 10 = **32778**. The output then shows `(priority 32768 sys-id-ext 10)`.',
    },
    {
      id: 'q4',
      type: 'multi',
      stem: 'A non-root switch has two ports with exactly the same root path cost. Which two values can break the tie? (Choose two.)',
      options: [
        'The lower sender (neighbor) bridge ID',
        'The lower sender port ID',
        'The higher interface speed',
        'The higher local MAC address',
        'The most recently received BPDU',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'After root path cost, STP compares the **sender bridge ID** and then the **sender port ID** from the BPDUs. Speed is already reflected in the (tied) cost, "higher" never wins in STP, and BPDU arrival order is irrelevant.',
    },
    {
      id: 'q5',
      type: 'match',
      stem: 'Match each link speed to its default 802.1D short STP cost.',
      pairs: [
        { left: '10 Mbps', right: '100' },
        { left: '100 Mbps', right: '19' },
        { left: '1 Gbps', right: '4' },
        { left: '10 Gbps', right: '2' },
      ],
      difficulty: 1,
      explanation: 'The 802.1D-1998 short costs are 100, 19, 4 and 2 for 10 Mbps, 100 Mbps, 1 Gbps and 10 Gbps. Faster links always have lower costs.',
    },
    {
      id: 'q6',
      type: 'order',
      stem: 'Put the 802.1D port states in the order a port moves through them on its way to forwarding.',
      items: ['Blocking', 'Listening', 'Learning', 'Forwarding'],
      difficulty: 1,
      explanation:
        'A port leaves **blocking**, spends one forward delay (15 s) in **listening**, another 15 s in **learning** (building the MAC table), and only then reaches **forwarding**.',
    },
    {
      id: 'q7',
      type: 'single',
      stem: 'In which 802.1D state does a port add MAC addresses to the MAC table but still not forward user frames?',
      options: ['Learning', 'Listening', 'Blocking', 'Disabled'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Learning** populates the MAC table so the port will not flood unnecessarily when it opens. Listening and blocking learn nothing, and a disabled port is administratively down.',
    },
    {
      id: 'q8',
      type: 'single',
      stem: 'Which statement about the root bridge is true?',
      options: [
        'All of its active ports are designated ports',
        'It has exactly one root port per VLAN',
        'It blocks one of its ports in every VLAN',
        'It is the switch with the highest priority value',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'The root advertises a root path cost of 0, so it wins the designated election on every link: **all its ports are designated**. It has no root port, never needs to block, and the root is the switch with the **lowest** BID.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Refer to the exhibit. Which switch is elected root bridge for VLAN 10?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'prio 32778 · 0019.e86a.6f80', x: 5, y: 1.1 },
            { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'prio 28682 · 00d0.bc55.2a01', x: 2, y: 3.9 },
            { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'prio 32778 · 0004.9a3c.11b0', x: 8, y: 3.9 },
          ],
          links: [
            { from: 'sw1', to: 'sw2' },
            { from: 'sw1', to: 'sw3' },
            { from: 'sw2', to: 'sw3' },
          ],
        },
      },
      options: ['SW2', 'SW3', 'SW1', 'None — VLAN 10 has no root until a priority is configured'],
      answer: 0,
      difficulty: 2,
      explanation:
        'Priority is compared before the MAC. SW2 shows **28682** (28672 + VLAN 10), lower than the 32778 on SW1 and SW3, so **SW2** is root even though its MAC is the highest. SW3 has the lowest MAC (0004…), but the MAC only breaks ties between equal priorities. SW1 wins on neither criterion, and a root is always elected automatically with default settings.',
    },
    {
      id: 'e2',
      type: 'single',
      stem: 'Refer to the exhibit. All links are 1 Gbps and use default STP costs. Which port is placed in the blocking state for VLAN 1?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'prio 4097 · 0c1a.2b00.1a01', x: 2.5, y: 1.1 },
            { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'prio 32769 · 0c1a.2b00.2b02', x: 7.5, y: 1.1 },
            { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'prio 32769 · 0c1a.2b00.3c03', x: 2.5, y: 3.9 },
            { id: 'sw4', icon: 'switch', label: 'SW4', sub: 'prio 32769 · 0c1a.2b00.0d04', x: 7.5, y: 3.9 },
          ],
          links: [
            { from: 'sw1', to: 'sw2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1' },
            { from: 'sw1', to: 'sw3', fromLabel: 'Gi0/2', toLabel: 'Gi0/1' },
            { from: 'sw2', to: 'sw4', fromLabel: 'Gi0/2', toLabel: 'Gi0/1' },
            { from: 'sw3', to: 'sw4', fromLabel: 'Gi0/2', toLabel: 'Gi0/2' },
          ],
        },
      },
      options: ['SW4 Gi0/2', 'SW4 Gi0/1', 'SW3 Gi0/2', 'SW2 Gi0/2'],
      answer: 0,
      difficulty: 3,
      explanation:
        'SW1 is root because its priority field (4097) beats 32769, even though SW4 has the lowest MAC (…0d04). SW2 and SW3 use their direct Gi0/1 links (cost 4) as root ports. SW4 has two paths that both cost 8, so it compares **sender BIDs**: SW2 (…2b02) beats SW3 (…3c03), making SW4 **Gi0/1** its root port. On the SW3–SW4 link SW3 advertises cost 4 and SW4 advertises 8, so SW3 Gi0/2 is designated and **SW4 Gi0/2** — neither root nor designated — blocks. SW4\'s low MAC never helps, because the designated election compares root path cost before bridge ID. SW2 Gi0/2 and SW3 Gi0/2 are designated ports, and SW4 Gi0/1 is the root port.',
    },
    {
      id: 'e3',
      type: 'input',
      stem: 'Refer to the exhibit. Which priority value was configured on the root bridge for VLAN 10? (Enter the number used with `spanning-tree vlan 10 priority`.)',
      exhibit: {
        kind: 'cli',
        text: `SW2# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol ieee
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
Fa0/5               Desg FWD 19        128.5    P2p
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p`,
      },
      answers: ['24576'],
      placeholder: 'priority',
      difficulty: 2,
      explanation:
        'The Root ID priority (24586) is the configured priority plus the extended system ID: 24586 − 10 = **24576**, a valid multiple of 4096. 24586 itself could never be configured, and 32768 is this switch\'s (non-root) priority.',
    },
    {
      id: 'e4',
      type: 'multi',
      stem: 'Which two statements about the STP bridge ID are true? (Choose two.)',
      options: [
        'The priority portion must be configured in multiples of 4096',
        'The extended system ID carries the VLAN number',
        'The switch with the highest bridge ID becomes the root bridge',
        'The default configured priority is 32769',
        'The MAC address is compared before the priority',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Only the top 4 bits of the priority field are configurable, so priorities move in steps of **4096**, and the lower 12 bits (the **extended system ID**) hold the VLAN. The **lowest** BID wins, the default configured priority is 32768 (32769 is what VLAN 1 displays), and the priority is compared first — the MAC only breaks ties.',
    },
    {
      id: 'e5',
      type: 'match',
      stem: 'Match each timer to its default value on a Cisco switch.',
      pairs: [
        { left: 'STP hello time', right: '2 seconds' },
        { left: 'STP forward delay', right: '15 seconds' },
        { left: 'STP max age', right: '20 seconds' },
        { left: 'MAC address table aging time', right: '300 seconds' },
      ],
      difficulty: 1,
      explanation:
        'STP uses hello **2 s**, forward delay **15 s** (spent in listening and again in learning) and max age **20 s** (ten hellos). Dynamic MAC entries age out after **300 s** by default, shortened to the forward delay after a topology change.',
    },
    {
      id: 'e6',
      type: 'order',
      stem: 'Put the criteria in the order STP compares them when choosing between two BPDUs received on different ports.',
      items: ['Lowest root bridge ID', 'Lowest root path cost', 'Lowest sender bridge ID', 'Lowest sender port ID'],
      difficulty: 2,
      explanation:
        'A BPDU naming a better root always wins first. Among BPDUs that agree on the root, the lower **root path cost** wins, then the lower **sender BID**, and finally the lower **sender port ID** — the last one matters only for parallel links to the same neighbor.',
    },
    {
      id: 'e7',
      type: 'categorize',
      stem: 'Categorize each rule by the STP decision it belongs to.',
      categories: ['Root bridge election', 'Root port selection', 'Designated port selection'],
      items: [
        { text: 'Lowest bridge ID of all switches in the VLAN', category: 0 },
        { text: "Lowest total cost to the root among one switch's ports", category: 1 },
        { text: 'Lowest sender port ID when two links to the same neighbor tie', category: 1 },
        { text: 'Switch advertising the lowest root path cost onto a link', category: 2 },
        { text: 'Every active port on the root bridge', category: 2 },
      ],
      difficulty: 2,
      explanation:
        'The root is simply the lowest BID. Root ports are chosen per non-root switch by lowest root path cost, with sender BID and **sender port ID** as tie-breakers. Designated ports are chosen per segment — the switch closest to the root wins, which is why every port on the root bridge is designated.',
    },
    {
      id: 'e8',
      type: 'single',
      stem: 'Refer to the exhibit. SW1 is the root bridge and has two 1 Gbps links to SW2. An engineer set the port priority of SW1 Gi0/2 to 64. Which port becomes the root port on SW2, and why?',
      exhibit: {
        kind: 'table',
        columns: ['SW1 port (root bridge)', 'SW1 port ID', 'Connected to'],
        rows: [
          ['Gi0/1', '128.25', 'SW2 Gi0/2'],
          ['Gi0/2', '64.26', 'SW2 Gi0/1'],
        ],
      },
      options: [
        'SW2 Gi0/1, because its BPDUs carry the lower sender port ID (64.26)',
        'SW2 Gi0/2, because its BPDUs come from port number 25, which is lower than 26',
        "SW2 Gi0/1, because SW2's own Gi0/1 has a lower port ID than its Gi0/2",
        'Both ports forward, because their root path costs are equal',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Root path cost (4) and sender BID (SW1) tie on both links, so SW2 compares the **sender port IDs**. The priority half is compared first, so **64.26 < 128.25** even though 26 > 25. The BPDU from SW1 Gi0/2 arrives on **SW2 Gi0/1**, which becomes the root port, and SW2 Gi0/2 blocks. Option B ignores the priority half of the port ID. Option C names the right port for the wrong reason: SW2\'s local port IDs matter only when the sender port IDs are identical. STP never forwards on two parallel links in one VLAN unless they are bundled into an EtherChannel.',
    },
    {
      id: 'e9',
      type: 'multi',
      stem: 'An engineer wants to give SW5 an explicit STP priority in VLAN 1. Which two values does the `spanning-tree vlan 1 priority` command accept? (Choose two.)',
      options: ['4096', '24576', '32769', '25000', '65535'],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Only multiples of **4096** from 0 to 61440 are accepted, so **4096** and **24576** are valid. 32769 is the value *displayed* for a default switch in VLAN 1 (32768 + 1), 25000 is not a multiple of 4096, and 65535 is above the 61440 maximum.',
    },
    {
      id: 'e10',
      type: 'single',
      stem: 'A switch running 802.1D experiences an indirect failure: BPDUs stop arriving on its blocking port, but its own links stay up. With default timers, about how long does it take before that port forwards?',
      options: ['50 seconds', '30 seconds', '20 seconds', '15 seconds'],
      answer: 0,
      difficulty: 2,
      explanation:
        'The switch must first wait for the stored BPDU to expire (**max age, 20 s**), then spend 15 s in listening and 15 s in learning: **50 s**. 30 s applies to a direct failure, where the switch skips the max-age wait; 20 s and 15 s are individual timers, not the total.',
    },
    {
      id: 'e11',
      type: 'multi',
      stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
      exhibit: {
        kind: 'cli',
        text: `SW2# show spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0019.0a1b.2c3d
             Cost        19
             Port        1 (FastEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     0019.0a55.6677
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/1               Root FWD 19        128.1    P2p
Fa0/2               Desg FWD 19        128.2    P2p
Gi0/1               Altn BLK 4         128.25   P2p`,
      },
      options: [
        'The switch connected to Fa0/1 is the root bridge',
        'SW2 is the root bridge for VLAN 1',
        'Gi0/1 is blocking because its port cost is higher than the cost of Fa0/1',
        'The root bridge has a lower MAC address than SW2',
        'SW2 is running Rapid PVST+',
      ],
      answers: [0, 3],
      difficulty: 3,
      explanation:
        'SW2\'s root path cost (19) equals the cost of its root port Fa0/1, so the neighbor on Fa0/1 advertised a cost of 0 — **it is the root**. The root\'s priority (32769) equals SW2\'s, so the root must have won on MAC: 0019.0a1b… is **lower** than 0019.0a55…. SW2 is not root (that would read "This bridge is the root"). Gi0/1 actually has the *lower* port cost (4); it blocks because the neighbor on Gi0/1 advertises a high enough root cost that the path through it totals no better than 19. `protocol ieee` means PVST+; Rapid PVST+ would show `rstp`.',
    },
    {
      id: 'e12',
      type: 'single',
      stem: 'What happens to a broadcast frame in a switched network that has a physical loop and no spanning tree?',
      options: [
        'It is flooded around the loop indefinitely and multiplies into a broadcast storm',
        'It is discarded when its TTL reaches zero',
        'The first switch drops it after seeing its own MAC as the source',
        'It crosses the loop once and is then filtered by the MAC table',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        'Switches flood broadcasts out every port except the incoming one, and Ethernet has no TTL, so copies circulate forever and multiply into a **broadcast storm**. There is no TTL to expire, switches do not check for their own MAC in transit frames, and broadcasts are always flooded rather than filtered.',
    },
    {
      id: 'e13',
      type: 'multi',
      stem: 'Which two symptoms indicate a Layer 2 switching loop? (Choose two.)',
      options: [
        'MAC address table entries flapping between two ports',
        'Link and CPU utilization near 100% from broadcast traffic',
        'ICMP Time Exceeded messages returned by a router',
        'Late collisions on a full-duplex link',
        'CRC errors increasing on a single interface',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Looping frames make the same source MAC appear on different ports (**MAC flapping**) and multiply into a **broadcast storm** that saturates links and CPUs. ICMP Time Exceeded messages point to a Layer 3 routing loop (IP has a TTL; Ethernet does not). Late collisions suggest a duplex mismatch, and CRC errors on one interface suggest a cabling or physical problem.',
    },
    {
      id: 'e14',
      type: 'single',
      stem: 'Refer to the exhibit. SW1 is the root bridge and default STP costs are used. What is the root port on SW2, and what is its root path cost?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'root bridge', x: 5, y: 1.1, tone: 'accent' },
            { id: 'sw2', icon: 'switch', label: 'SW2', x: 2, y: 3.9 },
            { id: 'sw3', icon: 'switch', label: 'SW3', x: 8, y: 3.9 },
          ],
          links: [
            { from: 'sw1', to: 'sw2', fromLabel: 'Fa0/1', toLabel: 'Fa0/1', label: '100 Mbps' },
            { from: 'sw1', to: 'sw3', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', label: '1 Gbps' },
            { from: 'sw3', to: 'sw2', fromLabel: 'Gi0/2', toLabel: 'Gi0/2', label: '1 Gbps' },
          ],
        },
      },
      options: [
        'Gi0/2, with a root path cost of 8',
        'Fa0/1, with a root path cost of 19',
        'Gi0/2, with a root path cost of 4',
        'Fa0/1, with a root path cost of 0',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'SW2 can reach SW1 directly through Fa0/1 at cost 19, or through SW3: SW2 Gi0/2 (4) plus SW3\'s advertised root cost (4) = **8**. The lower total wins, so the root port is **Gi0/2 with cost 8**. "Cost 4" counts only SW2\'s own port and forgets the upstream cost; Fa0/1 would win only if you counted hops instead of cost; a cost of 0 belongs to the root itself. As a result, SW2 Fa0/1 blocks, because SW1\'s end of that link is designated.',
    },
    {
      id: 'e15',
      type: 'input',
      stem: 'Refer to the exhibit. SW1 is the root bridge. Using the default short STP costs, what is the root path cost of SW3?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'root bridge', x: 2, y: 1.2, tone: 'accent' },
            { id: 'sw2', icon: 'switch', label: 'SW2', x: 8, y: 1.2 },
            { id: 'sw3', icon: 'switch', label: 'SW3', x: 5, y: 3.9 },
          ],
          links: [
            { from: 'sw1', to: 'sw2', label: '10 Gbps' },
            { from: 'sw2', to: 'sw3', label: '1 Gbps' },
            { from: 'sw1', to: 'sw3', label: '100 Mbps' },
          ],
        },
      },
      answers: ['6'],
      placeholder: 'cost',
      difficulty: 3,
      explanation:
        'Direct path: 19 (100 Mbps). Path through SW2: SW3\'s 1 Gbps port (4) + SW2\'s advertised root cost over 10 Gbps (2) = **6**. Because 6 < 19, SW3\'s root port faces SW2 and its root path cost is 6. Answering 4 or 2 counts only one link; 19 ignores the faster two-hop path.',
    },
    {
      id: 'e16',
      type: 'single',
      stem: 'Which statement about STP designated ports is true?',
      options: [
        'Each network segment has exactly one designated port',
        'Each switch has exactly one designated port',
        'Designated ports remain in the blocking state until a failure',
        'Only the root bridge can have designated ports',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'STP elects **one designated port per segment**, and it forwards. A switch can have many designated ports (the root has only designated ports), it is the *root port* that is limited to one per switch, and non-root switches also own the designated ports on segments below them.',
    },
    {
      id: 'e17',
      type: 'single',
      stem: 'Which default 802.1D timer is 15 seconds?',
      options: ['Forward delay', 'Hello time', 'Max age', 'Message age'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Forward delay** is 15 s and is spent once in listening and once in learning. Hello is 2 s and max age is 20 s. Message age is not a fixed timer — it records how old a received BPDU is.',
    },
    {
      id: 'e18',
      type: 'single',
      stem: 'An engineer enters `spanning-tree vlan 1 priority 30000` on a Catalyst switch. What is the result?',
      options: [
        'The command is rejected because the priority must be a multiple of 4096',
        'The priority is rounded down to 28672',
        'The priority is set to 30000 and the switch probably becomes root',
        'The value is added to the VLAN number and stored as 30001',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'IOS **rejects** any priority that is not a multiple of 4096 and prints the list of allowed values (0, 4096 … 61440). It does not round the value, and it never stores a displayed-style number: the VLAN is added only when the priority is shown.',
    },
    {
      id: 'e19',
      type: 'single',
      stem: 'After `spanning-tree pathcost method long` is configured, which STP cost does a 1 Gbps port use by default?',
      options: ['20,000', '4', '2,000', '200,000'],
      answer: 0,
      difficulty: 1,
      explanation:
        'Long (802.1t) costs are **20,000** for 1 Gbps, 2,000 for 10 Gbps and 200,000 for 100 Mbps. The value 4 is the short cost for 1 Gbps.',
    },
    {
      id: 'e20',
      type: 'single',
      stem: 'Refer to the exhibit. Which statement is true?',
      exhibit: {
        kind: 'cli',
        text: `DS1# show spanning-tree vlan 20

VLAN0020
  Spanning tree enabled protocol ieee
  Root ID    Priority    4116
             Address     0023.04ee.be01
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    4116   (priority 4096 sys-id-ext 20)
             Address     0023.04ee.be01
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/1               Desg FWD 19        128.1    P2p
Gi0/1               Desg FWD 4         128.25   P2p
Gi0/2               Desg FWD 4         128.26   P2p`,
      },
      options: [
        'DS1 is the root for VLAN 20, and all of its ports forward as designated ports',
        'DS1 was configured with `spanning-tree vlan 20 priority 4116`',
        'Gi0/1 is the root port because it has the lowest port ID of the Gigabit ports',
        'The root path cost of DS1 is 4',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '"This bridge is the root" replaces the Cost and Port lines, and every port is **Desg FWD** — exactly what a root bridge shows. The configured priority was 4096: the displayed 4116 includes sys-id-ext 20, and 4116 is not a legal configured value. A root bridge has no root port, and its root path cost is 0, not the 4 shown as a port cost.',
    },
    {
      id: 'e21',
      type: 'single',
      stem: 'In 802.1D, what does a non-root switch do after receiving a configuration BPDU on its root port?',
      options: [
        'It sends its own BPDUs out its designated ports, listing itself as sender and its own root path cost',
        'It floods the unchanged BPDU out every port, including blocking ports',
        'It discards the BPDU, because only the root bridge may send BPDUs',
        'It returns the BPDU to the root bridge as an acknowledgment',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'In classic STP the root originates BPDUs every hello, and each downstream switch **generates updated BPDUs out its designated ports**, with its own BID as sender and its root path cost in the cost field. It does not forward the original unchanged, blocking ports do not send BPDUs, and 802.1D has no acknowledgment mechanism.',
    },
    {
      id: 'e22',
      type: 'match',
      stem: 'Match each STP term to its definition.',
      pairs: [
        { left: 'Root bridge', right: 'The switch with the lowest bridge ID' },
        { left: 'Root port', right: "A non-root switch's best path toward the root" },
        { left: 'Designated port', right: 'The single forwarding port on a segment' },
        { left: 'Non-designated port', right: 'A port that is neither root nor designated and blocks' },
      ],
      difficulty: 2,
      explanation:
        'The **root bridge** has the lowest BID; each other switch has one **root port** (lowest cost to root); each segment has one **designated port**; every remaining port is **non-designated** and blocks.',
    },
    {
      id: 'e23',
      type: 'single',
      stem: "SW1 (root) connects to SW2 over two 1 Gbps links: SW1 Gi0/1 to SW2 Gi0/2, and SW1 Gi0/2 to SW2 Gi0/1. All port priorities are default. An engineer then sets `spanning-tree port-priority 16` on SW2 Gi0/1. Which port is SW2's root port afterward?",
      options: [
        "Gi0/2, because it hears SW1's port ID 128.25; SW2's own port priority does not affect its root port",
        'Gi0/1, because its port priority is now lower than that of Gi0/2',
        'Gi0/1, because it has the lower local port number',
        'Gi0/2, because raising the priority value on Gi0/1 made it less preferred',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Cost and sender BID tie, so SW2 compares the **sender** port IDs: SW2 Gi0/2 hears 128.25 (from SW1 Gi0/1), which beats 128.26, so **Gi0/2** is and remains the root port. Changing the port priority on SW2 changes only the port ID that SW2 *advertises* to switches downstream; it never influences SW2\'s own root port choice. Options B and C use local values that STP never reaches here, and option D is wrong because 16 is a lower (better) value, not a higher one.',
    },
  ],
};

export default lesson;
