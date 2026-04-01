const FORBIDDEN_KEYWORDS = [
  '처방해',
  '끊어도',
  '확실히',
  '보장',
  '안전해',
  '효과있어',
  '먹어도 돼',
  '먹어봐',
]

const ALLOWED_DRUGS = ['wegovy', 'saxenda', 'mounjaro', 'other']

export { ALLOWED_DRUGS }

export function validatePost(data: {
  nickname: string
  drug: string
  content: string
  weightLoss?: string
}): string | null {
  if (!data.nickname || data.nickname.length < 2 || data.nickname.length > 20) {
    return '닉네임은 2~20자 사이로 입력해주세요.'
  }
  if (!data.drug || !ALLOWED_DRUGS.includes(data.drug)) {
    return '올바른 약물을 선택해주세요.'
  }
  if (!data.content || data.content.length < 10) return '내용은 10자 이상 입력해주세요.'
  if (data.content.length > 1000) return '내용은 1000자 이하로 입력해주세요.'
  if (FORBIDDEN_KEYWORDS.some((kw) => data.content.includes(kw))) {
    return '의약품 효능 관련 주장은 게시할 수 없습니다.'
  }
  if (data.weightLoss && data.weightLoss.length > 20) {
    return '체중 변화는 20자 이하로 입력해주세요.'
  }
  return null
}
