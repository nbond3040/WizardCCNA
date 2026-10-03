import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Three security functions every WLAN must provide', back: '**Authentication** (who may join), **encryption** or privacy (who can read frames) and **message integrity** (detect tampering).' },
  { id: 'f2', front: 'Open System authentication', back: 'No credential check: any client that asks is authenticated. By itself it provides **no encryption**; often paired with a web portal.' },
  { id: 'f3', front: 'WEP cipher and key lengths', back: '**RC4** stream cipher with a static key of **40 or 104 bits** plus a 24-bit IV (marketed as 64-bit and 128-bit WEP).' },
  { id: 'f4', front: 'Three reasons WEP is insecure', back: 'A **static** shared key, a short 24-bit IV sent in clear that repeats, and a non-cryptographic **CRC-32** integrity check.' },
  { id: 'f5', front: 'WEP Shared Key authentication', back: 'AP sends a clear-text challenge; the client returns it encrypted with the WEP key. The captured pair reveals keystream, so it is **weaker** than Open System.' },
  { id: 'f6', front: 'WPA encryption protocol', back: '**TKIP** (Temporal Key Integrity Protocol): RC4 with per-packet keys, a 48-bit replay counter and the Michael **MIC**.' },
  { id: 'f7', front: 'Why TKIP could run on WEP-era hardware', back: 'It reused the existing RC4 engine, so older adapters only needed a **firmware upgrade**.' },
  { id: 'f8', front: 'WPA2: standard and mandatory cipher', back: 'The ratified **IEEE 802.11i** amendment (2004); mandatory **AES-CCMP** with 128-bit keys.' },
  { id: 'f9', front: 'CCMP: which part encrypts and which part checks integrity?', back: 'AES **counter mode** encrypts; **CBC-MAC** produces the message integrity check.' },
  { id: 'f10', front: 'SAE', back: '**Simultaneous Authentication of Equals**: the WPA3-Personal (Dragonfly) handshake that replaces PSK and resists offline dictionary attacks.' },
  { id: 'f11', front: 'Cipher the CCNA associates with WPA3', back: '**GCMP** (Galois/Counter Mode Protocol); AES-GCMP-256 in the 192-bit Enterprise mode. CCMP-128 remains the baseline.' },
  { id: 'f12', front: 'PMF', back: '**Protected Management Frames** (IEEE 802.11w): rejects forged deauthentication and disassociation frames. Optional in WPA2, **mandatory in WPA3**.' },
  { id: 'f13', front: 'Forward secrecy (WPA3)', back: 'Each session key is independent, so a password leaked later cannot decrypt traffic captured earlier.' },
  { id: 'f14', front: 'Wi-Fi Enhanced Open (OWE)', back: 'Opportunistic Wireless Encryption: a Diffie-Hellman exchange gives each client a unique key on a passwordless SSID. Encrypts, but **does not authenticate**.' },
  { id: 'f15', front: 'Personal-mode authentication by generation', back: 'WPA and WPA2: **PSK**. WPA3: **SAE**. Either way, one secret is shared by all users.' },
  { id: 'f16', front: 'WPA2 passphrase length', back: '**8–63 ASCII characters**, or the raw 256-bit key entered as **64 hex digits**.' },
  { id: 'f17', front: 'Enterprise mode', back: '**802.1X/EAP** with a RADIUS server: individual credentials, per-user keys, per-user revocation and policy.' },
  { id: 'f18', front: '802.1X supplicant', back: 'Software on the client device (for example the Windows supplicant or Cisco Secure Client) that presents credentials.' },
  { id: 'f19', front: '802.1X authenticator on a Cisco centralized WLAN', back: 'The **WLC**: it blocks the client except for EAPOL and relays EAP to RADIUS. (In autonomous designs, the AP.)' },
  { id: 'f20', front: '802.1X authentication server', back: 'The **RADIUS** server, such as Cisco ISE, that validates credentials and returns Access-Accept or Access-Reject.' },
  { id: 'f21', front: 'EAPOL', back: '**EAP over LAN**: carries EAP between supplicant and authenticator; the authenticator re-encapsulates EAP in RADIUS.' },
  { id: 'f22', front: 'RADIUS ports', back: 'UDP **1812** for authentication and UDP **1813** for accounting (legacy 1645/1646).' },
  { id: 'f23', front: 'LEAP', back: 'Lightweight EAP, Cisco proprietary: username/password with mutual challenges and dynamic WEP keys. **Deprecated**: open to dictionary attacks.' },
  { id: 'f24', front: 'EAP-FAST', back: 'Flexible Authentication via Secure Tunneling (Cisco): a **PAC** (Protected Access Credential) builds the tunnel; no certificates required.' },
  { id: 'f25', front: 'PEAP', back: 'Protected EAP: **server certificate** only; a TLS tunnel protects inner **EAP-MSCHAPv2** or **EAP-GTC**.' },
  { id: 'f26', front: 'EAP-TLS', back: 'Certificates on **both** client and server, no passwords. The strongest method, but it needs a PKI.' },
  { id: 'f27', front: 'EAP-TTLS', back: 'Tunneled TLS: a server certificate builds a tunnel that can carry legacy inner methods (PAP, CHAP, MS-CHAPv2) or an EAP method.' },
  { id: 'f28', front: 'Purpose of the 4-way handshake', back: 'Uses the PMK plus the ANonce and SNonce to derive the **PTK** (unicast keys) and deliver the **GTK** (broadcast/multicast keys).' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which method replaces the pre-shared key handshake in WPA3-Personal?',
    options: ['SAE', 'TKIP', 'EAP-TLS', 'OWE'],
    answer: 0,
    difficulty: 1,
    explanation:
      'WPA3-Personal uses **SAE** (Simultaneous Authentication of Equals), which resists offline dictionary attacks. TKIP is the WPA encryption protocol, EAP-TLS is an Enterprise (802.1X) method, and OWE encrypts open networks that have no password at all.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two characteristics made WEP insecure? (Choose two.)',
    options: [
      'A static key shared by every user',
      'A 24-bit IV that repeats quickly',
      'Mandatory 802.1X authentication',
      'AES-CCMP encryption',
      'Protected Management Frames',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'WEP used one **static** RC4 key for everyone and a tiny **24-bit IV** sent in clear, so IVs repeat and the key can be recovered. WEP had no 802.1X requirement, never used AES-CCMP (that is WPA2) and had no management-frame protection.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'In 802.1X, what is the name of the role played by the software on the client device that presents credentials? (one word)',
    answers: ['supplicant', 'the supplicant', '802.1X supplicant'],
    placeholder: 'role name',
    difficulty: 1,
    explanation:
      'The **supplicant** is the client software. The authenticator (the WLC on a centralized Cisco WLAN) relays EAP and enforces access, and the authentication server (RADIUS, such as ISE) validates the credentials.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each 802.1X term to its description.',
    pairs: [
      { left: 'Supplicant', right: 'Client software that requests access' },
      { left: 'Authenticator', right: 'WLC that relays EAP and enforces the result' },
      { left: 'Authentication server', right: 'RADIUS server that validates credentials' },
      { left: 'EAPOL', right: 'Carries EAP between the client and the authenticator' },
    ],
    difficulty: 1,
    explanation:
      'The supplicant asks, the authenticator relays and enforces, and the authentication server decides. EAPOL is the encapsulation on the client side; RADIUS carries EAP between the authenticator and the server.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'Which EAP method uses a Protected Access Credential (PAC) to build its tunnel?',
    options: ['EAP-FAST', 'PEAP', 'EAP-TLS', 'LEAP'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**EAP-FAST** uses a PAC instead of certificates. PEAP builds its tunnel with a server certificate, EAP-TLS uses certificates on both sides, and LEAP uses no tunnel at all.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'What does Protected Management Frames (PMF) protect against?',
    options: [
      'Spoofed deauthentication and disassociation frames',
      'Offline dictionary attacks against a pre-shared key',
      'Clients that connect without a certificate',
      'Eavesdropping on data frames',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'PMF (802.11w) authenticates management frames so forged **deauthentication/disassociation** frames are rejected. Offline dictionary attacks are countered by SAE, certificates are an EAP-TLS matter, and data-frame privacy comes from the cipher (CCMP/GCMP).',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'A company must be able to revoke one departing employee\'s Wi-Fi access without changing the configuration of any other device. Which approach meets the requirement?',
    options: [
      'WPA2-Enterprise with 802.1X and a RADIUS server',
      'WPA2-Personal with a longer passphrase',
      'WPA3-Personal with SAE',
      'Open authentication with MAC filtering',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '**Enterprise** mode gives each user individual credentials checked by RADIUS, so one account can be disabled alone. Both Personal options share one secret that would have to be changed on every device, and MAC filtering is easily bypassed by spoofing an allowed MAC address.',
  },
];
