---
title: Docker Network
tags: ['docker']
---

## Docker Network
각 컨테이너는 독립적인 공간을 갖기 때문에 컨테이너끼리의 통신은 불가능합니다. 하지만, `Docker Network`를 생성하고 통신하고자 하는 컨테이너들을 같은 네트워크에 연결하면 컨테이너끼리 통신이 가능해집니다. 

도커 네트워크는 4가지로 구분됩니다.

1. Bridge Network
2. Host Network
3. None Network
4. Overlay Network (Overlay는 다루지 않습니다.)


## Bridge
Bridge Network는 도커가 기본적으로 사용하는 네트워크 드라이버입니다. 도커 호스트 내에서 격리된 네트워크를 형성하며, 주로 단일 호스트에서 여러 컨테이너를 연결하는데 사용됩니다.

우분투 컨테이너를 이름 `ubuntu-container`로 생성하고, 쉘 실행합니다. 이 때, 네트워크를 지정하지 않으면, 자동으로 도커 기본 bridge 네트워크(bridge0)를 사용하게 됩니다.

우분투 컨테이너 내에서 네트워크 인터페이스 상태를 확인하면, 기본 브리지(bridge0) 네트워크 대역인 172.17.0.2로 할당된 것을 확인할 수 있습니다.

> ping, ifconfig 등의 커맨드가 없으면 apt update && apt install net-tools iputils-ping -y 를 하면 됩니다.

```bash
docker run --name ubuntu-container -it ubuntu bash

# ubuntu-container
ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 65535
	inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
	ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
	RX packets 9  bytes 1046 (1.0 KB)
	RX errors 0  dropped 0  overruns 0  frame 0
	TX packets 0  bytes 0 (0.0 B)
	TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```


도커 브리지 네트워크 `test-bridge`를 서브넷 `10.0.0.0/24`, 게이트웨이 `10.0.0.1` 설정으로 새로 생성합니다.

```bash
docker network create --driver=bridge --subnet=10.0.0.0/24 --gateway=10.0.0.1 test-bridge
```


레디스 컨테이너를 백그라운드 실행, `test-bridge` 네트워크에 고정 IP `10.0.0.3` 할당, 호스트 포트 6379를 컨테이너 6379에 매핑합니다.

```bash
docker run -d --name redis-container --network=test-bridge --ip=10.0.0.3 -p 6379:6379 redis:latest
```


우분투와 레디스 컨테이너는 서로 네트워크가 다르기 때문에 서로 통신할 수 없는 것을 확인할 수 있습니다.

```bash {6}
# ubuntu-container
ping 10.0.0.3
PING 10.0.0.3 (10.0.0.3) 56(84) bytes of data.
^C
--- 10.0.0.3 ping statistics ---
9 packets transmitted, 0 received, 100% packet loss, time 8208ms
```

![](Docker/images/Pasted%20image%2020250812032200.png)

<br><br>

이제 두 컨테이너를 서로 통신할 수 있게 만들어보겠습니다. 앞서 생성한 `test-bridge` 네트워크를 우분투 컨테이너에 연결합니다.

```bash
docker network connect test-bridge --ip=10.0.0.2 ubuntu-container
docker start ubuntu-container
docker exec -it ubuntu-container bash
```


우분투 컨테이너에 eth1라는 새로운 NIC가 생긴 것을 확인할 수 있고, `10.0.0.2` IP 를 할당받은 것을 확인할 수 있습니다.

```bash {4,12}
# ubuntu-container
ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 65535
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
        RX packets 9  bytes 1046 (1.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.2  netmask 255.255.255.0  broadcast 10.0.0.255
        ether 02:42:0a:00:00:02  txqueuelen 0  (Ethernet)
        RX packets 7  bytes 746 (746.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```


우분투 컨테이너와 레디스 컨테이너 모두 `test-bridge` 라는 네트워크에 속하기 때문에 통신이 가능해진 것을 확인할 수 있습니다.

