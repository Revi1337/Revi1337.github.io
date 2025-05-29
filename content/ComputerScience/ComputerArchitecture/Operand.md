---
title: Operand
tags: ["computer_architecture"]
---

## 명령어
명령어(Operand) 는 컴퓨터를 실질적으로 움직이게하는 정보를 의미한다. 또는 [[ComputerScience/ComputerArchitecture/Data|데이터]]를 활용하여 CPU 를 작동시키는 정보를 의미한다.

## 명령어의 구조
명령어는 명령어가 수행할 연산을 담고 있는 `op-code(연산코드)` 그리고 `연산에 사용될 데이터` 혹은 `레지스터` 혹은 `연산에 사용될 데이터가 저장된 위치` 를 나타내는 `operand(주소필드)` 로 구성된다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218133801.png)

> [!note] 
> 연산에 사용될 데이터보다 연산에 필요한 데이터가 저장된 위치가 훨씬 더 많이 저장된다. 그래서 operand 필드를 "주소필드" 라고 부르기도 한다.

### 다양한 명령어의 구조
기본적으로 명령어는 opcode(연산코드) 와 operand(주소필드) 로 구성된다. 하지만 명령어를 이루는 operand(주소필드) 는 없을수도 있고 여러개가 있을 수 있다.

**opcode**

- 주소필드가 없는 명령어이며 `0-주소 명령어` 라고 불리운다.

**opcode operand(주소필드)**

- 하나의 주소필드가 있는 명령어이며 `1-주소 명령어` 라고 불리운다.

**opcode operand(주소필드) operand(주소필드)**

- 두개의 주소필드가 있는 명령어이며 `2-주소 명령어` 라고 불리운다.

**opcode operand(주소필드) operand(주소필드) operand(주소필드)**

- 세개의 주소필드가 있는 명령어이며 `3-주소 명령어` 라고 불리운다.


![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218134016.png)

## 연산코드
`CPU 가 수행할 연산에 대한 정보를 담고있는 opcode(연산코드)` 는 CPU 마다 종류가 다르고 개수도 다르다. 하지만 공통적인 연산코드의 종류와 연산은 아래와 같다.

1. **데이터 전송**
	- MOVE : 데이터를 옮기는 연산 (ex. 레지스터에서 다른 레지스터로 데이터를 옮긴다.)
	- STORE : 메모리에 저장해라 (ex. 메모리에 어떤 값을, 혹은 어떤 메모리 위치에 저장되어있는 값을 저장해라.)
	- LOAD(FETCH) : 메모리에서 CPU 로 데이터를 가져와라
	- PUSH : Stack 에 데이터를 저장하라
	- POP : Stack 의 최상단 데이터를 가져와라
2. **산술/논리 연산**
	- ADD / SUBSTRACT / MULTIPLY / DIVIDE : 덧셈 / 뺼셈 / 곱셈 / 나눗셈 을 수행해라
	- INCREMENT / DECREMENT : Operand 에 1을 더해라 / 1 을 빼라
	- AND / OR / NOT : AND / OR / NOT 연산을 수행해라
	- COMPARE : 두 개의 숫자 또는 TRUE / FALSE 값을 비교해라
3. **제어흐름 변경**
	- JUMP : 특정 주소로 실행 순서를 옮겨라
	- CONDITIONAL JUMP : 조건에 부합할 때 특정 주소로 실행 순서를 옮겨라
	- HALT : 프로그램의 실행을 멈춰라
	- CALL : 되돌아올 주소를 저장한 채 특정 주소로 실행 순서를 옮겨라
	- RETURN : CALL 을 호출할 때 저장했던 주소로 돌아가라
4. **입출력 제어**
	- READ (INPUT) : 특정 입출력 장치로부터 데이터를 읽어라
	- WRITE (OUTPUT) : 특정 입출력 장치로 데이터를 써라
	- START IO : 입출력 장치를 시작하라
	- TEST IO : 입출력 장치의 상태를 확인하라

## 명령어 주소 지정 방식
앞에서도 설명했지만 명령어는 Opcode, Operand 로 구성되어있고 Operand 에는 값 자체나, 값이 들어있는 메모리주소가 저장될 수 있었다. 그리고 많은 경우에 Operand 필드에는 `값 자체보단 값이 들어있는 메모리 주소가 들어있을 확률이 높다` 고도 언급했었다. 그렇다면 `왜 Operand 에는 값자체보단, 값이 들어있는 메모리주소가 저장되어 있는 경우가 더 많을까?`

### 주소필드에 값의 주소를 저장하는 이유
Operand 에 데이터 자체보다 연산에 필요한 데이터의 주소값을 명시하는 이유는 `명령어내에서 표현할 수 있는 정보의 크기를 제한받지 않도록 하기 위함이다.`

예를 들어 명령어의 크기가 1WORD(16Bit) 이고 명령어의 종류는 `2-주소지정 명령어` 라고 가정해보자. 또한, 명령어의 opcode 는 4bit, 각 operand(주소필드) 는 6bit 씩 갖고 있다고 가정해보자.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218150808.png)


