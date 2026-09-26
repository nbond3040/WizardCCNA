import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'IPv6 Address Types, EUI-64 & NDP',
    subtitle: 'Unicast, multicast and anycast; building interface IDs; how hosts find routers, neighbors and addresses',
    notes:
      "IPv6 is not just IPv4 with longer addresses. It replaces broadcast with multicast, gives every interface several addresses at once, and swaps ARP and much of DHCP for a set of ICMPv6 messages called the **Neighbor Discovery Protocol**. This deck covers v1.1 exam topics 1.9.a to 1.9.d and the matching IPv6 content in domain 1 of v2.0. You will learn to recognize every address type from its first hextet: global unicast, unique local, link-local and multicast, plus anycast and the special unspecified and loopback addresses. You will build interface IDs with modified **EUI-64**, including the step that trips everyone up, flipping the seventh bit. Then you will see how NDP works: router solicitations and advertisements, neighbor solicitations and advertisements, duplicate address detection, and the solicited-node multicast groups that make it efficient. Finally you will compare SLAAC, stateless DHCPv6 and stateful DHCPv6, and learn how the M and O flags in a router advertisement tell hosts which method to use.",
  },
  {
    kind: 'table',
    title: 'IPv6 address types at a glance',
    columns: ['Type', 'Prefix', 'Starts with', 'Scope / use'],
    rows: [
      ['Global unicast (GUA)', '`2000::/3`', '2 or 3 (2000 to 3FFF)', 'Public; routed on the Internet'],
      ['Unique local (ULA)', '`FC00::/7` (`FD00::/8` in use)', 'FC or FD', 'Private; routed inside an organization'],
      ['Link-local', '`FE80::/10`', 'FE80 (FE80 to FEBF)', 'One link only; never routed'],
      ['Multicast', '`FF00::/8`', 'FF', 'One-to-many; replaces broadcast'],
      ['Anycast', 'No special range', 'Any unicast prefix', 'Same address on several devices; nearest wins'],
      ['Loopback', '`::1/128`', '::1', 'The host itself, like 127.0.0.1'],
      ['Unspecified', '`::/128`', '::', 'No address yet (source during DAD)'],
    ],
    caption: 'There is **no broadcast** address in IPv6.',
    notes:
      "Start every IPv6 question by classifying the address from its first hextet. **Global unicast** addresses come from 2000::/3, so any address beginning with 2 or 3 is a public address that can be routed on the Internet; 2001:DB8::/32 is reserved for documentation, which is why you see it in examples. **Unique local** addresses come from FC00::/7, but because the eighth bit must be 1 for locally assigned prefixes, real ULAs start with **FD**. They play the role of RFC 1918 private addresses. **Link-local** addresses start with FE80 and exist on every IPv6-enabled interface; routers never forward them. **Multicast** addresses start with FF and replace broadcast entirely. Anycast has no range of its own: it is a normal unicast address configured on more than one device. Finally, ::1 is the loopback and :: is the unspecified address. Notice that there is no broadcast row: IPv6 has no broadcast address at all, which makes any answer mentioning an IPv6 broadcast a favorite exam distractor.",
  },
  {
    kind: 'bullets',
    title: 'Global unicast addresses',
    bullets: [
      'Range **2000::/3**: first hextet 2000 to 3FFF',
      'Globally unique and routable on the Internet',
      'Typical site: /48 prefix, 16-bit subnet ID, 64-bit interface ID',
      'One /48 holds 65,536 subnets of size /64',
      'Assigned manually, by EUI-64, by SLAAC or by DHCPv6',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'Global routing prefix', size: 48, sub: 'from the ISP or RIR' },
        { label: 'Subnet ID', size: 16, sub: 'your subnets' },
        { label: 'Interface ID', size: 64, tone: 'accent', sub: 'the host' },
      ],
      caption: '48 + 16 + 64 = 128 bits',
    },
    notes:
      "A global unicast address is the IPv6 equivalent of a public IPv4 address, and IANA currently allocates them from 2000::/3, so the first hex digit is always 2 or 3. The address is usually read in three parts. The **global routing prefix**, commonly 48 bits, is assigned to an organization by an ISP or a regional Internet registry. The next 16 bits are the **subnet ID**, which the organization uses to number its own subnets: 2 to the power of 16 gives 65,536 subnets of size /64 from a single /48. The last 64 bits are the **interface ID**, which identifies the host on its subnet. The /64 boundary is not arbitrary: SLAAC and EUI-64 both assume a 64-bit interface ID, so LAN subnets should always be /64. On the exam you may need to pick out the parts of an address such as 2001:DB8:ACAD:12::25/64. The first 48 bits are 2001:DB8:ACAD, the subnet ID is 12, and the interface ID is ::25.",
  },
  {
    kind: 'bullets',
    title: 'Unique local addresses',
    bullets: [
      'Range **FC00::/7**; locally assigned prefixes use **FD00::/8**',
      'Routed inside an organization, never on the Internet',
      'A random 40-bit Global ID makes overlaps unlikely',
      'Same role as RFC 1918 private IPv4 addresses',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'FD', size: 8, sub: 'FC00::/7 plus L bit = 1' },
        { label: 'Global ID', size: 40, tone: 'accent', sub: 'random' },
        { label: 'Subnet ID', size: 16 },
        { label: 'Interface ID', size: 64 },
      ],
    },
    notes:
      "Unique local addresses are IPv6's private addresses. The block is FC00::/7, which covers first hextets FC00 through FDFF, but the eighth bit, called the L bit, must be set to 1 for prefixes that an organization assigns to itself; the half with L set to 0 is reserved for future definition. That is why every ULA you meet in practice starts with **FD**. After the eight bits of FD comes a 40-bit **Global ID** that should be generated randomly, then a 16-bit subnet ID and the 64-bit interface ID. The random Global ID is the key difference from RFC 1918: if two companies that both use ULAs merge, their prefixes are very unlikely to overlap, so no renumbering is needed. ULAs are routed normally inside the organization but must never be advertised to or accepted from the Internet. The exam trap is the range: FC00::/7 is the official answer, FD00::/8 is what is actually used, and FE80::/10 is link-local, not unique local.",
  },
  {
    kind: 'bullets',
    title: 'Link-local addresses',
    bullets: [
      'Range **FE80::/10**; in practice FE80::/64 plus an interface ID',
      'Created automatically on every IPv6-enabled interface',
      'Valid on **one link only**: routers never forward them',
      'Used by NDP, as the RA source and as routing next hops',
      'The same link-local may be reused on every interface',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'FE80::A1', x: 1, y: 2.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.2, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'FE80::1 on both ports', x: 5.6, y: 2.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'FE80::2', x: 8.6, y: 2.5 },
      ],
      links: [
        { from: 'pc1', to: 'sw' },
        { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/1', label: 'another link' },
      ],
      annotations: [
        { x: 3.2, y: 0.8, text: 'Link A: FE80::A1 reaches FE80::1', tone: 'good' },
        { x: 7.2, y: 4.3, text: 'R2 link-local: unreachable from PC1', tone: 'bad' },
      ],
    },
    notes:
      "Every interface that runs IPv6 has a **link-local** address, automatically, even when no other IPv6 address is configured; on Cisco IOS the interface command `ipv6 enable` alone is enough to create one. The prefix is FE80::/10, but in practice the first 64 bits are always FE80:0000:0000:0000, followed by a 64-bit interface ID that IOS builds with EUI-64 unless you set one manually, for example with `ipv6 address FE80::1 link-local`. As the name says, the address is only meaningful on its own link. A router **never forwards** a packet with a link-local source or destination to another link, so PC1 can reach R1's FE80::1 but can never reach R2's link-local address. Because the scope is a single link, the same link-local address can safely be reused on every interface of a router, which makes it easy to remember as a default gateway. Link-local addresses are the workhorses of IPv6: NDP messages, router advertisements and routing protocol next hops all use them.",
  },
  {
    kind: 'table',
    title: 'Well-known multicast addresses',
    columns: ['Address', 'Group', 'Who joins'],
    rows: [
      ['`FF02::1`', 'All nodes', 'Every IPv6 device on the link (replaces broadcast)'],
      ['`FF02::2`', 'All routers', 'Every IPv6 router on the link'],
      ['`FF02::5`', 'All OSPFv3 routers', 'Every OSPFv3 router on the link'],
      ['`FF02::6`', 'OSPFv3 DR and BDR', 'The designated and backup designated routers'],
      ['`FF02::9`', 'RIPng routers', 'Routers running RIPng'],
      ['`FF02::A`', 'EIGRP for IPv6 routers', 'Routers running EIGRP for IPv6'],
      ['`FF02::1:2`', 'DHCPv6 servers and relay agents', 'DHCPv6 servers and relays on the link'],
      ['`FF02::1:FFxx:xxxx`', 'Solicited-node', 'Every node: one group per unicast or anycast address'],
    ],
    caption: 'FF02 = link-local scope: these packets never leave the link.',
    notes:
      "Multicast addresses begin with FF, and the fourth hex digit gives the **scope**: FF02 means link-local scope, so the packet never crosses a router, while FF05 is site-local and FF0E is global. The link-local groups in this table are the ones the exam expects you to know. FF02::1 reaches all nodes and is the closest thing IPv6 has to a broadcast; routers send their periodic router advertisements to it. FF02::2 reaches all routers, and hosts send router solicitations there. Routing protocols use their own groups so that non-participants can ignore their traffic. OSPFv3 uses FF02::5 for all OSPF routers and FF02::6 for the DR and BDR, the same last digits as OSPFv2's 224.0.0.5 and 224.0.0.6. RIPng uses FF02::9 and EIGRP for IPv6 uses FF02::A, echoing 224.0.0.9 and 224.0.0.10. FF02::1:2 reaches DHCPv6 servers and relay agents. The last row, the solicited-node group, is so important that it gets its own slide.",
  },
  {
    kind: 'bullets',
    title: 'Solicited-node multicast',
    bullets: [
      'Format: **FF02::1:FF** + the last 24 bits of the unicast address',
      'One group per unicast or anycast address, joined automatically',
      'Neighbor solicitations go here instead of to all nodes',
      'Example: 2001:DB8::AB12:3456 gives FF02::1:FF12:3456',
      'Ethernet MAC: 3333 + last 32 bits, here 3333.FF12.3456',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'FF02::1:FF (fixed)', size: 104, sub: 'FF02::1:FF00:0/104' },
        { label: 'Last 24 bits', size: 24, tone: 'accent', sub: 'copied from the unicast address' },
      ],
    },
    notes:
      "In IPv4, ARP broadcasts interrupt every host in the VLAN. IPv6 avoids that with **solicited-node multicast**. For every unicast or anycast address an interface has, it automatically joins a group made of the fixed prefix FF02::1:FF00:0/104 plus the **last 24 bits** of that address. To build it, take the last six hex digits of the address and write them after FF02::1:FF. For 2001:DB8::AB12:3456 the last six digits are 12:3456, so the group is FF02::1:FF12:3456. When another device needs the MAC address for 2001:DB8::AB12:3456, it sends its neighbor solicitation to that group. On Ethernet, IPv6 multicast maps to a MAC address of 33:33 followed by the last 32 bits of the group, here 3333.FF12.3456. A switch running MLD snooping delivers the frame only to interested ports, and every other NIC filters it in hardware. Only hosts whose addresses share those last 24 bits, usually just one, ever process the message.",
  },
  {
    kind: 'definitions',
    title: 'Anycast, loopback, unspecified, no broadcast',
    terms: [
      { term: 'Anycast', def: 'One unicast address configured on several devices; routing delivers each packet to the **nearest** one. No special range. IOS: `ipv6 address 2001:DB8:1::53/64 anycast`.' },
      { term: 'Subnet-router anycast', def: 'The subnet prefix with an all-zero interface ID (for example 2001:DB8:1:1::), reserved for the routers on that subnet.' },
      { term: 'Loopback `::1`', def: 'The host itself, like 127.0.0.1. Never assigned to a physical link.' },
      { term: 'Unspecified `::`', def: 'All zeros, meaning no address yet. Used as the source of DAD neighbor solicitations.' },
      { term: 'Broadcast', def: '**Does not exist** in IPv6. Its jobs moved to multicast groups such as FF02::1 and the solicited-node groups.' },
    ],
    notes:
      "**Anycast** means one address, many devices, and the nearest one answers. There is no anycast range: you take a normal unicast address and configure it on several devices, and the routing protocol carries each packet to whichever instance is closest by metric. Public DNS resolvers and content networks use this idea at global scale. On IOS you add the keyword `anycast` after the address. The standards also reserve the **subnet-router anycast** address, the subnet prefix followed by an all-zero interface ID, for the routers on each subnet. The **loopback** address ::1 is the IPv6 version of 127.0.0.1 and lets a host talk to itself. The **unspecified** address, ::, means no address at all; a host uses it as the source while it is still checking that its new address is unique, and it also appears as ::/0 in the default route. Finally, remember what is missing: there is **no broadcast** address in IPv6. Any answer that relies on an IPv6 broadcast is wrong.",
  },
  {
    kind: 'steps',
    title: 'Modified EUI-64 in four steps',
    steps: [
      { title: 'Split the MAC', text: 'Divide the 48-bit MAC into two 24-bit halves: OUI and NIC-specific.' },
      { title: 'Insert FFFE', text: 'Put `FFFE` between the halves to reach 64 bits.' },
      { title: 'Flip the 7th bit', text: 'Invert the U/L bit of the first byte: the bit worth 2 in the second hex digit.' },
      { title: 'Write the interface ID', text: 'Group into four hextets, drop leading zeros, append to the /64 prefix.' },
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'OUI half', size: 24, tone: 'accent', sub: '7th bit flipped' },
        { label: 'FFFE', size: 16, sub: 'inserted' },
        { label: 'NIC half', size: 24, sub: 'copied unchanged' },
      ],
      caption: 'The result is a 64-bit interface ID',
    },
    notes:
      "Modified EUI-64 turns a 48-bit MAC address into a 64-bit interface ID, so a device can build a unique address on any /64 without manual configuration. Four steps, always in this order. First, **split** the MAC in the middle: the first 24 bits are the manufacturer's OUI and the last 24 bits identify the NIC. Second, **insert FFFE** between the halves; 24 plus 16 plus 24 gives 64 bits. Third, **flip the seventh bit** of the first byte, counting from the left. That bit is the universal/local (U/L) bit: 0 in a MAC means a universally administered address, and IPv6 inverts it so that 1 means universal in the interface ID. Fourth, **write** the result as four hextets, drop leading zeros, and append it to the prefix. Most wrong answers on the exam come from step three: flipping the wrong bit, forgetting to flip, or setting the bit instead of inverting it. The bit worth 2 in the second hex digit is the one to change, and it can go from 0 to 1 or from 1 to 0.",
  },
  {
    kind: 'table',
    title: 'EUI-64 worked examples',
    columns: ['MAC address', 'Split + FFFE', 'Flip 7th bit', 'Interface ID'],
    rows: [
      ['`001A.2B3C.4D5E`', '001A:2BFF:FE3C:4D5E', '00 becomes **02**', '`21A:2BFF:FE3C:4D5E`'],
      ['`2C3F.0B5E.A101`', '2C3F:0BFF:FE5E:A101', '2C becomes **2E**', '`2E3F:BFF:FE5E:A101`'],
      ['`5254.00AB.CD01`', '5254:00FF:FEAB:CD01', '52 becomes **50**', '`5054:FF:FEAB:CD01`'],
      ['`0200.1234.5678`', '0200:12FF:FE34:5678', '02 becomes **00**', '`0:12FF:FE34:5678`'],
    ],
    caption: 'With prefix 2001:DB8:1:1::/64, the first MAC gives 2001:DB8:1:1:21A:2BFF:FE3C:4D5E.',
    notes:
      "Work through each row the same way. For 001A.2B3C.4D5E, split into 001A2B and 3C4D5E, insert FFFE to get 001A:2BFF:FE3C:4D5E, then look at the first byte, 00. In binary that is 0000 0000; the seventh bit from the left is the bit worth 2, so flipping it gives 0000 0010, which is 02. The interface ID is 021A:2BFF:FE3C:4D5E, written 21A:2BFF:FE3C:4D5E once the leading zero is dropped. The second row shows the hex shortcut: in 2C, the second digit C is 1100, and flipping its bit worth 2 gives 1110, which is E, so 2C becomes 2E. The third row flips the other way: in 52 the second digit 2 is 0010, and flipping gives 0000, so 52 becomes 50. The last row is a locally administered MAC whose U/L bit is already 1, so the flip clears it and the first hextet collapses to 0. Notice that only one digit ever changes, and it is always the second hex digit of the address.",
  },
  {
    kind: 'table',
    title: 'Flipping the 7th bit: the hex shortcut',
    columns: ['Second hex digit', 'Binary', 'After the flip', 'Binary'],
    rows: [
      ['0', '0000', '**2**', '0010'],
      ['1', '0001', '**3**', '0011'],
      ['4', '0100', '**6**', '0110'],
      ['5', '0101', '**7**', '0111'],
      ['8', '1000', '**A**', '1010'],
      ['9', '1001', '**B**', '1011'],
      ['C', '1100', '**E**', '1110'],
      ['D', '1101', '**F**', '1111'],
    ],
    caption: 'It works both ways: 2 and 0, 3 and 1, 6 and 4, 7 and 5, A and 8, B and 9, E and C, F and D swap.',
    notes:
      "Under exam pressure, converting whole bytes to binary wastes time. The seventh bit of the first byte is always the bit worth 2 in the **second hex digit** of the MAC address, so you only ever need to change that one digit. Flipping the bit worth 2 means adding 2 if that bit is 0 and subtracting 2 if it is 1. That gives the eight pairs in the table: 0 and 2, 1 and 3, 4 and 6, 5 and 7, 8 and A, 9 and B, C and E, D and F. Each pair swaps in both directions, so if the digit is 2 it becomes 0, and if it is E it becomes C. Memorize the pairs or rebuild them in seconds from the rule. Two common mistakes deserve a warning. The first is changing the first hex digit instead of the second, which flips a bit worth 32 instead of 2. The second is always setting the bit to 1; the operation is an inversion, so a MAC whose U/L bit is already 1 ends up with 0.",
  },
  {
    kind: 'cli',
    title: 'EUI-64 on a Cisco router',
    code: `R1(config)# ipv6 unicast-routing
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 address 2001:DB8:ACAD:1::/64 eui-64
R1(config-if)# no shutdown
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ipv6 address FE80::1 link-local
R1(config-if)# ipv6 address 2001:DB8:ACAD:12::1/64
R1(config-if)# end
R1# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::2E3F:BFF:FE5E:A101
    2001:DB8:ACAD:1:2E3F:BFF:FE5E:A101
GigabitEthernet0/0/1   [up/up]
    FE80::1
    2001:DB8:ACAD:12::1`,
    highlight: ['eui-64', '2E3F:BFF:FE5E:A101'],
    caption: 'G0/0/0 has MAC 2c3f.0b5e.a101: both its link-local and global addresses use the EUI-64 interface ID.',
    notes:
      "On a router, the `eui-64` keyword tells IOS to supply the interface ID itself: you give only the /64 prefix and the router appends the EUI-64 value derived from the interface MAC, here 2c3f.0b5e.a101. The link-local address uses the same interface ID by default, which is why both lines under G0/0/0 end in 2E3F:BFF:FE5E:A101. Check the math: split into 2C3F0B and 5EA101, insert FFFE, and flip the second hex digit C to E. G0/0/1 shows the alternative that many engineers prefer on routers: a short, memorable link-local address set with `ipv6 address FE80::1 link-local` and a manually chosen global address. Hosts on that link would then use FE80::1 as their default gateway. The `ipv6 unicast-routing` command is not needed to assign addresses, but without it the device does not route IPv6 or send router advertisements, so hosts could not use SLAAC. Verify with `show ipv6 interface brief`, which lists each interface's status and every IPv6 address on it.",
  },
  {
    kind: 'table',
    title: 'NDP messages (ICMPv6)',
    columns: ['Message', 'ICMPv6 type', 'Sent from and to', 'Purpose'],
    rows: [
      ['Router Solicitation (RS)', '133', 'Host to FF02::2 (all routers)', 'Ask routers to advertise now'],
      ['Router Advertisement (RA)', '134', 'Router to FF02::1 (all nodes)', 'Prefix, prefix length, default gateway, M/O flags'],
      ['Neighbor Solicitation (NS)', '135', 'Node to the target solicited-node group', 'Ask for a neighbor MAC; also DAD'],
      ['Neighbor Advertisement (NA)', '136', 'Node to the requester (unicast)', 'Reply with the MAC address'],
      ['Redirect', '137', 'Router to host', 'Point the host to a better first hop'],
    ],
    caption: 'NS and NA replace ARP; RS and RA let hosts find routers and prefixes.',
    notes:
      "The **Neighbor Discovery Protocol** is not a separate protocol on the wire; it is a set of five ICMPv6 message types that together replace ARP, router discovery and redirects. Two pairs matter most. **Router Solicitation** and **Router Advertisement** handle router discovery. A host that has just come up sends an RS to FF02::2 so that it does not have to wait; routers answer, and also send unsolicited RAs periodically, every 200 seconds by default on IOS, to FF02::1. The RA carries the on-link prefix and its length, the router lifetime and the M and O flags, and its source is the router's link-local address, which becomes the host's default gateway. **Neighbor Solicitation** and **Neighbor Advertisement** handle address resolution: an NS sent to the target's solicited-node group asks who owns an address, and the owner answers with a unicast NA containing its MAC. The results are cached in the neighbor table, shown by `show ipv6 neighbors` on IOS. Because all of this is ICMPv6, blocking ICMPv6 entirely breaks IPv6.",
  },
  {
    kind: 'diagram',
    title: 'Neighbor resolution: NS and NA replace ARP',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc1', label: 'PC1 2001:DB8:1:1::10', icon: 'pc' },
        { id: 'sw', label: 'SW1', icon: 'switch' },
        { id: 'pc2', label: 'PC2 2001:DB8:1:1::20', icon: 'pc' },
      ],
      steps: [
        { from: 'pc1', to: 'sw', label: 'NS: who has 2001:DB8:1:1::20?', sub: 'to FF02::1:FF00:20, MAC 3333.FF00.0020' },
        { from: 'sw', to: 'pc2', label: 'Delivered to the solicited-node group' },
        { from: 'pc2', to: 'pc1', label: 'NA (unicast): ::20 is at 0050.7966.0020', tone: 'accent' },
        { note: 'Both hosts cache the mapping (IOS: show ipv6 neighbors)' },
      ],
    },
    caption: 'No broadcast: the NS reaches only hosts that joined FF02::1:FF00:20.',
    notes:
      "Here is ARP's job done the IPv6 way. PC1 wants to send to 2001:DB8:1:1::20 on its own subnet but does not know the MAC address. Instead of broadcasting, it sends a **Neighbor Solicitation** to the target's solicited-node multicast group, FF02::1:FF00:20, built from the last 24 bits of the target address. At Layer 2 the frame goes to 3333.FF00.0020. Only hosts that joined that group process the message, and in practice that is PC2 alone. PC2 answers with a **Neighbor Advertisement** sent unicast to PC1, carrying its MAC address, and both hosts store the mapping in their neighbor caches. On a Cisco router, `show ipv6 neighbors` lists each IPv6 address with its age, link-layer address, state (for example REACH or STALE) and interface. When the destination is on another subnet, the host resolves its default gateway's link-local address the same way, exactly as an IPv4 host would ARP for its gateway. Nothing about the result is new; only the delivery method changed.",
  },
  {
    kind: 'diagram',
    title: 'SLAAC with duplicate address detection',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'host', label: 'PC1', icon: 'pc' },
        { id: 'link', label: 'Other nodes', icon: 'switch' },
        { id: 'rtr', label: 'R1 FE80::1', icon: 'router' },
      ],
      steps: [
        { from: 'host', to: 'rtr', label: 'RS to FF02::2 (all routers)' },
        { from: 'rtr', to: 'host', label: 'RA to FF02::1', sub: 'prefix 2001:DB8:1:1::/64, M=0, O=0' },
        { note: 'PC1 builds prefix + interface ID (EUI-64 or random)' },
        { from: 'host', to: 'link', label: 'DAD: NS for its new address', sub: 'source ::, to its solicited-node group', tone: 'accent' },
        { note: 'No NA comes back: the address is unique. Gateway = FE80::1' },
      ],
    },
    notes:
      "**SLAAC**, stateless address autoconfiguration, lets a host configure itself with no server at all. Before anything else, the host builds its link-local address and checks it with DAD. It then sends a Router Solicitation to FF02::2. The router replies with a Router Advertisement containing the /64 prefix for the link and flags telling hosts how to proceed. With the M and O flags both clear, the host generates its own interface ID, either with EUI-64 from its MAC or, as many operating systems such as Windows do by default, as a random value for privacy, and appends it to the prefix. Before using the new address, it runs **duplicate address detection**: it sends a Neighbor Solicitation for its own tentative address, using the unspecified address :: as the source because it cannot use the new address yet. If another node answers with a Neighbor Advertisement, the address is a duplicate and is not used; silence means it is unique. The **default gateway** is the source of the RA, the router's link-local address FE80::1.",
  },
  {
    kind: 'table',
    title: 'SLAAC vs stateless vs stateful DHCPv6',
    columns: ['Method', 'RA flags', 'Address from', 'DNS and other info', 'Default gateway'],
    rows: [
      ['SLAAC only', 'M=0, O=0', 'Host builds it from the RA prefix', 'RA (RDNSS option, if supported)', 'RA source address'],
      ['SLAAC + stateless DHCPv6', 'M=0, O=1', 'Host builds it from the RA prefix', 'DHCPv6 server', 'RA source address'],
      ['Stateful DHCPv6', 'M=1', 'DHCPv6 server, which tracks leases', 'DHCPv6 server', 'RA source address'],
    ],
    caption: '==DHCPv6 never supplies the default gateway==; it always comes from the RA.',
    notes:
      "Hosts learn how to get an address from two bits in the router advertisement. The **M flag**, managed address configuration, tells hosts to get their address from a DHCPv6 server. That is **stateful DHCPv6**, because the server keeps track of which address each client has, just like DHCPv4. The **O flag**, other configuration, tells hosts to use DHCPv6 only for additional information such as DNS servers and the domain name while still creating their own address with SLAAC. That is **stateless DHCPv6**, because the server keeps no per-client state. With both flags clear, hosts rely on SLAAC alone and can learn DNS servers from the RA's RDNSS option if their operating system supports it. On IOS, `ipv6 nd managed-config-flag` sets M and `ipv6 nd other-config-flag` sets O on the interface. One fact surprises many candidates: DHCPv6 has no default-gateway option at all. Whatever the method, hosts learn their default gateway from the router advertisement, so RAs must reach them even in a fully stateful DHCPv6 design.",
  },
  {
    kind: 'cli',
    title: 'Verifying groups and RA settings',
    code: `R1# show ipv6 interface GigabitEthernet0/0/0
GigabitEthernet0/0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::2E3F:BFF:FE5E:A101
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:DB8:ACAD:1:2E3F:BFF:FE5E:A101, subnet is 2001:DB8:ACAD:1::/64 [EUI]
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF5E:A101
  MTU is 1500 bytes
<output omitted>
  ND DAD is enabled, number of DAD attempts: 1
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  Hosts use stateless autoconfig for addresses.`,
    highlight: ['FF02::1:FF5E:A101', 'FF02::2', 'Hosts use stateless autoconfig for addresses.'],
    caption: 'One solicited-node group covers both addresses because they share the same last 24 bits.',
    notes:
      "`show ipv6 interface` is the best single command for this lesson, because it shows almost every concept at once. The link-local address is the EUI-64 result from the interface MAC, and the global address carries the `[EUI]` tag. Under **Joined group address(es)** you can see FF02::1, which every IPv6 node joins; FF02::2, which appears because `ipv6 unicast-routing` makes this device a router; and FF02::1:FF5E:A101, the solicited-node group built from the last 24 bits of the interface ID. There is only one solicited-node group because the link-local and global addresses share the same interface ID; an interface whose addresses end differently joins one group per distinct 24-bit ending. If OSPFv3 were running on the interface, FF02::5 would appear too, plus FF02::6 on the DR and BDR. The ND lines show that DAD is on, that router advertisements go out every 200 seconds with a lifetime of 1800 seconds, and that hosts are told to use stateless autoconfiguration because the M flag is clear.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: IPv6 addresses and NDP',
    body: 'Classify by the first hextet, flip the **7th** bit (worth 2 in the second hex digit), and remember that the RA, not DHCPv6, provides the default gateway.',
    bullets: [
      'FE80::/10 is link-local; FC00::/7 (FD in practice) is unique local',
      'IPv6 has no broadcast; FF02::1 reaches all nodes',
      'Solicited-node = FF02::1:FF + the **last 24 bits**',
      'EUI-64: FFFE goes in the middle; invert the bit, do not just set it',
      'RS goes to FF02::2, periodic RAs go to FF02::1; NS/NA replace ARP',
      'M=1 means stateful DHCPv6; O=1 alone means stateless DHCPv6',
      'DAD sends an NS from the unspecified address ::',
    ],
    notes:
      "Most IPv6 addressing questions hinge on a handful of facts. Confusing FE80 and FD is the classic range trap: FE80::/10 is link-local and never routed, while FC00::/7, used as FD00::/8, is unique local and routed privately. Any option mentioning an IPv6 broadcast is wrong. For solicited-node questions, take exactly the last six hex digits, not the last four or eight, and prepend FF02::1:FF. For EUI-64, split the MAC in the middle, insert FFFE there rather than at the end, and invert the bit worth 2 in the second hex digit; if the MAC's bit is already 1, it becomes 0. Know which NDP message goes where: hosts solicit routers at FF02::2, routers advertise to FF02::1, neighbor solicitations target solicited-node groups, and neighbor advertisements usually return unicast. For the flags, M set means addresses come from DHCPv6, and O set with M clear means only extra information does. Finally, DAD is identified by its unspecified source address ::.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'GUA 2000::/3, ULA FD00::/8, link-local FE80::/10, multicast FF00::/8',
      'Special: ::1 loopback, :: unspecified; anycast = shared unicast',
      'Groups: FF02::1, ::2, ::5, ::6, ::9, ::A, ::1:2, ::1:FFxx:xxxx',
      'EUI-64: split, insert FFFE, flip the 7th bit',
      'NDP: RS/RA (133/134), NS/NA (135/136) and DAD',
      'SLAAC (M=0, O=0), stateless DHCPv6 (O=1), stateful DHCPv6 (M=1)',
    ],
    notes:
      "You can now classify any IPv6 address from its first hextet: 2 or 3 for global unicast, FD for unique local, FE80 for link-local and FF for multicast, with ::1 as the loopback, :: as the unspecified address and anycast as ordinary unicast shared by several devices. You know the link-local multicast groups the exam uses and how to build a solicited-node group from the last 24 bits of any address. You can turn a MAC address into an EUI-64 interface ID in four steps and flip the seventh bit with the hex shortcut. You understand how NDP replaces ARP with neighbor solicitations and advertisements, how hosts find routers with solicitations and advertisements, and how duplicate address detection protects new addresses. Finally, you can read the M and O flags to decide between SLAAC, stateless DHCPv6 and stateful DHCPv6, remembering that the default gateway always comes from the router advertisement. These skills return in the IPv6 configuration and static routing lessons.",
  },
];
