import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which prefix defines the RFC 1918 private range whose addresses begin with 172?',
    options: ['172.16.0.0/12', '172.16.0.0/16', '172.16.0.0/8', '172.0.0.0/12'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**172.16.0.0/12** covers 172.16.0.0 to 172.31.255.255. A /16 would cover only 172.16.x.x, 172.16.0.0/8 is not a valid way to write a /8 (it would be all of 172.x.x.x, mostly public), and 172.0.0.0/12 covers 172.0 to 172.15, which is public space.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Which two addresses are RFC 1918 private addresses? (Choose two.)',
    options: ['172.28.14.1', '10.254.1.1', '172.33.1.1', '192.186.1.1', '100.72.1.1'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**172.28.14.1** is inside 172.16.0.0/12 (second octet 16 to 31) and **10.254.1.1** is inside 10.0.0.0/8. 172.33.1.1 is past 172.31, 192.186.1.1 is not 192.168 (watch for transposed digits), and 100.72.1.1 is in the 100.64.0.0/10 shared space, which is not RFC 1918.',
  },
  {
    id: 'e3',
    type: 'categorize',
    stem: 'Drag each address into the correct category.',
    categories: ['RFC 1918 private', 'Public'],
    items: [
      { text: '10.0.0.1', category: 0 },
      { text: '172.16.255.254', category: 0 },
      { text: '192.168.0.1', category: 0 },
      { text: '172.31.1.1', category: 0 },
      { text: '172.15.255.1', category: 1 },
      { text: '192.167.1.1', category: 1 },
      { text: '11.1.1.1', category: 1 },
      { text: '172.32.0.1', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Private: anything in 10.0.0.0/8, 172.16.0.0 to 172.31.255.255 or 192.168.0.0/16, so 10.0.0.1, 172.16.255.254, 192.168.0.1 and 172.31.1.1. Public: 172.15.255.1 and 172.32.0.1 sit just outside the /12, 192.167.1.1 is not 192.168, and 11.1.1.1 is not 10.',
  },
  {
    id: 'e4',
    type: 'input',
    stem: 'How many IPv4 addresses does the 172.16.0.0/12 private block contain? (Enter the number.)',
    answers: ['1048576', '1,048,576', '2^20'],
    placeholder: 'number',
    difficulty: 2,
    explanation:
      'A /12 leaves 32 - 12 = 20 host bits, so the block holds 2^20 = **1,048,576** addresses: 16 classful class B networks of 65,536 addresses each.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 can ping R1 G0/0/1, and R1 has a default route to the ISP, but PC1 cannot load pages from the web server. What is the most likely cause?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '192.168.10.25', x: 1, y: 2 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/1 203.0.113.6/30', x: 3.8, y: 2 },
          { id: 'net', icon: 'internet', label: 'ISP / Internet', x: 6.5, y: 2 },
          { id: 'srv', icon: 'server', label: 'Web server', sub: '198.51.100.80', x: 9, y: 2 },
        ],
        links: [
          { from: 'pc', to: 'r1', label: '192.168.10.0/24', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'net', fromLabel: 'G0/0/1' },
          { from: 'net', to: 'srv' },
        ],
      },
    },
    options: [
      "R1 is not translating PC1's private address, so replies from the Internet cannot return",
      'The web server uses a private address that the Internet cannot route',
      'PC1 needs a public address as its default gateway',
      'The /30 on the WAN link leaves no address available for NAT',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "PC1's packets leave R1 with the private source 192.168.10.25. Internet routers have no route back to RFC 1918 space, and ISPs usually filter it, so the replies never return; configuring **NAT/PAT** on R1 fixes this. 198.51.100.80 is a public-style documentation address, not a private one; hosts always use their local router as the gateway, whatever the addressing; and PAT can translate to R1's own /30 interface address.",
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. The user of this PC cannot reach any network resources. What should the engineer investigate first?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> ipconfig

Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::9a1c:4e2b:7d10:c3a5%7
   Autoconfiguration IPv4 Address. . : 169.254.12.34
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :`,
    },
    options: [
      'Why the PC did not receive a lease from a DHCP server',
      'The NAT configuration on the Internet edge router',
      'The static IPv4 address that the user typed on the PC',
      'The carrier-grade NAT configuration at the ISP',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "An **Autoconfiguration** address from 169.254.0.0/16 with no default gateway is APIPA: the PC asked for DHCP and got no answer. Check the DHCP server, the relay (`ip helper-address`) and the access port's VLAN. NAT problems never change a host's own address, APIPA addresses are self-assigned rather than typed, and the ISP's CGN has nothing to do with LAN addressing.",
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each IPv4 block to its purpose.',
    pairs: [
      { left: '`100.64.0.0/10`', right: 'Shared space for carrier-grade NAT' },
      { left: '`169.254.0.0/16`', right: 'Link-local (APIPA)' },
      { left: '`127.0.0.0/8`', right: 'Loopback' },
      { left: '`198.51.100.0/24`', right: 'Documentation' },
      { left: '`198.18.0.0/15`', right: 'Benchmarking' },
      { left: '`224.0.0.0/4`', right: 'Multicast' },
    ],
    difficulty: 2,
    explanation:
      '100.64.0.0/10 is RFC 6598 shared space, 169.254.0.0/16 is link-local, 127.0.0.0/8 is loopback, 198.51.100.0/24 is TEST-NET-2 for documentation, 198.18.0.0/15 is for benchmarking and 224.0.0.0/4 is class D multicast.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. The ISP assigned the address on G0/0/1 by DHCP. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `HOME-R# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   192.168.1.1     YES manual up                    up
GigabitEthernet0/0/1   100.72.19.4     YES DHCP   up                    up`,
    },
    options: [
      'The ISP uses carrier-grade NAT, so traffic is translated again before it reaches the Internet',
      'The WAN address is RFC 1918 private space',
      'The WAN address is a public address reachable from anywhere on the Internet',
      'The WAN address comes from a documentation range and cannot pass traffic',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "100.72.19.4 falls inside **100.64.0.0/10** (second octet 64 to 127), the RFC 6598 shared address space for **carrier-grade NAT**. It is neither RFC 1918 private space nor publicly routable, so the ISP translates the traffic again, after the home router's own NAT, before it reaches the Internet. It is not a documentation address either.",
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Which organization allocates blocks of IPv4 addresses to the Regional Internet Registries?',
    options: ['IANA', 'ARIN', 'IEEE', 'IETF'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**IANA** manages the global pool and allocates to the five RIRs. ARIN is one of those RIRs, the IEEE defines LAN standards such as 802.3, and the IETF writes RFCs, including RFC 1918, but does not allocate addresses.',
  },
  {
    id: 'e10',
    type: 'order',
    stem: 'Order the entities from the one that manages the global IPv4 pool to the one that finally uses an address.',
    items: ['IANA', 'Regional Internet Registry', 'ISP or local Internet registry', 'Customer organization', 'Host interface'],
    difficulty: 2,
    explanation:
      'Addresses flow down the hierarchy: IANA to an RIR, the RIR to an ISP or local Internet registry, the ISP to a customer organization, which finally assigns an address to a host interface.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
tcp  198.51.100.9:50311    10.20.1.15:50311      203.0.113.25:443      203.0.113.25:443
tcp  198.51.100.9:61022    10.20.1.16:61022      203.0.113.25:443      203.0.113.25:443
udp  198.51.100.9:52004    10.20.2.40:52004      192.0.2.53:53         192.0.2.53:53`,
    },
    options: [
      'Three hosts with private addresses share the public address 198.51.100.9 using PAT',
      'The inside hosts use addresses from 198.51.100.0/24 on the internal LAN',
      'The outside servers use RFC 1918 private addresses',
      'Each inside host has its own dedicated public address through static NAT',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The inside local column shows private 10.20.x.x hosts, and all three map to one inside global address, **198.51.100.9**, with different ports: that is **PAT** (NAT overload). The public address exists only after translation, the outside servers use public-style (documentation) addresses, and static NAT would show a different inside global address for each host.',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Refer to the exhibit. Two companies merge and must connect their internal networks. Which two approaches allow hosts in both companies to communicate? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'a', icon: 'cloud', label: 'Company A', sub: '10.0.0.0/16 + 172.16.0.0/16', x: 1.4, y: 2 },
          { id: 'ra', icon: 'router', label: 'A-EDGE', x: 3.9, y: 2 },
          { id: 'rb', icon: 'router', label: 'B-EDGE', x: 6.1, y: 2 },
          { id: 'b', icon: 'cloud', label: 'Company B', sub: '10.0.0.0/16 + 192.168.0.0/16', x: 8.6, y: 2 },
        ],
        links: [
          { from: 'a', to: 'ra' },
          { from: 'ra', to: 'rb', label: 'new link', tone: 'accent' },
          { from: 'rb', to: 'b' },
        ],
      },
    },
    options: [
      "Renumber one company's 10.0.0.0/16 networks into an unused private range",
      "Translate one company's overlapping addresses with NAT at the interconnection",
      'Route both 10.0.0.0/16 networks and let longest prefix match choose',
      'Number the link between the edge routers from public address space so the overlap no longer matters',
      'Advertise both 10.0.0.0/16 networks to the Internet so each side can reach the other',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      "Both companies use 10.0.0.0/16, so a destination such as 10.0.5.9 is ambiguous. Either **renumber** one side into an unused private range, or **translate** one side with NAT so its addresses appear as a unique range. Two identical prefixes give longest match nothing to choose between, addressing the link between the edge routers does not make the hosts' addresses unique, and private networks must never be advertised to the Internet.",
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two addresses can an organization use on its internal networks without registering them with any authority? (Choose two.)',
    options: ['172.24.10.1', '10.99.0.1', '172.40.10.1', '198.51.100.10', '100.64.10.1'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**172.24.10.1** (inside 172.16.0.0/12) and **10.99.0.1** (inside 10.0.0.0/8) are RFC 1918 addresses that anyone may use internally. 172.40.10.1 is public space that belongs to someone else, 198.51.100.10 is reserved for documentation, and 100.64.10.1 is shared space intended for ISPs running carrier-grade NAT.',
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'What is the last address in the shared address space 100.64.0.0/10? (Dotted decimal.)',
    answers: ['100.127.255.255'],
    placeholder: 'a.b.c.d',
    difficulty: 3,
    explanation:
      'A /10 fixes the first 2 bits of the second octet, giving a block size of 64: the range is 100.64.0.0 through **100.127.255.255**, and the next block starts at 100.128.0.0.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'An engineer plans a private addressing scheme for 180 sites. Each site receives its own /16 and will use up to 60 /24 subnets. Which private block supports this plan?',
    options: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10'],
    answer: 0,
    difficulty: 3,
    explanation:
      'The plan needs 180 separate /16 blocks. **10.0.0.0/8** contains 256 of them (10.0.0.0/16 to 10.255.0.0/16), each with 256 /24 subnets. 172.16.0.0/12 contains only 16 /16 blocks, 192.168.0.0/16 is a single /16, and 100.64.0.0/10 is reserved for ISPs rather than enterprise use.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Which IPv4 address does a host ping to test its own TCP/IP stack without sending any traffic onto the network? (Give the standard address.)',
    answers: ['127.0.0.1'],
    placeholder: 'a.b.c.d',
    difficulty: 1,
    explanation:
      'The standard loopback address **127.0.0.1** (any address in 127.0.0.0/8 behaves the same) is handled entirely inside the host, so a reply proves the local stack works without testing the NIC or the network.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. What is the purpose of access list 10 as it is applied?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists
Standard IP access list 10
    10 deny   10.0.0.0, wildcard bits 0.255.255.255
    20 deny   172.16.0.0, wildcard bits 0.15.255.255
    30 deny   192.168.0.0, wildcard bits 0.0.255.255
    40 permit any
R1# show running-config interface GigabitEthernet0/0/1 | begin interface
interface GigabitEthernet0/0/1
 description Link to ISP
 ip address 203.0.113.6 255.255.255.252
 ip access-group 10 in
end`,
    },
    options: [
      'It drops packets arriving from the Internet with RFC 1918 source addresses',
      'It prevents inside hosts with private addresses from reaching the Internet',
      'It blocks all traffic from the Internet to the internal networks',
      'It translates private source addresses to the address of G0/0/1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "A standard ACL matches **source** addresses, and its three deny entries cover exactly the RFC 1918 blocks (0.15.255.255 is the wildcard for a /12). Applied **inbound** on the ISP-facing interface, it drops spoofed or misrouted packets that claim private sources, a form of bogon filtering. It does not touch traffic leaving the network, entry 40 still permits packets from public sources, and translation is NAT's job, not an ACL's.",
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Which wildcard mask matches the entire 172.16.0.0/12 private block in an ACL?',
    answers: ['0.15.255.255'],
    placeholder: 'w.x.y.z',
    difficulty: 2,
    explanation:
      'The /12 subnet mask is 255.240.0.0; subtracting each octet from 255 gives the wildcard **0.15.255.255**, which lets the second octet vary from 16 to 31.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two interfaces are configured with RFC 1918 private addresses? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   172.31.254.1    YES manual up                    up
GigabitEthernet0/0/1   203.0.113.10    YES manual up                    up
GigabitEthernet0/1/0   192.168.100.1   YES manual up                    up
Loopback0              172.32.0.1      YES manual up                    up`,
    },
    options: ['GigabitEthernet0/0/0', 'GigabitEthernet0/1/0', 'GigabitEthernet0/0/1', 'Loopback0'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '172.31.254.1 is inside 172.16.0.0/12 and 192.168.100.1 is inside 192.168.0.0/16, so **G0/0/0** and **G0/1/0** use private addresses. 203.0.113.10 on G0/0/1 is a documentation address standing in for a public ISP address, and Loopback0 uses 172.32.0.1, just past the private /12 and therefore public.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Which block is reserved for documentation and examples?',
    options: ['198.51.100.0/24', '198.18.0.0/15', '100.64.0.0/10', '169.254.0.0/16'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**198.51.100.0/24** (TEST-NET-2) is one of the three documentation ranges, along with 192.0.2.0/24 and 203.0.113.0/24. 198.18.0.0/15 is for benchmarking, 100.64.0.0/10 is shared CGN space and 169.254.0.0/16 is link-local.',
  },
];
