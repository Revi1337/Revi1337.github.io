---
title: 계층마다 DTO 를 따로 둔 이유
tags: ['spring', 'layered-architecture']
---

## 들어가며
현재 진행하고 있는 프로젝트에서는 Layered Architecture 를 사용중입니다. 또한, 각 Layer 마다 dto 를 별도로 두어 코드를 짜고 있습니다. 이번 포스팅에서는 Layered Architecture 가 무엇인지, 어쩌다가 Layer 마다 dto 를 두게 되었는지에 대한 저의 고민을 적어보고자 합니다.

## Layered Architecture
Layered Architecture(레이어드 아키텍쳐)는 관심사들을 Layer 별로 추상화하여 수직적으로 나타낸 아키텍쳐입니다. 각 Layer 는 자신에게 주어진 고유한 역할을 수행하고, 인접한 다른 Layer 와 상호작용합니다. 이렇게 Layer 별로 관심사를 나누면 전체 코드를 고치지 않고도 특정 Layer 만을 수정 및 개선할 수 있어 재사용과 유지보수에 매우 유리하다는 장점이 있습니다. 

이러한 Layered Architecture 로부터 좋은 설계를 유지하려면 다음과 같은 규칙이 필요합니다.

- 하위 Layer 는 하위 Layer 를 의존하면 안됩니다.

## Request DTO 를 Repository 까지
Controller 에서 Binding 한 Request DTO 를 그대로 Service 에 내려줍니다.
Service 에서 Request DTO 를 그대로 Repository 에 내려줍니다.
Repository 에서는 Controller 의 Request DTO 를 Entity 로 변환하고 DB 와 통신합니다.

```text
domain
    ├── 1-controller
    │   └── dto
    │       ├── request
    │       └── response
    ├── 2-service
    └── 3-repository (Entity 로 변환합니다)
        └── entity  
```

해당 설계는 아래와 같은 단점을 같습니다.
- Service Layer, Repository Layer 모두 상위 Layer 인 Controller Layer 를 의존하게 됩니다.

## Request DTO 를 Service 까지
Controller 에서 내려준 Request DTO 를 Service 까지 사용할 때의 과정을 한번 확인해보겠습니다.

#### 방법 1
```text
domain
    ├── 1-controller
    │   └── dto
    │       ├── request
    │       └── response
    ├── 2-service (Entity 로 변환합니다)
    └── 3-repository
        └── entity  
```

위와 같은 Package 구조에서 Controller 에서 내려준 Request DTO 를 Service 까지 사용할 때의 과정은 아래와 같습니다.

1. Controller 에서 Binding 한 Request DTO 를 그대로 Service 에 내려줍니다.
2. Service 에서 `Request DTO` 를 `Entity` 로 변환하고 Repository 에 내려줍니다.
3. Repository 에서는 Entity 를 이용하여 DB 와 통신합니다.

![](Spring/project/images/Pasted%20image%2020250127000731.png)


해당 설계는 다음과 같은 단점을 갖습니다.

**단점**

- 여전히 `Service 는 상위 Layer 인 Controller 를 의존` 하고 있습니다. Controller 의 DTO가 변경되면, 이를 사용하는 Service Layer 도 함께 수정해야 합니다. 이는 코드 수정의 영향을 `한 계층에서 다른 계층으로 전파시키는 문제`가 됩니다.

#### 방법 2
`방법1` 과 같이 Service 가 Controller 를 의존하는 문제는 `Controller 하위에 위치한 DTO 패키지를 Service Layer 로 옮기면 해결`할 수 있습니다. 어짜피 `Controller Layer` 는 하위 계층인 `Service Layer` 를 의존하고 있기 때문에, Controller 가 Service 의 DTO 를 의존한다 해도 Service 의존성 내에서 해결되게 됩니다.

```text
domain
    ├── 1-controller
    ├── 2-service (Controller 의 DTO 를 Service 로 옮기면 해결 가능합니다.) & (Entity 로 변환합니다)
    │   └── dto
    │       ├── request
    │       └── response
    └── 3-repository
        └── entity
```


프로세스와 그림은 `방법 1` 과 동일합니다.

1. Controller 에서 Binding 한 Request DTO 를 그대로 Service 에 내려줍니다.
2. Service 에서 `Request DTO` 를 `Entity` 로 변환하고 Repository 에 내려줍니다.
3. Repository 에서는 Entity 를 이용하여 DB 와 통신합니다.

![](Spring/project/images/Pasted%20image%2020250127000731.png)


그럼에도 단점도 있습니다.

**단점**

- `Controller 와 Service 간의 경계가 모호` 해집니다. Controller 는 사용자와 통신하기 위한 API 스펙인 Request DTO 를 설계해야 합니다. 하지만 위 구조에서는 Request DTO 가 Service 에 위치하기 때문에 누군가 코드를 본다면 Service 가 API Spec 을 정의하고 있어 이상하다고 생각할 수 있습니다.
- `Request DTO 가 Service Layer 에 그대로 전달된다는 것은 해당 Request DTO 가 사용되는 Controller 와 해당 Service 는 1 : 1 매핑`. 즉, 해당 Service 는 호출된 Controller 에 종속적이게 됩니다.

장점도 있습니다.

**장점**
- 복잡한 API 스펙 



## Request DTO 를 Controller 까지
각 Layer 마다 DTO 를 두면 모든것이 해결 (단 중복코드의 발생과 유지보수가 힘들어진다. 이는 곧 애플리케이션의 복잡성을 증가시킨다. 하지만 좋은 캡슐화와 좋은 설계를 가져갈 수 있다.) 

이러한 설계도 단점은 존재합니다.

- DTO 간 중복되는 필드와 변환 코드가 많아질 수 있습니다. 말 그대로 DTO 지옥을 경험할 수 있습니다.
- 중복된 DTO 를 관리하면서 유지보수 작업이 복잡해질 수 있습니다.
	- 특히, 특정 DTO 의 필드 변경 시, 여러 계층의 DTO를 모두 수정해야 할 가능성이 생길 수 있습니다.
- 이러한 영향으로 애플리케이션의 복잡도가 증가할 수 있습니다.

```text
domain
    ├── 1-controller (Service DTO 로 변환하여 Service 로 넘겨줍니다)
    │   └── dto
    │       ├── request
    │       └── response
    ├── 2-service (Entity 로 변환하여 Repository 로 넘겨줍니다)
    │   └── dto
    └── 3-repository
        └── entity
```

## 꼭 변환해서 다음 Layer 에 넘겨야할까?

