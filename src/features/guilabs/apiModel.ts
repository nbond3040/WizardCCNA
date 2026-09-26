/** A small mock of the Cisco Catalyst Center (formerly DNA Center) Intent API for the REST lab. */

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: { key: string; value: string }[];
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  ms: number;
}

export interface Site {
  id: string;
  name: string;
  parentName: string;
  type: 'area' | 'building' | 'floor';
}

export interface ApiState {
  tokens: string[];
  sites: Site[];
  log: { req: ApiRequest; res: ApiResponse; at: number }[];
}

export const BASE = 'https://sandboxdnac.example.com';
export const CREDS = { user: 'devnetuser', pass: 'Cisco123!' };

export const DEVICES = [
  { id: '1cfd383a-7265-47fb-96b3-f069191a0ed5', hostname: 'cat9k-core-1', managementIpAddress: '10.10.20.51', platformId: 'C9500-24Y4C', family: 'Switches and Hubs', role: 'CORE', softwareVersion: '17.9.4', serialNumber: 'FDO2317X0Q4', reachabilityStatus: 'Reachable', upTime: '91 days, 3:12:04.11', macAddress: '70:db:98:1e:0a:80', type: 'Cisco Catalyst 9500 Switch' },
  { id: 'aa0a5258-3e6f-422f-9c4e-9c196db115ae', hostname: 'cat9k-access-1', managementIpAddress: '10.10.20.81', platformId: 'C9300-48U', family: 'Switches and Hubs', role: 'ACCESS', softwareVersion: '17.9.4', serialNumber: 'FJC2327U0S2', reachabilityStatus: 'Reachable', upTime: '44 days, 6:30:15.02', macAddress: '0c:d0:f8:94:26:00', type: 'Cisco Catalyst 9300 Switch' },
  { id: '5c9f4a1e-2c1d-4b8f-8a55-6f3d2f0c7a11', hostname: 'cat9k-access-2', managementIpAddress: '10.10.20.82', platformId: 'C9300-48U', family: 'Switches and Hubs', role: 'ACCESS', softwareVersion: '17.6.5', serialNumber: 'FJC2331T1AB', reachabilityStatus: 'Unreachable', upTime: '0 days, 0:00:00.00', macAddress: '0c:d0:f8:94:3a:80', type: 'Cisco Catalyst 9300 Switch' },
  { id: '9a3d0e3c-6a2e-4d5f-b1f2-0e4a7c9d2b33', hostname: 'isr4451-wan-1', managementIpAddress: '10.10.20.1', platformId: 'ISR4451-X/K9', family: 'Routers', role: 'BORDER ROUTER', softwareVersion: '17.9.3a', serialNumber: 'FGL2211A0KX', reachabilityStatus: 'Reachable', upTime: '120 days, 1:05:44.60', macAddress: '00:c8:8b:80:bb:00', type: 'Cisco 4451 Integrated Services Router' },
  { id: 'e3b7c4d2-8f9a-4c1b-9d7e-2a6f5b8c1d44', hostname: 'wlc-9800-1', managementIpAddress: '10.10.20.60', platformId: 'C9800-40-K9', family: 'Wireless Controller', role: 'ACCESS', softwareVersion: '17.9.4', serialNumber: 'TTM2410019Z', reachabilityStatus: 'Reachable', upTime: '30 days, 12:00:02.40', macAddress: '00:1e:f6:5c:1d:ff', type: 'Cisco Catalyst 9800-40 Wireless Controller' },
  { id: '7f1e2d3c-4b5a-4968-8776-6e5d4c3b2a55', hostname: 'ap9120-floor2', managementIpAddress: '10.10.40.23', platformId: 'C9120AXI-B', family: 'Unified AP', role: 'ACCESS', softwareVersion: '17.9.4.27', serialNumber: 'FJC23461J0K', reachabilityStatus: 'Unreachable', upTime: 'N/A', macAddress: '2c:57:41:5a:2e:40', type: 'Cisco Catalyst 9120AXI Unified Access Point' },
];

export function initialApi(): ApiState {
  return {
    tokens: [],
    sites: [{ id: 'd6b9e2a1-0000-4000-8000-000000000001', name: 'Global', parentName: '', type: 'area' }],
    log: [],
  };
}

const STATUS: Record<number, string> = { 200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 415: 'Unsupported Media Type', 500: 'Internal Server Error' };

const rid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

