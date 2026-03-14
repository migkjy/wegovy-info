# wegovy-info Constraints

## Content Compliance (의약품 정보 사이트 필수)
1. **전문의약품 광고 금지** — 약사법 위반 소지. "안전하다/효과적이다" 단정 금지
2. **면책조항 필수** — 모든 포스트에 DISCLAIMER 자동 삽입
3. **객관적 정보만** — 임상 연구 결과, 공식 정보 기반 작성
4. **처방 권유 금지** — 독자 개인의 처방 결정 유도 내용 금지
5. **정보 출처 명시** — 연구 결과 인용 시 출처 명시

## Technical Constraints
- DB 없음 — 파일시스템 MDX 콘텐츠 전용
- 도메인 미정 — `NEXT_PUBLIC_SITE_URL` 환경변수로 관리
- Vercel 프로젝트 설정 — CEO 승인 후 진행
- Vercel CLI 배포 금지 — Git push로만 배포
- Node.js v20 필수 (nvm use)

## Business Constraints
- 코드 수정 시 반드시 plan → VP 승인 → TDD 실행
- production 직행 PR 금지 (main → staging → production)
- Vercel 일일 배포 100건 제한 (무료 플랜)
- 미론칭 프로젝트는 staging까지만 배포

## Cross-Project Rules
- 서비스 간 크로스 프로모션 금지
- 1페이지 1목적 원칙
- CEO 거부 과업 재착수 금지 (memory/ceo-rejected-tasks.md 확인)
