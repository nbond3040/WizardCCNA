import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Troubleshooting Methodology & Tools',
    subtitle: 'Structured methods, ping, traceroute, show commands and packet captures',
    notes:
      'Troubleshooting is where networking knowledge becomes a job skill, and the CCNA tests it in every domain: interface and cable faults, IP parameters on client operating systems, static routes and the output of the tools used to find them. This deck gives you a repeatable **method** instead of random guessing, then the tools that feed it. You will compare the structured approaches, which are top-down, bottom-up, divide and conquer, follow the path, comparing configurations and swapping components, and learn when each is fastest. Next come `ping` and extended ping with their result codes, `traceroute` and how to read its asterisks, the key show commands layer by layer, `show logging` and the careful use of `debug`, and the way to read a Wireshark capture of ARP, DHCP, DNS and the TCP handshake. The deck ends with an end-to-end scenario that combines layers 1 to 4. These skills map to v1.1 topics 1.4, 1.10 and 3.3 and to v2.0 domain 2, and the tools behave identically in both exam versions.',
  },
  {
    kind: 'diagram',
    title: 'The structured troubleshooting process',
    diagram: {
      type: 'flow',
      width: 11,
      height: 4.4,
      nodes: [
        { id: 'n1', label: 'Define the problem', sub: 'who, what, since when', x: 1.3, y: 1.1 },
        { id: 'n2', label: 'Gather facts', sub: 'show, logs, tests', x: 4.0, y: 1.1 },
        { id: 'n3', label: 'Hypothesise', sub: 'most probable cause', x: 6.7, y: 1.1 },
        { id: 'n4', label: 'Test', sub: 'smallest safe check', x: 9.4, y: 1.1, tone: 'accent' },
        { id: 'n5', label: 'Fix one thing', sub: 'with a rollback plan', x: 9.4, y: 3.3 },
        { id: 'n6', label: 'Verify end to end', sub: 'original symptom gone?', x: 6.7, y: 3.3, tone: 'good' },
        { id: 'n7', label: 'Document', sub: 'cause and fix', x: 4.0, y: 3.3 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5', label: 'confirmed' },
        { from: 'n5', to: 'n6' },
        { from: 'n6', to: 'n7' },
        { from: 'n6', to: 'n2', label: 'still broken', dashed: true, tone: 'warn' },
      ],
    },
    caption: 'Change one thing at a time, and verify before you close the ticket.',
    notes:
      'Whatever method you use, the loop underneath is the same. Start by **defining the problem** precisely: which users, which destinations, since when, and what changed recently. A report such as the Internet is down is a symptom; pinging a named server from a specific PC and seeing a timeout is a fact. Next, **gather facts** with show commands, logs, monitoring data and a few safe tests, without changing anything. Then **hypothesise** the most probable cause, based on what the facts rule out, and **test** that hypothesis with the smallest non-disruptive check. If the test rejects it, return to the facts; the dashed line shows that loop. When a cause is confirmed, **implement one fix** at a time, with a rollback plan, because making several changes together hides which one worked. Then **verify** end to end from the point of view of the user, not just that your command output looks better, and finally **document** the cause and the fix so the next engineer does not start from zero. Exam questions often ask for the next step in this sequence, and the answer is usually to gather more information before changing anything.',
  },
  {
    kind: 'diagram',
    title: 'Layers and the three layered approaches',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'OSI layer',
          layers: [
            { label: '7 Application' },
            { label: '6 Presentation' },
            { label: '5 Session' },
            { label: '4 Transport' },
            { label: '3 Network', tone: 'accent' },
            { label: '2 Data link' },
            { label: '1 Physical' },
          ],
        },
        {
          title: 'Typical checks',
          layers: [
            { label: 'Service, DNS, application logs' },
            { label: 'Encoding, encryption, TLS' },
            { label: 'Sessions, authentication' },
            { label: 'Ports, ACLs, NAT, TCP state' },
            { label: 'Addressing, routing, ping', tone: 'accent' },
            { label: 'VLANs, trunks, MAC table, STP' },
            { label: 'Cable, link light, speed, duplex' },
          ],
        },
        {
          title: 'Divide and conquer',
          layers: [
            { label: 'Ping works: look higher', sub: 'layers 4 to 7', span: 4 },
            { label: 'Start here: ping', sub: 'layer 3', span: 1, tone: 'accent' },
            { label: 'Ping fails: look lower', sub: 'layers 1 and 2', span: 2 },
          ],
        },
      ],
    },
    caption: 'Top-down runs 7 to 1. Bottom-up runs 1 to 7. Divide and conquer starts at 3, then goes up or down.',
    notes:
      'The OSI model gives you a map for deciding where to look. The first column lists the layers, and the second lists a few typical checks at each one: cabling and link lights at Layer 1, VLANs and trunks at Layer 2, addressing and routing at Layer 3, ports and ACLs at Layer 4, and services such as DNS above that. The third column shows how the three layered approaches differ in their starting point. **Top-down** starts at the application and works downward, which suits problems that look like an application fault. **Bottom-up** starts at the cable and works upward, which suits new installations or a suspected hardware fault. **Divide and conquer** starts in the middle, usually with a Layer 3 ping: if the ping succeeds, the lower layers are fine and you move up; if it fails, you move down. Because a successful ping proves layers 1 to 3 between two hosts, divide and conquer often eliminates half of the model with one command, which is why it is the most efficient default when you have no strong clue.',
  },
  {
    kind: 'table',
    title: 'Six troubleshooting methods',
    columns: ['Method', 'How it works', 'Best when', 'Watch out'],
    rows: [
      ['**Top-down**', 'Start at the application layer and work down the OSI model', 'The symptom looks like an application or user issue', 'Slow if the fault is physical'],
      ['**Bottom-up**', 'Start at the physical layer and work up', 'You suspect cabling, power or interface faults', 'Slow for application-only problems'],
      ['**Divide and conquer**', 'Start in the middle (usually a Layer 3 ping), then move up or down', 'You have no strong clue; the usual practical choice', 'Needs a quick, reliable first test'],
      ['**Follow the path**', 'Trace the real traffic hop by hop from source to destination', 'A topology exists and the break is somewhere on the path', 'Needs access to every device on the path'],
      ['**Compare configurations**', 'Diff the failing device against a working twin or a known-good baseline', 'Something worked before, or an identical device works', 'A baseline must exist'],
      ['**Swap components**', 'Replace a suspect cable, SFP or port with a known-good one', 'A Layer 1 fault is likely and spare parts are at hand', 'Change one part at a time'],
    ],
    notes:
      'The exam names six approaches and expects you to match each to its description or best use. **Top-down**, **bottom-up** and **divide and conquer** are the layered methods. **Follow the path** traces the actual route of the traffic from source to destination, checking each device in turn; it is natural when you have a topology diagram and can use traceroute. **Compare configurations** looks for differences between a failing device and a working one, or between the current running configuration and a saved known-good baseline; it is powerful when something used to work or when an identical twin device behaves correctly. **Swap components** replaces a suspect part, such as a patch cable, an SFP or a port, with a known-good one; it is fast for Layer 1 faults, but you should change one item at a time. In practice engineers mix methods: divide and conquer to locate the layer, follow the path to locate the device, and compare configurations to spot the mistake. Watch for distractors that describe the right idea under the wrong name.',
  },
  {
    kind: 'diagram',
    title: 'Follow the path: find where traffic stops',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', x: 1, y: 2.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 2.5 },
        { id: 'r2', icon: 'router', label: 'R2', x: 7, y: 2.5 },
        { id: 'srv', icon: 'server', label: 'Server', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'sw', to: 'r1' },
        { from: 'r1', to: 'r2' },
        { from: 'r2', to: 'srv' },
      ],
      annotations: [
        { x: 2, y: 1.2, text: '1. Ping the gateway', tone: 'accent' },
        { x: 5, y: 4, text: '2. Route and ACL on R1?', tone: 'accent' },
        { x: 7, y: 1.2, text: '3. Route back on R2?', tone: 'accent' },
        { x: 9, y: 4, text: '4. Service listening?', tone: 'accent' },
      ],
    },
    caption: 'Check each hop forward, and remember that the reply needs a route back.',
    notes:
      'Follow-the-path is the most intuitive method because it mirrors what the packet does. Start at the source and check each hop in order: can the host reach its default gateway, does the gateway have a route toward the destination, does the next router, and so on until you reach the server. At each device you verify the same few things: the interface is up, the packet is accepted (no ACL drop), there is a route forward, and there is a route back, because the reply must make the return trip across the same chain of routing decisions. In the diagram, the numbered checks show how the test moves outward from the PC. Ping to the gateway proves the local segment. A ping to the server that fails, combined with a traceroute that reaches R1 and then stops, shows that the break is at or beyond R1. Marking the last good hop on a diagram turns a vague complaint into a short list of suspects, and that is exactly how Cisco topology questions are meant to be solved.',
  },
  {
    kind: 'cli',
    title: 'Ping on a router and on a Windows host',
    code: `R1# ping 10.0.12.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5), round-trip min/avg/max = 1/2/4 ms

C:\\> ping -n 1 10.30.30.10
Reply from 10.30.30.10: bytes=32 time=2ms TTL=126

C:\\> ping -n 1 10.40.40.10
Request timed out.

C:\\> ping -n 1 10.50.50.10
Reply from 192.168.10.1: Destination net unreachable.

C:\\> ping -n 1 192.168.10.77
Reply from 192.168.10.10: Destination host unreachable.`,
    highlight: ['.!!!!', 'Request timed out.', 'Destination net unreachable.', 'Destination host unreachable.'],
    caption: 'Windows header and statistics lines are omitted. PC1 is 192.168.10.10 with gateway 192.168.10.1.',
    bullets: [
      'The first IOS ping often loses one packet while ARP resolves',
      'Initial TTL: Windows 128, Linux and macOS 64, Cisco IOS 255',
      '"Request timed out" is silence; no ICMP message came back',
      'Unreachable from the **gateway** address: the gateway has no route',
      'Unreachable from your **own** address: local ARP failed',
    ],
    notes:
      '`ping` sends ICMP echo requests and waits for echo replies, so a reply proves Layer 3 reachability in both directions. On Cisco IOS the output is a string of symbols, one per probe. The first example shows the most common pattern: a leading dot followed by exclamation marks. The first echo request was sent before the router had the ARP entry for the next hop, so it was lost while ARP resolved, and the later ones succeeded. That is normal and not a fault. On a Windows host the messages are words. **Request timed out** means silence. **Destination net unreachable** from the gateway address means the gateway has no route. **Destination host unreachable** from your own address means your PC could not resolve the MAC address of the target on the local subnet. The TTL in each reply tells you how many routers the reply crossed, provided you know the initial value: Windows starts at 128, Linux and macOS at 64 and Cisco IOS at 255. A reply with TTL 126 from a Windows server therefore crossed two routers.',
  },
  {
    kind: 'table',
    title: 'Ping result codes on Cisco IOS',
    columns: ['Code', 'Meaning', 'Typical cause'],
    rows: [
      ['`!`', 'Echo reply received', 'The path works in both directions'],
      ['`.`', 'Timeout: nothing came back in 2 seconds', 'No route either way, silent drop, host down, ARP failure, link down'],
      ['`U`', 'ICMP destination unreachable received', 'A router on the path has no route, or an ACL rejected the packet'],
      ['`Q`', 'ICMP source quench received', 'Destination or router too busy (obsolete, rarely seen)'],
      ['`M`', 'Could not fragment (DF bit set)', 'Packet larger than the MTU of a link on the path'],
      ['`?`', 'Unknown packet type received', 'Unexpected reply type'],
      ['`&`', 'Packet lifetime (TTL) exceeded', 'TTL set too low, or a routing loop'],
    ],
    notes:
      'Memorise this table, because Cisco likes to show a string of symbols and ask what it means. A **period** is silence: nothing came back within the 2-second timeout. A **U** is an answer: some router replied that the destination is unreachable, which usually means it has no route, or an ACL rejected the packet and sent an administratively-prohibited message. Telling the two apart is an important diagnostic step, because U tells you a device on the path is alive and reporting, whereas a period gives you no clue. A **Q** (source quench) is an obsolete request to slow down. **M** means the packet needed fragmentation but the DF bit was set, so some link has a smaller MTU than the packet. **?** is an unknown packet type, and **&** means the packet lifetime, the TTL, expired, which happens with a deliberately low TTL or a routing loop. Some IOS versions also use N and P for network and protocol unreachable. A mixed pattern such as `!!!!.` or `U.U.U` points to intermittent loss or a rate limit rather than a hard failure.',
  },
  {
    kind: 'cli',
    title: 'Extended ping: source, size, repeat and DF bit',
    code: `R1# ping
Protocol [ip]:
Target IP address: 10.30.30.10
Repeat count [5]: 10
Datagram size [100]: 1500
Timeout in seconds [2]:
Extended commands [n]: y
Source address or interface: GigabitEthernet0/0/0
Type of service [0]:
Set DF bit in IP header? [no]: yes
Validate reply data? [no]:
Data pattern [0xABCD]:
Loose, Strict, Record, Timestamp, Verbose[none]:
Sweep range of sizes [n]:
Type escape sequence to abort.
Sending 10, 1500-byte ICMP Echos to 10.30.30.10, timeout is 2 seconds:
Packet sent with a source address of 192.168.10.1
Packet sent with the DF bit set
!!!!!!!!!!
Success rate is 100 percent (10/10), round-trip min/avg/max = 2/3/5 ms`,
    highlight: ['Repeat count [5]: 10', 'Datagram size [100]: 1500', 'Source address or interface: GigabitEthernet0/0/0', 'Set DF bit in IP header? [no]: yes'],
    bullets: [
      'Type `ping` alone, then Enter, to open the dialogue',
      'Defaults: 5 probes, 100 bytes, 2 s timeout',
      '**Source** tests the return path for that subnet',
      '**Size** plus **DF bit** finds MTU problems (`M`)',
      'One line: `ping 10.30.30.10 source g0/0/0 repeat 10 size 1500 df-bit`',
    ],
    notes:
      'Plain `ping` uses defaults: five probes of 100 bytes, a 2-second timeout and, importantly, the address of the **outgoing interface** as the source. Extended ping, started by typing `ping` and pressing Enter, lets you change those. The **repeat count** controls how many probes are sent, which is useful for catching intermittent loss. The **datagram size** tests larger packets and, together with the **DF bit**, finds MTU problems: if a packet bigger than a link MTU has the Do-not-Fragment bit set, a router drops it and returns an ICMP message that IOS displays as `M`. The **source address or interface** is the most valuable option. A reply goes to whatever source address the probe carried, so pinging from the LAN interface proves that the remote side has a return route to the LAN subnet, which an ordinary ping from the WAN interface address never tests. The one-line form shown in the bullets does the same without the dialogue. On the exam, an extended-ping transcript is a favourite exhibit: read the prompts carefully, because the answers you give determine what is being tested.',
  },
  {
    kind: 'diagram',
    title: 'Traceroute mechanics: TTL and ICMP',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'src', label: 'Source (R1)', icon: 'router' },
        { id: 'a', label: 'Router A', icon: 'router' },
        { id: 'b', label: 'Router B', icon: 'router' },
        { id: 'dst', label: 'Destination', icon: 'server' },
      ],
      steps: [
        { from: 'src', to: 'a', label: 'Probe 1, TTL = 1', sub: 'UDP to a high port (33434 and up)' },
        { from: 'a', to: 'src', label: 'ICMP Time Exceeded (type 11)', sub: 'Hop 1 revealed', tone: 'accent' },
        { from: 'src', to: 'b', label: 'Probe 2, TTL = 2', sub: 'Router A decrements it to 1 and forwards' },
        { from: 'b', to: 'src', label: 'ICMP Time Exceeded (type 11)', sub: 'Hop 2 revealed', tone: 'accent' },
        { from: 'src', to: 'dst', label: 'Probe 3, TTL = 3' },
        { from: 'dst', to: 'src', label: 'ICMP Port Unreachable (type 3, code 3)', sub: 'Destination reached', tone: 'good' },
        { note: 'Windows tracert sends ICMP echo requests; the destination answers with an echo reply' },
      ],
    },
    notes:
      'Traceroute discovers the path by using the **TTL** field. The source sends its first probe with TTL 1. The first router decrements the TTL to zero, discards the packet and returns an **ICMP Time Exceeded** message, and the source records the address in that message as hop 1. The next probe goes out with TTL 2, which survives the first router and expires at the second, and so on. When the TTL finally exceeds the path length, the probe reaches the destination. Cisco IOS and Linux send **UDP** probes to a high, unlikely port (starting at 33434), so the destination replies with **ICMP Port Unreachable**, which tells the source it has arrived. Windows `tracert` sends ICMP echo requests instead, and the destination answers with an echo reply. Each hop is probed three times by default, which is why each output line shows three times. The address listed for a router is the one the router used as the source of its Time Exceeded reply, normally the interface that faces the source.',
  },
  {
    kind: 'cli',
    title: 'Reading traceroute output',
    code: `R1# traceroute 10.30.30.10
Type escape sequence to abort.
Tracing the route to 10.30.30.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
  2 10.30.30.10 2 msec 2 msec 2 msec

R1# traceroute 10.40.40.10
Type escape sequence to abort.
Tracing the route to 10.40.40.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
  2  *  *  *
  3  *  *  *
  4  *  *  *`,
    highlight: ['10.0.12.2', '*  *  *'],
    caption: 'IOS keeps probing until the maximum TTL of 30 unless you interrupt it with Ctrl+Shift+6.',
    bullets: [
      'Each line is one hop: three probes, three round-trip times',
      'An asterisk means no reply within the timeout (3 s by default)',
      'The last responding hop is where you start investigating',
      'Check its route toward the destination and the **return path**',
    ],
    notes:
      'Read traceroute output one line at a time. Each line is a hop, the number is the TTL, the address is the router that answered, and the three times are the round-trip times of the three probes. In the first example R2 answers at hop 1 and the server itself answers at hop 2, so the destination is two hops away and reachable. The second trace shows the failure signature. Hop 1 answers, and every later probe times out, so the lines show asterisks. IOS keeps trying until it reaches the maximum TTL, which is 30 by default, so the output continues for many lines unless you interrupt it. What do the asterisks mean? The trace has lost contact, and the working assumption is that the last responding hop is the last good point. Check whether that router has a route toward the destination, whether an ACL blocks the probes, and whether the return path from the next hop exists. A firewall that drops probes can make a perfectly good hop look silent while later hops still answer, so a few asterisks in the middle of a trace that completes are not a fault.',
  },
  {
    kind: 'table',
    title: 'Key show commands by layer',
    columns: ['Layer', 'What you check', 'Commands'],
    rows: [
      ['**1 Physical**', 'Link state, errors, speed and duplex, cabling', '`show interfaces`, `show interfaces status`, `show ip interface brief`'],
      ['**2 Data link**', 'VLANs, trunks, MAC learning, STP, EtherChannel, neighbors', '`show vlan brief`, `show interfaces trunk`, `show mac address-table`, `show spanning-tree`, `show etherchannel summary`, `show cdp neighbors`'],
      ['**3 Network**', 'Addresses, routes, ARP, routing protocol neighbors', '`show ip interface brief`, `show ip route`, `show ip arp`, `show ip protocols`, `show ip ospf neighbor`'],
      ['**4 Transport**', 'ACLs and NAT', '`show access-lists`, `show ip nat translations`'],
      ['**Upper layers**', 'Services such as DHCP and NTP', '`show ip dhcp binding`, `show ntp status`'],
      ['**All layers**', 'Intent and events', '`show running-config`, `show logging`, `debug` (with care)'],
    ],
    notes:
      'A good engineer chooses the command that answers the question at hand rather than dumping the whole configuration. Use this table as a menu organised by layer. At **Layer 1**, `show interfaces` and `show interfaces status` tell you whether the link is up and whether errors, speed or duplex are wrong, and `show ip interface brief` gives a one-screen summary of status and protocol for every interface. At **Layer 2**, VLAN membership, trunks, the MAC address table, spanning tree, EtherChannel and CDP or LLDP neighbours explain most switching faults. At **Layer 3**, check the address, the routing table, the ARP cache and the routing protocol neighbours. At **Layer 4**, access lists and NAT translations are the usual suspects, and their match counters show whether traffic is being permitted or denied. Services above that, such as DHCP bindings or NTP status, have their own commands. Finally `show running-config` shows intent, and `show logging` shows events. A reliable habit is to move through the layers in order and stop when a command contradicts your assumption.',
  },
  {
    kind: 'cli',
    title: 'Layer 1 and 2: interface status and error counters',
    code: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.0.12.1       YES manual up                    up
GigabitEthernet0/0/1   unassigned      YES unset  administratively down down
Serial0/1/0            10.9.9.1        YES manual up                    down
Serial0/1/1            unassigned      YES unset  down                  down

SW1# show interfaces GigabitEthernet1/0/5
GigabitEthernet1/0/5 is up, line protocol is up (connected)
  Full-duplex, 100Mb/s, media type is 10/100/1000BaseTX
     0 runts, 0 giants, 0 throttles
     312 input errors, 312 CRC, 0 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 2 interface resets
     0 babbles, 0 late collision, 0 deferred`,
    highlight: ['administratively down', 'up                    down', '312 CRC'],
    bullets: [
      '`up/up` healthy; `up/down` Layer 2 fault; `down/down` Layer 1 fault',
      '`administratively down` means `shutdown` was configured',
      '**CRC** and input errors: bad cable, interference or duplex mismatch',
      '**Late collisions**: duplex mismatch or an over-long cable',
      '**Runts** come from collisions; **giants** from oversized frames',
    ],
    notes:
      'The two columns of `show ip interface brief` encode a lot of diagnosis. **Status** reflects Layer 1 and **Protocol** reflects Layer 2. `up/up` is healthy. `administratively down` means someone entered `shutdown`; the fix is `no shutdown`. `down/down` usually means a Layer 1 problem: no cable, a dead far end or a failed transceiver. `up/down` means the signal is present but Layer 2 is not working, for example a serial encapsulation mismatch or missing keepalives. On a switch, `show interfaces status` additionally shows `err-disabled`, `notconnect` and `inactive`. The `show interfaces` excerpt shows counters. A growing **CRC** count and input errors point to a bad cable, interference or a duplex mismatch. **Runts** are frames below 64 bytes and often come from collisions, while **giants** exceed the maximum frame size, which can be an MTU or jumbo mismatch. **Late collisions** happen on half-duplex links when the cable is too long or the far end disagrees about duplex. A duplex mismatch leaves the link up but slow, and is a favourite exam scenario.',
  },
  {
    kind: 'table',
    title: 'Client OS commands for IP parameters',
    columns: ['Task', 'Windows', 'macOS / Linux'],
    rows: [
      ['IP address, mask, gateway, DNS, MAC', '`ipconfig /all`', '`ifconfig` or `ip addr`'],
      ['Renew a DHCP lease', '`ipconfig /release`, then `ipconfig /renew`', 'Varies by OS and network manager'],
      ['Show the ARP cache', '`arp -a`', '`arp -a` or `ip neigh`'],
      ['Test DNS resolution', '`nslookup name`', '`nslookup name` or `dig name`'],
      ['Trace the path', '`tracert address`', '`traceroute address`'],
      ['Show the host routing table', '`route print`', '`netstat -rn` or `ip route`'],
      ['Show connections and listening ports', '`netstat -an`', '`netstat -an` or `ss -tuln`'],
    ],
    caption: 'An address in 169.254.0.0/16 means DHCP failed and the client assigned itself an APIPA address.',
    notes:
      'Topic 1.10 asks you to verify IP parameters on client operating systems, and these commands are the tools. On Windows, `ipconfig /all` is the one to know: it shows the IPv4 address, subnet mask, default gateway, DNS servers, MAC address and whether DHCP is enabled. An address in the 169.254.0.0/16 range means the client asked for DHCP, got no answer and assigned itself an automatic private address, so reachability is limited to the local segment. `ipconfig /release` and `/renew` request a new lease. `arp -a` shows the ARP cache, which proves that Layer 2 resolution to the gateway works, and `route print` shows the host routing table, including the default route. `nslookup` queries DNS directly, so you can separate a name resolution fault from a connectivity fault: if you can ping 203.0.113.80 but cannot browse to a name, suspect DNS. On macOS and Linux the equivalents are `ifconfig` or `ip addr`, `ip neigh`, `netstat -rn` or `ip route`, and `dig`. Expect questions that show output from one of these commands and ask what is wrong.',
  },
  {
    kind: 'cli',
    title: 'show logging and careful debugging',
    code: `R1# show logging | begin Log Buffer
Log Buffer (4096 bytes):

*Oct  3 10:15:01.123: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to down
*Oct  3 10:15:02.123: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to down
*Oct  3 10:16:20.456: %OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/0/0 from FULL to DOWN, Neighbor Down: Dead timer expired
*Oct  3 10:17:44.789: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (10.1.1.50)

R1# terminal monitor
R1# debug ip icmp
ICMP packet debugging is on
*Oct  3 10:20:11.001: ICMP: echo reply sent, src 10.0.12.1, dst 10.0.12.2, topology BASE, dscp 0 topoid 0
R1# show debugging
IP ICMP:
  ICMP packet debugging is on
R1# undebug all
All possible debugging has been turned off`,
    highlight: ['%LINK-3-UPDOWN', '%OSPF-5-ADJCHG', 'debug ip icmp', 'undebug all'],
    bullets: [
      'Message format: `%FACILITY-SEVERITY-MNEMONIC: text`',
      'Severity 0 (emergencies) to 7 (debugging); lower is more severe',
      '`terminal monitor` shows log output in a Telnet or SSH session',
      '`debug` loads the CPU: be specific, then `undebug all`',
    ],
    notes:
      'Logs tell you what the device noticed, and `show logging` displays the contents of the buffer along with the logging configuration. Every message has the form `%FACILITY-SEVERITY-MNEMONIC: text`. The severity is a number from 0 to 7: emergencies, alerts, critical, errors, warnings, notifications, informational and debugging, so a lower number is more severe. In the excerpt, the `%LINK-3-UPDOWN` message is severity 3 (errors) and the `%OSPF-5-ADJCHG` message is severity 5 (notifications). Logs can go to the console, to the internal buffer, to VTY sessions (after `terminal monitor`) and to a syslog server. The leading asterisk means the router clock is not synchronised, which is why NTP matters for correlating events. **Debug** commands show real-time protocol activity, which is invaluable and dangerous. Debug output is processed by the CPU and can flood the console on a busy router, so use a narrow command, apply it for a short time, and turn it off with `undebug all` (or `no debug all`). `show debugging` lists what is enabled. Prefer show commands first.',
  },
  {
    kind: 'cli',
    title: 'Packet capture: DHCP and ARP',
    code: `No.  Time      Source             Destination        Protocol  Info
1    0.000000  0.0.0.0            255.255.255.255    DHCP      DHCP Discover - Transaction ID 0x3a1f5c22
2    0.002100  192.168.10.1       255.255.255.255    DHCP      DHCP Offer    - Transaction ID 0x3a1f5c22
3    0.002900  0.0.0.0            255.255.255.255    DHCP      DHCP Request  - Transaction ID 0x3a1f5c22
4    0.005300  192.168.10.1       255.255.255.255    DHCP      DHCP ACK      - Transaction ID 0x3a1f5c22
5    0.310000  aa:bb:cc:00:00:0a  ff:ff:ff:ff:ff:ff  ARP       Who has 192.168.10.1? Tell 192.168.10.50
6    0.310400  aa:bb:cc:00:00:01  aa:bb:cc:00:00:0a  ARP       192.168.10.1 is at aa:bb:cc:00:00:01

Frame 2: DHCP Offer (UDP 67 to 68)
    Your (client) IP address: 192.168.10.50
    Option: (53) DHCP Message Type (Offer)
    Option: (54) DHCP Server Identifier (192.168.10.1)
    Option: (51) IP Address Lease Time (1 day)
    Option: (1) Subnet Mask (255.255.255.0)
    Option: (3) Router (192.168.10.1)
    Option: (6) Domain Name Server (192.168.10.2)`,
    highlight: ['DHCP Discover', 'DHCP Offer', 'DHCP Request', 'DHCP ACK', 'Who has 192.168.10.1?'],
    bullets: [
      'DORA: Discover, Offer, Request, ACK; client UDP 68, server UDP 67',
      'All four share one transaction ID',
      'ARP request is a broadcast; the reply is unicast',
      'Repeated Discover with no Offer: no reachable DHCP server',
    ],
    notes:
      'A Wireshark packet list has one row per frame, and the Info column summarises it. In this capture, the first four packets are the DHCP exchange known as DORA: Discover, Offer, Request, Acknowledge. The client has no address yet, so the Discover goes from 0.0.0.0 to the broadcast address 255.255.255.255 using UDP port 68 for the client and 67 for the server. All four frames share the same transaction ID, which is how the client matches replies to its own conversation. Inside the Offer, the options carry the lease time, subnet mask, default gateway (the Router option) and DNS server, and the offered address appears in the `Your (client) IP address` field. Server replies may be broadcast or unicast depending on the client, so do not rely on that detail. Once the client has an address it uses **ARP** to find the gateway MAC: the request is a broadcast and the reply is unicast. In a failing capture you may see Discover packets repeating with no Offer, or an ARP request with no reply, and each symptom points to a different layer.',
  },
  {
    kind: 'cli',
    title: 'Packet capture: DNS and the TCP handshake',
    code: `No.  Time      Source          Destination     Protocol  Info
7    0.512000  192.168.10.50   192.168.10.2    DNS       Standard query 0x1a2b A www.example.com
8    0.514800  192.168.10.2    192.168.10.50   DNS       Standard query response 0x1a2b A www.example.com A 203.0.113.80
9    0.515500  192.168.10.50   203.0.113.80    TCP       49834 -> 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
10   0.531000  203.0.113.80    192.168.10.50   TCP       80 -> 49834 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460
11   0.531200  192.168.10.50   203.0.113.80    TCP       49834 -> 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0
12   0.531900  192.168.10.50   203.0.113.80    HTTP      GET / HTTP/1.1
13   0.834000  192.168.10.50   203.0.113.80    TCP       [TCP Retransmission] 49834 -> 80 [PSH, ACK] Seq=1 Ack=1 Len=87`,
    highlight: ['[SYN]', '[SYN, ACK]', '[ACK]', '[TCP Retransmission]'],
    bullets: [
      'DNS uses UDP 53; the response ID matches the query ID',
      'Handshake: SYN, then SYN-ACK, then ACK',
      'SYN repeated with no SYN-ACK: path, ACL or server problem',
      '`[RST, ACK]` answering a SYN: host up, port closed',
      '`[TCP Retransmission]`: data was not acknowledged in time',
    ],
    notes:
      'After addressing and ARP, the client resolves a name and opens a connection. Packet 7 is a **DNS** query over UDP port 53 asking for the A record of the name, and packet 8 is the response carrying the same query ID and the address 203.0.113.80. Packets 9 to 11 are the **TCP three-way handshake**: the client sends SYN, the server answers SYN-ACK, and the client confirms with ACK. Wireshark displays relative sequence numbers, which start at zero, so the SYN-ACK acknowledges 1. After the handshake the client sends an HTTP request. Packet 13 is flagged `[TCP Retransmission]` because the same data was sent again after no acknowledgement arrived within the retransmission timeout, which points to loss somewhere on the path, in either direction. Learn the failure signatures: a SYN repeated with no SYN-ACK means the packet never reached a service or the reply never came back; a SYN answered by RST means the host is reachable but the port is closed; and many duplicate ACKs and retransmissions indicate loss or congestion. In the Ethernet header of these frames the destination MAC is the default gateway for remote destinations.',
  },
  {
    kind: 'table',
    title: 'What a failing capture tells you',
    columns: ['What you see', 'Likely meaning', 'Where to look next'],
    rows: [
      ['ARP requests repeat, no reply', 'Target is down, wrong VLAN or Layer 2 is broken', 'Port status, VLAN, MAC table, cabling'],
      ['DHCP Discover repeats, no Offer', 'No DHCP server is reachable', '`ip helper-address`, VLAN, exhausted pool, server'],
      ['DNS query, no response', 'DNS server unreachable or not answering', 'Route to the DNS server, ACLs, server status'],
      ['DNS reply "No such name"', 'The name does not exist (NXDOMAIN)', 'Spelling and DNS records'],
      ['SYN repeated, never a SYN-ACK', 'Packet or reply dropped before a service answers', 'Routes both ways, ACL or firewall, server up?'],
      ['SYN answered by `[RST, ACK]`', 'Host reachable, nothing listens on that port', 'Service running, correct port number'],
      ['Many retransmissions and duplicate ACKs', 'Packet loss or congestion', 'CRC and error counters, duplex, utilisation'],
    ],
    notes:
      'Use this table to convert what you see in a capture into a next step. If ARP requests repeat without a reply, nobody on the segment owns that address or Layer 2 is broken, so look at port status, VLAN assignment and the MAC address table. If a client sends DHCP Discover packets and never receives an Offer, no server is reachable: check the VLAN, the `ip helper-address` on the gateway if the server is on another subnet, and whether the pool is exhausted. A DNS query without a response suggests that the server is unreachable or not answering, while a response of No such name (NXDOMAIN) means the name itself does not exist, which is a data problem and not a network problem. For TCP, a SYN that is retried and never answered is a path, ACL or server problem, whereas an immediate RST means that the host is up and nothing is listening on that port. Heavy retransmissions and duplicate ACKs indicate packet loss, so check interface errors, duplex and utilisation. Reading a capture this way lets you localise the layer in a few minutes.',
  },
  {
    kind: 'diagram',
    title: 'Scenario: PC1 cannot reach the web server',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', sub: '192.168.10.10', x: 1, y: 2.5 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 3, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: '192.168.10.1', x: 5, y: 2.5 },
        { id: 'r2', icon: 'router', label: 'R2', sub: '10.0.12.2', x: 7, y: 2.5 },
        { id: 'srv', icon: 'server', label: 'Web server', sub: '10.30.30.10', x: 9, y: 2.5 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', toLabel: 'Fa0/1' },
        { from: 'sw1', to: 'r1', fromLabel: 'Gi0/1', toLabel: 'G0/0/0' },
        { from: 'r1', to: 'r2', label: '10.0.12.0/30', fromLabel: 'G0/0/1', toLabel: 'G0/0/0' },
        { from: 'r2', to: 'srv', fromLabel: 'G0/0/1' },
      ],
      groups: [
        { label: 'VLAN 10  192.168.10.0/24', x: 0.2, y: 0.7, w: 5.0, h: 3.2 },
        { label: 'Server LAN  10.30.30.0/24', x: 6.4, y: 0.7, w: 3.4, h: 3.2 },
      ],
      annotations: [{ x: 5, y: 4.6, text: 'Symptom: ping to the gateway works, ping to the server fails', tone: 'bad' }],
    },
    caption: 'Plan: divide and conquer from PC1, then follow the path hop by hop.',
    notes:
      'Here is the end-to-end scenario for the rest of the deck. A user on PC1 in VLAN 10 reports that the intranet web server at 10.30.30.10 is unreachable. The topology has the user LAN, a switch, two routers joined by a /30 link and the server LAN. The symptom statement already contains clues: the user can still reach the local gateway, and the web server is the only target that fails, which suggests the problem is not at Layer 1 or Layer 2 on the user side. Applying divide and conquer, you would ping the gateway first, then the server; applying follow-the-path, you would then walk R1, R2 and the server LAN. As you work, write down what each result proves. A ping to the gateway proves the NIC, cable, switch port, VLAN and gateway address. A failed ping to the server narrows the fault to routing, ACLs or the server itself. Keep the return path in mind: every router on the path needs a route to the source subnet as well as to the destination. The next slide shows the commands.',
  },
  {
    kind: 'cli',
    title: 'Scenario walk-through: layers 1 to 4',
    code: `C:\\> ping 192.168.10.1
Reply from 192.168.10.1: bytes=32 time=1ms TTL=255

C:\\> ping 10.30.30.10
Reply from 192.168.10.1: Destination net unreachable.

R1# show ip route 10.30.30.10
% Network not in table

R2# show ip route 192.168.10.10
Routing entry for 192.168.10.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.1
      Route metric is 0, traffic share count is 1

R1# configure terminal
R1(config)# ip route 10.30.30.0 255.255.255.0 10.0.12.2
R1(config)# end

C:\\> ping 10.30.30.10
Reply from 10.30.30.10: bytes=32 time=3ms TTL=126

R2# show access-lists
Extended IP access list WEB-IN
    10 permit icmp any host 10.30.30.10 (8 matches)
    20 permit tcp any host 10.30.30.10 eq 443 (24 matches)
    30 deny ip any any (12 matches)`,
    highlight: ['Destination net unreachable.', '% Network not in table', 'ip route 10.30.30.0 255.255.255.0 10.0.12.2', '30 deny ip any any (12 matches)'],
    bullets: [
      'Gateway ping works: layers 1 to 3 are fine locally',
      'Unreachable from the gateway address: R1 has no route',
      'Return route on R2 exists, so one static route fixes it',
      'Ping works but HTTP fails: the ACL denies TCP 80 (Layer 4)',
    ],
    notes:
      'Follow the transcript from top to bottom. The ping to the gateway succeeds, with TTL 255 showing that the reply came from the router itself, so layers 1 to 3 are fine locally. The ping to the server returns Destination net unreachable from the gateway address, which is an ICMP message from R1: it received the packet and has no route. `show ip route 10.30.30.10` on R1 confirms the diagnosis with a message saying the network is not in the table. Before changing anything, R2 is checked for the return route to 192.168.10.0/24, and it exists, so the fix is a single static route on R1 pointing at 10.0.12.2. After that, ping works and the TTL of 126 shows two routers on the path. The story continues at Layer 4: the browser still fails, and the access list on R2 permits only ICMP and TCP 443 to the server, so HTTP on port 80 is denied, as the match counter on the deny line shows. This is the pattern of a layered investigation: fix what the evidence proves, test again, and move up one layer when ping works but the application does not.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Know **what each symbol or message proves**: `!` is a round trip, `.` is silence, `U` is an answer saying unreachable, and a row of asterisks in a trace is silence at that hop.',
    bullets: [
      'A router ping uses the **outgoing interface** as source unless you set `source`',
      '`size` plus `df-bit` finds MTU limits and shows `M`',
      'The trace stops at the last good hop: check its routes and the return path',
      '`debug` can overload a router: be specific, then `undebug all`',
      'SYN with no SYN-ACK is a path or ACL issue; RST means port closed',
      'Pick the method: no clue, divide and conquer; topology, follow the path',
    ],
    notes:
      'Cisco builds questions from details of the tool outputs, so a few distinctions earn many points. A period in a ping and a U in a ping are different: silence versus an unreachable message from a router. A ping sourced from the outgoing interface does not test the same thing as a ping sourced from the LAN interface, and that difference is the reason extended ping exists. M means the packet was too big with DF set, and the cure is to find the link with the small MTU. In traceroute, asterisks mean no response at that hop, and the last responding hop is where you start investigating, not necessarily where the fault is. Debug is powerful and can overload a production router, so the right answers mention narrow filters, short duration and undebug all. In captures, the direction and type of the first failing packet decide the answer: ARP without reply, Discover without Offer, SYN without SYN-ACK or SYN with RST. Finally, a method question usually has one best choice: divide and conquer when you have no clue, follow the path when you have a topology, compare configurations when something worked before.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Process: define, gather facts, hypothesise, test, fix one thing, verify, document',
      'Methods: top-down, bottom-up, divide and conquer, follow the path, compare, swap',
      'Ping codes: `!` `.` `U` `Q` `M` `?` `&`; extended ping sets source, size, DF',
      'Traceroute: increasing TTL, ICMP Time Exceeded, asterisks mean silence',
      'Show commands by layer; `show logging`; `debug` with care',
      'Captures: ARP, DHCP DORA, DNS, SYN/SYN-ACK/ACK, retransmissions',
    ],
    notes:
      'Review the toolkit as a chain. Start with a method: define the problem, gather facts, hypothesise, test, fix one thing, verify and document. Choose the approach that fits: top-down, bottom-up, divide and conquer, follow the path, compare configurations or swap components. Use ping to test reachability and extended ping to control the source, size, repeat count and DF bit, and read the symbols: exclamation mark, period, U, Q, M, question mark and ampersand. Use traceroute to find where the path ends, remembering the TTL and ICMP Time Exceeded mechanism and the meaning of asterisks. Use show commands by layer, check interface counters, and read show logging, while treating debug with care. On clients, use ipconfig /all, arp -a, nslookup and tracert. In captures, recognise ARP, DHCP DORA, DNS queries and the TCP handshake, and the signature of each failure. Practise combining these into end-to-end scenarios across layers 1 to 4, because that is how the exam tests them.',
  },
];
