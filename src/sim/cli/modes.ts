/** Mode → command-tree roots, plus the commands common to every configuration mode. */
import type { Net } from '../engine/net';
import { k, type Node } from './grammar';
import type { Mode, Session, Ctx } from './session';
import { execRoots } from '../commands/exec';
import { globalRoots, configExitMessage } from '../commands/global';
import { ifRoots } from '../commands/iface';
import { lineRoots } from '../commands/line';
import { ospfRoots, ospf6Roots } from '../commands/router';
import { vlanRoots, dhcpRoots, stdAclRoots, extAclRoots, blockRoots, applyVlanPending } from '../commands/submodes';

const cache = new Map<string, Node[]>();

function doNode(): Node {
  return k('do', 'To run exec commands in config mode', { doExec: true }, () => execRoots());
}

function exitNode(to: 'config' | 'priv'): Node {
  return k('exit', to === 'priv' ? 'Exit from configure mode' : 'Exit from current mode', {
    run: (c: Ctx) => {
      if (to === 'priv') {
        c.s.mode = 'priv';
        configExitMessage(c);
      } else if (c.s.mode === 'block' && c.s.block?.prompt === 'config-keychain-key') {
        c.s.block.prompt = 'config-keychain';
        c.s.block.key = undefined;
      } else {
        c.s.mode = 'config';
        c.s.ifs = [];
        c.s.line = undefined;
        c.s.pid = undefined;
        c.s.pool = undefined;
        c.s.acl = undefined;
        c.s.block = undefined;
      }
    },
  });
}

function endNode(): Node {
  return k('end', 'Exit from configure mode', {
    run: (c: Ctx) => {
      c.s.mode = 'priv';
      c.s.ifs = [];
      c.s.line = undefined;
      c.s.pid = undefined;
      c.s.pool = undefined;
      c.s.acl = undefined;
      c.s.block = undefined;
      configExitMessage(c);
    },
  });
}

function withCommon(key: string, base: () => Node[], exitTo: 'config' | 'priv'): Node[] {
  const hit = cache.get(key);
  if (hit) return hit;
  const roots = base();
  const negatable = roots.filter((n) => n.kw !== 'exit' && n.kw !== 'end');
  const all: Node[] = [
    ...roots,
    doNode(),
    endNode(),
    exitNode(exitTo),
    k('no', 'Negate a command or set its defaults', { negate: true }, () => negatable),
    k('default', 'Set a command to its defaults', { dflt: true, hide: key !== 'if' }, () => negatable.filter((n) => n.nr || n.run || n.sub)),
  ];
  cache.set(key, all);
  return all;
}

export function rootsFor(mode: Mode, s: Session): Node[] {
  void s;
  switch (mode) {
    case 'user':
    case 'priv':
      return execRoots();
    case 'config':
      return withCommon('config', globalRoots, 'priv');
    case 'if':
    case 'subif':
    case 'if-range':
      return withCommon('if', ifRoots, 'config');
    case 'line':
      return withCommon('line', lineRoots, 'config');
    case 'router':
      return withCommon('router', ospfRoots, 'config');
    case 'rtr6':
      return withCommon('rtr6', ospf6Roots, 'config');
    case 'vlan':
      return withCommon('vlan', vlanRoots, 'config');
    case 'dhcp':
      return withCommon('dhcp', dhcpRoots, 'config');
    case 'std-nacl':
      return withCommon('std-nacl', stdAclRoots, 'config');
    case 'ext-nacl':
      return withCommon('ext-nacl', extAclRoots, 'config');
    case 'v6-nacl':
      return withCommon('v6-nacl', extAclRoots, 'config');
    case 'block':
      return withCommon('block', blockRoots, 'config');
  }
}

export function modeHeader(mode: Mode): string {
  switch (mode) {
    case 'user':
    case 'priv':
      return 'Exec commands:';
    case 'config':
      return 'Configure commands:';
    case 'if':
    case 'subif':
    case 'if-range':
      return 'Interface configuration commands:';
    case 'line':
      return 'Line configuration commands:';
    case 'router':
    case 'rtr6':
      return 'Router configuration commands:';
    case 'vlan':
      return 'VLAN configuration commands:';
    case 'dhcp':
      return 'DHCP pool configuration commands:';
    case 'std-nacl':
      return 'Standard Access List configuration commands:';
    case 'ext-nacl':
    case 'v6-nacl':
      return 'Ext Access List configuration commands:';
    case 'block':
      return 'Configuration commands:';
  }
}

/** Apply pending `vlan` sub-mode changes (IOS commits VLAN changes when leaving the mode). */
export function flushVlanMode(net: Net, s: Session): void {
  applyVlanPending(net, s);
}
