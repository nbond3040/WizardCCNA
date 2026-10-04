import type { Flashcard, Question } from '../../types';

export const natFlashcards: Flashcard[] = [
  { id: 'f1', front: 'Inside local address', back: 'The address of an inside host as seen on the inside network — normally a private RFC 1918 address (e.g. `10.1.1.10`).' },
  { id: 'f2', front: 'Inside global address', back: 'The address that represents an inside host to the outside world — the public address NAT substitutes (e.g. `203.0.113.10`).' },
  { id: 'f3', front: 'Outside global address', back: 'The real address assigned to an outside host, as seen on the outside network.' },
  { id: 'f4', front: 'Outside local address', back: 'The address of an outside host as seen from the inside network. Equals the outside global unless outside NAT is configured.' },
  { id: 'f5', front: 'Memory rule: local vs global, inside vs outside', back: '**Local** = the view from the inside network; **global** = the view from the outside. **Inside/outside** = where the host actually lives.' },
  { id: 'f6', front: 'Static NAT command (10.1.1.10 ↔ 203.0.113.10)', back: '`ip nat inside source static 10.1.1.10 203.0.113.10` — inside local first, inside global second.' },
  { id: 'f7', front: 'Which NAT type lets Internet hosts initiate connections to an inside server?', back: '**Static NAT** (or static PAT/port forwarding) — its entry is permanent, so it exists before any inside traffic.' },
  { id: 'f8', front: 'Command to define a NAT pool', back: '`ip nat pool PUBLIC 203.0.113.20 203.0.113.29 netmask 255.255.255.224` (or `prefix-length 27`).' },
  { id: 'f9', front: 'Command binding ACL 1 to pool PUBLIC (dynamic NAT)', back: '`ip nat inside source list 1 pool PUBLIC`' },
  { id: 'f10', front: 'Role of the ACL in a NAT configuration', back: 'Selects which inside local addresses are translated. Permit = translate; no match = forwarded untranslated. It does **not** filter traffic.' },
  { id: 'f11', front: 'Dynamic NAT pool exhaustion', back: 'Every pool address is in use, so additional inside hosts get no translation and cannot reach the outside; pool `misses` increase in `show ip nat statistics`.' },
  { id: 'f12', front: 'PAT', back: 'Port Address Translation (NAT **overload**): many inside local addresses share one inside global address, kept apart by port numbers.' },
  { id: 'f13', front: 'PAT using the outside interface address', back: '`ip nat inside source list 1 interface GigabitEthernet0/0/1 overload` — the interface named is the outside interface.' },
  { id: 'f14', front: 'PAT using a pool', back: '`ip nat inside source list 1 pool PUBLIC overload` — IOS uses the first pool address until its ports run out, then the next.' },
  { id: 'f15', front: 'How does PAT choose the translated source port?', back: 'It keeps the original source port if that port is free on the inside global address; otherwise it assigns another free port.' },
  { id: 'f16', front: '`ip nat inside` / `ip nat outside`', back: 'Interface commands: `inside` on interfaces facing the private network, `outside` on the interface facing the ISP. Both are required for translation.' },
  { id: 'f17', front: 'Order of operations: inside → outside packet', back: 'Inbound ACL, then **routing lookup**, then **source translation** (local → global), then outbound ACL.' },
  { id: 'f18', front: 'Order of operations: outside → inside packet', back: 'Inbound ACL, then **destination translation** (global → local), then **routing lookup**.' },
  { id: 'f19', front: 'Column order of `show ip nat translations`', back: 'Pro, **Inside global**, Inside local, Outside local, Outside global.' },
  { id: 'f20', front: '`show ip nat statistics`', back: 'Shows active translation counts, inside/outside interfaces, hits and misses, and pool usage (total, allocated %, misses).' },
  { id: 'f21', front: '`clear ip nat translation *`', back: 'Deletes all **dynamic** translation entries. Static entries remain because they come from configuration.' },
  { id: 'f22', front: 'Meaning of `NAT: s=10.1.1.10->203.0.113.20, d=192.0.2.80` (debug ip nat)', back: 'An outbound packet whose source was rewritten from inside local 10.1.1.10 to inside global 203.0.113.20; the destination is unchanged.' },
  { id: 'f23', front: 'Default idle timeout of a dynamic NAT (simple) entry', back: '**24 hours** (86,400 s); change it with `ip nat translation timeout <seconds>`.' },
  { id: 'f24', front: 'Static PAT (port forwarding) command', back: '`ip nat inside source static tcp 10.1.1.10 443 203.0.113.10 443` — only TCP 443 on the public address is forwarded to the inside host.' },
  { id: 'f25', front: 'Dashes (`---`) in `show ip nat translations`', back: 'A simple, address-only entry (static or dynamic one-to-one) with no protocol, ports or outside addresses recorded.' },
  { id: 'f26', front: 'Three classic NAT misconfigurations', back: '1) inside/outside swapped or missing; 2) ACL does not match the inside locals; 3) no route out the outside interface (or no return route to the inside globals).' },
  { id: 'f27', front: 'Which source address must an outbound ACL on the NAT outside interface match?', back: 'The **inside global** (public) address — NAT translates before the outbound ACL is checked.' },
];

