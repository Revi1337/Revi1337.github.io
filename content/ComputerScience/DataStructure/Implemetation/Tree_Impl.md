---
title: Tree Implementation
tags: ["implementation"]
---

### BinaryTree 배열로 표현
아래의 이진트리를 배열로 표현하면 트리의 Level 0 부터 시작하여 각 레벨에 속하는 원소들을 차례대로 Insert 해주면 된다. Root 노드는 idx 0 부터 시작하기 때문에 왼쪽 자식, 오른쪽 자식은 `idx * 2 + 1, idx * 2 + 2` 가 된다.

![](ComputerScience/DataStructure/Implemetation/images/Pasted%20image%2020240731180857.png)

```python {7,8}
def solution(tree):  
    node_cnt = len(tree)  
    parent = 0  
    while parent < node_cnt:  
        if tree[parent]:  
            print(f'Parent Node {tree[parent]}', end = ', ')  
            left_child = parent * 2 + 1  
            right_child = parent * 2 + 2  
            if left_child < node_cnt and tree[left_child] != 0:  
                print(f'Left: {tree[left_child]}', end = ', ')  
            if right_child < node_cnt and tree[right_child] != 0:  
                print(f'Right: {tree[right_child]}', end = ' ')  
            print()  
        parent += 1  
  
solution([10, 30, 4, 5, 7, 11, 25, 0, 0, 0, 0, 0, 9, 0, 0])
```

> [!note] Root 노드를 idx 1 부터 시작할때는?
> Root 노드의 시작을 idx 0 이 아닌 1 부터 시작하고 싶다면, `idx * 2`, `idx * 2 + 1` 순서가 된다.

#### PreOrder, InOrder, PostOrder 순회
이진 트리를 순회하는 방법은 `3가지`가 있다.  
  
**전위 순회 (PreOrder)**
- 현재 노드를 부모 노드로 생각했을때 `부모 노드 --> 왼쪽자식 노드 --> 오른쪽 자식 노드` 순서로 `방문`하는 방법  (주로 트리를 복사할때  사용)

**중위 순회 (InOrder)** 
- 현재 노드를 부모 노드로 생각했을때 `왼쪽자식 노드 --> 부모 노드 --> 오른쪽 자식 노드` 순서로 `방문`하는 방법 (이진 탐색 트리에서 정렬된 순서대로 값을 가져올때 사용)

**후위 순회 (PostOrder)** 
- 현재 노드를 부모 노드로 생각했을때 `왼쪽자식 노드 --> 오른쪽자식 노드 --> 부모 노드` 순으로 `방문`하는 방법  (트리 삭제에 자주 사용)
  
> 순회를 할 때 주목해야할 것은 노드를 방문하는것과 노드를 거쳐가는것은 아예 다르며, 현재 노드를 부모 노드를 생각해야한다는 것이다.

```python
def solution(tree):  
  
    node_cnt = len(tree)  
  
    def pre_order(idx = 0):  
        if idx < node_cnt and tree[idx]:  
            val = str(tree[idx]) + " "  
            val += pre_order(idx * 2 + 1)  
            val += pre_order(idx * 2 + 2)  
            return val  
        return ""  
  
    def in_order(idx = 0):  
        if idx < node_cnt and tree[idx]:  
            val = in_order(idx * 2 + 1)  
            val += str(tree[idx]) + " "  
            val += in_order(idx * 2 + 2)  
            return val  
        return ""  
  
    def post_order(idx = 0):  
        if idx < node_cnt and tree[idx]:  
            val = post_order(idx * 2 + 1)  
            val += post_order(idx * 2 + 2)  
            val += str(tree[idx]) + " "  
            return val  
        return ""  
  
    print(*[pre_order()[:-1], in_order()[:-1], post_order()[:-1]], sep = '\n')  
  
solution([10, 30, 4, 5, 7, 11, 25, 0, 0, 0, 0, 0, 9, 0, 0])
```

