/**
 * Password storage formats used by IOS:
 *  - type 5: real MD5-crypt ("$1$salt$hash") so textbook hashes verify,
 *  - type 7: the reversible Cisco Vigenère encoding,
 *  - types 8/9: stable stand-ins with the real shape ("$8$"/"$9$" + 14-char salt + "$" + 43 chars).
 */
import { hash32 } from './mac';

/* ---------------- MD5 ---------------- */

const K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];
const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

function rotl(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0;
}

export function md5(input: number[]): number[] {
  const bytes = input.slice();
  const bitLen = input.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push(i < 4 ? (bitLen >>> (8 * i)) & 0xff : 0);
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  for (let off = 0; off < bytes.length; off += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      M.push((bytes[j] | (bytes[j + 1] << 8) | (bytes[j + 2] << 16) | (bytes[j + 3] << 24)) >>> 0);
    }
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[(i >> 4) * 4 + (i % 4)])) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }
  const out: number[] = [];
  for (const w of [a0, b0, c0, d0]) for (let i = 0; i < 4; i++) out.push((w >>> (8 * i)) & 0xff);
  return out;
}

function utf8(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function to64(v: number, n: number): string {
  let s = '';
  while (n-- > 0) {
    s += ITOA64[v & 0x3f];
    v >>>= 6;
  }
  return s;
}

/** FreeBSD MD5-crypt as used by IOS type 5 secrets. */
export function md5crypt(password: string, salt: string): string {
  const pw = utf8(password);
  const sl = utf8(salt.slice(0, 8));
  const magic = utf8('$1$');
  let ctx = [...pw, ...magic, ...sl];
  const alt = md5([...pw, ...sl, ...pw]);
  for (let pl = pw.length; pl > 0; pl -= 16) ctx.push(...alt.slice(0, Math.min(16, pl)));
  for (let i = pw.length; i; i >>= 1) ctx.push(i & 1 ? 0 : pw[0] ?? 0);
  let fin = md5(ctx);
  for (let i = 0; i < 1000; i++) {
    ctx = [];
    if (i & 1) ctx.push(...pw);
    else ctx.push(...fin);
    if (i % 3) ctx.push(...sl);
    if (i % 7) ctx.push(...pw);
    if (i & 1) ctx.push(...fin);
    else ctx.push(...pw);
    fin = md5(ctx);
  }
  const f = fin;
  let r = '';
  r += to64((f[0] << 16) | (f[6] << 8) | f[12], 4);
  r += to64((f[1] << 16) | (f[7] << 8) | f[13], 4);
  r += to64((f[2] << 16) | (f[8] << 8) | f[14], 4);
  r += to64((f[3] << 16) | (f[9] << 8) | f[15], 4);
  r += to64((f[4] << 16) | (f[10] << 8) | f[5], 4);
  r += to64(f[11], 2);
  return `$1$${salt.slice(0, 8)}$${r}`;
}

/* ---------------- type 7 ---------------- */

const XLAT = 'dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87';

export function type7Encode(plain: string, seed?: number): string {
  const s = seed ?? hash32(plain) % 16;
  let out = String(s).padStart(2, '0');
  for (let i = 0; i < plain.length; i++) {
    const c = plain.charCodeAt(i) ^ XLAT.charCodeAt((s + i) % XLAT.length);
    out += c.toString(16).toUpperCase().padStart(2, '0');
  }
  return out;
}

export function type7Decode(enc: string): string | null {
  if (!/^\d{2}([0-9A-Fa-f]{2})*$/.test(enc)) return null;
  const seed = Number(enc.slice(0, 2));
  if (seed > 52) return null;
  let out = '';
  for (let i = 2, k = 0; i < enc.length; i += 2, k++) {
    out += String.fromCharCode(parseInt(enc.slice(i, i + 2), 16) ^ XLAT.charCodeAt((seed + k) % XLAT.length));
  }
  return out;
}

/* ---------------- types 8/9 (stable stand-ins) ---------------- */

function pseudoHash(input: string, len: number): string {
  let h1 = hash32(input);
  let h2 = hash32(input + '#');
  let s = '';
  for (let i = 0; i < len; i++) {
    h1 = Math.imul(h1 ^ (h1 >>> 15), 0x2c1b3c6d) >>> 0;
    h2 = Math.imul(h2 ^ (h2 >>> 13), 0x297a2d39) >>> 0;
    h1 = (h1 + h2 + i) >>> 0;
    s += ITOA64[(h1 ^ (h2 >>> 7)) & 0x3f];
  }
  return s;
}

function saltFor(password: string, type: number, len: number): string {
  return pseudoHash(`salt:${type}:${password}`, len);
}

export type SecretType = 5 | 8 | 9;

export function makeSecret(password: string, type: SecretType): string {
  if (type === 5) return md5crypt(password, saltFor(password, 5, 4));
  const salt = saltFor(password, type, 14);
  return `$${type}$${salt}$${pseudoHash(`${type}$${salt}$${password}`, 43)}`;
}

/** Verify a candidate password against a stored type 5/8/9 string. */
export function verifySecret(stored: string, candidate: string): boolean {
  const m5 = /^\$1\$([^$]{0,8})\$/.exec(stored);
  if (m5) return md5crypt(candidate, m5[1]) === stored;
  const m = /^\$(8|9)\$([^$]+)\$(.+)$/.exec(stored);
  if (m) return pseudoHash(`${m[1]}$${m[2]}$${candidate}`, 43) === m[3];
  return false;
}

export function secretTypeOf(stored: string): SecretType | null {
  if (stored.startsWith('$1$')) return 5;
  if (stored.startsWith('$8$')) return 8;
  if (stored.startsWith('$9$')) return 9;
  return null;
}
