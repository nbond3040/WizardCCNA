/**
 * Procedural drill generators. Each call returns a fresh problem with every accepted answer
 * form and a worked explanation (block-size method, binary AND, etc.).
 */
import {
  broadcastOf, compressIPv6, eui64, expandIPv6, interesting, intToIp, ipToInt, ipv6Type, maskToPrefix, networkOf,
  prefixToMask, prefixToMaskInt, toBin8, usableHosts, wildcardOf,
} from './ip';

export interface Problem {
  prompt: string;
  /** Short context line shown above the prompt (e.g. the address being worked). */
  given?: string;
  answers: string[];
  /** Multiple-choice options (if set, answers must be one of them). */
  choices?: string[];
  placeholder?: string;
  explain: string[];
}

export interface DrillDef {
  id: string;
  title: string;
  blurb: string;
  group: 'IPv4' | 'IPv6' | 'Conversions';
  gen: (rand: () => number) => Problem;
}

const ri = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T,>(rand: () => number, xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];

function randomHost(rand: () => number, p: number): string {
  // A random private-ish address whose host bits are not all 0/1 (when possible).
  const firsts = [10, 172, 192];
  const f = pick(rand, firsts);
  const base = f === 10 ? [10, ri(rand, 0, 255), ri(rand, 0, 255), ri(rand, 0, 255)] : f === 172 ? [172, ri(rand, 16, 31), ri(rand, 0, 255), ri(rand, 0, 255)] : [192, 168, ri(rand, 0, 255), ri(rand, 0, 255)];
  let ip = base.join('.');
  if (p <= 30) {
    const net = ipToInt(networkOf(ip, p));
    const size = 2 ** (32 - p);
    ip = intToIp(net + ri(rand, 1, size - 2));
  }
  return ip;
}

function blockExplain(ip: string, p: number): string[] {
  const { octet, block } = interesting(p);
  const octs = ip.split('.').map(Number);
  const v = octs[octet];
  const netVal = Math.floor(v / block) * block;
  const names = ['first', 'second', 'third', 'fourth'];
  const lines = [
    `/${p} = ${prefixToMask(p)}. The interesting octet is the ${names[octet]} (mask value ${256 - block}).`,
    `Block size = 256 − ${256 - block} = ${block}. Multiples of ${block}: … ${netVal}, ${netVal + block} …`,
    `${v} falls in the block starting at ${netVal}, so the network is ${networkOf(ip, p)}.`,
    `Broadcast = next network − 1 = ${broadcastOf(ip, p)}. Usable: ${intToIp(ipToInt(networkOf(ip, p)) + 1)} – ${intToIp(ipToInt(broadcastOf(ip, p)) - 1)}.`,
  ];
  if (block === 256) lines.splice(1, 2, `The prefix ends on an octet boundary: copy the first ${octet} octets and zero the rest → ${networkOf(ip, p)}.`);
  return lines;
}

const prefixRange = (rand: () => number) => pick(rand, [8, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30]);

