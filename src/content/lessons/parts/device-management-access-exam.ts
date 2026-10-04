import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which protocol provides encrypted remote CLI access to a Cisco router?',
    options: ['SSH', 'Telnet', 'HTTP', 'TFTP'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**SSH** (TCP 22) encrypts the entire CLI session, including credentials. Telnet gives a CLI but in clear text, HTTP serves the web GUI without encryption, and TFTP is an unauthenticated file-transfer protocol.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Administrators can Telnet to SW1, but every SSH attempt is refused. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show ip ssh
SSH Enabled - version 2.0
Authentication timeout: 120 secs; Authentication retries: 3
SW1# show running-config | section line vty
line vty 0 4
 login local
 transport input telnet
line vty 5 15
 login local
 transport input telnet`,
    },
    options: [
      'The VTY lines accept only Telnet',
      'The switch has no RSA key pair',
      'SSH version 2 is not enabled',
      'The local username database is empty',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`transport input telnet` on every VTY line refuses all other protocols, so SSH connections are rejected; the fix is `transport input ssh`. `show ip ssh` proves the SSH server is enabled at version 2.0, which also means the RSA keys exist. Telnet logins with `login local` succeed, so the local user database is not empty.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two commands must be configured before an RSA key pair can be generated for SSH on a new router? (Choose two.)',
    options: [
      '`hostname R1`',
      '`ip domain name corp.example`',
      '`ip ssh version 2`',
      '`transport input ssh`',
      '`username admin secret Adm1nPa55`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The key pair is named after the **hostname** and **domain name**, so IOS refuses to generate keys while the hostname is the default or no domain name exists. `ip ssh version 2`, `transport input ssh` and a local user are part of a complete SSH setup, but none of them is required to generate the keys.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. An administrator at 10.99.0.51 opens an SSH session to SW1. What is the result?',
    exhibit: {
      kind: 'cli',
      text: `SW1(config)# ip access-list standard MGMT-HOSTS
SW1(config-std-nacl)# permit host 10.99.0.50
SW1(config-std-nacl)# exit
SW1(config)# line vty 0 15
SW1(config-line)# access-class MGMT-HOSTS in
SW1(config-line)# transport input ssh
SW1(config-line)# login local`,
    },
    options: [
      'The connection is refused because of the implicit deny at the end of MGMT-HOSTS',
      'The connection succeeds because standard ACLs match only the network portion',
      'The connection succeeds because access-class filters only Telnet',
      'The connection succeeds, but the attempt is logged',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'MGMT-HOSTS permits only the single host 10.99.0.50; every other source, including 10.99.0.51, hits the **implicit deny**, so the VTY lines refuse the session. Standard ACLs match whatever the wildcard mask specifies (here an exact host), `access-class` filters SSH as well as Telnet, and nothing in this ACL logs matches.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each management access method to its port or medium.',
    pairs: [
      { left: 'Telnet', right: 'TCP 23' },
      { left: 'SSH', right: 'TCP 22' },
      { left: 'HTTP', right: 'TCP 80' },
      { left: 'HTTPS', right: 'TCP 443' },
      { left: 'Console', right: 'Asynchronous serial line at 9600 bps' },
    ],
    difficulty: 1,
    explanation:
      'Telnet 23 and HTTP 80 are clear text; SSH 22 and HTTPS 443 are their encrypted replacements. The console is not an IP service at all: it is a serial line with default settings 9600 bps, 8 data bits, no parity and 1 stop bit.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Classify each access path as in-band or out-of-band management.',
    categories: ['In-band', 'Out-of-band'],
    items: [
      { text: 'SSH to a switch SVI in the user data VLAN', category: 0 },
      { text: 'HTTPS to a router LAN interface that forwards user traffic', category: 0 },
      { text: 'SNMP polling over the production WAN', category: 0 },
      { text: 'Console server connected to each device console port', category: 1 },
      { text: 'Dedicated management switch cabled to management Ethernet ports', category: 1 },
      { text: 'Dial-up modem on the router AUX port', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'In-band traffic shares the production links and VLANs, so it disappears when that network fails. Console servers, a dedicated management network and an AUX modem use a separate path, which is the definition of **out-of-band**. Encryption is irrelevant to the classification: SSH over a user VLAN is secure but still in-band.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Which statement about out-of-band management is true?',
    options: [
      'It provides access to devices even when the production network is down',
      'It carries management traffic in the same VLANs as user traffic',
      'It requires Telnet because SSH needs in-band connectivity',
      'It is used only for the initial configuration of new devices',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Out-of-band management uses a **separate path**, so it still works during outages, upgrades and misconfigurations. Sharing VLANs with users describes in-band management, SSH works perfectly over an OOB network or a console server, and OOB access is used throughout the device lifecycle, not only for initial setup.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: "Refer to the exhibit. A mistake in an inbound ACL on R1's G0/0/1 now blocks all traffic arriving from SW1. Which method still lets the administrator reach R1's CLI?",
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'adm', icon: 'laptop', label: 'Admin', x: 1.2, y: 2.5 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'production', x: 4.4, y: 1 },
          { id: 'msw', icon: 'switch', label: 'MGMT-SW', sub: 'OOB network', x: 4.4, y: 4 },
          { id: 'r1', icon: 'router', label: 'R1', x: 8.6, y: 1 },
          { id: 'cs', icon: 'server', label: 'CS1', sub: 'console server', x: 8.6, y: 4 },
        ],
        links: [
          { from: 'adm', to: 'sw1', label: 'VLAN 10' },
          { from: 'sw1', to: 'r1', toLabel: 'G0/0/1' },
          { from: 'adm', to: 'msw', style: 'dashed' },
          { from: 'msw', to: 'cs', style: 'dashed' },
          { from: 'cs', to: 'r1', label: 'console', toLabel: 'CON', style: 'dashed' },
        ],
      },
    },
    options: [
      "Connect through CS1, which is cabled to R1's console port",
      "SSH to R1's G0/0/1 address from the admin PC through SW1",
      "HTTPS to R1's G0/0/1 address from the admin PC through SW1",
      "Telnet to R1's G0/0/1 address from the admin PC through SW1",
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "The inbound ACL on G0/0/1 drops every packet arriving from SW1, including SSH, HTTPS and Telnet sessions destined to R1 itself, so every **in-band** option fails regardless of the protocol. CS1 reaches R1 through its **console port**, an out-of-band path that does not depend on any interface ACL or IP routing on R1.",
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Security policy requires the web GUI of R1 to be reachable only over an encrypted connection. Which command should the engineer enter?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip http
ip http server
ip http authentication local
ip http secure-server`,
    },
    options: ['`no ip http server`', '`no ip http secure-server`', '`ip http authentication aaa`', '`transport input ssh`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Both servers are enabled. `no ip http server` removes plain HTTP on TCP 80 and leaves HTTPS on TCP 443. Removing the secure server would leave only the unencrypted one, changing the authentication method does not add encryption, and `transport input ssh` is a VTY line command that does not affect the web server.',
  },
  {
    id: 'e10',
    type: 'categorize',
    stem: 'Classify each device by its management model.',
    categories: ['Per-device', 'Controller-managed', 'Cloud-managed'],
    items: [
      { text: 'Autonomous AP configured through its own web GUI', category: 0 },
      { text: 'ISR router configured over SSH', category: 0 },
      { text: 'Lightweight AP joined to a Catalyst 9800 WLC', category: 1 },
      { text: 'Campus switches provisioned by Catalyst Center', category: 1 },
      { text: 'Meraki MR access point', category: 2 },
      { text: 'Meraki MS switch claimed in the dashboard', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Devices configured one at a time (autonomous AP, router over SSH) are **per-device**. An on-premises controller pushing configuration (WLC for lightweight APs, Catalyst Center for switches) is **controller-managed**. Meraki devices are configured from a vendor-hosted dashboard, which makes them **cloud-managed**.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements about Cisco Meraki cloud-managed devices are true? (Choose two.)',
    options: [
      'Administrators configure the devices through a web dashboard hosted in the cloud',
      'User data traffic is forwarded locally and does not pass through the cloud',
      'Each device must first be configured through its console port',
      'The devices stop forwarding traffic if the connection to the cloud is lost',
      'An on-premises WLC is required to manage Meraki access points',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Meraki keeps the **management plane** in the cloud dashboard, while the data plane stays on site. Devices are claimed in the dashboard and configure themselves once they reach the cloud, with no console work needed. If the cloud is unreachable they keep forwarding with their last configuration, and Meraki MR APs need no on-premises WLC.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer is preparing a new router for SSH access. What must the engineer do first so that the command succeeds?',
    exhibit: {
      kind: 'cli',
      text: `Router(config)# crypto key generate rsa modulus 2048
% Please define a hostname other than Router.`,
    },
    options: [
      'Configure a hostname with the `hostname` command',
      'Enable SSH version 2 with `ip ssh version 2`',
      'Configure `transport input ssh` on the VTY lines',
      'Create a local user with `username admin secret`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The key pair is named hostname.domain, so IOS refuses to generate it while the hostname is still the default. After setting the hostname, a domain name is also required. SSH version, VTY transport and local users matter for a working SSH login but are not prerequisites for key generation.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. Which command ensures that R1 accepts only the secure SSH version?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ssh
SSH Enabled - version 1.99
Authentication timeout: 120 secs; Authentication retries: 3`,
    },
    options: [
      '`ip ssh version 2`',
      '`crypto key generate rsa modulus 1024`',
      '`transport input ssh`',
      '`ip ssh authentication-retries 2`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Version **1.99** means the server accepts both SSHv1 and SSHv2. `ip ssh version 2` restricts it to SSHv2. Regenerating keys does not change the accepted version, `transport input ssh` blocks Telnet but still allows SSHv1, and reducing retries only limits password guesses.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'A remote branch router has a modem attached so that engineers can dial in when the WAN is down. Which router port is traditionally used for the modem?',
    options: ['AUX port', 'Console port', 'GigabitEthernet0/0/0', 'USB storage port'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The **AUX** (auxiliary) port was designed for an external modem, providing dial-in out-of-band access to `line aux 0`. The console port expects a directly connected terminal, a routed Ethernet interface depends on the network that has failed, and the USB storage port is for files.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which three configuration actions harden remote management access to a switch? (Choose three.)',
    options: [
      'Configure `transport input ssh` on all VTY lines',
      'Apply an `access-class` ACL that permits only the management subnet to all VTY lines',
      'Disable the HTTP server with `no ip http server`',
      'Configure `transport input telnet ssh` to keep a backup access method',
      'Place the management SVI in VLAN 1 with the user ports',
      'Configure `exec-timeout 0 0` on the VTY lines and the console',
    ],
    answers: [0, 1, 2],
    difficulty: 3,
    explanation:
      'SSH-only VTY lines, an `access-class` restricting sources, and removing the clear-text HTTP server all shrink the attack surface. Allowing Telnet as a backup reintroduces clear-text credentials, VLAN 1 is the default VLAN on every port and the easiest for attackers to reach, and `exec-timeout 0 0` disables idle timeouts so forgotten sessions stay open.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'By default, after how many minutes of inactivity does IOS disconnect an idle console or VTY session? (Enter the number.)',
    answers: ['10', '10 minutes'],
    placeholder: 'minutes',
    difficulty: 1,
    explanation:
      'The default is `exec-timeout 10 0`: **10 minutes** and 0 seconds. `exec-timeout 0 0` disables the timeout, which is common in labs but a security risk in production.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. SW1 is a Layer 2 switch. Administrators in 10.99.0.0/24 can SSH to SW1, but administrators in 10.50.0.0/24 cannot, although routing between the two subnets works for other traffic. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config | begin interface Vlan99
interface Vlan99
 ip address 10.99.0.11 255.255.255.0
!
ip forward-protocol nd
no ip http server
ip http secure-server
!
ip ssh version 2
!
line con 0
 login local
line vty 0 4
 login local
 transport input ssh
line vty 5 15
 login local
 transport input ssh
!
end`,
    },
    options: [
      'SW1 has no default gateway configured',
      'The VTY lines permit only SSH',
      'SSH version 2 blocks connections from remote subnets',
      'The HTTP server is disabled',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A Layer 2 switch needs `ip default-gateway` to send its own replies off-subnet. Without it, SW1 answers hosts in 10.99.0.0/24 but cannot return traffic to 10.50.0.0/24. SSH-only VTY lines and SSHv2 do not care about the source subnet, and the HTTP server has nothing to do with SSH.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two protocols send administrator credentials across the network in clear text? (Choose two.)',
    options: ['Telnet', 'HTTP', 'SSHv2', 'HTTPS', 'SNMPv3 with authPriv'],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      '**Telnet** sends every keystroke in clear text, and **HTTP** basic authentication only Base64-encodes the credentials, which anyone can decode. SSHv2 and HTTPS encrypt the session, and SNMPv3 with authPriv both authenticates and encrypts its messages.',
  },
  {
    id: 'e19',
    type: 'input',
    stem: 'Which line configuration command allows only SSH connections on the VTY lines?',
    answers: ['transport input ssh'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`transport input ssh` under `line vty` refuses Telnet and every other protocol. `transport input telnet ssh` would still allow Telnet, and `transport input none` would block remote access entirely.',
  },
  {
    id: 'e20',
    type: 'order',
    stem: 'Put the phases of an SSH session to a router in order.',
    items: [
      'TCP three-way handshake to port 22',
      'SSH protocol version exchange',
      'Diffie-Hellman key exchange and server host-key verification',
      'User authentication with a password or public key',
      'Encrypted EXEC shell session',
    ],
    difficulty: 2,
    explanation:
      'SSH first needs a TCP connection to port 22, then both sides agree on the protocol version, derive session keys with Diffie-Hellman while the client verifies the host key, and only then authenticate the user inside the encrypted channel. The shell starts last, which is why the password is never exposed.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'An organization with 200 switches wants administrators to log in with their Active Directory credentials, each command to be authorized individually, and every command to be logged centrally. Which solution meets all requirements?',
    options: [
      'Configure the switches as TACACS+ clients of Cisco ISE, which checks Active Directory',
      'Configure the switches as RADIUS clients of Cisco ISE, which checks Active Directory',
      'Create identical local usernames on every switch and send logs to a syslog server',
      'Enable 802.1X on the VTY lines of every switch',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**TACACS+** separates authorization from authentication, so ISE can authorize each command and log it through accounting, while ISE validates the passwords against Active Directory. RADIUS cannot authorize individual commands, local usernames defeat central AD credentials, and 802.1X controls network ports, not administrator CLI sessions.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Which statement describes controller-managed lightweight access points?',
    options: [
      'The WLC pushes the WLAN configuration to the APs over CAPWAP',
      'Each AP must be configured individually through its console port',
      'The APs download their configuration from the Meraki dashboard',
      'The APs are configured over SSH by a TACACS+ server',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Lightweight APs join a **WLC** over CAPWAP and receive all their WLAN settings from it, so administrators configure the controller once. Per-AP console configuration describes autonomous APs, the Meraki dashboard manages Meraki APs rather than WLC-joined ones, and a TACACS+ server authenticates administrators but does not configure devices.',
  },
];

export default exam;
