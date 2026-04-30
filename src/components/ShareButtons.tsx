'use client';

import { useEffect, useState } from 'react';

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl?: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
        }) => void;
      };
    };
  }
}

export default function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

  useEffect(() => {
    if (!kakaoAppKey) return;

    const existingScript = document.getElementById('kakao-sdk');
    if (existingScript) {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoAppKey);
      }
      if (window.Kakao?.isInitialized()) {
        const rafId = requestAnimationFrame(() => setKakaoReady(true));
        return () => cancelAnimationFrame(rafId);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-sdk';
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoAppKey);
      }
      setKakaoReady(true);
    };
    document.head.appendChild(script);
  }, [kakaoAppKey]);

  const handleKakaoShare = () => {
    if (!window.Kakao?.Share) return;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    });
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt('아래 URL을 복사하세요:', url);
    }
  };

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-gray-200">
      <span className="text-sm font-medium text-gray-600">공유하기</span>

      {/* KakaoTalk share button */}
      {kakaoAppKey && kakaoReady && (
        <button
          type="button"
          onClick={handleKakaoShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#FEE500', color: '#3A1D1D' }}
          aria-label="카카오톡으로 공유"
        >
          {/* KakaoTalk logo SVG */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 1C4.582 1 1 3.806 1 7.25c0 2.218 1.426 4.163 3.578 5.278L3.75 15.5l3.532-2.317A9.78 9.78 0 009 13.5c4.418 0 8-2.806 8-6.25S13.418 1 9 1z"
              fill="#3A1D1D"
            />
          </svg>
          카카오톡
        </button>
      )}

      {/* URL copy button */}
      <button
        type="button"
        onClick={handleCopyUrl}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        aria-label="URL 복사"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 5V3.5A1.5 1.5 0 009.5 2h-7A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {copied ? '복사됨!' : 'URL 복사'}
      </button>

      {/* Twitter/X share button */}
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
        aria-label="X(트위터)로 공유"
      >
        {/* X (Twitter) logo SVG */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8.51 6.382 13.786.5h-1.25L7.94 5.573 4.003.5H.5l5.54 7.915L.5 14.5h1.25l4.844-5.52L10.498 14.5H14L8.51 6.382zm-1.715 1.953-.561-.79L2.222 1.43h1.922l3.6 5.072.561.79 4.683 6.6H11.07L6.795 8.335z"
            fill="currentColor"
          />
        </svg>
        X 공유
      </a>
    </div>
  );
}
