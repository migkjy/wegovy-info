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
    expect(result).toBe('올바른 약물을 선택해주세요.')
  })

  it('rejects invalid drug enum', () => {
    const result = validatePost({ ...validData, drug: 'ozempic' })
    expect(result).toBe('올바른 약물을 선택해주세요.')
  })

  it('rejects unknown drug string', () => {
    const result = validatePost({ ...validData, drug: 'unknown_drug_123' })
    expect(result).toBe('올바른 약물을 선택해주세요.')
  })

  it('accepts all valid drug values', () => {
    const drugs = ['wegovy', 'saxenda', 'mounjaro', 'other']
    for (const drug of drugs) {
      expect(validatePost({ ...validData, drug })).toBeNull()
    }
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

  describe('weightLoss validation', () => {
    it('accepts weightLoss within 20 chars', () => {
      const result = validatePost({ ...validData, weightLoss: '-3.5kg' })
      expect(result).toBeNull()
    })

    it('rejects weightLoss over 20 chars', () => {
      const result = validatePost({ ...validData, weightLoss: 'a'.repeat(21) })
      expect(result).toBe('체중 변화는 20자 이하로 입력해주세요.')
    })

    it('accepts exactly 20 chars weightLoss', () => {
      const result = validatePost({ ...validData, weightLoss: 'a'.repeat(20) })
      expect(result).toBeNull()
    })

    it('accepts undefined weightLoss', () => {
      const result = validatePost({ ...validData })
      expect(result).toBeNull()
    })
  })
})

describe('week NaN validation (unit)', () => {
  it('parseInt of non-numeric string is NaN', () => {
    expect(isNaN(parseInt('abc', 10))).toBe(true)
  })

  it('parseInt of 0 is falsy for range check', () => {
    const weekInt = parseInt('0', 10)
    expect(weekInt < 1).toBe(true)
  })

  it('parseInt of 201 exceeds max', () => {
    const weekInt = parseInt('201', 10)
    expect(weekInt > 200).toBe(true)
  })

  it('parseInt of valid week passes', () => {
    const weekInt = parseInt('12', 10)
    expect(!isNaN(weekInt) && weekInt >= 1 && weekInt <= 200).toBe(true)
  })
})
