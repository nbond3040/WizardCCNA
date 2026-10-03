import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Configuration drift', back: 'Gradual divergence between the configuration running on devices and the intended standard, usually caused by untracked manual changes.' },
  { id: 'f2', front: 'Goals of configuration management', back: 'Consistency, repeatability, speed, fewer human errors, auditability and easy rollback.' },
  { id: 'f3', front: 'Infrastructure as Code (IaC)', back: 'Defining devices and infrastructure in machine-readable text files that a tool applies, instead of manual CLI or GUI changes.' },
  { id: 'f4', front: 'Git', back: 'A distributed **version control** system: stores files with full history, branches and peer review through pull requests.' },
  { id: 'f5', front: 'Why keep device configurations in Git?', back: 'Single source of truth, an audit trail of who changed what and why, peer review, and rollback to any earlier commit.' },
  { id: 'f6', front: 'Declarative versus imperative', back: '**Declarative** states the desired end state and the tool works out the steps; **imperative** lists the steps to execute.' },
  { id: 'f7', front: 'Idempotent', back: 'Applying the same operation repeatedly gives the same end state; after the first run nothing further changes.' },
  { id: 'f8', front: 'Does Ansible need an agent on managed devices?', back: '**No.** Ansible is agentless; nothing is installed on the managed nodes.' },
  { id: 'f9', front: 'Ansible push or pull model?', back: '**Push**: the control node initiates the connection and sends the configuration.' },
  { id: 'f10', front: 'Transports Ansible can use to reach network devices', back: 'SSH (CLI), NETCONF (over SSH) and HTTPS APIs.' },
  { id: 'f11', front: 'Ansible control node', back: 'The machine where Ansible is installed and playbooks are run.' },
  { id: 'f12', front: 'Ansible inventory', back: 'File that lists the managed nodes and groups them, with connection variables (INI or YAML).' },
  { id: 'f13', front: 'Ansible playbook', back: 'A YAML file of plays; each play maps a host group to an ordered list of tasks.' },
  { id: 'f14', front: 'Ansible module', back: 'The code a task runs, for example `cisco.ios.ios_config`. Most modules are idempotent.' },
  { id: 'f15', front: 'Ansible task', back: 'One call to one module with its arguments; tasks run in the order written.' },
  { id: 'f16', front: 'File format of Ansible playbooks', back: '**YAML**: indentation, `key: value` pairs and `- item` lists.' },
  { id: 'f17', front: 'PLAY RECAP showing `changed=0`', back: 'Nothing was modified because the devices already matched: idempotency in action.' },
  { id: 'f18', front: 'Terraform', back: 'HashiCorp tool for **declarative** infrastructure as code, used to provision infrastructure from `.tf` files.' },
  { id: 'f19', front: 'Language of Terraform files', back: '**HCL**, the HashiCorp Configuration Language.' },
  { id: 'f20', front: 'Terraform provider', back: 'Plugin that turns resources into API calls for one platform (AWS, Azure, Cisco ACI, vSphere and others).' },
  { id: 'f21', front: 'Terraform command order', back: '`terraform init`, then `plan`, then `apply`; `destroy` removes what the configuration manages.' },
  { id: 'f22', front: '`terraform plan`', back: 'Previews what apply would create, change or destroy. It makes **no changes**.' },
  { id: 'f23', front: 'Terraform state', back: 'Record of the real objects Terraform manages (`terraform.tfstate`), compared with the code on every plan.' },
  { id: 'f24', front: 'Puppet: agent, model, files', back: '**Agent-based**, **pull** model; configuration is written as manifests in the Puppet DSL.' },
  { id: 'f25', front: 'Chef: agent, model, files', back: '**Agent-based**, **pull** model; Ruby recipes grouped into cookbooks.' },
  { id: 'f26', front: 'Which of the four tools need an agent?', back: 'Puppet and Chef. Ansible and Terraform are agentless.' },
  { id: 'f27', front: 'Ansible versus Terraform focus', back: 'Ansible: configuring existing systems and orchestration. Terraform: provisioning and managing the lifecycle of infrastructure.' },
  { id: 'f28', front: 'Git commit', back: 'A snapshot of changes with a message and a unique ID; the unit of history and rollback.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which tool is agentless, uses a push model and is driven by YAML playbooks?',
    options: ['Ansible', 'Puppet', 'Chef', 'Terraform'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Ansible** needs no agent, pushes changes from a control node and uses YAML playbooks. Puppet and Chef are agent-based pull tools, and Terraform uses HCL files rather than playbooks.',
  },
  {
    id: 'q2',
    type: 'single',
    stem: 'What term describes device configurations that gradually diverge from the intended standard?',
    options: ['Configuration drift', 'Route redistribution', 'Idempotency', 'Convergence'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Configuration drift** is the slow divergence of running configurations from the intended one, usually through manual changes. Idempotency is a property of tools, convergence is a routing concept, and redistribution moves routes between protocols.',
  },
  {
    id: 'q3',
    type: 'multi',
    stem: 'Which two statements about Terraform are true? (Choose two.)',
    options: [
      'It is a declarative tool that uses HCL',
      'It uses providers to talk to platform APIs',
      'It requires an agent on every managed device',
      'It is configured with YAML playbooks and an inventory',
      'It uses a pull model with a master server',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Terraform is **declarative**, written in **HCL**, and uses **providers** to call platform APIs. It needs no agent, playbooks and inventories belong to Ansible, and the pull model with a master server describes Puppet and Chef.',
  },
  {
    id: 'q4',
    type: 'single',
    stem: 'What does `terraform plan` do?',
    options: [
      'Previews the changes that apply would make, without changing anything',
      'Creates all the resources in the configuration',
      'Deletes resources that are missing from the state file',
      'Downloads the provider plugins',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`plan` is a **dry-run preview** of the creates, changes and destroys. `apply` creates or changes resources, `destroy` removes them, and `init` downloads the provider plugins.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'What one word describes an operation that leaves the same end state however many times it is run?',
    answers: ['idempotent', 'idempotence'],
    placeholder: 'one word',
    difficulty: 2,
    explanation:
      'An **idempotent** operation can be repeated safely: the first run makes the changes and later runs find nothing to do. Ansible shows this as `changed=0` on a second run.',
  },
  {
    id: 'q6',
    type: 'match',
    stem: 'Match each tool to the characteristic that identifies it.',
    pairs: [
      { left: 'Ansible', right: 'YAML playbooks, agentless, push' },
      { left: 'Terraform', right: 'HCL, providers and a state file' },
      { left: 'Puppet', right: 'Manifests, agent, pull' },
      { left: 'Chef', right: 'Recipes and cookbooks written in Ruby' },
    ],
    difficulty: 2,
    explanation:
      'Each tool has a signature vocabulary: playbooks and inventory for Ansible; HCL, providers and state for Terraform; manifests and the Puppet DSL for Puppet; recipes and cookbooks in Ruby for Chef.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which Ansible file lists the devices to be managed?',
    options: ['Inventory', 'Playbook', 'Module', 'Role'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The **inventory** lists managed nodes and groups. A playbook lists the plays and tasks, a module is the code a task runs, and a role is a reusable bundle of tasks and files.',
  },
];
