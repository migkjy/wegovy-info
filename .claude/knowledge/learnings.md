# wegovy-info Learnings

## Setup
- Next.js 16 + React 19 사용 — 최신 App Router 기반
- MDX 렌더링: next-mdx-remote v6 (서버 컴포넌트 지원)
- Tailwind CSS v4 + @tailwindcss/typography — prose 클래스로 콘텐츠 스타일링
- vitest.config.ts: jsdom 환경, @/ alias 설정 완료

## Content
- 의약품 정보 사이트 특성상 법적 면책조항이 핵심
- DISCLAIMER 상수를 Footer에서 자동 삽입하는 패턴 사용
- 카테고리 6개 — 약물별(3) + 주제별(3) 구조

## SEO
- JSON-LD 구조화 데이터: Organization (전역) + BlogPosting (포스트별)
- sitemap.ts / robots.ts 동적 생성
- GA4는 production 환경에서만 활성화

## Deployment
- 브랜치 전략: main → staging → production
- GitHub Actions CI: push/PR 시 lint + test 자동 실행
