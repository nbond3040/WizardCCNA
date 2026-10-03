import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Default transport and port for syslog', back: '**UDP 514** to the syslog server: best effort, no acknowledgement.' },
  { id: 'f2', front: 'IOS log message layout', back: '`seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description` (sequence number and timestamp are optional).' },
  { id: 'f3', front: 'Severity 0', back: '**emergencies**: system is unusable.' },
  { id: 'f4', front: 'Severity 1', back: '**alerts**: immediate action needed.' },
  { id: 'f5', front: 'Severity 2', back: '**critical**: critical condition.' },
  { id: 'f6', front: 'Severity 3', back: '**errors**: error condition, for example `%LINK-3-UPDOWN`.' },
  { id: 'f7', front: 'Severity 4', back: '**warnings**: warning condition.' },
  { id: 'f8', front: 'Severity 5', back: '**notifications**: normal but significant, for example `%LINEPROTO-5-UPDOWN` and `%SYS-5-CONFIG_I`.' },
  { id: 'f9', front: 'Severity 6', back: '**informational**: informational messages only.' },
  { id: 'f10', front: 'Severity 7', back: '**debugging**: output of `debug` commands.' },
  { id: 'f11', front: 'Which severity number is more severe: lower or higher?', back: 'The **lower** number. Level 0 is the worst and level 7 is the least severe.' },
  { id: 'f12', front: 'What does `logging trap warnings` send to the server?', back: 'Levels **0 through 4**: a level includes itself and every more-severe level.' },
  { id: 'f13', front: 'Default `logging trap` level', back: '**informational** (6), so levels 0-6 go to the server.' },
  { id: 'f14', front: 'Default level for console and monitor logging', back: '**debugging** (7): everything is displayed.' },
  { id: 'f15', front: 'Command to see log messages in a Telnet/SSH session', back: '`terminal monitor` (EXEC mode, current session only). `terminal no monitor` stops it.' },
  { id: 'f16', front: 'Command that sends logs to a syslog server', back: '`logging host ip-address` in global configuration.' },
  { id: 'f17', front: 'Command that keeps logs in RAM', back: '`logging buffered [size] [level]`. The buffer is lost at reload; read it with `show logging`.' },
  { id: 'f18', front: 'Command that shows logging settings and the log buffer', back: '`show logging`.' },
  { id: 'f19', front: 'Command for date, time and milliseconds on log messages', back: '`service timestamps log datetime msec`.' },
  { id: 'f20', front: 'Command that numbers log messages', back: '`service sequence-numbers`, which adds a prefix such as `000127:`.' },
  { id: 'f21', front: '`%LINK-3-UPDOWN` means', back: 'The **physical** (Layer 1) link changed state. Severity 3, errors.' },
  { id: 'f22', front: '`%LINEPROTO-5-UPDOWN` means', back: 'The **line protocol** (Layer 2) changed state. Severity 5, notifications.' },
  { id: 'f23', front: '`%LINK-5-CHANGED ... administratively down`', back: 'An administrator entered `shutdown` on the interface. Severity 5.' },
  { id: 'f24', front: '`%SYS-5-CONFIG_I`', back: 'The configuration was changed from the console or a VTY; logged when you leave configuration mode.' },
  { id: 'f25', front: 'Mnemonic in a log message', back: 'A short uppercase code that names the specific event, such as `UPDOWN` or `CONFIG_I`.' },
  { id: 'f26', front: 'Facility in `%LINK-3-UPDOWN`', back: 'The IOS module that generated the message (LINK). Not the same as the local0-local7 facility in the syslog header.' },
  { id: 'f27', front: 'Default syslog header facility used by IOS', back: '**local7** (changed with `logging facility`).' },
  { id: 'f28', front: 'Why is `debug all` risky on a production router?', back: 'It can overload the CPU and flood the console. Stop it with `undebug all` (or `no debug all`).' },
  { id: 'f29', front: 'Leading asterisk before a log timestamp', back: 'The clock is not authoritative: it was never set or is not synchronized. Fix with `clock set` or NTP.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'In `%LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to down`, which field is the severity level?',
    options: ['LINK', '3', 'UPDOWN', 'GigabitEthernet0/0/1'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The digit between the dashes is the severity: 3 means errors. LINK is the facility (the IOS module), UPDOWN is the mnemonic naming the event, and the interface name is part of the description.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two items are destinations for IOS log messages? (Choose two.)',
    options: ['The startup-config file', 'The console line', 'The ARP table', 'A syslog server', 'The routing table'],
    answers: [1, 3],
    difficulty: 1,
    explanation:
      'Messages can go to the console, VTY sessions, the RAM buffer and a syslog server. The startup-config, ARP table and routing table are databases, not logging destinations.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Which UDP port number do devices use to send syslog messages to a server?',
    answers: ['514', 'udp 514', 'udp/514', 'udp514'],
    placeholder: 'port number',
    difficulty: 1,
    explanation: 'Syslog uses **UDP 514**. UDP is connectionless, so delivery is best effort with no acknowledgement.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'A router is configured with `logging console errors`. Which messages appear on the console?',
    options: ['Severity 3 through 7', 'Only severity 3', 'Severity 0 through 3', 'Severity 0 through 4'],
    answer: 2,
    difficulty: 2,
    explanation:
      'Errors is level 3, and a threshold includes its own level plus every more-severe (lower-numbered) level, so 0 through 3 are shown. "Only 3" ignores that rule, "3 through 7" reverses the direction of severity, and "0 through 4" would be warnings.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each logging destination to the command that controls it.',
    pairs: [
      { left: 'Console line', right: '`logging console`' },
      { left: 'Telnet or SSH session', right: '`terminal monitor`' },
      { left: 'RAM buffer', right: '`logging buffered`' },
      { left: 'Syslog server', right: '`logging host`' },
    ],
    difficulty: 1,
    explanation:
      '`logging console` sets the console threshold, `terminal monitor` turns on log display for the current VTY session, `logging buffered` creates the RAM buffer and `logging host` defines the server (its threshold is `logging trap`).',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Why should you be careful with `debug all` on a production router?',
    options: [
      'It can overload the CPU and flood the console',
      'It erases the log buffer',
      'It disables the syslog server',
      'It permanently changes the running-config',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Debug generates a message for every matching event, which on a busy router can drive the CPU high and make the device unresponsive. It does not erase the buffer, affect the server or change the configuration. Stop it with `undebug all`.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'What is the default severity threshold for messages sent to a syslog server?',
    options: ['debugging (7)', 'informational (6)', 'warnings (4)', 'emergencies (0)'],
    answer: 1,
    difficulty: 2,
    explanation:
      'The default trap level is **informational** (6), so levels 0-6 are sent. Debugging (7) is the default for the console and monitor destinations, not for the server. Warnings and emergencies are valid settings but not the default.',
  },
];
