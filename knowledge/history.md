# wegovy-info History

## 2026-03-14 — Project Init
- Next.js 16 + MDX 콘텐츠 플랫폼 초기화 (커밋 6948997)
- 모바일 메뉴 + 에러/404/로딩 페이지 (커밋 8aa9c6e)
- GA4 + Search Console 통합 (커밋 c4b4f15)
- Vitest 테스트 + GitHub Actions CI (커밋 3f2028c)
- README.md + .env.example 정비 (커밋 f16b42a)
- .claude/ 독립 세션 설정 추가

## 2026-04-01 — 콘텐츠 갭 메우기
- saxenda-price-korea-2026.mdx: 삭센다 가격 포스트 추가 (price 카테고리 3종 완성)
- mounjaro-side-effects.mdx: 마운자로 부작용 포스트 추가 (side-effects 카테고리 3종 완성)
- wegovy-vs-mounjaro-2026.mdx: SURMOUNT-5 포함 위고비 vs 마운자로 비교
- saxenda-vs-wegovy-2026.mdx: 삭센다→위고비 전환 포함 비교 (comparison 카테고리 3종 완성)

## 2026-04-01 — MVP 기능 3건 추가 (CCPM Sprint 1-3)
- PR #2: RSS 2.0 피드 + 태그 페이지 + 태그 링크
- PR #3: 동적 OG 이미지 (Noto Sans KR 폰트, 포스트별 + 사이트 기본)
- PR #4: 클라이언트 사이드 검색 (/search?q=, Header 검색 링크)

## 2026-04-01 — 콘텐츠 확충 + SEO 강화 (CCPM Sprint 4-5)
- PR #5: 콘텐츠 6개 추가 (dosing schedule 3종, before-starting 2종, 보험적용)
- PR #6: About 페이지 + FAQ JSON-LD 스키마 + TOC 컴포넌트

## Current State
- 20개 MDX/MD 포스트 (6개 카테고리 균형 커버)
- RSS 피드, 태그 페이지, OG 이미지, 검색, About, FAQ 스키마, TOC 완비
- CI 파이프라인 가동 (lint + test, 최근 통과)
- 도메인 미정, Vercel 프로젝트 미설정 (CEO 승인 대기)
- 미론칭 상태 (main 브랜치)

## 2026-04-02 — 콘텐츠 배치 확충 (CCPM Sprint 6-7)
- Sprint 6: 16개 MDX 포스트 배치 생성 (커밋 0406057) — posts 34→50
- Sprint 7: 10개 MDX 포스트 추가 — posts 50→60
- Pipeline 검증: 코드 정상, node_modules 설치 필요 (운영 블로커)
- run-pipeline.sh PATH 수정 (Claude CLI 경로 명시)

## Current State (Sprint 8 이후)
- 75개 MDX 포스트 (7개 카테고리: wegovy/saxenda/mounjaro/comparison/side-effects/price/news)
- AI 파이프라인 코드 완성, Turso DB 연결됨, node_modules 설치 대기 중
- CI 파이프라인 가동 (lint + test)
- 도메인 미정, Vercel 프로젝트 설정 중

## 2026-04-02 — Phase 1 완료: 100포스트 달성 (Sprint 9)
- 25개 포스트 추가 (75→100)
- Phase 1 KPI 달성: 100개 포스트
- 카테고리별 추가: wegovy 4, saxenda 3, mounjaro 3, comparison 3, side-effects 4, price 3, news 5

## Current State
- 100개 MDX 포스트 (7개 카테고리)
- AI 파이프라인 완성 (zero-dep, Turso HTTP API 기반)
- Phase 1 완료 → Phase 2 준비 시작

## 2026-04-02 — Phase 2 진행 (CCPM Sprint P2-1~P2-4)
- Clinic Directory: 20개 병원, /clinics 목록/상세 페이지, MedicalClinic JSON-LD
- Newsletter: /api/subscribe, NewsletterSignup 컴포넌트, Turso 저장
- Insurance: /insurance 보험비교 페이지, FAQ JSON-LD
- SNS Pipeline: scripts/sns-pipeline.mjs (Naver Blog RSS + Claude 요약)
- Pipeline: JSON 파싱 버그 수정, 실제 뉴스 3개 자동 생성 성공

## 2026-04-02 — Phase 2 MVP 완성 (CCPM Sprint P2-1~P2-5)
- P2-1: Clinic Directory (20개 병원, 8개 지역, MedicalClinic JSON-LD)
- P2-2: Newsletter (Turso 저장, 이메일 구독 API)
- P2-3: Insurance Comparison (/insurance, FAQ JSON-LD)
- P2-4: SNS Curation Pipeline (scripts/sns-pipeline.mjs, 수동 승인 게이트)
- P2-5: Community Board (/community, Turnstile, 키워드 필터)
- Pipeline: JSON 파싱 버그 수정, 실제 뉴스 3개 자동 생성 성공 (커밋 651b6b0)
- CI 수정: @libsql/client → Turso HTTP API, MDX < 이스케이프 버그

## Current State (2026-04-02)
- 103개+ MDX 포스트 (파이프라인 자동 생성 진행 중, 3개/일)
- Phase 1+2 MVP 완성
- 새 페이지: /clinics, /insurance, /community
- API: /api/subscribe, /api/community
- CI: 통과 (main 브랜치)
- 도메인 미정, Vercel 설정 CEO 승인 대기
- 다음 단계: Phase 2 KPI 달성 (50,000 UV), 실 클리닉 데이터 확보, 도메인 설정
