import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Configuring a WLAN in the WLC GUI',
    subtitle: 'AireOS tabs, Catalyst 9800 profiles and tags, and a WPA2-PSK WLAN end to end',
    notes:
      "The CCNA does not expect you to memorize every checkbox on a wireless LAN controller, but it does expect you to read a screenshot of one and know what each setting does. This deck walks through the classic **AireOS** WLC GUI, used on controllers such as the 3504, 5520 and 8540 and in most exam material, and maps each setting to its home on the current **Catalyst 9800** controller, which runs IOS XE and organizes the same settings into **profiles and tags**. You will build a WLAN from scratch: add a RADIUS server, create a dynamic interface for the VLAN, create the WLAN, secure it with **WPA2-PSK** or **802.1X**, pick a QoS profile and tune the Advanced tab. The content maps to CCNA v1.1 topics 2.9 (interpret the WLAN GUI configuration) and 5.10 (configure and verify a WLAN in the GUI using WPA2 PSK) and to domain 2 of the v2.0 blueprint. The settings themselves are the same for both exam versions, so nothing here is version-specific.",
  },
  {
    kind: 'bullets',
    title: 'What a WLAN ties together',
    bullets: [
      'A **WLAN** = SSID + security + VLAN + QoS + options',
      'Lightweight APs tunnel client traffic to the WLC in **CAPWAP**',
      'The WLC connects to its switch with an **802.1Q trunk**',
      'Each WLAN maps to a client VLAN through an **interface**',
      '802.1X WLANs also need a **RADIUS** server such as ISE',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 4.5,
      nodes: [
        { id: 'pc', icon: 'laptop', label: 'Laptop', x: 1, y: 1.2 },
        { id: 'ph', icon: 'phone', label: 'IP phone', x: 1, y: 3.4 },
        { id: 'ap', icon: 'ap', label: 'LAP1', sub: 'local mode', x: 3.3, y: 2.3 },
        { id: 'sw', icon: 'l3switch', label: 'SW1', x: 5.7, y: 2.3 },
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'mgmt 10.99.99.5', x: 8.3, y: 1.1, tone: 'accent' },
        { id: 'ise', icon: 'server', label: 'ISE', sub: '10.1.100.20', x: 8.3, y: 3.4 },
      ],
      links: [
        { from: 'pc', to: 'ap', style: 'wireless', label: 'SSID CORP' },
        { from: 'ph', to: 'ap', style: 'wireless', label: 'SSID VOICE' },
        { from: 'ap', to: 'sw', label: 'CAPWAP' },
        { from: 'sw', to: 'wlc', style: 'thick', label: '802.1Q trunk' },
        { from: 'sw', to: 'ise' },
      ],
    },
    notes:
      "Before clicking through menus, get the architecture straight, because every GUI setting maps to one piece of it. A **WLAN** on a controller is a bundle: an SSID that clients see, a security policy, the VLAN where client traffic lands, a QoS level and a set of advanced options. Lightweight APs in local mode do not switch client traffic themselves; they encapsulate client frames in a **CAPWAP** tunnel to the WLC, so the controller is where frames leave the wireless world and enter a VLAN. The WLC therefore connects to its switch with an **802.1Q trunk** carrying the management VLAN and every client VLAN. On AireOS, the object that binds a WLAN to a VLAN is an **interface**: the management interface or a **dynamic interface** you create for each client VLAN. For 802.1X WLANs the WLC also needs a **RADIUS** server. Keep this picture in mind: when a client associates but gets no IP address, the usual culprits are the interface mapping, a VLAN missing from the trunk, or DHCP.",
  },
  {
    kind: 'table',
    title: 'AireOS GUI tour: the top menu bar',
    columns: ['Menu', 'What you configure or view there'],
    rows: [
      ['**MONITOR**', 'Summary dashboard: controller, APs, clients, rogues, statistics'],
      ['**WLANs**', 'Create and edit WLANs (five tabs); AP groups under WLANs > Advanced'],
      ['**CONTROLLER**', 'Interfaces and interface groups, ports, NTP, mobility, general settings'],
      ['**WIRELESS**', 'Access points and radios, RF profiles, FlexConnect groups, QoS profiles'],
      ['**SECURITY**', 'AAA (RADIUS, TACACS+, LDAP, local users), ACLs, protection policies, web auth'],
      ['**MANAGEMENT**', 'SNMP, HTTP/HTTPS, Telnet/SSH, syslog, local management users'],
      ['**COMMANDS**', 'Upload/download files, reboot, reset to factory defaults'],
    ],
    caption: 'Client-facing SSID settings live under WLANs; the box itself lives under CONTROLLER and MANAGEMENT.',
    notes:
      "The AireOS GUI has a menu bar across the top, and exam questions often show a screenshot and ask where a task is performed. **MONITOR** is read-only status: how many APs have joined, how many clients are connected and on which WLANs, rogue detections and statistics. **WLANs** holds the WLAN list; clicking a WLAN ID opens the edit page with its five tabs, and WLANs > Advanced holds **AP groups**, which control which APs advertise which WLANs. **CONTROLLER** is the controller's own plumbing: its interfaces (management, virtual, service port and the dynamic interfaces you add), interface groups, physical ports, NTP and mobility. **WIRELESS** is about the APs and radios: per-AP settings, AP modes, RF parameters, FlexConnect groups and the QoS profile definitions. **SECURITY** holds AAA servers, local user databases, ACLs and wireless protection policies such as the client exclusion triggers. **MANAGEMENT** controls how administrators reach the box (HTTPS, SSH, SNMP, syslog), and **COMMANDS** handles file transfers and reboots. A quick memory aid: settings about the SSID live under WLANs, settings about the box live under CONTROLLER and MANAGEMENT.",
  },
  {
    kind: 'steps',
    title: 'Workflow: building a new WLAN',
    steps: [
      { title: 'Add the RADIUS server', text: 'SECURITY > AAA > RADIUS > Authentication (802.1X WLANs only)' },
      { title: 'Create a dynamic interface', text: 'CONTROLLER > Interfaces > New: VLAN, IP address, gateway, DHCP server' },
      { title: 'Create the WLAN', text: 'WLANs > Create New > Go: type, profile name, SSID, WLAN ID' },
      { title: 'Configure security', text: 'Security tab: Layer 2 method, key management, AAA servers' },
      { title: 'Choose QoS and advanced options', text: 'QoS tab profile; Advanced tab settings' },
      { title: 'Enable, apply and verify', text: 'General tab Status: Enabled; Apply; Save Configuration; check MONITOR > Clients' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'SECURITY', sub: 'RADIUS server', shape: 'pill' },
        { id: 'b', label: 'CONTROLLER', sub: 'dynamic interface' },
        { id: 'c', label: 'WLANs', sub: 'WLAN + five tabs', tone: 'accent' },
        { id: 'd', label: 'MONITOR', sub: 'verify clients', shape: 'round' },
      ],
    },
    notes:
      "This is the order Cisco's own guides use, and it is also the order that avoids dead ends. If you create the WLAN first, you reach the General tab and find that the dynamic interface you need does not exist yet, or you reach the AAA Servers tab and find no RADIUS server to select. So start with the prerequisites. **Step 1**: define the RADIUS server under SECURITY (needed only for 802.1X WLANs). **Step 2**: create a dynamic interface under CONTROLLER for the client VLAN. **Step 3**: create the WLAN itself with a profile name, SSID and WLAN ID. **Steps 4 and 5**: work through the Security, QoS and Advanced tabs. **Step 6**: make sure the Status checkbox is enabled, click **Apply**, and verify that clients appear under MONITOR > Clients with the right WLAN, VLAN and IP address. Remember that nothing takes effect until you click Apply on each page, and that changes live in the running configuration until you click **Save Configuration** at the top of the page, so save before any reboot.",
  },
  {
    kind: 'diagram',
    title: 'WLAN-to-VLAN mapping with dynamic interfaces',
    diagram: {
      type: 'flow',
      width: 10,
      height: 6,
      nodes: [
        { id: 'w1', label: 'WLAN CORP', sub: 'ID 1', x: 1.6, y: 1.2 },
        { id: 'w2', label: 'WLAN GUEST', sub: 'ID 2', x: 1.6, y: 3 },
        { id: 'w3', label: 'WLAN VOICE', sub: 'ID 3', x: 1.6, y: 4.8 },
        { id: 'i1', label: 'Interface corp', sub: 'VLAN 10 · 10.10.10.5/24', x: 5, y: 1.2 },
        { id: 'i2', label: 'Interface guest', sub: 'VLAN 20 · 10.20.20.5/24', x: 5, y: 3 },
        { id: 'i3', label: 'Interface voice', sub: 'VLAN 30 · 10.30.30.5/24', x: 5, y: 4.8 },
        { id: 't', label: '802.1Q trunk', sub: 'VLANs 10, 20, 30, 99', x: 8.5, y: 3, shape: 'pill', tone: 'accent' },
      ],
      edges: [
        { from: 'w1', to: 'i1' },
        { from: 'w2', to: 'i2' },
        { from: 'w3', to: 'i3' },
        { from: 'i1', to: 't' },
        { from: 'i2', to: 't' },
        { from: 'i3', to: 't' },
      ],
    },
    caption: 'The WLAN points to an interface; the interface carries the VLAN tag onto the trunk.',
    notes:
      "On AireOS, a WLAN does not reference a VLAN number directly; it references an **interface**, and the interface carries the VLAN tag. A **dynamic interface** is the controller's equivalent of a switch SVI for a client VLAN: it has a name, a VLAN ID, an IP address in that subnet, a default gateway and a DHCP server address. When a client on WLAN CORP sends a frame, the WLC removes the CAPWAP and 802.11 headers, tags the frame for VLAN 10 and sends it out the trunk. The interface IP address is also used when the WLC relays the client's DHCP request to the configured DHCP server. Three consequences for troubleshooting follow. First, if a WLAN is left on the **management** interface, its clients land in the management VLAN. Second, the switch port facing the WLC must be a trunk that **allows** every client VLAN. Third, the switch or router must route each VLAN's subnet. An **interface group** lets one WLAN spread its clients across several dynamic interfaces, which is useful for very large WLANs such as a campus student SSID.",
  },
  {
    kind: 'table',
    title: 'Creating a dynamic interface',
    columns: ['Field', 'Example', 'Purpose'],
    rows: [
      ['Interface Name', '`corp`', 'Name you select on the WLAN General tab'],
      ['VLAN Id', '`10`', '802.1Q tag used on the trunk'],
      ['Port Number', '`1` (not needed with LAG)', 'Physical port that carries the VLAN'],
      ['IP Address / Netmask', '`10.10.10.5` / `255.255.255.0`', 'WLC address in the client subnet'],
      ['Gateway', '`10.10.10.1`', 'Router or SVI for that subnet'],
      ['Primary DHCP Server', '`10.1.100.30`', 'Where the WLC relays client DHCP requests'],
    ],
    caption: 'CONTROLLER > Interfaces > New: name and VLAN ID first; address fields appear after Apply.',
    notes:
      "Creating a dynamic interface takes two screens. On CONTROLLER > Interfaces, click **New**, type an **interface name** and a **VLAN ID**, and click Apply. The edit page then asks for the details: the physical **port** (not needed when the ports are bundled with LAG), the interface **IP address and netmask** in the client subnet, the **gateway** for that subnet, and the **primary DHCP server**, optionally with a secondary. Every one of these values must agree with the wired network. The VLAN ID must exist on the switch and be allowed on the trunk; the IP address must be unused and inside the subnet; the gateway must be the router or SVI for that VLAN; and the DHCP server needs a scope for the subnet. A classic exam exhibit shows a dynamic interface whose gateway is in a different subnet from its IP address, or whose VLAN ID does not match the switch, and asks why clients cannot obtain an address. Note that the Catalyst 9800 has no dynamic interfaces: a Layer 2 VLAN on the trunk is enough, and the upstream switch normally relays DHCP.",
  },
  {
    kind: 'steps',
    title: 'Adding a RADIUS server under SECURITY > AAA',
    steps: [
      { title: 'Open SECURITY > AAA > RADIUS > Authentication', text: 'Click New to add a server entry' },
      { title: 'Set the Server Index and IP address', text: 'The index is the priority; index 1 is tried first' },
      { title: 'Enter the shared secret', text: 'ASCII or Hex; must match the WLC entry on the RADIUS server' },
      { title: 'Keep port 1812 and Server Status Enabled', text: 'Leave Network User checked for wireless client authentication' },
      { title: 'Add accounting if needed', text: 'SECURITY > AAA > RADIUS > Accounting on port 1813' },
      { title: 'Select the server on the WLAN', text: 'WLAN > Security > AAA Servers tab' },
    ],
    diagram: {
      type: 'topology',
      width: 8,
      height: 3,
      nodes: [
        { id: 'wlc', icon: 'wlc', label: 'WLC1', sub: 'mgmt 10.99.99.5', x: 1.5, y: 1.4 },
        { id: 'ise', icon: 'server', label: 'ISE', sub: '10.1.100.20', x: 6.5, y: 1.4 },
      ],
      links: [{ from: 'wlc', to: 'ise', label: 'RADIUS UDP 1812 / 1813', tone: 'accent' }],
      annotations: [{ x: 4, y: 2.6, text: 'Same shared secret on both ends' }],
    },
    notes:
      "802.1X WLANs need somewhere to send credentials, so the RADIUS server comes first. Under **SECURITY > AAA > RADIUS > Authentication**, click New. The **Server Index** sets priority: index 1 is tried first, and the next server is used only if it stops responding. Enter the server's IP address and the **shared secret**, the password that protects RADIUS messages between the WLC and the server. The same secret must be configured on the server, where the WLC is added as a network device (RADIUS client) using the address the WLC sends RADIUS from, normally its management interface. A mismatched secret is one of the most common reasons authentications fail. Leave the port at **1812** unless the server uses the legacy 1645, keep **Server Status** enabled, and keep **Network User** checked so the server is used for wireless client authentication rather than only for administrator logins. Add the server under **Accounting** on port **1813** if you want session records. Finally, select the server on the WLAN's **AAA Servers** tab so that WLAN sends its 802.1X authentications there.",
  },
  {
    kind: 'table',
    title: 'The WLAN edit page: five tabs',
    columns: ['Tab', 'Purpose', 'Key settings'],
    rows: [
      ['**General**', 'Identity and VLAN', 'Profile name, SSID, Status, Interface/Interface Group, Broadcast SSID, Radio Policy'],
      ['**Security**', 'Who can join and how', 'Layer 2 (WPA2/WPA3, PSK or 802.1X), Layer 3 (web policy), AAA Servers'],
      ['**QoS**', 'Treatment of traffic', 'Platinum / Gold / Silver / Bronze, WMM policy, AVC, bandwidth contracts'],
      ['**Policy-Mapping**', 'Device-based local policies', 'Priority index + local policy (for example by device type)'],
      ['**Advanced**', 'Behavior options', 'AAA override, session timeout, client exclusion, DHCP, FlexConnect, max clients'],
    ],
    caption: 'Identify the tab in a screenshot first; it often eliminates half the answers.',
    notes:
      "Every AireOS WLAN is edited through five tabs, and questions frequently ask which tab holds a given setting. **General** is identity: profile name, SSID, the Status checkbox that enables the WLAN, the interface or interface group that maps it to a VLAN, whether the SSID is broadcast, and which radios carry it. **Security** answers who can join and how; its sub-tabs are Layer 2 (WPA2 or WPA3, PSK or 802.1X, MAC filtering), Layer 3 (web authentication policies for guest portals) and AAA Servers (which RADIUS servers this WLAN uses). **QoS** sets the metal QoS profile and related options such as WMM and Application Visibility and Control. **Policy-Mapping** attaches **local policies**: rules that match a client's device type, learned through device profiling (for example an iPhone or a Windows laptop), and apply a VLAN, ACL, QoS level or session timeout, each with a priority index. **Advanced** is the catch-all for behavior options. When you study a screenshot, first identify which tab is shown; that alone often eliminates half of the answer choices.",
  },
  {
    kind: 'table',
    title: 'WLANs > Create New and the General tab',
    columns: ['Setting', 'Meaning', 'Notes'],
    rows: [
      ['Type', 'WLAN, Guest LAN or Remote LAN', 'Choose **WLAN** for an SSID'],
      ['Profile Name', 'Name of the WLAN on the controller', 'Local only; never advertised'],
      ['SSID', 'Network name clients see', 'Up to 32 characters; may differ from the profile name'],
      ['ID', 'WLAN ID', 'IDs 1–16 are included in the default AP group'],
      ['Status', 'Enabled checkbox', 'Must be **Enabled** or no AP broadcasts the SSID'],
      ['Interface/Interface Group(G)', 'VLAN mapping', 'Defaults to `management`'],
      ['Broadcast SSID', 'SSID included in beacons', 'Enabled by default'],
      ['Radio Policy', 'Bands that carry the WLAN', 'Default: All'],
    ],
    caption: 'The General tab also summarizes security, for example [WPA2][Auth(PSK)].',
    notes:
      "Clicking **Create New** and **Go** on the WLANs page opens a short form: the **type** (WLAN for a normal SSID), a **profile name**, the **SSID** and a **WLAN ID**. The profile name is how the controller and administrators refer to the WLAN; the SSID is the network name that clients see in beacons and probe responses. They are often identical, but they do not have to be, and exam exhibits sometimes use different values to test whether you know which one clients see. After Apply, the edit page opens on the **General** tab. The **Status** checkbox must be checked, because a disabled WLAN is never broadcast by any AP. The **Interface/Interface Group(G)** drop-down maps the WLAN to a VLAN and defaults to the management interface, a frequent mistake. **Broadcast SSID** is enabled by default; unchecking it hides the SSID from beacons, which is not real security because the name still appears in client probes and association requests. **Radio Policy** restricts the WLAN to particular bands. The WLAN ID matters too: on AireOS only WLAN IDs 1–16 are automatically advertised by APs in the default AP group.",
  },
  {
    kind: 'table',
    title: 'Security > Layer 2: a WPA2-PSK WLAN',
    columns: ['Setting', 'Value for WPA2-PSK', 'Why'],
    rows: [
      ['Layer 2 Security', '`WPA+WPA2`', 'Selects the WPA family (default for a new WLAN)'],
      ['WPA Policy', 'Unchecked', 'Keeps out legacy WPA/TKIP clients'],
      ['WPA2 Policy', 'Checked', 'Enables WPA2'],
      ['WPA2 Encryption', '**AES** checked, TKIP unchecked', 'AES-CCMP; TKIP is deprecated'],
      ['Auth Key Mgmt: 802.1X', 'Unchecked', 'Default AKM on a new WLAN'],
      ['Auth Key Mgmt: PSK', '==Enabled==', 'Clients authenticate with the passphrase'],
      ['PSK Format', 'ASCII (8–63 chars) or HEX (64 digits)', 'Then type the key and Apply'],
    ],
    caption: 'Topic 5.10: configure and verify a WLAN in the GUI using WPA2 PSK.',
    notes:
      "Topic 5.10 asks you to configure and verify a WLAN in the GUI using **WPA2 PSK**, so know this screen cold. Open the WLAN's **Security** tab, which has sub-tabs for Layer 2, Layer 3 and AAA Servers. On **Layer 2**, the Layer 2 Security drop-down selects the family: WPA+WPA2, the default for a new WLAN, with newer releases also offering WPA3 combinations. Under the WPA+WPA2 parameters, check **WPA2 Policy** and leave WPA Policy unchecked unless you must support ancient clients. Select **AES** as the WPA2 encryption; TKIP exists only for backward compatibility. Now the crucial part, **Authentication Key Management**: a new WLAN defaults to **802.1X**, so you must uncheck 802.1X and enable **PSK**. Choose the **PSK format**, ASCII for a passphrase of 8 to 63 characters or HEX for a 64-digit hexadecimal key, type the key, and click Apply. The General tab's security summary should then read [WPA2][Auth(PSK)]. A common exam exhibit shows 802.1X still selected when the requirement is a passphrase, or TKIP selected instead of AES, and asks what to change.",
  },
  {
    kind: 'bullets',
    title: 'WPA2-Enterprise: 802.1X and the AAA Servers tab',
    bullets: [
      'Layer 2: WPA+WPA2, WPA2 Policy, **AES**',
      'Auth Key Management: **802.1X** (the default)',
      '**AAA Servers** tab: select the RADIUS server(s) for this WLAN',
      'Authentication and accounting servers are chosen separately',
      'Layer 3: web policy for guest portals; None for 802.1X',
      'Per-user VLAN or QoS from RADIUS needs **Allow AAA Override**',
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'WLAN CORP', sub: 'WPA2 + 802.1X', shape: 'pill' },
        { id: 'b', label: 'AAA Servers tab', sub: 'Server 1: 10.1.100.20' },
        { id: 'c', label: 'ISE', sub: 'validates the user', tone: 'accent' },
        { id: 'd', label: 'Access-Accept', sub: '+ optional VLAN', shape: 'round' },
      ],
    },
    notes:
      "An Enterprise WLAN uses the same Layer 2 screen with fewer changes, because the defaults already point to it: WPA+WPA2 with WPA2 Policy, AES encryption and **802.1X** key management. The extra work is on the **AAA Servers** sub-tab, where you select the RADIUS authentication server this WLAN should use, plus an accounting server if you want session records, listed in priority order. Selecting the server explicitly on the WLAN is how Cisco's guides configure it and what exhibits show. The **Layer 3** sub-tab is where web policies live: web authentication or passthrough portals for guest WLANs, usually combined with Layer 2 security set to None, so that the portal controls access. For an 802.1X WLAN, Layer 3 security stays at None, because authentication already happened at Layer 2. If the RADIUS server returns per-user attributes such as a VLAN, the WLAN ignores them unless **Allow AAA Override** is enabled on the Advanced tab; that setting is the bridge between the AAA Servers tab and dynamic VLAN assignment, which you will see shortly. On the exam, 'employees authenticate with their own credentials' means this configuration, not PSK.",
  },
  {
    kind: 'table',
    title: 'QoS tab: the four metal profiles',
    columns: ['QoS profile', 'Traffic type', 'WMM access category', 'Typical WLAN'],
    rows: [
      ['**Platinum**', 'Voice', 'Voice (AC_VO)', 'IP phones, voice SSID'],
      ['**Gold**', 'Video', 'Video (AC_VI)', 'Video streaming and conferencing'],
      ['**Silver**', 'Best effort (**default**)', 'Best effort (AC_BE)', 'Corporate data'],
      ['**Bronze**', 'Background', 'Background (AC_BK)', 'Guest or bulk traffic'],
    ],
    caption: 'The profile is a ceiling: traffic on a Silver WLAN is never treated better than best effort.',
    notes:
      "The **QoS** tab has one headline setting: the QoS profile, named after metals. **Platinum** is for voice, **Gold** for video, **Silver** for best effort and **Bronze** for background traffic. A new WLAN uses **Silver** by default. The profiles line up with the four Wi-Fi Multimedia (WMM) access categories from 802.11e, which give higher-priority traffic shorter waits for the medium. The key behavior to understand is that the profile acts as a **ceiling** for the WLAN: on a Silver WLAN, even packets that a phone marks as voice are treated no better than best effort over the air and in the CAPWAP tunnel. So a voice SSID must be set to **Platinum**, or calls will suffer as soon as the cell gets busy. Guest WLANs are often set to Bronze so guests cannot crowd out employees. The same tab also holds per-user and per-SSID bandwidth contracts, Application Visibility and Control, and the **WMM policy** (Disabled, Allowed or Required); 802.11n and 802.11ac high-throughput rates require WMM, so do not disable it. For the exam, the pairing Platinum–voice, Gold–video, Silver–best effort, Bronze–background is essential.",
  },
  {
    kind: 'table',
    title: 'Advanced tab settings to recognize',
    columns: ['Setting', 'What it does', 'Default / value'],
    rows: [
      ['**Allow AAA Override**', 'RADIUS can assign VLAN, QoS or ACL per user', 'Disabled'],
      ['Enable Session Timeout', 'Client must re-authenticate when the timer expires', 'Value in seconds'],
      ['**Client Exclusion**', 'Blocks a client for a while after repeated failures', 'Enabled, 60 s'],
      ['DHCP Addr. Assignment Required', 'Only clients that obtain an address by DHCP may pass traffic', 'Disabled'],
      ['FlexConnect Local Switching', 'FlexConnect AP bridges traffic onto a local VLAN', 'Disabled'],
      ['Maximum Allowed Clients', 'Caps the number of clients on the WLAN', '`0` = no limit'],
      ['P2P Blocking Action', 'Stops client-to-client traffic on the WLAN', 'Disabled'],
    ],
    caption: 'On the Catalyst 9800 these settings live in the policy profile.',
    notes:
      "The **Advanced** tab is long, but the exam concentrates on a handful of settings. **Allow AAA Override** lets attributes returned by the RADIUS server, such as a VLAN or interface name, a QoS level or an ACL, override the WLAN's own settings for that user; it is off by default, so dynamic VLAN assignment silently fails until you enable it. **Session timeout** sets how long a client session lasts before the client must re-authenticate. **Client exclusion** temporarily blocks a client after repeated failures, such as too many 802.1X or web authentication failures or an IP address already used by another client; the default exclusion time is 60 seconds. **DHCP Addr. Assignment Required** forces clients to obtain their address through DHCP, so a device with a static IP address associates but cannot pass traffic. **FlexConnect Local Switching** applies to APs in FlexConnect mode at remote sites: client traffic is bridged onto a VLAN at the branch instead of being tunneled across the WAN to the controller. **Maximum Allowed Clients** caps the WLAN's client count, with 0 meaning no limit, and **P2P Blocking** can stop clients on the WLAN from reaching each other directly.",
  },
  {
    kind: 'diagram',
    title: 'AAA override: dynamic VLAN assignment',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Contractor laptop', icon: 'laptop' },
        { id: 'w', label: 'WLC (WLAN CORP → VLAN 10)', icon: 'wlc' },
        { id: 'r', label: 'ISE', icon: 'server' },
      ],
      steps: [
        { from: 'c', to: 'w', label: '802.1X login as contractor1' },
        { from: 'w', to: 'r', label: 'RADIUS Access-Request' },
        { from: 'r', to: 'w', label: 'Access-Accept', sub: 'Tunnel-Private-Group-ID = 30', tone: 'accent' },
        { note: 'Allow AAA Override enabled: client placed in VLAN 30', tone: 'good' },
        { from: 'w', to: 'c', label: 'EAP-Success; DHCP then offers 10.30.30.x' },
      ],
    },
    caption: 'Without AAA override, the VLAN attribute is ignored and the client stays in VLAN 10.',
    notes:
      "Dynamic VLAN assignment is the most common reason to enable **Allow AAA Override**. Instead of creating separate SSIDs for employees, contractors and IT staff, you publish one 802.1X SSID and let the RADIUS server decide where each user belongs. After a successful authentication, ISE returns the VLAN in the standard IETF tunnel attributes (Tunnel-Type = VLAN, Tunnel-Medium-Type = 802 and **Tunnel-Private-Group-ID** = the VLAN ID or name), or it can return a Cisco Airespace interface-name attribute that names a dynamic interface. With AAA override enabled, the WLC places that user in VLAN 30 even though WLAN CORP is mapped to VLAN 10, and the client then gets its address from the VLAN 30 scope. The VLAN must exist on the controller (a dynamic interface on AireOS) and be allowed on the trunk. If override is disabled, the attribute is silently ignored and every user lands in the WLAN's default VLAN, which is exactly the symptom an exam question will describe. The same override mechanism can apply per-user QoS profiles, ACLs and session timeouts.",
  },
  {
    kind: 'table',
    title: 'AireOS vs Catalyst 9800: where settings live',
    columns: ['Setting', 'AireOS WLC', 'Catalyst 9800'],
    rows: [
      ['SSID, WLAN ID, broadcast SSID', 'WLAN > General tab', '**WLAN profile** > General'],
      ['WPA2/WPA3, PSK or 802.1X', 'WLAN > Security tab', '**WLAN profile** > Security'],
      ['Client VLAN', 'General tab > Interface', '**Policy profile** > Access Policies'],
      ['QoS (Platinum to Bronze)', 'WLAN > QoS tab', '**Policy profile** > QoS and AVC'],
      ['AAA override, timeouts, exclusion, DHCP required', 'WLAN > Advanced tab', '**Policy profile** > Advanced'],
      ['Local or FlexConnect switching', 'AP mode + Advanced tab', 'Policy profile switching + **site tag**'],
      ['Which APs broadcast the WLAN', 'AP groups', '**Policy tag** assigned to the APs'],
      ['RADIUS servers', 'SECURITY > AAA > RADIUS', 'Configuration > Security > AAA'],
    ],
    caption: 'WLAN profile = who can join and how; policy profile = where traffic goes and how it is treated.',
    notes:
      "The Catalyst 9800 runs IOS XE and replaces the monolithic AireOS WLAN with smaller, reusable building blocks. The **WLAN profile** holds what defines the SSID itself: name, WLAN ID, status, broadcast setting and the Layer 2 and Layer 3 security, including which AAA method list to use for 802.1X. The **policy profile** holds what happens to client traffic: the VLAN, central or local switching, QoS and AVC, ACLs, AAA override, session and idle timeouts, client exclusion and DHCP requirements. A useful memory aid is 'WLAN profile = who can join and how; policy profile = where the traffic goes and how it is treated'. Neither profile does anything until a **policy tag** pairs them and the tag is assigned to access points, which replaces AireOS AP groups. RADIUS servers are defined under Configuration > Security > AAA as servers, server groups and method lists. The 9800 GUI's left-hand menu (Dashboard, Monitoring, Configuration, Administration, Licensing, Troubleshooting) takes over the AireOS top bar: Monitoring for MONITOR, Configuration for WLANs, WIRELESS, CONTROLLER and SECURITY, and Administration for MANAGEMENT and COMMANDS.",
  },
  {
    kind: 'diagram',
    title: 'Catalyst 9800 profiles and tags',
    diagram: {
      type: 'flow',
      width: 10,
      height: 6,
      nodes: [
        { id: 'pt', label: 'Policy tag', sub: 'WLAN profile + policy profile', x: 2.4, y: 1 },
        { id: 'st', label: 'Site tag', sub: 'AP join profile + flex profile', x: 2.4, y: 3 },
        { id: 'rt', label: 'RF tag', sub: '2.4 / 5 / 6 GHz RF profiles', x: 2.4, y: 5 },
        { id: 'ap', label: 'Access point', sub: 'one tag of each type', x: 7.6, y: 3, shape: 'round', tone: 'accent' },
      ],
      edges: [
        { from: 'pt', to: 'ap', label: 'which SSIDs, which policy' },
        { from: 'st', to: 'ap', label: 'local or FlexConnect' },
        { from: 'rt', to: 'ap', label: 'radio behavior' },
      ],
    },
    bullets: [
      'Policy tag: **WLAN profile + policy profile** pairs',
      'Site tag: AP join and flex profiles; local vs FlexConnect',
      'RF tag: RF profiles per band',
      'Defaults: `default-policy-tag`, `default-site-tag`, `default-rf-tag`',
    ],
    notes:
      "The 9800 tag model answers three separate questions for every AP. The **policy tag** answers 'which SSIDs does this AP broadcast, and what policy applies to each?' It contains one or more pairs of **WLAN profile** and **policy profile**, so the same WLAN profile can be paired with different policy profiles in different tags, for example the same SSID mapped to VLAN 10 at headquarters and to VLAN 110 at a branch. The **site tag** answers 'how does this AP join and switch traffic?' It references an **AP join profile** (CAPWAP and AP management settings) and a **flex profile**, and its **Enable Local Site** option decides whether its APs run in local mode or FlexConnect mode. The **RF tag** answers 'how should the radios behave?' by pointing to RF profiles for each band. Every AP carries exactly one tag of each type; if you assign nothing, it gets **default-policy-tag**, **default-site-tag** and **default-rf-tag**. Tags can be assigned per AP by its MAC address or in bulk with rules that match AP names. For the exam, remember the three tag names, what each contains, and that tags replace AireOS AP groups.",
  },
  {
    kind: 'cli',
    title: 'The 9800 model in the IOS XE CLI',
    code: `WLC1(config)# wlan CORP-PSK 10 CORP-PSK
WLC1(config-wlan)# no security wpa akm dot1x
WLC1(config-wlan)# security wpa akm psk
WLC1(config-wlan)# security wpa psk set-key ascii 0 Str0ngPassphrase26
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit
WLC1(config)# wireless profile policy CORP-POLICY
WLC1(config-wireless-policy)# central switching
WLC1(config-wireless-policy)# vlan 10
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# wireless tag policy HQ-TAG
WLC1(config-policy-tag)# wlan CORP-PSK policy CORP-POLICY
WLC1(config-policy-tag)# exit
WLC1(config)# ap 00a2.eeb4.1c20
WLC1(config-ap-tag)# policy-tag HQ-TAG
WLC1(config-ap-tag)# end
WLC1# show wlan summary

Number of WLANs: 1

ID   Profile Name                     SSID                             Status Security
------------------------------------------------------------------------------------------
10   CORP-PSK                         CORP-PSK                         UP     [WPA2][PSK][AES]`,
    highlight: ['security wpa akm psk', 'vlan 10', 'wlan CORP-PSK policy CORP-POLICY', '[WPA2][PSK][AES]'],
    caption: 'WLAN profile, policy profile, policy tag, AP: the same objects the GUI builds.',
    notes:
      "The CCNA tests the GUI, but seeing the same configuration as IOS XE commands makes the 9800 model concrete, and the GUI simply generates these lines. The `wlan` command creates the **WLAN profile** with a profile name, WLAN ID and SSID. Like a new GUI WLAN, it starts with WPA2, AES and 802.1X key management, so for a pre-shared key you remove the dot1x AKM, add the **PSK** AKM and set the key; `no shutdown` then enables the WLAN. `wireless profile policy` creates the **policy profile**, where `central switching` keeps client traffic tunneled to the controller for local-mode APs, `vlan 10` places the clients, and `no shutdown` enables it. `wireless tag policy` creates the **policy tag**, and the `wlan ... policy ...` line is the pairing itself. Finally, the tag is assigned to an AP identified by its Ethernet MAC address. The `show wlan summary` output confirms the result: WLAN 10 is **UP** with security [WPA2][PSK][AES]. If the tag were never assigned to any AP, the WLAN would be up on the controller but no AP would broadcast it, a very common real-world and exam troubleshooting scenario.",
  },
  {
    kind: 'steps',
    title: 'Verify and troubleshoot a new WLAN',
    steps: [
      { title: 'Is the WLAN enabled?', text: 'WLANs list shows Enabled; on the 9800, show wlan summary shows UP' },
      { title: 'Does an AP advertise it?', text: 'AP group (AireOS) or policy tag (9800) includes the WLAN' },
      { title: 'Does the client authenticate?', text: 'Correct PSK, or RADIUS reachable with a matching shared secret' },
      { title: 'Is the client excluded?', text: 'Repeated failures trigger client exclusion for a while' },
      { title: 'Does the client get an IP address?', text: 'Right interface/VLAN, VLAN allowed on the trunk, DHCP scope' },
      { title: 'Is the client in RUN state?', text: 'MONITOR > Clients: WLAN, VLAN, IP address, state RUN' },
    ],
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Associated', shape: 'pill' },
        { id: 'b', label: 'Authenticated', sub: 'PSK or 802.1X' },
        { id: 'c', label: 'DHCP required', sub: 'IP address learned' },
        { id: 'd', label: 'RUN', sub: 'passing traffic', shape: 'round', tone: 'good' },
      ],
    },
    notes:
      "When a new WLAN does not work, walk the client's path in order, because each stage has its own failure signature. First, the WLAN must be **enabled**, and an AP must actually advertise it: on AireOS the AP's group must include the WLAN, and on the 9800 the AP's policy tag must contain it. If the SSID does not appear on a client at all, look there, not at security. Second, **authentication**: a wrong PSK fails during the 4-way handshake, while an 802.1X failure usually points at the RADIUS server, its reachability or a shared-secret mismatch. Repeated failures can trigger **client exclusion**, so a client may keep failing for a while even after the password is fixed. Third, **addressing**: a client that authenticates but gets no IP address points at the interface or VLAN mapping, a trunk that does not allow the VLAN, or a missing DHCP scope. When everything works, the client detail page under MONITOR > Clients shows the WLAN, the interface or VLAN, the IP address and a policy manager state of **RUN**, meaning the client can pass traffic.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: WLC GUI configuration',
    body: 'Read GUI exhibits field by field: most wrong answers change one checkbox or put a setting on the wrong tab.',
    bullets: [
      'New WLAN defaults: **802.1X** AKM, Silver QoS, management interface',
      'PSK needs 802.1X **unchecked**, PSK enabled and AES',
      'The profile name is local; the **SSID** is what clients see',
      'VLAN mapping = Interface field on the **General** tab (9800: policy profile)',
      'Voice WLAN = **Platinum**; the profile is a ceiling',
      'RADIUS-assigned VLANs need **Allow AAA Override**',
      '9800: a WLAN not in a policy tag on an AP is never broadcast',
    ],
    notes:
      "These are the recurring traps in WLC questions. First, **defaults**: a new AireOS WLAN starts with WPA2, AES and 802.1X key management, Silver QoS and the management interface, and it is broadcast only once Status is Enabled, so an exhibit that looks untouched tells you exactly what will happen. Second, **PSK configuration**: if the requirement is a passphrase, 802.1X must be replaced by PSK, and choosing TKIP instead of AES is always the weaker answer. Third, **names**: the profile name is internal, while clients see the SSID. Fourth, **tabs**: VLAN mapping lives on the General tab, QoS on its own tab, and AAA override, session timeout, client exclusion, DHCP required and FlexConnect local switching on the Advanced tab; RADIUS servers are defined under SECURITY and selected on the WLAN's AAA Servers tab. Fifth, **QoS**: the profile is a ceiling, so a voice WLAN left on Silver degrades calls. Sixth, **AAA override**: RADIUS-assigned VLANs are ignored while it is disabled. Finally, on the **9800**, a WLAN that no policy tag references, or a tag that no AP carries, is never broadcast even though the WLAN shows UP.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Menus: MONITOR, WLANs, CONTROLLER, WIRELESS, SECURITY, MANAGEMENT',
      'Workflow: RADIUS server, dynamic interface, WLAN, tabs, enable',
      'Tabs: General, Security, QoS, Policy-Mapping, Advanced',
      'WPA2-PSK: WPA2 Policy + AES, AKM PSK, ASCII or HEX key',
      'QoS: Platinum voice, Gold video, Silver best effort, Bronze background',
      '9800: WLAN + policy profile in a policy tag; site and RF tags',
    ],
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'AireOS',
          layers: [
            { label: 'WLAN: General + Security', sub: 'SSID, ID, PSK or 802.1X' },
            { label: 'WLAN: Interface, QoS, Advanced', sub: 'VLAN, metal profile, options' },
            { label: 'AP group', sub: 'which APs advertise it', tone: 'muted' },
          ],
        },
        {
          title: 'Catalyst 9800',
          layers: [
            { label: 'WLAN profile', sub: 'SSID, ID, security', tone: 'accent' },
            { label: 'Policy profile', sub: 'VLAN, QoS, AAA override' },
            { label: 'Policy tag on the AP', sub: 'pairs the two profiles', tone: 'muted' },
          ],
        },
      ],
    },
    notes:
      "Let us recap. The AireOS GUI organizes tasks by menu: **MONITOR** for status, **WLANs** for SSIDs, **CONTROLLER** for interfaces, **WIRELESS** for APs and radios, **SECURITY** for AAA and ACLs, and **MANAGEMENT** for administrative access. Building a WLAN follows a logical order: define the RADIUS server, create the dynamic interface for the client VLAN, create the WLAN with a profile name, SSID and ID, then work through its tabs. The **General** tab enables the WLAN and maps it to an interface; **Security** chooses WPA2 or WPA3, PSK or 802.1X, and the AAA servers; **QoS** picks Platinum, Gold, Silver or Bronze; **Policy-Mapping** attaches device-type local policies; and **Advanced** holds AAA override, session timeout, client exclusion, DHCP required, FlexConnect local switching and client limits. The Catalyst 9800 holds the same settings in a **WLAN profile** (who can join and how) and a **policy profile** (where traffic goes and how it is treated), paired in a **policy tag**, with **site** and **RF tags** completing each AP's configuration. If you can place each setting from a screenshot into this model, you are ready for the exam's WLC questions.",
  },
];
