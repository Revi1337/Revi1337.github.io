---
title: BST
tags: ["datastructure"]
---

## Binary Search Tree (BST)
Binary Search Tree(BST: 이진 탐색 트리)는 이진 트리의 한 종류로, 데이터를 정렬된 상태로 저장하고, 이를 기반으로 빠르게 데이터를 탐색하기 위해 설계된 `비선형 자료구조`입니다. 일반적인 이진 트리와 달리, BST는 `모든 노드가 정렬 규칙을 만족해야 한다`는 구조적 특징을 가집니다. 대표적으로 Java의 `TreeMap`과 `TreeSet`이 내부적으로 Red-Black Tree(균형 BST)를 사용합니다.

- 모든 노드에 대해 `왼쪽 서브트리의 모든 값 < 부모 노드 < 오른쪽 서브트리의 모든 값` 규칙이 모든 하위 트리(SubTree)에 대해 재귀적으로 적용됩니다.
- 입력된 순서가 보존되지 않기 때문에, `i번째 데이터 접근`과 같은 연산은 존재하지 않습니다.
- BST에 삽입되는 원소의 순서에 따라 트리 구조가 달라질 수 있으며, 이는 시간복잡도에 영향을 미칩니다.
- 트리가 `균형잡혀 있을 경우` 다음과 같은 시간복잡도를 가집니다.
	- 데이터의 삽입/삭제/탐색에 평균 `O(logN)` 시간복잡도를 가집니다.
	- X 기준 Ceiling & Floor 연산에 `O(logN)` 시간복잡도를 가집니다.

> 트리가 한쪽으로 치우칠 경우 삽입/삭제/탐색의 시간복잡도는 O(N)까지 나빠질 수 있습니다. 따라서 트리를 균형있게 유지하기 위해 BST의 한 종류인 Red-Black Tree 같은 균형 BST 를 사용합니다.

> [!note] Ceiling & Floor
> - Ceiling : 트리 내에서 X 이상인 값 중 가장 작은 값을 말합니다.
> - Floor : 트리 내에서 X 이하인 값 중 가장 큰 값을 말합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250611033553.png)


## Operation
이진 탐색 트리(BST) 의 주요 연산은 다섯 가지가 있습니다. 각 연산의 시간복잡도는 다음과 같습니다.

| Operation  | Average Time | Worst Time | Description               |
| :--------: | :-----------: | :--------: | ------------------------- |
| 삽입(Insert) |   O(log N)    |    O(N)    | 데이터를 트리에 삽입               |
| 탐색(Search) |   O(log N)    |    O(N)    | 데이터가 트리에 있는지 탐색           |
| 삭제(Delete) |   O(log N)    |    O(N)    | 트리에서 특정 데이터을 삭제           |
|    Ceil    |   O(log N)    |    O(N)    | 트리 내 X 이상인 값 중 가장 작은 값 확인 |
|   Floor    |   O(log N)    |    O(N)    | 트리 내 X 이하인 값 중 가장 큰 값 확인  |

### Insert
삽입(Insert)은 데이터를 BST에 추가하는 연산입니다. 동작 과정은 다음과 같습니다.

1. 루트 노드가 비어 있다면, 삽입할 값을 루트 노드로 설정하고 연산을 종료합니다.
2. 루트 노드를 현재 노드로 설정합니다.
3. 현재 노드의 값과 삽입할 값을 비교합니다.
	-  삽입할 값이 현재 노드보다 작다면 왼쪽 자식 노드로 이동합니다.
		- (즉, 현재 노드를 왼쪽 자식 노드로 갱신합니다.)
		- 만약 왼쪽 자식 노드가 없다면, 해당 위치에 값을 삽입하고 종료합니다.
	- 삽입할 값이 현재 노드보다 크다면 오른쪽 자식 노드로 이동합니다.
		- (즉, 현재 노드를 오른쪽 자식 노드로 갱신합니다.)
		- 만약 오른쪽 자식 노드가 없다면, 해당 위치에 값을 삽입하고 종료합니다.
4. 3번 과정을 삽입이 완료될 때까지 반복합니다.


예를 들어 `24`라는 데이터를 BST에 삽입하면 다음과 같은 순서로 진행됩니다.

1. 루트 노드에 `20`이 있으므로, `24`와 비교합니다.  
	- `24 > 20` 이므로 오른쪽 자식 노드로 이동합니다.
2. 현재 노드에는 `25`가 있으므로, `24`와 비교합니다.  
	- `24 < 25` 이므로 왼쪽 자식 노드로 이동합니다.
