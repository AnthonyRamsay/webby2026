// Cloudflare Pages Function - Radio Stream Proxy
// Bypasses CORS restrictions for audio streaming

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const streamUrl = url.searchParams.get('url');

  // Handle preflight CORS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (!streamUrl) {
    return new Response('Missing url parameter', { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Fetch the audio stream
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RadioProxy/1.0)',
        'Accept': '*/*',
      },
    });

    // Create new headers with CORS enabled
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Expose-Headers', '*');

    // Return the proxied stream
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

  } catch (error) {
    return new Response(`Proxy error: ${error.message}`, { 
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

