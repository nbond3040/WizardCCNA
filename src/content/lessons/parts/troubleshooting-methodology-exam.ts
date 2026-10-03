import type { Question } from '../../types';

export const exam: Question[] = [
  {
    id: 'e1',
    type: 'single',
    stem: 'A technician starts by checking the application and then works down through the OSI layers. Which troubleshooting method is this?',
    options: ['Top-down', 'Bottom-up', 'Divide and conquer', 'Follow the path'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**Top-down** starts at Layer 7 and moves toward Layer 1. Bottom-up starts at the physical layer, divide and conquer starts in the middle (usually with a Layer 3 ping), and follow the path traces the actual route of the traffic hop by hop.',
  },
  {
    id: 'e2',
    type: 'match',
    stem: 'Match each Cisco IOS ping symbol to its meaning.',
    pairs: [
      { left: '`!`', right: 'Echo reply received' },
      { left: '`.`', right: 'Timeout: no reply received' },
      { left: '`U`', right: 'ICMP destination unreachable received' },
      { left: '`M`', right: 'Could not fragment (DF bit set)' },
      { left: '`&`', right: 'Packet lifetime (TTL) exceeded' },
    ],
    difficulty: 1,
    explanation:
      'The exclamation mark is success and the period is silence. `U` is an actual answer from a router saying unreachable. `M` appears when a too-large packet has the DF bit set, and `&` appears when the TTL expires, for example in a loop.',
  },
  {
    id: 'e3',
    type: 'single',
    stem: 'Which ICMP message does a router return to the source when it discards a packet because the TTL reached zero?',
    options: ['Time Exceeded', 'Echo Reply', 'Redirect', 'Source Quench'],
    answer: 0,
    difficulty: 1,
    explanation:
      '**ICMP Time Exceeded** (type 11) is what traceroute relies on to discover each hop. Echo Reply answers a ping, Redirect points a host to a better gateway, and Source Quench is an obsolete congestion message.',
  },
  {
    id: 'e4',
    type: 'match',
    stem: 'Match each command to what it does.',
    pairs: [
      { left: '`show logging`', right: 'Displays buffered syslog messages' },
      { left: '`show ip interface brief`', right: 'One-line status and protocol of every interface' },
      { left: '`show interfaces`', right: 'Detailed counters such as CRC errors and collisions' },
      { left: '`debug ip icmp`', right: 'Shows ICMP packets as the router sends and receives them' },
    ],
    difficulty: 1,
    explanation:
      '`show logging` reads the log buffer, `show ip interface brief` summarises status and protocol, `show interfaces` provides the detailed counters used to spot cabling and duplex faults, and `debug ip icmp` displays live ICMP activity (and must be switched off afterwards).',
  },
  {
    id: 'e5',
    type: 'input',
    stem: 'Which Windows command displays the IP address, subnet mask, default gateway, DNS servers and MAC address of a host? Enter the command with its option.',
    answers: ['ipconfig /all', 'ipconfig/all'],
    placeholder: 'command',
    difficulty: 1,
    explanation:
      '`ipconfig /all` shows the full configuration, including DNS servers, MAC address and DHCP status. Plain `ipconfig` omits the DNS servers and MAC address.',
  },
  {
    id: 'e6',
    type: 'single',
    stem: 'Refer to the exhibit. What does the result indicate?',
    exhibit: {
      kind: 'cli',
      text: `R1# ping 10.30.30.10 size 1500 df-bit repeat 5
Type escape sequence to abort.
Sending 5, 1500-byte ICMP Echos to 10.30.30.10, timeout is 2 seconds:
Packet sent with the DF bit set
MMMMM
Success rate is 0 percent (0/5)`,
    },
    options: [
      'A link on the path has an MTU smaller than 1500 bytes',
      'The destination host is powered off',
      'The packets exceeded their TTL because of a routing loop',
      'An ACL is silently dropping ICMP traffic',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The symbol `M` means a router replied that the packet **could not be fragmented** because the DF bit was set, so some link on the path has an MTU below 1500 bytes (a tunnel is a common culprit). A powered-off host or a silent ACL drop would show periods, a loop or low TTL would show `&`, and an ACL that rejects the packet would show `U`.',
  },
  {
    id: 'e7',
    type: 'single',
    stem: 'Refer to the exhibit. R1 pings 10.30.30.10 and sees UUUUU. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# ping 10.30.30.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.30.30.10, timeout is 2 seconds:
UUUUU
Success rate is 0 percent (0/5)

R1# show ip route 10.30.30.10
Routing entry for 10.30.30.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
      Route metric is 0, traffic share count is 1

R2# show ip route 10.30.30.10
% Network not in table`,
    },
    options: [
      'R2 has no route to 10.30.30.0/24 and is returning ICMP destination unreachable messages',
      'R1 has no route to 10.30.30.0/24',
      'The server at 10.30.30.10 is powered off',
      'The packets are larger than the MTU of the link between R1 and R2',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'R1 has a static route via 10.0.12.2 and forwards the probes, but R2 reports `% Network not in table`, so R2 answers each probe with an ICMP destination unreachable, shown as `U`. R1 clearly has its route, a powered-off server would not explain why R2 has no route for the entire /24, and an MTU problem would show `M`.',
  },
  {
    id: 'e8',
    type: 'single',
    stem: 'Refer to the exhibit. Where should the engineer begin investigating?',
    exhibit: {
      kind: 'cli',
      text: `R1# traceroute 10.40.40.10
Type escape sequence to abort.
Tracing the route to 10.40.40.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
  2 10.0.23.3 2 msec 2 msec 2 msec
  3  *  *  *
  4  *  *  *
  5  *  *  *`,
    },
    options: [
      'The router at 10.0.23.3, which was the last hop to respond, and the path beyond it',
      'The router at 10.0.12.2, because it was the first hop',
      'The PC that started the trace, because asterisks mean its NIC failed',
      'The DNS server, because traceroute depends on name resolution',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Probes with TTL 1 and 2 were answered, then contact was lost, so the last responding router (10.0.23.3) is where to look: its route toward 10.40.40.10, any ACL, and whether the next device has a return route. Hop 1 answered correctly, asterisks do not indicate a failed source NIC, and traceroute works with IP addresses, so DNS is not involved.',
  },
  {
    id: 'e9',
    type: 'single',
    stem: 'Refer to the exhibit. A user reports that the PC connected to GigabitEthernet1/0/3 has no link. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  unassigned      YES unset  administratively down down
Vlan10                 192.168.10.2    YES manual up                    up
GigabitEthernet1/0/1   unassigned      YES unset  up                    up
GigabitEthernet1/0/2   unassigned      YES unset  down                  down
GigabitEthernet1/0/3   unassigned      YES unset  administratively down down`,
    },
    options: [
      'The port was shut down with the shutdown command',
      'The cable is faulty',
      'A duplex mismatch exists',
      'The port is in the wrong VLAN',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Status `administratively down` means the interface was disabled by configuration, and `no shutdown` restores it. A cable fault on Gi1/0/2 would appear as plain `down/down`, a duplex mismatch leaves the port `up/up` with errors, and a wrong VLAN does not change the interface status.',
  },
  {
    id: 'e10',
    type: 'single',
    stem: 'Refer to the exhibit. Users on this port report slow transfers. Which action should the engineer take first?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces GigabitEthernet1/0/7
GigabitEthernet1/0/7 is up, line protocol is up (connected)
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  5 minute input rate 2000 bits/sec, 3 packets/sec
     0 runts, 0 giants, 0 throttles
     4821 input errors, 4821 CRC, 0 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 1 interface resets`,
    },
    options: [
      'Replace or re-terminate the cable and check for interference',
      'Configure a larger MTU on the port',
      'Change the port to half duplex',
      'Move the port to a different VLAN',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The port is up/up at full duplex with no collisions but thousands of **CRC errors**, which points to Layer 1: a damaged or badly terminated cable, interference or a faulty NIC. A larger MTU is unrelated to corrupted frames, half duplex would create a mismatch, and the VLAN has no effect on CRC errors.',
  },
  {
    id: 'e11',
    type: 'single',
    stem: 'Refer to the exhibit. SW1 and SW2 are connected by a link between their Fa0/24 ports. Which problem do the counters indicate?',
    exhibit: {
      kind: 'cli',
      text: `SW1# show interfaces FastEthernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
     2874 runts, 0 giants, 0 throttles
     5120 input errors, 5120 CRC, 2246 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 0 interface resets

SW2# show interfaces FastEthernet0/24
FastEthernet0/24 is up, line protocol is up (connected)
  Half-duplex, 100Mb/s, media type is 10/100BaseTX
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     3302 output errors, 4412 collisions, 0 interface resets
     0 babbles, 3302 late collision, 0 deferred`,
    },
    options: [
      'A duplex mismatch: SW1 is full-duplex and SW2 is half-duplex',
      'A speed mismatch between 10 and 100 Mb/s',
      'A Layer 3 addressing conflict',
      'A native VLAN mismatch',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'Both ports run at 100 Mb/s, so the speeds match, but SW1 is full-duplex and SW2 is half-duplex. The half-duplex side reports collisions and **late collisions**, while the full-duplex side sees **runts, CRC and frame errors**. A speed mismatch would normally bring the link down, a native VLAN mismatch produces log messages rather than these counters, and addressing conflicts do not appear in interface counters.',
  },
  {
    id: 'e12',
    type: 'multi',
    stem: 'Which two commands help verify Layer 2 operation on a switch? (Choose two.)',
    options: [
      'show mac address-table',
      'show interfaces trunk',
      'show ip route',
      'show ip ospf neighbor',
      'show access-lists',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The MAC address table shows which addresses the switch learned on which ports, and `show interfaces trunk` shows trunk status, allowed VLANs and native VLAN; both are Layer 2 checks. `show ip route` and `show ip ospf neighbor` examine Layer 3 routing, and `show access-lists` examines ACL matches.',
  },
  {
    id: 'e13',
    type: 'multi',
    stem: 'Which two statements about a plain Cisco IOS ping (no extended options) are true? (Choose two.)',
    options: [
      'It sends five 100-byte ICMP echo requests by default',
      'The source address is the address of the outgoing interface unless a source is specified',
      'It sets the DF bit by default',
      'It uses a 5-second timeout by default',
      'It sends UDP probes to port 33434',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'The defaults are five probes of 100 bytes, a 2-second timeout and the outgoing interface as the source. The DF bit is off unless requested, the timeout is 2 seconds rather than 5, and UDP probes to port 33434 describe traceroute, not ping.',
  },
  {
    id: 'e14',
    type: 'single',
    stem: 'Which statement about the traceroute command on Cisco IOS is true?',
    options: [
      'It sends UDP probes with increasing TTL values and expects an ICMP port unreachable message from the destination',
      'It sends TCP SYN packets to port 80 and waits for a SYN-ACK',
      'It sends only ICMP echo requests, like the Windows tracert command',
      'It sets the TTL to 255 and counts down to find the hop count',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'IOS traceroute sends **UDP** probes whose TTL increases from 1; intermediate routers answer with ICMP Time Exceeded and the destination with ICMP Port Unreachable. Windows tracert is the tool that uses ICMP echo, TCP SYN probes are not the default, and the TTL counts up from 1, not down from 255.',
  },
  {
    id: 'e15',
    type: 'single',
    stem: 'Refer to the exhibit. A host cannot reach its default gateway. What does the capture indicate?',
    exhibit: {
      kind: 'cli',
      text: `No.  Time       Source              Destination         Protocol  Info
1    0.000000   aa:bb:cc:00:00:0a   ff:ff:ff:ff:ff:ff   ARP       Who has 192.168.10.1? Tell 192.168.10.50
2    1.000812   aa:bb:cc:00:00:0a   ff:ff:ff:ff:ff:ff   ARP       Who has 192.168.10.1? Tell 192.168.10.50
3    2.001640   aa:bb:cc:00:00:0a   ff:ff:ff:ff:ff:ff   ARP       Who has 192.168.10.1? Tell 192.168.10.50`,
    },
    options: [
      'Nothing answers ARP for the gateway, so check the Layer 1 and Layer 2 path: cable, port status, VLAN and the gateway interface',
      'DNS resolution is failing',
      'The gateway has no route to the Internet',
      'The TCP handshake is incomplete',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'Three broadcast ARP requests for 192.168.10.1 went unanswered, so no device is replying for the gateway address: check the cable, the switch port and VLAN, and the gateway interface. DNS and TCP have not even started, and a missing Internet route would not stop the gateway from answering ARP.',
  },
  {
    id: 'e16',
    type: 'single',
    stem: 'Refer to the exhibit. What can be concluded?',
    exhibit: {
      kind: 'cli',
      text: `No.  Time      Source          Destination     Protocol  Info
1    0.000000  192.168.10.50   10.30.30.10     TCP       51022 -> 8080 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
2    0.001500  10.30.30.10     192.168.10.50   TCP       8080 -> 51022 [RST, ACK] Seq=1 Ack=1 Win=0 Len=0`,
    },
    options: [
      'The server is reachable, but nothing is listening on TCP port 8080',
      'A firewall silently dropped the SYN',
      'The server completed the three-way handshake',
      'The client is using the wrong default gateway',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The server answered the SYN immediately with `[RST, ACK]`: the host is reachable and responding, but no service accepts connections on port 8080. A silent drop would show repeated SYNs with no answer, a completed handshake would include a SYN-ACK, and a wrong gateway would have prevented any reply at all.',
  },
  {
    id: 'e17',
    type: 'single',
    stem: 'Refer to the exhibit. Pings to 10.30.30.10 succeed. Which cause best explains the capture?',
    exhibit: {
      kind: 'cli',
      text: `No.  Time      Source          Destination   Protocol  Info
1    0.000000  192.168.10.50   10.30.30.10   TCP       51030 -> 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
2    1.003100  192.168.10.50   10.30.30.10   TCP       [TCP Retransmission] 51030 -> 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460
3    3.010500  192.168.10.50   10.30.30.10   TCP       [TCP Retransmission] 51030 -> 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460`,
    },
    options: [
      'A firewall or ACL is silently dropping TCP 443 toward the server',
      'The server rejected the connection with a RST',
      'DNS failed to resolve the server name',
      'The client is using an APIPA address',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The client retried the SYN at roughly 1 and 3 seconds with neither SYN-ACK nor RST coming back, and ping works, so Layer 3 is fine. A device is silently dropping TCP 443, typically a firewall or ACL. A closed port would answer with RST, a DNS failure would occur before any SYN, and an APIPA address could not reach the server at all.',
  },
  {
    id: 'e18',
    type: 'multi',
    stem: 'Refer to the exhibit. A client repeats DHCP Discover messages and eventually shows a 169.254.x.x address. Which two checks should the engineer perform next? (Choose two.)',
    exhibit: {
      kind: 'cli',
      text: `No.  Time       Source    Destination      Protocol  Info
1    0.000000   0.0.0.0   255.255.255.255  DHCP      DHCP Discover - Transaction ID 0x7c11a2b0
2    4.012000   0.0.0.0   255.255.255.255  DHCP      DHCP Discover - Transaction ID 0x7c11a2b0
3    12.020000  0.0.0.0   255.255.255.255  DHCP      DHCP Discover - Transaction ID 0x7c11a2b0`,
    },
    options: [
      'Confirm that the DHCP server is reachable and its pool has free addresses',
      'If the server is on another subnet, verify the ip helper-address on the gateway interface',
      'Flush the DNS cache on the client',
      'Change the default gateway address on the client',
      'Reduce the TCP window size on the client',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Discover messages with no Offer mean no DHCP server answered: check that the server is up and has free leases, and that the gateway relays the broadcast with `ip helper-address` when the server is remote. A DNS cache, the gateway setting and the TCP window are irrelevant to DHCP discovery, and the 169.254.x.x address is simply the APIPA fallback.',
  },
  {
    id: 'e19',
    type: 'single',
    stem: 'Refer to the exhibit. Which statement describes the situation and the best first action?',
    exhibit: {
      kind: 'cli',
      text: `R1# show logging | begin Log Buffer
Log Buffer (4096 bytes):

*Oct  3 09:01:10.101: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to down
*Oct  3 09:01:12.103: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up
*Oct  3 09:01:15.221: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to down
*Oct  3 09:01:17.224: %LINK-3-UPDOWN: Interface GigabitEthernet0/0/1, changed state to up`,
    },
    options: [
      'The interface is flapping; check the cable, the transceiver and the far-end port',
      'OSPF has converged, so no action is needed',
      'The interface is administratively down',
      'The routing table has been cleared',
    ],
    answer: 0,
    difficulty: 2,
    explanation:
      'The link changes state every few seconds, which is **flapping** and is usually physical: a loose or damaged cable, a failing transceiver or an unstable far-end port. The messages show link down and up events, not an administrative shutdown, and nothing in the log refers to OSPF or the routing table.',
  },
  {
    id: 'e20',
    type: 'order',
    stem: 'Put the steps of a traceroute in the order in which they occur.',
    items: [
      'The source sends a probe with TTL 1',
      'The first router decrements the TTL to 0 and discards the probe',
      'The first router returns an ICMP Time Exceeded message',
      'The source sends the next probe with TTL 2',
      'The destination eventually receives a probe and replies, with ICMP Port Unreachable for UDP probes',
    ],
    difficulty: 2,
    explanation:
      'Traceroute works outward one hop at a time: probe, TTL expiry, Time Exceeded reply that reveals the hop, a new probe with a larger TTL, and finally a reply from the destination itself.',
  },
  {
    id: 'e21',
    type: 'match',
    stem: 'Match each client command to its purpose.',
    pairs: [
      { left: '`ipconfig /all`', right: 'Shows address, mask, gateway, DNS servers and MAC of a Windows host' },
      { left: '`arp -a`', right: 'Displays IP-to-MAC mappings learned by the host' },
      { left: '`nslookup`', right: 'Tests name resolution against a DNS server' },
      { left: '`route print`', right: 'Shows the host routing table, including the default route' },
      { left: '`tracert`', right: 'Traces the path with ICMP echo requests on Windows' },
    ],
    difficulty: 2,
    explanation:
      'Each command targets a different layer of the client: configuration (`ipconfig /all`), Layer 2 resolution (`arp -a`), name resolution (`nslookup`), routing (`route print`) and path discovery (`tracert`).',
  },
  {
    id: 'e22',
    type: 'categorize',
    stem: 'Classify each finding by the OSI layer at which the fault lies.',
    categories: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
    items: [
      { text: 'The interface is down/down and the link light is off', category: 0 },
      { text: 'Rising CRC errors from a damaged patch cable', category: 0 },
      { text: 'The access port is in the wrong VLAN, so the gateway MAC is never learned', category: 1 },
      { text: 'A trunk allows VLAN 10 but not VLAN 20', category: 1 },
      { text: 'Ping to the gateway works, but a remote subnet returns Destination net unreachable', category: 2 },
      { text: 'The router has no route to 10.30.30.0/24', category: 2 },
      { text: 'A SYN to TCP port 8080 is answered by RST', category: 3 },
      { text: 'An ACL permits TCP 443 but denies TCP 80', category: 3 },
    ],
    difficulty: 3,
    explanation:
      'Link state and CRC errors are physical (Layer 1). VLAN assignment and trunk allowed lists are Layer 2. Missing routes and unreachable remote subnets are Layer 3. Port-based behaviour such as RST responses and ACLs that filter by TCP port is Layer 4.',
  },
  {
    id: 'e23',
    type: 'single',
    stem: 'Refer to the exhibit. PC1 (192.168.10.10) behind R1 cannot reach 10.30.30.10, although R1 can. What is the most likely cause?',
    exhibit: {
      kind: 'cli',
      text: `R1# ping 10.30.30.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.30.30.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 2/3/4 ms

R1# ping 10.30.30.10 source GigabitEthernet0/0/0
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.30.30.10, timeout is 2 seconds:
Packet sent with a source address of 192.168.10.1
.....
Success rate is 0 percent (0/5)`,
    },
    options: [
      'The remote side has no route back to 192.168.10.0/24',
      'R1 has no route to 10.30.30.0/24',
      'The server is powered off',
      'The ping size is larger than the link MTU',
    ],
    answer: 0,
    difficulty: 3,
    explanation:
      'The first ping uses the address of the outgoing interface as its source and succeeds, so R1 has a forward route and the server is up. The same destination fails when the source is the LAN address 192.168.10.1, so replies to that subnet cannot return: R2 or the server lacks a route to 192.168.10.0/24. A missing forward route or a powered-off server would break the first ping too, and an MTU problem would show `M`.',
  },
  {
    id: 'e24',
    type: 'multi',
    stem: 'A user can ping the default gateway and can ping the web server by IP address, but the browser cannot open http://intranet.example.com. Which two actions should the engineer take next? (Choose two.)',
    options: [
      'Run nslookup intranet.example.com to test name resolution',
      'Run ipconfig /all to check which DNS servers the client uses',
      'Replace the patch cable between the PC and the switch',
      'Change the default gateway address on the client',
      'Add a static route on the gateway router',
    ],
    answers: [0, 1],
    difficulty: 3,
    explanation:
      'Successful pings by IP address prove Layers 1 to 3 along the path, so the fault is name resolution. `nslookup` tests DNS directly and `ipconfig /all` reveals which DNS servers the client was given. The cable, the gateway address and a static route are all working or irrelevant, because traffic to the server already flows.',
  },
  {
    id: 'e25',
    type: 'multi',
    stem: 'Which two statements about debug commands are true? (Choose two.)',
    options: [
      'Debug output is processed by the CPU and can degrade a busy router',
      'undebug all stops all debugging',
      'Debug commands are always safe to run in production',
      'Debug output is saved permanently in the startup configuration',
      'Debug messages are never shown in an SSH session',
    ],
    answers: [0, 1],
    difficulty: 2,
    explanation:
      'Debugging consumes CPU and can disrupt a busy device, so use narrow commands briefly and stop with `undebug all`. It is not always safe, it is not stored in the configuration, and debug output does appear in an SSH session once `terminal monitor` is enabled.',
  },
];
