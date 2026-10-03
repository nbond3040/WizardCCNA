import type { Flashcard, Question } from '../../types';

export const dhcpFlashcards: Flashcard[] = [
  { id: 'f1', front: 'DHCP transport and ports', back: 'UDP — server listens on **67**, client on **68**.' },
  { id: 'f2', front: 'DORA', back: 'Discover → Offer → Request → Acknowledgment.' },
  { id: 'f3', front: 'Addressing of a DHCPDISCOVER', back: 'IP `0.0.0.0`:68 → `255.255.255.255`:67; destination MAC `FFFF.FFFF.FFFF` (broadcast).' },
  { id: 'f4', front: 'Why is the initial DHCPREQUEST broadcast?', back: 'So every server learns which offer was accepted (server identifier option); the other servers withdraw their offers.' },
  { id: 'f5', front: 'How are DHCPOFFER and DHCPACK delivered?', back: 'Addressed to the client’s MAC (unicast frame) — or broadcast if the client set the **broadcast flag**.' },
  { id: 'f6', front: 'T1 (renewal time)', back: '**50%** of the lease: the client unicasts a DHCPREQUEST to the server that granted the lease.' },
  { id: 'f7', front: 'T2 (rebinding time)', back: '**87.5%** of the lease: the client broadcasts a DHCPREQUEST so any server can extend the lease.' },
  { id: 'f8', front: 'Lease expires with no renewal', back: 'The client must stop using the address and start over with a DHCPDISCOVER.' },
  { id: 'f9', front: 'DHCPDECLINE', back: 'Client → server: the offered address is already in use (detected by the client’s ARP check).' },
  { id: 'f10', front: 'DHCPNAK', back: 'Server → client: the requested address/lease is refused (e.g. the client moved subnets); the client restarts with Discover.' },
  { id: 'f11', front: 'DHCPRELEASE', back: 'Client → server: returns the lease early, e.g. `ipconfig /release`.' },
  { id: 'f12', front: 'DHCPINFORM', back: 'A client with a manually set IP asks the server only for options such as DNS servers.' },
  { id: 'f13', front: '`ip dhcp excluded-address 192.168.10.1 192.168.10.10`', back: 'Global configuration command: the server never leases addresses in that range (gateway, static hosts).' },
  { id: 'f14', front: 'Common subcommands in `ip dhcp pool` mode', back: '`network`, `default-router`, `dns-server`, `domain-name`, `lease`.' },
  { id: 'f15', front: 'IOS default DHCP lease and the `lease` syntax', back: 'Default **1 day**. `lease days [hours [minutes]]` — e.g. `lease 7`, `lease 0 8` (8 hours), `lease infinite`.' },
  { id: 'f16', front: 'How does the IOS DHCP server choose a pool?', back: 'The pool whose `network` contains the receiving interface’s IP (local clients) or the **giaddr** (relayed clients). No match → no Offer.' },
  { id: 'f17', front: '`ip helper-address 10.0.12.1`', back: 'Interface command on the **client-facing** interface: relays DHCP (and other default UDP) broadcasts as unicasts to 10.0.12.1.' },
  { id: 'f18', front: 'giaddr', back: 'Gateway IP address field. The relay writes its client-facing interface IP; the server uses it to pick the pool and to send its reply.' },
  { id: 'f19', front: 'UDP services forwarded by `ip helper-address` by default', back: 'BOOTP/DHCP 67/68, TFTP 69, DNS 53, Time 37, NetBIOS 137/138, TACACS 49, IEN-116 42.' },
  { id: 'f20', front: '`ip address dhcp`', back: 'Interface command making a router (or switch SVI) a DHCP client — common on ISP-facing interfaces.' },
  { id: 'f21', front: 'AD of a default route learned through `ip address dhcp`', back: '**254** — shown as `S* 0.0.0.0/0 [254/0]`, so a manual static default (AD 1) wins.' },
  { id: 'f22', front: '`show ip dhcp binding`', back: 'Lists leases: IP address, client ID/hardware address, lease expiration and type (Automatic or Manual).' },
  { id: 'f23', front: '`show ip dhcp pool`', back: 'Per pool: total and leased addresses, current index (next address to try) and address range.' },
  { id: 'f24', front: '`show ip dhcp conflict`', back: 'Addresses found in use by ping or gratuitous ARP and withheld from the pool. Clear with `clear ip dhcp conflict *` after fixing the cause.' },
  { id: 'f25', front: 'IOS DHCP server ping check defaults', back: 'Before offering an address it sends **2** pings with a **500 ms** timeout; a reply marks a conflict.' },
  { id: 'f26', front: 'APIPA address range and meaning', back: '`169.254.0.0/16`, self-assigned when no DHCP reply arrives; no default gateway, local-segment communication only.' },
  { id: 'f27', front: '`service dhcp`', back: 'Enabled by default; `no service dhcp` disables both the IOS DHCP server and the relay agent.' },
  { id: 'f28', front: 'DHCP snooping and a legitimate server’s Offers', back: 'Offers/Acks arriving on **untrusted** ports are dropped; configure `ip dhcp snooping trust` on the uplink toward the real server.' },
  { id: 'f29', front: 'DHCP option numbers 3, 6, 15 and 51', back: '3 = default router, 6 = DNS servers, 15 = domain name, 51 = lease time.' },
];

