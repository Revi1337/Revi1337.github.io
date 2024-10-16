---
title: evidence
---

## 프로그래머가 되려는 이유와 지원 동기
### 프로그래머가 되려는 이유
#### 고등학교 1학년때 만든 매크로
고등학교 1학년 오토핫키로 만들었던 자동사냥 매크로입니다. 무려 10 년전 일이어서 이렇게 밖에 남아있지 않은점 죄송합니다. 제가 했음을 증명하기 위해 글에 `고등학교 1학년 오토핫키로 만들었던 자동사냥 매크로입니다. 무려 10 년전 일이어서 이렇게밖에 남아있지 않은점 죄송합니다.` 를 작성해놨습니다.

https://blog.naver.com/kdhtod123/110186197321

#### 진수변환 CLI 도구
Shell Script 로 만든 진수변환 CLI 도구입니다. 2, 8, 10, 16 진수간의 자유로운 변환이 가능합니다. 이를 통해 Bash 에서 파이프라이닝을 유용하게 사용하는 방법을 알게되었습니다.

https://github.com/Revi1337/Scon

#### 보안문제들에 관한 흔적
"과연 내가 진정으로 보안에 대해 깊이 생각해본 적이 있었는가" 를 생각하며 회고해봤던 보안관련 글들입니다. Defense 에 관한 내용은 하나도 들어가있지 않고, Offensive 관점의 글들만 써왔습니다.

https://revi1337.tistory.com/239


https://revi1337.tistory.com/238


https://revi1337.tistory.com/233

### 지원 동기
#### 인프런에서 혼자 공부
약 1년 정도의 시간을 꾸준히 인프런에 투자하였습니다.

![](woowa/images/Pasted%20image%2020241011045813.png)


그 덕에 제가 작년에 목표했던 로드맵도 거의 끝나갑니다.

![](woowa/images/Pasted%20image%2020241011050034.png)

#### 이전 기수의 프로젝트를 북마크
우아한 테크코스를 알게되고 난 후부터, 전 기수의 크루들이 진행한 프로젝트 일부(2023-team-by-team, 2023-pium, 2023-yozm-cafe) 를 개인 북마크에 저장해두고 지속적으로 코드를 분석하고 있습니다. 여기서 제가 모르는 키워드가 나오면 해당 키워드를 검색함으로서 부족한 지식을 확장해나가고 있습니다.

![](woowa/images/Pasted%20image%2020241011051134.png)

## 오랜 시간 몰입했던 경험 그리고 도전
### 무언가를 남기고하자 하는 꾸준한 도전과 노력
#### 정보처리 산업기사
군입대 전 2019 1월 ~ 4월까지 공부한 정보처리 산업기사입니다.

![](woowa/images/Pasted%20image%2020241011043304.png)

#### 리눅스마스터
마찬가지로 군입대 전 2019 1월 ~ 4월까지 정보처리 산업기사와 함께 병행한 리눅스마스터입니다.

![](woowa/images/Pasted%20image%2020241010175225.png)

![](woowa/images/Pasted%20image%2020241010175345.png)

![](woowa/images/Pasted%20image%2020241010175510.png)

#### 정보보안 산업기사
군에 있던 2019 ~ 2020-12-26 기간에 공부헀던 정보보안 산업기사에 대한 사진입니다. 전역후 바로 다음해인 21년 1회차에 바로 취득하였습니다.

![](woowa/images/Pasted%20image%2020241010180041.png)


시험을 볼 수 있는 2번의 기회가 있었음에도 불구하고, 군에서는 2번 모두 내보내주지 않습니다. 보지못한 2번의 횟수 모두 결제하여 응시원서를 넣었는데, 해당 정보는 2년이 지나 사라져버렸습니다.

![](woowa/images/Pasted%20image%2020241010180026.png)

![](woowa/images/Pasted%20image%2020241010180156.png)

#### SQLD
가장 최근에 취득하게 된 SQLD 입니다. 덕분에 DBMS 마다 사소한 차이, 조인의 종류, 윈도우 함수 등을 배울 수 있는 매우 좋은 기회였습니다.

![](woowa/images/Pasted%20image%2020241010180636.png)


#### UNION ALL 과 DENSE_RANK
아래코드는 Crew 원들의 댓글 수, 게시글 작성수를 포함하여 사용자별 랭킹을 부여하는 쿼리입니다. UNIONALL 과 DENSE_RANK 함수 아니였으면, SQLD 를 취득하지 않았더라면, DENSE_RANK 의 존재여부로 몰랐을 것입니다.

