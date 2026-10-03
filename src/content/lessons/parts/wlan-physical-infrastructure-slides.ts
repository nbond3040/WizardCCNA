import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'WLAN Physical Infrastructure',
    subtitle: 'Switch ports for APs, WLC ports and interfaces, LAG and PoE',
    notes:
      "The previous lesson explained which wireless architectures and AP modes exist; this one shows how the pieces are physically and logically connected to the wired network, which is exactly what exam topic 2.7 asks you to describe: AP, WLC, access and trunk ports, and LAG. The topic belongs to v1.1 and to domain 2 of the v2.0 blueprint, so it is tested on both versions. Questions in this area are practical. They show a switch port configuration and ask whether it suits a local-mode or FlexConnect AP, they list the ports and interfaces of a controller and ask which one carries management traffic, or they describe a bundle of controller links that will not come up. You will learn which port type each AP mode needs and why, the physical ports of a WLC and its logical interfaces, the rule that a WLC link aggregation needs EtherChannel mode **on**, and how Power over Ethernet and the switch power budget decide how many APs you can run.",
  },
  {
    kind: 'bullets',
    title: 'The wired path of a controller-based WLAN',
    bullets: [
      'APs plug into **access-layer switch ports** and draw power from **PoE**',
      'The WLC sits in the data center or core, linked by **trunk ports**',
      'Local-mode AP: **access port**; client data rides inside CAPWAP',
      'FlexConnect or autonomous AP: **trunk port** for local VLANs',
      'WLC ports can be bundled into one **LAG** (EtherChannel `on`)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'cl', icon: 'laptop', label: 'Client', x: 0.9, y: 3.6 },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'local mode', x: 3.0, y: 3.6 },
        { id: 'asw', icon: 'switch', label: 'SW1', sub: 'access · PoE', x: 5.0, y: 3.6 },
        { id: 'dsw', icon: 'l3switch', label: 'DSW1', x: 7.0, y: 3.6 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 8.8, y: 1.3, tone: 'accent' },
      ],
      links: [
        { from: 'cl', to: 'ap', style: 'wireless' },
        { from: 'ap', to: 'asw', toLabel: 'Gi1/0/10', label: 'access VLAN 100' },
        { from: 'asw', to: 'dsw', label: 'trunk' },
        { from: 'dsw', to: 'wlc', label: 'trunk / LAG', style: 'thick' },
        { from: 'ap', to: 'wlc', style: 'dashed', tone: 'accent', arrow: 'both', label: 'CAPWAP' },
      ],
    },
    notes:
      "Wireless networks are only as good as the wired network behind them, so start with the physical path. A client reaches an AP over the air; the AP is cabled to an access-layer switch port, and in a typical campus it draws power from that same cable through PoE. The WLC usually lives far away, in a data center or the core, connected to a distribution or core switch through one or more trunk links. Between AP and WLC runs the CAPWAP tunnel, which is just routed IP traffic, so the switches in between need no special wireless features. The key idea for this lesson is that the right port type depends on what the AP does with client traffic. In local mode the AP wraps every client frame in CAPWAP, so the switch sees only the AP's own IP traffic and an **access port** in the AP management VLAN is enough. If the AP places client traffic into VLANs itself, as FlexConnect and autonomous APs do, the port must be a **trunk**. The WLC side is always a trunk, because one controller serves many VLANs.",
  },
  {
    kind: 'cli',
    title: 'Local-mode AP: an access port',
    code: `SW1(config)# interface GigabitEthernet1/0/10
SW1(config-if)# description AP-LOBBY local mode
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 100
SW1(config-if)# spanning-tree portfast
SW1(config-if)# power inline auto
SW1(config-if)# end
SW1# show mac address-table interface GigabitEthernet1/0/10
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
 100    00a2.eeb4.1c20    DYNAMIC     Gi1/0/10
Total Mac Addresses for this criterion: 1`,
    highlight: ['switchport mode access', 'switchport access vlan 100', '00a2.eeb4.1c20'],
    caption: 'Only the AP\'s own MAC address appears: client MACs are hidden inside CAPWAP.',
    bullets: [
      'Access port in the AP management VLAN (100 here)',
      'Client frames travel inside CAPWAP data packets (UDP 5247)',
      'PortFast: the AP is an end device, not a switch',
      '`power inline auto` is the PoE default',
    ],
    notes:
      "Here is a typical access port for a lightweight AP in local mode. It is a plain access port in the AP management VLAN, VLAN 100 in this example, which is where the AP obtains its IP address by DHCP and from where it reaches the WLC. PortFast is appropriate because the AP is an end device. PoE is on by default with `power inline auto`, so the AP is powered and the link comes up. Now look at the MAC address table. The switch has learned exactly one MAC address on the port: the AP's. The laptops, phones and tablets associated with that AP never appear, because their frames are encapsulated in CAPWAP, in UDP packets addressed from the AP to the WLC, long before they reach the switch. That has two consequences worth remembering for the exam. First, no client VLANs have to exist or be trunked to the access switch, which simplifies the wiring closets. Second, a question that shows an access port in VLAN 100 for an AP and asks about the client VLANs is testing whether you remember that the client VLANs exist on the WLC side only.",
  },
  {
    kind: 'diagram',
    title: 'FlexConnect and autonomous APs need a trunk',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.8,
      nodes: [
        { id: 'rt', icon: 'router', label: 'BR-R', x: 8.6, y: 0.9 },
        { id: 'sw', icon: 'switch', label: 'BR-SW', sub: 'VLANs 10, 20, 100', x: 5.0, y: 0.9 },
        { id: 'ap', icon: 'ap', label: 'AP-BR1', sub: 'FlexConnect', x: 5.0, y: 2.7, tone: 'accent' },
        { id: 'c1', icon: 'laptop', label: 'Corp', sub: 'VLAN 10', x: 2.8, y: 4.2 },
        { id: 'c2', icon: 'phone', label: 'Voice', sub: 'VLAN 20', x: 7.2, y: 4.2 },
      ],
      links: [
        { from: 'rt', to: 'sw' },
        { from: 'sw', to: 'ap', fromLabel: 'Gi1/0/11', label: 'trunk · native 100', style: 'thick', tone: 'accent' },
        { from: 'ap', to: 'c1', style: 'wireless' },
        { from: 'ap', to: 'c2', style: 'wireless' },
      ],
    },
    caption: 'Centrally switched WLANs still ride CAPWAP in the native management VLAN.',
    bullets: [
      'FlexConnect **local switching** drops client frames straight into branch VLANs',
      'Autonomous APs bridge each SSID to its own VLAN',
      'Both need an **802.1Q trunk** to the switch',
      'Native VLAN = AP management VLAN (untagged)',
      'Allowed list = native VLAN plus the VLANs the AP serves',
    ],
    notes:
      "When the AP itself decides which VLAN a client belongs to, the switch has to receive frames for several VLANs on one cable, and that calls for an 802.1Q trunk. Two AP types behave this way. An autonomous AP maps each SSID to a VLAN and bridges frames between the radio and the wire. A FlexConnect AP does the same for every WLAN configured with local switching; WLANs that stay centrally switched are still tunneled to the WLC in CAPWAP. In the diagram the Corp SSID is switched into VLAN 10 and the Voice SSID into VLAN 20, so both VLANs travel tagged on the trunk. The AP's own management traffic and any CAPWAP-tunneled WLANs use the native VLAN, which is normally set to the AP management VLAN, 100 here, so they travel untagged. Allow only the VLANs the AP serves rather than every VLAN, which keeps unneeded broadcast traffic away from the AP. If you connect such an AP to an access port, it may still join the controller, because the management VLAN works, but clients on the local VLANs get no addresses. That exact scenario is a favorite exam troubleshooting question.",
  },
  {
    kind: 'cli',
    title: 'Trunk port for a FlexConnect AP',
    code: `SW1(config)# interface GigabitEthernet1/0/11
SW1(config-if)# description AP-BR1 FlexConnect
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 100
SW1(config-if)# switchport trunk allowed vlan 10,20,100
SW1(config-if)# spanning-tree portfast trunk
SW1(config-if)# end
SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi1/0/11    on               802.1q         trunking      100

Port        Vlans allowed on trunk
Gi1/0/11    10,20,100

Port        Vlans allowed and active in management domain
Gi1/0/11    10,20,100

Port        Vlans in spanning tree forwarding state and not pruned
Gi1/0/11    10,20,100`,
    highlight: ['switchport mode trunk', 'switchport trunk native vlan 100', 'switchport trunk allowed vlan 10,20,100'],
    caption: 'VLANs 10 and 20 are tagged; VLAN 100 (the native VLAN) is untagged.',
    bullets: [
      'Native VLAN 100 carries the AP\'s untagged CAPWAP traffic',
      'Prune the allowed list to the VLANs the AP really serves',
      '`spanning-tree portfast trunk` makes the trunk an edge port',
    ],
    notes:
      "This configuration shows the switch side of a FlexConnect AP connection. The port is a static trunk with native VLAN 100, the AP management VLAN, and an allowed list of 10, 20 and 100. The AP's CAPWAP traffic is untagged in VLAN 100, while the locally switched client VLANs are tagged. `spanning-tree portfast trunk` turns the trunk into an edge port so it forwards immediately instead of waiting through the spanning-tree states; that is safe because an AP is not a switch. On older platforms that support both ISL and 802.1Q you would first enter `switchport trunk encapsulation dot1q`; on Catalyst 9000 and 2960-series switches that command does not exist because only 802.1Q is supported. In the verification, `show interfaces trunk` has four sections: the mode, encapsulation, status and native VLAN of the port; the VLANs allowed on the trunk; the VLANs that are allowed and active; and the VLANs in the spanning-tree forwarding state. If a locally switched WLAN has clients that cannot get addresses, check that its VLAN appears in all four sections.",
  },
  {
    kind: 'table',
    title: 'Which switch port for which AP?',
    columns: ['AP type or mode', 'Switch port', 'Why', 'VLAN settings'],
    rows: [
      ['**Lightweight, local mode**', '**Access**', 'All client data is tunneled in CAPWAP to the WLC', 'Access VLAN = AP management VLAN'],
      ['**FlexConnect**, local switching', '**Trunk**', 'The AP places clients straight into several VLANs', 'Native = AP VLAN; allow the local VLANs'],
      ['**Autonomous**', '**Trunk**', 'One VLAN per SSID plus the AP management VLAN', 'Native = management VLAN'],
      ['**Rogue detector**', '**Trunk**', 'Must hear ARP traffic from every VLAN', 'Allow all VLANs'],
      ['Monitor, sniffer, SE-Connect', 'Access', 'Only the AP management address uses the wire', 'Access VLAN = AP management VLAN'],
      ['**WLC** distribution ports', '**Trunk**', 'Management and client VLANs share the link', 'Allow the WLC management and client VLANs'],
    ],
    caption: 'A FlexConnect AP can use an access port only if every WLAN is centrally switched or maps to the AP\'s own VLAN.',
    notes:
      "Memorize this table, because it answers a whole family of exam questions. A lightweight AP in local mode needs an access port: all client data is inside CAPWAP, so only the AP management VLAN matters. A FlexConnect AP with locally switched WLANs needs a trunk, with the native VLAN set to the AP management VLAN. An autonomous AP needs a trunk for the same reason, one VLAN per SSID. A rogue detector AP needs a trunk too, but for a different reason: it must see the ARP traffic of every VLAN to match MAC addresses, so you allow all VLANs. The tool modes that serve no clients, monitor, sniffer and SE-Connect, use only their management address on the wire, so an access port is enough. The WLC's distribution system ports are trunks because one controller carries its management VLAN and many client VLANs. Notice the caption: a FlexConnect AP can sit on an access port when every WLAN is centrally switched, but the exam's default assumption for FlexConnect with local switching is a trunk.",
  },
  {
    kind: 'diagram',
    title: 'WLC physical ports',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'AireOS appliance', x: 5.0, y: 2.5, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'distribution', x: 8.6, y: 1.2 },
        { id: 'mg', icon: 'switch', label: 'MGMT-SW', sub: 'out-of-band network', x: 8.6, y: 3.9 },
        { id: 'con', icon: 'laptop', label: 'Console PC', x: 1.4, y: 3.9 },
        { id: 'w2', icon: 'wlc', label: 'WLC2', sub: 'HA peer', x: 1.4, y: 1.2 },
      ],
      links: [
        { from: 'wlc', to: 'sw', fromLabel: 'DS 1', toLabel: 'Gi1/0/1', label: 'trunk', style: 'thick' },
        { from: 'wlc', to: 'sw', fromLabel: 'DS 2', toLabel: 'Gi1/0/2', style: 'thick' },
        { from: 'wlc', to: 'mg', fromLabel: 'SP', label: 'access', style: 'dashed' },
        { from: 'con', to: 'wlc', toLabel: 'Console', label: 'serial', style: 'dotted' },
        { from: 'w2', to: 'wlc', toLabel: 'RP', label: 'redundancy' },
      ],
    },
    bullets: [
      '**Service port** (SP): out-of-band management on its own subnet',
      '**Distribution system ports** (DS): data ports, an 802.1Q trunk to the switch',
      '**Console**: serial access for first-time setup and recovery',
      '**Redundancy port** (RP): links two WLCs in an HA pair',
    ],
    notes:
      "A controller appliance has a small set of physical connectors, and the exam names four. The **distribution system ports** are the workhorses: they carry everything between the controller and the network, including CAPWAP from the APs, client data and management, and they connect to trunk ports on a switch. Two or more of them can be bundled into a LAG, which is the next topic. The **service port** is a separate management port for out-of-band access. You use it for initial setup, for recovery, and to reach the controller when the production network is broken, and it connects to an access port on a management switch with its own subnet. The **console port** gives a local serial command line for first-time configuration and recovery, with no IP connectivity at all. The **redundancy port** connects two controllers into a high-availability pair, so the standby unit stays synchronized with the active one and can take over. Not every model offers every port, and virtual controllers have virtual NICs instead, but the roles are the same. Do not confuse these physical ports with the logical interfaces that come next.",
  },
  {
    kind: 'table',
    title: 'WLC ports at a glance',
    columns: ['Port', 'Purpose', 'Connects to', 'Key facts'],
    rows: [
      ['**Service port (SP)**', 'Out-of-band management, setup, recovery', 'Access port on a management switch', 'Untagged; own subnet; works even if the data network is down'],
      ['**Distribution system ports**', 'All data: CAPWAP from APs, client traffic, management', 'Trunk port(s) on the distribution or core switch', 'Also called data ports; can be bundled into a LAG'],
      ['**Console port**', 'Local CLI for first-time setup and recovery', 'PC with terminal software (serial or USB)', 'Needs physical access; no IP address required'],
      ['**Redundancy port (RP)**', 'Keeps an HA pair in sync', 'The peer WLC', 'The active WLC synchronizes its configuration to the standby'],
    ],
    caption: 'These are physical connectors. The logical interfaces on the next slides ride on top of them.',
    notes:
      "This table adds what each port connects to and what to remember about it. The distribution system ports go to trunk ports. They are sometimes called data ports, and because the controller does not run DTP, the switch side must be configured as a static trunk. The service port goes to an access port: it carries untagged traffic only, and its interface must live in a different subnet than the management and dynamic interfaces, which is a classic configuration check. Its great advantage is independence: it keeps working when the distribution links or the data VLANs fail. The console port requires physical access and a terminal program, and the redundancy port only matters when two controllers form an HA SSO pair, where the active controller pushes its configuration and state to the standby. A typical exam question lists the four ports with four descriptions and asks you to match them, or gives a scenario, such as 'an administrator needs to manage the WLC while the network is down', and expects the service port or the console as the answer.",
  },
  {
    kind: 'diagram',
    title: 'Ports versus interfaces',
    diagram: {
      type: 'flow',
      width: 10,
      height: 6.6,
      nodes: [
        { id: 'm', label: 'management', sub: 'VLAN 99 · 10.99.99.5', x: 2.2, y: 1.0 },
        { id: 'd', label: 'dynamic: corp, guest', sub: 'VLANs 10 and 20', x: 2.2, y: 2.6 },
        { id: 's', label: 'service-port', sub: 'own subnet', x: 2.2, y: 4.2 },
        { id: 'v', label: 'virtual', sub: '192.0.2.1', x: 2.2, y: 5.8 },
        { id: 'ds', label: 'Distribution system ports', sub: '802.1Q trunk or LAG', x: 7.8, y: 1.8, tone: 'accent' },
        { id: 'sp', label: 'Service port', sub: 'access link', x: 7.8, y: 4.2 },
        { id: 'no', label: 'No physical port', sub: 'internal address only', x: 7.8, y: 5.8, tone: 'muted' },
      ],
      edges: [
        { from: 'm', to: 'ds' },
        { from: 'd', to: 'ds' },
        { from: 's', to: 'sp' },
        { from: 'v', to: 'no', dashed: true },
      ],
    },
    caption: 'Interfaces (left) are logical; ports (right) are physical connectors.',
    bullets: [
      'A **port** is a physical connector on the chassis',
      'An **interface** is logical: IP address, VLAN ID, gateway, DHCP server',
      'Management and dynamic interfaces share the distribution ports as tagged VLANs',
      'The virtual interface exists only in software',
    ],
    notes:
      "The words port and interface are used loosely in everyday talk, but on a WLC they mean different things, and exam questions rely on the difference. A port is hardware. An interface is a logical construct inside the controller software that has an IP address, a VLAN identifier and, for client VLANs, a gateway and DHCP server. Interfaces are attached to ports, or to the LAG, by VLAN tagging: the management interface in VLAN 99 and the dynamic interfaces for VLANs 10 and 20 all leave the controller through the same distribution system ports, as 802.1Q-tagged frames on the trunk. The service-port interface is bound to the physical service port. The virtual interface is bound to nothing: its address is used internally and never appears on a wire. A useful way to think about it is that ports are roads and interfaces are addresses and lanes: many VLAN-tagged lanes share the same road. When a question asks which WLC interface maps a WLAN to a VLAN, the answer is a dynamic interface; when it asks for the physical connector for out-of-band management, the answer is the service port.",
  },
  {
    kind: 'table',
    title: 'WLC logical interfaces (AireOS)',
    columns: ['Interface', 'Type', 'Purpose', 'Notes'],
    rows: [
      ['**management**', 'Static, one', 'In-band management (SSH, HTTPS, SNMP), AAA traffic, CAPWAP with the APs', 'Tagged VLAN or untagged; its address identifies the WLC'],
      ['**ap-manager**', 'Static, legacy', 'Terminated the CAPWAP tunnels from APs in older releases', 'Today the management interface does this job'],
      ['**dynamic**', 'User-created, many', 'Maps a WLAN to a client VLAN: IP address, gateway, DHCP server', 'The WLC equivalent of an SVI per client VLAN'],
      ['**virtual**', 'Static, one', 'Web authentication redirect, DHCP relay identity, mobility', 'Non-routable address such as `192.0.2.1`'],
      ['**service-port**', 'Static, one', 'Out-of-band management through the service port', 'Own subnet, separate from every other interface'],
    ],
    caption: 'Dynamic interfaces are created under CONTROLLER > Interfaces, one per client VLAN.',
    notes:
      "AireOS controllers have five kinds of logical interface. The **management** interface is the controller's identity: administrators reach SSH and HTTPS there, it talks to RADIUS and TACACS+ servers, and it terminates the CAPWAP tunnels from the APs. Its VLAN can be tagged or untagged. The **AP-manager** interface used to be the separate address where APs built their tunnels; in current releases the management interface performs that role (the Ap Mgr column in the CLI shows Yes on management), and the AP-manager interface only matters when you read older material. **Dynamic** interfaces are the ones you create, one for each client VLAN. Each has an IP address, VLAN ID, gateway and DHCP server, and works like a switch virtual interface for that VLAN; a WLAN is mapped to a dynamic interface to place its clients into a VLAN. The **virtual** interface carries a non-routable address used for web authentication, DHCP relay and mobility. The **service-port** interface belongs to the service port. On the Catalyst 9800, which runs IOS XE, there are no dynamic interfaces: client VLANs are plain Layer 2 VLANs and a wireless management interface takes the management role.",
  },
  {
    kind: 'cli',
    title: 'Reading show interface summary',
    code: `(Cisco Controller) >show interface summary

Number of Interfaces.......................... 5

Interface Name                   Port Vlan Id  IP Address      Type    Ap Mgr Guest
-------------------------------- ---- -------- --------------- ------- ------ -----
corp                             LAG  10       10.10.10.5      Dynamic No     No
guest                            LAG  20       10.20.20.5      Dynamic No     No
management                       LAG  99       10.99.99.5      Static  Yes    No
service-port                     N/A  N/A      192.168.200.5   Static  No     No
virtual                          N/A  N/A      192.0.2.1       Static  No     No`,
    highlight: ['LAG', 'Dynamic', '192.0.2.1'],
    caption: 'AireOS CLI: the Ap Mgr column is Yes on the management interface.',
    bullets: [
      'Port **LAG**: the distribution ports are bundled',
      '**Dynamic** rows are the WLAN-to-VLAN interfaces',
      '**Ap Mgr = Yes** on management: it terminates CAPWAP',
      'virtual and service-port show N/A for port and VLAN',
    ],
    notes:
      "On an AireOS controller, `show interface summary` lists every logical interface in one table. Read it column by column. **Interface Name** is the label you see in the WLAN configuration. **Port** shows the physical port the interface is bound to, or LAG when the distribution ports are bundled, as here; without a LAG you would see a port number. **Vlan Id** is the 802.1Q tag, or untagged for the native VLAN; N/A means the interface has no VLAN binding. **IP Address** is the controller's own address in that subnet. **Type** distinguishes the Static interfaces, which always exist and cannot be deleted, from the Dynamic interfaces you create. **Ap Mgr** says whether the interface terminates CAPWAP tunnels from APs, and on current software that is the management interface. In this output, corp and guest are the dynamic interfaces that map WLANs to VLANs 10 and 20, management is in VLAN 99, the service-port sits in its own subnet, and virtual has the dummy address 192.0.2.1. Exam exhibits often show a table like this and ask which interface a WLAN should use or which one handles a given function.",
  },
  {
    kind: 'diagram',
    title: 'The virtual interface at work: web authentication',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'g', label: 'Guest laptop', icon: 'laptop' },
        { id: 'w', label: 'WLC (virtual 192.0.2.1)', icon: 'wlc' },
        { id: 's', label: 'Web server', icon: 'server' },
      ],
      steps: [
        { from: 'g', to: 'w', label: 'HTTP request to a website', sub: 'guest has an address but is not yet authenticated' },
        { from: 'w', to: 'g', label: 'Redirect to https://192.0.2.1/login.html', sub: 'the virtual interface address', tone: 'accent' },
        { from: 'g', to: 'w', label: 'Login page and credentials', sub: 'HTTPS to the virtual IP' },
        { from: 'w', to: 'g', label: 'Access granted' },
        { from: 'g', to: 's', label: 'Normal traffic is now forwarded', sub: 'through the guest dynamic interface' },
        { note: 'Use the same virtual IP on every WLC in a mobility group', tone: 'good' },
      ],
    },
    bullets: [
      'One virtual interface per WLC',
      'Dummy, non-routable address from the documentation range `192.0.2.0/24`',
      'Used for web-auth redirects, DHCP relay identity and mobility',
      'Keep it identical across a mobility group',
    ],
    notes:
      "The virtual interface is the strangest of the five, because it exists only in software and its address is never meant to be routed. Cisco recommends a dummy address from the documentation range 192.0.2.0/24, typically 192.0.2.1, and the same value should be configured on every controller in a mobility group. It has three jobs. For **web authentication**, when a guest opens a browser, the WLC intercepts the request and redirects it to a login page served at the virtual address, as in the sequence. For **DHCP relay**, when the controller proxies DHCP for wireless clients, it uses the virtual address in its dealings with them, so clients may see it as the DHCP server. For **mobility**, using one virtual IP across the group means that a client roaming between controllers keeps seeing the same web-authentication and DHCP identity, so it is not forced to authenticate again. Because the address is non-routable, nothing outside the controller should ever reach it; if a guest portal fails with a certificate warning, the host name tied to the virtual address is a common reason.",
  },
  {
    kind: 'table',
    title: 'What must match: WLC and switch',
    columns: ['Item', 'On the WLC', 'On the switch'],
    rows: [
      ['**VLAN ID**', 'Interface VLAN Id, for example 10', 'VLAN exists and is **allowed** on the trunk'],
      ['**Tagging**', 'Management VLAN tagged, or untagged', 'Native VLAN matches when the interface is untagged'],
      ['**Gateway**', 'Interface gateway 10.10.10.1', 'SVI or router interface with that address'],
      ['**DHCP**', 'Primary DHCP server on the interface', 'Scope for the subnet and a route back to the interface address'],
      ['**Link**', 'Distribution port or LAG enabled', '`switchport mode trunk`; `channel-group n mode on` for a LAG'],
    ],
    caption: 'Most WLC connectivity faults are a mismatch in one of these five rows.',
    notes:
      "Most WLC connectivity faults on the exam come down to a disagreement between the controller and the switch. This table lists the five places to look. First, the **VLAN ID** on the interface must exist on the switch and be in the trunk's allowed list; the symptom of a missing VLAN is that clients associate but never receive an address. Second, **tagging**: if the management interface is untagged, its traffic travels in the trunk's native VLAN, so the native VLAN on the switch must be the management VLAN; if it is tagged, the VLAN must simply be allowed. A native VLAN mismatch makes the controller unreachable. Third, the **gateway** on the interface must be an address that really exists on the switch or router for that VLAN. Fourth, **DHCP**: the server named on the interface needs a scope for that subnet, and it must have a route back to the controller interface address, because the WLC relays client requests from there. Fifth, the **link** itself must be a trunk, or a bundle configured with mode on when LAG is enabled. Check these in order and most problems reveal themselves.",
  },
  {
    kind: 'diagram',
    title: 'LAG: bundling the distribution system ports',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      groups: [{ label: 'Port-channel 1', x: 3.4, y: 0.9, w: 3.2, h: 2.5, tone: 'accent' }],
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'LAG enabled', x: 1.8, y: 2.1, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'mode on', x: 8.2, y: 2.1 },
      ],
      links: [
        { from: 'wlc', to: 'sw', fromLabel: 'Port 1', toLabel: 'Gi1/0/1', label: 'LAG = EtherChannel on', style: 'thick' },
        { from: 'wlc', to: 'sw', fromLabel: 'Port 2', toLabel: 'Gi1/0/2', style: 'thick' },
      ],
      annotations: [{ x: 5.0, y: 3.9, text: 'No LACP, no PAgP: static bundle only', tone: 'warn' }],
    },
    bullets: [
      'LAG bundles **all** distribution system ports into one logical link',
      'Benefits: load sharing, link redundancy, one logical connection',
      'Switch side: static EtherChannel, `channel-group n mode on`',
      'AireOS WLCs support neither **LACP** nor **PAgP**',
      'Enabling LAG on the WLC needs a reboot',
    ],
    notes:
      "Link aggregation on a WLC combines the distribution system ports into a single logical link: a port-channel on the switch and a LAG on the controller. The benefits are the usual ones for EtherChannel. Traffic is shared across the member links, the failure of one link does not interrupt service because the others keep carrying the traffic, and the controller presents one logical connection to the network, which simplifies the interface-to-port mapping because every interface rides on the LAG. Two rules define the exam answer. First, the AireOS LAG is all-or-nothing: when you enable it, all distribution system ports join the bundle; you cannot bundle only some of them. It is a controller-wide setting, found as LAG Mode on next reboot under CONTROLLER > General, and it takes effect after a reboot. Second, the bundle is static. The controller does not speak LACP or PAgP, so the switch ports must be configured with `channel-group` **mode on**. Both links must end on the same switch, or on a stack or multichassis pair that behaves as one switch.",
  },
  {
    kind: 'cli',
    title: 'Switch configuration for the WLC LAG',
    code: `SW1(config)# interface range GigabitEthernet1/0/1 - 2
SW1(config-if-range)# description WLC1 LAG member
SW1(config-if-range)# channel-group 1 mode on
Creating a port-channel interface Port-channel 1
SW1(config-if-range)# exit
SW1(config)# interface Port-channel1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20,99
SW1(config-if)# end
SW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         -        Gi1/0/1(P)   Gi1/0/2(P)`,
    highlight: ['channel-group 1 mode on', 'Po1(SU)', 'Gi1/0/1(P)', 'Gi1/0/2(P)'],
    caption: 'Protocol "-" means a static bundle: no LACP or PAgP negotiation.',
    notes:
      "This is the switch half of the LAG. The two member ports are put in channel group 1 with `mode on`, which creates Port-channel 1 and bundles the ports without any negotiation protocol. The trunk settings are then applied to the port-channel interface, and IOS copies them to the members, which keeps the configuration consistent: members of a bundle must match in speed, duplex and switchport mode, or the bundle will not form. The verification command is `show etherchannel summary`. Read the Group row: `Po1(SU)` means the port-channel is Layer 2 and in use, `Gi1/0/1(P)` and `Gi1/0/2(P)` mean both members are bundled in the port-channel, and the Protocol column shows a dash because a static bundle uses no protocol. Compare that with a negotiated channel, where the column would read LACP or PAgP. Remember the order of operations in real life: enable LAG on the controller, save the configuration and reboot, and have the switch ports ready, because a WLC with LAG enabled and a switch without a matching bundle cannot talk reliably.",
  },
  {
    kind: 'table',
    title: 'LAG mismatches and what they cause',
    columns: ['Switch configuration', 'Result with a WLC LAG'],
    rows: [
      ['`channel-group 1 mode on`', '**Bundle forms**: the only supported choice'],
      ['`mode active` or `passive` (LACP)', 'No LACP partner: the ports stay stand-alone and the port-channel stays down'],
      ['`mode desirable` or `auto` (PAgP)', 'No PAgP partner: the bundle does not form'],
      ['No channel-group at all', 'Unreliable connectivity; the switch may log MAC flapping'],
      ['Links split across two unstacked switches', 'Not a valid bundle: use a stack, VSS or vPC pair'],
    ],
    caption: 'WLC LAG = EtherChannel mode on. Never LACP, never PAgP.',
    notes:
      "A failed LAG usually comes from a mismatch between the two ends, and the exam likes to show a show etherchannel summary exhibit or a configuration and ask for the fix. The only supported switch configuration for an AireOS WLC LAG is `channel-group n mode on`. If the switch is set to LACP, with active or passive, it waits for LACP messages that the controller never sends; the ports stay stand-alone and the port-channel stays down. If the switch uses PAgP, with desirable or auto, the same thing happens, because the controller sends no PAgP packets. If the switch has no channel group at all, the controller spreads its traffic across the links using one MAC address, which the switch sees on two different ports, so you get unstable connectivity and MAC flapping messages. And if the two WLC links go to two separate switches that are not stacked or otherwise combined into one logical switch, there is no valid bundle at all. The answer to nearly every one of these questions is the same sentence: configure the switch EtherChannel with mode on.",
  },
  {
    kind: 'table',
    title: 'PoE standards and power levels',
    columns: ['Standard', 'Common name', 'At the switch port', 'At the device', 'Notes'],
    rows: [
      ['IEEE 802.3af', 'PoE (Type 1)', '**15.4 W**', '12.95 W', 'Classes 0 to 3; two pairs'],
      ['IEEE 802.3at', 'PoE+ (Type 2)', '**30 W**', '25.5 W', 'Class 4; needed by many modern APs'],
      ['IEEE 802.3bt Type 3', '4PPoE', '**60 W**', '51 W', 'Classes 5 and 6; four pairs'],
      ['IEEE 802.3bt Type 4', '4PPoE', '**90 W**', '71.3 W', 'Classes 7 and 8; four pairs'],
      ['Cisco UPOE / UPOE+', 'Cisco extensions', '60 W / 90 W', '—', 'Predate 802.3bt; Cisco switches'],
    ],
    caption: 'The switch (PSE) supplies the larger number; the AP (PD) receives less after cable loss.',
    notes:
      "Almost every enterprise AP is powered over the Ethernet cable, using Power over Ethernet. The switch, called the power sourcing equipment or PSE, detects a powered device, classifies how much power it needs, and then supplies it; modern Cisco APs and switches also refine the request with CDP or LLDP. The standards differ in power. IEEE 802.3af, plain PoE, delivers up to 15.4 W at the switch port, and about 12.95 W is left for the device after cable loss. IEEE 802.3at, PoE+, raises that to 30 W at the port and 25.5 W at the device, and many dual-radio and Wi-Fi 6 APs need it to run all of their radios. IEEE 802.3bt adds four-pair power: Type 3 gives 60 W and Type 4 gives 90 W at the port. Cisco's own UPOE (60 W) and UPOE+ (90 W) predate 802.3bt. If the power available is below what the AP needs, the AP may boot in a reduced mode with radios or ports disabled, or not boot at all. A midspan injector or a local power adapter solves the problem when the switch cannot supply enough.",
  },
  {
    kind: 'cli',
    title: 'The PoE budget: show power inline',
    code: `SW1# show power inline

Available:370.0(w)  Used:360.0(w)  Remaining:10.0(w)

Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/2   auto   on         30.0    C9120AXI-B          4     30.0
...
Gi1/0/12  auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/13  auto   power-deny 0.0     n/a                 n/a   30.0`,
    highlight: ['Remaining:10.0(w)', 'power-deny'],
    caption: 'Output trimmed: twelve class 4 APs use 12 x 30 W = 360 W of the 370 W budget.',
    bullets: [
      'The budget is the total watts the power supplies give all PoE ports',
      'IOS reserves power by class (class 4 = 30 W) unless the AP negotiates less',
      '370 W / 30 W = 12.3, so **12 APs**; at 15.4 W each, 24',
      'Budget exhausted: the next device gets `power-deny`',
      '`power inline auto` is the default; `never` turns PoE off',
    ],
    notes:
      "A switch cannot give unlimited power: its power supplies set a **PoE budget**, the total watts available to all PoE ports together. `show power inline` summarizes it on the first line. Here the budget is 370 W with 360 W in use and 10 W remaining. Each AP is class 4, so IOS reserves 30 W for each of twelve APs. The thirteenth AP asks for 30 W, only 10 W remain, so the port shows `power-deny` and the AP stays dark. Capacity planning is simple division, but round down: 370 W divided by 30 W is 12.3, so twelve APs; if each AP only needed a 15.4 W class 3 allocation, the same switch would power 24 (370 divided by 15.4 is 24.03). The default `power inline auto` means detect and power any standard powered device; `power inline never` disables PoE on a port, and `power inline static` reserves power in advance. IOS allocates by class unless the device negotiates a lower value through CDP or LLDP. For the exam, remember what the output means: available, used and remaining watts, and a deny when the budget is exhausted.",
  },
  {
    kind: 'steps',
    title: 'Troubleshooting: the AP does not join',
    steps: [
      { title: 'Power', text: 'Is the port supplying PoE? `show power inline`; is the budget exhausted?' },
      { title: 'Link and VLAN', text: 'Port up; access VLAN or trunk native VLAN matches the AP VLAN' },
      { title: 'IP address', text: 'The AP needs a DHCP lease in its management subnet' },
      { title: 'Discovery', text: 'DHCP option 43 or the DNS name CISCO-CAPWAP-CONTROLLER when the WLC is remote' },
      { title: 'Reachability', text: 'Routers and firewalls permit UDP 5246 and 5247 to the WLC' },
      { title: 'Controller side', text: 'Management VLAN reaches the WLC trunk; AP capacity and country settings allow the join' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Power', sub: 'PoE', shape: 'pill' },
        { id: 'b', label: 'Link + VLAN', sub: 'access or trunk' },
        { id: 'c', label: 'IP address', sub: 'DHCP' },
        { id: 'd', label: 'Discover + join', sub: 'UDP 5246 / 5247', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "When an AP does not show up on the controller, walk the path from the bottom of the stack to the top. Start with **power**: is the port supplying PoE, or is the budget exhausted? Next the **link and VLAN**: the interface should be up, and the port type must match the AP mode, an access port in the AP management VLAN for local mode, or a trunk whose native VLAN is the AP management VLAN for FlexConnect. Then the **IP address**: the AP needs a DHCP lease in its management subnet. Next is **discovery**: if the WLC is in another subnet, the AP needs DHCP option 43 or a DNS entry for CISCO-CAPWAP-CONTROLLER, since a local broadcast will not find it. Then **reachability**: routers and firewalls must permit UDP 5246 and UDP 5247 between the AP and the controller. Finally, the **controller side**: the management interface must be reachable over the WLC trunk, and the controller must accept the AP, for example with the right country settings and enough AP capacity. Working in this order avoids chasing a CAPWAP problem that is really a dead port.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: ports, interfaces, LAG and PoE',
    body: 'Most mistakes swap access and trunk, ports and interfaces, or LACP and mode on.',
    bullets: [
      'Local-mode AP: **access** port; FlexConnect and autonomous AP: **trunk**',
      'Service port = out-of-band, access link; distribution ports = trunk',
      'Dynamic interface maps a WLAN to a VLAN; the virtual interface is **not routable**',
      'AP-manager is legacy; the **management** interface now terminates CAPWAP',
      'WLC LAG bundles **all** distribution ports; the switch uses **mode on**',
      'PoE: af 15.4 W, at 30 W, bt 60/90 W; the budget caps the AP count',
      'Many client MACs on an AP port means FlexConnect or autonomous, not local mode',
    ],
    notes:
      "Here are the traps in one place. Access versus trunk: local mode takes an access port, FlexConnect with local switching and autonomous APs take a trunk, and the WLC distribution ports are always trunks. Ports versus interfaces: ports are physical connectors, interfaces are logical, and the virtual interface has no port at all and is never a real, routable address. Dynamic interfaces are the WLAN-to-VLAN mapping, and the management interface does the AP-manager job in modern releases. The service port is out-of-band, connected to an access port, with its own subnet. LAG: the exam answer is always EtherChannel mode on, never LACP or PAgP, and it bundles all distribution ports at once. PoE: remember 15.4 W, 30 W, and 60 or 90 W, and that the switch budget, not the number of ports, limits the number of APs. One more subtle point: in local mode the access switch learns only the AP's MAC address, while with FlexConnect local switching it learns client MAC addresses in the local VLANs. If a question exhibit shows a MAC table with many addresses on an AP port, the AP is in FlexConnect or autonomous mode.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Local mode: access port · FlexConnect and autonomous: trunk',
      'WLC ports: service, distribution system, console, redundancy',
      'Interfaces: management, dynamic, virtual, service-port (AP-manager is legacy)',
      'Dynamic interfaces map WLANs to VLANs; virtual IP such as `192.0.2.1`',
      'LAG = all distribution ports bundled = EtherChannel `on`',
      'PoE: plan the budget in watts, not just the port count',
    ],
    notes:
      "Let us recap the physical side of a WLAN. Choose the switch port by AP mode: access for local mode, because client traffic is hidden inside CAPWAP; trunk for FlexConnect with local switching, autonomous APs and rogue detector APs, with the native VLAN set to the AP management VLAN. A WLC has four physical ports: distribution system ports (data, trunk), the service port (out-of-band, access), the console and the redundancy port (HA pair). On top of them sit the logical interfaces: management, the legacy AP-manager, dynamic interfaces that map WLANs to VLANs, the virtual interface with a dummy address such as 192.0.2.1, and the service-port interface. A LAG bundles all distribution ports and needs a static EtherChannel with mode on on the switch. Finally, PoE powers the APs: 15.4 W for 802.3af, 30 W for 802.3at, up to 60 or 90 W for 802.3bt, and the switch's total budget limits how many APs you can run. Next, you will configure an actual WLAN in the controller's GUI, which is where these interfaces and VLANs come together.",
  },
];
