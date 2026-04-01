# wegovy-info 콘텐츠 전략

## 콘텐츠 철학
- AI 자동화로 **양** 확보 → 편집 검토로 **질** 유지
- 임상 데이터 기반 **신뢰성** + 실사용자 경험 **공감성** 결합
- 전문의약품 광고 금지 원칙 준수 (면책조항 필수)
- Local Claude Max로 생성 (초기) → 트래픽 성장 후 Claude API 전환

## 콘텐츠 유형

### 1. 뉴스 큐레이션 (매일 3~5건)
**소스**: PubMed RSS, Google News RSS, Korea Biomed, Reuters Health, STAT News
**흐름**: RSS 수집 → Claude Max 한국어 요약 → 검토 → 발행
**포맷**: 300~500자 단신 + 원본 링크

### 2. 롱폼 포스트 (주 3회)
**소스**: 임상 논문 + 가이드라인 + 기존 포스트 업데이트
**흐름**: 키워드 선정 → Claude Max 초안 → 팩트체크 → 발행
**분량**: 800~1,500자 + 표/이미지

### 3. SNS 후기 큐레이션 (매일)
**소스**: 인스타그램 #위고비 #삭센다 #마운자로, YouTube 댓글, Reddit r/Ozempic
**흐름**: 수집 → 편집(출처 표기) → "실사용자 경험" 카테고리 발행
**목적**: 커뮤니티 마중물 — 콘텐츠가 쌓이면 유저 직접 작성으로 전환

### 4. 가격/병원 업데이트 (주 1회)
**소스**: 직접 조사 + 병원 파트너
**분량**: 지역별 가격 비교 DB 업데이트

## AI 파이프라인 아키텍처

```
[수집층]
RSS Feeds → scripts/pipeline/collect-rss.ts
YouTube API → scripts/pipeline/collect-youtube.ts
SNS Scraper → scripts/pipeline/collect-sns.ts

[생성층]
Local Claude Max → scripts/pipeline/generate-post.ts
크론: 매일 07:00 (뉴스), 매일 13:00 (SNS), 주 3회 (롱폼)

[저장층]
Turso DB pipeline_queue → 검토 대기
승인 후 → posts 테이블 → 발행
```

## 콘텐츠 카테고리 전략

| 카테고리 | 현재 포스트 | Phase 1 목표 | 핵심 키워드 |
|---------|------------|-------------|-----------|
| wegovy | 8개 | 30개 | 위고비 가격, 위고비 효과 |
| saxenda | 7개 | 25개 | 삭센다 가격, 삭센다 부작용 |
| mounjaro | 8개 | 25개 | 마운자로 출시, 마운자로 가격 |
| comparison | 4개 | 20개 | 위고비 vs 마운자로 |
| side-effects | 3개 | 20개 | GLP-1 부작용 |
| price | 3개 | 15개 | 비만치료제 가격 |
| news | 0개 | 100개+ | (뉴스 큐레이션) |

## 콘텐츠 규칙 (필수)
1. "안전하다", "효과적이다" 단정적 표현 금지
2. 임상 연구 인용 시 출처 명시 (NEJM, Lancet, JAMA 등)
3. 모든 포스트에 면책조항 자동 삽입
4. 처방 권유 금지
5. SNS 큐레이션 시 원본 출처 표기 필수
6. 저작권법 준수 (요약/인용만, 전문 복사 금지)
