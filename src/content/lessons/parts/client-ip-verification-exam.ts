import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. A user on a wired PC reports that no applications can reach the network. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig /all

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 3C-52-82-1A-2B-3C
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::1c4b:9a2e:7d31:5e0a%12(Preferred)
   Autoconfiguration IPv4 Address. . : 169.254.201.14(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :`,
    },
    options: [
      'The network cable is disconnected',
      'The PC did not receive a response from a DHCP server',
      'The DNS server address is incorrect',
      'The default gateway is configured in the wrong subnet',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'An **Autoconfiguration IPv4 Address** in 169.254.0.0/16 with a /16 mask and no gateway is APIPA: DHCP is enabled but no Offer arrived, so Windows assigned itself a link-local address. A disconnected cable would show `Media disconnected` and no IPv4 address at all. DNS settings cannot cause a self-assigned address, and no gateway is configured, so it cannot be in the wrong subnet; the empty gateway is a consequence of the DHCP failure.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 can ping other hosts in 10.1.10.0/24 but cannot reach any other network. Other PCs on the same switch work normally. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::1c4b:9a2e:7d31:5e0a%12
   IPv4 Address. . . . . . . . . . . : 10.1.10.25
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.1.1.1`,
    },
    options: [
      'The subnet mask should be 255.255.0.0',
      'The default gateway is not in the PC\'s subnet',
      'No DNS server is configured',
      '10.1.10.25 is the broadcast address of the subnet',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'PC1 is in 10.1.10.0/24 (10.1.10.0 to 10.1.10.255), but its gateway 10.1.1.1 is in 10.1.1.0/24, so PC1 cannot hand off-subnet traffic to it; local traffic still works because it never uses the gateway. A /16 mask would not fix routing and would misdescribe the real subnet. DNS affects names, not reaching remote IP addresses, and plain `ipconfig` does not even list DNS servers. The broadcast address of 10.1.10.0/24 is 10.1.10.255, not .25.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. The Mac is in VLAN 20 (172.16.5.0/24), whose gateway 172.16.5.1 has proxy ARP disabled. The user reaches the internet and servers in 10.0.0.0/8, but not the printers in 172.16.6.0/24. What is the reason?',
    exhibit: {
      kind: 'cli',
      text: `$ ifconfig en0
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
        ether 8c:85:90:4a:6e:21
        inet 172.16.5.20 netmask 0xffff0000 broadcast 172.16.255.255
        media: autoselect
        status: active
$ netstat -rn -f inet | grep default
default            172.16.5.1         UGScg          en0`,
    },
    options: [
      'The Mac has no default gateway',
      'The mask is /16, so the Mac treats 172.16.6.0/24 as local and ARPs for the printers instead of using the gateway',
      'The mask is /24, so traffic to the printers goes to the gateway, which has no route to them',
      'The en0 link is down',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      '`0xffff0000` is 255.255.0.0 (/16), and the broadcast 172.16.255.255 confirms it. The Mac therefore believes every 172.16.x.x address is on its own link, so for a printer at 172.16.6.x it sends ARP requests that nothing in VLAN 20 answers, and with proxy ARP disabled the router will not answer for them either. Destinations outside 172.16.0.0/16 still go to the default gateway 172.16.5.1, which the routing table shows is present, so the internet and 10.0.0.0/8 work. Reading the mask as /24 is exactly the mistake the hex format invites, and `status: active` proves the link is up.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'A Windows user can ping 10.2.20.80 but gets "Ping request could not find host" for srv1.corp.example.com. Which two commands should the technician use to verify the DNS settings and test name resolution? (Choose two.)',
    options: [
      '`ipconfig /all`',
      '`nslookup srv1.corp.example.com`',
      '`arp -a`',
      '`route print`',
      '`tracert -d 10.2.20.80`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '`ipconfig /all` shows which DNS servers the PC is configured to use, and `nslookup` queries a DNS server directly, showing which server answered and what it returned. `arp -a` and `route print` cover local MAC resolution and routing, which the successful ping by IP already proves are working. `tracert -d` to the IP tests the path, which is also known to be good; the fault is confined to name resolution.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each command to its purpose.',
    pairs: [
      { left: '`ipconfig /flushdns`', right: 'Clear the Windows DNS resolver cache' },
      { left: '`networksetup -getinfo Wi-Fi`', right: 'Show the IP, mask and router of a macOS network service' },
      { left: '`ip route`', right: 'Show the Linux routing table and default gateway' },
      { left: '`scutil --dns`', right: 'Show the macOS DNS resolver configuration' },
      { left: '`ipconfig /release`', right: 'Give up the current DHCP lease on Windows' },
    ],
    difficulty: 1,
    explanation:
      '`/flushdns` empties the Windows resolver cache and `/release` sends a DHCPRELEASE. On macOS, `networksetup -getinfo` prints address, mask and Router for a service, and `scutil --dns` shows the resolvers and nameservers in use. On Linux, `ip route` prints the routing table with the `default via` line.',
  },
  {
    id: 'e6',
    type: 'categorize',
    stem: 'Drag each command to the client operating system it belongs to.',
    categories: ['Windows', 'macOS', 'Linux'],
    items: [
      { text: '`ipconfig /all`', category: 0 },
      { text: '`tracert`', category: 0 },
      { text: '`netsh wlan show interfaces`', category: 0 },
      { text: '`networksetup -getinfo Wi-Fi`', category: 1 },
      { text: '`scutil --dns`', category: 1 },
      { text: '`ip address`', category: 2 },
      { text: '`resolvectl status`', category: 2 },
      { text: '`nmcli device show`', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Windows uses `ipconfig`, `tracert` and `netsh`. `networksetup` and `scutil` are Apple utilities. `ip` (iproute2), `resolvectl` (systemd-resolved) and `nmcli` (NetworkManager) are Linux tools. Commands such as `netstat -rn`, `arp -a`, `nslookup` and `ifconfig` exist on more than one OS, which is why they are not in this list.',
  },
  {
    id: 'e7',
    type: 'order',
    stem: 'A technician tests a PC with a series of pings, starting closest to the PC and moving outward. Put the tests in that order.',
    items: [
      '`ping 127.0.0.1`',
      'Ping the PC\'s own IP address',
      'Ping the default gateway',
      'Ping the remote server by IP address',
      'Ping the remote server by name',
    ],
    difficulty: 2,
    explanation:
      'The loopback tests the TCP/IP stack, the PC\'s own address proves it is bound to the NIC, the gateway proves the local segment, the remote IP proves end-to-end routing, and the name test finally adds DNS. The first test that fails isolates the fault; testing by name before by IP would mix a DNS fault with a routing fault.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. A Linux workstation has no IPv4 address, and the user reports that "DHCP is broken". What should the technician check first?',
    exhibit: {
      kind: 'cli',
      text: `$ ip address show enp0s3
2: enp0s3: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether 52:54:00:3a:7c:19 brd ff:ff:ff:ff:ff:ff`,
    },
    options: [
      'The DHCP server scope for the subnet',
      'The cable and the switch port the workstation connects to',
      'Whether the interface was administratively disabled with `ip link set enp0s3 down`',
      'The DNS servers listed by `resolvectl status`',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      '**NO-CARRIER** and `state DOWN` mean the NIC detects no physical link, even though the **UP** flag shows the interface is administratively enabled, which rules out the admin-down option. Without a link the host cannot send a single DHCP Discover, so the DHCP scope is not the first suspect. Check the cable, patch panel and switch port (shut down, err-disabled or faulty). DNS is irrelevant until the host has a link and an address.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. A user cannot reach the server at 10.2.20.80. What does the output show?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>tracert -d 10.2.20.80

Tracing route to 10.2.20.80 over a maximum of 30 hops

  1    <1 ms    <1 ms    <1 ms  10.1.10.1
  2     1 ms     1 ms     1 ms  10.0.0.2
  3     *        *        *     Request timed out.
  4     *        *        *     Request timed out.
  5     *        *        *     Request timed out.`,
    },
    options: [
      'The PC\'s default gateway is misconfigured',
      'DNS resolution of the server name failed',
      'The PC and the first two routers forward correctly; the fault lies beyond 10.0.0.2 or on the return path',
      'The server is powered off',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Hop 1 answered from 10.1.10.1, so the PC\'s gateway is correct and reachable, and `-d` with an IP address means DNS was never involved. Router 10.0.0.2 answered too, so the problem is at the next hop, in routing beyond it, in a filter blocking probes or replies, or on the return path. A powered-off server is only one possibility; the trace cannot distinguish it from a missing route or an ACL beyond 10.0.0.2, so it is not what the output shows.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. A laptop is connected to the corporate WLAN but cannot reach any resources. Which issue should the administrator investigate?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>netsh wlan show interfaces
    Name                   : Wi-Fi
    State                  : connected
    SSID                   : CorpWLAN
    Radio type             : 802.11ax
    Authentication         : WPA2-Personal
    Channel                : 36
    Signal                 : 94%

C:\\>ipconfig
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . :
   Autoconfiguration IPv4 Address. . : 169.254.12.200
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :`,
    },
    options: [
      'The pre-shared key configured on the laptop is wrong',
      'The signal is too weak for reliable communication',
      'DHCP is not reaching the WLAN clients, for example an exhausted scope or a wrong VLAN or relay for the WLAN',
      'The laptop joined the wrong SSID',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      '`State: connected` to CorpWLAN with WPA2-Personal proves the SSID is right and the PSK was accepted; a wrong key prevents the connection entirely. A 94% signal on channel 36 (5 GHz) is excellent. The only broken piece is addressing: the 169.254 APIPA address means no DHCP Offer reached the client. Check the scope for free leases, the VLAN the WLAN maps to and the `ip helper-address` on that VLAN\'s gateway.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Most users see the SSID "Corp5", which is broadcast only on 5 GHz, but one older laptop does not see it at all. Which two conditions could explain this? (Choose two.)',
    options: [
      'The laptop\'s wireless adapter supports only 2.4 GHz',
      'The laptop is outside the coverage area of the 5 GHz radios',
      'The laptop is configured with the wrong pre-shared key',
      'The DHCP scope for the WLAN is exhausted',
      'The laptop has an incorrect DNS server',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'An SSID appears in the list only when the client hears the AP\'s beacons or probe responses on a band it supports. A 2.4 GHz-only radio never hears a 5 GHz-only SSID, and a client beyond the shorter 5 GHz coverage will not hear it either. A wrong PSK, an exhausted scope and a bad DNS server all cause trouble only after the user selects the network; the SSID would still be listed.',
  },
  {
    id: 'e12',
    type: 'categorize',
    stem: 'A help-desk analyst reviews client symptoms. Drag each symptom to the area most likely at fault.',
    categories: ['Physical link', 'IP configuration', 'Name resolution'],
    items: [
      { text: '`Media disconnected` in `ipconfig` output', category: 0 },
      { text: '`NO-CARRIER` in `ip address` output', category: 0 },
      { text: 'Address 169.254.44.10 with no default gateway', category: 1 },
      { text: 'Default gateway outside the host\'s subnet', category: 1 },
      { text: '"Could not find host", yet ping by IP succeeds', category: 2 },
      { text: '`nslookup` reports "Non-existent domain"', category: 2 },
    ],
    difficulty: 2,
    explanation:
      '`Media disconnected` and `NO-CARRIER` both mean the NIC sees no link. An APIPA address (DHCP failed) and an off-subnet gateway are IP configuration faults. A name that fails while the IP works, and a DNS server replying that the name does not exist, are name-resolution problems; the network path itself is fine in both cases.',
  },
  {
    id: 'e13',
    type: 'input',
    stem: 'A DNS record for an intranet server was changed, but a Windows PC keeps connecting to the old address. Which command clears the PC\'s DNS resolver cache?',
    answers: ['ipconfig /flushdns'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ipconfig /flushdns` empties the DNS Client cache, so the next lookup queries the DNS server again. `ipconfig /displaydns` only shows the cached entries, and `/release` and `/renew` act on the DHCP lease, not on cached DNS answers.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. Which command produced this output?',
    exhibit: {
      kind: 'cli',
      text: `2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:3a:7c:19 brd ff:ff:ff:ff:ff:ff
    inet 10.1.10.40/24 brd 10.1.10.255 scope global dynamic noprefixroute enp0s3
       valid_lft 85312sec preferred_lft 85312sec`,
    },
    options: ['`ip address show enp0s3`', '`ifconfig enp0s3`', '`ip route`', '`nmcli device show enp0s3`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The numbered interface line, the `link/ether` field and `inet 10.1.10.40/24` followed by `valid_lft` are iproute2 `ip address` output. Linux `ifconfig` prints `inet 10.1.10.40  netmask 255.255.255.0` and an `ether` line, `ip route` prints routes such as `default via 10.1.10.1`, and `nmcli device show` uses labels like `IP4.ADDRESS[1]`.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two fields appear in `ipconfig /all` output but not in plain `ipconfig` output? (Choose two.)',
    options: ['IPv4 Address', 'Subnet Mask', 'Physical Address', 'Default Gateway', 'DNS Servers'],
    answers: [2, 4],
    difficulty: 2,
    explanation:
      'Plain `ipconfig` lists the connection-specific DNS suffix, the IPv6 link-local and IPv4 addresses, the subnet mask and the default gateway. The `/all` switch adds the MAC (**Physical Address**), the **DNS Servers**, DHCP Enabled, the DHCP Server and the lease times, among others.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 can ping PC2 but cannot reach Server1. PC2 can reach Server1. What is the cause of the problem?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: '10.1.10.25/24 GW 10.1.10.254', x: 1, y: 1 },
          { id: 'pc2', icon: 'pc', label: 'PC2', sub: '10.1.10.26/24 GW 10.1.10.1', x: 1, y: 3 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 3.5, y: 2 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'G0/0/0 10.1.10.1/24', x: 6, y: 2 },
          { id: 'srv', icon: 'server', label: 'Server1', sub: '10.2.20.80', x: 8.8, y: 2 },
        ],
        links: [
          { from: 'pc1', to: 'sw', toLabel: 'Fa0/1' },
          { from: 'pc2', to: 'sw', toLabel: 'Fa0/2' },
          { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'srv', fromLabel: 'G0/0/1', label: '10.2.20.0/24' },
        ],
      },
    },
    options: [
      'R1 has no route to 10.2.20.0/24',
      'PC1 has an incorrect default gateway',
      'PC1 has an incorrect subnet mask',
      'The switch port for PC1 is in the wrong VLAN',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'PC2 reaches Server1 through R1, so R1\'s routing and the server are fine. PC1 and PC2 ping each other, so they share a VLAN, and both use a /24 mask. The only difference is the gateway: PC1 points to 10.1.10.254, but R1\'s interface is 10.1.10.1, so PC1 sends off-subnet traffic toward an address that does not exist. A wrong VLAN would also break the PC1-to-PC2 ping.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. What is the most likely problem?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :

C:\\>ipconfig /renew

Windows IP Configuration

No operation can be performed on Ethernet while it has its media disconnected.`,
    },
    options: [
      'The DHCP server is unreachable',
      'There is no physical link on the Ethernet adapter',
      'The PC has a static IP address that conflicts with another host',
      'The DNS resolver cache is corrupted',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      '`Media disconnected` means the adapter detects no link signal (an unplugged or damaged cable, a dead or shut-down switch port, or a faulty NIC), and Windows will not even attempt DHCP on it. An unreachable DHCP server produces an APIPA address and an "unable to contact your DHCP server" timeout instead. An address conflict or a DNS cache problem needs a working link before it can appear.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. A Linux host cannot resolve internal names. The corporate DNS servers are 10.1.99.53 and 10.1.99.54. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `$ cat /etc/resolv.conf
nameserver 127.0.0.53
options edns0 trust-ad
search corp.example.com
$ resolvectl status enp0s3
Link 2 (enp0s3)
    Current Scopes: DNS
Current DNS Server: 192.168.50.53
       DNS Servers: 192.168.50.53
        DNS Domain: corp.example.com`,
    },
    options: [
      '/etc/resolv.conf points to 127.0.0.53, which is not a valid DNS server',
      'The interface uses the wrong upstream DNS server, 192.168.50.53, learned from DHCP or static configuration',
      'The DNS search domain is wrong',
      'The host has no default gateway',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      '127.0.0.53 is the local **systemd-resolved** stub: applications send queries there and the resolver forwards them to the per-link servers, so that line is normal. `resolvectl` reveals the real upstream server, 192.168.50.53, which is not one of the corporate servers; typically a wrong DHCP `dns-server` option or a stale static setting. The search domain matches corp.example.com, and the exhibit contains no routing information, so a missing gateway cannot be concluded.',
  },
  {
    id: 'e19',
    type: 'input',
    stem: 'The output of `ifconfig en0` on a Mac shows `inet 10.20.4.77 netmask 0xfffffc00`. What is the prefix length? (Answer as /nn.)',
    answers: ['/22', '22', '255.255.252.0'],
    placeholder: '/nn',
    difficulty: 2,
    explanation:
      'Each pair of hex digits is one octet: ff = 255, ff = 255, fc = 252, 00 = 0, giving 255.255.252.0. 252 is 11111100 in binary, so the mask has 8 + 8 + 6 = **22** network bits, and the host sits in 10.20.4.0/22 (10.20.4.0 to 10.20.7.255).',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. The user of this laptop reports very slow and intermittent Wi-Fi. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `C:\\>netsh wlan show interfaces
    Name                   : Wi-Fi
    State                  : connected
    SSID                   : CorpWLAN
    Radio type             : 802.11n
    Authentication         : WPA2-Personal
    Channel                : 11
    Receive rate (Mbps)    : 13
    Transmit rate (Mbps)   : 6.5
    Signal                 : 21%`,
    },
    options: [
      'The pre-shared key is incorrect',
      'The laptop has a weak signal from the AP, forcing very low data rates',
      'The DHCP server did not assign an address',
      'The laptop is connected to the wrong SSID',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'A 21% signal with receive and transmit rates of 13 and 6.5 Mbps shows a client at the edge of coverage: the radio falls back to slow, robust rates and retries frames, which users feel as slowness and drops. The client is connected and authenticated with WPA2-Personal, so the PSK is correct; the SSID is the corporate one; and DHCP problems show up as APIPA or wrong-subnet addresses, not as a low link rate.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements about a Windows host with the address 169.254.10.20 are true? (Choose two.)',
    options: [
      'It can communicate only with hosts on the same local link',
      'It received the address from a DHCP server whose pool is exhausted',
      'It has no default gateway',
      'It can reach the internet through NAT',
      'It indicates that the network cable is unplugged',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'APIPA addresses (169.254.0.0/16) are self-assigned when no DHCP server answers, come with no default gateway, and work only on the local link because routers do not forward them. A DHCP server never hands out 169.254 addresses; an exhausted pool causes APIPA precisely because the server does not answer. NAT cannot help a host without a gateway, and an unplugged cable shows `Media disconnected` with no IPv4 address at all.',
  },
];