export const natQuiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which NAT term describes the private address configured on a host in the inside network?',
    options: ['Inside local', 'Inside global', 'Outside local', 'Outside global'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The host lives on the inside, and its own configured address is how it is seen on the inside network — the **inside local** address. The inside global is the public address that represents it outside; the outside terms describe hosts on the Internet side.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'A web server at 10.1.1.10 must be reachable from the Internet at a fixed public address. Which type of NAT should be used?',
    options: ['Static NAT', 'Dynamic NAT with a pool', 'PAT with interface overload', 'Outside source NAT'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Static NAT** creates a permanent mapping, so outside clients can initiate connections to the public address at any time. Dynamic NAT and PAT only create entries after an inside host starts a conversation, and outside source NAT translates outside hosts, not the inside server.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Which keyword, added to an `ip nat inside source list` command, enables PAT?',
    answers: ['overload'],
    placeholder: 'keyword',
    difficulty: 1,
    explanation:
      'The keyword is **overload**, for example `ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`. There is no `pat` keyword; without `overload` the router performs one-to-one dynamic NAT.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Besides the inside and outside interface commands, which two items are required to configure dynamic NAT without overload? (Choose two.)',
    options: [
      'An ACL that matches the inside local addresses',
      'A NAT pool of inside global addresses',
      'A static route on R1 for each pool address',
      'The `overload` keyword on the NAT command',
      'A DHCP pool that serves the inside hosts',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Dynamic NAT needs an **ACL** to choose which inside locals are translated and a **pool** of inside globals, tied together by `ip nat inside source list … pool …`. Static routes per pool address are not required on R1, `overload` would turn it into PAT, and DHCP is unrelated to NAT.',
  },
  {
    id: 'q5',
    type: 'match',
    stem: 'Match each command to its purpose.',
    pairs: [
      { left: '`ip nat inside`', right: 'Marks an interface facing the private network' },
      { left: '`ip nat pool PUBLIC …`', right: 'Defines the inside global addresses to lend out' },
      { left: '`ip nat inside source list 1 pool PUBLIC`', right: 'Binds the ACL to the pool' },
      { left: '`show ip nat translations`', right: 'Lists the current address mappings' },
    ],
    difficulty: 2,
    explanation:
      '`ip nat inside` is an interface role, `ip nat pool` defines the public range, the `ip nat inside source list … pool …` command binds the ACL to that range, and `show ip nat translations` displays the resulting entries.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'A router runs dynamic NAT with a 5-address pool and no `overload`. Five hosts already have translations. What happens when a sixth host sends traffic to the Internet?',
    options: [
      'Its traffic is not translated and the host cannot reach the Internet',
      'The router automatically switches to PAT for the sixth host',
      'The oldest translation is deleted to free an address',
      'The router uses the outside interface address for the sixth host',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'With the pool **exhausted**, the new host gets no translation and its packets fail, and the pool misses counter increases. IOS does not fall back to PAT, does not evict active entries early, and does not borrow the interface address unless configured to.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'In `show ip nat translations` output, which address column is listed first after the protocol?',
    options: ['Inside global', 'Inside local', 'Outside local', 'Outside global'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The columns are Pro, **Inside global**, Inside local, Outside local, Outside global. Many candidates assume the first address is the private one — it is actually the public address representing the inside host.',
  },
];
