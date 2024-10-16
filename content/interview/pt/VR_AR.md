---
title: VR/AR
---
## VR / AR
- Virtual Reality, 가상현실. **실제와 유사하지만 실제 환경이 아닌 인공환경을 제공**
- 가상현실을 경험할 수 있는 하드웨어 기기가 필요
- 대표적인 예로 Playstation VR, Oculus Meta Quest series 가 있음.

### 투입 기술
1. 이미지 모델링, 렌더링
- 가상환경 내의 이미지를 더 정교하게 표현하기 위해 폴리곤의 수를 늘리는 방식으로 모델링
- 폴리곤?
	- 3D 오브젝트의 기본단위
	- 삼각형 또는 사각형으로 이미지를 표현
	- 도형의 이미지가 작아질수록 **더 정교한 이미지가 표현가능**하지만 동시에 **연산 처리량도 많아지는 단점**이 존재.

3. VR 기기 내 시야 표현

- 2D 그래픽을 사용자에게 3D 현실환경처럼 느끼도록 유도해야함
	
- 스테레오스코픽 3D 기술 활용
	
	- 왼쪽 눈과 오른쪽 눈에 들어오는 그래픽의 입체적 깊이감(눈의 양안단서를 활용)을 다르게 하여 뇌가 3D로 인식하게 함
	
        ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/397cce5b-cffd-4644-99cd-df5f250f57b2/e12715a9-752c-429f-bb5e-e97c1e8ddb62/Untitled.png)
        
        [](https://news.lgdisplay.com/2017/10/%EB%91%90-%EB%88%88%EC%9C%BC%EB%A1%9C-%EB%B0%94%EB%9D%BC%EB%B3%B4%EB%8A%94-3d-%EC%98%81%EC%83%81-%EC%8A%A4%ED%85%8C%EB%A0%88%EC%98%A4%EC%8A%A4%EC%BD%94%ED%94%BD-3d%EB%A5%BC-%ED%8C%8C%ED%97%A4/)[https://news.lgdisplay.com/2017/10/두-눈으로-바라보는-3d-영상-스테레오스코픽-3d를-파헤/](https://news.lgdisplay.com/2017/10/%EB%91%90-%EB%88%88%EC%9C%BC%EB%A1%9C-%EB%B0%94%EB%9D%BC%EB%B3%B4%EB%8A%94-3d-%EC%98%81%EC%83%81-%EC%8A%A4%ED%85%8C%EB%A0%88%EC%98%A4%EC%8A%A4%EC%BD%94%ED%94%BD-3d%EB%A5%BC-%ED%8C%8C%ED%97%A4/)
        
    
    1. 트래킹
        
        - VR 기기 내부 트래킹 활용 방식
            
            1. VR 내장 카메라가 주변 환경을 인식
                
            2. 얻은 정보를 통해 사용자의 position을 계산하여 이미지를 출력
                
        - VR 기기 외부 트래킹 활용 방식
            
            1. 카메라 기반 트래킹 : VR 기기 내부 트래킹과 유사하지만 카메라가 외부에 있다는 차이점이 존재
                
            2. 마커 기반 트래킹 : 주로 영화에서 자주 활용되는 기법, 유저의 마커를 인식하여 position을 계산
                
    2. 활용 분야
        
        1. 게임 : 가상환경의 놀이공간을 사용자에게 제공 → 주로 Entertainment적 측면, **코로나19 이후 주로 boom-up된 산업 분야**
            
        2. 의료 및 교육 : 가상환경에서 가상의 환자를 통해 의료 서비스 제공 연습 및 학습, 비대면 학습에서 일방향 회의식보다 더 입체적인 경험을 사용자에게 제공할 수 있음
            
        3. 비즈니스 : 사무실 회의, 업무환경 등 자택 근무 시 활용 가능
            
        4. 디자인 및 관광 : 가상환경에서 방문하고 싶은 특정 지역에 가서 직접 체험해보거나, 건축 디자인을 짓기전 미리 시뮬레이션하여 테스팅할 수 있음
            
    
    # AR
    
    1. Augumented Reality, 증강현실. **현실 공간에 가상 공간을 더하여** 사용자에게 제공
    
    <aside> 💡 아이언맨 영화의 자비스, Poketmon go, 스파이더맨 이디스 등..
    
    </aside>
    
    1. VR과 마찬가지로 트래킹 기술이 필요함
        
    2. VR / AR의 공통점, 차이점
        
        |공통점|차이점(VR)|차이점(AR)|
        |---|---|---|
        |가상 현실경험을 사용자에게 제공|100% 가상환경|현실공간 + 가상환경|
        |하드웨어 기기가 필요|트래킹 기술에 있어 내, 외부 트래킹이 둘 다 가능|트래킹 기술에 있어 외부 트래킹은 주로 활용되지 않음|
        |하드웨어의 내장된 센서를 통해 가상환경의 position을 계산함|||
        
    3. 활용 분야 : 무궁무진함
        
        1. 교육
            
        2. 게임
            
        3. 쇼핑 : 착용할 옷을 미리 입어보기, 쇼핑몰 내의 길 안내 등
            
        4. 관광 : 특정 관광지의 안내 기능
            
        5. 엔터 체험
            
        6. 의료 등등..
            
        
        [https://www.itworld.co.kr/t/69499//332686](https://www.itworld.co.kr/t/69499//332686)
        
        [https://www.itworld.co.kr/t/69499//332686/326906](https://www.itworld.co.kr/t/69499//332686/326906)
        
        [https://www.businesspost.co.kr/BP?command=article_view&num=329158](https://www.businesspost.co.kr/BP?command=article_view&num=329158)
