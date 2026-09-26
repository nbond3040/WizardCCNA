import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Device Access Control & Local Passwords',
    subtitle: 'Locking the console, the VTY lines and privileged EXEC mode',
    notes:
      "Anyone who reaches a Cisco device's CLI with privileged access owns that part of the network: they can read every configuration, redirect traffic or erase the startup-config. This lesson covers the **local** access controls built into IOS — the ones that keep working even when no AAA server is reachable. You will learn the difference between `enable password` and `enable secret`, what the password **types** 0, 5, 7, 8 and 9 in a running-config really mean, how to protect the **console** and **VTY** lines with line passwords or a **local username database**, how **privilege levels** work, and how to add idle timeouts, login-attack blocking, a minimum password length and legal **banners**. This is exam topic 5.3 on CCNA v1.1 and part of domain 4 on v2.0. It is tested heavily with running-config exhibits: you must be able to look at a configuration and say exactly which password unlocks what, and how well it is protected.",
  },
  {
    kind: 'bullets',
    title: 'Three ways into an IOS device',
    bullets: [
      '**Console** (`line con 0`): physical port, needs hands-on access',
      '**AUX** (`line aux 0`): legacy modem port on some routers',
      '**VTY** (`line vty 0 4` / `0 15`): virtual lines for Telnet and SSH',
      'Each line has **its own** login settings',
      'A second lock, **enable**, guards privileged EXEC',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'con', icon: 'laptop', label: 'Console laptop', sub: 'USB / rollover', x: 1.3, y: 1.2 },
        { id: 'aux', icon: 'modem', label: 'Modem', sub: 'legacy', x: 1.3, y: 3.8, tone: 'muted' },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'ISR 4321', x: 4.6, y: 2.5, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 6.9, y: 2.5 },
        { id: 'adm', icon: 'pc', label: 'Admin PC', sub: '10.1.99.50', x: 9.0, y: 2.5 },
      ],
      links: [
        { from: 'con', to: 'r1', label: 'line con 0', style: 'dashed' },
        { from: 'aux', to: 'r1', label: 'line aux 0', style: 'dotted', tone: 'muted' },
        { from: 'r1', to: 'sw', fromLabel: 'G0/0/0' },
        { from: 'sw', to: 'adm', label: 'SSH = line vty', tone: 'accent' },
      ],
      annotations: [{ x: 7.4, y: 4.2, text: 'VTY lines are virtual: reached over IP', tone: 'muted' }],
    },
    notes:
      "Every IOS device is reached through **lines**. The **console** line is the physical RJ-45 or USB console port; using it means standing next to the device (or reaching it through a console server), which is why wiring closets are locked. Many routers, including the ISR 4000 series, also have an **AUX** port originally meant for a dial-up modem — if you do not use it, secure it anyway or stop it from starting an EXEC session with `no exec`. The **VTY** lines are virtual: they have no connector and are used by Telnet and SSH sessions that arrive on **any** IP interface. Routers commonly have `line vty 0 4` (five sessions) and many switches and newer images `line vty 0 15` (sixteen). Because you cannot choose which VTY a session lands on, always configure **every** VTY range identically. Remember that authentication is configured **per line**: securing the VTYs does nothing for the console, and vice versa. After a line login the user is in user EXEC mode; a separate lock — the **enable secret** — guards privileged EXEC.",
  },
  {
    kind: 'diagram',
    title: 'Two locks: line login, then enable',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'Connect', sub: 'console, AUX or VTY', shape: 'pill' },
        { id: 'n2', label: 'Line login', sub: 'line password or local user' },
        { id: 'n3', label: 'User EXEC', sub: 'R1>  level 1' },
        { id: 'n4', label: 'enable', sub: 'enable secret' },
        { id: 'n5', label: 'Privileged EXEC', sub: 'R1#  level 15', shape: 'round', tone: 'accent' },
      ],
    },
    caption: 'The line decides who gets a prompt; the enable secret decides who gets full control.',
    bullets: [
      'Console default: **no** login at all',
      'VTY default: `login` but no password → Telnet refused',
      '`username … privilege 15` skips the second lock',
    ],
    notes:
      "Think of device access as two locks in series. The **first lock** belongs to the line: when you connect, IOS applies whatever login method that line has — nothing, a shared line `password` checked by the `login` command, or a username and password checked by `login local` (or AAA). Passing it drops you into **user EXEC**, privilege level 1, at the `>` prompt, where you can run only basic monitoring commands. The **second lock** is `enable`: it prompts for the **enable secret** (or the legacy enable password) and, if correct, moves you to **privileged EXEC**, level 15, at the `#` prompt. Out of the box the console has no login at all, which is why a new router drops you straight to a prompt. VTY lines ship with `login` but no password, so Telnet sessions are rejected with `Password required, but none set` until you configure one. If no enable password or secret exists, IOS refuses `enable` from a VTY session with `% No password set`, while the console lets you in. A local account created with `privilege 15` skips the second lock entirely and lands in privileged EXEC.",
  },
  {
    kind: 'cli',
    title: 'enable password vs enable secret',
    code: `R1(config)# enable password Cisco123
R1(config)# enable secret Str0ng-Secret-1
R1(config)# end
R1# show running-config | include enable
enable secret 5 $1$DcBQ$pysS.8CYAt/ycOmUghk7f9
enable password Cisco123
R1# disable
R1> enable
Password:
Password:
R1#`,
    highlight: ['enable secret 5', 'enable password Cisco123'],
    caption: 'First try (Cisco123) fails because a secret exists; the second try — the secret — succeeds.',
    notes:
      "Two global commands protect privileged EXEC, and exam exhibits love configurations that contain **both**. `enable password` stores its value as plain text (type 0), or as a reversible type 7 string when `service password-encryption` is on. `enable secret` never stores the password at all: it stores a **one-way hash** that IOS compares with the hash of whatever you type. When both exist, ==IOS uses only the enable secret==; the enable password is ignored and survives only for compatibility with very old images. The transcript proves it: typing Cisco123 at the enable prompt fails and IOS asks again, while the secret succeeds. After three wrong attempts IOS gives up with `% Bad secrets`. Which hash type you see depends on the release: older IOS defaults to **type 5** (salted MD5, `$1$` prefix) as shown here, while many current IOS XE releases default to **type 9** (scrypt). Best practice is simple: configure only `enable secret`, never `enable password`, and never reuse the value as a line or user password. On the exam, if a config shows both lines, the working password is always the secret.",
  },
  {
    kind: 'table',
    title: 'IOS password types at a glance',
    columns: ['Type', 'Algorithm', 'Created by', 'Reversible?', 'Verdict'],
    rows: [
      ['**0**', 'None — cleartext', '`enable password`, line `password`, `username … password` (no encryption service)', 'Readable as-is', 'Never acceptable'],
      ['**4**', 'SHA-256, no salt, one pass (flawed)', 'Legacy releases only', 'No, but cracks fast', 'Deprecated'],
      ['**5**', 'Salted MD5 (`$1$`)', '`secret` on older IOS; `algorithm-type md5`', 'No (offline cracking possible)', 'Legacy minimum'],
      ['**7**', 'Cisco Vigenère-style cipher', '`service password-encryption`', '**Yes — instantly**', 'Obscures only'],
      ['**8**', 'PBKDF2 with SHA-256 (`$8$`)', '`algorithm-type sha256`', 'No', 'Strong'],
      ['**9**', 'scrypt (`$9$`)', '`algorithm-type scrypt`; default on many IOS XE releases', 'No', '==Strongest — recommended=='],
    ],
    caption: 'The digit after `secret` or `password` in the running-config is the type.',
    notes:
      "In a running-config, the number after `password` or `secret` tells you how the string that follows is stored. **Type 0** means no protection — the text is the password. **Type 7** looks scrambled, but it is a weak, reversible Vigenère-style cipher whose key has been public for decades; free tools reverse it instantly, so type 7 only stops someone reading over your shoulder. The one-way hashes are types 5, 8 and 9. **Type 5** is salted MD5 and was the `enable secret` default for many years; it cannot be reversed, but modern GPUs can brute-force weak type 5 passwords offline. **Type 8** uses PBKDF2 with SHA-256 and **type 9** uses scrypt, which is deliberately memory-hard and therefore the most resistant to cracking; Cisco recommends 8 or 9. **Type 4** was an earlier SHA-256 scheme that was implemented without salt or iterations; it is deprecated and should never be created. You may also meet **type 6**, reversible AES encryption tied to a master key and used mainly for stored keys such as VPN pre-shared keys. Memorize the pairs: 5 = MD5, 7 = reversible, 8 = PBKDF2-SHA-256, 9 = scrypt.",
  },
  {
    kind: 'cli',
    title: 'Choosing the hash with algorithm-type',
    code: `R1(config)# enable algorithm-type scrypt secret Str0ng-Secret-1
R1(config)# username admin privilege 15 algorithm-type scrypt secret Adm1n-Pass-2026
R1(config)# username auditor algorithm-type sha256 secret Aud1t-Only-26
R1(config)# end
R1# show running-config | include secret
enable secret 9 $9$mEauc7/uA7PVEg$6TjYIsa/aBFVCBHWYOfOVyU49qX3.eEVIsq/C7H2jGr
username admin privilege 15 secret 9 $9$E3bi3hOTBhoHSI$Ko1KeoTWIBk2wQNugbRQ1MneX6Xgne1CVKV2BrgcrCl
username auditor secret 8 $8$zmuGVFTVqniQFz$94CHIq6lkvU/CWfCZrIu.VKBaNHjI.dy0CibS5S88y6`,
    highlight: ['algorithm-type scrypt', 'algorithm-type sha256', 'secret 9', 'secret 8'],
    caption: '`md5` → type 5, `sha256` → type 8, `scrypt` → type 9.',
    notes:
      "`enable algorithm-type` and `username … algorithm-type` let you pick the hash explicitly instead of trusting the release default. The keywords map directly to types: `md5` produces type 5, `sha256` produces type 8 (PBKDF2 with SHA-256) and `scrypt` produces type 9. You always type the **plaintext** password after `secret`; IOS hashes it and the running-config shows the result with its type digit, a `$8$` or `$9$` prefix, a salt and the hash itself. Do not confuse this with the form `enable secret 9 $9$…` that you see when a config is pasted from another device: there, the digit tells IOS that the string which follows is **already hashed**, so it is stored as-is and the original password keeps working. Typing a normal password after `secret 9` therefore does not do what you want. Notice that `auditor` has no `privilege` keyword, so the account gets the default level 1. For the exam, be ready to pick the command that stores a local user's password with scrypt (`username NAME algorithm-type scrypt secret PASSWORD`) and to name the type each keyword produces.",
  },
  {
    kind: 'bullets',
    title: 'service password-encryption only obscures',
    bullets: [
      'Global command: `service password-encryption`',
      'Turns **type 0** into **type 7**: line, `enable password`, `username … password`',
      'Leaves `secret` hashes alone — they are already one-way',
      'Stops shoulder surfing, **not** attackers with the config',
      '`no service password-encryption` does **not** decrypt existing strings',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'password cisco', sub: 'type 0 on a line', shape: 'pill' },
        { id: 'b', label: 'service password-encryption', sub: 'global config' },
        { id: 'c', label: 'password 7 0822455D0A16', sub: 'looks scrambled', tone: 'accent' },
        { id: 'd', label: 'Any type 7 decoder', sub: 'seconds, no key needed' },
        { id: 'e', label: 'cisco', sub: 'plaintext recovered', shape: 'round', tone: 'bad' },
      ],
    },
    notes:
      "`service password-encryption` is a global command that converts every **type 0** password in the configuration — console, AUX and VTY line passwords, the `enable password`, and `username … password` entries — into **type 7**, and it keeps converting passwords you enter later. That is mildly useful: nobody can read the console password off a screen or a printed config. But type 7 is **encoding**, not hashing: the algorithm and its key are public, and any decoder turns `0822455D0A16` back into `cisco` in a second. Treat type 7 as ==obscured, not secure==. The command has no effect on `enable secret` or `username … secret`, which are already one-way hashes. Watch what happens when you turn it off: `no service password-encryption` does **not** decrypt anything. Existing type 7 strings stay type 7; only passwords configured afterwards are stored in clear text. Exam questions typically ask which passwords the command affects, which type it produces, and whether it is sufficient on its own. It is not: use secrets for everything that supports them, and keep the encryption service on only to hide the passwords that cannot be secrets.",
  },
  {
    kind: 'cli',
    title: 'Line passwords on the console and VTYs',
    code: `R1(config)# line console 0
R1(config-line)# password C0nsole-Key-26
R1(config-line)# login
R1(config-line)# exit
R1(config)# line vty 0 4
R1(config-line)# password Vty-Key-2026
R1(config-line)# login
R1(config-line)# end
R2# telnet 10.1.12.1
Trying 10.1.12.1 ... Open


User Access Verification

Password:
R1>`,
    highlight: ['login', 'R1>'],
    caption: 'Both parts are needed: `password` stores the value, `login` makes IOS ask for it.',
    notes:
      "Line passwords are the simplest login method: one shared password per line, checked because the line also has the `login` command. Both parts are required — `password` stores the value and `login` tells IOS to ask for it. A console with a password but **no** `login` never prompts, which is a classic exam exhibit; and if you enter `login` on a line that has no password yet, IOS warns that login is disabled on that line until a password is set. The VTY configuration is identical, but mind the range: this router has `vty 0 4`, five simultaneous sessions, and every VTY range on a device must be protected (many switches also have `line vty 5 15`). The Telnet test from R2 shows the result: `User Access Verification`, a password prompt, and then user EXEC at `R1>` — the enable secret is still needed to reach `#`. Shared line passwords have real weaknesses: everyone knows the same value, logs cannot show **who** did what, and changing it means telling everyone. They also cannot be used for **SSH**, which always authenticates a username. That is why production devices use `login local` with personal accounts, or AAA.",
  },
  {
    kind: 'compare',
    title: 'login vs login local',
    left: {
      heading: 'login',
      bullets: [
        'Checks the line’s own `password`',
        'One shared secret for everyone',
        'No per-user accountability',
        'Console and Telnet only — not SSH',
      ],
    },
    right: {
      heading: 'login local',
      tone: 'accent',
      bullets: [
        'Checks the `username … secret` database',
        'Personal accounts with per-user privilege',
        'Required for SSH (or use AAA)',
        'Any line `password` is **ignored**',
      ],
    },
    notes:
      "Both commands live under a line, and only one method is active at a time — entering `login local` replaces `login`, and vice versa. With `login`, IOS compares what you type with the line's `password`. With `login local`, IOS prompts for a **username** and a password and checks them against the **local user database** built with `username` commands; any `password` still configured on that line is simply ignored. Local accounts bring three big wins: each administrator has their own credentials, different people can get different **privilege levels**, and logs and `show users` identify who is connected. They are also mandatory for SSH, because the SSH protocol authenticates a user name. A gotcha: if you enter `login local` on the VTYs before creating any usernames, nobody can log in remotely — always create the account first, especially before changing the console. When `aaa new-model` is enabled, these line commands give way to AAA method lists such as `aaa authentication login default group tacacs+ local`, where `local` is the fallback to this same database; that is covered in the AAA lesson. On the exam, a line showing both `password` and `login local` authenticates with usernames only.",
  },
  {
    kind: 'cli',
    title: 'Local accounts and privilege levels',
    code: `R1(config)# username admin privilege 15 algorithm-type scrypt secret Adm1n-Pass-2026
R1(config)# username helpdesk algorithm-type scrypt secret Help-Desk-2026
R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# end
R2# ssh -l admin 10.1.12.1
Password:
R1# show privilege
Current privilege level is 15`,
    highlight: ['privilege 15', 'login local', 'Current privilege level is 15'],
    caption: 'helpdesk has no `privilege` keyword, so it lands at `R1>` with level 1.',
    notes:
      "Here R1 gets two local accounts. `admin` is created with `privilege 15`, so after a successful SSH login it lands directly in privileged EXEC: `show privilege` reports level 15 and the `enable` step is skipped. `helpdesk` has no privilege keyword, so IOS assigns the default, **level 1**; that user lands at `R1>` and needs the enable secret to go further. Both passwords are stored as scrypt (type 9) hashes because of `algorithm-type scrypt`; a plain `username … secret` would use the release's default hash. Avoid `username … password`: it is stored as type 0, or type 7 with the encryption service, and IOS will not let one account have both a password and a secret. Under the VTY lines, `login local` switches authentication to the local database and `transport input ssh` refuses Telnet. The SSH prerequisites — a non-default hostname, a domain name and RSA keys — are covered in the SSH lesson. The same `login local` command works on `line console 0`, which is good practice so that even console users must identify themselves. Check who is connected, and on which line, with `show users`.",
  },
  {
    kind: 'table',
    title: 'Privilege levels 0, 1, 2–14 and 15',
    columns: ['Level', 'Prompt', 'What it allows', 'How users get there'],
    rows: [
      ['**0**', '`R1>`', 'Only `disable`, `enable`, `exit`, `help`, `logout`', 'Assigned explicitly (rare)'],
      ['**1**', '`R1>`', 'User EXEC: basic `show`, `ping`, `traceroute`', 'Default after a line login; `username` without `privilege`'],
      ['**2–14**', '`R1#`', 'Custom command sets', 'Commands moved in with `privilege exec level N …`'],
      ['**15**', '`R1#`', '==Privileged EXEC: everything==, including `configure terminal`', '`enable`, `username … privilege 15`, `privilege level 15` on a line'],
    ],
    caption: 'The prompt alone does not prove level 15 — `show privilege` does.',
    notes:
      "IOS defines sixteen privilege levels, 0 through 15, and every command belongs to one of them. Two matter day to day. **Level 1** is user EXEC: the `>` prompt, limited `show` commands, `ping` and `traceroute`, but no configuration and no `show running-config`. **Level 15** is privileged EXEC — full control. Typing `enable` with no number means level 15, and `disable` drops you back to level 1. **Level 0** allows only five commands: `disable`, `enable`, `exit`, `help` and `logout`. Levels **2–14** start out with nothing extra; you populate one by moving commands into it with the global `privilege` command — for example `privilege exec level 5 show running-config` — and then give an operator that level with `username ops privilege 5 secret …` or with `enable secret level 5 …`. Every level from 2 upward shows the `#` prompt, so the prompt does not prove you are at 15; `show privilege` does. On the exam, know that 1 and 15 are the defaults for user and privileged EXEC, that `username … privilege 15` bypasses the enable secret, and that custom levels 2–14 exist for delegating a subset of commands.",
  },
  {
    kind: 'cli',
    title: 'Idle timeouts and minimum password length',
    code: `R1(config)# security passwords min-length 10
R1(config)# enable secret Cisco1
% Password too short - must be at least 10 characters. Password configuration failed
R1(config)# line console 0
R1(config-line)# exec-timeout 5 0
R1(config-line)# exit
R1(config)# line vty 0 4
R1(config-line)# exec-timeout 10 30
R1(config-line)# end`,
    highlight: ['security passwords min-length 10', 'exec-timeout 5 0', 'exec-timeout 10 30'],
    caption: '`exec-timeout minutes seconds` — default 10 minutes; `0 0` disables the timer.',
    notes:
      "Two quick wins. **`exec-timeout minutes [seconds]`** under a line logs out an idle session, so an unattended console or a forgotten SSH window does not stay logged in. The default is ==10 minutes== on every line. `exec-timeout 5 0` means five minutes, `exec-timeout 10 30` means ten minutes and thirty seconds, and `exec-timeout 0 0` (or `no exec-timeout`) disables the timer entirely — convenient in a lab, a finding in any audit. Watch the argument order: `exec-timeout 0 15` is fifteen **seconds**, not fifteen minutes. **`security passwords min-length`** is a global command (range 0–16) that makes IOS reject any new user, enable or line password shorter than the given length, exactly as the transcript shows. It checks passwords as they are configured, so apply it early and then reset any short passwords that already exist. Neither command makes a password *good*: length is the strongest simple defense, but choosing long, unique passphrases and using MFA or AAA for administrators are policy topics covered in the password-policy lesson. Exam items typically ask you to decode an `exec-timeout` value or to pick the command that enforces a minimum length.",
  },
  {
    kind: 'diagram',
    title: 'login block-for: throttling password guessing',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'att', label: 'Attacker 203.0.113.9', icon: 'attacker' },
        { id: 'r1', label: 'R1', icon: 'router' },
        { id: 'adm', label: 'Admin 10.1.99.50', icon: 'laptop' },
      ],
      steps: [
        { from: 'att', to: 'r1', label: 'SSH login fails (1)', tone: 'bad' },
        { from: 'att', to: 'r1', label: 'Failures 2 and 3 within 60 s', tone: 'bad' },
        { note: 'Threshold reached: quiet mode for 120 s', tone: 'warn' },
        { from: 'att', to: 'r1', label: 'Attempt 4: refused', sub: 'all Telnet, SSH and HTTP logins blocked', tone: 'bad', dashed: true },
        { from: 'adm', to: 'r1', label: 'SSH login allowed', sub: 'permitted by the quiet-mode access-class', tone: 'good' },
        { note: 'After 120 s R1 returns to normal mode' },
      ],
    },
    caption: '`login block-for 120 attempts 3 within 60`',
    notes:
      "Brute-force and dictionary attacks against the VTY lines work because a script can try thousands of passwords per hour. The IOS **login enhancements** fight back. `login block-for 120 attempts 3 within 60` tells R1: if **3 failed logins** occur within a **60-second** window, enter **quiet mode** for **120 seconds**. During quiet mode R1 refuses Telnet, SSH and HTTP login attempts from everyone — including legitimate administrators — which is why the companion command `login quiet-mode access-class` exists: it names an ACL of trusted management hosts that may still log in while the router is quiet. When the block period ends R1 returns to normal mode and starts counting failures again. Configuring `login block-for` also enables a default one-second delay between login attempts (`login delay` changes it), which slows scripted attacks even before the threshold is reached. The feature protects remote (virtual) logins; it does not lock the console. On the exam, translate the three numbers carefully: **block-for** is how long logins are refused, **attempts** is how many failures trigger it, and **within** is the watch window in which those failures must occur.",
  },
  {
    kind: 'cli',
    title: 'Configuring login blocking',
    code: `R1(config)# ip access-list standard MGMT-HOSTS
R1(config-std-nacl)# permit 10.1.99.0 0.0.0.255
R1(config-std-nacl)# exit
R1(config)# login block-for 120 attempts 3 within 60
R1(config)# login quiet-mode access-class MGMT-HOSTS
R1(config)# login delay 2
R1(config)# login on-failure log
R1(config)# login on-success log
R1(config)# end`,
    highlight: ['login block-for 120 attempts 3 within 60', 'login quiet-mode access-class MGMT-HOSTS'],
    bullets: [
      '`login block-for` first — the other `login` options depend on it',
      '`show login` — thresholds and current mode (normal or quiet)',
      '`show login failures` — recent failed attempts',
    ],
    notes:
      "The configuration starts with the exception list: a standard ACL that matches the management subnet 10.1.99.0/24 (wildcard masks are covered in the ACL lessons). `login block-for 120 attempts 3 within 60` turns the feature on; the other `login` options in this group depend on it, so enter it first. `login quiet-mode access-class MGMT-HOSTS` exempts the management hosts from quiet mode, so an attacker cannot lock the administrators out — without it, login blocking becomes a denial-of-service tool in the attacker's hands. `login delay 2` spaces login attempts two seconds apart instead of the one-second default. `login on-failure log` and `login on-success log` generate a syslog message for every failed and successful login, which makes brute-force attempts visible on your syslog server. Verify with `show login`, which reports the configured thresholds and whether the router is currently in normal mode or quiet mode, and with `show login failures`, which lists recent failed attempts and their sources. A typical exam requirement: “block logins for 5 minutes after 4 failures within 2 minutes” translates to `login block-for 300 attempts 4 within 120`.",
  },
  {
    kind: 'cli',
    title: 'Banners and legal warnings',
    code: `R1(config)# banner motd #
Enter TEXT message.  End with the character '#'.
Authorized access only. Activity is monitored and logged.
#
R1(config)# banner login $Use your personal account. Shared accounts are prohibited.$
R1(config)# banner exec ^Changes require an approved change ticket.^
R1(config)# end
R1# exit

R1 con0 is now available

Press RETURN to get started.

Authorized access only. Activity is monitored and logged.
Use your personal account. Shared accounts are prohibited.

User Access Verification

Username: admin
Password:

Changes require an approved change ticket.
R1#`,
    highlight: ['banner motd', 'banner login', 'banner exec'],
    caption: 'Display order: MOTD → login banner → credentials → exec banner.',
    notes:
      "IOS offers three common banners, each wrapped in a delimiter character of your choice that must not appear in the text (the running-config always displays the delimiter as `^C`). **`banner motd`** (message of the day) is shown to every connection **first**, before any login prompt. **`banner login`** appears after the MOTD, just before the username and password prompts. **`banner exec`** appears only **after** a successful login, when the EXEC session starts. Why bother? Beyond reminding staff of policy, a login banner is a **legal notice**: in many jurisdictions it is far easier to discipline or prosecute unauthorized access when the device clearly stated that access is restricted and monitored. Good banner practice: say that access is for **authorized users only** and that activity may be **monitored and logged**; never say “Welcome”, which reads like an invitation; and do not reveal the device model, software version, location or contact details that help an attacker. Let your legal or security team approve the wording. On the exam, know the display order (MOTD → login → credentials → exec) and that banners are configured in global configuration mode.",
  },
  {
    kind: 'cli',
    title: 'Reading a hardened running-config',
    code: `R1# show running-config
<output omitted>
service password-encryption
!
hostname R1
security passwords min-length 10
enable secret 9 $9$mEauc7/uA7PVEg$6TjYIsa/aBFVCBHWYOfOVyU49qX3.eEVIsq/C7H2jGr
!
username admin privilege 15 secret 9 $9$E3bi3hOTBhoHSI$Ko1KeoTWIBk2wQNugbRQ1MneX6Xgne1CVKV2BrgcrCl
username auditor secret 8 $8$zmuGVFTVqniQFz$94CHIq6lkvU/CWfCZrIu.VKBaNHjI.dy0CibS5S88y6
username backup password 7 0224055800131F621E1E5B4F
!
login block-for 120 attempts 3 within 60
login quiet-mode access-class MGMT-HOSTS
!
banner motd ^C
Authorized access only. Activity is monitored and logged.
^C
!
line con 0
 exec-timeout 5 0
 password 7 04785B081C2E404B4432000E5F595A
 login local
line vty 0 4
 exec-timeout 10 0
 login local
 transport input ssh
<output omitted>`,
    highlight: ['username backup password 7', 'login local', 'secret 9'],
    caption: 'The weakest credential here is the type 7 `backup` password.',
    notes:
      "This is the verification skill the exam tests most: read each password line and say what it protects and how well. `service password-encryption` is on, which is why nothing appears as type 0. The **enable secret** is a type 9 scrypt hash — strong. **admin** is a level-15 account with a type 9 secret, so it logs in straight to privileged EXEC; **auditor** has a type 8 PBKDF2 secret at the default level 1. **backup** was configured with `password`, not `secret`, so it is only type 7 — anyone holding this config can recover that password in seconds, making it the weakest credential on the device. The **console** has a type 7 line password, but because the line says `login local`, that password is ignored: console users authenticate with a username. The VTY lines use the local database too, accept only SSH, and time out after 10 idle minutes. Failed-login protection with a management exception and a legal MOTD banner are in place. The improvement list writes itself: replace `username backup password` with a `secret`, and remove the unused console `password` line so nobody mistakes it for a working credential.",
  },
  {
    kind: 'steps',
    title: 'Hardening checklist for local access',
    steps: [
      { title: 'Set a strong enable secret', text: '`enable algorithm-type scrypt secret …`; never `enable password`.' },
      { title: 'Create personal accounts', text: '`username NAME algorithm-type scrypt secret …`; `privilege 15` only for admins.' },
      { title: 'Authenticate every line', text: '`login local` on the console, AUX and every VTY range.' },
      { title: 'Limit idle sessions', text: '`exec-timeout 5 0` on the console, 10 minutes or less on VTYs.' },
      { title: 'Throttle guessing', text: '`login block-for …` plus `login quiet-mode access-class` for admins.' },
      { title: 'Enforce length, hide leftovers', text: '`security passwords min-length`, `service password-encryption`.' },
      { title: 'Post a legal banner', text: '`banner motd` or `banner login`: authorized use only, monitored.' },
    ],
    notes:
      "Here is the whole lesson as an ordered checklist you can apply to any new router or switch. Start with the **enable secret**, because it protects everything else, and choose scrypt so the hash is as strong as the platform allows. Next create **personal accounts** before you touch the lines — if you switch a line to `login local` first, you can lock yourself out. Give `privilege 15` only to people who need full control. Then apply `login local` to **every** line: console, AUX (or disable it with `no exec`) and every VTY range, adding `transport input ssh` on the VTYs as covered in the SSH lesson. Set **exec-timeout** values so idle sessions close themselves. Add **login blocking** with a quiet-mode exception for the management subnet. Enforce a **minimum length** for future passwords and turn on `service password-encryption` so that any remaining type 0 passwords are at least hidden from casual view. Finish with a **legal banner**. In larger networks, steps 2 and 3 move to AAA with TACACS+ or RADIUS, keeping one local account as the fallback.",
  },
  {
    kind: 'table',
    title: 'Troubleshooting login symptoms',
    columns: ['Symptom', 'Likely cause', 'Fix'],
    rows: [
      ['Telnet: `Password required, but none set`', 'VTY has `login` but no `password`', 'Set a line password or use `login local`'],
      ['`enable` over a VTY: `% No password set`', 'No enable secret or password exists', '`enable algorithm-type scrypt secret …`'],
      ['Console goes straight to `R1>`', '`password` set but `login` missing', 'Add `login` or `login local`'],
      ['Every SSH login fails', 'Line uses `login` (no usernames) or no accounts exist', 'Create users; `login local`'],
      ['`% Bad secrets` after `enable`', 'Three wrong tries; the secret overrides the enable password', 'Use the enable secret value'],
      ['Nobody can log in remotely for a while', 'Quiet mode after the `login block-for` threshold', 'Wait, or permit admins with a quiet-mode ACL'],
    ],
    notes:
      "Most login problems come from a handful of misconfigurations, and each has a recognizable symptom. `Password required, but none set` is what a Telnet client sees when the VTY lines have `login` (the default) but no `password` — the router refuses to run an unprotected session. `% No password set` appears when a VTY user types `enable` and the device has neither an enable secret nor an enable password; from the console the same command would simply succeed. A console that drops you straight to a prompt despite a configured `password` is missing the `login` command. When **every** SSH attempt fails, check that the VTYs use `login local` (or AAA) and that at least one username exists, because SSH cannot use a line password. `% Bad secrets` after three attempts usually means someone is typing the old enable password while an enable secret — which always wins — is configured. And if every remote login is refused for a couple of minutes after failures, the router is in `login block-for` quiet mode; `show login` confirms it. Exam troubleshooting items quote these exact messages, so learn to map each one to its cause.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: device access',
    body: 'If an exhibit shows both, ==`enable secret` always wins== — and type 7 is never real protection.',
    bullets: [
      'Type 5 = MD5, 7 = reversible, 8 = PBKDF2-SHA-256, 9 = scrypt',
      '`service password-encryption` never touches secrets and never decrypts when removed',
      '`password` without `login` = no prompt; `login local` ignores the line password',
      'No `privilege` keyword = level 1; `privilege 15` skips `enable`',
      '`exec-timeout 0 0` = never; `exec-timeout 0 15` = 15 seconds',
      'MOTD → login banner → credentials → exec banner',
    ],
    notes:
      "These are the traps that appear again and again in CCNA items about local device security. First, whenever an exhibit contains both `enable password` and `enable secret`, the secret is the only one that works — distractors will offer the decoded enable password. Second, type numbers: 5 is MD5, 7 is the reversible Cisco cipher, 8 is PBKDF2 with SHA-256 and 9 is scrypt; a question asking for the **strongest** option wants type 9, and one asking which type is **reversible** wants 7. Third, `service password-encryption` only converts type 0 to type 7; it never re-hashes a secret, and removing it does not bring plaintext back. Fourth, on lines, `login` without `password` refuses Telnet, `password` without `login` never prompts, and `login local` makes IOS ignore any line password. Fifth, usernames default to privilege level 1 unless `privilege 15` is given. Sixth, read `exec-timeout` as minutes then seconds. Finally, remember the banner order and that the MOTD appears before anything else.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Two locks: **line login**, then the **enable secret**',
      'Prefer **secrets** (types 8/9) over passwords (types 0/7)',
      '`login local` + personal `username … secret` accounts; SSH requires usernames',
      'Level 1 = user EXEC, level 15 = privileged EXEC',
      '`exec-timeout`, `login block-for`, `security passwords min-length` harden logins',
      'Banners give legal notice: authorized use only, activity monitored',
      'Read every running-config credential by its **type digit**',
    ],
    notes:
      "Let's recap. Access to an IOS device passes two locks: the **line** (console, AUX or VTY) with its login method, and then the **enable secret** that guards privileged EXEC — unless a local account with `privilege 15` skips straight there. Store credentials as **secrets**: type 9 (scrypt) or type 8 (PBKDF2-SHA-256) are the modern choices, type 5 (MD5) is legacy, and type 0 and type 7 are readable or trivially reversible. `service password-encryption` just hides type 0 passwords as type 7. Use `login local` with personal accounts on every line; line passwords are shared, anonymous and useless for SSH. Harden the login process with idle timeouts, login blocking with a quiet-mode exception for administrators, and a minimum password length, and publish a legal banner that warns rather than welcomes. Finally, practise reading running-config exhibits line by line until you can instantly say which password unlocks what and how strongly it is protected — that is exactly how the exam tests this topic.",
  },
];