3. 현재 노드에는 `21`이 있으므로, `24`와 비교합니다.  
	- `24 > 21` 이므로 오른쪽 자식 노드로 이동합니다.
4. 해당 위치에 자식 노드가 없으므로, 여기에 `24`를 삽입하고 연산을 종료합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250712003920.png)


동일한 원리로 `10`라는 데이터를 삽입할 수 있습니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250712004137.png)


### Search
탐색(Search)은 데이터가 트리에 있는지 탐색하는 연산입니다. 동작 과정은 다음과 같습니다.

1. 루트 노드를 현재 노드로 설정합니다.
2. 현재 노드의 값과 탐색할 값을 비교합니다.
	- 현재 노드의 값이 탐색할 값과 같다면, `True`를 반환하고 탐색을 종료합니다.
	- 탐색할 값이 현재 노드보다 작다면 왼쪽 자식 노드로 이동합니다.
	    - 왼쪽 자식 노드가 없다면, 트리에 값이 존재하지 않음을 의미하므로 `False`를 반환하고 종료합니다.
	- 탐색할 값이 현재 노드보다 크다면 오른쪽 자식 노드로 이동합니다.
	    - 오른쪽 자식 노드가 없다면, 트리에 값이 존재하지 않음을 의미하므로 `False`를 반환하고 종료합니다.
3. 2번 과정을 값이 발견되거나 탐색할 노드가 없을 때까지 반복합니다.


예를 들어 `24`라는 데이터를 BST에서 찾으려면 다음과 같은 순서로 진행됩니다.

1. 루트 노드에 `20`이 있으므로, `24`와 비교합니다.  
	- `24 > 20` 이므로 오른쪽 자식 노드로 이동합니다.
2. 현재 노드에는 `25`가 있으므로, `24`와 비교합니다.  
	- `24 < 25` 이므로 왼쪽 자식 노드로 이동합니다.
3. 현재 노드에는 `21`이 있으므로, `24`와 비교합니다.  
	- `24 > 21` 이므로 오른쪽 자식 노드로 이동합니다.
4. 오른쪽 자식의 데이터와 찾으려는 데이터가 같으므로 `True`를 반환하고 종료합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250712004256.png)



BST에 없는 데이터를 찾으려 하면 `False`를 반환합니다. 예를 들어 `19`라는 데이터를 BST에서 찾으려면 다음과 같은 순서로 진행됩니다.

1. 루트 노드에 `20`이 있으므로, `19`와 비교합니다.
    - `19 < 20` 이므로 왼쪽 자식 노드로 이동합니다.
2. 현재 노드에는 `15`가 있으므로, `19`와 비교합니다.
    - `19 > 15` 이므로 오른쪽 자식 노드로 이동합니다.
3. 현재 노드에는 `17`이 있으므로, `19`와 비교합니다.
    - `19 > 17` 이므로 오른쪽 자식 노드로 이동해야 합니다.
    - 하지만 오른쪽 자식 노드가 없으므로, 더 이상 탐색할 노드가 없습니다. 따라서, 트리에 값이 존재하지 않음을 의미하므로 `False`를 반환하고 탐색을 종료합니다.

![](ComputerScience/DataStructure/images/Pasted%20image%2020250712013651.png)


## Implementation
### Python
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
  
    def delete(self, value: int) -> Optional[int]:  
        prev, curr, target = self.root, self.root, Node(value)  
        while curr:  
            if curr == target:  
                break  
  
            if target < curr:  
                prev, curr = curr, curr.left  
            elif target > curr:  
                prev, curr = curr, curr.right  
            else:  
                return  
  
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
  
        return curr.value  
  
    def search(self, value: int) -> bool:  
        curr, target = self.root, Node(value)  
        while curr:  
            if curr == target:  
                return True  
  
            if target < curr:  
                curr = curr.left  
            else:  
                curr = curr.right  
  
        return False  
  
    def ceil(self, value: int) -> Optional[int]:  
        curr, target, ans = self.root, Node(value), None  
        while curr:  
            if curr == target:  
                return curr.value  
  
            if target < curr:  
                ans = curr.value  
                curr = curr.left  
            else:  
                curr = curr.right  
  
        return ans  
  
    def floor(self, value: int) -> Optional[int]:  
        curr, target, ans = self.root, Node(value), None  
        while curr:  
            if curr == target:  
                return curr.value  
  
            if target > curr:  
                ans = curr.value  
                curr = curr.right  
            else:  
                curr = curr.left  
  
        return ans  
  
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
print(bst.floor(23))  
print(bst.delete(25))  
bst.display()
```


### Java
```java
```
