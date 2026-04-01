import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export const alt = '다이어트약 가이드 미리보기 이미지';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff'
  ).then((res) => res.arrayBuffer());

  const fontDataRegular = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.woff'
  ).then((res) => res.arrayBuffer());

  const fonts = [
    { name: 'Noto Sans KR', data: fontData, style: 'normal' as const, weight: 700 as const },
    { name: 'Noto Sans KR', data: fontDataRegular, style: 'normal' as const, weight: 400 as const },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0fdfa',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(to right, #0d9488, #10b981)',
            display: 'flex',
          }}
        />

        {/* Site name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#0d9488',
            marginBottom: 20,
            display: 'flex',
          }}
        >
          {SITE_NAME}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: '#4b5563',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.5,
            display: 'flex',
          }}
        >
          {SITE_DESCRIPTION}
        </div>

        {/* Medication names */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['위고비', '삭센다', '마운자로'].map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                padding: '10px 28px',
                backgroundColor: '#ccfbf1',
                color: '#0f766e',
                borderRadius: 9999,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: '#9ca3af',
            display: 'flex',
          }}
        >
          GLP-1 비만치료제 정보 플랫폼
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