export const dhcpQuiz: Question[] = [
  {
    id: 'q1',
    type: 'order',
    stem: 'Put the messages of a DHCP lease exchange in order.',
    items: ['DHCPDISCOVER', 'DHCPOFFER', 'DHCPREQUEST', 'DHCPACK'],
    difficulty: 1,
    explanation:
      'The client **Discovers** servers, a server **Offers** an address, the client **Requests** the offered address, and the server **Acknowledges** the lease — DORA.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which UDP port does a DHCP server listen on?',
    options: ['67', '68', '53', '69'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Servers listen on **UDP 67** and clients on UDP 68 (both inherited from BOOTP). Port 53 is DNS and 69 is TFTP.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'In the initial DHCP exchange on a single subnet, which two messages does the client send as broadcasts? (Choose two.)',
    options: ['DHCPDISCOVER', 'DHCPOFFER', 'DHCPREQUEST', 'DHCPACK', 'DHCPNAK'],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'The client broadcasts both **Discover** (it knows no server) and **Request** (so all servers learn which offer it accepted). Offer, Ack and NAK are server messages, normally addressed to the client unless it set the broadcast flag.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'The DHCP server is on another subnet. On which R2 interface should `ip helper-address` be configured?',
    options: [
      'The interface that receives the clients’ broadcasts',
      'The interface that faces the DHCP server',
      'Every interface on R2',
      'The loopback interface',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The relay must see the broadcast, so the helper goes on the **client-facing** interface (or SVI). Broadcasts never arrive on the server-facing interface, and a loopback receives no client traffic at all.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'Which interface command makes a router interface obtain its IPv4 address from the ISP’s DHCP server?',
    answers: ['ip address dhcp'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ip address dhcp` turns the interface into a DHCP client; `show ip interface brief` then shows DHCP in the Method column, and a default route with AD 254 is installed if the server supplies a gateway.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A Windows PC shows IPv4 address 169.254.83.107 with no default gateway. What does this indicate?',
    options: [
      'The PC did not receive a reply from any DHCP server',
      'The DHCP server leased an address from the wrong pool',
      'The DNS server is unreachable',
      'The PC received a static address from the DHCP server',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '169.254.0.0/16 is the **APIPA** range a client assigns itself when no DHCP reply arrives. A wrong pool would still give a non-APIPA address, DNS problems do not change the IP address, and DHCP leases never come from 169.254.0.0/16.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'At what point in the lease does a DHCP client first try to renew by unicasting a DHCPREQUEST to its server?',
    options: ['50% (T1)', '75%', '87.5% (T2)', '100%'],
    answer: 0,
    difficulty: 2,
    explanation:
      'At **T1 = 50%** the client unicasts a renewal to the leasing server. At T2 = 87.5% it broadcasts a rebind request to any server; at 100% the lease is gone. 75% is not a DHCP timer.',
  },
];
