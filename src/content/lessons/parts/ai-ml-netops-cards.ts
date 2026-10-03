import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Artificial intelligence (AI)', back: 'Software that performs tasks normally needing human intelligence, such as recognising patterns, making decisions or understanding language.' },
  { id: 'f2', front: 'Machine learning (ML)', back: 'A subset of AI in which systems **learn patterns from data** instead of following only hand-written rules.' },
  { id: 'f3', front: 'Deep learning', back: 'A subset of ML that uses neural networks with many layers; it powers image, speech and language models.' },
  { id: 'f4', front: 'Relationship of AI, ML and deep learning', back: 'Nested: deep learning is part of machine learning, which is part of AI.' },
  { id: 'f5', front: 'Supervised learning', back: 'Learns from **labeled** examples (inputs with correct answers); used for classification and regression.' },
  { id: 'f6', front: 'Unsupervised learning', back: 'Finds structure in **unlabeled** data, such as clusters and outliers; the basis of many anomaly detectors.' },
  { id: 'f7', front: 'Reinforcement learning', back: 'An agent learns by trial and error from **rewards and penalties** given by its environment.' },
  { id: 'f8', front: 'Training versus inference', back: 'Training builds the model from data; inference applies the trained model to new data.' },
  { id: 'f9', front: 'Predictive AI', back: 'Analyses data to forecast, classify or detect: forecasting, anomaly detection, capacity planning and failure prediction.' },
  { id: 'f10', front: 'Generative AI', back: 'Creates **new content** (text, code, configurations, summaries) from a prompt.' },
  { id: 'f11', front: 'LLM', back: 'Large language model: a generative model trained on huge text collections that predicts the next token.' },
  { id: 'f12', front: 'Anomaly detection', back: 'Flags behaviour that deviates from a learned baseline of normal.' },
  { id: 'f13', front: 'Baseline', back: 'A learned picture of normal behaviour (per site and time of day) used to judge whether data is abnormal.' },
  { id: 'f14', front: 'Capacity planning with AI', back: 'Using trends and forecasts to predict when links or devices will run out of headroom.' },
  { id: 'f15', front: 'Failure prediction', back: 'Estimating which device or link is likely to fail soon from error counters, logs and history.' },
  { id: 'f16', front: 'AIOps', back: 'Applying AI and ML to IT operations data to reduce alert noise, detect problems, find the root cause and automate fixes.' },
  { id: 'f17', front: 'Root cause analysis (RCA)', back: 'Identifying the underlying origin of a problem instead of treating each symptom separately.' },
  { id: 'f18', front: 'Catalyst Center AI Network Analytics', back: 'ML in Catalyst Center Assurance: baselines, anomaly detection, issue correlation, root cause analysis and suggested actions.' },
  { id: 'f19', front: 'Hallucination', back: 'Confident but false output from a generative model, such as an IOS command that does not exist.' },
  { id: 'f20', front: 'Human in the loop', back: 'A qualified person reviews, tests and approves AI output before it is deployed.' },
  { id: 'f21', front: 'Biggest privacy risk of public AI tools', back: 'Pasting passwords, keys, SNMP communities, customer data or topology details into an unapproved service.' },
  { id: 'f22', front: 'Safe use of AI-generated configuration', back: 'Review it, validate syntax and logic, test in a lab, obtain peer and change approval, deploy, then verify.' },
  { id: 'f23', front: 'Prompt components for network operations', back: 'Persona, instructions (task), context, data classification, output format.', tags: ['v2.0'] },
  { id: 'f24', front: 'Persona (prompt component)', back: 'The role and expertise level given to the AI, for example a senior Cisco IOS XE engineer.', tags: ['v2.0'] },
  { id: 'f25', front: 'Context (prompt component)', back: 'Background the AI cannot guess: platform, software version, topology and symptoms.', tags: ['v2.0'] },
  { id: 'f26', front: 'Data classification (prompt component)', back: 'States what data may be shared or must be removed or masked; the input is sanitised and the AI must not request secrets.', tags: ['v2.0'] },
  { id: 'f27', front: 'Output format (prompt component)', back: 'Defines the shape of the answer: numbered list, table, commands in a code block, length limit.', tags: ['v2.0'] },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which statement correctly describes the relationship between AI, machine learning and deep learning?',
    options: [
      'Deep learning is a subset of machine learning, which is a subset of AI',
      'AI is a subset of machine learning, which is a subset of deep learning',
      'Machine learning and deep learning are unrelated to AI',
      'Deep learning is the broadest category and contains AI',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'The terms are **nested**: AI is the broadest field, machine learning is the part of AI that learns from data, and deep learning is the part of machine learning that uses many-layer neural networks. The other options reverse or deny that nesting.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'A tool forecasts next month WAN utilisation from historical counters. Which type of AI is this?',
    options: ['Predictive AI', 'Generative AI', 'A natural-language chatbot', 'Image synthesis'],
    answer: 0,
    difficulty: 1,
    explanation:
      'Forecasting a number from historical data is **predictive AI**. Generative AI would create new content such as text or configuration, and a chatbot or image synthesis tool is a form of generative AI.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two tasks are good uses of generative AI in network operations? (Choose two.)',
    options: [
      'Drafting a first version of a switch configuration for review',
      'Summarising an outage timeline for a report',
      'Detecting an anomaly in interface counters against a learned baseline',
      'Forecasting link utilisation 90 days ahead',
      'Predicting which transceiver will fail',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Drafting configuration and summarising text are **generative** tasks because they create new content. Anomaly detection, forecasting and failure prediction are **predictive** tasks that output alerts, numbers or probabilities.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'A model is trained on historical examples that are each labeled normal or attack. Which learning type is this?',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Generative learning'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Labeled examples with known correct answers define **supervised learning**. Unsupervised learning has no labels, reinforcement learning learns from rewards, and generative learning is not a learning type.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'What term describes confident but false output from a generative AI model?',
    answers: ['hallucination', 'hallucinations'],
    placeholder: 'one word',
    difficulty: 1,
    explanation:
      'A **hallucination** is plausible-sounding output that is not true, for example an IOS command that does not exist. It is the reason AI-generated configuration must be verified.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each prompt component to its purpose.',
    pairs: [
      { left: 'Persona', right: 'Sets the role and expertise of the AI' },
      { left: 'Instructions', right: 'States the task to perform' },
      { left: 'Context', right: 'Supplies platform, version and symptoms' },
      { left: 'Data classification', right: 'Says what may be shared and that secrets are removed' },
      { left: 'Output format', right: 'Defines how the answer is structured' },
    ],
    difficulty: 2,
    tags: ['v2.0'],
    explanation:
      'The five components of a network-operations prompt each have a distinct job: persona (who the AI is), instructions (what to do), context (what it cannot guess), data classification (what data is allowed) and output format (how to answer).',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'An engineer receives a configuration from an AI assistant. What should happen before it is deployed?',
    options: [
      'It is reviewed, tested in a lab and taken through change approval',
      'It is deployed immediately because the output was fluent',
      'The assistant is asked to confirm it is correct, and then it is deployed',
      'It is pasted into production devices without review during a maintenance window',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Generated configuration can contain hallucinated or unsuitable commands, so a **human in the loop** must review, test and approve it. Asking the same model to vouch for itself is not independent verification, and a maintenance window does not replace review.',
  },
];
