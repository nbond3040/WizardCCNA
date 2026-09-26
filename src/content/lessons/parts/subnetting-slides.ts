import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Subnetting',
    subtitle: 'Masks, prefixes, block sizes and fast, reliable subnet math',
    notes:
      'Subnetting is the single most important skill on the CCNA. It appears directly in questions that ask for a network ID, a broadcast address or the right mask, and indirectly in routing, ACL, OSPF and troubleshooting questions where you must recognize which subnet an address belongs to. The good news is that every subnetting question yields to one reliable procedure. In this deck you will read masks in both dotted-decimal and prefix (CIDR) notation, recognize valid mask values, use the formulas 2^h − 2 and 2^s, and apply the **magic number** (block size) method to find the network, broadcast and host range of any address, with worked examples in the second, third and fourth octets. You will also choose masks from requirements, test whether two hosts share a subnet, and learn the classic traps: /30 versus /31, off-by-one broadcasts and subnet zero. This lesson covers topic 1.6 on v1.1 and Domain 1 on v2.0, and both versions test it heavily.',
  },
  {
    kind: 'bullets',
    title: 'Why subnet?',
    bullets: [
      'Split one block into smaller **broadcast domains**',
      'Match each subnet to a site, VLAN or function',
      'Apply security (ACLs) and QoS per subnet',
      'Waste fewer addresses than one giant flat network',
      'Routers connect the subnets; hosts reach them through a gateway',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'owns 192.168.1.0/24', x: 5, y: 1, tone: 'accent' },
        { id: 'a', icon: 'switch', label: 'Sales', sub: '192.168.1.0/26', x: 1.5, y: 3.6 },
        { id: 'b', icon: 'switch', label: 'Engineering', sub: '192.168.1.64/26', x: 5, y: 3.6 },
        { id: 'c', icon: 'switch', label: 'Servers', sub: '192.168.1.128/26', x: 8.5, y: 3.6 },
      ],
      links: [
        { from: 'r1', to: 'a' },
        { from: 'r1', to: 'b' },
        { from: 'r1', to: 'c' },
      ],
      annotations: [{ x: 8.5, y: 0.8, text: 'Spare: 192.168.1.192/26', tone: 'muted' }],
    },
    notes:
      'A single flat network with thousands of hosts is a bad idea: every broadcast (ARP, DHCP) reaches every host, one misbehaving device affects everyone, and there is no natural place to apply security policy. **Subnetting** borrows bits from the host portion of an address block and uses them to create several smaller networks. In the diagram, the company owns 192.168.1.0/24 and splits it into four /26 subnets: one each for Sales, Engineering and Servers, with the fourth held in reserve. Each subnet is its own broadcast domain behind a separate router interface, so broadcasts in Sales never disturb the servers, and an ACL on R1 can filter traffic between the groups. Subnets also map naturally to VLANs, buildings and WAN links. The cost is that traffic between subnets must pass through a router, which is exactly where you want control. Every subnet needs a unique network ID, a broadcast address and a range of host addresses, and working those out quickly is what the rest of this deck teaches.',
  },
  {
    kind: 'diagram',
    title: 'The mask marks the network bits',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Address 192.168.1.77', value: '192.168.1.77', prefix: 26 },
        { label: 'Mask 255.255.255.192 (/26)', value: '255.255.255.192', prefix: 26 },
        { label: 'AND = network 192.168.1.64', value: '192.168.1.64', prefix: 26, tone: 'accent' },
      ],
    },
    caption: 'A 1 in the mask keeps the address bit; a 0 clears it. The result is the network ID.',
    notes:
      'A subnet mask is a 32-bit pattern of **contiguous 1s followed by 0s**. Its 1 bits mark the network portion of an address and its 0 bits mark the host portion. A device finds the network an address belongs to with a bitwise **AND**: each address bit is kept where the mask has a 1 and forced to 0 where the mask has a 0. In the diagram, 192.168.1.77 with mask 255.255.255.192 (/26) keeps its first 26 bits. The fourth octet 77 is 01001101 and the mask octet 192 is 11000000; ANDing them leaves 01000000, which is 64. So the host lives on network **192.168.1.64/26**. Hosts perform this calculation every time they send a packet (to decide whether the destination is local), and routers perform it for every route lookup. You will rarely need to write out all 32 bits on the exam, because the block-size method later in this deck gets the same answer in seconds, but understanding the AND explains why that shortcut always works.',
  },
  {
    kind: 'table',
    title: 'Prefix length ↔ dotted-decimal mask',
    columns: ['Mask bits in the octet', 'Octet value', 'Block size', 'In 2nd octet', 'In 3rd octet', 'In 4th octet'],
    rows: [
      ['1', '128', '128', '/9', '/17', '/25'],
      ['2', '192', '64', '/10', '/18', '/26'],
      ['3', '224', '32', '/11', '/19', '/27'],
      ['4', '240', '16', '/12', '/20', '/28'],
      ['5', '248', '8', '/13', '/21', '/29'],
      ['6', '252', '4', '/14', '/22', '/30'],
      ['7', '254', '2', '/15', '/23', '/31'],
      ['8', '255', '1', '/16', '/24', '/32'],
    ],
    caption: 'Example: /20 = 8 + 8 + 4 bits = 255.255.240.0. Block size = 256 − octet value.',
    notes:
      'The prefix length (CIDR notation) simply counts the 1 bits in the mask, so /26 and 255.255.255.192 say exactly the same thing. To convert a prefix, fill whole octets with 255 in steps of 8 bits, then look up the remainder in this table. /20 is 8 + 8 + 4: 255.255, then 4 bits = 240, then 0, giving 255.255.240.0. /13 is 8 + 5: 255.248.0.0. Going the other way, 255.255.255.224 is 24 + 3 = /27. The **octet value** column lists the only values a mask octet can ever hold besides 0: 128, 192, 224, 240, 248, 252, 254 and 255. Any other number, such as 250 or 225, means the mask is invalid. The **block size** column is the key to fast subnetting: it equals 256 minus the octet value, and it tells you how far apart consecutive subnets are in the octet where the mask changes. Memorize this table; you can rebuild it in seconds from the running totals 128, 192, 224 and so on.',
  },
  {
    kind: 'diagram',
    title: 'Valid and invalid masks',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Valid /20 · 255.255.240.0', value: '255.255.240.0', prefix: 20, tone: 'good' },
        { label: 'Valid /29 · 255.255.255.248', value: '255.255.255.248', prefix: 29, tone: 'good' },
        { label: 'Invalid · 255.255.250.0', value: '255.255.250.0', tone: 'bad' },
        { label: 'Invalid · 255.0.255.0', value: '255.0.255.0', tone: 'bad' },
      ],
    },
    caption: 'A mask must be one unbroken run of 1s followed only by 0s.',
    notes:
      'A valid mask is always a single unbroken block of 1 bits followed by 0 bits, never a 0 followed later by a 1. That rule is why only nine values are legal in each octet, and why every octet after a non-255 octet must be 0. 255.255.240.0 is fine: twenty 1s, then twelve 0s. 255.255.255.248 is fine too: twenty-nine 1s. 255.255.250.0 is not a mask, because 250 is 11111010, with a 0 sitting between 1s. 255.0.255.0 breaks the rule more obviously: an octet of 0s followed by an octet of 1s. Exam items typically hide one or two invalid values such as 255.255.255.250, 255.255.225.0 or 255.255.253.0 among valid-looking options. Check two things: is every octet one of the nine allowed values, and does every octet after the first non-255 octet equal 0? If both answers are yes, the mask is valid. IOS applies the same rule and will not accept a non-contiguous mask in the `ip address` command.',
  },
  {
    kind: 'bullets',
    title: 'Two formulas: hosts and subnets',
    bullets: [
      '**Hosts per subnet = 2^h − 2** (h = host bits)',
      '**Subnets = 2^s** (s = bits borrowed from the host part)',
      { text: 'Example: 192.168.1.0/24 subnetted to /27', sub: ['s = 3 → 2^3 = **8 subnets**', 'h = 5 → 2^5 − 2 = **30 hosts** each'] },
      'Subtract 2 for hosts only, never for subnets',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Before: /24', value: '192.168.1.0', prefix: 24, tone: 'muted' },
        { label: 'After: /27 (3 borrowed bits)', value: '192.168.1.0', prefix: 27 },
      ],
    },
    notes:
      'Two formulas answer every counting question. **Hosts per subnet = 2^h − 2**, where h is the number of host bits (32 minus the prefix). The two subtracted addresses are the network ID (host bits all 0) and the broadcast (host bits all 1). **Number of subnets = 2^s**, where s is the number of bits borrowed from the original host portion: the difference between the new prefix and the one you started with. In the example, a company subnets 192.168.1.0/24 into /27 networks. The prefix grew by 3, so s = 3 and there are 2^3 = 8 subnets. Five host bits remain, so each subnet has 2^5 − 2 = 30 usable hosts. Notice that 8 × 32 = 256: the subnets tile the original /24 exactly. The classic mistake is subtracting 2 from the subnet count too; that rule only existed in old classful designs that banned the first and last subnets. Modern IOS allows both, so today you use 2^s for subnets and 2^h − 2 for hosts.',
  },
  {
    kind: 'table',
    title: 'Host bits, prefixes and host counts',
    columns: ['Host bits (h)', 'Prefix', 'Addresses (2^h)', 'Usable hosts (2^h − 2)'],
    rows: [
      ['2', '/30', '4', '2'],
      ['3', '/29', '8', '6'],
      ['4', '/28', '16', '14'],
      ['5', '/27', '32', '30'],
      ['6', '/26', '64', '62'],
      ['7', '/25', '128', '126'],
      ['8', '/24', '256', '254'],
      ['9', '/23', '512', '510'],
      ['10', '/22', '1,024', '1,022'],
      ['11', '/21', '2,048', '2,046'],
      ['12', '/20', '4,096', '4,094'],
      ['16', '/16', '65,536', '65,534'],
    ],
    notes:
      'This table is worth memorizing outright, because it answers both "how many hosts does this prefix give?" and "which prefix do I need?" at a glance. Each extra host bit doubles the address count: 4, 8, 16, 32, 64, 128, 256, 512, 1,024 and so on, and usable hosts are always two fewer. Read it in both directions. Forward: a /22 has 10 host bits, 1,024 addresses and 1,022 usable hosts. Backward: a LAN that must hold 500 hosts needs at least 502 addresses, and the smallest power of two that is at least 502 is 512, which is 9 host bits, so /23. Watch the edge of each row: a /26 holds 62 hosts, not 64, so a VLAN that needs exactly 64 hosts must move up to a /25. Beyond /20 keep doubling: /19 gives 8,190 hosts, /18 16,382, /17 32,766 and /16 65,534. For the exam, be able to recite powers of two up to at least 2^16 = 65,536 without thinking.',
  },
  {
    kind: 'bullets',
    title: '/31 and /32: the special prefixes',
    bullets: [
      '**/31** (RFC 3021): 2 addresses, **both usable**, no network or broadcast',
      'Only for **point-to-point** links; half the cost of a /30',
      '**/30**: the traditional point-to-point choice, 4 addresses and 2 usable',
      '**/32**: exactly one address, a **host route** or a loopback',
      'Every IOS interface address also appears as an `L` /32 route',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'R1 end of a /31 · 10.0.0.0', value: '10.0.0.0', prefix: 31 },
        { label: 'R2 end of a /31 · 10.0.0.1', value: '10.0.0.1', prefix: 31 },
        { label: 'Loopback /32 · 10.255.0.1', value: '10.255.0.1', prefix: 32, tone: 'accent' },
      ],
    },
    notes:
      'The formula 2^h − 2 breaks down at the two longest prefixes, and the exam knows it. A **/31** has one host bit and therefore only two addresses. Under the normal rules that would leave zero usable hosts, but **RFC 3021** redefines /31 for point-to-point links: there is no network or broadcast address, and both addresses go to the two routers, here 10.0.0.0 on R1 and 10.0.0.1 on R2. Cisco IOS supports /31 addressing on point-to-point links, and it halves the address cost of each WAN link compared with the traditional **/30**, which spends four addresses to get two usable ones. A **/32** identifies exactly one address. You meet it as a host route (a static route to one server), on loopback interfaces (OSPF advertises a loopback as a /32 by default), and in every IOS routing table as the `L` (local) route for each interface address. Exam trap: a question asking for a mask that gives "two usable hosts" usually wants /30, unless it explicitly mentions RFC 3021 or /31 point-to-point addressing.',
  },
  {
    kind: 'steps',
    title: 'The magic number (block size) method',
    steps: [
      { title: 'Find the interesting octet', text: 'The octet where the mask is neither 255 nor 0.' },
      { title: 'Magic number = 256 − mask octet', text: '/27 → 256 − 224 = **32**.' },
      { title: 'Network ID', text: 'Largest multiple of the magic number ≤ the address octet; octets to the right become 0.' },
      { title: 'Broadcast', text: 'Next multiple − 1; octets to the right become 255.' },
      { title: 'Host range', text: 'First = network + 1; last = broadcast − 1.' },
      { title: 'Octets to the left', text: 'Copy them unchanged from the address.' },
    ],
    diagram: {
      type: 'bits',
      rows: [{ label: 'Mask /27 · last network bit is worth 32', value: '255.255.255.224', prefix: 27 }],
    },
    notes:
      'The **magic number** (block size) method finds any subnet without binary. First identify the **interesting octet**: the octet where the mask is not 255 and not 0, because that is where the network/host boundary falls. Subtract the mask value in that octet from 256; the result is the block size, the distance between consecutive subnet IDs in that octet. Subnets therefore start at 0 and at every multiple of the magic number. The **network ID** is the largest multiple that does not exceed the address\'s value in that octet. The next multiple is the next subnet, so subtracting one from it gives the **broadcast**. Octets to the left of the interesting octet are copied from the address; octets to the right are 0 in the network ID and 255 in the broadcast. The diagram shows why it works: in 255.255.255.224 the last network bit sits in the 32 position, so network IDs can only change in steps of 32. When the mask is exactly 255.255.255.0 or 255.255.0.0, the boundary falls between octets and the answer is immediate.',
  },
  {
    kind: 'steps',
    title: 'Worked example: 4th octet · 192.168.10.150/27',
    steps: [
      { title: 'Mask and octet', text: '/27 = 255.255.255.224 → the 4th octet is interesting' },
      { title: 'Magic number', text: '256 − 224 = **32** → 0, 32, 64, 96, 128, 160, 192, 224' },
      { title: 'Network ID', text: '150 lies between 128 and 160 → **192.168.10.128**' },
      { title: 'Broadcast', text: '160 − 1 → **192.168.10.159**' },
      { title: 'Hosts', text: '**192.168.10.129 – 192.168.10.158** · 2^5 − 2 = 30' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 192.168.10.150', value: '192.168.10.150', prefix: 27 },
        { label: 'Network 192.168.10.128', value: '192.168.10.128', prefix: 27 },
        { label: 'Broadcast 192.168.10.159', value: '192.168.10.159', prefix: 27 },
      ],
    },
    notes:
      'Walk through the method once, slowly. The prefix /27 means 24 + 3 bits, so the mask is 255.255.255.224 and the interesting octet is the fourth. The magic number is 256 − 224 = 32, so the subnets of 192.168.10.0/24 start at 0, 32, 64, 96, 128, 160, 192 and 224. The address octet is 150, which falls between 128 and 160: the network ID is **192.168.10.128**. The next subnet begins at 160, so the broadcast is **192.168.10.159**. Usable hosts run from .129 to .158, which is 30 addresses, matching 2^5 − 2. The binary rows confirm it: 150 is 10010110; the first three bits (100) are network bits, and clearing the five host bits gives 10000000 = 128, while setting them gives 10011111 = 159. On the exam, write only the multiples of the magic number and pick the right one; the whole calculation should take under 20 seconds. Double-check with one sum: network + block size − 1 = broadcast (128 + 32 − 1 = 159).',
  },
  {
    kind: 'table',
    title: 'All eight /27 subnets of 192.168.10.0/24',
    columns: ['Subnet', 'Network ID', 'First host', 'Last host', 'Broadcast'],
    rows: [
      ['1 (subnet zero)', '.0', '.1', '.30', '.31'],
      ['2', '.32', '.33', '.62', '.63'],
      ['3', '.64', '.65', '.94', '.95'],
      ['4', '.96', '.97', '.126', '.127'],
      ['5', '.128', '.129', '.158', '.159'],
      ['6', '.160', '.161', '.190', '.191'],
      ['7', '.192', '.193', '.222', '.223'],
      ['8 (last)', '.224', '.225', '.254', '.255'],
    ],
    caption: 'Values are the 4th octet of 192.168.10.x. Each broadcast is one less than the next network ID.',
    notes:
      'Listing every subnet reveals the rhythm that makes subnetting predictable. Network IDs climb in steps of the magic number (0, 32, 64 and so on). Each **broadcast** is one less than the next network ID. The **first host** is always the network ID plus one, and the **last host** is always the broadcast minus one. The first subnet, 192.168.10.0/27, is called **subnet zero**, and the last one, 192.168.10.224/27, is sometimes called the all-ones subnet; both are perfectly valid on modern networks. Exam questions often ask things like "what is the third subnet?" (192.168.10.64/27, counting subnet zero as the first) or "which subnet contains host .100?" (the fourth, 192.168.10.96/27). Others ask for the broadcast of a specific subnet, where off-by-one errors are common: the broadcast of 192.168.10.96/27 is .127, not .128. When in doubt, sketch a short table like this one; eight rows take seconds to write and eliminate careless mistakes.',
  },
  {
    kind: 'steps',
    title: 'Worked example: 3rd octet · 172.16.45.200/20',
    steps: [
      { title: 'Mask and octet', text: '/20 = 255.255.240.0 → the 3rd octet is interesting' },
      { title: 'Magic number', text: '256 − 240 = **16** → 0, 16, 32, 48, 64…' },
      { title: 'Network ID', text: '45 lies between 32 and 48 → **172.16.32.0** (4th octet becomes 0)' },
      { title: 'Broadcast', text: 'Next network 172.16.48.0 − 1 → **172.16.47.255**' },
      { title: 'Hosts', text: '**172.16.32.1 – 172.16.47.254** · 2^12 − 2 = 4,094' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 172.16.45.200', value: '172.16.45.200', prefix: 20 },
        { label: 'Network 172.16.32.0', value: '172.16.32.0', prefix: 20 },
        { label: 'Broadcast 172.16.47.255', value: '172.16.47.255', prefix: 20 },
      ],
    },
    notes:
      'When the prefix is between /17 and /23, the interesting octet is the third, and the only new twist is what happens to the fourth octet. /20 is 16 + 4 bits, so the mask is 255.255.240.0 and the magic number is 256 − 240 = 16. Subnet IDs step through the third octet as 0, 16, 32, 48 and so on. The address\'s third octet is 45, which lies between 32 and 48, so the network ID is **172.16.32.0**; the fourth octet is to the right of the interesting octet, so it becomes 0. The next network is 172.16.48.0, and the address just before it is the broadcast, **172.16.47.255**: here "minus one" borrows across the octet boundary, turning 48.0 into 47.255. The host range therefore spans many third-octet values, from 172.16.32.1 to 172.16.47.254, which is 4,094 hosts (12 host bits). A frequent error is answering 172.16.45.0 for the network or 172.16.45.255 for the broadcast; always derive both from the multiples of the magic number, never from the address itself.',
  },
  {
    kind: 'diagram',
    title: 'Worked example: 3rd octet · 10.1.131.9/23',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 10.1.131.9', value: '10.1.131.9', prefix: 23 },
        { label: 'Network 10.1.130.0', value: '10.1.130.0', prefix: 23 },
        { label: 'Broadcast 10.1.131.255', value: '10.1.131.255', prefix: 23 },
        { label: 'Also a valid host · 10.1.131.0', value: '10.1.131.0', prefix: 23, tone: 'good' },
      ],
    },
    bullets: [
      '/23 = 255.255.254.0 → magic number **2** in the 3rd octet',
      '131 → the even number below → network **10.1.130.0**',
      'Broadcast **10.1.131.255**; hosts 10.1.130.1 – 10.1.131.254 (510)',
      '**10.1.130.255** and **10.1.131.0** are ordinary hosts here',
    ],
    notes:
      'Short prefixes produce the most counter-intuitive answers, which is why exam writers love /23 and /22. With /23 the mask is 255.255.254.0 and the magic number is 2, so every subnet covers two consecutive third-octet values: 130–131, 132–133 and so on. 131 is odd, so the network ID is the even number below it: **10.1.130.0**. The next network is 10.1.132.0, making the broadcast **10.1.131.255** and the usable range 10.1.130.1 through 10.1.131.254, which is 510 hosts. Now look at the last diagram row: 10.1.131.0 ends in .0, yet it is a perfectly valid host address, because its host bits (the last bit of the third octet plus the whole fourth octet) are not all zeros. The same is true of 10.1.130.255, whose host bits are not all ones. Rule of thumb: an address ending in .0 or .255 is only guaranteed to be a network or broadcast address when the prefix is /24 or longer. Otherwise, do the math, and never reject an answer just because it "looks like" a network address.',
  },
  {
    kind: 'steps',
    title: 'Worked example: 2nd octet · 10.77.200.13/11',
    steps: [
      { title: 'Mask and octet', text: '/11 = 255.224.0.0 → the 2nd octet is interesting' },
      { title: 'Magic number', text: '256 − 224 = **32** → 0, 32, 64, 96, 128…' },
      { title: 'Network ID', text: '77 lies between 64 and 96 → **10.64.0.0**' },
      { title: 'Broadcast', text: 'Next network 10.96.0.0 − 1 → **10.95.255.255**' },
      { title: 'Hosts', text: '**10.64.0.1 – 10.95.255.254** · 2^21 − 2 = 2,097,150' },
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 10.77.200.13', value: '10.77.200.13', prefix: 11 },
        { label: 'Network 10.64.0.0', value: '10.64.0.0', prefix: 11 },
        { label: 'Broadcast 10.95.255.255', value: '10.95.255.255', prefix: 11 },
      ],
    },
    notes:
      'Second-octet problems (prefixes /9 to /15) intimidate people because the numbers get big, but the method is identical. /11 is 8 + 3 bits, so the mask is 255.224.0.0, the interesting octet is the second, and the magic number is 256 − 224 = 32. Subnet IDs step through the second octet as 0, 32, 64, 96, 128, 160, 192 and 224. The address\'s second octet is 77, which falls between 64 and 96, so the network ID is **10.64.0.0**: the first octet is copied, the second becomes 64, and both octets to the right become 0. The next network is 10.96.0.0, so the broadcast is **10.95.255.255**, with both right-hand octets set to 255. Usable hosts run from 10.64.0.1 to 10.95.255.254; with 21 host bits that is 2,097,150 addresses. Large host counts are rarely asked, but when they are, work from the powers of two: 2^20 = 1,048,576, so 2^21 = 2,097,152. Large enterprises often carve the private 10.0.0.0/8 block with second-octet masks like this one.',
  },
  {
    kind: 'diagram',
    title: 'Are two hosts in the same subnet?',
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host A · 10.10.14.20/21', value: '10.10.14.20', prefix: 21 },
        { label: 'Host B · 10.10.17.5/21', value: '10.10.17.5', prefix: 21, tone: 'bad' },
        { label: 'Host C · 10.10.9.200/21', value: '10.10.9.200', prefix: 21, tone: 'good' },
      ],
    },
    bullets: [
      'Compute each network ID with the **same mask**',
      'A and C → **10.10.8.0/21**: same subnet, direct delivery',
      'B → **10.10.16.0/21**: different subnet, needs a router',
    ],
    notes:
      'To decide whether two addresses share a subnet, compute the network ID of each with the mask and compare. With /21 the mask is 255.255.248.0 and the magic number is 8 in the third octet, so subnets start at 0, 8, 16, 24 and so on. Host A\'s third octet is 14, which falls in the 8 block: network 10.10.8.0, range 10.10.8.0 to 10.10.15.255. Host C\'s third octet is 9, also in the 8 block, so A and C share a subnet and reach each other directly with ARP, no router needed. Host B\'s third octet is 17, which falls in the 16 block: network 10.10.16.0, a different subnet. In binary you can see it in the diagram: the first 21 bits of A and C match, while B differs inside the network bits of the third octet. Exam scenarios use this constantly. "PC1 cannot reach PC2 on the same switch" often means the two were given addresses in different subnets, or one of them has the wrong mask. Always apply the same mask to both addresses when you compare.',
  },
  {
    kind: 'diagram',
    title: 'Which subnet does a host belong to?',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pca', icon: 'pc', label: 'PC-A', sub: '172.16.1.100/25 · GW .1', x: 0.9, y: 1.2 },
        { id: 'pcb', icon: 'pc', label: 'PC-B', sub: '172.16.1.130/25 · GW .1', x: 0.9, y: 3.8, tone: 'bad' },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 2.8, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 2.5 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.2, y: 2.5 },
        { id: 'pcc', icon: 'pc', label: 'PC-C', sub: '172.16.1.200/25 · GW .129', x: 9.1, y: 2.5 },
      ],
      links: [
        { from: 'pca', to: 'sw1' },
        { from: 'pcb', to: 'sw1', tone: 'bad' },
        { from: 'sw1', to: 'r1', toLabel: 'G0/0/0 .1', label: '172.16.1.0/25' },
        { from: 'r1', to: 'sw2', fromLabel: 'G0/0/1 .129', label: '172.16.1.128/25' },
        { from: 'sw2', to: 'pcc' },
      ],
    },
    caption: 'PC-B\'s address belongs to 172.16.1.128/25 (G0/0/1), but PC-B is cabled to the G0/0/0 LAN.',
    notes:
      'Real troubleshooting, and many exam exhibits, combine subnet math with a topology. R1 splits 172.16.1.0/24 into two /25 subnets: G0/0/0 (172.16.1.1) serves 172.16.1.0/25, covering .0 to .127, and G0/0/1 (172.16.1.129) serves 172.16.1.128/25, covering .128 to .255. PC-A at .100 is correct: its address and its gateway .1 are both in the first /25. PC-C at .200 with gateway .129 is correct for the second LAN. PC-B, however, has 172.16.1.130/25, an address in the G0/0/1 subnet, even though it is cabled to SW1 on the G0/0/0 LAN, and its gateway .1 lies outside its own subnet. PC-B treats PC-A as remote, has no valid gateway, and R1 would send any reply for .130 out G0/0/1, the wrong segment, so communication fails. The fix is to readdress PC-B inside 172.16.1.2–126 with gateway .1, or move it to the G0/0/1 LAN with gateway .129. When an exhibit shows several hosts, compute each host\'s subnet and compare it with the router interface it actually connects to.',
  },
  {
    kind: 'steps',
    title: 'Choosing a mask for a host requirement',
    steps: [
      { title: 'Add 2 to the host count', text: 'Room for the network and broadcast addresses.' },
      { title: 'Round up to a power of two', text: 'That power is 2^h, where h = host bits.' },
      { title: 'Prefix = 32 − h', text: 'Then convert it to dotted decimal.' },
      { title: 'Example: 50 hosts', text: '52 → 64 = 2^6 → **/26** (255.255.255.192, 62 hosts)' },
      { title: 'Example: 500 hosts', text: '502 → 512 = 2^9 → **/23** (255.255.254.0, 510 hosts)' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'Hosts needed', sub: '50', shape: 'pill' },
        { id: 'n2', label: '+ 2', sub: '52' },
        { id: 'n3', label: 'Next power of 2', sub: '64 = 2^6' },
        { id: 'n4', label: 'Prefix = 32 − 6', sub: '/26 · 255.255.255.192', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      'When a question gives a host requirement, work from the host bits. Add two for the network and broadcast addresses, round up to the next power of two, and that exponent is the number of host bits you need. The prefix is 32 minus the host bits. For 50 hosts: 50 + 2 = 52, the next power of two is 64 = 2^6, so h = 6 and the prefix is /26, mask 255.255.255.192, which supports 62 hosts. For 500 hosts: 502 rounds up to 512 = 2^9, so /23, mask 255.255.254.0, with 510 hosts. Watch the boundary cases, because exam writers choose them deliberately: 62 hosts fit a /26 exactly (62 + 2 = 64), but 63 hosts need a /25, and 30 hosts fit a /27 while 31 do not. Read the wording, too. "The fewest wasted addresses" or "the smallest subnet" means the longest prefix that still fits. "Allow for 20% growth" means add the growth before you calculate. And a router-to-router link with two hosts is a /30, or a /31 if RFC 3021 is specified.',
  },
  {
    kind: 'table',
    title: 'Choosing a mask for subnet requirements',
    columns: ['Requirement', 'Bits', 'Mask', 'Result'],
    rows: [
      ['192.168.1.0/24, need 5 subnets', 's = 3 (8 ≥ 5)', '/27 · 255.255.255.224', '8 subnets × 30 hosts'],
      ['172.16.0.0/16, need 100 subnets', 's = 7 (128 ≥ 100)', '/23 · 255.255.254.0', '128 subnets × 510 hosts'],
      ['10.0.0.0/8, need 1,000 subnets', 's = 10 (1,024)', '/18 · 255.255.192.0', '1,024 subnets × 16,382 hosts'],
      ['172.16.0.0/16, ≥ 60 subnets and ≥ 900 hosts', 's = 6, h = 10', '/22 · 255.255.252.0', '64 subnets × 1,022 hosts'],
      ['192.168.5.0/24, ≥ 20 hosts, most subnets', 'h = 5 (30 ≥ 20)', '/27 · 255.255.255.224', '8 subnets × 30 hosts'],
    ],
    caption: 'Every bit borrowed for subnets doubles the subnet count and roughly halves the hosts per subnet.',
    notes:
      'When the requirement is a number of subnets, work from the borrowed bits instead. Find the smallest s with 2^s greater than or equal to the number of subnets, then add s to the original prefix. From 192.168.1.0/24, five subnets need s = 3 (2^3 = 8), giving /27 with 30 hosts each. From 172.16.0.0/16, 100 subnets need s = 7 (128), giving /23 with 510 hosts each. From 10.0.0.0/8, 1,000 subnets need s = 10 (1,024), giving /18. Many questions add a second constraint: at least 60 subnets *and* at least 900 hosts from 172.16.0.0/16. Six borrowed bits (64 subnets) leave 10 host bits (1,022 hosts), so /22 meets both, while /21 gives too few subnets and /23 too few hosts. When a question says "maximize the number of hosts", pick the shortest prefix that still provides enough subnets; when it says "maximize the number of subnets", pick the longest prefix that still holds the hosts. The last row shows that second case: 20 hosts need h = 5, so /27 yields the most subnets.',
  },
  {
    kind: 'bullets',
    title: 'Subnet zero and the last subnet are valid',
    bullets: [
      '**Subnet zero**: subnet bits all 0 (e.g. 172.16.0.0/18)',
      '**All-ones subnet**: subnet bits all 1 (e.g. 172.16.192.0/18)',
      'Both usable: `ip subnet-zero` is on by default (IOS 12.0 and later)',
      'The old classful "2^s − 2 subnets" rule is obsolete',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Subnet zero · 172.16.0.0/18', value: '172.16.0.0', prefix: 18, tone: 'accent' },
        { label: '172.16.64.0/18', value: '172.16.64.0', prefix: 18 },
        { label: '172.16.128.0/18', value: '172.16.128.0', prefix: 18 },
        { label: 'All-ones subnet · 172.16.192.0/18', value: '172.16.192.0', prefix: 18, tone: 'accent' },
      ],
    },
    notes:
      'Old textbooks, and old routers, refused to use the first and last subnets of a classful network. The first, **subnet zero**, has the same network ID as the classful network itself (172.16.0.0/18 versus 172.16.0.0/16), and the last, the **all-ones subnet**, has the same broadcast address (172.16.255.255), which confused classful routing protocols. That is where the obsolete formula 2^s − 2 for subnets came from. Classless routing removed the ambiguity, and Cisco IOS has enabled `ip subnet-zero` by default since release 12.0, so both subnets are fully usable. Splitting 172.16.0.0/16 with /18 gives four subnets (172.16.0.0, 172.16.64.0, 172.16.128.0 and 172.16.192.0) and all four can be assigned. On the current exam, unless a question explicitly says subnet zero may not be used, always count it and use 2^s. If a question asks for the "first subnet", the answer is subnet zero; and if an answer option happens to be subnet zero, do not eliminate it for that reason alone.',
  },
  {
    kind: 'cli',
    title: 'Let IOS check your math',
    code: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip address 192.168.10.150 255.255.255.224
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip route connected | include 192.168.10
      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.128/27 is directly connected, GigabitEthernet0/0/1
L        192.168.10.150/32 is directly connected, GigabitEthernet0/0/1
R1# show ip interface GigabitEthernet0/0/1 | include Internet
  Internet address is 192.168.10.150/27`,
    highlight: ['192.168.10.128/27', '192.168.10.150/32'],
    caption: 'The C route is the network ID IOS derived; the L route is the interface address itself.',
    notes:
      'In labs, a router will verify your subnet math for you. Configure an interface address with its mask, bring the interface up, and IOS immediately installs two routes: a **connected** (`C`) route to the subnet, which is the network ID computed by the same AND you learned earlier, and a **local** (`L`) /32 route for the interface\'s own address. Here the address 192.168.10.150 with mask 255.255.255.224 produces the connected route 192.168.10.128/27, matching the worked example. The heading line groups the routes under the classful network 192.168.10.0/24 and notes that it is variably subnetted, because two different masks (/27 and /32) are present. `show ip interface` confirms the address with its prefix length. Exam exhibits use this in reverse: they show a routing table and ask which interface a given host belongs to, or which address is valid on a segment. Remember too that IOS rejects an interface address that is the network ID or broadcast of its own subnet, one more reason to be precise about those two addresses.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: subnetting',
    body: 'Almost every wrong answer is ==off by one bit or one address==. Slow down on these:',
    bullets: [
      '**/30** = 2 usable of 4; **/31** = 2 usable only on point-to-point links',
      'Broadcast = **next network − 1**, never the next network itself',
      'Hosts = 2^h − 2, but subnets = 2^s; subnet zero is valid',
      '"Needs 64 hosts" → **/25**, not /26 (62 hosts)',
      '.0 or .255 can be valid hosts when the prefix is shorter than /24',
      'Invalid mask values hide among options: 250, 225, 253…',
      'Compare hosts with the **same mask**; the gateway must be in the host\'s subnet',
    ],
    notes:
      'Subnetting questions rarely test obscure facts; they test precision. The /30 versus /31 trap appears whenever a question mentions point-to-point links: /30 is the traditional answer with two usable hosts, while /31 gives two usable addresses only because RFC 3021 removes the network and broadcast addresses on point-to-point links. The broadcast is always one below the next network ID, and answering with the next network ID itself is the most common off-by-one error. Remember that the −2 applies to hosts, not to subnets, and that subnet zero counts. Boundary requirements are traps too: 62 hosts fit in a /26, but 64 do not. Addresses ending in .0 or .255 are not automatically invalid; in a /23 or a /22 they can be ordinary hosts, so do the math. Watch for invalid mask values among the options, and when comparing two hosts, apply the same mask to both. Finally, many troubleshooting questions reduce to a single check: is the default gateway inside the host\'s own subnet?',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Masks are contiguous 1s; octet values 0, 128, 192, 224, 240, 248, 252, 254, 255',
      'Hosts = **2^h − 2**; subnets = **2^s**; /31 and /32 are special',
      'Magic number = **256 − mask octet**; subnets start at its multiples',
      'Network = multiple ≤ address; broadcast = next multiple − 1',
      'First host = network + 1; last host = broadcast − 1',
      'Choose masks from host bits (32 − h) or borrowed bits (prefix + s)',
      'Same subnet? Compare network IDs computed with the same mask',
    ],
    notes:
      'You now have a complete, repeatable subnetting toolkit. Convert between prefix and dotted-decimal masks using the nine legal octet values, and reject any mask that is not a contiguous run of 1s. Count with two formulas: 2^h − 2 hosts and 2^s subnets, remembering that /31 point-to-point links and /32 host routes are the special cases. For any address and mask, find the interesting octet, compute the magic number as 256 minus the mask octet, take the largest multiple that does not exceed the address octet as the network ID, subtract one from the next multiple for the broadcast, and step in by one from each end for the host range. The method works identically in the second, third and fourth octets. You can choose a mask from a host requirement or a subnet requirement, check whether two hosts share a subnet, and spot a host cabled into the wrong subnet. The next lesson, VLSM and summarization, applies these skills to designing real address plans. Practise until each calculation takes under thirty seconds.',
  },
];
