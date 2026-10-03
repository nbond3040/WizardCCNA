import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Five classic password policy elements', back: '**Length**, **complexity**, **expiration**, **history** and **lockout**.' },
  {
    id: 'f2',
    front: 'NIST SP 800-63B minimum password length',
    back: 'At least **8** characters when the password is one factor of MFA, **15** when it is the only factor (2025 revision). Verifiers should accept **64+**.',
  },
  { id: 'f3', front: 'Modern NIST view on forced password expiration', back: 'Do **not** force periodic changes; require a change only on **evidence of compromise**.' },
  {
    id: 'f4',
    front: 'Modern NIST view on composition rules',
    back: 'Do not require mixes of uppercase, digits and symbols. Prefer **length** and **blocklist screening** of common and breached passwords.',
  },
  { id: 'f5', front: 'Password history', back: 'Remembers the last N passwords to block reuse. Pair it with a **minimum age** so users cannot cycle back to a favorite.' },
  { id: 'f6', front: 'Account lockout settings', back: 'A **threshold** (failed attempts), a lockout **duration** and a **reset window** for the failure counter.' },
  { id: 'f7', front: 'Downside of strict account lockout', back: 'Attackers can lock real users out on purpose (denial of service). Throttling, delays and MFA are gentler alternatives.' },
  { id: 'f8', front: 'Credential stuffing', back: 'Replaying leaked username/password pairs against other sites. Defeated by **unique passwords** and **MFA**.' },
  { id: 'f9', front: 'Password manager', back: 'Encrypted vault that generates and fills **unique random passwords**; unlocked by a master passphrase, ideally with MFA.' },
  { id: 'f10', front: 'Main risk of a password manager', back: 'Concentration of risk: a stolen vault plus a weak master secret exposes every account. Use a long passphrase and MFA.' },
  { id: 'f11', front: 'Secrets management', back: 'Vault or service that stores, controls access to, rotates and audits application secrets such as API keys and database passwords. No secrets in code.' },
  { id: 'f12', front: 'MFA (multifactor authentication)', back: 'Two or more factors from **different categories**. Two-factor authentication (2FA) is MFA with exactly two.' },
  { id: 'f13', front: 'Three classic authentication factors', back: 'Something you **know**, something you **have**, something you **are**.' },
  { id: 'f14', front: 'Examples of something you have', back: 'Hardware token, authenticator app, smart card, FIDO2 security key, device-bound private key.' },
  { id: 'f15', front: 'Is password + PIN multifactor?', back: '**No.** Both are knowledge factors, so it is one factor type used twice.' },
  { id: 'f16', front: 'TOTP', back: 'Time-based one-time password (RFC 6238): a code derived from a shared secret and the clock, typically 6 digits changing every **30 seconds**.' },
  { id: 'f17', front: 'Weakest common second factor', back: '**SMS or voice codes**, because of SIM-swap fraud and interception.' },
  { id: 'f18', front: 'Phishing-resistant MFA', back: '**FIDO2/WebAuthn** security keys and passkeys (and smart-card certificates), which bind the login to the genuine site.' },
  { id: 'f19', front: 'Digital certificate', back: 'A signed X.509 document that binds an identity to a **public key**, issued by a CA.' },
  { id: 'f20', front: 'Certificate authority (CA)', back: 'Trusted entity that verifies identities and **signs** certificates with its own private key.' },
  { id: 'f21', front: 'Public key vs private key', back: 'The **public** key is shared (it appears in the certificate). The **private** key never leaves its owner.' },
  { id: 'f22', front: 'Root CA certificate', back: 'Self-signed trust anchor preinstalled in the operating system or browser trust store; it signs intermediate CAs.' },
  { id: 'f23', front: 'CSR', back: 'Certificate signing request: the public key plus identity sent to a CA. The private key stays on the requesting device.' },
  { id: 'f24', front: 'CRL vs OCSP', back: 'Both check revocation. **CRL** is a downloaded list of revoked serial numbers; **OCSP** is an online query for one certificate.' },
  { id: 'f25', front: 'Biometric factor and examples', back: 'Something you **are**: fingerprint, face, iris (also voice, retina, palm vein).' },
  { id: 'f26', front: 'FAR', back: 'False Acceptance Rate: impostors wrongly **accepted**. A security failure; keep it low for vaults.' },
  { id: 'f27', front: 'FRR', back: 'False Rejection Rate: legitimate users wrongly **rejected**. A usability failure.' },
  { id: 'f28', front: 'CER / EER', back: 'Crossover (Equal) Error Rate: the setting where FAR = FRR. A **lower** CER means a more accurate biometric system.' },
  {
    id: 'f29',
    front: 'IOS password storage types',
    back: '`service password-encryption` gives reversible **type 7**. `secret` is a one-way hash: type 5 salted MD5, type 8 PBKDF2-SHA256, type 9 scrypt.',
  },
  {
    id: 'f30',
    front: 'IOS commands that enforce policy',
    back: '`security passwords min-length N` (length), `login block-for S attempts N within T` (device quiet mode), `exec-timeout` (idle logout).',
  },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Under current NIST SP 800-63B guidance, when should a user be required to change a password?',
    options: ['Every 30 days', 'Every 90 days', 'When there is evidence the password has been compromised', 'Every time the user signs in from a new device'],
    answer: 2,
    difficulty: 1,
    explanation:
      'NIST recommends no scheduled rotation; a change is forced only on evidence of compromise. Fixed 30- or 90-day cycles push users toward predictable edits, and a new device might justify an extra MFA prompt but not a password change.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two items are examples of "something you have"? (Choose two.)',
    options: ['A code from an authenticator app', 'A PIN', 'A smart card', 'A fingerprint', 'A passphrase'],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'The authenticator app (on a phone) and the smart card are possessions. A PIN and a passphrase are things you know, and a fingerprint is something you are.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'Which login method is NOT multifactor authentication?',
    options: ['A smart card and a PIN', 'A password and a code from an authenticator app', 'A fingerprint and a password', 'A password and a PIN'],
    answer: 3,
    difficulty: 2,
    explanation:
      'A password and a PIN are both things you know, so the login uses one factor type twice. The other combinations pair two different categories: have + know, know + have, and are + know.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'What acronym names the rate at which a biometric system wrongly accepts an impostor?',
    answers: ['FAR', 'false acceptance rate'],
    placeholder: 'Acronym',
    difficulty: 1,
    explanation:
      'The **False Acceptance Rate (FAR)** measures impostors who are wrongly accepted, a security failure. The False Rejection Rate (FRR) measures genuine users who are wrongly rejected.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each term to its description.',
    pairs: [
      { left: 'Certificate authority', right: 'Signs certificates that bind identities to public keys' },
      { left: 'Private key', right: 'Secret half of a key pair that never leaves its owner' },
      { left: 'FRR', right: 'A legitimate user is wrongly rejected' },
      { left: 'Password manager', right: 'Encrypted vault of unique random passwords' },
    ],
    difficulty: 1,
    explanation:
      'A CA signs certificates, the private key stays secret with its owner, FRR counts genuine users who are turned away, and a password manager stores unique random passwords in an encrypted vault.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'What does a certificate authority (CA) do?',
    options: [
      'Stores each user\'s private key so it can be recovered',
      'Signs certificates that bind an identity to a public key',
      'Encrypts all traffic between a client and a server',
      'Generates one-time codes for MFA',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'The CA vouches for the identity-to-public-key binding by signing the certificate. Private keys stay with their owners, traffic encryption is done by protocols such as TLS using keys negotiated by the endpoints, and one-time codes come from tokens or authenticator apps.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'What is a risk of a very strict account-lockout policy?',
    options: [
      'An attacker can lock out legitimate users on purpose',
      'Users can no longer choose passphrases',
      'Password hashes become reversible',
      'MFA stops working for locked accounts',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Anyone who knows a username can fail logins deliberately and lock the account, a denial of service. Lockout has no effect on passphrase use, on how hashes are stored, or on MFA design.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'What is the main benefit of a password manager?',
    options: [
      'It removes the need for any authentication',
      'It encrypts the traffic between the browser and the website',
      'It lets each account have a unique, long, random password without memorizing it',
      'It makes phishing impossible',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'A manager solves reuse by generating and filling a unique strong password per account. It still requires authentication to unlock the vault, it does not encrypt traffic (TLS does), and although address-matched autofill helps, it does not make phishing impossible.',
  },
];
