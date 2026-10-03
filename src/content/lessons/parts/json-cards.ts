import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'JSON stands for', back: '**JavaScript Object Notation**: a lightweight, text-based format for exchanging structured data.' },
  { id: 'f2', front: 'Symbols that enclose a JSON object', back: 'Curly braces `{ }` holding key/value pairs.' },
  { id: 'f3', front: 'Symbols that enclose a JSON array', back: 'Square brackets `[ ]` holding an ordered list of values.' },
  { id: 'f4', front: 'Index of the first element of a JSON array', back: '**0**. The first element is `[0]`, the second is `[1]`, the third is `[2]`.' },
  { id: 'f5', front: 'What type must a JSON key be?', back: 'A **string in double quotes**, for example `"hostname"`.' },
  { id: 'f6', front: 'Which quote characters may JSON strings use?', back: '**Double quotes only.** Single quotes make the document invalid.' },
  { id: 'f7', front: 'Is a trailing comma allowed in JSON?', back: '**No.** A comma after the last pair or the last array element is a syntax error.' },
  { id: 'f8', front: 'Punctuation between a key and its value; between pairs', back: 'A **colon** between key and value; a **comma** between pairs and between array elements.' },
  { id: 'f9', front: 'The six JSON value types', back: 'String, number, boolean, null, object, array.' },
  { id: 'f10', front: 'JSON boolean values', back: '`true` and `false`: lowercase and unquoted.' },
  { id: 'f11', front: 'JSON null', back: '`null` (lowercase, unquoted) means "no value". The Python equivalent is `None`.' },
  { id: 'f12', front: 'Data type of `"vlan": "10"`', back: '**String**. The quotes make it text even though it looks like a number.' },
  { id: 'f13', front: 'Data type of `"vlan": 10`', back: '**Number**. No quotes means it is numeric.' },
  { id: 'f14', front: 'Can JSON contain comments?', back: '**No.** `//` and `#` comments are invalid. XML uses `<!-- -->` and YAML uses `#`.' },
  { id: 'f15', front: 'Python types that match a JSON object and a JSON array', back: 'Object becomes a `dict` (dictionary); array becomes a `list`.' },
  { id: 'f16', front: 'Python spellings of JSON true, false and null', back: '`True`, `False` and `None`. JSON itself uses lowercase `true`, `false`, `null`.' },
  { id: 'f17', front: '`json.loads()` versus `json.dumps()`', back: '`loads` parses a JSON **string** into Python objects; `dumps` turns Python objects into a JSON **string**.' },
  { id: 'f18', front: 'Fast way to count objects and arrays in a document', back: 'Count the opening braces `{` for objects and the opening brackets `[` for arrays. The outermost one counts.' },
  { id: 'f19', front: 'Value of `data["a"][1]` when `data = {"a": [5, 6, 7]}`', back: '**6**: key `a` returns the array, and index 1 is the second element.' },
  { id: 'f20', front: 'Can a JSON array hold values of different types?', back: '**Yes.** Elements may be strings, numbers, booleans, null, objects or other arrays.' },
  { id: 'f21', front: 'Does key order matter inside a JSON object?', back: '**No.** Objects are unordered and looked up by key; arrays are ordered and looked up by index.' },
  { id: 'f22', front: 'Which data format uses opening and closing tags?', back: '**XML**, for example `<name>R1</name>`. NETCONF messages use it.' },
  { id: 'f23', front: 'Which data format uses indentation and hyphens for lists?', back: '**YAML**. Ansible playbooks and inventory files are written in it.' },
  { id: 'f24', front: 'HTTP media types for JSON', back: '`application/json` for REST APIs; RESTCONF uses `application/yang-data+json`.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which pair of symbols encloses a JSON object?',
    options: ['Curly braces `{ }`', 'Square brackets `[ ]`', 'Parentheses `( )`', 'Angle brackets `< >`'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Objects use **curly braces** and hold key/value pairs. Square brackets enclose arrays, while parentheses and angle brackets are not JSON structure characters (angle brackets belong to XML tags).',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'What is the data type of the value in `"vlan": "20"`?',
    options: ['Number', 'String', 'Boolean', 'Array'],
    answer: 1,
    difficulty: 1,
    explanation:
      'Anything inside double quotes is a **string**, even when it contains only digits. The same value written without quotes, `20`, would be a number.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two snippets are valid JSON? (Choose two.)',
    options: [
      '`{"name": "R1", "up": true}`',
      "`{'name': 'R1'}`",
      '`{"ports": ["Gi0/0", "Gi0/1"],}`',
      '`["R1", "R2"]`',
      '`{name: "R1"}`',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'The first snippet is an object with a quoted key, a string and a lowercase boolean, and the fourth is a legal top-level array. The second uses single quotes, the third has a trailing comma before the closing brace, and the fifth has an unquoted key.',
  },
  {
    id: 'q4',
    type: 'input',
    stem: 'A script stores `{"vlans": [10, 20, 30]}` in the variable `data`. What value does `data["vlans"][1]` return?',
    answers: ['20'],
    placeholder: 'value',
    difficulty: 2,
    explanation:
      'The key `vlans` returns the array `[10, 20, 30]`. Indexes start at 0, so index 1 is the **second** element, which is `20`. Index 0 would be `10`.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'How many JSON objects are in `{"a": {"b": 1}, "c": [{"d": 2}]}`?',
    options: ['2', '3', '4', '5'],
    answer: 1,
    difficulty: 2,
    explanation:
      'Count the opening braces: the outer object, `{"b": 1}` and `{"d": 2}` make **three** objects. The square brackets around the last one form an array, which is not counted as an object.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each item to the feature that identifies it.',
    pairs: [
      { left: 'JSON', right: 'Braces, brackets and double-quoted keys' },
      { left: 'XML', right: 'Opening and closing tags' },
      { left: 'YAML', right: 'Indentation and hyphens; used by Ansible' },
      { left: '`json.loads()`', right: 'Parses JSON text into Python objects' },
    ],
    difficulty: 1,
    explanation:
      'JSON is recognised by braces, brackets and quoted keys; XML by tags; YAML by indentation and hyphens. In Python, `json.loads()` parses a JSON string into dictionaries and lists.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'What does the Python expression `data["response"][0]["hostname"]` return?',
    options: [
      'The hostname of the first device in the response array',
      'The first character of the hostname',
      'The hostname of the second device in the response array',
      'The whole response array',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The lookups are key `response` (the array), index `0` (the **first** element, because counting starts at zero) and key `hostname` (the string value). Index 1 would give the second device, and stopping after `["response"]` would return the whole array.',
  },
];
