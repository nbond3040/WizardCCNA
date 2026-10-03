import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Switch port type for a lightweight AP in local mode', back: 'An **access** port in the AP management VLAN. Client traffic is tunneled in CAPWAP, so the switch sees only the AP.' },
  { id: 'f2', front: 'Switch port type for a FlexConnect AP with local switching', back: 'An **802.1Q trunk**. Native VLAN = AP management VLAN; allow the locally switched VLANs.' },
  { id: 'f3', front: 'Switch port type for an autonomous AP', back: 'An **802.1Q trunk**: one VLAN per SSID plus the AP management VLAN (usually the native VLAN).' },
  { id: 'f4', front: 'Switch port type for a rogue detector AP', back: 'A **trunk** carrying all VLANs, so the AP can hear ARP traffic from every VLAN.' },
  { id: 'f5', front: 'MAC addresses an access switch learns on a local-mode AP port', back: 'Only the **AP\'s own MAC**; client frames are encapsulated in CAPWAP. A FlexConnect or autonomous AP port also shows client MACs in the local VLANs.' },
  { id: 'f6', front: 'WLC service port', back: 'Dedicated **out-of-band** management port for setup and recovery. Connects to an access port and uses its own subnet.' },
  { id: 'f7', front: 'WLC distribution system ports', back: 'The data ports. They carry CAPWAP, client and management traffic as tagged VLANs on an **802.1Q trunk** to the switch, and can be bundled into a LAG.' },
  { id: 'f8', front: 'WLC console port', back: 'Local serial CLI for first-time configuration and recovery. No IP connectivity is needed.' },
  { id: 'f9', front: 'WLC redundancy port', back: 'Connects two WLCs into an HA pair (SSO). The active controller keeps the standby synchronized.' },
  { id: 'f10', front: 'Port versus interface on a WLC', back: 'A **port** is a physical connector. An **interface** is logical (IP address and VLAN ID) and is bound to a port or to the LAG.' },
  { id: 'f11', front: 'WLC management interface', back: 'In-band management (SSH, HTTPS, SNMP), AAA traffic and CAPWAP termination for the APs. Tagged or untagged VLAN.' },
  { id: 'f12', front: 'AP-manager interface', back: 'Legacy interface that terminated CAPWAP tunnels from APs. In current releases the management interface does this job.' },
  { id: 'f13', front: 'WLC dynamic interface', back: 'User-created interface for a client VLAN: VLAN ID, IP address, gateway and DHCP server. It **maps a WLAN to a VLAN** (like an SVI).' },
  { id: 'f14', front: 'WLC virtual interface', back: 'One per WLC, with a dummy non-routable address such as **192.0.2.1**. Used for web-auth redirects, DHCP relay and mobility.' },
  { id: 'f15', front: 'WLC service-port interface', back: 'Logical interface bound to the service port, in a subnet separate from the management and dynamic interfaces.' },
  { id: 'f16', front: 'Why use the same virtual IP on all WLCs of a mobility group', back: 'A roaming client keeps the same web-authentication and DHCP identity and is not asked to authenticate again.' },
  { id: 'f17', front: 'WLC LAG', back: 'Link aggregation: bundles **all** distribution system ports into one logical link for load sharing and redundancy.' },
  { id: 'f18', front: 'Switch configuration for a WLC LAG', back: '`channel-group n mode on` (a static EtherChannel) on the member ports, with the port-channel configured as a trunk.' },
  { id: 'f19', front: 'LACP or PAgP with an AireOS WLC LAG', back: 'Not supported. If the switch uses active, passive, desirable or auto, the bundle does not form.' },
  { id: 'f20', front: 'When does a WLC LAG take effect?', back: 'LAG is a controller-wide setting (CONTROLLER > General). The change applies after a **reboot**.' },
  { id: 'f21', front: 'WLC LAG links split across two switches', back: 'Valid only if the switches act as one logical switch (stack, VSS or vPC). Independent switches cannot form one bundle.' },
  { id: 'f22', front: 'show etherchannel summary: Po1(SU) and (P)', back: '**SU** = Layer 2, in use. **P** = member bundled in the port-channel. A dash in the Protocol column = static bundle (mode on).' },
  { id: 'f23', front: 'IEEE 802.3af (PoE) power', back: '**15.4 W** at the switch port (12.95 W at the device). Classes 0 to 3.' },
  { id: 'f24', front: 'IEEE 802.3at (PoE+) power', back: '**30 W** at the switch port (25.5 W at the device). Class 4.' },
  { id: 'f25', front: 'IEEE 802.3bt power', back: 'Type 3: **60 W**; Type 4: **90 W** at the port, over four pairs. Cisco UPOE = 60 W, UPOE+ = 90 W.' },
  { id: 'f26', front: 'PoE budget', back: 'The total watts the switch power supplies can give all PoE ports. When it runs out, the next device gets `power-deny`.' },
  { id: 'f27', front: 'Command to see PoE usage on a switch', back: '`show power inline`: available, used and remaining watts, plus the status of every PoE port.' },
  { id: 'f28', front: 'How many 30 W class 4 APs fit a 370 W PoE budget?', back: '**12**: 370 / 30 = 12.3, rounded down.' },
  { id: 'f29', front: 'Native VLAN on an AP trunk', back: 'Normally the AP management VLAN, so CAPWAP and management traffic is untagged.' },
  { id: 'f30', front: 'UDP ports to permit between AP and WLC', back: '**UDP 5246** (CAPWAP control) and **UDP 5247** (CAPWAP data).' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which type of switch port connects a lightweight AP in local mode?',
    options: ['Trunk port', 'Access port', 'Routed port', 'Port-channel'],
    answer: 1,
    difficulty: 1,
    explanation:
      'In local mode all client traffic is tunneled in CAPWAP, so a plain **access** port in the AP management VLAN is enough. A trunk is needed only when the AP places client traffic into several VLANs itself (FlexConnect, autonomous).',
  },
  {
    id: 'q2',
    type: 'match',
    stem: 'Match each WLC physical port to its role.',
    pairs: [
      { left: 'Service port', right: 'Out-of-band management on its own subnet' },
      { left: 'Distribution system port', right: 'Trunk to the switch carrying CAPWAP, client and management traffic' },
      { left: 'Console port', right: 'Local serial access for setup and recovery' },
      { left: 'Redundancy port', right: 'Links the two controllers of an HA pair' },
    ],
    difficulty: 1,
    explanation:
      'The service port is the out-of-band management path, the distribution system ports carry all data, the console gives local CLI access and the redundancy port synchronizes an HA pair.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'What is the maximum power, in watts, that a switch port supplies under IEEE 802.3at (PoE+)? (Enter the number.)',
    answers: ['30', '30w', '30 w', '30 watts'],
    placeholder: 'watts',
    difficulty: 1,
    explanation:
      '802.3at (PoE+) supplies up to **30 W** at the port (25.5 W at the device). 802.3af supplies 15.4 W, and 802.3bt supplies 60 or 90 W.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two items are physical ports on a WLC? (Choose two.)',
    options: ['Service port', 'Management interface', 'Virtual interface', 'Redundancy port', 'Dynamic interface'],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'The **service port** and the **redundancy port** are physical connectors. Management, virtual and dynamic are logical interfaces that exist in software.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'LAG is enabled on a WLC. Which EtherChannel mode must the connected switch ports use?',
    options: ['active', 'desirable', 'on', 'passive'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The WLC LAG is a static bundle, so the switch needs `channel-group n mode on`. Active and passive are LACP, desirable and auto are PAgP, and the controller speaks neither protocol.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which WLC interface maps a WLAN to a client VLAN?',
    options: ['Management', 'Dynamic', 'Virtual', 'AP-manager'],
    answer: 1,
    difficulty: 2,
    explanation:
      'A **dynamic interface** holds the VLAN ID, IP address, gateway and DHCP server for a client VLAN, and WLANs are assigned to it. Management carries administration and CAPWAP, virtual supports web authentication and mobility, and AP-manager is a legacy interface.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which address is typically configured on the WLC virtual interface?',
    options: ['10.0.0.1', '192.0.2.1', '169.254.0.1', '224.0.0.1'],
    answer: 1,
    difficulty: 2,
    explanation:
      'The virtual interface uses a dummy, non-routable address such as **192.0.2.1** (documentation range). 10.0.0.1 is a routable private address, 169.254.0.1 is link-local and 224.0.0.1 is the all-hosts multicast group.',
  },
];
