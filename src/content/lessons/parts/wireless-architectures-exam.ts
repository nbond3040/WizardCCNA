import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which UDP port does the CAPWAP control tunnel between a lightweight AP and its WLC use?',
    options: ['UDP 5247', 'UDP 5246', 'TCP 5246', 'UDP 1812'],
    answer: 1,
    difficulty: 1,
    explanation:
      'CAPWAP control messages use **UDP 5246** and are always protected with DTLS. UDP 5247 is the CAPWAP **data** tunnel, CAPWAP does not use TCP, and UDP 1812 is RADIUS authentication.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'In which wireless architecture must each AP be configured and managed individually?',
    options: [
      'Lightweight APs joined to a WLC',
      'Autonomous APs',
      'Cisco Meraki cloud-managed APs',
      'APs that use Mobility Express',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'Autonomous APs are standalone devices, each with its own configuration. With a WLC, with Meraki, or with an AP that acts as a Mobility Express controller, the settings are defined once and pushed to the APs.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. AP1 is an autonomous AP that bridges SSID Corp to VLAN 10 and SSID Guest to VLAN 20, and it is managed on VLAN 99. Which configuration is required on SW1 interface Gi1/0/1?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'VLANs 10, 20, 99', x: 1.6, y: 1.8 },
          { id: 'ap', icon: 'ap', label: 'AP1', sub: 'autonomous · mgmt VLAN 99', x: 5.0, y: 1.8, tone: 'accent' },
          { id: 'c1', icon: 'laptop', label: 'SSID Corp', sub: 'VLAN 10', x: 8.4, y: 0.9 },
          { id: 'c2', icon: 'phone', label: 'SSID Guest', sub: 'VLAN 20', x: 8.4, y: 2.9 },
        ],
        links: [
          { from: 'sw', to: 'ap', fromLabel: 'Gi1/0/1' },
          { from: 'ap', to: 'c1', style: 'wireless' },
          { from: 'ap', to: 'c2', style: 'wireless' },
        ],
      },
    },
    options: [
      'switchport mode access\nswitchport access vlan 99\nspanning-tree portfast\nno shutdown',
      'switchport mode access\nswitchport access vlan 10\nspanning-tree portfast\nno shutdown',
      'switchport mode trunk\nswitchport trunk native vlan 99\nswitchport trunk allowed vlan 10,20,99',
      'no switchport\nip address 10.99.0.1 255.255.255.0\nip helper-address 10.99.0.10',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'An autonomous AP bridges each SSID onto its own VLAN, so frames for VLANs 10, 20 and the management VLAN 99 must all reach it over one link: an **802.1Q trunk**, typically with the AP management VLAN as the native (untagged) VLAN. An access port carries only one VLAN, so either access option would strand at least one SSID, and a routed port carries no VLANs at all.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Which statement describes the split-MAC architecture used by Cisco lightweight APs?',
    options: [
      'The radio functions are divided between the 2.4 GHz and 5 GHz radios of each AP',
      'The AP handles management functions while the WLC handles real-time frame processing',
      'Client traffic is divided between a control tunnel and a data tunnel by traffic class',
      'The AP performs real-time 802.11 functions while the WLC performs management functions',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'Split-MAC divides the work by timing: time-critical radio functions (beacons, ACKs, queuing, encryption) stay on the **AP**, and functions that need a network-wide view (RRM, authentication, roaming, policy) move to the **WLC**. The second option reverses the roles, the first describes dual-band radios, and the third confuses split-MAC with the two CAPWAP tunnels, which separate control messages from client data rather than traffic classes.',
  },
  {
    id: 'e5',
    type: 'categorize',
    stem: 'Drag each function to the device that performs it in a split-MAC architecture.',
    categories: ['Lightweight AP', 'WLC'],
    items: [
      { text: 'Sending beacons and probe responses', category: 0 },
      { text: 'Acknowledging and retransmitting frames', category: 0 },
      { text: 'Encrypting and decrypting 802.11 frames', category: 0 },
      { text: 'Queuing frames by priority at the radio', category: 0 },
      { text: 'Assigning channels and transmit power (RRM)', category: 1 },
      { text: 'Acting as the 802.1X authenticator', category: 1 },
      { text: 'Managing client association and roaming between APs', category: 1 },
      { text: 'Storing AP configuration and software images', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'A useful test is timing. Anything that happens for every frame (beacons, probe responses, ACKs, retransmissions, queuing, encryption) is done by the **AP**. Anything that benefits from seeing the whole network (RRM, 802.1X authentication, roaming, configuration and image storage) is done by the **WLC**.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two statements about CAPWAP are true? (Choose two.)',
    options: [
      'The control tunnel is always encrypted with DTLS',
      'The data tunnel uses UDP port 5246',
      'The AP and the WLC must be in the same IP subnet',
      'The data tunnel carries client traffic and its DTLS encryption is optional',
      'CAPWAP is a Cisco-proprietary protocol that works only with Cisco controllers',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'The **control** tunnel (UDP 5246) is always DTLS-protected, while the **data** tunnel (UDP 5247) can optionally be encrypted. CAPWAP runs over routed IP, so the AP and WLC can be many hops apart, and CAPWAP is an IETF standard (RFC 5415), not a Cisco-only protocol. UDP 5246 is the control port, not the data port.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'What UDP port number does the CAPWAP data tunnel use?',
    answers: ['5247', 'udp 5247', 'udp/5247', 'udp5247'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'The CAPWAP **data** tunnel uses **UDP 5247**; the control tunnel uses UDP 5246. Remember that control comes first and has the lower number.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the steps a new lightweight AP follows to join a controller in the correct order.',
    items: [
      'The AP obtains an IP address, normally by DHCP',
      'The AP discovers candidate WLCs (broadcast, stored list, DHCP option 43 or DNS)',
      'The AP selects a WLC and builds a DTLS session to join it',
      'The AP downloads the WLC software image if its own version differs',
      'The AP downloads its configuration and starts serving clients',
    ],
    difficulty: 2,
    explanation:
      'The AP needs an IP address before it can send anything. It then discovers controllers, joins one over a DTLS-protected session, matches its software to the controller (downloading and rebooting if needed), and finally downloads its configuration and brings up the data tunnel and radios.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Lightweight APs in 10.10.100.0/24 obtain addresses from R1, but they cannot find the WLC at 10.10.10.5, which is in a different subnet. There is no DNS entry for the controller. Which command added to pool AP-MGMT lets the APs learn the controller address?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section dhcp
ip dhcp excluded-address 10.10.100.1 10.10.100.10
ip dhcp pool AP-MGMT
 network 10.10.100.0 255.255.255.0
 default-router 10.10.100.1
 dns-server 10.10.10.53`,
    },
    options: [
      'option 150 ip 10.10.10.5',
      'next-server 10.10.10.5',
      'option 43 hex f104.0a0a.0a05',
      'dns-server 10.10.10.5',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      '**DHCP option 43** carries the controller address to Cisco lightweight APs: `f1` is the type, `04` the length for one address, and `0a0a0a05` is 10.10.10.5. Option 150 gives TFTP server addresses to Cisco IP phones, `next-server` sets the boot server, and pointing `dns-server` at the WLC would break name resolution because the controller is not a DNS server.',
  },
  {
    id: 'e10',
    type: 'match',
    stem: 'Match each wireless deployment model to its description.',
    pairs: [
      { left: 'Centralized (unified)', right: 'Dedicated WLC appliance in the data center or core serving up to thousands of APs' },
      { left: 'Cloud-based WLC', right: 'WLC software running as a virtual machine in a private or public cloud' },
      { left: 'Embedded (distributed)', right: 'Controller software running on an access-layer Catalyst switch' },
      { left: 'Mobility Express / EWC', right: 'Controller function on one AP that manages its peers at a small site' },
      { left: 'Cloud-managed (Meraki)', right: 'No controller; APs are managed from a vendor-hosted dashboard' },
    ],
    difficulty: 2,
    explanation:
      'The models differ in where the controller function runs: an appliance (centralized), a VM (cloud-based WLC), a switch (embedded), an AP (Mobility Express or EWC), or nowhere at all because Meraki management happens in the vendor cloud.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements describe a Cisco Meraki cloud-managed wireless deployment? (Choose two.)',
    options: [
      'APs are configured through a web dashboard hosted in the cloud',
      'All client traffic is tunneled through the cloud for inspection',
      'Client traffic stays local and only management traffic reaches the cloud',
      'Each AP builds a CAPWAP tunnel to an on-premises wireless controller',
      'A WLC virtual machine must be deployed in the on-premises data center',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Meraki APs are managed from the **cloud dashboard**, and only **management and monitoring** traffic crosses the Internet; client frames stay on the local LAN. Meraki needs no WLC, whether physical or virtual, and does not tunnel user data to the cloud.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Client A and Client B are associated with the same WLAN on AP1, which operates in local mode. How does a frame from Client A reach Client B?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.4,
        nodes: [
          { id: 'a', icon: 'laptop', label: 'Client A', x: 0.9, y: 3.5 },
          { id: 'b', icon: 'phone', label: 'Client B', x: 3.1, y: 3.5 },
          { id: 'ap', icon: 'ap', label: 'AP1', sub: 'local mode', x: 2.0, y: 1.3 },
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'AP port: access VLAN 100', x: 5.0, y: 1.3 },
          { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'dynamic interface VLAN 10', x: 8.4, y: 1.3, tone: 'accent' },
        ],
        links: [
          { from: 'a', to: 'ap', style: 'wireless' },
          { from: 'b', to: 'ap', style: 'wireless' },
          { from: 'ap', to: 'sw', toLabel: 'Gi1/0/10' },
          { from: 'sw', to: 'wlc', label: 'trunk' },
        ],
        annotations: [{ x: 6.6, y: 3.5, text: 'Both clients: WLAN Corp, VLAN 10' }],
      },
    },
    options: [
      'AP1 forwards the frame directly to Client B without sending it onto the wired network',
      'AP1 tunnels the frame to WLC1 in the CAPWAP data tunnel, and WLC1 returns it through that tunnel',
      'AP1 sends the frame to SW1, which switches it back to AP1 in VLAN 10 without involving WLC1',
      'AP1 sends the frame to WLC1 in the CAPWAP control tunnel on UDP 5246, which relays it back',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'In local mode every client frame is encapsulated in the **CAPWAP data tunnel (UDP 5247)** and sent to the WLC, even when the destination is on the same AP; the WLC then returns it through the tunnel (a hairpin). The AP does not switch client frames itself (that is FlexConnect), the access switch only sees tunneled packets between AP and WLC and never learns the client MAC addresses, and the control tunnel carries management messages, not user data.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. AP-BR1 is a FlexConnect AP and is joined to its WLC. WLAN Corp is locally switched to VLAN 10, WLAN Guest is locally switched to VLAN 20, and the AP management VLAN is 100. Clients on both WLANs fail to get IP addresses. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config interface GigabitEthernet1/0/12
Building configuration...

Current configuration : 148 bytes
!
interface GigabitEthernet1/0/12
 description AP-BR1 (FlexConnect)
 switchport access vlan 100
 switchport mode access
 spanning-tree portfast
end`,
    },
    options: [
      'The AP must be changed to local mode so it can bridge client traffic onto VLANs 10 and 20',
      'PortFast must be removed so the AP can complete CAPWAP discovery',
      'The port is an access port in VLAN 100, so frames for VLANs 10 and 20 cannot reach the AP',
      'UDP 5247 is blocked in VLAN 100, which prevents the data tunnel from forming',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The AP joined the WLC, so CAPWAP works over VLAN 100, but local switching puts client frames in VLANs 10 and 20, which an **access port cannot carry**. The port must be an 802.1Q trunk with native VLAN 100 and VLANs 10 and 20 allowed. Local mode would tunnel everything and defeat the purpose of FlexConnect, PortFast does not affect discovery, and a blocked data port would also stop the join process.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. The WAN link between a branch FlexConnect AP and the WLC fails, and the AP enters standalone mode. The RADIUS server is only reachable through the WAN. Which statement is correct?',
    exhibit: {
      kind: 'table',
      columns: ['WLAN', 'Security', 'Switching', 'Local authentication'],
      rows: [
        ['Corp', 'WPA2-PSK', 'Local (VLAN 10)', 'Not needed'],
        ['Voice', 'WPA2-PSK', 'Local (VLAN 30)', 'Not needed'],
        ['Guest', 'Open + web authentication', 'Central', 'Not applicable'],
        ['Admin', 'WPA2-Enterprise (802.1X)', 'Local (VLAN 20)', 'Not configured'],
      ],
    },
    options: [
      'All four WLANs stop working because the AP cannot forward client traffic without a WLC',
      'Guest clients stay connected because the AP runs web authentication locally in standalone mode',
      'Corp and Voice stay up but accept no new clients because the AP cannot validate the PSK',
      'Corp and Voice keep working and accept new clients, Guest is disconnected, and new Admin logins fail',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Locally switched PSK WLANs (Corp, Voice) keep working and still accept new clients because the AP holds the key. The **centrally switched** Guest WLAN has no path to the WLC, so its clients are disconnected. Admin is locally switched, but 802.1X needs a RADIUS server, which is reachable only across the failed WAN and has no local authentication fallback, so new users cannot log in while existing users stay connected.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'An engineer must capture 802.11 frames on channel 36 and analyze them with Wireshark on a PC. Which AP mode accomplishes this?',
    options: ['Sniffer', 'Monitor', 'SE-Connect', 'Rogue detector'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Sniffer** mode captures frames on the chosen channel and forwards them to a remote analyzer such as Wireshark. Monitor mode scans all channels for security events and does not export captures, SE-Connect analyzes the RF spectrum, and rogue detector mode watches the wired network.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each AP mode to its description.',
    pairs: [
      { left: 'Local', right: 'Default mode; tunnels all client traffic to the WLC' },
      { left: 'FlexConnect', right: 'Branch mode; can switch client traffic locally if the WAN fails' },
      { left: 'Monitor', right: 'Dedicated sensor for rogue, wIPS and location data; serves no clients' },
      { left: 'Rogue detector', right: 'Radios off; correlates wired ARP with rogue MACs heard over the air' },
      { left: 'SE-Connect', right: 'Spectrum analysis of non-802.11 interference' },
      { left: 'Bridge', right: 'Wireless point-to-point or mesh link between buildings' },
    ],
    difficulty: 2,
    explanation:
      'Local and FlexConnect serve clients (central versus local switching). Monitor, rogue detector and SE-Connect are tool modes that serve no clients, and bridge mode builds wireless backhaul links such as a mesh or a building-to-building bridge.',
  },
  {
    id: 'e17',
    type: 'categorize',
    stem: 'Classify each AP mode by whether the AP serves wireless clients in that mode.',
    categories: ['Serves wireless clients', 'Does not serve clients'],
    items: [
      { text: 'Local', category: 0 },
      { text: 'FlexConnect', category: 0 },
      { text: 'Monitor', category: 1 },
      { text: 'Sniffer', category: 1 },
      { text: 'Rogue detector', category: 1 },
      { text: 'SE-Connect', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Only **local** and **FlexConnect** are client-serving modes here. Monitor, sniffer, rogue detector and SE-Connect turn the AP into a security or troubleshooting tool, so it does not advertise SSIDs to clients.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Wireless users at the branch print to a local printer. When the WAN to headquarters fails, all branch wireless connectivity, including printing, is lost. Which change provides continued local access during an outage?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.6,
        groups: [
          { label: 'Headquarters', x: 0.2, y: 0.3, w: 2.4, h: 2.2 },
          { label: 'Branch', x: 4.8, y: 0.3, w: 5.0, h: 4.0 },
        ],
        nodes: [
          { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 1.4, y: 1.5, tone: 'accent' },
          { id: 'wan', icon: 'cloud', label: 'WAN', x: 3.7, y: 1.5 },
          { id: 'brr', icon: 'router', label: 'BR-R', x: 6.0, y: 1.5 },
          { id: 'bsw', icon: 'switch', label: 'BR-SW', x: 8.4, y: 1.5 },
          { id: 'ap', icon: 'ap', label: 'AP-BR1', sub: 'local mode', x: 8.4, y: 3.5 },
          { id: 'prn', icon: 'printer', label: 'Printer', x: 6.0, y: 3.5 },
        ],
        links: [
          { from: 'wlc', to: 'wan' },
          { from: 'wan', to: 'brr', label: 'WAN link down', style: 'dashed', tone: 'bad' },
          { from: 'brr', to: 'bsw' },
          { from: 'bsw', to: 'ap', label: 'access port' },
          { from: 'bsw', to: 'prn' },
        ],
      },
    },
    options: [
      'Change AP-BR1 to bridge mode so that it becomes a root AP for a wireless bridge link',
      'Enable DTLS encryption on the CAPWAP data tunnel and keep the AP in local mode',
      'Change AP-BR1 to FlexConnect mode, enable local switching on the WLAN and use a trunk port',
      'Change AP-BR1 to monitor mode and keep it connected to an access port at the branch',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      '**FlexConnect with local switching** bridges the WLAN onto the branch VLAN at the AP, so users keep reaching the local printer when the WAN is down, and the AP then needs a trunk to carry the local VLANs. Bridge mode builds wireless links rather than keeping a WLAN alive, DTLS only encrypts the tunnel, and monitor mode serves no clients at all.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'What is the difference between a cloud-based WLC, such as a Catalyst 9800-CL, and a Cisco Meraki cloud-managed deployment?',
    options: [
      'The 9800-CL is a controller VM that terminates CAPWAP tunnels; Meraki has no controller and is managed from a dashboard',
      'The 9800-CL switches client traffic locally at each AP while Meraki tunnels all client traffic to the dashboard',
      'The 9800-CL manages autonomous APs without tunnels, while Meraki manages lightweight APs through a WLC',
      'There is no difference; both names describe the same cloud-managed architecture and dashboard',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A cloud-based WLC is ordinary controller software running in a virtual machine: the APs still form **CAPWAP** tunnels to it. Meraki has **no controller** at all; the APs build a management tunnel to the cloud dashboard and switch client data locally. The other options invert the data paths or confuse the AP types.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'A lightweight AP and its WLC are in different subnets. Which two methods can supply the WLC address to the AP? (Choose two.)',
    options: [
      'A CAPWAP broadcast on the AP subnet',
      'DHCP option 43',
      'An ARP request for the WLC',
      'A DNS record for CISCO-CAPWAP-CONTROLLER',
      'Proxy ARP on the access switch',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      '**DHCP option 43** and a **DNS** entry for CISCO-CAPWAP-CONTROLLER both work across subnets. A broadcast stays inside the AP subnet and never reaches a WLC in another one, an ARP request needs the WLC address first, and switches do not provide proxy ARP.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two benefits do lightweight APs with a WLC offer compared with autonomous APs? (Choose two.)',
    options: [
      'Central configuration of many APs from one place',
      'Support for WPA2 encryption on the radios',
      'Automatic channel and power adjustment through RRM',
      'The ability to map each SSID to its own VLAN',
      'Operation with no network connection to a controller',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'The WLC adds **central configuration** and **automatic radio resource management** across all APs. Autonomous APs also support WPA2 and SSID-to-VLAN mapping, and a lightweight AP is useless without its controller (FlexConnect only tolerates a temporary loss).',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. AP-MON hears an unknown SSID and reports the rogue AP. How does AP-RD help the security team confirm that this rogue is connected to the corporate wired network?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.4,
        nodes: [
          { id: 'rd', icon: 'ap', label: 'AP-RD', sub: 'rogue detector', x: 1.5, y: 1.2 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5.0, y: 1.2 },
          { id: 'rogue', icon: 'ap', label: 'Rogue AP', sub: 'on VLAN 20', x: 8.5, y: 1.2, tone: 'bad' },
          { id: 'mon', icon: 'ap', label: 'AP-MON', sub: 'monitor mode', x: 8.5, y: 3.5 },
        ],
        links: [
          { from: 'rd', to: 'sw', label: 'trunk' },
          { from: 'sw', to: 'rogue', label: 'access VLAN 20' },
          { from: 'mon', to: 'rogue', style: 'wireless', tone: 'bad', label: 'heard over the air' },
        ],
      },
    },
    options: [
      'It transmits probe requests to the rogue on channel 36 and logs the probe responses it receives',
      'It captures the rogue frames on the air and forwards them to Wireshark for decoding',
      'It measures RF interference from the rogue using spectrum analysis on the rogue channel',
      'It sees the rogue MAC address in wired ARP traffic and matches it with the MAC reported by AP-MON',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'A **rogue detector** AP turns its radios off and listens to ARP on the wired side (it needs a trunk to see all VLANs). If a MAC address on its list also appears in the rogue list built from the over-the-air observations of AP-MON, the rogue is plugged into your LAN. Probing, packet capture and spectrum analysis are functions of other modes or of nothing at all.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. AP1 provides the wireless controller function for AP2 and AP3, and no separate WLC exists. Which deployment model is shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.2,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5.0, y: 0.9 },
          { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'runs the controller function', x: 5.0, y: 3.3, tone: 'accent' },
          { id: 'ap2', icon: 'ap', label: 'AP2', x: 2.0, y: 3.3 },
          { id: 'ap3', icon: 'ap', label: 'AP3', x: 8.0, y: 3.3 },
        ],
        links: [
          { from: 'sw', to: 'ap1' },
          { from: 'sw', to: 'ap2' },
          { from: 'sw', to: 'ap3' },
          { from: 'ap1', to: 'ap2', style: 'dashed', tone: 'accent', label: 'CAPWAP' },
          { from: 'ap1', to: 'ap3', style: 'dashed', tone: 'accent', label: 'CAPWAP' },
        ],
      },
    },
    options: [
      'Mobility Express / Embedded Wireless Controller (EWC)',
      'Autonomous APs managed and configured one by one',
      'Cloud-based WLC running as a VM in a public cloud',
      'Embedded WLC running on a Catalyst 9300 switch stack',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'One AP runs the controller software and manages the others over CAPWAP, which is **Mobility Express** or the **EWC** on Catalyst 9100 APs, intended for small sites. Autonomous APs would each be configured separately with no CAPWAP tunnels, a cloud-based WLC is a VM, and an embedded WLC would run on the switch, not on an AP.',
  },
];
