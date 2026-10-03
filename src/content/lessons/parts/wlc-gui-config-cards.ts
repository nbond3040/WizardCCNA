import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'AireOS GUI top menu bar', back: '**MONITOR**, **WLANs**, **CONTROLLER**, **WIRELESS**, **SECURITY**, **MANAGEMENT**, **COMMANDS** (plus HELP and FEEDBACK).' },
  { id: 'f2', front: 'AireOS: where do you create a WLAN?', back: '**WLANs** > **Create New** > Go. Choose type WLAN, then enter a profile name, the SSID and a WLAN ID.' },
  { id: 'f3', front: 'The five tabs of the AireOS WLAN edit page', back: '**General**, **Security**, **QoS**, **Policy-Mapping**, **Advanced**.' },
  { id: 'f4', front: 'WLAN profile name vs SSID', back: 'The profile name is an administrative label on the controller; the **SSID** (up to 32 characters) is what clients see. They may differ.' },
  { id: 'f5', front: 'WLAN Status checkbox (General tab)', back: 'The **Enabled** box must be ticked or no AP broadcasts the SSID. Unticking it takes a WLAN off the air without deleting it.' },
  { id: 'f6', front: 'Default interface of a new WLAN', back: '**management.** Pick a dynamic interface or interface group on the General tab to map the WLAN to a client VLAN.' },
  { id: 'f7', front: 'Broadcast SSID setting', back: 'Enabled by default. Clearing it hides the SSID from beacons but is **not** a real security control.' },
  { id: 'f8', front: 'Dynamic interface (AireOS)', back: 'A logical interface for a client VLAN with a name, VLAN ID, IP address, gateway and DHCP server. Created under **CONTROLLER > Interfaces > New**.' },
  { id: 'f9', front: 'Interface group', back: 'A set of dynamic interfaces. Mapping a WLAN to a group spreads its clients across several VLANs and subnets.' },
  { id: 'f10', front: 'Layer 2 settings for a WPA2 WLAN on AireOS', back: 'Layer 2 Security **WPA+WPA2**, **WPA2 Policy** checked, **AES** encryption (TKIP only for legacy clients).' },
  { id: 'f11', front: 'Default Auth Key Management on a new WLAN', back: '**802.1X.** For a passphrase WLAN you must enable **PSK** and clear 802.1X.' },
  { id: 'f12', front: 'PSK format and length on AireOS', back: '**ASCII:** 8–63 characters. **HEX:** exactly 64 hexadecimal digits.' },
  { id: 'f13', front: 'Security tab > Layer 3 sub-tab', back: 'Web policies for guest portals (web authentication or passthrough). It stays None on a normal 802.1X WLAN.' },
  { id: 'f14', front: 'Security tab > AAA Servers sub-tab', back: 'Selects the RADIUS authentication (and accounting) servers this WLAN uses, in priority order.' },
  { id: 'f15', front: 'Where RADIUS servers are defined on AireOS', back: '**SECURITY > AAA > RADIUS > Authentication** (and Accounting): server index, IP address, shared secret and port.' },
  { id: 'f16', front: 'Default RADIUS ports', back: 'UDP **1812** for authentication and UDP **1813** for accounting (legacy 1645/1646).' },
  { id: 'f17', front: 'QoS profile for voice', back: '**Platinum** (WMM voice, AC_VO).' },
  { id: 'f18', front: 'QoS profile for video', back: '**Gold** (WMM video, AC_VI).' },
  { id: 'f19', front: 'Silver and Bronze QoS profiles', back: '**Silver** = best effort (the default). **Bronze** = background traffic, such as guest or bulk data.' },
  { id: 'f20', front: 'The QoS profile acts as a ceiling', back: 'A voice client on a Silver WLAN gets no better than best-effort treatment, so a voice SSID must be set to Platinum.' },
  { id: 'f21', front: 'Allow AAA Override', back: 'Lets RADIUS attributes (VLAN or interface, QoS, ACL) override the WLAN settings per user. **Disabled by default**; required for dynamic VLAN assignment.' },
  { id: 'f22', front: 'Client Exclusion default', back: 'Enabled with a **60-second** timeout. A client is temporarily blocked after repeated failures such as excessive 802.1X authentication failures.' },
  { id: 'f23', front: 'DHCP Addr. Assignment Required', back: 'Clients must get their IP address from DHCP. A device with a static IP associates but cannot pass traffic.' },
  { id: 'f24', front: 'FlexConnect Local Switching', back: 'A FlexConnect AP bridges client traffic onto a local VLAN at the branch instead of tunneling it to the WLC.' },
  { id: 'f25', front: 'Policy-Mapping tab', back: 'Attaches **local policies** that match a device type (through profiling) and apply a VLAN, ACL, QoS level or timeout, ordered by priority index.' },
  { id: 'f26', front: 'Catalyst 9800 WLAN profile', back: 'Defines the SSID itself: name, WLAN ID, status, and Layer 2/Layer 3 security (including the AAA method list).' },
  { id: 'f27', front: 'Catalyst 9800 policy profile', back: 'Defines how client traffic is treated: VLAN, QoS, AAA override, timeouts, client exclusion, ACLs and central/local switching.' },
  { id: 'f28', front: 'Catalyst 9800 policy tag', back: 'Pairs WLAN profiles with policy profiles and is assigned to APs. It replaces AireOS AP groups.' },
  { id: 'f29', front: 'Catalyst 9800 site tag vs RF tag', back: '**Site tag:** AP join and flex profiles; decides local vs FlexConnect mode. **RF tag:** RF profiles for the 2.4 GHz and 5 GHz radios.' },
  { id: 'f30', front: 'Default tags on a Catalyst 9800 AP', back: '`default-policy-tag`, `default-site-tag` and `default-rf-tag`. The default policy tag does not include your new WLAN.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'On an AireOS controller, which WLAN tab holds the Interface/Interface Group setting that maps the WLAN to a VLAN?',
    options: ['General', 'Security', 'QoS', 'Advanced'],
    answer: 0,
    difficulty: 1,
    explanation:
      'The **General** tab contains the profile name, SSID, Status, Radio Policy, Broadcast SSID and the interface that maps the WLAN to a VLAN. Security holds authentication and encryption, QoS holds the metal profile, and Advanced holds behavior options such as AAA override.',
  },
  {
    id: 'q2',
    type: 'match',
    stem: 'Match each AireOS QoS profile to the traffic it is designed for.',
    pairs: [
      { left: 'Platinum', right: 'Voice' },
      { left: 'Gold', right: 'Video' },
      { left: 'Silver', right: 'Best effort (default)' },
      { left: 'Bronze', right: 'Background' },
    ],
    difficulty: 1,
    explanation:
      'The metal names run from highest to lowest priority: **Platinum** voice, **Gold** video, **Silver** best effort (the default for a new WLAN) and **Bronze** background traffic.',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'What is the maximum length of an ASCII WPA2 passphrase? (Enter the number of characters.)',
    answers: ['63'],
    placeholder: 'number',
    difficulty: 1,
    explanation:
      'An ASCII passphrase is **8 to 63** characters. A raw key is entered in HEX format and must be exactly 64 hexadecimal digits.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two settings are found on the Advanced tab of an AireOS WLAN? (Choose two.)',
    options: ['Allow AAA Override', 'Client Exclusion', 'QoS profile (Platinum to Bronze)', 'SSID', 'AAA server selection'],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**Allow AAA Override** and **Client Exclusion** are Advanced-tab options (with session timeout, DHCP required, FlexConnect local switching and client limits). The QoS profile has its own tab, the SSID is on the General tab, and AAA servers are chosen on the Security tab.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'On a Catalyst 9800 controller, which object pairs a WLAN profile with a policy profile so that an AP can broadcast the SSID?',
    options: ['Site tag', 'RF tag', 'Policy tag', 'AP join profile'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The **policy tag** contains the WLAN-profile-to-policy-profile pairs and is assigned to the AP. The site tag controls AP join and local/FlexConnect behavior, the RF tag selects RF profiles, and the AP join profile holds CAPWAP and AP management settings.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'An administrator creates a new WLAN on an AireOS controller and changes only the names and the WLAN ID. Which defaults apply?',
    options: [
      'Mapped to the first dynamic interface, Platinum QoS, WPA2 with PSK',
      'Mapped to the virtual interface, Gold QoS, open authentication',
      'Mapped to the service-port interface, Bronze QoS, WPA2 with PSK',
      'Mapped to the management interface, Silver QoS, WPA2 with 802.1X key management',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'A new WLAN defaults to the **management** interface, **Silver** QoS and WPA+WPA2 with the WPA2 policy, AES and **802.1X** key management. No dynamic interface, Platinum or Gold profile, or PSK is chosen for you, and a WLAN is never mapped to the virtual or service-port interface by default.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'On a Catalyst 9800 controller, where is the client VLAN for a WLAN configured?',
    options: ['WLAN profile', 'Policy profile', 'RF tag', 'Site tag'],
    answer: 1,
    difficulty: 2,
    explanation:
      'The **policy profile** holds the VLAN, QoS, AAA override and timeout settings. The WLAN profile holds the SSID and security, and the RF and site tags do not carry VLAN information. AireOS stores the equivalent VLAN mapping in the WLAN\'s Interface field.',
  },
];
