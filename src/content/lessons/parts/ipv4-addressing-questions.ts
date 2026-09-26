import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Length of an IPv4 address', back: '**32 bits**, written as four 8-bit octets in dotted decimal (e.g. 192.168.10.130).' },
  { id: 'f2', front: 'Range of values in one octet', back: '**0–255** (`00000000` to `11111111`).' },
  { id: 'f3', front: 'The eight bit values of an octet, left to right', back: '`128 64 32 16 8 4 2 1`' },
  { id: 'f4', front: 'Minimum and maximum IPv4 header length', back: '**20 bytes** (IHL = 5) to **60 bytes** (IHL = 15). IHL counts 32-bit words.' },
  { id: 'f5', front: 'IPv4 Protocol field values: ICMP, TCP, UDP, EIGRP, OSPF', back: '**1, 6, 17, 88, 89**.' },
  { id: 'f6', front: 'What a router does when TTL reaches 0', back: 'Discards the packet and sends an **ICMP Time Exceeded** message to the source.' },
  { id: 'f7', front: 'IPv4 header fields a router changes when forwarding (no NAT)', back: '**TTL** (decremented by 1) and the **Header Checksum** (recomputed).' },
  { id: 'f8', front: 'Default starting TTL: Windows / Linux and macOS / Cisco IOS', back: '**128 / 64 / 255**.' },
  { id: 'f9', front: 'DSCP field', back: '6 bits of the old ToS byte used for QoS marking (voice is normally EF = 46). The other 2 bits are ECN.' },
  { id: 'f10', front: 'The three IPv4 Flags bits', back: 'Reserved (always 0), **DF** (Don\'t Fragment), **MF** (More Fragments). Fragment Offset counts 8-byte units.' },
  { id: 'f11', front: 'Class A: first-octet range and default mask', back: '**1–126**, 255.0.0.0 (/8). Leading bit `0`.' },
  { id: 'f12', front: 'Class B: first-octet range and default mask', back: '**128–191**, 255.255.0.0 (/16). Leading bits `10`.' },
  { id: 'f13', front: 'Class C: first-octet range and default mask', back: '**192–223**, 255.255.255.0 (/24). Leading bits `110`.' },
  { id: 'f14', front: 'Class D range and use', back: '**224–239** (224.0.0.0/4): multicast. Leading bits `1110`.' },
  { id: 'f15', front: 'Class E range and use', back: '**240–255**: reserved/experimental. Leading bits `1111`.' },
  { id: 'f16', front: 'Usable hosts in a classful A / B / C network', back: '**16,777,214 / 65,534 / 254** (2^24 − 2, 2^16 − 2, 2^8 − 2).' },
  { id: 'f17', front: 'Loopback range', back: '**127.0.0.0/8**. `ping 127.0.0.1` tests only the local TCP/IP stack, not the NIC or cable.' },
  { id: 'f18', front: 'APIPA range', back: '**169.254.0.0/16**: link-local address a client assigns itself when no DHCP server answers.' },
  { id: 'f19', front: '255.255.255.255', back: '**Limited broadcast**: every host on the local link. Routers never forward it.' },
  { id: 'f20', front: '0.0.0.0', back: '"This host" / unspecified: the source of a DHCP Discover. Written 0.0.0.0/0 it is the **default route**.' },
  { id: 'f21', front: 'Network address', back: 'All host bits **0**. Names the subnet and cannot be assigned to an interface.' },
  { id: 'f22', front: 'Directed broadcast address', back: 'All host bits **1** (e.g. 10.1.1.255 in 10.1.1.0/24). IOS does not forward directed broadcasts by default (`no ip directed-broadcast`).' },
  { id: 'f23', front: 'Multicast groups 224.0.0.5 and 224.0.0.6', back: 'All OSPF routers / OSPF DR and BDR.' },
  { id: 'f24', front: 'Configure an IPv4 address on an IOS interface', back: '`ip address 10.1.1.1 255.255.255.0` in interface configuration mode, then `no shutdown`.' },
  { id: 'f25', front: 'Default state of a Cisco router interface', back: '**Administratively down** (shutdown) until `no shutdown` is entered.' },
  { id: 'f26', front: 'Interface status up, protocol down', back: 'Layer 1 works but Layer 2 fails: e.g. serial encapsulation mismatch, missing clock rate, keepalive failure.' },
  { id: 'f27', front: 'ARP request vs ARP reply addressing', back: 'Request: **broadcast** (FFFF.FFFF.FFFF). Reply: **unicast** to the requester.' },
  { id: 'f28', front: 'View the ARP cache on IOS / Windows', back: '`show ip arp` (or `show arp`) / `arp -a`.' },
  { id: 'f29', front: 'Default ARP cache timeout on Cisco IOS', back: '**4 hours** (240 minutes).' },
  { id: 'f30', front: 'Default gateway', back: 'The router interface IP in the host\'s **own subnet** that the host uses for every off-subnet destination.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'input',
    stem: 'Convert the binary octet `11000000` to decimal.',
    answers: ['192'],
    placeholder: '0–255',
    difficulty: 1,
    explanation: 'The two 1 bits sit in the 128 and 64 positions: 128 + 64 = **192**. Every other position is 0, so nothing else is added.',
  },
  {
    id: 'q2',
    type: 'input',
    stem: 'Convert the decimal value 172 to an 8-bit binary number.',
    answers: ['10101100'],
    placeholder: '8 bits',
    difficulty: 1,
    explanation: '172 − 128 = 44 (1), 64 does not fit (0), 44 − 32 = 12 (1), 16 does not fit (0), 12 − 8 = 4 (1), 4 − 4 = 0 (1), then 0 and 0: **10101100**.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'To which address class does 191.10.4.2 belong?',
    options: ['Class A', 'Class B', 'Class C', 'Class D'],
    answer: 1,
    difficulty: 1,
    explanation: 'Class B covers first octets **128–191**, so 191 is the last Class B value. Class A ends at 126 (127 is loopback), Class C starts at 192 and Class D (multicast) at 224.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two addresses cannot be assigned to a host in 192.168.1.0/24? (Choose two.)',
    options: ['192.168.1.0', '192.168.1.1', '192.168.1.128', '192.168.1.254', '192.168.1.255'],
    answers: [0, 4],
    difficulty: 1,
    explanation: '**192.168.1.0** is the network address (host bits all 0) and **192.168.1.255** is the directed broadcast (host bits all 1). Everything from .1 to .254, including .128, is a usable host address in a /24.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each address to its meaning.',
    pairs: [
      { left: '127.0.0.1', right: 'Loopback' },
      { left: '169.254.10.5', right: 'Self-assigned after DHCP failed (APIPA)' },
      { left: '255.255.255.255', right: 'Limited broadcast' },
      { left: '224.0.0.5', right: 'OSPF multicast group' },
    ],
    difficulty: 1,
    explanation: '127.0.0.0/8 is loopback, 169.254.0.0/16 is the APIPA link-local range, 255.255.255.255 is the limited broadcast that routers never forward, and 224.0.0.5 is the all-OSPF-routers multicast group.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'An engineer enters `ip address 10.1.1.1 255.255.255.0` on a new router interface. Which command is still required to make the interface operational?',
    options: [
      '`ip routing`',
      '`enable`',
      '`no shutdown`',
      '`copy running-config startup-config`',
    ],
    answer: 2,
    difficulty: 1,
    explanation: 'Router interfaces are **administratively down** by default, so `no shutdown` is required. `ip routing` is already on by default on routers, `enable` enters privileged EXEC mode, and saving the configuration does not bring an interface up.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'PC1 (10.1.1.10/24, gateway 10.1.1.1) pings 10.2.2.20 with an empty ARP cache. Which IP address does PC1\'s ARP request ask about?',
    options: ['10.2.2.20', '10.1.1.1', '255.255.255.255', '10.1.1.255'],
    answer: 1,
    difficulty: 2,
    explanation: '10.2.2.20 is on another subnet, so PC1 must send the frame to its **default gateway** and ARPs for **10.1.1.1**. Hosts never ARP for remote addresses. The broadcast addresses are not ARP targets; the ARP request is sent to the broadcast MAC, not to a broadcast IP.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Which IPv4 header field tells the receiver whether the payload is TCP, UDP or ICMP?',
    options: [
      'Type of Service (DSCP)',
      'Identification',
      'IHL',
      'Protocol',
    ],
    answer: 3,
    difficulty: 1,
    explanation: 'The 8-bit **Protocol** field identifies the payload (6 TCP, 17 UDP, 1 ICMP). DSCP is a QoS marking, Identification groups fragments, and IHL gives the header length.',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which IPv4 header field prevents a packet from circulating forever during a routing loop?',
    options: [
      'Header Checksum',
      'Identification',
      'TTL',
      'Fragment Offset',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      '**TTL** is decremented by every router; when it reaches 0 the packet is discarded, so a looping packet dies after at most 255 hops. The checksum only detects header corruption, and Identification and Fragment Offset are used to reassemble fragments.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. What is the purpose of the field labeled X?',
    exhibit: {
      kind: 'diagram',
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
          { label: 'X', size: 8, tone: 'accent' },
          { label: 'Protocol', size: 8 },
          { label: 'Header Checksum', size: 16 },
          { label: 'Source Address', size: 32 },
          { label: 'Destination Address', size: 32 },
        ],
      },
    },
    options: [
      'It identifies the transport-layer protocol carried in the payload',
      'It limits how many routers can forward the packet so that it cannot loop forever',
      'It carries the QoS marking used to prioritize the packet',
      'It states the length of the header in 32-bit words',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The 8-bit field that opens the third row is **TTL**, a hop counter that routers decrement. The payload type is the **Protocol** field right next to it, the QoS marking is **DSCP** in the first row, and the header length is **IHL**, also in the first row.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'A router receives a packet whose TTL is 1. The destination is on a remote network reachable through another router. What does the router do?',
    options: [
      'Forwards the packet with a TTL of 0 so that the next router can discard it',
      'Resets the TTL to 255 and forwards the packet',
      'Discards the packet and sends ICMP Destination Unreachable to the source',
      'Decrements the TTL to 0, discards the packet and sends ICMP Time Exceeded to the source',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'A router may not forward a packet whose TTL would become 0, so it drops it and reports **ICMP Time Exceeded** to the sender (the mechanism traceroute relies on). Packets are never forwarded with TTL 0, routers never reset TTL, and Destination Unreachable is reserved for missing routes or unreachable hosts and ports.',
  },
  {
    id: 'e4',
    type: 'input',
    stem: 'What is the decimal value of the binary octet `11101000`?',
    answers: ['232'],
    placeholder: '0–255',
    difficulty: 2,
    explanation: 'The 1 bits are in the 128, 64, 32 and 8 positions: 128 + 64 + 32 + 8 = **232**. A common slip is reading the fifth bit as 16; count positions carefully from the left.',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'Convert the decimal value 237 to an 8-bit binary number.',
    answers: ['11101101'],
    placeholder: '8 bits',
    difficulty: 2,
    explanation:
      '237 − 128 = 109 (1), 109 − 64 = 45 (1), 45 − 32 = 13 (1), 16 does not fit (0), 13 − 8 = 5 (1), 5 − 4 = 1 (1), 2 does not fit (0), 1 − 1 = 0 (1): **11101101**. Check: 128 + 64 + 32 + 8 + 4 + 1 = 237, and the value is odd, so the last bit must be 1.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'What are the class and the default subnet mask of the address 172.20.5.9?',
    options: [
      'Class A, 255.0.0.0',
      'Class B, 255.255.0.0',
      'Class C, 255.255.255.0',
      'Class B, 255.255.255.0',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'A first octet of 172 falls in **128–191**, Class B, whose default mask is **255.255.0.0 (/16)**. Class A would need 1–126 and Class C 192–223. 255.255.255.0 is a valid mask for a subnetted Class B network, but it is not the *default* mask.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two addresses are Class C addresses? (Choose two.)',
    options: ['192.0.2.1', '223.255.255.1', '191.255.0.1', '224.0.0.9', '128.2.3.4'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Class C first octets run from **192 to 223**, so 192.0.2.1 and 223.255.255.1 qualify (192.0.2.1 is also a documentation address, but its class is still C). 191.255.0.1 and 128.2.3.4 are Class B, and 224.0.0.9 is a Class D multicast group (RIPv2).',
  },
  {
    id: 'e8',
    type: 'match',
    stem: 'Match each address to its role.',
    pairs: [
      { left: '`127.0.0.1`', right: 'Loopback: tests the local TCP/IP stack' },
      { left: '`169.254.33.4`', right: 'Self-assigned after a DHCP failure' },
      { left: '`224.0.0.10`', right: 'Multicast group used by EIGRP' },
      { left: '`255.255.255.255`', right: 'Limited broadcast that is never routed' },
      { left: '`0.0.0.0`', right: 'Source address of a DHCP Discover' },
    ],
    difficulty: 2,
    explanation:
      '127.0.0.0/8 is loopback; 169.254.0.0/16 is APIPA link-local space; 224.0.0.10 is the EIGRP routers group (OSPF uses .5 and .6); 255.255.255.255 is the limited broadcast; and a DHCP client with no address yet sources its Discover from 0.0.0.0.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'A Windows laptop reports the IPv4 address 169.254.77.12, mask 255.255.0.0, and no default gateway. What does this indicate?',
    options: [
      'The DHCP server leased the laptop an address from its private pool',
      'The laptop is sending all traffic through its loopback interface',
      'The laptop received no reply from a DHCP server and assigned itself a link-local address',
      'The laptop received a valid lease, but the DHCP pool has no gateway option',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      '169.254.0.0/16 is the **APIPA** range: the OS self-assigns it only when DHCP fails, which is why there is no gateway. A real DHCP lease would come from the server\'s configured pool (typically RFC 1918 space), not from 169.254.0.0/16. Loopback is 127.0.0.0/8.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts on LAN-B cannot reach their default gateway, 10.2.2.1. Which action resolves the problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface GigabitEthernet0/0/1
Building configuration...

Current configuration : 118 bytes
!
interface GigabitEthernet0/0/1
 description LAN-B
 ip address 10.2.2.1 255.255.255.0
 shutdown
 negotiation auto
end`,
    },
    options: [
      'Enter `no shutdown` under interface GigabitEthernet0/0/1',
      'Change the mask to 255.255.0.0',
      'Remove the `negotiation auto` command',
      'Configure `ip default-gateway 10.2.2.1` on R1',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The interface is configured correctly but is **shut down**, so it shows administratively down and cannot answer ARP or pings. `no shutdown` fixes it. The /24 mask is fine, `negotiation auto` is the normal default on this interface, and `ip default-gateway` is for devices that do not route, such as Layer 2 switches.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Serial0/1/0 on R1 connects to R2. What is the most likely cause of the status shown for Serial0/1/0?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.2.2.1        YES NVRAM  up                    up
Serial0/1/0            10.0.12.1       YES manual up                    down
Serial0/1/1            unassigned      YES unset  down                  down`,
    },
    options: [
      'The interface was disabled with the `shutdown` command',
      'The serial cable is unplugged',
      'R2\'s serial address is in a different subnet from 10.0.12.1',
      'A data-link problem, such as an encapsulation mismatch with R2',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      '**up/down** means the physical layer is working but the line protocol is not, which points to Layer 2: mismatched encapsulation (HDLC vs PPP), a missing clock rate or failed keepalives. A shutdown interface shows "administratively down", an unplugged cable gives down/down (like Serial0/1/1), and an IP subnet mismatch does not affect the line protocol at all; the interface would be up/up but pings would fail.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'An engineer must assign the first usable address of 192.168.50.0/24 to GigabitEthernet0/0/0 on R1. Which command should be entered in interface configuration mode?',
    options: [
      '`ip address 192.168.50.0 255.255.255.0`',
      '`ip address 192.168.50.1 0.0.0.255`',
      '`ip address 192.168.50.1 255.255.255.0`',
      '`ip address 192.168.50.254 255.255.255.0`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The first usable host is the network address plus one, **192.168.50.1**, entered with a dotted-decimal subnet mask. 192.168.50.0 is the network address and IOS rejects it, 0.0.0.255 is a wildcard mask (used in ACLs and OSPF, not in `ip address`), and .254 is the *last* usable host.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 sends a packet to Server1. When the frame carrying that packet arrives at Server1, what are its source MAC address and source IP address?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.6,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10 · 0050.7966.6801', x: 1, y: 1.8 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 3, y: 1.8 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.8 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 7, y: 1.8 },
          { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.2.20 · 0050.56a1.33c7', x: 9, y: 1.8 },
        ],
        links: [
          { from: 'pc', to: 'sw1' },
          { from: 'sw1', to: 'r1', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'sw2', fromLabel: 'G0/0/1' },
          { from: 'sw2', to: 'srv' },
        ],
        annotations: [
          { x: 5, y: 0.5, text: 'G0/0/0: 10.1.1.1 · MAC 005a.731c.4201' },
          { x: 5, y: 3.2, text: 'G0/0/1: 10.2.2.1 · MAC 005a.731c.4202' },
        ],
      },
    },
    options: [
      'Source MAC 0050.7966.6801, source IP 10.1.1.10',
      'Source MAC 005a.731c.4202, source IP 10.1.1.10',
      'Source MAC 005a.731c.4202, source IP 10.2.2.1',
      'Source MAC 005a.731c.4201, source IP 10.1.1.10',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'R1 builds a **new frame** on the 10.2.2.0/24 segment, so the source MAC is R1\'s egress interface, G0/0/1 (**005a.731c.4202**), while the IP header still carries PC1\'s address **10.1.1.10**. PC1\'s MAC only appears on the first segment, R1\'s G0/0/0 MAC belongs to the ingress side, and routers do not replace the source IP unless NAT is configured.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   005a.731c.4201  ARPA   GigabitEthernet0/0/0
Internet  10.1.1.10              12   a4bb.6d21.9e30  ARPA   GigabitEthernet0/0/0
Internet  10.1.1.11               0   a4bb.6d21.9e31  ARPA   GigabitEthernet0/0/0
Internet  10.2.2.1                -   005a.731c.4202  ARPA   GigabitEthernet0/0/1
Internet  10.2.2.20              95   0050.56a1.33c7  ARPA   GigabitEthernet0/0/1`,
    },
    options: [
      '10.1.1.1 and 10.2.2.1 are addresses configured on R1\'s own interfaces',
      'R1 learned 10.2.2.20 on GigabitEthernet0/0/1 about 95 minutes ago',
      'The entry for 10.1.1.10 will be removed in 12 minutes',
      'The entry for 10.1.1.11 was configured statically',
      'Host 10.2.2.20 is reachable out GigabitEthernet0/0/0',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'A **dash** in the Age column marks the router\'s own interface addresses, and the Age column shows how many minutes ago an entry was learned or refreshed, so 10.2.2.20 was learned on G0/0/1 about 95 minutes ago. The 12 is time since learning, not time remaining (IOS ages entries after 4 hours). An age of 0 means just learned, not static, and 10.2.2.20 sits on G0/0/1, not G0/0/0.',
  },
  {
    id: 'e15',
    type: 'order',
    stem: 'PC1 sends its first packet to a server on another subnet. Put the events in the correct order.',
    items: [
      'PC1 compares the destination with its own subnet and finds that it is remote',
      'PC1 looks for its default gateway in the ARP cache and finds no entry',
      'PC1 broadcasts an ARP request for the gateway\'s IP address',
      'The router sends a unicast ARP reply containing its MAC address',
      'PC1 caches the mapping and sends the packet in a frame addressed to the router\'s MAC',
    ],
    difficulty: 2,
    explanation:
      'A host first decides local versus remote using its mask, which selects the gateway as the next hop. Only then does it check the ARP cache, broadcast a request on a miss, receive the unicast reply, cache it, and finally transmit the frame to the gateway\'s MAC while the IP destination stays the server.',
  },
  {
    id: 'e16',
    type: 'categorize',
    stem: 'Classify each destination address by delivery type.',
    categories: ['Unicast', 'Broadcast', 'Multicast'],
    items: [
      { text: '10.1.1.20', category: 0 },
      { text: '255.255.255.255', category: 1 },
      { text: '224.0.0.5', category: 2 },
      { text: '239.1.1.1', category: 2 },
      { text: '192.168.1.255 in 192.168.1.0/24', category: 1 },
      { text: '172.16.0.1', category: 0 },
    ],
    difficulty: 2,
    explanation:
      'Addresses in the Class A/B/C space that identify a single host are **unicast**. 255.255.255.255 is the limited broadcast, and 192.168.1.255 is the directed broadcast of its /24. Anything in **224.0.0.0/4** (224–239 in the first octet) is multicast, including 224.0.0.5 (OSPF) and 239.1.1.1.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which value in the IPv4 Protocol field indicates that the payload is a UDP segment?',
    options: [
      '17',
      '6',
      '1',
      '89',
    ],
    answer: 0,
    difficulty: 1,
    explanation: 'UDP is protocol **17**. TCP is 6, ICMP is 1 and OSPF is 89. Do not confuse protocol numbers (IP header) with port numbers (TCP/UDP header).',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. PC1\'s ARP cache is empty. A user on PC1 pings PC2. What is the destination MAC address of the first frame PC1 transmits?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.6,
        nodes: [
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.1.10/24', x: 1, y: 1 },
          { id: 'pc2', icon: 'pc', label: 'PC2', sub: '10.1.1.50/24', x: 1, y: 2.8 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 4, y: 1.9 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 10.1.1.1/24', x: 7, y: 1.9 },
          { id: 'net', icon: 'cloud', label: 'WAN', x: 9.2, y: 1.9 },
        ],
        links: [
          { from: 'pc1', to: 'sw' },
          { from: 'pc2', to: 'sw' },
          { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'net' },
        ],
      },
    },
    options: [
      'PC2\'s MAC address',
      'The MAC address of R1 G0/0/0',
      '0000.0000.0000',
      'FFFF.FFFF.FFFF',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'PC2 is in the **same /24**, so PC1 needs PC2\'s MAC directly and must first send an **ARP request**, a broadcast to FFFF.FFFF.FFFF. PC2\'s MAC is not yet known, the gateway is not used for local destinations, and 0000.0000.0000 is the *target hardware address inside* the ARP payload, not the frame\'s destination MAC.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements about the 127.0.0.0/8 range are true? (Choose two.)',
    options: [
      'Traffic to any address in 127.0.0.0/8 loops back inside the host',
      'A successful ping to 127.0.0.1 confirms that the host\'s TCP/IP stack is working',
      'A successful ping to 127.0.0.1 proves that the NIC and cable are working',
      '127.0.0.0/8 is a usable Class A network for assigning to hosts',
      'Routers forward packets destined to 127.0.0.1 towards their default route',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The whole /8 is **loopback**: packets never leave the host, so a loopback ping only tests the local stack. Because the NIC and cable are never used, it proves nothing about them. The range is reserved (usable Class A stops at 126), and loopback-destined packets are never placed on a network, so routers do not forward them.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'How many usable host addresses does a single classful (unsubnetted) Class B network provide?',
    answers: ['65534', '65,534'],
    placeholder: 'number',
    difficulty: 1,
    explanation: 'A Class B network has 16 host bits: 2^16 = 65,536 combinations, minus the network and broadcast addresses = **65,534** usable hosts. 65,536 forgets the two reserved addresses.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two addresses can be assigned to hosts on the LAN attached to GigabitEthernet0/0/0? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface GigabitEthernet0/0/0
Building configuration...

Current configuration : 101 bytes
!
interface GigabitEthernet0/0/0
 ip address 10.1.1.1 255.255.255.0
 negotiation auto
end`,
    },
    options: ['10.1.1.254', '10.1.1.100', '10.1.1.0', '10.1.1.255', '10.1.1.1', '10.1.2.1'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The LAN is 10.1.1.0/24, so **10.1.1.100** and **10.1.1.254** are free, usable hosts. 10.1.1.0 is the network address, 10.1.1.255 the broadcast, 10.1.1.1 is already R1\'s own address (a duplicate would break connectivity), and 10.1.2.1 belongs to a different subnet.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. A host on a remote network sends a packet addressed to 10.1.1.255. What does R1 do when the packet arrives?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface GigabitEthernet0/0/0
GigabitEthernet0/0/0 is up, line protocol is up
  Internet address is 10.1.1.1/24
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes
  Helper address is not set
  Directed broadcast forwarding is disabled`,
    },
    options: [
      'It sends the packet as an Ethernet broadcast to every host on GigabitEthernet0/0/0',
      'It rewrites the destination to 255.255.255.255 and floods it out all interfaces',
      'It drops the packet instead of broadcasting it onto the 10.1.1.0/24 LAN',
      'It ARPs for 10.1.1.255 and delivers the packet to that host',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      '10.1.1.255 is the **directed broadcast** of 10.1.1.0/24. With directed broadcast forwarding disabled (the IOS default since 12.0, `no ip directed-broadcast`), R1 drops such packets rather than converting them to a LAN broadcast. That conversion would only happen with `ip directed-broadcast`. Routers never flood limited broadcasts, and .255 cannot be a host address in a /24.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 can ping 10.1.1.50 on its own LAN but cannot reach any remote network. R1\'s LAN interface is 10.1.1.1/24. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 10.1.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.1.2.1`,
    },
    options: [
      'The subnet mask must be 255.255.0.0 to reach remote networks',
      'The default gateway is not in PC1\'s subnet',
      'PC1 and R1 have a duplicate IP address',
      'R1 has no route back to 10.1.1.0/24',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'PC1 is in 10.1.1.0/24, but its gateway **10.1.2.1** is in 10.1.2.0/24, so PC1 can never ARP for it; local traffic works while everything remote fails. The gateway must be 10.1.1.1. Widening the mask would misclassify destinations rather than fix anything, there is no duplicate address, and R1 automatically has a connected route to 10.1.1.0/24.',
  },
  {
    id: 'e24',
    type: 'multi',
    stem: 'A packet travels from PC1 through R1 to Server1; no NAT is configured. Which two IPv4 header values are different when the packet leaves R1 compared with when it arrived at R1? (Choose two.)',
    options: ['TTL', 'Header Checksum', 'Source address', 'Destination address', 'Protocol'],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'R1 decrements the **TTL** and, because the header changed, recomputes the **Header Checksum**. The source and destination IP addresses stay the same end to end without NAT, and the Protocol field never changes. The Ethernet MAC addresses do change hop by hop, but they belong to the frame, not to the IPv4 header.',
  },
];
