import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'EtherChannel (LACP)',
    subtitle: 'Bundling parallel links into one logical port-channel',
    notes:
      "Two switches connected by a single 1-Gbps link create a bottleneck, and adding a second link does not help on its own: spanning tree sees a loop and blocks one of them. **EtherChannel** solves both problems by bundling up to eight parallel physical links into one logical **port-channel** interface. Spanning tree sees a single link, all members forward traffic, and if one member fails the others simply carry on. In this deck you will compare the negotiation protocols, **LACP** (the IEEE standard) and Cisco's **PAgP**, plus static `on` mode, and memorize which mode combinations form a channel. You will configure Layer 2 and Layer 3 EtherChannels, learn which member settings must match, understand per-flow load balancing, and decode every flag in `show etherchannel summary`. Finally you will troubleshoot suspended members and channels that never form. The v1.1 blueprint lists this as configuring and verifying Layer 2 and Layer 3 EtherChannel (LACP), and the topic remains in scope for v2.0.",
  },
  {
    kind: 'compare',
    title: 'Without vs with EtherChannel',
    left: {
      heading: 'Two separate links',
      bullets: [
        'STP **blocks** one link to prevent a loop',
        'Usable bandwidth: one link',
        'A link failure triggers STP reconvergence',
        'Each link configured and monitored separately',
      ],
    },
    right: {
      heading: 'One EtherChannel',
      tone: 'accent',
      bullets: [
        'STP sees **one** logical port: every member forwards',
        'Bandwidth adds up: up to 8 active links',
        'A member failure only reduces bandwidth',
        'Configure once, on the port-channel interface',
      ],
    },
    notes:
      "Redundant parallel links between two switches form a Layer 2 loop, so spanning tree blocks all but one of them. The extra link is pure standby: you pay for it but never use it, and when the active link fails, STP has to reconverge before the backup forwards. EtherChannel changes the picture completely. The switch combines the physical links into a single logical interface, such as `Port-channel1`, and runs STP on that logical interface instead of on the members. Spanning tree therefore sees one link and blocks nothing inside the bundle, so all members carry traffic and the usable bandwidth is roughly the sum of the members, up to eight active links. If one member fails, the traffic that was hashed to it simply moves to the survivors; the port-channel stays up and STP does not even notice. Management gets easier too, because settings such as trunking and allowed VLANs are applied once, on the port-channel. Exam items test these benefits and the eight-link limit.",
  },
  {
    kind: 'diagram',
    title: 'One logical link',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Catalyst 2960', x: 2, y: 2 },
        { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'Catalyst 2960', x: 8, y: 2 },
      ],
      links: [
        { from: 'sw1', to: 'sw2', label: 'Po1 = Gi0/1 + Gi0/2 (2 Gbps)', fromLabel: 'Po1', toLabel: 'Po1', style: 'thick', tone: 'accent' },
      ],
      annotations: [{ x: 5, y: 3.6, text: 'STP sees one port: nothing inside the bundle is blocked' }],
    },
    bullets: [
      'Up to **8** active members per port-channel',
      'Members stay physical; the port-channel is logical',
      'Trunk and VLAN settings are applied on the port-channel',
    ],
    notes:
      "Physically there are still two cables between SW1 and SW2, Gi0/1 to Gi0/1 and Gi0/2 to Gi0/2. Logically there is one interface on each switch, **Port-channel1** (Po1), and almost everything above the physical layer refers to it: spanning tree runs on Po1, the MAC address table learns addresses on Po1, and trunk settings such as the native VLAN and allowed VLANs are configured on Po1 and copied to the members. The bandwidth of Po1 is the sum of its active members, so two 1-Gbps links give a 2-Gbps logical link, although a single conversation still uses only one member at a time, as the load-balancing section explains. One EtherChannel supports up to eight active members, and LACP can hold eight more in hot-standby. The port-channel number (1 here) is locally significant: the two switches could use different numbers, although matching them is a sensible convention that makes documentation and troubleshooting easier.",
  },
  {
    kind: 'table',
    title: 'Negotiation options: LACP, PAgP and on',
    columns: ['Method', 'Standard', 'Modes', 'Key facts'],
    rows: [
      ['**LACP**', 'IEEE 802.3ad (now 802.1AX)', '`active`, `passive`', 'Multi-vendor; up to 16 ports: 8 active + 8 hot-standby'],
      ['**PAgP**', 'Cisco proprietary', '`desirable`, `auto`', 'Cisco devices only; up to 8 ports'],
      ['**Static**', 'None', '`on`', 'No negotiation or checks; both ends must be `on`'],
    ],
    notes:
      "There are three ways to build a bundle. **LACP**, the Link Aggregation Control Protocol, is the IEEE standard, originally 802.3ad and now part of 802.1AX, so it works between any vendors and is the one named in the CCNA blueprint. An `active` port sends LACP messages to start negotiation; a `passive` port only answers them. LACP can manage up to 16 ports in one channel, eight active and eight in hot-standby, ready to replace a failed member. **PAgP**, the Port Aggregation Protocol, is Cisco's proprietary equivalent: `desirable` initiates and `auto` only responds, with at most eight members. **Static** mode, `on`, uses no protocol at all: the switch simply treats the ports as a bundle. That skips the safety checks the protocols perform, so a miscabled or misconfigured neighbor can cause loops or black-holed traffic. Use LACP whenever possible, and memorize which mode words belong to which protocol, because the exam loves to mix them up in distractors.",
  },
  {
    kind: 'table',
    title: 'Which mode combinations form a channel?',
    columns: ['Side A \\ Side B', '`on`', '`active`', '`passive`', '`desirable`', '`auto`'],
    rows: [
      ['`on`', '**Yes** (static)', 'No', 'No', 'No', 'No'],
      ['`active`', 'No', '**Yes** (LACP)', '**Yes** (LACP)', 'No', 'No'],
      ['`passive`', 'No', '**Yes** (LACP)', '==No==', 'No', 'No'],
      ['`desirable`', 'No', 'No', 'No', '**Yes** (PAgP)', '**Yes** (PAgP)'],
      ['`auto`', 'No', 'No', 'No', '**Yes** (PAgP)', '==No=='],
    ],
    caption: 'One side must initiate (active or desirable); on pairs only with on; protocols never mix.',
    notes:
      "Read the matrix exactly like the DTP matrix from the trunking lesson: a channel needs at least one side that **initiates**. For LACP, `active` initiates and `passive` only responds, so active plus active and active plus passive both form a channel, while **passive plus passive** does not, because neither side ever sends an LACP message. PAgP works the same way, with `desirable` as the initiator and `auto` as the responder, so **auto plus auto** fails. Static `on` works only with `on` on the other side; it never negotiates, so pairing it with any LACP or PAgP mode fails. Finally, the two protocols never interoperate: an LACP port and a PAgP port cannot form a channel, whatever their modes. The exam typically shows the `channel-group` lines of two switches and asks whether the channel forms, or asks you to pick the mode that completes a working pair. Two protocols, one initiating word each, and `on` only with `on`: that is the whole rule set.",
  },
  {
    kind: 'diagram',
    title: 'How LACP builds the bundle',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sw1', label: 'SW1 (active)', icon: 'switch' },
        { id: 'sw2', label: 'SW2 (passive)', icon: 'switch' },
      ],
      steps: [
        { from: 'sw1', to: 'sw2', label: 'LACPDUs on Gi0/1 and Gi0/2', sub: 'system ID and port details' },
        { from: 'sw2', to: 'sw1', label: 'LACPDU replies on both links', sub: 'passive ports answer' },
        { note: 'Both sides confirm the links reach the same partner with compatible settings' },
        { from: 'sw1', to: 'sw2', label: 'Ports bundled into Po1', tone: 'accent' },
        { note: 'LACPDUs continue periodically to detect failed members', tone: 'muted' },
      ],
    },
    caption: 'Active ports start the conversation; passive ports only answer.',
    notes:
      "LACP is a conversation between the two ends. A port in **active** mode sends LACP data units (LACPDUs) that identify the sending switch through its system ID and describe the port. A **passive** port stays quiet until it hears one, then answers. From these messages each switch learns that all the candidate links lead to the same partner and that their settings are compatible; only then are the ports bundled and marked `P` in `show etherchannel summary`. If a link turns out to connect to a different switch, or its settings do not match, LACP refuses to bundle it, which protects against the cabling mistakes that static `on` mode would happily accept. LACPDUs keep flowing periodically for the life of the bundle, so a failed or misbehaving member is removed. This checking is the main reason to prefer a negotiation protocol over `on`: the protocol verifies what the static mode merely assumes to be true.",
  },
  {
    kind: 'cli',
    title: 'Configuring a Layer 2 LACP EtherChannel',
    code: `SW1(config)# interface range gigabitethernet0/1 - 2
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport trunk native vlan 99
SW1(config-if-range)# channel-group 1 mode active
Creating a port-channel interface Port-channel 1
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99
SW1(config-if)# end`,
    highlight: ['channel-group 1 mode active', 'Creating a port-channel interface Port-channel 1', 'interface port-channel 1'],
    caption: 'Configure SW2 the same way, in active or passive mode.',
    notes:
      "Configure EtherChannel members together with `interface range` so that their settings are identical by construction. Here Gi0/1 and Gi0/2 on SW1 become 802.1Q trunks with native VLAN 99, and `channel-group 1 mode active` bundles them with LACP in active mode. The first time a channel-group number is used, IOS creates the matching logical interface and says so: `Creating a port-channel interface Port-channel 1`. From then on, manage Layer 2 settings on `interface port-channel 1`: commands entered there, such as the allowed VLAN list, are applied to every member, which keeps them consistent. SW2 needs the equivalent configuration, with `mode active` or `mode passive`, and matching trunk settings. On a Catalyst 2960, which only supports 802.1Q, no encapsulation command is needed; on a multi-encapsulation switch such as the 3560, add `switchport trunk encapsulation dot1q` before `switchport mode trunk`, exactly as for a normal trunk. The channel-group number only needs to be unique on this switch.",
  },
  {
    kind: 'bullets',
    title: 'Member ports must match',
    bullets: [
      'Same **speed** and **duplex**',
      'Same **switchport mode**: all access or all trunk',
      'Access members: same **access VLAN**',
      'Trunk members: same **native VLAN** and **allowed VLAN list**',
      'All Layer 2 switchports or all Layer 3 (`no switchport`)',
      '==A mismatched member is suspended, not bundled==',
    ],
    notes:
      "The switch will only bundle ports that would behave identically, because the frames of any flow may be hashed onto any member. The key checks are the physical settings, **speed and duplex**, and the Layer 2 identity of the port: its **switchport mode** (access or trunk), its **access VLAN** for access ports, and its **native VLAN** and **allowed VLAN list** for trunks. Members must also be all Layer 2 switchports or all Layer 3 routed ports. When a member does not match, IOS does not bundle it; it marks it **suspended** (`s`) and logs an `%EC-5-CANNOT_BUNDLE2` message naming the mismatch, while the compatible members keep working. The practical rules are simple: configure members together with `interface range`, make later Layer 2 changes on the port-channel interface so that they propagate to every member, and never hard-code speed or duplex on just one member. The other end of the bundle must, of course, be configured consistently as well.",
  },
  {
    kind: 'cli',
    title: 'Reading show etherchannel summary',
    code: `SW1# show etherchannel summary
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
1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(P)`,
    highlight: ['Po1(SU)', 'LACP', 'Gi0/1(P)', 'Gi0/2(P)'],
    caption: 'Healthy Layer 2 LACP bundle: SU on the port-channel, P on every member.',
    notes:
      "`show etherchannel summary` is the command to know. The legend at the top is printed every time, so you never need to memorize the letters on a live device, but exam exhibits often cut it off. Below the counters, each channel gets one line. **Group** is the channel-group number. **Port-channel** shows the logical interface with its flags: `Po1(SU)` means a Layer 2 (`S`) port-channel that is in use (`U`). **Protocol** shows LACP, PAgP, or a dash for static `on`. **Ports** lists each member with its own flag, and `(P)` means bundled. A healthy Layer 2 LACP channel therefore reads `Po1(SU) LACP Gi0/1(P) Gi0/2(P)`. Any member without a `P`, or a port-channel without a `U`, deserves attention, and the next slide decodes every flag you are likely to meet. This single line answers most EtherChannel exam questions, so practice reading it until the meaning of each letter is instant.",
  },
  {
    kind: 'table',
    title: 'EtherChannel flags decoded',
    columns: ['Flag', 'Meaning', 'Typical cause'],
    rows: [
      ['`P`', 'Bundled in the port-channel', 'Healthy member'],
      ['`D`', 'Down', 'Cable unplugged or port shut down'],
      ['`I`', 'Stand-alone: not bundled', 'No negotiating partner (e.g. passive + passive)'],
      ['`s`', 'Suspended', 'Member settings differ from the others'],
      ['`H`', 'Hot-standby (LACP only)', 'More than 8 LACP members'],
      ['`S` / `R`', 'Layer 2 / Layer 3 port-channel', 'Switchports vs `no switchport`'],
      ['`U`', 'Port-channel in use', 'At least one member bundled'],
      ['`SU` / `RU` / `SD`', 'L2 in use / L3 in use / L2 down', 'Read the letters together'],
    ],
    notes:
      "Learn the flags in two groups. Flags on the **port-channel** tell you its layer and state: `S` for a Layer 2 channel, `R` for a Layer 3 (routed) channel, `U` for in use and `D` for down, so `SU` and `RU` are healthy while `SD` means the channel has no bundled members. Flags on each **member** tell you why it is or is not carrying traffic. `P` means bundled; `D` means the physical port is down; `I` means stand-alone, a port that could not find a negotiating partner and is running as an individual link; `s` means suspended because its settings do not match the other members; and `H` marks an LACP hot-standby port beyond the eighth active member. Exam questions show a summary line and ask for the cause: suspended points to a configuration mismatch on that member, stand-alone points to negotiation (passive with passive, auto with auto, or a neighbor that is not channeling), and down points to Layer 1 or a shutdown.",
  },
  {
    kind: 'cli',
    title: 'Port-channel details',
    code: `SW1# show etherchannel port-channel
                Channel-group listing:
                ----------------------

Group: 1
----------
                Port-channels in the group:
                ---------------------------

Port-channel: Po1    (Primary Aggregator)
...
Protocol            =   LACP
...
Ports in the Port-channel:

Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     55     Gi0/1    Active             4
  1     AA     Gi0/2    Active             4

SW1# show interfaces port-channel 1
Port-channel1 is up, line protocol is up (connected)
  Hardware is EtherChannel, address is 0019.e8a4.3b02 (bia 0019.e8a4.3b02)
  MTU 1500 bytes, BW 2000000 Kbit/sec, DLY 10 usec,
  ...
  Members in this channel: Gi0/1 Gi0/2`,
    highlight: ['Protocol            =   LACP', 'BW 2000000 Kbit/sec', 'Members in this channel: Gi0/1 Gi0/2'],
    caption: 'Bandwidth is the sum of the bundled members.',
    notes:
      "Two more commands complete the picture. `show etherchannel port-channel` describes each port-channel in detail: the negotiation protocol, and a table of member ports with their **EC state** (Active here, because both members use LACP active mode) and their share of the load-balancing hash. The Load column shows, as a hexadecimal mask, which hash buckets each member owns; with two members, each takes half of them. `show interfaces port-channel 1` treats Po1 like any other interface. Its first line shows whether the logical link is up, `Hardware is EtherChannel` identifies it, the **BW** value is the sum of the bundled members (2,000,000 Kbit/sec for two 1-Gbps links, which also feeds routing metrics on Layer 3 channels), and **Members in this channel** lists the bundled ports. If a member is suspended or down, it disappears from that list and the bandwidth drops accordingly, which is an easy way to spot a degraded bundle in an exhibit.",
  },
  {
    kind: 'diagram',
    title: 'Layer 3 EtherChannel',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'd1', icon: 'l3switch', label: 'DSW1', sub: 'Po2 10.0.12.1/30', x: 2.2, y: 2.2 },
        { id: 'd2', icon: 'l3switch', label: 'DSW2', sub: 'Po2 10.0.12.2/30', x: 7.8, y: 2.2 },
      ],
      links: [
        { from: 'd1', to: 'd2', label: 'Po2 (routed): Gi0/1 + Gi0/2', fromLabel: 'Po2', toLabel: 'Po2', style: 'thick', tone: 'accent' },
      ],
      annotations: [{ x: 5, y: 4, text: 'no switchport on members and Po2; IP on Po2 only' }],
    },
    bullets: [
      'Members and port-channel are **routed** (`no switchport`)',
      'The IP address lives on the port-channel only',
      'A healthy Layer 3 channel shows `RU`',
    ],
    notes:
      "Between two multilayer switches, or between a switch and a router, you often want a **routed** link rather than a trunk, for example in a design where every uplink is a point-to-point subnet. A Layer 3 EtherChannel bundles routed ports: the members are converted with `no switchport`, the port-channel is a Layer 3 interface, and the **IP address is configured on the port-channel only**. The members carry no addresses of their own. Routing protocols then see one interface, Po2, with the combined bandwidth, and a single neighbor relationship forms over it instead of one per link. As with any Layer 3 switch design, `ip routing` must be enabled for the switch to route between this link and its other interfaces. In `show etherchannel summary`, a working Layer 3 channel shows `R` instead of `S`: `Po2(RU)`. DSW1 and DSW2 here are Catalyst 3560 multilayer switches. The exam may ask where the IP address goes, or which flag identifies a routed channel.",
  },
  {
    kind: 'cli',
    title: 'Configuring a Layer 3 EtherChannel',
    code: `DSW1(config)# interface range gigabitethernet0/1 - 2
DSW1(config-if-range)# no switchport
DSW1(config-if-range)# channel-group 2 mode active
Creating a port-channel interface Port-channel 2
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 2
DSW1(config-if)# no switchport
DSW1(config-if)# ip address 10.0.12.1 255.255.255.252
DSW1(config-if)# end
DSW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
2      Po2(RU)         LACP      Gi0/1(P)    Gi0/2(P)`,
    highlight: ['no switchport', 'ip address 10.0.12.1 255.255.255.252', 'Po2(RU)'],
    caption: 'R = Layer 3, U = in use.',
    notes:
      "On DSW1, `no switchport` first turns Gi0/1 and Gi0/2 into routed ports, and `channel-group 2 mode active` then bundles them with LACP, creating Port-channel2. Under `interface port-channel 2`, `no switchport` makes sure the logical interface is Layer 3 as well, and the IP address 10.0.12.1/30 goes there. Some engineers create the port-channel interface first and add the members afterwards; either order works, as long as the members and the port-channel end up as routed interfaces with the address only on the port-channel. DSW2 mirrors this with 10.0.12.2/30. The summary confirms the result with `Po2(RU)`: a Layer 3 port-channel in use, with both members bundled. A common mistake is leaving the members as switchports while configuring the port-channel as routed, or the reverse; the members then cannot bundle. Another is putting the IP address on a member instead of the port-channel. Verify with `show ip interface brief`, where Port-channel2 appears with its address and an up/up status.",
  },
  {
    kind: 'bullets',
    title: 'Load balancing: per flow, not per packet',
    bullets: [
      'A **hash** of selected header fields picks the member link',
      'Same fields, same link: frames of one flow stay in order',
      'One flow never exceeds the speed of one member',
      'Pick fields that vary, e.g. `src-dst-ip`',
      'Default on Catalyst 2960 and 3560: `src-mac`',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'f', label: 'Frame', sub: 'src/dst MAC and IP', shape: 'pill' },
        { id: 'h', label: 'Hash', sub: 'e.g. src-dst-ip' },
        { id: 'm', label: 'One member link', sub: 'same flow, same link', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "EtherChannel does not spray packets round-robin across members, because that would deliver frames out of order. Instead, the switch computes a **hash** from selected header fields of each frame (MAC addresses, IP addresses, or on some platforms Layer 4 ports) and uses the result to choose a member. Every frame with the same field values produces the same hash and therefore uses the same link, so each flow stays in order. The consequences are testable. A single flow, such as one large file transfer between two hosts, can never use more than one member's bandwidth. And the distribution is only as good as the variety in the hashed fields: if nearly all traffic is sent to one router's MAC address and the method is `dst-mac`, nearly everything lands on one member. Choosing a method that includes both source and destination, such as `src-dst-ip`, usually spreads traffic better. The default on the Catalyst 2960 and 3560 is `src-mac`; newer platforms use other defaults.",
  },
  {
    kind: 'cli',
    title: 'Configuring and checking load balancing',
    code: `SW1(config)# port-channel load-balance src-dst-ip
SW1(config)# end
SW1# show etherchannel load-balance
EtherChannel Load-Balancing Configuration:
        src-dst-ip

EtherChannel Load-Balancing Addresses Used Per-Protocol:
Non-IP: Source XOR Destination MAC address
  IPv4: Source XOR Destination IP address
  IPv6: Source XOR Destination IP address`,
    highlight: ['port-channel load-balance src-dst-ip', 'src-dst-ip'],
    caption: 'A global setting that applies to every EtherChannel on the switch.',
    notes:
      "The load-balancing method is a **global** setting, configured with `port-channel load-balance` in global configuration mode; on these platforms it applies to every EtherChannel on the switch rather than being set per port-channel. Available keywords on a Catalyst 2960 include `src-mac`, `dst-mac`, `src-dst-mac`, `src-ip`, `dst-ip` and `src-dst-ip`. `show etherchannel load-balance` confirms the configured method and explains which fields are used for each kind of traffic: here, non-IP frames are hashed on source and destination MAC addresses, while IPv4 and IPv6 packets are hashed on source and destination IP addresses. Each switch chooses its own method, and the two ends of a bundle do not need to match, because each side only decides how to spread the traffic it transmits. When an exhibit shows one member saturated and the others nearly idle, look at the method and at the traffic pattern: many clients talking to one server favors a method that includes the source address.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: a suspended member',
    code: `SW2#
*Sep 27 10:02:41.338: %EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)
SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(s)
SW2# show running-config interface gigabitethernet0/2 | include speed
 speed 100`,
    highlight: ['%EC-5-CANNOT_BUNDLE2', 'Gi0/2(s)', 'speed 100'],
    caption: 'The channel stays up on Gi0/1, but Gi0/2 carries nothing.',
    notes:
      "A suspended member is the classic EtherChannel mismatch. Here Gi0/2 on SW2 was hard-coded with `speed 100` while Gi0/1 runs at 1000 Mbps, and IOS logs exactly that: `%EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended`, followed by the reason in parentheses. The summary shows Po1 still in use (`SU`) through Gi0/1, while Gi0/2 carries the `s` flag and forwards nothing. The channel survives, but with half its bandwidth and no redundancy. The fix is to remove the mismatch, here with `no speed` on Gi0/2 so that it negotiates like its partner, after which LACP bundles it automatically. The same pattern appears with different reasons in the log message, for example `vlan mask is different` when the allowed VLAN lists differ, or a message about the access or native VLAN. To avoid all of them, configure members identically with `interface range` and make Layer 2 changes on the port-channel interface so that they propagate to every member.",
  },
  {
    kind: 'cli',
    title: 'Troubleshooting: the channel never forms',
    code: `SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SD)         LACP      Gi0/1(I)    Gi0/2(I)
SW1# show running-config interface gigabitethernet0/1 | include channel-group
 channel-group 1 mode passive

SW2# show running-config interface gigabitethernet0/1 | include channel-group
 channel-group 1 mode passive`,
    highlight: ['Po1(SD)', 'Gi0/1(I)', 'Gi0/2(I)', 'mode passive'],
    caption: 'passive + passive: nobody sends the first LACPDU.',
    notes:
      "Here the channel never forms at all. The summary shows `Po1(SD)`, a Layer 2 port-channel that is down, and both members flagged `I`, stand-alone: they are up and forwarding as individual ports, but they are not bundled. The configuration explains why. Both switches use `channel-group 1 mode passive`, and a passive port only answers LACP messages, so nobody starts the conversation. Changing either side to `mode active` fixes it. Stand-alone members also appear when the neighbor has no EtherChannel configured, or when LACP faces PAgP or `on`, since those never negotiate with each other. While the members run individually, spanning tree treats them as separate links and blocks all but one, so the design silently loses its extra bandwidth and its fast failover. Exam exhibits typically pair this summary with the two `channel-group` lines; learn to recognize passive plus passive, auto plus auto, and `on` facing a protocol mode instantly.",
  },
  {
    kind: 'table',
    title: 'EtherChannel troubleshooting checklist',
    columns: ['What you see', 'Likely cause', 'Fix'],
    rows: [
      ['Member `(s)` and `%EC-5-CANNOT_BUNDLE2` logs', 'Speed, duplex, mode or VLAN settings differ', 'Make the member match the others'],
      ['Members `(I)`, port-channel `SD`', 'passive + passive, auto + auto, or no channel on the neighbor', 'Make one side active or desirable'],
      ['Members `(D)`', 'Links down or shut down', 'Check cabling and `shutdown`'],
      ['No bundle; LACP on one side, PAgP or `on` on the other', 'Protocols do not interoperate', 'Use the same protocol on both ends'],
      ['Some members `(H)`', 'More than 8 LACP members', 'Normal: hot-standby links'],
      ['All traffic on one member', 'Hash method has too little variety', 'For example `src-dst-ip`'],
    ],
    notes:
      "Use the flags to narrow down the cause. Suspended members point to a configuration mismatch on the member itself: compare speed, duplex, switchport mode, access VLAN, native VLAN and allowed VLANs with the other members, and read the `%EC-5-CANNOT_BUNDLE2` message, which names the mismatch. Stand-alone members with a down port-channel point to negotiation: passive facing passive, auto facing auto, a neighbor without EtherChannel, or different protocols on each end. Down members point to Layer 1 or an administrative shutdown. A channel that bundles only some members while the others show `H` is working as designed with more than eight LACP ports. Finally, an evenly bundled channel whose traffic still crowds onto one member is a load-balancing issue, not a failure: pick a hash method with more variety. `show etherchannel summary`, `show running-config interface` and `show etherchannel load-balance` together cover every case in this table.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: EtherChannel',
    body: 'Know the **mode matrix**, the **flags** and **where the IP goes** on a Layer 3 channel.',
    bullets: [
      'LACP = active/passive (IEEE); PAgP = desirable/auto (Cisco); on = no protocol',
      'passive + passive and auto + auto never form a channel',
      '`on` works only with `on`; LACP and PAgP never mix',
      'Members must match: speed, duplex, mode, VLANs',
      'L3 EtherChannel: `no switchport`; IP on the port-channel only',
      'Load balancing is per flow, never per packet',
      'Flags: P bundled, s suspended, I stand-alone, D down, SU/RU in use',
    ],
    notes:
      "These traps cover most EtherChannel questions. LACP is the IEEE standard with modes active and passive; PAgP is Cisco's protocol with desirable and auto; `on` uses no protocol at all. A channel needs at least one initiator, so passive with passive and auto with auto both fail, `on` works only with `on`, and the two protocols never mix. Members must match in speed, duplex, switchport mode and VLAN settings, or they are suspended. A Layer 3 EtherChannel needs `no switchport` on the members and on the port-channel, with the IP address only on the port-channel. Load balancing is per flow using a hash, so one flow cannot exceed one member's speed, and the method is a global setting. Finally, read the flags precisely: `P` bundled, `s` suspended, `I` stand-alone, `D` down, `H` hot-standby, and `SU` or `RU` for a healthy Layer 2 or Layer 3 port-channel. Up to eight members can be active at once.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'EtherChannel bundles up to 8 active links into one port-channel',
      'STP sees one link; members share load; a failure only cuts bandwidth',
      'LACP active/passive, PAgP desirable/auto, static `on` with `on`',
      '`channel-group N mode active`; manage settings on `interface port-channel N`',
      'Members match: speed, duplex, mode, access/native/allowed VLANs',
      'L3: `no switchport` + IP on the port-channel; flags `RU`',
      'Per-flow hashing: `port-channel load-balance src-dst-ip`',
    ],
    notes:
      "EtherChannel bundles up to eight active parallel links into one logical port-channel, so spanning tree sees a single link, all members forward, bandwidth adds up and a member failure only reduces capacity. LACP (IEEE 802.3ad, now 802.1AX) negotiates with active and passive modes, PAgP (Cisco) with desirable and auto, and static `on` skips negotiation; a channel forms only when one side initiates, and `on` pairs only with `on`. Configure members together with `interface range` and `channel-group N mode active`, then manage settings on the port-channel interface; members must match in speed, duplex, mode and VLANs. For a Layer 3 EtherChannel, use `no switchport` and put the IP address on the port-channel. Traffic is spread per flow by a hash set with `port-channel load-balance`. Verify with `show etherchannel summary`, where `P`, `s`, `I`, `D`, `SU` and `RU` tell the whole story, plus `show etherchannel port-channel` and `show interfaces port-channel`.",
  },
];

export default slides;
