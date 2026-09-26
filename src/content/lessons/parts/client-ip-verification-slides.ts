import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Verifying & Troubleshooting Client IP Settings',
    subtitle: 'Reading ipconfig, ifconfig and ip output on Windows, macOS and Linux, and fixing what you find',
    notes:
      "Most help-desk tickets that reach a network engineer start at an end host: \"the network is down\" usually means one PC has a bad address, a missing gateway or a broken DNS setting. The CCNA blueprint expects you to **verify IP parameters on Windows, macOS and Linux clients** (topic 1.10 in v1.1, and part of domain 1 in v2.0, so this lesson serves both versions): which command to type on each operating system and how to read what comes back. In this deck you will learn the four settings every host needs, the verification commands on each OS with realistic output, how to recognize **APIPA**, wrong masks, wrong gateways and DNS failures, and a repeatable bottom-up troubleshooting flow that also covers wireless clients. Exam questions on this topic are usually exhibits: a block of `ipconfig /all` or `ifconfig` output followed by a question such as \"why can this host not reach the server?\" By the end you should be able to read those exhibits in seconds and name the broken setting.",
  },
  {
    kind: 'bullets',
    title: 'What every client needs',
    bullets: [
      '**IPv4 address**: unique within its subnet',
      '**Subnet mask / prefix**: decides which destinations are local',
      '**Default gateway**: a router IP on the local subnet',
      '**DNS server(s)**: turn names into IP addresses',
      'Learned from **DHCP** (with a lease) or set statically',
      'The **MAC address** is read from the same output',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: '10.1.10.25/24', x: 1, y: 2.5 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'GW 10.1.10.1', x: 5.2, y: 2.5, tone: 'accent' },
        { id: 'dns', icon: 'server', label: 'DNS', sub: '10.1.99.53', x: 7.4, y: 1 },
        { id: 'wan', icon: 'cloud', label: 'WAN', x: 7.4, y: 3.8 },
        { id: 'srv', icon: 'server', label: 'SRV1', sub: '10.2.20.80', x: 9.2, y: 3.8 },
      ],
      links: [
        { from: 'pc', to: 'sw', toLabel: 'Fa0/1' },
        { from: 'sw', to: 'r1', toLabel: 'G0/0/0', label: '10.1.10.0/24' },
        { from: 'r1', to: 'dns', label: '10.1.99.0/24' },
        { from: 'r1', to: 'wan' },
        { from: 'wan', to: 'srv' },
      ],
    },
    notes:
      "A host needs four IP settings to talk beyond its own wire. The **address** identifies it; the **mask** (written 255.255.255.0 or /24) tells it which destinations are on the local subnet; the **default gateway** is where it sends everything else; and the **DNS server** list lets it turn srv1.corp.example.com into 10.2.20.80. Each setting breaks a different thing, which is what makes troubleshooting logical: a wrong address or mask breaks local communication or makes it partial, a wrong gateway breaks only remote destinations, and a wrong DNS server breaks only names while pinging by IP still works. On most networks these values arrive from **DHCP** together with a lease time; servers and network devices normally use static settings. The MAC address is not an IP setting, but you read it from the same output when you check DHCP reservations, port security or ARP tables. In the topology, PC1 must first reach R1 at 10.1.10.1 on its own subnet before anything behind the WAN, including SRV1, is reachable.",
  },
  {
    kind: 'cli',
    title: 'Windows: ipconfig /all',
    code: `C:\\>ipconfig /all

Windows IP Configuration

   Host Name . . . . . . . . . . . . : PC1
   Primary Dns Suffix  . . . . . . . : corp.example.com
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : corp.example.com
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 3C-52-82-1A-2B-3C
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::1c4b:9a2e:7d31:5e0a%12(Preferred)
   IPv4 Address. . . . . . . . . . . : 10.1.10.25(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Saturday, September 26, 2026 8:02:11 AM
   Lease Expires . . . . . . . . . . : Sunday, September 27, 2026 8:02:11 AM
   Default Gateway . . . . . . . . . : 10.1.10.1
   DHCP Server . . . . . . . . . . . : 10.1.99.10
   DNS Servers . . . . . . . . . . . : 10.1.99.53
                                       10.1.99.54`,
    highlight: ['3C-52-82-1A-2B-3C', '10.1.10.25', '255.255.255.0', 'Default Gateway', 'DNS Servers'],
    caption: 'DHCP Enabled: Yes plus lease times means these settings came from a DHCP server.',
    notes:
      "`ipconfig` on its own prints the address, mask and default gateway of each adapter, which is enough for a quick check. Add `/all` and Windows also shows the **Physical Address** (the MAC, written with dashes), whether **DHCP** is enabled, the **DHCP server** that granted the lease, **Lease Obtained/Expires**, and the **DNS Servers** list. That makes `ipconfig /all` the single most useful client command for the exam. Read this output top to bottom: the adapter is wired Ethernet, DHCP is on, the lease lasts one day, the gateway 10.1.10.1 sits inside 10.1.10.0/24, and two DNS servers are configured. The DHCP server 10.1.99.10 is on another subnet, so R1 must be relaying the requests. The `(Preferred)` tag means the address passed duplicate address detection and is in use; after a conflict you would see `(Duplicate)` instead. The `%12` after the IPv6 link-local address is the interface index. If DHCP Enabled says **No**, the address is static and there are no lease or DHCP server lines, a useful clue when a user has typed settings by hand.",
  },
  {
    kind: 'table',
    title: 'Windows client commands',
    columns: ['Command', 'What it shows or does'],
    rows: [
      ['`ipconfig`', 'Address, mask and default gateway per adapter'],
      ['`ipconfig /all`', 'Adds MAC, DHCP server, lease times, DNS servers, host name'],
      ['`ipconfig /release`', 'Sends a DHCPRELEASE and drops the IPv4 lease'],
      ['`ipconfig /renew`', 'Requests a new or renewed lease from DHCP'],
      ['`ipconfig /flushdns`', 'Clears the DNS resolver cache (`ipconfig /displaydns` shows it)'],
      ['`route print` / `netstat -rn`', 'Routing table, including the 0.0.0.0 default route'],
      ['`arp -a`', 'IP-to-MAC cache for each interface'],
      ['`nslookup` + name', 'Queries a DNS server directly'],
      ['`tracert` + destination', 'Lists each router hop (ICMP Echo probes, 30 hops max)'],
    ],
    notes:
      "Memorize this table; exam items often describe a task (\"clear the resolver cache\", \"see which DHCP server granted the lease\") and offer four real commands as options. `/release` sends a **DHCPRELEASE** and the adapter loses its IPv4 address; `/renew` asks for a lease again, which after a release means a full Discover, Offer, Request, Ack exchange. Run the pair after fixing a VLAN or relay problem to prove that DHCP now works. `/flushdns` matters when a DNS record has changed but the PC keeps using the old cached answer; `/displaydns` shows what is cached. On Windows, `route print` and `netstat -rn` display the same routing table, and the default gateway appears as the route to 0.0.0.0 with mask 0.0.0.0. `arp -a` proves whether the PC has resolved its gateway's MAC address: if the gateway is missing from the cache right after a ping, Layer 2 to the router is broken. `tracert` sends ICMP Echo requests with an increasing TTL, whereas Linux and macOS `traceroute` send UDP probes by default.",
  },
  {
    kind: 'cli',
    title: 'Windows: route print and arp -a',
    code: `C:\\>route print -4
===========================================================================
Interface List
 12...3c 52 82 1a 2b 3c ......Intel(R) Ethernet Connection I219-LM
  1...........................Software Loopback Interface 1
===========================================================================

IPv4 Route Table
===========================================================================
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
          0.0.0.0          0.0.0.0        10.1.10.1       10.1.10.25     25
        10.1.10.0    255.255.255.0         On-link        10.1.10.25    281
       10.1.10.25  255.255.255.255         On-link        10.1.10.25    281
      10.1.10.255  255.255.255.255         On-link        10.1.10.25    281
        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331
===========================================================================

C:\\>arp -a

Interface: 10.1.10.25 --- 0xc
  Internet Address      Physical Address      Type
  10.1.10.1             00-1e-7a-3b-44-01     dynamic
  10.1.10.255           ff-ff-ff-ff-ff-ff     static
  224.0.0.22            01-00-5e-00-00-16     static`,
    highlight: ['0.0.0.0', 'On-link', '00-1e-7a-3b-44-01'],
    caption: 'The 0.0.0.0/0 route points at the gateway, and arp -a shows the gateway MAC was resolved.',
    notes:
      "The routing table proves what the host will actually do with a packet. The line with destination **0.0.0.0 and netmask 0.0.0.0** is the default route: anything that matches no more specific entry goes to gateway 10.1.10.1. **On-link** means the destination is directly connected, so the host ARPs for the target itself; the 10.1.10.0/24 entry is created from the address and mask. If the 0.0.0.0 line is missing, the PC has no default gateway and can reach only its own subnet. Windows derives the metric from the interface speed (gigabit Ethernet gets 25 automatically), so when a laptop is on wired and Wi-Fi at the same time, the route with the lower metric wins. Below it, `arp -a` lists the cache for interface 10.1.10.25 (index 0xc, which is 12, matching the Interface List). A **dynamic** entry for 10.1.10.1 proves the PC resolved its gateway's MAC; the static entries are broadcast and multicast mappings Windows adds itself. If pings to the gateway fail and no entry appears, suspect Layer 1 or Layer 2: the cable, the VLAN or a shut interface.",
  },
  {
    kind: 'cli',
    title: 'Windows: nslookup and tracert',
    code: `C:\\>nslookup srv1.corp.example.com
Server:  dns1.corp.example.com
Address:  10.1.99.53

Name:    srv1.corp.example.com
Address:  10.2.20.80

C:\\>tracert srv1.corp.example.com

Tracing route to srv1.corp.example.com [10.2.20.80]
over a maximum of 30 hops:

  1    <1 ms    <1 ms    <1 ms  10.1.10.1
  2     1 ms     1 ms     1 ms  10.0.0.2
  3     2 ms     1 ms     1 ms  srv1.corp.example.com [10.2.20.80]

Trace complete.`,
    highlight: ['10.1.99.53', '10.2.20.80', 'Trace complete.'],
    caption: 'nslookup names the DNS server that answered; tracert hop 1 is always the default gateway.',
    notes:
      "`nslookup` talks to a DNS server directly and prints two blocks. The first says **which server answered**, by name and address; check that it matches the DNS servers in `ipconfig /all`. The second block is the answer itself: this PC resolved srv1 to 10.2.20.80, so DNS is healthy. If you see `Non-existent domain`, the server answered but has no such record, which is a DNS data problem rather than a network problem. If you see `DNS request timed out`, no reply came back: the DNS server address is wrong, the server is down, or something blocks port 53 on the path. Note that `nslookup` bypasses the Windows resolver cache, so it can succeed while applications still use a stale cached entry; that is when `ipconfig /flushdns` helps. `tracert` then maps the path hop by hop. Each line is one router that returned an ICMP Time Exceeded message, with three probes per hop and their round-trip times. Hop 1 is always the default gateway, which makes tracert a quick gateway check too. Add `-d` to skip reverse lookups and speed it up.",
  },
  {
    kind: 'cli',
    title: 'macOS: ifconfig and networksetup',
    code: `$ ifconfig en0
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
        ether 8c:85:90:4a:6e:21
        inet6 fe80::1c2d:4f8a:9b3e:77d1%en0 prefixlen 64 secured scopeid 0xb
        inet 192.168.1.34 netmask 0xffffff00 broadcast 192.168.1.255
        media: autoselect
        status: active
$ networksetup -getinfo Wi-Fi
DHCP Configuration
IP address: 192.168.1.34
Subnet mask: 255.255.255.0
Router: 192.168.1.1
Client ID:
IPv6: Automatic
IPv6 IP address: none
IPv6 Router: none
Wi-Fi ID: 8c:85:90:4a:6e:21`,
    highlight: ['0xffffff00', 'status: active', 'Router: 192.168.1.1'],
    caption: 'macOS ifconfig prints the mask in hex: 0xffffff00 is 255.255.255.0 (/24).',
    notes:
      "macOS is BSD-based, so `ifconfig` is still the native tool, and on a MacBook the Wi-Fi adapter is normally **en0**. Read four things: **status: active** means the link is up (for Wi-Fi, associated to an SSID); **ether** is the MAC address with colons; **inet** is the IPv4 address; and the **netmask is hexadecimal**. 0xffffff00 is 255.255.255.0, a /24. Each pair of hex digits is one octet: ff is 255, fe is 254, fc is 252, f0 is 240 and 00 is 0. Converting it is a favorite exam twist. `ifconfig` does not show the default gateway or the DNS servers, which is why Apple's `networksetup -getinfo Wi-Fi` is handy: it prints the configuration method (DHCP Configuration or Manual Configuration), the address, a dotted-decimal subnet mask, the **Router** (the default gateway) and the Wi-Fi MAC in one block. The argument is the network service name, and `networksetup -listallnetworkservices` lists the exact names on a given Mac. The graphical equivalent is in System Settings, under Wi-Fi, Details, TCP/IP. A Mac whose DHCP fails shows a self-assigned 169.254.x.x address here.",
  },
  {
    kind: 'cli',
    title: 'macOS: routes, DNS and traceroute',
    code: `$ netstat -rn -f inet
Routing tables

Internet:
Destination        Gateway            Flags        Netif Expire
default            192.168.1.1        UGScg          en0
127                127.0.0.1          UCS            lo0
192.168.1          link#11            UCS            en0      !
192.168.1.1        a0:63:91:2c:5d:10  UHLWIir        en0   1187
$ scutil --dns | head -8
DNS configuration

resolver #1
  search domain[0] : home.example
  nameserver[0] : 192.168.1.1
  if_index : 11 (en0)
  flags    : Request A records
  reach    : 0x00020002 (Reachable,Directly Reachable Address)
$ traceroute -n 203.0.113.10
traceroute to 203.0.113.10 (203.0.113.10), 64 hops max, 52 byte packets
 1  192.168.1.1  2.104 ms  1.877 ms  1.802 ms
 2  198.51.100.1  9.812 ms  10.030 ms  9.644 ms`,
    highlight: ['default', 'nameserver[0]', '64 hops max'],
    caption: 'default = the default route; the G flag means it points to a gateway.',
    notes:
      "Three more macOS commands complete the picture. `netstat -rn` prints the routing table without resolving names, and `-f inet` limits it to IPv4. The **default** line is the default route, and the **G** in its flags means the destination is reached through a gateway, here the SOHO router at 192.168.1.1. macOS abbreviates networks, so `192.168.1` means 192.168.1.0/24, and `link#11` means directly connected on interface index 11. For DNS, `scutil --dns` shows what the resolver really uses: each resolver block lists the search domain, the **nameserver** entries and the interface they came from. Applications on macOS use this configuration, so it is more trustworthy than `/etc/resolv.conf`, which exists only for compatibility. `networksetup -getdnsservers Wi-Fi` shows only manually configured servers, not DHCP-learned ones. Finally, `traceroute` works like Windows tracert but sends **UDP** probes by default, allows up to 64 hops and uses 52-byte packets; `-n` skips reverse DNS. Hop 1 is again the default gateway, a quick way to confirm the router is answering.",
  },
  {
    kind: 'cli',
    title: 'Linux: ip address vs legacy ifconfig',
    code: `$ ip address show enp0s3
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:3a:7c:19 brd ff:ff:ff:ff:ff:ff
    inet 10.1.10.40/24 brd 10.1.10.255 scope global dynamic noprefixroute enp0s3
       valid_lft 85312sec preferred_lft 85312sec
    inet6 fe80::5054:ff:fe3a:7c19/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
$ ifconfig enp0s3
enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.1.10.40  netmask 255.255.255.0  broadcast 10.1.10.255
        inet6 fe80::5054:ff:fe3a:7c19  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:3a:7c:19  txqueuelen 1000  (Ethernet)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`,
    highlight: ['LOWER_UP', '10.1.10.40/24', 'dynamic', 'netmask 255.255.255.0'],
    caption: 'Same interface, two tools: ip shows a prefix length, ifconfig shows a dotted-decimal mask.',
    notes:
      "Modern Linux distributions use the **iproute2** tools: `ip address` (short forms `ip addr` and `ip a`) replaces `ifconfig`, which belongs to the older net-tools package and is often not installed by default. Read the first line's flags. **UP** means the interface is administratively enabled and **LOWER_UP** means the physical link (carrier) is present; a missing cable shows `NO-CARRIER` and `state DOWN`. `link/ether` is the MAC address. The `inet` line gives the IPv4 address with its **prefix length**, because `ip` always uses slash notation. The word **dynamic** means the address came from DHCP, and `valid_lft 85312sec` is the time left on the lease, about 23.7 hours of a one-day lease; a static address shows `valid_lft forever`. The legacy `ifconfig` output below it describes the same interface in a different format: a dotted-decimal `netmask`, the MAC on the `ether` line, and error counters that are useful for spotting a bad cable. Note the contrast with macOS: Linux `ifconfig` prints the mask in dotted decimal, macOS prints it in hex. Know both formats for exhibits.",
  },
  {
    kind: 'cli',
    title: 'Linux: ip route, DNS and nmcli',
    code: `$ ip route
default via 10.1.10.1 dev enp0s3 proto dhcp src 10.1.10.40 metric 100
10.1.10.0/24 dev enp0s3 proto kernel scope link src 10.1.10.40 metric 100
$ cat /etc/resolv.conf
nameserver 127.0.0.53
options edns0 trust-ad
search corp.example.com
$ resolvectl status enp0s3
Link 2 (enp0s3)
    Current Scopes: DNS
Current DNS Server: 10.1.99.53
       DNS Servers: 10.1.99.53 10.1.99.54
        DNS Domain: corp.example.com
$ nmcli device show enp0s3 | grep IP4
IP4.ADDRESS[1]:                         10.1.10.40/24
IP4.GATEWAY:                            10.1.10.1
IP4.ROUTE[1]:                           dst = 10.1.10.0/24, nh = 0.0.0.0, mt = 100
IP4.ROUTE[2]:                           dst = 0.0.0.0/0, nh = 10.1.10.1, mt = 100
IP4.DNS[1]:                             10.1.99.53
IP4.DNS[2]:                             10.1.99.54`,
    highlight: ['default via 10.1.10.1', '127.0.0.53', 'DNS Servers: 10.1.99.53 10.1.99.54', 'IP4.GATEWAY'],
    caption: '127.0.0.53 is the local systemd-resolved stub; resolvectl shows the real DNS servers.',
    notes:
      "`ip route` (or `ip r`) prints the routing table. The line `default via 10.1.10.1` is the default gateway; `proto dhcp` shows it was learned from DHCP, and `metric 100` is the NetworkManager default for wired interfaces. The second line is the connected subnet built from the address and prefix. If the `default` line is missing, the host can reach only 10.1.10.0/24, the same symptom as a blank Default Gateway on Windows. DNS on Linux has a twist. On distributions running **systemd-resolved**, `/etc/resolv.conf` lists `nameserver 127.0.0.53`, a local stub resolver that forwards queries for applications. That is normal, not a misconfiguration. The real upstream servers appear in `resolvectl status` (older releases used `systemd-resolve --status`); on systems without systemd-resolved, `/etc/resolv.conf` lists the real servers directly. Finally, **nmcli** is the NetworkManager command line used on most desktop and many server distributions. `nmcli device show` summarizes each interface's address, gateway, routes and DNS in one place, and `nmcli device status` gives a quick connected or disconnected overview for every interface.",
  },
  {
    kind: 'table',
    title: 'One task, three operating systems',
    columns: ['Task', 'Windows', 'macOS', 'Linux'],
    rows: [
      ['Address and mask', '`ipconfig`', '`ifconfig en0`', '`ip address`'],
      ['Full detail incl. gateway', '`ipconfig /all`', '`networksetup -getinfo Wi-Fi`', '`nmcli device show`'],
      ['Routing table / gateway', '`route print`, `netstat -rn`', '`netstat -rn`', '`ip route`'],
      ['DNS servers in use', '`ipconfig /all`', '`scutil --dns`', '`resolvectl status`'],
      ['ARP cache', '`arp -a`', '`arp -a`', '`ip neigh` (or `arp -a`)'],
      ['Path to a destination', '`tracert`', '`traceroute`', '`traceroute`'],
      ['Query DNS directly', '`nslookup`', '`nslookup`', '`nslookup`, `dig`'],
    ],
    notes:
      "Exam items like to mix operating systems in the answer options, so learn this grid in both directions: task to command, and command to operating system. Windows is the odd one out. It uses `ipconfig` (with an **i**) and `tracert` (short name, ICMP probes), while macOS and Linux use `ifconfig` or `ip` and `traceroute` (UDP probes by default). `netstat -rn` works on all three and always shows the routing table, so it is a safe answer when a question asks how to find the default gateway on a Mac. `arp -a` also exists everywhere, although modern Linux prefers `ip neigh`, and `ifconfig` may be missing from a minimal Linux install. For DNS, each OS has its own source of truth: `ipconfig /all` on Windows, `scutil --dns` on macOS and `resolvectl status` on Linux distributions that run systemd-resolved. `nslookup` exists on all three for direct queries, and `dig` is a common Linux alternative. Two classic distractors: `ipconfig /all` offered as a Linux command, and `show ip interface brief`, which is a Cisco IOS command and never runs on a host.",
  },
  {
    kind: 'definitions',
    title: 'Reading the output, field by field',
    terms: [
      { term: 'IPv4 address', def: 'Unique host address inside the subnet; never the network or broadcast address.' },
      { term: 'Subnet mask / prefix', def: '255.255.255.0 = /24 = 0xffffff00. Decides which destinations are local.' },
      { term: 'Default gateway', def: 'Router interface on the same subnet; appears as the 0.0.0.0/0 or `default` route.' },
      { term: 'DNS servers', def: 'Resolve names to addresses; pinging by IP works without them.' },
      { term: 'MAC / physical address', def: '48 bits: `3C-52-82-1A-2B-3C` (Windows), `3c:52:82:1a:2b:3c` (macOS/Linux).' },
      { term: 'DHCP lease', def: 'Lease Obtained/Expires (Windows) or `valid_lft` (Linux); renewed at 50% of the lease (T1).' },
      { term: 'APIPA', def: '169.254.0.0/16 address a host gives itself when DHCP fails; no gateway.' },
    ],
    notes:
      "Whatever the operating system, the same values appear; only the formatting changes. The **address** must be a valid host address in its subnet, not the network or broadcast address. The **mask** appears in dotted decimal on Windows and in `networksetup`, as a prefix length in Linux `ip` output, and in hex in macOS `ifconfig`; all three mean the same thing. The **gateway** must sit inside the host's own subnet because the host has to ARP for it, while **DNS servers** can be anywhere reachable. The **MAC** is written with dashes on Windows, colons on macOS and Linux, and in dotted groups of four hex digits on Cisco IOS (3c52.821a.2b3c): the same 48 bits in three notations. A DHCP **lease** renews automatically: at 50 percent of the lease time (T1) the client unicasts a DHCPREQUEST to its server, and at 87.5 percent (T2) it broadcasts to any server. If the lease expires without renewal, the client must stop using the address. Finally, an address in **169.254.0.0/16** is not really configuration at all; it is the host telling you that DHCP failed.",
  },
  {
    kind: 'bullets',
    title: 'Sanity-check the mask and the gateway',
    bullets: [
      'Apply the host mask to the host IP and to the gateway',
      'Results must match: the gateway must be **on-link**',
      'Gateway outside the subnet: **only local hosts reachable**',
      'Mask too long: some local hosts look remote',
      'Mask too short: some remote hosts look local and ARP fails',
      'Compare with a working neighbor on the same switch',
    ],
    diagram: {
      type: 'bits',
      rows: [
        { label: 'Host 10.1.10.25', value: '10.1.10.25', prefix: 24 },
        { label: 'Mask /24', value: '255.255.255.0', prefix: 24 },
        { label: 'GW 10.1.1.1', value: '10.1.1.1', prefix: 24, tone: 'bad' },
      ],
    },
    notes:
      "When a client can talk to some hosts but not others, do the subnet math the host itself does. Take the host's address and mask and work out its subnet: 10.1.10.25/24 lives in 10.1.10.0/24. Now test the gateway against the same mask. Here the configured gateway 10.1.1.1 falls in 10.1.1.0/24, because the third octet differs inside the network bits, so the host cannot use it: it can still ping 10.1.10.x neighbors but reaches nothing remote. Windows warns that the gateway is not on the same network segment when you type this, but it still lets you save it. Mask errors are subtler. A mask that is **too long** (for example /25 instead of /24) makes the host treat part of its real subnet as remote, so those neighbors are reached only through the router, if at all. A mask that is **too short** (/16 instead of /24) makes remote hosts look local, so the host ARPs for them directly and fails, unless the router's proxy ARP answers on their behalf. Comparing the problem host with a working neighbor on the same switch is often the fastest way to spot the odd value.",
  },
  {
    kind: 'cli',
    title: 'APIPA: 169.254.x.x means DHCP failed',
    code: `C:\\>ipconfig /all

Windows IP Configuration

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   Physical Address. . . . . . . . . : 3C-52-82-1A-2B-3C
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::1c4b:9a2e:7d31:5e0a%12(Preferred)
   Autoconfiguration IPv4 Address. . : 169.254.83.17(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :

C:\\>ipconfig /renew

Windows IP Configuration

An error occurred while renewing interface Ethernet : unable to contact your DHCP server. Request has timed out.`,
    highlight: ['Autoconfiguration IPv4 Address', '169.254.83.17', '255.255.0.0', 'unable to contact your DHCP server'],
    caption: 'DHCP is enabled but no server answered, so Windows assigned itself a link-local address.',
    notes:
      "**APIPA** (Automatic Private IP Addressing, the IPv4 link-local range **169.254.0.0/16**) is the classic exam exhibit. When a DHCP client sends Discovers and never receives an Offer, Windows and macOS assign themselves a random 169.254.x.x address with a 255.255.0.0 mask and **no default gateway**. Windows labels it `Autoconfiguration IPv4 Address`; macOS calls it a self-assigned IP; Linux usually just shows no IPv4 address unless link-local addressing is enabled. The host can talk only to other link-local hosts on the same segment and never through a router, so to the user nothing works. The key insight: ==APIPA proves DHCP got no answer==. The NIC has a link, since it could send Discovers, but no Offer came back. Causes include a DHCP server that is down or out of free addresses, a switch port in the wrong VLAN, a trunk that does not carry the VLAN, or a missing `ip helper-address` on the router when the server is on another subnet. The `/renew` timeout confirms it. Windows keeps retrying DHCP in the background every five minutes, so after the fix the PC recovers on its own or immediately with `ipconfig /renew`.",
  },
  {
    kind: 'diagram',
    title: 'Where DHCP breaks: DORA, relay and release',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 (client)', icon: 'pc' },
        { id: 'r1', label: 'R1 relay 10.1.10.1', icon: 'router' },
        { id: 'dhcp', label: 'DHCP 10.1.99.10', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'r1', label: 'DHCPDISCOVER (broadcast)', sub: 'src 0.0.0.0 → dst 255.255.255.255' },
        { from: 'r1', to: 'dhcp', label: 'Relayed as unicast', sub: 'ip helper-address 10.1.99.10' },
        { from: 'dhcp', to: 'pc', label: 'DHCPOFFER', sub: 'address, mask, gateway, DNS, lease time' },
        { from: 'pc', to: 'dhcp', label: 'DHCPREQUEST (broadcast)', sub: 'client accepts the offer' },
        { from: 'dhcp', to: 'pc', label: 'DHCPACK', sub: 'lease starts: Lease Obtained', tone: 'good' },
        { note: 'No OFFER at all → Windows/macOS self-assign 169.254.x.x (APIPA)', tone: 'bad' },
        { from: 'pc', to: 'dhcp', label: 'DHCPRELEASE (unicast)', sub: 'sent by ipconfig /release', dashed: true },
      ],
    },
    caption: 'The relay turns the broadcast into a unicast; without a helper there is no OFFER, and the client falls back to APIPA.',
    notes:
      "Every DHCP-learned value in `ipconfig /all` arrived in this exchange. The client broadcasts a **Discover** from 0.0.0.0 because it has no address yet. Routers do not forward broadcasts, so when the server sits on another subnet the gateway interface needs `ip helper-address 10.1.99.10`; R1 then relays the message as a unicast and inserts its own interface address so the server picks the pool for the right subnet. The server **Offers** an address plus options (mask, default gateway, DNS servers, domain name, lease time), the client **Requests** it, and the server **Acknowledges**. Only then does the host configure the address and start the lease timer you see as Lease Obtained. Map failures onto this picture: no Offer at all means APIPA; an Offer from the wrong pool, caused by a port in the wrong VLAN, means a valid-looking address in the wrong subnet; and a pool with a wrong default-router or dns-server option gives every client the same wrong gateway or DNS server. `ipconfig /release` sends a **DHCPRELEASE** straight to the server, and `/renew` starts the process again, which makes the pair a quick test after any fix.",
  },
  {
    kind: 'steps',
    title: 'Troubleshooting flow: work from the host out',
    steps: [
      { title: 'Link', text: 'Cable or Wi-Fi association: `Media disconnected`, `NO-CARRIER`, `status: inactive`?' },
      { title: 'IP configuration', text: 'Sensible address and mask for this subnet? Not 169.254.x.x? No duplicate?' },
      { title: 'Default gateway', text: 'Configured, inside the subnet, and answering a ping?' },
      { title: 'DNS', text: '`nslookup` the name; compare ping by IP with ping by name.' },
      { title: 'Remote reachability', text: 'Ping the server IP, then `tracert`/`traceroute` to find the last hop.' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'Link up?', shape: 'diamond' },
        { id: 'n2', label: 'Valid IP/mask?', shape: 'diamond' },
        { id: 'n3', label: 'Gateway pings?', shape: 'diamond' },
        { id: 'n4', label: 'Name resolves?', shape: 'diamond' },
        { id: 'n5', label: 'Path to server', shape: 'round', tone: 'good' },
      ],
    },
    notes:
      "A structured flow stops you guessing. Start at the bottom of the stack on the client and move outward; each step either finds the fault or proves a layer good. **Link:** is there a carrier or a Wi-Fi association? Windows says `Media disconnected`, Linux shows `NO-CARRIER`, and macOS shows `status: inactive`. **IP configuration:** does the host have a sensible address and mask for this subnet? A 169.254 address sends you to DHCP, and a duplicate warning sends you to address conflicts. **Gateway:** is a default gateway configured, is it inside the subnet, and does it answer a ping? Success proves the local segment end to end. **DNS:** does `nslookup` resolve the server name, and does the expected DNS server answer? If ping by IP works but ping by name fails, stop here: it is DNS. **Remote reachability:** ping the server by IP, then use `tracert` or `traceroute` to find the last hop that answers. Many technicians also ping 127.0.0.1 first to prove the local TCP/IP stack. On the exam, the stem usually tells you which tests succeeded; the first failed test identifies the broken layer.",
  },
  {
    kind: 'cli',
    title: 'Case: the name fails, the address works',
    code: `C:\\>ping srv1.corp.example.com
Ping request could not find host srv1.corp.example.com. Please check the name and try again.

C:\\>ping 10.2.20.80

Pinging 10.2.20.80 with 32 bytes of data:
Reply from 10.2.20.80: bytes=32 time=2ms TTL=62
Reply from 10.2.20.80: bytes=32 time=1ms TTL=62
Reply from 10.2.20.80: bytes=32 time=1ms TTL=62
Reply from 10.2.20.80: bytes=32 time=1ms TTL=62

C:\\>nslookup srv1.corp.example.com
DNS request timed out.
    timeout was 2 seconds.
Server:  UnKnown
Address:  10.1.10.53

DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out`,
    highlight: ['could not find host', 'TTL=62', '10.1.10.53', 'timed-out'],
    caption: 'IP connectivity is fine; the PC is asking a DNS server address that does not exist (10.1.10.53).',
    notes:
      "This is the textbook DNS failure. The name lookup fails immediately with `could not find host`, yet a ping to the same server by IP succeeds, so the link, the IP settings, the gateway and the routed path are all fine. Something is wrong only with name resolution. `nslookup` shows which server the PC is asking: 10.1.10.53, which does not exist; the real DNS servers are 10.1.99.53 and 10.1.99.54. `Server: UnKnown` only means nslookup could not reverse-resolve the DNS server's own address, which is expected when that server never answers. Fix the DNS server setting, on the adapter if it is static or in the DHCP pool's `dns-server` option if every client is affected, then run `ipconfig /flushdns` so no failed lookups linger in the cache, and test again. Other DNS-only causes are a DNS server that is down, a firewall or ACL blocking port 53, or a record that simply does not exist, in which case nslookup reports `Non-existent domain`. Notice the TTL of 62 in the replies: the server started at 64 and the reply crossed two routers on its way back.",
  },
  {
    kind: 'cli',
    title: 'Case: tracert shows where the path breaks',
    code: `C:\\>tracert -d 10.2.20.80

Tracing route to 10.2.20.80 over a maximum of 30 hops

  1    <1 ms    <1 ms    <1 ms  10.1.10.1
  2     1 ms     1 ms     1 ms  10.0.0.2
  3     *        *        *     Request timed out.
  4     *        *        *     Request timed out.
  5  ^C`,
    highlight: ['10.1.10.1', '10.0.0.2', 'Request timed out.'],
    caption: 'Hops 1 and 2 answer; investigate beyond 10.0.0.2: the next hop, its routes, filters or the return path.',
    notes:
      "When the gateway answers but the remote server does not, trace the path. `tracert` sends probes with TTL 1, 2, 3 and so on; each router that decrements the TTL to zero returns an ICMP **Time Exceeded** message and so reveals itself. Here hop 1 is the default gateway 10.1.10.1 and hop 2 is 10.0.0.2, so the client's own configuration is proven good and the first two routers forward correctly. From hop 3 onward nothing answers. A row of timeouts means the next device never received the probe, dropped it, or is not allowed to reply. Typical causes are a missing route on 10.0.0.2 or beyond, an ACL or firewall filtering the probes, or a return-path problem, because the replies must also find their way back to 10.1.10.0/24. Be careful: a single silent hop in the middle of an otherwise complete trace is normal, since many routers rate-limit or suppress Time Exceeded messages, and it is not a failure. On the exam, the last responding hop tells you where to start looking. Press Ctrl+C to stop a trace that would otherwise run all the way to 30 hops.",
  },
  {
    kind: 'bullets',
    title: 'Wireless client problems',
    bullets: [
      '**Wrong SSID**: guest or neighbor network, so the wrong subnet',
      '**Wrong PSK**: WPA2/WPA3 authentication fails, never connects',
      '**Weak signal**: low RSSI, low data rate, retries and drops',
      '**Band**: a 2.4 GHz-only client cannot see a 5 GHz-only SSID',
      '**DHCP failure**: connected, but 169.254.x.x or no address',
      'Connected + APIPA: check the WLAN VLAN, DHCP scope and relay',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'a', icon: 'laptop', label: 'Laptop A', sub: '10.1.30.21 OK', x: 1, y: 1, tone: 'good' },
        { id: 'b', icon: 'laptop', label: 'Laptop B', sub: '-82 dBm', x: 1, y: 3, tone: 'bad' },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'CorpWLAN · ch 36', x: 3.8, y: 2, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 6.2, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'GW + DHCP relay', x: 8.6, y: 2 },
      ],
      links: [
        { from: 'a', to: 'ap', style: 'wireless' },
        { from: 'b', to: 'ap', style: 'wireless', tone: 'bad' },
        { from: 'ap', to: 'sw', label: 'VLAN 30' },
        { from: 'sw', to: 'r1' },
      ],
    },
    notes:
      "Wireless adds failure points before IP even starts, and each leaves a different fingerprint. **Wrong SSID:** the user joined the guest network or a neighbor's network, so the laptop gets a perfectly valid address in the wrong subnet, with the wrong gateway and DNS. Check the SSID name first. **Wrong pre-shared key:** WPA2 or WPA3 authentication fails during the handshake, so the client never connects and never reaches DHCP; Windows reports that the network security key is not correct. **Weak signal:** the client connects, but the received signal strength (RSSI) is low, so the data rate drops and retransmissions pile up; users feel slowness and disconnects. Around -67 dBm or stronger is a common design target for voice and video. **Band:** a client that supports only 2.4 GHz cannot see an SSID offered only on 5 GHz, and 6 GHz requires a Wi-Fi 6E client. 2.4 GHz reaches farther but has only three non-overlapping channels (1, 6 and 11). **DHCP failure:** the client associates with a good signal but gets 169.254.x.x, so the WLAN works and the DHCP server, scope, VLAN mapping or relay does not.",
  },
  {
    kind: 'cli',
    title: 'Checking the Wi-Fi link on a client',
    code: `C:\\>netsh wlan show interfaces

There is 1 interface on the system:

    Name                   : Wi-Fi
    Description            : Intel(R) Wi-Fi 6 AX201 160MHz
    Physical address       : a4:c3:f0:5e:21:9b
    State                  : connected
    SSID                   : CorpWLAN
    BSSID                  : 70:3a:0e:12:34:51
    Network type           : Infrastructure
    Radio type             : 802.11n
    Authentication         : WPA2-Personal
    Cipher                 : CCMP
    Channel                : 6
    Receive rate (Mbps)    : 6.5
    Transmit rate (Mbps)   : 6.5
    Signal                 : 18%
    Profile                : CorpWLAN`,
    highlight: ['connected', 'Channel', '18%'],
    bullets: [
      'macOS: Option-click the Wi-Fi icon for RSSI, noise, channel, rate',
      'Linux: `nmcli device wifi list` shows SSID, channel, signal, security',
    ],
    caption: 'Right SSID, key accepted, but an 18% signal at 6.5 Mbps: a coverage problem, not an IP problem.',
    notes:
      "`netsh wlan show interfaces` shows the wireless layer that `ipconfig` cannot see. Check it in order. **State: connected** proves association and authentication succeeded, so the PSK is correct. **SSID** confirms the user joined the intended network, and **BSSID** is the MAC address of the specific AP radio, handy when one AP is misbehaving. **Radio type** and **Channel** tell you the standard and the band: channels 1 to 13 are 2.4 GHz, and channels 36 and above are 5 GHz on a typical Wi-Fi 5 or Wi-Fi 6 client. **Signal** is a percentage, not dBm. 18 percent is very weak, and receive and transmit rates of 6.5 Mbps confirm the radio has fallen back to its slowest, most robust rate. The diagnosis is coverage: move closer, add or relocate an access point, or check for interference on channel 6. It is not a DHCP or DNS fix. On macOS, Option-click the Wi-Fi menu icon to see RSSI in dBm, noise, channel and rate; on Linux, `nmcli device wifi list` lists every visible SSID with its channel, signal strength and security type.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: client IP verification',
    body: 'Read the exhibit for the **one wrong value**: an APIPA address, a gateway outside the subnet, a wrong mask or a bad DNS server.',
    bullets: [
      '`ipconfig` = Windows; `ifconfig`/`ip address` = macOS/Linux',
      '`tracert` = Windows (ICMP); `traceroute` = macOS/Linux (UDP)',
      'macOS netmask is **hex**: `0xffffff00` = /24',
      'Ping by IP works, by name fails → **DNS**',
      'Local works, remote fails → **gateway** (or mask)',
      'Connected Wi-Fi + 169.254.x.x → **DHCP**, not the PSK',
      'Linux `nameserver 127.0.0.53` is the local stub, not a fault',
    ],
    notes:
      "These traps turn up again and again. First, **command names**: Windows uses `ipconfig` and `tracert`, while macOS and Linux use `ifconfig` or `ip` and `traceroute`; an option list mixing them is designed to catch you. Second, **formats**: macOS shows the mask in hex, Linux `ip` shows a prefix length and Windows shows dotted decimal, so convert before you judge. Third, **symptom-to-layer mapping**: if only names fail, it is DNS; if only remote destinations fail, look at the gateway and the mask; if nothing works and the address is 169.254.x.x, DHCP never answered. A disconnected cable, by contrast, produces `Media disconnected` and no IPv4 address at all. Fourth, **wireless**: a client that shows as connected has already passed the PSK check, so an APIPA address on it is a DHCP or VLAN problem, while a client that cannot connect at all points to the SSID, the PSK or the band. Finally, do not be fooled by `nameserver 127.0.0.53` on Linux; the real upstream servers are in `resolvectl status`. And remember that an fe80:: IPv6 link-local address appears even when IPv4 is completely broken.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Four settings: **address, mask, gateway, DNS**; each fails differently',
      'Windows: `ipconfig /all`, `route print`, `arp -a`, `nslookup`, `tracert`',
      'macOS: `ifconfig`, `networksetup -getinfo`, `netstat -rn`, `scutil --dns`',
      'Linux: `ip address`, `ip route`, `resolvectl`, `nmcli`, `traceroute`',
      '**169.254.x.x** = no DHCP answer; no gateway, local link only',
      'Troubleshoot outward: link → IP → gateway → DNS → path',
      'Wireless: check SSID, PSK, signal and band before IP',
    ],
    notes:
      "You now have a client-side toolkit for all three operating systems and a method for using it. Every host needs an address, a mask, a gateway and DNS servers, and each wrong value leaves a distinct symptom. On Windows, `ipconfig /all` is the everything command, supported by `route print`, `arp -a`, `nslookup`, `tracert` and the `/release`, `/renew` and `/flushdns` switches. On macOS, combine `ifconfig` (with its hex mask) with `networksetup -getinfo`, `netstat -rn` and `scutil --dns`. On Linux, use `ip address` and `ip route`, check DNS with `resolvectl`, and use `nmcli` for the NetworkManager view; `ifconfig` still appears on older systems. When something breaks, walk the same path every time: link, IP settings, gateway, DNS, remote path, and let the first failing test name the problem. For Wi-Fi clients, confirm the SSID, the key, the signal and the band before blaming DHCP, and remember that connected plus 169.254 means DHCP. Practice by running these commands on your own machines until every field in the output looks familiar.",
  },
];
