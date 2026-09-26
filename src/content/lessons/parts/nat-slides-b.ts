import type { Slide } from '../../types';

export const natSlidesB: Slide[] = [
  {
    kind: 'cli',
    title: 'Verifying dynamic NAT',
    code: `R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
---  203.0.113.20          10.1.1.10             ---                   ---
---  203.0.113.21          10.1.1.11             ---                   ---
---  203.0.113.22          10.1.1.12             ---                   ---
Total number of translations: 3
R1# show ip nat statistics
Total active translations: 3 (0 static, 3 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0/1
Inside interfaces:
  GigabitEthernet0/0/0
Hits: 214  Misses: 3
Expired translations: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool PUBLIC refcount 3
 pool PUBLIC: netmask 255.255.255.224
        start 203.0.113.20 end 203.0.113.29
        type generic, total addresses 10, allocated 3 (30%), misses 0`,
    highlight: ['Inside global', 'allocated 3 (30%), misses 0'],
    notes:
      "`show ip nat translations` lists every entry, and its column order is itself an exam trap: **Inside global comes first**, then inside local, outside local and outside global. Each dynamic entry here is a simple one-to-one mapping — dashes in the protocol and outside columns — and the pool lent its addresses in order, so the first three hosts received .20, .21 and .22. `show ip nat statistics` adds context. It lists the inside and outside interfaces, which is the fastest way to catch swapped roles. **Hits** count lookups that found an existing entry; **misses** count lookups that found none and forced the router to create one — three misses for three new hosts. The pool line shows capacity: 10 addresses, 3 allocated (30%), and 0 pool misses. Pool misses count failed allocations, so a non-zero value there is your proof of **pool exhaustion**. Dynamic entries stay until they have been idle for the timeout, 24 hours by default (`ip nat translation timeout` changes it), which is why a pool that looks generous on paper can run dry during a busy day.",
  },
  {
    kind: 'diagram',
    title: 'PAT: many hosts, one public address',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc1', label: 'PC1 10.1.1.10', icon: 'pc' },
        { id: 'pc2', label: 'PC2 10.1.1.11', icon: 'pc' },
        { id: 'r1', label: 'R1 (PAT)', icon: 'router' },
        { id: 'srv', label: 'Server 192.0.2.80', icon: 'server' },
      ],
      steps: [
        { from: 'pc1', to: 'r1', label: '10.1.1.10:51000 → 192.0.2.80:443' },
        { from: 'pc2', to: 'r1', label: '10.1.1.11:51000 → 192.0.2.80:443', sub: 'same source port as PC1' },
        { from: 'r1', to: 'srv', label: '198.51.100.2:51000 → 192.0.2.80:443', sub: 'PC1 keeps its port' },
        { from: 'r1', to: 'srv', label: '198.51.100.2:1024 → 192.0.2.80:443', sub: 'PC2 gets a free port', tone: 'accent' },
        { from: 'srv', to: 'r1', label: '192.0.2.80:443 → 198.51.100.2:1024', dashed: true },
        { note: 'R1 looks up port 1024 → 10.1.1.11:51000' },
        { from: 'r1', to: 'pc2', label: '192.0.2.80:443 → 10.1.1.11:51000', dashed: true },
      ],
    },
    caption: 'PAT tells flows apart by address **and port** — one inside global serves them all.',
    notes:
      "PAT solves the problem that dynamic NAT leaves open: many hosts, very few public addresses. The router keys each entry on the full socket — protocol, address and port — so it can tell conversations apart even when they share one inside global address. Here PC1 and PC2 both happen to use source port 51000 toward the same server. R1 keeps PC1's original port, because IOS preserves the source port when it is free on the public address. PC2's port 51000 is already taken on 198.51.100.2, so R1 assigns PC2 another free port, 1024. The server sees two different sockets, 198.51.100.2:51000 and 198.51.100.2:1024, and replies to each. When the reply for port 1024 arrives, R1 looks up that port, rewrites the destination to 10.1.1.11:51000 and forwards it to PC2. Because the port field is 16 bits, one public address can in theory carry roughly 65,000 simultaneous flows per transport protocol. ICMP has no ports, so for pings IOS uses the ICMP query identifier in the same way.",
  },
  {
    kind: 'cli',
    title: 'Configuring PAT (NAT overload)',
    code: `R1(config)# access-list 1 permit 10.1.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/0/1 overload
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ip nat outside
R1(config-if)# end
R1# show ip nat statistics | include access-list
[Id: 1] access-list 1 interface GigabitEthernet0/0/1 refcount 4`,
    highlight: ['interface GigabitEthernet0/0/1 overload'],
    bullets: [
      'The interface named is the **outside** interface — its current IP becomes the inside global',
      'Pool variant: `ip nat inside source list 1 pool PUBLIC overload`',
      'Without `overload`, a pool is plain dynamic NAT again',
    ],
    notes:
      "PAT changes only the last line of a dynamic NAT configuration. The `interface GigabitEthernet0/0/1 overload` form tells R1 to use whatever address is configured on its outside interface, which is perfect when the ISP assigns that address by DHCP and it may change. The interface you name is the **outside** interface; naming the LAN interface is a common exam distractor. The pool form, `ip nat inside source list 1 pool PUBLIC overload`, overloads a pool instead: IOS keeps using the first pool address until its ports run out, then moves on to the next. Forgetting `overload` on a pool leaves you with plain dynamic NAT and its exhaustion problem. As always, the ACL defines who is translated and inside/outside must be set on the interfaces. The keyword really is `overload` — there is no `pat` keyword in the command. The refcount of 4 in the statistics line says four translations currently use this mapping. Home and branch routers run exactly this configuration, so it is the single most important NAT configuration to be able to write from memory.",
  },
  {
    kind: 'cli',
    title: 'Reading PAT translations',
    code: `R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
tcp  198.51.100.2:51000    10.1.1.10:51000       192.0.2.80:443        192.0.2.80:443
tcp  198.51.100.2:1024     10.1.1.11:51000       192.0.2.80:443        192.0.2.80:443
udp  198.51.100.2:60211    10.1.1.12:60211       192.0.2.53:53         192.0.2.53:53
icmp 198.51.100.2:3        10.1.1.10:3           192.0.2.80:3          192.0.2.80:3
Total number of translations: 4`,
    highlight: ['198.51.100.2:1024', '10.1.1.11:51000'],
    caption: 'Every inside global is the outside interface address — the signature of interface overload.',
    notes:
      "PAT entries are **extended** entries: the protocol column is filled in and every address carries a port. Read each line left to right as inside global, inside local, outside local, outside global. Line one: PC1 (10.1.1.10:51000) appears on the Internet as 198.51.100.2:51000 while it talks to the web server on TCP 443. Line two: PC2 also used port 51000, so it was mapped to 198.51.100.2:1024. Line three is a DNS query from PC3 to 192.0.2.53 on UDP 53. Line four is a ping; the number after the colon is the ICMP identifier, not a port. Every inside global address is the same, 198.51.100.2 — the outside interface — which tells you this is interface overload. The outside local and outside global columns match on every line because no outside NAT is configured. Exam questions built on this kind of exhibit ask things such as “which inside local address is using port 1024?” or “what is the inside global address of PC3?” Move column by column and never assume the first address on a line is the private one.",
  },
  {
    kind: 'diagram',
    title: 'NAT and routing: order of operations',
    diagram: {
      type: 'flow',
      width: 10,
      height: 4.2,
      nodes: [
        { id: 'a1', label: 'In: inside i/f', sub: 'ACL sees inside local', x: 1.2, y: 1.1, shape: 'pill' },
        { id: 'a2', label: 'Routing lookup', sub: 'needs a route out', x: 3.75, y: 1.1 },
        { id: 'a3', label: 'Translate source', sub: 'local → global', x: 6.25, y: 1.1, tone: 'accent' },
        { id: 'a4', label: 'Out: outside i/f', sub: 'ACL sees inside global', x: 8.8, y: 1.1, shape: 'pill' },
        { id: 'b1', label: 'In: outside i/f', sub: 'ACL sees inside global', x: 1.2, y: 3.1, shape: 'pill' },
        { id: 'b2', label: 'Translate destination', sub: 'global → local', x: 3.75, y: 3.1, tone: 'accent' },
        { id: 'b3', label: 'Routing lookup', sub: 'uses inside local', x: 6.25, y: 3.1 },
        { id: 'b4', label: 'Out: inside i/f', sub: 'to the LAN host', x: 8.8, y: 3.1, shape: 'pill' },
      ],
      edges: [
        { from: 'a1', to: 'a2' },
        { from: 'a2', to: 'a3' },
        { from: 'a3', to: 'a4' },
        { from: 'b1', to: 'b2' },
        { from: 'b2', to: 'b3' },
        { from: 'b3', to: 'b4' },
      ],
    },
    caption: 'Inside → outside: **route, then translate**. Outside → inside: **translate, then route**.',
    notes:
      "NAT is not the first thing that happens to a packet, and the order explains several exam questions. For a packet going from **inside to outside**, the router first checks any inbound ACL on the inside interface — which therefore sees the inside local address — then makes its **routing decision**, and only then translates the source. If there is no route out an outside interface (a missing default route, for example), the packet is dropped before NAT ever sees it, and no translation appears. An outbound ACL on the outside interface is evaluated after translation, so it must match the **inside global** address. For a packet going from **outside to inside**, an inbound ACL on the outside interface also sees the inside global address; then NAT translates the destination back to the inside local address, and only then does routing run, using that private address to find the LAN. Remember the pair: inside-to-outside is route, then translate; outside-to-inside is translate, then route.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting tools: exhaustion and debug',
    code: `R1# show ip nat statistics
Total active translations: 10 (0 static, 10 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0/1
Inside interfaces:
  GigabitEthernet0/0/0
Hits: 9840  Misses: 16
Expired translations: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool PUBLIC refcount 10
 pool PUBLIC: netmask 255.255.255.224
        start 203.0.113.20 end 203.0.113.29
        type generic, total addresses 10, allocated 10 (100%), misses 6
R1# clear ip nat translation *
R1# debug ip nat
IP NAT debugging is on
NAT: s=10.1.1.14->203.0.113.20, d=192.0.2.80 [2051]
NAT*: s=192.0.2.80, d=203.0.113.20->10.1.1.14 [60312]
R1# undebug all
All possible debugging has been turned off`,
    highlight: ['allocated 10 (100%), misses 6', 's=10.1.1.14->203.0.113.20'],
    notes:
      "Here is dynamic NAT on a bad day. `show ip nat statistics` shows 10 of 10 pool addresses allocated (100%) and 6 pool misses: six times an inside host needed a translation and no address was left. Those users have no Internet access while earlier users work fine — the classic symptom of **pool exhaustion**. `clear ip nat translation *` deletes all dynamic entries (static entries remain, because they are configuration), which frees the pool but also cuts every active session. It is a reset, not a fix; real fixes are adding `overload`, enlarging the pool or shortening the timeout. `debug ip nat` prints each translation. In `NAT: s=10.1.1.14->203.0.113.20, d=192.0.2.80` the arrow shows the source being rewritten from inside local to inside global on the way out; the reply line shows the destination being rewritten back to the inside local. An asterisk after NAT means the packet was translated in the fast-switching path, and the number in brackets is the IP identification value. Debugs cost CPU, so turn them off with `undebug all` as soon as you have your answer.",
  },
  {
    kind: 'table',
    title: 'NAT troubleshooting checklist',
    columns: ['Symptom', 'Likely cause', 'Check / fix'],
    rows: [
      ['Translation table stays empty', '`ip nat inside` / `outside` missing or **swapped**', '`show ip nat statistics` interface lists'],
      ['Some hosts never translated', 'ACL does not match their inside local addresses', '`show access-lists`; fix network or wildcard'],
      ['No translations, no errors', 'No route out the outside interface (routing runs first)', '`show ip route`; add the default route'],
      ['Early users work, later users fail', 'Dynamic pool exhausted (no `overload`)', 'Pool `allocated 100%` with misses → add `overload`'],
      ['Entries created, replies never arrive', 'ISP does not route the inside globals back to R1', 'Confirm the pool/public block is really yours'],
      ['Internet cannot reach the server', 'Static entry missing or addresses reversed', '`ip nat inside source static <local> <global>`'],
    ],
    notes:
      "Most NAT failures come from a short list of mistakes, and the exam builds its troubleshooting exhibits from the same list. Start with `show ip nat statistics`: if the inside and outside interface lists are empty or reversed, nothing else matters. If some hosts translate and others do not, compare their addresses with the ACL — a wrong wildcard such as `0.0.0.127`, or a typo in the network address, is common, and the hit counters in `show access-lists` confirm which entries match. If there are no translations and no errors at all, check routing: without a route out the outside interface, packets are dropped before translation. If entries appear in the table but users still fail, the problem is usually beyond R1 — the ISP may not route the inside global addresses back, or the pool uses addresses the ISP never assigned to you. Finally, check that static commands list the inside local address first and that the ACL number or name in the binding matches the ACL you actually created.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'NAT exam traps',
    body: '==Local = seen from the inside; global = seen from the outside.== Inside/outside says where the host lives.',
    bullets: [
      '`show ip nat translations` lists **inside global first**, then inside local',
      'Static syntax is `static <inside local> <inside global>` — never reversed',
      'PAT keyword is `overload`; the interface named is the **outside** one',
      'A pool without `overload` = one host per address → exhaustion',
      'The NAT ACL selects traffic to translate — it does not filter',
      'Inside→outside: route, then translate; outside→inside: translate, then route',
      '`clear ip nat translation *` never removes static entries',
    ],
    notes:
      "These are the traps Cisco uses most. Terminology questions swap inside global and inside local, or treat outside local as a private address; answer them by asking where the host lives and from which side you are looking. Exhibit questions rely on you knowing that `show ip nat translations` shows the **inside global** column first — candidates who assume the first column is the private address miss them. Configuration questions offer the static command with its addresses reversed, `overload` pointing at the LAN interface, `ip nat outside` on the LAN, or a pool with no `overload` when there are more hosts than addresses. Remember that the NAT ACL only chooses what to translate: a host that is not permitted is not blocked, it just leaves untranslated and fails at the ISP. Order-of-operation questions ask which address an interface ACL must match — inside local on the inside interface, inside global on the outside interface. And `clear ip nat translation *` removes dynamic entries only; static mappings stay until you remove the configuration line.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Four terms: inside local/global, outside local/global — local is the inside view',
      'Static NAT: permanent 1:1 mapping that allows inbound connections',
      'Dynamic NAT: ACL + pool + `list … pool`; fails when the pool runs dry',
      'PAT: `overload` on an interface or pool; ports keep flows apart',
      'Always set `ip nat inside` and `ip nat outside`; routing still happens first',
      'Verify with `show ip nat translations` / `statistics`; reset with `clear ip nat translation *`',
    ],
    notes:
      "Let's pull it together. NAT lets private networks use public addresses at the border, and IOS names every address by where the host lives (inside or outside) and where it is seen (local or global). **Static NAT** creates a permanent one-to-one mapping with `ip nat inside source static <local> <global>` and is the only basic type that lets outside users start connections to an inside server. **Dynamic NAT** combines an ACL that picks the inside locals, a pool of inside globals and the `ip nat inside source list … pool …` binding; it saves nothing when every host needs an address at once, and it fails when the pool is exhausted. **PAT** adds `overload`, uses ports to multiplex, and is what real networks run. None of it works without `ip nat inside` and `ip nat outside` on the right interfaces and a route out. When things break, go to `show ip nat statistics` first, then the translation table, the ACL and the routing table, and use `debug ip nat` sparingly to watch translations happen.",
  },
];
