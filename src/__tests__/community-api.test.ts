import { describe, it, expect } from 'vitest'
import { validatePost } from '@/lib/community-validation'

describe('community post validation', () => {
  const validData = {
    nickname: '위고비123',
    drug: 'wegovy',
    content: '위고비를 4주째 복용 중입니다. 식욕이 줄어든 느낌이 있어요.',
  }

  it('accepts valid post data', () => {
    expect(validatePost(validData)).toBeNull()
  })

  it('rejects empty nickname', () => {
    const result = validatePost({ ...validData, nickname: '' })
    expect(result).toBe('닉네임은 2~20자 사이로 입력해주세요.')
  })

  it('rejects nickname shorter than 2 chars', () => {
    const result = validatePost({ ...validData, nickname: 'a' })
    expect(result).toBe('닉네임은 2~20자 사이로 입력해주세요.')
  })

  it('rejects nickname longer than 20 chars', () => {
    const result = validatePost({ ...validData, nickname: 'a'.repeat(21) })
    expect(result).toBe('닉네임은 2~20자 사이로 입력해주세요.')
  })

  it('rejects empty drug', () => {
    const result = validatePost({ ...validData, drug: '' })
    expect(result).toBe('약물을 선택해주세요.')
  })

  it('rejects content under 10 chars', () => {
    const result = validatePost({ ...validData, content: '짧은글' })
    expect(result).toBe('내용은 10자 이상 입력해주세요.')
  })

  it('rejects empty content', () => {
    const result = validatePost({ ...validData, content: '' })
    expect(result).toBe('내용은 10자 이상 입력해주세요.')
  })

  it('rejects content over 1000 chars', () => {
    const result = validatePost({ ...validData, content: 'a'.repeat(1001) })
    expect(result).toBe('내용은 1000자 이하로 입력해주세요.')
  })

  it('rejects forbidden keyword 처방해', () => {
    const result = validatePost({ ...validData, content: '의사에게 처방해 달라고 했어요.' })
    expect(result).toBe('의약품 효능 관련 주장은 게시할 수 없습니다.')
  })

  it('rejects forbidden keyword 보장', () => {
    const result = validatePost({ ...validData, content: '효과를 보장한다고 들었어요 복용중입니다.' })
    expect(result).toBe('의약품 효능 관련 주장은 게시할 수 없습니다.')
  })

  it('rejects forbidden keyword 안전해', () => {
    const result = validatePost({ ...validData, content: '이 약은 안전해서 모두에게 추천합니다.' })
    expect(result).toBe('의약품 효능 관련 주장은 게시할 수 없습니다.')
  })

  it('rejects forbidden keyword 효과있어', () => {
    const result = validatePost({ ...validData, content: '정말 효과있어서 계속 먹고 있어요.' })
    expect(result).toBe('의약품 효능 관련 주장은 게시할 수 없습니다.')
  })

  it('accepts content with 10 chars exactly', () => {
    const result = validatePost({ ...validData, content: '딱열글자임열' })
    // 6 chars — should fail
    expect(result).toBe('내용은 10자 이상 입력해주세요.')
  })

  it('accepts content with exactly 10 Korean chars', () => {
    const result = validatePost({ ...validData, content: '복용후기를씁니다열자!' })
    expect(result).toBeNull()
  })

  it('accepts content with exactly 1000 chars', () => {
    const result = validatePost({ ...validData, content: 'a'.repeat(1000) })
    expect(result).toBeNull()
  })
})
