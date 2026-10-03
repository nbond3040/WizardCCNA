/**
 * Terminal implementation: one per device console (or host command prompt). Handles console login,
 * "Press RETURN", interactive prompts, nested SSH/Telnet sessions, history and console log delivery.
 */
import type { Terminal, TerminalResult } from '../api';
import type { Net } from '../engine/net';
import type { HostDevice, IosDevice, LineCfg } from '../model/state';
import { ipStr } from '../util/ip';
import { authMode, checkCreds, loginReach } from '../engine/services';
import { completeLine, helpText, runLine, exitSubmode } from './ios';
import { flushVlanMode } from './modes';
import { isConfigMode, newSession, promptOf, type Session, type TermIO } from './session';
import { configExitMessage } from '../commands/global';
import { hostExecute, type HostIO } from '../host/shell';

export interface Core {
  net: Net;
  reload(dev: IosDevice, from: TerminalImpl): void;
  vtyCount(devId: string): number;
}

type IosFrame = { kind: 'ios'; s: Session; remote?: { ip: number; label: string; proto: 'ssh' | 'telnet' } };
type HostFrame = { kind: 'host'; dev: HostDevice };
type Frame = IosFrame | HostFrame;

interface Pending {
  prompt: string;
  secret: boolean;
  handler: (input: string) => void;
}

function bannerLines(text: string): string[] {
  return text.split('\n');
}

export class TerminalImpl implements Terminal {
  readonly deviceId: string;
  frames: Frame[] = [];
  stage: 'ready' | 'return' = 'ready';
  private pending: Pending | null = null;
  private buf: string[] = [];
  private hist: string[] = [];
  private clearFlag = false;
  private queued: string[] = [];
  private queuedClear = false;
  private core: Core;

  constructor(core: Core, deviceId: string) {
    this.core = core;
    this.deviceId = deviceId;
    const dev = core.net.dev(deviceId)!;
    if (dev.t === 'host') this.frames = [{ kind: 'host', dev }];
    else {
      this.frames = [{ kind: 'ios', s: newSession(dev, 'console') }];
      if (this.consoleNeedsLogin(dev)) this.stage = 'return';
    }
  }

  private get net(): Net {
    return this.core.net;
  }

  private top(): Frame {
    return this.frames[this.frames.length - 1];
  }

  private consoleNeedsLogin(dev: IosDevice): boolean {
    const con = dev.st.cfg.lines.con;
    const m = authMode(dev, con);
    return m === 'local' || (m === 'line' && !!con.password);
  }

  /* ---------------- Terminal API ---------------- */

  prompt(): string {
    if (this.pending) return this.pending.prompt;
    if (this.stage === 'return') return '';
    const f = this.top();
    if (f.kind === 'host') return 'C:\\>';
    return promptOf(f.s);
  }

  isSecretInput(): boolean {
    return !!this.pending?.secret;
  }

  greeting(): string {
    const dev = this.net.dev(this.deviceId)!;
    if (dev.t === 'host') return dev.kind === 'cloud' ? '' : 'Cisco Packet Tracer PC Command Line 1.0\n';
    return '\nPress RETURN to get started.\n';
  }

  history(): string[] {
    return [...this.hist];
  }

  execute(line: string): TerminalResult {
    const net = this.net;
    this.buf.length = 0;
    this.clearFlag = false;
    if (this.queued.length || this.queuedClear) {
      this.buf.push(...this.queued);
      this.clearFlag = this.queuedClear;
      this.queued = [];
      this.queuedClear = false;
    }
    const promptLen = this.prompt().length;
    try {
      if (this.pending) {
        const p = this.pending;
        this.pending = null;
        p.handler(line);
      } else if (this.stage === 'return') {
        this.startConsole();
      } else {
        const f = this.top();
        const t = line.trim();
        if (t && !t.endsWith('?')) {
          this.hist.push(line);
          if (this.hist.length > 256) this.hist.shift();
          if (f.kind === 'ios') {
            f.s.hist.push(t);
            if (f.s.hist.length > 20) f.s.hist.shift();
          }
        }
        if (f.kind === 'host') hostExecute(this.hostIO(f.dev), line);
        else {
          f.s.lastActive = net.clock;
          runLine(net, f.s, line, this.io(f, promptLen), this.buf);
        }
      }
    } catch (e) {
      this.buf.push(`% Simulator error: ${(e as Error).message}`);
    }
    net.tick();
    if (net.needsCommit) net.commit();
    this.flushLogs();
    const out: TerminalResult = { output: this.buf.join('\n') };
    if (this.clearFlag) out.clear = true;
    return out;
  }

