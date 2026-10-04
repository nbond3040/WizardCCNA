import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which encryption and integrity protocol is mandatory in WPA2?',
    options: ['AES-CCMP', 'TKIP with the Michael MIC', 'RC4 with a 24-bit IV', 'AES-GCMP-256'],
    answer: 0,
    difficulty: 1,
    explanation:
      'WPA2 implements IEEE 802.11i and mandates **CCMP**: AES in counter mode for encryption plus CBC-MAC for integrity. TKIP with Michael is the WPA protocol, RC4 with a 24-bit IV is WEP, and GCMP-256 is associated with WPA3 (its 192-bit Enterprise mode).',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'An attacker records several hours of encrypted traffic from a WPA3-Personal WLAN. A month later, the WLAN password is leaked. Which WPA3 property prevents the attacker from decrypting the recorded traffic?',
    options: [
      'Forward secrecy provided by SAE',
      'Protected Management Frames',
      'The 802.1X authenticator role of the WLC',
      'Opportunistic Wireless Encryption',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'SAE gives WPA3-Personal **forward secrecy**: every session key is independent, so knowing the password later does not reveal keys used earlier. PMF protects management frames, not recorded data; there is no 802.1X in Personal mode; and OWE applies to passwordless open networks.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two features are part of WPA3? (Choose two.)',
    options: [
      'Simultaneous Authentication of Equals (SAE)',
      'Mandatory Protected Management Frames',
      'TKIP as the mandatory encryption cipher',
      'Shared Key challenge-response authentication',
      'LEAP for Personal mode authentication',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'WPA3 introduces **SAE** for Personal mode and makes **PMF** mandatory (it also adds forward secrecy and GCMP). TKIP is the deprecated WPA cipher, Shared Key authentication belongs to WEP, and LEAP is a legacy Cisco EAP method, not a Personal-mode mechanism.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each EAP method to its defining characteristic.',
    pairs: [
      { left: 'LEAP', right: 'Cisco-proprietary legacy method using username/password and dynamic WEP keys' },
      { left: 'EAP-FAST', right: 'Uses a Protected Access Credential (PAC) instead of certificates' },
      { left: 'PEAP', right: 'Server certificate and TLS tunnel protecting inner EAP-MSCHAPv2 or EAP-GTC' },
      { left: 'EAP-TLS', right: 'Requires certificates on both the client and the server' },
      { left: 'EAP-TTLS', right: 'Server certificate; the tunnel can carry legacy PAP or CHAP inner methods' },
    ],
    difficulty: 2,
    explanation:
      'LEAP is the old Cisco password method; EAP-FAST replaced it using a **PAC**; PEAP and EAP-TTLS both authenticate the server with a certificate, but only EAP-TTLS supports legacy inner methods such as PAP and CHAP; EAP-TLS is the only one that requires a **client certificate** as well.',
  },
  {
    id: 'e5',
    type: 'categorize',
    stem: 'Classify each characteristic as belonging to Personal mode or Enterprise mode.',
    categories: ['Personal', 'Enterprise'],
    items: [
      { text: 'One passphrase configured on every client', category: 0 },
      { text: 'SAE handshake between the client and the AP', category: 0 },
      { text: '8–63 character ASCII pre-shared key', category: 0 },
      { text: 'A RADIUS server such as Cisco ISE validates credentials', category: 1 },
      { text: 'Each user can be disabled individually', category: 1 },
      { text: 'EAP-TLS with client certificates', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Personal mode (WPA2-PSK or WPA3-SAE) relies on one shared secret checked by the AP/WLC, so there is no per-user identity. Enterprise mode uses 802.1X/EAP with a RADIUS server, which enables individual credentials or certificates and per-user revocation.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Employees authenticate to SSID CORP with PEAP. Which 802.1X role does WLC1 perform?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.5,
        nodes: [
          { id: 'pc', icon: 'laptop', label: 'Laptop', sub: 'PEAP user', x: 1, y: 1.8 },
          { id: 'ap', icon: 'ap', label: 'LAP1', sub: 'local mode', x: 3.7, y: 1.8 },
          { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: '10.1.100.10', x: 6.3, y: 1.8 },
          { id: 'ise', icon: 'server', label: 'ISE', sub: '10.1.100.20', x: 9, y: 1.8 },
        ],
        links: [
          { from: 'pc', to: 'ap', style: 'wireless', label: 'SSID CORP' },
          { from: 'ap', to: 'wlc', label: 'CAPWAP' },
          { from: 'wlc', to: 'ise', label: 'UDP 1812' },
        ],
      },
    },
    options: ['Authenticator', 'Supplicant', 'Authentication server', 'Certificate authority'],
    answer: 0,
    difficulty: 2,
    explanation:
      'With lightweight APs the **WLC** is the authenticator: it receives the client\'s EAPOL frames through the CAPWAP tunnel, relays EAP to ISE in RADIUS (UDP 1812) and enforces the result. The laptop is the supplicant, ISE is the authentication server, and a certificate authority issues certificates but is not one of the three 802.1X roles.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement correctly describes this wireless connection?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> netsh wlan show interfaces

There is 1 interface on the system:

    Name                   : Wi-Fi
    Description            : Intel(R) Wi-Fi 6 AX201 160MHz
    State                  : connected
    SSID                   : BRANCH-WLAN
    Network type           : Infrastructure
    Radio type             : 802.11ax
    Authentication         : WPA2-Personal
    Cipher                 : CCMP
    Connection mode        : Profile
    Channel                : 36
    Signal                 : 88%
    Profile                : BRANCH-WLAN`,
    },
    options: [
      'Frames are encrypted with AES, and every client on the SSID uses the same passphrase',
      'Each user was validated individually by a RADIUS server',
      'Frames are encrypted with RC4 through TKIP',
      'SAE is in use, so offline dictionary attacks against the passphrase are not possible',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**WPA2-Personal** means a pre-shared key common to all clients, and **CCMP** is AES-based encryption with integrity. RADIUS validation would appear as WPA2-Enterprise, TKIP would be shown in the Cipher field, and SAE belongs to WPA3-Personal; a captured WPA2-PSK handshake can still be attacked offline.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the steps of a WPA2-Enterprise connection on a Cisco WLAN in the correct order.',
    items: [
      'The client completes 802.11 Open System authentication and association',
      'The WLC sends an EAP-Request/Identity to the client',
      'The WLC forwards the client identity to the RADIUS server in an Access-Request',
      'The EAP method, such as PEAP, runs between the client and the RADIUS server',
      'The server returns Access-Accept and the WLC sends EAP-Success',
      'The 4-way handshake derives the encryption keys',
    ],
    difficulty: 2,
    explanation:
      'The client must first associate (only EAPOL is allowed at that point). The authenticator requests the identity, relays it to RADIUS, and the EAP method runs end to end. After Access-Accept and EAP-Success both sides hold a PMK, and the 4-way handshake turns it into the PTK and GTK. DHCP follows only after the keys are installed.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Which cipher does WEP use?',
    options: ['RC4', 'AES', 'GCMP', '3DES'],
    answer: 0,
    difficulty: 1,
    explanation:
      'WEP uses the **RC4** stream cipher with a static 40- or 104-bit key and a 24-bit IV. AES is used by CCMP (WPA2) and GCMP (WPA3); 3DES was never a Wi-Fi cipher.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which authentication method is shown, and why is it considered insecure?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'c', label: 'Client', icon: 'laptop' },
          { id: 'ap', label: 'AP', icon: 'ap' },
        ],
        steps: [
          { from: 'c', to: 'ap', label: 'Authentication request' },
          { from: 'ap', to: 'c', label: 'Challenge text', sub: 'sent in clear text' },
          { from: 'c', to: 'ap', label: 'Challenge encrypted with the static key' },
          { from: 'ap', to: 'c', label: 'Authentication success', tone: 'good' },
        ],
      },
    },
    options: [
      'WEP Shared Key; capturing the clear and encrypted challenge reveals the keystream',
      'Open System; no credentials or challenge are exchanged, so anyone in range can join',
      'WPA2-PSK 4-way handshake; the passphrase is sent in clear text during association',
      'SAE; the Dragonfly exchange lets an eavesdropper run offline dictionary attacks',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A clear challenge answered with an encrypted copy under a static key is **WEP Shared Key** authentication. XORing the two captured values reveals RC4 keystream, letting an attacker authenticate without the key. Open System exchanges no challenge, the 4-way handshake never sends the passphrase, and SAE is specifically designed to resist offline dictionary attacks.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which UDP port does a WLC use by default to send RADIUS authentication requests to a server such as Cisco ISE? (Enter the number.)',
    answers: ['1812', 'udp 1812', 'udp/1812', 'udp1812'],
    placeholder: 'port number',
    difficulty: 1,
    explanation:
      'RADIUS authentication uses **UDP 1812** and accounting uses UDP 1813 (1645/1646 are the legacy pair). TACACS+, the other AAA protocol, uses TCP 49.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. A Linux client is configured for the corporate WLAN. Which EAP method is configured, and what does it require?',
    exhibit: {
      kind: 'cli',
      text: `$ cat /etc/wpa_supplicant/corp.conf
network={
    ssid="CORP"
    key_mgmt=WPA-EAP
    eap=TLS
    identity="host/lnx-042.corp.example"
    ca_cert="/etc/certs/corp-ca.pem"
    client_cert="/etc/certs/lnx-042.pem"
    private_key="/etc/certs/lnx-042.key"
}`,
    },
    options: [
      'EAP-TLS; both the client and the RADIUS server need certificates',
      'PEAP; only the server needs a certificate and the user types a password',
      'EAP-FAST; a PAC replaces certificates',
      'WPA3-SAE; the client proves knowledge of a shared password',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`eap=TLS` with a `client_cert` and `private_key` is **EAP-TLS**, which requires certificates on both sides (the `ca_cert` lets the client validate the server). PEAP would use an inner password instead of a client certificate, EAP-FAST uses a PAC, and `key_mgmt=WPA-EAP` means Enterprise 802.1X, not SAE.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two EAP methods authenticate the server with a certificate but do not require a certificate on the client? (Choose two.)',
    options: ['PEAP', 'EAP-TTLS', 'EAP-TLS', 'LEAP', 'EAP-FAST'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**PEAP** and **EAP-TTLS** build a TLS tunnel from a server certificate and authenticate the user inside it with a password or token. EAP-TLS also needs a client certificate, LEAP uses no certificates at all, and EAP-FAST uses a PAC rather than a server certificate.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. An attacker captured these frames on a WPA2-Personal WLAN after sending spoofed deauthentication frames. What can the attacker now attempt?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'ap', label: 'AP', icon: 'ap' },
          { id: 'c', label: 'Client', icon: 'laptop' },
        ],
        steps: [
          { note: 'Spoofed deauthentication forces the client to reconnect', tone: 'bad' },
          { from: 'ap', to: 'c', label: 'Message 1: ANonce' },
          { from: 'c', to: 'ap', label: 'Message 2: SNonce + MIC' },
          { from: 'ap', to: 'c', label: 'Message 3: GTK + MIC' },
          { from: 'c', to: 'ap', label: 'Message 4: ACK' },
        ],
      },
    },
    options: [
      'An offline dictionary attack, testing candidate passphrases against the captured MIC',
      'Reading the passphrase directly from message 2, where it is sent in clear text',
      'Nothing, because WPA2-Personal provides forward secrecy',
      'Decrypting the RADIUS shared secret between the WLC and ISE',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The 4-way handshake exposes the nonces, MAC addresses and a MIC; the only unknown is the PMK, which in Personal mode derives from the passphrase and SSID. The attacker can therefore guess passphrases **offline** until one reproduces the MIC. The passphrase is never transmitted, WPA2-Personal has no forward secrecy, and there is no RADIUS in Personal mode. WPA3 blocks both steps: PMF rejects the spoofed deauthentication and SAE resists offline guessing.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'A company wants per-user WLAN authentication with existing Active Directory usernames and passwords. Clients must verify the network\'s identity to defeat evil-twin APs, but the company will not issue certificates to thousands of client devices. Which solution meets these requirements?',
    options: [
      'WPA2 or WPA3-Enterprise with PEAP (EAP-MSCHAPv2)',
      'WPA2 or WPA3-Enterprise with EAP-TLS (certificates)',
      'WPA3-Personal with SAE and a shared passphrase',
      'WPA2-Enterprise with LEAP (Cisco proprietary)',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '**PEAP** needs only a server certificate, which clients validate to detect rogue networks, and then carries the AD username and password inside the TLS tunnel. EAP-TLS would require a certificate on every client, WPA3-Personal shares one password and offers no per-user identity, and LEAP is a deprecated method with no server certificate that is vulnerable to dictionary attacks.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'A coffee shop wants its guest SSID to require no password, but each customer\'s traffic must be encrypted over the air. Which feature meets the requirement?',
    options: [
      'Wi-Fi Enhanced Open (OWE)',
      'WPA3-Personal with SAE',
      'Open authentication with a web portal',
      'WEP with a 104-bit key',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '**Enhanced Open (OWE)** runs a Diffie-Hellman exchange during association, giving every client a unique key without any password. WPA3-Personal requires a shared password, a web portal controls access but leaves frames unencrypted, and WEP needs a key and is insecure anyway.',
  },
  {
    id: 'e17',
    type: 'categorize',
    stem: 'Classify each mechanism by the security function it primarily provides.',
    categories: ['Authentication', 'Encryption', 'Message integrity'],
    items: [
      { text: '802.1X/EAP with a RADIUS server', category: 0 },
      { text: 'SAE handshake', category: 0 },
      { text: 'RC4 stream cipher', category: 1 },
      { text: 'AES in counter mode', category: 1 },
      { text: 'Michael MIC in TKIP', category: 2 },
      { text: 'CBC-MAC in CCMP', category: 2 },
    ],
    difficulty: 2,
    explanation:
      '802.1X/EAP and SAE decide who may join (**authentication**). RC4 and AES counter mode scramble payloads (**encryption**). Michael and CBC-MAC compute check values that expose altered frames (**integrity**); CCMP combines AES counter mode and CBC-MAC to deliver both of the last two functions.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Refer to the exhibit. A contractor connects to a WPA3-Enterprise SSID. Which two statements about the authentication traffic are true? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.2,
        nodes: [
          { id: 'pc', icon: 'laptop', label: 'Contractor', x: 1, y: 2.1 },
          { id: 'ap', icon: 'ap', label: 'AP7', x: 3.4, y: 2.1 },
          { id: 'wlc', icon: 'wlc', label: 'WLC-HQ', x: 5.9, y: 2.1 },
          { id: 'ise', icon: 'server', label: 'ISE-1', x: 8.6, y: 1.1 },
          { id: 'ad', icon: 'database', label: 'AD', sub: 'identity store', x: 8.6, y: 3.2 },
        ],
        links: [
          { from: 'pc', to: 'ap', style: 'wireless' },
          { from: 'ap', to: 'wlc', label: 'CAPWAP' },
          { from: 'wlc', to: 'ise', label: 'RADIUS' },
          { from: 'ise', to: 'ad' },
        ],
      },
    },
    options: [
      'EAP travels between the laptop and the WLC inside EAPOL frames',
      'The WLC re-encapsulates EAP in RADIUS messages sent to ISE',
      'The laptop sends RADIUS Access-Request messages directly to ISE',
      'The WLC decides whether the contractor\'s password is correct',
      'EAPOL frames are forwarded unchanged to ISE over UDP 1812',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'EAP runs in **EAPOL** between supplicant and authenticator (tunneled through the AP inside CAPWAP), and the WLC **re-encapsulates it in RADIUS** toward ISE. The client never speaks RADIUS, the decision belongs to ISE (checking AD), not the WLC, and EAPOL is a Layer 2 encapsulation that does not cross the wired network to the server.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. A warehouse handheld scanner connects as shown. Which change would most improve the security of this connection?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> netsh wlan show interfaces

There is 1 interface on the system:

    Name                   : Wi-Fi
    State                  : connected
    SSID                   : WH-SCAN
    Network type           : Infrastructure
    Radio type             : 802.11g
    Authentication         : WPA-Personal
    Cipher                 : TKIP
    Connection mode        : Profile
    Channel                : 6
    Signal                 : 71%`,
    },
    options: [
      'Move the SSID to WPA2 or WPA3 so AES-based encryption replaces TKIP',
      'Keep TKIP but change the pre-shared key to a longer value',
      'Add WEP Shared Key authentication in front of WPA',
      'Hide the SSID so the scanner cannot be discovered',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The scanner uses **WPA with TKIP**, a deprecated RC4-based protocol. Moving to WPA2 (AES-CCMP) or WPA3 (SAE, GCMP, PMF) fixes the cipher itself. A longer key only slows passphrase guessing while TKIP remains weak, WEP Shared Key would add a broken mechanism, and hiding the SSID is not a security control because the SSID still appears in client probes and association frames.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Which statement about TKIP is true?',
    options: [
      'It wraps RC4 with per-packet keys and a MIC so WEP-era hardware could be upgraded',
      'It is the AES-based cipher protocol that IEEE 802.11i mandates for WPA2 networks',
      'It replaces the pre-shared key exchange with a Dragonfly handshake in WPA3',
      'It is required for 802.11n and later high-throughput data rates in the 5 GHz band',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '**TKIP** kept RC4 so existing hardware could run it after a firmware update, adding per-packet keys, a replay counter and the Michael MIC. The AES-based WPA2 protocol is CCMP, the Dragonfly handshake is SAE, and 802.11n high-throughput rates are actually not allowed with TKIP or WEP.',
  },
  {
    id: 'e21',
    type: 'match',
    stem: 'Match each security generation to the encryption it is known for.',
    pairs: [
      { left: 'WEP', right: 'RC4 with a static key' },
      { left: 'WPA', right: 'TKIP' },
      { left: 'WPA2', right: 'AES-CCMP' },
      { left: 'WPA3', right: 'AES-GCMP' },
    ],
    difficulty: 1,
    explanation:
      'WEP used RC4 with static keys; WPA wrapped RC4 in **TKIP**; WPA2 moved to **AES-CCMP**; WPA3 is associated with **GCMP** (with CCMP-128 still allowed as its baseline).',
  },
];
