import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'SNMP manager (NMS)', back: 'Software that **polls** agents, **receives** notifications and presents the data — usually a server in the NOC.' },
  { id: 'f2', front: 'SNMP agent', back: 'The SNMP process on a **managed device**: answers requests and sends notifications.' },
  { id: 'f3', front: 'MIB', back: 'Management Information Base: the tree-structured set of objects an agent exposes.' },
  { id: 'f4', front: 'OID', back: 'Object Identifier: a dotted-number path to one MIB object, e.g. `1.3.6.1.2.1.1.5` (sysName).' },
  { id: 'f5', front: 'OID prefix `1.3.6.1`', back: 'iso(1).org(3).dod(6).internet(1) — the start of almost every SNMP OID.' },
  { id: 'f6', front: 'OID `1.3.6.1.4.1.9`', back: 'The **Cisco** enterprise branch: private(4).enterprises(1).cisco(9).' },
  { id: 'f7', front: 'Why `sysName.0` ends in `.0`', back: 'The `.0` is the instance of a **scalar** (single-value) object; table objects end with an index instead.' },
  { id: 'f8', front: 'Units of sysUpTime', back: '**TimeTicks** — hundredths of a second (8,640,000 = one day).' },
  { id: 'f9', front: 'SNMP Get', back: 'Manager reads one or more **specific** OIDs.' },
  { id: 'f10', front: 'SNMP GetNext', back: 'Manager reads the **next** OID in the tree — repeated to walk a table.' },
  { id: 'f11', front: 'SNMP GetBulk', back: 'Manager reads **many** objects in one request. Added in SNMPv2c.' },
  { id: 'f12', front: 'SNMP Set', back: 'Manager **writes** a value; needs an RW community (v1/v2c) or a write view (v3).' },
  { id: 'f13', front: 'SNMP Trap', back: 'Unsolicited agent-to-manager notification that is **not acknowledged**.' },
  { id: 'f14', front: 'SNMP Inform', back: '**Acknowledged** notification: the agent resends it until the manager replies. v2c and v3 only.' },
  { id: 'f15', front: 'Port an SNMP agent listens on', back: '**UDP 161** — Get, GetNext, GetBulk and Set arrive here.' },
  { id: 'f16', front: 'Port an SNMP manager receives notifications on', back: '**UDP 162** — traps and informs.' },
  { id: 'f17', front: 'What SNMPv2c added over SNMPv1', back: '**GetBulk**, **Inform** and 64-bit counters — but no new security (still clear-text communities).' },
  { id: 'f18', front: 'Community string', back: 'Clear-text shared secret that grants **RO** or **RW** access in SNMPv1 and v2c.' },
  { id: 'f19', front: 'SNMPv3 security levels', back: '**noAuthNoPriv** (username only), **authNoPriv** (HMAC authentication), **authPriv** (authentication + encryption).' },
  { id: 'f20', front: 'IOS keywords for the SNMPv3 levels', back: '`noauth`, `auth` and `priv` — e.g. `snmp-server group NOC-ADMINS v3 priv`.' },
  { id: 'f21', front: '`snmp-server community Wiz-R3ad RO 10`', back: 'Creates a **read-only** community; ACL **10** lists the managers allowed to use it.' },
  { id: 'f22', front: '`snmp-server location` and `snmp-server contact`', back: 'Set the **sysLocation** and **sysContact** values returned to the NMS.' },
  { id: 'f23', front: '`snmp-server host 10.1.1.50 version 2c Wiz-R3ad`', back: 'Sends notifications to 10.1.1.50 as v2c **traps** with that community; add `informs` to send informs instead.' },
  { id: 'f24', front: '`snmp-server enable traps`', back: 'Enables notification types; with no keywords, every type the device supports.' },
  { id: 'f25', front: 'SNMPv3 building blocks on IOS', back: '`snmp-server group` (security level, views) → `snmp-server user` (auth and priv algorithms and passwords) → `snmp-server host ... version 3`.' },
  { id: 'f26', front: 'SNMP default state on Cisco IOS', back: 'Not configured: the first `snmp-server` command enables the agent, and there is **no** default public community.' },
  { id: 'f27', front: 'Model-driven streaming telemetry', back: 'After a subscription, the device **pushes** YANG-modeled data, periodically or on-change, over gRPC/gNMI or NETCONF.', tags: ['v2.0'] },
  { id: 'f28', front: 'SNMP vs syslog', back: 'SNMP: numeric polling plus structured notifications (UDP 161/162). Syslog: text event messages with a severity (UDP 514).' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which SNMP component runs on the managed device and answers requests?',
    options: ['Manager', 'Agent', 'MIB browser', 'Collector'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **agent** runs on the router, switch or server being managed. The manager (NMS) sends the requests, a MIB browser is a tool on the manager side, and a collector receives telemetry or logs.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'On which port does an NMS receive SNMP traps?',
    options: ['UDP 161', 'UDP 162', 'TCP 162', 'UDP 514'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Traps and informs are sent to the manager on **UDP 162**. UDP 161 is where agents receive requests, SNMP does not use TCP 162, and UDP 514 is syslog.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two operations were introduced with SNMPv2c? (Choose two.)',
    options: ['GetBulk', 'Get', 'Inform', 'Set', 'Trap'],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '**GetBulk** and **Inform** did not exist in SNMPv1. Get, Set and Trap all date back to SNMPv1.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which SNMP version is the only one that can encrypt SNMP messages?',
    answers: ['SNMPv3', 'v3', '3', 'SNMP v3', 'version 3'],
    placeholder: 'version',
    difficulty: 1,
    explanation:
      'Only **SNMPv3** offers encryption, at the authPriv security level. SNMPv1 and v2c send community strings and data in clear text.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each SNMP operation with its description.',
    pairs: [
      { left: 'Get', right: 'Read specific OIDs' },
      { left: 'GetNext', right: 'Read the following OID to walk a table' },
      { left: 'Set', right: 'Write a value on the agent' },
      { left: 'Trap', right: 'Unacknowledged notification from the agent' },
      { left: 'Inform', right: 'Acknowledged notification from the agent' },
    ],
    difficulty: 2,
    explanation:
      'Get, GetNext and Set are manager requests to UDP 161; Trap and Inform are agent notifications to UDP 162, and only the Inform is acknowledged.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'What does the RO keyword in snmp-server community NOC RO allow a manager to do?',
    options: [
      'Read values with Get, GetNext and GetBulk, but not Set',
      'Read and write values with any operation',
      'Receive traps only',
      'Use SNMPv3 with encryption',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '**RO** (read-only) permits the read operations only; **RW** is needed for Set. Traps are configured with `snmp-server host`, and communities are not used for SNMPv3 authentication or encryption.',
  },
  {
    id: 'q7',
    type: 'categorize',
    stem: 'Classify each SNMP message by who initiates it.',
    categories: ['Manager-initiated', 'Agent-initiated'],
    items: [
      { text: 'Get', category: 0 },
      { text: 'GetNext', category: 0 },
      { text: 'GetBulk', category: 0 },
      { text: 'Set', category: 0 },
      { text: 'Trap', category: 1 },
      { text: 'Inform', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'The manager starts Get, GetNext, GetBulk and Set (sent to UDP 161). The agent starts Trap and Inform (sent to UDP 162).',
  },
];
