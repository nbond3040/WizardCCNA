import type { Question } from '../../types';

export const ipv6FundamentalsExamA: Question[] = [
  {
    id: 'e1',
    type: 'input',
    stem: 'Apply the standard abbreviation rules (drop leading zeros; on a tie, compress the leftmost run). How is `2001:0DB8:0000:0000:00A0:0000:0000:0001` written?',
    answers: ['2001:db8::a0:0:0:1'],
    placeholder: '2001:...',
    difficulty: 2,
    explanation:
      'After dropping leading zeros the address is 2001:DB8:0:0:A0:0:0:1. There are two zero runs of equal length (hextets 3–4 and 6–7), so the **leftmost** one becomes `::` → **2001:DB8::A0:0:0:1**. Note that `00A0` keeps its trailing zero (`A0`, not `A`). `2001:DB8:0:0:A0::1` is also a legal string but not the canonical form, and using `::` twice is never allowed.',
  },
  {
    id: 'e2',
    type: 'input',
    stem: 'Abbreviate `2001:0000:0000:00A1:0000:0000:0000:0001` as far as possible.',
    answers: ['2001:0:0:a1::1'],
    placeholder: '2001:...',
    difficulty: 2,
    explanation:
      'The address has a run of two zero hextets (positions 2–3) and a run of three (positions 5–7). The **longest** run gets the `::` even though it is further right, and the shorter run is written `0:0` → **2001:0:0:A1::1**. Compressing the first run instead (`2001::A1:0:0:0:1`) is longer and not canonical.',
  },
  {
    id: 'e3',
    type: 'input',
    stem: 'Write the link-local address `FE80:0000:0000:0000:0213:19FF:FE7A:0B01` in its shortest form.',
    answers: ['fe80::213:19ff:fe7a:b01'],
    placeholder: 'FE80::...',
    difficulty: 1,
    explanation:
      'Hextets 2–4 are all zero and collapse into `::`. Leading zeros are removed from `0213` and `0B01` → **FE80::213:19FF:FE7A:B01**. `19FF` and `FE7A` have no leading zeros, so they are unchanged.',
  },
  {
    id: 'e4',
    type: 'input',
    stem: 'Expand `2001:DB8:A::B0:C` to its full 32-digit form.',
    answers: ['2001:0db8:000a:0000:0000:0000:00b0:000c'],
    placeholder: 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx',
    difficulty: 2,
    explanation:
      'Five hextets are shown, so `::` represents 8 − 5 = 3 zero hextets. Pad each shown hextet with **leading** zeros: **2001:0DB8:000A:0000:0000:0000:00B0:000C**. Writing `B0` as `B000` or `A` as `A000` pads on the wrong side and produces a different address.',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'A host uses `2001:DB8:ACAD:1234:5678::1/56`. What is its /56 prefix? Answer as prefix/length.',
    answers: ['2001:db8:acad:1200::/56', '2001:db8:acad:1200::', '2001:0db8:acad:1200:0000:0000:0000:0000/56'],
    placeholder: 'prefix/length',
    difficulty: 3,
    explanation:
      '/56 = 48 bits (three hextets) + 8 bits (the first two hex digits of hextet 4). Keep `2001:DB8:ACAD` and `12` from `1234`, then zero everything after → **2001:DB8:ACAD:1200::/56**. `2001:DB8:ACAD:1234::/56` is wrong because host bits (34) are left set, and `2001:DB8:ACAD::/56` zeros bits that belong to the prefix.',
  },
  {
    id: 'e6',
    type: 'input',
    stem: 'Refer to the exhibit. Which prefix will R1 install as the connected (C) route for G0/0/1? Answer as prefix/length.',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface GigabitEthernet0/0/1
Building configuration...

Current configuration : 118 bytes
!
interface GigabitEthernet0/0/1
 no ip address
 negotiation auto
 ipv6 address 2001:DB8:1:AF::1/62
end`,
    },
    answers: ['2001:db8:1:ac::/62', '2001:0db8:0001:00ac:0000:0000:0000:0000/62'],
    placeholder: 'prefix/length',
    difficulty: 3,
    explanation:
      '/62 = 48 + 14 bits, so the boundary cuts through the last hex digit of the fourth hextet `00AF`. The digits `00A` are kept (12 bits); the last digit F = 1111 keeps its first two bits (11) and zeros the last two, giving 1100 = C. The connected route is **2001:DB8:1:AC::/62**. Answers such as `2001:DB8:1:AF::/62` keep host bits, and `2001:DB8:1:A0::/62` zeros too much.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Which option is the shortest valid representation of `2001:0DB8:0000:0000:0000:0000:0000:0100`?',
    options: ['`2001:DB8::1`', '`2001:DB8::100`', '`2001:DB8:0:0::100`', '`2001:DB8::1:0`'],
    answer: 1,
    difficulty: 1,
    explanation:
      '`0100` loses only its **leading** zero and becomes `100`, and the five zero hextets become `::` → **2001:DB8::100**. `2001:DB8::1` wrongly drops trailing zeros (it means ...:0001). `2001:DB8:0:0::100` is legal but not the shortest. `2001:DB8::1:0` expands to ...:0001:0000, a different address.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two strings are valid representations of `2001:0DB8:0000:0000:0001:0000:0000:0001`? (Choose two.)',
    options: ['`2001:DB8::1::1`', '`2001:DB8::1:0:0:1`', '`2001:DB8:0:0:1::1`', '`2001:DB8:0:1::1`', '`2001:DB8::1:1`'],
    answers: [1, 2],
    difficulty: 2,
    explanation:
      '`2001:DB8::1:0:0:1` compresses the first zero run (the canonical form) and `2001:DB8:0:0:1::1` compresses the second — both expand to the original. `2001:DB8::1::1` uses `::` twice and is invalid. `2001:DB8:0:1::1` expands to 2001:0DB8:0000:0001:0000:0000:0000:0001, and `2001:DB8::1:1` expands to 2001:0DB8:0000:0000:0000:0000:0001:0001 — both different addresses.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about R2 is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::5E71:DFF:FEA2:3B10
    2001:DB8:ACAD:2:5E71:DFF:FEA2:3B10
GigabitEthernet0/0/1   [up/up]
    FE80::5E71:DFF:FEA2:3B11
Serial0/1/0            [administratively down/down]
    unassigned`,
    },
    options: [
      'G0/0/1 is IPv6-enabled with only a link-local address, as the `ipv6 enable` command produces',
      'G0/0/1 is not running IPv6 because it has no global unicast address',
      'G0/0/0 was configured with the static address `2001:db8:acad:2::1/64`',
      'Both link-local addresses were configured manually with the `link-local` keyword',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'G0/0/1 lists a link-local address and nothing else, which is exactly what `ipv6 enable` creates — the interface **is** running IPv6 (an interface without IPv6 shows `unassigned`, like Serial0/1/0). G0/0/0 has an EUI-64-style interface ID (`5E71:DFF:FEA2:3B10`), not `::1`. The link-local addresses carry the FFFE marker of automatic EUI-64 generation, so they were not typed manually.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which interface command created the global unicast address?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ipv6 interface GigabitEthernet0/0/1
GigabitEthernet0/0/1 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::7210:5CFF:FE3E:9A01
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:DB8:ACAD:2:7210:5CFF:FE3E:9A01, subnet is 2001:DB8:ACAD:2::/64 [EUI]
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF3E:9A01
  MTU is 1500 bytes`,
    },
    options: [
      '`ipv6 address 2001:db8:acad:2::/64 eui-64`',
      '`ipv6 address autoconfig`',
      '`ipv6 enable`',
      '`ipv6 address fe80::7210:5cff:fe3e:9a01 link-local`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `[EUI]` tag marks an address whose interface ID IOS built with modified EUI-64 from a prefix the engineer typed with the **eui-64** keyword. `ipv6 enable` creates no global address, the `link-local` command sets only the link-local, and an address learned with `autoconfig` is shown with the lifetimes learned from the Router Advertisement rather than a plain `[EUI]` tag.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts on both LANs are statically addressed and use R1 as their gateway, but they cannot reach each other, and SLAAC hosts receive no global address. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ipv6
 ipv6 address 2001:DB8:ACAD:1::1/64
 ipv6 address 2001:DB8:ACAD:2::1/64
R1# show ipv6 interface GigabitEthernet0/0/0 | include FF02
    FF02::1
    FF02::1:FF00:1`,
    },
    options: [
      '`ipv6 unicast-routing` is not configured on R1',
      'The interfaces also need the `ipv6 enable` command',
      'R1 needs manually configured link-local addresses on both interfaces',
      'Both LANs are inside the same /48, so R1 cannot route between them',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The running-config contains no `ipv6 unicast-routing` line, and the interface has not joined **FF02::2** (all routers). Without IPv6 routing enabled, R1 does not forward IPv6 between interfaces or send Router Advertisements, so SLAAC fails too. `ipv6 enable` is implied by configuring an address, automatic link-local addresses already exist, and different /64s inside one /48 are routed normally.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Which IPv6 header field serves the same purpose as the IPv4 Time to Live field?',
    options: ['Hop Limit', 'Flow Label', 'Next Header', 'Traffic Class'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Hop Limit** is decremented by every router, and the packet is discarded at 0 — the same loop-protection role as TTL. Flow Label tags flows, Next Header replaces the Protocol field and Traffic Class replaces ToS.',
  },
];
