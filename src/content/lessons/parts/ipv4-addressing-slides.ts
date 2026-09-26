import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'IPv4 Addressing',
    subtitle: 'The header, binary math, classes, special addresses, gateways and ARP',
    notes:
      'IPv4 addressing is the foundation almost every other CCNA topic stands on: subnetting, routing, ACLs, NAT and DHCP all assume you can read an address instantly. In this deck you will dissect the **IPv4 header**, convert between **binary and decimal** without hesitation, recognize the historic **address classes** and their default masks, and learn the **special addresses** (network, broadcast, 0.0.0.0, loopback, APIPA) that exam writers love to hide among the answer options. You will then configure and verify addresses on a Cisco router and follow a host as it uses its **default gateway** and **ARP** to send its first packet off the local subnet. This material maps to exam topic 1.6 on v1.1 and to Domain 1 (Network Infrastructure and Connectivity) on v2.0, so it is tested on both exam versions.',
  },
  {
    kind: 'bullets',
    title: 'Anatomy of an IPv4 address',
    bullets: [
      '**32 bits**, written as four 8-bit **octets** in dotted decimal',
      'Each octet ranges from **0 to 255**',
      { text: 'Split into two parts by the **mask** (prefix length)', sub: ['**Network** portion: which subnet', '**Host** portion: which interface on that subnet'] },
      'Addresses belong to **interfaces**, not to whole devices',
      '2^32 = about **4.3 billion** possible addresses',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: '192.168.10.130', value: '192.168.10.130', prefix: 24 },
        { label: 'Mask /24', value: '255.255.255.0', prefix: 24 },
      ],
    },
    notes:
      'An IPv4 address is simply a **32-bit binary number**. Humans write it as four decimal octets separated by dots, but routers and hosts work only with the bits. Every address is split into two parts: the **network portion**, which says which subnet the interface lives on, and the **host portion**, which identifies one interface inside that subnet. The subnet mask, or its shorthand the prefix length such as /24, marks where the split happens: mask bits set to 1 cover the network portion and bits set to 0 cover the host portion. In the diagram, 192.168.10.130/24 belongs to network 192.168.10.0 and is host 130 on it. Remember that addresses are assigned to **interfaces**: a router with four routed interfaces has four IPv4 addresses, and a laptop with Wi-Fi and Ethernet both active has two. The whole address space is 2^32 = 4,294,967,296 addresses, a number that looked endless in 1981 and is exhausted today, which is why private addressing, NAT and IPv6 exist.',
  },
  {
    kind: 'diagram',
    title: 'The IPv4 header',
    diagram: {
      type: 'header',
      layout: 'rows',
      bitsPerRow: 32,
      fields: [
        { label: 'Version', size: 4 },
        { label: 'IHL', size: 4 },
        { label: 'DSCP', size: 6 },
        { label: 'ECN', size: 2 },
        { label: 'Total Length', size: 16 },
        { label: 'Identification', size: 16 },
        { label: 'Flags', size: 3 },
        { label: 'Fragment Offset', size: 13 },
        { label: 'TTL', size: 8 },
        { label: 'Protocol', size: 8 },
        { label: 'Header Checksum', size: 16 },
        { label: 'Source Address', size: 32, tone: 'accent' },
        { label: 'Destination Address', size: 32, tone: 'accent' },
      ],
    },
    caption: 'Five 32-bit rows = 20 bytes minimum (Options can extend it to 60). Routers change only TTL and the checksum.',
    notes:
      'The IPv4 header is drawn in 32-bit rows, the way RFC 791 presents it. The first row holds **Version** (always 4), **IHL** (Internet Header Length), the 6-bit **DSCP** QoS marking, the 2-bit **ECN** field and the 16-bit **Total Length**. The second row supports fragmentation: **Identification**, three **Flags** bits and the 13-bit **Fragment Offset**. The third row carries **TTL**, **Protocol** (what is inside the payload) and the **Header Checksum**. Rows four and five are the 32-bit **source** and **destination** addresses. Without options the header is exactly five rows, or **20 bytes**; the rarely used Options field can push it to a maximum of 60 bytes, which is why the IHL field exists at all. For the exam, be ready to name the fields and their sizes, and above all to say which ones a router changes when it forwards a packet: TTL and the checksum always, the addresses only when NAT is involved.',
  },
  {
    kind: 'table',
    title: 'Header fields and what they do',
    columns: ['Field', 'Bits', 'Purpose'],
    rows: [
      ['Version', '4', 'Always `4` for IPv4'],
      ['IHL', '4', 'Header length in 32-bit words: 5 (20 bytes) to 15 (60 bytes)'],
      ['DSCP / ECN', '6 / 2', 'QoS marking (voice = EF, 46) / congestion notification'],
      ['Total Length', '16', 'Header + data in bytes; maximum 65,535'],
      ['Identification / Flags / Fragment Offset', '16 / 3 / 13', 'Fragmentation: shared ID, DF and MF bits, offset in 8-byte units'],
      ['TTL', '8', 'Minus 1 at every router; at 0 → drop + ICMP Time Exceeded'],
      ['Protocol', '8', 'Payload type: 1 ICMP, 6 TCP, 17 UDP, 88 EIGRP, 89 OSPF'],
      ['Header Checksum', '16', 'Checks the header only; recomputed at every hop'],
      ['Source / Destination', '32 / 32', 'Original sender and final receiver'],
    ],
    notes:
      'Treat this table as a checklist. **IHL** counts 32-bit words, so the minimum value 5 means 20 bytes and the maximum 15 means 60 bytes. **DSCP** replaced the 3-bit IP Precedence of the old Type of Service byte; voice is normally marked EF (DSCP 46), which returns in the QoS lesson. **Total Length** covers header plus data, so no IPv4 packet can exceed 65,535 bytes. Fragmentation uses three fields together: every fragment of one original packet carries the same **Identification**, the **MF** (More Fragments) flag is set on all but the last fragment, **DF** (Don\'t Fragment) forbids fragmentation, and **Fragment Offset** records where each piece belongs in 8-byte units. **Protocol** tells the receiver which process gets the payload: 1 ICMP, 6 TCP, 17 UDP, 88 EIGRP, 89 OSPF. The **checksum** protects only the header (TCP and UDP carry their own), and because TTL changes at every hop, each router must recompute it.',
  },
  {
    kind: 'diagram',
    title: 'TTL in action',
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'Windows · sends TTL 128', x: 1, y: 1.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.7, y: 1.5 },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.3, y: 1.5 },
        { id: 'srv', icon: 'server', label: 'Server1', sub: 'receives TTL 126', x: 9, y: 1.5, tone: 'accent' },
      ],
      links: [
        { from: 'pc', to: 'r1', label: 'TTL 128', arrow: 'forward' },
        { from: 'r1', to: 'r2', label: 'TTL 127', arrow: 'forward' },
        { from: 'r2', to: 'srv', label: 'TTL 126', arrow: 'forward' },
      ],
    },
    bullets: [
      'Starting TTL: Windows **128**, Linux/macOS **64**, Cisco IOS **255**',
      'TTL hits 0 → packet dropped, **ICMP Time Exceeded** sent to the source',
      '`traceroute` / `tracert` send probes with TTL 1, 2, 3… to map the path',
    ],
    notes:
      '**Time to Live** is an 8-bit hop counter, not a timer. The sender chooses a starting value (Windows uses **128**, Linux and macOS use **64**, and Cisco IOS uses **255** for packets it originates) and every router that forwards the packet subtracts one. If a router decrements TTL to zero, it discards the packet and returns an **ICMP Time Exceeded** message to the source. This is what stops a packet from circling forever during a routing loop. `traceroute` (Linux, macOS, IOS) and `tracert` (Windows) turn the mechanism into a tool: they send probes with TTL 1, then 2, then 3, and each router that expires a probe identifies itself in its Time Exceeded reply. A handy side effect: the TTL in a ping reply hints at the remote OS and distance. A reply showing TTL=126 was probably sent by a Windows host two routers away (128 − 2). Because TTL changes at every hop, the header checksum must be recalculated at every hop too.',
  },
  {
    kind: 'table',
    title: 'Binary: the eight bit values',
    columns: ['Octet', '128', '64', '32', '16', '8', '4', '2', '1'],
    rows: [
      ['**192**', '1', '1', '0', '0', '0', '0', '0', '0'],
      ['**168**', '1', '0', '1', '0', '1', '0', '0', '0'],
      ['**10**', '0', '0', '0', '0', '1', '0', '1', '0'],
      ['**130**', '1', '0', '0', '0', '0', '0', '1', '0'],
      ['**255**', '1', '1', '1', '1', '1', '1', '1', '1'],
    ],
    caption: '192.168.10.130 = 11000000.10101000.00001010.10000010',
    notes:
      'Binary is base 2: each bit position is worth double the one to its right. In an 8-bit octet the positions are worth **128, 64, 32, 16, 8, 4, 2 and 1**, and the octet\'s value is the sum of the positions holding a 1. Memorize this row; many candidates write it on the erasable note board in the first minute of the exam. The table converts 192.168.10.130 bit by bit: 192 is 128 + 64, 168 is 128 + 32 + 8, 10 is 8 + 2, and 130 is 128 + 2. Notice two patterns that make subnetting fast later. First, all eight bits set equals **255** and all bits clear equals 0, so an octet can never exceed 255 — an "address" such as 192.168.1.256 is invalid on sight. Second, filling bits from the left produces the running totals **128, 192, 224, 240, 248, 252, 254, 255**, and these are the only values that can ever appear in a subnet mask octet (besides 0).',
  },
  {
    kind: 'steps',
    title: 'Converting decimal ↔ binary',
    steps: [
      { title: 'Write the bit values', text: '`128 64 32 16 8 4 2 1` — always eight positions per octet.' },
      { title: 'Decimal → binary: subtract left to right', text: '201: 128 ✓ (73 left), 64 ✓ (9), 32 ✗, 16 ✗, 8 ✓ (1), 4 ✗, 2 ✗, 1 ✓ → `11001001`' },
      { title: 'Binary → decimal: add the 1 bits', text: '`10110110` = 128 + 32 + 16 + 4 + 2 = **182**' },
      { title: 'Keep leading zeros', text: '10 is `00001010`, never just `1010`.' },
      { title: 'Sanity-check', text: 'Odd numbers end in 1, even numbers in 0; every octet is 0–255.' },
    ],
    diagram: {
      type: 'bits',
      rows: [{ label: '10.1.201.182', value: '10.1.201.182' }],
    },
    notes:
      'To convert decimal to binary, walk the bit values from left to right and ask one question each time: does this value fit into what remains? If it does, write 1 and subtract; if not, write 0 and move on. For 201: 128 fits (73 left), 64 fits (9 left), 32 and 16 do not fit, 8 fits (1 left), 4 and 2 do not fit, and 1 fits (0 left), giving `11001001`. Always fill all eight positions, so leading zeros are written: 10 is `00001010`. Converting back is even easier: add up the values sitting under each 1. `10110110` is 128 + 32 + 16 + 4 + 2 = 182. The bits diagram shows 10.1.201.182 with both conversions in place. The exam gives you no calculator, so practise until one conversion takes under ten seconds. Two quick checks catch most slips: odd numbers always end in 1 and even numbers in 0, and any octet whose leftmost bit is 1 must be at least 128.',
  },
  {
    kind: 'table',
    title: 'Classful addressing: classes A to E',
    columns: ['Class', 'First octet', 'Leading bits', 'Default mask', 'Use'],
    rows: [
      ['A', '1–126', '`0`', '255.0.0.0 (/8)', 'Unicast · 126 networks × 16,777,214 hosts'],
      ['B', '128–191', '`10`', '255.255.0.0 (/16)', 'Unicast · 16,384 networks × 65,534 hosts'],
      ['C', '192–223', '`110`', '255.255.255.0 (/24)', 'Unicast · 2,097,152 networks × 254 hosts'],
      ['D', '224–239', '`1110`', 'none', 'Multicast'],
      ['E', '240–255', '`1111`', 'none', 'Reserved / experimental'],
    ],
    caption: '0 and 127 are reserved, so usable Class A networks run from 1 to 126.',
    notes:
      'Before CIDR arrived in 1993, the first few bits of an address fixed its class and therefore the size of its network. A leading **0** means Class A, **10** Class B, **110** Class C, **1110** Class D and **1111** Class E, which is why the first-octet ranges are 1–126 (0 and 127 are reserved), 128–191, 192–223, 224–239 and 240–255. Classes A, B and C are for unicast hosts and carry default masks of /8, /16 and /24. Class D is **multicast** and Class E is reserved for experimental use, so neither has a default mask. The arithmetic is worth knowing: Class A offers 126 networks of 16,777,214 hosts, Class B 16,384 networks of 65,534 hosts, and Class C 2,097,152 networks of 254 hosts. Today\'s networks are classless (any prefix length can be used with any unicast address), but the exam still asks for an address\'s class and default mask, and IOS still groups `show ip route` output under classful headings such as "10.0.0.0/8 is variably subnetted".',
  },
  {
    kind: 'diagram',
    title: 'Default network/host boundaries',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Class A · 10.20.30.40', value: '10.20.30.40', prefix: 8 },
        { label: 'Class B · 172.16.5.9', value: '172.16.5.9', prefix: 16 },
        { label: 'Class C · 192.168.1.77', value: '192.168.1.77', prefix: 24 },
        { label: 'Class D · 224.0.0.5', value: '224.0.0.5', tone: 'muted' },
      ],
    },
    caption: 'Read the first bits: 0 = A, 10 = B, 110 = C, 1110 = D.',
    notes:
      'This diagram shows where the default network/host boundary falls for each unicast class, and the leading bits that give each class away. 10.20.30.40 starts with a 0 bit, so it is Class A and its default network portion is the first octet alone, leaving 24 host bits. 172.16.5.9 starts with 10, making it Class B with a 16-bit network portion. 192.168.1.77 starts with 110, Class C, with 24 network bits and only 8 host bits. 224.0.0.5 starts with 1110: a Class D multicast group (all OSPF routers) that has no network or host portion at all. In practice you rarely need binary to find a class; the first-octet ranges are faster. Just remember that the class only tells you the *default* mask. Once a network is subnetted, the configured prefix length is what counts: 10.20.30.40/24 is a perfectly valid host on network 10.20.30.0, even though it sits in Class A space.',
  },
  {
    kind: 'table',
    title: 'Special IPv4 addresses',
    columns: ['Address', 'Meaning', 'Where you meet it'],
    rows: [
      ['Network address (host bits all 0)', 'Names the subnet itself', 'Routing tables: `192.168.1.0/24`'],
      ['Directed broadcast (host bits all 1)', 'Every host in that subnet', '`192.168.1.255` in 192.168.1.0/24'],
      ['`255.255.255.255`', 'Limited broadcast: this link only', 'DHCP Discover; never routed'],
      ['`0.0.0.0`', '"This host", no address yet', 'DHCP client source; `0.0.0.0/0` = default route'],
      ['`127.0.0.0/8`', 'Loopback: never leaves the host', '`ping 127.0.0.1` tests the local TCP/IP stack'],
      ['`169.254.0.0/16`', 'Link-local (APIPA)', 'Self-assigned when no DHCP server answers'],
    ],
    notes:
      'Six special cases appear constantly in exam options. The **network address** (all host bits 0) names the subnet and the **directed broadcast** (all host bits 1) reaches every host in it; neither can be assigned to an interface. **255.255.255.255** is the limited broadcast, meaning "everyone on this link", and routers never forward it, which is why DHCP needs relay agents. **0.0.0.0** means "this host, no address yet": a DHCP client uses it as the source address of its Discover, and in routing 0.0.0.0/0 matches every destination, which makes it the default route. The entire **127.0.0.0/8** block is loopback, so a successful `ping 127.0.0.1` proves only that the local TCP/IP stack works, not the NIC or the cable. Finally, **169.254.0.0/16** is the link-local range that clients such as Windows and macOS self-assign (APIPA, Automatic Private IP Addressing) when no DHCP server answers. A client showing 169.254.x.x has an addressing problem, not a working lease.',
  },
  {
    kind: 'diagram',
    title: 'Network and broadcast addresses in binary',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 192.168.1.77', value: '192.168.1.77', prefix: 24 },
        { label: 'Network: host bits all 0', value: '192.168.1.0', prefix: 24 },
        { label: 'Broadcast: host bits all 1', value: '192.168.1.255', prefix: 24 },
      ],
    },
    caption: 'Usable hosts are everything between: 192.168.1.1 – 192.168.1.254 (2^8 − 2 = 254).',
    notes:
      'Seeing the network and broadcast addresses in binary makes the rule obvious. With a /24 mask the first 24 bits are the network and the last 8 bits are the host portion. Set every host bit to **0** and you get the network address, 192.168.1.0. Set every host bit to **1** and you get the directed broadcast, 192.168.1.255. Every combination in between (192.168.1.1 to 192.168.1.254) is a usable host address, which is where the formula **2^h − 2** comes from: 8 host bits give 256 combinations, minus the two reserved ones, leaving 254 hosts. The same rule holds for any prefix length, even when the network/host boundary does not fall on an octet boundary. For example, 10.0.0.0/23 has the broadcast 10.0.1.255, and 10.0.0.255 is an ordinary host inside it. That is the core idea behind subnetting, the next lesson: once you can place the boundary anywhere, you can find the network, broadcast and host range of any address.',
  },
  {
    kind: 'table',
    title: 'Unicast, broadcast and multicast',
    columns: ['Type', 'Destination address', 'Processed by', 'Example'],
    rows: [
      ['Unicast', 'One host (Class A, B or C space)', 'A single interface', 'Web session to `10.1.1.20`'],
      ['Limited broadcast', '`255.255.255.255`', 'Every host on the local link', 'DHCP Discover'],
      ['Directed broadcast', 'Subnet broadcast, e.g. `10.1.1.255`', 'Every host in that subnet', 'Not forwarded by IOS by default'],
      ['Multicast', '`224.0.0.0/4` (224–239)', 'Hosts that joined the group', 'OSPF `224.0.0.5` and `224.0.0.6`'],
    ],
    notes:
      'IPv4 has three delivery styles. **Unicast** is one-to-one and uses addresses from the Class A, B and C space. **Broadcast** is one-to-all: the limited broadcast 255.255.255.255 stays on the local link, while a directed broadcast such as 10.1.1.255 targets every host in one specific subnet. Because attackers once abused directed broadcasts to amplify floods (the "smurf" attack), IOS has disabled directed-broadcast forwarding by default since release 12.0 (`no ip directed-broadcast`). **Multicast** is one-to-many-who-asked: only hosts that joined the group process the packet, and the range is **224.0.0.0/4**, 224.0.0.0 to 239.255.255.255. Groups in 224.0.0.0/24 are link-local control groups that routers never forward. Learn the ones protocols use: 224.0.0.1 all hosts, 224.0.0.2 all routers, **224.0.0.5** all OSPF routers, **224.0.0.6** OSPF DR/BDR, 224.0.0.9 RIPv2 and 224.0.0.10 EIGRP. IPv6, by contrast, has no broadcast at all and relies on multicast instead.',
  },
  {
    kind: 'diagram',
    title: 'Routers stop broadcasts',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.1.10/24', x: 1, y: 1.2, tone: 'accent' },
        { id: 'pc2', icon: 'pc', label: 'PC2', sub: '10.1.1.11/24', x: 1, y: 3 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 3, y: 2.1 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5.2, y: 2.1 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.2, y: 2.1 },
        { id: 'pc3', icon: 'pc', label: 'PC3', sub: '10.2.2.30/24', x: 9, y: 2.1 },
      ],
      links: [
        { from: 'pc1', to: 'sw1' },
        { from: 'pc2', to: 'sw1' },
        { from: 'sw1', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'sw2', fromLabel: 'G0/0/1' },
        { from: 'sw2', to: 'pc3' },
      ],
      groups: [
        { label: 'Broadcast domain 1 · 10.1.1.0/24', x: 0.2, y: 0.2, w: 4.3, h: 3.6, tone: 'accent' },
        { label: 'Broadcast domain 2 · 10.2.2.0/24', x: 6.3, y: 0.2, w: 3.5, h: 3.6, tone: 'muted' },
      ],
      annotations: [{ x: 5.2, y: 3.3, text: '255.255.255.255 stops here', tone: 'bad' }],
    },
    caption: 'Each router interface is the edge of a broadcast domain and needs an address in a different subnet.',
    notes:
      'Every router interface is the edge of a **broadcast domain**. When PC1 sends a packet to 255.255.255.255, it travels in a frame addressed to the broadcast MAC, so SW1 floods it out every port in the VLAN: PC2 and R1\'s G0/0/0 both receive it. R1, however, does not forward it out G0/0/1, so PC3 never sees it. This is exactly why a DHCP server on another subnet cannot hear a client\'s Discover without help; the router must be configured as a DHCP relay with `ip helper-address`, which is covered in the DHCP lesson. It is also why each router interface needs an address in a **different subnet**: each interface connects a separate IP network. Switches, by contrast, forward broadcasts within a VLAN, so all hosts in one VLAN share one broadcast domain. Exam topologies often ask how many broadcast domains exist; count the separate segments that router interfaces create (and, once you know them, the VLANs).',
  },
  {
    kind: 'cli',
    title: 'Configuring IPv4 on a router interface',
    code: `R1> enable
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# description LAN-A users
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)#
%LINK-3-UPDOWN: Interface GigabitEthernet0/0/0, changed state to up
%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/0, changed state to up
R1(config-if)# interface GigabitEthernet0/0/1
R1(config-if)# description LAN-B servers
R1(config-if)# ip address 10.2.2.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# copy running-config startup-config
Destination filename [startup-config]?
Building configuration...
[OK]`,
    highlight: ['ip address 10.1.1.1 255.255.255.0', 'no shutdown'],
    caption: 'Address and dotted-decimal mask, then `no shutdown` — router interfaces start administratively down.',
    notes:
      'Configuring an IPv4 address on a Cisco router takes three moves: enter interface configuration mode, give the address **and** mask with `ip address`, and bring the interface up with `no shutdown`. Router interfaces are **administratively down** by default, so forgetting `no shutdown` is the single most common lab mistake. IOS expects the mask in dotted-decimal form in this command, not as a /prefix. Two rules keep you out of trouble. First, the address must be a valid host address: IOS rejects the subnet\'s network or broadcast address with a "Bad mask" error. Second, every routed interface on one router must sit in a **different subnet**; IOS refuses an address that overlaps a subnet already configured on another of its interfaces. The `description` command costs nothing and saves time when troubleshooting. When the link comes up, IOS logs `%LINK-3-UPDOWN` for the physical layer and `%LINEPROTO-5-UPDOWN` for the line protocol. The configuration lives only in RAM until you save it with `copy running-config startup-config`.',
  },
  {
    kind: 'cli',
    title: 'Verifying interface addressing',
    code: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.2.2.1        YES manual up                    up
Serial0/1/0            unassigned      YES unset  administratively down down
Serial0/1/1            unassigned      YES unset  administratively down down
R1# show ip interface GigabitEthernet0/0/0
GigabitEthernet0/0/0 is up, line protocol is up
  Internet address is 10.1.1.1/24
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes
  Helper address is not set
  Directed broadcast forwarding is disabled
  Proxy ARP is enabled`,
    highlight: ['10.1.1.1/24', 'administratively down', 'manual'],
    caption: '`show ip interface` excerpt: the address appears with its prefix length.',
    notes:
      '`show ip interface brief` is the fastest health check on any Cisco device: one line per interface with its address, how that address was set (the **Method** column shows `manual` for CLI configuration, `NVRAM` after a reload from startup-config, `DHCP`, or `unset`), and two status columns. **Status** reflects the physical and administrative state; **Protocol** reflects the data-link layer. Here both Gigabit interfaces are up/up with addresses, while the serial ports have no address and are still shut down. `show ip interface <name>` goes deeper: the address with its prefix length, whether a DHCP helper is set, whether directed broadcasts are forwarded, proxy ARP, and any ACLs applied (trimmed from this excerpt). Do not be fooled by "Broadcast address is 255.255.255.255": that is the address IOS uses for its own broadcasts, not the subnet\'s directed broadcast. `show interfaces` also prints an "Internet address is" line alongside Layer 1/2 counters. Expect exhibits like these with questions such as "which interface is misconfigured?"',
  },
  {
    kind: 'table',
    title: 'Reading the Status and Protocol columns',
    columns: ['Status', 'Protocol', 'Meaning', 'Typical cause / fix'],
    rows: [
      ['up', 'up', 'Layers 1 and 2 working', 'Normal operation'],
      ['administratively down', 'down', 'Interface is shut down', '`no shutdown` (router default is shutdown)'],
      ['down', 'down', 'No physical signal', 'Unplugged or bad cable, neighbor off or shut'],
      ['up', 'down', 'Layer 1 fine, Layer 2 failing', 'Serial encapsulation mismatch, no clock rate, keepalives'],
    ],
    notes:
      'The two status columns pinpoint the failing layer. **up/up** means the physical layer and the line protocol both work. **administratively down/down** means someone (or the factory default, on routers) issued `shutdown`; the fix is `no shutdown`. **down/down** means no physical signal: an unplugged or faulty cable, a powered-off neighbor, or a neighbor port that is itself shut down. **up/down** means the physical layer is fine but the data-link layer is not; on serial links the usual causes are an encapsulation mismatch (HDLC on one end, PPP on the other), a missing clock rate on the DCE end, or failed keepalives. Switch ports have one more state, err-disabled, which you will meet with port security. Build one exam habit from this slide: an interface can be up/up with a *wrong* IP address or mask, so a healthy status never proves the addressing is right. Always read the IP-Address column, and the mask in the running-config, as well.',
  },
  {
    kind: 'bullets',
    title: 'The default gateway',
    bullets: [
      'Router interface IP that a host uses for **every off-subnet destination**',
      'Must be in the **same subnet** as the host',
      'Set statically or learned from **DHCP** (option 3, "router")',
      'Missing or wrong gateway → local traffic works, **remote traffic fails**',
      'Switches need `ip default-gateway` for their own management traffic',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10/24 · GW 10.1.1.1', x: 1, y: 1.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.6, y: 1.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: '10.1.1.1', x: 6.2, y: 1.5, tone: 'accent' },
        { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.20/24', x: 9, y: 1.5 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'srv', fromLabel: 'G0/0/1', label: '10.2.2.0/24' },
      ],
    },
    notes:
      'A host can only reach its own subnet directly. For every other destination it relies on its **default gateway**: the IP address of a router interface on the same subnet. Before sending, PC1 compares the destination with its own network using its mask. 10.1.1.50 would be local, so PC1 would deliver that frame directly. 10.2.2.20 is remote, so PC1 hands the packet to R1 at 10.1.1.1 and R1 routes it onward. The gateway must be inside the host\'s subnet: a PC at 10.1.1.10/24 configured with gateway 10.1.2.1 can never reach it, because the host would need a gateway to reach its gateway. The classic symptom of a missing or wrong gateway is that pings to local hosts succeed while everything remote fails. Hosts get their gateway either by static configuration or from DHCP (option 3, "router"). Layer 2 switches have the same need for their own management traffic, configured with `ip default-gateway`, as covered in the IOS basics lesson.',
  },
  {
    kind: 'diagram',
    title: 'ARP: finding the gateway\'s MAC',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 10.1.1.10', icon: 'pc' },
        { id: 'sw', label: 'SW1', icon: 'switch' },
        { id: 'r1', label: 'R1 10.1.1.1', icon: 'router' },
      ],
      steps: [
        { note: 'PC1 must send to 10.2.2.20: remote, so the next hop is 10.1.1.1. ARP cache miss.' },
        { from: 'pc', to: 'sw', label: 'ARP request (broadcast)', sub: 'Who has 10.1.1.1? Tell 10.1.1.10 · dst MAC FFFF.FFFF.FFFF' },
        { from: 'sw', to: 'r1', label: 'Flooded out every port in the VLAN' },
        { from: 'r1', to: 'pc', label: 'ARP reply (unicast)', sub: '10.1.1.1 is at 005a.731c.4201', tone: 'accent' },
        { from: 'pc', to: 'r1', label: 'Frame to R1\'s MAC', sub: 'IP packet still addressed to 10.2.2.20' },
      ],
    },
    caption: 'Requests are broadcast; replies are unicast. A host never ARPs for a remote destination.',
    notes:
      'Knowing the gateway\'s IP address is not enough: the Ethernet frame needs the gateway\'s **MAC address**, and finding it is ARP\'s job. PC1 first checks its ARP cache. On a miss it broadcasts an **ARP request** (destination MAC FFFF.FFFF.FFFF) asking "who has 10.1.1.1?". The request carries PC1\'s own IP and MAC, plus a target MAC of all zeros, because that is the unknown. SW1 floods the broadcast within the VLAN, but only R1 owns 10.1.1.1, so only R1 answers, with a **unicast ARP reply** straight back to PC1. Both sides cache the mapping, and PC1 can now send its packet for 10.2.2.20 inside a frame addressed to **R1\'s MAC**. Notice what PC1 never does: it never ARPs for the remote server, whose MAC is useless beyond the far subnet. R1 does its own ARP on the 10.2.2.0/24 segment when it forwards the packet. ARP rides directly in Ethernet (EtherType 0x0806) with no IP header, so it never crosses a router.',
  },
  {
    kind: 'cli',
    title: 'Checking ARP caches',
    code: `R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   005a.731c.4201  ARPA   GigabitEthernet0/0/0
Internet  10.1.1.10               7   a4bb.6d21.9e30  ARPA   GigabitEthernet0/0/0
Internet  10.2.2.1                -   005a.731c.4202  ARPA   GigabitEthernet0/0/1
Internet  10.2.2.20               2   0050.56a1.33c7  ARPA   GigabitEthernet0/0/1

C:\\>arp -a

Interface: 10.1.1.10 --- 0xc
  Internet Address      Physical Address      Type
  10.1.1.1              00-5a-73-1c-42-01     dynamic
  10.1.1.255            ff-ff-ff-ff-ff-ff     static
  224.0.0.22            01-00-5e-00-00-16     static
  255.255.255.255       ff-ff-ff-ff-ff-ff     static`,
    highlight: ['00-5a-73-1c-42-01', '005a.731c.4201'],
    caption: 'R1 (`show ip arp`) and PC1 (`arp -a`): PC1 holds the gateway\'s MAC, never the remote server\'s.',
    notes:
      'On a Cisco router, `show ip arp` (or the shorter `show arp`) lists every mapping the router knows. Entries with a dash in the Age column are the router\'s **own** interface addresses; the others were learned dynamically and show their age in minutes. IOS keeps dynamic entries for **4 hours** by default. Here R1 has learned PC1 on G0/0/0 and the server on G0/0/1. On Windows, `arp -a` lists the cache per interface. PC1\'s cache holds the **gateway** 10.1.1.1 but nothing for 10.2.2.20, which proves remote hosts are reached through the gateway\'s MAC. The static entries are broadcast and multicast mappings Windows builds automatically; multicast IPs map to MACs starting 01-00-5e. To clear a cache, use `clear arp-cache` on IOS or `arp -d *` from an elevated Windows prompt. macOS and Linux also accept `arp -a`, though modern Linux prefers `ip neigh`. If the gateway never appears, suspect Layer 1 or 2 towards it: wrong VLAN, a shut port or a bad cable.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: IPv4 addressing',
    body: 'Most lost points here come from ==answers that are true for a slightly different situation==.',
    bullets: [
      'Usable Class A is **1–126**; 127.x.x.x is loopback, not a host network',
      'Hosts = 2^h − **2**: the network and broadcast addresses are not assignable',
      'Frame to a remote host: **gateway\'s MAC**, remote host\'s IP',
      'ARP request = **broadcast**; ARP reply = **unicast**',
      '169.254.x.x means DHCP **failed** (APIPA), not a valid lease',
      'Routers change **TTL and checksum** at each hop, not the IP addresses',
      'New router interface still down? Check for `no shutdown`',
    ],
    notes:
      'These traps account for a surprising number of lost points. Exam writers put 127.x.x.x into Class A answer lists, so remember that usable Class A stops at 126. They ask for "hosts" to see whether you forget to subtract the network and broadcast addresses. They show a PC whose gateway lies outside its own subnet and ask why only remote pings fail. They ask which MAC address a frame heading to another subnet carries (always the next router\'s) while the destination IP remains the far host\'s. They mix up request and reply: an ARP request is broadcast, the reply is unicast. They show 169.254.x.x in `ipconfig` output hoping you call it a working address; it actually means the DHCP exchange failed. They ask which header fields change in transit: TTL and the checksum, never the addresses unless NAT is configured. And when a newly configured router interface stays down, check first whether anyone typed `no shutdown`.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '32-bit addresses, four octets of 0–255; bit values **128 → 1**',
      'Header: 20–60 bytes; routers change **TTL** and **checksum** only',
      'Classes A/B/C: **1–126 /8**, **128–191 /16**, **192–223 /24**; D multicast, E reserved',
      'Network = host bits 0; broadcast = host bits 1; hosts = **2^h − 2**',
      'Special: 0.0.0.0, 255.255.255.255, 127.0.0.0/8, 169.254.0.0/16, 224.0.0.0/4',
      '`ip address` + `no shutdown`; verify with `show ip interface brief`',
      'Off-subnet traffic goes to the **gateway**, whose MAC ARP resolves',
    ],
    notes:
      'You now have the vocabulary the rest of the course is built on. An IPv4 address is 32 bits, split by the mask into network and host portions, and you can convert any octet between binary and decimal using the eight bit values. You know the header fields and which of them change hop by hop. You can name the class and default mask of any address, and you recognize the special ranges on sight: 0.0.0.0, the limited broadcast, loopback, APIPA and multicast. On a router you configure addresses with `ip address` plus `no shutdown` and verify them with `show ip interface brief` and `show ip interface`, reading the status columns to find the failing layer. Finally, a host decides whether a destination is local or remote, sends remote traffic to its default gateway, and uses ARP to learn that gateway\'s MAC. The next lesson, Subnetting, moves the network/host boundary anywhere you like, and turns these ideas into fast, reliable exam arithmetic.',
  },
];
