---
title: BackTracking
---

### 특정한 수의 부분집합

```python
def solution(N):  
  
    def subset(integer):  
        numbers = [0] * (integer + 1)  
        result = []  
  
        def generate(v):  
            if v == integer + 1:  
                partial = []  
                for idx in range(1, integer + 1):  
                    if numbers[idx]:  
                        partial.append(idx)  
                result.append(partial)  
            else:  
                numbers[v] = 1  
                generate(v + 1)  
                numbers[v] = 0  
                generate(v + 1)  
  
        generate(1)  
        return result  
  
    answer = subset(N)  
    for line in answer:  
        print(line)  
  
solution(3)
```

### 배열 원소들의 부분집합

```python
def solution(iterable): 

    def subset(lists):  
        length = len(lists)  
        result = []  
  
        def generate(v):  
            if v == length:  
                partial = []  
                for idx in range(length):  
                    if lists[idx]:  
                        partial.append(lists[idx])  
                result.append(partial)  
            else:  
                original = lists[v]  
                lists[v] = 0  
                generate(v + 1)  
                lists[v] = original  
                generate(v + 1)  
  
        generate(0)  
        return result  
  
    answer = subset(iterable)  
    for line in answer:  
        print(line)  
  
solution(["a", "b", "c", "d", "e"])
```


### 합이 같은 두 부분집합

```python
def solution(size, lists):  
  
    def subsets_sum(level, curr_sum):  
        if curr_sum > total // 2:  
            return  
        nonlocal answer  
        if level == size:  
            if total - curr_sum == curr_sum:  
                answer = True  
            return        
		if not answer:  
            subsets_sum(level + 1, curr_sum + lists[level])  
            subsets_sum(level + 1, curr_sum)  
  
    answer = False  
    total = sum(lists)  
    subsets_sum(0, 0)  
    print('YES' if answer else 'No')  
  
solution(6, [1,3,5,6,7,10])
```
