# Vitest Tests + GitHub Actions CI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add vitest test suite covering key components + GitHub Actions CI pipeline for automated build/test on PR.

**Architecture:** Use vitest with jsdom for client component unit tests (Header). For server components (pages), test the underlying data/constants modules directly since server components with fs access can't render in jsdom. CI runs build + test on every PR/push.

**Tech Stack:** vitest, @testing-library/react, @testing-library/jest-dom, jsdom, GitHub Actions

---

### Task 1: Install test dependencies

**Step 1: Install packages**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom`

**Step 2: Verify installation**

Run: `npm ls vitest`
Expected: vitest listed in devDependencies

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest and testing-library dev dependencies"
```

---

### Task 2: Configure vitest + test setup

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`
- Modify: `package.json` (add test scripts)

**Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 2: Create setup.ts**

```typescript
import '@testing-library/jest-dom'
```

**Step 3: Add test scripts to package.json**

Add to "scripts":
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Run vitest to verify config**

Run: `npx vitest run`
Expected: "No test files found" (no error)

**Step 5: Commit**

```bash
git add vitest.config.ts src/__tests__/setup.ts package.json
git commit -m "chore: configure vitest with jsdom and path aliases"
```

---

### Task 3: Test constants module

**Files:**
- Create: `src/__tests__/constants.test.ts`

**Step 1: Write test**

```typescript
import { describe, it, expect } from 'vitest'
import { SITE_NAME, CATEGORIES, DISCLAIMER } from '@/lib/constants'

describe('constants', () => {
  it('exports SITE_NAME as non-empty string', () => {
    expect(SITE_NAME).toBeTruthy()
    expect(typeof SITE_NAME).toBe('string')
  })

  it('exports 6 categories with required fields', () => {
    expect(CATEGORIES).toHaveLength(6)
    for (const cat of CATEGORIES) {
      expect(cat.slug).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.description).toBeTruthy()
    }
  })

  it('exports DISCLAIMER containing medical warning', () => {
    expect(DISCLAIMER).toContain('의학적 조언')
  })
})
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/constants.test.ts`
Expected: 3 tests PASS

**Step 3: Commit**

```bash
git add src/__tests__/constants.test.ts
git commit -m "test: add constants module tests"
```

---

### Task 4: Test Header component

**Files:**
- Create: `src/__tests__/Header.test.tsx`

**Step 1: Write test**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/Header'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Header', () => {
  it('renders site name with link to home', () => {
    render(<Header />)
    const homeLink = screen.getByText('다이어트약 가이드')
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders category navigation links', () => {
    render(<Header />)
    expect(screen.getAllByText('위고비').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('삭센다').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('마운자로').length).toBeGreaterThanOrEqual(1)
  })

  it('toggles mobile menu on button click', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('메뉴 열기')
    fireEvent.click(menuButton)
    expect(screen.getByLabelText('메뉴 닫기')).toBeInTheDocument()
  })
})
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/Header.test.tsx`
Expected: 3 tests PASS

**Step 3: Commit**

```bash
git add src/__tests__/Header.test.tsx
git commit -m "test: add Header component tests"
```

---

### Task 5: Test Footer component

**Files:**
- Create: `src/__tests__/Footer.test.tsx`

**Step 1: Write test**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Footer', () => {
  it('renders disclaimer text', () => {
    render(<Footer />)
    expect(screen.getByText(/의학적 조언/)).toBeInTheDocument()
  })

  it('renders category links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    const categoryLinks = links.filter(l => l.getAttribute('href')?.startsWith('/category/'))
    expect(categoryLinks.length).toBe(6)
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/다이어트약 가이드/)).toBeInTheDocument()
  })
})
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/Footer.test.tsx`
Expected: 3 tests PASS

**Step 3: Commit**

```bash
git add src/__tests__/Footer.test.tsx
git commit -m "test: add Footer component tests"
```

---

### Task 6: Test CategoryNav component

**Files:**
- Create: `src/__tests__/CategoryNav.test.tsx`

**Step 1: Write test**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryNav from '@/components/CategoryNav'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('CategoryNav', () => {
  it('renders "전체" link to home', () => {
    render(<CategoryNav />)
    const allLink = screen.getByText('전체')
    expect(allLink).toHaveAttribute('href', '/')
  })

  it('renders all category links', () => {
    render(<CategoryNav />)
    expect(screen.getByText('위고비')).toBeInTheDocument()
    expect(screen.getByText('삭센다')).toBeInTheDocument()
    expect(screen.getByText('마운자로')).toBeInTheDocument()
    expect(screen.getByText('비교분석')).toBeInTheDocument()
    expect(screen.getByText('부작용')).toBeInTheDocument()
    expect(screen.getByText('가격정보')).toBeInTheDocument()
  })

  it('highlights active category', () => {
    render(<CategoryNav activeCategory="wegovy" />)
    const wegoLink = screen.getByText('위고비')
    expect(wegoLink.className).toContain('bg-teal-600')
  })
})
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/CategoryNav.test.tsx`
Expected: 3 tests PASS

**Step 3: Commit**

```bash
git add src/__tests__/CategoryNav.test.tsx
git commit -m "test: add CategoryNav component tests"
```

---

### Task 7: Create GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

```yaml
name: CI
on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI pipeline with build and test"
```

---

### Task 8: Final verification + push

**Step 1: Run full test suite**

Run: `npm test`
Expected: All 15 tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Push**

```bash
git pull --rebase origin main
git push origin main
```

---

### Task 9: Branch protection (optional)

**Step 1: Set branch protection**

```bash
gh api repos/migkjy/wegovy-info/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["build-and-test"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews=null \
  -f restrictions=null
```

If this fails (free plan), report and skip.
