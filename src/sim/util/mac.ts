/** MAC addresses are stored as 12 lowercase hex chars ("00014a2b3c01"). */

export function macDotted(mac: string): string {
  return `${mac.slice(0, 4)}.${mac.slice(4, 8)}.${mac.slice(8, 12)}`;
}

export function macDashed(mac: string, upper = true): string {
  const s = mac.match(/../g)!.join('-');
  return upper ? s.toUpperCase() : s;
}

export function macColon(mac: string): string {
  return mac.match(/../g)!.join(':').toUpperCase();
}

/** Parse H.H.H (Cisco), xx-xx-.., xx:xx:.. or bare hex. */
export function parseMac(s: string): string | null {
  const t = s.trim().toLowerCase();
  let m = /^([0-9a-f]{1,4})\.([0-9a-f]{1,4})\.([0-9a-f]{1,4})$/.exec(t);
  if (m) return m.slice(1, 4).map((g) => g.padStart(4, '0')).join('');
  m = /^([0-9a-f]{2})([-:])([0-9a-f]{2})\2([0-9a-f]{2})\2([0-9a-f]{2})\2([0-9a-f]{2})\2([0-9a-f]{2})$/.exec(t);
  if (m) return [m[1], m[3], m[4], m[5], m[6], m[7]].join('');
  if (/^[0-9a-f]{12}$/.test(t)) return t;
  return null;
}

export function macAdd(mac: string, n: number): string {
  const v = parseInt(mac, 16) + n;
  return v.toString(16).padStart(12, '0').slice(-12);
}

export const BROADCAST_MAC = 'ffffffffffff';

/** Small deterministic string hash (FNV-1a 32-bit). */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
