import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which configuration management tool installs an agent on each managed node and pulls its configuration from a central server?',
    options: ['Puppet', 'Ansible', 'Terraform', 'Git'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Puppet** (like Chef) is agent-based: the agent contacts the server on a schedule and pulls its configuration. Ansible is agentless and pushes from a control node, Terraform is agentless and calls provider APIs, and Git is a version control system, not a configuration management tool.',
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'What is configuration drift?',
    options: [
      'Running configurations diverge from the intended standard configuration',
      'A router forwards packets along a longer path than necessary',
      'Device clocks move out of sync with the NTP server',
      'A configuration is lost when a device loses power',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Drift is the gradual **divergence of actual configurations from the intended standard**, typically through manual, undocumented changes. The other options describe suboptimal routing, clock skew and volatile configuration loss, which are different problems.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which statement about Terraform is true?',
    options: [
      'It is a declarative tool that provisions infrastructure from HCL files',
      'It is an agent-based tool that pulls manifests from a master server',
      'It requires playbooks and an inventory file',
      'It uses cookbooks and recipes written in Ruby',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      'Terraform is **declarative infrastructure as code** written in **HCL**. The agent-and-master description is Puppet, playbooks and inventory are Ansible, and cookbooks with Ruby recipes are Chef.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each term to its meaning.',
    pairs: [
      { left: 'Inventory', right: 'Lists managed nodes and groups (Ansible)' },
      { left: 'Playbook', right: 'YAML file of plays and tasks (Ansible)' },
      { left: 'Provider', right: 'Terraform plugin for a platform API' },
      { left: 'State', right: 'Terraform record of the objects it manages' },
      { left: 'Cookbook', right: 'Chef collection of recipes' },
      { left: 'Manifest', right: 'Puppet file written in the Puppet DSL' },
    ],
    difficulty: 1,
    explanation:
      'Inventory and playbook belong to Ansible, provider and state to Terraform, cookbook to Chef and manifest to Puppet. Learning which vocabulary belongs to which tool lets you identify the tool from any clue in a stem.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. A playbook contains the line `hosts: cisco`. On which devices will its tasks run?',
    exhibit: {
      kind: 'cli',
      text: `[routers]
R1
R2

[switches]
SW1

[firewalls]
FW1

[cisco:children]
routers
switches`,
    },
    options: ['R1, R2 and SW1', 'R1 and R2 only', 'R1, R2, SW1 and FW1', 'SW1 only'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `[cisco:children]` section makes `cisco` a **group of groups** containing `routers` and `switches`, so the play reaches R1, R2 and SW1. FW1 is in a separate group that is not listed under `cisco`, and a play that targets a parent group is not limited to one child.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement correctly describes this playbook?',
    exhibit: {
      kind: 'cli',
      text: `---
- name: Harden switches
  hosts: switches
  gather_facts: false
  tasks:
    - name: Disable the HTTP server
      cisco.ios.ios_config:
        lines:
          - no ip http server

    - name: Set the domain name
      cisco.ios.ios_config:
        lines:
          - ip domain name example.com`,
    },
    options: [
      'It runs two tasks, in order, on every device in the switches group',
      'It installs an Ansible agent on each switch before configuring it',
      'It configures only the first device listed in the inventory',
      'It declares desired state in HCL and relies on a state file',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The play targets the `switches` group, and its `tasks` list holds two module calls that run in the order written on every host in the group. Ansible is **agentless**, so nothing is installed; a play is not limited to the first host; and the file is YAML, not HCL, with no state file.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Which conclusion is correct?',
    exhibit: {
      kind: 'cli',
      text: `PLAY RECAP *********************************************************
R1  : ok=3  changed=0  unreachable=0  failed=0  skipped=0  rescued=0  ignored=0
R2  : ok=3  changed=2  unreachable=0  failed=0  skipped=0  rescued=0  ignored=0
R3  : ok=0  changed=0  unreachable=1  failed=0  skipped=0  rescued=0  ignored=0`,
    },
    options: [
      'R1 already matched the desired state, R2 was modified, and R3 could not be reached',
      'R1 failed all three tasks, and R2 and R3 were modified',
      'All three devices were modified',
      'R3 was reachable, but its tasks were skipped',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      '`changed=0` on R1 means every task found the device already compliant (idempotency), `changed=2` on R2 means two tasks modified it, and `unreachable=1` on R3 means the control node could not connect, so no tasks ran there. `failed` is 0 everywhere and `skipped` is 0, which rules out the other options.',
  },
  {
    id: 'e8',
    type: 'multi',
    stem: 'Which two statements describe Ansible? (Choose two.)',
    options: [
      'It is agentless',
      'It uses a push model from a control node',
      'It requires a Ruby-based agent on each managed device',
      'It pulls its configuration from a master server on a schedule',
      'Its configuration language is HCL',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Ansible needs **no agent** and **pushes** changes from the control node over SSH, NETCONF or an API. Agents, Ruby and scheduled pulls describe Chef and Puppet, and HCL is the language of Terraform.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement about this file is true?',
    exhibit: {
      kind: 'cli',
      text: `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.micro"
  tags = {
    Name = "web-1"
  }
}`,
    },
    options: [
      'It declares one virtual machine resource, named web, to be created through the AWS provider',
      'It is an Ansible playbook that connects to the instance over SSH',
      'It is a Puppet manifest that an agent applies at its next check-in',
      'It is a JSON document returned by a REST API call',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The `provider` and `resource` blocks with `name = value` arguments are **HCL**, so this is Terraform code that declares one `aws_instance` resource with the local name `web`. A playbook would be YAML with `hosts` and `tasks`, a Puppet manifest uses `=>` arrows, and JSON would use quoted keys and colons.',
  },
  {
    id: 'e10',
    type: 'order',
    stem: 'Put the usual Terraform workflow in order.',
    items: [
      'Write or edit the `.tf` files',
      'Run `terraform init` to download the providers',
      'Run `terraform plan` to preview the changes',
      'Run `terraform apply` to make the changes',
      'Run `terraform destroy` to remove the resources when they are no longer needed',
    ],
    difficulty: 2,
    explanation:
      'You write the code first, `init` fetches the providers, `plan` previews without changing anything, `apply` carries the plan out, and `destroy` is the final clean-up step when the infrastructure is no longer needed.',
  },
  {
    id: 'e11',
    type: 'categorize',
    stem: 'Classify each characteristic by the tool or tools it describes.',
    categories: ['Ansible', 'Terraform', 'Puppet and Chef'],
    items: [
      { text: 'The inventory lists the managed devices', category: 0 },
      { text: 'Tasks call modules such as ios_config', category: 0 },
      { text: 'Playbooks are written in YAML', category: 0 },
      { text: 'A plan previews the changes before apply', category: 1 },
      { text: 'A state file tracks the real resources', category: 1 },
      { text: 'Providers translate resources into API calls', category: 1 },
      { text: 'An agent checks in with a server on a schedule', category: 2 },
      { text: 'Cookbooks and manifests hold the desired configuration', category: 2 },
    ],
    difficulty: 3,
    explanation:
      'Inventory, modules and YAML playbooks are Ansible vocabulary. Plan, state and providers are Terraform concepts. Agents that check in with a server, plus manifests and cookbooks, describe the agent-based pull tools Puppet and Chef.',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Which two benefits does storing device configurations in a Git repository provide? (Choose two.)',
    options: [
      'A history showing who changed what and when',
      'The ability to roll back to an earlier known-good version',
      'Automatic enforcement of the repository contents on every device, with no other tool',
      'Faster packet forwarding on the devices',
      'Elimination of the need for passwords on the devices',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Git records an **audit trail** of every commit and lets you **roll back** by reverting to an earlier commit. Git alone does not push anything to devices (that needs Ansible, Terraform or another tool), and it has no effect on forwarding performance or on device authentication.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. The same playbook was run twice against R1. Which concept does the difference between the two recap lines demonstrate?',
    exhibit: {
      kind: 'cli',
      text: `First run:
R1  : ok=2  changed=2  unreachable=0  failed=0  skipped=0  rescued=0  ignored=0

Second run:
R1  : ok=2  changed=0  unreachable=0  failed=0  skipped=0  rescued=0  ignored=0`,
    },
    options: ['Idempotency', 'Configuration drift', 'The pull model', 'State locking'],
    answer: 0,
    difficulty: 2,
    explanation:
      'The first run made two changes and the second found nothing to change, which is **idempotency**: repeated runs converge on the same state. Drift would show changes appearing without anyone running the playbook, the pull model concerns who starts the connection, and state locking is a Terraform feature.',
  },
  {
    id: 'e14',
    type: 'match',
    stem: 'Match each scenario to the best-fit tool.',
    pairs: [
      { left: 'Create 40 cloud subnets and virtual machines from code, with a reviewed preview of every change', right: 'Terraform' },
      { left: 'Push the same NTP and SNMP settings to 200 switches over SSH without installing software on them', right: 'Ansible' },
      { left: 'An agent on each server pulls its configuration from a master every cycle, using manifests', right: 'Puppet' },
      { left: 'Ruby recipes grouped into cookbooks are distributed by a Chef server', right: 'Chef' },
    ],
    difficulty: 2,
    explanation:
      'A preview before changes (plan) and cloud resources point to **Terraform**. Agentless configuration over SSH points to **Ansible**. Manifests with an agent and a master point to **Puppet**, while Ruby recipes in cookbooks point to **Chef**.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer runs `terraform apply` and confirms. What is the expected result?',
    exhibit: {
      kind: 'cli',
      text: `Terraform will perform the following actions:

  # aws_instance.web1 will be updated in-place
  ~ resource "aws_instance" "web1" {
        id   = "i-0a1b2c3d4e5f6a7b8"
      ~ tags = {
          ~ "Name" = "web-1" -> "web-01"
        }
    }

  # aws_instance.web2 will be created
  + resource "aws_instance" "web2" {
      + ami           = "ami-0abcdef1234567890"
      + id            = (known after apply)
      + instance_type = "t3.micro"
    }

  # aws_instance.old will be destroyed
  - resource "aws_instance" "old" {
      - id = "i-0f9e8d7c6b5a43210" -> null
    }

Plan: 1 to add, 1 to change, 1 to destroy.`,
    },
    options: [
      'One instance is created, one is modified in place and one is destroyed',
      'Nothing changes, because plan output is only a preview and apply needs a second plan',
      'All three instances are destroyed and recreated',
      'Only web2 is created; the other two are ignored',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The symbols decide it: `+` creates web2, `~` updates web1 in place (only its Name tag changes), and `-` destroys old, which matches the summary line `1 to add, 1 to change, 1 to destroy`. Apply executes that plan after confirmation, so it does not need another plan; a replacement would be shown as `-/+`.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. The code specifies `t3.micro` and nobody has edited the code. Which explanation fits the output?',
    exhibit: {
      kind: 'cli',
      text: `$ terraform plan
aws_instance.web: Refreshing state... [id=i-0a1b2c3d4e5f6a7b8]

Terraform will perform the following actions:

  # aws_instance.web will be updated in-place
  ~ resource "aws_instance" "web" {
        id            = "i-0a1b2c3d4e5f6a7b8"
      ~ instance_type = "t3.large" -> "t3.micro"
    }

Plan: 0 to add, 1 to change, 0 to destroy.`,
    },
    options: [
      'Someone changed the instance type outside Terraform; the plan proposes to restore the type defined in the code',
      'Terraform will rewrite the code so that it matches the console',
      'Terraform will destroy the virtual machine and create a new one',
      'The state file is corrupted and must be deleted',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'During plan Terraform refreshes the real value (`t3.large`) and compares it with the code (`t3.micro`); the arrow shows current to desired. That is **drift detection**, and apply would put the type back. Terraform never edits the code, `~` means an in-place update rather than a replacement, and nothing indicates a corrupted state.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. No task ran. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `[routers]
R1 ansible_host=192.0.2.11
R2 ansible_host=192.0.2.12

---
- name: Configure NTP
  hosts: router
  gather_facts: false
  tasks:
    - name: Set the NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 192.0.2.123

$ ansible-playbook -i inventory.ini ntp.yml
[WARNING]: Could not match supplied host pattern, ignoring: router

PLAY [Configure NTP] ***********************************************
skipping: no hosts matched

PLAY RECAP *********************************************************`,
    },
    options: [
      'The play targets the group router, but the inventory group is named routers',
      'The control node cannot reach R1 and R2 over SSH',
      'Ansible requires an agent on R1 and R2',
      'The ios_config module is not idempotent',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The warning says the host pattern `router` matched nothing, because the inventory group is `routers`, so the play had no hosts. A connectivity failure would produce an `UNREACHABLE` message for a named host, Ansible is agentless, and idempotency has no bearing on whether a play finds its targets.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Refer to the exhibit. Which two tools require an agent on the managed nodes? (Choose two.)',
    exhibit: {
      kind: 'table',
      columns: ['Tool', 'Language', 'How it reaches the nodes', 'When changes are applied'],
      rows: [
        ['A', 'YAML', 'SSH, NETCONF or API from a control node', 'When the operator runs the playbook'],
        ['B', 'HCL', 'Provider APIs', 'When the operator runs apply'],
        ['C', 'Puppet DSL', 'Agent contacts the server', 'At every agent check-in'],
        ['D', 'Ruby', 'Agent contacts the server', 'At every agent check-in'],
      ],
    },
    options: ['Tool A', 'Tool B', 'Tool C', 'Tool D'],
    answers: [2, 3],
    difficulty: 3,
    explanation:
      'Tool C uses the Puppet DSL and Tool D uses Ruby, so they are Puppet and Chef: agents contact a server and changes arrive at each check-in. Tool A (YAML, control node) is Ansible and Tool B (HCL, provider APIs) is Terraform; both are agentless and run when the operator starts them.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Which statement correctly contrasts how Ansible and Puppet handle configuration drift by default?',
    options: [
      'Ansible corrects drift when a playbook is run; a Puppet agent corrects it at its next check-in',
      'Ansible corrects drift automatically every few minutes; Puppet only when an operator runs a command',
      'Neither tool can correct drift without a state file',
      'Both tools correct drift continuously with no schedule or trigger',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Ansible is a **push** tool, so drift is fixed whenever someone (or a scheduler) runs the playbook. Puppet is a **pull** tool, so each agent re-applies its manifests at every check-in. State files are a Terraform concept, and neither tool works with no trigger at all.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'What one-word Ansible term names the file that lists the managed devices and their groups?',
    answers: ['inventory', 'the inventory', 'inventory file'],
    placeholder: 'one word',
    difficulty: 2,
    explanation:
      'The **inventory** lists managed nodes and groups them so that a play can target them with `hosts:`. A playbook lists the tasks, not the devices.',
  },
  {
    id: 'e21',
    type: 'multi',
    stem: 'Which two statements describe Infrastructure as Code? (Choose two.)',
    options: [
      'The desired configuration is stored in text files',
      'Changes can be versioned, reviewed and repeated',
      'Devices are configured only by typing commands at the console',
      'Configuration cannot be tested before deployment',
      'Each device must be configured differently by hand',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'IaC defines infrastructure in **text files** that live in version control, so changes can be reviewed, tested, repeated and rolled back. Manual console typing, untestable configuration and hand-built one-off devices are exactly what IaC is meant to replace.',
  },
];
