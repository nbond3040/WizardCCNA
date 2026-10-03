import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Syslog & Logging',
    subtitle: 'Reading, filtering and exporting the event messages your devices generate',
    notes:
      'Every router and switch constantly narrates what it is doing: interfaces going up and down, configurations being saved, neighbors forming, security violations firing. Those narrations are **log messages**, and **syslog** is the standard way to label them, filter them and ship them to a central server. In this deck you will learn to read a message such as `%LINK-3-UPDOWN` field by field, memorize the eight **severity levels** (0 to 7) together with the rule that a threshold includes every more-severe level, and configure the four destinations: console, monitor (VTY), buffer and a remote server on **UDP 514**. Syslog is an exam objective in both versions of the 200-301 (4.5 in v1.1). It appears as direct recall questions, as level arithmetic ("which messages does this setting show?") and as troubleshooting puzzles where a `show logging` exhibit is the only clue. The material is identical in v1.1 and v2.0, so nothing in this deck is version-tagged.',
  },
  {
    kind: 'bullets',
    title: 'Why devices log events',
    bullets: [
      'Messages record **what happened and when**: link flaps, config changes, neighbor changes',
      'A central **syslog server** gathers logs from every device into one searchable timeline',
      'Logs are the first stop when **troubleshooting** and the evidence trail for **security** reviews',
      'Syslog is both a **message format** and a **transport** (UDP 514)',
      'Local logs can vanish on reload; logs on a server survive',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3.6,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 0.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 1.2, y: 2.7 },
        { id: 'srv', icon: 'server', label: 'Syslog server', sub: '192.168.1.50', x: 6.4, y: 1.8, tone: 'accent' },
      ],
      links: [
        { from: 'r1', to: 'srv', label: 'UDP 514', arrow: 'forward' },
        { from: 'sw1', to: 'srv', label: 'UDP 514', arrow: 'forward' },
      ],
    },
    notes:
      'Think about a switch that reboots at 3 a.m. Without logs you only know that users complained; with logs you can see the restart message, the burst of `%LINK-3-UPDOWN` events as ports came back, and the exact time each happened. That is why every Cisco device generates messages for significant events, and why production networks forward them to a **syslog server** instead of relying on whatever is still in the memory of the device. A central server gives you one searchable timeline across routers, switches, firewalls and even Linux hosts, which is how you correlate a link failure on one device with routing changes on another. For the exam, remember what syslog is for: event notification and record keeping. It does not configure devices, and it is not the polling protocol; that is SNMP. Accurate clocks (NTP) are what make a combined timeline trustworthy.',
  },
  {
    kind: 'cli',
    title: 'Anatomy of a log message',
    code: `R1# show logging | begin Log Buffer
Log Buffer (16384 bytes):

000018: Oct  3 14:05:10.397: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up
000019: Oct  3 14:05:11.402: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to up
000020: Oct  3 14:06:42.115: %SYS-5-CONFIG_I: Configured from console by console`,
    highlight: ['%LINK-3-UPDOWN', '%LINEPROTO-5-UPDOWN', '%SYS-5-CONFIG_I'],
    caption: 'Layout: sequence number, timestamp, then %FACILITY-SEVERITY-MNEMONIC and the description.',
    bullets: [
      '**Sequence number** (optional): `000019:` needs `service sequence-numbers`',
      '**Timestamp**: `Oct  3 14:05:11.402` from `service timestamps log datetime msec`',
      '**%FACILITY**: `LINEPROTO` is the IOS module that raised the event',
      '**-SEVERITY-**: `5` means notifications; lower is worse',
      '**MNEMONIC**: `UPDOWN` is a short code naming this exact message',
      '**Description**: the details, such as interface, neighbor or user',
    ],
    notes:
      'Every IOS message follows the same layout: an optional **sequence number**, a **timestamp**, then the part that starts with a percent sign, `%FACILITY-SEVERITY-MNEMONIC:`, followed by a free-text **description**. Take `%LINEPROTO-5-UPDOWN`. LINEPROTO is the facility, the IOS module that raised the event. The 5 is the severity (notifications). UPDOWN is the mnemonic, a short code that names this exact message. The description gives the specifics: which interface and which new state. Because the first three fields are stable, they are what you search and filter on, for example `show logging | include %LINK-3`. One vocabulary trap: in the syslog protocol itself, **facility** also means a category label (local0 to local7) carried in the packet header, and IOS uses **local7** by default (`logging facility` changes it). On the exam, the word facility in a `%XXXX-N-YYYY` question means the module name.',
  },
  {
    kind: 'table',
    title: 'Severity levels 0 to 7',
    columns: ['Level', 'Keyword', 'Meaning', 'Typical message'],
    rows: [
      ['**0**', '`emergencies`', 'System is unusable', 'Rare; the device is failing'],
      ['**1**', '`alerts`', 'Immediate action needed', 'Rare; serious hardware condition'],
      ['**2**', '`critical`', 'Critical condition', '`%SPANTREE-2-BLOCK_BPDUGUARD`, `%PORT_SECURITY-2-PSECURE_VIOLATION`'],
      ['**3**', '`errors`', 'Error condition', '`%LINK-3-UPDOWN`'],
      ['**4**', '`warnings`', 'Warning condition', '`%CDP-4-DUPLEX_MISMATCH`'],
      ['**5**', '`notifications`', 'Normal but significant', '`%LINEPROTO-5-UPDOWN`, `%SYS-5-CONFIG_I`'],
      ['**6**', '`informational`', 'Informational only', '`%SYS-6-LOGGINGHOST_STARTSTOP`'],
      ['**7**', '`debugging`', 'Debug output', 'Output of `debug` commands'],
    ],
    caption: 'Memory aid: **E**ager **A**dmins **C**reate **E**asy **W**orking **N**etworks **I**n **D**atacenters. ==Lower number = more severe.==',
    notes:
      'Memorize this table cold; it is the most testable thing in the whole lesson. There are eight levels numbered **0 to 7**, and the numbering runs opposite to intuition: **the lower the number, the more severe** the event. Levels 0 to 2 mean the device or a major function is in trouble. Levels 3 (errors) and 4 (warnings) report faults and risky conditions. Level 5 (notifications) is the normal but significant bucket, which is why routine state changes like `%LINEPROTO-5-UPDOWN` and `%SYS-5-CONFIG_I` live there. Level 6 (informational) is routine chatter and level 7 (debugging) is reserved for the output of `debug` commands. In IOS commands you can type either the keyword or the number, so `logging trap warnings` and `logging trap 4` are identical. Several keywords are plural (emergencies, alerts, errors, warnings, notifications), so read answer options carefully. Use the memory aid in the caption to lock in the order.',
  },
  {
    kind: 'diagram',
    title: 'A level includes every more-severe level',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Severity',
          layers: [
            { label: '0 emergencies' },
            { label: '1 alerts' },
            { label: '2 critical' },
            { label: '3 errors' },
            { label: '4 warnings' },
            { label: '5 notifications' },
            { label: '6 informational' },
            { label: '7 debugging' },
          ],
        },
        {
          title: 'logging trap warnings',
          layers: [
            { label: 'Sent: levels 0-4', tone: 'accent', span: 5 },
            { label: 'Not sent: 5-7', tone: 'muted', span: 3 },
          ],
        },
        {
          title: 'logging console errors',
          layers: [
            { label: 'Shown: levels 0-3', tone: 'accent', span: 4 },
            { label: 'Not shown: 4-7', tone: 'muted', span: 4 },
          ],
        },
      ],
    },
    caption: 'A threshold of N delivers messages 0 through N, never only N.',
    bullets: [
      '`logging trap warnings` is the same as `logging trap 4`',
      'Choosing `debugging` (7) lets **everything** through',
      'Higher number = more **verbose** setting, not more severe messages',
    ],
    notes:
      'A level in a logging command is a **threshold**, not a filter for one value. IOS compares each message severity number with the number configured for the destination and delivers the message when the message number is **less than or equal** to the setting. So `logging trap warnings` (4) forwards levels 0, 1, 2, 3 and 4, and drops 5, 6 and 7. `logging console errors` (3) shows 0 to 3. Choosing `debugging` (7) means everything gets through. This is where exam writers set their traps: they ask which messages a server receives after `logging trap 4`, and the tempting wrong answer is only level 4. If a server is flooded with chatter, you lower the number; if it is missing detail, you raise it. Remember that each destination has its own threshold, so the console can be quiet while the server receives everything.',
  },
  {
    kind: 'diagram',
    title: 'Four logging destinations',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 2.5, tone: 'accent' },
        { id: 'con', icon: 'pc', label: 'Console', sub: 'logging console', x: 1.3, y: 0.9 },
        { id: 'vty', icon: 'laptop', label: 'VTY session', sub: 'logging monitor', x: 1.3, y: 4.1 },
        { id: 'buf', icon: 'database', label: 'RAM buffer', sub: 'logging buffered', x: 8.7, y: 0.9 },
        { id: 'srv', icon: 'server', label: 'Syslog server', sub: 'logging host', x: 8.7, y: 4.1 },
      ],
      links: [
        { from: 'r1', to: 'con', label: 'console port', arrow: 'forward' },
        { from: 'r1', to: 'vty', label: 'terminal monitor', arrow: 'forward' },
        { from: 'r1', to: 'buf', label: 'internal', arrow: 'forward' },
        { from: 'r1', to: 'srv', label: 'UDP 514', arrow: 'forward' },
      ],
    },
    caption: 'Each destination has its own on/off switch and its own severity threshold.',
    notes:
      'IOS can send each message to four places, and every destination has an independent threshold. The **console** is the physical console line, on by default at level debugging. The **monitor** destination is the set of VTY lines (Telnet and SSH). Those sessions show nothing until the user runs `terminal monitor` in that session, because VTY output is opt-in per login. The **buffer** is a circular log held in router RAM: you read it with `show logging`, and it vanishes at reload. Finally, a **syslog server** receives messages across the network as UDP datagrams to port 514; you add it with `logging host` and filter what it receives with `logging trap`. The server is the only destination that keeps a history across reloads and across many devices. On the exam, be ready to match each destination to its command and to say which one needs `terminal monitor`.',
  },
  {
    kind: 'table',
    title: 'Destinations at a glance',
    columns: ['Destination', 'Commands', 'Default level', 'Key facts'],
    rows: [
      ['**Console**', '`logging console [level]`', 'debugging (7)', 'Local console port; on by default; slow and easy to flood'],
      ['**Monitor (VTY)**', '`logging monitor [level]` + `terminal monitor`', 'debugging (7)', 'Telnet/SSH sessions see nothing until `terminal monitor` is entered in that session'],
      ['**Buffer**', '`logging buffered [size] [level]`', 'debugging (7)', 'RAM, circular, lost at reload; read with `show logging`'],
      ['**Syslog server**', '`logging host ip-address` + `logging trap [level]`', 'informational (6)', 'UDP 514, unreliable, central and persistent'],
    ],
    caption: 'The trap level is the only default that is not debugging.',
    notes:
      'Use this table as your revision sheet. Start with the defaults: console and monitor sit at **debugging**, so out of the box they show everything, while the syslog server threshold (the **trap** level) defaults to **informational**, so a freshly added server does not receive debug output. Buffered logging also uses debugging when you enable it without a level. Next, notice the two controls for the VTY destination: `logging monitor [level]` in global configuration sets the threshold, while `terminal monitor` in EXEC mode switches the feature on for the current session. Forgetting the second one is the classic reason people see no logs over SSH. Finally, the buffer is volatile and the server connection is unreliable UDP. If you need a durable record, use the server; if you need a quick look while troubleshooting, use the buffer or a monitored VTY session.',
  },
  {
    kind: 'cli',
    title: 'Configuring logging on R1',
    code: `R1# configure terminal
R1(config)# service timestamps log datetime msec
R1(config)# service timestamps debug datetime msec
R1(config)# service sequence-numbers
R1(config)# logging host 192.168.1.50
000028: Oct  3 14:10:04.771: %SYS-6-LOGGINGHOST_STARTSTOP: Logging to host 192.168.1.50 port 514 started - CLI initiated
R1(config)# logging trap informational
R1(config)# logging buffered 16384 informational
R1(config)# logging console warnings
R1(config)# logging monitor informational
R1(config)# line console 0
R1(config-line)# logging synchronous
R1(config-line)# end
R1#`,
    highlight: ['logging host 192.168.1.50', 'logging trap informational', 'logging buffered 16384 informational', 'logging console warnings'],
    caption: 'No %SYS-5-CONFIG_I appears after end: level 5 no longer reaches a console set to warnings.',
    bullets: [
      '`logging host` names the server; `logging trap` sets what it receives',
      '`logging buffered size level`: the size is in bytes (4096 minimum)',
      '`logging synchronous` keeps messages from splitting the line you are typing',
    ],
    notes:
      'This transcript builds a sensible baseline on R1. The two `service timestamps` commands stamp both log messages and debug output with the date and time to the millisecond; without a stamp, a log line cannot be placed on a timeline. `service sequence-numbers` numbers each message. `logging host 192.168.1.50` starts exporting to the server, and IOS confirms it with a level 6 `%SYS-6-LOGGINGHOST_STARTSTOP` message. `logging trap informational` sets the server threshold (it is the default, shown for clarity). `logging buffered 16384 informational` creates a 16 KB RAM buffer, and `logging console warnings` quiets the console. Notice what is missing at the end: the usual `%SYS-5-CONFIG_I` message did not appear after `end`, because level 5 is no longer allowed on the console. It still goes to the buffer and the server. Best practice also adds `logging source-interface Loopback0`, so the server always sees one predictable source address.',
  },
  {
    kind: 'cli',
    title: 'Verifying with show logging',
    code: `R1# show logging
Syslog logging: enabled (0 messages dropped, 3 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)

No Active Message Discriminator.

No Inactive Message Discriminator.

    Console logging: level warnings, 9 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level informational, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level informational, 5 messages logged, xml disabled,
                    filtering disabled

    Trap logging: level informational, 38 message lines logged
        Logging to 192.168.1.50  (udp port 514, audit disabled,
              link up),
              6 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled

Log Buffer (16384 bytes):

000029: Oct  3 14:10:22.150: %SYS-5-CONFIG_I: Configured from console by console
000030: Oct  3 14:12:41.633: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to down
000031: Oct  3 14:12:42.637: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to down
000032: Oct  3 14:12:55.902: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up
000033: Oct  3 14:12:56.906: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to up`,
    highlight: ['Console logging: level warnings', 'Trap logging: level informational', 'udp port 514', 'Log Buffer (16384 bytes)'],
    caption: 'Read the level on each destination, then the Logging to line for the server.',
    notes:
      '`show logging` is the single most useful verification command, and it is the exhibit behind many exam questions. Read it top to bottom. The first line confirms that syslog logging is enabled. Then come the per-destination lines: each shows the **level** currently configured and a count of messages logged. Here the console is at warnings, the monitor and buffer destinations are at informational, and the monitor count is zero because nobody has used `terminal monitor`. The **Trap logging** block belongs to the syslog server: it shows the threshold and, under it, a `Logging to 192.168.1.50` entry that proves the server was configured, shows **udp port 514** and tells you whether the router believes the path is up. At the bottom you find the buffer contents, oldest first, which is where you read history. The `%LINEPROTO-5-UPDOWN` lines are in the buffer but would not appear on this console, because the buffer allows level 6 while the console stops at level 4.',
  },
  {
    kind: 'cli',
    title: 'Seeing logs over SSH: terminal monitor',
    code: `SW1# terminal monitor
SW1# configure terminal
SW1(config)# interface FastEthernet0/2
SW1(config-if)# shutdown
Oct  3 09:41:07.371: %LINK-5-CHANGED: Interface FastEthernet0/2, changed state to administratively down
Oct  3 09:41:08.378: %LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/2, changed state to down
SW1(config-if)# no shutdown
Oct  3 09:41:21.044: %LINK-3-UPDOWN: Interface FastEthernet0/2, changed state to up
Oct  3 09:41:22.051: %LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/2, changed state to up
SW1(config-if)# end
SW1# terminal no monitor`,
    highlight: ['terminal monitor', '%LINK-5-CHANGED', '%LINK-3-UPDOWN'],
    caption: 'Administrative shutdown logs level 5 LINK-5-CHANGED; a real link transition logs level 3 LINK-3-UPDOWN.',
    notes:
      'This transcript is the story behind a very common exam question. An engineer logged in over SSH makes a change and sees nothing, because VTY sessions do not receive log output by default. The fix is the EXEC command `terminal monitor`, which applies to the current session only and ends when you log out. Once it is on, the shutdown produces two messages: `%LINK-5-CHANGED ... administratively down` (level 5) and `%LINEPROTO-5-UPDOWN ... down`. When the port is brought back with `no shutdown` and a device is connected, the messages change: the link logs `%LINK-3-UPDOWN ... up` at level 3, followed by the line protocol message. Learn this pairing, because exam options love to mix them up: **an administrative shutdown is a level 5 CHANGED message; a real physical transition is a level 3 UPDOWN message.** Use `terminal no monitor` to stop the session receiving messages. The threshold for all VTY sessions is set globally with `logging monitor`.',
  },
  {
    kind: 'diagram',
    title: 'How IOS decides where a message goes',
    diagram: {
      type: 'flow',
      width: 11,
      height: 4,
      nodes: [
        { id: 'ev', label: 'Event occurs', sub: 'link goes down', shape: 'pill', x: 1.3, y: 2 },
        { id: 'fmt', label: 'IOS builds message', sub: '%LINK-3-UPDOWN', x: 4.1, y: 2 },
        { id: 'chk', label: 'Severity <= level?', sub: 'checked per destination', shape: 'diamond', x: 6.9, y: 2, tone: 'accent' },
        { id: 'yes', label: 'Deliver', sub: 'console, VTY, buffer, UDP 514', shape: 'round', x: 9.6, y: 0.9, tone: 'good' },
        { id: 'no', label: 'Skip', sub: 'this destination only', shape: 'round', x: 9.6, y: 3.1, tone: 'muted' },
      ],
      edges: [
        { from: 'ev', to: 'fmt' },
        { from: 'fmt', to: 'chk' },
        { from: 'chk', to: 'yes', label: 'yes' },
        { from: 'chk', to: 'no', label: 'no' },
      ],
    },
    caption: 'The comparison is repeated for every destination; there is no single global filter.',
    notes:
      'Here is the decision IOS makes every time something worth reporting happens. A subsystem raises an event, IOS formats it as a message carrying a facility, a severity number and a mnemonic, and then evaluates the **severity against each destination separately**. If the message number is less than or equal to the configured level of that destination, the message is delivered there; otherwise that destination skips it. The key insight is that there is no single global filter. A link failure (severity 3) reaches every destination whose threshold is 3 or any higher number, which is nearly all of them. A debug line (7) only reaches destinations set to debugging. When you troubleshoot missing messages, run through this diamond once per destination. It also explains why raising the console level to debugging cannot fix a missing message on the server: the two thresholds are unrelated.',
  },
  {
    kind: 'diagram',
    title: 'Delivery to the server is best effort',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r', label: 'R1', icon: 'router' },
        { id: 'n', label: 'Network / firewall', icon: 'firewall' },
        { id: 's', label: 'Syslog server', icon: 'server' },
      ],
      steps: [
        { from: 'r', to: 'n', label: 'Datagram 000412', sub: 'UDP 514 - %LINK-3-UPDOWN' },
        { from: 'n', to: 's', label: 'Delivered', tone: 'good' },
        { from: 'r', to: 'n', label: 'Datagram 000413', sub: 'UDP 514 - %LINEPROTO-5-UPDOWN' },
        { note: 'Dropped by congestion or an ACL. No ICMP, no retry: R1 never knows.', tone: 'bad' },
        { note: 'Numbered messages make a missing one easier to spot.' },
      ],
    },
    caption: 'UDP: no handshake, no acknowledgement, no retransmission, no encryption.',
    notes:
      'Sending a message to a server is fire-and-forget. R1 wraps the formatted text in a syslog datagram and sends it to UDP port 514. UDP has no handshake, no acknowledgement and no retransmission, so if a firewall drops the packet, a link is congested or the server is busy, the message is silently lost and R1 never finds out. This is the main weakness of classic syslog, and it explains two habits you should recognize. First, **sequence numbers** (`service sequence-numbers`) give every message a unique, increasing number, which makes it easier to put events in order and to notice that something is missing. Second, the buffer on the router remains a useful local copy. The datagram also carries a priority value built from the facility and the severity (local7 by default on IOS), which is how servers sort and filter. For the exam: syslog means UDP 514, best effort, and plain text.',
  },
  {
    kind: 'table',
    title: 'Messages you must recognize',
    columns: ['Message', 'Level', 'What it tells you'],
    rows: [
      ['`%LINK-3-UPDOWN`', '3', 'Physical (Layer 1) link changed state: cable, transceiver, peer port, or `no shutdown` bringing it up'],
      ['`%LINK-5-CHANGED`', '5', 'Interface is **administratively down**: someone entered `shutdown`'],
      ['`%LINEPROTO-5-UPDOWN`', '5', 'Line protocol (Layer 2) went up or down; follows the LINK message'],
      ['`%SYS-5-CONFIG_I`', '5', 'Someone left configuration mode; names the user and line (console or VTY)'],
      ['`%SYS-5-RESTART`', '5', 'The system restarted'],
      ['`%OSPF-5-ADJCHG`', '5', 'OSPF neighbor changed state, for example LOADING to FULL'],
      ['`%DUAL-5-NBRCHANGE`', '5', 'EIGRP neighbor came up or went down'],
      ['`%SYS-6-LOGGINGHOST_STARTSTOP`', '6', 'Logging to a syslog host was started or stopped'],
    ],
    caption: 'Ordinary state changes are level 5; physical link events are level 3.',
    notes:
      'These are the messages the exam shows over and over, so recognize them on sight. `%LINK-3-UPDOWN` reports a **physical** (Layer 1) transition at level 3. `%LINEPROTO-5-UPDOWN` reports the **line protocol** (Layer 2) state at level 5 and normally follows the LINK message by about a second. If an administrator shut the interface down, you get `%LINK-5-CHANGED ... administratively down` instead of the level 3 message. `%SYS-5-CONFIG_I` is the audit trail for configuration: it appears when someone leaves configuration mode and names the user and the line. Routing protocols log neighbor changes at level 5: OSPF as `%OSPF-5-ADJCHG` and EIGRP as `%DUAL-5-NBRCHANGE`. Some security features, such as port security violations and BPDU Guard, log at level 2. The pattern to remember: ordinary state changes are level 5 notifications, physical link events are level 3, and serious security or hardware events carry smaller numbers.',
  },
  {
    kind: 'table',
    title: 'Timestamps and sequence numbers',
    columns: ['Setting', 'Resulting prefix', 'Notes'],
    rows: [
      ['`service timestamps log uptime`', '`00:42:10:`', 'Time since boot; useless for comparing two devices'],
      ['`service timestamps log datetime`', '`Oct  3 09:14:52:`', 'Date and time to the second'],
      ['`service timestamps log datetime msec`', '`Oct  3 09:14:52.317:`', 'Millisecond resolution: **best practice**'],
      ['`service timestamps debug datetime msec`', 'Same, on debug output', 'Debug and log stamps are configured separately'],
      ['`service sequence-numbers`', '`000127:` before the timestamp', 'Unique increasing counter per message'],
      ['Leading asterisk on the time', 'Clock is not authoritative', 'Never set or not synchronized; fix with `clock set` or NTP'],
    ],
    caption: 'A period before the time means NTP is configured but not yet synchronized.',
    notes:
      'Two small commands turn raw messages into usable evidence. `service timestamps log datetime msec` stamps each line with the month, day, time and milliseconds, which lets you correlate events from several devices. The alternative, **uptime**, stamps time since boot, which is meaningless once you compare two routers. A parallel command, `service timestamps debug datetime msec`, does the same for debug output; they are separate on purpose, so a question about log messages wants the keyword `log`. `service sequence-numbers` adds a six-digit counter ahead of the timestamp. Even the best timestamp is only as honest as the clock. An **asterisk** before the time means the clock is not authoritative: it was never set or is not synchronized, so the date, like Mar 1 on a lab device, may be fiction. Use `clock set` or, better, NTP. On the exam, remember the keywords `log` versus `debug` and the order `datetime msec`.',
  },
  {
    kind: 'table',
    title: 'Worked example: which destinations get it?',
    columns: ['Message (severity)', 'Console (errors, 3)', 'Buffer (warnings, 4)', 'Server (notifications, 5)', 'VTY (debugging, 7)'],
    rows: [
      ['`%LINK-3-UPDOWN` (3)', '**Yes**', '**Yes**', '**Yes**', '**Yes**'],
      ['`%CDP-4-DUPLEX_MISMATCH` (4)', 'No', '**Yes**', '**Yes**', '**Yes**'],
      ['`%LINEPROTO-5-UPDOWN` (5)', 'No', 'No', '**Yes**', '**Yes**'],
      ['`%SYS-6-LOGGINGHOST_STARTSTOP` (6)', 'No', 'No', 'No', '**Yes**'],
      ['Debug output (7)', 'No', 'No', 'No', '**Yes**'],
    ],
    caption: 'Settings: `logging console errors`, `logging buffered warnings`, `logging trap notifications`; VTY left at its default with `terminal monitor` active.',
    notes:
      'Work through this table until the arithmetic is automatic, because it is exactly how the exam asks level questions. The configuration is in the caption: console errors (3), buffer warnings (4), server notifications (5), and the VTY threshold left at its default of debugging, with `terminal monitor` active. Each message is compared with the number of each destination. `%LINK-3-UPDOWN` is severity 3, so it passes everywhere because 3 is less than or equal to 3, 4, 5 and 7. The duplex mismatch warning (4) passes the buffer, the server and the VTY but not the console. `%LINEPROTO-5-UPDOWN` (5) reaches only the server and the VTY session. The level 6 informational message reaches only the VTY, and debug output (7) also reaches only the VTY. Read down any column and the Yes cells always form a block starting at the top: that block is this level and everything more severe.',
  },
  {
    kind: 'cli',
    title: 'Debug output: powerful and dangerous',
    code: `R1# debug ip icmp
ICMP packet debugging is on
Oct  3 14:20:31.118: ICMP: echo reply sent, src 10.1.1.1, dst 10.1.1.10, topology BASE, dscp 0 topoid 0
Oct  3 14:20:32.120: ICMP: echo reply sent, src 10.1.1.1, dst 10.1.1.10, topology BASE, dscp 0 topoid 0
R1# undebug all
All possible debugging has been turned off
R1# show processes cpu | include CPU
CPU utilization for five seconds: 3%/1%; one minute: 2%; five minutes: 2%`,
    highlight: ['debug ip icmp', 'undebug all'],
    caption: 'Debug lines are severity 7 and use the same logging destinations as every other message.',
    bullets: [
      'Heavy debugs (`debug ip packet`, `debug all`) can **saturate the CPU**',
      'Output reaches the console by default, which is slow',
      'Prefer `terminal monitor` over the console; scope debugs narrowly',
      'Stop with `undebug all` or `no debug all`',
    ],
    notes:
      'Debugging is the last severity level, and the commands that produce it deserve respect. A `debug` command makes IOS print a line for every matching event. On a quiet lab router that is harmless; on a busy production router, `debug ip packet` or `debug all` can produce thousands of lines per second, drive the CPU toward 100 percent and make the device unresponsive, even to the command that would switch the debug off. Output goes to the console by default, and printing on the slow console can itself starve the router. Safer habits: enable the narrowest debug that answers your question, limit it with an access list where the command supports one, read it over a VTY with `terminal monitor` instead of the console, watch `show processes cpu`, and run `undebug all` the moment you have the evidence. Remember that debug lines are severity 7, so a console set to warnings will not display them at all.',
  },
  {
    kind: 'steps',
    title: 'Troubleshooting: where did my message go?',
    steps: [
      { title: 'Read show logging', text: 'Note the level of every destination and look for the `Logging to` line for the server.' },
      { title: 'Compare severity with level', text: 'The message number must be less than or equal to the destination level.' },
      { title: 'Check the session', text: 'Over SSH or Telnet, run `terminal monitor`; on the console, check `logging console`.' },
      { title: 'Test the path to the server', text: 'Ping it, confirm UDP 514 is permitted by ACLs and firewalls, and that the server is listening.' },
      { title: 'Check time sources', text: 'Verify `service timestamps` and NTP so events from different devices line up.' },
    ],
    notes:
      'When someone says the server is not getting my logs, follow a fixed order. Begin with `show logging`: it tells you the threshold for every destination and whether a `Logging to` line exists for the server. Compare the severity number of the message with the threshold; a level 5 message can never reach a server whose trap level is warnings. If the problem is a missing message in an SSH session, the cause is nearly always the missing `terminal monitor`. If the configuration looks right, test the path: can R1 ping the server, is the source address one the server expects, and does an ACL or firewall permit **UDP 514**? Check that the server application is actually listening. Finally, if messages arrive but cannot be correlated, look at timestamps and NTP. The exam compresses all of this into a stem plus a `show logging` exhibit, and the answer is usually one mismatched number or one missing session command.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: '**Lower number = more severe**, and a threshold includes its own level **and every lower number**: `logging trap 4` is levels 0-4, never only 4.',
    bullets: [
      'Defaults: trap is **informational (6)**; console and monitor are **debugging (7)**',
      'VTY sessions show nothing until **`terminal monitor`** is entered',
      'Syslog uses **UDP 514**: unreliable, no acknowledgement',
      '`%LINK-3-UPDOWN` is level **3**; `%LINEPROTO-5-UPDOWN` and `%SYS-5-CONFIG_I` are level **5**',
      'A `shutdown` logs `%LINK-5-CHANGED`; a real link failure logs `%LINK-3-UPDOWN`',
      'The `%FACILITY` field is an IOS module; the header facility (default local7) is separate',
    ],
    notes:
      'These are the traps in the order they usually appear. Level arithmetic comes first: a level setting means this number and every smaller number, so `logging trap 4` is 0 to 4, never only 4, and `logging console errors` hides notifications. Defaults come second: trap is informational (6) while console and monitor start at debugging (7). The VTY trap is third: no `terminal monitor`, no messages. Fourth, port and protocol: **UDP 514**, unreliable. Fifth, recognizing messages: `%LINK-3-UPDOWN` is level 3 while `%LINEPROTO-5-UPDOWN` and `%SYS-5-CONFIG_I` are level 5, and an administrative shutdown produces `%LINK-5-CHANGED`. Finally, vocabulary: the `%FACILITY` field names the IOS module, while the facility in the syslog header (local0 to local7, default local7) is a separate category label. If an answer says only level N, or levels N through 7, for a threshold of N, it is almost certainly the distractor.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Message layout: `seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description`',
      'Severity **0 emergencies** through **7 debugging**; lower = more severe',
      'A threshold admits **its level and every more-severe level**',
      'Destinations: console, monitor (VTY), buffer, syslog server on **UDP 514**',
      'Commands: `logging host`, `logging trap`, `logging console`, `logging buffered`, `terminal monitor`, `show logging`',
      'Add `service timestamps log datetime msec` and `service sequence-numbers`; sync clocks with NTP',
      'Treat `debug` as a scalpel: scope it, then `undebug all`',
    ],
    notes:
      'Close the deck by rehearsing the chain from event to evidence. An IOS subsystem raises an event and formats it as a sequence number, a timestamp, and then `%FACILITY-SEVERITY-MNEMONIC` plus a description. The severity, 0 to 7, decides where the message goes: each of the four destinations (console, monitor, buffer, syslog server) has its own threshold, and a threshold admits its own number and every smaller one. You configure the server with `logging host`, the server threshold with `logging trap`, the other thresholds with `logging console`, `logging monitor` and `logging buffered`, and you turn on VTY display with `terminal monitor`. You make the data trustworthy with `service timestamps log datetime msec`, `service sequence-numbers` and NTP, and you verify everything with `show logging`. If you can write that paragraph from memory and recite the table of eight levels, you have this objective covered. Next, review the flashcards, take the quiz, and then drill the level-arithmetic exam questions.',
  },
];
