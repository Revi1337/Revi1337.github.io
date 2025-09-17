---
title: CloudWatch Metric Policy 연결
tags: ['aws', 'iam', 'cloudwatch']
---


## IAM 정책 생성
`AWS Console > IAM > 액세스 관리 > 정책 > 정책 생성`을 선택합니다.

![](AWS/images/Pasted%20image%2020250917184050.png)


CloudWatch Metrcis에 접근할 수 있는 JSON 정책을 기입 후, `다음`을 선택합니다.

![](AWS/images/Pasted%20image%2020250917184145.png)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadingMetricsFromCloudWatch",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DescribeAlarmsForMetric",
        "cloudwatch:DescribeAlarmHistory",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetInsightRuleReport"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowReadingTagsInstancesRegionsFromEC2",
      "Effect": "Allow",
      "Action": ["ec2:DescribeTags", "ec2:DescribeInstances", "ec2:DescribeRegions"],
      "Resource": "*"
    },
    {
      "Sid": "AllowReadingResourcesForTags",
      "Effect": "Allow",
      "Action": "tag:GetResources",
      "Resource": "*"
    },
    {
      "Sid": "AllowReadingResourceMetricsFromPerformanceInsights",
      "Effect": "Allow",
      "Action": "pi:GetResourceMetrics",
      "Resource": "*"
    }
  ]
}
```


정책 이름을 기입하고, `이 정책에 정의된 권한`을 확인 후, `정책 생성`을 완료합니다.

![](AWS/images/Pasted%20image%2020250917184909.png)


## IAM 사용자 생성 및 정책 연결
`AWS Console > IAM > 액세스 관리 > 사용자 > 사용자 생성`을 선택합니다.

![](AWS/images/Pasted%20image%2020250917185351.png)


IAM 사용자 이름을 마음대로 기입합니다.

![](AWS/images/Pasted%20image%2020250917185408.png)


`직접 정책 연결`을 선택 후, 앞서 만든 IAM 정책을 선택하고 다음을 선택합니다.

![](AWS/images/Pasted%20image%2020250917185451.png)


생성되는 IAM 사용자의 이름, 연결된 정책이 올바른지 확인하고 `사용자 생성`을 완료합니다.

![](AWS/images/Pasted%20image%2020250917185517.png)


## Access & Secret Key 발급
`AWS Console > IAM > 액세스 관리 > 사용자 > 방금 만든 사용자 선택 > 보안 자격증명`에서 액세스 키 만들기를 선택합니다.

![](AWS/images/Pasted%20image%2020250917185949.png)


`서드 파티 서비스`를 선택합니다. 또한, "위의 권장 사항을 이해했으며 액세스 키 생성을 계속하려고 합니다"에 동의하고 `다음`을 선택합니다.

![](AWS/images/Pasted%20image%2020250917190018.png)


태그는 설정하지 않고 `액세스 키`생성을 완료합니다.

![](AWS/images/Pasted%20image%2020250917190137.png)


발급된 `액세스 키 & 비밀 액세스 키`는 보관 잘하셔야 합니다. 비밀 액세스 키는 잃어버리면 다시 발급받아야해서 귀찮아집니다.

![](AWS/images/Pasted%20image%2020250917190501.png)


## Reference
[Amazon CloudWatch data source](https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/#configure-the-data-source)

[AWS IAM과 접근 권한 & Amazon CloudWatch](https://velog.io/@hama13/AWS-AWS-IAM%EA%B3%BC-%EC%A0%91%EA%B7%BC-%EA%B6%8C%ED%95%9C-Amazon-CloudWatch)
