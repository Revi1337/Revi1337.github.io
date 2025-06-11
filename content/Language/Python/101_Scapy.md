---
title: Install Scapy
tags: ['python', 'install']
---

## Install
pip 로 scapy 를 설치합니다.

> 필자는 mac 에 설치된 디폴트 Python을 이용하여 Scapy를 설치합니다. 만약 conda 환경을 사용한다면, 이것보다는 조금 더 핸디하게 설치할 수 있을겁니다.

```bash
pip3 install scapy
```


전역적으로 실행하기 위해 환경변수를 추가합니다.

```bash
echo '\n# For Handy Scapy\nalias scapy="python3 -m scapy"' >> ~/.zshrc 
source ~/.zshrc
```


## Dependency
실행 시 수학 그래프, 도형, 벡터 그래픽(PDF, PostScript) 등을 그릴 수 있는 `PyX` 패키지와 TLS, IPsec, SSH, HTTPS 같은 Security Protocol 을 만들거나 해석하기 위해 필요한 `cryptography` 패키지가 없다고 로그가 나오면, 이를 설치합니다.

```bash {1-6}
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



또한, 네트워크 패킷을 시각화하기 위해 필요한 `TexLive 혹은 MikTeX` 가 없다고 로그가 나오면, 이를 설치합니다. Mac 은 TexLive, 윈도우는 MikTeX 를 설치합니다.

```bash {2}
revi1337@B3-B35T Algorithm % scapy
INFO: PyX dependencies are not installed ! Please install TexLive or MikTeX.
WARNING: No alternative Python interpreters found ! Using standard Python shell instead.
INFO: Using the default Python shell: History is disabled.
```

```bash
brew install --cask mactex
```


그리고 Scapy 는 기본적으로 `ipython` 을 사용합니다. ipython 이 없으면 아래 로그가 발생하게 됩니다. 이를 위해 ipython 을 설치합니다.

```
revi1337@B3-B35T Algorithm % scapy
WARNING: No alternative Python interpreters found ! Using standard Python shell instead.
...
```

```bash
pip3 install ipython
```


## Restart
이제 어떠한 경고 및 오류가 발생하지 않는 것을 확인할 수 있습니다.

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