  complete(line: string): { line: string; options: string[] } {
    if (this.pending || this.stage === 'return') return { line, options: [] };
    const f = this.top();
    if (f.kind === 'host') return { line, options: [] };
    try {
      return completeLine(f.s, line);
    } catch {
      return { line, options: [] };
    }
  }

  help(line: string): string {
    if (this.pending || this.stage === 'return') return '';
    const f = this.top();
    if (f.kind === 'host') return '';
    try {
      return helpText(f.s, line, this.prompt().length);
    } catch {
      return '';
    }
  }

  interrupt(kind: 'ctrl-c' | 'ctrl-z'): TerminalResult {
    this.buf.length = 0;
    this.clearFlag = false;
    const echo = kind === 'ctrl-c' ? '^C' : '^Z';
    if (this.pending) {
      this.pending = null;
      return { output: echo };
    }
    const f = this.top();
    if (f.kind === 'ios' && isConfigMode(f.s.mode)) {
      flushVlanMode(this.net, f.s);
      exitSubmode(f.s, 'priv');
      configExitMessage({ net: this.net, dev: f.s.dev, s: f.s, a: {}, neg: false, dflt: false, line: '', out: this.buf, io: this.io(f, 0) });
      if (this.net.needsCommit) this.net.commit();
      this.flushLogs();
      return { output: [echo, ...this.buf].join('\n') };
    }
    return { output: kind === 'ctrl-c' ? echo : '' };
  }

  /* ---------------- internals ---------------- */

  ask(prompt: string, handler: (input: string) => void, secret = false): void {
    this.pending = { prompt, secret, handler };
  }

  private io(f: IosFrame, promptLen: number): TermIO {
    return {
      ask: (prompt, handler, opts) => this.ask(prompt, handler, !!opts?.secret),
      remote: (proto, ip, user, label) => this.openRemote(proto, ip, user, label),
      exitSession: () => this.exitFrame(),
      reload: () => this.core.reload(f.s.dev, this),
      clearScreen: () => {
        this.clearFlag = true;
      },
      vtyBusy: (id) => this.core.vtyCount(id),
      interactive: true,
      promptLen,
    };
  }

  private hostIO(dev: HostDevice): HostIO {
    return {
      net: this.net,
      dev,
      out: this.buf,
      ask: (prompt, handler, secret) => this.ask(prompt, handler, !!secret),
      remote: (proto, ip, user, label) => this.openRemote(proto, ip, user, label),
      clear: () => {
        this.clearFlag = true;
      },
    };
  }

  private flushLogs(): void {
    const dev = this.net.ios(this.deviceId);
    if (!dev) return;
    const logs = this.net.takeConsole(this.deviceId);
    if (logs.length) this.buf.push(...logs);
  }

  /** Queue output for the next interaction (used when another terminal reloads this device). */
  queue(lines: string[], clear = false): void {
    this.queued.push(...lines);
    if (clear) this.queuedClear = true;
  }

