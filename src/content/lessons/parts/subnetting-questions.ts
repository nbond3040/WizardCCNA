import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Valid values in a subnet mask octet', back: '**0, 128, 192, 224, 240, 248, 252, 254, 255**. Any other value is invalid.' },
  { id: 'f2', front: 'Rule for a valid subnet mask', back: 'One unbroken run of 1 bits followed only by 0 bits (contiguous).' },
  { id: 'f3', front: 'Usable hosts per subnet', back: '**2^h − 2**, where h = host bits (32 − prefix).' },
  { id: 'f4', front: 'Number of subnets created', back: '**2^s**, where s = bits borrowed from the original host portion. Do not subtract 2.' },
  { id: 'f5', front: 'Magic number (block size)', back: '**256 − the mask value** in the interesting octet. Subnet IDs are its multiples.' },
  { id: 'f6', front: 'Interesting octet', back: 'The octet where the mask is neither 255 nor 0, i.e. where the network/host boundary falls.' },
  { id: 'f7', front: '/25', back: '255.255.255.128 · block 128 · **126** hosts.' },
  { id: 'f8', front: '/26', back: '255.255.255.192 · block 64 · **62** hosts.' },
  { id: 'f9', front: '/27', back: '255.255.255.224 · block 32 · **30** hosts.' },
  { id: 'f10', front: '/28', back: '255.255.255.240 · block 16 · **14** hosts.' },
  { id: 'f11', front: '/29', back: '255.255.255.248 · block 8 · **6** hosts.' },
  { id: 'f12', front: '/30', back: '255.255.255.252 · block 4 · **2** hosts: the traditional point-to-point mask.' },
  { id: 'f13', front: '/31 (RFC 3021)', back: '255.255.255.254 · 2 addresses, **both usable**, on point-to-point links only.' },
  { id: 'f14', front: '/32', back: '255.255.255.255 · exactly one address: host routes, loopbacks, IOS `L` routes.' },
  { id: 'f15', front: '/23', back: '255.255.254.0 · block 2 in the 3rd octet · **510** hosts.' },
  { id: 'f16', front: '/22', back: '255.255.252.0 · block 4 in the 3rd octet · **1,022** hosts.' },
  { id: 'f17', front: '/21', back: '255.255.248.0 · block 8 in the 3rd octet · **2,046** hosts.' },
  { id: 'f18', front: '/20', back: '255.255.240.0 · block 16 in the 3rd octet · **4,094** hosts.' },
  { id: 'f19', front: '/19 and /18', back: '/19 = 255.255.224.0 (8,190 hosts) · /18 = 255.255.192.0 (16,382 hosts).' },
  { id: 'f20', front: '/17 and /16', back: '/17 = 255.255.128.0 (32,766 hosts) · /16 = 255.255.0.0 (65,534 hosts).' },
  { id: 'f21', front: 'Network ID with the magic number', back: 'Largest multiple of the magic number ≤ the address\'s interesting octet; octets to the right become 0.' },
  { id: 'f22', front: 'Broadcast address with the magic number', back: 'Next subnet ID − 1; octets to the right become 255.' },
  { id: 'f23', front: 'First and last usable host', back: 'First = network ID + 1. Last = broadcast − 1.' },
  { id: 'f24', front: 'Choose a mask for N hosts', back: 'Smallest h with 2^h − 2 ≥ N; prefix = 32 − h. (50 hosts → h = 6 → /26.)' },
  { id: 'f25', front: 'Choose a mask for N subnets', back: 'Smallest s with 2^s ≥ N; new prefix = original prefix + s. (/16 + 7 bits for 100 subnets → /23.)' },
  { id: 'f26', front: 'Subnet zero', back: 'The first subnet (subnet bits all 0). Valid: `ip subnet-zero` is on by default since IOS 12.0.' },
  { id: 'f27', front: 'Are two hosts in the same subnet?', back: 'Apply the same mask to both addresses; if the network IDs match, they share a subnet.' },
  { id: 'f28', front: 'CIDR', back: 'Classless Inter-Domain Routing: /n prefix notation and masks of any length, independent of address class.' },
  { id: 'f29', front: 'How many /n subnets fit in a /m block?', back: '**2^(n − m)**. Example: a /24 holds 2^(30 − 24) = 64 /30 subnets.' },
  { id: 'f30', front: 'Is 10.1.131.0/23 a usable host address?', back: 'Yes. Its subnet is 10.1.130.0/23 (broadcast 10.1.131.255), so 10.1.131.0 is an ordinary host.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'input',
    stem: 'How many usable host addresses does a /27 subnet provide?',
    answers: ['30'],
    placeholder: 'number',
    difficulty: 1,
    explanation: '/27 leaves 32 − 27 = 5 host bits: 2^5 = 32 addresses, minus the network and broadcast = **30** usable hosts.',
  },
  {
    id: 'q2',
    type: 'input',
    stem: 'What is the magic number (block size) for the mask 255.255.255.240?',
    answers: ['16'],
    placeholder: 'number',
    difficulty: 1,
    explanation: 'The interesting octet is the 4th (240). 256 − 240 = **16**, so subnets start at .0, .16, .32, .48 and so on.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'What is the network ID of the subnet that contains 192.168.1.70/26?',
    answers: ['192.168.1.64'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation: '/26 = 255.255.255.192, magic number 64: subnets at 0, 64, 128, 192. 70 falls in the 64 block, so the network is **192.168.1.64** (broadcast .127).',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'What is the broadcast address of the subnet that contains 10.1.1.33/28?',
    answers: ['10.1.1.47'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation: '/28 has magic number 16: subnets at 0, 16, 32, 48. 33 falls in the 32 block; the next subnet is 48, so the broadcast is 48 − 1 = **10.1.1.47**.',
  },
  {
    id: 'q5',
    type: 'multi',
    stem: 'Which two are valid subnet masks? (Choose two.)',
    options: ['255.255.255.248', '255.255.252.0', '255.255.255.250', '255.0.255.0', '255.255.225.0'],
    answers: [0, 1],
    difficulty: 1,
    explanation: '248 (/29) and 252 in the 3rd octet (/22) are legal contiguous masks. 250 (11111010) and 225 (11100001) are not contiguous, and 255.0.255.0 has 1 bits after 0 bits.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each prefix length to its dotted-decimal mask.',
    pairs: [
      { left: '/25', right: '255.255.255.128' },
      { left: '/26', right: '255.255.255.192' },
      { left: '/28', right: '255.255.255.240' },
      { left: '/30', right: '255.255.255.252' },
    ],
    difficulty: 1,
    explanation: 'Each prefix beyond /24 adds one bit to the 4th octet: 1 bit = 128, 2 bits = 192, 4 bits = 240 and 6 bits = 252.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which prefix provides exactly two usable addresses on a point-to-point link, with no network or broadcast address (RFC 3021)?',
    options: ['/30', '/31', '/32', '/29'],
    answer: 1,
    difficulty: 2,
    explanation: 'RFC 3021 lets a **/31** use both of its two addresses on a point-to-point link. A /30 also gives two usable hosts, but it spends four addresses to do it, /32 is a single address, and /29 gives six hosts.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'On a modern Cisco router, can the subnet 192.168.1.0/27 (subnet zero) be assigned to an interface?',
    options: [
      'Yes: `ip subnet-zero` is enabled by default',
      'No: subnet zero is always reserved',
      'Only after `no ip classless` is configured',
      'Only on serial interfaces',
    ],
    answer: 0,
    difficulty: 1,
    explanation: 'Since IOS 12.0, `ip subnet-zero` is on by default, so subnet zero is fully usable. The ban on subnet zero is an obsolete classful rule and has nothing to do with `ip classless` or the interface type.',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'input',
    stem: 'What is the network address of the subnet that contains 192.168.50.200/26?',
    answers: ['192.168.50.192'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation:
      '/26 = 255.255.255.192, magic number 64 in the 4th octet: subnets at 0, 64, 128 and 192. 200 falls in the 192 block, so the network is **192.168.50.192** (broadcast .255). 192.168.50.128 is the previous subnet, and 192.168.50.0 would be the network of a /24.',
  },
  {
    id: 'e2',
    type: 'input',
    stem: 'Refer to the exhibit. What is the broadcast address of the subnet attached to GigabitEthernet0/0/1?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface GigabitEthernet0/0/1 | include Internet
  Internet address is 172.20.99.14/19`,
    },
    answers: ['172.20.127.255'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation:
      '/19 = 255.255.224.0, magic number 32 in the 3rd octet: 0, 32, 64, 96, 128. 99 falls in the 96 block, so the network is 172.20.96.0 and the next one is 172.20.128.0; the broadcast is **172.20.127.255**. 172.20.99.255 is the classic wrong answer that treats the mask as a /24.',
  },
  {
    id: 'e3',
    type: 'input',
    stem: 'Refer to the exhibit. What is the last usable host address in this host\'s subnet?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : lab.example.com
   IPv4 Address. . . . . . . . . . . : 10.200.33.10
   Subnet Mask . . . . . . . . . . . : 255.248.0.0
   Default Gateway . . . . . . . . . : 10.200.0.1`,
    },
    answers: ['10.207.255.254'],
    placeholder: 'a.b.c.d',
    difficulty: 3,
    explanation:
      '255.248.0.0 is a /13, so the 2nd octet is interesting and the magic number is 256 − 248 = 8. 200 is itself a multiple of 8, so the network is 10.200.0.0, the next network 10.208.0.0, the broadcast 10.207.255.255 and the last usable host **10.207.255.254**. The gateway 10.200.0.1 is correctly inside the subnet.',
  },
  {
    id: 'e4',
    type: 'input',
    stem: 'Refer to the exhibit. R1\'s G0/0/0 must use the first usable address in PC1\'s subnet. Which address should be configured on G0/0/0?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 8,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: '192.168.1.100/29', x: 1, y: 1.5 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 3.8, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0: ?', x: 6.8, y: 1.5, tone: 'accent' },
        ],
        links: [
          { from: 'pc', to: 'sw' },
          { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
        ],
      },
    },
    answers: ['192.168.1.97'],
    placeholder: 'a.b.c.d',
    difficulty: 2,
    explanation:
      '/29 = 255.255.255.248, magic number 8: …88, 96, 104. 100 falls in the 96 block, so the network is 192.168.1.96, the first usable host is **192.168.1.97** and the broadcast is .103. 192.168.1.96 is the network ID itself and cannot be assigned, and 192.168.1.1 is not in this subnet at all.',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'How many usable host addresses does a /21 subnet provide?',
    answers: ['2046', '2,046'],
    placeholder: 'number',
    difficulty: 1,
    explanation: '32 − 21 = 11 host bits: 2^11 = 2,048 addresses, minus 2 = **2,046** usable hosts. 2,048 forgets the network and broadcast addresses, and 1,022 would be a /22.',
  },
  {
    id: 'e6',
    type: 'input',
    stem: 'A LAN segment must support 300 hosts while wasting as few addresses as possible. Which prefix length should be used?',
    answers: ['/23', '23', '255.255.254.0'],
    placeholder: '/nn',
    difficulty: 2,
    explanation:
      '300 + 2 = 302, which rounds up to 512 = 2^9, so 9 host bits are needed: 32 − 9 = **/23** (255.255.254.0, 510 hosts). A /24 holds only 254 hosts, and a /22 (1,022 hosts) would waste far more addresses.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Network 172.16.0.0/16 is divided into equal-size subnets so that each supports up to 500 hosts with the fewest wasted addresses. How many subnets are created?',
    options: ['64', '128', '256', '512'],
    answer: 1,
    difficulty: 2,
    explanation:
      '500 hosts need 9 host bits (510 hosts), so each subnet is a /23. The borrowed bits are 23 − 16 = 7, and 2^7 = **128** subnets. 64 would mean /22 subnets (more waste), 256 would mean /24 subnets (only 254 hosts), and 512 would mean /25 subnets.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. R1\'s LAN interface is 192.168.10.49/28. The PC cannot reach any remote network. Which change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 192.168.10.37
   Subnet Mask . . . . . . . . . . . : 255.255.255.240
   Default Gateway . . . . . . . . . : 192.168.10.49`,
    },
    options: [
      'Change the default gateway to 192.168.10.33',
      'Change the subnet mask to 255.255.255.248',
      'Change the PC\'s IP address to 192.168.10.50',
      'Change the PC\'s IP address to 192.168.10.47',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'With /28 (magic number 16) the PC sits in 192.168.10.32/28 (.32–.47), while R1\'s 192.168.10.49 is in 192.168.10.48/28 (.48–.63). Moving the PC to an unused address in R1\'s subnet, such as **192.168.10.50**, makes the gateway valid. A gateway of .33 points at an address with no router, a /29 puts the PC in .32–.39 which still excludes .49, and .47 is the broadcast of the PC\'s current subnet.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'Which two addresses are valid host addresses in the subnet 10.10.16.0/20? (Choose two.)',
    options: ['10.10.16.0', '10.10.31.255', '10.10.24.0', '10.10.31.254', '10.10.32.1', '10.10.15.255'],
    answers: [2, 3],
    difficulty: 2,
    explanation:
      '/20 has magic number 16 in the 3rd octet, so 10.10.16.0/20 spans **10.10.16.0–10.10.31.255**. 10.10.24.0 (a .0 address in the middle of the range) and 10.10.31.254 are hosts. 10.10.16.0 is the network ID, 10.10.31.255 the broadcast, 10.10.32.1 belongs to the next subnet and 10.10.15.255 is the broadcast of the previous one.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'An engineer will address a router-to-router Ethernet link using RFC 3021, so that no address is spent on a network ID or broadcast. Which mask should be used?',
    options: ['255.255.255.252', '255.255.255.254', '255.255.255.255', '255.255.255.248'],
    answer: 1,
    difficulty: 1,
    explanation:
      'RFC 3021 defines the **/31 (255.255.255.254)** for point-to-point links: two addresses, both usable. The /30 (.252) is the traditional choice but reserves two of its four addresses, a /32 holds only one address, and a /29 (.248) provides six hosts.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Refer to the exhibit. What is the broadcast address of the subnet connected to GigabitEthernet0/0/0?',
    exhibit: {
      kind: 'cli',
      text: `R2# show running-config interface GigabitEthernet0/0/0
Building configuration...

Current configuration : 101 bytes
!
interface GigabitEthernet0/0/0
 ip address 10.44.255.1 255.192.0.0
 negotiation auto
end`,
    },
    answers: ['10.63.255.255'],
    placeholder: 'a.b.c.d',
    difficulty: 3,
    explanation:
      '255.192.0.0 is a /10: the 2nd octet is interesting and the magic number is 256 − 192 = 64, giving subnets 10.0.0.0, 10.64.0.0, 10.128.0.0 and 10.192.0.0. 44 falls in the 0 block, so the network is 10.0.0.0 and the broadcast is **10.63.255.255**. 10.44.255.255 is the classic wrong answer from treating the mask as a /16.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. A new host is configured with 172.16.5.190 and the correct mask for its segment. Behind which R1 interface must the host be connected?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route connected | include 172.16
      172.16.0.0/16 is variably subnetted, 6 subnets, 4 masks
C        172.16.5.0/25 is directly connected, GigabitEthernet0/0/0
L        172.16.5.1/32 is directly connected, GigabitEthernet0/0/0
C        172.16.5.128/26 is directly connected, GigabitEthernet0/0/1
L        172.16.5.129/32 is directly connected, GigabitEthernet0/0/1
C        172.16.5.192/30 is directly connected, Serial0/1/0
L        172.16.5.193/32 is directly connected, Serial0/1/0`,
    },
    options: ['GigabitEthernet0/0/0', 'GigabitEthernet0/0/1', 'Serial0/1/0', 'None: 172.16.5.190 is a broadcast address'],
    answer: 1,
    difficulty: 3,
    explanation:
      '172.16.5.128/26 spans .128–.191 (magic number 64), so .190 is its **last usable host** and belongs on the G0/0/1 segment. G0/0/0 covers .0–.127 and Serial0/1/0 only .192–.195. The broadcast of 172.16.5.128/26 is .191, not .190.',
  },
  {
    id: 'e13',
    type: 'match',
    stem: 'Match each prefix length to its subnet mask.',
    pairs: [
      { left: '/19', right: '255.255.224.0' },
      { left: '/21', right: '255.255.248.0' },
      { left: '/27', right: '255.255.255.224' },
      { left: '/30', right: '255.255.255.252' },
      { left: '/12', right: '255.240.0.0' },
    ],
    difficulty: 1,
    explanation:
      'Count the bits: /19 = 16 + 3 → 224 in the 3rd octet; /21 = 16 + 5 → 248; /27 = 24 + 3 → 224 in the 4th octet; /30 = 24 + 6 → 252; /12 = 8 + 4 → 240 in the 2nd octet. Note that /19 and /27 share the value 224, just in different octets.',
  },
  {
    id: 'e14',
    type: 'categorize',
    stem: 'Classify each address, given its prefix length.',
    categories: ['Valid host address', 'Network ID', 'Broadcast address'],
    items: [
      { text: '10.1.1.64/26', category: 1 },
      { text: '10.1.1.127/26', category: 2 },
      { text: '172.16.8.255/21', category: 0 },
      { text: '172.16.15.255/21', category: 2 },
      { text: '192.168.1.0/23', category: 0 },
      { text: '192.168.4.47/29', category: 2 },
      { text: '192.168.4.49/29', category: 0 },
      { text: '10.1.1.128/25', category: 1 },
    ],
    difficulty: 3,
    explanation:
      '/26 blocks of 64: .64 is a network ID and .127 its broadcast. /21 blocks of 8 in the 3rd octet: 172.16.8.0–172.16.15.255, so 8.255 is a host and 15.255 the broadcast. 192.168.1.0/23 sits inside 192.168.0.0–192.168.1.255, so it is a host. /29 blocks of 8: .40–.47 makes .47 a broadcast, and .49 is the first host of .48/29. 10.1.1.128/25 is a network ID.',
  },
  {
    id: 'e15',
    type: 'order',
    stem: 'Put the steps of the magic number method for finding a broadcast address in order.',
    items: [
      'Identify the interesting octet of the mask',
      'Subtract the mask value in that octet from 256 to get the block size',
      'Find the largest multiple of the block size that does not exceed the address octet',
      'Add the block size to that multiple to find the next network ID',
      'Subtract one from the next network ID to get the broadcast address',
    ],
    difficulty: 1,
    explanation:
      'The interesting octet tells you where to work, 256 minus its mask value gives the block size, the largest multiple not above the address octet is the network ID, adding the block gives the next network, and one less than that is the broadcast.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: '192.168.100.0/24 is subnetted with a /28 mask. How many subnets are created, and how many usable hosts does each provide?',
    options: ['14 subnets, 16 hosts each', '16 subnets, 16 hosts each', '8 subnets, 30 hosts each', '16 subnets, 14 hosts each'],
    answer: 3,
    difficulty: 1,
    explanation:
      'Borrowing 4 bits (24 → 28) gives 2^4 = **16 subnets**, and the 4 remaining host bits give 2^4 − 2 = **14 hosts** each. "14 subnets" wrongly subtracts 2 from the subnet count, "16 hosts" forgets the network and broadcast addresses, and 8 × 30 describes a /27.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. All PCs use mask 255.255.252.0 and gateway 10.5.8.1. Which PC cannot communicate with its default gateway?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 10.5.8.1/22', x: 5, y: 0.8 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.4 },
          { id: 'p1', icon: 'pc', label: 'PC1', sub: '10.5.11.254', x: 1.2, y: 4.2 },
          { id: 'p2', icon: 'pc', label: 'PC2', sub: '10.5.12.10', x: 3.8, y: 4.2 },
          { id: 'p3', icon: 'pc', label: 'PC3', sub: '10.5.9.0', x: 6.2, y: 4.2 },
          { id: 'p4', icon: 'pc', label: 'PC4', sub: '10.5.10.255', x: 8.8, y: 4.2 },
        ],
        links: [
          { from: 'r1', to: 'sw', fromLabel: 'G0/0/0' },
          { from: 'sw', to: 'p1' },
          { from: 'sw', to: 'p2' },
          { from: 'sw', to: 'p3' },
          { from: 'sw', to: 'p4' },
        ],
      },
    },
    options: ['PC1', 'PC2', 'PC3', 'PC4'],
    answer: 1,
    difficulty: 3,
    explanation:
      'R1\'s 10.5.8.1/22 puts the LAN in 10.5.8.0/22 (magic number 4 in the 3rd octet): **10.5.8.0–10.5.11.255**. PC2\'s 10.5.12.10 belongs to the next subnet, 10.5.12.0/22, so its gateway is off-subnet. PC3 (10.5.9.0) and PC4 (10.5.10.255) look like network and broadcast addresses but are ordinary hosts in a /22, and PC1 (10.5.11.254) is the last usable host.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Which prefix length creates the smallest subnet that can hold 1,000 hosts?',
    answers: ['/22', '22', '255.255.252.0'],
    placeholder: '/nn',
    difficulty: 2,
    explanation: '1,000 + 2 = 1,002, which rounds up to 1,024 = 2^10, so 10 host bits are needed: **/22** (1,022 hosts). A /23 holds only 510 hosts, and a /21 (2,046 hosts) is larger than necessary.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'An engineer needs at least 12 subnets from 192.168.10.0/24 and wants the maximum number of hosts per subnet. Which mask should be used?',
    options: ['255.255.255.224', '255.255.255.248', '255.255.255.240', '255.255.255.252'],
    answer: 2,
    difficulty: 2,
    explanation:
      '12 subnets need 4 borrowed bits (2^4 = 16), giving /28 = **255.255.255.240** with 14 hosts each. 255.255.255.224 (/27) yields only 8 subnets, while .248 (/29) and .252 (/30) create more subnets than required but with fewer hosts (6 and 2).',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Which two of the following are invalid subnet masks? (Choose two.)',
    options: ['255.255.255.250', '255.255.254.0', '255.255.225.0', '255.255.255.192', '255.255.248.0'],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '250 = 11111010 and 225 = 11100001 both contain a 0 bit before a 1 bit, so they are not contiguous and cannot be masks. 254 (/23), 192 (/26) and 248 (/21) are all among the nine legal octet values.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two addresses can be assigned to hosts on the LAN connected to GigabitEthernet0/0/0? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface GigabitEthernet0/0/0
