import { describe, it, expect, vi } from 'vitest'
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
