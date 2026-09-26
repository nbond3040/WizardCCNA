/** Line configuration mode (line con 0 / line vty a b). */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx } from '../cli/session';
import type { LineCfg } from '../model/state';
import { pwFrom } from './global';

function lines(c: Ctx): LineCfg[] {
  const l = c.s.line;
  if (!l) return [];
  const cfg = c.dev.st.cfg.lines;
  if (l.kind === 'con') return [cfg.con];
  if (l.kind === 'aux') return [cfg.aux];
  return cfg.vty.slice(l.from, l.to + 1);
}

/** absolute TTY line number (for IOS messages) */
function absLine(c: Ctx, idx: number): number {
  const l = c.s.line!;
  if (l.kind === 'con') return 0;
  if (l.kind === 'aux') return 1;
  return (c.dev.kind === 'router' ? 2 : 1) + idx;
}

function eachLine(fn: (c: Ctx, l: LineCfg, idx: number) => void) {
  return (c: Ctx) => {
    const ls = lines(c);
    ls.forEach((l, i) => fn(c, l, (c.s.line?.from ?? 0) + i));
  };
}

const password = (c: Ctx) => {
  const t = Object.keys(c.a).find((x) => x.startsWith('ptype#'));
  const p = c.neg ? undefined : pwFrom(c, t ? Number(t.split('#')[1]) : undefined, c.a.password as string);
  if (!c.neg && !p) return;
  for (const l of lines(c)) l.password = p ? { ...p } : undefined;
};

const login = eachLine((c, l, idx) => {
  if (c.neg) {
    l.login = 'none';
    return;
  }
  l.login = c.a.local ? 'local' : 'line';
  if (l.login === 'line' && !l.password && c.s.via !== 'nvram' && c.io.interactive) {
    c.out.push(`% Login disabled on line ${absLine(c, idx)}, until 'password' is set`);
  }
});

const transport = eachLine((c, l) => {
  const which = c.a.output ? 'transportOut' : 'transport';
  if (c.neg) {
    l[which] = undefined;
    return;
  }
  const protos = Object.keys(c.a)
    .filter((x) => x.startsWith('tp='))
    .map((x) => x.split('=')[1]);
  l[which] = protos.length ? protos : ['all'];
});

const execTimeout = eachLine((c, l) => {
  l.execTimeout = c.neg ? undefined : [c.a.min as number, (c.a.sec as number | undefined) ?? 0];
});

const logSync = eachLine((c, l) => {
  l.logSync = !c.neg;
});

const accessClass = eachLine((c, l) => {
  const name = String(c.a.acname);
  if (c.a.out) l.accessOut = c.neg ? undefined : name;
  else l.accessIn = c.neg ? undefined : name;
});

const privilege = eachLine((c, l) => {
  l.privilege = c.neg ? undefined : (c.a.plevel as number);
});

const history = eachLine((c, l) => {
  l.history = c.neg ? undefined : (c.a.hsize as number);
});

const extra = (text: (c: Ctx) => string) =>
  eachLine((c, l) => {
    const line = text(c);
    const base = line.split(' ')[0];
    l.extra = l.extra.filter((x) => x !== line && !(c.neg && x.startsWith(base)));
    if (!c.neg) l.extra.push(line);
  });

let roots: Node[] | null = null;

export function lineRoots(): Node[] {
  if (roots) return roots;
  const tpOpts = (key: string): Node[] => {
    const next = (): Node[] => tpOpts(key);
    return [
      k('all', 'All protocols', { key: 'tp=all', run: transport }, next),
      k('none', 'No protocols', { key: 'tp=none', run: transport }),
      k('ssh', 'TCP/IP SSH protocol', { key: 'tp=ssh', run: transport }, next),
      k('telnet', 'TCP/IP Telnet protocol', { key: 'tp=telnet', run: transport }, next),
    ];
  };
  roots = [
    k('access-class', 'Filter connections based on an IP access list', [
      a('word', '<1-199>', 'IP access list', { key: 'acname' }, [k('in', 'Filter incoming connections', { run: accessClass }), k('out', 'Filter outgoing connections', { run: accessClass })]),
    ]),
    k('exec-timeout', 'Set the EXEC timeout', { nr: execTimeout }, [num(0, 35791, 'Timeout in minutes', { key: 'min', run: execTimeout }, [num(0, 2147483, 'Timeout in seconds', { key: 'sec', run: execTimeout })])]),
    k('history', 'Enable and control the command history function', [k('size', 'Set history buffer size', { nr: history }, [num(0, 256, 'Size of history buffer', { key: 'hsize', run: history })])]),
    k('logging', 'Modify message logging facilities', [k('synchronous', 'Synchronized message output', { run: logSync })]),
    k('login', 'Enable password checking', { run: login }, [
      k('local', 'Local password checking', { run: login }),
      k('authentication', 'Authentication parameters.', [a('word', 'WORD', 'Use an authentication list with this name.', { key: 'alist', run: extra((c) => `login authentication ${c.a.alist}`) })]),
    ]),
    k('motd-banner', 'Enable the display of the MOTD banner', { run: extra(() => 'motd-banner') }),
    k('password', 'Set a password', { nr: password }, [
      k('0', 'Specifies an UNENCRYPTED password will follow', { key: 'ptype#0' }, [a('line', 'LINE', 'The UNENCRYPTED (cleartext) line password', { key: 'password', run: password })]),
      k('7', 'Specifies a HIDDEN password will follow', { key: 'ptype#7' }, [a('line', 'LINE', 'The HIDDEN line password', { key: 'password', run: password })]),
      a('line', 'LINE', 'The UNENCRYPTED (cleartext) line password', { key: 'password', run: password }),
    ]),
    k('privilege', 'Change privilege level for line', [k('level', 'Assign default privilege level for line', { nr: privilege }, [num(0, 15, 'Default privilege level for line', { key: 'plevel', run: privilege })])]),
    k('session-timeout', 'Set interval for closing connection when there is no input traffic', [num(0, 35791, 'Session timeout interval in minutes', { key: 'st', run: extra((c) => `session-timeout ${c.a.st}`) })]),
    k('speed', 'Set the transmit and receive speeds', [num(0, 4294967295, 'Transmit and receive speeds', { key: 'spd', run: extra((c) => `speed ${c.a.spd}`) })]),
    k('stopbits', 'Set async line stop bits', [a('word', 'WORD', 'stop bits', { key: 'sb', run: () => {} })]),
    k('transport', 'Define transport protocols for line', [
      k('input', 'Define which protocols to use when connecting to the terminal server', { nr: transport }, tpOpts('in')),
      k('output', 'Define which protocols to use for outgoing connections', { key: 'output', nr: transport }, tpOpts('out')),
      k('preferred', 'Specify the preferred protocol to use', [a('line', 'LINE', 'protocol', { key: 'pref', run: extra((c) => `transport preferred ${c.a.pref}`) })]),
    ]),
  ];
  return roots;
}
