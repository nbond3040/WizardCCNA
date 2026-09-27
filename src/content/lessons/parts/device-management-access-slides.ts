import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Device Management Access',
    subtitle: 'Console, AUX, Telnet, SSH, web GUI and cloud dashboards: reaching devices safely',
    notes:
      "Before you can configure, monitor or troubleshoot a router or switch, you have to reach it, and every way in is also a way in for an attacker. This lesson surveys the management access methods the CCNA expects you to compare: the physical **console** and legacy **AUX** ports, remote CLI over **Telnet** and **SSH**, the web GUI over **HTTP** and **HTTPS**, and the modern **controller-based** and **cloud-managed** models such as the Meraki dashboard. You will learn the difference between **in-band** and **out-of-band** management, configure a management VLAN, SSHv2 and an HTTPS-only web server, lock the VTY lines down with an ACL, and connect administrator logins to TACACS+ or RADIUS. The topic maps to v1.1 exam topic 2.8 and to domain 4 of v2.0. Expect questions that ask for port numbers, which methods are encrypted, which commands enable SSH, and which design keeps working when the production network fails.",
  },
  {
    kind: 'bullets',
    title: 'Ways into a network device',
    bullets: [
      '**Console**: physical serial port, works with no IP configured',
      '**AUX**: legacy router port for a dial-in modem',
      '**VTY lines**: remote CLI over **Telnet** or **SSH**',
      '**Web GUI**: HTTP or HTTPS to the device',
      '**APIs**: SNMP, NETCONF, RESTCONF (covered later)',
      '**Controller or cloud**: WLC, Catalyst Center, Meraki dashboard',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'con', icon: 'laptop', label: 'Admin A', sub: 'console (OOB)', x: 1.2, y: 1 },
        { id: 'net', icon: 'laptop', label: 'Admin B', sub: 'SSH / HTTPS (in-band)', x: 1.2, y: 3.4 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 4.6, y: 3.4 },
        { id: 'r1', icon: 'router', label: 'R1', x: 8.2, y: 2.2, tone: 'accent' },
      ],
      links: [
        { from: 'con', to: 'r1', label: 'rollover cable', toLabel: 'CON', style: 'dashed' },
        { from: 'net', to: 'sw' },
        { from: 'sw', to: 'r1', toLabel: 'G0/0/1' },
      ],
    },
    notes:
      "Every Cisco device offers several doors, and each has different requirements and risks. The **console** port is a physical serial connection: it needs no IP address, no routing and no working network, which makes it the tool for initial setup and disaster recovery, but it requires someone (or a console server) physically connected to it. Routers traditionally also have an **AUX** port for an external modem, a legacy form of remote out-of-band access. Once the device has an IP address, administrators normally use the virtual terminal (**VTY**) lines, reached with **Telnet** or **SSH**, or the built-in **web GUI** over HTTP or HTTPS. Management software also uses programmatic interfaces such as SNMP, NETCONF and RESTCONF, which are covered in the automation lessons. Finally, many networks no longer configure devices one by one: lightweight APs are driven by a **WLC**, campus switches can be driven by Catalyst Center, and Meraki devices by a **cloud dashboard**. In the diagram, Admin A reaches R1 even if the network is down; Admin B depends on SW1 and working IP connectivity.",
  },
  {
    kind: 'diagram',
    title: 'In-band vs out-of-band management',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      groups: [
        { label: 'Production network (in-band)', x: 0.2, y: 0.2, w: 9.6, h: 2.3 },
        { label: 'Out-of-band management network', x: 0.2, y: 2.7, w: 9.6, h: 2.1, tone: 'muted' },
      ],
      nodes: [
        { id: 'users', icon: 'pc', label: 'Users', x: 1, y: 1.3 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 3.6, y: 1.3 },
        { id: 'r1', icon: 'router', label: 'R1', x: 6.2, y: 1.3 },
        { id: 'wan', icon: 'cloud', label: 'WAN', x: 8.8, y: 1.3 },
        { id: 'nms', icon: 'laptop', label: 'Admin / NMS', x: 1, y: 3.9 },
        { id: 'msw', icon: 'switch', label: 'Mgmt switch', x: 3.6, y: 3.9 },
        { id: 'cs', icon: 'server', label: 'Console server', x: 6.2, y: 3.9, tone: 'accent' },
      ],
      links: [
        { from: 'users', to: 'sw1' },
        { from: 'sw1', to: 'r1' },
        { from: 'r1', to: 'wan' },
        { from: 'nms', to: 'msw' },
        { from: 'msw', to: 'cs' },
        { from: 'msw', to: 'sw1', label: 'mgmt port', style: 'dashed' },
        { from: 'cs', to: 'r1', label: 'console', style: 'dashed', tone: 'accent' },
      ],
    },
    caption: 'Out-of-band access uses its own path: console server and dedicated management ports.',
    notes:
      "**In-band** management means management traffic (SSH, HTTPS, SNMP, syslog) travels over the same interfaces, VLANs and links that carry user data. It is cheap and simple, but it has two weaknesses: if the production network breaks, you lose access exactly when you need it most, and management traffic is exposed to anyone who can reach the production network, so it must be protected with ACLs and encryption. **Out-of-band (OOB)** management uses a separate path. In the diagram, a dedicated management switch connects to the management Ethernet ports of the devices, and a **console server** (terminal server) is cabled to each device's console port, so an administrator can reach the CLI even if a routing mistake or a failed uplink has isolated the device. Many platforms have a dedicated management Ethernet port that sits in its own management VRF, keeping it separate from the data-plane routing table. Large networks usually combine both approaches: day-to-day work in-band over SSH, with OOB as the emergency path for outages, upgrades and recovery.",
  },
  {
    kind: 'compare',
    title: 'In-band vs out-of-band: trade-offs',
    left: {
      heading: 'In-band',
      bullets: [
        'Shares production links and VLANs',
        'No extra hardware or cabling',
        'Lost when the production network fails',
        'Must be secured with ACLs, SSH and HTTPS',
        'Example: SSH to a switch SVI',
      ],
    },
    right: {
      heading: 'Out-of-band',
      bullets: [
        'Separate network or console path',
        'Extra cost: console servers, management switches',
        '==Works when production is down==',
        'Isolated from user traffic',
        'Examples: console server, management port, AUX modem',
      ],
      tone: 'accent',
    },
    notes:
      "Use this comparison to answer design questions quickly. The deciding question is usually: what happens when the network is broken? In-band access depends on the very network it manages. A wrong ACL on an uplink, a spanning-tree loop or a routing change can cut off your SSH session, and remote sites become unreachable. Out-of-band access survives those failures because it does not depend on the production data plane. The price is extra equipment and cabling: console servers, a separate management switch or even a separate cellular or modem link at remote sites. Security is the other angle. OOB networks are isolated from users, so attackers on a user VLAN cannot even reach the management plane. In-band management can still be made safe by placing device addresses in a dedicated management VLAN or subnet, allowing only SSH and HTTPS, and restricting the VTY lines to administrator subnets with an access-class ACL. On the exam, a console connection or console server is always out-of-band, while SSH to an interface that also forwards user traffic is in-band.",
  },
  {
    kind: 'bullets',
    title: 'Console and AUX ports',
    bullets: [
      'Console: RJ-45 (rollover cable) or USB console port',
      'Terminal settings: **9600 bps, 8 data bits, no parity, 1 stop bit**, no flow control',
      'Works with no IP address: initial setup, password recovery',
      'Configured under `line con 0`',
      'AUX: router port for an external modem (`line aux 0`)',
      'AUX is legacy: disable EXEC on it if unused',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.2,
      nodes: [
        { id: 'pc', icon: 'laptop', label: 'Terminal emulator', sub: 'PuTTY / Tera Term', x: 1.2, y: 1.6 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5, y: 1.6, tone: 'accent' },
        { id: 'modem', icon: 'modem', label: 'Modem', sub: 'dial-in', x: 8.8, y: 1.6 },
      ],
      links: [
        { from: 'pc', to: 'r1', label: 'rollover or USB', toLabel: 'CON' },
        { from: 'r1', to: 'modem', fromLabel: 'AUX', style: 'serial' },
      ],
    },
    notes:
      "The **console port** is the first way into a new device and the last way in when everything else fails. You connect with a rollover console cable (RJ-45 on the device, DB-9 serial or a USB adapter on the laptop) or, on newer devices, with a USB cable to a USB console port. A terminal emulator such as PuTTY or Tera Term must match the default line settings: **9600 bps, 8 data bits, no parity, 1 stop bit and no flow control**, often written 9600 8N1. Because the console does not depend on IP, it is used for initial configuration, for password recovery (which requires physical access and a reload into ROMMON), and whenever a configuration mistake has cut off remote access. In the configuration, the console is `line con 0`. The **AUX** (auxiliary) port on routers was designed for an external modem, so an engineer could dial in to a remote router when the WAN was down and land on `line aux 0`. It is rarely used today, so best practice is to disable EXEC on it or protect it exactly like the console.",
  },
  {
    kind: 'cli',
    title: 'Securing the console and AUX lines',
    code: `R1(config)# username admin privilege 15 secret Adm1nPa55
R1(config)# line con 0
R1(config-line)# login local
R1(config-line)# exec-timeout 5 0
R1(config-line)# logging synchronous
R1(config-line)# exit
R1(config)# line aux 0
R1(config-line)# no exec
R1(config-line)# transport input none`,
    highlight: ['login local', 'no exec'],
    caption: 'Physical access is no reason to leave a line open.',
    notes:
      "By default the console asks for no password at all, so anyone who reaches the device with a cable gets user EXEC access, and with no enable secret configured they can go further. The fix is the same as for remote access: require a login. `login local` checks the local username database; alternatively, with AAA enabled, the console follows the default login method list, as covered in the AAA lesson. `exec-timeout 5 0` disconnects an idle session after five minutes and zero seconds. The default is **10 minutes**, and `exec-timeout 0 0` disables the timeout, which is convenient in a lab but bad practice in production because an unattended, logged-in console stays open. `logging synchronous` keeps log messages from interrupting what you are typing. For an unused AUX port, `no exec` prevents an EXEC session from starting on the line and `transport input none` refuses incoming connections to it. Remember that console security is also physical: devices belong in locked rooms or racks, because anyone with physical access can perform password recovery.",
  },
  {
    kind: 'cli',
    title: 'Management VLAN and switch SVI',
    code: `SW1(config)# vlan 99
SW1(config-vlan)# name MGMT
SW1(config-vlan)# exit
SW1(config)# interface vlan 99
SW1(config-if)# ip address 10.99.0.11 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 10.99.0.1`,
    highlight: ['interface vlan 99', 'ip default-gateway 10.99.0.1'],
    caption: 'A Layer 2 switch needs an SVI and a default gateway to be managed from other subnets.',
    notes:
      "A Layer 2 switch forwards frames without any IP address, but you cannot SSH to it until it has one. The address lives on a **switch virtual interface (SVI)**, created with `interface vlan 99`. Best practice is a dedicated **management VLAN** rather than VLAN 1: VLAN 1 is the default VLAN on every port and trunk, which makes it the easiest VLAN for an attacker on a user port to reach. The SVI comes up only if the VLAN exists and at least one port in that VLAN, or a trunk carrying it, is up, so create the VLAN and allow it on the uplink trunk. Because a Layer 2 switch does not route, it also needs `ip default-gateway`. Without it, the switch can answer hosts in 10.99.0.0/24 but cannot reply to an administrator in any other subnet, a very common exam troubleshooting scenario. A multilayer switch with `ip routing` enabled uses its routing table instead and ignores `ip default-gateway`. The management VLAN is still in-band, but it separates device addresses from user subnets so that ACLs can protect them.",
  },
  {
    kind: 'compare',
    title: 'Telnet vs SSH',
    left: {
      heading: 'Telnet (TCP 23)',
      bullets: [
        'Everything in **clear text**, passwords included',
        'No way to verify the server',
        'Trivial to capture with a sniffer',
        'Acceptable only in isolated labs',
      ],
      tone: 'bad',
    },
    right: {
      heading: 'SSH (TCP 22)',
      bullets: [
        'Encrypted session: use **SSHv2**',
        'Server proves its identity with a host key',
        'Password or public-key user login',
        'Also secures SCP and SFTP transfers',
      ],
      tone: 'good',
    },
    notes:
      "Telnet and SSH both give you a remote CLI on the VTY lines, and from the prompt onward they look identical. The difference is what an eavesdropper sees. **Telnet** (TCP port 23) sends every keystroke in clear text, including the username, the login password, the enable secret you type after `enable` and every configuration command. Anyone with a packet capture between the administrator and the device can read and reuse those credentials. Telnet also has no way to prove the server's identity, so a man-in-the-middle can impersonate the device. **SSH** (TCP port 22) encrypts the whole session after a key exchange, authenticates the server with its host key (your SSH client warns you if that key changes) and supports password or public-key authentication for the user. Always use **SSH version 2**, because SSHv1 has known cryptographic weaknesses. The same SSH transport also secures file transfers with SCP and SFTP. On the exam, whenever a question asks for secure remote CLI access, the answer is SSHv2; Telnet appears only as the insecure distractor.",
  },
  {
    kind: 'diagram',
    title: 'How an SSH session is established',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'admin', label: 'Admin (SSH client)', icon: 'laptop' },
        { id: 'r1', label: 'R1 (SSH server)', icon: 'router' },
      ],
      steps: [
        { from: 'admin', to: 'r1', label: 'TCP three-way handshake', sub: 'destination port 22' },
        { from: 'r1', to: 'admin', label: 'Version exchange', sub: 'SSH-2.0 on both sides' },
        { from: 'admin', to: 'r1', label: 'Key exchange (Diffie-Hellman)', sub: 'both sides derive session keys' },
        { from: 'r1', to: 'admin', label: 'Server host key + signature', sub: 'client verifies R1 identity', tone: 'accent' },
        { note: 'From here on, everything is encrypted', tone: 'good' },
        { from: 'admin', to: 'r1', label: 'User authentication', sub: 'password or public key' },
        { from: 'r1', to: 'admin', label: 'EXEC shell session', sub: 'commands and output encrypted' },
      ],
    },
    notes:
      "It helps to know what happens before the password prompt appears. After the TCP handshake to port **22**, client and server exchange version strings; an IOS device configured with `ip ssh version 2` offers SSH-2.0 only. Next comes the **key exchange**: using Diffie-Hellman, both sides derive the same symmetric session keys without ever sending them across the network. In the same step, the server proves its identity by signing the exchange with its **host key**, which on IOS is the RSA key pair you generated. The client compares that key with the one it saw last time, and a changed key triggers a warning that could indicate a man-in-the-middle attack. Only now, inside the encrypted channel, does the user authenticate with a password or a public key, so the credentials are never exposed. Finally, the session channel carries the EXEC shell, and every command and every line of output is encrypted and integrity-protected. This is why generating RSA keys is mandatory: without a host key the device cannot run an SSH server at all.",
  },
  {
    kind: 'cli',
    title: 'Configuring SSHv2 on IOS',
    code: `Router(config)# hostname R1
R1(config)# ip domain name corp.example
R1(config)# crypto key generate rsa modulus 2048
The name for the keys will be: R1.corp.example

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 1 seconds)
R1(config)# ip ssh version 2
R1(config)# username admin privilege 15 secret Adm1nPa55
R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# exec-timeout 10 0`,
    highlight: ['crypto key generate rsa modulus 2048', 'ip ssh version 2', 'transport input ssh'],
    caption: 'Hostname + domain name → RSA keys → SSHv2 → local user → VTY login.',
    notes:
      "SSH on IOS needs four ingredients. First, a **hostname** other than the default and a **domain name**, because the RSA key pair is named after them (here R1.corp.example); without them `crypto key generate rsa` refuses to run. Second, the **RSA key pair** itself: generating it automatically enables the SSH server. Use at least 2048 bits; SSHv2 requires a modulus of at least 768 bits, and modern clients reject small keys. Third, `ip ssh version 2`, so that the obsolete SSHv1 is refused. Fourth, a way to authenticate users: a local username with a secret plus `login local` on the VTY lines, or AAA method lists pointing to TACACS+ or RADIUS. Finally, `transport input ssh` makes the VTY lines accept SSH only, so Telnet is refused even if someone tries it. IOS routers commonly show VTY lines 0 to 4 and Catalyst switches 0 to 15; secure every VTY line that exists identically, because an attacker needs only one open line. `ip domain name` is the newer form of `ip domain-name`, and current IOS accepts both.",
  },
  {
    kind: 'cli',
    title: 'Verifying SSH',
    code: `R1# show ip ssh
SSH Enabled - version 2.0
Authentication timeout: 120 secs; Authentication retries: 3
R1# show ssh
Connection Version Mode Encryption  Hmac          State           Username
0          2.0     IN   aes256-ctr  hmac-sha2-256 Session started admin
0          2.0     OUT  aes256-ctr  hmac-sha2-256 Session started admin
%No SSHv1 server connections running.`,
    highlight: ['version 2.0', 'Session started'],
    caption: 'Version 1.99 in this output would mean SSHv1 is still accepted.',
    notes:
      "`show ip ssh` answers the first question: is the SSH server running, and which version does it accept? **SSH Enabled - version 2.0** means only SSHv2 clients are accepted. If you see **version 1.99**, the server accepts both SSHv1 and SSHv2, which is the IOS default after key generation until you enter `ip ssh version 2`; the exam likes to show this output and ask what to change. If SSH shows as disabled, the usual cause is a missing RSA key pair. The same output shows the authentication timeout (120 seconds by default) and the number of retries (3), which you can tighten with `ip ssh time-out` and `ip ssh authentication-retries`. `show ssh` lists active sessions: each connection appears twice, once for the inbound (IN) and once for the outbound (OUT) direction, with the negotiated encryption and HMAC algorithms and the username. `show users` gives a quick view of who is logged in on which line. Together these commands prove that administrators really are using encrypted sessions.",
  },
  {
    kind: 'cli',
    title: 'Restricting VTY access with an ACL',
    code: `SW1(config)# ip access-list standard MGMT-HOSTS
SW1(config-std-nacl)# permit 10.99.0.0 0.0.0.255
SW1(config-std-nacl)# deny any log
SW1(config-std-nacl)# exit
SW1(config)# line vty 0 15
SW1(config-line)# access-class MGMT-HOSTS in
SW1(config-line)# transport input ssh
SW1(config-line)# login local`,
    highlight: ['access-class MGMT-HOSTS in'],
    caption: 'Lines use access-class; interfaces use ip access-group.',
    notes:
      "Encryption protects the session, but you also want to control **who can even try** to log in. A standard ACL applied to the VTY lines with `access-class MGMT-HOSTS in` filters incoming Telnet and SSH connections by source address, so only the management subnet 10.99.0.0/24 can open a session; everyone else is refused before seeing a login prompt. The explicit `deny any log` is optional, because every ACL ends with an implicit deny, but it records the attempts. Notice the command: on lines it is **`access-class`**, while `ip access-group` applies an ACL to an interface. Applying the ACL to the lines rather than to interfaces protects every IP address the device owns, no matter which interface the connection arrives on. Apply it to **all** VTY lines (0 to 15 on this switch), otherwise an attacker simply lands on an unprotected line. The web server has its own `ip http access-class` command for the same purpose. Combined with `transport input ssh`, an attacker now needs to be on the right subnet, use SSH and hold valid credentials.",
  },
  {
    kind: 'cli',
    title: 'Web GUI: HTTPS only',
    code: `R1(config)# no ip http server
R1(config)# ip http secure-server
R1(config)# ip http authentication local
R1(config)# username webadmin privilege 15 secret W3bAdm1n`,
    highlight: ['no ip http server', 'ip http secure-server'],
    caption: 'HTTP (TCP 80) off, HTTPS (TCP 443) on.',
    notes:
      "Most Cisco routers, switches and WLCs include a web GUI, handy for quick monitoring and for staff who are less comfortable with the CLI. `ip http server` enables the plain **HTTP** server on TCP port **80**. Like Telnet, it sends credentials and pages in clear text; HTTP basic authentication is merely Base64-encoded, not encrypted. `ip http secure-server` enables **HTTPS** on TCP port **443**, which wraps the session in TLS. IOS creates a self-signed certificate automatically if none is configured, so browsers show a certificate warning unless you enroll a certificate from a trusted CA. Best practice is exactly this slide: turn the HTTP server off with `no ip http server` and keep only HTTPS, or turn both off if nobody uses the GUI. `ip http authentication local` makes the web server check the local username database; with AAA you can use `ip http authentication aaa` so that GUI logins go to TACACS+ or RADIUS just like CLI logins. On the exam, remember the pairing: `ip http server` is HTTP on port 80, and `ip http secure-server` is HTTPS on port 443.",
  },
  {
    kind: 'bullets',
    title: 'Central authentication for administrators',
    bullets: [
      'Every admin logs in with a **named** account',
      '`aaa new-model` + method list `group tacacs+ local`',
      '**TACACS+** preferred: per-command authorization and command logging',
      'RADIUS also works for admin logins, without per-command control',
      'One method list can cover console, VTY and web GUI',
      'Keep one local **break-glass** account for server outages',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.2,
      nodes: [
        { id: 'adm', icon: 'laptop', label: 'Admin', sub: 'named account', x: 1.2, y: 1.6 },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'AAA client', x: 5, y: 1.6 },
        { id: 'ise', icon: 'server', label: 'ISE', sub: 'TACACS+ server', x: 8.8, y: 1.6, tone: 'accent' },
      ],
      links: [
        { from: 'adm', to: 'sw', label: 'SSH TCP 22' },
        { from: 'sw', to: 'ise', label: 'TACACS+ TCP 49' },
      ],
    },
    notes:
      "With a handful of devices, local usernames are manageable; with hundreds they are not, and a shared account such as a single 'admin' makes it impossible to know who changed what. Centralized authentication gives every administrator a **named account** in one place, usually Cisco ISE backed by Active Directory. The device becomes an AAA client: `aaa new-model` plus `aaa authentication login default group tacacs+ local` sends console and VTY logins (and, with `ip http authentication aaa`, web GUI logins) to the TACACS+ servers, and falls back to the local database only when no server responds. **TACACS+** is the preferred protocol for device administration because it separates authorization from authentication, allowing per-command authorization, it logs every command through accounting, and it encrypts the entire payload. RADIUS can also authenticate administrators but cannot authorize individual commands. Keep one strong local break-glass account for outages, store its password securely and monitor its use. The AAA lesson covers method lists and server configuration in depth; here, remember why administrators should never share accounts.",
  },
  {
    kind: 'diagram',
    title: 'Cloud-managed devices: Cisco Meraki',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'admin', icon: 'laptop', label: 'Admin', sub: 'web browser', x: 1.2, y: 0.9 },
        { id: 'cloud', icon: 'cloud', label: 'Meraki cloud', sub: 'dashboard', x: 5, y: 0.9, tone: 'accent' },
        { id: 'mx', icon: 'firewall', label: 'MX', sub: 'security appliance', x: 5, y: 2.5 },
        { id: 'ms', icon: 'switch', label: 'MS', sub: 'switch', x: 5, y: 4.1 },
        { id: 'mr', icon: 'ap', label: 'MR', sub: 'access point', x: 8.3, y: 4.1 },
        { id: 'cl', icon: 'laptop', label: 'Client', x: 8.3, y: 2.3 },
      ],
      links: [
        { from: 'admin', to: 'cloud', label: 'HTTPS' },
        { from: 'mx', to: 'cloud', label: 'management tunnel', style: 'dashed', tone: 'accent' },
        { from: 'mx', to: 'ms' },
        { from: 'ms', to: 'mr' },
        { from: 'cl', to: 'mr', style: 'wireless' },
      ],
      annotations: [{ x: 1.9, y: 3.4, text: 'User data stays on site' }],
    },
    caption: 'Management plane in the cloud; data plane stays local.',
    notes:
      "**Cloud-managed** networking moves the management plane off-site. With **Cisco Meraki**, every device (MX security appliances, MS switches, MR access points, MV cameras and others) opens an outbound, encrypted connection to the Meraki cloud as soon as it has Internet access. Administrators never log in to individual boxes; they use the **Meraki dashboard** in a web browser, or its API, to configure, monitor and troubleshoot every site from one place, and new devices can be claimed in the dashboard and shipped straight to a branch for zero-touch deployment. Only management traffic goes to the cloud: user traffic is switched and routed locally, so a laptop printing to a local printer never touches the Internet. If the cloud becomes unreachable, the devices keep forwarding traffic with their last configuration, but nothing can be changed until connectivity returns. Compared with traditional management, there is no console session or SSH configuration to maintain, but you depend on the vendor's cloud and on a subscription license. The exam expects you to recognize Meraki as the example of cloud-managed devices.",
  },
  {
    kind: 'table',
    title: 'Per-device, controller and cloud management',
    columns: ['Model', 'Where configuration is made', 'How admins connect', 'Example'],
    rows: [
      ['**Per-device (traditional)**', 'On each device individually', 'Console, SSH or HTTPS to each box', 'IOS routers and switches'],
      ['**Controller-managed**', 'On an on-premises controller that pushes it', 'GUI or API of the controller', 'WLC with lightweight APs; Catalyst Center'],
      ['**Cloud-managed**', 'In a vendor-hosted dashboard', 'Web browser or API over the Internet', 'Cisco Meraki'],
    ],
    caption: 'Controllers and clouds centralize the management plane; forwarding stays on the devices.',
    notes:
      "The CCNA contrasts three management models. In the **traditional per-device** model, each router and switch holds its own configuration, and you connect to each one with the console, SSH or its web GUI. It works everywhere but scales poorly and invites inconsistent configurations. In the **controller-managed** model, an on-premises controller owns the configuration and pushes it to the devices it manages. The classic example is a **WLC** with lightweight APs: the APs join the controller over CAPWAP and receive all their WLAN settings from it, so you never configure an AP individually. Cisco Catalyst Center (formerly DNA Center) plays a similar role for campus switches and routers, using southbound protocols such as SSH, NETCONF and SNMP. In the **cloud-managed** model, the controller function is a vendor-hosted service, the Meraki dashboard, reached over the Internet. In all three models the devices still forward traffic locally; what moves is the management plane. When a question mentions a single pane of glass hosted by the vendor, think Meraki; when it mentions an on-site appliance that configures APs, think WLC.",
  },
  {
    kind: 'steps',
    title: 'Hardening management access',
    steps: [
      { title: 'Use SSHv2 only', text: '`ip ssh version 2` and `transport input ssh` on every VTY line' },
      { title: 'Use HTTPS only', text: '`no ip http server`; keep `ip http secure-server` or disable both' },
      { title: 'Restrict who can connect', text: '`access-class` ACL on VTY lines; management VLAN or OOB network' },
      { title: 'Authenticate centrally', text: 'Named accounts via TACACS+ or RADIUS, local break-glass fallback' },
      { title: 'Limit idle sessions and guessing', text: '`exec-timeout`; `login block-for` against brute force' },
      { title: 'Disable what you do not use', text: 'Unused lines such as AUX, the HTTP server, Telnet' },
      { title: 'Warn and log', text: '`banner motd` legal notice; send login events to syslog' },
    ],
    notes:
      "This checklist condenses the lesson into the actions a security auditor will look for, and each step removes one path an attacker could use. SSHv2 and HTTPS remove clear-text credentials from the wire. VTY access-class ACLs and a management VLAN or out-of-band network stop ordinary users from even reaching a login prompt. Central authentication removes shared passwords and gives you per-person accounting. Timeouts close forgotten sessions, and `login block-for 120 attempts 3 within 60` slows password guessing by blocking all logins for 120 seconds after three failures within 60 seconds. Disabling unused services shrinks the attack surface: an AUX line with `no exec`, the HTTP server turned off, and Telnet removed from `transport input`. A `banner motd` warning that access is restricted to authorized users does not stop anyone technically, but it supports legal action, and logging login successes and failures to a syslog server lets you spot attacks in progress. In exam scenarios, the best answer is usually the one that encrypts, restricts and centralizes at the same time.",
  },
  {
    kind: 'table',
    title: 'Management access methods compared',
    columns: ['Method', 'Port / medium', 'Encrypted?', 'Path', 'Verdict'],
    rows: [
      ['Console', 'Serial, 9600 8N1', 'No (local cable)', 'Out-of-band', 'Keep; require login'],
      ['AUX', 'Serial via modem', 'No', 'Out-of-band', 'Legacy; disable if unused'],
      ['Telnet', 'TCP **23**', '**No**, clear text', 'In-band', 'Avoid'],
      ['SSH', 'TCP **22**', '**Yes** (use SSHv2)', 'In-band or OOB port', '==Use for CLI=='],
      ['HTTP', 'TCP **80**', '**No**', 'In-band', 'Disable'],
      ['HTTPS', 'TCP **443**', '**Yes** (TLS)', 'In-band or OOB port', 'Use for GUI'],
      ['Meraki dashboard', 'HTTPS to the cloud', 'Yes', 'Internet', 'Cloud-managed'],
    ],
    caption: 'Secure pairs: SSH replaces Telnet, HTTPS replaces HTTP.',
    notes:
      "This is the reference table to memorize for this exam topic, and it is easiest to read as pairs. For remote CLI, **Telnet on TCP 23** is the clear-text protocol and **SSH on TCP 22** is its encrypted replacement. For the web GUI, **HTTP on TCP 80** is clear text and **HTTPS on TCP 443** is its TLS-protected replacement. The console and AUX ports are not IP services at all, so they have no port number: they are serial lines, protected by physical security plus a login requirement, and they are the classic out-of-band paths. SSH and HTTPS are also only as secure as their configuration. Leaving SSHv1 enabled, or training users to click through certificate warnings, weakens them. The Meraki row reminds you that with cloud management the administrator talks HTTPS to the vendor's dashboard, not to the device itself. Exam questions often present two options that are both secure and ask for the one that matches the access type: SSH for the CLI, HTTPS for the GUI. They also present Telnet and HTTP as tempting answers because they are enabled by default on some platforms.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: management access',
    body: 'Secure CLI = **SSHv2 on TCP 22**; secure GUI = **HTTPS on TCP 443** (`ip http secure-server`).',
    bullets: [
      'Telnet (TCP 23) and HTTP (TCP 80) send credentials in **clear text**',
      '`ip http server` = HTTP; `ip http secure-server` = HTTPS',
      'SSH needs a non-default **hostname**, a **domain name** and **RSA keys**',
      'Version 1.99 in `show ip ssh` = SSHv1 still accepted',
      'VTY ACLs use `access-class`, not `ip access-group`',
      'Console or console server = **out-of-band**',
      'Layer 2 switch managed from other subnets needs `ip default-gateway`',
    ],
    notes:
      "These traps come straight from how the exam words management questions. First, port numbers: SSH 22, Telnet 23, HTTP 80 and HTTPS 443 are frequently swapped in the options. Second, the web server commands are easy to confuse: `ip http server` enables plain HTTP, and `ip http secure-server` enables HTTPS, so securing the GUI means adding the secure server and removing the plain one. Third, SSH prerequisites: questions show a failed `crypto key generate rsa` and ask what is missing (a hostname or a domain name), or show VTY lines with `transport input telnet` and ask why SSH fails. Fourth, `show ip ssh` reporting version 1.99 means SSHv1 is still accepted; the fix is `ip ssh version 2`. Fifth, the ACL command for lines is `access-class`, while `ip access-group` is the interface command. Sixth, classify access paths correctly: anything through a console port or a separate management network is out-of-band. Finally, a Layer 2 switch with a correct SVI but no default gateway can be managed only from its own subnet.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Console and AUX: serial, out-of-band, work without IP',
      'In-band shares production links; OOB survives outages',
      'Management SVI + `ip default-gateway` on Layer 2 switches',
      'SSHv2 (TCP 22) instead of Telnet (TCP 23)',
      'HTTPS (TCP 443) instead of HTTP (TCP 80)',
      'VTY `access-class` ACLs, timeouts and central AAA',
      'Controller-managed (WLC) and cloud-managed (Meraki) models',
    ],
    notes:
      "Management access is about reaching devices without handing the same access to attackers. The console and AUX ports are serial, out-of-band paths that work even with no IP configuration; secure them with a login requirement and physical security. In-band management over SSH and HTTPS is convenient but depends on the production network, while out-of-band networks and console servers keep working during outages. A Layer 2 switch needs a management SVI, ideally not in VLAN 1, and an `ip default-gateway` to be reachable from other subnets. For the remote CLI, use SSHv2 on TCP 22 and never Telnet on TCP 23; that means a hostname, a domain name, RSA keys, `ip ssh version 2` and `transport input ssh`. For the GUI, use HTTPS on TCP 443 with `ip http secure-server` and disable HTTP with `no ip http server`. Restrict the VTY lines with `access-class`, set timeouts, and authenticate administrators centrally with TACACS+ plus a local fallback. Finally, recognize controller-managed devices such as lightweight APs under a WLC, and cloud-managed devices under the Meraki dashboard.",
  },
];

export default slides;
