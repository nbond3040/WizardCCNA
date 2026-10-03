import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Virtualization: VMs, Containers & VRFs',
    subtitle: 'Hypervisors, virtual switches, containers, VRFs and NFV',
    notes:
      "Virtualization means running several independent logical systems on one physical system, and CCNA topic 1.12 applies the idea three ways: servers (virtual machines running under a hypervisor), applications (containers), and routing (VRFs). The topic is tested on v1.1 and sits in domain 1 of the v2.0 blueprint. Questions are mostly recognition and comparison: is VirtualBox a Type 1 or Type 2 hypervisor, which statement describes a container rather than a VM, how does a VM's traffic reach the physical network, and what does a VRF do on a router. You will also meet short CLI exhibits, usually show vrf or show ip route vrf, where the skill is knowing which routing table you are looking at. This deck covers the benefits of server virtualization, the two hypervisor types, virtual NICs and virtual switches and the trunk that connects a host to the network, then containers with Docker and Kubernetes awareness, then VRFs with the vrf definition and vrf forwarding commands and VRF-Lite, and finally network functions virtualization (NFV).",
  },
  {
    kind: 'bullets',
    title: 'Why virtualize servers?',
    bullets: [
      'Before: one operating system per physical server, mostly idle',
      'After: a **hypervisor** shares CPU, RAM, storage and NICs among many **VMs**',
      'Benefits: consolidation, lower power, cooling and space cost',
      'Fast provisioning, isolation, snapshots, clones and live migration',
      'Risk: a host failure takes down every VM on it',
    ],
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      groups: [
        { label: 'Before: three servers', x: 0.2, y: 0.3, w: 3.6, h: 4.8 },
        { label: 'After: one host, three VMs', x: 4.2, y: 0.3, w: 5.6, h: 4.8 },
      ],
      nodes: [
        { id: 'p1', icon: 'server', label: 'App A', sub: 'own OS', x: 2.0, y: 1.1 },
        { id: 'p2', icon: 'server', label: 'App B', sub: 'own OS', x: 2.0, y: 2.8 },
        { id: 'p3', icon: 'server', label: 'App C', sub: 'own OS', x: 2.0, y: 4.5 },
        { id: 'hv', icon: 'hypervisor', label: 'Hypervisor', sub: 'one physical host', x: 5.8, y: 2.8, tone: 'accent' },
        { id: 'v1', icon: 'vm', label: 'VM A', x: 8.6, y: 1.1 },
        { id: 'v2', icon: 'vm', label: 'VM B', x: 8.6, y: 2.8 },
        { id: 'v3', icon: 'vm', label: 'VM C', x: 8.6, y: 4.5 },
      ],
      links: [
        { from: 'hv', to: 'v1' },
        { from: 'hv', to: 'v2' },
        { from: 'hv', to: 'v3' },
      ],
    },
    notes:
      "Traditionally every application got its own physical server, and most of those servers sat mostly idle while still consuming rack space, power and cooling. Server virtualization fixes that by inserting a hypervisor between the hardware and the operating systems. The hypervisor presents each virtual machine with virtual hardware, a few virtual CPUs, some memory, a virtual disk and a virtual network card, and shares the real CPU, RAM, storage and NICs among them. The benefits are the classic exam list: better hardware utilization through consolidation, lower cost for power, cooling and space, fast provisioning of new servers from templates, isolation so that one crashing VM does not take its neighbors down, snapshots and clones for testing and backup, and the ability to move running VMs between hosts. There is a trade-off worth remembering: concentration. When a physical host fails, every VM on it fails, so production designs cluster several hosts and use high availability and live migration. The vocabulary: the physical machine is the host, and each VM is a guest.",
  },
  {
    kind: 'definitions',
    title: 'Virtualization vocabulary',
    terms: [
      { term: 'Host', def: 'The physical server that runs the hypervisor and supplies CPU, RAM, storage and NICs.' },
      { term: 'Hypervisor', def: 'Software that creates VMs, isolates them and shares the host hardware among them.' },
      { term: 'VM (guest)', def: 'A software computer with its own guest OS and virtual hardware: vCPU, vRAM, vDisk, vNIC.' },
      { term: 'vNIC', def: 'A VM\'s virtual network adapter, with its own MAC address and IP address.' },
      { term: 'vSwitch', def: 'Software Layer 2 switch in the hypervisor that links vNICs to each other and to the physical NICs.' },
      { term: 'Uplink', def: 'A physical NIC of the host that connects the vSwitch to a physical switch port.' },
      { term: 'Live migration', def: 'Moving a running VM to another host without changing its IP or MAC address (for example vMotion).' },
    ],
    notes:
      "These seven terms appear in almost every virtualization question, so make them automatic. The host is the physical server; the hypervisor is the software that creates VMs and divides the host's resources among them. A VM, or guest, thinks it is a normal computer: it runs its own operating system on virtual hardware. Its vNIC is a virtual network adapter with a MAC address of its own, assigned by the hypervisor from a vendor prefix; VMware uses 00:50:56 and 00:0C:29, for example. The vSwitch is a software Layer 2 switch inside the hypervisor that connects the vNICs to each other and to the host's physical network cards, the uplinks. Live migration, such as VMware vMotion, moves a running VM from one host to another without changing its IP or MAC address, which is why the VM's VLAN must be reachable on every host. Snapshots capture a VM's disk and memory state at a moment in time so that you can roll back. Notice how many of these terms have a physical-world twin: NIC, switch, server. Virtualization copies familiar networking concepts into software.",
  },
  {
    kind: 'diagram',
    title: 'Hypervisor types: what sits underneath',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Type 1: bare metal',
          layers: [
            { label: 'VM 1 · VM 2 · VM 3', sub: 'apps and a guest OS in each' },
            { label: 'Hypervisor', sub: 'ESXi · Hyper-V · KVM', tone: 'accent', span: 2 },
            { label: 'Server hardware', tone: 'muted' },
          ],
        },
        {
          title: 'Type 2: hosted',
          layers: [
            { label: 'VM 1 · VM 2', sub: 'apps and a guest OS in each' },
            { label: 'Hypervisor application', sub: 'VirtualBox · Workstation', tone: 'accent' },
            { label: 'Host OS', sub: 'Windows · macOS · Linux' },
            { label: 'PC hardware', tone: 'muted' },
          ],
        },
      ],
    },
    caption: 'Type 1 runs directly on the hardware; Type 2 runs on top of a host operating system.',
    bullets: [
      '**Type 1** (bare metal): VMware ESXi, Microsoft Hyper-V, KVM',
      '**Type 2** (hosted): Oracle VirtualBox, VMware Workstation',
      'Type 1 is the data center choice; Type 2 suits desktops and labs',
    ],
    notes:
      "A hypervisor comes in two flavors, and the difference is what sits underneath it. A Type 1 hypervisor, also called bare-metal or native, is installed directly on the server hardware and is effectively the operating system of the machine; VMware ESXi, Microsoft Hyper-V and KVM are the standard examples. Because it controls the hardware directly, it delivers the best performance and isolation and is what data centers use. A Type 2 hypervisor, also called hosted, is an ordinary application that runs on top of a general-purpose operating system such as Windows, macOS or Linux; Oracle VirtualBox and VMware Workstation are the standard examples. Every instruction passes through the host OS as well, which costs performance and makes the VMs depend on the health of that host OS, so Type 2 products are used on desktops, in labs and for testing, for instance to run a network simulator on a laptop. The picture shows the whole difference: Type 1 has one fewer layer. Hyper-V sometimes confuses students because it is installed as a Windows Server role; the hypervisor still sits under Windows, which runs as a privileged guest, so it is Type 1.",
  },
  {
    kind: 'table',
    title: 'Type 1 versus Type 2 hypervisors',
    columns: ['Feature', 'Type 1 (bare metal)', 'Type 2 (hosted)'],
    rows: [
      ['**Runs on**', 'Directly on the server hardware', 'On a host OS (Windows, macOS, Linux)'],
      ['**Examples**', 'VMware ESXi, Microsoft Hyper-V, KVM, Xen', 'Oracle VirtualBox, VMware Workstation, VMware Fusion'],
      ['**Typical use**', 'Data centers and production servers', 'Developer PCs, labs and testing'],
      ['**Performance**', 'Higher: direct hardware access', 'Lower: the host OS adds overhead'],
      ['**Extra OS layer**', 'None', 'Host OS between hardware and hypervisor'],
      ['**Management**', 'Central tools such as VMware vCenter', 'Per-PC desktop application'],
    ],
    caption: 'Memorize two lists: ESXi, Hyper-V, KVM are Type 1; VirtualBox and Workstation are Type 2.',
    notes:
      "Use this table for the questions that ask you to choose between the two types or to identify one from a description. The decisive row is 'Runs on': Type 1 sits directly on the hardware, Type 2 sits on a host operating system. From that single fact the rest follows. Performance is higher on Type 1, because there is no extra OS layer between the VMs and the hardware; Type 2 pays an overhead and shares the machine with the host OS and its other applications. Typical use follows the same split: production servers and data centers on one side, developer laptops, student labs and test benches on the other. Management also differs: Type 1 platforms are usually managed centrally across many hosts with tools such as VMware vCenter, while a Type 2 product is managed per PC through its own desktop window. For the exam, memorize two short lists: ESXi, Hyper-V and KVM are Type 1; VirtualBox and VMware Workstation are Type 2. If a question mentions bare metal or a data center, think Type 1; if it mentions a laptop or a host operating system, think Type 2.",
  },
  {
    kind: 'diagram',
    title: 'vNICs, the vSwitch and the trunk to the LAN',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      groups: [{ label: 'Virtualization host (ESXi)', x: 0.2, y: 0.3, w: 5.4, h: 4.8 }],
      nodes: [
        { id: 'v1', icon: 'vm', label: 'VM1', sub: 'VLAN 10', x: 1.2, y: 1.2 },
        { id: 'v2', icon: 'vm', label: 'VM2', sub: 'VLAN 10', x: 1.2, y: 2.8 },
        { id: 'v3', icon: 'vm', label: 'VM3', sub: 'VLAN 20', x: 1.2, y: 4.4 },
        { id: 'vs', icon: 'switch', label: 'vSwitch', sub: 'port groups', x: 4.2, y: 2.8, tone: 'accent' },
        { id: 'sw', icon: 'switch', label: 'SW1', sub: 'physical switch', x: 8.6, y: 2.8 },
      ],
      links: [
        { from: 'v1', to: 'vs', label: 'vNIC' },
        { from: 'v2', to: 'vs', label: 'vNIC' },
        { from: 'v3', to: 'vs', label: 'vNIC' },
        { from: 'vs', to: 'sw', fromLabel: 'vmnic0', toLabel: 'Gi1/0/5', label: '802.1Q trunk', style: 'thick', tone: 'accent' },
      ],
      annotations: [{ x: 7.2, y: 4.4, text: 'Trunk allows VLANs 10 and 20', tone: 'accent' }],
    },
    bullets: [
      'Each VM has one or more **vNICs** with their own MAC addresses',
      'The **vSwitch** is a software Layer 2 switch inside the hypervisor',
      'Port groups give vNICs a VLAN ID',
      'Physical NICs (**uplinks**) connect the vSwitch to the LAN',
      'So the switch port toward the host is a **trunk**',
    ],
    notes:
      "Now follow a VM's traffic. Each VM has one or more virtual NICs, and each vNIC connects to a port on a virtual switch inside the hypervisor. The vSwitch behaves like a simple Layer 2 switch: it forwards frames by MAC address between VMs on the same host, and it connects to the real network through one or more physical NICs, called uplinks; VMware names them vmnic0, vmnic1 and so on. VMs are placed into VLANs by assigning their virtual NIC to a port group that carries a VLAN ID, as VM1 and VM2 do for VLAN 10 and VM3 for VLAN 20 in the diagram. Because frames for several VLANs leave the host through the same physical NIC, the physical switch port it plugs into must be an 802.1Q trunk that allows those VLANs. Two VMs in the same VLAN on the same host talk through the vSwitch without ever touching the physical network. A typical vSwitch, VMware's for example, does not run spanning tree and never forwards frames from one uplink to another, so it cannot create a loop; that is why host-facing switch ports are usually configured as edge trunks.",
  },
  {
    kind: 'cli',
    title: 'The switch side: a trunk to the host',
    code: `SW1(config)# interface GigabitEthernet1/0/5
SW1(config-if)# description ESXi-HOST1 vmnic0
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
SW1(config-if)# spanning-tree portfast trunk
SW1(config-if)# end
SW1# show mac address-table interface GigabitEthernet1/0/5
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.56a1.0001    DYNAMIC     Gi1/0/5
  10    0050.56a1.0002    DYNAMIC     Gi1/0/5
  20    0050.56a1.0003    DYNAMIC     Gi1/0/5
Total Mac Addresses for this criterion: 3`,
    highlight: ['switchport mode trunk', 'switchport trunk allowed vlan 10,20', '0050.56'],
    caption: 'One physical port, three VM MAC addresses in two VLANs: the fingerprint of a virtualization host.',
    bullets: [
      'Host-facing port: **trunk** allowing the VM VLANs',
      'The switch learns every VM MAC on that one port',
      'VMware OUIs: 00:50:56 and 00:0C:29',
    ],
    notes:
      "Here is the physical switch side of that connection. The port facing the hypervisor host is configured as a static trunk that allows exactly the VLANs used by the port groups on the host, here VLANs 10 and 20. `spanning-tree portfast trunk` makes it an edge trunk that comes up immediately, which matters because the VMs should not wait through the spanning-tree states when the host reboots. The switch has no idea that virtual machines exist: all it sees is one port with many MAC addresses, and the MAC address table proves it. Three VMs appear on Gi1/0/5 in two VLANs, with addresses starting 0050.56, which is a VMware OUI (VMware also uses 000C.29; Hyper-V uses 00:15:5D and VirtualBox 08:00:27). Memorize this fingerprint for the exam: many MAC addresses and several VLANs on a single port, with virtual-machine vendor prefixes, means a virtualization host on a trunk. Also note the operational rule: if the allowed list lacks a VLAN used by a port group, the VMs in that port group simply have no network, and a VM that migrates to a host whose trunk does not carry its VLAN loses connectivity.",
  },
  {
    kind: 'table',
    title: 'Where does VM traffic go?',
    columns: ['Scenario', 'Path', 'Router needed?'],
    rows: [
      ['VM to VM, same host, same VLAN', 'vNIC, vSwitch, vNIC: never leaves the host', 'No'],
      ['VM to VM, different host, same VLAN', 'vSwitch, uplink, trunk, physical switch(es), other host', 'No'],
      ['VM to VM, different VLANs (even on one host)', 'Up the trunk to a router or Layer 3 switch, then back down', 'Yes: inter-VLAN routing'],
      ['VM to the Internet', 'Trunk, default gateway (SVI or router), WAN', 'Yes'],
      ['Live migration to another host', 'Same IP and MAC; both host trunks must carry the VM VLAN', 'No (same Layer 2 domain)'],
    ],
    caption: 'Traffic between two VMs on one host and VLAN can bypass the physical network entirely.',
    notes:
      "Where does a VM's traffic actually go? This table lists the cases the exam likes. When two VMs share a host and a VLAN, the vSwitch forwards the frame directly between their vNICs and it never reaches the physical network; this is fast, but it also means physical firewalls and IPS sensors do not see that traffic unless virtual security appliances are placed in the path. When the destination VM is on another host in the same VLAN, the frame leaves through the uplink, crosses the trunk and the physical switches, and enters the other host's uplink. When the two VMs are in different VLANs, even on the same host, the vSwitch does not route: the frame goes up the trunk to a router or Layer 3 switch, is routed, and comes back down the trunk in the other VLAN. Traffic to the Internet takes the same route to the default gateway. Finally, live migration keeps the VM's IP and MAC unchanged, so the destination host must be in the same Layer 2 domain, which is why the VM VLANs are trunked to every host in the cluster.",
  },
  {
    kind: 'table',
    title: 'Type 2 hypervisor networking modes',
    columns: ['Mode', 'VM address', 'Reaches LAN and Internet?', 'Reachable from the LAN?', 'Typical use'],
    rows: [
      ['**Bridged**', 'Own IP on the physical LAN (LAN DHCP)', 'Yes', 'Yes: appears as a separate host', 'VMs that others must reach'],
      ['**NAT**', 'Private address behind the host', 'Yes, translated to the host IP', 'No, unless port forwarding is set', 'Default for desktop hypervisors'],
      ['**Host-only**', 'Private address on a host-only network', 'No', 'Only the host and VMs on that network', 'Isolated test networks'],
    ],
    caption: 'Desktop hypervisors such as VirtualBox and VMware Workstation offer all three modes.',
    notes:
      "Desktop hypervisors give each VM a choice of how its virtual NIC connects to the outside world, and the three modes are worth knowing because lab setups depend on them. In bridged mode the vNIC is effectively plugged into the same physical LAN as the host: the VM gets its own address from the LAN's DHCP server, appears as a separate device, and can be reached by other machines. In NAT mode the hypervisor places the VM on a private network behind the host and translates its traffic to the host's own address; the VM can reach the LAN and the Internet, but nothing on the LAN can initiate a connection to it unless port forwarding is configured. NAT is the usual default because it works anywhere without extra IP addresses. In host-only mode the VM is attached to a private virtual network shared only with the host and other VMs on the same network, so it has no outside access at all, which is useful for isolated experiments. A question that says the VM must be reachable by other computers on the LAN is asking for bridged mode.",
  },
  {
    kind: 'diagram',
    title: 'Containers share the kernel',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'Virtual machines',
          layers: [
            { label: 'App + libraries', sub: 'in every VM' },
            { label: 'Guest OS', sub: 'own kernel per VM', tone: 'accent' },
            { label: 'Hypervisor' },
            { label: 'Server hardware', tone: 'muted' },
          ],
        },
        {
          title: 'Containers',
          layers: [
            { label: 'App + libraries', sub: 'packed in an image' },
            { label: 'Container engine', sub: 'for example Docker', tone: 'accent' },
            { label: 'Host OS', sub: 'one shared kernel' },
            { label: 'Server hardware', tone: 'muted' },
          ],
        },
      ],
    },
    caption: 'No hypervisor and no guest OS: that is why containers are lighter.',
    bullets: [
      'VM: full guest OS, boots in minutes, gigabytes',
      'Container: shares the host kernel, starts in seconds, megabytes',
      'Containers are built from **images**: app plus dependencies',
      'Trade-off: weaker isolation, one shared kernel',
    ],
    notes:
      "Containers virtualize at a different level. A VM virtualizes the hardware, so each VM needs a complete guest operating system with its own kernel. A container virtualizes the operating system: every container on a host shares the host's kernel and gets its own isolated view of processes, files and network interfaces, enforced by Linux features called namespaces, while cgroups limit the CPU and memory each container can use. A container packages only the application and its libraries and dependencies, so it is measured in megabytes rather than gigabytes and starts in seconds rather than minutes. Containers are created from images, which makes them portable: the same image runs identically on a laptop, a data center server or a cloud provider. The price is weaker isolation, because all containers depend on one shared kernel, and a limit on variety: a Linux container needs a Linux kernel, so you cannot mix operating systems on one host the way you can with VMs. In the diagram, count the layers: the container column has no hypervisor and no guest OS, which is exactly why containers are lighter.",
  },
  {
    kind: 'compare',
    title: 'Virtual machine versus container',
    left: {
      heading: 'Virtual machine',
      bullets: [
        'Own guest OS and kernel per VM',
        'Gigabytes; boots in minutes',
        'Strong isolation at the hypervisor boundary',
        'Can mix Windows and Linux on one host',
        'Managed with hypervisor tools such as vCenter',
      ],
    },
    right: {
      heading: 'Container',
      tone: 'accent',
      bullets: [
        'Shares the host OS kernel',
        'Megabytes; starts in seconds',
        'Lighter isolation: namespaces and cgroups',
        'Runs on a matching kernel (Linux containers need Linux)',
        'Built from images; run by Docker, orchestrated by Kubernetes',
      ],
    },
    notes:
      "This side-by-side view is the one to recall when a question asks which statement describes a container rather than a VM. Isolation: a VM is separated by the hypervisor and carries its own kernel, so a kernel bug in one guest stays in that guest; containers share one kernel, so a kernel-level flaw can affect all of them, although namespaces keep ordinary processes apart. Size and speed: a VM includes a whole OS and typically takes minutes to boot and gigabytes of disk; a container includes only the application layer and starts almost instantly. Density: a host can run many more containers than VMs. Flexibility: VMs can run different operating systems side by side, for example Windows and Linux; containers must match the host kernel family. Tooling: VMs are managed through hypervisor platforms such as vCenter or Hyper-V Manager, while containers are built and run by a container engine such as Docker and managed at scale by an orchestrator such as Kubernetes. Neither replaces the other: many organizations run containers inside VMs, getting the VM's isolation boundary and the container's agility together.",
  },
  {
    kind: 'cli',
    title: 'Docker in a few commands',
    code: `$ docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
nginx        latest    605c77e624dd   2 weeks ago   141MB
$ docker run -d -p 8080:80 --name web nginx
b9f3a2c1d4e7f8a0c5d6e1b2a3f4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6
$ docker ps
CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS         PORTS                  NAMES
b9f3a2c1d4e7   nginx   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   web
$ docker stop web
web`,
    highlight: ['-p 8080:80', '0.0.0.0:8080->80/tcp'],
    caption: 'Host port 8080 is published to port 80 inside the container.',
    bullets: [
      'An **image** is the read-only template; a **container** is a running instance',
      'Images live in a registry such as Docker Hub',
      '`-p host:container` publishes a port (a form of NAT)',
      'Docker builds images and runs containers on a host',
    ],
    notes:
      "Docker is the best-known container platform, and the CCNA only expects you to recognize its vocabulary, but a short transcript makes the vocabulary concrete. An image is a read-only template that contains the application and its dependencies; images are stored in a registry such as Docker Hub and listed locally with `docker images`. A container is a running instance of an image, started with `docker run`. The `-d` option runs it in the background, `--name web` gives it a readable name, and `-p 8080:80` publishes a port: connections to port 8080 on the host are forwarded to port 80 inside the container, which the `docker ps` output shows as `0.0.0.0:8080->80/tcp`. By default each container gets a private address on a virtual bridge, docker0, usually in 172.17.0.0/16, so outside clients reach it through the published port on the host's address, a form of NAT. Images are typically built from a text file called a Dockerfile, which lists the base image, the files to copy and the command to run. Remember the one-sentence summary: Docker builds and runs containers on a host.",
  },
  {
    kind: 'diagram',
    title: 'Kubernetes: orchestrating containers',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      groups: [{ label: 'Kubernetes cluster', x: 0.2, y: 0.3, w: 9.6, h: 4.8 }],
      nodes: [
        { id: 'cp', icon: 'controller', label: 'Control plane', sub: 'API server · scheduler · etcd', x: 5.0, y: 1.0, tone: 'accent' },
        { id: 'n1', icon: 'server', label: 'Worker node 1', x: 1.9, y: 2.8 },
        { id: 'n2', icon: 'server', label: 'Worker node 2', x: 5.0, y: 2.8 },
        { id: 'n3', icon: 'server', label: 'Worker node 3', x: 8.1, y: 2.8 },
        { id: 'p1', icon: 'container', label: 'Pod', sub: 'own IP address', x: 1.9, y: 4.5 },
        { id: 'p2', icon: 'container', label: 'Pod', sub: 'own IP address', x: 5.0, y: 4.5 },
        { id: 'p3', icon: 'container', label: 'Pod', sub: 'own IP address', x: 8.1, y: 4.5 },
      ],
      links: [
        { from: 'cp', to: 'n1' },
        { from: 'cp', to: 'n2', label: 'schedules pods' },
        { from: 'cp', to: 'n3' },
        { from: 'n1', to: 'p1' },
        { from: 'n2', to: 'p2' },
        { from: 'n3', to: 'p3' },
      ],
    },
    bullets: [
      '**Kubernetes** (K8s) orchestrates containers across a cluster of nodes',
      'It schedules pods, restarts failures and scales up or down',
      'A **pod** is the smallest unit: containers sharing one IP address',
      'A Service gives pods a stable address and load balancing',
      'Docker runs containers; Kubernetes manages them at scale',
    ],
    notes:
      "A single host running a few containers is easy to manage by hand; hundreds of containers across dozens of hosts are not. Kubernetes, often written K8s, is the open-source container orchestrator that automates that work. A Kubernetes cluster has a control plane, which holds the API server, the scheduler, the controllers and the cluster database, and a set of worker nodes that actually run the containers. You describe the desired state, for example 'run three copies of this web application', and Kubernetes places them on nodes with spare capacity, restarts any that fail, scales the number up or down with load, and rolls out new versions gradually. The smallest unit it manages is the pod: one or more tightly coupled containers that share a network namespace and therefore a single IP address; each pod gets its own address, and a Service object provides a stable address and load balancing in front of a group of pods. For the exam, keep the division of labor straight: Docker packages and runs containers, Kubernetes orchestrates many of them across many hosts.",
  },
  {
    kind: 'diagram',
    title: 'VRF: several routing tables on one router',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      groups: [
        { label: 'VRF RED', x: 0.2, y: 0.3, w: 3.2, h: 2.3 },
        { label: 'VRF BLUE', x: 0.2, y: 2.9, w: 3.2, h: 2.3 },
      ],
      nodes: [
        { id: 'a', icon: 'pc', label: 'Customer A host', sub: '10.0.0.10/24', x: 1.7, y: 1.4 },
        { id: 'b', icon: 'pc', label: 'Customer B host', sub: '10.0.0.10/24', x: 1.7, y: 3.9 },
        { id: 'r', icon: 'router', label: 'R1', sub: 'global + RED + BLUE tables', x: 5.4, y: 2.65, tone: 'accent' },
        { id: 'cl', icon: 'cloud', label: 'Core / WAN', sub: 'global table', x: 8.7, y: 2.65 },
      ],
      links: [
        { from: 'a', to: 'r', label: 'G0/0/1 · VRF RED' },
        { from: 'b', to: 'r', label: 'G0/0/2 · VRF BLUE' },
        { from: 'r', to: 'cl', label: 'G0/0/0' },
      ],
      annotations: [{ x: 5.4, y: 4.8, text: 'Same 10.0.0.0/24 in both VRFs: no conflict', tone: 'good' }],
    },
    bullets: [
      'A **VRF** is a separate routing and forwarding table on one router',
      'Each interface belongs to exactly one VRF (or the global table)',
      'Overlapping IP addresses in different VRFs do not conflict',
      'Nothing crosses VRFs unless you leak routes on purpose',
      'Uses: service providers, segmentation, management VRF',
    ],
    notes:
      "VLANs let one switch behave like several separate Layer 2 networks; a VRF does the same for a router at Layer 3. VRF stands for Virtual Routing and Forwarding. A router with VRFs keeps several independent routing tables, and independent forwarding tables, in one chassis. Each interface is assigned to exactly one VRF, or stays in the default global table, and packets arriving on that interface are looked up only in that VRF's table. The consequence that the exam loves is overlapping address space: in the diagram both customers use 10.0.0.0/24, and R1 serves both without conflict, because the two networks live in different routing tables. Nothing crosses from one VRF to another unless an administrator deliberately leaks routes between them. VRFs are the foundation of service providers' MPLS VPNs, where one network carries many customers, and enterprises use them to segment guests, IoT devices or payment systems, and to keep the management network, often the built-in Mgmt-vrf on Catalyst switches, apart from production traffic. A VRF is a Layer 3 concept; it does not create broadcast domains.",
  },
  {
    kind: 'cli',
    title: 'Configuring a VRF',
    code: `R1(config)# vrf definition RED
R1(config-vrf)# address-family ipv4
R1(config-vrf-af)# exit-address-family
R1(config-vrf)# exit
R1(config)# interface GigabitEthernet0/0/1
R1(config-if)# ip address 10.0.0.1 255.255.255.0
R1(config-if)# vrf forwarding RED
% Interface GigabitEthernet0/0/1 IPv4 disabled and address(es) removed due to enabling VRF RED
R1(config-if)# ip address 10.0.0.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ip route vrf RED 172.16.0.0 255.255.0.0 10.0.0.2`,
    highlight: ['vrf definition RED', 'vrf forwarding RED', 'address(es) removed', 'ip route vrf RED'],
    caption: 'Assign the VRF first, then the address: `vrf forwarding` wipes the interface IP address.',
    bullets: [
      '`vrf definition NAME` creates the VRF; legacy syntax is `ip vrf NAME`',
      '`vrf forwarding NAME` assigns the interface (legacy: `ip vrf forwarding`)',
      'Re-enter the IP address after assigning the VRF',
      'Routes inside a VRF use the `vrf` keyword',
    ],
    notes:
      "Configuring a VRF takes two steps: create it, then assign interfaces to it. The `vrf definition RED` command creates a multiprotocol VRF, and `address-family ipv4` enables IPv4 in it; IPv6 would be a second address family. Older configurations use the IPv4-only syntax `ip vrf RED` with `ip vrf forwarding RED` on the interface, and the exam may show either, so recognize both. On the interface, `vrf forwarding RED` places the interface in the VRF. Now study the trap shown in the transcript: the interface already had an address, and IOS removed it with a warning as soon as the VRF was applied, because the address would otherwise belong to a different routing table. The address must be configured again afterward, which is why the order is VRF first, address second. Routes inside a VRF are configured with the `vrf` keyword, as in `ip route vrf RED 172.16.0.0 255.255.0.0 10.0.0.2`; a plain `ip route` command would add the route to the global table. Dynamic routing protocols are made VRF-aware similarly, for example OSPF with `router ospf 10 vrf RED`.",
  },
  {
    kind: 'cli',
    title: 'Verifying a VRF',
    code: `R1# show vrf
  Name                             Default RD            Protocols   Interfaces
  BLUE                             <not set>             ipv4        Gi0/0/2
  RED                              <not set>             ipv4        Gi0/0/1
R1# show ip route 10.0.0.0
% Network not in table
R1# show ip route vrf RED

Routing Table: RED
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       ...
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.0.0/24 is directly connected, GigabitEthernet0/0/1
L        10.0.0.1/32 is directly connected, GigabitEthernet0/0/1
S     172.16.0.0/16 [1/0] via 10.0.0.2
R1# ping vrf RED 10.0.0.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.0.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`,
    highlight: ['show vrf', 'show ip route vrf RED', 'Routing Table: RED', 'ping vrf RED', '% Network not in table'],
    caption: 'Plain show ip route, ping and traceroute use the global table.',
    notes:
      "Verification commands all need to know which routing table you mean. `show vrf` lists each VRF with its default route distinguisher (not set here, because no MPLS is involved), its protocols and the interfaces assigned to it; an interface that is not listed is in the global table. `show ip route` without a keyword shows only the global table, so the 10.0.0.0 query returns 'Network not in table' even though the network is directly connected, because Gi0/0/1 belongs to RED. To see the RED table, add the vrf keyword: `show ip route vrf RED`, whose output begins with a 'Routing Table: RED' header line. The same rule applies to testing: `ping vrf RED 10.0.0.10` and `traceroute vrf RED ...` send the packets using the RED table, whereas a plain `ping 10.0.0.10` would search the global table and fail. Other useful commands are `show ip interface brief vrf RED` and `show ip arp vrf RED`, because even the ARP cache is per VRF. Many exam questions boil down to this one idea: if a route or a ping is missing, check whether the vrf keyword was forgotten.",
  },
  {
    kind: 'diagram',
    title: 'VRF-Lite: VRFs without MPLS',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5,
      nodes: [
        { id: 'a1', icon: 'pc', label: 'RED LAN 1', x: 1.0, y: 0.9 },
        { id: 'b1', icon: 'pc', label: 'BLUE LAN 1', x: 1.0, y: 4.0 },
        { id: 'r1', icon: 'router', label: 'R1', x: 3.5, y: 2.45, tone: 'accent' },
        { id: 'r2', icon: 'router', label: 'R2', x: 6.5, y: 2.45, tone: 'accent' },
        { id: 'a2', icon: 'pc', label: 'RED LAN 2', x: 9.0, y: 0.9 },
        { id: 'b2', icon: 'pc', label: 'BLUE LAN 2', x: 9.0, y: 4.0 },
      ],
      links: [
        { from: 'a1', to: 'r1', label: 'VRF RED' },
        { from: 'b1', to: 'r1', label: 'VRF BLUE' },
        { from: 'r1', to: 'r2', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', label: '.10 = RED · .20 = BLUE', style: 'thick', tone: 'accent' },
        { from: 'a2', to: 'r2', label: 'VRF RED' },
        { from: 'b2', to: 'r2', label: 'VRF BLUE' },
      ],
      annotations: [{ x: 5.0, y: 4.5, text: '802.1Q subinterfaces keep the VRFs apart', tone: 'muted' }],
    },
    bullets: [
      '**VRF-Lite** = VRFs without MPLS or MP-BGP',
      'Between VRF-aware routers: one subinterface per VRF',
      'Each VRF has its own static routes or IGP instance',
      'Example: `router ospf 10 vrf RED`',
      'An interface belongs to only one VRF',
    ],
    notes:
      "Full service-provider VPNs combine VRFs with MPLS and multiprotocol BGP, using route distinguishers and route targets to carry many customers across a shared core. VRF-Lite is the simplified version: VRFs without MPLS or MP-BGP. It is how an enterprise extends its segments across several routers. Because each VRF needs its own Layer 3 path, two VRF-aware routers connected by one physical link split it into one subinterface per VRF using 802.1Q encapsulation; in the diagram, subinterface .10 belongs to RED and .20 to BLUE, and each subinterface carries its own addressing and routing. Every VRF runs its own routing: static routes with the vrf keyword, or one routing protocol instance per VRF, such as `router ospf 10 vrf RED`. An interface can belong to only one VRF; to carry two VRFs over one link you need two subinterfaces. VRF-Lite scales to a limited number of VRFs because each one needs its own interfaces and protocol sessions, which is where MPLS becomes attractive. For the CCNA you only need the concept: separate routing tables, per-VRF interfaces, and trunked subinterfaces between routers.",
  },
  {
    kind: 'compare',
    title: 'VLAN versus VRF',
    left: {
      heading: 'VLAN (Layer 2)',
      bullets: [
        'Splits a switch into separate broadcast domains',
        'Identified by a VLAN ID in the 802.1Q tag',
        'Needs a router or Layer 3 switch to connect VLANs',
        '`switchport access vlan`, `show vlan brief`',
      ],
    },
    right: {
      heading: 'VRF (Layer 3)',
      tone: 'accent',
      bullets: [
        'Splits a router into separate routing tables',
        'Identified by a VRF name',
        'Allows overlapping IP address ranges',
        '`vrf forwarding`, `show vrf`, `show ip route vrf NAME`',
      ],
    },
    notes:
      "VLANs and VRFs both create virtual separation, which is why exam questions like to contrast them. A VLAN divides a switch into separate Layer 2 broadcast domains, identified by a number in the 802.1Q tag; a host in VLAN 10 cannot reach a host in VLAN 20 without a router or Layer 3 switch. A VRF divides a router into separate Layer 3 routing tables, identified by a name; it decides which routes a packet may use. They work together: a typical design maps each VLAN to a subnet, and each subnet to a VRF, so that, for example, the guest VLANs live in a VRF with no route to corporate networks. The same words can mean different things in different places, so read the question carefully. 'Multiple broadcast domains on one switch' is VLANs. 'Multiple routing tables on one router' and 'overlapping IP addresses' are VRFs. The commands differ too: `show vlan brief` and `switchport access vlan` for VLANs; `show vrf`, `vrf forwarding` and the vrf keyword in show and ping commands for VRFs. Neither technology encrypts anything; both are segmentation, not security by themselves.",
  },
  {
    kind: 'diagram',
    title: 'NFV: network functions as software',
    diagram: {
      type: 'topology',
      width: 10,
      height: 5.4,
      groups: [
        { label: 'Traditional: one box per function', x: 0.2, y: 0.3, w: 3.4, h: 4.8 },
        { label: 'NFV: functions as software', x: 4.2, y: 0.3, w: 5.6, h: 4.8 },
      ],
      nodes: [
        { id: 'hr', icon: 'router', label: 'Router', sub: 'hardware', x: 1.9, y: 1.1 },
        { id: 'hf', icon: 'firewall', label: 'Firewall', sub: 'hardware', x: 1.9, y: 2.8 },
        { id: 'hl', icon: 'box', label: 'Load balancer', sub: 'hardware', x: 1.9, y: 4.5 },
        { id: 'sv', icon: 'server', label: 'x86 server + hypervisor', sub: 'NFV infrastructure', x: 5.8, y: 2.8, tone: 'accent' },
        { id: 'v1', icon: 'vm', label: 'Virtual router', sub: 'VNF', x: 8.6, y: 1.1 },
        { id: 'v2', icon: 'vm', label: 'Virtual firewall', sub: 'VNF', x: 8.6, y: 2.8 },
        { id: 'v3', icon: 'vm', label: 'Virtual load balancer', sub: 'VNF', x: 8.6, y: 4.5 },
      ],
      links: [
        { from: 'sv', to: 'v1' },
        { from: 'sv', to: 'v2' },
        { from: 'sv', to: 'v3' },
      ],
    },
    bullets: [
      '**NFV** runs network functions as software (**VNFs**) on standard servers',
      'Examples: CSR 1000v / Catalyst 8000V router, virtual firewalls, Catalyst 9800-CL',
      'Benefits: faster deployment, lower hardware cost, scale on demand',
      'Cost: software may not match dedicated ASIC performance',
      'NFV is not SDN: SDN separates control and data planes',
    ],
    notes:
      "Network functions virtualization applies server virtualization to network devices themselves. Instead of buying a dedicated hardware router, firewall and load balancer, each with its own chassis, power supply and proprietary operating system, an operator runs those functions as software, called virtual network functions or VNFs, on standard x86 servers under a hypervisor. Cisco examples include the CSR 1000v virtual router, now sold as Catalyst 8000V, virtual firewalls such as the ASAv, and the Catalyst 9800-CL wireless controller you met earlier. The ETSI NFV model has three parts: the NFV infrastructure (servers, hypervisor and virtual networking), the VNFs themselves, and a management and orchestration layer that deploys, scales and chains them. The benefits are agility, because a new function is a deployment rather than a purchase, lower hardware cost, and on-demand scaling. The drawback is performance: software on general-purpose CPUs may not match purpose-built ASICs for throughput. Do not confuse NFV with SDN: NFV changes where a function runs, in software on servers, while SDN changes how devices are controlled, by separating the control plane from the data plane. The two complement each other.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps: virtualization',
    body: 'Most traps swap near neighbors: Type 1 and Type 2, VMs and containers, VLANs and VRFs.',
    bullets: [
      'ESXi, Hyper-V, KVM = **Type 1**; VirtualBox, Workstation = **Type 2**',
      'VMs have their own guest OS; containers **share the host kernel**',
      'Docker builds and runs containers; **Kubernetes** orchestrates them',
      'A switch port toward a host with VMs in several VLANs is a **trunk**',
      'Assign `vrf forwarding` **before** the IP address, or it is removed',
      'Plain `show ip route` and `ping` use the global table: add `vrf NAME`',
      'VLAN = Layer 2 separation; VRF = Layer 3 separation; NFV is not SDN',
    ],
    notes:
      "Virtualization questions are mostly vocabulary and one-line distinctions, so the traps are about mixing up near neighbors. Hypervisor types: ESXi, Hyper-V and KVM are Type 1 and run on the hardware; VirtualBox and VMware Workstation are Type 2 and run on a host OS. VMs versus containers: a VM has its own guest OS and kernel; containers share the host kernel and are lighter. Docker versus Kubernetes: Docker builds and runs containers; Kubernetes orchestrates them across a cluster. Networking: a switch port facing a host with VMs in several VLANs is a trunk, and the switch learns every VM MAC on that port; VMs on the same host and VLAN never touch the physical network. VRF commands: assign the interface with vrf forwarding before configuring the IP address, because the address is removed otherwise, and remember that show ip route, ping and traceroute use the global table unless you add vrf NAME. Finally VLAN versus VRF: VLANs segment Layer 2, VRFs segment Layer 3. And NFV is software network functions on standard servers, which is a different idea from SDN.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'A **hypervisor** shares one host among isolated VMs with virtual NICs',
      '**Type 1** runs on bare metal; **Type 2** runs on a host OS',
      'The vSwitch connects vNICs; the host uplink to the LAN is a **trunk**',
      '**Containers** share the kernel; Docker runs them, Kubernetes orchestrates',
      '**VRFs** give one router several routing tables; VRF-Lite needs no MPLS',
      '**NFV** runs routers and firewalls as software on standard servers',
    ],
    notes:
      "Let us recap. Server virtualization uses a hypervisor to share one host's hardware among isolated VMs, each with virtual hardware and a vNIC. Type 1 hypervisors (ESXi, Hyper-V, KVM) run on bare metal; Type 2 hypervisors (VirtualBox, VMware Workstation) run on a host OS. VM traffic passes through a vSwitch, and the physical switch port toward the host is a trunk carrying the VM VLANs. Containers virtualize the operating system instead: they share the host kernel, start fast and are built from images; Docker builds and runs them and Kubernetes orchestrates them across clusters. VRFs virtualize the router: separate routing tables, overlapping addresses, configured with vrf definition and vrf forwarding, inspected with show vrf and the vrf keyword in show and ping commands, and extended across routers with VRF-Lite subinterfaces. NFV runs routers, firewalls and other functions as software on standard servers. Together, these technologies are the foundation for the cloud and automation topics that follow in the course.",
  },
];
