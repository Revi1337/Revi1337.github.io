---
title: Operand
tags: ["computer_architecture"]
---

## 명령어
`명령어(Operand)`는 컴퓨터를 실질적으로 움직이게하는 정보를 말합니다. 또는 [[ComputerScience/ComputerArchitecture/Data|데이터]]를 이용하여 CPU 를 작동시키는 정보를 말합니다.


## 명령어의 구조
명령어는 명령어가 수행할 연산을 담고 있는 `op-code(연산코드)`, `연산에 사용될 데이터` 혹은 `레지스터 혹은 연산에 사용될 데이터가 저장된 위치 를 나타내는 operand(주소필드)` 로 구성된다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218133801.png)

> [!note] 
> 연산에 사용될 데이터 자체보다 연산에 필요한 데이터가 저장된 위치(주소)가 훨씬 더 많이 저장됩니다. 그래서 operand 필드를 "주소필드" 라고 부르기도 합니다.


### 다양한 명령어의 구조
기본적으로 명령어는 `opcode(연산코드)`와 `operand(주소필드)`로 구성됩니다. 하지만 명령어를 이루는 operand(주소필드)는 없을 수도 있고 여러개가 있을 수도 있습니다. 명령어의 종류는 다음과 같이 있습니다.

- `0-주소 명령어` : 주소필드가 없는 명령어이며 `opcode` 구조를 갖고 있습니다.
- `1-주소 명령어` : 하나의 주소필드가 있는 명령어이며 `opcode operand(주소필드)` 구조를 갖고 있습니다.
- `2-주소 명령어` : 두개의 주소필드가 있는 명령어이며 `opcode operand(주소필드) operand(주소필드)` 구조를 갖고 있습니다.
- `3-주소 명령어` : 세개의 주소필드가 있는 명령어이며 `opcode operand(주소필드) operand(주소필드) operand(주소필드)` 구조를 갖고 있습니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218134016.png)

## 연산코드
`CPU 가 수행할 연산에 대한 정보를 담고있는 opcode(연산코드)` 는 CPU 마다 종류가 다르고 개수도 다릅니다. 하지만 공통으로 갖고있는 연산코드도 있습니다.

1. **데이터 전송**
	- MOVE : 데이터를 옮기는 연산 (ex. 레지스터에서 다른 레지스터로 데이터를 옮깁니다.)
	- STORE : 메모리에 저장해라 (ex. 메모리에 어떤 값을, 혹은 어떤 메모리 위치에 저장되어있는 값을 저장합니다.)
	- LOAD(FETCH) : 메모리에서 CPU 로 데이터를 가져옵니다.
	- PUSH : Stack 에 데이터를 저장합니다.
	- POP : Stack 의 최상단 데이터를 가져옵니다.
2. **산술/논리 연산**
	- ADD / SUBSTRACT / MULTIPLY / DIVIDE : 덧셈 / 뺼셈 / 곱셈 / 나눗셈 을 수행합니다.
	- INCREMENT / DECREMENT : Operand 에 1을 더해라 / 1 을 뺍니다.
	- AND / OR / NOT : AND / OR / NOT 연산을 수행합니다.
	- COMPARE : 두 개의 숫자 또는 TRUE / FALSE 값을 비교합니다.
3. **제어흐름 변경**
	- JUMP : 특정 주소로 실행 순서를 옮깁니다.
	- CONDITIONAL JUMP : 조건에 부합할 때 특정 주소로 실행 순서를 옮깁니다.
	- HALT : 프로그램의 실행을 멈춥니다.
	- CALL : 되돌아올 주소를 저장한 채 특정 주소로 실행 순서를 옮깁니다.
	- RETURN : CALL 을 호출할 때 저장했던 주소로 돌아갑니다.
4. **입출력 제어**
	- READ (INPUT) : 특정 입출력 장치로부터 데이터를 읽습니다.
	- WRITE (OUTPUT) : 특정 입출력 장치로 데이터를 씁니다.
	- START IO : 입출력 장치를 시작합니다.
	- TEST IO : 입출력 장치의 상태를 확인합니다.


## 명령어 주소 지정 방식
앞서 명령어는 Opcode & Operand 로 구성되어있고 Operand 에는 값 자체나, 값이 들어있는 메모리주소가 저장될 수 있다고 언급했습니다. 그리고 많은 경우에 Operand 필드에는 `값 자체보단 값이 들어있는 메모리 주소가 들어있을 확률이 높다` 고도 언급했습니다. 그렇다면 왜 Operand 에는 값자체보단, 값이 들어있는 메모리주소가 저장되어 있는 경우가 더 많을까요?


### 주소필드에 값의 주소를 저장하는 이유
Operand 에 데이터 자체보다 연산에 필요한 데이터의 주소값을 명시하는 이유는 `명령어내에서 표현할 수 있는 정보의 크기를 제한받지 않도록 하기 위함`입니다.

예를 들어 명령어의 크기가 1WORD(16Bit) & 명령어의 종류는 `2-주소지정 명령어` & 명령어의 opcode 는 4bit, 각 operand(주소필드) 는 6bit 씩 갖고 있다고 가정해보면 다음과 같이 그려볼 수 있습니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218150808.png)


