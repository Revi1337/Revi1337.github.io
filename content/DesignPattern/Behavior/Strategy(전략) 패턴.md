전략패턴은 변할 가능성이 있는 행동들(알고리즘군) 을 정의하고, 이를 `캡슐화` 시켜 각각의 행동들(알고리즘군)을 변경 및 수정해서 쓸 수 있게 해는 디자인 패턴이다. 해당패턴을 통해 클라이언트로부터 알고리즘(행동)을 분리해서 독립적으로 변경할 수 있다. (OCP, SRP)

## 기존
아래 코드의 `Marin` 는 직접적으로 `attack()` 을 구현하고 있다. 하지만 이 때, Marin 의 공격방법을 저격으로 바꿔야한다는 고객의 요구사항이 들어왔다. 물론 Marin 의 attack 을 직접적으로 수정할순 있지만 `기존의 코드` 를 변경해야한다. 이는 `OCP` 에 위배되는 원칙이다. 따라서 더 좋은 방법을 생각해내야만 한다.

```java
public abstract class Soldier {  
  
    public abstract void attack();  
  
}
```

```java {6}
public class Marin extends Soldier {  
  
    @Override  
    public void attack() {  
        // System.out.println("K-2 로 공격합니다. 뚜두두두두");  
        System.out.println("K-15 로 공격합니다.");  
    }  
}
```

```java
public class Client {  
  
    public static void main(String[] args) {  
        Marin marin = new Marin();  
        marin.attack();  
    }  
}
```

## 개선
### 달라지는 부분을 찾아 분리한다
우선 애플리케이션에서 달라지지 않는 부분과 달라지는 부분을 분리하여, 달라지는 부분들을 묶어 `캡슐화` 시킨다. 이를 통해 나중에 바뀌지 않는 부분에서 영향을 미치지 않고, 그 부분만 고치거나 확장할 수 있다 (`OCP`). 현재 우리의 앱에서 변할 수 있는 부분은 Attack `행동`이다. 

> [!note] 디자인 원칙 달라지는 부분을 찾아내고, 달라지지 않는 부분과 분리한다. 
> 애플리케이션에서 달라지는 부분을 찾아내고, 달라지지 않는 부분과 분리하여 그 부분들을 묶어 캡슐화시킨다.

Attack 에 대한 행동들을 분리시켜 이들을 캡슐화할때 `interface` 를 이용한다.

> [!note] 디자인 원칙 : 구현보다는 인터페이스에 맞춰서 프로그래밍한다.
> 상위 형식에 맞춰 다형성을 활용하며 프로그래밍 한다는 의미이다.

```java
public interface AttackStrategy {  
  
    void attack();  
  
}
```

```java
public class SniperStrategy implements AttackStrategy {  
  
    @Override  
    public void attack() {  
        System.out.println("K-15 로 저격합니다");  
    }  
}
```

```java
public class GunStrategy implements AttackStrategy {  
  
    @Override  
    public void attack() {  
        System.out.println("총으로 공격합니다. 뚜두두두두");  
    }  
}
```

### 두 클래스를 통합한다
상속보다는 포함(Composition) 을 활용하여 두 객체를 통합한다. 여기서 두 객체는 `Solider` 와 행동을 담당하는 `AttackStrategy` 이다. 이렇게 두 클래스를 합쳐 Soldier 에 행동을 할당할 수 있게 만들고, Soldier 에게 AttackStrategy 의 호출을 `위임`시킨다.

 >[!note] 디자인 원칙 : 상속보다는 구현을 활용한다.
 > 상속(A 는 B 이다) 보다 포함(A 에는 B가 있다) 이 나을 수 있다.

```java {3-4, 12, 16}
public abstract class Soldier {  
  
    private AttackStrategy attackStrategy;  
    private MoveStrategy moveStrategy;  
  
    public Soldier() {  
        this.attackStrategy = new GunStrategy();  
        this.moveStrategy = new MoveRoadStrategy();  
    }  
  
    public void attack() {  
        this.attackStrategy.attack();  
    }  
  
    public void move() {  
        this.moveStrategy.move();  
    }  
}
```

### 동적으로 행동을 지정할 수 있게 한다
`setter` 를 통해 행동을 동적으로 변경할 수 있도록 경로를 뚫어준다. 이를 통해 Soldier 를 확장하는 클래스들은 AttackStrategy 와 MoveStrategy 를 유동적으로 변경할 수 있다.

```java {12, 16}
public abstract class Soldier {  
  
    private AttackStrategy attackStrategy;  
    private MoveStrategy moveStrategy;  
  
    public Soldier() {  
        this.attackStrategy = new GunStrategy();  
        this.moveStrategy = new MoveRoadStrategy();  
    }  
  
    public void setAttackStrategy(AttackStrategy attackStrategy) {  
        this.attackStrategy = attackStrategy;  
    }  
  
    public void setMoveStrategy(MoveStrategy moveStrategy) {  
        this.moveStrategy = moveStrategy;  
    }  
  
    public void attack() {  
        this.attackStrategy.attack();  
    }  
  
    public void move() {  
        this.moveStrategy.move();  
    }  
}
```

## 개선 확인
Soldier 를 확장한 Marin 은 자동으로 GunStrategy 와 MoveRoadStrategy 의 행동을 갖고 있게 된다.

```java
public class Marin extends Soldier {  
}
```

Soldier 를 확장한 Sniper 는 setter 를 통해 기존 행동을 MoveRoadStrategy 와 SniperStrategy 로 설정해준다.

```java
public class Sniper extends Soldier {  
  
    public Sniper() {  
        setMoveStrategy(new MoveTurnelStrategy());  
        setAttackStrategy(new SniperStrategy());  
    }  
}
```

이제 기존 코드 변경없이 Marin 의 `행동` 을 동적으로 변경할 수 있게 되었다.

```java {9-10, 16-17}
public class Client {  
  
    public static void main(String[] args) {  
        Marin marin = new Marin();  
        marin.move();  
        marin.attack();  
        System.out.println();  
  
        marin.setAttackStrategy(new GunStrategy());  
        marin.setMoveStrategy(new MoveSkyStrategy());  
        marin.move();  
        marin.attack();  
        System.out.println();  
  
        Sniper sniper = new Sniper();  
        sniper.move();  
        sniper.attack();  
    }  
}
```

## 정리
전략패턴을 사용하면 변할 수 있는 행동 및 행위들이 인터페이스를 통해 관리되므로, 애플리케이션의 로직이 변경되도 기존의 코드는 고치지 않고 확장하거나 문제가 되는 부분을 수정할 수 있다.
