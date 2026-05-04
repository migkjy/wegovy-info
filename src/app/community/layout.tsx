import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: '경험 공유 게시판',
  description: 'GLP-1 비만치료제(위고비, 삭센다, 마운자로) 복용 경험을 익명으로 공유하는 커뮤니티입니다.',
  alternates: { canonical: `${SITE_URL}/community` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/community`,
    title: `경험 공유 게시판 | ${SITE_NAME}`,
    description: 'GLP-1 비만치료제 복용 경험을 익명으로 공유하는 커뮤니티',
    locale: 'ko_KR',
    siteName: SITE_NAME,
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
