import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Interface & Cable Issues',
    subtitle: 'Reading show interfaces, decoding error counters and fixing speed and duplex problems',
    notes:
      "When users complain that the network is slow or that a link keeps dropping, the cause is very often physical: a damaged cable, interference, a failing transceiver, or two ends that disagree about speed or duplex. CCNA topic 1.4 in v1.1 (and domain 1 of v2.0) asks you to identify interface and cable issues: collisions, errors, duplex mismatches and speed mismatches. The exam does this almost entirely through exhibits: a block of `show interfaces` output with a few counters that are not zero, or a `show interfaces status` table, followed by a question about what is wrong or what to fix. In this deck you will learn to read the status line and what each line/protocol combination means, decode the important error counters (runts, giants, CRC, frame, input and output errors, collisions and late collisions), predict what autonegotiation does when one end is hard-coded, recognize the fingerprint of a duplex mismatch on each side of a link, recover err-disabled ports, and troubleshoot cables, interference and SFPs methodically. The switches here are Catalyst 2960-style, with FastEthernet access ports and Gigabit uplinks.",
  },
  {
    kind: 'bullets',
    title: 'Where interface problems hide',
    bullets: [
      '**Status**: up, down, shut down or err-disabled?',
      '**Speed and duplex**: do both ends agree?',
      '**Counters**: CRC, runts, giants, collisions, late collisions',
      '**Cabling**: damage, length, interference, wrong type',
      '**Optics**: missing, dirty, unsupported or failed SFPs',
      'Always check **both ends** of the link',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', x: 1, y: 2 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Fa0/24 100/full', x: 3.4, y: 2 },
        { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'Fa0/24 auto', x: 6.2, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', x: 8.8, y: 2 },
      ],
      links: [
        { from: 'pc', to: 'sw1', toLabel: 'Fa0/1', label: 'Cat5e' },
        { from: 'sw1', to: 'sw2', fromLabel: 'Fa0/24', toLabel: 'Fa0/24', label: 'duplex mismatch?', tone: 'bad' },
        { from: 'sw2', to: 'r1', fromLabel: 'Gi0/1', toLabel: 'G0/0/0', label: 'fiber SFP', style: 'thick' },
      ],
    },
    notes:
      "Interface problems fall into a handful of categories, and a good troubleshooter checks them in a fixed order. First the **status**: an interface can be up and working, down because nothing usable is connected, administratively shut down, or err-disabled by a protection feature. Next the **speed and duplex** settings, because two ends that disagree produce a link that is up but performs badly. Then the **counters**: every Cisco interface keeps error statistics, and a few non-zero numbers usually point straight at the cause. Finally the physical parts themselves: copper cables that are damaged, too long, badly terminated or routed next to sources of interference, and fiber links with missing, dirty or incompatible optics. In the topology, the SW1 to SW2 link is the one to watch in this lesson: SW1 is hard-coded to 100 Mbps full duplex while SW2 is left on auto, a classic recipe for a duplex mismatch. The golden rule is to look at **both ends** of a link, because many problems show their symptoms on one side while the cause sits on the other side.",
  },
  {
    kind: 'cli',
    title: 'show interfaces: the status section',
    code: `SW1# show interfaces fastethernet0/1
FastEthernet0/1 is up, line protocol is up (connected)
  Hardware is Fast Ethernet, address is 0019.e86a.6f81 (bia 0019.e86a.6f81)
  Description: PC1
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
  input flow-control is off, output flow-control is unsupported
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input never, output 00:00:01, output hang never
  Last clearing of "show interface" counters never`,
    highlight: ['is up, line protocol is up (connected)', 'reliability 255/255', 'Full-duplex, 100Mb/s', 'Last clearing'],
    caption: 'Line status (Layer 1), protocol status (Layer 2), then the operating duplex and speed.',
    notes:
      "`show interfaces` (or `show interfaces fastethernet0/1` for a single port) is the most detailed interface command in IOS. The first line gives two independent states. The **line status** (FastEthernet0/1 is up) is Layer 1: the port detects a signal from the device at the other end. The **line protocol** status (line protocol is up) is Layer 2: the data link is working. On switches the word in parentheses, here **connected**, matches the Status column of `show interfaces status`. The Hardware line shows the port's MAC address, where bia is the burned-in address. BW is the bandwidth in kilobits per second, 100000 Kbit/sec for Fast Ethernet. **Reliability 255/255** means no recent errors; it is a five-minute average, and a value such as 230/255 hints at trouble. The line **Full-duplex, 100Mb/s** shows what the port is actually running, which makes it the most important line for duplex questions. Finally, **Last clearing** tells you how old the statistics are: counters accumulate from boot or from the last `clear counters`, so a large number may be ancient history.",
  },
  {
    kind: 'table',
    title: 'Line and protocol status combinations',
    columns: ['Line status', 'Protocol', 'Switch status', 'Typical cause'],
    rows: [
      ['up', 'up', 'connected', 'Working normally'],
      ['administratively down', 'down', 'disabled', '`shutdown` is configured'],
      ['down', 'down', 'notconnect', 'No or bad cable, far end off or shut, speed mismatch'],
      ['down', 'down', 'err-disabled', 'Port security, BPDU guard, link flap or another feature shut the port'],
      ['up', 'down', 'not expected on LAN ports', 'Layer 2 problem, e.g. serial encapsulation mismatch'],
    ],
    notes:
      "Memorize this table, because the exam shows you one of these lines and asks for the cause. **up/up** is healthy. **administratively down/down** always means someone configured `shutdown`; the fix is `no shutdown`, and nothing physical is wrong. **down/down** with a switch status of **notconnect** means Layer 1 is not working: the cable is unplugged, damaged or the wrong type, the device at the far end is powered off or has its own port shut down, or the two ends are hard-coded to different speeds, which prevents the link from forming at all. **down/down (err-disabled)** looks similar in `show ip interface brief`, but the reason is completely different: the switch itself disabled the port because a feature such as port security or BPDU guard detected a violation. Finally, **up/down** means the physical layer is fine but the data-link protocol is not. It is typical of serial WAN links with an encapsulation mismatch (HDLC on one end, PPP on the other) or failing keepalives, and it is not expected on LAN switch ports. The line status is always listed first and the protocol status second.",
  },
  {
    kind: 'cli',
    title: 'Quick views: interface brief and status',
    code: `SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  10.1.1.11       YES NVRAM  up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  down                  down
FastEthernet0/3        unassigned      YES unset  administratively down down
FastEthernet0/5        unassigned      YES unset  down                  down

SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1     PC1                connected    10         a-full  a-100 10/100BaseTX
Fa0/2     PC2                notconnect   10           auto   auto 10/100BaseTX
Fa0/3                        disabled     1            auto   auto 10/100BaseTX
Fa0/5     Server5            err-disabled 20           auto   auto 10/100BaseTX
Fa0/24    Uplink-SW2         connected    trunk        full    100 10/100BaseTX
Gi0/1     Core               connected    trunk      a-full a-1000 10/100/1000BaseTX
Gi0/2                        notconnect   1            auto   auto Not Present`,
    highlight: ['administratively down', 'a-full', 'err-disabled', 'Not Present'],
    caption: 'The a- prefix means autonegotiated; no prefix means hard-coded.',
    notes:
      "For a quick survey, two commands beat scrolling through `show interfaces`. **`show ip interface brief`** lists every interface with its IP address, line **Status** and **Protocol**; on a switch, physical ports show unassigned because they are Layer 2 ports. **`show interfaces status`** is the switch engineer's favorite: one line per port with its description, status (connected, notconnect, disabled, err-disabled), VLAN or trunk, duplex, speed and media type. The **a-** prefix is the key detail: **a-full** and **a-100** mean the values were **autonegotiated**, while **full** and **100** without a prefix mean they were **hard-coded**. In this output, Fa0/1 negotiated 100/full with its PC; Fa0/2 has no link; Fa0/3 is disabled, which in this command means administratively shut down; Fa0/5 is err-disabled, and notice that the brief view shows it only as down/down; Fa0/24 is hard-coded to 100/full, a warning sign if its neighbor is on auto; Gi0/1 negotiated gigabit full duplex; and Gi0/2 shows Not Present, meaning its SFP slot is empty. One glance at this table answers most status questions on the exam.",
  },
  {
    kind: 'cli',
    title: 'show interfaces: the counters',
    code: `SW1# show interfaces fastethernet0/1 | begin input rate
  5 minute input rate 2000 bits/sec, 3 packets/sec
  5 minute output rate 9000 bits/sec, 6 packets/sec
     10423 packets input, 1478201 bytes, 0 no buffer
     Received 1024 broadcasts (812 multicasts)
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 watchdog, 812 multicast, 0 pause input
     0 input packets with dribble condition detected
     84211 packets output, 6923104 bytes, 0 underruns
     0 output errors, 0 collisions, 1 interface resets
     0 unknown protocol drops
     0 babbles, 0 late collision, 0 deferred
     0 lost carrier, 0 no carrier, 0 pause output
     0 output buffer failures, 0 output buffers swapped out`,
    highlight: ['runts', 'giants', 'input errors', 'CRC', 'frame', 'output errors', 'collisions', 'late collision'],
    caption: 'Receive errors in the input section; collisions and transmit errors in the output section.',
    notes:
      "The lower half of `show interfaces` holds the statistics. The **input** section counts what the port received: packets and bytes, broadcasts and multicasts, then the receive errors, which are **runts**, **giants**, **input errors**, **CRC**, **frame**, **overrun** and **ignored**. The **output** section counts what the port sent and the transmit problems: **output errors**, **collisions**, **late collision**, **deferred** and carrier events. Two rules make these counters useful. First, **input errors describe what arrived**, so they usually point at the cable, at interference or at the transmitter on the far end, while collisions and late collisions describe this port's own transmissions. Second, counters are **cumulative**: a hundred CRC errors since the switch booted a year ago may be harmless, while ten new ones per minute is a live problem. Use `clear counters` (for every interface, or followed by an interface name) and look again after a few minutes to see whether errors are still increasing. The `| begin input rate` filter used here skips straight to the statistics, and `| include CRC` is another handy trick for long outputs.",
  },
  {
    kind: 'table',
    title: 'Error counters decoded',
    columns: ['Counter', 'Meaning', 'Typical causes'],
    rows: [
      ['**Runts**', 'Frames shorter than 64 bytes', 'Duplex mismatch (full side), collisions, bad NIC'],
      ['**Giants**', 'Frames longer than the maximum (1518 bytes)', 'MTU or jumbo-frame mismatch, bad NIC'],
      ['**CRC**', 'FCS check failed: frame corrupted', 'Bad cable, EMI, duplex mismatch (full side)'],
      ['**Frame**', 'CRC error plus a non-whole number of bytes', 'Collisions, bad cable or NIC'],
      ['**Input errors**', 'Total of receive errors', 'Any of the above'],
      ['**Collisions**', 'Transmissions retried after a collision', 'Normal only on half-duplex links'],
      ['**Late collisions**', 'Collision after the first 64 bytes', 'Duplex mismatch (half side), cable too long'],
      ['**Output errors**', 'Frames the port failed to transmit', 'Collisions and interface faults'],
    ],
    notes:
      "This is the decoder ring for exhibit questions. **Runts** are frames shorter than the 64-byte Ethernet minimum; they are almost always fragments left over from collisions, so on a full-duplex port they point to a duplex mismatch. **Giants** exceed the maximum frame size (1518 bytes, or 1522 with an 802.1Q tag); the usual cause is a neighbor sending jumbo frames to a port that is not configured for them. **CRC** errors mean the frame check sequence did not match: the bits were damaged in transit by a bad cable, interference or a duplex mismatch. **Frame** errors are CRC errors with a non-whole number of bytes, typical of collisions and faulty hardware. **Input errors** is the total of all receive problems. On the transmit side, **collisions** are normal only on half-duplex links; full-duplex ports never count them. **Late collisions** happen after the first 64 bytes of a frame have been sent, which should never occur on a correctly built network; they indicate the half-duplex side of a duplex mismatch or a cable run longer than the standard allows. **Output errors** total the frames the port failed to send.",
  },
  {
    kind: 'bullets',
    title: 'Frame size limits: runts, giants and the FCS',
    bullets: [
      'Valid Ethernet frame: **64 to 1518 bytes** (1522 with 802.1Q)',
      '**Runt**: under 64 bytes, usually a collision fragment',
      '**Giant**: over the maximum, usually an MTU mismatch',
      '**CRC**: the receiver\'s FCS calculation does not match',
      'Receive errors point at the far end, the cable or interference',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Dest MAC', size: 6 },
        { label: 'Src MAC', size: 6 },
        { label: 'Type', size: 2 },
        { label: 'Payload', size: 1500, sub: '46–1500 (padded to 46)' },
        { label: 'FCS', size: 4, tone: 'accent', sub: 'CRC-32' },
      ],
      caption: '64 to 1518 bytes from destination MAC to FCS.',
    },
    notes:
      "Knowing the legal frame sizes makes runts and giants easy. A standard Ethernet frame, counted from the destination MAC through the FCS, is **64 to 1518 bytes**: 14 bytes of header, 46 to 1500 bytes of payload (shorter payloads are padded) and a 4-byte **FCS**. An 802.1Q tag adds 4 bytes, raising the maximum to 1522. The 64-byte minimum exists so that, on a half-duplex segment, a sender is still transmitting when news of a collision reaches it; that is also why a collision detected after 64 bytes counts as **late**. The sender computes a CRC-32 over the frame and places it in the FCS field. The receiver repeats the calculation, and if the results differ it discards the frame and increments **CRC**. Receive errors on a port are therefore evidence about the other side of the link: the far-end transmitter, the cable between the two, or interference along the way. A frame that is too short counts as a **runt** and one that is too long counts as a **giant**; both are dropped. Giants usually mean an MTU mismatch, such as a server using jumbo frames facing a switch port set to the standard 1500-byte MTU.",
  },
  {
    kind: 'bullets',
    title: 'Autonegotiation and its fallback rules',
    bullets: [
      'Both ends advertise speeds and duplex modes; best common wins',
      'Cisco default: `speed auto` and `duplex auto`',
      'Hard-coding speed **and** duplex disables autonegotiation',
      'Neighbor on auto then senses the **speed**',
      'Duplex fallback: **half** at 10/100, **full** at 1000',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 6,
      nodes: [
        { id: 'n1', label: 'Neighbor negotiating?', shape: 'diamond', x: 2, y: 3 },
        { id: 'n2', label: 'Best common speed/duplex', shape: 'round', tone: 'good', x: 5.5, y: 1.2 },
        { id: 'n3', label: 'Sense speed', sub: 'parallel detection', x: 5.5, y: 4.4 },
        { id: 'n4', label: 'Half duplex', sub: 'at 10 or 100 Mbps', tone: 'warn', x: 8.4, y: 3.5 },
        { id: 'n5', label: 'Full duplex', sub: 'at 1000 Mbps', tone: 'good', x: 8.4, y: 5.2 },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: 'yes' },
        { from: 'n1', to: 'n3', label: 'no' },
        { from: 'n3', to: 'n4', label: '10/100' },
        { from: 'n3', to: 'n5', label: '1000' },
      ],
    },
    notes:
      "**Autonegotiation** (defined for Fast Ethernet in IEEE 802.3u, and mandatory for 1000BASE-T) lets two ends advertise the speeds and duplex modes they support and choose the best common one. Cisco switch ports default to `speed auto` and `duplex auto`, and when both ends negotiate, a modern link almost always ends up at the highest common speed with full duplex. Trouble starts when one end does not negotiate. On a Cisco switch, configuring **both** `speed` and `duplex` manually disables autonegotiation on that port. The other end, still on auto, then hears no negotiation and falls back. **Speed:** it senses the speed from the incoming signal, called parallel detection, which works for 10 and 100 Mbps; if it cannot, it uses its slowest supported speed. **Duplex:** it cannot sense duplex, so it assumes ==half duplex at 10 or 100 Mbps== and full duplex at 1000 Mbps and above. That rule is why the classic scenario, one side hard-coded to 100/full and the other on auto, produces 100/full facing 100/half. Best practice is simple: leave both ends on auto, or hard-code both ends to identical values.",
  },
  {
    kind: 'table',
    title: 'Predicting the result of each combination',
    columns: ['Side A', 'Side B', 'Result', 'Problem?'],
    rows: [
      ['auto', 'auto', 'Both 100/full', 'None'],
      ['100/full (hard-coded)', 'auto', 'A 100/full, B a-100 **a-half**', '**Duplex mismatch**'],
      ['10/full (hard-coded)', 'auto', 'A 10/full, B a-10 **a-half**', '**Duplex mismatch**'],
      ['100/half (hard-coded)', 'auto', 'Both 100/half', 'Works; collisions are normal'],
      ['100/full (hard-coded)', '100/full (hard-coded)', 'Both 100/full', 'None'],
      ['100 (hard-coded)', '10 (hard-coded)', 'Link never comes up', '**Speed mismatch**: down/down'],
    ],
    caption: 'Assumes 10/100 copper ports. Leave both ends on auto or hard-code both ends identically.',
    notes:
      "Use this table to predict any combination the exam throws at you; it assumes 10/100 copper ports. With **auto on both ends**, the ports negotiate the best common mode, 100 Mbps full duplex. If one end is **hard-coded to 100/full** and the other is on auto, the auto side senses 100 Mbps but must assume half duplex, so `show interfaces status` shows **a-100** and **a-half** on that side: a **duplex mismatch**. The same happens at 10 Mbps. If the hard-coded side is set to **100/half**, the auto side also lands on half duplex, so the two ends agree; the link works, but it is half duplex, and collisions on it are normal rather than a fault. When **both ends are hard-coded identically**, there is nothing to negotiate and the link works. When **both ends are hard-coded to different speeds**, the link cannot come up at all and both ports show down/down and notconnect: a **speed mismatch**. Notice the asymmetry: a speed mismatch is loud (no link at all), while a duplex mismatch is quiet (the link is up and pings usually succeed), which is exactly why duplex mismatches survive for so long in production networks.",
  },
  {
    kind: 'cli',
    title: 'Duplex mismatch: the full-duplex side',
    code: `SW1# show interfaces fastethernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Hardware is Fast Ethernet, address is 0019.e86a.6f98 (bia 0019.e86a.6f98)
  Description: Uplink-SW2
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
     reliability 243/255, txload 3/255, rxload 5/255
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
...
     1841206 packets input, 212847331 bytes, 0 no buffer
     Received 20431 broadcasts (11872 multicasts)
     1382 runts, 0 giants, 0 throttles
     3201 input errors, 1807 CRC, 12 frame, 0 overrun, 0 ignored
...
     1598827 packets output, 187310442 bytes, 0 underruns
     0 output errors, 0 collisions, 1 interface resets
     0 babbles, 0 late collision, 0 deferred`,
    highlight: ['Full-duplex', '1382 runts', '1807 CRC', '0 collisions', 'reliability 243/255'],
    caption: 'Full duplex with runts and CRC errors but zero collisions: the full-duplex side of a mismatch.',
    notes:
      "Here is SW1, the side that was hard-coded to 100 Mbps full duplex. The link is **up/up** and the duplex line says Full-duplex, so at first glance nothing is wrong. The counters tell the story: **1382 runts** and **1807 CRC errors**, which together with 12 frame errors make 3201 input errors, and reliability has dropped to 243/255. Meanwhile the output side shows **0 collisions** and **0 late collisions**, as it must: a full-duplex port never listens before transmitting, so it never counts a collision. Where do the runts come from? The half-duplex neighbor stops transmitting in the middle of a frame whenever it senses SW1's traffic, which it believes is a collision. SW1 receives those truncated fragments as runts, and damaged frames with bad FCS values as CRC errors. So on the exam, a port that shows **full duplex with runts and CRC errors but no collisions** is the full-duplex side of a duplex mismatch, especially when its configuration shows `speed` and `duplex` hard-coded. Users experience slow, stalling transfers, because TCP must detect and retransmit every lost segment.",
  },
  {
    kind: 'cli',
    title: 'Duplex mismatch: the half-duplex side',
    code: `Sep 26 10:14:07.311: %CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on FastEthernet0/24 (not full duplex), with SW1 FastEthernet0/24 (full duplex).
SW2# show interfaces fastethernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Hardware is Fast Ethernet, address is 0022.90c4.1a18 (bia 0022.90c4.1a18)
  Description: Uplink-SW1
  Half-duplex, 100Mb/s, media type is 10/100BaseTX
...
     1604112 packets input, 188020114 bytes, 0 no buffer
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
...
     1843559 packets output, 213501822 bytes, 0 underruns
     912 output errors, 2877 collisions, 2 interface resets
     0 babbles, 912 late collision, 1735 deferred`,
    highlight: ['DUPLEX_MISMATCH', 'Half-duplex', '2877 collisions', '912 late collision'],
    caption: 'Half duplex with collisions and late collisions: the other end of the same mismatch.',
    notes:
      "Now the other end. SW2 was left on auto, heard no negotiation from SW1, sensed 100 Mbps and fell back to **half duplex**, exactly as the rules predict. Its input counters are clean, because SW1 always sends complete frames. The damage shows on the **output** side: thousands of **collisions**, **912 late collisions** and many **deferred** frames. A half-duplex port listens while it talks, so every time SW1 transmits while SW2 is sending, SW2 detects what it believes is a collision. When that happens after the first 64 bytes of the frame, it is a **late collision**, something a correctly cabled half-duplex network should never produce. Deferred frames are frames SW2 held back because it sensed SW1's signal on the wire before starting. CDP helps as well: the two switches exchange their duplex setting in CDP messages, so IOS logs `%CDP-4-DUPLEX_MISMATCH` on the console and names both ports. The fingerprint to remember is **half duplex plus late collisions** on one side, and **full duplex plus CRC errors and runts** on the other. Either output alone is enough to diagnose the problem on the exam.",
  },
  {
    kind: 'diagram',
    title: 'Why a mismatch produces these counters',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sw2', label: 'SW2 Fa0/24 (half)', icon: 'switch' },
        { id: 'sw1', label: 'SW1 Fa0/24 (full)', icon: 'switch' },
      ],
      steps: [
        { from: 'sw2', to: 'sw1', label: 'SW2 starts sending a frame', sub: 'half duplex: listens while it talks' },
        { from: 'sw1', to: 'sw2', label: 'SW1 sends at the same time', sub: 'full duplex: never waits', tone: 'accent' },
        { note: 'SW2 senses a collision; after 64 bytes it is a late collision', tone: 'warn' },
        { from: 'sw2', to: 'sw1', label: 'Truncated frame + jam signal', sub: 'SW1 counts a runt or CRC error', tone: 'bad', dashed: true },
        { note: 'Late-collision frames are not retried by Ethernet: TCP must recover, throughput collapses', tone: 'bad' },
      ],
    },
    caption: 'Each side counts a different symptom of the same disagreement.',
    notes:
      "Why does a duplex mismatch produce these particular counters? Follow one exchange. SW2, in half duplex, starts sending a frame and, following CSMA/CD, keeps listening while it transmits. SW1, in full duplex, has no reason to wait, so it sends its own frame at the same moment on its own pair of wires. SW2 hears incoming signal while transmitting and concludes that a collision has occurred. If that happens within the first 64 bytes, it counts a normal collision and retries later; if it happens later in the frame, it counts a **late collision**. Either way it stops mid-frame and sends a jam signal. SW1 receives the truncated frame and counts a **runt** or a **CRC** error. Frames lost to late collisions are not retried by the Ethernet hardware, so recovery falls to TCP, whose timeouts and retransmissions make throughput collapse, especially under heavy load. Light traffic, such as a few pings, usually gets through, which is why a duplex mismatch can hide for months. The fix is never on one side only: both ends must agree.",
  },
  {
    kind: 'cli',
    title: 'Fixing it: speed and duplex commands',
    code: `SW1# configure terminal
SW1(config)# interface fastethernet0/24
SW1(config-if)# speed auto
SW1(config-if)# duplex auto
SW1(config-if)# end
SW1# clear counters fastethernet0/24
Clear "show interface" counters on this interface [confirm]
SW1# show interfaces fastethernet0/24 status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/24    Uplink-SW2         connected    trunk      a-full  a-100 10/100BaseTX`,
    highlight: ['speed auto', 'duplex auto', 'a-full  a-100'],
    bullets: [
      'Preferred: `speed auto` + `duplex auto` on both ends',
      'Alternative: `speed 100` + `duplex full` on **both** ends',
      'Then `clear counters` and confirm errors stay at zero',
    ],
    notes:
      "There are two correct fixes, and both involve **both ends** of the link. The preferred one is to return the hard-coded side to **autonegotiation** with `speed auto` and `duplex auto`, as shown on SW1. With both ends negotiating again, the link settles at 100 Mbps full duplex, and `show interfaces status` confirms it with **a-full** and **a-100**. The alternative is to hard-code **both** ends to the same values, for example `speed 100` and `duplex full` on SW1 and on SW2; some organizations do this for links to devices that negotiate badly. What never fixes it is a change that leaves the two ends different. After the change, run `clear counters` on the interface so that old errors do not confuse you, generate some traffic, and check that CRC errors, runts and late collisions stay at zero. The `speed` command accepts the speeds the port supports (10, 100 or 1000) or auto, and `duplex` accepts half, full or auto. On many Cisco switches, Auto-MDIX works only when speed and duplex are both set to auto, one more reason to prefer autonegotiation.",
  },
  {
    kind: 'cli',
    title: 'err-disabled: when the switch shuts a port',
    code: `Sep 26 10:31:52.004: %PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/5, putting Fa0/5 in err-disable state
SW1# show interfaces status err-disabled

Port      Name               Status       Reason               Err-disabled Vlans
Fa0/5     Server5            err-disabled psecure-violation
SW1# configure terminal
SW1(config)# interface fastethernet0/5
SW1(config-if)# shutdown
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# errdisable recovery cause psecure-violation
SW1(config)# errdisable recovery interval 300`,
    highlight: ['err-disable state', 'psecure-violation', 'shutdown', 'errdisable recovery'],
    caption: 'Fix the cause first, then bounce the port with shutdown / no shutdown or let errdisable recovery do it.',
    notes:
      "An **err-disabled** port has been shut down by the switch itself because a feature detected a condition it considers dangerous. Common causes are a **port security** violation in shutdown mode, **BPDU guard** receiving a BPDU on a PortFast edge port, **UDLD** detecting a one-way link, an **EtherChannel** misconfiguration, excessive **link flapping**, or an unsupported transceiver (reason gbic-invalid). The console log names the reason, and `show interfaces status err-disabled` lists every affected port with it. The port shows down/down (err-disabled) and passes no traffic. Recovery has two steps. First fix the cause: remove the rogue device, correct the configuration or replace the SFP; otherwise the port is simply disabled again. Then re-enable the port with `shutdown` followed by `no shutdown`; `no shutdown` alone does nothing, because the port was never administratively shut. For automatic recovery, `errdisable recovery cause` enables it for a specific reason, and `errdisable recovery interval` sets the timer, **300 seconds** by default. Automatic recovery is **disabled** by default for every cause, a detail the exam likes to test.",
  },
  {
    kind: 'compare',
    title: 'Speed mismatch vs duplex mismatch',
    left: {
      heading: 'Speed mismatch',
      tone: 'bad',
      bullets: [
        'Both ends hard-coded to different speeds',
        'Link never comes up',
        'Status **down/down**, `notconnect`',
        'No counters increase: no frames flow',
        'Fix: same speed on both ends, or auto',
      ],
    },
    right: {
      heading: 'Duplex mismatch',
      tone: 'warn',
      bullets: [
        'One end full duplex, the other half',
        'Link is **up/up**; pings often succeed',
        'Slow transfers, worse under load',
        'Full side: CRC, runts. Half side: late collisions',
        'Fix: auto on both ends, or identical settings',
      ],
    },
    notes:
      "These two problems are often confused, but they behave in opposite ways. A **speed mismatch** happens when both ends are hard-coded to different speeds, for example 100 on one side and 10 on the other. The signaling is incompatible, so the link never comes up: both ports show down/down and notconnect, and because no frames flow, no error counters increase. It is loud and easy to find. A **duplex mismatch** happens when one end runs full duplex and the other half duplex, most often because one side is hard-coded and the other fell back to half. The link comes up, the status is up/up, and small tests such as a ping succeed, so it is easy to miss. The evidence is in the counters: CRC errors and runts on the full-duplex side, collisions and late collisions on the half-duplex side, and complaints of slow, stalling transfers that get worse under load. For both problems the fix is the same idea: set both ends to auto, or hard-code both ends identically. A speed mismatch cannot happen when one side is on auto, because autonegotiation senses the speed of the other end.",
  },
  {
    kind: 'table',
    title: 'Physical-layer problems and their fingerprints',
    columns: ['Problem', 'Typical symptoms', 'What to check'],
    rows: [
      ['Damaged or badly terminated cable', 'CRC and input errors, flapping link, or no link', 'Swap the patch cord; test the cable'],
      ['EMI from motors, power cables, lighting', 'CRC errors that rise when equipment runs', 'Re-route, use shielded cable or fiber'],
      ['UTP run longer than 100 m', 'CRC errors, drops, late collisions in half duplex', 'Measure; add a switch or use fiber'],
      ['Wrong cable type', 'No link (notconnect) or unstable link', 'Pinout, category, fiber type, Auto-MDIX'],
      ['Missing, dirty, mismatched or failed SFP', 'Not Present, no link, errors or err-disabled', '`show interfaces transceiver`; clean or replace'],
      ['Far-end device off or port shut', 'down/down, notconnect', 'Check the other end of the link'],
    ],
    caption: 'Receive errors usually point at the cable, the far-end transmitter or interference.',
    notes:
      "When speed and duplex are correct but errors persist, suspect the physical layer. **Damaged or badly terminated cables**, such as a crushed run, a kinked patch cord or pairs untwisted too far at the jack, cause CRC and input errors, links that flap up and down, or no link at all; swapping the patch cord is the fastest test, and a cable tester or the switch's built-in cable diagnostics can locate the fault. **EMI** from power cables, motors, elevators or fluorescent lighting induces noise in copper pairs, so CRC errors climb whenever the machinery runs; re-route the cable, use shielded cable, or switch to fiber, which is immune to EMI. **Runs longer than 100 m** weaken the signal and, in half duplex, cause late collisions. The **wrong cable type**, such as a straight-through cable between two switches with Auto-MDIX disabled, Cat3 cable for Fast Ethernet, or single-mode fiber on a multimode optic, usually prevents the link from forming. **SFP problems** include an empty slot (Not Present), a dirty connector, different optic types at the two ends, a failed module, or an unsupported one that err-disables the port. `show interfaces transceiver` displays optical power levels for modules that support monitoring.",
  },
  {
    kind: 'steps',
    title: 'Interface troubleshooting workflow',
    steps: [
      { title: 'Check status', text: '`show interfaces status`: connected, notconnect, disabled or err-disabled?' },
      { title: 'Clear admin and err-disabled states', text: '`no shutdown`, or find the err-disable reason before bouncing the port.' },
      { title: 'Compare speed and duplex on both ends', text: 'Look for a-half facing a hard-coded full, or different fixed speeds.' },
      { title: 'Read the counters', text: 'CRC, runts, giants, collisions and late collisions in `show interfaces`.' },
      { title: 'Clear and watch', text: '`clear counters`, then check whether errors are still increasing.' },
      { title: 'Swap physical parts', text: 'Patch cord, cable run, SFP, then switch port, one at a time.' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 's1', label: 'Status', shape: 'pill' },
        { id: 's2', label: 'Speed/duplex' },
        { id: 's3', label: 'Counters' },
        { id: 's4', label: 'Clear & watch' },
        { id: 's5', label: 'Swap parts', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "Put everything together into a repeatable workflow. **Check status first**, because it tells you which part of this lesson applies: disabled means configuration, notconnect means Layer 1, err-disabled means a feature took action, and connected with user complaints means you need the counters. **Handle administrative and err-disabled states** before anything else, and always find the err-disable reason before bouncing the port. **Compare speed and duplex on both ends**; an a-half port facing a hard-coded full port is the single most common finding in exam exhibits. **Read the counters** and map them to causes: CRC and runts on a full-duplex port, late collisions on a half-duplex port, giants from MTU mismatches, and CRC errors alone from cabling or interference. **Clear the counters and watch**, because only errors that keep increasing matter. Finally, **swap physical parts one at a time**: patch cord, then cable run, then transceiver, then switch port, so that you know exactly which component was faulty. Working in this order avoids the classic mistake of replacing cables to fix what is really a configuration problem, and it mirrors how exam scenarios expect you to reason.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: interfaces and cables',
    body: '==Late collisions = the half-duplex side==; CRC errors and runts with no collisions = the full-duplex side of a duplex mismatch.',
    bullets: [
      'administratively down/down = `shutdown`; fix with `no shutdown`',
      'down/down notconnect = cable, far end or speed mismatch',
      'err-disabled: remove the cause, then shutdown / no shutdown',
      'Hard-coded 100/full facing auto: auto side falls back to **half**',
      'Fallback duplex is **full** at 1000 Mbps',
      'Duplex mismatch keeps the link up; speed mismatch takes it down',
      'Counters are cumulative: clear them, then watch',
    ],
    notes:
      "These are the points Cisco tests most often. Match the **counter to the side of a duplex mismatch**: late collisions and collisions on the half-duplex side, CRC errors and runts on the full-duplex side. A full-duplex port never counts collisions, so any non-zero collision count tells you the port is running half duplex. Know the **status combinations** cold: administratively down means `shutdown`; down/down notconnect means the cable, the far end or a speed mismatch; err-disabled means a feature shut the port, and it is fixed with shutdown and no shutdown after the cause is removed; and up/down is a Layer 2 problem, typical of serial links. Know the **fallback rules**: when negotiation fails, the speed is sensed but duplex defaults to half at 10 and 100 Mbps and full at 1000 Mbps, so hard-coding only one side of a Fast Ethernet link to full duplex creates a mismatch. A duplex mismatch leaves the link up, while a speed mismatch takes it down. Finally, counters are cumulative, so the best next step in many scenarios is `clear counters` followed by monitoring, not replacing hardware.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Line status = Layer 1; protocol status = Layer 2',
      'disabled = shutdown; notconnect = no link; err-disabled = feature',
      'CRC + runts: full side of a mismatch; late collisions: half side',
      'Giants: MTU mismatch; CRC alone: cable, EMI or far end',
      'Fallback: sense the speed; half at 10/100, full at 1000',
      'Fix mismatches on both ends: auto/auto or identical settings',
      'Clear counters, watch, then swap parts one at a time',
    ],
    notes:
      "Interface troubleshooting is pattern recognition. The first line of `show interfaces` separates Layer 1 (line status) from Layer 2 (protocol status), and the switch status word tells you whether a port is connected, notconnect, disabled or err-disabled. The counters then point to the cause: runts and CRC errors on a full-duplex port with no collisions, or late collisions on a half-duplex port, mean a duplex mismatch; giants mean an MTU mismatch; CRC errors alone on a correctly negotiated link mean cabling, interference or a failing transmitter at the far end. Autonegotiation explains how mismatches arise: when one end is hard-coded, the other senses the speed but falls back to half duplex at 10 and 100 Mbps. Speed mismatches stop the link completely, while duplex mismatches let it limp along. Fix both by making the two ends agree. Recover err-disabled ports only after removing the cause, with shutdown and no shutdown or with errdisable recovery. And always clear the counters and watch them before you start replacing cables and transceivers.",
  },
];
