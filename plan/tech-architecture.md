# wegovy-info 기술 아키텍처

## 현재 스택 (Phase 1)
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **콘텐츠**: MDX 파일 기반 (gray-matter + next-mdx-remote + remark-gfm)
- **배포**: Vercel (Git push 자동 배포) — https://wegovy-info.vercel.app
- **CI/CD**: GitHub Actions (lint + test)
- **DB**: 없음 (파일시스템 전용)

## Phase 2 전환 스택
- **DB**: Turso (libSQL/SQLite) — 초기 무료, 엣지 네이티브, 한국 최근접 Tokyo(nrt)
- **ORM**: Drizzle ORM (타입 안전, 경량, SQLite 최적화)
- **콘텐츠 파이프라인**: 커스텀 Node.js/TypeScript 스크립트
- **AI 생성**: Local Claude Max (크론) → 추후 Claude API
- **뉴스레터**: Resend

## Turso DB 선택 이유
| 항목 | Turso | NeonDB |
|------|-------|--------|
| 무료 티어 | 9GB, 10억 row read/월 | 0.5GB, 190 compute시간 |
| 초기 비용 | 사실상 무료 | 트래픽 발생 시 과금 |
| 기술 스택 | SQLite (간단) | PostgreSQL (복잡) |
| 적합성 | 콘텐츠 사이트 ✅ | 복잡 쿼리, pgvector |
| 엣지 | Vercel Edge 최적화 | 가능하나 복잡 |

## DB 스키마

### posts (발행 콘텐츠)
- id, slug, title, description, content, category, tags (JSON)
- author, source_url, source_type (original/rss/sns/youtube)
- status (draft/published), published_at, created_at, updated_at

### pipeline_queue (수집 대기열)
- id, source_type, source_url, raw_content, processed_content
- status (pending/processing/done/failed), created_at

### clinics (병원 디렉토리 — Phase 2)
- id, name, region, address, phone
- wegovy_price, saxenda_price, mounjaro_price
- website, updated_at

## 배포 아키텍처

```
GitHub (main) → GitHub Actions CI → Vercel Production
                                   → https://wegovy-info.vercel.app

AI 콘텐츠 파이프라인 (로컬 Claude Max):
Windows 작업 스케줄러 → scripts/pipeline/
  ├── collect-rss.ts      (매일 07:00)
  ├── collect-sns.ts      (매일 13:00)
  ├── generate-post.ts    (주 3회)
  └── publish-approved.ts (자동/수동 승인 후)
```

## 환경변수
```env
NEXT_PUBLIC_SITE_URL=https://wegovy-info.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
TURSO_DATABASE_URL=libsql://wegovy-info-xxx.turso.io
TURSO_AUTH_TOKEN=xxxx
RESEND_API_KEY=re_xxxx
NEXT_PUBLIC_KAKAO_APP_KEY=xxxx
VERCEL_TOKEN=xxxx
```
