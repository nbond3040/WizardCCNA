import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which interface state indicates that the `shutdown` command is configured on the interface?',
    options: ['administratively down / down', 'down / down (notconnect)', 'up / down', 'down / down (err-disabled)'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Administratively down** appears only when `shutdown` is configured. notconnect means no physical link, up/down is a Layer 2 problem such as a serial encapsulation mismatch, and err-disabled means a feature shut the port even though `shutdown` is not configured.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Users report slow transfers across the link between SW1 and SW2. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces fastethernet0/24 status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/24    Uplink-SW2         connected    trunk        full    100 10/100BaseTX

SW2# show interfaces fastethernet0/24 status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/24    Uplink-SW1         connected    trunk      a-half  a-100 10/100BaseTX`,
    },
    options: [
      'A speed mismatch between the switches prevents the link from working',
      'A duplex mismatch: SW1 is hard-coded to full and SW2 fell back to half',
      'SW2 is hard-coded to half duplex and SW1 autonegotiated to full',
      'The trunk on SW2 is err-disabled because of a security violation',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'SW1 shows **full / 100** with no a- prefix, so both values are hard-coded and autonegotiation is off. SW2 shows **a-half / a-100**: it autonegotiated, sensed 100 Mbps, and fell back to half duplex, producing a duplex mismatch. Both ends run 100 Mbps and the link is connected, so there is no speed mismatch and nothing is err-disabled. The a- prefix proves SW2 was not hard-coded to half duplex.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. SW2 Fa0/24 uses the default speed and duplex settings. What is the most likely cause of the errors on SW1?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config interface fastethernet0/24
Building configuration...

Current configuration : 104 bytes
!
interface FastEthernet0/24
 description Uplink-SW2
 switchport mode trunk
 speed 100
 duplex full
end

SW1# show interfaces fastethernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
...
     1382 runts, 0 giants, 0 throttles
     3201 input errors, 1807 CRC, 12 frame, 0 overrun, 0 ignored
...
     0 output errors, 0 collisions, 1 interface resets
     0 babbles, 0 late collision, 0 deferred`,
    },
    options: [
      'The cable between the switches exceeds the 100 m Ethernet distance limit',
      'SW1 is hard-coded, so SW2 fell back to half duplex: a duplex mismatch',
      'SW2 is sending jumbo frames larger than the MTU that SW1 accepts',
      'The two switches are hard-coded to different speeds on the trunk',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'SW1 has `speed 100` and `duplex full`, which disables autonegotiation. SW2, on auto, senses 100 Mbps and falls back to **half duplex**. SW2 then aborts frames when SW1 transmits, so SW1 receives fragments counted as **runts** and **CRC** errors, while its own collision counters stay at zero because it is full duplex. There are no giants, so jumbo frames are not the issue; the link is up, so the speeds match; and an overlong cable would not explain the tell-tale combination of a hard-coded port and runts.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The 20 m cable to the neighboring switch was recently certified. What is the most likely cause of the counters shown?',
    exhibit: {
      kind: 'cli',
      text: `SW2# show interfaces fastethernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Hardware is Fast Ethernet, address is 0022.90c4.1a18 (bia 0022.90c4.1a18)
  Half-duplex, 100Mb/s, media type is 10/100BaseTX
...
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
...
     912 output errors, 2877 collisions, 2 interface resets
     0 babbles, 912 late collision, 1735 deferred`,
    },
    options: [
      'The neighbor is hard-coded to full duplex and this port fell back to half',
      'The neighbor sends oversized frames larger than 1518 bytes into this port',
      'The two ports are hard-coded to different speeds, 10 Mbps and 100 Mbps',
      'Electromagnetic interference on the cable is corrupting received frames',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The port runs **half duplex** and records collisions and **late collisions**. With a short, certified cable, late collisions point to a duplex mismatch: the neighbor transmits in full duplex whenever it likes. Giants and EMI would show up as input errors (giants, CRC), which are all zero here, and a speed mismatch would keep the link down instead of up/up.',
  },
  {
    id: 'e5',
    type: 'multi',
    stem: 'Which two conditions cause a switch port to show down/down with the status notconnect? (Choose two.)',
    options: [
      'The cable is unplugged',
      'Both ends are hard-coded to different speeds',
      'The `shutdown` command is configured',
      'The two ends have mismatched duplex settings',
      'Port security shut the port after a violation',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'No cable and a **speed mismatch** both prevent a physical link, giving down/down notconnect. `shutdown` produces administratively down (disabled), a duplex mismatch leaves the link up/up, and a port-security shutdown shows err-disabled.',
  },
  {
    id: 'e6',
    type: 'match',
    stem: 'Match each interface counter to its meaning.',
    pairs: [
      { left: 'Runts', right: 'Frames shorter than 64 bytes' },
      { left: 'Giants', right: 'Frames longer than the maximum frame size' },
      { left: 'CRC', right: 'Frames whose FCS check failed' },
      { left: 'Late collisions', right: 'Collisions detected after the first 64 bytes were sent' },
      { left: 'Collisions', right: 'Transmissions retried after a collision' },
    ],
    difficulty: 1,
    explanation:
      'Runts are undersized frames, giants are oversized frames, CRC errors are frames that fail the FCS check, late collisions occur after the first 64 bytes, and the collisions counter tracks transmissions that had to be retried.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'A switch port is configured with `speed 100` and `duplex full`. The attached server NIC is set to autonegotiate. Which result is expected?',
    options: [
      'The NIC learns the port settings and runs at 100 Mbps full duplex',
      'The NIC runs at 100 Mbps half duplex, creating a duplex mismatch',
      'The link stays down because the switch port does not negotiate',
      'The NIC falls back to 10 Mbps half duplex after negotiation fails',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'With both values hard-coded, the switch port does not negotiate. The NIC senses 100 Mbps through parallel detection but must assume **half duplex** at 100 Mbps, so the link comes up mismatched. It cannot discover the switch\'s full-duplex setting, the speeds match so the link is not down, and there is no reason to drop to 10 Mbps.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Autonegotiation fails on a port, and the port detects a speed of 1000 Mbps. Following the IEEE fallback rules, which duplex does the port use?',
    options: ['Full duplex', 'Half duplex', 'The duplex configured on the neighbor', 'None: the link stays down'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The fallback rule is **half duplex at 10 or 100 Mbps** and **full duplex at 1000 Mbps** and above. A port cannot learn the neighbor\'s configured duplex without negotiation, and the rule gives a duplex rather than leaving the link down.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each counter by the side of a duplex mismatch on which it typically increases.',
    categories: ['Half-duplex side', 'Full-duplex side'],
    items: [
      { text: 'Late collisions', category: 0 },
      { text: 'Collisions', category: 0 },
      { text: 'Deferred frames', category: 0 },
      { text: 'CRC errors', category: 1 },
      { text: 'Runts', category: 1 },
      { text: 'Input errors', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'The half-duplex side senses the other end\'s traffic as collisions (many of them late) and defers transmissions. The full-duplex side receives the frames the half-duplex side cut short, counting runts and CRC errors, which roll up into input errors.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. A user plugged a small switch into Fa0/7, and it has now been removed. No errdisable recovery is configured. What must the administrator do to restore the port?',
    exhibit: {
      kind: 'cli',
      text: `Sep 26 11:02:41.517: %SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Fa0/7 with BPDU Guard enabled. Disabling port.
Sep 26 11:02:41.521: %PM-4-ERR_DISABLE: bpduguard error detected on Fa0/7, putting Fa0/7 in err-disable state
SW1# show interfaces status err-disabled

Port      Name               Status       Reason               Err-disabled Vlans
Fa0/7     Desk-7             err-disabled bpduguard`,
    },
    options: [
      'Enter `shutdown` and then `no shutdown` on Fa0/7',
      'Enter `no shutdown` on Fa0/7 to re-enable it',
      'Wait 300 seconds for the port to recover on its own',
      'Enter `clear counters fastethernet0/7` to reset it',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The cause (the rogue switch) is gone, so the port can be re-enabled with **shutdown followed by no shutdown**. `no shutdown` alone does nothing because the port was never administratively shut. Automatic recovery is disabled by default, so waiting 300 seconds does not help unless `errdisable recovery cause bpduguard` is configured. Clearing counters does not change the port state.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. Which interface is most likely affected by an unplugged or faulty cable?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  10.1.1.11       YES NVRAM  up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  down                  down
FastEthernet0/3        unassigned      YES unset  administratively down down`,
    },
    options: ['Vlan1', 'FastEthernet0/1', 'FastEthernet0/2', 'FastEthernet0/3'],
    answer: 2,
    difficulty: 2,
    explanation:
      '**Fa0/2** is down/down, meaning no physical link: a missing or faulty cable, a far-end device that is off, or a speed mismatch. Fa0/3 is administratively down because of `shutdown`, which is a configuration issue rather than a cabling one. Fa0/1 and the Vlan1 SVI are up/up.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. The storage server attached to Gi0/1 was reconfigured last night. Which change most likely explains the errors?',
    exhibit: {
      kind: 'cli',
      text: `SW3# show interfaces gigabitethernet0/1
GigabitEthernet0/1 is up, line protocol is up (connected)
  Hardware is Gigabit Ethernet, address is 0022.90c4.1b01 (bia 0022.90c4.1b01)
  Description: Storage-Server
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
...
     0 runts, 48211 giants, 0 throttles
     48211 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored`,
    },
    options: [
      'The server NIC was set to half duplex, causing collisions',
      'Jumbo frames (MTU 9000) were enabled on the server NIC',
      'The server was moved to a longer cable that exceeds 100 m',
      'The server NIC was hard-coded to 100 Mbps and full duplex',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'Every input error is a **giant**: frames larger than the port accepts with its 1500-byte MTU, which is what a server sending jumbo frames produces. A duplex problem or a long cable would show CRC errors, runts or collisions, which are all zero, and a 100 Mbps NIC could not keep the link at 1000Mb/s.',
  },
  {
    id: 'e13',
    type: 'order',
    stem: 'Put the events that produce errors during a duplex mismatch in order. SW2 runs half duplex and SW1 runs full duplex.',
    items: [
      'SW2 begins transmitting a frame and listens while it sends',
      'SW1 transmits a frame at the same time',
      'SW2 senses the incoming signal and counts a collision',
      'SW2 stops mid-frame and sends a jam signal',
      'SW1 receives the truncated frame and counts a runt or CRC error',
    ],
    difficulty: 2,
    explanation:
      'The half-duplex side starts sending, the full-duplex side transmits without waiting, the half-duplex side interprets the incoming signal as a collision (late if after 64 bytes), aborts with a jam signal, and the full-duplex side records the fragment as a runt or CRC error.',
  },
  {
    id: 'e14',
    type: 'input',
    stem: 'What is the maximum length, in meters, of a UTP copper segment for 100BASE-TX or 1000BASE-T?',
    answers: ['100', '100 m', '100m', '100 meters'],
    placeholder: 'meters',
    difficulty: 1,
    explanation:
      'Twisted-pair Ethernet segments are limited to **100 m**. Longer runs weaken the signal, causing CRC errors and dropped links, and in half duplex they can also cause late collisions.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. The speed/duplex setting of each port is shown at each end of the link. Which link will have a duplex mismatch?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'sw1', icon: 'switch', label: 'SW1', x: 1.5, y: 2.5 },
          { id: 'sw2', icon: 'switch', label: 'SW2', x: 7.5, y: 0.8 },
          { id: 'sw3', icon: 'switch', label: 'SW3', x: 7.5, y: 2.5 },
          { id: 'sw4', icon: 'switch', label: 'SW4', x: 7.5, y: 4.2 },
        ],
        links: [
          { from: 'sw1', to: 'sw2', fromLabel: 'Fa0/1 auto/auto', toLabel: 'auto/auto' },
          { from: 'sw1', to: 'sw3', fromLabel: 'Fa0/2 100/full', toLabel: 'auto/auto' },
          { from: 'sw1', to: 'sw4', fromLabel: 'Fa0/3 100/half', toLabel: 'auto/auto' },
        ],
      },
    },
    options: ['SW1 to SW2', 'SW1 to SW3', 'SW1 to SW4', 'None of the links'],
    answer: 1,
    difficulty: 3,
    explanation:
      'SW1 to SW3: SW1 is hard-coded 100/full, so SW3 senses 100 Mbps and falls back to **half**, a mismatch. SW1 to SW2 negotiates normally on both ends. SW1 to SW4 is hard-coded 100/half, and SW4 also falls back to half duplex, so both ends agree; the link runs half duplex with normal collisions but no mismatch.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two actions resolve a duplex mismatch between two switch ports? (Choose two.)',
    options: [
      'Configure `speed auto` and `duplex auto` on both ports',
      'Hard-code the same speed and duplex on both ports',
      'Replace the straight-through cable with a crossover cable',
      'Enable `errdisable recovery` for all causes',
      'Increase the MTU on both ports',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'A duplex mismatch is fixed by making both ends agree: **autonegotiation on both** or **identical hard-coded values on both**. The cable type does not affect duplex, errdisable recovery applies only to err-disabled ports, and the MTU affects giants, not duplex.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1     PC1                connected    10         a-full  a-100 10/100BaseTX
Fa0/2     PC2                notconnect   10           auto   auto 10/100BaseTX
Fa0/3                        disabled     1            auto   auto 10/100BaseTX
Fa0/24    Uplink-SW2         connected    trunk        full    100 10/100BaseTX
Gi0/2                        notconnect   1            auto   auto Not Present`,
    },
    options: [
      'Fa0/1 negotiated its speed and duplex with the attached device',
      'Fa0/24 has its speed and duplex configured manually',
      'Fa0/3 was disabled after a port-security violation',
      'Gi0/2 has an SFP transceiver installed but no cable',
      'Fa0/2 is administratively shut down and cannot pass traffic',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The **a-** prefix on Fa0/1 means both values were negotiated, and Fa0/24 shows full and 100 without a prefix, so they are hard-coded. Fa0/3 is disabled, which means `shutdown`; port security would show err-disabled. Gi0/2 shows Not Present, so no transceiver is installed. Fa0/2 is notconnect: enabled but without a link.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Refer to the exhibit. The PC NIC also autonegotiated 100/full. The cable runs through a workshop beside heavy motors, and the CRC count keeps rising. Which two are the most likely causes? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces fastethernet0/12
FastEthernet0/12 is up, line protocol is up (connected)
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
...
     0 runts, 0 giants, 0 throttles
     2764 input errors, 2764 CRC, 0 frame, 0 overrun, 0 ignored
...
     0 output errors, 0 collisions, 0 interface resets
     0 babbles, 0 late collision, 0 deferred
SW1# show interfaces fastethernet0/12 status

Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/12    Workshop-PC        connected    30         a-full  a-100 10/100BaseTX`,
    },
    options: [
      'Electromagnetic interference from the motors',
      'A damaged or poorly terminated cable',
      'A duplex mismatch between the two ends',
      'An MTU mismatch causing oversized frames',
      'A speed mismatch between the NIC and the port',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Pure CRC errors on a correctly negotiated full-duplex link mean the bits are being corrupted on the wire: **EMI** from the motors or a **damaged or badly terminated cable**. Both ends negotiated full duplex and there are no runts or collisions, ruling out a duplex mismatch; there are no giants, ruling out an MTU mismatch; and the link is up, ruling out a speed mismatch.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer patched a fiber cable into Gi0/2 for a redundant uplink, but the port stays down. What is the problem?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces status

Port      Name               Status       Vlan       Duplex  Speed Type
Gi0/1     Core-1             connected    trunk      a-full a-1000 1000BaseSX SFP
Gi0/2     Core-2             notconnect   1            auto   auto Not Present`,
    },
    options: [
      'No SFP transceiver is installed in Gi0/2',
      'Gi0/2 is administratively shut down',
      'Gi0/2 has a duplex mismatch with Core-2',
      'Gi0/2 is err-disabled',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The Type column shows **Not Present**: the SFP slot is empty, so the fiber has nothing to plug into. An administratively shut port would show disabled, an err-disabled port would show err-disabled, and a duplex mismatch requires a working link.',
  },
  {
    id: 'e20',
    type: 'match',
    stem: 'Match each interface symptom to its most likely cause.',
    pairs: [
      { left: 'administratively down / down', right: '`shutdown` is configured on the interface' },
      { left: 'down / down (notconnect)', right: 'Cable unplugged or both ends set to different speeds' },
      { left: 'down / down (err-disabled)', right: 'A feature such as port security or BPDU guard shut the port' },
      { left: 'up / down on a serial link', right: 'Encapsulation mismatch between the two routers' },
      { left: 'up / up with rising late collisions', right: 'Duplex mismatch' },
    ],
    difficulty: 2,
    explanation:
      'Administratively down is always `shutdown`; notconnect is a Layer 1 failure such as a missing cable or a speed mismatch; err-disabled is a protective feature; up/down on serial links is typically an HDLC/PPP encapsulation mismatch; and late collisions on an up/up link point to a duplex mismatch.',
  },
  {
    id: 'e21',
    type: 'input',
    stem: 'Which command lists every err-disabled port on a Catalyst switch together with the reason it was disabled?',
    answers: [
      'show interfaces status err-disabled',
      'show interface status err-disabled',
      'show int status err-disabled',
      'sh int status err-disabled',
      'sh interfaces status err-disabled',
    ],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`show interfaces status err-disabled` shows each err-disabled port and its reason, such as psecure-violation or bpduguard. `show interfaces status` alone shows the state but not the reason.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'Two switches are connected with a straight-through cable on ports that have Auto-MDIX disabled. What is the result?',
    options: [
      'The link stays down because both ports transmit on the same pairs',
      'The link comes up at the lowest speed, 10 Mbps half duplex',
      'The link comes up but records CRC errors on both ports',
      'Both ports become err-disabled because of the cable mismatch',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Switch ports transmit on the same pairs, so a straight-through cable connects transmitter to transmitter and **no link forms** (notconnect). Switch-to-switch links need a crossover cable unless Auto-MDIX swaps the pairs. The link does not fall back to a lower speed or produce CRC errors, because there is no link at all, and no err-disable feature is triggered.',
  },
];
