import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which AAA function determines which commands an authenticated administrator is allowed to run on a router?',
    options: ['Authentication', 'Authorization', 'Accounting', 'Auditing'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**Authorization** decides what an identity may do after it has been proven: privilege level, permitted commands, VLAN or ACL. Authentication only proves who the user is, and accounting records what the user did (it can log commands but does not permit or deny them). Auditing is not one of the three As.',
  },
  {
    id: 'e2',
    type: 'multi',
    stem: 'Which two statements describe RADIUS? (Choose two.)',
    options: [
      'It uses UDP ports 1812 and 1813',
      'It encrypts the entire body of each packet',
      'It returns authorization attributes in the Access-Accept message',
      'It uses TCP port 49',
      'It supports per-command authorization of administrator sessions',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'RADIUS runs over **UDP 1812** (authentication) and **1813** (accounting) and combines authentication with authorization: the **Access-Accept** already carries attributes such as a VLAN or ACL. Encrypting the entire body, TCP port 49 and per-command authorization are TACACS+ characteristics; RADIUS hides only the User-Password attribute.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. The TACACS+ server at 10.10.10.5 is reachable and returns an authentication FAIL for user **bob**, who has no account on the server. What happens when bob opens an SSH session to R1 and enters the password LocalPa55?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# username bob privilege 15 secret LocalPa55
R1(config)# aaa new-model
R1(config)# tacacs server ISE-TAC
R1(config-server-tacacs)# address ipv4 10.10.10.5
R1(config-server-tacacs)# key TacKey49
R1(config-server-tacacs)# exit
R1(config)# aaa authentication login default group tacacs+ local`,
    },
    options: [
      'Authentication fails because the TACACS+ server rejected bob',
      'R1 authenticates bob against its local database after the server rejects him',
      'R1 authenticates bob locally because local accounts are always checked first',
      'R1 grants access with the VTY line password because bob is unknown to the server',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'IOS tries the next method in a list only when the current method returns an **error**, such as no server responding. Here the server answered with FAIL, and a reject is final, so the login fails even though bob exists locally. The local database would be used only if 10.10.10.5 were unreachable. Methods are tried in the listed order (local is second, not first), and with AAA enabled the line password is not part of this list.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The only TACACS+ server becomes unreachable. An administrator then tries to log in to R1 over SSH with the local account **admin**. What is the result?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# username admin privilege 15 secret Adm1nPa55
R1(config)# aaa new-model
R1(config)# tacacs server ISE-TAC
R1(config-server-tacacs)# address ipv4 10.10.10.5
R1(config-server-tacacs)# key TacKey49
R1(config-server-tacacs)# exit
R1(config)# aaa authentication login default group tacacs+`,
    },
    options: [
      'The login fails because the method list has no fallback method',
      'The login succeeds because IOS always falls back to local accounts',
      'The login succeeds because the default list applies only to the console',
      'The login succeeds with the enable secret after the server times out',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The `default` login list contains a single method, `group tacacs+`. When that method returns an error because the server is unreachable, IOS has no further method to try, so authentication fails: the classic AAA lockout. Appending `local` would let the admin account work. IOS never adds a local fallback on its own, the default list applies to every line including VTY, and the enable secret is used only if the `enable` method is listed.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each port or value to its use.',
    pairs: [
      { left: 'TCP 49', right: 'TACACS+' },
      { left: 'UDP 1812', right: 'RADIUS authentication and authorization' },
      { left: 'UDP 1813', right: 'RADIUS accounting' },
      { left: 'UDP 1645', right: 'Legacy RADIUS authentication port' },
      { left: 'EtherType 0x888E', right: 'EAPoL between supplicant and authenticator' },
    ],
    difficulty: 1,
    explanation:
      'TACACS+ is the only AAA protocol on TCP (port 49). RADIUS uses UDP 1812 for authentication and authorization and UDP 1813 for accounting; 1645/1646 are the pre-standard ports that older Cisco devices still use by default. EAPoL is not carried in IP at all: it is identified by EtherType 0x888E inside the Ethernet frame.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Which protocols are used on link A and link B during 802.1X authentication of PC1?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.2,
        nodes: [
          { id: 'pc', icon: 'laptop', label: 'PC1', sub: 'supplicant', x: 1.2, y: 1.6 },
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'authenticator', x: 5, y: 1.6 },
          { id: 'ise', icon: 'server', label: 'ISE', sub: 'authentication server', x: 8.8, y: 1.6 },
        ],
        links: [
          { from: 'pc', to: 'sw', label: 'Link A', toLabel: 'Gi1/0/5' },
          { from: 'sw', to: 'ise', label: 'Link B' },
        ],
      },
    },
    options: ['A: EAPoL, B: RADIUS', 'A: RADIUS, B: EAPoL', 'A: EAPoL, B: TACACS+', 'A: RADIUS, B: RADIUS'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Between the supplicant and the authenticator, EAP is carried in **EAPoL** frames at Layer 2, because PC1 has no IP connectivity until the port is authorized. SW1 relays the same EAP messages to ISE inside **RADIUS** packets (UDP 1812). The supplicant never speaks RADIUS, and TACACS+ cannot carry EAP, so it plays no role in 802.1X.',
  },
  {
    id: 'e7',
    type: 'order',
    stem: 'Put the steps of a successful wired 802.1X authentication in order.',
    items: [
      'The endpoint connects and the switch port is in the unauthorized state',
      'The switch sends an EAP-Request/Identity in an EAPoL frame',
      'The supplicant replies with an EAP-Response/Identity',
      'The switch forwards the identity to ISE in a RADIUS Access-Request',
      'ISE returns a RADIUS Access-Accept',
      'The switch sends EAP-Success and moves the port to the authorized state',
    ],
    difficulty: 2,
    explanation:
      'The port starts unauthorized and passes only EAPoL. The authenticator asks for the identity, the supplicant answers, and the switch wraps the answer in RADIUS for the server. After the EAP method completes, the server sends Access-Accept, and only then does the switch send EAP-Success and authorize the port. Opening the port before the Access-Accept would defeat the purpose of 802.1X.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'A company wants every command that network engineers type on its routers to be individually approved by a central server and logged. The entire payload between the routers and the server must be encrypted. Which protocol meets these requirements?',
    options: ['RADIUS', 'TACACS+', 'LDAP', 'EAPoL'],
    answer: 1,
    difficulty: 2,
    explanation:
      '**TACACS+** separates authorization from authentication, so the router can ask the server to authorize each command, and accounting can log every command. It also encrypts the whole body of each packet over TCP 49. RADIUS cannot authorize individual commands and hides only the password. LDAP is a directory protocol that ISE may query as an identity store, not the protocol between router and AAA server, and EAPoL only carries 802.1X traffic on the access link.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Drag each characteristic to the protocol it describes.',
    categories: ['RADIUS', 'TACACS+'],
    items: [
      { text: 'Uses UDP', category: 0 },
      { text: 'Uses TCP port 49', category: 1 },
      { text: 'Encrypts only the password', category: 0 },
      { text: 'Encrypts the entire packet body', category: 1 },
      { text: 'Combines authentication and authorization', category: 0 },
      { text: 'Separates authentication, authorization and accounting', category: 1 },
      { text: 'Carries EAP for 802.1X', category: 0 },
      { text: 'Supports per-command authorization', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'RADIUS is the open, UDP-based protocol that hides only the User-Password, returns authorization data in the Access-Accept and carries EAP for 802.1X. TACACS+ uses TCP 49, encrypts the whole body and keeps the three As separate, which is what makes per-command authorization possible. A common mistake is to assume both encrypt the full packet.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'A network printer is connected to a switch port configured for 802.1X. The printer has no 802.1X supplicant. Which feature allows the switch to authenticate the printer through ISE?',
    options: [
      'MAC Authentication Bypass (MAB)',
      'Web authentication',
      'EAP-TLS',
      'Port security with sticky MAC addresses',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "**MAB** uses the endpoint's MAC address as its identity: the switch learns the MAC from the printer's first frame and sends it to ISE in a RADIUS Access-Request. Web authentication needs a person with a browser, EAP-TLS needs a supplicant with a certificate, and port security limits MAC addresses locally on the switch without consulting any AAA server.",
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer configured SW1 for 802.1X, but authentication never starts on any port. Which command must be added?',
    exhibit: {
      kind: 'cli',
      text: `SW1(config)# aaa new-model
SW1(config)# radius server ISE-RAD
SW1(config-radius-server)# address ipv4 10.10.10.5 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key R@diusKey
SW1(config-radius-server)# exit
SW1(config)# aaa authentication dot1x default group radius
SW1(config)# interface GigabitEthernet1/0/5
SW1(config-if)# switchport mode access
SW1(config-if)# authentication port-control auto
SW1(config-if)# dot1x pae authenticator`,
    },
    options: [
      '`dot1x system-auth-control`',
      '`aaa authentication login default group radius`',
      '`authentication port-control force-authorized`',
      '`radius-server host 10.10.10.5`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`dot1x system-auth-control` is the global command that enables 802.1X on the switch; the interface commands have no effect without it. A login method list controls CLI logins, not 802.1X. `force-authorized` would turn authentication off on the port (it is the default state). The RADIUS server is already defined in the `radius server` submode, so the legacy `radius-server host` command adds nothing.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'What is the role of the authenticator in an 802.1X deployment?',
    options: [
      'It relays EAP between the supplicant and the RADIUS server and controls the port',
      'It checks the user credentials against Active Directory or a local user database',
      'It runs on the endpoint and submits the user credentials to the switch',
      'It issues the client certificates that supplicants present during EAP-TLS',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The authenticator (switch or WLC) translates EAPoL from the supplicant into RADIUS toward the server and opens or keeps closed the port based on the answer. Validating credentials against Active Directory is the authentication server, submitting credentials is the supplicant, and issuing certificates is the job of a certificate authority.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'An engineer must ensure that administrators can still log in to R1 if every TACACS+ server becomes unreachable. Which two actions accomplish this? (Choose two.)',
    options: [
      'Add `local` as the last method in the login method list',
      'Configure a local username with a strong secret on R1',
      'Place `local` as the first method in the login method list',
      'Configure `aaa accounting exec default start-stop group tacacs+`',
      'Configure the same TACACS+ key on R1 and on the server',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A fallback needs both parts: the method list must end with `local`, and the local database must actually contain an account. Putting `local` first would check local accounts before the servers on every login, defeating centralized control. Accounting only records sessions, and a matching key is required for normal TACACS+ operation but does nothing when the servers are unreachable.',
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which three messages can a RADIUS server send in reply to an Access-Request? (Choose three.)',
    options: ['Access-Accept', 'Access-Reject', 'Access-Challenge', 'Accounting-Response', 'EAPoL-Start'],
    answers: [0, 1, 2],
    difficulty: 2,
    explanation:
      'An Access-Request is answered with **Access-Accept** (success, plus authorization attributes), **Access-Reject** (failure) or **Access-Challenge** (the server needs more information, as in every EAP round trip). Accounting-Response answers an Accounting-Request on UDP 1813, and EAPoL-Start is sent by a supplicant to the authenticator, never by a RADIUS server.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. Wireless clients authenticate with WPA2-Enterprise (802.1X). AP1 is a lightweight AP in local mode. Which device acts as the 802.1X authenticator?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.2,
        nodes: [
          { id: 'cl', icon: 'laptop', label: 'Client', x: 0.9, y: 1.6 },
          { id: 'ap', icon: 'ap', label: 'AP1', sub: 'local mode', x: 3.3, y: 1.6 },
          { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 6, y: 1.6 },
          { id: 'ise', icon: 'server', label: 'ISE', sub: 'RADIUS server', x: 8.9, y: 1.6 },
        ],
        links: [
          { from: 'cl', to: 'ap', style: 'wireless', label: 'WPA2-Enterprise' },
          { from: 'ap', to: 'wlc', style: 'dashed', label: 'CAPWAP' },
          { from: 'wlc', to: 'ise' },
        ],
      },
    },
    options: ['WLC1', 'AP1', 'ISE', 'The wireless client'],
    answer: 0,
    difficulty: 3,
    explanation:
      "With lightweight APs in local mode, AP1 tunnels the client's EAPoL frames inside CAPWAP to the controller, and **WLC1** is the RADIUS client that talks to ISE, so WLC1 is the authenticator. AP1 only relays frames in this design (an autonomous AP would be the authenticator itself). ISE is the authentication server, and the client runs the supplicant.",
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Which TCP port does TACACS+ use? (Enter the number.)',
    answers: ['49', 'tcp 49', 'tcp/49'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'TACACS+ uses **TCP port 49**. RADIUS uses UDP 1812/1813 (legacy 1645/1646). Being TCP-based lets the device detect an unreachable server quickly when the connection cannot be opened.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. How is a user who connects to the console port of R1 authenticated?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# aaa new-model
R1(config)# aaa authentication login VTY-AUTH group tacacs+ local
R1(config)# aaa authentication login default local
R1(config)# line vty 0 4
R1(config-line)# login authentication VTY-AUTH`,
    },
    options: [
      'Against the local username database only',
      'Against the TACACS+ servers, then the local database',
      'With the console line password',
      'Without any authentication',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A named method list is used only on the lines where it is applied with `login authentication`. The console has no named list, so it uses the **default** list, which contains only `local`. TACACS+ applies to VTY sessions only. With AAA enabled, a line password is used only if the `line` method appears in a list, and the console is not left open because a default list exists.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer captured this packet between an access switch and ISE. Which statement about it is true?',
    exhibit: {
      kind: 'cli',
      text: `Internet Protocol Version 4, Src: 10.1.1.2, Dst: 10.10.10.5
User Datagram Protocol, Src Port: 49152, Dst Port: 1812
    Code: Access-Request (1)
    Packet identifier: 0x2a (42)
    Attribute Value Pairs
        AVP: t=User-Name(1) l=7 val=alice
        AVP: t=User-Password(2) l=18 val=Encrypted
        AVP: t=NAS-IP-Address(4) l=6 val=10.1.1.2
        AVP: t=NAS-Port(5) l=6 val=50105`,
    },
    options: [
      'It is a RADIUS request, and only the User-Password attribute is hidden',
      'It is a TACACS+ request, and the entire body is encrypted except the password',
      'It is an EAPoL frame sent by the supplicant to the switch',
      'It is a RADIUS accounting record for the session of alice',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'UDP destination port 1812 and the Access-Request code identify a **RADIUS** authentication request. The user name and NAS attributes are readable because RADIUS hides only the User-Password. TACACS+ uses TCP 49 and would hide the whole body, EAPoL is a Layer 2 frame with no IP or UDP header, and accounting uses Accounting-Request messages on UDP 1813.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements about 802.1X are true? (Choose two.)',
    options: [
      'Before authentication, the port forwards only EAPoL, CDP and STP traffic',
      'The authenticator relays EAP messages between the supplicant and the authentication server',
      'The supplicant sends its credentials directly to the RADIUS server on UDP 1812',
      'The supplicant must obtain an IP address through DHCP before 802.1X can start',
      'TACACS+ is used between the authenticator and the authentication server',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'An unauthorized port passes only EAPoL (plus CDP and STP), and the authenticator relays EAP between EAPoL and RADIUS. The supplicant never talks to the RADIUS server directly and does not need an IP address, because EAPoL is a pure Layer 2 protocol; DHCP happens only after the port is authorized. RADIUS, not TACACS+, is used toward the server.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Classify each event as authentication, authorization or accounting.',
    categories: ['Authentication', 'Authorization', 'Accounting'],
    items: [
      { text: 'An admin enters a username and password at an SSH prompt', category: 0 },
      { text: 'A laptop presents a certificate during EAP-TLS', category: 0 },
      { text: 'ISE assigns an employee to VLAN 30 after login', category: 1 },
      { text: 'A help-desk user is limited to privilege level 5', category: 1 },
      { text: 'ISE logs that admin1 ran `reload` at 14:02', category: 2 },
      { text: 'A stop record shows a VPN session lasted 3 hours', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Proving identity with a password or certificate is **authentication**. Deciding what the identity receives or may do (a VLAN, a privilege level) is **authorization**. Recording what happened (a command, a session duration) is **accounting**. The VLAN case is tempting as authentication, but it happens only after identity is proven.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Which Cisco product is commonly deployed as a centralized AAA server that supports both RADIUS and TACACS+?',
    options: ['Cisco ISE', 'Cisco Catalyst Center (DNA Center)', 'Cisco Umbrella', 'Cisco Secure Firewall'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Cisco Identity Services Engine (ISE)** is the Cisco AAA and policy server; it answers RADIUS for network access and TACACS+ for device administration. Catalyst Center is a network controller and management platform, Umbrella is a cloud DNS-layer security service, and Secure Firewall is a firewall that acts as an AAA client, not the server.',
  },
  {
    id: 'e22',
    type: 'input',
    stem: 'Complete the command so that logins on all lines are authenticated by the TACACS+ servers and fall back to the local database only if no server responds: `aaa authentication login default ________`',
    answers: ['group tacacs+ local'],
    placeholder: 'methods',
    difficulty: 2,
    explanation:
      'The complete command is `aaa authentication login default group tacacs+ local`. Methods are tried in order, and the local database is consulted only when the TACACS+ group returns an error. Reversing the order (`local group tacacs+`) would check the local database first.',
  },
];

export default exam;
