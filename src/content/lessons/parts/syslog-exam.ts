import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which syslog severity level indicates that the system is unusable?',
    options: ['Level 1 (alerts)', 'Level 3 (errors)', 'Level 0 (emergencies)', 'Level 7 (debugging)'],
    answer: 2,
    difficulty: 1,
    explanation:
      'Level 0, **emergencies**, is the most severe level and means the system is unusable. Lower numbers are more severe, so level 7 is the least severe (debug output). Alerts (1) call for immediate action but rank below emergencies, and errors (3) are routine fault conditions such as a link going down.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which transport protocol and port does a Cisco device use by default to send syslog messages to a server?',
    options: ['UDP 69', 'UDP 514', 'UDP 161', 'UDP 123'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Syslog uses **UDP port 514**. UDP 69 is TFTP, UDP 161 is SNMP polling and UDP 123 is NTP. Because syslog rides on UDP, delivery is best effort with no acknowledgement.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about this log message is correct?',
    exhibit: {
      kind: 'cli',
      text: `*Mar  1 00:14:07.119: %SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Fa0/5 with BPDU Guard enabled. Disabling port.`,
    },
    options: [
      'SPANTREE is the mnemonic, 2 is the facility and BLOCK_BPDUGUARD is the severity',
      'SPANTREE is the facility, BLOCK_BPDUGUARD is the severity and 2 is the sequence number',
      'The leading asterisk marks the message as severity 2 and SPANTREE is the mnemonic',
      'SPANTREE is the facility, 2 is the severity (critical) and BLOCK_BPDUGUARD is the mnemonic',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'The layout is %FACILITY-SEVERITY-MNEMONIC, so SPANTREE names the module (the facility), the 2 between the dashes is the severity (critical) and BLOCK_BPDUGUARD is the mnemonic. The severity is always the number, never a word or the module name, and the leading asterisk has nothing to do with severity: it means the clock is not synchronized.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Which severity levels are sent to the syslog server at 10.1.1.100?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# logging host 10.1.1.100
R1(config)# logging trap warnings`,
    },
    options: ['Levels 0 through 4', 'Level 4 only', 'Levels 4 through 7', 'Levels 0 through 5'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A threshold includes its own level and every more-severe (lower-numbered) level. Warnings is level 4, so levels 0 to 4 are sent. "Level 4 only" ignores the inclusive rule, "4 through 7" reverses the direction of severity, and "0 through 5" would require `logging trap notifications`.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. R1 generates `%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to down`. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include logging
logging buffered 16384 warnings
logging console errors
logging trap notifications
logging host 192.168.10.5`,
    },
    options: [
      'The message is shown on the console and sent to 192.168.10.5',
      'The message is stored in the buffer and sent to 192.168.10.5',
      'The message is sent to 192.168.10.5 but is not shown on the console or stored in the buffer',
      'The message is discarded because only errors and warnings are configured',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The message has severity 5. The console accepts 0-3 (errors), the buffer accepts 0-4 (warnings) and the server accepts 0-5 (notifications), so only the syslog server receives it. The first two options assume that level 5 passes a threshold of 3 or 4, which it does not. It is not discarded, because the trap level of notifications admits it.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two commands, entered in global configuration mode, cause a router to send messages of severity 0 through 5 to a syslog server at 10.1.1.100? (Choose two.)',
    options: [
      '`logging console notifications`',
      '`logging host 10.1.1.100`',
      '`logging buffered notifications`',
      '`logging trap notifications`',
      '`logging monitor 5`',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      '`logging host` defines the server and `logging trap notifications` (level 5) sets how much it receives: levels 0 to 5. `logging console`, `logging buffered` and `logging monitor` only change what is shown on the console, kept in RAM or displayed on VTY sessions; none of them affects what the server receives.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'An engineer connected over SSH wants to see log messages in the current session. Enter the EXEC command that enables this.',
    answers: ['terminal monitor'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`terminal monitor` turns on log display for the current VTY session. Without it, Telnet and SSH sessions receive no log output even when the `logging monitor` threshold would allow it. It is an EXEC command rather than a configuration command, and it lasts only until the session ends.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'Enter the global configuration command that adds the date, the time and milliseconds to log messages.',
    answers: ['service timestamps log datetime msec'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`service timestamps log datetime msec` stamps log messages. The `debug` keyword version stamps debug output only, `uptime` shows time since boot instead of the date and time, and `service sequence-numbers` adds a counter rather than a time.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. The syslog server at 10.10.10.5 receives `%LINK-3-UPDOWN` messages from R2 but never receives `%LINEPROTO-5-UPDOWN` or `%SYS-5-CONFIG_I` messages. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R2# show logging
Syslog logging: enabled (0 messages dropped, 3 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)

    Console logging: level debugging, 41 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level debugging, 41 messages logged, xml disabled,
                    filtering disabled

    Trap logging: level warnings, 12 message lines logged
        Logging to 10.10.10.5  (udp port 514, audit disabled,
              link up),
              12 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled`,
    },
    options: [
      'UDP port 514 is blocked between R2 and the server',
      'The router must use TCP to send severity 5 messages',
      'The console and buffer levels must be lowered to errors',
      'The trap level is warnings, so only severities 0 through 4 are forwarded',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The Trap logging line shows level warnings (4). Severity 3 messages pass, but severity 5 messages are above the threshold and are not forwarded; `logging trap notifications` fixes it. A blocked UDP 514 path would stop every message, including the LINK-3 ones, and the counters show R2 is sending. Console and buffer levels do not control the server, and syslog does not switch to TCP by severity.',
  },
  {
    id: 'e10',
    type: 'match',
    stem: 'Match each severity level to its keyword.',
    pairs: [
      { left: 'Level 1', right: '`alerts`' },
      { left: 'Level 3', right: '`errors`' },
      { left: 'Level 4', right: '`warnings`' },
      { left: 'Level 5', right: '`notifications`' },
      { left: 'Level 6', right: '`informational`' },
      { left: 'Level 7', right: '`debugging`' },
    ],
    difficulty: 1,
    explanation:
      'The eight levels run 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational and 7 debugging. Lower numbers are more severe.',
  },
  {
    id: 'e11',
    type: 'order',
    stem: 'Arrange these severity keywords from MOST severe to LEAST severe.',
    items: ['`critical`', '`errors`', '`warnings`', '`notifications`', '`informational`', '`debugging`'],
    difficulty: 2,
    explanation:
      'Severity runs from level 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational down to 7 debugging. The lower the number, the more severe the condition.',
  },
  {
    id: 'e12',
    type: 'categorize',
    stem: 'A router generates `%LINEPROTO-5-UPDOWN` (severity 5). For each console setting, decide whether the message appears on the console.',
    categories: ['Message is displayed', 'Message is not displayed'],
    items: [
      { text: '`logging console debugging`', category: 0 },
      { text: '`logging console informational`', category: 0 },
      { text: '`logging console notifications`', category: 0 },
      { text: '`logging console 6`', category: 0 },
      { text: '`logging console warnings`', category: 1 },
      { text: '`logging console errors`', category: 1 },
      { text: '`logging console 2`', category: 1 },
    ],
    difficulty: 3,
    explanation:
      'A message is shown when its severity number is less than or equal to the configured level. Debugging (7), informational (6), notifications (5) and level 6 all admit severity 5. Warnings (4), errors (3) and level 2 are lower numbers, so a severity 5 message is above their thresholds and is suppressed.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'Enter the global configuration command that adds a sequence number to every log message.',
    answers: ['service sequence-numbers'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`service sequence-numbers` prefixes each log message with an increasing counter such as `000127:`. It is separate from the timestamp commands, which add the time but no counter.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about syslog severity levels are true? (Choose two.)',
    options: [
      'Level 7 is the most severe level',
      'A lower level number indicates a more severe condition',
      '`logging trap 3` sends only severity 3 messages',
      'Configuring a level also enables every level with a lower number',
      'Level 0 is the debugging level',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'Severity 0 (emergencies) is the worst and 7 (debugging) the least severe, and a threshold admits its own level plus all lower-numbered levels. Level 7 is therefore not the most severe, `logging trap 3` sends levels 0-3 and not only 3, and debugging is level 7, not 0.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'What is the default severity threshold for messages that a Cisco IOS router sends to a syslog server?',
    options: ['debugging (7)', 'warnings (4)', 'informational (6)', 'notifications (5)'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The default trap level is **informational** (levels 0-6). Debugging (7) is the default for the console and monitor destinations, not for the server, so debug output reaches a server only if `logging trap debugging` is configured. Warnings and notifications are valid settings but not the default.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Which action best reduces the risk of debug output harming a production router?',
    options: [
      'Enable debug all and rely on the console level to filter the output',
      'Enable only the specific debug needed, view it with terminal monitor, and run undebug all when finished',
      'Configure logging trap debugging so the syslog server absorbs the load',
      'Set logging buffered to 4096 bytes so the log fills slowly',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A narrow debug limits how many events the CPU must process, a VTY session avoids the slow console, and `undebug all` ends the exposure. `debug all` is the heaviest option, and logging levels only decide where messages are delivered, not whether the router processes the events. Sending debugs to a server adds load instead of removing it, and a small buffer simply loses data.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. The engineer is connected to SW1 over SSH. After entering `shutdown` on FastEthernet0/7, no log messages appear in the session. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show logging | include Monitor
    Monitor logging: level debugging, 0 messages logged, xml disabled,
SW1# configure terminal
SW1(config)# interface FastEthernet0/7
SW1(config-if)# shutdown
SW1(config-if)#`,
    },
    options: [
      'The monitor level is debugging, which hides severity 5 messages',
      'Administrative shutdown events are sent only to a syslog server',
      'The session has not been enabled with terminal monitor',
      'logging console must be set to debugging',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'VTY sessions display log messages only after `terminal monitor` is entered in that session; the zero message count under Monitor logging confirms nothing has been shown. Debugging (7) is the most permissive threshold, so it does not hide severity 5 messages. A shutdown generates `%LINK-5-CHANGED` like any other event, and the console level affects only the console.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'A technician unplugs the cable from the active port FastEthernet0/3 on a switch. Which two log messages does the switch generate? (Choose two.)',
    options: [
      '`%LINK-5-CHANGED: Interface FastEthernet0/3, changed state to administratively down`',
      '`%LINK-3-UPDOWN: Interface FastEthernet0/3, changed state to down`',
      '`%SYS-5-CONFIG_I: Configured from console by console`',
      '`%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/3, changed state to down`',
      '`%SYS-5-RESTART: System restarted`',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'A physical failure produces the level 3 `%LINK-3-UPDOWN` message followed by the level 5 `%LINEPROTO-5-UPDOWN` message. `%LINK-5-CHANGED ... administratively down` appears only when an administrator enters `shutdown`. `%SYS-5-CONFIG_I` is logged when someone leaves configuration mode and `%SYS-5-RESTART` when the system reboots; neither relates to pulling a cable.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. What does SYS identify in this message?',
    exhibit: {
      kind: 'cli',
      text: `*Mar  1 00:05:08.123: %SYS-5-CONFIG_I: Configured from console by console`,
    },
    options: [
      'The severity level',
      'The mnemonic',
      'The syslog server that received the message',
      'The facility: the IOS subsystem that generated the message',
    ],
    answer: 3,
    difficulty: 1,
    explanation:
      'In %FACILITY-SEVERITY-MNEMONIC the first field is the facility, which names the IOS module or subsystem (here SYS, the system itself). The severity is the digit 5 and the mnemonic is CONFIG_I. The format does not name any server.',
  },
  {
    id: 'e20',
    type: 'match',
    stem: 'Match each log message to its meaning.',
    pairs: [
      { left: '`%LINK-3-UPDOWN`', right: 'Physical link changed state' },
      { left: '`%LINK-5-CHANGED`', right: 'Interface was administratively shut down' },
      { left: '`%LINEPROTO-5-UPDOWN`', right: 'Line protocol changed state' },
      { left: '`%SYS-5-CONFIG_I`', right: 'Configuration changed from the console or a VTY' },
      { left: '`%OSPF-5-ADJCHG`', right: 'OSPF neighbor changed state' },
    ],
    difficulty: 2,
    explanation:
      'LINK-3-UPDOWN is Layer 1, LINK-5-CHANGED reports an administrative shutdown, LINEPROTO-5-UPDOWN is the Layer 2 line protocol, SYS-5-CONFIG_I is the configuration audit message and OSPF-5-ADJCHG is an OSPF adjacency change.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Which statement about syslog messages sent to a server is correct?',
    options: [
      'The router retransmits each message until the server acknowledges it',
      'UDP provides no acknowledgement, so a message lost in transit is not retransmitted',
      'Messages are encrypted by default to protect the log content',
      'The server must authenticate the router before accepting messages',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Syslog uses UDP 514, which is connectionless: there is no acknowledgement and no retransmission, so a lost datagram is simply gone. Classic syslog also sends plain text and does not authenticate the sender, which is why the other options are wrong.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. R1 is configured with `logging host 10.2.2.50` and `logging trap informational`, but the syslog server receives nothing. Which change on FW1 fixes the problem?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.4,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', sub: '10.0.0.1', x: 1.3, y: 1.4 },
          { id: 'fw', icon: 'firewall', label: 'FW1', sub: 'Inbound ACL: permit TCP 22 and 443 only', x: 5, y: 1.4, tone: 'warn' },
          { id: 'srv', icon: 'server', label: 'Syslog server', sub: '10.2.2.50', x: 8.7, y: 1.4 },
        ],
        links: [
          { from: 'r1', to: 'fw' },
          { from: 'fw', to: 'srv' },
        ],
      },
    },
    options: [
      'Permit TCP port 514 from R1 to the server',
      'Permit ICMP echo from R1 to the server',
      'Permit UDP port 514 from R1 to the server',
      'Permit TCP port 23 from R1 to the server',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'IOS sends syslog to the server as UDP datagrams on port 514, and the firewall ACL permits only TCP 22 and 443, so the messages are dropped. Permitting UDP 514 fixes it. TCP 514 is not what IOS uses by default, ICMP would only help ping, and TCP 23 is Telnet.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. What does the asterisk before the timestamp indicate?',
    exhibit: {
      kind: 'cli',
      text: `*Mar  1 00:12:34.567: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up`,
    },
    options: [
      'The message was generated by a debug command',
      'The message has not yet been delivered to the syslog server',
      'The router clock is not authoritative: it was never set or is not synchronized',
      'The message severity is higher than the console threshold',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'An asterisk before the time means the clock is not authoritative: it was never set or is not synchronized to a time source, which is why a lab device shows Mar 1. It says nothing about debug output, delivery status or severity thresholds. Fix it with `clock set` or NTP.',
  },
];
