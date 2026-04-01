# wegovy-info Architecture

## Overview
정적 MDX 기반 콘텐츠 사이트. DB 없이 파일시스템 콘텐츠만 사용.

## Directory Structure
```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (Pretendard 폰트, JSON-LD Organization)
│   ├── page.tsx            # 메인 (히어로 + 카테고리 + 최신 글)
│   ├── [slug]/page.tsx     # 블로그 포스트 상세 (BlogPosting JSON-LD)
│   ├── category/[category]/page.tsx  # 카테고리별 목록
│   ├── sitemap.ts          # MDX 기반 동적 sitemap
│   ├── robots.ts           # robots.txt
│   ├── error.tsx            # 에러 페이지
│   ├── not-found.tsx        # 404 페이지
│   └── loading.tsx          # 로딩 UI
├── components/
│   ├── Header.tsx           # 모바일 반응형 헤더
│   ├── Footer.tsx           # 면책조항 포함 푸터
│   ├── PostCard.tsx         # 포스트 카드
│   └── CategoryNav.tsx      # 카테고리 내비게이션
└── lib/
    ├── posts.ts             # MDX 파싱 유틸 (getAllPosts, getPostBySlug)
    └── constants.ts         # 사이트 상수 (CATEGORIES, SITE_URL, DISCLAIMER)
```

## Content Pipeline
1. `content/posts/` 에 MDX/MD 파일 작성
2. frontmatter: title, description, date, category, tags, author, image(선택)
3. `src/lib/posts.ts` 가 gray-matter로 파싱
4. `next-mdx-remote`로 렌더링 + @tailwindcss/typography prose 스타일

## Categories
| Slug | Name | 주요 약물 |
|------|------|-----------|
| wegovy | 위고비 | 세마글루타이드 |
| saxenda | 삭센다 | 리라글루타이드 |
| mounjaro | 마운자로 | 티르제파타이드 |
| comparison | 비교분석 | - |
| side-effects | 부작용 | - |
| price | 가격정보 | - |

## SEO
- JSON-LD: Organization (layout), BlogPosting (post detail)
- 동적 sitemap.ts / robots.ts
- Google Analytics 4 (production만)
- Google Search Console 인증

## Deployment
- main → staging → production (Vercel Git 연동)
- GitHub Actions CI: lint + test on push/PR

## Phase 2 추가 구조
```
src/
├── app/
│   ├── clinics/page.tsx         # 병원 목록 (SSG)
│   ├── clinics/[id]/page.tsx    # 병원 상세 (SSG, MedicalClinic JSON-LD)
│   ├── insurance/page.tsx        # 보험 비교 (SSG, FAQ JSON-LD)
│   ├── community/page.tsx        # 커뮤니티 게시판 (Client Component)
│   └── api/
│       ├── subscribe/route.ts    # 뉴스레터 구독 API (POST)
│       └── community/route.ts    # 커뮤니티 게시물 API (GET/POST)
├── components/
│   └── NewsletterSignup.tsx     # 뉴스레터 구독 컴포넌트
├── data/
│   ├── clinics.ts               # 병원 정적 데이터 (20개)
│   └── insurance.ts             # 보험 정적 데이터
└── lib/
    ├── community-validation.ts  # 게시물 유효성 검사
    └── db/
        ├── index.ts             # Turso HTTP API 클라이언트
        └── schema.ts            # Drizzle 스키마 (posts, pipeline_queue, clinics, subscribers, snsCuration, communityPosts)

scripts/
├── pipeline.mjs                 # AI 뉴스 파이프라인 (zero-dep, 3개/일)
├── sns-pipeline.mjs             # SNS 큐레이션 파이프라인 (수동 승인)
├── pipeline-utils.mjs           # 파이프라인 유틸리티 함수
└── run-pipeline.sh              # 로컬 파이프라인 실행 스크립트
```
