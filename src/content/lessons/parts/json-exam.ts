import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which key/value pair is written with valid JSON syntax?',
    options: ['`"vlan": 10`', '`vlan = 10`', "`'vlan': 10`", '`vlan: 10`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'A JSON pair is a **double-quoted key**, a colon and a value, so `"vlan": 10` is correct. `vlan = 10` uses an equals sign, `\'vlan\'` uses single quotes, which JSON does not allow, and `vlan: 10` has an unquoted key (that form is valid YAML, not JSON).',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which characters enclose a JSON array?',
    options: ['Square brackets `[ ]`', 'Curly braces `{ }`', 'Parentheses `( )`', 'Angle brackets `< >`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Arrays are ordered lists written in **square brackets**. Curly braces enclose objects, parentheses are not structural in JSON (Python tuples use them), and angle brackets delimit XML tags.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Refer to the exhibit. What is the data type of the value assigned to the `mtu` key?',
    exhibit: {
      kind: 'cli',
      text: `{
  "hostname": "R1",
  "mtu": "1500",
  "enabled": true
}`,
    },
    options: ['String', 'Number', 'Boolean', 'Object'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The value `"1500"` is enclosed in double quotes, so it is a **string** even though it contains only digits. A number would be written `1500` without quotes. It is not a boolean (`true` and `false` are the only booleans, and `enabled` holds one) and it is not an object, which would use braces.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'Which of the following is valid JSON?',
    options: ['`{"vlans": [10, 20, 30]}`', '`{"vlans": [10, 20, 30,]}`', '`{"vlans": (10, 20, 30)}`', '`{vlans: [10, 20, 30]}`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The first option is an object with a quoted key and an array of numbers. The second ends the array with a **trailing comma**. The third uses parentheses, which are not JSON containers (a Python tuple, not JSON). The fourth has an **unquoted key**, which JSON forbids.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. The parsed JSON is stored in the Python variable `data`. Which expression returns the management IP address of ACC-8?',
    exhibit: {
      kind: 'cli',
      text: `{
  "response": [
    {
      "hostname": "CORE-1",
      "managementIpAddress": "10.0.0.1",
      "role": "CORE",
      "upTime": "42 days"
    },
    {
      "hostname": "ACC-7",
      "managementIpAddress": "10.0.7.7",
      "role": "ACCESS",
      "upTime": "9 days"
    },
    {
      "hostname": "ACC-8",
      "managementIpAddress": "10.0.7.8",
      "role": "ACCESS",
      "upTime": "9 days"
    }
  ],
  "version": "1.0"
}`,
    },
    options: [
      'data["response"][2]["managementIpAddress"]',
      'data["response"][3]["managementIpAddress"]',
      'data["response"][1]["managementIpAddress"]',
      'data["managementIpAddress"][2]',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'ACC-8 is the **third** device, and array indexes start at 0, so it is index **2**. Index 3 does not exist (it would raise an error), index 1 returns ACC-7 (10.0.7.7), and the last option looks for a top-level key `managementIpAddress`, which does not exist because that key lives inside each device object.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two changes are required to make the document valid JSON? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `{
  "interface": "Gi0/1",
  "vlans": [10, 20, 30,],
  'mode': "trunk",
  "native": 1
}`,
    },
    options: [
      'Remove the comma after `30`',
      'Replace the single quotes around `mode` with double quotes',
      'Replace the square brackets around the VLAN list with curly braces',
      'Put double quotes around the number `1`',
      'Add a comma after `"native": 1`',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The array ends with a **trailing comma** and the key `mode` uses **single quotes**; those are the only two violations. Square brackets are the correct container for a list, numbers must not be quoted, and `"native": 1` is the last pair, so adding a comma after it would create a new trailing comma.',
  },
  {
    id: 'e7',
    type: 'input',
    stem: 'Refer to the exhibit. How many JSON objects (including the outermost one) does the document contain? Enter a number.',
    exhibit: {
      kind: 'cli',
      text: `{
  "site": "Branch-3",
  "devices": [
    {"name": "R3", "interfaces": [{"name": "Gi0/0/0"}, {"name": "Gi0/0/1"}]},
    {"name": "SW3", "interfaces": [{"name": "Gi1/0/1"}]}
  ]
}`,
    },
    answers: ['6'],
    placeholder: 'number',
    difficulty: 2,
    explanation:
      'Count the opening braces: the outer object (1), R3 (2), its two interface objects (3 and 4), SW3 (5) and its one interface object (6), which gives **6**. The square brackets form arrays and are not counted. Answers of 3 or 5 come from forgetting the outermost object or the objects nested inside the `interfaces` arrays.',
  },
  {
    id: 'e8',
    type: 'input',
    stem: 'Refer to the exhibit. How many JSON arrays (including nested and empty ones) does the document contain? Enter a number.',
    exhibit: {
      kind: 'cli',
      text: `{
  "vlans": [10, 20],
  "ports": [["Gi0/1", "Gi0/2"], ["Gi0/3"]],
  "tags": []
}`,
    },
    answers: ['5'],
    placeholder: 'number',
    difficulty: 3,
    explanation:
      'Count the opening brackets: `vlans` (1), the outer `ports` array (2), the two inner arrays inside it (3 and 4) and the empty `tags` array (5), so the answer is **5**. The entire document is an object, not an array, and an empty array still counts. Answers of 3 ignore the nesting.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each JSON value to its data type.',
    pairs: [
      { left: '`"true"`', right: 'String' },
      { left: '`true`', right: 'Boolean' },
      { left: '`42`', right: 'Number' },
      { left: '`null`', right: 'Null' },
      { left: '`[1, 2, 3]`', right: 'Array' },
      { left: '`{"a": 1}`', right: 'Object' },
    ],
    difficulty: 1,
    explanation:
      'The quotes make `"true"` a **string**, while the bare word `true` is a **boolean**. `42` has no quotes, so it is a number. `null` is its own type. Square brackets mean an array and curly braces mean an object.',
  },
  {
    id: 'e10',
    type: 'categorize',
    stem: 'Classify each statement by the data format it describes.',
    categories: ['JSON', 'XML', 'YAML'],
    items: [
      { text: 'Values are wrapped in opening and closing tags', category: 1 },
      { text: 'Uses braces, brackets and double-quoted keys', category: 0 },
      { text: 'Nesting is shown by indentation, with a hyphen for each list item', category: 2 },
      { text: 'Format of NETCONF messages', category: 1 },
      { text: 'Format of Ansible playbooks', category: 2 },
      { text: 'Most common body format returned by REST APIs such as Catalyst Center', category: 0 },
    ],
    difficulty: 2,
    explanation:
      '**XML** uses tags and carries NETCONF messages. **JSON** uses braces, brackets and quoted keys and is the usual REST API body. **YAML** relies on indentation and hyphens and is the format of Ansible playbooks.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. The parsed document is stored in `data`. Which expression returns the name of the ACL applied outbound on Gi0/0/1?',
    exhibit: {
      kind: 'cli',
      text: `{
  "interfaces": [
    {
      "name": "Gi0/0/0",
      "ipv4": {"address": "10.1.1.1", "mask": "255.255.255.0"},
      "acl": {"in": "BLOCK-TELNET", "out": null}
    },
    {
      "name": "Gi0/0/1",
      "ipv4": {"address": "172.16.5.1", "mask": "255.255.255.252"},
      "acl": {"in": null, "out": "WAN-OUT"}
    }
  ]
}`,
    },
    options: [
      'data["interfaces"][1]["acl"]["out"]',
      'data["interfaces"][2]["acl"]["out"]',
      'data["interfaces"][1]["ipv4"]["out"]',
      'data["interfaces"]["acl"][1]["out"]',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Gi0/0/1 is the **second** interface (index 1), the ACL information is in its `acl` object, and the outbound entry is the key `out`, which holds `"WAN-OUT"`. Index 2 does not exist, the `ipv4` object has no `out` key, and the last option applies a key to the `interfaces` array, which only accepts integer indexes.',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements about the document are true? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `{
  "device": "SW9",
  "mgmt": {"vlan": 99, "ip": "10.9.9.9"},
  "ports": [
    {"id": "Fa0/1", "mode": "access", "vlan": 10, "poe": true},
    {"id": "Fa0/2", "mode": "access", "vlan": "20", "poe": false},
    {"id": "Gi0/1", "mode": "trunk", "allowed": [10, 20, 99], "poe": null}
  ]
}`,
    },
    options: [
      'The `vlan` value for Fa0/1 is a number, but the `vlan` value for Fa0/2 is a string',
      'The `poe` value for Gi0/1 is the string "null"',
      'The `allowed` key holds an array of three numbers',
      '`ports` is an object that contains three keys',
      'The document contains exactly three objects',
    ],
    answers: [0, 2],
    difficulty: 3,
    explanation:
      '`10` has no quotes (number) while `"20"` has quotes (string), and `[10, 20, 99]` is an array of three numbers. The `poe` value `null` has no quotes, so it is the null type rather than a string. `ports` is an **array** of three objects, not an object. The document actually holds five objects: the outer one, `mgmt` and the three port objects.',
  },
  {
    id: 'e13',
    type: 'order',
    stem: 'Put the steps in the order a script follows to read the hostname of the first device from a controller API.',
    items: [
      'The script sends an HTTPS request to the controller API',
      'The controller returns an HTTP response whose body is JSON text',
      'The script parses the JSON text into a dictionary',
      'The script looks up the `response` key to get the array of devices',
      'The script selects index 0 of that array',
      'The script reads the `hostname` key of that device object',
    ],
    difficulty: 2,
    explanation:
      'The request must be sent and answered before anything can be parsed. After parsing, the lookups follow the nesting from the outside in: key `response` (array), index 0 (first device object), key `hostname` (the value).',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. A JSON parser rejects this document with a syntax error. Which element is responsible?',
    exhibit: {
      kind: 'cli',
      text: `{
  "id": 0,
  "offset": -5,
  "timeout": 2.5,
  "peers": [],
  "extra": {},
  "note": null,
  "enabled": True
}`,
    },
    options: [
      'The value `True` assigned to `enabled`',
      'The empty array assigned to `peers`',
      'The negative number assigned to `offset`',
      'The value `null` assigned to `note`',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'JSON booleans are lowercase, so `True` is invalid (it is the Python spelling). Empty arrays and empty objects are legal, negative and decimal numbers are legal, and `null` is a legal value.',
  },
  {
    id: 'e15',
    type: 'input',
    stem: 'Refer to the exhibit. How many key/value pairs does the document contain in total, counting the pairs inside nested objects? Enter a number.',
    exhibit: {
      kind: 'cli',
      text: `{
  "name": "EDGE-1",
  "mgmt": {"ip": "10.0.0.5", "vlan": 99},
  "links": [
    {"to": "CORE-1", "up": true},
    {"to": "CORE-2", "up": false}
  ]
}`,
    },
    answers: ['9'],
    placeholder: 'number',
    difficulty: 3,
    explanation:
      'The outer object has 3 pairs (`name`, `mgmt`, `links`), the `mgmt` object has 2 (`ip`, `vlan`), and each of the two link objects has 2 (`to`, `up`): 3 + 2 + 2 + 2 = **9**. Answering 3 counts only the top level, and array elements are not pairs by themselves.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. A parser rejects this document. What is wrong?',
    exhibit: {
      kind: 'cli',
      text: `{
  "hostname": "DIST-2",
  "interfaces": [
    {"name": "Gi1/0/1", "status": "up"},
    {"name": "Gi1/0/2", "status": "down"}
  ]
  "uptime": 1024
}`,
    },
    options: [
      'A comma is missing after the closing bracket of the `interfaces` array',
      'The `status` values must be booleans instead of strings',
      'An array may not contain objects',
      'The number 1024 must be enclosed in double quotes',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Two pairs in the same object must be separated by a **comma**, and there is none between the `interfaces` array and `"uptime"`. Strings such as `"up"` are valid values, arrays may contain objects, and numbers are written without quotes.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. The document is parsed into the Python variable `data`. Which two expressions return a list? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `{
  "vlans": [
    {"id": 10, "name": "USERS", "ports": ["Fa0/1", "Fa0/2"]},
    {"id": 20, "name": "VOICE", "ports": ["Fa0/3"]},
    {"id": 30, "name": "MGMT", "ports": []}
  ]
}`,
    },
    options: [
      'data["vlans"]',
      'data["vlans"][0]',
      'data["vlans"][2]["ports"]',
      'data["vlans"][1]["id"]',
      'data["vlans"][0]["name"]',
    ],
    answers: [0, 2],
    difficulty: 3,
    explanation:
      '`data["vlans"]` is the array of VLAN objects, and `data["vlans"][2]["ports"]` is an array too (an empty one is still a list). `data["vlans"][0]` is a single object (a dict), `["id"]` returns the number 20, and `["name"]` returns the string "USERS".',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'Refer to the exhibit. Which data format is shown?',
    exhibit: {
      kind: 'cli',
      text: `router:
  hostname: R1
  interfaces:
    - Gi0/0
    - Gi0/1`,
    },
    options: ['YAML', 'JSON', 'XML', 'HTML'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Nesting through **indentation**, `key: value` pairs and hyphens for list items are the signature of YAML. JSON would use braces, brackets and quotes, and XML or HTML would use angle-bracket tags.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A script parses a REST API response with `json.loads()`. Which Python types result from a JSON object and from a JSON array?',
    options: ['`dict` and `list`', '`list` and `dict`', '`tuple` and `set`', '`str` and `list`'],
    answer: 0,
    difficulty: 2,
    explanation:
      'A JSON **object** (key/value pairs) becomes a Python **dict**, and a JSON **array** (ordered values) becomes a Python **list**. The second option reverses them, and tuples and sets have no JSON equivalent.',
  },
  {
    id: 'e20',
    type: 'categorize',
    stem: 'Classify each snippet as valid or invalid JSON.',
    categories: ['Valid JSON', 'Invalid JSON'],
    items: [
      { text: '`{"mtu": 1500}`', category: 0 },
      { text: '`{"mtu": 1500,}`', category: 1 },
      { text: '`{"up": true, "down": false}`', category: 0 },
      { text: "`{'up': true}`", category: 1 },
      { text: '`["a", "b",]`', category: 1 },
      { text: '`{"peers": []}`', category: 0 },
      { text: '`{"ip": 10.1.1.1}`', category: 1 },
      { text: '`{"vlan": null}`', category: 0 },
    ],
    difficulty: 3,
    explanation:
      'The valid snippets are the plain number, the two lowercase booleans, the empty array and `null`. Invalid ones are the trailing commas in the object and in the array, the single-quoted pair, and `10.1.1.1`, which is neither a number (it has three dots) nor a string (it has no quotes); it would have to be written `"10.1.1.1"`.',
  },
];
