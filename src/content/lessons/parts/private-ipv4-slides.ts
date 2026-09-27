import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Private IPv4 Addressing',
    subtitle: 'Why IPv4 ran out, the RFC 1918 ranges, and the other special-purpose blocks',
    notes:
      "Every enterprise LAN, every home network and most exam exhibits use addresses that never appear on the Internet. This deck explains why. You will see how IPv4's 32-bit address space ran out, who hands out public addresses, and which techniques stretched the supply: classless addressing, private addressing, address translation and, ultimately, IPv6. The core of the lesson is **RFC 1918**, the three private ranges you must be able to recite exactly and recognize instantly, including the middle range that trips people up. You will learn why private addresses need NAT or PAT to reach the Internet, and you will meet the other special-purpose blocks that appear on the exam: carrier-grade NAT shared space, link-local APIPA addresses, loopback, documentation ranges and benchmarking space. By the end you will be able to classify any IPv4 address as private, public or special in seconds. The material covers v1.1 exam topic 1.7 and the matching addressing content in domain 1 of v2.0.",
  },
  {
    kind: 'bullets',
    title: 'Why IPv4 ran out',
    bullets: [
      '32-bit addresses: 4,294,967,296 in total',
      'Large blocks reserved: multicast, class E, loopback, private',
      'IANA gives blocks to five RIRs, which allocate to ISPs',
      'IANA handed out its last free /8 blocks in February 2011',
      'Billions of phones, PCs and IoT devices all need addresses',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'iana', label: 'IANA', sub: 'global pool', shape: 'pill', tone: 'accent' },
        { id: 'rir', label: 'RIRs', sub: 'five regions' },
        { id: 'isp', label: 'ISPs / LIRs', sub: 'allocations' },
        { id: 'org', label: 'Organizations', sub: 'assignments', shape: 'round' },
      ],
    },
    notes:
      "IPv4 addresses are 32 bits long, which allows 4,294,967,296 addresses in total. That seemed limitless in the early 1980s, but a sizeable part of the space is not available for ordinary hosts: 224.0.0.0/4 is multicast, 240.0.0.0/4 is reserved, 127.0.0.0/8 is loopback, and other blocks are set aside for private and special use. Early allocations were also generous, with entire class A networks of more than 16 million addresses handed to single organizations. Addresses are distributed hierarchically. **IANA**, the Internet Assigned Numbers Authority, manages the global pool and allocates large blocks to five **Regional Internet Registries**. The RIRs allocate to ISPs and local Internet registries, which in turn assign smaller blocks to their customers. In February 2011 IANA allocated its last free /8 blocks, one to each RIR, and the RIRs have since exhausted or tightly rationed their own free pools. New public IPv4 space today mostly comes from transfers between organizations, often for a price.",
  },
  {
    kind: 'table',
    title: 'The five Regional Internet Registries',
    columns: ['RIR', 'Region served'],
    rows: [
      ['**ARIN**', 'Canada, the United States and parts of the Caribbean'],
      ['**LACNIC**', 'Latin America and parts of the Caribbean'],
      ['**RIPE NCC**', 'Europe, the Middle East and parts of Central Asia'],
      ['**APNIC**', 'Asia and the Pacific'],
      ['**AFRINIC**', 'Africa'],
    ],
    caption: 'IANA allocates to RIRs, RIRs to ISPs, ISPs to customers. Private addresses sit outside this chain.',
    notes:
      "There are exactly five Regional Internet Registries, each responsible for one part of the world. ARIN serves the United States, Canada and parts of the Caribbean; LACNIC serves Latin America and the rest of the Caribbean; RIPE NCC serves Europe, the Middle East and parts of Central Asia; APNIC serves the Asia-Pacific region; and AFRINIC serves Africa. RIRs manage IPv4 and IPv6 address space as well as autonomous system numbers, and they maintain public WHOIS databases showing which organization holds each block, which is handy when you investigate where an unknown public address comes from. For the CCNA you do not need registry policies or dates; what matters is the chain of responsibility: IANA allocates to RIRs, RIRs allocate to ISPs and large organizations, and ISPs assign addresses to their customers. Private addresses sit outside this system entirely. Nobody allocates them, nobody owns them, and any organization may use them freely, which is the key idea behind the rest of this lesson.",
  },
  {
    kind: 'steps',
    title: 'Four answers to address exhaustion',
    steps: [
      { title: 'CIDR (1993)', text: 'Prefixes of any length replace wasteful class A, B and C blocks.' },
      { title: 'Private addressing (RFC 1918, 1996)', text: 'Reusable ranges for internal networks; no registration needed.' },
      { title: 'NAT and PAT', text: 'Many private hosts share one or a few public addresses at the edge.' },
      { title: 'IPv6', text: 'A 128-bit address space: the long-term fix.' },
    ],
    notes:
      "The industry saw exhaustion coming in the early 1990s and responded in layers. **CIDR**, classless inter-domain routing, dropped the rigid class A, B and C boundaries, so an organization needing 1,000 addresses could receive a /22 instead of a whole class B of 65,536, and ISPs could summarize their customers' routes. **Private addressing**, defined in RFC 1918 in 1996, set aside three ranges that any organization can use internally without asking anyone, because those addresses are never routed on the Internet. **NAT**, and especially its port-based form **PAT**, made private addressing practical: a router at the edge translates many private inside addresses to one or a few public addresses, so an entire office can share a single public IP. Together these measures bought decades of extra life for IPv4, but they are workarounds. The real solution is **IPv6**, whose 128-bit space removes scarcity entirely. The CCNA expects you to understand how these pieces fit together and to know the private ranges exactly.",
  },
  {
    kind: 'table',
    title: 'RFC 1918: the three private ranges',
    columns: ['Prefix', 'Address range', 'Addresses', 'Classful equivalent'],
    rows: [
      ['`10.0.0.0/8`', '10.0.0.0 to 10.255.255.255', '16,777,216', '1 class A network'],
      ['`172.16.0.0/12`', '172.16.0.0 to 172.31.255.255', '1,048,576', '16 class B networks'],
      ['`192.168.0.0/16`', '192.168.0.0 to 192.168.255.255', '65,536', '256 class C networks'],
    ],
    caption: '==Memorize these three prefixes exactly==: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
    notes:
      "These three blocks are the heart of this lesson, and the exam expects them exactly. **10.0.0.0/8** covers every address whose first octet is 10, more than 16 million addresses, so large enterprises usually build their whole internal plan inside it. **172.16.0.0/12** is the one people get wrong: a /12 fixes the first 12 bits, so the second octet runs from 16 through 31, giving 172.16.0.0 to 172.31.255.255, sixteen classful class B networks and just over a million addresses. **192.168.0.0/16** covers every address beginning with 192.168, 65,536 addresses or 256 class C networks, and it is the default in most home routers. Anything outside these ranges is not RFC 1918 private space, even if it looks similar: 172.32.1.1, 172.15.0.1, 192.169.1.1 and 11.0.0.1 are all public addresses. Notice also that you can subnet private space however you like: 10.1.2.0/24 or 172.20.0.0/22 are just as private as the blocks they come from.",
  },
  {
    kind: 'bullets',
    title: 'Why 172.16.0.0/12 ends at 172.31',
    bullets: [
      'A /12 fixes all 8 bits of the first octet and 4 of the second',
      'Second octet 16 = 0001 0000: the fixed bits are 0001',
      'The last 4 bits vary from 0000 to 1111: values 16 to 31',
      '172.32 = 0010 0000 has different fixed bits, so it is public',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'First address', value: '172.16.0.0', prefix: 12 },
        { label: 'Last address', value: '172.31.255.255', prefix: 12, tone: 'good' },
        { label: '172.32.0.1', value: '172.32.0.1', prefix: 12, tone: 'bad' },
      ],
    },
    notes:
      "If you understand why the middle range stops at 31, you will never misremember it. A /12 prefix means the first 12 bits are fixed: all 8 bits of the first octet, 172, and the first 4 bits of the second octet. The second octet of the starting address is 16, which is 0001 0000 in binary, so the fixed part is 0001. The remaining 4 bits of that octet can take any value from 0000 to 1111, producing second octets from 0001 0000, decimal 16, to 0001 1111, decimal 31. The block size in the second octet is therefore 16, and the range is 172.16.0.0 through 172.31.255.255. The next value, 32, is 0010 0000 in binary; its first four bits are 0010 rather than 0001, so 172.32.0.1 falls outside the block and is a public address. The same method works for any prefix: find the interesting octet, compute the block size, and list the range from one block boundary to the next.",
  },
  {
    kind: 'diagram',
    title: 'Private inside, public outside',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pca', icon: 'pc', label: 'Host A', sub: '10.1.1.10', x: 0.9, y: 1.1 },
        { id: 'ra', icon: 'router', label: 'Edge A', sub: 'public 203.0.113.2', x: 3.2, y: 1.1 },
        { id: 'pcb', icon: 'pc', label: 'Host B', sub: '10.1.1.10', x: 0.9, y: 3.9 },
        { id: 'rb', icon: 'router', label: 'Edge B', sub: 'public 198.51.100.7', x: 3.2, y: 3.9 },
        { id: 'net', icon: 'internet', label: 'Internet', sub: 'no RFC 1918 routes', x: 6.2, y: 2.5, tone: 'accent' },
        { id: 'srv', icon: 'server', label: 'Web server', sub: '192.0.2.80', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'pca', to: 'ra', label: 'private' },
        { from: 'ra', to: 'net', label: 'NAT/PAT', tone: 'accent' },
        { from: 'pcb', to: 'rb', label: 'private' },
        { from: 'rb', to: 'net', label: 'NAT/PAT', tone: 'accent' },
        { from: 'net', to: 'srv' },
      ],
    },
    caption: 'Both companies use 10.1.1.10 internally without conflict; the Internet only ever sees their public addresses.',
    notes:
      "This picture shows why private addressing works. Company A and Company B have both numbered their LANs from 10.1.1.0/24, and both even have a host at 10.1.1.10. Inside each company that is perfectly fine, because a private address only has to be unique within its own network. The problem appears at the boundary: Internet routers carry no routes for RFC 1918 space, and ISPs filter packets that use it, so a packet sourced from 10.1.1.10 could never receive a reply. The edge router in each company therefore performs **NAT**, usually **PAT**: it rewrites the private source address to its own public address, 203.0.113.2 for Company A, and keeps a translation table so that replies can be mapped back to the right inside host. The web server only ever sees public addresses. The public addresses in this example come from the documentation ranges, which exist precisely so that examples like this never collide with real networks.",
  },
  {
    kind: 'cli',
    title: 'PAT in action (preview)',
    code: `R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip nat inside
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# ip nat outside
R1(config-if)# exit
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/0/1 overload
R1(config)# end
R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
tcp  203.0.113.2:51712     192.168.1.10:51712    198.51.100.80:443     198.51.100.80:443
tcp  203.0.113.2:49233     192.168.1.11:49233    198.51.100.80:443     198.51.100.80:443`,
    highlight: ['overload', 'Inside global', 'Inside local', '203.0.113.2'],
    caption: 'Inside local = the private address of the host; inside global = the public address it becomes.',
    notes:
      "NAT configuration has its own lesson, but a quick preview shows how private addressing reaches the Internet. The access list identifies which inside addresses may be translated, here the private 192.168.1.0/24 LAN. Interfaces are marked `ip nat inside` or `ip nat outside`. The key command, `ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`, tells R1 to translate matching sources to the public address of its outside interface, and the `overload` keyword enables **PAT**, so many hosts can share that single address, told apart by port numbers. In the translation table, the **inside local** column shows the private address of each host, and the **inside global** column shows the public address and port it becomes on the Internet. Two private hosts, 192.168.1.10 and 192.168.1.11, both appear to the outside world as 203.0.113.2, each with its own port. Without this translation their packets would leave with private source addresses, and replies from the Internet could never find their way back.",
  },
  {
    kind: 'table',
    title: 'Other special-purpose IPv4 ranges',
    columns: ['Block', 'Purpose', 'Where you see it'],
    rows: [
      ['`0.0.0.0/8`', 'This network', '0.0.0.0 as a DHCP client source; 0.0.0.0/0 as the default route'],
      ['`127.0.0.0/8`', 'Loopback', '127.0.0.1 tests the local TCP/IP stack'],
      ['`169.254.0.0/16`', 'Link-local (APIPA)', 'A host that could not reach a DHCP server'],
      ['`100.64.0.0/10`', 'Shared address space', 'Between customer routers and ISP carrier-grade NAT'],
      ['`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`', 'Documentation (TEST-NET-1, 2, 3)', 'Books, examples and exam questions'],
      ['`198.18.0.0/15`', 'Benchmarking', 'Network device test labs'],
      ['`224.0.0.0/4`', 'Multicast (class D)', 'OSPF 224.0.0.5, EIGRP 224.0.0.10'],
      ['`240.0.0.0/4`', 'Reserved (class E)', 'Not usable for hosts'],
      ['`255.255.255.255/32`', 'Limited broadcast', 'Destination of a DHCP Discover'],
    ],
    caption: 'None of these is RFC 1918, and none is an ordinary public host address.',
    notes:
      "Beyond RFC 1918, several other blocks are reserved for special jobs, and none of them are ordinary public host addresses. **127.0.0.0/8** is loopback: traffic to 127.0.0.1 never leaves the host, so a successful ping proves the local TCP/IP stack works. **169.254.0.0/16** is IPv4 link-local, used by Windows APIPA when a host gets no answer from a DHCP server; seeing a 169.254 address almost always means a DHCP problem. **100.64.0.0/10**, the shared address space, is reserved for ISPs running carrier-grade NAT, covered on the next slide. The three **documentation** ranges, 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24, exist so that books and exam questions can show realistic public-looking addresses without pointing at anyone's real network. **198.18.0.0/15** is reserved for benchmarking. **0.0.0.0/8** means this network: a DHCP client with no address yet uses 0.0.0.0 as its source. Finally, 224.0.0.0/4 is multicast, 240.0.0.0/4 is reserved, and 255.255.255.255 is the limited broadcast address.",
  },
  {
    kind: 'bullets',
    title: 'Carrier-grade NAT and 100.64.0.0/10',
    bullets: [
      'Range **100.64.0.0/10**: 100.64.0.0 to 100.127.255.255',
      'RFC 6598 shared address space, reserved for ISPs',
      'Numbers the segment between customer routers and the CGN',
      'Not RFC 1918 private, and not routable on the Internet',
      'Customer traffic is translated twice (NAT444)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'Home PC', sub: '192.168.1.20', x: 0.9, y: 2 },
        { id: 'cpe', icon: 'router', label: 'Home router', sub: 'NAT 1', x: 3.3, y: 2 },
        { id: 'cgn', icon: 'router', label: 'ISP CGN', sub: 'NAT 2', x: 6.1, y: 2, tone: 'accent' },
        { id: 'net', icon: 'internet', label: 'Internet', x: 8.9, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'cpe', label: '192.168.1.0/24' },
        { from: 'cpe', to: 'cgn', label: '100.64.0.0/10', tone: 'accent' },
        { from: 'cgn', to: 'net', label: 'public IPv4' },
      ],
    },
    notes:
      "As ISPs ran out of public addresses, they could no longer give every home or mobile customer a public IP. Their answer is **carrier-grade NAT (CGN)**: the ISP itself translates many customers onto a small pool of public addresses. That creates a numbering problem. If the ISP numbered the link to each customer from RFC 1918 space, it could collide with the customer's own LAN, for example 192.168.1.0/24 on both sides of the home router. RFC 6598 therefore reserved a separate block, **100.64.0.0/10**, called shared address space, for the segment between customer equipment and the CGN. It runs from 100.64.0.0 to 100.127.255.255, because a /10 gives a block size of 64 in the second octet. Traffic from a home PC is translated twice, once by the home router and once by the CGN, a design sometimes called NAT444. For the exam, remember that 100.64.0.0/10 is **not** one of the RFC 1918 ranges, yet it is not a public, Internet-routable address either.",
  },
  {
    kind: 'cli',
    title: 'Spotting APIPA and loopback on a host',
    code: `C:\\> ipconfig

Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::4c1b:7e2a:90d5:e3f8%12
   Autoconfiguration IPv4 Address. . : 169.254.37.112
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :

C:\\> ping 127.0.0.1

Pinging 127.0.0.1 with 32 bytes of data:
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128`,
    highlight: ['Autoconfiguration IPv4 Address', '169.254.37.112', 'Reply from 127.0.0.1'],
    caption: 'A 169.254 address with no gateway means DHCP failed; a reply from 127.0.0.1 only proves the local stack works.',
    notes:
      "Two special ranges show up constantly in troubleshooting. When a Windows host is set to obtain an address automatically but no DHCP server answers, it assigns itself an **APIPA** address from 169.254.0.0/16 with a 255.255.0.0 mask and no default gateway; `ipconfig` even labels it an Autoconfiguration IPv4 Address. The host can then talk only to other link-local hosts on the same segment, so users report that nothing works. On the exam, a 169.254 address in an exhibit is a strong hint that DHCP failed: check the DHCP server, the relay configured with `ip helper-address`, or the VLAN of the switch port. The second range is **loopback**. A ping to 127.0.0.1, or to any address in 127.0.0.0/8, never leaves the host; it simply tests that the TCP/IP software is working. A successful loopback ping combined with a failed ping to the default gateway points the investigation outward, toward the NIC, cable, switch port or addressing.",
  },
  {
    kind: 'diagram',
    title: 'Public or private? A decision method',
    diagram: {
      type: 'flow',
      width: 12,
      height: 5,
      nodes: [
        { id: 'd1', label: '10.x.x.x?', shape: 'diamond', x: 1.2, y: 1.4 },
        { id: 'd2', label: '172.16-31.x.x?', shape: 'diamond', x: 3.8, y: 1.4 },
        { id: 'd3', label: '192.168.x.x?', shape: 'diamond', x: 6.4, y: 1.4 },
        { id: 'd4', label: 'Special block?', shape: 'diamond', x: 9, y: 1.4 },
        { id: 'p1', label: 'Private', tone: 'good', x: 1.2, y: 3.8 },
        { id: 'p2', label: 'Private', tone: 'good', x: 3.8, y: 3.8 },
        { id: 'p3', label: 'Private', tone: 'good', x: 6.4, y: 3.8 },
        { id: 's4', label: 'Special use', sub: 'not a public host address', tone: 'warn', x: 9, y: 3.8 },
        { id: 'pub', label: 'Public', shape: 'pill', tone: 'accent', x: 11.2, y: 1.4 },
      ],
      edges: [
        { from: 'd1', to: 'p1', label: 'yes' },
        { from: 'd1', to: 'd2', label: 'no' },
        { from: 'd2', to: 'p2', label: 'yes' },
        { from: 'd2', to: 'd3', label: 'no' },
        { from: 'd3', to: 'p3', label: 'yes' },
        { from: 'd3', to: 'd4', label: 'no' },
        { from: 'd4', to: 's4', label: 'yes' },
        { from: 'd4', to: 'pub', label: 'no' },
      ],
    },
    caption: 'Special blocks: 100.64/10, 169.254/16, 127/8, 0/8, documentation /24s, 198.18/15, 224 and above.',
    notes:
      "Classifying an address takes seconds if you check it in a fixed order. First look at the first octet: if it is 10, the address is private, whatever follows. If the first octet is 172, look at the second octet: 16 through 31 means private, and anything else, including 172.15 and 172.32, is public. If the first two octets are 192.168, the address is private; 192.167 and 192.169 are public. If none of these match, ask whether the address falls into a special-purpose block: 100.64 through 100.127 is shared carrier-grade NAT space, 169.254 is link-local, 127 is loopback, 0.0.0.0/8 means this network, addresses from 224 upward are multicast or reserved, and the three documentation /24s and 198.18.0.0/15 are reserved for examples and testing. Only an address that passes all of these tests is an ordinary public address. The most common exam mistakes are calling 172.32.x.x private because it looks close, and calling 100.64.x.x RFC 1918 because it is not public.",
  },
  {
    kind: 'table',
    title: 'Practice: public or private?',
    columns: ['Address', 'Verdict', 'Reason'],
    rows: [
      ['10.255.0.1', '**Private**', 'First octet 10: inside 10.0.0.0/8'],
      ['172.31.200.5', '**Private**', 'Second octet 31: inside 172.16.0.0/12'],
      ['172.32.0.9', 'Public', 'Second octet 32 is past 31'],
      ['192.168.100.1', '**Private**', 'Inside 192.168.0.0/16'],
      ['192.169.1.1', 'Public', 'Second octet 169, not 168'],
      ['100.100.1.1', 'Shared (CGN)', 'Inside 100.64.0.0/10; not RFC 1918'],
      ['169.254.10.20', 'Link-local', 'APIPA: DHCP failed'],
      ['8.8.8.8', 'Public', 'No private or special range matches'],
    ],
    notes:
      "Run through the practice list with the decision method. 10.255.0.1 starts with 10, so it is private no matter what follows. 172.31.200.5 has a second octet of 31, the last value inside 172.16.0.0/12, so it is private, while 172.32.0.9 is one step past the block and therefore public. 192.168.100.1 is private because it starts with 192.168, but 192.169.1.1 is public: only the exact pair 192.168 qualifies. 100.100.1.1 falls within 100.64.0.0/10, whose second octet runs from 64 to 127; it is shared address space for carrier-grade NAT, neither RFC 1918 private nor public. 169.254.10.20 is link-local, the APIPA range a host uses when DHCP fails. Finally, 8.8.8.8 matches no private or special range, so it is an ordinary public address. Notice how often the wrong answers differ from a private range by a single digit; exam writers rely on exactly that, so slow down on every 172 and 192 address.",
  },
  {
    kind: 'compare',
    title: 'Private vs public IPv4 addresses',
    left: {
      heading: 'Private (RFC 1918)',
      tone: 'good',
      bullets: [
        'Free to use; no registration',
        'Reused by every organization',
        'Not routed on the Internet',
        'Needs NAT/PAT to reach the Internet',
      ],
    },
    right: {
      heading: 'Public',
      tone: 'accent',
      bullets: [
        'Allocated through IANA, RIRs and ISPs',
        'Globally unique',
        'Routed on the Internet',
        'Scarce and often purchased today',
      ],
    },
    notes:
      "Put the two kinds of addresses side by side and the trade-off is clear. **Private** addresses cost nothing, require no registration and can be reused by every organization in the world, which is exactly why they are the default choice for internal networks. Their limitation is reachability: because countless networks use the same numbers, Internet routers cannot route them, so private hosts need NAT or PAT at the edge to talk to the Internet, and inbound connections need explicit translations. **Public** addresses are globally unique and routable on the Internet, which makes them necessary for anything the Internet must reach, such as the outside interface of an edge router, public web servers and VPN gateways. They are allocated through the IANA and RIR hierarchy, they are now scarce, and organizations increasingly pay for them. A typical enterprise therefore uses private addresses everywhere inside and only a handful of public addresses at its Internet edge.",
  },
  {
    kind: 'bullets',
    title: 'Design tips and pitfalls',
    bullets: [
      'Large enterprise: build the plan inside **10.0.0.0/8**',
      'Avoid 192.168.0.0/24 and 192.168.1.0/24 for corporate subnets',
      'Mergers and site-to-site VPNs can collide on overlapping ranges',
      'Never use documentation or 100.64.0.0/10 space for your LAN',
      'Filter RFC 1918 sources arriving from the Internet',
    ],
    notes:
      "Private space is free, but choosing it carelessly causes long-term pain. Large organizations usually plan inside 10.0.0.0/8, because its 16 million addresses allow a clean hierarchy such as one /16 per site and one /24 per VLAN. Home routers overwhelmingly use 192.168.0.0/24 and 192.168.1.0/24, so a corporate subnet with the same numbers breaks remote-access VPN users whose home LAN overlaps it; pick something less common. The same collision happens on a larger scale when two companies merge or connect by site-to-site VPN and both used, say, 10.1.0.0/16: one side must renumber, or the overlapping addresses must be translated with NAT. Do not borrow the documentation ranges or the 100.64.0.0/10 shared space for internal use; they have defined purposes, and the shared block may already be in use by your ISP. Finally, packets arriving from the Internet with an RFC 1918 source address are spoofed or misrouted, so edge ACLs commonly drop them, a practice known as bogon filtering.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: private IPv4 addressing',
    body: 'RFC 1918 is exactly **10.0.0.0/8**, **172.16.0.0/12** (172.16 to 172.31) and **192.168.0.0/16**. Nothing else is RFC 1918 private.',
    bullets: [
      '172.32.x.x and 172.15.x.x are public',
      '192.169.x.x and 192.167.x.x are public',
      '100.64.0.0/10 is shared CGN space, not RFC 1918',
      '169.254.x.x means APIPA: DHCP failed',
      'Documentation: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24',
      'Private hosts need NAT/PAT to reach the Internet',
      '127.0.0.1 is loopback and never leaves the host',
    ],
    notes:
      "The private-address questions on the exam are rarely difficult, but they are precise. You must know the three prefixes exactly, including the /12 on the middle block and what it implies: 172.16 through 172.31 and nothing beyond. Expect distractors that differ by one digit or transpose digits, such as 172.32, 172.15, 192.169 or 192.186. Expect questions that mix in other special ranges and ask which addresses are RFC 1918: 100.64.0.0/10 is reserved for carrier-grade NAT and 169.254.0.0/16 for link-local addressing, but neither is RFC 1918. Recognize the documentation ranges, which appear in exam exhibits as stand-ins for public addresses. Know the practical consequences too: private addresses are not routed on the Internet, so a private host needs NAT or PAT to browse; a 169.254 address points to a DHCP failure; and a reply from 127.0.0.1 proves only that the local stack works, not that the network does.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'IPv4 has 2^32 addresses; IANA ran out of free /8s in 2011',
      'IANA allocates to five RIRs, which allocate to ISPs',
      'RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16',
      'Private addresses are not Internet-routable: use NAT/PAT',
      'Special: 100.64/10, 169.254/16, 127/8, documentation /24s',
      'Classify: private ranges first, then special blocks, else public',
    ],
    notes:
      "IPv4's 32-bit space ran out because the Internet grew far beyond what its designers imagined. IANA allocated its last free blocks to the five RIRs in 2011, and CIDR, private addressing, NAT and eventually IPv6 are the industry's responses. RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 for private use; any organization can use them internally, but they are never routed on the Internet, so private hosts reach the Internet through NAT or PAT. Other special-purpose blocks have their own jobs: 100.64.0.0/10 for carrier-grade NAT, 169.254.0.0/16 for link-local APIPA addresses, 127.0.0.0/8 for loopback, three /24s for documentation, 198.18.0.0/15 for benchmarking, and the multicast and reserved space from 224 upward. To classify any address, test it against the private ranges first and then against the special blocks; only what remains is public. The NAT lesson builds directly on everything covered here.",
  },
];
