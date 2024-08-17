---
title: Dijkstra
tags: ['algorithm', 'shortest-distance', 'dijkstra']
---

## Dijkstra  Algorithm
다익스트라 알고리즘은  `특정 시작 정점` 으로부터 `다른 모든 노드로까지의 최소비용` 을 구하는 알고리즘이다. 여기서 말하는 최소비용은 정점과 정점으로 이어진 간선에 `가중치`가 주어졌을 때 그 `가중치의 합이 최소`가 되는 것을 의미한다.

> [!note] 다익스트라의 한계
다익스트라의 한계로는 두 정점을 잇는 간선들이 주어졌을 때, 그 중 가중치가 음수인 간선이 있으면 다익스트라를 적용할 수 없다는 것이다. 그 이유는  최소 비용의 음의 무한대 발산이 생길 수 있기 때문이다. 이는 곧 최소비용을 보장할 수 없음을 의미한다.

## Dijkstra  매커니즘
다익스트라의 매커니즘은 크게 3개로 볼 수 있으며 기본적으로 `Greedy` 와 `Dynamic Programming`  기법을 사용한다. 

1. 초기화 (각 Node 들의 초기 최소 비용)
2. 방문 (방문하지 않은 Node 중 가장 비용이 적은 Node 를 선택하여 방문 = Greedy)
3. 갱신 (방문한 Node 로부터 갈 수 있는 Node 들의 최소비용을 갱신 = Dynamic Programming)

> [!note] 방문한 노드는 다시 탐색하지 않는다.
> 다익스트라는 한번 방문한 Node 는 다시 탐색하지 않는다.

## Dijkstra 흐름
아래의 그래프가 있을 때 시작 Node 인 `A` 로부터 다른 모든 Node 까지의 최소비용을 구해보자.

![](Algorithm/images/Pasted%20image%2020240727021653.png)

### 초기화
1. 시작 Node 로부터 특정 Node 까지의 최소 비용을 저장할 공간을 생성한다.
	- 이 때 초기값은 매우 큰 수(예를 들어 INF)로 초기화시킨다.
2. 시작 Node 인 A 의 최소비용을 0 으로 갱신시킨다.
	- 초기화 단계에서는 가장 비용이 적은 Node 를 선택하는 기준이 없기 때문에 시작 Node 인 A 의 비용을 0 으로 갱신하는 것이다.

![](Algorithm/images/Pasted%20image%2020240727023529.png)

### 방문 및 갱신 (반복)

위의 상태에서 방문하지 않은 Node 들 중 가장 비용이 작은 A 를 선택하여 방문한다. 그리고 A 를 거쳐갈 수 있는 Node 의 비용과 cost 테이블 값과 비교하여 최소비용을 갱신해준다.

- B 의 경우, `A --> B 까지의 비용 0 + 4` 이 `cost 테이블의 노드 B 의 최소비용 INF` 보다 작기 때문에 값을 4 로 갱신한다.
- C 의 경우, `A --> C 까지의 비용 0 + 4` 이 `cost 테이블의 노드 C 의 최소비용 INF` 보다 작기 때문에 값을 4 로 갱신한다.
- E 의 경우, `A --> E 까지의 비용 0 + 1` 이 `cost 테이블의 노드 E 의 최소비용 INF` 보다 작기 때문에 값을 1 로 갱신한다.

![](Algorithm/images/Pasted%20image%2020240727025520.png)


위의 상태에서 방문하지 않은 Node 들 중 최소비용인 노드 E 를 선택하여 방문한다. 그리고 E 를 거쳐갈 수 있는 인접 노드들의 최소 비용을 갱신해준다. 위의 상태에서 방문하지 않은 Node 들 중 최소비용인 노드 E 를 선택하여 방문한다.

- C 의 경우, `E --> C 까지의 비용 1 + 2` 이 `기존 cost 테이블의 노드 C 의 최소비용 4` 보다 작기 때문에 값을 3 로 갱신한다.

![](Algorithm/images/Pasted%20image%2020240727030252.png)


위의 상태에서 방문하지 않은 Node 들 중 최소비용인 노드 C 를 선택하여 방문한다. 그리고 C 를 거쳐갈 수 있는 인접 노드들의 최소 비용을 갱신해준다.

- D 의 경우, `C --> D 까지의 비용 3 + 8` 이 `기존 cost 테이블의 노드 D 의 최소비용 INF` 보다 작기 때문에 값을 11 로 갱신한다.

![](Algorithm/images/Pasted%20image%2020240727030939.png)


위의 상태에서 방문하지 않은 Node 들 중 최소비용인 노드 B 를 선택하여 방문한다. 그리고 B 를 거쳐갈 수 있는 인접 노드들의 최소 비용을 갱신해준다.

