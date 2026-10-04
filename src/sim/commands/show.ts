/** The `show` command tree. */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import * as B from '../show/basic';
import * as L2 from '../show/l2show';
import * as DAI from '../show/daishow';
import * as L3 from '../show/l3show';

let roots: Node[] | null = null;

type H = (c: Ctx) => void;

export function showRoots(): Node[] {
  if (roots) return roots;
  const iface = (help: string, key: string, run?: H, sub?: Node[] | (() => Node[])) => ({ ...a('iface', 'IFACE', help, { key, run }, sub), ifPolicy: 'exist' as const });
  const sw = { when: (e: { is(f: string): boolean }) => e.is('switch') };
  const ospfV6 = (fn: (c: Ctx, v6?: boolean) => void): H => (c) => fn(c, true);

  const macOpts = (): Node[] => [
    k('address', 'address keyword', [a('mac', 'H.H.H', '48 bit mac address', { key: 'maddr', run: L2.showMacTable }, macOpts)]),
    k('dynamic', 'dynamic entry type', { run: L2.showMacTable }, macOpts),
    k('interface', 'interface keyword', [iface('Interface', 'mif', L2.showMacTable, macOpts)]),
    k('static', 'static entry type', { run: L2.showMacTable }, macOpts),
    k('vlan', 'VLAN keyword', [num(1, 4094, 'Vlan number', { key: 'mvlan', run: L2.showMacTable }, macOpts)]),
  ];

  const ipNodes: Node[] = [
    k('access-lists', 'List IP access lists', { key: 'iponly', run: L3.showAccessLists }, [a('word', 'WORD', 'Access list name or number', { key: 'aname', run: L3.showAccessLists })]),
    k('arp', 'IP ARP table', { run: B.showArp }, [
      k('inspection', 'Show Dynamic ARP Inspection information', { ...sw, run: DAI.showArpInspection }, [
        k('interfaces', 'Show Dynamic ARP Inspection interface information', { run: DAI.showArpInspectionInterfaces }, [iface('Interface', 'ifn', DAI.showArpInspectionInterfaces)]),
        k('statistics', 'Show Dynamic ARP Inspection statistics', { run: DAI.showArpInspectionStatistics }, [
          k('vlan', 'Show Dynamic ARP Inspection statistics for specific vlans', [a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'vlans', run: DAI.showArpInspectionStatistics })]),
        ]),
        k('vlan', 'Show Dynamic ARP Inspection configuration for specific vlans', [a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'vlans', run: DAI.showArpInspection })]),
      ]),
    ]),
    k('dhcp', 'Show items in the DHCP database', [
      k('binding', 'DHCP address bindings', { run: L3.showDhcpBinding }),
      k('conflict', 'DHCP address conflicts', { run: L3.showDhcpConflict }),
      k('pool', 'DHCP pools information', { run: L3.showDhcpPool }, [a('word', 'WORD', 'Pool name', { key: 'pname', run: L3.showDhcpPool })]),
      k('snooping', 'DHCP snooping', { ...sw, run: L2.showDhcpSnooping }, [k('binding', 'DHCP snooping binding', { run: L2.showDhcpSnooping })]),
    ]),
    k('interface', 'IP interface status and configuration', { run: B.showIpInterface }, [k('brief', 'Brief summary of IP status and configuration', { run: B.showIpIntBrief }), iface('Interface', 'ifn', B.showIpInterface)]),
    k('nat', 'IP NAT information', [
      k('statistics', 'Translation statistics', { run: L3.showNatStatistics }),
      k('translations', 'Translation entries', { run: L3.showNatTranslations }, [k('total', 'Total number of translations', { run: L3.showNatTranslations }), k('verbose', 'Show extra information', { run: L3.showNatTranslations })]),
    ]),
    k('ospf', 'OSPF information', { run: L3.showIpOspf }, [
      k('database', 'Database summary', { run: L3.showOspfDatabase }),
      k('interface', 'Interface information', { run: (c: Ctx) => L3.showOspfInterface(c) }, [k('brief', 'Brief summary of OSPF interface information', { run: (c: Ctx) => L3.showOspfIntBrief(c) }), iface('Interface', 'ifn', (c: Ctx) => L3.showOspfInterface(c))]),
      k('neighbor', 'Neighbor list', { run: (c: Ctx) => L3.showOspfNeighbor(c) }, [k('detail', 'detail of all neighbors', { run: (c: Ctx) => L3.showOspfNeighbor(c) }), iface('Interface', 'ifn', (c: Ctx) => L3.showOspfNeighbor(c))]),
    ]),
    k('protocols', 'IP routing protocol process parameters and statistics', { run: L3.showIpProtocols }),
    k('route', 'IP routing table', { run: L3.showIpRoute }, [
      a('ipv4', 'Hostname or A.B.C.D', 'Network to display information about or hostname', { key: 'addr', run: L3.showIpRoute }, [a('ipv4', 'A.B.C.D', 'Network mask', { key: 'mask', run: L3.showIpRoute })]),
      k('connected', 'Connected', { key: 'rf=connected', run: L3.showIpRoute }),
      k('local', 'Local', { key: 'rf=local', run: L3.showIpRoute }),
      k('ospf', 'Open Shortest Path First (OSPF)', { key: 'rf=ospf', run: L3.showIpRoute }, [num(1, 65535, 'Process ID', { key: 'opid', run: L3.showIpRoute })]),
      k('static', 'Static routes', { key: 'rf=static', run: L3.showIpRoute }),
    ]),
    k('ssh', 'Information on SSH', { run: L3.showIpSsh }),
  ];

  const ipv6Nodes: Node[] = [
    k('access-list', 'Summary of access lists', { run: L3.showAccessLists }),
    k('interface', 'IPv6 interface status and configuration', { run: L3.showIpv6Interface }, [k('brief', 'Brief summary of IPv6 status and configuration', { run: L3.showIpv6IntBrief }), iface('Interface', 'ifn', L3.showIpv6Interface)]),
    k('ospf', 'OSPF information', { run: ospfV6(L3.showIpOspf) }, [
      k('interface', 'Interface information', { run: ospfV6(L3.showOspfInterface) }, [k('brief', 'Brief summary of OSPF interface information', { run: ospfV6(L3.showOspfIntBrief) }), iface('Interface', 'ifn', ospfV6(L3.showOspfInterface))]),
      k('neighbor', 'Neighbor list', { run: ospfV6(L3.showOspfNeighbor) }),
    ]),
    k('route', 'Show IPv6 route table entries', { run: L3.showIpv6Route }, [
      k('connected', 'Connected routes', { key: 'rf=connected', run: L3.showIpv6Route }),
      k('local', 'Local routes', { key: 'rf=local', run: L3.showIpv6Route }),
      k('ospf', 'OSPF routes', { key: 'rf=ospf', run: L3.showIpv6Route }),
      k('static', 'Static routes', { key: 'rf=static', run: L3.showIpv6Route }),
    ]),
  ];

  const stpOpts = (): Node[] => [
    k('blockedports', 'Show blocked ports', { key: 'blocked', run: L2.showSpanningTree }),
    k('detail', 'Detailed information', { run: L2.showSpanningTree }),
    k('interface', 'Spanning Tree interface status and configuration', [iface('Interface', 'ifn', L2.showStpInterface, [k('detail', 'Detailed information', { run: L2.showStpInterface })])]),
    k('root', 'Show root bridge information', { run: L2.showSpanningTree }),
    k('summary', 'Summary of port states', { run: L2.showStpSummary }),
    k('vlan', 'VLAN Switch Spanning Trees', [a('vlanlist', 'WORD', 'vlan range, example: 1,3-5,7,9-11', { key: 'svlan', run: L2.showSpanningTree }, [k('interface', 'Spanning Tree interface status and configuration', [iface('Interface', 'ifn', L2.showStpInterface)])])]),
  ];

  roots = [
    k('access-lists', 'List access lists', { run: L3.showAccessLists }, [a('word', 'WORD', 'ACL name or number', { key: 'aname', run: L3.showAccessLists })]),
    k('arp', 'ARP table', { run: B.showArp }),
    k('cdp', 'CDP information', { run: L2.showCdp }, [
      k('entry', 'Information for specific neighbor entry', [k('*', 'all CDP neighbor entries', { key: 'detail', run: L2.showCdpNeighbors }), a('word', 'WORD', 'Name of CDP neighbor entry', { key: 'detail', run: L2.showCdpNeighbors })]),
      k('interface', 'CDP interface status and configuration', { run: L2.showCdpInterface }, [iface('Interface', 'ifn', L2.showCdpInterface)]),
      k('neighbors', 'CDP neighbor entries', { run: L2.showCdpNeighbors }, [k('detail', 'Show detailed information', { run: L2.showCdpNeighbors }), iface('Interface', 'ifn', L2.showCdpNeighbors, [k('detail', 'Show detailed information', { run: L2.showCdpNeighbors })])]),
    ]),
    k('clock', 'Display the system clock', { run: B.showClock }, [k('detail', 'Display detailed information', { run: B.showClock })]),
    k('controllers', 'Interface controller status', [iface('Interface', 'ifn', B.showControllers)]),
    k('crypto', 'Encryption module', [k('key', 'Show long term public keys', [k('mypubkey', 'Show public keys associated with this router', [k('rsa', 'Show RSA public keys', { run: L3.showCryptoKey })])])]),
    k('dhcp', 'Dynamic Host Configuration Protocol status', { hide: true, run: L3.showDhcpBinding }),
    k('errdisable', 'Error disable', [k('detect', 'Error disable detection', { run: L2.showErrdisableDetect }), k('recovery', 'Error disable recovery', { run: L2.showErrdisableRecovery })]),
    k('etherchannel', 'EtherChannel information', [
      k('port-channel', 'Port-channel information', { run: L2.showEtherPortChannel }),
      k('summary', 'One-line summary per channel-group', { run: L2.showEtherSummary }),
    ]),
    k('flash:', 'display information about flash: file system', { run: B.showFlash }),
    k('history', 'Display the session command history', { run: B.showHistory }),
    k('hosts', 'IP domain-name, lookup style, nameservers, and host table', { run: B.showHosts }),
    k('interfaces', 'Interface status and configuration', { run: B.showInterfaces }, [
      iface('Interface', 'ifn', B.showInterfaces, [k('switchport', 'Show interface switchport information', { ...sw, run: L2.showIntSwitchport }), k('trunk', 'Show interface trunk information', { ...sw, run: L2.showIntTrunk })]),
      k('description', 'Show interface description', { run: B.showIntDescription }),
      k('status', 'Show interface line status', { ...sw, run: B.showIntStatus }, [k('err-disabled', 'Show interfaces in err-disabled state', { key: 'errdis', run: B.showIntStatus })]),
      k('switchport', 'Show interface switchport information', { ...sw, run: L2.showIntSwitchport }),
      k('trunk', 'Show interface trunk information', { ...sw, run: L2.showIntTrunk }),
    ]),
    k('ip', 'IP information', ipNodes),
    k('ipv6', 'IPv6 information', ipv6Nodes),
    k('lldp', 'LLDP information', { run: L2.showLldp }, [k('neighbors', 'LLDP neighbor entries', { run: L2.showLldpNeighbors }, [k('detail', 'Show detailed information', { run: L2.showLldpNeighbors })])]),
    k('logging', 'Show the contents of logging buffers', { run: B.showLogging }),
    k('mac', 'MAC configuration', sw, [k('address-table', 'MAC forwarding table', { run: L2.showMacTable }, macOpts)]),
    k('mac-address-table', 'MAC forwarding table', { ...sw, hide: true, run: L2.showMacTable }, macOpts),
    k('ntp', 'Network time protocol', [k('associations', 'NTP associations', { run: L3.showNtpAssociations }), k('status', 'NTP status', { run: L3.showNtpStatus })]),
    k('port-security', 'Show secure port information', { ...sw, run: L2.showPortSecurity }, [k('address', 'Show secure address', { run: L2.showPortSecurity }), k('interface', 'Show secure interface', [iface('Interface', 'ifn', L2.showPortSecurity)])]),
    k('power', 'Show inline power related information', sw, [k('inline', 'Inline power status', { run: L2.showPowerInline })]),
    k('privilege', 'Show current privilege level', { run: B.showPrivilege }),
    k('protocols', 'Active network routing protocols', { run: B.showProtocols }),
    k('running-config', 'Current operating configuration', { priv: true, run: B.showRunning }, [k('interface', 'Show interface configuration', [iface('Interface', 'ifn', B.showRunning)])]),
    k('sessions', 'Information about Telnet connections', { run: B.showSessions }),
    k('spanning-tree', 'Spanning tree topology', { run: L2.showSpanningTree }, stpOpts),
    k('ssh', 'Status of SSH server connections', { run: L3.showIpSsh }),
    k('standby', 'Hot standby protocol information', { run: L3.showStandby }, [k('brief', 'Brief output', { run: L3.showStandby })]),
    k('startup-config', 'Contents of startup configuration', { priv: true, run: B.showStartup }),
    k('users', 'Display information about terminal lines', { run: B.showUsers }),
    k('version', 'System hardware and software status', { run: B.showVersion }),
    k('vlan', 'VTP VLAN status', { ...sw, run: L2.showVlan }, [
      k('brief', 'VTP all VLAN status in brief', { run: L2.showVlan }),
      k('id', 'VTP VLAN status by VLAN id', [num(1, 4094, 'VLAN id', { key: 'vid', run: L2.showVlan })]),
      k('name', 'VTP VLAN status by VLAN name', [a('word', 'WORD', 'A VLAN name', { key: 'vname', run: L2.showVlan })]),
    ]),
    k('vtp', 'VTP information', sw, [k('status', 'VTP domain status', { run: L2.showVtpStatus })]),
  ];
  return roots;
}