```bash {12}
# ubuntu-container
ping 10.0.0.3
PING 10.0.0.3 (10.0.0.3) 56(84) bytes of data.
64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=0.117 ms
64 bytes from 10.0.0.3: icmp_seq=2 ttl=64 time=0.152 ms
64 bytes from 10.0.0.3: icmp_seq=3 ttl=64 time=0.164 ms
64 bytes from 10.0.0.3: icmp_seq=4 ttl=64 time=0.134 ms
64 bytes from 10.0.0.3: icmp_seq=5 ttl=64 time=0.140 ms
64 bytes from 10.0.0.3: icmp_seq=6 ttl=64 time=0.146 ms
^C
--- 10.0.0.3 ping statistics ---
6 packets transmitted, 6 received, 0% packet loss, time 5144ms
```

![](Docker/images/Pasted%20image%2020250812033351.png)


`docker network inspect 네트워크이름 혹은 ID`를 통해 해당 네트워크에 속한 컨테이너들을 확인할 수 있습니다. 우분투 컨테이너가 도커 기본 브릿지 네트워크인 docker0 에 속한 것을 확인할 수 있습니다.

```bash
revi1337@B3-B35T ~ % docker network inspect bridge | jq '.[0].Containers'
{
  "7d9955a88dfa8ba91949df10b3e47699de7f3a8cff96ffba866ff3236320bfda": {
    "Name": "ubuntu-container",
    "EndpointID": "44fb5ee161feb382d409e574c9a1644b422f5c4e6872cf98cce588a8122cf44d",
    "MacAddress": "02:42:ac:11:00:02",
    "IPv4Address": "172.17.0.2/16",
    "IPv6Address": ""
  }
}
```


우분투 & 레디스 컨테이너 모두 `test-bridge` 네트워크에 속한 것을 확인할 수 있습니다.

```bash {4,11}
revi1337@B3-B35T ~ % docker network inspect test-bridge | jq '.[0].Containers'
{
  "7d9955a88dfa8ba91949df10b3e47699de7f3a8cff96ffba866ff3236320bfda": {
    "Name": "ubuntu-container",
    "EndpointID": "9c63b818f411a9436ae91ef486d97f108442c7e257c224939d3daa2cce46ed9d",
    "MacAddress": "02:42:0a:00:00:02",
    "IPv4Address": "10.0.0.2/24",
    "IPv6Address": ""
  },
  "b30e88ce677525019e2305f52a8e009d8ff66b4b86c14bc461849a8732823bc3": {
    "Name": "redis-container",
    "EndpointID": "8ce36e77a2cfcc3998acbcd3674a77048a60d1e449e7c590a6e387b1bd861ffb",
    "MacAddress": "02:42:0a:00:00:03",
    "IPv4Address": "10.0.0.3/24",
    "IPv6Address": ""
  }
}
```


## Host
Host Network는 컨테이너가 도커 호스트의 네트워크 스택을 직접 사용하도록 합니다. 이 경우, 컨테이너는 별도의 네트워크 네임스페이스를 가지지 않고, 호스트와 동일한 네트워크 인터페이스를 공유합니다. 따라서 브리지(bridge) 모드와 달리 포트 노출 설정이 필요 없으며, 포트 매핑 없이도 호스트 네트워크에 바로 접근할 수 있습니다. 이로 인해 네트워크 관점에서는 컨테이너라기보다 호스트에서 실행되는 하나의 새로운 프로세스로 보는 것이 더 정확할 수 있습니다.

> Windows 혹은 Mac 일 경우 Host 네트워크가 정상적으로 동작하지 않습니다.


도커 호스트인 Amacon EC2의 NIC와 IP 주소는 아래와 같습니다.

```bash
# Docker Host EC2 Linux
ifconfig enX0 | grep inet
	inet 172.31.46.39  netmask 255.255.240.0  broadcast 172.31.47.255
	inet6 fe80::864:d1ff:fe6c:86bb  prefixlen 64  scopeid 0x20<link>
```


redis-host 컨테이너를 생성하고 Host 네트워크에 연결합니다. 도커 호스트인 EC2와 NIC와 IP주소가 동일한 것을 확인할 수 있습니다.

