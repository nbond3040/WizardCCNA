import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which password policy element controls how a system reacts after a user enters the wrong password several times in a row?',
    options: ['Password history', 'Account lockout', 'Password expiration', 'Password complexity'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Account lockout (or login throttling) defines the failure threshold and what happens next, such as a timed lock. **History** only blocks reuse of old passwords, **expiration** limits how long a password lives, and **complexity** governs which characters or patterns a password must contain. None of those three reacts to failed attempts.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. A security team compares this password policy with current NIST SP 800-63B guidance. Which setting conflicts most directly with that guidance?',
    exhibit: {
      kind: 'table',
      columns: ['Setting', 'Value'],
      rows: [
        ['Minimum length', '15 characters'],
        ['Maximum length', '64 characters'],
        ['Composition rules', 'None; common and breached passwords are blocked'],
        ['Maximum password age', '30 days'],
        ['Paste into password fields', 'Allowed'],
        ['Second factor', 'Required for remote access'],
      ],
    },
    options: [
      'A minimum length of 15 characters',
      'Blocking common and breached passwords',
      'A maximum password age of 30 days',
      'Allowing paste into password fields',
      'Requiring a second factor for remote access',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'NIST recommends against scheduled password changes because users respond with small predictable edits; a change should be forced only on evidence of compromise, so a 30-day maximum age is the conflict. A 15-character minimum, a 64-character maximum, screening against common and breached lists, allowing paste (so password managers work) and requiring MFA all match the guidance.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two practices does current NIST SP 800-63B guidance recommend for user-chosen passwords? (Choose two.)',
    options: [
      'Force users to change passwords every 60 days',
      'Require at least one uppercase letter, one digit and one symbol',
      'Check new passwords against lists of common and breached passwords',
      'Allow long passphrases, including spaces, and permit pasting',
      'Use security questions as the primary password-recovery method',
    ],
    answers: [2, 3],
    difficulty: 2,
    explanation:
      'NIST favors screening candidate passwords against known-bad lists and allowing long passphrases (at least 64 characters, spaces and paste included). It discourages scheduled rotation, forced composition rules and knowledge-based security questions or hints, because those lead to predictable patterns or to answers an attacker can look up.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Which administrator account is protected by multifactor authentication?',
    exhibit: {
      kind: 'table',
      columns: ['Account', 'First factor', 'Second factor'],
      rows: [
        ['Admin-A', 'Password', '6-digit code from an authenticator app'],
        ['Admin-B', 'Password', 'Security-question answer'],
        ['Admin-C', 'Fingerprint', 'Face scan'],
        ['Admin-D', 'Password', 'PIN'],
      ],
    },
    options: ['Admin-A', 'Admin-B', 'Admin-C', 'Admin-D'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Admin-A combines something you know (the password) with something you have (the phone running the authenticator app): two different categories. Admin-B and Admin-D pair two knowledge factors (a PIN and a security answer are both memorized), and Admin-C pairs two biometric factors, which are both something you are. Each of those pairs stays inside a single category, so none of them is true MFA.',
  },
  {
    id: 'e5',
    type: 'categorize',
    stem: 'Drag each authentication example into the factor category it represents.',
    categories: ['Something you know', 'Something you have', 'Something you are'],
    items: [
      { text: 'PIN', category: 0 },
      { text: 'Passphrase', category: 0 },
      { text: 'Hardware token showing a changing code', category: 1 },
      { text: 'Smart card', category: 1 },
      { text: 'Authenticator-app code', category: 1 },
      { text: 'Iris scan', category: 2 },
      { text: 'Fingerprint', category: 2 },
    ],
    difficulty: 1,
    explanation:
      'PINs and passphrases are memorized secrets (know). Hardware tokens, smart cards and authenticator apps are possessions (have). Iris and fingerprint are inherent traits (are).',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Which stored credentials use a reversible encoding instead of a one-way hash?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config
...
service password-encryption
!
enable secret 5 $1$<salt>$<hash>
!
username admin privilege 15 secret 9 $9$<salt>$<hash>
username helpdesk password 7 <encoded-string>
!
line vty 0 4
 password 7 <encoded-string>
 login`,
    },
    options: [
      'Only the enable secret, because type 5 is the weakest storage type',
      'The admin password, because type 9 is a reversible encoding',
      'None of them, because service password-encryption hashes every password in the file',
      'The helpdesk user password and the VTY line password, because type 7 is reversible',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Type 7 is a simple reversible obfuscation applied by `service password-encryption` to clear-text passwords such as `username ... password` and line passwords, so those values can be decoded directly. The `secret` entries are one-way hashes (type 5 salted MD5, type 9 scrypt) that cannot be reversed. `service password-encryption` does not hash anything; it only obscures passwords that were entered with the `password` keyword.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Which certificate must the employee PC already trust, as a trust anchor, to validate the web server certificate chain?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'root', icon: 'server', label: 'Root CA', sub: 'self-signed', x: 5, y: 0.8 },
          { id: 'ica', icon: 'server', label: 'Issuing CA', x: 5, y: 2.4 },
          { id: 'web', icon: 'server', label: 'Web server', sub: 'server certificate', x: 7.8, y: 4.1 },
          { id: 'pc', icon: 'laptop', label: 'Employee PC', sub: 'browser', x: 2.2, y: 4.1 },
        ],
        links: [
          { from: 'root', to: 'ica', label: 'signs', arrow: 'forward' },
          { from: 'ica', to: 'web', label: 'signs', arrow: 'forward' },
          { from: 'pc', to: 'web', label: 'HTTPS' },
        ],
      },
    },
    options: [
      'The web server certificate',
      'The root CA certificate',
      'The employee PC\'s own certificate',
      'The issuing CA\'s private key',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The root CA certificate is the trust anchor: it is self-signed and preinstalled in the PC\'s trust store, and the browser verifies that the root signed the issuing CA and the issuing CA signed the server certificate. The server certificate is the thing being validated, not an anchor. The PC\'s own certificate matters only for client authentication, and private keys are never distributed.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two items are contained in a digital certificate? (Choose two.)',
    options: [
      'The subject\'s public key',
      'The subject\'s private signing key',
      'The subject\'s login password hash',
      'The digital signature of the issuing CA',
      'The private key of the issuing CA',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'A certificate carries the subject\'s identity and **public** key plus the issuing CA\'s **digital signature**, along with serial number, validity dates and permitted uses. Private keys are never placed in certificates, and certificates do not contain password hashes.',
  },
  {
    id: 'e9',
    type: 'order',
    stem: 'Place the steps for obtaining a device certificate from a CA in the correct order.',
    items: [
      'Generate a public/private key pair on the device',
      'Create a certificate signing request (CSR) containing the public key and identity',
      'Submit the CSR to the certificate authority',
      'The CA verifies the request and signs the certificate',
      'Install the signed certificate and the CA chain on the device',
    ],
    difficulty: 2,
    explanation:
      'The key pair is generated first and the private key stays on the device; only the public key travels in the CSR. The CA signs after verifying the request, and the device then installs the signed certificate together with the CA certificates needed to build the chain.',
  },
  {
    id: 'e10',
    type: 'match',
    stem: 'Match each biometric term to its meaning.',
    pairs: [
      { left: 'FAR', right: 'An impostor is wrongly accepted' },
      { left: 'FRR', right: 'A legitimate user is wrongly rejected' },
      { left: 'CER', right: 'The setting where FAR equals FRR' },
      { left: 'Liveness detection', right: 'Defends against photos, masks and fake fingerprints' },
    ],
    difficulty: 1,
    explanation:
      'FAR counts impostors who get in, FRR counts genuine users who are turned away, the CER (or EER) is where the two curves cross and is used to compare systems, and liveness detection checks that the sample comes from a live person rather than a replica.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. A company will protect its data-center cage with a biometric reader, and its top priority is preventing unauthorized entry. Which system should it choose?',
    exhibit: {
      kind: 'table',
      columns: ['System', 'FAR', 'FRR'],
      rows: [
        ['A', '3%', '0.1%'],
        ['B', '0.5%', '0.5%'],
        ['C', '0.001%', '4%'],
        ['D', '0.1%', '1%'],
      ],
    },
    options: ['System A', 'System B', 'System C', 'System D'],
    answer: 2,
    difficulty: 3,
    explanation:
      'Preventing unauthorized entry means minimizing false acceptances, so the lowest FAR wins: System C at 0.001%. The cost is a 4% FRR, so more legitimate staff must retry, which is acceptable for a high-security area. System A has the best FRR but admits 3% of impostors, System B is balanced, and System D accepts impostors 100 times more often than System C.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'A security administrator changes the sensitivity of a fingerprint reader so that it demands a closer match before granting access. What is the expected result?',
    options: [
      'FAR decreases and FRR increases',
      'FAR increases and FRR decreases',
      'Both FAR and FRR decrease',
      'The CER of the device becomes zero',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A stricter threshold lets fewer impostors through (lower FAR) but also rejects more genuine samples that differ slightly from the template (higher FRR). The opposite change describes a more lenient threshold. Lowering both errors at once would need a better sensor, which means a lower CER, not a threshold change; the CER is a property of the device, not of one setting.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Employees reuse their corporate passwords on public websites, and attackers are replaying credentials from a recent third-party breach against the company VPN. Which single control is most effective at stopping these logins?',
    options: [
      'Lower the account lockout threshold to three attempts',
      'Reduce the maximum password age to 14 days',
      'Enable service password-encryption on the VPN gateway',
      'Require MFA for VPN authentication',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Credential stuffing uses valid username and password pairs, so the attacker usually succeeds on the first try and never trips a lockout. A 14-day expiry helps only after the damage is done, and `service password-encryption` merely obscures passwords in a stored configuration. MFA means the stolen password alone is not enough to authenticate.',
  },
  {
    id: 'e14',
    type: 'match',
    stem: 'Match each tool or service to its main purpose.',
    pairs: [
      { left: 'Password manager', right: 'Stores unique passwords for a person in an encrypted vault' },
      { left: 'Secrets manager', right: 'Delivers credentials to applications at run time and rotates them' },
      { left: 'Authenticator app', right: 'Generates time-based one-time codes' },
      { left: 'Certificate authority', right: 'Signs certificates that bind identities to public keys' },
    ],
    difficulty: 2,
    explanation:
      'A password manager serves people, a secrets manager serves applications and automation, an authenticator app supplies the possession factor through TOTP codes, and a CA vouches for public keys by signing certificates.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about secrets management are true? (Choose two.)',
    options: [
      'Applications should retrieve secrets from a vault at run time instead of embedding them in source code',
      'Committing API keys to a private Git repository is safe because only employees can read it',
      'Short-lived, automatically rotated credentials limit the damage when a secret leaks',
      'One shared administrator password for all devices makes auditing easier',
      'Secrets need protection only while stored on disk, not while in transit',
    ],
    answers: [0, 2],
    difficulty: 3,
    explanation:
      'Fetching secrets from a vault at run time keeps them out of code and configuration, and short-lived rotated credentials shrink the window in which a leaked secret is useful. Private repositories are copied, cloned and eventually exposed, so keys in them are still leaked. A shared password makes auditing harder because actions cannot be tied to a person, and secrets need protection on disk, in memory and in transit.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Enter the IOS global configuration command that rejects any newly configured password shorter than 12 characters.',
    answers: ['security passwords min-length 12'],
    placeholder: 'security passwords ...',
    difficulty: 2,
    explanation:
      '`security passwords min-length 12` sets the minimum length and applies to passwords configured afterward. `login block-for` controls quiet mode after failed logins, and `service password-encryption` only obscures stored clear-text passwords.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. What is the effect of this configuration?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# login block-for 120 attempts 3 within 60
R1(config)# end`,
    },
    options: [
      'After 3 failed login attempts within 60 seconds, all new login attempts are refused for 120 seconds',
      'After 120 failed attempts, logins are blocked for 3 seconds',
      'After 3 failed attempts within 120 seconds, that user account is locked for 60 seconds',
      'Every login attempt is delayed by 60 seconds and idle sessions are closed after 120 seconds',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The syntax is `login block-for <quiet seconds> attempts <failures> within <window seconds>`: 3 failures inside a 60-second window start a 120-second quiet mode. It affects the device login service for everyone, not a single user account, so the account-lock option is wrong, and the other options swap the numbers or describe `login delay` and `exec-timeout` instead.',
  },
  {
    id: 'e18',
    type: 'categorize',
    stem: 'Classify each item as something that can be shared openly or something that must be kept secret.',
    categories: ['Can be shared openly', 'Must be kept secret'],
    items: [
      { text: 'Public key', category: 0 },
      { text: 'Digital certificate', category: 0 },
      { text: 'Root CA certificate', category: 0 },
      { text: 'Private key', category: 1 },
      { text: 'Password-manager master passphrase', category: 1 },
      { text: 'TOTP shared secret', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'Public keys, certificates and root CA certificates are designed to be distributed; their security comes from the CA signature. Private keys, a master passphrase and the TOTP shared secret would let an attacker impersonate the owner if they leaked.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A company wants laptops to join the corporate Wi-Fi without users typing passwords, using a credential installed on each laptop and verified against the enterprise CA. Which password alternative is being used?',
    options: ['Biometric authentication', 'Certificate-based authentication', 'A password manager', 'Knowledge-based authentication'],
    answer: 1,
    difficulty: 2,
    explanation:
      'A credential issued by a CA and proven with a private key is certificate-based authentication; with 802.1X this is EAP-TLS. Biometrics would verify a person\'s trait, a password manager still stores passwords, and knowledge-based authentication relies on secrets the user remembers.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'A security architect is designing logins for administrators who manage network devices. Which two choices provide true multifactor authentication? (Choose two.)',
    options: [
      'A password and a PIN that the administrator memorizes',
      'A password and a 6-digit code from an authenticator app',
      'Two different passwords stored in a password manager',
      'A smart card with a certificate and a PIN',
      'A long passphrase and a security-question answer',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'The authenticator-app login combines know and have, and the smart card with PIN also combines have and know. A password plus a PIN, two passwords, and a passphrase plus a security answer each use only knowledge factors, so they are single-factor authentication used more than once.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about this door-access login is correct?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'sequence',
        actors: [
          { id: 'user', label: 'User', icon: 'user' },
          { id: 'rd', label: 'Door reader', icon: 'box' },
        ],
        steps: [
          { from: 'user', to: 'rd', label: '1. Fingerprint presented' },
          { from: 'rd', to: 'user', label: '2. PIN requested' },
          { from: 'user', to: 'rd', label: '3. PIN entered' },
          { from: 'rd', to: 'user', label: '4. Door unlocked', tone: 'good' },
        ],
      },
    },
    options: [
      'It is single-factor authentication because only one reader is used',
      'It is not MFA because a PIN is something you have',
      'It is MFA: something you are plus something you know',
      'It is MFA only if the PIN is stored on a smart card',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The fingerprint is an inherence factor (are) and the PIN is a knowledge factor (know), two different categories, so this is MFA no matter how many devices are involved. A PIN is memorized, not a possession, and it does not need to live on a smart card to count as a knowledge factor.',
  },
];
