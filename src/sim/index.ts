/**
 * WizardCCNA network simulator — public API (docs/SIMULATOR_SPEC.md §1).
 */
import type { HostConfig, LabCheck, LabDevice, LabLink } from '../content/labTypes';
import type {
  CheckResult,
  PacketTrace,
  SimDeviceInfo,
  SimLinkInfo,
  SimSnapshot,
  Terminal,
} from './api';

export type {
  CheckResult,
  DeviceKind,
  IfStatus,
  PacketHop,
  PacketTrace,
  SimDeviceInfo,
  SimInterfaceInfo,
  SimLinkInfo,
  SimSnapshot,
  Terminal,
  TerminalResult,
} from './api';

export type LabTopology = { devices: LabDevice[]; links: LabLink[] };

/** Temporary stub — replaced by the real engine. */
export class NetworkSim {
  private lab: LabTopology;
  constructor(lab: LabTopology) {
    this.lab = lab;
  }
  static fromSnapshot(lab: LabTopology, _snap: SimSnapshot): NetworkSim {
    return new NetworkSim(lab);
  }
  snapshot(): SimSnapshot {
    return { version: 1 };
  }
  devices(): SimDeviceInfo[] {
    return [];
  }
  links(): SimLinkInfo[] {
    return [];
  }
  terminal(deviceId: string): Terminal {
    return {
      deviceId,
      prompt: () => `${deviceId}>`,
      isSecretInput: () => false,
      execute: () => ({ output: '' }),
      complete: (line: string) => ({ line, options: [] }),
      help: () => '',
      interrupt: () => ({ output: '' }),
      history: () => [],
      greeting: () => '\nPress RETURN to get started.\n',
    };
  }
  hostConfig(_deviceId: string): HostConfig & { assigned?: { ip: string; mask: string; gateway?: string; dns?: string } } {
    return {};
  }
  setHostConfig(_deviceId: string, _cfg: HostConfig): void {}
  runningConfig(_deviceId: string): string {
    return '';
  }
  check(_check: LabCheck): CheckResult {
    return { pass: false, detail: `not implemented (${this.lab.devices.length} devices)` };
  }
  tracePing(_from: string, _to: string): PacketTrace {
    return { success: false, summary: 'not implemented', forward: [], reply: [] };
  }
  subscribe(_listener: () => void): () => void {
    return () => {};
  }
}
