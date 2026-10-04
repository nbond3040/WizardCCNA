import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Security program', back: 'The organization-wide set of policy, awareness, training and physical controls that protect assets alongside technical controls.' },
  { id: 'f2', front: 'The three program elements in CCNA topic 5.2', back: '**User awareness**, **user training** and **physical access control**.' },
  { id: 'f3', front: 'User awareness program', back: 'Informal, continuous messages for **all** staff (posters, newsletters, tips, simulations) that build threat recognition and rule knowledge.' },
  { id: 'f4', front: 'Phishing simulation', back: 'A harmless fake phishing email that measures who clicks or reports and teaches on the spot. An **awareness** activity.' },
  { id: 'f5', front: 'Policy communication', back: 'Making sure users know the rules: acceptable-use sign-off, intranet pages, reminders and login banners.' },
  { id: 'f6', front: 'User training', back: '**Formal**, structured, usually **role-based** instruction that builds the skills to do a job securely; assessed and repeated.' },
  { id: 'f7', front: 'Awareness versus training: audience', back: 'Awareness targets **all** users; training targets **specific roles**.' },
  { id: 'f8', front: 'Awareness versus training: question answered', back: 'Awareness: **what** are the threats and rules? Training: **how** do I do my job securely?' },
  { id: 'f9', front: 'Example of role-based training', back: 'Network administrators: device hardening and AAA. Developers: secure coding. Help desk: identity verification.' },
  { id: 'f10', front: 'Physical access control', back: 'Measures that keep unauthorized people away from sites, rooms and devices: locks, badges, biometrics, mantraps, guards, cameras.' },
  { id: 'f11', front: 'Mantrap (access control vestibule)', back: 'A small room with two interlocked doors; only one opens at a time, so it stops tailgating.' },
  { id: 'f12', front: 'Tailgating (piggybacking)', back: 'Following an authorized person through a secured door without authenticating. Stopped by a mantrap or a guard.' },
  { id: 'f13', front: 'Badge reader', back: 'Reads an RFID or smart card, logs entries and allows instant revocation; cards can be lent, stolen or cloned.' },
  { id: 'f14', front: 'Biometric access control', back: 'Authenticates by something you **are** (fingerprint, iris, face). Cannot be forgotten, but has error rates and privacy concerns.' },
  { id: 'f15', front: 'Security camera (CCTV)', back: 'A detective and deterrent control: records evidence but does not stop entry by itself.' },
  { id: 'f16', front: 'Badge plus PIN', back: 'Two factors: something you **have** (the badge) and something you **know** (the PIN).' },
  { id: 'f17', front: 'Why protect the console port physically?', back: 'It works without a network and bypasses ACLs; with console access an intruder can try to log in or recover passwords.' },
  { id: 'f18', front: 'Commands that harden a console line', back: '`login local` (use local accounts) and `exec-timeout minutes seconds` (end idle sessions).' },
  { id: 'f19', front: 'Unused switch ports', back: '`shutdown` them (optionally park them in an unused VLAN) so nobody can plug in a laptop.' },
  { id: 'f20', front: 'Security policy', back: 'A formal written document, approved by management, that states the rules for protecting information and technology.' },
  { id: 'f21', front: 'Typical elements of a security policy', back: 'Purpose, scope, roles and responsibilities, policy statements, enforcement, exceptions and review.' },
  { id: 'f22', front: 'Standard, procedure and guideline', back: 'Standard = mandatory specific requirement; procedure = step-by-step instructions; guideline = optional recommendation.' },
  { id: 'f23', front: 'Acceptable use policy (AUP)', back: 'Defines what users may and may not do with company systems, email, Internet access and data.' },
  { id: 'f24', front: 'Administrative, technical and physical controls', back: 'Administrative: policy, awareness, training. Technical: firewalls, ACLs, AAA. Physical: locks, badges, guards.' },
  { id: 'f25', front: '`banner login`', back: 'Shows a legal or policy notice before the username prompt; the text is wrapped in a delimiter character such as #.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which security program element uses posters, newsletters and simulated phishing emails to keep all employees alert?',
    options: ['User training', 'User awareness', 'Physical access control', 'Technical enforcement'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**User awareness** is informal, continuous and aimed at everyone. Training is a formal, role-based course, physical access control restricts entry to places and devices, and none of these activities is a technical enforcement mechanism.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'Which element is a formal, role-based course such as device hardening for network administrators?',
    options: ['User awareness', 'Physical access control', 'User training', 'Security guideline'],
    answer: 2,
    difficulty: 1,
    explanation:
      '**User training** is formal, structured, targeted at specific roles and usually assessed. Awareness is informal and aimed at everyone, and physical access control is about doors and devices.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two are physical access controls? (Choose two.)',
    options: ['Mantrap', 'Phishing simulation', 'Badge reader', 'Acceptable use policy', 'Access control list'],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A mantrap and a badge reader both restrict physical entry. A phishing simulation is awareness, an acceptable use policy is part of the security policy, and an ACL is a technical control on a network device.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each example to the program element it represents.',
    pairs: [
      { left: 'Simulated phishing campaign', right: 'User awareness' },
      { left: 'Graded secure-coding course for developers', right: 'User training' },
      { left: 'Badge reader on the wiring closet door', right: 'Physical access control' },
      { left: 'Document approved by management stating the rules', right: 'Security policy' },
    ],
    difficulty: 1,
    explanation:
      'A simulation is broad and informal (awareness), a graded course for one role is training, a badge reader restricts entry (physical), and a management-approved rulebook is the security policy.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'What is the one-word term for a small room with two interlocked doors that prevents tailgating?',
    answers: ['mantrap', 'man-trap', 'man trap'],
    placeholder: 'term',
    difficulty: 1,
    explanation:
      'A **mantrap** (also called an access control vestibule) lets only one person through at a time, because the second door opens only after the first has closed.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which statement about a security policy is true?',
    options: [
      'It is an optional set of recommendations that users may ignore',
      'It replaces the need for user awareness and training programs',
      'It is a formal document approved by management that sets the rules',
      'It is a technical control enforced by the firewalls and routers',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'A security policy is a formal, mandatory document approved by management. Optional recommendations are guidelines, awareness and training are needed to make the policy effective, and the policy itself is not a technical control.',
  },
  {
    id: 'q7',
    type: 'order',
    stem: 'Put the layers of physical access control in order from outermost to innermost.',
    items: [
      'Site perimeter with fence and guards',
      'Building entrance with badge reader',
      'Mantrap into the secure area',
      'Locked wiring closet',
      'Locked rack and protected console port',
    ],
    difficulty: 2,
    explanation:
      'Physical security works in rings from the site boundary to the building, the secure area, the closet and finally the device itself. Each layer slows an intruder and gives another chance to detect them.',
  },
];