명령어 내부 하나의 Operand(주소필드)가 표현할 수 있는 정보(데이터) 크기는 `2의 6승인 64개`이다. 이는 매우 작은 값이다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218150720.png)


만약 해당 명령어가 `3-주소지정 명령어`  를 사용한다고 치면, 하나의 Operand 당 표현할 수 있는 정보(데이터) 크기는 `2의 4승인 8개` 로 2-주소지정 명령어를 사용할때보다 표현 범위가 더 줄어들게 된다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218151317.png)


만약 Operand 에 `데이터의 값이 아닌, 데이터가 저장된 주소(메모리 주소)를 명시`하면 정보를 표현할 수 있는 크기가 매우 커지게 된다. 

아래 그림은 하나의 Operand 로 2의 6승인 64개의 정보를 표현할 수 있다. 하지만 Operand 에 60000 이라는 숫자를 저장할 수 없다. 왜냐하면 당연하게 60000 이라는 수는 6bit 로 표현할 수 없기 때문이다. 그렇다면 60000 이라는 수가 저장된 메모리 주소를 가리키면 어떻게 될까?

아래처럼 메모리가 있고, 주소당 16bit 만큼 저장할 수 있다고 가정해보자. 그리고 Operand 에서 Data 가 저장된 10 번지 주소를 가리키면 `2의 16승인 65536개`의 정보를 표현할 수 있게 된다. 

이렇게 정보가 저장된 주소를 Operand 에 저장하게 되면 표현할 수 있는 정보의 크기가 엄청 늘어나게 된다. 그래서 대부분 Operand 에는 값 자체보다는 값이 저장된 메모리 주소가 저장되어 있다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218153744.png)

### 유효주소
Effective Address (유효주소)는 `연산에 사용할 데이터가 저장된 위치`를 의미한다. 아래 명령어의 유효주소는 `10번지` 가 된다. 물론 Operand 에 R1 과 같은 레지스터가 들어가게 되면 유효주소는  `R1` 이 된다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218153744.png)

### 명령어 주소 지정 방식
Operand 에는 레지스터가 담길 수도 있고 메모리 주소가 담길 수도 있고, 연산코드에 사용될 데이터가 직접 명시될수도 있다는 것을 알았다. 명령어 주소 지정 방식은 `연산에 사용될 데이터가 저장된 위치를 찾는 방법` 을 의미한다. 크게 아래와 같이 생각하면 된다.

- 연산에 사용될 데이터가 저장된 위치를 찾는 방법
- 유효 주소를 찾는 방법
- 다양한 명령어 주소지정 방식들이 존재

> 한마디로 명령어 주소 지정 방식은 "명령어에 사용될 데이터가 어디에 저장되어 있구나" 라고 판단할 수 있는 방법들이라고 생각하면 된다.

### 다양한 주소지정 방식
**직접 주소 지정 방식**
- Direct Addressing Mode 라고 불린다.
- Operand 필드에 `유효주소(Effective Address)` 를 직접 명시하는 방법이다.
- 유효주소(Effective Address) 를 표현할 수 있는 크기가 연산 코드만큼 줄어드는 단점이 있다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218224526.png)


**간접 주소 지정 방식**
- Indirect Addressing Mode 라고 불린다.
- 직접 주소 지정 방식의 단점 (유효주소를 표현할 수 있는 크기가 연산 코드만큼 줄어드는 것)을 보완하기 위해 고안된 방법이다.
- Operand 필드에 `유효주소(Effective Address)의 주소` 를 명시하는 방법이다.
- 메모리를 여러번 찾아야하기 때문에 당연히 직접 주소지정 방식보다 느리다는 단점이 있다.

> [!note]
> CPU 가 메모리에서 값을 찾는 것은 굉장히 느리기 때문에  메모리 접근을 최소화하는것이 속도면에서 무조건 좋다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218225401.png)


**레지스터 주소 지정 방식**
- Register Addressing Mode 라고 불린다.
- 연산에 사용할 데이터가 저장된 `레지스터`를 명시하는 방법이다.
- **메모리에 접근하는 속도보다 레지스터에 접근하는 것이 빠르다. (매우 중요)**

> [!note] 메모리에 접근하는 속도보다 레지스터에 접근하는 것이 더 빠르다.
> Memory  는 CPU 밖에 위치한다. 이와 달리 레지스터는 CPU 의 구성요소이기 때문에 CPU 내부에 위치한다. 상식적으로 생각해보아도 Memory 에 접근하는 속도보다 Register 에 접근하는 것이 더 빠르다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218225638.png)


**레지스터 간접 주소 지정 방식**
- Register Indirect Addressing Mode 라고 불린다.
- 연산에 사용할 `데이터를 메모리에 저장해두고, 그 주소를 저장한 레지스터를 Operand 에 명시`하는 방법이다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218230136.png)

