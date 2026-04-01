import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewsletterSignup from '@/components/NewsletterSignup'

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders email input', () => {
    render(<NewsletterSignup />)
    expect(screen.getByPlaceholderText('이메일 주소 입력')).toBeInTheDocument()
  })

  it('renders subscribe button', () => {
    render(<NewsletterSignup />)
    expect(screen.getByRole('button', { name: '구독하기' })).toBeInTheDocument()
  })

  it('renders heading text', () => {
    render(<NewsletterSignup />)
    expect(
      screen.getByText('GLP-1 비만치료제 최신 정보를 이메일로 받아보세요')
    ).toBeInTheDocument()
  })

  it('shows loading state when form is submitted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})) // never resolves — keeps loading state
    )

    render(<NewsletterSignup />)

    const input = screen.getByPlaceholderText('이메일 주소 입력')
    const button = screen.getByRole('button', { name: '구독하기' })

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeInTheDocument()
    })
  })

  it('shows success message after successful subscription', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: '뉴스레터 구독이 완료되었습니다!' })
        })
      )
    )

    render(<NewsletterSignup />)

    const input = screen.getByPlaceholderText('이메일 주소 입력')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('뉴스레터 구독이 완료되었습니다!')).toBeInTheDocument()
    })
  })

  it('shows error message on failed subscription', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: '올바른 이메일 주소를 입력해주세요.' })
        })
      )
    )

    render(<NewsletterSignup />)

    const input = screen.getByPlaceholderText('이메일 주소 입력')
    fireEvent.change(input, { target: { value: 'bad-email' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 주소를 입력해주세요.')).toBeInTheDocument()
    })
  })
})
