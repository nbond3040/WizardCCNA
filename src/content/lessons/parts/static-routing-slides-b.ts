import type { Slide } from '../../types';

export const slidesB: Slide[] = [
  {
    kind: 'cli',
    title: 'Watching the floating static take over',
    code: `R1(config)# ip route 10.2.2.0 255.255.255.0 192.168.12.2 130
R1(config)# end
R1# show ip route | include 10.2.2.0
O        10.2.2.0/24 [110/2] via 10.0.12.2, 00:12:40, GigabitEthernet0/0/1

%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/0/1 from FULL to DOWN, Neighbor Down: Interface down or detached

R1# show ip route | include 10.2.2.0
S        10.2.2.0/24 [130/0] via 192.168.12.2`,
    highlight: ['[110/2]', '[130/0]'],
    caption: 'Same prefix, two sources: the lower AD is installed; the static appears only when OSPF withdraws.',
    notes:
      'Right after the floating static is configured, nothing visible changes: the table still shows the **O** route with **[110/2]** — AD 110, OSPF cost 2 — learned via 10.0.12.2 on G0/0/1. The static exists only in the running configuration. Then the Gigabit link goes down; the OSPF adjacency log message appears, OSPF removes its route, and the router immediately installs the next-best candidate: **S 10.2.2.0/24 [130/0] via 192.168.12.2**. Notice the brackets now show the configured AD, 130. When the Gigabit link and the adjacency return, the OSPF route (110) beats the static (130) and the static disappears again — failback is automatic. Two exam points hide here. First, "the floating static is missing from `show ip route`" is **normal** while the primary is up. Second, the takeover happens only when the primary route actually leaves the table; a primary that stays installed while the path behind it is broken will never trigger the backup.',
  },
  {
    kind: 'table',
    title: 'Choosing the AD for a floating static',
    columns: ['Primary route source', 'Default AD', 'Floating static AD must be', 'Typical choice'],
    rows: [
      ['Static route', '1', '2–254', '`5` or `10`'],
      ['EIGRP (internal)', '90', '91–254', '`95`'],
      ['OSPF', '110', '111–254', '`115`–`130`'],
      ['RIP', '120', '121–254', '`125`'],
      ['eBGP / iBGP', '20 / 200', 'above the primary', 'depends on design'],
      ['Any route with AD **255**', '—', 'never installed', 'do not use'],
    ],
    caption: 'Other defaults: connected 0, IS-IS 115, EIGRP external 170, unknown 255.',
    notes:
      'Administrative distance is the router\'s ranking of **route sources**; it is compared only when two sources offer the **same prefix and length**. Lower is more trusted. For a floating static to stay out of the table, its AD must be **greater** than the AD of whatever it backs up. Backing up OSPF therefore needs at least 111; many engineers pick a round number such as 130 or 150 for clarity. Be careful with numbers that look safe but are not: an AD of **100** is *lower* than OSPF\'s 110, so that "backup" would be preferred and would steal traffic from OSPF permanently. An AD of **255** means "unusable" — a static route with AD 255 is never installed, so it cannot act as a backup either. When the primary is itself a static route (AD 1), any value from 2 upward works; 5 is a common convention. The exam writes these as `ip route ... <AD>` options, so read the last number on each line.',
  },
  {
    kind: 'bullets',
    title: 'When IOS will not install a static route',
    bullets: [
      '**Exit interface down** (down/down or administratively down)',
      '**Next hop not resolvable** — no route covers the next-hop address',
      'A route with **lower AD** already exists for the same prefix (floating)',
      'AD set to **255** — the route is never used',
      'Typo in prefix/mask: host bits set → rejected ("Inconsistent address and mask")',
      'Configured ≠ installed: compare `show run | include ip route` with `show ip route`',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 4,
      nodes: [
        { id: 'c', label: 'ip route configured', shape: 'pill', x: 1.1, y: 1.1 },
        { id: 'i', label: 'Exit interface up?', sub: 'if one is named', shape: 'diamond', x: 3.6, y: 1.1 },
        { id: 'n', label: 'Next hop reachable?', sub: 'recursive lookup', shape: 'diamond', x: 6.1, y: 1.1 },
        { id: 'a', label: 'Lowest AD?', sub: 'for this prefix', shape: 'diamond', x: 8.6, y: 1.1 },
        { id: 'ok', label: 'Installed', shape: 'round', tone: 'good', x: 8.6, y: 3.1 },
        { id: 'no', label: 'Not installed', sub: 'stays in running-config', shape: 'round', tone: 'bad', x: 4.85, y: 3.1 },
      ],
      edges: [
        { from: 'c', to: 'i' },
        { from: 'i', to: 'n', label: 'yes' },
        { from: 'n', to: 'a', label: 'yes' },
        { from: 'a', to: 'ok', label: 'yes', tone: 'good' },
        { from: 'i', to: 'no', label: 'no', tone: 'bad' },
        { from: 'n', to: 'no', label: 'no', tone: 'bad' },
        { from: 'a', to: 'no', label: 'no — floats', dashed: true },
      ],
    },
    notes:
      'A static route in the running configuration is only a **candidate**. IOS installs it in the routing table (the RIB) only when it is usable. If the route names an **exit interface**, that interface must be up/up; shut it down or unplug it and the route vanishes. If the route names a **next hop**, the router must be able to reach that address through some other route — normally a connected subnet. A typo such as 10.0.21.2 instead of 10.0.12.2 leaves the next hop unresolvable, so the route silently never appears. Even a usable route stays out if a lower-AD route for the same prefix exists; that is the floating static behavior, working as designed. IOS catches some typos at the prompt: if the prefix has host bits set for the mask you typed (for example 10.2.2.0 with 255.255.0.0), it rejects the command with an "Inconsistent address and mask" error. When troubleshooting, always compare **what is configured** with **what is installed** — the gap between them is the clue.',
  },
  {
    kind: 'cli',
    title: 'Verification: configured versus installed',
    code: `R1# show running-config | include ip route
ip route 10.2.2.0 255.255.255.0 10.0.12.2
ip route 10.2.2.0 255.255.255.0 192.168.12.2 5
R1# show ip route static | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
S        10.2.2.0/24 [1/0] via 10.0.12.2
R1# show ip route 10.2.2.77
Routing entry for 10.2.2.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
      Route metric is 0, traffic share count is 1
R1# show ip route 10.3.3.0
% Subnet not in table`,
    highlight: ['192.168.12.2 5', 'Known via "static", distance 1, metric 0', '% Subnet not in table'],
    caption: 'Two statics are configured; only the AD 1 route is installed. The AD 5 route is floating.',
    notes:
      'Three commands answer three questions. `show running-config | include ip route` shows **what you typed**: here a primary static (AD 1) and a floating backup with AD **5**. `show ip route static` shows **what was installed** — only the AD 1 route, because the backup is floating, exactly as intended. `show ip route <address>` performs a lookup and prints the entry that would be used: asking for host 10.2.2.77 returns the **Routing entry for 10.2.2.0/24**, "Known via static, distance 1, metric 0", with the next hop in the Routing Descriptor Blocks. That is the fastest way to answer "which route will this router use for X?" on a real device. When nothing matches, IOS says **% Subnet not in table** if other subnets of the same classful network exist (10.0.0.0 here), or **% Network not in table** if the classful network is absent entirely. If a default route is installed, the lookup returns the default route\'s entry for any address that nothing more specific covers, so these error messages appear only when no route at all, default included, matches.',
  },
  {
    kind: 'cli',
    title: 'Ping from R1 works — from the LAN it fails',
    code: `R1# ping 10.2.2.100
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.2.2.100, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms
R1# ping 10.2.2.100 source GigabitEthernet0/0/0
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.2.2.100, timeout is 2 seconds:
Packet sent with a source address of 10.1.1.1
.....
Success rate is 0 percent (0/5)`,
    highlight: ['source GigabitEthernet0/0/0', '.....'],
    caption: 'A router\'s ping uses the exit interface address as its source unless you choose one.',
    notes:
      'This pair of pings is the classic proof of a **missing return route**. A ping originated by R1 uses the address of its **exit interface** as the source — 10.0.12.1 — and R2 knows 10.0.12.0/30 as a connected subnet, so Server1\'s reply comes straight back: five exclamation marks. The second ping uses the `source` option to send from R1\'s LAN address, 10.1.1.1, which is how PC1\'s traffic really looks to the far end. Now Server1 replies to 10.1.1.1, R2 looks up 10.1.1.1, finds **no route**, and drops the reply; R1 sees five timeouts (**.....**). The fix is on R2, not R1: `ip route 10.1.1.0 255.255.255.0 10.0.12.1`. Always test with a sourced (or extended) ping, or from an actual host, because a plain router ping can hide a broken return path. The exam version of this story shows R1\'s perfect routing table and asks why PC1 still cannot reach the server.',
  },
  {
    kind: 'diagram',
    title: 'Forward path fine, return path broken',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 0.9, y: 1.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'S 10.2.2.0/24 ✓', x: 3.4, y: 1.5, tone: 'good' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'no 10.1.1.0/24 ✗', x: 6.6, y: 1.5, tone: 'bad' },
        { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.100', x: 9.1, y: 1.5 },
      ],
      links: [
        { from: 'pc1', to: 'r1', arrow: 'forward', tone: 'good', label: 'echo request' },
        { from: 'r1', to: 'r2', arrow: 'forward', tone: 'good', label: 'echo request' },
        { from: 'r2', to: 'srv', arrow: 'both', label: 'request / reply' },
      ],
      annotations: [
        { x: 5, y: 3.3, text: 'Echo reply to 10.1.1.10 reaches R2 → no matching route → dropped', tone: 'bad' },
      ],
    },
    caption: 'Every router on the path needs a route for BOTH directions.',
    notes:
      'Draw the two directions separately whenever connectivity fails. Forward: PC1 sends to its gateway R1, R1 matches its static route and forwards to R2, and R2 delivers to Server1 on its connected LAN — every hop has a route, so the request arrives. Return: Server1 sends its reply to its own gateway R2 with destination 10.1.1.10. R2 has no route covering 10.1.1.0/24 and no default route, so it drops the packet (and may send an ICMP unreachable toward the server). The user simply sees "Request timed out". The same failure appears with **asymmetric** mistakes, for example when R2\'s return route has a typo in the prefix or points to a wrong next hop. Asymmetric routing — where the forward and return paths are different but both valid — is not automatically a fault, but it confuses troubleshooting and can break stateful firewalls, so keep static designs symmetrical unless you have a reason not to.',
  },
  {
    kind: 'cli',
    title: 'Traceroute reveals a routing loop',
    code: `C:\\> tracert -d 10.2.2.100

Tracing route to 10.2.2.100 over a maximum of 30 hops

  1     1 ms     1 ms     1 ms  10.1.1.1
  2     1 ms     1 ms     1 ms  10.0.12.2
  3     2 ms     1 ms     1 ms  10.0.12.1
  4     2 ms     1 ms     2 ms  10.0.12.2
  5     2 ms     2 ms     2 ms  10.0.12.1
  6     3 ms     2 ms     2 ms  10.0.12.2`,
    highlight: ['10.0.12.2', '10.0.12.1'],
    caption: 'Hops alternate between the same two addresses until the TTL runs out.',
    notes:
      'Traceroute sends probes with TTL 1, 2, 3 and so on; each router that decrements a TTL to zero returns an ICMP Time Exceeded message, revealing itself. A healthy trace ends at the destination. This one never does: after R1 (10.1.1.1) the hops **alternate** between R2 (10.0.12.2) and R1 (10.0.12.1) — a **routing loop**. How does that happen with static routes? R2\'s LAN interface went down, so its connected route to 10.2.2.0/24 disappeared, and R2 fell back to its **default route**, which points back to R1. R1 still has its static route to 10.2.2.0/24 via R2, so the packet bounces until the TTL expires. The same pattern appears when two routers point static routes at each other for a subnet neither owns — a wrong next hop. Contrast this with a trace that stops and prints `* * *` rows: that means the packet was dropped (or replies were filtered) after the last router that answered.',
  },
  {
    kind: 'steps',
    title: 'Troubleshooting a static route',
    steps: [
      { title: 'Is the route installed?', text: '`show ip route 10.2.2.100` — if not, compare with `show running-config | include ip route`.' },
      { title: 'Is the next hop right and reachable?', text: 'It must be the neighbor\'s address in a connected subnet; `show ip interface brief` for up/up.' },
      { title: 'Does the prefix/mask cover the host?', text: 'A /25 of 10.2.2.0 covers only .0–.127; a wrong mask misses hosts.' },
      { title: 'Does every router have a return route?', text: 'Ping with `source` set to the LAN interface, or test from a real host.' },
      { title: 'Trace the path', text: '`traceroute` / `tracert`: repeating hops = loop; `* * *` = dropped after the last reply.' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Installed?', shape: 'diamond' },
        { id: 'b', label: 'Next hop OK?', shape: 'diamond' },
        { id: 'c', label: 'Mask covers?', shape: 'diamond' },
        { id: 'd', label: 'Return route?', shape: 'diamond', tone: 'accent' },
        { id: 'e', label: 'Traceroute', shape: 'round' },
      ],
    },
    notes:
      'Work through static routing faults in a fixed order so you never skip the obvious. First, **is the route in the table?** If `show ip route` lacks it, the configuration may be missing, or it may be present but not installed because the next hop is unresolvable or the exit interface is down. Second, **is the next hop the neighbor\'s address?** A common typo points to the router\'s own address (IOS rejects that), to a nonexistent address (route not installed), or to a real but wrong router (installed, but traffic goes astray). Third, **check the mask**: `ip route 10.2.2.0 255.255.255.128 ...` is accepted but only covers 10.2.2.0–10.2.2.127, so Server1 at .100 works while a host at .200 does not — a partial-failure symptom the exam loves. Fourth, **check the return path** on every router, because routes are one-way. Finally, **trace** the path: a loop or a black hole tells you which router to inspect next.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: static routing',
    body: 'Read the **last number** of every `ip route` option (the AD) and always ask: does the **other router** have a route back?',
    bullets: [
      'Exit-interface-only route shows "is directly connected" with **no [AD/metric]** — AD is still 1',
      'A floating static is **absent** from `show ip route` while the primary is up — that is normal',
      'Floating AD must be **higher** than the primary (> 110 for OSPF); 255 is never installed',
      'Next hop unreachable or exit interface down → route **not installed**',
      'Masks are dotted decimal: `255.255.255.0`, never `/24` or a wildcard',
      '**S*** + "Gateway of last resort is …" = static default route installed',
    ],
    notes:
      'These are the traps that cost candidates points. First, recognize the three display formats: only the exit-interface form hides the [AD/metric] brackets, and it is *not* AD 0 — it is a static route with AD 1 that IOS treats as directly connected. Second, never mark "the floating static route is misconfigured" just because it is missing from the routing table; it is supposed to be missing until the primary disappears. Third, compare ADs numerically, not by intuition: 100 does not float over OSPF, 130 does; 255 means unusable. Fourth, when a stem says a route is configured but traffic fails, check whether the route is even installed (next hop reachable? interface up?). Fifth, IPv4 `ip route` needs a dotted-decimal mask; options showing `/24` or `0.0.0.255` are wrong. Finally, when PC-to-server traffic fails but the router pings succeed, suspect the return route on the far router.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '`ip route prefix mask {next-hop | exit-if | exit-if next-hop} [AD]`',
      'Next-hop routes are **recursive**; fully specified routes name both',
      'Ethernet exit-interface-only routes rely on **proxy ARP** — avoid them',
      '**Host** /32, **default** 0.0.0.0/0 (S*, gateway of last resort)',
      '**Floating static**: AD above the primary; installed only when the primary leaves',
      'Not installed if next hop unreachable or exit interface down',
      'Verify with `show ip route static`, `show ip route <addr>`, sourced ping, traceroute',
    ],
    notes:
      'Static routing comes down to a handful of rules. The command always takes a destination prefix, a dotted-decimal mask and a forwarding instruction: a next hop (recursive lookup), an exit interface (directly attached — fine on serial, poor on Ethernet because of proxy ARP), or both (fully specified). Special masks give you **host routes** (/32) that override broader routes through longest prefix match, and the **default route** (0.0.0.0 0.0.0.0) that catches everything else and sets the gateway of last resort. A trailing AD value turns any static into a **floating** backup that is installed only when every better route to the same prefix is gone. A configured static is installed only if its interface is up and its next hop resolvable. And because routes are one-way, every router on the path needs routes in both directions. Next, you will apply the same ideas to IPv6, where link-local next hops add one more rule.',
  },
];
