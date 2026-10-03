import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which type of switch port should a lightweight AP in local mode connect to?',
    options: [
      'An 802.1Q trunk port with all VLANs allowed',
      'A routed port with an IP address',
      'An access port in the AP management VLAN',
      'A port-channel configured with mode on',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'In local mode all client traffic is tunneled in CAPWAP to the WLC, so the switch sees only the AP\'s management traffic in one VLAN, and an **access port** in the AP management VLAN is enough. A trunk is needed when the AP places client traffic into VLANs itself (FlexConnect, autonomous), a routed port gives the AP no Layer 2 VLAN to live in, and a port-channel is used for the WLC, not for an AP.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. AP-BR1 operates in FlexConnect mode with local switching. WLAN Corp maps to VLAN 10, WLAN Voice maps to VLAN 20, and the AP management VLAN is 100. Which configuration belongs on interface Gi1/0/11 of BR-SW?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'BR-SW', sub: 'VLANs 10, 20, 100', x: 2.0, y: 1.8 },
          { id: 'ap', icon: 'ap', label: 'AP-BR1', sub: 'FlexConnect · mgmt VLAN 100', x: 5.5, y: 1.8, tone: 'accent' },
          { id: 'c1', icon: 'laptop', label: 'WLAN Corp', sub: 'VLAN 10', x: 8.6, y: 0.9 },
          { id: 'c2', icon: 'phone', label: 'WLAN Voice', sub: 'VLAN 20', x: 8.6, y: 2.9 },
        ],
        links: [
          { from: 'sw', to: 'ap', fromLabel: 'Gi1/0/11' },
          { from: 'ap', to: 'c1', style: 'wireless' },
          { from: 'ap', to: 'c2', style: 'wireless' },
        ],
      },
    },
    options: [
      'switchport mode access\nswitchport access vlan 100',
      'switchport mode trunk\nswitchport trunk native vlan 100\nswitchport trunk allowed vlan 10,20,100',
      'switchport mode trunk\nswitchport trunk allowed vlan 10,20',
      'switchport mode access\nswitchport access vlan 10',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Local switching means the AP puts Corp and Voice clients straight into VLANs 10 and 20, so the link must be an 802.1Q **trunk** that carries those VLANs tagged and the AP management VLAN 100 as the untagged native VLAN. The access-port options carry only one VLAN, and the trunk that allows only VLANs 10 and 20 leaves out VLAN 100, so the AP could not reach the controller over its management VLAN.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Gi1/0/11 connects a FlexConnect AP whose management VLAN is 100. WLAN Corp is locally switched to VLAN 10 and WLAN Voice to VLAN 20. Corp users work, but Voice users cannot obtain IP addresses. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi1/0/11    on               802.1q         trunking      100

Port        Vlans allowed on trunk
Gi1/0/11    10,100

Port        Vlans allowed and active in management domain
Gi1/0/11    10,100

Port        Vlans in spanning tree forwarding state and not pruned
Gi1/0/11    10,100`,
    },
    options: [
      'The native VLAN must be changed to 20',
      'The trunk encapsulation must be changed to ISL',
      'The AP must be moved to an access port in VLAN 20',
      'VLAN 20 is not allowed on the trunk',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The trunk allows only VLANs 10 and 100: Corp (VLAN 10) works, but frames for VLAN 20 cannot cross the link, so Voice clients never get DHCP answers. Add VLAN 20 to the allowed list. Changing the native VLAN would break the AP\'s untagged management traffic, ISL is not needed (802.1Q is correct and the port is trunking), and an access port carries a single VLAN, which would break Corp.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each WLC physical port to its role.',
    pairs: [
      { left: 'Service port', right: 'Out-of-band management on its own subnet' },
      { left: 'Distribution system port', right: 'Trunk to the switch carrying CAPWAP, client and management traffic' },
      { left: 'Console port', right: 'Local serial access for first-time setup and recovery' },
      { left: 'Redundancy port', right: 'Synchronizes the two controllers of an HA pair' },
    ],
    difficulty: 2,
    explanation:
      'The service port is the dedicated out-of-band management path, the distribution system ports carry all data, the console port gives local CLI access without any IP connectivity, and the redundancy port links the active and standby controllers.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Which WLC interface type maps a WLAN to a client VLAN?',
    options: ['Dynamic', 'Management', 'Virtual', 'Service-port'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A **dynamic interface** holds the VLAN ID, IP address, gateway and DHCP server for a client VLAN, and the WLAN is assigned to it. The management interface is for administration and CAPWAP, the virtual interface supports web authentication and mobility, and the service-port interface belongs to out-of-band management.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two statements about the WLC virtual interface are true? (Choose two.)',
    options: [
      'It uses a non-routable address such as 192.0.2.1',
      'It is bound to the physical service port',
      'It is used for web authentication redirects and DHCP relay',
      'One virtual interface is created for each client VLAN',
      'It must have a different address on every WLC in a mobility group',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The virtual interface has a dummy, **non-routable** address (such as 192.0.2.1) used for **web authentication redirects and DHCP relay**. It is not tied to the service port, only one exists per controller (dynamic interfaces are the per-VLAN ones), and the same address should be used on all WLCs in a mobility group so roaming clients see one identity.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'An AireOS WLC has LAG enabled on its distribution system ports. Which switch configuration is required on the connected ports?',
    options: [
      'channel-group 1 mode active',
      'channel-group 1 mode on',
      'channel-group 1 mode desirable',
      'channel-group 1 mode passive',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'The WLC LAG is a static bundle, so the switch must use `channel-group 1 mode on`. Active and passive are LACP modes, desirable is a PAgP mode, and the controller sends neither LACP nor PAgP messages, so those bundles would not form.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. Gi1/0/1 and Gi1/0/2 connect to the two distribution system ports of a WLC that has LAG enabled, and the bundle is down. Which change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show etherchannel summary
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
1      Po1(SD)         LACP      Gi1/0/1(I)  Gi1/0/2(I)`,
    },
    options: [
      'Change both ports to channel-group 1 mode passive',
      'Change both ports to channel-group 1 mode desirable',
      'Change both ports to channel-group 1 mode on',
      'Disable LAG on the WLC and keep the LACP bundle',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The Protocol column shows **LACP**, so the switch waits for LACP messages that the WLC never sends; the members stay stand-alone (I) and the port-channel is down (SD). A WLC LAG needs a static bundle, `mode on`. Passive is still LACP, desirable is PAgP, and disabling LAG on the WLC would leave the two ends mismatched in a different way.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'A WLC has four distribution system ports and LAG is enabled. Which statement is true?',
    options: [
      'Only the first two ports join the LAG; the others operate individually',
      'Each port keeps its own AP-manager interface',
      'LACP negotiates which ports join the bundle',
      'All four distribution system ports are part of the bundle',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'The AireOS LAG is all-or-nothing: **every** distribution system port joins the single logical link. You cannot bundle a subset, per-port AP-manager interfaces are not needed because the interfaces ride on the LAG, and the bundle is static rather than negotiated by LACP.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'What is the maximum power, in watts, that a switch port can supply under the IEEE 802.3at (PoE+) standard? (Enter the number.)',
    answers: ['30', '30w', '30 w', '30 watts'],
    placeholder: 'watts',
    difficulty: 1,
    explanation:
      '802.3at (PoE+) supplies up to **30 W** at the switch port, about 25.5 W at the device. 802.3af supplies 15.4 W and 802.3bt supplies 60 W (Type 3) or 90 W (Type 4).',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'A switch has a 740 W PoE budget and each class 4 AP reserves 30 W. What is the maximum number of APs the switch can power? (Enter the number.)',
    answers: ['24'],
    placeholder: 'number of APs',
    difficulty: 2,
    explanation:
      '740 / 30 = 24.67, and only whole APs can be powered, so the answer is **24** (24 x 30 = 720 W). A 25th AP would need 750 W, which exceeds the budget.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. A new class 4 AP connected to Gi1/0/13 does not power on. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show power inline

Available:370.0(w)  Used:360.0(w)  Remaining:10.0(w)

Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/2   auto   on         30.0    C9120AXI-B          4     30.0
...
Gi1/0/12  auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/13  auto   power-deny 0.0     n/a                 n/a   30.0`,
    },
    options: [
      'The PoE budget has only 10 W remaining, which is less than the 30 W the AP needs',
      'PoE is administratively disabled on Gi1/0/13 with power inline never',
      'The AP is not 802.3at compliant',
      'The port must be changed to a trunk',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Twelve class 4 APs already use 360 W of the 370 W budget, leaving 10 W, so the 30 W request on Gi1/0/13 is refused and the port shows `power-deny`. The Admin column shows auto (not never), a non-compliant AP would not be reported as a class 4 request that is denied for lack of power, and the port mode has no influence on PoE.',
  },
  {
    id: 'e13',
    type: 'categorize',
    stem: 'Classify each WLC item as a physical port or a logical interface.',
    categories: ['Physical port', 'Logical interface'],
    items: [
      { text: 'Service port', category: 0 },
      { text: 'Distribution system port', category: 0 },
      { text: 'Console port', category: 0 },
      { text: 'Redundancy port', category: 0 },
      { text: 'Management interface', category: 1 },
      { text: 'Dynamic interface', category: 1 },
      { text: 'Virtual interface', category: 1 },
      { text: 'AP-manager interface', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Ports are connectors on the chassis: service, distribution system, console and redundancy. Interfaces are software constructs with an IP address and VLAN: management, dynamic, virtual and AP-manager (plus the service-port interface that is bound to the service port).',
  },
  {
    id: 'e14',
    type: 'order',
    stem: 'Put the steps a client frame follows through a local-mode AP and the WLC in the correct order.',
    items: [
      'The client sends an 802.11 frame to the AP',
      'The AP decrypts the frame and encapsulates it in a CAPWAP data packet (UDP 5247)',
      'The packet crosses the access and distribution switches to the WLC',
      'The WLC removes the CAPWAP header and selects the dynamic interface of the WLAN',
      'The WLC sends the frame out the trunk tagged with the client VLAN',
    ],
    difficulty: 2,
    explanation:
      'The AP receives and decrypts the frame, then tunnels it to the WLC in CAPWAP. The wired switches only forward that IP packet. The WLC strips the tunnel headers, uses the interface mapped to the WLAN to pick the VLAN, and puts the frame on the trunk with that VLAN tag.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. LAG is enabled on WLC1. Port 1 connects to SW1 and port 2 connects to SW2, which are independent switches that are not stacked. What is the result?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.4,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 2.4, y: 1.2 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.6, y: 1.2 },
          { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'LAG enabled', x: 5.0, y: 3.5, tone: 'accent' },
        ],
        links: [
          { from: 'sw1', to: 'sw2', label: 'trunk' },
          { from: 'wlc', to: 'sw1', fromLabel: 'Port 1' },
          { from: 'wlc', to: 'sw2', fromLabel: 'Port 2' },
        ],
      },
    },
    options: [
      'The LAG works normally and balances traffic across both switches',
      'Spanning tree blocks one link but the LAG stays up',
      'The design is invalid: all LAG links must end on one switch or on switches that act as one stack, VSS or vPC pair',
      'The two switches negotiate the bundle automatically with LACP',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'A LAG is one logical link, so its members must terminate on one logical switch: a single switch, a stack, a VSS pair or a vPC pair. Two independent switches cannot form a single EtherChannel, the WLC does not run LACP to negotiate one, and spanning tree does not repair an invalid bundle.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each WLC interface to its function.',
    pairs: [
      { left: 'management', right: 'In-band administration and CAPWAP termination for the APs' },
      { left: 'dynamic', right: 'Maps a WLAN to a client VLAN' },
      { left: 'virtual', right: 'Dummy address for web authentication and mobility' },
      { left: 'service-port', right: 'Out-of-band management on its own subnet' },
      { left: 'ap-manager', right: 'Legacy interface that terminated the AP tunnels' },
    ],
    difficulty: 2,
    explanation:
      'The management interface is the controller identity and today also terminates the AP tunnels, dynamic interfaces map WLANs to VLANs, the virtual interface supports web authentication and mobility, the service-port interface is for out-of-band management, and the AP-manager interface is the older tunnel endpoint.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about this controller is true?',
    exhibit: {
      kind: 'cli',
      text: `(Cisco Controller) >show interface summary

Number of Interfaces.......................... 5

Interface Name                   Port Vlan Id  IP Address      Type    Ap Mgr Guest
-------------------------------- ---- -------- --------------- ------- ------ -----
data                             LAG  30       10.30.30.5      Dynamic No     No
management                       LAG  untagged 10.1.1.5        Static  Yes    No
service-port                     N/A  N/A      192.168.100.5   Static  No     No
virtual                          N/A  N/A      192.0.2.1       Static  No     No
voice                            LAG  40       10.40.40.5      Dynamic No     No`,
    },
    options: [
      'The distribution ports are bundled in a LAG and the management interface uses the untagged (native) VLAN',
      'The voice interface terminates the CAPWAP tunnels from the APs',
      'The virtual interface is bound to VLAN 1',
      'The service-port interface is a dynamic interface',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The Port column shows **LAG** and management has Vlan Id **untagged**, so it uses the trunk\'s native VLAN. Only management has Ap Mgr = Yes (voice is a dynamic interface for VLAN 40), the virtual interface has N/A for port and VLAN, and service-port is listed as Static.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two statements about the WLC service port are true? (Choose two.)',
    options: [
      'It provides out-of-band management',
      'It connects to a trunk port that carries all client VLANs',
      'Its interface must be in a different subnet from the management interface',
      'It is bundled into the LAG with the distribution system ports',
      'It carries the CAPWAP tunnels from the APs',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The service port is the **out-of-band** management path and its interface needs its **own subnet**. It connects to an access port, not a trunk; it is not part of the LAG, which bundles only distribution system ports; and CAPWAP tunnels from the APs terminate on the management interface over the distribution ports.',
  },
  {
    id: 'e19',
    type: 'match',
    stem: 'Match each IEEE PoE standard to the maximum power at the switch port.',
    pairs: [
      { left: 'IEEE 802.3af', right: '15.4 W' },
      { left: 'IEEE 802.3at', right: '30 W' },
      { left: 'IEEE 802.3bt Type 3', right: '60 W' },
      { left: 'IEEE 802.3bt Type 4', right: '90 W' },
    ],
    difficulty: 1,
    explanation:
      'PoE (af) gives 15.4 W, PoE+ (at) gives 30 W, and 802.3bt gives 60 W (Type 3) or 90 W (Type 4) using all four pairs. The power available at the device is lower because of cable loss.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement best explains the MAC address table for the port that connects the AP?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table interface GigabitEthernet1/0/14
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    5c5b.35aa.0101    DYNAMIC     Gi1/0/14
  10    a4b1.c1de.4402    DYNAMIC     Gi1/0/14
  20    9c3d.cf11.2203    DYNAMIC     Gi1/0/14
 100    00a2.eeb4.1c20    DYNAMIC     Gi1/0/14
Total Mac Addresses for this criterion: 4`,
    },
    options: [
      'The AP operates in local mode',
      'The AP operates in monitor mode',
      'The port is a routed port',
      'The AP operates in FlexConnect or autonomous mode with local switching',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Client MAC addresses in VLANs 10 and 20 appear on the AP port, next to the AP\'s own MAC in management VLAN 100, which means the AP bridges client traffic onto the wired VLANs itself: **FlexConnect with local switching** or an autonomous AP. In local mode, client frames are hidden in CAPWAP and only the AP MAC would be learned; a monitor-mode AP serves no clients, and a routed port does not learn MAC addresses per VLAN.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. The WLC management interface (VLAN 99, untagged) is reachable, but clients on WLANs mapped to dynamic interfaces in VLANs 10 and 20 receive no IP addresses. WLC port 1 connects to Gi1/0/1. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config interface GigabitEthernet1/0/1
Building configuration...

Current configuration : 113 bytes
!
interface GigabitEthernet1/0/1
 description WLC1 port 1
 switchport access vlan 99
 switchport mode access
end`,
    },
    options: [
      'The WLC requires an EtherChannel with mode on',
      'Gi1/0/1 is an access port in VLAN 99, so tagged frames for VLANs 10 and 20 are not carried',
      'The service port must be used for client VLANs',
      'The management VLAN must be removed from the port',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'An access port carries only VLAN 99 (untagged), which is enough for the untagged management interface but not for the tagged client VLANs 10 and 20. The port must be a **trunk** that allows VLANs 10, 20 and 99, with native VLAN 99 for the untagged management interface. LAG is optional, the service port is only for out-of-band management, and removing the management VLAN would cut off the controller.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Which two statements about PoE are true? (Choose two.)',
    options: [
      '802.3at supplies up to 30 W at the switch port',
      '802.3af supplies up to 30 W at the switch port',
      'The PoE budget limits the total power available to all powered devices on the switch',
      'A trunk port is required to deliver PoE',
      'PoE can be used only with APs in local mode',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '**802.3at** provides up to 30 W per port, and the **PoE budget** caps the sum of all PoE draws on the switch. 802.3af is limited to 15.4 W, PoE works on access and trunk ports alike, and PoE has nothing to do with the AP mode.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'In which situation can a FlexConnect AP be connected to an access port?',
    options: [
      'Only if the AP is powered by 802.3at',
      'When the AP has more than two SSIDs',
      'When every WLAN on the AP is centrally switched',
      'When the WLC uses LAG',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'A FlexConnect AP needs a trunk only for the WLANs that are **locally switched** into different VLANs. If every WLAN is centrally switched, all client traffic travels in CAPWAP and an access port in the AP management VLAN is enough. The PoE standard, the number of SSIDs and the WLC\'s LAG have no bearing on the port type.',
  },
];