명령어 내부 하나의 Operand(주소필드)가 표현할 수 있는 정보(데이터) 크기는 `2 ^ 6 = 64개`입니다. 이는 매우 작은 값입니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218150720.png)


만약 해당 명령어가 `3-주소지정 명령어`  를 사용한다고 치면, 하나의 Operand 당 표현할 수 있는 정보(데이터) 크기는 `2의 4승인 8개` 로 2-주소지정 명령어를 사용할때보다 표현 범위가 더 줄어들게 됩니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218151317.png)


이와 달리 Operand 에 `데이터의 값이 아닌, 데이터가 저장된 주소(메모리 주소)를 명시`하면 정보를 표현할 수 있는 크기가 매우 커지게 됩니다.

아래 2-주소 명령어 구조에서, 하나의 Operand는 `2 ^ 6 = 64개`의 정보를 표현할 수 있습니다. 그러나 Operand 필드에 `60000`이라는 값을 직접 저장할 수는 없습니다. 왜냐하면 `60000`은 6비트로 표현할 수 있는 범위(0~63)를 초과하기 때문입니다. 그렇다면 `60000`이라는 값이 저장된 메모리 주소를 Operand에 저장하면 어떻게 될까요?

아래 그림에서 오른쪽을 보면, 주소당 16비트씩 데이터를 저장할 수 있는 메모리가 있고, 10번지 주소에는 `60000`이라는 데이터가 저장되어 있습니다. 이제 명령어의 Operand 필드에는 `값 자체가 아닌, 값이 저장된 메모리 주소(10번지)`를 저장하게 됩니다. 그러면 명령어는 해당 주소를 통해 실제 데이터를 가져올 수 있습니다.

즉, Operand에 값 대신 주소를 저장하면, 표현할 수 있는 정보의 크기가 `2 ^ 16 = 65536`개로 늘어나게 되어 훨씬 더 다양한 데이터를 다룰 수 있게 됩니다. 이러한 이유로 `대부분의 명령어에서 Operand에는 값 그 자체(Value)보다, 값이 저장된 위치(Address)를 저장하는 방식이 사용`됩니다.

> 여기서 연산에 사용될 데이터가 저장된 주소를 Effective Address(유효주소) 라고 합니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218153744.png)


### 유효주소
Effective Address는 `연산에 사용할 실제 데이터가 저장된 위치`를 말합니다.

- 예를 들어, `LOAD 10`이라는 명령어에서 유효 주소는 `10번지`입니다.
- 만약 `LOAD R1`과 같이 레지스터가 사용되었다면, 유효 주소는 `R1`이 됩니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218153744.png)


### 명령어 주소 지정 방식
명령어 주소 지정 방식은 `연산에 필요한 데이터가 어디에 저장되어 있는지를 지정하는 방법`을 말합니다.

- 다양한 주소 지정 방식에 따라 데이터의 위치를 해석하거나 계산합니다.
- 이 과정에서 필요한 주소를 계산하여 `유효 주소(Effective Address)를 결정`하게 됩니다.

> 쉽게 말해, 명령어 주소 지정 방식은 "명령어가 사용할 데이터가 어디에 있는지를 알려주는 규칙"이라고 이해하면 됩니다.


**직접 주소 지정 방식**
- Direct Addressing Mode 라고 불립니다.
- Operand 필드에 `유효주소(Effective Address)` 를 직접 명시하는 방법입니다.
- 유효주소(Effective Address) 를 표현할 수 있는 크기가 연산 코드의 비트 수만큼 줄어드는 단점이 있습니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218224526.png)


**간접 주소 지정 방식**
- Indirect Addressing Mode 라고 불립니다.
- 직접 주소 지정 방식의 단점 (유효주소를 표현할 수 있는 크기가 연산 코드의 비트 수만큼 줄어드는 것)을 보완하기 위해 고안된 방법입니다.
- Operand 필드에 `유효주소(Effective Address)의 주소` 를 명시하는 방법입니다.
- 메모리를 여러번 찾아야하기 때문에 당연히 직접 주소지정 방식보다 느리다는 단점이 있습니다.

> [!note]
> CPU 가 메모리에서 값을 찾는 것은 느리기 때문에  메모리 접근을 빈도수를 최소화하는것이 속도면에서 훨씬 좋습니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218225401.png)


**레지스터 주소 지정 방식**
- Register Addressing Mode 라고 불립니다.
- 연산에 사용할 데이터가 저장된 `레지스터`를 명시하는 방법입니다.

> [!note] 메모리에 접근하는 속도보다 레지스터에 접근하는 것이 더 빠르다.
> Memory 는 CPU 외부에 위치합니다. 이와 달리 레지스터는 CPU 의 구성요소이기 때문에 CPU 내부에 위치합니다. 따라서 Memory 에 접근하는 속도보다 Register 에 접근하는 것이 더 빠릅니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218225638.png)


**레지스터 간접 주소 지정 방식**
- Register Indirect Addressing Mode 라고 불립니다.
- 연산에 사용할 `데이터를 메모리에 저장해두고, 그 주소를 저장한 레지스터를 Operand 에 명시`하는 방법입니다.

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020241218230136.png)

