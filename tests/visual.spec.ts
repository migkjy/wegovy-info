import { test, expect } from '@playwright/test'

test('메인 페이지 로드', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
})

test('블로그 목록 페이지', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.locator('main')).toBeVisible()
})

test('카테고리 페이지', async ({ page }) => {
  await page.goto('/category/wegovy')
  await expect(page.locator('main')).toBeVisible()
})
