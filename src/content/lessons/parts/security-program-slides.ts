import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Security Program Elements',
    subtitle: 'Awareness, training, physical access control and the policy behind them',
    notes:
      'Firewalls and ACLs cannot stop an employee who hands over a password, or a stranger who walks into the wiring closet. A **security program** is the organization-wide set of activities that covers those gaps. It starts from a written **security policy** and is carried out through **user awareness**, **user training** and **physical access control**, alongside the technical controls you study elsewhere in the course. This is exam topic 5.2 of CCNA v1.1 and falls under domain 4 on v2.0; the content is the same in both versions. The questions are almost always conceptual: a short scenario such as a monthly phishing simulation, a mandatory course for network administrators or a badge reader on a closet door, and your task is to name the element. The key skill is telling **awareness**, **training** and **physical access control** apart. By the end of the lesson you will also know what a security policy contains, why mantraps exist and how to protect a console port.',
  },
  {
    kind: 'bullets',
    title: 'Why a security program?',
    bullets: [
      'Technology alone cannot stop **people** or **physical** intrusion',
      'A **security policy** states the rules and the reasons for them',
      '**User awareness** keeps everyone alert; **user training** builds role skills',
      '**Physical access control** keeps unauthorized people away from devices',
      'Administrative, physical and technical controls work as layers',
    ],
    diagram: {
      type: 'flow',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'pol', label: 'Security policy', sub: 'the written rules', shape: 'pill', tone: 'accent', x: 1.4, y: 2.3 },
        { id: 'aw', label: 'User awareness', sub: 'everyone, informal', x: 5.2, y: 0.8 },
        { id: 'tr', label: 'User training', sub: 'roles, formal', x: 5.2, y: 2.3 },
        { id: 'ph', label: 'Physical access', sub: 'locks, badges, mantraps', x: 5.2, y: 3.8 },
        { id: 'ast', label: 'Protected assets', sub: 'data, devices, services', shape: 'pill', tone: 'good', x: 8.8, y: 2.3 },
      ],
      edges: [
        { from: 'pol', to: 'aw', label: 'communicated by' },
        { from: 'pol', to: 'tr', label: 'taught through' },
        { from: 'pol', to: 'ph', label: 'enforced by' },
        { from: 'aw', to: 'ast' },
        { from: 'tr', to: 'ast' },
        { from: 'ph', to: 'ast' },
      ],
    },
    notes:
      'Most breaches do not defeat a firewall; they go around it. A contractor props open the wiring closet door and a stranger plugs a laptop into a switch port; an accountant approves a convincing fake invoice; an administrator reuses a password from a personal account. No ACL, IPS or encryption feature sees these events. A **security program** is the set of organization-wide activities that closes those gaps. It begins with a written **security policy**, which states the rules, and then relies on three practical elements: **user awareness** keeps every employee alert, **user training** gives specific roles the skills to do their jobs securely, and **physical access control** keeps unauthorized people away from facilities and devices. Together with technical controls such as firewalls and AAA, they form the layers of **defense in depth**. For the exam, remember that these three elements are administrative and physical measures, not features you configure on the network.',
  },
  {
    kind: 'table',
    title: 'The three elements compared',
    columns: ['Element', 'Audience', 'Format', 'Main goal', 'Examples'],
    rows: [
      ['**User awareness**', 'All users', 'Informal, short, continuous', 'Change behavior: recognize threats, know the rules', 'Posters, newsletters, tip emails, phishing simulations, banners'],
      ['**User training**', 'Specific roles', 'Formal, structured, assessed', 'Build the skills to do a job securely', 'Hardening course for admins, secure-coding class, incident drills'],
      ['**Physical access control**', 'Everyone entering a space', 'Barriers and procedures', 'Keep unauthorized people away from sites and devices', 'Badges, locks, biometrics, mantraps, guards, cameras'],
    ],
    caption: 'Awareness: know it exists. Training: know how. Physical: cannot get to it.',
    notes:
      'This table is the single most important thing in the lesson, so read it by columns. **User awareness** is aimed at everyone and delivered informally and continuously: a poster, a newsletter, a tip-of-the-week email, a phishing simulation. Its goal is behavior, so people notice threats and remember the rules. **User training** is aimed at specific roles and delivered formally: a scheduled course with objectives, an instructor or module, and usually a test. Its goal is skill, so a network administrator can harden a router or a developer can write safe code. **Physical access control** is different in kind: it does not teach anyone anything, it keeps people away from facilities and devices using locks, badges, biometrics, mantraps, guards and cameras. When you read an exam scenario, ask who the audience is, how formal the activity is, and whether it changes behavior, builds skill or restricts access. Those three questions identify the element almost every time.',
  },
  {
    kind: 'bullets',
    title: 'User awareness programs',
    bullets: [
      'Goal: every employee knows the **threats** and the **rules**',
      'Informal and continuous: posters, newsletters, tip-of-the-week emails',
      '**Phishing simulations** test and teach with harmless fake attacks',
      '**Policy communication**: acceptable-use sign-off, intranet pages, login banners',
      'Measure click rate, report rate and trends over time',
      'Aimed at **everyone**, from interns to executives',
    ],
    diagram: {
      type: 'flow',
      width: 7.6,
      height: 3.8,
      nodes: [
        { id: 'n1', label: 'Send simulated phish', x: 1.8, y: 1 },
        { id: 'n2', label: 'Count clicks and reports', x: 5.8, y: 1 },
        { id: 'n3', label: 'Teach on the spot', tone: 'accent', x: 5.8, y: 2.8 },
        { id: 'n4', label: 'Adjust and repeat', x: 1.8, y: 2.8 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n1', dashed: true },
      ],
    },
    notes:
      'A **user awareness program** keeps security in front of every employee through short, frequent and informal messages: posters by the coffee machine, a monthly newsletter, tip-of-the-week emails, intranet pages, a security awareness month, lunch-and-learn sessions. Its goal is changing everyday habits rather than teaching a technical skill, so people hesitate before clicking an unexpected attachment, hold back from letting a stranger through a door, and report anything suspicious. Two tools deserve special attention for the exam. **Phishing simulations** send a harmless fake phishing email, record who clicks, who enters credentials and who reports it, and teach on the spot. **Policy communication** makes sure people know the rules exist: acceptable-use sign-off at hiring, reminders, intranet pages and login banners. Because awareness reaches everyone but is not assessed in depth, it is the lighter, broader half of the human program. Measure it with click rates, report rates and trends rather than exam scores.',
  },
  {
    kind: 'diagram',
    title: 'A phishing simulation, step by step',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'sec', label: 'Security team', icon: 'user' },
        { id: 'a', label: 'Employee A', icon: 'pc' },
        { id: 'b', label: 'Employee B', icon: 'laptop' },
        { id: 'pg', label: 'Awareness page', icon: 'server' },
      ],
      steps: [
        { from: 'sec', to: 'a', label: 'Simulated phishing email', sub: 'harmless fake parcel notice' },
        { from: 'sec', to: 'b', label: 'Same email' },
        { from: 'a', to: 'pg', label: 'Clicks the link', sub: 'click is recorded', tone: 'warn' },
        { from: 'pg', to: 'a', label: 'Instant feedback', sub: 'the warning signs you missed', tone: 'accent' },
        { from: 'b', to: 'sec', label: 'Reports the email', sub: 'the behavior you want', tone: 'good' },
        { note: 'Metrics: click rate, report rate, repeat clickers' },
      ],
    },
    caption: 'A simulation is an awareness activity: broad, informal and aimed at behavior.',
    notes:
      'Walk through a simulation as the security team would run it. With management approval, the team sends a realistic but harmless phishing email to staff. Employee A clicks the link; the click is recorded and the employee immediately lands on a short page explaining the warning signs they missed. That moment, called just-in-time teaching, is when people learn best. Employee B notices the odd sender address and uses the report button, which is the behavior you want to encourage and measure. At the end the team reviews the metrics: click rate, report rate and repeat clickers. Good programs reward reporting instead of shaming clickers, run simulations regularly with varied lures, and send people who keep failing to focused follow-up training. Remember the classification: a simulation is an **awareness** activity because it is broad, informal and behavior-focused, even though it teaches something. The follow-up course for repeat clickers would be training.',
  },
  {
    kind: 'cli',
    title: 'Policy at the point of use: login banner',
    code: `R1# configure terminal
R1(config)# banner login #
Enter TEXT message.  End with the character '#'.
AUTHORIZED USERS ONLY. Activity on this device is monitored and logged.
Use of this system constitutes acceptance of the Acceptable Use Policy.
#
R1(config)# end
R1# show running-config | section banner
banner login ^C
AUTHORIZED USERS ONLY. Activity on this device is monitored and logged.
Use of this system constitutes acceptance of the Acceptable Use Policy.
^C`,
    highlight: ['banner login #', 'AUTHORIZED USERS ONLY', 'Acceptable Use Policy'],
    caption: 'The first character you type after the command is the delimiter; IOS stores it as ^C.',
    bullets: [
      '`banner login`: shown before the username prompt',
      '`banner exec`: shown after a successful login; `banner motd`: message of the day',
      'State: authorized users only, monitoring, acceptance of the policy',
      'Avoid friendly wording such as welcome; legal teams often object',
    ],
    notes:
      'A policy that nobody reads protects nothing, so organizations communicate it at the point of use. On network devices the classic tool is the **login banner**. `banner login` is displayed before the username prompt, `banner exec` after a successful login, and `banner motd` is a general message of the day. The first character you type after the command is the delimiter that ends the text; here it is the # character, and IOS stores it internally as ^C, which you see in the running configuration. A good banner states that access is for authorized users only, that activity is monitored and logged, and that use means acceptance of the acceptable use policy. Legal advisers often ask that it avoid friendly wording such as welcome, because a welcoming message can weaken a later claim against an intruder. Banners do not stop attackers, but they remove the excuse of not knowing the rule and support disciplinary or legal action. That makes them a policy communication tool, so they belong to awareness.',
  },
  {
    kind: 'table',
    title: 'User training: formal and role-based',
    columns: ['Role', 'Typical training', 'Why this role'],
    rows: [
      ['All new hires', 'Onboarding course on policies and safe computing', 'Everyone needs the same baseline'],
      ['Network administrators', 'Device hardening, AAA, secure management access, change control', 'They hold privileged access'],
      ['Developers', 'Secure coding, handling of secrets, input validation', 'Their mistakes become vulnerabilities'],
      ['Help desk', 'Identity verification and resisting social engineering', 'Callers try to talk them into password resets'],
      ['Executives and finance', 'Whaling, payment fraud, verification of transfer requests', 'They are high-value targets'],
      ['Security operations', 'Incident response drills, tools, evidence handling', 'They act when controls fail'],
    ],
    caption: 'Formal, structured, role-specific, assessed and repeated (often annually).',
    notes:
      '**User training** is the formal side of the human program. Unlike awareness, it is structured: defined objectives, a curriculum, an instructor or learning module, an assessment, and records showing who completed it. It is usually mandatory, scheduled at onboarding and repeated, often annually, and it is targeted at specific roles because different jobs carry different risks. Network administrators learn device hardening, AAA and change control because they hold privileged access. Developers learn secure coding because their mistakes become vulnerabilities. The help desk learns to verify identity before resetting a password, because callers will try to talk them into it. Executives and finance staff learn to spot whaling and payment fraud. Security operations staff practice incident response. The exam clue is formality and targeting: a course, a certification, a graded test or a role-specific curriculum points to training, while a poster or a newsletter points to awareness. Both are administrative controls rather than technical ones.',
  },
  {
    kind: 'compare',
    title: 'Awareness versus training',
    left: {
      heading: 'User awareness',
      bullets: [
        'Audience: **all** staff',
        'Informal, short and frequent',
        'Answers: **what** are the threats and the rules?',
        'Shapes behavior and culture',
        'Posters, newsletters, simulated phishing',
      ],
    },
    right: {
      heading: 'User training',
      tone: 'accent',
      bullets: [
        'Audience: **specific roles**',
        'Formal, structured, often mandatory',
        'Answers: **how** do I do my job securely?',
        'Builds skills and is assessed',
        'Hardening course, secure-coding class, annual exam',
      ],
    },
    notes:
      'Put the two side by side and the pattern is simple. Awareness answers **what** the threats and the rules are, and why they matter; training answers **how** to do a particular job securely. Awareness is broad, informal, continuous and meant to shape culture; training is narrow, formal, scheduled and assessed. A useful analogy is road safety: billboards and public campaigns remind every driver to buckle up and never to drink and drive, which is awareness; a driving course with an examination teaches one person how to drive a truck, which is training. The same organization needs both. Awareness without training leaves administrators knowing that threats exist but not how to harden devices; training without awareness leaves the rest of the staff, who never attend the course, exposed to the first phishing email. On the exam the wrong answer is often the other element, so decide by audience and formality.',
  },
  {
    kind: 'diagram',
    title: 'Physical access control in layers',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Outside to inside',
          layers: [
            { label: 'Site perimeter', sub: 'fences, lighting, guards, cameras' },
            { label: 'Building entrance', sub: 'reception, badge reader, visitor log' },
            { label: 'Secure area', sub: 'mantrap, second authentication, escort rules' },
            { label: 'Wiring closet or data center', sub: 'locked door, badge plus PIN, camera' },
            { label: 'Rack and device', sub: 'locked cabinet, protected console port', tone: 'accent' },
          ],
        },
      ],
    },
    caption: 'Each layer slows an intruder and gives another chance to detect them.',
    notes:
      '**Physical access control** protects the real-world side of security. Picture concentric rings around a rack of switches. The outer ring is the site perimeter: fences, lighting, guards and cameras. Next is the building entrance with a receptionist, a badge reader and a visitor log. Inside, sensitive areas such as a data center may add a mantrap and a second authentication. The wiring closet or data center door has its own lock, usually a badge plus a PIN, and a camera. Finally the rack and the device have a locked cabinet and protection on the console port. Each ring slows an intruder and gives another chance to notice them, which is defense in depth applied to the physical world. The reason it matters for networking is simple: anyone who can touch a switch can plug in a laptop, tap a cable, reboot the device or use the console port, and logical controls such as ACLs cannot defend against that.',
  },
  {
    kind: 'diagram',
    title: 'The mantrap (access control vestibule)',
    diagram: {
      type: 'flow',
      width: 11,
      height: 3,
      nodes: [
        { id: 'n1', label: 'Corridor', shape: 'pill', x: 1.1, y: 1.5 },
        { id: 'n2', label: 'Door 1', sub: 'badge reader', x: 3.4, y: 1.5 },
        { id: 'n3', label: 'Vestibule', sub: 'one person at a time', tone: 'accent', x: 5.7, y: 1.5 },
        { id: 'n4', label: 'Door 2', sub: 'badge plus fingerprint', x: 8, y: 1.5 },
        { id: 'n5', label: 'Data center', shape: 'pill', tone: 'good', x: 10, y: 1.5 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
      ],
    },
    caption: 'The two doors never open together, so nobody can slip in behind the first person.',
    notes:
      'A **mantrap**, now often called an **access control vestibule**, is a small room with two interlocked doors. The first door opens for an authorized badge, the person steps inside, and only after that door has closed and the person has authenticated again, perhaps with a PIN or a fingerprint, does the second door open. Because the doors never open at the same time, a second person cannot slip in behind the first, which is exactly how **tailgating** (also called piggybacking) works. A badge reader alone cannot prevent tailgating: it authenticates the first person but has no idea who walks in behind them. A mantrap solves that by forcing one person at a time, and some designs add a camera, weight sensors or a guard who watches the vestibule. The costs are space, installation and slower throughput, so mantraps are reserved for sensitive areas such as data centers. On the exam, prevent tailgating almost always means mantrap or guard.',
  },
  {
    kind: 'table',
    title: 'Physical controls compared',
    columns: ['Control', 'How it works', 'Strength', 'Weakness'],
    rows: [
      ['**Lock and key**', 'A mechanical key opens the door', 'Cheap and simple', 'Keys are copied and lost; no record of entry'],
      ['**Keypad**', 'A code is typed at the door', 'No key to lose', 'Codes are shared and shoulder-surfed'],
      ['**Badge reader**', 'RFID or smart card is read and logged', 'Audit trail; instant revocation', 'Cards are lent, stolen or cloned; tailgating'],
      ['**Biometrics**', 'Fingerprint, iris or face is matched', 'Cannot be forgotten or lent', 'Cost, error rates, privacy concerns'],
      ['**Mantrap**', 'Two interlocked doors, one person at a time', 'Defeats tailgating', 'Space, cost, slower throughput'],
      ['**Security guard**', 'A person checks identity and watches', 'Judgment and flexibility', 'Cost; can be socially engineered'],
      ['**Camera (CCTV)**', 'Records and monitors areas', 'Detects, deters, gives evidence', 'Does not stop entry by itself'],
    ],
    caption: 'Combining factors, such as badge plus PIN, beats any single control.',
    notes:
      'No single physical control is perfect, so know the trade-offs. A **mechanical lock** is cheap but keys are copied and lost, and there is no record of who entered. A **keypad** removes the key but codes get shared and shoulder-surfed. A **badge reader** logs every entry and lets you revoke a lost card instantly, but cards can be lent, stolen or, for some proximity technologies, cloned, and the reader cannot stop tailgating. **Biometrics** authenticate something you are, so they cannot be forgotten or lent, but they cost more, they have false acceptance and false rejection errors, and they raise privacy concerns. A **mantrap** defeats tailgating at the price of space and throughput. **Guards** bring judgment but can be socially engineered, and **cameras** detect, deter and record but do not by themselves stop entry. Combining factors, such as a badge (something you have) plus a PIN (something you know), gives stronger protection than either alone.',
  },
  {
    kind: 'cli',
    title: 'Securing console ports and unused ports',
    code: `R1(config)# username admin secret Str0ngPass2026
R1(config)# line console 0
R1(config-line)# login local
R1(config-line)# exec-timeout 5 0
R1(config-line)# logging synchronous
R1(config-line)# exit
SW1(config)# interface range FastEthernet0/13 - 24
SW1(config-if-range)# description UNUSED - shut down
SW1(config-if-range)# shutdown`,
    highlight: ['login local', 'exec-timeout 5 0', 'shutdown'],
    caption: 'Top: console line on R1. Bottom: unused access ports on SW1.',
    bullets: [
      'Lock the closet **and** require a login on the console line',
      '`login local` uses the local username database; `exec-timeout` ends idle sessions',
      'Shut down unused switch ports so nobody can plug in a laptop',
      'Keep a visitor log, escort contractors, never leave a console cable attached',
    ],
    notes:
      'Physical security of a network device has two halves: keep strangers away from it, and make sure that whoever reaches it still has to authenticate. The console port is the sensitive part because it works without any network, so ACLs and VTY settings do not apply. Someone with a console cable and physical access can try to log in, and on many platforms can interrupt the boot process and perform password recovery, which is why a device in an unlocked closet is effectively unprotected. In the first block, `login local` makes the console prompt for a local username and password, `exec-timeout 5 0` logs out an idle session after 5 minutes so an unattended console is not left open, and `logging synchronous` is a convenience. In the second block, unused switch ports are shut down so nobody can plug in a laptop and gain network access. Lock the closet, keep a visitor log, escort contractors and never leave a console cable plugged in.',
  },
  {
    kind: 'diagram',
    title: 'The security policy and its supporting documents',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'From high level to detail',
          layers: [
            { label: 'Security policy', sub: 'what and why: mandatory, high level, approved by management', tone: 'accent' },
            { label: 'Standards', sub: 'specific mandatory requirements, such as minimum password length' },
            { label: 'Procedures', sub: 'step-by-step instructions for carrying out a task' },
            { label: 'Guidelines', sub: 'recommended practices; optional', tone: 'muted' },
          ],
        },
      ],
    },
    caption: 'The policy says what must be true; the other documents explain how.',
    notes:
      'A **security policy** is a formal, written document that states how an organization protects its information and technology. It is approved by senior management, which gives it authority, and it tells everyone what is required and why. Policies are deliberately high level and long-lived, so the details live in supporting documents. **Standards** are specific, mandatory requirements that implement the policy, for example a minimum password length or an approved encryption algorithm. **Procedures** are step-by-step instructions that explain how to carry out a task in compliance, such as how to onboard a new switch. **Guidelines** are recommendations or good practices that are optional. A policy never names a vendor command, because the technology will change before the policy does; the procedure is where the commands appear. The program elements in this lesson depend on the policy: awareness communicates it, training teaches how to follow it, physical controls enforce part of it, and technical controls enforce the rest.',
  },
  {
    kind: 'table',
    title: 'Elements of a security policy',
    columns: ['Element', 'What it states', 'Example'],
    rows: [
      ['**Purpose**', 'Why the policy exists', 'Protect company data and keep the network available'],
      ['**Scope**', 'Who and what it covers', 'Employees, contractors, company and connected devices'],
      ['**Roles and responsibilities**', 'Who owns, approves and follows it', 'The security team owns it; managers enforce it; users comply'],
      ['**Policy statements**', 'The rules themselves', 'Company devices must be locked when unattended'],
      ['**Compliance and enforcement**', 'How violations are handled', 'Violations lead to disciplinary action'],
      ['**Exceptions**', 'How to request a deviation', 'Written approval from the security team'],
      ['**Review**', 'How often it is updated', 'Reviewed annually and after major incidents'],
    ],
    caption: 'Section names vary between organizations; the building blocks do not.',
    notes:
      'Policies differ in format, but well-written ones contain the same building blocks. The **purpose** explains why the policy exists. The **scope** says whom and what it covers: employees, contractors, company and personal devices, networks. **Roles and responsibilities** assign ownership, approval and duties, for example who maintains the policy and who must comply. The **policy statements** are the rules themselves. **Compliance and enforcement** describe how violations are detected and what the consequences are, because a rule without consequences is only advice. An **exceptions** process lets the business request a documented deviation with approval, and a **review** schedule keeps the document current, typically annually and after major incidents. Organizations name these sections differently, so on the exam focus on the idea: a policy has an owner, a scope, rules and enforcement, and it is approved by management and reviewed periodically.',
  },
  {
    kind: 'table',
    title: 'Common security policies',
    columns: ['Policy', 'What it governs'],
    rows: [
      ['**Acceptable use policy (AUP)**', 'What users may and may not do with company systems, email, Internet access and data'],
      ['**Password policy**', 'Length, complexity, change and storage rules; multifactor requirements'],
      ['**Remote access policy**', 'How users connect from outside, for example VPN on a managed device with MFA'],
      ['**BYOD policy**', 'Personal devices on the corporate network: enrollment and minimum security settings'],
      ['**Data classification and handling**', 'Labels such as public, internal and confidential, and how each is stored and shared'],
      ['**Incident response policy**', 'Who does what when a security event occurs'],
      ['**Physical security policy**', 'Badges, visitors, wiring closets and data centers'],
    ],
    caption: 'A company has a family of focused policies, not one giant document.',
    notes:
      'A company rarely has one giant security policy; it has a family of focused ones. The **acceptable use policy (AUP)** defines what users may and may not do with company systems, email, Internet access and data, and it is usually signed at hiring. The **password policy** sets length, complexity, change and storage rules and may require multifactor authentication. A **remote access policy** governs how users connect from outside, for example only through a VPN on managed devices with MFA. A **BYOD policy** covers personal phones and laptops on the corporate network: enrollment, minimum security settings and what happens if the device is lost. **Data classification and handling** labels information, for example public, internal and confidential, and prescribes how each is stored and shared. The **incident response policy** defines who does what when something goes wrong, and the **physical security policy** covers badges, visitors, closets and data centers. Expect scenario questions that describe a rule and ask which policy it belongs to.',
  },
  {
    kind: 'table',
    title: 'Administrative, technical and physical controls',
    columns: ['Category', 'What it is', 'Examples'],
    rows: [
      ['**Administrative** (managerial)', 'Rules and people-focused measures', 'Security policy, awareness program, training, background checks, visitor procedures'],
      ['**Technical** (logical)', 'Enforced by hardware and software', 'Firewalls, ACLs, IPS, AAA, encryption, port security'],
      ['**Physical**', 'Acts in the real world', 'Locks, badges, biometrics, mantraps, guards, cameras'],
    ],
    caption: 'Awareness and training are administrative; badges and mantraps are physical.',
    notes:
      'Another way to sort everything in this lesson is by control category. **Administrative** controls, also called managerial controls, are rules and people-focused measures: the security policy, the awareness program, training, background checks and visitor procedures. **Technical** controls, also called logical controls, are enforced by hardware or software: firewalls, ACLs, IPS, AAA, encryption and port security. **Physical** controls act in the real world: locks, badges, biometrics, mantraps, guards and cameras. Awareness and training are therefore administrative, even though they help defend against technical attacks, while a badge reader is physical even though it is an electronic device. You can also classify controls by purpose: a lock is preventive, a camera is detective, a warning sign is a deterrent, and restoring from backup is corrective. A strong program uses all categories, because each covers weaknesses of the others.',
  },
  {
    kind: 'table',
    title: 'Practice: name the element',
    columns: ['Scenario', 'Element'],
    rows: [
      ['Monthly newsletter and posters about spotting suspicious email', '**User awareness**'],
      ['A fake phishing email sent to all staff to see who clicks', '**User awareness** (simulation)'],
      ['Two-day course on hardening Cisco devices for the network team', '**User training**'],
      ['Annual secure-coding class with a graded test for developers', '**User training**'],
      ['Badge reader and PIN pad on the wiring closet door', '**Physical access control**'],
      ['Two interlocked doors at the data center entrance', '**Physical access control** (mantrap)'],
      ['Document stating users may not install unapproved software', '**Security policy** (acceptable use)'],
    ],
    caption: 'Ask: who is the audience, how formal is it, and does it teach, remind or restrict?',
    notes:
      'Use this table as practice for the question style you will meet. Cover the right-hand column, read each scenario, and decide quickly. A newsletter, posters and a simulated phishing campaign are broad and informal, so they are awareness. A two-day course on hardening Cisco devices, or an annual secure-coding class with a graded test, is formal and role-specific, so it is training. A badge reader with a PIN pad and two interlocked doors are physical access control. A document stating that users may not install unapproved software is an acceptable use policy, which belongs to the security policy family. Watch for scenarios that mix cues: a simulated phishing email teaches users, but it is still awareness because the audience is everyone and the format is informal. If the question asks for the best way to teach a specific team a specific skill, the answer is training.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: '**Awareness is informal, broad and continuous. Training is formal, role-based and assessed. Physical access control keeps people away from devices.**',
    bullets: [
      'Posters, newsletters and phishing simulations = **awareness**, not training',
      'A formal course for admins, developers or help desk = **training**',
      'Badges, locks, biometrics, mantraps, guards, cameras = **physical** controls',
      'A **mantrap** stops tailgating; a badge reader alone does not',
      'Policy = mandatory rules from management; guidelines are optional',
      'Console security needs a lock **and** a login on the line',
    ],
    notes:
      'These are the traps in the order they usually appear. The classic one is awareness versus training: posters, newsletters, tip emails and phishing simulations are awareness, while a formal course for a particular role, especially with an exam, is training. Second, physical controls are about access to places and devices, and a mantrap is the answer to tailgating, not a badge reader alone. Third, remember what counts as technical: ACLs, firewalls and IPS do not replace awareness, training or locks, and none of these program elements is a feature you configure on a router. Fourth, policy vocabulary: the policy is the mandatory high-level statement, standards are mandatory specifics, procedures are steps, and guidelines are optional. Fifth, console security needs both a locked room and authentication on the line. Finally, check the stem for the audience: all staff points to awareness, a specific role points to training.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'A **security policy** approved by management defines the rules',
      '**User awareness**: informal, continuous, for everyone; phishing simulations, banners',
      '**User training**: formal, role-based and assessed; builds job skills',
      '**Physical access control**: locks, badges, biometrics, mantraps, guards, cameras',
      'Protect console ports with a locked room **and** a login; shut unused ports',
      'Administrative and physical controls complement technical controls',
    ],
    notes:
      'Finish by connecting the pieces. A written **security policy**, approved by management, defines the rules. **User awareness** communicates them to everyone through informal, continuous channels such as posters, newsletters, banners and phishing simulations, and aims at behavior. **User training** gives specific roles the formal, assessed skills to follow the policy in their jobs, from hardening devices to secure coding. **Physical access control** keeps unauthorized people away from sites, closets and devices with locks, badges, biometrics, mantraps, guards and cameras, and the console port needs a lock and a login. These are administrative and physical controls that complement the technical controls in the rest of the course. If you can tell the three elements apart from a one-sentence scenario, name the right control for tailgating, and list the building blocks of a policy, you are ready for exam topic 5.2. Next, review the flashcards, take the quiz, and then try the scenario-based exam questions.',
  },
];
