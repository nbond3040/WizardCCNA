import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'WAN Architectures',
    subtitle: 'Topologies, leased lines, MPLS, Metro Ethernet, Internet access, VPNs and SD-WAN',
    notes:
      "A **wide area network** connects sites that are too far apart to cable yourself: a headquarters and its branches, a data center and a cloud region, or hundreds of retail stores. In this lesson you will compare the **topologies** a WAN can use, the **private WAN services** you can buy from a provider (leased lines, MPLS VPNs and Metro Ethernet), the **Internet access** technologies that reach almost every building (DSL, cable, fiber, cellular and satellite), and the two ways of adding security and intelligence on top of the Internet: **VPNs** and **SD-WAN**. The CCNA does not ask you to configure a provider network, but it does expect you to recognize each architecture from a description or a diagram, to name the devices and roles involved (CE, PE, P, CSU/DSU, CMTS, DSLAM, ONT), and to reason about which routers become routing neighbors in each design. Everything here applies to both exam versions: v1.1 topic 1.2.d and v2.0 domain 1. Keep asking yourself two questions as you go: who owns each piece, and who routes with whom.",
  },
  {
    kind: 'bullets',
    title: 'What makes a WAN a WAN',
    bullets: [
      'Links sites across distances you **cannot cable yourself**',
      'You own the LAN; you **lease** WAN service from a provider',
      '**Private WAN**: leased line, MPLS VPN, Metro Ethernet',
      '**Public WAN**: Internet access plus VPN encryption',
      'Hand-off point between you and the provider = **demarc**',
      'You pay for bandwidth, reach and an **SLA**',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'HQ LAN', sub: 'you own it', x: 1, y: 2.5 },
        { id: 'hq', icon: 'router', label: 'HQ', sub: 'CPE router', x: 3.2, y: 2.5, tone: 'accent' },
        { id: 'wan', icon: 'cloud', label: 'Provider WAN', sub: 'leased service', x: 5.8, y: 2.5 },
        { id: 'b1', icon: 'router', label: 'Branch 1', x: 8.6, y: 1.2 },
        { id: 'b2', icon: 'router', label: 'Branch 2', x: 8.6, y: 3.8 },
      ],
      links: [
        { from: 'sw', to: 'hq', toLabel: 'G0/0/0' },
        { from: 'hq', to: 'wan', fromLabel: 'G0/0/1', label: 'demarc' },
        { from: 'wan', to: 'b1' },
        { from: 'wan', to: 'b2' },
      ],
    },
    notes:
      "Inside a building you own everything: the cabling, the switches and the routers. Between buildings you usually cannot dig trenches across public roads, so you **lease** connectivity from a **service provider**. That is the defining feature of a WAN: someone else owns the long-distance part, and you pay for bandwidth, reach and a **service level agreement** (SLA) that promises availability, delay or loss targets. The point where the provider's responsibility ends and yours begins is the **demarcation point** (demarc); your equipment on the customer side is called customer premises equipment (CPE). WANs split into two families. A **private WAN** (leased lines, MPLS VPNs, Metro Ethernet) carries only your traffic, with provider-backed performance. A **public WAN** uses the Internet, which is cheap and available almost everywhere but best-effort and untrusted, so you add VPN encryption. Most real enterprises mix both: MPLS or Metro Ethernet for critical sites and Internet links for backup and cloud access. Exam questions often describe a business need (cost, reach, privacy, redundancy) and ask which WAN option fits, so learn each option's trade-offs, not just its name.",
  },
  {
    kind: 'bullets',
    title: 'Point-to-point and hub-and-spoke',
    bullets: [
      '**Point-to-point**: one link between exactly two sites',
      '**Hub-and-spoke**: every branch connects only to the hub',
      'Spoke-to-spoke traffic **transits the hub**',
      'Only **n − 1** links for n sites: cheap and simple',
      'Hub is a **single point of failure** → add a second hub',
      'Enforced logically by E-Tree services and many VPN designs',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hub', icon: 'router', label: 'HQ', sub: 'hub', x: 5, y: 2.5, tone: 'accent' },
        { id: 's1', icon: 'router', label: 'Branch 1', x: 1.5, y: 1.2 },
        { id: 's2', icon: 'router', label: 'Branch 2', x: 1.5, y: 3.8 },
        { id: 's3', icon: 'router', label: 'Branch 3', x: 8.5, y: 1.2 },
        { id: 's4', icon: 'router', label: 'Branch 4', x: 8.5, y: 3.8 },
      ],
      links: [
        { from: 's1', to: 'hub', tone: 'accent', arrow: 'forward' },
        { from: 's2', to: 'hub' },
        { from: 'hub', to: 's3', tone: 'accent', arrow: 'forward' },
        { from: 'hub', to: 's4' },
      ],
      annotations: [{ x: 5, y: 4.5, text: 'Branch 1 → Branch 3 goes through the hub', tone: 'accent' }],
    },
    notes:
      "A **point-to-point** WAN is one link between exactly two sites. It is the simplest design: one subnet (often a /30 or /31) and two routers that are each other's only neighbor on the link. Once a company has more than two sites, the most common logical design is **hub-and-spoke**: each branch (spoke) has one connection to a central site (hub), usually the headquarters or data center. For n sites you need only **n − 1** connections, so a hub with 20 branches (21 sites) needs 20 links, whereas a full mesh of the same 21 sites would need 210. The price is **suboptimal paths**: traffic from Branch 1 to Branch 3 travels up to the hub and back down, adding delay and consuming hub bandwidth. The hub is also a **single point of failure**, which is why designs often connect each spoke to two hubs. Hub-and-spoke is not only a physical layout: E-Tree services and many VPN deployments enforce it logically, and an MPLS VPN can be configured that way too, although MPLS VPNs are any-to-any by default. Expect exam questions that ask you to identify the topology from a drawing or to predict the path that spoke-to-spoke traffic takes.",
  },
  {
    kind: 'diagram',
    title: 'Full mesh and partial mesh',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a', icon: 'router', label: 'Site A', x: 2, y: 1.2 },
        { id: 'b', icon: 'router', label: 'Site B', x: 8, y: 1.2 },
        { id: 'c', icon: 'router', label: 'Site C', x: 2, y: 3.8 },
        { id: 'd', icon: 'router', label: 'Site D', x: 8, y: 3.8 },
      ],
      links: [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c' },
        { from: 'a', to: 'd', tone: 'accent' },
        { from: 'b', to: 'c', tone: 'accent' },
        { from: 'b', to: 'd' },
        { from: 'c', to: 'd' },
      ],
    },
    caption: 'Full mesh of 4 sites: 4 × 3 ÷ 2 = 6 links. Every site is one hop from every other.',
    bullets: [
      '**Full mesh**: every site links to every other — **n(n − 1)/2** links',
      '**Partial mesh**: direct links only where traffic or redundancy justifies them',
      'Mesh = best paths and redundancy, but cost and configuration grow fast',
    ],
    notes:
      "In a **full mesh**, every site has a direct connection to every other site. Each site reaches any other in a single hop, and the loss of one link only affects one pair of sites. The problem is scale: the number of links is **n(n − 1)/2**. Four sites need 6 links, 10 sites need 45 and 50 sites need 1,225 — every one of them to buy, configure, monitor and route over. A **partial mesh** is the practical compromise: the busiest or most critical sites (for example two data centers and the largest campuses) are meshed, while small branches connect hub-and-spoke. Modern services blur the line between physical and logical meshes. An MPLS VPN or an E-LAN service gives **any-to-any** reachability even though each site buys a single access link, and technologies such as DMVPN and SD-WAN build spoke-to-spoke tunnels on demand. On the exam, be ready to compute mesh link counts quickly (5 sites = 10, 6 sites = 15, 8 sites = 28) and to recognize full versus partial mesh from a drawing. A common wrong answer forgets to divide by two, giving 56 instead of 28 for eight sites.",
  },
  {
    kind: 'bullets',
    title: 'Single-homed, dual-homed and multihomed',
    bullets: [
      '**Single-homed**: one link to one ISP — no redundancy',
      '**Dual-homed**: two links to the **same** ISP',
      '**Multihomed**: links to **two or more** different ISPs',
      '**Dual-multihomed**: two links to each of two ISPs',
      'Topology sense: a spoke **dual-homed** to two hubs',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.5, y: 1.2 },
        { id: 'r2', icon: 'router', label: 'R2', x: 1.5, y: 3.8 },
        { id: 'ia', icon: 'cloud', label: 'ISP-A', x: 5.5, y: 1.2 },
        { id: 'ib', icon: 'cloud', label: 'ISP-B', x: 5.5, y: 3.8 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 8.8, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'ia', tone: 'accent' },
        { from: 'r1', to: 'ib' },
        { from: 'r2', to: 'ia', tone: 'accent' },
        { from: 'r2', to: 'ib' },
        { from: 'ia', to: 'net' },
        { from: 'ib', to: 'net' },
      ],
      groups: [{ label: 'HQ', x: 0.5, y: 0.4, w: 2, h: 4.2, tone: 'muted' }],
    },
    notes:
      "These terms describe how a site connects to its Internet or WAN provider. A **single-homed** site has one link to one ISP: cheapest, but a failure of that link, the edge router or the ISP takes the site offline. A **dual-homed** site has two links to the **same** ISP, which protects against a link or router failure and allows load sharing, but not against an outage of the provider itself. A **multihomed** site connects to **two or more different** ISPs, so it survives the loss of an entire provider. A **dual-multihomed** site, as in the diagram, has two links to each of two ISPs — the most resilient and most expensive option. Multihoming to separate providers normally involves BGP, which is beyond the CCNA except as awareness. You will also see dual-homed used for WAN topologies: a branch connected to two hub routers, so one hub can fail without isolating the branch. Exam questions usually describe the connections and ask for the term, so track just two variables: how many links, and how many providers. Two links plus one provider is dual-homed; one link to each of two providers is multihomed.",
  },
  {
    kind: 'bullets',
    title: 'Leased lines: CSU/DSU, DCE and DTE',
    bullets: [
      'Dedicated, always-on **point-to-point** circuit',
      'Classic speeds: **T1 = 1.544 Mbps**, **E1 = 2.048 Mbps**',
      '**CSU/DSU** terminates the telco line at each site',
      '**DCE** (CSU/DSU) supplies the clock; router = **DTE**',
      'Serial Layer 2: **HDLC** (Cisco default) or **PPP**',
      'Today often delivered as Ethernet over fiber',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DTE', x: 1, y: 1.5 },
        { id: 'c1', icon: 'modem', label: 'CSU/DSU', sub: 'DCE', x: 3, y: 1.5, tone: 'accent' },
        { id: 'tel', icon: 'cloud', label: 'Telco', x: 5, y: 1.5 },
        { id: 'c2', icon: 'modem', label: 'CSU/DSU', sub: 'DCE', x: 7, y: 1.5, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'DTE', x: 9, y: 1.5 },
      ],
      links: [
        { from: 'r1', to: 'c1', fromLabel: 'S0/1/0', style: 'serial' },
        { from: 'c1', to: 'tel', label: 'T1', style: 'serial' },
        { from: 'tel', to: 'c2', style: 'serial' },
        { from: 'c2', to: 'r2', toLabel: 'S0/1/0', style: 'serial' },
      ],
    },
    notes:
      "A **leased line** is a dedicated point-to-point circuit rented from a telecom provider. Its bandwidth is reserved for you whether you use it or not, which makes performance predictable but cost high, especially over long distances. Classic TDM leased lines are built from 64-kbps channels: a **T1** runs at **1.544 Mbps** (24 channels plus framing, North America) and an **E1** at **2.048 Mbps** (32 channels, Europe and elsewhere). At each end, a **CSU/DSU** (channel service unit/data service unit) terminates the digital line and presents a serial interface to the router. The CSU/DSU is the **DCE** — data communications equipment — and supplies the **clock** signal that times each bit; the router is the **DTE** — data terminal equipment. In a lab, two routers are joined back to back with a serial cable, and whichever router holds the DCE end of that cable must be configured with `clock rate`. Many routers now integrate the CSU/DSU in a WAN module, and providers increasingly deliver point-to-point services as Ethernet over fiber, but the DCE/DTE roles remain classic exam material. Remember: the router never provides the clock in production; the provider side does.",
  },
  {
    kind: 'cli',
    title: 'Serial encapsulation: HDLC and PPP',
    code: `R1# show interfaces serial 0/1/0 | include Encapsulation
  Encapsulation HDLC, loopback not set
R1# configure terminal
R1(config)# interface serial 0/1/0
R1(config-if)# ip address 10.0.12.1 255.255.255.252
R1(config-if)# encapsulation ppp
R1(config-if)# clock rate 64000
R1(config-if)# no shutdown
R1(config-if)# end
R1# show interfaces serial 0/1/0 | include line protocol|Encapsulation|Open
Serial0/1/0 is up, line protocol is up
  Encapsulation PPP, LCP Open
  Open: IPCP, CDPCP, loopback not set`,
    highlight: ['Encapsulation HDLC', 'encapsulation ppp', 'LCP Open'],
    caption: 'R1 holds the DCE end of a back-to-back lab cable, so it sets the clock. R2 must also run PPP.',
    notes:
      "Serial links need a Layer 2 protocol, and Cisco routers default to **HDLC**. Cisco's HDLC adds a protocol-type field that the ISO standard lacks, so it is only dependable between Cisco devices. The alternative is **PPP**, an open standard that adds features through its sub-protocols: **LCP** (Link Control Protocol) brings up the link and handles optional **authentication** with PAP or CHAP, and a network control protocol per Layer 3 protocol, such as **IPCP** for IPv4, negotiates that protocol. In the transcript, R1 starts with the default HDLC, is changed to PPP, and the final output shows `LCP Open` plus the open NCPs — proof that PPP negotiated successfully with the neighbor. Both ends must match: if one side runs PPP and the other still runs HDLC, the interface stays **up/down** — the physical layer is fine but the data link layer fails. Because R1 holds the DCE end of the back-to-back lab cable, it also sets `clock rate 64000`; in production, the CSU/DSU supplies the clock. Serial configuration is awareness-level material today, but recognizing the encapsulation line and diagnosing a mismatch is fair game on the exam.",
  },
  {
    kind: 'diagram',
    title: 'MPLS VPN: CE, PE and P routers',
    diagram: {
      type: 'topology',
      width: 12,
      height: 5,
      nodes: [
        { id: 'ce1', icon: 'router', label: 'CE1', sub: 'Site A', x: 1, y: 2.5 },
        { id: 'pe1', icon: 'router', label: 'PE1', sub: 'VRF CUST-A', x: 3.4, y: 2.5, tone: 'accent' },
        { id: 'p1', icon: 'router', label: 'P1', sub: 'labels only', x: 6, y: 1.3 },
        { id: 'p2', icon: 'router', label: 'P2', sub: 'labels only', x: 6, y: 3.7 },
        { id: 'pe2', icon: 'router', label: 'PE2', sub: 'VRF CUST-A', x: 8.6, y: 2.5, tone: 'accent' },
        { id: 'ce2', icon: 'router', label: 'CE2', sub: 'Site B', x: 11, y: 2.5 },
      ],
      links: [
        { from: 'ce1', to: 'pe1', label: 'CE–PE routing' },
        { from: 'pe1', to: 'p1' },
        { from: 'pe1', to: 'p2' },
        { from: 'p1', to: 'p2' },
        { from: 'p1', to: 'pe2' },
        { from: 'p2', to: 'pe2' },
        { from: 'pe2', to: 'ce2', label: 'CE–PE routing' },
      ],
      groups: [
        { label: 'Customer', x: 0.3, y: 1.2, w: 1.5, h: 2.6, tone: 'muted' },
        { label: 'Provider MPLS network', x: 2.5, y: 0.3, w: 7, h: 4.4 },
        { label: 'Customer', x: 10.2, y: 1.2, w: 1.5, h: 2.6, tone: 'muted' },
      ],
    },
    caption: 'CE = customer edge · PE = provider edge (VRFs, labels) · P = provider core (label switching only)',
    bullets: [
      '**CE** sits at the customer site and peers with the PE',
      '**PE** keeps a **VRF** per customer and adds or removes labels',
      '**P** routers switch labels and never see customer routes',
    ],
    notes:
      "**MPLS** (Multiprotocol Label Switching) lets one provider network carry traffic for many customers while keeping each customer private. Learn the three router roles cold. The **CE** (customer edge) router sits at your site; it is usually yours and can connect to the provider over almost any access technology. The **PE** (provider edge) router is the provider's device facing customers. It keeps a separate routing table — a **VRF** (virtual routing and forwarding instance) — for each customer, so two customers can both use 10.0.0.0/8 without conflict. The **P** (provider) routers form the core. They forward packets purely by **label**, so they need no customer routes at all, which is a key reason MPLS scales to thousands of customers. The label is a 4-byte shim inserted between the Layer 2 and Layer 3 headers, which is why MPLS is often described as Layer 2.5. From the customer's point of view, the whole provider cloud behaves like one big router that every site plugs into. Exam items often show this drawing and ask which device a CE peers with (its PE) or which devices hold no customer routes (the P routers).",
  },
  {
    kind: 'steps',
    title: 'How a Layer 3 MPLS VPN forwards traffic',
    steps: [
      { title: 'CE advertises its subnets to the PE', text: 'Static, RIPv2, EIGRP, OSPF or eBGP on the CE–PE link.' },
      { title: 'PE stores them in the customer VRF', text: 'Separate tables keep overlapping customer prefixes apart.' },
      { title: 'PEs exchange VPN routes with MP-BGP', text: 'The remote PE advertises them on to its own CE.' },
      { title: 'Ingress PE pushes two labels', text: 'Inner VPN label (which VRF) + outer transport label (which PE).' },
      { title: 'P routers forward on the outer label', text: 'No customer IP lookup in the core.' },
      { title: 'Egress PE uses the VPN label', text: 'Finds the VRF and sends a plain IP packet to the CE.' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'CE1', sub: 'IP packet', shape: 'pill' },
        { id: 'n2', label: 'PE1', sub: 'push labels', tone: 'accent' },
        { id: 'n3', label: 'P', sub: 'label switch' },
        { id: 'n4', label: 'PE2', sub: 'VRF lookup', tone: 'accent' },
        { id: 'n5', label: 'CE2', sub: 'IP packet', shape: 'pill' },
      ],
    },
    notes:
      "Here is the life of a packet in a **Layer 3 MPLS VPN**. First, the CE advertises its site's subnets to the PE using a routing method both sides agree on — static routes, RIPv2, EIGRP, OSPF or eBGP. The PE places those routes in the customer's VRF and uses **MP-BGP** (multiprotocol BGP) to share them with the other PEs, attaching a route distinguisher so overlapping customer prefixes stay unique, plus a VPN label. The remote PE installs the routes in the matching VRF and advertises them to its own CE, so every site learns every other site's subnets. When data flows, the ingress PE **pushes** two labels: an inner **VPN label** that identifies the customer VRF at the far end, and an outer **transport label** that carries the packet across the core to the egress PE. P routers forward using only that outer label. The egress PE uses the VPN label to select the correct VRF and forwards an ordinary IP packet to the CE. Because labels, not customer IP addresses, steer the core, the P routers stay simple and fast. For the exam, remember the roles and that the CE sees an ordinary routing neighbor: the PE.",
  },
  {
    kind: 'compare',
    title: 'Layer 3 vs Layer 2 MPLS VPN',
    left: {
      heading: 'Layer 3 MPLS VPN',
      tone: 'accent',
      bullets: [
        'CE is a routing **peer of the PE**',
        'Provider routes your IP packets using VRFs',
        'Sites may use different access types',
        'No routing adjacency between remote CEs',
        'Provider takes part in your routing design',
      ],
    },
    right: {
      heading: 'Layer 2 MPLS VPN',
      bullets: [
        'Provider emulates a **wire** (VPWS) or a **switch** (VPLS)',
        'CE routers peer **directly with each other**',
        'Provider never sees your routes',
        'You keep full control of routing',
        'Ethernet hand-off; sites share a subnet',
      ],
    },
    notes:
      "Providers sell MPLS services in two flavors, and the difference is **who routes**. In a **Layer 3 MPLS VPN**, the provider participates in your IP routing: each CE forms a routing adjacency with its PE, and the PEs carry your routes between sites. You get any-to-any routing without managing a mesh of neighbors yourself, and each site can use a different access technology, even DSL or a cellular link. In a **Layer 2 MPLS VPN**, the provider only moves Ethernet frames. **VPWS** (virtual private wire service) emulates a point-to-point wire and corresponds to the E-Line service, while **VPLS** (virtual private LAN service) emulates a switch that connects all sites and corresponds to E-LAN. The provider never sees your routes; your CE routers share a subnet and become routing neighbors **directly with each other**, exactly as if they were plugged into the same LAN. Choose Layer 3 when you want the provider to handle inter-site routing; choose Layer 2 when you want complete control of routing. Exam questions often hide this distinction in one sentence, such as 'the branch routers form OSPF adjacencies with each other' — that describes a Layer 2 service.",
  },
  {
    kind: 'bullets',
    title: 'Metro Ethernet and the E-Line service',
    bullets: [
      'Provider service that behaves like **Layer 2 Ethernet**',
      'Customer connects at a **UNI** (user network interface)',
      'An **EVC** is the virtual connection between UNIs',
      'Services are defined by the **MEF** (Metro Ethernet Forum)',
      '**E-Line** = point-to-point EVC between two sites',
      'Several E-Lines can share one UNI using **VLAN tags**',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hq', icon: 'router', label: 'HQ', x: 1.2, y: 1.5 },
        { id: 'br', icon: 'router', label: 'Branch', x: 8.8, y: 1.5 },
        { id: 'me', icon: 'cloud', label: 'Metro Ethernet', sub: 'provider', x: 5, y: 3.6 },
      ],
      links: [
        { from: 'hq', to: 'me', fromLabel: 'G0/0/1', label: 'UNI' },
        { from: 'me', to: 'br', toLabel: 'G0/0/1', label: 'UNI' },
        { from: 'hq', to: 'br', style: 'dashed', tone: 'accent', label: 'E-Line EVC (point-to-point)' },
      ],
    },
    notes:
      "**Metro Ethernet** (MetroE) is a provider service that looks like Ethernet to the customer. Each site connects with an ordinary Ethernet interface, usually over fiber, at the **UNI** (user network interface) — the demarcation point between you and the provider. Inside its network the provider can use whatever technology it likes, often MPLS, but the service behaves like a Layer 2 wire or switch. The **MEF** (Metro Ethernet Forum) standardizes these services in terms of **EVCs**: an Ethernet Virtual Connection is the logical association between two or more UNIs that are allowed to exchange frames. The simplest service is **E-Line**, a point-to-point EVC between two sites — conceptually a leased line, but with Ethernet speeds, pricing and interfaces. A hub site that needs E-Lines to several branches can multiplex them on one physical UNI by giving each EVC its own **VLAN tag** and configuring a router subinterface per VLAN. Because each E-Line is a separate link, each gets its own subnet, and each branch router has exactly one routing neighbor: the hub. The name comes from metropolitan-area distances, although providers now offer the same services over much longer reaches.",
  },
  {
    kind: 'diagram',
    title: 'E-LAN and E-Tree (logical view)',
    diagram: {
      type: 'topology',
      width: 12,
      height: 5,
      nodes: [
        { id: 'a1', icon: 'router', label: 'R1', x: 1.2, y: 1.4 },
        { id: 'a2', icon: 'router', label: 'R2', x: 4.6, y: 1.4 },
        { id: 'a3', icon: 'router', label: 'R3', x: 1.2, y: 3.8 },
        { id: 'a4', icon: 'router', label: 'R4', x: 4.6, y: 3.8 },
        { id: 'rt', icon: 'router', label: 'Root', sub: 'HQ', x: 9, y: 1.4, tone: 'accent' },
        { id: 'l1', icon: 'router', label: 'Leaf 1', x: 7.2, y: 3.8 },
        { id: 'l2', icon: 'router', label: 'Leaf 2', x: 9, y: 3.8 },
        { id: 'l3', icon: 'router', label: 'Leaf 3', x: 10.8, y: 3.8 },
      ],
      links: [
        { from: 'a1', to: 'a2', style: 'dashed' },
        { from: 'a1', to: 'a3', style: 'dashed' },
        { from: 'a1', to: 'a4', style: 'dashed' },
        { from: 'a2', to: 'a3', style: 'dashed' },
        { from: 'a2', to: 'a4', style: 'dashed' },
        { from: 'a3', to: 'a4', style: 'dashed' },
        { from: 'rt', to: 'l1', style: 'dashed', tone: 'accent' },
        { from: 'rt', to: 'l2', style: 'dashed', tone: 'accent' },
        { from: 'rt', to: 'l3', style: 'dashed', tone: 'accent' },
      ],
      groups: [
        { label: 'E-LAN: any-to-any', x: 0.4, y: 0.4, w: 5, h: 4.3 },
        { label: 'E-Tree: root ↔ leaves only', x: 6.4, y: 0.4, w: 5.2, h: 4.3 },
      ],
    },
    caption: 'Dashed lines show which sites can exchange frames. E-Tree leaves can never reach each other.',
    notes:
      "The other two MEF services connect more than two sites with a single multipoint EVC. **E-LAN** (Ethernet LAN service) is **multipoint-to-multipoint**: every site can send frames directly to every other site, as if all the routers were plugged into one big switch. Logically it is a **full mesh**. Routers attached to an E-LAN usually share one subnet, so with OSPF every router hears every other router's hellos, and a broadcast from one site reaches all of them. **E-Tree** (Ethernet Tree) is **rooted multipoint** — a hub-and-spoke service. One or more **root** sites can talk to every **leaf**, but leaves can never exchange frames with each other, because the provider enforces it. That suits a head office whose branches should only reach central servers, or a provider selling Internet access to many customers who must not see one another. With routing, the root router becomes a neighbor of each leaf router, but leaf routers never become neighbors with each other because their hellos never arrive. Compare both with E-Line, which connects exactly two UNIs. Expect a diagram question that asks you to name the service from the paths it allows, or to count the neighbors of a leaf.",
  },
  {
    kind: 'table',
    title: 'MEF Ethernet services compared',
    columns: ['Service', 'Topology', 'Who can talk', 'Routing view (one router per site)'],
    rows: [
      ['**E-Line**', 'Point-to-point', 'Exactly two sites per EVC', 'One subnet per EVC; one neighbor each'],
      ['**E-LAN**', 'Full mesh (multipoint)', 'Any site to any site', 'One shared subnet; every router hears every router'],
      ['**E-Tree**', 'Hub-and-spoke (rooted multipoint)', 'Root ↔ leaves; never leaf ↔ leaf', 'Root neighbors each leaf; leaves never neighbors'],
    ],
    caption: 'Line = two points · LAN = everyone hears everyone · Tree = root and leaves',
    notes:
      "Use this table to lock in the three MEF services. The easiest memory aid is the name: **E-Line** is a **line** between two points, **E-LAN** behaves like a **LAN** where everyone hears everyone, and **E-Tree** is a **tree** with a root and leaves. The last column matters for routing questions. Each E-Line is its own point-to-point link, so a hub with four E-Lines has four subnets and four neighbors, typically on four VLAN subinterfaces of one physical port. An E-LAN puts all routers in one subnet; OSPF treats it as a broadcast network, elects a DR and BDR, and every router becomes at least a 2-Way neighbor of every other. An E-Tree also uses one subnet, but because leaves cannot hear each other, only root-to-leaf adjacencies form. Providers deliver each service either **port-based** (one service owns the whole UNI) or **VLAN-based** (several services multiplexed by VLAN tag on one UNI) — for E-Line these are called EPL (Ethernet Private Line) and EVPL (Ethernet Virtual Private Line). Knowing these patterns lets you answer 'how many neighbors' questions without memorizing each diagram.",
  },
  {
    kind: 'table',
    title: 'Internet access technologies',
    columns: ['Technology', 'Medium', 'Customer device', 'Provider side', 'Key points'],
    rows: [
      ['**DSL**', 'Telephone copper pair', 'DSL modem', '**DSLAM** in the CO', 'Shares the phone line; ADSL is asymmetric; distance-limited'],
      ['**Cable**', 'Coax (hybrid fiber-coax)', 'Cable modem', '**CMTS** at the head-end', 'DOCSIS; bandwidth shared with neighbors'],
      ['**Fiber (FTTH)**', 'Optical fiber', '**ONT**', 'OLT over a PON', 'Highest speeds; often symmetric'],
      ['**4G / 5G**', 'Cellular radio', 'Cellular router or modem + SIM', 'Mobile operator', 'Fast to deploy; backup, pop-up and mobile sites'],
      ['**Satellite**', 'Radio via orbit', 'Dish + satellite modem', 'Ground station', 'Works almost anywhere; high latency with GEO'],
    ],
    notes:
      "Branch offices and teleworkers usually reach the Internet over consumer-style access links, and the exam expects you to match each technology to its medium and devices. **DSL** reuses the telephone company's copper pair; a DSL modem at the customer talks to a **DSLAM** (DSL access multiplexer) in the provider's central office, and filters let voice and data share the line. Speeds drop with distance from the central office, and ADSL is asymmetric — faster down than up. **Cable** Internet runs over the cable-TV network (hybrid fiber-coax); the cable modem talks to a **CMTS** (cable modem termination system) at the head-end using the **DOCSIS** standard, and neighbors share the segment's bandwidth. **Fiber to the home (FTTH)** brings fiber all the way to the building, where an **ONT** (optical network terminal) converts light to Ethernet; a passive optical network (PON) splits one provider fiber among many customers. **4G/5G** access needs only a cellular router or modem and a SIM, making it ideal for backup links, pop-up sites and vehicles. **Satellite** works almost anywhere, but geostationary satellites add high latency; low-earth-orbit constellations reduce it. All of these are best-effort services, so enterprises add VPN encryption on top.",
  },
  {
    kind: 'diagram',
    title: 'Broadband last mile: DSL, cable and fiber',
    diagram: {
      type: 'topology',
      width: 12,
      height: 6,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DSL site', x: 1.2, y: 1 },
        { id: 'm1', icon: 'modem', label: 'DSL modem', x: 3.6, y: 1 },
        { id: 'p1', icon: 'box', label: 'DSLAM', sub: 'telco CO', x: 7, y: 1, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'cable site', x: 1.2, y: 3 },
        { id: 'm2', icon: 'modem', label: 'Cable modem', x: 3.6, y: 3 },
        { id: 'p2', icon: 'box', label: 'CMTS', sub: 'cable head-end', x: 7, y: 3, tone: 'accent' },
        { id: 'r3', icon: 'router', label: 'R3', sub: 'fiber site', x: 1.2, y: 5 },
        { id: 'm3', icon: 'modem', label: 'ONT', x: 3.6, y: 5 },
        { id: 'p3', icon: 'box', label: 'OLT', sub: 'provider', x: 7, y: 5, tone: 'accent' },
        { id: 'isp', icon: 'internet', label: 'ISP / Internet', x: 10.6, y: 3 },
      ],
      links: [
        { from: 'r1', to: 'm1', label: 'Ethernet' },
        { from: 'm1', to: 'p1', label: 'phone line (copper)' },
        { from: 'p1', to: 'isp' },
        { from: 'r2', to: 'm2', label: 'Ethernet' },
        { from: 'm2', to: 'p2', label: 'coax (DOCSIS)' },
        { from: 'p2', to: 'isp' },
        { from: 'r3', to: 'm3', label: 'Ethernet' },
        { from: 'm3', to: 'p3', label: 'fiber (PON)' },
        { from: 'p3', to: 'isp' },
      ],
    },
    caption: 'Phone line → DSLAM · coax → CMTS · fiber → ONT and OLT',
    notes:
      "This drawing traces three common last-mile paths from a small-office router to the Internet. In every case the office router connects to a provider box with ordinary Ethernet, and the box adapts Ethernet to the access medium. On the **DSL** path, the DSL modem sends data over the existing telephone line to a **DSLAM** in the telephone company's central office, which aggregates many subscriber lines onto the ISP network. On the **cable** path, the cable modem shares the coax plant with the neighborhood, and the **CMTS** at the cable operator's head-end plays the same aggregating role that the DSLAM plays for DSL. On the **fiber** path, the **ONT** at the customer site connects over a passive optical network to an **OLT** (optical line terminal) in the provider's facility. Many consumer products combine the modem, router, switch and Wi-Fi access point in one box, often called a SOHO router. On the exam, distractors frequently swap these components — offering a CMTS in a DSL question, for example — so tie each device firmly to its medium: phone line to DSLAM, coax to CMTS, fiber to ONT and OLT.",
  },
  {
    kind: 'bullets',
    title: 'Internet VPNs: site-to-site and remote access',
    bullets: [
      'Internet is cheap but **untrusted** → encrypt with a VPN',
      '**Site-to-site**: gateways tunnel whole networks (usually **IPsec**)',
      'Site-to-site hosts need **no VPN software**',
      '**Remote access**: one device to the enterprise',
      'Client software using **TLS** or IPsec, on demand',
      'GRE over IPsec and DMVPN add routing and scale',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      nodes: [
        { id: 'hq', icon: 'firewall', label: 'HQ firewall', sub: 'VPN gateway', x: 1.2, y: 2, tone: 'accent' },
        { id: 'br', icon: 'router', label: 'Branch router', sub: 'VPN gateway', x: 8.8, y: 1 },
        { id: 'lap', icon: 'laptop', label: 'Teleworker', sub: 'VPN client', x: 8.8, y: 3.4 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 5, y: 4.4 },
      ],
      links: [
        { from: 'hq', to: 'net', tone: 'muted' },
        { from: 'net', to: 'br', tone: 'muted' },
        { from: 'net', to: 'lap', tone: 'muted' },
        { from: 'hq', to: 'br', style: 'dashed', tone: 'accent', label: 'site-to-site IPsec' },
        { from: 'hq', to: 'lap', style: 'dashed', label: 'remote-access VPN' },
      ],
    },
    notes:
      "The Internet reaches almost everywhere cheaply, but it is shared and untrusted, so enterprises protect WAN traffic that crosses it with **VPNs**. A **site-to-site VPN** connects entire networks. The routers or firewalls at each site act as VPN gateways and build an encrypted tunnel, usually with **IPsec**; hosts send ordinary traffic that the gateway encrypts transparently, so users need no special software and the tunnel is normally always on. Classic IPsec tunnels do not carry multicast, so designers often use **GRE over IPsec** when routing protocols must run across the tunnel, and **DMVPN** to scale to many branches with on-demand spoke-to-spoke tunnels. A **remote-access VPN** connects a single device, such as a teleworker's laptop, to the enterprise. VPN client software (or sometimes just a web browser) builds the tunnel, typically with **TLS** or IPsec, when the user needs it, and a firewall or VPN concentrator at headquarters terminates it. On the exam, the words teleworker, laptop and client software point to remote access, while branch, gateway and no host software point to site-to-site. VPN protocols are covered in depth in the security lessons; here the focus is their role as a WAN option.",
  },
  {
    kind: 'bullets',
    title: 'SD-WAN: one overlay across any transport',
    bullets: [
      'Controller-based WAN: central policy, **zero-touch** provisioning',
      '**Transport-independent**: MPLS, Internet and 4G/5G at once',
      'Edges build **IPsec overlay** tunnels over every transport',
      '**Application-aware routing** picks a path that meets the SLA',
      'Manager (vManage) · Controller (vSmart) · Validator (vBond)',
      '**WAN Edge** routers forward the data plane',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 6,
      nodes: [
        { id: 'mgr', icon: 'server', label: 'SD-WAN Manager', sub: 'management', x: 1.5, y: 1 },
        { id: 'ctl', icon: 'controller', label: 'SD-WAN Controller', sub: 'control (OMP)', x: 5, y: 1, tone: 'accent' },
        { id: 'val', icon: 'server', label: 'SD-WAN Validator', sub: 'orchestration', x: 8.5, y: 1 },
        { id: 'e1', icon: 'router', label: 'WAN Edge', sub: 'HQ', x: 1.2, y: 4 },
        { id: 'e2', icon: 'router', label: 'WAN Edge', sub: 'Branch', x: 8.8, y: 4 },
        { id: 'mpls', icon: 'cloud', label: 'MPLS', x: 5, y: 3.1 },
        { id: 'net', icon: 'internet', label: 'Internet', x: 5, y: 5.1 },
      ],
      links: [
        { from: 'ctl', to: 'e1', style: 'dotted' },
        { from: 'ctl', to: 'e2', style: 'dotted' },
        { from: 'e1', to: 'mpls', tone: 'muted' },
        { from: 'mpls', to: 'e2', tone: 'muted' },
        { from: 'e1', to: 'net', tone: 'muted' },
        { from: 'net', to: 'e2', tone: 'muted' },
      ],
      annotations: [{ x: 5, y: 2.2, text: 'IPsec overlay tunnels over both transports', tone: 'accent' }],
    },
    notes:
      "**SD-WAN** applies controller-based networking to the WAN. Instead of configuring each branch router by hand, administrators define policy once centrally, and new branch routers can join with **zero-touch provisioning**. SD-WAN is **transport-independent**: each WAN Edge router can use MPLS, broadband Internet and 4G/5G links at the same time, building encrypted **IPsec overlay** tunnels across every transport (the underlay). Probes continuously measure loss, latency and jitter on every tunnel, and **application-aware routing** steers each application to a path that currently meets its SLA — voice might prefer MPLS but move to the Internet within seconds when MPLS degrades, while bulk backups use the cheapest link. Cisco's solution splits the planes into separate components: **SD-WAN Manager** (formerly vManage) provides management and the GUI; **SD-WAN Controller** (formerly vSmart) is the control plane, distributing routes and policy with OMP (Overlay Management Protocol); **SD-WAN Validator** (formerly vBond) handles orchestration — authenticating devices as they join and helping them traverse NAT; and the **WAN Edge** routers form the data plane. The exam tests the concepts: overlay versus underlay, separated planes, centralized policy and path selection.",
  },
  {
    kind: 'table',
    title: 'Choosing a WAN design',
    columns: ['Option', 'Privacy', 'Strengths', 'Watch-outs'],
    rows: [
      ['Leased line', 'Private, dedicated', 'Predictable bandwidth, simple', 'Cost grows with distance; one circuit per pair'],
      ['MPLS L3 VPN', 'Private, **not encrypted**', 'Any-to-any, SLAs, QoS, any access type', 'Price; provider in your routing'],
      ['Metro Ethernet', 'Private Layer 2', 'High bandwidth, Ethernet hand-off', 'You own routing and broadcast design'],
      ['Internet + VPN', 'Public, encrypted', 'Cheapest, available everywhere', 'Best effort; no end-to-end SLA'],
      ['SD-WAN', 'Encrypted overlay', 'Uses every link, app-aware paths, central policy', 'Controllers and licensing to run'],
    ],
    notes:
      "No single WAN option wins everywhere, so real designs combine them. **Leased lines** give dedicated, predictable bandwidth between two points, but cost rises with distance and each pair of sites needs its own circuit. **MPLS Layer 3 VPNs** offer any-to-any connectivity, provider SLAs and QoS classes over many access types; the trade-offs are price and the provider's involvement in your routing. Remember that MPLS separates customers but does **not encrypt** traffic — if confidentiality is required, add IPsec. **Metro Ethernet** delivers high bandwidth with a simple Ethernet hand-off, and you keep full control of routing, but because it is a Layer 2 service, broadcast behavior and routing design are your responsibility. **Internet with VPNs** is the cheapest and most widely available option, but it is best effort, with no end-to-end guarantee across multiple ISPs. **SD-WAN** combines links, adds application-aware path selection and central policy, and often lets companies replace part of their MPLS capacity with broadband; it needs controllers (on-premises or cloud-hosted) and licensing. Exam scenarios usually hinge on one requirement — encryption, SLA, cost, reach or routing control — so identify that requirement first, then pick the option.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: WAN architectures',
    body: 'Know **who peers with whom**: in a Layer 3 MPLS VPN the CE routes with the **PE**; in Layer 2 services (VPWS, VPLS, E-Line, E-LAN, E-Tree) the CE routers peer **with each other**.',
    bullets: [
      '**P** routers hold no customer routes — only PEs keep VRFs',
      '**E-Tree** leaves never talk to each other; **E-LAN** is any-to-any',
      'Full mesh links = **n(n − 1)/2** (8 sites = 28)',
      '**Dual-homed** = two links, one ISP; **multihomed** = two or more ISPs',
      '**DSLAM** = DSL, **CMTS** = cable, **ONT** = fiber',
      'MPLS isolates customers but does **not encrypt**',
      'Router = **DTE**; CSU/DSU = **DCE**, which provides the clock',
    ],
    notes:
      "These are the WAN distinctions that most often cost candidates points. The biggest is **routing adjacency**: in a Layer 3 MPLS VPN the CE forms its adjacency with the PE, never with the remote CE; in Layer 2 services the customer routers peer with each other and the provider is invisible to routing. Next, the **P routers** hold no customer routes, and only PEs keep VRFs. For Metro Ethernet, remember that **E-Tree** blocks leaf-to-leaf traffic, so leaf routers never become neighbors, while every router on an E-LAN can. Expect at least one arithmetic item: full mesh links equal n(n − 1)/2, so do not forget to divide by two. Redundancy terms differ by a single word, so read carefully: dual-homed means two links to one ISP; multihomed means connections to two or more ISPs; dual-multihomed means two links to each. Access devices are easy points if you tie them to the medium: DSLAM for DSL, CMTS for cable, ONT for fiber. Never assume a private WAN is encrypted — MPLS isolates customers with labels and VRFs, but confidentiality needs IPsec. Finally, the router is the DTE and the CSU/DSU is the DCE that provides clocking.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Topologies: point-to-point, hub-and-spoke, full and partial mesh',
      'Redundancy: single-homed, dual-homed, multihomed, dual-multihomed',
      'Leased line: CSU/DSU is the DCE; HDLC default, PPP optional',
      'MPLS L3 VPN: CE ↔ PE routing, VRFs + MP-BGP, P switches labels',
      'Metro Ethernet: E-Line, E-LAN, E-Tree over UNIs and EVCs',
      'Internet access: DSL, cable, FTTH, 4G/5G, satellite',
      'Internet VPNs (site-to-site, remote access) and SD-WAN overlays',
    ],
    notes:
      "A WAN connects distant sites over infrastructure you lease. Logically it can be **point-to-point**, **hub-and-spoke** (n − 1 links, spoke traffic through the hub), **full mesh** (n(n − 1)/2 links) or **partial mesh**, and each site's connection can be single-homed, dual-homed, multihomed or dual-multihomed. Private WAN services include **leased lines**, where the CSU/DSU acts as the DCE and the router as the DTE, running HDLC by default or PPP; **MPLS VPNs**, where CE routers connect to PE routers that hold VRFs while P routers only switch labels, delivered as Layer 3 service (CE peers with PE) or Layer 2 service (VPWS, VPLS); and **Metro Ethernet**, which the MEF defines as E-Line (point-to-point), E-LAN (any-to-any) and E-Tree (root to leaves). **Internet access** arrives over DSL (DSLAM), cable (CMTS), fiber (ONT), 4G/5G or satellite, and VPNs make it private: site-to-site for whole networks, remote access for individual users. **SD-WAN** ties everything together with an encrypted overlay, centralized policy and application-aware routing across every transport. Now test yourself: the flashcards drill the terms, and the exam questions make you identify each design from diagrams and output.",
  },
];
