import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'input',
    stem: 'Which layer of the hierarchical campus design provides PoE, port security and VLAN assignment directly to endpoints? (One word.)',
    answers: ['access', 'access layer'],
    placeholder: 'layer',
    difficulty: 1,
    explanation:
      'The **access** layer is where endpoints connect, so endpoint-facing features such as PoE, port security, 802.1X and VLAN assignment live there. Distribution handles routing and policy, and the core handles fast transport.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which link does not follow Cisco hierarchical campus design guidelines?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5.4,
        nodes: [
          { id: 'c1', icon: 'l3switch', label: 'CORE1', x: 3.5, y: 0.9 },
          { id: 'c2', icon: 'l3switch', label: 'CORE2', x: 6.5, y: 0.9 },
          { id: 'd1', icon: 'l3switch', label: 'DSW1', x: 3.5, y: 2.7 },
          { id: 'd2', icon: 'l3switch', label: 'DSW2', x: 6.5, y: 2.7 },
          { id: 'a1', icon: 'switch', label: 'ASW1', x: 2, y: 4.6 },
          { id: 'a2', icon: 'switch', label: 'ASW2', x: 8, y: 4.6 },
        ],
        links: [
          { from: 'c1', to: 'c2', label: 'Link 1' },
          { from: 'd1', to: 'c1' },
          { from: 'd1', to: 'c2' },
          { from: 'd2', to: 'c1' },
          { from: 'd2', to: 'c2' },
          { from: 'd1', to: 'd2', label: 'Link 2' },
          { from: 'a1', to: 'd1' },
          { from: 'a1', to: 'd2' },
          { from: 'a2', to: 'd1' },
          { from: 'a2', to: 'd2', label: 'Link 3' },
          { from: 'a1', to: 'a2', label: 'Link 4' },
        ],
      },
    },
    options: [
      'Link 1 between CORE1 and CORE2',
      'Link 2 between DSW1 and DSW2',
      'Link 3 between ASW2 and DSW2',
      'Link 4 between ASW1 and ASW2',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Access switches uplink only to the distribution layer; a direct **access-to-access** link bypasses the hierarchy and creates extra Layer 2 paths through the edge. The core pair interconnect (Link 1) and the link within a distribution pair (Link 2) are standard, and Link 3 is part of the recommended dual-homing of each access switch to both distribution switches.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two functions are typically performed at the distribution layer? (Choose two.)',
    options: [
      'Inter-VLAN routing and default gateways with an FHRP',
      'Route summarization toward the core',
      'PoE for IP phones and access points',
      'Port security on user-facing ports',
      'High-speed transport between buildings with minimal policy',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The distribution layer is the Layer 2/Layer 3 boundary: it routes between VLANs, provides FHRP gateways, applies policy and **summarizes routes** toward the core. PoE and port security are access-layer features, and fast transport with minimal policy describes the core.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'A company occupies one building with ten access switches and does not expect to grow. Which campus design is the most cost-effective?',
    options: [
      'Two-tier (collapsed core)',
      'Three-tier with a dedicated core',
      'Spine-leaf',
      'A full mesh between all access switches',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A single building with one distribution block fits a **two-tier** design: one switch pair provides both core and distribution functions, saving the cost of separate core switches. A dedicated core pays off only with many distribution blocks, spine-leaf is a data center design, and meshing access switches violates the hierarchy.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'A university has twelve buildings, each with its own pair of distribution switches, and plans to add more. Which design best connects the buildings?',
    options: [
      'A three-tier design with a dedicated pair of core switches',
      'A two-tier design in which every distribution pair connects directly to every other pair',
      'A spine-leaf fabric in which each building\'s distribution switches act as spines',
      'A single core switch in a star, connected to every building',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'With many distribution blocks and planned growth, a **dedicated core** lets each block connect only to the core pair. Meshing twelve blocks directly would need 12 × 11 / 2 = 66 inter-block connections and grow with every new building. Spine-leaf is a data center design, and a single core switch is a single point of failure.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Which connection violates spine-leaf design rules?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5.4,
        nodes: [
          { id: 's1', icon: 'l3switch', label: 'Spine1', x: 3.5, y: 0.9 },
          { id: 's2', icon: 'l3switch', label: 'Spine2', x: 6.5, y: 0.9 },
          { id: 'l1', icon: 'switch', label: 'Leaf1', x: 1.4, y: 2.9 },
          { id: 'l2', icon: 'switch', label: 'Leaf2', x: 4, y: 2.9 },
          { id: 'l3', icon: 'switch', label: 'Leaf3', x: 6, y: 2.9 },
          { id: 'l4', icon: 'switch', label: 'Leaf4', sub: 'border leaf', x: 8.6, y: 2.9 },
          { id: 'fw', icon: 'firewall', label: 'Firewall', x: 1.4, y: 4.7 },
          { id: 'wan', icon: 'router', label: 'WAN router', x: 8.6, y: 4.7 },
        ],
        links: [
          { from: 'l1', to: 's1' },
          { from: 'l1', to: 's2' },
          { from: 'l2', to: 's1' },
          { from: 'l2', to: 's2' },
          { from: 'l3', to: 's1' },
          { from: 'l3', to: 's2' },
          { from: 'l4', to: 's1' },
          { from: 'l4', to: 's2' },
          { from: 'l2', to: 'l3' },
          { from: 'fw', to: 'l1' },
          { from: 'wan', to: 'l4' },
        ],
      },
    },
    options: ['Leaf4 to the WAN router', 'Leaf2 to Leaf3', 'The firewall to Leaf1', 'Leaf3 to Spine2'],
    answer: 1,
    difficulty: 3,
    explanation:
      'Leaves must never connect to each other, so the **Leaf2-Leaf3** link breaks the design. Firewalls, routers and other devices are endpoints of the fabric and correctly attach to leaves; a leaf that connects to the WAN is simply a border leaf. Leaf3 to Spine2 is one of the required leaf-to-every-spine links.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Refer to the exhibit. The data center fabric has exactly two spines. Which two conclusions are correct? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `Leaf3# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
Spine1           Ten 1/1/1         152             R S I  C9500-32C Hun 1/0/3
Spine2           Ten 1/1/2         147             R S I  C9500-32C Hun 1/0/3
Leaf4            Ten 1/1/4         161             R S I  C9300-48T Ten 1/1/4

Total cdp entries displayed : 3`,
    },
    options: [
      'Leaf3 is correctly connected to every spine',
      'The link from Leaf3 Ten 1/1/4 to Leaf4 violates the design and should be removed',
      'Leaf3 should also connect to every other leaf for extra redundancy',
      'Spine1 and Spine2 should be linked directly to each other',
      'Servers should be moved from Leaf3 and attached to the spines',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'CDP shows Leaf3 connected to **both** spines, which satisfies the every-leaf-to-every-spine rule, and also to **Leaf4**, a leaf-to-leaf link that violates the design. Leaves never interconnect, spines never interconnect, and servers always attach to leaves, so the other options would break the fabric further.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'A spine-leaf fabric has 4 spine switches and 12 leaf switches. How many leaf-to-spine links are required?',
    answers: ['48'],
    placeholder: 'links',
    difficulty: 2,
    explanation: 'Every leaf connects to every spine, so the fabric needs spines × leaves = 4 × 12 = **48** links. There are no leaf-to-leaf or spine-to-spine links to add.',
  },
  {
    id: 'e9',
    type: 'input',
    stem: 'How many links are required to connect 7 sites in a full mesh?',
    answers: ['21'],
    placeholder: 'links',
    difficulty: 2,
    explanation: 'A full mesh of n nodes needs n(n − 1)/2 links: 7 × 6 / 2 = **21**.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Which physical topology provides a direct link between every pair of nodes?',
    options: ['Full mesh', 'Partial mesh', 'Extended star', 'Star'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Only a **full mesh** links every node to every other node, giving maximum redundancy at the highest cost. A partial mesh connects only some pairs, and star topologies connect everything through a central device.',
  },
  {
    id: 'e11',
    type: 'match',
    stem: 'Match each physical topology to its description.',
    pairs: [
      { left: 'Star', right: 'All devices connect to one central device' },
      { left: 'Extended star', right: 'Several stars joined through a central device' },
      { left: 'Full mesh', right: 'Every node is linked to every other node' },
      { left: 'Partial mesh', right: 'Only selected nodes have redundant links' },
      { left: 'Hybrid', right: 'A combination of different topologies' },
    ],
    difficulty: 1,
    explanation:
      'A star centers on one device, an extended star joins several stars, a full mesh links every pair, a partial mesh adds links only where needed, and a hybrid combines these shapes, as most real networks do.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Which term best describes this WAN topology?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'a', icon: 'router', label: 'A', x: 2, y: 1.2 },
          { id: 'b', icon: 'router', label: 'B', x: 8, y: 1.2 },
          { id: 'c', icon: 'router', label: 'C', x: 2, y: 3.8 },
          { id: 'd', icon: 'router', label: 'D', x: 8, y: 3.8 },
        ],
        links: [
          { from: 'a', to: 'b' },
          { from: 'a', to: 'c' },
          { from: 'a', to: 'd' },
          { from: 'b', to: 'd' },
        ],
      },
    },
    options: ['Full mesh', 'Partial mesh', 'Star', 'Extended star'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Four routers would need 4 × 3 / 2 = 6 links for a full mesh; this design has 4, adding a B-D link beyond A\'s hub connections, so it is a **partial mesh**. It is not a star, because B and D also connect directly to each other, and not a full mesh, because the B-C and C-D links are missing.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two functions are normally built into an all-in-one SOHO wireless router? (Choose two.)',
    options: [
      'A DHCP server for LAN clients',
      'NAT/PAT so that all devices share one public address',
      'BGP peering with multiple ISPs',
      'Centralized management of hundreds of lightweight APs',
      'Dual-homed uplinks to a distribution switch pair',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A SOHO router combines routing, a few switch ports, a wireless AP, a firewall, a **DHCP server** and **NAT/PAT**. Multi-ISP BGP, managing hundreds of APs (a WLC\'s job) and dual-homed distribution uplinks belong to enterprise designs.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. The laptop receives 192.168.1.23 from the SOHO router, yet web servers on the Internet see its traffic arriving from 203.0.113.45. Which router function explains this?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'lap', icon: 'laptop', label: 'Laptop', sub: '192.168.1.23', x: 1, y: 1.5 },
          { id: 'rtr', icon: 'router', label: 'SOHO router', sub: 'LAN .1 · WAN 203.0.113.45', x: 4.2, y: 1.5, tone: 'accent' },
          { id: 'modem', icon: 'modem', label: 'Modem', x: 6.8, y: 1.5 },
          { id: 'inet', icon: 'internet', label: 'Internet', x: 9, y: 1.5 },
        ],
        links: [
          { from: 'lap', to: 'rtr', style: 'wireless' },
          { from: 'rtr', to: 'modem' },
          { from: 'modem', to: 'inet' },
        ],
      },
    },
    options: ['PAT (NAT overload)', 'DHCP', 'The built-in wireless access point', 'The stateful firewall'],
    answer: 0,
    difficulty: 2,
    explanation:
      '**PAT** rewrites the private source address 192.168.1.23 (and its source port) to the router\'s public WAN address 203.0.113.45. DHCP only assigned the private address, the AP only provides the wireless link, and the firewall filters traffic without changing addresses.',
  },
  {
    id: 'e15',
    type: 'categorize',
    stem: 'Drag each description to the deployment model it describes.',
    categories: ['On-premises', 'Public cloud', 'Private cloud', 'Hybrid cloud'],
    items: [
      { text: 'Company-owned servers in its own data center, run by its own staff', category: 0 },
      { text: 'Capacity must be purchased up front for peak demand', category: 0 },
      { text: 'Provider infrastructure shared by many customers, billed by usage', category: 1 },
      { text: 'Resources added within minutes from a provider\'s shared pool', category: 1 },
      { text: 'Self-service, automated infrastructure dedicated to one organization', category: 2 },
      { text: 'Regulated data kept in-house while web servers scale in a provider\'s cloud', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'On-premises means owning and running the infrastructure yourself. Public cloud is shared, elastic and pay-as-you-go. Private cloud brings cloud-style automation to infrastructure dedicated to one organization. Hybrid cloud combines on-premises or private resources with public cloud.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Which traffic pattern is a spine-leaf architecture primarily designed to handle efficiently?',
    options: ['East-west (server to server)', 'North-south (users to servers)', 'Broadcast', 'Multicast'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Spine-leaf gives every server-to-server path the same length and uses all links, which suits **east-west** traffic inside the data center. Traditional three-tier data centers were built mainly for north-south traffic, and broadcast or multicast handling is not what defines the architecture.',
  },
  {
    id: 'e17',
    type: 'order',
    stem: 'Refer to the exhibit. Put the path of a packet from Server A to Server B in order.',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5.4,
        nodes: [
          { id: 's1', icon: 'l3switch', label: 'Spine1', x: 3.5, y: 1 },
          { id: 's2', icon: 'l3switch', label: 'Spine2', x: 6.5, y: 1 },
          { id: 'l1', icon: 'switch', label: 'Leaf1', x: 2, y: 3 },
          { id: 'l2', icon: 'switch', label: 'Leaf2', x: 5, y: 3 },
          { id: 'l3', icon: 'switch', label: 'Leaf3', x: 8, y: 3 },
          { id: 'sa', icon: 'server', label: 'Server A', x: 2, y: 4.7 },
          { id: 'sb', icon: 'server', label: 'Server B', x: 8, y: 4.7 },
        ],
        links: [
          { from: 'l1', to: 's1' },
          { from: 'l1', to: 's2' },
          { from: 'l2', to: 's1' },
          { from: 'l2', to: 's2' },
          { from: 'l3', to: 's1' },
          { from: 'l3', to: 's2' },
          { from: 'sa', to: 'l1' },
          { from: 'sb', to: 'l3' },
        ],
      },
    },
    items: [
      'Server A sends the packet to Leaf1',
      'Leaf1 forwards it to one of the spines',
      'The spine forwards it to Leaf3',
      'Leaf3 delivers it to Server B',
    ],
    difficulty: 2,
    explanation:
      'Traffic between servers on different leaves always follows leaf, spine, leaf. Leaf1 can choose either spine (equal-cost paths), the spine forwards to Leaf3, and Leaf3 delivers the packet. Leaf2 is never involved because leaves do not forward traffic for other leaves.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'An engineer proposes connecting the two spine switches of a data center fabric directly to each other for extra redundancy. What is the best response?',
    options: [
      'Do not add it: spines never interconnect, and leaf-to-spine links already provide redundancy',
      'Add it: the spines must be linked directly so that they can exchange routes with each other',
      'Add it: otherwise leaves attached to different spines would have no path to each other',
      'Add it: a spine-to-spine link shortens the path and lowers leaf-to-leaf latency',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Spine-to-spine links are **not** part of the design. Because every leaf connects to every spine, any leaf reaches any other leaf through any spine, which already provides redundancy and equal path lengths. Leaves are not attached to particular spines, and a spine-to-spine link would add hops rather than reduce latency.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. A collapsed-core campus has grown to four buildings, and each building\'s distribution pair (shown as one block) links directly to every other block. What should the architect recommend before adding a fifth building?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'b1', icon: 'l3switch', label: 'Block A', x: 2, y: 1.2 },
          { id: 'b2', icon: 'l3switch', label: 'Block B', x: 8, y: 1.2 },
          { id: 'b3', icon: 'l3switch', label: 'Block C', x: 2, y: 3.8 },
          { id: 'b4', icon: 'l3switch', label: 'Block D', x: 8, y: 3.8 },
        ],
        links: [
          { from: 'b1', to: 'b2' },
          { from: 'b1', to: 'b3' },
          { from: 'b1', to: 'b4' },
          { from: 'b2', to: 'b3' },
          { from: 'b2', to: 'b4' },
          { from: 'b3', to: 'b4' },
        ],
      },
    },
    options: [
      'Add a dedicated core layer so that each block connects only to the core switches',
      'Add more links between the existing blocks for extra redundancy',
      'Merge the access layer into the distribution layer',
      'Convert the distribution switches into spines and the access switches into leaves',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The blocks already form a full mesh of 6 links, and a fifth building would need 4 more, with growth accelerating each time. A **dedicated core** (three-tier) means every new block needs only its uplinks to the core pair. Extra links worsen the problem, collapsing access into distribution does not address inter-building connectivity, and spine-leaf is a data center design.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Which statement describes the core layer of a hierarchical campus?',
    options: [
      'It provides fast, resilient transport between distribution blocks with minimal policy',
      'It is where end users, IP phones and wireless access points connect',
      'It is where port security, 802.1X and DHCP snooping are applied',
      'It is the layer that performs routing, while access and distribution switch frames',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The core exists to move traffic between distribution blocks as fast and reliably as possible, so it avoids CPU-intensive policy. Endpoints, port security, 802.1X and DHCP snooping belong to the access layer, and routing also happens at the distribution layer.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements describe a hybrid cloud? (Choose two.)',
    options: [
      'It combines on-premises or private cloud resources with public cloud resources',
      'It needs connectivity between the environments, such as a VPN or a private link',
      'It is a physical topology that mixes star and mesh designs in one campus',
      'Its resources are owned by the cloud provider and shared with other customers',
      'It is cloud infrastructure dedicated to a single organization and not shared',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A **hybrid cloud** joins on-premises or private resources with a public cloud, and the two must be connected, typically by a site-to-site VPN or a private connection. A mix of star and mesh is a hybrid physical topology, provider-owned resources describe public cloud, and dedicated infrastructure describes private cloud.',
  },
];
