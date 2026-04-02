'use client'

import { useState, useEffect, useCallback } from 'react'
import { analytics } from '@/lib/analytics'

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

const DRUG_OPTIONS = [
  { value: 'wegovy', label: '위고비' },
  { value: 'saxenda', label: '삭센다' },
  { value: 'mounjaro', label: '마운자로' },
  { value: 'other', label: '기타' },
]

const DRUG_BADGE_COLORS: Record<string, string> = {
  wegovy: 'bg-teal-100 text-teal-800',
  saxenda: 'bg-blue-100 text-blue-800',
  mounjaro: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-700',
}

const DRUG_LABELS: Record<string, string> = {
  wegovy: '위고비',
  saxenda: '삭센다',
  mounjaro: '마운자로',
  other: '기타',
}

interface CommunityPost {
  id: string
  nickname: string
  drug: string
  content: string
  week: number | null
  weightLoss: string | null
  createdAt: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Form state
  const [nickname, setNickname] = useState('')
  const [drug, setDrug] = useState('')
  const [week, setWeek] = useState('')
  const [weightLoss, setWeightLoss] = useState('')
  const [content, setContent] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/community')
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts ?? [])
      } else {
        setFetchError(data.error ?? '게시물을 불러오지 못했습니다.')
      }
    } catch {
      setFetchError('게시물을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Turnstile callback — must be on window for the widget
  useEffect(() => {
    ;(window as Window & { onTurnstileSuccess?: (token: string) => void }).onTurnstileSuccess = (
      token: string
    ) => setTurnstileToken(token)
    return () => {
      delete (window as Window & { onTurnstileSuccess?: (token: string) => void }).onTurnstileSuccess
    }
  }, [])

  // Load Turnstile script once
  useEffect(() => {
    if (document.getElementById('cf-turnstile-script')) return
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    if (!turnstileToken) {
      setSubmitError('스팸 방지 검증을 완료해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          drug,
          content: content.trim(),
          week: week !== '' ? parseInt(week, 10) : null,
          weightLoss: weightLoss.trim() || null,
          turnstileToken,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitSuccess(true)
        analytics.communityPost(drug)
        setNickname('')
        setDrug('')
        setWeek('')
        setWeightLoss('')
        setContent('')
        setTurnstileToken('')
        await fetchPosts()
      } else {
        setSubmitError(data.error ?? '게시물 등록에 실패했습니다.')
      }
    } catch {
      setSubmitError('게시물 등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">경험 공유 게시판</h1>
      <p className="text-gray-500 text-sm mb-6">GLP-1 비만치료제 복용 경험을 익명으로 공유하세요.</p>

      {/* Prominent Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800 leading-relaxed">
        <strong className="block mb-1">주의사항</strong>
        이 게시판은 개인 경험 공유 목적입니다. 의학적 조언이 아니며, 전문의 상담을 대체하지 않습니다.
        의약품 효능 효과에 대한 근거 없는 주장은 삭제됩니다.
      </div>

      {/* Post Form */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">경험 작성하기</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nickname">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="위고비123"
                maxLength={20}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="drug">
                복용 약물 <span className="text-red-500">*</span>
              </label>
              <select
                id="drug"
                value={drug}
                onChange={(e) => setDrug(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                required
              >
                <option value="">선택해주세요</option>
                {DRUG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="week">
                복용 주차 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="week"
                type="number"
                min={1}
                max={200}
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="예: 4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="weightLoss">
                감량 체중 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="weightLoss"
                type="text"
                value={weightLoss}
                onChange={(e) => setWeightLoss(e.target.value)}
                placeholder="예: 3kg"
                maxLength={20}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">
              경험 내용 <span className="text-red-500">*</span>
              <span className="ml-2 text-gray-400 font-normal text-xs">{content.length}/1000자</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="복용 경험, 부작용, 효과 등을 자유롭게 공유해주세요. (최소 10자)"
              maxLength={1000}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-vertical"
              required
            />
          </div>

          {/* Cloudflare Turnstile */}
          <div>
            <div
              className="cf-turnstile"
              data-sitekey={TURNSTILE_SITE_KEY}
              data-callback="onTurnstileSuccess"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              게시물이 등록되었습니다. 감사합니다!
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="self-start bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {submitting ? '등록 중...' : '경험 공유하기'}
          </button>
        </form>
      </section>

      {/* Post List */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          커뮤니티 경험담 <span className="text-gray-400 font-normal text-base">({posts.length})</span>
        </h2>

        {loading && (
          <div className="text-center text-gray-400 py-10 text-sm">게시물을 불러오는 중...</div>
        )}
        {fetchError && (
          <div className="text-center text-red-500 py-10 text-sm">{fetchError}</div>
        )}
        {!loading && !fetchError && posts.length === 0 && (
          <div className="text-center text-gray-400 py-10 text-sm">
            아직 게시물이 없습니다. 첫 번째로 경험을 공유해보세요!
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-semibold text-gray-800 text-sm">{post.nickname}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    DRUG_BADGE_COLORS[post.drug] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {DRUG_LABELS[post.drug] ?? post.drug}
                </span>
                {post.week != null && (
                  <span className="text-xs text-gray-500">복용 {post.week}주차</span>
                )}
                {post.weightLoss && (
                  <span className="text-xs text-teal-600 font-medium">감량 {post.weightLoss}</span>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-400 mt-3">{formatDate(String(post.createdAt))}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
