/** Text formatting helpers shared by show commands. */

export function pad(s: string | number, n: number): string {
  const t = String(s);
  return t.length >= n ? t : t + ' '.repeat(n - t.length);
}

export function padL(s: string | number, n: number): string {
  const t = String(s);
  return t.length >= n ? t : ' '.repeat(n - t.length) + t;
}

/** Pad to width but always keep at least one space after the value. */
export function col(s: string | number, n: number): string {
  const t = String(s);
  return t.length >= n ? t + ' ' : t + ' '.repeat(n - t.length);
}

/** VLAN / number ranges: [[1,1],[10,20]] */
export type Ranges = [number, number][];

export function parseRangeList(s: string, min: number, max: number): Ranges | null {
  const out: Ranges = [];
  const t = s.replace(/\s+/g, '');
  if (!t) return null;
  for (const part of t.split(',')) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!m) return null;
    const a = Number(m[1]);
    const b = m[2] !== undefined ? Number(m[2]) : a;
    if (a < min || b > max || a > b) return null;
    out.push([a, b]);
  }
  return normRanges(out);
}

export function normRanges(r: Ranges): Ranges {
  const s = [...r].sort((x, y) => x[0] - y[0]);
  const out: Ranges = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

export function rangesHas(r: Ranges, v: number): boolean {
  return r.some(([a, b]) => v >= a && v <= b);
}

export function rangesFromList(list: number[]): Ranges {
  return normRanges(list.map((v) => [v, v] as [number, number]));
}

export function rangesToList(r: Ranges): number[] {
  const out: number[] = [];
  for (const [a, b] of r) for (let v = a; v <= b; v++) out.push(v);
  return out;
}

export function rangesStr(r: Ranges): string {
  if (!r.length) return 'none';
  return r.map(([a, b]) => (a === b ? String(a) : `${a}-${b}`)).join(',');
}

export function rangesSubtract(r: Ranges, s: Ranges): Ranges {
  let out: Ranges = r.map(([a, b]) => [a, b]);
  for (const [sa, sb] of s) {
    const next: Ranges = [];
    for (const [a, b] of out) {
      if (sb < a || sa > b) next.push([a, b]);
      else {
        if (sa > a) next.push([a, sa - 1]);
        if (sb < b) next.push([sb + 1, b]);
      }
    }
    out = next;
  }
  return normRanges(out);
}

export function rangesIntersect(r: Ranges, s: Ranges): Ranges {
  const out: Ranges = [];
  for (const [a, b] of r)
    for (const [c, d] of s) {
      const lo = Math.max(a, c);
      const hi = Math.min(b, d);
      if (lo <= hi) out.push([lo, hi]);
    }
  return normRanges(out);
}

export function rangesEqual(r: Ranges, s: Ranges): boolean {
  const a = normRanges(r);
  const b = normRanges(s);
  return a.length === b.length && a.every((x, i) => x[0] === b[i][0] && x[1] === b[i][1]);
}

/* ---------------- time ---------------- */

/** Sim epoch: Mon Mar 1 1993 00:00:00 UTC (the IOS default clock). */
export const EPOCH_MS = Date.UTC(1993, 2, 1, 0, 0, 0);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthIndex(name: string): number {
  return MONTHS.findIndex((m) => m.toLowerCase() === name.slice(0, 3).toLowerCase());
}

function two(n: number): string {
  return String(n).padStart(2, '0');
}

/** "00:05:12.345 UTC Mon Mar 1 1993" */
export function iosClock(ms: number, tz = 'UTC', offsetMin = 0): string {
  const d = new Date(ms + offsetMin * 60000);
  return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}.${String(d.getUTCMilliseconds()).padStart(3, '0')} ${tz} ${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} ${d.getUTCFullYear()}`;
}

/** Log timestamp "Mar  1 00:05:12.345" */
export function logStamp(ms: number, offsetMin = 0): string {
  const d = new Date(ms + offsetMin * 60000);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, ' ')} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}.${String(d.getUTCMilliseconds()).padStart(3, '0')}`;
}

/** `service timestamps log|debug <format>`: `uptime`, or `datetime` with msec / localtime / show-timezone / year. */
export interface TsFormat {
  uptime: boolean;
  msec: boolean;
  localtime: boolean;
  showTz: boolean;
  year: boolean;
}

