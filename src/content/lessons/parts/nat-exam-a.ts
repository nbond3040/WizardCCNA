import type { Question } from '../../types';

export const natExamA: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which NAT term refers to the IPv4 address that represents an inside host to devices on the Internet?',
    options: ['Inside local', 'Inside global', 'Outside local', 'Outside global'],
    answer: 1,
    difficulty: 1,
    explanation:
      'The host lives on the **inside**, and the Internet sees it from the outside, so the address is the **inside global** — the public address NAT substitutes. Inside local is the host’s own (usually private) address; outside local and outside global describe hosts that live on the outside.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which inside host is using inside global socket 198.51.100.2:1025?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
tcp  198.51.100.2:49820    10.1.1.21:49820       192.0.2.80:443        192.0.2.80:443
tcp  198.51.100.2:1025     10.1.1.35:49820       192.0.2.80:443        192.0.2.80:443
udp  198.51.100.2:53011    10.1.1.21:53011       192.0.2.53:53         192.0.2.53:53
Total number of translations: 3`,
    },
    options: ['10.1.1.21', '10.1.1.35', '192.0.2.80', '198.51.100.2'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Read the line whose **Inside global** column shows 198.51.100.2:1025: its Inside local column is **10.1.1.35:49820**. That host used the same source port as 10.1.1.21, so PAT assigned it port 1025. 10.1.1.21 owns the other two entries, 192.0.2.80 is the outside server, and 198.51.100.2 is the shared inside global itself.',
  },
  {
    id: 'e3',
    type: 'match',
    stem: 'PC-A (10.2.2.25) browses to a server at 192.0.2.80. R1 translates PC-A to 203.0.113.44; no outside NAT is configured. Match each address, as observed, to its NAT term.',
    pairs: [
      { left: '10.2.2.25', right: 'Inside local' },
      { left: '203.0.113.44', right: 'Inside global' },
      { left: '192.0.2.80 in packets on the ISP link', right: 'Outside global' },
      { left: '192.0.2.80 in packets on PC-A’s LAN', right: 'Outside local' },
    ],
    difficulty: 2,
    explanation:
      'PC-A is the inside host: its own address is the **inside local** and the public address R1 gives it is the **inside global**. The server is the outside host: seen on the outside network it is the **outside global**; seen from the inside LAN it is the **outside local**. Without outside NAT both outside terms carry the same value, 192.0.2.80.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'All hosts in 10.1.1.0/24 must share the address of G0/0/1, R1’s Internet-facing interface. The interface roles are already configured and access list 1 permits 10.1.1.0 0.0.0.255. Which command completes the configuration?',
    options: [
      '`ip nat inside source list 1 interface GigabitEthernet0/0/1 overload`',
      '`ip nat inside source list 1 interface GigabitEthernet0/0/0 overload`',
      '`ip nat outside source list 1 interface GigabitEthernet0/0/1 overload`',
      '`ip nat inside source list 1 pool GigabitEthernet0/0/1 overload`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'PAT with the interface address uses `ip nat inside source list 1 interface <outside interface> overload`, and the outside interface is **G0/0/1**. Naming G0/0/0 would try to use the LAN address; `ip nat outside source` translates outside hosts; and the `pool` keyword expects the name of an `ip nat pool`, not an interface.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. Users on 10.1.1.0/24 cannot reach the Internet, and `show ip nat translations` shows no entries. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config
<output omitted>
interface GigabitEthernet0/0/0
 description LAN 10.1.1.0/24
 ip address 10.1.1.1 255.255.255.0
 ip nat outside
!
interface GigabitEthernet0/0/1
 description Link to ISP
 ip address 198.51.100.2 255.255.255.252
 ip nat inside
!
ip nat inside source list 1 interface GigabitEthernet0/0/1 overload
ip route 0.0.0.0 0.0.0.0 198.51.100.1
!
access-list 1 permit 10.1.1.0 0.0.0.255`,
    },
    options: [
      'The `ip nat inside` and `ip nat outside` commands are applied to the wrong interfaces',
      'Access list 1 uses the wrong wildcard mask for the LAN',
      'PAT requires a NAT pool instead of an interface',
      'The default route must use an exit interface instead of a next-hop address',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The LAN interface G0/0/0 is marked `ip nat outside` and the ISP interface G0/0/1 is marked `ip nat inside`, so LAN traffic never enters an inside interface and never matches the inside source rule. Swapping the two commands fixes it. The ACL correctly matches 10.1.1.0/24, interface overload is valid PAT, and a next-hop default route works fine.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. G0/0/0 (`ip nat inside`) connects to the 10.1.1.0/24 LAN and G0/0/1 (`ip nat outside`) connects to the ISP. Users cannot reach the Internet and the translation table is empty. What should the engineer do?',
    exhibit: {
      kind: 'cli',
      text: `R1# show access-lists 1
Standard IP access list 1
    10 permit 10.1.10.0, wildcard bits 0.0.0.255
R1# show ip nat statistics | begin Dynamic
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/0/1 refcount 0`,
    },
    options: [
      'Change access list 1 to permit 10.1.1.0 0.0.0.255',
      'Add the `overload` keyword to the mapping',
      'Swap the `ip nat inside` and `ip nat outside` commands',
      'Replace the interface mapping with a pool that contains 198.51.100.2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'ACL 1 permits **10.1.10.0/24**, but the users are in 10.1.1.0/24, so no inside local address matches and nothing is translated (refcount 0, no ACL matches). Correcting the ACL fixes it. Adding `overload` cannot help while no host matches the ACL, the stem confirms the interface roles are right, and a pool is unnecessary because the interface address can be overloaded directly.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two statements describe static NAT? (Choose two.)',
    options: [
      'It creates a permanent one-to-one mapping between an inside local and an inside global address',
      'It allows hosts on the outside to initiate connections to the mapped inside host',
      'It requires an ACL to identify the inside local address',
      'It lets many inside hosts share one inside global address',
      'Its entries are removed by `clear ip nat translation *`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Static NAT is a **permanent one-to-one** mapping, so outside hosts can **initiate** connections to the inside global address. The addresses are typed in the command itself, so no ACL is needed. Sharing one address among many hosts is PAT, and `clear ip nat translation *` removes only dynamic entries.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'A packet arrives on R1’s NAT inside interface and is forwarded out its NAT outside interface. Put the operations R1 performs in order.',
    items: [
      'Check the inbound ACL on the inside interface',
      'Look up the destination in the routing table',
      'Translate the inside local source address to the inside global address',
      'Check the outbound ACL on the outside interface',
      'Transmit the frame out the outside interface',
    ],
    difficulty: 2,
    explanation:
      'For inside-to-outside traffic IOS checks the inbound ACL first (it sees the inside local address), then **routes**, then **translates** the source, then checks any outbound ACL (which sees the inside global address) and transmits. That is why a missing route prevents translation and why outbound ACLs on the outside interface must match public addresses.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each description or command by the type of NAT it belongs to.',
    categories: ['Static NAT', 'Dynamic NAT', 'PAT'],
    items: [
      { text: 'Permanent entry; outside users can initiate connections', category: 0 },
      { text: '`ip nat inside source static 10.1.1.10 203.0.113.10`', category: 0 },
      { text: 'Borrows one public address per inside host from a pool', category: 1 },
      { text: '`ip nat inside source list 1 pool PUBLIC`', category: 1 },
      { text: 'New hosts fail when every pool address is in use', category: 1 },
      { text: 'Many inside hosts share one public address using ports', category: 2 },
      { text: '`ip nat inside source list 1 interface G0/0/1 overload`', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Static NAT is the fixed one-to-one mapping typed with `static`. Dynamic NAT binds an ACL to a pool without `overload`, lends one address per host and can be exhausted. PAT adds `overload` (on an interface or a pool) and multiplexes hosts by port number.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Some users reach the Internet while others time out. Which change lets all users reach the Internet with the existing public addresses?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip nat statistics
Total active translations: 6 (0 static, 6 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0/1
Inside interfaces:
  GigabitEthernet0/0/0
Hits: 48211  Misses: 31
Expired translations: 2
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool BRANCH refcount 6
 pool BRANCH: netmask 255.255.255.248
        start 203.0.113.33 end 203.0.113.38
        type generic, total addresses 6, allocated 6 (100%), misses 23`,
    },
    options: [
      'Add the `overload` keyword to the `ip nat inside source list 1 pool BRANCH` command',
      'Enter `clear ip nat translation *`',
      'Change the pool netmask to 255.255.255.240',
      'Apply `ip nat inside` to GigabitEthernet0/0/1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'All six pool addresses are allocated (100%) and 23 allocation misses show hosts being refused — **pool exhaustion**. Adding `overload` turns the pool into PAT so every host can share the six addresses. Clearing the table only frees addresses until the next six hosts grab them, changing the netmask does not add addresses because the start and end are unchanged, and G0/0/1 is correctly the outside interface.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which privileged EXEC command removes all dynamic entries from the NAT translation table?',
    answers: ['clear ip nat translation *', 'clear ip nat trans *'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`clear ip nat translation *` deletes every dynamic translation (static entries stay because they come from configuration). Note the singular word **translation** — `show ip nat translations` is plural, the clear command is not.',
  },
];
