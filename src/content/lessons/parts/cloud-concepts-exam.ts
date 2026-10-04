import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'Employees reach a SaaS application from company laptops, personal phones and tablets using a standard web browser. Which NIST characteristic does this illustrate?',
    options: ['Broad network access', 'Resource pooling', 'Rapid elasticity', 'On-demand self-service'],
    answer: 0,
    difficulty: 1,
    explanation:
      "Access from many client types through standard mechanisms is **broad network access**. Resource pooling is shared multi-tenant capacity, rapid elasticity is fast automatic scaling, and on-demand self-service is provisioning without provider staff; none of them describes the variety of client devices.",
  },
  {
    id: 'e2',
    type: 'single',
    stem: 'Refer to the exhibit. Which NIST characteristic does this monthly provider report best demonstrate?',
    exhibit: {
      kind: 'table',
      columns: ['Resource', 'Usage', 'Rate', 'Charge'],
      rows: [
        ['Virtual machine (4 vCPU)', '312 hours', '$0.20 per hour', '$62.40'],
        ['Block storage', '500 GB-months', '$0.08 per GB-month', '$40.00'],
        ['Data transfer out', '1,200 GB', '$0.09 per GB', '$108.00'],
        ['**Total**', '', '', '**$210.40**'],
      ],
    },
    options: ['On-demand self-service', 'Rapid elasticity', 'Measured service', 'Resource pooling'],
    answer: 2,
    difficulty: 2,
    explanation:
      'The provider meters compute hours, storage and data transfer and prices each unit, which is **measured service**. Rapid elasticity would be shown by capacity changing automatically with demand, resource pooling by shared multi-tenant hardware, and on-demand self-service by the customer provisioning without provider staff; the report shows none of those directly.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: "During a holiday sale an online retailer's web tier automatically grows from 6 to 40 instances, then shrinks back when traffic subsides. Which NIST characteristic is this?",
    options: ['Resource pooling', 'Rapid elasticity', 'Measured service', 'On-demand self-service'],
    answer: 1,
    difficulty: 2,
    explanation:
      "Capacity that expands and contracts quickly and automatically with demand is **rapid elasticity**. Measured service explains why the bill follows usage but is not the scaling behavior, resource pooling is about shared multi-tenant capacity, and on-demand self-service describes a customer requesting resources without provider staff, not an automatic rule.",
  },
  {
    id: 'e4',
    type: 'multi',
    stem: "A company's staff create virtual servers on their own through a web console or API and then manage those servers from laptops and phones. Which two NIST characteristics does this describe? (Choose two.)",
    options: ['On-demand self-service', 'Shared resource pooling', 'Measured pay-per-use', 'Broad network access', 'Rapid elastic scaling'],
    answers: [0, 3],
    difficulty: 2,
    explanation:
      'Creating servers through a console or API without provider staff is **on-demand self-service**, and managing them from laptops and phones over standard protocols is **broad network access**. Nothing in the scenario mentions shared tenancy, metering or automatic scaling, so resource pooling, measured service and rapid elasticity are not described.',
  },
  {
    id: 'e5',
    type: 'match',
    stem: 'Match each NIST cloud characteristic to its description.',
    pairs: [
      { left: 'On-demand self-service', right: 'Customer provisions resources without provider staff' },
      { left: 'Broad network access', right: 'Reachable over the network from many client types' },
      { left: 'Resource pooling', right: 'Shared multi-tenant capacity assigned dynamically' },
      { left: 'Rapid elasticity', right: 'Capacity scales out and in quickly with demand' },
      { left: 'Measured service', right: 'Usage is metered and reported' },
    ],
    difficulty: 1,
    explanation:
      'These are the five essential characteristics from NIST SP 800-145. Keep the key phrase for each one: no provider staff, many client types, shared multi-tenant pool, scale out and in, and metered usage.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Which cloud service model gives the customer control of the operating system while the provider manages the physical hardware and the hypervisor?',
    options: ['SaaS', 'PaaS', 'Private cloud', 'IaaS'],
    answer: 3,
    difficulty: 1,
    explanation:
      '**IaaS** delivers virtualized infrastructure and leaves the OS and everything above it to the customer. PaaS puts the OS under provider control, SaaS delivers a finished application, and private cloud is a deployment model rather than a service model.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. Plain layers are managed by the customer and highlighted layers by the provider. Which service model does the exhibit represent?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'stack',
        columns: [
          {
            title: 'Service model',
            layers: [
              { label: 'Applications' },
              { label: 'Data' },
              { label: 'Runtime & middleware', tone: 'accent' },
              { label: 'Operating system', tone: 'accent' },
              { label: 'Virtualization', tone: 'accent' },
              { label: 'Servers & storage', tone: 'accent' },
              { label: 'Networking', tone: 'accent' },
            ],
          },
        ],
      },
    },
    options: ['IaaS', 'PaaS', 'SaaS', 'An on-premises data center'],
    answer: 1,
    difficulty: 2,
    explanation:
      'The customer manages only the application and its data while the provider runs runtime, middleware, OS and everything beneath: that is **PaaS**. IaaS would leave the runtime, middleware and OS plain, SaaS would also highlight the application, and an on-premises data center would have no highlighted layers.',
  },
  {
    id: 'e8',
    type: 'categorize',
    stem: 'Classify each product by its cloud service model.',
    categories: ['IaaS', 'PaaS', 'SaaS'],
    items: [
      { text: 'Amazon EC2', category: 0 },
      { text: 'Google Compute Engine', category: 0 },
      { text: 'Azure App Service', category: 1 },
      { text: 'Google App Engine', category: 1 },
      { text: 'Microsoft 365', category: 2 },
      { text: 'Salesforce', category: 2 },
    ],
    difficulty: 2,
    explanation:
      'EC2 and Compute Engine rent virtual machines (IaaS). App Service and App Engine run customer code on a managed platform (PaaS). Microsoft 365 and Salesforce are complete applications (SaaS).',
  },
  {
    id: 'e9',
    type: 'match',
    stem: 'Match each scenario to the deployment model it describes.',
    pairs: [
      { left: 'A bank runs a cloud only for its own business units, in its own data center', right: 'Private cloud' },
      { left: 'Several hospitals jointly operate a cloud built for the same health-data regulations', right: 'Community cloud' },
      { left: 'A retailer keeps core systems on premises and rents provider capacity during sales', right: 'Hybrid cloud' },
      { left: 'A startup runs everything on a shared provider platform billed by usage', right: 'Public cloud' },
    ],
    difficulty: 2,
    explanation:
      'Exclusive use by one organization is private; a consortium with common requirements is community; private plus public linked together (cloud bursting) is hybrid; a shared multi-tenant provider platform is public.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Which deployment model does this design represent?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'dc', icon: 'server', label: 'Private cloud', sub: 'company data center', x: 2, y: 2.5 },
          { id: 'pc', icon: 'cloud', label: 'Public cloud', sub: 'one provider', x: 8, y: 2.5 },
        ],
        links: [{ from: 'dc', to: 'pc', label: 'IPsec VPN', style: 'dashed' }],
      },
    },
    options: ['Public cloud', 'Community cloud', 'Multicloud', 'Hybrid cloud'],
    answer: 3,
    difficulty: 2,
    explanation:
      'A private cloud connected to a public cloud is a **hybrid cloud**. Multicloud would require two or more public providers, a public cloud alone has no private part, and a community cloud is shared by organizations with common concerns.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. The company runs workloads in two different public cloud providers and has no private cloud. Which term describes this design?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'hq', icon: 'router', label: 'HQ network', x: 1.8, y: 2.5 },
          { id: 'pa', icon: 'cloud', label: 'Provider A', sub: 'public IaaS', x: 7, y: 1 },
          { id: 'pb', icon: 'cloud', label: 'Provider B', sub: 'public SaaS', x: 7, y: 4 },
        ],
        links: [
          { from: 'hq', to: 'pa', label: 'Internet VPN', style: 'dashed' },
          { from: 'hq', to: 'pb', label: 'Internet', style: 'dotted' },
        ],
      },
    },
    options: ['Multicloud', 'Hybrid cloud', 'Community cloud', 'Private cloud'],
    answer: 0,
    difficulty: 3,
    explanation:
      'Using more than one public provider is **multicloud**. Hybrid cloud requires a private (or community) cloud bound to a public one, and there is none here; the HQ network is just a customer site, not a cloud. Neither community nor private cloud is described.',
  },
  {
    id: 'e12',
    type: 'single',
    stem: 'Refer to the exhibit. Traffic to the cloud provider is latency-sensitive and the company requires an SLA. Which path should it use?',
    exhibit: {
      kind: 'diagram',
      diagram: {
        type: 'topology',
        nodes: [
          { id: 'hq', icon: 'router', label: 'HQ router', x: 1.2, y: 2.5 },
          { id: 'isp', icon: 'internet', label: 'Internet', x: 4.6, y: 0.9 },
          { id: 'wan', icon: 'cloud', label: 'Carrier WAN', sub: 'MPLS', x: 4.6, y: 4.1 },
          { id: 'cp', icon: 'cloud', label: 'Cloud provider', x: 8.4, y: 2.5 },
        ],
        links: [
          { from: 'hq', to: 'isp', label: 'Path 1', style: 'dotted' },
          { from: 'isp', to: 'cp', style: 'dotted' },
          { from: 'hq', to: 'cp', label: 'Path 2: IPsec VPN', style: 'dashed' },
          { from: 'hq', to: 'wan', label: 'Path 3', style: 'thick' },
          { from: 'wan', to: 'cp', style: 'thick' },
        ],
      },
    },
    options: [
      'Path 1, the plain Internet path',
      'Path 2, the IPsec VPN over the Internet',
      'Path 3, the carrier private WAN',
      'Any path, because they all carry the same guarantees',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'The carrier private WAN (path 3) is the one that can offer an SLA, QoS and predictable latency. The IPsec VPN adds encryption but still rides the best-effort Internet, plain Internet access offers no guarantee, and the paths clearly differ in the guarantees they provide.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements about connecting to a cloud provider are true? (Choose two.)',
    options: [
      'A private WAN connection encrypts cloud traffic by default using IPsec',
      'An intercloud exchange reaches several cloud providers over one connection',
      'Plain Internet access to a cloud provider includes a latency SLA',
      'An Internet VPN encrypts traffic but cannot guarantee latency',
      'Direct-connect circuits are carried over the shared public Internet',
    ],
    answers: [1, 3],
    difficulty: 3,
    explanation:
      'An intercloud exchange is a provider-neutral meeting point, so one private connection can reach many clouds, and an IPsec VPN protects data in transit but still depends on best-effort Internet paths. Private WANs are private but not automatically encrypted, plain Internet access has no latency SLA, and direct-connect services are dedicated private links rather than public Internet paths.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: "Refer to the exhibit. Choosing Option B instead of Option A mainly changes the company's spending from which model to which?",
    exhibit: {
      kind: 'table',
      columns: ['Aspect', 'Option A: new data center', 'Option B: public cloud'],
      rows: [
        ['Payment', 'Servers and switches bought up front', 'Billed monthly based on usage'],
        ['Capacity', 'Fixed at purchase; expansion takes weeks', 'Adjusted at any time through a portal'],
        ['Maintenance', 'Own staff replace failed hardware', 'Provider maintains the hardware'],
      ],
    },
    options: [
      'Capital expenditure toward operating expenditure',
      'Operating expenditure toward capital expenditure',
      'Variable cost toward fixed cost',
      'Shared cost toward exclusive cost',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Option A is an up-front hardware purchase (capex) while Option B is billed by usage (opex), so the move is from capex toward opex. The reverse direction describes buying hardware instead of renting, and usage-based billing makes cost more variable, not more fixed.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. A US-based branch uses the same application hosted in two cloud regions, and users say the second region is far slower. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `C:\\> ping app-us.example.com
Pinging app-us.example.com [203.0.113.20] with 32 bytes of data:
Reply from 203.0.113.20: bytes=32 time=18ms TTL=54
Reply from 203.0.113.20: bytes=32 time=19ms TTL=54
Reply from 203.0.113.20: bytes=32 time=18ms TTL=54

C:\\> ping app-ap.example.com
Pinging app-ap.example.com [198.51.100.40] with 32 bytes of data:
Reply from 198.51.100.40: bytes=32 time=212ms TTL=47
Reply from 198.51.100.40: bytes=32 time=214ms TTL=47
Reply from 198.51.100.40: bytes=32 time=211ms TTL=47`,
    },
    options: [
      'The second region uses an IaaS model while the first region uses PaaS',
      'The lower TTL value shows that the provider is silently dropping packets',
      'The second region is much farther away, adding propagation delay and more hops',
      'Measured service is throttling traffic to the second region for billing',
    ],
    answer: 2,
    difficulty: 3,
    explanation:
      'Both regions answer every ping, but the round trip is about 18 ms versus about 212 ms. Latency to a cloud region is driven mainly by distance and path length, and the lower TTL simply reflects more hops. The service model does not add 200 ms, a lower TTL does not mean packets are dropped (they are answered), and measured service meters usage rather than throttling traffic. The fix is to use a region closer to the users.',
  },
  {
    id: 'e16',
    type: 'order',
    stem: 'Place the steps of an autoscaling event in the correct order.',
    items: [
      'Demand on the web tier rises above the scaling threshold',
      'The autoscaler launches additional instances from the same template',
      'The load balancer begins sending requests to the new instances',
      'Demand falls below the lower threshold',
      'The surplus instances are terminated and their metering stops',
    ],
    difficulty: 2,
    explanation:
      'Scale-out comes first: the threshold is crossed, instances launch, and the load balancer starts using them. After demand falls, the scale-in rule removes the extra instances, and billing for them ends, which is the combination of rapid elasticity and measured service.',
  },
  {
    id: 'e17',
    type: 'multi',
    stem: 'A company adopts a SaaS application. Which two responsibilities still belong to the customer? (Choose two.)',
    options: [
      'Patching the application servers run by the provider',
      'Maintaining the hypervisor that runs the application',
      'Deciding which users can access the service and its data',
      'Replacing failed physical disks in the data center',
      'Securing the endpoint devices used to reach the service',
    ],
    answers: [2, 4],
    difficulty: 3,
    explanation:
      'Under the shared responsibility model the customer always owns identity and access decisions, its data, and the security of the devices it uses. The provider patches the application servers, maintains the hypervisor and replaces failed disks.',
  },
  {
    id: 'e18',
    type: 'single',
    stem: 'A startup wants to deploy a web application without managing servers, operating systems or runtime patches, while keeping control of its own code and data. Which service model fits, and who patches the operating system?',
    options: [
      'IaaS; the startup patches the operating system',
      'PaaS; the provider patches the operating system',
      'SaaS; the provider patches the operating system',
      'PaaS; the startup patches the operating system',
    ],
    answer: 1,
    difficulty: 3,
    explanation:
      'PaaS lets developers deploy their own code and data on a platform whose operating system and runtime are managed by the provider. IaaS would leave OS patching to the startup, SaaS would mean using someone else\'s finished application rather than running its own code, and PaaS with customer patching contradicts the stated requirement.',
  },
  {
    id: 'e19',
    type: 'multi',
    stem: 'Which two statements about a private cloud are true? (Choose two.)',
    options: [
      'It serves a single organization exclusively',
      'It can be hosted on premises or by a third party',
      'It must be built without virtualization',
      'Its resources are shared with unrelated customers',
      'It cannot be connected to a public cloud',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Private describes exclusive use, not location, so a third party may host it. Private clouds normally rely on virtualization, are not shared with unrelated customers (that would make them public), and can be connected to a public cloud to form a hybrid cloud.',
  },
  {
    id: 'e20',
    type: 'input',
    stem: 'Enter the NIST term for the ability to add and remove capacity quickly, often automatically, as demand changes.',
    answers: ['rapid elasticity', 'elasticity'],
    placeholder: 'Two words',
    difficulty: 1,
    explanation:
      '**Rapid elasticity** is the NIST characteristic. Measured service is metering, resource pooling is shared capacity, and on-demand self-service is provisioning without provider staff.',
  },
  {
    id: 'e21',
    type: 'categorize',
    stem: 'Classify each item as capital expenditure or operating expenditure.',
    categories: ['Capex', 'Opex'],
    items: [
      { text: 'Buying servers and storage arrays outright', category: 0 },
      { text: 'Monthly pay-per-use invoice for virtual machines', category: 1 },
      { text: 'Depreciated over several years', category: 0 },
      { text: 'Cost rises and falls with consumption', category: 1 },
      { text: 'Large up-front purchase of switches for a new data center', category: 0 },
      { text: 'Subscription to a SaaS collaboration service', category: 1 },
    ],
    difficulty: 2,
    explanation:
      'Capex is spending on assets that are bought up front and depreciated, such as servers and switches. Opex is ongoing, usage- or subscription-based spending, which is how cloud and SaaS services are billed.',
  },
];
