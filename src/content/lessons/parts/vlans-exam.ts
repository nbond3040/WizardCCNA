import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement about VLANs is true?',
    options: [
      'Each VLAN is a separate broadcast domain',
      'Hosts in different VLANs can exchange frames through the switch without a router',
      'A VLAN reduces the number of collision domains on a switch',
      'A VLAN cannot span more than one switch',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'A VLAN defines a **broadcast domain**: broadcasts and flooded frames stay inside it. Traffic between VLANs must be routed by a Layer 3 device. Collision domains are defined per switch port regardless of VLANs, and VLANs routinely span many switches over trunks.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Which two VLANs can never be deleted from a Catalyst switch? (Choose two.)',
    options: ['VLAN 1', 'VLAN 1002', 'VLAN 999', 'VLAN 1006', 'VLAN 4094'],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      '**VLAN 1** (the default VLAN) and the legacy VLANs **1002 to 1005** are permanent. VLAN 999 is an ordinary normal-range VLAN, and 1006 and 4094 are extended-range VLANs; all three can be created and deleted freely.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Eng-3 on Fa0/7 cannot ping the other engineering hosts in 10.10.30.0/24, which are connected to Fa0/5, Fa0/6 and Fa0/8. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/9, Fa0/10, Fa0/11, Fa0/12
                                                Gi0/2
10   SALES                            active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
                                                Fa0/7
30   ENGINEERING                      active    Fa0/5, Fa0/6, Fa0/8
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,
    },
    options: [
      'Fa0/7 is assigned to VLAN 10 instead of VLAN 30',
      'VLAN 30 is administratively shut down on SW1',
      'Fa0/7 is configured as a trunk, not an access port',
      'VLAN 30 does not exist in the VLAN database on SW1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Fa0/7 appears on the continuation line under **VLAN 10**, so Eng-3 is in the Sales broadcast domain and can never ARP for hosts in VLAN 30. VLAN 30 exists and is `active` (a shut VLAN would show act/lshut), and a trunk port would not be listed in `show vlan brief` at all. The fix is `switchport access vlan 30` on Fa0/7.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The host on Fa0/6 has lost all connectivity, although the link is up. Which action resolves the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces fastethernet0/6 switchport
Name: Fa0/6
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: Off
Access Mode VLAN: 40 (Inactive)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none`,
    },
    options: [
      'Create VLAN 40 on the switch',
      'Enter `no shutdown` on Fa0/6',
      'Change the port to `switchport mode trunk`',
      'Enable DTP with `switchport mode dynamic desirable`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`Access Mode VLAN: 40 (Inactive)` means the port is assigned to VLAN 40, but VLAN 40 does not exist (typically it was deleted). Creating VLAN 40 reactivates the port immediately; reassigning the port to an existing VLAN would also work. The link is up, so `no shutdown` changes nothing, and making the port a trunk or enabling DTP is wrong for a host port and does not create the missing VLAN.',
  },
  {
    id: 'e5',
    type: 'order',
    stem: 'A Cisco IP phone is connected to Fa0/1, which is configured with `switchport access vlan 10` and `switchport voice vlan 20`. Put the events in order.',
    items: [
      'The phone boots and the link to Fa0/1 comes up',
      'The switch sends a CDP message announcing voice VLAN 20',
      'The phone starts tagging its own frames with VLAN 20',
      'The phone sends a DHCP Discover in VLAN 20',
      'The phone receives an IP address from the voice subnet',
    ],
    difficulty: 2,
    explanation:
      'The phone cannot tag anything until it knows the voice VLAN, and it learns it from **CDP** once the link is up. Only then does it tag its traffic with VLAN 20, which is why its DHCP request, and therefore its address, belongs to the voice subnet. The PC behind the phone keeps sending untagged frames in data VLAN 10 throughout.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. All four Sales PCs should be in VLAN 10. Sales-3 is powered on but cannot reach Sales-1. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1     Sales-1            connected    10         a-full  a-100 10/100BaseTX
Fa0/2     Sales-2            disabled     10           auto   auto 10/100BaseTX
Fa0/3     Sales-3            connected    1          a-full  a-100 10/100BaseTX
Fa0/4     Sales-4            notconnect   10           auto   auto 10/100BaseTX
Fa0/5     Eng-1              err-disabled 30           auto   auto 10/100BaseTX`,
    },
    options: [
      'Fa0/3 is in VLAN 1 instead of VLAN 10',
      'Fa0/3 is administratively shut down',
      'Fa0/3 has a duplex mismatch',
      'Fa0/3 is error-disabled',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Fa0/3 is **connected** at full duplex and 100 Mbps, but its Vlan column shows **1**, so Sales-3 is in a different broadcast domain from Sales-1. The port that is administratively down is Fa0/2 (`disabled`), the error-disabled port is Fa0/5, and nothing in the output suggests a duplex mismatch because both duplex and speed were auto-negotiated to full / 100.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two statements about the voice VLAN feature are true? (Choose two.)',
    options: [
      'Voice frames from the phone carry an 802.1Q tag with the voice VLAN ID',
      'Frames from the PC behind the phone are tagged with the voice VLAN ID',
      'The switch port must be configured as a trunk to carry both VLANs',
      'CDP tells a Cisco IP phone which voice VLAN to use',
      'The voice VLAN must be VLAN 1, the default VLAN of the switch',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'The phone tags its voice frames with the **voice VLAN** (and CoS 5), and it learns that VLAN from **CDP**. PC frames stay untagged in the access VLAN, the port remains an access port with one extra command rather than a trunk, and the voice VLAN can be any VLAN; VLAN 1 is actually a poor choice.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'SW1 is a VTP server that has no VLAN 50. An engineer enters `switchport access vlan 50` on Fa0/9. What is the result?',
    options: [
      'SW1 creates VLAN 50 automatically and assigns Fa0/9 to it',
      'The command is rejected until VLAN 50 is created',
      'Fa0/9 is placed in VLAN 1 until VLAN 50 is created',
      'Fa0/9 becomes err-disabled',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'On a VTP server or transparent switch, IOS prints `% Access VLAN does not exist. Creating vlan 50` and creates the VLAN with the default name VLAN0050. The command is not rejected, the port does not fall back to VLAN 1, and no err-disable condition is involved. Only a VTP client, which cannot create VLANs, leaves the port inactive.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. No Sales host can communicate, although all Sales ports show connected. Which command resolves the issue?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/9, Fa0/10, Fa0/11, Fa0/12
                                                Gi0/2
10   SALES                            act/lshut Fa0/1, Fa0/2, Fa0/3, Fa0/4
30   ENGINEERING                      active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,
    },
    options: [
      '`no shutdown` in VLAN 10 configuration mode',
      '`no shutdown` on interface range Fa0/1 - 4',
      '`switchport mode access` on Fa0/1 - 4',
      '`name SALES` in VLAN 10 configuration mode',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**act/lshut** means VLAN 10 exists but has been shut down locally, which silences every port in it. `no shutdown` under `vlan 10` (or `no shutdown vlan 10` globally) restores it. The interfaces are connected, so interface-level `no shutdown` does nothing, the ports are already access ports in VLAN 10, and renaming the VLAN does not change its state.',
  },
  {
    id: 'e10',
    type: 'categorize',
    stem: 'SW1 runs in the default VTP server mode. Classify each item by where SW1 saves it.',
    categories: ['vlan.dat in flash', 'startup-config (after copy run start)'],
    items: [
      { text: 'VLAN 10 and its name SALES', category: 0 },
      { text: 'VLAN 30 created with `vlan 30`', category: 0 },
      { text: '`switchport access vlan 10` on Fa0/1', category: 1 },
      { text: '`switchport voice vlan 20` on Fa0/1', category: 1 },
      { text: 'Interface description on Fa0/1', category: 1 },
      { text: '`hostname SW1`', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'In VTP server or client mode, VLAN **definitions** (IDs and names) are written to **vlan.dat**. Everything configured on interfaces, including which VLAN a port uses, plus global settings such as the hostname, belongs to the running-config and reaches the startup-config when you save. That split is why `erase startup-config` removes port assignments but not the VLANs themselves.',
  },
  {
    id: 'e11',
    type: 'match',
    stem: 'Match each command to the information it provides.',
    pairs: [
      { left: '`show vlan brief`', right: 'Every VLAN with its status and assigned access ports' },
      { left: '`show interfaces switchport`', right: 'A port\'s administrative and operational mode, access VLAN and voice VLAN' },
      { left: '`show interfaces status`', right: 'Link state, VLAN, duplex and speed for every port, one line each' },
      { left: '`show interfaces trunk`', right: 'Which ports are trunking and which VLANs they carry' },
    ],
    difficulty: 2,
    explanation:
      '`show vlan brief` is VLAN-centric and omits trunks; `show interfaces switchport` is the detailed per-port VLAN view; `show interfaces status` is the one-line-per-port health check; and `show interfaces trunk` is the only one of the four that lists trunk ports with their allowed and active VLANs.',
  },
  {
    id: 'e12',
    type: 'input',
    stem: 'Which interface configuration command assigns an access port to data VLAN 10? Enter the full command.',
    answers: ['switchport access vlan 10', 'sw access vlan 10', 'switchport acc vlan 10', 'sw acc vlan 10'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`switchport access vlan 10` sets the access VLAN. It is normally paired with `switchport mode access`. Do not confuse it with `switchport voice vlan`, which defines the tagged voice VLAN, or `switchport trunk native vlan`, which only applies to trunks.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'Which interface configuration command makes VLAN 20 the voice VLAN on an access port? Enter the full command.',
    answers: ['switchport voice vlan 20', 'sw voice vlan 20', 'switchport voi vlan 20'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`switchport voice vlan 20` tells the switch to accept phone frames tagged with VLAN 20 and to advertise VLAN 20 to Cisco phones through CDP. The PC data VLAN is still set separately with `switchport access vlan`.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. PC-A and PC-B are addressed in the same subnet, but they cannot ping each other. What is the reason?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 1.3 },
          { id: 'a', icon: 'pc', label: 'PC-A', sub: '10.10.10.11/24', x: 2, y: 3.8 },
          { id: 'b', icon: 'pc', label: 'PC-B', sub: '10.10.10.12/24', x: 8, y: 3.8 },
        ],
        links: [
          { from: 'sw', to: 'a', fromLabel: 'Fa0/1', label: 'access VLAN 10' },
          { from: 'sw', to: 'b', fromLabel: 'Fa0/2', label: 'access VLAN 30', tone: 'bad' },
        ],
      },
    },
    options: [
      'The ports are in different VLANs, so PC-A\'s ARP broadcast never reaches PC-B',
      'SW1 needs `ip routing` to forward frames between hosts in one subnet',
      'PC-B needs a default gateway to reach PC-A',
      'Fa0/2 must be configured as a trunk because PC-B is in VLAN 30',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Addresses in one subnet mean each PC ARPs for the other directly, but the ARP broadcast from Fa0/1 is flooded only within **VLAN 10**, so PC-B never receives it. Both ports belong in the same VLAN. `ip routing` would not help because the hosts never send to a gateway for an on-subnet destination, a gateway is irrelevant for the same reason, and a PC port should never be a trunk.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'An engineer wipes a switch with `erase startup-config` and `reload`, but `show vlan brief` still lists VLANs 10, 20 and 30 after the boot. Why?',
    options: [
      'The VLANs are stored in vlan.dat in flash, which was not deleted',
      'The switch relearned the VLANs from frames sent by connected hosts',
      'The erase failed because the VLANs still had ports assigned',
      'The VLANs are stored in ROM and cannot be removed by commands',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Normal-range VLANs live in **vlan.dat**, which `erase startup-config` leaves untouched; `delete flash:vlan.dat` is also needed. Hosts never advertise VLANs, the erase does not check whether VLANs are in use, and ROM holds only boot firmware.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. How can the engineer make VLAN 60 available on SW2?',
    exhibit: {
      kind: 'cli',
      text: `SW2# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW2(config)# vlan 60
VTP VLAN configuration not allowed when device is in CLIENT mode.`,
    },
    options: [
      'Create VLAN 60 on a VTP server in the same VTP domain',
      'Enter `vlan 60` again from privileged EXEC mode',
      'Assign a port on SW2 to VLAN 60 so that the VLAN is created automatically',
      'Delete vlan.dat on SW2 and reload',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A **VTP client** cannot create, change or delete VLANs; it learns them from a VTP server in its domain, so creating VLAN 60 on the server makes it appear on SW2 (changing SW2 to transparent mode would also work). `vlan` is not an EXEC command, auto-creation through `switchport access vlan` does not happen on a client, and deleting vlan.dat does not change the VTP mode problem.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Which two actions are recommended for unused switch ports? (Choose two.)',
    options: [
      'Assign them to an unused parking VLAN',
      'Shut them down administratively',
      'Leave them in VLAN 1 so they are ready for use',
      'Configure them as trunks',
      'Set them to `dynamic desirable`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Placing unused ports in an **unused VLAN** and **shutting them down** means anything plugged in reaches nothing. VLAN 1 is the default and often reaches management, and both trunk and dynamic desirable modes let a connected device negotiate access to many VLANs, the opposite of hardening.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about Fa0/10 is true?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces fastethernet0/10 switchport
Name: Fa0/10
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none`,
    },
    options: [
      'The port uses default settings and becomes a trunk if the neighbor requests one',
      'The port was explicitly configured as an access port with `switchport mode access`',
      'The port is operating as an 802.1Q trunk with native VLAN 1',
      'The port is inactive because VLAN 1 does not exist on the switch',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**Administrative Mode: dynamic auto** with **Negotiation of Trunking: On** is the unconfigured default; it is operating as an access port only because the neighbor is not asking for a trunk. A port set with `switchport mode access` would show static access as its administrative mode and negotiation off. The operational mode is access, not trunk, and VLAN 1 always exists, as the `(default)` name shows.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Fa0/1 must carry PC traffic in VLAN 10 and Cisco IP phone traffic in VLAN 20. Which two commands are required on Fa0/1, in addition to `switchport mode access`? (Choose two.)',
    options: [
      '`switchport access vlan 10`',
      '`switchport voice vlan 20`',
      '`switchport access vlan 20`',
      '`switchport trunk allowed vlan 10,20`',
      '`switchport voice vlan 10`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The data VLAN for the PC is set with `switchport access vlan 10` and the phone VLAN with `switchport voice vlan 20`. Swapping them (access 20 or voice 10) puts each device in the wrong VLAN, and a trunk allowed list is not used for a phone port, which stays an access port.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. Gi0/1 connects SW1 to SW2 and is forwarding traffic for VLANs 10 and 30, yet it does not appear in the output. Why?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/9, Fa0/10, Fa0/11, Fa0/12
                                                Gi0/2
10   SALES                            active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
30   ENGINEERING                      active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
999  PARKING                          active    Fa0/13, Fa0/14, Fa0/15, Fa0/16
                                                Fa0/17, Fa0/18, Fa0/19, Fa0/20
                                                Fa0/21, Fa0/22, Fa0/23, Fa0/24
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,
    },
    options: [
      'Gi0/1 is a trunk port, and trunk ports are not listed in `show vlan brief`',
      'Gi0/1 is administratively shut down, and shut-down ports are not listed',
      'Gi0/1 is assigned to a VLAN that does not exist in the VLAN database',
      'Gi0/1 is assigned to one of the legacy VLANs from 1002 to 1005',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`show vlan brief` lists only access ports, so a working trunk is always missing from it; `show interfaces trunk` shows it. A shut-down access port would still be listed under its VLAN, a port in a nonexistent VLAN could not forward traffic for VLANs 10 and 30, and ports assigned to 1002 to 1005 would be listed next to those VLANs.',
  },
  {
    id: 'e21',
    type: 'match',
    stem: 'Match each VLAN status seen in `show vlan brief` to its meaning.',
    pairs: [
      { left: '`active`', right: 'The VLAN is operational' },
      { left: '`act/lshut`', right: 'The VLAN has been shut down locally on this switch' },
      { left: '`act/unsup`', right: 'A legacy VLAN (1002 to 1005) for an unsupported media type' },
      { left: '`suspended`', right: 'The VLAN was suspended with `state suspend`, a state VTP propagates' },
    ],
    difficulty: 2,
    explanation:
      '`active` is normal. `act/lshut` results from `shutdown` under the VLAN and affects only this switch. `act/unsup` appears only for the FDDI and Token Ring defaults 1002 to 1005. `suspended` comes from `state suspend`, which, unlike a local shutdown, is advertised to other switches by VTP.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'A switch runs VTP version 2. Which statement about creating VLAN 2000 on it is true?',
    options: [
      'The switch must be in VTP transparent mode (or have VTP off)',
      'VLAN 2000 is stored in vlan.dat and advertised to VTP clients',
      'VLAN 2000 is in the normal range and needs no special handling',
      'VLAN 2000 can be used only on trunk ports',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'VLAN 2000 is in the **extended range** (1006 to 4094). VTP versions 1 and 2 cannot advertise extended VLANs, so the switch must be in transparent mode (or VTP off) to create them, and they are saved in the running-config rather than vlan.dat. Extended VLANs work on access ports like any other VLAN; only VTP version 3 can advertise them.',
  },
];

export default exam;
