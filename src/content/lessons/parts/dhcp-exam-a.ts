import type { Question } from '../../types';

export const dhcpExamA: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which DHCP message does a client send to accept an address offered by a server?',
    options: ['DHCPREQUEST', 'DHCPACK', 'DHCPDISCOVER', 'DHCPINFORM'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The client answers an Offer with a **DHCPREQUEST** naming the chosen server. DHCPACK is the server’s confirmation, DHCPDISCOVER is the client’s first message to find servers, and DHCPINFORM is used by statically addressed hosts that only want options.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which addresses and ports does a client use in its initial DHCPDISCOVER message?',
    options: [
      'Source 0.0.0.0 UDP 68, destination 255.255.255.255 UDP 67',
      'Source 0.0.0.0 UDP 67, destination 255.255.255.255 UDP 68',
      'Source 169.254.1.1 UDP 68, destination the default gateway UDP 67',
      'Source 0.0.0.0 UDP 68, destination the subnet broadcast address UDP 67',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'With no address yet, the client sends from **0.0.0.0, UDP 68** to the limited broadcast **255.255.255.255, UDP 67**, where servers listen. The ports are never swapped, APIPA addresses are only self-assigned after DHCP fails, the client does not know its gateway yet, and it cannot compute a subnet broadcast without an address and mask.',
  },
  {
    id: 'e3',
    type: 'order',
    stem: 'A client and its DHCP server are on different subnets. Put the steps of the relayed exchange in order, up to the delivery of the offer.',
    items: [
      'The client broadcasts a DHCPDISCOVER',
      'The router receives the broadcast on the interface configured with ip helper-address',
      'The router sets giaddr and unicasts the message to the server',
      'The server selects the pool whose network contains the giaddr',
      'The server unicasts a DHCPOFFER to the giaddr address',
      'The router forwards the DHCPOFFER to the client',
    ],
    difficulty: 2,
    explanation:
      'The relay only acts on broadcasts that arrive on its helper interface. It stamps the **giaddr** with that interface’s IP, forwards a unicast to the server, and the server uses the giaddr both to choose the pool and as the destination of its reply, which the relay then delivers to the client.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts on the branch LAN connected to G0/0/0 receive 169.254.x.x addresses. R1 (10.0.12.1) has a correct pool for 192.168.20.0/24 and a route to it. What should the engineer change on R2?',
    exhibit: {
      kind: 'cli',
      text: `R2# show running-config
<output omitted>
interface GigabitEthernet0/0/0
 description Branch LAN
 ip address 192.168.20.1 255.255.255.0
!
interface GigabitEthernet0/0/1
 description WAN to R1
 ip address 10.0.12.2 255.255.255.252
 ip helper-address 10.0.12.1
!`,
    },
    options: [
      'Move `ip helper-address 10.0.12.1` from G0/0/1 to G0/0/0',
      'Change the helper address to 192.168.20.1',
      'Add `ip address dhcp` to G0/0/0',
      'Add `ip dhcp excluded-address 192.168.20.1` on R2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The helper must be on the interface where the clients’ broadcasts arrive — **G0/0/0**. On G0/0/1 it never sees them. Pointing the helper at R2’s own LAN address makes no sense, `ip address dhcp` would turn R2 into a client, and exclusions belong on the server (R1), not the relay.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. Hosts in VLAN 30 do not receive addresses. DSW1 relays their requests to the IOS DHCP server DHCP1 (10.99.1.10), which is reachable from VLAN 30. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `DSW1# show running-config interface vlan 30
Building configuration...

Current configuration : 96 bytes
!
interface Vlan30
 ip address 10.30.0.1 255.255.255.0
 ip helper-address 10.99.1.10
end

DHCP1# show running-config | section ip dhcp
ip dhcp excluded-address 10.30.0.1 10.30.0.20
ip dhcp pool VLAN30
 network 10.3.0.0 255.255.255.0
 default-router 10.30.0.1
 dns-server 10.99.1.53`,
    },
    options: [
      'The pool network 10.3.0.0/24 does not contain the giaddr 10.30.0.1',
      'The excluded range includes the default router address',
      'The helper address must be configured on the interface facing DHCP1',
      'The DNS server must be located in VLAN 30',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Relayed requests carry **giaddr 10.30.0.1**, and DHCP1 only leases from a pool whose network contains it. The pool says 10.3.0.0/24 — a typo — so no pool matches and no Offer is sent. Excluding the gateway is correct practice, the helper belongs on the client-facing SVI exactly as configured, and the DNS server can be anywhere reachable.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two commands are entered in DHCP pool configuration mode on an IOS router? (Choose two.)',
    options: [
      '`default-router 192.168.10.1`',
      '`dns-server 10.99.1.53`',
      '`ip dhcp excluded-address 192.168.10.1 192.168.10.10`',
      '`ip helper-address 10.0.12.1`',
      '`ip address dhcp`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '`default-router` and `dns-server` are pool subcommands, like `network`, `domain-name` and `lease`. `ip dhcp excluded-address` is a **global** command, and `ip helper-address` and `ip address dhcp` are interface commands.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Today is Sep 26 2026. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
192.168.10.11       0100.5056.a3b2.01       Oct 03 2026 09:14 AM    Automatic
192.168.10.12       0100.5056.a3b2.02       Oct 03 2026 09:15 AM    Automatic`,
    },
    options: [
      'The client with MAC address 0050.56a3.b202 is leasing 192.168.10.12',
      'The client with MAC address 0100.5056.a3b2 is leasing 192.168.10.12',
      '192.168.10.12 was bound manually by an administrator',
      'Both leases use the IOS default lease duration',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A Windows client ID is **01** (Ethernet) followed by the MAC, so 0100.5056.a3b2.02 is MAC **0050.56a3.b202**. Reading the first 12 hex digits as the MAC is a common mistake. Type Automatic means a normal pool lease, not a manual binding, and the expirations are seven days away, so the pool uses `lease 7` rather than the one-day default.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each DHCP message by the device that sends it.',
    categories: ['Sent by the client', 'Sent by the server'],
    items: [
      { text: 'DHCPDISCOVER', category: 0 },
      { text: 'DHCPOFFER', category: 1 },
      { text: 'DHCPREQUEST', category: 0 },
      { text: 'DHCPACK', category: 1 },
      { text: 'DHCPDECLINE', category: 0 },
      { text: 'DHCPNAK', category: 1 },
      { text: 'DHCPRELEASE', category: 0 },
      { text: 'DHCPINFORM', category: 0 },
    ],
    difficulty: 2,
    explanation:
      'Clients **discover**, **request**, **decline** an address in use, **release** a lease and **inform** (ask only for options). Servers **offer**, **acknowledge** and **NAK** (refuse) requests.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each DHCP item to its value.',
    pairs: [
      { left: 'T1 (renewal)', right: '50% of the lease' },
      { left: 'T2 (rebinding)', right: '87.5% of the lease' },
      { left: 'IOS default lease', right: '1 day' },
      { left: 'Server port', right: 'UDP 67' },
      { left: 'Client port', right: 'UDP 68' },
      { left: 'APIPA range', right: '169.254.0.0/16' },
    ],
    difficulty: 2,
    explanation:
      'Clients renew at **50%** (unicast) and rebind at **87.5%** (broadcast). IOS pools lease for **one day** unless `lease` changes it. Servers listen on UDP 67 and clients on UDP 68, and a client that gets no reply self-assigns from 169.254.0.0/16.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. `show ip dhcp binding` lists 12 active leases in VLAN 30. Those 12 users work normally, but additional users receive 169.254.x.x addresses. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section dhcp
ip dhcp excluded-address 192.168.30.1 192.168.30.50
ip dhcp pool VLAN30
 network 192.168.30.0 255.255.255.192
 default-router 192.168.30.1
 dns-server 10.99.1.53`,
    },
    options: [
      'The excluded range leaves only 12 leasable addresses in the /26 pool',
      'The default router must be excluded with a separate command',
      'The pool mask must be /24 to match the clients',
      'DHCP snooping rate limiting is dropping requests from additional clients',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A /26 starting at 192.168.30.0 has usable hosts .1–.62. Excluding .1–.50 leaves only **.51–.62 = 12 addresses**, and all 12 are leased, so the pool is exhausted. The gateway is already inside the excluded range, clients take their mask from the pool (there is no separate client mask to match), and nothing in the exhibit involves DHCP snooping.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which command displays the addresses leased by an IOS DHCP server together with each client’s identifier and lease expiration?',
    answers: ['show ip dhcp binding', 'sh ip dhcp binding', 'show ip dhcp bind', 'sh ip dhcp bind'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`show ip dhcp binding` lists each leased IP with its client ID or hardware address, lease expiration and type. `show ip dhcp pool` summarizes pool utilization instead, and `show ip dhcp conflict` lists addresses withheld because of conflicts.',
  },
];
