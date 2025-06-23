---
title: Install Scapy
tags: ['python', 'install', 'scapy']
---

## Install
pip 로 scapy 를 설치합니다. 필자는 mac 에 설치된 디폴트 Python을 이용하여 Scapy를 설치합니다.

```bash
pip3 install scapy
```


전역적으로 실행하기 위해 환경변수를 추가합니다.

```bash
echo '\n# For Handy Scapy\nalias scapy="python3 -m scapy"' >> ~/.zshrc 
source ~/.zshrc
```


## Dependency
실행 시 `PyX` 와 `cryptography` 패키지가 없다는 로그가 출력되면, 설치합니다.

- `PyX` : 수학 그래프, 도형, 벡터 그래픽(PDF, PostScript 등)을 그릴 수 있는 패키지입니다.
- `cryptography` : TLS, IPsec, SSH, HTTPS 등 보안 프로토콜을 구성하거나 해석할 때 사용되는 패키지입니다.

```bash {2-5}
revi1337@B3-B35T Algorithm % scapy
INFO: Can't import PyX. Won't be able to use psdump() or pdfdump().
INFO: Can't import python-cryptography v1.7+. Disabled PKI & TLS crypto-related features.
INFO: Can't import python-cryptography v1.7+. Disabled WEP decryption/encryption. (Dot11)
INFO: Can't import python-cryptography v1.7+. Disabled IPsec encryption/authentication.
WARNING: No alternative Python interpreters found ! Using standard Python shell instead.
INFO: Using the default Python shell: History is disabled.
                                      
                     aSPY//YASa       
             apyyyyCY//////////YCa       |
            sY//////YSpcs  scpCY//Pp     | Welcome to Scapy
 ayp ayyyyyyySCP//Pp           syY//C    | Version 2.6.1
 AYAsAYYYYYYYY///Ps              cY//S   |
         pCCCCY//p          cSSps y//Y   | https://github.com/secdev/scapy
         SPPPP///a          pP///AC//Y   |
              A//A            cyP////C   | Have fun!
              p///Ac            sC///a   |
              P////YCpc           A//A   | I'll be back.
       scccccp///pSP///p          p//Y   |                     -- Python 2
      sY/////////y  caa           S//P   |
       cayCyayP//Ya              pY/Ya
        sY/PsY////YCc          aC//Yp 
         sc  sccaCY//PCypaapyCP//YSs  
                  spCPY//////YPSps    
                       ccaacs         
                                       
```

```bash
pip3 install PyX cryptography
```


`TexLive` 또는 `MikTeX`가 설치되어 있지 않다는 로그가 출력되는 경우, 시스템에 따라 적절한 LaTeX 배포판을 설치해야 합니다.

- `TexLive` 또는 `MikTeX`: Scapy가 네트워크 패킷을 시각화할 때 사용하는 외부 LaTeX 기반 실행 파일입니다.
	- mac : TexLive 사용
	- Windows: MikTex 사용

```bash {2}
revi1337@B3-B35T Algorithm % scapy
INFO: PyX dependencies are not installed ! Please install TexLive or MikTeX.
WARNING: No alternative Python interpreters found ! Using standard Python shell instead.
INFO: Using the default Python shell: History is disabled.
```

```bash
brew install --cask mactex
```



Scapy는 기본적으로 `IPython` 인터프리터를 사용합니다. `IPython`이 설치되어 있지 않으면, 다음과 같은 경고 로그가 출력되며 기본 Python 쉘로 실행됩니다. 이를 해결하기 위해 IPython 을 설치합니다.

```
revi1337@B3-B35T Algorithm % scapy
WARNING: No alternative Python interpreters found ! Using standard Python shell instead.
...
```

```bash
pip3 install ipython
```


## Restart
이제 어떠한 경고 및 오류가 발생하지 않고 Scapy가 잘 실행되는 것을 확인할 수 있습니다.

```bash
revi1337@B3-B35T ~ % scapy     
                                      
                     aSPY//YASa       
             apyyyyCY//////////YCa       |
            sY//////YSpcs  scpCY//Pp     | Welcome to Scapy
 ayp ayyyyyyySCP//Pp           syY//C    | Version 2.6.1
 AYAsAYYYYYYYY///Ps              cY//S   |
         pCCCCY//p          cSSps y//Y   | https://github.com/secdev/scapy
         SPPPP///a          pP///AC//Y   |
              A//A            cyP////C   | Have fun!
              p///Ac            sC///a   |
              P////YCpc           A//A   | We are in France, we say Skappee.
       scccccp///pSP///p          p//Y   | OK? Merci.
      sY/////////y  caa           S//P   |             -- Sebastien Chabal
       cayCyayP//Ya              pY/Ya   |
        sY/PsY////YCc          aC//Yp 
         sc  sccaCY//PCypaapyCP//YSs  
                  spCPY//////YPSps    
                       ccaacs         
                                       using IPython 8.18.1
>>>
```
