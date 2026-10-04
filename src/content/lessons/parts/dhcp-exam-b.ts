import type { Question } from '../../types';

export const dhcpExamB: Question[] = [
  {
    id: 'e12',
    type: 'categorize',
    stem: 'Classify each DHCP message by how it is addressed at the IP layer. Assume clients do not set the broadcast flag.',
    categories: ['Broadcast', 'Unicast'],
    items: [
      { text: 'Initial DHCPDISCOVER from the client', category: 0 },
      { text: 'DHCPREQUEST during the initial exchange', category: 0 },
      { text: 'DHCPREQUEST at T2 (rebinding)', category: 0 },
      { text: 'DHCPREQUEST at T1 (renewing)', category: 1 },
      { text: 'DHCPDISCOVER forwarded by a relay agent to the server', category: 1 },
      { text: 'DHCPOFFER sent by the server to the relay agent', category: 1 },
    ],
    difficulty: 3,
    explanation:
      'Without an address or a known server, the client **broadcasts** its Discover and its initial Request; at T2 it broadcasts again so that any server can rebind the lease. At T1 it knows its leasing server and renews with a **unicast**. Between the relay agent and the server everything is **routed unicast**: the relay sends the Discover to the helper address, and the server replies to the giaddr.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'In addition to DHCP/BOOTP, which two UDP services does `ip helper-address` forward by default? (Choose two.)',
    options: ['NTP (UDP 123)', 'TFTP (UDP 69)', 'SNMP (UDP 161)', 'DNS (UDP 53)', 'Syslog (UDP 514)'],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'The default list covers BOOTP/DHCP (67/68), **TFTP (69)**, **DNS (53)**, Time (37), NetBIOS name and datagram (137/138), TACACS (49) and IEN-116 (42). NTP, SNMP and syslog are not included; they could be added with `ip forward-protocol udp`, but they are not forwarded by default.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. R3 has two Internet links. To make the second ISP the primary path, an engineer adds `ip route 0.0.0.0 0.0.0.0 203.0.113.1`. What does the routing table contain afterward?',
    exhibit: {
      kind: 'cli',
      text: `R3# show ip interface brief | include 0/0/
GigabitEthernet0/0/0   10.3.3.1        YES NVRAM  up                    up
GigabitEthernet0/0/1   198.51.100.2    YES DHCP   up                    up
GigabitEthernet0/0/2   203.0.113.2     YES NVRAM  up                    up
R3# show ip route | include 0.0.0.0
Gateway of last resort is 198.51.100.1 to network 0.0.0.0
S*    0.0.0.0/0 [254/0] via 198.51.100.1`,
    },
    options: [
      'Both default routes, load-balanced equally',
      'Only the DHCP-learned default route, because it was installed first',
      'Only the new static default route via 203.0.113.1, because its AD of 1 beats the DHCP-learned AD of 254',
      'Both default routes, with the DHCP-learned route preferred because it is more specific',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The default route installed through `ip address dhcp` has an administrative distance of **254**; a manually configured static route has AD **1**. For the same prefix, 0.0.0.0/0, the lower AD wins, so the new route replaces the DHCP-learned route in the routing table, and the DHCP route would return only if the new one were removed. Load balancing needs equal AD and metric, installation order does not matter, and both routes have exactly the same prefix length.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. PCs in VLAN 10 on SW1 get their addresses from router R1, which connects to SW1 uplink Gi0/1. After DHCP snooping was enabled, the PCs receive 169.254.x.x addresses. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config | include dhcp
ip dhcp snooping vlan 10
no ip dhcp snooping information option
ip dhcp snooping
SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
Total number of bindings: 0`,
    },
    options: [
      'Option 82 insertion is enabled, so R1 drops the requests',
      'Gi0/1 is untrusted, so SW1 drops the DHCPOFFER and DHCPACK messages from R1',
      'The access ports of the PCs must be trusted so that their DHCPDISCOVER messages are accepted',
      'DHCP snooping must also be enabled on R1',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "No interface has `ip dhcp snooping trust`, so every port — including the uplink Gi0/1 toward R1 — is untrusted, and SW1 drops the server messages (OFFER and ACK) that arrive there. With no ACKs, no bindings are created and the PCs fall back to APIPA. Option 82 is not the issue, because insertion is disabled. Client ports must stay untrusted — DISCOVER and REQUEST are allowed on untrusted ports anyway — and DHCP snooping is a switch feature that R1 does not need.",
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Which global configuration command prevents an IOS DHCP server from leasing the addresses 10.1.1.1 through 10.1.1.20?',
    answers: ['ip dhcp excluded-address 10.1.1.1 10.1.1.20'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip dhcp excluded-address 10.1.1.1 10.1.1.20` takes the first and last address of the range and is entered in **global** configuration mode, not inside the pool. A single address can be excluded by giving only one address.',
  },
  {
    id: 'e17',
    type: 'input',
    stem: 'Which DHCP pool configuration command sets the lease duration to 12 hours?',
    answers: ['lease 0 12', 'lease 0 12 0'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      'The syntax is `lease days [hours [minutes]]`, so 12 hours is `lease 0 12`. `lease 12` would mean 12 days. Without a `lease` command the IOS default is one day.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two statements about the giaddr field are true? (Choose two.)',
    options: [
      'The client sets it to its default gateway address so replies can find it',
      'The relay agent sets it to the address of its client-facing interface',
      'It stays 0.0.0.0 when a relay agent forwards the client’s message',
      'The server uses it to select the pool that supplies the address',
      'The server sets it to its own IP address in the DHCPOFFER message',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'The **relay agent** writes the IP address of its client-facing interface into giaddr. The server uses that value to **choose the pool** whose network contains it and as the destination of its reply. Clients leave giaddr at 0.0.0.0 — they do not know their gateway yet — so a zero giaddr means the message was not relayed, and servers do not put their own address in giaddr.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements about the DHCPREQUEST message are true? (Choose two.)',
    options: [
      'It is sent by the server to confirm the lease to the client',
      'In the initial exchange, the client sends it as a broadcast',
      'It is sent from UDP source port 67 to UDP destination port 68',
      'It identifies the server whose offer the client accepted',
      'It is sent only after the lease has fully expired on the client',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      "The initial Request is **broadcast** so that every server that made an offer sees which one was accepted — the Request carries the chosen **server identifier**, and the other servers withdraw their offers. The server's confirmation is the DHCPACK, clients send from UDP 68, and Requests are also used at T1 and T2, long before the lease expires.",
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. What is the most likely cause of these entries, and what should the engineer do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
192.168.10.37     Ping               Sep 26 2026 08:41 AM
192.168.10.38     Gratuitous ARP     Sep 26 2026 08:55 AM`,
    },
    options: [
      'Hosts with static addresses in the pool range; exclude or readdress them, then clear the conflicts',
      'The pool is exhausted; enlarge the pool network and shorten the lease to recycle addresses',
      'The relay agent duplicates requests; remove the second `ip helper-address` from the interface',
      'The server pinged its own interface; disable the ping check with `ip dhcp ping packets 0`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "A conflict means that an address the server was about to lease was already in use — detected by the server's ping or by a client's gratuitous ARP followed by a Decline. The usual cause is a device with a **static address inside the pool range**. Exclude those addresses (or move the devices), then clear the entries so the server stops withholding them. An exhausted pool produces no conflicts, duplicate relayed requests do not make an address answer, and disabling the ping check would only hide the problem and allow duplicate addresses.",
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. The DHCP server has pools for VLAN 10 and VLAN 20. PC-A receives an address, but PC-B receives a 169.254.x.x address. Which change fixes the problem?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'srv', icon: 'server', label: 'DHCP server', sub: '10.10.0.5 · VLAN 10', x: 1.3, y: 1.2 },
          { id: 'pca', icon: 'pc', label: 'PC-A', sub: 'VLAN 10', x: 1.3, y: 3.8 },
          { id: 'dsw', icon: 'l3switch', label: 'DSW1', sub: 'Vlan10 10.10.0.1 · Vlan20 10.20.0.1', x: 5, y: 2.5 },
          { id: 'pcb', icon: 'pc', label: 'PC-B', sub: 'VLAN 20 · 169.254.x.x', x: 8.7, y: 2.5, tone: 'bad' },
        ],
        links: [
          { from: 'srv', to: 'dsw', label: 'VLAN 10' },
          { from: 'pca', to: 'dsw', label: 'VLAN 10' },
          { from: 'dsw', to: 'pcb', label: 'VLAN 20' },
        ],
        annotations: [{ x: 5, y: 4.5, text: 'interface Vlan10: ip helper-address 10.10.0.5', tone: 'muted' }],
      },
    },
    options: [
      'Configure `ip helper-address 10.20.0.1` under interface Vlan10',
      'Configure `ip address dhcp` under interface Vlan20',
      'Move the DHCP server into VLAN 20',
      'Configure `ip helper-address 10.10.0.5` under interface Vlan20',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      "PC-A shares VLAN 10 with the server, so its broadcasts reach the server directly — the helper under Vlan10 is not even needed. PC-B's broadcasts arrive on the **Vlan20** SVI, which has no helper, and DSW1 does not route broadcasts between VLANs. `ip helper-address 10.10.0.5` under interface Vlan20 relays them with giaddr 10.20.0.1, which matches the server's VLAN 20 pool. A helper pointing at the switch's own SVI address is useless, `ip address dhcp` would turn the SVI into a DHCP client, and relocating the server only shifts the problem to the other VLAN.",
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Which DHCP message does a server send to refuse a client request — for example, when a client that moved to another subnet asks to keep its old address?',
    options: ['DHCPDECLINE', 'DHCPNAK', 'DHCPRELEASE', 'DHCPINFORM'],
    answer: 1,
    difficulty: 1,
    explanation:
      "**DHCPNAK** is the server's refusal; the client must start again with a Discover. DHCPDECLINE is sent by a client that found its offered address already in use, DHCPRELEASE is a client returning its lease, and DHCPINFORM is a statically addressed client asking only for options.",
  },
];
