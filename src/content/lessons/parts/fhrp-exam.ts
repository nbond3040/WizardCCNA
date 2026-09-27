import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/0     1    100   Standby 10.1.1.1        local           10.1.1.254`,
    },
    options: [
      'R2 is the standby router, and hosts should use 10.1.1.254 as their default gateway',
      'R2 is the active router for group 1',
      'R2 is configured to preempt',
      'Hosts should use 10.1.1.1 as their default gateway',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'R2\'s own state is **Standby**, the active router is 10.1.1.1, and the virtual IP — the address hosts must use — is **10.1.1.254**. The P column is empty on R2, so it is not configured to preempt, and 10.1.1.1 is R1\'s real address, which would bypass HSRP if hosts used it.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. R1 was reloaded for maintenance and is back online. Why is R1 not the active router, even though its priority is higher than R2\'s?',
    exhibit: {
      kind: 'cli',
      text: `R1# show standby
GigabitEthernet0/0/0 - Group 1
  State is Standby
    4 state changes, last state change 00:03:12
  Virtual IP address is 10.1.1.254
  Active virtual MAC address is 0000.0c07.ac01
    Local virtual MAC address is 0000.0c07.ac01 (v1 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 0.816 secs
  Preemption disabled
  Active router is 10.1.1.2, priority 100 (expires in 8.944 sec)
  Standby router is local
  Priority 120 (configured 120)
  Group name is "hsrp-Gi0/0/0-1" (default)`,
    },
    options: [
      'Preemption is not enabled on R1',
      'R2 has a higher interface IP address',
      'R1\'s hold timer has not expired yet',
      'R1 is running HSRP version 1',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'While R1 was down, R2 became active. HSRP does not preempt by default — "Preemption disabled" — so R1 returned as standby and waits, despite priority 120 versus 100. `standby 1 preempt` on R1 fixes it. The IP address tie-breaker applies only to equal priorities, the hold timer governs failure detection rather than preemption, and the HSRP version does not affect who is active.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which virtual MAC address does HSRP version 1 use for group 5?',
    options: ['0000.0c07.ac05', '0000.0c9f.f005', '0000.5e00.0105', '0007.b400.0501'],
    answer: 0,
    difficulty: 1,
    explanation:
      'HSRPv1 appends the group number in hex to 0000.0c07.ac, giving **0000.0c07.ac05**. 0000.0c9f.f005 is the HSRPv2 format, 0000.5e00.0105 is VRRP and 0007.b400.… is GLBP.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'An engineer configures HSRP version 2 with group 20 on a LAN interface. Which virtual MAC address do hosts learn for the virtual IP?',
    options: ['0000.0c9f.f014', '0000.0c9f.f020', '0000.0c07.ac14', '0000.5e00.0114'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Group 20 is 0x14, and HSRPv2 uses 0000.0c9f.fXXX, so the MAC is **0000.0c9f.f014**. f020 wrongly treats the decimal 20 as hex, 0000.0c07.ac14 is the version 1 format, and 0000.5e00.0114 would be VRRP.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Which two statements about VRRP are true? (Choose two.)',
    options: [
      'Preemption is enabled by default',
      'The virtual IP address can be the real interface address of one of the routers',
      'It is a Cisco-proprietary protocol',
      'Its virtual MAC address has the format 0000.0c07.acXX',
      'Backup routers forward part of the traffic for the virtual IP',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'VRRP **preempts by default** and allows the virtual IP to be a router\'s **real address** (the IP address owner). It is an IETF open standard, its MAC format is 0000.5e00.01XX (0000.0c07.acXX is HSRPv1), and only the master forwards traffic for the virtual IP.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'What is the main advantage of GLBP compared with HSRP and VRRP?',
    options: [
      'Several routers forward traffic for a single virtual IP address at the same time',
      'It is an open standard supported by all vendors',
      'It does not send hello messages',
      'Hosts no longer need a default gateway',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'GLBP\'s AVG hands out different virtual MACs, so up to four AVFs forward traffic for **one virtual IP** simultaneously; HSRP and VRRP need multiple groups to share load. GLBP is Cisco proprietary, it uses 3-second hellos, and hosts still use the virtual IP as their gateway.',
  },
  {
    id: 'e7',
    type: 'match',
    stem: 'Match each FHRP term to its description.',
    pairs: [
      { left: 'AVG', right: 'Answers ARP requests for the GLBP virtual IP' },
      { left: 'AVF', right: 'Forwards frames sent to one GLBP virtual MAC' },
      { left: 'VRRP backup', right: 'Takes over if the master stops advertising' },
      { left: 'HSRP standby', right: 'Monitors the active router and replaces it on failure' },
      { left: 'Preemption', right: 'Lets a higher-priority router take over the forwarding role' },
    ],
    difficulty: 2,
    explanation:
      'GLBP splits the job between the AVG (ARP) and the AVFs (forwarding). A VRRP backup and the HSRP standby router wait for the master or active router to fail, and preemption lets a better router take the role back.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each characteristic by the protocol it describes.',
    categories: ['HSRP', 'VRRP', 'GLBP'],
    items: [
      { text: 'Active and standby routers', category: 0 },
      { text: 'Virtual MAC 0000.0c07.acXX', category: 0 },
      { text: 'Master and backup routers', category: 1 },
      { text: 'Preemption enabled by default', category: 1 },
      { text: 'Virtual MAC 0000.5e00.01XX', category: 1 },
      { text: 'One gateway hands out several virtual MACs', category: 2 },
      { text: 'Up to four forwarders share one virtual IP', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'Active/standby and the 0000.0c07.ac prefix identify HSRP; master/backup, default preemption and 0000.5e00.01 identify VRRP; an AVG handing out MACs to up to four AVFs is GLBP.',
  },
  {
    id: 'e9',
    type: 'order',
    stem: 'Put the HSRP states in the order a router passes through on its way to becoming the active router.',
    items: ['Initial', 'Learn', 'Listen', 'Speak', 'Standby', 'Active'],
    difficulty: 2,
    explanation:
      'A router starts in Initial, learns the virtual IP (Learn), listens for hellos (Listen), joins the election (Speak), and becomes Standby before it can become Active.',
  },
  {
    id: 'e10',
    type: 'input',
    stem: 'Enter the interface command that lets a router take over the active role in HSRP group 1 whenever its priority is higher than that of the current active router.',
    answers: ['standby 1 preempt'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`standby 1 preempt` enables preemption for group 1. HSRP has preemption disabled by default, so a higher priority alone never triggers a takeover.',
  },
  {
    id: 'e11',
    type: 'input',
    stem: 'Which multicast address does HSRP version 2 use for its hello messages?',
    answers: ['224.0.0.102'],
    placeholder: 'x.x.x.x',
    difficulty: 1,
    explanation: 'HSRPv2 uses **224.0.0.102** (GLBP uses it too). HSRPv1 uses 224.0.0.2 and VRRP uses 224.0.0.18.',
  },
  {
    id: 'e12',
    type: 'input',
    stem: 'Which virtual MAC address does VRRP use for virtual router ID 10?',
    answers: ['0000.5e00.010a', '00:00:5e:00:01:0a', '00-00-5e-00-01-0a'],
    placeholder: 'xxxx.xxxx.xxxx',
    difficulty: 2,
    explanation: 'VRRP uses 0000.5e00.01XX with the VRID in hex; 10 = 0x0a, so the MAC is **0000.5e00.010a**.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. R1 is the HSRP active router (priority 110, preempt) and R2 is standby (priority 100, preempt). R1\'s WAN uplink fails, but its LAN interface stays up. No object tracking is configured. What happens?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'pc1', icon: 'pc', label: 'PC1', sub: 'GW 10.1.1.254', x: 0.9, y: 1.2 },
          { id: 'pc2', icon: 'pc', label: 'PC2', x: 0.9, y: 3.8 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 3, y: 2.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'Active · 10.1.1.1', x: 5.6, y: 1.2, tone: 'accent' },
          { id: 'r2', icon: 'router', label: 'R2', sub: 'Standby · 10.1.1.2', x: 5.6, y: 3.8 },
          { id: 'wan', icon: 'internet', label: 'WAN', x: 8.8, y: 2.5 },
        ],
        links: [
          { from: 'pc1', to: 'sw' },
          { from: 'pc2', to: 'sw' },
          { from: 'sw', to: 'r1' },
          { from: 'sw', to: 'r2' },
          { from: 'r1', to: 'wan', label: 'uplink down', tone: 'bad', style: 'dashed' },
          { from: 'r2', to: 'wan' },
        ],
      },
    },
    options: [
      'R1 remains the active router, because HSRP is not tracking the uplink',
      'R2 becomes active immediately, because R1 has lost its uplink',
      'R1 and R2 both become active for the virtual IP',
      'The hosts switch their default gateway to 10.1.1.2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'HSRP hellos travel on the LAN, so R2 still hears R1 and R1 keeps the active role — hosts keep sending traffic to a router whose uplink is down. Object tracking (for example `standby 1 track 1 decrement 20`) would lower R1\'s priority below 100, and because R2 preempts, R2 would then take over. Both routers never become active while hellos flow, and hosts never change their gateway.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. What is the most likely cause of this output?',
    exhibit: {
      kind: 'cli',
      text: `R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/0     1    110 P Active  local           unknown         10.1.1.254
R2# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/0     1    100   Active  local           unknown         10.1.1.254`,
    },
    options: [
      'R1 and R2 are not receiving each other\'s HSRP hello messages',
      'Preemption is configured on R1 only',
      'Both routers use the default HSRP priority',
      'HSRP is working normally, and both routers share the load',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Each router reports itself as active with an **unknown** standby, so neither hears the other\'s hellos — for example because the routers sit in different VLANs or run different HSRP versions. Preemption and priority only matter once the routers can hear each other (and R1 already uses 110), and HSRP never load-balances within a single group: two active routers mean duplicate gateways, not load sharing.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R2# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0/0            1   100 3609       Y  Backup  10.1.1.1        10.1.1.254`,
    },
    options: [
      'R2 is a VRRP backup, and the current master\'s real address is 10.1.1.1',
      'R2 is the VRRP master for group 1',
      'R2 owns the virtual IP address 10.1.1.254',
      'Preemption is disabled on R2',
    ],
    answer: 0,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'The State column shows **Backup**, and Master addr is the current master\'s real IP, 10.1.1.1; Group addr is the virtual IP, 10.1.1.254. The Own column is empty, so R2 is not the address owner, and Pre = Y means preemption is enabled.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `R1# show vrrp
