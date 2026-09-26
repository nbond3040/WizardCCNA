import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Network Components',
    subtitle: 'Routers, switches, firewalls, IPS, wireless, controllers, endpoints and servers',
    notes:
      "Every network, from a home office to a hyperscale data center, is assembled from the same family of components. This deck introduces each one by its **job**: routers connect networks, switches connect devices inside a network, firewalls and IPS sensors enforce security, access points and wireless LAN controllers deliver Wi-Fi, controllers such as **Cisco Catalyst Center** and the **Meraki** dashboard manage the whole estate, and endpoints and servers are why the network exists at all. Along the way you will learn to count **collision and broadcast domains**, tell a **stateful firewall** from a **next-generation firewall**, and explain why an IPS is placed **inline** while an IDS is not. This lesson covers v1.1 exam topics 1.1.a to 1.1.g and sits in Domain 1 of v2.0; Power over Ethernet (topic 1.1.h) has its own lesson later in this module.",
  },
  {
    kind: 'diagram',
    title: 'Meet the building blocks',
    diagram: {
      type: 'topology',
      width: 12,
      height: 6,
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC', sub: 'manages APs', x: 1.2, y: 1 },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', sub: 'Layer 3 switch', x: 4, y: 1 },
        { id: 'fw', icon: 'firewall', label: 'FW1', sub: 'NGFW', x: 6.8, y: 1 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'WAN edge', x: 9, y: 1 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 11, y: 1 },
        { id: 'asw1', icon: 'switch', label: 'ASW1', x: 2.5, y: 3 },
        { id: 'asw2', icon: 'switch', label: 'ASW2', x: 5.5, y: 3 },
        { id: 'srv', icon: 'server', label: 'Servers', x: 8.5, y: 3 },
        { id: 'pc', icon: 'pc', label: 'PC', x: 1, y: 5 },
        { id: 'ph', icon: 'phone', label: 'IP phone', x: 2.8, y: 5 },
        { id: 'ap', icon: 'ap', label: 'AP', x: 4.6, y: 5 },
        { id: 'lap', icon: 'laptop', label: 'Laptop', x: 6.4, y: 5 },
        { id: 'cam', icon: 'camera', label: 'Camera', x: 8.2, y: 5 },
      ],
      links: [
        { from: 'wlc', to: 'dsw' },
        { from: 'dsw', to: 'fw' },
        { from: 'fw', to: 'r1' },
        { from: 'r1', to: 'inet' },
        { from: 'dsw', to: 'asw1' },
        { from: 'dsw', to: 'asw2' },
        { from: 'dsw', to: 'srv' },
        { from: 'asw1', to: 'pc' },
        { from: 'asw1', to: 'ph' },
        { from: 'asw2', to: 'ap' },
        { from: 'ap', to: 'lap', style: 'wireless' },
        { from: 'asw2', to: 'cam' },
      ],
    },
    caption: 'One small enterprise: every device in this lesson has a job here.',
    notes:
      "Take a tour of a typical small enterprise before we study each part. At the bottom are the **endpoints** — a PC, an IP phone, a wireless laptop and a security camera — the devices that create and consume traffic. They plug into **access switches** (ASW1 and ASW2), which also power the phone, AP and camera with PoE. The **access point** turns radio into Ethernet for the laptop, and the **WLC** manages that AP centrally. The access switches uplink to a **Layer 3 switch** (DSW1) that routes between VLANs and connects the **servers**. Traffic leaving the site passes a **next-generation firewall** (FW1), which enforces security policy, and the **WAN edge router** (R1), which connects to the Internet. Real designs add redundancy — pairs of distribution switches, firewalls and routers — which the topology-architectures lesson covers. For now, notice that each device has a clear role; exam questions often describe a role and ask you to name the device.",
  },
  {
    kind: 'bullets',
    title: 'Routers: connecting networks',
    bullets: [
      'Forward **packets** between networks using the **routing table**',
      'Each interface is its own subnet and **broadcast domain**',
      'Act as the **default gateway** for hosts on each LAN',
      '**WAN edge**: connect sites to ISPs, MPLS and Internet VPNs',
      'Often add NAT/PAT, ACLs, QoS and VPN termination at the edge',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'a', icon: 'pc', label: 'PC-A', sub: '10.1.1.10', x: 1, y: 2.8 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'default gateway', x: 5, y: 2.8, tone: 'accent' },
        { id: 'b', icon: 'pc', label: 'PC-B', sub: '10.1.2.10', x: 9, y: 2.8 },
        { id: 'isp', icon: 'internet', label: 'ISP / WAN', x: 5, y: 0.8 },
      ],
      links: [
        { from: 'a', to: 'r1', label: '10.1.1.0/24', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'b', label: '10.1.2.0/24', fromLabel: 'G0/0/1' },
        { from: 'r1', to: 'isp', fromLabel: 'G0/1/0' },
      ],
    },
    notes:
      "A **router** is a Layer 3 device whose core job is to move packets from one network to another. Every interface connects to a different subnet, and the router keeps a **routing table** of known destination networks, learned from its own connected interfaces, static routes or routing protocols such as OSPF. When a packet arrives, the router matches the destination IP against that table and forwards it out the best interface in a new Layer 2 frame. Because routers do not forward broadcasts by default, **each router interface is a separate broadcast domain** — that is how routers keep large networks manageable. Hosts on each LAN use the router interface as their **default gateway**. At the **WAN edge**, routers connect sites to service providers over Ethernet, serial, cellular or broadband links, and they commonly add NAT/PAT, ACL filtering, QoS and VPN termination. On ISR 4000-series routers the interface names have three parts, such as `GigabitEthernet0/0/0`.",
  },
  {
    kind: 'diagram',
    title: 'Three planes inside every network device',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Plane',
          layers: [
            { label: 'Management', tone: 'muted' },
            { label: 'Control', tone: 'accent' },
            { label: 'Data (forwarding)' },
          ],
        },
        {
          title: 'Job',
          layers: [
            { label: 'Configure and monitor the device' },
            { label: 'Build the tables forwarding uses' },
            { label: 'Forward, filter and rewrite each packet' },
          ],
        },
        {
          title: 'Examples',
          layers: [
            { label: 'SSH, SNMP, syslog, HTTPS GUI' },
            { label: 'OSPF, ARP, STP' },
            { label: 'Route lookup, ACLs, NAT, 802.1Q tagging' },
          ],
        },
      ],
    },
    caption: 'The control plane decides; the data plane does the per-packet work.',
    notes:
      "Inside a router or switch, work is split into planes. The **data plane** (also called the forwarding plane) handles every packet or frame that passes through: de-encapsulating and re-encapsulating, looking up the MAC table or routing table, adding or removing 802.1Q tags, applying ACLs, rewriting addresses for NAT and finally transmitting. It must be fast, so switches do it in ASIC hardware and routers use optimized paths such as CEF. The **control plane** builds the information the data plane relies on: OSPF exchanges routes to build the routing table, ARP resolves next-hop MAC addresses, and STP decides which ports forward. The **management plane** is how humans and tools talk to the device: SSH, SNMP, syslog and web GUIs. A useful test: if the action happens *to each user packet*, it is data plane; if it *builds tables or state*, it is control plane; if it *configures or monitors*, it is management plane. Controller-based networking (later in the course) centralizes much of the control plane.",
  },
  {
    kind: 'bullets',
    title: 'Layer 2 switches',
    bullets: [
      'Forward **frames** by destination **MAC** address',
      'Learn **source** MACs into the MAC address table',
      'Flood broadcasts and unknown unicasts within the VLAN',
      'Each port is a separate **collision domain** (full duplex)',
      'All ports in one VLAN form one **broadcast domain**',
      'Forwarding happens in hardware at wire speed',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 1.2, tone: 'accent' },
        { id: 'p1', icon: 'pc', label: 'PC1', x: 1.5, y: 3.4 },
        { id: 'p2', icon: 'pc', label: 'PC2', x: 3.8, y: 3.4 },
        { id: 'p3', icon: 'pc', label: 'PC3', x: 6.2, y: 3.4 },
        { id: 'p4', icon: 'pc', label: 'PC4', x: 8.5, y: 3.4 },
      ],
      links: [
        { from: 'sw', to: 'p1', label: 'CD 1' },
        { from: 'sw', to: 'p2', label: 'CD 2' },
        { from: 'sw', to: 'p3', label: 'CD 3' },
        { from: 'sw', to: 'p4', label: 'CD 4' },
      ],
      groups: [{ label: 'One broadcast domain (VLAN 1)', x: 0.4, y: 0.3, w: 9.2, h: 4.0 }],
    },
    notes:
      "A **Layer 2 switch** connects devices within a LAN. When a frame arrives, the switch records the **source MAC** and the port it came in on in its **MAC address table**, then looks up the **destination MAC**: a known unicast is forwarded out only the matching port; a broadcast or an unknown unicast is **flooded** out every other port in the same VLAN. Every switch port is a separate **collision domain**, and with full duplex there are no collisions at all — a big improvement over hubs, which put every port into one shared collision domain. However, a switch forwards broadcasts, so all ports in the same VLAN form **one broadcast domain**; the diagram shows four collision domains inside a single broadcast domain. To split broadcast domains you need VLANs, and to move traffic between VLANs you need a Layer 3 device. The Ethernet switching lesson covers MAC learning, aging and flooding in depth.",
  },
  {
    kind: 'compare',
    title: 'Layer 2 vs Layer 3 (multilayer) switches',
    left: {
      heading: 'Layer 2 switch',
      bullets: [
        'Forwards frames by **MAC** address',
        'VLANs separate broadcast domains',
        'Needs a **router** to pass traffic between VLANs',
        'Typical at the **access** layer',
      ],
    },
    right: {
      heading: 'Layer 3 switch',
      tone: 'accent',
      bullets: [
        'Switches within a VLAN **and routes** between VLANs',
        'Uses **SVIs** (`interface vlan 10`) and routed ports (`no switchport`)',
        'Needs `ip routing`; can run OSPF and other protocols',
        'Typical at **distribution/core**; routes in hardware',
      ],
    },
    notes:
      "A **multilayer switch** (Layer 3 switch) is a switch with routing built into its forwarding hardware. Inside a VLAN it behaves exactly like a Layer 2 switch, but it can also act as the default gateway for each VLAN using a **switched virtual interface** (SVI) — for example `interface vlan 10` with an IP address — and route between VLANs at wire speed. It can also turn a physical port into a **routed port** with `no switchport`, making it behave like a router interface. Routing must be enabled globally with `ip routing`. Layer 3 switches usually sit at the distribution and core layers, where they route between access VLANs and toward the rest of the network, while cheaper Layer 2 switches serve the access layer. Traditional routers remain the better fit for WAN edges because they offer richer WAN interfaces and services such as NAT and VPNs. On the exam, 'routes between VLANs without an external router' means a Layer 3 switch.",
  },
  {
    kind: 'diagram',
    title: 'Counting collision and broadcast domains',
    diagram: {
      type: 'topology',
      width: 12,
      height: 6,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 6, y: 0.9, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3, y: 2.7 },
        { id: 'hub', icon: 'hub', label: 'Hub1', x: 9, y: 2.7 },
        { id: 'a1', icon: 'pc', label: 'A1', x: 1.3, y: 4.7 },
        { id: 'a2', icon: 'pc', label: 'A2', x: 3, y: 4.7 },
        { id: 'a3', icon: 'pc', label: 'A3', x: 4.7, y: 4.7 },
        { id: 'b1', icon: 'pc', label: 'B1', x: 7.3, y: 4.7 },
        { id: 'b2', icon: 'pc', label: 'B2', x: 9, y: 4.7 },
        { id: 'b3', icon: 'pc', label: 'B3', x: 10.7, y: 4.7 },
      ],
      links: [
        { from: 'r1', to: 'sw', fromLabel: 'G0/0/0' },
        { from: 'r1', to: 'hub', fromLabel: 'G0/0/1' },
        { from: 'sw', to: 'a1' },
        { from: 'sw', to: 'a2' },
        { from: 'sw', to: 'a3' },
        { from: 'hub', to: 'b1' },
        { from: 'hub', to: 'b2' },
        { from: 'hub', to: 'b3' },
      ],
      groups: [
        { label: 'Broadcast domain 1 · 4 collision domains', x: 0.4, y: 1.9, w: 5.2, h: 3.7 },
        { label: 'Broadcast domain 2 · 1 collision domain', x: 6.4, y: 1.9, w: 5.2, h: 3.7, tone: 'warn' },
      ],
    },
    caption: 'Total: 5 collision domains and 2 broadcast domains.',
    notes:
      "Counting domains is a classic exam task, and a simple method never fails. **Broadcast domains**: count the router interfaces in use (and VLANs, if any) — broadcasts stop at a router. Here R1 has two LAN interfaces, so there are **2 broadcast domains**. **Collision domains**: every switch port with something plugged in is its own collision domain, *including the uplink* to the router; a hub and everything attached to it is **one** collision domain. SW1 has three PCs plus the uplink to R1, giving four. Hub1 and its three PCs plus R1's G0/0/1 share one. Total: **5 collision domains**. The most common mistakes are forgetting the switch-to-router link, counting each hub port separately, and thinking a switch separates broadcast domains. With modern full-duplex switch ports, collisions cannot actually occur, but the exam still expects you to count the domains this way.",
  },
  {
    kind: 'table',
    title: 'Hub vs switch vs router',
    columns: ['Device', 'Layer', 'Collision domains', 'Broadcast domains', 'Duplex'],
    rows: [
      ['Hub', 'L1', 'One shared by all ports', 'One', 'Half only'],
      ['Layer 2 switch', 'L2', '**One per port**', 'One per VLAN', 'Full per port'],
      ['Router', 'L3', 'One per interface', '**One per interface**', 'Full per interface'],
      ['Layer 3 switch', 'L2 + L3', 'One per port', 'One per VLAN or routed port', 'Full per port'],
    ],
    notes:
      "This table summarizes how each device carves up a network. A **hub** simply repeats electrical signals, so every attached device competes for the same wire: one collision domain, one broadcast domain, and half duplex with CSMA/CD. A **switch** isolates each port, creating a separate collision domain per port and allowing full duplex, but it still floods broadcasts through the VLAN, so a single-VLAN switch is one broadcast domain. VLANs let one switch hold several broadcast domains. A **router** separates both: broadcasts are not forwarded between interfaces, so each interface is its own broadcast domain (and its own collision domain). A **Layer 3 switch** combines the two behaviors: one collision domain per port, and one broadcast domain per VLAN or routed port. When a question asks which device to add to *reduce the size of broadcast domains*, the answer is a router or Layer 3 switch (or VLANs); to *eliminate collisions*, replace hubs with switches.",
  },
  {
    kind: 'bullets',
    title: 'Firewalls: stateful inspection and zones',
    bullets: [
      'Sit at **trust boundaries** and filter traffic by policy',
      '**Stateful**: track every session in a state table',
      'Return traffic of allowed sessions is permitted automatically',
      '**Zones**: inside (trusted), outside (untrusted), **DMZ** (public servers)',
      'Default: inside → outside allowed; outside-initiated traffic denied',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'Users', x: 1.7, y: 2.3 },
        { id: 'fw', icon: 'firewall', label: 'FW1', sub: 'stateful', x: 5, y: 2.3, tone: 'accent' },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 8.3, y: 2.3 },
        { id: 'web', icon: 'server', label: 'Web server', x: 5, y: 4.2 },
      ],
      links: [
        { from: 'pc', to: 'fw' },
        { from: 'fw', to: 'inet' },
        { from: 'fw', to: 'web' },
      ],
      groups: [
        { label: 'Inside', x: 0.3, y: 1.1, w: 2.8, h: 2.4, tone: 'good' },
        { label: 'Outside', x: 6.9, y: 1.1, w: 2.8, h: 2.4, tone: 'bad' },
        { label: 'DMZ', x: 3.6, y: 3.5, w: 2.8, h: 1.4, tone: 'warn' },
      ],
    },
    notes:
      "A **firewall** enforces security policy at the boundary between networks of different trust. Traditional firewalls are **stateful**: when an inside user opens a connection to a web server, the firewall records the session (addresses, ports, protocol, TCP state) in a **state table**, and it automatically permits the matching return traffic. That is far more practical and secure than a stateless ACL, which would need a permanent rule letting outside traffic back in. Firewalls group interfaces into **zones**. The **inside** zone holds trusted users, the **outside** zone is the Internet, and the **DMZ** holds servers that outsiders must reach, such as a public web server. The usual default is that sessions may be started from inside toward outside, but traffic *initiated* from outside is denied unless a rule explicitly permits it — for example, allowing TCP 443 from anywhere to the DMZ web server only. Cisco ASA firewalls express trust with numeric security levels (inside 100, outside 0).",
  },
  {
    kind: 'table',
    title: "What makes a firewall 'next-generation'",
    columns: ['Feature', 'What it adds'],
    rows: [
      ['Stateful inspection', 'Still the foundation: sessions, NAT, VPN, zones'],
      ['**AVC**', 'Application Visibility and Control — identifies apps regardless of port'],
      ['**URL filtering**', 'Allows or blocks web requests by category and reputation score'],
      ['**NGIPS**', 'Built-in intrusion prevention with contextual awareness'],
      ['**AMP**', 'Advanced Malware Protection — file reputation, sandboxing, retrospective alerts'],
    ],
    notes:
      "A **next-generation firewall** (NGFW) keeps everything a stateful firewall does and adds deeper inspection. **Application Visibility and Control** looks at Layer 7 content and behavior to identify applications — so it can allow Webex but block a file-sharing app that hides on TCP 443, something a port-based rule cannot do. **URL filtering** classifies millions of web sites by category (gambling, malware, social media) and reputation score and enforces policy per category. An integrated **NGIPS** inspects allowed traffic for exploits. **Advanced Malware Protection** checks file reputations, can detonate unknown files in a sandbox, and raises retrospective alerts if a file already let through is later found to be malicious. Cisco's NGFW product line is **Cisco Secure Firewall** (formerly Firepower), fed by threat intelligence from Cisco Talos. For the exam, memorize the list: stateful firewall + AVC + URL filtering + NGIPS + AMP.",
  },
  {
    kind: 'compare',
    title: 'IDS vs IPS',
    left: {
      heading: 'IDS — promiscuous mode',
      bullets: [
        'Receives a **copy** of traffic (SPAN port or TAP)',
        'Detects and **alerts**; can signal other devices',
        'Cannot stop the packet that triggered the alert',
        'No added latency; a failure does not drop traffic',
      ],
    },
    right: {
      heading: 'IPS — inline mode',
      tone: 'accent',
      bullets: [
        'Traffic flows **through** the sensor',
        'Can **drop** malicious packets in real time',
        'Adds a little latency to every packet',
        'A failure can interrupt traffic (fail-open or fail-closed)',
      ],
    },
    notes:
      "Both an **intrusion detection system** and an **intrusion prevention system** analyze traffic for attacks, usually with signatures. The difference is placement. An **IDS** runs in **promiscuous mode**: a switch SPAN port or a network TAP sends it a *copy* of the traffic. It can raise alerts, log, and even ask a firewall to block a source or send TCP resets, but the original packet has already reached its target — the IDS never sat in the path. An **IPS** runs **inline**: every packet must pass through it, so it can **drop** a malicious packet before it arrives. The trade-offs follow directly: the IPS adds processing delay and becomes a point of failure (designers choose fail-open to keep traffic flowing or fail-closed to keep security), while the IDS has no impact on traffic at all. Exam keywords: 'copy of traffic', 'passive', 'SPAN' → IDS; 'inline', 'real time', 'drop' → IPS.",
  },
  {
    kind: 'diagram',
    title: 'Inline vs promiscuous placement',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.5,
      nodes: [
        { id: 'i1', icon: 'internet', label: 'Internet', x: 1, y: 1.1 },
        { id: 'ips', icon: 'ips', label: 'IPS', sub: 'inline — can drop', x: 4.5, y: 1.1, tone: 'accent' },
        { id: 's1', icon: 'server', label: 'Servers', x: 8, y: 1.1 },
        { id: 'i2', icon: 'internet', label: 'Internet', x: 1, y: 3.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 4, y: 3.5 },
        { id: 's2', icon: 'server', label: 'Servers', x: 8, y: 3.5 },
        { id: 'ids', icon: 'ips', label: 'IDS', sub: 'copy only — alerts', x: 6, y: 2.4, tone: 'muted' },
      ],
      links: [
        { from: 'i1', to: 'ips', arrow: 'forward' },
        { from: 'ips', to: 's1', arrow: 'forward' },
        { from: 'i2', to: 'sw', arrow: 'forward' },
        { from: 'sw', to: 's2', arrow: 'forward' },
        { from: 'sw', to: 'ids', label: 'SPAN copy', style: 'dashed', arrow: 'forward' },
      ],
    },
    caption: 'The IPS is in the forwarding path; the IDS only ever sees a copy.',
    notes:
      "Picture the two placements. In the top path, every packet from the Internet to the servers must traverse the **IPS**, so the sensor can inspect it and decide to forward or drop it. In the bottom path, traffic flows directly from the Internet through switch SW1 to the servers; SW1's **SPAN** (port mirroring) session sends a *copy* of that traffic to the **IDS**. If the IDS spots an attack, the malicious packet has already been delivered — all the IDS can do is alert or trigger another device to react. That is why the exam describes an IDS as reactive and an IPS as preventive. Many modern sensors, including NGIPS software on Cisco Secure Firewall appliances, can run in either mode; the mode is a deployment choice, not a different box. When a question says a sensor 'must not introduce latency or become a point of failure', choose promiscuous (IDS) mode.",
  },
  {
    kind: 'bullets',
    title: 'Signatures and next-generation IPS',
    bullets: [
      '**Signature-based**: match known attack patterns; needs regular updates',
      'Blind to **zero-day** attacks that have no signature yet',
      '**Anomaly-based**: flag deviations from a learned baseline',
      '**False positive** = benign traffic flagged; **false negative** = attack missed',
      '**NGIPS** adds AVC, contextual awareness, reputation filtering, impact levels',
    ],
    notes:
      "Most intrusion systems rely on **signatures** — patterns that identify a specific exploit, worm or scan. Signatures are precise but only as good as the database, so the vendor must deliver frequent updates, and a brand-new **zero-day** attack with no signature slips through. **Anomaly** (behavior) detection instead learns what normal traffic looks like and flags deviations, catching novel attacks at the cost of more alerts. Two error terms matter: a **false positive** is legitimate traffic wrongly flagged (and, on an IPS, wrongly dropped); a **false negative** is a real attack that was not detected. A **next-generation IPS** reduces both by adding context: **Application Visibility and Control**, **contextual awareness** of the hosts on your network (their OS, applications and vulnerabilities), **reputation-based filtering** that blocks known-bad IP addresses and domains, and **event impact levels** that tell analysts which alerts actually threaten a vulnerable host — for example, a Windows exploit aimed at a Linux server rates low impact.",
  },
  {
    kind: 'bullets',
    title: 'Wireless access points',
    bullets: [
      'Bridge **802.11** wireless clients onto the wired Ethernet LAN',
      'Radio is a **shared, half-duplex** medium (CSMA/CA)',
      'Advertise one or more **SSIDs**, each mapped to a VLAN',
      'Usually powered by **PoE** from the access switch',
      'Two architectures: **autonomous** or **lightweight** (with a WLC)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'ASW1', sub: 'PoE switch', x: 1.5, y: 2 },
        { id: 'ap', icon: 'ap', label: 'AP1', x: 4.8, y: 2, tone: 'accent' },
        { id: 'l1', icon: 'laptop', label: 'Laptop', x: 8.3, y: 1 },
        { id: 't1', icon: 'tablet', label: 'Tablet', x: 8.3, y: 3 },
      ],
      links: [
        { from: 'sw', to: 'ap', label: 'Ethernet + PoE' },
        { from: 'ap', to: 'l1', style: 'wireless', label: '802.11' },
        { from: 'ap', to: 't1', style: 'wireless' },
      ],
    },
    notes:
      "An **access point** is the wireless equivalent of a switch port: it connects 802.11 clients to the wired network by **bridging** frames between the radio and its Ethernet uplink, which makes it a Layer 2 device. Unlike a switched Ethernet port, the radio channel is a **shared, half-duplex** medium — only one station can transmit on a channel at a time, and stations use **CSMA/CA** (collision avoidance) to take turns. An AP advertises one or more **SSIDs** (network names), and each SSID is normally mapped to a VLAN so that, for example, employees and guests land in different subnets. APs are usually mounted on ceilings far from power outlets, so they are almost always powered by **PoE** from the access switch. APs come in two broad architectures, compared on the next slide: **autonomous** APs that work alone, and **lightweight** APs that are managed by a wireless LAN controller. The wireless module later in the course goes much deeper.",
  },
  {
    kind: 'compare',
    title: 'Autonomous vs lightweight APs',
    left: {
      heading: 'Autonomous AP',
      bullets: [
        'Standalone: full configuration on **each** AP',
        'Managed one at a time (CLI or web GUI)',
        'Maps SSIDs to VLANs itself — connects to a **trunk** port',
        'Fine for a few APs; hard to scale consistently',
      ],
    },
    right: {
      heading: 'Lightweight AP',
      tone: 'accent',
      bullets: [
        'Managed by a **WLC**; near-zero-touch deployment',
        '**Split-MAC**: AP does real-time tasks, WLC does management',
        'Traffic tunneled in **CAPWAP** (UDP 5246 control, 5247 data)',
        'Local-mode AP connects to an **access** port',
      ],
    },
    notes:
      "An **autonomous AP** contains everything it needs: its own configuration, SSIDs, security settings and VLAN mappings. Because it drops each SSID's traffic straight onto the matching VLAN, its switch port is normally an 802.1Q **trunk**. That works for a handful of APs, but every change must be repeated on every AP, and features such as coordinated channel planning and seamless roaming are limited. A **lightweight AP** hands most of its brain to a **wireless LAN controller**. In the **split-MAC** architecture the AP keeps real-time functions — transmitting beacons, answering probes, acknowledging and encrypting frames — while the WLC handles management functions such as authentication, association, roaming, security policy and RF management. The AP and WLC talk through a **CAPWAP** tunnel: UDP 5246 carries DTLS-encrypted control messages and UDP 5247 carries client data. Because client traffic rides inside the tunnel, a local-mode lightweight AP only needs an **access** port.",
  },
  {
    kind: 'bullets',
    title: 'Wireless LAN controllers',
    bullets: [
      'Central brain for **lightweight APs**',
      'Pushes configuration, SSIDs and security policy to every AP',
      '**RRM**: automatic channel and transmit-power tuning',
      'Client authentication and seamless **roaming**',
      'Rogue AP detection and WLAN-wide monitoring',
      'Forms: appliance, switch-embedded, virtual/cloud, or on an AP',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC', x: 2, y: 1, tone: 'accent' },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', x: 5.5, y: 1 },
        { id: 'ap1', icon: 'ap', label: 'AP1', x: 2.5, y: 3.8 },
        { id: 'ap2', icon: 'ap', label: 'AP2', x: 5.5, y: 3.8 },
        { id: 'ap3', icon: 'ap', label: 'AP3', x: 8.5, y: 3.8 },
      ],
      links: [
        { from: 'wlc', to: 'dsw' },
        { from: 'dsw', to: 'ap1' },
        { from: 'dsw', to: 'ap2' },
        { from: 'dsw', to: 'ap3' },
        { from: 'ap1', to: 'wlc', label: 'CAPWAP', style: 'dashed', tone: 'accent' },
      ],
    },
    notes:
      "A **wireless LAN controller** turns dozens or thousands of lightweight APs into one coordinated system. Each AP discovers the WLC, joins it and downloads its configuration, so a new SSID or security setting is defined once and pushed everywhere. **Radio Resource Management** continuously adjusts channels and transmit power to minimize interference and fill coverage holes. The WLC also handles client **authentication** (often with a RADIUS server), keeps client state so users **roam** between APs without dropping calls, and detects **rogue** APs. The dashed line shows the CAPWAP tunnel from AP1 to the WLC; every AP builds one, and it crosses the routed network like any other IP traffic. Controllers come in several forms: dedicated appliances such as the Catalyst 9800 series, controllers embedded in Catalyst 9000 switches, virtual controllers that run on a hypervisor or in a public cloud (9800-CL), and an Embedded Wireless Controller that runs on an AP for small sites.",
  },
  {
    kind: 'table',
    title: 'Controllers you should recognize',
    columns: ['Controller', 'Manages', 'Runs', 'Key idea'],
    rows: [
      ['WLC (e.g. Catalyst 9800)', 'Lightweight APs', 'Appliance, switch, VM or cloud', 'CAPWAP tunnels, RF management'],
      ['Cisco **Catalyst Center** (formerly DNA Center)', 'Campus switches, routers, WLCs', 'On-premises physical or virtual appliance', 'Intent-based automation, assurance, REST APIs'],
      ['**Meraki** dashboard', 'Meraki APs, switches, security appliances', 'Cisco-hosted cloud', 'Devices phone home; management traffic only'],
      ['SD-WAN Manager (vManage)', 'SD-WAN edge routers', 'On-premises or cloud', 'Central WAN policy — see the WAN lesson'],
    ],
    notes:
      "The word **controller** means software that centrally manages many devices. A **WLC** controls lightweight APs. **Cisco Catalyst Center** — renamed from **Cisco DNA Center**, which is the name the v1.1 exam topics still use — is the enterprise campus controller: it discovers and provisions switches, routers and WLCs (plug-and-play, templates, software image management), runs **assurance** analytics on telemetry to spot problems, applies intent-based policy for SD-Access, and exposes northbound **REST APIs** for automation. It runs on premises as a physical or virtual appliance. The **Meraki dashboard** takes a cloud approach: Meraki devices connect out to the Meraki cloud, where administrators configure and monitor them through a web browser; only management and monitoring data goes to the cloud, while user traffic stays local. **SD-WAN Manager** plays the same role for SD-WAN routers. The automation module explains how these controllers use APIs; for now, match each controller to what it manages.",
  },
  {
    kind: 'bullets',
    title: 'Endpoints and IoT',
    bullets: [
      '**Endpoints** create and consume traffic: PCs, laptops, phones, tablets, printers',
      '**IP phones** use a voice VLAN and often offer a PC pass-through port',
      '**IoT**: cameras, sensors, badge readers, HVAC, lighting',
      'IoT devices are numerous, rarely patched and weakly secured',
      'Segment IoT into its own VLAN and restrict it with ACLs',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'ASW1', x: 5, y: 1 },
        { id: 'pc', icon: 'pc', label: 'PC', x: 1.5, y: 3.3 },
        { id: 'ph', icon: 'phone', label: 'IP phone', x: 3.3, y: 3.3 },
        { id: 'cam', icon: 'camera', label: 'Camera', x: 6.7, y: 3.3 },
        { id: 'iot', icon: 'iot', label: 'Sensor', x: 8.5, y: 3.3 },
      ],
      links: [
        { from: 'sw', to: 'pc' },
        { from: 'sw', to: 'ph' },
        { from: 'sw', to: 'cam' },
        { from: 'sw', to: 'iot' },
      ],
      groups: [
        { label: 'Users (VLAN 10)', x: 0.4, y: 2.4, w: 4.2, h: 1.9 },
        { label: 'IoT (VLAN 30)', x: 5.4, y: 2.4, w: 4.2, h: 1.9, tone: 'warn' },
      ],
    },
    notes:
      "**Endpoints** are the devices at the edge of the network that generate and receive traffic — desktops, laptops, smartphones, tablets, printers and IP phones. An **IP phone** usually connects to the access switch and offers a second Ethernet port so a PC can plug in behind it; the switch places voice traffic in a separate **voice VLAN** for quality of service. The fastest-growing endpoint category is the **Internet of Things**: IP cameras, environmental sensors, badge readers, building-management controllers and smart lighting. IoT devices arrive in large numbers, often run minimal operating systems that are rarely patched, and frequently ship with weak default credentials, so they are attractive targets. Good practice is to place them in their own VLAN (or VLANs), filter what they may reach with ACLs or firewall policy, and power them with PoE. The exam may ask you to identify endpoints versus infrastructure devices, or why IoT devices warrant separate segmentation.",
  },
  {
    kind: 'compare',
    title: 'Servers: client-server vs peer-to-peer',
    left: {
      heading: 'Client-server',
      tone: 'accent',
      bullets: [
        'Dedicated **servers** provide services to many clients',
        'Web, email, DNS, DHCP, file and database services',
        'Central control, backup and security',
        'Server is a bottleneck or single point of failure unless redundant',
      ],
    },
    right: {
      heading: 'Peer-to-peer',
      bullets: [
        'Every host is **both** a client and a server',
        'Examples: file-sharing apps, sharing a folder between two PCs',
        'No dedicated server to buy — or to fail',
        'Hard to secure, back up and manage at scale',
      ],
    },
    notes:
      "A **server** is any device that provides a service to others — web pages, email, name resolution (DNS), address assignment (DHCP), file shares, databases or authentication. In the **client-server** model, clients send requests and dedicated servers answer them. Centralization brings control: data lives in one place where it can be secured and backed up, and administrators manage one system instead of hundreds. The price is that the server must be sized for the load and made redundant, or it becomes a bottleneck and a single point of failure. In the **peer-to-peer** model, each host acts as both client and server — a small office sharing a folder from one PC to another, or file-sharing applications that fetch pieces of content from many peers at once. P2P needs no dedicated hardware, but security, backup and management are scattered across every device. Modern servers are often virtual machines or cloud instances rather than physical boxes; the role, not the hardware, defines a server.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: network components',
    body: 'A **router** separates broadcast domains, a **switch** separates collision domains, and only an **inline IPS** can drop an attack in real time.',
    bullets: [
      'Hub = 1 collision domain for all ports; switch = 1 per port (count the uplink!)',
      'A Layer 3 switch routes between VLANs; a Layer 2 switch cannot',
      'NGFW = stateful + AVC + URL filtering + NGIPS + AMP',
      'IDS = promiscuous copy, alerts only; IPS = inline, can drop',
      'Lightweight AP + WLC uses CAPWAP (UDP 5246/5247); autonomous APs stand alone',
      'Catalyst Center (ex-DNA Center) = on-prem controller; Meraki = cloud dashboard',
    ],
    notes:
      "Here are the component traps that cost candidates points. Domain counting: broadcast domains stop at router interfaces (and VLAN boundaries); collision domains are per switch port and per router interface, and a hub plus everything on it is just one — remember to count the switch-to-router uplink. Layer 3 switches are routers inside a switch: SVIs, `ip routing` and routed ports. For firewalls, stateful inspection alone does not make a device 'next-generation'; AVC, URL filtering, NGIPS and AMP do. IDS versus IPS is always about placement: a copy of traffic means detection only, inline means prevention (with added latency and a possible point of failure). For wireless, lightweight APs need a WLC and speak CAPWAP; autonomous APs are configured one by one. For controllers, remember the rename from DNA Center to Catalyst Center, and that Meraki is managed from the cloud while user traffic stays local.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Routers connect networks, act as gateways and sit at the WAN edge',
      'Data plane forwards; control plane builds tables; management plane manages',
      'L2 switches forward by MAC; L3 switches also route between VLANs',
      'Stateful firewalls track sessions; NGFWs add AVC, URL filtering, NGIPS, AMP',
      'IDS = promiscuous alerting; IPS = inline blocking',
      'APs bridge Wi-Fi to Ethernet; WLCs, Catalyst Center and Meraki manage at scale',
    ],
    notes:
      "Let us recap the cast. **Routers** move packets between networks, bound broadcast domains, serve as default gateways and connect sites to the WAN; like all devices they split work into data, control and management planes. **Layer 2 switches** forward frames by MAC address and give every port its own collision domain; **Layer 3 switches** add hardware routing between VLANs with SVIs. **Firewalls** enforce policy between zones using stateful inspection, and **next-generation firewalls** add application awareness, URL filtering, intrusion prevention and malware protection. **IPS** sensors sit inline and drop attacks; **IDS** sensors watch a copy and alert. **Access points** bridge wireless clients onto Ethernet, either autonomously or as lightweight APs managed by a **WLC** over CAPWAP, while **Catalyst Center** and the **Meraki dashboard** manage whole networks. **Endpoints**, including a flood of IoT devices, consume services that **servers** provide in client-server or peer-to-peer fashion. Next, you will see how these parts are arranged into architectures.",
  },
];
