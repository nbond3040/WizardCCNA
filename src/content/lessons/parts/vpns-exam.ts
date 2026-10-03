import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which VPN type is transparent to the end hosts, which simply send ordinary packets to their default gateway?',
    options: [
      'Site-to-site IPsec VPN',
      'Full-client remote-access VPN',
      'Clientless SSL VPN',
      'Remote-access IPsec VPN with split tunneling',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'In a **site-to-site VPN** the gateways build the tunnel and encrypt traffic on behalf of the hosts, which never know about it. Every remote-access variant requires the user to run a client or at least open a browser portal.',
  },
  {
    id: 'e2',
    type: 'input',
    stem: 'What IP protocol number identifies ESP? (Enter the number.)',
    answers: ['50', 'protocol 50', 'ip protocol 50'],
    placeholder: 'number',
    difficulty: 1,
    explanation:
      'ESP is IP protocol **50**, AH is 51 and GRE is 47. These are values in the protocol field of the IP header, not TCP or UDP ports; IKE itself uses UDP 500.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements about AH are true? (Choose two.)',
    options: [
      'It uses IP protocol 51',
      'It provides integrity and authentication but no encryption',
      'It encrypts the payload with AES',
      'It runs over UDP port 500',
      'It works through NAT without modification',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'AH is **IP protocol 51** and offers integrity, authentication and anti-replay but **no confidentiality**. Encryption is the job of ESP, UDP 500 is IKE, and AH breaks when NAT rewrites the outer IP header fields that its integrity check covers.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Which IPsec protocol and mode produce the packet layout shown?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'header',
        layout: 'line',
        unit: 'bytes',
        fields: [
          { label: 'New IP hdr', size: 20, sub: 'R1 → R2', tone: 'muted' },
          { label: 'ESP hdr', size: 8, sub: 'SPI + seq' },
          { label: 'Original IP hdr', size: 20, sub: 'encrypted', tone: 'accent' },
          { label: 'TCP + data', size: 100, sub: 'encrypted', tone: 'accent' },
          { label: 'ESP trailer', size: 2, sub: 'encrypted', tone: 'accent' },
          { label: 'ESP auth (ICV)', size: 16 },
        ],
      },
    },
    options: ['ESP in tunnel mode', 'ESP in transport mode', 'AH in tunnel mode', 'AH in transport mode'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The ESP header, trailer and ICV identify **ESP**, and the new outer IP header placed in front of the encrypted original IP header identifies **tunnel mode**. In transport mode the original IP header stays in front. AH has neither a trailer nor encrypted fields.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer captures this packet on the Internet link between two routers. Which statement is correct?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'header',
        layout: 'line',
        unit: 'bytes',
        fields: [
          { label: 'Delivery IP hdr', size: 20, sub: 'R1 → R2', tone: 'muted' },
          { label: 'ESP hdr', size: 8 },
          { label: 'GRE hdr', size: 4, tone: 'accent' },
          { label: 'Original IP hdr', size: 20, tone: 'accent' },
          { label: 'TCP + data', size: 100, tone: 'accent' },
          { label: 'ESP trailer', size: 2, tone: 'accent' },
          { label: 'ESP ICV', size: 16 },
        ],
      },
    },
    options: [
      'IPsec runs in transport mode and protects a GRE packet',
      'IPsec runs in tunnel mode because the packet contains two IP headers',
      'GRE encrypts the inner packet and ESP only adds authentication',
      'The packet uses AH, because the GRE header is authenticated',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'ESP sits directly behind the delivery IP header and encrypts the GRE header and the original packet, so this is **GRE over IPsec in transport mode**. In tunnel mode IPsec would add its own new IP header in front of the GRE delivery header, giving three IP headers, not two. GRE has no encryption, and AH has no trailer or encryption.',
  },
  {
    id: 'e6',
    type: 'match',
    stem: 'Match each IPsec building block to its purpose.',
    pairs: [
      { left: 'AES', right: 'Confidentiality (encryption)' },
      { left: 'SHA-256 HMAC', right: 'Integrity' },
      { left: 'Diffie-Hellman', right: 'Secure key exchange' },
      { left: 'Pre-shared key or certificate', right: 'Peer authentication' },
      { left: 'Sequence number', right: 'Anti-replay protection' },
    ],
    difficulty: 1,
    explanation:
      'AES encrypts, the HMAC proves the data was not altered, Diffie-Hellman agrees a shared secret over an untrusted network, a pre-shared key or certificate proves the peer\'s identity, and sequence numbers let the receiver reject replayed packets.',
  },
  {
    id: 'e7',
    type: 'categorize',
    stem: 'Classify each characteristic as site-to-site or remote-access VPN.',
    categories: ['Site-to-site VPN', 'Remote-access VPN'],
    items: [
      { text: 'Routers or firewalls are the tunnel endpoints', category: 0 },
      { text: 'Hosts are unaware that a tunnel exists', category: 0 },
      { text: 'Tunnel is usually permanent and replaces a leased line', category: 0 },
      { text: 'Cisco Secure Client runs on the laptop', category: 1 },
      { text: 'User authenticates, often with MFA, and receives an address from a pool', category: 1 },
      { text: 'A browser-only clientless option exists', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Site-to-site VPNs connect networks through gateways and are transparent to hosts. Remote-access VPNs connect individual users, who authenticate and run a client (or use a browser portal in the clientless case).',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. What does this output indicate?',
    exhibit: {
      kind: 'cli',
      text: `R1# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
203.0.113.2     198.51.100.1    QM_IDLE           1001 ACTIVE

IPv6 Crypto ISAKMP SA`,
    },
    options: [
      'IKE Phase 1 is complete: the ISAKMP SA with 203.0.113.2 is established',
      'The IPsec SAs are active and user traffic is being encrypted',
      'The peer rejected the proposal and negotiation failed',
      'The tunnel uses IKEv2, because the state is QM_IDLE',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`QM_IDLE` with status `ACTIVE` means the **Phase 1 ISAKMP SA** is authenticated and up, ready for quick mode. Whether data is actually being encrypted must be checked with `show crypto ipsec sa`. A failed negotiation would not show an established SA, and `QM_IDLE` is an IKEv1 state.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Users report that the tunnel to R2 is up but nothing works. What does the output show?',
    exhibit: {
      kind: 'cli',
      text: `R1# show crypto ipsec sa

interface: Tunnel0
    Crypto map tag: Tunnel0-head-0, local addr 198.51.100.1

   protected vrf: (none)
   local  ident (addr/mask/prot/port): (198.51.100.1/255.255.255.255/47/0)
   remote ident (addr/mask/prot/port): (203.0.113.2/255.255.255.255/47/0)
   current_peer 203.0.113.2 port 500
     PERMIT, flags={origin_is_acl,}
    #pkts encaps: 482, #pkts encrypt: 482, #pkts digest: 482
    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0`,
    },
    options: [
      'R1 encrypts and sends traffic to R2 but receives no protected traffic back from R2',
      'The IPsec SA has not been negotiated, so no packets are processed',
      'R1 receives packets from R2 but drops them because of integrity failures',
      'The tunnel is passing traffic in both directions normally',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The encaps/encrypt counters are rising while decaps/decrypt stay at **0**: R1 is protecting and sending packets, but nothing is arriving from R2 (R2 not sending, ESP or UDP 4500 blocked in the path, or an SA mismatch on R2). Rising counters prove the SA exists. Integrity failures would show up as verify or error counters, not as zero decaps.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. PC-A sends a packet to Server-B through the ESP tunnel-mode VPN between R1 and R2. What are the source and destination addresses of the outer IP header as the packet crosses the Internet?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.6,
        nodes: [
          { id: 'pca', icon: 'pc', label: 'PC-A', sub: '10.1.1.10', x: 0.9, y: 1.4 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'outside 198.51.100.1', x: 3.2, y: 1.4 },
          { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 3 },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'outside 203.0.113.2', x: 6.8, y: 1.4 },
          { id: 'srv', icon: 'server', label: 'Server-B', sub: '10.2.2.20', x: 9.1, y: 1.4 },
        ],
        links: [
          { from: 'pca', to: 'r1' },
          { from: 'r1', to: 'inet' },
          { from: 'inet', to: 'r2' },
          { from: 'r2', to: 'srv' },
          { from: 'r1', to: 'r2', label: 'IPsec tunnel', style: 'dashed', tone: 'accent' },
        ],
      },
    },
    options: [
      'Source 198.51.100.1, destination 203.0.113.2',
      'Source 10.1.1.10, destination 10.2.2.20',
      'Source 198.51.100.1, destination 10.2.2.20',
      'Source 10.1.1.10, destination 203.0.113.2',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'In tunnel mode the gateways add a **new outer IP header** addressed between their own public interfaces. The original header (10.1.1.10 to 10.2.2.20) is encrypted inside the ESP payload and is invisible on the Internet. The other options mix inner and outer addresses.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. What is the purpose of the `tunnel protection ipsec profile VPN-PROF` command?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface Tunnel0
interface Tunnel0
 ip address 172.16.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0/1
 tunnel destination 203.0.113.2
 tunnel protection ipsec profile VPN-PROF`,
    },
    options: [
      'It applies IPsec protection to the GRE traffic that Tunnel0 sends and receives',
      'It creates the GRE tunnel between R1 and 203.0.113.2',
      'It selects the routing protocol that runs over Tunnel0',
      'It encrypts all traffic leaving GigabitEthernet0/0/1, not just the tunnel',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The profile (transform set, mode and lifetimes) is attached to Tunnel0, so the **GRE packets** are encrypted with IPsec. The tunnel itself comes from `tunnel source` and `tunnel destination` (GRE is the default tunnel mode). A routing protocol is configured separately, and only the tunnel\'s traffic is protected.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Which protocol lets a DMVPN spoke learn the public address of another spoke so that a direct tunnel can be built?',
    options: ['NHRP', 'ARP', 'IKE', 'OSPF'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**NHRP** (Next Hop Resolution Protocol) maps tunnel addresses to public addresses. ARP resolves local MAC addresses, IKE negotiates the IPsec keys once the peer is known, and OSPF only distributes routes.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which three technologies combine to make up a DMVPN? (Choose three.)',
    options: ['Multipoint GRE (mGRE)', 'NHRP', 'IPsec', 'MPLS L3VPN', 'L2TP'],
    answers: [0, 1, 2],
    difficulty: 2,
    explanation:
      'DMVPN uses **mGRE** for one tunnel interface serving many peers, **NHRP** to resolve spoke addresses and **IPsec** to protect the tunnels, usually with a dynamic routing protocol on top. MPLS L3VPN is a provider service and L2TP is a different tunneling protocol.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Contractors use personal laptops on which no software may be installed. They need access only to an internal HTTPS timesheet application and a wiki, not to the whole network. Which solution fits best?',
    options: [
      'A clientless SSL VPN portal on the headend',
      'A full-client VPN using Cisco Secure Client',
      'A site-to-site IPsec VPN to each contractor',
      'A DMVPN spoke configured on each laptop',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A **clientless SSL VPN** needs only a browser and exposes just the web applications published on the portal, matching both requirements. A full client requires installation and normally gives network-wide access, site-to-site VPNs connect gateways rather than individual laptops, and DMVPN spokes are routers.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. The IPsec tunnel between R1 and R2 never comes up. Which mismatch is responsible?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section crypto isakmp policy
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14

R2# show running-config | section crypto isakmp policy
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 5`,
    },
    options: [
      'The Diffie-Hellman groups differ',
      'The hash algorithms differ',
      'The authentication methods differ',
      'The encryption algorithms differ',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 uses DH **group 14** and R2 uses **group 5**. For a Phase 1 proposal to match, encryption, hash, authentication method and DH group must be identical on both peers, so no ISAKMP SA is formed. Encryption (aes 256), hash (sha256) and authentication (pre-share) are the same in both policies.',
  },
  {
    id: 'e16',
    type: 'order',
    stem: 'Put the headers of a GRE-over-IPsec packet (IPsec in transport mode) in order, from the outside of the packet to the inside.',
    items: [
      'Delivery IP header (R1 to R2, protocol 50)',
      'ESP header',
      'GRE header',
      'Original IP header',
      'TCP or UDP segment and data',
    ],
    difficulty: 2,
    explanation:
      'The original packet is first wrapped by GRE, which adds the GRE header and a delivery IP header between the two routers. IPsec transport mode then inserts the ESP header right behind that delivery header and encrypts everything after it (the ESP trailer and ICV follow at the end of the packet).',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which mechanism lets an IPsec receiver detect an attacker who captures a valid encrypted packet and sends it again later?',
    options: [
      'The ESP sequence number checked against an anti-replay window',
      'The Diffie-Hellman exchange',
      'The HMAC on its own',
      'The SPI value in the ESP header',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Every ESP/AH packet carries an increasing **sequence number**, and the receiver rejects duplicates and packets that fall outside its window. A replayed packet still has a valid HMAC, so the integrity check alone cannot detect it. Diffie-Hellman only agrees keys, and the SPI only identifies the SA.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Why is IPsec transport mode normally used when IPsec protects a GRE tunnel between two routers?',
    options: [
      'GRE already adds an outer IP header between the routers, so tunnel mode would add a redundant second one',
      'Transport mode is the only mode that can encrypt multicast traffic',
      'Tunnel mode cannot be used with ESP',
      'Transport mode gives stronger encryption than tunnel mode',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The GRE delivery header already carries the two routers\' public addresses, so IPsec only needs to protect the GRE packet; tunnel mode would waste 20 bytes per packet on a duplicate header. Both modes encrypt multicast carried inside GRE, both work with ESP, and the encryption strength is identical.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'A branch router sits behind a NAT device and must build an IPsec VPN to headquarters. Which two statements are true? (Choose two.)',
    options: [
      'AH cannot be used because NAT changes IP header fields that AH authenticates',
      'NAT traversal encapsulates ESP in UDP port 4500',
      'ESP can never cross a NAT device',
      'IKE must switch to TCP port 500 when NAT is detected',
      'Transport mode is required for NAT traversal',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'AH\'s integrity check covers the immutable fields of the outer IP header, so NAT breaks it. **NAT-T** wraps ESP in UDP 4500 so that it can cross NAT. ESP therefore can traverse NAT, IKE stays on UDP (500, then 4500), and either IPsec mode works with NAT-T.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Classify each characteristic as ESP or AH.',
    categories: ['ESP', 'AH'],
    items: [
      { text: 'IP protocol 50', category: 0 },
      { text: 'IP protocol 51', category: 1 },
      { text: 'Encrypts the payload', category: 0 },
      { text: 'Integrity and authentication only', category: 1 },
      { text: 'Can cross NAT using UDP 4500 encapsulation', category: 0 },
      { text: 'Authentication covers immutable fields of the outer IP header', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'ESP is protocol 50, encrypts, and can cross NAT with NAT-T. AH is protocol 51, provides no encryption and authenticates the outer IP header\'s immutable fields, which is why NAT breaks it.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Remote users on the VPN complain that cloud video calls lag, and the headend Internet link is saturated. Security approves letting traffic to that trusted cloud service bypass corporate inspection. Which change addresses the problem?',
    options: [
      'Enable split tunneling so the cloud service\'s traffic leaves directly from the user\'s connection',
      'Switch the VPN from split tunnel to full tunnel',
      'Replace ESP with AH on the tunnels',
      'Add GRE to the remote-access tunnels',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**Split tunneling** sends only chosen traffic through the VPN and lets the rest (here the trusted cloud service) go straight to the Internet, relieving the headend. Full tunnel would add even more load. AH provides no encryption, and GRE adds overhead without reducing traffic.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Which two protocols can Cisco Secure Client use to build a remote-access VPN tunnel? (Choose two.)',
    options: [
      'TLS/DTLS (SSL VPN)',
      'IPsec with IKEv2',
      'GRE without encryption',
      'AH in transport mode',
      'Telnet over TCP 23',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Cisco Secure Client (formerly AnyConnect) supports **TLS/DTLS** and **IPsec with IKEv2**. GRE alone offers no protection, AH has no encryption, and Telnet is an insecure management protocol, not a VPN.',
  },
];

export default exam;
