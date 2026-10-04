import type { Question } from '../../types';

const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'In QoS terminology, which term describes the variation in one-way delay between consecutive packets of the same voice stream?',
    options: ['Latency', 'Jitter', 'Throughput', 'Serialization delay'],
    answer: 1,
    difficulty: 1,
    explanation:
      "**Jitter** is the variation in delay from one packet to the next. Latency is the delay itself, throughput is the achieved data rate, and serialization delay is the time needed to clock one packet onto the wire, which is constant for a given packet size and link speed.",
  },
  {
    id: 'e2',
    type: 'input',
    stem: 'According to the commonly cited Cisco guidelines, what is the maximum acceptable one-way delay, in milliseconds, for a voice call? (Enter the number only.)',
    answers: ['150', '150 ms', '150ms'],
    placeholder: 'milliseconds',
    difficulty: 1,
    explanation:
      "Voice needs **one-way delay ≤ 150 ms**, jitter ≤ 30 ms and loss ≤ 1%. Interactive video tolerates somewhat more delay (roughly 200–400 ms), which is why voice is the strictest traffic class.",
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which mechanism is designed to prevent TCP global synchronization by randomly discarding some packets before a queue becomes full?',
    options: ['Tail drop', 'WRED', 'LLQ', 'Policing'],
    answer: 1,
    difficulty: 1,
    explanation:
      "**WRED** (and RED) drops a few packets early, so only some TCP flows slow down at a time. Tail drop is the cause of global synchronization, LLQ is a queue-scheduling tool, and policing enforces a rate limit rather than smoothing TCP behavior.",
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. What is the effect of the `bandwidth percent 30` command on the VIDEO class?',
    exhibit: {
      kind: 'cli',
      text: `class-map match-any VOICE
 match dscp ef
class-map match-any VIDEO
 match dscp af41
!
policy-map WAN-EDGE
 class VOICE
  priority percent 20
 class VIDEO
  bandwidth percent 30
 class class-default
  fair-queue
!
interface GigabitEthernet0/0/0
 ip address 203.0.113.2 255.255.255.252
 service-policy output WAN-EDGE`,
    },
    options: [
      'VIDEO is placed in a strict-priority queue and policed to 30 percent of the interface bandwidth',
      'VIDEO is guaranteed at least 30 percent of the interface bandwidth during congestion',
      'VIDEO is limited to a maximum of 30 percent of the interface bandwidth at all times',
      'VIDEO traffic is shaped to 30 percent of the interface bandwidth',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      "`bandwidth` creates a **CBWFQ** class with a **minimum** guarantee: during congestion VIDEO gets at least 30%, and it can use more when other classes are idle. The strict-priority, policed behavior comes from the `priority` command, which this policy applies only to VOICE. The guarantee is not a ceiling, and shaping would need the `shape` command.",
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. Users can mark packets from their PCs as DSCP EF. Where should the trust boundary be placed so that PC markings are not honored but phone voice markings are?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'pc', icon: 'pc', label: 'PC1', sub: 'can self-mark', x: 1, y: 1.5, tone: 'muted' },
          { id: 'ph', icon: 'phone', label: 'IP phone', sub: 'marks EF / CoS 5', x: 3.4, y: 1.5 },
          { id: 'sw', icon: 'switch', label: 'SW1', sub: 'access', x: 5.8, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'WAN edge', x: 8.4, y: 1.5 },
        ],
        links: [
          { from: 'pc', to: 'ph', label: 'PC port' },
          { from: 'ph', to: 'sw', toLabel: 'Gi1/0/1' },
          { from: 'sw', to: 'r1', toLabel: 'Gi0/0/1' },
        ],
      },
    },
    options: [
      'On R1 Gi0/0/1, trusting the markings on the traffic that SW1 forwards',
      'On the SW1 access port, trusting only the attached Cisco IP phone',
      'On the PC, where each user marks the DSCP of their own applications',
      'On the WAN interface of R1, after traffic has crossed the network',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      "Place the boundary **as close to the source as possible**: the access port trusts the IP phone (an extended trust boundary) while treating the PC behind it as untrusted. Trusting only at R1 means users can claim priority on every link before it, and trusting PC markings invites abuse.",
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two statements about Low Latency Queuing (LLQ) are true? (Choose two.)',
    options: [
      'It adds a strict-priority queue to CBWFQ',
      'The priority queue is policed to its configured rate during congestion',
      'It is configured with the `bandwidth` command',
      'WRED should be enabled on the priority queue to avoid tail drop',
      'It is applied to inbound traffic only',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "LLQ is **CBWFQ plus a strict-priority queue**, and that queue is **policed** during congestion so it cannot starve other classes. It is built with `priority`, not `bandwidth` (which creates ordinary CBWFQ classes). WRED does not belong on voice, which cannot recover from loss, and queuing policies are applied outbound.",
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Congestion builds in the AF3 queue of an interface with DSCP-based WRED enabled. Which packets does WRED discard first?',
    options: ['AF31', 'AF32', 'AF33', 'EF'],
    answer: 2,
    difficulty: 2,
    explanation:
      "Within an AF class, a **higher drop precedence** (the second digit) is dropped first, so **AF33** hits its lower WRED threshold before AF32 and AF31. EF is not in the AF3 queue at all; it normally uses the priority queue.",
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the steps for building an MQC QoS policy in the correct order.',
    items: [
      'Create class-maps that match the traffic (ACL, NBAR or DSCP)',
      'Create a policy-map and assign an action to each class',
      'Attach the policy-map to an interface with service-policy',
      'Verify the result with show policy-map interface',
    ],
    difficulty: 2,
    explanation:
      "MQC is built bottom-up: `class-map` defines what to match, `policy-map` defines what to do with each class, `service-policy` attaches the policy to an interface and direction, and `show policy-map interface` confirms packet and drop counters per class.",
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each DiffServ marking to its decimal DSCP value.',
    pairs: [
      { left: 'EF', right: '46' },
      { left: 'AF41', right: '34' },
      { left: 'AF21', right: '18' },
      { left: 'CS3', right: '24' },
      { left: 'CS6', right: '48' },
    ],
    difficulty: 2,
    explanation:
      "EF is fixed at 46. AFxy = 8x + 2y gives AF41 = 32 + 2 = 34 and AF21 = 16 + 2 = 18. Class selectors are CSn = 8n, so CS3 = 24 and CS6 = 48.",
  },
  {
    id: 'e10',
    type: 'categorize',
    stem: 'Classify each characteristic as belonging to policing or to shaping.',
    categories: ['Policing', 'Shaping'],
    items: [
      { text: 'Excess traffic is dropped or re-marked', category: 0 },
      { text: 'Excess traffic is queued and sent later', category: 1 },
      { text: 'Adds no buffering delay', category: 0 },
      { text: 'Can be applied to inbound or outbound traffic', category: 0 },
      { text: 'Applied to outbound traffic only', category: 1 },
      { text: 'Smooths bursts into a steady output rate', category: 1 },
    ],
    difficulty: 2,
    explanation:
      "A **policer** never buffers: it drops or re-marks excess immediately, so it adds no delay and can run in either direction. A **shaper** buffers excess and releases it at the configured rate, which smooths bursts but adds delay and works outbound only.",
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements describe the DiffServ QoS model? (Choose two.)',
    options: [
      'Routers apply a per-hop behavior based on each packet’s marking',
      'Routers do not need to keep state for individual flows',
      'Applications reserve bandwidth end to end using RSVP signaling',
      'Every router must track the state of each individual flow',
      'It gives no differentiation between voice and data traffic',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "DiffServ is **class-based**: mark at the edge, apply a PHB at every hop, no per-flow state, so it scales. RSVP reservations and per-flow state describe IntServ, and having no differentiation describes best effort.",
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Why is DSCP preferred over CoS for carrying a QoS marking across a routed WAN?',
    options: [
      'CoS is lost when a router builds a new Layer 2 header; DSCP stays in the IP header',
      'CoS can only mark voice traffic, while DSCP can mark voice, video and data',
      'DSCP is encrypted in transit, so a provider cannot alter it along the path',
      'CoS values are limited to 0 through 3, while DSCP values range from 0 up to 63',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      "CoS exists only in the **802.1Q tag**, and a router replaces the Layer 2 header at every hop, so the marking is lost; DSCP is part of the IP header and travels end to end. CoS can mark any traffic and has eight values (0–7), and DSCP is not encrypted, so a provider can still re-mark it.",
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'What is the default queuing behavior of a GigabitEthernet router interface on which no service policy is applied?',
    options: [
      'FIFO with tail drop',
      'LLQ with a policed priority queue',
      'CBWFQ with equal class weights',
      'WRED with default thresholds',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      "With no policy, every packet shares a single **FIFO** queue and new packets are discarded (**tail drop**) when it is full. LLQ and CBWFQ only exist when an MQC policy defines classes, and WRED must be enabled explicitly.",
  },
  {
    id: 'e14',
    type: 'multi',
    stem: 'Which two methods can a router use to classify traffic into QoS classes? (Choose two.)',
    options: [
      'An access control list (ACL)',
      'NBAR application recognition',
      'WRED minimum drop thresholds',
      'Tail drop when a queue fills',
      'A token bucket rate meter',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      "Classification uses **ACLs** (addresses, protocols, ports) and **NBAR** (application signatures), or existing CoS/DSCP markings. WRED and tail drop are drop behaviors, and a token bucket measures a rate for policing and shaping.",
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. A guest sends 8 Mbps of traffic that matches class GUEST into GigabitEthernet0/0/2. What happens to the traffic?',
    exhibit: {
      kind: 'cli',
      text: `class-map match-any GUEST
 match access-group name GUEST-NET
!
policy-map LIMIT-GUEST
 class GUEST
  police cir 5000000 conform-action transmit exceed-action drop
!
interface GigabitEthernet0/0/2
 description Guest VLAN gateway
 ip address 192.168.50.1 255.255.255.0
 service-policy input LIMIT-GUEST`,
    },
    options: [
      'The 8 Mbps is queued in a buffer and sent later at the 5 Mbps rate',
      'About 5 Mbps is forwarded and the excess is dropped without buffering',
      'The excess 3 Mbps is re-marked to DSCP 0 and forwarded as best effort',
      'All guest traffic is dropped until the rate falls below 5 Mbps',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "`police cir 5000000` sets a 5 Mbps rate (the value is in bits per second). Conforming traffic is transmitted and the excess is dropped on the spot with `exceed-action drop`, so nothing is buffered and no delay is added. Queuing the excess is shaping, re-marking would need `set-dscp-transmit`, and a policer does not shut off conforming traffic.",
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. The provider polices the customer at 100 Mbps on its ingress. Voice calls suffer random drops during large file transfers even though R1 has an LLQ policy on Gi0/0/0. What should the engineer configure on R1?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 1, y: 1.5 },
          { id: 'r1', icon: 'router', label: 'R1', sub: 'customer edge', x: 3.6, y: 1.5, tone: 'accent' },
          { id: 'pe', icon: 'router', label: 'PE1', sub: 'polices at 100 Mbps', x: 6.8, y: 1.5 },
          { id: 'wan', icon: 'cloud', label: 'Provider', x: 9, y: 1.5 },
        ],
        links: [
          { from: 'sw', to: 'r1', toLabel: 'Gi0/0/1' },
          { from: 'r1', to: 'pe', label: '1 Gbps port · 100 Mbps CIR', fromLabel: 'Gi0/0/0' },
          { from: 'pe', to: 'wan' },
        ],
      },
    },
    options: [
      'An outbound policy that shapes to 100 Mbps with the LLQ policy nested as a child',
      'An outbound policer on Gi0/0/0 that drops traffic above the 1 Gbps port speed',
      'WRED on the voice class so that voice packets are dropped less often than data',
      'An inbound policy on Gi0/0/1 that re-marks every packet from SW1 to DSCP EF',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "The port runs at 1 Gbps, so R1 never sees congestion and its LLQ never engages; the provider's policer then drops randomly above 100 Mbps. **Shaping to the CIR** moves the queue onto R1, where the nested LLQ/CBWFQ policy can protect voice. Policing at 1 Gbps changes nothing, WRED is wrong for voice, and marking everything EF defeats prioritization.",
  },
  {
    id: 'e17',
    type: 'input',
    stem: 'Refer to the exhibit. A capture shows the first four bytes of an IPv4 header. What is the DSCP value of this packet, in decimal?',
    exhibit: {
      kind: 'cli',
      text: `IPv4 header, first four bytes (hex)
45 88 00 7C

Byte 1: Version/IHL   Byte 2: Type of Service   Bytes 3-4: Total Length`,
    },
    answers: ['34'],
    placeholder: 'decimal',
    difficulty: 3,
    explanation:
      "The ToS byte is **0x88 = 1000 1000**. DSCP is the first six bits, 100010 = **34** (AF41); the last two bits, 00, are ECN. Reading the whole byte gives 136, and the first three bits alone (100 = 4) give IP Precedence, not DSCP.",
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. The table lists the one-way delay of five consecutive packets in a voice stream, and all five packets arrived. Which voice target is violated?',
    exhibit: {
      kind: 'table',
      columns: ['Voice packet', 'One-way delay (ms)'],
      rows: [
        ['1', '40'],
        ['2', '85'],
        ['3', '38'],
        ['4', '90'],
        ['5', '42'],
      ],
    },
    options: [
      'Delay, because some voice packets took as long as 90 ms to arrive',
      'Jitter, because delay varies by about 45 to 52 ms between packets',
      'Loss, because the delay values are inconsistent between packets',
      'None; the stream meets the voice delay, jitter and loss targets',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      "Consecutive differences are 45, 47, 52 and 48 ms, far above the **30 ms** jitter target. The largest delay, 90 ms, is under the 150 ms limit, and all five packets arrived, so there is no loss. Uneven delay is jitter, not loss.",
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Voice calls are choppy whenever the WAN link is congested, although the VOICE class is guaranteed 20 percent. What change fixes the problem?',
    exhibit: {
      kind: 'cli',
      text: `policy-map WAN-EDGE
 class VOICE
  bandwidth percent 20
 class VIDEO
  bandwidth percent 30
 class class-default
  fair-queue
!
interface GigabitEthernet0/0/0
 service-policy output WAN-EDGE`,
    },
    options: [
      'Replace `bandwidth percent 20` with `priority percent 20`',
      'Add `random-detect dscp-based` to the VOICE class as well',
      'Apply the WAN-EDGE policy with `service-policy input` instead',
      'Increase the VOICE class guarantee to `bandwidth percent 50`',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      "`bandwidth` only gives VOICE a **minimum share**; its packets still wait for the scheduler to reach their queue, which creates jitter. `priority` places voice in the **strict-priority LLQ**, served first and policed. WRED would add loss to voice, queuing policies work outbound only, and a bigger guarantee does not remove the waiting.",
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements about this policy are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `policy-map EDGE
 class VOICE
  priority percent 15
 class CRITICAL-DATA
  bandwidth percent 40
  random-detect dscp-based
 class class-default
  fair-queue`,
    },
    options: [
      'VOICE is served first and limited to 15 percent during congestion',
      'In CRITICAL-DATA, AF23 is dropped before AF21 as the queue builds',
      'WRED is applied to the VOICE class to protect it from tail drop',
      'class-default is guaranteed a minimum of 40 percent of the bandwidth',
      'CRITICAL-DATA traffic is shaped to 40 percent of the link bandwidth',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      "`priority percent 15` builds the **LLQ**, served first and policed to 15% under congestion. `random-detect dscp-based` gives CRITICAL-DATA **WRED** with lower thresholds for higher drop precedence, so AF23 is discarded before AF21. WRED is not configured on VOICE, the 40% guarantee belongs to CRITICAL-DATA, and `bandwidth` is a minimum guarantee, not a shaper.",
  },
];

export default exam;
