import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Both `enable password` and `enable secret` are configured. Which one works?', back: 'Only the **enable secret**. The enable password is ignored whenever a secret exists.' },
  { id: 'f2', front: 'Password type 0', back: 'Cleartext — no protection. The string in the config is the password.' },
  { id: 'f3', front: 'Password type 5', back: 'Salted **MD5** hash (starts with `$1$`). One-way, but legacy by today’s standards.' },
  { id: 'f4', front: 'Password type 7', back: 'Cisco’s **reversible** Vigenère-style encoding, produced by `service password-encryption`. Free tools decode it instantly.' },
  { id: 'f5', front: 'Password type 8', back: '**PBKDF2 with SHA-256** hash (`$8$`), created with `algorithm-type sha256`.' },
  { id: 'f6', front: 'Password type 9', back: '**scrypt** hash (`$9$`) — the strongest IOS option. Created with `algorithm-type scrypt`; the default on many IOS XE releases.' },
  { id: 'f7', front: 'Password type 4', back: 'A flawed SHA-256 scheme (no salt, single pass). **Deprecated** and replaced by types 8 and 9.' },
  { id: 'f8', front: 'Command: enable secret hashed with scrypt', back: '`enable algorithm-type scrypt secret PASSWORD`' },
  { id: 'f9', front: 'Command: local user with a PBKDF2-SHA-256 (type 8) password', back: '`username NAME algorithm-type sha256 secret PASSWORD`' },
  { id: 'f10', front: 'What does `service password-encryption` change?', back: 'Converts type 0 passwords (line passwords, `enable password`, `username … password`) to **type 7**. Secrets are untouched.' },
  { id: 'f11', front: 'Effect of `no service password-encryption` on existing type 7 strings', back: 'None — they **stay type 7**. Only passwords configured afterwards are stored in cleartext.' },
  { id: 'f12', front: '`login` under a line', back: 'Prompts for that line’s `password`. Without `login`, no password is requested even if one is configured.' },
  { id: 'f13', front: '`login local` under a line', back: 'Prompts for a username and password checked against the local `username` database; any line `password` is ignored.' },
  { id: 'f14', front: 'Telnet message `Password required, but none set`', back: 'The VTY line has `login` (the default) but no `password` configured.' },
  { id: 'f15', front: '`% No password set` after `enable` in a VTY session', back: 'The device has no enable secret or enable password, so IOS refuses privileged EXEC to remote users.' },
  { id: 'f16', front: 'Privilege level of `username NAME secret PASS` (no privilege keyword)', back: '**Level 1** — user EXEC. Add `privilege 15` to land directly in privileged EXEC.' },
  { id: 'f17', front: 'Privilege level range and the two default levels', back: '0–15. Level **1** = user EXEC (`>`), level **15** = privileged EXEC (`#`).' },
  { id: 'f18', front: 'Commands available at privilege level 0', back: '`disable`, `enable`, `exit`, `help` and `logout`.' },
  { id: 'f19', front: 'Command that displays your current privilege level', back: '`show privilege` → “Current privilege level is 15”.' },
  { id: 'f20', front: 'Default `exec-timeout` on IOS lines', back: '**10 minutes** (console, AUX and VTY).' },
  { id: 'f21', front: '`exec-timeout 0 0`', back: 'Disables the idle timeout — sessions never time out (same as `no exec-timeout`).' },
  { id: 'f22', front: '`exec-timeout 5 30`', back: 'Log out after 5 minutes 30 seconds idle — minutes first, then seconds.' },
  { id: 'f23', front: '`login block-for 120 attempts 3 within 60`', back: 'If 3 logins fail within 60 seconds, refuse remote logins for 120 seconds (quiet mode).' },
  { id: 'f24', front: '`login quiet-mode access-class NAME`', back: 'Names an ACL of hosts that may still log in while the device is in quiet mode.' },
  { id: 'f25', front: '`security passwords min-length N`', back: 'Global command (N = 0–16): new user, enable and line passwords shorter than N are rejected.' },
  { id: 'f26', front: 'Banner display order', back: '`banner motd` → `banner login` → username/password prompts → `banner exec` (after a successful login).' },
  { id: 'f27', front: 'Legal login banner: include and avoid', back: 'Include: authorized access only, activity monitored and logged. Avoid: “Welcome”, device model/version, location and contact details.' },
  { id: 'f28', front: 'Why SSH needs `login local` (or AAA)', back: 'SSH always authenticates a **username**, so a shared line password cannot be used.' },
  { id: 'f29', front: '`show users`', back: 'Lists active sessions: line (con 0, vty 0 …), username, idle time and source location.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'A router has both `enable password Cisco123` and `enable secret Str0ng-Secret-1`. What must an administrator type at the `enable` prompt?',
    options: ['Str0ng-Secret-1', 'Cisco123', 'Either of the two passwords', 'No password, because the two commands cancel each other'],
    answer: 0,
    difficulty: 1,
    explanation:
      'When an enable secret exists, IOS checks **only the secret**; the enable password is ignored (it is kept only for compatibility with very old images). IOS never accepts either one interchangeably, and the commands do not cancel each other — privileged EXEC is still protected by the secret.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two password types are one-way hashes recommended for current IOS devices? (Choose two.)',
    options: ['Type 0', 'Type 4', 'Type 7', 'Type 8', 'Type 9'],
    answers: [3, 4],
    difficulty: 1,
    explanation:
      '**Type 8** (PBKDF2 with SHA-256) and **type 9** (scrypt) are the modern, recommended one-way hashes. Type 0 is cleartext, type 7 is reversible encoding, and type 4 was a flawed SHA-256 implementation that Cisco deprecated.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Which global configuration command converts all cleartext passwords in the configuration to type 7?',
    answers: ['service password-encryption'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`service password-encryption` encodes line passwords, the enable password and `username … password` entries as **type 7**. It does not affect secrets, and type 7 is reversible, so it only hides passwords from casual viewing.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'The console line has `password C0nsole-Key-26` configured, yet users get a prompt without being asked for a password. Which command is missing under `line console 0`?',
    options: ['`login`', '`transport input ssh`', '`exec-timeout 5 0`', '`service password-encryption`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `password` command only stores the value; **`login`** tells IOS to prompt for it. `transport input` controls which protocols a line accepts, `exec-timeout` sets the idle timer, and `service password-encryption` is a global command that only changes how passwords are stored.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each password type to how IOS stores it.',
    pairs: [
      { left: 'Type 0', right: 'Cleartext' },
      { left: 'Type 5', right: 'Salted MD5 hash' },
      { left: 'Type 7', right: 'Reversible Cisco encoding' },
      { left: 'Type 8', right: 'PBKDF2 with SHA-256' },
      { left: 'Type 9', right: 'scrypt' },
    ],
    difficulty: 1,
    explanation:
      'Type 0 is plain text, type 5 is salted MD5, type 7 is the reversible Vigenère-style encoding from `service password-encryption`, type 8 is PBKDF2-SHA-256 and type 9 is scrypt — the strongest option.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'What does `exec-timeout 0 0` do under `line vty 0 4`?',
    options: [
      'Disconnects idle sessions immediately',
      'Disables the idle timeout so sessions never time out',
      'Restores the default 10-minute timeout',
      'Blocks all logins on those lines',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'A value of 0 minutes 0 seconds **disables** the idle timer, so sessions stay open forever — convenient in a lab but a security finding in production. The default without the command is 10 minutes, and blocking logins is done with other commands such as `login block-for` or `access-class`.',
  },
  {
    id: 'q7',
    type: 'order',
    stem: 'Put what a user sees when connecting to the console in order, from first to last.',
    items: ['MOTD banner', 'Login banner', 'Username and password prompts', 'Exec banner', 'EXEC prompt (R1> or R1#)'],
    difficulty: 1,
    explanation:
      'The **MOTD** banner is shown first to every connection, then the **login** banner, then the credential prompts. The **exec** banner appears only after a successful login, immediately before the EXEC prompt.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'An administrator configures `login block-for 180 attempts 5 within 60`. What happens after five failed SSH logins in 40 seconds?',
    options: [
      'Remote logins are refused for 180 seconds, except from hosts permitted by a quiet-mode access-class',
      'Only the offending source IP address is blocked for 60 seconds',
      'The VTY lines are shut down until an administrator re-enables them',
      'Each further attempt is delayed by 5 seconds',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Five failures inside the 60-second window trigger **quiet mode** for the `block-for` time of 180 seconds. Quiet mode refuses logins from everyone, not just the attacker, unless a `login quiet-mode access-class` permits the source. The lines are not shut down, and the numbers do not describe a per-attempt delay (that is `login delay`).',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which IOS password type uses a reversible algorithm that freely available tools can decode instantly?',
    options: ['Type 5', 'Type 7', 'Type 8', 'Type 9'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**Type 7** is Cisco’s Vigenère-style encoding with a publicly known key, so it can be reversed in seconds. Types 5 (salted MD5), 8 (PBKDF2-SHA-256) and 9 (scrypt) are one-way hashes: they can only be attacked by guessing passwords, not decoded.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. An administrator connected over SSH types `enable` and enters `cisco`. What is the result?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include enable|service
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
enable secret 9 $9$wGxRDuwUnbxnrN$ZW/2HuyiNVyvzr2ZcuAsVtLqx6WzjAMoGt/9.t8NTD3
enable password 7 0822455D0A16`,
    },
    options: [
      'Access is denied, because the enable secret takes precedence over the enable password',
      'Access is granted, because `0822455D0A16` decodes to `cisco`',
      'Access is granted, because IOS falls back to the enable password when the secret does not match',
      'Access is denied, because type 7 passwords work only after `service password-encryption` is removed',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The type 7 string `0822455D0A16` really does decode to `cisco` — but that is the **enable password**, and IOS ignores the enable password whenever an **enable secret** is configured. There is no fallback from the secret to the password. Type 7 strings work normally while the encryption service is enabled; removing the service would not change which command is used.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements about `service password-encryption` are true? (Choose two.)',
    options: [
      'It converts line passwords and the enable password to type 7',
      'It re-hashes existing enable secrets with scrypt',
      'It offers only weak protection because type 7 is reversible',
      'Removing it with `no service password-encryption` decrypts all passwords',
      'It must be enabled before `enable secret` can store a hash',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The service encodes type 0 passwords — line passwords, `enable password`, `username … password` — as **type 7**, which is **easily reversed**. It never touches secrets (they are already hashed, with or without the service), and removing it leaves existing type 7 strings as they are; only new passwords are then stored in clear text.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'An engineer must create a local account named `netadmin` that lands directly in privileged EXEC mode and whose password is stored as a scrypt hash. Which command meets both requirements?',
    options: [
      '`username netadmin privilege 15 algorithm-type scrypt secret N3t-Admin-26`',
      '`username netadmin privilege 15 password 9 N3t-Admin-26`',
      '`username netadmin algorithm-type sha256 secret N3t-Admin-26`',
      '`username netadmin privilege 15 secret 7 N3t-Admin-26`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`privilege 15` places the user in privileged EXEC at login, and `algorithm-type scrypt secret` hashes the password as **type 9**. The `password` keyword never produces an scrypt hash (it stores type 0 or type 7). `algorithm-type sha256` produces type 8 and, without `privilege 15`, the user would land at level 1. A digit after `secret` describes an already-hashed value, and 7 is not a secret type at all.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. R1 has RSA keys and SSH version 2 enabled, but every SSH login attempt fails. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section line vty
line vty 0 4
 exec-timeout 10 0
 password 7 113F0D1C5A390E1549787B767E
 login
 transport input ssh
R1# show running-config | include username
R1#`,
    },
    options: [
      'SSH requires a username, but the VTY lines authenticate with a line password and no local users exist',
      'The line password is stored as type 7, which the SSH server cannot decrypt',
      '`transport input ssh` permits only Telnet on the VTY lines',
      'The 10-minute exec-timeout is too short for the SSH key exchange',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'SSH always authenticates a **username**. The VTYs use `login` (the shared line password) and the second command shows that **no usernames** exist, so SSH users can never be authenticated. The fix is to create accounts with `username … secret` and use `login local`. IOS reads type 7 line passwords without trouble, `transport input ssh` permits SSH (not Telnet), and `exec-timeout` only limits idle time after login.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. What is the most likely cause of the message?',
    exhibit: {
      kind: 'cli',
      text: `R2# telnet 10.1.12.1
Trying 10.1.12.1 ... Open

Password required, but none set

[Connection to 10.1.12.1 closed by foreign host]`,
    },
    options: [
      'The VTY lines on R1 have `login` configured but no `password`',
      'R1 has no enable secret configured',
      'The VTY lines on R1 use `login local` and no usernames exist',
      'The VTY lines on R1 are configured with `transport input ssh`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The Telnet session opened, so the VTY accepts Telnet, and R1 immediately refused it because the line requires a password (`login`) but none is set. A missing enable secret would only cause `% No password set` after typing `enable`. With `login local` and no users, R1 would show a Username prompt and reject the credentials. With `transport input ssh`, the Telnet connection would be refused before it opened.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Which line configuration command makes a VTY line authenticate users against the local username database?',
    answers: ['login local'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`login local` prompts for a username and password and checks them against the `username` entries in the configuration. Plain `login` checks only the line password, and `aaa new-model` would replace line methods with AAA method lists.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'A router uses line passwords and an enable secret. Put the steps to reach global configuration mode in order.',
    items: [
      'Connect to the console or a VTY line',
      'Enter the line password at the Password: prompt',
      'Arrive in user EXEC mode (R1>)',
      'Type `enable` and enter the enable secret',
      'Arrive in privileged EXEC mode (R1#)',
      'Type `configure terminal`',
    ],
    difficulty: 1,
    explanation:
      'The line login comes first and leads to **user EXEC** (level 1). The `enable` command with the enable secret leads to **privileged EXEC** (level 15), and only from there can `configure terminal` enter global configuration mode.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each command to its purpose.',
    pairs: [
      { left: '`exec-timeout 5 0`', right: 'Logs out a session after 5 idle minutes' },
      { left: '`login block-for 120 attempts 3 within 60`', right: 'Blocks remote logins after repeated failures' },
      { left: '`security passwords min-length 10`', right: 'Rejects new passwords shorter than 10 characters' },
      { left: '`banner motd`', right: 'Displays a notice before any login prompt' },
      { left: '`service password-encryption`', right: 'Hides cleartext passwords as type 7' },
    ],
    difficulty: 2,
    explanation:
      '`exec-timeout` is the per-line idle timer (minutes, then seconds). `login block-for` enters quiet mode after the failure threshold. `security passwords min-length` enforces length for new passwords. `banner motd` is shown first to every connection. `service password-encryption` only obscures type 0 passwords as type 7.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. A script at 198.51.100.7 fails four SSH logins in 30 seconds. Moments later, an administrator at 10.1.99.20 and a technician at 10.1.50.8 try to log in with valid credentials. What happens?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config
<output omitted>
login block-for 300 attempts 4 within 60
login quiet-mode access-class 10
<output omitted>
access-list 10 permit 10.1.99.0 0.0.0.255
<output omitted>
line vty 0 4
 login local
 transport input ssh`,
    },
    options: [
      'Both logins are refused for up to 300 seconds',
      'The administrator can log in; the technician is refused until quiet mode ends',
      'Both can log in, because only 198.51.100.7 is blocked',
      'The technician can log in; the administrator is refused because ACL 10 matches 10.1.99.0/24',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Four failures within the 60-second window put R1 into **quiet mode** for 300 seconds. Quiet mode refuses logins from **every** source except those permitted by the quiet-mode access-class. ACL 10 permits 10.1.99.0–10.1.99.255, so the administrator at 10.1.99.20 gets in, while 10.1.50.8 does not match and is refused. Quiet mode is not limited to the attacking address, and a permit in the quiet-mode ACL grants access rather than blocking it.',
  },
  {
    id: 'e11',
    type: 'categorize',
    stem: 'Classify each stored credential by how it resists an attacker who obtains a copy of the configuration.',
    categories: ['Readable or reversible', 'One-way hash'],
    items: [
      { text: 'Type 0 line password', category: 0 },
      { text: 'Type 7 enable password', category: 0 },
      { text: '`username bob password 7 …`', category: 0 },
      { text: 'Type 5 enable secret', category: 1 },
      { text: 'Type 8 user secret', category: 1 },
      { text: 'Type 9 enable secret', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Type 0 is readable as-is and type 7 — including a `username … password 7` entry — is decoded instantly. Types 5, 8 and 9 are **one-way hashes**: an attacker can only guess candidate passwords and compare hashes. That is slow against type 8 and especially type 9, and realistic against salted type 5 mainly when the password is weak.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'A switch has `username helpdesk algorithm-type scrypt secret Help-Desk-2026` and `login local` on its VTY lines. After logging in over SSH as helpdesk, what prompt and privilege level does the user have?',
    options: ['`SW1>` at level 1', '`SW1#` at level 15', '`SW1#` at level 5', '`SW1>` at level 0'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A `username` entry without the `privilege` keyword gets the default **level 1**, which is user EXEC with the `>` prompt; the user needs the enable secret to reach level 15. Level 5 would require `privilege 5`, and level 0 is never a default for a local account.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'With `service password-encryption` enabled, which two configuration commands produce a type 7 string in the running-config? (Choose two.)',
    options: [
      '`enable secret Str0ng-Secret-1`',
      '`password Vty-Key-2026` under `line vty 0 4`',
      '`username auditor algorithm-type sha256 secret Aud1t-Only-26`',
      '`enable password Cisco123`',
      '`enable algorithm-type scrypt secret Str0ng-Secret-1`',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'The encryption service converts **cleartext passwords** — the VTY line password and the enable password — to type 7. Every `secret` command stores a one-way hash instead: plain `enable secret` uses the release default (type 5 or 9), `sha256` gives type 8 and `scrypt` gives type 9.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Which command, entered under `line console 0`, logs out a console session after 15 idle minutes?',
    options: ['`exec-timeout 15 0`', '`exec-timeout 0 15`', '`exec-timeout 900`', '`login block-for 900`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`exec-timeout` takes **minutes first, then seconds**, so `15 0` is 15 minutes. `0 15` is only 15 seconds, `900` would be 900 minutes, and `login block-for` is a global login-throttling command, not an idle timer.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'Enter the global configuration command that makes IOS reject any new password shorter than 12 characters.',
    answers: ['security passwords min-length 12'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`security passwords min-length 12` applies to user, enable and line passwords configured after the command; shorter ones are rejected with a “Password too short” error. The allowed range is 0–16.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. This configuration is accidentally posted to a public forum. Which credential can an attacker recover most easily?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config
<output omitted>
service password-encryption
!
enable secret 5 $1$ZYuG$b1jivq9nzCqymVpx1QE4Bq
!
username admin privilege 15 secret 9 $9$WhH.cyFQwEZ8pI$FbolHNk/Bl74gh11wdatdDzvJHOrfuR6n2NK34tMx0E
username ops password 7 0720315F03281A061201184155
!
line con 0
 login local
line vty 0 4
 login local
 transport input ssh`,
    },
    options: ['The password of user `ops`', 'The enable secret', 'The password of user `admin`', 'The console line password'],
    answer: 0,
    difficulty: 3,
    explanation:
      '`ops` was configured with `password`, so it is only **type 7** and can be decoded instantly. The enable secret is a salted type 5 hash that must be brute-forced, and `admin` uses a type 9 scrypt hash, the hardest to crack. The console has no line password at all — it authenticates with `login local`.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. An audit requires that console users be prompted for credentials and that idle console sessions close after 5 minutes. Which two changes meet the requirements? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section line con
line con 0
 exec-timeout 0 0
 password 7 14341D051F54262E697A636774
 logging synchronous`,
    },
    options: [
      'Add `login` under `line console 0`',
      'Change the timer to `exec-timeout 5 0`',
      'Add `transport input ssh` under `line console 0`',
      'Enter `service password-encryption` in global configuration mode',
      'Change the timer to `exec-timeout 0 5`',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'A password exists but without **`login`** IOS never prompts for it. `exec-timeout 0 0` disables the idle timer; **`exec-timeout 5 0`** sets 5 minutes. `exec-timeout 0 5` would be only 5 seconds. `transport input` selects protocols and adds no authentication, and `service password-encryption` only changes how a password is stored, so it would not create a prompt either.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Which banner is displayed only after a user has successfully logged in?',
    options: ['`banner exec`', '`banner motd`', '`banner login`', '`banner incoming`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The **exec** banner appears when the EXEC session starts, after authentication. The MOTD banner is shown first to every connection and the login banner right before the credential prompts. The incoming banner is used for reverse-Telnet connections, not for normal logins.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements explain why `enable secret` is preferred over `enable password`? (Choose two.)',
    options: [
      'The secret is stored as a one-way hash',
      'When both exist, IOS uses the secret and ignores the enable password',
      'The secret is encrypted with AES, so administrators can recover it if forgotten',
      'The enable password cannot be used from the console',
      'The secret is not shown in the running-config at all',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A secret is a **one-way hash** (type 5, 8 or 9), and whenever one exists it **overrides** the enable password. Secrets cannot be recovered, only reset through password recovery. The enable password works from any line when no secret exists, and the secret does appear in the running-config — as a hash.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer copies this line from R2 and pastes it into global configuration mode on R1. What is the result on R1?',
    exhibit: {
      kind: 'cli',
      text: `R2# show running-config | include enable secret
enable secret 9 $9$wGxRDuwUnbxnrN$ZW/2HuyiNVyvzr2ZcuAsVtLqx6WzjAMoGt/9.t8NTD3`,
    },
    options: [
      'R1 stores the same hash, so the password that unlocks R2 also unlocks privileged EXEC on R1',
      'R1 treats the hash string itself as its new enable password',
      'R1 rejects the command, because type 9 secrets cannot be entered manually',
      'R1 converts the hash to type 5, because type 9 is not its default',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The digit `9` after `secret` tells IOS that the string which follows is **already an scrypt hash**, so R1 stores it unchanged and the original password now works on both routers. This is how configurations are migrated between devices. IOS does not re-hash the string (it would do that only for a plaintext value typed without a digit), and it never converts one hash type into another.',
  },
  {
    id: 'e21',
    type: 'match',
    stem: 'Match each symptom to its most likely cause.',
    pairs: [
      { left: 'Telnet shows `Password required, but none set`', right: 'VTY lines have `login` but no `password`' },
      { left: '`enable` in a VTY session returns `% No password set`', right: 'No enable secret or enable password is configured' },
      { left: 'The console opens a prompt without asking for anything', right: 'The console has a `password` but no `login` command' },
      { left: '`% Bad secrets` after three enable attempts', right: 'The user types the enable password while an enable secret exists' },
      { left: 'All remote logins are refused for minutes after failures', right: 'The router is in `login block-for` quiet mode' },
    ],
    difficulty: 3,
    explanation:
      'Each message maps to one misconfiguration: `login` without a password refuses Telnet; no enable secret or password blocks remote `enable`; `password` without `login` never prompts; three wrong tries at the enable prompt give `% Bad secrets` — typically because the secret overrides a remembered enable password; and quiet mode refuses remote logins until the block-for period ends.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'A switch has both `line vty 0 4` and `line vty 5 15`. The security policy requires every remote session to use SSH with local accounts. What should the engineer do?',
    options: [
      'Configure identical login and transport settings on both VTY ranges',
      'Configure only `line vty 0 4`, because sessions never use lines 5 to 15',
      'Configure only `line vty 5 15`, because lines 0 to 4 are reserved for the console',
      'Configure the console line, because VTY settings are inherited from it',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A session can land on **any** free VTY line: IOS hands out the lowest free line, so the sixth concurrent session uses vty 5, and an attacker can open several sessions on purpose to reach an unprotected line. All VTY ranges must therefore have the same `login local` and `transport input ssh` settings. Lines 0–4 are not reserved for the console, and VTY lines inherit nothing from `line con 0`.',
  },
];
