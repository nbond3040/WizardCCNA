import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'JSON Data',
    subtitle: 'Reading the data format that network APIs speak',
    notes:
      'Modern networks are managed by software, and software exchanges data as structured text. **JSON** (JavaScript Object Notation) is the format you will meet most often: the REST APIs of Catalyst Center, Meraki and the major clouds return it, and automation scripts parse it. The CCNA does not ask you to write programs. It asks you to **interpret JSON**: recognise valid and invalid syntax, name the data type of a value, count objects and arrays, and walk a nested structure to pull out one value. This topic is blueprint item 6.7 in v1.1 and sits in the automation domain (domain 5) of v2.0, so both exam versions test it. In this deck you will learn the syntax rules, practise spotting errors in exhibits, trace paths such as `data["response"][0]["hostname"]`, and compare JSON with XML and YAML. Expect several questions that show JSON in an exhibit, so slow and literal reading is the skill being tested.',
  },
  {
    kind: 'bullets',
    title: 'Why JSON matters in network operations',
    bullets: [
      'REST APIs send and receive **JSON** over HTTPS',
      'Controllers such as Catalyst Center expose device and client data this way',
      'Scripts (Python, Postman, Ansible) parse it into variables',
      'Plain text: **human-readable** and **machine-parsable**',
      'RESTCONF can carry JSON (`application/yang-data+json`)',
    ],
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'app', label: 'Script', icon: 'laptop' },
        { id: 'ctrl', label: 'Controller', icon: 'controller' },
      ],
      steps: [
        { from: 'app', to: 'ctrl', label: 'GET /dna/intent/api/v1/network-device', sub: 'Header: X-Auth-Token' },
        { from: 'ctrl', to: 'app', label: '200 OK', sub: 'Content-Type: application/json', tone: 'accent' },
        { note: 'Body is JSON text: {"response": [ ... ], "version": "1.0"}' },
        { note: 'The script parses the text into dictionaries and lists' },
      ],
    },
    notes:
      'Think of JSON as the common language between a program and a network platform. When a script asks Catalyst Center for its device list, the controller answers with an HTTP status such as **200 OK**, a header saying the body is `application/json`, and a body made of JSON text. The script converts that text into native data structures, which in Python are dictionaries and lists, and then picks out the fields it needs, for example every `hostname` or every `managementIpAddress`. RESTCONF, the HTTP interface to YANG-modelled devices, can also carry JSON, using the media type `application/yang-data+json`. JSON replaced XML in most REST APIs because it is shorter and maps directly onto the objects and arrays of programming languages. For the exam, the REST verbs and status codes belong to another lesson; here the focus is reading the body that comes back and being able to describe its structure precisely.',
  },
  {
    kind: 'cli',
    title: 'Anatomy of a JSON document',
    code: `{
  "hostname": "SW1",
  "vlan": 10,
  "enabled": true,
  "uplinks": ["Gi1/0/1", "Gi1/0/2"],
  "contact": null
}`,
    highlight: ['"hostname"', '"uplinks"', 'null'],
    caption: 'One object with five key/value pairs; the value of "uplinks" is an array of two strings.',
    bullets: [
      '`{ }` wraps an **object**: unordered key/value pairs',
      '`[ ]` wraps an **array**: an ordered list whose index starts at **0**',
      'Each pair is `"key": value`: key, colon, then value',
      'Commas **separate** pairs and elements; the last one has none',
    ],
    notes:
      'Read this document from the outside in. The outer curly braces make it a single **object**. Inside are five **key/value pairs**; each key is a string in double quotes, followed by a colon, followed by a value. The values show four different types, a string (`"SW1"`), a number (`10`), a boolean (`true`) and `null`, plus an **array** in square brackets that holds two strings. Every pair except the last is followed by a comma, and adding a comma after the final pair is the most common syntax error on the exam. Line breaks and indentation are only for humans: a parser ignores whitespace outside strings, so the same data could be written on one line. An object is looked up by key, while an array is looked up by position, and positions start counting at zero, so `"Gi1/0/1"` is element 0 of `uplinks`.',
  },
  {
    kind: 'table',
    title: 'The six JSON value types',
    columns: ['Type', 'Example', 'Rules to remember'],
    rows: [
      ['**String**', '`"SW1"`, `"10"`', 'Always **double quotes**; digits inside quotes are still text'],
      ['**Number**', '`10`, `-4`, `3.14`', 'No quotes; integer or decimal; no leading zeros'],
      ['**Boolean**', '`true`, `false`', 'Lowercase, no quotes'],
      ['**Null**', '`null`', 'Lowercase, no quotes; means "no value"'],
      ['**Object**', '`{"vlan": 10}`', 'Unordered key/value pairs inside braces'],
      ['**Array**', '`[10, 20, 30]`', 'Ordered values inside brackets; types may be mixed'],
    ],
    caption: 'The quote test: "10" is a string and 10 is a number; "true" is a string and true is a boolean.',
    notes:
      'JSON has exactly six value types, and the exam expects you to name them from a quick glance. **Strings** are always wrapped in double quotes and can contain anything, including digits, so `"10"` is text. **Numbers** have no quotes and may be integers or decimals; negative values are fine, and a leading zero is not allowed. **Booleans** are the lowercase words `true` and `false`, and **null** is the lowercase word `null`, used when a field exists but has no value. **Objects** and **arrays** are the two containers, and they can hold any of the six types, including more objects and arrays, which is what creates nesting. The classic trap is the quote test: if a value is inside quotes it is a string, no matter what it looks like. `"vlan": "10"`, `"enabled": "true"` and `"mtu": "1500"` are all strings, while the same values without quotes are a number, a boolean and a number.',
  },
  {
    kind: 'bullets',
    title: 'Syntax rules the exam checks',
    bullets: [
      'Data is stored as **key/value pairs**: `"key": value`',
      'Keys are **strings in double quotes**, never bare words',
      'Strings use **double quotes only**; single quotes are invalid',
      'Commas separate items, and ==there is no trailing comma==',
      '`true`, `false` and `null` are **lowercase** and unquoted',
      'Every `{` needs a `}` and every `[` needs a `]`',
      'JSON has **no comments**',
    ],
    notes:
      'These seven rules explain nearly every validity question. JSON is stricter than the languages people usually compare it to. JavaScript allows unquoted keys and single-quoted strings, Python writes `True` and `None`, and many programming languages tolerate a trailing comma, but none of that is legal JSON. When you read an exhibit, check four things in order: quotes on every key and string, commas between items and nothing after the last one, matching opening and closing braces and brackets, and lowercase `true`, `false` and `null`. Comments are another trap. People often annotate configuration files with `//` or `#`, and JSON simply has no comment syntax, so a document containing either one is invalid. YAML and XML do allow comments, which is one reason YAML is preferred for hand-written files such as Ansible playbooks.',
  },
  {
    kind: 'table',
    title: 'Valid or invalid? Practise on one-liners',
    columns: ['Snippet', 'Verdict', 'Reason'],
    rows: [
      ['`{"vlan": 10}`', '**Valid**', 'Object with a quoted key and a number value'],
      ['`{"vlan": 10,}`', '**Invalid**', 'Trailing comma after the last pair'],
      ["`{'vlan': 10}`", '**Invalid**', 'Single quotes around the key'],
      ['`{vlan: 10}`', '**Invalid**', 'Key is not a quoted string (legal in JavaScript, not in JSON)'],
      ['`{"up": True}`', '**Invalid**', 'Boolean must be lowercase `true`'],
      ['`{"a": 1 "b": 2}`', '**Invalid**', 'Missing comma between the pairs'],
      ['`["R1", "R2"]`', '**Valid**', 'A top-level array is allowed'],
      ['`{"ports": []}`', '**Valid**', 'An empty array is a legal value'],
    ],
    notes:
      'Practise the verdict on these one-liners until it takes two seconds. The first test is the key: a bare word such as `vlan` or single quotes around it will fail. The second test is punctuation: commas go between items and never after the last, and a missing comma is as fatal as an extra one. The third test is the literals: `True` with a capital T is Python, not JSON. Notice what is valid that people wrongly reject. A document may be a top-level array rather than an object, an array may be empty, and an object may be empty. Notice also that the data itself is not judged: a document that says `"vlan": 10` is valid even if VLAN 10 does not exist, because JSON describes only the syntax. On the exam, validity questions usually hide a single error in a longer document, so train yourself to scan line by line.',
  },
  {
    kind: 'cli',
    title: 'Find the five errors',
    code: `{
  'hostname': "R1",
  "interfaces": [
    {"name": "Gi0/0/0", "up": True}
    {"name": "Gi0/0/1", "up": false},
  ],
  mtu: 1500
}`,
    highlight: ["'hostname'", 'True', 'mtu:'],
    caption: 'A plausible device document with five syntax violations.',
    bullets: [
      "`'hostname'` is single-quoted; keys need double quotes",
      '`True` must be lowercase `true`',
      'A comma is missing after the first interface object',
      'The comma after the last array element is a trailing comma',
      'The key `mtu` is not quoted',
    ],
    notes:
      'Here is the kind of exhibit Cisco likes: a plausible device document with several syntax mistakes. Use a fixed checklist rather than hoping to spot them by eye. First pass, quotes: the key on the first line is single-quoted, which is invalid. Second pass, commas: after the first interface object there is no comma before the second object, and after the second object there is a comma although it is the last element of the array. Third pass, literals: `True` should be `true`. Fourth pass, keys: `mtu` has no quotes at all. Brackets and braces are balanced, so that pass finds nothing. After fixing all five problems the document is valid and says that device R1 has two interfaces and an MTU of 1500. If a question asks for the minimum change to make the document valid, count the real violations only. Questions often include distractors that propose changing things which were already legal, such as quoting a number.',
  },
  {
    kind: 'cli',
    title: 'A real response: the device list',
    code: `$ curl -s -H "X-Auth-Token: $TOKEN" https://catc.example.com/dna/intent/api/v1/network-device
{
  "response": [
    {
      "hostname": "DIST-SW1",
      "managementIpAddress": "10.10.1.2",
      "role": "DISTRIBUTION",
      "reachabilityStatus": "Reachable",
      "interfaceCount": "52"
    },
    {
      "hostname": "ACC-SW1",
      "managementIpAddress": "10.10.1.11",
      "role": "ACCESS",
      "reachabilityStatus": "Unreachable",
      "interfaceCount": "28"
    }
  ],
  "version": "1.0"
}`,
    highlight: ['"response"', '"hostname"', '"version"'],
    caption: 'Modelled on the Catalyst Center network-device call.',
    bullets: [
      'Outer object has **2 keys**: `response` (array) and `version` (string)',
      '`response` holds **2 objects**, one per device',
      '`"52"` is in quotes, so it is a **string**, not a number',
    ],
    notes:
      'This response is modelled on the device-list call of the Catalyst Center intent API. The script sends the request with an `X-Auth-Token` header and receives one JSON object. That object has two keys. The key `response` holds an **array** with one **object** per device, and `version` is a plain string. Each device object repeats the same keys, which is why an array of objects is the most common shape in network APIs: one record per device, interface or client. Notice that `"interfaceCount": "52"` is in quotes, so it is a string even though it looks like a number. APIs do this often, and the exam copies the trick. Also notice that the wrapper key is named `response`, so a script that stores the whole reply in a variable called `response` must write `response["response"]` to reach the list. That repeated name is exactly why the checklist example looks odd at first.',
  },
  {
    kind: 'diagram',
    title: 'The same data as a tree',
    diagram: {
      type: 'flow',
      width: 10,
      height: 5,
      nodes: [
        { id: 'root', label: 'Root', sub: 'object { }', x: 1, y: 2.5 },
        { id: 'resp', label: '"response"', sub: 'array [ ]', x: 3.6, y: 1, tone: 'accent' },
        { id: 'ver', label: '"version"', sub: 'string "1.0"', x: 3.6, y: 4, tone: 'muted' },
        { id: 'd0', label: '[0]', sub: 'object { }', x: 6.2, y: 1, tone: 'accent' },
        { id: 'd1', label: '[1]', sub: 'object { }', x: 6.2, y: 2.6 },
        { id: 'h0', label: '"hostname"', sub: '"DIST-SW1"', x: 8.8, y: 1, tone: 'accent' },
        { id: 'h1', label: '"hostname"', sub: '"ACC-SW1"', x: 8.8, y: 2.6 },
      ],
      edges: [
        { from: 'root', to: 'resp', label: 'key', tone: 'accent' },
        { from: 'root', to: 'ver', label: 'key' },
        { from: 'resp', to: 'd0', label: 'index 0', tone: 'accent' },
        { from: 'resp', to: 'd1', label: 'index 1' },
        { from: 'd0', to: 'h0', label: 'key', tone: 'accent' },
        { from: 'd1', to: 'h1', label: 'key' },
      ],
    },
    caption: 'Path to the first hostname: ["response"][0]["hostname"] returns "DIST-SW1".',
    notes:
      'Drawing the document as a tree makes navigation obvious. The root is an object, and its keys are the labels on the first branches: `response` leads to an array and `version` leads to a string leaf. Arrays branch by position, so the array has branches labelled 0 and 1, and each of those leads to an object. Each object branches again by key, and the leaves are the actual values. To read a value you follow one branch at every level. The path to the first hostname is root, then key `response`, then index 0, then key `hostname`, which is why the Python expression has three lookups in a row. Branches that are keys use square brackets with a quoted string, and branches that are positions use square brackets with a bare integer. If a question gives you a long document, sketch this tree on the scratch paper, because it turns nested braces into a path you can follow without losing your place.',
  },
  {
    kind: 'steps',
    title: 'Walking a path one hop at a time',
    steps: [
      { title: '`data`', text: 'The whole parsed document: an object with the keys `response` and `version`.' },
      { title: '`["response"]`', text: 'Key lookup in an object returns the **array** of device objects.' },
      { title: '`[0]`', text: 'Index lookup in an array returns the **first** device; counting starts at 0.' },
      { title: '`["hostname"]`', text: 'Key lookup in that device object returns the string `"DIST-SW1"`.' },
    ],
    notes:
      'Reading a path is a sequence of tiny, independent lookups, and each lookup consumes exactly one level of nesting. Start with the variable `data`, which holds the whole parsed document. The first lookup, `["response"]`, uses a key because `data` is an object, and it returns the array. The second lookup, `[0]`, uses an integer because the current value is an array, and it returns the first device object. The third lookup, `["hostname"]`, uses a key again because the current value is an object, and it returns the string. If you ever feel unsure, ask what type the current value is: an object wants a key, an array wants an index. Two mistakes cause wrong answers. Counting from 1 instead of 0 returns the second device instead of the first, and asking for index 2 in a two-element array raises an index error. A missing key raises a key error. The same rules apply in any language.',
  },
  {
    kind: 'cli',
    title: 'Practice: arrays inside arrays',
    code: `$ cat sample.json
{
  "vlans": [10, 20, 30],
  "matrix": [[1, 2], [3, 4]],
  "mixed": ["R1", 42, false, null, {"k": "v"}]
}
$ jq '.vlans[2]' sample.json
30
$ jq '.matrix[1][0]' sample.json
3
$ jq '.mixed[4].k' sample.json
"v"
$ jq '.mixed[3]' sample.json
null`,
    highlight: ['.vlans[2]', '.matrix[1][0]', '.mixed[4].k'],
    caption: 'jq uses dots and brackets; Python and JavaScript write data["vlans"][2] instead.',
    bullets: [
      '`vlans[2]`: the third element of the array, `30`',
      '`matrix[1][0]`: second inner array, first element, `3`',
      '`mixed[4]["k"]`: object at index 4, key `k`, `"v"`',
    ],
    notes:
      'Here the same skill is practised on a small document, using the `jq` command line tool, which prints the part of a JSON file that a path selects. The dot syntax of `jq` is just another notation for the same lookups: `.vlans[2]` means the key `vlans`, then index 2. The first example returns `30` because the array has the elements 10, 20 and 30 at indexes 0, 1 and 2. The second goes into an array that contains arrays: `matrix[1]` is the inner array `[3, 4]`, and its element 0 is `3`. The third reaches into an object stored inside an array, and the fourth shows that `null` is a real value that prints as `null`, without quotes. Notice that string results print with quotes and numbers without, which is a quick type check. Arrays that mix types, such as `mixed`, are legal; you simply have to know what sits at each index.',
  },
  {
    kind: 'cli',
    title: 'Counting objects, arrays and pairs',
    code: `{
  "site": "HQ",
  "devices": [
    {"name": "R1", "ports": ["Gi0/0", "Gi0/1"]},
    {"name": "SW1", "ports": ["Fa0/1"]}
  ],
  "active": true
}`,
    highlight: ['"devices"', '"ports"'],
    caption: 'Count opening symbols: { for objects, [ for arrays.',
    bullets: [
      'Objects (`{`): **3**, the outer one plus R1 and SW1',
      'Arrays (`[`): **3**, `devices` plus two `ports` lists',
      'Key/value pairs: **7**, which is 3 outer + 2 in R1 + 2 in SW1',
      'Elements: `devices` has **2**, R1 `ports` has **2**, SW1 `ports` has **1**',
    ],
    notes:
      'Counting questions look intimidating but are mechanical. To count **objects**, count the opening curly braces. To count **arrays**, count the opening square brackets. Do not count the closing symbols as well, or you will double the answer, and remember that the outermost braces are an object too. In this document there are three opening braces: the outer object and one object for each device. There are three opening brackets: the `devices` list and one `ports` list inside each device. To count **key/value pairs**, count the colons that sit outside strings, or count the keys: `site`, `devices` and `active` at the top, then `name` and `ports` inside R1, and `name` and `ports` inside SW1, which makes seven. The exam may also ask how many elements an array has, or how many pairs are in one particular object. Read the question twice, because total pairs and top-level pairs give different numbers, seven and three here.',
  },
  {
    kind: 'compare',
    title: 'Object versus array',
    left: {
      heading: 'Object  { }',
      bullets: [
        'A set of **key/value pairs**',
        'Look up by **key**: `data["name"]`',
        'Keys are unique inside one object',
        'Order of pairs carries no meaning',
        'Python type: **dict**',
      ],
    },
    right: {
      heading: 'Array  [ ]',
      bullets: [
        'An ordered list of **values**',
        'Look up by **index**: `data[0]`',
        'The first index is **0**',
        'Elements may be any type, even mixed',
        'Python type: **list**',
      ],
      tone: 'accent',
    },
    notes:
      'Objects and arrays are the two containers, and choosing the right lookup depends on recognising which one you hold. An **object** is a set of named values. Names are unique within the object, order carries no meaning, and you reach a value by its key, such as `data["hostname"]`. An **array** is an ordered sequence. Elements have no names, only positions, and you reach one by an integer index starting at zero, such as `data[0]`. Arrays may mix types, so `[1, "two", true, null, {"k": "v"}]` is valid. In Python the two containers become a dictionary and a list. In exam exhibits, the quickest identification trick is to look at the first character: a brace means key lookups, a bracket means index lookups. A frequent wrong answer applies a key to an array, for example `data["response"]["hostname"]`, which fails because `response` is an array of devices and has no key named hostname.',
  },
  {
    kind: 'table',
    title: 'JSON types in Python',
    columns: ['JSON', 'Python', 'Example'],
    rows: [
      ['object', '`dict`', '`{"vlan": 10}`'],
      ['array', '`list`', '`["R1", "R2"]`'],
      ['string', '`str`', '`"R1"`'],
      ['number', '`int` or `float`', '`10`, `3.14`'],
      ['true / false', '`True` / `False`', '`true`, `false`'],
      ['null', '`None`', '`null`'],
    ],
    caption: '`json.loads(text)` parses JSON text into Python objects; `json.dumps(obj)` turns them back into text.',
    notes:
      'Most network automation is written in Python, so the exam sometimes states answers in Python terms. When a script calls `json.loads()` on JSON text, or calls `.json()` on an HTTP response from the `requests` library, every JSON type becomes a native Python type. Objects become **dictionaries** and arrays become **lists**. Strings become `str`, and numbers become `int` or `float` depending on whether there is a decimal point. The three literals are the part that trips people up, because Python capitalises `True` and `False` and spells null as `None`, whereas JSON uses lowercase `true`, `false` and `null`. Going the other way, `json.dumps()` converts a Python structure back into JSON text, which is what a script does before sending a request body. A related pair, `json.load()` and `json.dump()`, read from and write to files. Remember that JSON itself is only text; the Python types exist after parsing.',
  },
  {
    kind: 'cli',
    title: 'One data set in three formats',
    code: `[ JSON ]
  {
    "name": "R1",
    "ports": ["Gi0/0", "Gi0/1"],
    "up": true
  }

[ XML ]
  <device>
    <name>R1</name>
    <ports>
      <port>Gi0/0</port>
      <port>Gi0/1</port>
    </ports>
    <up>true</up>
  </device>

[ YAML ]
  name: R1
  ports:
    - Gi0/0
    - Gi0/1
  up: true`,
    highlight: ['[ JSON ]', '[ XML ]', '[ YAML ]'],
    bullets: [
      '**JSON**: braces, brackets, quotes and commas',
      '**XML**: opening and closing **tags**, no commas',
      '**YAML**: **indentation** and hyphens, minimal punctuation',
    ],
    notes:
      'This slide encodes one small record three ways so you can recognise each format at a glance. In **JSON** the structure is carried by braces, brackets, colons and commas, and strings and keys are quoted. In **XML** each value sits between an opening and a closing tag, lists are repeated child elements, and there are no commas at all. In **YAML** structure comes from indentation: a hyphen starts each list item, a colon separates key and value, and quotes are usually optional. If an exhibit contains angle brackets, think XML; if it has braces and quotes, think JSON; if it has no punctuation except colons and hyphens, think YAML. All three carry the same information and can be converted into each other, but they are not interchangeable in every context: NETCONF messages are always XML, REST APIs usually return JSON, and Ansible playbooks are written in YAML. The exam rarely asks which format is better; it asks which format is shown or which tool uses it.',
  },
  {
    kind: 'table',
    title: 'JSON vs XML vs YAML',
    columns: ['Feature', 'JSON', 'XML', 'YAML'],
    rows: [
      ['Structure', 'Braces, brackets, colons, commas', 'Nested tags `<a>…</a>`', 'Indentation, `key: value`, `- item`'],
      ['Comments', '**Not allowed**', '`<!-- comment -->`', '`# comment`'],
      ['Quoting', 'Keys and strings need double quotes', 'Element text is not quoted', 'Quotes usually optional'],
      ['Size', 'Compact', 'Most verbose (closing tags)', 'Least punctuation'],
      ['Typical network use', 'REST APIs, Catalyst Center, RESTCONF', 'NETCONF, RESTCONF', 'Ansible playbooks and inventory'],
    ],
    notes:
      'Use this table to answer "which format" questions. JSON is compact and maps directly to the data structures of programming languages, which is why REST APIs prefer it. XML is verbose because every element needs a closing tag, but it supports schemas, namespaces and comments, and NETCONF messages are XML. RESTCONF, the HTTP-based sibling of NETCONF, can use either XML or JSON. YAML is the most human-friendly of the three, with minimal punctuation and comments written with a hash sign, which is why Ansible playbooks and inventories use it. Only JSON forbids comments. A trap to remember is that readability is relative: exam answers will describe YAML as the easiest to read and XML as the most verbose, but they will not call any of the three inherently more secure or faster. Data formats describe structure only; transport security comes from HTTPS or SSH, and the choice of format has nothing to do with it.',
  },
  {
    kind: 'definitions',
    title: 'Key terms',
    terms: [
      { term: 'JSON', def: 'JavaScript Object Notation: a text format for structured data built from objects and arrays.' },
      { term: 'Object', def: 'Unordered collection of `"key": value` pairs inside curly braces.' },
      { term: 'Array', def: 'Ordered list of values inside square brackets, indexed from 0.' },
      { term: 'Key/value pair', def: 'A quoted key, a colon and a value of any JSON type.' },
      { term: 'Nesting', def: 'Objects and arrays placed inside other objects and arrays.' },
      { term: 'Parse / serialise', def: 'Parse: text to data structure. Serialise: data structure back to text.' },
    ],
    notes:
      'This glossary collects the vocabulary used in exam stems. Learn the verbs as well as the nouns: to **parse** is to turn JSON text into a data structure, and to **serialise** (or "dump") is to turn a structure back into text. A **key** names a value, and the pair of a key and its value is a **member** of an object. The word **element** is used for the items of an array. **Nesting** means that a container sits inside another container, and the depth of nesting determines how many lookups are needed to reach a value. Cisco exam writers also use the phrase **data model** for a formal description of what fields may exist, such as YANG. JSON itself does not enforce a data model; it only provides the syntax. Finally, **payload** and **body** both mean the data carried in an HTTP request or response, which is where JSON lives in REST calls. Keep these terms straight and the stems become much easier to decode.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'JSON questions are won by **slow, literal reading**. Check quotes, commas, brackets and the position of every value before you look at the answers.',
    bullets: [
      'A value in quotes is a **string**, even if it looks like a number or `true`',
      'A trailing comma, single quotes or an unquoted key make the document **invalid**',
      'Array indexes start at **0**: the second element is `[1]`',
      'Count `{` for objects and `[` for arrays, including the outermost one',
      '`True` and `None` are Python; JSON uses `true` and `null`',
      'Never apply a key to an array or an index to an object',
    ],
    notes:
      'The exam presents JSON in an exhibit and then asks a very specific question, so the traps are about precision rather than depth. First, quotes decide types: a quoted number is a string and a quoted word `true` is a string, not a boolean. Second, validity questions hide a single violation, usually a trailing comma, a single quote or an unquoted key, in an otherwise tidy document, so you must read to the end. Third, indexes start at zero, which turns the second device into `[1]` and the third into `[2]`. Fourth, counting questions include the outermost object, and they separate objects from arrays, so count the right symbol. Fifth, the Python spellings `True` and `None` are not JSON. Finally, never apply a key to an array or an index to an object. Before you pick an answer, trace the full path from the root and name the type at every step; that single habit prevents almost every lost point in this topic.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Six value types: string, number, boolean, null, object, array',
      'Valid JSON: double-quoted keys and strings, no trailing comma, no comments',
      'Objects `{ }` use keys; arrays `[ ]` use zero-based indexes',
      'Count objects with `{` and arrays with `[`; pairs by their keys',
      'Navigate by alternating key and index lookups from the root',
      'JSON for REST APIs, XML for NETCONF, YAML for Ansible',
    ],
    notes:
      'Close the topic by checking that you can do five things without help. First, recite the syntax rules: double-quoted keys and strings, commas between items and none after the last, lowercase literals, no comments. Second, name the six value types and use the quote test to tell strings from numbers and booleans. Third, tell a valid document from an invalid one by scanning for the usual errors. Fourth, count objects with opening braces, arrays with opening brackets, and pairs by their keys. Fifth, navigate with alternating key and index lookups, remembering that arrays start at zero. If you can also say which of JSON, XML and YAML is on screen, and which tool or protocol normally uses it, you are ready for this topic on either exam version. The flashcards and quiz that follow rehearse exactly these skills, and the practice exams include many exhibits with nested documents.',
  },
];