export const DEFAULT_TS_FORMAT = 'datetime msec';

/** Parse the words after `service timestamps log|debug` (keywords may be abbreviated; none means `uptime`, as on IOS). */
export function parseTsFormat(words: string | undefined): TsFormat {
  const f: TsFormat = { uptime: false, msec: false, localtime: false, showTz: false, year: false };
  const toks = (words ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const is = (t: string, kw: string) => kw.startsWith(t);
  let datetime = false;
  for (const t of toks) {
    if (is(t, 'uptime')) f.uptime = true;
    else if (is(t, 'datetime')) datetime = true;
    else if (is(t, 'msec')) f.msec = true;
    else if (is(t, 'localtime')) f.localtime = true;
    else if (is(t, 'show-timezone')) f.showTz = true;
    else if (is(t, 'year')) f.year = true;
  }
  if (f.uptime || !datetime) return { uptime: true, msec: false, localtime: false, showTz: false, year: false };
  return f;
}

/** Canonical running-config text of a timestamp format. */
export function tsFormatText(f: TsFormat): string {
  if (f.uptime) return 'uptime';
  return ['datetime', f.msec && 'msec', f.localtime && 'localtime', f.showTz && 'show-timezone', f.year && 'year'].filter(Boolean).join(' ');
}

/**
 * The "<stamp>: " prefix of a log message. Uptime stamps look like `00:05:52: ` (then `1d02h: `, `1w2d: `);
 * date stamps like `*Mar  1 00:05:52.123: ` where the leading `*` means the clock is not authoritative.
 */
export function logTimestamp(f: TsFormat, wallMs: number, uptimeSec: number, authoritative: boolean, tz?: { name: string; offsetMin: number }): string {
  if (f.uptime) return `${age(uptimeSec)}: `;
  const d = new Date(wallMs + (f.localtime && tz ? tz.offsetMin * 60000 : 0));
  const day = String(d.getUTCDate()).padStart(2, ' ');
  const time = `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}${f.msec ? `.${String(d.getUTCMilliseconds()).padStart(3, '0')}` : ''}`;
  const zone = f.showTz ? ` ${f.localtime && tz ? tz.name : 'UTC'}` : '';
  return `${authoritative ? '' : '*'}${MONTHS[d.getUTCMonth()]} ${day} ${f.year ? `${d.getUTCFullYear()} ` : ''}${time}${zone}: `;
}

/** "Mar 02 1993 12:05 AM" (DHCP lease expiration format) */
export function leaseStamp(ms: number): string {
  const d = new Date(ms);
  let h = d.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${MONTHS[d.getUTCMonth()]} ${two(d.getUTCDate())} ${d.getUTCFullYear()} ${two(h)}:${two(d.getUTCMinutes())} ${ampm}`;
}

/** "00:01:23" */
export function hms(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${two(Math.floor(s / 3600))}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
}

/** IOS age format: 00:00:12, then 1d02h, 1w2d */
export function age(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  if (s < 86400) return hms(s);
  const d = Math.floor(s / 86400);
  if (d < 7) return `${d}d${two(Math.floor((s % 86400) / 3600))}h`;
  return `${Math.floor(d / 7)}w${d % 7}d`;
}

/** "5 minutes", "1 hour, 2 minutes" */
export function uptime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const w = Math.floor(s / 604800);
  const d = Math.floor((s % 604800) / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  const unit = (n: number, u: string) => `${n} ${u}${n === 1 ? '' : 's'}`;
  if (w) parts.push(unit(w, 'week'));
  if (d) parts.push(unit(d, 'day'));
  if (h) parts.push(unit(h, 'hour'));
  parts.push(unit(m, 'minute'));
  return parts.join(', ');
}

/** Windows-style date: "Saturday, September 26, 2026 10:15:00 AM" */
export function winDate(ms: number): string {
  const d = new Date(ms);
  const long = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let h = d.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${long[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${h}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} ${ampm}`;
}

/** Wrap a comma-separated list into lines of at most `per` items. */
export function chunk<T>(items: T[], per: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += per) out.push(items.slice(i, i + per));
  return out;
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Compile an IOS-style regex; fall back to a literal match when the pattern is not valid JS. */
export function iosRegex(pattern: string, flags = ''): RegExp {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return new RegExp(escapeRegex(pattern), flags);
  }
}
