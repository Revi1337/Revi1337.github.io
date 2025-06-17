---
title: Scapy Usage
tags: ['python', 'scapy']
---


```python
>>> ip = IP(src="172.30.1.78", dst="172.30.1.78")
>>> tcp = TCP(sport=9997, dport=8080)
>>> l3 = ip/tcp
>>> l2 = Ether()/l3
>>> recv = sr(l3)
Begin emission
.
Finished sending 1 packets
*
Received 2 packets, got 1 answers, remaining 0 packets
```
