import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Linkuni - YouTube Premium 최저가';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* YouTube Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg
            width="120"
            height="84"
            viewBox="0 0 24 24"
            fill="#FF0000"
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
            }}
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>

        {/* Main Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0',
              marginBottom: '20px',
            }}
          >
            YouTube Premium
          </h1>
          <p
            style={{
              fontSize: '48px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0',
              marginBottom: '30px',
            }}
          >
            월 3,750원부터
          </p>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '50px',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              🚫 광고 없음
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '50px',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              🎵 뮤직 무제한
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 'bold',
          }}
        >
          linkuni.site
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
