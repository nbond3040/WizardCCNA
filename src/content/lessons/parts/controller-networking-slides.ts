import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Controller-Based Networking & SDN',
    subtitle: 'Planes, APIs, fabrics, Catalyst Center and SD-WAN',
    notes:
      "For decades every router and switch was a self-contained box: it ran its own routing protocols, made its own forwarding decisions and was configured one command at a time. Controller-based networking changes the operating model by adding a central brain that sees the whole network, translates business intent into device configuration, and exposes APIs so software can drive the network. This deck covers blueprint items 6.2 and 6.3 on v1.1 and the matching topics in the v2.0 blueprint: the difference between traditional and controller-based networks, the separation of control plane and data plane, the three-layer SDN architecture with its northbound and southbound APIs, the overlay, underlay and fabric concepts behind Cisco SD-Access (VXLAN and LISP), what Cisco Catalyst Center adds compared with box-by-box management, and an awareness-level tour of Cisco SD-WAN. Expect definitions, matching questions and short scenarios rather than long configurations.",
  },
  {
    kind: 'table',
    title: 'Data, control and management planes',
    columns: ['Plane', 'Job', 'Examples', 'Runs on'],
    rows: [
      ['**Data plane**', 'Forwards each frame or packet using the tables the control plane built', 'MAC and IP lookups, NAT translation, ACL filtering, QoS marking', 'Hardware forwarding engines (ASICs)'],
      ['**Control plane**', 'Decides where traffic should go; builds MAC, ARP, routing and spanning-tree state', 'OSPF, EIGRP, BGP, STP, ARP, MAC learning', 'Device CPU, on every device in a traditional network'],
      ['**Management plane**', 'Lets people and tools configure, monitor and troubleshoot the device', 'SSH, Telnet, SNMP, syslog, NETCONF, REST APIs', 'Device CPU and management interfaces'],
    ],
    caption: 'Controller-based networking redistributes these jobs; it does not invent new ones.',
    notes:
      "Every network device does three jobs, and controller-based networking is easiest to understand as a redistribution of them. The **data plane**, also called the forwarding plane, handles each frame or packet in real time: MAC table lookup, IP routing lookup, NAT translation, ACL filtering and QoS marking. It runs in hardware for speed. The **control plane** decides where traffic should go by building the tables the data plane uses: OSPF, EIGRP and BGP build routing tables, STP decides which ports forward, and ARP and MAC learning build address tables. The **management plane** is how humans and tools talk to the device: SSH, Telnet, SNMP, syslog, NETCONF and REST APIs. In a traditional device all three live in the same box. Classic exam wording asks which plane builds the routing table (control) or which plane performs the actual forwarding (data). Notice that an SSH session to a router is management-plane traffic, an OSPF hello is control-plane traffic, and a user's web packet crossing the router is data-plane traffic.",
  },
  {
    kind: 'bullets',
    title: 'Traditional distributed networking',
    bullets: [
      'Every device runs its own **control plane** and data plane',
      'Devices exchange protocol messages to learn the topology',
      'Configuration is **box by box** over CLI, SSH and SNMP',
      'Changes are slow, error-prone and drift between devices',
      'No single device has a view of the whole network',
      'Policy such as ACLs is tied to IP addresses on each device',
    ],
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
    notes:
      "In a traditional network the control plane is **distributed**. Each router and switch runs its own routing protocols, spanning tree and learning processes, exchanges messages with its neighbors, and reaches its own conclusions about where to send traffic. No single device sees the entire network; the big picture emerges from protocol convergence. That design is resilient, and it is why the Internet scales, but it has operational costs. Configuration is **box by box**: an engineer connects to each device with SSH, pastes commands, and hopes the result matches the intended design. Large changes mean hundreds of sessions, and small typos or forgotten devices cause configuration drift and outages. Monitoring depends on SNMP polling and syslog from each device, troubleshooting is hop by hop, and policies such as ACLs are tied to IP addresses on individual devices. The diagram shows the pattern: the administrator opens a separate management session to every switch, while the control plane inside each switch runs independently. Keep this picture as the baseline against which controller-based networking is compared.",
  },
  {
    kind: 'bullets',
    title: 'Controller-based networking',
    bullets: [
      'A central **controller** has a global view of topology and device state',
      'Operators and apps talk to the controller, not to each box',
      'Policy and intent are defined once, then pushed to many devices',
      'In most designs devices keep forwarding if the controller is unreachable',
      'Pure SDN centralizes the control plane; Cisco designs are usually hybrid',
    ],
    diagram: {
      type: 'topology',
      nodes: [
        { id: 'adm', icon: 'laptop', label: 'Admin / app', x: 5, y: 0.8 },
        { id: 'ctl', icon: 'controller', label: 'Controller', sub: 'global view', x: 5, y: 2.4, tone: 'accent' },
        { id: 's1', icon: 'switch', label: 'SW1', x: 1.8, y: 4.1 },
        { id: 's2', icon: 'switch', label: 'SW2', x: 5, y: 4.1 },
        { id: 's3', icon: 'switch', label: 'SW3', x: 8.2, y: 4.1 },
      ],
      links: [
        { from: 'adm', to: 'ctl', label: 'northbound' },
        { from: 'ctl', to: 's1', style: 'dashed' },
        { from: 'ctl', to: 's2', label: 'southbound', style: 'dashed' },
        { from: 'ctl', to: 's3', style: 'dashed' },
        { from: 's1', to: 's2' },
        { from: 's2', to: 's3' },
      ],
    },
    notes:
      "In **controller-based networking** a central software controller gains a global view of the topology and device state, and operators interact with the controller instead of with each device. The administrator or an application talks to the controller through a **northbound** interface; the controller then talks to devices through **southbound** interfaces. In a pure SDN design the controller also takes over the control plane, so the switches become simple forwarding elements that follow flow rules; this is the model associated with OpenFlow. Most Cisco solutions are more pragmatic: the devices keep running some routing and switching protocols themselves, while the controller automates configuration, enforces policy and monitors health. In most designs the data plane keeps forwarding even if the controller is temporarily unreachable, because the controller is not in the path of user traffic. The benefits are consistency, speed, fewer manual errors, network-wide visibility, programmability through APIs and the ability to express intent, such as which users may reach which applications, rather than device syntax.",
  },
  {
    kind: 'diagram',
    title: 'SDN architecture: three layers',
    diagram: {
      type: 'topology',
      width: 10,
      height: 7,
      nodes: [
        { id: 'a1', icon: 'box', label: 'Assurance app', x: 2.5, y: 1 },
        { id: 'a2', icon: 'box', label: 'Policy app', x: 5, y: 1 },
        { id: 'a3', icon: 'box', label: 'Automation scripts', x: 7.5, y: 1 },
        { id: 'ctl', icon: 'controller', label: 'SDN controller', sub: 'global view + policy', x: 5, y: 3.2, tone: 'accent' },
        { id: 'r1', icon: 'router', label: 'Router', x: 2.2, y: 5.6 },
        { id: 'sw1', icon: 'switch', label: 'Switch', x: 4.4, y: 5.6 },
        { id: 'sw2', icon: 'switch', label: 'Switch', x: 6.6, y: 5.6 },
        { id: 'ap', icon: 'ap', label: 'Access point', x: 8.6, y: 5.6 },
      ],
      links: [
        { from: 'a1', to: 'ctl' },
        { from: 'a2', to: 'ctl' },
        { from: 'a3', to: 'ctl' },
        { from: 'ctl', to: 'r1', style: 'dashed' },
        { from: 'ctl', to: 'sw1', style: 'dashed' },
        { from: 'ctl', to: 'sw2', style: 'dashed' },
        { from: 'ctl', to: 'ap', style: 'dashed' },
      ],
      groups: [
        { label: 'Application layer', x: 0.3, y: 0.2, w: 9.4, h: 1.9 },
        { label: 'Control layer', x: 0.3, y: 2.5, w: 9.4, h: 1.6, tone: 'accent' },
        { label: 'Infrastructure layer', x: 0.3, y: 4.5, w: 9.4, h: 2.3 },
      ],
      annotations: [
        { x: 7.9, y: 2.3, text: 'Northbound API (REST)', tone: 'accent' },
        { x: 7.9, y: 4.3, text: 'Southbound APIs / protocols', tone: 'accent' },
      ],
    },
    caption: 'North = toward applications. South = toward devices.',
    notes:
      "The classic SDN architecture has three layers. At the top, the **application layer** holds the software that expresses what the network should do: orchestration, policy, assurance dashboards, security tools and automation scripts. In the middle, the **control layer** is the SDN controller; it maintains the topology and state, applies policy and translates requests into instructions for the devices. At the bottom, the **infrastructure layer** consists of the physical and virtual network devices that actually forward traffic. Two interfaces connect the layers. The **northbound API** sits between applications and the controller; it is almost always a REST API using HTTPS and JSON. The **southbound API** sits between the controller and the devices; it uses protocols such as NETCONF, RESTCONF, OpenFlow, OpFlex, SSH/CLI and SNMP. An easy memory aid is the compass: north is toward the applications, south is toward the devices. Questions often show this diagram and ask which API or protocol belongs at a labelled position.",
  },
  {
    kind: 'table',
    title: 'Northbound vs southbound APIs',
    columns: ['', 'Northbound API (NBI)', 'Southbound API (SBI)'],
    rows: [
      ['**Connects**', 'Applications and the controller', 'The controller and network devices'],
      ['**Purpose**', 'Apps say what they want and read data', 'Controller programs devices and collects state'],
      ['**Typical technology**', 'REST over HTTPS with JSON', 'NETCONF, RESTCONF, OpenFlow, OpFlex, SSH/CLI, SNMP'],
      ['**Used by**', 'Scripts, ITSM, orchestration, dashboards', 'The controller software itself'],
      ['**Catalyst Center example**', 'Intent API (REST)', 'SSH or Telnet CLI, SNMP, NETCONF to devices'],
      ['**Memory aid**', 'Up toward the applications', 'Down toward the devices'],
    ],
    notes:
      "This table consolidates the two directions. The northbound interface faces the people and programs that consume the network: a script that lists devices, an IT service management tool that requests a configuration change, or a dashboard that displays health. Because they are applications, the interface is a web-style API: REST over HTTPS carrying JSON. The southbound interface faces the infrastructure; its job is to push configuration and policy down and bring state and telemetry up, using protocols the devices understand. Cisco Catalyst Center illustrates both: applications call its Intent API (REST) on the north side, and it reaches devices on the south side with SSH or Telnet CLI, SNMP and NETCONF. Remember that REST is the signature northbound technology. The names can mislead: RESTCONF is a southbound protocol even though it contains REST, because it is how a client or controller configures a device that publishes YANG models. When a question lists several protocols and asks for the northbound API, REST is the one that fits.",
  },
  {
    kind: 'table',
    title: 'Southbound protocols to know',
    columns: ['Protocol', 'Style', 'Details'],
    rows: [
      ['**OpenFlow**', 'Imperative: the controller writes forwarding rules', 'Match-action entries in switch flow tables; ONF standard; TCP 6653'],
      ['**NETCONF**', 'Model-driven (YANG data, XML)', 'Runs over SSH on TCP 830; get-config, edit-config, commit'],
      ['**RESTCONF**', 'Model-driven (YANG data, JSON or XML)', 'HTTPS on TCP 443; GET, POST, PUT, PATCH, DELETE'],
      ['**OpFlex**', 'Declarative: controller states policy, devices decide how', 'Cisco ACI; devices keep local intelligence'],
      ['**CLI over SSH or Telnet**', 'Traditional command line, automated', 'Still used for many existing devices'],
      ['**SNMP**', 'Polling, traps and sets', 'UDP 161 for queries, UDP 162 for traps; mostly monitoring'],
    ],
    caption: 'Exam rule: REST is northbound; the protocols in this table are southbound.',
    notes:
      "Know what each southbound option does. **OpenFlow** is the original SDN protocol standardized by the Open Networking Foundation: the controller installs match-action entries in a switch's flow table, so it decides forwarding behavior directly. It is an **imperative** style: the controller specifies how. **NETCONF** uses XML over SSH on TCP port 830 and manipulates YANG-modeled configuration with operations such as get-config and edit-config, with support for validating and committing changes. **RESTCONF** gives access to the same kind of YANG data but over HTTPS, using ordinary HTTP verbs and JSON or XML. **OpFlex** is a Cisco-led, **declarative** protocol used with Cisco ACI: the controller states the desired policy and the devices decide how to implement it, so the devices keep intelligence. CLI over SSH or Telnet and SNMP are the legacy options that are still used heavily for existing devices. You do not need packet formats; you need to match each protocol to its one-line identity, port and style, and to remember that these are southbound, not northbound.",
  },
  {
    kind: 'diagram',
    title: 'Underlay, overlay and fabric',
    diagram: {
      type: 'topology',
      nodes: [
        { id: 'pc1', icon: 'laptop', label: 'Host A', x: 0.9, y: 2.5 },
        { id: 'e1', icon: 'switch', label: 'Edge 1', x: 2.9, y: 2.5 },
        { id: 'c1', icon: 'l3switch', label: 'Core 1', x: 5, y: 0.9 },
        { id: 'c2', icon: 'l3switch', label: 'Core 2', x: 5, y: 4.1 },
        { id: 'e2', icon: 'switch', label: 'Edge 2', x: 7.1, y: 2.5 },
        { id: 'pc2', icon: 'laptop', label: 'Host B', x: 9.1, y: 2.5 },
      ],
      links: [
        { from: 'pc1', to: 'e1' },
        { from: 'e1', to: 'c1' },
        { from: 'e1', to: 'c2' },
        { from: 'e2', to: 'c1' },
        { from: 'e2', to: 'c2' },
        { from: 'e2', to: 'pc2' },
        { from: 'e1', to: 'e2', label: 'VXLAN tunnel (overlay)', style: 'dashed', tone: 'accent' },
      ],
      groups: [{ label: 'Fabric = underlay + overlay', x: 1.9, y: 0.2, w: 6.2, h: 4.6, tone: 'accent' }],
    },
    caption: 'Solid links and IP routing = underlay. The dashed tunnel = overlay. Together = fabric.',
    notes:
      "The diagram separates the physical network from the logical one. The solid links between the edge and core switches form the **underlay**: ordinary routed IP connectivity whose only job is to deliver packets between the switches' addresses reliably and quickly. The dashed accent link is the **overlay**: a virtual tunnel, such as a VXLAN tunnel, built between the two edge switches. When Host A sends traffic to Host B, the first edge switch encapsulates the original frame inside a new packet addressed to the second edge switch; the core switches forward that outer packet knowing nothing about the hosts; the far-end edge removes the wrapper and delivers the original frame. The shaded area is the **fabric**, the combination of underlay and overlay managed as one system. Separating the layers lets the underlay stay simple and stable, while the overlay delivers services such as segmentation, host mobility and consistent policy independent of the physical topology. Overlays are common elsewhere too, for example GRE tunnels, IPsec VPNs and VXLAN in data centers.",
  },
  {
    kind: 'table',
    title: 'Underlay, overlay, fabric defined',
    columns: ['Term', 'What it is', 'In Cisco SD-Access'],
    rows: [
      ['**Underlay**', 'The physical devices, links and IP routing that give reachability between tunnel endpoints', 'Routed access network; Catalyst Center LAN Automation can build it with IS-IS'],
      ['**Overlay**', 'A virtual network of tunnels on top of the underlay that carries endpoint traffic and enables segmentation', 'VXLAN data plane with a LISP control plane; virtual networks for segmentation'],
      ['**Fabric**', 'The whole domain, underlay plus overlay, behaving as one logical network', 'An SD-Access fabric site of edge, border, control plane and intermediate nodes'],
    ],
    notes:
      "Put precise words on the three terms. The **underlay** is the physical network and its routing. In Cisco SD-Access it is a routed access design that Catalyst Center can build automatically with LAN Automation, using IS-IS between the nodes, so every switch has a reachable loopback address. The **overlay** is the virtual network built on top: tunnels (VXLAN in SD-Access) carry the endpoints' traffic between fabric nodes, and virtual networks, similar to VRFs, provide segmentation. The **fabric** is the whole domain of devices and links, underlay plus overlay, that behaves like one big logical switch. Why bother? Because endpoint addressing, security groups and VLAN-like segmentation no longer depend on the physical wiring, a new edge switch can be added by plugging it in, and policy follows the user rather than the port. Exam questions typically ask you to identify which term matches a description, such as the physical infrastructure that provides IP reachability between tunnel endpoints, which is the underlay.",
  },
  {
    kind: 'diagram',
    title: 'VXLAN encapsulation',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Outer Ethernet', size: 14, sub: 'next-hop MACs' },
        { label: 'Outer IP', size: 20, sub: 'edge to edge' },
        { label: 'UDP', size: 8, sub: 'dst port 4789' },
        { label: 'VXLAN', size: 8, sub: '24-bit VNI', tone: 'accent' },
        { label: 'Original Ethernet frame', size: 1518, sub: 'unchanged, up to 1518' },
      ],
    },
    bullets: [
      '**MAC-in-UDP**: the host frame rides inside a new UDP packet',
      '24-bit VNI gives about 16.7 million segments; VLANs give 4094',
      'Outer headers add about 50 bytes, so raise the underlay MTU',
      'In SD-Access the header also carries a security group tag',
    ],
    notes:
      "VXLAN (Virtual Extensible LAN) is the data-plane encapsulation used by SD-Access. The edge switch takes the original Ethernet frame, adds an 8-byte VXLAN header carrying a **24-bit VXLAN Network Identifier (VNI)**, then wraps the result in UDP (destination port 4789), IP and a new Ethernet header, as the diagram shows. The outer IP addresses are the fabric edge nodes' addresses, so the underlay routes the packet like any other. Those four headers add roughly 50 bytes, which is why underlay links need a larger MTU than 1500 to avoid fragmentation. The 24-bit identifier supports about 16 million segments, compared with at most 4094 usable VLANs, which is why VXLAN scales better for large or multitenant networks. In SD-Access the VXLAN header also carries a Security Group Tag so that group-based policy can be enforced at the egress edge. Exam shorthand: VXLAN is MAC-in-UDP encapsulation, and in SD-Access it is the data plane.",
  },
  {
    kind: 'diagram',
    title: 'SD-Access fabric roles',
    diagram: {
      type: 'topology',
      width: 10,
      height: 6.5,
      nodes: [
        { id: 'dnac', icon: 'controller', label: 'Catalyst Center', x: 2.8, y: 0.8, tone: 'accent' },
        { id: 'ise', icon: 'server', label: 'ISE', sub: 'identity and policy', x: 6.6, y: 0.8 },
        { id: 'ext', icon: 'cloud', label: 'WAN / Internet', x: 9.1, y: 1.4 },
        { id: 'cpn', icon: 'server', label: 'Control plane node', sub: 'LISP map server', x: 2, y: 2.8 },
        { id: 'bor', icon: 'l3switch', label: 'Border node', sub: 'exit to outside', x: 8, y: 2.8 },
        { id: 'int', icon: 'l3switch', label: 'Intermediate node', sub: 'underlay only', x: 5, y: 3.4 },
        { id: 'e1', icon: 'switch', label: 'Edge node 1', x: 2.6, y: 5.2 },
        { id: 'e2', icon: 'switch', label: 'Edge node 2', x: 7.4, y: 5.2 },
        { id: 'h1', icon: 'laptop', label: 'Host A', x: 0.9, y: 5.2 },
        { id: 'h2', icon: 'laptop', label: 'Host B', x: 9.1, y: 5.2 },
      ],
      links: [
        { from: 'dnac', to: 'ise', style: 'dashed' },
        { from: 'dnac', to: 'int', label: 'manages', style: 'dashed' },
        { from: 'cpn', to: 'int' },
        { from: 'bor', to: 'int' },
        { from: 'int', to: 'e1' },
        { from: 'int', to: 'e2' },
        { from: 'bor', to: 'ext' },
        { from: 'e1', to: 'h1' },
        { from: 'e2', to: 'h2' },
      ],
      groups: [{ label: 'SD-Access fabric', x: 1.3, y: 2, w: 7.4, h: 4.3 }],
    },
    notes:
      "A Cisco SD-Access **fabric site** has defined node roles. **Edge nodes** connect endpoints such as wired clients and access points and act as the tunnel ingress and egress: they encapsulate traffic into VXLAN toward other nodes and register the endpoints they see with the control plane. The **control plane node** runs LISP and acts as the map server and resolver, keeping a database of which endpoint is behind which edge node. **Border nodes** connect the fabric to everything outside it, such as the WAN, a data center or the Internet, and translate between fabric and non-fabric forwarding and policy. **Intermediate nodes** are ordinary underlay switches that only route IP between the other nodes; they do not take part in the overlay. Around the fabric sit the management and policy systems: **Catalyst Center** designs, automates and monitors the fabric, and **Cisco ISE** provides identity services and group assignment. Typical questions give a description such as connects the fabric to external networks and ask for the node type, or ask which node tracks endpoint locations.",
  },
  {
    kind: 'diagram',
    title: 'LISP finds the destination',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'e1', label: 'Edge 1', icon: 'switch' },
        { id: 'cp', label: 'Control plane node', icon: 'server' },
        { id: 'e2', label: 'Edge 2', icon: 'switch' },
      ],
      steps: [
        { from: 'e2', to: 'cp', label: 'Map-Register', sub: 'Host B (EID) is behind my address (RLOC)' },
        { note: 'Later, Host A behind Edge 1 sends a packet to Host B' },
        { from: 'e1', to: 'cp', label: 'Map-Request', sub: 'Where is Host B?' },
        { from: 'cp', to: 'e1', label: 'Map-Reply', sub: 'Host B is behind the RLOC of Edge 2', tone: 'accent' },
        { from: 'e1', to: 'e2', label: 'VXLAN-encapsulated packet', sub: 'VNI + security group tag', tone: 'accent' },
        { note: 'Edge 2 removes the VXLAN wrapper and delivers the original frame to Host B' },
      ],
    },
    caption: 'EID = who the endpoint is. RLOC = where it is (the edge node address).',
    notes:
      "LISP, the Locator/ID Separation Protocol, provides the control plane for the SD-Access overlay. It splits an address's two meanings: the **endpoint identifier (EID)** says who the endpoint is, and the **routing locator (RLOC)**, the address of the fabric edge node behind which the endpoint sits, says where it is. When an endpoint connects, its edge node sends a **Map-Register** to the control plane node, creating the EID-to-RLOC mapping. Later, when Host A sends to Host B, Edge 1 does not know where B lives, so it asks the control plane with a **Map-Request** and receives a **Map-Reply** containing Edge 2's RLOC. Edge 1 caches the answer, VXLAN-encapsulates the traffic toward Edge 2, and Edge 2 removes the wrapper and delivers the original frame. If a host moves, only its registration changes, so mobility is cheap. Remember the division of labor: LISP answers where the destination is (control plane), VXLAN carries the packet (data plane), and Cisco TrustSec group tags provide policy.",
  },
  {
    kind: 'table',
    title: 'SD-Access at a glance',
    columns: ['Function', 'Technology', 'What it does'],
    rows: [
      ['**Control plane**', 'LISP', 'Maps endpoint IDs (EIDs) to edge-node locations (RLOCs)'],
      ['**Data plane**', 'VXLAN', 'Encapsulates traffic between fabric nodes with a 24-bit VNI'],
      ['**Policy plane**', 'Cisco TrustSec (security group tags)', 'Group-based access policy independent of IP address'],
      ['**Underlay**', 'Routed IP (IS-IS built by LAN Automation)', 'Reachability between fabric node addresses'],
      ['**Management**', 'Catalyst Center with Cisco ISE', 'Design, provisioning, assurance, identity and policy'],
    ],
    notes:
      "This is the one-page summary of SD-Access that the exam rewards. The **control plane** uses LISP: it answers the question where is this endpoint. The **data plane** uses VXLAN: it moves the encapsulated traffic between fabric nodes. The **policy plane** uses Cisco TrustSec: endpoints are placed in security groups identified by tags, and access rules are written between groups rather than between IP addresses, so policy follows the user wherever they connect. The **underlay** is plain routed IP that Catalyst Center can build with LAN Automation. Management and policy definition come from **Catalyst Center** working with **Cisco ISE** for identity. Notice what is absent: Catalyst Center is not in the forwarding path, so a controller outage does not stop traffic that is already flowing. Typical question forms ask which protocol provides the SD-Access control plane (LISP), which provides the data plane (VXLAN), or which technology carries group tags for policy (TrustSec). Learn the three plane names and their technologies as a set.",
  },
  {
    kind: 'diagram',
    title: 'Catalyst Center workflow',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Design', sub: 'sites, settings, IP pools, templates, images' },
        { id: 'b', label: 'Policy', sub: 'virtual networks, groups, QoS' },
        { id: 'c', label: 'Provision', sub: 'PnP, templates, SWIM, fabric', tone: 'accent' },
        { id: 'd', label: 'Assurance', sub: 'telemetry, health, issues, path trace' },
      ],
    },
    caption: 'Intent is designed, expressed as policy, activated on devices, then verified.',
    notes:
      "Cisco Catalyst Center, formerly known as Cisco DNA Center, is the controller for Cisco's enterprise campus, branch and wireless networks. Older exam material and some questions still use the DNA Center name; it is the same product family. Its workflow follows an intent-based networking loop. In **Design** you model the network: site hierarchy, building and floor maps, DNS, NTP and AAA server settings, IP address pools, device credentials, templates and the software image repository. In **Policy** you define business intent: virtual networks, group-based access policies and application priorities for QoS. In **Provision** the controller applies the design to devices: Plug and Play onboarding, templates, software upgrades and fabric provisioning. In **Assurance** it collects telemetry, scores network, client and application health, highlights issues and suggests fixes. Intent is translated into configuration, activated on devices and then verified, which is why the product is described as intent-based networking. A separate **Platform** area exposes the REST APIs and integrations with other tools.",
  },
  {
    kind: 'definitions',
    title: 'Catalyst Center capabilities',
    terms: [
      { term: 'Plug and Play (PnP)', def: 'Zero-touch onboarding: a new device receives its site configuration and image automatically.' },
      { term: 'Templates', def: 'Reusable configuration with variables, pushed consistently to many devices.' },
      { term: 'SWIM', def: 'Software Image Management: golden images, distribution, pre-checks, activation and rollback.' },
      { term: 'LAN Automation', def: 'Builds the routed underlay for new switches automatically.' },
      { term: 'Assurance', def: 'Streaming telemetry, health scores, issue detection and guided remediation.' },
      { term: 'Path Trace', def: 'Visual hop-by-hop path between two endpoints, including ACL results.' },
      { term: 'Intent API', def: 'Northbound REST API that lets scripts and other systems read data and request changes.' },
    ],
    notes:
      "Match these capabilities to their one-line purpose. Before any of them can work, Catalyst Center discovers devices using CDP, LLDP or an IP range plus the credentials you provide, and builds the inventory. **Plug and Play** onboards new devices with no manual console work. **Templates** keep configuration consistent, using variables for per-device values such as hostnames and IP addresses. **SWIM** manages software images so that every switch of a model runs the same approved release, and it can pre-check, distribute and activate upgrades across many devices. **LAN Automation** builds the underlay of a new fabric. **Assurance** turns telemetry into health scores and actionable issues, replacing hours of manual correlation, and **Path Trace** shows exactly where a flow is dropped or blocked. The **Intent API** is the northbound REST interface that lets automation tools drive all of this. Exam questions often describe a task, such as upgrading many switches consistently, and ask which feature solves it; treat each term here as a tool for one job.",
  },
  {
    kind: 'diagram',
    title: 'Plug and Play onboarding',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sw', label: 'New switch', icon: 'switch' },
        { id: 'dh', label: 'DHCP server', icon: 'server' },
        { id: 'dn', label: 'Catalyst Center', icon: 'controller' },
      ],
      steps: [
        { from: 'sw', to: 'dh', label: 'DHCP Discover', sub: 'factory-default switch, no configuration' },
        { from: 'dh', to: 'sw', label: 'DHCP Offer with option 43', sub: 'carries the PnP server address', tone: 'accent' },
        { from: 'sw', to: 'dn', label: 'PnP request', sub: 'device appears as unclaimed' },
        { note: 'Administrator (or a rule) claims the device and assigns it to a site' },
        { from: 'dn', to: 'sw', label: 'Day-0 configuration and software image', sub: 'built from the site template', tone: 'accent' },
        { note: 'The switch reloads and shows up as managed in the inventory' },
      ],
    },
    caption: 'Other discovery methods: a DNS lookup of pnpserver plus your domain (for example pnpserver.example.com), or Cisco Plug and Play Connect cloud redirection.',
    notes:
      "Plug and Play removes the need to pre-stage devices. A new switch with no configuration boots into its PnP agent and tries to find a controller. The most common method is **DHCP**: the offer includes **option 43**, a vendor-specific option that carries the address of the PnP server, which is Catalyst Center. The device can also resolve a DNS name of the form pnpserver followed by the local domain, or be redirected by the Cisco Plug and Play Connect cloud service. Once it reaches the controller, the device is listed as unclaimed; an administrator, or an automatic rule, claims it and assigns it to a site, and the controller sends a **day-0 configuration** built from a template, plus the golden software image if the device runs a different version. The device reloads and appears in the inventory as managed. The benefit is zero-touch deployment at scale: installers just rack, cable and power on. For the exam, remember that DHCP option 43 and DNS are discovery methods and that the day-0 configuration comes from templates.",
  },
  {
    kind: 'table',
    title: 'Catalyst Center vs traditional management',
    columns: ['Task', 'Traditional (CLI, SNMP, per device)', 'Catalyst Center'],
    rows: [
      ['**Day-0 setup**', 'Console in and paste a configuration, device by device', 'Plug and Play: zero-touch with a site profile'],
      ['**Configuration changes**', 'CLI or scripts per device; drift between devices', 'Templates and intent pushed to many devices; compliance checks'],
      ['**Software upgrades**', 'Copy the image, set boot, reload each device by hand', 'SWIM: golden image, distribute, verify, activate'],
      ['**Monitoring**', 'SNMP polling and syslog; manual correlation', 'Streaming telemetry with health scores and issue insights'],
      ['**Troubleshooting**', 'ping, traceroute and show commands hop by hop', 'Path Trace, client and device 360 views'],
      ['**Security policy**', 'ACLs on each device by IP address', 'Group-based policy and segmentation (SD-Access, TrustSec)'],
      ['**Automation and APIs**', 'Limited; scripting against the CLI', 'Intent REST API and integrations'],
      ['**Scope of view**', 'One device at a time', 'Network-wide inventory and topology'],
    ],
    caption: 'Catalyst Center manages and automates; it does not forward user traffic.',
    notes:
      "This is the comparison the exam favors. In a traditional campus, the engineer's tools are the console, SSH and SNMP, and each task is repeated device by device. Catalyst Center turns many of those tasks into centrally defined workflows. Day-0 setup becomes Plug and Play; configuration changes are pushed from templates and checked for compliance; software upgrades use SWIM to stage and activate a golden image across many devices; monitoring moves from SNMP polling to streaming telemetry with health scores; troubleshooting adds Path Trace and 360-degree client and device views; and security policy shifts from IP-based ACLs on each device to group-based policy managed in one place. Catalyst Center also provides a REST API, so other systems can automate the network. Be careful not to overstate: it does not replace routing protocols or sit in the data path, and traditional CLI access to devices still works. A typical question asks which capability is a benefit of controller-based management; pick the one about centralization, automation or assurance, not about forwarding faster.",
  },
  {
    kind: 'diagram',
    title: 'Cisco SD-WAN overview',
    diagram: {
      type: 'topology',
      width: 10,
      height: 6,
      nodes: [
        { id: 'mgr', icon: 'controller', label: 'SD-WAN Manager', sub: 'management plane', x: 1.8, y: 0.9 },
        { id: 'ctl', icon: 'controller', label: 'SD-WAN Controller', sub: 'control plane · OMP', x: 5, y: 0.9, tone: 'accent' },
        { id: 'val', icon: 'controller', label: 'SD-WAN Validator', sub: 'orchestration', x: 8.2, y: 0.9 },
        { id: 'mp', icon: 'cloud', label: 'MPLS', x: 5, y: 3.3 },
        { id: 'in', icon: 'internet', label: 'Internet', x: 5, y: 5.1 },
        { id: 'e1', icon: 'router', label: 'WAN Edge', sub: 'Site A', x: 1.5, y: 4.9 },
        { id: 'e2', icon: 'router', label: 'WAN Edge', sub: 'Site B', x: 8.5, y: 4.9 },
      ],
      links: [
        { from: 'mgr', to: 'ctl', style: 'dashed' },
        { from: 'ctl', to: 'val', style: 'dashed' },
        { from: 'e1', to: 'ctl', style: 'dashed' },
        { from: 'e2', to: 'ctl', style: 'dashed' },
        { from: 'e1', to: 'mp', style: 'thick' },
        { from: 'mp', to: 'e2', style: 'thick' },
        { from: 'e1', to: 'in', style: 'thick' },
        { from: 'in', to: 'e2', style: 'thick' },
      ],
      annotations: [{ x: 5, y: 4.2, text: 'IPsec tunnels over each transport', tone: 'accent' }],
    },
    caption: 'Dashed = control connections. Thick = data-plane tunnels over MPLS and Internet transports.',
    notes:
      "Cisco Catalyst SD-WAN, which began as Viptela, applies controller-based ideas to the WAN. Branch and data center routers called **WAN Edges** form encrypted IPsec tunnels across any available transport, MPLS, broadband Internet or cellular, creating an overlay on top of those underlay transports. A small set of controllers manages the overlay. The **SD-WAN Manager**, formerly vManage, is the management plane: the GUI, templates, monitoring and the REST API. The **SD-WAN Controller**, formerly vSmart, is the control plane: it runs the Overlay Management Protocol (OMP) to distribute routes, transport locators, policies and encryption keys. The **SD-WAN Validator**, formerly vBond, is the orchestration plane: new devices contact it first, and it authenticates them and tells them which controllers to join. Because the overlay knows each path's measured loss, latency and jitter, policy can send each application over the best transport, a feature called application-aware routing. At CCNA level you need the component names, their planes, and the idea of a centrally managed overlay.",
  },
  {
    kind: 'table',
    title: 'SD-WAN components',
    columns: ['Component', 'Older name', 'Plane', 'Role'],
    rows: [
      ['**SD-WAN Manager**', 'vManage', 'Management', 'GUI, templates, monitoring and the northbound REST API'],
      ['**SD-WAN Controller**', 'vSmart', 'Control', 'Runs OMP; distributes routes, policy and keys to WAN Edges'],
      ['**SD-WAN Validator**', 'vBond', 'Orchestration', 'First contact: authenticates devices and points them to controllers'],
      ['**WAN Edge**', 'vEdge or cEdge', 'Data', 'Branch or data center router that forms IPsec tunnels and forwards traffic'],
    ],
    caption: 'Benefits: transport independence, central policy, zero-touch onboarding, application-aware path selection.',
    notes:
      "Memorize this table as a four-way match. The **Manager** is where administrators work: it holds templates, shows dashboards and exposes the REST API. The **Controller** is the brain of the overlay's routing: WAN Edges establish control connections to it and learn routes, transport locators and policy through OMP. The **Validator** is the doorman: a new WAN Edge reaches it first, is authenticated against the allowed device list, and learns where the controllers are; it also helps devices behind NAT connect. The **WAN Edge** is the only one that carries user traffic, forming IPsec tunnels over every transport and probing them with BFD to measure loss and delay. The older names vManage, vSmart, vBond, vEdge and cEdge still appear in many documents, so recognize both generations. The practical benefits to remember are the ability to mix transports such as MPLS and Internet, centrally defined policy, zero-touch onboarding of new sites and automatic choice of the best path for each application.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Most misses are **plane mix-ups**, **NBI vs SBI** reversals and **SD-Access technology** swaps.',
    bullets: [
      'Control plane builds tables (OSPF, STP, ARP); data plane forwards; management plane configures',
      'Northbound = REST toward apps; southbound = NETCONF, RESTCONF, OpenFlow, OpFlex, SSH, SNMP',
      'RESTCONF has REST in its name but is a **southbound** protocol',
      'Underlay = physical IP network; overlay = tunnels such as VXLAN; fabric = both',
      'SD-Access: LISP control plane, VXLAN data plane, TrustSec policy',
      'Catalyst Center (formerly DNA Center) is not in the data path',
      'SD-WAN: Manager = management, Controller = control (OMP), Validator = orchestration, WAN Edge = data',
    ],
    notes:
      "These are the distractors that cost points. First, keep the three planes straight: the control plane builds tables, the data plane forwards using them, and the management plane is how you reach the device. Second, reverse questions are common: if the stem says applications talk to the controller, it is northbound and the answer is REST; if the controller talks to devices, it is southbound and the answers are NETCONF, RESTCONF, OpenFlow, OpFlex, SSH or SNMP. Third, do not swap the SD-Access technologies: LISP maps endpoints to locations, VXLAN carries traffic, and TrustSec group tags provide policy. Fourth, an underlay is physical and routed, an overlay is virtual and tunneled, and the fabric is both. Fifth, Catalyst Center automates and assures the network but does not forward user packets, so a controller outage does not stop existing traffic. Finally, in SD-WAN match each component to its plane, and recognize the older vManage, vSmart and vBond names. If two answers look right, pick the one that fits the layer being asked about.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Planes: data forwards, control builds tables, management configures',
      'Controller-based networking centralizes policy and visibility; devices still forward',
      'SDN layers: applications, controller, infrastructure; NBI = REST, SBI = NETCONF and others',
      'Underlay (physical IP) + overlay (VXLAN tunnels) = fabric',
      'SD-Access: LISP control plane, VXLAN data plane, TrustSec policy',
      'Catalyst Center: Design, Policy, Provision, Assurance; PnP, templates, SWIM',
      'SD-WAN: Manager, Controller, Validator, WAN Edge',
    ],
    notes:
      "Pull the topic together in one pass. The three planes are data, control and management, and a traditional network distributes the control plane across every device while a controller-based network adds a central controller with a global view. SDN architectures use three layers, applications, controller and infrastructure, connected by a northbound REST API and southbound protocols such as NETCONF, RESTCONF, OpenFlow, OpFlex, SSH and SNMP. A fabric combines a routed underlay with an overlay of tunnels; in Cisco SD-Access the overlay uses VXLAN for the data plane, LISP for the control plane and TrustSec group tags for policy, with edge, border, control plane and intermediate node roles. Catalyst Center brings design, policy, provisioning and assurance workflows to the campus, with Plug and Play, templates and software image management replacing box-by-box work. Cisco SD-WAN applies the same idea to the WAN with a Manager, Controller, Validator and WAN Edges. Before the quiz, try drawing the three-layer architecture and labelling both API directions from memory.",
  },
];
