import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

/**
 * Fallback OG image route
 * Used when dynamic generation fails or as a default
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'PJais.ai';
    const description = searchParams.get('description') || 'AI-Powered Web Design & Development';

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 32, opacity: 0.8, maxWidth: '900px' }}>
              {description}
            </div>
          )}
          <div style={{ fontSize: 24, marginTop: 40, opacity: 0.6 }}>
            PJais.ai
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Fallback OG image generation error:', error);
    // Return a simple solid color image on error
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
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
}