```java
@RequiredArgsConstructor  
@Repository  
public class CrewMemberJdbcRepository {  
  
    private final NamedParameterJdbcTemplate namedJdbcTemplate;  
  
    /**  
     * For more information, visit <a href="https://www.h2database.com/html/functions-window.html">this link</a>.     * @param from  
     * @param to  
     * @param nSize  
     */  
    public List<Top5CrewMemberDomainDto> findAllTopNCrewMembers(LocalDate from, LocalDate to, Integer nSize) {  
        String sql = """  
                \n                SELECT                    crew_id, mem_id, mem_nickname, mem_mbti, mem_join_time, counter, ranks  
                FROM (  
                    SELECT                        crew_id, mem_id, mem_nickname, mem_mbti, mem_join_time, counter,  
                        DENSE_RANK() OVER(PARTITION BY crew_id ORDER BY counter, mem_join_time) AS ranks  
                    FROM (  
                        SELECT DISTINCT                                crew_id, mem_id, mem_nickname, mem_mbti, mem_join_time, counter  
                        FROM (  
                            SELECT                                crew_id, mem_id, mem_nickname, mem_mbti, mem_join_time,  
                                COUNT(*) OVER (PARTITION BY crew_id, mem_id) AS counter  
                            FROM (  
                                SELECT                                    crew_member.crew_id AS crew_id,  
                                    member.id AS mem_id,  
                                    member.nickname AS mem_nickname,  
                                    member.mbti AS mem_mbti,  
                                    crew_member.participate_at AS mem_join_time  
                                FROM squad_comment  
                                INNER JOIN crew_member ON squad_comment.crew_member_id = crew_member.id AND squad_comment.created_at BETWEEN :from AND :to                                INNER JOIN member ON crew_member.member_id = member.id  
                                                            UNION ALL  
                                SELECT                                    crew_member.crew_id,  
                                    member.id,  
                                    member.nickname,  
                                    member.mbti,  
                                    crew_member.participate_at  
                                FROM squad  
                                INNER JOIN crew_member ON squad.crew_member_id = crew_member.id  
                                INNER JOIN member ON crew_member.member_id = member.id  
                            ) AS union_table  
                        ) AS count_table  
                    ) AS distinct_table  
                ) AS rank_table  
                WHERE ranks <= :nSize                ORDER BY crew_id, ranks  
        """;  
  
        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()  
                .addValue("from", Date.valueOf(from))  
                .addValue("to", Date.valueOf(to))  
                .addValue("nSize", nSize);  
  
        return namedJdbcTemplate.query(sql, sqlParameterSource, crewTop5RowMapper());  
    }  
  
    private RowMapper<Top5CrewMemberDomainDto> top5RowMapper() {  
        return (rs, rowNum) -> new Top5CrewMemberDomainDto(  
                rs.getLong("crew_id"),  
                rs.getInt("ranks"),  
                rs.getInt("counter"),  
                rs.getLong("mem_id"),  
                rs.getString("mem_nickname"),  
                rs.getString("mem_mbti"),  
                rs.getObject("mem_join_time", LocalDateTime.class)  
        );  
    }  
  
    private RowMapper<Top5CrewMemberDomainDto> crewTop5RowMapper() {  
        return (rs, rowNum) -> new Top5CrewMemberDomainDto(  
                rs.getLong("crew_id"),  
                rs.getInt("ranks"),  
                rs.getInt("counter"),  
                rs.getLong("mem_id"),  
                rs.getString("mem_nickname"),  
                rs.getString("mem_mbti"),  
                rs.getObject("mem_join_time", LocalDateTime.class)  
        );  
    }  
}
```


## 프리코스 목표 설정
### 글쓰기 능력 향상
다익스트라 알고리즘의 과정을 시각화하여 메타인지와 장기 기억의 효과를 가져갔습니다.

[다익스트라에 대하여 (링크)](https://revi1337.com/Algorithm/Dijkstra)


전 Excalidraw 를 사용하여 동작 과정을 최대한 시각화시킴으로서, 작성한 내용에 대한 장기적인 기억을 가져가려 최대한 노력하고 있습니다.

[디버깅을 통한 DelegatingFilterProxy 와 FilterChainProxy 의 동작 원리와 분석 (링크)](https://revi1337.tistory.com/253)

