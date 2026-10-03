import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which HTTP method is normally used to create a new resource through a REST API?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answer: 1,
    difficulty: 1,
    explanation:
      '**POST** maps to Create. GET reads data without changing it, PUT replaces an existing resource (an update), and DELETE removes a resource.',
  },
  {
    id: 'e2',
    type: 'match',
    stem: 'Match each operation with the HTTP method that normally performs it.',
    pairs: [
      { left: 'Create a resource', right: 'POST' },
      { left: 'Read a resource', right: 'GET' },
      { left: 'Update by replacing the whole resource', right: 'PUT' },
      { left: 'Update by changing selected fields', right: 'PATCH' },
      { left: 'Delete a resource', right: 'DELETE' },
    ],
    difficulty: 1,
    explanation:
      'Create = POST, Read = GET, Delete = DELETE. Update has two forms: PUT replaces the entire resource with the body, while PATCH modifies only the fields supplied.',
  },
  {
    id: 'e3',
    type: 'categorize',
    stem: 'Classify each HTTP status code by its class.',
    categories: ['2xx Success', '3xx Redirection', '4xx Client error', '5xx Server error'],
    items: [
      { text: '200 OK', category: 0 },
      { text: '201 Created', category: 0 },
      { text: '204 No Content', category: 0 },
      { text: '301 Moved Permanently', category: 1 },
      { text: '400 Bad Request', category: 2 },
      { text: '401 Unauthorized', category: 2 },
      { text: '403 Forbidden', category: 2 },
      { text: '404 Not Found', category: 2 },
      { text: '500 Internal Server Error', category: 3 },
      { text: '503 Service Unavailable', category: 3 },
    ],
    difficulty: 2,
    explanation:
      'The first digit gives the class: 2xx success, 3xx redirection, 4xx client error and 5xx server error. 401 and 403 are 4xx because the request itself (its credentials or permissions) has to change, while 500 and 503 mean the server failed.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Refer to the exhibit. The script sent a GET request without an X-Auth-Token header. What is the most likely reason for the response?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -k -s -o /dev/null -w "%{http_code}\\n" https://catalyst.example.com/dna/intent/api/v1/network-device
401`,
    },
    options: [
      'The authenticated user is not permitted to read the device inventory',
      'The URI does not exist on the controller',
      'No valid authentication token was included in the request',
      'The controller is overloaded and temporarily unavailable',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'A 401 means the caller is not authenticated: the token or credentials are missing, wrong or expired, and the exhibit shows a request with no token at all. A role or permission problem would return 403, a wrong URI would return 404, and an overloaded server returns 503.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each HTTP header with its purpose.',
    pairs: [
      { left: 'Content-Type', right: 'Format of the body being sent' },
      { left: 'Accept', right: 'Format the client wants in the response' },
      { left: 'Authorization', right: 'Carries Basic or Bearer credentials' },
      { left: 'Location', right: 'URI of a newly created or moved resource' },
    ],
    difficulty: 2,
    explanation:
      'Content-Type describes the message body that carries it, Accept expresses the format the client prefers back, Authorization holds the credentials, and Location appears in responses such as 201 Created and 301 Moved Permanently.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. A Python script stores the parsed JSON response in the variable data. Which expression returns the management IP address of the device that is unreachable?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -s -H "X-Auth-Token: <token>" "https://catalyst.example.com/dna/intent/api/v1/network-device?family=Switches%20and%20Hubs"
{
  "response": [
    {"hostname": "SW1", "managementIpAddress": "192.0.2.11", "role": "ACCESS", "reachabilityStatus": "Reachable"},
    {"hostname": "SW2", "managementIpAddress": "192.0.2.12", "role": "DISTRIBUTION", "reachabilityStatus": "Unreachable"}
  ],
  "version": "1.0"
}`,
    },
    options: [
      '`data["response"][0]["managementIpAddress"]`',
      '`data["response"]["SW2"]["managementIpAddress"]`',
      '`data["managementIpAddress"][1]`',
      '`data["response"][1]["managementIpAddress"]`',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'The response key holds an array, and array positions start at zero, so the second device, SW2 (the unreachable one), is item 1; its address is read with the key managementIpAddress. Item 0 is SW1, which is reachable. The response value is a list, not an object keyed by hostname, and managementIpAddress is not a top-level key.',
  },
  {
    id: 'e7',
    type: 'multi',
    stem: 'Which two statements about the REST stateless constraint are true? (Choose two.)',
    options: [
      'Each request must contain all the information the server needs to process it',
      'The server stores session state between requests',
      'A token or credentials must accompany every request',
      'Statelessness means REST cannot be used over HTTPS',
      'The client logs in once and the server remembers it for later requests',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Stateless means the server keeps no session between requests, so every request carries everything needed to process it, including a token or credentials. Storing session state or remembering a one-time login is stateful behavior, and statelessness has nothing to do with whether HTTPS is used.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'An engineer must change only the description of an existing interface resource and leave every other attribute unchanged. Which HTTP method is the best fit?',
    options: ['PATCH', 'PUT', 'POST', 'GET'],
    answer: 0,
    difficulty: 2,
    explanation:
      '**PATCH** sends only the fields that change, so the other attributes stay untouched. PUT would replace the whole resource and may reset omitted fields, POST creates a new resource, and GET only reads.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. What does the response indicate?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -i -X POST https://api.example.com/v1/vlans -H "Content-Type: application/json" -d '{"id": 120, "name": "GUEST"}'
HTTP/1.1 201 Created
Location: /v1/vlans/120
Content-Type: application/json`,
    },
    options: [
      'The request was malformed and must be corrected',
      'The VLAN already existed and was replaced',
      'The client is being redirected permanently to a new URI',
      'The VLAN was created, and the Location header gives its URI',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      '201 Created confirms that the POST created a new resource, and the Location header identifies it. A malformed request would return 400, replacing an existing object would more likely return 200 or 204, and a permanent redirect uses a 3xx code such as 301, not 201.',
  },
  {
    id: 'e10',
    type: 'multi',
    stem: 'Which two statements about API authentication are true? (Choose two.)',
    options: [
      'HTTP Basic encrypts the username and password, so HTTPS is optional',
      'HTTP Basic sends Base64-encoded credentials, so it should be used only over HTTPS',
      'An API key expires automatically after a few minutes',
      'OAuth 2.0 lets an application obtain a scoped access token without learning the user password',
      'A bearer token never needs to expire because it is encrypted',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'Base64 is a reversible encoding, not encryption, so Basic authentication must travel over HTTPS. OAuth 2.0 issues scoped access tokens to applications without exposing the user password. API keys are static and stay valid until revoked, and bearer tokens are normally short-lived because anyone who holds one can use it.',
  },
  {
    id: 'e11',
    type: 'order',
    stem: 'Place the steps of a Catalyst Center API session in the correct order.',
    items: [
      'The script sends a POST to the token endpoint using HTTP Basic credentials',
      'Catalyst Center returns 200 OK with a JSON body that contains the token',
      'The script sends a GET to the inventory URI with the token in the X-Auth-Token header',
      'Catalyst Center validates the token on that request',
      'Catalyst Center returns 200 OK with the device list in JSON',
    ],
    difficulty: 2,
    explanation:
      'Basic authentication is used once, against the token endpoint. Because REST is stateless, the controller then validates the token on every later request before returning the requested data.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. The token was issued a few minutes ago and is valid. What is the most likely cause of the response?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -i -X DELETE -H "X-Auth-Token: <token>" https://catalyst.example.com/dna/intent/api/v1/network-device/<device-id>
HTTP/1.1 403 Forbidden
Content-Type: application/json`,
    },
    options: [
      'The token has expired',
      'The JSON body is malformed',
      'The user role behind the token is not allowed to delete devices',
      'The controller is temporarily unavailable',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      '403 Forbidden means the server knows who the caller is but the role does not permit the action. An expired token would give 401, a malformed body would give 400 (and a DELETE normally has no body), and an unavailable controller would return 503.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. Which call failed because of a temporary condition on the server rather than a mistake in the request?',
    exhibit: {
      kind: 'table',
      columns: ['Call', 'Result'],
      rows: [
        ['1. GET /v1/devices', '200 OK'],
        ['2. POST /v1/devices with malformed JSON', '400 Bad Request'],
        ['3. GET /v1/devices/55', '503 Service Unavailable'],
        ['4. DELETE /v1/devices/7', '204 No Content'],
      ],
    },
    options: ['Call 1', 'Call 2', 'Call 3', 'Call 4'],
    answer: 2,
    difficulty: 3,
    explanation:
      'A 503 means the server is temporarily unable to handle requests, a server-side condition that a later retry may fix. Call 2 failed because of a client mistake (400), and calls 1 and 4 succeeded (200 and 204).',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is correct?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -k -u <username>:<password> -H "Accept: application/yang-data+json" https://192.0.2.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1
{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet1",
    "description": "Uplink to core",
    "type": "iana-if-type:ethernetCsmacd",
    "enabled": true
  }
}`,
    },
    options: [
      'The client is using NETCONF over SSH and receives XML',
      'The client is using RESTCONF to read YANG-modeled data from a device over HTTPS',
      'The client is calling the Catalyst Center Intent API on a controller',
      'The client is polling the device with SNMP',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'The /restconf/data/ path, the ietf-interfaces YANG module name, the yang-data+json media type and the HTTPS request all point to RESTCONF on the device. NETCONF would use an SSH session on TCP 830 and XML, the Intent API path starts with /dna/intent/api and targets a controller, and SNMP does not use HTTPS URIs.',
  },
  {
    id: 'e15',
    type: 'multi',
    stem: 'Which two statements about NETCONF are true? (Choose two.)',
    options: [
      'It uses SSH, typically on TCP port 830',
      'It encodes data as JSON only',
      'It uses HTTP verbs such as GET and PATCH',
      'It manages data defined by YANG models using XML',
      'It relies on SNMP community strings',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'NETCONF runs over SSH (TCP 830), exchanges XML-encoded messages and manages YANG-modeled data. JSON and HTTP verbs describe RESTCONF and controller REST APIs, and community strings belong to SNMPv1 and v2c.',
  },
  {
    id: 'e16',
    type: 'input',
    stem: 'Enter the TCP port number used by NETCONF over SSH.',
    answers: ['830', 'tcp 830', 'tcp/830'],
    placeholder: 'Port number',
    difficulty: 1,
    explanation:
      'NETCONF over SSH uses TCP **830**. SSH itself defaults to 22, RESTCONF and controller REST APIs use HTTPS on 443, and SNMP uses UDP 161 and 162.',
  },
  {
    id: 'e17',
    type: 'categorize',
    stem: 'Classify each description by the data format it describes.',
    categories: ['JSON', 'XML', 'YAML'],
    items: [
      { text: 'Curly braces and "key": value pairs', category: 0 },
      { text: 'Default payload of most REST APIs', category: 0 },
      { text: 'Opening and closing tags around each value', category: 1 },
      { text: 'The only encoding used by NETCONF', category: 1 },
      { text: 'Indentation and dashes for list items', category: 2 },
      { text: 'Format of Ansible playbooks', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'JSON uses braces, brackets and quoted key-value pairs and is the usual REST payload. XML wraps values in tags and is the only encoding NETCONF uses. YAML relies on indentation and dashes and is the format of Ansible playbooks.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Which two statements about Catalyst Center API authentication are correct? (Choose two.)',
    options: [
      'The token is returned in the Location header',
      'The script first sends a POST to the token endpoint using HTTP Basic authentication',
      'Later requests carry the token in the X-Auth-Token header',
      'The token endpoint accepts only an API key',
      'After the token is issued, the script no longer needs to send any credential',
    ],
    answers: [1, 2],
    difficulty: 2,
    explanation:
      'The script authenticates once with HTTP Basic against the token endpoint and then presents the returned token in the X-Auth-Token header. The token is in the JSON response body, not the Location header, the endpoint uses Basic rather than an API key, and REST is stateless, so the token must accompany every request.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Which part of the URI is the query string?',
    exhibit: {
      kind: 'cli',
      text: `$ curl -k -s -H "X-Auth-Token: <token>" "https://catalyst.example.com/dna/intent/api/v1/network-device?hostname=SW1&role=ACCESS"`,
    },
    options: ['`hostname=SW1&role=ACCESS`', '`/dna/intent/api/v1`', '`/network-device`', '`catalyst.example.com`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Everything after the question mark is the query string: key=value pairs separated by ampersands that filter the result. The host is catalyst.example.com, /dna/intent/api/v1 is the base path, and /network-device names the resource collection.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'A client sends a PUT request whose body contains only the description field for a resource that has six attributes. What is the likely result?',
    options: [
      'Only the description changes; the other five attributes are unchanged',
      'The server returns 405 because PUT cannot update a resource',
      'The request creates a second copy of the resource',
      'The other attributes may be reset or removed because PUT replaces the whole resource',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'PUT replaces the complete resource with the request body, so attributes that are not included may be removed or reset to defaults. Changing a single field without touching the others is what PATCH is for. PUT is a valid update method, so it does not normally return 405, and it does not create a duplicate.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'A script sends a POST to Catalyst Center to add a device and receives 202 Accepted with a JSON body that contains a task ID. What does this indicate?',
    options: [
      'The request was accepted and queued; the script should check the task to learn the outcome',
      'The device was added successfully and no further action is needed',
      'The request was malformed and must be corrected',
      'The resource moved permanently to a new URI',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      '202 Accepted means the controller queued the work but has not finished it, so the script polls the task identified in the response. 201 or 200 would indicate completed creation, 400 means a malformed request, and 301 means the resource has moved.',
  },
];
