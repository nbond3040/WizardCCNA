/** Hardware templates for every simulated model. */
import type { DeviceModel } from '../../content/labTypes';
import type { DeviceKind } from '../api';

export type IfTypeName =
  | 'Ethernet'
  | 'FastEthernet'
  | 'GigabitEthernet'
  | 'Serial'
  | 'Loopback'
  | 'Vlan'
  | 'Port-channel'
  | 'Tunnel'
  | 'Null';

export interface IfTypeDef {
  name: IfTypeName;
  short: string;
  /** CDP/LLDP style ("Gig 0/0/0") */
  cdp: string;
  help: string;
  /** created on first reference with `interface` */
  logical: boolean;
  /** number range for logical interfaces */
  range?: [number, number];
  /** default bandwidth in kbit/s */
  bw: number;
  /** default delay in usec */
  dly: number;
}

export const IF_TYPES: Record<IfTypeName, IfTypeDef> = {
  Ethernet: { name: 'Ethernet', short: 'Et', cdp: 'Eth', help: 'IEEE 802.3', logical: false, bw: 10000, dly: 1000 },
  FastEthernet: { name: 'FastEthernet', short: 'Fa', cdp: 'Fas', help: 'FastEthernet IEEE 802.3', logical: false, bw: 100000, dly: 100 },
  GigabitEthernet: { name: 'GigabitEthernet', short: 'Gi', cdp: 'Gig', help: 'GigabitEthernet IEEE 802.3z', logical: false, bw: 1000000, dly: 10 },
  Serial: { name: 'Serial', short: 'Se', cdp: 'Ser', help: 'Serial', logical: false, bw: 1544, dly: 20000 },
  Loopback: { name: 'Loopback', short: 'Lo', cdp: 'Loo', help: 'Loopback interface', logical: true, range: [0, 2147483647], bw: 8000000, dly: 5000 },
  Vlan: { name: 'Vlan', short: 'Vl', cdp: 'Vla', help: 'Catalyst Vlans', logical: true, range: [1, 4094], bw: 1000000, dly: 10 },
  'Port-channel': { name: 'Port-channel', short: 'Po', cdp: 'Por', help: 'Ethernet Channel of interfaces', logical: true, range: [1, 48], bw: 0, dly: 100 },
  Tunnel: { name: 'Tunnel', short: 'Tu', cdp: 'Tun', help: 'Tunnel interface', logical: true, range: [0, 2147483647], bw: 100, dly: 50000 },
  Null: { name: 'Null', short: 'Nu', cdp: 'Nul', help: 'Null interface', logical: true, range: [0, 0], bw: 10000000, dly: 0 },
};

export interface PhysIf {
  name: string;
  type: IfTypeName;
  /** STP port number / ifIndex-like ordinal */
  port: number;
  /** max speed Mbit/s */
  speed: number;
}

export interface Hw {
  model: DeviceModel;
  kind: DeviceKind;
  ifaces: PhysIf[];
  types: IfTypeName[];
  /** Port-channel range on this platform */
  poRange: [number, number];
  platform: string;
  cdpPlatform: string;
  cdpCaps: string;
  lldpCaps: string;
  cdpCapsLong: string;
  version: string;
  shortVersion: string;
  image: string;
  imageFile: string;
  flashDev: string;
  confReg: number;
  vtyDefault: number;
  serial: string;
  hardwareDesc: string;
  ouiPrefix: string;
  iosXe: boolean;
}

function range(prefix: string, type: IfTypeName, from: number, to: number, speed: number, portStart: number): PhysIf[] {
  const out: PhysIf[] = [];
  for (let i = from; i <= to; i++) out.push({ name: `${prefix}${i}`, type, port: portStart + (i - from), speed });
  return out;
}

