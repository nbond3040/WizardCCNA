import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'CDP & LLDP',
    subtitle: 'Discovering directly connected neighbors and mapping the network from the CLI',
    notes:
      "When you log in to an unfamiliar device, two protocols can tell you what it is plugged into without leaving the CLI. **CDP**, the Cisco Discovery Protocol, and **LLDP**, the IEEE standard Link Layer Discovery Protocol, both let a device advertise its name, model, interface, capabilities and addresses to its directly connected neighbors. In this deck you will learn how each protocol works and how their defaults differ, including which one is enabled out of the box and the timer and holdtime values the exam loves to ask about. You will configure both protocols globally and per interface, read `show cdp neighbors`, `show cdp neighbors detail` and `show lldp neighbors` output, and practice the skill the exam tests most heavily: turning discovery output into an accurate topology diagram. We finish with the security side, because the same information that helps you troubleshoot also helps an attacker. This material maps to v1.1 exam topic 2.3 and to the network access content of domain 2 in v2.0.",
  },
  {
    kind: 'bullets',
    title: 'What discovery protocols do',
    bullets: [
      'Advertise identity and capabilities to **directly connected** neighbors',
      'Run at **Layer 2**: no IP address needed',
      'Carry hostname, model, interfaces, addresses and software version',
      'Used to document, troubleshoot and verify cabling',
      'Cisco IP phones use CDP to learn their voice VLAN',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'ISR4321', x: 1.3, y: 1.2 },
        { id: 'phone', icon: 'phone', label: 'IP Phone', x: 1.3, y: 3.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.5, y: 2.5, tone: 'accent' },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 8, y: 2.5 },
        { id: 'pc', icon: 'pc', label: 'PC', x: 5.8, y: 4.4 },
      ],
      links: [
        { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0', toLabel: 'Gi1/0/24' },
        { from: 'phone', to: 'sw1', fromLabel: 'Port 1', toLabel: 'Gi1/0/10' },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi1/0/1', toLabel: 'Gi1/0/2' },
        { from: 'sw1', to: 'pc', label: 'no discovery', style: 'dashed', tone: 'muted' },
      ],
    },
    notes:
      "Discovery protocols answer a simple question: what is on the other end of this cable? Each device periodically sends a small advertisement out of every enabled interface, and each neighbor stores what it hears in a table. Because the messages are Layer 2 frames sent to a multicast MAC address, they work before any IP addressing is configured and even when IP is completely broken, which makes them a first-line troubleshooting tool. They only ever describe **directly connected** neighbors: a Cisco switch consumes the advertisements instead of forwarding them, so SW1 learns about R1, SW2 and the phone, but never about devices behind SW2. An advertisement carries the hostname, platform, capabilities, the sending interface, management addresses and, for CDP, the software version. Engineers use this to document networks, to confirm that cables are plugged in where the diagram says, and to find the IP address of a neighbor they need to reach. Cisco IP phones also rely on CDP to learn their voice VLAN from the switch.",
  },
  {
    kind: 'table',
    title: 'CDP vs LLDP',
    columns: ['Feature', 'CDP', 'LLDP'],
    rows: [
      ['Standard', 'Cisco proprietary', 'IEEE **802.1AB**, vendor-neutral'],
      ['Default on IOS', '**Enabled** globally and per interface', '**Disabled**: needs `lldp run`'],
      ['Advertisement timer', '**60 s**', '**30 s**'],
      ['Holdtime', '**180 s**', '**120 s**'],
      ['Global on/off', '`cdp run` / `no cdp run`', '`lldp run` / `no lldp run`'],
      ['Per interface', '`cdp enable` / `no cdp enable`', '`lldp transmit` and `lldp receive`, separately'],
      ['Version / extension', 'CDPv2 by default', 'LLDP-MED adds endpoint features'],
      ['Code for a switch', '`S` (Switch)', '`B` (Bridge)'],
    ],
    notes:
      "Memorize this comparison line by line, because exam questions often swap one value between the two protocols. CDP is Cisco's own protocol and is **on by default**: every Cisco router and switch sends CDP advertisements every **60 seconds** on its interfaces, and neighbors keep the information for a **holdtime of 180 seconds**, three missed advertisements. LLDP is the IEEE 802.1AB standard, so it also works with other vendors' switches, phones and servers, but Cisco IOS ships with it **off**; you enable it globally with `lldp run`. Its defaults are faster: **30 seconds** between advertisements and a **120-second** holdtime, four missed advertisements. Per interface, CDP has a single on/off switch, while LLDP separates sending and listening with `lldp transmit` and `lldp receive`. Both protocols can run at the same time on the same device. LLDP-MED extends LLDP with endpoint features such as voice VLAN and power negotiation for non-Cisco phones. Finally, notice the capability code for a switch: S in CDP but B in LLDP.",
  },
  {
    kind: 'diagram',
    title: 'Advertisements, holdtime and aging',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'sw1', label: 'SW1', icon: 'switch' },
      ],
      steps: [
        { from: 'r1', to: 'sw1', label: 'CDP advertisement', sub: 'holdtime 180 s' },
        { note: 'SW1 stores R1 and counts the holdtime down from 180' },
        { from: 'r1', to: 'sw1', label: 'Next advertisement, 60 s later', sub: 'holdtime resets to 180', tone: 'accent' },
        { note: 'R1 stops advertising (for example, CDP disabled on R1)', tone: 'bad' },
        { note: 'Holdtime reaches 0: R1 is removed from the table', tone: 'bad' },
      ],
    },
    caption: 'In a healthy network the CDP holdtime shown for a neighbor cycles between about 180 and 120.',
    notes:
      "Each advertisement carries a **holdtime**, the number of seconds the receiver should keep the information. When SW1 hears from R1, it stores the entry and starts counting down from 180. Sixty seconds later R1's next advertisement arrives and resets the counter, so in a healthy network the Holdtme column in `show cdp neighbors` moves between roughly 180 and 120. If R1 stops sending, for example because CDP was disabled on its interface, the counter keeps falling and the entry disappears when it reaches zero. A neighbor that has stopped advertising can therefore linger in the table for up to three minutes, which matters when you use CDP to verify a recabling change. LLDP works the same way with a 30-second interval and a 120-second hold time, shown in the Hold-time column of its output. Both values are configurable globally, and the holdtime should always be several times the timer so that a single lost frame never removes a healthy neighbor.",
  },
  {
    kind: 'cli',
    title: 'Reading show cdp neighbors',
    code: `SW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
R1               Gig 1/0/24        147           R B S I  ISR4321/K Gig 0/0/0
SW2              Gig 1/0/1         131               S I  C9200-24P Gig 1/0/2
SEP00AA11BB22CC  Gig 1/0/10        162             H P M  IP Phone  Port 1

Total cdp entries displayed : 3`,
    highlight: ['Gig 1/0/24', 'Gig 0/0/0', 'Local Intrfce', 'Port ID'],
    caption: 'Local Intrfce is a port on SW1; Port ID is the port on the neighbor.',
    bullets: [
      '**Device ID**: the neighbor hostname',
      '**Local Intrfce**: *this* device\'s port',
      '**Port ID**: the *neighbor\'s* port',
    ],
    notes:
      "`show cdp neighbors` is the discovery command you will read most, and the exam focuses on its columns. **Device ID** is the neighbor's hostname, or for a Cisco IP phone a name built from its MAC address, such as SEP00AA11BB22CC. **Local Intrfce** is the interface on the device where you typed the command, SW1 here. **Holdtme** is the remaining holdtime in seconds. **Capability** lists the neighbor's capability codes, explained in the legend at the top. **Platform** is the hardware model, truncated to fit the column. **Port ID** is the interface on the **neighbor** that sent the advertisement. Read each line as a sentence: SW1's Gi1/0/24 connects to R1's Gi0/0/0, and R1 is an ISR4321 router. SW1's Gi1/0/1 connects to SW2's Gi1/0/2. The phone on Gi1/0/10 reports its own port as Port 1. The most common exam trap is swapping Local Intrfce and Port ID when a question asks which interface on the neighbor is in use. Notice that the output shows no IP addresses; for those you need the detail version.",
  },
  {
    kind: 'table',
    title: 'CDP capability codes',
    columns: ['Code', 'Meaning', 'Typically seen on'],
    rows: [
      ['`R`', 'Router', 'Routers; ISR routers often show `R B S I`'],
      ['`S`', 'Switch', 'Layer 2 and Layer 3 switches'],
      ['`I`', 'IGMP', 'Devices that process IGMP, such as switches doing IGMP snooping'],
      ['`H`', 'Host', 'End devices such as IP phones'],
      ['`P`', 'Phone', 'Cisco IP phones'],
      ['`M`', 'Two-port MAC Relay', 'IP phones with a PC port on the back'],
      ['`B`', 'Source Route Bridge', 'Legacy code still advertised by many routers'],
      ['`T`', 'Trans Bridge', 'Legacy transparent bridging'],
    ],
    caption: 'A Cisco IP phone typically shows `H P M`; a Catalyst switch `S I`.',
    notes:
      "The capability codes tell you what kind of device each neighbor is, which is essential when you draw a topology from CLI output alone. **R** means router, **S** means switch and **I** means the device processes IGMP, which most Catalyst switches do for IGMP snooping, so a typical access switch shows `S I`. A Layer 3 switch that routes may show `R S I`. Many ISR routers advertise `R B S I`: the B (source-route bridge) and S codes are historical and do not mean the router is acting as a LAN switch. Cisco IP phones advertise **H** for host, **P** for phone and **M** for two-port MAC relay, because the phone has a built-in switch with a PC port on the back. When an exam exhibit asks which neighbor is a phone, look for P; when it asks which neighbors are switches, look for S and ignore platform names you do not recognize. Remember that these are CDP codes only: LLDP uses its own, different letters, covered later in this deck.",
  },
  {
    kind: 'cli',
    title: 'Details: show cdp neighbors detail',
    code: `SW1# show cdp neighbors GigabitEthernet1/0/24 detail
-------------------------
Device ID: R1
Entry address(es):
  IP address: 10.1.1.1
Platform: cisco ISR4321/K9,  Capabilities: Router Source-Route-Bridge Switch IGMP
Interface: GigabitEthernet1/0/24,  Port ID (outgoing port): GigabitEthernet0/0/0
Holdtime : 147 sec

Version :
Cisco IOS XE Software, Version 17.03.04a
<output omitted>

advertisement version: 2
Duplex: full
Management address(es):
  IP address: 10.1.1.1

Total cdp entries displayed : 1`,
    highlight: ['IP address: 10.1.1.1', 'Port ID (outgoing port): GigabitEthernet0/0/0', 'Version 17.03.04a'],
    caption: '`show cdp entry R1` shows one neighbor in detail; `show cdp entry *` shows them all.',
    notes:
      "Add `detail` and each neighbor gets a full block of information. The most useful field is **Entry address(es)**, the neighbor's IP address, which is exactly what you need when you want to SSH to a device you have only found through the cabling. The Platform line gives the full model, and Capabilities spells out the codes in words. The Interface line repeats the local-versus-remote pair in an unambiguous format: Interface is the local port, and Port ID (outgoing port) is the neighbor's port. The Version section shows the neighbor's complete software version, useful when planning upgrades and equally useful to an attacker. Advertisement version 2 confirms CDPv2, and the Duplex line lets CDP warn you about duplex mismatches. You can narrow the output to one local interface, as here, use `show cdp entry R1` for one named neighbor, or use `show cdp entry *` for every neighbor at once. The exam treats `show cdp neighbors detail` and `show cdp entry *` as equivalent ways to see neighbor IP addresses and versions.",
  },
  {
    kind: 'cli',
    title: 'CDP global and interface settings',
    code: `SW1# show cdp
Global CDP information:
        Sending CDP packets every 60 seconds
        Sending a holdtime value of 180 seconds
        Sending CDPv2 advertisements is  enabled
SW1# show cdp interface GigabitEthernet1/0/24
GigabitEthernet1/0/24 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds
SW1# configure terminal
SW1(config)# cdp timer 30
SW1(config)# cdp holdtime 120
SW1(config)# interface GigabitEthernet1/0/5
SW1(config-if)# no cdp enable`,
    highlight: ['every 60 seconds', 'holdtime value of 180 seconds', 'no cdp enable'],
    caption: '`cdp timer` and `cdp holdtime` are global; `no cdp enable` affects one interface only.',
    notes:
      "`show cdp` confirms the global state: the advertisement interval, the holdtime value sent to neighbors, and whether CDPv2 advertisements are enabled. If CDP is disabled globally, the command reports that CDP is not enabled instead. `show cdp interface` lists the interfaces running CDP with their timers, so an interface missing from that list has CDP turned off. Timers are changed globally with `cdp timer` and `cdp holdtime`; in the example the switch now advertises every 30 seconds and asks neighbors to keep its information for 120 seconds, which speeds up detection of changes at the cost of a few extra frames. The two ways to turn CDP off are the key exam point. `no cdp run` in global configuration mode stops CDP on the entire device. `no cdp enable` in interface configuration mode stops it on one interface only, which is the normal choice for a port facing a user PC or an untrusted network. Re-enable them with `cdp run` and `cdp enable`.",
  },
  {
    kind: 'cli',
    title: 'CDPv2 bonus: mismatch warnings',
    code: `SW1#
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/0/1 (1), with SW2 GigabitEthernet1/0/2 (99).
%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on GigabitEthernet1/0/1 (not full duplex), with SW2 GigabitEthernet1/0/2 (full duplex).`,
    highlight: ['NATIVE_VLAN_MISMATCH', 'DUPLEX_MISMATCH'],
    caption: 'The local interface and value come first; the neighbor name, interface and value follow.',
    bullets: [
      'CDPv2 is the default (`cdp advertise-v2`)',
      'Advertises native VLAN, duplex and VTP domain',
      'Mismatches are logged at severity 4 (warning)',
    ],
    notes:
      "CDP version 2, the default on current IOS, adds fields that let neighbors compare their settings, and two comparisons produce log messages you should recognize. A **native VLAN mismatch** means the two ends of an 802.1Q trunk disagree about which VLAN is untagged; here SW1's Gi1/0/1 uses VLAN 1 and SW2's Gi1/0/2 uses VLAN 99, so untagged frames leak between those two VLANs. A **duplex mismatch** means one side runs half duplex and the other full duplex, a classic cause of late collisions and poor performance. Both are severity 4 warnings from the CDP facility, and each follows the same pattern: the local interface and its value in parentheses, then the neighbor's name, interface and value. The messages come from CDP rather than from trunking itself, so if CDP is disabled on the link the mismatch still exists but nothing warns you about it. On the exam, a native VLAN or duplex mismatch message is a strong hint about what needs fixing.",
  },
  {
    kind: 'cli',
    title: 'Enabling and tuning LLDP',
    code: `SW1(config)# lldp run
SW1(config)# lldp timer 20
SW1(config)# lldp holdtime 80
SW1(config)# interface GigabitEthernet1/0/5
SW1(config-if)# no lldp transmit
SW1(config-if)# no lldp receive
SW1(config-if)# end
SW1# show lldp

Global LLDP Information:
    Status: ACTIVE
    LLDP advertisements are sent every 20 seconds
    LLDP hold time advertised is 80 seconds
    LLDP interface reinitialisation delay is 2 seconds`,
    highlight: ['lldp run', 'no lldp transmit', 'no lldp receive', 'Status: ACTIVE'],
    caption: 'LLDP stays off until `lldp run`; transmit and receive are controlled separately per interface.',
    notes:
      "Because LLDP is disabled by default on Cisco IOS, the first command is always `lldp run` in global configuration mode; `no lldp run` turns it off again. Once LLDP is running, every interface both transmits and receives by default. The timers are global, like CDP: `lldp timer` sets the advertisement interval (default 30 seconds) and `lldp holdtime` sets how long neighbors should keep the information (default 120 seconds). This example tightens them to 20 and 80 seconds. The interface commands are where LLDP differs from CDP. `no lldp transmit` stops the port from advertising the switch, and `no lldp receive` stops it from processing neighbors' advertisements; you can use either one alone. Disabling transmit only is a common compromise on user ports: the switch still learns what is connected, but it reveals nothing about itself. To silence LLDP completely on a port, as on Gi1/0/5 here, disable both. `show lldp` confirms the global status and timers.",
  },
  {
    kind: 'cli',
    title: 'Reading show lldp neighbors',
    code: `SW1# show lldp neighbors
Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
R1                  Gi1/0/24       105        R               Gi0/0/0
SW2                 Gi1/0/1        98         B               Gi1/0/2

Total entries displayed: 2`,
    highlight: ['Local Intf', 'Port ID', '(B) Bridge', '(S) Station'],
    caption: 'Same idea as CDP: local interface first, the neighbor\'s port last, but no Platform column.',
    notes:
      "LLDP's summary output is organized like CDP's. **Device ID** is the neighbor's system name, **Local Intf** is the port on the device where you ran the command, **Hold-time** is the remaining time in seconds, **Capability** gives the neighbor's enabled capabilities, and **Port ID** is the neighbor's own port. So this output says the same thing as the CDP output earlier: SW1's Gi1/0/24 connects to R1's Gi0/0/0 and SW1's Gi1/0/1 connects to SW2's Gi1/0/2. Two differences matter on the exam. First, there is no Platform column, so the model appears only in the detail output. Second, the capability letters are different: SW2, a switch, appears as **B** for Bridge, because 802.1AB uses the standards term for a switch. The letter S means **Station**, an end host, which is the opposite of what CDP users expect. The hold times are lower than in the CDP output because LLDP defaults to a 120-second holdtime.",
  },
  {
    kind: 'cli',
    title: 'LLDP details',
    code: `SW1# show lldp neighbors GigabitEthernet1/0/24 detail
------------------------------------------------
Local Intf: Gi1/0/24
Chassis id: 2c3f.0b5e.a100
Port id: Gi0/0/0
Port Description: GigabitEthernet0/0/0
System Name: R1

System Description:
Cisco IOS XE Software, Version 17.03.04a
<output omitted>

Time remaining: 105 seconds
System Capabilities: B,R
Enabled Capabilities: R
Management Addresses:
    IP: 10.1.1.1

Total entries displayed: 1`,
    highlight: ['System Capabilities: B,R', 'Enabled Capabilities: R', 'IP: 10.1.1.1'],
    caption: 'System Capabilities = what the device can do; Enabled Capabilities = what it is doing now.',
    notes:
      "The detail view of LLDP contains the same kinds of facts as CDP detail, under standard names. **Chassis id** identifies the neighbor device, here by a MAC address. **Port id** and **Port Description** identify the neighbor's port, and **System Name** is its hostname. **System Description** carries the software description, playing the role of CDP's Version section. **Time remaining** is the hold time left. Two capability lines appear: **System Capabilities** lists everything the device is able to do, and **Enabled Capabilities** lists what it is currently doing. R1 reports B,R but only R enabled, so it is acting as a router. **Management Addresses** gives the IP address you would use to manage the neighbor, just like Entry address in CDP. You can also use `show lldp entry R1` for a single neighbor or `show lldp neighbors detail` for all of them. On the exam, remember that finding a neighbor's IP address always requires the detail form of either protocol.",
  },
  {
    kind: 'table',
    title: 'LLDP capability codes (mind the S)',
    columns: ['Code', 'Meaning', 'Watch out'],
    rows: [
      ['`R`', 'Router', 'Same letter as CDP'],
      ['`B`', 'Bridge', '**A switch** shows B in LLDP'],
      ['`T`', 'Telephone', 'IP phones'],
      ['`W`', 'WLAN access point', 'Wireless access points'],
      ['`S`', 'Station', '**An end host**, not a switch'],
      ['`C`', 'DOCSIS cable device', 'Cable modems'],
      ['`P`', 'Repeater', 'Not the CDP phone code'],
      ['`O`', 'Other', 'Anything else'],
    ],
    caption: 'CDP S = switch; LLDP S = station. CDP P = phone; LLDP P = repeater.',
    notes:
      "LLDP's capability letters come from the IEEE standard, and several of them collide with CDP letters that mean something else, which is exactly why they appear in exam questions. In LLDP a switch is a **bridge**, so switches show **B**. The letter **S** means **station**, a device that only terminates traffic, such as a server or workstation; it never means switch in LLDP. The letter **P** means repeater rather than phone, and phones appear as **T** for telephone, often combined with B because the phone contains a small switch. Routers are **R** in both protocols, and wireless access points are **W**. When a question shows `show lldp neighbors` output and asks how many switches, routers or phones are attached, translate every letter with the LLDP legend, not from CDP memory. The legend is printed at the top of real output, but exam exhibits sometimes trim it, so know the common letters without it: R, B, T, W and S.",
  },
  {
    kind: 'steps',
    title: 'Mapping a topology from discovery output',
    steps: [
      { title: 'Start where you are', text: 'Run `show cdp neighbors` (or `show lldp neighbors`) on the first device.' },
      { title: 'Draw one line per entry', text: 'Local interface at your end, Port ID at the neighbor end.' },
      { title: 'Label each neighbor', text: 'Device ID plus capability: router, switch, phone or host.' },
      { title: 'Hop to each neighbor', text: 'Get its IP from `detail`, connect to it, and repeat.' },
      { title: 'Reconcile both ends', text: 'Each link should appear from both sides with mirrored ports.' },
    ],
    notes:
      "Building a diagram from discovery output is a mechanical process, and the exam expects you to do it quickly from one or two exhibits. Begin on the device you are logged in to and draw a line for every neighbor entry, writing the Local Intrfce value at your end and the Port ID value at the neighbor's end. Label each neighbor with its Device ID and use the capability codes to draw the right icon. To expand the map, get the neighbor's IP address from the detail output, connect to it, and repeat the process there. As the map grows, reconcile both ends of every link: if SW1 says its Gi1/0/1 goes to SW2's Gi1/0/2, then SW2 must list SW1 on local Gi1/0/2 with Port ID Gi1/0/1. A missing reverse entry points to CDP or LLDP being disabled at one end or filtered in between. Two entries for the same Device ID mean two parallel links, and a port with an up/up link but no entry leads to a device that does not speak the protocol.",
  },
  {
    kind: 'cli',
    title: 'Practice: map the network from two outputs',
    code: `SW1# show cdp neighbors
<legend omitted>
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
R1               Gig 1/0/24        147           R B S I  ISR4321/K Gig 0/0/0
SW2              Gig 1/0/1         131               S I  C9200-24P Gig 1/0/2
SEP00AA11BB22CC  Gig 1/0/10        162             H P M  IP Phone  Port 1

SW2# show cdp neighbors
<legend omitted>
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
SW1              Gig 1/0/2         158               S I  C9200-24P Gig 1/0/1
SW3              Gig 1/0/3         171               S I  C9200-24P Gig 1/0/1
SW3              Gig 1/0/4         171               S I  C9200-24P Gig 1/0/2`,
    highlight: ['SW3              Gig 1/0/3', 'SW3              Gig 1/0/4'],
    bullets: [
      'How many links join SW2 and SW3, and on which ports?',
      'Does the SW1 to SW2 link appear from both ends?',
      'Which neighbor is a phone, and how can you tell?',
    ],
    notes:
      "Try to sketch the network from these two outputs before moving to the answer on the next slide. Start with SW1: it has three neighbors. R1 is attached to SW1's Gi1/0/24 through R1's Gi0/0/0, and its capability codes identify it as a router. SW2 is attached to SW1's Gi1/0/1 through SW2's Gi1/0/2. The device on Gi1/0/10 has a Device ID beginning with SEP and the P capability, so it is a Cisco IP phone, connected through its own Port 1. Now move to SW2 and reconcile: SW2 lists SW1 on its local Gi1/0/2 with Port ID Gi1/0/1, which mirrors SW1's entry exactly, so that link is confirmed from both ends. Finally, SW3 appears **twice** in SW2's table. That is not an error or a duplicate: there are two separate cables, SW2 Gi1/0/3 to SW3 Gi1/0/1 and SW2 Gi1/0/4 to SW3 Gi1/0/2. Parallel links like these are candidates for an EtherChannel, and STP will block one of them otherwise.",
  },
  {
    kind: 'diagram',
    title: 'Practice answer: the derived topology',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'ISR4321', x: 1.2, y: 1.2 },
        { id: 'phone', icon: 'phone', label: 'SEP00AA11BB22CC', sub: 'IP phone', x: 1.2, y: 3.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.2, y: 2.5, tone: 'accent' },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.8, y: 2.5 },
        { id: 'sw3', icon: 'switch', label: 'SW3', x: 9.2, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'sw1', fromLabel: 'Gi0/0/0', toLabel: 'Gi1/0/24' },
        { from: 'phone', to: 'sw1', fromLabel: 'Port 1', toLabel: 'Gi1/0/10' },
        { from: 'sw1', to: 'sw2', fromLabel: 'Gi1/0/1', toLabel: 'Gi1/0/2' },
        { from: 'sw2', to: 'sw3', fromLabel: 'Gi1/0/3-4', toLabel: 'Gi1/0/1-2', label: '2 links', style: 'thick' },
      ],
    },
    caption: 'SW2 sees SW3 twice: two parallel links (SW2 Gi1/0/3 to SW3 Gi1/0/1, SW2 Gi1/0/4 to SW3 Gi1/0/2).',
    notes:
      "Here is the map the two outputs produce. Every link is labeled with the interface at each end, taken from the Local Intrfce column of the device that reported it and the Port ID column for the far end. R1's Gi0/0/0 meets SW1's Gi1/0/24, the phone's Port 1 meets SW1's Gi1/0/10, and SW1's Gi1/0/1 meets SW2's Gi1/0/2. The thick line between SW2 and SW3 represents two cables: SW2's Gi1/0/3 to SW3's Gi1/0/1 and SW2's Gi1/0/4 to SW3's Gi1/0/2. Pay attention to what the outputs cannot tell you. Anything behind SW3 is invisible, because discovery protocols only describe direct neighbors; you would need to log in to SW3 and repeat the process. Devices that do not run CDP, such as most PCs, never appear at all, so a port that is up/up with no neighbor entry is still in use. The exam often asks for one specific detail from such a map, for example which SW3 interface connects to SW2's Gi1/0/4.",
  },
  {
    kind: 'bullets',
    title: 'Security: turn discovery off at the edge',
    bullets: [
      'Advertisements reveal model, software version, addresses and VLANs',
      'Anyone connected to an enabled port can capture them',
      'Disable on Internet-facing and untrusted user ports',
      'Keep on infrastructure links, and CDP on Cisco phone ports',
      'Per port: `no cdp enable`, `no lldp transmit`, `no lldp receive`',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'net', icon: 'internet', label: 'Internet', x: 1, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2.5 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 6, y: 2.5, tone: 'accent' },
        { id: 'pc', icon: 'pc', label: 'User PC', x: 8.6, y: 1.2 },
        { id: 'phone', icon: 'phone', label: 'IP Phone', x: 8.6, y: 3.8 },
      ],
      links: [
        { from: 'net', to: 'r1', label: 'off', style: 'dashed', tone: 'bad' },
        { from: 'r1', to: 'sw1', label: 'on', tone: 'good' },
        { from: 'sw1', to: 'pc', label: 'off', style: 'dashed', tone: 'bad' },
        { from: 'sw1', to: 'phone', label: 'CDP on', tone: 'good' },
      ],
    },
    notes:
      "Everything that makes CDP and LLDP useful to you makes them useful to an attacker. A single captured advertisement reveals the device's hostname, exact model, software version, management IP address and, for switch ports, the native VLAN, which is enough to look up known vulnerabilities and plan VLAN attacks. Advertisements are sent to every device on the link, so anyone who plugs a laptop into an enabled access port, or any device on the far side of an ISP link, receives them without doing anything suspicious. Best practice is therefore to disable discovery on **edge ports**: interfaces facing the Internet, partners and other untrusted networks, and access ports that connect user devices. Keep it on infrastructure links between your own routers and switches, where it helps operations. The exception is ports with Cisco IP phones, which need CDP (or LLDP-MED for other vendors) to learn their voice VLAN. Use `no cdp enable` per interface rather than `no cdp run`, and for LLDP disable transmit, receive or both on those ports.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: CDP and LLDP',
    body: 'CDP: on by default, **60 s / 180 s**. LLDP: off by default, **30 s / 120 s**. Port ID is always the **neighbor\'s** interface.',
    bullets: [
      '`no cdp run` is global; `no cdp enable` is per interface',
      'LLDP needs `lldp run`; transmit and receive are separate',
      'Neighbor IP and version need `detail` or `show cdp entry *`',
      'LLDP letters: B = switch (bridge), S = station (host)',
      'Only directly connected neighbors ever appear',
      'No IP address is required: both run at Layer 2',
      'Two entries for one neighbor = two parallel links',
    ],
    notes:
      "These are the details that separate right from wrong answers on discovery questions. Timers come in pairs, 60 and 180 for CDP and 30 and 120 for LLDP, and CDP is the one that is enabled by default. Configuration scope is the next trap: `no cdp run` kills CDP everywhere, while `no cdp enable` affects one interface; `lldp run` is global, and LLDP's per-interface control is split into transmit and receive, so a device can see a neighbor that cannot see it back. In output, Local Intrfce belongs to the device you are on and Port ID belongs to the neighbor. IP addresses and software versions appear only in detail output or `show cdp entry *`. Translate LLDP capability letters with the LLDP legend: B is a switch and S is an end station. Discovery never shows devices two hops away and never needs IP to work, so an IP misconfiguration does not hide a neighbor. Finally, a neighbor listed twice is connected by two separate links.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'CDP: Cisco proprietary, on by default, 60 s timer, 180 s holdtime, CDPv2',
      'LLDP: IEEE 802.1AB, off by default, 30 s timer, 120 s holdtime',
      'Control: `cdp run`/`cdp enable`; `lldp run`/`lldp transmit`/`lldp receive`',
      'Summary views show Local interface and neighbor Port ID',
      '`detail` and `show cdp entry *` add IP addresses and versions',
      'Map topologies link by link; disable discovery on edge ports',
    ],
    notes:
      "CDP and LLDP give you a live view of what is connected to each port. CDP is Cisco proprietary, enabled by default, advertises every 60 seconds with a 180-second holdtime, and in its version 2 form also warns about native VLAN and duplex mismatches. LLDP is the vendor-neutral IEEE 802.1AB standard, disabled by default on Cisco IOS, and advertises every 30 seconds with a 120-second holdtime. You control CDP globally with `cdp run` and per interface with `cdp enable`, and LLDP globally with `lldp run` and per interface with `lldp transmit` and `lldp receive`, while `cdp timer`, `cdp holdtime`, `lldp timer` and `lldp holdtime` tune the timers. The summary commands show the neighbor, your local interface, the neighbor's port and its capabilities; the detail forms add IP addresses and software versions. With those facts you can map a network link by link, and you know to switch discovery off on ports facing untrusted devices.",
  },
];
