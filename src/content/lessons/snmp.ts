import type { LessonContent } from '../types';
import { flashcards, quiz } from './parts/snmp-cards';
import { exam } from './parts/snmp-exam';

const lesson: LessonContent = {
  id: 'snmp',
  slides: [
    {
      kind: 'title',
      title: 'SNMP: Monitoring and Managing Devices',
      subtitle: 'Managers and agents, MIBs and OIDs, Get/Set/Trap/Inform and SNMP versions',
      notes:
        'How does a network operations center know that a core switch is running at 95% CPU, that an uplink is dropping packets, or that a router rebooted at 03:12? For decades the answer has been the **Simple Network Management Protocol (SNMP)**. In this deck you will learn the SNMP building blocks — **manager**, **agent**, **MIB** and **OID** — the operations a manager and an agent exchange (Get, GetNext, GetBulk, Set, Trap and Inform) and the UDP ports they use, how **SNMPv1**, **v2c** and **v3** differ in features and security, and the IOS commands you need to recognize: `snmp-server community`, `snmp-server location`, `snmp-server contact`, `snmp-server host`, `snmp-server enable traps` and the SNMPv3 group and user commands. Finally you will compare SNMP with syslog and with modern **streaming telemetry**. On v1.1 this lesson covers topic 4.4 (explain the function of SNMP in network operations); on v2.0 SNMP falls under domain 5.',
    },
    {
      kind: 'bullets',
      title: 'What SNMP does',
      bullets: [
        '**Monitor** — poll counters: CPU, memory, interface traffic, errors, uptime',
        '**Alert** — agents push **notifications** when events occur',
        '**Configure** — write values with **Set** (rare, and risky)',
        'One **NMS** can watch thousands of devices from one screen',
        'Open standard: routers, switches, servers, printers, UPS units',
      ],
      diagram: {
        type: 'topology',
        width: 8,
        height: 5,
        nodes: [
          { id: 'nms', icon: 'server', label: 'NMS', sub: 'manager · 10.1.1.50', x: 1.4, y: 2.5, tone: 'accent' },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'agent', x: 6, y: 0.9 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'agent', x: 6, y: 2.5 },
          { id: 'prn', icon: 'printer', label: 'Printer', sub: 'agent', x: 6, y: 4.1 },
        ],
        links: [
          { from: 'nms', to: 'r1', arrow: 'both' },
          { from: 'nms', to: 'sw1', arrow: 'both' },
          { from: 'nms', to: 'prn', arrow: 'both' },
        ],
      },
      notes:
        'SNMP answers three operational needs. The first and most common is **monitoring**: the management station periodically asks each device for values such as CPU load, memory use, interface byte counters and error counters, then turns them into graphs, baselines and threshold alarms. The second is **alerting**: instead of waiting to be asked, a device can immediately send a **notification** when something happens — an interface goes down, a power supply fails, the device restarts. The third is **configuration**: a manager can write values with a Set operation, although in practice most organizations run SNMP read-only and push configuration with the CLI, NETCONF/RESTCONF or automation tools. Because SNMP is an open standard implemented by almost everything with a network port, a single **network management system (NMS)** can watch thousands of devices from many vendors. Exam questions usually test the roles: the NMS is the **manager**, and the SNMP software on each monitored device is the **agent**.',
    },
    {
      kind: 'definitions',
      title: 'SNMP building blocks',
      terms: [
        { term: '**Manager / NMS**', def: 'Software that polls agents, receives notifications and presents the data.' },
        { term: '**Agent**', def: 'SNMP process on the managed device; answers requests and sends notifications.' },
        { term: '**MIB**', def: 'Management Information Base: the tree-structured set of objects an agent exposes.' },
        { term: '**OID**', def: 'Object Identifier: a dotted-number path to one object, e.g. `1.3.6.1.2.1.1.5` (sysName).' },
        { term: '**Community string**', def: 'Shared secret that grants read-only (RO) or read-write (RW) access in SNMPv1/v2c.' },
        { term: '**Notification**', def: 'Unsolicited agent-to-manager message: a **Trap** (no ack) or an **Inform** (acknowledged).' },
      ],
      notes:
        'Four terms carry most exam questions. The **manager** — usually called the **NMS** — is the software that does the asking and the listening; it runs on a server in the operations center. The **agent** runs on every managed device; on IOS it is built in and is enabled by the first `snmp-server` command you enter. The agent does not expose raw memory; it exposes a **MIB**, a standardized, tree-structured description of objects such as the hostname, the uptime or the byte counters of each interface. Each object is identified by an **OID**, a sequence of numbers describing its position in the global tree, so `1.3.6.1.2.1.1.5` means the same thing — sysName — on every vendor\'s device. MIB files tell the NMS how to name and interpret each OID. In SNMPv1 and v2c, access is controlled by a **community string**, effectively a shared password sent in clear text, with read-only (RO) or read-write (RW) permission. Finally, **notifications** flow the other way — from agent to manager — as traps or informs.',
    },
    {
      kind: 'diagram',
      title: 'The OID tree',
      diagram: {
        type: 'flow',
        width: 12,
        height: 8,
        nodes: [
          { id: 'iso', label: 'iso', sub: '1', shape: 'round', x: 1.2, y: 1 },
          { id: 'org', label: 'org', sub: '1.3', shape: 'round', x: 3.6, y: 1 },
          { id: 'dod', label: 'dod', sub: '1.3.6', shape: 'round', x: 6, y: 1 },
          { id: 'inet', label: 'internet', sub: '1.3.6.1', shape: 'round', x: 8.6, y: 1, tone: 'accent' },
          { id: 'mgmt', label: 'mgmt', sub: '1.3.6.1.2', shape: 'round', x: 6, y: 3 },
          { id: 'priv', label: 'private', sub: '1.3.6.1.4', shape: 'round', x: 10.6, y: 3 },
          { id: 'mib2', label: 'mib-2', sub: '1.3.6.1.2.1', shape: 'round', x: 6, y: 5 },
          { id: 'ent', label: 'enterprises', sub: '1.3.6.1.4.1', shape: 'round', x: 10.6, y: 5 },
          { id: 'sys', label: 'system', sub: '1.3.6.1.2.1.1 · sysName = .5', x: 3.6, y: 7 },
          { id: 'ifs', label: 'interfaces', sub: '1.3.6.1.2.1.2', x: 8, y: 7 },
          { id: 'cisco', label: 'cisco', sub: '1.3.6.1.4.1.9', x: 10.6, y: 7, tone: 'accent' },
        ],
        edges: [
          { from: 'iso', to: 'org' },
          { from: 'org', to: 'dod' },
          { from: 'dod', to: 'inet' },
          { from: 'inet', to: 'mgmt' },
          { from: 'inet', to: 'priv' },
          { from: 'mgmt', to: 'mib2' },
          { from: 'priv', to: 'ent' },
          { from: 'mib2', to: 'sys' },
          { from: 'mib2', to: 'ifs' },
          { from: 'ent', to: 'cisco' },
        ],
      },
      caption: 'sysName on any device is `1.3.6.1.2.1.1.5.0` — the trailing `.0` is the instance of a single-value object.',
      notes:
        'OIDs form one global tree administered by standards bodies, and every branch has a number. Reading from the root: **iso (1)** → **org (3)** → **dod (6)** → **internet (1)**, which is why almost every OID you will ever see starts with **1.3.6.1**. Under internet, the **mgmt (2)** branch holds the standard MIBs: **mib-2** (1.3.6.1.2.1) contains the **system** group (1.3.6.1.2.1.1) — sysDescr, sysUpTime, sysContact, sysName, sysLocation — and the **interfaces** group (1.3.6.1.2.1.2) with per-interface counters. The **private (4)** branch contains **enterprises (1)**, where each vendor gets its own number: Cisco is **9**, so every Cisco-specific object lives under 1.3.6.1.4.1.9. When the NMS asks for a single-value (scalar) object it adds the instance **.0**, so `1.3.6.1.2.1.1.5.0` is the hostname; table objects end with an index instead, such as the interface index (ifIndex). You will not need to memorize long OIDs for the exam, but you should recognize that OIDs are hierarchical, that 1.3.6.1.4.1.9 means Cisco, and that MIBs define what each number means.',
    },
    {
      kind: 'table',
      title: 'Well-known OIDs',
      columns: ['Object', 'OID', 'Returns'],
      rows: [
        ['sysDescr', '`1.3.6.1.2.1.1.1`', 'Hardware and software description'],
        ['sysUpTime', '`1.3.6.1.2.1.1.3`', 'Time since the agent started, in hundredths of a second'],
        ['sysContact', '`1.3.6.1.2.1.1.4`', 'Value of `snmp-server contact`'],
        ['sysName', '`1.3.6.1.2.1.1.5`', 'Device hostname'],
        ['sysLocation', '`1.3.6.1.2.1.1.6`', 'Value of `snmp-server location`'],
        ['ifInOctets', '`1.3.6.1.2.1.2.2.1.10`', 'Bytes received — one instance per ifIndex'],
        ['cisco (enterprise)', '`1.3.6.1.4.1.9`', 'Root of all Cisco private MIBs'],
      ],
      notes:
        'These objects appear in almost every monitoring system. The **system group** identifies the device: sysDescr returns a text description (on IOS, the software version string), sysName the hostname, and sysContact and sysLocation return exactly what you configure with `snmp-server contact` and `snmp-server location` — which is why those commands matter: when an alarm fires at 3 a.m., the NMS can show who owns the device and which rack it sits in. **sysUpTime** is measured in **TimeTicks**, hundredths of a second, so a value of 8,640,000 is exactly one day; a sudden drop to a small value tells the NMS the agent restarted, usually because the device rebooted. Interface statistics live in the interfaces group and the newer IF-MIB: ifInOctets and ifOutOctets count bytes, and the NMS computes utilization by polling twice and dividing the difference by the interval. Standard 32-bit counters wrap quickly on fast links — a saturated 1 Gbps interface wraps a 32-bit byte counter in about 34 seconds — which is why SNMPv2c introduced 64-bit counters such as ifHCInOctets.',
    },
    {
      kind: 'diagram',
      title: 'Manager-initiated operations',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'nms', label: 'NMS 10.1.1.50', icon: 'server' },
          { id: 'agent', label: 'R1 agent', icon: 'router' },
        ],
        steps: [
          { from: 'nms', to: 'agent', label: 'GetRequest sysUpTime.0', sub: 'to UDP port 161' },
          { from: 'agent', to: 'nms', label: 'Response 12345600', sub: '= 1 day 10:17:36', dashed: true },
          { from: 'nms', to: 'agent', label: 'GetNextRequest ifDescr', sub: 'next OID in the tree — used to walk tables' },
          { from: 'agent', to: 'nms', label: 'Response ifDescr.1 = GigabitEthernet0/0/0', dashed: true },
          { from: 'nms', to: 'agent', label: 'GetBulkRequest ifTable', sub: 'v2c/v3: many objects in one request', tone: 'accent' },
          { from: 'nms', to: 'agent', label: 'SetRequest sysContact.0', sub: 'needs an RW community or a v3 write view', tone: 'warn' },
          { from: 'agent', to: 'nms', label: 'Response (success or error)', dashed: true },
        ],
      },
      notes:
        'Four operations start at the manager, and each one gets a **Response** from the agent. **Get** reads one or more specific OIDs — here sysUpTime.0, returned as 12,345,600 ticks, which is 1 day, 10 hours, 17 minutes and 36 seconds. **GetNext** asks for the object that follows a given OID in the tree; by repeating GetNext with each answer, the NMS can walk an entire table, such as every interface description, without knowing in advance how many rows exist (the classic snmpwalk tool does exactly that). **GetBulk**, added in **SNMPv2c**, does the same job far more efficiently by returning many consecutive objects in a single response. **Set** writes a value — changing sysContact, shutting an interface or even triggering a configuration copy — so it requires **read-write** access. All of these requests are sent to the agent on **UDP port 161**. Because UDP provides no delivery guarantee, the manager simply retries after a timeout; if a device never answers, the NMS marks it unreachable.',
    },
    {
      kind: 'diagram',
      title: 'Agent-initiated notifications',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'agent', label: 'SW1 agent', icon: 'switch' },
          { id: 'nms', label: 'NMS 10.1.1.50', icon: 'server' },
        ],
        steps: [
          { note: 'Interface Gi0/1 on SW1 goes down', tone: 'bad' },
          { from: 'agent', to: 'nms', label: 'Trap: linkDown', sub: 'to UDP port 162 · no acknowledgment' },
          { note: 'If the trap is lost, the NMS never learns of the event', tone: 'warn' },
          { from: 'agent', to: 'nms', label: 'InformRequest: linkDown', sub: 'to UDP port 162 · SNMPv2c/v3', tone: 'accent' },
          { from: 'nms', to: 'agent', label: 'Response (acknowledgment)', dashed: true },
          { note: 'No response before the timeout → the agent resends the inform' },
        ],
      },
      notes:
        'Notifications travel in the opposite direction: the **agent** starts the conversation and sends it to the manager on **UDP port 162**. A **Trap** is fire-and-forget — the agent sends it once and never learns whether it arrived. That is efficient, but on a congested or failing network, exactly when alarms matter most, a lost trap means a lost event. An **Inform**, introduced with SNMPv2 and available in **v2c and v3**, fixes that: the manager must answer with a Response, and if the agent does not receive one before a timeout, it retransmits the inform a configurable number of times. The cost is extra traffic and memory on the device, which must hold each inform until it is acknowledged. On IOS you choose per destination: `snmp-server host 10.1.1.50 version 2c COMMUNITY` sends traps, while adding the `informs` keyword sends informs instead. Exam phrasing to watch for: "acknowledged notification" or "reliable notification" means **Inform**; "unsolicited, unacknowledged message" means **Trap**.',
    },
    {
      kind: 'table',
      title: 'SNMP operations summary',
      columns: ['Operation', 'Sent by', 'Purpose', 'Versions'],
      rows: [
        ['Get', 'Manager', 'Read specific OIDs', 'v1, v2c, v3'],
        ['GetNext', 'Manager', 'Read the next OID (walk a table)', 'v1, v2c, v3'],
        ['GetBulk', 'Manager', 'Read many OIDs in one request', '**v2c, v3**'],
        ['Set', 'Manager', 'Write a value', 'v1, v2c, v3'],
        ['Response', 'Agent (manager when acking an Inform)', 'Answer a request', 'All'],
        ['Trap', 'Agent', 'Unacknowledged notification', 'v1, v2c, v3'],
        ['Inform', 'Agent', '==Acknowledged== notification', '**v2c, v3**'],
      ],
      notes:
        'This table is worth memorizing because operation questions are pure recall. The first four are **manager-initiated** and are sent to the agent on UDP 161; Trap and Inform are **agent-initiated** and are sent to the manager on UDP 162. Two operations did not exist in SNMPv1 — **GetBulk** and **Inform** — and both are supported in v2c and v3. Response is the only message both sides send: the agent answers Get, GetNext, GetBulk and Set requests with it, and the manager uses it to acknowledge an Inform. (In SNMPv1 the reply was called GetResponse, and you may see either name.) For drag-and-drop questions that sort operations into "manager to agent" and "agent to manager", put Get, GetNext, GetBulk and Set on one side and Trap and Inform on the other. And if a question asks which operation a manager uses to change a device setting, the answer is Set — it is the only write operation SNMP has.',
    },
    {
      kind: 'diagram',
      title: 'Two ports to remember: 161 and 162',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.4,
        nodes: [
          { id: 'nms', icon: 'server', label: 'NMS', sub: '10.1.1.50 · listens on UDP 162', x: 1.6, y: 2.2, tone: 'accent' },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'agent · listens on UDP 161', x: 8.4, y: 1 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'agent · listens on UDP 161', x: 8.4, y: 3.4 },
        ],
        links: [
          { from: 'nms', to: 'r1', label: 'Get / Set → UDP 161', arrow: 'forward' },
          { from: 'sw1', to: 'nms', label: 'Trap / Inform → UDP 162', arrow: 'forward', tone: 'accent' },
        ],
      },
      caption: 'Requests go to the agent on 161; notifications go to the manager on 162.',
      notes:
        'SNMP uses **UDP** for everything, with two well-known ports. The **agent** listens on **UDP 161**, so every Get, GetNext, GetBulk and Set arrives there (from a random source port on the NMS). The **manager** listens on **UDP 162**, so traps and informs from the devices arrive there. This matters most when there is a firewall between the NMS and the devices: permitting only UDP 161 from the NMS to the devices lets polling work, but traps and informs heading back to UDP 162 on the NMS are silently dropped, and the operations team loses its alarms. Why UDP rather than TCP? Monitoring must keep working when the network is in trouble; UDP needs no connection state, adds little overhead to thousands of polls, and lets the NMS handle retries itself. Secure SNMP transports over TLS and DTLS exist but are not on the CCNA. In exam questions, the port that must be open for traps is **162**, the port the agent listens on is **161** — and neither is TCP.',
    },
    {
      kind: 'table',
      title: 'SNMPv1, v2c and v3 compared',
      columns: ['Feature', 'SNMPv1', 'SNMPv2c', 'SNMPv3'],
      rows: [
        ['Access control', 'Community string', 'Community string', '**Users** in groups, with views'],
        ['Authentication', 'Community only (clear text)', 'Community only (clear text)', 'HMAC with **MD5 or SHA**'],
        ['Encryption', 'None', 'None', '**DES, 3DES or AES** (authPriv)'],
        ['GetBulk', 'No', '**Yes**', 'Yes'],
        ['Inform', 'No', '**Yes**', 'Yes'],
        ['Counters', '32-bit', '**64-bit** added', '64-bit'],
        ['Use today', 'Legacy only', 'Common, ideally read-only', '==Recommended=='],
      ],
      notes:
        'SNMPv1 is the original version from the late 1980s: communities for access, the basic operations and 32-bit counters. **SNMPv2c** kept the same community-based security — the "c" stands for **community** — but added **GetBulk**, the acknowledged **Inform**, **64-bit counters** (Counter64) and better error reporting. Its weakness is security: the community string travels in **clear text** in every packet, so anyone who can capture traffic can read it, and a read-write community in the wrong hands lets an attacker reconfigure devices. **SNMPv3** adds real security through the User-based Security Model: individual **usernames** grouped for access control, **authentication** with HMAC-MD5 or HMAC-SHA (which also proves that the message was not altered), **encryption** (privacy) with DES, 3DES or AES, and protection against replayed messages. Views let you limit which parts of the MIB each group may read or write. Best practice is SNMPv3 with authPriv; if v2c must be used, keep it read-only and restrict it with an ACL. Exam favourites: which version adds encryption (v3) and which two features v2c added (GetBulk and Inform).',
    },
    {
      kind: 'table',
      title: 'SNMPv3 security levels',
      columns: ['Level', 'IOS keyword', 'Authentication', 'Encryption'],
      rows: [
        ['noAuthNoPriv', '`noauth`', 'Username match only', 'No'],
        ['authNoPriv', '`auth`', 'HMAC-MD5 or HMAC-SHA', 'No'],
        ['authPriv', '`priv`', 'HMAC-MD5 or HMAC-SHA', '==Yes== — DES, 3DES or AES'],
      ],
      notes:
        'SNMPv3 security comes in three levels, and the names describe them exactly: **auth** means authentication and **priv** means privacy (encryption). **noAuthNoPriv** identifies the user by name only, which is no better than a community string. **authNoPriv** adds a keyed hash computed with the user\'s authentication password, proving who sent the message and that it was not modified in transit — but the contents are still readable on the wire. **authPriv** also encrypts the payload, so neither the data nor the requested OIDs can be read by an eavesdropper; this is the level to use in production. On IOS the level is set on the **group** with the keywords `noauth`, `auth` or `priv` (for example `snmp-server group NOC-ADMINS v3 priv`), and each **user** is created in a group with its own authentication and privacy passwords. A user must meet the level of its group: a user configured without a privacy password cannot use a `priv` group. Exam questions often describe a requirement — "authenticate and encrypt" — and ask for the level (authPriv) or the IOS keyword (`priv`).',
    },
    {
      kind: 'cli',
      title: 'Configuring SNMPv2c on IOS',
      code: `R1(config)# access-list 10 permit host 10.1.1.50
R1(config)# snmp-server community Wiz-R3ad RO 10
R1(config)# snmp-server community Wiz-Wr1te RW 10
R1(config)# snmp-server location HQ Building 1, Rack 4
R1(config)# snmp-server contact noc@wizardccna.lab
R1(config)# snmp-server host 10.1.1.50 version 2c Wiz-R3ad
R1(config)# snmp-server enable traps`,
      highlight: ['RO 10', 'RW 10', 'snmp-server host', 'enable traps'],
      bullets: [
        'RO → Get, GetNext, GetBulk; RW → Set as well',
        'ACL 10 limits which NMS addresses may use each community',
        '`snmp-server host` — where notifications are sent',
        '`snmp-server enable traps` — which events generate them',
      ],
      notes:
        'A typical v2c configuration has four parts. **Access**: `snmp-server community Wiz-R3ad RO 10` creates a read-only community, and the trailing `10` references a standard ACL so that only the NMS at 10.1.1.50 may use it; requests with the right community from any other source are ignored. A second, read-write community allows Set operations — many organizations never configure one at all. **Identity**: `snmp-server location` and `snmp-server contact` populate sysLocation and sysContact. **Destination**: `snmp-server host 10.1.1.50 version 2c Wiz-R3ad` tells the agent to send notifications to the NMS as v2c traps carrying that community string; adding the `informs` keyword (`snmp-server host 10.1.1.50 informs version 2c Wiz-R3ad`) sends acknowledged informs instead. **Events**: `snmp-server enable traps` with no keywords enables every notification type the device supports; production configurations usually list specific types. Note that IOS has **no SNMP configured by default** — the first `snmp-server` command enables the agent — and IOS has no default "public" community, although many other products ship with one.',
    },
    {
      kind: 'cli',
      title: 'Configuring SNMPv3 with authPriv',
      code: `R1(config)# snmp-server group NOC-ADMINS v3 priv
R1(config)# snmp-server user alice NOC-ADMINS v3 auth sha Auth-Pa55word priv aes 128 Priv-Pa55word
R1(config)# snmp-server host 10.1.1.50 version 3 priv alice
R1(config)# snmp-server enable traps
R1(config)# end
R1# show snmp user

User name: alice
Engine ID: 800000090300A0B1C2D3E4F5
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: NOC-ADMINS`,
      highlight: ['v3 priv', 'auth sha', 'priv aes 128', 'version 3 priv'],
      notes:
        'SNMPv3 replaces the community with a **group** and **users**. The group defines the security model and level — `v3 priv` means every member must use authentication and encryption — and can also name the MIB views it may read, write or receive notifications for (if you specify none, IOS applies a default read view). The user command then creates `alice` in that group with an **authentication** algorithm and password (`auth sha …`) and a **privacy** algorithm and password (`priv aes 128 …`). The NMS must be configured with the same username, algorithms and passwords. For notifications, `snmp-server host 10.1.1.50 version 3 priv alice` sends authenticated and encrypted traps as user alice. Verify with `show snmp user`, which lists each user\'s authentication and privacy protocols and group, and with `show snmp group`, which shows each group\'s security model and views. The **Engine ID** uniquely identifies this SNMP agent; the actual authentication and privacy keys are derived from the passwords combined with it. For the CCNA, recognize the structure — group, user, host — and the security keywords; you will not be asked to type the full user command from memory.',
    },
    {
      kind: 'cli',
      title: 'Verifying SNMP',
      code: `R1# show snmp
Chassis: FDO2213A0BC
Contact: noc@wizardccna.lab
Location: HQ Building 1, Rack 4
1402 SNMP packets input
    0 Bad SNMP version errors
    6 Unknown community name
    0 Illegal operation for community name supplied
    0 Encoding errors
    2807 Number of requested variables
    0 Number of altered variables
    1311 Get-request PDUs
    85 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
1459 SNMP packets output
    0 Too big errors (Maximum packet size 1500)
    0 No such name errors
    0 Bad values errors
    0 General errors
    1396 Response PDUs
    63 Trap PDUs
R1# show snmp host
Notification host: 10.1.1.50    udp-port: 162   type: trap
user: Wiz-R3ad  security model: v2c`,
      highlight: ['6 Unknown community name', 'udp-port: 162', 'type: trap'],
      notes:
        '`show snmp` is the agent\'s dashboard. The top lines echo the chassis serial number, the contact and the location you configured. The input counters show what the agent has been asked and what went wrong: **Unknown community name** counts requests carrying a community string the agent does not recognize — six here, which could be a mistyped string on a new NMS or someone scanning for the classic "public" community; **Bad SNMP version errors** counts requests using a version the agent is not configured for; **Illegal operation for community name supplied** increments when, for example, a Set arrives with a read-only community. The Get-request and Get-next counters show that polling is working. On the output side, Response PDUs answer those requests and Trap PDUs counts notifications sent. `show snmp host` confirms where notifications go — 10.1.1.50, UDP port 162, as v2c traps. Related commands: `show snmp community` lists the communities, `show snmp user` and `show snmp group` cover SNMPv3, and `show running-config | include snmp` shows the whole configuration at once.',
    },
    {
      kind: 'compare',
      title: 'SNMP polling vs streaming telemetry',
      left: {
        heading: 'SNMP (pull)',
        bullets: [
          'NMS **polls** on a timer — often every 1–5 minutes',
          'UDP, MIBs and OIDs; traps for events',
          'Short spikes between polls can be missed',
          'Heavy polling costs device CPU',
          'Universal: every vendor, every device type',
        ],
      },
      right: {
        heading: 'Model-driven telemetry (push)',
        tone: 'accent',
        bullets: [
          'Device **streams** data after a subscription',
          '**Periodic** or **on-change** updates',
          'Data structured by **YANG** models; GPB or JSON encoding',
          'Carried over TCP: gRPC/gNMI or NETCONF',
          'Feeds analytics and AIOps platforms',
        ],
      },
      notes:
        'SNMP\'s pull model has limits at modern scale. If an NMS polls every five minutes, a 30-second burst that saturates a link can vanish into the average, and polling thousands of OIDs across thousands of devices costs CPU on both ends. **Streaming telemetry** (model-driven telemetry) turns the model around: a collector subscribes once, and the device then **pushes** data continuously — either **periodically**, every few seconds if needed, or **on-change**, only when a value such as an interface state actually changes. The data is structured according to **YANG** data models (the same models used by NETCONF and RESTCONF), encoded efficiently (Google Protocol Buffers or JSON) and carried over TCP-based transports such as **gRPC** (gNMI) or NETCONF. That high-resolution, structured stream is what AI-driven analytics and AIOps platforms consume. SNMP is not going away — it is universal and simple — but for high-frequency operational data, telemetry is the modern answer. Streaming telemetry is not named in the v1.1 blueprint; this course treats it as v2.0 material, so the related flashcards and questions are tagged `v2.0`.',
    },
    {
      kind: 'table',
      title: 'SNMP, syslog and telemetry in operations',
      columns: ['Tool', 'Model', 'Transport', 'Best for'],
      rows: [
        ['SNMP polling', 'Pull — manager asks', 'UDP 161', 'Counters, utilization graphs, inventory'],
        ['SNMP trap / inform', 'Push — event', 'UDP 162', 'Alarms: link down, reboot, threshold crossed'],
        ['Syslog', 'Push — event text', 'UDP 514', 'Detailed, human-readable event history'],
        ['Streaming telemetry', 'Push — subscription', 'TCP (gRPC, NETCONF)', 'High-frequency metrics for analytics and AIOps'],
      ],
      notes:
        'Operations teams rarely choose just one of these, because each answers a different question. **SNMP polling** answers "how busy is it?" — periodic numeric values turned into utilization graphs, capacity trends and inventory reports. **SNMP notifications** answer "did something important just happen?" — a structured, machine-readable alarm the NMS can act on immediately. **Syslog** answers "what exactly happened, and when?" — a stream of text messages with a severity level (the next lesson) that records far more event types than traps do, including configuration changes, logins and protocol state changes; it is ideal for troubleshooting and audit, especially when centralized and timestamped with NTP. **Streaming telemetry** answers "what is happening right now, in detail?" at a resolution SNMP polling cannot match. A common exam angle is to describe a need and ask for the tool: acknowledged event delivery (SNMP inform), reading an interface counter (SNMP Get), a searchable record of configuration changes (syslog). Remember the ports as a set: **161/162** for SNMP and **514** for syslog, all UDP.',
    },
    {
      kind: 'steps',
      title: 'Troubleshooting SNMP',
      steps: [
        { title: 'Every poll times out', text: 'Check community and version: `Unknown community name` or `Bad SNMP version errors` climbing in `show snmp`.' },
        { title: 'Right community, still no answer', text: 'The ACL on the community may not permit the NMS; a firewall may block UDP 161.' },
        { title: 'Reads work, Set fails', text: 'The community is RO (`Illegal operation for community name supplied`), or the v3 group has no write view.' },
        { title: 'No traps arrive', text: 'Missing `snmp-server host` or `snmp-server enable traps`, or UDP 162 blocked toward the NMS.' },
        { title: 'SNMPv3 fails', text: 'Username, algorithms or passwords differ, or the NMS uses a lower security level than the group requires.' },
      ],
      notes:
        'Most SNMP problems fall into a few patterns, and the counters in `show snmp` point you to the right one. If every poll times out, compare the NMS settings with the device: a mistyped community increments **Unknown community name**, and a version mismatch — the NMS using SNMPv1 while the device expects something else, for example — increments **Bad SNMP version errors**. If the community is right but the device still ignores the NMS, the **ACL** attached to the community may not permit the NMS address — a common problem after the NMS moves to a new server — or a firewall may drop UDP 161. If reads work but writes fail, the community is **read-only**. If no alarms arrive, the notification half is missing: there must be an `snmp-server host` pointing at the NMS and at least one `snmp-server enable traps`, and UDP 162 must be allowed from the device to the NMS. With SNMPv3, every parameter must match — username, SHA or MD5, AES or DES, and both passwords — and the NMS must use at least the security level required by the group.',
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'SNMP exam traps',
      body: 'SNMP questions reward precise recall of ports, directions and versions.',
      bullets: [
        'Agent listens on **UDP 161**; manager receives traps/informs on **UDP 162**',
        '**Inform** = acknowledged; **Trap** = unacknowledged',
        'v2c added **GetBulk** and **Inform** (and 64-bit counters) — not security',
        'Only **SNMPv3** authenticates users and encrypts (authPriv)',
        'noAuthNoPriv / authNoPriv / authPriv = IOS `noauth` / `auth` / `priv`',
        'An RO community cannot Set; the number after it is an ACL of allowed managers',
        '`snmp-server host` = where notifications go; `enable traps` = which events',
      ],
      notes:
        'Each of these traps has caught many candidates. Ports come first: the agent is on **161** and the manager on **162** — reversed answers are common distractors, and so is TCP. For notifications, the words "acknowledged" or "reliable" always point to **Inform**; traps are never acknowledged. For versions, remember that SNMPv2c improved **features** (GetBulk, Inform, 64-bit counters) but not **security** — it still uses clear-text communities — so any question about encryption or per-user authentication has v3 as the answer. Match the v3 levels to their IOS keywords, and remember that "priv" means encryption. Configuration questions test the difference between RO and RW, the meaning of the number after the community (a standard ACL of permitted managers), and the split of responsibilities between `snmp-server host` (destination, version and community for notifications) and `snmp-server enable traps` (which event types generate them). Finally, the manager is the NMS and the agent is on the managed device — never the other way round.',
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'The NMS (manager) talks to **agents**; agents expose **MIB** objects named by **OIDs**',
        'OIDs are hierarchical: `1.3.6.1.2.1` = mib-2, `1.3.6.1.4.1.9` = Cisco',
        'Get, GetNext, GetBulk, Set → agent **UDP 161**; Trap, Inform → manager **UDP 162**',
        'v1/v2c: clear-text communities (RO/RW); v2c adds GetBulk, Inform, 64-bit counters',
        'v3: users and groups — noAuthNoPriv, authNoPriv, **authPriv**',
        'IOS: `snmp-server community`, `location`, `contact`, `host`, `enable traps`, `group`, `user`',
        'SNMP polls; syslog and telemetry push — each answers a different question',
      ],
      notes:
        'SNMP is the long-standing standard for monitoring network devices. A manager (the NMS) talks to agents on managed devices; each agent exposes a MIB of objects identified by hierarchical OIDs, with standard objects under 1.3.6.1.2.1 and vendor objects under 1.3.6.1.4.1 — Cisco is enterprise 9. The manager reads with Get, GetNext and GetBulk and writes with Set, all sent to UDP 161 on the agent; the agent reports events with unacknowledged Traps or acknowledged Informs sent to UDP 162 on the manager. SNMPv1 and v2c rely on clear-text community strings with read-only or read-write access, and v2c added GetBulk, Inform and 64-bit counters; SNMPv3 adds users, groups, authentication and encryption through the noAuthNoPriv, authNoPriv and authPriv levels. On IOS, know the `snmp-server` commands for communities, location, contact, notification hosts, traps and v3 groups and users. In daily operations SNMP works alongside syslog and, increasingly, streaming telemetry. Next up: syslog, the text-based event stream every device produces.',
    },
  ],
  flashcards,
  quiz,
  exam,
};

export default lesson;
