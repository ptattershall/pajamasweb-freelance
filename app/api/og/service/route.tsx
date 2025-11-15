import { ImageResponse } from '@vercel/og';
import { getOGImageCacheHeaders, optimizeOGTitle, optimizeOGDescription } from '@/lib/og-cache';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Our Services';
    const description = searchParams.get('description') || 'Professional web design and development services';

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
            {optimizeOGTitle(title)}
          </div>
          <div style={{ fontSize: 32, opacity: 0.8, maxWidth: '900px' }}>
            {optimizeOGDescription(description)}
          </div>
          <div style={{ fontSize: 24, marginTop: 40, opacity: 0.6 }}>
            PJais.ai Services
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Add cache headers
    const headers = getOGImageCacheHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      imageResponse.headers.set(key, value);
    });

    return imageResponse;
  } catch (error) {
    console.error('OG image generation error:', error);
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Error generating image
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