export const HARDWARE: Record<DeviceModel, Hw> = {
  isr4321: {
    model: 'isr4321',
    kind: 'router',
    ifaces: [
      { name: 'GigabitEthernet0/0/0', type: 'GigabitEthernet', port: 1, speed: 1000 },
      { name: 'GigabitEthernet0/0/1', type: 'GigabitEthernet', port: 2, speed: 1000 },
      { name: 'Serial0/1/0', type: 'Serial', port: 3, speed: 2 },
      { name: 'Serial0/1/1', type: 'Serial', port: 4, speed: 2 },
    ],
    types: ['GigabitEthernet', 'Serial', 'Loopback', 'Port-channel', 'Tunnel', 'Null'],
    poRange: [1, 64],
    platform: 'ISR4321/K9',
    cdpPlatform: 'ISR4321/K9',
    cdpCaps: 'R B S I',
    lldpCaps: 'R',
    cdpCapsLong: 'Router Switch IGMP',
    version: '16.9.4',
    shortVersion: '16.9',
    image: 'X86_64_LINUX_IOSD-UNIVERSALK9-M',
    imageFile: 'bootflash:isr4300-universalk9.16.09.04.SPA.bin',
    flashDev: 'bootflash',
    confReg: 0x2102,
    vtyDefault: 5,
    serial: 'FLM2041W2HD',
    hardwareDesc: 'ISR4321-2x1GE',
    ouiPrefix: '00a3d1',
    iosXe: true,
  },
  isr2911: {
    model: 'isr2911',
    kind: 'router',
    ifaces: [
      { name: 'GigabitEthernet0/0', type: 'GigabitEthernet', port: 1, speed: 1000 },
      { name: 'GigabitEthernet0/1', type: 'GigabitEthernet', port: 2, speed: 1000 },
      { name: 'GigabitEthernet0/2', type: 'GigabitEthernet', port: 3, speed: 1000 },
      { name: 'Serial0/0/0', type: 'Serial', port: 4, speed: 2 },
      { name: 'Serial0/0/1', type: 'Serial', port: 5, speed: 2 },
    ],
    types: ['GigabitEthernet', 'Serial', 'Loopback', 'Port-channel', 'Tunnel', 'Null'],
    poRange: [1, 64],
    platform: 'CISCO2911/K9',
    cdpPlatform: 'CISCO2911/K9',
    cdpCaps: 'R B S I',
    lldpCaps: 'R',
    cdpCapsLong: 'Router Switch IGMP',
    version: '15.7(3)M3',
    shortVersion: '15.7',
    image: 'C2900-UNIVERSALK9-M',
    imageFile: 'flash0:c2900-universalk9-mz.SPA.157-3.M3.bin',
    flashDev: 'flash0',
    confReg: 0x2102,
    vtyDefault: 5,
    serial: 'FTX1524Z0P3',
    hardwareDesc: 'CN Gigabit Ethernet',
    ouiPrefix: '0030f2',
    iosXe: false,
  },
  c2960: {
    model: 'c2960',
    kind: 'switch',
    ifaces: [...range('FastEthernet0/', 'FastEthernet', 1, 24, 100, 1), ...range('GigabitEthernet0/', 'GigabitEthernet', 1, 2, 1000, 25)],
    types: ['FastEthernet', 'GigabitEthernet', 'Vlan', 'Port-channel', 'Loopback', 'Null'],
    poRange: [1, 6],
    platform: 'WS-C2960-24TT-L',
    cdpPlatform: 'WS-C2960-',
    cdpCaps: 'S I',
    lldpCaps: 'B',
    cdpCapsLong: 'Switch IGMP',
    version: '15.0(2)SE4',
    shortVersion: '15.0',
    image: 'C2960-LANBASEK9-M',
    imageFile: 'flash:c2960-lanbasek9-mz.150-2.SE4.bin',
    flashDev: 'flash',
    confReg: 0xf,
    vtyDefault: 16,
    serial: 'FOC1010X104',
    hardwareDesc: 'Fast Ethernet',
    ouiPrefix: '001a2f',
    iosXe: false,
  },
  c3650: {
    model: 'c3650',
    kind: 'l3switch',
    ifaces: [...range('GigabitEthernet1/0/', 'GigabitEthernet', 1, 24, 1000, 1), ...range('GigabitEthernet1/1/', 'GigabitEthernet', 1, 4, 1000, 25)],
    types: ['GigabitEthernet', 'Vlan', 'Port-channel', 'Loopback', 'Tunnel', 'Null'],
    poRange: [1, 128],
    platform: 'WS-C3650-24PS',
    cdpPlatform: 'WS-C3650-',
    cdpCaps: 'R S I',
    lldpCaps: 'B,R',
    cdpCapsLong: 'Router Switch IGMP',
    version: '16.3.7',
    shortVersion: '16.3',
    image: 'CAT3K_CAA-UNIVERSALK9-M',
    imageFile: 'flash:packages.conf',
    flashDev: 'flash',
    confReg: 0x102,
    vtyDefault: 16,
    serial: 'FDO2129Q0MP',
    hardwareDesc: 'Gigabit Ethernet',
    ouiPrefix: '00bf77',
    iosXe: true,
  },
  pc: hostHw('pc'),
  laptop: hostHw('laptop'),
  server: hostHw('server'),
  cloud: {
    ...hostHw('cloud'),
    kind: 'cloud',
    ifaces: [{ name: 'Ethernet0', type: 'Ethernet', port: 1, speed: 1000 }],
    types: ['Ethernet'],
    ouiPrefix: '00000c',
  },
};

function hostHw(model: DeviceModel): Hw {
  return {
    model,
    kind: 'host',
    ifaces: [{ name: 'FastEthernet0', type: 'FastEthernet', port: 1, speed: 100 }],
    types: ['FastEthernet'],
    poRange: [1, 1],
    platform: model === 'server' ? 'Server-PT' : model === 'laptop' ? 'Laptop-PT' : 'PC-PT',
    cdpPlatform: '',
    cdpCaps: 'H',
    lldpCaps: 'S',
    cdpCapsLong: 'Host',
    version: '',
    shortVersion: '',
    image: '',
    imageFile: '',
    flashDev: '',
    confReg: 0,
    vtyDefault: 0,
    serial: '',
    hardwareDesc: '',
    ouiPrefix: model === 'server' ? '0090ab' : model === 'laptop' ? '00d058' : '0050b6',
    iosXe: false,
  };
}

export function isIosModel(model: DeviceModel): boolean {
  return model === 'isr4321' || model === 'isr2911' || model === 'c2960' || model === 'c3650';
}
