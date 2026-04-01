import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Pagination from '@/components/Pagination'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Pagination', () => {
  it('renders "이전" and "다음" links on a middle page', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/" />)
    expect(screen.getByText('이전')).toBeInTheDocument()
    expect(screen.getByText('다음')).toBeInTheDocument()
  })

  it('renders "이전" as a non-link on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} basePath="/" />)
    const prev = screen.getByText('이전')
    expect(prev.tagName).toBe('SPAN')
    expect(prev).not.toHaveAttribute('href')
  })

  it('renders "다음" as a non-link on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} basePath="/" />)
    const next = screen.getByText('다음')
    expect(next.tagName).toBe('SPAN')
    expect(next).not.toHaveAttribute('href')
  })

  it('marks current page with aria-current="page"', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/" />)
    const currentPageLink = screen.getByRole('link', { name: '3' })
    expect(currentPageLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies teal/active styling to current page', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/" />)
    const activeLink = screen.getByRole('link', { name: '2' })
    expect(activeLink.className).toContain('bg-teal-600')
    expect(activeLink.className).toContain('font-bold')
  })

  it('renders ellipsis for large page counts (10 pages, current=5)', () => {
    render(<Pagination currentPage={5} totalPages={10} basePath="/" />)
    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThanOrEqual(1)
    // first page and last page should always be visible
    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '10' })).toBeInTheDocument()
  })

  it('page 1 link uses basePath without query string', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/category/wegovy" />)
    const page1Link = screen.getByRole('link', { name: '1' })
    expect(page1Link).toHaveAttribute('href', '/category/wegovy')
  })

  it('page 2+ links include ?page=N query string', () => {
    render(<Pagination currentPage={1} totalPages={5} basePath="/" />)
    const page2Link = screen.getByRole('link', { name: '2' })
    expect(page2Link).toHaveAttribute('href', '/?page=2')
  })

  it('"이전" link points to previous page', () => {
    render(<Pagination currentPage={4} totalPages={5} basePath="/" />)
    const prevLink = screen.getByText('이전')
    expect(prevLink).toHaveAttribute('href', '/?page=3')
  })

  it('"다음" link points to next page', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/" />)
    const nextLink = screen.getByText('다음')
    expect(nextLink).toHaveAttribute('href', '/?page=3')
  })

  it('"이전" on page 2 links to basePath (page 1)', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/" />)
    const prevLink = screen.getByText('이전')
    expect(prevLink).toHaveAttribute('href', '/')
  })
})
