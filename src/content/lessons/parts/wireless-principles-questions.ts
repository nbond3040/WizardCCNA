import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Frequency', back: 'Number of wave cycles per second, measured in hertz. 2.4 GHz = 2.4 billion cycles per second.' },
  { id: 'f2', front: 'Frequency vs wavelength', back: 'Inversely related: higher frequency = shorter wavelength (about 12.5 cm at 2.4 GHz, about 6 cm at 5 GHz).' },
  { id: 'f3', front: 'Amplitude', back: 'The strength (height) of an RF wave. It decreases with distance and obstacles.' },
  { id: 'f4', front: '0 dBm equals…', back: '**1 mW**. dBm is absolute power referenced to one milliwatt.' },
  { id: 'f5', front: 'Rule of 3s and 10s', back: '+3 dB ≈ double the power, −3 dB ≈ half; +10 dB = ×10, −10 dB = ÷10.' },
  { id: 'f6', front: '20 dBm in milliwatts', back: '**100 mW** (0 dBm = 1 mW → 10 dBm = 10 mW → 20 dBm = 100 mW).' },
  { id: 'f7', front: 'RSSI', back: 'Received Signal Strength Indicator: received signal level, shown in negative dBm (e.g. −65 dBm). Closer to 0 is stronger.' },
  { id: 'f8', front: 'SNR', back: 'Signal-to-noise ratio: signal minus noise floor, in dB. −65 dBm over a −95 dBm floor = 30 dB. Higher is better.' },
  { id: 'f9', front: 'EIRP', back: 'Effective isotropic radiated power = transmit power − cable loss + antenna gain (dBi).' },
  { id: 'f10', front: 'Absorption', back: 'A material soaks up RF energy (water, people, concrete), weakening the signal.' },
  { id: 'f11', front: 'Reflection vs refraction', back: '**Reflection**: the signal bounces off a smooth surface (metal, glass). **Refraction**: the signal bends while passing into a medium of different density.' },
  { id: 'f12', front: 'Scattering vs diffraction', back: '**Scattering**: reflection in many directions off rough surfaces or particles. **Diffraction**: bending around an obstacle, leaving an RF shadow.' },
  { id: 'f13', front: '802.11a / b / g bands and max rates', back: 'a: 5 GHz, 54 Mbps · b: 2.4 GHz, 11 Mbps · g: 2.4 GHz, 54 Mbps.' },
  { id: 'f14', front: '802.11n', back: '**Wi-Fi 4**: 2.4 and 5 GHz, up to 600 Mbps, MIMO, 40 MHz channels.' },
  { id: 'f15', front: '802.11ac', back: '**Wi-Fi 5**: **5 GHz only**, up to 6.93 Gbps, downlink MU-MIMO, 80/160 MHz channels.' },
  { id: 'f16', front: '802.11ax', back: '**Wi-Fi 6** (2.4 + 5 GHz) and **Wi-Fi 6E** (adds 6 GHz): up to 9.6 Gbps, OFDMA, BSS coloring, TWT.' },
  { id: 'f17', front: '802.11be', back: '**Wi-Fi 7**: 2.4, 5 and 6 GHz; 320 MHz channels (6 GHz), 4096-QAM, multi-link operation; about 46 Gbps theoretical.' },
  { id: 'f18', front: 'Non-overlapping 2.4 GHz channels', back: '**1, 6 and 11.** Channel centers are 5 MHz apart and each channel is 20–22 MHz wide.' },
  { id: 'f19', front: 'Channel bonding', back: 'Combining adjacent 20 MHz channels into 40, 80, 160 (or 320) MHz channels: faster links, but fewer non-overlapping channels.' },
  { id: 'f20', front: 'DFS', back: 'Dynamic Frequency Selection: on some 5 GHz channels an AP must detect radar and move to another channel.' },
  { id: 'f21', front: 'Security required on 6 GHz', back: '**WPA3** (SAE or Enterprise) or **Enhanced Open (OWE)**. WPA2, WPA and WEP are not allowed.' },
  { id: 'f22', front: 'Co-channel vs adjacent-channel interference', back: '**CCI**: cells on the same channel share airtime (they defer). **ACI**: overlapping channels corrupt each other\'s frames.' },
  { id: 'f23', front: 'IBSS', back: 'Independent BSS (ad hoc): wireless clients communicate directly with no AP.' },
  { id: 'f24', front: 'BSS and BSSID', back: 'A BSS is one AP and its associated clients. The BSSID is the MAC address (from the AP radio) that identifies it.' },
  { id: 'f25', front: 'SSID', back: 'Service Set Identifier: the WLAN name, up to 32 characters. One AP can advertise several SSIDs, each with its own BSSID.' },
  { id: 'f26', front: 'ESS', back: 'Extended Service Set: multiple BSSs with the same SSID joined by a wired distribution system, allowing roaming.' },
  { id: 'f27', front: 'MBSS (mesh)', back: 'Mesh BSS: a wired root AP (RAP) plus mesh APs (MAPs) that connect over a wireless backhaul.' },
  { id: 'f28', front: 'Workgroup bridge (WGB)', back: 'An AP acting as a wireless client for wired devices. uWGB: one wired device, any vendor AP; Cisco WGB: several wired devices.' },
  { id: 'f29', front: 'CSMA/CA', back: 'Carrier Sense Multiple Access with Collision Avoidance: sense the medium, random backoff, transmit, expect an ACK for unicast frames.' },
  { id: 'f30', front: 'Three 802.11 frame types', back: '**Management** (beacon, probe, auth, association), **control** (ACK, RTS, CTS), **data**.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which set of 2.4 GHz channels does not overlap?',
    options: ['1, 6 and 11', '1, 4 and 8', '3, 6 and 9', '1, 6 and 9'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Channel centers are 5 MHz apart and each channel is 20–22 MHz wide, so channels must be five numbers apart to stay clear: **1, 6 and 11**. Channels 4 and 8, 3 and 6, or 6 and 9 are closer than that and overlap.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'What uniquely identifies a basic service set (BSS)?',
    options: ['The BSSID, a MAC address from the AP radio', 'The SSID, the network name users select', 'The management IP address of the AP', 'The channel number the AP radio uses'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A BSS is identified by its **BSSID**, a MAC address derived from the AP radio. The SSID is only the network name and can be shared by many BSSs in an ESS, the AP IP address is a wired-side identity, and many APs can use the same channel.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'A client measures a signal of −60 dBm and a noise floor of −92 dBm. What is the SNR in dB?',
    answers: ['32', '32 dB', '32db'],
    placeholder: 'dB',
    difficulty: 2,
    explanation: 'SNR = signal − noise = −60 − (−92) = **32 dB**. Subtracting a negative number adds its magnitude.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two standards can operate in the 2.4 GHz band? (Choose two.)',
    options: ['802.11a', '802.11g', '802.11ac', '802.11n'],
    answers: [1, 3],
    difficulty: 1,
    explanation:
      '**802.11g** is 2.4 GHz only and **802.11n** supports both 2.4 and 5 GHz. 802.11a and 802.11ac are 5 GHz only.',
  },
  {
    id: 'q5',
    type: 'order',
    stem: 'Put the frames a client exchanges with an AP when it joins a WLAN using active scanning in order.',
    items: ['Probe request', 'Probe response', 'Authentication request and response', 'Association request', 'Association response'],
    difficulty: 2,
    explanation:
      'The client discovers the AP (probe request/response), completes 802.11 authentication (open system, or SAE with WPA3-Personal), and then associates. Only after association do 802.1X and the 4-way handshake run.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each service set to its description.',
    pairs: [
      { left: 'IBSS', right: 'Clients connect directly with no AP' },
      { left: 'BSS', right: 'One AP and its associated clients' },
      { left: 'ESS', right: 'Several APs share one SSID over a distribution system' },
      { left: 'MBSS', right: 'APs linked by a wireless mesh backhaul' },
    ],
    difficulty: 1,
    explanation:
      'IBSS = ad hoc with no AP; BSS = a single AP cell; ESS = multiple BSSs with the same SSID joined by the wired DS for roaming; MBSS = mesh, with a wired root AP and wireless mesh APs.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which media access method do 802.11 stations use?',
    options: ['CSMA/CA', 'CSMA/CD', 'Token passing', 'Full-duplex switching'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Wireless stations cannot detect collisions while transmitting, so 802.11 uses **CSMA/CA**: sense the medium, back off randomly, transmit and wait for an ACK. CSMA/CD belongs to half-duplex Ethernet, and Wi-Fi is never full duplex.',
  },
];

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which IEEE 802.11 amendment does the Wi-Fi Alliance market as Wi-Fi 6?',
    options: ['802.11ac', '802.11ax', '802.11n', '802.11be'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**802.11ax** is Wi-Fi 6, and Wi-Fi 6E when it operates in 6 GHz. 802.11n is Wi-Fi 4, 802.11ac is Wi-Fi 5 and 802.11be is Wi-Fi 7; the generation numbers are easy to shift by one under exam pressure.',
  },
  {
    id: 'e2',
    type: 'single',
    stem:
      'Refer to the exhibit. Since AP3 was installed between two existing cells, users of all three APs report slow throughput and many retransmissions. All APs use 20 MHz channels in the 2.4 GHz band. Which action resolves the problem?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.6,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5.0, y: 0.9 },
          { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'channel 1', x: 1.6, y: 2.4 },
          { id: 'ap3', icon: 'ap', label: 'AP3', sub: 'channel 3', x: 5.0, y: 3.4, tone: 'warn' },
          { id: 'ap2', icon: 'ap', label: 'AP2', sub: 'channel 6', x: 8.4, y: 2.4 },
        ],
        links: [
          { from: 'sw', to: 'ap1' },
          { from: 'sw', to: 'ap3' },
          { from: 'sw', to: 'ap2' },
        ],
      },
    },
    options: [
      'Change AP3 to channel 11',
      'Change AP3 to channel 4 so that it is farther from channel 1',
      'Enable 40 MHz channel bonding on AP3',
      'Increase the transmit power of AP1 and AP2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Channel 3 overlaps both channel 1 and channel 6, so AP3 causes **adjacent-channel interference** in both neighboring cells: energy the other radios can neither decode nor defer to, which shows up as corrupted frames and retries. Moving AP3 to **channel 11** completes a clean 1/6/11 plan. Channel 4 still overlaps channels 1 and 6, a 40 MHz channel in 2.4 GHz would overlap even more spectrum, and raising AP1/AP2 power does not remove the overlapping energy.',
  },
  {
    id: 'e3',
    type: 'multi',
    stem: 'Which two statements describe the 5 GHz band compared with the 2.4 GHz band? (Choose two.)',
    options: [
      'It provides more non-overlapping channels',
      'At the same transmit power, cells are typically smaller',
      'It is used by 802.11b and 802.11g clients',
      'It is immune to non-802.11 interference',
      'It offers only three non-overlapping 20 MHz channels',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The 5 GHz band has **many more non-overlapping channels**, and its higher frequency is attenuated more by distance and walls, so **cells are smaller**. 802.11b and g are 2.4 GHz only; 5 GHz is not immune to interference (radar is the reason for DFS channels); and three non-overlapping channels describes 2.4 GHz.',
  },
  {
    id: 'e4',
    type: 'input',
    stem: 'An AP radio transmits at 20 dBm. What is that power in milliwatts? (Enter a number.)',
    answers: ['100', '100 mW', '100mw', '100 milliwatts'],
    placeholder: 'mW',
    difficulty: 2,
    explanation:
      '0 dBm = 1 mW, and every +10 dB multiplies by ten: 10 dBm = 10 mW, 20 dBm = **100 mW**. 20 mW would be about 13 dBm and 200 mW about 23 dBm.',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'An AP transmits at 10 mW. An engineer raises the output power by 6 dB. What is the new output power in milliwatts? (Enter a number.)',
    answers: ['40', '40 mW', '40mw', '40 milliwatts'],
    placeholder: 'mW',
    difficulty: 3,
    explanation:
      '+3 dB doubles the power, so +6 dB is two doublings: 10 mW → 20 mW → **40 mW**. Adding 6 mW (16 mW) or multiplying by six (60 mW) are the common mistakes; decibels express ratios, not linear amounts.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit, which shows a wireless survey taken at one spot in an office. Which statement is correct?',
    exhibit: {
      kind: 'table',
      columns: ['SSID', 'BSSID', 'Channel', 'RSSI'],
      rows: [
        ['Corp', '0c85.25a1.b310', '1', '−58 dBm'],
        ['Guest', '0c85.25a1.b311', '1', '−58 dBm'],
        ['Corp', '0c85.25c4.7720', '6', '−71 dBm'],
        ['Corp', '0c85.25d9.1e40', '11', '−83 dBm'],
      ],
    },
    options: [
      'The Corp SSID is an ESS made up of three BSSs',
      'Corp and Guest on channel 1 must come from two different APs because their BSSIDs differ',
      'A client will prefer BSSID 0c85.25d9.1e40 because channel 11 is the highest channel',
      'All four entries are one BSS because the BSSIDs share the same OUI',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Three different BSSIDs advertise the same SSID Corp on channels 1, 6 and 11: three BSSs forming one **ESS**. The Corp and Guest entries on channel 1 have consecutive BSSIDs and identical signal levels, which is one AP radio offering two SSIDs, each with its own BSSID, so the two-AP conclusion is wrong. Clients prefer the strongest signal (−58 dBm), not the highest channel number, and a shared OUI only indicates the same manufacturer.',
  },
  {
    id: 'e7',
    type: 'single',
    stem:
      'Users near a break room lose Wi-Fi connectivity whenever the microwave oven runs, but only while they are connected to the 2.4 GHz band. What is the best way to reduce the impact?',
    options: [
      'Move the affected clients to the 5 GHz band',
      'Enable 40 MHz channel bonding on the 2.4 GHz radio',
      'Change the WLAN security from WPA2 to WPA3',
      'Increase the AP beacon interval',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Microwave ovens radiate energy around 2.45 GHz: **non-Wi-Fi interference** that 802.11 radios cannot decode or negotiate with. Moving clients to **5 GHz** takes them out of that spectrum. A 40 MHz channel collects even more of the noise, the security protocol has no effect on RF interference, and the beacon interval only changes how often the AP advertises the SSID.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'What is a BSSID?',
    options: [
      'The MAC address that identifies a basic service set, derived from the AP radio',
      'The name of the wireless network that users select',
      'The IP address of the AP management interface',
      'The number that identifies a WLAN inside the controller configuration',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The **BSSID** is a MAC address, taken from the AP radio, that identifies one BSS. The network name is the SSID, the AP IP address is used on the wired side, and a number inside the controller is the WLAN ID.',
  },
  {
    id: 'e9',
    type: 'categorize',
    stem: 'Classify each 802.11 frame by frame type.',
    categories: ['Management', 'Control', 'Data'],
    items: [
      { text: 'Beacon', category: 0 },
      { text: 'Probe response', category: 0 },
      { text: 'Association request', category: 0 },
      { text: 'Deauthentication', category: 0 },
      { text: 'ACK', category: 1 },
      { text: 'RTS', category: 1 },
      { text: 'CTS', category: 1 },
      { text: 'QoS frame carrying a VoIP packet', category: 2 },
    ],
    difficulty: 2,
    explanation:
      '**Management** frames create and end relationships: beacons, probes, authentication, association and deauthentication. **Control** frames help deliver other frames: ACK, RTS and CTS. **Data** frames, including QoS data frames, carry the user payload such as a VoIP packet.',
  },
  {
    id: 'e10',
    type: 'match',
    stem: 'Match each 802.11 standard to its description.',
    pairs: [
      { left: '802.11b', right: '2.4 GHz only, up to 11 Mbps' },
      { left: '802.11a', right: '5 GHz only, up to 54 Mbps' },
      { left: '802.11g', right: '2.4 GHz only, up to 54 Mbps' },
      { left: '802.11ac', right: '5 GHz only, multi-gigabit, Wi-Fi 5' },
      { left: '802.11ax', right: '2.4 and 5 GHz (6 GHz as 6E), OFDMA, Wi-Fi 6' },
    ],
    difficulty: 2,
    explanation:
      '802.11b (11 Mbps) and 802.11g (54 Mbps) are 2.4 GHz; 802.11a (54 Mbps) and 802.11ac (Wi-Fi 5) are 5 GHz only; 802.11ax (Wi-Fi 6) is dual-band and extends into 6 GHz as Wi-Fi 6E.',
  },
  {
    id: 'e11',
    type: 'order',
    stem: 'A laptop joins a WPA2-Enterprise WLAN using active scanning. Put the events in order.',
    items: [
      'The client sends a probe request',
      'The AP sends a probe response',
      'Open system authentication request and response',
      'Association request and response',
      '802.1X/EAP authentication with the RADIUS server',
      'The 4-way handshake derives the encryption keys',
    ],
    difficulty: 2,
    explanation:
      'Discovery (probe request/response) comes first, then the 802.11 open system authentication formality, then association. With WPA2-Enterprise the real authentication (802.1X/EAP with RADIUS) happens after association, and the 4-way handshake finally derives the encryption keys before any data flows.',
  },
  {
    id: 'e12',
    type: 'single',
    stem:
      'Refer to the exhibit. A barcode printer with only an Ethernet port is mounted on a forklift that moves around a warehouse covered by the corporate WLAN. The printer plugs into AP-F on the forklift. In which role must AP-F operate?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 1.0, y: 1.6 },
          { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'ceiling AP, SSID Corp', x: 3.8, y: 1.6 },
          { id: 'apf', icon: 'ap', label: 'AP-F', sub: 'on the forklift', x: 6.5, y: 1.6, tone: 'accent' },
          { id: 'pr', icon: 'printer', label: 'Printer', sub: 'Ethernet only', x: 9.0, y: 1.6 },
        ],
        links: [
          { from: 'sw', to: 'ap1' },
          { from: 'ap1', to: 'apf', style: 'wireless' },
          { from: 'apf', to: 'pr', label: 'Ethernet' },
        ],
      },
    },
    options: ['Workgroup bridge', 'Repeater', 'Root AP in a mesh', 'Point-to-point outdoor bridge'],
    answer: 0,
    difficulty: 3,
    explanation:
      'AP-F must associate to the WLAN like a client and bridge the wired printer behind it: that is a **workgroup bridge** (a universal WGB can do this for a single wired device with any vendor\'s AP). A repeater extends coverage for wireless clients but does not act as a client for wired devices, a root AP is the wired member of a mesh, and outdoor bridges connect fixed buildings, not a moving device.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements describe this service set? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.6,
        nodes: [
          { id: 'a', icon: 'laptop', label: 'Laptop A', x: 1.5, y: 1.8 },
          { id: 'b', icon: 'laptop', label: 'Laptop B', x: 5.0, y: 1.8 },
          { id: 'c', icon: 'tablet', label: 'Tablet C', x: 8.5, y: 1.8 },
        ],
        links: [
          { from: 'a', to: 'b', style: 'wireless' },
          { from: 'b', to: 'c', style: 'wireless' },
        ],
      },
    },
    options: [
      'It is an IBSS, also called ad hoc mode',
      'No access point is required',
      'Multiple APs share one SSID to allow roaming',
      'A root AP provides the wired connection',
      'It is identified by the MAC address of an AP radio',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Clients talking directly with no AP form an **IBSS** (ad hoc). Roaming between APs sharing an SSID describes an ESS, a root AP belongs to a mesh (MBSS), and a BSSID taken from an AP radio identifies an infrastructure BSS.',
  },
  {
    id: 'e14',
    type: 'single',
    stem:
      'An AP radio serves 10 clients at acceptable speeds. After 30 more clients associate to the same radio, every client\'s throughput drops sharply even though signal strength has not changed. What explains this?',
    options: [
      'All clients share one half-duplex channel and contend for airtime with CSMA/CA',
      'The AP switches to CSMA/CD collision detection once more than 32 clients associate',
      'Each additional client raises the noise floor by 3 dB, steadily lowering the SNR',
      'The AP must renegotiate full-duplex operation each time a new client joins',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'A BSS is a **shared, half-duplex** medium: only one station transmits at a time, so airtime is divided among all active clients and contention (backoffs, retries) grows with the client count. 802.11 never uses CSMA/CD or full duplex, and associated clients do not raise the noise floor by a fixed amount.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Which frame does an 802.11 receiver send to confirm that a unicast data frame arrived intact?',
    options: ['ACK', 'CTS', 'Beacon', 'Probe response'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The receiver returns an **ACK** control frame; if the sender gets none, it retransmits. CTS answers an RTS to reserve the medium, beacons advertise the BSS, and probe responses answer probe requests.',
  },
  {
    id: 'e16',
    type: 'single',
    stem:
      'Refer to the exhibit. A dense office has 40 APs on 5 GHz. After the change shown, speeds improve in quiet areas, but overall performance in busy areas gets worse. What is the most likely reason?',
    exhibit: {
      kind: 'table',
      columns: ['Setting', 'Before', 'After'],
      rows: [
        ['5 GHz channel width', '20 MHz', '160 MHz'],
        ['Channel assignment', 'Automatic', 'Automatic'],
        ['Transmit power', 'Automatic', 'Automatic'],
      ],
    },
    options: [
      'Wider channels leave far fewer non-overlapping channels, so neighboring APs share channels',
      '160 MHz channels are limited to the 2.4 GHz band, so the 5 GHz radios fall back to 20 MHz',
      '160 MHz channels disable CSMA/CA collision avoidance, so frames collide far more often',
      'Clients cannot associate to an AP that uses channels wider than 40 MHz, so they roam away',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Bonding eight 20 MHz channels into one 160 MHz channel leaves only a handful of separate channels, so many neighboring APs end up on the same channel and **co-channel interference** rises. Each link is faster, but the building has less total capacity. 160 MHz is impossible in 2.4 GHz, CSMA/CA is always used, and 802.11ac/ax clients support 80 and 160 MHz channels.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'An organization enables Wi-Fi 6E radios in the 6 GHz band. Which two security settings can be used on a 6 GHz SSID? (Choose two.)',
    options: ['WPA3-Personal (SAE)', 'Enhanced Open (OWE)', 'WPA2-Personal with AES', 'WPA-Personal with TKIP', 'Static WEP with RC4'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The 6 GHz band allows only **WPA3** (SAE or Enterprise) or **Enhanced Open (OWE)** for open networks. WPA2-Personal is still common on 2.4 and 5 GHz but is not permitted on 6 GHz, and WPA/TKIP and WEP are obsolete everywhere.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'What does the signal-to-noise ratio (SNR) represent?',
    options: [
      'The difference in dB between the received signal and the noise floor',
      'The ratio of the AP transmit power to the gain of its antenna',
      'The received signal strength at the client, measured in milliwatts',
      'The percentage of frames that must be retransmitted by the sender',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '**SNR** is received signal minus noise floor, in dB; the bigger the gap, the higher the data rate a link can sustain. Transmit power and antenna gain combine into EIRP, received strength alone is RSSI, and retransmission percentage is a separate statistic.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit, which shows readings from two client locations on the same WLAN. Which location will most likely achieve the higher data rate?',
    exhibit: {
      kind: 'table',
      columns: ['Location', 'Signal (RSSI)', 'Noise floor'],
      rows: [
        ['Office A', '−62 dBm', '−75 dBm'],
        ['Office B', '−70 dBm', '−96 dBm'],
      ],
    },
    options: [
      'Office B, because its SNR is 26 dB compared with 13 dB in Office A',
      'Office A, because its signal is 8 dB stronger',
      'Office A, because a higher noise floor means more RF energy is available',
      'Both are the same, because the data rate depends only on the channel width',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Office A: −62 − (−75) = 13 dB. Office B: −70 − (−96) = **26 dB**. Radios choose their modulation from the SNR, so Office B supports higher data rates despite the weaker raw signal. A high noise floor is interference, not useful energy, and channel width is only one factor in the data rate.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Which two statements about the 2.4 GHz band are true? (Choose two.)',
    options: [
      'Adjacent channel center frequencies are 5 MHz apart',
      'Channels 1, 6 and 11 do not overlap',
      'Wi-Fi 6 uses 160 MHz channels in this band',
      'Only 802.11a and 802.11ac clients use this band',
      'Channels 12 and 13 require DFS radar detection',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Channel centers are **5 MHz apart**, so only **1, 6 and 11** avoid overlap. The 2.4 GHz band is far too narrow for 160 MHz channels, 802.11a and ac are 5 GHz standards, and DFS applies to certain 5 GHz channels, not to 2.4 GHz.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Users walk between the offices without losing their connection. Which term describes this wireless design?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 5.0, y: 0.9 },
          { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'SSID Staff · ch 1', x: 1.6, y: 2.8 },
          { id: 'ap2', icon: 'ap', label: 'AP2', sub: 'SSID Staff · ch 6', x: 5.0, y: 2.8 },
          { id: 'ap3', icon: 'ap', label: 'AP3', sub: 'SSID Staff · ch 11', x: 8.4, y: 2.8 },
        ],
        links: [
          { from: 'sw', to: 'ap1' },
          { from: 'sw', to: 'ap2' },
          { from: 'sw', to: 'ap3' },
        ],
      },
    },
    options: ['ESS', 'BSS', 'IBSS', 'MBSS'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Several APs advertising the same SSID over a common wired distribution system form an **ESS**, which is what makes roaming possible. A BSS is a single AP cell, an IBSS has no AP at all, and an MBSS uses wireless mesh backhaul instead of a cable to every AP.',
  },
  {
    id: 'e22',
    type: 'match',
    stem: 'Match each scenario to the RF behavior it describes.',
    pairs: [
      { left: 'Coverage in an auditorium drops once it fills with people', right: 'Absorption' },
      { left: 'Signals bounce off metal shelving and create multipath', right: 'Reflection' },
      { left: 'Coverage is weak directly behind a concrete pillar, but some signal bends around its edges', right: 'Diffraction' },
      { left: 'A signal changes direction as it passes through a thick glass window', right: 'Refraction' },
      { left: 'A signal hits a rough stone wall and is sent off in many directions at once', right: 'Scattering' },
    ],
    difficulty: 3,
    explanation:
      'Bodies are mostly water and **absorb** RF; smooth metal **reflects** it; bending around an obstacle is **diffraction**; bending while passing through a different medium is **refraction**; and a rough surface **scatters** energy in many directions.',
  },
];