function header(req: ApiRequest, name: string) {
  return req.headers.find((h) => h.key.trim().toLowerCase() === name.toLowerCase())?.value.trim();
}

export function b64(s: string) {
  try {
    return btoa(unescape(encodeURIComponent(s)));
  } catch {
    return '';
  }
}

function unb64(s: string) {
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return '';
  }
}

/** Handle one request against the mock controller, returning the response and the next state. */
export function handle(state: ApiState, req: ApiRequest): { res: ApiResponse; state: ApiState } {
  const t0 = 40 + Math.round(Math.random() * 120);
  const reply = (status: number, body: unknown, extra: Record<string, string> = {}): ApiResponse => ({
    status,
    statusText: STATUS[status] ?? '',
    headers: { 'content-type': 'application/json;charset=UTF-8', ...extra },
    body,
    ms: t0,
  });
  let next = state;
  let url: URL;
  try {
    url = new URL(req.url.startsWith('http') ? req.url : BASE + (req.url.startsWith('/') ? '' : '/') + req.url);
  } catch {
    return { res: reply(400, { error: 'Malformed URL' }), state };
  }
  const path = url.pathname.replace(/\/+$/, '');
  const auth = () => {
    const tok = header(req, 'X-Auth-Token');
    if (!tok || !state.tokens.includes(tok)) return reply(401, { error: 'Unauthorized: missing or invalid X-Auth-Token header' });
    return null;
  };

  let res: ApiResponse;
  if (path === '/dna/system/api/v1/auth/token') {
    if (req.method !== 'POST') res = reply(405, { error: 'Method Not Allowed. Use POST.' });
    else {
      const a = header(req, 'Authorization') ?? '';
      const [scheme, value] = a.split(/\s+/);
      const creds = scheme?.toLowerCase() === 'basic' ? unb64(value ?? '') : '';
      if (creds === `${CREDS.user}:${CREDS.pass}`) {
        const token = `eyJhbGciOiJSUzI1NiJ9.${b64(JSON.stringify({ sub: CREDS.user, iat: Date.now() })).replace(/=+$/, '')}.${rid().replace(/-/g, '')}`;
        next = { ...state, tokens: [...state.tokens, token] };
        res = reply(200, { Token: token });
      } else res = reply(401, { error: 'Authentication has failed. Please provide valid credentials.' });
    }
  } else if (path === '/dna/intent/api/v1/network-device' || path.startsWith('/dna/intent/api/v1/network-device/')) {
    const denied = auth();
    if (denied) res = denied;
    else if (req.method !== 'GET') res = reply(405, { error: 'Method Not Allowed for this lab. Use GET.' });
    else if (path === '/dna/intent/api/v1/network-device/count') res = reply(200, { response: DEVICES.length, version: '1.0' });
    else if (path === '/dna/intent/api/v1/network-device') {
      let list = DEVICES.slice();
      for (const [k, v] of url.searchParams.entries()) {
        if (k === 'offset' || k === 'limit') continue;
        list = list.filter((d) => String((d as Record<string, unknown>)[k] ?? '').toLowerCase() === v.toLowerCase());
      }
      res = reply(200, { response: list, version: '1.0' });
    } else {
      const id = path.split('/').pop();
      const d = DEVICES.find((x) => x.id === id);
      res = d ? reply(200, { response: d, version: '1.0' }) : reply(404, { error: `Device ${id} not found` });
    }
  } else if (path === '/dna/intent/api/v1/site' || path.startsWith('/dna/intent/api/v1/site/')) {
    const denied = auth();
    if (denied) res = denied;
    else if (req.method === 'GET' && path === '/dna/intent/api/v1/site') {
      res = reply(200, { response: state.sites.map((s) => ({ id: s.id, name: s.name, siteNameHierarchy: s.parentName ? `${s.parentName}/${s.name}` : s.name, additionalInfo: [{ attributes: { type: s.type } }] })) });
    } else if (req.method === 'POST' && path === '/dna/intent/api/v1/site') {
      const ct = header(req, 'Content-Type') ?? '';
      if (!ct.toLowerCase().includes('application/json')) res = reply(415, { error: 'Content-Type must be application/json' });
      else {
        let body: { type?: string; site?: { area?: { name?: string; parentName?: string } } } | null = null;
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          res = reply(400, { error: `Invalid JSON: ${(e as Error).message}` });
        }
        if (body) {
          const area = body.site?.area;
          if (body.type !== 'area' || !area?.name || !area.parentName) res = reply(400, { error: 'Body must look like {"type": "area", "site": {"area": {"name": "...", "parentName": "Global"}}}' });
          else if (!state.sites.some((s) => s.name === area.parentName)) res = reply(400, { error: `Parent site "${area.parentName}" does not exist` });
          else if (state.sites.some((s) => s.name === area.name)) res = reply(400, { error: `Site "${area.name}" already exists` });
          else {
            const exec = rid();
            next = { ...state, sites: [...state.sites, { id: rid(), name: area.name, parentName: area.parentName, type: 'area' }] };
            res = reply(202, { executionId: exec, executionStatusUrl: `/dna/intent/api/v1/dnacaap/management/execution-status/${exec}`, message: 'The request has been accepted for execution' });
          }
        }
      }
      res = res!;
    } else if (req.method === 'DELETE' && path.startsWith('/dna/intent/api/v1/site/')) {
      const id = path.split('/').pop();
      const s = state.sites.find((x) => x.id === id);
      if (!s || s.name === 'Global') res = reply(404, { error: 'Site not found or cannot be deleted' });
      else {
        next = { ...state, sites: state.sites.filter((x) => x.id !== id) };
        res = reply(202, { executionId: rid(), message: 'The request has been accepted for execution' });
      }
    } else res = reply(405, { error: 'Method Not Allowed' });
  } else {
    res = reply(404, { error: `No API resource at ${path || '/'}` });
  }
  next = { ...next, log: [...next.log, { req, res, at: Date.now() }].slice(-60) };
  return { res, state: next };
}

