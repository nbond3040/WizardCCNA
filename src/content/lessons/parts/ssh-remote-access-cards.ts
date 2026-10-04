import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Telnet: port and security', back: '**TCP 23**; everything, including credentials, is sent in **cleartext**.' },
  { id: 'f2', front: 'SSH: port and security', back: '**TCP 22**; the session is encrypted and integrity-protected, and the server authenticates with a host key.' },
  { id: 'f3', front: 'SSH configuration order on IOS', back: '`hostname` → `ip domain-name` → `crypto key generate rsa` → `username … secret` → `ip ssh version 2` → VTY: `login local`, `transport input ssh`.' },
  { id: 'f4', front: 'Why are a hostname and domain name required for SSH?', back: 'The RSA key pair is named **hostname.domain-name**; IOS refuses to generate keys with the default hostname Router or without a domain name.' },
  { id: 'f5', front: '`crypto key generate rsa modulus 2048`', back: 'Generates a 2048-bit RSA key pair and **enables SSH** on the device.' },
  { id: 'f6', front: 'Minimum RSA modulus for SSHv2', back: '**768 bits** (2048 recommended). Smaller keys allow only SSHv1.' },
  { id: 'f7', front: '`ip ssh version 2`', back: 'Restricts the SSH server to SSHv2. Without it, the server runs version 1.99 (accepts v1 and v2).' },
  { id: 'f8', front: 'SSH version 1.99 in `show ip ssh`', back: 'The server accepts **both** SSHv1 and SSHv2 — the default once keys of 768+ bits exist.' },
  { id: 'f9', front: '`username admin secret …`', back: 'Creates a local account whose password is stored as a one-way hash; used by `login local`.' },
  { id: 'f10', front: '`login` vs `login local`', back: '`login` asks for the line password; `login local` asks for a username and password from the local database.' },
  { id: 'f11', front: '`transport input ssh`', back: 'The VTY lines accept SSH only; Telnet attempts are refused.' },
  { id: 'f12', front: '`transport input` options', back: '`ssh`, `telnet`, `ssh telnet` (both), `all`, `none`.' },
  { id: 'f13', front: '`exec-timeout 5 30`', back: 'Disconnects a session after 5 minutes 30 seconds idle. Default **10 minutes**; `exec-timeout 0 0` = never (insecure).' },
  { id: 'f14', front: '`access-class MGMT in` (line vty)', back: 'Accepts VTY sessions only from sources permitted by ACL MGMT; others are refused before the login prompt.' },
  { id: 'f15', front: '`line vty 0 15`', back: 'Configures all 16 VTY lines; the running-config shows them as `line vty 0 4` and `line vty 5 15`.' },
  { id: 'f16', front: '`show ip ssh`', back: 'SSH enabled or disabled, the version (1.99 or 2.0), the authentication timeout and retries.' },
  { id: 'f17', front: '`show ssh`', back: 'Active SSH sessions: version, direction, encryption, HMAC, state and username.' },
  { id: 'f18', front: '`show users`', back: 'Users on the console and VTY lines with idle time and source (Location); `*` marks your own session.' },
  { id: 'f19', front: 'Open an SSH session from IOS', back: '`ssh -l admin 10.1.12.1` (from a PC: `ssh admin@10.1.12.1`).' },
  { id: 'f20', front: 'Default SSH authentication timeout and retries', back: '**120 seconds** and **3** retries (`ip ssh time-out`, `ip ssh authentication-retries`).' },
  { id: 'f21', front: 'Remote management of a Layer 2 switch', back: 'An **SVI** with an IP address (`interface vlan 99`, `no shutdown`) plus `ip default-gateway` for other subnets.' },
  { id: 'f22', front: '`ip default-gateway` vs a default route', back: 'A Layer 2 switch uses `ip default-gateway`; a router or Layer 3 switch with `ip routing` uses `ip route 0.0.0.0 0.0.0.0 …`.' },
  { id: 'f23', front: 'Password required, but none set', back: 'The VTY lines use `login` but no `password` is configured, so IOS closes the session.' },
  { id: 'f24', front: '% No password set (at the enable prompt)', back: 'No enable secret exists, so remote users cannot enter privileged EXEC. Fix: `enable secret …` or a privilege 15 user.' },
  { id: 'f25', front: '`crypto key zeroize rsa`', back: 'Deletes the RSA key pair, which disables SSH.' },
  { id: 'f26', front: '`enable secret` vs `enable password`', back: '`enable secret` is stored as a hash and wins if both exist; `enable password` is stored in cleartext (or weak type 7).' },
  { id: 'f27', front: '`service password-encryption`', back: 'Obscures cleartext passwords in the config with weak, reversible **type 7** encoding; it does not affect `secret` hashes.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which TCP port does SSH use?',
    options: ['22', '23', '443', '3389'],
    answer: 0,
    difficulty: 1,
    explanation:
      'SSH uses **TCP 22**. Telnet uses TCP 23, HTTPS uses TCP 443 and Microsoft RDP uses TCP 3389.',
  },
  {
    id: 'q2',
    type: 'match',
    stem: 'Match each command to its purpose in an SSH configuration.',
    pairs: [
      { left: '`hostname R1`', right: 'Replaces the default name that blocks key generation' },
      { left: '`ip domain-name corp.example.com`', right: 'Supplies the domain part of the RSA key name' },
      { left: '`crypto key generate rsa modulus 2048`', right: 'Creates the key pair and enables SSH' },
      { left: '`ip ssh version 2`', right: 'Disables SSHv1' },
      { left: '`login local`', right: 'Authenticates VTY users against local usernames' },
    ],
    difficulty: 1,
    explanation:
      'The hostname and domain name form the key label (R1.corp.example.com), key generation enables the SSH server, `ip ssh version 2` removes SSHv1, and `login local` makes the lines check the local username database.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two commands must be configured before `crypto key generate rsa` succeeds on a new router? (Choose two.)',
    options: [
      '`hostname R1`',
      '`ip domain-name lab.local`',
      '`ip ssh version 2`',
      '`transport input ssh`',
      '`login local`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The key pair is named **hostname.domain-name**, so IOS needs a non-default hostname and a domain name first. `ip ssh version 2` is entered after the keys exist, and `transport input ssh` and `login local` are VTY line settings that do not affect key generation.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which line configuration command makes the VTY lines accept SSH sessions only?',
    answers: ['transport input ssh'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`transport input ssh` limits the lines to SSH, so Telnet attempts are refused. `transport input ssh telnet` would accept both protocols.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'What does `exec-timeout 5 0` do under `line vty 0 15`?',
    options: [
      'Limits every session to 5 minutes in total',
      'Disconnects sessions that have been idle for 5 minutes',
      'Waits 5 seconds for the user to type a password',
      'Allows 5 failed login attempts before blocking the source',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      '`exec-timeout minutes seconds` sets the **idle** timeout: 5 minutes and 0 seconds here. Active sessions are not cut off, the default is 10 minutes, and `exec-timeout 0 0` disables the timeout.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which command shows whether SSH is enabled and which SSH version the device runs?',
    options: ['show ssh', 'show ip ssh', 'show users', 'show crypto key mypubkey rsa'],
    answer: 1,
    difficulty: 2,
    explanation:
      '`show ip ssh` reports the SSH status and version (for example SSH Enabled - version 2.0) plus the timeout and retries. `show ssh` lists active SSH sessions, `show users` lists logged-in lines, and `show crypto key mypubkey rsa` displays the public key.',
  },
  {
    id: 'q7',
    type: 'input',
    stem: 'Which global configuration command lets a Layer 2 switch reply to management hosts in other subnets through the router at 10.1.99.1?',
    answers: ['ip default-gateway 10.1.99.1'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`ip default-gateway 10.1.99.1` gives the Layer 2 switch a gateway for traffic leaving its SVI subnet. A switch with `ip routing` enabled would need a default route instead.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Why is Telnet not recommended for managing network devices?',
    options: [
      'It uses UDP, which makes remote sessions unreliable',
      'It cannot be used on the VTY lines of a Cisco router',
      'It sends usernames, passwords and commands in cleartext',
      'It requires RSA key pairs that are hard to manage',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'Telnet sends everything **unencrypted**, so anyone capturing the traffic can read the credentials and commands. It runs over TCP 23, it is exactly what VTY lines were built for, and RSA keys are an SSH requirement.',
  },
];
