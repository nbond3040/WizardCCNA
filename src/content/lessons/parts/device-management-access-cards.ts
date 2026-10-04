import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'In-band management', back: 'Management traffic uses the **same links, interfaces and VLANs** as user data. Lost when the production network fails.' },
  { id: 'f2', front: 'Out-of-band (OOB) management', back: 'A **separate path**: console server, dedicated management network or ports, AUX modem. Works when production is down.' },
  { id: 'f3', front: 'Default console settings', back: '**9600 bps, 8 data bits, no parity, 1 stop bit**, no flow control (9600 8N1).' },
  { id: 'f4', front: 'Cable for an RJ-45 console port', back: 'A **rollover** (console) cable to DB-9 or a USB serial adapter; newer devices also offer a USB console port.' },
  { id: 'f5', front: 'AUX port', back: 'Legacy router port for an external **modem** (dial-in OOB access); configured under `line aux 0`.' },
  { id: 'f6', front: 'Telnet port and security', back: '**TCP 23**; everything, including passwords, in clear text.' },
  { id: 'f7', front: 'SSH port and security', back: '**TCP 22**; encrypted session. Use SSH version 2.' },
  { id: 'f8', front: 'HTTP port', back: '**TCP 80**, clear text. Enabled on IOS with `ip http server`.' },
  { id: 'f9', front: 'HTTPS port', back: '**TCP 443**, TLS-encrypted. Enabled on IOS with `ip http secure-server`.' },
  { id: 'f10', front: '`ip http server`', back: 'Enables the plain **HTTP** web server (TCP 80). Disable it with `no ip http server`.' },
  { id: 'f11', front: '`ip http secure-server`', back: 'Enables the **HTTPS** web server (TCP 443); IOS creates a self-signed certificate if none is configured.' },
  { id: 'f12', front: 'Prerequisites for generating RSA keys for SSH', back: 'A non-default **hostname** and a **domain name** (`ip domain name`).' },
  { id: 'f13', front: '`crypto key generate rsa modulus 2048`', back: 'Creates the RSA key pair (host key) and enables the SSH server. SSHv2 needs at least 768 bits.' },
  { id: 'f14', front: '`ip ssh version 2`', back: 'Accept only SSHv2; without it IOS shows version **1.99** (v1 and v2 both accepted).' },
  { id: 'f15', front: '`transport input ssh`', back: 'Line command: the VTY lines accept **only SSH**, so Telnet is refused.' },
  { id: 'f16', front: '`access-class NAME in` (line vty)', back: 'Filters which **source addresses** may open Telnet/SSH sessions to the device.' },
  { id: 'f17', front: 'Default `exec-timeout`', back: '**10 minutes** (`exec-timeout 10 0`); `exec-timeout 0 0` disables it.' },
  { id: 'f18', front: 'Managing a Layer 2 switch remotely', back: 'SVI in a management VLAN (`interface vlan 99` + IP) and `ip default-gateway`.' },
  { id: 'f19', front: '`ip default-gateway`', back: 'Gateway used by a Layer 2 switch (no `ip routing`) for its **own** management traffic to other subnets.' },
  { id: 'f20', front: 'Why not VLAN 1 for management?', back: 'VLAN 1 is the default on every port and trunk, so it is the easiest VLAN for an attacker to reach.' },
  { id: 'f21', front: 'Cloud-managed devices', back: 'Configured and monitored from a vendor-hosted dashboard, e.g. **Cisco Meraki**; user traffic stays local.' },
  { id: 'f22', front: 'Meraki device loses its cloud connection', back: 'Keeps forwarding traffic with its **last configuration**; changes wait until connectivity returns.' },
  { id: 'f23', front: 'Controller-managed devices', back: 'An on-premises controller pushes configuration, e.g. a **WLC** for lightweight APs (CAPWAP) or Catalyst Center.' },
  { id: 'f24', front: '`show ip ssh`', back: 'Shows whether SSH is enabled, the **version**, the authentication timeout and retries.' },
  { id: 'f25', front: 'IOS SSH defaults: authentication timeout and retries', back: '**120 seconds** and **3** retries (`ip ssh time-out`, `ip ssh authentication-retries`).' },
  { id: 'f26', front: '`login block-for 120 attempts 3 within 60`', back: 'Blocks all logins for 120 s after 3 failed attempts within 60 s (brute-force protection).' },
  { id: 'f27', front: '`ip http authentication local`', back: 'Web GUI logins use the local username database; `aaa` would use AAA method lists instead.' },
  { id: 'f28', front: 'Preferred AAA protocol for administrator logins', back: '**TACACS+**: per-command authorization, command accounting and full-payload encryption.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which transport protocol and port does SSH use?',
    options: ['TCP 22', 'TCP 23', 'UDP 22', 'TCP 443'],
    answer: 0,
    difficulty: 1,
    explanation:
      'SSH uses **TCP 22**. TCP 23 is Telnet, TCP 443 is HTTPS, and SSH never runs over UDP.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two are examples of out-of-band management? (Choose two.)',
    options: [
      'A console server cabled to the console ports of the routers',
      'A dedicated management network connected to management Ethernet ports',
      'SSH to a switch SVI in the user data VLAN from the admin PC',
      'HTTPS to a router LAN interface that also forwards user traffic',
      'SNMP polling of router interfaces across the production WAN',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'Out-of-band paths are separate from the production network: a **console server** and a **dedicated management network** keep working when production links fail. SSH, HTTPS or SNMP over interfaces that also carry user traffic are in-band.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Which global configuration command enables the HTTPS web server on a Cisco IOS router?',
    answers: ['ip http secure-server'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip http secure-server` enables HTTPS on TCP 443. `ip http server` enables plain HTTP on TCP 80 and should be disabled with `no ip http server`.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each management protocol to its default port.',
    pairs: [
      { left: 'Telnet', right: 'TCP 23' },
      { left: 'SSH', right: 'TCP 22' },
      { left: 'HTTP', right: 'TCP 80' },
      { left: 'HTTPS', right: 'TCP 443' },
    ],
    difficulty: 1,
    explanation:
      'Telnet 23 and HTTP 80 are the clear-text protocols; SSH 22 and HTTPS 443 are their encrypted replacements for CLI and GUI access.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'Besides a non-default hostname, what must be configured before `crypto key generate rsa` succeeds?',
    options: ['A domain name', 'An enable secret', 'A VTY access-class ACL', 'An SNMP community'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The RSA key pair is named after the **hostname and domain name**, so both must exist first (`ip domain name corp.example`). The enable secret, VTY ACLs and SNMP are unrelated to key generation.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A branch with Meraki MX, MS and MR devices loses its connection to the Meraki cloud. What happens to user traffic at the branch?',
    options: [
      'It keeps flowing using the last configuration received from the dashboard',
      'It stops until the devices reconnect to the cloud',
      'It is redirected through a backup cloud data center',
      'Only wireless traffic stops, because MR APs need the cloud to forward frames',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Only the **management plane** lives in the Meraki cloud. The devices keep forwarding with their last configuration; administrators simply cannot make changes until the connection returns. User traffic never passes through the cloud.',
  },
  {
    id: 'q7',
    type: 'categorize',
    stem: 'Classify each protocol as encrypted or clear text.',
    categories: ['Encrypted', 'Clear text'],
    items: [
      { text: 'SSHv2', category: 0 },
      { text: 'HTTPS', category: 0 },
      { text: 'Telnet', category: 1 },
      { text: 'HTTP', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'SSHv2 and HTTPS (TLS) encrypt the session including credentials. Telnet and HTTP send credentials and data in clear text; HTTP basic authentication is only Base64-encoded.',
  },
];
