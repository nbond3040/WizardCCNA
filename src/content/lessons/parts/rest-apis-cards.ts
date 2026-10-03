import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'API', back: 'Application programming interface: a published contract that lets one program request data or actions from another.' },
  { id: 'f2', front: 'REST', back: '**RE**presentational **S**tate **T**ransfer: an architectural style for APIs, normally carried over HTTP(S). It is not a protocol or a data format.' },
  { id: 'f3', front: 'REST constraints', back: 'Client-server, **stateless**, cacheable, uniform interface, layered system. Code on demand is the optional sixth.' },
  { id: 'f4', front: 'What does stateless mean in REST?', back: 'The server keeps no client session between requests, so **every request carries its own credentials and context**.' },
  { id: 'f5', front: 'CRUD mapped to HTTP verbs', back: '**C**reate = POST, **R**ead = GET, **U**pdate = PUT or PATCH, **D**elete = DELETE.' },
  { id: 'f6', front: 'PUT vs PATCH', back: '**PUT** replaces the whole resource (send the complete body). **PATCH** modifies only the fields you send.' },
  { id: 'f7', front: 'Idempotent methods', back: 'Repeating the request leaves the same server state. GET, PUT and DELETE are idempotent; POST is not.' },
  { id: 'f8', front: 'Parts of a URI', back: 'Scheme, host, path, then an optional query string: `https://host/path?key=value&key2=value2`. The query string filters or pages the result.' },
  { id: 'f9', front: 'Content-Type vs Accept', back: '**Content-Type** = format of the body being sent. **Accept** = format the client wants back.' },
  { id: 'f10', front: 'Catalyst Center token flow', back: 'POST to `/dna/system/api/v1/auth/token` with HTTP Basic, receive a token, then send it in the **X-Auth-Token** header on every request.' },
  { id: 'f11', front: 'HTTP status code classes', back: '1xx informational, 2xx success, 3xx redirection, **4xx client error**, **5xx server error**.' },
  { id: 'f12', front: '200 OK', back: 'Success; the body holds the result. Typical for GET, PUT and PATCH.' },
  { id: 'f13', front: '201 Created (and 202 Accepted)', back: '**201**: a new resource was created, usually after POST, often with a Location header. **202**: accepted and queued; poll the task for the outcome.' },
  { id: 'f14', front: '204 No Content', back: 'Success with an empty body, typical for DELETE.' },
  { id: 'f15', front: '301 Moved Permanently', back: 'The resource has a new URI, given in the Location header.' },
  { id: 'f16', front: '400 Bad Request', back: 'The server cannot parse the request, for example malformed JSON or a bad parameter.' },
  { id: 'f17', front: '401 Unauthorized', back: 'The caller is **not authenticated**: credentials or token are missing, wrong or expired.' },
  { id: 'f18', front: '403 Forbidden', back: 'The caller is authenticated but **not permitted** to perform the action (role or permission).' },
  { id: 'f19', front: '404 Not Found', back: 'The URI or resource ID does not exist.' },
  { id: 'f20', front: '500 vs 503', back: '**500 Internal Server Error**: unexpected server fault. **503 Service Unavailable**: temporarily overloaded or in maintenance; retry later.' },
  { id: 'f21', front: 'HTTP Basic authentication', back: '`Authorization: Basic` plus Base64(user:password). Encoding, **not encryption**: use only over HTTPS.' },
  { id: 'f22', front: 'API key', back: 'A static key issued to an application and sent in a header or query parameter. It stays valid until revoked.' },
  { id: 'f23', front: 'Bearer token', back: '`Authorization: Bearer {token}` (Catalyst Center uses `X-Auth-Token`). Obtained by logging in; trusted until it expires.' },
  { id: 'f24', front: 'OAuth 2.0', back: 'Authorization framework: an authorization server issues scoped access tokens, so an app gets delegated access without seeing the user password.' },
  { id: 'f25', front: 'JSON', back: 'JavaScript Object Notation: curly-brace objects of `"key": value` pairs, square-bracket arrays, double-quoted strings. The default REST payload.' },
  { id: 'f26', front: 'XML', back: 'Tag-based encoding with opening and closing tags. The only encoding NETCONF uses; RESTCONF can use it too.' },
  { id: 'f27', front: 'YAML', back: 'Indentation-based encoding with `key: value` pairs and dashes for list items. Used for Ansible playbooks.' },
  { id: 'f28', front: 'YANG', back: 'Data-modeling language that defines the structure of configuration and state data. It is neither a protocol nor an encoding.' },
  { id: 'f29', front: 'NETCONF', back: 'Model-driven protocol over **SSH on TCP 830** with XML encoding; operations such as get-config and edit-config.' },
  { id: 'f30', front: 'RESTCONF', back: 'Model-driven protocol over **HTTPS (TCP 443)** that applies GET, POST, PUT, PATCH and DELETE to YANG data in JSON or XML.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which HTTP method maps to the Read operation in CRUD?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**GET** reads data without changing it. POST creates, PUT updates by replacing the resource, and DELETE removes it.',
  },
  {
    id: 'q2',
    type: 'match',
    stem: 'Match each CRUD action with the HTTP method most commonly used for it.',
    pairs: [
      { left: 'Create', right: 'POST' },
      { left: 'Read', right: 'GET' },
      { left: 'Update (change selected fields)', right: 'PATCH' },
      { left: 'Delete', right: 'DELETE' },
    ],
    difficulty: 1,
    explanation:
      'POST creates, GET reads, PATCH modifies selected fields (PUT would replace the whole resource), and DELETE removes the resource.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'What does HTTP status code 404 indicate?',
    options: ['The server crashed', 'The requested resource was not found', 'The request needs authentication', 'The request succeeded with an empty body'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**404 Not Found** means the URI or resource ID does not exist. A server fault would be 5xx, missing authentication is 401, and success with an empty body is 204.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'A request returns 401 Unauthorized. What is the most likely cause?',
    options: ['The server has a hardware failure', 'The URI points to a deleted resource', 'The token is missing, wrong or expired', 'The response body was empty'],
    answer: 2,
    difficulty: 2,
    explanation:
      'A 401 means the caller is not authenticated: the credentials or token are missing, wrong or expired. A hardware failure would produce a 5xx code, a deleted resource gives 404, and an empty body is not an error by itself.',
  },
  {
    id: 'q5',
    type: 'multi',
    stem: 'Which two are REST constraints? (Choose two.)',
    options: [
      'Stateless interactions',
      'The server remembers each client session',
      'Client-server separation',
      'XML encoding is mandatory',
      'Requests must use TCP port 830',
    ],
    answers: [0, 2],
    difficulty: 1,
    explanation:
      'REST requires stateless interactions and a client-server separation. A server that remembers sessions would be stateful, REST does not mandate XML (JSON is more common), and TCP 830 belongs to NETCONF over SSH.',
  },
  {
    id: 'q6',
    type: 'input',
    stem: 'Which TCP port number does NETCONF over SSH use?',
    answers: ['830', 'tcp 830', 'tcp/830'],
    placeholder: 'Port number',
    difficulty: 1,
    explanation:
      'NETCONF over SSH uses TCP **830**. RESTCONF uses HTTPS on TCP 443, SSH itself defaults to 22, and SNMP uses UDP 161 and 162.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which data encoding is the only one used by NETCONF?',
    options: ['JSON', 'YAML', 'CSV', 'XML'],
    answer: 3,
    difficulty: 2,
    explanation:
      'NETCONF messages are always **XML**. RESTCONF may use JSON or XML, YAML is used for tools such as Ansible, and CSV is not an API encoding used here.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Which header tells the server which format the client wants in the response?',
    options: ['Content-Type', 'Accept', 'Authorization', 'Location'],
    answer: 1,
    difficulty: 2,
    explanation:
      '**Accept** states the response format the client wants. Content-Type describes the body being sent, Authorization carries credentials, and Location gives the URI of a created or moved resource.',
  },
];
