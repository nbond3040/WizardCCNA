/** IPv4 helpers. Addresses and masks are unsigned 32-bit numbers. */

export function parseIp(s: string): number | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return null;
  const parts = s.split('.').map(Number);
  if (parts.some((p) => p > 255)) return null;
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
}

export function ipStr(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

export function maskFromLen(len: number): number {
  if (len <= 0) return 0;
  if (len >= 32) return 0xffffffff;
  return (0xffffffff << (32 - len)) >>> 0;
}

/** Prefix length of a contiguous mask, or -1 when the mask is not contiguous. */
export function maskLen(mask: number): number {
  let len = 0;
  let m = mask >>> 0;
  while (len < 32 && (m & 0x80000000) !== 0) {
    len++;
    m = (m << 1) >>> 0;
  }
  return m === 0 ? len : -1;
}

export function isMask(mask: number): boolean {
  return maskLen(mask) >= 0;
}

export function wildcard(mask: number): number {
  return ~mask >>> 0;
}

export function netOf(ip: number, mask: number): number {
  return (ip & mask) >>> 0;
}

export function bcastOf(ip: number, mask: number): number {
  return (ip | ~mask) >>> 0;
}

export function inNet(ip: number, net: number, mask: number): boolean {
  return ((ip & mask) >>> 0) === ((net & mask) >>> 0);
}

/** Classful prefix length of an address (A=8, B=16, C=24, D/E=32). */
export function classfulLen(ip: number): number {
  const first = ip >>> 24;
  if (first < 128) return 8;
  if (first < 192) return 16;
  if (first < 224) return 24;
  return 32;
}

export function parsePrefix(s: string): { addr: number; len: number } | null {
  const m = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const addr = parseIp(m[1]);
  const len = Number(m[2]);
  if (addr === null || len > 32) return null;
  return { addr: netOf(addr, maskFromLen(len)), len };
}

export function prefixStr(addr: number, len: number): string {
  return `${ipStr(addr)}/${len}`;
}

export function isMulticast(ip: number): boolean {
  return ip >>> 28 === 14;
}

export function isLoopbackNet(ip: number): boolean {
  return ip >>> 24 === 127;
}

/** Usable host check for an address in its subnet (not network / broadcast unless /31 /32). */
export function isHostAddr(ip: number, mask: number): boolean {
  const len = maskLen(mask);
  if (len >= 31) return true;
  return ip !== netOf(ip, mask) && ip !== bcastOf(ip, mask);
}

export function wildcardMatches(ip: number, addr: number, wc: number): boolean {
  return ((ip | wc) >>> 0) === ((addr | wc) >>> 0);
}
