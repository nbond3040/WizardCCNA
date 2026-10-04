import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'network-management-approaches',
  slides: [
    {
      kind: 'title',
      title: 'Network Management Approaches',
      subtitle: 'Device-based, automation-based, controller-based and cloud-based management',
      notes:
        "There are four broad ways to run a network today, and most real organizations mix them. In this deck you will compare **device-based** management (you configure each box), **automation-based** management (code and tools configure the boxes), **controller-based** management (an on-premises controller such as Catalyst Center or a WLC manages the boxes) and **cloud-based** management (a vendor dashboard such as Meraki manages the boxes over the Internet). For each one you will learn where the configuration lives, how it reaches the devices, what skills it needs, how much visibility it gives and what happens when the management system itself fails. v1.1 frames this topic as *traditional versus controller-based networking* (6.2); v2.0 places management approaches in Domain 1.",
    },
    {
      kind: 'bullets',
      title: 'Four ways to manage a network',
      bullets: [
        '**Device-based** — you configure each box yourself (CLI or GUI)',
        '**Automation-based** — code and tools configure the boxes for you',
        '**Controller-based** — an on-premises controller manages the boxes',
        '**Cloud-based** — a vendor-hosted dashboard manages the boxes',
        'Ask: **where does the configuration live** and **how does it reach devices?**',
      ],
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'd', label: 'Device-based', sub: 'you → each box', shape: 'pill' },
          { id: 'a', label: 'Automation-based', sub: 'code → each box' },
          { id: 'c', label: 'Controller-based', sub: 'controller → all boxes' },
          { id: 'cl', label: 'Cloud-based', sub: 'vendor cloud → all boxes', tone: 'accent', shape: 'round' },
        ],
      },
      notes:
        "Read the diagram from left to right as increasing centralization. In **device-based** management the engineer is the integration point: every change is a separate session on a separate device. In **automation-based** management the engineer writes code or templates once and a tool such as Ansible, Terraform or a Python script applies them to many devices, but each device is still configured individually by the tool. In **controller-based** management a dedicated system — Catalyst Center, a wireless LAN controller or Catalyst SD-WAN Manager — holds network-wide policy and programs the devices for you, usually from your own data center. **Cloud-based** management moves that controller into the vendor's cloud: Meraki devices phone home to the Meraki dashboard, and you manage every site from a browser. The two questions in the last bullet unlock almost every exam item on this topic: *where does the configuration live* (device, Git repository, controller database or vendor cloud) and *how does it reach the device* (a human session, a tool, a controller API or a cloud connection).",
    },
    {
      kind: 'diagram',
      title: 'Device-based management',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'admin', icon: 'laptop', label: 'Admin', x: 1.2, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', x: 5.2, y: 0.9 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 8.4, y: 1.7 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 8.4, y: 3.4 },
          { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'autonomous', x: 5.2, y: 4.1 },
        ],
        links: [
          { from: 'admin', to: 'r1', style: 'dashed', label: 'console' },
          { from: 'admin', to: 'sw1', style: 'dashed', label: 'SSH' },
          { from: 'admin', to: 'sw2', style: 'dashed', label: 'SSH' },
          { from: 'admin', to: 'ap1', style: 'dashed', label: 'HTTPS GUI' },
        ],
      },
      caption: 'One session, one device, one change at a time.',
      bullets: [
        'Access: console (out-of-band), SSH on TCP 22, web GUI over HTTPS',
        'Monitoring: `show` commands, SNMP and syslog, device by device',
      ],
      notes:
        "Device-based management — also called box-by-box or traditional management — is where every CCNA starts. The engineer connects to one device at a time: through the **console port** (out-of-band, works even when the network is broken), over **SSH** on TCP 22 (in-band and encrypted; Telnet on TCP 23 should be disabled because it is cleartext) or through a **web GUI** over HTTPS on devices that offer one, such as an autonomous access point. Monitoring is equally per-device: `show` commands, SNMP polling and syslog messages from each box. Nothing else is required — no servers, licenses or controllers — which is why this approach is still perfectly reasonable for a small office with a router, two switches and an AP. The configuration lives in each device's running-config and startup-config, and there is no central record of what each device *should* look like. That last point is the root of the problems on the next slide. The exam expects you to recognize this approach from descriptions such as *each device is configured individually* or *the engineer connects to every device with SSH*.",
    },
    {
      kind: 'compare',
      title: 'Device-based: strengths and limits',
      left: {
        heading: 'Strengths',
        tone: 'good',
        bullets: [
          'Simple — no extra servers, licenses or controllers',
          'Full, granular control of every feature',
          'Console access works even when the network is down',
          'Fine for small, stable networks',
        ],
      },
      right: {
        heading: 'Limits',
        tone: 'bad',
        bullets: [
          'Slow: effort grows with every device added',
          'Typos, inconsistency and configuration drift',
          'Visibility is one box at a time',
          'Depends on scarce per-platform CLI experts',
        ],
      },
      notes:
        "Device-based management's strengths are real. It needs no additional infrastructure, so there is nothing extra to buy, patch or keep running. It gives complete, granular access to every feature the operating system supports, including brand-new or obscure commands that a controller may not expose yet. The console port provides a management path that does not depend on the network at all, which is vital when you are recovering from a mistake. For a small, stable network it is often the most practical choice. The limits show up as the network grows. Effort scales linearly with the number of devices. Every hand-typed change is an opportunity for a typo, and different engineers produce subtly different configurations, so devices drift away from the standard. Visibility is fragmented: to answer *which switches still run the old IOS XE release?* you must log in to each one. Finally, operations depend on people who know each platform's CLI, which is hard to scale. Exam options that describe inconsistency, slow change and no network-wide view point to device-based management.",
    },
    {
      kind: 'diagram',
      title: 'Automation-based management',
      diagram: {
        type: 'flow',
        direction: 'horizontal',
        nodes: [
          { id: 'git', label: 'Git repository', sub: 'templates + variables', shape: 'pill' },
          { id: 'ci', label: 'CI pipeline', sub: 'lint, test, review' },
          { id: 'tool', label: 'Ansible / Terraform', sub: 'or Python scripts', tone: 'accent' },
          { id: 'sb', label: 'SSH · NETCONF · API', sub: 'transport to devices' },
          { id: 'dev', label: 'Devices', sub: 'configured by the tool', shape: 'round' },
        ],
      },
      caption: 'Infrastructure as code: the repository, not the device, is the source of truth.',
      notes:
        "Automation-based management keeps the devices exactly as they are — no controller required — but changes *how* they are configured. The desired configuration is written as **infrastructure as code (IaC)**: templates plus variables stored in a **Git repository**, which becomes the source of truth. A change starts as an edit to those files, is reviewed as a pull request and is checked by a **CI pipeline** (syntax linting, tests, sometimes a dry run against lab devices). An automation tool — **Ansible** playbooks, **Terraform** configurations or custom **Python** scripts — then applies the result to every targeted device over SSH, NETCONF/RESTCONF or a platform API. Because the tool compares desired state with actual state, it can also report and correct drift on every run. The trade-offs: the team needs software skills (YAML, Jinja2 templates, Git, APIs), the pipeline itself must be built and maintained, and visibility is limited to whatever the tools collect — there is no built-in assurance dashboard as there is with a controller. Automation-based management is popular in multi-vendor environments, because the same tool can drive devices from many vendors.",
    },
    {
      kind: 'cli',
      title: 'Automation-based in practice: one run, many devices',
      code: `$ ansible-playbook -i inventory.yml ntp.yml

PLAY [Standardize NTP on branch routers] ***************************************

TASK [Configure NTP servers] ***************************************************
changed: [br1-rtr]
changed: [br2-rtr]
ok: [br3-rtr]

PLAY RECAP *********************************************************************
br1-rtr                    : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
br2-rtr                    : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
br3-rtr                    : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,
      highlight: ['changed: [br1-rtr]', 'changed: [br2-rtr]', 'ok: [br3-rtr]'],
      bullets: [
        '`changed` — the device was out of standard and has been fixed',
        '`ok` — already compliant, nothing touched (idempotent)',
      ],
      notes:
        "This is what automation-based management looks like from the engineer's chair. One command, `ansible-playbook`, reads an **inventory** of branch routers and a **playbook** that describes the NTP standard, then connects to each router over SSH. The output is per task and per host. `changed` means the router did not match the standard and Ansible modified it — br1-rtr and br2-rtr had drifted. `ok` means the router already matched, so nothing was sent: that is **idempotency**, and it is why the same playbook can be run every night to enforce the standard without side effects. The **PLAY RECAP** summarizes every host: ok, changed, unreachable (could not connect), failed (a task returned an error), skipped, rescued and ignored counts. When you see a recap like this on the exam, read it host by host: `changed=0` is not a failure, `unreachable=1` means a connectivity or credential problem, and `failed=1` means the device was reached but a task did not succeed. The playbook itself is covered in the configuration management lesson; here the point is the management model — the tool, driven by files in Git, configures each device.",
    },
    {
      kind: 'diagram',
      title: 'Controller-based management',
      diagram: {
        type: 'topology',
        width: 10,
        height: 6,
        nodes: [
          { id: 'admin', icon: 'laptop', label: 'Admin GUI', x: 2.6, y: 0.9 },
          { id: 'app', icon: 'server', label: 'ITSM / scripts', x: 7.4, y: 0.9 },
          { id: 'ctl', icon: 'controller', label: 'Controller', sub: 'e.g. Catalyst Center', x: 5, y: 2.9, tone: 'accent' },
          { id: 'r1', icon: 'router', label: 'R1', x: 1.4, y: 5 },
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 3.9, y: 5 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.2, y: 5 },
          { id: 'wlc', icon: 'wlc', label: 'WLC', x: 8.6, y: 5 },
        ],
        links: [
          { from: 'admin', to: 'ctl', label: 'HTTPS GUI' },
          { from: 'app', to: 'ctl', label: 'REST API' },
          { from: 'ctl', to: 'r1' },
          { from: 'ctl', to: 'sw1' },
          { from: 'ctl', to: 'sw2' },
          { from: 'ctl', to: 'wlc' },
        ],
      },
      caption: 'People and apps talk to the controller (northbound); the controller talks to devices (southbound: SSH, NETCONF, RESTCONF, SNMP).',
      notes:
        "In controller-based management a dedicated system sits between the engineers and the devices. Administrators use its **GUI**, and other software — ticketing systems, scripts, orchestration tools — uses its **northbound REST API**. The controller keeps a **network-wide database** of devices, topology and intended policy, and it programs the devices through **southbound** protocols such as SSH/CLI, NETCONF, RESTCONF and SNMP. You define a policy or template once — an SNMP standard, a QoS policy, an SSID — and the controller renders the device-specific configuration and pushes it everywhere it applies. Because the controller also collects telemetry from every device, it can show health scores, topology and issues for the whole network: *assurance*. Cisco's main examples are **Catalyst Center** (campus and branch), **wireless LAN controllers** (lightweight APs), **Catalyst SD-WAN Manager** (WAN edge routers) and **APIC** (ACI data centers). Controller-based management is normally deployed on premises — an appliance or virtual machine in your data center — which is the main difference from the cloud-based approach. The next lesson dives into the SDN architecture behind this picture.",
    },
    {
      kind: 'table',
      title: 'Cisco controllers and what they manage',
      columns: ['Controller', 'Manages', 'Highlights'],
      rows: [
        ['**Catalyst Center** (formerly DNA Center)', 'Campus/branch LAN, WLAN, SD-Access', 'Intent policy, assurance, PnP, templates, software images'],
        ['**Wireless LAN controller** (e.g. Catalyst 9800)', 'Lightweight APs', 'APs join over CAPWAP; WLANs and RF managed centrally'],
        ['**Catalyst SD-WAN Manager** (formerly vManage)', 'SD-WAN edge routers', 'Templates and policies for every WAN site'],
        ['**APIC** (Cisco ACI)', 'Data center spine-leaf fabric', 'Application-centric policy'],
        ['**Meraki dashboard**', 'MX, MS, MR, MV devices', 'The controller hosted in the vendor cloud'],
      ],
      notes:
        "Learn these names and their current branding, because the exam uses both old and new names. **Catalyst Center** was called **Cisco DNA Center** until 2023; it manages campus and branch switches, routers and wireless, provides assurance analytics, zero-touch **Plug and Play** onboarding, configuration templates and software image management, and it is the controller for SD-Access fabrics. A **wireless LAN controller** such as the Catalyst 9800 manages lightweight access points that join it over CAPWAP; WLANs, security and RF settings are defined once on the WLC rather than on each AP. **Catalyst SD-WAN Manager**, formerly **vManage**, is the management plane of Cisco SD-WAN and pushes templates and policies to the WAN edge routers. **APIC** (Application Policy Infrastructure Controller) manages Cisco ACI data center fabrics built on spine-leaf Nexus switches. Finally, the **Meraki dashboard** is also a controller — it simply runs in Cisco's cloud instead of your data center, which is why it gets its own category. The dividing line between the last two categories is where the controller runs, not whether one exists.",
    },
    {
      kind: 'diagram',
      title: 'Cloud-based management (Meraki)',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'admin', icon: 'laptop', label: 'Admin', sub: 'web browser', x: 1.2, y: 0.8 },
          { id: 'cloud', icon: 'cloud', label: 'Meraki cloud', sub: 'dashboard + API', x: 5, y: 0.8, tone: 'accent' },
          { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 2.45 },
          { id: 'mx', icon: 'firewall', label: 'MX', sub: 'security/SD-WAN', x: 2.8, y: 4.1 },
          { id: 'ms', icon: 'switch', label: 'MS', sub: 'switch', x: 5.4, y: 4.1 },
          { id: 'mr', icon: 'ap', label: 'MR', sub: 'access point', x: 8, y: 4.1 },
        ],
        links: [
          { from: 'admin', to: 'cloud', label: 'HTTPS' },
          { from: 'cloud', to: 'inet', style: 'dashed', label: 'mgmt only', arrow: 'both' },
          { from: 'inet', to: 'mx', label: 'outbound', arrow: 'back' },
          { from: 'mx', to: 'ms' },
          { from: 'ms', to: 'mr' },
        ],
        groups: [{ label: 'Branch site', x: 1.8, y: 3.3, w: 7.4, h: 1.6, tone: 'muted' }],
      },
      caption: 'Devices phone home over outbound connections; only management data goes to the cloud — user traffic stays local.',
      notes:
        "Cloud-based management puts the controller in the vendor's cloud. With **Cisco Meraki**, every device — **MX** security and SD-WAN appliances, **MS** switches, **MR** access points, **MV** cameras — is shipped with nothing but the knowledge of how to reach the Meraki cloud. When powered on with Internet access, the device **phones home**: it initiates an **outbound** connection, so no inbound firewall rules or public IP addresses are needed at the site. Through that connection the device downloads its configuration and firmware and uploads statistics and logs. Administrators manage every site worldwide from a browser, or programmatically through the **Dashboard API**. A crucial design detail is that the architecture is **out-of-band**: only management and monitoring data travel to the cloud, while users' traffic is switched and routed locally at the site, so the cloud is never in the data path. On the exam, phrases such as *devices contact the vendor cloud*, *managed from a web dashboard* and *zero-touch deployment by claiming a serial number* point to cloud-based management.",
    },
    {
      kind: 'compare',
      title: 'Cloud-based: strengths and trade-offs',
      left: {
        heading: 'Strengths',
        tone: 'good',
        bullets: [
          'Zero-touch: claim the serial, ship it, plug it in',
          'One dashboard for every site worldwide',
          'No controller hardware to install, patch or back up',
          'Vendor delivers new features and firmware',
        ],
      },
      right: {
        heading: 'Trade-offs',
        tone: 'warn',
        bullets: [
          'Internet access needed to make changes',
          'Subscription licensing (OpEx) must be kept current',
          'Management data is held in the vendor cloud',
          'Less granular than a full IOS CLI',
        ],
      },
      notes:
        "Cloud management shines for **distributed organizations with few on-site staff**: retail chains, clinics, schools, branch offices. Deployment is **zero-touch** — the device is claimed into the dashboard organization by its serial or order number, assigned to a network and configured before it ships; at the site, anyone can plug it in and it configures itself. There is no controller to size, install, upgrade or back up, and the vendor rolls out new features and firmware from the cloud. The trade-offs are just as important. Changes and fresh monitoring data require the site to reach the cloud, so Internet reliability matters. Licensing is a **subscription**, an operating expense that must be renewed. Configuration and telemetry live in the vendor's cloud, which some regulated or air-gapped organizations cannot accept. And the dashboard intentionally exposes a simplified feature set: you trade the fine-grained control of a full IOS CLI for simplicity at scale. Exam scenarios usually hinge on one of these: many small sites and no local IT favor cloud; an air-gapped network or data-sovereignty rule rules it out.",
    },
    {
      kind: 'table',
      title: 'The four approaches compared',
      columns: ['Aspect', 'Device-based', 'Automation-based', 'Controller-based', 'Cloud-based'],
      rows: [
        ['Config lives in', 'Each device', 'Git repository (IaC)', 'Controller database', 'Vendor cloud'],
        ['Scale', 'Small', 'Large', 'Large', 'Large, many sites'],
        ['Key skills', 'Per-platform CLI', 'Code, YAML, Git, APIs', 'Controller GUI, policy, APIs', 'Dashboard, APIs'],
        ['Visibility', 'One box at a time', 'What the tools collect', 'Network-wide + assurance', 'Network-wide, all sites'],
        ['If the manager fails', 'Only that device', 'Fall back to CLI; devices keep running', 'No changes; most traffic keeps flowing', 'No changes; devices keep last config'],
        ['Examples', 'Console, SSH, web GUI', 'Ansible, Terraform, Python', 'Catalyst Center, WLC, SD-WAN Manager', 'Meraki dashboard'],
      ],
      notes:
        "This table is the heart of the lesson. **Where the configuration lives** differs in every column: in each device, in a Git repository, in a controller database or in the vendor cloud. **Scale** improves as management centralizes; device-based is the only approach that becomes impractical as the network grows. **Skills** shift from per-platform CLI knowledge toward code and APIs (automation), policy design in a controller GUI (controller) or a simplified dashboard (cloud) — and protocol knowledge remains essential in all four. **Visibility** ranges from one box at a time to network-wide assurance across every site. **Failure domains** differ too: with device-based management a failure affects only the device concerned; if an automation server fails you fall back to the CLI while the network keeps running; if a controller or cloud dashboard becomes unreachable you lose the ability to make changes and see fresh data, but devices generally keep forwarding with their current configuration. The exception worth remembering is wireless: local-mode lightweight APs depend on their WLC, so an unprotected WLC failure does interrupt clients.",
    },
    {
      kind: 'diagram',
      title: 'Failure domains: the branch loses its Internet link',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'cloud', icon: 'cloud', label: 'Meraki cloud', sub: 'unreachable', x: 5, y: 0.8, tone: 'bad' },
          { id: 'mx', icon: 'firewall', label: 'MX', sub: 'keeps last config', x: 5, y: 2.4 },
          { id: 'pc', icon: 'pc', label: 'PC', x: 2, y: 4.1 },
          { id: 'ms', icon: 'switch', label: 'MS', x: 5, y: 4.1 },
          { id: 'srv', icon: 'server', label: 'File server', x: 8, y: 4.1 },
        ],
        links: [
          { from: 'cloud', to: 'mx', style: 'dashed', tone: 'bad', blocked: true, label: 'WAN down' },
          { from: 'mx', to: 'ms' },
          { from: 'pc', to: 'ms', tone: 'good', label: 'LAN traffic OK' },
          { from: 'ms', to: 'srv', tone: 'good' },
        ],
      },
      caption: 'Management depends on the cloud; local forwarding does not.',
      bullets: [
        'Existing configuration keeps running; local traffic flows',
        'No changes or fresh monitoring until the link returns',
      ],
      notes:
        "Thinking in **failure domains** — how far the impact of a failure spreads — is a practical way to compare approaches. Here a branch loses its Internet link. Because Meraki's cloud is out-of-band, the MX, the MS switch and the users' traffic between the PC and the local file server keep working with the **last configuration** the devices received. What stops is management: no configuration changes, no firmware updates and no fresh statistics in the dashboard until connectivity returns (and, of course, anything that needed the Internet itself is down). Controller-based designs behave similarly for most controllers. If Catalyst Center goes offline, campus switches keep forwarding; you simply cannot provision, upgrade or view assurance data until it is restored. The notable exception is the **wireless LAN controller**: a lightweight AP in local mode needs its CAPWAP connection to the WLC, so losing the only WLC disconnects its clients — which is why WLCs are deployed in high-availability pairs and why FlexConnect exists for branches. With device-based management there is no central component to fail, but there is also no central view.",
    },
    {
      kind: 'compare',
      title: 'Traditional vs controller-based networking',
      left: {
        heading: 'Traditional',
        bullets: [
          'Each device runs its own control plane',
          'Configured box by box via CLI',
          'Policy re-implemented on every device',
          'Monitoring: SNMP, syslog, show commands',
        ],
      },
      right: {
        heading: 'Controller-based',
        tone: 'accent',
        bullets: [
          'Controller has the network-wide view',
          'Devices programmed through southbound APIs',
          'Policy defined once, pushed everywhere',
          'Assurance, analytics and a northbound API',
        ],
      },
      notes:
        "This comparison is the exact wording of v1.1 topic 6.2, so expect questions built on it. In a **traditional** network every device is an island: each runs its own control plane, is configured individually through the CLI, and has any network-wide policy — QoS, security, SNMP settings — re-implemented by hand on each box. Operational visibility comes from SNMP, syslog and `show` commands gathered device by device. In a **controller-based** network the controller holds a centralized, network-wide view of devices, topology and policy. Devices are programmed through **southbound APIs** (NETCONF, RESTCONF, SSH, OpenFlow and others), so a policy is defined once and pushed wherever it applies. The controller provides **assurance** — health scores, analytics, suggested fixes — and exposes a **northbound API** so that other applications can automate against the whole network rather than against individual devices. Note that controller-based does not mean the data plane moves to the controller: devices still forward traffic themselves. The next lesson covers how far control functions are centralized in different SDN designs.",
    },
    {
      kind: 'definitions',
      title: 'Key terms',
      terms: [
        { term: 'Single pane of glass', def: 'One interface that shows and manages the whole network.' },
        { term: 'Zero-touch provisioning', def: 'A new device configures itself automatically when first connected — no on-site CLI work.' },
        { term: 'Plug and Play (PnP)', def: 'Catalyst Center onboarding; devices find the server via DHCP option 43, DNS or Cisco cloud redirect.' },
        { term: 'Infrastructure as code (IaC)', def: 'Network configuration described in version-controlled files and applied by tools.' },
        { term: 'Out-of-band management', def: 'Management traffic uses a path separate from user data (console network, Meraki cloud).' },
        { term: 'Northbound / southbound', def: 'Northbound: controller ↔ apps and admins. Southbound: controller ↔ devices.' },
        { term: 'Subscription licensing', def: 'Pay-per-term licensing typical of cloud platforms — OpEx rather than CapEx.' },
      ],
      notes:
        "These terms appear in both exam stems and answer options. A **single pane of glass** is one interface — a controller GUI or cloud dashboard — that shows and manages the whole network. **Zero-touch provisioning** means a new device obtains its configuration automatically the first time it is connected, so nobody on site needs CLI skills. In Catalyst Center this is **Plug and Play (PnP)**: an unconfigured device discovers the PnP server through DHCP option 43, a DNS lookup of a well-known PnP server name, or a redirect from Cisco's Plug and Play Connect cloud service, and is then onboarded with a template. In Meraki it is done by claiming the device into the dashboard. **Infrastructure as code** describes configuration in version-controlled files. **Out-of-band management** separates management traffic from user traffic — a dedicated console network is the classic example, and Meraki's cloud architecture uses the same term because user traffic never passes through the cloud. **Northbound** and **southbound** describe the two sides of a controller. **Subscription licensing** is an operating expense that must be renewed each term.",
    },
    {
      kind: 'steps',
      title: 'Choosing an approach: a worked scenario',
      steps: [
        { title: 'Size and spread', text: '300 small retail stores, each with an MX, one switch and two APs.' },
        { title: 'Staff and skills', text: 'Three network engineers; no IT staff at the stores.' },
        { title: 'Connectivity', text: 'Every store has reliable broadband Internet.' },
        { title: 'Constraints', text: 'New stores must be deployed without on-site configuration.' },
        { title: 'Decision', text: '**Cloud-based** (Meraki) fits: zero-touch deployment and one dashboard.' },
        { title: 'Complement', text: 'Use the Dashboard API and scripts for bulk changes and reports.' },
      ],
      notes:
        "Exam scenarios describe an organization and ask which approach fits best, so practice reasoning from requirements. Here the network is large and highly distributed — 300 stores — which rules out device-based management: three engineers cannot log in to 1,200 devices for every change. There is no IT staff in the stores, so new sites must deploy with **zero-touch provisioning**. Every store has reliable Internet access, so the main weakness of cloud management does not apply. A cloud-managed platform such as Meraki therefore fits best: devices are claimed and configured centrally, shipped, plugged in by store staff and managed from one dashboard. Change the facts and the answer changes. If the organization were a defense contractor with an **air-gapped** campus, the cloud would be ruled out and an on-premises controller such as Catalyst Center would fit. If it ran a multi-vendor data center with a strong DevOps team, automation-based management with Ansible or Terraform might be the best choice. Real networks usually **combine** approaches — for example, a controller for policy plus APIs and scripts for bulk tasks, with the console kept for emergencies.",
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam traps: management approaches',
      body: 'Identify the approach from **where the configuration lives** and **how it reaches the device** — then check the scenario constraints.',
      bullets: [
        'Meraki devices **phone home** outbound; the cloud is not in the user data path',
        'Cloud unreachable → devices keep forwarding; only management stops',
        'Cloud-based needs Internet — wrong answer for air-gapped networks',
        'Catalyst Center = former DNA Center; SD-WAN Manager = former vManage',
        'Controller-based ≠ controller forwards traffic; devices still forward',
        'Only WLC lost → local-mode APs drop clients (use HA or FlexConnect)',
      ],
      notes:
        "Most wrong answers on this topic come from a handful of misconceptions. First, cloud-managed devices do not wait for the cloud to connect to them — they **phone home** with outbound connections, which is why no inbound firewall rules are required. Second, the Meraki cloud carries **management data only**, so a lost Internet link stops changes and monitoring, not local forwarding. Third, cloud management requires Internet reachability, so it is the wrong answer whenever a stem mentions an air-gapped or disconnected environment or strict rules about where configuration data may be stored. Fourth, know the renamed products: **Catalyst Center** was DNA Center, **SD-WAN Manager** was vManage. Fifth, controller-based management centralizes policy and control functions, but the **data plane stays on the devices** — the controller is not a giant router that all traffic passes through. Finally, remember the wireless exception: a WLC is part of the control path for local-mode APs, so an unprotected WLC failure disconnects clients, whereas a Catalyst Center outage does not stop forwarding.",
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'Device-based: simple, no extra infrastructure — slow and drift-prone at scale',
        'Automation-based: IaC in Git, tools push changes; needs coding skills',
        'Controller-based: on-prem controller, network-wide policy and assurance',
        'Cloud-based: vendor dashboard, devices phone home, zero-touch deployment',
        'Compare on scale, skills, visibility and failure domains — and combine them',
      ],
      notes:
        "Four approaches, one set of questions. **Device-based** management needs nothing but the devices themselves and gives full control, but it is slow, inconsistent and blind to the big picture as the network grows. **Automation-based** management keeps the desired state as infrastructure as code in Git and lets tools such as Ansible and Terraform apply it, trading CLI typing for software skills. **Controller-based** management uses an on-premises controller — Catalyst Center, a WLC or SD-WAN Manager — to define policy once, push it everywhere and provide network-wide assurance and northbound APIs. **Cloud-based** management moves the controller into the vendor cloud: Meraki devices phone home, deploy with zero touch and are managed from one dashboard, while user traffic stays local. When you compare them, think about scale, the skills your team has, how much visibility you need, and what happens when the management system itself fails. Next, the controller-networking lesson opens up the SDN architecture behind controller-based management: planes, northbound and southbound APIs, and overlay, underlay and fabric.",
    },
  ],
  flashcards: [
    { id: 'f1', front: 'Device-based management', back: 'Each device is configured and monitored individually — console, SSH or a web GUI — with no central system. Also called box-by-box or traditional management.' },
    { id: 'f2', front: 'Automation-based management', back: 'Desired configuration is kept as code (templates + variables in Git) and applied to many devices by tools such as Ansible, Terraform or Python scripts.' },
    { id: 'f3', front: 'Controller-based management', back: 'A central, usually on-premises controller holds network-wide policy and programs devices through southbound protocols (e.g. Catalyst Center, WLC, SD-WAN Manager).' },
    { id: 'f4', front: 'Cloud-based management', back: 'A vendor-hosted dashboard manages the devices over the Internet; devices phone home to the cloud (e.g. Cisco Meraki).' },
    { id: 'f5', front: 'What does "phone home" mean for Meraki devices?', back: 'The device initiates an **outbound** connection to the Meraki cloud to fetch its configuration and firmware — no inbound firewall rules are needed at the site.' },
    { id: 'f6', front: 'What traffic goes to the Meraki cloud?', back: 'Management and monitoring data only. User traffic is forwarded locally (out-of-band architecture).' },
    { id: 'f7', front: 'Meraki site loses its Internet link — effect?', back: 'Devices keep forwarding with the last configuration; changes, firmware updates and fresh dashboard data wait until connectivity returns.' },
    { id: 'f8', front: 'Meraki product families', back: '**MX** security/SD-WAN appliances, **MS** switches, **MR** wireless APs, **MV** cameras.' },
    { id: 'f9', front: 'Former name of Catalyst Center', back: 'Cisco **DNA Center** (renamed in 2023).' },
    { id: 'f10', front: 'Former name of Catalyst SD-WAN Manager', back: '**vManage** (Viptela heritage).' },
    { id: 'f11', front: 'What does a wireless LAN controller manage?', back: 'Lightweight APs that join it over **CAPWAP**; WLANs, security and RF settings are defined centrally on the WLC.' },
    { id: 'f12', front: 'APIC', back: 'Application Policy Infrastructure Controller — the controller for Cisco **ACI** data center (spine-leaf) fabrics.' },
    { id: 'f13', front: 'Zero-touch provisioning', back: 'A new device obtains its configuration automatically when first connected, with no on-site CLI work.' },
    { id: 'f14', front: 'How does a device find the Catalyst Center PnP server?', back: 'DHCP option 43, a DNS lookup of the PnP server name, or a redirect from Cisco Plug and Play Connect (cloud).' },
    { id: 'f15', front: 'Single pane of glass', back: 'One interface (controller GUI or cloud dashboard) that shows and manages the entire network.' },
    { id: 'f16', front: 'Infrastructure as code (IaC)', back: 'Configuration described in version-controlled files and applied by tools, making changes reviewable, repeatable and reversible.' },
    { id: 'f17', front: 'Failure domain', back: 'The scope of impact when a component fails — e.g. one device, one site, or every device that depends on a controller.' },
    { id: 'f18', front: 'Only WLC fails — effect on local-mode APs?', back: 'They lose their CAPWAP connection and stop serving clients, unless a backup WLC (HA/N+1) exists or FlexConnect local switching is used.' },
    { id: 'f19', front: 'Catalyst Center goes offline — effect?', back: 'Devices keep forwarding with their current configuration; provisioning, upgrades and assurance are unavailable until it is restored.' },
    { id: 'f20', front: 'Licensing model typical of cloud-managed networks', back: 'Subscription (per term) — an operating expense (OpEx) that must be renewed.' },
    { id: 'f21', front: 'Which approach needs no extra management infrastructure?', back: 'Device-based management — only the devices and an engineer with console/SSH access.' },
    { id: 'f22', front: 'Best fit: hundreds of small sites, no local IT, Internet everywhere', back: 'Cloud-based management (e.g. Meraki) with zero-touch deployment.' },
    { id: 'f23', front: 'Why is cloud management a poor fit for an air-gapped network?', back: 'Devices must reach the vendor cloud to be configured and monitored, and configuration data is stored outside the organization.' },
    { id: 'f24', front: 'Northbound vs southbound (controller)', back: 'Northbound: between the controller and apps/admins (GUI, REST API). Southbound: between the controller and devices (SSH, NETCONF, RESTCONF, SNMP…).' },
    { id: 'f25', front: 'Ansible recap: `changed` vs `ok`', back: '`changed` = the device was modified to match the standard; `ok` = already compliant, nothing changed (idempotent).' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'match',
      stem: 'Match each management approach to an example.',
      pairs: [
        { left: 'Device-based', right: 'An SSH session to one switch' },
        { left: 'Automation-based', right: 'An Ansible playbook stored in Git' },
        { left: 'Controller-based', right: 'Catalyst Center pushing templates' },
        { left: 'Cloud-based', right: 'The Meraki dashboard' },
      ],
      difficulty: 1,
      explanation:
        'One SSH session per device is **device-based**; playbooks in Git are **automation-based**; Catalyst Center is an on-premises **controller**; the Meraki dashboard is a **cloud**-hosted controller.',
    },
    {
      id: 'q2',
      type: 'single',
      stem: 'How does a newly installed Meraki switch obtain its configuration?',
      options: [
        'It initiates an outbound connection to the Meraki cloud and downloads it',
        'An engineer pastes it into the console port',
        'A local WLC pushes it with CAPWAP',
        'It downloads a file from a TFTP server named in DHCP option 150',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        'Meraki devices **phone home** to the cloud over outbound connections. No console work is needed, WLCs manage lightweight APs rather than Meraki switches, and option 150 is used by Cisco IP phones to find their TFTP server.',
    },
    {
      id: 'q3',
      type: 'single',
      stem: 'Which traffic passes through the Meraki cloud in a cloud-managed branch?',
      options: ['Management and monitoring data only', 'All user traffic to the Internet', 'All traffic between local VLANs', 'Only voice and video traffic'],
      answer: 0,
      difficulty: 1,
      explanation:
        'The Meraki architecture is **out-of-band**: only management data goes to the cloud. User traffic — local or Internet-bound — is forwarded by the devices at the site and never hairpins through the dashboard.',
    },
    {
      id: 'q4',
      type: 'multi',
      stem: 'Which two statements describe device-based management? (Choose two.)',
      options: [
        'Each device is configured individually',
        'No additional management infrastructure is required',
        'Configuration is stored in a vendor cloud',
        'Changes are pushed from a Git pipeline',
        'Network-wide assurance is built in',
      ],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        'Device-based management means **one device at a time** and **no extra infrastructure**. Vendor-cloud storage is cloud-based, Git pipelines are automation-based, and network-wide assurance comes with controller- or cloud-based platforms.',
    },
    {
      id: 'q5',
      type: 'input',
      stem: 'What is the current product name of Cisco DNA Center?',
      answers: ['Catalyst Center', 'Cisco Catalyst Center'],
      placeholder: 'product name',
      difficulty: 1,
      explanation:
        'Cisco renamed DNA Center to **Catalyst Center** in 2023. Exam items and older documentation may use either name, and the SD-WAN products were renamed at the same time (vManage became SD-WAN Manager).',
    },
    {
      id: 'q6',
      type: 'categorize',
      stem: 'Classify each statement as describing cloud-based or controller-based (on-premises) management.',
      categories: ['Cloud-based', 'Controller-based (on-premises)'],
      items: [
        { text: 'Dashboard hosted by the vendor', category: 0 },
        { text: 'Devices claimed by serial number in a web dashboard', category: 0 },
        { text: 'Changes require the site to reach the Internet', category: 0 },
        { text: 'Catalyst Center appliance in the data center', category: 1 },
        { text: 'A Catalyst 9800 WLC in the campus core', category: 1 },
      ],
      difficulty: 2,
      explanation:
        'Vendor hosting, claiming by serial number and dependence on Internet reachability are **cloud-based** traits. Catalyst Center appliances and on-site WLCs are **controllers you run yourself**, typically on premises.',
    },
    {
      id: 'q7',
      type: 'single',
      stem: 'The Catalyst Center appliance goes offline for an hour. What is the effect on the campus network?',
      options: [
        'Switches keep forwarding, but provisioning and assurance are unavailable',
        'All switches reload and lose their configuration',
        'Traffic stops because every packet passes through Catalyst Center',
        'OSPF adjacencies drop because Catalyst Center runs the routing protocol',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Catalyst Center manages devices but is **not in the data path** and does not run their routing protocols. Devices keep their configuration and forwarding state; you only lose the ability to make changes and see fresh analytics.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Which network management approach configures each device individually through its CLI or web GUI?',
      options: ['Device-based', 'Automation-based', 'Controller-based', 'Cloud-based'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Device-based** (box-by-box) management means one session per device. Automation-based uses tools driven by code, controller-based uses a central on-premises controller, and cloud-based uses a vendor-hosted dashboard — none of them requires logging in to each device.',
    },
    {
      id: 'e2',
      type: 'single',
      stem: 'Refer to the exhibit. A new, unconfigured MX appliance is connected at Store 12. How does it receive its configuration?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'admin', icon: 'laptop', label: 'Admin', sub: 'head office', x: 1.2, y: 0.8 },
            { id: 'cloud', icon: 'cloud', label: 'Meraki cloud', x: 5, y: 0.8 },
            { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 2.45 },
            { id: 'mx', icon: 'firewall', label: 'MX-Store12', sub: 'new, unconfigured', x: 5, y: 4.1 },
          ],
          links: [
            { from: 'admin', to: 'cloud', label: 'HTTPS' },
            { from: 'cloud', to: 'inet', style: 'dashed' },
            { from: 'inet', to: 'mx', label: 'broadband' },
          ],
        },
      },
      options: [
        'It initiates an outbound connection to the Meraki cloud and downloads its dashboard configuration',
        'The cloud dashboard opens an inbound SSH session to the MX and pushes the configuration to it',
        'A controller at the head office discovers the MX and pushes the configuration with NETCONF',
        'It requests a configuration file from the TFTP server whose address it learns from DHCP option 150',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Cloud-managed Meraki devices **phone home**: they open outbound connections to the cloud and pull the configuration the administrator defined in the dashboard. The cloud never needs an inbound path to the site, there is no on-premises controller in this design, and DHCP option 150 is how Cisco IP phones find their TFTP server.',
    },
    {
      id: 'e3',
      type: 'multi',
      stem: 'Which two statements about cloud-based management with Meraki are true? (Choose two.)',
      options: [
        'Devices keep forwarding traffic if cloud connectivity is lost',
        'User data traffic does not pass through the Meraki cloud',
        'The dashboard software must be installed on a local server',
        'Each device must be configured through its CLI before it can join',
        'Inbound firewall rules must allow the cloud to connect to each device',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'The Meraki architecture is **out-of-band**: only management data goes to the cloud, so user traffic stays local and devices keep forwarding with their last configuration if the cloud is unreachable. The dashboard is hosted by Cisco (nothing to install), devices need no CLI preparation, and because devices initiate outbound connections no inbound rules are required.',
    },
    {
      id: 'e4',
      type: 'single',
      stem: 'Refer to the exhibit. Which management approach best fits this company?',
      exhibit: {
        kind: 'table',
        columns: ['Item', 'Detail'],
        rows: [
          ['Sites', '400 retail stores and one small head office'],
          ['Per store', 'One security appliance, one switch, two APs'],
          ['IT staff', 'Three network engineers at head office; none in stores'],
          ['Connectivity', 'Reliable broadband Internet at every store'],
          ['Goal', 'Open 30 new stores a month with no on-site configuration'],
        ],
      },
      options: [
        'Cloud-based management',
        'Device-based management',
        'Controller-based management with an on-premises WLC in every store',
        'Automation-based management with a Git pipeline operated by store staff',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Many small sites, reliable Internet, no local IT and a need for **zero-touch** deployment are the textbook case for **cloud-based** management. Device-based management cannot scale to 1,600+ devices with three engineers, a WLC in every store adds hardware and on-site work, and store staff are not the people to operate a Git pipeline.',
    },
    {
      id: 'e5',
      type: 'categorize',
      stem: 'Drag each description to the management approach it represents.',
      categories: ['Device-based', 'Automation-based', 'Controller-based', 'Cloud-based'],
      items: [
        { text: 'An engineer opens an SSH session to each switch', category: 0 },
        { text: 'A console cable is used to configure a new router', category: 0 },
        { text: 'Playbooks stored in Git are run by a pipeline', category: 1 },
        { text: 'Terraform plans and applies changes through device APIs', category: 1 },
        { text: 'Catalyst Center pushes templates to campus switches', category: 2 },
        { text: 'A Catalyst 9800 WLC manages 200 lightweight APs', category: 2 },
        { text: 'Devices are claimed by serial number in a web dashboard', category: 3 },
        { text: 'The vendor hosts the management plane; devices phone home', category: 3 },
      ],
      difficulty: 2,
      explanation:
        'Individual SSH or console sessions are **device-based**. Code in Git applied by Ansible or Terraform is **automation-based**. Catalyst Center and WLCs are on-premises **controllers**. Claiming devices in a vendor dashboard and phoning home to a vendor-hosted management plane are **cloud-based** (Meraki).',
    },
    {
      id: 'e6',
      type: 'single',
      stem: 'Refer to the exhibit. An engineer runs an NTP-standardization playbook against three routers. What can be concluded?',
      exhibit: {
        kind: 'cli',
        text: `PLAY RECAP *********************************************************************
br1-rtr                    : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
br2-rtr                    : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0
br3-rtr                    : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,
      },
      options: [
        'br1-rtr was updated to match the standard, br3-rtr already matched it and br2-rtr was unreachable',
        'br1-rtr, br2-rtr and br3-rtr were each changed successfully and now match the NTP standard',
        'br3-rtr failed, because changed=0 shows that the playbook could not apply its NTP settings',
        'br2-rtr accepted the connection but rejected the NTP commands because of a syntax error',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '`changed=1` on br1-rtr means Ansible modified it to match the standard; `ok=1 changed=0` on br3-rtr means it was already compliant and was left alone (idempotency) — not a failure. `unreachable=1` on br2-rtr is a connection-level problem, such as the router being down or SSH being blocked. A syntax error would appear as `failed=1` on a host that *was* reached.',
    },
    {
      id: 'e7',
      type: 'single',
      stem: 'Which statement describes controller-based network management?',
      options: [
        'A central controller holds network-wide policy and programs the devices through southbound interfaces',
        'Each device stores and applies its own policy and is managed separately, with no central view',
        'Engineers run scripts from their laptops that log in to each device in turn and apply the changes',
        'User traffic is forwarded through the controller so that it can inspect it and apply policy',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'A controller keeps the **network-wide view and policy** and uses southbound protocols (SSH, NETCONF, RESTCONF, SNMP…) to configure devices. Independent per-device policy is traditional management, laptop scripts are automation-based, and controllers are not in the user data path — devices still forward traffic themselves.',
    },
    {
      id: 'e8',
      type: 'multi',
      stem: 'The Catalyst Center appliance that manages a campus fails and will be offline for several hours. Which two effects should the team expect? (Choose two.)',
      options: [
        'Switches keep forwarding traffic with their current configuration',
        'New templates and software upgrades cannot be pushed until it is restored',
        'All switches reload and lose their configuration',
        'OSPF adjacencies drop because the controller runs the routing protocol',
        'Users must reauthenticate to the controller before they can send traffic',
      ],
      answers: [0, 1],
      difficulty: 3,
      explanation:
        'Catalyst Center is a management and automation platform, not a forwarding device: switches **keep forwarding** with their existing configuration and routing protocols keep running on the devices. What is lost is the ability to **provision, upgrade and see assurance data**. Switches do not reload, and user authentication is handled by services such as ISE/RADIUS, not by Catalyst Center.',
    },
    {
      id: 'e9',
      type: 'single',
      stem: 'Refer to the exhibit. WLC-1, the only wireless LAN controller, fails. AP1 operates in local mode. What happens to the wireless clients on AP1?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'wlc', icon: 'wlc', label: 'WLC-1', sub: 'only controller', x: 1.5, y: 1.2, tone: 'bad' },
            { id: 'core', icon: 'l3switch', label: 'Core', x: 4.5, y: 1.2 },
            { id: 'acc', icon: 'switch', label: 'SW-ACC', x: 4.5, y: 3.6 },
            { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'local mode', x: 7.5, y: 3.6 },
            { id: 'cl', icon: 'laptop', label: 'Clients', x: 9, y: 1.4 },
          ],
          links: [
            { from: 'wlc', to: 'core' },
            { from: 'core', to: 'acc' },
            { from: 'acc', to: 'ap1' },
            { from: 'ap1', to: 'cl', style: 'wireless' },
            { from: 'ap1', to: 'wlc', style: 'dashed', label: 'CAPWAP', tone: 'bad', blocked: true },
          ],
        },
      },
      options: [
        'They lose connectivity, because AP1 needs its CAPWAP connection to a WLC to serve clients',
        'They keep full service, because AP1 caches the WLC configuration and runs indefinitely',
        'They are moved automatically to the Meraki cloud',
        'They keep service, but only for traffic to other clients on AP1',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'A **local-mode** lightweight AP depends on its CAPWAP tunnel to the WLC for control and, for centrally switched WLANs, for data. When the only WLC fails, AP1 drops its clients and searches for another controller. This is why WLCs are deployed as HA pairs or with N+1 backups, and why branch APs use **FlexConnect**, which can keep locally switched WLANs running without the WLC. Lightweight APs do not fail over to Meraki, and they do not keep serving clients on cached configuration in local mode.',
    },
    {
      id: 'e10',
      type: 'match',
      stem: 'Match each Cisco controller to what it manages.',
      pairs: [
        { left: 'Catalyst Center', right: 'Campus and branch LAN, including SD-Access' },
        { left: 'Wireless LAN controller', right: 'Lightweight access points' },
        { left: 'Catalyst SD-WAN Manager', right: 'SD-WAN edge routers' },
        { left: 'APIC', right: 'ACI data center fabric' },
        { left: 'Meraki dashboard', right: 'Cloud-managed MX, MS and MR devices' },
      ],
      difficulty: 2,
      explanation:
        '**Catalyst Center** (ex-DNA Center) runs campus/branch and SD-Access; a **WLC** manages lightweight APs over CAPWAP; **SD-WAN Manager** (ex-vManage) manages WAN edge routers; **APIC** controls ACI data center fabrics; the **Meraki dashboard** is the cloud-hosted controller for Meraki devices.',
    },
    {
      id: 'e11',
      type: 'single',
      stem: 'Which characteristic distinguishes automation-based management from device-based management?',
      options: [
        'The desired configuration is kept in version-controlled files that tools apply to many devices',
        'Devices no longer need a management IP address because the automation tool reaches them without one',
        'A vendor cloud stores the configuration of each device and pushes changes to it over the Internet',
        'Each engineer logs in to the devices one by one to verify and document each change by hand',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Automation-based management treats configuration as **code**: templates and variables in Git are applied by tools such as Ansible or Terraform. Devices still need management reachability for the tool to connect, vendor-cloud storage describes cloud-based management, and logging in to every device is exactly the per-device work automation removes.',
    },
    {
      id: 'e12',
      type: 'match',
      stem: 'Match each Meraki product family to its function.',
      pairs: [
        { left: 'MX', right: 'Security appliance and SD-WAN' },
        { left: 'MS', right: 'Switches' },
        { left: 'MR', right: 'Wireless access points' },
        { left: 'MV', right: 'Security cameras' },
      ],
      difficulty: 1,
      explanation:
        '**MX** appliances provide firewall, VPN and SD-WAN; **MS** are switches; **MR** are wireless APs; **MV** are smart cameras. All of them are managed from the same Meraki dashboard.',
    },
    {
      id: 'e13',
      type: 'input',
      stem: 'Cisco Catalyst SD-WAN Manager was previously known by what name?',
      answers: ['vManage', 'Cisco vManage', 'Viptela vManage'],
      placeholder: 'former name',
      difficulty: 1,
      explanation:
        'SD-WAN Manager was **vManage**, the management plane from the Viptela acquisition. Likewise, the SD-WAN Controller was vSmart, the SD-WAN Validator was vBond, and Catalyst Center was DNA Center.',
    },
    {
      id: 'e14',
      type: 'single',
      stem: 'Refer to the exhibit. Which management approach best meets every requirement?',
      exhibit: {
        kind: 'table',
        columns: ['Requirement', 'Detail'],
        rows: [
          ['Sites', 'Two data centers and 60 campus buildings'],
          ['Connectivity', 'No Internet access permitted from the management network'],
          ['Features', 'Network-wide assurance, SD-Access fabric, zero-touch switch onboarding'],
          ['Team', '12 engineers with limited programming experience'],
        ],
      },
      options: [
        'Controller-based, with an on-premises Catalyst Center',
        'Cloud-based, with the Meraki dashboard',
        'Automation-based, with Ansible playbooks in Git',
        'Device-based, with SSH sessions to each switch',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'An on-premises **Catalyst Center** provides assurance, SD-Access and PnP zero-touch onboarding without Internet access and without heavy programming. Cloud management is ruled out by the no-Internet requirement. Ansible alone provides no assurance dashboard or SD-Access fabric and needs coding skills. Device-based management offers none of the features and does not scale.',
    },
    {
      id: 'e15',
      type: 'order',
      stem: 'Put the steps of a zero-touch deployment of a new Meraki switch in order.',
      items: [
        'Claim the switch into the dashboard organization by serial or order number',
        'Add it to the store network and define its configuration in the dashboard',
        'Ship it to the store, where staff connect power and the uplink',
        'The switch phones home to the Meraki cloud',
        'The switch downloads its configuration and firmware and appears online',
      ],
      difficulty: 2,
      explanation:
        'The device is **claimed** and **configured** centrally before it ever reaches the site. On site, staff only connect it; the switch then **phones home** over the Internet, **downloads** its configuration and firmware and shows up in the dashboard. No step requires CLI work at the store.',
    },
    {
      id: 'e16',
      type: 'multi',
      stem: 'Which two are advantages of device-based management? (Choose two.)',
      options: [
        'It requires no additional servers, controllers or subscriptions',
        'Console access works even when the network itself is down',
        'It scales to thousands of devices with little extra effort',
        'It prevents configuration drift between devices over time',
        'It provides network-wide assurance and health scoring',
      ],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        'Device-based management needs **no extra infrastructure**, and the **console** is an out-of-band path that works even during a network outage. It scales poorly, it is the main cause of drift rather than a cure, and it offers visibility one box at a time rather than network-wide assurance.',
    },
    {
      id: 'e17',
      type: 'single',
      stem: 'Refer to the exhibit. An engineer must change the security settings of the corporate SSID on all 500 lightweight APs. What is the most efficient method?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'wlc', icon: 'wlc', label: 'WLC', sub: 'Catalyst 9800', x: 5, y: 0.9 },
            { id: 'sw', icon: 'l3switch', label: 'Core', x: 5, y: 2.5 },
            { id: 'ap1', icon: 'ap', label: 'AP1', x: 2, y: 4.1 },
            { id: 'ap2', icon: 'ap', label: 'AP2', x: 4, y: 4.1 },
            { id: 'ap3', icon: 'ap', label: 'AP3', x: 6, y: 4.1 },
            { id: 'ap4', icon: 'ap', label: 'AP500', x: 8, y: 4.1 },
          ],
          links: [
            { from: 'wlc', to: 'sw' },
            { from: 'sw', to: 'ap1' },
            { from: 'sw', to: 'ap2' },
            { from: 'sw', to: 'ap3' },
            { from: 'sw', to: 'ap4', style: 'dotted' },
          ],
        },
      },
      options: [
        'Edit the WLAN once on the WLC, which applies it to every joined AP',
        'Console into each AP and edit its local configuration',
        'Configure the SSID on each access-switch port that connects an AP',
        'Reboot the APs so that they download the SSID from a TFTP server',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Lightweight APs are **controller-managed**: WLANs are defined on the WLC and pushed to every AP over CAPWAP, so one edit covers all 500. Lightweight APs have no local WLAN configuration to edit, switches do not carry SSID settings, and APs do not fetch SSIDs from TFTP.',
    },
    {
      id: 'e18',
      type: 'categorize',
      stem: 'Classify each failure by its effect on existing user traffic.',
      categories: ['User traffic keeps flowing', 'User traffic is disrupted'],
      items: [
        { text: 'The Catalyst Center appliance goes offline', category: 0 },
        { text: 'A Meraki branch loses its path to the cloud but keeps its LAN', category: 0 },
        { text: 'The Git server holding the Ansible playbooks is down', category: 0 },
        { text: "The engineer's laptop crashes during an SSH session", category: 0 },
        { text: 'The only WLC fails while its APs run in local mode', category: 1 },
        { text: 'The access switch the users connect to loses power', category: 1 },
      ],
      difficulty: 3,
      explanation:
        'Management systems — Catalyst Center, the Meraki cloud, a Git server, an SSH session — are **not in the data path**, so their loss stops changes and monitoring but not forwarding. A **WLC** is different for local-mode APs, which need it to serve clients, and a failed access switch obviously breaks the users’ physical path.',
    },
    {
      id: 'e19',
      type: 'single',
      stem: 'Refer to the exhibit. New, unconfigured switches will be connected in VLAN 99. What is the purpose of option 43 in this DHCP pool?',
      exhibit: {
        kind: 'cli',
        text: `SW-CORE(config)# ip dhcp pool PNP-VLAN99
SW-CORE(dhcp-config)# network 10.10.99.0 255.255.255.0
SW-CORE(dhcp-config)# default-router 10.10.99.1
SW-CORE(dhcp-config)# option 43 ascii "5A1N;B2;K4;I10.10.20.50;J80"`,
      },
      options: [
        'It gives new devices the address of the Catalyst Center PnP server for zero-touch provisioning',
        'It tells Cisco IP phones which TFTP server to use to download their configuration files',
        'It sets the DNS domain name that the switches append to hostnames when they resolve names',
        'It assigns the NTP server that the switches use to synchronize their clocks and log timestamps',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'The ASCII string in Cisco PnP format points new devices at the **PnP server**: `I10.10.20.50` is the server address, `J80` the port and `K4` HTTP transport. Unconfigured switches running the PnP agent use it to contact Catalyst Center and receive their configuration. IP phones use **option 150** for TFTP, the domain name is option 15 (`domain-name`), and NTP servers are option 42. (Option 43 is also used by lightweight APs to find a WLC, but in a hex TLV format, not this ASCII PnP string.)',
    },
    {
      id: 'e20',
      type: 'single',
      stem: 'A team manages router SNMP settings with an Ansible playbook, and the Git repository is the source of truth. During an outage, an engineer changes the SNMP settings directly on one router and does not update the repository. What happens on the next scheduled playbook run?',
      options: [
        'The playbook detects the difference and changes the SNMP settings back to the repository version',
        'The playbook reads the emergency change and commits it to the Git repository as the new standard',
        'The playbook skips the router because its configuration is newer than the repository version',
        'Ansible reboots the router so that it loads its startup configuration and discards the change',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'With automation-based management the **repository defines the desired state**, so the next run treats the manual change as drift and reverts it. That is why emergency fixes must be committed back to Git. Ansible does not write device changes into the repository, does not compare timestamps to decide what wins, and does not reboot devices to apply configuration.',
    },
    {
      id: 'e21',
      type: 'multi',
      stem: 'Which two are required before a new Meraki switch can be managed after it is plugged in at a site? (Choose two.)',
      options: [
        'It must be claimed into the organization in the Meraki dashboard',
        'It must be able to reach the Meraki cloud over the Internet',
        'It must be loaded with an IOS startup-config first',
        'A local WLC must be present to push its configuration',
        'Inbound NAT rules must let the dashboard connect to it',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'A Meraki device is managed only once it is **claimed** into a dashboard organization and can **reach the cloud** over outbound Internet connections. No startup-config preparation is needed, WLCs play no part in Meraki switch management, and inbound NAT is unnecessary because the device initiates the connection.',
    },
  ],
};

export default lesson;
