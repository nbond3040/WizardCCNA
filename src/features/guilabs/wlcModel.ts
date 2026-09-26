/** State model and lab tasks for the AireOS-style Wireless LAN Controller GUI simulator. */

export type QosProfile = 'platinum' | 'gold' | 'silver' | 'bronze';
export type L2Security = 'none' | 'wpa+wpa2' | '802.1x' | 'static-wep';

export interface WlcInterface {
  name: string;
  vlan: number;
  ip: string;
  mask: string;
  gateway: string;
  port: number;
  dhcp: string;
  kind: 'management' | 'virtual' | 'dynamic';
}

export interface RadiusServer {
  index: number;
  ip: string;
  secret: string;
  port: number;
  enabled: boolean;
}

export interface Wlan {
  id: number;
  profile: string;
  ssid: string;
  enabled: boolean;
  broadcastSsid: boolean;
  radioPolicy: 'All' | '802.11a only' | '802.11g only' | '802.11b/g only' | '802.11a/g only';
  iface: string;
  l2: L2Security;
  wpa: boolean;
  wpa2: boolean;
  aes: boolean;
  tkip: boolean;
  akm8021x: boolean;
  akmPsk: boolean;
  pskFormat: 'ascii' | 'hex';
  psk: string;
  radius: number | null;
  qos: QosProfile;
  wmm: 'disabled' | 'allowed' | 'required';
  aaaOverride: boolean;
  sessionTimeout: number;
  clientExclusion: boolean;
  dhcpRequired: boolean;
  flexLocalSwitching: boolean;
  maxClients: number;
}

export interface WlcState {
  wlans: Wlan[];
  interfaces: WlcInterface[];
  radius: RadiusServer[];
}

export function newWlan(id: number, profile: string, ssid: string): Wlan {
  return {
    id,
    profile,
    ssid,
    enabled: false,
    broadcastSsid: true,
    radioPolicy: 'All',
    iface: 'management',
    l2: 'wpa+wpa2',
    wpa: false,
    wpa2: true,
    aes: true,
    tkip: false,
    akm8021x: true,
    akmPsk: false,
    pskFormat: 'ascii',
    psk: '',
    radius: null,
    qos: 'silver',
    wmm: 'allowed',
    aaaOverride: false,
    sessionTimeout: 1800,
    clientExclusion: true,
    dhcpRequired: false,
    flexLocalSwitching: false,
    maxClients: 0,
  };
}

export function initialWlc(): WlcState {
  const guest = newWlan(1, 'GUEST', 'Guest-WiFi');
  guest.l2 = 'none';
  guest.akm8021x = false;
  guest.wpa2 = false;
  guest.aes = false;
  return {
    wlans: [guest],
    interfaces: [
      { name: 'management', vlan: 10, ip: '10.10.10.5', mask: '255.255.255.0', gateway: '10.10.10.1', port: 1, dhcp: '10.10.10.1', kind: 'management' },
      { name: 'virtual', vlan: 0, ip: '192.0.2.1', mask: '', gateway: '', port: 0, dhcp: '', kind: 'virtual' },
    ],
    radius: [],
  };
}

export interface WlcTask {
  id: string;
  title: string;
  hint?: string;
  check: (s: WlcState) => string | true;
}

const find = (s: WlcState, profile: string) => s.wlans.find((w) => w.profile.toLowerCase() === profile.toLowerCase());

