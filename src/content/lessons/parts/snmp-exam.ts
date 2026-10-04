import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'input',
    stem: 'Enter the UDP port number on which an SNMP agent listens for Get and Set requests.',
    answers: ['161', 'UDP 161', 'udp/161'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'Agents listen on **UDP 161**. Managers receive traps and informs on UDP 162, and SNMP does not use TCP for these operations.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which type of SNMP message is SW1 sending?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'ag', label: 'SW1 agent', icon: 'switch' },
          { id: 'nms', label: 'NMS 10.1.1.50', icon: 'server' },
        ],
        steps: [
          { from: 'ag', to: 'nms', label: 'Notification: linkDown', sub: 'to UDP 162' },
          { note: 'No reply before the timeout', tone: 'warn' },
          { from: 'ag', to: 'nms', label: 'Same notification sent again', sub: 'to UDP 162' },
          { from: 'nms', to: 'ag', label: 'Response', dashed: true },
        ],
      },
    },
    options: ['Trap', 'Inform', 'GetResponse', 'SetRequest'],
    answer: 1,
    difficulty: 2,
    explanation:
      'A notification that is **retransmitted until the manager responds** is an **Inform** (SNMPv2c or v3). A Trap is sent once and never acknowledged. GetResponse is an answer to a manager request, and SetRequest travels from the manager to the agent on UDP 161.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements about SNMPv2c are true? (Choose two.)',
    options: [
      'Community strings are sent in clear text',
      'It supports the GetBulk and Inform operations',
      'It encrypts the message payload with AES',
      'It authenticates users with individual usernames',
      'Agents listen for requests on TCP port 161',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'SNMPv2c keeps SNMPv1\'s **clear-text communities** and adds **GetBulk** and **Inform**. Encryption and per-user authentication arrived only with SNMPv3, and agents listen on UDP 161, not TCP.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each SNMP security option with its description.',
    pairs: [
      { left: 'noAuthNoPriv', right: 'Username match only, no encryption' },
      { left: 'authNoPriv', right: 'HMAC authentication without encryption' },
      { left: 'authPriv', right: 'Authentication and encryption' },
      { left: 'Community string', right: 'Clear-text shared secret used by SNMPv1 and v2c' },
    ],
    difficulty: 1,
    explanation:
      '**auth** means authentication and **priv** means privacy (encryption): noAuthNoPriv has neither, authNoPriv authenticates only, and authPriv does both. Community strings belong to SNMPv1/v2c and are sent in clear text.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. A new NMS at 10.1.1.60 polls R1 with SNMPv2c and the community Wiz-R3ad, but every request times out. The old NMS at 10.1.1.50 still works. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include snmp|access-list
access-list 10 permit 10.1.1.50
snmp-server community Wiz-R3ad RO 10
snmp-server location HQ Building 1, Rack 4
snmp-server contact noc@wizardccna.lab`,
    },
    options: [
      'ACL 10 does not permit 10.1.1.60 to use the community',
      'The community is read-only, so Get requests are refused',
      'R1 has no snmp-server host command for the new NMS',
      'R1 has no snmp-server enable traps command',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The `10` after `RO` applies **standard ACL 10**, which permits only 10.1.1.50, so requests from 10.1.1.60 are ignored even with the correct community. RO allows Get, GetNext and GetBulk. `snmp-server host` and `snmp-server enable traps` control outgoing notifications and have nothing to do with polling.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. The NMS team reports that every poll of R2 times out. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `R2# show snmp
Chassis: FDO2231B1QX
Contact: noc@wizardccna.lab
Location: Branch 7, wiring closet
212 SNMP packets input
    0 Bad SNMP version errors
    212 Unknown community name
    0 Illegal operation for community name supplied
    0 Encoding errors
    0 Number of requested variables
    0 Number of altered variables
    0 Get-request PDUs
    0 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
0 SNMP packets output
<output omitted>`,
    },
    options: [
      'The NMS uses a community string that R2 has not configured',
      'A firewall blocks UDP 162 traffic between R2 and the NMS',
      'The community string on R2 is configured as read-only',
      'The NMS is using an SNMP version that R2 does not support',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'All 212 requests reached R2 and were counted as **Unknown community name**, so none was processed and no responses were sent. A UDP 162 block affects only traps; a read-only community would still answer Get requests; and Bad SNMP version errors is 0, so the version is not the problem.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Which command sends acknowledged SNMPv2c notifications to the NMS at 10.1.1.50 using the community NOC-RO?',
    options: [
      'snmp-server host 10.1.1.50 informs version 2c NOC-RO',
      'snmp-server host 10.1.1.50 version 2c NOC-RO',
      'snmp-server host 10.1.1.50 informs version 1 NOC-RO',
      'snmp-server community NOC-RO informs',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `informs` keyword makes the host receive **acknowledged** informs. Without it the default is traps, which are unacknowledged. SNMPv1 has no Inform operation, and `snmp-server community` defines access for polling, not notification destinations.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each SNMP message by its direction and destination port.',
    categories: ['Manager → agent (UDP 161)', 'Agent → manager (UDP 162)'],
    items: [
      { text: 'GetRequest', category: 0 },
      { text: 'GetNextRequest', category: 0 },
      { text: 'GetBulkRequest', category: 0 },
      { text: 'SetRequest', category: 0 },
      { text: 'Trap', category: 1 },
      { text: 'InformRequest', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Every request that reads or writes data starts at the **manager** and goes to the agent on UDP 161. Notifications start at the **agent** and go to the manager on UDP 162.',
  },
  {
    id: 'e9',
    type: 'order',
    stem: 'Put the OID tree nodes in order from the root to the Cisco enterprise branch 1.3.6.1.4.1.9.',
    items: ['iso (1)', 'org (3)', 'dod (6)', 'internet (1)', 'private (4)', 'enterprises (1)', 'cisco (9)'],
    difficulty: 2,
    explanation:
      'Read the OID left to right: 1 = iso, 3 = org, 6 = dod, 1 = internet, 4 = private, 1 = enterprises and 9 = Cisco. Standard MIBs branch off internet through mgmt (2) instead of private (4).',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'Enter the OID of the Cisco enterprise branch in dotted-number form.',
    answers: ['1.3.6.1.4.1.9', '.1.3.6.1.4.1.9'],
    placeholder: 'x.x.x...',
    difficulty: 2,
    explanation:
      'Cisco\'s private MIBs live under **1.3.6.1.4.1.9** (iso.org.dod.internet.private.enterprises.cisco). 1.3.6.1.2.1 is the standard mib-2 branch.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements about SNMPv3 are true? (Choose two.)',
    options: [
      'Access is based on users that belong to groups',
      'The authPriv level provides both authentication and encryption',
      'Community strings are encrypted with AES',
      'The authNoPriv level encrypts the payload without authenticating it',
      'SNMPv3 removed support for Inform messages',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'SNMPv3 replaces communities with **users in groups**, and **authPriv** adds encryption to authentication. SNMPv3 does not use communities for security, authNoPriv authenticates but does **not** encrypt, and Informs remain available in v3.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. The NMS is configured for user alice with MD5 authentication and AES-128 privacy, using the correct passwords, but every request fails. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show snmp user

User name: alice
Engine ID: 800000090300A0B1C2D3E4F5
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: NOC-ADMINS`,
    },
    options: [
      'The authentication protocol does not match: R1 expects SHA',
      'The privacy protocol does not match: R1 expects DES',
      'SNMPv3 users cannot be polled; they can only receive traps',
      'The NMS must be configured with the group name instead of the username',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 authenticates alice with **SHA**, but the NMS uses MD5, so every message fails authentication. The privacy protocol already matches (AES128). SNMPv3 users can be polled normally, and the NMS identifies itself with the **username**; the group exists only on the agent.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'Complete the command snmp-server group NOC-ADMINS v3 ____ so that group members must use both authentication and encryption.',
    answers: ['priv'],
    placeholder: 'keyword',
    difficulty: 1,
    explanation:
      '`priv` selects the **authPriv** level. `auth` gives authNoPriv (no encryption) and `noauth` gives noAuthNoPriv.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. The NMS at 10.1.1.50 can poll R3, but it never receives any notifications from R3. Which command must be added?',
    exhibit: {
      kind: 'cli',
      text: `R3# show running-config | include snmp
snmp-server community Br4nch-RO RO 10
snmp-server location Branch 3
snmp-server contact noc@wizardccna.lab
snmp-server host 10.1.1.50 version 2c Br4nch-RO`,
    },
    options: [
      'snmp-server enable traps',
      'snmp-server community Br4nch-RO RW 10',
      'snmp-server host 10.1.1.50 version 2c Br4nch-RO udp-port 161',
      'snmp-server manager',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`snmp-server host` says **where** notifications go, but no notification type is enabled, so nothing is sent. `snmp-server enable traps` enables them. RW access matters only for Set, sending notifications to port 161 would aim them at the wrong port, and `snmp-server manager` enables the router\'s own SNMP manager function rather than its notifications.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about MIBs and OIDs are true? (Choose two.)',
    options: [
      'OIDs are organized in a hierarchical tree',
      'A MIB defines the objects an agent can expose',
      'OIDs are 128-bit hexadecimal values',
      'Every vendor must use the same private OIDs',
      'The MIB file is sent to the agent with each Get request',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'OIDs are **dotted-decimal paths in a global tree**, and the **MIB** describes which objects exist and what they mean. They are not 128-bit hex values, each vendor has its own branch under enterprises, and MIB files stay on the NMS — requests carry only OIDs.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each operations tool with the job it does best.',
    pairs: [
      { left: 'SNMP Get', right: 'Read the current value of an interface counter' },
      { left: 'SNMP Set', right: 'Change a value on the managed device' },
      { left: 'SNMP Inform', right: 'Deliver an acknowledged alarm to the NMS' },
      { left: 'Syslog', right: 'Keep a timestamped text record of events with severity levels' },
    ],
    difficulty: 2,
    explanation:
      'Get **reads** values and Set **writes** them. An Inform is the **acknowledged** SNMP notification. Syslog produces human-readable event messages with a severity, ideal for troubleshooting history and audit.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which statement describes model-driven streaming telemetry?',
    options: [
      'After a subscription, the device pushes YANG-modeled data to the collector',
      'The NMS polls MIB objects with Get requests on UDP 161 every few minutes',
      'The device sends unacknowledged text messages to a server on UDP 514',
      'The device sends a trap to the NMS only when a threshold is crossed',
    ],
    answer: 0,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'Streaming telemetry is **push-based**: a collector subscribes once, then the device streams **YANG-modeled** data periodically or on-change over transports such as gRPC or NETCONF. Polling on UDP 161 describes SNMP, UDP 514 text messages describe syslog, and threshold traps are SNMP notifications.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two characteristics apply to model-driven telemetry? (Choose two.)',
    options: [
      'Data is structured according to YANG models',
      'Updates can be sent on-change as well as periodically',
      'Access is controlled with SNMP community strings',
      'The collector must walk each OID with GetNext requests',
      'It is limited to sending traps to UDP port 162',
    ],
    answers: [0, 1],
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'Telemetry streams **YANG-modeled** data, either **periodically** or **on-change**. Community strings, GetNext walks and UDP 162 all belong to SNMP; telemetry typically uses TCP-based transports such as gRPC/gNMI or NETCONF.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. The NMS can read values from R1, but every attempt to change sysContact fails. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show snmp
Chassis: FDO2213A0BC
Contact: noc@wizardccna.lab
Location: HQ Building 1, Rack 4
930 SNMP packets input
    0 Bad SNMP version errors
    0 Unknown community name
    4 Illegal operation for community name supplied
    0 Encoding errors
    1852 Number of requested variables
    0 Number of altered variables
    846 Get-request PDUs
    80 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
<output omitted>`,
    },
    options: [
      'The NMS sends its Set requests with a read-only community',
      'The NMS uses a community string that R1 does not recognize',
      'R1 does not support SNMPv2c',
      'UDP 162 is blocked between R1 and the NMS',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**Illegal operation for community name supplied** counts operations the community does not allow — here the four Set attempts made with a **read-only** community, so no variables were altered. Unknown community name and Bad SNMP version errors are both 0, and UDP 162 affects only notifications, not Set requests sent to UDP 161.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'An NMS must retrieve a large interface table from a switch over SNMPv2c using as few request messages as possible. Which operation should it use?',
    options: ['Get', 'GetNext', 'GetBulk', 'Inform'],
    answer: 2,
    difficulty: 2,
    explanation:
      '**GetBulk** returns many consecutive objects in one response, which makes it the efficient way to read tables. GetNext walks the same table one object per request, Get needs every OID in advance, and Inform is an agent notification, not a read operation.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'A router reports sysUpTime = 8640000 TimeTicks. How many days has its SNMP agent been running? (Enter a number.)',
    answers: ['1', 'one'],
    placeholder: 'days',
    difficulty: 2,
    explanation:
      'TimeTicks are hundredths of a second: 8,640,000 ÷ 100 = 86,400 seconds, and 86,400 ÷ 3,600 = 24 hours — exactly **1** day.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Refer to the exhibit. Polling from the NMS works, but no traps from R1 ever reach the NMS. R1 is correctly configured to send traps. Which additional firewall rule is required?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.4,
        nodes: [
          { id: 'nms', icon: 'server', label: 'NMS', sub: '10.1.1.50', x: 1.2, y: 1.5, tone: 'accent' },
          { id: 'fw', icon: 'firewall', label: 'FW1', sub: 'permits NMS → devices, UDP 161', x: 5, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'SNMP agent', x: 8.8, y: 1.5 },
        ],
        links: [
          { from: 'nms', to: 'fw' },
          { from: 'fw', to: 'r1' },
        ],
      },
    },
    options: [
      'Permit UDP from R1 to the NMS with destination port 162',
      'Permit UDP from R1 to the NMS with destination port 161',
      'Permit TCP from the NMS to R1 with destination port 162',
      'Permit UDP from R1 to the NMS with destination port 514',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Traps flow from the **agent** to the manager\'s **UDP 162**, so that direction must be permitted. UDP 161 is the agent\'s listening port and is already covered for polling; SNMP notifications never use TCP 162 toward the agent; and UDP 514 is syslog.',
  },
];
