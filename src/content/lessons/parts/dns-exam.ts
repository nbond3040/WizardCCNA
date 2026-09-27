import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which DNS record type is used to find the host name that belongs to an IP address?',
    options: ['A', 'CNAME', 'PTR', 'NS'],
    answer: 2,
    difficulty: 1,
    explanation:
      'A **PTR** record maps an address back to a name and lives under in-addr.arpa (IPv4) or ip6.arpa (IPv6). An A record maps a name to an IPv4 address, a CNAME makes one name an alias of another, and NS records name a zone\'s authoritative servers.',
  },
  {
    id: 'e2',
    type: 'match',
    stem: 'Match each DNS record type to its purpose.',
    pairs: [
      { left: 'A', right: 'Maps a name to an IPv4 address' },
      { left: 'AAAA', right: 'Maps a name to an IPv6 address' },
      { left: 'CNAME', right: 'Makes one name an alias of another' },
      { left: 'MX', right: 'Identifies the mail servers of a domain' },
      { left: 'NS', right: 'Identifies the authoritative servers of a zone' },
      { left: 'PTR', right: 'Maps an address back to a name' },
      { left: 'SOA', right: 'Holds the zone serial number and timers' },
      { left: 'TXT', right: 'Carries text such as an SPF policy' },
    ],
    difficulty: 1,
    explanation:
      'A and AAAA supply IPv4 and IPv6 addresses, CNAME creates aliases, MX locates mail servers, NS names the authoritative servers of a zone, PTR serves reverse lookups, SOA holds the serial number and timers of the zone, and TXT carries free text such as SPF, DKIM and DMARC policies.',
  },
  {
    id: 'e3',
    type: 'order',
    stem: 'Put the labels of the fully qualified name www.sales.example.com. in order, from the most general (closest to the root) to the most specific.',
    items: ['. (the root)', 'com', 'example', 'sales', 'www'],
    difficulty: 2,
    explanation:
      'DNS names are read from **right to left**: the trailing dot is the root, com is the top-level domain, example the second-level domain, sales a subdomain (possibly delegated as its own zone) and www the host. Resolution follows the same order: root servers refer to the com servers, which refer to the example.com servers.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> nslookup portal.example.com
Server:  dns1.corp.example.com
Address:  10.1.1.53

Non-authoritative answer:
Name:    app7.cloudhost.example.net
Address:  198.51.100.77
Aliases:  portal.example.com`,
    },
    options: [
      'portal.example.com is an alias (CNAME) for app7.cloudhost.example.net, whose address record is 198.51.100.77',
      'portal.example.com has its own A record for 198.51.100.77, and dns1 is authoritative for it',
      'The query failed, and nslookup displayed a cached alias instead',
      '198.51.100.77 has a PTR record that names portal.example.com',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'In Windows nslookup output, the name you asked for appears under **Aliases** when it is a CNAME, and **Name** shows the canonical name whose address record supplied 198.51.100.77. Non-authoritative answer only means the reply did not come entirely from an authoritative server — the lookup succeeded. Nothing here is a reverse (PTR) lookup.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. The company DNS servers are 10.1.1.53 and 10.1.1.54. What is the cause of the problem?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> ping -n 1 198.51.100.77

Pinging 198.51.100.77 with 32 bytes of data:
Reply from 198.51.100.77: bytes=32 time=21ms TTL=53

Ping statistics for 198.51.100.77:
    Packets: Sent = 1, Received = 1, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 21ms, Maximum = 21ms, Average = 21ms
C:\\> ping portal.example.com
Ping request could not find host portal.example.com. Please check the name and try again.
C:\\> nslookup portal.example.com
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
    },
    options: [
      'The portal.example.com record is missing from the zone',
      'The PC is configured with the wrong DNS server address',
      'The PC has no route to 198.51.100.77',
      'An ACL blocks ICMP to portal.example.com',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The ping by IP succeeds, so routing, the gateway and ICMP are fine. Only the name fails, and nslookup shows the PC querying **10.1.1.35** — not one of the company servers — with every request timing out. The PC, or the DHCP pool that configured it, has a mistyped DNS server. A missing record would produce a quick Non-existent domain reply from a working server, not timeouts.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'An engineer previously entered `no ip domain-lookup` on R1. R1 must now resolve names such as www.example.com by using the DNS server 10.1.1.53. Which two commands are required? (Choose two.)',
    options: [
      '`ip host www.example.com 10.1.1.53`',
      '`ip domain-lookup`',
      '`ip dns server`',
      '`ip name-server 10.1.1.53`',
      '`ip helper-address 10.1.1.53`',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      "`ip domain-lookup` re-enables DNS resolution (it is on by default but was disabled), and `ip name-server 10.1.1.53` tells R1 which server to query — without it, R1 would broadcast its queries. `ip host` would statically map www.example.com to the DNS server's own address, `ip dns server` makes R1 answer DNS queries for other hosts, and `ip helper-address` relays UDP broadcasts arriving on an interface; none of them makes R1 a working DNS client.",
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Which IOS global configuration command statically maps the host name FILESRV to 10.1.1.80 on a router?',
    answers: ['ip host FILESRV 10.1.1.80'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`ip host FILESRV 10.1.1.80` adds a permanent entry to the router\'s host table, which is checked before DNS and works even with `no ip domain-lookup`. `show hosts` lists it with the perm flag.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. After mistyping a command, the engineer waits several seconds before the error appears. R2 does not need to resolve names through DNS. Which command removes the delay?',
    exhibit: {
      kind: 'cli',
      text: `R2# shwo run
Translating "shwo"...domain server (255.255.255.255)
% Unknown command or computer name, or unable to find computer address`,
    },
    options: [
      '`ip name-server 255.255.255.255`',
      '`no ip domain-name`',
      '`no ip domain-lookup`',
      '`no service dhcp`',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'IOS treated the unknown word as a host name and, with domain lookup enabled by default and no name server configured, broadcast a DNS query to 255.255.255.255 and waited for it to time out. `no ip domain-lookup` stops all DNS lookups, so the error appears immediately. Configuring the broadcast address as a name server keeps the delay, removing the domain name only changes the suffix appended to names, and `service dhcp` controls the DHCP server and relay.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each DNS exchange by the transport it normally uses.',
    categories: ['UDP 53', 'TCP 53'],
    items: [
      { text: 'A query from a PC for www.example.com', category: 0 },
      { text: 'AAAA query from a web browser', category: 0 },
      { text: 'PTR lookup performed by a syslog server', category: 0 },
      { text: 'Zone transfer from a primary to a secondary server', category: 1 },
      { text: 'Retry of a query whose UDP response was truncated', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Ordinary queries of any record type — A, AAAA, PTR and so on — use **UDP 53**. **TCP 53** carries zone transfers and the retry that follows a truncated UDP response (TC flag set) when an answer is too large for UDP.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. IPv6-only clients cannot reach www.example.com, while IPv4 clients can. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `$ dig www.example.com AAAA

; <<>> DiG 9.18.24 <<>> www.example.com AAAA
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 5120
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.example.com.               IN      AAAA

;; AUTHORITY SECTION:
example.com.            900     IN      SOA     ns1.example.com. hostmaster.example.com. 2026092601 7200 3600 1209600 900

;; Query time: 31 msec
;; SERVER: 10.1.1.53#53(10.1.1.53) (UDP)
;; WHEN: Sat Sep 26 10:20:44 UTC 2026
;; MSG SIZE  rcvd: 95`,
    },
    options: [
      'The name www.example.com does not exist in DNS',
      'The DNS server 10.1.1.53 is unreachable',
      'The zone has no AAAA record for www.example.com',
      'The SOA record contains an invalid serial number',
    ],
    answer: 2,
    difficulty: 3,
    tags: ['v2.0'],
    explanation:
      'The status is **NOERROR** — the name exists and the server answered in 31 ms — but ANSWER is 0: there is no record of the requested type. Servers return the zone\'s SOA record in the authority section of such no-data answers for negative caching. IPv6-only clients need an **AAAA** record, so adding one fixes them. A nonexistent name would return NXDOMAIN, an unreachable server would time out, and the serial is an ordinary date-based value.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. The owner of example.net wants mx1 to receive all mail, with mx2 as the backup. Which statement describes the current situation and the fix?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> nslookup -type=mx example.net
Server:  dns1.corp.example.com
Address:  10.1.1.53

Non-authoritative answer:
example.net     MX preference = 10, mail exchanger = mx1.example.net
example.net     MX preference = 20, mail exchanger = mx2.example.net

C:\\> nslookup mx1.example.net
Server:  dns1.corp.example.com
Address:  10.1.1.53

*** dns1.corp.example.com can't find mx1.example.net: Non-existent domain`,
    },
    options: [
      'Senders try mx1 first, find no address for it and deliver to mx2; add an A (or AAAA) record for mx1.example.net',
      'Senders prefer mx2 because 20 is the higher preference; swap the preference values',
      'MX records must contain IP addresses; replace the host names with addresses',
      'Mail cannot be delivered until the MX records are replaced with a CNAME record',
    ],
    answer: 0,
    difficulty: 3,
    tags: ['v2.0'],
    explanation:
      'The **lower** preference wins, so mx1 (10) is tried first — the preferences are already correct. But mx1.example.net does not exist in DNS, so senders cannot resolve it and fall back to mx2, which silently receives all the mail. The fix is an A or AAAA record for mx1.example.net. MX records must point to host names, never to IP addresses, and a CNAME cannot replace MX records.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'An administrator changed the A record of www.example.com from 203.0.113.80 to 203.0.113.90. For about an hour afterward, some users still reach the old server. What is the most likely reason?',
    options: [
      'The PTR record for 203.0.113.80 was not deleted',
      'Resolvers and clients cached the old record until its TTL expired',
      'DNS responses use TCP, so existing sessions had to time out first',
      'Users must renew their DHCP leases to learn the new address',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Every record carries a **TTL**; resolvers and clients that looked up the name before the change keep the old answer until that TTL (for example 3600 seconds) expires. Lowering the TTL before a planned change shortens this window. PTR records are only used for reverse lookups, ordinary DNS answers travel over UDP, and DHCP does not deliver per-host DNS records.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements about CNAME records are true? (Choose two.)',
    options: [
      'A CNAME maps a host name directly to an IPv4 address',
      'A CNAME makes one name an alias of another name',
      'A CNAME identifies the mail servers of a domain',
      'After receiving a CNAME, the resolver continues with a lookup of the canonical name',
      'A CNAME maps an IP address back to a host name',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'A CNAME points an **alias** at a canonical name, and the resolver must then look up the canonical name\'s A or AAAA record to obtain an address. Name-to-IPv4 mappings are A records, mail servers are published with MX records, and address-to-name mappings are PTR records.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. The intranet site moved from 10.1.1.80 to 10.1.1.90 a week ago, and every other PC reaches the new server. What is the most likely cause on this PC?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> ping -n 1 intranet.corp.example.com

Pinging intranet.corp.example.com [10.1.1.80] with 32 bytes of data:
Reply from 10.1.1.80: bytes=32 time<1ms TTL=127

Ping statistics for 10.1.1.80:
    Packets: Sent = 1, Received = 1, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
C:\\> nslookup intranet.corp.example.com
Server:  dns1.corp.example.com
Address:  10.1.1.53

Name:    intranet.corp.example.com
Address:  10.1.1.90`,
    },
    options: [
      'The DNS server still has the old A record',
      "A static entry in the PC's hosts file maps the name to 10.1.1.80",
      'The PC uses the wrong DNS server',
      'The A record has a TTL of one hour',
    ],
    answer: 1,
    difficulty: 3,
    tags: ['v2.0'],
    explanation:
      "nslookup queries dns1 directly and receives the correct address, **10.1.1.90** (with no Non-authoritative line, because dns1 is authoritative for corp.example.com), so the server and its record are fine. Ping uses the operating system's full resolver, which checks the **hosts file** first, and it resolves the name to the old address. A one-hour TTL would have expired days ago, and the PC is clearly using the correct server.",
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'Which port number do DNS servers listen on for client queries?',
    answers: ['53', 'udp 53', 'udp/53', 'port 53'],
    placeholder: 'port',
    difficulty: 1,
    explanation:
      'DNS uses port **53**: UDP for ordinary queries and TCP for zone transfers and large responses. Port 67 is the DHCP server and port 25 is SMTP.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two statements about DNS query types are true? (Choose two.)',
    options: [
      'A client typically sends a recursive query to its configured DNS server',
      'Root servers perform recursion for any client that asks',
      'In response to an iterative query, a server may reply with a referral to other servers',
      'A recursive query is answered only with referrals',
      'Iterative queries are sent only by end hosts',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Stub resolvers send **recursive** queries, asking their DNS server for a final answer. Resolvers send **iterative** queries into the hierarchy and receive referrals toward the answer. Root and TLD servers do not perform recursion, a recursive query must be answered with a result or an error rather than a referral, and iterative queries come from resolvers, not end hosts.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. R1 can ping FILESRV by name but not www.example.com. The company DNS server is 10.1.1.53. Which configuration allows R1 to resolve www.example.com through DNS?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include ip domain|ip name|ip host
no ip domain lookup
ip domain name corp.example.com
ip host FILESRV 10.1.1.80
R1# ping FILESRV
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.1.1.80, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms
R1# ping www.example.com
% Unrecognized host or address, or protocol not running.`,
    },
    options: [
      '`ip name-server 10.1.1.53` only',
      '`ip host www.example.com 10.1.1.53`',
      '`ip domain-lookup` and `ip name-server 10.1.1.53`',
      '`ip domain-name example.com`',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      "FILESRV works because it is a static `ip host` entry, which does not need DNS. The running-config shows that lookups are disabled (`no ip domain lookup`, the IOS XE spelling) and that no name server is configured, so R1 must both **enable lookups** and **name a server**. A name server alone does nothing while lookups are disabled, `ip host www.example.com 10.1.1.53` would map the name to the DNS server's address instead of the web server's, and changing the default domain does not enable resolution.",
  },
  {
    id: 'e18',
    type: 'categorize',
    stem: 'Classify each DNS record type by what its data provides.',
    categories: ['An address for a name', 'A name for an address', 'Another name to look up'],
    items: [
      { text: 'A', category: 0 },
      { text: 'AAAA', category: 0 },
      { text: 'PTR', category: 1 },
      { text: 'CNAME', category: 2 },
      { text: 'MX', category: 2 },
      { text: 'NS', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Only **A** and **AAAA** records supply addresses for names, and **PTR** works in the opposite direction. **CNAME, MX and NS** all point to host names that must then be resolved with A or AAAA records — which is why an MX or NS target without an address record breaks mail delivery or delegation.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: "Which DNS record contains a zone's serial number and its refresh, retry and expire timers?",
    options: ['NS', 'TXT', 'PTR', 'SOA'],
    answer: 3,
    difficulty: 1,
    explanation:
      'The **SOA** (start of authority) record, one per zone, names the primary server and the administrator mailbox and holds the serial number, the refresh, retry and expire timers and the negative-caching TTL. NS names authoritative servers, TXT carries free text and PTR maps addresses to names.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'A company is setting up email for its new domain example.org; its mail server is mail.example.org. Which two records must exist so that other mail servers can deliver mail to the domain? (Choose two.)',
    options: [
      'An MX record for example.org that points to mail.example.org',
      'A PTR record for example.org',
      'An A (or AAAA) record for mail.example.org',
      'A CNAME record for example.org that points to mail.example.org',
      'An NS record for mail.example.org',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Sending servers look up the **MX** records of the recipient domain and then resolve the MX target with an **A or AAAA** record before connecting on TCP 25. PTR records are keyed by address, not by domain name — a PTR for the mail server\'s address is good practice but does not route mail to the domain. A CNAME cannot replace MX records (and cannot exist at the zone apex), and NS records delegate zones rather than locate mail servers.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 receives its IP settings from the DHCP pool on R1. PC1 can ping 203.0.113.80 but cannot open www.example.com. Which change fixes the problem for all DHCP clients?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: 'DHCP client', x: 1.1, y: 2.4 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 3.3, y: 2.4 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'DHCP server', x: 5.6, y: 2.4 },
          { id: 'dns', icon: 'server', label: 'DNS server', sub: '10.1.1.53', x: 8.6, y: 1 },
          { id: 'web', icon: 'server', label: 'www.example.com', sub: '203.0.113.80', x: 8.6, y: 3.8 },
        ],
        links: [
          { from: 'pc', to: 'sw' },
          { from: 'sw', to: 'r1', toLabel: 'G0/0/0' },
          { from: 'r1', to: 'dns', fromLabel: 'G0/0/1' },
          { from: 'r1', to: 'web', fromLabel: 'G0/0/2', label: 'Internet' },
        ],
        annotations: [{ x: 3.3, y: 4.4, text: 'R1 pool LAN: dns-server 10.1.1.35', tone: 'bad' }],
      },
    },
    options: [
      'Add `ip name-server 10.1.1.53` on R1',
      'Add `ip domain-lookup` on R1',
      'Create a CNAME record for www.example.com',
      "Change the pool to `dns-server 10.1.1.53` and renew the clients' leases",
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      "Clients learn their DNS server from the pool's `dns-server` option (DHCP option 6), and the pool hands out 10.1.1.35 instead of 10.1.1.53. The IP path works, so correcting the option and letting clients renew fixes name resolution for every client. `ip name-server` and `ip domain-lookup` affect only R1's own lookups, and the record for www.example.com is not the problem.",
  },
  {
    id: 'e22',
    type: 'input',
    stem: 'Which name does a resolver query to find the PTR record for 198.51.100.25?',
    answers: ['25.100.51.198.in-addr.arpa', '25.100.51.198.in-addr.arpa.'],
    placeholder: 'name',
    difficulty: 2,
    explanation:
      'For IPv4 reverse lookups the octets are written in **reverse order** under in-addr.arpa: 198.51.100.25 becomes **25.100.51.198.in-addr.arpa**. Reversing puts the network part nearest the root, so reverse zones can be delegated along address-block boundaries.',
  },
];
