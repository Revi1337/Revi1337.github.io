---
title: Graph
tags: ["datastructure"]
---
## Graph
- Graph(그래프) 는 노드와 간선으로 이루어진 `비선형 데이터 구조`이다.
- 보통 그래프는 데이터간의 연결관계를 표현하는데 사용되는데, 데이터를 노드로 노드간의 관계나 흐름을 Edge 로 표현한다. 여기서 만약 관계나 흐름의 정도를 표현할 필요가 있다면 Weight(가중치) 라는 개념을 추가하여 표현한다.
- 그래프는 방향이 있는 Directed Graph 의 형태로 구성될 수 있고, 방향이 없는 Undirected Graph 형태로 구성될 수 있다.
- 그래프는 순환이 있는 형태의 Cyclic Graph 형태로 구성될 수 있고, 순환이 없는 Acyclic Graph 형태로 구성될 수 있다.
- 그래프는 `연결 그래프(Connected Graph)` 일 수 있으며, 여러개의 `고립된 부분 그래프(Isoldated Subgraphs)` 로 나뉜 `비연결 그래프 (Disconnected Graph)` 일 수 있다.
## Graph 의 유형
### 방향 그래프 & 무방향 그래프
Directed Graph(방향 그래프 : 유향 그래프) 는 `노드간의 관계를 표현하는 Edge 에 방향성이 있는 그래프`를 의미한다. 따라서 Edge 로 연결된 두개의 노드간의 이동은 단방향으로만 이루어진다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801183508.png)


Undirected Graph(무방향 그래프 : 무향 그래프) `노드간의 관계를 표현하는 Edge 에 방향성이 없는 그래프`를 의미한다. 따라서 Edge 로 연결된 두개의 노드간의 이동은 양방향으로 이루어진다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801183749.png)

### 가중치 그래프
Weight Graph(가중치 그래프) 는 서로 다른 두 정점을 연결하는 Edge 에 가중치(Weight) 이 할당된 그래프이다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801234604.png)

### 순환 그래프 & 비순환 그래프
Cycle Graph (순환 그래프) 는 `어느 한 정점 v 에서 간선을 지나, 다시 정점 v 로 돌아와 순환이 반복될 수 있는` 그래프이다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801184213.png)


Acyclic Graph (비순환 그래프) 는 `어느 한 정점 v 에서 간선을 지나 다시 정점 v 로 돌아올 수 있는 방법이 없는` 그래프이다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801184357.png)

#### 방향 비순환 그래프 : DAG
방향 비순환 그래프 (Directed Acyclic Graph : DAG) 는 방향성이 있는 유향 그래프의 `어느 한 정점 v 에서 간선을 지나 다시 정점 v 로 돌아올 수 있는 방법이 없는` 그래프이다. 한마디로 Directed Graph 의 개념과 Acyclic Graph 의 개념을 합친 것이다. 따라서 주어진 그래프가 DAG 인지 판단하기 위해서는 노드의 중복방문을 확인하면 된다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240801215214.png)

#### 순환의 기준
무방향 그래프는 간선이 양방향으로 이루어지기 때문에 당연히 `순환 그래프 라고 생각할 수 있다`. 하지만 무방향 그래프에서는 단순히 Edge 를 따라 양방향으로 이동할 수 있다는 점에서 순환을 판단하지 않는다.  `대신 순환 여부는 노드를 중복 방문하는지 여부` 로 판단한다. 

### 연결 그래프 & 비연결 그래프
연결 그래프(Connected Graph) 는 모든 노드가 하나의 연결된 컴포넌트로 이루어져 `어떤 두 노드간에 간선이 존재`하는 그래프이다.

![Left Graph & Right Graph](ComputerScience/DataStructure/images/Pasted%20image%2020240801220432.png)


비연결 그래프 (Disconnected Graph) 는 모든 노드가 하나의 연결된 컴포넌트를 이루지 않고, `여러개의 고립된 부분 그래프(Isoldated Subgraphs)`  로 구성된 그래프이다.

![Left Graph & Right Graph](ComputerScience/DataStructure/images/Pasted%20image%2020240801221617.png)

### 완전 그래프
Complete Graph (완전 그래프) 는 그래프에 속해 있는 모든 정점이 서로 연결되어 있는 그래프로 `무방향 완전 그래프`이다.

>[!note] 완전그래프의 총 Edge 수
> 완전그래프의 정점의 수가 n 이면 사용되는 간선의 수는 n * (n - 1) / 2 이다

![](ComputerScience/DataStructure/images/Pasted%20image%2020240802005440.png)

### 이분그래프
Bipartite Graph(이분그래프) 는 `인접한 정점끼리 서로 다른 그룹으로 분류`하여 모든 정점을 `두 가지 그룹으로만 분류할 수 있는 그래프`이다. 인접한 정점끼리 서로 다른 그룹으로 분류하기 때문에 `같은 그룹의 정점끼리는 Edge 로 이어지지 않는다`.

> [!note] 
> 간선이 아예 없고 정점만 있는 경우도 이분 그래프이다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240802015059.png)


하지만 그래프가 비연결 그래프(Disconnected Graph) 로 주어질 수 있기 때문에, 이분 그래프인지 판단할 때 `여러개로 나뉘어진 고립된 부분 그래프(Isoldated Subgraphs) 들도 모두 이분 그래프인지 확인`해야한다. 그래프를 이루는 여러개의 부분그래프 중 단 하나라도 이분그래프가 아님이 증명되면, 그 그래프는 이분 그래프가 아니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240802015237.png)


또한 주어진 그래프가 Cycle 을 형성할 수 있다. 이런 경우에는 Cycle 을 이루는 노드의 개수를 세어 `Odd Cycle(홀수 사이클)` 인지 `Even Cycle (짝수 사이클)` 인지 확인하면 된다. Odd Cycle 이면 이분그래프일 수 없고, Even Cycle 이면 이분그래프이다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240802020732.png)

![](ComputerScience/DataStructure/images/Pasted%20image%2020240802020809.png)

## MST
MST 는 최소비용 신장트리이며 Minimum Cost Spanning Tree 의 약자이다.

## Reference
[그래프](https://yejin72.tistory.com/70)
[그래프](https://velog.io/@tomato2532/%EA%B7%B8%EB%9E%98%ED%94%84#%EA%B7%B8%EB%9E%98%ED%94%84-%EC%9C%A0%ED%98%95)
[Graph 란 with MST](https://gmlwjd9405.github.io/2018/08/28/algorithm-mst.html)
[유향 비순환 그래프](https://algorfati.tistory.com/145#%EC%9C%A0%ED%96%A5%20%EB%B9%84%EC%88%9C%ED%99%98%20%EA%B7%B8%EB%9E%98%ED%94%84-1)
[방향 비순환 그래프](https://jackpot53.tistory.com/84)
[Graph - Directed Acyclic Graphs(DAG)](https://velog.io/@claude_ssim/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-Graph-Directed-Acyclic-GraphsDAG)
[그래프 쉽게 이해하기](https://rosweet-ai.tistory.com/61)
[이분그래프란?](https://didu-story.tistory.com/271)
[이분 그래프 Bipartite Graph 란?](https://gmlwjd9405.github.io/2018/08/23/algorithm-bipartite-graph.html)
[자료구조 - 이분그래프(Bipartite Graph)](https://hongjw1938.tistory.com/117)
