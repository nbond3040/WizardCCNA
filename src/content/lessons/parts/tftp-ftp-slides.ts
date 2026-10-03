import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'TFTP, FTP & the IOS File System',
    subtitle: 'Moving configurations and IOS images on and off Cisco devices',
    notes:
      'Sooner or later every network engineer has to copy something to or from a router or switch: a configuration backup before a risky change, a new **IOS image** to fix a bug, or a saved configuration to rebuild a failed device. This deck covers the protocols that carry those files (**TFTP**, **FTP** and the secure alternatives **SFTP** and **SCP**), the **IOS file systems** such as `flash:` and `nvram:` that hold them, and the `copy` command that ties everything together. TFTP and FTP are named explicitly in objective 4.9 of the 200-301 v1.1 and remain in scope for v2.0, so expect questions on port numbers, authentication, active versus passive FTP, the effect of copying into `running-config`, and reading `show file systems`, `dir` and `show version` output. The content is the same in both exam versions, so nothing here is version-tagged. We finish with the complete IOS upgrade workflow, including `verify /md5` and `boot system`.',
  },
  {
    kind: 'bullets',
    title: 'Why files move on and off devices',
    bullets: [
      'Back up the **running-config** and the IOS image before any change',
      'Upgrade the **IOS image** for bug fixes, security patches or features',
      'Rebuild a failed or replaced device from a saved configuration',
      'A file server offers **TFTP**, **FTP**, **SCP** or **SFTP**',
      'One command does it all: `copy source destination`',
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3.4,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', x: 1.2, y: 1.7 },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4, y: 1.7 },
        { id: 'srv', icon: 'server', label: 'File server', sub: '10.1.1.100', x: 6.8, y: 1.7, tone: 'accent' },
      ],
      links: [
        { from: 'r1', to: 'sw1', fromLabel: 'G0/0/0', toLabel: 'Fa0/1' },
        { from: 'sw1', to: 'srv', fromLabel: 'Fa0/24', label: 'TFTP / FTP / SCP' },
      ],
    },
    notes:
      'Network devices are not set-and-forget. Before any risky change you save the current configuration somewhere safe; when a bug or vulnerability is announced you replace the IOS image; when hardware fails you restore the saved configuration onto its replacement. All three jobs are file transfers between the device and a **file server** somewhere on the network, which is why the exam cares about the protocols involved. Cisco IOS has one universal command for it, `copy source destination`, where either side can be a local file system (`flash:`, `nvram:`) or a remote one (`tftp:`, `ftp:`, `scp:`). The device acts as the client: it connects to a server that you run on a PC or Linux host. The most common failure is an unreachable server, so always confirm IP connectivity first. The server must answer a ping, and no ACL or firewall may block the transfer protocol.',
  },
  {
    kind: 'diagram',
    title: 'TFTP: simple and unsecured',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r', label: 'R1 (client)', icon: 'router' },
        { id: 's', label: 'TFTP server', icon: 'server' },
      ],
      steps: [
        { from: 'r', to: 's', label: 'Read request (RRQ)', sub: 'sent to UDP port 69' },
        { from: 's', to: 'r', label: 'DATA block 1', sub: '512 bytes, from a new server port', tone: 'accent' },
        { from: 'r', to: 's', label: 'ACK block 1' },
        { from: 's', to: 'r', label: 'DATA block 2' },
        { from: 'r', to: 's', label: 'ACK block 2' },
        { note: 'A block shorter than 512 bytes ends the transfer' },
      ],
    },
    bullets: [
      '**UDP 69** for the first request; the data then moves on ephemeral ports',
      'No authentication, no encryption, no directory listing',
      'Every block must be **acknowledged** before the next is sent',
      'Tiny and simple: used by bootloaders, PXE and lab tools',
    ],
    notes:
      'TFTP, the Trivial File Transfer Protocol, is deliberately minimal. A client sends a read or write request to **UDP port 69**; the server answers from a fresh high port, and from then on the two sides exchange numbered **512-byte blocks**, each of which must be acknowledged before the next is sent. UDP provides no reliability, so TFTP builds its own stop-and-wait scheme on top, which is simple but slow for large images. There is no login, no encryption and no way to list directories: if you can reach the server and know the file name, you can read it, and on many servers you can write it too. That makes TFTP acceptable inside a protected management network and a security risk anywhere else. Its tiny code size is why it survives in ROMMON, PXE network boot and IP phones. For the exam: TFTP means UDP 69, no authentication, simple and small.',
  },
  {
    kind: 'diagram',
    title: 'FTP active mode: the server calls back',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'FTP client', icon: 'pc' },
        { id: 's', label: 'FTP server', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'Control connection', sub: 'client high port to TCP 21' },
        { from: 'c', to: 's', label: 'USER / PASS', sub: 'cleartext credentials' },
        { from: 'c', to: 's', label: 'PORT command', sub: 'tells the server which client port to call' },
        { from: 's', to: 'c', label: 'Data connection', sub: 'server TCP 20 to that client port', tone: 'accent' },
        { note: 'The data connection arrives from outside, so firewalls and NAT often drop it', tone: 'bad' },
      ],
    },
    bullets: [
      'Control channel: **TCP 21**; data channel: **TCP 20** (the server source port)',
      'Credentials travel in **cleartext**',
      'The **server** initiates the data connection',
    ],
    notes:
      'FTP is richer than TFTP and uses two TCP connections. The **control connection** goes from the client to **TCP port 21** and carries the commands and the login, a username and password sent in cleartext. In classic **active mode**, when a file or directory listing has to move, the client picks a local port and announces it with the `PORT` command. The server then opens the **data connection** from its own **TCP port 20** to that client port. That is the weakness of active mode: the connection arrives from outside, so a firewall or NAT device in front of the client sees an unsolicited inbound connection and drops it. The symptoms are classic: the login works, but directory listings and downloads hang. TCP gives FTP the reliability and speed that TFTP lacks, which is why FTP suits large files. Remember the numbers: 21 for control, 20 for data in active mode.',
  },
  {
    kind: 'diagram',
    title: 'FTP passive mode: the client does the dialing',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'FTP client', icon: 'pc' },
        { id: 's', label: 'FTP server', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'Control connection', sub: 'client to TCP 21' },
        { from: 'c', to: 's', label: 'USER / PASS', sub: 'cleartext credentials' },
        { from: 'c', to: 's', label: 'PASV command', sub: 'you choose the data port' },
        { from: 's', to: 'c', label: 'Reply: use port 50211', sub: 'a high port picked by the server' },
        { from: 'c', to: 's', label: 'Data connection', sub: 'client to server port 50211', tone: 'good' },
        { note: 'Both connections are outbound from the client: firewall and NAT friendly', tone: 'good' },
      ],
    },
    bullets: [
      'Client sends **PASV**; the server answers with an address and a high port',
      'The **client** opens both connections',
      'Preferred whenever the client sits behind a firewall or NAT',
    ],
    notes:
      'Passive mode fixes the firewall problem by turning the data connection around. After logging in on TCP 21, the client sends `PASV`. The server opens a listening port, usually a high number above 1023, and tells the client which one. The client then connects to that port, so **both connections are outbound from the client**, which is exactly what stateful firewalls and NAT expect. Browsers and most modern FTP clients default to passive mode for this reason. The cost moves to the server side: the firewall in front of the server must allow the range of passive ports. On the exam, remember the one-line summary: in active mode the **server** initiates the data connection (from port 20), while in passive mode the **client** does. If a question says that FTP login succeeds but transfers stall behind NAT, passive mode is the answer. A router can be told to use passive mode with `ip ftp passive`.',
  },
  {
    kind: 'table',
    title: 'Active versus passive FTP',
    columns: ['Feature', 'Active mode', 'Passive mode'],
    rows: [
      ['Control connection', 'Client to **TCP 21**', 'Client to **TCP 21**'],
      ['Who opens the data connection', '**Server**', '**Client**'],
      ['Server data port', '**TCP 20**', 'A high port chosen by the server'],
      ['Client data port', 'A port announced with `PORT`', 'Any ephemeral port'],
      ['Command that sets it up', '`PORT`', '`PASV`'],
      ['Behind a client firewall or NAT', 'Often blocked', 'Usually works'],
    ],
    caption: 'Both modes use TCP 21 for control; only the direction of the data connection changes.',
    notes:
      'Compare the two modes row by row, because exam questions usually hide the answer in one of these rows. The control connection is identical: client to TCP 21 in both cases. The difference is the data connection. In active mode the server dials the client, sourcing from **TCP 20**, to a port the client announced with `PORT`. In passive mode the server merely listens on a high port and the client dials in after `PASV`. So the question "which mode works when the client is behind a firewall?" has a one-word answer: **passive**. The opposite question, "which mode uses TCP port 20?", points to **active**. Do not confuse these modes with TFTP, which has no modes, no login and no TCP at all. When you configure a router as an FTP client, `ip ftp passive` forces passive connections, which is the safer choice through filtering devices.',
  },
  {
    kind: 'table',
    title: 'TFTP, FTP, SFTP and SCP compared',
    columns: ['Property', 'TFTP', 'FTP', 'SFTP', 'SCP'],
    rows: [
      ['Transport and port', '**UDP 69**', '**TCP 21** control, **TCP 20** active data', 'TCP 22 (SSH)', 'TCP 22 (SSH)'],
      ['Authentication', '**None**', 'Username and password', 'SSH login or key', 'SSH login or key'],
      ['Encryption', 'No', 'No (cleartext)', '**Yes**', '**Yes**'],
      ['Reliability', 'Own ACK per block over UDP', 'TCP', 'TCP', 'TCP'],
      ['Directory listing', 'No', 'Yes', 'Yes', 'No (copy only)'],
      ['Typical use', 'Lab copies, netboot, ROMMON', 'Large files with a login', 'Secure file management', 'Secure copy of images and configs'],
    ],
    caption: 'Only SFTP and SCP protect the data and the credentials.',
    notes:
      'This is the comparison table the exam is built around. **TFTP** is the lightweight option: UDP 69, no authentication, no encryption, no directory listing. **FTP** adds a login and TCP reliability, using TCP 21 for control and TCP 20 for active-mode data, but everything, including the password, is still cleartext. **SFTP** and **SCP** both ride inside an SSH session on **TCP 22**, so they authenticate and encrypt. Be careful with the names: SFTP is the SSH File Transfer Protocol, a different protocol from FTP, and it is not the same thing as FTPS, which is ordinary FTP wrapped in TLS. SCP is a simple copy-only protocol; SFTP also supports listing and managing files. If an exam scenario mentions an untrusted network or a security requirement, choose SCP or SFTP. If it says simple, small or no authentication needed, think TFTP. On an IOS device, `copy scp:` is the secure counterpart of `copy tftp:`.',
  },
  {
    kind: 'diagram',
    title: 'The IOS file system map',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'r1', icon: 'router', label: 'IOS', sub: 'copy source destination', x: 5, y: 2.5, tone: 'accent' },
        { id: 'flash', icon: 'database', label: 'flash:', sub: 'IOS images', x: 1.4, y: 0.9 },
        { id: 'nvram', icon: 'database', label: 'nvram:', sub: 'startup-config', x: 1.4, y: 2.5 },
        { id: 'usb', icon: 'database', label: 'usbflash0:', sub: 'USB drive', x: 1.4, y: 4.1 },
        { id: 'sys', icon: 'box', label: 'system:', sub: 'running-config (RAM)', x: 5, y: 4.2 },
        { id: 'tftp', icon: 'server', label: 'TFTP server', sub: 'UDP 69', x: 8.6, y: 0.9 },
        { id: 'ftp', icon: 'server', label: 'FTP server', sub: 'TCP 20/21', x: 8.6, y: 2.5 },
        { id: 'scp', icon: 'server', label: 'SCP server', sub: 'TCP 22', x: 8.6, y: 4.1 },
      ],
      links: [
        { from: 'r1', to: 'flash', arrow: 'both' },
        { from: 'r1', to: 'nvram', arrow: 'both' },
        { from: 'r1', to: 'usb', arrow: 'both' },
        { from: 'r1', to: 'sys', arrow: 'both' },
        { from: 'r1', to: 'tftp', label: 'tftp:', style: 'dashed', arrow: 'both' },
        { from: 'r1', to: 'ftp', label: 'ftp:', style: 'dashed', arrow: 'both' },
        { from: 'r1', to: 'scp', label: 'scp:', style: 'dashed', arrow: 'both' },
      ],
      groups: [
        { label: 'Local file systems', x: 0.4, y: 0.3, w: 5.8, h: 4.4 },
        { label: 'Remote file servers', x: 7.4, y: 0.3, w: 2.4, h: 4.4, tone: 'muted' },
      ],
    },
    caption: 'Every location is a prefix ending in a colon; `copy` moves files between any two of them.',
    notes:
      'IOS treats every storage location, local or remote, as a **file system** with a prefix that ends in a colon. Locally, `flash:` holds the IOS image and, on switches, files such as `vlan.dat` and `config.text`. On routers `nvram:` holds the `startup-config`. `system:` is the running memory, home of `running-config`. A USB port appears as `usbflash0:` on many platforms (some IOS XE routers call it `usb0:`). Remote locations are reached with network prefixes: `tftp:`, `ftp:` and `scp:`. The same `copy` command works between any pair, so backing up, restoring and upgrading are all the same operation with different arguments. A small naming point for IOS XE routers such as the ISR 4000: the internal flash is called `bootflash:` there, but the commands behave identically. The exam usually shows plain `flash:`, so learn that name first and treat the others as variations on it.',
  },
  {
    kind: 'cli',
    title: 'show file systems',
    code: `SW1# show file systems
File Systems:

     Size(b)     Free(b)      Type  Flags  Prefixes
*  122185728    97220892     flash     rw   flash:
  7773937664  7773904896  usbflash     rw   usbflash0:
       65536       57456     nvram     rw   nvram:
           -           -    opaque     rw   null:
           -           -   network     rw   tftp:
           -           -   network     rw   http:
           -           -   network     rw   ftp:
           -           -   network     rw   scp:
           -           -   network     rw   https:`,
    highlight: ['flash:', 'usbflash0:', 'nvram:', 'tftp:', 'ftp:'],
    caption: 'Abridged. The asterisk in the first column marks the default file system.',
    bullets: [
      '**Size / Free**: capacity and free space in bytes; a dash means not applicable',
      '**Type**: flash, usbflash, nvram, opaque (virtual) or network (remote)',
      '**Flags**: `rw` read-write, `ro` read-only, `wo` write-only',
      'The asterisk marks the **default** file system used when no prefix is typed',
    ],
    notes:
      '`show file systems` is the quickest way to see what storage a device has and how full it is. Read it by columns. **Size** and **Free** are in bytes, so this switch has about 122 MB of flash with roughly 97 MB free, a small `nvram:` of 64 KB for configuration and a USB drive. **Type** tells you what kind of object it is: real storage such as flash, usbflash and nvram, **opaque** virtual systems, or **network** entries, which are the remote protocols (`tftp:`, `ftp:`, `scp:`, `http:`) that have no size because they are reached across the network. **Flags** show whether you may write. The asterisk in the first column marks the default file system, the one `dir` uses when you give no prefix. Use this output before an upgrade: if the free space on `flash:` is smaller than the new image, the copy will fail with a not enough space error, and an old image must be deleted first.',
  },
  {
    kind: 'cli',
    title: 'dir flash: and the default file system',
    code: `SW1# pwd
flash:/
SW1# dir flash:
Directory of flash:/

    2  -rwx    24962304   Mar 1 1993 00:09:35 +00:00  c2960x-universalk9-mz.152-4.E5.bin
    3  -rwx        1916   Mar 1 1993 00:11:20 +00:00  config.text
    4  -rwx         616   Mar 1 1993 00:04:47 +00:00  vlan.dat

122185728 bytes total (97220892 bytes free)`,
    highlight: ['c2960x-universalk9-mz.152-4.E5.bin', '122185728 bytes total (97220892 bytes free)'],
    caption: 'The old image uses about 25 MB of the 122 MB flash, leaving room for a second image.',
    bullets: [
      'Columns: index, permissions, size in **bytes**, date, file name',
      'The footer gives **total** and **free** bytes: check it before a copy',
      '`dir` alone lists the default file system; `pwd` shows which one that is',
      'On a switch, `config.text` is the saved startup configuration',
    ],
    notes:
      'The `dir` command lists the files in a file system, and `dir flash:` is the one you will use most. Each line shows an index number, the permissions (`-rwx` for a normal file, `d` for a directory), the **size in bytes**, a timestamp and the name. The IOS image is the large `.bin` file whose name encodes the platform, the feature set and the version: `c2960x-universalk9-mz.152-4.E5.bin` is a Catalyst 2960-X image, universal feature set, release 15.2(4)E5. The last line is the important one before an upgrade: total and free bytes. Here the old image takes about 25 MB and 97 MB remain, so a second image of similar size fits comfortably. `show flash:` also lists the files, although the layout varies by platform. `pwd` prints the current default file system and `cd` changes it, which is why a bare `dir` can show different results on different devices.',
  },
  {
    kind: 'table',
    title: 'Prefixes and URL forms',
    columns: ['Prefix', 'Location', 'Used for', 'Example'],
    rows: [
      ['`flash:`', 'Internal flash memory', 'IOS images, `vlan.dat`, `config.text` on switches', '`flash:c2960x-universalk9-mz.152-7.E3.bin`'],
      ['`nvram:`', 'Non-volatile RAM', '`startup-config` on routers', '`nvram:startup-config`'],
      ['`system:`', 'RAM', '`running-config`', '`system:running-config`'],
      ['`usbflash0:`', 'USB flash drive', 'Extra storage, image or config copies', '`usbflash0:r1-confg`'],
      ['`tftp:`', 'TFTP server', 'Unauthenticated copies', '`tftp://10.1.1.100/r1-confg`'],
      ['`ftp:`', 'FTP server', 'Copies with a login', '`ftp://backup:password@10.1.1.100/r1-confg`'],
      ['`scp:`', 'SSH (SCP) server', 'Encrypted copies', '`scp://backup@10.1.1.100/r1-confg`'],
    ],
    caption: '`startup-config` and `running-config` are shorthand for the `nvram:` and `system:` locations.',
    notes:
      'Memorize which prefix points to which place. `flash:` is where the IOS image lives. `nvram:` is where a router keeps its `startup-config`, the configuration loaded at boot, while `running-config` is the live configuration in RAM, reachable as `system:running-config`. In everyday use you simply type `startup-config` and `running-config` and IOS maps them to the right place. Catalyst switches are slightly different: the startup configuration is stored as the file `config.text` in flash, although the name `startup-config` still works in `copy` commands. Remote servers are addressed either interactively, where `copy tftp: flash:` makes IOS prompt for the host and file names, or in one line with a **URL**: `tftp://host/file`, `ftp://user:password@host/file` and `scp://user@host/file`. Notice that only the FTP form carries credentials in the URL. TFTP has no login, and SCP asks for the password at the prompt.',
  },
  {
    kind: 'cli',
    title: 'Backing up the configuration with TFTP',
    code: `R1# copy running-config tftp:
Address or name of remote host []? 10.1.1.100
Destination filename [r1-confg]? r1-backup-oct03.cfg
!!
1112 bytes copied in 0.040 secs (27800 bytes/sec)
R1# copy startup-config tftp://10.1.1.100/r1-startup.cfg
Address or name of remote host [10.1.1.100]?
Destination filename [r1-startup.cfg]?
!!
1112 bytes copied in 0.056 secs (19857 bytes/sec)`,
    highlight: ['copy running-config tftp:', 'copy startup-config tftp://10.1.1.100/r1-startup.cfg', 'r1-confg'],
    caption: 'Press Enter to accept the default in brackets; the default file name is hostname-confg.',
    bullets: [
      'Syntax is **copy source destination**: here running-config to the server',
      'IOS prompts for the **remote host** and the **destination filename**',
      'Each exclamation point means data was transferred successfully',
      'A one-line URL skips the first prompt but still asks you to confirm',
    ],
    notes:
      'A configuration backup is the simplest copy you can do. Reading the command left to right tells you the direction: `copy running-config tftp:` copies **from** the active configuration **to** the TFTP server. IOS then prompts for the remote host address and for the destination file name, offering a default in square brackets. The default name is the router host name followed by `-confg`, so a router called R1 proposes `r1-confg`. Each exclamation point is a successful chunk of data, a dot would mean a timeout, and the summary line reports the size and speed. You can type the whole destination as a URL, as in the second command, and IOS still shows the prompts with your values filled in so you can confirm them. The IOS image is backed up the same way, with `copy flash: tftp:`. Many TFTP servers refuse to accept an upload unless a file with that name already exists and is writable, so a failed backup is not always a network problem.',
  },
  {
    kind: 'cli',
    title: 'Restoring: running-config merges, startup-config replaces',
    code: `R1# copy tftp: running-config
Address or name of remote host []? 10.1.1.100
Source filename []? r1-backup-oct03.cfg
Destination filename [running-config]?
Accessing tftp://10.1.1.100/r1-backup-oct03.cfg...
Loading r1-backup-oct03.cfg from 10.1.1.100 (via GigabitEthernet0/0/0): !
[OK - 1112 bytes]

1112 bytes copied in 4.448 secs (250 bytes/sec)
R1# copy tftp: startup-config
Address or name of remote host [10.1.1.100]?
Source filename [r1-backup-oct03.cfg]?
Destination filename [startup-config]?
Accessing tftp://10.1.1.100/r1-backup-oct03.cfg...
Loading r1-backup-oct03.cfg from 10.1.1.100 (via GigabitEthernet0/0/0): !
[OK - 1112 bytes]

1112 bytes copied in 2.000 secs (556 bytes/sec)`,
    highlight: ['copy tftp: running-config', 'copy tftp: startup-config'],
    caption: 'Same file, very different effect depending on the destination.',
    bullets: [
      'Copy **to running-config**: the file is **merged** into the live configuration',
      'Commands that exist now but are not in the file are **not removed**',
      'Copy **to startup-config**: the saved file is **replaced**; it takes effect after `reload`',
      'Source is `[]` (you must type it) when IOS has no default',
    ],
    notes:
      'Restoring a configuration looks like a backup in reverse, but the destination decides the behavior. When the destination is `running-config`, IOS **merges** the file: it applies each command in the file to the current configuration, overwriting values that conflict and leaving everything else alone. Anything that exists on the device but is missing from the file stays. This surprises engineers who expect a clean rebuild, and it is a favorite exam trap. When the destination is `startup-config`, IOS **replaces** the saved file completely; nothing changes in the running device until the next `reload`. Note the **Accessing** and **Loading** lines: the device names the interface it used to reach the server, and `[OK - 1112 bytes]` confirms the transfer. If you need a true replace without reloading, newer IOS releases offer the `configure replace` feature, but the exam focuses on the merge-versus-replace distinction between the two destinations.',
  },
  {
    kind: 'cli',
    title: 'FTP credentials and secure copies',
    code: `R1# configure terminal
R1(config)# ip ftp username backup
R1(config)# ip ftp password Wiz4rdFtp
R1(config)# end
R1# copy running-config ftp:
Address or name of remote host []? 10.1.1.100
Destination filename [r1-confg]?
Writing r1-confg !
1112 bytes copied in 2.184 secs (509 bytes/sec)`,
    highlight: ['ip ftp username backup', 'ip ftp password Wiz4rdFtp', 'copy running-config ftp:'],
    caption: 'The FTP login is stored in the configuration and crosses the network in cleartext.',
    bullets: [
      '`ip ftp username` and `ip ftp password` supply the login for every `ftp:` copy',
      'Alternative: put them in the URL, `ftp://backup:password@10.1.1.100/r1-confg`',
      '`ip ftp passive` makes the router use passive-mode data connections',
      'For encryption use `copy scp:` (TCP 22) instead of FTP or TFTP',
    ],
    notes:
      'TFTP needs no login, but FTP does, and a router has no keyboard to type one at the time of the copy. IOS therefore stores the credentials globally: `ip ftp username` and `ip ftp password` in global configuration, used automatically by every `copy` that involves `ftp:`. The alternative is to embed them in the URL, which is convenient but leaves the password in your command history. Either way the password crosses the network in cleartext, exactly as it would for any FTP client, and it sits in the configuration file, which is itself something you may later back up to a server. That is the security argument for **SCP** and **SFTP**: they run inside SSH on TCP 22 and encrypt both the credentials and the data. On a router, `copy scp:` is the secure counterpart of `copy ftp:` and `copy tftp:`. If a question asks which two commands give a router an FTP login, the answers are the `ip ftp username` and `ip ftp password` pair.',
  },
  {
    kind: 'diagram',
    title: 'IOS image upgrade workflow',
    diagram: {
      type: 'flow',
      width: 11,
      height: 4,
      nodes: [
        { id: 'n1', label: 'Plan', sub: 'image, RAM, flash space', shape: 'pill', x: 1.4, y: 1 },
        { id: 'n2', label: 'Back up', sub: 'config and old image', x: 4.2, y: 1 },
        { id: 'n3', label: 'Copy', sub: 'copy tftp: flash:', x: 7, y: 1 },
        { id: 'n4', label: 'Verify', sub: 'verify /md5', tone: 'accent', x: 9.8, y: 1 },
        { id: 'n5', label: 'Set boot', sub: 'boot system flash:', x: 9.8, y: 3 },
        { id: 'n6', label: 'Reload', sub: 'save, then reload', x: 7, y: 3 },
        { id: 'n7', label: 'Confirm', sub: 'show version', shape: 'pill', tone: 'good', x: 4.2, y: 3 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
        { from: 'n5', to: 'n6' },
        { from: 'n6', to: 'n7' },
      ],
    },
    caption: 'Keep the old image in flash until the new one has booted and been confirmed.',
    notes:
      'An IOS upgrade is a seven-step routine, and the order matters. **Plan**: download the right image for the platform from Cisco, note the published MD5 checksum, and make sure the device has enough RAM and free flash. **Back up** the running configuration and, if you can, the old image. **Copy** the new image into flash with `copy tftp: flash:` after confirming the server is reachable. **Verify** it with `verify /md5` and compare the result with the checksum from Cisco: a mismatch means corruption or tampering. Only then tell the device what to boot with `boot system flash:` and save the configuration, so the setting survives the **reload**. After the device comes back up, **confirm** the new version and image name in `show version`. Keeping the old image in flash gives you an instant rollback, which is why you delete it only after the new one is proven.',
  },
  {
    kind: 'cli',
    title: 'Upgrade step 1: copy and verify the image',
    code: `SW1# copy tftp: flash:
Address or name of remote host []? 10.1.1.100
Source filename []? c2960x-universalk9-mz.152-7.E3.bin
Destination filename [c2960x-universalk9-mz.152-7.E3.bin]?
Accessing tftp://10.1.1.100/c2960x-universalk9-mz.152-7.E3.bin...
Loading c2960x-universalk9-mz.152-7.E3.bin from 10.1.1.100 (via Vlan1): !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[OK - 25212600 bytes]

25212600 bytes copied in 62.640 secs (402500 bytes/sec)
SW1# dir flash:
Directory of flash:/

    2  -rwx    24962304   Mar 1 1993 00:09:35 +00:00  c2960x-universalk9-mz.152-4.E5.bin
    3  -rwx        1916   Mar 1 1993 00:11:20 +00:00  config.text
    4  -rwx         616   Mar 1 1993 00:04:47 +00:00  vlan.dat
    5  -rwx    25212600   Oct 3 2026 10:22:11 +00:00  c2960x-universalk9-mz.152-7.E3.bin

122185728 bytes total (72008292 bytes free)
SW1# verify /md5 flash:c2960x-universalk9-mz.152-7.E3.bin
..............................................................Done!
verify /md5 (flash:c2960x-universalk9-mz.152-7.E3.bin) = 9b2c13c7a8f1d5ee6c4a0b78e3d914f5`,
    highlight: ['copy tftp: flash:', 'verify /md5', '[OK - 25212600 bytes]', '9b2c13c7a8f1d5ee6c4a0b78e3d914f5'],
    caption: 'Compare the 32-digit hash with the MD5 checksum published for this image.',
    notes:
      'This transcript is the heart of the upgrade. `copy tftp: flash:` prompts for the server, the source file and the destination name, which defaults to the source name. The long line of exclamation points is the download, and `[OK - 25212600 bytes]` confirms that all bytes arrived. The speed in the summary line is the byte count divided by the elapsed time. `dir flash:` now shows both images, and the free space dropped from 97220892 to 72008292 bytes, exactly the size of the new image. Do not boot yet. `verify /md5` reads the file back from flash and prints its **MD5 hash**, a 128-bit value shown as 32 hexadecimal digits. Compare it character by character with the checksum on the download page. If they match, the file is intact. If they differ, the copy was corrupted or the file was tampered with, so delete it and copy again. You can also type the expected hash after the file name and let IOS compare for you.',
  },
  {
    kind: 'cli',
    title: 'Upgrade step 2: boot variable, reload, confirm',
    code: `SW1# configure terminal
SW1(config)# boot system flash:c2960x-universalk9-mz.152-7.E3.bin
SW1(config)# end
SW1# copy running-config startup-config
Destination filename [startup-config]?
Building configuration...
[OK]
SW1# reload
Proceed with reload? [confirm]
(the switch reloads and boots the new image)
SW1# show version | include Cisco IOS Software|System image
Cisco IOS Software, C2960X Software (C2960X-UNIVERSALK9-M), Version 15.2(7)E3, RELEASE SOFTWARE (fc3)
System image file is "flash:c2960x-universalk9-mz.152-7.E3.bin"`,
    highlight: ['boot system flash:c2960x-universalk9-mz.152-7.E3.bin', 'reload', 'Version 15.2(7)E3'],
    caption: 'Save the configuration before reloading, or the boot variable is lost.',
    notes:
      'Copying an image into flash does not make the device use it. The **boot variable** decides which image loads at startup, and `boot system flash:` followed by the file name sets it. Without a `boot system` command, the device boots the first suitable image it finds in flash, which may well be the old one. Save the configuration with `copy running-config startup-config` so that the boot statement survives, then `reload` and confirm the prompt. Once the device is back, use `show version` to prove the result: the first line shows the IOS version, and `System image file` shows the file it booted from. `show boot` on a switch, or `show bootvar` on a router, displays the configured boot path. If `show version` still reports the old release, the boot variable was not set or not saved. Platforms differ in details, but the sequence is the same: copy, verify, set the boot variable, save, reload, confirm.',
  },
  {
    kind: 'steps',
    title: 'Troubleshooting file transfers',
    steps: [
      { title: 'Ping the server', text: 'No reply means an IP, mask, gateway or routing problem. Fix it before blaming the protocol.' },
      { title: 'Check filtering', text: 'ACLs and firewalls must permit UDP 69 for TFTP, or TCP 21 plus the data ports for FTP.' },
      { title: 'Check the server', text: 'Service running, file name and case exactly right, file readable; writable for uploads.' },
      { title: 'Check device space', text: '`dir flash:` shows free bytes. Delete an old image only after the new one is verified.' },
      { title: 'Verify the result', text: '`verify /md5` against the published checksum before you set `boot system`.' },
    ],
    notes:
      'Most failed transfers fall into a handful of causes, so work through them in order. A **Timed out** error on a TFTP copy usually means the server is unreachable, the TFTP service is not running, or a firewall is dropping UDP 69, so start with a ping. If the ping works but the copy still times out, check ACLs along the path and the server itself. A wrong file name, wrong case or an unreadable file shows up as an error from the server rather than a timeout. For FTP, a login that works but a hang on the transfer points to active-mode data connections being blocked, so try `ip ftp passive`. On the device side, the error **Not enough space on device** means flash is full: free space with `delete` after confirming you still have a good image. Finally, an MD5 mismatch is never to be ignored: do not set it as the boot image.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: '**TFTP = UDP 69 with no authentication. FTP = TCP 21 (control) and TCP 20 (active data) with a username and password.**',
    bullets: [
      'Active mode: the **server** opens the data connection; passive mode: the **client** does',
      'Only **SFTP** and **SCP** (TCP 22, over SSH) encrypt; TFTP and FTP do not',
      '`copy tftp: running-config` **merges**; `copy tftp: startup-config` **replaces**',
      'The default file name for a backup is the hostname plus `-confg`',
      '`verify /md5` before `boot system`; prove the upgrade with `show version`',
      '`flash:` holds images, `nvram:` the startup-config on routers, `system:` the running-config',
    ],
    notes:
      'These are the traps in the order they usually appear. Protocol facts come first: TFTP is UDP 69 and has no authentication, while FTP uses TCP 21 for control and TCP 20 for active-mode data and requires a login. Next, the mode confusion: in active mode the server calls the client back, so firewalls break it; in passive mode the client makes both connections. Third, security wording: if a question asks for an encrypted transfer, the answer is SFTP or SCP, never TFTP or FTP, and never FTP passive mode, which only changes the direction of the data connection. Fourth, the merge trap: copying a file into `running-config` adds to the current configuration rather than replacing it. Fifth, the workflow: verify the MD5 hash before you set the boot variable, and prove the result with `show version`. Finally, file system names: images in `flash:`, startup configuration in `nvram:` on routers, running configuration in `system:`.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '**TFTP**: UDP 69, no authentication, simple and small',
      '**FTP**: TCP 21 control and TCP 20 data, login required, active or passive',
      '**SFTP** and **SCP**: TCP 22 over SSH, authenticated and encrypted',
      'File systems: `flash:`, `nvram:`, `system:`, `usbflash0:`, `tftp:`, `ftp:`; inspect with `show file systems` and `dir`',
      '`copy source destination` backs up, restores and upgrades; running-config merges',
      'Upgrade: copy, **verify /md5**, `boot system flash:`, save, reload, `show version`',
    ],
    notes:
      'Pull the lesson together by following one file through its life. A configuration or image sits in a local file system such as `flash:` or `nvram:`, and the `copy` command moves it to or from a remote file server over TFTP, FTP, SCP or SFTP. Choose the protocol by what you need: TFTP when simple is enough, FTP when you need a login and TCP reliability, SCP or SFTP when the data and the credentials must be protected. Know the numbers: UDP 69, TCP 21 and 20, TCP 22. Know the FTP modes: active means the server dials back from port 20, passive means the client dials in. Know the behavior of destinations: running-config merges, startup-config replaces. And know the upgrade routine cold: check space with `dir`, copy, `verify /md5`, set `boot system flash:`, save, reload and confirm with `show version`. Next, use the flashcards and quiz, then the exam questions with exhibits.',
  },
];