  private startConsole(): void {
    const base = this.frames[0];
    if (base.kind !== 'ios') {
      this.stage = 'ready';
      return;
    }
    const dev = base.s.dev;
    this.stage = 'ready';
    this.frames = [{ kind: 'ios', s: newSession(dev, 'console') }];
    const cfg = dev.st.cfg;
    if (cfg.bannerMotd !== undefined) this.buf.push('', ...bannerLines(cfg.bannerMotd));
    const con = cfg.lines.con;
    const mode = authMode(dev, con);
    if (mode === 'none' || (mode === 'line' && !con.password)) {
      if (cfg.bannerExec !== undefined) this.buf.push(...bannerLines(cfg.bannerExec));
      return;
    }
    if (cfg.bannerLogin !== undefined) this.buf.push(...bannerLines(cfg.bannerLogin));
    this.buf.push('', 'User Access Verification', '');
    const s = (this.frames[0] as IosFrame).s;
    this.login(dev, con, mode, 'console', undefined, (priv, user) => {
      s.priv = priv;
      s.mode = priv >= 15 ? 'priv' : 'user';
      s.user = user;
    }, () => {
      this.buf.push('', `${cfg.hostname} con0 is now available`, '', '', '', '', '', 'Press RETURN to get started.', '');
      this.stage = 'return';
    });
  }

  private login(
    dev: IosDevice,
    line: LineCfg,
    auth: 'none' | 'line' | 'local',
    proto: 'console' | 'telnet' | 'ssh',
    user: string | undefined,
    done: (priv: number, user?: string) => void,
    fail: () => void,
  ): void {
    if (auth === 'none') {
      done(line.privilege ?? 1, user);
      return;
    }
    if (auth === 'line' && !line.password && proto !== 'ssh') {
      if (proto === 'console') {
        done(line.privilege ?? 1);
        return;
      }
      this.buf.push('', 'Password required, but none set', '');
      fail();
      return;
    }
    let tries = 0;
    const askUser = () =>
      this.ask('Username: ', (u) => {
        askPass(u.trim());
      });
    const askPass = (u?: string) =>
      this.ask(
        'Password: ',
        (p) => {
          const r = checkCreds(dev, line, auth, proto, u, p);
          if (r.ok) {
            done(r.privilege, u);
            return;
          }
          tries++;
          if (proto === 'ssh') {
            if (tries >= 3) {
              this.buf.push('% Authentication failed.');
              fail();
              return;
            }
            askPass(u);
            return;
          }
          if (auth === 'line') {
            if (tries >= 3) {
              this.buf.push('% Bad passwords', '');
              fail();
              return;
            }
            askPass(u);
            return;
          }
          this.buf.push('% Login invalid', '');
          if (tries >= 3) {
            fail();
            return;
          }
          askUser();
        },
        true,
      );
    if (auth === 'local' && user === undefined) askUser();
    else askPass(user);
  }

  private fromDevice() {
    const f = this.top();
    return f.kind === 'host' ? f.dev : f.s.dev;
  }

