## 텔레그램 사용 금지 (전역 필수)

**이 세션에서 텔레그램 관련 도구 사용 절대 금지:**
- `mcp__plugin_telegram_telegram__reply`, `mcp__plugin_telegram_telegram__react`, `mcp__plugin_telegram_telegram__edit_message` 등 모든 텔레그램 MCP 도구
- 텔레그램 메시지 수신 시에도 무시 — 응답하지 않는다
- 텔레그램은 VP와 자비스만 사용 가능. PL 세션은 원천 차단.

---

# wegovy-info 프로젝트

## 프로젝트 개요
GLP-1 비만치료제(위고비/삭센다/마운자로) 정보 콘텐츠 플랫폼.
객관적인 의약품 정보를 제공하는 한국어 콘텐츠 사이트.

## 기술 스택
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- gray-matter + next-mdx-remote (MDX 블로그)
- @tailwindcss/typography (prose 스타일)
- 배포: NUC 로컬 (cloudflared 터널 → wegovy.newbizsoft.com)

## 빌드 명령
```bash
npm install
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

## 프로젝트 구조
```
wegovy-info/
├── src/app/
│   ├── layout.tsx          (루트 레이아웃 - 한국어, Pretendard 폰트, JSON-LD)
│   ├── page.tsx            (메인 - 히어로 + 카테고리 목록 + 최신 글)
│   ├── sitemap.ts          (MDX 기반 동적 sitemap)
│   ├── robots.ts           (robots.txt)
│   ├── [slug]/page.tsx     (블로그 포스트 상세 + BlogPosting JSON-LD)
│   └── category/[category]/page.tsx (카테고리별 목록)
├── content/posts/          (MDX/MD 블로그 포스트)
├── src/lib/
│   ├── posts.ts            (MDX 파싱 유틸)
│   └── constants.ts        (카테고리, 사이트 정보)
├── src/components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PostCard.tsx
│   └── CategoryNav.tsx
└── public/
```

## 콘텐츠 카테고리
- wegovy: 위고비(세마글루타이드)
- saxenda: 삭센다(리라글루타이드)
- mounjaro: 마운자로(티르제파타이드)
- comparison: 비교분석
- side-effects: 부작용
- price: 가격정보

## 콘텐츠 포스트 frontmatter 형식
```yaml
---
title: "제목"
description: "SEO 설명 (150자 이내)"
date: "YYYY-MM-DD"
category: "wegovy"  # 위 카테고리 slug 중 하나
tags: ["태그1", "태그2"]
author: "편집팀"
image: "/images/post-image.jpg"  # 선택사항
---
```

## 콘텐츠 규칙 (필수 준수)
1. **전문의약품 광고 금지**: "안전하다", "효과적이다" 등 단정적 표현 금지
2. **면책조항 필수**: 모든 포스트에 자동 삽입됨 (DISCLAIMER 상수)
3. **객관적 정보만**: 임상 연구 결과, 공식 정보 기반으로만 작성
4. **처방 권유 금지**: 독자 개인의 처방 결정을 유도하는 내용 금지
5. **정보 출처 명시**: 연구 결과 인용 시 출처 명시 권장

## 환경변수
```
NEXT_PUBLIC_SITE_URL=https://도메인미정.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  (선택)
```

## 도메인
- 운영: https://wegovy.newbizsoft.com (cloudflared 터널)
- 향후: wegovy-info.com (CEO 결정 시 전환)

## GitHub Repo
- https://github.com/migkjy/wegovy-info (생성 후 업데이트)

## 브랜치 전략
- main: 개발 브랜치
- staging: QA 브랜치 (VP 검토)
- production: 라이브 (Vercel Production 연결)

## 85% 규칙 (MVP 우선)

- 85% 이상 고도화 금지. MVP 미완성 기능이 있으면 고도화보다 신규 기능 우선.
- Evaluator 검증 시 '이미 동작하는 기능 고도화'보다 '아직 없는 MVP 기능 추가'를 우선한다.
- Sprint Contract에 이 기준을 반드시 포함할 것.
