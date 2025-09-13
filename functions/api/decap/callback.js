export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing OAuth code', { status: 400 });
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response('Missing GITHUB_CLIENT_ID/SECRET', { status: 500 });
  }

  let token = '';
  let errorInfo = null;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/decap/callback`
      })
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) {
      errorInfo = { status: tokenRes.status, data };
    } else {
      token = data.access_token || '';
    }
  } catch (e) {
    errorInfo = { message: e && e.message ? e.message : String(e) };
  }

  const html = `<!DOCTYPE html><html><body><script>
    (function(){
      function sendToken(tok){
        // Decap CMS expects a postMessage in the form 'authorization:github:<token>'
        var message = tok ? ('authorization:github:' + tok) : 'authorization:github:null';
        if (window.opener) {
          // Use '*' for broad compatibility; CMS validates origin internally
          // Primary: string format Decap listens for
          window.opener.postMessage(message, '*');
          // Secondary: object shape that some older examples use
          try { window.opener.postMessage({ type: 'authorization', provider: 'github', token: tok }, '*'); } catch(e) {}
          try { window.close(); } catch(e) {}
        } else {
          // Fallback: navigate back to admin with token in hash
          var p = new URLSearchParams();
          if (tok) p.set('token', tok);
          window.location.href = '/admin/#' + p.toString();
        }
      }
      var token = ${JSON.stringify(token || '')};
      var err = ${JSON.stringify(errorInfo)};
      if (!token && err) {
        console.error('[Decap OAuth callback] Token exchange failed:', err);
      }
      sendToken(token);
    })();
  <\/script></body></html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
