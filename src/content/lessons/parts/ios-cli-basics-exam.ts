import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'multi',
    stem: 'Which two management access methods are in-band? (Choose two.)',
    options: ['Console port', 'SSH', 'Telnet', 'AUX port with a dial-up modem', 'USB console port'],
    answers: [1, 2],
    difficulty: 1,
    explanation:
      'SSH and Telnet travel over the production IP network to the VTY lines, so they are **in-band** and need a reachable IP address on the device. The console and USB console ports are direct cables, and the AUX port with a modem uses the telephone network, so all three are **out-of-band** and keep working when the data network is down.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Users who Telnet to R1 reach the CLI without being asked for any password. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section line vty
line vty 0 4
 password Vty!Acc3ss
 no login
 transport input telnet ssh`,
    },
    options: [
      'The `no login` command disables password checking on the VTY lines',
      'The VTY password is enforced only after `service password-encryption` is enabled',
      '`transport input telnet ssh` bypasses the line password for Telnet sessions',
      'Line passwords take effect only after an `enable secret` is configured',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A line `password` is checked only when `login` is configured; `no login` tells IOS to skip authentication entirely, so the password is simply ignored. `service password-encryption` only obfuscates how passwords are stored, `transport input` controls which protocols may connect (not whether they authenticate), and `enable secret` protects privileged EXEC, not the line login.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements about the startup-config are true? (Choose two.)',
    options: [
      'It is stored in NVRAM',
      'It is stored in RAM',
      'It is copied into RAM when the device boots',
      'Configuration commands are written to it as soon as they are entered',
      'It is deleted with `erase running-config`',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The startup-config lives in **NVRAM** and is copied into RAM at boot, where it becomes the running-config. Configuration commands change only the running-config in RAM until you save, and the command that deletes the saved file is `erase startup-config`; there is no `erase running-config`.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Why did IOS reject the input?',
    exhibit: {
      kind: 'cli',
      text: `R1# co
