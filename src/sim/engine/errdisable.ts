/**
 * Error-disable bookkeeping and automatic recovery (`errdisable recovery cause <cause>` / `interval <sec>`).
 *
 * A port that is err-disabled remembers the simulated time it was shut down (`IfDyn.errAt`). As time passes
 * (`Net.tick`) `recoverErrdisabled` re-enables every port whose cause has recovery enabled once the recovery
 * interval is over. Nothing here removes the cause: a BPDU guard port that still hears a switch is err-disabled
 * again by the next derived-state pass, a port-security port when the violating device sends its next frame.
 */
import { ifDyn, type DevCfg, type IfDyn, type IosDevice } from '../model/state';
import { shortIf } from '../model/ifname';
import type { Net } from './net';

export const DEFAULT_ERR_INTERVAL = 300;

/** Causes in the order `show errdisable recovery` lists them. */
export const RECOVERY_CAUSES = [
  'arp-inspection',
  'bpduguard',
  'channel-misconfig (STP)',
  'dhcp-rate-limit',
  'dtp-flap',
  'gbic-invalid',
  'inline-power',
  'l2ptguard',
  'link-flap',
  'mac-limit',
  'link-monitor-failure',
  'loopback',
  'oam-remote-failure',
  'pagp-flap',
  'port-mode-failure',
  'pppoe-ia-rate-limit',
  'psecure-violation',
  'security-violation',
  'sfp-config-mismatch',
  'storm-control',
  'udld',
  'unicast-flood',
  'vmps',
];

/** Causes `errdisable detect cause` can switch off (psecure-violation and bpduguard have their own knobs). */
export const DETECT_CAUSES = ['arp-inspection', 'dhcp-rate-limit', 'dtp-flap', 'gbic-invalid', 'inline-power', 'l2ptguard', 'link-flap', 'loopback', 'pagp-flap', 'sfp-config-mismatch'];

/** First word of a cause as `show` prints it ("channel-misconfig (STP)" is configured as `channel-misconfig`). */
export function causeKey(cause: string): string {
  return cause.split(' ')[0];
}

export function recoveryEnabled(cfg: DevCfg, cause: string): boolean {
  return cfg.errRecovery.includes('all') || cfg.errRecovery.includes(causeKey(cause));
}

export function errInterval(cfg: DevCfg): number {
  return cfg.errInterval ?? DEFAULT_ERR_INTERVAL;
}

/** Put a port into err-disabled state and start its recovery timer. False when it already was err-disabled. */
export function errDisable(net: Net, dev: IosDevice, ifName: string, reason: string): boolean {
  const dd = ifDyn(dev, ifName);
  if (dd.errDisabled) return false;
  dd.errDisabled = reason;
  dd.errAt = net.clock;
  return true;
}

/** Leave the err-disabled state (manual `shutdown`, `clear errdisable interface`, automatic recovery). */
export function clearErrDisable(dd: IfDyn | undefined): void {
  if (!dd) return;
  dd.errDisabled = undefined;
  dd.errAt = undefined;
}

/** Seconds until the recovery timer of an err-disabled port fires. */
export function errTimeLeft(net: Net, dev: IosDevice, dd: IfDyn): number {
  const since = dd.errAt ?? net.clock;
  return Math.max(0, Math.ceil((errInterval(dev.st.cfg) * 1000 - (net.clock - since)) / 1000));
}

/**
 * Simulated time has passed: bring back every err-disabled port whose cause has recovery enabled and whose
 * interval is over. Returns true when a port was re-enabled (the link-up logs follow from the next commit).
 */
export function recoverErrdisabled(net: Net): boolean {
  if (net.dry) return false;
  let changed = false;
  for (const dev of net.iosDevices()) {
    const cfg = dev.st.cfg;
    for (const [name, dd] of Object.entries(dev.st.dyn.ifd)) {
      if (!dd.errDisabled) continue;
      // snapshots from before the timer existed: it starts when the port is first seen err-disabled
      dd.errAt ??= net.clock;
      if (!recoveryEnabled(cfg, dd.errDisabled)) continue;
      if (net.clock - dd.errAt < errInterval(cfg) * 1000) continue;
      const reason = dd.errDisabled;
      clearErrDisable(dd);
      net.log(dev.id, `%PM-4-ERR_RECOVER: Attempting to recover from ${reason} err-disable state on ${shortIf(name)}`);
      changed = true;
    }
  }
  if (changed) net.touch();
  return changed;
}
