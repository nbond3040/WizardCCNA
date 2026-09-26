import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'DNS',
    subtitle: 'The Domain Name System: hierarchy, record types, resolution and IOS name commands',
    notes:
      "People remember names; networks forward packets to addresses. The **Domain Name System (DNS)** bridges the two: before a browser can open www.example.com, a mail server can deliver to user@example.com, or an administrator can SSH to a router by name, something must turn that name into an IP address. DNS does it with a worldwide, hierarchical, distributed database and a great deal of caching. In this lesson you will learn the hierarchy — **root, top-level domain and authoritative servers** — and follow a lookup through **recursive and iterative queries**. You will learn the record types every network engineer must recognize — **A, AAAA, CNAME, MX, NS, PTR, SOA and TXT** — and how caching and TTLs shape what clients see. You will use `nslookup` and `dig`, configure a Cisco router's resolver with `ip name-server`, `ip domain-name`, `ip host` and `ip domain-lookup`, and finish with a structured way to diagnose DNS failures. DNS belongs to v1.1 topic 4.3, which asks you to explain its role; the v2.0 blueprint (domain 4) goes further and expects you to diagnose record and resolver problems, so the troubleshooting slides carry extra weight for v2.0.",
  },
  {
    kind: 'bullets',
    title: 'What DNS does',
    bullets: [
      'Resolves **names to IP addresses** (and addresses back to names)',
      'Hierarchical, distributed database with heavy **caching**',
      'Needed by web, mail, applications and device management',
      '**UDP 53** for queries; **TCP 53** for zone transfers and large replies',
      'Hosts learn DNS servers from DHCP (option 6) or static settings',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1', icon: 'pc' },
        { id: 'dns', label: 'DNS server 10.1.1.53', icon: 'server' },
        { id: 'web', label: 'Web server 203.0.113.80', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'dns', label: 'Query: www.example.com A?', sub: 'UDP 53' },
        { from: 'dns', to: 'pc', label: 'Answer: 203.0.113.80', sub: 'TTL 3600', tone: 'good' },
        { from: 'pc', to: 'web', label: 'TCP SYN to 203.0.113.80:443', tone: 'accent' },
        { note: 'The name is resolved once; packets carry only addresses' },
      ],
    },
    notes:
      "DNS answers one question in many forms: what is the address for this name? A client — its DNS component is called a **stub resolver** — sends a query to its configured DNS server, which returns the answer, and only then can the application open a connection to the IP address. The name never appears in the IP header; it is resolved once, cached, and the packets carry addresses. That makes DNS a dependency for almost everything: browsing, email delivery, cloud applications, software updates and even network management, where administrators connect to devices by name and devices send logs to servers by name. Most DNS traffic is a single small **UDP** datagram in each direction on port **53**, because connection setup would double the delay. **TCP 53** is used when a response is too large for UDP (the server sets the truncation flag and the client retries over TCP) and for **zone transfers**, which copy a whole zone from a primary to a secondary server. Hosts learn which DNS servers to use from DHCP option 6 or from static configuration. For the exam: DNS uses UDP and TCP port 53, and it resolves names — it does not route packets or assign addresses.",
  },
  {
    kind: 'diagram',
    title: 'The DNS hierarchy',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5.8,
      nodes: [
        { id: 'root', label: '. (root)', sub: '13 root server identities', shape: 'pill', tone: 'accent', x: 5, y: 0.7 },
        { id: 'com', label: '.com', sub: 'generic TLD', x: 2.2, y: 2.2 },
        { id: 'org', label: '.org', sub: 'generic TLD', x: 5, y: 2.2 },
        { id: 'uk', label: '.uk', sub: 'country-code TLD', x: 7.8, y: 2.2 },
        { id: 'ex', label: 'example.com', sub: 'zone: authoritative servers', x: 2.2, y: 3.8 },
        { id: 'www', label: 'www.example.com', sub: 'A / AAAA', shape: 'round', x: 5.6, y: 3.8 },
        { id: 'mail', label: 'mail.example.com', sub: 'MX target', shape: 'round', x: 5.6, y: 5.1 },
      ],
      edges: [
        { from: 'root', to: 'com' },
        { from: 'root', to: 'org' },
        { from: 'root', to: 'uk' },
        { from: 'com', to: 'ex', label: 'delegation (NS)' },
        { from: 'ex', to: 'www' },
        { from: 'ex', to: 'mail' },
      ],
    },
    caption: 'Read a name right to left: root → TLD → domain → host.',
    notes:
      "DNS names form an upside-down tree. At the top is the unnamed **root**, written as a trailing dot: the fully qualified name www.example.com. really ends with that dot. The root zone is served by **13 root server identities** (a.root-servers.net through m.root-servers.net), each replicated at many sites worldwide with anycast. Below the root are the **top-level domains**: generic TLDs such as .com, .org and .net, and country-code TLDs such as .uk, .de and .jp. Each TLD's servers know which name servers are responsible for the domains registered under them — for example, that example.com is served by ns1.example.com and ns2.example.com. That handover of responsibility is called **delegation** and is published with NS records. The servers for example.com are **authoritative** for the example.com **zone**: they hold the actual records, such as the address of www.example.com or the mail server for the domain. No single server knows everything; each level knows only its own data and who is responsible for the level below. That design is why DNS scales to billions of names, and it is why a lookup that is not cached walks down the tree from the root.",
  },
  {
    kind: 'definitions',
    title: 'Names and servers: key terms',
    terms: [
      { term: '**FQDN**', def: 'Fully qualified domain name: the complete name up to the root, e.g. `www.example.com.`' },
      { term: '**Zone**', def: 'The part of the namespace one set of authoritative servers manages, e.g. example.com.' },
      { term: '**Authoritative server**', def: "Holds a zone's records and answers for them definitively (primary and secondary copies)." },
      { term: '**Recursive resolver**', def: 'Does lookups for clients, follows referrals and caches answers — the caching DNS server.' },
      { term: '**Stub resolver**', def: 'The DNS client in a host OS; sends recursive queries to its configured server.' },
      { term: '**Forwarder**', def: 'A resolver that passes unanswered queries to another resolver instead of the root.' },
    ],
    notes:
      "These terms appear in exam stems, so be precise. A **fully qualified domain name** is complete up to the root; an unqualified name such as fileserver is completed by appending a **domain suffix**, which is what `ip domain-name` does on a router and the DNS suffix does on a PC. A **zone** is the portion of the namespace that one set of authoritative servers manages; example.com can delegate sales.example.com as a separate zone. An **authoritative server** holds the zone's records: they are edited on the primary server, and secondary servers receive copies through zone transfers. A **recursive resolver**, often called a caching DNS server, does the legwork for clients: it accepts their queries, walks the hierarchy and caches what it learns. Enterprise DNS servers, ISP resolvers and public resolvers are all recursive resolvers. The **stub resolver** is the small DNS client in every operating system; it simply sends a recursive query to its configured server and waits. A **forwarder** is a resolver configured to pass unanswered queries to another resolver — common in enterprises that funnel all lookups through a central server. One server can be authoritative for its own zones and recursive for its clients at the same time.",
  },
  {
    kind: 'diagram',
    title: 'Recursive and iterative resolution',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'pc', label: 'PC1 (stub)', icon: 'pc' },
        { id: 'res', label: 'Resolver 10.1.1.53', icon: 'server' },
        { id: 'root', label: 'Root server', icon: 'server' },
        { id: 'tld', label: '.com TLD server', icon: 'server' },
        { id: 'auth', label: 'example.com server', icon: 'server' },
      ],
      steps: [
        { from: 'pc', to: 'res', label: 'Recursive query', sub: 'www.example.com A?', tone: 'accent' },
        { from: 'res', to: 'root', label: 'Iterative query' },
        { from: 'root', to: 'res', label: 'Referral: ask the .com servers', dashed: true },
        { from: 'res', to: 'tld', label: 'Iterative query' },
        { from: 'tld', to: 'res', label: 'Referral: ns1.example.com', dashed: true },
        { from: 'res', to: 'auth', label: 'Iterative query' },
        { from: 'auth', to: 'res', label: 'Answer: 203.0.113.80', sub: 'authoritative', tone: 'good' },
        { from: 'res', to: 'pc', label: 'Answer: 203.0.113.80', sub: 'cached for its TTL', tone: 'good' },
      ],
    },
    notes:
      "With an empty cache, resolving www.example.com takes several exchanges. PC1 sends a **recursive query** to its resolver: the recursion-desired flag says give me the final answer or an error, not a referral. The resolver then performs **iterative queries** on PC1's behalf. It asks a root server, which does not know the answer but returns a **referral** to the .com TLD servers. It asks a .com server, which refers it to the name servers for example.com. It asks the authoritative example.com server, which returns the answer, 203.0.113.80, marked as authoritative. The resolver caches every piece — the .com referral, the example.com name servers and the final record — and replies to PC1. The next client asking for any .com name skips the root, and the next one asking for www.example.com gets an instant cached answer. Notice the division of labor: the stub resolver on PC1 sends one recursive query, while the resolver sends iterative queries and follows referrals. On the exam, the query from a client to its DNS server is recursive, the resolver's queries to the root, TLD and authoritative servers are iterative, and the order is always root, then TLD, then authoritative.",
  },
  {
    kind: 'compare',
    title: 'Recursive vs iterative queries',
    left: {
      heading: 'Recursive query',
      bullets: [
        'Asks for the **final answer** (or an error)',
        'Sent by stub resolvers to their DNS server',
        'The server does all the remaining work',
        'Recursion desired (RD) flag set',
      ],
    },
    right: {
      heading: 'Iterative query',
      tone: 'accent',
      bullets: [
        'Accepts the **best answer the server has**',
        'Often a **referral** to servers lower in the tree',
        'Sent by resolvers to root, TLD and authoritative servers',
        'Root and TLD servers answer only this way',
      ],
    },
    notes:
      "The difference lies in who does the work. A **recursive** query says: resolve this completely for me. The server receiving it must return the answer or an error such as name does not exist; it may not reply with go and ask someone else. Clients send recursive queries because they are simple devices that should not have to walk the hierarchy themselves. An **iterative** query says: tell me what you know. The server answers from its own data or cache, and if it does not have the answer, it returns a referral — the names and addresses of servers closer to the answer. Root and TLD servers answer only this way; they would collapse if they performed recursion for the whole Internet. A resolver therefore combines both roles: it receives recursive queries from clients and sends iterative queries into the hierarchy. Two details help with trick questions. First, a resolver configured as a forwarder sends a recursive query to another resolver instead of iterating itself. Second, `nslookup` labels an answer **non-authoritative** when it came from a resolver's cache or recursion rather than directly from the zone's authoritative server — which is normal, not an error.",
  },
  {
    kind: 'bullets',
    title: 'Caching and TTL',
    bullets: [
      'Every record carries a **TTL** in seconds, set by the zone owner',
      'Resolvers and clients cache answers until the TTL expires',
      'Failed lookups (NXDOMAIN) are cached too — **negative caching**',
      'Changes appear only as old cache entries expire',
      'Lower the TTL before planned changes',
      'Windows: `ipconfig /displaydns`, `ipconfig /flushdns`',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Answer received', sub: 'TTL 3600 s', shape: 'pill' },
        { id: 'b', label: 'Cached', sub: 'TTL counts down', tone: 'accent' },
        { id: 'c', label: 'Repeat queries', sub: 'answered from cache', tone: 'good' },
        { id: 'd', label: 'TTL reaches 0', sub: 'entry removed', shape: 'round', tone: 'muted' },
      ],
    },
    notes:
      "Caching is what makes DNS fast and scalable. Each resource record has a **time to live** in seconds, chosen by whoever manages the zone. A resolver that receives www.example.com with a TTL of 3600 keeps it for up to an hour and answers every client from memory during that time; operating systems and browsers keep their own caches as well. Failed lookups are cached too: a name-does-not-exist (NXDOMAIN) answer is remembered for a negative-caching time derived from the zone's SOA record, so a record created just after someone looked for it can stay invisible for a while. The price of caching is **staleness**. If you change the address of www.example.com, resolvers and clients that cached the old record keep using it until their copy expires. Administrators plan for this by lowering the TTL (for example to 300 seconds) a day before a migration, making the change, and raising it again afterward. When troubleshooting a Windows PC, `ipconfig /displaydns` shows its cache and `ipconfig /flushdns` clears it; on a Cisco router, `show hosts` lists cached entries. The exam classic: after a DNS change, some users still reach the old server — the answer is caching and the TTL.",
  },
  {
    kind: 'table',
    title: 'Record types you must know',
    columns: ['Type', 'Maps', 'Example', 'Used for'],
    rows: [
      ['**A**', 'Name → IPv4 address', '`www.example.com` → `203.0.113.80`', 'Reaching hosts and web servers over IPv4'],
      ['**AAAA**', 'Name → IPv6 address', '`www.example.com` → `2001:db8:100::80`', 'Reaching hosts over IPv6'],
      ['**CNAME**', 'Alias → canonical name', '`web.example.com` → `www.example.com`', 'Several names for one service'],
      ['**MX**', 'Domain → mail server + preference', '`example.com` → `10 mail.example.com`', 'Delivering email to a domain'],
      ['**NS**', 'Zone → authoritative server', '`example.com` → `ns1.example.com`', 'Delegation: which servers answer'],
      ['**PTR**', 'Address → name', '`80.113.0.203.in-addr.arpa` → `www.example.com`', 'Reverse lookups, logs, mail checks'],
      ['**SOA**', 'Zone → primary server, admin, serial, timers', '`ns1.example.com hostmaster.example.com 2026092601 …`', 'Zone administration, negative caching'],
      ['**TXT**', 'Name → free text', '`"v=spf1 mx -all"`', 'SPF, DKIM, DMARC, domain verification'],
    ],
    notes:
      "These eight record types cover every DNS question on the CCNA. **A** and **AAAA** are the workhorses: they map a name to an IPv4 or IPv6 address, and a dual-stack host usually has both, so IPv6-capable clients can connect over IPv6. **CNAME** creates an alias: web.example.com is just another name for www.example.com, and the resolver continues by looking up the canonical name's A or AAAA record. A CNAME cannot coexist with other records at the same name, so it is never used at the zone apex. **MX** tells mail servers where to deliver mail for a domain; each MX points to a host name (not an IP address) and carries a **preference**, where the **lower** value is tried first. **NS** records list the authoritative servers for a zone and create delegations from parent to child. **PTR** records live in the special in-addr.arpa (IPv4) and ip6.arpa (IPv6) trees and map an address back to a name. **SOA**, one per zone, names the primary server and the administrator's mailbox and holds the serial number and timers used by secondary servers and negative caching. **TXT** holds free text, today mostly email-security policies (SPF, DKIM, DMARC) and proofs of domain ownership.",
  },
  {
    kind: 'cli',
    title: 'Seeing records with dig +short',
    code: `$ dig +short www.example.com A
203.0.113.80
$ dig +short www.example.com AAAA
2001:db8:100::80
$ dig +short web.example.com
www.example.com.
203.0.113.80
$ dig +short example.com MX
10 mail.example.com.
20 mail2.example.com.
$ dig +short example.com NS
ns1.example.com.
ns2.example.com.
$ dig +short example.com TXT
"v=spf1 mx -all"
$ dig +short -x 203.0.113.80
www.example.com.`,
    highlight: ['web.example.com', '10 mail.example.com.', '-x 203.0.113.80'],
    caption: '`+short` prints only the answer data; `-x` performs a reverse (PTR) lookup.',
    notes:
      "`dig` (domain information groper) is the DNS tool of choice on Linux and macOS, and `+short` strips its output down to the answer data, which makes the record types easy to see. The A query returns the IPv4 address and the AAAA query the IPv6 address of the same host. Querying web.example.com without a type defaults to A, and the output shows the whole chain: first the **CNAME** target, www.example.com., then the address of that canonical name — the resolver followed the alias automatically. The MX query lists two mail servers with preferences 10 and 20; sending servers try mail.example.com first and fall back to mail2 only if it is unavailable. The NS query shows the zone's two authoritative servers — at least two are expected for redundancy. The TXT query returns an SPF policy saying that only the domain's MX hosts may send its mail. Finally, `dig -x` builds the reverse name 80.113.0.203.in-addr.arpa automatically and returns the **PTR** record. Notice the trailing dots: dig prints fully qualified names ending at the root. The exam will not ask for dig options, but you must be able to read output like this and name each record type.",
  },
  {
    kind: 'diagram',
    title: 'Mail and web by name: MX, CNAME, A',
    diagram: {
      type: 'flow',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'm1', label: 'Mail to user@example.com', shape: 'pill', x: 1.3, y: 1.2 },
        { id: 'm2', label: 'MX example.com?', sub: '10 mail.example.com', x: 3.8, y: 1.2 },
        { id: 'm3', label: 'A mail.example.com?', sub: '203.0.113.25', x: 6.3, y: 1.2 },
        { id: 'm4', label: 'SMTP connection', sub: 'TCP 25 to 203.0.113.25', shape: 'round', tone: 'good', x: 8.7, y: 1.2 },
        { id: 'w1', label: 'Browse web.example.com', shape: 'pill', x: 1.3, y: 3.4 },
        { id: 'w2', label: 'CNAME', sub: 'www.example.com', x: 3.8, y: 3.4, tone: 'accent' },
        { id: 'w3', label: 'A / AAAA www?', sub: '203.0.113.80', x: 6.3, y: 3.4 },
        { id: 'w4', label: 'HTTPS connection', sub: 'TCP 443 to 203.0.113.80', shape: 'round', tone: 'good', x: 8.7, y: 3.4 },
      ],
      edges: [
        { from: 'm1', to: 'm2' },
        { from: 'm2', to: 'm3' },
        { from: 'm3', to: 'm4' },
        { from: 'w1', to: 'w2' },
        { from: 'w2', to: 'w3' },
        { from: 'w3', to: 'w4' },
      ],
    },
    caption: 'MX and CNAME point to names; only A and AAAA records supply the address.',
    notes:
      "Two everyday flows show how record types chain together. When a mail server must deliver a message to user@example.com, it does not look up example.com's A record. It asks for the **MX** records of example.com, sorts them by preference, and then resolves the chosen mail host — mail.example.com — with an **A** or **AAAA** query before opening an SMTP connection on TCP 25. If the MX record is missing, mail to the domain fails or goes astray; if an MX points to a name that has no address record, senders cannot reach that host and move on to the next MX, if there is one. Web access works the same way with aliases. A user types web.example.com; the resolver finds a **CNAME** to www.example.com and continues with the A or AAAA record of the canonical name, and only then does the browser open its HTTPS connection on TCP 443. Cloud and content-delivery services rely heavily on CNAMEs, because the provider can change the addresses behind its canonical name without touching the customer's zone. The rule to remember: MX, CNAME and NS records point to **names**, and every chain ends at an A or AAAA record that supplies the address.",
  },
  {
    kind: 'bullets',
    title: 'Reverse lookups with PTR records',
    bullets: [
      'PTR maps an **address back to a name**',
      'IPv4: octets reversed under **in-addr.arpa**',
      '203.0.113.80 → `80.113.0.203.in-addr.arpa`',
      'IPv6: reversed hex digits under **ip6.arpa**',
      'Used by logs, traceroute, mail servers and security tools',
      'Maintained by whoever holds the address block',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: '203.0.113.80', sub: 'address to look up', shape: 'pill' },
        { id: 'b', label: '80.113.0.203.in-addr.arpa', sub: 'octets reversed', tone: 'accent' },
        { id: 'c', label: 'PTR', sub: 'www.example.com', shape: 'round', tone: 'good' },
      ],
    },
    notes:
      "Forward lookups start with a name; **reverse lookups** start with an address. To fit addresses into the name tree, DNS writes an IPv4 address with its octets **reversed** under the special domain in-addr.arpa: 203.0.113.80 becomes 80.113.0.203.in-addr.arpa. Reversing puts the most general part — the network — nearest the root, so reverse zones can be delegated along address-block boundaries, just as forward zones follow domain boundaries. The record found there is a **PTR** record naming the host. IPv6 uses ip6.arpa and reverses every hexadecimal digit (nibble) of the fully expanded address. Reverse lookups are everywhere in operations: traceroute and many tools print names for addresses, syslog and security tools label events with host names, and receiving mail servers often distrust mail from addresses without sensible PTR records. One practical difference from forward zones: the PTR records for public addresses are managed by whoever holds the address block — often the ISP — not by the owner of the domain name, so a correct A record does not guarantee a matching PTR. On the exam, recognize PTR as the address-to-name record and be able to build the in-addr.arpa name from an address.",
  },
  {
    kind: 'steps',
    title: 'How a client resolves a name',
    steps: [
      { title: 'Check the hosts file and local cache', text: 'Static entries and unexpired cached answers win immediately.' },
      { title: 'Append the DNS suffix to a short name', text: '`fileserver` → `fileserver.corp.example.com`' },
      { title: 'Query the configured DNS server', text: 'Recursive query over UDP 53; try the next server if there is no reply.' },
      { title: 'The resolver answers', text: 'From its cache, or after iterating from the root.' },
      { title: 'Cache the answer, then connect', text: 'Kept for the TTL; the application opens its connection to the address.' },
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'pc', icon: 'pc', label: 'PC1', sub: 'DNS 10.1.1.53', x: 1.1, y: 3.2 },
        { id: 'sw', icon: 'switch', label: 'SW1', x: 3.5, y: 3.2 },
        { id: 'r1', icon: 'router', label: 'R1', x: 5.9, y: 3.2 },
        { id: 'dns', icon: 'server', label: 'DNS resolver', sub: '10.1.1.53', x: 5.9, y: 1 },
        { id: 'inet', icon: 'internet', label: 'Internet', x: 8.7, y: 3.2 },
      ],
      links: [
        { from: 'pc', to: 'sw' },
        { from: 'sw', to: 'r1' },
        { from: 'r1', to: 'dns', label: 'UDP 53', tone: 'accent' },
        { from: 'r1', to: 'inet' },
      ],
    },
    notes:
      "A client follows a predictable order, and knowing it explains many puzzling tickets. First it checks local sources: the **hosts file** (C:\\Windows\\System32\\drivers\\etc\\hosts on Windows, /etc/hosts on Linux and macOS) and its DNS cache. A hosts entry wins over DNS, which is useful for testing but a classic reason why one machine keeps reaching an old server. If the name is not fully qualified, the client appends its **DNS suffix** — learned from DHCP option 15 or configured locally — so fileserver becomes fileserver.corp.example.com. Then it sends a **recursive query** over UDP 53 to its first configured DNS server; if that server does not respond, it tries the next one. The resolver answers from its cache or iterates through the hierarchy, and the client caches the result for the record's TTL before the application finally connects. Keep one tool difference in mind: `ping` and browsers use this complete resolution path, but `nslookup` and `dig` send their queries straight to a DNS server, bypassing the hosts file and the local cache. When ping and nslookup disagree about an address, look for a hosts file entry or a stale cache.",
  },
  {
    kind: 'cli',
    title: 'nslookup on Windows',
    code: `C:\\> nslookup web.example.com
Server:  dns1.corp.example.com
Address:  10.1.1.53

Non-authoritative answer:
Name:    www.example.com
Addresses:  2001:db8:100::80
          203.0.113.80
Aliases:  web.example.com

C:\\> nslookup -type=mx example.com
Server:  dns1.corp.example.com
Address:  10.1.1.53

Non-authoritative answer:
example.com     MX preference = 10, mail exchanger = mail.example.com
example.com     MX preference = 20, mail exchanger = mail2.example.com

C:\\> nslookup www.example.com 8.8.8.8
Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    www.example.com
Addresses:  2001:db8:100::80
          203.0.113.80`,
    highlight: ['Non-authoritative answer:', 'Aliases:  web.example.com', 'MX preference = 10'],
    caption: 'The first lines always show which server answered; Aliases reveals a CNAME.',
    notes:
      "`nslookup` is available on Windows, macOS and Linux, and Windows exhibits use its output. Every run starts by naming the DNS server it queried — here dns1.corp.example.com at 10.1.1.53 — which immediately tells you whether the client is using the server you expect. **Non-authoritative answer** means the reply came from a resolver's cache or recursion rather than directly from the zone's authoritative server; that is normal and not an error. For web.example.com, the output shows the canonical name www.example.com under Name, both its IPv6 and IPv4 addresses, and web.example.com under **Aliases** — the signature of a CNAME. The `-type=mx` option queries other record types; the two MX lines show preferences 10 and 20. Adding a server address at the end, as in the last command, sends the query to that server instead of the configured one — a quick way to test whether a problem is specific to your own resolver. Remember that nslookup ignores the hosts file and the local cache. Two error messages to recognize: Non-existent domain means the server answered that the name or record does not exist, while DNS request timed out means no server answered at all.",
  },
  {
    kind: 'cli',
    title: 'Reading dig output',
    code: `$ dig www.example.com A

; <<>> DiG 9.18.24 <<>> www.example.com A
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 41902
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.example.com.               IN      A

;; ANSWER SECTION:
www.example.com.        3600    IN      A       203.0.113.80

;; Query time: 23 msec
;; SERVER: 10.1.1.53#53(10.1.1.53) (UDP)
;; WHEN: Sat Sep 26 10:15:02 UTC 2026
;; MSG SIZE  rcvd: 60`,
    highlight: ['status: NOERROR', 'ANSWER: 1', '3600', '(UDP)'],
    caption: 'Status, flags, the answer with its TTL, and which server answered over which transport.',
    notes:
      "`dig` prints the whole DNS message, and a few fields answer most troubleshooting questions. The **status** in the header is the response code: **NOERROR** means the query succeeded (even if the answer section is empty), **NXDOMAIN** means the name does not exist, **SERVFAIL** means the resolver could not obtain an answer — often a broken delegation or unreachable authoritative servers — and REFUSED means the server declined to answer this client. The **flags** show qr (this is a response), rd (recursion desired, set by dig) and ra (recursion available, so this is a recursive resolver); an aa flag would mean the answer came from an authoritative server. The counts tell you how many records each section holds. The **answer section** holds the record itself: owner name, remaining **TTL** in seconds (3600 here), class IN, type A and the address. At the bottom, SERVER shows which server answered and over which transport — UDP port 53 here — and a very short query time usually indicates a cached answer. NOERROR with ANSWER: 0 is the subtle case: the name exists but has no record of the requested type, such as a host with an A record but no AAAA record. Reading output at this level is v2.0 emphasis.",
  },
  {
    kind: 'cli',
    title: 'DNS on Cisco IOS',
    code: `R1(config)# ip domain-name corp.example.com
R1(config)# ip name-server 10.1.1.53 10.1.1.54
R1(config)# ip domain-lookup
R1(config)# ip host SW1 10.1.99.11
R1(config)# end
R1# ping www.example.com
Translating "www.example.com"...domain server (10.1.1.53) [OK]

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 203.0.113.80, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 17/18/21 ms
R1# show hosts
Default domain is corp.example.com
Name/address lookup uses domain service
Name servers are 10.1.1.53, 10.1.1.54

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent
       NA - Not Applicable None - Not defined

Host                      Port  Flags      Age Type   Address(es)
SW1                       None  (perm, OK)  0   IP    10.1.99.11
www.example.com           None  (temp, OK)  0   IP    203.0.113.80`,
    highlight: ['ip name-server 10.1.1.53 10.1.1.54', 'ip host SW1 10.1.99.11', '(perm, OK)', '(temp, OK)'],
    caption: '`perm` = static `ip host` entry; `temp` = answer cached from DNS.',
    notes:
      "A Cisco router or switch uses DNS for its own lookups — `ping`, `traceroute`, `ssh`, `copy` to a server by name, or NTP and syslog servers configured by name. Four global commands control it. `ip domain-lookup` enables DNS resolution and is **on by default**. `ip name-server` lists up to six DNS servers, tried in order; without it the device sends its queries to the broadcast address 255.255.255.255. `ip domain-name` sets the default domain appended to unqualified names — and it is also a prerequisite for generating RSA keys for SSH. `ip host` creates a static entry in the device's host table, much like a hosts file, which is consulted before DNS. IOS XE displays the first and third commands as `ip domain lookup` and `ip domain name` in the running-config; both spellings are accepted. The transcript shows a successful lookup: ping reports which server translated the name. `show hosts` summarizes everything: the default domain, whether lookups use DNS (domain service) or only static mappings, the name servers, and the host table, where **perm** marks static `ip host` entries and **temp** marks cached DNS answers. These commands affect only the device itself; they do not provide DNS service to clients.",
  },
  {
    kind: 'cli',
    title: 'Mistyped commands and no ip domain-lookup',
    code: `R2# shwo run
Translating "shwo"...domain server (255.255.255.255)
% Unknown command or computer name, or unable to find computer address
R2# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)# no ip domain-lookup
R2(config)# end
R2# shwo run
Translating "shwo"
% Unknown command or computer name, or unable to find computer address`,
    highlight: ['domain server (255.255.255.255)', 'no ip domain-lookup'],
    caption: 'Before: a broadcast DNS query and a long wait. After: an immediate error.',
    notes:
      "Here is why so many lab configurations begin with `no ip domain-lookup`. By default, IOS treats a single word that is not a command as the name of a host to Telnet to. With domain lookup enabled — the default — and no name server configured, the router sends a DNS query for shwo to the broadcast address 255.255.255.255 and waits several seconds for an answer that never comes, while you cannot type. With `no ip domain-lookup`, the lookup is skipped and the error appears immediately. The downside is that the router can no longer resolve any name through DNS, so `ping www.example.com` fails; only static `ip host` entries still work. In production networks that need DNS, the better fix is to keep lookups enabled, configure a reachable `ip name-server`, and stop the accidental Telnet attempts on the console and VTY lines with `transport preferred none`, which turns a mistyped word into a normal invalid-input error. For the exam, know three facts: `ip domain-lookup` is enabled by default, `no ip domain-lookup` disables all DNS resolution on the device, and without `ip name-server` the device broadcasts its queries.",
  },
  {
    kind: 'diagram',
    title: 'Diagnosing DNS problems step by step',
    diagram: {
      type: 'flow',
      width: 10,
      height: 6.6,
      nodes: [
        { id: 'n1', label: 'Ping by IP works?', shape: 'diamond', x: 2.4, y: 0.9 },
        { id: 'n2', label: 'Not DNS', sub: 'fix routing, gateway, ACLs', tone: 'bad', x: 7.2, y: 0.9 },
        { id: 'n3', label: 'nslookup answers?', shape: 'diamond', x: 2.4, y: 2.6 },
        { id: 'n4', label: 'Resolver problem', sub: 'wrong or unreachable server, UDP 53 blocked', tone: 'warn', x: 7.2, y: 2.6 },
        { id: 'n5', label: 'Right record?', shape: 'diamond', x: 2.4, y: 4.3 },
        { id: 'n6', label: 'Record problem', sub: 'missing, wrong or stale', tone: 'warn', x: 7.2, y: 4.3 },
        { id: 'n7', label: 'Check hosts file, cache, app', shape: 'pill', tone: 'good', x: 2.4, y: 5.9 },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: 'no' },
        { from: 'n1', to: 'n3', label: 'yes' },
        { from: 'n3', to: 'n4', label: 'times out' },
        { from: 'n3', to: 'n5', label: 'yes' },
        { from: 'n5', to: 'n6', label: 'no' },
        { from: 'n5', to: 'n7', label: 'yes' },
      ],
    },
    notes:
      "A structured approach separates DNS faults from everything else in a few commands. Step one: test **by IP address**. If a ping to the destination's IP fails, the problem is routing, a gateway, an ACL or the host itself — DNS cannot be the cause, and fixing DNS will not help. If the IP works but the name does not, it is a name-resolution problem. Step two: run **nslookup** for the name and see which server answers. If the query times out, the client is using a wrong or unreachable DNS server — check `ipconfig /all`, the DHCP pool's `dns-server` option, reachability of the server, and any ACL or firewall blocking UDP 53. Step three: if the server answers, check the **record**. NXDOMAIN or Non-existent domain means the name or record is missing or misspelled; an old address means the record was not updated or a cache still holds it; an empty answer for AAAA explains failures of IPv6-only clients; a missing or wrong MX explains undelivered mail. Step four: if nslookup returns the right address but applications still fail, check the hosts file and local cache, which nslookup bypasses, or the application itself. Diagnosing record and resolver issues this way is an explicit v2.0 emphasis.",
  },
  {
    kind: 'table',
    title: 'DNS symptoms, causes and fixes',
    columns: ['Symptom', 'Likely cause', 'Check / fix'],
    rows: [
      ['Ping by IP works, by name fails', 'No or wrong DNS server on the host', '`ipconfig /all`; DHCP `dns-server` option'],
      ['nslookup: DNS request timed out', 'Server down, unreachable or UDP 53 blocked', 'Ping the server; check ACLs and firewalls'],
      ['NXDOMAIN / Non-existent domain', 'Record missing or name misspelled', 'Check the zone and the DNS suffix'],
      ['Old address after a change', 'Cached record with a long TTL', 'Wait for the TTL; `ipconfig /flushdns`'],
      ['IPv6-only clients fail, IPv4 works', 'No AAAA record', 'Add the AAAA record'],
      ['Mail to the domain not delivered', 'MX missing, or its target has no A/AAAA', 'Check the MX and the mail host records'],
      ['One PC reaches the wrong server', 'Static hosts file entry', 'Remove the hosts entry'],
      ['Router pauses after a typo', 'Lookup on, no reachable name server', '`no ip domain-lookup` or `ip name-server`'],
    ],
    notes:
      "Use this table to map exam symptoms straight to causes. The first two rows are **resolver** problems: the client has no DNS server, the wrong one — often a typo in a static configuration or in the DHCP pool's `dns-server` option — or a server it cannot reach, possibly because an ACL blocks UDP 53. The next rows are **record** problems. NXDOMAIN means the name or record is not in the zone, or the client appended the wrong DNS suffix to a short name. An old address after a planned change points to caching: resolvers and clients keep the previous answer until its TTL expires. Clients that use IPv6 fail when the zone publishes only an A record for a host that is supposed to be dual-stack. Mail delivery depends on the **MX** record and on its target having an address record; an MX that points to an IP address or to a CNAME is a misconfiguration. A single misbehaving PC whose nslookup results are correct almost always has a hosts file entry. Finally, a router that freezes for several seconds after a typo has domain lookup enabled with no reachable server. v2.0 emphasizes exactly these diagnoses, so practice naming the record or resolver behind each symptom.",
  },
  {
    kind: 'cli',
    title: 'Case study: the name that would not resolve',
    code: `C:\\> ping -n 2 203.0.113.80

Pinging 203.0.113.80 with 32 bytes of data:
Reply from 203.0.113.80: bytes=32 time=18ms TTL=54
Reply from 203.0.113.80: bytes=32 time=17ms TTL=54

Ping statistics for 203.0.113.80:
    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 17ms, Maximum = 18ms, Average = 17ms
C:\\> ping www.example.com
Ping request could not find host www.example.com. Please check the name and try again.
C:\\> ipconfig /all | findstr DNS
   DNS Suffix Search List. . . . . . : corp.example.com
   Connection-specific DNS Suffix  . : corp.example.com
   DNS Servers . . . . . . . . . . . : 10.1.1.35
C:\\> nslookup www.example.com
DNS request timed out.
    timeout was 2 seconds.
Server:  UnKnown
Address:  10.1.1.35

DNS request timed out.
    timeout was 2 seconds.
DNS request timed out.
    timeout was 2 seconds.
DNS request timed out.
    timeout was 2 seconds.
DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out`,
    highlight: ['could not find host', '10.1.1.35', 'DNS request timed out.'],
    caption: 'The IP path works; the configured DNS server (10.1.1.35) is wrong — the real one is 10.1.1.53.',
    notes:
      "Work through this Windows transcript as you would an exam exhibit. The ping to 203.0.113.80 succeeds, so the PC's addressing, gateway and routing and the server itself are fine: this is not a connectivity problem. The ping by name fails with could not find host, which points squarely at name resolution. `ipconfig /all` filtered for DNS shows the configured server: **10.1.1.35**. The company's DNS servers are 10.1.1.53 and 10.1.1.54, so the digits were transposed — either in a static configuration or, more likely, in the DHCP pool's `dns-server` command, which would affect every client in the subnet. nslookup confirms it: the server appears as UnKnown because the PC could not even resolve the server's own reverse name, and every query times out. The fix is to correct the DNS server address at its source — `dns-server 10.1.1.53 10.1.1.54` in the DHCP pool, followed by `ipconfig /renew` on the clients — or in the adapter settings of a statically configured host. Had nslookup returned Non-existent domain instead, the server would be fine and the record would be the problem. Recognizing which of those two outputs you are looking at is the core DNS troubleshooting skill.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: DNS',
    body: 'Can ping by IP but not by name? ==Think DNS==: a wrong or unreachable server, or a missing record.',
    bullets: [
      'UDP 53 for queries; TCP 53 for zone transfers and large replies',
      'Lookup order: root → TLD → authoritative server',
      'Client → resolver = recursive; resolver → hierarchy = iterative',
      'A = IPv4, AAAA = IPv6, PTR = reverse, MX = mail, CNAME = alias',
      'MX: the **lowest** preference wins; its target needs an A/AAAA',
      '`ip domain-lookup` is on by default; `ip name-server` names servers',
      '`nslookup` bypasses the hosts file; `ping` does not',
    ],
    notes:
      "These are the DNS details that exam writers turn into distractors. DNS uses port 53 on both transports: UDP for ordinary queries, TCP for zone transfers and oversized responses — an option claiming DNS uses only TCP, or port 25 or 67, is wrong. The lookup order is root, then TLD, then the authoritative server for the domain. The client's query to its server is recursive; the resolver's queries into the tree are iterative and receive referrals. Know each record type by purpose, and remember that AAAA is the IPv6 address record, PTR the reverse record, and CNAME an alias that must be followed to an A or AAAA record. For MX, the lowest preference value is tried first, and MX targets must be names with address records. On Cisco devices, `ip domain-lookup` is enabled by default, `ip name-server` supplies up to six servers, `ip domain-name` supplies the default domain (and is needed for SSH keys), and `ip host` adds static entries. Finally, the classic scenario: a host can ping an address but not the name — the fault is DNS configuration or records, not routing.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'DNS maps names to addresses over UDP/TCP 53',
      'Hierarchy: root → TLD → authoritative zone',
      'Stubs send recursive queries; resolvers iterate and cache for the TTL',
      'Records: A, AAAA, CNAME, MX, NS, PTR, SOA, TXT',
      'Tools: hosts file, `nslookup`, `dig`, `ipconfig /flushdns`',
      'IOS: `ip domain-lookup`, `ip name-server`, `ip domain-name`, `ip host`',
      'Troubleshoot: IP first, then the server, then the record',
    ],
    notes:
      "Let's recap. DNS is a hierarchical, distributed database that maps names to addresses, mostly over UDP 53, with TCP 53 for zone transfers and large answers. The tree starts at the root, delegates to top-level domains, and ends at the authoritative servers for each zone. Clients send recursive queries to a resolver, which iterates from the root through referrals, caches everything it learns for each record's TTL, and answers from cache next time — which is also why changes take time to appear. Eight record types matter: A and AAAA for IPv4 and IPv6 addresses, CNAME for aliases, MX for mail servers with preferences, NS for delegation, PTR for reverse lookups under in-addr.arpa and ip6.arpa, SOA for zone administration, and TXT for policies such as SPF. Clients check the hosts file and cache before asking DNS, while `nslookup` and `dig` query servers directly. On IOS, `ip domain-lookup` is on by default, `ip name-server` names the servers, `ip domain-name` sets the default domain and `ip host` adds static mappings; `no ip domain-lookup` disables resolution. To troubleshoot, test by IP first, then check the server, then the record.",
  },
];
