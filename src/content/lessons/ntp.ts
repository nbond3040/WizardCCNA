import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'ntp',
  slides: [
    {
      kind: 'title',
      title: 'NTP: Keeping Every Clock in Step',
      subtitle: 'Stratum, client/server/peer modes, IOS configuration and verification',
      notes:
        'Every router, switch, firewall and server keeps its own clock, and left alone those clocks drift apart — or never get set at all. The **Network Time Protocol (NTP)** fixes this by letting devices learn the time from a trusted source and keep adjusting to it. In this deck you will see why accurate time matters to operations and security, how the **stratum** hierarchy works, which NTP **modes** IOS supports (server, client, symmetric peer and broadcast), and exactly how to configure and verify them with `ntp server`, `ntp master`, `ntp peer` and `ntp source`. You will also learn the clock commands (`clock set`, `clock timezone`, `clock summer-time`) and how to read `show ntp associations`, `show ntp status` and `show clock detail` the way the exam expects. This lesson maps to v1.1 topic 4.2 (configure and verify NTP operating in client and server mode) and to the Network Services and Security domain of v2.0; the scope is the same on both versions.',
    },
    {
      kind: 'bullets',
      title: 'Why accurate time matters',
      bullets: [
        '**Log correlation** — line up events from many devices in true order',
        '**Certificates** — validity dates are checked against the local clock',
        '**AAA** — Kerberos tickets and accounting records depend on time',
        '**Troubleshooting & forensics** — prove what happened first',
        'Scheduled jobs and time-based ACLs fire at the right moment',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.6,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: '14:05:21 UTC', x: 1.5, y: 1 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: '00:12:40 Mar 1 1993', x: 5, y: 1, tone: 'bad' },
          { id: 'r2', icon: 'router', label: 'R2', sub: '13:58:02 UTC', x: 8.5, y: 1, tone: 'warn' },
          { id: 'log', icon: 'server', label: 'Syslog server', sub: 'Which event came first?', x: 5, y: 3.4 },
        ],
        links: [
          { from: 'r1', to: 'log', style: 'dashed', arrow: 'forward' },
          { from: 'sw1', to: 'log', style: 'dashed', arrow: 'forward' },
          { from: 'r2', to: 'log', style: 'dashed', arrow: 'forward' },
        ],
      },
      notes:
        'Imagine a link flap at 14:05 that triggers an OSPF reconvergence, a burst of errors on a switch and a failed VPN tunnel. If each device stamps its logs with a different time, the syslog server shows the events in the wrong order and you chase the wrong root cause. The diagram shows the classic situation: R1 is correct, R2 is seven minutes slow and SW1 still thinks it is **1 March 1993** because nobody ever set its clock. Time also matters for **security**: digital certificates (HTTPS management, VPNs, 802.1X) are only valid between two dates, so a device with a wrong clock may reject a perfectly good certificate as not yet valid or expired. **Kerberos** and other AAA mechanisms reject tickets outside a small time window, and accounting records need accurate start and stop times. On the exam, expect "why is NTP important" questions where the right answers are **log correlation** and **certificate validation**, and the distractors are things like faster routing convergence or preventing switching loops, which have nothing to do with the wall clock.',
    },
    {
      kind: 'cli',
      title: 'A clock nobody set',
      code: `SW1# show clock detail
*00:14:52.117 UTC Mon Mar 1 1993
No time source
SW1# show logging | include UPDOWN
*Mar  1 00:12:40.301: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
*Mar  1 00:12:41.305: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up`,
      highlight: ['*00:14:52.117', 'No time source', '*Mar  1'],
      caption: 'A leading `*` means the time is **not authoritative**.',
      notes:
        'Many devices have no battery-backed hardware calendar, so at boot their software clock starts from a fixed default — on Catalyst switches the famous **00:00 UTC, 1 March 1993** — and simply counts up from there. Routers that do have a calendar load the time from it at boot, but the calendar drifts too and was often never set correctly. `show clock detail` tells you the time and its **source**. A leading asterisk (`*`) means the time is **not authoritative**: nothing trustworthy has set it. A leading period (`.`) means the time was authoritative but NTP is currently not synchronized, and **no symbol** means the clock is authoritative, typically because NTP is synchronized ("Time source is NTP"). Log messages inherit the same marker, which is why so many lab log lines start with `*Mar  1`. Exam tip: do not confuse this asterisk with the asterisk in `show ntp associations`, where `*` marks the server you are synchronized to — the opposite meaning.',
    },
    {
      kind: 'bullets',
      title: 'NTP essentials',
      bullets: [
        'Runs over **UDP port 123** — no connection setup',
        'Client polls each server every **64–1024 s** (IOS default range)',
        'Calculates **offset** and **delay**, then disciplines the local clock',
        'Sources ranked by **stratum**: distance from a reference clock',
        'Always carries **UTC** — time zones are a local display setting',
        'Current version **NTPv4** (RFC 5905); NTPv3 still widely deployed',
      ],
      notes:
        'NTP is a lightweight UDP protocol on **port 123**; there is no handshake, just small request and reply packets. A client does not ask once and stop: it **polls** each configured server repeatedly. IOS starts at a **64-second** poll interval and backs off toward **1024 seconds** as the clock becomes stable, which keeps the overhead tiny. From every exchange the client calculates how far its clock is off (the **offset**) and how long the round trip took (the **delay**), filters out noisy samples and then disciplines its clock — small errors are corrected gradually by adjusting the clock rate, so time keeps moving forward smoothly, which matters for logs and timers. Two facts worth memorizing: NTP always exchanges **UTC**, so configuring a time zone never breaks synchronization, and NTPv4 (RFC 5905) is the current standard, backward compatible with the v3 found on older equipment. A simplified variant, SNTP, is used by small devices that only need basic client functionality.',
    },
    {
      kind: 'diagram',
      title: 'How one NTP exchange works',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'c', label: 'R2 (client)', icon: 'router' },
          { id: 's', label: 'R1 (server)', icon: 'router' },
        ],
        steps: [
          { from: 'c', to: 's', label: 'Request (client mode)', sub: 'UDP 123 · stamped T1 when sent' },
          { note: 'R1 records T2 on arrival and T3 as the reply leaves' },
          { from: 's', to: 'c', label: 'Reply (server mode)', sub: 'carries T1, T2, T3 · R2 records T4 on arrival', tone: 'accent' },
          { note: 'offset = ((T2 − T1) + (T3 − T4)) / 2' },
          { note: 'round-trip delay = (T4 − T1) − (T3 − T2)' },
          { note: 'Repeat every poll interval, filter samples, discipline the clock' },
        ],
      },
      caption: 'Four timestamps let the client cancel out the network delay.',
      notes:
        'Each poll is a single request and reply. The client stamps **T1** as the request leaves; the server stamps **T2** when it arrives and **T3** when its reply leaves; the client stamps **T4** when the reply comes back. With those four numbers the client computes the **round-trip delay** — total elapsed time minus the time the server spent processing — and the **offset**, which assumes the path takes the same time in both directions. Worked example: T1 = 100.000 s on R2, T2 = 100.505 and T3 = 100.506 on R1, and T4 = 100.011 on R2. The delay is 0.011 − 0.001 = **10 ms** and the offset is (0.505 + 0.495) / 2 = **0.5 s**: R2 is half a second behind R1. You will not be asked to calculate offsets on the CCNA, but understanding the mechanism explains why a nearby server with a low, stable delay usually beats a distant one, and why asymmetric paths (different delay in each direction) reduce accuracy.',
    },
    {
      kind: 'diagram',
      title: 'The stratum hierarchy',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'gps', icon: 'box', label: 'GPS receiver', sub: 'stratum 0', x: 1, y: 2.5, tone: 'muted' },
          { id: 'ts', icon: 'server', label: 'TimeSrv', sub: 'stratum 1 · 10.0.0.10', x: 3.3, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'stratum 2 · Lo0 10.255.0.1', x: 5.8, y: 2.5, tone: 'accent' },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'stratum 3 · Lo0 10.255.0.2', x: 8.6, y: 1.2 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'stratum 3', x: 8.6, y: 3.8 },
        ],
        links: [
          { from: 'gps', to: 'ts', label: 'direct', style: 'thick' },
          { from: 'ts', to: 'r1', label: 'NTP' },
          { from: 'r1', to: 'r2', label: 'NTP' },
          { from: 'r1', to: 'sw1', label: 'NTP' },
        ],
        annotations: [{ x: 5, y: 4.5, text: '16 = unsynchronized · 15 = highest usable stratum', tone: 'muted' }],
      },
      caption: 'Each NTP hop adds one to the stratum.',
      notes:
        '**Stratum** is the number of NTP hops between a device and an authoritative reference clock. **Stratum 0** is the reference itself — a GPS receiver, an atomic (cesium or rubidium) clock or a radio clock — and it is never an NTP device on the network; it connects directly to a server. That server is **stratum 1**. Anything that synchronizes to a stratum 1 server becomes **stratum 2**, and so on: here R1 learns time from TimeSrv and is stratum 2, while R2 and SW1 learn it from R1 and are stratum 3. The highest usable stratum is **15**; **16** means unsynchronized, and no client will synchronize to a server advertising stratum 16. A lower stratum does not guarantee a more accurate clock — a nearby, lightly loaded stratum 3 server can beat a distant, congested stratum 1 — but the selection algorithm does favour lower strata. Real designs point every device at two or three internal servers (often core routers) that in turn synchronize to reliable external sources, keeping the whole network within a few hops of the reference.',
    },
    {
      kind: 'table',
      title: 'Stratum values at a glance',
      columns: ['Stratum', 'Meaning', 'Example'],
      rows: [
        ['`0`', 'The reference clock itself — not reachable over the network', 'GPS receiver, atomic clock'],
        ['`1`', 'Server directly attached to a stratum 0 source', 'GPS-disciplined time appliance'],
        ['`2`–`15`', 'Synchronized over the network: server stratum **+ 1**', 'Core router (2), access switch (3)'],
        ['`16`', '==Unsynchronized== — never used as a time source', 'New device, unreachable server'],
        ['`ntp master` default', 'Device claims stratum **8** from its own clock', 'Isolated lab or out-of-band network'],
      ],
      notes:
        'Five rows, five exam facts. Stratum 0 is hardware, not a network node; stratum 1 is the first NTP server; every hop adds one. The maximum valid value is **15**, so a chain can be at most 15 levels deep, and **16** is reserved to mean unsynchronized — you will see it in `show ntp status` ("Clock is unsynchronized, stratum 16") on a device that has not locked onto any server, and next to a server that has not answered yet in `show ntp associations`. The last row matters for configuration questions: `ntp master` without a number makes the router an authoritative source at **stratum 8**, a deliberately mediocre value so that any real upstream source is preferred. If you configure `ntp master 3`, the router advertises stratum 3 and its clients become stratum 4. A common trick question gives you a chain — R3 syncs to R2, which syncs to a stratum 2 server — and asks for the stratum of R3: count the hops and add them (server 2, R2 is 3, R3 is 4).',
    },
    {
      kind: 'table',
      title: 'NTP modes and their IOS commands',
      columns: ['Mode', 'IOS command', 'Behavior'],
      rows: [
        ['Server (authoritative)', '`ntp master [stratum]`', 'Serves time from its own clock; default stratum 8'],
        ['Client (and server downstream)', '`ntp server 10.255.0.1`', 'Polls the server; once synchronized, answers other clients too'],
        ['Symmetric active (peer)', '`ntp peer 10.255.0.2`', 'Two devices exchange time and can synchronize each other'],
        ['Broadcast server', '`ntp broadcast` (interface)', 'Sends time periodically to the LAN broadcast address'],
        ['Broadcast client', '`ntp broadcast client` (interface)', 'Listens for broadcasts instead of polling'],
      ],
      notes:
        'On the exam, client/server mode means what IOS does by default: a router configured with `ntp server` is a **client** of that server, and as soon as it is synchronized it also acts as a **server** for anything that points at it — no extra command is needed. `ntp master` is different: it tells the router to trust **its own internal clock** as a reference, which is useful in labs, isolated networks or as a last-resort fallback, but dangerous if that clock was never set correctly. **Symmetric active mode** (`ntp peer`) is used between devices at a similar level, such as two core routers that each synchronize to different external servers; if one loses its upstream source, it can take time from its peer. **Broadcast mode** reduces configuration on a LAN: the server sends periodic broadcasts out an interface (`ntp broadcast`) and clients configured with `ntp broadcast client` simply listen. It is less accurate because a one-way broadcast gives the client no round trip to measure, so it is rarely used today; a multicast variant also exists.',
    },
    {
      kind: 'cli',
      title: 'Configuring client/server mode',
      code: `R1(config)# ntp server 10.0.0.10 prefer
R1(config)# ntp server 203.0.113.123
R1(config)# ntp source Loopback0
R1(config)# end

R2(config)# ntp server 10.255.0.1
R2(config)# ntp source Loopback0
R2(config)# end

SW1(config)# ntp server 10.255.0.1
SW1(config)# end`,
      highlight: ['prefer', 'ntp source Loopback0', '10.255.0.1'],
      bullets: [
        '`prefer` — use TimeSrv whenever it is a valid candidate',
        '`ntp source` — the loopback survives any single link failure',
        'R2 and SW1 point at the **loopback** of R1, not a physical interface',
      ],
      notes:
        'R1 is configured as a client of two upstream servers: the internal GPS appliance and a public server reachable over the Internet. Several servers are best practice, because NTP compares them and, with three or more, can out-vote one that is wrong (a **falseticker**). The `prefer` keyword tells IOS to choose TimeSrv whenever it is a valid candidate. `ntp source Loopback0` makes R1 send all NTP packets from its loopback address, and R2 and SW1 in turn point at the loopback of R1 (10.255.0.1). A loopback never goes down because of a single link failure, so as long as any path exists, NTP keeps working — and ACLs only need to permit one stable address per device. Notice what you do **not** need: there is no command that turns R1 into a server for R2 and SW1. The moment R1 is synchronized (stratum 2), it answers their requests, and they become stratum 3. For the exam, remember that `ntp server` is entered in **global configuration mode** and takes the IP address (or hostname) of the server you want to learn time from.',
    },
    {
      kind: 'cli',
      title: 'Isolated network: `ntp master`',
      code: `LAB1# clock set 14:05:00 26 Sep 2026
LAB1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
LAB1(config)# ntp master 4
LAB1(config)# end
LAB1# show ntp status
Clock is synchronized, stratum 4, reference is 127.127.1.1
LAB1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
*~127.127.1.1     .LOCL.           3      9     16   377  0.000   0.000  0.232
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
      highlight: ['ntp master 4', 'stratum 4', '127.127.1.1', '.LOCL.'],
      caption: 'The router\'s own clock appears as the pseudo-server `127.127.1.1`.',
      notes:
        'When there is no upstream source at all — a lab, an air-gapped industrial network, a ship — one router can become the authoritative source with `ntp master`. First set its clock as accurately as possible with **`clock set`**, a **privileged EXEC** command (not configuration mode). Then `ntp master 4` tells IOS to treat its internal clock as a reference and advertise **stratum 4**; with no number it would advertise **stratum 8**. In the verification output the internal clock appears as the pseudo-address **127.127.1.1** with reference ID `.LOCL.`, listed with a stratum one lower than the router itself, and `show ntp status` reports "Clock is synchronized, stratum 4, reference is 127.127.1.1". Clients that point at LAB1 become stratum 5. Two cautions: the internal clock drifts, so the authoritative time slowly becomes wrong; and if you add `ntp master` to a router that also has working `ntp server` commands, its high default stratum of 8 keeps the local clock as a fallback that only wins when the real servers disappear — exactly how some designs use it.',
    },
    {
      kind: 'cli',
      title: 'Reading `show ntp associations`',
      code: `R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
*~10.0.0.10       .GPS.            1     37     64   377  0.612   0.108  0.941
+~203.0.113.123   192.0.2.5        2     52     64   377 18.204   0.763  1.203
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
      highlight: ['*~10.0.0.10', '.GPS.', '377'],
      bullets: [
        '`*` **sys.peer** — the server R1 is synchronized to',
        '`+` candidate — healthy backup; `x` falseticker — rejected',
        '`~` configured; `st` is the **server\'s** stratum',
        '`reach 377` (octal) — the last 8 polls were all answered',
        '`poll 64` seconds now; grows toward 1024 s when stable',
      ],
      notes:
        'This is the most useful NTP verification command. Each line is an **association** — a server or peer this device talks to. The first characters are codes explained in the legend: `*` marks the **sys.peer**, the single source the clock is currently synchronized to; `+` is a **candidate** that passed the sanity checks and could take over; `-` is an outlier and `x` a **falseticker** whose time disagrees with the others; `~` means the association was **configured** rather than learned dynamically. The `ref clock` column shows where that server gets its own time: `.GPS.` means TimeSrv is a stratum 1 server with a GPS receiver, while the public server gets its time from 192.0.2.5. `st` is the **server\'s** stratum, so R1 itself is one higher: stratum 2. `reach` is an 8-bit shift register displayed in **octal**; 377 means the last eight polls were answered and 0 means none were. `delay`, `offset` and `disp` are in milliseconds. Exam questions typically ask which server is in use (the `*` line) or what stratum the local device has (sys.peer stratum + 1).',
    },
    {
      kind: 'cli',
      title: 'Reading `show ntp status`',
      code: `R1# show ntp status
Clock is synchronized, stratum 2, reference is 10.0.0.10
nominal freq is 250.0000 Hz, actual freq is 250.0002 Hz, precision is 2**10
ntp uptime is 1235600 (1/100 of seconds), resolution is 4000
reference time is EE624FA1.1A1CAC08 (14:05:21.102 UTC Sat Sep 26 2026)
clock offset is 0.1080 msec, root delay is 0.61 msec
root dispersion is 3.92 msec, peer dispersion is 0.94 msec
loopfilter state is 'CTRL' (Normal Controlled Loop), drift is -0.000000801 s/s
system poll interval is 64, last update was 37 sec ago.

R2# show ntp status
Clock is synchronized, stratum 3, reference is 10.255.0.1`,
      highlight: ['Clock is synchronized', 'stratum 2', 'reference is 10.0.0.10', 'stratum 3'],
      caption: 'The first line answers three questions: synchronized? which stratum? to whom?',
      notes:
        'Where `show ntp associations` lists every server, `show ntp status` summarizes the **local clock**. The first line is what the exam cares about: whether the clock is **synchronized**, the device\'s **own stratum**, and the **reference** — the address of the sys.peer. R1 is synchronized at stratum 2 to 10.0.0.10 (the stratum 1 GPS appliance), and R2, which points at the loopback of R1, reports stratum 3 with reference 10.255.0.1. The remaining lines are details: the reference time is the moment of the last update in NTP\'s 64-bit format (seconds since 1900 in hex, followed by a readable conversion), the clock offset is how far the local clock was from the server at that update, and the root delay and root dispersion describe the whole path back to the stratum 1 source. An unsynchronized device instead shows "Clock is unsynchronized, stratum 16, no reference clock". When a question gives you this output alongside the associations, cross-check them: the reference address is always the line marked `*`, and the local stratum is that line\'s `st` value plus one.',
    },
    {
      kind: 'diagram',
      title: 'Stratum logic: which server wins?',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'a', label: 'Configured servers', sub: 'ntp server / ntp peer', shape: 'pill' },
          { id: 'b', label: 'Replying and synced?', sub: 'stratum 16 → ignored', shape: 'diamond' },
          { id: 'c', label: 'Agrees with others?', sub: 'if not: falseticker (x)', shape: 'diamond' },
          { id: 'd', label: 'Best candidate', sub: 'prefer · lowest stratum · lowest delay' },
          { id: 'e', label: 'sys.peer (*)', sub: 'my stratum = its stratum + 1', tone: 'accent', shape: 'round' },
        ],
      },
      bullets: [
        'Healthy stratum 1 server beats a healthy stratum 3 server',
        '`prefer` wins among valid candidates',
        'No usable server → local clock stays at stratum 16',
      ],
      notes:
        'NTP does not simply use the first server in the configuration. It runs a selection process continuously: servers that do not answer, or that advertise **stratum 16**, are ignored; the remaining ones are compared, and any whose time disagrees with the majority are flagged as **falsetickers**; from the survivors, the best candidate becomes the **sys.peer**. "Best" is dominated by **stratum** (lower wins) and then by the quality of the path — delay and dispersion — unless one server carries the `prefer` keyword, which wins among valid candidates. Worked example: SW3 is configured with `ntp server` pointing at R2 (stratum 3) and at TimeSrv (stratum 1). Both reply and agree, so SW3 chooses TimeSrv and becomes **stratum 2**. If TimeSrv stops answering, SW3 falls back to R2 and becomes **stratum 4**. The selection can change at any time, so a device\'s stratum is not fixed. This is also why at least **three** servers are recommended for critical devices: with only two that disagree, NTP cannot tell which one is wrong.',
    },
    {
      kind: 'cli',
      title: 'NTP authentication',
      code: `R1(config)# ntp authentication-key 1 md5 WizTime2026
R1(config)# ntp trusted-key 1

R2(config)# ntp authentication-key 1 md5 WizTime2026
R2(config)# ntp trusted-key 1
R2(config)# ntp authenticate
R2(config)# ntp server 10.255.0.1 key 1`,
      highlight: ['ntp authenticate', 'trusted-key 1', 'key 1'],
      bullets: [
        '`ntp authentication-key` — key number, `md5`, shared secret',
        '`ntp trusted-key` — which key numbers are acceptable',
        '`ntp authenticate` — require authentication before syncing',
        '`key 1` on `ntp server` — use key 1 with this server',
      ],
      notes:
        'Without authentication, anyone who can send UDP 123 packets to a device could try to feed it a false time — shifting the clock to make certificates expire, to hide an attack in the logs or to break time-based rules. NTP authentication adds a keyed hash (classically **MD5**) to each packet, so a client only accepts time from servers that know the shared secret. On the **client** (R2) four pieces work together: `ntp authentication-key 1 md5 WizTime2026` defines key 1; `ntp trusted-key 1` declares key 1 trustworthy; `ntp authenticate` turns on the requirement that time sources be authenticated; and `key 1` on the `ntp server` command tells R2 which key to use with that server. The **server** (R1) needs the same key number and string so it can sign its replies. A classic mistake is a trusted-key number that does not match the key actually used, which leaves the association unsynchronized. Another: enabling `ntp authenticate` on R1 would make it refuse its own unauthenticated upstream servers. In the running configuration IOS displays the key string in encrypted (type 7) form. For CCNA you need to recognize these commands, not design key rollover.',
    },
    {
      kind: 'cli',
      title: 'Clock commands and time zones',
      code: `R2(config)# clock timezone EST -5 0
R2(config)# clock summer-time EDT recurring
R2(config)# end
R2# show clock
10:05:21.102 EDT Sat Sep 26 2026
R2# show clock detail
10:05:21.618 EDT Sat Sep 26 2026
Time source is NTP
Summer time starts 02:00:00 EST Sun Mar 8 2026
Summer time ends 02:00:00 EDT Sun Nov 1 2026`,
      highlight: ['clock timezone EST -5 0', 'clock summer-time EDT recurring', 'Time source is NTP'],
      bullets: [
        '`clock set 14:05:00 26 Sep 2026` — **privileged EXEC**, for devices without NTP',
        '`clock timezone NAME hours [minutes]` — offset from UTC (global config)',
        '`clock summer-time NAME recurring` — US rules unless dates are given',
        'NTP still exchanges UTC; only the display changes',
      ],
      notes:
        'IOS keeps its clock in **UTC** internally, and NTP always exchanges UTC. The time zone commands only change how the time is **displayed** in `show clock`, in log timestamps (with the `localtime` option) and elsewhere. `clock timezone EST -5 0` names the zone and gives its offset from UTC in hours and optional minutes; `clock summer-time EDT recurring` adds daylight saving time, and with no further arguments IOS applies the **United States** rules (second Sunday in March to first Sunday in November at 02:00). Both are **global configuration** commands. By contrast, **`clock set`** is entered in **privileged EXEC** mode — a favourite trick in which-mode questions — and takes the time followed by the day, month and year (`clock set 14:05:00 26 Sep 2026`; month-first also works). On a device running NTP, a manual setting is overwritten at the next synchronization. `show clock detail` adds the **time source** ("Time source is NTP" here, "No time source" on a clock nobody set) and the summer-time window. Two devices showing different local times but the same UTC time are perfectly synchronized — only their time zones differ.',
    },
    {
      kind: 'cli',
      title: 'When NTP is not working',
      code: `R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
 ~10.255.0.1      .INIT.          16      -     64     0  0.000   0.000 15937.
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured
R2# show ntp status
Clock is unsynchronized, stratum 16, no reference clock
R2# ping 10.255.0.1 source Loopback0
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.255.0.1, timeout is 2 seconds:
Packet sent with a source address of 10.255.0.2
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`,
      highlight: ['.INIT.', 'Clock is unsynchronized, stratum 16', 'Success rate is 100 percent'],
      caption: 'Ping works but NTP does not: suspect a UDP 123 filter, keys or an unsynchronized server.',
      notes:
        'An association that has never received a valid reply shows reference `.INIT.`, stratum **16**, a dash under `when` and **reach 0**, and the local clock reports "Clock is unsynchronized, stratum 16, no reference clock". Work through the causes methodically. First, **reachability from the right source**: because R2 uses `ntp source Loopback0`, test with `ping 10.255.0.1 source Loopback0` — a plain ping from the physical interface can succeed while replies to the loopback have no route back. Here the extended ping works, so routing is fine. Next, **filters**: an ACL or firewall in the path may permit ICMP but drop **UDP 123**; check `show access-lists` for climbing counters on deny entries. Then the **server itself**: if R1 is unsynchronized (stratum 16), R2 will not synchronize to it, so run `show ntp status` on R1. Finally, **authentication**: mismatched key strings, a missing `ntp trusted-key` or a missing `key` on the `ntp server` command all leave the association stuck. And be patient — right after configuration it normally takes a few poll intervals before the `*` appears.',
    },
    {
      kind: 'steps',
      title: 'Deploying NTP in an enterprise',
      steps: [
        { title: 'Choose reliable sources', text: 'Three or four upstream servers: an on-site GPS appliance and/or trusted public servers.' },
        { title: 'Make the core the internal servers', text: '`ntp server` to the upstream sources, `ntp source Loopback0`.' },
        { title: 'Point everything else at the core loopbacks', text: 'Routers, switches, firewalls, WLCs and servers share the same internal sources.' },
        { title: 'Protect the service', text: 'NTP authentication keys, and ACLs that permit UDP 123 only from expected sources.' },
        { title: 'Standardize time display', text: 'The same `clock timezone` everywhere (or UTC) and `service timestamps log datetime msec`.' },
        { title: 'Verify from the edge inward', text: '`show ntp associations` (look for `*`), `show ntp status`, `show clock detail`.' },
      ],
      notes:
        'This is how most enterprises deploy NTP, and it doubles as a checklist for design questions. Start with **reliable references**: a GPS-disciplined appliance on site or several reputable public servers — at least three and ideally four, so that one bad source can be out-voted. Only a handful of core devices should talk to those external sources; they become the **internal stratum 2 servers**, sourcing their packets from loopbacks. Every other device points at those loopbacks, which keeps the number of devices crossing the firewall small and gives you one place to fix problems. **Protect** the service with authentication and with ACLs that allow UDP 123 only from expected sources. Then make timestamps useful: either configure the same local time zone on every device or — as many global companies do — keep everything in UTC, and make sure logs carry the full date and time with milliseconds (`service timestamps log datetime msec`, covered in the syslog lesson). Finally, verify from the edge inward: every device should show a `*` next to one server and a sensible stratum.',
    },
    {
      kind: 'table',
      title: 'NTP command reference',
      columns: ['Command', 'Mode', 'Purpose'],
      rows: [
        ['`ntp server IP [prefer] [key N]`', 'Global config', 'Use IP as a time source (client mode)'],
        ['`ntp master [stratum]`', 'Global config', 'Serve time from the local clock (default stratum 8)'],
        ['`ntp peer IP`', 'Global config', 'Symmetric active association with a peer'],
        ['`ntp source INTERFACE`', 'Global config', 'Source address for all NTP packets'],
        ['`ntp broadcast client`', 'Interface config', 'Listen for NTP broadcasts on this interface'],
        ['`ntp authenticate` / `ntp authentication-key` / `ntp trusted-key`', 'Global config', 'Require and define NTP authentication'],
        ['`clock set hh:mm:ss day month year`', 'Privileged EXEC', 'Set the software clock manually'],
        ['`clock timezone` / `clock summer-time`', 'Global config', 'Local time display rules'],
        ['`show ntp associations` / `show ntp status` / `show clock detail`', 'EXEC', 'Verify servers, sync state and time source'],
      ],
      notes:
        'Use this table for last-minute review. The pattern to notice is the **mode**: every `ntp` command except the broadcast pair is a global configuration command; `ntp broadcast` and `ntp broadcast client` live under an interface because broadcasts are sent and received per interface. The odd one out is **`clock set`**, which is privileged EXEC — you cannot type it at the `R1(config)#` prompt, a detail Cisco likes to test in drag-and-drop items that sort commands by mode. The `show` commands run from privileged EXEC (most also work from user EXEC). Remember which keywords belong to `ntp server`: `prefer` (choose this server when it is valid), `key` (authenticate with this key number), `source` (a per-server source interface) and `version` (force a specific NTP version). When you are unsure what a device is doing, `show running-config | include ntp|clock` gives you the whole time configuration on one screen, and `show ntp associations` plus `show ntp status` tell you whether it is working.',
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'NTP exam traps',
      body: 'Most NTP questions test a handful of numbers and two different meanings of `*`.',
      bullets: [
        'NTP = **UDP 123**; stratum **16** = unsynchronized; **15** = highest valid',
        '`ntp master` with no value = stratum **8**; clients = server stratum **+ 1**',
        '`*` in `show ntp associations` = **sys.peer**; `*` before `show clock` = **not authoritative**',
        '`ntp server` makes a device a client **and** a server for others',
        '`clock set` is **privileged EXEC**; timezone and summer-time are global config',
        'Different time zones do not mean unsynchronized — NTP carries UTC',
        '`.INIT.` + reach 0 = no replies: path, UDP 123 filter, keys or unsynced server',
      ],
      notes:
        'Walk through each trap before the exam. Port and stratum numbers are pure recall, but they appear as distractors everywhere: TCP 123, UDP 161 and stratum 0 are all wrong answers to "which port" or "which stratum means unsynchronized". For stratum arithmetic, always add **one per hop** from the source the device is actually synchronized to — the `*` line — not from the first server in the configuration and not from the lowest stratum listed. The asterisk has **opposite** meanings in two outputs: in `show ntp associations` it is good news (this is the server in use), while in front of `show clock` output it is bad news (the time is not authoritative). Remember that a router configured with `ntp server` also serves time, so "R3 uses R2 as its NTP server" is valid even though R2 has no `ntp master`. Mode questions love `clock set` being privileged EXEC. Time-zone scenarios try to convince you that devices showing 10:05 EDT and 14:05 UTC are out of sync — they are not. And for troubleshooting, reach 0 with `.INIT.` means requests are not being answered.',
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'Accurate time underpins logs, certificates, AAA and troubleshooting',
        'NTP: **UDP 123**, UTC, polling 64–1024 s, stratum 1–15, **16 = unsynced**',
        '`ntp server` (client/server), `ntp master` (own clock, stratum 8), `ntp peer`, broadcast',
        '`ntp source Loopback0` for stable, filter-friendly addressing',
        'Authentication: `authenticate` + `authentication-key` + `trusted-key` + `key`',
        '`clock set` (EXEC), `clock timezone` / `summer-time` (config), `show clock detail`',
        'Verify: `show ntp associations` (`*` = sys.peer) and `show ntp status`',
      ],
      notes:
        'You now have the complete CCNA picture of NTP. Time matters because logs, certificates, AAA and troubleshooting all depend on it. NTP runs on UDP 123, always exchanges UTC and ranks sources by **stratum**, where each hop adds one, 15 is the highest usable value and 16 means unsynchronized. On IOS, `ntp server` makes a device a client that also serves downstream devices, `ntp master` turns the local clock into an authoritative source (stratum 8 by default), `ntp peer` creates a symmetric association between equals, and broadcast mode lets LAN clients simply listen. Source NTP from a loopback, protect it with authentication, and set time zones consistently. To verify, look for the `*` in `show ntp associations`, read the first line of `show ntp status`, and check the time source in `show clock detail`. The next lessons, SNMP and syslog, both rely on the accurate timestamps you have just learned to provide.',
    },
  ],
  flashcards: [
    { id: 'f1', front: 'NTP transport and port', back: 'UDP port **123**.' },
    { id: 'f2', front: 'Stratum 0', back: 'The **reference clock** itself (GPS receiver, atomic or radio clock). It is not an NTP device on the network.' },
    { id: 'f3', front: 'Stratum 1', back: 'An NTP server **directly attached** to a stratum 0 reference clock.' },
    { id: 'f4', front: 'Stratum 16', back: '**Unsynchronized.** Clients never synchronize to a stratum 16 source.' },
    { id: 'f5', front: 'Highest usable NTP stratum', back: '**15**.' },
    { id: 'f6', front: 'Default stratum of `ntp master`', back: '**8** (you can specify 1–15, e.g. `ntp master 4`).' },
    { id: 'f7', front: 'Stratum of an NTP client', back: 'The stratum of its sys.peer (the server it is synchronized to) **+ 1**.' },
    { id: 'f8', front: '`ntp server 10.255.0.1`', back: 'Global config: use 10.255.0.1 as a time source. Once synchronized, the device also **serves** time to its own clients.' },
    { id: 'f9', front: '`ntp peer 10.255.0.2`', back: '**Symmetric active** mode: the two devices exchange time and can synchronize each other.' },
    { id: 'f10', front: '`ntp broadcast client`', back: 'Interface command: listen for NTP broadcasts on that interface instead of polling a server.' },
    { id: 'f11', front: '`ntp source Loopback0`', back: 'Sends all NTP packets from the loopback address — stable during link failures and easy to permit in ACLs.' },
    { id: 'f12', front: '`prefer` keyword on `ntp server`', back: 'Select this server as the sys.peer whenever it is a valid candidate, even if another has a lower stratum.' },
    { id: 'f13', front: '`*` in `show ntp associations`', back: '**sys.peer** — the server the clock is currently synchronized to.' },
    { id: 'f14', front: '`~` and `x` in `show ntp associations`', back: '`~` = configured association. `x` = falseticker (its time disagrees with the others, so it is rejected).' },
    { id: 'f15', front: '`reach` value `377`', back: 'Octal for 11111111: the **last 8 polls** were all answered. `0` means no replies at all.' },
    { id: 'f16', front: '`127.127.1.1` with ref clock `.LOCL.`', back: 'The router\'s own internal clock, used as the reference when `ntp master` is configured.' },
    { id: 'f17', front: 'Association shows `.INIT.`, stratum 16, reach 0', back: 'No valid reply has been received: server unreachable, UDP 123 filtered, authentication mismatch or server unsynchronized.' },
    { id: 'f18', front: 'First line of `show ntp status` when working', back: '"Clock is synchronized, stratum N, reference is IP" — sync state, own stratum and the sys.peer address.' },
    { id: 'f19', front: 'NTP authentication commands on a client', back: '`ntp authenticate`\n`ntp authentication-key 1 md5 KEY`\n`ntp trusted-key 1`\n`ntp server IP key 1`' },
    { id: 'f20', front: '`clock set` — mode and syntax', back: '**Privileged EXEC**: `clock set 14:05:00 26 Sep 2026`. Overwritten by NTP at the next synchronization.' },
    { id: 'f21', front: '`clock timezone EST -5 0`', back: 'Global config: names the zone and its offset from UTC (hours, minutes). Changes the display only.' },
    { id: 'f22', front: '`clock summer-time EDT recurring`', back: 'Global config: enables daylight saving time; with no dates given, IOS applies the **US** rules.' },
    { id: 'f23', front: '`*` or `.` in front of `show clock` output', back: '`*` = time is **not authoritative**. `.` = time is authoritative but NTP is not synchronized. No symbol = authoritative.' },
    { id: 'f24', front: 'Which time does NTP transmit?', back: '**UTC**. Time zones and summer time only change the local display.' },
    { id: 'f25', front: 'IOS NTP poll interval range', back: '**64 to 1024 seconds** — starts at 64 s and grows as the clock stabilizes.' },
    { id: 'f26', front: 'Two operational reasons accurate time matters', back: '**Log correlation** across devices and **certificate validity** checks (also Kerberos/AAA time windows and forensics).' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'Which transport protocol and port does NTP use?',
      options: ['TCP 123', 'UDP 123', 'UDP 161', 'UDP 514'],
      answer: 1,
      difficulty: 1,
      explanation:
        'NTP uses **UDP 123**. NTP never runs over TCP, so TCP 123 is wrong; UDP 161 is the SNMP agent port and UDP 514 is syslog.',
    },
    {
      id: 'q2',
      type: 'single',
      stem: 'What does a stratum value of 16 indicate?',
      options: ['The most accurate reference clock', 'A server directly attached to a GPS receiver', 'A device that is not synchronized', 'The default stratum of `ntp master`'],
      answer: 2,
      difficulty: 1,
      explanation:
        'Stratum **16** means unsynchronized, and no client will use such a source. The reference clock is stratum 0, a server attached to it is stratum 1, and `ntp master` defaults to stratum 8.',
    },
    {
      id: 'q3',
      type: 'input',
      stem: 'R2 is synchronized to an NTP server that reports stratum 2. What stratum does R2 report? (Enter a number.)',
      answers: ['3'],
      placeholder: 'stratum',
      difficulty: 1,
      explanation:
        'A client is always one stratum higher than its sys.peer: 2 + 1 = **3**. Any device that uses R2 as its server would be stratum 4.',
    },
    {
      id: 'q4',
      type: 'multi',
      stem: 'An engineer enters `ntp server 10.255.0.1` on R2. Which two statements are true? (Choose two.)',
      options: [
        'R2 becomes an NTP client of 10.255.0.1',
        'R2 becomes an authoritative stratum 8 server using its own clock',
        'Once synchronized, R2 can also serve time to other devices',
        'R2 must also have `ntp master` configured before it answers clients',
        'R2 switches from UDP to TCP for reliability',
      ],
      answers: [0, 2],
      difficulty: 2,
      explanation:
        '`ntp server` makes R2 a **client** of 10.255.0.1, and once it is synchronized R2 automatically **serves** time to devices that point at it (client/server mode). Stratum 8 from its own clock describes `ntp master`, which is not required for R2 to answer clients. NTP always uses UDP 123.',
    },
    {
      id: 'q5',
      type: 'match',
      stem: 'Match each NTP role to its IOS command.',
      pairs: [
        { left: 'Serve time from the local clock', right: '`ntp master`' },
        { left: 'Client of an upstream server', right: '`ntp server`' },
        { left: 'Symmetric active association', right: '`ntp peer`' },
        { left: 'Listen for NTP broadcasts', right: '`ntp broadcast client`' },
      ],
      difficulty: 2,
      explanation:
        '`ntp master` makes the internal clock authoritative, `ntp server` creates a client association, `ntp peer` creates a symmetric active association in which either side can synchronize the other, and `ntp broadcast client` (interface mode) listens for broadcasts.',
    },
    {
      id: 'q6',
      type: 'single',
      stem: 'In `show ntp associations`, what does an `*` in front of a server address mean?',
      options: [
        'The server is unreachable and its reach value is 0',
        'The server is the sys.peer the clock is synchronized to',
        'The server was learned from a broadcast NTP message',
        'The server is a falseticker that the clock rejected',
      ],
      answer: 1,
      difficulty: 1,
      explanation:
        '`*` marks the **sys.peer**. Unreachable servers show reach 0 and `.INIT.`, `~` indicates a configured association, and falsetickers are marked with `x`.',
    },
    {
      id: 'q7',
      type: 'single',
      stem: 'In which IOS mode do you enter `clock set 14:05:00 26 Sep 2026`?',
      options: ['Global configuration', 'Privileged EXEC', 'Interface configuration', 'Line configuration'],
      answer: 1,
      difficulty: 2,
      explanation:
        '`clock set` is a **privileged EXEC** command. `clock timezone` and `clock summer-time`, by contrast, are global configuration commands — a frequent exam trap.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Which statement describes an NTP stratum 0 device?',
      options: [
        'An NTP server that has no upstream server and uses its own system clock',
        'A reference clock, such as a GPS receiver, attached to a stratum 1 server',
        'A device that has not yet synchronized its clock to a time source',
        'A router configured with `ntp master 0` to act as the time source',
      ],
      answer: 1,
      difficulty: 1,
      explanation:
        'Stratum 0 is the **reference clock** itself — GPS, atomic or radio — attached directly to a stratum 1 server; it does not speak NTP on the network. An unsynchronized device is stratum **16**, not 0. `ntp master` accepts only 1–15, so a router can never claim stratum 0, and a server without an upstream source is either unsynchronized or using `ntp master`.',
    },
    {
      id: 'e2',
      type: 'single',
      stem: 'Refer to the exhibit. What stratum does R3 report in `show ntp status`?',
      exhibit: {
        kind: 'cli',
        text: `R3# show running-config | include ntp
ntp server 10.255.0.1
ntp server 10.255.0.2 prefer
R3# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
+~10.255.0.1      10.0.0.10        2     12     64   377  2.874   0.515  1.340
*~10.255.0.2      10.255.0.1       3     41     64   377  1.311   0.402  1.022
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
      },
      options: ['2', '3', '4', '5'],
      answer: 2,
      difficulty: 3,
      explanation:
        'A device is **one stratum higher than its sys.peer**, the association marked `*`. R3 is synchronized to 10.255.0.2, a stratum 3 server, so R3 is **stratum 4**. The `prefer` keyword explains why R3 chose it even though 10.255.0.1 (stratum 2, a healthy `+` candidate) is available — had R3 used 10.255.0.1 it would be stratum 3. Stratum 2 is the candidate\'s own value, not R3\'s, and 5 adds one hop too many.',
    },
    {
      id: 'e3',
      type: 'input',
      stem: 'An engineer enters `ntp master` with no argument. What stratum does the router advertise? (Enter a number.)',
      answers: ['8'],
      placeholder: 'stratum',
      difficulty: 1,
      explanation:
        'Without a value, `ntp master` claims **stratum 8** from the internal clock; its clients become stratum 9. The deliberately high default means any real upstream source (stratum 1–7) wins when it is available.',
    },
    {
      id: 'e4',
      type: 'multi',
      stem: 'Which two problems are directly caused by inaccurate device clocks? (Choose two.)',
      options: [
        'Valid certificates are rejected as expired or not yet valid',
        'OSPF neighbors fail to form full adjacencies with each other',
        'Log messages from different devices cannot be correlated reliably',
        'Spanning tree creates temporary switching loops on trunk links',
        'DHCP clients receive duplicate IP addresses from the server',
      ],
      answers: [0, 2],
      difficulty: 2,
      explanation:
        'Certificates carry validity dates that are checked against the local clock, so a wrong clock can make a good certificate look expired or not yet valid, and correlating syslog messages across devices depends on consistent timestamps. OSPF hello/dead timers, STP timers and DHCP lease durations are all measured relative to each device\'s own running time, not the wall clock, so a wrong date does not break them.',
    },
    {
      id: 'e5',
      type: 'single',
      stem: 'Refer to the exhibit. Which statement is true?',
      exhibit: {
        kind: 'cli',
        text: `R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
+~10.0.0.10       .GPS.            1     22     64   377  0.702   0.221  0.935
*~10.0.0.11       .GPS.            1     25     64   377  0.388   0.104  0.612
x~203.0.113.123   192.0.2.5        2     40     64   377 21.602 812.470  2.117
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
      },
      options: [
        'R1 is synchronized to 10.0.0.10 and is stratum 1',
        'R1 is synchronized to 10.0.0.11 and is stratum 2',
        'R1 is synchronized to 203.0.113.123 because it has the largest offset',
        'R1 is unsynchronized because one of its servers is a falseticker',
      ],
      answer: 1,
      difficulty: 2,
      explanation:
        'The `*` marks the **sys.peer**, 10.0.0.11, a stratum 1 GPS server, so R1 is **stratum 2**. 10.0.0.10 is a healthy `+` candidate. 203.0.113.123 is marked `x`, a **falseticker** whose time (over 800 ms off) disagrees with the others, so it is excluded — but one bad server does not make R1 unsynchronized. R1 could only be stratum 1 with a directly attached reference clock.',
    },
    {
      id: 'e6',
      type: 'single',
      stem: 'Refer to the exhibit. R2 cannot synchronize to R1 (10.255.0.1). ACL WAN-IN is applied inbound on the R1 interface that connects to R2, and a ping from R2 sourced from Loopback0 to 10.255.0.1 succeeds. What is the cause?',
      exhibit: {
        kind: 'cli',
        text: `R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
 ~10.255.0.1      .INIT.          16      -     64     0  0.000   0.000 15937.
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

R1# show access-lists
Extended IP access list WAN-IN
    10 permit icmp any any (15 matches)
    20 permit ospf any any (1204 matches)
    30 permit tcp 10.1.0.0 0.0.255.255 any eq 22 (88 matches)
    40 deny ip any any (61 matches)`,
      },
      options: [
        'R2 needs `ntp master` so that it can accept time from R1',
        'ACL WAN-IN drops the NTP requests because it does not permit UDP port 123',
        'R1 must be configured with `ntp peer 10.255.0.2` before it answers R2',
        'The OSPF adjacency between R1 and R2 is down',
      ],
      answer: 1,
      difficulty: 3,
      explanation:
        'The association shows `.INIT.`, stratum 16 and reach 0, so R2 has never received a reply. ICMP is permitted (the ping works) and OSPF is clearly running (1204 matches), but NTP requests (**UDP 123**) fall through to the explicit `deny ip any any`, whose counter keeps rising. Adding `permit udp any any eq ntp` (or a more specific entry) before line 40 fixes it. R2 does not need `ntp master`, which would make it a server using its own clock; R1 answers client requests without any `ntp peer` command; and a down OSPF adjacency would also have broken the loopback-sourced ping.',
    },
    {
      id: 'e7',
      type: 'input',
      stem: 'Which global configuration command makes a router send all of its NTP packets using the IP address of interface Loopback0? (Enter the full command.)',
      answers: ['ntp source loopback0', 'ntp source loopback 0', 'ntp source lo0', 'ntp source lo 0', 'ntp source loop0'],
      placeholder: 'command',
      difficulty: 2,
      explanation:
        '`ntp source Loopback0` sets the source interface for all NTP traffic (a per-server form also exists: `ntp server 10.255.0.1 source Loopback0`). Loopbacks stay up whichever physical path is used, so servers and ACLs see one stable address. `ntp server` and `ntp master` do not control the source address.',
    },
    {
      id: 'e8',
      type: 'match',
      stem: 'Match each NTP authentication command to its purpose.',
      pairs: [
        { left: '`ntp authenticate`', right: 'Require authentication before synchronizing' },
        { left: '`ntp authentication-key 1 md5 WizTime`', right: 'Define key 1 and its shared secret' },
        { left: '`ntp trusted-key 1`', right: 'Mark key 1 as acceptable' },
        { left: '`ntp server 10.255.0.1 key 1`', right: 'Use key 1 with this particular server' },
      ],
      difficulty: 2,
      explanation:
        '`ntp authentication-key` defines the key number, hash and secret; `ntp trusted-key` lists which keys are trusted; `ntp authenticate` turns on the requirement to authenticate time sources; and the `key` option on `ntp server` binds a key to that server. A client needs all four; the server needs the matching key to sign its replies.',
    },
    {
      id: 'e9',
      type: 'order',
      stem: 'Order the time sources from most authoritative (top) to least authoritative (bottom).',
      items: [
        'GPS receiver (stratum 0)',
        'Time appliance attached to the GPS receiver',
        'Core router synchronized to the time appliance',
        'Access switch synchronized to the core router',
        'Device that cannot reach any server',
      ],
      difficulty: 2,
      explanation:
        'The GPS receiver is the stratum 0 reference, the appliance attached to it is stratum 1, the core router that synchronizes to the appliance is stratum 2 and the access switch is stratum 3. A device that cannot reach any server is unsynchronized and reports stratum **16**, the least authoritative of all.',
    },
    {
      id: 'e10',
      type: 'categorize',
      stem: 'Drag each command to the IOS mode in which it is entered.',
      categories: ['Privileged EXEC', 'Global configuration', 'Interface configuration'],
      items: [
        { text: '`clock set 14:05:00 26 Sep 2026`', category: 0 },
        { text: '`show ntp associations`', category: 0 },
        { text: '`clock timezone EST -5 0`', category: 1 },
        { text: '`ntp server 10.255.0.1`', category: 1 },
        { text: '`ntp master 4`', category: 1 },
        { text: '`ntp broadcast client`', category: 2 },
      ],
      difficulty: 2,
      explanation:
        '`clock set` and the `show` commands run in **privileged EXEC**. `clock timezone`, `ntp server` and `ntp master` are **global configuration** commands. Broadcast NTP is enabled per interface, so `ntp broadcast client` is an **interface configuration** command.',
    },
    {
      id: 'e11',
      type: 'single',
      stem: 'R1 and R2 use the same NTP server and both show a `*` in `show ntp associations`. `show clock` on R1 displays `10:05:21.102 EDT Sat Sep 26 2026`, while R2 displays `14:05:21.114 UTC Sat Sep 26 2026`. What should the engineer conclude?',
      options: [
        'R2 is four hours fast and must be resynchronized',
        'Both clocks are synchronized; only the configured time zone differs',
        'R1 is using its hardware calendar instead of NTP',
        'NTP cannot synchronize devices that are in different time zones',
      ],
      answer: 1,
      difficulty: 3,
      explanation:
        'NTP always exchanges **UTC**. 10:05 EDT (UTC−4 during daylight saving time) is exactly 14:05 UTC, and both devices have a sys.peer, so they are synchronized — R1 simply has `clock timezone` and `clock summer-time` configured and R2 does not. Time zones affect only the display, so they neither break NTP nor indicate a wrong clock. For easier log correlation, use the same time zone everywhere or keep every device in UTC.',
    },
    {
      id: 'e12',
      type: 'single',
      stem: 'Two core routers each synchronize to a different ISP time server. The engineer wants either router to be able to provide time to the other if it loses its own upstream server. Which command should be configured on each router, pointing at the other?',
      options: ['`ntp server`', '`ntp peer`', '`ntp master 2`', '`ntp broadcast client`'],
      answer: 1,
      difficulty: 2,
      explanation:
        '`ntp peer` creates a **symmetric active** association in which either device can synchronize the other — exactly what two equals backing each other up need. An `ntp server` statement is a one-way client-to-server relationship, `ntp master 2` would make both routers claim stratum 2 from their own internal clocks, and `ntp broadcast client` only listens for a broadcasting server on an interface.',
    },
    {
      id: 'e13',
      type: 'multi',
      stem: 'Which two NTP commands are entered in interface configuration mode? (Choose two.)',
      options: ['`ntp broadcast`', '`ntp broadcast client`', '`ntp server 10.255.0.1`', '`ntp master`', '`ntp source Loopback0`'],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        'Broadcast NTP is sent and received per interface, so both `ntp broadcast` (server side) and `ntp broadcast client` (client side) are **interface** commands. `ntp server`, `ntp master` and `ntp source` are global configuration commands — `ntp source` names an interface but is not entered under one.',
    },
    {
      id: 'e14',
      type: 'multi',
      stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
      exhibit: {
        kind: 'cli',
        text: `SW1# show clock detail
*00:14:52.117 UTC Mon Mar 1 1993
No time source
SW1# show ntp status
Clock is unsynchronized, stratum 16, no reference clock`,
      },
      options: [
        'The time on SW1 is not authoritative',
        'SW1 is not synchronized to any NTP server',
        'SW1 is acting as an NTP master at stratum 16',
        'SW1 is synchronized, but its time zone is misconfigured',
        'SW1 loaded its time from a hardware calendar',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'The leading `*` means the time is **not authoritative**, "No time source" confirms that nothing has set it, and the 1993 date is the default the switch started with at boot. `show ntp status` agrees: unsynchronized, stratum 16. A master reports a stratum of 1–15, a calendar-loaded clock would not say "No time source", and the problem is not a time zone — the date is decades off.',
    },
    {
      id: 'e15',
      type: 'multi',
      stem: 'Which two statements about NTP on Cisco IOS are true? (Choose two.)',
      options: [
        'A router synchronized with `ntp server` also serves time to other devices',
        'NTP uses TCP port 123 so that time updates are delivered reliably',
        'Clients do not synchronize to a server that reports stratum 16',
        'The `ntp master` command is rejected unless a stratum value is given',
        'Configuring `clock timezone` changes the time that NTP sends to clients',
      ],
      answers: [0, 2],
      difficulty: 2,
      explanation:
        'In client/server mode a synchronized client automatically answers other clients, and a server advertising stratum **16** is unsynchronized, so it is never used. NTP uses **UDP** 123, the stratum argument of `ntp master` is optional (default 8), and NTP always sends UTC regardless of the local time zone.',
    },
    {
      id: 'e16',
      type: 'single',
      stem: 'Refer to the exhibit. SW3 is configured with `ntp server 10.255.0.2` and `ntp server 10.0.0.10`. Both servers are reachable, synchronized and agree on the time, and neither command uses `prefer`. What stratum will SW3 most likely report?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 4.4,
          nodes: [
            { id: 'ts', icon: 'server', label: 'TimeSrv', sub: 'stratum 1 · 10.0.0.10', x: 1.2, y: 1.4 },
            { id: 'r1', icon: 'router', label: 'R1', sub: 'stratum 2', x: 4, y: 1.4 },
            { id: 'r2', icon: 'router', label: 'R2', sub: 'stratum 3 · 10.255.0.2', x: 7, y: 1.4 },
            { id: 'sw3', icon: 'switch', label: 'SW3', sub: 'stratum ?', x: 7, y: 3.6, tone: 'accent' },
          ],
          links: [
            { from: 'ts', to: 'r1' },
            { from: 'r1', to: 'r2' },
            { from: 'r2', to: 'sw3' },
            { from: 'r1', to: 'sw3', style: 'dashed' },
          ],
        },
      },
      options: ['2', '3', '4', '16'],
      answer: 0,
      difficulty: 3,
      explanation:
        'Without `prefer`, NTP favours the **lowest stratum** among valid, agreeing candidates. TimeSrv is stratum 1, so SW3 selects it as sys.peer and becomes **stratum 2**. If TimeSrv failed, SW3 would fall back to R2 (stratum 3) and report stratum 4. Stratum 3 would require SW3 to synchronize to R1, which is not one of its configured servers, and 16 applies only when no server is usable.',
    },
    {
      id: 'e17',
      type: 'input',
      stem: 'What stratum value does IOS display for a clock that is not synchronized? (Enter a number.)',
      answers: ['16'],
      placeholder: 'stratum',
      difficulty: 1,
      explanation:
        'IOS shows "Clock is unsynchronized, stratum **16**, no reference clock". The highest usable stratum is 15; 16 is reserved to mean unsynchronized.',
    },
    {
      id: 'e18',
      type: 'single',
      stem: 'Refer to the exhibit. What does the value in the reach column indicate?',
      exhibit: {
        kind: 'cli',
        text: `R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
*~10.255.0.1      10.0.0.10        2     18     64   377  1.204   0.311  1.877
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
      },
      options: [
        'R2 has polled the server 377 times since it booted',
        'The last eight polls of the server were answered',
        'The round-trip delay to the server is 377 ms',
        'The server is currently serving 377 NTP clients',
      ],
      answer: 1,
      difficulty: 2,
      explanation:
        'reach is an 8-bit shift register shown in **octal**; every answered poll shifts in a 1. 377 octal is 11111111 binary, so the last **eight** polls were answered. A new association climbs through 1, 3, 7, 17 … 377, and 0 means no replies. The delay (1.204 ms) is in its own column, and NTP output never shows a server\'s client count.',
    },
    {
      id: 'e19',
      type: 'input',
      stem: 'A lab router is configured with `ntp master 3`. A second router uses `ntp server` to point at it and synchronizes successfully. What stratum does the second router report? (Enter a number.)',
      answers: ['4'],
      placeholder: 'stratum',
      difficulty: 2,
      explanation:
        'The master advertises the stratum it was given, 3, so its client reports **3 + 1 = 4**. Had `ntp master` been entered without a value, the master would be stratum 8 and the client stratum 9.',
    },
    {
      id: 'e20',
      type: 'single',
      stem: 'Refer to the exhibit. NTP stopped synchronizing on R2 after authentication was added. R1 (10.255.0.1) has key 1 configured with the same MD5 string. What is the problem?',
      exhibit: {
        kind: 'cli',
        text: `R2# show running-config | include ntp
ntp authentication-key 1 md5 104D000A061843595F 7
ntp authenticate
ntp trusted-key 2
ntp server 10.255.0.1 key 1`,
      },
      options: [
        'R2 must be configured with `ntp master` when authentication is enabled',
        'R2 uses key 1 with the server, but only key 2 is trusted',
        'The `ntp authenticate` command belongs on R1, not on R2',
        'MD5 cannot be used for NTP authentication',
      ],
      answer: 1,
      difficulty: 3,
      explanation:
        'R2 authenticates its exchanges with 10.255.0.1 using **key 1**, but `ntp trusted-key 2` trusts only key 2, so R2 refuses to synchronize. Changing it to `ntp trusted-key 1` fixes the problem. `ntp authenticate` belongs on the client that requires authenticated time (R2), MD5 is the classic NTP authentication hash, and `ntp master` has nothing to do with authentication. The key string appears encrypted (type 7) in the running configuration, which is normal.',
    },
  ],
};

export default lesson;
