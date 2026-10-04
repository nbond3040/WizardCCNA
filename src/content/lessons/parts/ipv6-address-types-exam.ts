import type { Question } from '../../types';

const R2_V6_INT = `R2# show ipv6 interface GigabitEthernet0/0/1
GigabitEthernet0/0/1 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::2
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:DB8:ACAD:12::2, subnet is 2001:DB8:ACAD:12::/64
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::5
    FF02::1:FF00:2
  MTU is 1500 bytes
<output omitted>
  ND DAD is enabled, number of DAD attempts: 1
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  Hosts use stateless autoconfig for addresses.`;

const WIN_IPCONFIG = `C:\\> ipconfig

Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   IPv6 Address. . . . . . . . . . . : 2001:db8:acad:1:9d4c:21e7:5a3b:c10f
   Temporary IPv6 Address. . . . . . : 2001:db8:acad:1:3582:e9d1:77a0:4b6c
   Link-local IPv6 Address . . . . . : fe80::4c1b:7e2a:90d5:e3f8%12
   IPv4 Address. . . . . . . . . . . : 10.1.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : fe80::1%12
                                       10.1.1.1`;

const R1_NEIGHBORS = `R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
FE80::21A:2BFF:FE3C:4D5E                    0 001a.2b3c.4d5e  REACH Gi0/0/0
2001:DB8:ACAD:1:21A:2BFF:FE3C:4D5E          2 001a.2b3c.4d5e  STALE Gi0/0/0
FE80::2                                     1 0c22.2222.0001  REACH Gi0/0/1`;

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which IPv6 address is a unique local address?',
    options: ['FD12:3456:789A:1::10', 'FE80::1', '2001:DB8:ACAD::10', 'FF02::1:FF00:10'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Unique local addresses come from FC00::/7 and in practice begin with **FD**. FE80::1 is link-local, 2001:DB8:ACAD::10 is a global unicast (documentation) address, and FF02::1:FF00:10 is a solicited-node multicast group.',
  },
  {
    id: 'e2',
    type: 'categorize',
    stem: 'Drag each IPv6 address into the correct address type.',
    categories: ['Global unicast', 'Unique local', 'Link-local', 'Multicast'],
    items: [
      { text: '2001:DB8:A::1', category: 0 },
      { text: '2600:1F18::10', category: 0 },
      { text: 'FDAB:1:2:3::9', category: 1 },
      { text: 'FD00:AB::1', category: 1 },
      { text: 'FE80::21A:2BFF:FE3C:4D5E', category: 2 },
      { text: 'FE80::1', category: 2 },
      { text: 'FF02::A', category: 3 },
      { text: 'FF05::1:3', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'Addresses starting with 2 or 3 are global unicast (2000::/3), FD is unique local (FC00::/7), FE80 is link-local (FE80::/10) and FF is multicast (FF00::/8) whatever the scope digit. FF05::1:3 is a site-scope multicast group, not a unicast address.',
  },
  {
    id: 'e3',
    type: 'input',
    stem: 'Interface G0/0/1 on a router has MAC address 3c8a.b0cd.1234 and is configured with `ipv6 address 2001:DB8:5:5::/64 eui-64`. Which global unicast address does the interface use? (Use compressed format.)',
    answers: ['2001:DB8:5:5:3E8A:B0FF:FECD:1234', '2001:0DB8:0005:0005:3E8A:B0FF:FECD:1234'],
    placeholder: '2001:DB8:5:5:....',
    difficulty: 3,
    explanation:
      'Split the MAC into 3C8AB0 and CD1234, insert FFFE to get 3C8A:B0FF:FECD:1234, then flip the 7th bit: the second hex digit C (1100) becomes E (1110), so 3C becomes **3E**. Appending the interface ID to the prefix gives **2001:DB8:5:5:3E8A:B0FF:FECD:1234**. Leaving 3C unchanged or placing FFFE at the end are the usual mistakes.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Which interface ID results from applying modified EUI-64 to MAC address 0200.5E10.00AB?',
    options: ['0:5EFF:FE10:AB', '200:5EFF:FE10:AB', '4200:5EFF:FE10:AB', '0:5E10:FFFE:AB'],
    answer: 0,
    difficulty: 3,
    explanation:
      'Split into 02005E and 1000AB and insert FFFE: 0200:5EFF:FE10:00AB. The first byte, 02, already has the U/L bit set, so **flipping** it clears it to 00, giving 0000:5EFF:FE10:00AB, written **0:5EFF:FE10:AB**. 200:5EFF:FE10:AB forgets to flip, 4200:5EFF:FE10:AB flips a bit counted from the wrong end, and 0:5E10:FFFE:AB puts FFFE in the wrong place.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. Which solicited-node multicast group does the host join for the address shown as IPv6 Address?',
    exhibit: { kind: 'cli', text: WIN_IPCONFIG },
    options: ['FF02::1:FF3B:C10F', 'FF02::1:FF00:C10F', 'FF02::2:FF3B:C10F', 'FF02::1:FF5A:3BC1'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The address ends in ...5a3b:c10f, so its last 24 bits are **3B:C10F**, and the group is FF02::1:FF plus those bits: **FF02::1:FF3B:C10F**. FF02::1:FF00:C10F keeps only 16 bits, FF02::2 is the all-routers prefix rather than FF02::1:FF, and FF02::1:FF5A:3BC1 takes the wrong six digits.',
  },
  {
    id: 'e6',
    type: 'input',
    stem: 'What destination MAC address does an Ethernet frame use to carry a packet addressed to FF02::1:FF3C:4D5E? (Cisco dotted format.)',
    answers: ['3333.FF3C.4D5E', '33:33:FF:3C:4D:5E', '33-33-FF-3C-4D-5E'],
    placeholder: 'xxxx.xxxx.xxxx',
    difficulty: 2,
    explanation:
      'IPv6 multicast maps to a MAC address of **33:33** followed by the last 32 bits of the group. The last 32 bits of FF02::1:FF3C:4D5E are FF3C:4D5E, so the MAC is **3333.FF3C.4D5E**.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each IPv6 multicast address to its group.',
    pairs: [
      { left: '`FF02::1`', right: 'All nodes on the link' },
      { left: '`FF02::2`', right: 'All routers on the link' },
      { left: '`FF02::5`', right: 'All OSPFv3 routers' },
      { left: '`FF02::6`', right: 'OSPFv3 DR and BDR' },
      { left: '`FF02::A`', right: 'EIGRP for IPv6 routers' },
      { left: '`FF02::1:2`', right: 'DHCPv6 servers and relay agents' },
    ],
    difficulty: 2,
    explanation:
      'FF02::1 and FF02::2 are all nodes and all routers. OSPFv3 uses ::5 and ::6 like OSPFv2 (224.0.0.5/6), EIGRP for IPv6 uses ::A like 224.0.0.10, and FF02::1:2 reaches DHCPv6 servers and relays.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the events in order for a host that uses SLAAC after connecting to a new link.',
    items: [
      'The host creates its link-local address and checks it with DAD',
      'The host sends a Router Solicitation to FF02::2',
      'The router replies with a Router Advertisement containing the /64 prefix',
      'The host builds a global address from the prefix and an interface ID',
      'The host sends a Neighbor Solicitation from :: to test the new address',
      'No Neighbor Advertisement arrives, so the address becomes usable',
    ],
    difficulty: 2,
    explanation:
      'The link-local address comes first because NDP messages need it. The host then solicits an RA, combines the advertised prefix with its interface ID, and runs DAD before using the new address; silence means the address is unique.',
  },
  {
    id: 'e9',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: R2_V6_INT },
    options: [
      'R2 is running OSPFv3 on the interface',
      'Hosts on the link are told to use SLAAC for their addresses',
      'R2 is running EIGRP for IPv6 on the interface',
      'The global unicast address was built with EUI-64',
      'R2 is not acting as an IPv6 router',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'FF02::5 among the joined groups means **OSPFv3** runs on the interface, and *Hosts use stateless autoconfig for addresses* means the RA has the M flag clear, so hosts use **SLAAC**. EIGRP for IPv6 would add FF02::A. The global address has no [EUI] tag and a manual interface ID of ::2. Joining FF02::2 and sending RAs shows that R2 does route IPv6.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Which ICMPv6 message does a host send to ask routers on its link to advertise immediately?',
    options: ['Router Solicitation', 'Router Advertisement', 'Neighbor Solicitation', 'Neighbor Advertisement'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A **Router Solicitation** (type 133) asks routers to send an RA now instead of waiting for the periodic one. RAs are the routers\' answer, and NS/NA are used for address resolution and DAD.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Which destination address does a host use when it sends a Router Solicitation?',
    options: ['FF02::2', 'FF02::1', 'FF02::1:FF00:1', 'FE80::1'],
    answer: 0,
    difficulty: 2,
    explanation:
      'RS messages go to the all-routers group **FF02::2**. FF02::1 is where routers send periodic RAs, FF02::1:FF00:1 is a solicited-node group used by neighbor solicitations, and the host does not yet know any router address such as FE80::1 when it solicits.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. PCs on the G0/0/1 LAN build SLAAC addresses correctly but never contact the stateless DHCPv6 server on the same link, so they have no DNS servers. Which interface command fixes the problem?',
    exhibit: { kind: 'cli', text: R2_V6_INT },
    options: ['`ipv6 nd other-config-flag`', '`ipv6 nd managed-config-flag`', '`ipv6 address autoconfig`', '`ipv6 address dhcp`'],
    answer: 0,
    difficulty: 3,
    explanation:
      'The exhibit shows only *Hosts use stateless autoconfig for addresses*, so the O flag is clear and hosts never ask DHCPv6 for DNS. `ipv6 nd other-config-flag` sets the **O flag**, telling hosts to keep SLAAC for addresses and fetch other information from the stateless DHCPv6 server. The managed flag would tell hosts to get addresses from DHCPv6, which a stateless server does not assign. `ipv6 address autoconfig` and `ipv6 address dhcp` make the router itself a client instead of changing what it advertises.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements about IPv6 duplicate address detection are true? (Choose two.)',
    options: [
      'The host sends a Neighbor Solicitation for its own tentative address',
      'The DAD message uses the unspecified address :: as its source',
      'The host broadcasts an ARP request for its own address',
      'DAD is performed only for global unicast addresses',
      'A Router Advertisement tells the host whether its address is a duplicate',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'DAD is a **Neighbor Solicitation** for the tentative address, sent from the **unspecified address ::** because the new address cannot be used yet; an NA in reply reveals a duplicate. IPv6 has no ARP or broadcast, DAD also runs for link-local addresses, and routers play no part in the check.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Which statement describes an IPv6 anycast address?',
    options: [
      'A unicast address shared by several devices; every packet goes to the nearest one',
      'An address from FF00::/8 that every node on the link joins to receive its packets',
      'An address from a reserved anycast block, FC00::/7, set aside for routers',
      'An address that delivers each packet to every device on the same link',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Anycast reuses an ordinary **unicast** address on several devices, and routing delivers each packet to the **nearest** one. FF00::/8 is multicast, FC00::/7 is unique local (there is no anycast block), and delivery to every device describes multicast to FF02::1.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two IPv6 destination addresses are valid only on the local link, so that routers never forward packets sent to them? (Choose two.)',
    options: ['FE80::1', 'FF02::1:FF4D:5E6F', 'FD00:1:2:3::10', '2001:DB8:1::1', 'FF05::1:3'],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'FE80 addresses are **link-local**, and FF02 groups have **link-local scope**, so routers never forward either. FD00:1:2:3::10 is a unique local address routed inside the organization, 2001:DB8:1::1 is global unicast, and FF05::1:3 has site-local scope, so it can cross routers inside the site.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. How did the host with MAC address 001a.2b3c.4d5e most likely create its global unicast address?',
    exhibit: { kind: 'cli', text: R1_NEIGHBORS },
    options: [
      'SLAAC with a modified EUI-64 interface ID',
      'SLAAC with a randomly generated interface ID',
      'Stateful DHCPv6 assigned the address',
      'It copied the router interface ID from the RA',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The interface ID 21A:2BFF:FE3C:4D5E is the MAC 001a.2b3c.4d5e with FFFE inserted in the middle and the first byte changed from 00 to 02: the signature of **modified EUI-64**. A random interface ID would bear no relation to the MAC, DHCPv6 servers assign addresses from a pool rather than deriving them this way, and an RA carries a prefix, never an interface ID.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: { kind: 'cli', text: R1_NEIGHBORS },
    options: [
      'R1 learned these entries with Neighbor Solicitation and Advertisement messages',
      'The host with MAC 001a.2b3c.4d5e has a link-local and a global address',
      'R1 used ARP requests on each interface to learn the MAC addresses',
      'The STALE entry can no longer be used to send traffic until R1 relearns it',
      'FE80::2 is a global unicast address that R1 learned from the neighbor table',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'IPv6 resolves neighbors with **NS and NA** messages, not ARP. Two entries map to 001a.2b3c.4d5e, one link-local and one global, so that host uses **both**. A STALE entry is still used; the router simply re-verifies reachability when it sends traffic. FE80::2 is a link-local address.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Which multicast address do OSPFv3 routers use to reach all OSPF routers on a link?',
    answers: ['FF02::5', 'FF02:0:0:0:0:0:0:5', 'FF02:0000:0000:0000:0000:0000:0000:0005'],
    placeholder: 'FF02::',
    difficulty: 1,
    explanation: 'OSPFv3 uses **FF02::5** for all SPF routers and FF02::6 for the DR and BDR, mirroring 224.0.0.5 and 224.0.0.6 in OSPFv2.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A company needs IPv6 addresses for internal servers that are routable between its own sites but never reachable from the Internet, without depending on an ISP prefix. Which prefix should it use?',
    options: ['FD4A:9C21:77B0::/48', 'FE80::/10', '2001:DB8:ACAD:1::/64', 'FF05::/16'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A **unique local** /48 such as FD4A:9C21:77B0::/48 (random Global ID) is routable inside the organization and never on the Internet. FE80::/10 cannot be routed between sites, 2001:DB8:ACAD:1::/64 sits in the 2001:DB8::/32 range reserved for documentation, and FF05::/16 is site-scope multicast, not unicast.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. How did the host most likely learn its IPv6 default gateway?',
    exhibit: { kind: 'cli', text: WIN_IPCONFIG },
    options: [
      'From the source address of a Router Advertisement',
      "From the default-router option of a DHCPv6 server",
      'From a manual entry, because link-local gateways cannot be learned',
      'From the DNS server configured on the host',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IPv6 hosts use the **source of the RA**, the router\'s link-local address, as their default gateway; here fe80::1, with %12 identifying the host interface (zone). DHCPv6 has no default-router option, link-local gateways are the normal automatic result, and DNS has nothing to do with gateway selection.',
  },
  {
    id: 'e21',
    type: 'categorize',
    stem: 'Classify each method by where the IPv6 address comes from.',
    categories: ['The host creates its own address', 'A DHCPv6 server assigns the address'],
    items: [
      { text: 'SLAAC with M=0 and O=0', category: 0 },
      { text: 'SLAAC plus stateless DHCPv6 (M=0, O=1)', category: 0 },
      { text: 'Router interface with `ipv6 address autoconfig`', category: 0 },
      { text: 'Stateful DHCPv6 (M=1)', category: 1 },
      { text: 'Router interface with `ipv6 address dhcp`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'SLAAC, with or without stateless DHCPv6, and `ipv6 address autoconfig` all build the address on the host from the RA prefix. Only stateful DHCPv6, which `ipv6 address dhcp` requests on a router interface, has a server assign the address itself.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. The addresses on G0/0/0 were created with EUI-64. What is the MAC address of GigabitEthernet0/0/0?',
    exhibit: {
      kind: 'cli',
      text: `R3# show ipv6 interface brief
GigabitEthernet0/0/0   [up/up]
    FE80::5675:D0FF:FEA1:B2C3
    2001:DB8:3:3:5675:D0FF:FEA1:B2C3
GigabitEthernet0/0/1   [administratively down/down]
    unassigned`,
    },
    options: ['5475.d0a1.b2c3', '5675.d0a1.b2c3', '5775.d0a1.b2c3', '5475.d0ff.a1b2'],
    answer: 0,
    difficulty: 3,
    explanation:
      'Reverse the process: remove FFFE from 5675:D0FF:FEA1:B2C3 to get 5675D0 A1B2C3, then flip the 7th bit back: the second digit 6 (0110) becomes 4 (0100). The MAC is **5475.d0a1.b2c3**. 5675.d0a1.b2c3 forgets to flip, 5775.d0a1.b2c3 flips the lowest bit instead, and 5475.d0ff.a1b2 leaves part of FFFE in place.',
  },
];
