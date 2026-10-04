import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: '`ipconfig` vs `ipconfig /all`', back: '`ipconfig` shows address, mask and default gateway. `/all` adds the MAC (Physical Address), DHCP status and server, lease times and DNS servers.' },
  { id: 'f2', front: '`ipconfig /release`', back: 'Sends a **DHCPRELEASE** to the server and removes the adapter\'s leased IPv4 address.' },
  { id: 'f3', front: '`ipconfig /renew`', back: 'Asks DHCP for a lease; after a release this is a full Discover, Offer, Request, Ack exchange.' },
  { id: 'f4', front: '`ipconfig /flushdns`', back: 'Clears the Windows DNS resolver cache. `ipconfig /displaydns` shows what is cached.' },
  { id: 'f5', front: 'Two Windows commands that display the routing table', back: '`route print` and `netstat -rn` (same table).' },
  { id: 'f6', front: 'How the default gateway appears in a Windows routing table', back: 'As the route to **0.0.0.0** with netmask **0.0.0.0**; the Gateway column holds the router IP.' },
  { id: 'f7', front: '`arp -a`', back: 'Displays the IP-to-MAC (ARP) cache. Works on Windows, macOS and Linux (net-tools); modern Linux also has `ip neigh`.' },
  { id: 'f8', front: 'First two lines of `nslookup` output', back: 'The DNS **server** that answered (name and IP address); the answer to the query follows below.' },
  { id: 'f9', front: '`tracert` vs `traceroute` default probes', back: 'Windows `tracert` sends **ICMP Echo** requests; macOS/Linux `traceroute` sends **UDP** probes (ports from 33434 upward).' },
  { id: 'f10', front: 'Default maximum hops: Windows tracert / Linux traceroute / macOS traceroute', back: '**30 / 30 / 64**.' },
  { id: 'f11', front: 'APIPA range and mask', back: '**169.254.0.0/16** (255.255.0.0). Hosts pick from 169.254.1.0 to 169.254.254.255 and get no default gateway.' },
  { id: 'f12', front: 'A DHCP client shows 169.254.x.x. Meaning?', back: 'No DHCP server answered, so the host self-assigned a link-local address; it can reach only its local link.' },
  { id: 'f13', front: 'macOS: IP address, mask and router of the Wi-Fi service', back: '`networksetup -getinfo Wi-Fi`.' },
  { id: 'f14', front: 'macOS `ifconfig` shows `netmask 0xffffff00`', back: '255.255.255.0 (**/24**). macOS prints the mask in hexadecimal.' },
  { id: 'f15', front: 'macOS: show the DNS servers the resolver uses', back: '`scutil --dns` (nameserver and search domain for each resolver).' },
  { id: 'f16', front: 'Linux replacement for `ifconfig`', back: '`ip address` (`ip addr`, `ip a`) from iproute2; `ifconfig` is legacy net-tools.' },
  { id: 'f17', front: 'Linux `ip address` flags UP and LOWER_UP', back: '**UP** = administratively enabled. **LOWER_UP** = physical link (carrier) present. `NO-CARRIER` = no link.' },
  { id: 'f18', front: 'Linux: find the default gateway', back: '`ip route`: look for a line such as `default via 10.1.10.1 dev enp0s3`.' },
  { id: 'f19', front: 'Linux `/etc/resolv.conf` shows `nameserver 127.0.0.53`', back: 'The local **systemd-resolved** stub resolver. The real upstream DNS servers are shown by `resolvectl status`.' },
  { id: 'f20', front: '`nmcli device show`', back: 'NetworkManager CLI view of each interface: IP4.ADDRESS, IP4.GATEWAY, IP4.ROUTE and IP4.DNS.' },
  { id: 'f21', front: 'Windows `ipconfig` shows `Media disconnected`', back: 'The adapter has no link: unplugged or bad cable, dead or shut switch port, or Wi-Fi not connected (Layer 1).' },
  { id: 'f22', front: 'Ping by IP succeeds, ping by name fails', back: 'A **DNS** problem: wrong or unreachable DNS server, port 53 blocked, or a missing record.' },
  { id: 'f23', front: 'Local hosts reachable, remote hosts not', back: 'Check the **default gateway** (missing, wrong or outside the subnet) and the **subnet mask**.' },
  { id: 'f24', front: 'Purpose of `ping 127.0.0.1`', back: 'Tests the local TCP/IP stack through the loopback interface; nothing leaves the NIC.' },
  { id: 'f25', front: 'Wi-Fi client with the wrong PSK', back: 'WPA2/WPA3 authentication fails in the handshake, so the client never connects and never sends DHCP.' },
  { id: 'f26', front: 'Wi-Fi client connected with a strong signal but a 169.254.x.x address', back: 'The WLAN works; **DHCP** fails. Check the WLAN\'s VLAN, the DHCP scope and `ip helper-address`.' },
  { id: 'f27', front: '2.4 GHz vs 5 GHz from the client\'s view', back: '2.4 GHz: longer range, only 3 non-overlapping channels (1, 6, 11). 5 GHz: more channels and speed, shorter range. A 2.4 GHz-only client cannot see a 5 GHz-only SSID.' },
  { id: 'f28', front: 'Windows command showing SSID, BSSID, channel and signal', back: '`netsh wlan show interfaces`.' },
  { id: 'f29', front: 'DHCP renewal timers T1 and T2', back: 'T1 = **50%** of the lease (unicast renew to the same server). T2 = **87.5%** (broadcast rebind to any server).' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which Windows command displays the DNS servers and the DHCP lease expiry time?',
    options: ['`ipconfig`', '`ipconfig /all`', '`route print`', '`nslookup`'],
    answer: 1,
    difficulty: 1,
    explanation:
      '`ipconfig /all` adds the DNS Servers list, DHCP server and Lease Obtained/Expires lines. Plain `ipconfig` shows only address, mask and gateway; `route print` shows the routing table; `nslookup` queries DNS but does not show lease information.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'A laptop shows the address 169.254.37.5 with mask 255.255.0.0. What does this indicate?',
    options: [
      'A DHCP server assigned the laptop a private address',
      'The laptop did not receive a reply from a DHCP server',
      'The laptop detected a duplicate IP address on the network',
      'DNS lookup failed when the laptop requested an address',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'A 169.254.0.0/16 address is **APIPA**: the host assigns it to itself when DHCP gets no answer. DHCP servers do not hand out 169.254 addresses, a duplicate address is flagged as a conflict instead, and DNS has nothing to do with address assignment.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'A Mac shows `netmask 0xfffffe00` in `ifconfig` output. What is the prefix length? (Answer as /nn.)',
    answers: ['/23', '23', '255.255.254.0'],
    placeholder: '/nn',
    difficulty: 2,
    explanation:
      'ff.ff.fe.00 is 255.255.254.0. 254 is 11111110 in binary, so the mask has 8 + 8 + 7 = **23** network bits.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two commands display the routing table on a Windows host? (Choose two.)',
    options: ['`route print`', '`ipconfig /all`', '`netstat -rn`', '`arp -a`', '`tracert 10.1.1.1`'],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      '`route print` and `netstat -rn` both print the Windows routing table, including the 0.0.0.0 default route. `ipconfig /all` shows the gateway setting but not the table, `arp -a` shows the ARP cache and `tracert` traces a path.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each Linux command to the information it shows.',
    pairs: [
      { left: '`ip address`', right: 'IP addresses, prefix lengths and link flags' },
      { left: '`ip route`', right: 'Connected routes and the default gateway' },
      { left: '`resolvectl status`', right: 'DNS servers used on each link' },
      { left: '`traceroute`', right: 'Each router hop toward a destination' },
    ],
    difficulty: 2,
    explanation:
      '`ip address` lists interfaces with addresses and flags such as LOWER_UP; `ip route` shows the routing table with the `default via` line; `resolvectl status` shows the systemd-resolved DNS servers; `traceroute` reveals each hop using TTL-limited probes.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A user can ping 10.2.20.80 but `ping srv1.corp.example.com` returns "could not find host". Which setting should be checked first?',
    options: ['Default gateway', 'DNS server', 'Subnet mask', 'Wi-Fi pre-shared key'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Reaching the server by IP proves the link, addressing, gateway and path all work, so only name resolution is failing: check the **DNS server**. A wrong gateway or mask would break the ping by IP too, and a wrong PSK would prevent any connectivity.',
  },
  {
    id: 'q7',
    type: 'order',
    stem: 'Put the client troubleshooting steps in the recommended order.',
    items: [
      'Verify the physical or wireless link',
      'Verify the IP address and subnet mask',
      'Ping the default gateway',
      'Test DNS resolution of the server name',
      'Trace the path to the remote server',
    ],
    difficulty: 2,
    explanation:
      'Work outward from the host: a link is needed before addressing matters, a valid address before the gateway can answer, local reachability before DNS servers can be queried, and only then does tracing the remote path make sense.',
  },
];
