import type { LessonContent } from '../types';

const lesson: LessonContent = {
  id: 'stp-protection',
  slides: [
    {
      kind: 'title',
      title: 'PortFast & STP Protection',
      subtitle: 'Fast edge ports, and the four guards that keep the tree the way you designed it',
      notes:
        "Spanning tree protects the network from loops, but the tree itself needs protecting. Access ports wait up to 30 seconds before forwarding, which breaks DHCP and network boot; a user can plug in a switch that joins the tree or even becomes the root; and a failing fiber can silently stop BPDUs so that a blocked port opens into a loop. Cisco provides a feature for each problem. **PortFast** makes access ports forward immediately. **BPDU Guard** shuts down an edge port that receives a BPDU. **BPDU Filter** stops BPDUs from being sent and, in one form, from being processed. **Root Guard** prevents a port from becoming a root port, and **Loop Guard** prevents a port that stops hearing BPDUs from becoming designated. You will learn the configuration, the resulting port states, the recovery steps and exactly where each feature belongs in a campus design. PortFast is v1.1 topic 2.5.c and the four protection features are 2.5.d; in v2.0 they remain part of domain 2.",
    },
    {
      kind: 'bullets',
      title: 'Threats at the edge of the tree',
      bullets: [
        'Hosts wait **30 s** (802.1D) before an access port forwards — DHCP and PXE time out',
        'A user plugs in a switch — it joins STP and may even **become root**',
        'Two wall jacks cabled through a small switch create a loop',
        'A **unidirectional** fiber silently stops BPDUs and a blocked port opens',
        '==Each feature in this lesson answers one of these threats==',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1 (root)', x: 2, y: 1.1, tone: 'accent' },
          { id: 'ds2', icon: 'switch', label: 'DS2', x: 8, y: 1.1 },
          { id: 'as1', icon: 'switch', label: 'AS1', x: 5, y: 2.9 },
          { id: 'pc', icon: 'pc', label: 'PC', sub: 'wants DHCP now', x: 2.6, y: 4.3 },
          { id: 'rogue', icon: 'switch', label: 'Rogue switch', sub: 'priority 0', x: 7.4, y: 4.3, tone: 'bad' },
        ],
        links: [
          { from: 'ds1', to: 'ds2' },
          { from: 'ds1', to: 'as1' },
          { from: 'ds2', to: 'as1', blocked: true },
          { from: 'as1', to: 'pc', fromLabel: 'Fa0/5' },
          { from: 'as1', to: 'rogue', fromLabel: 'Fa0/6', style: 'dashed', tone: 'bad' },
        ],
      },
      notes:
        "Picture the finished tree from the previous lessons — DS1 is root and AS1 blocks its alternate uplink — and think about what can go wrong at its edges. First, every access port is a designated port that, in classic 802.1D, must spend 15 seconds listening and 15 learning after a PC powers on; DHCP clients and PXE boot images may give up before the port forwards. Second, users plug things in. A desktop switch can create a new branch of the tree or a loop between two wall jacks, and a switch that someone configured with priority 0 in a lab will take over as root for the whole VLAN, dragging traffic toward a desk. Third, fiber links can fail in one direction: the receive strand dies, BPDUs stop, and the blocked port concludes the other side has gone and starts forwarding — a loop created by STP itself. The rest of this lesson maps a feature to each threat: PortFast for delay, BPDU Guard and Root Guard for rogue switches, and Loop Guard for unidirectional links.",
    },
    {
      kind: 'bullets',
      title: 'PortFast: straight to forwarding',
      bullets: [
        'Access port to a single host skips listening and learning',
        'In RSTP terms it is an **edge** port: forwards at link-up',
        'Still sends BPDUs; a received BPDU cancels edge status',
        'Edge port flaps do **not** trigger topology changes',
        'Never on links to switches, hubs or bridges',
      ],
      diagram: {
        type: 'flow',
        width: 10,
        height: 4,
        nodes: [
          { id: 'a1', label: 'Link up', shape: 'pill', x: 1, y: 1 },
          { id: 'a2', label: 'Listening', sub: '15 s', x: 3.6, y: 1, tone: 'muted' },
          { id: 'a3', label: 'Learning', sub: '15 s', x: 6.2, y: 1, tone: 'muted' },
          { id: 'a4', label: 'Forwarding', sub: 'after ~30 s', x: 8.8, y: 1, shape: 'round' },
          { id: 'b1', label: 'Link up', sub: 'PortFast', shape: 'pill', x: 1, y: 3, tone: 'accent' },
          { id: 'b4', label: 'Forwarding', sub: 'immediately', x: 8.8, y: 3, shape: 'round', tone: 'good' },
        ],
        edges: [
          { from: 'a1', to: 'a2' },
          { from: 'a2', to: 'a3' },
          { from: 'a3', to: 'a4' },
          { from: 'b1', to: 'b4', label: 'no waiting', tone: 'good' },
        ],
      },
      notes:
        "**PortFast** tells the switch that a port connects to a single end device, so there is no loop to worry about and no reason to wait. When the link comes up, the port goes directly to forwarding instead of spending 30 seconds in listening and learning (802.1D) or waiting for a proposal/agreement exchange that no host will ever answer (RSTP). In Rapid PVST+ terms a PortFast port is an **edge** port. Two properties make PortFast safer than it sounds. It does not disable spanning tree: the port still sends BPDUs, and if a BPDU ever arrives the port immediately loses its edge status and behaves like any other STP port. And because edge ports cannot create loops, their link flaps do not generate topology changes, so a user rebooting a laptop no longer flushes MAC tables across the VLAN. The danger is a temporary loop: if two PortFast ports are connected together through a hub or a switch, both forward instantly and the loop exists until BPDUs are exchanged. That is why PortFast belongs only on host ports — and why it is almost always paired with BPDU Guard.",
    },
    {
      kind: 'cli',
      title: 'Configuring PortFast',
      code: `AS1(config)# interface FastEthernet0/5
AS1(config-if)# switchport mode access
AS1(config-if)# spanning-tree portfast
%Warning: portfast should only be enabled on ports connected to a single
 host. Connecting hubs, concentrators, switches, bridges, etc... to this
 interface  when portfast is enabled, can cause temporary bridging loops.
 Use with CAUTION

%Portfast has been configured on FastEthernet0/5 but will only
 have effect when the interface is in a non-trunking mode.
AS1(config-if)# exit
AS1(config)# spanning-tree portfast default
%Warning: this command enables portfast by default on all interfaces. You
 should now disable portfast explicitly on switched ports leading to hubs,
 switches and bridges as they may create temporary bridging loops.
AS1(config)# interface FastEthernet0/24
AS1(config-if)# spanning-tree portfast disable`,
      highlight: ['spanning-tree portfast', 'spanning-tree portfast default', 'spanning-tree portfast disable'],
      caption: 'Interface form, global form, and an exception for a port that feeds another switch.',
      notes:
        "There are two ways to enable PortFast. Per interface, `spanning-tree portfast` on an access port; IOS answers with a warning that the feature must only be used toward a single host, plus a reminder that it takes effect only while the port is not trunking. Globally, `spanning-tree portfast default` enables PortFast on **every access (non-trunking) port** at once — the easiest way to cover a 48-port access switch and every port added later; trunks are unaffected. Any access port that should not be an edge port, such as Fa0/24 here, which feeds a small switch in a conference room, is excluded with `spanning-tree portfast disable`. For a trunk that connects to a server, hypervisor or router rather than a switch, `spanning-tree portfast trunk` makes that specific trunk an edge port. In `show running-config` you see either the interface command under each port or the single global line. Some newer IOS releases add an `edge` keyword to these commands (for example `spanning-tree portfast edge`); the behavior is the same.",
    },
    {
      kind: 'bullets',
      title: 'PortFast rules and gotchas',
      bullets: [
        'Global `spanning-tree portfast default` covers **access** ports only',
        'A trunk to a server or hypervisor needs `spanning-tree portfast trunk`',
        'Exclude a port from the global default with `spanning-tree portfast disable`',
        'PortFast does not disable STP — BPDUs are still sent every hello',
        'Never on uplinks or ports toward hubs, switches or bridges',
        '==PortFast alone does not stop a rogue switch — add BPDU Guard==',
      ],
      notes:
        "A few rules keep PortFast out of trouble. The global command applies only to ports operating as **access** ports; a port that negotiates a trunk is excluded automatically, and a trunk needs the explicit `portfast trunk` form. PortFast never turns spanning tree off — the port sends BPDUs every hello, and receiving one cancels its edge status — so it is a speed optimization, not a security control. Never enable it on links toward switches, hubs or bridges: the temporary loop that forms before BPDUs are exchanged can be enough to melt a VLAN. If you are unsure what a port connects to, CDP or LLDP neighbor information can tell you. The most important rule is the last one on the slide: PortFast does nothing to stop a rogue switch. A switch plugged into a PortFast port simply turns that port back into a normal STP port and joins the tree — possibly as the new root. Stopping it is the job of BPDU Guard, which is why exam answers and Cisco best practice pair the two features on every access port.",
    },
    {
      kind: 'bullets',
      title: 'BPDU Guard: no switches allowed here',
      bullets: [
        'Any BPDU received on the port → port is **err-disabled**',
        'Stops rogue or accidental switches at the edge instantly',
        'Interface: `spanning-tree bpduguard enable` — with or without PortFast',
        'Global: `spanning-tree portfast bpduguard default` — PortFast ports only',
        'Port stays down until an admin or errdisable recovery restores it',
      ],
      diagram: {
        type: 'topology',
        width: 10,
        height: 4,
        nodes: [
          { id: 'as1', icon: 'switch', label: 'AS1', sub: 'PortFast + BPDU Guard', x: 2.5, y: 1.8 },
          { id: 'rogue', icon: 'switch', label: 'Desktop switch', sub: 'sends BPDUs', x: 7.5, y: 1.8, tone: 'bad' },
        ],
        links: [
          { from: 'rogue', to: 'as1', label: 'BPDU', toLabel: 'Fa0/6 err-disabled', arrow: 'forward', tone: 'bad', blocked: true },
        ],
        annotations: [{ x: 5, y: 3.4, text: 'the first BPDU shuts the port down', tone: 'bad' }],
      },
      notes:
        "**BPDU Guard** enforces a simple policy: this port connects to an end device, and end devices never send BPDUs. The moment any BPDU arrives, the switch places the port in the **err-disabled** state — effectively shut down, with no traffic in either direction. It does not matter whether the BPDU is superior or inferior, or whether the attached device is a managed Catalyst or a desktop switch that happens to run STP; one BPDU is enough. That makes it the best protection against both accidental loops and deliberate attempts to become root. There are two ways to enable it. The interface command `spanning-tree bpduguard enable` protects that port whether or not PortFast is configured. The global command `spanning-tree portfast bpduguard default` protects every port that is operating as a PortFast edge port, so together with `spanning-tree portfast default` it covers the entire access layer in two lines. One caveat: a truly unmanaged switch that never generates BPDUs will not trigger BPDU Guard, which is why port security and storm control complement it.",
    },
    {
      kind: 'cli',
      title: 'BPDU Guard in action',
      code: `AS1(config)# interface FastEthernet0/6
AS1(config-if)# spanning-tree bpduguard enable
AS1(config-if)# exit
AS1(config)# spanning-tree portfast bpduguard default
AS1(config)# end
AS1#
%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port FastEthernet0/6 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Fa0/6, putting Fa0/6 in err-disable state
%LINK-3-UPDOWN: Interface FastEthernet0/6, changed state to down`,
      highlight: ['spanning-tree bpduguard enable', 'spanning-tree portfast bpduguard default', 'err-disable state'],
      caption: 'Use either the interface form or the global form; both are shown for comparison.',
      notes:
        "Here AS1 already has `spanning-tree portfast default`, so Fa0/6 is an edge port, and the engineer adds BPDU Guard on the interface and globally — in practice you would choose one or the other. When a user later connects a switch to Fa0/6, messages appear almost instantly. `%SPANTREE-2-BLOCK_BPDUGUARD` says a BPDU arrived on a port with BPDU Guard enabled and that the port is being disabled; `%PM-4-ERR_DISABLE` comes from the port manager and records the err-disable reason, **bpduguard**, which is exactly what `show interfaces status err-disabled` will list. The link then goes down. Nothing else in the tree changed: no superior BPDU reached the distribution layer and no root election took place. Remember the difference in scope between the two commands, because the exam tests it. The interface form works on any port, even without PortFast. The global form only ever touches ports operating as PortFast ports, so an uplink trunk is never err-disabled by the global command — which is precisely why it is safe to deploy on every access switch.",
    },
    {
      kind: 'cli',
      title: 'Finding and recovering err-disabled ports',
      code: `AS1# show interfaces status err-disabled

Port      Name               Status       Reason               Err-disabled Vlans
Fa0/6     Conf-Room-B        err-disabled bpduguard
AS1# show interfaces FastEthernet0/6 | include line protocol
FastEthernet0/6 is down, line protocol is down (err-disabled)
AS1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
AS1(config)# interface FastEthernet0/6
AS1(config-if)# shutdown
AS1(config-if)# no shutdown
AS1(config-if)# exit
AS1(config)# errdisable recovery cause bpduguard
AS1(config)# errdisable recovery interval 300
AS1(config)# end
AS1# show errdisable recovery | include bpduguard
bpduguard                    Enabled`,
      highlight: ['err-disabled bpduguard', '(err-disabled)', 'errdisable recovery cause bpduguard'],
      notes:
        "An err-disabled port stays down until someone intervenes; there is **no automatic recovery by default**. Start with `show interfaces status err-disabled`, which lists every err-disabled port with its **Reason** — bpduguard here, but the same state is used by port security, UDLD, link-flap detection and other features. `show interfaces` on the port shows the telltale `line protocol is down (err-disabled)`. First remove the cause, or the port will shut down again with the next BPDU. Then bounce the port with `shutdown` followed by `no shutdown`; both are needed, because the port is err-disabled rather than administratively down. If you prefer automatic recovery, `errdisable recovery cause bpduguard` tells the switch to re-enable ports disabled by BPDU Guard after the recovery interval, which defaults to **300 seconds** and is changed with `errdisable recovery interval`. `show errdisable recovery` lists the causes that have recovery enabled. Automatic recovery is convenient, but if the rogue device is still attached, the port will simply cycle between up and err-disabled every five minutes.",
    },
    {
      kind: 'compare',
      title: 'BPDU Filter: global vs interface',
      left: {
        heading: 'Global (PortFast ports only)',
        bullets: [
          '`spanning-tree portfast bpdufilter default`',
          'Sends a few BPDUs at link-up, then stops sending',
          'A received BPDU → port **loses PortFast and filtering**',
          'The port then runs normal STP — switches are still detected',
          'Relatively safe',
        ],
      },
      right: {
        heading: 'Interface (per port)',
        tone: 'bad',
        bullets: [
          '`spanning-tree bpdufilter enable`',
          'Port **never sends** BPDUs and **ignores** received ones',
          'Effectively disables STP on that port',
          'A loop through the port is never detected',
          '==Risky: only where STP must not cross a boundary==',
        ],
      },
      notes:
        "**BPDU Filter** stops BPDUs, and its two configuration methods behave very differently — a classic exam distinction. The **global** command `spanning-tree portfast bpdufilter default` applies only to ports operating as PortFast edge ports. Those ports still send a few BPDUs when the link comes up and then stop sending, which spares hosts from receiving BPDUs every two seconds. If a BPDU is ever received, the port **loses its PortFast status and BPDU filtering** and becomes a normal STP port, so a switch plugged into it is still detected and handled by spanning tree. The **interface** command `spanning-tree bpdufilter enable` is far more drastic: the port never sends BPDUs and silently **ignores** any it receives, which effectively disables spanning tree on that port. If a loop is created through that port, no switch will see it, and a broadcast storm follows. The interface form therefore belongs only at boundaries where STP must deliberately not cross, such as a hand-off between two administrative domains, and even there it is a risky choice. If the goal is protection against rogue switches, BPDU Guard is almost always the right answer instead.",
    },
    {
      kind: 'diagram',
      title: 'Root Guard: keep the root where you put it',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1 (root)', sub: 'VLAN 10 · 24586', x: 2, y: 1.1, tone: 'accent' },
          { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'VLAN 10 · 28682', x: 8, y: 1.1 },
          { id: 'as1', icon: 'switch', label: 'AS1', x: 5, y: 2.8 },
          { id: 'lab', icon: 'switch', label: 'Lab switch', sub: 'priority 0', x: 5, y: 4.4, tone: 'bad' },
        ],
        links: [
          { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1' },
          { from: 'as1', to: 'ds1', toLabel: 'Gi0/2 ROOT_Inc', blocked: true, tone: 'bad' },
          { from: 'as1', to: 'ds2', toLabel: 'Gi0/2 ROOT_Inc', blocked: true, tone: 'bad' },
          { from: 'lab', to: 'as1', label: 'superior BPDUs', arrow: 'forward', tone: 'bad' },
        ],
      },
      caption: 'DS1 and DS2 refuse the new root and block their downlinks; the ports recover by themselves when the superior BPDUs stop.',
      notes:
        "**Root Guard** protects the placement of the root bridge. Enable it on ports where the root should **never** appear — typically the distribution-switch downlinks toward access switches, and ports that face another organization. The port keeps working normally as a designated port. But if it ever receives a **superior BPDU** — one advertising a better root, which would turn the port into a root port — the switch refuses to accept the new root and puts the port into the **root-inconsistent** state, in which it forwards no user traffic. In the diagram, someone connects a lab switch with priority 0 to AS1. AS1 accepts it as root, as STP should, and starts sending superior BPDUs up its uplinks, but DS1 and DS2 block their downlinks instead of rebuilding the whole VLAN around a desk. The rest of the network keeps DS1 as root, and only the AS1 branch is cut off. As soon as the superior BPDUs stop, the port **recovers automatically** — no administrator action is needed, unlike the err-disabled state left by BPDU Guard. Root Guard acts per VLAN.",
    },
    {
      kind: 'cli',
      title: 'Configuring and verifying Root Guard',
      code: `DS1(config)# interface GigabitEthernet0/2
DS1(config-if)# spanning-tree guard root
%SPANTREE-2-ROOTGUARD_CONFIG_CHANGE: Root guard enabled on port GigabitEthernet0/2.
DS1(config-if)# end
%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet0/2 on VLAN0010.
DS1# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.25   P2p
Gi0/2               Desg BKN*4         128.26   P2p *ROOT_Inc
DS1# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet0/2       Root Inconsistent

Number of inconsistent ports (segments) in the system : 1`,
      highlight: ['spanning-tree guard root', 'ROOTGUARD_BLOCK', 'BKN*', '*ROOT_Inc', 'Root Inconsistent'],
      notes:
        "Root Guard is a single interface command, `spanning-tree guard root`, and IOS confirms it with a `ROOTGUARD_CONFIG_CHANGE` message. There is no global form. When superior BPDUs arrive, you see `%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port … on VLAN0010`. The per-VLAN wording matters: Root Guard acts separately in every VLAN, so a port can be root-inconsistent in one VLAN while forwarding in the others. In `show spanning-tree`, the affected port keeps the **Desg** role, but its state is **BKN*** (broken) and the Type column adds **`*ROOT_Inc`**. `show spanning-tree inconsistentports` summarizes every port held in an inconsistent state, here with the reason **Root Inconsistent**. When the offending switch is removed or reconfigured and the superior BPDUs stop, IOS logs `ROOTGUARD_UNBLOCK` and the port returns to forwarding. Never put Root Guard on a switch's own root port or on alternate ports toward the real root: those ports legitimately receive superior BPDUs, so the guard would cut the switch off from the tree.",
    },
    {
      kind: 'diagram',
      title: 'Loop Guard: when BPDUs stop arriving',
      diagram: {
        type: 'topology',
        width: 10,
        height: 5,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1 (root)', x: 2, y: 1.1, tone: 'accent' },
          { id: 'ds2', icon: 'switch', label: 'DS2', x: 8, y: 1.1 },
          { id: 'as1', icon: 'switch', label: 'AS1', sub: 'Loop Guard on uplinks', x: 5, y: 3.9 },
        ],
        links: [
          { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1 DP', toLabel: 'Gi0/1 RP' },
          { from: 'ds1', to: 'as1', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/1 RP', tone: 'good' },
          { from: 'ds2', to: 'as1', label: 'receive strand failed', fromLabel: 'Gi0/2 DP', toLabel: 'Gi0/2 LOOP_Inc', style: 'dashed', tone: 'bad', blocked: true },
        ],
      },
      caption: 'Without Loop Guard, AS1 Gi0/2 would age out the stored BPDU, become designated and forward — creating a loop.',
      notes:
        "**Loop Guard** handles a failure that STP cannot see on its own. Suppose the fiber from DS2 to AS1 loses one strand: AS1 still transmits toward DS2, but it no longer receives anything, including BPDUs. AS1's Gi0/2 is an alternate port whose blocking depends entirely on those BPDUs. When they stop, AS1 ages out the stored information — after max age in 802.1D or three missed hellos in RSTP — decides that nobody is designated on that segment, makes Gi0/2 designated and starts **forwarding**. Because DS2 is also forwarding toward AS1, frames can now circulate in one direction: a loop. With Loop Guard enabled, a root or alternate port that stops receiving BPDUs is placed in the **loop-inconsistent** state instead of becoming designated, so it keeps blocking. When BPDUs resume, the port **recovers automatically**. Loop Guard therefore belongs on the non-designated ports of switch-to-switch links — access-switch uplinks and the distribution interconnect. UDLD, which detects unidirectional links directly, is a complementary feature often deployed alongside it.",
    },
    {
      kind: 'cli',
      title: 'Configuring Loop Guard',
      code: `AS1(config)# spanning-tree loopguard default
AS1(config)# interface GigabitEthernet0/2
AS1(config-if)# spanning-tree guard loop
AS1(config-if)# end
%SPANTREE-2-LOOPGUARD_BLOCK: Loop guard blocking port GigabitEthernet0/2 on VLAN0010.
AS1# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet0/2       Loop Inconsistent

Number of inconsistent ports (segments) in the system : 1`,
      highlight: ['spanning-tree loopguard default', 'spanning-tree guard loop', 'LOOPGUARD_BLOCK', 'Loop Inconsistent'],
      caption: 'Global form for all point-to-point ports, or the interface form per port.',
      notes:
        "Loop Guard can be enabled per port with `spanning-tree guard loop` or globally with `spanning-tree loopguard default`, which applies it to all point-to-point links; the transcript shows both forms, though one is enough. It only takes effect on ports that are root or alternate ports — a designated port sends BPDUs rather than depending on them, so there is nothing to guard. When the unidirectional failure happens, IOS logs `%SPANTREE-2-LOOPGUARD_BLOCK` for the port and VLAN, and `show spanning-tree inconsistentports` lists the port as **Loop Inconsistent**. In the per-VLAN port table the state appears as **BKN*** with `*LOOP_Inc` in the Type column. Once BPDUs arrive again, a `LOOPGUARD_UNBLOCK` message appears and the port resumes its normal role. Root Guard and Loop Guard share one interface command, `spanning-tree guard`, which takes a single value — `root`, `loop` or `none` — so the two cannot be active on the same port. That rarely matters in a correct design, because Root Guard goes on designated ports and Loop Guard on root and alternate ports.",
    },
    {
      kind: 'table',
      title: 'The protection toolkit at a glance',
      columns: ['Feature', 'Put it on', 'Triggered by', 'Result', 'Recovery'],
      rows: [
        ['**PortFast**', 'Access ports to hosts', 'Link up', 'Forwards immediately', '—'],
        ['**BPDU Guard**', 'PortFast access ports', '**Any** BPDU received', '**err-disabled**', 'Manual, or `errdisable recovery`'],
        ['**BPDU Filter**', 'Rare: STP domain boundary', '—', 'BPDUs suppressed', 'Global form reverts on a received BPDU'],
        ['**Root Guard**', 'Distribution downlinks', 'A **superior** BPDU', '**root-inconsistent**', 'Automatic'],
        ['**Loop Guard**', 'Root/alternate ports on uplinks', 'BPDUs **stop** arriving', '**loop-inconsistent**', 'Automatic'],
      ],
      caption: 'Err-disabled needs a human; inconsistent states heal themselves.',
      notes:
        "This is the table to memorize, because most exam questions reduce to matching a feature with its trigger and its result. PortFast is not protection at all — it removes the forwarding delay on edge ports. BPDU Guard triggers on **any** BPDU and **err-disables** the port, which then needs `shutdown` and `no shutdown` unless errdisable recovery is configured. BPDU Filter suppresses BPDUs: in its global form a port that receives a BPDU reverts to normal STP, while in its interface form received BPDUs are ignored completely. Root Guard triggers on a **superior** BPDU and holds the port in **root-inconsistent**; Loop Guard triggers on the **absence** of BPDUs and holds the port in **loop-inconsistent**. Both inconsistent states clear by themselves as soon as the condition ends. Two memory hooks help. First: err-disabled needs a human, inconsistent states heal themselves. Second: BPDU Guard reacts to *receiving* BPDUs, Root Guard to receiving *better* BPDUs, and Loop Guard to *no longer receiving* BPDUs.",
    },
    {
      kind: 'diagram',
      title: 'Where each feature goes',
      diagram: {
        type: 'topology',
        width: 12,
        height: 6,
        nodes: [
          { id: 'ds1', icon: 'switch', label: 'DS1', sub: 'root primary', x: 3, y: 1.1, tone: 'accent' },
          { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'root secondary', x: 9, y: 1.1 },
          { id: 'as1', icon: 'switch', label: 'AS1', x: 3, y: 3.2 },
          { id: 'as2', icon: 'switch', label: 'AS2', x: 9, y: 3.2 },
          { id: 'pc1', icon: 'pc', label: 'PC', x: 3, y: 4.9 },
          { id: 'pc2', icon: 'phone', label: 'Phone', x: 9, y: 4.9 },
        ],
        links: [
          { from: 'ds1', to: 'ds2', label: 'LG on the RP end' },
          { from: 'ds1', to: 'as1', fromLabel: 'RG', toLabel: 'LG' },
          { from: 'ds1', to: 'as2', fromLabel: 'RG', toLabel: 'LG' },
          { from: 'ds2', to: 'as1', fromLabel: 'RG', toLabel: 'LG' },
          { from: 'ds2', to: 'as2', fromLabel: 'RG', toLabel: 'LG' },
          { from: 'as1', to: 'pc1', fromLabel: 'PF+BG', tone: 'good' },
          { from: 'as2', to: 'pc2', fromLabel: 'PF+BG', tone: 'good' },
        ],
        annotations: [
          { x: 6, y: 5.7, text: 'RG Root Guard · LG Loop Guard · PF+BG PortFast + BPDU Guard', tone: 'muted' },
        ],
      },
      notes:
        "Putting the features together gives the standard Cisco campus template. On every **access port** facing users, phones and printers: **PortFast** so hosts come online immediately, plus **BPDU Guard** so a switch plugged into the wall is shut down at once — usually applied with the two global defaults. On the **distribution downlinks** toward access switches: **Root Guard**, because the root must stay in the distribution layer and no access switch should ever offer a better root. On the **uplinks of the access switches** and on the root-port end of the distribution interconnect — the root and alternate ports: **Loop Guard**, often enabled globally, to protect against unidirectional links. The root placement itself comes from `root primary` and `root secondary` on the distribution pair. BPDU Filter does not appear in the template at all; it is reserved for special boundaries. When an exam question describes a location — a port connected to a PC, a distribution port facing an access switch, an alternate port on an uplink — use this picture to pick the feature.",
    },
    {
      kind: 'cli',
      title: 'Verifying an edge port',
      code: `AS1# show spanning-tree interface FastEthernet0/5 detail
 Port 5 (FastEthernet0/5) of VLAN0010 is designated forwarding
   Port path cost 19, Port priority 128, Port Identifier 128.5.
   Designated root has priority 24586, address 0019.e86a.6f80
   Designated bridge has priority 32778, address 0019.e8aa.0b00
   Designated port id is 128.5, designated path cost 4
   Timers: message age 0, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   The port is in the portfast mode
   Link type is point-to-point by default
   Bpdu guard is enabled
   BPDU: sent 2143, received 0`,
      highlight: ['The port is in the portfast mode', 'Bpdu guard is enabled', 'received 0'],
      notes:
        "`show spanning-tree interface <port> detail` is the most complete per-port view. The first line gives the port number, VLAN, role and state — here, designated forwarding in VLAN 10. The next lines show the port's own cost, priority and port ID, then the root and the designated bridge recorded for this segment; on an access port AS1 itself is the designated bridge, advertising its root path cost of 4. The protection lines are what you check during verification. **The port is in the portfast mode** confirms an edge port (newer releases word it `portfast edge mode`). **Link type is point-to-point by default** shows the RSTP link type and that it was derived from duplex. **Bpdu guard is enabled** confirms the guard; when a feature comes from a global default the line says so, for example `Bpdu guard is enabled by default`. Root Guard, Loop Guard and BPDU Filter appear as similar lines when configured. Finally, **BPDU: sent 2143, received 0** is a powerful clue: an edge port should always show zero BPDUs received — a non-zero count means a switch is attached.",
    },
    {
      kind: 'cli',
      title: 'Global defaults: show spanning-tree summary',
      code: `AS1# show spanning-tree summary
Switch is in rapid-pvst mode
Root bridge for: none
Extended system ID           is enabled
Portfast Default             is enabled
PortFast BPDU Guard Default  is enabled
Portfast BPDU Filter Default is disabled
Loopguard Default            is enabled
EtherChannel misconfig guard is enabled
UplinkFast                   is disabled
BackboneFast                 is disabled
Pathcost method used         is short

Name                   Blocking Listening Learning Forwarding STP Active
---------------------- -------- --------- -------- ---------- ----------
VLAN0010                     1         0        0          3          4
---------------------- -------- --------- -------- ---------- ----------
1 vlan                       1         0        0          3          4`,
      highlight: ['Portfast Default             is enabled', 'PortFast BPDU Guard Default  is enabled', 'Loopguard Default            is enabled'],
      notes:
        "`show spanning-tree summary` answers the question 'which protections are on by default on this switch?' in one screen. Each line in the middle block corresponds to a global command: **Portfast Default** reflects `spanning-tree portfast default`, **PortFast BPDU Guard Default** reflects `spanning-tree portfast bpduguard default`, **Portfast BPDU Filter Default** the global BPDU Filter, and **Loopguard Default** reflects `spanning-tree loopguard default`. AS1 follows the template: PortFast and BPDU Guard on all edge ports, Loop Guard on its uplinks, and no global BPDU Filter. There is no global Root Guard line — Root Guard is always configured per interface — which is itself a common exam distractor. The mode line confirms Rapid PVST+, `Root bridge for: none` shows that this access switch is correctly not root anywhere, and the counters at the bottom show one blocking port (the alternate uplink) and three forwarding ports in VLAN 10. Comparing this output across switches is a quick way to spot one that was missed when the defaults were rolled out.",
    },
    {
      kind: 'steps',
      title: 'Troubleshooting a dead access port',
      steps: [
        { title: 'Check the port status', text: '`show interfaces status` — the Status column reads err-disabled.' },
        { title: 'Find the reason', text: '`show interfaces status err-disabled` — Reason: bpduguard.' },
        { title: 'Remove the cause', text: 'Unplug the switch or hub the user connected.' },
        { title: 'Re-enable the port', text: '`shutdown`, then `no shutdown` on the interface.' },
        { title: 'Automate only if appropriate', text: '`errdisable recovery cause bpduguard` (default interval 300 s).' },
      ],
      notes:
        "The most common help-desk ticket involving these features is 'my port stopped working after I plugged in a switch'. Work from the symptom to the cause. `show interfaces status` shows the port as err-disabled rather than connected or notconnect. `show interfaces status err-disabled` gives the reason — bpduguard confirms that a BPDU arrived; other reasons, such as psecure-violation, point to different features. Physically remove the switch or hub the user connected, or move it to a port designed for it; skip this step and the port will err-disable again the moment it comes up. Then re-enable the port with `shutdown` and `no shutdown`. If the environment sees many such incidents, `errdisable recovery cause bpduguard` automates the re-enable after 300 seconds by default, but it does not replace finding the device. For a port that is blocked rather than err-disabled — `BKN*` with `*ROOT_Inc` or `*LOOP_Inc` — recovery is automatic once the superior BPDUs stop or the missing BPDUs return, so the fix is the offending switch or cable, not the port.",
    },
    {
      kind: 'callout',
      tone: 'exam',
      title: 'Exam traps: PortFast and the guards',
      body: '**Err-disabled needs a human; inconsistent states heal themselves.**',
      bullets: [
        'BPDU Guard: **any** BPDU → err-disabled (manual or errdisable recovery)',
        'Root Guard: **superior** BPDU → root-inconsistent, auto-recovers',
        'Loop Guard: **missing** BPDUs → loop-inconsistent, auto-recovers',
        'Global BPDU Guard and BPDU Filter apply only to **PortFast** ports',
        'Interface BPDU Filter ignores BPDUs → loops go undetected',
        'PortFast still sends BPDUs; it is not a security feature',
        'Root Guard and Loop Guard cannot share one port; Root Guard has no global form',
      ],
      notes:
        "Most wrong answers in this area come from mixing up triggers and results. BPDU Guard does not care whether a BPDU is better or worse — any BPDU err-disables the port, and nothing brings it back automatically unless errdisable recovery is configured. Root Guard reacts only to **superior** BPDUs and blocks the port as root-inconsistent until they stop. Loop Guard reacts to BPDUs that **stop** arriving and blocks the port as loop-inconsistent until they return. Watch the scope of global commands: `spanning-tree portfast bpduguard default` and `spanning-tree portfast bpdufilter default` only affect ports operating as PortFast ports, while the interface forms apply to that port unconditionally. The interface BPDU Filter is the dangerous one, because the port ignores received BPDUs and a loop through it goes unnoticed. PortFast alone never shuts a port and never stops BPDUs from being sent. Finally, Root Guard and Loop Guard are mutually exclusive on one port because they share the `spanning-tree guard` command, and Root Guard exists only as an interface command.",
    },
    {
      kind: 'bullets',
      title: 'Summary',
      bullets: [
        'PortFast: edge ports forward at link-up — hosts only; `portfast default` covers access ports',
        'BPDU Guard: any BPDU → err-disabled; recover with shut/no shut or errdisable recovery',
        'BPDU Filter: global form reverts on a BPDU; interface form ignores BPDUs — risky',
        'Root Guard: superior BPDU → root-inconsistent; on distribution downlinks',
        'Loop Guard: lost BPDUs → loop-inconsistent; on root/alternate uplink ports',
        'Verify: `show spanning-tree interface detail`, `show interfaces status err-disabled`',
      ],
      notes:
        "PortFast turns access ports into edge ports that forward as soon as the link comes up, and it belongs only on ports toward single end devices; the global `spanning-tree portfast default` covers every access port. BPDU Guard adds the security: any BPDU on a protected port err-disables it, and the port returns only after `shutdown`/`no shutdown` or errdisable recovery (default 300 s). BPDU Filter suppresses BPDUs; the global version gives up filtering as soon as a BPDU arrives, while the interface version ignores BPDUs entirely and can hide a loop. Root Guard keeps the root in the distribution layer by blocking, as root-inconsistent, any port that receives a superior BPDU, and Loop Guard keeps root and alternate ports from opening when BPDUs disappear, holding them as loop-inconsistent. Both inconsistent states recover automatically. Verify everything with `show spanning-tree interface … detail`, `show spanning-tree summary`, `show spanning-tree inconsistentports` and `show interfaces status err-disabled`. This completes the spanning-tree module; next comes IP routing.",
    },
  ],
  flashcards: [
    { id: 'f1', front: 'PortFast', back: 'Lets an access port forward immediately at link-up, skipping listening/learning. In RSTP terms the port is an **edge** port.' },
    { id: 'f2', front: 'Interface command for PortFast', back: '`spanning-tree portfast`' },
    { id: 'f3', front: 'Global command for PortFast', back: '`spanning-tree portfast default` — enables PortFast on all access (non-trunking) ports.' },
    { id: 'f4', front: 'Exclude one port from the global PortFast default', back: '`spanning-tree portfast disable` on that interface.' },
    { id: 'f5', front: 'PortFast on a trunk to a server or hypervisor', back: '`spanning-tree portfast trunk`' },
    { id: 'f6', front: 'Why never PortFast on switch-to-switch links?', back: 'Both ends forward instantly, creating a temporary bridging loop before BPDUs can block a port.' },
    { id: 'f7', front: 'PortFast port receives a BPDU (no guard configured)', back: 'It loses its edge/PortFast status and runs as a normal STP port.' },
    { id: 'f8', front: 'Do edge (PortFast) ports cause topology changes?', back: 'No — an edge port going up or down does not generate a topology change.' },
    { id: 'f9', front: 'BPDU Guard action', back: 'Places the port in the **err-disabled** state as soon as any BPDU is received.' },
    { id: 'f10', front: 'BPDU Guard interface command', back: '`spanning-tree bpduguard enable` — works with or without PortFast.' },
    { id: 'f11', front: 'BPDU Guard global command', back: '`spanning-tree portfast bpduguard default` — applies only to ports operating as PortFast ports.' },
    { id: 'f12', front: 'Manual recovery from err-disabled', back: 'Remove the cause, then `shutdown` followed by `no shutdown` on the interface.' },
    { id: 'f13', front: 'Automatic recovery for BPDU Guard', back: '`errdisable recovery cause bpduguard`; the interval (`errdisable recovery interval`) defaults to **300 s**.' },
    { id: 'f14', front: 'List err-disabled ports and their reasons', back: '`show interfaces status err-disabled`' },
    { id: 'f15', front: 'Interface BPDU Filter', back: '`spanning-tree bpdufilter enable` — sends no BPDUs and ignores received ones, so STP is effectively off on the port.' },
    { id: 'f16', front: 'Global BPDU Filter', back: '`spanning-tree portfast bpdufilter default` — PortFast ports stop sending BPDUs after link-up; a received BPDU reverts the port to normal STP.' },
    { id: 'f17', front: 'Root Guard command', back: '`spanning-tree guard root` — interface only; there is no global form.' },
    { id: 'f18', front: 'Root Guard trigger and result', back: 'A **superior** BPDU → port held in **root-inconsistent** (blocked); recovers automatically when superior BPDUs stop.' },
    { id: 'f19', front: 'Loop Guard commands', back: '`spanning-tree guard loop` (interface) or `spanning-tree loopguard default` (global, point-to-point ports).' },
    { id: 'f20', front: 'Loop Guard trigger and result', back: 'BPDUs stop arriving on a root or alternate port → **loop-inconsistent** (blocked) instead of designated; recovers when BPDUs resume.' },
    { id: 'f21', front: 'Problem that Loop Guard solves', back: 'Unidirectional links (e.g. a failed fiber strand) that stop BPDUs and would make a blocked port start forwarding.' },
    { id: 'f22', front: '`BKN*` with `*ROOT_Inc` or `*LOOP_Inc`', back: 'The port is blocked ("broken") by Root Guard or Loop Guard in that VLAN.' },
    { id: 'f23', front: '`show spanning-tree inconsistentports`', back: 'Lists ports held in the Root Inconsistent or Loop Inconsistent state, per VLAN.' },
    { id: 'f24', front: 'Root Guard and Loop Guard on the same port?', back: 'Not possible: `spanning-tree guard` takes a single value — `root`, `loop` or `none`.' },
    { id: 'f25', front: 'Campus placement cheat sheet', back: 'Access ports: PortFast + BPDU Guard\nDistribution downlinks: Root Guard\nRoot/alternate uplink ports: Loop Guard' },
    { id: 'f26', front: '`show spanning-tree interface Fa0/5 detail`', back: 'Shows PortFast mode, link type, BPDU Guard/Filter and guard status, and BPDUs sent/received for the port.' },
    { id: 'f27', front: 'Clue that a switch is attached to an edge port', back: 'A non-zero "BPDU: received" counter in `show spanning-tree interface … detail`.' },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      stem: 'What does BPDU Guard do when a protected port receives a BPDU?',
      options: [
        'Places the port in the err-disabled state',
        'Drops the BPDU and keeps forwarding',
        'Moves the port to the root-inconsistent state',
        'Turns the port into a normal STP port',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        'BPDU Guard **err-disables** the port on any BPDU. Dropping BPDUs is BPDU Filter behavior, root-inconsistent is Root Guard, and reverting to normal STP is what a PortFast port without a guard does.',
    },
    {
      id: 'q2',
      type: 'single',
      stem: 'Which feature prevents a port from becoming a root port when a superior BPDU arrives?',
      options: ['Root Guard', 'Loop Guard', 'BPDU Filter', 'PortFast'],
      answer: 0,
      difficulty: 1,
      explanation:
        '**Root Guard** blocks a port that receives a superior BPDU (root-inconsistent), so the designed root stays root. Loop Guard reacts to missing BPDUs, BPDU Filter suppresses BPDUs, and PortFast only removes the forwarding delay.',
    },
    {
      id: 'q3',
      type: 'multi',
      stem: 'Which two commands enable PortFast? (Choose two.)',
      options: [
        '`spanning-tree portfast` in interface configuration mode',
        '`spanning-tree portfast default` in global configuration mode',
        '`spanning-tree bpduguard enable` in interface configuration mode',
        '`spanning-tree guard root` in interface configuration mode',
        '`spanning-tree mode rapid-pvst` in global configuration mode',
      ],
      answers: [0, 1],
      difficulty: 1,
      explanation:
        'PortFast is enabled per port with **`spanning-tree portfast`** or on all access ports with **`spanning-tree portfast default`**. The other commands enable BPDU Guard, Root Guard and Rapid PVST+.',
    },
    {
      id: 'q4',
      type: 'input',
      stem: 'Which global command makes the switch automatically re-enable ports that BPDU Guard has err-disabled?',
      answers: ['errdisable recovery cause bpduguard'],
      placeholder: 'command',
      difficulty: 2,
      explanation:
        '**`errdisable recovery cause bpduguard`** enables automatic recovery for that cause; the delay is set by `errdisable recovery interval` and defaults to 300 seconds.',
    },
    {
      id: 'q5',
      type: 'match',
      stem: 'Match each feature to what it does to the port.',
      pairs: [
        { left: 'BPDU Guard', right: 'err-disabled when any BPDU arrives' },
        { left: 'Root Guard', right: 'root-inconsistent when a superior BPDU arrives' },
        { left: 'Loop Guard', right: 'loop-inconsistent when BPDUs stop arriving' },
        { left: 'PortFast', right: 'forwarding immediately at link-up' },
      ],
      difficulty: 1,
      explanation:
        'BPDU Guard err-disables, Root Guard and Loop Guard hold the port in their respective inconsistent (blocked) states, and PortFast makes the port forward without delay.',
    },
    {
      id: 'q6',
      type: 'single',
      stem: 'Where should Loop Guard be enabled?',
      options: [
        'On root and alternate ports of switch-to-switch links',
        'On access ports connected to PCs',
        'Only on the designated ports of the root bridge',
        'On access ports connected to IP phones',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Loop Guard protects **non-designated** ports — root and alternate ports on inter-switch links — which depend on receiving BPDUs. Access ports get PortFast and BPDU Guard, and designated ports send BPDUs rather than depend on them.',
    },
    {
      id: 'q7',
      type: 'categorize',
      stem: 'Classify each port condition by how it is cleared with default settings.',
      categories: ['Recovers automatically', 'Needs manual action'],
      items: [
        { text: 'Root-inconsistent port (Root Guard)', category: 0 },
        { text: 'Loop-inconsistent port (Loop Guard)', category: 0 },
        { text: 'Port err-disabled by BPDU Guard', category: 1 },
        { text: 'Port err-disabled by port security in shutdown mode', category: 1 },
      ],
      difficulty: 2,
      explanation:
        'Inconsistent states clear themselves when superior BPDUs stop or missing BPDUs return. Err-disabled ports stay down until `shutdown`/`no shutdown` — unless errdisable recovery is configured, which it is not by default.',
    },
  ],
  exam: [
    {
      id: 'e1',
      type: 'single',
      stem: 'Refer to the exhibit. The lobby kiosk stopped working after a visitor connected a small switch to its wall jack. The switch has now been removed. Which action restores the port?',
      exhibit: {
        kind: 'cli',
        text: `AS1# show interfaces status err-disabled

Port      Name               Status       Reason               Err-disabled Vlans
Fa0/12    Lobby-Kiosk        err-disabled bpduguard`,
      },
      options: [
        'Enter `shutdown` and then `no shutdown` on Fa0/12',
        'Enter `no spanning-tree bpduguard enable` on Fa0/12 and wait for the port to recover',
        'Enter `clear spanning-tree detected-protocols`',
        'Nothing — the port recovers automatically once BPDUs stop arriving',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'BPDU Guard left Fa0/12 **err-disabled**. With the cause removed, a `shutdown` followed by `no shutdown` brings it back (or `errdisable recovery cause bpduguard` would do it automatically). Removing BPDU Guard does not re-enable an err-disabled port and would leave it unprotected. `clear spanning-tree detected-protocols` restarts protocol migration and does not touch err-disabled ports. Automatic recovery applies to Root Guard and Loop Guard inconsistent states, not to err-disabled ports.',
    },
    {
      id: 'e2',
      type: 'multi',
      stem: 'Which two statements about PortFast are true? (Choose two.)',
      options: [
        'It lets an access port start forwarding as soon as the link comes up',
        'A PortFast port that receives a BPDU loses its PortFast status',
        'It stops the port from sending BPDUs',
        'It should be enabled on trunks between switches to speed up convergence',
        'It err-disables the port if a switch is connected',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        'PortFast skips the listening/learning delay, and an edge port that hears a BPDU immediately reverts to a normal STP port. The port keeps sending BPDUs (stopping them is BPDU Filter), PortFast must never be used between switches, and err-disabling is BPDU Guard.',
    },
    {
      id: 'e3',
      type: 'single',
      stem: 'Refer to the exhibit. What caused the state of Gi0/2, and what happens when the cause is removed?',
      exhibit: {
        kind: 'cli',
        text: `DS1# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.25   P2p
Gi0/2               Desg BKN*4         128.26   P2p *ROOT_Inc`,
      },
      options: [
        'Gi0/2 received superior BPDUs while Root Guard was enabled; it returns to forwarding automatically when they stop',
        'Gi0/2 received a BPDU while BPDU Guard was enabled; an administrator must bounce the port',
        'Gi0/2 stopped receiving BPDUs while Loop Guard was enabled; it recovers when BPDUs resume',
        'Gi0/2 has BPDU Filter enabled and stays blocked until the filter is removed',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '`BKN*` with `*ROOT_Inc` means **root-inconsistent**: Root Guard saw a superior BPDU on Gi0/2, and it unblocks by itself once those BPDUs stop. BPDU Guard would leave the port err-disabled (not listed as BKN), Loop Guard would show `*LOOP_Inc`, and BPDU Filter never places a port in a blocked state.',
    },
    {
      id: 'e4',
      type: 'single',
      stem: 'Refer to the exhibit. No BPDU-related commands are configured on the interfaces. A user connects a switch to access port Fa0/8, and that switch sends BPDUs. What happens on Fa0/8?',
      exhibit: {
        kind: 'cli',
        text: `AS1# show spanning-tree summary | include Default
Portfast Default             is enabled
PortFast BPDU Guard Default  is disabled
Portfast BPDU Filter Default is enabled
Loopguard Default            is disabled`,
      },
      options: [
        'Fa0/8 loses its PortFast and BPDU filtering status and operates as a normal STP port',
        'Fa0/8 ignores the BPDUs, so a bridging loop can form through it',
        'Fa0/8 is placed in the err-disabled state',
        'Fa0/8 is placed in the root-inconsistent state',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Only the **global** BPDU Filter is active. Under the global form, a PortFast port that receives a BPDU **drops both PortFast and filtering** and participates in STP normally, so the new switch is handled safely. Ignoring received BPDUs is the behavior of the *interface* command `spanning-tree bpdufilter enable`. Err-disabling would require BPDU Guard, which is disabled, and root-inconsistent requires Root Guard.',
    },
    {
      id: 'e5',
      type: 'match',
      stem: 'Match each feature to its typical placement in a campus network.',
      pairs: [
        { left: 'PortFast + BPDU Guard', right: 'Access ports connected to end devices' },
        { left: 'Root Guard', right: 'Distribution ports facing access switches' },
        { left: 'Loop Guard', right: 'Root and alternate ports on switch-to-switch links' },
        { left: 'Interface BPDU Filter', right: 'A boundary where STP must deliberately not cross' },
      ],
      difficulty: 2,
      explanation:
        'Edge ports get PortFast with BPDU Guard; distribution downlinks get Root Guard so the root stays in the distribution layer; non-designated uplink ports get Loop Guard against unidirectional failures; and the interface BPDU Filter is reserved for rare STP-domain boundaries.',
    },
    {
      id: 'e6',
      type: 'single',
      stem: 'Which global command enables BPDU Guard on every PortFast-enabled port?',
      options: [
        '`spanning-tree portfast bpduguard default`',
        '`spanning-tree bpduguard enable`',
        '`spanning-tree portfast bpdufilter default`',
        '`spanning-tree guard root`',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        '**`spanning-tree portfast bpduguard default`** is the global form and applies to ports operating as PortFast ports. `spanning-tree bpduguard enable` is the interface form, the bpdufilter command enables global BPDU Filter, and `spanning-tree guard root` is an interface command for Root Guard.',
    },
    {
      id: 'e7',
      type: 'multi',
      stem: 'Refer to the exhibit. DS1 is the root bridge and DS2 the secondary root for all VLANs. On which two ports should Root Guard be enabled? (Choose two.)',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'ds1', icon: 'switch', label: 'DS1', sub: 'root', x: 2, y: 1.1, tone: 'accent' },
            { id: 'ds2', icon: 'switch', label: 'DS2', sub: 'secondary root', x: 8, y: 1.1 },
            { id: 'as1', icon: 'switch', label: 'AS1', x: 5, y: 3.9 },
          ],
          links: [
            { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1' },
            { from: 'ds1', to: 'as1', fromLabel: 'Gi0/2', toLabel: 'Gi0/1' },
            { from: 'ds2', to: 'as1', fromLabel: 'Gi0/2', toLabel: 'Gi0/2' },
          ],
        },
      },
      options: ['DS1 Gi0/2', 'DS2 Gi0/2', 'DS2 Gi0/1', 'AS1 Gi0/1', 'AS1 Gi0/2'],
      answers: [0, 1],
      difficulty: 3,
      explanation:
        'Root Guard belongs on designated ports where a better root must never appear: the **distribution downlinks** DS1 Gi0/2 and DS2 Gi0/2. DS2 Gi0/1 is DS2\'s root port toward the real root and legitimately receives superior BPDUs, so Root Guard there would isolate DS2. AS1 Gi0/1 and Gi0/2 are AS1\'s root and alternate ports; they receive superior BPDUs from the distribution layer by design — those ports are candidates for Loop Guard instead.',
    },
    {
      id: 'e8',
      type: 'single',
      stem: 'Which problem is Loop Guard designed to prevent?',
      options: [
        'A blocked port starting to forward after BPDUs stop arriving over a unidirectional link',
        'A user connecting an unauthorized switch to an access port',
        'A new switch with a lower priority taking over as root bridge',
        'Access ports waiting 30 seconds before forwarding',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'Loop Guard keeps a root or alternate port blocked (loop-inconsistent) when its BPDUs disappear, as happens on a **unidirectional** link. Unauthorized switches on access ports are handled by BPDU Guard, a rogue root by Root Guard, and the 30-second delay by PortFast.',
    },
    {
      id: 'e9',
      type: 'single',
      stem: 'Refer to the exhibit. A user connects a small switch to Fa0/9 and, by mistake, also cables that switch to Fa0/10 on AS1. Fa0/10 has only PortFast configured. What is the most likely result?',
      exhibit: {
        kind: 'cli',
        text: `AS1# show running-config interface FastEthernet0/9
Building configuration...

Current configuration : 113 bytes
!
interface FastEthernet0/9
 switchport mode access
 spanning-tree portfast
 spanning-tree bpdufilter enable
end`,
      },
      options: [
        'A bridging loop forms, because Fa0/9 neither sends nor processes BPDUs',
        'Fa0/9 loses its PortFast status, and STP blocks one of the two ports',
        'Fa0/9 is err-disabled by BPDU filtering',
        'Fa0/10 is placed in the root-inconsistent state',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'The **interface** BPDU Filter makes Fa0/9 ignore every received BPDU and send none, so AS1 never learns that Fa0/9 and Fa0/10 connect to the same switch. Both ports forward and a loop — and a broadcast storm — follows. Losing PortFast and rejoining STP is the behavior of the *global* filter. BPDU Filter never err-disables a port, and Root Guard is not configured.',
    },
    {
      id: 'e10',
      type: 'order',
      stem: 'Put the steps for restoring an access port that BPDU Guard err-disabled in the correct order.',
      items: [
        'Identify the port with `show interfaces status err-disabled`',
        'Confirm that the reason is bpduguard',
        'Remove the switch or hub that sent the BPDUs',
        'Enter `shutdown` on the interface',
        'Enter `no shutdown` on the interface',
      ],
      difficulty: 2,
      explanation:
        'Find the port and confirm the reason, remove the cause first — otherwise the next BPDU err-disables the port again — then bounce the interface with `shutdown` and `no shutdown`.',
    },
    {
      id: 'e11',
      type: 'single',
      stem: 'An engineer configures `spanning-tree portfast default` on an access switch. Which ports become PortFast (edge) ports?',
      options: [
        'All ports operating in access mode',
        'All ports, including trunks',
        'Only ports that also have BPDU Guard enabled',
        'Only ports assigned to VLAN 1',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'The global default applies PortFast to every port that is operating as an **access** (non-trunking) port. Trunks are excluded unless configured with `spanning-tree portfast trunk`, BPDU Guard is independent, and the VLAN assignment does not matter.',
    },
    {
      id: 'e12',
      type: 'categorize',
      stem: 'Classify each description by the protection feature it describes.',
      categories: ['BPDU Guard', 'Root Guard', 'Loop Guard'],
      items: [
        { text: 'Reacts to receiving any BPDU at all', category: 0 },
        { text: 'Reacts to receiving a superior BPDU', category: 1 },
        { text: 'Reacts to BPDUs no longer being received', category: 2 },
        { text: 'Leaves the port err-disabled', category: 0 },
        { text: 'Holds the port in the root-inconsistent state', category: 1 },
        { text: 'Protects against unidirectional link failures', category: 2 },
      ],
      difficulty: 2,
      explanation:
        'BPDU Guard: any BPDU → err-disabled. Root Guard: superior BPDU → root-inconsistent. Loop Guard: missing BPDUs → loop-inconsistent, which is exactly the unidirectional-link failure.',
    },
    {
      id: 'e13',
      type: 'single',
      stem: 'Refer to the exhibit. Which statement is true?',
      exhibit: {
        kind: 'cli',
        text: `AS1# show spanning-tree interface FastEthernet0/5 detail
 Port 5 (FastEthernet0/5) of VLAN0010 is designated forwarding
   Port path cost 19, Port priority 128, Port Identifier 128.5.
   Designated root has priority 24586, address 0019.e86a.6f80
   Designated bridge has priority 32778, address 0019.e8aa.0b00
   Designated port id is 128.5, designated path cost 4
   Timers: message age 0, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   The port is in the portfast mode
   Link type is point-to-point by default
   Bpdu guard is enabled
   BPDU: sent 2143, received 0`,
      },
      options: [
        'If a device that sends BPDUs is connected to Fa0/5, the port will be err-disabled',
        'Fa0/5 does not send BPDUs because PortFast is enabled',
        'Fa0/5 is the root port of AS1 for VLAN 10',
        'BPDU Guard on Fa0/5 comes from the global `spanning-tree portfast bpduguard default` command',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '"Bpdu guard is enabled" means the first BPDU received will **err-disable** Fa0/5. The counters show 2143 BPDUs sent — PortFast ports keep sending BPDUs. The port is designated, not root. A guard inherited from the global default is displayed as "Bpdu guard is enabled by default", so this one was configured on the interface.',
    },
    {
      id: 'e14',
      type: 'input',
      stem: 'Enter the interface configuration command that enables Root Guard.',
      answers: ['spanning-tree guard root'],
      placeholder: 'command',
      difficulty: 1,
      explanation: 'Root Guard is enabled per interface with **`spanning-tree guard root`**; there is no global Root Guard command. `spanning-tree guard loop` enables Loop Guard, and `spanning-tree guard none` disables both.',
    },
    {
      id: 'e15',
      type: 'multi',
      stem: 'Which two features return a port to normal operation automatically when the triggering condition ends, without any errdisable recovery configuration? (Choose two.)',
      options: ['Root Guard', 'Loop Guard', 'BPDU Guard', 'Port security with the default violation mode', 'Storm control with the shutdown action'],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        '**Root Guard** and **Loop Guard** only hold ports in inconsistent states that clear by themselves. BPDU Guard, port security in shutdown mode and storm control with the shutdown action all err-disable the port, which stays down until an administrator or errdisable recovery re-enables it.',
    },
    {
      id: 'e16',
      type: 'single',
      stem: "Refer to the exhibit. Gi0/1 is AS1's root port toward the root bridge. What is the effect of this configuration?",
      exhibit: {
        kind: 'cli',
        text: `AS1(config)# interface GigabitEthernet0/1
AS1(config-if)# spanning-tree guard loop
AS1(config-if)# spanning-tree guard root
AS1(config-if)# end
AS1# show running-config interface GigabitEthernet0/1 | include guard
 spanning-tree guard root`,
      },
      options: [
        'Only Root Guard is active, and Gi0/1 becomes root-inconsistent because it receives superior BPDUs from the root',
        'Both Loop Guard and Root Guard are active on Gi0/1',
        'Only Loop Guard is active, because the first guard command takes precedence',
        'Root Guard is ignored on root ports, so Gi0/1 keeps forwarding normally',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        '`spanning-tree guard` holds one value, so the second command **replaced** Loop Guard with Root Guard, as the running-config shows. A root port by definition receives superior BPDUs from the root, so Root Guard blocks it as **root-inconsistent** — which is why Root Guard must never be placed on root or alternate ports. The two guards cannot coexist on one port, and IOS does not exempt root ports.',
    },
    {
      id: 'e17',
      type: 'single',
      stem: 'On which type of port should PortFast never be enabled?',
      options: [
        'A trunk port connected to another switch',
        'An access port connected to a printer',
        'An access port connected to an IP phone with a PC behind it',
        'A trunk to a virtualization host, configured with `spanning-tree portfast trunk`',
      ],
      answer: 0,
      difficulty: 2,
      explanation:
        'A link to **another switch** must go through normal STP, or a temporary loop can form. Printers and IP phones (which do not run STP) are ideal PortFast ports, and `portfast trunk` exists precisely for trunks to servers and hypervisors.',
    },
    {
      id: 'e18',
      type: 'single',
      stem: 'Refer to the exhibit. AS1 Gi0/2 is an alternate port in VLAN 10. The fiber strand carrying traffic from DS2 to AS1 fails, but AS1 can still transmit to DS2. Loop Guard and UDLD are not configured. What happens?',
      exhibit: {
        kind: 'diagram',
        diagram: {
          type: 'topology',
          width: 10,
          height: 5,
          nodes: [
            { id: 'ds1', icon: 'switch', label: 'DS1 (root)', x: 2, y: 1.1, tone: 'accent' },
            { id: 'ds2', icon: 'switch', label: 'DS2', x: 8, y: 1.1 },
            { id: 'as1', icon: 'switch', label: 'AS1', x: 5, y: 3.9 },
          ],
          links: [
            { from: 'ds1', to: 'ds2', fromLabel: 'Gi0/1', toLabel: 'Gi0/1' },
            { from: 'ds1', to: 'as1', fromLabel: 'Gi0/2', toLabel: 'Gi0/1 (root port)' },
            { from: 'ds2', to: 'as1', label: 'DS2 → AS1 strand failed', fromLabel: 'Gi0/2', toLabel: 'Gi0/2 (alternate)', style: 'dashed', tone: 'bad' },
          ],
        },
      },
      options: [
        'AS1 Gi0/2 stops receiving BPDUs, becomes designated and starts forwarding, creating a loop',
        'AS1 Gi0/2 is err-disabled because the link is unidirectional',
        'AS1 Gi0/2 stays an alternate port because it can still send BPDUs',
        'DS2 Gi0/2 becomes root-inconsistent',
      ],
      answer: 0,
      difficulty: 3,
      explanation:
        'Without Loop Guard, AS1 ages out the stored BPDU on Gi0/2, assumes there is no designated bridge on the segment, makes Gi0/2 **designated** and forwards — while DS2 also forwards toward AS1, so a one-way loop forms. Err-disabling a unidirectional link is what UDLD aggressive mode would do, and it is not configured. Sending BPDUs does not keep a port alternate — receiving them does. Root Guard is not involved.',
    },
    {
      id: 'e19',
      type: 'single',
      stem: 'Which log message indicates that BPDU Guard has disabled a port?',
      options: [
        '`%SPANTREE-2-BLOCK_BPDUGUARD`',
        '`%SPANTREE-2-ROOTGUARD_BLOCK`',
        '`%SPANTREE-2-LOOPGUARD_BLOCK`',
        '`%SW_MATM-4-MACFLAP_NOTIF`',
      ],
      answer: 0,
      difficulty: 1,
      explanation:
        '**BLOCK_BPDUGUARD** reports a BPDU received on a BPDU Guard port (followed by a `%PM-4-ERR_DISABLE` message). ROOTGUARD_BLOCK and LOOPGUARD_BLOCK report inconsistent states, and MACFLAP_NOTIF reports a MAC address moving between ports, a typical loop symptom.',
    },
    {
      id: 'e20',
      type: 'single',
      stem: 'After `errdisable recovery cause bpduguard` is configured, how long does the switch wait by default before re-enabling an err-disabled port?',
      options: ['300 seconds', '30 seconds', '60 seconds', '3600 seconds'],
      answer: 0,
      difficulty: 1,
      explanation: 'The default `errdisable recovery interval` is **300 seconds** (5 minutes). It can be changed globally with `errdisable recovery interval <seconds>`.',
    },
    {
      id: 'e21',
      type: 'multi',
      stem: 'An access port connects to a single PC. Which two commands should be applied to the port to minimize startup delay and protect against a rogue switch? (Choose two.)',
      options: [
        '`spanning-tree portfast`',
        '`spanning-tree bpduguard enable`',
        '`spanning-tree bpdufilter enable`',
        '`spanning-tree guard loop`',
        '`spanning-tree portfast trunk`',
      ],
      answers: [0, 1],
      difficulty: 2,
      explanation:
        '**PortFast** removes the forwarding delay and **BPDU Guard** err-disables the port if a switch appears. The interface BPDU Filter would hide a rogue switch, Loop Guard is for root/alternate uplink ports, and `portfast trunk` is for trunks to servers.',
    },
    {
      id: 'e22',
      type: 'match',
      stem: 'Match each indicator to its cause.',
      pairs: [
        { left: '`%SPANTREE-2-BLOCK_BPDUGUARD`', right: 'A BPDU arrived on a BPDU Guard port' },
        { left: '`*ROOT_Inc`', right: 'A superior BPDU arrived on a Root Guard port' },
        { left: '`*LOOP_Inc`', right: 'BPDUs stopped arriving on a Loop Guard port' },
        { left: 'Status `err-disabled`, reason `bpduguard`', right: 'Port shut down and awaiting recovery' },
      ],
      difficulty: 2,
      explanation:
        'The BLOCK_BPDUGUARD message is logged at the moment BPDU Guard acts; the err-disabled status with reason bpduguard is what remains afterward. `*ROOT_Inc` and `*LOOP_Inc` appear in `show spanning-tree` for ports blocked by Root Guard and Loop Guard.',
    },
  ],
};

export default lesson;
