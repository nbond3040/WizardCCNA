import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Wireless Security Protocols',
    subtitle: 'WEP, WPA, WPA2 and WPA3: authentication, encryption and integrity on the air',
    notes:
      "Wired Ethernet has a natural security boundary: an attacker must reach a physical switch port. Wi-Fi has no such boundary, because every frame is a radio transmission that anyone in range can capture. This deck explains how 802.11 networks answer three questions: **who may join** (authentication), **who can read the data** (encryption) and **was the data changed in transit** (message integrity). You will follow the history from the broken **WEP** era through **WPA**, **WPA2** and **WPA3**, compare **Personal** and **Enterprise** modes, learn the three 802.1X roles, and meet the EAP methods that exam questions love to compare. The material maps to CCNA v1.1 exam topic 5.9 (describe wireless security protocols: WPA, WPA2 and WPA3) and to domain 4 of the v2.0 blueprint. Nothing in this deck is specific to only one exam version, so everything here applies to both.",
  },
  {
    kind: 'bullets',
    title: 'Why Wi-Fi needs its own security',
    bullets: [
      'Radio frames leave the building: **anyone in range** can capture them',
      'No physical port to lock; association replaces plugging in',
      {
        text: 'Classic wireless threats',
        sub: [
          'Eavesdropping on unencrypted frames',
          'Rogue APs and evil twins imitating your SSID',
          'Forged deauthentication frames',
          'Tampering with or replaying captured frames',
        ],
      },
      '==Every WLAN needs authentication, encryption and integrity==',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4,
      nodes: [
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'SSID CORP', x: 4.8, y: 1.2 },
        { id: 'pc', icon: 'laptop', label: 'Employee', x: 1.8, y: 3 },
        { id: 'bad', icon: 'attacker', label: 'Eavesdropper', sub: 'parking lot', x: 8.4, y: 3, tone: 'bad' },
      ],
      links: [
        { from: 'pc', to: 'ap', style: 'wireless' },
        { from: 'ap', to: 'bad', style: 'wireless', tone: 'bad', label: 'overheard', arrow: 'forward' },
      ],
      groups: [{ label: 'Office building', x: 0.4, y: 0.3, w: 6.4, h: 3.4, tone: 'muted' }],
    },
    notes:
      "On a switched LAN an attacker needs physical access to a port, and features such as port security or 802.1X on the switch port control who gets in. A WLAN broadcasts its frames into the air, so the 'port' is simply being within radio range, which often includes the parking lot or the floor above. That creates four families of threats. **Eavesdropping** means capturing and reading frames. **Impersonation** means a rogue AP or 'evil twin' advertising your SSID so that clients connect to the attacker instead. **Management-frame attacks** use forged deauthentication frames to knock clients off the network, often to force a reconnection so the attacker can capture a key handshake. **Tampering and replay** means modifying or re-sending captured frames. The countermeasures map onto three security goals: strong authentication (ideally mutual, so the client verifies the network too), encryption of every data frame, and a cryptographic integrity check. Keep those three goals in mind, because every protocol in this deck is judged by how well it delivers each one.",
  },
  {
    kind: 'table',
    title: 'Authentication, encryption and integrity',
    columns: ['Goal', 'Question it answers', 'Weak / legacy', 'Strong / current'],
    rows: [
      ['**Authentication**', 'Who may join, and is this the real network?', 'Open System, WEP Shared Key', 'SAE, 802.1X/EAP with RADIUS'],
      ['**Encryption** (privacy)', 'Who can read the frames?', 'WEP (RC4), TKIP', 'AES-CCMP, AES-GCMP'],
      ['**Message integrity**', 'Was the frame altered or replayed?', 'WEP CRC-32 ICV, TKIP Michael MIC', 'CCMP (CBC-MAC), GCMP (GMAC)'],
    ],
    caption: 'Modern ciphers deliver encryption and integrity together (authenticated encryption).',
    notes:
      "Wireless security is usually broken into three functions, and exam questions often ask you to classify a mechanism into one of them. **Authentication** decides whether a client may associate and, ideally, lets the client verify the network as well; mutual authentication is what defeats rogue APs. **Encryption** (privacy) scrambles the payload of each data frame so that eavesdroppers see only ciphertext. **Message integrity** adds a cryptographic check value, a **MIC** (message integrity check), calculated from the frame contents and a secret key; the receiver recomputes it and discards any frame that does not match, which blocks tampering and forgery. WEP's integrity check was a plain **CRC-32**, which detects transmission errors but not attackers: someone can flip bits in a frame and simply fix up the CRC. Modern ciphers such as CCMP and GCMP are authenticated-encryption modes, so one protocol delivers both encryption and integrity, which is why they appear in two rows of the table.",
  },
  {
    kind: 'diagram',
    title: 'Open System authentication',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'laptop' },
        { id: 'ap', label: 'AP', icon: 'ap' },
      ],
      steps: [
        { from: 'c', to: 'ap', label: 'Probe Request', sub: 'Is SSID GUEST here?' },
        { from: 'ap', to: 'c', label: 'Probe Response', sub: 'SSID, rates, security capabilities' },
        { from: 'c', to: 'ap', label: '802.11 Authentication (Open System)', sub: 'no credentials sent' },
        { from: 'ap', to: 'c', label: 'Authentication: success', tone: 'good' },
        { from: 'c', to: 'ap', label: 'Association Request' },
        { from: 'ap', to: 'c', label: 'Association Response', sub: 'client is now joined' },
        { note: 'With no other protection, data frames travel in clear text', tone: 'bad' },
      ],
    },
    caption: 'Open System authentication accepts every client; it only completes the 802.11 state machine.',
    notes:
      "Every 802.11 client, even on the most secure WLAN, passes through the same state machine: discover the network through beacons or probes, perform **802.11 authentication**, then **associate**. With **Open System authentication** the authentication step is a formality: the client asks to authenticate and the AP answers 'success' without checking any credential. WPA2 networks also begin with this Open System exchange and perform their real authentication afterwards (the PSK handshake or 802.1X); WPA3-Personal is the exception, because its SAE handshake is carried inside the 802.11 authentication frames themselves. When open authentication is the only protection, anyone can join and every data frame travels in clear text. Hotels and coffee shops typically combine an open SSID with **web authentication**, a captive portal that asks for a code or acceptance of the terms of use. The portal controls access, but it does not encrypt the radio link. For the exam: open authentication means no identity check and, by itself, no encryption.",
  },
  {
    kind: 'bullets',
    title: 'WEP: RC4 with a static key',
    bullets: [
      'Original 802.11 privacy mechanism: **Wired Equivalent Privacy**',
      '**RC4** stream cipher; key of **40 or 104 bits** plus a 24-bit IV',
      'One **static key** typed into every client and AP',
      'IV sent in clear and too short, so IVs repeat quickly',
      'Integrity via **CRC-32** ICV, which is not cryptographic',
      '==Crackable in minutes with free tools: never use WEP==',
    ],
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bits',
      fields: [
        { label: 'IV', size: 24, sub: 'sent in clear text', tone: 'bad' },
        { label: 'Shared WEP key', size: 104, sub: 'static, same for all users', tone: 'accent' },
      ],
      caption: '24 + 104 = 128-bit RC4 seed ("128-bit WEP"); 24 + 40 = 64-bit WEP',
    },
    notes:
      "**WEP** (Wired Equivalent Privacy) was part of the original 802.11 standard and aimed to give radio links the privacy of a cable. It uses the **RC4** stream cipher. Each frame is encrypted with a seed built from a 24-bit **initialization vector (IV)** plus the secret key, which is either **40 bits** or **104 bits** long; with the IV added, vendors marketed these as '64-bit' and '128-bit' WEP. Three design flaws killed it. First, the key is **static**: it is typed manually into every device, shared by all users and rarely changed. Second, the 24-bit IV is far too small and travels in clear text, so IVs start repeating quickly on a busy WLAN, and statistical attacks recover the key from enough captured frames, in minutes with free tools. Third, the integrity check is a CRC-32 that an attacker can recompute after modifying a frame. On the exam, a protocol described as using RC4 with static keys is WEP, and WEP is always the insecure, deprecated answer.",
  },
  {
    kind: 'diagram',
    title: 'WEP Shared Key authentication',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'laptop' },
        { id: 'ap', label: 'AP', icon: 'ap' },
        { id: 'x', label: 'Eavesdropper', icon: 'attacker' },
      ],
      steps: [
        { from: 'c', to: 'ap', label: 'Authentication request (Shared Key)' },
        { from: 'ap', to: 'c', label: 'Challenge text', sub: 'random value sent in clear text' },
        { from: 'c', to: 'ap', label: 'Challenge encrypted with the WEP key' },
        { from: 'ap', to: 'c', label: 'Success if it decrypts correctly', tone: 'good' },
        { note: 'Eavesdropper XORs clear challenge with encrypted reply = RC4 keystream', tone: 'bad' },
      ],
    },
    caption: 'Plaintext XOR ciphertext = keystream: the handshake hands attackers what they need.',
    notes:
      "WEP offered a second option, **Shared Key authentication**, which sounds stronger than open authentication but is actually weaker. The AP sends the client a random **challenge** in clear text; the client encrypts it with the WEP key and returns it; the AP decrypts the response and, if it matches, authenticates the client. The problem is that an eavesdropper sees both the clear-text challenge and the encrypted response. Because RC4 is a stream cipher, the ciphertext is simply the plaintext XOR the keystream, so XORing the two captured values reveals a valid **keystream** for that IV. That is enough to forge a correct response and authenticate without knowing the key, and it gives a head start toward recovering the key itself. Open System authentication combined with WEP encryption at least did not leak that material. The exam may describe the mechanism ('the AP sends a challenge that the client encrypts with the shared key') and ask you to name it or explain why it is insecure. The shared key is the same static key used for encryption, so authentication and privacy fail together.",
  },
  {
    kind: 'bullets',
    title: 'WPA: the TKIP stopgap',
    bullets: [
      '**Wi-Fi Alliance**, 2003, based on a draft of IEEE **802.11i**',
      '**TKIP**: Temporal Key Integrity Protocol, still RC4 underneath',
      {
        text: 'TKIP fixes over WEP',
        sub: [
          'Per-packet key mixing: no two frames share a key',
          '48-bit sequence counter blocks replayed frames',
          '**MIC** (Michael) replaces CRC-32 for integrity',
        ],
      },
      'Ran on WEP-era hardware after a **firmware upgrade**',
      'Introduced Personal (PSK) and Enterprise (802.1X) modes',
      '==WPA = TKIP + MIC; TKIP is now deprecated==',
    ],
    notes:
      "When WEP collapsed in the early 2000s, the IEEE started work on 802.11i, a proper fix, but it would take years and needed new hardware. The **Wi-Fi Alliance**, the industry group that certifies interoperability, shipped an interim certification in 2003 called **Wi-Fi Protected Access (WPA)**, based on a draft of 802.11i. Its encryption protocol, **TKIP** (Temporal Key Integrity Protocol), was designed to run on the RC4 engines already inside WEP adapters, so existing devices only needed new firmware. TKIP wraps RC4 with important fixes: it mixes a fresh key for every packet, uses a 48-bit sequence counter so replayed frames are rejected, and adds a real **message integrity check**, called Michael, in place of WEP's CRC-32. WPA also introduced the two modes still used today: Personal with a pre-shared key and Enterprise with 802.1X. TKIP bought time, but it is now deprecated, and 802.11n and later high-throughput data rates cannot be used with WEP or TKIP at all. On the exam, pair **WPA with TKIP** and the **MIC**.",
  },
  {
    kind: 'bullets',
    title: 'WPA2: IEEE 802.11i with AES-CCMP',
    bullets: [
      'Wi-Fi Alliance, 2004: the ratified **IEEE 802.11i** amendment',
      'Mandatory encryption: **AES-CCMP** with 128-bit keys',
      { text: 'CCMP does two jobs', sub: ['AES **counter mode**: encryption', '**CBC-MAC**: message integrity check'] },
      'Needed AES-capable hardware, not just firmware',
      'Personal (PSK) or Enterprise (802.1X/EAP)',
      '==WPA2 = AES-CCMP: the pairing to remember==',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'PSK or 802.1X', sub: 'Personal / Enterprise', shape: 'pill' },
        { id: 'b', label: 'PMK', sub: 'pairwise master key' },
        { id: 'c', label: '4-way handshake', sub: 'nonces give PTK + GTK', tone: 'accent' },
        { id: 'd', label: 'AES-CCMP', sub: 'encrypt + MIC per frame', shape: 'round' },
      ],
    },
    notes:
      "WPA2 is the Wi-Fi Alliance certification of the finished **IEEE 802.11i** amendment, released in 2004. Its mandatory encryption protocol is **CCMP** (Counter Mode with Cipher Block Chaining Message Authentication Code Protocol), built on **AES** with 128-bit keys. The long name tells you both functions: AES in counter mode encrypts, and CBC-MAC produces the message integrity check. Because AES needed new silicon, WPA2 was a hardware generation change rather than a firmware patch. Keying works the same way in both modes, as the flow shows. The client and AP start with a **PMK** (pairwise master key). In Personal mode the PMK is derived from the passphrase and the SSID; in Enterprise mode it comes out of the successful 802.1X/EAP exchange, so it is unique per user and per session. The **4-way handshake** then turns the PMK into fresh working keys: the **PTK** (pairwise transient key) for unicast traffic and the **GTK** (group temporal key) for broadcast and multicast. WPA2 remains very common, but its Personal mode has a weakness that WPA3 fixes.",
  },
  {
    kind: 'diagram',
    title: 'The 4-way handshake and the WPA2-PSK weakness',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'ap', label: 'AP / WLC (authenticator)', icon: 'ap' },
        { id: 'c', label: 'Client (supplicant)', icon: 'laptop' },
      ],
      steps: [
        { note: 'Both sides already hold the PMK (from the PSK or from 802.1X)' },
        { from: 'ap', to: 'c', label: 'Message 1: ANonce' },
        { from: 'c', to: 'ap', label: 'Message 2: SNonce + MIC', sub: 'client derives the PTK' },
        { from: 'ap', to: 'c', label: 'Message 3: install keys, GTK + MIC', sub: 'AP derived the same PTK' },
        { from: 'c', to: 'ap', label: 'Message 4: ACK', tone: 'good' },
        { note: 'Captured PSK handshake = offline guessing of the passphrase', tone: 'bad' },
      ],
    },
    caption: 'The PMK never crosses the air; both sides derive the same keys independently.',
    notes:
      "The 4-way handshake is why the pre-shared key itself is never transmitted. Both sides already know the PMK. The AP sends a random number, the **ANonce**; the client generates its own **SNonce**, combines the PMK, both nonces and both MAC addresses into the **PTK**, and replies with its SNonce protected by a MIC. The AP computes the same PTK and checks the MIC; a match proves the client knows the PMK without revealing it. Message 3 tells the client to install the keys and carries the **GTK**, and message 4 confirms. Here is the weakness of **WPA2-Personal**: everything except the PMK is visible in those four frames, and the PMK depends only on the passphrase and SSID. An attacker who captures one handshake, often by forcing a reconnection with spoofed deauthentication frames, can test passphrase guesses offline at high speed until a MIC matches. This is an **offline dictionary attack**. Long random passphrases resist it; short or common ones fall quickly. WPA2-Enterprise avoids the problem because its PMK comes from a per-session EAP exchange.",
  },
  {
    kind: 'bullets',
    title: 'WPA3: SAE, GCMP, PMF and forward secrecy',
    bullets: [
      'Wi-Fi Alliance, **2018**: the current generation',
      '**SAE** replaces PSK in Personal mode: no offline dictionary attack',
      '**Forward secrecy**: a leaked password cannot decrypt old captures',
      '**PMF** (802.11w) is **mandatory**: forged deauth frames rejected',
      '**GCMP**: AES-GCMP-256 in the 192-bit Enterprise mode',
      'Enterprise still uses 802.1X/EAP with RADIUS',
      '**Transition mode**: WPA2 and WPA3 clients on one SSID',
    ],
    notes:
      "**WPA3**, announced by the Wi-Fi Alliance in 2018, targets the weaknesses left in WPA2. Its headline feature is **SAE** (Simultaneous Authentication of Equals), a password-authenticated key exchange based on the Dragonfly handshake that replaces the PSK method in Personal mode. Every guess requires a live exchange with the AP, so an attacker cannot capture a handshake and grind through guesses offline. SAE also provides **forward secrecy**: each session key is independent, so learning the password tomorrow does not unlock traffic captured today. WPA3 makes **Protected Management Frames** (IEEE 802.11w) mandatory, so spoofed deauthentication and disassociation frames are rejected. For encryption, the CCNA material associates WPA3 with **GCMP** (Galois/Counter Mode Protocol): AES-GCMP-256 is used in the WPA3-Enterprise 192-bit mode, while AES-CCMP-128 remains the minimum for ordinary WPA3-Personal and WPA3-Enterprise. Expect exam questions to tie WPA3 to SAE, PMF, forward secrecy and GCMP. During a migration, **transition mode** lets a single SSID accept both WPA2-PSK and WPA3-SAE clients.",
  },
  {
    kind: 'compare',
    title: 'Open vs Enhanced Open (OWE)',
    left: {
      heading: 'Open (legacy)',
      bullets: ['No authentication', '**No encryption**: frames readable by anyone', 'Often paired with a web portal', 'Portal controls access, not privacy'],
      tone: 'bad',
    },
    right: {
      heading: 'Enhanced Open (OWE)',
      bullets: ['Still no password or login', '**Diffie-Hellman** exchange at association', 'Unique encryption key **per client**', 'Stops passive eavesdropping', 'Does not prove the AP is genuine'],
      tone: 'good',
    },
    notes:
      "Public hotspots have a dilemma: they want anyone to connect without a password, but open networks leave every frame readable. **Wi-Fi Enhanced Open**, a Wi-Fi Alliance certification introduced alongside WPA3, solves the privacy half of that problem with **OWE** (Opportunistic Wireless Encryption, RFC 8110). During association the client and AP perform a **Diffie-Hellman** key exchange and derive a unique pairwise key, then run the normal 4-way handshake, so each client's traffic is encrypted with its own key even though nobody typed a password. OWE does not authenticate anyone: the AP does not know who the user is, and the client cannot tell whether the AP is legitimate, so an evil twin can still offer OWE. It stops **passive** sniffing, not active impersonation, and it can be combined with a web portal for access control. On the exam, match 'encryption without a password on an open guest network' to Enhanced Open or OWE, and do not confuse it with WPA3-Personal, which requires a shared password for SAE.",
  },
  {
    kind: 'table',
    title: 'WPA vs WPA2 vs WPA3',
    columns: ['Feature', 'WPA', 'WPA2', 'WPA3'],
    rows: [
      ['Introduced', '2003 (802.11i draft)', '2004 (IEEE 802.11i)', '2018'],
      ['Personal authentication', 'PSK', 'PSK', '**SAE**'],
      ['Enterprise authentication', '802.1X / EAP', '802.1X / EAP', '802.1X / EAP (192-bit option)'],
      ['Encryption and integrity', '**TKIP** + MIC (RC4)', '**AES-CCMP**', '**AES-GCMP** (CCMP-128 baseline)'],
      ['Protected Management Frames', 'No', 'Optional', '**Mandatory**'],
      ['Forward secrecy', 'No', 'No', '**Yes**'],
      ['Offline dictionary attack (Personal)', 'Vulnerable', 'Vulnerable', 'Resistant'],
    ],
    caption: 'All three support Personal and Enterprise; the cipher and Personal handshake tell them apart.',
    notes:
      "This is the table to memorize. Read it column by column and the story appears: **WPA** kept the RC4 engine but wrapped it in **TKIP** with the Michael MIC; **WPA2** replaced it with **AES-CCMP**; **WPA3** adds **GCMP**, swaps the PSK method for **SAE** and makes PMF mandatory. All three generations support both modes, a shared secret for homes and small offices (Personal) and 802.1X with a RADIUS server for organizations (Enterprise), so '802.1X support' never distinguishes them. What distinguishes them is the cipher and the Personal-mode handshake. Two precision points. WPA devices could optionally support AES-CCMP, and some references list it under WPA, but the defining WPA cipher is TKIP. WPA3 still permits CCMP-128; GCMP-256 is required only in the 192-bit Enterprise mode. Exam questions nevertheless use the simple pairings: **WPA with TKIP, WPA2 with CCMP, WPA3 with GCMP**, plus **WPA3 with SAE, PMF and forward secrecy**. If an answer lists TKIP as the WPA2 cipher or PSK as the WPA3-Personal method, treat it as a distractor.",
  },
  {
    kind: 'compare',
    title: 'Personal vs Enterprise mode',
    left: {
      heading: 'Personal: WPA2-PSK / WPA3-SAE',
      bullets: [
        'One secret shared by **all** users',
        'WPA2 passphrase: 8–63 ASCII chars or 64 hex',
        'No server: the AP/WLC checks the key',
        'Revoking one user means re-keying everyone',
        'Homes, small offices, simple IoT',
      ],
    },
    right: {
      heading: 'Enterprise: 802.1X',
      bullets: [
        '**Individual** credentials or certificates',
        '**RADIUS** server (e.g. Cisco ISE) decides',
        'Unique keys per user and session',
        'Disable one account without touching others',
        'Per-user VLAN, ACL and accounting',
      ],
      tone: 'accent',
    },
    notes:
      "Every WPA generation offers two authentication modes, and the exam expects you to know when each fits. **Personal** mode uses one secret shared by everyone: a **pre-shared key** in WPA and WPA2, or the password that feeds **SAE** in WPA3. A WPA2 passphrase is 8 to 63 ASCII characters, or the raw 256-bit key entered as 64 hexadecimal digits. Personal mode is simple because no server is needed, but it scales badly: if an employee leaves or a laptop is stolen, the only fix is to change the key on every device, and there is no record of which user did what. **Enterprise** mode, the Wi-Fi Alliance name for 802.1X authentication, gives every user or device its own identity, a username and password or a certificate, checked by a **RADIUS** authentication server such as **Cisco ISE**. Each session gets its own keys, accounts can be disabled individually, and the server can return per-user policy such as a VLAN or ACL. Exam cue: 'each user must authenticate with individual credentials' or 'centralized authentication' means Enterprise mode with 802.1X.",
  },
  {
    kind: 'diagram',
    title: '802.1X roles on a Cisco WLAN',
    diagram: {
      type: 'topology',
      width: 11,
      height: 4,
      nodes: [
        { id: 'sup', icon: 'laptop', label: 'Supplicant', sub: 'client software', x: 1, y: 1.8 },
        { id: 'ap', icon: 'ap', label: 'Lightweight AP', sub: 'tunnels to the WLC', x: 3.9, y: 1.8 },
        { id: 'wlc', icon: 'wlc', label: 'WLC', sub: 'Authenticator', x: 6.8, y: 1.8, tone: 'accent' },
        { id: 'ise', icon: 'server', label: 'Cisco ISE', sub: 'Authentication server', x: 9.9, y: 1.8 },
      ],
      links: [
        { from: 'sup', to: 'ap', style: 'wireless', label: 'EAPOL' },
        { from: 'ap', to: 'wlc', label: 'CAPWAP' },
        { from: 'wlc', to: 'ise', label: 'RADIUS', toLabel: 'UDP 1812' },
      ],
      annotations: [{ x: 5.5, y: 3.4, text: 'Until authentication succeeds, only EAPOL frames are allowed' }],
    },
    caption: 'The authenticator relays EAP and enforces the result; it never judges the credentials.',
    notes:
      "802.1X defines three roles, and exam questions often show a topology and ask you to name them. The **supplicant** is software on the client, such as the native Windows or macOS supplicant or Cisco Secure Client, that presents credentials. The **authenticator** is the network device that controls the door: it blocks the client, except for EAP messages, until authentication succeeds. In an autonomous-AP design the AP is the authenticator; in Cisco's centralized design with lightweight APs, the **WLC** plays the role, because the AP simply tunnels the client's frames to the controller inside CAPWAP. The **authentication server** is a RADIUS server such as **Cisco ISE** that checks the credentials, often against Active Directory, and makes the accept or reject decision. EAP messages travel as **EAPOL** (EAP over LAN) between supplicant and authenticator and are re-encapsulated in **RADIUS** (UDP 1812 for authentication, 1813 for accounting) between authenticator and server. The authenticator is a relay and enforcement point, not the judge; answers that say the WLC validates the password are distractors.",
  },
  {
    kind: 'diagram',
    title: 'An 802.1X/EAP exchange step by step',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 's', label: 'Supplicant', icon: 'laptop' },
        { id: 'a', label: 'WLC (authenticator)', icon: 'wlc' },
        { id: 'r', label: 'ISE (RADIUS)', icon: 'server' },
      ],
      steps: [
        { from: 's', to: 'a', label: 'Open System auth + association', sub: 'only EAPOL allowed so far' },
        { from: 'a', to: 's', label: 'EAP-Request/Identity' },
        { from: 's', to: 'a', label: 'EAP-Response/Identity', sub: 'e.g. alice@corp.example' },
        { from: 'a', to: 'r', label: 'RADIUS Access-Request (EAP inside)' },
        { note: 'EAP method runs end to end: TLS tunnel, certificates, inner credentials' },
        { from: 'r', to: 'a', label: 'RADIUS Access-Accept + keying material', tone: 'good' },
        { from: 'a', to: 's', label: 'EAP-Success, then 4-way handshake', tone: 'accent' },
      ],
    },
    caption: 'EAP rides in EAPOL on the air and in RADIUS on the wire.',
    notes:
      "Here is the full sequence you should be able to put in order. The client first completes ordinary 802.11 Open System authentication and association; at this point it is connected to the radio, but the authenticator allows only EAPOL frames through. The authenticator asks for an identity with **EAP-Request/Identity** (the client may also start the process with EAPOL-Start). The client's reply is wrapped into a **RADIUS Access-Request** and sent to the server. Now the chosen **EAP method** runs between supplicant and server while the authenticator just relays: for PEAP or EAP-TTLS the server proves itself with a certificate and a TLS tunnel forms; for EAP-TLS both sides exchange certificates. If the credentials are good, the server returns **Access-Accept** containing keying material, plus optional policy such as a VLAN, the authenticator sends **EAP-Success**, and both sides now hold a PMK. The **4-way handshake** then derives the encryption keys, and only after that does the client obtain an IP address with DHCP. Bad credentials produce Access-Reject and EAP-Failure.",
  },
  {
    kind: 'definitions',
    title: 'EAP methods you must know',
    terms: [
      { term: 'LEAP', def: 'Lightweight EAP: Cisco proprietary, username/password with mutual challenges, dynamic WEP keys. **Deprecated**.' },
      { term: 'EAP-FAST', def: 'Flexible Authentication via Secure Tunneling (Cisco): a **PAC** builds the tunnel; no certificates needed.' },
      { term: 'PEAP', def: 'Protected EAP: **server certificate** only; TLS tunnel protects inner EAP-MSCHAPv2 or EAP-GTC.' },
      { term: 'EAP-TTLS', def: 'Tunneled TLS: server certificate; tunnel can carry legacy PAP, CHAP, MS-CHAPv2 or an EAP method.' },
      { term: 'EAP-TLS', def: 'Certificates on **both** client and server; no passwords; strongest, but needs a PKI.' },
    ],
    notes:
      "EAP (Extensible Authentication Protocol) is a framework, not a single method: the 'extensible' part means many methods plug into it. The exam focuses on five. **LEAP** was Cisco's early answer to WEP: username and password with challenges in both directions and frequently changing WEP keys. It relies on MS-CHAP-style hashing, so captured exchanges can be attacked offline, and it is deprecated. **EAP-FAST**, also from Cisco, replaced LEAP. The server gives each client a **Protected Access Credential (PAC)**, a shared secret that can be provisioned automatically; the PAC builds a secure tunnel, and the user's credentials are checked inside it. **PEAP** has the server authenticate with a digital certificate, builds a TLS tunnel, and then authenticates the user inside it with **EAP-MSCHAPv2** (passwords) or **EAP-GTC** (generic token card, such as one-time passwords). **EAP-TTLS** works like PEAP but is more flexible about the inner method, supporting legacy PAP, CHAP and MS-CHAPv2 as well as EAP methods. **EAP-TLS** drops passwords entirely: server and client each present a certificate.",
  },
  {
    kind: 'table',
    title: 'EAP methods compared',
    columns: ['Method', 'Server proves identity with', 'Client proves identity with', 'Tunnel', 'Status'],
    rows: [
      ['LEAP', 'Password challenge', 'Username/password', 'None', 'Legacy: avoid'],
      ['EAP-FAST', 'PAC', 'Credentials inside the tunnel', 'PAC-based', 'Cisco, replaced LEAP'],
      ['PEAP', '**Certificate**', 'MSCHAPv2 or GTC inside the tunnel', 'TLS', 'Very common'],
      ['EAP-TTLS', '**Certificate**', 'PAP, CHAP, MSCHAPv2 or EAP inside', 'TLS', 'Flexible inner methods'],
      ['EAP-TLS', '**Certificate**', '==**Certificate**==', 'Not needed', 'Strongest; needs PKI'],
    ],
    caption: 'Only EAP-TLS requires a certificate on every client.',
    notes:
      "Use this table to answer the most common EAP question: **who needs a certificate?** Only **EAP-TLS** requires certificates on both sides. Each client needs its own certificate, which means running a public key infrastructure (PKI) and enrolling every device. That is more work, but there are no passwords to phish or guess, which makes EAP-TLS the strongest option and the usual choice for corporate-owned devices. **PEAP** and **EAP-TTLS** need a certificate only on the server; the client checks it, so users are not tricked into sending credentials to a rogue network, and then authenticates with a password or token inside the encrypted tunnel. **EAP-FAST** needs no certificates at all because the PAC does the tunnel-building job. **LEAP** uses neither certificates nor a tunnel and should not appear in new designs. A gotcha: if clients are set not to validate the PEAP server certificate, the protection against evil twins disappears, because the client will hand its inner credentials to any server. Exam phrasing to watch: 'certificates on both the client and the server' means EAP-TLS; 'Protected Access Credential' means EAP-FAST.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: wireless security',
    body: 'Pair each cipher with its generation and each EAP method with its certificate needs; most wrong answers mix them up.',
    bullets: [
      'WEP = **RC4** static key; WPA = **TKIP** + MIC; WPA2 = **AES-CCMP**; WPA3 = **GCMP**',
      'SAE replaces **PSK**; it is not an EAP method and uses no RADIUS',
      'PMF is **mandatory** in WPA3, optional in WPA2',
      'EAP-TLS: certificates on **both** sides; PEAP and EAP-TTLS: server only',
      'The **WLC** is the authenticator; ISE is the authentication server',
      'Enhanced Open encrypts but does **not** authenticate',
    ],
    notes:
      "These are the traps that catch prepared candidates. First, **cipher-to-generation pairing**: questions list TKIP, CCMP, GCMP and RC4 and ask which belongs to WPA2; it is CCMP, while TKIP belongs to WPA and RC4 to WEP (and underneath TKIP). Second, **SAE versus EAP**: SAE is the WPA3-Personal handshake between client and AP, with no RADIUS server, so never pick it for an Enterprise scenario. Third, **802.1X in every generation**: WPA, WPA2 and WPA3 all support Enterprise mode, so '802.1X support' alone never identifies WPA3. Fourth, **roles**: the WLC is the authenticator even though ISE makes the decision, and the supplicant is software on the client, not the user. Fifth, **certificates**: EAP-TLS on both sides, PEAP and EAP-TTLS on the server only, EAP-FAST uses a PAC, LEAP uses none. Finally, **open networks**: web authentication controls access but does not encrypt, while Enhanced Open encrypts but does not authenticate. Read every stem for the words 'personal', 'each user', 'certificate' and 'without a password'; they point straight to the answer.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Three goals: **authentication, encryption, integrity**',
      'Open System and WEP (RC4, static key, Shared Key) are insecure',
      'WPA/TKIP, then WPA2/AES-CCMP, then WPA3/SAE, GCMP, PMF',
      'Personal = one shared secret; Enterprise = 802.1X + RADIUS',
      'Supplicant, authenticator (WLC), authentication server (ISE)',
      'EAP: LEAP, EAP-FAST (PAC), PEAP, EAP-TTLS, EAP-TLS (two certificates)',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'w0', label: 'WEP', sub: 'RC4, 1997', tone: 'bad' },
        { id: 'w1', label: 'WPA', sub: 'TKIP + MIC, 2003', tone: 'warn' },
        { id: 'w2', label: 'WPA2', sub: 'AES-CCMP, 2004' },
        { id: 'w3', label: 'WPA3', sub: 'SAE + GCMP + PMF, 2018', tone: 'good' },
      ],
    },
    notes:
      "Let us pull the deck together. Wireless security is judged on three functions: **authentication**, **encryption** and **integrity**. Open authentication checks nothing, and WEP's static RC4 keys, tiny IVs and CRC-32 integrity check make it trivially breakable; its Shared Key authentication even leaks keystream. The Wi-Fi Alliance responded with **WPA** (TKIP and the Michael MIC on existing hardware), then **WPA2** (IEEE 802.11i and AES-CCMP), and then **WPA3** (SAE for Personal mode, forward secrecy, mandatory PMF, GCMP, and the companion Enhanced Open certification for passwordless hotspots). Every generation offers **Personal** mode with a shared secret and **Enterprise** mode with **802.1X**, where a supplicant talks EAPOL to an authenticator, usually the WLC, which relays to a RADIUS authentication server such as ISE. Finally, know the EAP methods by what they require: LEAP (legacy, passwords), EAP-FAST (a PAC), PEAP and EAP-TTLS (a server certificate plus inner credentials) and EAP-TLS (certificates on both sides). Next, you will see where each of these settings lives in the WLC GUI.",
  },
];
