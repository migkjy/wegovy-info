import { describe, it, expect, vi } from 'vitest'
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
    const disclaimers = screen.getAllByText(/의학적 조언/)
    expect(disclaimers.length).toBeGreaterThanOrEqual(1)
  })

  it('renders category links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    const categoryLinks = links.filter(l => l.getAttribute('href')?.startsWith('/category/'))
    expect(categoryLinks.length).toBe(7)
  })

  it('renders legal notice section', () => {
    render(<Footer />)
    expect(screen.getByText('법적 고지')).toBeInTheDocument()
  })
})
