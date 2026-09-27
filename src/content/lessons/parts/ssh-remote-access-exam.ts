import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement correctly compares Telnet and SSH?',
    options: [
      'Telnet uses TCP 23 and sends everything in cleartext; SSH uses TCP 22 and encrypts the session',
      'Telnet uses TCP 22 and SSH uses TCP 23; both encrypt the password',
      'SSH uses UDP 22 for speed, while Telnet uses TCP 23 for reliability',
      'Both send commands in cleartext, but SSH encrypts the password',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Telnet runs on **TCP 23** and sends credentials, commands and output unencrypted. SSH runs on **TCP 22** and encrypts the entire session — not just the password — after authenticating the server. Neither protocol uses UDP, and the port numbers are never the other way round.',
  },
  {
    id: 'e2',
    type: 'order',
    stem: 'An administrator connects to a router with SSH. Put the phases of the connection in order.',
    items: [
      'The client opens a TCP connection to port 22',
      'Client and server exchange SSH protocol versions',
      'Key exchange creates the session keys, and the server proves its identity with its host key',
      'The user authenticates with a username and password',
      'Commands and output flow through the encrypted session',
    ],
    difficulty: 2,
    explanation:
      "SSH runs over TCP, so the three-way handshake to port 22 comes first. The two sides then agree on the protocol version and run a key exchange that produces the session keys and lets the client verify the server's host key — all before any credentials are sent. Only then does user authentication take place inside the encrypted channel, followed by the interactive session.",
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. What must the engineer configure before the RSA keys can be generated?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# crypto key generate rsa modulus 2048
% Please define a domain-name first.`,
    },
    options: [
      '`ip ssh version 2`',
      '`ip domain-name corp.example.com`',
      '`username admin secret N3tAdm1n2026`',
      '`transport input ssh` under the VTY lines',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      "The RSA key pair is named after the device's hostname and domain name (R1.corp.example.com), so IOS refuses to generate it until `ip domain-name` is configured — just as it refuses while the hostname is still the default Router. `ip ssh version 2` is entered after the keys exist, and the username and VTY settings are needed for logins, not for key generation.",
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'An engineer must allow only SSH sessions, and only from the management subnet permitted by standard ACL MGMT, on the VTY lines of R1. Which two commands under `line vty 0 15` accomplish this? (Choose two.)',
    options: [
      '`transport input ssh`',
      '`ip access-group MGMT in`',
      '`access-class MGMT in`',
      '`transport output ssh`',
      '`login`',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '`transport input ssh` makes the lines accept SSH only, and `access-class MGMT in` accepts sessions only from sources that MGMT permits. `ip access-group` is an interface command and is not available under the lines, `transport output` controls the protocols users may use for sessions from the router to other devices, and `login` selects line-password authentication without restricting protocols or sources.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. The security policy requires SSH-only access from the management subnet on every VTY line of R1. What should the engineer do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section line vty
line vty 0 4
 access-class MGMT in
 exec-timeout 5 0
 login local
 transport input ssh
line vty 5 15
 login local
 transport input all`,
    },
    options: [
      'Nothing, because lines 0 to 4 are always used before lines 5 to 15',
      'Apply `access-class MGMT in`, `exec-timeout 5 0` and `transport input ssh` to lines 5 to 15 as well, for example under `line vty 0 15`',
      'Add `transport input ssh` under interface GigabitEthernet0/0/0',
      'Replace `login local` with `login` on lines 5 to 15',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Lines 5 to 15 accept any protocol from any source, and they are used whenever lines 0 to 4 are busy — for example when someone opens several sessions at once — so they bypass the policy. Configuring all 16 lines together with `line vty 0 15` applies the same restrictions everywhere. Relying on line order is exactly the gap an attacker exploits, `transport input` is a line command rather than an interface command, and switching to `login` would only weaken authentication.',
  },
  {
    id: 'e6',
    type: 'match',
    stem: 'Match each command to the information it displays.',
    pairs: [
      { left: '`show ip ssh`', right: 'Whether SSH is enabled, its version and timers' },
      { left: '`show ssh`', right: 'Active SSH sessions with cipher and username' },
      { left: '`show users`', right: 'Who is logged in on the console and VTY lines' },
      { left: '`show crypto key mypubkey rsa`', right: "The device's RSA public key" },
      { left: '`show running-config | section line vty`', right: 'The VTY line configuration' },
    ],
    difficulty: 1,
    explanation:
      '`show ip ssh` reports the server status and version, `show ssh` lists live SSH sessions, `show users` lists every console and VTY session with its source, `show crypto key mypubkey rsa` displays the public key, and the filtered running-config shows how the lines are configured.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'From R2, which command opens an SSH session to 10.1.12.1 with the username admin?',
    answers: ['ssh -l admin 10.1.12.1', 'ssh -v 2 -l admin 10.1.12.1', 'ssh -l admin -v 2 10.1.12.1'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      'The IOS client syntax is `ssh -l admin 10.1.12.1` — `-l` supplies the login name, and `-v 2` can optionally force SSHv2. From a PC the usual form is `ssh admin@10.1.12.1`. `telnet 10.1.12.1` would open an unencrypted Telnet session instead.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. The security policy allows only SSH version 2. Which command should the engineer enter?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip ssh
SSH Enabled - version 1.99
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
<output omitted>`,
    },
    options: [
      '`crypto key generate rsa modulus 2048`',
      '`transport input ssh`',
      '`ip ssh version 2`',
      '`ip ssh authentication-retries 2`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Version **1.99** means the server accepts both SSHv1 and SSHv2, the default once keys of at least 768 bits exist. `ip ssh version 2` restricts it to SSHv2, after which `show ip ssh` reports version 2.0. Regenerating keys does not change the version setting, `transport input ssh` chooses SSH over Telnet but not the SSH version, and the retry count is unrelated.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each characteristic as belonging to Telnet or to SSH.',
    categories: ['Telnet', 'SSH'],
    items: [
      { text: 'Uses TCP port 23', category: 0 },
      { text: 'Sends usernames and passwords in cleartext', category: 0 },
      { text: 'A packet capture reveals every command typed', category: 0 },
      { text: 'Uses TCP port 22', category: 1 },
      { text: 'Encrypts the entire session', category: 1 },
      { text: 'Needs an RSA key pair on the IOS device', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'Telnet (TCP 23) sends everything in cleartext, so captures expose credentials and commands. SSH (TCP 22) encrypts the whole session, and on IOS it can run only after an RSA key pair has been generated.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. SSH to SW1 works from the management host in VLAN 99 but times out from the admin PC. R1 routes between both subnets. What is the cause?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'admin', icon: 'pc', label: 'Admin PC', sub: '10.1.10.25/24', x: 1.1, y: 2.4 },
          { id: 'r1', icon: 'router', label: 'R1', x: 4.1, y: 2.4 },
          { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Vlan99 10.1.99.11/24', x: 7.2, y: 2.4 },
          { id: 'mh', icon: 'pc', label: 'Mgmt host', sub: '10.1.99.50', x: 7.2, y: 4.3 },
        ],
        links: [
          { from: 'admin', to: 'r1', toLabel: 'G0/0/1 10.1.10.1' },
          { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0 10.1.99.1', toLabel: 'Gi0/1', label: 'VLAN 99' },
          { from: 'mh', to: 'sw1', fromLabel: 'NIC', toLabel: 'Fa0/5' },
        ],
        annotations: [{ x: 7.2, y: 0.8, text: 'SW1: SSH configured, no ip default-gateway', tone: 'bad' }],
      },
    },
    options: [
      'SW1 has no default gateway, so it cannot send replies to the 10.1.10.0/24 subnet',
      'SW1 needs `ip routing` to answer SSH sessions',
      'The admin PC must be in VLAN 99 to use SSH',
      'SW1 needs a second SVI in the 10.1.10.0/24 subnet',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A Layer 2 switch behaves like a host: to answer anything outside its own subnet, it needs `ip default-gateway 10.1.99.1`. The management host works because it is on the same subnet, while replies to 10.1.10.25 have nowhere to go. `ip routing` is a Layer 3 switch feature that would then require a default route instead, SSH works from any subnet with correct routing, and an extra SVI in the admin subnet is unnecessary once the gateway is set.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which line configuration command disconnects idle VTY sessions after 8 minutes?',
    answers: ['exec-timeout 8 0', 'exec-timeout 8'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`exec-timeout minutes [seconds]`: `exec-timeout 8 0` (or `exec-timeout 8`) closes sessions that stay idle for 8 minutes. The default is 10 minutes, and `exec-timeout 0 0` disables the timeout, which is a security risk.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. What is configured on the VTY lines of the device at 10.1.24.4?',
    exhibit: {
      kind: 'cli',
      text: `R2# telnet 10.1.24.4
Trying 10.1.24.4 ... Open


Password required, but none set

[Connection to 10.1.24.4 closed by foreign host]`,
    },
    options: [
      '`transport input ssh`',
      '`login` without a line password',
      '`login local` without any local usernames',
      'An `access-class` that denies R2',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The TCP session opened, so Telnet is allowed and no access-class blocked R2 — both of those would produce Connection refused. **Password required, but none set** appears when the lines have `login` (line-password authentication) but no `password` is configured, so IOS closes the session. With `login local`, the user would be prompted for a username instead.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'An administrator logs in to R5 over SSH, lands at the R5> prompt, types `enable` and receives "% No password set". What is the fix?',
    options: [
      'Configure `login local` on the console line',
      'Configure `ip ssh version 2`',
      'Configure `enable secret` with a strong password',
      'Configure `transport input ssh` on the VTY lines',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Remote users can enter privileged EXEC only if an enable secret (or enable password) exists; without one, IOS answers "% No password set". Configure `enable secret`, or give the account `privilege 15` so that it lands directly in privileged mode. The console settings, the SSH version and the transport setting do not affect enable authentication.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two statements about `crypto key generate rsa` are true? (Choose two.)',
    options: [
      'It is entered in line configuration mode under the VTY lines',
      "The key pair is named after the device's hostname and domain name",
      'A 512-bit key is sufficient for SSHv2',
      'SSHv2 requires a modulus of at least 768 bits',
      'It requires the enable secret to be configured first',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      '`crypto key generate rsa` is a global configuration command that creates a key pair labeled hostname.domain-name, so it needs a non-default hostname and `ip domain-name`. SSHv2 needs a modulus of at least **768** bits (2048 is the usual choice); a 512-bit key allows only SSHv1. No enable secret is needed to generate keys.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'Which TCP port does Telnet use?',
    answers: ['23', 'tcp 23', 'port 23'],
    placeholder: 'port',
    difficulty: 1,
    explanation: 'Telnet uses **TCP 23**; SSH uses TCP 22.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:41:07
*  1 vty 0     admin      idle                 00:00:00 10.1.12.2
   2 vty 1     netops     idle                 00:03:12 10.1.99.40

  Interface    User               Mode         Idle     Peer Address`,
    },
    options: [
      'Two remote users are logged in, and the command was entered from the session of admin, who connected from 10.1.12.2',
      'Three remote users are logged in over SSH',
      'netops is logged in on the console port',
      'admin has been idle for 41 minutes',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The asterisk marks the line running the command: **vty 0**, user admin, from 10.1.12.2. netops is a second remote user on vty 1 from 10.1.99.40. The console line shows no user and has been idle for 41 minutes. `show users` lists lines rather than protocols; use `show ssh` to confirm which sessions are SSH.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: "SSH is configured and working on R1. Its VTY lines have `access-class 10 in`, and `access-list 10 permit 10.1.99.0 0.0.0.255` is the only entry of ACL 10. Which two statements are true? (Choose two.)",
    options: [
      'An SSH attempt from 10.1.50.7 is refused before a login prompt appears',
      'Pings from 10.1.50.7 to R1 are dropped',
      'An administrator at 10.1.99.20 can open an SSH session and log in',
      'Traffic from 10.1.50.7 routed through R1 is dropped',
      'Telnet from 10.1.50.7 is still accepted, because access-class filters only SSH',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '`access-class` filters only sessions to the VTY lines, by source address: 10.1.99.20 matches the permit and can log in, while 10.1.50.7 hits the implicit deny and is refused before authentication. Pings and transit traffic are never checked by an access-class, and the filter applies to every protocol the lines accept, Telnet included.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. SSH connections to R3 are refused. Which command enables SSH?',
    exhibit: {
      kind: 'cli',
      text: `R3# show ip ssh
SSH Disabled - version 1.99
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).
<output omitted>
R3# show running-config | include hostname|domain
hostname R3
ip domain name corp.example.com`,
    },
    options: [
      '`ip ssh version 2`',
      '`transport input ssh`',
      '`hostname R3-core`',
      '`crypto key generate rsa modulus 2048`',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'SSH is **disabled** because no RSA key pair exists, while the hostname and domain name that key generation requires are already configured. `crypto key generate rsa modulus 2048` creates the keys and enables SSH at once. `ip ssh version 2` cannot take effect without keys, `transport input ssh` selects protocols on the lines but cannot start the SSH server, and the hostname is already non-default.',
  },
  {
    id: 'e19',
    type: 'order',
    stem: 'Put the steps to configure SSH on a new router in the recommended order.',
    items: [
      '`hostname R1`',
      '`ip domain-name corp.example.com`',
      '`crypto key generate rsa modulus 2048`',
      '`username admin secret N3tAdm1n2026`',
      '`ip ssh version 2`',
      '`line vty 0 15`, then `login local` and `transport input ssh`',
    ],
    difficulty: 2,
    explanation:
      'The hostname and domain name come first because the RSA key pair is named after them, and key generation enables SSH. The local user must exist before the lines rely on `login local`, `ip ssh version 2` restricts the server to SSHv2 once keys exist, and finally the VTY lines are set to authenticate locally and accept only SSH.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'An engineer configures `login local` and `transport input ssh` on all VTY lines of a new switch that already has RSA keys, but forgets to create any usernames. What happens when an administrator tries to connect with SSH?',
    options: [
      'The session is accepted without authentication',
      'The administrator can log in with the enable secret',
      'Authentication fails because there is no local account to match; someone must add a `username … secret …` from the console',
      'The switch falls back to the VTY line password',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      '`login local` authenticates only against the local username database. With no usernames defined, no credentials can succeed, so remote access is effectively locked out until someone adds a `username … secret …` entry from the console. IOS does not skip authentication, does not accept the enable secret as a login password and does not fall back to a line password when `login local` is configured.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Nobody can reach SW1 at 10.1.99.11, not even hosts in the management subnet. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show ip interface brief | include Vlan99
Vlan99                 10.1.99.11      YES manual up                    down
SW1# show vlan id 99
VLAN id 99 not found in current VLAN database`,
    },
    options: [
      'The SVI is administratively shut down',
      'VLAN 99 does not exist on SW1, so the SVI line protocol stays down',
      'SW1 has no default gateway',
      'SW1 has no RSA keys',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "An SVI's line protocol is up only when its VLAN exists and is active on at least one up port — an access port or a trunk that carries it. The output shows **up/down**, and VLAN 99 is missing from the VLAN database, so creating VLAN 99 (and carrying it toward the router) brings the SVI up. A shut SVI would show administratively down, a missing default gateway affects only other subnets, and missing RSA keys would not stop pings.",
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Which two statements about storing local passwords on Cisco IOS are true? (Choose two.)',
    options: [
      '`username admin secret …` stores the password as a one-way hash',
      '`enable password` takes precedence when both `enable password` and `enable secret` are configured',
      '`service password-encryption` applies only weak, reversible type 7 encoding to cleartext passwords',
      '`username admin password …` hashes the password with the strongest available algorithm',
      '`enable secret` is stored in cleartext unless `service password-encryption` is enabled',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '`secret` keywords store a one-way hash, while `password` keywords store cleartext that `service password-encryption` only obscures with reversible type 7 encoding. When both are configured, `enable secret` wins over `enable password`. Use `secret` for every local account and for the enable password.',
  },
];
