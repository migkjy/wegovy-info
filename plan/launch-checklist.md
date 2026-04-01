# wegovy-info Launch Checklist

## Pre-Launch (CEO/VP Required)

### Domain & Hosting
- [ ] Domain 구매 및 Vercel 연결
- [ ] `NEXT_PUBLIC_SITE_URL` Vercel 환경변수 설정 (실제 도메인으로)
- [ ] Vercel Production Branch: `production` 설정
- [ ] main → staging → production PR merge 흐름 확인

### Environment Variables (Vercel Production)
- [ ] `NEXT_PUBLIC_SITE_URL` = https://실제도메인.com
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` = G-xxxxxxxx (Google Analytics)
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = (Google Search Console)
- [ ] `TURSO_DB_URL` = libsql://wegovy-info-migkjy.aws-ap-northeast-1.turso.io
- [ ] `TURSO_DB_TOKEN` = (Turso token)
- [ ] `TURSO_AUTH_TOKEN` = (Turso auth token)
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = (Cloudflare Turnstile - real key)
- [ ] `TURNSTILE_SECRET_KEY` = (Cloudflare Turnstile secret - real key)
- [ ] `RESEND_API_KEY` = (Resend.com - newsletter, optional)

### Search Console & Analytics
- [ ] Google Search Console 사이트 등록
- [ ] sitemap.xml 제출: https://도메인/sitemap.xml
- [ ] robots.txt 확인: https://도메인/robots.txt
- [ ] Google Analytics 4 실시간 확인

### Pre-Launch Content Review
- [ ] 전체 포스트 면책조항 포함 확인
- [ ] 클리닉 데이터 면책조항 표시 확인
- [ ] 커뮤니티 게시판 약관 표시 확인

## Post-Launch (Week 1)

### Indexing
- [ ] Google Search Console URL 검사 (주요 페이지)
- [ ] Bing Webmaster Tools 등록
- [ ] Google My Business (선택)

### Monitoring
- [ ] Vercel Analytics 활성화
- [ ] Error 알림 설정 (Vercel → Slack/email)
- [ ] AI 파이프라인 실행 확인 (Windows Task Scheduler)

### AdSense
- [ ] 월 10,000 PV 달성 후 Google AdSense 신청

## Phase 2 KPI Tracking
- [ ] Google Analytics custom events for newsletter signup
- [ ] Community post count tracking
- [ ] Clinic page view tracking (which regions get most traffic)

## Notes
- Turnstile test keys: site=`1x00000000000000000000AA`, secret=`1x0000000000000000000000000000000AA`
- Community board: if TURNSTILE_SECRET_KEY missing in production, API returns 500
- Newsletter: RESEND_API_KEY optional for MVP (stores to Turso only without it)
