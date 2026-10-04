import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'IPv4 static route syntax', back: '`ip route <prefix> <mask> {next-hop | exit-interface | exit-interface next-hop} [AD]` — the mask is dotted decimal (no `/24`, no wildcard).' },
  { id: 'f2', front: 'Default administrative distance of a static route', back: '**1** (connected routes are 0).' },
  { id: 'f3', front: 'Recursive static route', back: 'A route with only a **next-hop IP**. The router must look up the next hop in the routing table to find the exit interface.' },
  { id: 'f4', front: 'How an exit-interface-only static route is displayed', back: '`S 10.2.2.0/24 is directly connected, GigabitEthernet0/0/1` — no `[AD/metric]` brackets, but the AD is still 1.' },
  { id: 'f5', front: 'Fully specified static route', back: 'Names both the exit interface and the next hop, e.g. `ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/0/1 10.0.12.2`. No recursive lookup needed.' },
  { id: 'f6', front: 'Mask used for an IPv4 host route', back: '`255.255.255.255` (/32) — matches exactly one address.' },
  { id: 'f7', front: 'Command for an IPv4 static default route', back: '`ip route 0.0.0.0 0.0.0.0 <next-hop>` (prefix 0.0.0.0, mask 0.0.0.0).' },
  { id: 'f8', front: 'Route code `S*`', back: 'A **static** route that is the **candidate default** route (normally 0.0.0.0/0).' },
  { id: 'f9', front: '"Gateway of last resort is not set"', back: 'No default route is installed; packets that match no route are dropped.' },
  { id: 'f10', front: 'Floating static route', back: 'A static route configured with an AD **higher** than the primary route, so it is installed only when the primary route leaves the table.' },
  { id: 'f11', front: 'Lowest AD that makes a static route float above OSPF', back: '**111** (anything above OSPF\'s 110; values like 130 are common).' },
  { id: 'f12', front: 'AD for a floating static that backs up another static route', back: 'Anything from **2** to 254 — **5** is a common convention.' },
  { id: 'f13', front: 'Static route configured with AD 255', back: 'Never installed — AD 255 means the source is unusable.' },
  { id: 'f14', front: 'Why avoid exit-interface-only static routes on Ethernet?', back: 'The router ARPs for **every destination** in the prefix and depends on the neighbor\'s **proxy ARP**; the ARP cache grows and traffic fails if proxy ARP is off.' },
  { id: 'f15', front: 'Is proxy ARP enabled by default on IOS Ethernet interfaces?', back: 'Yes (`ip proxy-arp`). `no ip proxy-arp` disables it per interface.' },
  { id: 'f16', front: 'Two reasons a configured static route is not installed', back: 'The **exit interface is down**, or the **next hop is unreachable** (no route covers it). A lower-AD route for the same prefix also keeps it out.' },
  { id: 'f17', front: '`show ip route static`', back: 'Lists the **installed** static routes only — a floating static waiting in reserve does not appear.' },
  { id: 'f18', front: '`show ip route 10.2.2.77`', back: 'Performs a lookup and shows the entry that would be used (e.g. "Routing entry for 10.2.2.0/24"), with source, AD, metric and next hop.' },
  { id: 'f19', front: '`% Subnet not in table`', back: 'No route matches the address, although other subnets of the same classful network exist. ("% Network not in table" = classful network absent.)' },
  { id: 'f20', front: 'Source address of a ping originated by a router', back: 'The IP of the **exit interface**. Use `ping <dest> source <interface|ip>` to test as if from the LAN.' },
  { id: 'f21', front: 'Classic symptom of a missing return route', back: 'Plain router pings succeed, but pings from LAN hosts (or sourced from the LAN interface) time out.' },
  { id: 'f22', front: 'Two static routes: same prefix, same AD, different next hops', back: 'Both are installed and traffic is **load-shared** (equal-cost multipath).' },
  { id: 'f23', front: 'Traceroute hops alternating between two addresses', back: 'A **routing loop** between those two routers (e.g. static/default routes pointing at each other).' },
  { id: 'f24', front: 'IOS reaction to `ip route 10.2.2.0 255.255.0.0 10.0.12.2`', back: 'Rejected with "Inconsistent address and mask" — the prefix has host bits set for that mask.' },
  { id: 'f25', front: 'A /32 host route and a /24 route both match a destination', back: 'The **/32** is used — longest prefix match wins before AD is ever considered.' },
  { id: 'f26', front: 'Static routing: main advantage and main drawback', back: 'Advantage: no protocol overhead, predictable, nothing advertised. Drawback: no automatic reaction to topology changes.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which command creates an IPv4 default static route that sends traffic to next hop 203.0.113.1?',
    options: [
      '`ip route 0.0.0.0 0.0.0.0 203.0.113.1`',
      '`ip route 0.0.0.0 255.255.255.255 203.0.113.1`',
      '`ip default-network 203.0.113.1`',
      '`ip route 203.0.113.1 0.0.0.0 0.0.0.0`',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'A default route has prefix **0.0.0.0** and mask **0.0.0.0**, followed by the next hop. A mask of 255.255.255.255 would make a host route, `ip default-network` flags a classful network rather than creating this route, and `ip route 203.0.113.1 0.0.0.0 0.0.0.0` puts the next hop where the prefix belongs.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'What is the default administrative distance of a static route?',
    options: ['0', '1', '5', '110'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Static routes default to AD **1**. Connected routes are 0, 5 is a common value chosen for a floating static, and 110 belongs to OSPF.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two conditions prevent a configured static route from being installed in the routing table? (Choose two.)',
    options: [
      'The exit interface named in the route is down',
      'No route exists to the next-hop address',
      'The route uses the default AD of 1',
      'The route is a /32 host route',
      'The next hop is on a directly connected subnet',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'A static route is installed only if its **exit interface is up** and its **next hop can be resolved**. AD 1 is normal, host routes install fine, and a next hop on a connected subnet is exactly what makes a route usable.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'R1 learns 10.2.2.0/24 from OSPF. What is the **smallest** AD you can give a static route to the same prefix so that it acts as a floating backup?',
    answers: ['111'],
    placeholder: 'AD value',
    difficulty: 2,
    explanation:
      'OSPF routes have AD **110**. A floating static must have a higher AD, so **111** is the minimum; engineers often choose a rounder number such as 130. Anything 110 or lower would compete with or beat OSPF.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each static route form with the way it appears in `show ip route`.',
    pairs: [
      { left: 'Next hop only', right: '`S 10.2.2.0/24 [1/0] via 10.0.12.2`' },
      { left: 'Exit interface only', right: '`S 10.2.2.0/24 is directly connected, GigabitEthernet0/0/1`' },
      { left: 'Fully specified', right: '`S 10.2.2.0/24 [1/0] via 10.0.12.2, GigabitEthernet0/0/1`' },
      { left: 'Default route', right: '`S* 0.0.0.0/0 [1/0] via 10.0.12.2`' },
    ],
    difficulty: 2,
    explanation:
      'A next-hop route shows only "via next-hop". An exit-interface route shows "is directly connected" without brackets. A fully specified route shows both the next hop and the interface. The default route is flagged with an asterisk as the candidate default.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'R1 can ping Server1 on R2\'s LAN, but PC1 on R1\'s LAN cannot. R1 has a correct static route to the server subnet. What is the most likely cause?',
    options: [
      'R2 has no route back to PC1\'s subnet',
      'R1 needs a fully specified static route',
      'PC1 has the wrong DNS server',
      'The static route on R1 has an AD of 1',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'R1\'s own ping is sourced from its WAN interface, which R2 knows as connected, so it succeeds. PC1\'s packets have a LAN source address, and R2 needs a **return route** for it. The route form on R1 is fine, DNS is irrelevant to pinging an IP, and AD 1 is normal.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Why are static routes that name only an Ethernet exit interface discouraged?',
    options: [
      'The router ARPs for every destination and relies on proxy ARP',
      'IOS installs them with an AD of 255, so they lose to dynamic routes',
      'They cannot be used for default routes on Ethernet interfaces',
      'They force a recursive route lookup for every packet forwarded',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'With only an Ethernet exit interface, the router treats every destination as on-link, ARPs for each one and depends on the neighbor\'s **proxy ARP**. The AD is 1, they can technically be used for defaults (with a performance warning), and it is next-hop routes — not exit-interface routes — that need a recursive lookup.',
  },
];
