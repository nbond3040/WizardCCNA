import type { Slide } from '../../types';

export const slides: Slide[] = [
  {
    kind: 'title',
    title: 'Cloud Computing',
    subtitle: 'NIST characteristics, service and deployment models, and how networks reach the cloud',
    notes:
      "Cloud computing is no longer a side topic for network engineers: the applications your users depend on increasingly live in someone else's data center, and your job is to connect, secure and monitor the paths to them. This deck covers the cloud objective on the CCNA blueprint (topic 1.2.f on v1.1, and the fundamentals domain on v2.0). You will learn the five NIST characteristics that define a cloud service, the three service models IaaS, PaaS and SaaS and who manages what in each, the deployment models public, private, community and hybrid plus multicloud, and the four ways to reach a cloud: Internet, Internet VPN, private WAN and an intercloud exchange. We finish with the trade-offs between on-premises and cloud, such as capital versus operating expense, control, scalability and latency, because the exam loves scenario questions built from exactly those ideas.",
  },
  {
    kind: 'bullets',
    title: 'Where the cloud fits',
    bullets: [
      'Cloud = on-demand computing delivered over a network by a provider',
      'Defined by NIST SP 800-145: 5 characteristics, 3 service models, 4 deployment models',
      'To a network engineer the cloud is a remote data center reached across the WAN',
      'Traffic shifts from branch-to-data-center toward users-to-Internet',
      'WAN capacity, resilience and security design now decide application performance',
    ],
    diagram: {
      type: 'topology',
      nodes: [
        { id: 'pc', icon: 'laptop', label: 'Users', x: 1, y: 2.5 },
        { id: 'rt', icon: 'router', label: 'Edge router', x: 3.2, y: 2.5 },
        { id: 'dc', icon: 'server', label: 'On-premises data center', x: 3.2, y: 4.2 },
        { id: 'net', icon: 'internet', label: 'Internet / WAN', x: 6, y: 2.5 },
        { id: 'cl', icon: 'cloud', label: 'Public cloud', sub: 'IaaS · PaaS · SaaS', x: 8.8, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'pc', to: 'rt' },
        { from: 'rt', to: 'dc' },
        { from: 'rt', to: 'net' },
        { from: 'net', to: 'cl' },
      ],
    },
    notes:
      "The NIST definition (Special Publication 800-145) describes cloud computing as on-demand network access to a shared pool of configurable resources that can be rapidly provisioned and released with minimal management effort. The word **network** is the key for us: nothing in the cloud is useful until packets get there. In the diagram, users sit behind an edge router that reaches both the traditional on-premises data center and a public cloud over the Internet or WAN. Historically most traffic flowed from users to the corporate data center, but as applications move to SaaS and IaaS, more traffic flows from users straight to the Internet. That changes WAN sizing, security placement and troubleshooting: the provider's data center is outside your control, so you manage the connection, the DNS, the routing and the monitoring, not the servers themselves. Keep this picture in mind; every later slide answers one question about it: what makes it a cloud, who manages what, who owns it, how do we connect, and what do we trade away?",
  },
  {
    kind: 'table',
    title: 'The five NIST characteristics',
    columns: ['Characteristic', 'Meaning', 'Telltale exam phrase'],
    rows: [
      ['**On-demand self-service**', 'Customer provisions resources without human interaction with the provider', 'Launch a VM from a portal or API'],
      ['**Broad network access**', 'Reachable over the network through standard mechanisms from many client types', 'Phones, tablets and laptops'],
      ['**Resource pooling**', 'Shared, multi-tenant capacity assigned and reassigned dynamically', 'Customer does not pick the physical host'],
      ['**Rapid elasticity**', 'Capacity scales out and in quickly, often automatically', 'Add servers for the sale, remove them after'],
      ['**Measured service**', 'Usage is metered, controlled and reported', 'Pay only for what you use'],
    ],
    notes:
      "NIST SP 800-145 lists five essential characteristics, and the exam uses short scenarios to test each. **On-demand self-service**: the customer provisions resources through a portal or API at any time without a human at the provider. **Broad network access**: capabilities are available over the network through standard mechanisms, so thin and thick clients such as phones, tablets and laptops can use them. **Resource pooling**: the provider serves many customers from a shared pool, a multi-tenant model, assigning and reassigning physical and virtual resources dynamically; customers typically cannot choose the exact physical host and may only pick a broad location such as a region. **Rapid elasticity**: capacity can be provisioned and released quickly, often automatically, in step with demand, so it appears unlimited. **Measured service**: the system meters usage, such as storage, processing and bandwidth, and reports it to both sides, which enables pay-per-use billing. Memorize the telltale phrases in the third column; most exam stems contain one of them almost word for word.",
  },
  {
    kind: 'diagram',
    title: 'From request to running VM',
    diagram: {
      type: 'sequence',
      actors: [
        { id: 'cu', label: 'Customer', icon: 'user' },
        { id: 'po', label: 'Cloud portal / API', icon: 'cloud' },
        { id: 'pl', label: 'Shared hosts', icon: 'hypervisor' },
        { id: 'me', label: 'Metering', icon: 'database' },
      ],
      steps: [
        { from: 'cu', to: 'po', label: 'Request 4 VMs', sub: 'on-demand self-service: no provider staff involved', tone: 'accent' },
        { from: 'po', to: 'pl', label: 'Allocate capacity from the pool', sub: 'resource pooling: shared multi-tenant hosts' },
        { from: 'pl', to: 'cu', label: 'VMs running within minutes' },
        { from: 'pl', to: 'me', label: 'Record vCPU-hours, GB stored, GB transferred', sub: 'measured service' },
        { note: 'The customer reaches the VMs from any laptop or phone: broad network access' },
      ],
    },
    caption: 'Four of the five NIST characteristics in one workflow.',
    notes:
      "This sequence shows several of the characteristics working together. A customer submits a request through the provider's web portal or API, asking for four virtual machines. No ticket and no phone call are needed, which is **on-demand self-service**. The orchestration layer then carves the capacity out of a large shared pool of hypervisor hosts that also serve other customers, which is **resource pooling** with multi-tenancy; the customer does not know or choose which physical server runs the VM. Within minutes the instances are running. From then on a metering system records consumption, such as vCPU-hours, gigabytes of storage and gigabytes transferred out, which is **measured service** and is the basis of the bill. Finally, the customer reaches the machines over the network from any laptop, phone or office, which is **broad network access**. When you read a scenario, ask which step of this sequence the sentence describes; that usually reveals the characteristic being tested.",
  },
  {
    kind: 'diagram',
    title: 'Rapid elasticity in action',
    diagram: {
      type: 'flow',
      direction: 'horizontal',
      nodes: [
        { id: 'a', label: 'Demand rises', sub: 'holiday sale', shape: 'pill' },
        { id: 'b', label: 'Autoscaler adds instances', sub: 'for example CPU above 70%' },
        { id: 'c', label: 'Load balancer spreads requests' },
        { id: 'd', label: 'Demand falls', shape: 'pill' },
        { id: 'e', label: 'Surplus instances removed', sub: 'billing stops', shape: 'round', tone: 'accent' },
      ],
    },
    caption: 'Scale out when demand rises, scale in when it falls; metering makes the saving visible.',
    notes:
      "**Rapid elasticity** means capacity expands and contracts quickly, often automatically, as demand changes. Follow the flow: demand rises, an autoscaling rule such as average CPU above 70 percent launches extra instances from a template, and a load balancer begins distributing requests across the larger group. When the surge ends, a lower threshold triggers termination of the surplus instances and the billing for them stops. This is **scale out** and **scale in**, adding or removing instances, as opposed to **scale up**, which makes one instance larger. Elasticity differs from plain scalability: a system can be scalable because an engineer can add capacity over weeks, but elasticity implies fast, usually automated adjustment in both directions. The benefit is avoiding both over-provisioning, which wastes money on idle hardware, and under-provisioning, which causes outages at peak. Notice how elasticity depends on measured service: because usage is metered, shrinking the footprint immediately reduces cost. Exam cue: a retailer handles holiday spikes without buying servers.",
  },
  {
    kind: 'table',
    title: 'IaaS, PaaS and SaaS',
    columns: ['Model', 'Provider delivers', 'You manage', 'Examples'],
    rows: [
      ['**IaaS**', 'Virtual machines, storage and networks', 'OS, middleware, runtime, data, applications', 'Amazon EC2, Azure Virtual Machines, Google Compute Engine'],
      ['**PaaS**', 'A platform to build and run apps: runtime, OS and infrastructure', 'Your application code and data', 'Azure App Service, Google App Engine, AWS Elastic Beanstalk'],
      ['**SaaS**', 'A complete application, usually in a browser', 'Your users, settings and content', 'Microsoft 365, Google Workspace, Salesforce, Cisco Webex'],
    ],
    caption: 'Typical customers: IaaS = system and network administrators; PaaS = developers; SaaS = end users.',
    notes:
      "The three service models differ in how much of the technology stack the provider manages. In **Infrastructure as a Service (IaaS)** the provider delivers virtualized compute, storage and networking; you install and manage the operating system, middleware, runtime, data and applications. Typical users are system and network administrators, and examples include Amazon EC2, Azure Virtual Machines and Google Compute Engine. In **Platform as a Service (PaaS)** the provider also runs the operating system and runtime, so developers deploy code and data only; examples are Azure App Service, Google App Engine and AWS Elastic Beanstalk. In **Software as a Service (SaaS)** the provider delivers a complete application, usually through a browser: Microsoft 365, Google Workspace, Salesforce and Cisco Webex. You manage users, configuration and your data. Cisco Meraki, with its cloud-managed switches, access points and security appliances, is another example of consuming management as a service. A fast rule: the more you want to customize low-level components, the closer you are to IaaS; the less you want to manage, the closer you are to SaaS.",
  },
  {
    kind: 'diagram',
    title: 'Who manages which layer?',
    diagram: {
      type: 'stack',
      columns: [
        {
          title: 'On-premises',
          layers: [
            { label: 'Applications' },
            { label: 'Data' },
            { label: 'Runtime & middleware' },
            { label: 'Operating system' },
            { label: 'Virtualization' },
            { label: 'Servers & storage' },
            { label: 'Networking' },
          ],
        },
        {
          title: 'IaaS',
          layers: [
            { label: 'Applications' },
            { label: 'Data' },
            { label: 'Runtime & middleware' },
            { label: 'Operating system' },
            { label: 'Virtualization', tone: 'accent' },
            { label: 'Servers & storage', tone: 'accent' },
            { label: 'Networking', tone: 'accent' },
          ],
        },
        {
          title: 'PaaS',
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
        {
          title: 'SaaS',
          layers: [
            { label: 'Applications', tone: 'accent' },
            { label: 'Data', sub: 'your content and access' },
            { label: 'Runtime & middleware', tone: 'accent' },
            { label: 'Operating system', tone: 'accent' },
            { label: 'Virtualization', tone: 'accent' },
            { label: 'Servers & storage', tone: 'accent' },
            { label: 'Networking', tone: 'accent' },
          ],
        },
      ],
    },
    caption: 'Highlighted layers are managed by the provider; plain layers are yours.',
    notes:
      "Read this stack column by column. On premises, you manage every layer from the network cabling up to the application. In **IaaS**, the provider owns networking, servers, storage and the virtualization layer; you start at the operating system, so you patch it, install middleware and the runtime, and deploy applications. In **PaaS**, the provider takes the operating system, middleware and runtime as well; you manage your application and its data. In **SaaS**, the provider manages the application itself too; what remains yours is the content you put in, who may access it, and how your users' devices are secured. The highlighted cells mark provider responsibility. The exam usually asks one of three questions: which model leaves the operating system to the customer (IaaS), which model lets developers focus only on code (PaaS), and which provides ready-to-use software (SaaS). Be careful with the word responsibility: even in SaaS you remain accountable for data governance and access control, as the next slide shows.",
  },
  {
    kind: 'bullets',
    title: 'What always stays with the customer',
    bullets: [
      'Provider: security **of** the cloud (facilities, hardware, hypervisor, core network)',
      'Customer: security **in** the cloud (configuration, data, access)',
      'Your **data** and its classification, wherever it is stored',
      'Your **identities and access**: accounts, roles, MFA, least privilege',
      'The **devices and networks** your people use to reach the service',
      'Correct configuration: open storage buckets and loose rules are customer errors',
    ],
    notes:
      "Moving to the cloud transfers operational work, not accountability. Cloud providers describe a **shared responsibility model**: the provider is responsible for security **of** the cloud, meaning the facilities, hardware, hypervisor and the core network, while the customer is responsible for security **in** the cloud. The line moves with the service model, but certain items never move: you remain responsible for your data, for deciding who can access it (identity, roles, MFA), for the devices people use to reach the service, and for configuring the services correctly. Many real breaches come from customer misconfiguration, such as a storage bucket left open to the Internet or an overly permissive security group, rather than from provider failures. Compliance follows the same pattern: the provider may hold certifications, but you must still prove that your own use meets regulations and that data is stored where it is allowed to be. In exam terms, any answer that says the provider alone is responsible for protecting customer data and user access is wrong.",
  },
  {
    kind: 'table',
    title: 'Deployment models',
    columns: ['Model', 'Who uses it', 'Owned and operated by', 'Example and trade-off'],
    rows: [
      ['**Public**', 'Many organizations; multi-tenant', 'A cloud provider, in its data centers', 'AWS, Azure, Google Cloud: pay as you go, least control'],
      ['**Private**', 'One organization, exclusively', 'The organization or a third party; on or off premises', 'VMware or OpenStack cloud: most control, highest cost'],
      ['**Community**', 'Organizations with shared concerns (mission, compliance)', 'One or more members, or a third party', 'Government or healthcare consortium: shared cost and rules'],
      ['**Hybrid**', 'One organization using private and public together', 'Distinct clouds bound by technology that allows portability', 'Private core plus public burst capacity: flexible, complex to integrate'],
      ['**Multicloud**', 'One organization using several public providers', 'Several providers', 'Compute at one, analytics at another: less lock-in, more complexity'],
    ],
    caption: 'NIST defines the first four; multicloud is a widely used industry term.',
    notes:
      "NIST defines four deployment models, and a fifth term, multicloud, is widely used in industry. A **public cloud** is owned and operated by a provider and offered to the general public or many organizations on shared multi-tenant infrastructure, with pay-as-you-go pricing. A **private cloud** serves exactly one organization; it can sit in the company's own data center or be hosted by a third party, because the word private describes exclusive use, not location. A **community cloud** is built for a specific group of organizations with shared concerns such as mission, security requirements or regulatory compliance, for example several agencies or hospitals. A **hybrid cloud** combines two or more distinct clouds, typically private plus public, bound together so workloads and data can move between them, for example to burst into the public cloud at peak times. **Multicloud** means using services from more than one public provider, to avoid lock-in or to pick the best service for each task. Hybrid and multicloud are not the same, and an organization can be both.",
  },
  {
    kind: 'diagram',
    title: 'Hybrid vs multicloud',
    diagram: {
      type: 'topology',
      nodes: [
        { id: 'dc', icon: 'server', label: 'Private cloud', sub: 'your data center', x: 1.6, y: 2.5, tone: 'accent' },
        { id: 'pa', icon: 'cloud', label: 'Public cloud A', sub: 'IaaS / PaaS', x: 6.2, y: 1 },
        { id: 'pb', icon: 'cloud', label: 'Public cloud B', sub: 'SaaS', x: 6.2, y: 4 },
      ],
      links: [
        { from: 'dc', to: 'pa', label: 'hybrid link: VPN or direct', style: 'thick' },
        { from: 'dc', to: 'pb', label: 'Internet', style: 'dotted' },
      ],
    },
    caption: 'Hybrid = private + public. Multicloud = two or more public providers. This company is both.',
    notes:
      "The diagram shows an organization that keeps a private cloud in its own data center and also consumes two public clouds. The thick link from the private cloud to Public cloud A is a hybrid connection: a VPN or a direct private circuit that lets workloads and data move between private and public infrastructure. A typical use is **cloud bursting**, where steady workloads run on premises and extra capacity is rented from the public cloud during peaks. Because the company also uses a second public provider, B, it is additionally running **multicloud**. A company with only one private data center and one public provider is hybrid but not multicloud; a company with two public providers and no private cloud is multicloud but not hybrid. This distinction is a favorite trap, so practice classifying small diagrams: count the private clouds, count the public providers, and decide which definitions are satisfied. Connectivity, identity integration and consistent security policy become the main challenges in both models.",
  },
  {
    kind: 'table',
    title: 'Four ways to connect to the cloud',
    columns: ['Option', 'How it works', 'Advantages', 'Drawbacks'],
    rows: [
      ['**Internet**', 'Public Internet to the provider endpoints, protected by TLS', 'Cheapest, fastest to start', 'No performance guarantee; shared paths'],
      ['**Internet VPN**', 'IPsec tunnel across the Internet to a provider VPN gateway', 'Encrypted, low cost, quick to deploy', 'Still best-effort latency and jitter'],
      ['**Private WAN**', 'Carrier MPLS or Ethernet WAN extended to the provider', 'SLA, QoS, predictable latency, off the Internet', 'Higher cost; slower to provision; not encrypted by default'],
      ['**Intercloud exchange**', 'Colocation hub where one connection reaches many providers', 'Private, high bandwidth, multicloud friendly', 'Needs a circuit to the exchange; extra cost'],
    ],
    caption: 'Provider direct-connect services include AWS Direct Connect, Azure ExpressRoute and Google Cloud Interconnect.',
    notes:
      "There are four classic ways to reach cloud resources. Plain **Internet** access to the provider's public endpoints is the cheapest and fastest to set up; traffic should be protected by TLS, but there is no performance guarantee. An **Internet VPN**, usually an IPsec tunnel to a virtual gateway in the provider's network, adds encryption and keeps private address space, yet still crosses the best-effort Internet, so latency and jitter vary. A **private WAN**, such as a carrier MPLS L3VPN or Ethernet WAN extended to the provider, keeps traffic off the public Internet and can offer an SLA and QoS, at a higher monthly cost; note that it is private but not automatically encrypted. An **intercloud exchange** is a provider-neutral colocation facility where a customer makes one connection and then reaches many cloud providers over private links; the providers' own services, such as AWS Direct Connect, Azure ExpressRoute and Google Cloud Interconnect, use this private-connection idea. Choose by requirement: cost, security, performance guarantee, or number of clouds.",
  },
  {
    kind: 'diagram',
    title: 'Reading the connection options',
    diagram: {
      type: 'topology',
      nodes: [
        { id: 'hq', icon: 'router', label: 'HQ router', x: 1.2, y: 2.5 },
        { id: 'isp', icon: 'internet', label: 'Internet', x: 4.6, y: 0.9 },
        { id: 'wan', icon: 'cloud', label: 'Carrier private WAN', sub: 'MPLS or Ethernet WAN', x: 4.6, y: 4.1 },
        { id: 'cp', icon: 'cloud', label: 'Cloud provider', x: 8.4, y: 2.5, tone: 'accent' },
      ],
      links: [
        { from: 'hq', to: 'isp', label: 'plain Internet', style: 'dotted' },
        { from: 'isp', to: 'cp', style: 'dotted' },
        { from: 'hq', to: 'cp', label: 'IPsec VPN', style: 'dashed' },
        { from: 'hq', to: 'wan', label: 'private circuit', style: 'thick' },
        { from: 'wan', to: 'cp', style: 'thick' },
      ],
    },
    caption: 'Top: plain Internet. Middle: encrypted VPN tunnel over the Internet. Bottom: private WAN with an SLA.',
    notes:
      "This picture places the options side by side. From the headquarters router, the top path crosses the public Internet to the provider; the dashed link in the middle is an IPsec VPN tunnel that rides the same Internet but is encrypted end to end; the bottom path is a carrier private WAN that connects to the provider's network without touching the public Internet. All three reach the same destination, so the question for an architect is which properties are required. If a stem says **predictable latency and an SLA**, choose the private WAN or a direct-connect circuit. If it says **encrypted and inexpensive**, choose the Internet VPN. If it says **quick start and lowest cost**, choose plain Internet. If it says **connect to several cloud providers through one facility**, choose an intercloud exchange. Many designs combine them: a private circuit for production traffic and an Internet VPN as backup, so that a single failure does not cut the company off from its cloud applications.",
  },
  {
    kind: 'table',
    title: 'On-premises vs cloud trade-offs',
    columns: ['Factor', 'On-premises', 'Public cloud'],
    rows: [
      ['**Cost model**', '**Capex**: buy hardware up front and depreciate it', '**Opex**: pay for usage, by the hour or per GB'],
      ['**Scalability**', 'Limited to purchased capacity; weeks to expand', 'Elastic; minutes to scale out and in'],
      ['**Speed to deploy**', 'Order, rack, cable and configure', 'Self-service portal or API'],
      ['**Control**', 'Full control of hardware, software and data location', 'Limited to what the provider exposes'],
      ['**Security and compliance**', 'You own every control', 'Shared responsibility; check data-residency rules'],
      ['**Latency**', 'Close to local users and systems', 'Depends on region distance and the WAN path'],
      ['**Staffing**', 'Your team patches and replaces hardware', 'Provider runs the infrastructure'],
    ],
    notes:
      "The decision between running your own infrastructure and using cloud is a bundle of trade-offs, not a right-or-wrong choice. Financially, on-premises equipment is **capital expenditure (capex)**: you buy hardware up front, depreciate it, and must size it for peak demand. Cloud services are **operating expenditure (opex)**: you pay for what you consume, with no big purchase, but the bill can grow quickly if usage is not governed. Cloud wins on speed and elasticity; on-premises wins on control, customization and predictable local performance, and it may be required when regulations demand that data stay in a specific place. Latency matters for the CCNA: application response depends on the distance to the provider's region and on the quality of the path, so test and choose regions near your users. Steady, predictable workloads can be cheaper on premises over many years, while spiky or experimental workloads usually favor cloud. Many organizations therefore end up hybrid, which links back to the deployment models.",
  },
  {
    kind: 'bullets',
    title: 'How cloud changes the network',
    bullets: [
      'Traffic shifts toward the Internet and cloud, away from the central data center',
      'Backhauling everything through HQ adds delay and uses costly WAN bandwidth',
      'Local Internet breakout with security in the path speeds up SaaS',
      'SD-WAN can steer each application over the best available path',
      'Plan redundancy: dual ISPs, backup VPN, resilient direct-connect links',
      'Monitor latency and loss to the cloud region, not just link status',
    ],
    diagram: {
      type: 'flow',
      direction: 'vertical',
      nodes: [
        { id: 'a', label: 'Branch user', shape: 'pill' },
        { id: 'b', label: 'SD-WAN edge router', sub: 'measures loss, delay, jitter' },
        { id: 'c', label: 'Policy picks best path', shape: 'diamond' },
        { id: 'd', label: 'Cloud application', shape: 'round', tone: 'accent' },
      ],
    },
    notes:
      "Cloud adoption changes network design in four ways. Traffic patterns shift: instead of branch users reaching a central data center, they reach SaaS and IaaS over the Internet, so backhauling all traffic through headquarters adds delay and consumes expensive WAN bandwidth. Security moves too: you need cloud-aware controls such as secure Internet gateways and consistent policy. Bandwidth and resilience planning become critical because the Internet or direct-connect link is now on the critical path of applications. Finally, visibility changes: you cannot place a packet capture on the provider's switches, so you monitor latency, loss and application response from your side. Software-defined WAN, which you will meet in the controller-based networking lesson, helps by measuring every available path and steering each application over the best one; Cisco SD-WAN features such as Cloud OnRamp are built for exactly this. For the exam, remember the direction: cloud pushes designs toward local Internet breakout and policy-driven path selection.",
  },
  {
    kind: 'steps',
    title: 'Decoding a cloud scenario',
    steps: [
      { title: 'Find the NIST characteristic', text: 'Portal, no phone call = self-service; auto add/remove = elasticity; usage bill = measured; shared hosts = pooling; any device = broad access' },
      { title: 'Pick the service model', text: 'You manage OS and up = IaaS; only code and data = PaaS; just use it = SaaS' },
      { title: 'Name the deployment model', text: 'One organization = private; open to many = public; shared mission = community; private + public = hybrid; several public vendors = multicloud' },
      { title: 'Choose the connection', text: 'Cheap = Internet; encrypted = VPN; SLA = private WAN; many clouds = intercloud exchange' },
    ],
    notes:
      "Use this four-step routine on scenario questions. First, look for the **NIST characteristic** hidden in the wording: a portal and no phone call, access from phones and laptops, shared multi-tenant hardware, instances added and removed automatically, or a usage-based bill. Second, decide the **service model** by asking what the customer still manages: the operating system and above means IaaS, only code and data means PaaS, and nothing but using the application means SaaS. Third, name the **deployment model**: exclusive to one organization is private, open to many customers is public, shared by organizations with common requirements is community, private plus public linked together is hybrid, and several public providers is multicloud. Fourth, if networking is involved, choose the **connection method** from the requirement: cheapest, encrypted, guaranteed performance, or many clouds. The exam rarely asks anything harder than these decisions; mistakes come from rushing past one keyword, such as reading private as on-premises when it really means exclusive use.",
  },
  {
    kind: 'callout',
    tone: 'exam',
    title: 'Exam traps',
    body: 'Cloud questions are won or lost on **one keyword**: metering vs scaling, exclusive vs on-premises, hybrid vs multicloud.',
    bullets: [
      '**Measured service** = metering and pay-per-use; automatic grow and shrink = **rapid elasticity**',
      '**Private** cloud means exclusive use; it can be hosted by a third party',
      '**Hybrid** = private + public; two public providers = **multicloud**',
      'IaaS: you manage the OS; PaaS: provider does; SaaS: you only use the app',
      'Even in SaaS the customer owns **data, identities and endpoint security**',
      'Private WAN = SLA but not encrypted by default; Internet VPN = encrypted but no SLA',
      'Moving to cloud shifts **capex to opex**; it does not remove WAN design work',
    ],
    notes:
      "The classic traps in this topic are about vocabulary. Measured service is about metering and pay-per-use, not about automatic scaling; automatic growth and shrinkage is rapid elasticity. On-demand self-service is about the customer acting without provider staff, not about speed alone. Resource pooling means shared multi-tenant capacity, not a dedicated server for each customer. Private cloud means exclusive use by one organization and can be hosted by a third party. Hybrid means private plus public; two public providers is multicloud. In IaaS the customer manages the operating system; in PaaS the provider does; and in SaaS the customer manages neither, yet still owns data and access decisions. A private WAN gives performance guarantees but is not encrypted by default, while an Internet VPN is encrypted but gives no guarantee. Finally, moving to the cloud turns capex into opex, it does not remove the customer's security duties, and it does not remove the need for good WAN design. When two answers look right, find the keyword that separates them.",
  },
  {
    kind: 'bullets',
    title: 'Summary',
    bullets: [
      'Five NIST characteristics: self-service, broad access, pooling, elasticity, measured',
      'IaaS = you run the OS; PaaS = you run the code; SaaS = you use the app',
      'Public, private, community, hybrid (private + public), multicloud (several public)',
      'Connect via Internet, Internet VPN, private WAN or an intercloud exchange',
      'Cloud trades capex for opex and control for speed and elasticity',
      'Latency, WAN design and shared responsibility still matter',
    ],
    notes:
      "Pull the topic together in one pass. NIST says a cloud service has five characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity and measured service. The service models describe the split of responsibility: with IaaS you run the operating system and above, with PaaS you run your code and data, and with SaaS you simply use the application. The deployment models describe who owns and shares the cloud: public, private, community and hybrid, with multicloud meaning more than one public provider. Networks connect to the cloud over the Internet, an Internet VPN, a private WAN or an intercloud exchange, trading cost against security and guaranteed performance. Compared with on-premises, cloud turns capital expense into operating expense and gives elasticity and speed, but you give up some control, depend on your WAN, and still own data and access security. Before the quiz, try explaining each of those five sentences aloud without looking; any you cannot explain are worth another pass through the matching slide.",
  },
];
