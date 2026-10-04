import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Autonomous AP', back: 'A standalone AP with its own IP address and full configuration, managed one device at a time. Each SSID is bridged to a VLAN, so its switch port is an **802.1Q trunk**.' },
  { id: 'f2', front: 'Lightweight AP (LAP)', back: 'An AP with no useful standalone configuration. It discovers and joins a **WLC**, downloads its configuration and works in a **split-MAC** design over CAPWAP.' },
  { id: 'f3', front: 'Split-MAC architecture', back: 'The 802.11 work is divided: the **AP** performs real-time radio functions and the **WLC** performs management functions that need a network-wide view.' },
  { id: 'f4', front: 'Split-MAC: functions that stay on the AP', back: 'Sending and receiving frames, **beacons and probe responses**, **ACKs and retransmissions**, frame queuing and prioritization, and **encryption/decryption** of over-the-air traffic.' },
  { id: 'f5', front: 'Split-MAC: functions performed by the WLC', back: '**RRM** (channel and power), client **authentication**, **association and roaming** management, security and QoS policy, rogue detection, AP configuration and images.' },
  { id: 'f6', front: 'CAPWAP', back: 'Control And Provisioning of Wireless Access Points. An IETF standard (RFC 5415) based on Cisco LWAPP that tunnels control messages and client data between AP and WLC over UDP/IP.' },
  { id: 'f7', front: 'CAPWAP control port', back: '**UDP 5246.** The control tunnel is always protected with DTLS.' },
  { id: 'f8', front: 'CAPWAP data port', back: '**UDP 5247.** DTLS encryption of the data tunnel is optional and off by default.' },
  { id: 'f9', front: 'DTLS', back: 'Datagram Transport Layer Security: TLS adapted for UDP. It protects the CAPWAP control tunnel (always) and the data tunnel (if enabled).' },
  { id: 'f10', front: 'How a lightweight AP discovers a WLC', back: 'A broadcast on its own subnet, a stored list from a previous join, **DHCP option 43**, or a DNS lookup of **CISCO-CAPWAP-CONTROLLER**.' },
  { id: 'f11', front: 'DHCP option 43', back: 'Vendor-specific option that hands the WLC IP address(es) to Cisco lightweight APs. Needed when the WLC is in another subnet. Hex format: `f1`, a length byte, then the addresses.' },
  { id: 'f12', front: 'DNS name an AP queries to find a WLC', back: '**CISCO-CAPWAP-CONTROLLER** in the AP\'s domain, for example CISCO-CAPWAP-CONTROLLER.corp.local.' },
  { id: 'f13', front: 'Which WLC does an AP join?', back: 'The configured primary, then secondary, then tertiary controller; otherwise the least-loaded controller that answered discovery.' },
  { id: 'f14', front: 'Local mode', back: 'Default AP mode. Serves clients and tunnels **all** client traffic to the WLC (central switching). Scans other channels briefly when idle.' },
  { id: 'f15', front: 'Two clients on the same local-mode AP', back: 'Their traffic still goes AP, then WLC, then back to the AP through the CAPWAP data tunnel (a hairpin).' },
  { id: 'f16', front: 'FlexConnect mode', back: 'For remote sites across a WAN. Per WLAN, client traffic is either tunneled to the WLC or **switched locally** onto a branch VLAN. Formerly called H-REAP.' },
  { id: 'f17', front: 'FlexConnect standalone mode', back: 'Entered when the WLC is unreachable. Locally switched WLANs keep working, centrally switched WLANs go down, and new 802.1X clients need local authentication or a reachable RADIUS server.' },
  { id: 'f18', front: 'Monitor mode', back: 'Receive-only sensor that scans all channels for rogues, wIPS attack signatures and client location. Serves no clients.' },
  { id: 'f19', front: 'Sniffer mode', back: 'Captures 802.11 frames on one channel and forwards them to a PC running an analyzer such as Wireshark. Serves no clients.' },
  { id: 'f20', front: 'Rogue detector mode', back: 'Radios off. Listens to ARP on the wired network (connect it to a **trunk**) and matches MAC addresses against rogues heard over the air by other APs.' },
  { id: 'f21', front: 'SE-Connect mode', back: 'Spectrum Expert Connect: the radios act as a spectrum analyzer and stream data to a tool, to find non-802.11 interference. Serves no clients.' },
  { id: 'f22', front: 'Bridge mode', back: 'The AP builds wireless bridge links (point-to-point or point-to-multipoint) or joins a mesh: the root AP (RAP) is wired, mesh APs (MAPs) connect over a wireless backhaul.' },
  { id: 'f23', front: 'Flex+Bridge mode', back: 'A mesh (bridge) AP that also supports FlexConnect local switching.' },
  { id: 'f24', front: 'Switch port type for each AP kind', back: 'Lightweight AP in local mode: **access** port. Autonomous AP, or FlexConnect AP with several local VLANs: **trunk** port.' },
  { id: 'f25', front: 'Centralized (unified) WLC', back: 'A dedicated controller appliance (such as a Catalyst 9800 series model) in the data center or core, serving up to thousands of APs.' },
  { id: 'f26', front: 'Cloud-based WLC', back: 'WLC software running as a virtual machine in a private or public cloud (for example Catalyst 9800-CL). It is still a controller that terminates CAPWAP tunnels.' },
  { id: 'f27', front: 'Embedded (distributed) WLC', back: 'Controller software running on an access-layer Catalyst switch (for example a Catalyst 9300), serving the APs of one site.' },
  { id: 'f28', front: 'Mobility Express / EWC', back: 'Controller function built into one AP that manages the other APs (about 100 at most) at a small site. The Embedded Wireless Controller (EWC) runs on Catalyst 9100 APs.' },
  { id: 'f29', front: 'Cloud-managed APs (Cisco Meraki)', back: 'No WLC. APs are configured from the Meraki cloud dashboard; only **management traffic** goes to the cloud, client data is switched locally.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which AP mode is the default for a lightweight AP?',
    options: ['FlexConnect', 'Local', 'Monitor', 'Bridge'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**Local** mode is the default: the AP serves clients and tunnels all of their traffic to the WLC. FlexConnect, monitor and bridge modes must be selected on purpose.',
  },
  {
    id: 'q2',
    type: 'input',
    stem: 'Which UDP port number does the CAPWAP control tunnel use?',
    answers: ['5246', 'udp 5246', 'udp/5246'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'CAPWAP control messages use **UDP 5246** and are always protected by DTLS. The data tunnel uses UDP 5247.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two functions stay on the lightweight AP in a split-MAC design? (Choose two.)',
    options: [
      'Sending beacons and answering probe requests',
      'Assigning channels and transmit power across all APs',
      'Acting as the 802.1X authenticator for clients',
      'Encrypting and decrypting frames over the air',
      'Storing the configuration of every AP',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'Real-time work stays on the AP: **beacons and probe responses**, ACKs, queuing and **encryption/decryption**. Channel and power planning (RRM), client authentication and configuration storage are management functions that live on the WLC.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each AP mode to its purpose.',
    pairs: [
      { left: 'Monitor', right: 'Dedicated sensor for rogues, wIPS and location data' },
      { left: 'Sniffer', right: 'Sends captured frames from one channel to Wireshark' },
      { left: 'Rogue detector', right: 'Watches wired ARP to find rogues on the LAN' },
      { left: 'SE-Connect', right: 'Spectrum analysis of non-Wi-Fi interference' },
    ],
    difficulty: 2,
    explanation:
      'Monitor mode is the all-channel security sensor, sniffer mode feeds a packet analyzer, rogue detector mode correlates wired ARP with rogue MAC addresses, and SE-Connect turns the radios into a spectrum analyzer. None of them serves clients.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'An autonomous AP bridges SSID Corp to VLAN 10 and SSID Guest to VLAN 20. What type of switch port should it connect to?',
    options: ['Access port in VLAN 10', 'Access port in VLAN 20', '802.1Q trunk port', 'Routed port'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The AP puts frames for several VLANs onto one cable, so the port must be an **802.1Q trunk**. An access port carries a single VLAN, and a routed port carries none.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'In a Cisco Meraki cloud-managed WLAN, which traffic is sent to the cloud dashboard?',
    options: ['All client data and management traffic', 'Management and monitoring traffic only', 'Only DHCP and DNS traffic from clients', 'CAPWAP control and data tunnels from APs'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Only **management and monitoring** traffic goes to the cloud. Client data is switched locally onto the LAN, and Meraki does not use a WLC or CAPWAP tunnels to one.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'The WAN link between a FlexConnect branch AP and its WLC fails. What happens to a WLAN that uses local switching and WPA2-PSK?',
    options: ['It keeps working', 'It goes down until the WLC returns', 'It serves existing clients only and refuses new ones', 'It falls back to central switching'],
    answer: 0,
    difficulty: 2,
    explanation:
      'In standalone mode a locally switched PSK WLAN **keeps working**: connected clients stay connected and new clients can still join because the AP validates the passphrase itself. Centrally switched WLANs are the ones that go down.',
  },
];