export const DRILLS: DrillDef[] = [
  {
    id: 'network-id',
    title: 'Network ID',
    blurb: 'Find the subnet a host belongs to.',
    group: 'IPv4',
    gen: (rand) => {
      const p = prefixRange(rand);
      const ip = randomHost(rand, p);
      return { given: `${ip}/${p}`, prompt: 'What is the network (subnet) ID?', answers: [networkOf(ip, p)], placeholder: 'a.b.c.d', explain: blockExplain(ip, p) };
    },
  },
  {
    id: 'broadcast',
    title: 'Broadcast address',
    blurb: 'Find the directed broadcast of the subnet.',
    group: 'IPv4',
    gen: (rand) => {
      const p = prefixRange(rand);
      const ip = randomHost(rand, p);
      return { given: `${ip}/${p}`, prompt: 'What is the broadcast address of this subnet?', answers: [broadcastOf(ip, p)], placeholder: 'a.b.c.d', explain: blockExplain(ip, p) };
    },
  },
  {
    id: 'host-range',
    title: 'First & last usable host',
    blurb: 'Give the usable range of the subnet.',
    group: 'IPv4',
    gen: (rand) => {
      const p = Math.min(30, prefixRange(rand));
      const ip = randomHost(rand, p);
      const first = intToIp(ipToInt(networkOf(ip, p)) + 1);
      const last = intToIp(ipToInt(broadcastOf(ip, p)) - 1);
      const which = rand() < 0.5 ? 'first' : 'last';
      return { given: `${ip}/${p}`, prompt: `What is the ${which} usable host address?`, answers: [which === 'first' ? first : last], placeholder: 'a.b.c.d', explain: blockExplain(ip, p) };
    },
  },
  {
    id: 'hosts-per-subnet',
    title: 'Hosts per subnet',
    blurb: 'Usable hosts for a prefix or mask.',
    group: 'IPv4',
    gen: (rand) => {
      const p = ri(rand, 16, 30);
      const asMask = rand() < 0.5;
      const h = 32 - p;
      return {
        given: asMask ? prefixToMask(p) : `/${p}`,
        prompt: 'How many usable host addresses does each subnet have?',
        answers: [String(usableHosts(p))],
        placeholder: 'number',
        explain: [`${asMask ? `${prefixToMask(p)} = /${p}. ` : ''}Host bits = 32 − ${p} = ${h}.`, `Usable hosts = 2^${h} − 2 = ${2 ** h} − 2 = ${usableHosts(p)} (network and broadcast are reserved).`],
      };
    },
  },
  {
    id: 'mask-for-hosts',
    title: 'Mask for N hosts',
    blurb: 'Pick the longest prefix that still fits the hosts.',
    group: 'IPv4',
    gen: (rand) => {
      const need = pick(rand, [2, 5, 10, 14, 20, 25, 30, 45, 60, 62, 90, 100, 120, 126, 150, 200, 250, 254, 300, 500, 510, 1000, 1500, 2000, 4000]);
      let h = 1;
      while (2 ** h - 2 < need) h++;
      const p = 32 - h;
      return {
        prompt: `A subnet must support ${need} hosts while wasting as few addresses as possible. Which prefix length should you use?`,
        answers: [`/${p}`, String(p), prefixToMask(p)],
        placeholder: '/nn or mask',
        explain: [`Find the smallest h with 2^h − 2 ≥ ${need}: h = ${h} (2^${h} − 2 = ${2 ** h - 2}).`, h > 1 ? `h = ${h - 1} would give only ${2 ** (h - 1) - 2}.` : '', `Prefix = 32 − ${h} = /${p} (${prefixToMask(p)}).`].filter(Boolean),
      };
    },
  },
  {
    id: 'subnets-borrow',
    title: 'Subnets from borrowed bits',
    blurb: 'How many subnets does a new prefix create?',
    group: 'IPv4',
    gen: (rand) => {
      const base = pick(rand, [8, 16, 20, 22, 24]);
      const newP = Math.min(30, base + ri(rand, 1, 8));
      const s = newP - base;
      return {
        given: `Network /${base} subnetted to /${newP}`,
        prompt: 'How many subnets are created?',
        answers: [String(2 ** s)],
        placeholder: 'number',
        explain: [`Borrowed bits = ${newP} − ${base} = ${s}.`, `Subnets = 2^${s} = ${2 ** s} (subnet zero and the all-ones subnet are both usable).`],
      };
    },
  },
  {
    id: 'same-subnet',
    title: 'Same subnet?',
    blurb: 'Decide whether two hosts can talk without a router.',
    group: 'IPv4',
    gen: (rand) => {
      const p = pick(rand, [20, 22, 23, 24, 25, 26, 27, 28, 29]);
      const a = randomHost(rand, p);
      const net = ipToInt(networkOf(a, p));
      const size = 2 ** (32 - p);
      const same = rand() < 0.5;
      const b = same ? intToIp(net + ri(rand, 1, size - 2)) : intToIp((net + size * pick(rand, [1, -1]) + ri(rand, 1, size - 2)) >>> 0);
      const ans = networkOf(a, p) === networkOf(b, p) ? 'Yes' : 'No';
      return {
        given: `${a}/${p} and ${b}/${p}`,
        prompt: 'Are these two hosts in the same subnet?',
        answers: [ans],
        choices: ['Yes', 'No'],
        explain: [`${a}/${p} → network ${networkOf(a, p)}`, `${b}/${p} → network ${networkOf(b, p)}`, ans === 'Yes' ? 'Same network ID → same subnet.' : 'Different network IDs → a router is needed.'],
      };
    },
  },
  {
    id: 'mask-prefix',
    title: 'Mask ↔ prefix',
    blurb: 'Convert between dotted masks and /prefix.',
    group: 'IPv4',
    gen: (rand) => {
      const p = ri(rand, 8, 30);
      if (rand() < 0.5) {
        return { given: prefixToMask(p), prompt: 'Write this subnet mask as a prefix length.', answers: [`/${p}`, String(p)], placeholder: '/nn', explain: [`Count the 1 bits: ${prefixToMask(p).split('.').map((o) => toBin8(Number(o))).join('.')} → ${p} ones.`] };
      }
      return { given: `/${p}`, prompt: 'Write this prefix as a dotted-decimal mask.', answers: [prefixToMask(p)], placeholder: 'a.b.c.d', explain: [`${p} ones followed by ${32 - p} zeros: ${prefixToMask(p).split('.').map((o) => toBin8(Number(o))).join('.')} = ${prefixToMask(p)}.`] };
    },
  },
  {
    id: 'wildcard',
    title: 'Wildcard masks',
    blurb: 'Build ACL and OSPF wildcards.',
    group: 'IPv4',
    gen: (rand) => {
      const p = ri(rand, 8, 30);
      const ip = networkOf(randomHost(rand, p), p);
      const kind = rand();
      if (kind < 0.5) {
        return {
          given: `${ip} ${prefixToMask(p)}`,
          prompt: 'What wildcard mask matches exactly this subnet in an ACL?',
          answers: [wildcardOf(p)],
          placeholder: 'a.b.c.d',
          explain: [`Wildcard = 255.255.255.255 − mask.`, `255.255.255.255 − ${prefixToMask(p)} = ${wildcardOf(p)}.`],
        };
      }
      const size = 2 ** (32 - p);
      return {
        given: `access-list 10 permit ${ip} ${wildcardOf(p)}`,
        prompt: 'What is the LAST address this entry matches?',
        answers: [intToIp(ipToInt(ip) + size - 1)],
        placeholder: 'a.b.c.d',
        explain: [`Wildcard ${wildcardOf(p)} = ${32 - p} "don't care" bits → ${size} addresses.`, `Range: ${ip} – ${intToIp(ipToInt(ip) + size - 1)}.`],
      };
    },
  },
  {
    id: 'summary',
    title: 'Route summarization',
    blurb: 'Find the best summary for contiguous networks.',
    group: 'IPv4',
    gen: (rand) => {
      const count = pick(rand, [2, 4, 4, 8]);
      const subP = pick(rand, [24, 24, 24, 25, 26, 27]);
      const sumP = subP - Math.log2(count);
      const size = 2 ** (32 - sumP);
      const base = (ipToInt(pick(rand, ['10.0.0.0', '172.16.0.0', '192.168.0.0'])) + size * ri(rand, 1, 60)) >>> 0;
      const nets = Array.from({ length: count }, (_, i) => `${intToIp(base + i * 2 ** (32 - subP))}/${subP}`);
      const summary = `${intToIp(base)}/${sumP}`;
      return {
        given: nets.join(', '),
        prompt: 'What is the most specific summary route that covers exactly these networks?',
        answers: [summary, `${intToIp(base)} ${prefixToMask(sumP)}`],
        placeholder: 'a.b.c.d/nn',
        explain: [
          `${count} contiguous /${subP} networks → the summary is ${Math.log2(count)} bits shorter: /${sumP}.`,
          `The first network ${nets[0].split('/')[0]} is on a /${sumP} boundary (a multiple of the block size), so the summary is ${summary}.`,
        ],
      };
    },
  },
  {
    id: 'ipv6-compress',
    title: 'IPv6: compress',
    blurb: 'Apply the two abbreviation rules.',
    group: 'IPv6',
    gen: (rand) => {
      const groups = Array.from({ length: 8 }, () => (rand() < 0.45 ? 0 : rand() < 0.4 ? ri(rand, 1, 0xff) : ri(rand, 0x100, 0xffff)));
      groups[0] = pick(rand, [0x2001, 0x2001, 0xfe80, 0xfd00, 0x2600]);
      if (groups[0] === 0x2001) groups[1] = 0x0db8;
      const full = groups.map((g) => g.toString(16).padStart(4, '0')).join(':');
      return {
        given: full,
        prompt: 'Write this address in its shortest valid form.',
        answers: [compressIPv6(full)],
        placeholder: 'x::y',
        explain: ['Rule 1: drop leading zeros in every hextet.', 'Rule 2: replace the single longest run of all-zero hextets with :: (only once; leftmost run if tied; not for a single hextet).', `Result: ${compressIPv6(full)}`],
      };
    },
  },
  {
    id: 'ipv6-expand',
    title: 'IPv6: expand',
    blurb: 'Write all 32 hex digits.',
    group: 'IPv6',
    gen: (rand) => {
      const groups = Array.from({ length: 8 }, () => (rand() < 0.5 ? 0 : ri(rand, 1, 0xffff)));
      groups[0] = pick(rand, [0x2001, 0xfe80, 0xfd12, 0x2a02]);
      const full = groups.map((g) => g.toString(16).padStart(4, '0')).join(':');
      const short = compressIPv6(full);
      return { given: short, prompt: 'Expand this address to its full 8-hextet form.', answers: [full], placeholder: 'xxxx:xxxx:…', explain: [`:: stands for ${8 - short.replace('::', ':').split(':').filter(Boolean).length} all-zero hextet(s); pad every hextet to 4 digits.`, `Result: ${full}`] };
    },
  },
  {
    id: 'eui64',
    title: 'IPv6: modified EUI-64',
    blurb: 'Build the interface ID from a MAC.',
    group: 'IPv6',
    gen: (rand) => {
      const bytes = Array.from({ length: 6 }, () => ri(rand, 0, 255));
      bytes[0] &= 0xfc;
      if (rand() < 0.3) bytes[0] |= 0x02;
      const hex = bytes.map((b) => b.toString(16).padStart(2, '0'));
      const mac = `${hex[0]}${hex[1]}.${hex[2]}${hex[3]}.${hex[4]}${hex[5]}`;
      const iid = eui64(mac);
      const addr = compressIPv6(`2001:db8:acad:1:${iid}`);
      const flipped = (bytes[0] ^ 2).toString(16).padStart(2, '0');
      return {
        given: `Prefix 2001:db8:acad:1::/64 · MAC ${mac}`,
        prompt: 'What IPv6 address does `ipv6 address 2001:db8:acad:1::/64 eui-64` create?',
        answers: [addr, expandIPv6(addr)],
        placeholder: '2001:db8:acad:1:…',
        explain: [`Split the MAC: ${hex.slice(0, 3).join('')} | ${hex.slice(3).join('')}; insert FFFE: ${hex.slice(0, 3).join('')}fffe${hex.slice(3).join('')}.`, `Flip the 7th bit (U/L) of the first byte: ${hex[0]} → ${flipped}.`, `Interface ID ${iid} → ${addr}`],
      };
    },
  },
  {
    id: 'ipv6-type',
    title: 'IPv6: address type',
    blurb: 'Identify the address type on sight.',
    group: 'IPv6',
    gen: (rand) => {
      const samples: [string, string][] = [
        [`2001:db8:${ri(rand, 1, 0xffff).toString(16)}::${ri(rand, 1, 0xff).toString(16)}`, 'global unicast'],
        [`2${ri(rand, 0, 3).toString(16)}${ri(rand, 0, 0xff).toString(16).padStart(2, '0')}:${ri(rand, 1, 0xffff).toString(16)}::1`, 'global unicast'],
        [`fe80::${ri(rand, 1, 0xffff).toString(16)}:${ri(rand, 1, 0xffff).toString(16)}`, 'link-local'],
        [`fd${ri(rand, 0, 255).toString(16).padStart(2, '0')}:${ri(rand, 1, 0xffff).toString(16)}::${ri(rand, 1, 99)}`, 'unique local'],
        [pick(rand, ['ff02::1', 'ff02::2', 'ff02::5', 'ff02::1:ff00:1234', 'ff05::2']), 'multicast'],
        ['::1', 'loopback'],
        ['::', 'unspecified'],
      ];
      const [addr] = pick(rand, samples);
      const t = ipv6Type(addr);
      return {
        given: addr,
        prompt: 'What type of IPv6 address is this?',
        answers: [t],
        choices: ['global unicast', 'unique local', 'link-local', 'multicast', 'loopback', 'unspecified'],
        explain: ['2000::/3 global unicast · FC00::/7 unique local (FD in practice) · FE80::/10 link-local · FF00::/8 multicast · ::1 loopback · :: unspecified.'],
      };
    },
  },
  {
    id: 'binary',
    title: 'Decimal ↔ binary',
    blurb: 'Octet conversions at speed.',
    group: 'Conversions',
    gen: (rand) => {
      const n = ri(rand, 0, 255);
      if (rand() < 0.5) return { given: String(n), prompt: 'Convert to an 8-bit binary number.', answers: [toBin8(n)], placeholder: '00000000', explain: [`128 64 32 16 8 4 2 1 → ${toBin8(n).split('').join(' ')}`] };
      return { given: toBin8(n), prompt: 'Convert to decimal.', answers: [String(n)], placeholder: '0–255', explain: [toBin8(n).split('').map((b, i) => (b === '1' ? 2 ** (7 - i) : 0)).filter(Boolean).join(' + ') + ` = ${n}`] };
    },
  },
  {
    id: 'hex',
    title: 'Hex ↔ decimal',
    blurb: 'For MACs, IPv6 and EtherTypes.',
    group: 'Conversions',
    gen: (rand) => {
      const n = ri(rand, 0, 255);
      const h = n.toString(16).toUpperCase().padStart(2, '0');
      if (rand() < 0.5) return { given: `0x${h}`, prompt: 'Convert this hex byte to decimal.', answers: [String(n)], placeholder: '0–255', explain: [`${h[0]} × 16 + ${h[1]} = ${parseInt(h[0], 16) * 16} + ${parseInt(h[1], 16)} = ${n}`] };
      return { given: String(n), prompt: 'Convert to two hex digits.', answers: [h, `0x${h}`, h.toLowerCase(), `0x${h.toLowerCase()}`], placeholder: 'XX', explain: [`${n} ÷ 16 = ${Math.floor(n / 16)} remainder ${n % 16} → ${h}`] };
    },
  },
];

export const DRILL_BY_ID = Object.fromEntries(DRILLS.map((d) => [d.id, d]));

/** A "mixed" drill cycling through every IPv4 subnetting generator. */
export const MIXED_IDS = ['network-id', 'broadcast', 'host-range', 'hosts-per-subnet', 'mask-for-hosts', 'same-subnet', 'wildcard', 'summary'];

export function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^0x/, '');
}

export function checkAnswer(p: Problem, given: string): boolean {
  const g = normalizeAnswer(given);
  return p.answers.some((a) => normalizeAnswer(a) === g || normalizeAnswer(a).replace(/\s/g, '') === g.replace(/\s/g, ''));
}

export { maskToPrefix, prefixToMaskInt };