export const WLC_LABS: Record<string, { scenario: string; tasks: WlcTask[] }> = {
  'gui-wlc-wpa2-psk': {
    scenario:
      'Your company is rolling out a corporate WLAN on the AireOS controller **WLC1**. Corporate clients live in **VLAN 20** (10.20.0.0/24, gateway 10.20.0.1, which is also the DHCP server). Build the dynamic interface, then create and secure the WLAN with **WPA2-Personal (PSK) + AES**. Video conferencing is critical, so the WLAN uses the **Gold** QoS profile.',
    tasks: [
      {
        id: 'iface',
        title: 'Create dynamic interface `corp`: VLAN 20, IP 10.20.0.5/24, gateway 10.20.0.1, port 1, primary DHCP 10.20.0.1',
        hint: 'CONTROLLER → Interfaces → New…',
        check: (s) => {
          const i = s.interfaces.find((x) => x.name.toLowerCase() === 'corp');
          if (!i) return 'Interface "corp" does not exist yet';
          if (i.vlan !== 20) return `VLAN is ${i.vlan}, expected 20`;
          if (i.ip !== '10.20.0.5' || i.mask !== '255.255.255.0') return 'IP/netmask should be 10.20.0.5 / 255.255.255.0';
          if (i.gateway !== '10.20.0.1') return 'Gateway should be 10.20.0.1';
          if (i.dhcp !== '10.20.0.1') return 'Primary DHCP server should be 10.20.0.1';
          return true;
        },
      },
      {
        id: 'wlan',
        title: 'Create WLAN ID 2 with profile name `CORP` and SSID `CORP-WIFI`',
        hint: 'WLANs → Create New → Go',
        check: (s) => {
          const w = find(s, 'CORP');
          if (!w) return 'No WLAN with profile name CORP';
          if (w.ssid !== 'CORP-WIFI') return `SSID is "${w.ssid}", expected CORP-WIFI`;
          if (w.id !== 2) return `WLAN ID is ${w.id}, expected 2`;
          return true;
        },
      },
      {
        id: 'map',
        title: 'Map the CORP WLAN to the `corp` interface and broadcast the SSID',
        hint: 'WLANs → Edit → General → Interface/Interface Group',
        check: (s) => {
          const w = find(s, 'CORP');
          if (!w) return 'WLAN CORP missing';
          if (w.iface !== 'corp') return `WLAN uses interface "${w.iface}"`;
          if (!w.broadcastSsid) return 'Broadcast SSID is disabled';
          return true;
        },
      },
      {
        id: 'sec',
        title: 'Security: WPA2 only with AES, PSK key management (no 802.1X), passphrase `Wizard-CCNA-2026`',
        hint: 'WLANs → Edit → Security → Layer 2. Uncheck 802.1X under Authentication Key Management.',
        check: (s) => {
          const w = find(s, 'CORP');
          if (!w) return 'WLAN CORP missing';
          if (w.l2 !== 'wpa+wpa2') return 'Layer 2 Security must be WPA+WPA2';
          if (w.wpa) return 'WPA (v1) policy should be unchecked';
          if (!w.wpa2) return 'WPA2 policy is not enabled';
          if (!w.aes || w.tkip) return 'Encryption must be AES only (no TKIP)';
          if (w.akm8021x) return '802.1X key management is still enabled';
          if (!w.akmPsk) return 'PSK key management is not enabled';
          if (w.pskFormat !== 'ascii' || w.psk !== 'Wizard-CCNA-2026') return 'PSK must be ASCII "Wizard-CCNA-2026"';
          return true;
        },
      },
      {
        id: 'qos',
        title: 'Set the QoS profile to Gold (video)',
        hint: 'WLANs → Edit → QoS',
        check: (s) => (find(s, 'CORP')?.qos === 'gold' ? true : 'QoS profile is not Gold'),
      },
      {
        id: 'enable',
        title: 'Enable the WLAN',
        hint: 'WLANs → Edit → General → Status: Enabled',
        check: (s) => (find(s, 'CORP')?.enabled ? true : 'WLAN is disabled'),
      },
    ],
  },
  'gui-wlc-enterprise': {
    scenario:
      'Staff laptops must authenticate individually with **802.1X** against the Cisco ISE server at **10.10.10.50** (shared secret `R@dius-Key1`, auth port 1812). Staff traffic belongs in **VLAN 30** (10.30.0.0/24, gateway and DHCP 10.30.0.1). ISE will return per-user VLANs later, so **AAA override** must be allowed.',
    tasks: [
      {
        id: 'radius',
        title: 'Add RADIUS authentication server 10.10.10.50, port 1812, shared secret `R@dius-Key1`, enabled',
        hint: 'SECURITY → AAA → RADIUS → Authentication → New…',
        check: (s) => {
          const r = s.radius.find((x) => x.ip === '10.10.10.50');
          if (!r) return 'No RADIUS server 10.10.10.50';
          if (r.port !== 1812) return `Port is ${r.port}, expected 1812`;
          if (r.secret !== 'R@dius-Key1') return 'Shared secret does not match';
          if (!r.enabled) return 'Server is disabled';
          return true;
        },
      },
      {
        id: 'iface',
        title: 'Create dynamic interface `staff`: VLAN 30, IP 10.30.0.5/24, gateway 10.30.0.1, port 1, DHCP 10.30.0.1',
        check: (s) => {
          const i = s.interfaces.find((x) => x.name.toLowerCase() === 'staff');
          if (!i) return 'Interface "staff" does not exist';
          if (i.vlan !== 30 || i.ip !== '10.30.0.5' || i.mask !== '255.255.255.0' || i.gateway !== '10.30.0.1' || i.dhcp !== '10.30.0.1') return 'Check VLAN/IP/netmask/gateway/DHCP values';
          return true;
        },
      },
      {
        id: 'wlan',
        title: 'Create WLAN ID 3, profile `STAFF`, SSID `STAFF-1X`, mapped to interface `staff`',
        check: (s) => {
          const w = find(s, 'STAFF');
          if (!w) return 'No WLAN STAFF';
          if (w.id !== 3 || w.ssid !== 'STAFF-1X') return 'Check the WLAN ID and SSID';
          if (w.iface !== 'staff') return 'WLAN is not mapped to interface staff';
          return true;
        },
      },
      {
        id: 'sec',
        title: 'Security: WPA2 + AES with 802.1X key management, using the new RADIUS server',
        hint: 'Layer 2 tab for WPA2/AES/802.1X; AAA Servers tab to select the RADIUS server.',
        check: (s) => {
          const w = find(s, 'STAFF');
          if (!w) return 'No WLAN STAFF';
          if (w.l2 !== 'wpa+wpa2' || !w.wpa2 || w.wpa) return 'Use WPA2 policy only';
          if (!w.aes || w.tkip) return 'AES only';
          if (!w.akm8021x || w.akmPsk) return 'Key management must be 802.1X only';
          const r = s.radius.find((x) => x.ip === '10.10.10.50');
          if (!r || w.radius !== r.index) return 'Select the 10.10.10.50 RADIUS server on the AAA Servers tab';
          return true;
        },
      },
      {
        id: 'adv',
        title: 'Advanced: allow AAA override; keep QoS at Silver; enable the WLAN',
        check: (s) => {
          const w = find(s, 'STAFF');
          if (!w) return 'No WLAN STAFF';
          if (!w.aaaOverride) return 'Allow AAA Override is not checked';
          if (w.qos !== 'silver') return 'QoS should be Silver (best effort)';
          if (!w.enabled) return 'WLAN is disabled';
          return true;
        },
      },
    ],
  },
};
