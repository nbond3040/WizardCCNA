import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'automation-impact',
  slides: [
    {
      kind: 'title',
      title: 'How Automation Changes Network Management',
      subtitle: 'From box-by-box CLI to programmable, intent-driven networks',
      notes:
        "For most of networking history a network was run one box at a time: open an SSH session, type commands, verify, save, and move on to the next device. That model works for ten routers and collapses at a thousand. This deck explains **why manual CLI management breaks down**, what automation delivers in return, how the **management, control and data planes** divide a device's work, which families of tools automate networks today, and what **intent-based networking** means. It maps to v1.1 exam topic 6.1 and to v2.0 Domain 5 (AI and Network Operations), and it builds the vocabulary you will reuse in the controller, REST API, JSON and Ansible/Terraform lessons that follow.",
    },
    {
      kind: 'bullets',
      title: 'The box-by-box problem',
      bullets: [
        'Every change = log in, type, verify, save — **per device**',
        '**Time**: effort grows linearly with the device count',
        '**Human error**: typos, wrong interface, a skipped step',
        '**Inconsistency**: two engineers, two different "standards"',
        '**Configuration drift**: devices slowly diverge from the approved baseline',
        '**Scale**: hundreds of sites will not fit in one maintenance window',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'eng', icon: 'user', label: 'Engineer', sub: 'one session at a time', x: 1.2, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 0.8 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 8, y: 1.7 },
          { id: 'sw2', icon: 'switch', label: 'SW2', sub: 'config drift', x: 8, y: 3.4, tone: 'warn' },
          { id: 'r2', icon: 'router', label: 'R2', x: 5, y: 4.2 },
        ],
        links: [
          { from: 'eng', to: 'r1', style: 'dashed', label: 'SSH' },
          { from: 'eng', to: 'sw1', style: 'dashed', label: 'SSH' },
          { from: 'eng', to: 'sw2', style: 'dashed', label: 'SSH' },
          { from: 'eng', to: 'r2', style: 'dashed', label: 'SSH' },
        ],
      },
      notes:
        "Picture a routine request: add a voice VLAN to every access switch. With device-by-device management an engineer logs in to each switch, types the same handful of commands, checks the result and saves — then repeats that hundreds of times. Five problems appear. **Time**: the work scales linearly with the number of devices, so big changes spill past the maintenance window. **Human error**: a mistyped VLAN ID or the wrong interface on one switch in fifty is almost inevitable. **Inconsistency**: two engineers solve the same problem two slightly different ways. **Configuration drift**: quick fixes made under pressure are never rolled back or documented, so devices slowly move away from the approved standard — the switch marked *config drift* in the diagram. **Scale**: the business wants new sites and services in hours, not weeks. On the exam these drawbacks are the mirror image of the benefits Cisco lists for automation; if a stem asks why an organization should automate, look for consistency, speed and fewer errors, not answers about replacing protocols.",
    },
    {
      kind: 'diagram',
      title: 'How configuration drift creeps in',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'n1', label: 'Approved baseline', sub: 'golden config', shape: 'pill' },
          { id: 'n2', label: 'Emergency fix', sub: '2 a.m. CLI change' },
          { id: 'n3', label: 'Not documented', sub: 'no ticket, no backup' },
          { id: 'n4', label: 'Device ≠ standard', sub: 'drift', tone: 'warn' },
          { id: 'n5', label: 'Next change fails', sub: 'surprise outage', tone: 'bad', shape: 'round' },
        ],
      },
      caption: 'Drift is silent until the next change collides with it.',
      notes:
        "Drift rarely comes from one bad decision. It starts with a sound **golden configuration** — the approved baseline for a device role such as *branch router* or *access switch*. Then, during a 2 a.m. outage, an engineer changes an ACL or adds a static route directly on the CLI. The fix works, nobody opens a ticket, and the backup job did not run that night. The device now differs from the standard, but nothing breaks — yet. Weeks later a planned change is written against the standard, collides with the undocumented difference and causes a surprise outage that is hard to diagnose, because nobody knew that device was different. Automation attacks drift in two ways: it **enforces** the standard every time it runs, and it **detects** differences by comparing live configurations with the source of truth and reporting or correcting them. Expect exam wording such as *configuration drift* or *inconsistent configurations across devices* as the problem that configuration management tools and controllers are designed to solve.",
    },
    {
      kind: 'table',
      title: 'Manual CLI vs automation at scale',
      columns: ['Task (200 switches)', 'Manual CLI', 'Automated'],
      rows: [
        ['Add a VLAN everywhere', '200 × 5 min ≈ **17 hours**', 'Minutes, many devices in parallel'],
        ['Error rate', 'Typos grow with device count', 'Same tested code on every device'],
        ['Consistency', 'Depends on who typed it', 'Identical by design'],
        ['Audit / compliance', 'Occasional manual spot checks', 'Every device checked on every run'],
        ['Rollback', 'Retype the old commands', 'Re-apply the previous version from Git'],
        ['Documentation', 'Often stale', 'The code *is* the documentation'],
      ],
      caption: 'Illustrative figures — the pattern, not the exact numbers, is what matters.',
      notes:
        "Numbers make the argument concrete. Suppose a change takes five minutes per switch by hand. Across 200 switches that is 1,000 minutes — almost 17 hours of focused, repetitive typing, far longer than a normal maintenance window. Even a 1% error rate leaves about two switches misconfigured, and finding those two becomes a project of its own. An automation tool runs the same tested change against many devices in parallel, so the job finishes in minutes and every device receives identical commands. The other rows matter just as much. Automated runs can audit every device on every run instead of spot-checking a few. Rollback means re-applying the previous version of a file from version control rather than retyping old commands from memory. And because the desired state lives in code, the documentation is always current. These figures are illustrative, not Cisco specifications, but the exam expects you to recognize the pattern: automation replaces slow, error-prone, per-device work with fast, consistent and repeatable operations.",
    },
    {
      kind: 'bullets',
      title: 'What automation delivers',
      bullets: [
        '**Consistency** — every device built from the same template',
        '**Speed** — changes roll out in parallel, in minutes',
        '**Fewer errors** — tested code replaces hand-typed commands',
        '**Compliance** — continuous checks against the standard, with reports',
        '**Faster troubleshooting** — streaming telemetry and correlated data',
        '**Lower OpEx** — engineers spend time on design, not repetition',
        '**Agility** — new sites and services deployed on demand',
      ],
      notes:
        "These are the benefits Cisco associates with automation, and they appear almost word for word in exam options. **Consistency** comes from building every device from the same template and variables. **Speed** comes from parallel execution and from removing manual hand-offs. **Fewer errors** follow because code is tested once and reused, rather than retyped hundreds of times. **Compliance** becomes continuous: a job can check every device against the security baseline every night and produce an audit report automatically. **Faster troubleshooting** comes from better data — streaming telemetry, centralized logs and controller analytics show the whole network instead of one box at a time. **Lower OpEx** (operating expense) is the business result: fewer outages, less repetitive labor and faster provisioning. Finally, **agility**: new branches and services can be deployed when the business asks for them. Watch for distractors such as *eliminates the need for network engineers* or *removes the need to understand protocols* — automation changes the job, it does not remove it.",
    },
    {
      kind: 'diagram',
      title: 'The three planes of a network device',
      diagram: {
        type: 'stack',
        columns: [
          {
            title: 'Plane',
            layers: [
              { label: 'Management plane', sub: 'operate the device' },
              { label: 'Control plane', sub: 'decide, build the tables' },
              { label: 'Data plane', sub: 'forward the traffic', tone: 'accent' },
            ],
          },
          {
            title: 'Examples',
            layers: [
              { label: 'SSH, Telnet, SNMP, syslog', sub: 'NETCONF, RESTCONF, HTTPS GUI' },
              { label: 'OSPF, EIGRP, BGP, STP', sub: 'ARP, IPv6 NDP, MAC learning' },
              { label: 'Frame and packet forwarding', sub: 'ACL filtering, NAT, QoS, 802.1Q tags, VPN encryption', tone: 'accent' },
            ],
          },
          {
            title: 'Runs on',
            layers: [
              { label: 'CPU', sub: 'software processes' },
              { label: 'CPU', sub: 'software processes' },
              { label: 'ASICs / CEF', sub: 'hardware, line rate', tone: 'accent' },
            ],
          },
        ],
      },
      caption: 'Traffic to the device itself is handled by the CPU; transit traffic should stay in the data plane.',
      notes:
        "Every router and switch divides its work into three planes. The **data plane** (also called the forwarding plane) does the job users care about: receive a frame or packet, look up where it goes, rewrite headers and send it out. Encapsulation, 802.1Q tagging, ACL filtering, NAT, QoS actions and VPN encryption of transit traffic are data plane work, normally done in hardware ASICs or by CEF at line rate. The **control plane** decides *how* the data plane should forward by building its tables: OSPF, EIGRP and BGP build the routing table, STP decides which ports forward, ARP and IPv6 NDP resolve neighbors, and switch MAC learning fills the MAC address table (the official cert guide lists MAC learning with the control plane because it builds a table). The **management plane** lets people and systems operate the device: SSH, Telnet, the HTTPS GUI, SNMP, syslog, NETCONF and RESTCONF. Control and management traffic addressed to the device is processed by the CPU, which is why a flood of management traffic can hurt a router. Controller-based networking moves much of the control plane off the box.",
    },
    {
      kind: 'table',
      title: 'Which plane? Classify the function',
      columns: ['Function', 'Plane', 'Why'],
      rows: [
        ['OSPF hellos and LSA flooding', '**Control**', 'Builds the routing table'],
        ['STP BPDU exchange', '**Control**', 'Decides which ports forward'],
        ['ARP request and reply', '**Control**', 'Builds the table used for MAC rewrites'],
        ['Forwarding a packet using the FIB', '**Data**', 'Moves user traffic'],
        ['ACL permit/deny on transit traffic', '**Data**', 'Acts on each passing packet'],
        ['NAT/PAT address translation', '**Data**', 'Rewrites headers of forwarded packets'],
        ['Admin SSH login, SNMP poll, syslog', '**Management**', 'Operates and monitors the device'],
      ],
      notes:
        "Use a simple test to classify any function. If it **builds or maintains a table** that forwarding will later use, it is **control plane**: OSPF hellos and LSAs, EIGRP updates, STP BPDUs and ARP exchanges. If it **acts on each passing packet or frame**, it is **data plane**: the forwarding lookup itself, permitting or denying transit traffic with an ACL, translating addresses with NAT, marking or queuing with QoS, adding or removing an 802.1Q tag and encrypting traffic into a VPN tunnel. If it exists so that **people or management systems can operate the device**, it is **management plane**: SSH and console sessions, SNMP polling and traps, syslog, and API access with NETCONF or RESTCONF. The classic exam trap is SSH: it uses TCP and it changes the configuration, yet it is not control plane — it is management plane. The other trap is ARP: although ARP rides directly inside Ethernet frames, it is a control plane protocol, because it builds the table the data plane uses to rewrite destination MAC addresses.",
    },
    {
      kind: 'diagram',
      title: 'Planes working together on one router',
      diagram: {
        type: 'flow',
        width: 10,
        height: 5,
        nodes: [
          { id: 'mgmt', label: 'Engineer via SSH', sub: 'management plane', x: 1.6, y: 1 },
          { id: 'ospf', label: 'OSPF process', sub: 'control plane', x: 5, y: 1 },
          { id: 'rib', label: 'Routing table (RIB)', sub: 'best routes', x: 8.4, y: 1 },
          { id: 'pkt', label: 'Packet arrives', sub: 'Gi0/0/0', shape: 'pill', x: 1.6, y: 3.9 },
          { id: 'fib', label: 'CEF FIB + adjacency', sub: 'data plane lookup', tone: 'accent', x: 5, y: 3.9 },
          { id: 'out', label: 'Forwarded', sub: 'out Gi0/0/1', shape: 'round', tone: 'good', x: 8.4, y: 3.9 },
        ],
        edges: [
          { from: 'mgmt', to: 'ospf', label: 'router ospf 1' },
          { from: 'ospf', to: 'rib', label: 'SPF results' },
          { from: 'rib', to: 'fib', label: 'programs', dashed: true },
          { from: 'pkt', to: 'fib', label: 'lookup' },
          { from: 'fib', to: 'out', label: 'rewrite + send' },
        ],
      },
      caption: 'Management configures, control computes, data forwards.',
      notes:
        "This flow shows the three planes cooperating inside one router. The engineer uses the **management plane** — an SSH session — to enter `router ospf 1` and its network statements. That configuration starts the **control plane** OSPF process, which exchanges hellos and LSAs with neighbors, runs SPF and installs the best routes in the **routing table (RIB)**. The router then programs those results into the **CEF FIB and adjacency table**, the structures the data plane actually consults. When a packet arrives on Gi0/0/0, the **data plane** looks up the destination in the FIB, rewrites the Layer 2 header from the adjacency information and forwards the packet out Gi0/0/1 — without involving the routing protocol for that packet. Two practical consequences follow. If the SSH session drops, forwarding continues, because the management plane is not in the forwarding path. And if the control plane has a problem, the data plane keeps forwarding on the entries it already has. Controllers exploit exactly this split: decisions are centralized while each device keeps forwarding locally.",
    },
    {
      kind: 'bullets',
      title: 'The automation toolbox',
      bullets: [
        { text: '**Scripts** — Python with Netmiko (SSH) or `requests` (REST)', sub: ['Ideal for repeatable jobs: backups, show-command collection'] },
        { text: '**Controllers** — Catalyst Center, SD-WAN Manager, Meraki dashboard', sub: ['Central policy; device configs generated and pushed for you'] },
        { text: '**Config management / IaC** — Ansible, Terraform, Puppet, Chef', sub: ['Desired state described in files'] },
        { text: '**APIs** — REST, NETCONF, RESTCONF', sub: ['Structured data instead of screen scraping'] },
        '**Git + CI/CD** — version-controlled source of truth, tested changes',
      ],
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'git', label: 'Engineer + Git', sub: 'source of truth', shape: 'pill' },
          { id: 'tool', label: 'Automation tool', sub: 'script · Ansible · controller', tone: 'accent' },
          { id: 'api', label: 'API or SSH', sub: 'REST · NETCONF · CLI' },
          { id: 'dev', label: 'Devices', sub: 'routers · switches · APs', shape: 'round' },
        ],
      },
      notes:
        "Automation is not one product but a toolbox. **Scripts** are usually Python: the Netmiko library automates SSH/CLI sessions and the `requests` library calls REST APIs. They are perfect for repeatable jobs such as backing up configurations or collecting `show` output from every device. **Controllers** such as Catalyst Center, Catalyst SD-WAN Manager and the Meraki dashboard hold policy centrally and generate and push device configurations for you. **Configuration management and infrastructure-as-code tools** — Ansible, Terraform, Puppet and Chef — describe the desired state in files and apply it repeatedly; they get their own lesson later in this module. **APIs** are what all of these tools speak: REST APIs on controllers, and NETCONF or RESTCONF on devices, returning structured JSON or XML instead of screen text that must be parsed. Tying it together, **Git** stores templates and variables as the source of truth, and CI/CD pipelines test changes before they reach production. Remember the pattern in the diagram: engineer and Git feed a tool, the tool reaches devices through an API or SSH, and devices report back.",
    },
    {
      kind: 'cli',
      title: 'A first taste: Python pushes a VLAN',
      code: `$ cat add_vlan.py
from netmiko import ConnectHandler

switches = ["10.0.0.11", "10.0.0.12", "10.0.0.13"]
commands = ["vlan 30", "name VOICE"]

for ip in switches:
    conn = ConnectHandler(device_type="cisco_ios", host=ip,
                          username="netops", password="S3cret!")
    conn.send_config_set(commands)
    conn.save_config()
    conn.disconnect()
    print(f"{ip}: VLAN 30 configured")
$ python3 add_vlan.py
10.0.0.11: VLAN 30 configured
10.0.0.12: VLAN 30 configured
10.0.0.13: VLAN 30 configured`,
      highlight: ['send_config_set', 'VLAN 30 configured'],
      caption: 'The same commands, applied identically to every switch in the list — over SSH.',
      notes:
        "Here is the smallest useful piece of automation: a Python script that uses **Netmiko** to open an SSH session to each switch, send the same configuration commands with `send_config_set()`, save with `save_config()` and disconnect. Three switches or three hundred — the script does not care; you simply extend the list. Notice what it does *not* do. It does not check whether VLAN 30 already exists, it does not continue cleanly if one switch is unreachable, and it contains a **hard-coded password**, which is poor practice; real scripts read credentials from environment variables or a secrets vault. This style is **imperative**: it lists exactly which commands to type, in order. Tools such as Ansible add inventories, templates, error handling and idempotency on top of the same idea. For the CCNA you are not asked to write Python, but you may be shown a short script or its output and asked what it does, which protocol it uses (SSH here) or why one device failed. Read the imports and method names — they usually give the answer away.",
    },
    {
      kind: 'diagram',
      title: 'Telemetry: from polling to streaming',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'nms', label: 'NMS / collector', icon: 'server' },
          { id: 'r1', label: 'R1', icon: 'router' },
        ],
        steps: [
          { from: 'nms', to: 'r1', label: 'SNMP GetRequest', sub: 'poll, e.g. every 5 minutes (pull)' },
          { from: 'r1', to: 'nms', label: 'GetResponse', sub: 'one snapshot of the counters', dashed: true },
          { note: 'A 90-second spike between two polls can be averaged away or missed', tone: 'warn' },
          { from: 'nms', to: 'r1', label: 'Telemetry subscription', sub: 'YANG-modeled data paths' },
          { from: 'r1', to: 'nms', label: 'Streamed update (push)', sub: 'periodic, e.g. every 10 s', tone: 'accent' },
          { from: 'r1', to: 'nms', label: 'Streamed update (push)', sub: 'or on change, as it happens', tone: 'accent' },
        ],
      },
      caption: 'Streaming telemetry pushes structured data continuously instead of waiting to be asked.',
      notes:
        "Automation needs data as much as it needs configuration. Traditional monitoring uses **SNMP polling**: the NMS asks each device for counters at an interval, commonly every five minutes. Anything that happens between polls — a 90-second traffic spike, a link that flaps twice — can be averaged away or missed entirely. SNMP traps and syslog help by pushing events, but they carry only what the device decides to report. **Model-driven streaming telemetry** reverses the direction: a collector subscribes to specific data defined by YANG models, and the device **pushes** structured updates either periodically (for example every 10 seconds) or **on change**. Because the data is structured rather than screen text, and frequent rather than occasional, analytics platforms and AI-driven assurance can baseline normal behavior, spot anomalies and correlate events across the whole network — exactly the troubleshooting benefit Cisco attributes to automation. For the exam, remember the direction: **polling is pull, telemetry is push**. The AI lesson later in this module builds on this idea: machine learning is only as good as the telemetry it is fed.",
    },
    {
      kind: 'bullets',
      title: 'Intent-based networking (IBN)',
      bullets: [
        'Declare **what** the business needs, not **how** to configure it',
        '**Translation** — intent becomes policy ("guests reach only the Internet")',
        '**Activation** — the controller pushes configuration to every relevant device',
        '**Assurance** — the network is continuously checked against the intent',
        'Closed loop: deviations are flagged or corrected automatically',
        'Cisco example: **Catalyst Center** with SD-Access',
      ],
      diagram: {
        type: 'flow',
        width: 10,
        height: 4,
        nodes: [
          { id: 'intent', label: 'Business intent', sub: 'guests: Internet only', shape: 'pill', x: 1.5, y: 2 },
          { id: 'tr', label: 'Translation', sub: 'intent → policy', x: 4.4, y: 0.9 },
          { id: 'act', label: 'Activation', sub: 'policy → device config', x: 8, y: 0.9 },
          { id: 'as', label: 'Assurance', sub: 'verify continuously', tone: 'accent', x: 6.2, y: 3.1 },
        ],
        edges: [
          { from: 'intent', to: 'tr' },
          { from: 'tr', to: 'act' },
          { from: 'act', to: 'as' },
          { from: 'as', to: 'tr', label: 'feedback', dashed: true },
        ],
      },
      notes:
        "**Intent-based networking (IBN)** is the idea that operators should express *what* the business needs — for example, *guest users may reach only the Internet* or *voice always gets priority* — and the system should work out *how* to implement it on every device. Cisco describes IBN as a closed loop with three functions. **Translation** captures the business intent and converts it into network policy. **Activation** pushes that policy as device configuration across the network, normally through a controller. **Assurance** continuously collects telemetry and verifies that the network is really delivering the intent, flagging or correcting deviations — the dashed feedback arrow. Catalyst Center with SD-Access is Cisco's flagship IBN platform: you define groups and policies, and the controller configures switches, wireless and security to match. IBN is **declarative** — you describe the desired state — which is why it pairs naturally with controllers and APIs. On the exam, associate *intent* with *desired outcome* or *business policy*, and remember that assurance is continuous verification, not a one-time check after deployment.",
    },
    {
      kind: 'compare',
      title: 'Imperative vs declarative automation',
      left: {
        heading: 'Imperative (how)',
        bullets: [
          'Lists the exact steps, in order',
          'CLI scripts, Netmiko loops, Chef recipes',
          'Script must handle "already configured?" itself',
          'Quick to start, harder to keep consistent',
        ],
      },
      right: {
        heading: 'Declarative / intent (what)',
        tone: 'accent',
        bullets: [
          'Describes the desired end state',
          'Terraform, Puppet, IBN controllers, most Ansible modules',
          'The tool works out which changes are needed',
          '**Idempotent**: re-running on a compliant device changes nothing',
        ],
      },
      notes:
        "Two styles of automation appear throughout this module. **Imperative** automation spells out every step: log in, enter configuration mode, type these commands in this order. CLI scripts and Netmiko loops are imperative, and Chef recipes are usually described as procedural. It feels natural but is fragile: the script itself must cope with cases such as *the VLAN already exists* or *this switch is a different model*. **Declarative** automation describes only the end state — *VLAN 30 named VOICE must exist* — and the tool compares that with reality and makes only the changes needed. Terraform, Puppet and intent-based controllers are declarative, and most Ansible modules behave declaratively even though a playbook runs its tasks in order. Declarative tools are normally **idempotent**: running them again against a compliant device changes nothing, so they can be run repeatedly to enforce the standard and correct drift. When an exam option talks about *defining the desired state*, it is describing declarative automation or intent; *step-by-step instructions* signals imperative.",
    },
    {
      kind: 'table',
      title: "How the network engineer's job changes",
      columns: ['Area', 'Traditional', 'Automated / programmable'],
      rows: [
        ['Making changes', 'Type CLI on each device', 'Edit templates and variables; a tool pushes them'],
        ['Source of truth', "Each device's running-config", 'Files in Git or a controller database'],
        ['Monitoring', 'SNMP polls, ad-hoc `show` commands', 'Streaming telemetry, analytics, assurance'],
        ['Troubleshooting', 'Box by box, hop by hop', 'Correlated, network-wide view; AI-assisted insights'],
        ['Skills', 'CLI and protocols', 'Protocols **plus** APIs, JSON/YAML, Python, Git'],
        ['Change control', 'Manual peer review', 'Pull requests, automated tests, dry runs'],
      ],
      notes:
        "Automation changes the network engineer's work more than it replaces the engineer. Changes move from typing CLI on each device to editing templates and variables that a tool pushes. The **source of truth** shifts from whatever happens to be in each running configuration to files in Git or a controller database, so the question *what should this device look like?* finally has a definite answer. Monitoring evolves from periodic SNMP polls and ad-hoc `show` commands to streaming telemetry and controller assurance. Troubleshooting becomes network-wide and data-driven, increasingly helped by AI-generated insights. The skill set grows: you still need deep protocol knowledge — automation will happily push a broken OSPF design to 500 routers — but you also need to read JSON and YAML, understand APIs, write basic Python and use Git. Change control adopts software practices: pull requests, peer review, automated tests and dry runs before production. Questions on topic 6.1 often ask how automation affects network management; the right answers describe these shifts toward centralized, consistent, faster and more observable operations.",
    },
    {
      kind: 'steps',
      title: 'Adopting automation safely',
      steps: [
        { title: 'Start read-only', text: 'Automate config backups and `show` collection first — value with no risk.' },
        { title: 'Define the standard', text: 'Golden templates plus variables become the single source of truth.' },
        { title: 'Put it in Git', text: 'Every change is reviewed, versioned and reversible.' },
        { title: 'Test first', text: 'Lab or virtual devices; dry runs such as Ansible check mode or `terraform plan`.' },
        { title: 'Roll out gradually', text: 'A pilot group, then waves — a mistake hits 5 devices, not 500.' },
        { title: 'Verify and monitor', text: 'Automated post-checks; roll back if they fail.' },
      ],
      notes:
        "Automation amplifies whatever it is given: a good change reaches every device quickly, and so does a bad one. Mature teams therefore adopt it in careful steps. **Start read-only**: automate configuration backups and `show` command collection first — they deliver value with no risk to production. **Define the standard** as templates and variables so there is a single source of truth. **Put it in Git** so that every change is reviewed, versioned and reversible. **Test first** in a lab or on virtual routers, and use dry-run features such as Ansible check mode or `terraform plan` to preview exactly what would change. **Roll out gradually**: a pilot group first, then waves, so that a mistake hits five devices instead of five hundred. Finally, **verify and monitor** with automated post-change checks — are neighbors up, are interfaces error-free, do test pings succeed — and roll back if they fail. This discipline is also why automation improves security and compliance: every change is recorded, peer reviewed and repeatable, rather than typed by hand at 2 a.m. and forgotten.",
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam traps: automation and the planes',
      body: 'Know **which plane** each function lives in and **why automation beats per-device CLI** — Cisco tests both with short scenario stems.',
      bullets: [
        'SSH, SNMP, syslog, NETCONF = **management** plane — not control',
        'OSPF, STP, ARP = **control** plane; forwarding, ACLs, NAT = **data** plane',
        '**Config drift** = devices diverging from the approved baseline over time',
        'IBN is declarative: **translation, activation, assurance**',
        'Telemetry **pushes**; SNMP polling **pulls**',
        'Automation cuts errors and OpEx — it does **not** remove the need for protocol knowledge',
      ],
      notes:
        "These traps come straight from the way topic 6.1 questions are worded. Plane questions are the most common: SSH, SNMP, syslog and API access are **management plane** even though they may change the configuration; routing protocols, STP and ARP are **control plane** because they build tables; forwarding, ACL filtering, NAT and QoS actions on transit traffic are **data plane**. Configuration drift means devices diverging from their intended baseline — do not confuse it with route flapping or clock drift. Intent-based networking is declarative, and its three functions are translation, activation and assurance. Telemetry pushes, SNMP polling pulls. Finally, reject any option claiming that automation removes the need for engineers or for protocol knowledge. Automation reduces repetitive work, errors and operating cost, but correct templates still require protocol expertise, and the output of any tool still needs verification before and after it touches production.",
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'Manual per-device CLI is slow, error-prone and causes drift at scale',
        'Automation: consistency, speed, fewer errors, compliance, better visibility',
        'Management plane operates, control plane decides, data plane forwards',
        'Toolbox: scripts, controllers, config management/IaC, APIs, Git',
        'IBN: declare the outcome; the system translates, activates and assures it',
      ],
      notes:
        "Pull the lesson together. Manual per-device CLI management is slow, error-prone and inconsistent, and it lets configurations drift away from the standard as the network grows. Automation answers each of those problems: templates make configurations consistent, parallel execution makes changes fast, tested code reduces errors, and continuous checks deliver compliance and faster troubleshooting through better data. Every device divides its work into the management plane (operate the device), the control plane (decide and build the tables) and the data plane (forward the traffic, usually in hardware). The automation toolbox includes Python scripts, controllers, configuration management and IaC tools, APIs and Git as the source of truth. Intent-based networking raises the level of abstraction again: you declare the outcome, and the system translates, activates and continuously assures it. Next you will compare the four ways networks are managed today — device-based, automation-based, cloud-based and controller-based.",
    },
  ],
  flashcards: [
    { id: 'f1', front: 'Configuration drift', back: 'The gradual divergence of device configurations from the approved baseline (golden config), usually caused by undocumented manual changes.' },
    { id: 'f2', front: 'Five problems with manual per-device CLI management', back: 'Time (grows with device count), human error, inconsistency, configuration drift, and inability to scale.' },
    { id: 'f3', front: 'Data plane', back: 'Forwards transit traffic: frame/packet forwarding, ACL filtering, NAT, QoS actions, 802.1Q tagging, VPN encryption. Usually in hardware (ASICs/CEF).' },
    { id: 'f4', front: 'Control plane', back: 'Decides how traffic should be forwarded and builds the tables the data plane uses: OSPF, EIGRP, BGP, STP, ARP, IPv6 NDP.' },
    { id: 'f5', front: 'Management plane', back: 'Protocols used to operate and monitor the device itself: SSH, Telnet, SNMP, syslog, NETCONF, RESTCONF, HTTPS GUI.' },
    { id: 'f6', front: 'Plane: OSPF hellos and LSAs', back: '**Control plane** — they build the routing table.' },
    { id: 'f7', front: 'Plane: an administrator SSH session', back: '**Management plane** — even though it changes the configuration.' },
    { id: 'f8', front: 'Plane: NAT translating a forwarded packet', back: '**Data plane** — it acts on each passing packet.' },
    { id: 'f9', front: 'Plane: ARP', back: '**Control plane** — it builds the ARP table used to rewrite destination MACs.' },
    { id: 'f10', front: 'Which plane is usually implemented in hardware ASICs?', back: 'The **data plane**. Control and management planes run as software on the CPU.' },
    { id: 'f11', front: 'Golden configuration', back: 'The approved standard configuration (template) that every device of a given role should match.' },
    { id: 'f12', front: 'Source of truth', back: 'The authoritative record of the intended network state — for example files in Git or a controller database — that tools apply to devices.' },
    { id: 'f13', front: 'Intent-based networking (IBN)', back: 'The operator declares the desired business outcome; the system translates it into policy, activates it on devices and continuously assures it.' },
    { id: 'f14', front: 'The three IBN functions', back: '**Translation**, **activation**, **assurance** (a closed loop).' },
    { id: 'f15', front: 'IBN assurance', back: 'Continuous collection of telemetry to verify that the network is delivering the intent, flagging or correcting deviations.' },
    { id: 'f16', front: 'Imperative vs declarative automation', back: 'Imperative lists the steps (how). Declarative describes the desired end state (what) and lets the tool work out the steps.' },
    { id: 'f17', front: 'Idempotent operation', back: 'Running it once or many times gives the same result; re-running against a compliant device changes nothing.' },
    { id: 'f18', front: 'SNMP polling vs streaming telemetry', back: 'SNMP polling is **pull** (the NMS asks at intervals). Model-driven telemetry is **push** (the device streams data periodically or on change).' },
    { id: 'f19', front: 'Netmiko', back: 'A Python library that simplifies SSH/CLI automation of network devices, e.g. `ConnectHandler()` and `send_config_set()`.' },
    { id: 'f20', front: 'Python `requests` library', back: 'A library for making HTTP calls — the usual way a Python script talks to a REST API.' },
    { id: 'f21', front: 'Families of network automation tools', back: 'Scripts (Python), controllers, configuration management/IaC tools, and APIs (REST, NETCONF, RESTCONF), with Git for version control.' },
    { id: 'f22', front: 'Examples of Cisco controllers', back: 'Catalyst Center (formerly DNA Center), Catalyst SD-WAN Manager (vManage), Meraki dashboard, wireless LAN controllers, APIC (ACI).' },
    { id: 'f23', front: 'Configuration management / IaC tools', back: 'Ansible, Terraform, Puppet and Chef.' },
    { id: 'f24', front: 'OpEx benefit of automation', back: 'Lower operating expense: less repetitive labor, fewer outages caused by errors, faster provisioning.' },
    { id: 'f25', front: 'Does automation remove the need for protocol knowledge?', back: 'No. Engineers must understand protocols to write correct templates, validate results and troubleshoot.' },
    { id: 'f26', front: 'Compliance checking', back: 'Automatically comparing every device with the standard (NTP, AAA, logging, banners…) and reporting or fixing deviations.' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'Which term describes device configurations gradually diverging from their approved standard?',
      options: ['Configuration drift', 'Route flapping', 'Idempotency', 'Intent translation'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Configuration drift** is the slow divergence from the baseline caused by undocumented changes. Route flapping is routes repeatedly appearing and disappearing, idempotency is the property of re-runs changing nothing, and translation is the IBN step that turns intent into policy.',
    },
    {
      id: 'q2',
      type: 'categorize',
      stem: 'Classify each function by the device plane that performs it.',
      categories: ['Data plane', 'Control plane', 'Management plane'],
      items: [
        { text: 'Forwarding a packet using the FIB', category: 0 },
        { text: 'Applying an ACL to transit traffic', category: 0 },
        { text: 'OSPF LSA flooding', category: 1 },
        { text: 'STP BPDU exchange', category: 1 },
        { text: 'An administrator SSH login', category: 2 },
        { text: 'SNMP polling from an NMS', category: 2 },
      ],
      difficulty: 1,
      explanation:
        'Forwarding and ACL filtering act on each passing packet (**data**). OSPF and STP build the tables and topology that forwarding uses (**control**). SSH and SNMP exist so that people and systems can operate the device (**management**).',
    },
    {
      id: 'q3',
      type: 'multi',
      stem: 'Which two are benefits of network automation compared with manual CLI configuration? (Choose two.)',
      options: [
        'Consistent configurations across devices',
        'No further need for protocol knowledge',
        'Faster deployment of changes in parallel',
        'Guaranteed elimination of all outages',
        'No need to test changes before production',
      ],
      answers: [0, 2],
      difficulty: 1,
      explanation:
        'Automation delivers **consistency** and **speed**. It does not remove the need for protocol expertise, cannot guarantee zero outages (a bad template reaches every device) and makes testing more important, not less.',
    },
    {
      id: 'q4',
      type: 'single',
      stem: 'In intent-based networking, which function continuously verifies that the network behaves as intended?',
      options: ['Translation', 'Activation', 'Assurance', 'Provisioning'],
      answer: 2,
      difficulty: 1,
      explanation:
        '**Assurance** collects telemetry and checks the network against the intent on an ongoing basis. Translation converts intent into policy, activation pushes the policy to devices, and provisioning is not one of the three IBN functions.',
    },
    {
      id: 'q5',
      type: 'input',
      stem: 'Which device plane is normally implemented in hardware ASICs to forward traffic at line rate? (Answer with one word.)',
      answers: ['data', 'data plane', 'the data plane', 'forwarding', 'forwarding plane'],
      placeholder: 'plane name',
      difficulty: 1,
      explanation:
        'The **data plane** (forwarding plane) is built into ASICs and CEF so transit traffic is forwarded without CPU involvement. The control and management planes run as software processes on the CPU.',
    },
    {
      id: 'q6',
      type: 'single',
      stem: 'Which monitoring method has devices push structured data to a collector periodically or when values change?',
      options: ['SNMP GetRequest polling', 'Model-driven streaming telemetry', 'Running show commands over SSH', 'Nightly TFTP configuration backups'],
      answer: 1,
      difficulty: 2,
      explanation:
        '**Streaming telemetry** is push-based and uses YANG-modeled data. SNMP polling is pull-based, show commands over SSH return unstructured text only when asked, and TFTP backups copy configurations rather than operational data.',
    },
    {
      id: 'q7',
      type: 'match',
      stem: 'Match each type of automation tool to an example.',
      pairs: [
        { left: 'Script', right: 'Python using Netmiko' },
        { left: 'Controller', right: 'Catalyst Center' },
        { left: 'Configuration management', right: 'Ansible' },
        { left: 'Device API', right: 'RESTCONF' },
      ],
      difficulty: 2,
      explanation:
        'A Netmiko program is a **script**; Catalyst Center is a **controller**; Ansible is a **configuration management** tool; RESTCONF is a programmable **API** on the device itself.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Which statement describes configuration drift?',
      options: [
        'Device configurations gradually diverging from the approved baseline',
        'A running virtual machine moving between hypervisors',
        'The time a routing protocol needs to converge after a failure',
        'An automatic rollback to the last saved configuration',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Configuration drift** is the slow, usually undocumented divergence of devices from their standard configuration. VM mobility (vMotion-style migration), routing convergence and rollback are real concepts, but none of them is drift — and rollback is one of the tools used to *fix* drift.',
    },
    {
      id: 'e2',
      type: 'single',
      stem: 'Refer to the exhibit. SW1 matches the approved access-switch baseline. What does the output show about SW2?',
      exhibit: {
        kind: 'cli',
        text: `SW1# show running-config | include ntp|logging host
ntp server 10.0.0.10
ntp server 10.0.0.11
logging host 10.0.0.50

SW2# show running-config | include ntp|logging host
ntp server 10.0.0.10
logging host 10.9.9.9`,
      },
      options: [
        'SW2 has drifted from the baseline: it lacks an NTP server and logs to a different host',
        'SW2 is compliant with the baseline because it has at least one NTP server and one syslog host',
        'SW1 is misconfigured because IOS allows a single NTP server, so the second one is invalid',
        'SW2 cannot send syslog messages because logging requires two NTP servers to be configured',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Compared with the baseline on SW1, SW2 is missing `ntp server 10.0.0.11` and points `logging host` at 10.9.9.9 instead of 10.0.0.50 — classic **configuration drift**. Having *some* NTP and syslog configuration does not make a device compliant; the standard defines exactly which servers to use. IOS supports multiple NTP servers, and the number of NTP servers has no effect on whether syslog works.',
    },
    {
      id: 'e3',
      type: 'categorize',
      stem: 'Drag each function to the device plane that performs it.',
      categories: ['Data plane', 'Control plane', 'Management plane'],
      items: [
        { text: 'Rewriting source addresses with PAT', category: 0 },
        { text: 'Encrypting packets into an IPsec tunnel', category: 0 },
        { text: 'Adding an 802.1Q tag on a trunk', category: 0 },
        { text: 'Exchanging EIGRP updates', category: 1 },
        { text: 'Resolving a next-hop MAC address with ARP', category: 1 },
        { text: 'Sending syslog messages to a server', category: 2 },
        { text: 'Changing the configuration through RESTCONF', category: 2 },
      ],
      difficulty: 2,
      explanation:
        'PAT, IPsec encryption and 802.1Q tagging all act on each forwarded packet or frame, so they are **data plane**. EIGRP and ARP build the routing and ARP tables that forwarding uses, so they are **control plane**. Syslog and RESTCONF exist to operate and monitor the device, so they are **management plane** — even though RESTCONF can change the configuration.',
    },
    {
      id: 'e4',
      type: 'single',
      stem: 'A router is receiving a flood of SSH login attempts and SNMP requests from an unknown host. Under the three-plane model, which plane do these protocols belong to?',
      options: ['Management plane', 'Control plane', 'Data plane', 'Application layer'],
      answer: 0,
      difficulty: 2,
      explanation:
        'SSH and SNMP are **management plane** protocols: they exist so that people and systems can operate the device. The control plane holds routing protocols, STP and ARP; the data plane forwards transit traffic. *Application layer* is a layer of the SDN architecture (apps above the controller), not a device plane. Traffic addressed to the router is processed by its CPU, which is why such a flood raises CPU utilization.',
    },
    {
      id: 'e5',
      type: 'multi',
      stem: 'Which two are drawbacks of managing a large network one device at a time from the CLI? (Choose two.)',
      options: [
        'Changes take longer as the number of devices grows',
        'Configurations tend to become inconsistent across devices',
        'Devices cannot run routing protocols without a controller',
        'SNMP cannot monitor devices that were configured manually',
        'The data plane must be disabled while commands are entered',
      ],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        'Per-device work scales linearly with device count, and hand-typed changes drift into **inconsistency**. Routing protocols run fine without a controller (that is the traditional distributed model), SNMP monitoring does not care how a device was configured, and entering CLI commands does not stop forwarding.',
    },
    {
      id: 'e6',
      type: 'single',
      stem: 'Refer to the exhibit. What does this script do?',
      exhibit: {
        kind: 'cli',
        text: `$ cat add_vlan.py
from netmiko import ConnectHandler

switches = ["10.0.0.11", "10.0.0.12", "10.0.0.13"]
commands = ["vlan 30", "name VOICE"]

for ip in switches:
    conn = ConnectHandler(device_type="cisco_ios", host=ip,
                          username="netops", password="S3cret!")
    conn.send_config_set(commands)
    conn.save_config()
    conn.disconnect()`,
      },
      options: [
        'Opens an SSH session to each switch, creates VLAN 30 named VOICE and saves the configuration',
        'Polls each switch with SNMP, reads the VLAN table and reports which switches lack VLAN 30',
        'Sends a REST API POST to a controller, which then creates VLAN 30 on each of the three switches',
        'Copies the running configuration of each switch to a TFTP server for backup and then disconnects',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Netmiko is an **SSH/CLI** automation library. The loop connects to each IP, sends `vlan 30` and `name VOICE` with `send_config_set()`, saves with `save_config()` and disconnects. Nothing in the script uses SNMP, a REST API or TFTP — those would need different libraries (for example `requests` for REST).',
    },
    {
      id: 'e7',
      type: 'single',
      stem: 'Refer to the exhibit. An engineer runs a VLAN script against three switches. Which statement explains the result?',
      exhibit: {
        kind: 'cli',
        text: `$ python3 add_vlan.py
10.0.0.11: VLAN 30 configured
10.0.0.12: VLAN 30 configured
Traceback (most recent call last):
  File "/home/netops/add_vlan.py", line 7, in <module>
    conn = ConnectHandler(device_type="cisco_ios", host=ip,
  ...
netmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.`,
      },
      options: [
        'The script could not open a TCP session to 10.0.0.13, so it stopped with an unhandled exception',
        '10.0.0.13 rejected the username and password, so VLAN 30 was created on that switch but not saved',
        'VLAN 30 already existed on 10.0.0.13, so Netmiko refused to overwrite it and raised a timeout error',
        '10.0.0.13 accepted the SSH session, but the configuration commands timed out after VLAN 30 was created',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'The exception occurs inside `ConnectHandler()` and says the **TCP connection failed**, so the script never reached authentication or configuration on the third switch. Bad credentials raise an authentication exception after the TCP session is up, not a TCP timeout. Re-entering `vlan 30` on IOS simply enters the existing VLAN, so an existing VLAN causes no error. The lesson for automation: add error handling so one unreachable device is logged and skipped instead of stopping the run.',
    },
    {
      id: 'e8',
      type: 'order',
      stem: 'Put the intent-based networking cycle in order, starting from the business requirement.',
      items: [
        'Capture the business intent',
        'Translate the intent into network policy',
        'Activate the policy as device configuration',
        'Assure the network continuously against the intent',
      ],
      difficulty: 2,
      explanation:
        'IBN starts with the **intent**, **translates** it into policy, **activates** that policy on the devices (usually through a controller) and then provides continuous **assurance**, feeding deviations back into the loop. Assurance comes last because it verifies what activation deployed.',
    },
    {
      id: 'e9',
      type: 'single',
      stem: 'Which statement best describes intent-based networking?',
      options: [
        'The operator states the desired outcome, and the system applies and verifies the configuration',
        'Each device is configured individually, with the engineer entering step-by-step CLI commands',
        'Devices poll a central server on a 30-minute timer and apply a new configuration file when one appears',
        'A single core switch makes the forwarding decisions for the whole network and the others follow it',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'IBN is **declarative**: you describe the business outcome and the platform translates, activates and assures it. Step-by-step CLI is traditional imperative management. A periodic check-in for configuration describes a pull-based configuration management agent such as Puppet, not IBN. No IBN design centralizes all forwarding in one switch — forwarding stays distributed in each device’s data plane.',
    },
    {
      id: 'e10',
      type: 'match',
      stem: 'Match each automation term to its description.',
      pairs: [
        { left: 'Imperative', right: 'Specifies the exact steps to execute, in order' },
        { left: 'Declarative', right: 'Specifies the desired end state' },
        { left: 'Idempotent', right: 'Re-running makes no further change once compliant' },
        { left: 'Streaming telemetry', right: 'The device pushes operational data to a collector' },
      ],
      difficulty: 2,
      explanation:
        '**Imperative** = how (ordered steps); **declarative** = what (end state); **idempotent** = repeat runs are safe and change nothing on a compliant device; **streaming telemetry** = push-based monitoring, the opposite of SNMP polling.',
    },
    {
      id: 'e11',
      type: 'single',
      stem: 'Refer to the exhibit. Users report that the WAN was very slow for about two minutes, but the NMS utilization graph for R1 looks normal. Which change would best give the operations team visibility into short events like this?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'nms', icon: 'server', label: 'NMS', sub: 'SNMP poll every 5 min', x: 1.4, y: 2.2 },
            { id: 'r1', icon: 'router', label: 'R1', sub: 'WAN edge', x: 5, y: 2.2 },
            { id: 'wan', icon: 'cloud', label: 'WAN', x: 8.6, y: 2.2 },
          ],
          links: [
            { from: 'nms', to: 'r1', label: 'UDP 161' },
            { from: 'r1', to: 'wan', fromLabel: 'Gi0/0/1' },
          ],
          annotations: [{ x: 5, y: 4.2, text: 'Congestion 10:01–10:03 · polls at 10:00 and 10:05', tone: 'warn' }],
        },
      },
      options: [
        'Stream interface statistics from R1 to a collector with model-driven telemetry',
        'Change the SNMP community string on R1 and the NMS to a longer, more complex value',
        'Configure R1 to send an SNMP trap to the NMS when interface Gi0/0/1 goes down',
        'Increase the SNMP polling interval to 15 minutes to reduce load on R1 and the NMS',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'The congestion started and ended **between two polls**, so the 5-minute averages hid it. **Streaming telemetry** pushes data every few seconds or on change, exposing short events. A longer community string only affects security, a link-down trap never fires because the link stayed up, and a longer polling interval would hide even more.',
    },
    {
      id: 'e12',
      type: 'multi',
      stem: 'Which two protocols operate in the management plane of a router? (Choose two.)',
      options: ['SNMP', 'SSH', 'OSPF', 'STP', 'ARP'],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        '**SNMP** and **SSH** are used to monitor and operate the device — management plane. OSPF and STP build forwarding topology and tables, and ARP builds the ARP table, so all three are control plane protocols.',
    },
    {
      id: 'e13',
      type: 'single',
      stem: 'Refer to the exhibit. A team keeps its branch router template in Git. Which benefit of this practice does the output demonstrate?',
      exhibit: {
        kind: 'cli',
        text: `$ git log --oneline -3 -- templates/branch-golden.cfg
a41c9e2 (HEAD -> main) Add second NTP server (CHG-2291)
7d03b51 Disable HTTP server per security audit
2f9a6c0 Initial branch router baseline`,
      },
      options: [
        'Every change to the standard is recorded with a description and is easy to review or revert',
        'Git pushes the template to the branch routers automatically over SSH after each commit',
        'Git encrypts the template so that passwords stored in it are hidden from other engineers',
        'Git converts the template into a YANG model that RESTCONF can push to the branch routers',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'The log shows a **versioned history**: each commit records what changed and why (even a change ticket), and any commit can be inspected or reverted. Git itself does not deploy anything — an automation tool or pipeline does that — it does not encrypt file contents, and it has nothing to do with YANG models.',
    },
    {
      id: 'e14',
      type: 'input',
      stem: 'Refer to the exhibit. A change must be applied to 240 branch routers. Using the figures shown, how many minutes will the automation tool need to finish? (Enter a number.)',
      exhibit: {
        kind: 'table',
        columns: ['Method', 'Time per router', 'Routers handled at once'],
        rows: [
          ['Manual CLI', '6 minutes', '1'],
          ['Automation tool', '6 minutes', '20'],
        ],
      },
      answers: ['72', '72 minutes', '72 min'],
      placeholder: 'minutes',
      difficulty: 3,
      explanation:
        'The tool works on 20 routers at a time: 240 ÷ 20 = **12 batches**, and 12 × 6 minutes = **72 minutes**. The manual approach needs 240 × 6 = 1,440 minutes (24 hours). Parallel execution — not faster typing — is where most of the time saving comes from.',
    },
    {
      id: 'e15',
      type: 'input',
      stem: 'Which device plane builds the routing table, ARP table and other tables that forwarding relies on? (Answer with one word.)',
      answers: ['control', 'control plane', 'the control plane'],
      placeholder: 'plane name',
      difficulty: 1,
      explanation:
        'The **control plane** runs routing protocols, ARP, STP and similar functions to build the tables. The data plane only consults those tables to forward traffic, and the management plane is for operating the device.',
    },
    {
      id: 'e16',
      type: 'multi',
      stem: 'Which two statements about the data plane are true? (Choose two.)',
      options: [
        'It forwards transit traffic, typically in hardware such as ASICs',
        'It relies on tables such as the FIB that the control plane builds',
        'It runs routing protocols such as OSPF to learn routes',
        'It carries the SSH sessions administrators use to configure the device',
        'It stops forwarding as soon as the administrator closes the SSH session',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'The data plane **forwards transit traffic**, normally in hardware, using the **FIB and adjacency tables** populated from the control plane. Routing protocols are control plane, SSH is management plane, and closing an SSH session has no effect on forwarding because the management plane is not in the forwarding path.',
    },
    {
      id: 'e17',
      type: 'categorize',
      stem: 'Classify each characteristic as traditional (manual) or automated network management.',
      categories: ['Traditional management', 'Automated management'],
      items: [
        { text: 'Commands typed on each device individually', category: 0 },
        { text: "Each device's running-config is the only record of its intended state", category: 0 },
        { text: 'Monitoring relies on periodic SNMP polling', category: 0 },
        { text: 'Changes reviewed as pull requests and tested before deployment', category: 1 },
        { text: 'Continuous compliance checks against a template', category: 1 },
        { text: 'Streaming telemetry feeding an analytics platform', category: 1 },
      ],
      difficulty: 2,
      explanation:
        'Traditional management is **per-device**: typed CLI, the running-config as the de facto source of truth and SNMP polling. Automated management uses a **central source of truth**, software practices such as pull requests and tests, continuous compliance checks and streaming telemetry.',
    },
    {
      id: 'e18',
      type: 'single',
      stem: 'Refer to the exhibit. A nightly job compares each branch router with the golden template. Which statement is correct?',
      exhibit: {
        kind: 'cli',
        text: `$ python3 compliance_check.py --template branch-golden.cfg
br1-rtr   COMPLIANT
br2-rtr   MISSING  ntp server 10.0.0.11
br3-rtr   EXTRA    ip http server
br4-rtr   COMPLIANT`,
      },
      options: [
        'br2-rtr and br3-rtr have both drifted from the standard and should be remediated',
        'Only br2-rtr is non-compliant, because extra commands never violate a baseline',
        'Only br3-rtr is non-compliant, because a missing NTP server has no operational impact',
        'br1-rtr and br4-rtr must be updated, because they were not changed by the job',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Drift works in **both directions**: a required line can be missing (br2-rtr) or an unapproved line can be present (br3-rtr). An unexpected `ip http server` is a real risk because it enables unencrypted HTTP management. A missing NTP server reduces time-source redundancy, which matters for log correlation and certificates. br1-rtr and br4-rtr already match the template, so an idempotent remediation would leave them untouched.',
    },
    {
      id: 'e19',
      type: 'multi',
      stem: 'Which two outcomes should a company expect when it moves from manual configuration to network automation? (Choose two.)',
      options: [
        'Reduced operating expense from less repetitive work',
        'Faster changes with more consistent results',
        'Greater reliance on individual CLI sessions',
        'No further need to understand routing protocols',
        'Elimination of change-control processes',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'Automation lowers **OpEx** and delivers **faster, consistent** changes. It reduces reliance on per-device CLI rather than increasing it, still depends on protocol knowledge to build correct templates, and strengthens change control (reviews, tests, versioning) instead of removing it.',
    },
    {
      id: 'e20',
      type: 'single',
      stem: 'An engineer must standardize the SNMP, NTP and AAA settings on 600 switches and prove compliance to auditors every month. Which approach best meets the requirement?',
      options: [
        'Keep the settings in version-controlled templates, apply them with automation and run scheduled compliance checks',
        'Assign each of 12 engineers 50 switches to configure and inspect manually, then log the results each month',
        'Enable SNMP traps so that the switches report configuration changes to the NMS for the auditors to review',
        'Copy the running-config of one switch to the other 599 switches with TFTP and reload them to apply it',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Templates in version control plus an automation tool **enforce** the standard, and scheduled checks **prove** compliance with reports. Manual work is slow and inconsistent. Traps only notify about changes; they neither enforce nor audit. Copying a whole running-config would duplicate hostnames, management IP addresses and other device-specific settings on every switch.',
    },
    {
      id: 'e21',
      type: 'multi',
      stem: 'A template error pushed by an automation tool caused an outage on 300 switches at once. Which two practices would most likely have limited the impact? (Choose two.)',
      options: [
        'Previewing the change with a dry run and testing it in a lab first',
        'Deploying to a small pilot group before the remaining switches',
        'Returning permanently to manual CLI changes on every switch',
        'Removing the templates from version control to simplify deployment',
        'Increasing the number of switches changed in parallel',
      ],
      answers: [0, 1],
      difficulty: 3,
      explanation:
        'Automation amplifies mistakes, so safeguards matter: **dry runs and lab tests** catch the error before production, and a **pilot group** limits the blast radius if something slips through. Going back to manual CLI gives up all the benefits and brings back drift, removing version control loses review and rollback, and more parallelism spreads a bad change even faster.',
    },
  ],
};

export default lesson;
