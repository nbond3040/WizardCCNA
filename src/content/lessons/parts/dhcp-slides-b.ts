import type { Slide } from '../../types';

export const dhcpSlidesB: Slide[] = [
  {
    kind: 'diagram',
    title: 'DHCP relay: helper address and giaddr',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.4,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC2', sub: 'branch client', x: 1, y: 2.2 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'relay agent', x: 4.4, y: 2.2, tone: 'accent' },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DHCP server', x: 8.6, y: 2.2 },
      ],
      links: [
        { from: 'pc', to: 'r2', label: 'broadcast Discover', toLabel: 'G0/0/0 .20.1', arrow: 'forward' },
        { from: 'r2', to: 'r1', label: 'unicast · giaddr 192.168.20.1', fromLabel: 'G0/0/1', toLabel: '10.0.12.1', arrow: 'forward', tone: 'accent' },
      ],
      annotations: [
        { x: 4.4, y: 0.6, text: 'G0/0/0: ip helper-address 10.0.12.1', tone: 'accent' },
        { x: 1.6, y: 3.9, text: 'Branch LAN 192.168.20.0/24' },
        { x: 8.2, y: 3.9, text: 'Pool BRANCH-LAN 192.168.20.0/24' },
      ],
    },
    caption: 'Routers never forward 255.255.255.255 — the relay turns the broadcast into a unicast to the server.',
    notes:
      "Central DHCP servers are the norm, but a client's Discover is a limited broadcast, and routers do not forward broadcasts. The fix is a **DHCP relay agent**: the router interface that receives the client broadcasts is configured with `ip helper-address` pointing at the server. Here R2's G0/0/0 faces the branch LAN, so that is where the helper goes — not on the WAN interface toward R1. When the Discover arrives, R2 writes the IP address of the receiving interface, 192.168.20.1, into the **giaddr** (gateway IP address) field and sends the message as a routed unicast to 10.0.12.1. The giaddr does two jobs. It tells the server which subnet the client is on, so R1 picks the pool whose network contains 192.168.20.1 — BRANCH-LAN — rather than its own HQ pool. And it tells the server where to send the reply: R1 unicasts the Offer back to 192.168.20.1, so R1 needs a **route to the branch subnet**. The relay then delivers the reply to the client on the LAN. The client never knows a relay was involved.",
  },
  {
    kind: 'diagram',
    title: 'DORA through a relay agent',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'PC2 (branch)', icon: 'pc' },
        { id: 'r', label: 'R2 relay 192.168.20.1', icon: 'router' },
        { id: 's', label: 'R1 server 10.0.12.1', icon: 'router' },
      ],
      steps: [
        { from: 'c', to: 'r', label: 'DHCPDISCOVER', sub: 'broadcast 0.0.0.0 → 255.255.255.255' },
        { from: 'r', to: 's', label: 'DHCPDISCOVER (relayed)', sub: 'unicast to 10.0.12.1 · giaddr = 192.168.20.1', tone: 'accent' },
        { note: 'R1 selects the pool whose network contains the giaddr → BRANCH-LAN' },
        { from: 's', to: 'r', label: 'DHCPOFFER', sub: 'unicast to giaddr 192.168.20.1 · offers 192.168.20.11' },
        { from: 'r', to: 'c', label: 'DHCPOFFER', sub: 'delivered on the LAN out G0/0/0' },
        { note: 'Request and Ack cross the relay the same way' },
      ],
    },
    notes:
      "Follow the relayed exchange one hop at a time. PC2 broadcasts its Discover exactly as it would with a local server; nothing changes on the client. R2 receives it on G0/0/0, where the helper is configured, fills in **giaddr = 192.168.20.1** and forwards a unicast copy to 10.0.12.1 using normal routing, still on the DHCP server port UDP 67. R1 reads the giaddr, finds that BRANCH-LAN's network 192.168.20.0/24 contains it, reserves 192.168.20.11 and sends the Offer as a unicast back to the relay agent's giaddr address. R2 then delivers the Offer onto the branch LAN toward the client. The Request and the Ack repeat the same pattern. Two exam points hide in this flow. First, the server does **not** have to be in the client's subnet, but it must have a route back to the giaddr subnet. Second, if the server has no pool that contains the giaddr, it does not fall back to another pool — the client simply receives nothing. Later, T1 renewals are unicast from the client straight to the server, so the relay is mainly needed for the initial broadcasts and for rebinding.",
  },
  {
    kind: 'cli',
    title: 'Configuring and verifying a relay',
    code: `R2(config)# interface GigabitEthernet0/0/0
R2(config-if)# ip address 192.168.20.1 255.255.255.0
R2(config-if)# ip helper-address 10.0.12.1
R2(config-if)# end
R2# show ip interface GigabitEthernet0/0/0 | include Internet address|Helper
  Internet address is 192.168.20.1/24
  Helper address is 10.0.12.1
R1# show running-config | section BRANCH
ip dhcp pool BRANCH-LAN
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 10.99.1.53
 domain-name example.com
R1# show ip route | include 192.168.20.0
O        192.168.20.0/24 [110/2] via 10.0.12.2, 01:12:40, GigabitEthernet0/0/1`,
    highlight: ['ip helper-address 10.0.12.1', 'Helper address is 10.0.12.1', 'network 192.168.20.0 255.255.255.0'],
    notes:
      "Relay configuration is a single interface command on the **client-facing** interface: `ip helper-address 10.0.12.1`. On a Layer 3 switch the same command goes under the SVI of each client VLAN, for example `interface vlan 20`. You can configure several helper addresses, and the relay sends a copy to each server. Verification has three parts, and this transcript checks all of them. On the relay, `show ip interface` confirms the helper and the interface address that will become the giaddr. On the server, the pool's `network` must contain that giaddr, and the pool's `default-router` should be the relay's LAN address, because that is the clients' real gateway. Finally, the server must be able to reach the giaddr subnet, which the OSPF route confirms. Do not forget the exclusions: a global `ip dhcp excluded-address 192.168.20.1 192.168.20.10` on R1 keeps R2's own address out of the branch pool. If the server were a Windows machine instead of R1, only the server-side checks would change; the relay configuration on R2 stays exactly the same.",
  },
  {
    kind: 'table',
    title: 'What ip helper-address forwards by default',
    columns: ['Service', 'UDP port'],
    rows: [
      ['DHCP / BOOTP server', '67'],
      ['DHCP / BOOTP client', '68'],
      ['TFTP', '69'],
      ['DNS', '53'],
      ['Time protocol', '37'],
      ['NetBIOS name service', '137'],
      ['NetBIOS datagram service', '138'],
      ['TACACS', '49'],
      ['IEN-116 name service', '42'],
    ],
    caption: 'Remove a service with `no ip forward-protocol udp <port>`; add one with `ip forward-protocol udp <port>`.',
    notes:
      "`ip helper-address` is not DHCP-specific. It forwards UDP **broadcasts** for a default list of services to the helper address, and DHCP/BOOTP is only the most famous member of the list. The others are TFTP (69), DNS (53), the old Time protocol (37), NetBIOS name and datagram services (137 and 138), TACACS (49) and the IEN-116 name service (42). That default list matters in two ways. Operationally, a helper pointed at a DHCP server will also send it any TFTP or NetBIOS broadcasts from the LAN, which is usually harmless but occasionally surprising. For control, the global command `no ip forward-protocol udp <port>` removes a service from the list and `ip forward-protocol udp <port>` adds one. For the exam, you only need awareness: know that the helper relays several UDP services, not just DHCP, and that common modern services such as NTP (123), SNMP (161) and syslog (514) are **not** in the default list. Also remember that the helper affects only broadcasts that arrive on that interface; unicast traffic is routed normally.",
  },
  {
    kind: 'cli',
    title: 'A router interface as a DHCP client',
    code: `R3(config)# interface GigabitEthernet0/0/1
R3(config-if)# description Link to ISP
R3(config-if)# ip address dhcp
R3(config-if)# no shutdown
R3(config-if)# end
%DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/0/1 assigned DHCP address 198.51.100.2, mask 255.255.255.252, hostname R3
R3# show ip interface brief | include 0/0/1
GigabitEthernet0/0/1   198.51.100.2    YES DHCP   up                    up
R3# show dhcp lease
Temp IP addr: 198.51.100.2  for peer on Interface: GigabitEthernet0/0/1
Temp  sub net mask: 255.255.255.252
<output omitted>
   Lease: 86400 secs,  Renewal: 43200 secs,  Rebind: 75600 secs
Temp default-gateway addr: 198.51.100.1
R3# show ip route | include 0.0.0.0
Gateway of last resort is 198.51.100.1 to network 0.0.0.0
S*    0.0.0.0/0 [254/0] via 198.51.100.1`,
    highlight: ['ip address dhcp', 'DHCP', '[254/0]', 'Renewal: 43200 secs,  Rebind: 75600 secs'],
    notes:
      "Routers can be DHCP clients too, typically on the interface facing an ISP that assigns addresses dynamically. The interface command is simply `ip address dhcp`. Once the lease arrives, IOS logs `%DHCP-6-ADDRESS_ASSIGN`, and `show ip interface brief` shows **DHCP** in the Method column instead of manual or NVRAM. `show dhcp lease` displays the lease the router holds; notice the renewal and rebind timers — 43,200 seconds is 50% of the 86,400-second lease and 75,600 seconds is 87.5%, the T1 and T2 values from earlier. If the server supplies a default router option, IOS installs a static default route toward it with an administrative distance of **254**, visible as `S* 0.0.0.0/0 [254/0]`. That high AD means any manually configured default route (AD 1) or routing-protocol default would be preferred. The same command works on a switch SVI for management addressing. A common pairing on the exam: the ISP-facing interface uses `ip address dhcp`, and PAT on the same router uses `ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`, so NAT follows whatever address the ISP hands out.",
  },
  {
    kind: 'cli',
    title: 'The client view: APIPA means no DHCP reply',
    code: `C:\\> ipconfig /all
<output omitted>
Ethernet adapter Ethernet:

   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.83.107(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :
C:\\> ipconfig /renew
An error occurred while renewing interface Ethernet : unable to contact your DHCP server. Request has timed out.`,
    highlight: ['169.254.83.107', '255.255.0.0', 'unable to contact your DHCP server'],
    notes:
      "When a Windows client sends Discovers and never receives an Offer, it gives itself an **APIPA** (Automatic Private IP Addressing) address from **169.254.0.0/16** — the IPv4 link-local range — with mask 255.255.0.0 and **no default gateway**. macOS and Linux behave similarly. The client can talk only to other link-local hosts on the same segment, so to the user “the network is down.” For troubleshooting, APIPA is valuable evidence: the NIC and cable work well enough to send, but **no DHCP reply reached the client**. It says nothing about why, so work outward: is the port in the right VLAN, is a server or relay present for this subnet, does a pool match, are addresses left, is DHCP snooping dropping the Offer? `ipconfig /release` returns the lease (sending a DHCPRELEASE) and `ipconfig /renew` starts a new exchange; the timeout message here confirms the problem is still present. Once DHCP is fixed, a renew shows a proper address from the pool, the correct mask and the gateway from the `default-router` option. On the exam, any 169.254.x.x address in an exhibit means the host failed to obtain a lease.",
  },
  {
    kind: 'table',
    title: 'DHCPv4 troubleshooting checklist',
    columns: ['Symptom', 'Likely cause', 'Check / fix'],
    rows: [
      ['Remote subnet gets APIPA; server’s own subnet works', 'No `ip helper-address` on the client-facing interface', '`show ip interface <int> | include Helper`'],
      ['Helper present, still no Offer', 'No pool contains the giaddr, or no route back to it', 'Compare pool `network` with the relay interface subnet'],
      ['Old clients fine, new clients fail', 'Pool exhausted or exclusions cover too much', '`show ip dhcp pool` leased vs usable'],
      ['Address OK, cannot leave the subnet', 'Wrong or missing `default-router`', 'Fix `default-router` in the pool'],
      ['Clients fail after DHCP snooping is enabled', 'Uplink to the server is untrusted, so Offers are dropped', '`ip dhcp snooping trust` on the uplink'],
      ['Addresses skipped, conflicts logged', 'Static host using an address inside the pool', '`show ip dhcp conflict`; exclude that address'],
      ['Helper on the WAN interface', 'Broadcasts never reach that interface', 'Move the helper to the LAN/SVI facing clients'],
    ],
    notes:
      "Troubleshoot DHCP by following the Discover. If the client shows **169.254.x.x**, no reply reached it. If the server is in another subnet, the client-facing interface must have `ip helper-address`; a helper placed on the WAN interface does nothing, because client broadcasts never arrive there. With a helper in place, the server must have a pool whose `network` contains the giaddr, and a route back to that subnet. If only new clients fail, count addresses: exclusions that are too broad, or a pool sized for yesterday's headcount, leave nothing to lease. Clients that get an address but cannot reach other subnets usually received a wrong `default-router`. **DHCP snooping** is a classic hidden cause: once enabled on the access switch, server messages (Offer and Ack) are accepted only on **trusted** ports, so the uplink toward the legitimate server must be configured with `ip dhcp snooping trust`. Snooping switches also insert option 82 by default, which some servers reject when giaddr is zero — `no ip dhcp snooping information option` on the switch is the usual fix (covered in the Layer 2 security lesson). Finally, logged conflicts point to static hosts inside the pool range.",
  },
  {
    kind: 'cli',
    title: 'Case study: relay works, clients still fail',
    code: `R2# show ip interface GigabitEthernet0/0/0 | include Internet address|Helper
  Internet address is 192.168.21.1/24
  Helper address is 10.0.12.1
R1# show running-config | section BRANCH
ip dhcp pool BRANCH-LAN
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 10.99.1.53
R1# configure terminal
R1(config)# ip dhcp pool BRANCH-LAN
R1(dhcp-config)# no network 192.168.20.0 255.255.255.0
R1(dhcp-config)# network 192.168.21.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.21.1
R1(dhcp-config)# end`,
    highlight: ['192.168.21.1/24', 'network 192.168.20.0 255.255.255.0'],
    notes:
      "This is the kind of exhibit Cisco uses for DHCP troubleshooting. The branch LAN was readdressed from 192.168.20.0/24 to 192.168.21.0/24, and users now receive APIPA addresses. The relay is configured correctly: the helper exists on the client-facing interface and points at the server. The trap is on the server side. Relayed Discovers now carry **giaddr 192.168.21.1**, but the only branch pool still says `network 192.168.20.0 255.255.255.0`. No pool contains the giaddr, so R1 silently ignores every request — no error on the relay and nothing obvious on the server. The fix updates the pool: replace the network statement and point `default-router` at the new gateway, 192.168.21.1 (entering `default-router` again replaces the old value). Updating the exclusions for the new subnet and confirming that R1 has a route to 192.168.21.0/24 complete the job. When an exam question shows a relay and a pool, always compare the relay interface's subnet with the pool's network statement before looking at anything else; it is the single most common DHCP relay fault.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'DHCP exam traps',
    body: '==Discover and Request are broadcasts;== Offer and Ack go to the client’s MAC unless it sets the broadcast flag.',
    bullets: [
      'Server listens on UDP **67**, client on UDP **68**',
      'T1 = **50%** (unicast renew), T2 = **87.5%** (broadcast rebind)',
      '`ip helper-address` goes on the **client-facing** interface and names the server',
      '`ip dhcp excluded-address` is **global** config, not a pool command',
      'The server picks the pool by **giaddr**; no match = no Offer',
      '**169.254.x.x** means the client never received a DHCP reply',
      'DHCP-learned default route on a router has AD **254**',
    ],
    notes:
      "These are the DHCP facts the exam checks again and again. Addressing questions ask which DORA messages are broadcast: both client messages in the initial exchange are, and the server messages are sent to the client (broadcast only when the client requests it with the flag). Port questions swap 67 and 68 — the server owns 67. Timer questions offer 50/75/100 or similar distractors; T1 is 50% and T2 is 87.5%. Relay questions put the helper on the WAN interface or point it at the gateway instead of the server; the correct answer is always the interface where the clients' broadcasts arrive, with the server's IP as the argument. Configuration questions list `ip dhcp excluded-address` as a pool subcommand, but it is global. Troubleshooting questions hinge on the giaddr: the relay's interface address must fall inside a pool's network statement. APIPA in a Windows exhibit always means “no DHCP reply”, never “wrong DNS”. And a router using `ip address dhcp` installs its default route with AD 254, so a static default route would override it.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'DORA: Discover (bcast) → Offer → Request (bcast) → Ack; UDP 67 server / 68 client',
      'Leases renew at T1 50% (unicast) and rebind at T2 87.5% (broadcast)',
      'IOS server: global exclusions + pool with `network`, `default-router`, `dns-server`, `domain-name`, `lease`',
      'Relay: `ip helper-address <server>` on the client-facing interface; giaddr picks the pool',
      '`ip address dhcp` makes a router interface a client; default route AD 254',
      'Verify: `show ip dhcp binding`, `pool`, `conflict`; `show ip interface` for helpers',
      'APIPA = no reply: check helper, pool network, exclusions, snooping trust',
    ],
    notes:
      "DHCP is a four-message conversation: the client broadcasts a Discover, servers make Offers, the client broadcasts a Request naming the chosen server, and that server confirms with an Ack, all over UDP 67 and 68. Leases are renewed with a unicast Request at T1 (50%) and, failing that, rebound with a broadcast at T2 (87.5%). An IOS router becomes a server with global exclusions and a pool that defines the network, gateway, DNS servers, domain name and lease. When the server is elsewhere, the relay agent — `ip helper-address` on the interface facing the clients — converts broadcasts to unicasts and stamps the giaddr, which the server uses to choose the pool and to route its reply. Routers can also be clients with `ip address dhcp`, installing a default route with AD 254. Verify servers with `show ip dhcp binding`, `show ip dhcp pool` and `show ip dhcp conflict`, and relays with `show ip interface`. When a client shows an APIPA address, walk the path: VLAN, helper, pool network versus giaddr, free addresses, DHCP snooping trust and conflicts.",
  },
];
