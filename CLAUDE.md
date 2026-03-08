# wegovy-info 프로젝트

## 프로젝트 개요
GLP-1 비만치료제(위고비/삭센다/마운자로) 정보 콘텐츠 플랫폼.
객관적인 의약품 정보를 제공하는 한국어 콘텐츠 사이트.

## 기술 스택
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- gray-matter + next-mdx-remote (MDX 블로그)
- @tailwindcss/typography (prose 스타일)
- 배포: Vercel (Git push 연동, CEO 승인 후 설정)

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
- 미정 — 환경변수 NEXT_PUBLIC_SITE_URL로 처리
- Vercel 프로젝트 설정은 CEO 승인 후 진행

## GitHub Repo
- https://github.com/migkjy/wegovy-info (생성 후 업데이트)

## 브랜치 전략
- main: 개발 브랜치
- staging: QA 브랜치 (VP 검토)
- production: 라이브 (Vercel Production 연결)