Building configuration...

Current configuration : 102 bytes
!
interface GigabitEthernet0/0/0
 ip address 172.16.33.1 255.255.240.0
 negotiation auto
end`,
    },
    options: ['172.16.47.254', '172.16.40.0', '172.16.48.1', '172.16.31.254', '172.16.47.255', '172.16.32.0'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '255.255.240.0 is a /20 with magic number 16 in the 3rd octet; 33 falls in the 32 block, so the LAN is **172.16.32.0–172.16.47.255**. 172.16.47.254 (the last usable host) and 172.16.40.0 (a .0 address inside the range) are valid. 172.16.32.0 is the network ID, 172.16.47.255 the broadcast, and 172.16.48.1 and 172.16.31.254 lie in neighboring subnets.',
  },
  {
    id: 'e22',
    type: 'input',
    stem: 'What is the broadcast address of the subnet that contains 10.130.4.5/9?',
    answers: ['10.255.255.255'],
    placeholder: 'a.b.c.d',
    difficulty: 3,
    explanation:
      '/9 = 255.128.0.0: the 2nd octet is interesting and the magic number is 128, giving subnets 10.0.0.0 and 10.128.0.0. 130 falls in the 128 block, so the network is 10.128.0.0 and the broadcast is **10.255.255.255**. 10.130.255.255 would treat the mask as a /16.',
  },
  {
    id: 'e23',
    type: 'multi',
    stem: 'Which two statements about the subnet 172.16.0.0/18 are true? (Choose two.)',
    options: [
      'It is a valid subnet that can be assigned to a router interface',
      'Its broadcast address is 172.16.63.255',
      'It cannot be used because it is subnet zero',
      'It contains 16,384 usable host addresses',
      'The next /18 subnet is 172.16.32.0',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Subnet zero is valid (`ip subnet-zero` is the default), and with magic number 64 in the 3rd octet the next subnet is 172.16.64.0, so the broadcast is **172.16.63.255**. The subnet has 2^14 − 2 = 16,382 usable hosts (16,384 is the total address count), and 172.16.32.0 would be the next subnet only for a /19.',
  },
  {
    id: 'e24',
    type: 'single',
    stem: 'Refer to the exhibit. A technician configured a server with these static settings, and the server cannot communicate. What is the problem?',
    exhibit: {
      kind: 'table',
      columns: ['Setting', 'Value'],
      rows: [
        ['IPv4 address', '172.31.203.255'],
        ['Prefix length', '/22'],
        ['Default gateway', '172.31.200.1'],
      ],
    },
    options: [
      'It is the network address of 172.31.203.0/22',
      'The gateway is not in the same subnet as the server',
      'Nothing: it is a valid host address',
      'It is the broadcast address of 172.31.200.0/22',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      '/22 has magic number 4 in the 3rd octet: …200, 204… 203 falls in the 200 block, so the subnet is 172.31.200.0/22 and its broadcast is 200 + 4 − 1 = 203 → **172.31.203.255**, exactly the configured address. 172.31.203.0 is not a /22 boundary, the gateway 172.31.200.1 *is* inside the subnet, and a broadcast address can never be assigned to a host.',
  },
  {
    id: 'e25',
    type: 'match',
    stem: 'Match each requirement to the most efficient prefix length.',
    pairs: [
      { left: 'Router-to-router link, network and broadcast reserved', right: '/30' },
      { left: 'Router-to-router link addressed per RFC 3021', right: '/31' },
      { left: 'LAN with 14 hosts', right: '/28' },
      { left: 'LAN with 25 hosts', right: '/27' },
      { left: 'LAN with 120 hosts', right: '/25' },
      { left: 'Loopback interface or host route', right: '/32' },
    ],
    difficulty: 2,
    explanation:
      'Traditional point-to-point links use /30 (2 usable of 4), RFC 3021 links use /31 (both addresses usable). 14 hosts fit exactly in a /28 (2^4 − 2), 25 hosts need a /27 (30), 120 hosts need a /25 (126), and a single address is a /32.',
  },
];
