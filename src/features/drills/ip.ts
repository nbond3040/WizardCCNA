/** IPv4/IPv6 math helpers for the drill generators. */

export const ipToInt = (ip: string) => ip.split('.').reduce((a, o) => ((a << 8) | Number(o)) >>> 0, 0) >>> 0;
export const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
export const prefixToMaskInt = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);
export const prefixToMask = (p: number) => intToIp(prefixToMaskInt(p));
export const maskToPrefix = (mask: string) => {
  const n = ipToInt(mask);
  let p = 0;
  while (p < 32 && (n >>> (31 - p)) & 1) p++;
  return p;
};
export const wildcardOf = (p: number) => intToIp(~prefixToMaskInt(p) >>> 0);
export const networkOf = (ip: string, p: number) => intToIp((ipToInt(ip) & prefixToMaskInt(p)) >>> 0);
export const broadcastOf = (ip: string, p: number) => intToIp(((ipToInt(ip) & prefixToMaskInt(p)) | (~prefixToMaskInt(p) >>> 0)) >>> 0);
export const usableHosts = (p: number) => (p >= 31 ? (p === 31 ? 2 : 1) : 2 ** (32 - p) - 2);
export const toBin8 = (n: number) => n.toString(2).padStart(8, '0');

/** The "interesting" octet index (0–3) for a prefix, and its block size. */
export function interesting(p: number): { octet: number; block: number } {
  if (p >= 32) return { octet: 3, block: 1 };
  const octet = Math.min(3, Math.floor(p / 8));
  const bitsInOctet = p - octet * 8;
  return { octet, block: 2 ** (8 - bitsInOctet) };
}

/* ---------------- IPv6 ---------------- */

export function expandIPv6(addr: string): string {
  let [head, tail] = addr.toLowerCase().split('::');
  const h = head ? head.split(':') : [];
  const t = tail !== undefined ? (tail ? tail.split(':') : []) : [];
  const missing = 8 - h.length - t.length;
  const groups = tail !== undefined ? [...h, ...Array(missing).fill('0'), ...t] : h;
  return groups.map((g) => g.padStart(4, '0')).join(':');
}

export function compressIPv6(addr: string): string {
  const groups = expandIPv6(addr).split(':').map((g) => g.replace(/^0+(?=.)/, ''));
  // longest run of "0" groups (length ≥ 2), leftmost on ties
  let best = { start: -1, len: 0 };
  for (let i = 0; i < 8; ) {
    if (groups[i] === '0') {
      let j = i;
      while (j < 8 && groups[j] === '0') j++;
      if (j - i > best.len && j - i >= 2) best = { start: i, len: j - i };
      i = j;
    } else i++;
  }
  if (best.start < 0) return groups.join(':');
  const left = groups.slice(0, best.start).join(':');
  const right = groups.slice(best.start + best.len).join(':');
  return `${left}::${right}`;
}

/** Modified EUI-64 interface ID from a MAC like 0012.3456.789a or 00:12:34:56:78:9a. */
export function eui64(mac: string): string {
  const hex = mac.replace(/[^0-9a-f]/gi, '').toLowerCase();
  const b = hex.match(/../g)!.map((x) => parseInt(x, 16));
  b[0] ^= 0x02;
  const bytes = [b[0], b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
  const groups = [0, 2, 4, 6].map((i) => ((bytes[i] << 8) | bytes[i + 1]).toString(16));
  return groups.join(':');
}

export function ipv6Type(addr: string): string {
  const full = expandIPv6(addr);
  const first = parseInt(full.slice(0, 4), 16);
  if (full === '0000:0000:0000:0000:0000:0000:0000:0000') return 'unspecified';
  if (full === '0000:0000:0000:0000:0000:0000:0000:0001') return 'loopback';
  if ((first & 0xff00) === 0xff00) return 'multicast';
  if ((first & 0xffc0) === 0xfe80) return 'link-local';
  if ((first & 0xfe00) === 0xfc00) return 'unique local';
  if ((first & 0xe000) === 0x2000) return 'global unicast';
  return 'other';
}
