---
title: Serialize
tags: ['language', 'java']
---

## Serialize & Deserailize
직렬화(Serialize)는 자바의 객체를 바이트 형태로 변환하는 기술입니다. 직렬화되어 바이트로 변환된 객체는 다른 자바 시스템에서 역직렬화(Deserialize) 되어 다시 객체로 변환되어 사용됩니다.

- `직렬화(Serialize)`: 자바 객체를 바이트 형태의 데이터로 변환하는 기술입니다.
- `역직렬화(Deserialize)`: 바이트 형태의 데이터를 다시 자바 객체로 변환하는 기술입니다.

![](Language/Java/images/Pasted%20image%2020250627013724.png)


직렬화는 JVM 메모리에 상주하는 `객체 데이터를 영속화`하거나, `네트워크로 전송`하기 위해 사용됩니다. 시스템이 종료되더라도 데이터가 유지된다는 장점이 있어 다음과 같은 사례에서 자주 활용됩니다.

- `Servlet Session` : 세션을 디스크 또는 DB에 저장하기 위해 직렬화가 필요합니다.
- `Cache(Ehcache, Redis, Memcached)` : 캐시에 객체를 저장하고 불러오기 위해 직렬화를 사용합니다.
- `Java RMI(Remote Method Invocation)` : 원격 메서드 호출 시, 객체를 네트워크를 통해 전달하기 위해 직렬화가 필요합니다.


## How to Serialize 
자바에서는 객체를 직렬화/역직렬화하기 위해 `java.io.Serializable` 인터페이스를 구현해야 합니다. 기본형(Primitive Type)은 자동으로 직렬화가 가능하지만, 참조형(Reference Type) 객체는 `Serializable` 인터페이스를 구현해야 가능합니다.

- `int`, `long`, `double` 와 같은 기본형은 별도 조치 없이 직렬화됩니다.
- `String`, `Array`, `Collection` 같이 주소값을 갖는 참조형은 해당 클래스가 `Serializable`을 구현하고 있어야 직렬화가 가능합니다.
	- 만약 참조형 객체가 다른 참조형 필드를 포함한다면, 그 필드 역시 `Serializable`을 구현해야 합니다.
- 직렬화에서 제외하고 싶은 필드는 `transient` 키워드를 사용하면 됩니다.


직렬화하려는 객체는 물론이고 해당 객체를 구성하는 기본형을 제외한 모든 필드가 `Serializable`를 구현하고 있기 때문에 정상적으로 직렬화되는 것을 확인할 수 있습니다.

```java
public class ResearchSerialize {  
  
    public static class TestField implements Serializable {  
    }  
    
    public record TestRecord(  
            int field1,  
            String field2, // String.class already implements Serializable  
            TestField field3  
    ) implements Serializable {  
    }  
    
    public static void main(String[] args) throws Exception {  
	    TestRecord testRecord = new TestRecord(10, "TestRecord", new TestField());  
	  
	    byte[] serializedRecord;  
	    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {  
	        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {  
	            oos.writeObject(testRecord); // Serialize  
	            serializedRecord = baos.toByteArray();  
	        }  
	    }  
	  
	    TestRecord deserializedRecord;  
	    try (ByteArrayInputStream bais = new ByteArrayInputStream(serializedRecord)) {  
	        try (ObjectInputStream ois = new ObjectInputStream(bais)) {  
	            deserializedRecord = (TestRecord) ois.readObject(); // Deserialize  
	        }  
	    }  
	  
	    System.out.println(deserializedRecord); // TestRecord[field1=10, field2=TestRecord, field3=research.interview.serialize.ResearchSerialize$TestField@71bbf57e]  
	}
}
```


### Fail Case
반대로 직렬화하려는 참조형 객체가 `Serializable` 인터페이스를 구현하지 않은 경우, 직렬화 시도 시 `java.io.NotSerializableException` 예외가 발생합니다.

```java
public class ResearchSerialize {  
  
    public static class TestField implements Serializable {  
    }  
    
    public record TestRecord( // Must be implements Serializable Interface  
            int field1,  
            String field2,  
            TestField field3  
    ) {  
    }  
    
    public static void main(String[] args) throws Exception {  
        TestRecord testRecord = new TestRecord(10, "TestRecord", new TestField());  
  
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {  
            try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {  
                oos.writeObject(testRecord);  // NotSerializableException  
            }  
        }  
    }  
}
```


동일하게, 직렬화 대상 객체 내부의 참조형 필드가 또 다른 객체를 참조하고 있고, 그 객체가 `Serializable` 인터페이스를 구현하지 않았다면 역시 `NotSerializableException`이 발생합니다.

```java
public class ResearchSerialize {  
  
    public static class TestField { // Must be implements Serializable Interface  
    }  
  
    public record TestRecord(  
            int field1,  
            String field2,  
            TestField field3  
    ) implements Serializable {  
    }  
    
    public static void main(String[] args) throws Exception {  
        TestRecord testRecord = new TestRecord(10, "TestRecord", new TestField());  
  
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {  
            try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {  
                oos.writeObject(testRecord);  // NotSerializableException  
            }  
        }  
    }  
}
```


## Reference
[Serialization in Java](https://techvidvan.com/tutorials/serialization-in-java/)

[자바 직렬화, 그것이 알고싶다. 흝어보기편](https://techblog.woowahan.com/2550/)

[자바 직렬화, 그것이 알고싶다. 실무편](https://techblog.woowahan.com/2551/)

[Oracle Javadocs(Stream Unique Identifiers)](https://docs.oracle.com/javase/6/docs/platform/serialization/spec/class.html#4100)

[Oracle Javadocs(The Serializable Interface)](https://docs.oracle.com/javase/8/docs/platform/serialization/spec/serial-arch.html#a4539)
