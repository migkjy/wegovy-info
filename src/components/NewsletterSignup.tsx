'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? '구독 중 오류가 발생했습니다.')
      } else {
        setStatus('success')
        setMessage(data.message ?? '뉴스레터 구독이 완료되었습니다!')
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <section className="my-10 bg-teal-50 border border-teal-200 rounded-2xl px-6 py-8 text-center">
      <h2 className="text-xl font-bold text-teal-900 mb-2">
        GLP-1 비만치료제 최신 정보를 이메일로 받아보세요
      </h2>
      <p className="text-sm text-teal-700 mb-6">
        위고비·삭센다·마운자로 관련 임상 정보, 가격 변동, 전문가 분석을 정기적으로 전달드립니다.
      </p>

      {status === 'success' ? (
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-5 py-3 rounded-xl font-medium text-sm">
          <span>✓</span>
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            required
            disabled={status === 'loading'}
            aria-label="이메일 주소"
            className="flex-1 px-4 py-2.5 rounded-xl border border-teal-300 bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '처리 중...' : '구독하기'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}

      <p className="mt-4 text-xs text-teal-600">
        스팸 없음 · 언제든지 구독 취소 가능
      </p>
    </section>
  )
}
