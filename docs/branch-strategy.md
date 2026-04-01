# 브랜치 전략

## 빌드 정책
- feature/* → GitHub Actions만 (Vercel 빌드 스킵)
- staging → Vercel QA 배포 + GitHub Actions
- main → Vercel Production 배포 + GitHub Actions
