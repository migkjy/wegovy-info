import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/Header'

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
