import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the current state of Fa0/7?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show port-security interface FastEthernet0/7
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Restrict
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 2
Total MAC Addresses        : 2
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 2
Last Source Address:Vlan   : 0050.7966.6877:10
Security Violation Count   : 43`,
    },
    options: [
      'The port is in the err-disabled state and must be recovered with shutdown and no shutdown',
      'Frames from an additional MAC address are dropped and logged; the secured devices keep working',
      'Frames from any MAC address, including the two secured devices, are being dropped silently',
      'The port has learned 43 MAC addresses, which is above the maximum, and is flooding frames',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Port Status **Secure-up** with Violation Mode **Restrict** means the port still forwards for its two sticky addresses (Total = Maximum = 2). Restrict drops frames from any further source MAC, logs them and increments the counter — hence 43 violations. An err-disabled port would show Secure-shutdown, protect mode would leave the counter at 0, and the counter counts violating frames, not learned addresses.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. A user replaced the PC on Fa0/9 with a new laptop (MAC 0050.7966.6890) and the port went down. The laptop must be allowed to use the port instead of the old PC. Which action achieves this?',
    exhibit: {
      kind: 'cli',
      text: `%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/9, putting Fa0/9 in err-disable state
%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0050.7966.6890 on port FastEthernet0/9.
SW1# show running-config | section interface FastEthernet0/9
interface FastEthernet0/9
 switchport access vlan 10
 switchport mode access
 switchport port-security
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 0050.7966.6811`,
    },
    options: [
      'Wait 300 seconds, because restrict mode re-enables the port automatically once the violating device is removed',
      'Enter `copy running-config startup-config` so that the switch saves the port state and can learn the new address as a sticky entry',
      'Remove the old entry with `no switchport port-security mac-address sticky 0050.7966.6811`, then enter `shutdown` and `no shutdown`',
      'Configure `switchport mode access` on Fa0/9 so that port security accepts the laptop as the new secure address',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      "No maximum or violation command appears, so the defaults apply: **one** secure address and **shutdown** mode. The old PC's sticky entry fills the only slot, so the laptop's MAC caused a violation and the port was err-disabled. Removing the old sticky entry frees the slot, and `shutdown` followed by `no shutdown` recovers the port, which then learns the laptop as the new sticky address. Restrict is not configured and never err-disables a port, and automatic recovery would need `errdisable recovery cause psecure-violation`. Saving the configuration only preserves the old address, and the port is already a static access port.",
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two actions does a switch take when a violation occurs on a port configured with `switchport port-security violation restrict`? (Choose two.)',
    options: [
      'It drops frames from the unauthorized MAC address',
      'It places the port in the err-disabled state',
      'It sends a syslog message and an SNMP trap',
      'It adds the unauthorized MAC address as a sticky address',
      'It shuts down the VLAN on every port of the switch',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Restrict **drops** the offending frames and **reports** them with a syslog message and an SNMP trap, incrementing the violation counter while the port stays up. Only shutdown mode err-disables the port. Learning the unauthorized address would defeat the maximum, and no violation mode disables a VLAN switch-wide.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each Layer 2 attack to the feature that mitigates it.',
    pairs: [
      { left: 'MAC flooding', right: 'Port security' },
      { left: 'Rogue DHCP server', right: 'DHCP snooping' },
      { left: 'ARP spoofing', right: 'Dynamic ARP Inspection' },
      { left: 'Switch spoofing', right: 'Static access mode with DTP disabled' },
      { left: 'Double tagging', right: 'Unused native VLAN on trunks' },
    ],
    difficulty: 1,
    explanation:
      'Port security limits the MACs a port can use, stopping CAM table floods. DHCP snooping drops server messages on untrusted ports. DAI validates ARP against the DHCP snooping bindings. Static access ports with DTP disabled cannot be negotiated into trunks, and an unused native VLAN means no attacker shares the VLAN whose tag is removed on the trunk.',
  },
  {
    id: 'e5',
    type: 'order',
    stem: 'Put the stages of a double-tagging VLAN hopping attack in order. The trunk between SW1 and SW2 uses native VLAN 1.',
    items: [
      'The attacker, on an access port in VLAN 1, sends a frame with two 802.1Q tags: outer VLAN 1, inner VLAN 20',
      'SW1 processes the frame in VLAN 1 and forwards it toward the trunk',
      'Because VLAN 1 is the native VLAN, SW1 sends the frame untagged, removing the outer tag',
      'SW2 receives the frame and reads the remaining tag, VLAN 20',
      'SW2 forwards the frame to the victim in VLAN 20',
    ],
    difficulty: 2,
    explanation:
      'The attack depends on the first switch treating the frame as native-VLAN traffic: it strips the outer tag when sending on the trunk, leaving the inner tag for the second switch to act on. Replies from the victim are not double-tagged, so the attack is one-way. An unused native VLAN breaks the first step, because no access port belongs to it.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'DHCP snooping is enabled for VLAN 10, and Fa0/4 is an untrusted access port in VLAN 10. Classify each message received on Fa0/4.',
    categories: ['Forwarded', 'Dropped'],
    items: [
      { text: 'DHCPDISCOVER from a client on Fa0/4', category: 0 },
      { text: 'DHCPREQUEST from a client on Fa0/4', category: 0 },
      { text: 'DHCPOFFER from a device on Fa0/4', category: 1 },
      { text: 'DHCPACK from a device on Fa0/4', category: 1 },
      { text: 'DHCPNAK from a device on Fa0/4', category: 1 },
      { text: 'DHCPRELEASE for a lease bound to Fa0/2', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Client messages (DISCOVER, REQUEST) are allowed on untrusted ports. Server messages — OFFER, ACK and NAK — are dropped, because a legitimate server never sits behind an untrusted port. A RELEASE is also dropped when it arrives on a different port from the one recorded in the binding table, which stops an attacker from releasing another client\'s lease.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Which global configuration command makes a switch automatically re-enable ports that were err-disabled by a port-security violation?',
    answers: ['errdisable recovery cause psecure-violation'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`errdisable recovery cause psecure-violation` enables automatic recovery for that cause; the port comes back after the recovery interval, **300 seconds** by default (`errdisable recovery interval`). Without it, the port stays err-disabled until an administrator enters `shutdown` and `no shutdown`.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. Right after DHCP snooping was enabled on SW1, clients in VLAN 10 stopped receiving addresses from the IOS DHCP server on router R1, which connects to the trusted uplink. Which command on SW1 resolves the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config | include dhcp
ip dhcp snooping vlan 10
ip dhcp snooping
 ip dhcp snooping trust
SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
Total number of bindings: 0`,
    },
    options: [
      '`ip dhcp snooping trust` on the client access ports',
      '`no ip dhcp snooping information option`',
      '`ip dhcp snooping limit rate 100` on the uplink',
      '`ip arp inspection vlan 10`',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Snooping is enabled for VLAN 10 and the uplink is trusted, yet no client has completed DORA. By default the switch **inserts option 82** into client requests while leaving giaddr at 0.0.0.0, and an IOS DHCP server drops such packets. `no ip dhcp snooping information option` stops the insertion (the router-side alternative is to trust relay information). Trusting access ports would let rogue servers answer, no rate limit is configured that could be exceeded, and DAI inspects ARP, not DHCP.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. DHCP snooping is being enabled on access switch SW2 for the VLAN used by PC1 and PC2. The only legitimate DHCP server connects to distribution switch SW1. Which SW2 interface must be configured with `ip dhcp snooping trust`?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pc1', icon: 'pc', label: 'PC1', x: 1.2, y: 1 },
          { id: 'pc2', icon: 'pc', label: 'PC2', x: 1.2, y: 4 },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'access', x: 3.9, y: 2.5 },
          { id: 'sw1', icon: 'l3switch', label: 'SW1', sub: 'distribution', x: 6.6, y: 2.5 },
          { id: 'srv', icon: 'server', label: 'DHCP server', sub: '10.1.99.10', x: 9, y: 2.5 },
        ],
        links: [
          { from: 'pc1', to: 'sw2', toLabel: 'Fa0/1' },
          { from: 'pc2', to: 'sw2', toLabel: 'Fa0/2' },
          { from: 'sw2', to: 'sw1', fromLabel: 'Gi0/1', toLabel: 'Gi0/2', label: 'trunk' },
          { from: 'sw1', to: 'srv', fromLabel: 'Gi0/3' },
        ],
      },
    },
    options: ['Fa0/1 and Fa0/2', 'Gi0/1', 'Fa0/1, Fa0/2 and Gi0/1', 'No interface — trust is configured only on SW1'],
    answer: 1,
    difficulty: 2,
    explanation:
      "On SW2, the OFFERs and ACKs from the legitimate server arrive on the uplink **Gi0/1**, so that port must be trusted; otherwise SW2 drops every server message and no client gets an address. The access ports must stay untrusted so that a rogue server plugged into them is blocked. Trust is configured per switch: SW1 needs its own settings if it also runs snooping, but they do not make SW2's uplink trusted.",
  },
  {
    id: 'e10',
    type: 'multi',
    stem: 'After `ip arp inspection vlan 10` was enabled on SW1, DHCP clients in VLAN 10 work normally, but a server with a statically configured IP address on Fa0/12 can no longer communicate. Which two changes would restore it? (Choose two.)',
    options: [
      'Configure `ip dhcp snooping trust` on Fa0/12 so that DAI trusts the port',
      "Permit the server's IP/MAC pair in an ARP ACL applied with `ip arp inspection filter`",
      'Raise the DAI rate limit on Fa0/12 to 100 packets per second',
      'Enter `ip arp inspection validate ip` to relax the checks on ARP messages',
      'Configure `ip arp inspection trust` on Fa0/12',
    ],
    answers: [1, 4],
    difficulty: 3,
    explanation:
      'The server never used DHCP, so it has no **DHCP snooping binding**, and DAI drops its ARP messages on the untrusted port. An **ARP ACL** applied with `ip arp inspection filter NAME vlan 10` validates its IP/MAC pair — the preferred fix — while `ip arp inspection trust` on Fa0/12 stops inspection on that port entirely, which works but gives up protection there. DHCP snooping trust does not affect DAI, the rate limit is not the issue because the port is not err-disabled, and the `ip` validation makes checking stricter, not looser.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Why was Fa0/3 err-disabled?',
    exhibit: {
      kind: 'cli',
      text: `%SW_DAI-4-PACKET_RATE_EXCEEDED: 31 packets received in 812 milliseconds on Fa0/3.
%PM-4-ERR_DISABLE: arp-inspection error detected on Fa0/3, putting Fa0/3 in err-disable state
SW1# show ip arp inspection interfaces

 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
 Gi0/1            Trusted               None               N/A
 Fa0/1            Untrusted               15                 1
 Fa0/2            Untrusted               15                 1
 Fa0/3            Untrusted               15                 1`,
    },
    options: [
      'Fa0/3 received more ARP packets per second than its DAI rate limit allows',
      'A host on Fa0/3 sent an ARP reply that did not match the DHCP snooping bindings',
      'Port security detected a second MAC address on Fa0/3',
      'Fa0/3 must be trusted, because only trusted ports may send ARP messages',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The log shows 31 ARP packets in under a second on Fa0/3, above the default DAI limit of **15 pps** for untrusted ports, followed by an err-disable with the cause **arp-inspection**. An invalid ARP would only be dropped and logged (DHCP_SNOOPING_DENY) without err-disabling the port, a port-security violation would show the psecure-violation cause, and untrusted ports may send ARP as long as it is valid and within the limit.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'An engineer configures `storm-control broadcast level 20.00 10.00` on an access port and no storm-control action. What happens when broadcast traffic on the port exceeds 20% of the bandwidth?',
    options: [
      'The port is err-disabled until an administrator enters shutdown and then no shutdown',
      'The switch sends an SNMP trap to the management station but keeps forwarding the broadcasts',
      'The switch blocks broadcasts until they fall below 10% and keeps forwarding other traffic',
      'The switch drops traffic on the port for 10 seconds and then resumes forwarding normally',
    ],
    answer: 2,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'With no action configured, storm control **filters**: when broadcasts exceed the rising threshold (20%), the port blocks broadcast frames until the level falls below the falling threshold (10%), and unicast traffic keeps flowing. Err-disabling requires `storm-control action shutdown`, `storm-control action trap` adds an SNMP trap, and the second number is a percentage threshold, not a time.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Which configuration drops IPv6 router advertisements received on switch ports that connect to end hosts?',
    options: [
      'An `ipv6 nd raguard policy` with `device-role host`, attached to the host ports',
      'An `ipv6 nd raguard policy` with `device-role router`, attached to the host ports',
      '`ip dhcp snooping trust` on the host ports, with snooping enabled for the VLAN',
      'An `ipv6 traffic-filter` that denies ICMPv6, applied on the uplink to the router',
    ],
    answer: 0,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      "RA guard inspects RAs (ICMPv6 type 134) entering a port and drops them when the attached policy says a **host** is connected. `device-role router` does the opposite — it allows RAs and belongs on the port toward the real router. DHCP snooping deals with IPv4 DHCP, and denying all ICMPv6 on the uplink would block the legitimate router's RAs and Neighbor Discovery rather than the rogue RAs arriving on host ports.",
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two configurations mitigate VLAN hopping attacks? (Choose two.)',
    options: [
      'Enable DHCP snooping on all user VLANs to block rogue DHCP servers',
      'Set the native VLAN of every trunk to an unused VLAN',
      'Keep all user ports in VLAN 1 and move the servers to a separate VLAN',
      'Configure host ports with `switchport mode access` and `switchport nonegotiate`',
      'Configure trunk ports with `switchport mode dynamic desirable`',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'An **unused native VLAN** defeats double tagging, because no attacker shares the VLAN that crosses the trunk untagged, and **static access ports without DTP** defeat switch spoofing. DHCP snooping protects against rogue DHCP servers, not VLAN hopping. Users in VLAN 1 share the default native VLAN — exactly what double tagging needs — and dynamic desirable actively invites trunk negotiation.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: "Refer to the exhibit. Fa0/15 connects to a wall jack at a user's desk. Which attack does this output indicate, and which change prevents it?",
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces FastEthernet0/15 switchport
Name: Fa0/15
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 10 (USERS)
Trunking Native Mode VLAN: 1 (default)`,
    },
    options: [
      'Double tagging; change the native VLAN on the trunks to an unused VLAN',
      'Switch spoofing; configure `switchport mode access` and `switchport nonegotiate`',
      'MAC flooding; enable port security with `switchport port-security maximum 1`',
      'ARP spoofing; enable DHCP snooping and Dynamic ARP Inspection on VLAN 10',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "A desk port should be an access port, yet **Operational Mode: trunk** shows it negotiated a trunk: its administrative mode is **dynamic auto**, so it answered DTP from the attached device. That is **switch spoofing** — the device can now tag frames for any allowed VLAN. A static access port with DTP disabled prevents it. Double tagging does not create a trunk, and MAC flooding and ARP spoofing do not change a port's operational mode.",
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Which interface command limits a port-security-enabled port to three secure MAC addresses?',
    answers: ['switchport port-security maximum 3'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`switchport port-security maximum 3` raises the limit from the default of 1. A fourth source MAC then triggers the configured violation mode.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer tries to enable port security on Fa0/6, which connects to a PC. What must the engineer do first?',
    exhibit: {
      kind: 'cli',
      text: `SW1(config)# interface FastEthernet0/6
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport port-security
Command rejected: FastEthernet0/6 is a dynamic port.`,
    },
    options: [
      'Enable `switchport port-security mac-address sticky` before port security',
      'Remove `switchport access vlan 10` from the interface',
      'Configure `switchport mode access` on Fa0/6',
      'Enable DHCP snooping globally',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'IOS enables port security only on **static** access or trunk ports. Fa0/6 is still in its default dynamic DTP mode — setting an access VLAN does not change the mode — so the command is rejected; `switchport mode access` fixes it. Sticky learning cannot help while the feature itself is rejected, the access VLAN is fine, and DHCP snooping is unrelated to port security.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'An engineer configured sticky port security on all access ports. After a power outage, every port relearned its MAC addresses from scratch. Which command should the engineer have entered after the addresses were learned to keep them across reloads?',
    answers: [
      'copy running-config startup-config',
      'copy run start',
      'copy running-config startup',
      'write memory',
      'write mem',
      'wr mem',
      'write',
      'wr',
    ],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      'Sticky addresses are written only to the **running-config**. Saving it with `copy running-config startup-config` (or `write memory`) stores them in NVRAM so they survive a reload; otherwise each port relearns whichever device connects first.',
  },
  {
    id: 'e19',
    type: 'categorize',
    stem: 'Classify each command by the configuration mode in which it is entered.',
    categories: ['Global configuration', 'Interface configuration'],
    items: [
      { text: '`ip dhcp snooping vlan 10`', category: 0 },
      { text: '`ip arp inspection vlan 10`', category: 0 },
      { text: '`ip arp inspection validate src-mac dst-mac ip`', category: 0 },
      { text: '`errdisable recovery cause psecure-violation`', category: 0 },
      { text: '`ip dhcp snooping trust`', category: 1 },
      { text: '`ip arp inspection trust`', category: 1 },
      { text: '`switchport port-security maximum 2`', category: 1 },
      { text: '`ip dhcp snooping limit rate 10`', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'Enabling snooping and DAI for VLANs, choosing DAI validation checks and enabling err-disable recovery are switch-wide settings in **global** configuration. Trust states, rate limits and port-security settings describe individual ports, so they are entered in **interface** configuration mode.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. A user connected a small unmanaged switch to Fa0/11 so that a second PC could share the port. The first PC works, but the second PC cannot communicate, and no syslog messages were generated. What explains this?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show port-security interface FastEthernet0/11
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Protect
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 1
Sticky MAC Addresses       : 0
Last Source Address:Vlan   : 0050.7966.6820:10
Security Violation Count   : 0`,
    },
    options: [
      "The port allows one address, used by the first PC, and protect mode silently drops the second PC's frames",
      'The port is err-disabled after the violation and must be recovered with shutdown and no shutdown',
      'Restrict mode is dropping the frames from the second PC, but the syslog server is unreachable',
      'Port security cannot work through an unmanaged switch, so it blocks that switch entirely',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "The port allows **one** secure address, already taken by the first PC's statically configured MAC. Frames from the second PC exceed the maximum, and in **protect** mode they are dropped with no syslog message, no SNMP trap and no counter increase — which is why the count is still 0 and the status Secure-up. An err-disabled port would show Secure-shutdown, the mode is protect rather than restrict, and the first PC still works through the unmanaged switch.",
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements describe a MAC flooding attack? (Choose two.)',
    options: [
      "It poisons hosts' ARP caches with the gateway's IP address and the attacker's MAC",
      'The attacker sends frames with many different spoofed source MAC addresses',
      'It negotiates a trunk with the switch by using DTP to reach other VLANs',
      'It is mitigated mainly by DHCP snooping with trusted and untrusted ports',
      'It fills the CAM table so that unknown unicast frames are flooded out every port',
    ],
    answers: [1, 4],
    difficulty: 1,
    explanation:
      'MAC flooding sends frames from **random source MACs** to **fill the CAM table**; the switch then floods unknown-unicast frames, letting the attacker capture them. ARP cache poisoning is ARP spoofing, DTP trunk negotiation is switch spoofing, and the mitigation for MAC flooding is port security, not DHCP snooping.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. The default gateway for VLAN 10 is 10.1.10.1. What does the log message show?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:66:68:01   10.1.10.21       80112       dhcp-snooping   10    FastEthernet0/1
00:50:79:66:68:03   10.1.10.23       79540       dhcp-snooping   10    FastEthernet0/3
Total number of bindings: 2
%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Res) on Fa0/3, vlan 10.([0050.7966.6803/10.1.10.1/0050.7966.6801/10.1.10.21/10:42:17 UTC Sat Sep 26 2026])`,
    },
    options: [
      "The legitimate gateway's ARP reply was dropped by DAI because Fa0/3 is an untrusted port",
      'The host on Fa0/3 exceeded the default DAI rate limit of 15 pps and the port was err-disabled',
      'DHCP snooping dropped a DHCPACK that a rogue DHCP server on Fa0/3 sent to 10.1.10.21',
      "The host on Fa0/3 tried to poison an ARP cache with the gateway's address, and DAI dropped it",
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The bracketed fields are sender MAC / sender IP / target MAC / target IP. The host on Fa0/3 — bound to 10.1.10.23 with MAC 0050.7966.6803 — sent an ARP **reply** to 10.1.10.21 claiming to own **10.1.10.1**, the gateway: a classic ARP spoofing attempt. Its binding only allows 10.1.10.23, so DAI dropped it. The real gateway is reached through the trusted uplink, not Fa0/3; a rate-limit violation would log PACKET_RATE_EXCEEDED and err-disable the port; and DHCP snooping drops are not reported as DAI messages.',
  },
];
