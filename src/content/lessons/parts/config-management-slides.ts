import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Configuration Management: Ansible & Terraform',
    subtitle: 'Keeping many devices consistent with code instead of keystrokes',
    notes:
      'Every network eventually grows beyond what one engineer can safely configure by hand. Configuration management tools solve this by turning device and infrastructure settings into **files** that software applies, checks and repeats. This deck covers the tools named in the exam topic: **Ansible**, which configures devices over SSH, NETCONF or an API, and **Terraform**, which provisions infrastructure from declarative definitions. It also gives you awareness of **Puppet** and **Chef**, the agent-based tools that appear as comparison material and distractors. Blueprint item 6.6 in v1.1 and the automation content in domain 5 of v2.0 expect you to recognise what each tool does, how it talks to devices, what language it uses and which concepts it relies on, such as inventory, playbooks, idempotency, providers and state. You will also learn why configuration drift is the problem all of these tools exist to solve, and how Git fits in as the source of truth.',
  },
  {
    kind: 'bullets',
    title: 'Configuration drift: the problem',
    bullets: [
      '**Drift**: running configs slowly diverge from the intended standard',
      'Causes: urgent manual fixes, forgotten changes, many engineers',
      'Results: outages, security gaps, failed audits, hard troubleshooting',
      '**Snowflake** devices: unique, undocumented, impossible to rebuild',
      'Goal of configuration management: **consistency, repeatability, speed**',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'Golden config', sub: 'intended state', tone: 'accent' },
        { id: 'b', label: 'Devices match', sub: 'day one', tone: 'good' },
        { id: 'c', label: 'Manual changes', sub: 'hotfixes, no record', tone: 'warn' },
        { id: 'd', label: 'Drift', sub: 'actual differs from intended', tone: 'bad' },
      ],
    },
    notes:
      'Configuration drift is what happens when the configuration actually running on devices stops matching the configuration you intended. It rarely comes from one big mistake. It accumulates: an engineer adds an ACL line at 2 a.m. to fix an outage and forgets to record it, another changes a timer on one switch for testing, a replacement device is configured from memory. After a year no two devices are alike, and each one is a **snowflake** that only its last editor understands. Drift causes outages when a standard behaviour is missing on one device, security gaps when a hardening step was skipped, and audit failures because the documentation no longer describes reality. Configuration management tools attack the problem from two sides: they push the intended state from one trusted source, which gives **consistency** and **repeatability**, and they can check devices against that source to **detect drift** and correct it. Speed and fewer typing errors come as a bonus.',
  },
  {
    kind: 'bullets',
    title: 'Infrastructure as Code (IaC)',
    bullets: [
      'Describe infrastructure in **text files**, not console clicks',
      'Files live in **version control** as the single source of truth',
      'Same code gives the same result: repeatable and testable',
      'Changes are reviewed like software: pull request, approve, merge',
      'Declarative IaC states the **desired end state**',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'w', label: 'Write code', sub: 'YAML, HCL, DSL' },
        { id: 'c', label: 'Commit to Git', sub: 'history + audit trail' },
        { id: 'r', label: 'Review and merge', sub: 'peer approval' },
        { id: 'a', label: 'Run the tool', sub: 'Ansible, Terraform', tone: 'accent' },
        { id: 'd', label: 'Devices / cloud', sub: 'match the code', tone: 'good' },
      ],
    },
    notes:
      'Infrastructure as Code means that the definition of your infrastructure is stored in text files that a tool reads and applies, instead of living in an engineer\'s head or in a series of console clicks. The files describe devices, VLANs, routing settings, cloud networks or virtual machines. Because they are plain text, you can keep them in **version control**, review them before they go live, test them in a lab and apply the same definition to ten or a thousand targets. Anyone can answer the question of what changed last Tuesday by reading the commit history, and a bad change is undone by reverting a commit and running the tool again. IaC does not mean one specific tool. An Ansible playbook is IaC, and so is a Terraform file, and so is a Puppet manifest. What matters is that the desired configuration is **written down as code**, stored in Git as the single source of truth, and applied by software rather than by hand. On the exam, IaC is the umbrella idea behind all four tools.',
  },
  {
    kind: 'cli',
    title: 'Git: version control for configuration files',
    code: `$ git clone https://git.example.com/netops/configs.git
Cloning into 'configs'...
$ cd configs
$ git checkout -b add-vlan-30
Switched to a new branch 'add-vlan-30'
$ git add vlans.yml
$ git commit -m "Add VLAN 30 for guest Wi-Fi"
[add-vlan-30 3f2a9c1] Add VLAN 30 for guest Wi-Fi
 1 file changed, 4 insertions(+)
$ git push origin add-vlan-30
$ git log --oneline
3f2a9c1 Add VLAN 30 for guest Wi-Fi
b81d0e4 Move NTP servers to variables
7c44aa2 Initial site baseline`,
    highlight: ['git checkout -b', 'git commit', 'git push'],
    bullets: [
      '`clone` copies a repository; a **branch** isolates a change',
      '`commit` records a change with a message; `push` publishes it',
      'A pull request lets peers review before the merge',
      'History gives an **audit trail** and easy **rollback**',
    ],
    notes:
      'Git is the version control system that almost every IaC workflow relies on. A **repository** holds your files plus their complete history. Each **commit** is a snapshot with an author, a timestamp and a message explaining why the change was made, and each commit has a unique ID, which `git log --oneline` shows in shortened form. Work happens on a **branch**, an isolated line of development, so that a half-finished change never disturbs the main branch that production uses. After pushing the branch to a remote server such as GitHub or GitLab, a teammate reviews the **pull request** or merge request, automated tests can check the syntax, and the branch is merged. If the change breaks something, `git revert` creates a new commit that undoes it. For the CCNA you do not need to memorise Git syntax, but you must know what Git gives network teams: an **audit trail**, collaboration, peer review and rollback, which together make the repository the single source of truth for configuration.',
  },
  {
    kind: 'compare',
    title: 'Declarative versus imperative',
    left: {
      heading: 'Imperative: the how',
      bullets: [
        'Lists the **steps** to run, in order',
        'The author must add "already done" checks',
        'Example: a CLI script or shell loop',
        'Running twice can repeat or break things',
      ],
    },
    right: {
      heading: 'Declarative: the what',
      bullets: [
        'States the **desired end state**',
        'The tool works out the steps',
        'Examples: Terraform and Puppet code',
        'Running again only fixes differences',
      ],
      tone: 'accent',
    },
    notes:
      'Tools differ in how you express a change. An **imperative** approach lists the steps: log in, enter configuration mode, add this ACL line, save. If you run it twice, you may add the line twice or hit an error, so the script author must add checks. A **declarative** approach states the result you want, for example that VLAN 30 exists with the name GUEST, and the tool compares that with reality and performs only the missing steps. Terraform and Puppet are declarative. Ansible sits in between in practice: a playbook is an ordered list of tasks, but each module is written to describe a desired state, such as `state: present`, and to do nothing when that state already exists. That property is called **idempotency**: applying the same operation repeatedly produces the same end state with no further changes after the first run. Idempotency is what makes it safe to run automation again, and it is the property exam questions most often attach to Ansible.',
  },
  {
    kind: 'diagram',
    title: 'Ansible architecture: control node and managed nodes',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'ctrl', icon: 'server', label: 'Control node', sub: 'Ansible installed', x: 1.6, y: 2.5, tone: 'accent' },
        { id: 'r1', icon: 'router', label: 'R1', sub: 'IOS XE router', x: 7.4, y: 0.9 },
        { id: 'sw1', icon: 'switch', label: 'SW1', sub: 'Catalyst switch', x: 7.4, y: 2.5 },
        { id: 'fw1', icon: 'firewall', label: 'FW1', sub: 'API-capable firewall', x: 7.4, y: 4.1 },
      ],
      links: [
        { from: 'ctrl', to: 'r1', label: 'SSH (CLI)', arrow: 'forward', tone: 'accent' },
        { from: 'ctrl', to: 'sw1', label: 'NETCONF', arrow: 'forward', tone: 'accent' },
        { from: 'ctrl', to: 'fw1', label: 'HTTPS API', arrow: 'forward', tone: 'accent' },
      ],
      groups: [{ label: 'Managed nodes (no agent)', x: 6.1, y: 0.05, w: 2.6, h: 4.9, tone: 'muted' }],
      annotations: [
        { x: 1.6, y: 3.7, text: 'inventory + playbooks', tone: 'accent' },
        { x: 4.2, y: 4.7, text: 'Push: the control node starts every session', tone: 'muted' },
      ],
    },
    caption: 'Agentless and push: nothing is installed on the devices, and the control node opens each connection.',
    notes:
      'The Ansible architecture is deliberately simple. You install Ansible on one machine, the **control node**, which is a Linux or macOS system, or a Windows host running WSL. The devices it manages are **managed nodes**, and nothing needs to be installed on them: Ansible is **agentless**. For servers it logs in over SSH; for network devices it picks a connection method that fits the platform: CLI over SSH, NETCONF (an XML interface that runs over SSH) or an HTTPS API. Because the control node always starts the session, Ansible is a **push** tool: changes happen when you run a playbook, not on a timer set by the device. The control node reads an **inventory** that lists the devices and a **playbook** that lists the tasks to run on them. Network modules run on the control node itself and talk to the device from there, which is why a router with no Python interpreter still works. Contrast this with Puppet and Chef later in the deck.',
  },
  {
    kind: 'cli',
    title: 'Inventory: which devices to manage',
    code: `[routers]
R1 ansible_host=192.0.2.11
R2 ansible_host=192.0.2.12

[switches]
SW1 ansible_host=192.0.2.21

[cisco:children]
routers
switches

[cisco:vars]
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios
ansible_user=admin`,
    highlight: ['[routers]', '[cisco:children]', '[cisco:vars]'],
    bullets: [
      'The inventory lists **managed nodes** and groups them',
      'Group names are the targets of `hosts:` in a playbook',
      'Variables set the connection type, OS family and user',
      'INI or YAML format; default file is `/etc/ansible/hosts`',
    ],
    notes:
      'The inventory answers the question of which devices to manage. In the INI format shown here, a name in square brackets starts a **group**, and the lines below it are the managed nodes in that group. `ansible_host` tells Ansible which IP address to connect to, so the inventory name R1 can differ from the address. A group can contain other groups with the `:children` suffix, so `cisco` here contains both routers and switches, and a play that targets `cisco` reaches all three devices. The `:vars` suffix sets variables for every member of a group, which is where you describe how to connect: the connection plugin `network_cli` means CLI over SSH, `ansible_network_os` selects the IOS module family, and `ansible_user` is the login. Passwords do not belong in plain text here; they are stored encrypted with Ansible Vault or supplied at run time. Inventories can also be written in YAML. On the exam, remember the one-line summary: the inventory lists the devices, the playbook lists the work.',
  },
  {
    kind: 'cli',
    title: 'A playbook: tasks written in YAML',
    code: `---
- name: Configure NTP and banner on routers
  hosts: routers
  gather_facts: false
  tasks:
    - name: Set the NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 192.0.2.123

    - name: Set the login banner
      cisco.ios.ios_banner:
        banner: login
        text: Authorized users only
        state: present`,
    highlight: ['hosts: routers', 'tasks:', 'cisco.ios.ios_config', 'cisco.ios.ios_banner', 'state: present'],
    bullets: [
      'A playbook is a list of **plays**; each play targets `hosts`',
      'Each play has an ordered list of **tasks**',
      'Each task calls one **module** with arguments',
      'YAML: indentation matters and `-` starts a list item',
    ],
    notes:
      'Read a playbook from the top. The three dashes mark the start of a YAML document. Each item starting with a hyphen at the left margin is a **play**. This play has a human-readable `name`, selects the target group with `hosts: routers`, and sets `gather_facts: false`, because fact gathering expects Python on the target and network devices run their modules from the control node instead. Under `tasks:` there is a list, and each hyphen introduces one **task**. A task has a name and calls one **module**, here `cisco.ios.ios_config` and `cisco.ios.ios_banner`, followed by indented arguments. `lines` is a list of IOS commands that must be present in the running configuration, and `state: present` means the banner should exist. YAML cares about indentation: lines indented under a key belong to it, and a mis-indented line is a syntax error that Ansible rejects before touching any device. Tasks run in the order written, and each runs on every host of the play.',
  },
  {
    kind: 'cli',
    title: 'Running a playbook and idempotency',
    code: `$ ansible-playbook -i inventory.ini ntp.yml

PLAY [Configure NTP and banner on routers] ****************************

TASK [Set the NTP server] *********************************************
changed: [R1]
ok: [R2]

TASK [Set the login banner] *******************************************
ok: [R1]
ok: [R2]

PLAY RECAP ************************************************************
R1     : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
R2     : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,
    highlight: ['changed: [R1]', 'ok: [R2]', 'changed=1'],
    bullets: [
      '`changed`: the module had to modify the device',
      '`ok`: the device already matched, so nothing was done',
      '**Idempotent**: a second run reports `changed=0`',
      'Command-style modules do not check state first',
    ],
    notes:
      'This is what an engineer sees after running the playbook. Each task prints one line per device. **ok** means the module checked the device and found that it already matched, so it did nothing. **changed** means the module had to modify the device. On R1 the NTP line was missing, so Ansible added it; R2 already had it. The recap at the bottom counts results per device, and note that `ok` includes the tasks that also changed. Now run the same playbook again. Every task reports `ok` and every recap shows `changed=0`. That is **idempotency** in action: the second run did not add anything, restart anything or break anything, which is why running a playbook on a schedule to keep devices in compliance is safe. Idempotency depends on the module. Modules like `ios_config` compare your lines with the running configuration first, but command-style modules simply run what you give them and report whatever happens. Adding `--check` previews changes where the module supports it.',
  },
  {
    kind: 'definitions',
    title: 'Ansible vocabulary',
    terms: [
      { term: 'Control node', def: 'The machine with Ansible installed that runs playbooks.' },
      { term: 'Managed node', def: 'A device or server that Ansible configures; no agent is installed.' },
      { term: 'Inventory', def: 'File that lists managed nodes and groups them, with connection variables.' },
      { term: 'Playbook', def: 'YAML file of plays; each play maps a host group to ordered tasks.' },
      { term: 'Task', def: 'One call to one module, with its arguments.' },
      { term: 'Module', def: 'The code behind a task, such as `cisco.ios.ios_config`; usually idempotent.' },
      { term: 'Role', def: 'Reusable bundle of tasks, variables, templates and files.' },
    ],
    notes:
      'These seven terms appear constantly in exam stems and answer options. The **control node** is where Ansible runs, never a managed device. A **managed node** is any target and needs no agent. The **inventory** lists targets and groups, while a **playbook** lists the work as one or more plays, each of which maps a group of hosts to tasks. A **task** is a single module call, and a **module** is the code behind it, such as the one that edits an IOS configuration; most modules are idempotent. A **role** packages tasks, variables, templates and files into a reusable unit, so that configuring NTP can be written once and shared by many playbooks. Related vocabulary you may see: **variables** parameterise a playbook, **handlers** run only when a task reports a change, and **Ansible Vault** encrypts secrets such as passwords. The Red Hat Ansible Automation Platform adds a web interface, role-based access and scheduling on top of the same playbooks.',
  },
  {
    kind: 'diagram',
    title: 'Terraform workflow: write, plan, apply',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'w', label: 'Write .tf files', sub: 'HCL, declarative' },
        { id: 'i', label: 'terraform init', sub: 'download providers' },
        { id: 'p', label: 'terraform plan', sub: 'preview, no changes', tone: 'accent' },
        { id: 'a', label: 'terraform apply', sub: 'call provider APIs', tone: 'accent' },
        { id: 's', label: 'State file', sub: 'records what exists', tone: 'muted' },
      ],
    },
    caption: '`terraform destroy` removes everything the configuration manages.',
    notes:
      'Terraform manages infrastructure through a loop of a few commands. You write `.tf` files that declare the resources you want. `terraform init` prepares the working directory and downloads the **providers** the code needs. `terraform plan` reads your code, reads the **state** and queries the real platform, and then prints exactly what would be created, changed or destroyed, without doing any of it. That preview is the safety net and the main difference from a script that simply runs. When you are happy with the plan, `terraform apply` carries it out by calling the provider APIs and then records the result in the state. `terraform destroy` removes everything the configuration manages. Terraform is **declarative**: you never write the order of steps, because it builds a dependency graph from the references between resources. It is an **infrastructure provisioning** tool, so its home ground is creating networks, subnets, virtual machines and cloud services, rather than editing the CLI of an existing router.',
  },
  {
    kind: 'cli',
    title: 'Reading Terraform HCL',
    code: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "lab" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "lab-vpc"
  }
}

resource "aws_subnet" "web" {
  vpc_id     = aws_vpc.lab.id
  cidr_block = "10.0.1.0/24"
}`,
    highlight: ['provider "aws"', 'resource "aws_vpc" "lab"', 'aws_vpc.lab.id'],
    bullets: [
      '**provider**: plugin that talks to one platform API',
      '**resource**: an object Terraform creates and manages',
      'References such as `aws_vpc.lab.id` create dependencies',
      'Declarative: only desired attributes, no step-by-step logic',
    ],
    notes:
      'This file is written in **HCL**, the HashiCorp Configuration Language. HCL is made of blocks: a block type, optional labels and a body in braces. The `terraform` block pins the provider plugin and its version. The `provider` block configures it, here the AWS provider with a region. A **resource** block has two labels: the resource type, `aws_vpc`, and a local name, `lab`, which together form the address `aws_vpc.lab`. Inside the body, arguments are written `name = value`. The subnet refers to `aws_vpc.lab.id`, which tells Terraform that the subnet depends on the VPC, so the VPC is created first and its identifier is filled in automatically once it exists. Notice what is missing: there is no loop, no test of whether the VPC already exists, and no ordering. You describe the end state, and Terraform computes the steps. Providers exist for the major clouds, for virtualisation platforms and for Cisco platforms such as ACI, which is how one workflow can manage many technologies.',
  },
  {
    kind: 'cli',
    title: 'Plan and apply output',
    code: `$ terraform plan
Terraform will perform the following actions:

  # aws_subnet.web will be created
  + resource "aws_subnet" "web" {
      + cidr_block = "10.0.1.0/24"
      + id         = (known after apply)
      + vpc_id     = (known after apply)
    }

  # aws_vpc.lab will be created
  + resource "aws_vpc" "lab" {
      + cidr_block = "10.0.0.0/16"
      + id         = (known after apply)
      + tags       = {
          + "Name" = "lab-vpc"
        }
    }

Plan: 2 to add, 0 to change, 0 to destroy.

$ terraform apply -auto-approve
aws_vpc.lab: Creating...
aws_vpc.lab: Creation complete after 2s [id=vpc-0a1b2c3d4e5f67890]
aws_subnet.web: Creating...
aws_subnet.web: Creation complete after 1s [id=subnet-0f1e2d3c4b5a69788]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.`,
    highlight: ['Plan: 2 to add, 0 to change, 0 to destroy.', 'Apply complete!'],
    bullets: [
      '`init` downloads providers; `plan` previews; `apply` executes',
      '`+` create, `~` change in place, `-` destroy, `-/+` replace',
      'A second plan reports no changes: the result is **idempotent**',
      'Manual changes to managed objects show up in the next plan',
    ],
    notes:
      'Terraform prints a readable preview before it touches anything. A leading `+` marks a resource to be **created**, `~` marks an **update in place**, `-` marks a **destroy**, and `-/+` means destroy and recreate. Values that only exist after creation, such as an ID, appear as `(known after apply)`. The final line, `Plan: 2 to add, 0 to change, 0 to destroy.`, is the summary you should read first. `terraform apply` shows the plan again, asks for confirmation unless `-auto-approve` is used, performs the calls and ends with `Apply complete!`. Now run `terraform plan` a second time: Terraform reports that no changes are needed, because the real world already matches the code. That is the same idempotent behaviour you saw with Ansible, and the plan is also a **drift detector**. If someone changes a managed resource by hand, the next plan shows the difference and the next apply puts it back. The output here is shortened; real plans list every attribute.',
  },
  {
    kind: 'table',
    title: 'Terraform concepts',
    columns: ['Concept', 'What it is'],
    rows: [
      ['**HCL**', 'HashiCorp Configuration Language; the declarative syntax of `.tf` files'],
      ['**Provider**', 'Plugin that talks to a platform API: AWS, Azure, Google Cloud, Cisco ACI, vSphere'],
      ['**Resource**', 'One managed object, such as a VPC, subnet or virtual machine'],
      ['**State**', 'Record (`terraform.tfstate`) mapping resource blocks to real objects'],
      ['**Plan**', 'Preview of the creates, changes and destroys that apply would perform'],
      ['**Module**', 'Reusable package of Terraform code'],
      ['**Variable / output**', 'Inputs that parameterise the code; values exported after apply'],
    ],
    caption: 'Terraform is **declarative** and focused on **provisioning** infrastructure.',
    notes:
      'Use this table as a glossary. **HCL** is the language and `.tf` files hold it. A **provider** is the plugin that knows how to talk to the API of one platform, so the provider is what makes Terraform work with AWS, Azure, Google Cloud, VMware or Cisco ACI. A **resource** is one managed object, and the **state** is the memory of which real objects belong to which resource blocks. State is stored in `terraform.tfstate`, a JSON file, locally by default and in shared remote storage for teams; it can contain sensitive values, so it must be protected. A **plan** is the preview, **modules** are reusable packages of code, and **variables** and **outputs** make code configurable and expose results. Exam questions at CCNA level ask what Terraform is (declarative IaC for provisioning), what language it uses (HCL), and what plan and apply do; they do not ask you to write HCL, but they may show a short file and ask you to interpret it.',
  },
  {
    kind: 'diagram',
    title: 'Pull model: how Puppet and Chef agents work',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'node', label: 'Managed node (agent)', icon: 'server' },
        { id: 'srv', label: 'Puppet / Chef server', icon: 'server' },
      ],
      steps: [
        { from: 'node', to: 'srv', label: 'Check in on a schedule', sub: 'agent starts the session (pull)' },
        { from: 'srv', to: 'node', label: 'Send desired configuration', sub: 'Puppet catalog from manifests; Chef cookbooks', tone: 'accent' },
        { note: 'The agent compares and changes only what differs' },
        { from: 'node', to: 'srv', label: 'Report the result' },
      ],
    },
    caption: 'Agent-based and pull: the node contacts the server, not the other way round.',
    notes:
      'Puppet and Chef reverse the direction used by Ansible. Each managed node runs an **agent**, a small program that checks in with a central server on a schedule, for example every half hour. The server holds the desired configuration, written as **manifests** in Puppet or as **cookbooks** of recipes in Chef. In the Puppet flow, the agent sends facts about its node, the server works out which rules apply and returns a compiled catalog, the agent changes anything that differs, and it then sends a report. This is a **pull model** because the node initiates the contact. Pull has real advantages: configuration is enforced again at every cycle, so drift is corrected at the next check-in, and a node that was offline simply catches up when it returns. The costs are the need to install and maintain agents, and the fact that many network devices cannot run one, which is why Ansible, which needs no agent, became popular for routers and switches. Questions in this area test the vocabulary: agent, server, pull, manifest, cookbook.',
  },
  {
    kind: 'cli',
    title: 'Puppet manifest and Chef recipe',
    code: `[ Puppet manifest: Puppet DSL ]
  package { 'ntp':
    ensure => installed,
  }
  service { 'ntp':
    ensure  => running,
    enable  => true,
    require => Package['ntp'],
  }

[ Chef recipe: Ruby, inside a cookbook ]
  package 'ntp' do
    action :install
  end
  service 'ntp' do
    action [:enable, :start]
  end`,
    highlight: ['[ Puppet manifest: Puppet DSL ]', '[ Chef recipe: Ruby, inside a cookbook ]'],
    bullets: [
      'Puppet: **manifests** (`.pp` files) in the Puppet DSL',
      'Chef: **recipes** grouped into **cookbooks**, written in Ruby',
      'Both are **agent-based** and use a **pull** model',
      'Both describe resources: package, service, file, user',
    ],
    notes:
      'Compare the two snippets and notice the family resemblance. Both describe **resources**, such as a package or a service, and each resource states what should be true. The **Puppet manifest** uses the Puppet DSL, a declarative language with curly braces and `=>` arrows. It says the `ntp` package must be installed and the service must be running and enabled, and `require` states a dependency so the package is handled first. The **Chef recipe** is plain Ruby with a small domain language: `package \'ntp\' do ... end` and an `action` for each resource. Because a recipe is ordinary Ruby that runs top to bottom, Chef is often described as procedural, whereas Puppet is purely declarative. A recipe is not deployed alone; recipes are grouped into **cookbooks**, which the Chef server distributes to nodes. For the CCNA you only need to recognise the vocabulary and the pairings: Puppet goes with manifests and the Puppet DSL, Chef goes with recipes, cookbooks and Ruby, and both are agent-based pull tools. You will not be asked to write either one, and these tools appear in answer options mostly as distractors for questions about Ansible and Terraform.',
  },
  {
    kind: 'compare',
    title: 'Push versus pull; agentless versus agent',
    left: {
      heading: 'Push, agentless: Ansible, Terraform',
      bullets: [
        'The **control node** starts the connection',
        'Nothing is installed on managed devices',
        'Runs when **you** run it (or a scheduler does)',
        'Uses SSH, NETCONF or HTTPS APIs',
      ],
      tone: 'accent',
    },
    right: {
      heading: 'Pull, agent-based: Puppet, Chef',
      bullets: [
        'An **agent** runs on every node',
        'The agent contacts the server on a schedule',
        'The server holds manifests or cookbooks',
        'Drift is corrected at each check-in',
      ],
    },
    notes:
      'This comparison is the quickest way to eliminate wrong answers. If a question says there is **no software on the managed device** and a central machine runs the changes when told to, think of Ansible, and think of Terraform when the changes are made through the API of a platform. If a question says an **agent** contacts a **master** or **server** on a schedule to retrieve its configuration, the tool is Puppet or Chef. Push gives you control over timing, which is useful for change windows, and it works for devices that cannot run agents. Pull gives you continuous enforcement and scales naturally because each node does its own work. Neither model is better in every case, and the exam does not ask which to prefer; it asks you to match the model to the tool. Notice also that Terraform and Ansible overlap in purpose, but Terraform tracks what it created in a state file, while Ansible has no state file and simply checks each target when it runs.',
  },
  {
    kind: 'table',
    title: 'Ansible vs Terraform vs Puppet vs Chef',
    columns: ['Feature', 'Ansible', 'Terraform', 'Puppet', 'Chef'],
    rows: [
      ['Main job', 'Configuration management, orchestration', 'Provisioning infrastructure (IaC)', 'Configuration management', 'Configuration management'],
      ['Language', '**YAML** playbooks', '**HCL** (`.tf` files)', '**Puppet DSL** manifests', '**Ruby** recipes in cookbooks'],
      ['Agent on node?', '**No**', '**No** (provider APIs)', '**Yes**', '**Yes**'],
      ['Model', '**Push**', 'Push (you run plan and apply)', '**Pull**', '**Pull**'],
      ['Transport', 'SSH, NETCONF, HTTPS API', 'HTTPS APIs of providers', 'Agent to Puppet server', 'Agent to Chef server'],
      ['Style', 'Ordered tasks, idempotent modules', '**Declarative**', 'Declarative', 'Ruby code describing resources'],
      ['Key terms', 'Inventory, playbook, module, task', 'Provider, resource, state, plan', 'Manifest, catalog', 'Cookbook, recipe'],
    ],
    notes:
      'This table is the study sheet for the whole topic, so learn it by rows. The first row separates **provisioning** (Terraform creates and changes infrastructure objects) from **configuration management** (the other three keep the settings of systems consistent), although Ansible can do both to some extent. The language row is a favourite: YAML for Ansible, HCL for Terraform, the Puppet DSL for Puppet and Ruby for Chef. The agent and model rows pair up: Ansible and Terraform are agentless and push, Puppet and Chef are agent-based and pull. The key-terms row gives the vocabulary that identifies the tool in a stem, so an inventory means Ansible, a provider or state file means Terraform, a manifest means Puppet and a cookbook or recipe means Chef. If a question gives you two or three of these clues you can name the tool even when the answer options are worded differently. Practise covering a column and reciting it.',
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Match **tool, language, agent and model** as a set: Ansible is YAML, agentless, push; Terraform is HCL and declarative; Puppet and Chef are agent-based and pull.',
    bullets: [
      'Ansible needs **no agent**; Puppet and Chef do',
      'Terraform **provisions** infrastructure; Ansible mostly **configures** it',
      '**Idempotent** means repeated runs leave the same result, not "runs once"',
      '`terraform plan` changes nothing; `terraform apply` does',
      'The inventory lists devices; the playbook lists tasks',
      'Puppet uses manifests (DSL); Chef uses recipes (Ruby)',
    ],
    notes:
      'Cisco builds distractors from near-miss facts, so memorise the pairings exactly. A stem that mentions YAML playbooks and no software on devices is Ansible, but an answer that says Ansible is pull-based or agent-based is wrong. Terraform shows up with HCL, providers, plan and state, and an answer that gives it an agent, or calls it a tool for pushing CLI lines to routers, is a distractor. Idempotency is not about running once; it means that repeating the operation changes nothing further, so a second Ansible run reports `changed=0`. Be careful with plan and apply: only apply modifies anything. Do not swap inventory and playbook, and do not swap manifest and recipe. Finally, remember why these tools exist. Whenever a scenario describes inconsistent configurations, undocumented hotfixes or manual changes spread across many devices, the underlying problem is configuration drift, and the cure is a tool plus a Git repository as the source of truth.',
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      '**Drift** is running config diverging from the intended standard',
      '**IaC** plus **Git**: configuration as reviewed, versioned code',
      '**Ansible**: agentless, push, YAML; inventory, playbook, module',
      '**Terraform**: declarative HCL; provider, plan, apply, state',
      '**Puppet** and **Chef**: agent-based, pull; manifests versus cookbooks',
      '**Idempotency**: repeated runs converge on the same state',
    ],
    notes:
      'Check that you can explain each of these points in a sentence. Drift is the problem: configurations that no longer match the standard. Infrastructure as Code with Git is the approach: the desired state lives in reviewed, versioned text files. Ansible is the push tool for configuring existing devices over SSH, NETCONF or an API, with an inventory of targets and playbooks of tasks that call idempotent modules. Terraform is the declarative provisioning tool that uses HCL, providers and a state file, and it always previews with plan before apply changes anything. Puppet and Chef are the agent-based, pull-model tools, with manifests in the Puppet DSL and cookbooks of Ruby recipes. Idempotency ties them together, because it is what makes repeated runs safe. On either exam version you can expect questions that ask you to identify a tool from a clue, to read a short playbook, inventory or HCL excerpt, or to interpret a recap or plan output. The flashcards and exam questions drill exactly those patterns.',
  },
];
