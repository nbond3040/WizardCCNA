import type { Slide } from '../../types';

const slides: Slide[] = [
  {
    kind: 'title',
    title: 'IPsec VPNs',
    subtitle: 'Private tunnels across public networks: site-to-site, remote access, IKE, ESP and GRE',
    notes:
      "A virtual private network (VPN) builds a private, protected path across a network you do not trust, usually the Internet. Almost every organization relies on VPNs: branches reach headquarters through site-to-site tunnels, and employees reach internal applications from home or hotels through remote-access tunnels. This lesson covers the four VPN security goals (confidentiality, integrity, authentication and anti-replay), the difference between **site-to-site** and **remote-access** VPNs, the IPsec framework with **IKE**, **ESP** and **AH**, **tunnel** versus **transport** mode, the cryptographic building blocks (AES, SHA, Diffie-Hellman, pre-shared keys and certificates), **GRE over IPsec** and DMVPN, and client versus clientless remote access. The topic is v1.1 exam topic 5.5 and part of domain 4 in v2.0. The exam objective is to describe these VPNs rather than configure them, so focus on what each component does, which protocol numbers and ports it uses, and where each header sits in the packet.",
  },
  {
    kind: 'bullets',
    title: 'Why VPNs?',
    bullets: [
      'Private WAN links (leased lines, MPLS) are costly',
      'Internet access is cheap and everywhere, but **untrusted**',
      'VPN = **encrypted tunnel** across a shared network',
      'Connects **sites** (site-to-site) or **users** (remote access)',
      'Protection applies only between the two VPN endpoints',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.6,
      nodes: [
        { id: 'hq', icon: 'router', label: 'R1', sub: 'HQ gateway', x: 1.5, y: 1.2 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 2.8 },
        { id: 'br', icon: 'router', label: 'R2', sub: 'Branch gateway', x: 8.5, y: 1.2 },
      ],
      links: [
        { from: 'hq', to: 'inet' },
        { from: 'inet', to: 'br' },
        { from: 'hq', to: 'br', label: 'IPsec tunnel', style: 'dashed', tone: 'accent' },
      ],
    },
    notes:
      "Companies used to connect sites with private WAN services such as leased lines or MPLS, where the provider keeps each customer's traffic separate. Those services are reliable but expensive, while Internet connections are cheap, fast and available everywhere, including at home and in hotels. The problem is trust: on the Internet, anyone along the path might read, modify or inject packets. A **VPN** solves this by building a logical **tunnel** between two endpoints. Each packet is encrypted and authenticated by the sending VPN endpoint, carried across the Internet inside a new packet, then checked and decrypted by the receiving endpoint. To the applications and users, the remote network looks directly connected. The two big families are **site-to-site** VPNs, which connect whole networks through VPN gateways, and **remote-access** VPNs, which connect individual users running client software. Both families use the same cryptographic ideas, which the rest of this lesson unpacks. Remember that a VPN protects traffic only between its two endpoints; beyond them, the traffic is ordinary again.",
  },
  {
    kind: 'table',
    title: 'What a VPN must provide',
    columns: ['Goal', 'Question it answers', 'IPsec mechanism'],
    rows: [
      ['**Confidentiality**', 'Can anyone read the data?', 'Encryption: **AES**'],
      ['**Integrity**', 'Was the data changed in transit?', 'Keyed hash (HMAC): **SHA-256**'],
      ['**Authentication**', 'Is the peer really who it claims to be?', 'Pre-shared key or **certificates**'],
      ['**Anti-replay**', 'Is this an old packet sent again?', '**Sequence numbers** in ESP/AH'],
    ],
    caption: 'Remember them as C-I-A plus anti-replay.',
    notes:
      "Every VPN question ultimately rests on four security services. **Confidentiality** means that an eavesdropper who captures the packets cannot read them; IPsec provides it by encrypting the payload with a symmetric algorithm, today almost always **AES**. **Integrity** means that any change to a packet in transit is detected: the sender computes a keyed hash (an HMAC, for example with **SHA-256**) over the packet, and the receiver recomputes it and drops the packet on a mismatch. **Authentication** works at two levels. During tunnel setup, each gateway proves its identity with a **pre-shared key** or a **digital certificate**; afterward, every packet is authenticated by the same keyed hash, because only the real peer knows the key. **Anti-replay** stops an attacker from capturing a valid encrypted packet and sending it again later: every ESP and AH packet carries a **sequence number**, and the receiver rejects duplicates and packets that fall outside its sliding window. ESP can provide all four services, while AH provides everything except confidentiality.",
  },
  {
    kind: 'diagram',
    title: 'Site-to-site VPN',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.6,
      groups: [
        { label: 'HQ 10.1.1.0/24', x: 0.2, y: 0.9, w: 3.9, h: 2.4 },
        { label: 'Branch 10.2.2.0/24', x: 5.9, y: 0.9, w: 3.9, h: 2.4 },
      ],
      nodes: [
        { id: 'ha', icon: 'pc', label: 'Host A', sub: '10.1.1.10', x: 0.9, y: 2.1 },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'VPN gateway', x: 3.2, y: 2.1 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 3.8 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'VPN gateway', x: 6.8, y: 2.1 },
        { id: 'hb', icon: 'server', label: 'Server B', sub: '10.2.2.20', x: 9.1, y: 2.1 },
      ],
      links: [
        { from: 'ha', to: 'r1' },
        { from: 'r1', to: 'inet' },
        { from: 'inet', to: 'r2' },
        { from: 'r1', to: 'r2', label: 'IPsec (ESP)', style: 'dashed', tone: 'accent' },
        { from: 'r2', to: 'hb' },
      ],
    },
    caption: 'Hosts send ordinary packets; only the gateways encrypt and decrypt.',
    notes:
      "In a **site-to-site VPN**, the tunnel is built between two **VPN gateways**, typically routers or firewalls at the edge of each site. The hosts behind them need no VPN software and are completely unaware of the tunnel: Host A simply sends an ordinary packet to 10.2.2.20 through its default gateway. R1 recognizes the traffic as interesting, because it matches the policy for traffic between 10.1.1.0/24 and 10.2.2.0/24, encrypts the whole original packet and wraps it in a new IP header addressed from R1's public address to R2's public address. Internet routers see only a packet between the two gateways carrying ESP. R2 checks integrity and anti-replay, decrypts, removes the outer header and forwards the original packet to Server B. Because the tunnel is permanent, or comes up automatically when matching traffic appears, site-to-site VPNs replace private WAN links between offices, data centers and cloud networks. The exam phrase to remember is that site-to-site VPNs are **transparent to end hosts**.",
  },
  {
    kind: 'diagram',
    title: 'Remote-access VPN',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'lap', icon: 'laptop', label: 'Remote user', sub: 'Cisco Secure Client', x: 1.1, y: 1.2 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 3.8, y: 3 },
        { id: 'fw', icon: 'firewall', label: 'VPN headend', sub: 'ASA / FTD', x: 6.4, y: 1.2, tone: 'accent' },
        { id: 'srv', icon: 'server', label: 'HQ servers', sub: '10.2.2.0/24', x: 9, y: 1.2 },
      ],
      links: [
        { from: 'lap', to: 'inet' },
        { from: 'inet', to: 'fw' },
        { from: 'lap', to: 'fw', label: 'TLS or IPsec tunnel', style: 'dashed', tone: 'accent' },
        { from: 'fw', to: 'srv' },
      ],
    },
    caption: 'The client builds the tunnel on demand to the headend.',
    notes:
      "A **remote-access VPN** connects one user device to the corporate network. The endpoint itself runs VPN client software, such as **Cisco Secure Client** (formerly AnyConnect), and builds the tunnel on demand to a **VPN headend**, typically a Cisco ASA, a Firepower Threat Defense firewall or a router. The user authenticates, often with a username and password checked through RADIUS against Active Directory and frequently with multi-factor authentication, and the headend assigns the client an address from a VPN pool, so the laptop appears to be inside the corporate network. Unlike site-to-site VPNs, remote access is **not transparent**: the user must start the client, or it connects automatically, and must log in. Remote-access VPNs usually use **TLS** (an SSL VPN on TCP 443, often with DTLS over UDP for performance) because port 443 is allowed through almost every hotel and home firewall, but they can also use **IPsec with IKEv2**. The exam expects you to say that remote-access VPNs use client software, or a browser in the clientless case, and connect individual users rather than sites.",
  },
  {
    kind: 'compare',
    title: 'Site-to-site vs remote access',
    left: {
      heading: 'Site-to-site',
      bullets: [
        'Gateway to gateway (routers, firewalls)',
        '**Transparent** to hosts: no client software',
        'Usually always on',
        'Connects whole networks: branches, data centers, cloud',
        'IPsec, often GRE over IPsec or DMVPN',
      ],
    },
    right: {
      heading: 'Remote access',
      bullets: [
        'One user device to a headend',
        '**Client software** (Cisco Secure Client) or a browser',
        'Built on demand when the user connects',
        'Connects home workers and travelers',
        'TLS/DTLS or IPsec with IKEv2',
      ],
      tone: 'accent',
    },
    notes:
      "The side-by-side view makes the distinction exam-ready. In a **site-to-site** VPN, the VPN endpoints are network devices, routers or firewalls, and they protect traffic on behalf of entire subnets. Hosts behind them run no VPN software and do not even know the tunnel exists, which is why Cisco describes it as transparent to end hosts. These tunnels are usually always up and replace or back up private WAN links between branches, headquarters, data centers and cloud providers. In a **remote-access** VPN, one endpoint is the user's own device. The user runs client software such as Cisco Secure Client, or opens a browser for clientless access, authenticates (often with multi-factor authentication through a AAA server) and brings the tunnel up only when needed. Site-to-site VPNs are almost always IPsec, frequently with GRE or DMVPN on top; remote-access VPNs are typically TLS-based but can also use IPsec with IKEv2. When a question mentions employees working from home or hotels, think remote access; when it mentions connecting branch offices, think site-to-site.",
  },
  {
    kind: 'table',
    title: 'The IPsec framework',
    columns: ['Function', 'IPsec choices', 'Use today'],
    rows: [
      ['Security protocol', 'ESP (IP protocol 50) or AH (IP protocol 51)', '**ESP**'],
      ['Confidentiality', 'DES, 3DES, **AES** (128/192/256)', 'AES, often AES-GCM'],
      ['Integrity', 'MD5, SHA-1, **SHA-2** (SHA-256/384/512) HMAC', 'SHA-256 or stronger'],
      ['Peer authentication', '**Pre-shared key** or **certificates** (RSA/ECDSA)', 'Certificates at scale'],
      ['Key exchange', '**Diffie-Hellman** groups, e.g. 14, 19, 20', 'Group 14 or elliptic-curve 19/20'],
      ['Tunnel negotiation', '**IKEv1** or **IKEv2** (UDP 500, NAT-T UDP 4500)', 'IKEv2'],
    ],
    caption: 'IPsec is not one protocol but a framework of interchangeable parts.',
    notes:
      "IPsec is best understood as a **framework**: a set of slots, each filled by an algorithm or protocol that the two peers negotiate. The **security protocol** is ESP or AH. **Confidentiality** comes from a symmetric cipher; DES and 3DES are obsolete, and AES with 128-, 192- or 256-bit keys is the standard, often in GCM mode, which encrypts and authenticates in one step. **Integrity** comes from an HMAC; MD5 and SHA-1 are considered weak, so SHA-256 or stronger is recommended. **Peer authentication** proves the gateways' identities during tunnel setup, either with a pre-shared key typed on both peers, which is simple but hard to manage at scale, or with digital certificates issued by a certificate authority. **Key exchange** uses Diffie-Hellman, so the peers agree on secret keys over the Internet without ever sending them; larger or elliptic-curve groups such as 14, 19 and 20 replace the old groups 1, 2 and 5. Finally, **IKE** negotiates all of the above and manages the security associations. Because the slots are independent, one weak choice weakens the whole tunnel.",
  },
  {
    kind: 'diagram',
    title: 'IKE builds the tunnel (IKEv2)',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'r1', label: 'R1 (initiator)', icon: 'router' },
        { id: 'r2', label: 'R2 (responder)', icon: 'router' },
      ],
      steps: [
        { from: 'r1', to: 'r2', label: 'IKE_SA_INIT request', sub: 'UDP 500 · proposals, DH public value, nonce' },
        { from: 'r2', to: 'r1', label: 'IKE_SA_INIT response', sub: 'chosen proposal, DH public value, nonce' },
        { note: 'Both compute the DH shared secret; everything after this is encrypted', tone: 'muted' },
        { from: 'r1', to: 'r2', label: 'IKE_AUTH request', sub: 'identity, PSK or certificate proof, traffic selectors' },
        { from: 'r2', to: 'r1', label: 'IKE_AUTH response', sub: 'IKE SA + first IPsec (child) SA ready', tone: 'good' },
        { from: 'r1', to: 'r2', label: 'ESP-protected data', sub: 'IP protocol 50 (UDP 4500 with NAT-T)', tone: 'accent' },
      ],
    },
    caption: 'IKEv2 needs four messages; IKEv1 needs Phase 1 plus Phase 2.',
    notes:
      "Before any user data is protected, the peers must agree on algorithms and keys, and that is the job of **IKE** (Internet Key Exchange), which runs over **UDP port 500**. The sequence shows IKEv2. In the first exchange, **IKE_SA_INIT**, the initiator proposes combinations of encryption, integrity and Diffie-Hellman group, and both sides send their Diffie-Hellman public values and random nonces. Each side then computes the same shared secret, from which the keys for the **IKE SA** are derived; everything after this point is encrypted. In the second exchange, **IKE_AUTH**, each peer proves its identity with the pre-shared key or its certificate and states which traffic should be protected (the traffic selectors). When it completes, the IKE SA exists as a protected control channel and the first **IPsec SA**, called a child SA, is ready, so ESP data can flow. IPsec SAs are one-directional, so each tunnel uses a pair of them, each identified by an SPI. If a NAT device sits in the path, IKE detects it and moves to UDP 4500, encapsulating ESP in UDP (NAT traversal).",
  },
  {
    kind: 'table',
    title: 'IKEv1 vs IKEv2',
    columns: ['Feature', 'IKEv1', 'IKEv2'],
    rows: [
      ['Transport', 'UDP 500 (4500 with NAT-T)', 'UDP 500 (4500 with NAT-T)'],
      ['Structure', '**Phase 1** (IKE/ISAKMP SA) + **Phase 2** (IPsec SAs)', 'IKE_SA_INIT + IKE_AUTH (IKE SA + first child SA)'],
      ['Messages to first tunnel', 'Main mode 6 (aggressive 3) + quick mode 3', '**4**'],
      ['NAT traversal', 'Added as an extension', 'Built in'],
      ['Remote-access user login', 'XAUTH extension', 'EAP built in'],
      ['Status', 'Legacy', '==Recommended=='],
    ],
    notes:
      "IKEv1 and IKEv2 do the same job with different conversations. **IKEv1** works in two phases. **Phase 1** builds a secure, authenticated channel between the peers, called the IKE or ISAKMP SA, using either **main mode** (six messages, identities protected) or **aggressive mode** (three messages, faster but with identities exposed). **Phase 2**, called **quick mode** (three messages), runs inside that channel and negotiates the IPsec SAs that actually protect user traffic with ESP or AH. **IKEv2** streamlines this into an initial exchange of four messages that creates both the IKE SA and the first IPsec (child) SA, and it builds in features that IKEv1 needed extensions for: NAT traversal, dead-peer detection and EAP authentication for remote-access users. It is also more resilient, because every request is acknowledged. Both versions use UDP 500 and switch to UDP 4500 when NAT is detected. For the exam, know that IKE negotiates and authenticates, that ESP or AH protects the data, and that IKEv2 is the modern choice; the exact message counts are useful background.",
  },
  {
    kind: 'compare',
    title: 'ESP vs AH',
    left: {
      heading: 'ESP (IP protocol 50)',
      bullets: [
        '**Encryption** + integrity + authentication',
        'Anti-replay with sequence numbers',
        'Integrity check does not cover the outer IP header',
        'Crosses NAT with NAT-T (UDP 4500)',
        '==Used by virtually every VPN==',
      ],
      tone: 'accent',
    },
    right: {
      heading: 'AH (IP protocol 51)',
      bullets: [
        'Integrity + authentication only: **no encryption**',
        'Anti-replay with sequence numbers',
        'Also authenticates the outer IP header',
        'Breaks when NAT rewrites the IP header',
        'Rarely used in practice',
      ],
    },
    notes:
      "IPsec defines two protocols for protecting data, and they are identified by **IP protocol numbers**, not ports: **ESP = 50** and **AH = 51**. **ESP** (Encapsulating Security Payload) encrypts the payload and also provides integrity, data-origin authentication and anti-replay, so it covers all four VPN goals. Its integrity check covers the ESP header, the payload and the trailer, but not the IP header in front of it. **AH** (Authentication Header) provides integrity, authentication and anti-replay but **no encryption**, so anyone can read the data. AH's integrity check also covers the unchanging fields of the outer IP header, which sounds attractive but means that NAT, which rewrites the addresses, breaks AH. ESP can cross NAT when NAT traversal wraps it in UDP 4500. In practice, virtually every VPN uses ESP, and AH appears mainly in exam questions. The classic questions: which IPsec protocol provides confidentiality? ESP. Which provides only integrity and authentication? AH. Remember that 50 and 51 are IP protocol numbers, carried in the protocol field of the IP header.",
  },
  {
    kind: 'diagram',
    title: 'ESP in transport mode',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Original IP hdr', size: 20, sub: 'not encrypted', tone: 'muted' },
        { label: 'ESP hdr', size: 8, sub: 'SPI + sequence' },
        { label: 'TCP/UDP + data', size: 100, sub: 'encrypted', tone: 'accent' },
        { label: 'ESP trailer', size: 2, sub: 'encrypted (+ padding)', tone: 'accent' },
        { label: 'ESP ICV', size: 16, sub: 'integrity check' },
      ],
    },
    caption: 'Payload size is an example; padding and ICV length depend on the algorithms.',
    bullets: [
      'Original IP header stays in front, unencrypted',
      'Protects only the **payload** (Layer 4 and up)',
      'Typical use: host to host, or **GRE over IPsec**',
    ],
    notes:
      "In **transport mode**, IPsec protects only the **payload** of the original packet. The original IP header stays at the front, unencrypted, followed by the ESP header, which carries the **SPI** (security parameter index, telling the receiver which SA to use) and the **sequence number** used for anti-replay. The TCP or UDP segment and its data are encrypted, together with the ESP trailer: padding, the pad length and a next-header field that identifies what was encrypted. At the end, the **ICV** (integrity check value) is the HMAC or authentication tag that lets the receiver detect tampering; it covers the ESP header, the payload and the trailer. Because the original addresses remain visible and are still used for routing, transport mode only makes sense when the IPsec endpoints are the same devices that originate and receive the traffic: two hosts talking directly, a router protecting its own traffic or, most commonly for the CCNA, **GRE over IPsec**, where the GRE packet between the two routers is the traffic being protected. It adds less overhead than tunnel mode because no extra IP header is created.",
  },
  {
    kind: 'diagram',
    title: 'ESP in tunnel mode',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'New IP hdr', size: 20, sub: 'gateway to gateway', tone: 'muted' },
        { label: 'ESP hdr', size: 8, sub: 'SPI + sequence' },
        { label: 'Original IP hdr', size: 20, sub: 'encrypted', tone: 'accent' },
        { label: 'TCP/UDP + data', size: 100, sub: 'encrypted', tone: 'accent' },
        { label: 'ESP trailer', size: 2, sub: 'encrypted', tone: 'accent' },
        { label: 'ESP ICV', size: 16, sub: 'integrity check' },
      ],
    },
    caption: 'An observer sees only the two gateway addresses and ESP.',
    bullets: [
      'Whole original packet encrypted, **including its IP header**',
      'New outer header carries the gateways\' public IPs',
      'Default for site-to-site and remote-access VPNs',
    ],
    notes:
      "In **tunnel mode**, IPsec protects the **entire original packet**, header included. The gateway encrypts the original IP header and payload, adds the ESP header and trailer, and places everything behind a **new IP header** whose source and destination are the public addresses of the two VPN gateways. An attacker capturing traffic on the Internet sees only that the two gateways are exchanging ESP packets; the real source and destination hosts, the protocols and the ports are all hidden inside the encrypted part. That is why tunnel mode is the default and the natural choice for **site-to-site** VPNs, where the gateways protect traffic on behalf of hosts behind them, and for remote-access VPNs. The price is overhead: 20 bytes for the new IP header plus the ESP header, initialization vector, padding and ICV, which can push full-size packets over the path MTU and cause fragmentation. For that reason, VPN interfaces often use a lower IP MTU or TCP MSS adjustment. On the exam, if a question asks which mode encrypts the original IP header, the answer is tunnel mode.",
  },
  {
    kind: 'table',
    title: 'ESP and AH in both modes',
    columns: ['Mode', 'Packet layout', 'Encrypted', 'Authenticated'],
    rows: [
      ['ESP transport', 'IP · ESP · payload · trailer · ICV', 'Payload + trailer', 'ESP header to trailer'],
      ['ESP tunnel', 'New IP · ESP · orig IP · payload · trailer · ICV', 'Orig IP + payload + trailer', 'ESP header to trailer'],
      ['AH transport', 'IP · AH · payload', '**Nothing**', 'Whole packet (immutable IP fields)'],
      ['AH tunnel', 'New IP · AH · orig IP · payload', '**Nothing**', 'Whole packet, incl. new IP (immutable fields)'],
    ],
    caption: 'ESP authentication never covers the outer IP header; AH authentication does.',
    notes:
      "This table puts the four combinations side by side, and it is worth memorizing the pattern rather than each row. **Tunnel mode** always inserts a new IP header, and the original IP header moves inside; **transport mode** keeps the original IP header at the front. **ESP** always sits between the visible IP header and what it protects, with a trailer and ICV at the end, and it encrypts everything after its own header up to the ICV. **AH** also sits right after the visible IP header, but it encrypts nothing; its integrity check covers the whole packet, including the immutable fields of the outermost IP header. Mutable fields such as the TTL and the header checksum are excluded, because routers change them. That coverage of the outer addresses is exactly why AH fails through NAT, while the integrity check of ESP deliberately stops at its own header. Exam questions often show a packet layout and ask which mode and protocol it represents, or ask what an attacker can see. With ESP in tunnel mode, only the new outer IP header and the ESP header are readable.",
  },
  {
    kind: 'bullets',
    title: 'Why GRE over IPsec?',
    bullets: [
      'Plain IPsec (crypto map) tunnels carry **unicast IP only**',
      'Routing protocols need **multicast**: OSPF 224.0.0.5, EIGRP 224.0.0.10',
      '**GRE** (IP protocol 47) carries multicast and other protocols',
      'GRE alone provides **no encryption**',
      'GRE builds the tunnel; IPsec protects it',
      'Result: a routable tunnel interface with dynamic routing',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 3.6,
      nodes: [
        { id: 'r1', icon: 'router', label: 'R1', sub: 'Tunnel0 172.16.0.1', x: 1.5, y: 1.2 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 5, y: 2.8 },
        { id: 'r2', icon: 'router', label: 'R2', sub: 'Tunnel0 172.16.0.2', x: 8.5, y: 1.2 },
      ],
      links: [
        { from: 'r1', to: 'inet' },
        { from: 'inet', to: 'r2' },
        { from: 'r1', to: 'r2', label: 'GRE over IPsec · OSPF', style: 'dashed', tone: 'accent' },
      ],
    },
    notes:
      "Classic IPsec site-to-site VPNs, built with crypto maps on IOS, protect traffic that matches an access list, and they were designed for unicast IP. They cannot carry multicast, so routing protocols whose hellos go to multicast addresses, such as OSPF (224.0.0.5) and EIGRP (224.0.0.10), cannot form neighbors across them, and every new subnet means editing the crypto ACLs on both ends. **GRE** (Generic Routing Encapsulation, IP protocol **47**) solves the carrying problem: it creates a virtual point-to-point **tunnel interface** that can encapsulate almost any Layer 3 protocol, including multicast and broadcast, so OSPF or EIGRP can run over it as over any other link. But GRE provides **no encryption and no authentication** at all. Combining the two gives the best of both: GRE provides the routable tunnel, and IPsec encrypts the GRE packets between the two routers. The routers learn remote subnets dynamically over the tunnel, and only one simple IPsec policy is needed, protecting GRE between the two public addresses. This design is also the foundation of DMVPN.",
  },
  {
    kind: 'diagram',
    title: 'GRE over IPsec: the packet',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Outer IP hdr', size: 20, sub: 'R1 → R2 public IPs', tone: 'muted' },
        { label: 'ESP hdr', size: 8 },
        { label: 'GRE hdr', size: 4, sub: 'encrypted', tone: 'accent' },
        { label: 'Original IP hdr', size: 20, sub: 'encrypted', tone: 'accent' },
        { label: 'Payload', size: 100, sub: 'encrypted', tone: 'accent' },
        { label: 'ESP trailer', size: 2, sub: 'encrypted', tone: 'accent' },
        { label: 'ESP ICV', size: 16 },
      ],
    },
    caption: 'IPsec transport mode protecting a GRE packet; payload size is an example.',
    bullets: [
      'GRE adds its own delivery IP header (R1 to R2)',
      'IPsec **transport mode** protects that GRE packet',
      'Tunnel mode would add a second, redundant IP header',
    ],
    notes:
      "Follow the packet from the inside out. The original packet, perhaps an OSPF hello to 224.0.0.5 or a user packet from 10.1.1.10 to 10.2.2.20, is routed into the Tunnel0 interface. GRE adds a small **GRE header** (4 bytes in its basic form, with a protocol-type field identifying the payload as IPv4) and a new **delivery IP header** from R1's tunnel source to R2's tunnel destination, marked with IP protocol 47. That GRE packet then matches the IPsec policy. Because GRE has already added a header with the two routers' public addresses, IPsec normally runs in **transport mode**: ESP is inserted after the delivery header and encrypts the GRE header, the original packet and the trailer. An observer on the Internet sees only ESP between R1 and R2; even the presence of GRE is hidden. In tunnel mode, IPsec would add a second outer IP header carrying the same two addresses, wasting 20 bytes per packet. The overhead adds up, so GRE over IPsec tunnels are usually configured with a reduced IP MTU, such as 1400 bytes, to avoid fragmentation.",
  },
  {
    kind: 'cli',
    title: 'GRE over IPsec on IOS (awareness)',
    code: `R1(config)# crypto isakmp policy 10
R1(config-isakmp)# encryption aes 256
R1(config-isakmp)# hash sha256
R1(config-isakmp)# authentication pre-share
R1(config-isakmp)# group 14
R1(config-isakmp)# exit
R1(config)# crypto isakmp key VpnKey123 address 203.0.113.2
R1(config)# crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
R1(cfg-crypto-trans)# mode transport
R1(cfg-crypto-trans)# exit
R1(config)# crypto ipsec profile VPN-PROF
R1(ipsec-profile)# set transform-set TS
R1(ipsec-profile)# exit
R1(config)# interface Tunnel0
R1(config-if)# ip address 172.16.0.1 255.255.255.252
R1(config-if)# tunnel source GigabitEthernet0/0/1
R1(config-if)# tunnel destination 203.0.113.2
R1(config-if)# tunnel protection ipsec profile VPN-PROF`,
    highlight: ['authentication pre-share', 'group 14', 'mode transport', 'tunnel protection ipsec profile VPN-PROF'],
    caption: 'Phase 1 policy, pre-shared key, Phase 2 transform set, profile, protected GRE tunnel.',
    notes:
      "The CCNA asks you to describe IPsec rather than configure it, but seeing the commands ties every concept in this lesson to something concrete. The `crypto isakmp policy` block is the IKEv1 Phase 1 proposal: **AES-256** for encryption, **SHA-256** for integrity, a **pre-shared key** for peer authentication and **Diffie-Hellman group 14** for key exchange. The `crypto isakmp key` command sets that pre-shared key for the peer 203.0.113.2, and the same key must be configured on R2 for R1's address. The **transform set** is the Phase 2 proposal for the IPsec SAs: ESP with AES-256 encryption and SHA-256 HMAC integrity, in **transport mode** because GRE already supplies the outer header. The **IPsec profile** bundles the transform set so that it can be attached to a tunnel interface. Finally, **Tunnel0** is a GRE tunnel (GRE is the default tunnel mode) sourced from the Internet-facing interface toward R2, and `tunnel protection ipsec profile` encrypts everything that leaves through it. With both sides configured, OSPF or EIGRP can run on the 172.16.0.0/30 tunnel subnet to exchange routes.",
  },
  {
    kind: 'diagram',
    title: 'DMVPN (awareness)',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'hub', icon: 'router', label: 'Hub', sub: 'HQ · mGRE', x: 5, y: 0.9, tone: 'accent' },
        { id: 's1', icon: 'router', label: 'Spoke 1', x: 1.5, y: 4.1 },
        { id: 's2', icon: 'router', label: 'Spoke 2', x: 5, y: 4.1 },
        { id: 's3', icon: 'router', label: 'Spoke 3', x: 8.5, y: 4.1 },
      ],
      links: [
        { from: 'hub', to: 's1', style: 'dashed', label: 'permanent' },
        { from: 'hub', to: 's2', style: 'dashed' },
        { from: 'hub', to: 's3', style: 'dashed', label: 'permanent' },
        { from: 's1', to: 's2', style: 'dotted', tone: 'accent', label: 'dynamic spoke-to-spoke' },
      ],
    },
    caption: 'DMVPN = mGRE + NHRP + IPsec: spokes build direct tunnels on demand.',
    notes:
      "Point-to-point GRE over IPsec works well for a few sites, but with 200 sites a full mesh would need nearly 20,000 tunnels. **DMVPN** (Dynamic Multipoint VPN) is Cisco's scalable answer. Each spoke is configured once, with a permanent tunnel to the hub, and the hub uses a single **multipoint GRE (mGRE)** interface for all spokes, so adding a branch requires no change at the hub. When one spoke needs to reach another, it asks the hub through **NHRP** (Next Hop Resolution Protocol), which maps tunnel addresses to the spokes' public addresses, and then builds a **direct spoke-to-spoke tunnel** on demand, which is removed again when it goes idle. **IPsec** protects all of these tunnels, and a routing protocol runs across the mGRE cloud. For the CCNA you need awareness only: DMVPN combines mGRE, NHRP and IPsec, it offers the configuration simplicity of hub-and-spoke with full-mesh-like direct connectivity, and spokes can even use dynamic public addresses. The exam may contrast it with a static full mesh of point-to-point tunnels, which scales poorly.",
  },
  {
    kind: 'table',
    title: 'Client vs clientless remote access',
    columns: ['Type', 'What the user needs', 'Access provided', 'Protocol'],
    rows: [
      ['**Full-client VPN**', 'Installed client: Cisco Secure Client (AnyConnect)', 'Full network access for any application', 'TLS/DTLS or IPsec IKEv2'],
      ['**Clientless (browser) VPN**', 'Only a web browser', 'Web portal to selected internal web apps', 'TLS (HTTPS, TCP 443)'],
    ],
    caption: 'Clientless = browser portal with limited apps; client = full tunnel into the network.',
    notes:
      "Remote-access VPNs come in two flavors. A **full-client VPN** uses software installed on the endpoint: Cisco Secure Client (the new name of AnyConnect) or another IPsec or TLS client. The client receives an IP address from the headend's pool and a virtual adapter, so any application (email, file shares, SSH, voice) works as if the laptop were plugged in at the office. It can use TLS with DTLS, or IPsec with IKEv2. A **clientless SSL/TLS VPN** needs only a web browser: the user logs in to an HTTPS portal on the headend and reaches selected internal web applications through links on that portal, with the headend acting as a proxy. Nothing is installed, which suits contractors or unmanaged devices, but access is limited to what the portal can proxy. Browser-based and TLS-based client VPNs are both called SSL VPNs, because they run over TLS on TCP 443, which firewalls rarely block. Exam items describe a requirement, such as no software may be installed or users need access to all internal applications, and ask you to pick the right type.",
  },
  {
    kind: 'bullets',
    title: 'Full tunnel vs split tunnel',
    bullets: [
      '**Full tunnel**: all traffic, including web browsing, uses the VPN',
      'Full tunnel: corporate security inspects everything',
      '**Split tunnel**: only corporate subnets use the VPN',
      'Split tunnel: Internet traffic exits the local connection',
      'Split saves headend bandwidth but bypasses central inspection',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.2,
      nodes: [
        { id: 'lap', icon: 'laptop', label: 'Remote user', x: 1.2, y: 2.1 },
        { id: 'hq', icon: 'firewall', label: 'HQ headend', x: 6, y: 0.9, tone: 'accent' },
        { id: 'corp', icon: 'server', label: 'Corporate apps', x: 8.8, y: 0.9 },
        { id: 'web', icon: 'internet', label: 'Internet sites', x: 6, y: 3.3 },
      ],
      links: [
        { from: 'lap', to: 'hq', label: 'VPN: corporate traffic', style: 'dashed', tone: 'accent' },
        { from: 'hq', to: 'corp' },
        { from: 'lap', to: 'web', label: 'split: direct', style: 'dotted' },
        { from: 'hq', to: 'web', label: 'full: via HQ', style: 'dashed' },
      ],
    },
    notes:
      "Once a remote-access tunnel is up, the headend tells the client which traffic belongs in the tunnel. With a **full tunnel**, the client sends everything through the VPN, including web browsing and streaming. The advantage is control: all traffic passes through the corporate firewall, web proxy and IPS, so the same security policy applies at home as in the office. The downside is load and latency, because Internet traffic travels to headquarters and back out again. With a **split tunnel**, the headend pushes a list of corporate subnets; only traffic to those networks enters the tunnel, while everything else goes directly to the Internet from the user's local connection. That saves headend bandwidth and improves performance for cloud services, but traffic outside the tunnel is not inspected by corporate security. Many organizations use split tunneling selectively, for example sending trusted collaboration traffic directly while keeping everything else in the tunnel. On the exam, match the requirement: inspecting everything means full tunnel, while conserving headend bandwidth means split tunnel.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: VPNs',
    body: '**ESP (IP 50)** encrypts; **AH (IP 51)** only authenticates. Tunnel mode hides the original IP header; transport mode does not.',
    bullets: [
      'Site-to-site = gateways, **transparent to hosts**; remote access = client or browser',
      'IKE uses **UDP 500** (4500 with NAT-T); ESP and AH are IP protocols, not ports',
      'AES = confidentiality; SHA = integrity; DH = key exchange; PSK/certificates = authentication',
      'Plain IPsec carries no multicast: use **GRE over IPsec** for routing protocols',
      'GRE alone (IP 47) is **not encrypted**',
      'DMVPN = mGRE + NHRP + IPsec',
      'Clientless VPN = browser only, limited access',
    ],
    notes:
      "These are the VPN facts that most often decide an exam question. First, ESP versus AH: ESP encrypts and authenticates, AH only authenticates, and they are IP protocols 50 and 51, not TCP or UDP ports. AH also breaks through NAT because it authenticates the outer IP header. Second, tunnel versus transport mode: tunnel mode encrypts the original IP header and adds a new one, which is why it is used between gateways, while transport mode keeps the original header and is typical for GRE over IPsec. Third, map each building block to its purpose: AES for confidentiality, SHA for integrity, Diffie-Hellman for key exchange, pre-shared keys or certificates for peer authentication, and sequence numbers for anti-replay. Fourth, IKE runs on UDP 500 and moves to UDP 4500 when NAT is detected. Fifth, plain IPsec cannot carry multicast, so routing protocols need GRE over IPsec, and GRE by itself provides no security at all. Finally, site-to-site VPNs are transparent to hosts, while remote-access VPNs need a client or, for clientless access, a browser.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'VPN goals: confidentiality, integrity, authentication, anti-replay',
      'Site-to-site: gateways, transparent; remote access: client or browser',
      'IKE (UDP 500/4500) negotiates; ESP (IP 50) or AH (IP 51) protects',
      'Tunnel mode hides the original header; transport mode keeps it',
      'Building blocks: AES, SHA-2, Diffie-Hellman, PSK or certificates',
      'GRE over IPsec for multicast and routing; DMVPN for scale',
      'Full vs split tunnel; full client vs clientless',
    ],
    notes:
      "A VPN turns an untrusted network into a private path by delivering four services: confidentiality, integrity, authentication and anti-replay. Site-to-site VPNs connect networks through gateways and are invisible to hosts; remote-access VPNs connect individual users through Cisco Secure Client or, in the clientless case, a browser portal, using TLS or IPsec with IKEv2. IPsec is a framework: IKE on UDP 500 (UDP 4500 with NAT traversal) authenticates the peers with pre-shared keys or certificates, runs Diffie-Hellman and builds security associations, while ESP (IP protocol 50) or AH (IP protocol 51) protects the data. ESP encrypts and authenticates; AH only authenticates and breaks through NAT. Tunnel mode wraps the whole original packet behind a new header between gateways, and transport mode protects only the payload. Because plain IPsec cannot carry multicast, GRE over IPsec gives you a routable, encrypted tunnel for OSPF or EIGRP, and DMVPN scales that idea to hundreds of sites. Finally, choose a full tunnel to inspect all remote traffic, or a split tunnel to save bandwidth.",
  },
];

export default slides;