% Ambiguous command:  "co"`,
    },
    options: [
      'More than one command begins with the letters that were entered',
      'The command is valid only in global configuration mode',
      'A required keyword or argument is missing',
      'The user is in user EXEC mode and lacks privileges',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'In privileged EXEC, `configure`, `connect` and `copy` all begin with **co**, so IOS cannot tell which one is meant and reports an ambiguous command. A missing argument produces `% Incomplete command.`, and an unrecognized or wrong-mode command produces `% Invalid input detected`. The `R1#` prompt also shows the user is already in privileged EXEC.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each IOS message to its cause.',
    pairs: [
      { left: '`% Ambiguous command`', right: 'Too few letters to identify one command' },
      { left: '`% Incomplete command.`', right: 'A required keyword or argument is missing' },
      { left: "`% Invalid input detected at '^' marker.`", right: 'A typo, or a command entered in the wrong mode' },
      { left: '`Translating "shwo"...domain server (255.255.255.255)`', right: 'An unknown word is being resolved as a hostname' },
      { left: '`% No password set`', right: 'A remote user typed `enable`, but no enable password or secret exists' },
    ],
    difficulty: 2,
    explanation:
      'Ambiguous means the abbreviation is not unique; Incomplete means the input is valid so far but unfinished; Invalid input means IOS could not parse the word at the caret, typically a typo or the wrong mode. The Translating message appears when domain lookup is enabled and an unknown word at an EXEC prompt is treated as a hostname to Telnet to. `% No password set` appears on VTY sessions when privileged EXEC has no password at all.',
  },
  {
    id: 'e6',
    type: 'order',
    stem: 'R1 has unsaved configuration changes. An engineer must return R1 to a completely blank configuration. Put the actions in the correct order.',
    items: [
      'Enter privileged EXEC mode with `enable`',
      'Enter `erase startup-config` and confirm',
      'Enter `reload`',
      'Answer **no** when asked to save the modified configuration',
      'Confirm the reload',
      'Answer **no** to the initial configuration dialog after the boot',
    ],
    difficulty: 2,
    explanation:
      '`erase startup-config` requires privileged EXEC and removes the saved file, but the running configuration stays active until the reload. Because there are unsaved changes, `reload` first asks whether to save; answering yes would write the old configuration straight back into NVRAM and defeat the erase. After the reload is confirmed, the router finds no startup-config and offers the initial configuration dialog, which you decline in order to configure from the CLI.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts in 192.168.10.0/24 can ping SW1, but an administrator at 10.20.0.50 cannot reach it. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config
Building configuration...
...
hostname SW1
!
interface Vlan1
 ip address 192.168.10.5 255.255.255.0
!
ip default-gateway 192.168.1.1
...`,
    },
    options: [
      'The default gateway is not in the Vlan1 subnet, so SW1 cannot reply to other subnets',
      'IP routing must be enabled on SW1 before it can communicate with other subnets',
      'Management IP addresses cannot be configured on VLAN 1, so a separate VLAN is required',
      'The `ip default-gateway` command must be configured under interface Vlan1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A default gateway must be directly reachable, which means inside the SVI subnet 192.168.10.0/24. 192.168.1.1 is not, so replies to remote hosts are never delivered. Enabling `ip routing` is unnecessary for management and would make SW1 ignore `ip default-gateway`; VLAN 1 can carry a management address (although a dedicated VLAN is best practice); and `ip default-gateway` is a global command, not an interface command.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Which command increases the command history buffer to 25 commands for the current terminal session only?',
    options: ['`terminal history size 25`', '`history size 25` in global configuration mode', '`show history 25`', '`terminal length 25`'],
    answer: 0,
    difficulty: 1,
    explanation:
      '`terminal history size` is an EXEC command that affects only the current session. `history size` is a **line** configuration command (under `line console 0` or `line vty`) that applies to future sessions on those lines, not a global command. `show history` only displays the buffer, and `terminal length` sets how many output lines appear before the --More-- prompt.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. The two commands were configured with different passwords. A user at the console types `enable`. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include enable
enable secret 5 $1$pT9e$3Qx7nL0vRk2WcA8yHf5Ud/
enable password 7 13061E010803557878`,
    },
    options: [
      'Only the password configured with `enable secret` is accepted',
      'Only the password configured with `enable password` is accepted, because it appears last',
      'Either password is accepted',
      'Both passwords must be entered, one after the other',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'When both commands exist, IOS uses **only** the enable secret and ignores the enable password. The order of lines in the running-config does not matter, IOS never treats the two as interchangeable, and it never asks for two passwords. The `7` shows that `service password-encryption` has obfuscated the enable password, while the `5` marks an MD5 hash of the secret.',
  },
  {
    id: 'e10',
    type: 'multi',
    stem: 'An engineer wants every Telnet user to be prompted for a line password on R1. Which two commands must be present under `line vty 0 4`? (Choose two.)',
    options: ['`password Vty!Acc3ss`', '`login`', '`logging synchronous`', '`exec-timeout 5 0`', '`transport input none`'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The line password is set with `password` and enforced by `login`; both are needed. `logging synchronous` and `exec-timeout` are display and idle-timeout settings, and `transport input none` would block Telnet completely rather than prompt for a password.',
  },
  {
    id: 'e11',
    type: 'categorize',
    stem: 'Classify each item by the router memory where it resides.',
    categories: ['RAM', 'NVRAM', 'Flash', 'ROM'],
    items: [
      { text: 'running-config', category: 0 },
      { text: 'IPv4 routing table', category: 0 },
      { text: 'ARP cache', category: 0 },
      { text: 'startup-config', category: 1 },
      { text: 'IOS image file', category: 2 },
      { text: 'POST and bootstrap code', category: 3 },
      { text: 'ROMMON', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'Everything the router builds while running (running-config, routing table, ARP cache) is in volatile **RAM**. The saved configuration sits in **NVRAM**, IOS image files are stored in **flash**, and the POST, bootstrap and ROMMON code are permanent firmware in **ROM**. A common mistake is placing the startup-config in flash: it belongs in NVRAM.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: "Refer to the exhibit. G0/0/1 had no IP address in R1's saved configuration before this session. What is true after R1 finishes booting?",
    exhibit: {
      kind: 'cli',
      text: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip address 10.1.2.1 255.255.255.0
R1(config-if)# end
R1# reload
System configuration has been modified. Save? [yes/no]: no
Proceed with reload? [confirm]`,
    },
    options: [
      'G0/0/1 has no IP address, because the change existed only in RAM',
      'G0/0/1 keeps 10.1.2.1/24, because IOS saves interface addresses automatically',
      'G0/0/1 keeps 10.1.2.1/24 but is administratively down',
      'R1 boots into ROMMON because the configuration was modified',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The address existed only in the running-config (RAM), and the engineer answered **no** to the save prompt, so R1 reloads with the old startup-config, which has no address on G0/0/1. IOS never saves automatically; interface settings after a reload come entirely from the startup-config; and ROMMON is used only when no valid IOS image can be loaded, which has nothing to do with configuration changes.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. Which interface most likely has a cabling or physical-layer problem?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   10.1.1.1        YES manual up                    up
GigabitEthernet0/0/1   10.1.2.1        YES manual administratively down down
Serial0/1/0            10.1.3.1        YES manual down                  down
Serial0/1/1            10.1.4.1        YES manual up                    down`,
    },
    options: ['GigabitEthernet0/0/0', 'GigabitEthernet0/0/1', 'Serial0/1/0', 'Serial0/1/1'],
    answer: 2,
    difficulty: 3,
    explanation:
      '**down/down** means no usable Layer 1 signal: a missing or faulty cable, or a powered-off or shut neighbor. G0/0/0 is healthy (up/up). G0/0/1 is administratively down, so someone configured `shutdown`; that is not a cabling issue. S0/1/1 is up/down: the physical layer works, but a Layer 2 problem such as an encapsulation or keepalive mismatch keeps the line protocol down.',
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'Which global configuration command stops R1 from trying to resolve mistyped EXEC commands as hostnames?',
    answers: ['no ip domain-lookup', 'no ip domain lookup'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`no ip domain-lookup` (spelled `no ip domain lookup` on newer releases) disables DNS resolution. Without it, an unknown word at an EXEC prompt is treated as a hostname to Telnet to, and IOS pauses while it tries to resolve the name. `logging synchronous` and `exec-timeout` do not affect name resolution at all.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'What is the default configuration register value on a Cisco router? Enter it in hexadecimal.',
    answers: ['0x2102', '2102'],
    placeholder: '0x....',
    difficulty: 1,
    explanation:
      '`0x2102` tells the router to boot IOS normally from flash and load the startup-config. `0x2142` is used during password recovery because it makes IOS ignore the startup-config. `show version` displays the current value on its last line.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: "Refer to the exhibit. PC1 can ping SW1, but Admin cannot. SW1's only IP configuration is its Vlan1 address. Which command allows Admin to manage SW1?",
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'adm', icon: 'pc', label: 'Admin', sub: '10.9.9.50', x: 1.2, y: 2 },
          { id: 'r1', icon: 'router', label: 'R1', x: 4.4, y: 2 },
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'Vlan1 192.168.1.2/24', x: 7.6, y: 2, tone: 'accent' },
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: '192.168.1.20', x: 7.6, y: 4.1 },
        ],
        links: [
          { from: 'adm', to: 'r1', label: '10.9.9.0/24', toLabel: 'G0/0/1 .1' },
          { from: 'r1', to: 'sw', label: '192.168.1.0/24', fromLabel: 'G0/0/0 .1', toLabel: 'Gi0/1' },
          { from: 'sw', to: 'pc1', fromLabel: 'Fa0/1' },
        ],
      },
    },
    options: [
      '`SW1(config)# ip default-gateway 192.168.1.1`',
      '`SW1(config-if)# ip default-gateway 192.168.1.1`',
      '`SW1(config)# ip routing`',
      '`SW1(config)# ip default-gateway 10.9.9.1`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "SW1 needs a default gateway inside its own subnet, and R1's G0/0/0 address 192.168.1.1 is exactly that; the command is entered in **global** configuration mode. Entering it under the SVI is invalid, `ip routing` would turn SW1 into a router without giving it any route to 10.9.9.0/24, and 10.9.9.1 is on a subnet that SW1 cannot reach directly.",
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Which two statements about `exec-timeout` are true? (Choose two.)',
    options: [
      'The default idle timeout is 10 minutes',
      '`exec-timeout 0 0` disables the idle timeout',
      '`exec-timeout 5 30` sets 5 seconds and 30 milliseconds',
      'It is configured in global configuration mode',
      'It applies only to Telnet sessions',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'An idle EXEC session is disconnected after **10 minutes** by default, and `0 0` turns the timer off (convenient in labs, risky in production). The arguments are **minutes** then **seconds**, so `5 30` means 5 minutes 30 seconds. It is a line command, configured separately under the console, VTY and AUX lines, so it is neither global nor Telnet-only.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'An engineer runs `copy startup-config running-config` on a router whose running configuration contains extra commands that were never saved. What is the result?',
    options: [
      'The saved commands are merged into the running configuration; the extras remain',
      'The running configuration is replaced exactly by the saved configuration',
      'The startup configuration is erased once the saved commands are applied',
      'The running configuration is saved to NVRAM as the new startup configuration',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Copying **into** the running-config is a merge: saved commands are applied on top of what is running, and commands that exist only in the running-config are not removed. To get exactly the saved configuration, reload the device instead. Nothing is erased, and saving to NVRAM is the opposite direction (`copy running-config startup-config`).',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. An administrator connected to R1 with Telnet. What must be configured so that the administrator can reach privileged EXEC mode?',
    exhibit: {
      kind: 'cli',
      text: `User Access Verification

Password:
R1> enable
% No password set
R1>`,
    },
    options: [
      '`enable secret` in global configuration mode',
      '`password` under `line vty 0 4`',
      '`login` under `line vty 0 4`',
      '`logging synchronous` under `line vty 0 4`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The VTY login already works (the user passed the Password prompt), but IOS refuses `enable` over a remote session when no enable password or secret exists, replying `% No password set`. Configuring `enable secret` fixes it. The VTY `password` and `login` commands are clearly already in place, and `logging synchronous` only changes how log messages are displayed.',
  },
  {
    id: 'e20',
    type: 'match',
    stem: 'Match each command to the mode in which it is entered.',
    pairs: [
      { left: '`enable`', right: 'User EXEC' },
      { left: '`copy running-config startup-config`', right: 'Privileged EXEC' },
      { left: '`hostname R1`', right: 'Global configuration' },
      { left: '`ip address 10.1.1.1 255.255.255.0`', right: 'Interface configuration' },
      { left: '`exec-timeout 5 0`', right: 'Line configuration' },
    ],
    difficulty: 2,
    explanation:
      '`enable` is how you leave user EXEC; `copy` requires privileged EXEC; `hostname` is a device-wide global command; `ip address` belongs to an interface; and `exec-timeout`, like `password`, `login` and `logging synchronous`, is configured under a line.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: "Refer to the exhibit. Log messages keep splitting the engineer's typing on the console. Which change keeps the messages but redisplays the partially typed command after each one?",
    exhibit: {
      kind: 'cli',
      text: `R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# no shutdown
R1(config-if)# desc
*Sep 26 10:20:01.555: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up
*Sep 26 10:20:02.555: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0/1, changed state to up
ription Link to SW2`,
    },
    options: [
      '`logging synchronous` under `line console 0`',
      '`no logging console` in global configuration mode',
      '`logging synchronous` in global configuration mode',
      '`exec-timeout 0 0` under `line console 0`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '`logging synchronous` is a **line** command; on the console line it makes IOS reprint the prompt and your partial input after each message. `no logging console` would stop console messages entirely, which the requirement rules out, and `logging synchronous` belongs under a line rather than in global configuration. `exec-timeout 0 0` only disables the idle timer.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'A router boots and displays `Would you like to enter the initial configuration dialog? [yes/no]:`. What is the most likely reason?',
    options: [
      'No startup-config was found in NVRAM',
      'The IOS image in flash is corrupted',
      'The configuration register is set to 0x2102',
      'POST detected a hardware failure',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS offers the initial configuration (setup) dialog when it finds no startup-config, typically on a new router or after `erase startup-config`. A missing or corrupt IOS image drops the router into ROMMON instead, 0x2102 is the normal register value that loads the startup-config, and a POST failure stops the boot before IOS runs at all.',
  },
];

export default exam;
