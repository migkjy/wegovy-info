import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ShareButtons from '@/components/ShareButtons'

// Mock next/navigation (not needed but defensive)
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const DEFAULT_PROPS = {
  title: '테스트 포스트 제목',
  description: '테스트 포스트 설명',
  url: 'https://example.com/test-post',
}

describe('ShareButtons', () => {
  beforeEach(() => {
    // Reset env var before each test
    vi.stubEnv('NEXT_PUBLIC_KAKAO_APP_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('renders URL copy button', () => {
    render(<ShareButtons {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: /url 복사/i })).toBeInTheDocument()
  })

  it('shows "복사됨!" feedback for 2 seconds after clicking copy button', async () => {
    vi.useFakeTimers()

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(<ShareButtons {...DEFAULT_PROPS} />)

    const copyButton = screen.getByRole('button', { name: /url 복사/i })
    expect(copyButton).toHaveTextContent('URL 복사')

    // Fire click and flush async clipboard promise with act
    await act(async () => {
      fireEvent.click(copyButton)
      await Promise.resolve()
    })

    expect(screen.getByText('복사됨!')).toBeInTheDocument()

    // Advance fake time to trigger the 2s reset
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('button', { name: /url 복사/i })).toHaveTextContent('URL 복사')

    vi.useRealTimers()
  })

  it('Twitter share link has correct href with encoded title and URL', () => {
    render(<ShareButtons {...DEFAULT_PROPS} />)

    const twitterLink = screen.getByRole('link', { name: /x.*공유|공유.*x/i })
    const href = twitterLink.getAttribute('href') ?? ''

    expect(href).toContain('https://twitter.com/intent/tweet')
    expect(href).toContain(encodeURIComponent(DEFAULT_PROPS.title))
    expect(href).toContain(encodeURIComponent(DEFAULT_PROPS.url))
  })

  it('Kakao button is hidden when NEXT_PUBLIC_KAKAO_APP_KEY is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_APP_KEY', '')

    render(<ShareButtons {...DEFAULT_PROPS} />)

    expect(screen.queryByRole('button', { name: /카카오톡/i })).not.toBeInTheDocument()
  })

  it('Kakao button renders when NEXT_PUBLIC_KAKAO_APP_KEY is set and SDK is ready', async () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_APP_KEY', 'test-kakao-key')

    // Mock window.Kakao to simulate SDK already loaded and initialized
    Object.defineProperty(window, 'Kakao', {
      value: {
        isInitialized: vi.fn().mockReturnValue(true),
        init: vi.fn(),
        Share: {
          sendDefault: vi.fn(),
        },
      },
      writable: true,
      configurable: true,
    })

    // Mock getElementById to simulate script already present
    const originalGetElementById = document.getElementById.bind(document)
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'kakao-sdk') {
        return document.createElement('script')
      }
      return originalGetElementById(id)
    })

    await act(async () => {
      render(<ShareButtons {...DEFAULT_PROPS} />)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /카카오톡/i })).toBeInTheDocument()
    })
  })
})