- C 의 경우, `B --> C 까지의 비용 4 + 6` 이 `기존 cost 테이블의 노드 C 의 최소비용 3` 보다 크기 때문에 최소비용을 갱신하지 않는다.

![](Algorithm/images/Pasted%20image%2020240727031405.png)


위의 상태에서 방문하지 않은 Node 들 중 최소비용인 노드 D 를 선택하여 방문한다. 그리고 D 를 거쳐갈 수 있는 인접 노드들의 최소 비용을 갱신해준다.

- B 의 경우, `D --> B 까지의 비용 11 + 2` 이 `기존 cost 테이블의 노드 B 의 최소비용 4` 보다 크기 때문에 최소비용을 갱신하지 않는다.
- A 의 경우, `D --> A 까지의 비용 11 + 5` 이 `기존 cost 테이블의 노드 A 의 최소비용 0` 보다 크기 때문에 최소비용을 갱신하지 않는다.

![](Algorithm/images/Pasted%20image%2020240727031845.png)


이렇게 모든 Node 의 방문이 끝나 다익스트라가 종료되게 된다. 따라서 시작노드 A 부터 다른 모든 노드까지의 최소비용은 위와 같다.

## Dijkstra  구현
파이썬으로 다익스트라 알고리즘을 구현한다면 아래와 같이 나타낼 수 있다.

`4 ~ 7` 라인
- 시작 Node 로부터 특정 Node 까지의 최소 비용을 저장할 공간을 생성한다. 이때 값은 무한히 큰 값으로 초기화시켜준다.
- 방문하지 않은 노드 중 가장 작은 비용을 갖는 시작 노드 A 선택 및 방문하여 cost 테이블에 최소비용을 0 으로 갱신한다.
- 또한, 갱신한 노드의 최소비용과 그 노드를 우선순위 큐 (Priority Queue) 에 `[시작노드의 최소비용, 시작노드]` 형태로 넣어준다.

`10` 라인
- 우선순위 큐에서 `최소힙 (여기서는 최소비용)` 이 되는 값을 pop 해준다. (Greedy)

`11` 라인
- 이미 방문한 Node 인지 아닌지 판단하는 조건문이며, 이미 방문한 노드를 재방문하지 않도록 방지하는 로직이다.
- pop 한 노드의 비용이 현재 costs 배열에 기록된 내용보다 크다면 이미 방문한 노드로 판단하게 된다.
- 생각해보면 우선순위 큐에서 pop 했다는 것은 큐에 남아있는 원소 중 가장 최소힙인 원소였다는 것이다. 그런데 큐에서 꺼낸 노드의 비용과 costs 배열에 기록된 내용과 비교하였더니 

생각해보면 우선순위 큐에서 pop 했다는 것은 전에 그 Node 까지의 최소비용을 이미 갱신했다는 의미이다.

```python
import heapq  
  
def dijkstra(graph, start):  
	pq = []  
    costs = {node: 1e9 for node in graph}  
    costs[start] = 0  
    heapq.heappush(pq, [costs[start], start])  
  
    while pq:  
        cost, vertext = heapq.heappop(pq)  
        if costs[vertext] < cost:  
            continue  
        for next_vertext, next_cost in graph[vertext].items():  
            total_cost = cost + next_cost  
            if total_cost < costs[next_vertext]:  
                costs[next_vertext] = total_cost  
                heapq.heappush(pq, [total_cost, next_vertext])  
  
    return costs  
  
print(  
    dijkstra(  
        {            
	        'A': {'B': 4, 'C': 4, 'E': 1},  
            'B': {'C': 6},  
            'C': {'D': 8},  
            'D': {'B': 2, 'A': 5},  
            'E': {'C': 2}  
        },
        'A'
    )  
)
# answer : {'A': 0, 'B': 4, 'C': 3, 'D': 11, 'E': 1}
```

## Dijkstra  한계
## Dijkstra  시간복잡도

## 다익스트라 유형
  
1. 일반적인 다익스트라 (특정 시작점에서 모든 경로의 최단거리)
2. 특정경로까지 갔다가 다시 되돌아오는 최단거리 (https://www.acmicpc.net/problem/1238)  
3. 특정한 경로들을 꼭 지나야하는 최단거리 (https://www.acmicpc.net/problem/1504)
4. A --> B 로 가는 가중치에 대한 간선의 정보가 여러가지 주어질때 (당연히 작은 가중치를 넣어야 함.)

## Reference
https://sskl660.tistory.com/59  
https://www.youtube.com/watch?v=oDvzkPNhG18&t=359s

