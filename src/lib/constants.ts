export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wegovy-info.vercel.app';
export const SITE_NAME = '다이어트약 가이드';
export const SITE_DESCRIPTION =
  '위고비, 삭센다, 마운자로 등 GLP-1 비만치료제의 효능, 부작용, 가격, 처방 정보를 제공합니다.';

export const CATEGORIES = [
  {
    slug: 'wegovy',
    name: '위고비',
    description: '위고비(세마글루타이드) 효능, 부작용, 가격, 처방 정보',
  },
  {
    slug: 'saxenda',
    name: '삭센다',
    description: '삭센다(리라글루타이드) 정보 및 비교',
  },
  {
    slug: 'mounjaro',
    name: '마운자로',
    description: '마운자로(티르제파타이드) 최신 정보',
  },
  {
    slug: 'comparison',
    name: '비교분석',
    description: 'GLP-1 비만치료제 비교 가이드',
  },
  {
    slug: 'side-effects',
    name: '부작용',
    description: '비만치료제 부작용 및 안전 정보',
  },
  {
    slug: 'price',
    name: '가격정보',
    description: '비만치료제 가격 비교 및 보험 정보',
  },
];

export const DISCLAIMER =
  '이 글은 정보 제공 목적이며, 의학적 조언이 아닙니다. 반드시 전문의와 상담하세요.';

export const POSTS_PER_PAGE = 12;
