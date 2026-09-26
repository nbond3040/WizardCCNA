/** IPv6 helpers. Addresses are handled as bigint internally and stored as compressed lowercase strings. */

const MAX = (1n << 128n) - 1n;

export function parseV6(input: string): bigint | null {
  let s = input.trim().toLowerCase();
  const pct = s.indexOf('%');
  if (pct >= 0) s = s.slice(0, pct);
  if (!s || !/^[0-9a-f:.]+$/.test(s)) return null;
  // embedded IPv4 tail (e.g. ::ffff:192.0.2.1) → two hex groups
  if (s.includes('.')) {
    const idx = s.lastIndexOf(':');
    const parts = s.slice(idx + 1).split('.');
    if (idx < 0 || parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
    const n = parts.map(Number);
    s = s.slice(0, idx + 1) + ((n[0] << 8) | n[1]).toString(16) + ':' + ((n[2] << 8) | n[3]).toString(16);
  }
  const dbl = s.split('::');
  if (dbl.length > 2) return null;
  const head = dbl[0] ? dbl[0].split(':') : [];
  const rest = dbl.length === 2 ? (dbl[1] ? dbl[1].split(':') : []) : [];
  const groups = [...head, ...rest];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  const total = 8;
  let words: number[];
  if (dbl.length === 2) {
    const fill = total - head.length - rest.length;
    if (fill < 1) return null;
    words = [...head.map((g) => parseInt(g, 16)), ...Array(fill).fill(0), ...rest.map((g) => parseInt(g, 16))];
  } else {
    if (head.length !== total) return null;
    words = head.map((g) => parseInt(g, 16));
  }
  if (words.length !== 8) return null;
  let v = 0n;
  for (const w of words) v = (v << 16n) | BigInt(w);
  return v;
}

export function v6Words(v: bigint): number[] {
  const out: number[] = [];
  for (let i = 7; i >= 0; i--) out.push(Number((v >> BigInt(i * 16)) & 0xffffn));
  return out;
}

/** RFC 5952 compressed form (lowercase). */
export function v6Str(v: bigint): string {
  const w = v6Words(v);
  let bestStart = -1;
  let bestLen = 0;
  for (let i = 0; i < 8; ) {
    if (w[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && w[j] === 0) j++;
    if (j - i > bestLen && j - i >= 2) {
      bestStart = i;
      bestLen = j - i;
    }
    i = j;
  }
  const hex = w.map((x) => x.toString(16));
  if (bestStart < 0) return hex.join(':');
  const left = hex.slice(0, bestStart).join(':');
  const right = hex.slice(bestStart + bestLen).join(':');
  return `${left}::${right}`;
}

/** IOS displays IPv6 in uppercase. */
export function v6Ios(v: bigint): string {
  return v6Str(v).toUpperCase();
}

export function v6Mask(len: number): bigint {
  if (len <= 0) return 0n;
  if (len >= 128) return MAX;
  return (MAX << BigInt(128 - len)) & MAX;
}

export function v6Net(v: bigint, len: number): bigint {
  return v & v6Mask(len);
}

export function v6InNet(v: bigint, net: bigint, len: number): boolean {
  return v6Net(v, len) === v6Net(net, len);
}

export function parseV6Prefix(s: string): { addr: bigint; len: number } | null {
  const m = /^([0-9a-fA-F:.]+)\/(\d{1,3})$/.exec(s.trim());
  if (!m) return null;
  const addr = parseV6(m[1]);
  const len = Number(m[2]);
  if (addr === null || len > 128) return null;
  return { addr, len };
}

/** Interface identifier (low 64 bits) built from a 48-bit MAC (12 hex chars) using modified EUI-64. */
export function eui64(mac: string): bigint {
  const b = mac.match(/../g)!.map((x) => parseInt(x, 16));
  b[0] ^= 0x02;
  const bytes = [b[0], b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
  let v = 0n;
  for (const x of bytes) v = (v << 8n) | BigInt(x);
  return v;
}

export function linkLocalFromMac(mac: string): bigint {
  return (0xfe80n << 112n) | eui64(mac);
}

export function isLinkLocal(v: bigint): boolean {
  return v >> 118n === 0x3fan; // fe80::/10
}

export function isV6Multicast(v: bigint): boolean {
  return v >> 120n === 0xffn;
}
