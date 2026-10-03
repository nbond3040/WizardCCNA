import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Layer 2 Security',
    subtitle: 'Port security, DHCP snooping, DAI, storm control, RA guard and VLAN hopping defenses',
    notes:
      "Most attacks that reach the inside of a network start at an ordinary access port: a laptop plugged into a wall jack, a compromised PC, a cheap router someone brought from home. Switches trust what they receive by default — they learn every source MAC, forward every DHCP offer and believe every ARP reply — and attackers exploit exactly that trust. In this lesson you will learn the Catalyst features that take that trust away. **Port security** limits which and how many MAC addresses may use a port. **DHCP snooping** separates trusted ports (toward real DHCP servers) from untrusted ones and builds a binding table. **Dynamic ARP Inspection** uses that table to drop forged ARP messages. **Storm control** and **IPv6 RA guard** — both named in the v2.0 blueprint — limit broadcast storms and block rogue router advertisements. Finally you will see how **VLAN hopping** works and how disabling DTP and moving the native VLAN stop it. This is exam topic 5.7 in v1.1 and part of domain 4 in the v2.0 blueprint. Expect configuration, show-command and what-happens-when questions, especially about violation modes and trusted ports.",
  },
  {
    kind: 'bullets',
    title: 'Threats at the access edge',
    bullets: [
      '**MAC flooding** — fill the CAM table so frames are flooded',
      '**Rogue DHCP server** — hand out a fake gateway or DNS server',
      "**ARP spoofing** — claim the gateway's IP to intercept traffic",
      '**VLAN hopping** — reach VLANs the port does not belong to',
      '**Broadcast storms** and **rogue IPv6 RAs** — disrupt or redirect',
      'Defense: treat **access ports** as untrusted; trust only uplinks',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', x: 1.2, y: 1.2 },
        { id: 'pc2', icon: 'pc', label: 'PC2', x: 1.2, y: 3.8 },
        { id: 'att', icon: 'attacker', label: 'Attacker', x: 4.5, y: 4.2, tone: 'bad' },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.5, y: 2 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'gateway + DHCP', x: 8.3, y: 2 },
      ],
      links: [
        { from: 'pc1', to: 'sw1', toLabel: 'Fa0/1' },
        { from: 'pc2', to: 'sw1', toLabel: 'Fa0/2' },
        { from: 'att', to: 'sw1', fromLabel: 'Fa0/3', tone: 'bad' },
        { from: 'sw1', to: 'r1', fromLabel: 'Gi0/1', label: 'trusted uplink', tone: 'good' },
      ],
    },
    notes:
      "Every attack in this lesson abuses a default behavior of a switch or a host. A switch learns any source MAC it sees, so an attacker can flood it with fake ones. Hosts accept the first DHCP offer they receive, so a rogue server can hand out a fake default gateway or DNS server and quietly become a man in the middle. ARP has no authentication, so any host can claim to own the gateway's IP address. Ports left in a dynamic DTP mode will form a trunk with anyone who asks, and the native VLAN crosses trunks untagged — both open the door to VLAN hopping. Broadcast storms, whether caused by a loop, a faulty NIC or an attacker, can saturate every link in a VLAN, and on IPv6 networks any host can send router advertisements. The defenses follow one design principle: treat every **access port** as untrusted and apply limits and checks there, while the uplinks toward real routers, DHCP servers and other switches are trusted. In the topology, PC1, PC2 and the attacker all sit on untrusted access ports of SW1; only Gi0/1 toward R1 is trusted. Keep this picture in mind — DHCP snooping and DAI questions almost always ask which port should be trusted.",
  },
  {
    kind: 'diagram',
    title: 'MAC flooding and the CAM table',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'n1', label: 'Attacker floods frames', sub: 'random source MACs', shape: 'pill', tone: 'bad' },
        { id: 'n2', label: 'CAM table full', sub: 'no room to learn' },
        { id: 'n3', label: 'Destination unknown?', shape: 'diamond' },
        { id: 'n4', label: 'Frame flooded', sub: 'out every port in the VLAN', tone: 'bad' },
        { id: 'n5', label: 'Attacker captures it', shape: 'round', tone: 'bad' },
      ],
    },
    caption: 'Port security stops the flood: each port may only use its allowed number of MACs.',
    notes:
      "A switch builds its MAC address table — the **CAM table** — by recording the source MAC of every frame and the port it arrived on. Entries age out after 300 seconds of inactivity by default, and the table has a fixed hardware size. In a MAC flooding attack, a tool such as macof sends thousands of frames per second, each with a different random source MAC. The table fills up with fake entries, so the switch can no longer learn the real hosts' addresses once their entries age out. A frame whose destination MAC is not in the table is treated as **unknown unicast** and flooded out every port in the VLAN — including the attacker's. The switch now behaves much like a hub, and the attacker can capture conversations it should never see. Because the table is shared by all VLANs, the attack can also degrade forwarding in other VLANs on the same switch. The mitigation is **port security**: when a port may use only one or two MAC addresses, a flood of new source MACs triggers a violation at the first unauthorized address instead of filling the table. On the exam, link MAC flooding or CAM table overflow to port security.",
  },
  {
    kind: 'bullets',
    title: 'Port security: what it enforces',
    bullets: [
      'Limits the **source MACs** allowed to send into a port',
      'Defaults: **maximum 1**, violation **shutdown**, no aging',
      '**Static** secure MAC: typed into the configuration',
      '**Dynamic** secure MAC: learned, forgotten at reload',
      '**Sticky** secure MAC: learned, then written to the ==running-config==',
      'Needs a **static** access or trunk port — not a dynamic DTP port',
      'Violation: new MAC beyond the maximum, or a secure MAC on another port',
    ],
    notes:
      "Port security controls **which source MAC addresses** may send frames into an interface and **how many**. The defaults matter for the exam: once you enable it with `switchport port-security`, the port allows a **maximum of one** MAC address, the violation mode is **shutdown**, and aging is disabled. Secure addresses come in three flavors. **Static** secure addresses are typed with `switchport port-security mac-address H.H.H` and stay in the configuration. **Dynamic** secure addresses are learned automatically up to the maximum but live only in the MAC table, so they are forgotten at reload. **Sticky** secure addresses are learned automatically and then written into the running-config as `switchport port-security mac-address sticky H.H.H` lines — the convenience of learning with the permanence of static entries, provided you save the configuration. A violation occurs in two cases: a frame arrives with a new source MAC when the port already holds its maximum, or a MAC address secured on one port shows up on another secure port in the same VLAN. Finally, IOS refuses to enable port security on a port that is still in a dynamic DTP mode, which is the default on many Catalyst models, so set `switchport mode access` first.",
  },
  {
    kind: 'cli',
    title: 'Configuring port security',
    code: `SW1(config)# interface FastEthernet0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation restrict
SW1(config-if)# interface FastEthernet0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security mac-address 0050.7966.6820
SW1(config-if)# interface FastEthernet0/3
SW1(config-if)# switchport port-security
Command rejected: FastEthernet0/3 is a dynamic port.`,
    highlight: ['switchport port-security mac-address sticky', 'violation restrict', 'Command rejected'],
    caption: 'Fa0/1: two sticky MACs, restrict mode. Fa0/2: one static MAC (a printer). Fa0/3: still a dynamic port.',
    notes:
      "This transcript configures three ports. Fa0/1 is an access port in VLAN 10 that allows **two** devices. The `sticky` keyword makes the switch learn the first two source MACs it sees and write them into the running-config; addresses learned before sticky was enabled are converted as well. The violation mode is changed to `restrict`, so a third device is dropped and logged rather than shutting the whole port down. Fa0/2 connects a printer, so its MAC address is configured statically and no other device can use that wall jack; the defaults (maximum 1, shutdown) apply. Port-security subcommands can be entered in any order, but nothing is enforced until the plain `switchport port-security` command is present — a classic exam trap shows a configuration with a maximum and a violation mode but no enabling command. Fa0/3 shows the other classic trap: the port is still in its default dynamic mode, so IOS rejects the command with **Command rejected: … is a dynamic port**. Setting `switchport mode access` (or a static trunk) fixes it. Finally, remember that sticky addresses live in the running-config: if nobody runs `copy running-config startup-config`, a reload erases them and the port learns again from scratch.",
  },
  {
    kind: 'table',
    title: 'Violation modes compared',
    columns: ['Mode', 'Drops offending frames', 'Syslog + SNMP trap', 'Violation counter', 'Port state'],
    rows: [
      ['`protect`', 'Yes', 'No', 'Not incremented', 'Stays up (Secure-up)'],
      ['`restrict`', 'Yes', 'Yes', 'Incremented', 'Stays up (Secure-up)'],
      ['`shutdown` (default)', 'Yes — all traffic stops', 'Yes', 'Incremented', '==**err-disabled**== (Secure-shutdown)'],
    ],
    caption: 'Set with `switchport port-security violation protect | restrict | shutdown`.',
    notes:
      "The three violation modes differ in how loudly they react, and the exam expects you to know this table cold. All three **drop** the frames from the offending MAC address. **Protect** does nothing else: no syslog message, no SNMP trap and no increase in the violation counter, so it is the hardest mode to troubleshoot — users simply find that a new device does not work. **Restrict** also drops the frames but generates a syslog message and an SNMP trap and increments the security violation counter for each violating frame, while the port stays up for the legitimate devices. **Shutdown**, the default, is the most drastic: the first violation puts the whole interface into the **err-disabled** state, cutting off even the legitimate device, and it logs the event, sends a trap and increments the counter. The port stays down until an administrator recovers it or automatic recovery is configured. A useful memory aid: protect is silent, restrict reports, shutdown reports and kills the port. Exam items often describe a symptom — for example, the second PC does not work and there are no log messages — and expect you to name the mode, which in that case is protect.",
  },
  {
    kind: 'cli',
    title: 'Verifying: show port-security interface',
    code: `SW1# show port-security interface FastEthernet0/4
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0050.7966.6899:10
Security Violation Count   : 1`,
    highlight: ['Secure-shutdown', '0050.7966.6899:10', 'Security Violation Count'],
    caption: 'One sticky MAC fills the maximum of one; a second device triggered a shutdown.',
    notes:
      "`show port-security interface` is the command exam exhibits use most, so learn to read it from the top. **Port Security: Enabled** confirms the feature is on. **Port Status** is `Secure-up` when the port is working normally, `Secure-down` when port security is enabled but the link is down, and `Secure-shutdown` when a violation has err-disabled it — as here. **Violation Mode** shows the configured mode (Shutdown is the default). **Aging Time 0** means secure addresses never age out. **Maximum MAC Addresses** is the limit and **Total MAC Addresses** the number currently secured, split into **Configured** (static) and **Sticky** counts. **Last Source Address:Vlan** records the most recent source MAC seen on the port — after a violation, usually the offender, 0050.7966.6899 in VLAN 10 here. **Security Violation Count** counts violations; in shutdown mode it stops at 1 because the port goes down on the first one. Put it together: one sticky address already fills the maximum of one, a second device was connected, and the port shut down. Related commands: `show port-security` gives a one-line summary per secure port, and `show port-security address` lists every secure MAC with its type.",
  },
  {
    kind: 'cli',
    title: 'Recovering an err-disabled port',
    code: `%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/4, putting Fa0/4 in err-disable state
%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0050.7966.6899 on port FastEthernet0/4.
SW1# show interfaces status err-disabled

Port      Name               Status       Reason               Err-disabled Vlans
Fa0/4                        err-disabled psecure-violation
SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# interface FastEthernet0/4
SW1(config-if)# shutdown
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# errdisable recovery cause psecure-violation
SW1(config)# errdisable recovery interval 300`,
    highlight: ['psecure-violation', 'shutdown', 'errdisable recovery cause psecure-violation'],
    caption: 'Manual: shutdown then no shutdown. Automatic: errdisable recovery (default interval 300 s).',
    notes:
      "A port err-disabled by port security stays down until it is recovered, and it goes down again at once if the cause is still present — so first remove the unauthorized device or adjust the configuration. The console shows why the port went down: `%PM-4-ERR_DISABLE` names the cause (**psecure-violation**) and `%PORT_SECURITY-2-PSECURE_VIOLATION` names the offending MAC address. `show interfaces status err-disabled` lists every err-disabled port with its reason. To recover manually, enter the interface and issue `shutdown` followed by `no shutdown`; `no shutdown` alone does nothing, because the port is not administratively down. To recover automatically, enable recovery for the cause with `errdisable recovery cause psecure-violation`; the switch then re-enables the port after the **recovery interval**, which defaults to **300 seconds** and is changed with `errdisable recovery interval`. The same mechanism recovers ports err-disabled by other features, such as the DHCP snooping and DAI rate limits (causes `dhcp-rate-limit` and `arp-inspection`) or BPDU guard. Automatic recovery is convenient, but if the offending device is still connected the port simply flaps between up and err-disabled every five minutes. `show errdisable recovery` lists the enabled causes and the interval.",
  },
  {
    kind: 'diagram',
    title: 'DHCP snooping: trusted and untrusted ports',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc1', icon: 'pc', label: 'PC1', x: 1.2, y: 0.9 },
        { id: 'pc2', icon: 'pc', label: 'PC2', x: 1.2, y: 2.6 },
        { id: 'rogue', icon: 'server', label: 'Rogue DHCP', x: 1.2, y: 4.3, tone: 'bad' },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'snooping on VLAN 10', x: 4.8, y: 2.6 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'real DHCP server', x: 8.6, y: 2.6 },
      ],
      links: [
        { from: 'pc1', to: 'sw', toLabel: 'Fa0/1', label: 'untrusted' },
        { from: 'pc2', to: 'sw', toLabel: 'Fa0/2', label: 'untrusted' },
        { from: 'rogue', to: 'sw', toLabel: 'Fa0/5', label: 'OFFER dropped', tone: 'bad' },
        { from: 'sw', to: 'r1', fromLabel: 'Gi0/1', label: 'trusted', tone: 'good' },
      ],
    },
    bullets: [
      'Every port is **untrusted** by default',
      'Untrusted: server messages (OFFER, ACK, NAK) are **dropped**',
      'Trust only uplinks toward the real server or relay',
      'ACKs to clients build the **binding table** (MAC, IP, VLAN, port)',
    ],
    notes:
      "A **rogue DHCP server** — an attacker's laptop, or simply a home router plugged in by an employee — answers DHCP Discovers faster than the real server and hands clients a bogus default gateway or DNS server, turning the attacker into a man in the middle or breaking connectivity. A related attack, **DHCP starvation**, sends Discovers from thousands of fake MACs until the real pool is empty. DHCP snooping counters both. Every port is **untrusted** by default. On an untrusted port the switch accepts client messages such as DISCOVER and REQUEST but **drops server messages** — OFFER, ACK and NAK — because no DHCP server should sit behind an access port. It also checks client messages: a RELEASE or DECLINE must arrive on the port recorded for that client, and by default the source MAC must match the client hardware address inside the DHCP message. You mark as **trusted** only the ports that lead toward the legitimate server or relay agent — here Gi0/1 toward R1. As ACKs flow back to clients on untrusted ports, the switch records each lease in the **binding table**, the database that DAI relies on. In the diagram, the OFFER from the rogue server on Fa0/5 is simply discarded.",
  },
  {
    kind: 'cli',
    title: 'Configuring DHCP snooping',
    code: `SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# no ip dhcp snooping information option
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# ip dhcp snooping trust
SW1(config-if)# interface range FastEthernet0/1 - 24
SW1(config-if-range)# ip dhcp snooping limit rate 10
SW1(config-if-range)# end
SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:66:68:01   10.1.10.21       86211       dhcp-snooping   10    FastEthernet0/1
00:50:79:66:68:02   10.1.10.22       85990       dhcp-snooping   10    FastEthernet0/2
Total number of bindings: 2`,
    highlight: ['ip dhcp snooping vlan 10', 'ip dhcp snooping trust', 'limit rate 10', 'dhcp-snooping'],
    caption: 'Two global commands, trust on the uplink, a rate limit on access ports.',
    notes:
      "Enabling DHCP snooping takes **two global commands**: `ip dhcp snooping` turns the feature on and `ip dhcp snooping vlan 10` selects the VLANs to protect — forget either one and nothing is snooped. Next, trust the uplink toward the real DHCP server with `ip dhcp snooping trust`; every other port stays untrusted. `ip dhcp snooping limit rate 10` caps each untrusted access port at 10 DHCP packets per second; a port that exceeds its limit is err-disabled with the cause `dhcp-rate-limit`, which blunts starvation attacks. There is no limit by default, and uplinks are normally left unlimited because they carry the traffic of many clients. The `no ip dhcp snooping information option` line is explained on the next slide. `show ip dhcp snooping binding` shows what the switch has learned: the client MAC (displayed in colon format), the leased IP, the remaining lease in seconds, the VLAN and the port. Only clients on untrusted ports appear, and entries disappear when the lease expires or is released. `show ip dhcp snooping` shows the global state, the enabled VLANs and each interface's trust state and rate limit.",
  },
  {
    kind: 'bullets',
    title: 'Option 82: the silent DHCP failure',
    bullets: [
      'Snooping **inserts option 82** into client requests by default',
      'The switch is not a relay, so **giaddr stays 0.0.0.0**',
      'An IOS DHCP server **drops** such packets by default',
      'Symptom: clients fall back to **169.254.x.x** right after enabling snooping',
      'Switch fix: `no ip dhcp snooping information option`',
      'Router alternative: `ip dhcp relay information trust-all`',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1', icon: 'pc' },
        { id: 'sw', label: 'SW1 (snooping)', icon: 'switch' },
        { id: 'r1', label: 'R1 DHCP server', icon: 'router' },
      ],
      steps: [
        { from: 'pc', to: 'sw', label: 'DHCPDISCOVER', sub: 'broadcast from 0.0.0.0' },
        { from: 'sw', to: 'r1', label: 'DISCOVER + option 82', sub: 'giaddr 0.0.0.0', tone: 'accent' },
        { note: 'R1 drops it: option 82 present but giaddr is zero', tone: 'bad' },
        { note: 'No OFFER ever arrives: PC1 self-assigns 169.254.x.x', tone: 'bad' },
      ],
    },
    notes:
      "This is the DHCP snooping problem that trips up engineers in real networks and appears in troubleshooting questions. When snooping is enabled, a Catalyst switch by default **inserts option 82** (the relay agent information option) into DHCP requests it receives from clients on untrusted ports, identifying the switch and the port. The switch is not a relay agent, so the **giaddr** field remains **0.0.0.0**. A Cisco IOS router acting as the DHCP server — or as a relay — treats a packet that carries option 82 but has a zero giaddr as suspicious and, by default, **drops** it. The result is baffling: the moment snooping is enabled, clients stop getting addresses and fall back to 169.254.x.x APIPA addresses, even though the uplink is trusted and the pool is fine. Two fixes exist. On the switch, `no ip dhcp snooping information option` stops the insertion — the usual exam answer. On the router, `ip dhcp relay information trust-all` (or `ip dhcp relay information trusted` on the receiving interface) makes it accept those packets. Option 82 is valuable in large networks that assign addresses per switch port, but only when the server is designed to use it.",
  },
  {
    kind: 'diagram',
    title: 'ARP spoofing: a man in the middle',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 10.1.10.21', icon: 'pc' },
        { id: 'att', label: 'Attacker 10.1.10.99', icon: 'attacker' },
        { id: 'gw', label: 'R1 10.1.10.1', icon: 'router' },
      ],
      steps: [
        { from: 'att', to: 'pc', label: 'Gratuitous ARP reply', sub: '10.1.10.1 is at 0050.7966.6899', tone: 'bad' },
        { from: 'att', to: 'gw', label: 'Gratuitous ARP reply', sub: '10.1.10.21 is at 0050.7966.6899', tone: 'bad' },
        { note: "Both ARP caches now point at the attacker's MAC" },
        { from: 'pc', to: 'att', label: 'Traffic meant for the gateway', tone: 'bad' },
        { from: 'att', to: 'gw', label: 'Relayed onward — nobody notices', dashed: true },
      ],
    },
    caption: 'Hosts accept unsolicited ARP replies and overwrite their caches.',
    notes:
      "ARP has no authentication: a host accepts an ARP reply even if it never asked, and simply overwrites its cache. In **ARP spoofing**, also called ARP poisoning, the attacker sends gratuitous ARP replies to PC1 claiming that the gateway's IP, 10.1.10.1, belongs to the attacker's MAC, and to the router claiming that PC1's IP belongs to that same MAC. Both caches are poisoned. PC1 now builds frames for the gateway with the attacker's MAC as the destination, the switch dutifully delivers them to the attacker's port, and the attacker forwards them on to R1 — reading or modifying everything while the victim notices nothing. If the attacker drops the traffic instead, the result is a denial of service. The switch cannot help without extra intelligence, because every frame involved is perfectly valid at Layer 2. Port security does not stop it either, since the attacker uses only its own MAC address. What is needed is a switch that knows which IP address really belongs to which MAC on which port — exactly the information in the DHCP snooping binding table. That is the idea behind **Dynamic ARP Inspection**, covered next.",
  },
  {
    kind: 'bullets',
    title: 'How Dynamic ARP Inspection decides',
    bullets: [
      'Enabled per VLAN; inspects ARP on **untrusted** ports only',
      'Sender MAC + IP must match a **DHCP snooping binding**',
      '**ARP ACLs** (static-IP hosts) are checked first',
      'Invalid ARP: **dropped and logged**',
      'Untrusted limit **15 pps** by default → err-disabled if exceeded',
      'Optional checks: `validate src-mac`, `dst-mac`, `ip`',
    ],
    diagram: {
      type: 'flow',
      width: 8,
      height: 5,
      nodes: [
        { id: 'n1', label: 'ARP on untrusted port', shape: 'pill', x: 1.8, y: 0.8 },
        { id: 'n2', label: 'ARP ACL permits?', shape: 'diamond', x: 1.8, y: 2.5 },
        { id: 'n3', label: 'Binding matches?', sub: 'DHCP snooping table', shape: 'diamond', x: 1.8, y: 4.2 },
        { id: 'n4', label: 'Forward', shape: 'round', tone: 'good', x: 6, y: 2.5 },
        { id: 'n5', label: 'Drop + log', shape: 'round', tone: 'bad', x: 6, y: 4.2 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n4', label: 'permit' },
        { from: 'n2', to: 'n3', label: 'no match' },
        { from: 'n3', to: 'n4', label: 'yes' },
        { from: 'n3', to: 'n5', label: 'no' },
      ],
    },
    notes:
      "Dynamic ARP Inspection intercepts ARP requests and replies arriving on **untrusted** ports in the VLANs where it is enabled and forwards only those whose sender MAC and sender IP form a valid pair. The switch checks user-configured **ARP ACLs** first — they are the way to allow hosts with static IP addresses, which never appear in the DHCP snooping table. If no ACL entry matches, the switch looks for a matching **DHCP snooping binding** for that port and VLAN. If neither validates the packet, it is dropped and logged; an explicit deny in an ARP ACL drops the packet even when a binding exists. Trusted ports — uplinks to other switches and routers — are not inspected. DAI also rate-limits ARP on untrusted ports to **15 packets per second** by default, and a port that exceeds it is err-disabled with the cause `arp-inspection`. Three optional checks add depth through `ip arp inspection validate`: `src-mac` compares the Ethernet source MAC with the sender MAC inside the ARP body, `dst-mac` compares the Ethernet destination MAC with the target MAC in replies, and `ip` rejects invalid addresses such as 0.0.0.0, 255.255.255.255 and multicast. Each validate command replaces the previous one, so list every check in a single command.",
  },
  {
    kind: 'cli',
    title: 'Configuring and verifying DAI',
    code: `SW1(config)# ip arp inspection vlan 10
SW1(config)# ip arp inspection validate src-mac dst-mac ip
SW1(config)# arp access-list STATIC-HOSTS
SW1(config-arp-nacl)# permit ip host 10.1.10.5 mac host 0050.7966.6810
SW1(config-arp-nacl)# exit
SW1(config)# ip arp inspection filter STATIC-HOSTS vlan 10
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# ip arp inspection trust
SW1(config-if)# end
SW1# show ip arp inspection interfaces

 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
 Gi0/1            Trusted               None               N/A
 Fa0/1            Untrusted               15                 1
 Fa0/2            Untrusted               15                 1
 Fa0/3            Untrusted               15                 1
%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Res) on Fa0/3, vlan 10.([0050.7966.6899/10.1.10.1/0050.7966.6801/10.1.10.21/09:14:22 UTC Sat Sep 26 2026])`,
    highlight: ['ip arp inspection vlan 10', 'ip arp inspection filter STATIC-HOSTS vlan 10', 'ip arp inspection trust', 'DHCP_SNOOPING_DENY'],
    caption: 'Log fields: sender MAC / sender IP / target MAC / target IP — Fa0/3 claimed the gateway address.',
    notes:
      "This configuration protects VLAN 10 on SW1, which already runs DHCP snooping for that VLAN. `ip arp inspection vlan 10` enables DAI; from now on every ARP message arriving on an untrusted port in VLAN 10 must match a binding or an ARP ACL. `validate src-mac dst-mac ip` adds all three optional checks in one line. The file server at 10.1.10.5 has a static IP address, so it has no DHCP snooping binding; the ARP ACL `STATIC-HOSTS` pairs its IP with its MAC, and `ip arp inspection filter STATIC-HOSTS vlan 10` puts that ACL into service. Forgetting this step is the classic DAI outage: the moment DAI is enabled, statically addressed hosts can no longer take part in ARP. Gi0/1, the uplink toward R1, is trusted with `ip arp inspection trust` — DAI trust is a **separate** command from DHCP snooping trust, and both are normally set on the same uplinks. `show ip arp inspection interfaces` confirms the trust states and the default 15 pps limit on access ports. The log line shows DAI at work: an ARP reply on Fa0/3 claimed that 10.1.10.1 belongs to MAC 0050.7966.6899; no binding supports that claim, so the reply was dropped.",
  },
  {
    kind: 'cli',
    title: 'Storm control (v2.0 topic)',
    code: `SW1(config)# interface FastEthernet0/5
SW1(config-if)# storm-control broadcast level 20.00 10.00
SW1(config-if)# storm-control action trap
SW1(config-if)# end
SW1# show storm-control FastEthernet0/5 broadcast
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  ----------
Fa0/5      Forwarding          20.00%       10.00%        0.47%
%STORM_CONTROL-3-FILTERED: A Broadcast storm detected on Fa0/5. A packet filter action has been applied on the interface.`,
    highlight: ['storm-control broadcast level 20.00 10.00', 'storm-control action trap', 'Forwarding'],
    caption: 'Rising threshold 20%, falling threshold 10%; default action filters, `shutdown` err-disables.',
    notes:
      "**Storm control** — explicitly listed in the v2.0 blueprint, so treat it as a v2.0 topic — protects a VLAN from floods of broadcast, multicast or unknown-unicast traffic, whether caused by a Layer 2 loop, a failing NIC or an attacker. For each traffic type you set a **rising threshold** as a percentage of the interface bandwidth (or an absolute rate with `level bps` or `level pps`) and optionally a **falling threshold**; without one, the falling threshold equals the rising threshold. The switch measures the traffic every second. When broadcasts on Fa0/5 exceed 20% here, the port blocks broadcast traffic until the level drops below 10%, while other traffic keeps flowing. That filtering is the **default action**. `storm-control action trap` additionally sends an SNMP trap, and `storm-control action shutdown` err-disables the port instead (cause `storm-control`), which then needs the usual recovery. `show storm-control FastEthernet0/5 broadcast` shows the filter state — `Forwarding` or `Blocking` — the upper and lower thresholds and the current level. A syslog message such as `%STORM_CONTROL-3-FILTERED` reports a storm. On the exam, expect to identify the command, what its two numbers mean, and which action err-disables the port.",
  },
  {
    kind: 'cli',
    title: 'IPv6 RA guard (v2.0 topic)',
    code: `SW1(config)# ipv6 nd raguard policy HOST-PORTS
SW1(config-nd-raguard)# device-role host
SW1(config-nd-raguard)# exit
SW1(config)# ipv6 nd raguard policy ROUTER-PORT
SW1(config-nd-raguard)# device-role router
SW1(config-nd-raguard)# exit
SW1(config)# interface range FastEthernet0/1 - 24
SW1(config-if-range)# ipv6 nd raguard attach-policy HOST-PORTS
SW1(config-if-range)# exit
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# ipv6 nd raguard attach-policy ROUTER-PORT`,
    highlight: ['device-role host', 'ipv6 nd raguard attach-policy HOST-PORTS'],
    bullets: [
      'Rogue RA = fake default router or prefix for SLAAC hosts',
      'RA guard drops RAs (ICMPv6 type 134) entering **host** ports',
      'Port toward the real router: `device-role router`',
    ],
    notes:
      "IPv6 hosts learn their default gateway — and, with SLAAC, their prefix — from **Router Advertisements**, ICMPv6 type 134. Any device can send an RA, so a rogue host can advertise itself as the default router and pull all off-link traffic through itself, or advertise a bogus prefix and break addressing for the whole VLAN. Even an innocent misconfigured device, such as a home router plugged in the wrong way round, can do it. **IPv6 RA guard**, named in the v2.0 blueprint, is the switch feature that stops this. You define a policy that describes what is attached to a port: `device-role host` means no RA should ever arrive there, so the switch drops RAs received on those ports, while `device-role router` allows them on the port facing the real router. Attach the policies to interfaces with `ipv6 nd raguard attach-policy`. Hosts still receive the legitimate router's RAs, because RA guard only filters what **enters** a host port. RA guard belongs to the family of IPv6 first-hop security features, alongside DHCPv6 guard, which blocks rogue DHCPv6 servers. On the exam, match rogue router advertisements with RA guard, just as a rogue DHCP server matches DHCP snooping and ARP spoofing matches DAI.",
  },
  {
    kind: 'diagram',
    title: 'VLAN hopping 1: switch spoofing',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'Attacker', sub: 'speaks DTP', x: 1.2, y: 2.5, tone: 'bad' },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 4.6, y: 2.5 },
        { id: 'v10', icon: 'pc', label: 'VLAN 10 host', x: 8.4, y: 0.9 },
        { id: 'v20', icon: 'server', label: 'VLAN 20 server', x: 8.4, y: 2.5 },
        { id: 'v30', icon: 'pc', label: 'VLAN 30 host', x: 8.4, y: 4.1 },
      ],
      links: [
        { from: 'att', to: 'sw1', toLabel: 'Fa0/3', label: 'DTP → trunk', style: 'dashed', tone: 'bad' },
        { from: 'sw1', to: 'v10', label: 'VLAN 10' },
        { from: 'sw1', to: 'v20', label: 'VLAN 20' },
        { from: 'sw1', to: 'v30', label: 'VLAN 30' },
      ],
    },
    bullets: [
      'Port left in **dynamic auto/desirable** answers DTP',
      'Attacker negotiates a **trunk** → reaches every allowed VLAN',
      'Fix: `switchport mode access` + `switchport nonegotiate`',
    ],
    notes:
      "In **switch spoofing**, the attacker's device pretends to be a switch. Many access ports are left in their default DTP mode — `dynamic auto` on a Catalyst 2960, for example — which means they become a trunk if the other side asks. The attacker sends DTP frames requesting a trunk; the port agrees, and the attacker now owns an 802.1Q trunk. By tagging frames with any VLAN ID allowed on the trunk (all VLANs by default), it can send to and receive from every VLAN on the switch, bypassing the router or firewall that should control traffic between VLANs. The fix is to take DTP out of the picture. Configure host-facing ports statically with `switchport mode access`, so they never become trunks, and add `switchport nonegotiate` so that no DTP frames are exchanged at all. On links that really are trunks, use `switchport mode trunk` with `switchport nonegotiate` and restrict the allowed VLANs. Also shut down unused ports and move them to an unused VLAN, so a free wall jack is not an easy way in. For verification, `show interfaces switchport` displays the administrative and operational modes and the Negotiation of Trunking setting.",
  },
  {
    kind: 'diagram',
    title: 'VLAN hopping 2: double tagging',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'att', icon: 'attacker', label: 'Attacker', sub: 'access VLAN 1', x: 1, y: 2.5, tone: 'bad' },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 3.8, y: 2.5 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 6.6, y: 2.5 },
        { id: 'vic', icon: 'server', label: 'Victim', sub: 'VLAN 20', x: 9.2, y: 2.5 },
      ],
      links: [
        { from: 'att', to: 'sw1', label: 'tags 1 + 20', arrow: 'forward', tone: 'bad' },
        { from: 'sw1', to: 'sw2', label: 'native VLAN 1', fromLabel: 'Gi0/1', toLabel: 'Gi0/1', arrow: 'forward' },
        { from: 'sw2', to: 'vic', label: 'tag 20', arrow: 'forward', tone: 'bad' },
      ],
      annotations: [
        { x: 5.2, y: 1, text: 'SW1 sends native VLAN 1 untagged: the outer tag is removed', tone: 'bad' },
        { x: 5.2, y: 4.2, text: 'One-way only: replies never return to the attacker', tone: 'muted' },
      ],
    },
    bullets: [
      "Works only if the attacker's VLAN = the trunk's **native VLAN**",
      'Fix: an **unused native VLAN** (e.g. 999) or `vlan dot1q tag native`',
    ],
    notes:
      "**Double tagging** abuses the native VLAN. The attacker sits on an access port in VLAN 1, which is also the native VLAN of the trunk between SW1 and SW2 — the default situation. It crafts a frame with **two 802.1Q tags**: the outer tag says VLAN 1, the inner tag says VLAN 20, the victim's VLAN. SW1 handles the frame in VLAN 1 and forwards it out the trunk. Because VLAN 1 is the native VLAN, SW1 sends it **without a tag** — removing the outer tag — so the frame crosses the trunk carrying only the inner tag. SW2 reads VLAN 20 and delivers the frame to the victim. The attack is **one-way**: the victim's replies travel back normally in VLAN 20 and never reach the attacker, so it suits flooding or one-shot attacks rather than conversations. It works only when the attacker's access VLAN equals the trunk's native VLAN. The mitigation is therefore to set the native VLAN of every trunk to an **unused VLAN** that no access port belongs to — for example 999, identical on both ends — or to tag native VLAN traffic with `vlan dot1q tag native`, and never to put users in VLAN 1.",
  },
  {
    kind: 'cli',
    title: 'Hardening ports against VLAN hopping',
    code: `SW1(config)# vlan 998
SW1(config-vlan)# name PARKING
SW1(config-vlan)# vlan 999
SW1(config-vlan)# name NATIVE-UNUSED
SW1(config-vlan)# exit
SW1(config)# interface range FastEthernet0/1 - 20
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport nonegotiate
SW1(config-if-range)# exit
SW1(config)# interface range FastEthernet0/21 - 24
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 998
SW1(config-if-range)# shutdown
SW1(config-if-range)# exit
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
SW1(config-if)# switchport trunk native vlan 999
SW1(config-if)# end
SW1# show interfaces GigabitEthernet0/1 switchport | include Negotiation|Native Mode
Negotiation of Trunking: Off
Trunking Native Mode VLAN: 999 (NATIVE-UNUSED)`,
    highlight: ['switchport nonegotiate', 'switchport trunk native vlan 999', 'Negotiation of Trunking: Off'],
    caption: 'No DTP anywhere, unused ports parked and shut, native VLAN moved to an unused VLAN.',
    notes:
      "Here are the anti-hopping settings in one place. VLAN 999 exists only to serve as the native VLAN, and VLAN 998 is a parking VLAN for unused ports; neither has any users. Ports Fa0/1–20 face users, so they are static access ports with DTP disabled by `switchport nonegotiate` — they never become trunks, so switch spoofing fails. Unused ports Fa0/21–24 are parked in VLAN 998 and shut down, so a free wall jack gives an intruder nothing. The uplink Gi0/1 is a static trunk that does not negotiate, and its native VLAN is 999, which no access port uses, so double tagging fails. Because DTP is off, the other end must also be configured as a static trunk. The native VLAN must match on both ends — SW2 also needs `switchport trunk native vlan 999`, otherwise CDP reports a native VLAN mismatch and untagged traffic leaks between the two VLANs. The filtered `show interfaces switchport` output confirms both changes: Negotiation of Trunking is Off and the native VLAN is 999. Combined with port security, DHCP snooping and DAI on the access ports, this is the standard access-layer hardening template that exam scenarios describe.",
  },
  {
    kind: 'table',
    title: 'Attacks and their mitigations',
    columns: ['Attack', 'Abuses', 'Mitigation', 'Key command'],
    rows: [
      ['MAC flooding', 'Automatic MAC learning', 'Port security', '`switchport port-security maximum`'],
      ['DHCP starvation', 'Finite address pool', 'Port security, snooping rate limit', '`ip dhcp snooping limit rate`'],
      ['Rogue DHCP server', 'Clients trust any OFFER', 'DHCP snooping', '`ip dhcp snooping trust` (uplinks only)'],
      ['ARP spoofing', 'Unauthenticated ARP', 'Dynamic ARP Inspection', '`ip arp inspection vlan`'],
      ['Switch spoofing', 'DTP negotiation', 'Static access ports, DTP off', '`switchport nonegotiate`'],
      ['Double tagging', 'Untagged native VLAN', 'Unused native VLAN', '`switchport trunk native vlan 999`'],
      ['Broadcast storm (v2.0)', 'Flooding of broadcasts', 'Storm control', '`storm-control broadcast level`'],
      ['Rogue RA (v2.0)', 'Hosts trust any RA', 'RA guard', '`ipv6 nd raguard attach-policy`'],
    ],
    notes:
      "Use this table as your final review: every Layer 2 attack pairs with a specific defense, and exam questions often simply describe an attack and ask for the feature that stops it. The Abuses column explains why each defense works. MAC flooding abuses automatic learning, so limiting the addresses per port with **port security** stops it. DHCP starvation empties the pool with fake requests; port security limits the MACs one port can use, and the DHCP snooping **rate limit** caps the request rate. Rogue DHCP servers rely on clients trusting any offer, so **DHCP snooping** discards server messages on untrusted ports. ARP spoofing relies on unauthenticated ARP, so **DAI** validates ARP against the snooping bindings. Switch spoofing needs DTP and double tagging needs the attacker to share the native VLAN, so static access ports without DTP and an unused native VLAN stop them. The last two rows are v2.0 topics: **storm control** limits floods and **RA guard** blocks rogue IPv6 router advertisements. Note the dependency: DAI relies on DHCP snooping bindings, so if DAI is enabled without snooping, DHCP clients' ARP messages are dropped too.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: Layer 2 security',
    body: 'Know the ==violation modes== cold: protect = silent drop, restrict = drop + log + counter, shutdown (default) = err-disable.',
    bullets: [
      'Port security needs `switchport mode access` (or trunk) first',
      'Nothing is enforced without the bare `switchport port-security`',
      'Sticky MACs go to the running-config — save them',
      'DHCP snooping needs the global **and** the VLAN command; trust uplinks only',
      'Clients fail right after enabling snooping? Think **option 82**',
      'DAI needs bindings or ARP ACLs; 15 pps default on untrusted ports',
      'Double tagging: attacker VLAN = native VLAN; one-way',
    ],
    notes:
      "These are the details that turn Layer 2 security questions into lost points. Violation modes come first: all three drop the offending frames, but only restrict and shutdown log and count, and only shutdown takes the port down — and shutdown is the default. Port security refuses to run on a dynamic DTP port, and nothing is enforced until the bare `switchport port-security` command is present, however many other port-security lines the exhibit shows. Sticky addresses are written to the running-config, not the startup-config. DHCP snooping needs both the global command and the VLAN command, and only uplinks toward legitimate servers should be trusted: trusting an access port defeats the purpose, while forgetting to trust the uplink blocks every OFFER. If clients fail right after snooping is enabled although the uplink is trusted, the answer is usually option 82 and `no ip dhcp snooping information option`. DAI relies on the DHCP snooping binding table, so statically addressed hosts need ARP ACLs, and its default limit is 15 ARP packets per second on untrusted ports. For VLAN hopping, remember that double tagging works only when the attacker's VLAN equals the native VLAN, and that it is one-way.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Treat access ports as untrusted; trust only uplinks',
      'Port security: max 1 and shutdown by default; sticky, static, dynamic MACs',
      'Recover err-disabled ports: shut/no shut or `errdisable recovery`',
      'DHCP snooping blocks rogue servers and builds the binding table',
      'DAI validates ARP against bindings or ARP ACLs',
      'v2.0: storm control and RA guard',
      'VLAN hopping: disable DTP, move the native VLAN',
    ],
    notes:
      "Let's recap. Layer 2 attacks exploit the trust a switch places in whatever arrives on its ports, so the defenses treat access ports as untrusted and trust only the uplinks toward real infrastructure. **Port security** limits the source MACs on a port — one by default — using static, dynamic or sticky secure addresses, and reacts to violations by protecting (silent drop), restricting (drop, log, count) or shutting down the port, which is the default. Err-disabled ports are recovered with `shutdown` and `no shutdown`, or automatically with `errdisable recovery cause psecure-violation` after 300 seconds. **DHCP snooping**, enabled globally and per VLAN, drops server messages on untrusted ports, rate-limits requests and builds the binding table; remember the option 82 gotcha with IOS DHCP servers. **DAI** uses that table, plus ARP ACLs for static hosts, to drop forged ARP messages, and limits untrusted ports to 15 ARP packets per second. For v2.0, **storm control** filters or err-disables on broadcast floods and **RA guard** drops rogue IPv6 router advertisements on host ports. Finally, stop **VLAN hopping** with static access ports, DTP disabled and an unused native VLAN on every trunk.",
  },
];
