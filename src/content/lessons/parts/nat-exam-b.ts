import type { Question } from '../../types';

export const natExamB: Question[] = [
  {
    id: 'e12',
    type: 'single',
    stem: 'An engineer needs a NAT pool named WEB-USERS containing 203.0.113.65 through 203.0.113.70 from the 203.0.113.64/29 block. Which command is correct?',
    options: [
      '`ip nat pool WEB-USERS 203.0.113.65 203.0.113.70 prefix-length 29`',
      '`ip nat pool WEB-USERS 203.0.113.65 203.0.113.70 255.255.255.248`',
      '`ip nat pool WEB-USERS 203.0.113.64 0.0.0.7`',
      '`ip nat inside source pool WEB-USERS 203.0.113.65 203.0.113.70`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The syntax is `ip nat pool <name> <start> <end> {netmask <mask> | prefix-length <len>}`, so **prefix-length 29** is correct (netmask 255.255.255.248 would also work if the `netmask` keyword were present). The pool written with a bare 255.255.255.248 omits the `netmask` keyword, `203.0.113.64 0.0.0.7` uses a network and wildcard instead of a start and end address, and `ip nat inside source` binds an ACL to a pool rather than defining one.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'R1 performs PAT for 10.1.1.0/24 using its outside interface address, 198.51.100.2. An engineer applies an extended ACL **outbound** on the outside interface G0/0/1 to permit only web traffic from the LAN. Which source address must the ACL entries match?',
    options: [
      '198.51.100.2, the inside global address',
      '10.1.1.0/24, the inside local addresses',
      'The outside global address of each web server',
      'Any address, because NAT traffic bypasses interface ACLs',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'For inside-to-outside traffic IOS routes, **translates**, and only then checks the outbound ACL on the outside interface, so the ACL sees the translated source **198.51.100.2**. An ACL matching 10.1.1.0/24 would match nothing there (it would work inbound on the inside interface instead). Web servers appear as destinations, not sources, and NAT does not bypass ACLs.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Only inside source NAT is configured on R1. Which statement about the outside local address of an Internet server is true?',
    options: [
      'It is identical to the server’s outside global address',
      'It is a private address that R1 assigns to the server',
      'It is the same as the inside host’s inside global address',
      'It is the address configured on R1’s outside interface',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The outside local address is how inside hosts see the outside host. Without outside NAT, R1 never changes the server’s address, so outside local **equals outside global**. Private or interface addresses would only appear if R1 translated outside addresses, and the inside global describes the inside host, not the server.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Access list 1 already permits 10.1.1.0/24. Which three additional commands are required so that those hosts use PAT with the address of G0/0/1, the ISP-facing interface? (Choose three.)',
    options: [
      '`ip nat inside` under GigabitEthernet0/0/0 (LAN)',
      '`ip nat outside` under GigabitEthernet0/0/1 (ISP)',
      '`ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`',
      '`ip nat pool PAT 198.51.100.2 198.51.100.2 prefix-length 30`',
      '`ip nat outside source list 1 interface GigabitEthernet0/0/0`',
      '`ip nat inside` under GigabitEthernet0/0/1 (ISP)',
    ],
    answers: [0, 1, 2],
    difficulty: 2,
    explanation:
      'PAT needs the LAN interface marked **inside**, the ISP interface marked **outside**, and the binding `ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`. A pool is unnecessary when the interface address is overloaded, `ip nat outside source` translates outside hosts, and marking the ISP interface as inside would break the configuration.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# debug ip nat
IP NAT debugging is on
NAT: s=10.1.1.40->203.0.113.21, d=192.0.2.80 [18422]
NAT*: s=192.0.2.80, d=203.0.113.21->10.1.1.40 [5530]`,
    },
    options: [
      '10.1.1.40 is an inside local address and 203.0.113.21 is its inside global address',
      '203.0.113.21 is the outside global address of the web server that was contacted',
      'R1 translates the destination address of outbound packets to 203.0.113.21',
      'The asterisk means the reply packet was dropped after the translation failed',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The first line shows an outbound packet whose **source** changed from 10.1.1.40 (inside local) to 203.0.113.21 (inside global); the second shows the reply whose **destination** is changed back. 192.0.2.80 is the server (outside global), outbound packets keep their destination, and the asterisk marks a fast-path translation, not a drop.',
  },
  {
    id: 'e17',
    type: 'input',
    stem: 'Which interface configuration command identifies the ISP-facing interface as the NAT outside interface?',
    answers: ['ip nat outside'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip nat outside` marks the interface facing the ISP; `ip nat inside` marks interfaces facing the private network. Both roles must be set before IOS performs any inside source translation.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'The internal web server 10.1.1.10 must be reachable from the Internet at 203.0.113.10. Which command accomplishes this?',
    options: [
      '`ip nat inside source static 10.1.1.10 203.0.113.10`',
      '`ip nat inside source static 203.0.113.10 10.1.1.10`',
      '`ip nat outside source static 10.1.1.10 203.0.113.10`',
      '`ip nat inside source list 1 pool WEB overload`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Static inside source NAT lists the **inside local first and the inside global second**: `ip nat inside source static 10.1.1.10 203.0.113.10`. The reversed version would map a nonexistent inside host 203.0.113.10 to 10.1.1.10, `ip nat outside source` translates outside hosts, and PAT with a pool cannot accept unsolicited inbound connections to the server.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. R1 is configured with `ip nat inside source static 10.1.1.10 203.0.113.10`. A capture is taken on the link between R1 and the ISP. Which addresses are in a packet returning from the server to PC1?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.4,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.1.10', x: 1, y: 1.7 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'static NAT', x: 3.8, y: 1.7, tone: 'accent' },
          { id: 'isp', icon: 'router', label: 'ISP', x: 6.4, y: 1.7 },
          { id: 'srv', icon: 'server', label: 'Server', sub: '192.0.2.80', x: 9, y: 1.7 },
        ],
        links: [
          { from: 'pc', to: 'r1', toLabel: 'G0/0/0 inside' },
          { from: 'r1', to: 'isp', label: 'capture here', fromLabel: 'G0/0/1 outside', tone: 'accent' },
          { from: 'isp', to: 'srv' },
        ],
      },
    },
    options: [
      'Source 192.0.2.80, destination 203.0.113.10',
      'Source 192.0.2.80, destination 10.1.1.10',
      'Source 203.0.113.10, destination 192.0.2.80',
      'Source 198.51.100.2, destination 192.0.2.80',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'On the outside link the server replies to the only address it knows for PC1, the inside global **203.0.113.10**, from its own address 192.0.2.80. R1 rewrites the destination to 10.1.1.10 only after the packet arrives on the outside interface, so the private address never appears on the ISP link. Source 203.0.113.10 with destination 192.0.2.80 is the outbound request direction, and an address taken from the interface is not used because static NAT maps PC1 to 203.0.113.10.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'Which show command displays NAT pool usage, including total and allocated addresses and allocation misses?',
    answers: ['show ip nat statistics', 'sh ip nat statistics', 'show ip nat stat', 'sh ip nat stat'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`show ip nat statistics` lists the inside/outside interfaces, hits and misses, and for each pool the total addresses, the allocated count and percentage, and the misses. `show ip nat translations` lists individual entries but not pool utilization.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. PAT is configured correctly on R1 (G0/0/0 inside, G0/0/1 outside, ACL 1 permits the LAN), but users cannot browse the Internet and the translation table stays empty. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route
Codes: L - local, C - connected, S - static, R - RIP, O - OSPF
<output omitted>

Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0/0
      198.51.100.0/24 is variably subnetted, 2 subnets, 2 masks
C        198.51.100.0/30 is directly connected, GigabitEthernet0/0/1
L        198.51.100.2/32 is directly connected, GigabitEthernet0/0/1`,
    },
    options: [
      'R1 has no default route, so packets are dropped before NAT translates them',
      'PAT cannot use an interface address that is learned from a connected route',
      'The ISP link needs a /29 to support PAT',
      'NAT entries are hidden until `debug ip nat` is enabled',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '“Gateway of last resort is not set” — R1 has no route to Internet destinations. Inside-to-outside packets are **routed before they are translated**, so with no route they are dropped and no translation is ever created. Adding `ip route 0.0.0.0 0.0.0.0 198.51.100.1` fixes it. The interface address and /30 are fine for PAT, and translations appear in the table without any debugging.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
---  203.0.113.10          10.1.1.10             ---                   ---
tcp  198.51.100.2:61001    10.1.1.25:61001       192.0.2.80:80         192.0.2.80:80
tcp  198.51.100.2:61002    10.1.1.26:61002       192.0.2.80:80         192.0.2.80:80
Total number of translations: 3`,
    },
    options: [
      'Host 10.1.1.10 is reachable from the Internet at 203.0.113.10',
      'Hosts 10.1.1.25 and 10.1.1.26 share inside global address 198.51.100.2',
      '192.0.2.80 is an inside global address',
      'R1 is translating the address of the web server with outside NAT',
      'The entry for 10.1.1.10 will be removed after 24 hours of inactivity',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'The address-only entry for 10.1.1.10 is a **static** mapping, so the host is reachable at 203.0.113.10 and the entry never times out. The two tcp entries show PAT: **both hosts share 198.51.100.2**, distinguished by port. 192.0.2.80 appears in the outside columns (it is the web server), and because outside local equals outside global there is no outside NAT.',
  },
];
