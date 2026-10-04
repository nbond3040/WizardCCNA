import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'What does DNS do?', back: 'Resolves **names to IP addresses** (and addresses back to names) using a hierarchical, distributed database.' },
  { id: 'f2', front: 'DNS transport and port', back: '**UDP 53** for normal queries; **TCP 53** for zone transfers and responses too large for UDP.' },
  { id: 'f3', front: 'DNS hierarchy from the top down', back: 'Root (.) → top-level domain (.com, .uk) → domain/zone (example.com) → host (www).' },
  { id: 'f4', front: 'Root servers', back: '13 root server identities (a to m.root-servers.net), each with many anycast instances. They refer resolvers to the TLD servers.' },
  { id: 'f5', front: 'Authoritative DNS server', back: "Holds a zone's records and answers for them definitively (the aa flag)." },
  { id: 'f6', front: 'Recursive query', back: 'Asks the server for the final answer or an error. Sent by clients (stub resolvers) to their configured DNS server.' },
  { id: 'f7', front: 'Iterative query', back: 'The server returns the best information it has, often a referral. Sent by resolvers to root, TLD and authoritative servers.' },
  { id: 'f8', front: 'Recursive resolver (caching DNS server)', back: "Accepts clients' recursive queries, walks the hierarchy with iterative queries and caches the answers." },
  { id: 'f9', front: 'TTL of a DNS record', back: 'The number of seconds a resolver or client may cache the record; set by the zone owner.' },
  { id: 'f10', front: 'Negative caching', back: "Name-does-not-exist (NXDOMAIN) answers are cached too, for a time derived from the zone's SOA record." },
  { id: 'f11', front: 'A record', back: 'Name → **IPv4** address.' },
  { id: 'f12', front: 'AAAA record', back: 'Name → **IPv6** address.' },
  { id: 'f13', front: 'CNAME record', back: "Alias → canonical name. The resolver then looks up the canonical name's A or AAAA record." },
  { id: 'f14', front: 'MX record', back: 'Names a mail server for a domain, with a preference: the **lowest** value is tried first. The target must be a name with an A/AAAA record.' },
  { id: 'f15', front: 'NS record', back: 'Names an authoritative server for a zone; used for delegation from parent to child zones.' },
  { id: 'f16', front: 'PTR record', back: 'Address → name, for reverse lookups under in-addr.arpa (IPv4) or ip6.arpa (IPv6).' },
  { id: 'f17', front: 'SOA record', back: 'One per zone: primary server, administrator mailbox, serial number, refresh/retry/expire timers and the negative-caching TTL.' },
  { id: 'f18', front: 'TXT record', back: 'Free-form text: SPF, DKIM and DMARC email policies, domain-ownership verification.' },
  { id: 'f19', front: 'Reverse lookup name for 203.0.113.80', back: '`80.113.0.203.in-addr.arpa`' },
  { id: 'f20', front: 'hosts file', back: 'Local static name-to-address table checked before DNS: `C:\\Windows\\System32\\drivers\\etc\\hosts` on Windows, `/etc/hosts` on Linux and macOS.' },
  { id: 'f21', front: '`nslookup` vs `ping` by name', back: 'nslookup queries a DNS server directly and ignores the hosts file and local cache; ping uses the full OS resolver.' },
  { id: 'f22', front: 'Non-authoritative answer (nslookup)', back: "The reply came from a resolver's cache or recursion, not directly from the zone's authoritative server. Normal, not an error." },
  { id: 'f23', front: 'dig: NXDOMAIN vs NOERROR with ANSWER: 0', back: 'NXDOMAIN: the name does not exist. NOERROR with no answer: the name exists but has no record of that type (e.g. no AAAA).', tags: ['v2.0'] },
  { id: 'f24', front: '`ipconfig /displaydns` and `ipconfig /flushdns`', back: 'Show and clear the Windows DNS client cache.' },
  { id: 'f25', front: '`ip domain-lookup`', back: 'Enables DNS resolution on IOS. **On by default** (shown as `ip domain lookup` on IOS XE).' },
  { id: 'f26', front: '`no ip domain-lookup`', back: 'Disables DNS lookups: mistyped commands no longer trigger a lookup delay, but names resolve only through `ip host` entries.' },
  { id: 'f27', front: '`ip name-server 10.1.1.53 10.1.1.54`', back: 'The DNS servers the device queries, up to six. Without it, IOS broadcasts its queries to 255.255.255.255.' },
  { id: 'f28', front: '`ip domain-name corp.example.com`', back: 'Default domain appended to unqualified names; also required before generating RSA keys for SSH.' },
  { id: 'f29', front: '`ip host FILESRV 10.1.1.80`', back: 'Static host-table entry on the device, used before DNS; shown as perm in `show hosts`.' },
  { id: 'f30', front: 'Can ping by IP but not by name', back: 'A DNS problem: wrong or unreachable DNS server, UDP 53 blocked, or a missing or incorrect record.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which DNS record type maps a host name to an IPv6 address?',
    options: ['A', 'AAAA', 'PTR', 'CNAME'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**AAAA** ("quad A") maps a name to an IPv6 address. An A record maps a name to IPv4, PTR maps an address back to a name, and CNAME makes a name an alias of another name.',
  },
  {
    id: 'q2',
    type: 'order',
    stem: 'A resolver with an empty cache resolves www.example.com for a client. Put the steps in order.',
    items: [
      'The client sends a recursive query to its resolver',
      'The resolver queries a root server and receives a referral',
      'The resolver queries a .com TLD server and receives a referral',
      'The resolver queries an authoritative example.com server',
      'The resolver caches the answer and returns it to the client',
    ],
    difficulty: 1,
    explanation:
      'The client asks once (recursively). The resolver then walks the tree iteratively — **root, then TLD, then the authoritative server** — caches what it learns for each TTL and answers the client.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about DNS transport are true? (Choose two.)',
    options: [
      'Ordinary queries use UDP port 53',
      'Ordinary queries use TCP port 25',
      'Zone transfers use TCP port 53',
      'Zone transfers use UDP port 67',
      'DNS queries work only over TCP',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'DNS uses port **53** on both transports: UDP for ordinary queries and TCP for zone transfers and large responses. TCP 25 is SMTP and UDP 67 is the DHCP server port.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'Which IOS global configuration command disables DNS lookups on a router?',
    answers: ['no ip domain-lookup', 'no ip domain lookup'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`no ip domain-lookup` (IOS XE also accepts `no ip domain lookup`) disables DNS resolution, so mistyped commands fail immediately instead of triggering a lookup. Lookups are enabled by default.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'A user can ping 203.0.113.80 but not www.example.com, which should resolve to that address. What is the most likely cause?',
    options: [
      'A routing problem between the user and the server',
      'A DNS problem, such as a wrong DNS server on the host',
      'An ACL blocking ICMP to the server',
      "A duplex mismatch on the user's switch port",
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The successful ping by IP proves that routing, ICMP and the physical path work, so only **name resolution** is failing — typically a wrong or unreachable DNS server or a missing record.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which record tells sending mail servers where to deliver email for a domain?',
    options: ['MX', 'NS', 'TXT', 'SOA'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**MX** records name the mail servers for a domain, with preferences. NS names the authoritative DNS servers, TXT carries text such as SPF policies, and SOA holds zone administration data.',
  },
  {
    id: 'q7',
    type: 'input',
    stem: 'Which IOS global configuration command makes a router send its DNS queries to the server 10.1.1.53?',
    answers: ['ip name-server 10.1.1.53'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`ip name-server 10.1.1.53` sets the DNS server for the device\'s own lookups; up to six servers can be listed. Without it, IOS broadcasts DNS queries to 255.255.255.255.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'A root server answers a resolver with a referral to the .com servers. What kind of query did the resolver send?',
    options: ['Recursive', 'Iterative', 'Reverse', 'Zone transfer'],
    answer: 1,
    difficulty: 2,
    explanation:
      'A referral is the typical answer to an **iterative** query: the server returns the best information it has. Root servers do not perform recursion; a recursive query demands a final answer or an error.',
  },
];
