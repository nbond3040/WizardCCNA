import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'An engineer enters `ipv6 route 2001:db8:5::/64 fe80::2` on R1, but the route never appears in `show ipv6 route`. What is the reason?',
    options: [
      'IOS rejected the command because a link-local next hop needs an interface',
      'A static route with a link-local next hop needs a manually set AD of 255',
      'The route is installed only after `clear ipv6 route *` is entered',
      'Link-local next hops are allowed only in the ::/0 default route',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS refuses a bare link-local next hop with "% Interface has to be specified for a link-local nexthop", so the route is never stored. The fix is `ipv6 route 2001:db8:5::/64 <exit-interface> fe80::2`. AD values and clearing the table have nothing to do with it, and link-local next hops are valid for any prefix once the interface is supplied.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which command on R1 creates a fully specified static route to 2001:db8:20::/64 that uses R2\'s link-local address?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 1.5, y: 1.5 },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'G0/0/0 link-local FE80::2', x: 5, y: 1.5 },
          { id: 'lan', icon: 'switch', label: 'LAN', sub: '2001:db8:20::/64', x: 8.5, y: 1.5 },
        ],
        links: [
          { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', toLabel: 'G0/0/0', label: '2001:db8:12::/64' },
          { from: 'r2', to: 'lan', fromLabel: 'G0/0/1' },
        ],
      },
    },
    options: [
      '`ipv6 route 2001:db8:20::/64 GigabitEthernet0/0/1 fe80::2`',
      '`ipv6 route 2001:db8:20::/64 GigabitEthernet0/0/0 fe80::2`',
      '`ipv6 route 2001:db8:20::/64 fe80::2 GigabitEthernet0/0/1`',
      '`ipv6 route 2001:db8:20::/64 fe80::2`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The exit interface is **R1\'s** interface toward R2 — G0/0/1 — and it must come before the link-local address. G0/0/0 is R2\'s interface, the reversed order is invalid syntax, and a bare link-local next hop is rejected.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. GigabitEthernet0/0/0 goes down, while 2001:db8:77::7 remains reachable through another interface. What happens to traffic for 2001:db8:50::/64?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ipv6 route
ipv6 route 2001:DB8:50::/64 GigabitEthernet0/0/0 FE80::5
ipv6 route 2001:DB8:50::/64 2001:DB8:77::7 200
R1# show ipv6 route static
IPv6 Routing Table - default - 8 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:50::/64 [1/0]
     via FE80::5, GigabitEthernet0/0/0`,
    },
    options: [
      'R1 installs the route via 2001:DB8:77::7 with [200/0] and forwards the traffic',
      'R1 drops the traffic, because floating static routes must be activated manually',
      'R1 keeps forwarding to FE80::5, because link-local addresses stay valid when an interface is down',
      'R1 load-balances across both routes',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The primary route names G0/0/0 as its exit interface, so it is withdrawn when the interface goes down. The AD-200 floating route was hidden only because a better route existed; now it is the best route, its next hop is reachable, and IOS installs it automatically with [200/0]. A down interface cannot be used for any next hop, and routes with different ADs never share traffic.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 route
IPv6 Routing Table - default - 8 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   ::/0 [1/0]
     via 2001:DB8:100::1
C   2001:DB8:10::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:10::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
S   2001:DB8:20::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1
S   2001:DB8:20::99/128 [1/0]
     via Serial0/1/0, directly connected
C   2001:DB8:100::/64 [0/0]
     via GigabitEthernet0/0/2, directly connected
L   2001:DB8:100::2/128 [0/0]
     via GigabitEthernet0/0/2, receive
L   FF00::/8 [0/0]
     via Null0, receive`,
    },
    options: [
      'Traffic to 2001:db8:20::99 is sent out Serial0/1/0',
      'Traffic to 2001:db8:20::50 is forwarded to FE80::2 out GigabitEthernet0/0/1',
      'Traffic to 2001:db8:30::1 is dropped because no gateway of last resort is set',
      'The default route forwards traffic out GigabitEthernet0/0/1',
      'The route to 2001:db8:20::/64 has an administrative distance of 0',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'For 2001:db8:20::99 the /128 is the longest match, so it leaves Serial0/1/0; any other address in 2001:db8:20::/64, such as ::50, uses the /64 via FE80::2 on G0/0/1. 2001:db8:30::1 matches ::/0 — IPv6 tables never print a gateway-of-last-resort line. The default route\'s next hop, 2001:DB8:100::1, lies in the connected 2001:DB8:100::/64 on G0/0/2, not G0/0/1, and the static /64 has AD 1, as its [1/0] shows.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Which command configures an IPv6 host route to 2001:db8:9::9 through next hop 2001:db8:12::2?',
    options: [
      '`ipv6 route 2001:db8:9::9/128 2001:db8:12::2`',
      '`ipv6 route 2001:db8:9::9/64 2001:db8:12::2`',
      '`ipv6 route 2001:db8:9::9 255.255.255.255 2001:db8:12::2`',
      '`ipv6 host 2001:db8:9::9 2001:db8:12::2`',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'A host route uses the **/128** prefix length. A /64 covers a whole subnet, IPv6 routes never use dotted masks, and `ipv6 host` creates a hostname-to-address mapping rather than a route.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'PCs on R1\'s LAN use SLAAC, but they receive no IPv6 prefix or default gateway. R1\'s interface addresses are correct, and R1 can ping the IPv6 addresses of its neighbors. What is the most likely cause?',
    options: [
      '`ipv6 unicast-routing` is not configured on R1',
      'R1 has no static default route',
      'The PCs need manually configured link-local addresses',
      'R1\'s LAN interface uses a manually configured link-local address',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Without `ipv6 unicast-routing`, R1 behaves as an IPv6 host: it can ping neighbors but sends no Router Advertisements, so SLAAC clients learn neither a prefix nor a gateway — and R1 would not forward their traffic anyway. A missing default route does not stop RAs, hosts create link-local addresses automatically, and a manual link-local address on the router is perfectly valid.',
  },
  {
    id: 'e7',
    type: 'order',
    stem: 'Put the steps in order to configure and verify a floating IPv6 static route that backs up an existing primary static route.',
    items: [
      'Confirm the primary route and its AD in `show ipv6 route`',
      'Configure `ipv6 route` for the same prefix via the backup next hop with a higher AD',
      'Verify that only the primary route is installed',
      'Simulate a failure of the primary path',
      'Verify that the backup route is now installed with its higher AD',
    ],
    difficulty: 2,
    explanation:
      'You need the primary\'s AD before you can pick a higher one for the backup. After configuring the backup, it must stay hidden while the primary is healthy; only a failure test proves that it installs when needed.',
  },
  {
    id: 'e8',
    type: 'match',
    stem: 'Match each `show ipv6 route` entry to its meaning.',
    pairs: [
      { left: '`L   FF00::/8 [0/0]`', right: 'Automatic multicast entry pointing to Null0' },
      { left: '`S   ::/0 [1/0]`', right: 'Static default route' },
      { left: '`L   2001:DB8:1::1/128 [0/0]`', right: 'An address configured on the router itself' },
      { left: '`C   2001:DB8:1::/64 [0/0]`', right: 'A directly connected network' },
      { left: '`ND  ::/0`', right: 'Default route learned from a Router Advertisement' },
    ],
    difficulty: 2,
    explanation:
      'L entries are local: the router\'s own /128 addresses and the automatic FF00::/8 multicast entry. C marks connected prefixes, S static routes such as the ::/0 default, and ND a default learned from Neighbor Discovery Router Advertisements.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each command as accepted or rejected by IOS.',
    categories: ['Accepted', 'Rejected'],
    items: [
      { text: '`ipv6 route 2001:db8:2::/64 2001:db8:12::2`', category: 0 },
      { text: '`ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2`', category: 0 },
      { text: '`ipv6 route 2001:db8:2::/64 fe80::2`', category: 1 },
      { text: '`ipv6 route ::/0 Serial0/1/0`', category: 0 },
      { text: '`ipv6 route 2001:db8:2::/64 2001:db8:99::2 130`', category: 0 },
      { text: '`ipv6 route 2001:db8:2:: 255.255.255.0 2001:db8:12::2`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'IOS accepts recursive (global next hop), fully specified (interface plus link-local), exit-interface-only and floating routes. It rejects a link-local next hop without an interface, and it rejects a dotted mask, because `ipv6 route` requires prefix-length notation.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'Enter the command that configures a static default route on R1 with next hop 2001:db8:100::1.',
    answers: ['ipv6 route ::/0 2001:db8:100::1'],
    placeholder: 'command',
    difficulty: 2,
    explanation: '`ipv6 route ::/0 2001:db8:100::1` — the default prefix ::/0 followed by the next-hop address.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'R1 learns 2001:db8:50::/64 through OSPFv3 (AD 110). What is the lowest administrative distance a static route to the same prefix can use so that it is installed only if the OSPFv3 route disappears?',
    answers: ['111'],
    placeholder: 'AD',
    difficulty: 2,
    explanation:
      'The static route must have a **higher** AD than OSPFv3\'s 110 to stay out of the table while OSPFv3 provides the route, so the lowest usable value is **111**. Any value of 110 or less would compete with, or beat, the OSPFv3 route instead of waiting behind it.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts in 2001:db8:2::/64, such as 2001:db8:2::100, are unreachable from R1, although R2 at 2001:db8:12::2 is reachable. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 route static
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:2::/128 [1/0]
     via 2001:DB8:12::2`,
    },
    options: [
      'The route was entered with /128, so it matches only the single address 2001:db8:2::',
      'IPv6 static routes to remote networks require a link-local next hop',
      'The route needs an administrative distance higher than 1',
      'A static route with a global next hop must also name an exit interface',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The route was entered as 2001:db8:2::/128, a host route for the single address 2001:db8:2:: — no other host in the /64 matches it, and with no default route the traffic is dropped. Re-enter it as `ipv6 route 2001:db8:2::/64 2001:db8:12::2`. Global next hops are perfectly valid, a recursive route needs no exit interface, and AD matters only when routes to the same prefix compete.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. R1 is configured with `ipv6 route 2001:db8:2::/64 2001:db8:12::2` and `ipv6 route 2001:db8:2::/64 2001:db8:99::2 130`. What does the output indicate?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 route static
IPv6 Routing Table - default - 6 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   2001:DB8:2::/64 [130/0]
     via 2001:DB8:99::2
R1# traceroute 2001:db8:2::100
Type escape sequence to abort.
Tracing the route to 2001:DB8:2::100

  1 2001:DB8:99::2 2 msec 1 msec 2 msec
  2 2001:DB8:2::100 3 msec 3 msec 2 msec`,
    },
    options: [
      'The primary route is unusable, so the floating route carries the traffic',
      'Both routes are installed and traffic is load-balanced across both next hops',
      'The floating route has a lower AD than the primary route, so it is preferred',
      'Traceroute ignores the routing table and uses the lowest-numbered interface',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Only the [130/0] route is installed and the first hop is R2\'s serial address, so traffic is using the floating route — the primary\'s next hop, 2001:db8:12::2, must be unreachable, for example because the Gigabit link is down. Routes with different ADs never share traffic, 130 is higher than the primary\'s 1, and traceroute follows the routing table like any other traffic.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about link-local next hops in IPv6 static routes are true? (Choose two.)',
    options: [
      'The exit interface must be specified together with the link-local address',
      'The same link-local address can exist on different links',
      'A link-local next hop is resolved through a recursive routing table lookup',
      'Link-local addresses are routed between subnets like global addresses',
      'show ipv6 route displays a link-local next hop without an interface',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'Because link-local addresses are unique only per link, the same address can appear on several links, and IOS therefore requires the exit interface. Link-local addresses are never routed, so no recursive lookup can find them, and the routing table always shows them together with their interface.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'PC1 (2001:db8:1::10, behind R1) cannot ping Server1 (2001:db8:2::100, behind R2). R1 has `ipv6 unicast-routing` and `ipv6 route 2001:db8:2::/64 2001:db8:12::2`, and a ping from R1 to Server1 sourced from R1\'s address 2001:db8:12::1 succeeds. Which two issues could explain PC1\'s failure? (Choose two.)',
    options: [
      'R2 has no route back to 2001:db8:1::/64',
      'PC1 has no default gateway, or an incorrect one',
      '`ipv6 unicast-routing` is not enabled on R2',
      'R1\'s static route should use a link-local next hop',
      'Server1 has no default gateway',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'R1\'s own test proves R1\'s route, R2\'s forwarding (so R2 does have `ipv6 unicast-routing`) and Server1\'s ability to reply to a remote prefix (so Server1 has a working gateway). What it does not test is the 2001:db8:1::/64 side: R2 needs a route back to PC1\'s prefix, and PC1 needs a correct default gateway. The next-hop type on R1 does not matter — global and link-local next hops both work.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. R1 must send all Internet-bound traffic to ISP-A and use ISP-B only if the link to ISP-A fails. Which pair of commands achieves this?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 2, y: 2 },
          { id: 'ia', icon: 'internet', label: 'ISP-A', sub: '2001:db8:a::1', x: 7.8, y: 0.9 },
          { id: 'ib', icon: 'internet', label: 'ISP-B', sub: '2001:db8:b::1', x: 7.8, y: 3.1 },
        ],
        links: [
          { from: 'r1', to: 'ia', fromLabel: 'G0/0/0', label: '2001:db8:a::/64' },
          { from: 'r1', to: 'ib', fromLabel: 'G0/0/1', label: '2001:db8:b::/64', style: 'dashed' },
        ],
      },
    },
    options: [
      '`ipv6 route ::/0 2001:db8:a::1` and `ipv6 route ::/0 2001:db8:b::1 5`',
      '`ipv6 route ::/0 2001:db8:a::1 5` and `ipv6 route ::/0 2001:db8:b::1`',
      '`ipv6 route ::/0 2001:db8:a::1` and `ipv6 route ::/0 2001:db8:b::1`',
      '`ipv6 route ::/128 2001:db8:a::1` and `ipv6 route ::/128 2001:db8:b::1 5`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The primary default toward ISP-A keeps the default AD of 1, and the backup toward ISP-B gets a higher AD (5), so it floats until the ISP-A route disappears. Giving ISP-A the AD of 5 instead reverses the roles, leaving both routes at the default AD installs two equal routes and load-balances across both providers, and ::/128 is a host route for the unspecified address, not a default route.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'What is the default administrative distance of an IPv6 static route?',
    options: ['0', '1', '110', '120'],
    answer: 1,
    difficulty: 1,
    explanation:
      'IPv6 static routes default to AD **1**, exactly like IPv4. 0 belongs to connected routes, 110 to OSPF (including OSPFv3) and 120 to RIP (including RIPng).',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Which path does R1 use for traffic to 2001:db8:2::100?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 route static
IPv6 Routing Table - default - 10 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
S   ::/0 [1/0]
     via FE80::2, GigabitEthernet0/0/1
S   2001:DB8:2::/64 [1/0]
     via FE80::2, GigabitEthernet0/0/1
S   2001:DB8:2::100/128 [5/0]
     via 2001:DB8:99::2`,
    },
    options: [
      'Via 2001:DB8:99::2, because the /128 route is the longest prefix match',
      'Via FE80::2 out G0/0/1, because the /64 route has the lower AD',
      'Via FE80::2 out G0/0/1, because the default route is always tried first',
      'Both paths, with traffic load-balanced',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Route selection starts with the **longest prefix match**, and the /128 is longer than both the /64 and ::/0, so its next hop 2001:DB8:99::2 is used. AD 5 versus 1 is irrelevant, because AD only breaks ties between routes to the *same* prefix. The default route is only a last resort and is never tried first, and routes to different prefixes never load-balance.',
  },
  {
    id: 'e19',
    type: 'input',
    stem: 'What prefix length identifies an IPv6 host route?',
    answers: ['128', '/128'],
    placeholder: '/nn',
    difficulty: 1,
    explanation: 'A host route uses **/128**, covering exactly one IPv6 address — the IPv6 equivalent of a /32 in IPv4.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Which two statements about IPv6 floating static routes are true? (Choose two.)',
    options: [
      'They use a higher administrative distance than the primary route',
      'They are installed only when the preferred route is unavailable',
      'They must use a link-local next hop instead of a global address',
      'They load-balance with the primary route when both are available',
      'They work only when `ipv6 unicast-routing` is disabled globally',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'A floating static has a **higher AD**, so it stays out of the routing table until the better route disappears. Any next-hop type works, it never shares traffic with a lower-AD route, and like every IPv6 route it needs `ipv6 unicast-routing` enabled to forward traffic.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. The static route to 2001:db8:40::/64 is in the running configuration but not in the routing table. What is the most likely reason?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ipv6 route
ipv6 route 2001:DB8:40::/64 2001:DB8:34::4
R1# show ipv6 route
IPv6 Routing Table - default - 5 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
...
C   2001:DB8:1::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:1::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
C   2001:DB8:13::/64 [0/0]
     via GigabitEthernet0/0/1, directly connected
L   2001:DB8:13::1/128 [0/0]
     via GigabitEthernet0/0/1, receive
L   FF00::/8 [0/0]
     via Null0, receive`,
    },
    options: [
      'R1 has no route to the next hop 2001:db8:34::4, so the recursive lookup fails',
      'IPv6 static routes must use a link-local next hop together with an exit interface',
      'The route needs an explicitly configured administrative distance',
      'Only host routes to a single /128 address may use a global next hop',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A recursive static route is installed only if its next hop can be resolved. 2001:DB8:34::4 lies in neither 2001:DB8:1::/64 nor 2001:DB8:13::/64, and no other route leads to it, so the static route stays out of the table. Global next hops are valid for any prefix, and the AD defaults to 1 when omitted. Correct the next hop — perhaps a neighbor on 2001:db8:13::/64 was intended — or add a route toward it.',
  },
];

export default exam;
