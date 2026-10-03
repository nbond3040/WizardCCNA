import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'AI & Machine Learning in Network Operations',
    subtitle: 'Predictive and generative AI, AIOps, risks and prompt design',
    notes:
      'Artificial intelligence has moved from research papers into the tools that run networks. Controllers baseline traffic and flag anomalies, assistants draft configurations, and engineers paste logs into chat windows to get a quick explanation. The CCNA now expects you to explain this landscape in plain terms. This deck separates the vocabulary of AI, machine learning and deep learning, then contrasts **predictive** AI, which forecasts and detects, with **generative** AI, which creates text, code and configurations. You will see the network use cases, including AIOps and the AI Network Analytics capability of Catalyst Center, and the risks that come with them: hallucinations, data privacy, and the need to verify everything before deployment with a **human in the loop**. The last part covers how to write a good prompt, with persona, instructions, context, data classification and output format. Prompt construction is a v2.0 emphasis, while v1.1 expects the underlying concepts. This is blueprint item 6.4 in v1.1 and part of domain 5 in v2.0.',
  },
  {
    kind: 'diagram',
    title: 'AI, machine learning and deep learning',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Concept',
          layers: [
            { label: 'Artificial intelligence', sub: 'machines doing tasks that need human intelligence' },
            { label: 'Machine learning', sub: 'learns patterns from data, not hand-written rules', tone: 'accent' },
            { label: 'Deep learning', sub: 'neural networks with many layers' },
            { label: 'Generative AI and LLMs', sub: 'deep models that create new content' },
          ],
        },
        {
          title: 'Network example',
          layers: [
            { label: 'Expert systems', sub: 'rule-based diagnosis' },
            { label: 'Baselines and forecasts', sub: 'learned from telemetry', tone: 'accent' },
            { label: 'Traffic and fault classification', sub: 'many-layer models' },
            { label: 'Drafting configs and summaries', sub: 'chat assistants' },
          ],
        },
      ],
    },
    caption: 'Each layer is a subset of the layer above it.',
    notes:
      'These terms are often used as if they meant the same thing, but they are nested. **Artificial intelligence** is the broadest idea: software that performs tasks which normally need human intelligence, such as recognising patterns, making decisions or understanding language. **Machine learning** is the part of AI in which a system learns patterns from data instead of following hand-written rules, so it improves with more examples. **Deep learning** is a subset of machine learning that uses neural networks with many layers, which is what makes image, speech and language tasks possible. **Generative AI**, including large language models, is built on deep learning and creates new content. A good memory aid is a set of nested boxes: every deep learning model is machine learning, and every machine learning system is AI, but not the other way round. A fixed rule engine that diagnoses a fault from a decision tree is AI in the broad sense yet involves no learning, which is a favourite distinction in exam questions.',
  },
  {
    kind: 'bullets',
    title: 'How machine learning works',
    bullets: [
      'A model learns patterns from **training data**',
      '**Training** builds the model; **inference** applies it to new data',
      'More and cleaner data usually means better predictions',
      'Models give probabilities, not guarantees',
      'Poor or biased data produces poor or biased results',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'd', label: 'Network data', sub: 'telemetry, logs, flows' },
        { id: 't', label: 'Training', sub: 'learn the patterns' },
        { id: 'm', label: 'Model', sub: 'the trained result', tone: 'accent' },
        { id: 'i', label: 'Inference', sub: 'apply to new data' },
        { id: 'o', label: 'Insight', sub: 'alert, forecast, advice', tone: 'good' },
      ],
    },
    notes:
      'Machine learning turns data into a **model**. During **training**, an algorithm studies many examples, for instance months of interface counters, and adjusts the internal parameters of the model until it captures the patterns. During **inference**, the finished model is applied to new data, such as this hour of counters, and produces an output: a prediction, a score or a classification. Training is expensive and happens occasionally; inference is cheap and happens continuously. Three practical points matter for the exam. First, the quality of the result depends on the quality and quantity of the training data, so biased, noisy or incomplete data gives unreliable output. Second, models express probability, not certainty, which is why an alert from an ML system is a lead to investigate rather than a proven fault. Third, a model learns from the past, so a sudden change in the network, such as a new application or a redesign, can make its baseline stale until it is retrained.',
  },
  {
    kind: 'table',
    title: 'Three ways machines learn',
    columns: ['Type', 'Training data', 'What it learns', 'Network example'],
    rows: [
      ['**Supervised**', 'Labeled examples: input plus correct answer', 'Maps inputs to known outputs (classification, regression)', 'Classify flows as benign or malicious; forecast next month bandwidth'],
      ['**Unsupervised**', 'Unlabeled data', 'Hidden structure: clusters and outliers', 'Group similar clients; spot odd devices without labeled attacks'],
      ['**Reinforcement**', 'No fixed dataset; feedback from actions', 'A policy that maximises reward by trial and error', 'An agent tunes queue or channel settings to lower latency'],
    ],
    caption: 'Labels mean supervised; no labels means unsupervised; rewards mean reinforcement.',
    notes:
      'The three learning styles differ in what feedback the learner receives. In **supervised learning** every training example comes with the correct answer, called a label. The model learns to map inputs to those answers, either by classifying (is this flow malicious or benign?) or by predicting a number (how much bandwidth will this link carry next month?). In **unsupervised learning** there are no labels, so the algorithm looks for structure by itself: it clusters similar devices or clients together, and it flags points that do not fit any cluster, which is the foundation of many anomaly detectors. In **reinforcement learning** an agent takes actions in an environment, receives rewards or penalties, and gradually learns a policy that maximises the total reward, much like training by trial and error. Exam questions usually give a short scenario and ask you to name the type. Look for the clue: labeled history means supervised, grouping without labels means unsupervised, and an agent maximising a reward means reinforcement learning.',
  },
  {
    kind: 'compare',
    title: 'Predictive AI versus generative AI',
    left: {
      heading: 'Predictive AI',
      bullets: [
        'Analyses data to **forecast, classify or detect**',
        'Output: numbers, labels, scores, alerts',
        'Anomaly detection, capacity planning, failure prediction',
        'Trained on your own network telemetry',
        'Errors: false positives and false negatives',
      ],
      tone: 'accent',
    },
    right: {
      heading: 'Generative AI',
      bullets: [
        'Creates **new content** from a prompt',
        'Output: text, code, configurations, summaries',
        'Draft a config, explain a log, write documentation',
        'LLMs trained on vast public text and code',
        'Errors: fluent, confident **hallucinations**',
      ],
    },
    notes:
      'The central AI distinction on the exam is between predictive and generative models. **Predictive AI** looks at data and tells you something about the future or about what is unusual: a forecast of link utilisation, a score for how likely a switch is to fail, an alert that today DNS latency is abnormal. Its output is a number, a label or a flag, and it is trained on your own telemetry. **Generative AI** produces new content: text, code, images or, for network teams, configuration snippets, summaries of an outage and explanations of a show command. Large language models are the best-known example, and they are trained on enormous collections of public text and code rather than on your network. Both can be wrong, but in different ways. A predictive model produces false positives and false negatives; a generative model produces fluent, confident hallucinations. When a scenario says forecast, detect, classify or score, choose predictive. When it says draft, write, summarise or explain, choose generative.',
  },
  {
    kind: 'table',
    title: 'Predictive AI use cases in networks',
    columns: ['Use case', 'Input data', 'Output'],
    rows: [
      ['**Forecasting**', 'Historical interface and WAN utilisation', 'Expected traffic next week or month'],
      ['**Anomaly detection**', 'Live telemetry compared with a learned baseline', 'Alert when behaviour departs from normal'],
      ['**Capacity planning**', 'Growth trends of links, clients, CPU and memory', 'When a link or device will run out of headroom'],
      ['**Failure prediction**', 'Error counters, temperature, logs, past failures', 'Likelihood that a device or link fails soon'],
      ['**Baselining**', 'Weeks of normal metrics per site and time of day', 'A dynamic definition of normal for each metric'],
    ],
    notes:
      'Predictive techniques fit naturally into operations because networks produce a constant stream of numeric telemetry. **Forecasting** extrapolates trends, so you can see that a WAN circuit will pass 80 percent utilisation in two months. **Capacity planning** turns that forecast into purchasing decisions: add bandwidth, upgrade a platform or rebalance traffic before users notice. **Anomaly detection** compares live data with a learned **baseline** and raises an alert when behaviour departs from normal, for example a sudden spike in authentication failures at 3 a.m. or an access point whose client count collapses. **Failure prediction** uses signals such as rising error counters, temperature, log patterns and past failures to estimate which component is likely to break next, enabling planned replacement instead of an outage. Notice that none of these produce new text; they all produce numbers or alerts. A baseline is also what makes the alerts relevant, since normal for a campus at noon differs from normal at midnight, and a static threshold cannot capture that.',
  },
  {
    kind: 'diagram',
    title: 'AIOps: the continuous loop',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'c', label: 'Collect', sub: 'telemetry, logs, flows' },
        { id: 'b', label: 'Baseline', sub: 'learn normal behaviour' },
        { id: 'd', label: 'Detect', sub: 'anomalies and trends' },
        { id: 'r', label: 'Correlate', sub: 'group events, find root cause', tone: 'accent' },
        { id: 'a', label: 'Act', sub: 'recommend or automate; human approves', tone: 'good' },
      ],
    },
    caption: 'Engineer feedback and verified outcomes improve the models over time.',
    notes:
      '**AIOps** means applying AI and machine learning to IT operations data to make network and infrastructure operations faster and less noisy. The loop shown here repeats continuously. Telemetry from devices, logs, flows and applications is collected. Models learn a **baseline** of normal behaviour. Deviations are detected as anomalies. The platform then correlates related events, so that fifty alarms from one failed uplink become a single issue, and it proposes a probable **root cause**. Finally it recommends a fix or triggers an automated workflow, with an engineer approving anything risky. The benefits are fewer alerts to triage, a shorter time to detect and resolve problems, and operations that scale beyond what people could watch manually. The risks are blind trust in the output and models trained on poor data. Exam questions describe AIOps benefits such as reducing alert noise, detecting anomalies, correlating events and root cause analysis, and they often contrast it with simple fixed-threshold monitoring.',
  },
  {
    kind: 'bullets',
    title: 'Catalyst Center AI Network Analytics',
    bullets: [
      'Machine learning applied to telemetry that Catalyst Center collects',
      '**Baselines** learn what is normal per site and time of day',
      '**Anomaly detection** flags deviations from the baseline',
      '**Root cause analysis** correlates symptoms into one issue',
      'Suggested actions guide the engineer toward a fix',
      'The engineer reviews and decides: AI assists, humans own changes',
    ],
    notes:
      'Cisco Catalyst Center, the controller formerly called DNA Center, includes AI-driven analytics in its Assurance function. **AI Network Analytics** applies machine learning to the telemetry that the controller collects from switches, access points, wireless controllers and clients. It builds **baselines** of normal behaviour for each site and time of day, rather than using one static threshold for the whole network. It then detects **anomalies**, such as an unusual rise in client onboarding time, and it correlates related symptoms into a single issue instead of a flood of separate alarms. For each issue the platform points to the likely **root cause** and offers suggested actions, which saves the engineer from hunting through logs. The engineer still reviews the guidance and decides what to change. For the exam, remember the capability names rather than product internals: baselining, anomaly detection, root cause analysis and guided remediation are the features that make Catalyst Center a practical example of predictive AI and AIOps in network operations.',
  },
  {
    kind: 'bullets',
    title: 'Generative AI and LLMs in network operations',
    bullets: [
      'An **LLM** predicts the next token, one after another, from your prompt',
      'Trained on huge public text and code, not on your network',
      'Drafts configs, scripts and documentation; explains logs and show output',
      'Summarises incidents and translates between vendor syntaxes',
      'The same prompt can give different answers',
      'Fluent does **not** mean correct',
    ],
    notes:
      'Generative AI assistants are useful because network work involves a lot of language: configuration syntax, logs, tickets, design documents and vendor documentation. An **LLM** is trained to predict the next piece of text, called a token, given everything before it, which is why a well-crafted prompt steers it so strongly. Typical network uses are drafting a first version of a configuration, converting a configuration from one vendor syntax to another, writing an Ansible playbook or a Python script, explaining a confusing `show` output or log message in plain language, summarising an outage for a post-incident report, and answering questions in natural language through the assistant built into a management platform. Three properties define the limits. The model learned from general text and has no knowledge of your live network unless you supply it. Its answers can vary from run to run. And it optimises for plausible text, not for truth, so fluent output can still be wrong. Treat it like a fast junior colleague whose work always needs review.',
  },
  {
    kind: 'table',
    title: 'Risks and mitigations',
    columns: ['Risk', 'What goes wrong', 'Mitigation'],
    rows: [
      ['**Hallucination**', 'Invented commands, options or facts stated with confidence', 'Verify against documentation; test in a lab'],
      ['**Data privacy**', 'Passwords, keys, customer data or topology pasted into a public tool', 'Sanitise input; use approved tools; classify data'],
      ['**Outdated knowledge**', 'Model unaware of your software version or recent changes', 'State platform and version; check release notes'],
      ['**Over-trust**', 'Output deployed without review (automation bias)', 'Keep a **human in the loop**; peer review; change control'],
      ['**Bias and poor data**', 'Skewed or noisy training data misleads the model', 'Validate with known cases; monitor accuracy'],
      ['**Prompt injection**', 'Text in a log or web page tells the model to ignore its instructions', 'Treat input as untrusted; limit what the AI may do'],
    ],
    notes:
      'The risks of AI in operations are as testable as its benefits. A **hallucination** is output that is confidently wrong, such as a command that does not exist in IOS, a made-up option or an incorrect default; the fix is to verify against official documentation and test in a lab. **Data privacy** is the next big one. Pasting a full running configuration into a public chatbot can leak passwords, SNMP communities, keys, addresses and customer names, so you must sanitise input and use tools approved by your organisation. A model may also lack knowledge of your **software version** or recent changes. **Over-trust**, sometimes called automation bias, is the human tendency to accept machine output without checking, and the antidote is a **human in the loop** plus normal peer review and change control. Models trained on biased or poor data inherit those flaws, and models that read untrusted text can be manipulated by instructions hidden in it, called prompt injection. The common thread in every correct exam answer is to verify before you deploy and to protect sensitive data.',
  },
  {
    kind: 'diagram',
    title: 'Human in the loop: using AI-generated configs',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'p', label: 'Sanitised prompt', sub: 'only data you may share' },
        { id: 'r', label: 'Review output', sub: 'commands, version, logic' },
        { id: 't', label: 'Test', sub: 'lab, simulator, check mode' },
        { id: 'a', label: 'Peer review', sub: 'change approval', tone: 'accent' },
        { id: 'd', label: 'Deploy and verify', sub: 'show commands', tone: 'good' },
      ],
    },
    caption: 'AI speeds up the draft; a qualified engineer stays accountable for the change.',
    notes:
      'This workflow shows how to use generative output safely in a production network. It starts before the model is even involved, with a prompt that contains only data you are allowed to share. When the answer arrives, read it as you would read a proposal from a colleague: do the commands exist on this platform and version, do the IP addresses and masks fit your design, and does the logic achieve the goal? Then test: paste it into a lab or simulator, use the check mode of Ansible, or compare the generated change with the running configuration. After that, the normal process applies, with peer review and change approval, a maintenance window if required, and a rollback plan. Finally deploy and verify with show commands, because verification closes the loop. The principle behind the diagram is **human in the loop**: AI accelerates the drafting, while accountability and the final decision stay with a qualified engineer. An exam answer that deploys generated configuration directly to production is almost always wrong.',
  },
  {
    kind: 'table',
    title: 'Prompt components for network operations',
    columns: ['Component', 'Purpose', 'Example'],
    rows: [
      ['**Persona**', 'Sets the role and expertise of the AI', '"You are a senior network engineer who knows Cisco IOS XE."'],
      ['**Instructions**', 'The specific task to perform', '"List the likely reasons the OSPF neighbor is stuck."'],
      ['**Context**', 'Background the AI cannot guess: platform, version, topology, symptoms', '"Two ISR 4321 routers on one link, IOS XE 17.9, area 0."'],
      ['**Data classification**', 'What may be shared, and what must be removed or masked', '"Input is sanitised: documentation IPs, secrets replaced."'],
      ['**Output format**', 'Shape, length and structure of the answer', '"Numbered list, five causes at most, one verify command each."'],
    ],
    caption: 'Prompt construction is a v2.0 emphasis.',
    notes:
      'A prompt is the input you give a generative model, and its quality largely determines the quality of the answer. The v2.0 exam emphasises five components for network operations. The **persona** sets the role and level of expertise, which shapes vocabulary and depth. The **instructions** state the task precisely, using a verb such as list, compare, draft or explain. The **context** supplies what the model cannot guess: platform, software version, topology, symptoms and what you have already tried. The **data classification** component states what data is allowed in the prompt and how it was prepared, for example that the input is sanitised and contains no secrets, and it also tells the model not to ask for sensitive items. The **output format** defines the shape of the answer: a table, a numbered list, commands in a code block, a maximum length. Not every prompt needs every component, but exam questions ask you to identify which component a sentence represents, or which component is missing from a weak prompt.',
  },
  {
    kind: 'compare',
    title: 'Bad prompt versus good prompt',
    left: {
      heading: 'Bad prompt',
      bullets: [
        '"Fix my OSPF."',
        'No role, platform or software version',
        'No symptoms and no topology',
        'Tempts you to paste the whole config, secrets included',
        'No output format requested',
      ],
      tone: 'bad',
    },
    right: {
      heading: 'Good prompt',
      bullets: [
        '**Persona**: senior engineer, Cisco IOS XE',
        '**Task**: find causes of the stuck neighbor',
        '**Context**: two ISR 4321, area 0, IOS XE 17.9',
        '**Data**: sanitised, no secrets, none requested',
        '**Output**: numbered list with verify commands',
      ],
      tone: 'good',
    },
    notes:
      'Compare the two prompts. The bad one, "Fix my OSPF", is short and invites guesswork. The model does not know the platform, the version, the topology or the symptoms, so it will produce generic advice, or it will invent details to fill the gaps, which increases the risk of hallucination. Worse, the engineer may be tempted to paste the entire configuration to compensate, including secrets. The good prompt fixes each weakness. It gives a persona so the answer comes at the right level, a specific task so the output is focused, context that includes the exact hardware, software and symptom, a data statement that the input is sanitised, and an output format that makes the answer easy to check and act on. Quality prompts also ask the model to label assumptions, which makes weak points visible. A well-built prompt does not guarantee a correct answer, so the verification steps still apply, but it reduces ambiguity, saves iterations and keeps sensitive data under control. This is a v2.0 emphasis.',
  },
  {
    kind: 'cli',
    title: 'A complete network-operations prompt',
    code: `Persona: You are a senior network engineer who works with Cisco IOS XE.

Task: Review the sanitised configuration below and list the most likely
reasons why R1 and R2 cannot form an OSPF adjacency.

Context: Two ISR 4321 routers share one Gigabit link in area 0 and run
IOS XE 17.9. The output of "show ip ospf neighbor" is empty on both.

Data handling: The configuration is sanitised. Addresses come from the
192.0.2.0/24 documentation range, and secrets are replaced with the
token REDACTED. Do not ask for passwords or keys.

Output: A numbered list of at most five causes. For each cause give
the verification command and the fix. Flag every assumption you make.

R1 configuration (sanitised):
interface GigabitEthernet0/0/0
 ip address 192.0.2.1 255.255.255.252
router ospf 1
 network 192.0.2.0 0.0.0.3 area 0`,
    highlight: ['Persona:', 'Task:', 'Context:', 'Data handling:', 'Output:'],
    bullets: [
      'Five labelled components in one prompt',
      'Sanitised data: documentation addresses, no secrets',
      'Asks for an answer format you can check',
    ],
    notes:
      'Here is one complete prompt, with each component labelled so you can map it to the table. The persona line puts the model in the role of a senior engineer who knows IOS XE. The task asks for likely reasons why an OSPF adjacency is not forming, which is specific enough to be answered and checked. The context gives the hardware, the software release, the link type, the area and the symptom that `show ip ospf neighbor` is empty. The data-handling paragraph says that the configuration is sanitised, that addresses come from the documentation range, that secrets are replaced with a placeholder, and that the model should not ask for passwords, which is the data classification component. The final paragraph defines the output format and asks for assumptions to be flagged. Notice that the labels themselves are optional; what matters is that the content is present. Whatever answer comes back, you would still verify each suggested command in a lab or against documentation before relying on it. This structure is a v2.0 emphasis.',
  },
  {
    kind: 'cli',
    title: 'Data classification: sanitise before you share',
    code: `! BEFORE: do not share
hostname EDGE-ACME-NYC-01
snmp-server community Tr0ub4dor RO
username netadmin secret 9 $9$x1Yk2wLmN3$hashedvaluehere
crypto isakmp key MyP5K-2024 address 203.0.113.9
interface GigabitEthernet0/0/0
 ip address 198.51.100.10 255.255.255.252

! AFTER: sanitised
hostname EDGE-01
snmp-server community <REDACTED> RO
username netadmin secret <REDACTED>
crypto isakmp key <REDACTED> address 192.0.2.9
interface GigabitEthernet0/0/0
 ip address 192.0.2.10 255.255.255.252`,
    highlight: ['<REDACTED>'],
    bullets: [
      'Classify first: public, internal, confidential, restricted',
      'Mask secrets: passwords, keys, SNMP communities, tokens',
      'Replace real names and addresses with neutral placeholders',
      'Use only AI tools your organisation has approved',
    ],
    notes:
      'Data classification means deciding how sensitive information is and what may leave your control. Many organisations use levels such as public, internal, confidential and restricted, and the level determines which tools may receive the data. A router configuration is rarely public: it can contain secrets (passwords, hashes, pre-shared keys, SNMP communities, API tokens), identifying names (customer, site and device names) and addressing details that reveal your design. Before sending anything to an AI tool, remove or mask the secrets, replace identifying names and public addresses with neutral placeholders, and trim the input to the lines needed for the question. The before-and-after listing shows the idea: the hostname generalised, the community and keys replaced by a placeholder, and public addresses swapped for documentation addresses. The first rule, though, is to use only AI services your organisation has approved, because an approved enterprise tool may have contractual protections that a consumer chatbot does not. In a v2.0 prompt, you also state in the prompt that the data has been sanitised.',
  },
  {
    kind: 'definitions',
    title: 'Key terms',
    terms: [
      { term: 'AIOps', def: 'Applying AI and ML to IT operations data to reduce noise, detect problems and speed up fixes.' },
      { term: 'Baseline', def: 'A learned picture of normal behaviour, per site and time of day.' },
      { term: 'Anomaly detection', def: 'Flagging behaviour that deviates from the baseline.' },
      { term: 'Root cause analysis', def: 'Finding the underlying origin of a problem instead of treating each symptom.' },
      { term: 'LLM', def: 'Large language model: a generative model that predicts the next token of text.' },
      { term: 'Hallucination', def: 'Confident but false output from a generative model.' },
      { term: 'Prompt', def: 'The input that tells the model what to do: persona, instructions, context, data classification, output format.' },
      { term: 'Human in the loop', def: 'A person reviews and approves AI output before it affects production.' },
    ],
    notes:
      'This glossary gathers the terms most likely to appear in stems and answer options. **AIOps** is the use of AI and ML on operations data. A **baseline** is a learned picture of normal behaviour, and **anomaly detection** flags departures from it. **Root cause analysis** identifies the underlying origin of a problem rather than its many symptoms. An **LLM**, or large language model, is a generative model trained on vast text collections to predict the next token. A **hallucination** is a plausible-sounding but false output. A **prompt** is the input that tells the model what to do, built from persona, instructions, context, data classification and output format. **Human in the loop** means a person reviews and approves AI output before it affects production. Two further words are worth knowing: **telemetry** is the stream of operational data collected from devices, and **training** versus **inference** distinguishes learning the model from using it. If an answer option uses one of these terms incorrectly, for example describing a baseline as a firewall rule, eliminate it.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Match the **kind of AI** to the **kind of output**: predictions and alerts are predictive AI; new text, code or configuration is generative AI.',
    bullets: [
      'Supervised learning needs **labeled** data; unsupervised does not',
      'Reinforcement learning uses **rewards**, not labels',
      'Generative AI can **hallucinate**: verify before deploying',
      'Never paste secrets or customer data into an unapproved AI tool',
      'AI assists; a **human** approves changes',
      'Prompt parts: persona, instructions, context, data classification, output format',
    ],
    notes:
      'Most mistakes in this topic come from mixing up near neighbours. Predictive AI and generative AI are not interchangeable: forecasting, anomaly detection and failure prediction are predictive, whereas drafting configurations, summarising logs and answering in natural language are generative. In machine learning types, labeled data signals supervised learning, absence of labels signals unsupervised, and rewards signal reinforcement. Do not assume that AI output is correct because it is fluent. Answers that describe deploying generated configuration directly, or trusting a model without verification, are wrong, while answers that mention review, testing in a lab and change control are right. Likewise, any answer that suggests pasting full running configurations with passwords into a public chatbot is wrong, and sanitising data is right. Remember that AI assists operators and does not remove accountability: a human approves changes. Finally, learn the five prompt components, and be ready to classify a sentence as persona, instruction, context, data classification or output format.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'AI contains ML, which contains deep learning; generative AI builds on deep learning',
      'Supervised: labels. Unsupervised: patterns. Reinforcement: rewards',
      'Predictive AI forecasts and detects; generative AI creates content',
      'AIOps and Catalyst Center: baselines, anomalies, root cause analysis',
      'Risks: hallucination, privacy, over-trust; keep a human in the loop',
      'Prompt: persona, instructions, context, data classification, output format',
    ],
    notes:
      'Review the topic in four blocks. Concepts: AI contains machine learning, which contains deep learning, and generative AI builds on deep learning; supervised, unsupervised and reinforcement learning differ in their feedback. Capabilities: predictive AI forecasts and detects, supporting anomaly detection, capacity planning and failure prediction, while generative AI drafts configurations, scripts and summaries. Operations: AIOps and Catalyst Center AI Network Analytics use baselining, anomaly detection and root cause analysis to cut noise and speed up troubleshooting. Safety: hallucinations, privacy leaks, outdated knowledge and over-trust are managed by sanitising data, verifying output, testing in a lab and keeping a human in the loop. Finally, a good prompt contains persona, instructions, context, data classification and output format. If you can state each block in your own words and apply it to a short scenario, you are ready for the questions in either exam version, including the v2.0 emphasis on constructing prompts.',
  },
];
