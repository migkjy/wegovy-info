# wegovy-info PL Session Rules

## Project Identity
- GLP-1 비만치료제(위고비/삭센다/마운자로) 정보 콘텐츠 플랫폼
- GitHub: migkjy/wegovy-info | Branch: main → staging → production

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- MDX 콘텐츠: gray-matter + next-mdx-remote, @tailwindcss/typography
- 테스트: Vitest + React Testing Library + jsdom
- 배포: Vercel (Git push 자동, CLI 배포 금지)
- Node.js v20 (nvm use)

## Commands
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm test             # Vitest 실행
npm run test:watch   # Vitest 워치 모드
```

## Content Rules (필수)
1. 전문의약품 광고 금지 — "안전하다", "효과적이다" 단정적 표현 금지
2. 면책조항 자동 삽입 (DISCLAIMER 상수)
3. 객관적 정보만 — 임상 연구/공식 정보 기반
4. 처방 권유 금지
5. 포스트: content/posts/ 에 MDX/MD 작성

## Development Rules
- TDD 강제: 테스트 먼저 → 구현 → 통과
- ralph-loop 스킬 사용 필수
- plan 없이 코딩 착수 금지, VP 승인 후 실행
- production 브랜치 머지 필수 (main → staging → production)

## Session Protocol
- 자비스 회신: `scripts/project-reply.sh "메시지" "wegovy-info"`
- 과업 완료 보고에 프로젝트명 접두사 필수: `[wegovy-info] ...`

## Knowledge
- `.claude/knowledge/` 참조 — architecture, constraints, history, learnings
- api-keys.md는 gitignore 대상 (로컬 전용)

## Constraints
- DB 없음 — 정적 MDX 콘텐츠 전용
- 도메인 미정 (NEXT_PUBLIC_SITE_URL 환경변수)
- Vercel 프로젝트 설정은 CEO 승인 후
