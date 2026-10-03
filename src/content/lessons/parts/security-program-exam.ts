import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement best describes a user awareness program?',
    options: [
      'A formal, graded course for network administrators only',
      'A set of locks and badge readers on sensitive rooms',
      'Ongoing, informal communication that keeps all employees alert to threats and rules',
      'A firewall policy that blocks risky websites',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'Awareness is broad, informal and continuous: posters, newsletters, tip emails and phishing simulations for everyone. The graded course for one role is training, locks and badges are physical access control, and a web-blocking policy is a technical control.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is correct?',
    exhibit: {
      kind: 'table',
      columns: ['Program', 'Audience', 'Format', 'Frequency'],
      rows: [
        ['A', 'All employees', 'Posters, tip emails and short videos', 'Continuous'],
        ['B', 'Network administrators', 'Instructor-led course with a graded exam', 'Once a year'],
      ],
    },
    options: [
      'Program A is user training because it reaches all employees',
      'Program B is user awareness because it happens only once a year',
      'Program B is user training because it is formal, role-specific and assessed',
      'Both programs are physical access control',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'Program B is formal, aimed at one role and assessed, which defines **user training**. Program A is broad, informal and continuous, which defines awareness. The frequency does not decide the category, and neither program restricts physical access.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Which security program element does this schedule describe?',
    exhibit: {
      kind: 'table',
      columns: ['Activity', 'Frequency', 'Audience'],
      rows: [
        ['Simulated phishing email', 'Quarterly', 'All staff'],
        ['Tips on the intranet and break-room posters', 'Ongoing', 'All staff'],
        ['Reminder of the acceptable use policy', 'Monthly', 'All staff'],
      ],
    },
    options: ['User training', 'Physical access control', 'User awareness', 'Technical enforcement'],
    answer: 2,
    difficulty: 2,
    explanation:
      'Simulations, tips, posters and policy reminders aimed at all staff are classic **user awareness** activities. Training would be a formal course for specific roles, and physical access control concerns doors, locks and devices.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. A quarterly phishing simulation produced these results. Which department should receive targeted follow-up training first?',
    exhibit: {
      kind: 'table',
      columns: ['Department', 'Emails sent', 'Clicked', 'Reported'],
      rows: [
        ['Finance', '120', '42', '6'],
        ['Engineering', '200', '18', '70'],
        ['HR', '80', '16', '24'],
      ],
    },
    options: [
      'Engineering, because it received the most emails',
      'Finance, because it has the highest click rate and the lowest report rate',
      'HR, because it received the fewest emails',
      'None, because phishing simulations only measure technical controls',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Finance clicked on 42 of 120 emails (35%) and reported only 6 (5%), so its staff are the most likely to be fooled and the least likely to notice. Engineering clicked 9% and reported 35%, and HR clicked 20% and reported 30%. The number of emails sent says nothing about risk, and simulations measure human behavior, not technical controls.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Which physical control prevents tailgating by allowing only one person through at a time?',
    options: ['Security camera', 'Mantrap', 'Keypad lock', 'Badge reader'],
    answer: 1,
    difficulty: 1,
    explanation:
      'A **mantrap** (access control vestibule) uses two interlocked doors so only one person passes at a time. A camera detects but does not prevent, and keypads and badge readers authenticate only the first person, not whoever follows.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. An employee badges in at Door 1 and a stranger follows closely behind. Which feature of this design stops the stranger from reaching the data center?',
    exhibit: {
      kind: 'diagram',
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
    },
    options: [
      'Door 1 encrypts the badge data so the stranger cannot copy it',
      'The vestibule automatically records the badge number of the stranger',
      'The data center door has a stronger mechanical lock than Door 1',
      'Door 2 stays locked until Door 1 has closed and requires its own authentication',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'This is a mantrap: the interlocked doors never open together, and Door 2 needs its own authentication (badge plus fingerprint), so the stranger who slipped through Door 1 is stuck in the vestibule. The design does not encrypt badge data or record badge numbers, and lock strength is not the control being shown.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two are physical access controls? (Choose two.)',
    options: [
      'Biometric fingerprint reader',
      'Acceptable use policy',
      'Phishing simulation',
      'Locked wiring closet',
      'Role-based training course',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'A biometric reader and a locked wiring closet restrict who can physically reach a place or device. The acceptable use policy is part of the security policy, a phishing simulation is awareness, and a role-based course is training.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two activities belong to a user awareness program? (Choose two.)',
    options: [
      'Monthly security newsletter',
      'Instructor-led device hardening course with an exam',
      'Simulated phishing campaign',
      'Badge reader installation',
      'Quarterly firewall rule review',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A newsletter and a phishing simulation are broad, informal awareness activities. The instructor-led course with an exam is formal training, the badge reader is a physical control, and a firewall rule review is a technical maintenance task.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. An intruder who enters an unlocked wiring closet connects a laptop to the console port of R1. What can the intruder do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | section enable|line con
enable secret 5 $1$kJ2m$Qx9uYw1ZrD4tLhNf0aP8c/
line con 0
 logging synchronous`,
    },
    options: [
      'Nothing, because the enable secret blocks all console access',
      'Connect only if the laptop has an IP address in the management subnet',
      'Reach user EXEC mode without a password, so only physical protection stands in the way',
      'Log in only with the username and password configured under the VTY lines',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'There is no `login` command under `line con 0`, so the console accepts a connection without authentication and presents the user EXEC prompt. The enable secret protects only privileged EXEC, so the intruder can then try to guess it or use recovery methods. The console is a serial line that needs no IP address, and VTY settings do not apply to it. `login local` plus a locked closet closes the gap.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. The legal team asks for a banner that communicates policy. Which change is most appropriate?',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# banner login #
Enter TEXT message.  End with the character '#'.
Welcome to ACME Corp! We hope you enjoy your stay on our network.
#`,
    },
    options: [
      'Change the delimiter from # to $',
      'Add service password-encryption to hide the banner text',
      'Replace the text with a notice that access is for authorized users only and that activity is monitored',
      'Move the text to banner motd without changing it',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'A policy banner should state that access is restricted to authorized users, that activity is monitored and that use implies acceptance of the policy; friendly wording such as welcome is usually discouraged. The delimiter is irrelevant to content, `service password-encryption` does not apply to banners, and moving the same text to another banner type leaves the wording unchanged.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Which document is a formal, mandatory statement from management describing how the organization protects its information?',
    options: ['Guideline', 'Security policy', 'Procedure', 'Awareness newsletter'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The **security policy** is the formal, management-approved, mandatory document. Guidelines are optional recommendations, procedures are step-by-step instructions, and a newsletter is an awareness tool.',
  },
  {
    id: 'e12',
    type: 'match',
    stem: 'Match each security document to its description.',
    pairs: [
      { left: 'Security policy', right: 'High-level mandatory statement of what is required and why' },
      { left: 'Standard', right: 'Specific mandatory requirement, such as a minimum password length' },
      { left: 'Procedure', right: 'Step-by-step instructions for performing a task' },
      { left: 'Guideline', right: 'Optional recommended practice' },
    ],
    difficulty: 2,
    explanation:
      'The policy sets the mandatory direction, standards make it specific and mandatory, procedures explain how to do the work, and guidelines are advice that is not mandatory.',
  },
  {
    id: 'e13',
    type: 'categorize',
    stem: 'Classify each control as administrative, technical or physical.',
    categories: ['Administrative', 'Technical', 'Physical'],
    items: [
      { text: 'Security awareness newsletter', category: 0 },
      { text: 'Annual security training course', category: 0 },
      { text: 'Acceptable use policy', category: 0 },
      { text: 'ACL on a router interface', category: 1 },
      { text: 'AAA authentication server', category: 1 },
      { text: 'Mantrap at the data center entrance', category: 2 },
      { text: 'Security camera in the wiring closet', category: 2 },
      { text: 'Locked equipment cabinet', category: 2 },
    ],
    difficulty: 3,
    explanation:
      'Policies, awareness and training are administrative controls. ACLs and AAA are technical controls enforced by network devices and servers. Mantraps, cameras and locked cabinets act in the real world, so they are physical, even when they use electronics.',
  },
  {
    id: 'e14',
    type: 'categorize',
    stem: 'Classify each activity as user awareness or user training.',
    categories: ['User awareness', 'User training'],
    items: [
      { text: 'Monthly tip-of-the-week email', category: 0 },
      { text: 'Break-room posters about tailgating', category: 0 },
      { text: 'Simulated phishing campaign', category: 0 },
      { text: 'Instructor-led hardening course for network engineers', category: 1 },
      { text: 'Secure-coding workshop with a graded test', category: 1 },
      { text: 'Annual incident response drill for the security team', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Awareness activities are informal and reach everyone: tips, posters and simulations. Training activities are formal, targeted at a role and usually assessed: a course for engineers, a graded workshop for developers and a drill for the security team.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'What is the term for following an authorized person through a secured door without authenticating?',
    answers: ['tailgating', 'piggybacking'],
    placeholder: 'term',
    difficulty: 1,
    explanation:
      '**Tailgating** (also called piggybacking) is a physical social engineering technique. A mantrap or a guard prevents it, whereas a badge reader authenticates only the first person.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Refer to the exhibit. Enter the line configuration command that makes the console prompt for the locally configured username and password.',
    exhibit: {
      kind: 'cli',
      text: `R1(config)# username admin secret Str0ngPass2026
R1(config)# line console 0
R1(config-line)#`,
    },
    answers: ['login local'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`login local` makes the line authenticate against the local username database, here the `admin` account. Plain `login` would ask for a line password instead. Add `exec-timeout` to end idle console sessions, and keep the room locked.',
  },
  {
    id: 'e17',
    type: 'order',
    stem: 'Put the steps of a phishing simulation in the correct order.',
    items: [
      'Management approves the exercise and its scope',
      'The security team sends the simulated phishing email',
      'Users who click see an instant teaching page',
      'Click and report rates are collected',
      'Results guide follow-up awareness and training',
    ],
    difficulty: 2,
    explanation:
      'A simulation starts with approval, then the harmless email goes out, clicking users get immediate feedback, metrics are collected, and the results decide what awareness or training to run next.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. A security audit requires that no unused port can give an intruder network access. Which ports still violate the requirement?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1     Finance PC         connected    10         a-full  a-100 10/100BaseTX
Fa0/2     Finance PC         connected    10         a-full  a-100 10/100BaseTX
Fa0/3                        notconnect   10           auto   auto 10/100BaseTX
Fa0/4                        notconnect   10           auto   auto 10/100BaseTX
Fa0/5     UNUSED             disabled     999          auto   auto 10/100BaseTX
Fa0/6     UNUSED             disabled     999          auto   auto 10/100BaseTX`,
    },
    options: ['Fa0/1 and Fa0/2', 'Fa0/3 and Fa0/4', 'Fa0/5 and Fa0/6', 'All six ports'],
    answer: 1,
    difficulty: 3,
    explanation:
      'Fa0/3 and Fa0/4 are unused but still enabled (notconnect) in the Finance VLAN 10, so anyone can plug in a laptop and join that VLAN. Fa0/5 and Fa0/6 are administratively disabled and parked in the unused VLAN 999. Fa0/1 and Fa0/2 are in use by authorized devices, so they are not unused ports.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Why is a mantrap more effective against tailgating than a badge reader alone?',
    options: [
      'It records a video of everyone who enters',
      'It encrypts the badge data so it cannot be cloned',
      'It authenticates users with biometrics instead of cards',
      'It admits one person at a time because the second door opens only after the first has closed',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The interlocked doors force one person at a time through the vestibule, so nobody can follow an authorized user. A badge reader authenticates only the person who badges. Video, badge encryption and biometrics may be added to a mantrap, but none of them is what stops tailgating.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'A door requires a badge and a PIN. Which combination of authentication factors does it use?',
    options: [
      'Something you know and something you are',
      'Something you have and something you know',
      'Something you are and something you have',
      'Two things you know',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The badge is something you **have** and the PIN is something you **know**. Something you are would be a biometric such as a fingerprint, and a PIN plus a password would be two knowledge factors of the same type.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements about biometric access control are true? (Choose two.)',
    options: [
      'It is a form of something you know',
      'It authenticates something you are, such as a fingerprint or iris pattern',
      'It eliminates the need for any other physical control',
      'It can produce false acceptances and false rejections',
      'It relies on a shared code that can be written down',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'Biometrics match a physical characteristic (something you are) and, like any measurement, they have error rates: a false acceptance lets an impostor in and a false rejection blocks a legitimate user. They are not knowledge factors, they do not replace other layers, and they do not depend on a shared code.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Which two measures most directly reduce incidents caused by employees opening malicious email attachments? (Choose two.)',
    options: [
      'A mantrap at the building entrance',
      'A user awareness program with regular phishing simulations',
      'A shorter console exec-timeout',
      'Role-based training for staff who handle invoices and payments',
      'A locked wiring closet',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'The risk comes from human behavior, so awareness with phishing simulations and focused training for high-risk roles address it directly. A mantrap, a console timeout and a locked closet protect physical access to places and devices, not email behavior.',
  },
];