```bash
# redis-host Container
docker run -d --name redis-host --network=host -it redis
docker exec -it redis-host bash

ifconfig enX0 | grep inet
	inet 172.31.46.39  netmask 255.255.240.0  broadcast 172.31.47.255
	inet6 fe80::864:d1ff:fe6c:86bb  prefixlen 64  scopeid 0x20<link>
```


ubuntu-host 컨테이너를 생성하고 Host 네트워크에 연결합니다. 마찬가지로 도커 호스트인 EC2와 NIC와 IP주소가 동일한 것을 확인할 수 있습니다.

```bash
# ubuntu-host Container
docker run --name ubuntu-host --network=host ubuntu
docker exec -it ubuntu-host bash
apt update && apt install -y net-tools iputils-ping redis-tools

ifconfig enX0 | grep inet
	inet 172.31.46.39  netmask 255.255.240.0  broadcast 172.31.47.255
	inet6 fe80::864:d1ff:fe6c:86bb  prefixlen 64  scopeid 0x20<link>
```


ubuntu-host 컨테이너에서 redis-host 컨테이너로 잘 연결되는 것을 확인할 수 있습니다. 또한 도커 호스트인 EC2에서도 redis-host 컨테이너로 잘 연결되는 것을 확인할 수 있습니다.

```bash
# ubuntu-host Conatiner
redis-cli ping
PONG


# Docker Host EC2 Linux
redis-cli ping
PONG
```

![](Docker/images/Pasted%20image%2020250812185020.png)


## None
None Network는 네트워크가 전혀 연결되지 않은 상태로 컨테이너를 실행하는 네트워크 모드입니다. 네트워크 인터페이스가 lo 밖에 없기 때문에, 외부와의 통신이 불가능합니다.

```bash
docker run --name ubuntu-none --network=none -it ubuntu bash

apt update
Ign:1 http://ports.ubuntu.com/ubuntu-ports noble InRelease
...
W: Failed to fetch http://ports.ubuntu.com/ubuntu-ports/dists/noble/InRelease  Temporary failure resolving 'ports.ubuntu.com'
W: Failed to fetch http://ports.ubuntu.com/ubuntu-ports/dists/noble-updates/InRelease  Temporary failure resolving 'ports.ubuntu.com'
W: Failed to fetch http://ports.ubuntu.com/ubuntu-ports/dists/noble-backports/InRelease  Temporary failure resolving 'ports.ubuntu.com'
W: Failed to fetch http://ports.ubuntu.com/ubuntu-ports/dists/noble-security/InRelease  Temporary failure resolving 'ports.ubuntu.com'
W: Some index files failed to download. They have been ignored, or old ones used instead.
```


## CheetSheet
존재하는 도커 네트워크들을 출력합니다.

```bash
docker network ls

NETWORK ID     NAME      DRIVER    SCOPE
ae07710dabe6   bridge    bridge    local
232402bf2ad3   host      host      local
3de7e3b06e4f   none      null      local
```


네트워크를 생성합니다. 사용할 드라이버, 서브넷, 게이트웨이 주소를 명시할 수 있습니다.

```bash
docker network create --driver=bridge --subnet=10.0.0.0/24 --gateway=10.0.0.1 test-bridge
```


네트워크에 대한 상세정보를 확인 가능합니다. 해당 네트워크에 속한 컨테이너들을 확인할 수 있습니다.

```bash
docker network inspect 네트워크 이름 혹은 ID
```


네트워크를 제거합니다.

```bash
docker network rm 네트워크 이름 혹은 ID
```


## Reference
[Docker 그리고 Docker Network](https://with-cloud.tistory.com/55)

[Docker Networking Tutorial](https://www.youtube.com/watch?v=fBRgw5dyBd4)

[Docker network in different modes](https://www.digihunch.com/2020/07/dockersnetwork/)

[도커 네트워크의 구조와 기능](https://devbksheen.tistory.com/entry/%EB%8F%84%EC%BB%A4-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%ACdocker-network-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0)

