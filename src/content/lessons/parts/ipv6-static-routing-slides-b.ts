import type { Slide } from '../../types';

export const slidesB: Slide[] = [
  {
    kind: 'steps',
    title: 'Configuring a Floating Static Route',
    steps: [
      {
        title: 'Identify the primary path and its AD',
        text: 'A normal static or dynamic route already reaches the destination — note its administrative distance (a plain static defaults to 1).',
      },
      {
        title: 'Pick a different backup path',
        text: 'Choose another exit interface or next hop that can reach the same prefix, such as a secondary WAN link.',
      },
      {
        title: 'Configure it with a higher AD',
        text: '`ipv6 route 2001:db8:2::/64 2001:db8:99::2 130` — any value greater than the primary route\'s AD, up to 254.',
      },
      {
        title: 'Confirm it stays hidden',
        text: '`show ipv6 route static` should list only the primary while it is up; the floating route exists in the configuration but not in the table.',
      },
      {
        title: 'Fail the primary and confirm takeover',
        text: 'Remove or shut down the primary path, then re-check `show ipv6 route` — the floating route now appears with its own [AD/metric].',
      },
    ],
    notes:
      'A **floating static route** is just an ordinary `ipv6 route` command with one twist: you deliberately set its **administrative distance** higher than the route you want it to lose to. As long as the better route is present, IOS keeps only the better one in the IPv6 routing table — a floating static with a higher AD sits in the configuration but is never installed while a lower-AD path to the same prefix exists. That is exactly the behavior you want from a backup: it costs nothing while the network is healthy and takes over automatically the moment the primary route disappears, without a single command typed during the outage. The AD you choose only matters relative to the route it replaces — 130 here only needs to beat the primary\'s AD of 1. If the primary were a dynamic protocol instead, you would pick a number higher than that protocol\'s AD, for example above OSPF\'s 110. The exam tests whether you can predict which route wins **before** you are shown a `show ipv6 route` exhibit, so compare AD first and only look at metric when AD is tied.',
  },
  {
    kind: 'cli',
    title: 'Floating Static Takes Over',
    code: `R1(config)# ipv6 route 2001:db8:2::/64 2001:db8:12::2
R1(config)# ipv6 route 2001:db8:2::/64 2001:db8:99::2 130
R1(config)# end
R1# show ipv6 route static
S   2001:DB8:2::/64 [1/0]
     via 2001:DB8:12::2
R1# configure terminal
R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# shutdown
R1(config-if)# end
R1# show ipv6 route static
S   2001:DB8:2::/64 [130/0]
     via 2001:DB8:99::2`,
    highlight: ['[1/0]', '[130/0]', 'shutdown'],
    caption: 'Shutting down the primary interface removes the recursive route to 2001:DB8:12::2, so the higher-AD backup installs automatically.',
    notes:
      'While GigabitEthernet0/0/1 is up, `show ipv6 route static` shows only the **primary** route — `[1/0]` via 2001:DB8:12::2. The floating static sits in the configuration the whole time (`show running-config` would list it), but IOS never installs a worse route to a prefix while a better one is available, so it stays invisible until it is actually needed. Shutting down G0/0/1 removes the connected prefix 2001:DB8:12::/64 from the table, which breaks the **recursive lookup** the primary route depends on — its next hop, 2001:DB8:12::2, is no longer resolvable, so the primary route itself is withdrawn. With the primary gone, the floating static is now the only route to 2001:DB8:2::/64, so IOS installs it and the table shows `[130/0]` via 2001:DB8:99::2. No command was typed during the failure — that automatic re-convergence is the entire point of a floating static. Bringing G0/0/1 back up reverses the process: the primary reappears and immediately displaces the floating route again, because it still has the better AD.',
  },
  {
    kind: 'cli',
    title: 'Verifying Reachability',
    code: `R1# ping 2001:db8:2::100
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:2::100, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms
R1# traceroute 2001:db8:2::100
Type escape sequence to abort.
Tracing the route to 2001:DB8:2::100
  1 2001:DB8:12::2 2 msec 1 msec 1 msec
  2 2001:DB8:2::100 3 msec 2 msec 2 msec
R1# show ipv6 route 2001:db8:2::100
Routing entry for 2001:DB8:2::/64
  Known via "static", distance 1, metric 0
  Route count is 1/1, share count 0
  Routing paths:
    2001:DB8:12::2
      Last updated 00:07:41 ago`,
    highlight: ['ping 2001:db8:2::100', 'traceroute 2001:db8:2::100', 'Routing entry for 2001:DB8:2::/64'],
    caption: 'A host address still resolves against the /64 route — longest prefix match in action.',
    notes:
      '`ping` and `traceroute` work exactly as they do for IPv4 — IOS recognizes an IPv6 address and needs no extra keyword (typing `ping ipv6 2001:db8:2::100` also works). Success here (`!!!!!`) proves the whole path: routing on R1, the transit link, routing on R2, and R2\'s LAN. `traceroute` lists each hop\'s IPv6 address, which is invaluable for spotting exactly where a path breaks. The last command, `show ipv6 route 2001:db8:2::100`, does not add a new route — it looks up a **specific address** and reports which route in the table actually matches it. Even though no /128 route exists for this server, the lookup succeeds against the **/64** network route by longest prefix match, and the output confirms the route\'s source ("static"), AD, metric and next hop. This command is a fast way to prove which route will actually be used for a destination without scanning the whole table by eye, and it becomes essential once a network has many overlapping prefixes.',
  },
  {
    kind: 'cli',
    title: 'The Link-Local Rule, Enforced',
    code: `R1(config)# ipv6 route 2001:db8:2::/64 fe80::2
%Interface has to be specified for a link-local nexthop
R1(config)# ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2
R1(config)# end
R1# show ipv6 route static
S   2001:DB8:2::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1`,
    highlight: ['%Interface has to be specified for a link-local nexthop', 'GigabitEthernet0/0/1 fe80::2'],
    caption: 'IOS rejects a bare link-local next hop outright — one IPv6 static-route mistake it catches for you.',
    notes:
      'Try to enter a static route with only a link-local next hop and IOS refuses it immediately with `%Interface has to be specified for a link-local nexthop` — it will not silently accept an ambiguous route. Add the exit interface before the link-local address and the same route succeeds. This is one of the very few IPv6 static-route mistakes IOS catches for you; most of the others — a wrong prefix length, a technically-reachable-but-unintended next hop, a missing return route — are accepted without complaint and only surface later as a connectivity problem. Get in the habit of typing the interface first whenever a next hop will be link-local, so you only ever see this error in a lab. It is also a reliable exam signal: if a question\'s static-route command shows an FE80:: next hop with no interface, that command **failed** — and that fact alone can answer the question.',
  },
  {
    kind: 'table',
    title: 'Troubleshooting IPv6 Static Routes',
    columns: ['Symptom', 'Likely Cause', 'Fix'],
    rows: [
      [
        'No forwarding; SLAAC clients get no default gateway',
        '`ipv6 unicast-routing` not enabled',
        'Enable it globally on every router in the path',
      ],
      [
        'Route rejected at the CLI',
        'Link-local next hop given with no exit interface',
        'Add the interface before the link-local address',
      ],
      [
        'Route missing from `show ipv6 route`',
        'Next hop unreachable, or the exit interface is down',
        'Confirm a connected route to the next hop; `no shutdown` the interface',
      ],
      [
        'Route matches the wrong set of destinations',
        'Prefix length typed too short or too long',
        'Match the length actually assigned on that LAN (usually /64)',
      ],
      [
        'Ping works in one direction only',
        'The far router has no route back to the source prefix',
        'Add the mirror static route on the remote router',
      ],
    ],
    caption: 'Work top to bottom: confirm routing is enabled, confirm the command was accepted, then confirm it is installed and correct.',
    notes:
      'Most IPv6 static-route tickets trace back to one of five causes. **Global routing off**: without `ipv6 unicast-routing` nothing forwards between interfaces even though connected links still work — check this first on a router that seems to ignore every route it has. **Rejected commands**: a link-local next hop with no interface is refused outright, so `show running-config` simply will not contain the route you thought you configured — always confirm it is really there. **Unreachable next hop**: a static route recursing through an address that is not itself reachable never installs; this is the same rule that makes floating statics disappear and reappear automatically. **Wrong prefix length**: unlike IPv4\'s dotted masks, a prefix length is a single number, and a typo (/48 for /64, or the reverse) silently changes which destinations the route covers — nothing errors, so verify it against the real subnet. **Missing return route**: IPv6 static routes are exactly as one-directional as IPv4 ones, so the remote router needs its own route back or replies never arrive.',
  },
  {
    kind: 'compare',
    title: 'IPv4 vs IPv6 Static Routing',
    left: {
      heading: 'IPv4',
      bullets: [
        '`ip route` + dotted **mask**',
        '**ARP** resolves the next-hop MAC',
        'One line per route in `show ip route`',
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
      'Everything you already know from IPv4 static routing carries over — recursive lookup, administrative distance, floating routes, the need for a return path — so treat this slide as a checklist of what changed rather than a new topic. The two syntax differences, a prefix length instead of a mask and NDP instead of ARP, are cosmetic but easy to blank on under exam pressure. The display differences matter more for reading exhibits: IPv6 routes always take **two lines**, so do not mistake the "via" line for a separate route, and do not look for a "Gateway of last resort" line that IPv6 simply does not print — the default route `S ::/0` is your only clue that one exists. The one genuinely new rule is the **link-local next hop**, which has no IPv4 equivalent at all, because IPv4 has no concept of an address that is valid on every link but globally unroutable.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam Traps',
    body:
      'A static route with a **link-local** next hop and no exit interface is ==rejected== by IOS — always pair the two. `ipv6 route` takes a **prefix length**, never a dotted mask, and the IPv6 default route is **::/0**, not `0.0.0.0`.',
    bullets: [
      '`ipv6 unicast-routing` is off by default — forgetting it is the most common IPv6 routing fault',
      'A missing return route breaks replies even though the forward path pings fine',
      'Longest prefix match still applies: a **/128** beats a **/64**, which beats **::/0**',
      'A floating static with a higher AD is configured but invisible until the primary route is gone',
    ],
    notes:
      'These four traps account for the great majority of IPv6 static-routing questions. Examiners love pairing a `show ipv6 route` exhibit with a question like "why is this route missing" or "which command failed," so practice reading the two-line format quickly and check administrative distance before anything else when two routes could match. If you remember only one thing from this deck, make it the link-local rule — it is the one piece of syntax that is genuinely new versus IPv4, and it shows up constantly as a "what is wrong with this configuration" question. The other traps are really IPv4 knowledge in a new outfit: the same reasoning about recursive lookups, floating distances and return paths applies unchanged.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '**Enable** `ipv6 unicast-routing` before anything routes',
      '`ipv6 route prefix/length {next-hop | exit-interface [next-hop]} [AD]`',
      'Default **::/0**, host **/128**, floating = higher AD than the primary',
      '**Link-local next hop needs its exit interface** — IOS enforces this',
      '`show ipv6 route` uses **two lines** per entry, no gateway-of-last-resort line',
      'Verify with `ping`, `traceroute`, and `show ipv6 route static`',
      'Troubleshoot in order: routing enabled? command accepted? next hop reachable? prefix length right? return route present?',
    ],
    notes:
      'IPv6 static routing is IPv4 static routing with new syntax and one new rule. If you can write `ipv6 route`, build a default and a host route, explain why a floating static hides itself, and — most importantly — explain why `ipv6 route 2001:db8:2::/64 fe80::2` fails without an interface, this topic is covered for both the v1.1 and v2.0 exams. Spend remaining review time reading `show ipv6 route` exhibits quickly: identify the code, the prefix, the [AD/metric] in brackets, and the next hop or exit interface on the second line, and most questions on this topic fall in seconds. Next up: First Hop Redundancy Protocols, which pick up right where this lesson\'s default-gateway diagrams left off.',
  },
];
