import type { Flashcard, Question } from '../../types';

export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'The five NIST cloud characteristics', back: 'On-demand self-service, broad network access, resource pooling, rapid elasticity, measured service.' },
  { id: 'f2', front: 'NIST definition of cloud computing (short)', back: 'On-demand network access to a **shared pool** of configurable resources that can be rapidly provisioned and released with minimal management effort.' },
  { id: 'f3', front: 'On-demand self-service', back: 'The customer provisions resources through a portal or API **without human interaction** with the provider.' },
  { id: 'f4', front: 'Broad network access', back: 'Services are available over the network through standard mechanisms from many client types (phones, tablets, laptops).' },
  { id: 'f5', front: 'Resource pooling', back: 'Provider capacity is shared by many customers (**multi-tenant**) and assigned dynamically; the customer does not choose the physical host.' },
  { id: 'f6', front: 'Rapid elasticity', back: 'Capacity is added and removed quickly, often **automatically**, as demand changes, so it seems unlimited.' },
  { id: 'f7', front: 'Measured service', back: 'Resource usage is **metered** and reported, enabling pay-per-use billing and chargeback.' },
  { id: 'f8', front: 'Multi-tenancy', back: 'Many customers (tenants) share the same physical infrastructure while their data and workloads stay logically separated.' },
  { id: 'f9', front: 'Scale out vs scale up', back: '**Scale out** adds more instances (horizontal); **scale up** makes one instance larger (vertical). Elasticity usually means scaling out and in.' },
  { id: 'f10', front: 'IaaS', back: 'Infrastructure as a Service: virtual compute, storage and network. The customer manages the **OS**, middleware, runtime, data and apps. Example: Amazon EC2.' },
  { id: 'f11', front: 'PaaS', back: 'Platform as a Service: the provider runs OS and runtime; the customer manages only **application code and data**. Example: Google App Engine.' },
  { id: 'f12', front: 'SaaS', back: 'Software as a Service: a complete application delivered over the network. Examples: Microsoft 365, Salesforce, Cisco Webex.' },
  { id: 'f13', front: 'Who patches the operating system in IaaS, PaaS and SaaS?', back: 'IaaS: the **customer**. PaaS: the **provider**. SaaS: the **provider**.' },
  { id: 'f14', front: 'What always stays with the cloud customer?', back: 'Its **data**, its **identities and access** decisions, its endpoint devices, and correct service configuration (shared responsibility model).' },
  { id: 'f15', front: 'Public cloud', back: 'Provider-owned, multi-tenant infrastructure offered to many organizations, pay as you go. Examples: AWS, Azure, Google Cloud.' },
  { id: 'f16', front: 'Private cloud', back: 'Cloud used **exclusively by one organization**. It may be on premises or hosted by a third party.' },
  { id: 'f17', front: 'Community cloud', back: 'Cloud shared by organizations with common concerns such as mission, security or compliance needs (for example government agencies).' },
  { id: 'f18', front: 'Hybrid cloud', back: 'Two or more distinct clouds, typically **private + public**, linked so workloads and data can move between them.' },
  { id: 'f19', front: 'Multicloud', back: 'Using services from **more than one public cloud provider** to avoid lock-in or use best-of-breed services. Not the same as hybrid.' },
  { id: 'f20', front: 'Cloud bursting', back: 'Running steady workloads on premises and temporarily using public-cloud capacity during demand peaks (a hybrid use case).' },
  { id: 'f21', front: 'Four ways to connect to the cloud', back: 'Public **Internet**, **Internet VPN**, **private WAN** (MPLS or Ethernet WAN), and an **intercloud exchange**.' },
  { id: 'f22', front: 'Internet VPN to a cloud provider', back: 'An IPsec tunnel over the Internet to a provider VPN gateway: **encrypted and inexpensive**, but with no latency guarantee.' },
  { id: 'f23', front: 'Private WAN to the cloud', back: 'Carrier MPLS or Ethernet WAN extended to the provider: **SLA, QoS and predictable latency**, higher cost, not encrypted by default.' },
  { id: 'f24', front: 'Intercloud exchange', back: 'A provider-neutral colocation hub: one connection gives private access to **many cloud providers**.' },
  { id: 'f25', front: 'Provider direct-connect services', back: 'AWS Direct Connect, Azure ExpressRoute and Google Cloud Interconnect: private dedicated links to the provider.' },
  { id: 'f26', front: 'Capex vs opex', back: '**Capex** = up-front purchase of assets (on-premises hardware). **Opex** = ongoing pay-for-use spending (cloud services).' },
  { id: 'f27', front: 'Main cloud trade-off against on-premises control', back: 'Cloud gives speed and elasticity; on-premises gives full **control**, customization and local data placement.' },
  { id: 'f28', front: 'What drives latency to a cloud application?', back: 'Distance to the provider region, the number of hops and the quality of the connection (Internet vs private link).' },
  { id: 'f29', front: 'Cisco examples: SaaS and cloud-managed networking', back: 'Cisco Webex is SaaS collaboration. Cisco Meraki is cloud-managed networking (switches, APs and security managed from a cloud dashboard).' },
  { id: 'f30', front: 'Elasticity vs scalability', back: 'Scalability is the ability to grow; **elasticity** adds fast, usually automatic scaling in **both** directions.' },
];

