import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which transport protocol and port number does TFTP use for its initial request?',
    options: ['TCP 69', 'UDP 69', 'UDP 21', 'TCP 20'],
    answer: 1,
    difficulty: 1,
    explanation:
      'TFTP is carried over UDP and the initial request goes to **port 69**. TCP 20 and 21 belong to FTP, TFTP is not defined over TCP, and UDP 21 is not a standard file transfer service.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which file transfer protocol uses TCP port 21 for its control connection?',
    options: ['TFTP', 'FTP', 'SCP', 'SFTP'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**FTP** uses TCP 21 for control and TCP 20 for data in active mode. TFTP uses UDP 69, while SCP and SFTP both run inside SSH on TCP 22.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is correct?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show file systems
File Systems:

     Size(b)     Free(b)      Type  Flags  Prefixes
*  122185728    72008292     flash     rw   flash:
       65536       57456     nvram     rw   nvram:
           -           -    opaque     rw   null:
           -           -   network     rw   tftp:
           -           -   network     rw   ftp:
           -           -   network     rw   scp:`,
    },
    options: [
      'nvram: is the default file system',
      'tftp: shows no free space, so TFTP copies will fail',
      'flash: is the default file system and is read-write',
      'flash: is read-only because it has an asterisk',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The asterisk marks `flash:` as the default file system and the `rw` flag shows that it is read-write. The dashes for `tftp:` only mean that size and free space do not apply to a network file system; they do not mean transfers fail. The asterisk is a default marker, not a read-only flag: access is shown in the Flags column.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer runs `copy tftp: flash:` for a 25212600-byte image on SW2 and receives the error "Not enough space on device". Which action allows the copy to succeed?',
    exhibit: {
      kind: 'cli',
      text: `SW2# dir flash:
Directory of flash:/

    2  -rwx    23968768   Mar 1 1993 00:07:12 +00:00  c2960x-universalk9-mz.152-2.E6.bin
    3  -rwx    24308736   Mar 1 1993 00:09:50 +00:00  c2960x-universalk9-mz.152-4.E1.bin
    4  -rwx    24962304   Mar 1 1993 00:12:31 +00:00  c2960x-universalk9-mz.152-4.E5.bin
    5  -rwx    25001984   Mar 1 1993 00:15:08 +00:00  c2960x-universalk9-mz.152-4.E8.bin
    6  -rwx        1916   Mar 1 1993 00:15:40 +00:00  config.text
    7  -rwx         616   Mar 1 1993 00:04:47 +00:00  vlan.dat

122185728 bytes total (23941404 bytes free)`,
    },
    options: [
      'Use FTP instead of TFTP, which compresses the image',
      'Copy the image to nvram: instead of flash:',
      'Delete an older, unneeded image from flash and repeat the copy',
      'Run verify /md5 on the existing images to reclaim space',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Free space is 23941404 bytes, which is 1271196 bytes less than the 25212600-byte image. Deleting one older image, such as the 23968768-byte oldest file, frees more than enough. Changing the protocol does not change the file size, `nvram:` is tiny and is not meant for images, and `verify /md5` only calculates a hash; it frees nothing.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Which command backs up the running configuration of a router to a TFTP server?',
    options: [
      '`copy tftp: running-config`',
      '`copy flash: tftp:`',
      '`copy running-config tftp:`',
      '`copy startup-config flash:`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The source comes first and the destination second, so `copy running-config tftp:` sends the active configuration to the server. `copy tftp: running-config` is the restore direction, `copy flash: tftp:` backs up the IOS image, and `copy startup-config flash:` copies the saved configuration inside the device.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two statements about FTP active mode are true? (Choose two.)',
    options: [
      'The client opens the data connection to a high port on the server',
      'The server opens the data connection from TCP port 20',
      'The client announces a data port with the PORT command',
      'It authenticates users with SSH keys',
      'It uses UDP port 69 for the control connection',
    ],
    answers: [1, 2],
    difficulty: 2,
    explanation:
      'In active mode the client tells the server which port to call with `PORT`, and the server initiates the data connection from TCP 20. The first option describes passive mode. SSH keys belong to SFTP and SCP, and UDP 69 belongs to TFTP.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. A user behind the NAT firewall can log in to the FTP server, but directory listings and downloads hang. Which change fixes the problem?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.4,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'Client', sub: '192.168.1.10', x: 1.2, y: 1.7 },
          { id: 'fw', icon: 'firewall', label: 'FW1 (NAT)', sub: 'Blocks unsolicited inbound', x: 3.9, y: 1.7, tone: 'warn' },
          { id: 'net', icon: 'internet', label: 'Internet', x: 6.4, y: 1.7 },
          { id: 'srv', icon: 'server', label: 'FTP server', sub: 'TCP 21 open', x: 8.9, y: 1.7 },
        ],
        links: [
          { from: 'pc', to: 'fw' },
          { from: 'fw', to: 'net' },
          { from: 'net', to: 'srv' },
        ],
      },
    },
    options: [
      'Open TCP 21 outbound on the firewall',
      'Change the FTP server to use UDP port 20',
      'Replace FTP with TFTP so no data connection is needed',
      'Switch the FTP client to passive mode',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The login works, so the control connection on TCP 21 is already fine. The failure is the data connection: in active mode the server dials back to the client from TCP 20, and the firewall drops that unsolicited inbound connection. In passive mode the client opens the data connection outbound as well. FTP does not use UDP, and TFTP would swap a login-protected, reliable protocol for an unauthenticated one without addressing the NAT problem.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer enters `copy tftp: running-config` to load a backup file that does not contain the default route shown. What is the result?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip route
ip route 0.0.0.0 0.0.0.0 10.0.0.2`,
    },
    options: [
      'The default route is removed because the file replaces the running configuration',
      'The default route remains because the file is merged into the running configuration',
      'The router reloads and uses the file as its startup configuration',
      'The command is rejected because running-config cannot be a copy destination',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Copying into `running-config` applies the commands from the file on top of the live configuration, a **merge**. Commands that exist on the router but not in the file, such as this default route, are not removed. Replacement happens only when the destination is `startup-config` (and takes effect at the next reload). running-config is a valid destination, and the command never reloads the router.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Which is the most likely cause of the failure?',
    exhibit: {
      kind: 'cli',
      text: `SW1# copy tftp: flash:
Address or name of remote host []? 10.1.1.100
Source filename []? c2960x-universalk9-mz.152-7.E3.bin
Destination filename [c2960x-universalk9-mz.152-7.E3.bin]?
Accessing tftp://10.1.1.100/c2960x-universalk9-mz.152-7.E3.bin...
%Error opening tftp://10.1.1.100/c2960x-universalk9-mz.152-7.E3.bin (Timed out)`,
    },
    options: [
      'Flash on SW1 does not have enough free space for the new image',
      'The image was copied but then failed its MD5 verification',
      'The ip ftp username and password are not configured on SW1',
      'The TFTP server is unreachable, not running, or blocked on UDP 69',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'A **Timed out** error means the device received no answer from the server: broken IP connectivity, a TFTP service that is not running, or a firewall or ACL dropping UDP 69. A space problem produces a "Not enough space on device" error. MD5 verification happens afterwards with `verify /md5`, and TFTP has no login, so the `ip ftp` commands are irrelevant.',
  },
  {
    id: 'e10',
    type: 'order',
    stem: 'Put the steps of an IOS image upgrade in the correct order.',
    items: [
      'Confirm the server is reachable and flash has enough free space',
      'Copy the image into flash with `copy tftp: flash:`',
      'Compare the hash from `verify /md5` with the published checksum',
      'Point the device at the new image with `boot system flash:`',
      'Save the configuration and `reload`',
      'Confirm the new release with `show version`',
    ],
    difficulty: 2,
    explanation:
      'Prepare first (reachability and space), copy the file, prove it is intact, tell the device to boot it, save the setting and reload, and finally confirm the result. Setting the boot variable before verifying risks booting a corrupt image.',
  },
  {
    id: 'e11',
    type: 'match',
    stem: 'Match each IOS file system to what it holds or reaches.',
    pairs: [
      { left: '`flash:`', right: 'IOS image files' },
      { left: '`nvram:`', right: 'Startup configuration on a router' },
      { left: '`system:`', right: 'Running configuration in RAM' },
      { left: '`usbflash0:`', right: 'USB flash drive' },
      { left: '`tftp:`', right: 'Remote TFTP server' },
    ],
    difficulty: 1,
    explanation:
      '`flash:` stores IOS images, `nvram:` stores the startup-config on a router, `system:` is the running memory that holds the running-config, `usbflash0:` is the USB drive and `tftp:` points at a remote server.',
  },
  {
    id: 'e12',
    type: 'categorize',
    stem: 'Classify each characteristic as TFTP or FTP.',
    categories: ['TFTP', 'FTP'],
    items: [
      { text: 'Uses UDP port 69', category: 0 },
      { text: 'No authentication', category: 0 },
      { text: 'Each 512-byte block is individually acknowledged', category: 0 },
      { text: 'Uses TCP ports 20 and 21', category: 1 },
      { text: 'Supports active and passive modes', category: 1 },
      { text: 'Requires a username and password', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'TFTP is the minimal UDP 69 protocol with its own per-block acknowledgements and no login. FTP uses two TCP connections (21 for control, 20 for active-mode data), supports active and passive modes and requires credentials.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'Enter the TCP port number used by both SCP and SFTP.',
    answers: ['22', 'tcp 22', 'tcp/22'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'SCP and SFTP both run inside an SSH session, so they use **TCP 22**. That is why they authenticate and encrypt, unlike TFTP (UDP 69) and FTP (TCP 20/21).',
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'Enter the command that calculates the MD5 hash of the file ios.bin stored in flash.',
    answers: ['verify /md5 flash:ios.bin', 'verify /md5 flash:/ios.bin'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`verify /md5 flash:ios.bin` reads the file and prints its 128-bit MD5 hash as 32 hexadecimal digits, which you compare with the checksum published by Cisco.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. The image c2960x-universalk9-mz.152-7.E3.bin was copied to flash and passed `verify /md5`. After a reload, `show version` still reports release 15.2(4)E5. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show boot | include BOOT
BOOT path-list      : flash:/c2960x-universalk9-mz.152-4.E5.bin`,
    },
    options: [
      'The MD5 hash did not match the published checksum',
      'The TFTP copy ended with an error',
      'The boot variable still points to the old image',
      'The ip ftp username is missing',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The BOOT path-list still names the old 15.2(4)E5 image, so the switch keeps booting it. Copying an image does not select it: `boot system flash:` with the new file name, followed by saving the configuration, is required. The scenario states that the image was copied and verified, and TFTP has no FTP credentials.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two protocols encrypt both the credentials and the transferred data? (Choose two.)',
    options: ['TFTP', 'SCP', 'FTP in passive mode', 'SFTP', 'FTP in active mode'],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'SCP and SFTP run inside SSH (TCP 22), which authenticates and encrypts. TFTP has no protection at all, and FTP sends credentials and data in cleartext in both modes; passive and active only change who opens the data connection.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which pair of global configuration commands gives a router the login it uses for FTP copies?',
    options: [
      '`ftp login` and `ftp secret`',
      '`username ftp` and `password ftp`',
      '`ip ftp username` and `ip ftp password`',
      '`ip ftp login` and `ip ftp secret`',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'IOS stores the FTP login with `ip ftp username` and `ip ftp password`. The other pairs are not valid IOS commands, and `username` defines a local login account, not an outgoing FTP login.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. The engineer presses Enter at the Destination filename prompt. What file name does the TFTP server receive?',
    exhibit: {
      kind: 'cli',
      text: `R1# copy running-config tftp:
Address or name of remote host []? 10.1.1.100
Destination filename [r1-confg]?`,
    },
    options: ['running-config', 'startup-config', 'R1.cfg', 'r1-confg'],
    answer: 3,
    difficulty: 2,
    explanation:
      'Pressing Enter accepts the default shown in square brackets. IOS builds that default from the host name plus `-confg`, so R1 proposes `r1-confg`. The other names are not offered by the prompt.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'An engineer must copy an IOS image across an untrusted network and protect both the credentials and the file. Which method meets the requirement?',
    options: [
      '`copy tftp: flash:`',
      '`copy ftp: flash:`',
      '`copy ftp: flash:` after `ip ftp passive`',
      '`copy scp: flash:`',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      '`copy scp: flash:` uses SCP over SSH on TCP 22, which authenticates and encrypts. TFTP has no protection, and FTP sends the password and the data in cleartext; passive mode only changes the direction of the data connection.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Which two statements about TFTP are true? (Choose two.)',
    options: [
      'It uses UDP port 69 for the initial request',
      'It authenticates clients with a username and password',
      'It supports directory listings and file renaming',
      'It provides no authentication and no encryption',
      'It uses TCP port 20 for the data connection',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'TFTP starts with a request to UDP 69 and offers no authentication or encryption. Usernames and passwords, directory listings and TCP 20 are features of FTP, not TFTP.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. The download page on Cisco.com lists the MD5 checksum 4e1a9d7c0b3f58a26d91c47e05b8f3a2 for this image. What should the engineer do next?',
    exhibit: {
      kind: 'cli',
      text: `SW1# verify /md5 flash:c2960x-universalk9-mz.152-7.E3.bin
.............................................................Done!
verify /md5 (flash:c2960x-universalk9-mz.152-7.E3.bin) = 9b2c13c7a8f1d5ee6c4a0b78e3d914f5`,
    },
    options: [
      'Set it with boot system and reload to test the new image',
      'Delete the file, copy it again and re-verify before using it',
      'Ignore the difference because TFTP changes the hash on transfer',
      'Copy the file to a USB drive and boot the switch from there',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The computed hash (9b2c...) does not match the published checksum (4e1a...), so the file is corrupted or altered and must not be used. Delete it and repeat the copy, verifying again. A working TFTP transfer does not change file content, booting an unverified image risks a failed boot, and moving a bad file to a USB drive does not repair it.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Which two commands list the files stored in flash? (Choose two.)',
    options: ['`show file systems`', '`dir flash:`', '`show version`', '`show flash:`', '`show running-config`'],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      '`dir flash:` and `show flash:` both list the files. `show file systems` lists the file systems and their free space rather than files, `show version` only names the image that booted, and `show running-config` displays the configuration.',
  },
];
