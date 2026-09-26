import type { Slide } from '../../types';

/** ipv6-fundamentals — slides 12–22: prefixes, header, IOS configuration, verification, traps. */
export const ipv6FundamentalsSlidesB: Slide[] = [
  {
    kind: 'table',
    title: 'Finding the prefix of any address',
    columns: ['Address/length', 'Keep', 'Prefix'],
    rows: [
      ['`2001:DB8:AAAA:1111:2222::5/64`', 'first 4 hextets', '`2001:DB8:AAAA:1111::/64`'],
      ['`2001:DB8:CAFE:1:ABCD::2/48`', 'first 3 hextets', '`2001:DB8:CAFE::/48`'],
      ['`2001:DB8:ACAD:1234:5678::1/56`', '3 hextets + 2 digits', '`2001:DB8:ACAD:1200::/56`'],
      ['`2001:DB8:ACAD:1234::1/60`', '3 hextets + 3 digits', '`2001:DB8:ACAD:1230::/60`'],
      ['`2001:DB8:1:ABCD::1/52`', '3 hextets + 1 digit', '`2001:DB8:1:A000::/52`'],
      ['`2001:DB8:1:AF::1/62`', '62 bits — go binary', '`2001:DB8:1:AC::/62`'],
    ],
    caption: 'On a 4-bit boundary, zero every digit after the prefix; otherwise convert the cut digit to binary.',
    notes:
      "The prefix (the IPv6 equivalent of the subnet ID) is found by keeping the first *n* bits and setting every remaining bit to zero. Each hex digit is 4 bits and each hextet is 16, so when the prefix length is a multiple of 4 you never need binary: /64 keeps four hextets, /48 keeps three, /56 keeps three hextets plus two digits, /60 three hextets plus three digits and /52 three hextets plus one digit. Always expand the hextet you are cutting through before you zero digits — `1234` cut after two digits becomes `1200`. The last row is the hard case. /62 is 48 + 14 bits, so it cuts through the last digit of the fourth hextet `00AF`. The digit F is 1111; keep the first two bits (11) and zero the last two (00), giving 1100 = C. The prefix is therefore `2001:DB8:1:AC::/62`. On a router, this is exactly the prefix you will see as the connected (C) route.",
  },
  {
    kind: 'diagram',
    title: 'The IPv6 header: 40 bytes, fixed',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'Version', size: 4, sub: '6' },
        { label: 'Traffic Class', size: 8, sub: 'DSCP + ECN' },
        { label: 'Flow Label', size: 20, sub: 'identifies a flow' },
        { label: 'Payload Length', size: 16, sub: 'bytes after the header' },
        { label: 'Next Header', size: 8, sub: '6 TCP · 17 UDP · 58 ICMPv6' },
        { label: 'Hop Limit', size: 8, sub: 'like TTL', tone: 'accent' },
        { label: 'Source Address', size: 128, sub: '128 bits' },
        { label: 'Destination Address', size: 128, sub: '128 bits' },
      ],
      caption: '8 fields, 320 bits = 40 bytes. No checksum, no fragmentation fields, no options.',
    },
    notes:
      "The IPv6 base header has only eight fields and a **fixed length of 40 bytes**, most of it taken by the two 128-bit addresses. **Version** is 6. **Traffic Class** (8 bits) carries QoS markings — the same DSCP and ECN bits as the IPv4 ToS byte. **Flow Label** (20 bits) is new: a source can tag all packets of one flow so routers can treat them consistently without looking deeper into the packet. **Payload Length** (16 bits) counts only the bytes after the 40-byte base header, including any extension headers. **Next Header** identifies what follows — an upper-layer protocol such as TCP (6), UDP (17) or ICMPv6 (58), or an extension header. **Hop Limit** is decremented by each router; at 0 the packet is dropped and an ICMPv6 Time Exceeded message is returned, exactly like the IPv4 TTL. Because the length is fixed, routers can process the header quickly in hardware.",
  },
  {
    kind: 'table',
    title: 'IPv4 header vs IPv6 header',
    columns: ['IPv4 field', 'IPv6', 'What changed'],
    rows: [
      ['Version (4)', 'Version (6)', 'Same 4-bit field'],
      ['Type of Service', '**Traffic Class**', 'Same DSCP/ECN role'],
      ['—', '**Flow Label**', 'New: tags packets of one flow'],
      ['Total Length', '**Payload Length**', 'Counts only what follows the 40-byte header'],
      ['Protocol', '**Next Header**', 'Upper-layer protocol or extension header'],
      ['Time to Live', '**Hop Limit**', 'Decremented per hop; 0 → discard'],
      ['Header Checksum', 'Removed', 'Link-layer FCS and L4 checksums catch errors'],
      ['Identification, Flags, Fragment Offset', 'Removed', 'Only the **source** fragments (extension header)'],
      ['IHL and Options', 'Removed', 'Fixed length; options move to extension headers'],
    ],
    notes:
      "Cisco likes to test the header by comparison, so learn the mapping. Four IPv6 fields are renamed IPv4 fields: Traffic Class (ToS), Payload Length (Total Length, but excluding the base header), Next Header (Protocol) and Hop Limit (TTL). One field is new: the Flow Label. Several IPv4 fields are gone. The **header checksum** was dropped because every hop had to recompute it after decrementing TTL, and Ethernet's FCS plus the TCP/UDP checksums already detect errors (in IPv6 the UDP checksum is mandatory). The **fragmentation fields** are gone because **routers never fragment IPv6 packets**: a router that receives a packet too large for the next link drops it and sends an ICMPv6 Packet Too Big message, and the source host adjusts (Path MTU Discovery) or fragments using a Fragment extension header. IPv6 requires every link to carry at least **1280 bytes**. Options and the header-length field disappear because optional information now lives in chained extension headers.",
  },
  {
    kind: 'bullets',
    title: 'Five ways to put IPv6 on an interface',
    bullets: [
      '`ipv6 address 2001:db8:acad:1::1/64` — static global address',
      '`ipv6 address 2001:db8:acad:2::/64 eui-64` — prefix + MAC-based interface ID',
      '`ipv6 address autoconfig` — learn the prefix from an RA (SLAAC)',
      '`ipv6 enable` — link-local address only, no global address',
      '`ipv6 address fe80::1 link-local` — replace the automatic link-local',
      'Any of these creates a **link-local** address automatically',
      'Global `ipv6 unicast-routing` — forward IPv6 and send RAs',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'SLAAC host', x: 1, y: 1.4 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 3.2, y: 1.4 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'ipv6 unicast-routing', x: 6, y: 1.4, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'G0/0/0 autoconfig', x: 6, y: 3.9 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 9, y: 3.9 },
      ],
      links: [
        { from: 'pc1', to: 'sw1' },
        { from: 'sw1', to: 'r1', toLabel: 'G0/0/0', label: '2001:DB8:ACAD:1::/64' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', toLabel: 'G0/0/0', label: '2001:DB8:ACAD:2::/64' },
        { from: 'r2', to: 'sw2', fromLabel: 'G0/0/1', label: 'ipv6 enable' },
      ],
    },
    notes:
      "IOS gives you several ways to address an interface, and the exam expects you to know what each one produces. A plain `ipv6 address prefix/length` assigns exactly the address you type. Adding the **eui-64** keyword means you type only the /64 prefix and IOS fills in the interface ID from the interface MAC address (modified EUI-64, covered in the next lesson). `ipv6 address autoconfig` makes the router behave like a host: it listens for Router Advertisements and builds its own address with SLAAC. `ipv6 enable` turns IPv6 on with **only a link-local address** — useful on links that need IPv6 neighbors but no global addressing. Every one of these commands also creates a link-local address automatically; `ipv6 address fe80::1 link-local` replaces that automatic value with an easy-to-read one. Separately, the global command `ipv6 unicast-routing` (off by default) is what turns the box into an IPv6 **router**: without it the interfaces have addresses but IPv6 packets are not routed between them.",
  },
  {
    kind: 'cli',
    title: 'Configuring R1 and R2',
    code: `R1(config)# ipv6 unicast-routing
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 address 2001:db8:acad:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ipv6 address 2001:db8:acad:2::/64 eui-64
R1(config-if)# no shutdown
R1(config-if)# end

R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# ipv6 address autoconfig
R2(config-if)# no shutdown
R2(config-if)# interface GigabitEthernet0/0/1
R2(config-if)# ipv6 enable
R2(config-if)# no shutdown`,
    highlight: ['ipv6 unicast-routing', 'eui-64', 'autoconfig', 'ipv6 enable', 'link-local'],
    caption: 'IOS stores and displays the addresses in uppercase, whatever case you type.',
    notes:
      "This transcript builds the topology from the previous slide. On R1, `ipv6 unicast-routing` is entered once in global configuration mode. G0/0/0 gets a static global address and a manual link-local `FE80::1`; a manual link-local is popular on routers because hosts use the router's link-local as their default gateway, and `FE80::1` is much easier to read in outputs. G0/0/1 uses **eui-64**: notice that you type the prefix with a zero interface ID (`2001:db8:acad:2::/64`) and IOS completes it. R2 is configured like a host on the 2001:DB8:ACAD:2::/64 link: `ipv6 address autoconfig` waits for R1's Router Advertisement, takes the /64 prefix from it and builds an EUI-64 interface ID. R2's G0/0/1 has only `ipv6 enable`, so it will have a link-local address and nothing else. One more IOS behavior worth remembering: unlike `ip address`, entering a second `ipv6 address` command on an interface **adds** another address instead of replacing the first.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show ipv6 interface brief',
    code: `R1# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::1
    2001:DB8:ACAD:1::1
GigabitEthernet0/0/1   [up/up]
    FE80::7210:5CFF:FE3E:9A01
    2001:DB8:ACAD:2:7210:5CFF:FE3E:9A01
Serial0/1/0            [administratively down/down]
    unassigned

R2# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::5E71:DFF:FEA2:3B10
    2001:DB8:ACAD:2:5E71:DFF:FEA2:3B10
GigabitEthernet0/0/1   [up/up]
    FE80::5E71:DFF:FEA2:3B11
Serial0/1/0            [administratively down/down]
    unassigned`,
    highlight: ['FE80::1', '2001:DB8:ACAD:1::1', '[up/up]', 'unassigned'],
    caption: 'Link-local first, then global addresses. An interface with only a link-local is still IPv6-enabled.',
    notes:
      "`show ipv6 interface brief` is the IPv6 twin of `show ip interface brief`, but the layout differs: each interface name is followed by its status and protocol in brackets, and the addresses are listed underneath — the **link-local address first**, then every global or unique local address. Read R1: G0/0/0 shows the manual `FE80::1` and the static `2001:DB8:ACAD:1::1`. G0/0/1 shows EUI-64 values for both addresses, and both share the same interface ID `7210:5CFF:FE3E:9A01` because both were built from the same MAC. On R2, G0/0/0 learned the prefix 2001:DB8:ACAD:2::/64 from R1 and built its own EUI-64 interface ID, while G0/0/1 shows **only** a link-local address, which is exactly what `ipv6 enable` produces. The word `unassigned` means IPv6 is not enabled on that interface at all. The brief output does not show prefix lengths, so use `show ipv6 interface` when you need them.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show ipv6 interface',
    code: `R1# show ipv6 interface GigabitEthernet0/0/0
GigabitEthernet0/0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:DB8:ACAD:1::1, subnet is 2001:DB8:ACAD:1::/64
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF00:1
  MTU is 1500 bytes
  ICMP error messages limited to one every 100 milliseconds
  ICMP redirects are enabled
  ICMP unreachables are sent
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)
  ND advertised reachable time is 0 (unspecified)
  ND advertised retransmit interval is 0 (unspecified)
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  Hosts use stateless autoconfig for addresses.`,
    highlight: ['FE80::1', 'subnet is 2001:DB8:ACAD:1::/64', 'FF02::2', 'every 200 seconds'],
    caption: 'The detailed view adds the prefix, joined multicast groups and Neighbor Discovery settings.',
    notes:
      "The detailed command answers questions the brief view cannot. The **Global unicast address(es)** section shows each address with its **subnet** (prefix and length) — an address configured with eui-64 would be tagged `[EUI]` here. **Joined group address(es)** lists the multicast groups the interface listens to: `FF02::1` (all nodes) is always joined; `FF02::2` (all routers) appears because `ipv6 unicast-routing` is enabled; and `FF02::1:FF00:1` is the solicited-node group for addresses ending in `...:1`. Here one group covers both `FE80::1` and `2001:DB8:ACAD:1::1` because they share the same last 24 bits. The ND lines show Neighbor Discovery behavior: DAD is on, and because this is a routing interface, Router Advertisements are sent every **200 seconds** with a router lifetime of **1800 seconds**. The last line means the RA tells hosts to use **SLAAC**. If FF02::2 and the RA lines are missing on a router, suspect a missing `ipv6 unicast-routing`.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show ipv6 route',
    code: `R1# show ipv6 route
IPv6 Routing Table - default - 5 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, I1 - ISIS L1, I2 - ISIS L2
       IA - ISIS interarea, IS - ISIS summary, D - EIGRP, EX - EIGRP external
       ND - ND Default, NDp - ND Prefix, DCE - Destination, NDr - Redirect
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
       ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
C   2001:DB8:ACAD:1::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:ACAD:1::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
C   2001:DB8:ACAD:2::/64 [0/0]
     via GigabitEthernet0/0/1, directly connected
L   2001:DB8:ACAD:2:7210:5CFF:FE3E:9A01/128 [0/0]
     via GigabitEthernet0/0/1, receive
L   FF00::/8 [0/0]
     via Null0, receive`,
    highlight: ['C   2001:DB8:ACAD:1::/64', 'L   2001:DB8:ACAD:1::1/128', 'FF00::/8'],
    caption: 'Each global address creates a C route for its /64 and an L /128 route for the address itself.',
    notes:
      "The IPv6 routing table follows the same logic as IPv4. Every up/up interface with a global (or unique local) address contributes two routes: a **connected (C)** route for the prefix, such as `2001:DB8:ACAD:1::/64`, and a **local (L)** route with a **/128** prefix for the router's own address, used to deliver packets addressed to the router itself (`receive`). The `[0/0]` pair is administrative distance and metric, just as in IPv4. IOS also installs `L FF00::/8 via Null0` for the multicast range. Notice what is **missing**: link-local addresses never appear in the routing table, because link-local traffic is never routed. The route format places the next hop or exit interface on a second line starting with `via`. Routes learned by routing protocols or static routes appear with codes such as S, O or D and are covered in the IPv6 routing lessons.",
  },
  {
    kind: 'steps',
    title: 'Troubleshooting IPv6 addressing',
    steps: [
      { title: 'Is the interface up/up?', text: '`show ipv6 interface brief` — admin down or down/down stops everything.' },
      { title: 'Is the address in the right /64?', text: 'A typo like `2001:db8:acad:10::1` instead of `:1::1` puts R1 on a different subnet.' },
      { title: 'Is the prefix length right?', text: 'Hosts and router must agree (normally /64); check `show ipv6 interface`.' },
      { title: 'Is `ipv6 unicast-routing` on?', text: 'Without it: no routing between interfaces, no RAs, no FF02::2.' },
      { title: 'Test step by step', text: '`ping` the local interface, the host, then remote networks.' },
    ],
    diagram: {
      type: 'topology',
      width: 9,
      height: 3.5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '2001:DB8:ACAD:1::10/64', x: 1.2, y: 1.6 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.3, y: 1.6 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 2001:DB8:ACAD:10::1/64', x: 7.4, y: 1.6, tone: 'bad' },
      ],
      links: [
        { from: 'pc1', to: 'sw1' },
        { from: 'sw1', to: 'r1', toLabel: 'G0/0/0', label: 'different /64s', tone: 'bad' },
      ],
    },
    notes:
      "Troubleshoot addressing from the bottom up. First confirm the interface is **up/up**; `unassigned` or `administratively down` in `show ipv6 interface brief` explains everything downstream. Next, compare the prefix on the router with the prefix the hosts use. Hex typos are easy to make and hard to see: in the diagram the engineer typed `2001:db8:acad:10::1` instead of `2001:db8:acad:1::1`, so R1 sits in 2001:DB8:ACAD:10::/64 while PC1 is in 2001:DB8:ACAD:1::/64 and cannot reach its gateway address. Check prefix lengths too — a host with a wrong prefix length makes wrong on-link decisions. Then confirm `ipv6 unicast-routing` is configured; if it is missing, the router still answers pings to its own addresses but does not forward between interfaces or send Router Advertisements, so SLAAC hosts get no global address. Finally, test with `ping` in widening circles. Duplicate Address Detection may also flag an address as a duplicate, in which case it is not used.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: IPv6 fundamentals',
    body: 'Most IPv6 misses come from **abbreviation slips** and a forgotten `ipv6 unicast-routing`.',
    bullets: [
      'Only **leading** zeros go: `0DB8`→`DB8`, but `DB80` and `A000` never shrink',
      '`::` appears **once** and replaces the **longest** zero run (leftmost on a tie)',
      'Expanding: `::` = 8 minus the hextets shown, each `0000`',
      'Header: fixed **40 bytes**, no checksum, routers never fragment',
      '**Hop Limit** replaces TTL; **Next Header** replaces Protocol',
      'A second `ipv6 address` **adds** an address; it does not replace the first',
      'No `ipv6 unicast-routing` → no routing, no RAs, no FF02::2',
    ],
    notes:
      "These are the patterns behind most wrong answers. The first three are all about notation: distractors are built by dropping **trailing** zeros, by using `::` twice, or by compressing the shorter zero run. When you see an abbreviation question, expand every option back to 32 digits if you are unsure — it takes 20 seconds and removes all doubt. For the header, remember three absolutes: fixed 40 bytes, no header checksum and no fragmentation by routers; a distractor saying the header is 20–60 bytes or that routers fragment is describing IPv4. On IOS, remember that IPv6 routing is **disabled by default** — `ip routing` is on by default for IPv4 on routers, but `ipv6 unicast-routing` must be entered. And unlike IPv4, where a second `ip address` replaces the first unless you use `secondary`, a second `ipv6 address` simply adds another address to the interface.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '128 bits = 8 hextets × 4 hex digits; one hex digit = 4 bits',
      'Shorten: drop leading zeros, then one `::` for the longest zero run',
      'Expand: count hextets, refill `::`, pad each hextet to 4 digits',
      'LANs are **/64**: routing prefix + subnet ID + 64-bit interface ID',
      'Header: 40 bytes — Traffic Class, Flow Label, Payload Length, Next Header, Hop Limit',
      'IOS: `ipv6 unicast-routing`, `ipv6 address` (static, `eui-64`, `link-local`), `autoconfig`, `ipv6 enable`',
      'Verify: `show ipv6 interface brief`, `show ipv6 interface`, `show ipv6 route`',
    ],
    notes:
      "You can now read and write IPv6 addresses in any form. Remember the core arithmetic: an address is 128 bits in eight 16-bit hextets, and every hex digit is exactly one nibble. The two abbreviation rules — drop leading zeros, and replace the single longest run of zero hextets with `::` — are applied in that order, and expansion simply reverses them. Prefixes are counted in bits; on a 4-bit boundary you can zero digits in hex, otherwise convert one digit to binary. The IPv6 header is a fixed 40 bytes with eight fields; know the IPv4 equivalents and what was removed. On IOS, enable routing with `ipv6 unicast-routing`, choose between static, EUI-64, autoconfig, link-local-only and manual link-local addressing, and verify with the three show commands. The next lesson builds on this with address types, modified EUI-64 in detail, multicast groups and Neighbor Discovery.",
  },
];
