import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'Server virtualization', back: 'Running several isolated virtual machines on one physical host by sharing its CPU, RAM, storage and NICs through a **hypervisor**.' },
  { id: 'f2', front: 'Benefits of server virtualization', back: 'Hardware consolidation, lower power, cooling and space cost, fast provisioning, isolation, snapshots and clones, and live migration.' },
  { id: 'f3', front: 'Hypervisor', back: 'Software layer that creates and runs VMs and shares the physical hardware among them.' },
  { id: 'f4', front: 'Type 1 hypervisor', back: '**Bare metal**: runs directly on the server hardware. Examples: VMware ESXi, Microsoft Hyper-V, KVM, Xen.' },
  { id: 'f5', front: 'Type 2 hypervisor', back: '**Hosted**: runs as an application on a host OS. Examples: Oracle VirtualBox, VMware Workstation, VMware Fusion.' },
  { id: 'f6', front: 'Type 1 versus Type 2: typical use', back: 'Type 1: data centers and production. Type 2: desktops, labs and testing (an extra host OS layer means lower performance).' },
  { id: 'f7', front: 'vNIC', back: 'A VM\'s virtual network adapter. It has its own MAC address and IP address and connects to a vSwitch.' },
  { id: 'f8', front: 'vSwitch', back: 'A software Layer 2 switch inside the hypervisor that connects vNICs to each other and to the physical NICs (uplinks).' },
  { id: 'f9', front: 'Switch port toward a host with VMs in several VLANs', back: 'An **802.1Q trunk** that allows the VM VLANs. The switch learns every VM MAC address on that one port.' },
  { id: 'f10', front: 'VM-to-VM traffic on the same host and VLAN', back: 'Forwarded inside the vSwitch; it never reaches the physical network.' },
  { id: 'f11', front: 'VM-to-VM traffic in different VLANs', back: 'Must go up the trunk to a router or Layer 3 switch (inter-VLAN routing) and back down.' },
  { id: 'f12', front: 'Live migration (vMotion)', back: 'Moves a running VM to another host with the same IP and MAC address. The VM VLAN must be carried to both hosts.' },
  { id: 'f13', front: 'Common VM MAC prefixes (OUIs)', back: 'VMware **00:50:56** and **00:0C:29**, Hyper-V 00:15:5D, VirtualBox 08:00:27.' },
  { id: 'f14', front: 'Bridged networking (Type 2)', back: 'The VM gets its own address on the physical LAN and appears as a separate host that others can reach.' },
  { id: 'f15', front: 'NAT networking (Type 2)', back: 'The VM sits behind the host\'s address on a private network and reaches the LAN and Internet through translation. The usual default.' },
  { id: 'f16', front: 'Host-only networking (Type 2)', back: 'The VM can talk only to the host and other VMs on that private network. No outside access.' },
  { id: 'f17', front: 'Container', back: 'An isolated group of processes that **shares the host OS kernel** and carries only the app and its dependencies. Lightweight; starts in seconds.' },
  { id: 'f18', front: 'Container image', back: 'Read-only package of an app, its libraries and settings from which containers are started. Stored in a registry such as Docker Hub.' },
  { id: 'f19', front: 'Containers versus VMs', back: 'VMs carry a full guest OS on top of a hypervisor. Containers share the host kernel: less overhead, faster start, weaker isolation.' },
  { id: 'f20', front: 'Docker', back: 'Platform to build container images and run containers on a host (`docker images`, `docker run`, `docker ps`).' },
  { id: 'f21', front: 'Kubernetes', back: 'Open-source container **orchestrator**: schedules pods on nodes, restarts failures, scales and load-balances.' },
  { id: 'f22', front: 'Kubernetes pod', back: 'The smallest deployable unit: one or more containers sharing one network namespace and IP address.' },
  { id: 'f23', front: 'VRF', back: 'Virtual Routing and Forwarding: **several independent routing tables** on one router. Each interface belongs to one VRF.' },
  { id: 'f24', front: 'Why use VRFs?', back: 'Keep customers or departments separate on shared routers, and allow **overlapping IP address ranges**.' },
  { id: 'f25', front: 'IOS command to create a VRF', back: '`vrf definition NAME`, then `address-family ipv4`. The legacy IPv4-only form is `ip vrf NAME`.' },
  { id: 'f26', front: 'IOS command to put an interface in a VRF', back: '`vrf forwarding NAME` in interface mode. The interface IP address is removed, so re-enter it afterwards.' },
  { id: 'f27', front: 'Show and test commands for a VRF', back: '`show vrf`, `show ip route vrf NAME`, `ping vrf NAME x.x.x.x`. Plain `show ip route` and `ping` use only the global table.' },
  { id: 'f28', front: 'VRF-Lite', back: 'VRFs without MPLS. Each VRF has its own interfaces and routing; VRF-aware routers connect over trunks with one subinterface per VRF.' },
  { id: 'f29', front: 'VLAN versus VRF', back: 'VLAN: Layer 2 segmentation of a switch (broadcast domains). VRF: Layer 3 segmentation of a router (routing tables).' },
  { id: 'f30', front: 'NFV', back: 'Network Functions Virtualization: running routers, firewalls and load balancers as software (**VNFs**) on standard servers.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which type of hypervisor runs directly on the server hardware?',
    options: ['Type 2 (hosted)', 'Type 1 (bare metal)', 'A container engine', 'A virtual switch'],
    answer: 1,
    difficulty: 1,
    explanation:
      'A **Type 1** hypervisor is installed on the bare hardware (ESXi, Hyper-V, KVM). A Type 2 hypervisor runs as an application on a host OS, a container engine shares a kernel instead of virtualizing hardware, and a virtual switch is just a networking component inside a hypervisor.',
  },
  {
    id: 'q2',
    type: 'categorize',
    stem: 'Classify each product by hypervisor type.',
    categories: ['Type 1 (bare metal)', 'Type 2 (hosted)'],
    items: [
      { text: 'VMware ESXi', category: 0 },
      { text: 'Microsoft Hyper-V', category: 0 },
      { text: 'KVM', category: 0 },
      { text: 'Oracle VirtualBox', category: 1 },
      { text: 'VMware Workstation', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'ESXi, Hyper-V and KVM run directly on the hardware (Type 1). VirtualBox and VMware Workstation are applications that run on a host operating system (Type 2).',
  },
  {
    id: 'q3',
    type: 'input',
    stem: 'Name the open-source platform that orchestrates containers across a cluster of nodes. (One word.)',
    answers: ['kubernetes', 'k8s'],
    placeholder: 'platform name',
    difficulty: 1,
    explanation:
      '**Kubernetes** (K8s) schedules, scales and heals containers across a cluster. Docker builds and runs containers on a single host.',
  },
  {
    id: 'q4',
    type: 'multi',
    stem: 'Which two statements about containers are true? (Choose two.)',
    options: [
      'They share the host operating system kernel',
      'Each container includes a full guest operating system',
      'They typically start faster than virtual machines',
      'They require a Type 1 hypervisor on every host',
      'They provide stronger isolation than virtual machines',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'Containers **share the host kernel** and therefore start quickly. They do not carry a guest OS, they do not need a hypervisor, and their isolation is lighter than a VM\'s because the kernel is shared.',
  },
  {
    id: 'q5',
    type: 'single',
    stem: 'A switch port connects to a hypervisor host whose VMs use VLANs 10 and 20. How should the port be configured?',
    options: ['Access port in VLAN 10 with PortFast', 'Access port in VLAN 20 with PortFast', '802.1Q trunk allowing VLANs 10 and 20', 'Routed port with an IP address and mask'],
    answer: 2,
    difficulty: 2,
    explanation:
      'Frames for several VLANs leave the host through one physical NIC, so the switch port must be an **802.1Q trunk** that allows both VLANs. An access port carries one VLAN and a routed port carries none.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'An interface already has an IP address. What happens to the address when you enter vrf forwarding RED on that interface?',
    options: [
      'It is kept and also placed in the global table',
      'It is converted to an IPv6 address',
      'It becomes a secondary address',
      'It is removed and must be configured again',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'IOS **removes** the existing IP address when the interface joins a VRF (and prints a warning), so assign the VRF first and configure the address afterwards.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'Which command displays the routing table of a VRF named RED?',
    options: ['show ip route vrf RED', 'show vrf RED', 'show ip route', 'show routing-table RED'],
    answer: 0,
    difficulty: 2,
    explanation:
      '`show ip route vrf RED` displays the RED table. Plain `show ip route` shows only the global table, `show vrf` lists VRFs and their interfaces, and `show routing-table` is not an IOS command.',
  },
];
