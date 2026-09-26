/** Labs that run in purpose-built GUI simulators rather than the IOS network simulator. */
export interface GuiLabMeta {
  id: string;
  kind: 'wlc' | 'api';
  title: string;
  summary: string;
  minutes: number;
  difficulty: 1 | 2 | 3;
  lessons: string[];
}

export const GUI_LABS: GuiLabMeta[] = [
  {
    id: 'gui-wlc-wpa2-psk',
    kind: 'wlc',
    title: 'WLC GUI: Create a WPA2-PSK WLAN',
    summary: 'Build a dynamic interface, then create and secure a WPA2-Personal WLAN in the controller GUI.',
    minutes: 30,
    difficulty: 1,
    lessons: ['wlc-gui-config', 'wireless-security'],
  },
  {
    id: 'gui-wlc-enterprise',
    kind: 'wlc',
    title: 'WLC GUI: WPA2-Enterprise with RADIUS',
    summary: 'Add a RADIUS server and build an 802.1X WLAN with AAA override and the right QoS profile.',
    minutes: 30,
    difficulty: 2,
    lessons: ['wlc-gui-config', 'aaa'],
  },
  {
    id: 'gui-api-catalyst-center',
    kind: 'api',
    title: 'REST API: Catalyst Center Intent API',
    summary: 'Authenticate for a token, read the device inventory, filter with query parameters and create a site.',
    minutes: 35,
    difficulty: 2,
    lessons: ['rest-apis', 'json', 'controller-networking'],
  },
];

export const GUI_LAB_BY_ID: Record<string, GuiLabMeta> = Object.fromEntries(GUI_LABS.map((l) => [l.id, l]));
