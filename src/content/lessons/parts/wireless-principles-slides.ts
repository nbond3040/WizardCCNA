import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Wireless Principles',
    subtitle: 'RF basics, 802.11 standards, channels, service sets and how a client joins a WLAN',
    notes:
      "Wireless LANs replace the cable with radio waves, and that one change affects everything: how devices share the medium, how far a signal reaches, how interference behaves and why security is never optional. This deck builds the vocabulary for the whole wireless module: **RF fundamentals** and power units, the **802.11 standards** and their bands, **channel planning** in 2.4, 5 and 6 GHz, the **service sets** (IBSS, BSS, ESS, MBSS), the **CSMA/CA** access method, the three **802.11 frame types**, and the exact sequence a client follows to discover and join a WLAN. It maps to v1.1 exam topic 1.11 (non-overlapping Wi-Fi channels, SSID, RF and encryption) and to Domain 1 (Network Infrastructure and Connectivity) of v2.0, so it is tested on both exam versions. Later lessons build directly on it: Cisco wireless architectures and AP modes, the physical connections of APs and WLCs, wireless security protocols and configuring a WLAN in the controller GUI.",
  },
  {
    kind: 'bullets',
    title: 'Why wireless is different',
    bullets: [
      'The air is a **shared medium**: every radio on the channel hears every frame',
      '802.11 is **half duplex**: one transmitter per channel at a time',
      'Collisions cannot be detected while sending, so **CSMA/CA**, not CSMA/CD',
      'Signals fade, bounce and bend: coverage is never a perfect circle',
      '2.4, 5 and 6 GHz are **unlicensed** bands: regulated but open to all',
      'Anyone in range can listen, so **authentication and encryption** are essential',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'wired LAN', x: 1.2, y: 1.4 },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'SSID Corp', x: 4.2, y: 1.4 },
        { id: 'l', icon: 'laptop', label: 'Laptop', x: 2.2, y: 3.7 },
        { id: 't', icon: 'tablet', label: 'Tablet', x: 4.2, y: 3.9 },
        { id: 'p', icon: 'phone', label: 'Phone', x: 6.2, y: 3.7 },
        { id: 'x', icon: 'attacker', label: 'Eavesdropper', sub: 'hears the same RF', x: 8.6, y: 2.4, tone: 'bad' },
      ],
      links: [
        { from: 'sw', to: 'ap', label: 'Ethernet, full duplex' },
        { from: 'ap', to: 'l', style: 'wireless' },
        { from: 'ap', to: 't', style: 'wireless' },
        { from: 'ap', to: 'p', style: 'wireless' },
        { from: 'ap', to: 'x', style: 'dotted', tone: 'bad' },
      ],
    },
    notes:
      "On switched Ethernet every device gets a private, full-duplex link to its switch port: collisions disappear and nobody receives anyone else's unicast frames. Wireless reverses all of that. All radios tuned to the same channel share one **half-duplex** medium, so only one station transmits at a time and the capacity of the cell is divided among every client. A radio cannot hear a collision while it is transmitting, so 802.11 uses **CSMA/CA** (collision avoidance) instead of the CSMA/CD used by half-duplex Ethernet. RF is also physical: signals weaken with distance, are absorbed by walls and bodies and reflect off metal, so real coverage is irregular. Finally, the medium is open. An eavesdropper in the parking lot receives exactly the same frames your clients do, which is why every enterprise WLAN combines **authentication** with **encryption**. The exam likes to contrast these properties with wired Ethernet: expect questions on the access method, on half duplex, and on why adding clients to one AP reduces each client's throughput.",
  },
  {
    kind: 'definitions',
    title: 'RF wave vocabulary',
    terms: [
      { term: '**Frequency**', def: 'Cycles per second, measured in hertz (Hz). 2.4 GHz = 2.4 billion cycles every second.' },
      { term: '**Period**', def: 'The time one cycle takes: 1 divided by the frequency.' },
      { term: '**Wavelength**', def: 'The distance one cycle covers. Higher frequency means a shorter wave: about 12.5 cm at 2.4 GHz, about 6 cm at 5 GHz.' },
      { term: '**Amplitude**', def: 'The strength (height) of the wave. It drops with distance and with every obstacle.' },
      { term: '**Band**', def: 'A range of frequencies set aside for a use. Wi-Fi uses the 2.4, 5 and 6 GHz bands.' },
      { term: '**Channel**', def: 'A slice of a band, named by its center frequency and width (20, 40, 80, 160 or 320 MHz).' },
    ],
    notes:
      "Radio frequency (RF) signals are electromagnetic waves, and a handful of properties describe them. **Frequency** is how many times the wave repeats every second; Wi-Fi uses the 2.4 GHz, 5 GHz and 6 GHz bands. The **period** is simply the duration of one cycle, the inverse of the frequency. **Wavelength** is the physical length of one cycle and is inversely proportional to frequency: divide the speed of light by the frequency and a 2.4 GHz wave is about 12.5 cm long while a 5 GHz wave is about 6 cm. **Amplitude** is the strength of the wave, which is what a client measures as signal level. A practical consequence: at the same transmit power, higher-frequency signals lose more energy through walls and over distance, so a 5 GHz or 6 GHz cell is smaller than a 2.4 GHz cell. Each band is divided into **channels** identified by a number that maps to a center frequency, and the width of a channel determines how much data it can carry. Exam items may ask you to match these terms to definitions, or to state that a higher frequency means a shorter wavelength.",
  },
  {
    kind: 'table',
    title: 'Power levels: milliwatts and dBm',
    columns: ['Power', 'In milliwatts', 'How to get there'],
    rows: [
      ['`30 dBm`', '1000 mW (1 W)', '20 dBm + 10 dB (×10)'],
      ['`23 dBm`', 'about 200 mW', '20 dBm + 3 dB (×2)'],
      ['`20 dBm`', '100 mW', '10 dBm + 10 dB (×10)'],
      ['`10 dBm`', '10 mW', '0 dBm + 10 dB (×10)'],
      ['`3 dBm`', 'about 2 mW', '0 dBm + 3 dB (×2)'],
      ['`0 dBm`', '**1 mW**', 'The reference point'],
      ['`−10 dBm`', '0.1 mW', '0 dBm − 10 dB (÷10)'],
      ['`−70 dBm`', '0.0000001 mW', 'A typical received signal'],
    ],
    caption: 'Rule of 3s and 10s: +3 dB ≈ double, −3 dB ≈ half, +10 dB = ×10, −10 dB = ÷10.',
    notes:
      "Wireless power spans an enormous range: an AP may transmit 100 mW while a client hears a signal a billion times weaker. Engineers therefore use the logarithmic **decibel**. A plain **dB** value is a ratio between two powers; **dBm** is an absolute power referenced to **1 mW**, so 0 dBm = 1 mW. Two rules solve almost every CCNA-level calculation: **+3 dB roughly doubles** the power and **+10 dB multiplies it by ten**, while −3 dB halves it and −10 dB divides it by ten. Example: 20 dBm is 1 mW × 10 × 10 = 100 mW; add 3 dB and 23 dBm is about 200 mW. Received signals are tiny fractions of a milliwatt, so they appear as negative dBm values such as −70 dBm. You will also meet **dBi**, antenna gain relative to a theoretical isotropic antenna, and **EIRP**, the power actually radiated: transmitter power minus cable loss plus antenna gain. For instance 17 dBm − 2 dB + 6 dBi = 21 dBm EIRP. A good exam habit: when a question gives milliwatts, convert with the 3s-and-10s rules instead of reaching for logarithms.",
  },
  {
    kind: 'diagram',
    title: 'RSSI, noise floor and SNR',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Example reading',
          layers: [
            { label: 'Signal (RSSI) −65 dBm', sub: 'measured at the client', tone: 'accent' },
            { label: 'SNR = 30 dB', sub: '−65 − (−95)', tone: 'good', span: 2 },
            { label: 'Noise floor −95 dBm', sub: 'background RF energy', tone: 'muted' },
          ],
        },
        {
          title: 'What it means',
          layers: [
            { label: 'Closer to 0 dBm = stronger', sub: '−50 dBm beats −80 dBm' },
            { label: 'Bigger gap = faster, cleaner link', sub: 'higher data rates, fewer retries', span: 2 },
            { label: 'Interference raises the floor', sub: 'and shrinks the SNR' },
          ],
        },
      ],
    },
    caption: 'SNR is the gap between two dBm values, so it is expressed in plain dB.',
    bullets: [
      '**RSSI**: received signal strength, shown as negative dBm',
      '**Noise floor**: RF energy from everything that is not your signal',
      '**SNR** = signal − noise; about 25 dB or more is a common voice target',
    ],
    notes:
      "Three measurements describe link quality from the receiver's point of view. **RSSI** (Received Signal Strength Indicator) is how strong the AP's signal is at the client. Cisco tools display it in dBm, and because it is a tiny fraction of a milliwatt it is negative: −45 dBm is excellent, −67 dBm is a common design minimum for voice and real-time traffic, and somewhere around −85 dBm connections become unreliable. (Strictly, raw RSSI is a vendor-specific index, but on the exam treat it as dBm.) The **noise floor** is the background RF energy on the channel, typically around −90 to −95 dBm. The **signal-to-noise ratio** is the difference between the two: a −65 dBm signal over a −95 dBm floor gives an SNR of 30 dB. SNR matters more than raw signal, because radios choose their modulation, and therefore their data rate, based on how cleanly they can separate signal from noise. A strong signal next to a microwave oven can still perform badly if the noise floor rises. Watch the arithmetic: subtracting one negative number from another trips up many candidates.",
  },
  {
    kind: 'table',
    title: 'How RF interacts with the environment',
    columns: ['Behavior', 'What happens', 'Typical causes'],
    rows: [
      ['**Absorption**', 'Material soaks up the energy and turns it into heat, so amplitude drops', 'Water, human bodies, concrete, wood'],
      ['**Reflection**', 'The signal bounces off a smooth surface', 'Metal, glass, mirrors, elevators, filing cabinets'],
      ['**Refraction**', 'The signal bends as it passes into a medium of different density', 'Glass, water, air layers of different temperature'],
      ['**Scattering**', 'The signal reflects in many directions at once', 'Rough or uneven surfaces, dust, rain, foliage'],
      ['**Diffraction**', 'The signal bends around an obstacle, leaving an RF shadow behind it', 'Building corners, pillars, large objects'],
      ['**Free-space path loss**', 'Energy spreads over a larger area as distance grows', 'Distance alone, even with no obstacles'],
    ],
    notes:
      "Real buildings are hostile to RF, and the CCNA expects you to name each effect. **Absorption** is the big one indoors: water-heavy materials, including a crowd of people, absorb energy, so a lecture hall that tested fine when empty can struggle when it is full. **Reflection** happens on smooth, dense surfaces such as metal and glass. Reflected copies of a signal arrive later than the direct path, which is called **multipath**; older radios suffered from it, but 802.11n and later **MIMO** radios use multipath to carry extra spatial streams. **Refraction** is bending as the wave crosses into a medium of different density, which changes its direction, just as a straw looks bent in a glass of water. **Scattering** is reflection off rough surfaces or small particles that sends the energy off in many weaker directions. **Diffraction** is the wave bending around the edge of an obstacle, which leaves a shadow of weak coverage behind it. Underneath all of these is **free-space path loss**: even in open air the energy spreads out and weakens with distance. Exam items usually describe a scenario and ask which behavior is occurring.",
  },
  {
    kind: 'table',
    title: '802.11 standards at a glance',
    columns: ['Standard', 'Wi-Fi name', 'Band(s)', 'Max data rate', 'Key additions'],
    rows: [
      ['802.11 (1997)', '—', '2.4 GHz', '2 Mbps', 'The original standard'],
      ['802.11b (1999)', '—', '2.4 GHz', '11 Mbps', 'DSSS'],
      ['802.11a (1999)', '—', '5 GHz', '54 Mbps', 'OFDM'],
      ['802.11g (2003)', '—', '2.4 GHz', '54 Mbps', 'OFDM, backward compatible with 802.11b'],
      ['802.11n (2009)', '**Wi-Fi 4**', '2.4 + 5 GHz', '600 Mbps', 'MIMO, 40 MHz channels'],
      ['802.11ac (2013)', '**Wi-Fi 5**', '**5 GHz only**', '6.93 Gbps', 'Downlink MU-MIMO, 80/160 MHz, 256-QAM'],
      ['802.11ax (2019)', '**Wi-Fi 6 / 6E**', '2.4 + 5 GHz (6E adds 6 GHz)', '9.6 Gbps', 'OFDMA, uplink MU-MIMO, BSS coloring, TWT'],
      ['802.11be (2024)', '**Wi-Fi 7**', '2.4 + 5 + 6 GHz', 'about 46 Gbps', '320 MHz channels, 4096-QAM, multi-link operation'],
    ],
    notes:
      "Each 802.11 amendment raised the maximum data rate, and the Wi-Fi Alliance gave the newer ones generation names: **Wi-Fi 4** is 802.11n, **Wi-Fi 5** is 802.11ac, **Wi-Fi 6** is 802.11ax, **Wi-Fi 6E** is 802.11ax extended into the 6 GHz band, and **Wi-Fi 7** is 802.11be. Know the bands cold: 802.11b and g are 2.4 GHz only, 802.11a and ac are **5 GHz only**, 802.11n and ax work in both 2.4 and 5 GHz, and 6 GHz requires Wi-Fi 6E or Wi-Fi 7 hardware. The maximum rates are theoretical PHY rates that assume every spatial stream and the widest channel; real throughput is roughly half or less, because the medium is shared and half duplex. Recognize the key additions: **MIMO** (multiple antennas and spatial streams) from 802.11n; **MU-MIMO** and wide 80/160 MHz channels from 802.11ac; **OFDMA** (splitting a channel into resource units for several clients at once), BSS coloring and target wake time from 802.11ax; and 320 MHz channels plus **multi-link operation** (using several bands at once) from 802.11be. Exam questions typically ask which standard uses which band, or which one is called Wi-Fi 6.",
  },
  {
    kind: 'diagram',
    title: '2.4 GHz: channels 1, 6 and 11',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a1', icon: 'ap', label: 'Ch 1', sub: '2.412 GHz', x: 1.5, y: 1.0 },
        { id: 'a2', icon: 'ap', label: 'Ch 6', sub: '2.437 GHz', x: 4.0, y: 1.0 },
        { id: 'a3', icon: 'ap', label: 'Ch 11', sub: '2.462 GHz', x: 6.5, y: 1.0 },
        { id: 'b1', icon: 'ap', label: 'Ch 11', x: 2.75, y: 2.6 },
        { id: 'b2', icon: 'ap', label: 'Ch 1', x: 5.25, y: 2.6 },
        { id: 'b3', icon: 'ap', label: 'Ch 6', x: 7.75, y: 2.6 },
        { id: 'c1', icon: 'ap', label: 'Ch 1', x: 1.5, y: 4.2 },
        { id: 'c2', icon: 'ap', label: 'Ch 6', x: 4.0, y: 4.2 },
        { id: 'c3', icon: 'ap', label: 'Ch 11', x: 6.5, y: 4.2 },
      ],
      links: [],
    },
    caption: 'A three-channel reuse pattern: no two neighboring cells share a channel.',
    bullets: [
      'Channel centers are only **5 MHz** apart',
      'Each channel is **22 MHz** (DSSS) or **20 MHz** (OFDM) wide',
      '==Only 1, 6 and 11 do not overlap== (US: channels 1–11)',
      'Reuse them in a honeycomb; do not bond to 40 MHz here',
    ],
    notes:
      "The 2.4 GHz band is only about 83 MHz wide, yet it is divided into 11 channels in North America (13 in much of the world and 14 in Japan, where channel 14 is 802.11b only), and their center frequencies are just **5 MHz apart**. A Wi-Fi transmission occupies roughly **20 to 22 MHz**, so every channel overlaps its neighbors: channel 1 spills into channels 2 through 5. Only channels five numbers apart stay clear of one another, which leaves exactly three **non-overlapping channels: 1, 6 and 11**. Designers reuse those three in a honeycomb pattern, as in the diagram, so that no two adjacent cells share a channel and a roaming client always finds a clean channel in the next cell. Putting an AP on channel 3 or 9 is a classic mistake that creates adjacent-channel interference with two cells at once. Because a 40 MHz channel would consume most of the band, channel bonding is not practical in 2.4 GHz; leave it at 20 MHz. This is one of the most frequently tested wireless facts: if an answer lists any set other than 1, 6 and 11 as the non-overlapping channels, it is wrong.",
  },
  {
    kind: 'table',
    title: 'Choosing a band: 2.4 vs 5 vs 6 GHz',
    columns: ['Property', '2.4 GHz', '5 GHz', '6 GHz'],
    rows: [
      ['Non-overlapping 20 MHz channels', '**3** (1, 6, 11)', 'About two dozen (varies by country)', 'Up to 59 (US)'],
      ['Range and wall penetration', 'Best', 'Shorter', 'Shortest'],
      ['Interference', 'Crowded: microwaves, Bluetooth, older Wi-Fi', 'Lighter; radar on DFS channels', 'Cleanest: new band, no legacy clients'],
      ['802.11 standards', 'b, g, n, ax, be', 'a, n, ac, ax, be', 'ax (Wi-Fi 6E), be'],
      ['Wide channels', 'Stay at 20 MHz', '40/80 MHz common, 160 MHz possible', '80/160 MHz easy, 320 MHz with Wi-Fi 7'],
      ['Security', 'Any WPA version', 'Any WPA version', '**WPA3 or Enhanced Open only**'],
    ],
    notes:
      "Choosing a band is a trade-off between **coverage** and **capacity**. The 2.4 GHz band travels farthest and penetrates walls best, and virtually every client supports it, but it has only three usable channels and shares its spectrum with microwave ovens, Bluetooth, cordless phones and legacy 802.11b/g devices that slow the whole cell down. The 5 GHz band offers many more non-overlapping channels and far less non-Wi-Fi noise, at the cost of somewhat smaller cells. Some 5 GHz channels are **DFS** (Dynamic Frequency Selection) channels: the AP must listen for radar and vacate the channel if radar appears. The 6 GHz band used by Wi-Fi 6E and Wi-Fi 7 adds a large block of clean spectrum, up to 59 twenty-megahertz channels in the US, but only newer clients can use it, cells are the smallest of the three, and the Wi-Fi Alliance requires **WPA3 or Enhanced Open** there, so WPA2 and WEP are not allowed. A typical enterprise design enables every band and steers capable clients away from 2.4 GHz (band steering, called band select on Cisco controllers). On the exam, 5 GHz is usually the right answer for more channels and less interference; 2.4 GHz wins only on range and compatibility.",
  },
  {
    kind: 'diagram',
    title: 'Channel bonding: wider channels, fewer of them',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: '20 MHz',
          layers: [
            { label: 'Ch 36' }, { label: 'Ch 40' }, { label: 'Ch 44' }, { label: 'Ch 48' },
            { label: 'Ch 52' }, { label: 'Ch 56' }, { label: 'Ch 60' }, { label: 'Ch 64' },
          ],
        },
        {
          title: '40 MHz',
          layers: [
            { label: '36 + 40', span: 2 },
            { label: '44 + 48', span: 2 },
            { label: '52 + 56', span: 2 },
            { label: '60 + 64', span: 2 },
          ],
        },
        {
          title: '80 MHz',
          layers: [
            { label: '36–48', span: 4 },
            { label: '52–64', span: 4 },
          ],
        },
        {
          title: '160 MHz',
          layers: [{ label: '36–64', sub: 'a single channel', span: 8, tone: 'accent' }],
        },
      ],
    },
    caption: 'The same eight 20 MHz channels give four 40 MHz, two 80 MHz or just one 160 MHz channel.',
    bullets: [
      '**Bonding** joins adjacent 20 MHz channels for higher data rates',
      'Each doubling of width **halves** the number of separate channels',
      '802.11n: 40 MHz · 802.11ac/ax: 80/160 MHz · 802.11be: 320 MHz (6 GHz only)',
    ],
    notes:
      "**Channel bonding** combines adjacent 20 MHz channels into one wider channel. Roughly speaking, doubling the width doubles the data rate, which is why the headline speeds of 802.11ac, 802.11ax and 802.11be all assume very wide channels. 802.11n introduced 40 MHz channels, 802.11ac added 80 and 160 MHz, and Wi-Fi 7 adds 320 MHz channels, which exist only in the 6 GHz band. The catch is shown in the diagram: the eight 20 MHz channels from 36 to 64 can form four 40 MHz channels, two 80 MHz channels or a single 160 MHz channel. Fewer independent channels means neighboring APs are more likely to land on the same channel, which increases **co-channel interference** and can reduce the total capacity of the building even though each individual link is faster. Wider channels also collect more noise. In dense enterprise deployments, 20 or 40 MHz channels on 5 GHz are common; 80 MHz and wider suit lighter densities or the roomy 6 GHz band. Note also that channels 52 to 64 are DFS channels, so a 160 MHz channel built on them must still honor radar detection.",
  },
  {
    kind: 'bullets',
    title: 'Interference: co-channel, adjacent-channel, non-Wi-Fi',
    bullets: [
      '**Co-channel interference (CCI)**: nearby cells on the same channel share airtime',
      '**Adjacent-channel interference (ACI)**: overlapping channels (3 vs 1 and 6) corrupt frames',
      '**Non-Wi-Fi**: microwave ovens, Bluetooth, cordless phones, video senders, radar',
      'ACI is worse: the energy cannot be decoded, so radios cannot defer to it',
      'Fixes: 1/6/11 reuse, tune power, move clients to 5/6 GHz, remove the source',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a', icon: 'ap', label: 'AP-A', sub: 'ch 6', x: 1.5, y: 1.4 },
        { id: 'b', icon: 'ap', label: 'AP-B', sub: 'ch 6', x: 5.0, y: 1.4 },
        { id: 'c', icon: 'ap', label: 'AP-C', sub: 'ch 3', x: 8.5, y: 1.4, tone: 'bad' },
        { id: 'm', icon: 'box', label: 'Microwave oven', sub: 'about 2.45 GHz', x: 5.0, y: 3.8, tone: 'warn' },
      ],
      links: [
        { from: 'a', to: 'b', style: 'dashed', tone: 'warn', label: 'CCI: take turns' },
        { from: 'b', to: 'c', style: 'dashed', tone: 'bad', label: 'ACI: corrupted frames' },
        { from: 'm', to: 'b', style: 'dotted', tone: 'bad', label: 'non-Wi-Fi noise' },
      ],
    },
    notes:
      "Wi-Fi interference comes in three flavors. **Co-channel interference**, often called co-channel contention, happens when two cells on the same channel can hear each other. Because both follow CSMA/CA they politely take turns: nothing is corrupted, but they now share one channel's airtime, so both cells slow down. **Adjacent-channel interference** is worse. An AP on channel 3 partly overlaps both channel 1 and channel 6; its energy is not a valid frame to those radios, so they cannot defer to it. It simply raises their noise, causing corrupted frames, retransmissions and lower data rates. **Non-Wi-Fi interference** comes from devices that use the same unlicensed spectrum without speaking 802.11: microwave ovens around 2.45 GHz, Bluetooth headsets, cordless phones, wireless video cameras and baby monitors, plus radar in parts of the 5 GHz band. Spectrum analysis, for example with an AP in SE-Connect mode (next lesson), identifies these sources. Remedies include a clean 1/6/11 plan, lowering transmit power so cells do not overhear each other, moving clients to 5 or 6 GHz, and removing or relocating the offending device.",
  },
  {
    kind: 'diagram',
    title: 'Service sets: IBSS and BSS',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      groups: [
        { label: 'IBSS (ad hoc)', x: 0.2, y: 0.3, w: 3.8, h: 4.4, tone: 'muted' },
        { label: 'BSS', x: 4.3, y: 0.3, w: 5.5, h: 4.4 },
      ],
      nodes: [
        { id: 'l1', icon: 'laptop', label: 'Laptop A', x: 1.1, y: 1.6 },
        { id: 'l2', icon: 'laptop', label: 'Laptop B', x: 3.0, y: 3.6 },
        { id: 'ap', icon: 'ap', label: 'AP1', sub: 'BSSID 0c85.25a1.b310', x: 7.05, y: 1.4, tone: 'accent' },
        { id: 'c1', icon: 'laptop', label: 'Client 1', x: 5.2, y: 3.7 },
        { id: 'c2', icon: 'phone', label: 'Client 2', x: 7.05, y: 3.9 },
        { id: 'c3', icon: 'tablet', label: 'Client 3', x: 8.9, y: 3.7 },
      ],
      links: [
        { from: 'l1', to: 'l2', style: 'wireless' },
        { from: 'ap', to: 'c1', style: 'wireless' },
        { from: 'ap', to: 'c2', style: 'wireless' },
        { from: 'ap', to: 'c3', style: 'wireless' },
      ],
    },
    caption: 'In an IBSS clients talk directly; in a BSS every frame passes through the AP.',
    bullets: [
      '**IBSS** (ad hoc): clients only, no AP; small and unscalable',
      '**BSS**: one AP and its associated clients; the cell is the **BSA**',
      '**BSSID**: the MAC address that identifies the BSS (from the AP radio)',
      '**SSID**: the human-readable WLAN name, up to 32 characters',
    ],
    notes:
      "A **service set** is a group of wireless devices that share a network. The simplest is the **IBSS** (Independent Basic Service Set), also called ad hoc mode: clients connect directly to each other without any AP. It is handy for a quick file transfer, but it does not scale and offers no connection to the wired network. Enterprise WLANs use a **BSS** built around an access point. Clients must associate with the AP and all traffic flows through it; even two clients sitting side by side exchange frames via the AP. The coverage area of a BSS is the **basic service area** (BSA), or cell. Every BSS is identified by a **BSSID**, a MAC address derived from the AP radio. The network name users see is the **SSID**, a text string of up to 32 characters. One AP radio can offer several SSIDs, for example Corp and Guest, and each SSID gets its own BSSID so that the frames of each WLAN can be told apart. A classic exam trap swaps these terms: the BSSID is the MAC address, the SSID is the name.",
  },
  {
    kind: 'diagram',
    title: 'ESS, the distribution system and roaming',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      groups: [
        { label: 'BSS 1 · SSID Corp', x: 0.4, y: 1.7, w: 4.3, h: 3.2 },
        { label: 'BSS 2 · SSID Corp', x: 5.3, y: 1.7, w: 4.3, h: 3.2 },
      ],
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'distribution system', x: 5.0, y: 0.8 },
        { id: 'ap1', icon: 'ap', label: 'AP1', sub: 'BSSID …b310 · ch 1', x: 2.5, y: 2.5 },
        { id: 'ap2', icon: 'ap', label: 'AP2', sub: 'BSSID …c720 · ch 6', x: 7.5, y: 2.5 },
        { id: 'c', icon: 'laptop', label: 'Client', sub: 'before', x: 3.4, y: 4.2 },
        { id: 'c2', icon: 'laptop', label: 'Client', sub: 'after roaming', x: 6.6, y: 4.2, tone: 'accent' },
      ],
      links: [
        { from: 'sw', to: 'ap1', fromLabel: 'Gi1/0/1' },
        { from: 'sw', to: 'ap2', fromLabel: 'Gi1/0/2' },
        { from: 'ap1', to: 'c', style: 'wireless' },
        { from: 'ap2', to: 'c2', style: 'wireless' },
        { from: 'c', to: 'c2', style: 'dashed', arrow: 'forward', tone: 'accent', label: 'reassociation' },
      ],
    },
    bullets: [
      '**ESS**: several BSSs with the **same SSID**, joined by the wired **DS**',
      'Each AP radio keeps its own **BSSID** and usually its own channel',
      '**Roaming**: the client reassociates to a better AP and keeps its IP address',
      'Cells overlap slightly so the handoff is seamless',
    ],
    notes:
      "An AP bridges its wireless clients onto a wired network called the **distribution system** (DS), in practice an Ethernet switch port and the VLANs behind it. When one cell is not enough, you deploy several APs that advertise the **same SSID** and connect to the same DS. Together these BSSs form an **Extended Service Set** (ESS). Each AP still has its own BSSID and normally its own non-overlapping channel, but users see a single network name. As a client walks away from AP1, its signal and SNR drop. The client (roaming is always a client decision) scans, finds AP2 stronger and sends a **reassociation request**. If both APs place the client in the same VLAN, or a controller handles the move as later lessons show, the client keeps its IP address and its sessions survive. Good designs overlap neighboring cells slightly, commonly around 10 to 20 percent and more for voice, so a client always has a candidate AP before the old one fades. Exam stems that describe multiple APs with one SSID and seamless roaming are describing an ESS.",
  },
  {
    kind: 'diagram',
    title: 'Mesh networks (MBSS)',
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'wired LAN', x: 1.0, y: 1.2 },
        { id: 'rap', icon: 'ap', label: 'RAP', sub: 'root AP (wired)', x: 3.4, y: 1.2, tone: 'accent' },
        { id: 'm1', icon: 'ap', label: 'MAP1', sub: 'mesh AP', x: 6.0, y: 1.2 },
        { id: 'm2', icon: 'ap', label: 'MAP2', sub: 'mesh AP', x: 8.6, y: 1.2 },
        { id: 'l', icon: 'laptop', label: 'Client', x: 6.0, y: 3.5 },
        { id: 'p', icon: 'phone', label: 'Client', x: 8.6, y: 3.5 },
      ],
      links: [
        { from: 'sw', to: 'rap' },
        { from: 'rap', to: 'm1', style: 'wireless', tone: 'accent', label: 'backhaul' },
        { from: 'm1', to: 'm2', style: 'wireless', tone: 'accent', label: 'backhaul' },
        { from: 'm1', to: 'l', style: 'wireless' },
        { from: 'm2', to: 'p', style: 'wireless' },
      ],
    },
    caption: 'Only the RAP needs a cable; MAPs relay traffic hop by hop over a backhaul radio.',
    bullets: [
      '**Root AP (RAP)** has the wired connection to the LAN',
      '**Mesh APs (MAPs)** reach the RAP wirelessly, possibly over several hops',
      'Backhaul usually on 5 GHz; clients are served on another radio or channel',
      'Each hop adds latency and shares airtime, so keep hop counts low',
    ],
    notes:
      "A **mesh basic service set** (MBSS) extends coverage where running Ethernet to every AP is impractical: parking lots, campuses, warehouses, city streets. One or more **root APs** (RAPs) have a wired connection. Every other **mesh AP** (MAP) builds a wireless backhaul link to a RAP or to another MAP, and a mesh routing protocol picks the best path back to the root. Cisco mesh APs typically use one radio, often 5 GHz, for the backhaul between APs and another radio to serve clients, so the two jobs do not compete for the same airtime. Because every hop retransmits the traffic over a shared, half-duplex medium, throughput falls and latency rises as hops increase, so designers keep chains short and add RAPs where they can. The APs still advertise ordinary SSIDs to clients; the mesh is invisible to users. In Cisco terms these APs run in **bridge** (mesh) mode, which the next lesson covers with the other AP modes. For the exam remember the roles: the RAP is wired, the MAPs are not, and MBSS is the service-set name for a mesh.",
  },
  {
    kind: 'table',
    title: 'Repeaters, workgroup bridges and outdoor bridges',
    columns: ['Mode', 'What it does', 'Key detail'],
    rows: [
      ['**Repeater**', 'Receives a cell and retransmits it to extend coverage', 'A single-radio repeater reuses the same channel, roughly halving throughput'],
      ['**Workgroup bridge (WGB)**', 'The AP acts as a wireless **client** for wired devices behind it', '**uWGB**: one wired device, works with any AP · Cisco **WGB**: several wired devices'],
      ['**Outdoor bridge, point-to-point**', 'Links two buildings or LANs over the air', 'Directional antennas at both ends; long distances'],
      ['**Outdoor bridge, point-to-multipoint**', 'A central site links several remote sites', 'Omnidirectional or sector antenna at the hub'],
    ],
    notes:
      "Besides serving clients in a BSS, an AP can play several helper roles. A **repeater** listens to an existing AP and retransmits its signal into an area the original cell cannot reach. It is simple, but a single-radio repeater must receive and retransmit on the same channel, so every frame crosses the air twice and throughput is roughly halved; a dual-radio repeater can receive on one channel and transmit on another. A **workgroup bridge** turns the relationship around: the AP associates to another AP as if it were a client, and wired devices plugged into its Ethernet port reach the WLAN through it. Think of a barcode printer on a forklift or a machine controller with only an Ethernet port. A **universal WGB** (uWGB) interoperates with any vendor's AP but bridges only one wired device, while Cisco's own WGB supports several wired clients. **Outdoor bridges** join separate wired networks across a street or campus: point-to-point links use directional antennas at both ends, while point-to-multipoint designs use a central omnidirectional or sector antenna reaching several remote buildings. The exam typically presents one of these scenarios and asks which mode fits.",
  },
  {
    kind: 'diagram',
    title: 'CSMA/CA: listen before you talk',
    diagram: {
      type: 'flow',
      width: 10,
      height: 4.6,
      nodes: [
        { id: 'n1', label: 'Frame to send', shape: 'pill', x: 1.0, y: 1.0 },
        { id: 'n2', label: 'Medium idle?', sub: 'carrier sense + NAV', shape: 'diamond', x: 3.3, y: 1.0 },
        { id: 'n3', label: 'Wait + random backoff', x: 5.8, y: 1.0 },
        { id: 'n4', label: 'Transmit frame', x: 8.4, y: 1.0, tone: 'accent' },
        { id: 'n5', label: 'ACK received?', shape: 'diamond', x: 8.4, y: 3.3 },
        { id: 'n6', label: 'Success', shape: 'round', tone: 'good', x: 6.0, y: 3.3 },
        { id: 'n7', label: 'Defer until idle', tone: 'warn', x: 3.3, y: 3.3 },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3', label: 'idle' },
        { from: 'n2', to: 'n7', label: 'busy' },
        { from: 'n7', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
        { from: 'n5', to: 'n6', label: 'yes' },
        { from: 'n5', to: 'n3', label: 'no: retry', dashed: true, tone: 'bad' },
      ],
    },
    bullets: [
      'A radio cannot hear collisions while sending, so it **avoids** them',
      'A random **backoff** stops waiting stations from transmitting together',
      'Every unicast frame is **ACKed**; no ACK means loss, so retransmit',
      'Optional **RTS/CTS** reserves the channel (hidden-node problem)',
    ],
    notes:
      "Half-duplex Ethernet used CSMA/CD: transmit, detect a collision, jam and retry. A radio cannot do that, because its own transmission drowns out anything it could hear, so 802.11 uses **CSMA/CA**, Carrier Sense Multiple Access with Collision Avoidance. A station with a frame to send first checks that the medium is idle, using physical carrier sense (clear channel assessment) and virtual carrier sense: every frame's **Duration** field tells other stations how long the medium will be busy, and they set a countdown called the **NAV** accordingly. When the medium is free, the station waits a fixed interframe space plus a **random backoff**, so two stations that were both waiting rarely start at the same instant. The receiver confirms every unicast frame with an **ACK**; if the sender hears no ACK, it assumes the frame was lost, picks a new and usually longer backoff, and retransmits. When two clients cannot hear each other but both reach the AP, the **hidden node** problem, optional **RTS/CTS** frames reserve the channel first. For the exam remember: Wi-Fi uses CSMA/CA, it is half duplex, and unicast frames are acknowledged.",
  },
  {
    kind: 'diagram',
    title: '802.11 frames: header and frame types',
    diagram: {
      type: 'header',
      layout: 'line',
      unit: 'bytes',
      fields: [
        { label: 'Frame Control', size: 2, sub: 'type / subtype', tone: 'accent' },
        { label: 'Duration/ID', size: 2, sub: 'sets the NAV' },
        { label: 'Address 1', size: 6, sub: 'receiver' },
        { label: 'Address 2', size: 6, sub: 'transmitter' },
        { label: 'Address 3', size: 6, sub: 'BSSID / SA / DA' },
        { label: 'Seq Control', size: 2 },
        { label: 'Address 4', size: 6, sub: 'mesh/bridge only', tone: 'muted' },
        { label: 'QoS Control', size: 2, sub: 'QoS data', tone: 'muted' },
        { label: 'HT Control', size: 4, sub: '802.11n+', tone: 'muted' },
      ],
      caption: 'MAC header: 24 bytes for a basic data frame, up to 36 with every optional field. The frame body and a 4-byte FCS follow.',
    },
    bullets: [
      '**Management**: beacon, probe, authentication, association, reassociation, deauthentication',
      '**Control**: ACK, RTS, CTS, Block ACK',
      '**Data**: the user payload (plus null frames for power save)',
      'Frame Control holds the **type/subtype**; up to **four** MAC addresses',
    ],
    notes:
      "An 802.11 frame starts with a MAC header that looks nothing like Ethernet's. **Frame Control** identifies the frame **type** and subtype and carries flags such as To DS/From DS, Retry and Protected Frame. **Duration/ID** feeds the NAV used by virtual carrier sense. There can be up to **four address fields**: Address 1 is always the receiver and Address 2 the transmitter; Address 3 carries the BSSID or the original source or final destination; and Address 4 appears only when frames are relayed wireless-to-wireless, as on mesh or bridge links. **Sequence Control** detects duplicates, **QoS Control** carries the WMM priority, and **HT Control** was added by 802.11n. After the header come the frame body and a 4-byte FCS. There are three frame types. **Management** frames build and tear down relationships: APs send **beacons** about ten times per second by default (every 102.4 ms), clients send probes, and authentication and association frames join the BSS. **Control** frames such as ACK, RTS and CTS help deliver other frames. **Data** frames carry the payload. Unless Protected Management Frames are enabled (mandatory with WPA3), management frames are unprotected, which is what makes spoofed deauthentication attacks possible.",
  },
  {
    kind: 'diagram',
    title: 'How a client joins a BSS',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client', icon: 'laptop' },
        { id: 'ap', label: 'AP (SSID Corp)', icon: 'ap' },
      ],
      steps: [
        { note: 'Passive scan: listen for beacons · Active scan: send probe requests' },
        { from: 'c', to: 'ap', label: 'Probe request', sub: "Is SSID 'Corp' here? Supported rates" },
        { from: 'ap', to: 'c', label: 'Probe response', sub: 'SSID, BSSID, channel, security' },
        { from: 'c', to: 'ap', label: 'Authentication request', sub: 'open system (WPA3-Personal: SAE exchange)' },
        { from: 'ap', to: 'c', label: 'Authentication response', sub: 'success' },
        { from: 'c', to: 'ap', label: 'Association request', sub: 'SSID, rates, capabilities' },
        { from: 'ap', to: 'c', label: 'Association response', sub: 'status + association ID', tone: 'accent' },
        { note: 'Then 802.1X/EAP if Enterprise, and the 4-way handshake derives the keys' },
      ],
    },
    caption: 'Discover, authenticate, associate; encryption keys are negotiated last.',
    notes:
      "Joining a WLAN follows a fixed order of management frames. First the client must **discover** the network. In **passive scanning** it listens on each channel for beacons; in **active scanning** it sends **probe requests**, for a specific SSID or a wildcard, and APs answer with **probe responses** that describe the SSID, supported rates and security. Next comes 802.11 **authentication**. With WPA2 and older this is **open system** authentication, a formality that always succeeds; the real credential check happens later. WPA3-Personal uses this step to run its SAE password exchange. Then the client sends an **association request**, the AP accepts it with an **association response** that assigns an association ID, and the client is now part of the BSS. On a WPA2 or WPA3 Enterprise network, a full 802.1X/EAP authentication with a RADIUS server follows; with a pre-shared key the key itself is the starting point. Either way the **4-way handshake** then derives the encryption keys, and only then can data flow. Roaming reuses the pattern with reassociation frames. An exam item may list these messages shuffled and ask you to put them in order.",
  },
  {
    kind: 'table',
    title: 'Security preview: from open to WPA3',
    columns: ['Option', 'Authentication', 'Encryption / integrity', 'Status'],
    rows: [
      ['**Open**', 'None', 'None (Enhanced Open/OWE adds encryption)', 'Guest networks, usually with a web portal'],
      ['**WEP**', 'Open or shared key, static keys', 'RC4', '**Broken**: never use'],
      ['**WPA**', 'PSK or 802.1X', 'TKIP (RC4-based) + MIC', 'Deprecated interim fix'],
      ['**WPA2**', 'PSK or 802.1X', 'AES-CCMP', 'Widely deployed baseline'],
      ['**WPA3**', 'SAE or 802.1X', 'AES-CCMP or GCMP; PMF required', 'Current best practice'],
    ],
    caption: 'Personal vs enterprise, EAP methods and SAE are covered in the Wireless Security lesson.',
    notes:
      "Because anyone in range can capture wireless frames, every WLAN must answer three questions: who is allowed on (**authentication**), how the data is kept secret (**encryption**), and how tampering is detected (**integrity**). This table is a preview; the Wireless Security lesson covers each row in depth. **Open** networks authenticate nobody and encrypt nothing, although Enhanced Open (OWE) now adds encryption without a password. **WEP**, the original scheme, used the RC4 cipher with static shared keys and can be cracked in minutes. **WPA** was a stop-gap that kept RC4 but added TKIP per-packet keys and a message integrity check, so existing hardware could be upgraded with firmware. **WPA2** implements the IEEE 802.11i standard with **AES-CCMP** and remains the most common setting today. **WPA3** replaces the pre-shared key exchange with **SAE**, requires **Protected Management Frames** and adds GCMP for its strongest enterprise mode. WPA, WPA2 and WPA3 all come in **Personal** (shared passphrase) and **Enterprise** (802.1X with a RADIUS server) variants. For v1.1 topic 1.11.d, recognize the names and their order of strength: WEP, then WPA, then WPA2, then WPA3.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: wireless principles',
    body: 'Wireless-principles questions reward exact facts. Check every answer against these before you commit.',
    bullets: [
      '2.4 GHz non-overlapping channels are **1, 6 and 11**, nothing else',
      '**BSSID** = AP radio MAC address · **SSID** = network name',
      '802.11ac is **5 GHz only**; 802.11n and 802.11ax use 2.4 and 5 GHz',
      'Wi-Fi uses **CSMA/CA** and is **half duplex**',
      '+3 dB ≈ double, +10 dB = ×10; SNR = signal − noise, in dB',
      '**IBSS** = no AP · **ESS** = many APs, one SSID · **MBSS** = mesh',
    ],
    notes:
      "These are the traps that catch candidates most often. Channel questions: the only non-overlapping 2.4 GHz set the exam accepts is 1, 6 and 11; distractors such as 1, 5, 9 or 2, 7, 12 look plausible but are wrong. Identifier questions: the **BSSID** is a MAC address, the **SSID** is a name, and one AP radio has several BSSIDs if it offers several SSIDs. Standards questions: 802.11ac is 5 GHz only, 802.11n and 802.11ax are dual-band, and 6 GHz needs Wi-Fi 6E or Wi-Fi 7. Access-method questions: Wi-Fi uses CSMA/CA, never CSMA/CD, and it is half duplex, so more clients on one AP means less airtime for each. Math questions: use the 3s and 10s rules (10 mW plus 3 dB is 20 mW) and compute SNR by subtracting the noise floor from the signal, remembering that both values are negative. Service-set questions: IBSS means no AP, BSS means one AP, ESS means several APs sharing an SSID over a distribution system, and MBSS means mesh. Finally, read every stem for words like 'not' and 'least'.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'RF: frequency, wavelength, amplitude; power in **mW/dBm**; quality as **RSSI** and **SNR**',
      'Signals weaken through absorption, reflection, refraction, scattering, diffraction, distance',
      'n = Wi-Fi 4, ac = Wi-Fi 5 (5 GHz only), ax = Wi-Fi 6/6E, be = Wi-Fi 7',
      '2.4 GHz: channels **1, 6, 11**; 5 and 6 GHz: many channels, optional bonding',
      'Service sets: IBSS, BSS (BSSID), ESS (roaming), MBSS (mesh); WGB, repeater, bridge',
      '**CSMA/CA**, half duplex; join = probe, authenticate, associate, then keys',
    ],
    notes:
      "You now have the vocabulary the rest of the wireless module relies on. RF signals are described by frequency, wavelength and amplitude, and their power is measured in milliwatts or dBm, with the 3s-and-10s rules for quick math; link quality is judged by RSSI and, more importantly, by SNR. Signals lose strength to absorption, reflection, refraction, scattering, diffraction and plain distance. The 802.11 family grew from 2 Mbps to multi-gigabit rates; know each standard's band and its Wi-Fi generation name. In 2.4 GHz only channels 1, 6 and 11 avoid overlap, while 5 and 6 GHz offer many channels that can be bonded into wider ones at the cost of fewer independent channels. APs and clients form service sets (IBSS, BSS, ESS and MBSS), and APs can also act as repeaters, workgroup bridges or outdoor bridges. Stations share the half-duplex medium with CSMA/CA and join a WLAN by probing, authenticating and associating before any WPA2 or WPA3 keys are negotiated. Next you will see how Cisco builds WLANs from these pieces: autonomous APs, lightweight APs with controllers, and cloud-managed APs.",
  },
];
