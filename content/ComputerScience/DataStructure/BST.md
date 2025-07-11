---
title: BST
tags: ["datastructure"]
---

## Binary Search Tree (BST)
Binary Search Tree(BST: 이진 탐색 트리)는 이진 트리의 특별한 형태로, `비선형 자료구조`입니다. 일반 이진 트리와 달리 BST는 `모든 노드가 정렬된 순서를 유지`한다는 특징이 있으며, 정렬된 데이터를 기반으로 `빠른 검색(Search)`을 수행하기 위해 설계된 자료구조입니다. 대표적으로 Java의 `TreeMap`과 `TreeSet`이 내부적으로 Red-Black Tree(균형 BST)를 사용합니다.

- 각 노드에 대해 `왼쪽 서브트리의 모든 값 < 부모 노드 < 오른쪽 서브트리의 모든 값` 규칙이 재귀적으로 적용됩니다.
- 입력된 순서가 보존되지 않기 때문에, `i번째 데이터 접근`과 같은 연산은 존재하지 않습니다.
- 트리가 `균형잡혀 있을 경우` 다음과 같은 시간복잡도를 가집니다.
	- 데이터의 삽입 & 삭제에 `O(logN)` 시간복잡도를 가집니다.
	- X 라는 데이터 접근(Access)에 `O(logN)` 시간복잡도를 가집니다.
	- X 기준 Ceiling & Floor 접근에 `O(logN)` 시간복잡도를 가집니다.

> 트리가 한쪽으로 치우칠 경우 삽입 & 삭제 & 탐색의 시간복잡도는 O(N)까지 나빠질 수 있습니다. 따라서 트리를 균형있게 유지하기 위해 BST의 한 종류인 Red-Black Tree 같은 균형 BST 를 사용합니다.

> [!note] Ceiling & Floor
> Ceiling : 트리 내에서 X 이상인 값 중 가장 작은 값을 말합니다.
> Floor : 트리 내에서 X 이하인 값 중 가장 큰 값을 말합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250611033553.png)


## Implementation
```python
from __future__ import annotations  
from typing import Optional  
  
class Node:  
    def __init__(self, value: int):  
        self.value: int = value  
        self.left: Optional[Node] = None  
        self.right: Optional[Node] = None  
  
    def __gt__(self, other: Node) -> bool:  
        return self.value > other.value  
  
    def __ge__(self, other: Node) -> bool:  
        return self.value >= other.value  
  
    def __lt__(self, other: Node) -> bool:  
        return self.value < other.value  
  
    def __le__(self, other: Node) -> bool:  
        return self.value <= other.value  
  
    def __eq__(self, other: Node) -> bool:  
        return self.value == other.value  
  
    def __str__(self):  
        return f'{self.value}'  
  
  
class BST:  
    def __init__(self):  
        self.root: Optional[Node] = None  
  
    def insert(self, value: int) -> None:  
        target = Node(value)  
        if self.root is None:  
            self.root = target  
            return  
  
        curr = self.root  
        while True:  
            if target < curr:  
                if curr.left is None:  
                    curr.left = target  
                    return  
                curr = curr.left  
            elif target > curr:  
                if curr.right is None:  
                    curr.right = target  
                    return  
                curr = curr.right  
            else:  
                return  
  
    def remove(self, value: int) -> bool:  
        prev, curr, target = self.root, self.root, Node(value)  
        while curr:  
            if curr == target:  
                break  
  
            if curr.left is not None and target < curr:  
                prev, curr = curr, curr.left  
            elif curr.right is not None and target > curr:  
                prev, curr = curr, curr.right  
            else:  
                return False  
  
        is_root = curr == self.root  
  
        if curr.left is None and curr.right is None:  
            if is_root:  
                self.root = None  
            elif prev.left == curr:  
                prev.left = None  
            else:  
                prev.right = None  
  
        elif curr.left is not None and curr.right is not None:  
            succ_parent, succ = curr, curr.right  
            while succ.left:  
                succ_parent, succ = succ, succ.left  
  
            curr.value = succ.value  
  
            if succ_parent.left == succ:  
                succ_parent.left = succ.right  
            else:  
                succ_parent.right = succ.right  
  
        elif curr.left is not None:  
            if is_root:  
                self.root = curr.left  
            elif prev.left == curr:  
                prev.left = curr.left  
            else:  
                prev.right = curr.left  
  
        elif curr.right is not None:  
            if is_root:  
                self.root = curr.right  
            elif prev.left == curr:  
                prev.left = curr.right  
            else:  
                prev.right = curr.right  
  
        return True  
  
    def search(self, value: int) -> bool:  
        curr, target = self.root, Node(value)  
        while curr:  
            if curr == target:  
                return True  
  
            if curr.left is not None and target < curr:  
                curr = curr.left  
            elif curr.right is not None and target > curr:  
                curr = curr.right  
            else:  
                return False  
  
        return False  
    def ceil(self, value: int) -> Optional[int]:  
        curr, target = self.root, Node(value)  
        while curr:  
            if curr == target:  
                return curr.value  
  
            if target < curr:  
                if curr.left is None or curr.left < target:  
                    return curr.value  
                curr = curr.left  
            else:  
                curr = curr.right  
  
    def floor(self, value: int) -> Optional[int]:  
        curr, target = self.root, Node(value)  
        while curr:  
            if curr == target:  
                return curr.value  
  
            if target > curr:  
                if curr.right is None or curr.right > target:  
                    return curr.value  
                curr = curr.right  
            else:  
                curr = curr.left  
  
    def display(self) -> None:  
  
        def __prt(node: Optional[Node], indent: str = "", position: str = "root") -> None:  
            if node is not None:  
                print(f"{indent}[{position}] {node.value}")  
                __prt(node.left, indent + "   ", "L")  
                __prt(node.right, indent + "   ", "R")  
  
        __prt(self.root)  
  
bst = BST()  
for num in 20, 15, 25, 10, 17, 21, 24, 31, 34: bst.insert(num)  
bst.display()  
  
print([bst.search(num) for num in (20, 15, 25, 10, 17, 21, 24, 31, 34, 32, 19, 16)], sep = ' ')  
print(bst.ceil(13))  
print(bst.remove(25))  
bst.display()
```
