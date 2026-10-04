import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Which statement describes a Type 1 hypervisor?',
    options: [
      'It runs as an application on top of a desktop operating system',
      'It lets containers share one host kernel',
      'It runs directly on the server hardware without a host operating system',
      'It creates multiple routing tables on one router',
    ],
    answer: 2,
    difficulty: 1,
    explanation:
      'A **Type 1** (bare-metal) hypervisor is installed directly on the hardware, as with ESXi, Hyper-V and KVM. Running as an application on a desktop OS describes Type 2, kernel sharing describes containers, and multiple routing tables describe VRFs.',
  },
  {
    id: 'e2',
    type: 'categorize',
    stem: 'Drag each product to the correct hypervisor type.',
    categories: ['Type 1 (bare metal)', 'Type 2 (hosted)'],
    items: [
      { text: 'VMware ESXi', category: 0 },
      { text: 'Microsoft Hyper-V', category: 0 },
      { text: 'KVM', category: 0 },
      { text: 'Oracle VirtualBox', category: 1 },
      { text: 'VMware Workstation', category: 1 },
      { text: 'VMware Fusion', category: 1 },
    ],
    difficulty: 1,
    explanation:
      'ESXi, Hyper-V and KVM run directly on server hardware and are Type 1. VirtualBox, VMware Workstation and VMware Fusion are desktop applications that run on a host OS, which makes them Type 2.',
  },
  {
    id: 'e3',
    type: 'input',
    stem: 'Which interface configuration command assigns a router interface to a VRF named RED that was created with the vrf definition command? (Enter the full command.)',
    answers: ['vrf forwarding RED'],
    placeholder: 'command',
    difficulty: 2,
    explanation:
      '`vrf forwarding RED` in interface configuration mode places the interface in VRF RED. Remember that it removes any IP address already configured on the interface, so the address is entered afterwards.',
  },
  {
    id: 'e4',
    type: 'multi',
    stem: 'Which two are benefits of server virtualization? (Choose two.)',
    options: [
      'Better use of physical hardware through consolidation',
      'Each VM is guaranteed its own dedicated physical NIC',
      'Faster provisioning of new servers from templates and clones',
      'The physical host is no longer a single point of failure',
      'Guest operating systems no longer need their own licenses',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      '**Consolidation** and **fast provisioning** are core benefits. VMs normally share physical NICs through a vSwitch, a failing host still takes all of its VMs down unless clustering is added, and guest operating systems still need licenses.',
  },
  {
    id: 'e5',
    type: 'single',
    stem: 'Refer to the exhibit. VM1 and VM2 are attached to port groups in VLANs 10 and 20 on the host. Which configuration belongs on SW1 interface Gi1/0/5?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.2,
        nodes: [
          { id: 'sw', icon: 'switch', label: 'SW1', x: 1.6, y: 2.1 },
          { id: 'h', icon: 'hypervisor', label: 'ESXi-HOST1', sub: 'vSwitch0 · uplink vmnic0', x: 5.2, y: 2.1, tone: 'accent' },
          { id: 'v1', icon: 'vm', label: 'VM1', sub: 'port group VLAN 10', x: 8.6, y: 0.9 },
          { id: 'v2', icon: 'vm', label: 'VM2', sub: 'port group VLAN 20', x: 8.6, y: 3.3 },
        ],
        links: [
          { from: 'sw', to: 'h', fromLabel: 'Gi1/0/5', toLabel: 'vmnic0' },
          { from: 'h', to: 'v1' },
          { from: 'h', to: 'v2' },
        ],
      },
    },
    options: [
      'switchport mode access\nswitchport access vlan 10',
      'switchport mode trunk\nswitchport trunk allowed vlan 10,20',
      'no switchport\nip address 10.1.1.1 255.255.255.0',
      'switchport mode access\nswitchport access vlan 20',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'Both VLANs share the single uplink vmnic0, so frames for VLANs 10 and 20 must cross the same link: an **802.1Q trunk** that allows both. Either access-port option strands one of the VMs, and a routed port carries no VLAN-tagged frames at all.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. VM1 in VLAN 10 communicates normally, but VM2, attached to a port group in VLAN 20 on the same host, cannot reach any other device. What is the cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show running-config interface GigabitEthernet1/0/5
Building configuration...

Current configuration : 119 bytes
!
interface GigabitEthernet1/0/5
 description ESXi-HOST1 vmnic0
 switchport access vlan 10
 switchport mode access
end`,
    },
    options: [
      'The vSwitch on the host does not support VLAN 20 on its port groups',
      'VM2 must be moved to a Type 2 hypervisor that supports VLAN tagging',
      'The port must be configured as a routed port with an IP address for VLAN 20',
      'The host-facing port is an access port in VLAN 10, so VLAN 20 is not carried',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      'An access port carries a single VLAN, so VM1 (VLAN 10) works and VM2 (VLAN 20) does not. Reconfigure the port as a **trunk** that allows VLANs 10 and 20. The vSwitch can place VMs in any VLAN, the hypervisor type is irrelevant, and a routed port would carry no VLANs at all.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. What does the MAC address table indicate about the device connected to Gi1/0/5?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show mac address-table interface GigabitEthernet1/0/5
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.56a1.0001    DYNAMIC     Gi1/0/5
  10    0050.56a1.0002    DYNAMIC     Gi1/0/5
  20    0050.56a1.0003    DYNAMIC     Gi1/0/5
  20    000c.2912.7a40    DYNAMIC     Gi1/0/5
Total Mac Addresses for this criterion: 4`,
    },
    options: [
      'A virtualization host whose VMs use VMware MAC addresses in two VLANs on a trunk',
      'An unmanaged hub with several physical PCs sharing one access port and VLAN',
      'A single PC with four physical network cards bridged behind one switch port',
      'A lightweight access point in local mode serving client WLANs in two VLANs',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The prefixes **0050.56** and **000C.29** are VMware OUIs, and four MAC addresses in two VLANs on one port can only be a trunk to a virtualization host. A hub or a PC with several NICs would not show VMware addresses in different VLANs, and a local-mode AP would show only its own MAC address because client frames are tunneled.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each VM communication by whether the traffic must cross the physical network.',
    categories: ['Stays inside the host', 'Crosses the physical network'],
    items: [
      { text: 'VM1 to VM2 on the same host and in the same VLAN', category: 0 },
      { text: 'VM1 to VM3 attached to the same port group on the same host', category: 0 },
      { text: 'VM1 to a VM in the same VLAN on another host', category: 1 },
      { text: 'VM1 to a VM in a different VLAN on the same host', category: 1 },
      { text: 'VM1 to a server on the Internet', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'A vSwitch forwards frames between VMs of the same VLAN on the same host internally. Traffic to another host leaves through the uplink, and traffic between VLANs, even on one host, must be routed by a Layer 3 device on the physical network because the vSwitch does not route.',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each desktop hypervisor networking mode to its behavior.',
    pairs: [
      { left: 'Bridged', right: 'The VM gets its own address on the physical LAN and appears as a separate host' },
      { left: 'NAT', right: 'The VM shares the host address through translation and is hidden from the LAN' },
      { left: 'Host-only', right: 'The VM can talk only to the host and other VMs on that private network' },
    ],
    difficulty: 1,
    explanation:
      'Bridged mode attaches the VM directly to the LAN, NAT hides it behind the host\'s address, and host-only isolates it on a private virtual network with no outside access.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Which statement correctly compares containers with virtual machines?',
    options: [
      'Containers each run their own guest operating system kernel',
      'Containers provide stronger isolation than VMs because each has its own hypervisor',
      'Containers share the host operating system kernel, so they are lighter and start faster than VMs',
      'Containers can run only on a Type 2 hypervisor',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'Containers **share the host kernel**, which makes them small and quick to start. VMs are the ones with a guest kernel and a hypervisor boundary (stronger isolation), and containers need a container engine rather than any hypervisor type.',
  },
  {
    id: 'e11',
    type: 'multi',
    stem: 'Which two statements about Docker and Kubernetes are true? (Choose two.)',
    options: [
      'Kubernetes is a Type 1 hypervisor that runs on bare metal',
      'Docker builds images and runs containers on a host',
      'A Kubernetes pod is a VM that runs its own guest OS',
      'Kubernetes schedules and scales containers across a cluster',
      'Docker creates VRFs on routers to separate tenant traffic',
    ],
    answers: [1, 3],
    difficulty: 2,
    explanation:
      'Docker **builds images and runs containers**, while Kubernetes **orchestrates** containers across a cluster. Kubernetes is not a hypervisor, a pod holds containers (not a VM), and Docker has nothing to do with router VRFs.',
  },
  {
    id: 'e12',
    type: 'order',
    stem: 'Put the steps for deploying a containerized application in the correct order.',
    items: [
      'Write a Dockerfile that describes the application',
      'Build an image from the Dockerfile',
      'Push the image to a registry',
      'Pull the image onto the host',
      'Run a container from the image',
    ],
    difficulty: 2,
    explanation:
      'The Dockerfile defines the image, `docker build` creates it, `docker push` publishes it to a registry, and any host can then `docker pull` it and `docker run` a container from it.',
  },
  {
    id: 'e13',
    type: 'single',
    stem: 'Refer to the exhibit. An engineer moved Gi0/0/1 into VRF RED, and the interface now has no IP address. Why?',
    exhibit: {
      kind: 'cli',
      text: `R1# show running-config interface GigabitEthernet0/0/1
Building configuration...

Current configuration : 90 bytes
!
interface GigabitEthernet0/0/1
 vrf forwarding RED
 no ip address
 negotiation auto
end`,
    },
    options: [
      'The VRF was created without an IPv4 address family configured on it',
      'Entering vrf forwarding on an interface removes its existing IPv4 address',
      'VRF RED does not allow the address 10.0.0.1 on a routed interface',
      'The interface was moved to the global routing table instead of VRF RED',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'IOS **removes the IPv4 address** when `vrf forwarding` is applied, because the address would otherwise belong to another routing table, and prints a warning. Configure the address again after the VRF assignment. A missing address family would not remove an existing address, VRFs accept any address, and the exhibit clearly shows the interface is in VRF RED.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Refer to the exhibit. R1 must route for two customers that both use 10.0.0.0/24 on separate interfaces. Which feature makes this possible?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'ca', icon: 'pc', label: 'Customer A', sub: '10.0.0.0/24', x: 1.4, y: 1.0 },
          { id: 'cb', icon: 'pc', label: 'Customer B', sub: '10.0.0.0/24', x: 1.4, y: 3.0 },
          { id: 'r', icon: 'router', label: 'R1', x: 5.0, y: 2.0, tone: 'accent' },
          { id: 'cl', icon: 'cloud', label: 'Provider core', x: 8.6, y: 2.0 },
        ],
        links: [
          { from: 'r', to: 'ca', fromLabel: 'G0/0/1' },
          { from: 'r', to: 'cb', fromLabel: 'G0/0/2' },
          { from: 'r', to: 'cl', fromLabel: 'G0/0/0' },
        ],
      },
    },
    options: [
      'Secondary IP addresses on one interface',
      'Proxy ARP',
      'Two VLANs on the router interfaces',
      'VRFs, one per customer',
    ],
    answer: 3,
    difficulty: 2,
    explanation:
      'A separate **VRF** per customer gives each its own routing table, so identical prefixes do not conflict. Secondary addresses and proxy ARP still use one routing table, and VLANs separate Layer 2 broadcast domains, not routing tables.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. Gi0/0/1 (10.0.0.1/24) is the only interface with an address in 10.0.0.0/24. Why does the first ping fail while the second succeeds?',
    exhibit: {
      kind: 'cli',
      text: `R1# ping 10.0.0.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.0.10, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)
R1# ping vrf RED 10.0.0.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.0.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`,
    },
    options: [
      'Gi0/0/1 is in VRF RED, so the destination is reachable only through the RED table',
      'The host 10.0.0.10 has a firewall that blocks ICMP from the global table',
      'ICMP echo requests are blocked by an ACL applied to the interface in VRF RED',
      'The default 100-byte ping exceeds the MTU of the interface in the global table',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'A plain `ping` searches the **global** routing table, which has no route to 10.0.0.0/24 because that network lives in VRF RED. Adding `vrf RED` makes the router use the RED table, and the ping succeeds. The other options invent filtering or MTU problems that the successful second ping disproves.',
  },
  {
    id: 'e16',
    type: 'multi',
    stem: 'Which two statements about VRFs are true? (Choose two.)',
    options: [
      'Each VRF has its own routing table',
      'All VRFs share one routing table but use different administrative distances',
      'The same IP address range can be used in different VRFs',
      'A VRF creates a separate Layer 2 broadcast domain',
      'VRFs require MPLS to function',
    ],
    answers: [0, 2],
    difficulty: 2,
    explanation:
      'A VRF is a separate **routing table**, which is why **overlapping address ranges** are allowed. VRFs do not share a table, they separate Layer 3 (not Layer 2 broadcast domains, which are VLANs), and VRF-Lite works without MPLS.',
  },
  {
    id: 'e17',
    type: 'order',
    stem: 'Put the steps for placing a router interface in a VRF in the correct order.',
    items: [
      'Create the VRF with vrf definition RED',
      'Enter interface configuration mode',
      'Assign the interface with vrf forwarding RED',
      'Configure the IP address on the interface',
      'Verify with show vrf and show ip route vrf RED',
    ],
    difficulty: 2,
    explanation:
      'The VRF must exist before an interface can join it. Because `vrf forwarding` removes any existing IP address, the address is configured after the assignment, and the result is verified with the VRF-aware show commands.',
  },
  {
    id: 'e18',
    type: 'match',
    stem: 'Match each term to its definition.',
    pairs: [
      { left: 'NFV', right: 'Running network functions as software on standard servers' },
      { left: 'VNF', right: 'A network function packaged as software, such as a virtual firewall' },
      { left: 'vSwitch', right: 'A software Layer 2 switch inside the hypervisor' },
      { left: 'Container image', right: 'Packaged app and dependencies used to start containers' },
      { left: 'Pod', right: 'Smallest deployable Kubernetes unit, sharing one IP address' },
    ],
    difficulty: 1,
    explanation:
      'NFV is the approach, VNFs are the individual software functions, the vSwitch connects vNICs inside a hypervisor, an image is the template for containers, and a pod is Kubernetes\' smallest unit of deployment.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements describe NFV? (Choose two.)',
    options: [
      'Network functions like routers and firewalls run as software on servers',
      'It separates the control plane from the data plane of network devices',
      'It creates multiple virtual routing tables on one physical router',
      'Examples include a virtual router and a virtual firewall as VNFs',
      'Each function requires a dedicated ASIC-based hardware appliance',
    ],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      '**NFV** moves network functions into software (**VNFs**) running on general-purpose servers. Separating control and data planes is SDN, multiple routing tables are VRFs, and dedicated ASICs describe the traditional hardware approach that NFV replaces.',
  },
  {
    id: 'e20',
    type: 'single',
    stem: 'Refer to the exhibit. R1 and R2 must carry the RED and BLUE customer traffic over the single link between them, keeping the customers in separate routing tables and without MPLS. Which design is correct?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        width: 10,
        height: 4.6,
        nodes: [
          { id: 'a1', icon: 'pc', label: 'RED site 1', x: 1.0, y: 0.9 },
          { id: 'b1', icon: 'pc', label: 'BLUE site 1', x: 1.0, y: 3.7 },
          { id: 'r1', icon: 'router', label: 'R1', x: 3.4, y: 2.3, tone: 'accent' },
          { id: 'r2', icon: 'router', label: 'R2', x: 6.6, y: 2.3, tone: 'accent' },
          { id: 'a2', icon: 'pc', label: 'RED site 2', x: 9.0, y: 0.9 },
          { id: 'b2', icon: 'pc', label: 'BLUE site 2', x: 9.0, y: 3.7 },
        ],
        links: [
          { from: 'a1', to: 'r1' },
          { from: 'b1', to: 'r1' },
          { from: 'r1', to: 'r2', fromLabel: 'G0/0/0', toLabel: 'G0/0/0', label: 'single link' },
          { from: 'a2', to: 'r2' },
          { from: 'b2', to: 'r2' },
        ],
      },
    },
    options: [
      'One physical interface in the global table with two secondary addresses',
      'One subinterface per VRF with 802.1Q encapsulation, each assigned to its VRF',
      'Two VLANs on the physical interface with no VRF configuration on the subinterfaces',
      'One interface assigned to both VRFs with two vrf forwarding commands',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'This is **VRF-Lite**: split the link into 802.1Q **subinterfaces**, one per VRF, and put each in its VRF with `vrf forwarding`. Secondary addresses stay in the global table, VLAN tags alone do not create separate routing tables, and an interface can belong to only one VRF, so the second `vrf forwarding` command would replace the first.',
  },
  {
    id: 'e21',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement is true?',
    exhibit: {
      kind: 'cli',
      text: `R1# show vrf
  Name                             Default RD            Protocols   Interfaces
  BLUE                             <not set>             ipv4        Gi0/0/2
  RED                              <not set>             ipv4        Gi0/0/1
                                                                     Gi0/0/3`,
    },
    options: [
      'Gi0/0/1 and Gi0/0/3 are in VRF RED, separate from the BLUE VRF of Gi0/0/2',
      'Gi0/0/2 and Gi0/0/3 belong to the same VRF and share one routing table',
      'Gi0/0/0 belongs to VRF RED along with Gi0/0/1 and Gi0/0/3 in the same table',
      'RED and BLUE share one routing table with different administrative distances',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The Interfaces column shows Gi0/0/1 and Gi0/0/3 in **RED** and Gi0/0/2 in **BLUE**, each VRF with its own routing table. Gi0/0/0 is not listed, so it is in the global table, and VRFs never share one table. A Default RD that is not set means no route distinguisher is configured, which is normal for VRF-Lite.',
  },
  {
    id: 'e22',
    type: 'single',
    stem: 'A running VM is live-migrated from HOST1 to HOST2 and keeps its IP and MAC address. Which network condition makes this possible?',
    options: [
      'HOST1 and HOST2 must place the VM in different VLANs and route between them',
      'The VM must be powered off during the move and then restarted on HOST2',
      'The VM VLAN must be trunked to both hosts so the VM stays in the same Layer 2 domain',
      'Both hosts must run Type 2 hypervisors installed on a desktop operating system',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Because the IP and MAC addresses stay the same, the VM must remain in the **same VLAN and Layer 2 domain**, so the VLAN has to be trunked to both hosts. Different VLANs would change the subnet, a powered-off move is a cold migration rather than live migration, and live migration is a feature of data center (Type 1) platforms.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. Gi0/0/1 is configured with 10.0.0.1/24, yet show ip route does not list the network. Why?',
    exhibit: {
      kind: 'cli',
      text: `R1# show ip route 10.0.0.0
% Network not in table
R1# show running-config interface GigabitEthernet0/0/1
Building configuration...

Current configuration : 110 bytes
!
interface GigabitEthernet0/0/1
 vrf forwarding RED
 ip address 10.0.0.1 255.255.255.0
 negotiation auto
end`,
    },
    options: [
      'The interface is administratively shut down, so no connected route exists',
      'show ip route lists only the static routes that an administrator configured',
      'A network statement for 10.0.0.0/24 is missing from the routing process',
      'The interface is in VRF RED, so its route appears only with show ip route vrf RED',
    ],
    answer: 3,
    difficulty: 3,
    explanation:
      '`show ip route` displays only the **global** table, and the interface belongs to VRF RED, so its connected route is in the RED table: use `show ip route vrf RED`. The exhibit shows no shutdown command, `show ip route` lists every route type, and connected networks need no network statement.',
  },
  {
    id: 'e24',
    type: 'single',
    stem: 'Which statement correctly contrasts VLANs and VRFs?',
    options: [
      'VLANs separate Layer 2 broadcast domains; VRFs separate Layer 3 routing tables',
      'VLANs separate Layer 3 routing tables; VRFs separate Layer 2 broadcast domains',
      'Both technologies separate only Layer 2 broadcast domains on a switch or a router',
      'VLANs require MPLS labels to forward frames; VRFs require 802.1Q trunks',
    ],
    answer: 0,
    difficulty: 1,
    explanation:
      '**VLANs** virtualize a switch at Layer 2 (broadcast domains), and **VRFs** virtualize a router at Layer 3 (routing tables). Swapping the roles is backwards, claiming that both only separate Layer 2 domains ignores VRFs, and neither technology depends on the other\'s protocol: VLANs use 802.1Q tags and VRFs work with or without MPLS.',
  },
];
