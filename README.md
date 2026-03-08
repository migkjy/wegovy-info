# 다이어트약 가이드 (wegovy-info)

GLP-1 비만치료제(위고비, 삭센다, 마운자로)에 대한 객관적인 정보를 제공하는 한국어 콘텐츠 사이트입니다. 임상 연구 결과와 공식 정보를 기반으로 효능, 부작용, 가격, 처방 정보를 전달합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4, @tailwindcss/typography |
| 콘텐츠 | MDX (gray-matter + next-mdx-remote) |
| 테스트 | Vitest, React Testing Library, jsdom |
| 린트 | ESLint (eslint-config-next) |
| 배포 | Vercel (Git push 자동 배포) |
| Node.js | v20 (.nvmrc) |

## 로컬 개발 방법

```bash
git clone https://github.com/migkjy/wegovy-info.git
cd wegovy-info

# Node.js 버전 설정 (nvm 사용 시)
nvm use

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 값을 설정하세요

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 환경변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 선택 | 사이트 URL. 미설정 시 `https://wegovy-info.vercel.app` 사용 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 선택 | Google Analytics 4 측정 ID. production 환경에서만 활성화 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 선택 | Google Search Console 인증 코드 |

`.env.example` 파일을 `.env.local`로 복사하여 사용하세요.

## 프로젝트 구조

```
wegovy-info/
├── content/
│   └── posts/              ← MDX/MD 블로그 포스트
├── docs/
│   └── plans/              ← 프로젝트 계획 문서
├── public/                 ← 정적 파일 (이미지, SVG)
├── src/
│   ├── __tests__/          ← 단위 테스트
│   ├── app/
│   │   ├── layout.tsx      ← 루트 레이아웃 (Pretendard 폰트, JSON-LD)
│   │   ├── page.tsx        ← 메인 페이지 (히어로 + 카테고리 + 최신 글)
│   │   ├── [slug]/         ← 블로그 포스트 상세
│   │   ├── category/       ← 카테고리별 포스트 목록
│   │   ├── sitemap.ts      ← 동적 sitemap 생성
│   │   └── robots.ts       ← robots.txt 생성
│   ├── components/
│   │   ├── Header.tsx      ← 사이트 헤더
│   │   ├── Footer.tsx      ← 사이트 푸터 (면책조항 포함)
│   │   ├── PostCard.tsx    ← 포스트 카드 컴포넌트
│   │   └── CategoryNav.tsx ← 카테고리 내비게이션
│   └── lib/
│       ├── constants.ts    ← 사이트 상수 (카테고리, URL, 면책조항)
│       └── posts.ts        ← MDX 파싱 유틸리티
├── .github/
│   └── workflows/ci.yml   ← GitHub Actions CI
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── next.config.ts
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |
| `npm test` | Vitest 단위 테스트 실행 |
| `npm run test:watch` | Vitest 워치 모드 |

## 테스트

Vitest + React Testing Library 기반 테스트를 사용합니다.

```bash
# 전체 테스트 실행
npm test

# 워치 모드
npm run test:watch
```

테스트 파일은 `src/__tests__/` 디렉토리에 위치합니다.

## 배포

Vercel에 연결된 GitHub 리포지토리로 자동 배포됩니다.

- `main` 브랜치 push 시 Preview 배포
- `production` 브랜치 push 시 Production 배포

수동 CLI 배포는 사용하지 않습니다.

## 콘텐츠 작성

블로그 포스트는 `content/posts/` 디렉토리에 MDX 또는 Markdown 파일로 작성합니다.

### Frontmatter 형식

```yaml
---
title: "포스트 제목"
description: "SEO 설명 (150자 이내)"
date: "YYYY-MM-DD"
category: "wegovy"
tags: ["태그1", "태그2"]
author: "편집팀"
image: "/images/post-image.jpg"  # 선택
---
```

### 카테고리

| Slug | 이름 |
|------|------|
| `wegovy` | 위고비 |
| `saxenda` | 삭센다 |
| `mounjaro` | 마운자로 |
| `comparison` | 비교분석 |
| `side-effects` | 부작용 |
| `price` | 가격정보 |

## 라이선스

Private 프로젝트입니다.
