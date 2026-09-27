import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'SSH & Remote Device Access',
    subtitle: 'Replacing Telnet with SSH: prerequisites, VTY hardening, verification and switch management',
    notes:
      "Most of the time, network engineers configure devices over the network rather than with a console cable. That convenience is also an attack surface: whoever can open a management session can reconfigure the network. In this lesson you will see why **Telnet**, which sends everything in cleartext over TCP 23, has been replaced by **SSH**, which encrypts the session over TCP 22. You will learn the exact configuration sequence for SSH on Cisco IOS — hostname, domain name, RSA keys, a local user, `ip ssh version 2` — and how to harden the **VTY lines** with `login local`, `transport input ssh`, `exec-timeout` and `access-class`. You will verify the result with `show ip ssh`, `show ssh` and `show users`, connect with `ssh -l`, and learn what a Layer 2 switch needs before it can be managed remotely at all: an SVI address and a default gateway. Remote access with SSH is v1.1 topic 4.8 and part of domain 4 of the v2.0 blueprint; the content is the same for both versions, and the configuration order is a favorite drag-and-drop item.",
  },
  {
    kind: 'compare',
    title: 'Telnet vs SSH',
    left: {
      heading: 'Telnet',
      tone: 'bad',
      bullets: [
        'TCP port **23**',
        'Everything in **cleartext**, passwords included',
        "No proof of the server's identity",
        'Acceptable only in isolated labs',
      ],
    },
    right: {
      heading: 'SSH',
      tone: 'good',
      bullets: [
        'TCP port **22**',
        'Encrypted, integrity-protected session',
        'Server proves its identity with a host key',
        'Use **SSHv2**; SSHv1 has known weaknesses',
      ],
    },
    notes:
      "Telnet and SSH give you the same thing — a remote command-line session on a VTY line — but they protect it very differently. **Telnet** (TCP port 23) was designed for trusted networks: every character, including the username and password, crosses the network in cleartext, so anyone who can capture traffic on the path sees the credentials and every command. It also has no way to prove the server's identity. **SSH**, the Secure Shell (TCP port 22), wraps the session in encryption and integrity protection, authenticates the server with its host key before any password is sent, and then authenticates the user. There are two protocol versions. **SSHv1** has known cryptographic weaknesses and should be disabled; **SSHv2** is the current standard, enforced with `ip ssh version 2`. On Cisco devices, SSH needs an RSA key pair, which is why its configuration has more steps than Telnet's. Exam questions ask for the port numbers, which protocol is secure and why, and which command limits a device to SSHv2. Telnet remains handy as a quick TCP port tester — for example, telnet to port 25 to see whether a mail server answers — but never as a management protocol on production networks.",
  },
  {
    kind: 'diagram',
    title: 'What an eavesdropper sees',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'admin', label: 'Admin PC', icon: 'pc' },
        { id: 'r1', label: 'R1', icon: 'router' },
      ],
      steps: [
        { from: 'admin', to: 'r1', label: 'Telnet TCP 23: Username: admin', sub: 'cleartext', tone: 'bad' },
        { from: 'admin', to: 'r1', label: 'Password and every command', sub: 'cleartext — readable in a capture', tone: 'bad' },
        { note: 'A packet capture reveals the credentials and the whole session', tone: 'bad' },
        { from: 'admin', to: 'r1', label: 'SSH TCP 22: version and key exchange', tone: 'accent' },
        { from: 'admin', to: 'r1', label: 'Username, password, commands', sub: 'encrypted', tone: 'good' },
        { note: 'A packet capture shows only encrypted data', tone: 'good' },
      ],
    },
    caption: 'SSH builds the encrypted channel before any credentials are sent.',
    notes:
      "This slide shows the practical difference. With Telnet, the administrator's username and password travel as ordinary TCP payload on port 23. Anyone positioned on the path — a compromised PC on the same VLAN using ARP spoofing, a mirrored switch port, a tap on a WAN link — can capture them with a free protocol analyzer and reuse them later. Every command and every line of output, including configurations that contain other passwords and SNMP communities, is exposed as well. With SSH, the TCP connection to port 22 is followed by a version exchange and a **key exchange** that produces the session keys; the server also presents its host key so that the client can detect an impostor. Only after that encrypted channel exists does the user send a username and password, so a capture shows nothing useful. The first time a client connects, it asks the user to accept the server's key fingerprint; later connections warn loudly if the key changes, which could indicate a man-in-the-middle. This is why security policies — and the exam — treat Telnet as unacceptable for managing production devices. SSH protects the session in transit, but it does not make weak passwords strong, so combine it with good credentials and source restrictions.",
  },
  {
    kind: 'bullets',
    title: 'Remote access building blocks',
    bullets: [
      'Reachability: a router interface, or a switch **SVI + default gateway**',
      '**VTY lines** (`line vty 0 15`) accept the sessions',
      'Authentication: `login local` with `username … secret`, or AAA',
      'Protocol: `transport input ssh`',
      'Limits: `access-class` and `exec-timeout`',
      'Privileged access: `enable secret` or a privilege 15 user',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'admin', icon: 'pc', label: 'Admin PC', sub: '10.1.99.25', x: 1.1, y: 1.4 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'VTY 0-15', x: 4.3, y: 2.8, tone: 'accent' },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'SVI 10.1.99.11', x: 7.6, y: 1.4 },
        { id: 'aaa', icon: 'server', label: 'AAA server', sub: 'optional', x: 7.6, y: 4.2, tone: 'muted' },
      ],
      links: [
        { from: 'admin', to: 'r1', label: 'SSH TCP 22', tone: 'accent' },
        { from: 'r1', to: 'sw1', label: 'SSH' },
        { from: 'r1', to: 'aaa', label: 'RADIUS / TACACS+', style: 'dashed', tone: 'muted' },
      ],
    },
    notes:
      "Remote management depends on a chain of pieces, and a missing link anywhere breaks it. First, **IP reachability**: the device needs an address the administrator can reach — any interface address on a router, or an SVI on a Layer 2 switch, which also needs a default gateway to talk to other subnets. Second, the **VTY lines**: virtual terminal lines are the logical ports that accept Telnet and SSH sessions; routers and switches commonly have 16 of them, numbered 0 to 15, so up to 16 remote sessions can be open at once. Third, **authentication**: `login local` checks a username and password against local `username … secret` entries, while larger networks use AAA with RADIUS or TACACS+ servers, shown dashed here. Fourth, the **protocol**: `transport input ssh` makes the lines refuse Telnet. Fifth, **limits**: `access-class` admits only management subnets and `exec-timeout` closes idle sessions. Finally, **privileged access**: remote users need an `enable secret`, or an account with privilege 15, to reach privileged EXEC mode. Keep this chain in mind for troubleshooting: when remote access fails, walk it from reachability to privilege level.",
  },
  {
    kind: 'steps',
    title: 'SSH configuration, step by step',
    steps: [
      { title: 'Set a hostname', text: '`hostname R1` — keys cannot be generated while the name is still Router.' },
      { title: 'Set a domain name', text: '`ip domain-name corp.example.com`' },
      { title: 'Generate the RSA key pair', text: '`crypto key generate rsa modulus 2048` (at least 768 bits for SSHv2) — SSH is now enabled.' },
      { title: 'Create a local user', text: '`username admin secret …`' },
      { title: 'Allow SSHv2 only', text: '`ip ssh version 2`' },
      { title: 'Secure the VTY lines', text: '`line vty 0 15` → `login local`, `transport input ssh`, `exec-timeout`, `access-class`' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'h', label: 'hostname R1', shape: 'pill' },
        { id: 'd', label: 'ip domain-name', sub: 'corp.example.com' },
        { id: 'k', label: 'RSA key pair', sub: 'R1.corp.example.com', tone: 'accent' },
        { id: 's', label: 'SSH enabled', shape: 'round', tone: 'good' },
      ],
    },
    notes:
      "Memorize this sequence — it is the most tested part of the topic and a classic drag-and-drop. Steps one and two exist because of step three: IOS names the RSA key pair **hostname.domain-name**, so it refuses to generate keys while the hostname is still the default Router or while no domain name is configured. Step three, `crypto key generate rsa`, creates the key pair and **enables SSH** immediately; choose a modulus of 2048 bits, and never less than 768 bits, the minimum for SSHv2. Step four creates the account that `login local` will check; use `secret` so that only a hash of the password is stored. Step five, `ip ssh version 2`, disables the weaker SSHv1 — without it the server runs version 1.99, meaning it accepts both. Step six moves to the VTY lines: `login local` for username-based authentication, `transport input ssh` to refuse Telnet, `exec-timeout` to close idle sessions and `access-class` to limit sources. Also configure `enable secret` so that remote users can reach privileged EXEC mode. Optional tuning commands are `ip ssh time-out` (default 120 seconds) and `ip ssh authentication-retries` (default 3).",
  },
  {
    kind: 'cli',
    title: 'Building it on R1',
    code: `Router# show ip ssh
SSH Disabled - version 1.99
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).
<output omitted>
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# crypto key generate rsa modulus 2048
% Please define a hostname other than Router.
Router(config)# hostname R1
R1(config)# crypto key generate rsa modulus 2048
% Please define a domain-name first.
R1(config)# ip domain-name corp.example.com
R1(config)# crypto key generate rsa modulus 2048
The name for the keys will be: R1.corp.example.com

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 2 seconds)
%SSH-5-ENABLED: SSH 1.99 has been enabled
R1(config)# username admin secret N3tAdm1n2026
R1(config)# ip ssh version 2`,
    highlight: ['% Please define a hostname other than Router.', '% Please define a domain-name first.', 'R1.corp.example.com', 'SSH 1.99 has been enabled'],
    caption: 'IOS enforces the order: hostname, then domain name, then keys.',
    notes:
      "This transcript walks through the sequence on a fresh router and shows the two errors that enforce it. Before any configuration, `show ip ssh` reports SSH as disabled and asks for RSA keys of at least 768 bits for SSHv2. The first key-generation attempt fails because the hostname is still Router; after `hostname R1`, the second attempt fails because no domain name exists. With `ip domain-name corp.example.com` in place, the keys are generated under the name **R1.corp.example.com**, and IOS immediately logs `%SSH-5-ENABLED: SSH 1.99 has been enabled` — version 1.99 means that both SSHv1 and SSHv2 are accepted. The username is created with `secret`, so only a hash is stored. Finally, `ip ssh version 2` restricts the server to SSHv2. The key pair does not appear in `show running-config`; `show crypto key mypubkey rsa` displays the public key, and saving the configuration keeps the keys across a reload. If you ever need to disable SSH completely, `crypto key zeroize rsa` deletes the keys. On IOS XE the domain command is displayed in the running-config as `ip domain name`; both spellings are accepted.",
  },
  {
    kind: 'cli',
    title: 'Hardening the VTY lines',
    code: `R1(config)# enable secret N3tEnable2026
R1(config)# ip access-list standard MGMT
R1(config-std-nacl)# permit 10.1.99.0 0.0.0.255
R1(config-std-nacl)# exit
R1(config)# line vty 0 15
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# exec-timeout 5 0
R1(config-line)# access-class MGMT in
R1(config-line)# end
R1# show running-config | section line vty
line vty 0 4
 access-class MGMT in
 exec-timeout 5 0
 login local
 transport input ssh
line vty 5 15
 access-class MGMT in
 exec-timeout 5 0
 login local
 transport input ssh`,
    highlight: ['login local', 'transport input ssh', 'exec-timeout 5 0', 'access-class MGMT in'],
    caption: 'IOS stores `line vty 0 15` as two ranges, 0 4 and 5 15 — both carry the same settings.',
    notes:
      "With SSH enabled, the VTY lines decide who may use it and how. `enable secret` comes first, because remote users otherwise cannot enter privileged EXEC mode. The standard ACL MGMT permits only the management subnet. Under `line vty 0 15` — always configure all 16 lines, because a session can land on any free line — `login local` tells the lines to authenticate against the local username database, and `transport input ssh` makes them refuse Telnet: a Telnet attempt now gets Connection refused. `exec-timeout 5 0` disconnects a session after five minutes and zero seconds of inactivity, so an administrator who walks away does not leave an open, authenticated session; the default is 10 minutes, and `exec-timeout 0 0` disables the timer, which auditors flag. `access-class MGMT in` checks the source address of every incoming session against MGMT before the login prompt, so hosts outside 10.1.99.0/24 are refused no matter which router address they target. The running-config shows a detail that surprises people: IOS stores the range as `line vty 0 4` and `line vty 5 15`, and both carry the same commands. Protect the console too, with `login local` and an `exec-timeout`.",
  },
  {
    kind: 'table',
    title: 'VTY line commands at a glance',
    columns: ['Command (line vty)', 'Effect', 'Notes'],
    rows: [
      ['`login`', 'Prompts for the **line password**', 'Needs `password …` on the line; no username'],
      ['`login local`', 'Prompts for **username and password**', 'Checks `username … secret …` entries'],
      ['`transport input ssh`', 'Accepts **SSH only**', 'Other options: `telnet`, `ssh telnet`, `all`, `none`'],
      ['`exec-timeout 5 0`', 'Disconnects after 5 min 0 s idle', 'Default 10 minutes; `0 0` = never'],
      ['`access-class MGMT in`', 'Accepts sessions only from sources MGMT permits', '`out` limits onward sessions from the device'],
      ['`line vty 0 15`', 'Selects all 16 VTY lines', 'Lines left unconfigured keep their old settings'],
    ],
    notes:
      "This reference table collects the line commands that exam questions mix up. `login` and `login local` are the two local authentication modes: `login` asks only for the password configured on the line with `password`, so everyone shares one secret and nothing records who logged in, while `login local` asks for a username and checks the local database, giving individual accountability — and SSH needs username-based authentication. `transport input` chooses which protocols the lines accept: `ssh` alone is the hardened choice, `ssh telnet` accepts both, `all` accepts every supported protocol and `none` blocks remote access through those lines. `exec-timeout` takes minutes and then seconds; the default is 10 minutes, and `0 0` means never, which leaves forgotten sessions open. `access-class` with `in` filters incoming sessions by source address, whereas with `out` it restricts where logged-in users can connect onward. Finally, remember `line vty 0 15`: configuring only `line vty 0 4` leaves lines 5 to 15 with their previous, possibly open settings, and an attacker who opens several sessions at once reaches them. Many exam distractors apply the right command to only some of the lines.",
  },
  {
    kind: 'table',
    title: 'SSH versions and RSA keys',
    columns: ['Situation', 'show ip ssh reports', 'Clients can use'],
    rows: [
      ['No RSA key pair', '`SSH Disabled - version 1.99`', 'Nothing — SSH sessions are refused'],
      ['Key modulus below 768 bits', '`SSH Enabled - version 1.5`', 'SSHv1 only'],
      ['Key of 768 bits or more (default settings)', '`SSH Enabled - version 1.99`', 'SSHv1 and SSHv2'],
      ['Key of 768+ bits and `ip ssh version 2`', '`SSH Enabled - version 2.0`', '==SSHv2 only=='],
    ],
    caption: 'Best practice: 2048-bit keys plus `ip ssh version 2`.',
    notes:
      "The version string in `show ip ssh` follows directly from the keys and one command, so learn to read it. With **no key pair**, the server is disabled — IOS even prints a reminder to create RSA keys of at least 768 bits for SSHv2 — and clients get Connection refused. A key smaller than **768 bits** allows only the old SSHv1, shown as version 1.5. Once a key of 768 bits or more exists, the server runs **1.99**, a compatibility value meaning that both SSHv1 and SSHv2 clients are accepted. Adding `ip ssh version 2` removes SSHv1, and the output reads **2.0**. Modern practice is a 2048-bit modulus, which current SSH clients expect; generating it can take a few seconds on older hardware. Two related facts: `crypto key zeroize rsa` removes the keys and therefore disables SSH, and regenerating keys changes the host key fingerprint, so clients that saved the old key will warn about a possible man-in-the-middle until the new key is accepted. On the exam, 1.99 is the classic trap: it does not mean SSHv2 only.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show ip ssh and show ssh',
    code: `R1# show ip ssh
SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
<output omitted>
R1# show ssh
Connection Version Mode Encryption  Hmac         State                 Username
0          2.0     IN   aes256-ctr  hmac-sha2-256 Session started       admin
0          2.0     OUT  aes256-ctr  hmac-sha2-256 Session started       admin
%No SSHv1 server connections running.`,
    highlight: ['SSH Enabled - version 2.0', 'Authentication timeout: 120 secs; Authentication retries: 3', 'Session started'],
    caption: '`show ip ssh`: server status and version. `show ssh`: the sessions connected right now.',
    notes:
      "`show ip ssh` answers the configuration questions: is the SSH server running, and which version? **SSH Enabled - version 2.0** means keys exist and `ip ssh version 2` is configured; **version 1.99** means both versions are accepted; **SSH Disabled** means there are no RSA keys. The same output shows the negotiation limits — an authentication timeout of **120 seconds** and **3** authentication retries by default, changed with `ip ssh time-out` and `ip ssh authentication-retries` — followed by the supported methods and the public key. `show ssh` answers the operational question: who is connected right now? Each session appears twice, once per direction (IN and OUT), with the protocol version, the negotiated encryption and HMAC algorithms, the state and the username. The last line confirms that no SSHv1 sessions exist. Together with `show users`, which lists every console and VTY session with its source address, these commands verify both the configuration and the live sessions. On the exam, match each command to its purpose: `show ip ssh` for status and version, `show ssh` for active SSH sessions and `show users` for everyone logged in.",
  },
  {
    kind: 'diagram',
    title: 'Managing a Layer 2 switch remotely',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'admin', icon: 'pc', label: 'Admin PC', sub: '10.1.10.25/24', x: 1.1, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', x: 4.1, y: 2.5 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Vlan99 10.1.99.11/24', x: 7.4, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'admin', to: 'r1', toLabel: 'G0/0/1 10.1.10.1' },
        { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0 10.1.99.1', toLabel: 'Gi0/1', label: 'VLAN 99' },
      ],
      annotations: [
        { x: 7.4, y: 4.3, text: 'ip default-gateway 10.1.99.1', tone: 'accent' },
        { x: 2.6, y: 0.8, text: 'Admin subnet 10.1.10.0/24', tone: 'muted' },
      ],
    },
    bullets: [
      'A Layer 2 switch needs an **SVI** with an IP address',
      'It needs `ip default-gateway` to answer other subnets',
      'The SVI is up only if its VLAN is active on an up port',
    ],
    notes:
      "A router can be managed through any of its interface addresses, but a Layer 2 switch forwards frames and has no routed interfaces. To be reachable for SSH, SNMP, syslog or NTP it needs a **switch virtual interface (SVI)** — `interface vlan 99` with an IP address — in a management VLAN. The SVI comes up only when its VLAN exists and is active on at least one up port, such as an access port or a trunk that carries VLAN 99; otherwise it stays up/down. Because the switch is not routing, it behaves like a host: to reply to an administrator in another subnet, such as 10.1.10.25 here, it needs a **default gateway** — `ip default-gateway 10.1.99.1`, the router interface in the management subnet. Without it, hosts inside VLAN 99 can connect but everyone else times out, a favorite exam scenario. A Layer 3 switch with `ip routing` enabled ignores `ip default-gateway` and uses its routing table instead, so it needs a default route. Best practice is a dedicated management VLAN — not VLAN 1 — reachable only from the management subnet, combined with the same SSH and VTY hardening used on routers.",
  },
  {
    kind: 'cli',
    title: 'Configuring the management SVI',
    code: `SW1(config)# vlan 99
SW1(config-vlan)# name MGMT
SW1(config-vlan)# exit
SW1(config)# interface vlan 99
SW1(config-if)# ip address 10.1.99.11 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 10.1.99.1
SW1(config)# end
SW1# show ip interface brief | include Vlan99
Vlan99                 10.1.99.11      YES manual up                    up
SW1# show running-config | include default-gateway
ip default-gateway 10.1.99.1`,
    highlight: ['interface vlan 99', 'ip default-gateway 10.1.99.1', 'manual up                    up'],
    caption: 'Then configure SSH exactly as on a router: hostname, domain, keys, user, version 2, VTY lines.',
    notes:
      "The switch-side configuration has four parts. First, the management VLAN must exist — `vlan 99` with a descriptive name — and must be carried on the trunk toward R1, or the SVI never comes up. Second, `interface vlan 99` receives the IP address and a `no shutdown`, because a newly created SVI starts administratively down. Third, `ip default-gateway 10.1.99.1` points at R1's address in VLAN 99 so that the switch can answer other subnets. Fourth, not shown here, the SSH configuration is identical to a router's: hostname, domain name, RSA keys, a local user, `ip ssh version 2` and hardened VTY lines. The verification lines confirm that the SVI is up/up with a manually configured address and that the gateway is in the running-config. If the SVI shows up/down, check that VLAN 99 exists and is active on an up port or allowed on an up trunk; if it shows administratively down, the `no shutdown` is missing. On a Layer 3 switch running `ip routing`, use `ip route 0.0.0.0 0.0.0.0 10.1.99.1` instead of `ip default-gateway`. Finally, keep management traffic out of VLAN 1 and never mix it with user traffic.",
  },
  {
    kind: 'cli',
    title: 'Connecting and checking who is logged in',
    code: `R2# ssh -l admin 10.1.99.11
Password:

SW1> enable
Password:
SW1# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:41:07
*  1 vty 0     admin      idle                 00:00:00 10.1.12.2

  Interface    User               Mode         Idle     Peer Address

SW1# show ssh
Connection Version Mode Encryption  Hmac         State                 Username
0          2.0     IN   aes128-ctr  hmac-sha1    Session started       admin
0          2.0     OUT  aes128-ctr  hmac-sha1    Session started       admin
%No SSHv1 server connections running.`,
    highlight: ['ssh -l admin 10.1.99.11', '*  1 vty 0     admin', '10.1.12.2'],
    caption: 'The asterisk marks your own session; Location shows where each session comes from.',
    notes:
      "Connecting from an IOS device uses `ssh -l username address`: `-l` supplies the login name, and IOS then prompts for the password over the encrypted channel. From a PC or Linux host the usual form is `ssh admin@10.1.99.11`, and the first connection asks you to accept the switch's host key fingerprint. After logging in, the user lands in user EXEC mode (SW1>) unless the account has privilege 15, so `enable` prompts for the enable secret. `show users` lists everyone connected: the console line, con 0, is idle with no user, and vty 0 carries user admin from **10.1.12.2**, R2's address. The **asterisk** marks the line running the command — your own session. The Location column is the quickest way to see where a session comes from, and `clear line vty 0` would disconnect it. `show ssh` confirms that the session is SSH version 2.0 with the negotiated cipher and HMAC; a Telnet session would appear in `show users` but not in `show ssh`. To leave, type `exit` or `logout`. Remember the IOS client syntax for the exam: `ssh -l admin 10.1.99.11`, not `ssh admin 10.1.99.11`.",
  },
  {
    kind: 'cli',
    title: 'Error messages and what they mean',
    code: `R2# telnet 10.1.12.1
Trying 10.1.12.1 ...
% Connection refused by remote host
R2# ssh -l admin 10.1.23.3
% Connection refused by remote host
R2# telnet 10.1.24.4
Trying 10.1.24.4 ... Open


Password required, but none set

[Connection to 10.1.24.4 closed by foreign host]
R2# ssh -l admin 10.1.25.5
Password:

R5> enable
% No password set`,
    highlight: ['% Connection refused by remote host', 'Password required, but none set', '% No password set'],
    caption: 'R1 accepts SSH only; R3 has no RSA keys; R4 has login without a password; R5 has no enable secret.',
    notes:
      "Recognizing the error text tells you which link of the chain is broken. **Connection refused by remote host** appears immediately when the target actively rejects the TCP session: R1 refuses Telnet because its lines have `transport input ssh`, and R3 refuses SSH because it has no RSA keys, so its SSH server is disabled. An `access-class` that denies your source produces the same message, so check both. **Password required, but none set** means the session reached a line configured with `login` but no `password`; IOS will not allow an unauthenticated session, so it disconnects. With `login local`, wrong credentials — or a missing local account — produce **% Login invalid** instead. **% No password set** at the `enable` prompt means the device has no enable secret, so remote users can never reach privileged EXEC mode; the fix is `enable secret`, or a privilege 15 account. A connection attempt that simply hangs and times out points to reachability rather than configuration: routing, a missing default gateway on a switch, or an interface ACL dropping TCP 22. Exam troubleshooting items quote these messages directly, so link each one to its cause.",
  },
  {
    kind: 'table',
    title: 'Troubleshooting remote access',
    columns: ['Symptom', 'Likely cause', 'Fix'],
    rows: [
      ['Telnet: Connection refused', '`transport input ssh`, or access-class', 'Use SSH; check the ACL'],
      ['SSH: Connection refused', 'No RSA keys, or access-class denies the source', '`crypto key generate rsa`; fix the ACL'],
      ['Password required, but none set', '`login` with no line password', '`login local` + usernames, or set a password'],
      ['% Login invalid', 'Wrong credentials or no local user', 'Check the `username … secret` entries'],
      ['% No password set at enable', 'No enable secret configured', '`enable secret …`'],
      ['Switch unreachable from other subnets', 'No `ip default-gateway`', 'Set the gateway in the SVI subnet'],
      ['Switch unreachable from anywhere', 'SVI down: VLAN missing or inactive', 'Create or allow the VLAN; `no shutdown`'],
    ],
    notes:
      "Use this table to turn a symptom into a cause quickly. Refusals are configuration problems on the target: Telnet is refused when the lines accept only SSH, and SSH is refused when there are no RSA keys — for example because keys were never generated, or were deleted with `crypto key zeroize rsa`. In both cases an access-class that denies the source produces the same refusal, so look at the line configuration and the ACL together. Messages that appear after the connection opens are authentication problems: `login` without a password, invalid credentials, or `login local` with no local users, which locks everyone out until someone adds an account from the console. A missing enable secret stops remote users at user EXEC mode. When nothing answers at all, the problem is reachability. For a Layer 2 switch, distinguish two cases: if hosts in the management VLAN can connect but other subnets time out, the default gateway is missing or wrong; if nobody can reach the switch, the SVI itself is down — the VLAN is missing, has no active ports or is not allowed on the trunk — or it is administratively shut down. `show ip interface brief` tells these cases apart in seconds.",
  },
  {
    kind: 'bullets',
    title: 'Remote access hardening checklist',
    bullets: [
      'SSHv2 only (`ip ssh version 2`) with 2048-bit RSA keys',
      '`transport input ssh` on **every** VTY line',
      '`access-class` admits only the management subnet',
      '`exec-timeout` closes idle sessions (5–10 minutes)',
      '`username … secret` and `enable secret` — never cleartext or type 7',
      'Dedicated management VLAN and subnet, not VLAN 1',
      'Protect the console too: `login local` and `exec-timeout`',
    ],
    notes:
      "Here is the hardening checklist that audits — and exam scenarios — apply to remote access. Use SSHv2 only, with keys of 2048 bits, and configure `transport input ssh` on every VTY line so that Telnet is refused everywhere. Restrict sources with `access-class`, admitting only the management subnet or jump hosts; this protects the device even when new interfaces are added later. Set `exec-timeout` to a few minutes so that forgotten sessions close themselves. Store credentials safely: `username … secret` and `enable secret` keep only one-way hashes, whereas `password` keywords store cleartext that `service password-encryption` merely obscures with the weak, reversible type 7 encoding — useful against shoulder-surfing, useless against anyone who copies the configuration. Put management addresses in a dedicated VLAN and subnet rather than VLAN 1, and keep user traffic out of it. Do not forget the console: physical access is still access, so give it `login local` and a timeout too. In larger networks, centralize authentication with AAA and RADIUS or TACACS+, which adds per-command authorization and accounting. None of these steps is exotic; together they turn remote management from the easiest way into a network into one of the hardest.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: SSH and remote access',
    body: 'SSH order: ==hostname → ip domain-name → crypto key generate rsa → username → ip ssh version 2 → VTY lines==.',
    bullets: [
      'Telnet = TCP 23, cleartext; SSH = TCP 22, encrypted',
      'Keys need a non-default hostname and a domain name; SSHv2 needs 768+ bits',
      'Version 1.99 = v1 and v2; `ip ssh version 2` = v2 only',
      '`login local` needs usernames; `login` needs a line password',
      '`transport input ssh` on **all** lines: `line vty 0 15`',
      '`access-class` on lines; `ip access-group` on interfaces',
      'Layer 2 switch: SVI + `ip default-gateway`',
    ],
    notes:
      "These are the traps that decide SSH questions. The configuration order is tested as a drag-and-drop: hostname and domain name first because the key pair is named after them, then `crypto key generate rsa`, then the local user, `ip ssh version 2` and finally the VTY lines. Key generation fails with the default hostname Router or without a domain name, and SSHv2 needs at least 768 bits. `show ip ssh` showing 1.99 means both versions are enabled — not SSHv2 only. `login local` checks local usernames, so it is useless without `username` entries, while plain `login` uses a line password and fails with Password required, but none set if none exists. `transport input ssh` must cover every VTY line; configuring only 0 to 4 leaves 5 to 15 open. `access-class` is the line command and `ip access-group` the interface command; distractors swap them. `exec-timeout` takes minutes and seconds, with 10 minutes as the default and `0 0` meaning never. Finally, a Layer 2 switch needs an SVI in an active VLAN plus `ip default-gateway` before anyone outside its subnet can reach it, while the IOS client command is `ssh -l user address`.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Telnet (TCP 23) is cleartext; SSH (TCP 22) encrypts',
      'Order: hostname, domain name, RSA keys, user, `ip ssh version 2`',
      'VTY: `login local`, `transport input ssh`, `exec-timeout`, `access-class`',
      'Verify: `show ip ssh`, `show ssh`, `show users`',
      'Connect: `ssh -l admin 10.1.99.11`',
      'Switches: SVI + `ip default-gateway`',
    ],
    notes:
      "Let's recap. Telnet sends everything in cleartext over TCP 23, so production devices are managed with SSH over TCP 22, which encrypts the session and authenticates the server with its host key. On Cisco IOS, SSH follows a fixed sequence: set a non-default hostname and a domain name, generate an RSA key pair of at least 768 bits — 2048 in practice — which enables SSH, create a local user with `secret`, and restrict the server to SSHv2 with `ip ssh version 2`. Then harden all VTY lines with `line vty 0 15`: `login local` for username authentication, `transport input ssh` to refuse Telnet, `exec-timeout` to close idle sessions and `access-class` to admit only management sources; add an `enable secret` for privileged access. Verify with `show ip ssh` for status and version, `show ssh` for active SSH sessions and `show users` for everyone logged in, and connect from IOS with `ssh -l`. A Layer 2 switch additionally needs an SVI in an active management VLAN and an `ip default-gateway` before it can be managed from other subnets. Learn the error messages as well, because they point straight at the missing piece.",
  },
];
