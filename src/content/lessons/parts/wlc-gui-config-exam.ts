import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'match',
    stem: 'Match each AireOS GUI menu to what you configure or view there.',
    pairs: [
      { left: 'MONITOR', right: 'Summary of APs, clients, rogues and statistics' },
      { left: 'WLANs', right: 'Creating and editing WLANs and their tabs' },
      { left: 'CONTROLLER', right: 'Interfaces, interface groups, ports and NTP' },
      { left: 'WIRELESS', right: 'Access points, radios, RF profiles and FlexConnect groups' },
      { left: 'SECURITY', right: 'AAA servers (RADIUS, TACACS+), ACLs and protection policies' },
      { left: 'MANAGEMENT', right: 'SNMP, HTTP/HTTPS, SSH and syslog settings' },
    ],
    difficulty: 1,
    explanation:
      'MONITOR is read-only status, WLANs holds the SSID list and the WLAN edit tabs, CONTROLLER holds the controller plumbing (interfaces, ports, NTP), WIRELESS covers APs and radios, SECURITY holds the AAA servers and ACLs, and MANAGEMENT sets how administrators reach the box. A shortcut: SSID settings live under WLANs, settings about the box live under CONTROLLER and MANAGEMENT.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Employees on WLAN Corp must be placed in VLAN 10, which has the dynamic interface corp. Clients associate but receive addresses from the management subnet. Which change corrects this?',
    exhibit: {
      kind: 'table',
      columns: ['WLANs > Edit: General tab', 'Value'],
      rows: [
        ['Profile Name', 'Corp'],
        ['Type', 'WLAN'],
        ['SSID', 'Corp-WiFi'],
        ['Status', 'Enabled'],
        ['Security Policies', '[WPA2][Auth(PSK)]'],
        ['Radio Policy', 'All'],
        ['Interface/Interface Group(G)', 'management'],
        ['Broadcast SSID', 'Enabled'],
      ],
    },
    options: [
      'Set Interface/Interface Group(G) to the VLAN 10 dynamic interface',
      'Set Radio Policy to 802.11a to move clients to the 5 GHz band',
      'Clear Broadcast SSID so the WLAN stops advertising its name',
      'Change the Layer 2 security method to 802.1X with a RADIUS server',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The Interface/Interface Group(G) field on the General tab decides which interface, and therefore which VLAN and subnet, the WLAN\'s clients use. It still shows the default **management** interface, which is why clients get management-subnet addresses. Radio policy, SSID broadcast and the Layer 2 security method do not influence VLAN placement.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. Users must connect to this WLAN with a shared passphrase, but they are prompted for a username and password. What must the administrator change?',
    exhibit: {
      kind: 'table',
      columns: ['WLANs > Edit: Security tab, Layer 2', 'Value'],
      rows: [
        ['Layer 2 Security', 'WPA+WPA2'],
        ['WPA Policy', 'Disabled'],
        ['WPA2 Policy', 'Enabled'],
        ['WPA2 Encryption', 'AES enabled, TKIP disabled'],
        ['Authentication Key Management', '802.1X: Enabled · PSK: Disabled'],
        ['Layer 3 Security', 'None'],
      ],
    },
    options: [
      'Enable the WPA policy and select TKIP',
      'Clear 802.1X, enable PSK and enter the passphrase',
      'Set Layer 3 Security to a web policy',
      'Select a RADIUS server on the AAA Servers tab',
    ],
    answer: 1,
    difficulty: 2,
    explanation:
      'The exhibit shows WPA2 with AES but **802.1X** key management enabled and PSK disabled, which is the default for a new WLAN and is why users are asked for credentials. Clear 802.1X, enable **PSK**, choose the key format and enter the passphrase. WPA with TKIP is weaker and unrelated, a Layer 3 web policy is for guest portals, and a RADIUS server is only used with 802.1X.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. Users of the VOICE WLAN report choppy calls when the cell is busy. Which change gives voice traffic the best treatment?',
    exhibit: {
      kind: 'table',
      columns: ['WLANs > Edit: QoS tab', 'Value'],
      rows: [
        ['WLAN', 'VOICE'],
        ['Quality of Service (QoS)', 'Silver (best effort)'],
        ['WMM Policy', 'Allowed'],
        ['Security Policies', '[WPA2][Auth(PSK)]'],
      ],
    },
    options: [
      'Set WMM Policy to Disabled',
      'Set the QoS profile to Bronze (background)',
      'Set the QoS profile to Platinum (voice)',
      'Set the QoS profile to Gold (video)',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The QoS profile is a ceiling for the WLAN: with **Silver**, voice packets get no better than best-effort treatment. Voice needs **Platinum** (WMM voice). Bronze would make things worse, Gold is meant for video, and disabling WMM removes the access-category priorities that voice depends on (and high-throughput 802.11n/ac rates require WMM).',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. ISE returns Tunnel-Private-Group-ID 30 for contractor logins on WLAN CORP, which is mapped to VLAN 10, but contractors still land in VLAN 10. What is required?',
    exhibit: {
      kind: 'table',
      columns: ['WLANs > Edit: Advanced tab', 'Value'],
      rows: [
        ['Allow AAA Override', 'Disabled'],
        ['Enable Session Timeout', '1800 seconds'],
        ['Client Exclusion', 'Enabled (60 seconds)'],
        ['DHCP Addr. Assignment Required', 'Disabled'],
        ['FlexConnect Local Switching', 'Disabled'],
        ['Maximum Allowed Clients', '0'],
      ],
    },
    options: [
      'Enable FlexConnect Local Switching',
      'Enable DHCP Addr. Assignment Required',
      'Reduce the session timeout',
      'Enable Allow AAA Override',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'Attributes returned by RADIUS, such as the VLAN in Tunnel-Private-Group-ID, are honored only when **Allow AAA Override** is enabled; the exhibit shows it disabled, so contractors stay in the WLAN\'s own VLAN 10. VLAN 30 must also exist as an interface on the controller and be allowed on the switch trunk. FlexConnect local switching, DHCP-required and the session timeout have no effect on VLAN assignment.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'An administrator wants to secure a WLAN with WPA2-PSK. Which two actions are needed on the Security tab? (Choose two.)',
    options: [
      'Select PSK as the authentication key management and enter the key',
      'Select 802.1X as the authentication key management',
      'Add a RADIUS server on the AAA Servers sub-tab',
      'Enable the WPA2 policy with AES encryption',
      'Set Layer 3 security to a web authentication policy',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'WPA2-PSK needs the **WPA2 policy with AES** and **PSK** as the authentication key management, with the key entered in ASCII or HEX. 802.1X key management and a RADIUS server belong to WPA2-Enterprise, and a Layer 3 web policy is for guest portals.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'How many hexadecimal digits must a pre-shared key contain when HEX is chosen as the PSK format on a WLC? (Enter the number.)',
    answers: ['64'],
    placeholder: 'number of digits',
    difficulty: 1,
    explanation:
      'A HEX PSK is exactly **64** hexadecimal digits (a full 256-bit key). An ASCII passphrase is 8 to 63 characters and is converted into the 256-bit key.',
  },
  {
    id: 'e8',
    type: 'order',
    stem: 'Put the steps for building a WPA2-PSK WLAN on an AireOS controller in the correct order.',
    items: [
      'Create a dynamic interface for the client VLAN (CONTROLLER > Interfaces)',
      'Click WLANs > Create New and enter the profile name, SSID and WLAN ID',
      'On the General tab, select the interface and tick Status: Enabled',
      'On the Security tab, choose WPA2 with AES and PSK key management, then enter the key',
      'Click Apply and then Save Configuration',
    ],
    difficulty: 2,
    explanation:
      'Prerequisites come first: the dynamic interface must exist before you can select it. Then create the WLAN, enable and map it on the General tab, set WPA2, AES and PSK on the Security tab, and finish by applying and saving the configuration so it survives a reboot.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each tab of the AireOS WLAN edit page to its content.',
    pairs: [
      { left: 'General', right: 'Profile name, SSID, status and interface mapping' },
      { left: 'Security', right: 'Layer 2 method, key management and AAA servers' },
      { left: 'QoS', right: 'Platinum, Gold, Silver or Bronze profile' },
      { left: 'Policy-Mapping', right: 'Local policies applied by device type' },
      { left: 'Advanced', right: 'AAA override, session timeout and client exclusion' },
    ],
    difficulty: 2,
    explanation:
      'General holds identity and VLAN mapping, Security holds authentication and encryption choices plus the AAA servers, QoS holds the metal profile, Policy-Mapping attaches local policies keyed on the device type, and Advanced holds behavior options.',
  },
  {
    id: 'e10',
    type: 'categorize',
    stem: 'Drag each setting to the tab of the AireOS WLAN edit page where it is configured.',
    categories: ['General tab', 'Security tab', 'QoS tab', 'Advanced tab'],
    items: [
      { text: 'SSID', category: 0 },
      { text: 'Interface/Interface Group', category: 0 },
      { text: 'Layer 2 security (WPA2)', category: 1 },
      { text: 'PSK key management', category: 1 },
      { text: 'AAA server selection', category: 1 },
      { text: 'Platinum profile', category: 2 },
      { text: 'WMM policy', category: 2 },
      { text: 'Allow AAA Override', category: 3 },
      { text: 'Client Exclusion', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'SSID and interface mapping are on the General tab; Layer 2 security, key management and the AAA server selection are on the Security tab; the metal profile and WMM policy are on the QoS tab; AAA override and client exclusion are on the Advanced tab.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two objects does a Catalyst 9800 policy tag pair together? (Choose two.)',
    options: ['WLAN profile', 'RF profile', 'Policy profile', 'AP join profile', 'Flex profile'],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A **policy tag** contains pairs of a **WLAN profile** and a **policy profile**. RF profiles are referenced by RF tags, and the AP join profile and flex profile are referenced by site tags.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. WLAN CORP-PSK is up on the controller, but clients cannot see the SSID near AP-LOBBY. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `WLC1# show wlan summary
Number of WLANs: 1

ID   Profile Name                     SSID                             Status Security
-----------------------------------------------------------------------------------------
10   CORP-PSK                         CORP-PSK                         UP     [WPA2][PSK][AES]

WLC1# show ap tag summary
Number of APs: 1

AP Name        AP Mac           Site Tag Name      Policy Tag Name      RF Tag Name      Misconfigured  Tag Source
-----------------------------------------------------------------------------------------------------------------
AP-LOBBY       00a2.eeb4.1c20   default-site-tag   default-policy-tag   default-rf-tag   No             Default`,
    },
    options: [
      'AP-LOBBY uses default-policy-tag, which does not include the CORP-PSK WLAN',
      'The WLAN uses PSK security, which an AP cannot broadcast in its beacons',
      'AP-LOBBY has not joined the controller and cannot get the WLAN profile',
      'WLAN ID 10 is not a supported ID on the Catalyst 9800 wireless controller',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The tag summary lists AP-LOBBY, so it has joined the controller, but it carries **default-policy-tag**, which does not contain CORP-PSK. The WLAN is UP with valid WPA2-PSK security, so it just is not paired to the AP: create a policy tag with the WLAN profile and policy profile and assign it to the AP. PSK is broadcast like any other security type, and WLAN ID 10 is valid.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. Which ports does WLC1 use by default to send authentication and accounting messages to ISE for the 802.1X WLAN?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.6,
        nodes: [
          { id: 'cl', icon: 'laptop', label: 'Employee', x: 1.0, y: 1.8 },
          { id: 'ap', icon: 'ap', label: 'LAP1', x: 3.0, y: 1.8 },
          { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 5.2, y: 1.8, tone: 'accent' },
          { id: 'ise', icon: 'server', label: 'ISE', sub: '10.1.100.20', x: 8.6, y: 1.8 },
        ],
        links: [
          { from: 'cl', to: 'ap', style: 'wireless', label: 'WLAN CORP' },
          { from: 'ap', to: 'wlc', style: 'dashed', label: 'CAPWAP' },
          { from: 'wlc', to: 'ise', label: 'RADIUS', tone: 'accent' },
        ],
      },
    },
    options: [
      'TCP 49 for both',
      'UDP 5246 for authentication and UDP 5247 for accounting',
      'UDP 1812 for authentication and UDP 1813 for accounting',
      'UDP 161 for authentication and UDP 162 for accounting',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'RADIUS uses UDP **1812** for authentication and UDP **1813** for accounting by default (the legacy ports 1645 and 1646 exist only for old servers). TCP 49 is TACACS+, UDP 5246 and 5247 are the CAPWAP control and data ports, and UDP 161 and 162 are SNMP.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. WLAN GUEST is mapped to the dynamic interface guest (VLAN 20) and WLAN CORP to VLAN 10. Corporate clients work, but guests associate and get no IP address. The WLC connects to Gi1/0/1. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi1/0/1     on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi1/0/1     10,99

Port        Vlans allowed and active in management domain
Gi1/0/1     10,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi1/0/1     10,99`,
    },
    options: [
      'The WLC management interface must use VLAN 1',
      'The guest WLAN must use PSK instead of 802.1X',
      'Client exclusion has blocked every guest client',
      'VLAN 20 is not allowed on the trunk to the WLC',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The trunk toward the WLC allows only VLANs 10 and 99, so frames for guest VLAN 20 never reach the controller and guests cannot get DHCP answers while VLAN 10 users work. Add VLAN 20 to the allowed list. The management interface is in VLAN 99 and unaffected, the authentication method does not control addressing, and client exclusion would block individual clients, not all guests, and would not explain the corporate/guest difference.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'A user enters the wrong PSK several times, then types the correct key but still cannot connect for about a minute. Which WLAN feature explains this?',
    options: ['AAA override', 'Client exclusion', 'Session timeout', 'P2P blocking'],
    answer: 1,
    difficulty: 2,
    explanation:
      '**Client exclusion** temporarily blocks a client after repeated failures, for an exclusion timeout that defaults to 60 seconds. AAA override applies RADIUS attributes, the session timeout forces re-authentication after a set time, and P2P blocking stops client-to-client traffic.',
  },
  {
    id: 'e16',
    type: 'match',
    stem: 'Match each Advanced-tab setting to its effect.',
    pairs: [
      { left: 'Allow AAA Override', right: 'RADIUS can assign a VLAN, QoS or ACL per user' },
      { left: 'Client Exclusion', right: 'Temporarily blocks a client after repeated failures' },
      { left: 'DHCP Addr. Assignment Required', right: 'A client with a static IP address cannot pass traffic' },
      { left: 'Session Timeout', right: 'Forces clients to re-authenticate after a set time' },
      { left: 'FlexConnect Local Switching', right: 'Branch AP bridges client traffic onto a local VLAN' },
      { left: 'Maximum Allowed Clients', right: 'Limits the number of clients on the WLAN' },
    ],
    difficulty: 2,
    explanation:
      'These settings change behavior rather than identity or security: AAA override accepts RADIUS-assigned attributes, client exclusion rate-limits failing clients, DHCP-required rejects statically addressed clients, the session timeout limits session length, local switching keeps branch traffic off the WAN, and the client limit caps the WLAN size.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'What is the effect of clearing Broadcast SSID on a WLAN?',
    options: [
      'The SSID is left out of beacons, but this is not real security',
      'The WLAN stops working until Broadcast SSID is enabled again',
      'The WLAN traffic is encrypted with AES between client and AP',
      'The 5 GHz radios advertise the WLAN, but the 2.4 GHz radios do not',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Clearing Broadcast SSID removes the name from beacons, but the SSID still appears in probe and association frames and is easy to discover, so it is **not** security. The WLAN keeps working for clients configured with the name, encryption is a Layer 2 security setting, and band selection is the Radio Policy.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two settings are configured in a Catalyst 9800 policy profile? (Choose two.)',
    options: [
      'The client VLAN',
      'The SSID name and WLAN ID',
      'QoS and AAA override settings',
      'The WPA2 pre-shared key',
      'The RF profile for each band',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'The **policy profile** defines how client traffic is treated: the VLAN, QoS and AVC, AAA override, timeouts and central or local switching. The SSID name, WLAN ID and PSK belong to the WLAN profile, and RF profiles belong to the RF tag.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Clients on a WLAN mapped to this interface cannot obtain addresses or reach other networks. What is wrong with the interface configuration?',
    exhibit: {
      kind: 'cli',
      text: `(Cisco Controller) >show interface detailed corp

Interface Name................................... corp
IP Address....................................... 10.10.10.5
IP Netmask....................................... 255.255.255.0
IP Gateway....................................... 10.10.20.1
VLAN............................................. 10
Primary DHCP Server.............................. 10.1.100.30
Secondary DHCP Server............................ Unconfigured
AP Manager....................................... No
Guest Interface.................................. No`,
    },
    options: [
      'The VLAN ID must be 1',
      'The netmask must be 255.255.255.255',
      'The gateway 10.10.20.1 is outside the interface subnet 10.10.10.0/24',
      'The DHCP server must be in the same subnet as the interface',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The interface address 10.10.10.5/24 belongs to network 10.10.10.0/24, but the gateway 10.10.20.1 is in another subnet, so the WLC cannot use it as a next hop. The gateway must be inside the interface subnet (for example 10.10.10.1). The DHCP server may be in a different subnet because the WLC relays requests to it, the VLAN ID need not be 1, and a /32 mask would be wrong.',
  },
  {
    id: 'e20',
    type: 'multi',
    stem: 'Refer to the exhibit. Branch users must keep reaching the local file server when the WAN to headquarters fails. Which two actions are required? (Choose two.)',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.4,
        nodes: [
          { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 1.0, y: 1.4, tone: 'accent' },
          { id: 'wan', icon: 'cloud', label: 'WAN', x: 3.1, y: 1.4 },
          { id: 'brr', icon: 'router', label: 'BR-R', x: 5.2, y: 1.4 },
          { id: 'bsw', icon: 'switch', label: 'BR-SW', x: 7.2, y: 1.4 },
          { id: 'srv', icon: 'server', label: 'File server', x: 5.8, y: 3.4 },
          { id: 'ap', icon: 'ap', label: 'AP-BR1', sub: 'local mode', x: 8.4, y: 3.4 },
        ],
        links: [
          { from: 'wlc', to: 'wan' },
          { from: 'wan', to: 'brr' },
          { from: 'brr', to: 'bsw' },
          { from: 'bsw', to: 'srv' },
          { from: 'bsw', to: 'ap' },
        ],
      },
    },
    options: [
      'Set the WLAN QoS profile to Platinum (voice)',
      'Set AP-BR1 to FlexConnect mode',
      'Enable Allow AAA Override on the Advanced tab',
      'Enable FlexConnect Local Switching on the WLAN Advanced tab',
      'Remove Layer 2 security from the WLAN settings',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'Two things are needed: the AP must be in **FlexConnect mode** (a local-mode AP drops its clients when the WAN fails), and the WLAN must have **FlexConnect Local Switching** enabled on the Advanced tab so client traffic is bridged onto the branch VLAN instead of being tunneled to headquarters. QoS, AAA override and Layer 2 security do not provide WAN-outage survivability.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Both RADIUS servers are configured under SECURITY > AAA > RADIUS > Authentication and both are responding. To which server does WLC1 send an authentication request first?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 3.8,
        nodes: [
          { id: 'wlc', icon: 'wlc', label: 'WLC1', x: 2.0, y: 1.9, tone: 'accent' },
          { id: 'r1', icon: 'server', label: 'RADIUS-A', sub: 'Server Index 2 · 10.1.100.20', x: 7.6, y: 0.9 },
          { id: 'r2', icon: 'server', label: 'RADIUS-B', sub: 'Server Index 1 · 10.1.100.21', x: 7.6, y: 2.9 },
        ],
        links: [
          { from: 'wlc', to: 'r1', label: 'UDP 1812' },
          { from: 'wlc', to: 'r2', label: 'UDP 1812' },
        ],
      },
    },
    options: [
      'RADIUS-A, because it has the lower IP address',
      'RADIUS-B, because Server Index 1 is tried first',
      'Both servers at the same time',
      'RADIUS-A, because the highest index is tried first',
    ],
    answer: 1,
    difficulty: 1,
    explanation:
      'The Server Index sets priority: **index 1** is tried first, and the controller falls back to the next index only if that server stops responding. Priority does not depend on the IP address or on which entry was created first, and the WLC does not query both servers at once.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'The WLC can reach the RADIUS server and the user accounts are valid, yet every 802.1X authentication fails. The RADIUS server logs show packets from the WLC that fail message validation. What is the most likely cause?',
    options: [
      'The WLAN uses the Silver QoS profile instead of the Platinum profile',
      'Broadcast SSID is disabled on the WLAN that carries the 802.1X users',
      'The WLC sends the RADIUS requests to UDP 5246 instead of UDP 1812',
      'The shared secret on the WLC does not match the one on the RADIUS server',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'With a **shared secret mismatch** the server cannot validate the RADIUS message authenticator, so it discards or rejects the requests even though the network path and user accounts are fine. QoS profile and SSID broadcast are unrelated to RADIUS, and the CAPWAP control port 5246 is not used for RADIUS, which defaults to UDP 1812.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. Guests report that the GUEST SSID is not available. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `WLC1# show wlan summary
Number of WLANs: 2

ID   Profile Name                     SSID                             Status Security
-----------------------------------------------------------------------------------------
1    CORP                             CORP                             UP     [WPA2][802.1x][AES]
2    GUEST                            GUEST                            DOWN   [WPA2][PSK][AES]`,
    },
    options: [
      'WLAN 2 is administratively disabled (shut down)',
      'WLAN 2 uses PSK, which the Catalyst 9800 cannot broadcast',
      'WLAN 2 must use 802.1X to be broadcast',
      'WLAN ID 2 must be higher than the ID of the CORP WLAN',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Status **DOWN** in `show wlan summary` means the WLAN profile is administratively disabled (shut down), so no AP broadcasts it; enter `no shutdown` under the WLAN. PSK is broadcast like any other security type, 802.1X is not required, and WLAN IDs have no ordering requirement.',
  },
  {
    id: 'e24',
    type: 'single',
    stem: 'Refer to the exhibit. Clients on WLAN CORP-PSK associate successfully but obtain addresses from the VLAN 1 subnet instead of VLAN 10. What is missing from the configuration?',
    exhibit: {
      kind: 'cli',
      text: `WLC1# show running-config | section ^wlan|^wireless profile policy|^wireless tag policy
wlan CORP-PSK 10 CORP-PSK
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 Str0ngPassphrase26
 no shutdown
wireless profile policy CORP-POLICY
 central switching
 no shutdown
wireless tag policy HQ-TAG
 wlan CORP-PSK policy CORP-POLICY`,
    },
    options: [
      'The WLAN must be paired with a different RF tag that defines VLAN 10',
      'The WLAN profile must specify the client VLAN with the vlan command',
      'The policy profile must specify the client VLAN with the vlan command',
      'The policy tag must be removed from the AP and the AP must be rebooted',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'On the Catalyst 9800 the client VLAN belongs to the **policy profile**, not the WLAN profile. CORP-POLICY has no `vlan 10` line, so clients fall into the default VLAN 1. RF tags control radio behavior, the WLAN profile defines only the SSID and security, and removing the policy tag would stop the AP from broadcasting the WLAN at all.',
  },
];
