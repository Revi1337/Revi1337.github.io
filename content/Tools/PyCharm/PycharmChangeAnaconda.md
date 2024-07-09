---
title: 기존 프로젝트의 Anaconda 환경 변경
tags: ["pycharm"]
---

### 문제
Git 에 올려놨던 프로젝트를 Mac 에서 Clone 하여 PyCharm 으로 열었더니, Anaconda 의 Python 버전이 맞지 않아 match 문법에 syntax error 가 발생헀다.

![](Tools/PyCharm/images/Pasted%20image%2020240709220510.png)

### 해결 방법

PyCharm 에서 Anaconda 의 환경을 바꾸려면 `Settings (command + ,)` 의 `Python InterPreter` 에 들어간다. 그리고 `Add Interpreter > Add Local Interpreter` 를 눌러준다.

![](Tools/PyCharm/images/Pasted%20image%2020240709220753.png)


이제 원하는 환경 이름, 파이썬 버전을 설정해주고 환경을 만들어주면 된다.

![](Tools/PyCharm/images/Pasted%20image%2020240709220935.png)


이제 match 문법에서 Syntax error 가 발생하지 않는것을 볼 수 있다.

![](Tools/PyCharm/images/Pasted%20image%2020240709221059.png)

### 선택사항
PyCharm 에서 아나콘다 환경을 변경해줘도 터미널에서의 환경은 바뀌지 않는다. 하지만 아래의 커맨드로 새롭게 만든 아나콘다 환경을 activate 시켜줘서 싱크를 맞출 수 있다.

```bash
$ conda env list
```

```bash
$ conda activate algorithm
```

![](Tools/PyCharm/images/Pasted%20image%2020240709221434.png)

### Reference
https://docs.anaconda.com/working-with-conda/ide-tutorials/pycharm/

