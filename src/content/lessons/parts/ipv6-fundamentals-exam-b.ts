import type { Question } from '../../types';

export const ipv6FundamentalsExamB: Question[] = [
  {
    id: 'e13',
    type: 'match',
    stem: 'Match each IPv4 header field to its IPv6 counterpart.',
    pairs: [
      { left: 'Time to Live', right: 'Hop Limit' },
      { left: 'Protocol', right: 'Next Header' },
      { left: 'Type of Service', right: 'Traffic Class' },
      { left: 'Total Length', right: 'Payload Length' },
      { left: 'Header Checksum', right: 'No equivalent (removed)' },
    ],
    difficulty: 2,
    explanation:
      'TTL → **Hop Limit**, Protocol → **Next Header**, ToS → **Traffic Class**, Total Length → **Payload Length** (which excludes the fixed 40-byte header). The header checksum was removed entirely; the link-layer FCS and upper-layer checksums detect errors instead.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about the IPv6 header are true? (Choose two.)',
    options: [
      'The base header has a fixed length of 40 bytes',
      'Routers along the path do not fragment IPv6 packets',
      'Each router recalculates a header checksum after decrementing the Hop Limit',
      'The header length varies from 20 to 60 bytes depending on options',
      'The Flow Label field replaces the IPv4 TTL field',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The IPv6 base header is always **40 bytes**, and **only the source** may fragment; a router drops a too-large packet and returns ICMPv6 Packet Too Big. There is no header checksum to recalculate, the 20–60-byte variable length describes IPv4, and Hop Limit (not Flow Label) replaces TTL.',
  },
  {
    id: 'e15',
    type: 'order',
    stem: 'Put the steps for expanding an abbreviated IPv6 address into the correct order.',
    items: [
      'Count the hextets that are written in the address',
      'Subtract that number from 8 to find how many hextets `::` represents',
      'Replace `::` with that many `0000` hextets',
      'Pad every hextet with leading zeros to four hex digits',
      'Confirm the result has 8 hextets and 32 hex digits',
    ],
    difficulty: 2,
    explanation:
      'You must count the written hextets first, because that tells you how many zero hextets the `::` hides (8 minus the count). Insert them where the `::` was, pad every hextet on the **left** to four digits, and finish with the 8-hextet / 32-digit sanity check.',
  },
  {
    id: 'e16',
    type: 'categorize',
    stem: 'Classify each string as a valid or an invalid IPv6 address.',
    categories: ['Valid', 'Invalid'],
    items: [
      { text: '`2001:DB8::1`', category: 0 },
      { text: '`2001:DB8::1::1`', category: 1 },
      { text: '`FE80::1`', category: 0 },
      { text: '`2001:DB8:G::1`', category: 1 },
      { text: '`::`', category: 0 },
      { text: '`2001:0DB8:1:2:3:4:5:6:7`', category: 1 },
      { text: '`2001:db8:acad:1::a`', category: 0 },
      { text: '`2001:DB8:12345::1`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Invalid strings break a hard rule: `::` used twice, the non-hex letter G, nine hextets, and a five-digit hextet (12345). The valid ones include `::` (the unspecified address — all zeros), lowercase hex, and short forms that use a single `::`.',
  },
  {
    id: 'e17',
    type: 'input',
    stem: 'Refer to the exhibit. The site numbers its /64 subnets sequentially, starting with subnet ID 0 for the first LAN. What is the prefix of the 11th LAN? Answer as prefix/length.',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'isp', icon: 'cloud', label: 'ISP', sub: 'assigns 2001:DB8:ACAD::/48', x: 1.4, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'site edge', x: 4.8, y: 2.5, tone: 'accent' },
          { id: 'l1', icon: 'switch', label: 'LAN 1', sub: '2001:DB8:ACAD:0::/64', x: 8.4, y: 0.9 },
          { id: 'l2', icon: 'switch', label: 'LAN 2', sub: '2001:DB8:ACAD:1::/64', x: 8.4, y: 2.5 },
          { id: 'l11', icon: 'switch', label: 'LAN 11', sub: '?', x: 8.4, y: 4.1, tone: 'accent' },
        ],
        links: [
          { from: 'isp', to: 'r1', label: '/48 delegated' },
          { from: 'r1', to: 'l1' },
          { from: 'r1', to: 'l2' },
          { from: 'r1', to: 'l11', style: 'dashed', label: 'LANs 3–10 …' },
        ],
      },
    },
    answers: ['2001:db8:acad:a::/64', '2001:db8:acad:a::', '2001:db8:acad:000a::/64'],
    placeholder: 'prefix/length',
    difficulty: 3,
    explanation:
      'Subnet IDs are hexadecimal. LAN 1 uses 0, so LAN 11 uses subnet ID 10 decimal = **A** hex → **2001:DB8:ACAD:A::/64**. The common mistake is writing `2001:DB8:ACAD:10::/64`, which is subnet ID 0x10 = 16 decimal (the 17th LAN), or `:B::` from forgetting that numbering starts at 0.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. What is the result of these commands?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ipv6 address 2001:db8:acad:1::1/64
R1(config-if)# ipv6 address 2001:db8:acad:99::1/64`,
    },
    options: [
      'G0/0/0 now has both global unicast addresses',
      'The second address replaces the first',
      'The second command is rejected because the interface already has a global address',
      'The second address is stored as a secondary address that must be enabled with the `secondary` keyword',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IPv6 interfaces routinely carry several addresses, so each `ipv6 address` command **adds** one — G0/0/0 now has both, with a C and an L route for each prefix. Replacement is IPv4 behavior (`ip address`), and the `secondary` keyword exists only for IPv4.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A router interface must learn its /64 prefix from the Router Advertisements on the link and build its own global address. Which interface command accomplishes this?',
    options: [
      '`ipv6 address autoconfig`',
      '`ipv6 address dhcp`',
      '`ipv6 enable`',
      '`ipv6 address 2001:db8:acad:1::/64 eui-64`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`ipv6 address autoconfig` performs **SLAAC**: it takes the prefix from received RAs and generates the interface ID itself. `ipv6 address dhcp` makes the interface a DHCPv6 client (the address comes from a server), `ipv6 enable` creates only a link-local address, and the `eui-64` form requires the engineer to type the prefix manually.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Refer to the exhibit. R1 G0/0/1 must use the global address 2001:DB8:ACAD:2::1/64 and the link-local address FE80::1. Which two interface commands are required? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/1: 2001:DB8:ACAD:2::1/64 · FE80::1', x: 2.2, y: 1.7, tone: 'accent' },
          { id: 'sw', icon: 'switch', label: 'SW2', x: 5.4, y: 1.7 },
          { id: 'pc', icon: 'pc', label: 'PC2', sub: 'gateway FE80::1', x: 8.4, y: 1.7 },
        ],
        links: [
          { from: 'r1', to: 'sw', fromLabel: 'G0/0/1', label: '2001:DB8:ACAD:2::/64' },
          { from: 'sw', to: 'pc' },
        ],
      },
    },
    options: [
      '`ipv6 address 2001:db8:acad:2::1/64`',
      '`ipv6 address fe80::1 link-local`',
      '`ipv6 address fe80::1/64`',
      '`ipv6 enable fe80::1`',
      '`ipv6 address 2001:db8:acad:2::/64 eui-64`',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'The static global address is set with `ipv6 address 2001:db8:acad:2::1/64`, and a manual link-local requires the **link-local** keyword with no prefix length: `ipv6 address fe80::1 link-local`. `fe80::1/64` is not how IOS sets a link-local address, `ipv6 enable` takes no address argument, and `eui-64` would generate a MAC-based interface ID instead of ::1.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'Convert the hex value `AC` to 8-bit binary.',
    answers: ['10101100', '1010 1100'],
    placeholder: '8 bits',
    difficulty: 1,
    explanation: 'Convert each hex digit to its nibble: A = 1010 and C = 1100, so `AC` = **1010 1100**.',
  },
  {
    id: 'e22',
    type: 'input',
    stem: 'Convert the binary value `1111 1110 1000 0000` to a four-digit hex hextet.',
    answers: ['fe80', '0xfe80'],
    placeholder: 'xxxx',
    difficulty: 2,
    explanation:
      'Group the bits in fours and convert each nibble: 1111 = F, 1110 = E, 1000 = 8, 0000 = 0 → **FE80**, the first hextet of every link-local address.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 on the G0/0/0 LAN is statically configured with 2001:DB8:ACAD:1::10/64 and default gateway 2001:DB8:ACAD:1::1. PC1 cannot ping its gateway. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::1
    2001:DB8:ACAD:10::1
GigabitEthernet0/0/1   [up/up]
    FE80::1
    2001:DB8:ACAD:2::1`,
    },
    options: [
      'R1 G0/0/0 is addressed in 2001:DB8:ACAD:10::/64, a different subnet from PC1',
      'R1 uses the same link-local address FE80::1 on two interfaces',
      "PC1 must use R1's link-local address as its default gateway",
      'G0/0/0 also needs the `ipv6 enable` command',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 was given `2001:DB8:ACAD:10::1` — subnet ID **0010** — while PC1 lives in subnet 0001, so the gateway address PC1 uses does not exist on the link. Reusing FE80::1 on several interfaces is legal because link-local addresses only need to be unique per link. A global gateway address works when it is on the same /64, and `ipv6 enable` is implied once an address is configured.',
  },
  {
    id: 'e24',
    type: 'single',
    stem: 'Which option is the full expansion of `2001:DB8:0:1::10`?',
    options: [
      '`2001:0DB8:0000:0001:0000:0000:0000:0010`',
      '`2001:0DB8:0000:0001:0000:0000:0000:1000`',
      '`2001:0DB8:0000:0000:0001:0000:0000:0010`',
      '`2001:0DB8:0000:0001:0000:0000:0010:0000`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Five hextets are shown (2001, DB8, 0, 1, 10), so `::` represents three zero hextets placed between `1` and `10`, and `10` is padded on the left to `0010`. Option 2 pads `10` on the wrong side, option 3 puts the zeros in the wrong position, and option 4 moves `0010` away from the end.',
  },
];
