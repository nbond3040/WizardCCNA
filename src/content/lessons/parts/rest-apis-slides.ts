import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'REST APIs',
    subtitle: 'Verbs, URIs, status codes, authentication and data formats for network automation',
    notes:
      'Modern networks are increasingly managed by software talking to software. Instead of an engineer typing the same commands into forty switches, a script sends one request to a controller such as **Cisco Catalyst Center**, and the controller does the work. The interface that makes this possible is an **API**, and the style used by nearly every controller and cloud platform is **REST** over HTTPS. In this deck you will learn what makes an API RESTful, how the **CRUD** actions map to HTTP verbs, how a request is assembled from a URI, headers and a body, and how to read the **status code** that comes back. We then cover the authentication methods on the blueprint, the JSON, XML and YAML encodings, and the model-driven trio of **YANG, NETCONF and RESTCONF**. The exam tests recognition rather than programming: you must be able to read a request and its response and say precisely what happened and why.',
  },
  {
    kind: 'bullets',
    title: 'Why APIs matter to network engineers',
    bullets: [
      'An **API** is a contract that lets one program request services from another',
      'Scripts and apps call a **controller**, not each device',
      { text: '**Northbound API**: apps to controller', sub: ['Usually REST over HTTPS'] },
      { text: '**Southbound API**: controller to devices', sub: ['NETCONF, RESTCONF, SSH/CLI, SNMP'] },
      'Result: consistent, repeatable, fast changes at scale',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'app', icon: 'laptop', label: 'Script / App', sub: 'Python, Postman, curl', x: 1.2, y: 2.5 },
        { id: 'cc', icon: 'controller', label: 'Catalyst Center', sub: 'controller', x: 5, y: 2.5, tone: 'accent' },
        { id: 'sw1', icon: 'switch', label: 'SW1', x: 8.6, y: 0.9 },
        { id: 'r1', icon: 'router', label: 'R1', x: 8.6, y: 2.5 },
        { id: 'sw2', icon: 'switch', label: 'SW2', x: 8.6, y: 4.1 },
      ],
      links: [
        { from: 'app', to: 'cc', label: 'Northbound: REST/HTTPS', arrow: 'both', tone: 'accent' },
        { from: 'cc', to: 'sw1' },
        { from: 'cc', to: 'r1', label: 'Southbound' },
        { from: 'cc', to: 'sw2' },
      ],
    },
    notes:
      'An **API** (application programming interface) is a published contract: send a request in the documented format and the provider performs an action or returns data in a documented format. Network engineers meet APIs in two directions. The **northbound API** faces up toward applications — a Python script, a ticketing system or Postman asks the controller for data or asks it to make a change. On controllers such as Catalyst Center the northbound API is a **REST API over HTTPS**. The **southbound API** faces down toward the devices: the controller uses protocols such as NETCONF, RESTCONF, SSH/CLI or SNMP to push configuration and collect state. The payoff is scale and consistency. One well-tested API call can change a setting on two hundred switches identically, and the same call can be repeated tomorrow with the same result, without the typos of manual CLI work. On the exam, be ready to say which direction an interface faces and to recognize REST as the typical northbound API.',
  },
  {
    kind: 'definitions',
    title: 'API vocabulary',
    terms: [
      { term: 'API', def: 'Set of rules that lets one program request data or actions from another.' },
      { term: 'REST', def: 'REpresentational State Transfer — an architectural style for APIs, normally carried over HTTP(S).' },
      { term: 'Resource', def: 'Any object the API exposes (a device, an interface, a site), identified by a URI.' },
      { term: 'URI / endpoint', def: 'The address of a resource, e.g. `/dna/intent/api/v1/network-device`.' },
      { term: 'Request / response', def: 'Client sends method + URI + headers + optional body; server returns status code + headers + optional body.' },
      { term: 'Payload', def: 'The data carried in a request or response body — usually JSON.' },
    ],
    notes:
      'Keep this vocabulary straight, because exam options often swap the terms. **REST** stands for REpresentational State Transfer. It is an **architectural style**, not a protocol and not a data format, and in practice it is carried over HTTP or HTTPS. Everything a REST API manages is modeled as a **resource** — a device, an interface, a site, a user — and every resource has an address, its **URI**; the full URL you type is the most common form of URI. A client works with a resource by sending an HTTP **request** that combines a method, the URI, headers and sometimes a body. The server answers with a **response** containing a status code, headers and usually a body. The data carried in either body is the **payload**, and on Cisco controllers it is almost always JSON. When a question says a script "queries an endpoint", translate that into "sends a GET to a URI" and the rest of the question usually becomes easy.',
  },
  {
    kind: 'table',
    title: 'The REST constraints',
    columns: ['Constraint', 'What it means', 'Why it matters'],
    rows: [
      ['**Client-server**', 'Client and server are separate and meet only at the API', 'Each side can evolve independently'],
      ['**Stateless**', 'Every request carries all it needs, including credentials', 'Any server can answer; scales easily'],
      ['**Cacheable**', 'Responses say whether they may be cached', 'Fewer repeated requests, faster clients'],
      ['**Uniform interface**', 'URIs name resources; standard methods; self-describing messages', 'Every REST API behaves alike'],
      ['**Layered system**', 'Client cannot tell a proxy or load balancer from the server', 'Add security and scale transparently'],
      ['Code on demand', 'Server may send executable code to the client', 'The only **optional** constraint'],
    ],
    notes:
      'Roy Fielding defined REST as a set of architectural constraints; an API that respects them is called **RESTful**. **Client-server** separation means the client knows only the API contract, so the controller software can be upgraded without breaking your script. **Stateless** is the constraint Cisco tests most: the server does not remember earlier requests, so ==every request must carry its own authentication and context==, typically a token in a header. That is why a script attaches its token to every call instead of logging in once. **Cacheable** means responses state whether they may be cached, so clients and proxies can reuse data instead of asking again. **Uniform interface** means resources are identified by URIs, manipulated with the standard HTTP methods, and described by self-explanatory messages with headers such as Content-Type. **Layered system** means load balancers, proxies or gateways can sit in the path without the client noticing. The sixth constraint, **code on demand**, is the only optional one. A classic distractor claims that REST is stateful or requires XML; both claims are false.',
  },
  {
    kind: 'table',
    title: 'CRUD mapped to HTTP verbs',
    columns: ['CRUD action', 'HTTP verb', 'Example on a controller', 'Typical success code'],
    rows: [
      ['**Create**', '`POST`', 'Add a new site or device', '`201 Created` (or `202 Accepted`)'],
      ['**Read**', '`GET`', 'Retrieve the device inventory', '`200 OK`'],
      ['**Update** (replace)', '`PUT`', 'Replace a whole resource', '`200 OK` or `204 No Content`'],
      ['**Update** (modify)', '`PATCH`', 'Change one field, e.g. a description', '`200 OK` or `204 No Content`'],
      ['**Delete**', '`DELETE`', 'Remove a device from inventory', '`200 OK` or `204 No Content`'],
    ],
    notes:
      'CRUD — **Create, Read, Update, Delete** — names the four things you can do to stored data, and REST maps each one to an HTTP method. Learn the mapping cold, because it appears as a drag-and-drop in almost every automation section. **POST creates** a new resource, and the server normally assigns its ID. **GET reads** and must never change anything on the server. **PUT updates by replacement**: the body carries the complete new version of the resource. **PATCH updates partially**: the body carries only the fields that change. **DELETE removes** the resource. Two behaviors help with scenario questions. First, GET, PUT and DELETE are **idempotent** — sending the same request twice leaves the server in the same state as sending it once — whereas POST is not, so two identical POSTs can create two objects. Second, a controller that needs time to finish a job, as Catalyst Center often does, may answer a POST, PUT or DELETE with **202 Accepted** and a task ID rather than 201 or 200, meaning the work has been queued.',
  },
  {
    kind: 'compare',
    title: 'PUT vs PATCH',
    left: {
      heading: 'PUT — replace',
      bullets: ['Body = the **complete** resource', 'Fields left out may be reset or removed', 'Idempotent', 'Fits "replace the whole configuration"'],
    },
    right: {
      heading: 'PATCH — modify',
      bullets: ['Body = **only the changes**', 'Other fields stay untouched', 'Ideal for one attribute', 'Fits "change just the description"'],
      tone: 'accent',
    },
    notes:
      'PUT and PATCH both map to **Update**, and exam writers like to ask which one fits a scenario. Think of PUT as "here is the new version of the whole thing" and PATCH as "change just this". Suppose an interface resource has a name, a description, an enabled flag and an IP address. A PUT whose body contains only a new description replaces the resource with that body, so the fields you left out can be reset to defaults or removed, depending on the API. A PATCH with the same small body changes only the description and leaves everything else untouched. RESTCONF follows the same logic for YANG data: PUT replaces the target data node, and PATCH merges the supplied data into it. If a stem stresses modifying a single attribute, choose PATCH; if it stresses replacing the complete configuration of a resource, choose PUT. Creating a new object whose ID the server chooses remains the job of POST.',
  },
  {
    kind: 'diagram',
    title: 'Anatomy of a URI',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 's', label: 'https://', sub: 'scheme' },
        { id: 'h', label: 'catc.example.com', sub: 'host' },
        { id: 'b', label: '/dna/intent/api/v1', sub: 'base path' },
        { id: 'r', label: '/network-device', sub: 'resource', tone: 'accent' },
        { id: 'q', label: '?hostname=SW1', sub: 'query parameter' },
      ],
    },
    caption: '`https://catc.example.com/dna/intent/api/v1/network-device?hostname=SW1`',
    bullets: ['The path names **what** you act on', 'The query string **filters** it: `?key=value&key2=value2`'],
    notes:
      'Every REST call targets a **URI**, and the exam expects you to split one into its parts. The **scheme**, `https`, names the protocol: HTTPS on TCP 443 unless another port follows the host, as in `:8443`. The **host** (authority) is the name or IP address of the API provider — here a Catalyst Center cluster. The **path** identifies the resource. Catalyst Center intent APIs share the base path `/dna/intent/api/v1`, and the final segment `/network-device` names the collection of devices; a path such as `/network-device/{id}` targets one device instead of the whole collection. Everything after the `?` is the **query string**: `key=value` pairs, separated by `&`, that **filter, sort or page** the result without changing which resource is addressed. So `?hostname=SW1` asks only for the device named SW1, and `?family=Switches%20and%20Hubs&limit=10` would filter by device family and cap the number of results. Watch for the trap: query parameters are part of the URI — they are neither headers nor body content.',
  },
  {
    kind: 'bullets',
    title: 'Inside a request and a response',
    bullets: [
      '**Request** = method + URI + headers + optional body',
      'GET and DELETE usually carry **no body**',
      'POST, PUT and PATCH carry a **JSON body**',
      '**Response** = status code + headers + optional body',
      'Headers are `Name: value` pairs describing the message',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Client (script)', icon: 'laptop' },
        { id: 's', label: 'Catalyst Center', icon: 'controller' },
      ],
      steps: [
        { from: 'c', to: 's', label: 'GET /dna/intent/api/v1/network-device', sub: 'Accept: application/json · X-Auth-Token: <token>' },
        { from: 's', to: 'c', label: '200 OK', sub: 'Content-Type: application/json + JSON body', tone: 'good' },
        { from: 'c', to: 's', label: 'POST /dna/intent/api/v1/network-device', sub: 'Content-Type: application/json + JSON body' },
        { from: 's', to: 'c', label: '202 Accepted', sub: 'body holds a taskId to track the job', tone: 'accent' },
      ],
    },
    notes:
      'An HTTP request has three visible parts. The **request line** holds the method and the path of the resource. The **headers** are name-value pairs that describe the request: the format of any body, the format the client wants back, and the credentials. The optional **body** carries data. A GET normally has no body because everything needed is in the URI, while a POST, PUT or PATCH carries a JSON body describing the object to create or the changes to make. The response mirrors this layout: a **status line** with the code and reason phrase, response headers, and usually a body — the requested data for a GET, or an error description for a failed call. In the second exchange on the diagram, the controller accepts a job to add a device and answers **202 Accepted** with a task ID, because the work takes time; the client then polls the task to learn the outcome. When you read an exam exhibit, find the parts in order: which verb, which resource, which headers, and what came back.',
  },
  {
    kind: 'table',
    title: 'Headers you must know',
    columns: ['Header', 'Sent in', 'Purpose', 'Example value'],
    rows: [
      ['`Content-Type`', 'Request and response', 'Format of **this** message body', '`application/json`'],
      ['`Accept`', 'Request', 'Format the client **wants back**', '`application/xml`'],
      ['`Authorization`', 'Request', 'Credentials: Basic or Bearer', '`Bearer {token}`'],
      ['`X-Auth-Token`', 'Request', 'Catalyst Center token header', '`{token}`'],
      ['`Location`', 'Response', 'URI of a new or moved resource', 'sent with `201` or `301`'],
    ],
    notes:
      'Headers carry the metadata of every exchange, and three come up constantly: **Content-Type, Accept and Authorization**. The easy mix-up is between the first two. **Content-Type** describes the body of the message it travels in: a client sending JSON in a POST sets `Content-Type: application/json`, and a server returning JSON sets the same header on its response. **Accept** is a request, not a description: the client says which format it wants back, for example `application/json` or `application/xml`. If the server cannot produce that format it may answer `406 Not Acceptable`. **Authorization** carries credentials, either the word `Basic` followed by Base64 of user:password, or the word `Bearer` followed by a token. Catalyst Center uses its own custom header, **X-Auth-Token**, to carry its token instead of Authorization. Finally, **Location** appears in responses: with `201 Created` it points to the new resource, and with `301 Moved Permanently` it gives the new address of the resource so the client can follow it.',
  },
  {
    kind: 'table',
    title: 'HTTP status codes to memorize',
    columns: ['Code', 'Meaning', 'Typical cause'],
    rows: [
      ['`200 OK`', 'Success; body holds the result', 'Successful GET, PUT or PATCH'],
      ['`201 Created`', 'New resource created', 'Successful POST'],
      ['`204 No Content`', 'Success, empty body', 'Successful DELETE or PUT'],
      ['`301 Moved Permanently`', 'Resource has a new URI', 'Path changed; see `Location`'],
      ['`400 Bad Request`', 'Server cannot parse the request', 'Malformed JSON, bad parameter'],
      ['`401 Unauthorized`', '**Not authenticated**', 'Missing, wrong or expired credentials'],
      ['`403 Forbidden`', 'Authenticated but **not allowed**', 'Role lacks permission'],
      ['`404 Not Found`', 'Resource does not exist', 'Wrong URI or ID'],
      ['`500 Internal Server Error`', 'Unexpected server failure', 'Bug or fault on the server'],
      ['`503 Service Unavailable`', 'Temporarily cannot serve', 'Overloaded or in maintenance'],
    ],
    notes:
      'Status codes are three-digit numbers, and the **first digit is the class** — knowing that alone answers many exam questions. **2xx** means success: `200 OK` returns data, `201 Created` confirms a new object (typically after a POST), and `204 No Content` confirms success with an empty body (typical after a DELETE). **3xx** means redirection: `301 Moved Permanently` tells the client to use the new URI in the Location header from now on. **4xx** means **the client made a mistake**, so repeating the same request will fail again: `400` is a malformed request such as broken JSON, and `404` is a URI or ID that does not exist. Give special attention to the 401/403 pair: ==401 Unauthorized really means unauthenticated== — the server does not know who you are because the credentials or token are missing, wrong or expired — whereas `403 Forbidden` means the server knows who you are but your role is not allowed to perform the action. **5xx** means **the server failed**: `500` is an unexpected internal error, and `503` means the service is temporarily unavailable, perhaps overloaded or restarting, so a later retry may succeed.',
  },
  {
    kind: 'diagram',
    title: 'Status code classes',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'c1', label: '1xx', sub: 'Informational', tone: 'muted' },
        { id: 'c2', label: '2xx', sub: 'Success', tone: 'good' },
        { id: 'c3', label: '3xx', sub: 'Redirection' },
        { id: 'c4', label: '4xx', sub: 'Client error', tone: 'warn' },
        { id: 'c5', label: '5xx', sub: 'Server error', tone: 'bad' },
      ],
      edges: [],
    },
    caption: 'The first digit tells you who has to fix the problem.',
    bullets: ['2xx: nothing to fix', '4xx: fix the **request** — URI, body or credentials', '5xx: the **server** must recover; retry later'],
    notes:
      'When you forget a specific code, fall back on the class, because the first digit is standardized for every HTTP response. **1xx** codes are informational interim responses that you will rarely meet in API work. **2xx** tells you the request succeeded. **3xx** tells you the resource is somewhere else and the client must follow a redirect. **4xx** puts the blame on the client: the request was malformed, unauthenticated, forbidden, aimed at a missing resource, or used a method the resource does not support (`405 Method Not Allowed`). **5xx** puts the blame on the server: the request may have been perfectly valid, but the server hit an internal fault, failed while waiting on another system, or is overloaded. Troubleshooting follows directly from the class. With a 4xx, fix your script, your token or your URI before retrying. With a 5xx, check the health of the controller or simply try again later. Exam items often phrase this as "which class of status code indicates a client-side error?" — the answer is 4xx.',
  },
  {
    kind: 'table',
    title: 'API authentication types',
    columns: ['Method', 'What travels with the request', 'Key facts'],
    rows: [
      ['**HTTP Basic**', '`Authorization: Basic` + Base64(user:password)', 'Encoding, **not encryption** — HTTPS only'],
      ['**API key**', 'Static key in a header (e.g. `X-API-Key`) or query parameter', 'Tied to an app; valid until revoked'],
      ['**Bearer token**', '`Authorization: Bearer {token}` (Catalyst Center: `X-Auth-Token`)', 'Obtained by logging in; expires'],
      ['**OAuth 2.0**', 'Access token issued by an authorization server', 'Delegated, scoped access; app never sees the password'],
    ],
    notes:
      'REST is stateless, so **every request must prove who is calling**, and the four methods on the blueprint differ in what travels with each request. **HTTP Basic** puts the username and password in the Authorization header, merely Base64-encoded. Anyone who captures it can decode it instantly, so Basic must only run over HTTPS, and it is often used just once, to obtain a token. An **API key** is a long static string issued to an application; it is simple, but it does not expire on its own, so a leaked key keeps working until someone revokes it. A **bearer token** is a temporary credential obtained by logging in; whoever bears it is trusted until it expires. Catalyst Center issues such a token from its authentication endpoint and expects it in the **X-Auth-Token** header. **OAuth 2.0** is an authorization framework: an authorization server issues access tokens to a client application, often after the user consents, so the application never sees the user password, and the tokens can be limited in scope and lifetime. On the exam, match "Base64 username:password" to Basic and "delegated third-party access" to OAuth 2.0.',
  },
  {
    kind: 'diagram',
    title: 'Token authentication with Catalyst Center',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'c', label: 'Script', icon: 'laptop' },
        { id: 'cc', label: 'Catalyst Center', icon: 'controller' },
      ],
      steps: [
        { from: 'c', to: 'cc', label: 'POST /dna/system/api/v1/auth/token', sub: 'Authorization: Basic <base64-credentials>' },
        { from: 'cc', to: 'c', label: '200 OK', sub: '{"Token": "<token>"}', tone: 'good' },
        { from: 'c', to: 'cc', label: 'GET /dna/intent/api/v1/network-device', sub: 'X-Auth-Token: <token>' },
        { from: 'cc', to: 'c', label: '200 OK + device list (JSON)', tone: 'good' },
        { note: 'Token missing or expired: 401 Unauthorized, so request a new token', tone: 'warn' },
      ],
    },
    caption: 'Basic auth once to get a token; the token rides on every later call.',
    notes:
      'This is the pattern behind most Catalyst Center exhibits. Step one is a **POST to the token endpoint**, `/dna/system/api/v1/auth/token`, using **HTTP Basic** authentication: the Authorization header holds `Basic` plus the Base64 encoding of `username:password`. Catalyst Center answers `200 OK` with a small JSON object whose single key, `Token`, holds a long encoded string (a JSON Web Token). From then on the script never sends the password again. Every later request, such as a GET of the device inventory, carries the token in the **X-Auth-Token** header, and because REST is stateless the controller validates that token on each call. Tokens are deliberately short-lived: once one expires, the controller replies **401 Unauthorized** and the script simply requests a fresh token. Notice what would change if the credentials were wrong in step one: the token request itself would fail with 401 and no token would be issued. A 403 would appear only later, if a valid token belonged to a user whose role cannot perform the requested action.',
  },
  {
    kind: 'cli',
    title: 'curl: requesting a token',
    code: `$ curl -k -s -X POST https://catc.example.com/dna/system/api/v1/auth/token -u <username>:<password>
{"Token":"<token>"}
$ curl -k -s -o /dev/null -w "%{http_code}\\n" -X POST https://catc.example.com/dna/system/api/v1/auth/token -u <username>:<wrong-password>
401`,
    highlight: ['-X POST', '-u <username>:<password>', '"Token"', '401'],
    caption: 'Right password: a token. Wrong password: 401 and no token.',
    notes:
      '`curl` is the command-line HTTP client used in most exam exhibits, so learn its common options. `-X POST` sets the method; without `-X`, curl sends a GET, or a POST if you supply a body with `-d`. `-u user:password` makes curl build an **HTTP Basic** Authorization header for you by Base64-encoding the pair, which is exactly what the token endpoint expects. `-k` skips certificate validation, acceptable only in a lab with a self-signed certificate, and `-s` hides the progress meter. The first command succeeds and the controller returns a JSON object containing the `Token` key. The second command uses a wrong password; the options `-o /dev/null` and `-w` discard the body and print only the status code, and the result is **401** because authentication failed. It is not 403, because the server never learned who the caller was. Other options worth recognizing are `-H` to add a header, `-d` to supply a request body, and `-i` to include the response status line and headers in the output.',
  },
  {
    kind: 'cli',
    title: 'Reading a Catalyst Center response',
    code: `$ curl -k -s "https://catc.example.com/dna/intent/api/v1/network-device?hostname=SW1" -H "X-Auth-Token: <token>" -H "Accept: application/json" | python3 -m json.tool
{
    "response": [
        {
            "hostname": "SW1",
            "managementIpAddress": "10.10.1.11",
            "platformId": "C9300-24P",
            "softwareVersion": "17.9.4",
            "role": "ACCESS",
            "reachabilityStatus": "Reachable",
            "upTime": "41 days, 3:12:08.00",
            "id": "11111111-2222-3333-4444-555555555555"
        }
    ],
    "version": "1.0"
}`,
    highlight: ['"response"', '"hostname": "SW1"', '"reachabilityStatus": "Reachable"'],
    caption: 'The device list is an array inside the "response" key.',
    notes:
      'Here the script reuses its token to **read** inventory. The request is a **GET** (no `-X` is needed), the URI filters with the query parameter `hostname=SW1`, the token rides in the **X-Auth-Token** header, and `Accept` asks for JSON. Piping the output into `python3 -m json.tool` only pretty-prints it. Now read the response the way the exam expects. The outer braces form a JSON **object** with two keys. The key `response` holds an **array** in square brackets — Catalyst Center wraps results in a list even when a single device matches. Inside the array is one object describing SW1: its management IP address, platform, software version, role, reachability and a unique `id`. You would place that id in a URI such as `/network-device/{id}` to act on this one device. The key `version` belongs to the outer object, not to the device. To pull the hostname out in Python you would write `data["response"][0]["hostname"]`, remembering that list positions start at zero.',
  },
  {
    kind: 'table',
    title: 'Data encoding formats',
    columns: ['Format', 'Same data', 'Key traits', 'Where you see it'],
    rows: [
      ['**JSON**', '`{"hostname": "SW1", "vlans": [10, 20]}`', 'Braces, brackets, `"key": value` pairs', 'REST APIs, RESTCONF, Catalyst Center'],
      ['**XML**', '`<hostname>SW1</hostname>`', 'Opening and closing tags; verbose', 'NETCONF (always), RESTCONF'],
      ['**YAML**', '`hostname: SW1`', 'Indentation; `-` marks list items', 'Ansible playbooks, config files'],
    ],
    notes:
      'Data encoding, also called serialization, turns structured data into text so it can cross the network. The CCNA names three formats. **JSON** (JavaScript Object Notation) uses curly braces for objects, square brackets for arrays and `"key": value` pairs; it is compact and is the default payload of REST APIs, Catalyst Center included. **XML** (eXtensible Markup Language) wraps every value in opening and closing tags; it is more verbose, and it is the only encoding **NETCONF** uses. RESTCONF can use either JSON or XML. **YAML** (YAML Ain\'t Markup Language) replaces brackets with indentation, puts a colon between key and value and marks list items with a dash; it is the easiest to read and write by hand, which is why **Ansible playbooks** are YAML files. All three can express the same data, so a question may show one device in each format and ask you to name them. In an API exchange the format is announced by the Content-Type or Accept header, such as `application/json` or `application/xml`.',
  },
  {
    kind: 'table',
    title: 'Reading JSON',
    columns: ['JSON type', 'Syntax', 'Example', 'Watch for'],
    rows: [
      ['**Object**', 'Curly braces holding `"key": value` pairs', '`{"hostname": "SW1", "role": "ACCESS"}`', 'Keys are strings in double quotes'],
      ['**Array**', 'Square brackets with comma-separated items', '`[10, 20, 30]`', 'Positions start at 0'],
      ['**String**', 'Text in double quotes', '`"GigabitEthernet1/0/1"`', 'Single quotes are invalid'],
      ['**Number**', 'Digits with no quotes', '`1500`', 'A quoted number is a string'],
      ['**Boolean**', 'Lowercase `true` or `false`', '`"enabled": true`', 'No quotes, never capitalized'],
      ['**null**', 'Lowercase `null` means no value', '`"description": null`', 'Not the same as an empty string'],
    ],
    caption: 'Nested example: `{"response": [{"hostname": "SW1"}]}` reads as key response, then item 0, then key hostname.',
    notes:
      'JSON is the format you will read most often on the exam, so know its six building blocks. An **object** is a set of key-value pairs inside curly braces; every key is a string in double quotes, followed by a colon and a value. An **array** is an ordered list inside square brackets, with items separated by commas, and its positions are counted from zero. A value can be a string, a number, a boolean written as lowercase true or false, null, or another object or array, which is how JSON nests. Exam items love syntax errors: single quotes, a trailing comma after the last item, a missing closing brace or an unquoted key all make the document invalid, and a server that receives it usually answers **400 Bad Request**. To extract a value, follow the path one level at a time. In the caption example the key response holds an array, item 0 is an object, and its hostname key holds SW1. In Python that path is written `data["response"][0]["hostname"]`, with one pair of brackets for each level you descend.',
  },
  {
    kind: 'bullets',
    title: 'Model-driven programmability',
    bullets: [
      '**YANG**: data-modeling language that defines config and state structure',
      { text: '**NETCONF**: SSH, TCP **830**, XML only', sub: ['RPCs such as `<get>`, `<get-config>`, `<edit-config>`'] },
      { text: '**RESTCONF**: HTTPS (TCP 443), JSON or XML', sub: ['HTTP verbs on YANG-defined URIs'] },
      'Both use the **same YANG models**; transport and encoding differ',
      'IOS XE: `netconf-yang` and `restconf` global commands',
    ],
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'NETCONF',
          layers: [
            { label: 'Content', sub: 'XML modeled by YANG' },
            { label: 'Operations', sub: 'get-config, edit-config' },
            { label: 'Messages', sub: 'rpc, rpc-reply' },
            { label: 'Transport', sub: 'SSH · TCP 830', tone: 'accent' },
          ],
        },
        {
          title: 'RESTCONF',
          layers: [
            { label: 'Content', sub: 'JSON or XML modeled by YANG' },
            { label: 'Operations', sub: 'GET, POST, PUT, PATCH, DELETE', span: 2 },
            { label: 'Transport', sub: 'HTTPS · TCP 443', tone: 'accent' },
          ],
        },
      ],
    },
    notes:
      'Controller REST APIs are one form of programmability; **model-driven programmability** lets software configure the devices themselves through standard data models. **YANG** (Yet Another Next Generation) is the modeling language: a YANG module describes, like a schema, exactly which configuration and state data a device holds — interfaces, their names, types and addresses — and which values are legal. YANG is neither a protocol nor an encoding. Two protocols carry YANG-modeled data. **NETCONF** runs over **SSH on TCP port 830**, encodes everything in **XML**, and uses RPC operations such as `<get>`, `<get-config>` and `<edit-config>`; it can also lock a datastore so two tools do not change it at the same time. **RESTCONF** exposes the same YANG data as a REST-style API over **HTTPS**, so you use the familiar verbs — GET, POST, PUT, PATCH, DELETE — on URIs such as `/restconf/data/ietf-interfaces:interfaces`, with JSON or XML bodies. On IOS XE, the global commands `netconf-yang` and `restconf` enable them, and RESTCONF also needs the HTTPS server. The CCNA asks for awareness: know the model, the ports and the encodings.',
  },
  {
    kind: 'table',
    title: 'NETCONF vs RESTCONF vs controller REST API',
    columns: ['Property', 'NETCONF', 'RESTCONF', 'Controller REST API'],
    rows: [
      ['Transport', 'SSH', 'HTTPS', 'HTTPS'],
      ['Default port', 'TCP **830**', 'TCP 443', 'TCP 443'],
      ['Encoding', 'XML only', 'JSON or XML', 'Usually JSON'],
      ['Operations', '`<get-config>`, `<edit-config>`', 'HTTP verbs', 'HTTP verbs'],
      ['Data model', 'YANG', 'YANG', 'Vendor-defined'],
      ['Usually talks to', 'Device', 'Device', 'Controller (e.g. Catalyst Center)'],
    ],
    notes:
      'This table separates the three API styles that appear in the automation domain, and the deciding clues in a stem are usually the **port** and the **encoding**. If you see TCP 830 or an SSH subsystem called netconf, it is NETCONF, and the payload is XML wrapped in `<rpc>` and `<rpc-reply>` elements. If you see HTTPS with URIs beginning `/restconf/data/` and YANG module names such as `ietf-interfaces:interfaces`, it is RESTCONF, and the body can be JSON (`application/yang-data+json`) or XML. If you see a controller path such as `/dna/intent/api/v1/`, it is the northbound REST API of a controller, whose resources are designed by the vendor rather than by YANG models. NETCONF and RESTCONF normally talk straight to a device, whereas the Catalyst Center API talks to the controller, which then configures devices southbound. One more trap: SNMP is also a device-management protocol, but it uses UDP ports 161 and 162 and MIBs, not YANG over SSH or HTTPS.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: REST APIs',
    body: 'Most REST questions are won by knowing **CRUD to verb**, the **status-code classes** and **what each auth method sends**.',
    bullets: [
      '**PUT** replaces the whole resource; **PATCH** changes part; **POST** creates',
      '**401** = not authenticated; **403** = authenticated but not permitted',
      '**201** after a successful POST; **204** = success with an empty body',
      '**Content-Type** describes the body sent; **Accept** asks for a format',
      'Basic auth is **Base64-encoded**, not encrypted',
      'NETCONF = SSH **830** + XML; RESTCONF = HTTPS + JSON/XML; YANG = the model',
      'REST is **stateless**: credentials travel with every request',
    ],
    notes:
      'Walk through these traps before every practice exam. Verb traps come first: when a stem says "update the description of an existing device", both PUT and PATCH are updates, but PATCH is the better fit for one attribute; when it says "add a new site", the answer is POST. Status-code traps come next: candidates confuse 401 with 403 because the 401 reason phrase says Unauthorized, yet the code is about **authentication**. A 404 is not a permissions problem, and a 5xx is never fixed by editing your JSON. Header traps: Content-Type describes what you are sending, while Accept describes what you want back. Security traps: Base64 is reversible encoding, so Basic authentication without TLS exposes the password. Model-driven traps: YANG is neither a protocol nor an encoding, NETCONF never uses JSON, and its port is 830 — not 22, 443 or 161. Finally, stateless means the token travels with every single request; the server does not remember that you logged in.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'REST: client-server, **stateless**, cacheable, uniform interface, layered system',
      'CRUD: **POST / GET / PUT or PATCH / DELETE**',
      'Request = verb + URI + headers + body; response = status + headers + body',
      '2xx success · 3xx redirect · 4xx client error · 5xx server error',
      'Auth: Basic, API key, bearer token (`X-Auth-Token`), OAuth 2.0',
      'Encodings: JSON (REST), XML (NETCONF), YAML (Ansible)',
      'YANG models; NETCONF over SSH 830; RESTCONF over HTTPS',
    ],
    notes:
      'Let us pull the lesson together. REST is an architectural style carried over HTTP, and its most testable constraint is statelessness. Every interaction is a CRUD action expressed as an HTTP method: POST to create, GET to read, PUT to replace, PATCH to modify and DELETE to remove. A request combines that method with a URI, optional query parameters, headers such as Content-Type, Accept and Authorization, and sometimes a JSON body; the response returns a status code whose first digit tells you whether it worked and, if not, who must fix it. Authentication ranges from Basic (Base64 user:password) through static API keys and expiring bearer tokens, such as the Catalyst Center X-Auth-Token, to delegated OAuth 2.0 tokens. Data travels as JSON, XML or YAML, and model-driven programmability applies YANG models over NETCONF (SSH, port 830, XML) or RESTCONF (HTTPS, JSON or XML). Practise reading the curl transcripts until every part of a request and a response jumps out at you.',
  },
];
