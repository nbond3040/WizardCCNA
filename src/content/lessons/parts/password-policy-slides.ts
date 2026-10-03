import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Password Policies & Alternatives',
    subtitle: 'Stronger secrets, smarter rules, and ways to move beyond the password',
    notes:
      "Every device, application and cloud console you manage is protected by some kind of credential, and attackers know that the cheapest way in is usually a stolen or guessed password rather than a clever exploit. This deck covers blueprint topic 5.4: the elements of a **password policy** (length, complexity, expiration, history and lockout), how modern **NIST guidance** differs from the old rules many of us grew up with, and the alternatives that reduce our dependence on memorized secrets: **password managers**, **multifactor authentication**, **digital certificates** backed by PKI, and **biometrics**. The topic is tested on both exam versions. Expect conceptual questions such as which combination counts as MFA, which biometric error matters for a high-security door, or which password rule NIST now discourages. We finish with the few IOS commands that enforce a policy on a Cisco device, so you can connect the theory to the CLI.",
  },
  {
    kind: 'bullets',
    title: 'Why passwords alone fail',
    bullets: [
      'A password is **something you know**, so it can be guessed, phished or copied',
      'Offline cracking tests billions of guesses per second against weak hashes',
      '**Credential stuffing** replays leaked pairs against other sites',
      '**Phishing** and keyloggers capture even a very strong password',
      'Human habits: short, predictable, reused, written down',
      'Defense = sound **policy** plus **alternatives** (MFA, certificates, biometrics)',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'Password reused', sub: 'same secret on many sites', shape: 'pill' },
        { id: 'b', label: 'One site is breached', sub: 'hashes leaked and cracked' },
        { id: 'c', label: 'Credential stuffing', sub: 'bots try the pair elsewhere' },
        { id: 'd', label: 'Account takeover', shape: 'round', tone: 'bad' },
      ],
    },
    notes:
      "A password is **something you know**, and that is exactly its weakness: knowledge can be copied without the owner noticing. Attackers guess offline against stolen hashes at billions of attempts per second when the hash algorithm is fast, try the most common passwords first, and replay credentials leaked from one site against many others, which is called **credential stuffing**. Phishing and keyloggers skip guessing entirely and simply capture whatever the user types, however strong it is. The human factor makes it worse: people choose short, predictable passwords, reuse them everywhere and write them on sticky notes. The flow on this slide is the classic chain of events: one reused password, one breached website, and every other account that shares the secret falls too. A good defense has two halves. First, a sensible **password policy** that makes guessing hard and avoids rules that push users toward predictable patterns. Second, **alternatives and add-ons** such as MFA, certificates and biometrics, so a stolen password alone is no longer enough to log in.",
  },
  {
    kind: 'table',
    title: 'The five password policy elements',
    columns: ['Element', 'What it controls', 'Legacy practice', 'Modern guidance'],
    rows: [
      ['**Length**', 'Minimum (and maximum) characters', '8-character minimum', 'Longer wins: 8+ with MFA, 15+ if alone; allow 64+'],
      ['**Complexity**', 'Required character classes and banned patterns', 'Upper + lower + digit + symbol', 'No forced classes; block common and breached passwords'],
      ['**Expiration**', 'Maximum password age', 'Change every 30 to 90 days', 'No scheduled rotation; change on evidence of compromise'],
      ['**History**', 'How many old passwords are remembered', 'Remember the last 5 to 24', 'Matters only when changes are forced; block reuse of a compromised secret'],
      ['**Lockout**', 'Reaction to repeated failures', 'Lock after 3 to 5 failures', 'Throttle and rate-limit; lock carefully to avoid denial of service'],
    ],
    notes:
      "Memorize the five classic elements of a password policy: **length**, **complexity**, **expiration**, **history** and **lockout**. Length sets the minimum (and ideally a generous maximum) number of characters. Complexity governs which character classes are required or which patterns, such as dictionary words, are banned. Expiration limits how long a password may live before it must change. History remembers previous passwords so users cannot immediately reuse them. Lockout decides what happens after repeated failures. The table contrasts what many enterprises still enforce with what current guidance says. Notice the pattern: modern guidance puts its weight on **length and screening** and removes the rules that annoy users without making an attacker's life harder. On the exam, read the stem for clues. If it asks for traditional best practice, mixed character types and periodic changes appear in the right answer. If it mentions NIST or current recommendations, forced rotation and composition rules are the wrong answers. Either way, longer is better and reuse across accounts is always bad.",
  },
  {
    kind: 'table',
    title: 'Length beats complexity',
    columns: ['Random secret', 'Search space', 'Combinations'],
    rows: [
      ['8 characters, any printable ASCII', '95⁸', '≈ 6.6 × 10¹⁵'],
      ['12 lowercase letters', '26¹²', '≈ 9.5 × 10¹⁶'],
      ['16 lowercase letters', '26¹⁶', '≈ 4.4 × 10²²'],
      ['6 words from a 7,776-word list', '7,776⁶', '≈ 2.2 × 10²³'],
    ],
    caption: 'These figures assume truly random choices; human-invented patterns are far easier to guess.',
    notes:
      "Why does current guidance prefer length over complexity? Because every extra character multiplies the number of possibilities, while adding a symbol class only enlarges the alphabet a little. The search space of a random secret is the alphabet size raised to the length. Eight random characters from the 95 printable ASCII characters give about 6.6 × 10¹⁵ combinations, but sixteen random lowercase letters give about 4.4 × 10²², roughly 6.6 million times more. A passphrase of six random words from a 7,776-word list is stronger still and far easier to remember. The caption matters: these numbers assume genuinely random choices. People rarely choose randomly; a password such as Summer2026! satisfies every complexity rule yet sits in attacker wordlists. That is why a manager-generated random password, or a randomly chosen passphrase, beats a human-invented complex one, and why verifiers should block known-bad choices. You will not calculate keyspace on the exam, but you should be able to say which of two passwords is stronger and explain why.",
  },
  {
    kind: 'compare',
    title: 'Legacy rules vs modern NIST guidance',
    left: {
      heading: 'Legacy habits',
      tone: 'muted',
      bullets: [
        'Force a new password every 30 to 90 days',
        'Require upper, lower, digit and symbol',
        'Short maximum length; paste disabled in forms',
        'Security questions and hints for recovery',
        'Lock accounts after only a few failures',
      ],
    },
    right: {
      heading: 'NIST SP 800-63B',
      tone: 'accent',
      bullets: [
        'Length first: 8+ with MFA, 15+ when the password stands alone',
        'Accept 64+ characters, spaces and pasted text',
        'Screen against common and breached passwords',
        'No scheduled rotation: ==change only on evidence of compromise==',
        'No composition rules; rate-limit guessing; offer MFA',
      ],
    },
    notes:
      "This is the most testable contrast in the topic. The left column lists habits from the era of forced 90-day changes; the right lists what the National Institute of Standards and Technology recommends in Special Publication 800-63B, Digital Identity Guidelines (the 2025 revision is 800-63B-4). The research behind the shift is simple: when users must rotate passwords on a schedule they make small predictable edits such as adding a digit, so rotation costs usability and buys little security. Composition rules have a similar side effect, producing passwords like Password1!. NIST instead asks verifiers to accept long secrets (at least 64 characters, spaces included), allow paste so password managers work, check candidates against lists of common and breached passwords, rate-limit guessing, and require a change only when there is **evidence of compromise**. It also discourages password hints and knowledge-based security questions, because their answers are often public. Take care with wording: if a question asks what NIST recommends, forced 30-day changes are wrong, even though many corporate policies still use them.",
  },
  {
    kind: 'bullets',
    title: 'History and lockout',
    bullets: [
      '**History** remembers the last N passwords so users cannot recycle them',
      'Add a **minimum age** so users cannot cycle back to a favorite',
      '**Lockout threshold**: failures allowed before the account locks (for example 5)',
      '**Duration** and **reset window**: how long the lock lasts, when the counter clears',
      'Risk: attackers can lock out real users on purpose (denial of service)',
      'Gentler options: throttling, escalating delays, CAPTCHA, MFA',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'Failed login', shape: 'pill' },
        { id: 'b', label: 'Failures at threshold?', shape: 'diamond' },
        { id: 'c', label: 'Lock or delay the account', tone: 'warn' },
        { id: 'd', label: 'Unlock after timer or admin reset', shape: 'round' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c', label: 'yes' },
        { from: 'c', to: 'd' },
      ],
    },
    notes:
      "History and lockout complete the five elements. **Password history** stores hashes of the last N passwords and refuses reuse. Without a **minimum password age**, a user can simply change the password N times in a row and return to the favorite, which defeats the control. Under modern guidance history matters less, because there is no scheduled rotation to dodge, but it still helps after a forced change. **Account lockout** defines a threshold (say five failures), a lockout duration and a counter-reset window. It frustrates online guessing, but notice the flow: a determined attacker can also lock out legitimate users by failing on purpose, which is a denial of service against your own staff. Many organizations therefore prefer throttling with growing delays, CAPTCHA, source-based blocking and MFA. Cisco devices have their own device-wide variant, `login block-for`, which protects the login service itself rather than one account. We meet it in the CLI slide at the end of the deck.",
  },
  {
    kind: 'bullets',
    title: 'Password managers',
    bullets: [
      'Encrypted vault that **generates**, stores and fills unique random passwords',
      'You remember one **master passphrase**, protected by MFA',
      'Defeats reuse, so a breach elsewhere gives attackers nothing',
      'Autofill matches the web address, which blunts look-alike phishing sites',
      'Risk: vault plus weak master secret exposes everything',
      'Enterprise editions add shared vaults, roles and audit logs',
    ],
    diagram: {
      type: 'topology',
      width: 9,
      height: 5,
      nodes: [
        { id: 'u', icon: 'user', label: 'You', sub: 'master passphrase + MFA', x: 1.2, y: 2.5 },
        { id: 'v', icon: 'database', label: 'Password manager', sub: 'encrypted vault', x: 4.3, y: 2.5, tone: 'accent' },
        { id: 's1', icon: 'server', label: 'Bank', x: 7.8, y: 0.9 },
        { id: 's2', icon: 'server', label: 'Email', x: 7.8, y: 2.5 },
        { id: 's3', icon: 'server', label: 'Router admin', x: 7.8, y: 4.1 },
      ],
      links: [
        { from: 'u', to: 'v', label: 'unlock' },
        { from: 'v', to: 's1', label: 'unique #1' },
        { from: 'v', to: 's2', label: 'unique #2' },
        { from: 'v', to: 's3', label: 'unique #3' },
      ],
    },
    notes:
      "A **password manager** is an application or browser feature that keeps your credentials in an encrypted vault. You remember one strong master passphrase (protected with MFA), and the manager generates and fills a unique random password for every site. That solves the biggest practical problem, reuse, and it defeats credential stuffing because a leak at one site gives the attacker nothing for the others. Autofill is also tied to the web address, so a look-alike phishing domain does not receive the password, a quiet anti-phishing benefit. The trade-offs are concentration of risk and recovery: if the vault and the master secret are both stolen, everything is exposed, so choose a long passphrase, enable MFA and keep a recovery plan. Enterprise managers add shared vaults, role-based sharing and audit logs. On the exam, the correct reason to use one is usually **unique, strong, random passwords per account without memorizing them**, not that it makes passwords unnecessary or encrypts network traffic.",
  },
  {
    kind: 'diagram',
    title: 'Secrets management for applications',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'app', label: 'Application', icon: 'server' },
        { id: 'vault', label: 'Secrets manager', icon: 'database' },
        { id: 'db', label: 'Database', icon: 'database' },
      ],
      steps: [
        { from: 'app', to: 'vault', label: 'Authenticate with workload identity', sub: 'no password in source code' },
        { note: 'The vault checks policy: may this application read this secret?' },
        { from: 'vault', to: 'app', label: 'Short-lived secret with a lease', sub: 'for example valid for one hour', tone: 'accent' },
        { from: 'app', to: 'db', label: 'Connect using the secret' },
        { note: 'Lease expires or is revoked; the secret is rotated; every access is logged' },
      ],
    },
    caption: 'Applications fetch secrets at run time instead of storing them in code or configuration files.',
    notes:
      "People are not the only ones with passwords. Applications, scripts, containers and network automation tools use database passwords, API keys, tokens and certificates, collectively called **secrets**. The classic failure is hard-coding them into source code, configuration files or Git repositories, where they are copied everywhere and almost never rotated. **Secrets management** centralizes them in a vault or cloud secrets service. The workload proves its identity, the vault checks policy, and the application receives the secret at run time, ideally a **short-lived** one with a lease that expires or is rotated automatically. Every access is logged, so audits can show who read what and when. For network devices the equivalent is centralized AAA with TACACS+ or RADIUS instead of a shared local password on every box, which gives per-user accounts, easy revocation and accounting. A secret that is rotated, scoped and audited limits the damage if it leaks. Remember the two rules: never store secrets in code, and prefer dynamic or short-lived credentials over static shared ones.",
  },
  {
    kind: 'diagram',
    title: 'Three authentication factors',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Something you know',
          layers: [{ label: 'Password or passphrase' }, { label: 'PIN' }, { label: 'Security-question answer', tone: 'muted' }],
        },
        {
          title: 'Something you have',
          layers: [{ label: 'Authenticator app (TOTP)' }, { label: 'Hardware token or FIDO2 key' }, { label: 'Smart card or certificate' }],
        },
        {
          title: 'Something you are',
          layers: [{ label: 'Fingerprint' }, { label: 'Face' }, { label: 'Iris' }],
        },
      ],
    },
    caption: 'MFA means factors from two or more DIFFERENT columns.',
    notes:
      "Authentication proves identity using one or more **factors**, grouped into three classic categories. **Something you know** is a memorized secret: password, passphrase, PIN. **Something you have** is a possession: a hardware token, an authenticator app on a phone, a smart card, a FIDO2 security key, or a private key bound to a device. **Something you are** is an inherent trait: fingerprint, face, iris. Some frameworks add contextual attributes such as somewhere you are (location or network) or something you do (typing rhythm), but the exam centers on the big three. Multifactor authentication means combining factors from **at least two different categories**. Two items from the same column are still one factor type, so adding a second password or a PIN to a password does not qualify. Notice also that the categories fail differently: knowledge can be phished, possessions can be stolen, biometrics can be copied but not easily changed. Combining categories forces an attacker to defeat unrelated defenses.",
  },
  {
    kind: 'diagram',
    title: 'An MFA login with a one-time code',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'user', label: 'User', icon: 'user' },
        { id: 'phone', label: 'Phone app', icon: 'phone' },
        { id: 'svc', label: 'Web service', icon: 'server' },
      ],
      steps: [
        { from: 'user', to: 'svc', label: 'Username and password', sub: 'factor 1: something you know' },
        { from: 'svc', to: 'user', label: 'Second factor required' },
        { from: 'phone', to: 'user', label: 'Shows a 6-digit code', sub: 'factor 2: something you have', tone: 'accent' },
        { from: 'user', to: 'svc', label: 'Types the code' },
        { note: 'The service computes the same code from the shared secret and the clock, then compares' },
        { from: 'svc', to: 'user', label: 'Access granted', tone: 'good' },
      ],
    },
    caption: 'TOTP codes change about every 30 seconds.',
    notes:
      "Follow the flow. The user first submits a username and password, which is factor one. The service does not grant access yet; it asks for a second factor. A **time-based one-time password (TOTP)** app on the phone and the server share a secret that was exchanged when the user enrolled. Both combine the secret with the current time, in 30-second steps, using a standard algorithm defined in RFC 6238, and display or expect the same six-digit code. The user types the code, the server calculates the expected value and compares, and only then is access granted. Because the code expires within seconds and changes constantly, a stolen password alone is useless, and a code overheard yesterday is worthless today. Other implementations use hardware fobs, SMS, a push notification to an app, or a FIDO2 key where the browser performs a cryptographic challenge instead of a typed code. Cisco Duo is a well-known MFA platform, but the exam asks for the concept, not the product.",
  },
  {
    kind: 'table',
    title: 'What counts as MFA?',
    columns: ['Login method', 'Factor types', 'MFA?'],
    rows: [
      ['Password + PIN', 'know + know', '**No**: one category twice'],
      ['Password + security-question answer', 'know + know', '**No**: one category twice'],
      ['Fingerprint + face scan', 'are + are', '**No**: one category twice'],
      ['Smart card + PIN', 'have + know', '**Yes**'],
      ['Password + authenticator-app code', 'know + have', '**Yes**'],
      ['Fingerprint + password', 'are + know', '**Yes**'],
      ['Badge + fingerprint', 'have + are', '**Yes**'],
    ],
    notes:
      "Use this table as a drill. The test of an MFA claim is whether the items come from different categories. Password plus PIN fails: both are knowledge. Password plus a security-question answer fails for the same reason, and security questions are weak anyway because the answers can often be found online. Smart card plus PIN passes (have plus know); it is the classic combination for government and enterprise logins and for bank cards. A password with an authenticator-app code passes, as does a fingerprint with a password. Two biometrics of different types, such as fingerprint and face, are still the same category because both are something you are, so strict definitions do not call that multifactor even though vendors may market it as dual biometric. When a question asks you to pick the MFA example, write know, have or are next to each option; the survivors with two different labels are the answer. Also remember that 2FA is simply MFA with exactly two factors.",
  },
  {
    kind: 'table',
    title: 'Second factors are not all equal',
    columns: ['Second factor', 'Category', 'Strength', 'Weakness'],
    rows: [
      ['SMS or voice code', 'have', 'Easy; no app needed', 'SIM swap and interception'],
      ['Authenticator app (TOTP)', 'have', 'Works offline; no carrier', 'Phishing site can relay the code'],
      ['Push approval', 'have', 'One tap', 'Approval fatigue from repeated prompts'],
      ['FIDO2 key or passkey', 'have (+ PIN or biometric)', '**Phishing-resistant**; bound to the real site', 'Cost; needs a backup key'],
      ['Smart card with certificate', 'have (+ PIN)', 'Strong; fits enterprise PKI', 'Issuance and revocation overhead'],
    ],
    caption: 'Any MFA beats none, but move high-value accounts toward phishing-resistant methods.',
    notes:
      "Not every second factor gives the same protection, and the exam may ask which is weakest or which is phishing-resistant. **SMS and voice codes** travel over the carrier network, so SIM-swap fraud and message interception can defeat them; they are better than nothing but the weakest common option. **Authenticator apps** generate codes offline, removing the carrier risk, but a phishing site can still ask for the code and relay it in real time. **Push approvals** are convenient, yet attackers exploit them with repeated prompts until a tired user taps approve, often called MFA fatigue. **FIDO2 security keys and passkeys** use public-key cryptography: the authenticator signs a challenge that is bound to the real website's address, so a look-alike domain gets nothing. They are the standard for **phishing-resistant** authentication. **Smart cards with certificates** offer similar strength inside enterprises that run PKI. The practical lesson is that MFA is a spectrum: deploy it everywhere, then move administrators and other high-value accounts toward phishing-resistant methods.",
  },
  {
    kind: 'bullets',
    title: 'Digital certificates and PKI',
    bullets: [
      'Public/private **key pair**: the private key never leaves its owner',
      'A **certificate** binds an identity to a public key and carries a CA signature',
      'The **CA** vouches for the binding; roots are self-signed and preinstalled',
      'Verifier follows the chain up to a trusted root',
      'It also checks dates, name and usage, and revocation (CRL or OCSP)',
    ],
    diagram: {
      type: 'topology',
      width: 9,
      height: 5,
      nodes: [
        { id: 'root', icon: 'server', label: 'Root CA', sub: 'self-signed, kept offline', x: 4.5, y: 0.8, tone: 'accent' },
        { id: 'ica', icon: 'server', label: 'Issuing CA', sub: 'intermediate', x: 4.5, y: 2.4 },
        { id: 'web', icon: 'server', label: 'Web server', sub: 'server certificate', x: 1.5, y: 4.1 },
        { id: 'pc', icon: 'laptop', label: 'Employee laptop', sub: 'user certificate', x: 4.5, y: 4.1 },
        { id: 'vpn', icon: 'router', label: 'VPN router', sub: 'device certificate', x: 7.5, y: 4.1 },
      ],
      links: [
        { from: 'root', to: 'ica', label: 'signs', arrow: 'forward' },
        { from: 'ica', to: 'web', label: 'signs', arrow: 'forward' },
        { from: 'ica', to: 'pc', label: 'signs', arrow: 'forward' },
        { from: 'ica', to: 'vpn', label: 'signs', arrow: 'forward' },
      ],
    },
    notes:
      "A password proves you know a shared secret. A **digital certificate** proves you own a private key without ever revealing it. Public key cryptography uses a pair: the **private key** stays with its owner and the **public key** can be given to anyone. Something signed with the private key can be verified by anyone holding the public key. But how do you know a public key really belongs to a given website or person? A **Certificate Authority (CA)** vouches for the binding by signing a certificate (X.509 format) that contains the subject's name and public key. The diagram shows a typical hierarchy: an offline **root CA** signs one or more **issuing (intermediate) CAs**, which sign the end-entity certificates for servers, users and devices. Operating systems and browsers ship with a **trust store** of root CA certificates. A verifier follows the chain from the presented certificate up to a trusted root, checking each signature, the validity dates and the revocation status. Together these services are called **public key infrastructure (PKI)**.",
  },
  {
    kind: 'diagram',
    title: 'Logging in with a certificate',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'cl', label: 'Client', icon: 'laptop' },
        { id: 'sv', label: 'Server', icon: 'server' },
        { id: 'ca', label: 'CA (CRL / OCSP)', icon: 'database' },
      ],
      steps: [
        { from: 'cl', to: 'sv', label: 'Hello' },
        { from: 'sv', to: 'cl', label: 'Server certificate and request for a client certificate' },
        { note: 'Client checks the server chain, validity dates and name' },
        { from: 'cl', to: 'sv', label: 'Client certificate plus signature made with its private key', tone: 'accent' },
        { from: 'sv', to: 'ca', label: 'Is this certificate revoked?', dashed: true },
        { from: 'sv', to: 'cl', label: 'Authenticated: no password was sent', tone: 'good' },
      ],
    },
    caption: 'Simplified mutual TLS; EAP-TLS for 802.1X Wi-Fi and VPN client authentication follow the same idea.',
    notes:
      "Certificates replace the shared password with a cryptographic proof. In this simplified mutual-TLS exchange the server presents its certificate and asks for the client's; the client checks the server's chain, the dates and the name, so it knows it is talking to the real service. The client then sends its own certificate and a **signature created with its private key** over handshake data. The server validates the client's chain to a CA it trusts, checks the dates and permitted key usage, and consults revocation information: a **CRL** is a published list of revoked serial numbers and **OCSP** is an online query for a single certificate. The signature verifies against the public key inside the certificate, which proves possession of the private key. No password ever crosses the wire, so there is nothing to phish or replay. The same idea secures 802.1X wireless with EAP-TLS, VPN client authentication and smart-card logon. The weak spots are operational: protecting private keys (ideally in a TPM, smart card or hardware token), renewing certificates before they expire, and revoking lost ones promptly.",
  },
  {
    kind: 'definitions',
    title: 'PKI vocabulary',
    terms: [
      { term: 'Public key', def: 'Half of a key pair that may be shared freely; verifies signatures and is placed in certificates.' },
      { term: 'Private key', def: 'Secret half of the pair; creates signatures. It never leaves its owner or travels in a CSR.' },
      { term: 'Digital signature', def: 'Value made with a private key and verified with the public key; proves origin and integrity.' },
      { term: 'Digital certificate', def: 'X.509 document binding an identity to a public key, with serial number, validity dates and issuer.' },
      { term: 'Certificate authority (CA)', def: 'Trusted entity that verifies identities and signs certificates.' },
      { term: 'Root CA and trust store', def: 'Self-signed trust anchors preinstalled in the OS or browser; intermediates are trusted through them.' },
      { term: 'CSR', def: 'Certificate signing request: public key plus identity, sent to a CA for signing.' },
      { term: 'CRL / OCSP', def: 'Ways to learn a certificate was revoked: a downloaded list versus an online status query.' },
    ],
    notes:
      "Learn these terms as a set, because exam options mix them deliberately. The **public key** and **private key** are a mathematically linked pair; never share the private half. A **digital signature** is created with the private key and verified with the public key, proving who signed and that the data was not altered. A **digital certificate** is a signed document binding an identity to a public key; it normally carries a serial number, validity period, issuer and permitted uses. The **CA** signs certificates. A **root CA** certificate is self-signed and is trusted because it is preinstalled, whereas an intermediate CA is trusted because a higher CA signed it. A **CSR** is how an entity asks for a certificate: you generate the key pair locally, put the public key and identity in the request, and the CA signs it, so the private key never travels. **CRL** and **OCSP** are the two ways to learn that a certificate was revoked before it expired. If an option says the CA stores or issues your private key, it is wrong.",
  },
  {
    kind: 'table',
    title: 'Biometrics: fingerprint, face, iris',
    columns: ['Biometric', 'What is measured', 'Strengths', 'Weaknesses'],
    rows: [
      ['**Fingerprint**', 'Ridge pattern and minutiae', 'Cheap, fast, widely deployed', 'Wet or worn fingers; copied prints can fool basic sensors'],
      ['**Face**', 'Geometry of facial features', 'Contactless and convenient', 'Lighting, aging, photos or masks unless liveness detection is used'],
      ['**Iris**', 'Pattern in the colored ring of the eye', 'Very distinctive; very low false acceptance', 'Costly readers; positioning and glare'],
      ['Others', 'Voice, retina, palm vein, gait', 'Niche or specialist use', 'Varied accuracy and user acceptance'],
    ],
    caption: 'Biometrics are something you are: not secret, and not resettable if a template leaks.',
    notes:
      "Biometrics authenticate **something you are**. Enrollment captures a sample, converts it to a mathematical **template** rather than storing a photo, and saves it; later a fresh sample is compared with the template and the match score is judged against a threshold. Fingerprint readers are cheap and everywhere, but wet, dry or worn fingers cause rejections, and lifted prints can fool basic sensors. Face recognition is contactless and convenient, but lighting, aging and photographs or masks cause trouble unless the system includes **liveness detection**, also called presentation-attack detection. Iris recognition examines the colored ring of the eye and is very distinctive, giving a very low false-acceptance rate, but readers cost more and need good positioning. Voice, retina, palm-vein and gait have niche uses. Two cautions apply to every biometric. They are not secret, since you leave fingerprints on glass, and they cannot be reset if a template leaks. That is why they are often combined with another factor, or used only to unlock a key stored on the device.",
  },
  {
    kind: 'compare',
    title: 'FAR vs FRR',
    left: {
      heading: 'FAR: False Acceptance Rate',
      tone: 'bad',
      bullets: [
        'An **impostor** is wrongly accepted',
        'A **security** failure',
        'Also called false match rate',
        'Keep it low for vaults and data centers',
      ],
    },
    right: {
      heading: 'FRR: False Rejection Rate',
      tone: 'warn',
      bullets: [
        'A **legitimate user** is wrongly rejected',
        'A **usability** failure',
        'Also called false non-match rate',
        'Keep it low for busy doors and consumer devices',
      ],
    },
    notes:
      "Biometric matching is statistical, so two kinds of mistake are possible. The **False Acceptance Rate (FAR)** is the proportion of impostor attempts that are wrongly accepted. This is the security error: someone who should be refused gets in. The **False Rejection Rate (FRR)** is the proportion of genuine attempts that are wrongly rejected. This is the usability error: the right person is turned away and calls the help desk. You will sometimes see these called false match and false non-match, or Type II and Type I errors respectively. A memory trick: **A**cceptance is about the **A**ttacker, **R**ejection is about the **R**ight user. When a scenario protects a vault or data center, the priority is a low FAR, even if more genuine users must retry. When the scenario is a consumer phone or a busy turnstile, a low FRR matters more, because convenience drives adoption. Read the stem to see which error the business fears more, then pick the system whose rates favor that priority.",
  },
  {
    kind: 'table',
    title: 'Moving the biometric threshold',
    columns: ['Matching threshold', 'FAR', 'FRR', 'Typical use'],
    rows: [
      ['**Strict** (demands a close match)', 'Lower', 'Higher', 'Data center cage, vault'],
      ['**Balanced** (crossover point)', 'Equal to FRR', 'Equal to FAR', 'General office access'],
      ['**Lenient** (tolerates variation)', 'Higher', 'Lower', 'Low-risk convenience unlock'],
    ],
    caption: 'CER (or EER) is where FAR = FRR. A lower CER means a more accurate system overall.',
    notes:
      "Every biometric system has a sensitivity setting, the matching threshold, and moving it trades one error for the other. Tighten it and the system demands a near-perfect match: FAR falls, but FRR rises because small differences in a genuine sample now cause rejections. Loosen it and FRR falls while FAR rises. The point where the two error rates are equal is called the **Crossover Error Rate (CER)**, also known as the Equal Error Rate (EER). Because a lower crossover means the system can achieve low rates on both errors at once, CER is the standard figure for comparing the overall accuracy of two products: the lower CER wins, regardless of how either one happens to be tuned. Exam questions often give a small table of FAR and FRR values for several systems and ask you to choose the best for a stated priority, or ask what happens to FRR when the threshold becomes stricter. The answer is always the trade-off, never a free improvement.",
  },
  {
    kind: 'cli',
    title: 'Enforcing policy on a Cisco device',
    code: `R1# configure terminal
R1(config)# security passwords min-length 10
R1(config)# login block-for 120 attempts 5 within 60
R1(config)# username admin privilege 15 algorithm-type scrypt secret Blue-Lantern-Wrestles-42
R1(config)# enable algorithm-type scrypt secret Seven-Owls-Climb-Quietly-7
R1(config)# service password-encryption
R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# exec-timeout 5 0
R1(config-line)# end
R1# show running-config | include username|enable secret
enable secret 9 $9$<salt>$<hash>
username admin privilege 15 secret 9 $9$<salt>$<hash>`,
    highlight: ['security passwords min-length', 'login block-for', 'algorithm-type scrypt', 'login local', 'exec-timeout'],
    caption: 'Hash types: 5 = salted MD5, 8 = PBKDF2-SHA256, 9 = scrypt. Type 7 is reversible obfuscation.',
    notes:
      "Cisco IOS lets you enforce some policy elements locally. `security passwords min-length 10` rejects any newly configured password shorter than ten characters; it does not re-check passwords that already exist. `login block-for 120 attempts 5 within 60` is a device-wide lockout: if five failed logins occur within 60 seconds, the device enters quiet mode and refuses new login attempts for 120 seconds, which also slows brute-force scripts. Notice that it protects the login service, not one user account. Credentials should use `secret`: the `algorithm-type scrypt` option stores a type 9 hash, type 8 is PBKDF2-SHA256 and type 5 is salted MD5. Here `service password-encryption` has nothing to protect because both credentials are secrets; it exists only as a safety net for leftover clear-text passwords, and it produces reversible **type 7** obfuscation, not a hash. `exec-timeout` logs out idle sessions. For stronger per-user control, point the device at a TACACS+ or RADIUS server with AAA, so passwords, MFA and lockout are managed centrally.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Most misses come from **MFA that is not MFA**, **legacy vs NIST** wording, and **FAR vs FRR** mix-ups.',
    bullets: [
      'Password + PIN, or password + security question, is one factor type twice, **not** MFA',
      'Modern NIST: no scheduled rotation and no composition rules; length and screening win',
      '`service password-encryption` is type 7 (reversible); `secret` is a one-way hash',
      'FAR = impostor accepted (security); FRR = real user rejected (usability)',
      'The CA signs certificates; the **private key never leaves its owner**',
      'SMS is a valid "have" factor but the weakest; FIDO2 keys are phishing-resistant',
    ],
    notes:
      "These are the distractors that cost points. First, MFA needs **different categories**; password plus PIN, or password plus security question, is two knowledge factors. Second, read whether the stem wants legacy best practice or NIST: modern guidance removes forced rotation and composition rules and favors length, blocklists and MFA. If the stem says nothing about NIST and lists periodic changes among classic best practices, the older textbook answer may be what is wanted, so read carefully. Third, `service password-encryption` produces type 7, which is reversible, while `enable secret` and `username ... secret` store one-way hashes. Fourth, FAR is the impostor getting in; FRR is the real user being turned away; the CER compares systems. Fifth, certificates prove ownership of a private key: the CA signs the certificate, and anything claiming the CA holds your private key is wrong. Finally, SMS codes are a legitimate possession factor but the weakest, while FIDO2 keys resist phishing. If two answers both look right, pick the more specific statement of the concept being tested.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Policy elements: **length, complexity, expiration, history, lockout**',
      'NIST: length plus screening plus MFA; rotate only after compromise',
      'Password managers and secrets vaults eliminate reuse and hard-coded secrets',
      'MFA = **two or more different** factors: know, have, are',
      'Certificates and PKI prove possession of a private key signed off by a CA',
      'Biometrics: FAR is security, FRR is usability, CER compares systems',
    ],
    notes:
      "Pull the topic together in one pass. A password policy has five elements, length, complexity, expiration, history and lockout, and the modern view is length plus screening and MFA, with no scheduled rotation unless compromise is suspected. Password managers fix the reuse problem for people, while secrets managers and centralized AAA fix it for applications and devices. Multifactor authentication combines two or more different categories: something you know, have or are. Certificates and PKI prove possession of a private key that a trusted CA has vouched for, so no shared secret crosses the network. Biometrics add convenience but come with FAR and FRR trade-offs, tuned by the threshold and compared by the CER. Before moving on, test yourself: name three examples of each factor, explain why password plus PIN is not MFA, and describe what happens to FAR and FRR when a biometric threshold becomes stricter. If you can do those three things without hesitation, you are ready for the quiz and the exam bank.",
  },
];
