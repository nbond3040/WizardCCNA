import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Cisco Wireless Architectures & AP Modes',
    subtitle: 'Autonomous, lightweight with a WLC, cloud-managed and FlexConnect, plus every AP mode',
    notes:
      "The previous lesson described the RF and 802.11 building blocks; this one shows how Cisco assembles them into an enterprise WLAN. You will compare the three architectures: **autonomous** APs that are configured one by one, **lightweight** APs controlled by a **wireless LAN controller** (WLC) through CAPWAP tunnels, and **cloud-managed** Meraki APs run from a web dashboard. You will see where a controller can live (a central appliance, a virtual machine, a switch, or one of the APs) and how a lightweight AP finds and joins its controller. Then you will learn every AP mode the exam lists (local, FlexConnect, monitor, sniffer, rogue detector, SE-Connect, bridge and Flex+Bridge) and exactly what a FlexConnect AP does when the WAN link to its controller fails. This lesson covers v1.1 exam topic 2.6, 'Compare Cisco Wireless Architectures and AP modes', and sits in domain 2 of the v2.0 blueprint, so it is tested on both exam versions.",
  },
  {
    kind: 'bullets',
    title: 'Three ways to build a WLAN',
    bullets: [
      '**Autonomous**: every AP is a self-contained, individually configured device',
      '**Lightweight + WLC**: APs handle RF, a controller manages them all (split-MAC)',
      '**Cloud-managed** (Meraki): APs are configured and monitored from a cloud dashboard',
      'The question in each case: where do **management**, **control** and **data** live?',
      'Small office: autonomous or cloud · campus: WLC · many branches: cloud or FlexConnect',
    ],
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Autonomous',
          layers: [
            { label: 'Management', sub: 'each AP, one at a time' },
            { label: 'Control', sub: 'each AP on its own' },
            { label: 'Data', sub: 'bridged to local VLANs' },
          ],
        },
        {
          title: 'Lightweight + WLC',
          layers: [
            { label: 'Management', sub: 'the WLC', tone: 'accent' },
            { label: 'Control', sub: 'split: AP real-time + WLC' },
            { label: 'Data', sub: 'CAPWAP to the WLC (local mode)' },
          ],
        },
        {
          title: 'Cloud-managed',
          layers: [
            { label: 'Management', sub: 'cloud dashboard' },
            { label: 'Control', sub: 'the AP, cloud-assisted' },
            { label: 'Data', sub: 'switched locally' },
          ],
        },
      ],
    },
    notes:
      "Every wireless architecture answers the same question: where do the **management plane** (configuration, monitoring, firmware), the **control plane** (RF decisions, authentication, roaming) and the **data plane** (client traffic) live? With **autonomous** APs, each AP does everything itself, so an administrator configures SSIDs, VLANs, security and radio settings on every AP separately. That is fine for two or three APs and painful for two hundred. With **lightweight** APs, a **wireless LAN controller** takes over management and most control functions for hundreds or thousands of APs, while each AP keeps only the time-critical radio work; this division is called **split-MAC**. In **cloud-managed** designs such as Cisco Meraki, the APs are configured and monitored from a web dashboard hosted on the Internet, but client traffic never passes through the cloud. The exam expects you to compare these architectures by how they scale, where configuration happens and how client traffic flows, which the next slides unpack one by one.",
  },
  {
    kind: 'diagram',
    title: 'Autonomous APs: SSIDs mapped to VLANs',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'VLANs 10, 20, 99', x: 5.0, y: 0.9 },
        { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'autonomous · 10.99.0.11', x: 2.2, y: 2.7 },
        { id: 'ap2', icon: 'ap', label: 'AP2', sub: 'autonomous · 10.99.0.12', x: 7.8, y: 2.7 },
        { id: 'c1', icon: 'laptop', label: 'Corp user', sub: 'VLAN 10', x: 1.2, y: 4.3 },
        { id: 'c2', icon: 'phone', label: 'Guest', sub: 'VLAN 20', x: 3.2, y: 4.3 },
        { id: 'c3', icon: 'laptop', label: 'Corp user', sub: 'VLAN 10', x: 6.8, y: 4.3 },
        { id: 'c4', icon: 'tablet', label: 'Guest', sub: 'VLAN 20', x: 8.8, y: 4.3 },
      ],
      links: [
        { from: 'sw', to: 'ap1', fromLabel: 'Gi1/0/1', label: 'trunk 10, 20, 99', tone: 'accent' },
        { from: 'sw', to: 'ap2', fromLabel: 'Gi1/0/2', label: 'trunk 10, 20, 99', tone: 'accent' },
        { from: 'ap1', to: 'c1', style: 'wireless' },
        { from: 'ap1', to: 'c2', style: 'wireless' },
        { from: 'ap2', to: 'c3', style: 'wireless' },
        { from: 'ap2', to: 'c4', style: 'wireless' },
      ],
    },
    caption: 'Each SSID is bridged to its own VLAN, so the AP connects to an 802.1Q trunk.',
    bullets: [
      'Full configuration lives **on each AP**: SSIDs, VLANs, security, radio',
      'Each SSID maps to a VLAN; the AP uplink is an **802.1Q trunk**',
      'Management IP per AP (here VLAN 99); no central RF coordination',
      'Roaming across APs needs the same VLANs everywhere',
    ],
    notes:
      "An **autonomous AP** is a complete, standalone device: it has its own IP address, its own configuration and its own management interface, reached through the CLI or a built-in web GUI. The administrator defines each SSID and maps it to a VLAN, for example SSID Corp to VLAN 10 and SSID Guest to VLAN 20. The AP then bridges frames between each SSID and its VLAN, so the switch port facing the AP must be an **802.1Q trunk** carrying every SSID VLAN plus the AP's own management VLAN (VLAN 99 here, often the native VLAN). Client traffic is switched locally onto the wired network, which is efficient. The downsides appear at scale. Every AP must be configured and upgraded separately, which invites inconsistency; there is no central view of RF, so channel and power planning is manual; and for users to roam between APs while keeping their IP addresses, the same VLANs have to be trunked to every AP across the campus. Autonomous APs still suit very small sites. On the exam, when you read 'autonomous AP with multiple SSIDs', think trunk port.",
  },
  {
    kind: 'diagram',
    title: 'Lightweight APs and the WLC: split-MAC',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'cl', icon: 'laptop', label: 'Client', x: 0.9, y: 1.4 },
        { id: 'ap', icon: 'ap', label: 'LAP', sub: 'local mode', x: 2.3, y: 3.3 },
        { id: 'asw', icon: 'switch', label: 'SW1', sub: 'access layer', x: 4.6, y: 3.3 },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', sub: 'distribution/core', x: 6.9, y: 3.3 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'mgmt 10.10.10.5', x: 8.9, y: 1.2, tone: 'accent' },
      ],
      links: [
        { from: 'cl', to: 'ap', style: 'wireless' },
        { from: 'ap', to: 'asw', toLabel: 'Gi1/0/10', label: 'access VLAN 100' },
        { from: 'asw', to: 'dsw', label: 'trunk' },
        { from: 'dsw', to: 'wlc', label: 'trunk' },
        { from: 'ap', to: 'wlc', style: 'dashed', tone: 'accent', arrow: 'both', label: 'CAPWAP tunnel' },
      ],
    },
    caption: 'The AP and WLC can be many hops apart: CAPWAP runs over any routed IP network.',
    bullets: [
      '**Lightweight AP (LAP)**: useless alone; it must join a **WLC**',
      '**Split-MAC**: real-time radio work on the AP, management on the WLC',
      '**CAPWAP** tunnels carry control messages and client data between them',
      'One WLC manages hundreds or thousands of APs from one place',
    ],
    notes:
      "A **lightweight AP** has no useful configuration of its own. When it boots, it gets an IP address, finds a **wireless LAN controller**, joins it and downloads its configuration. From then on the two share the work of an 802.11 AP, which is why Cisco calls the design **split-MAC**: the AP performs the functions that must happen in real time at the radio, and the WLC performs the management functions that benefit from a network-wide view. Between them runs **CAPWAP** (Control and Provisioning of Wireless Access Points, RFC 5415), which builds two tunnels: one for control messages and one that carries client data. Because CAPWAP rides inside ordinary UDP/IP packets, the AP and the WLC can sit in different subnets, even different buildings; here the AP sits on an access port in VLAN 100 while the WLC lives in the data center. The payoff is central control: one WLC can push the same WLANs to thousands of APs, tune channels and power automatically, coordinate roaming and detect rogue devices. The next slide lists exactly which functions live where, a favorite exam topic.",
  },
  {
    kind: 'table',
    title: 'Split-MAC: who does what',
    columns: ['Lightweight AP (real-time)', 'WLC (management)'],
    rows: [
      ['Transmits and receives 802.11 frames', '**Radio resource management**: channel (DCA) and power (TPC)'],
      ['Sends **beacons** and answers probe requests', 'Association and **roaming** management across APs'],
      ['Sends **ACKs** and retransmits lost frames', '**Client authentication** (acts as 802.1X authenticator)'],
      ['Queues and prioritizes frames (QoS at the radio)', 'Security policy: rogue detection, wireless IPS'],
      ['**Encrypts and decrypts** 802.11 frames', 'QoS policy, VLAN mapping, client load balancing'],
      ['Buffers frames for power-saving clients', 'AP configuration and software images'],
    ],
    notes:
      "Split-MAC divides the classic AP job along one line: **timing**. Anything that has to happen within microseconds of a frame arriving stays on the AP, because waiting for a controller across the network would be far too slow. That includes transmitting and receiving frames, sending beacons roughly every 102 ms, answering probe requests, sending ACKs and retransmitting frames that were not acknowledged, queuing frames by priority, buffering for sleeping clients, and encrypting and decrypting the over-the-air traffic. Everything that benefits from seeing the whole network moves to the WLC: **radio resource management** (RRM), which automatically assigns channels and transmit power across all APs and fills coverage holes; handling associations and **roaming** so a client can move between APs, even between controllers; acting as the **authenticator** for 802.1X; enforcing security and QoS policies; detecting rogue APs; and storing the AP configurations and software images. Exam questions often list six or eight functions and ask you to drag each one to the AP or the WLC. A simple test: if it happens once per frame, it is on the AP.",
  },
  {
    kind: 'diagram',
    title: 'CAPWAP: two tunnels, two UDP ports',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Control tunnel',
          layers: [
            { label: 'IP header', sub: 'AP ↔ WLC management IP' },
            { label: 'UDP 5246', tone: 'accent' },
            { label: 'DTLS', sub: 'always encrypted', tone: 'good' },
            { label: 'CAPWAP control message', sub: 'join, configuration, statistics, RRM', span: 2 },
          ],
        },
        {
          title: 'Data tunnel',
          layers: [
            { label: 'IP header', sub: 'AP ↔ WLC management IP' },
            { label: 'UDP 5247', tone: 'accent' },
            { label: 'DTLS', sub: 'optional, off by default', tone: 'muted' },
            { label: 'CAPWAP header' },
            { label: 'Client frame', sub: 'the client IP packet inside' },
          ],
        },
      ],
    },
    caption: 'Control = UDP 5246 (DTLS-encrypted). Data = UDP 5247 (encryption optional).',
    bullets: [
      '**CAPWAP**: IETF standard (RFC 5415) that replaced Cisco LWAPP',
      'Control tunnel **UDP 5246**, always protected by **DTLS**',
      'Data tunnel **UDP 5247**, DTLS encryption optional',
      'AP and WLC authenticate each other with **X.509 certificates**',
    ],
    notes:
      "CAPWAP builds two logical tunnels between each AP and its WLC, and the exam wants the port numbers exactly. The **control tunnel** uses **UDP 5246** and carries management traffic: join requests, configuration downloads, statistics, RRM measurements and keepalives. It is always encrypted and authenticated with **DTLS**, the datagram version of TLS, because it carries sensitive configuration such as WLAN keys. The **data tunnel** uses **UDP 5247** and encapsulates client traffic travelling between the AP and the WLC. Data DTLS encryption is **optional and off by default**. That matters, because in local mode the AP has already decrypted the over-the-air encryption before tunneling the frame, so on the wired path the client payload is protected only if you enable data encryption. When the AP and WLC first meet, they authenticate each other with **X.509 certificates** (APs ship with a manufacturer-installed certificate), which prevents rogue APs from joining your controller. A memory trick for the ports: control comes first, so it gets the lower number, 5246; data follows on 5247. CAPWAP replaced Cisco's older LWAPP protocol and is an open IETF standard.",
  },
  {
    kind: 'diagram',
    title: 'Local mode: every client frame visits the WLC',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.8,
      nodes: [
        { id: 'a', icon: 'laptop', label: 'Client A', x: 1.0, y: 3.8 },
        { id: 'b', icon: 'phone', label: 'Client B', x: 3.2, y: 3.8 },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'local mode', x: 2.1, y: 1.5 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'bridges to VLAN 10', x: 5.6, y: 1.5, tone: 'accent' },
        { id: 'sw', icon: 'l3switch', label: 'DSW1', x: 8.6, y: 1.5 },
        { id: 'srv', icon: 'server', label: 'Server', sub: 'VLAN 10', x: 8.6, y: 3.8 },
      ],
      links: [
        { from: 'a', to: 'ap', style: 'wireless' },
        { from: 'b', to: 'ap', style: 'wireless' },
        { from: 'ap', to: 'wlc', style: 'dashed', tone: 'accent', arrow: 'both', label: 'CAPWAP data' },
        { from: 'wlc', to: 'sw', label: '802.1Q trunk' },
        { from: 'sw', to: 'srv', label: 'VLAN 10' },
      ],
      annotations: [{ x: 5.6, y: 4.2, text: 'A to B: AP, WLC, back to AP (hairpin)', tone: 'accent' }],
    },
    caption: 'Logical path in local mode; the AP\'s own access switch is not drawn.',
    bullets: [
      'Local mode = **central switching**: all client traffic is tunneled to the WLC',
      'The WLC bridges each WLAN onto its VLAN through a trunk',
      'Two clients on the **same AP** still talk via the WLC',
    ],
    notes:
      "In **local mode**, the default for a lightweight AP, the AP does not switch client traffic itself. Every frame a client sends is decrypted by the AP, encapsulated in the CAPWAP data tunnel and carried to the WLC, which then bridges it onto the VLAN mapped to that WLAN through its 802.1Q trunk to the distribution switch. Traffic back to the client takes the reverse path. This **central switching** has real advantages: client VLANs need to exist only where the controller connects, not at every access switch, policies are enforced in one place, and a client can roam between APs anywhere on campus without changing IP address, because it always enters the network at the controller. The price is that all wireless traffic converges on the WLC, and traffic between two clients on the same AP makes a round trip: AP to WLC and back again, a **hairpin**. That is acceptable on a campus with fast links but wasteful across a slow WAN, which is exactly the problem FlexConnect solves later in this lesson. Exam questions like to ask for the path between two clients on the same local-mode AP: the answer always includes the WLC.",
  },
  {
    kind: 'steps',
    title: 'How a lightweight AP joins a WLC',
    steps: [
      { title: 'Get an IP address', text: 'DHCP (or a static address) in the AP management VLAN' },
      { title: 'Discover controllers', text: 'Local broadcast, stored WLC list, DHCP option 43, DNS name `CISCO-CAPWAP-CONTROLLER`' },
      { title: 'Choose and join a WLC', text: 'Configured primary/secondary/tertiary first, else the least-loaded; DTLS protects the join' },
      { title: 'Match the software image', text: 'If versions differ, download the WLC\'s AP image and reboot' },
      { title: 'Download the configuration', text: 'WLANs, radio settings and AP mode; the data tunnel comes up' },
      { title: 'Serve clients', text: 'Beacons start; CAPWAP keepalives watch the WLC' },
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'ap', label: 'LAP', icon: 'ap' },
        { id: 'dh', label: 'DHCP server', icon: 'server' },
        { id: 'wlc', label: 'WLC1', icon: 'wlc' },
      ],
      steps: [
        { from: 'ap', to: 'dh', label: 'DHCP discover / request' },
        { from: 'dh', to: 'ap', label: 'IP address + option 43', sub: 'WLC = 10.10.10.5' },
        { from: 'ap', to: 'wlc', label: 'CAPWAP discovery request', sub: 'UDP 5246' },
        { from: 'wlc', to: 'ap', label: 'Discovery response' },
        { from: 'ap', to: 'wlc', label: 'DTLS setup + join request' },
        { from: 'wlc', to: 'ap', label: 'Join response', tone: 'accent' },
        { note: 'Image check, configuration download, data tunnel on UDP 5247' },
      ],
    },
    notes:
      "A new lightweight AP is plug-and-play if the network helps it find a controller. It first obtains an IP address, normally through DHCP in its management VLAN. It then builds a list of candidate WLCs using several methods: a CAPWAP **broadcast** on its local subnet (works only if a WLC is in the same subnet), any controller addresses it **stored** from a previous join, **DHCP option 43**, which carries WLC IP addresses in the DHCP offer, and a **DNS** lookup of `CISCO-CAPWAP-CONTROLLER` in its domain. It sends CAPWAP discovery requests to each candidate and collects responses. It then joins the configured primary controller if one is set (then the secondary and tertiary), or otherwise the least-loaded responder, first building a DTLS session so the join is authenticated with certificates. If the AP's software does not match the controller's, it downloads the correct image and reboots, so every AP on a WLC runs the same code. Finally it downloads its configuration, brings up the data tunnel and starts beaconing. When the AP and WLC are in different subnets, option 43 or DNS is the usual fix, and the exam may ask you to pick those two methods.",
  },
  {
    kind: 'cli',
    title: 'Helping APs find the WLC: DHCP option 43',
    code: `R1(config)# ip dhcp excluded-address 10.10.100.1 10.10.100.10
R1(config)# ip dhcp pool AP-MGMT
R1(dhcp-config)# network 10.10.100.0 255.255.255.0
R1(dhcp-config)# default-router 10.10.100.1
R1(dhcp-config)# domain-name corp.local
R1(dhcp-config)# dns-server 10.10.10.53
R1(dhcp-config)# option 43 hex f104.0a0a.0a05
R1(dhcp-config)# end`,
    highlight: ['option 43 hex f104.0a0a.0a05'],
    caption: 'f1 = type, 04 = length (4 bytes per WLC), 0a0a0a05 = 10.10.10.5.',
    bullets: [
      'Option 43 is needed when APs and the WLC are in **different subnets**',
      'Alternative: DNS record `CISCO-CAPWAP-CONTROLLER.corp.local` → 10.10.10.5',
    ],
    notes:
      "Here an ISR router serves DHCP to the AP management subnet 10.10.100.0/24, and the AP will receive the WLC's address inside **DHCP option 43**. For Cisco lightweight APs, the value is a small type-length-value structure written in hex: `f1` is the type, `04` is the length, which is 4 bytes for each controller listed, and the value is the controller's IPv4 address in hex. The WLC management address 10.10.10.5 becomes 0a.0a.0a.05, so the complete string is `f104.0a0a.0a05`; with two controllers the length would be `08` followed by both addresses. The pool also hands out a domain name, which enables the second common method: create a DNS A record for `CISCO-CAPWAP-CONTROLLER.corp.local` pointing to 10.10.10.5, and the AP resolves it after getting its lease. Either method solves the classic problem where APs sit in a different subnet from the WLC, so a local broadcast never reaches it. Note that the excluded range reserves the first ten addresses for the gateway and static devices. Do not confuse option 43 with **option 150**, which gives Cisco IP phones a TFTP server address.",
  },
  {
    kind: 'table',
    title: 'Where the controller lives: deployment models',
    columns: ['Model', 'Where the WLC runs', 'Typical scale', 'Good fit'],
    rows: [
      ['**Centralized (unified)**', 'Dedicated appliance in the data center or core', 'Thousands of APs', 'Large campuses'],
      ['**Cloud-based WLC**', 'Virtual machine in a private or public cloud (e.g. Catalyst 9800-CL)', 'Hundreds to thousands of APs', 'Virtualized data centers'],
      ['**Embedded (distributed)**', 'Controller software inside an access-layer switch', 'Up to a few hundred APs', 'Small/medium sites, SD-Access fabrics'],
      ['**Mobility Express / EWC**', 'Controller function running on one of the APs', 'Around 100 APs', 'Small sites and branches'],
      ['**Cloud-managed (Meraki)**', 'No WLC: management from the Internet dashboard', 'Very large, many sites', 'Distributed organizations'],
    ],
    notes:
      "Lightweight APs always need controller functions, but the controller can sit in several places. In the **centralized** or **unified** model, a hardware WLC appliance such as a Catalyst 9800-80 sits in the data center or core and serves thousands of APs across a campus. A **cloud-based** WLC is the same controller software running as a virtual machine, for example the **Catalyst 9800-CL** on a hypervisor in your private cloud or in a public cloud provider. In the **embedded** or distributed model, the controller runs inside an access-layer switch such as a Catalyst 9300, placing wireless control close to the APs; it scales to a few hundred APs and is common in SD-Access fabrics. For small sites, Cisco lets one AP double as the controller for its peers: **Mobility Express** on older AireOS APs and the **Embedded Wireless Controller** (EWC) on Catalyst 9100 APs, around 100 APs at most. Finally, **cloud-managed** Meraki APs need no WLC at all. You do not need exact capacity numbers for the exam; you do need to match each model to where the controller runs and roughly how far it scales.",
  },
  {
    kind: 'diagram',
    title: 'Cloud-managed APs (Meraki)',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'cl', icon: 'laptop', label: 'Client', x: 0.9, y: 1.2 },
        { id: 'ap', icon: 'ap', label: 'MR AP', sub: 'cloud-managed', x: 1.9, y: 3.3 },
        { id: 'sw', icon: 'switch', label: 'MS switch', x: 4.2, y: 3.3 },
        { id: 'mx', icon: 'firewall', label: 'MX appliance', x: 6.5, y: 3.3 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 8.8, y: 3.3 },
        { id: 'dash', icon: 'cloud', label: 'Meraki dashboard', sub: 'config, monitoring, firmware', x: 8.8, y: 1.1, tone: 'accent' },
        { id: 'adm', icon: 'user', label: 'Admin', sub: 'web browser', x: 6.2, y: 1.1 },
      ],
      links: [
        { from: 'cl', to: 'ap', style: 'wireless' },
        { from: 'ap', to: 'sw', label: 'user data' },
        { from: 'sw', to: 'mx' },
        { from: 'mx', to: 'inet' },
        { from: 'inet', to: 'dash' },
        { from: 'adm', to: 'dash', style: 'dashed', label: 'HTTPS' },
        { from: 'ap', to: 'dash', style: 'dashed', tone: 'accent', label: 'management only' },
      ],
      annotations: [{ x: 4.2, y: 4.4, text: 'Client traffic stays on the local network', tone: 'good' }],
    },
    bullets: [
      'Devices **phone home** to the cloud; no on-premises controller',
      'Dashboard handles configuration, monitoring, RF tuning and firmware',
      '==User data never passes through the cloud==: it is switched locally',
      'Lose the cloud link: APs keep forwarding with the last configuration',
    ],
    notes:
      "Cisco **Meraki** is the cloud-managed architecture. Meraki APs (the MR family), switches (MS) and security appliances (MX) are plugged in, get an IP address and build an outbound, encrypted management tunnel to the **Meraki dashboard** in the cloud. Administrators never log in to an individual device; they open the dashboard in a browser and configure SSIDs, VLANs, security, firewall rules and firmware schedules for every site in the organization at once. The dashboard also performs automatic RF optimization and gives rich monitoring and client analytics. The critical detail for the exam is the data path: the tunnel to the cloud carries **management and monitoring traffic only**. Client frames are bridged by the AP straight onto the local LAN, where they reach local servers or leave through the local Internet connection, so the design adds no latency for users. If the cloud connection fails, the network keeps forwarding traffic using its last configuration; you simply cannot make changes until the connection returns. Cloud management suits organizations with many small sites and little local IT staff. Contrast this with a cloud-based WLC, which is a controller VM that still terminates CAPWAP tunnels.",
  },
  {
    kind: 'table',
    title: 'Comparing the three architectures',
    columns: ['Feature', 'Autonomous', 'Lightweight + WLC', 'Cloud-managed (Meraki)'],
    rows: [
      ['Configuration', 'Each AP individually (CLI/GUI)', 'Centrally on the WLC', 'Centrally in the web dashboard'],
      ['RF management', 'Manual, per AP', 'Automatic RRM on the WLC', 'Automatic, from the cloud'],
      ['Client data path', 'Bridged locally to VLANs', 'Tunneled to the WLC (local) or switched locally (FlexConnect)', 'Switched locally, never via the cloud'],
      ['Switch port to the AP', 'Trunk (one VLAN per SSID)', 'Access (local mode) or trunk (FlexConnect)', 'Trunk or access, depending on SSIDs'],
      ['If management is lost', 'No change', 'Local-mode APs drop clients and rejoin a WLC', 'APs keep forwarding; no changes possible'],
      ['Scale', 'A handful of APs', 'Thousands of APs per WLC', 'Very large, many sites'],
    ],
    notes:
      "This comparison collects the whole first half of the lesson in one place and is exactly the kind of table the exam draws from. Configuration is **per AP** with autonomous APs, **central** on the WLC for lightweight APs and **central in the dashboard** for Meraki. RF management follows the same pattern: manual for autonomous APs, automatic RRM for controller-based and cloud-managed designs. The data path is where candidates slip: autonomous and Meraki APs switch client traffic locally, while lightweight APs in local mode tunnel it all to the WLC (FlexConnect is the exception you will meet shortly). The data path in turn decides the switch port: an AP that bridges several SSIDs to several VLANs needs a **trunk**, whereas a local-mode AP needs only an **access** port in its management VLAN because everything else is inside CAPWAP. Failure behavior differs too. A local-mode AP that loses its controller stops serving clients and goes looking for another WLC, while a Meraki AP carries on with its last configuration. Keep these contrasts in mind when a question describes symptoms and asks which architecture is in use.",
  },
  {
    kind: 'table',
    title: 'AP modes reference',
    columns: ['Mode', 'Serves clients?', 'What it does'],
    rows: [
      ['**Local**', 'Yes', 'Default mode. Tunnels all client traffic to the WLC; scans other channels briefly when idle'],
      ['**FlexConnect**', 'Yes', 'Branch APs across a WAN: can switch traffic locally and keep working if the WLC is unreachable'],
      ['**Monitor**', 'No', 'Receive-only sensor: rogue detection, wireless IPS events, location tracking'],
      ['**Sniffer**', 'No', 'Captures 802.11 frames on one channel and forwards them to a PC running an analyzer such as Wireshark'],
      ['**Rogue detector**', 'No', 'Radios off; watches the wired network (ARP) to match MAC addresses of rogues heard over the air'],
      ['**SE-Connect**', 'No', 'Spectrum analysis on all channels, streamed to a spectrum tool to find non-Wi-Fi interference'],
      ['**Bridge (mesh)**', 'Yes, plus the bridge link', 'Point-to-point or point-to-multipoint bridge, or a root/mesh AP in a mesh network'],
      ['**Flex+Bridge**', 'Yes', 'A mesh AP that also uses FlexConnect local switching'],
    ],
    notes:
      "A lightweight AP can be switched between modes from the WLC, and each mode changes what its radios do. **Local** is the default: the AP serves clients on its channel, tunnels their traffic to the controller, and when idle briefly scans other channels to measure noise and interference and to spot rogues. **FlexConnect** is for remote sites and can switch client traffic locally. The next four modes turn the AP into a tool and serve **no clients**. **Monitor** mode listens on all channels as a dedicated sensor for rogue APs, intrusion signatures and client location. **Sniffer** mode captures frames on one chosen channel and forwards them to a remote PC running Wireshark or a similar analyzer. **Rogue detector** mode switches the radios off and listens on the wired side, correlating MAC addresses seen in ARP traffic with the rogue MACs other APs heard over the air: a device on both lists is a rogue plugged into your network. **SE-Connect** (Spectrum Expert Connect) turns the radios into a spectrum analyzer to find non-802.11 interference. **Bridge** mode builds wireless bridge and mesh links, and **Flex+Bridge** combines mesh with FlexConnect.",
  },
  {
    kind: 'bullets',
    title: 'The tool modes: monitor, sniffer, rogue detector, SE-Connect',
    bullets: [
      '**Monitor**: listens on all channels for rogues, wIPS and location',
      '**Sniffer**: one channel, every frame sent to a remote analyzer',
      '**Rogue detector**: wired-side MAC correlation; connect it to a **trunk**',
      '**SE-Connect**: raw spectrum data for microwaves, video senders, jammers',
      'None of them serve clients, so do not count them in coverage plans',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.8,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', x: 5.0, y: 1.0 },
        { id: 'rd', icon: 'ap', label: 'AP-RD', sub: 'rogue detector', x: 1.4, y: 1.0 },
        { id: 'rogue', icon: 'ap', label: 'Rogue AP', sub: 'plugged in by a user', x: 8.6, y: 1.0, tone: 'bad' },
        { id: 'mon', icon: 'ap', label: 'AP-MON', sub: 'monitor mode', x: 8.6, y: 3.7 },
        { id: 'sn', icon: 'ap', label: 'AP-SN', sub: 'sniffer, channel 36', x: 1.4, y: 3.7 },
        { id: 'pc', icon: 'laptop', label: 'Analyzer', sub: 'Wireshark', x: 5.0, y: 3.7 },
      ],
      links: [
        { from: 'rd', to: 'sw', label: 'trunk: sees ARP in all VLANs' },
        { from: 'sw', to: 'rogue', label: 'access port' },
        { from: 'mon', to: 'rogue', style: 'wireless', tone: 'bad', label: 'heard over the air' },
        { from: 'sn', to: 'pc', style: 'dashed', arrow: 'forward', tone: 'accent', label: 'captured frames' },
      ],
    },
    notes:
      "These four modes appear constantly in exam scenarios, so learn to spot the keyword in each. If the stem says 'dedicated sensor', 'wireless IPS', 'location tracking' or 'scan all channels without serving clients', the answer is **monitor** mode. If it says 'capture frames on a channel' and 'send them to Wireshark or OmniPeek on a remote PC', it is **sniffer** mode; the AP stays on the single channel you choose. If it asks how to find out whether a rogue AP heard over the air is actually **connected to your wired network**, it is **rogue detector** mode: the AP disables its radios and listens to ARP traffic on the wired side, which is why it should connect to a trunk that carries all VLANs, then correlates those MAC addresses with rogue MACs reported by other APs. If it mentions **non-Wi-Fi interference** such as a microwave oven, a wireless video camera or a jammer, it is **SE-Connect**, because only raw spectrum analysis can see energy that is not an 802.11 frame. In the diagram, AP-MON hears the rogue over the air while AP-RD sees its MAC on the wire, together proving the rogue is inside your network.",
  },
  {
    kind: 'diagram',
    title: 'FlexConnect: local switching at the branch',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      groups: [
        { label: 'Headquarters', x: 0.2, y: 0.2, w: 3.8, h: 1.7 },
        { label: 'Branch', x: 6.1, y: 0.2, w: 3.7, h: 4.6 },
      ],
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 1.0, y: 1.0, tone: 'accent' },
        { id: 'hqr', icon: 'router', label: 'HQ-R', x: 3.0, y: 1.0 },
        { id: 'wan', icon: 'cloud', label: 'WAN', x: 5.0, y: 1.0 },
        { id: 'brr', icon: 'router', label: 'BR-R', x: 7.0, y: 1.0 },
        { id: 'bsw', icon: 'switch', label: 'BR-SW', sub: 'VLANs 10, 20, 100', x: 8.9, y: 2.3 },
        { id: 'fap', icon: 'ap', label: 'AP-BR1', sub: 'FlexConnect', x: 8.9, y: 4.2 },
        { id: 'cl', icon: 'laptop', label: 'Client', sub: 'VLAN 10', x: 6.6, y: 4.2 },
      ],
      links: [
        { from: 'wlc', to: 'hqr' },
        { from: 'hqr', to: 'wan' },
        { from: 'wan', to: 'brr' },
        { from: 'brr', to: 'bsw' },
        { from: 'bsw', to: 'fap', label: 'trunk, native 100' },
        { from: 'fap', to: 'cl', style: 'wireless' },
        { from: 'fap', to: 'wlc', style: 'dashed', tone: 'accent', label: 'CAPWAP control' },
      ],
      annotations: [{ x: 3.0, y: 4.3, text: 'Locally switched data never crosses the WAN', tone: 'good' }],
    },
    bullets: [
      '**FlexConnect** (formerly H-REAP): for APs separated from the WLC by a WAN',
      'Control still runs over CAPWAP to the WLC',
      'Per WLAN: **local switching** to branch VLANs or central switching to HQ',
      'Locally switching several VLANs requires a **trunk** to the AP',
    ],
    notes:
      "Tunneling every frame to a controller at headquarters makes little sense for a branch office: a user printing to the printer across the room would send the job over the WAN and back. **FlexConnect** mode, once called H-REAP, fixes that. The AP still joins the WLC through CAPWAP and receives its configuration and RF management from it, but for each WLAN you choose whether client data is **centrally switched** (tunneled to the WLC, as in local mode) or **locally switched**, meaning the AP bridges the WLAN straight onto a VLAN at the branch switch. Locally switched traffic to branch servers, printers or the local Internet breakout never touches the WAN, saving bandwidth and latency. Because the AP now places different WLANs in different VLANs itself, its switch port must be an **802.1Q trunk**, with the native VLAN normally set to the AP management VLAN so that CAPWAP traffic travels untagged. FlexConnect APs can also authenticate clients locally and are usually grouped into FlexConnect groups that share settings. The real exam favorite, though, is what happens when the WAN goes down, which the next slide covers.",
  },
  {
    kind: 'table',
    title: 'FlexConnect: connected vs standalone mode',
    columns: ['Situation', 'Connected (WLC reachable)', 'Standalone (WAN to WLC down)'],
    rows: [
      ['Locally switched WLANs', 'Traffic bridged to branch VLANs', '==Keep working=='],
      ['Centrally switched WLANs', 'Traffic tunneled to the WLC', 'Go down: clients are disconnected'],
      ['New clients on a PSK or open WLAN', 'Can join', 'Can join: the AP authenticates locally'],
      ['New clients on an 802.1X WLAN', 'Authenticated via the WLC', 'Only with local authentication or a reachable backup RADIUS server'],
      ['Existing clients on local WLANs', 'Connected', 'Stay connected'],
      ['Configuration and RRM', 'From the WLC', 'Frozen until the WLC returns'],
    ],
    notes:
      "A FlexConnect AP operates in one of two states. In **connected mode** its CAPWAP tunnel to the WLC is up and everything works as configured. If the WAN fails and the tunnel drops, the AP enters **standalone mode** instead of dropping all of its clients and restarting discovery the way a local-mode AP does. In standalone mode, WLANs configured for **local switching keep working**: clients already connected stay connected, and new clients can still join if the AP can authenticate them itself, which is always true for open and PSK WLANs because the AP already holds the key. WLANs that require 802.1X keep accepting new users only if you have configured FlexConnect local authentication or a backup RADIUS server reachable from the branch. **Centrally switched** WLANs cannot work, because their traffic has nowhere to go, so those clients are disconnected. Configuration changes and RRM decisions wait until the controller is reachable again, at which point the AP returns to connected mode automatically. For the exam: FlexConnect plus local switching is the answer whenever a branch must keep wireless access to local resources during a WAN outage.",
  },
  {
    kind: 'diagram',
    title: 'Bridge and Flex+Bridge modes',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      groups: [
        { label: 'Building A', x: 0.2, y: 0.4, w: 4.0, h: 2.4 },
        { label: 'Building B', x: 5.8, y: 0.4, w: 4.0, h: 3.8 },
      ],
      nodes: [
        { id: 'sw1', icon: 'switch', label: 'SW-A', x: 1.1, y: 1.6 },
        { id: 'rap', icon: 'ap', label: 'RAP', sub: 'bridge mode', x: 3.3, y: 1.6 },
        { id: 'map', icon: 'ap', label: 'MAP', sub: 'Flex+Bridge', x: 6.7, y: 1.6, tone: 'accent' },
        { id: 'sw2', icon: 'switch', label: 'SW-B', sub: 'local VLANs', x: 8.9, y: 1.6 },
        { id: 'cl', icon: 'laptop', label: 'Client', x: 6.7, y: 3.5 },
      ],
      links: [
        { from: 'sw1', to: 'rap' },
        { from: 'rap', to: 'map', style: 'wireless', tone: 'accent', label: 'wireless backhaul' },
        { from: 'map', to: 'sw2', label: 'Ethernet bridging' },
        { from: 'map', to: 'cl', style: 'wireless' },
      ],
    },
    caption: 'Bridge mode builds the link; Flex+Bridge adds FlexConnect local switching on the mesh AP.',
    bullets: [
      '**Bridge**: point-to-point, point-to-multipoint or mesh (RAP/MAP roles)',
      'The **RAP** is wired; **MAPs** reach it over a wireless backhaul',
      '**Flex+Bridge**: mesh AP that switches client traffic locally, like FlexConnect',
    ],
    notes:
      "**Bridge** mode turns lightweight APs into wireless bridges. Two APs in bridge mode can link buildings in a point-to-point design, one hub AP can reach several remote buildings in point-to-multipoint, and many APs can form an indoor or outdoor **mesh**. In a mesh, the **root AP** (RAP) has the wired connection to the network and the **mesh APs** (MAPs) connect to it, or to each other, over a wireless backhaul, typically on 5 GHz. Mesh APs can still serve clients, and a MAP can bridge its Ethernet port so that a switch in a remote building joins the LAN over the air, as SW-B does in the diagram. Like local mode, a standard mesh AP sends client traffic back to the controller. **Flex+Bridge** mode combines mesh with FlexConnect: the MAP switches client traffic locally onto VLANs at its own site and can keep serving clients if the controller becomes unreachable, which suits remote mesh sites connected over a WAN. Exam questions usually describe the physical situation, such as buildings without cable between them, and ask for bridge mode, or add a local-switching requirement to point to Flex+Bridge.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: architectures and AP modes',
    body: 'Most errors come from mixing up ports, data paths and the four non-client modes.',
    bullets: [
      'CAPWAP control = **UDP 5246** (DTLS always) · data = **UDP 5247** (DTLS optional)',
      'Local mode (the default) tunnels **all** client traffic to the WLC, even AP-to-same-AP',
      'Beacons, ACKs and encryption: **AP** · RRM, roaming, authentication: **WLC**',
      'WAN down + keep local access = **FlexConnect with local switching**',
      'Rogue on the wire = rogue detector · non-Wi-Fi interference = **SE-Connect**',
      'Meraki: management via cloud, **data stays local**',
    ],
    notes:
      "Review these before any wireless exam session. Port numbers: control is 5246 and data 5247, both UDP. It is the control tunnel that is always DTLS-encrypted; data encryption must be enabled explicitly. Data path: in local mode everything goes to the WLC, including traffic between two clients on the same AP; FlexConnect local switching and autonomous and Meraki APs keep data local. Split-MAC: anything per frame (beacons, probe responses, ACKs, retransmissions, queuing, encryption) is on the AP, and anything network-wide (RRM, association and roaming, client authentication, policy, rogue management) is on the WLC. Failure behavior: a local-mode AP that loses its WLC drops its clients and searches for a controller, while a FlexConnect AP goes standalone and keeps its locally switched WLANs running. Tool modes: monitor for sensors and location, sniffer for packet captures to Wireshark, rogue detector for wired-side correlation, SE-Connect for spectrum analysis; none of them serve clients. Finally, do not confuse a cloud-based WLC, a controller VM that terminates CAPWAP, with cloud-managed Meraki, which has no controller at all.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Autonomous: configured per AP, SSIDs bridged to VLANs over a **trunk**',
      'Lightweight: **split-MAC**, AP real-time + WLC management over **CAPWAP**',
      'CAPWAP control UDP 5246 (DTLS) · data UDP 5247; APs find WLCs via option 43/DNS',
      'WLC locations: central appliance, cloud VM, switch-embedded, on an AP (EWC)',
      'Meraki: cloud dashboard for management, local data forwarding',
      'Modes: local, FlexConnect, monitor, sniffer, rogue detector, SE-Connect, bridge, Flex+Bridge',
    ],
    notes:
      "Cisco offers three wireless architectures. Autonomous APs are configured one at a time and bridge each SSID to a VLAN over a trunk. Lightweight APs split the MAC functions with a wireless LAN controller: the AP keeps real-time radio duties such as beacons, ACKs and encryption, and the WLC handles RRM, roaming, authentication and policy, with CAPWAP tunnels between them (control on UDP 5246, always DTLS-protected; data on UDP 5247, encryption optional). APs discover controllers by broadcast, stored addresses, DHCP option 43 or DNS, then join, update their image and download configuration. The controller can be a central appliance, a VM in a cloud, software on a switch or a function on one AP. Cloud-managed Meraki APs need no controller: management happens in the dashboard while data is forwarded locally. Finally, AP modes decide what an AP does: local and FlexConnect serve clients; monitor, sniffer, rogue detector and SE-Connect are tools; bridge and Flex+Bridge build wireless links and meshes. Next, you will connect these APs and controllers to the switched network: access versus trunk ports, WLC ports and interfaces, and LAG.",
  },
];
