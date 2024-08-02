---
title: Tree
tags: ["datastructure"]
---
## Tree
트리는 Stack 이나 Queue 와 같은 선형 구조가 아닌 비선형 자료구조이다. 트리는 Node 과 Edge 로 이루어져있으며, 파일시스템이나 디렉터리 구조와 같은 계층적인 관계(Hierarchial Relationship)를 표현할 수 있다.

>[!note] 선형, 비선형 자료구조
> 노드 또는 원소들의 앞뒤 관계가 단방향이던 양방향이던 1:1 인 자료구조를 선형자료구조라고하며 대표적으로 배열, 스택, 큐, 연결리스트 가 있다. 하지만 비선형자료구조는 노드의 앞뒤 관계가 1:N 또는 N:N 인 관계이다. 하나의 노드가 다수의 하위 노드들을 참조할 수 있으며, 거꾸로 다수의 노드가 하나의 상위 노드를 참조할 수 있다.

### Tree 의 성질
1. 트리는 `모든 정점이 간선으로 연결`되어 있으면서, `정점의 수가 N 개` 일때 `간선의 수가 N - 1` 개가 된다.
2. 루트노드에서 특정 노드로 가는 경로 그리고 임의의 두 노드 간의 경로가 유일하다. (두 개의 노드 사이에 반드시 1 개의 경로만을 가진다)
3. 루트 노드를 제외한 모든 노드은 `반드시 하나의 부모 노드`를 가진다.
4. 트리는 `사이클(Cycle)이 없는 하나의 연결 그래프(Connected Graph)` 이자 `방향 비순환 그래프 (DAG : Directed Acyclic Graph)` 이다.
5. 모든 트리는 그래프이지만, 모든 그래프는 트리가 아니다.


### Tree 의 용어

![](ComputerScience/DataStructure/images/Pasted%20image%2020240731011919.png)

| 이름                               | 설명                                                 |
| -------------------------------- | -------------------------------------------------- |
| Node (노드)                        | 트리를 구성하고 있는 각각의 요소를 의미                             |
| Edge (간선)                        | 트리를 구성하기 위해 노드와 노드를 연결하는 선을 의미.                    |
| Root Node (루트 노드)                | 트리 구조에서 최상위에 있는 노드를 의미하며, 부모가 없는 노드.               |
| Sibling Node (형제 노드 = 자매노드)      | 같은 부모 노드를 갖는 노드를 의미                                |
| Leaf Node (Terminal Node, 단말 노드) | 자식 노드를 갖고있지 않은 노드를 의미.                             |
| Internal Node (내부노드, 비단말 노드)     | Leaf Node 를 제외한 모든 노드로 Root Node 를 포함.             |
| Degree (차수)                      | 특정 노드가 가지고 있는 자식 노드의 개수를 의미.                       |
| Depth (깊이)                       | 루트노드에서 특정노드까지 거쳐가는 간선의 수를 의미.( `0 부터 시작한다 = 루트노드`) |
| Level (레벨)                       | 트리의 각 층에 해당하는 번호를 의미하며 `Depth + 1` 의 값을 갖는다.       |
| Height (트리의 높이)                  | 루트노드에서 가장 깊숙히 있는 노드의 Depth.                        |

### Tree 의 종류
1. 이진트리 (Binary Tree)
2. 이진 탐색 트리 (Binary Search Tree : BST)
3. 신장 트리 (Spanning Tree)
4. 최소비용 신장 트리 (Minimum Cost Spanning Tree : MST)
5. RedBlack Tree

## Binary Tree
- Binary Tree (이진 트리) 는 모든 노드의 최대 차수(Degree) 가  2 를 넘지 않는 트리를 의미한다. (최대 2개의 Child 노드)
- Binary Tree (이진 트리) 는 노드의 값, 노드의 데이터 크기에 관계없이 구성 된다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240731153050.png)

## Binary Search Tree
- Binary Search Tree (BST : 이진 탐색 트리) 는 이진트리와 생김새는 동일하다. (모든 노드의 최대차수가 2를 넘지 않음)
- 하지만 왼쪽 자식노드의 값이 부모노드의 값보다 작아야하고, 오른쪽 자식노드의 값이 부모노드보다 커야하는 제약사향이 있다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020240731153138.png)

## RedBlack Tree

## B-Tree


## Reference
[코딩문 Tree Youtube](https://www.youtube.com/watch?v=QXuvE0Pon4g)
[코딩 인터뷰 완전분석 - 트리(Tree)와 그래프(Graph)](https://hungryjayy.github.io/posts/%EC%BD%94%EB%94%A9_%EC%9D%B8%ED%84%B0%EB%B7%B0_%EC%99%84%EC%A0%84%EB%B6%84%EC%84%9D-%ED%8A%B8%EB%A6%AC_%EA%B7%B8%EB%9E%98%ED%94%84/)
[힙, 트리, 그래프(Heap, Tree, Graph)](https://sohyeonnn.tistory.com/21)
[그래프와 트리](https://sanhan.tistory.com/entry/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%EA%B7%B8%EB%9E%98%ED%94%84%EC%99%80-%ED%8A%B8%EB%A6%AC)
[방향/무방향 그래프의 정리](https://m.blog.naver.com/oh-mms/222045842438)
[DAG 알고리즘이란 무엇인가](https://steemit.com/dag/@cryptodreamers/dag-dag-directed-acyclic-graph)
[트리의 개념과 용어정리](https://jiwondh.github.io/2017/10/15/tree/)
[트리의 기초](https://velog.io/@kjh107704/%ED%8A%B8%EB%A6%AC-%ED%8A%B8%EB%A6%AC%EC%9D%98-%EA%B8%B0%EC%B4%88)
[트리는 방향 그래프인가? 무방향 그래프인가](https://dev-sia.tistory.com/25)
[Trees (트리 자료구조)](https://cdragon.tistory.com/entry/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0%EC%99%80-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-Trees#2.%20Binary%20trees%20(%EC%9D%B4%EC%A7%84%20%ED%8A%B8%EB%A6%AC)-1)
[gyoogle](https://gyoogle.dev/blog/computer-science/data-structure/Tree.html)
[JaeYeopHan][https://github.com/JaeYeopHan/Interview_Question_for_Beginner/blob/main/DataStructure/README.md#tree]
[WeareSoft](https://github.com/WeareSoft/tech-interview/blob/master/contents/datastructure.md#tree)
[jobhope](https://github.com/jobhope/TechnicalNote/blob/master/data_structure/Tree.md)
[이진트리의 종류](https://hsc-tech.tistory.com/7)

