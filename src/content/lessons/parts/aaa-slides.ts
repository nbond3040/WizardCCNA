import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'AAA, RADIUS, TACACS+ & 802.1X',
    subtitle: 'Who are you, what may you do, and what did you do: decided centrally',
    notes:
      "Every router, switch, firewall and wireless controller must decide who may log in to it and who may connect through it. Handling that with local usernames on hundreds of devices does not scale and leaves no audit trail. **AAA** (authentication, authorization and accounting) moves those decisions to a central server such as **Cisco ISE**. In this lesson you will define the three As with concrete examples, compare the two AAA protocols the CCNA loves to contrast, **RADIUS** and **TACACS+**, configure IOS to use a server with a local fallback, and follow **802.1X** as it uses the same machinery to authenticate users before a switch port or WLAN lets them in. The material is part of both exam versions (v1.1 topics 5.8 and 2.8, v2.0 domain 4). Expect direct questions on port numbers, encryption scope, method-list fallback behavior and the three 802.1X roles, plus scenario questions that ask you to pick the right protocol for a requirement.",
  },
  {
    kind: 'bullets',
    title: 'Why centralize with AAA?',
    bullets: [
      'Local accounts on every device do not scale',
      { text: 'A leaver keeps **admin passwords** on 300 switches', sub: ['Central server: disable once, blocked everywhere'] },
      'One policy for **who**, **what** and **when**',
      'Audit trail of logins and commands for compliance',
      'Same server handles **admins** (CLI) and **users** (802.1X, VPN, Wi-Fi)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'adm', icon: 'laptop', label: 'Admin', x: 1, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 4.5, y: 0.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.5, y: 2.5 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 4.5, y: 4.1 },
        { id: 'ise', icon: 'server', label: 'ISE', sub: 'AAA server', x: 8.5, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'adm', to: 'sw1', label: 'SSH', style: 'dashed' },
        { from: 'r1', to: 'ise', label: 'TACACS+' },
        { from: 'sw1', to: 'ise', label: 'TACACS+ / RADIUS' },
        { from: 'wlc', to: 'ise', label: 'RADIUS' },
      ],
    },
    notes:
      "Picture 300 switches and routers, each with its own `username admin secret ...` line. When an engineer leaves the company, someone must log in to every device to delete the account, and the one switch that gets forgotten becomes a back door. Local accounts also leave no reliable record of who changed what and when. **AAA** fixes this by turning each network device into an **AAA client** (often called a NAS, network access server) that asks a central server for every decision. Disable the engineer once in ISE or Active Directory and every device refuses the login at the next attempt. The same server can limit what each person may type and can log every command, which auditors love. Notice in the diagram that the administrator's SSH session ends on the device; the device then talks to ISE on the administrator's behalf. That split, one protocol from the user to the device and another from the device to the server, returns later in this lesson with 802.1X.",
  },
  {
    kind: 'steps',
    title: 'The three As',
    steps: [
      { title: '**Authentication**: who are you?', text: 'Password, certificate, token or MAC address proves identity' },
      { title: '**Authorization**: what may you do?', text: 'Privilege level, allowed commands, VLAN or ACL granted after login' },
      { title: '**Accounting**: what did you do?', text: 'Records session start/stop, commands entered, bytes and duration' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a1', label: 'Authentication', sub: 'Who?', shape: 'round' },
        { id: 'a2', label: 'Authorization', sub: 'What may you do?', shape: 'round' },
        { id: 'a3', label: 'Accounting', sub: 'What was done?', shape: 'round' },
      ],
    },
    notes:
      "Learn the three As as three questions asked in a fixed order. **Authentication** proves identity: an administrator types a username and password at an SSH prompt, a laptop presents a certificate, or a printer is recognized by its MAC address. **Authorization** happens only after successful authentication and decides what that identity may do: a help-desk engineer might receive privilege level 5 with only `show` commands while a senior engineer gets level 15, and a contractor laptop might be placed in a restricted VLAN. **Accounting** records what actually happened: when the session started and ended, which commands were typed and how many bytes were transferred. A useful analogy is an office building: authentication is showing your badge at the entrance, authorization is which doors that badge opens, and accounting is the log of every door you opened. Exam items often describe an action and ask which A it belongs to. For example, logging each configuration command to a server is accounting, not authorization.",
  },
  {
    kind: 'definitions',
    title: 'AAA vocabulary',
    terms: [
      { term: '**AAA client (NAS)**', def: 'Router, switch, WLC, firewall or VPN gateway that asks the AAA server for decisions.' },
      { term: '**AAA server**', def: 'Central policy server that checks identities and returns accept/reject plus authorization data, e.g. Cisco ISE.' },
      { term: '**Shared secret (key)**', def: 'Secret configured identically on the AAA client and the server to protect the traffic between them.' },
      { term: '**Method list**', def: 'Ordered list of sources IOS tries for one AAA service, e.g. `group tacacs+` then `local`.' },
      { term: '**Local database**', def: 'Usernames configured on the device itself with `username ... secret ...`, the usual fallback.' },
      { term: '**Identity store**', def: 'Where the server validates credentials: its internal users, Active Directory or LDAP.' },
    ],
    notes:
      "These six terms appear throughout AAA documentation and exam questions, so pin them down now. The **AAA client** is the network device, not the human: when you SSH to R1, R1 is the AAA client and you are the user. RADIUS documentation calls the same device a **NAS** (network access server), a name inherited from dial-up modem racks. The **AAA server** holds the policy; Cisco ISE is the current Cisco product, and many exam questions simply say 'a RADIUS server' or 'a TACACS+ server'. The **shared secret** is not a user password: it is a key configured on both the device and the server so each can trust and decode the other's messages, and if the two keys differ, AAA fails. A **method list** is how IOS expresses order and fallback, and the **local database** is the set of `username` commands on the device, normally kept as a break-glass path. Finally, ISE often validates passwords against an external **identity store** such as Active Directory rather than storing every password itself.",
  },
  {
    kind: 'bullets',
    title: 'RADIUS: the network-access protocol',
    bullets: [
      'Open standard: IETF **RFC 2865** (accounting in RFC 2866)',
      '**UDP 1812** authentication · **UDP 1813** accounting',
      'Legacy ports **1645/1646** still common on Cisco gear',
      'Encrypts **only the password** in the Access-Request',
      '**Access-Accept** = authentication + authorization combined',
      'Best fit: **network access** (802.1X, Wi-Fi, VPN)',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'user', label: 'User', icon: 'laptop' },
        { id: 'nas', label: 'NAS (switch/WLC)', icon: 'switch' },
        { id: 'srv', label: 'RADIUS server', icon: 'server' },
      ],
      steps: [
        { from: 'user', to: 'nas', label: 'Credentials', sub: 'EAP, web portal or VPN login' },
        { from: 'nas', to: 'srv', label: 'Access-Request', sub: 'UDP 1812 · only User-Password hidden' },
        { from: 'srv', to: 'nas', label: 'Access-Accept', sub: 'plus authorization attributes (VLAN, ACL)', tone: 'accent' },
        { from: 'nas', to: 'srv', label: 'Accounting-Request (Start)', sub: 'UDP 1813' },
        { from: 'srv', to: 'nas', label: 'Accounting-Response' },
      ],
    },
    notes:
      "**RADIUS** (Remote Authentication Dial-In User Service) grew up in dial-up modem pools, which explains its focus on **network access**: deciding whether a user or device may join the network. It is an open IETF standard, so every vendor's switches, WLCs, VPN concentrators and firewalls speak it. RADIUS runs over **UDP**: port **1812** for authentication and authorization and **1813** for accounting. You will also meet the pre-standard pair **1645/1646**, which Cisco IOS still uses by default unless you specify the ports. Look at the exchange: the NAS sends one Access-Request, and the server answers with an **Access-Accept** that already contains the authorization attributes, such as a VLAN or an ACL. That is why RADIUS is said to **combine** authentication and authorization. If the server needs more data, for example during an EAP exchange, it replies with an **Access-Challenge**; a failed login gets an **Access-Reject**. Only the **User-Password** attribute is hidden; the username and every other attribute cross the wire in clear text.",
  },
  {
    kind: 'bullets',
    title: 'TACACS+: the device-administration protocol',
    bullets: [
      'Cisco-developed; runs over **TCP port 49**',
      'Encrypts the **entire body**; only the header is clear',
      '**Separates** authentication, authorization and accounting',
      'Per-command authorization: allow `show`, deny `reload`',
      'Best fit: **device administration** (CLI logins)',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'adm', label: 'Admin', icon: 'laptop' },
        { id: 'r1', label: 'R1 (AAA client)', icon: 'router' },
        { id: 'srv', label: 'ISE (TACACS+)', icon: 'server' },
      ],
      steps: [
        { from: 'adm', to: 'r1', label: 'SSH login', sub: 'username + password' },
        { from: 'r1', to: 'srv', label: 'Authentication START / CONTINUE', sub: 'TCP 49 · whole body encrypted' },
        { from: 'srv', to: 'r1', label: 'Authentication REPLY: PASS' },
        { from: 'r1', to: 'srv', label: 'Authorization REQUEST', sub: 'EXEC shell, then each command' },
        { from: 'srv', to: 'r1', label: 'Authorization RESPONSE', sub: 'e.g. privilege level 15', tone: 'accent' },
        { from: 'r1', to: 'srv', label: 'Accounting REQUEST', sub: 'start, stop, commands typed' },
        { from: 'srv', to: 'r1', label: 'Accounting REPLY' },
      ],
    },
    notes:
      "**TACACS+** (Terminal Access Controller Access-Control System Plus) was developed by Cisco and later documented in the informational RFC 8907. Despite the similar name it is not compatible with the old TACACS or XTACACS protocols. It uses **TCP port 49**, so the device knows immediately whether a connection to the server can be opened, and it **encrypts the entire body** of every packet; only the small header stays readable, so usernames, commands and replies are hidden from a sniffer. The key design choice is **separation**: authentication, authorization and accounting are independent exchanges, as the sequence shows. That separation enables the feature TACACS+ is famous for, **per-command authorization**. With command authorization configured, R1 asks the server before executing each command, so a junior engineer can be allowed `show` commands but denied `reload` or `configure terminal`, and accounting can log every command typed. Because of this granular control, TACACS+ is the preferred protocol for **device administration**: administrators logging in to routers, switches and firewalls.",
  },
  {
    kind: 'compare',
    title: 'What a packet sniffer can read',
    left: {
      heading: 'RADIUS (UDP 1812)',
      bullets: [
        'RADIUS header: readable',
        'User-Name: **readable**',
        'User-Password: hidden (MD5-based, shared secret)',
        'Authorization attributes (VLAN, ACL): readable',
      ],
    },
    right: {
      heading: 'TACACS+ (TCP 49)',
      bullets: [
        '12-byte header: readable',
        'Username and password: hidden',
        'Commands and authorization replies: hidden',
        '==Entire body encrypted==',
      ],
      tone: 'accent',
    },
    notes:
      "This slide is the heart of the most common RADIUS-versus-TACACS+ exam question: what does each protocol protect? RADIUS hides just one attribute, the **User-Password**, by combining it with the shared secret through an MD5-based calculation. Everything else in the packet, including the username, the NAS address and the authorization attributes returned in the Access-Accept, can be read by anyone capturing traffic between the switch and the server. TACACS+ obfuscates the **entire body** of every packet with the shared secret; only the 12-byte header (version, type, sequence number, flags, session ID and length) is visible. For device administration that difference matters: TACACS+ command authorization and accounting carry the exact commands administrators type, and nobody wants those in clear text on the wire. Remember the phrasing Cisco uses: RADIUS encrypts only the password, TACACS+ encrypts the entire payload. Neither protocol replaces a secure management network, and both depend on a strong shared secret configured identically on the client and the server.",
  },
  {
    kind: 'table',
    title: 'RADIUS vs TACACS+',
    columns: ['Feature', 'RADIUS', 'TACACS+'],
    rows: [
      ['Origin', 'Open standard (IETF RFC 2865)', 'Cisco (later RFC 8907)'],
      ['Transport', '**UDP**', '**TCP**'],
      ['Ports', '1812 auth · 1813 acct (legacy 1645/1646)', '**49**'],
      ['Encryption', 'Password only', '==Entire body (payload)=='],
      ['AAA functions', 'Authentication + authorization combined', 'All three separated'],
      ['Per-command authorization', 'No', 'Yes'],
      ['Typical use', '**Network access**: 802.1X, Wi-Fi, VPN', '**Device administration**: CLI logins'],
    ],
    caption: 'RADIUS lets users onto the network; TACACS+ lets admins onto the devices.',
    notes:
      "Memorize this table row by row, because every line has appeared as an exam option. A quick way to rebuild it under pressure: TACACS+ is the 'T' protocol, with **TCP**, the **total** payload encrypted and the three As kept apart. RADIUS is the lighter, open protocol, with **UDP**, only the password hidden and authentication plus authorization delivered in one reply. Port numbers are tested directly: **TCP 49** for TACACS+ and **UDP 1812 and 1813** for RADIUS, with 1645 and 1646 as the legacy pair. The use-case row is what scenario questions target. If a question mentions controlling or logging the commands administrators type on routers and switches, pick TACACS+. If it mentions users or devices joining the network, such as 802.1X on a switch port, WPA2 or WPA3-Enterprise Wi-Fi or a remote-access VPN, pick RADIUS. RADIUS can also authenticate CLI logins, but the exam wants the best fit. Because RADIUS returns its authorization attributes inside the Access-Accept, it cannot authorize each command separately.",
  },
  {
    kind: 'diagram',
    title: 'Cisco ISE: one server, two protocols',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'admin logins', x: 1.2, y: 0.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: '802.1X / MAB', x: 1.2, y: 2.5 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'WPA2-Enterprise', x: 1.2, y: 4.1 },
        { id: 'ise', icon: 'server', label: 'Cisco ISE', sub: 'RADIUS + TACACS+', x: 5.4, y: 2.5, tone: 'accent' },
        { id: 'ad', icon: 'database', label: 'Active Directory', sub: 'identity store', x: 8.8, y: 2.5 },
      ],
      links: [
        { from: 'r1', to: 'ise', label: 'TACACS+ TCP 49' },
        { from: 'sw1', to: 'ise', label: 'RADIUS UDP 1812/1813' },
        { from: 'wlc', to: 'ise', label: 'RADIUS' },
        { from: 'ise', to: 'ad', label: 'credential lookup', style: 'dashed' },
      ],
    },
    caption: 'Every AAA client must be registered on ISE with a matching shared secret.',
    notes:
      "**Cisco ISE (Identity Services Engine)** is Cisco's AAA and policy server, the successor to the older Cisco Secure ACS. One ISE deployment typically speaks **both** protocols: routers and switches send administrator logins over **TACACS+** (the Device Administration feature), while switches, WLCs and VPN headends send user and endpoint access requests over **RADIUS**. ISE usually does not store every password itself; it checks credentials against an **identity store** such as Microsoft Active Directory or an LDAP directory, then applies policy: which authorization profile, VLAN or downloadable ACL to return, or which command set an administrator may use. Beyond basic AAA, ISE adds profiling (recognizing a device as an IP phone or a printer), posture checks, guest portals and BYOD onboarding, which is awareness-level knowledge for the CCNA. Every network device must be registered on ISE as a network device with the same **shared secret** configured on the device; a mismatched key is one of the most common reasons AAA fails. Remember that the AAA client, not the user, talks to ISE.",
  },
  {
    kind: 'diagram',
    title: 'Method lists and the local fallback',
    diagram: {
      type: 'flow',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'n1', label: 'Login attempt', shape: 'pill', x: 1.2, y: 2.2 },
        { id: 'n2', label: 'Server answers?', sub: 'group tacacs+', shape: 'diamond', x: 4.2, y: 2.2 },
        { id: 'n3', label: 'Server decides', sub: 'PASS = in · FAIL = denied (final)', x: 7.9, y: 1 },
        { id: 'n4', label: 'Next method: local', sub: 'only on error or timeout', tone: 'accent', x: 7.9, y: 3.4 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3', label: 'yes' },
        { from: 'n2', to: 'n4', label: 'no', tone: 'accent' },
      ],
    },
    caption: '`aaa authentication login default group tacacs+ local`',
    notes:
      "A **method list** tells IOS which sources to try, in order, for one AAA service. In `aaa authentication login default group tacacs+ local`, the list is named `default` (so it applies to every line that has no named list), the first method is the `tacacs+` server group and the second is the `local` username database. The crucial rule: IOS moves to the next method **only if the current one returns an error**, meaning no server responds, the connection times out or no server in the group is reachable. If the server answers and says the password is wrong, that **FAIL is final**; IOS does not try the local database. This is exactly how it should be: the local account is a break-glass path for when ISE is down, not a second chance for a mistyped password. It also explains a classic outage: an engineer configures `group tacacs+` without `local`, the server becomes unreachable, and nobody can log in anymore. Always end administrator login lists with `local`, and keep one strong local account on every device.",
  },
  {
    kind: 'cli',
    title: 'Configuring TACACS+ login with local fallback',
    code: `R1(config)# username admin privilege 15 secret Br3akGlass9
R1(config)# aaa new-model
R1(config)# tacacs server ISE-TAC
R1(config-server-tacacs)# address ipv4 10.10.10.5
R1(config-server-tacacs)# key TacKey49
R1(config-server-tacacs)# exit
R1(config)# aaa authentication login default group tacacs+ local
R1(config)# aaa authorization exec default group tacacs+ local
R1(config)# aaa accounting commands 15 default start-stop group tacacs+
R1(config)# line vty 0 4
R1(config-line)# transport input ssh`,
    highlight: ['aaa new-model', 'group tacacs+ local'],
    caption: 'Create the local account first, then enable AAA.',
    notes:
      "Order matters when you type this. Create a **local privileged user first**: the moment you enter `aaa new-model`, IOS switches its lines to AAA, and with no login list defined the VTY lines immediately require a username from the local database. Next, define the server in the `tacacs server` submode, the modern syntax that replaces the older one-line `tacacs-server host` command. The `key` must match the shared secret configured for R1 on ISE. The `aaa authentication login default group tacacs+ local` line creates the login method list; because it is named `default`, it automatically applies to the console and all VTY lines, so no `login` command is needed under the lines. The authorization line asks the server whether the user may start an EXEC shell and at what privilege level, and the accounting line sends start and stop records for every level-15 command. The keyword `group tacacs+` means all servers defined as TACACS+; named groups can be built with `aaa group server tacacs+`. For the CCNA, recognize these commands and predict their effect.",
  },
  {
    kind: 'bullets',
    title: '802.1X: three roles',
    bullets: [
      '**Supplicant**: client software on the endpoint',
      '**Authenticator**: switch or WLC controlling the port or SSID',
      '**Authentication server**: RADIUS server such as ISE',
      'Supplicant ↔ authenticator: **EAPoL** (Layer 2, no IP yet)',
      'Authenticator ↔ server: **RADIUS** (EAP carried inside)',
      'Port stays **unauthorized** until the server sends Accept',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.2,
      nodes: [
        { id: 'pc', icon: 'laptop', label: 'Supplicant', sub: 'laptop', x: 1.2, y: 1.6 },
        { id: 'sw', icon: 'switch', label: 'Authenticator', sub: 'SW1', x: 5, y: 1.6, tone: 'accent' },
        { id: 'ise', icon: 'server', label: 'Auth server', sub: 'ISE (RADIUS)', x: 8.8, y: 1.6 },
      ],
      links: [
        { from: 'pc', to: 'sw', label: 'EAPoL', toLabel: 'Gi1/0/5' },
        { from: 'sw', to: 'ise', label: 'RADIUS UDP 1812' },
      ],
    },
    notes:
      "**IEEE 802.1X** is port-based network access control: a switch port or wireless association carries no user traffic until the endpoint proves its identity. There are exactly three roles, and the exam expects you to place real devices into them. The **supplicant** is the 802.1X client software on the endpoint, built into Windows, macOS, Linux, iOS and Android or provided by Cisco Secure Client. The **authenticator** is the network device that controls access: an access switch for wired ports, or a **WLC** (or an autonomous AP) for Wi-Fi. The **authentication server** is a RADIUS server, typically Cisco ISE, that validates the credentials. Notice that the supplicant never talks to the server directly: it has no IP address yet and the port blocks normal traffic. Instead, EAP messages travel as **EAPoL** frames to the switch, and the switch re-wraps them inside **RADIUS** packets to the server. The authenticator is a middleman that relays EAP without seeing the protected credentials inside, then enforces the server's decision by opening the port.",
  },
  {
    kind: 'diagram',
    title: '802.1X authentication step by step',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sup', label: 'Supplicant', icon: 'laptop' },
        { id: 'auth', label: 'Authenticator (SW1)', icon: 'switch' },
        { id: 'srv', label: 'ISE (RADIUS)', icon: 'server' },
      ],
      steps: [
        { from: 'sup', to: 'auth', label: 'EAPoL-Start (optional)', sub: 'port unauthorized: only EAPoL allowed' },
        { from: 'auth', to: 'sup', label: 'EAP-Request / Identity', sub: 'EAPoL' },
        { from: 'sup', to: 'auth', label: 'EAP-Response / Identity', sub: 'EAPoL' },
        { from: 'auth', to: 'srv', label: 'RADIUS Access-Request', sub: 'identity inside the EAP-Message attribute' },
        { note: 'EAP method runs (PEAP, EAP-TLS...): Access-Challenge relayed as EAPoL', tone: 'muted' },
        { from: 'srv', to: 'auth', label: 'RADIUS Access-Accept', sub: 'may include VLAN or dACL', tone: 'good' },
        { from: 'auth', to: 'sup', label: 'EAP-Success', sub: 'port authorized: traffic flows', tone: 'accent' },
      ],
    },
    caption: 'EAPoL on the access link, RADIUS toward the server.',
    notes:
      "Walk through the sequence from the top. When the link comes up, the port is in the **unauthorized** state and forwards only EAPoL frames (plus CDP and STP). Either side can start: the supplicant may send an **EAPoL-Start**, or the switch sends an **EAP-Request/Identity** on its own. The supplicant answers with an **EAP-Response/Identity** carrying the user or machine name. From here the switch acts as a translator: it copies each EAP message into the EAP-Message attribute of a RADIUS **Access-Request** to the server, and relays every **Access-Challenge** back to the supplicant as EAPoL. This back-and-forth carries the chosen EAP method, for example PEAP with a password or EAP-TLS with certificates. When the server is satisfied, it sends **Access-Accept**, optionally with authorization attributes such as a VLAN number or a downloadable ACL. The switch then sends **EAP-Success** to the supplicant and moves the port to the **authorized** state. Wrong credentials produce Access-Reject and EAP-Failure, and the port stays unauthorized unless a restricted VLAN is configured.",
  },
  {
    kind: 'diagram',
    title: 'EAP travels in two envelopes',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Supplicant ↔ Authenticator',
          layers: [
            { label: 'EAP method', sub: 'PEAP, EAP-TLS, EAP-FAST' },
            { label: 'EAP', sub: 'Request / Response / Success' },
            { label: 'EAPoL', sub: 'EtherType 0x888E · no IP needed', tone: 'accent', span: 3 },
            { label: 'Ethernet or 802.11', sub: 'Layer 2 frame' },
          ],
        },
        {
          title: 'Authenticator ↔ Server',
          layers: [
            { label: 'EAP method', sub: 'same end-to-end exchange' },
            { label: 'EAP', sub: 'in the EAP-Message attribute' },
            { label: 'RADIUS', sub: 'Access-Request / Challenge / Accept', tone: 'accent' },
            { label: 'UDP 1812' },
            { label: 'IP', sub: 'switch to ISE' },
            { label: 'Ethernet' },
          ],
        },
      ],
    },
    notes:
      "The same EAP conversation between the laptop and ISE is carried in two different envelopes. On the access link, EAP rides directly inside Layer 2 frames called **EAPoL** (EAP over LAN), identified by EtherType **0x888E**. There is no IP, no UDP and no routing, and that is essential: the supplicant cannot get an address from DHCP until the port is authorized. On Wi-Fi the same EAPoL frames travel over 802.11 and, with lightweight APs, inside CAPWAP to the WLC. Between the authenticator and the server, the switch has a routed path, so each EAP message is placed inside a **RADIUS** attribute (EAP-Message) and sent to ISE on UDP port 1812. The inner **EAP method** (PEAP, EAP-TLS or EAP-FAST) runs end to end between supplicant and server; the switch just moves it. Exam questions test this split directly: which protocol does the supplicant use to communicate with the authenticator? The answer is EAPoL, never RADIUS. Also note that TACACS+ plays no part in 802.1X, because it cannot carry EAP.",
  },
  {
    kind: 'cli',
    title: 'Configuring RADIUS and 802.1X on a switch',
    code: `SW1(config)# aaa new-model
SW1(config)# radius server ISE-RAD
SW1(config-radius-server)# address ipv4 10.10.10.5 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key R@diusKey
SW1(config-radius-server)# exit
SW1(config)# aaa authentication dot1x default group radius
SW1(config)# aaa authorization network default group radius
SW1(config)# dot1x system-auth-control
SW1(config)# interface GigabitEthernet1/0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# authentication port-control auto
SW1(config-if)# dot1x pae authenticator`,
    highlight: ['dot1x system-auth-control', 'authentication port-control auto'],
    caption: 'Awareness level: know what each line does, not every option.',
    notes:
      "This is the classic IOS 802.1X configuration on a Catalyst access switch. `aaa new-model` enables AAA, and the `radius server` submode defines ISE with the standard ports; specifying `auth-port 1812 acct-port 1813` matters because IOS otherwise uses the legacy defaults 1645 and 1646. `aaa authentication dot1x default group radius` sends 802.1X credentials to the RADIUS servers, and `aaa authorization network default group radius` lets the switch apply authorization results such as a VLAN assigned by ISE. `dot1x system-auth-control` is the global on switch: without it, no port runs 802.1X. On the interface, the port must be a static access port. `authentication port-control auto` enables 802.1X so the port starts unauthorized, and `dot1x pae authenticator` makes the switch act as the authenticator on that port. The other port-control values are `force-authorized` (the default: no authentication, port always open) and `force-unauthorized` (the port never opens). Newer IOS XE releases can express the same policy with IBNS 2.0 policy maps, which are beyond the CCNA.",
  },
  {
    kind: 'table',
    title: '802.1X, MAB and web authentication',
    columns: ['Method', 'Credential', 'Needs a supplicant?', 'Typical endpoints'],
    rows: [
      ['**802.1X**', 'Password or certificate via EAP', 'Yes', 'Corporate laptops, smartphones'],
      ['**MAB**', 'Endpoint **MAC address** sent to RADIUS', 'No', 'Printers, cameras, IoT'],
      ['**Web authentication**', 'Credentials typed in a browser portal', 'No (browser only)', 'Guests, contractors'],
    ],
    caption: 'A common port policy tries 802.1X first, then falls back to MAB.',
    notes:
      "802.1X is the strongest option, but many devices such as printers, badge readers, cameras and older IP phones have no supplicant. **MAC Authentication Bypass (MAB)** handles them: when 802.1X gets no response, the switch learns the device's MAC address from its first frame and sends it to the RADIUS server as the identity. ISE checks the MAC against an endpoint list, often built by profiling, and returns Accept with a suitable VLAN or ACL. MAB is weaker because MAC addresses are easy to spoof, so it is paired with restrictive authorization. **Web authentication** (WebAuth) redirects the user's browser to a login page, either local on the switch or WLC or centrally hosted on ISE, and is typical for guest access, often on a separate guest SSID. A common port configuration tries 802.1X first and falls back to MAB when no supplicant answers. For the CCNA, know what each method uses as the credential and which endpoints it suits; the detailed timers and ordering commands are beyond the exam.",
  },
  {
    kind: 'steps',
    title: 'Verifying and troubleshooting AAA',
    steps: [
      { title: 'Check reachability', text: 'Ping the server, sourced from the address ISE has registered' },
      { title: 'Check the shared secret', text: 'Device key must match its network-device entry on ISE' },
      { title: 'Check the method list', text: '`show running-config | section aaa`: right order, `local` last?' },
      { title: 'Watch the exchange', text: '`debug aaa authentication`, `debug tacacs`, `debug radius`' },
      { title: 'Check 802.1X ports', text: '`show authentication sessions`: method and status per port' },
      { title: 'Read the server logs', text: 'ISE live logs name the exact reason for a reject' },
    ],
    notes:
      "When AAA fails, work from the network up to the policy. First, **reachability**: can the device ping ISE, and does it source its requests from the IP address that ISE has registered for it? If not, set the source with `ip tacacs source-interface` or `ip radius source-interface`. Second, the **shared secret**: a mismatch breaks the exchange, and because IOS usually treats a broken exchange as an error rather than a reject, it may quietly fall back to the local database. Logins still work and nobody notices that ISE is being bypassed. Third, the **method list** itself: `show running-config | section aaa` reveals a missing `local` keyword or a named list applied to the wrong lines. Fourth, debugs such as `debug aaa authentication` together with `debug tacacs` or `debug radius` show the exchange in real time; use them carefully on production devices. For 802.1X, `show authentication sessions` lists each port's MAC address, method (dot1x or mab) and status. Finally, ISE's live logs state the exact failure reason, which is often faster than any debug.",
  },
  {
    kind: 'table',
    title: 'Numbers and keywords to memorize',
    columns: ['Item', 'Value'],
    rows: [
      ['RADIUS authentication/authorization', 'UDP **1812** (legacy 1645)'],
      ['RADIUS accounting', 'UDP **1813** (legacy 1646)'],
      ['TACACS+', 'TCP **49**'],
      ['EAPoL', 'EtherType `0x888E` (not carried in IP)'],
      ['RADIUS replies to a request', 'Access-Accept, Access-Reject, Access-Challenge'],
      ['Enable AAA on IOS', '`aaa new-model`'],
      ['Enable 802.1X globally', '`dot1x system-auth-control`'],
    ],
    notes:
      "Use this table as a last-minute review before the exam. The port numbers are the most frequently tested facts in this topic, and Cisco likes to mix them up in distractors, for example offering TACACS+ over UDP 49 or RADIUS over TCP 1812. Remember that TACACS+ is the only one of the two that uses TCP. **EAPoL** has no port number at all because it is not carried in IP; it is identified by EtherType **0x888E** in the Ethernet header, which is exactly why a supplicant can authenticate before it has an IP address. The RADIUS message names matter too: an Access-Request is answered by Access-Accept, Access-Reject or Access-Challenge, and accounting uses its own Accounting-Request and Accounting-Response pair on UDP 1813. Finally, two IOS commands act as master switches: `aaa new-model` turns on AAA method lists for the whole device, and `dot1x system-auth-control` globally enables 802.1X on a Catalyst switch. Without them, the rest of the configuration has no effect.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: AAA and 802.1X',
    body: 'The local database is a fallback for an **unreachable** server, never a second chance after a server **reject**.',
    bullets: [
      'RADIUS = **UDP** 1812/1813; TACACS+ = **TCP 49**',
      'RADIUS encrypts **only the password**; TACACS+ the **whole body**',
      'Per-command authorization or command logging → **TACACS+**',
      'Supplicant ↔ authenticator = **EAPoL**, never RADIUS',
      'Lightweight APs in local mode: the **WLC** is the authenticator',
      'Authorization always follows authentication',
    ],
    notes:
      "These are the traps that catch well-prepared candidates. The first is the fallback rule: `local` after `group tacacs+` is consulted only when no server answers. A server reject is final, and a list with no `local` at all locks everyone out when the server is down. The second family is protocol facts that are easy to swap under time pressure: transport, port numbers and encryption scope. The third is scenario matching: whenever a stem mentions controlling or logging individual commands typed by administrators, the answer is TACACS+; whenever it mentions 802.1X, enterprise Wi-Fi authentication or VPN users, the answer is RADIUS. In 802.1X questions, watch the direction of each protocol: the supplicant speaks EAPoL only to the authenticator, and only the authenticator speaks RADIUS to the server. With lightweight APs in local mode, the WLC, not the AP, is the authenticator, because the AP simply tunnels the EAPoL frames to it. And remember the order of the As: a user cannot be authorized before being authenticated, and accounting records what happens afterward.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'AAA: **who** (authentication), **what** (authorization), **what was done** (accounting)',
      'RADIUS: open, UDP 1812/1813, password-only encryption, network access',
      'TACACS+: Cisco, TCP 49, full-body encryption, separate AAA, device admin',
      'Cisco ISE runs both; keep a **local** break-glass account',
      '`aaa new-model` + method lists such as `group tacacs+ local`',
      '802.1X: supplicant → authenticator (EAPoL) → RADIUS server',
      'MAB for devices without supplicants; WebAuth for guests',
    ],
    notes:
      "AAA separates three questions (who you are, what you may do and what you did) and answers them from a central server instead of hundreds of local databases. RADIUS and TACACS+ are the two protocols between the network device and that server. RADIUS is the open, UDP-based protocol that hides only the password, bundles authentication with authorization and dominates network access. TACACS+ is the Cisco-developed TCP 49 protocol that encrypts the whole body, separates the three functions and dominates device administration. Cisco ISE runs both. On IOS, `aaa new-model` enables method lists, and a list such as `group tacacs+ local` gives central control plus a break-glass local account that is used only when the servers are unreachable. 802.1X applies the same idea to switch ports and WLANs: the supplicant talks EAPoL to the authenticator, which relays everything to a RADIUS server and opens the port only after an Access-Accept. MAB and web authentication cover devices and guests without a supplicant. These ideas return when you secure management access and wireless networks.",
  },
];

export default slides;
