import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which plane builds the routing table by exchanging OSPF messages with neighboring routers?',
    options: ['Data plane', 'Management plane', 'Control plane', 'Policy plane'],
    answer: 2,
    difficulty: 1,
    explanation:
      'Routing protocols such as OSPF are **control plane** processes: they build the tables the data plane uses. The data plane only forwards packets using those tables, the management plane is how administrators reach the device (SSH, SNMP), and the policy plane is an SD-Access term for group-based access control, not a place where routes are built.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about the interfaces labeled A and B is correct?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'app', icon: 'box', label: 'Network applications', x: 1.5, y: 2.5 },
          { id: 'ctl', icon: 'controller', label: 'SDN controller', x: 5, y: 2.5, tone: 'accent' },
          { id: 'sw', icon: 'switch', label: 'Network devices', x: 8.5, y: 2.5 },
        ],
        links: [
          { from: 'app', to: 'ctl', label: 'A' },
          { from: 'ctl', to: 'sw', label: 'B', style: 'dashed' },
        ],
      },
    },
    options: [
      'A is a southbound API and B is a northbound API',
      'A is a northbound API, typically REST; B is a southbound API such as NETCONF or OpenFlow',
      'Both A and B are northbound APIs because the controller sits in the middle',
      'A normally uses OpenFlow and B normally uses REST over HTTPS',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Interface A connects applications to the controller, so it is the northbound API, normally REST over HTTPS with JSON. Interface B connects the controller to the devices, so it is southbound and uses protocols such as NETCONF, RESTCONF, OpenFlow, OpFlex, SSH or SNMP. Swapping the directions is the classic mistake, and the architecture has exactly one northbound and one southbound interface.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which southbound protocol is declarative: the controller communicates the desired policy and the devices decide how to implement it?',
    options: ['OpenFlow', 'NETCONF', 'SNMP', 'OpFlex'],
    answer: 3,
    difficulty: 2,
    explanation:
      '**OpFlex**, used with Cisco ACI, is declarative: it distributes policy and leaves the implementation to the devices. OpenFlow is imperative because the controller installs explicit match-action flow entries. NETCONF configures YANG-modeled data and SNMP polls and sets variables; neither is the declarative policy protocol.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Which two statements about a northbound API are true? (Choose two.)',
    options: [
      'It connects applications to the SDN controller',
      'It is normally NETCONF over SSH to each network device',
      'It is usually a REST API using HTTPS and JSON',
      'It carries OpenFlow flow-table entries to switches',
      'It is how routers exchange OSPF routes',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The northbound API faces the applications and is normally a REST API over HTTPS with JSON. NETCONF and OpenFlow are southbound protocols between the controller and devices, and OSPF route exchange between routers is control-plane traffic that has nothing to do with the controller API.',
  },
  {
    id: 'e5',
    type: 'categorize',
    stem: 'Drag each function to the plane that performs it.',
    categories: ['Data plane', 'Control plane', 'Management plane'],
    items: [
      { text: 'Forwarding a frame using the MAC address table', category: 0 },
      { text: 'Translating an address with NAT', category: 0 },
      { text: 'Building routes with OSPF', category: 1 },
      { text: 'Electing a spanning-tree root bridge', category: 1 },
      { text: 'Learning an IP-to-MAC mapping with ARP', category: 1 },
      { text: 'Configuring a router over an SSH session', category: 2 },
      { text: 'Polling interface counters with SNMP', category: 2 },
    ],
    difficulty: 1,
    explanation:
      'The data plane performs the actual forwarding and packet handling (MAC-table forwarding, NAT translation). The control plane runs the protocols that build the tables (OSPF, STP, ARP). The management plane is how people and tools reach the device (SSH, SNMP).',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer connects to a router as shown. Which statement is correct?',
    exhibit: {
      kind: 'cli',
      text: `$ ssh admin@192.0.2.10 -p 830 -s netconf
<?xml version="1.0" encoding="UTF-8"?>
<hello xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <capabilities>
    <capability>urn:ietf:params:netconf:base:1.0</capability>
    <capability>urn:ietf:params:netconf:base:1.1</capability>
    <capability>urn:ietf:params:netconf:capability:candidate:1.0</capability>
    <capability>urn:ietf:params:netconf:capability:writable-running:1.0</capability>
  </capabilities>
  <session-id>19</session-id>
</hello>
]]>]]>`,
    },
    options: [
      'The engineer opened a NETCONF session over SSH to TCP port 830, a southbound protocol',
      'The engineer is using RESTCONF over HTTPS on TCP port 443 to request a resource URI',
      'The engineer called the northbound REST API of a controller and received a JSON response',
      'The engineer opened an OpenFlow channel and the router replied with its flow table',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The command requests the netconf SSH subsystem on port 830, and the device answers with an XML hello message that lists its NETCONF capabilities and a session ID, which is how every NETCONF session begins. RESTCONF would send HTTPS requests to port 443 for a resource URI and return JSON or XML data, not an SSH hello. A northbound REST call goes to a controller rather than to the router, and OpenFlow is a different protocol that does not use SSH or XML hello messages.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Which term describes the dashed tunnel between Edge 1 and Edge 2?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'pc1', icon: 'laptop', label: 'Host A', x: 0.9, y: 2.5 },
          { id: 'e1', icon: 'switch', label: 'Edge 1', x: 2.9, y: 2.5 },
          { id: 'c1', icon: 'l3switch', label: 'Core', x: 5, y: 0.9 },
          { id: 'e2', icon: 'switch', label: 'Edge 2', x: 7.1, y: 2.5 },
          { id: 'pc2', icon: 'laptop', label: 'Host B', x: 9.1, y: 2.5 },
        ],
        links: [
          { from: 'pc1', to: 'e1' },
          { from: 'e1', to: 'c1' },
          { from: 'c1', to: 'e2' },
          { from: 'e2', to: 'pc2' },
          { from: 'e1', to: 'e2', label: 'Tunnel', style: 'dashed', tone: 'accent' },
        ],
      },
    },
    options: ['Underlay', 'Fabric', 'Overlay', 'Control plane'],
    answer: 2,
    difficulty: 2,
    explanation:
      'A virtual tunnel built across the physical network is the **overlay**. The underlay is the physical IP network the tunnel rides on (the solid links and the core switch), the fabric is the underlay and overlay together, and the control plane is the set of processes that build forwarding tables, not a tunnel.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two statements about VXLAN are correct? (Choose two.)',
    options: [
      'It identifies segments with a 12-bit VLAN ID, giving 4094 segments',
      'It encapsulates the original Ethernet frame in a UDP packet',
      'It is the control plane protocol used by SD-Access fabric nodes',
      'It uses a 24-bit VNI, allowing about 16 million segments',
      'It runs over TCP port 830 between the tunnel endpoints',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'VXLAN is MAC-in-UDP encapsulation (destination port 4789) and its 24-bit VNI gives about 16.7 million segments. A 12-bit identifier describes VLANs (4094 usable IDs), LISP rather than VXLAN is the SD-Access control plane, and TCP port 830 belongs to NETCONF over SSH.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each Cisco SD-Access function with the technology that provides it.',
    pairs: [
      { left: 'Control plane', right: 'LISP' },
      { left: 'Data plane', right: 'VXLAN' },
      { left: 'Policy plane', right: 'Cisco TrustSec security group tags' },
      { left: 'Underlay built by LAN Automation', right: 'IS-IS routing' },
    ],
    difficulty: 2,
    explanation:
      'LISP maps endpoints to locations (control plane), VXLAN carries the traffic between fabric nodes (data plane), TrustSec security group tags provide group-based policy, and Catalyst Center LAN Automation builds the routed underlay with IS-IS.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which assignment of SD-Access fabric roles to the nodes is correct?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'p', icon: 'server', label: 'Node P', sub: 'tracks where every endpoint is located', x: 1.6, y: 1.2 },
          { id: 'q', icon: 'l3switch', label: 'Node Q', sub: 'connects to the WAN router', x: 8.4, y: 1.2 },
          { id: 'r', icon: 'l3switch', label: 'Node R', sub: 'routes IP only, between fabric nodes', x: 5, y: 2.6 },
          { id: 's', icon: 'switch', label: 'Node S', sub: 'connects wired clients and access points', x: 5, y: 4.2 },
        ],
        links: [
          { from: 'p', to: 'r' },
          { from: 'q', to: 'r' },
          { from: 'r', to: 's' },
        ],
      },
    },
    options: [
      'P = border, Q = control plane, R = edge, S = intermediate',
      'P = control plane, Q = edge, R = border, S = intermediate',
      'P = intermediate, Q = control plane, R = border, S = edge',
      'P = control plane, Q = border, R = intermediate, S = edge',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'P tracks endpoint locations, which is the LISP map server job of the control plane node. Q connects the fabric to the WAN router, so it is the border node. R only routes IP between fabric nodes, so it is an intermediate node. S connects wired clients and access points, so it is an edge node. Every other option swaps at least two roles.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two methods can a new switch use to discover Catalyst Center during Plug and Play? (Choose two.)',
    options: [
      'DHCP option 43 in the DHCP offer',
      'A syslog message from the upstream switch',
      'An SNMP trap sent to the default gateway',
      'A DNS lookup of pnpserver in the local domain',
      'An ARP broadcast for the controller address',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'PnP discovery methods include DHCP with vendor-specific option 43, a DNS lookup for pnpserver followed by the local domain, and cloud redirection through Cisco Plug and Play Connect. Syslog and SNMP traps are sent by devices that are already configured and managed, and ARP only resolves IP addresses to MAC addresses on the local segment, so none of them can tell a blank switch where the controller is.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'A network team must upgrade 300 access switches and make sure every one runs the same approved software release. Which Catalyst Center capability is designed for this?',
    options: [
      'Path Trace (flow analysis)',
      'Software Image Management (SWIM)',
      'Assurance (health monitoring)',
      'LAN Automation (underlay setup)',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'SWIM keeps golden images, checks readiness, then distributes and activates software across many devices consistently. Path Trace analyzes the path of a flow, Assurance monitors health with telemetry, and LAN Automation builds the underlay for new switches rather than upgrading existing software.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements describe benefits of controller-based networking compared with traditional box-by-box management? (Choose two.)',
    options: [
      'Switches no longer need a control plane or a hardware forwarding engine',
      'Configuration and policy can be defined once and applied consistently to many devices',
      'The controller forwards all user traffic, which increases throughput',
      'Routing protocols are no longer needed in any Cisco design',
      'A network-wide view enables centralized monitoring and automation',
    ],
    answers: [1, 4],
    difficulty: 3,
    explanation:
      'Defining intent once and having a global view are the real benefits: consistency, speed and visibility. Devices still forward traffic in hardware and many Cisco designs keep a distributed control plane. Controllers are not in the data path, so they do not forward user traffic, and routing protocols are still used, for example in the SD-Access underlay.',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'Place the steps of Plug and Play onboarding in the correct order.',
    items: [
      'The new switch boots with no configuration and sends a DHCP request',
      'The DHCP reply includes option 43 pointing to Catalyst Center',
      'The switch contacts Catalyst Center and is listed as unclaimed',
      'An administrator or rule claims the device and assigns it to a site',
      'Catalyst Center sends the day-0 configuration and, if needed, a software image',
      'The switch reloads and appears as managed in the inventory',
    ],
    difficulty: 2,
    explanation:
      'The device first needs an address and the controller location from DHCP, then it announces itself and waits to be claimed. After the claim assigns it to a site, the controller sends the template-based day-0 configuration (and image if required), and the reloaded device shows up as managed.',
  },
  {
    id: 'e15',
    type: 'categorize',
    stem: 'Classify each interaction as northbound or southbound.',
    categories: ['Northbound', 'Southbound'],
    items: [
      { text: 'A REST call from an ITSM tool to the controller', category: 0 },
      { text: 'A script that calls the controller Intent API', category: 0 },
      { text: 'A dashboard reading controller data over HTTPS and JSON', category: 0 },
      { text: 'A NETCONF session from the controller to a switch', category: 1 },
      { text: 'An OpenFlow flow-table update', category: 1 },
      { text: 'SNMP polling of a router by the controller', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Anything between an application and the controller is northbound and is normally REST. Anything between the controller and a network device (NETCONF, OpenFlow, SNMP, SSH) is southbound.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'In Cisco SD-WAN, which component is first contacted by a new WAN Edge router, authenticates it and tells it which controllers to join?',
    options: [
      'SD-WAN Validator (vBond)',
      'SD-WAN Manager (vManage)',
      'SD-WAN Controller (vSmart)',
      'Another WAN Edge router at the hub',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The Validator is the orchestration plane: it authenticates new devices and points them at the right controllers, and it helps with NAT traversal. The Manager provides the GUI, templates and monitoring, the Controller runs OMP for routes and policy after the device has been admitted, and a hub WAN Edge does not perform onboarding.',
  },
  {
    id: 'e17',
    type: 'match',
    stem: 'Match each Cisco SD-WAN component with its role.',
    pairs: [
      { left: 'SD-WAN Manager', right: 'GUI, templates and monitoring (management plane)' },
      { left: 'SD-WAN Controller', right: 'Runs OMP and distributes routes and policy (control plane)' },
      { left: 'SD-WAN Validator', right: 'Authenticates devices and orchestrates onboarding' },
      { left: 'WAN Edge', right: 'Forms IPsec tunnels and forwards user traffic (data plane)' },
    ],
    difficulty: 2,
    explanation:
      'The Manager is where administrators work, the Controller (formerly vSmart) runs the Overlay Management Protocol, the Validator (formerly vBond) is the first contact for new devices, and the WAN Edge is the only component that carries user traffic.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: "Refer to the exhibit. Which type of interface is the engineer's script using?",
    exhibit: {
      kind: 'cli',
      text: `$ curl -s -H "X-Auth-Token: <token>" -H "Accept: application/json" https://catalyst.example.com/dna/intent/api/v1/network-device/count
{"response": 4, "version": "1.0"}`,
    },
    options: [
      'A southbound SNMP poll of one switch',
      'A NETCONF session that uses a YANG model',
      'A northbound REST API call to the controller',
      'An OpenFlow message to a switch',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The request is an HTTPS GET to the controller host, carrying a token header and returning JSON, and the intent/api path identifies the Catalyst Center Intent API, which is a northbound REST interface. SNMP, NETCONF and OpenFlow are southbound protocols between a controller and devices; they are not invoked with an HTTPS URL that returns a JSON object from a controller.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement best describes how this network is operated?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 's1', icon: 'switch', label: 'SW1', sub: 'own control plane', x: 1.8, y: 1 },
          { id: 's2', icon: 'switch', label: 'SW2', sub: 'own control plane', x: 5, y: 1 },
          { id: 's3', icon: 'switch', label: 'SW3', sub: 'own control plane', x: 8.2, y: 1 },
          { id: 'adm', icon: 'laptop', label: 'Admin', x: 5, y: 4.1 },
        ],
        links: [
          { from: 's1', to: 's2' },
          { from: 's2', to: 's3' },
          { from: 'adm', to: 's1', label: 'SSH', style: 'dashed' },
          { from: 'adm', to: 's2', label: 'SSH', style: 'dashed' },
          { from: 'adm', to: 's3', label: 'SSH', style: 'dashed' },
        ],
      },
    },
    options: [
      'A controller-based network with a centralized control plane and a single GUI',
      'A traditional network with a distributed control plane and box-by-box management',
      'An SD-Access fabric that uses a LISP control plane managed by Catalyst Center',
      'A pure SDN network in which an OpenFlow controller programs the flow tables',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'Each switch runs its own control plane and the administrator opens a separate SSH session to every device, which is the traditional distributed, box-by-box model. There is no controller, no fabric control plane node and no OpenFlow channel in the exhibit.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Classify each item as part of the underlay or the overlay in an SD-Access fabric.',
    categories: ['Underlay', 'Overlay'],
    items: [
      { text: 'Physical switches and cabling', category: 0 },
      { text: 'IS-IS routing between switch loopbacks', category: 0 },
      { text: 'Routed links between access and distribution switches', category: 0 },
      { text: 'VXLAN tunnels between edge nodes', category: 1 },
      { text: 'Virtual networks used for segmentation', category: 1 },
      { text: 'Host traffic encapsulated with a VNI', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'The underlay is the physical, routed IP network that provides reachability between fabric nodes. The overlay consists of the virtual constructs built on top of it: VXLAN tunnels, virtual networks and the encapsulated host traffic.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'Enter the UDP destination port number used by VXLAN.',
    answers: ['4789', 'udp 4789', 'udp/4789'],
    placeholder: 'Port number',
    difficulty: 1,
    explanation:
      'VXLAN uses UDP destination port **4789**. NETCONF over SSH uses TCP 830, RESTCONF uses HTTPS on TCP 443, and OpenFlow uses TCP 6653.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. Catalyst Center loses power while the SD-Access fabric is running. What is the expected effect on traffic that is already flowing between endpoints?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'dnac', icon: 'controller', label: 'Catalyst Center', sub: 'unreachable', x: 5, y: 0.9, tone: 'bad' },
          { id: 'int', icon: 'l3switch', label: 'Intermediate node', x: 5, y: 2.5 },
          { id: 'e1', icon: 'switch', label: 'Edge 1', x: 2, y: 4.1 },
          { id: 'e2', icon: 'switch', label: 'Edge 2', x: 8, y: 4.1 },
        ],
        links: [
          { from: 'dnac', to: 'int', label: 'management path down', style: 'dashed', tone: 'bad' },
          { from: 'int', to: 'e1' },
          { from: 'int', to: 'e2' },
        ],
      },
    },
    options: [
      'Traffic keeps flowing; design, provisioning and assurance are unavailable until it returns',
      'Traffic stops at once because Catalyst Center forwards packets between the fabric nodes',
      'The underlay is torn down and the fabric falls back to spanning tree between the edge nodes',
      'Endpoints lose their IP addresses because Catalyst Center is the DHCP server for the fabric',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Catalyst Center is the management and automation controller, not part of the forwarding path: the fabric nodes keep running LISP and VXLAN on their own, so existing flows continue, but you cannot design, provision or view assurance data until it returns. It does not forward user packets, the routed underlay keeps running, and DHCP is provided by separate DHCP services.',
  },
];
