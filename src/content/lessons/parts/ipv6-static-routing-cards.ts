import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Command that enables IPv6 routing on an IOS router', back: '`ipv6 unicast-routing` (global configuration). It is **disabled** by default.' },
  { id: 'f2', front: 'A router without `ipv6 unicast-routing`', back: 'Acts like an IPv6 host: it can ping its neighbors but does not forward IPv6 packets or send Router Advertisements.' },
  { id: 'f3', front: 'IPv6 static route syntax', back: '`ipv6 route <prefix>/<length> {next-hop | exit-interface [next-hop]} [AD]`' },
  { id: 'f4', front: 'IPv6 default route prefix', back: '**::/0** — e.g. `ipv6 route ::/0 2001:db8:12::2`.' },
  { id: 'f5', front: 'Prefix length of an IPv6 host route', back: '**/128** — it matches exactly one address.' },
  { id: 'f6', front: 'Floating static route', back: 'A static route with a higher AD than the primary route to the same prefix; it is installed only when the primary disappears.' },
  { id: 'f7', front: 'Default administrative distance of an IPv6 static route', back: '**1** (connected routes are 0).' },
  { id: 'f8', front: 'Rule for a link-local next hop', back: 'The exit interface must be given too, interface first: `ipv6 route 2001:db8:2::/64 GigabitEthernet0/0/1 fe80::2`.' },
  { id: 'f9', front: 'IOS response to `ipv6 route 2001:db8:2::/64 fe80::2`', back: '`% Interface has to be specified for a link-local nexthop` — the route is rejected and not saved.' },
  { id: 'f10', front: 'Why does a link-local next hop need an interface?', back: 'Link-local addresses are unique only per link, so the same FE80:: address can exist on several links at once.' },
  { id: 'f11', front: 'Fully specified static route', back: 'A static route that lists both the exit interface and the next-hop address.' },
  { id: 'f12', front: 'Recursive static route', back: 'A route with only a next-hop address; the router looks up the next hop again to find the exit interface.' },
  { id: 'f13', front: 'Where is an exit-interface-only IPv6 static route appropriate?', back: 'On point-to-point links such as serial. On Ethernet, use a next-hop address instead.' },
  { id: 'f14', front: 'Layout of each entry in `show ipv6 route`', back: 'Two lines: code, prefix and [AD/metric] first; then the via line with the next hop and/or interface.' },
  { id: 'f15', front: 'Does `show ipv6 route` print a Gateway of last resort line?', back: 'No. A default route simply appears as `S ::/0 [1/0]`.' },
  { id: 'f16', front: '`L FF00::/8 [0/0] via Null0, receive`', back: 'An automatic local multicast entry present on every IPv6 router — not something you configured.' },
  { id: 'f17', front: 'Routing table code for a default route learned from Router Advertisements', back: '**ND** (ND Default).' },
  { id: 'f18', front: 'How does IPv6 learn the next hop\'s MAC address?', back: 'NDP: a Neighbor Solicitation to the solicited-node multicast address, answered by a Neighbor Advertisement. View with `show ipv6 neighbors`.' },
  { id: 'f19', front: 'Command that shows which route matches one IPv6 address', back: '`show ipv6 route <address>`, e.g. `show ipv6 route 2001:db8:2::100`.' },
  { id: 'f20', front: 'Command that lists only IPv6 static routes', back: '`show ipv6 route static`.' },
  { id: 'f21', front: 'Pinging a link-local address on IOS', back: 'IOS prompts for the **output interface**, because the address only has meaning on one link.' },
  { id: 'f22', front: 'Routes ::/0, 2001:db8:2::/64 and 2001:db8:2::100/128 all exist. Which is used for 2001:db8:2::100?', back: 'The **/128** — longest prefix match, regardless of AD.' },
  { id: 'f23', front: 'Wrong prefix length in `ipv6 route` (e.g. /128 instead of /64)', back: 'The command is accepted, but the route covers the wrong destinations — verify it against the real subnet.' },
  { id: 'f24', front: 'Static route whose exit interface goes down', back: 'The route is removed from the table; a floating static to the same prefix can then install.' },
  { id: 'f25', front: 'Router pings its neighbors, but its SLAAC hosts get no gateway and nothing is forwarded', back: 'Check for a missing `ipv6 unicast-routing`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which global command must be configured before an IOS router forwards IPv6 packets between its interfaces?',
    options: ['`ipv6 unicast-routing`', '`ipv6 enable`', '`ip routing`', '`ipv6 route ::/0 Null0`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`ipv6 unicast-routing` turns on IPv6 forwarding (and Router Advertisements). `ipv6 enable` only enables IPv6 with a link-local address on one interface, `ip routing` is the IPv4 equivalent, and a default route alone does not enable forwarding.',
  },
  {
    id: 'q2',
    type: 'input',
    stem: 'Enter the IPv6 prefix, in prefix/length notation, used for a default static route.',
    answers: ['::/0'],
    placeholder: 'prefix/length',
    difficulty: 1,
    explanation: 'The IPv6 default route is **::/0** — all zeros with a zero-length prefix, so it matches every destination.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'The next hop toward 2001:db8:5::/64 is FE80::2, reachable out R1\'s G0/0/1. Which command does IOS accept?',
    options: [
      '`ipv6 route 2001:db8:5::/64 GigabitEthernet0/0/1 fe80::2`',
      '`ipv6 route 2001:db8:5::/64 fe80::2`',
      '`ipv6 route 2001:db8:5::/64 fe80::2 GigabitEthernet0/0/1`',
      '`ip route 2001:db8:5::/64 GigabitEthernet0/0/1 fe80::2`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A link-local next hop must be preceded by the exit interface. Without the interface IOS rejects the route, the interface cannot follow the next hop, and `ip route` is the IPv4 command.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two statements about the output of `show ipv6 route` are true? (Choose two.)',
    options: [
      'Each route is displayed on two lines',
      'A Gateway of last resort line identifies the default route',
      'A static default route appears as S ::/0',
      'Static routes are shown with [0/0]',
      'Link-local next hops are displayed without an interface',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'IPv6 entries use **two lines**, and the default route is simply **S ::/0**. There is no gateway-of-last-resort line, static routes show [1/0] by default, and a link-local next hop is always shown with its interface.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each command to the type of static route it creates.',
    pairs: [
      { left: '`ipv6 route ::/0 2001:db8:12::2`', right: 'Default route' },
      { left: '`ipv6 route 2001:db8:2::100/128 2001:db8:12::2`', right: 'Host route' },
      { left: '`ipv6 route 2001:db8:2::/64 2001:db8:12::2`', right: 'Network route' },
      { left: '`ipv6 route 2001:db8:2::/64 2001:db8:99::2 130`', right: 'Floating static route' },
    ],
    difficulty: 1,
    explanation:
      '::/0 is the default route, /128 is a host route, a /64 toward a LAN is a network route, and a trailing AD higher than the primary\'s makes a floating static.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A primary static route to 2001:db8:2::/64 uses the default AD. Which AD makes a second static route to the same prefix act as a floating backup?',
    options: ['0', '1', '130', 'Any value — the most recently entered route wins'],
    answer: 2,
    difficulty: 1,
    explanation:
      'The backup needs an AD **higher** than the primary\'s AD of 1, such as 130. AD 1 would make the two routes equal and share traffic, 0 is reserved for connected routes, and the order of entry is irrelevant.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'R1 has static routes to 2001:db8:2::/64 and to 2001:db8:2::100/128. Which route does R1 use for traffic to 2001:db8:2::100?',
    options: ['The /128 host route', 'The /64 network route', 'Both, load-balanced', 'Whichever has the lower AD'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The router always chooses the **longest prefix match**, so the /128 wins. AD is compared only between routes to the same prefix, and routes to different prefixes never load-balance with each other.',
  },
];
