---
title: Minimum Cost Spanning Tree
tags: ["datastructure"]
---

## Minimum Cost Spanning Tree
- Spanning Tree(신장트리) 는 모든 Vertext(정점)이 간선으로 연결되어있고 `Edge 의 개수가 Vertext 개수보다 하나 적은 그래프` 를 의미한다.
- 신장트리 (Spanning Tree) 는 모든 정점이 연결되어있는 `무방향 연결그래프의 부분 그래프` 여야 한다.  
  다시 말해, 연결그래프가 주어졌을 때 `정점의 개수 - 1`(Cycle 이 존재하지 않음) 개의 간선으로 `모든 정점을 연결`(모든 정점을 포함)할 수 있는 부분 그래프를 의미한다.)  
- 연결그래프가 주어졌을 때 생성할 수 있는 신장트리는 유일하지 않다.  
    
> 연결관계에서 Cycle 을 형성하지 않기 때문에 트리의 기본 조건을 갖고 있다고 볼 수 있으며 Spanning Tree 의 간선의 개수는 (정점의 개수 - 1) 가 되게 된다.
