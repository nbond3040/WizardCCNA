import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement best describes machine learning?',
    options: [
      'Systems learn patterns from data rather than relying only on programmed rules',
      'Software that generates images from text prompts rather than analysing data',
      'A routing protocol in which routers learn their neighbours and exchange prefixes',
      'A rule-based script that follows the same fixed steps written by an engineer',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Machine learning means a system **learns patterns from data**. Image generation is only one narrow application, a routing protocol that learns neighbours is unrelated, and a fixed-step script is the opposite of learning.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Which type of machine learning trains on labeled examples?',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Generative learning'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Supervised learning** uses examples that include the correct answer (the label). Unsupervised learning works without labels, reinforcement learning uses rewards, and generative learning is not one of the three standard types.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which task is an example of predictive AI in a network?',
    options: [
      'Forecasting WAN link utilisation to plan capacity',
      'Drafting an ACL from a plain-English request',
      'Summarising a syslog excerpt into a short paragraph',
      'Translating an IOS configuration into another vendor syntax',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Forecasting a metric from historical data is **predictive**. Drafting an ACL, summarising logs and translating configuration all create new text or code, which is the job of generative AI.',
  },
  {
    id: 'e4',
    type: 'single',
    stem: 'What is a hallucination in the context of generative AI?',
    options: [
      'Confident output that is false, such as a command that does not exist',
      'A model refusing to answer a question because of a content filter',
      'A slow response caused by a busy server or a congested network link',
      'An encrypted prompt that the model cannot read without a decryption key',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'A hallucination is **plausible but false output** delivered with confidence. Refusing to answer, latency and encryption are different behaviours and not what the term means.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. An AI assistant produced this configuration for a Cisco IOS XE router. Which statement is correct?',
    exhibit: {
      kind: 'cli',
      text: `interface GigabitEthernet0/0/1
 description Link to ISP
 ip address 203.0.113.2/30
 no shutdown
!
ip route 0.0.0.0/0 203.0.113.1`,
    },
    options: [
      'The ip address and ip route commands use prefix-length notation, which IOS XE does not accept',
      'The configuration is valid because AI assistants check generated commands against the platform',
      'The no shutdown command is invalid on a physical interface and must be removed from the configuration',
      'The description command must be removed before an IP address can be configured on the interface',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS XE needs `ip address 203.0.113.2 255.255.255.252` and `ip route 0.0.0.0 0.0.0.0 203.0.113.1`. The prefix notation is accepted by some other platforms, so the model mixed syntaxes, a typical hallucination. `description` and `no shutdown` are valid, and nothing guarantees that generated commands are checked.',
  },
  {
    id: 'e6',
    type: 'multi',
    stem: 'Which two actions reduce the risk when using a public generative AI tool to troubleshoot a router problem? (Choose two.)',
    options: [
      'Remove passwords, keys and SNMP communities from any pasted configuration',
      'Replace real hostnames and public IP addresses with placeholders',
      'Paste the entire running configuration so the model has full context',
      'Ask the model to keep the conversation confidential',
      'Disable logging on the router before pasting its output',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      '**Sanitising** the input is the control that matters: strip secrets and replace identifying names and addresses. Pasting everything leaks data, a request for confidentiality is not an enforceable control, and disabling logging on the router has no effect on what the AI service receives.',
  },
  {
    id: 'e7',
    type: 'categorize',
    stem: 'Classify each task as predictive AI or generative AI.',
    categories: ['Predictive AI', 'Generative AI'],
    items: [
      { text: 'Forecasting link utilisation for the next quarter', category: 0 },
      { text: 'Flagging a switch whose CPU deviates from its baseline', category: 0 },
      { text: 'Drafting an Ansible playbook from a plain-English request', category: 1 },
      { text: 'Summarising a 500-line log into five bullet points', category: 1 },
      { text: 'Estimating the probability that an uplink will fail', category: 0 },
      { text: 'Translating a Cisco IOS configuration into another syntax', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Forecasts, deviation alerts and failure probabilities are **predictive** outputs (numbers, flags and scores). Drafting playbooks, summarising logs and translating configuration produce new text or code, so they are **generative**.',
  },
  {
    id: 'e8',
    type: 'match',
    stem: 'Match each scenario to the type of learning or AI it describes.',
    pairs: [
      { left: 'Flows labeled benign or malicious are used to train a classifier', right: 'Supervised learning' },
      { left: 'Clients are grouped by behaviour with no labels at all', right: 'Unsupervised learning' },
      { left: 'An agent adjusts queue weights and is rewarded for lower latency', right: 'Reinforcement learning' },
      { left: 'A model trained on large public text drafts a configuration from a prompt', right: 'Generative AI' },
    ],
    difficulty: 2,
    explanation:
      'Labels point to supervised learning, grouping without labels to unsupervised learning, a reward signal to reinforcement learning, and creating new content from a prompt to generative AI.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about features 1 and 2 is correct?',
    exhibit: {
      kind: 'table',
      columns: ['Feature', 'Description'],
      rows: [
        ['1', 'Learns a baseline for each site and alerts when client onboarding time deviates from it'],
        ['2', 'Writes a CLI configuration from a request typed in plain English'],
      ],
    },
    options: [
      'Feature 1 is predictive AI; feature 2 is generative AI',
      'Feature 1 is generative AI; feature 2 is predictive AI',
      'Both features are generative AI',
      'Both features are predictive AI',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Feature 1 learns normal behaviour and detects deviations, which is **predictive** (anomaly detection). Feature 2 creates new configuration text from a prompt, which is **generative**. The other combinations swap or merge the two categories.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which prompt follows good practice for network operations?',
    exhibit: {
      kind: 'cli',
      text: `Prompt A
Why is my VPN down?

Prompt B
You are a network engineer. Troubleshoot my VPN. Here is my full
running-config including all keys and passwords: (full config pasted)

Prompt C
You are a senior engineer who knows Cisco IOS XE. List the most likely
causes of an IPsec tunnel stuck in IKE phase 1 between two ISR 4331
routers running IOS XE 17.9. The configuration below is sanitised
(secrets replaced, documentation addresses only). Answer as a numbered
list with one verification command per cause.`,
    },
    options: ['Prompt A', 'Prompt B', 'Prompt C', 'Prompts A and B are equally good'],
    answer: 2,
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'Prompt C contains all five components: persona (senior IOS XE engineer), instructions (list likely causes), context (IKE phase 1, ISR 4331, IOS XE 17.9), data classification (sanitised, no secrets) and output format (numbered list with a verification command). Prompt A has almost no context, and Prompt B shares keys and passwords, which violates data classification.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two prompt components are missing from this prompt? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `Review the sanitised configuration below and explain why users in
VLAN 20 cannot reach the DHCP server. The switch is a Catalyst 9200
running IOS XE 17.9, and VLAN 20 uses a router-on-a-stick design.
Secrets and real addresses have been removed.`,
    },
    options: ['Persona', 'Instructions', 'Context', 'Data classification', 'Output format'],
    answers: [0, 4],
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'The prompt has **instructions** (review and explain), **context** (Catalyst 9200, IOS XE 17.9, router-on-a-stick) and **data classification** (sanitised, secrets and real addresses removed). It never assigns a **persona** and never asks for an **output format**, so those two are missing.',
  },
  {
    id: 'e12',
    type: 'order',
    stem: 'Put the steps in order for safely using an AI assistant to produce a configuration change.',
    items: [
      'Sanitise the data and write a prompt with persona, instructions, context and output format',
      'Review the generated configuration against the platform and software version',
      'Test the configuration in a lab or simulator',
      'Obtain peer review and change approval',
      'Deploy in the approved window and verify with show commands',
    ],
    difficulty: 2,
    explanation:
      'Prepare a safe prompt first, then check the output, then test it, then pass it through peer review and change control, and only then deploy and verify. Deploying before review and testing is the classic wrong order.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. A platform with time-of-day baselines evaluates the current values. Which metric is anomalous?',
    exhibit: {
      kind: 'table',
      columns: ['Metric', 'Baseline at 10:00', 'Baseline at 03:00', 'Current value (03:00)'],
      rows: [
        ['WAN utilisation', '30 to 45 percent', '2 to 6 percent', '41 percent'],
        ['DHCP response time', '20 to 60 ms', '20 to 60 ms', '35 ms'],
        ['Client count', '800 to 1,100', '20 to 60', '45'],
      ],
    },
    options: [
      'WAN utilisation',
      'DHCP response time',
      'Client count',
      'None; all values are inside the 10:00 baselines',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The current time is 03:00, so the **03:00 baseline** applies. WAN utilisation of 41 percent is far above the expected 2 to 6 percent, while DHCP response time (35 ms) and client count (45) fall inside their 03:00 ranges. The choice claiming every value is inside the 10:00 baselines wrongly uses the 10:00 baseline, which is exactly why time-aware baselines beat one static threshold.',
  },
  {
    id: 'e14',
    type: 'match',
    stem: 'Match each Catalyst Center AI Network Analytics capability to its description.',
    pairs: [
      { left: 'Baselining', right: 'Learns what is normal for each site and time of day' },
      { left: 'Anomaly detection', right: 'Flags values outside the learned range' },
      { left: 'Root cause analysis', right: 'Correlates symptoms and points to the likely origin' },
      { left: 'Suggested actions', right: 'Guides the engineer toward remediation' },
    ],
    difficulty: 2,
    explanation:
      'The capabilities build on each other: a baseline defines normal, anomaly detection flags deviations, root cause analysis correlates symptoms into one issue, and suggested actions help the engineer fix it while keeping a human in control.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer ran a command suggested by an AI assistant. What is the most likely explanation?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ospf neighbors
         ^
% Invalid input detected at '^' marker.`,
    },
    options: [
      'The assistant hallucinated a command borrowed from another platform; IOS uses show ip ospf neighbor',
      'OSPF is not enabled on R1, so the router rejects the command until an OSPF process is configured',
      'The engineer must first enter privileged EXEC mode before the router accepts show commands',
      'The AI model is out of date and must be retrained before the router accepts the command',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The caret points at the keyword `ospf`, which IOS does not recognise after `show`; that command form belongs to other platforms, so this is a **hallucination** or syntax mix-up. The prompt `R1#` already shows privileged EXEC, a router without OSPF would simply display nothing, and retraining a model has no effect on what the router accepts.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two actions reduce the risk of outdated or incorrect answers from an AI assistant? (Choose two.)',
    options: [
      'State the exact platform and software version in the prompt',
      'Verify the answer against current official documentation',
      'Ask the model to answer more quickly and with fewer caveats',
      'Remove the platform details so that the prompt stays short',
      'Trust the model because it was trained on a large dataset',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Giving the **platform and version** narrows the answer to the right syntax, and checking **official documentation** catches remaining errors. Speed, less context and blind trust in the size of the training set all increase the risk.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two statements are correct? (Choose two.)',
    exhibit: {
      kind: 'table',
      columns: ['Tool', 'Input', 'Output'],
      rows: [
        ['A', 'Interface error counters and history', 'Probability that an uplink fails within 30 days'],
        ['B', 'A request typed in plain English', 'A draft ACL in IOS syntax'],
        ['C', 'Two years of unlabeled NetFlow records', 'Groups of similar traffic patterns'],
        ['D', 'Latency measurements used as a reward signal', 'Adjusted queue weights, improving over time'],
      ],
    },
    options: [
      'Tool A is predictive AI',
      'Tool B is generative AI',
      'Tool C uses supervised learning',
      'Tool D uses unsupervised learning',
      'Tool B is predictive AI',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Tool A estimates a future failure probability, which is **predictive**; tool B creates a new ACL from a prompt, which is **generative**. Tool C has no labels, so it is unsupervised, not supervised. Tool D learns from a reward signal, so it is reinforcement learning, not unsupervised.',
  },
  {
    id: 'e18',
    type: 'input',
    stem: 'Which prompt component states what data may be included and that secrets have been removed? Enter the two-word name.',
    answers: ['data classification', 'data classification component'],
    placeholder: 'two words',
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      '**Data classification** tells the model (and reviewers) what level of data is in the prompt, that it was sanitised and that secrets must not be requested. Persona sets the role, context supplies background, and output format shapes the answer.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'A general-purpose chat assistant with no connection to your network replies that it has tested a configuration on the live network and that it is safe to paste into production. What is the best response?',
    options: [
      'Treat the claim as unverified, then review, lab-test and approve the change before deploying it',
      'Deploy it to production, because the assistant confirmed that it was tested on the network',
      'Deploy it on a Friday evening, when fewer users are affected if the change causes an outage',
      'Ask the assistant to repeat the claim and deploy the change if it gives the same answer twice',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A chat assistant with no access to your devices cannot have tested anything; the statement is itself a **hallucination**. The change still needs independent review, lab testing and approval. Timing the deployment or asking the same model for repeat assurance does not verify the configuration.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'A platform ingests two years of NetFlow records with no labels, groups traffic into clusters of normal behaviour and raises an alert when a flow fits no cluster. Which statement is correct?',
    options: [
      'It uses unsupervised learning for anomaly detection',
      'It uses supervised learning because the clusters act as labels',
      'It uses reinforcement learning because alerts are rewards',
      'It is generative AI because it creates cluster names',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The data has **no labels** and the algorithm finds structure itself (clusters), then flags outliers: that is **unsupervised learning** applied to anomaly detection. Clusters discovered by the algorithm are not training labels, alerts are not reward signals, and naming clusters is not content generation.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'An engineer writes this prompt: "You are a CCIE. Why does my switch drop frames? Here is my config." Which two changes improve the answer quality and protect data? (Choose two.)',
    options: [
      'Add the platform, software version and observed symptoms',
      'Mask secrets and state in the prompt that the configuration is sanitised',
      'Remove the persona so the model has fewer instructions',
      'Paste the complete unsanitised configuration so nothing is missing',
      'Ask the model for the shortest possible answer with no explanation',
    ],
    answers: [0, 1],
    difficulty: 3,
    tags: ['v2.0'],
    explanation:
      'The prompt lacks **context** (platform, version, symptoms) and **data classification** (sanitised input). Adding both raises quality and protects data. Removing the persona does not help, pasting unsanitised configuration leaks secrets, and demanding a minimal answer removes the reasoning you need to verify.',
  },
  {
    id: 'e22',
    type: 'multi',
    stem: 'Refer to the exhibit. An engineer wants help from a public AI tool with an NTP problem. Which two lines contain secrets that must be removed or masked before the configuration is shared? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `hostname EDGE-01
snmp-server community Tr0ub4dor RO
username netadmin secret 9 $9$x1Yk2wLmN3$hashedvaluehere
ntp server 192.0.2.123
logging host 192.0.2.50`,
    },
    options: [
      'The `snmp-server community` line, which holds the SNMP community string',
      'The `username netadmin` line, which holds a hashed password',
      'The `hostname` line, which holds the device name',
      'The `ntp server` line, which holds the address of the time source',
      'The `logging host` line, which holds the address of the syslog server',
    ],
    answers: [0, 1],
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'The SNMP community string is a shared secret, and the `username ... secret` line carries a password hash; both must be masked. The hostname is generic, and the NTP and logging addresses come from the documentation range and are needed to understand the question.',
  },
];
