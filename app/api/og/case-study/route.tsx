import { ImageResponse } from '@vercel/og';
import { getOGImageCacheHeaders, optimizeOGTitle, optimizeOGDescription } from '@/lib/og-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const title = searchParams.get('title') || 'Case Study';
    const description = searchParams.get('description') || 'Read our case study';

    if (!slug && !title) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 128,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            PJais.ai
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
          <div style={{ fontSize: 32, opacity: 0.8 }}>
            {optimizeOGDescription(description)}
          </div>
          <div style={{ fontSize: 24, marginTop: 40, opacity: 0.6 }}>
            PJais.ai Case Study
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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