export interface ApiTask {
  id: string;
  title: string;
  hint?: string;
  /** Tasks with `answer` show an input in the task panel. */
  answer?: string[];
  check?: (s: ApiState) => string | true;
}

const logged = (s: ApiState, pred: (e: ApiState['log'][number]) => boolean) => s.log.some(pred);

export const API_TASKS: ApiTask[] = [
  {
    id: 'token',
    title: 'Get an API token: `POST /dna/system/api/v1/auth/token` with HTTP Basic authentication (devnetuser / Cisco123!)',
    hint: 'Use the Auth tab to build the `Authorization: Basic …` header (base64 of user:password).',
    check: (s) => (logged(s, (e) => e.res.status === 200 && e.req.url.includes('/auth/token')) ? true : 'No successful token request yet'),
  },
  {
    id: 'inventory',
    title: 'List the device inventory: `GET /dna/intent/api/v1/network-device` with the `X-Auth-Token` header',
    hint: 'Add a header named X-Auth-Token whose value is the token string from the previous response.',
    check: (s) => (logged(s, (e) => e.res.status === 200 && /\/network-device(\?|$)/.test(e.req.url.replace(BASE, ''))) ? true : 'No successful inventory request yet'),
  },
  { id: 'serial', title: 'What is the **serialNumber** of the device whose hostname is `cat9k-access-2`?', answer: ['FJC2331T1AB'] },
  { id: 'unreach', title: 'How many devices have `reachabilityStatus` **Unreachable**?', answer: ['2', 'two'] },
  {
    id: 'filter',
    title: 'Use a **query parameter** to return only devices whose `family` is `Switches and Hubs`',
    hint: 'Append ?family=Switches%20and%20Hubs to the URL (spaces must be URL-encoded as %20 or +).',
    check: (s) =>
      logged(s, (e) => {
        if (e.res.status !== 200 || !e.req.url.includes('network-device?')) return false;
        try {
          const u = new URL(e.req.url.startsWith('http') ? e.req.url : BASE + e.req.url);
          return u.searchParams.get('family')?.toLowerCase() === 'switches and hubs';
        } catch {
          return false;
        }
      })
        ? true
        : 'No filtered request (family=Switches and Hubs) yet',
  },
  {
    id: 'site',
    title: 'Create an area named `WizardLab` under `Global` with `POST /dna/intent/api/v1/site` and a JSON body',
    hint: 'Headers: Content-Type: application/json and X-Auth-Token. Body: {"type": "area", "site": {"area": {"name": "WizardLab", "parentName": "Global"}}}',
    check: (s) => (s.sites.some((x) => x.name === 'WizardLab' && x.parentName === 'Global') ? true : 'Site WizardLab does not exist yet'),
  },
  { id: 'code', title: 'Which HTTP **status code** did the controller return for the site creation, and what does it mean? (enter the number)', answer: ['202'] },
];
