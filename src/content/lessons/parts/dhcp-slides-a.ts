import type { Slide } from '../../types';

export const dhcpSlidesA: Slide[] = [
  {
    kind: 'title',
    title: 'DHCP Server, Client & Relay',
    subtitle: 'DORA, IOS pools, helper addresses and DHCPv4 troubleshooting',
    notes:
      "Every laptop, phone, printer and access point that joins a network needs an IP address, a mask, a default gateway and DNS servers. Typing those by hand does not scale and invites mistakes, so networks hand them out automatically with the **Dynamic Host Configuration Protocol (DHCP)**. In this deck you will follow the four-message **DORA** exchange packet by packet (who broadcasts, who unicasts, which UDP ports), see how leases are renewed at **T1** and **T2**, configure a Cisco router as a DHCP server, relay requests across subnets with `ip helper-address`, make a router interface a DHCP client, and troubleshoot the failures you will meet in real networks and on the exam. DHCP appears in v1.1 topics 4.3 (the role of DHCP) and 4.6 (configure and verify DHCP client and relay), and in the Network Services and Security domain of v2.0; the scope is the same on both versions.",
  },
  {
    kind: 'bullets',
    title: 'What DHCP does',
    bullets: [
      'Leases IPv4 settings: **address, mask, default gateway, DNS servers**, domain name',
      'Client/server over UDP: server port **67**, client port **68**',
      'Addresses are **leased** for a time, then renewed or returned',
      'Servers: Windows/Linux servers, IOS routers and L3 switches, home routers, ISPs',
      'Routers, servers and printers keep static IPs — exclude those from pools',
      'Options carry the settings: 3 router, 6 DNS servers, 15 domain name, 51 lease time',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'needs an IP', x: 1, y: 0.9 },
        { id: 'lap', icon: 'laptop', label: 'Laptop', x: 1, y: 2.5 },
        { id: 'ph', icon: 'phone', label: 'IP phone', x: 1, y: 4.1 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.8, y: 2.5 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'DHCP server', x: 7, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'lap', to: 'sw' },
        { from: 'ph', to: 'sw' },
        { from: 'sw', to: 'r1', label: '192.168.10.0/24', toLabel: 'G0/0/0 .1' },
      ],
      annotations: [{ x: 7, y: 4.1, text: 'Leases 192.168.10.11 – .254', tone: 'accent' }],
    },
    notes:
      "DHCP turns address management into a service. A client that boots with no configuration asks the network for settings, and a server answers with an address from a **pool** plus **options**: the subnet mask, the default gateway (option 3), DNS servers (option 6), the domain name (option 15), the lease time (option 51) and many more — IP phones and access points even learn their TFTP or controller addresses this way. The address is **leased**, not given away: the client must renew it periodically, and when a device leaves, its address eventually returns to the pool. DHCP runs over UDP with fixed ports — the server listens on **67** and the client on **68**, inherited from the older BOOTP protocol. The server can be a dedicated Windows or Linux server, a Cisco router or Layer 3 switch, the all-in-one home router, or the ISP's equipment. Devices that others must find at a fixed address, such as routers, servers and printers, normally keep static addresses, and those addresses must be excluded from the pool so the server never hands them to someone else.",
  },
  {
    kind: 'diagram',
    title: 'DORA: the four-message exchange',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'PC1 (no IP yet)', icon: 'pc' },
        { id: 's', label: 'R1 DHCP server 192.168.10.1', icon: 'router' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'DHCPDISCOVER', sub: 'broadcast · 0.0.0.0:68 → 255.255.255.255:67' },
        { from: 's', to: 'c', label: 'DHCPOFFER', sub: 'to client MAC (broadcast if flag set) · offers 192.168.10.11' },
        { from: 'c', to: 's', label: 'DHCPREQUEST', sub: 'broadcast · “I accept R1’s offer” (server identifier)' },
        { from: 's', to: 'c', label: 'DHCPACK', sub: 'lease confirmed: IP, mask, gateway, DNS, lease time', tone: 'good' },
        { note: 'Client may ARP-check the address; if it is in use → DHCPDECLINE' },
      ],
    },
    caption: 'Client messages are broadcasts; server replies go to the client’s MAC unless the client asks for broadcast.',
    notes:
      "The client has no address, so it starts with a **Discover** sent from 0.0.0.0, UDP 68, to the limited broadcast 255.255.255.255, UDP 67; the frame goes to FFFF.FFFF.FFFF, so every device in the VLAN sees it. Each server that can help reserves an address and sends an **Offer**. RFC 2131 lets the client choose how replies reach it: normally the server addresses the frame to the client's MAC, but a client that sets the **broadcast flag** receives the Offer and Ack as broadcasts — so exam answers describe Offer and Ack as “unicast to the client” unless they mention the flag. The client then sends a **Request**, again as a broadcast, even though it knows the server's address. The broadcast tells every server which offer was accepted (the server identifier option), so the losers can return their reserved addresses. Finally the chosen server sends an **Ack** confirming the lease and all options. Many clients then ARP for their new address; if another host answers, the client sends a **Decline** and starts over.",
  },
  {
    kind: 'table',
    title: 'DORA message by message',
    columns: ['Message', 'Sent by', 'IP source → destination', 'Frame destination', 'Purpose'],
    rows: [
      ['**Discover**', 'Client', '`0.0.0.0` → `255.255.255.255`', 'Broadcast', 'Find any DHCP server'],
      ['**Offer**', 'Server', 'Server IP → offered IP (or broadcast)', 'Client MAC (or broadcast)', 'Propose an address and options'],
      ['**Request**', 'Client', '`0.0.0.0` → `255.255.255.255`', 'Broadcast', 'Accept one offer; inform all servers'],
      ['**Ack**', 'Server', 'Server IP → client IP (or broadcast)', 'Client MAC (or broadcast)', 'Confirm the lease'],
    ],
    caption: 'Ports never change: client **UDP 68** ↔ server **UDP 67**.',
    notes:
      "Use this table to answer the addressing questions Cisco likes. The two **client** messages of the initial exchange are always broadcasts at both layers: IP source 0.0.0.0 because the client has no address yet, IP destination 255.255.255.255, and destination MAC FFFF.FFFF.FFFF. The two **server** messages are addressed to the client: the frame goes to the client's MAC address and the IP destination is the address being offered, unless the client set the broadcast flag, in which case the server broadcasts them. Either way, UDP ports are constant — the client always uses 68 and the server always uses 67 — which is why exam options that swap the ports are wrong. Two consequences follow. First, routers do not forward the 255.255.255.255 broadcast, so without a relay agent a client can only reach a server in its own subnet. Second, because the Request is broadcast, a network with two servers still works cleanly: both see which offer the client picked, and the unselected server releases its reserved address.",
  },
  {
    kind: 'definitions',
    title: 'More DHCP messages and terms',
    terms: [
      { term: '**DHCPDECLINE**', def: 'Client → server: the offered address is already in use (the client’s ARP check got an answer).' },
      { term: '**DHCPNAK**', def: 'Server → client: request refused, e.g. the client moved to a different subnet. The client restarts with Discover.' },
      { term: '**DHCPRELEASE**', def: 'Client → server: I am giving my lease back (`ipconfig /release`).' },
      { term: '**DHCPINFORM**', def: 'Client with a static IP asks only for options (DNS, domain name).' },
      { term: '**Pool / scope**', def: 'The range of addresses and the options a server hands out for one subnet.' },
      { term: '**Binding**', def: 'The server’s record of a lease: IP address ↔ client ID/MAC plus expiry time.' },
    ],
    notes:
      "DORA is the happy path, but four more messages appear in exam questions. **Decline** is the client's safety net: after an Ack, the client can ARP for its new address, and if someone answers, it declines the lease and the server marks that address as a conflict. **NAK** (negative acknowledgment) is the server saying no, typically when a client wakes up in a different subnet and asks to keep its old address; the client must start again with a Discover. **Release** is sent when a user runs `ipconfig /release` or a device shuts down gracefully; the address returns to the pool immediately instead of waiting for the lease to expire. **Inform** is used by hosts with manually configured addresses that still want options such as DNS servers. On the server side, Microsoft calls a pool a **scope**, while IOS calls it a pool. Each active lease is a **binding**, which you will see with `show ip dhcp binding`. Remember who sends what: Discover, Request, Decline, Release and Inform come from clients; Offer, Ack and NAK come from servers.",
  },
  {
    kind: 'diagram',
    title: 'The lease lifecycle: T1 and T2',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Lease granted', sub: 'DHCPACK (0%)', shape: 'pill' },
        { id: 'b', label: 'T1 = 50%', sub: 'renew: unicast Request to the same server', tone: 'accent' },
        { id: 'c', label: 'T2 = 87.5%', sub: 'rebind: broadcast Request to any server', tone: 'warn' },
        { id: 'd', label: 'Lease expires', sub: 'stop using IP, restart Discover', shape: 'round', tone: 'bad' },
      ],
    },
    caption: 'A successful renewal (Ack) at any point resets the clock to 0%.',
    notes:
      "A lease has two timers that the client tracks. At **T1**, by default 50% of the lease time, the client enters the renewing state and sends a Request directly — unicast — to the server that granted the lease. Most of the time that server simply answers with an Ack and the lease starts over; users never notice. If the server does not answer, the client keeps trying until **T2**, by default 87.5% of the lease, and then enters the rebinding state: it now **broadcasts** its Request so that any server that can vouch for the address may answer. If the lease reaches 100% with no Ack at all, the client must stop using the address and begin again with a Discover. With the IOS default lease of **one day**, T1 falls at 12 hours and T2 at 21 hours. Shorter leases recycle addresses faster in busy guest networks; longer leases reduce DHCP traffic on stable wired networks. On the exam, remember the two percentages and which one is unicast (T1) and which is broadcast (T2).",
  },
  {
    kind: 'cli',
    title: 'Configuring an IOS DHCP server',
    code: `R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10
R1(config)# ip dhcp pool HQ-LAN
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 10.99.1.53 10.99.1.54
R1(dhcp-config)# domain-name example.com
R1(dhcp-config)# lease 7
R1(dhcp-config)# exit
R1(config)# interface GigabitEthernet0/0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# end
R1# show running-config | section ip dhcp
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp pool HQ-LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 10.99.1.53 10.99.1.54
 domain-name example.com
 lease 7`,
    highlight: ['ip dhcp excluded-address', 'network 192.168.10.0 255.255.255.0', 'default-router 192.168.10.1'],
    notes:
      "An IOS DHCP server takes two kinds of configuration. The **exclusion** is a global command: `ip dhcp excluded-address 192.168.10.1 192.168.10.10` reserves the gateway and ten addresses for static devices, so the server will never lease them. Configure exclusions before the pool, so the server can never lease those addresses in the meantime. Everything else lives in **DHCP pool mode**, entered with `ip dhcp pool HQ-LAN` (the pool name only has local meaning). `network` defines the subnet whose addresses the pool leases — the mask can also be written as a prefix, `network 192.168.10.0 /24`. `default-router` is the gateway clients will use and must be an address in the same subnet, normally the router interface. `dns-server` accepts several addresses in order of preference, `domain-name` sets the DNS suffix, and `lease 7` sets a seven-day lease instead of the default one day; the syntax is `lease days [hours [minutes]]`, so `lease 0 8` means eight hours and `lease infinite` never expires. The DHCP service itself is enabled by default on IOS.",
  },
  {
    kind: 'bullets',
    title: 'How the IOS DHCP server behaves',
    bullets: [
      { text: 'Picks the pool whose `network` contains:', sub: ['the **receiving interface IP** (local clients)', 'the **giaddr** (relayed clients)'] },
      'No matching pool → the Discover is **silently ignored**',
      'Pings a candidate address first (default 2 pings, 500 ms); a reply = **conflict**',
      'Conflicting addresses are removed from use until cleared',
      'Default lease **1 day**; `service dhcp` is on by default',
      'Exclusions are **global** — never inside the pool',
    ],
    notes:
      "Knowing how the server makes decisions explains most DHCP failures. When a Discover arrives directly on an interface, IOS looks for a pool whose `network` statement contains that interface's IP address — 192.168.10.1 on G0/0/0 selects HQ-LAN. When a relayed Discover arrives, IOS uses the **giaddr** field instead. If no pool matches, the server sends no Offer at all, so a wrong `network` statement looks exactly like a dead server. Before offering an address, IOS pings it (two echo requests with a 500 ms timeout by default); if anything replies, the address is recorded as a **conflict**, skipped, and another address is offered. Conflicts stay out of service until you clear them. The lease defaults to one day. The `service dhcp` global command, enabled by default, turns on both the DHCP server and the relay agent; `no service dhcp` disables both. Finally, remember that `ip dhcp excluded-address` is a global configuration command, not a pool subcommand; answer options that list it among the pool settings are a classic exam distractor.",
  },
  {
    kind: 'cli',
    title: 'Verifying bindings and pool usage',
    code: `R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
192.168.10.11       0100.5056.a3b2.01       Oct 03 2026 09:14 AM    Automatic
192.168.10.12       0100.5056.a3b2.02       Oct 03 2026 09:15 AM    Automatic
192.168.20.11       0100.5056.c1d4.11       Sep 27 2026 02:40 PM    Automatic
R1# show ip dhcp pool HQ-LAN

Pool HQ-LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 2
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.10.13        192.168.10.1     - 192.168.10.254    2`,
    highlight: ['192.168.10.11', 'Automatic', 'Leased addresses               : 2'],
    notes:
      "`show ip dhcp binding` is the server's lease table. Each line shows the leased **IP address**, the **client identifier** (Windows sends 01 followed by its MAC, so 0100.5056.a3b2.01 is MAC 0050.56a3.b201), the **lease expiration** and the **type**: Automatic for normal pool leases, Manual for fixed bindings an administrator created. It is the fastest way to answer “which IP did this MAC receive?” and “is the server handing out addresses at all?”. Notice the expirations: the HQ leases end seven days out because of `lease 7`, while 192.168.20.11 — a relayed branch client served by a different pool with the default lease — expires one day later. `show ip dhcp pool` summarizes each pool: total addresses in the range (254 for a /24, whether or not some are excluded), how many are leased, and the **current index**, the next address the server will try. When leased addresses approach the number of addresses actually available after exclusions, new clients are about to fail. `clear ip dhcp binding <ip>` or `clear ip dhcp binding *` deletes leases from the table, which is useful after readdressing but disruptive in production.",
  },
  {
    kind: 'cli',
    title: 'Address conflicts',
    code: `R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
192.168.10.13     Ping               Sep 26 2026 10:02 AM
R1# show ip dhcp binding 192.168.10.14
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
192.168.10.14       0100.5056.a3b2.03       Oct 03 2026 10:02 AM    Automatic
R1# configure terminal
R1(config)# ip dhcp excluded-address 192.168.10.13
R1(config)# end
R1# clear ip dhcp conflict *`,
    highlight: ['192.168.10.13     Ping', 'ip dhcp excluded-address 192.168.10.13'],
    notes:
      "When the server's ping check (or a client's gratuitous ARP and Decline) finds an address already in use, IOS records it in `show ip dhcp conflict` with the detection method and time, and stops leasing it. Here 192.168.10.13 answered the ping, so the next client received 192.168.10.14 instead — no outage, just a skipped address. A conflict almost always means someone configured a **static address inside the pool range**, such as a printer or a lab server. The permanent fix is to find the device and either move it out of the pool range or exclude its address, which is exactly what the transcript does with `ip dhcp excluded-address 192.168.10.13`. Only then should you run `clear ip dhcp conflict *`; clearing first simply returns the address to the pool, and the next ping check will flag it again. For deeper troubleshooting, `debug ip dhcp server events` and `debug ip dhcp server packet` show the server's decisions in real time. On the exam, match the symptom “addresses are being skipped” or “conflict logged” to a statically addressed device inside the pool.",
  },
];
