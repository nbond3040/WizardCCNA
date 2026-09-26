import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'VLSM & Route Summarization',
    subtitle: 'Right-sized subnets without overlap, and one route for many',
    notes:
      'Subnetting with one mask everywhere is simple but wasteful: a two-router WAN link receives as many addresses as a 60-user LAN. **Variable-Length Subnet Masking (VLSM)** fixes that by giving every segment a prefix sized to its needs. In this deck you will design a complete VLSM address plan step by step, from a single /24 block to a finished allocation table with /30 (or /31) WAN links, and see why the largest subnets must be placed first. You will then learn to detect **overlapping subnets**, a common design and exam problem, both by calculation and from IOS output. Finally you will turn the idea around with **route summarization**: combining contiguous networks into a single shorter-prefix route, finding the best summary by binary comparison, and weighing the benefits against the risk of claiming addresses you do not use. VLSM and summarization build on topic 1.6 of v1.1 and on Domain 1 of v2.0, and both exam versions expect this kind of address math.',
  },
  {
    kind: 'compare',
    title: 'Fixed-length subnetting wastes space',
    left: {
      heading: 'FLSM: one mask everywhere',
      bullets: [
        '/26 everywhere: only **4 subnets** of 62 hosts',
        'The 100-host LAN does not fit at all',
        'Each WAN link wastes 60 of its 62 hosts',
        'Six segments, four subnets: the plan fails',
      ],
      tone: 'bad',
    },
    right: {
      heading: 'VLSM: size each subnet to fit',
      bullets: [
        '/25 for 100 hosts, /26 for 50, /27 for 25, /28 for 12',
        '/30 (or /31) for each WAN link',
        'All six segments fit in one /24',
        'A free block is left for growth',
      ],
      tone: 'good',
    },
    notes:
      'Suppose a company owns 192.168.20.0/24 and must address six segments: LANs of 100, 50, 25 and 12 hosts plus two router-to-router WAN links. With **fixed-length subnetting** you must pick one mask for everything. A /25 gives only two subnets. A /26 gives four subnets of 62 hosts: too few subnets, and the 100-host LAN does not fit anyway. A /27 gives eight subnets but only 30 hosts each. No single mask works, and whichever you choose wastes addresses, because every WAN link needs just two addresses yet consumes a whole subnet. **VLSM** lets each segment have its own prefix: /25 for 100 hosts, /26 for 50, /27 for 25, /28 for 12 and /30 for each WAN link. All six segments then fit into the /24 with eight addresses to spare. This is how real networks are addressed today, and it is exactly the kind of design the exam asks you to complete, extend or check for errors.',
  },
  {
    kind: 'bullets',
    title: 'VLSM rules',
    bullets: [
      'Different prefix lengths inside **one address block**',
      'Needs a **classless** routing protocol (OSPF, EIGRP, RIPv2) or static routes',
      'Allocate the **largest** subnets first',
      'Each subnet starts on a multiple of **its own** block size',
      'Subnets must **never overlap**; track used and free space',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'List segments', sub: 'hosts each', shape: 'pill' },
        { id: 'b', label: 'Sort', sub: 'largest first' },
        { id: 'c', label: 'Size', sub: 'prefix per segment' },
        { id: 'd', label: 'Allocate', sub: 'next free boundary' },
        { id: 'e', label: 'Verify', sub: 'no overlap', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      'VLSM works because routers treat every route as a prefix plus a mask, so 192.168.20.0/25 and 192.168.20.128/26 are simply two different destinations. That requires a **classless** routing protocol that carries the mask in its updates: OSPF, EIGRP, RIPv2, IS-IS and BGP all do, and static routes always include a mask. Classful protocols such as RIPv1 omit masks and assume one mask per major network, so they cannot handle VLSM. The design process follows a fixed recipe, shown in the flow. List every segment with its host count, including point-to-point links. Sort them from largest to smallest. Choose the longest prefix that still fits each one. Allocate each subnet at the next free address, which must be a multiple of that subnet\'s block size. Finally, record everything and check that no two ranges overlap. Two rules prevent almost every mistake: largest first, and every subnet begins on its own block boundary. The exam tests both, often by showing a partially completed plan and asking which subnet comes next.',
  },
  {
    kind: 'diagram',
    title: 'The design brief',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hq', icon: 'switch', label: 'HQ LAN', sub: '100 hosts', x: 1.2, y: 1.2 },
        { id: 'srv', icon: 'server', label: 'Servers', sub: '12 hosts', x: 1.2, y: 3.8 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.8, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.6, y: 1.2 },
        { id: 'r3', icon: 'router', label: 'R3', x: 6.6, y: 3.8 },
        { id: 'b1', icon: 'switch', label: 'Branch 1 LAN', sub: '50 hosts', x: 9, y: 1.2 },
        { id: 'b2', icon: 'switch', label: 'Branch 2 LAN', sub: '25 hosts', x: 9, y: 3.8 },
      ],
      links: [
        { from: 'hq', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'srv', to: 'r1', toLabel: 'G0/0/1' },
        { from: 'r1', to: 'r2', fromLabel: 'S0/1/0', label: 'WAN1 · 2 hosts', style: 'serial' },
        { from: 'r1', to: 'r3', fromLabel: 'S0/1/1', label: 'WAN2 · 2 hosts', style: 'serial' },
        { from: 'r2', to: 'b1', fromLabel: 'G0/0/0' },
        { from: 'r3', to: 'b2', fromLabel: 'G0/0/0' },
      ],
      annotations: [{ x: 5.2, y: 0.3, text: 'Block to divide: 192.168.20.0/24', tone: 'accent' }],
    },
    caption: 'Six segments, one /24: four LANs and two point-to-point WAN links.',
    notes:
      'Here is the brief for the worked design. The company has been given **192.168.20.0/24** and must address the network in the diagram. HQ router R1 connects the 100-host HQ LAN on G0/0/0 and a 12-host server LAN on G0/0/1. Two serial WAN links run from R1 to the branch routers, WAN1 to R2 and WAN2 to R3, each needing just two addresses, one per router. Branch 1 behind R2 has 50 hosts, and Branch 2 behind R3 has 25 hosts. That is six segments in total, and each needs its own subnet because each router interface is a separate broadcast domain. Before touching any numbers, confirm that the total fits: the smallest subnets that satisfy the requirements add up to 128 + 64 + 32 + 16 + 4 + 4 = 248 addresses, which is less than the 256 available. If the total exceeded the block, no clever allocation could help; you would need a larger block. Also note where growth is likely: a real designer leaves room, and an exam question may state a growth percentage that you must add first.',
  },
  {
    kind: 'table',
    title: 'Step 1: size every segment',
    columns: ['Segment', 'Hosts', 'Host bits (usable)', 'Prefix', 'Block size'],
    rows: [
      ['HQ LAN', '100', '7 (126)', '/25', '128'],
      ['Branch 1 LAN', '50', '6 (62)', '/26', '64'],
      ['Branch 2 LAN', '25', '5 (30)', '/27', '32'],
      ['Server LAN', '12', '4 (14)', '/28', '16'],
      ['WAN1 R1–R2', '2', '2 (2)', '/30', '4'],
      ['WAN2 R1–R3', '2', '2 (2)', '/30', '4'],
    ],
    caption: 'Total: 128 + 64 + 32 + 16 + 4 + 4 = 248 of 256 addresses.',
    notes:
      'Step 1 is pure subnetting: for each segment, find the smallest subnet that fits using 2^h − 2 ≥ hosts. The HQ LAN needs 100 hosts; 6 host bits give only 62, so it needs 7 host bits (126 hosts), a **/25** with a block size of 128. Branch 1 needs 50 hosts: 6 host bits (62) give a **/26**, block 64. Branch 2 needs 25: 5 host bits (30) give a **/27**, block 32. The server LAN needs 12: 4 host bits (14) give a **/28**, block 16. Each WAN link needs two addresses, and a **/30** gives exactly two usable hosts in a block of 4. The table is already sorted from largest to smallest, which is the order you will allocate in. Notice that the block sizes halve as you move down (128, 64, 32, 16, then 4 and 4); that pattern is what makes the largest-first rule work. Always record the block size next to the prefix, because the block size is what you add to find the next free address during allocation.',
  },
  {
    kind: 'steps',
    title: 'Step 2: allocate largest first',
    steps: [
      { title: 'HQ /25 at the start of the block', text: '192.168.20.0/25 → next free address .128' },
      { title: 'Branch 1 /26 at .128', text: '.128 is a multiple of 64 ✓ → next free .192' },
      { title: 'Branch 2 /27 at .192', text: '.192 is a multiple of 32 ✓ → next free .224' },
      { title: 'Servers /28 at .224', text: '.224 is a multiple of 16 ✓ → next free .240' },
      { title: 'WAN1 /30 at .240, WAN2 /30 at .244', text: 'Still free: 192.168.20.248/29 (.248 – .255)' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'HQ · 192.168.20.0/25', value: '192.168.20.0', prefix: 25 },
        { label: 'Branch 1 · 192.168.20.128/26', value: '192.168.20.128', prefix: 26 },
        { label: 'Branch 2 · 192.168.20.192/27', value: '192.168.20.192', prefix: 27 },
        { label: 'Servers · 192.168.20.224/28', value: '192.168.20.224', prefix: 28 },
        { label: 'WAN1 · 192.168.20.240/30', value: '192.168.20.240', prefix: 30 },
        { label: 'WAN2 · 192.168.20.244/30', value: '192.168.20.244', prefix: 30 },
      ],
    },
    notes:
      'Step 2 places the subnets in order, each starting at the next free address. HQ takes the first /25, 192.168.20.0/25, which ends at .127, so the next free address is .128. Branch 1\'s /26 needs a start that is a multiple of 64, and .128 is, so Branch 1 gets 192.168.20.128/26, ending at .191. Branch 2\'s /27 starts at .192 (a multiple of 32) and ends at .223. The server /28 starts at .224 (a multiple of 16) and ends at .239. The two WAN /30s take .240 and .244. Only 192.168.20.248/29 remains free, enough for two more /30 links. Notice that you never had to adjust a starting point: because every block is the same size or smaller than the one before it, the next free address is automatically a multiple of the next block size. The bits diagram shows the result. The network portion grows longer as the subnets shrink, and no subnet\'s network bits match the leading bits of another subnet, which is the binary way of saying that none of them overlap.',
  },
  {
    kind: 'table',
    title: 'The finished address plan',
    columns: ['Segment', 'Subnet', 'First host', 'Last host', 'Broadcast'],
    rows: [
      ['HQ LAN', '192.168.20.0/25', '.1', '.126', '.127'],
      ['Branch 1 LAN', '192.168.20.128/26', '.129', '.190', '.191'],
      ['Branch 2 LAN', '192.168.20.192/27', '.193', '.222', '.223'],
      ['Server LAN', '192.168.20.224/28', '.225', '.238', '.239'],
      ['WAN1 R1–R2', '192.168.20.240/30', '.241', '.242', '.243'],
      ['WAN2 R1–R3', '192.168.20.244/30', '.245', '.246', '.247'],
      ['Free', '192.168.20.248/29', '.249', '.254', '.255'],
    ],
    caption: 'Host columns show the 4th octet of 192.168.20.x.',
    notes:
      'The finished address plan is the deliverable of every VLSM exercise. For each segment it lists the subnet with its prefix, the first and last usable hosts, and the broadcast address. Conventions matter in practice: many organizations give the router (the default gateway) the first usable address, so R1\'s G0/0/0 becomes 192.168.20.1 and R2\'s LAN interface becomes 192.168.20.129. On WAN links the lower address usually goes to the hub router: R1 uses .241 on WAN1 and .245 on WAN2, and R2 and R3 take .242 and .246. Keeping the free block in the table is just as important. It records that 192.168.20.248/29 is unused, so a future designer can carve two more /30s from it without re-checking the whole plan. On the exam you may be handed a partial table and asked for the next subnet, the broadcast address of one row, or which row contains an error. Treat each row as its own subnetting problem, then check the rows against each other for overlap.',
  },
  {
    kind: 'diagram',
    title: 'Addressing the topology',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hq', icon: 'switch', label: 'HQ LAN', sub: '192.168.20.0/25', x: 1.2, y: 1.2 },
        { id: 'srv', icon: 'server', label: 'Servers', sub: '192.168.20.224/28', x: 1.2, y: 3.8 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.8, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.6, y: 1.2 },
        { id: 'r3', icon: 'router', label: 'R3', x: 6.6, y: 3.8 },
        { id: 'b1', icon: 'switch', label: 'Branch 1', sub: '192.168.20.128/26', x: 9, y: 1.2 },
        { id: 'b2', icon: 'switch', label: 'Branch 2', sub: '192.168.20.192/27', x: 9, y: 3.8 },
      ],
      links: [
        { from: 'hq', to: 'r1', toLabel: 'G0/0/0 .1' },
        { from: 'srv', to: 'r1', toLabel: 'G0/0/1 .225' },
        { from: 'r1', to: 'r2', fromLabel: '.241', toLabel: '.242', label: '192.168.20.240/30', style: 'serial' },
        { from: 'r1', to: 'r3', fromLabel: '.245', toLabel: '.246', label: '192.168.20.244/30', style: 'serial' },
        { from: 'r2', to: 'b1', fromLabel: 'G0/0/0 .129' },
        { from: 'r3', to: 'b2', fromLabel: 'G0/0/0 .193' },
      ],
    },
    caption: 'Each interface uses its own segment\'s mask; gateways take the first usable address.',
    notes:
      'Mapping the plan onto the topology is where errors surface, so always do it explicitly. Each router interface receives an address from the subnet of the segment it connects to, with the mask of that subnet, not the /24 of the original block. R1\'s G0/0/0 gets 192.168.20.1 with mask 255.255.255.128, and G0/0/1 gets 192.168.20.225 with mask 255.255.255.240. On the serial links, R1 uses 192.168.20.241/30 toward R2 and 192.168.20.245/30 toward R3, while R2 and R3 use .242 and .246 with the same /30 mask. The branch LAN gateways are 192.168.20.129/26 on R2 and 192.168.20.193/27 on R3. Hosts in each LAN use their router\'s address as the default gateway and the LAN\'s own mask; a Branch 2 PC might be 192.168.20.200 with mask 255.255.255.224 and gateway 192.168.20.193. A classic exam error hides a mismatched mask, or an address from the wrong subnet, on one end of a WAN link, so always check both ends of every link against the plan.',
  },
  {
    kind: 'diagram',
    title: 'Why largest first?',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Branch 2 placed first · 192.168.20.0/27', value: '192.168.20.0', prefix: 27 },
        { label: 'HQ squeezed in at .32 with /25?', value: '192.168.20.32', prefix: 25, tone: 'bad' },
        { label: 'The /25 containing .32 is 192.168.20.0/25', value: '192.168.20.0', prefix: 25, tone: 'bad' },
      ],
    },
    bullets: [
      '192.168.20.32 is **not** a /25 boundary (only .0 and .128 are)',
      'Its real /25 is 192.168.20.0/25, which **overlaps** Branch 2',
      'Largest first keeps every next free address on a valid boundary',
    ],
    notes:
      'Why insist on largest first? Watch what happens when a designer places the small Branch 2 /27 at the start of the block and then tries to put the HQ /25 "right after it" at 192.168.20.32. A /25 has a block size of 128, so the only /25 network IDs in this block are .0 and .128. The address .32 falls inside 192.168.20.0/25, as the second and third rows show: with a /25 mask, the bit worth 32 is a host bit. Configuring 192.168.20.32/25 therefore really means 192.168.20.0/25, which overlaps Branch 2 completely. The fix is to skip ahead to the next /25 boundary at .128, which works but leaves a gap from .32 to .127 that must then be filled carefully with smaller subnets. Allocating from largest to smallest avoids the whole problem, because each subnet ends exactly on a boundary that suits every smaller block that follows. Out-of-order designs are not automatically wrong, but they are where overlaps are born, and exam questions love to present one.',
  },
  {
    kind: 'bullets',
    title: 'WAN links: /30 or /31',
    bullets: [
      '**/30**: 4 addresses, 2 usable (.241 and .242 on WAN1)',
      '**/31** (RFC 3021): 2 addresses, both usable',
      'Two /31 links fit in the space of one /30',
      'With /31s: WAN1 .240/31, WAN2 .242/31, and .244–.255 stay free',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'WAN1 as /30 · 192.168.20.240', value: '192.168.20.240', prefix: 30 },
        { label: 'WAN1 as /31 · R1 192.168.20.240', value: '192.168.20.240', prefix: 31, tone: 'accent' },
        { label: 'WAN1 as /31 · R2 192.168.20.241', value: '192.168.20.241', prefix: 31, tone: 'accent' },
        { label: 'WAN2 as /31 · 192.168.20.242', value: '192.168.20.242', prefix: 31 },
      ],
    },
    notes:
      'Point-to-point links always connect exactly two devices, so they are the last and smallest items in a VLSM plan. The traditional choice is a **/30**: four addresses, of which the network ID and broadcast are reserved, leaving two usable addresses for the routers. In our plan WAN1 is 192.168.20.240/30, with the routers at .241 and .242. **RFC 3021** allows a **/31** on point-to-point links, where both addresses are usable and nothing is reserved, halving the cost. Using /31s, WAN1 becomes 192.168.20.240/31 (R1 .240, R2 .241) and WAN2 becomes 192.168.20.242/31 (R1 .242, R3 .243), which frees .244 to .255 for future use. Service providers and data centers with hundreds of links use /31s routinely. For the exam, read the question carefully: if it asks for the "most efficient" mask for a point-to-point link with no mention of RFC 3021, the expected answer is usually /30; if it mentions /31 or RFC 3021, both addresses in the /31 are assigned to the routers.',
  },
  {
    kind: 'steps',
    title: 'Detecting overlapping subnets',
    steps: [
      { title: 'Write each subnet as a range', text: 'Network ID → broadcast address.' },
      { title: 'Sort by network ID', text: 'Compare each range with the ones before it.' },
      { title: 'Overlap = a network ID inside another range', text: 'Aligned blocks either nest completely or never touch.' },
      { title: 'Binary shortcut for a pair', text: 'Apply the **shorter** prefix to both network IDs; equal results mean overlap.' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: '10.1.4.0/22', value: '10.1.4.0', prefix: 22 },
        { label: '10.1.6.0 under /22 → 10.1.4.0: overlap', value: '10.1.6.0', prefix: 22, tone: 'bad' },
        { label: '10.1.8.0 under /22 → 10.1.8.0: no overlap', value: '10.1.8.0', prefix: 22, tone: 'good' },
      ],
    },
    notes:
      'Two subnets **overlap** when at least one address belongs to both. Because properly aligned CIDR blocks either nest completely inside one another or do not touch at all, an overlap always means that one subnet contains the other. The range method is the most intuitive: write each subnet as network ID to broadcast, sort by network ID, and look for any network ID that falls inside an earlier range. The binary method is faster for a single pair: take the shorter of the two prefixes and apply it to both network IDs. If the results are equal, the smaller subnet sits inside the larger one. In the diagram, 10.1.4.0/22 covers 10.1.4.0 through 10.1.7.255. Applying /22 to 10.1.6.0 gives 10.1.4.0, the same network, so 10.1.6.0/24 overlaps it. Applying /22 to 10.1.8.0 gives 10.1.8.0, a different network, so 10.1.8.0/24 is safe. Exam questions usually present a list of existing subnets and ask which new subnet can be added, or which two existing subnets conflict.',
  },
  {
    kind: 'table',
    title: 'Overlap audit: find the conflicts',
    columns: ['Segment', 'Subnet', 'Range', 'Status'],
    rows: [
      ['LAN 1', '172.16.20.0/25', '.0 – .127', 'Contains LAN 2'],
      ['LAN 2', '172.16.20.96/27', '.96 – .127', '**Overlaps LAN 1**'],
      ['LAN 3', '172.16.20.128/26', '.128 – .191', 'Contains LAN 4'],
      ['LAN 4', '172.16.20.160/28', '.160 – .175', '**Overlaps LAN 3**'],
      ['WAN', '172.16.20.192/30', '.192 – .195', 'OK'],
    ],
    caption: 'Ranges show the 4th octet of 172.16.20.x. Fix: move LAN 2 to .224/27 and LAN 4 to .208/28.',
    notes:
      'Here is an audit of a plan that someone built by hand. Converting every subnet to a range makes the problems jump out. LAN 1, 172.16.20.0/25, runs from .0 to .127. LAN 2, 172.16.20.96/27, runs from .96 to .127, entirely inside LAN 1. LAN 3, 172.16.20.128/26, runs from .128 to .191, and LAN 4, 172.16.20.160/28, sits inside it at .160 to .175. Only the WAN subnet, .192 to .195, is clean. Notice that each conflicting pair looks innocent in slash notation; you only see the overlap when you compute ranges or compare network bits. The fix is to move the smaller subnets into genuinely free space. Everything from .196 to .255 is unused, so LAN 2 can move to 172.16.20.224/27 and LAN 4 to 172.16.20.208/28, both of which start on their own block boundaries and leave .196 to .207 free. Exam questions frequently present exactly this kind of table and ask "which two subnets overlap?" or "which subnet can be assigned to the new LAN?"',
  },
  {
    kind: 'cli',
    title: 'What overlap looks like on IOS',
    code: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip address 172.16.20.97 255.255.255.224
% 172.16.20.96 overlaps with GigabitEthernet0/0/0
R1(config-if)# end
R1# show ip route | include 172.16
      172.16.0.0/16 is variably subnetted, 3 subnets, 3 masks
C        172.16.20.0/25 is directly connected, GigabitEthernet0/0/0
L        172.16.20.1/32 is directly connected, GigabitEthernet0/0/0
O        172.16.20.96/27 [110/65] via 10.0.12.2, 00:03:12, Serial0/1/0`,
    highlight: ['overlaps with', '172.16.20.96/27'],
    caption: 'Same router: IOS refuses the overlap. Different routers: nothing stops it, and the longer /27 wins.',
    notes:
      'IOS protects you from overlaps on a **single router**: when an interface address falls inside a subnet already configured on another interface, IOS prints an "overlaps with" message naming that interface and refuses the command. It cannot protect you across routers, because each router checks only its own interfaces. In the second half of the transcript, the same overlapping subnet was configured on R2\'s LAN instead. R2 advertises 172.16.20.96/27 with OSPF, and R1 installs it alongside its own connected 172.16.20.0/25. Because routers forward using the **longest prefix match**, any packet R1 routes toward 172.16.20.96–127 now follows the /27 to R2, even though hosts with those addresses may live on R1\'s own LAN. The symptom is baffling: some hosts on a LAN are reachable from other sites and others are not, depending only on their addresses. Administrative distance does not help, because the /25 and the /27 are different prefixes. Whenever an exhibit shows a more specific route that falls inside a connected subnet, suspect an addressing overlap.',
  },
  {
    kind: 'diagram',
    title: 'Route summarization',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'HQ: 1 route instead of 4', x: 1.5, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'Branch edge', x: 5, y: 2.5 },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', sub: '172.16.0.0/24 – 172.16.3.0/24', x: 8.3, y: 2.5 },
      ],
      links: [
        { from: 'r2', to: 'r1', label: 'Advertises 172.16.0.0/22 only', arrow: 'forward', tone: 'accent' },
        { from: 'r2', to: 'dsw', label: 'four /24s' },
      ],
      groups: [{ label: 'Branch block 172.16.0.0/22', x: 3.6, y: 0.7, w: 6.2, h: 3.6, tone: 'muted' }],
    },
    caption: 'One summary route represents four contiguous /24 networks.',
    notes:
      '**Route summarization** (also called route aggregation or supernetting) is VLSM in reverse: instead of splitting a block into smaller subnets, you advertise several contiguous subnets as one shorter prefix. In the diagram, the branch uses four /24 networks, 172.16.0.0 through 172.16.3.0, for four VLANs routed by DSW1. Rather than advertising all four to HQ, R2 advertises the single summary **172.16.0.0/22**, which covers exactly those four networks. R1 now holds one route instead of four and forwards any packet for 172.16.0.0 through 172.16.3.255 to R2, which knows the detailed routes. Summarization only works cleanly when addressing is hierarchical: each site receives a contiguous, aligned block, so its networks share leading bits. That is a major reason to plan addresses by site rather than handing them out at random. Summaries can be configured in routing protocols (for example in EIGRP, or at OSPF area boundaries) or as static routes, and the math to find them is the same everywhere.',
  },
  {
    kind: 'steps',
    title: 'Finding the best summary',
    steps: [
      { title: 'Write the networks in binary', text: 'Only the octets that differ need converting.' },
      { title: 'Count the matching leading bits', text: '172.16.0.0 – 172.16.3.0: the first 22 bits match.' },
      { title: 'That count is the prefix', text: '**/22**' },
      { title: 'Keep the matching bits, zero the rest', text: 'Summary: **172.16.0.0/22**' },
      { title: 'Check what else it covers', text: 'A /22 holds 4 × /24: exactly the four networks.' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: '172.16.0.0/24', value: '172.16.0.0', prefix: 22 },
        { label: '172.16.1.0/24', value: '172.16.1.0', prefix: 22 },
        { label: '172.16.2.0/24', value: '172.16.2.0', prefix: 22 },
        { label: '172.16.3.0/24', value: '172.16.3.0', prefix: 22 },
        { label: 'Summary 172.16.0.0/22', value: '172.16.0.0', prefix: 22, tone: 'accent' },
      ],
    },
    notes:
      'To find the best (longest) summary of a set of networks, compare them in binary. The first two octets, 172.16, are identical in all four networks, so only the third octet needs converting: 0 is 00000000, 1 is 00000001, 2 is 00000010 and 3 is 00000011. Reading from the left, the first six bits of the third octet match in every network, and the last two bits differ. That gives 8 + 8 + 6 = **22** matching bits, so the summary prefix is /22. Copy the matching bits and set every remaining bit to 0: the summary network is **172.16.0.0/22**. Finally, check what the summary covers: a /22 contains 2^(24 − 22) = 4 /24 networks, 172.16.0.0 through 172.16.3.0, exactly the four we started with, so this summary is exact. A useful shortcut follows: 2^n equal-size networks summarize exactly into one route whose prefix is n bits shorter, provided the first network is aligned on a multiple of 2^n blocks. Four /24s starting at a multiple of 4 always make a clean /22.',
  },
  {
    kind: 'diagram',
    title: 'Summarizing inside the 4th octet',
    diagram: {
      type: 'bits',
      rows: [
        { label: '192.168.1.64/28', value: '192.168.1.64', prefix: 26 },
        { label: '192.168.1.80/28', value: '192.168.1.80', prefix: 26 },
        { label: '192.168.1.96/28', value: '192.168.1.96', prefix: 26 },
        { label: '192.168.1.112/28', value: '192.168.1.112', prefix: 26 },
        { label: 'Summary 192.168.1.64/26', value: '192.168.1.64', prefix: 26, tone: 'accent' },
      ],
    },
    bullets: [
      'Four /28s start at .64, .80, .96 and .112',
      'Matching bits: 24 + 2 = **/26**',
      'Summary **192.168.1.64/26** spans .64 – .127 exactly',
      'Check: 4 × 16 = 64 addresses = one /26',
    ],
    notes:
      'Summaries work in any octet, including inside a /24. Suppose four /28 server subnets start at .64, .80, .96 and .112 in 192.168.1.0/24. Convert the fourth octet: 64 is 01000000, 80 is 01010000, 96 is 01100000 and 112 is 01110000. The first two bits (01) match in all four, while the next two bits vary, so the summary keeps 24 + 2 = 26 bits. Zeroing the rest gives **192.168.1.64/26**, which spans .64 through .127. Check the arithmetic another way: four /28s hold 4 × 16 = 64 addresses, exactly the size of one /26, and .64 is a multiple of 64, so the summary is exact. If the four subnets had started at .80 instead (.80, .96, .112 and .128), the leading bits would stop matching immediately, because 128 is 10000000, and the only single summary would be 192.168.1.0/24, four times larger than needed. Alignment on the summary\'s own block boundary is what makes a summary tight, which is another reason to allocate VLSM blocks in contiguous, aligned groups.',
  },
  {
    kind: 'diagram',
    title: 'When the summary is not exact',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'First network · 172.16.8.0/24', value: '172.16.8.0', prefix: 21 },
        { label: 'Last network · 172.16.13.0/24', value: '172.16.13.0', prefix: 21 },
        { label: 'Summary · 172.16.8.0/21', value: '172.16.8.0', prefix: 21, tone: 'accent' },
        { label: 'Covered but unused · 172.16.14.0', value: '172.16.14.0', prefix: 21, tone: 'warn' },
        { label: 'Covered but unused · 172.16.15.0', value: '172.16.15.0', prefix: 21, tone: 'warn' },
      ],
    },
    bullets: [
      'Six networks: 172.16.8.0/24 – 172.16.13.0/24',
      'Matching bits: 16 + 5 = **/21** → 172.16.8.0/21',
      'The /21 also claims **172.16.14.0** and **172.16.15.0**',
      'Exact alternative: 172.16.8.0/22 + 172.16.12.0/23',
    ],
    notes:
      'Real networks rarely come in neat powers of two. A site using six networks, 172.16.8.0/24 through 172.16.13.0/24, has no exact single summary. Comparing the first and last networks is enough to find the best one: 8 is 00001000 and 13 is 00001101, so only the first five bits of the third octet match, giving 16 + 5 = 21 bits and the summary **172.16.8.0/21**. That /21 spans 172.16.8.0 through 172.16.15.255, so it also advertises 172.16.14.0/24 and 172.16.15.0/24, which the site does not use. Whether that matters depends on the rest of the network. If those networks are simply unassigned, packets for them travel to this site for nothing. If they exist elsewhere, their own more specific routes still win by longest match, but whenever those routes disappear, traffic falls back to the summary and heads to the wrong site. When precision matters, advertise two routes instead: 172.16.8.0/22 (networks 8–11) and 172.16.12.0/23 (networks 12–13). Exam questions call the /21 the "most efficient summary that includes all networks".',
  },
  {
    kind: 'cli',
    title: 'A static summary route',
    code: `R1(config)# ip route 172.16.0.0 255.255.252.0 10.0.12.2
R1(config)# end
R1# show ip route static | include 172.16
      172.16.0.0/22 is subnetted, 1 subnets
S        172.16.0.0 [1/0] via 10.0.12.2
R1# show ip route 172.16.3.77
Routing entry for 172.16.0.0/22
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
      Route metric is 0, traffic share count is 1`,
    highlight: ['255.255.252.0', '172.16.0.0/22'],
    caption: 'One static route covers 172.16.0.0 – 172.16.3.255; any address in that range matches it.',
    notes:
      'The simplest way to use a summary is a static route. On R1, one command replaces four: `ip route 172.16.0.0 255.255.252.0 10.0.12.2` sends everything from 172.16.0.0 through 172.16.3.255 to R2. The mask is the dotted-decimal form of /22 (255.255.252.0), not a wildcard mask. In the routing table, IOS lists the route under the heading "172.16.0.0/22 is subnetted, 1 subnets": when every route in a classful network shares one mask, IOS shows the mask in the heading and omits it from the route line. `show ip route 172.16.3.77` proves that an address inside the range matches the summary, with the static route\'s administrative distance of 1. A common exam distractor offers 255.255.248.0 (/21), which would also cover 172.16.4.0 through 172.16.7.255, or a /30 mask that covers only four addresses. The summary network ID must itself be aligned to its own block size: for a /22 in this octet only .0, .4, .8, .12 … are valid boundaries. A typo like `ip route 172.16.2.0 255.255.252.0 10.0.12.2` is easy to type and easy to miss, so always compute the correct network ID yourself rather than eyeballing it.',
  },
  {
    kind: 'compare',
    title: 'Benefits and risks of summarization',
    left: {
      heading: 'Benefits',
      bullets: [
        'Smaller routing tables: less memory and CPU',
        'Fewer and smaller routing updates',
        'Stability: a flapping subnet stays hidden behind the summary',
        'Faster convergence, simpler troubleshooting',
      ],
      tone: 'good',
    },
    right: {
      heading: 'Risks',
      bullets: [
        'May claim **unused or foreign** address space',
        'Traffic for unused space is attracted and dropped',
        'Less detail can mean suboptimal paths',
        'Needs contiguous, hierarchical addressing',
      ],
      tone: 'warn',
    },
    notes:
      'The benefits of summarization all come from carrying less detail. Routing tables shrink, so routers need less memory and CPU, and routing updates are fewer and smaller. Stability improves because a summary hides change: if one subnet inside 172.16.0.0/22 flaps up and down, R2 keeps advertising the same summary, so routers beyond R2 have nothing to recalculate. That also speeds convergence and makes large networks easier to troubleshoot. The costs come from the same loss of detail. A summary that is broader than the networks behind it claims address space the site does not use, so traffic for those addresses is drawn to the site and dropped there. If part of that space exists elsewhere, its more specific routes normally win, but traffic falls back to the summary whenever those routes are missing. Summaries can also cause suboptimal routing when a site is reachable over several paths, because other routers no longer see which path is best for each subnet. And summarization only works well with hierarchical addressing, where each site owns contiguous, aligned blocks.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: VLSM and summarization',
    body: 'These questions reward ==checking boundaries and ranges==, not intuition.',
    bullets: [
      'Allocate **largest first**; each subnet starts on a multiple of its block size',
      '192.168.1.32/25 and 10.0.0.32/26 are not valid network IDs',
      'Overlap = one range inside another; compare **ranges**, not slash notation',
      'IOS rejects overlaps only on the **same** router',
      'Best summary = matching leading bits, rest set to 0',
      'Four networks make a /22 only if the first is a multiple of 4',
      'Summary masks are subnet masks (255.255.252.0), not wildcards',
    ],
    notes:
      'VLSM and summarization questions look intimidating but reward a careful routine. For design questions, sort by size, allocate from the start of the block, and confirm that every starting address is a multiple of its own block size; options such as 192.168.1.32/25 or 10.0.0.32/26 are invalid starting points, not clever shortcuts. For overlap questions, convert each subnet to a range, because slash notation hides overlaps and ranges expose them. Remember that IOS rejects an overlapping address on the same router but happily accepts overlaps spread across different routers, where they show up as longest-match misrouting. For summaries, compare the networks in binary, count the identical leading bits, and zero the rest; when the number of networks is a power of two, check that the first one is aligned, or the summary will be larger than you expect. Distractors often offer a summary one bit too short (covering extra space), one bit too long (missing networks), or a wildcard mask where a subnet mask belongs.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'VLSM: a different prefix per segment, sized to its hosts',
      'Process: list → sort largest first → size → allocate on boundaries → verify',
      'WAN links: /30 traditionally, /31 with RFC 3021',
      'Overlap: one range inside another; test with the shorter prefix',
      'IOS blocks overlaps on one router, never across routers',
      'Summary: count matching leading bits; exact when aligned powers of two',
      'Benefits: smaller tables and stability; risk: claiming unused space',
    ],
    notes:
      'VLSM lets each segment receive exactly the prefix it needs, which is how real address plans are built. The procedure never changes: list the segments with their host counts, sort them from largest to smallest, size each one with 2^h − 2, allocate each subnet at the next free address on its own block boundary, and record the result, including the free space. Point-to-point links get /30s, or /31s where RFC 3021 is used. Overlaps occur when one subnet\'s range falls inside another\'s; find them by comparing ranges or by applying the shorter prefix to both network IDs, and remember that IOS only catches them within a single router. Summarization combines contiguous networks into one route: the summary prefix is the number of identical leading bits, and it is exact only when the networks form an aligned power-of-two group. Summaries shrink routing tables and hide instability, at the risk of advertising address space you do not own or use. Next, you will look at the private address ranges most of these designs are built from.',
  },
];
