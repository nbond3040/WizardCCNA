import type { Slide } from '../../types';

/** ipv6-fundamentals — slides 1–11: why IPv6, hex, abbreviation, expansion, prefixes. */
export const ipv6FundamentalsSlidesA: Slide[] = [
  {
    kind: 'title',
    title: 'IPv6 Addressing Fundamentals',
    subtitle: 'Hex notation, abbreviation, prefixes, the IPv6 header and IOS configuration',
    notes:
      "IPv6 is not a patch on IPv4. It is a new Layer 3 protocol with a 128-bit address, a leaner header and its own ways to hand out addresses. In this deck you will learn to read and write IPv6 addresses fluently: converting hex to binary, **shortening** addresses with the two abbreviation rules, **expanding** them back to the full 32-digit form, and finding the prefix of any address. Then you will compare the IPv6 header with IPv4, configure addresses on a Cisco router in five different ways, and verify the result with `show ipv6 interface brief`, `show ipv6 interface` and `show ipv6 route`. Both exam versions test this material (v1.1 topic 1.8 and v2.0 domain 1). Expect to be shown an address and asked for its correct short form, its full form or its prefix — so practice until the rules are automatic.",
  },
  {
    kind: 'bullets',
    title: 'Why IPv6?',
    bullets: [
      'IPv4 has 32 bits: about **4.3 billion** addresses — far too few',
      "IANA's free IPv4 pool ran out in **2011**; the RIRs followed",
      'NAT and carrier-grade NAT stretch IPv4 but break end-to-end reachability',
      'IPv6 has **128 bits**: about 3.4 × 10^38 addresses',
      'Simpler fixed header, **no broadcasts**, built-in autoconfiguration (SLAAC)',
      'Migration is gradual: **dual stack** runs IPv4 and IPv6 side by side',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'v4', label: 'IPv4', sub: '32 bits · 4.3 billion', shape: 'pill' },
        { id: 'ex', label: 'Pool exhausted', sub: 'IANA 2011', tone: 'bad' },
        { id: 'nat', label: 'NAT / CGNAT', sub: 'workarounds', tone: 'muted' },
        { id: 'v6', label: 'IPv6', sub: '128 bits · 3.4 × 10^38', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "IPv4's 32-bit space gives roughly 4.3 billion addresses, and a large share of them are reserved for private use, multicast and other special purposes. In February 2011 IANA handed its last blocks of IPv4 to the five Regional Internet Registries (RIRs), and the RIRs exhausted their own pools over the following years. The industry survived by using **NAT** and **carrier-grade NAT (CGNAT)**, which let many devices share one public address — but NAT breaks the original end-to-end model, complicates peer-to-peer applications and adds state to every translation device. IPv6 solves the problem with a **128-bit** address: 2^128 is about 3.4 × 10^38 addresses, enough to give every LAN a /64 with 18 quintillion addresses. IPv6 also cleans up the protocol: a fixed 40-byte header, no broadcasts (multicast replaces them) and **SLAAC**, which lets hosts build their own addresses. Networks do not switch overnight; most run **dual stack**, where interfaces carry both IPv4 and IPv6 addresses at the same time.",
  },
  {
    kind: 'diagram',
    title: '128 bits written as 8 hextets',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: '2001', size: 16, sub: 'hextet 1' },
        { label: '0DB8', size: 16, sub: 'hextet 2' },
        { label: 'ACAD', size: 16, sub: 'hextet 3' },
        { label: '0001', size: 16, sub: 'hextet 4' },
        { label: '0000', size: 16, sub: 'hextet 5', tone: 'muted' },
        { label: '0000', size: 16, sub: 'hextet 6', tone: 'muted' },
        { label: '0000', size: 16, sub: 'hextet 7', tone: 'muted' },
        { label: '0001', size: 16, sub: 'hextet 8' },
      ],
    },
    caption: 'Full form: 2001:0DB8:ACAD:0001:0000:0000:0000:0001 — 8 × 16 bits = 128 bits',
    bullets: [
      'One hex digit = **4 bits**; four digits = one **hextet** = 16 bits',
      'Colons separate the 8 hextets; hex is **case-insensitive**',
      'Full form = 32 hex digits and 7 colons',
    ],
    notes:
      "Writing 128 bits in binary would be unreadable, so IPv6 uses **hexadecimal**. Each hex digit represents exactly 4 bits, so the address is 32 hex digits long. The digits are grouped four at a time into eight 16-bit groups separated by colons. Cisco and most textbooks call each group a **hextet** (you will also see 'quartet' or simply 'field'). Letters A–F may be written in upper or lower case — `2001:db8::1` and `2001:DB8::1` are the same address. RFC 5952 recommends lowercase for documentation, while Cisco IOS displays addresses in uppercase; the exam accepts both. A quick sanity check that saves points: a fully written IPv6 address always has **exactly 8 hextets, 32 hex digits and 7 colons**. If you count 9 hextets or a hextet with 5 digits, the address is invalid no matter what else it looks like.",
  },
  {
    kind: 'table',
    title: 'Hex ↔ binary: one digit, four bits',
    columns: ['Hex', 'Dec', 'Binary', 'Hex', 'Dec', 'Binary'],
    rows: [
      ['`0`', '0', '`0000`', '`8`', '8', '`1000`'],
      ['`1`', '1', '`0001`', '`9`', '9', '`1001`'],
      ['`2`', '2', '`0010`', '`A`', '10', '`1010`'],
      ['`3`', '3', '`0011`', '`B`', '11', '`1011`'],
      ['`4`', '4', '`0100`', '`C`', '12', '`1100`'],
      ['`5`', '5', '`0101`', '`D`', '13', '`1101`'],
      ['`6`', '6', '`0110`', '`E`', '14', '`1110`'],
      ['`7`', '7', '`0111`', '`F`', '15', '`1111`'],
    ],
    caption: 'Every IPv6 conversion is built from these 16 four-bit patterns (nibbles).',
    notes:
      "Hexadecimal is base 16: after 9 come A (10), B (11), C (12), D (13), E (14) and F (15). Because 16 = 2^4, every hex digit maps to exactly one 4-bit pattern called a **nibble** — there is no carrying or dividing as there is with decimal-to-binary conversion. To convert hex to binary, replace each digit with its nibble: `DB8` becomes 1101 1011 1000. To convert binary to hex, split the bits into groups of four starting from the left of the hextet and replace each group with its digit. Memorize the table using anchors: 8 = 1000, A = 1010, C = 1100, F = 1111, and the rest fall in between. You will need this skill for prefix lengths that do not end on a hex-digit boundary (such as /62), for spotting the address type from its first bits, and for the modified EUI-64 bit flip in the next lesson.",
  },
  {
    kind: 'diagram',
    title: 'Hex to binary in practice',
    diagram: {
      type: 'bits',
      showDecimal: false,
      rows: [
        { label: '2001:0DB8', value: '00100000000000010000110110111000' },
        { label: 'FE80::/10', value: '11111110100000000000000000000000', prefix: 10 },
        { label: '2000::/3', value: '00100000000000000000000000000000', prefix: 3 },
      ],
    },
    caption: 'The first 32 bits of each address; highlighted bits are the prefix.',
    bullets: [
      '`2`=0010 `0`=0000 `D`=1101 `B`=1011 `8`=1000',
      '**FE80::/10** fixes the first 10 bits: `1111 1110 10`',
      '**2000::/3** fixes the first 3 bits: `001` (hextets 2000–3FFF)',
    ],
    notes:
      "Here are three conversions of the first two hextets. `2001:0DB8` becomes 0010 0000 0000 0001 0000 1101 1011 1000 — just substitute each digit with its nibble. The second row shows why prefix lengths are counted in **bits**, not hex digits. FE80::/10 means that only the first 10 bits (1111 1110 10) are fixed; the next two bits are free, which is why link-local addresses can begin with FE80, FE90, FEA0 or FEB0. The third row shows 2000::/3, the global unicast range: only the first three bits (001) are fixed, so any address whose first hex digit is 2 or 3 is global unicast. Whenever a prefix length is a multiple of 4 you can work purely in hex; when it is not (/3, /10, /62), convert the one hex digit that the boundary cuts through into binary.",
  },
  {
    kind: 'steps',
    title: 'Abbreviating: the two rules',
    steps: [
      { title: 'Write all 8 hextets', text: 'Start from the full 32-digit form so no zero group hides from you.' },
      { title: 'Rule 1: drop leading zeros', text: '`0DB8`→`DB8`, `0001`→`1`, `0000`→`0`. Trailing zeros stay: `A000` is still `A000`.' },
      { title: 'Rule 2: find the longest run of all-zero hextets', text: 'Two or more consecutive `0` hextets; on a tie, choose the **leftmost** run.' },
      { title: 'Replace that one run with `::`', text: 'Only once per address — a second `::` would be ambiguous.' },
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      fields: [
        { label: '2001', size: 16 },
        { label: 'DB8', size: 16 },
        { label: '0', size: 16, tone: 'accent' },
        { label: '0', size: 16, tone: 'accent' },
        { label: '0', size: 16, tone: 'accent' },
        { label: '0', size: 16, tone: 'accent' },
        { label: '0', size: 16, tone: 'accent' },
        { label: '1', size: 16 },
      ],
      caption: 'After rule 1: 2001:DB8:0:0:0:0:0:1 — the highlighted run becomes :: → 2001:DB8::1',
    },
    notes:
      "There are exactly two abbreviation rules. **Rule 1:** inside any hextet you may remove **leading** zeros — the zeros on the left. `0DB8` becomes `DB8`, `00A0` becomes `A0` and `0000` becomes a single `0`. You may never remove trailing zeros, because `DB8` and `DB80` are different numbers. **Rule 2:** one run of two or more consecutive all-zero hextets may be replaced by a double colon `::`. The canonical form in RFC 5952 compresses the **longest** run; when two runs are equally long it compresses the **first (leftmost)** one, and it does not use `::` for a single zero hextet — write that as `0`. The double colon may appear only once, because the reader expands it by working out how many hextets are missing; with two of them there would be no way to know how to split the zeros. In the example, five zero hextets collapse into `::`, giving the familiar `2001:DB8::1`.",
  },
  {
    kind: 'table',
    title: 'Abbreviation: worked examples',
    columns: ['Full form', 'After rule 1', 'Shortest form'],
    rows: [
      ['`2001:0DB8:0000:0000:0000:0000:0000:0001`', '`2001:DB8:0:0:0:0:0:1`', '`2001:DB8::1`'],
      ['`2001:0DB8:ACAD:0001:0000:0000:0000:0010`', '`2001:DB8:ACAD:1:0:0:0:10`', '`2001:DB8:ACAD:1::10`'],
      ['`FE80:0000:0000:0000:0213:19FF:FE7A:0B01`', '`FE80:0:0:0:213:19FF:FE7A:B01`', '`FE80::213:19FF:FE7A:B01`'],
      ['`2001:0000:0000:00A1:0000:0000:0000:0001`', '`2001:0:0:A1:0:0:0:1`', '`2001:0:0:A1::1` (longest run)'],
      ['`2001:0DB8:0000:0000:0001:0000:0000:0001`', '`2001:DB8:0:0:1:0:0:1`', '`2001:DB8::1:0:0:1` (tie → leftmost)'],
      ['`2001:0DB8:0A00:0000:00B0:0000:0000:0000`', '`2001:DB8:A00:0:B0:0:0:0`', '`2001:DB8:A00:0:B0::`'],
    ],
    notes:
      "Work each example left to right. Row 2 shows that trailing zeros survive: `0010` becomes `10`, not `1`. Row 3 is a link-local address; the three zero hextets after FE80 collapse, and `0B01` loses only its leading zero. Row 4 is the classic trap: there are two zero runs, one of two hextets and one of three. The **longer** run wins even though it is further right, so the answer is `2001:0:0:A1::1`, and the shorter run is written as `0:0`. Row 5 has two runs of equal length (two hextets each), so the **leftmost** run is compressed: `2001:DB8::1:0:0:1`. Row 6 ends with a run of three zero hextets, so the address ends in `::`; the lone zero in hextet 4 stays as `0`, and `0A00` and `00B0` keep their trailing zeros (`A00`, `B0`). Say each step out loud while practicing — the mistakes happen when steps are skipped.",
  },
  {
    kind: 'compare',
    title: 'Valid or invalid?',
    left: {
      heading: 'Valid',
      tone: 'good',
      bullets: [
        '`2001:DB8::1` — one `::`',
        '`2001:db8:0:1::a` — lowercase is fine',
        '`::1` and `::` — zero runs at the edges',
        '`2001:DB8:0:0:1::1` — legal, but not canonical',
        '`2001:0DB8::0001` — legal, zeros just not removed',
      ],
    },
    right: {
      heading: 'Invalid or wrong',
      tone: 'bad',
      bullets: [
        '`2001:DB8::1::5` — two `::`',
        '`2001:DB8:12345::1` — five digits in a hextet',
        '`2001:DB8:G::1` — G is not a hex digit',
        '`2001:DB8:1:2:3:4:5:6:7` — nine hextets',
        '`2001:DB8:A::` for `2001:0DB8:A000::` — trailing zeros removed',
      ],
    },
    notes:
      "Exam items often show four strings and ask which are valid, so train yourself to reject bad ones quickly. An address is **invalid** if it has two double colons, a hextet longer than four digits, a character outside 0–9 and A–F, or more than eight hextets. An abbreviation is **wrong** (a valid string, but a different address) when trailing zeros were removed: `2001:DB8:A::` expands to `2001:0DB8:000A::`, not `2001:0DB8:A000::`. On the left side, note that not every valid form is the shortest one. `2001:DB8:0:0:1::1` compresses the second run instead of the first, and `2001:0DB8::0001` keeps its leading zeros; both are legal ways to write that address, but neither is the canonical form that IOS would display. When a question asks for the **shortest** or **correctly abbreviated** form, apply both rules fully.",
  },
  {
    kind: 'steps',
    title: 'Expanding an abbreviated address',
    steps: [
      { title: 'Count the hextets that are shown', text: '`2001:DB8:A::B0:C` shows **5** hextets.' },
      { title: 'Work out what `::` hides', text: '8 − 5 = **3** hextets of `0000`.' },
      { title: 'Rewrite with every hextet present', text: '`2001:DB8:A:0:0:0:B0:C`' },
      { title: 'Pad each hextet to four digits', text: 'Add **leading** zeros: `2001:0DB8:000A:0000:0000:0000:00B0:000C`' },
      { title: 'Check the result', text: '8 hextets, 32 hex digits, 7 colons.' },
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      fields: [
        { label: '2001', size: 16 },
        { label: '0DB8', size: 16 },
        { label: '000A', size: 16 },
        { label: '0000', size: 16, tone: 'accent' },
        { label: '0000', size: 16, tone: 'accent' },
        { label: '0000', size: 16, tone: 'accent' },
        { label: '00B0', size: 16 },
        { label: '000C', size: 16 },
      ],
      caption: 'The three highlighted hextets are what :: was hiding.',
    },
    notes:
      "Expansion is the reverse process and it is completely mechanical. First count how many hextets are written; the double colon counts as nothing. In `2001:DB8:A::B0:C` there are five: 2001, DB8, A, B0 and C. Since every address has eight hextets, the `::` stands for 8 − 5 = **3** all-zero hextets, inserted exactly where the double colon sits. Then restore the leading zeros in every hextet so that each has four digits: `A` becomes `000A`, `B0` becomes `00B0` and `C` becomes `000C`. Notice that zeros are always added on the **left** of a hextet — that is the mirror image of rule 1, which only ever removed leading zeros. Finish with the sanity check: 8 hextets, 32 digits, 7 colons. The most common mistake is padding on the wrong side (turning `B0` into `B000`), which silently produces a different address.",
  },
  {
    kind: 'table',
    title: 'Expansion: worked examples',
    columns: ['Abbreviated', 'Shown', '`::` =', 'Full form'],
    rows: [
      ['`2001:DB8::1`', '3', '5 × `0000`', '`2001:0DB8:0000:0000:0000:0000:0000:0001`'],
      ['`FE80::1:2:3`', '4', '4 × `0000`', '`FE80:0000:0000:0000:0000:0001:0002:0003`'],
      ['`2001:DB8:0:1::10`', '5', '3 × `0000`', '`2001:0DB8:0000:0001:0000:0000:0000:0010`'],
      ['`2001:DB8:CAFE:10::`', '4', '4 × `0000`', '`2001:0DB8:CAFE:0010:0000:0000:0000:0000`'],
      ['`FD00:AB:CD::1234:5`', '5', '3 × `0000`', '`FD00:00AB:00CD:0000:0000:0000:1234:0005`'],
      ['`::1`', '1', '7 × `0000`', '`0000:0000:0000:0000:0000:0000:0000:0001`'],
    ],
    notes:
      "Check each row against the method. In `FE80::1:2:3` four hextets are shown (FE80, 1, 2, 3), so the double colon expands to four zero hextets and the address ends `0001:0002:0003`. In `2001:DB8:0:1::10` the single `0` is a hextet that was written explicitly, so it counts: five are shown and `::` stands for three. `2001:DB8:CAFE:10::` ends with a double colon, so the four missing hextets go at the end — and `10` becomes `0010`, not `1000`. The loopback address `::1` shows only one hextet, so the double colon represents seven. A useful self-test: after expanding, abbreviate your answer again using both rules; you should get back exactly the string you started from (in canonical form). If you do not, you have miscounted the hextets or padded on the wrong side.",
  },
  {
    kind: 'diagram',
    title: 'Prefix length and the /64 LAN',
    diagram: {
      type: 'header',
      layout: 'line',
      fields: [
        { label: 'Global routing prefix', size: 48, sub: 'site, e.g. 2001:DB8:ACAD::/48' },
        { label: 'Subnet ID', size: 16, sub: 'your LANs', tone: 'accent' },
        { label: 'Interface ID', size: 64, sub: 'the host part' },
      ],
    },
    caption: '2001:DB8:ACAD:1::10/64 → site 2001:DB8:ACAD, subnet 0001, interface ID 0000:0000:0000:0010',
    bullets: [
      'Prefix length replaces the mask: always `/n`, never dotted decimal',
      'LANs use **/64**: the 64-bit interface ID is required by SLAAC and EUI-64',
      'A **/48** site has 16 subnet bits → ==65,536 /64 subnets==',
      'A /56 gives 256 /64 subnets; a /60 gives 16',
      'Point-to-point links may use /127; a single host route is /128',
    ],
    notes:
      "IPv6 has no dotted-decimal masks; the number of network bits is always written as a **prefix length** after a slash. A global unicast address is usually read in three parts. The **global routing prefix** is what your ISP or RIR assigns — commonly a /48 for a site (some ISPs hand out /56 to small sites). The **subnet ID** is the part you number yourself, and the **interface ID** identifies the host on the link. The universal design rule is that LANs are **/64**, leaving a 64-bit interface ID; SLAAC and modified EUI-64 only work with a 64-bit interface ID. With a /48 you have 64 − 48 = 16 subnet bits, so 2^16 = **65,536** LAN subnets, numbered 2001:DB8:ACAD:0::/64 through 2001:DB8:ACAD:FFFF::/64. With a /56 you have 8 subnet bits (256 subnets). Router-to-router links sometimes use /127 (RFC 6164), and loopback or host routes use /128.",
  },
];
