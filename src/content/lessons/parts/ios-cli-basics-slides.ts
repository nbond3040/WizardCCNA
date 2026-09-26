import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Cisco IOS CLI Essentials',
    subtitle: 'Access methods, modes, help, saving configs and baseline settings',
    notes:
      "Nearly every CCNA lab, simulation and troubleshooting item assumes you can move through the Cisco IOS command-line interface without hesitating. This deck builds that fluency from zero. First you will see how to reach a device: locally through the **console** port, or remotely with **Telnet** and **SSH**. Next comes the **mode hierarchy** and its prompts, followed by the tools that make the CLI fast: context-sensitive help, abbreviation, Tab completion, command history, the `do` keyword and the `no` form. Then we open the box: which memory holds the IOS image and which holds your configuration, what happens during boot, and why `copy running-config startup-config` matters so much. Finally you will apply the baseline settings every device should carry and give a Layer 2 switch a management address with a default gateway. These skills are the same for the v1.1 and v2.0 blueprints, and they are assumed knowledge inside questions on every other topic, so practice each command until it is automatic.",
  },
  {
    kind: 'bullets',
    title: 'Three ways into the CLI',
    bullets: [
      '**Console**: out-of-band, direct cable, works with no IP configured',
      '**Telnet** (TCP 23): in-band, sends everything in **cleartext**',
      '**SSH** (TCP 22): in-band and **encrypted**, the secure choice',
      'Remote sessions land on **VTY** lines; the console is `line console 0`',
      'Emulator settings: ==9600 baud, 8 data bits, no parity, 1 stop bit==',
      'Cable: RJ-45 rollover (often via USB-serial adapter) or a USB console port',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'lap', icon: 'laptop', label: 'Laptop', sub: '9600 8N1', x: 1.2, y: 1.2 },
        { id: 'adm', icon: 'pc', label: 'Admin PC', sub: 'SSH client', x: 1.2, y: 3.8 },
        { id: 'net', icon: 'cloud', label: 'IP network', x: 4.4, y: 3.8 },
        { id: 'r1', icon: 'router', label: 'R1', sub: '10.1.1.1', x: 7.6, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'lap', to: 'r1', label: 'console (out-of-band)', style: 'dashed', toLabel: 'CON' },
        { from: 'adm', to: 'net', label: 'SSH TCP 22' },
        { from: 'net', to: 'r1', label: 'in-band', toLabel: 'G0/0/0' },
      ],
    },
    notes:
      "The **console** port is **out-of-band** management: the cable runs straight from your laptop to the device, so it works on a brand-new box with no IP address and still works when the network itself is broken. That makes it the tool for initial setup and recovery. Your terminal emulator must match the port: ==9600 bps, 8 data bits, no parity, 1 stop bit and no flow control==, usually written 9600 8N1. Older devices use a light-blue RJ-45 **rollover** cable, typically with a USB-to-serial adapter; many newer ones also offer a USB console port. **Telnet** and **SSH** are **in-band**: they ride the production network, so the device needs an IP address, a reachable path and configured **VTY** (virtual terminal) lines. Telnet (TCP 23) sends everything, including passwords, in cleartext that any packet capture can read. SSH (TCP 22) encrypts the whole session and is always the exam's best-practice answer. Web GUIs over HTTP or HTTPS are another management option on some platforms. The SSH setup itself (domain name, RSA keys, `transport input ssh`) is covered later in the course.",
  },
  {
    kind: 'table',
    title: 'Console vs Telnet vs SSH',
    columns: ['Property', 'Console', 'Telnet', 'SSH'],
    rows: [
      ['Management type', 'Out-of-band', 'In-band', 'In-band'],
      ['Transport', 'Serial cable (rollover or USB)', 'TCP **23**', 'TCP **22**'],
      ['Encryption', 'n/a (local cable)', '**None**, cleartext', '**Encrypted**'],
      ['Needs a device IP?', 'No', 'Yes', 'Yes'],
      ['IOS line', '`line console 0`', '`line vty 0 4` (or 0 15)', '`line vty 0 4` (or 0 15)'],
      ['Typical use', 'First setup, recovery', 'Labs, legacy devices', 'Everyday remote admin'],
    ],
    notes:
      "Use this table to answer the classic comparison questions. The **console** is the only method that needs no IP configuration at all, which is exactly why it is called out-of-band. **Telnet** and **SSH** both terminate on the **VTY** lines, the virtual terminals that accept remote CLI sessions. The number of VTY lines limits how many people can be logged in remotely at the same time; many routers show `line vty 0 4` (five sessions) in their default configuration, while Catalyst switches typically offer lines 0 to 15. The `transport input` line command decides which protocols a VTY line accepts, for example `transport input ssh` to allow SSH only. On the exam, 'which protocol provides secure remote access?' is always SSH, 'which one exposes passwords to a sniffer?' is Telnet, and 'how do you manage a device whose only uplink is down?' is the console (or a modem on the legacy AUX port). Remember that SSH needs more preparation than Telnet: a hostname, a domain name, an RSA key pair and usually a local user account.",
  },
  {
    kind: 'diagram',
    title: 'The IOS mode hierarchy',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'u', label: 'User EXEC', sub: 'R1>', shape: 'round' },
        { id: 'p', label: 'Privileged EXEC', sub: 'R1#', shape: 'round', tone: 'accent' },
        { id: 'g', label: 'Global config', sub: 'R1(config)#', shape: 'round' },
        { id: 'i', label: 'Sub-config', sub: 'R1(config-if)#', shape: 'round' },
      ],
      edges: [
        { from: 'u', to: 'p', label: 'enable' },
        { from: 'p', to: 'g', label: 'configure terminal' },
        { from: 'g', to: 'i', label: 'interface g0/0/0' },
      ],
    },
    caption: 'Each step down unlocks more power; the prompt always tells you where you are.',
    bullets: [
      '`disable` drops from `#` back to `>`',
      '`exit` climbs one level; at an EXEC prompt it ends the session',
      '`end` or **Ctrl+Z** jumps straight back to privileged EXEC',
    ],
    notes:
      "IOS separates what you can look at from what you can change. You arrive in **user EXEC** mode, prompt `R1>`, where only basic monitoring such as `ping`, `traceroute` and a subset of `show` commands work. Typing `enable` (plus the enable password, if one is set) moves you to **privileged EXEC**, prompt `R1#`, where every show command, `debug`, `copy`, `reload` and `clear` become available. From there, `configure terminal` enters **global configuration**, prompt `R1(config)#`. Global commands affect the whole device, such as `hostname`. Commands like `interface`, `line` or `router ospf` open **sub-configuration modes** with their own prompts. Every configuration command takes effect **immediately** in the running configuration; there is no apply button. To go back, `exit` climbs one level, while `end` or Ctrl+Z returns straight to privileged EXEC from any depth. An exam item may show only a prompt and ask which mode you are in, or give a command and ask which prompt appears next, so read prompts carefully.",
  },
  {
    kind: 'table',
    title: 'Modes and prompts reference',
    columns: ['Mode', 'Prompt', 'Enter with', 'Leave with'],
    rows: [
      ['User EXEC', '`R1>`', 'Log in (console or VTY)', '`exit` / `logout`'],
      ['Privileged EXEC', '`R1#`', '`enable`', '`disable` (back to `>`)'],
      ['Global configuration', '`R1(config)#`', '`configure terminal`', '`exit` / `end` / Ctrl+Z'],
      ['Interface', '`R1(config-if)#`', '`interface g0/0/0`', '`exit` (to global)'],
      ['Subinterface', '`R1(config-subif)#`', '`interface g0/0/0.10`', '`exit` (to global)'],
      ['Line', '`R1(config-line)#`', '`line console 0`, `line vty 0 4`', '`exit` (to global)'],
      ['Routing process', '`R1(config-router)#`', '`router ospf 1`', '`exit` (to global)'],
      ['VLAN (switch)', '`SW1(config-vlan)#`', '`vlan 10`', '`exit` (to global)'],
    ],
    notes:
      "Memorize this table: prompts are the fastest clue in any simulation or exhibit. Every configuration sub-mode shows the word **config** plus a suffix: `-if` for an interface, `-subif` for a router subinterface such as `g0/0/0.10`, `-line` for console and VTY lines, `-router` for a routing protocol process and `-vlan` for VLAN configuration on a switch. A useful parser behavior: if you type a global command while inside a sub-mode, IOS accepts it and moves you to the matching mode. Typing `line vty 0 4` at `R1(config-if)#` drops you straight into `R1(config-line)#` without an explicit `exit`. `exit` from any sub-mode returns to global configuration, and `exit` from global configuration returns to privileged EXEC. `disable` only makes sense in privileged EXEC, while `exit` at `R1>` or `R1#` ends the session entirely. On an unconfigured device the prompts start as `Router>` or `Switch>` until you set a hostname, which is why many exhibits show those default names.",
  },
  {
    kind: 'cli',
    title: 'Moving between modes',
    code: `R1> enable
Password:
R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# exit
R1(config)# line vty 0 4
R1(config-line)# end
R1#
*Sep 26 10:15:32.123: %SYS-5-CONFIG_I: Configured from console by console
R1# disable
R1>`,
    highlight: ['R1(config)#', 'R1(config-if)#', 'R1(config-line)#', '%SYS-5-CONFIG_I'],
    caption: 'One trip down the hierarchy and back up again.',
    notes:
      "Follow the prompt on every line. `enable` asks for a password because an **enable secret** is configured; nothing you type is echoed to the screen. `configure terminal` prints the reminder 'End with CNTL/Z' and changes the prompt to `(config)#`. Entering an interface puts you in `(config-if)#`, and `exit` returns you to global configuration. Next, `line vty 0 4` opens line configuration for the five VTY lines at once. Instead of typing `exit` twice, `end` jumps straight to privileged EXEC, and IOS logs a `%SYS-5-CONFIG_I` message recording that the configuration was changed from the console. The asterisk in front of the timestamp means the clock is not synchronized to an authoritative source such as NTP. Finally, `disable` drops back to user EXEC. Exam writers like to ask which command returns you to privileged EXEC in one step from deep inside the configuration (`end` or Ctrl+Z), and which command takes you from `#` back to `>`; the answer is `disable`, not `exit`, because `exit` would log you out.",
  },
  {
    kind: 'cli',
    title: 'Context-sensitive help and error messages',
    code: `R1# clock set ?
  hh:mm:ss  Current Time
R1# clock set
% Incomplete command.

R1# s
% Ambiguous command:  "s"

R1# show ip intreface brief
            ^
% Invalid input detected at '^' marker.

R1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)# hostname ?
  WORD  This system's network name`,
    highlight: ['% Incomplete command.', '% Ambiguous command:', "% Invalid input detected at '^' marker."],
    caption: 'A space before ? asks for the next word; no space lists matching commands.',
    notes:
      "The question mark is your built-in manual. Typed **after a space** (`clock set ?`), it lists what may come next: keywords or argument formats such as `hh:mm:ss`. Typed **directly after letters** (`cl?`), it lists every command that begins with those letters. Either way IOS redisplays your line so you can keep typing. Three error messages matter for the exam. `% Ambiguous command` means you abbreviated too far: `s` matches `send`, `setup`, `show`, `ssh` and more. `% Incomplete command.` means the syntax so far is valid but a required keyword or argument is missing, as with `clock set` alone. `% Invalid input detected at '^' marker.` means IOS did not recognize something; the caret points to where parsing failed, usually a typo or a command entered in the wrong mode. Help is mode-aware too: `hostname ?` in global configuration shows `WORD`, the kind of argument the command expects. In simulations, `?` usually works and is the quickest way to recover a forgotten keyword.",
  },
  {
    kind: 'bullets',
    title: 'Abbreviation, Tab and command history',
    bullets: [
      'Abbreviate to the **shortest unique** string: `conf t`, `sh ip int br`',
      '**Tab** completes a unique partial keyword; if ambiguous, nothing is added',
      '**Up arrow / Ctrl+P** recalls the previous command; **Down / Ctrl+N** the next',
      '`show history` lists the buffer: ==10 commands by default==',
      '`terminal history size 50` (this session) or `history size 50` (under a line)',
      '**Ctrl+A** start of line, **Ctrl+E** end of line, **Ctrl+Shift+6** interrupt',
    ],
    notes:
      "IOS accepts any abbreviation that is **unique** within the current mode, so `conf t` means `configure terminal` and `sh ip int br` means `show ip interface brief`. If an abbreviation matches two commands you get `% Ambiguous command`. Pressing **Tab** after a partial keyword completes it when it is unique; when it is not, IOS simply redisplays what you typed, which is a hint to add more letters. The **history buffer** remembers recent commands: Up arrow or Ctrl+P walks backward, Down arrow or Ctrl+N walks forward, and `show history` lists the buffer. The default size is **10** commands. `terminal history size` changes it for your current session only, while `history size` under `line console 0` or `line vty 0 4` changes it for every session on those lines. Useful editing keys include Ctrl+A to jump to the start of the line and Ctrl+E to jump to the end, and Ctrl+Shift+6 interrupts a long ping, a traceroute or a hung name lookup. Exam items typically test the default buffer size and which command changes it.",
  },
  {
    kind: 'cli',
    title: 'The do keyword and the no form',
    code: `R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# no shutdown
*Sep 26 10:20:01.555: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/0, changed state to up
*Sep 26 10:20:02.555: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/0, changed state to up
R1(config-if)# do show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   unassigned      YES unset  administratively down down
R1(config-if)# exit
R1(config)# show running-config
            ^
% Invalid input detected at '^' marker.
R1(config)# no ip domain-lookup`,
    highlight: ['do show ip interface brief', 'no shutdown', 'no ip domain-lookup'],
    caption: '`do` runs EXEC commands from any configuration mode; `no` reverses a command.',
    notes:
      "Two small keywords save a lot of typing. **do** runs any EXEC-mode command, such as `show`, `ping`, `copy` or `traceroute`, from inside any configuration mode. Here the engineer verifies the interface with `do show ip interface brief` without leaving `(config-if)#`. Without `do`, `show` is rejected in configuration mode with the invalid-input error, a favorite exam distractor. The **no** form reverses or removes a command: `no shutdown` enables an interface (router interfaces are administratively down by default), `no ip address` removes an address, `no hostname` restores the default name and `no ip domain-lookup` disables DNS resolution of mistyped commands. Without that last command, a typo such as `shwo` at an EXEC prompt is treated as a hostname: IOS tries to Telnet to it and first attempts a DNS lookup, freezing your session for a while. Notice also the two log messages after `no shutdown`: **%LINK-3-UPDOWN** reports that Layer 1 came up, then **%LINEPROTO-5-UPDOWN** reports that the line protocol (Layer 2) followed.",
  },
  {
    kind: 'diagram',
    title: 'Four kinds of memory',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Memory',
          layers: [
            { label: 'ROM', sub: 'permanent, read-only' },
            { label: 'Flash', sub: 'non-volatile' },
            { label: 'NVRAM', sub: 'non-volatile' },
            { label: 'RAM', sub: 'volatile', tone: 'accent' },
          ],
        },
        {
          title: 'What lives there',
          layers: [
            { label: 'POST, bootstrap, ROMMON' },
            { label: 'IOS image files', sub: 'also vlan.dat on switches' },
            { label: 'startup-config' },
            { label: 'running-config', sub: 'plus routing, ARP and MAC tables', tone: 'accent' },
          ],
        },
      ],
    },
    caption: 'Only RAM forgets everything at power-off.',
    notes:
      "Knowing where things live explains most boot and save behavior. **ROM** holds permanent firmware: the **POST** hardware test, the **bootstrap** program that finds and loads IOS, and **ROMMON**, a minimal recovery environment used for password recovery or when no valid IOS image can be found. **Flash** is non-volatile storage for **IOS image files**; it can hold several images and other files, and on switches it also stores `vlan.dat`, the VLAN database. **NVRAM** is small non-volatile memory that holds the **startup-config**. **RAM** is the working memory: the running IOS, the **running-config**, routing tables, the ARP cache, the MAC address table and packet buffers all live there, and all of it disappears on a reload or power loss. `dir flash:` or `show flash:` lists the files in flash; on ISR 4000 routers the same storage is also known as `bootflash:`. The exam loves 'where is X stored?' questions, and the answer for unsaved changes is always RAM, which is lost at the next reboot.",
  },
  {
    kind: 'steps',
    title: 'Router boot sequence',
    steps: [
      { title: 'POST', text: 'Code in ROM tests the CPU, memory and interface hardware' },
      { title: 'Load the bootstrap', text: 'The ROM bootstrap program starts and looks for IOS' },
      { title: 'Locate and load IOS', text: 'Normally from flash, guided by the config register and `boot system`; ROMMON if none is found' },
      { title: 'Locate and load the configuration', text: 'startup-config from NVRAM into RAM; if none exists, the initial configuration dialog appears' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'post', label: 'POST', sub: 'ROM', shape: 'round' },
        { id: 'boot', label: 'Bootstrap', sub: 'ROM' },
        { id: 'ios', label: 'Load IOS', sub: 'flash to RAM' },
        { id: 'cfg', label: 'Load config', sub: 'NVRAM to RAM', tone: 'accent' },
      ],
    },
    notes:
      "When a router powers on, it runs **POST** from ROM to check its hardware. The **bootstrap** program, also in ROM, then locates an IOS image. Where it looks is controlled by the **configuration register** and any `boot system` commands; with the default register value `0x2102` the router boots normally from flash and reads the startup-config. If no valid image is found, the router falls back to **ROMMON**, a bare-bones prompt used for recovery. Once IOS is loaded into RAM, it looks for the **startup-config** in NVRAM and copies it into RAM, where it becomes the running-config. If NVRAM holds no configuration, IOS offers the **initial configuration dialog** ('Would you like to enter the initial configuration dialog? [yes/no]'); most engineers answer **no** and configure from the CLI. Password recovery works by changing the register to `0x2142`, which tells IOS to ignore the startup-config at the next boot. For CCNA, focus on the order of the steps and which memory each step uses.",
  },
  {
    kind: 'diagram',
    title: 'running-config vs startup-config',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'cmd', label: 'Commands', sub: 'configuration mode', shape: 'pill' },
        { id: 'run', label: 'running-config', sub: 'RAM, active now', tone: 'accent' },
        { id: 'start', label: 'startup-config', sub: 'NVRAM, survives reboot' },
        { id: 'boot', label: 'Next boot', sub: 'copied into RAM', shape: 'round' },
      ],
      edges: [
        { from: 'cmd', to: 'run', label: 'immediately' },
        { from: 'run', to: 'start', label: 'copy run start' },
        { from: 'start', to: 'boot', label: 'reload' },
      ],
    },
    bullets: [
      'Unsaved changes are **lost** at reload or power failure',
      '`copy startup-config running-config` **merges**; it does not replace',
      '`erase startup-config` + `reload` = blank configuration',
    ],
    notes:
      "Every configuration command changes the **running-config** in RAM the moment you press Enter, and the device starts using it immediately. The **startup-config** in NVRAM is only read at boot. Until you copy one to the other, they differ, and a reload or power cut throws away every unsaved change. That is also a safety net: if a remote change locks you out, a reload (or someone at the site cycling the power) restores the last saved configuration. Two commands save: `copy running-config startup-config` and the older `write memory`. Going the other way, `copy startup-config running-config` **merges** the saved commands into what is running. Commands that exist only in the running-config are **not** removed, so the result can differ from both files. To start from a blank slate, erase the saved configuration and reload. Many exam questions describe a change that 'disappeared after a reboot'; the answer is almost always that the running-config was never saved to NVRAM.",
  },
  {
    kind: 'cli',
    title: 'Save, erase and reload',
    code: `R1# copy running-config startup-config
Destination filename [startup-config]?
Building configuration...
[OK]
R1# write memory
Building configuration...
[OK]
R1# erase startup-config
Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]
[OK]
Erase of nvram: complete
R1# reload
Proceed with reload? [confirm]`,
    highlight: ['[OK]', 'Erase of nvram: complete', '[confirm]'],
    caption: 'Press Enter to accept a default shown in [brackets].',
    notes:
      "`copy running-config startup-config` asks for a destination filename; the default in brackets is already correct, so just press Enter. `Building configuration...` followed by `[OK]` confirms the write to NVRAM. `write memory` (often abbreviated `wr`) does the same job without the filename prompt. `erase startup-config` (or the older `write erase`) deletes the saved configuration after you confirm; the running-config is untouched until the device reloads. `reload` restarts the device and asks for confirmation. If there are unsaved changes, it first asks 'System configuration has been modified. Save? [yes/no]:'. When your goal is a clean start, answer **no**; otherwise you write the current configuration straight back into NVRAM and undo the erase. A handy safety net before risky remote changes is `reload in 10`, which schedules a reboot in ten minutes. If the change works, cancel it with `reload cancel`; if it locks you out, the device reboots to the saved configuration by itself and you regain access.",
  },
  {
    kind: 'cli',
    title: 'Baseline configuration',
    code: `Router> enable
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# hostname R1
R1(config)# enable secret Wiz4rd!Priv
R1(config)# no ip domain-lookup
R1(config)# banner motd # Authorized access only. Activity is logged. #
R1(config)# line console 0
R1(config-line)# password C0ns0le!
R1(config-line)# login
R1(config-line)# logging synchronous
R1(config-line)# exec-timeout 5 30
R1(config-line)# exit
R1(config)# line vty 0 4
R1(config-line)# password Vty!Acc3ss
R1(config-line)# login
R1(config-line)# end
R1# copy running-config startup-config`,
    highlight: ['hostname R1', 'enable secret', 'login', 'logging synchronous', 'exec-timeout 5 30'],
    caption: 'The first lines typed on almost every new device.',
    notes:
      "These lines appear on almost every production device. `hostname` changes the prompt immediately. `enable secret` protects privileged EXEC with a one-way hash; if the older `enable password` is also present, the secret wins. `no ip domain-lookup` stops typos from triggering DNS lookups. `banner motd` displays a legal warning to everyone who connects, before login; the first character after `motd` (here `#`) is the delimiter that must also end the message, so it cannot appear inside the text. Under the lines, `password` sets the line password, but it is enforced only when `login` is also configured. `logging synchronous` stops log messages from breaking up what you are typing, and `exec-timeout 5 30` logs out an idle session after 5 minutes 30 seconds (the default is 10 minutes, and `0 0` disables the timer). On the VTY lines, if `login` is configured but no password is set, remote users are rejected with 'Password required, but none set'. And if no enable password or secret exists at all, remote users cannot reach privileged EXEC: `enable` returns '% No password set'.",
  },
  {
    kind: 'table',
    title: 'What each baseline command does',
    columns: ['Command', 'Mode', 'Effect'],
    rows: [
      ['`hostname R1`', 'Global', 'Sets the device name and prompt'],
      ['`enable secret ...`', 'Global', 'Hashed privileged EXEC password; beats `enable password`'],
      ['`service password-encryption`', 'Global', 'Type 7 obfuscation of cleartext passwords (weak)'],
      ['`banner motd # ... #`', 'Global', 'Warning shown before login; `#` is the delimiter'],
      ['`no ip domain-lookup`', 'Global', 'Typos are no longer resolved through DNS'],
      ['`logging synchronous`', 'Line', 'Reprints your input after a log message'],
      ['`exec-timeout 5 30`', 'Line', 'Idle logout after 5 min 30 s (default 10 min)'],
      ['`password ...` + `login`', 'Line', 'Line password is required to connect'],
    ],
    notes:
      "Use this as a checklist when a simulation asks you to 'secure device access'. Two traps deserve extra attention. First, `service password-encryption` only converts cleartext passwords (line passwords, `enable password`, and local user passwords created with the `password` keyword) into **type 7**, a reversible obfuscation that stops shoulder-surfing but not attackers. It does nothing for `enable secret`, which is already hashed. Second, the mode column matters: `logging synchronous`, `exec-timeout`, `password` and `login` are **line** commands, so typing them in global configuration fails. The banner delimiter can be any character that does not appear inside the message; `#`, `$` and `^C` are common choices, and the running-config always displays the delimiter as `^C`. `no ip domain-lookup` is a global command, and newer releases also accept the spelling `no ip domain lookup`. Every command here takes effect instantly in the running-config, so finish by saving with `copy running-config startup-config`, or the whole baseline disappears at the next reload.",
  },
  {
    kind: 'cli',
    title: 'show version: the identity card',
    code: `R1# show version
Cisco IOS XE Software, Version 16.09.05
Cisco IOS Software [Fuji], ISR Software (X86_64_LINUX_IOSD-UNIVERSALK9-M), Version 16.9.5, RELEASE SOFTWARE (fc1)
...
R1 uptime is 3 days, 2 hours, 41 minutes
System image file is "bootflash:isr4300-universalk9.16.09.05.SPA.bin"
Last reload reason: Reload Command
...
cisco ISR4321/K9 (1RU) processor with 1795979K/6147K bytes of memory.
2 Gigabit Ethernet interfaces
32768K bytes of non-volatile configuration memory.
4194304K bytes of physical memory.
...
Configuration register is 0x2102`,
    highlight: ['Version 16.09.05', 'uptime is 3 days, 2 hours, 41 minutes', 'Last reload reason: Reload Command', '0x2102'],
    caption: 'Version, uptime, boot image, memory and configuration register in one command.',
    notes:
      "`show version` is the device's identity card. The first lines give the **IOS XE release**, here 16.9.5 on an ISR 4321. The **uptime** tells you how long the device has run since its last reload, and **Last reload reason** tells you why it restarted, which is useful after an unexpected outage. **System image file** shows exactly which image was booted and from where, here `bootflash:`. Further down you see the platform and memory, the number and type of interfaces, the size of NVRAM (non-volatile configuration memory) and the physical memory. The last line shows the **configuration register**, normally `0x2102`. Exam questions ask which command displays the IOS version, uptime, reason for the last reload or the configuration register; the answer to all of them is `show version`. Also know what it does not show: it does not list IP addresses or interface up/down states. Those come from `show ip interface brief` and `show interfaces`, covered on the next slide.",
  },
  {
    kind: 'cli',
    title: 'Interface status: brief and detailed',
    code: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.1.2.1        YES manual administratively down down
Serial0/1/0            10.1.3.1        YES manual down                  down
R1# show interfaces GigabitEthernet0/0/0
GigabitEthernet0/0/0 is up, line protocol is up
  Hardware is ISR4321-2x1GE, address is 00a3.8e5f.2a10 (bia 00a3.8e5f.2a10)
  Internet address is 10.1.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Full Duplex, 1000Mbps, link type is auto, media type is RJ45
  ...
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored`,
    highlight: ['administratively down down', 'down                  down', 'is up, line protocol is up'],
    caption: 'Status = Layer 1 and admin state; Protocol = Layer 2.',
    notes:
      "`show ip interface brief` is the first command most engineers type. Each row shows the interface, its IPv4 address, how the address was set (`manual`, `DHCP`, `NVRAM` or `unset`) and two status columns. **Status** reflects Layer 1 and the administrative state; **Protocol** reflects Layer 2. Read them together: `up/up` is healthy; `administratively down/down` means someone configured `shutdown` (router interfaces start that way); `down/down` points to a physical problem such as a missing or bad cable or a shut neighbor; and `up/down` means the physical link is fine but Layer 2 is failing, for example an encapsulation or keepalive mismatch on a serial link. `show interfaces` adds detail for one or all interfaces: the MAC and burned-in address, IP address and mask, MTU and bandwidth, duplex and speed, plus input and output error counters used to diagnose cabling and duplex problems. Exam exhibits often hide the answer in those two status words, so learn to decode them instantly.",
  },
  {
    kind: 'bullets',
    title: 'Managing a Layer 2 switch',
    bullets: [
      'An L2 switch needs an IP **only for management** (SSH, SNMP, ping)',
      'The IP lives on a **switch virtual interface**: `interface vlan 1`',
      'The SVI needs `no shutdown` and an active port in its VLAN',
      '==`ip default-gateway` lets the switch reply to remote subnets==',
      'Used only while IP routing is disabled (a pure L2 switch)',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'adm', icon: 'pc', label: 'Admin', sub: '10.9.9.50', x: 1.2, y: 2.2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 192.168.1.1', x: 4.6, y: 2.2 },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'Vlan1 192.168.1.2/24', x: 8, y: 2.2, tone: 'accent' },
      ],
      links: [
        { from: 'adm', to: 'r1', label: '10.9.9.0/24', toLabel: 'G0/0/1' },
        { from: 'r1', to: 'sw', label: '192.168.1.0/24', fromLabel: 'G0/0/0', toLabel: 'Gi0/1' },
      ],
      annotations: [{ x: 7.2, y: 4.2, text: 'ip default-gateway 192.168.1.1', tone: 'accent' }],
    },
    notes:
      "A Layer 2 switch forwards frames without needing any IP address. You give it one only so that you can **manage** it remotely with SSH, SNMP, syslog or ping. Because physical switch ports are Layer 2, the address goes on a **switch virtual interface (SVI)**, a logical Layer 3 interface for a VLAN; by default that is `interface vlan 1`. Like a router interface, the SVI needs `no shutdown`, and it only comes up when its VLAN has at least one active port. The trap is the default gateway. A Layer 2 switch has IP routing disabled, so it has no routing table for other subnets. Local hosts can ping it, but when the administrator at 10.9.9.50 connects, the switch has no way to send the reply off-subnet. `ip default-gateway 192.168.1.1` fixes that; the gateway must be a router address inside the SVI subnet. The command is used only while `ip routing` is off; on a Layer 3 switch with routing enabled you configure a default route instead. Best practice is to move management to a dedicated VLAN rather than VLAN 1.",
  },
  {
    kind: 'cli',
    title: 'Switch SVI: configure and verify',
    code: `SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.1.2 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.1.1
SW1(config)# end
SW1# show ip interface brief | include Vlan1
Vlan1                  192.168.1.2     YES manual up                    up
SW1# show running-config | include default-gateway
ip default-gateway 192.168.1.1`,
    highlight: ['interface vlan 1', 'ip default-gateway 192.168.1.1', 'up                    up'],
    caption: '`ip default-gateway` is a global command, not an interface command.',
    notes:
      "The configuration takes only a few lines. Enter the SVI with `interface vlan 1`, assign the address and mask, and add `no shutdown`, because SVIs can start administratively down. Then leave the interface: `ip default-gateway` is a **global** command, and typing it under the SVI is a classic distractor. Verification uses output filters. The pipe with `include` shows only the lines that contain the text you give, so `show ip interface brief | include Vlan1` returns just the SVI row, and `show running-config | include default-gateway` confirms the gateway. Filters are case-sensitive, so `include vlan1` would return nothing here. The SVI shows up/up because VLAN 1 exists and at least one port in VLAN 1 is connected; if no port in the VLAN were up, the SVI would show up/down. To test the result, ping the gateway from the switch and then connect from a remote subnet. If local pings succeed but remote ones fail, check the default gateway first: it is missing, mistyped or outside the SVI subnet far more often than anything else.",
  },
  {
    kind: 'table',
    title: 'Which show command answers what?',
    columns: ['Question', 'Command'],
    rows: [
      ['What is active right now?', '`show running-config`'],
      ['What will load at the next boot?', '`show startup-config`'],
      ['IOS version, uptime, config register?', '`show version`'],
      ['Interface IPs and up/down status?', '`show ip interface brief`'],
      ['Errors, duplex, speed, MAC, MTU?', '`show interfaces`'],
      ['What did I just type?', '`show history`'],
      ['Which images are stored?', '`show flash:` / `dir flash:`'],
    ],
    notes:
      "When a question describes a symptom, map it to the command that reveals it. `show running-config` displays the active configuration in RAM, while `show startup-config` shows what will load at the next boot; comparing the two reveals unsaved changes. `show version` answers identity questions: IOS release, uptime, image file, memory and the configuration register. `show ip interface brief` is a one-line-per-interface summary of addresses and status, and `show interfaces` gives the full detail, including error counters, duplex, speed and the MAC address. `show history` replays your recent commands, handy when you forget exactly what you typed. `show flash:` or `dir flash:` lists the IOS images and other files stored in flash. Output filters make every one of these faster: `| include`, `| exclude`, `| begin` and `| section`. For example, `show running-config | section line vty` prints just the VTY configuration block. In exam simulations you may be limited to a few commands, so choosing the right one first saves precious time.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: IOS CLI basics',
    body: 'Read every prompt, every mode and every **save** step: most CLI questions hinge on one of them.',
    bullets: [
      '`password` without `login` = no password prompt',
      '`enable secret` wins over `enable password`',
      '`show` in configuration mode fails; use `do show`',
      '`copy start run` **merges**; unsaved changes vanish at reload',
      '`ip default-gateway` is global and used only when routing is off',
      'Console needs no IP; Telnet (23) is cleartext; SSH (22) is encrypted',
      '`disable` returns to `>`; `exit` at an EXEC prompt ends the session',
    ],
    notes:
      "These are the mistakes Cisco builds distractors around. A line `password` is checked only when `login` is present, so a configuration with a password but `no login` lets anyone in. When both `enable secret` and `enable password` exist, only the secret is accepted. EXEC commands such as `show`, `ping` and `copy` fail in configuration mode unless you prefix them with `do`. Remember that `copy startup-config running-config` merges instead of replacing, and that anything not copied to NVRAM is gone after `reload`. On switches, `ip default-gateway` is a global command that matters only while IP routing is disabled; putting it under the SVI is invalid, and a gateway outside the SVI subnet cannot work. For access methods, the console is the only one that needs no IP address, Telnet uses TCP 23 in cleartext and SSH uses TCP 22 with encryption. Finally, watch mode transitions: `disable` takes you from privileged to user EXEC, while `exit` at an EXEC prompt ends the session completely.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Console = out-of-band, 9600 8N1; Telnet 23 cleartext; SSH 22 encrypted',
      '`>` user, `#` privileged, `(config)#` global, `(config-xx)#` sub-modes',
      '`?`, abbreviation, Tab, history (10 by default), `do` and `no`',
      'RAM = running-config; NVRAM = startup-config; flash = IOS; ROM = bootstrap',
      'Save: `copy run start` / `write memory`; wipe: `erase startup-config` + `reload`',
      'Baseline: hostname, enable secret, line password + `login`, banner, timeouts',
      'L2 switch management: SVI address + `ip default-gateway`',
    ],
    notes:
      "You now have the core CLI toolkit. You can reach a device through the console (9600 8N1, out-of-band) or remotely over Telnet or, better, SSH. You can identify every mode by its prompt and move between them with `enable`, `disable`, `configure terminal`, `exit`, `end` and Ctrl+Z. You can use `?`, abbreviations, Tab and the history buffer to work quickly, `do` to run EXEC commands from configuration mode and `no` to undo commands. You know that the running-config lives in RAM and the startup-config in NVRAM, how to save, erase and reload, and how a router boots from ROM through flash to NVRAM. You can apply a baseline of hostname, enable secret, line passwords with `login`, banner, `no ip domain-lookup`, `logging synchronous` and `exec-timeout`, and you can make a Layer 2 switch manageable with an SVI and `ip default-gateway`. Every later lesson builds on these commands, so practice them in a lab until they are automatic.",
  },
];

export default slides;
