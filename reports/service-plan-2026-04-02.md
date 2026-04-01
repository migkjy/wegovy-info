# [wegovy-info] 서비스 정체성·방향성·로드맵 종합 계획

**작성일**: 2026-04-02
**작성자**: wegovy-info PL
**브랜치**: feature/service-plan-turso

---

## 서비스 정체성

wegovy-info는 **한국 최초 GLP-1 비만치료제 전문 정보 허브**다. 위고비(세마글루타이드), 삭센다(리라글루타이드), 마운자로(티르제파타이드) 등 GLP-1 계열 비만치료제에 관한 가장 신뢰할 수 있는 한국어 정보를 제공하는 뉴스매거진형 콘텐츠 플랫폼으로 포지셔닝한다.

미션은 명확하다: GLP-1 비만치료제를 고려하거나 투여 중인 한국인들이 올바른 정보를 바탕으로 의료 결정을 내릴 수 있도록 돕는 것. 전문 의약품 광고가 아닌 객관적 정보 허브로서, 임상 연구 + 실사용자 경험 + 최신 뉴스를 아우르는 원스톱 포탈을 목표로 한다.

**타겟**: 비만치료제 투여를 고려 중인 30~50대 성인. 특히 처방 전 가격·효과·부작용 정보를 검색하는 자부담 환자(시장의 85%)가 주요 대상이다.

**경쟁 우위**: 하이닥·코메디닷컴은 일반 의료 정보에 국한되고, 네이버 카페는 검증되지 않은 정보가 혼재한다. 해외 서비스는 영어·미국 시장 기준이다. wegovy-info는 GLP-1 전문 깊이 + 임상 기반 신뢰도 + 한국 가격/병원 정보를 결합한다.

---

## 3단계 로드맵

### Phase 1 (2026 Q2): 콘텐츠 기반 구축 → 월 20,000 UV
현재 Next.js 16 + MDX 플랫폼은 구축 완료. 29개 포스트, RSS 피드, 소셜 공유, 페이지네이션, 테이블 렌더링까지 완료. 남은 과제는 **AI 콘텐츠 파이프라인**, 뉴스매거진 레이아웃, 뉴스레터(Resend), Turso DB 연동이다.

### Phase 2 (2026 Q3): 병원·보험 연결 + 커뮤니티 → 월 50,000 UV
비만클리닉 디렉토리, 병원 CPA 파트너십, SNS 후기 큐레이션 자동화, 사용자 게시판(Turso DB)이 핵심. Mediavine 광고 수익 시작 예정.

### Phase 3 (2026 Q4~): 플랫폼화 → 월 100,000 UV + 월 1,000만원 수익
회원 시스템, 유료 뉴스레터(9,900원/월 목표 1,000명), 전문가 기고 시스템, Q&A 커뮤니티.

---

## 콘텐츠 전략

AI 자동화로 양을 확보하고 편집 검토로 질을 유지하는 구조다.

- **뉴스 큐레이션** (매일 3~5건): PubMed RSS, Google News → Claude Max 한국어 요약 → 발행
- **롱폼 포스트** (주 3회): 임상 논문 기반 800~1,500자 + 표/이미지
- **SNS 후기 큐레이션** (매일): 인스타 #위고비 #삭센다 #마운자로, YouTube 댓글 → 커뮤니티 마중물
- **가격/병원 업데이트** (주 1회): 지역별 가격 비교 DB

카테고리별 Phase 1 목표: wegovy 30개, saxenda 25개, mounjaro 25개, comparison 20개, side-effects 20개, price 15개, news 100개+.

**핵심 규칙**: 단정적 표현 금지, 임상 출처 명시, 처방 권유 금지, 면책조항 자동 삽입.

---

## 기술 아키텍처

**현재 스택**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + MDX (gray-matter + next-mdx-remote + remark-gfm) + Vercel 자동 배포.

**Phase 2 전환**: Turso (libSQL/SQLite) + Drizzle ORM 도입. 선택 이유: 무료 티어 9GB/10억 row read, SQLite 단순성, Vercel Edge 최적화, 콘텐츠 사이트 최적 적합성.

**DB 스키마** (이번 브랜치에서 구현):
- `posts`: 발행 콘텐츠 (slug, title, category, tags, status, source_type)
- `pipeline_queue`: AI 생성 대기열 (pending→processing→done/failed)
- `clinics`: 병원 디렉토리 Phase 2용 (region, 약별 가격)

**Drizzle ORM** 설정 완료: `drizzle.config.ts`, `src/lib/db/schema.ts`, `src/lib/db/index.ts`. package.json에 `db:generate`, `db:push`, `db:studio` 스크립트 추가.

**Turso DB 생성 현황**: Turso CLI가 MSYS2 환경에서 실행 불가(Windows 네이티브 바이너리 부재)하고 플랫폼 API 토큰이 없어 DB 생성은 수동 처리 필요. CEO/VP가 turso.tech 대시보드에서 `wegovy-info` DB를 nrt(Tokyo) 리전에 생성 후 `.env`에 `TURSO_DATABASE_URL`과 `TURSO_AUTH_TOKEN` 추가 필요.

---

## 이번 브랜치 완료 항목

- `plan/vision.md`: 서비스 정체성, 미션, 포지셔닝, 타겟, 경쟁 우위
- `plan/roadmap.md`: 3개 Phase 로드맵 + KPI 추적 테이블
- `plan/content-strategy.md`: 콘텐츠 유형, AI 파이프라인 아키텍처, 카테고리 전략
- `plan/tech-architecture.md`: 현재/미래 스택, Turso 선택 이유, DB 스키마, 환경변수
- `src/lib/db/schema.ts`: Drizzle ORM 스키마 (posts, pipeline_queue, clinics)
- `src/lib/db/index.ts`: Turso 클라이언트 + Drizzle 초기화
- `drizzle.config.ts`: drizzle-kit 설정
- `package.json`: @libsql/client, drizzle-orm, drizzle-kit 의존성 추가