GigabitEthernet0/0/0 - Group 10
  State is Master
  Virtual IP address is 10.1.1.254
  Virtual MAC address is 0000.5e00.010a
  Advertisement interval is 1.000 sec
  Preemption enabled
  Priority is 120
  Master Router is 10.1.1.1 (local), priority is 120
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.531 sec`,
    },
    options: [
      'R1 is the master router for VRRP group 10',
      'The last byte of the virtual MAC address is the group number 10 in hexadecimal',
      'R1 is the IP address owner of 10.1.1.254',
      'Preemption must be configured manually before R1 can regain the master role',
      'The backup routers also send advertisements every second',
    ],
    answers: [0, 1],
    difficulty: 3,
    tags: ['v2.0'],
    explanation:
      '"State is Master" and "Master Router is 10.1.1.1 (local)" show that R1 is master for group 10, and 0a in 0000.5e00.010a is 10 in hex. R1\'s real address is 10.1.1.1 and its priority is 120, not 255, so it is not the address owner. Preemption is already enabled — the VRRP default — and only the master sends advertisements.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Which first hop redundancy protocol is Cisco proprietary and load-balances traffic across several routers that share one virtual IP address?',
    options: ['GLBP', 'HSRP', 'VRRP', 'IRDP'],
    answer: 0,
    difficulty: 1,
    explanation:
      'GLBP spreads hosts across up to four forwarders behind one virtual IP. HSRP is Cisco proprietary but needs multiple groups to share load, VRRP is an open standard, and IRDP is an old ICMP-based router discovery method with no shared virtual IP.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 are powered on at the same time. Which router becomes the HSRP active router?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config | include standby
 standby 1 ip 10.1.1.254
 standby 1 priority 90
 standby 1 preempt
R2# show running-config | include standby
 standby 1 ip 10.1.1.254`,
    },
    options: [
      'R2, because its default priority of 100 is higher than R1\'s 90',
      'R1, because it is configured to preempt',
      'R1, because R2 has no priority configured',
      'Both routers, because their configurations differ',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R2 uses the default priority of **100**, which beats R1\'s 90, so R2 wins the election. Preemption only lets a router take over when its priority is higher, so it does not help R1. An unconfigured priority simply means 100, and differing optional settings do not create two active routers.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'The HSRP active router on a LAN fails. Which two statements describe what happens? (Choose two.)',
    options: [
      'The standby router becomes active after the hold time expires',
      'The new active router uses the same virtual MAC address, so hosts need no changes',
      'Hosts must renew their DHCP leases to learn a new default gateway',
      'Hosts must clear their ARP caches before traffic can flow again',
      'The standby router becomes active only after an administrator enables preemption',
    ],
    answers: [0, 1],
    difficulty: 1,
    explanation:
      'When hellos stop for the hold time (10 s by default), the standby router becomes active and takes over the **same virtual IP and virtual MAC**, announcing itself with a gratuitous ARP for the switches. Hosts keep the same gateway and ARP entry, and preemption plays no part in failover — it only matters when a better router returns.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Which two statements about HSRP version 2 compared with version 1 are true? (Choose two.)',
    options: [
      'It supports group numbers from 0 to 4095',
      'It sends hello messages to 224.0.0.102',
      'It uses virtual MAC addresses in the range 0000.0c07.acXX',
      'It is enabled by default on IOS routers',
      'It is an IETF open standard',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'HSRPv2 extends the group range to 0–4095 and uses **224.0.0.102**. 0000.0c07.acXX is the version 1 MAC format (version 2 uses 0000.0c9f.fXXX), version 1 is the default, and both versions are Cisco proprietary.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 provide the default gateway for VLAN 10 and VLAN 20 with HSRP. The engineer wants both routers to forward user traffic under normal conditions while still protecting both VLANs. Which design achieves this?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'r1', icon: 'router', label: 'R1', x: 3, y: 1 },
          { id: 'r2', icon: 'router', label: 'R2', x: 7, y: 1 },
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5, y: 2.8 },
          { id: 'pa', icon: 'pc', label: 'PC-A', sub: 'VLAN 10', x: 2.6, y: 4.3 },
          { id: 'pb', icon: 'pc', label: 'PC-B', sub: 'VLAN 20', x: 7.4, y: 4.3 },
        ],
        links: [
          { from: 'r1', to: 'sw', label: 'trunk' },
          { from: 'r2', to: 'sw', label: 'trunk' },
          { from: 'sw', to: 'pa' },
          { from: 'sw', to: 'pb' },
        ],
      },
    },
    options: [
      'One HSRP group per VLAN, with R1 active for VLAN 10 and R2 active for VLAN 20',
      'A single HSRP group for both VLANs with equal priorities on both routers',
      'One HSRP group per VLAN with R1 active for both, and preemption enabled on R2',
      'HSRP version 2, which lets the standby router forward traffic as well',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'An HSRP group has exactly one active router, so load sharing needs **one group per VLAN** with the active roles split between the routers; each router still backs up the other VLAN. A single group cannot serve two subnets, making R1 active for both leaves R2 idle, and HSRPv2 changes group ranges, MACs and multicast, not the one-active-router rule. GLBP could instead balance hosts within a single VLAN.',
  },
];

export default exam;