export const quiz: Question[] = [
  {
    id: 'q1',
    type: 'single',
    stem: 'Which NIST characteristic lets a customer create virtual machines without contacting the provider\'s staff?',
    options: ['Resource pooling', 'On-demand self-service', 'Measured service', 'Broad network access'],
    answer: 1,
    difficulty: 1,
    explanation:
      'On-demand self-service means the customer provisions resources through a portal or API on their own. Resource pooling is shared multi-tenant capacity, measured service is metering and billing, and broad network access is availability from many client types.',
  },
  {
    id: 'q2',
    type: 'multi',
    stem: 'Which two services are examples of SaaS? (Choose two.)',
    options: ['Amazon EC2', 'Microsoft 365', 'Google App Engine', 'Cisco Webex', 'Azure Virtual Machines'],
    answers: [1, 3],
    difficulty: 1,
    explanation:
      'Microsoft 365 and Cisco Webex are complete applications delivered as a service. Amazon EC2 and Azure Virtual Machines are IaaS, and Google App Engine is PaaS.',
  },
  {
    id: 'q3',
    type: 'single',
    stem: 'In which service model does the customer manage the operating system but not the hypervisor or hardware?',
    options: ['SaaS', 'PaaS', 'IaaS', 'Community cloud'],
    answer: 2,
    difficulty: 1,
    explanation:
      'IaaS provides virtualized infrastructure and leaves the OS, middleware, runtime, data and applications to the customer. In PaaS and SaaS the provider also runs the OS, and community cloud is a deployment model, not a service model.',
  },
  {
    id: 'q4',
    type: 'match',
    stem: 'Match each deployment model with its description.',
    pairs: [
      { left: 'Public cloud', right: 'Shared provider infrastructure open to many customers' },
      { left: 'Private cloud', right: 'Used exclusively by one organization' },
      { left: 'Community cloud', right: 'Shared by organizations with common requirements' },
      { left: 'Hybrid cloud', right: 'Private and public clouds linked together' },
    ],
    difficulty: 1,
    explanation:
      'Public clouds serve many customers, private clouds serve a single organization, community clouds serve a group with shared concerns, and hybrid clouds combine private and public clouds.',
  },
  {
    id: 'q5',
    type: 'input',
    stem: 'What term describes spending on ongoing, usage-based cloud services rather than up-front hardware purchases? (four letters)',
    answers: ['opex', 'operating expense', 'operating expenditure', 'operational expenditure'],
    placeholder: 'Four-letter term',
    difficulty: 1,
    explanation:
      '**Opex** (operating expenditure) covers pay-as-you-go spending such as cloud services. Capex (capital expenditure) is the up-front purchase of assets like servers and switches.',
  },
  {
    id: 'q6',
    type: 'single',
    stem: 'Which connection to a cloud provider keeps traffic off the public Internet and can include an SLA?',
    options: ['Plain Internet access', 'An IPsec VPN over the Internet', 'A private WAN such as MPLS', 'A public Wi-Fi hotspot'],
    answer: 2,
    difficulty: 2,
    explanation:
      'A carrier private WAN (MPLS or Ethernet WAN) is separate from the public Internet and typically carries an SLA. Plain Internet access and an Internet VPN both cross the best-effort Internet, and a hotspot is not a business-grade option.',
  },
  {
    id: 'q7',
    type: 'single',
    stem: 'A company runs workloads in its own data center and also in a public cloud, with the two connected. What is this deployment called?',
    options: ['Hybrid cloud', 'Community cloud', 'Multicloud', 'Private cloud only'],
    answer: 0,
    difficulty: 2,
    explanation:
      'Private plus public clouds bound together is a hybrid cloud. Multicloud would require more than one public provider, community cloud is shared by organizations with common concerns, and private-only ignores the public component.',
  },
  {
    id: 'q8',
    type: 'single',
    stem: 'Which is a common disadvantage of public cloud compared with on-premises infrastructure?',
    options: [
      'Slower provisioning of new computing capacity',
      'Large up-front purchases of servers and storage',
      'Less control over the underlying infrastructure',
      'No ability to scale down when demand drops',
    ],
    answer: 2,
    difficulty: 2,
    explanation:
      'The customer must accept the controls the provider exposes. Public cloud provisions quickly, avoids up-front hardware purchases (capex) and scales down easily; those are advantages, not drawbacks.',
  },
];
