import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'AAA', back: '**Authentication, Authorization and Accounting**: who gets in, what they may do, and a record of what they did.' },
  { id: 'f2', front: 'Authentication', back: 'Proves **identity** (who are you?), e.g. username/password, certificate, token or MAC address.' },
  { id: 'f3', front: 'Authorization', back: 'Decides what an authenticated identity **may do**: privilege level, allowed commands, VLAN or ACL.' },
  { id: 'f4', front: 'Accounting', back: 'Records **what was done**: session start/stop times, commands entered, duration and bytes.' },
  { id: 'f5', front: 'RADIUS transport and ports', back: '**UDP 1812** (authentication + authorization) and **UDP 1813** (accounting). Legacy pair: 1645/1646.' },
  { id: 'f6', front: 'TACACS+ transport and port', back: '**TCP port 49**.' },
  { id: 'f7', front: 'What does RADIUS encrypt?', back: 'Only the **User-Password** attribute. The username and all other attributes are clear text.' },
  { id: 'f8', front: 'What does TACACS+ encrypt?', back: 'The **entire body** (payload) of every packet; only the 12-byte header is readable.' },
  { id: 'f9', front: 'AAA protocol that separates authentication, authorization and accounting', back: '**TACACS+**. Separate exchanges make per-command authorization possible.' },
  { id: 'f10', front: 'AAA protocol that combines authentication and authorization', back: '**RADIUS**: the Access-Accept already carries the authorization attributes.' },
  { id: 'f11', front: 'Best-fit use for TACACS+', back: '**Device administration**: admin CLI logins, per-command authorization and command accounting.' },
  { id: 'f12', front: 'Best-fit use for RADIUS', back: '**Network access**: 802.1X on switch ports, WPA2/WPA3-Enterprise Wi-Fi, remote-access VPN.' },
  { id: 'f13', front: 'Cisco ISE', back: '**Identity Services Engine**: Cisco AAA/policy server supporting both RADIUS and TACACS+.' },
  { id: 'f14', front: '`aaa new-model`', back: 'Enables AAA on IOS; logins then follow AAA method lists instead of line passwords.' },
  { id: 'f15', front: '`aaa authentication login default group tacacs+ local`', back: 'For all lines: try the TACACS+ servers; use the local user database only if no server responds.' },
  { id: 'f16', front: 'When does IOS try the next method in a method list?', back: 'Only when the current method returns an **error** (e.g. server unreachable), never after a reject (FAIL).' },
  { id: 'f17', front: 'Define a TACACS+ server (modern IOS syntax)', back: '`tacacs server NAME`, then `address ipv4 10.10.10.5` and `key SECRET`.' },
  { id: 'f18', front: 'Define a RADIUS server (modern IOS syntax)', back: '`radius server NAME`, then `address ipv4 10.10.10.5 auth-port 1812 acct-port 1813` and `key SECRET`.' },
  { id: 'f19', front: '802.1X supplicant', back: 'Client software on the endpoint that requests access and submits credentials.' },
  { id: 'f20', front: '802.1X authenticator', back: 'The switch (wired) or WLC (wireless) that controls the port and relays EAP between supplicant and server.' },
  { id: 'f21', front: '802.1X authentication server', back: 'The **RADIUS** server (e.g. Cisco ISE) that validates credentials and returns Accept or Reject.' },
  { id: 'f22', front: 'EAPoL', back: '**EAP over LAN**: carries EAP between supplicant and authenticator at Layer 2, EtherType `0x888E`.' },
  { id: 'f23', front: 'Traffic allowed on an unauthorized 802.1X port', back: 'Only **EAPoL** (plus CDP and STP) until authentication succeeds.' },
  { id: 'f24', front: 'MAB', back: '**MAC Authentication Bypass**: the switch sends the endpoint MAC to RADIUS as its identity. For devices without a supplicant.' },
  { id: 'f25', front: 'Web authentication (WebAuth)', back: 'The browser is redirected to a login portal (switch, WLC or ISE); typical for guests.' },
  { id: 'f26', front: 'Possible RADIUS replies to an Access-Request', back: '**Access-Accept**, **Access-Reject** or **Access-Challenge** (server needs more data, e.g. during EAP).' },
  { id: 'f27', front: '`dot1x system-auth-control`', back: 'Global command that enables 802.1X on a Catalyst switch.' },
  { id: 'f28', front: '`authentication port-control auto`', back: 'Enables 802.1X on the port: it starts unauthorized until authentication succeeds. Default is `force-authorized`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'A server log shows that admin1 entered `reload` on R1 at 14:02. Which AAA function produced this record?',
    options: ['Authentication', 'Authorization', 'Accounting', 'Auditing'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**Accounting** records what a user did, including individual commands and session times. Authentication only proved who admin1 was, and authorization decided whether `reload` was allowed. Auditing is not one of the three As.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two characteristics apply to TACACS+? (Choose two.)',
    options: [
      'Uses TCP port 49',
      'Encrypts the entire packet body',
      'Uses UDP ports 1812 and 1813',
      'Combines authentication and authorization in one reply',
      'Carries EAP messages for 802.1X',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'TACACS+ runs over **TCP 49** and encrypts the **whole body** of each packet. UDP 1812/1813, combined authentication and authorization, and carrying EAP for 802.1X are all RADIUS characteristics.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Which standard UDP port does RADIUS use for authentication? (Enter the number.)',
    answers: ['1812', 'udp 1812', 'udp/1812'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'RADIUS authentication and authorization use **UDP 1812**; accounting uses UDP 1813. Older Cisco devices default to the legacy pair 1645/1646, but 1812 is the standard port.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each 802.1X term to its description.',
    pairs: [
      { left: 'Supplicant', right: 'Laptop software that submits credentials' },
      { left: 'Authenticator', right: 'Access switch that controls the port' },
      { left: 'Authentication server', right: 'Cisco ISE answering RADIUS requests' },
      { left: 'EAPoL', right: 'Protocol between the endpoint and the switch' },
    ],
    difficulty: 1,
    explanation:
      'The **supplicant** runs on the endpoint, the **authenticator** (switch or WLC) controls access and relays EAP, and the **authentication server** (RADIUS, e.g. ISE) makes the decision. **EAPoL** carries EAP between the endpoint and the switch.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'Which command must be entered first to use AAA method lists on a Cisco IOS router?',
    options: ['`aaa new-model`', '`login local`', '`aaa authentication enable default local`', '`service password-encryption`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`aaa new-model` enables AAA; only then are `aaa authentication`, `aaa authorization` and `aaa accounting` commands available. `login local` is the non-AAA way to use local usernames on a line, and `service password-encryption` only obscures passwords in the configuration.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'R1 uses `aaa authentication login default group tacacs+ local`. The TACACS+ server is reachable and rejects the password of user sam, who also exists in the local database. What happens?',
    options: [
      'The login fails',
      'R1 retries the login against the local database',
      'R1 prompts for the enable secret',
      'R1 retries the server three times and then uses the local database',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS moves to the next method only when a method returns an **error**, such as no server responding. A reject (FAIL) from a reachable server is final, so the login fails even though sam exists locally.',
  },
  {
    id: 'q7',
    type: 'categorize',
    stem: 'Classify each feature as RADIUS or TACACS+.',
    categories: ['RADIUS', 'TACACS+'],
    items: [
      { text: 'UDP 1812/1813', category: 0 },
      { text: 'TCP 49', category: 1 },
      { text: 'Encrypts only the password', category: 0 },
      { text: 'Encrypts the whole payload', category: 1 },
      { text: 'Preferred for 802.1X network access', category: 0 },
      { text: 'Preferred for device administration', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'RADIUS: UDP, password-only encryption, network access (802.1X, Wi-Fi, VPN). TACACS+: TCP 49, full-payload encryption, device administration with per-command authorization.',
  },
];
