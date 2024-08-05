---
title: Little Endian & Big Endian
tags: ["computer_architecture"]
---

## Byte Order
Byte Order 는 시스템이 데이터를 메모리 번지에 저장하는 순서를 의미한다. 크게 Big Endian 방식과 Little Endian 방식이 있다.

### Little Endian
리틀 엔디언은  저장할 데이터를 `LSB 부터 MSB (오른쪽에서 왼쪽) 순서`로 `주기억장치의 낮은 주소에 저장` 하는 방법이며 Linux, Intel 과 AMD 계열의 CPU 가 사용하는 바이트 정렬 방식이다.

`12345678` 에서 [LSB](ComputerScience/ComputerArchitecture/Data.md#MSB,%20LSB) 에 대응하는  `10진수 8(16진수 0x38)` 이 메모리의 가장 낮은 주소에 저장된걸 볼 수 있다.

```bash
$ echo -e "1234567890\nabcdefghij\nABCDEFGHIJ\n%^&*()" | xxd -g8 -c8 -e
```

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020240805020901.png)

### Big Endian
빅 엔디언은 저장할 데이터를 `MSB 부터 LSB (왼쪽에서 오른쪽) 순서` 로 `주기억장치의 낮은 주소에 저장`하는 방법이며 IBM 과 Motorola 계열의 CPU 가 사용하는 바이트 정렬 방식이다.

`12345678` 에서 [MSB](ComputerScience/ComputerArchitecture/Data.md#MSB,%20LSB) 에 대응하는  `10진수 1(16 진수로 0x31)` 이 메모리의 가장 낮은 주소에 저장된걸 볼 수 있다.

```bash
$ echo -e "1234567890\nabcdefghij\nABCDEFGHIJ\n%^&*()" | xxd -g8 -c8
```

![](ComputerScience/ComputerArchitecture/images/Pasted%20image%2020240805021325.png)

