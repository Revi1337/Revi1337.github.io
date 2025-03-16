---
title: Modifying 과 주의점
tags: ['data-jpa', 'Modifying']
---


```java
public interface CrewHashtagJpaRepository extends JpaRepository<CrewHashtag, Long> {  
  
    @Modifying(clearAutomatically = true, flushAutomatically = true)  
    @Query("delete CrewHashtag as ch where ch.id in :ids")  
    void deleteAllById(List<Long> ids);  
  
}
```


### clearAutomatically 주의점
`clearAutomatically = true` 가 설정되었을때는 굉장히 조심해야 한다. `21` 라인에서 `deleteAllByIdIn()` 로 Crew 와 연관되어있는 CrewHashtag 들을 직접 Delete 쿼리로 지운것을 볼 수 있다. 그리고 `14` 라인에서는 Crew 영속성 객체를 `saveAndFlush()` 하여 Dirty Checking 을 하고, 변경내용을 DB 에 반영하는 것을 볼 수 있다.

과연 성공적으로 반영될까? 결론부터 말하자면 14 번라인에서 `EntityNotFoundException` 이 터지게 된다.

```java {14, 21}
// TODO AWS 가 껴있으니 트랜잭션 분리 필요.
@Transactional  
public void updateCrew(Long memberId, String crewName, CrewUpdateDto dto, byte[] image, String imageName) {  
    Crew crew = crewRepository.getCrewByNameWithImage(new Name(crewName));  
    validateCrewPublisher(memberId, crew, dto.name());  
    updateCrewInfo(dto, crew);  
    s3BucketUploader.updateImage(crew.getImage().getImageUrl(), image, imageName);  
}  
  
private void updateCrewInfo(CrewUpdateDto dto, Crew crew) {  
    crew.updateCrew(dto.name(), dto.introduce(), dto.detail(), dto.kakaoLink());  
    updateCrewHashtags(dto, crew);  
    crewRepository.saveAndFlush(crew);  
}  
  
private void updateCrewHashtags(CrewUpdateDto dto, Crew crew) {  
    List<HashtagType> hashtagTypes = HashtagTypeUtil.extractPossible(HashtagType.fromTexts(dto.hashTags()));  
    List<Long> hashtagIds = crew.getHashtags().stream().map(CrewHashtag::getId).toList();  
    List<Hashtag> hashtags = Hashtag.fromHashtagTypes(hashtagTypes);  
    crewHashtagRepository.deleteAllByIdIn(hashtagIds);  
    crewHashtagRepository.batchInsertCrewHashtags(crew.getId(), hashtags);  
}
```


`saveAndFlush()` 는 내부적으로 save() 를 호출하게 되는데, save() 에서는 매개변수로 들어온 영속성 객체의 `@Id` 값에 따라 준영속 상태인지, 비영속 상태인지 판단하게 된다. Id 값이 Wrapper 타입이고 값이 null 이 아니면 `준영속 상태`로 판단되어 merge() 가 호출되게 된다.

![](Spring/DataJPA/images/Pasted%20image%2020240913011129.png)


merge() 가 호출되면, JPA 는 준영속 상태의 객체를 영속 상태로 만들고자 시도한다. 이를 위해 `영속성 컨텍스트(1차 캐시)` 에 해당 엔티티가 있는지 먼저 확인하고, 없다면 DB 에서 엔티티를 조회하여 `영속성 컨텍스트(1차 캐시)` 에 저장하게 된다. 

하지만 우리는 아까 아래의 `deleteAllById()` 를 호출했고, `clearAutomatically=true` 로 인해 1차캐시가 모두 비워졌다. 때문에 JPA 는 Crew 를 DB 에서 조회해오게 되는데 여기서 문제가 발생하게 된다.

```java
public interface CrewHashtagJpaRepository extends JpaRepository<CrewHashtag, Long> {  
  
    @Modifying(clearAutomatically = true, flushAutomatically = true)  
    @Query("delete CrewHashtag as ch where ch.id in :ids")  
    void deleteAllById(List<Long> ids);  
  
}
```


(예시) 정상적인 흐름이라면 아래처럼 select 쿼리를 통해 member 를 조회해오고, update 쿼리가 나가는게 정상적이다.

```java
@Test  
public void test4() {  
    Member member = new Member("name_1");  
    Member savedMember = memberRepository.save(member);  
    savedMember.changeName("new_name");  
  
    entityManager.clear();  // 1차캐시 비움
    // 준영속 상태를 다시 영속화 시도 --> 1차캐시 조회 --> 앞에서 이미 1차캐시를 비웠기 때문에 member 를 select 해온 후, update 쿼리가 나감.
    memberRepository.saveAndFlush(savedMember);  
}
```

```text
Hibernate: insert into member (name,id) values (?,default)
Hibernate: select m1_0.id,m1_0.name from member m1_0 where m1_0.id=? // 조회
Hibernate: update member set name=? where id=?
```

