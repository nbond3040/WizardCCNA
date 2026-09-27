import type { Slide } from '../../types';

export const slidesB: Slide[] = [
  {
    kind: 'steps',
    title: 'Configuring a floating static route',
    steps: [
      { title: 'Identify the primary route and its AD', text: 'A plain static route has AD 1; an OSPF route has 110' },
      { title: 'Choose a different backup path', text: 'Another next hop or exit interface that reaches the same prefix' },
      { title: 'Configure it with a higher AD', text: '`ipv6 route 2001:db8:2::/64 2001:db8:99::2 130`' },
      { title: 'Confirm it stays hidden', text: 'Only the primary appears in `show ipv6 route static`' },
      { title: 'Fail the primary and confirm takeover', text: 'The backup installs with its own [AD/metric]' },
    ],
    notes:
      "A **floating static route** is just an ordinary `ipv6 route` command with one twist: you deliberately set its **administrative distance** higher than the route you want it to lose to. As long as the better route is present, IOS keeps only the better one in the IPv6 routing table — a floating static with a higher AD sits in the configuration but is never installed while a lower-AD route to the same prefix exists. That is exactly the behaviour you want from a backup: it costs nothing while the network is healthy and takes over automatically the moment the primary route disappears, without a single command typed during the outage. The AD you choose only matters relative to the route it replaces — 130 here only needs to beat the primary's AD of 1. If the primary were learned by a routing protocol instead, you would pick a number higher than that protocol's AD, for example above OSPF's 110. For two routes to the **same prefix**, the exam expects you to predict the winner before you see the exhibit: compare AD first, and look at the metric only when the ADs tie.",
  },
  {
    kind: 'cli',
    title: 'The floating static takes over',
    code: `R1(config)# interface Serial0/1/0
R1(config-if)# ipv6 address 2001:db8:99::1/64
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ipv6 route 2001:db8:2::/64 2001:db8:99::2 130
R1(config)# end
R1# show ipv6 route static
IPv6 Routing Table - default - 8 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:2::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# shutdown
R1(config-if)# end
R1# show ipv6 route static
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:2::/64 [130/0]
     via 2001:DB8:99::2`,
    highlight: ['2001:db8:99::2 130', '[1/0]', '[130/0]'],
    caption: 'While the primary exists, the AD-130 route stays hidden; when G0/0/1 goes down, it installs automatically.',
    notes:
      "Before adding the backup, R1 needs the serial link itself: S0/1/0 gets 2001:db8:99::1/64, and R2's end of the link is 2001:db8:99::2. The floating route then points at R2's serial address with AD **130**. The first `show ipv6 route static` proves the floating route is hidden: only the primary — the fully specified route via FE80::2 on G0/0/1, with [1/0] — is installed, and the backup exists only in the running configuration. Now the primary path fails, simulated here by shutting down G0/0/1. A static route that names an exit interface is removed as soon as that interface goes down, so the primary disappears, and with no better route left, IOS installs the floating static: **[130/0] via 2001:DB8:99::2**. The entry count also drops from 8 to 6, because G0/0/1's connected and local routes left with it. Nobody typed a routing command during the failure — automatic takeover is the whole point. When G0/0/1 comes back up, the primary returns and displaces the backup again. Remember that R2 needs its own floating route back to 2001:db8:1::/64 over the serial link, or replies will still try to use the failed path.",
  },
  {
    kind: 'cli',
    title: 'Default and host routes in the table',
    code: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ipv6 route ::/0 GigabitEthernet0/0/1 fe80::2
R1(config)# ipv6 route 2001:db8:2::100/128 2001:db8:99::2
R1(config)# end
R1# show ipv6 route static
IPv6 Routing Table - default - 10 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   ::/0 [1/0]
     via FE80::2, GigabitEthernet0/0/1
S   2001:DB8:2::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1
S   2001:DB8:2::100/128 [1/0]
     via 2001:DB8:99::2`,
    highlight: ['S   ::/0 [1/0]', '2001:DB8:2::100/128', 'ipv6 route 2001:db8:2::100/128 2001:db8:99::2'],
    caption: 'Three statics, sorted by prefix. The floating route is hidden again because the primary is back.',
    notes:
      "With G0/0/1 back up, R1 gets two more static routes. The **default route**, `::/0`, uses the same fully specified link-local next hop as the network route, so anything R1 has no better match for is sent to R2 over the Gigabit link. The **host route**, `2001:db8:2::100/128`, matches exactly one address, Server1, and sends it over the serial link to 2001:db8:99::2 — perhaps because that server's traffic must use a dedicated circuit. The table now holds three static entries sorted by prefix: ::/0 first, then the /64, then the /128. The default route looks exactly like any other static — no asterisk and no gateway-of-last-resort line — and the floating route to 2001:db8:2::/64 is hidden again, because the primary has returned. For a packet to 2001:db8:2::100, three routes match: ::/0, the /64 and the /128. **Longest prefix match** picks the /128, so Server1's traffic takes the serial link while every other host in 2001:db8:2::/64 still uses the Gigabit path. Administrative distance is never consulted in that decision, because the three prefixes have different lengths.",
  },
  {
    kind: 'cli',
    title: 'Verifying with traceroute, show ipv6 route and ping',
    code: `R1# traceroute 2001:db8:2::100
Type escape sequence to abort.
Tracing the route to 2001:DB8:2::100

  1 2001:DB8:99::2 2 msec 1 msec 2 msec
  2 2001:DB8:2::100 3 msec 3 msec 2 msec
R1# show ipv6 route 2001:db8:2::100
Routing entry for 2001:DB8:2::100/128
  Known via "static", distance 1, metric 0
  Route count is 1/1, share count 0
  Routing paths:
    2001:DB8:99::2
      Last updated 00:02:10 ago
R1# ping 2001:db8:2::200
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:2::200, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`,
    highlight: ['1 2001:DB8:99::2', 'Routing entry for 2001:DB8:2::100/128', '!!!!!'],
    caption: '`show ipv6 route <address>` reveals which entry wins — here the /128 host route.',
    notes:
      "`ping` and `traceroute` work as they do for IPv4: IOS recognises an IPv6 address automatically, and `ping ipv6 2001:db8:2::100` is an equivalent, longer form. The traceroute to Server1 proves the host route is in use, because the first hop is **2001:DB8:99::2**, R2's serial address, rather than its Gigabit address. `show ipv6 route` followed by an **address** — not a prefix — asks the router which entry it would use for that destination, and here it answers with the **/128** host route, known via static, distance 1, next hop 2001:DB8:99::2. That is the fastest way to confirm longest prefix match without scanning the whole table by eye, and it becomes essential once a network has many overlapping prefixes. The final ping, to another host in the same /64, succeeds over the Gigabit path, because only Server1 is covered by the /128. A successful ping (`!!!!!`) proves the entire round trip, including R2's return route; periods mean timeouts somewhere along the path, and traceroute then shows the last hop that still answered, which tells you which router to examine next.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: is IPv6 routing enabled?',
    code: `R1# show running-config | include ipv6 unicast-routing
R1# ping 2001:db8:12::2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:12::2, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# ipv6 unicast-routing
R1(config)# end
R1# show running-config | include ipv6 unicast-routing
ipv6 unicast-routing`,
    highlight: ['ipv6 unicast-routing', '!!!!!'],
    caption: 'An empty include result means the command is missing — even though the router can ping its neighbors.',
    notes:
      "This is the fault to check first whenever IPv6 traffic *through* a router fails while the router itself looks healthy. The symptoms are distinctive. The router can ping its directly connected neighbors, because an IPv6 host can do that too, and its interface addresses all look correct. Yet hosts behind it cannot reach anything beyond it: the router does not forward IPv6 packets between interfaces, and because it sends no Router Advertisements, SLAAC hosts such as PC1 never learn a prefix or a default gateway in the first place. The quickest confirmation is to search the running configuration: the first command here returns nothing at all, which means `ipv6 unicast-routing` is missing. The fix is that single global command, after which Router Advertisements start flowing and transit traffic is forwarded. On the exam, watch for a configuration exhibit that shows IPv6 interface addresses and `ipv6 route` commands but no `ipv6 unicast-routing` line, or a scenario in which the router pings everything while its hosts reach nothing. Every router along the path needs the command, not only the first one.",
  },
  {
    kind: 'table',
    title: 'Troubleshooting IPv6 static routes',
    columns: ['Symptom', 'Likely cause', 'Fix'],
    rows: [
      ['No forwarding; SLAAC clients get no default gateway', '`ipv6 unicast-routing` not enabled', 'Enable it globally on every router in the path'],
      ['Route rejected at the CLI', 'Link-local next hop given with no exit interface', 'Add the interface before the link-local address'],
      ['Route missing from `show ipv6 route`', 'Next hop unreachable, or the exit interface is down', 'Confirm a connected route to the next hop; `no shutdown` the interface'],
      ['Route matches the wrong destinations', 'Prefix length typed too short or too long', 'Match the length actually used on that LAN (usually /64)'],
      ['Ping works in one direction only', 'The far router has no route back to the source prefix', 'Add the mirror static route on the remote router'],
    ],
    caption: 'Work top to bottom: routing enabled, command accepted, route installed, prefix correct, return path present.',
    notes:
      "Most IPv6 static-route tickets trace back to one of five causes. **Global routing off**: without `ipv6 unicast-routing` nothing forwards between interfaces even though connected links still work — check this first on a router that seems to ignore every route it has. **Rejected commands**: a link-local next hop with no interface is refused outright, so `show running-config` simply will not contain the route you thought you configured — always confirm it is really there. **Unreachable next hop**: a static route that recurses through an address that is not itself reachable is never installed; this is the same rule that makes floating statics appear and disappear automatically. **Wrong prefix length**: unlike IPv4's dotted masks, a prefix length is a single number, and a typo — /128 instead of /64, or /48 instead of /64 — silently changes which destinations the route covers; nothing errors, so verify it against the real subnet. **Missing return route**: IPv6 static routes are exactly as one-directional as IPv4 ones, so the remote router needs its own route back, or replies never arrive.",
  },
  {
    kind: 'compare',
    title: 'IPv4 vs IPv6 static routing',
    left: {
      heading: 'IPv4',
      bullets: [
        '`ip route` + dotted **mask**',
        '**ARP** resolves the next-hop MAC',
        'Usually one line per route in `show ip route`',
        'Shows a **Gateway of last resort** line',
        'Default route `0.0.0.0 0.0.0.0`',
      ],
    },
    right: {
      heading: 'IPv6',
      tone: 'accent',
      bullets: [
        '`ipv6 route` + **/prefix-length**',
        '**NDP** (NS/NA) resolves the next-hop MAC',
        'Two lines per route in `show ipv6 route`',
        'No gateway-of-last-resort line',
        'Default route **::/0**; link-local next hop needs an interface',
      ],
    },
    notes:
      "Everything you already know from IPv4 static routing carries over — recursive lookup, administrative distance, floating routes, longest prefix match and the need for a return path — so treat this slide as a checklist of what changed rather than a new topic. The two syntax differences, a prefix length instead of a mask and NDP instead of ARP, are small but easy to blank on under exam pressure. The display differences matter more when reading exhibits: IPv6 routes always take **two lines**, so do not mistake the via line for a separate route, and do not look for a Gateway of last resort line that IPv6 simply does not print — the `S ::/0` entry is your only clue that a default route exists. The one genuinely new rule is the **link-local next hop**, which has no IPv4 equivalent at all, because IPv4 has no concept of an address that exists on every link yet is never routed. Expect at least one exam item built around each row of this comparison.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: IPv6 static routes',
    body:
      'A static route with a **link-local** next hop and no exit interface is ==rejected== by IOS — always pair the two. `ipv6 route` takes a **prefix length**, never a dotted mask, and the IPv6 default route is **::/0**, not `0.0.0.0`.',
    bullets: [
      '`ipv6 unicast-routing` is off by default — forgetting it is the classic fault',
      'A missing return route breaks replies even though the forward path is fine',
      'Longest prefix match: a **/128** beats a **/64**, which beats **::/0**',
      'A floating static is configured but invisible until the primary is gone',
      'No gateway-of-last-resort line in IPv6 — look for `S ::/0`',
    ],
    notes:
      "These traps cover most IPv6 static-routing questions. Examiners love pairing a `show ipv6 route` exhibit with a question such as 'why is this route missing?' or 'which command failed?', so practise reading the two-line format quickly. When two routes to the **same prefix** compete, compare administrative distance; when the prefixes differ, the **longest match** wins regardless of AD. If you remember only one thing from this deck, make it the link-local rule — it is the one piece of syntax with no IPv4 equivalent, and it appears constantly as a 'what is wrong with this configuration?' item: a bare FE80:: next hop means the command was rejected. The other traps are IPv4 knowledge in a new outfit: the same reasoning about recursive lookups, floating distances and return paths applies unchanged. Finally, never forget the first check of all — without `ipv6 unicast-routing`, none of your carefully written routes forward a single packet.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '**Enable** `ipv6 unicast-routing` before anything routes',
      '`ipv6 route prefix/length {next-hop | exit-interface [next-hop]} [AD]`',
      'Default **::/0**, host **/128**, floating = higher AD than the primary',
      '**Link-local next hop needs its exit interface** — IOS enforces this',
      '`show ipv6 route`: two lines per entry, no gateway-of-last-resort line',
      'Verify with `ping`, `traceroute` and `show ipv6 route <address>`',
      'Troubleshoot: routing on? accepted? next hop reachable? prefix right? return route?',
    ],
    notes:
      "IPv6 static routing is IPv4 static routing with new syntax and one new rule. Enable `ipv6 unicast-routing` on every router first, because without it the router behaves like a host and forwards nothing. Write routes with `ipv6 route`, a prefix length, and a next hop, an exit interface or both, plus an optional administrative distance. The default route is ::/0, a host route is a /128, and a floating static is simply a second route to the same prefix with a higher AD that installs only when the primary disappears. A link-local next hop must always be paired with its exit interface, because the same FE80:: address can exist on many links; IOS rejects the route otherwise. Read `show ipv6 route` as two-line entries without a gateway-of-last-resort line, and prove paths with ping, traceroute and `show ipv6 route` followed by an address. When something fails, walk the checklist in order: routing enabled, command accepted, next hop reachable, prefix length correct, and a return route on the far router. That covers this topic for both the v1.1 and v2.0 exams.",
  },
];