  openRemote(proto: 'ssh' | 'telnet', ip: number, user: string | undefined, label?: string): void {
    const net = this.net;
    const from = this.fromDevice();
    const lbl = label ?? ipStr(ip);
    const isHost = from.t === 'host';
    if (proto === 'telnet') this.buf.push(isHost ? `Connecting To ${lbl}...` : `Trying ${lbl === ipStr(ip) ? lbl : `${lbl} (${ipStr(ip)})`} ...`);
    const r = loginReach(net, from, ip, proto, 0);
    if (!r.ok || !r.target) {
      if (isHost && proto === 'ssh') this.buf.push(`ssh: connect to host ${ipStr(ip)} port 22: ${r.msg?.includes('refused') ? 'Connection refused' : 'Connection timed out'}`);
      else if (isHost) this.buf[this.buf.length - 1] += 'Could not open connection to the host, on port 23: Connect failed';
      else this.buf.push(r.msg ?? '% Connection timed out; remote host not responding');
      return;
    }
    const target = r.target;
    const idx = this.core.vtyCount(target.id);
    const vty = target.st.cfg.lines.vty;
    if (idx >= vty.length) {
      this.buf.push('% Connection refused by remote host');
      return;
    }
    const line = vty[idx];
    const auth = authMode(target, line);
    const cfg = target.st.cfg;
    if (proto === 'telnet') {
      if (!isHost) this.buf[this.buf.length - 1] += ' Open';
      if (cfg.bannerMotd !== undefined) this.buf.push(...bannerLines(cfg.bannerMotd));
      if (auth !== 'none') this.buf.push('', 'User Access Verification', '');
    } else if (cfg.bannerLogin !== undefined) this.buf.push(...bannerLines(cfg.bannerLogin));
    if (proto === 'ssh' && !user) {
      this.buf.push('% No user specified nor available for SSH client');
      return;
    }
    if (proto === 'ssh' && auth === 'line') {
      // SSH needs a username database (login local / AAA); the password prompt always fails
    }
    this.login(
      target,
      line,
      auth,
      proto,
      proto === 'ssh' ? user : undefined,
      (priv, u) => {
        const s = newSession(target, 'vty', priv);
        s.user = u ?? '';
        s.peerIp = r.srcIp;
        s.vtyLine = idx;
        s.proto = proto;
        if (proto === 'ssh' && cfg.bannerMotd !== undefined) this.buf.push('', ...bannerLines(cfg.bannerMotd));
        if (cfg.bannerExec !== undefined) this.buf.push(...bannerLines(cfg.bannerExec));
        this.frames.push({ kind: 'ios', s, remote: { ip, label: lbl, proto } });
      },
      () => {
        this.buf.push(proto === 'ssh' ? `[Connection to ${lbl} aborted: error status 0]` : `[Connection to ${lbl} closed by foreign host]`);
      },
    );
  }

  exitFrame(): void {
    const f = this.top();
    if (this.frames.length > 1 && f.kind === 'ios') {
      flushVlanMode(this.net, f.s);
      this.frames.pop();
      this.buf.push('', `[Connection to ${f.remote?.label ?? '?'} closed by foreign host]`);
      return;
    }
    if (f.kind === 'ios') {
      flushVlanMode(this.net, f.s);
      this.buf.push('', `${f.s.dev.st.cfg.hostname} con0 is now available`, '', '', '', '', '', 'Press RETURN to get started.', '');
      this.stage = 'return';
      this.frames = [{ kind: 'ios', s: newSession(f.s.dev, 'console') }];
    }
  }

  /** Drop nested sessions that target a device (e.g. after it reloads). */
  dropSessionsTo(devId: string): void {
    const i = this.frames.findIndex((f, n) => n > 0 && f.kind === 'ios' && f.s.dev.id === devId);
    if (i < 0) return;
    const f = this.frames[i] as IosFrame;
    this.frames = this.frames.slice(0, i);
    this.buf.push('', `[Connection to ${f.remote?.label ?? '?'} closed by foreign host]`);
  }

  /** Reset the console after the device reloaded. */
  resetConsole(boot: string[], current: boolean): void {
    const base = this.frames[0];
    if (base.kind !== 'ios') return;
    this.frames = [{ kind: 'ios', s: newSession(base.s.dev, 'console') }];
    this.pending = null;
    this.stage = 'return';
    if (current) {
      this.buf.push(...boot);
      this.clearFlag = true;
    } else this.queue(boot, true);
  }

  /** Sessions currently open on a device (for `show users`). */
  sessionsFor(devId: string): { vty: IosFrame[]; console: boolean } {
    const vty = this.frames.filter((f, i): f is IosFrame => i > 0 && f.kind === 'ios' && f.s.dev.id === devId);
    const base = this.frames[0];
    const console = base.kind === 'ios' && base.s.dev.id === devId && this.stage === 'ready';
    return { vty, console };
  }

  isTopSession(s: Session): boolean {
    const f = this.top();
    return f.kind === 'ios' && f.s === s;
  }

  /** the console session of this terminal's own device (undefined for hosts) */
  consoleSession(): Session | undefined {
    const base = this.frames[0];
    return base.kind === 'ios' ? base.s : undefined;
  }
}
