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
        // Decap CMS listens for either a string 'authorization:github:<token>' or an object message
        var strMessage = tok ? ('authorization:github:' + tok) : 'authorization:github:null';
        var objMessage = { type: 'authorization', provider: 'github', token: tok || null };
        if (window.opener) {
          try {
            var origin = document.referrer || (location.origin);
            // Prefer strict origin when possible
            window.opener.postMessage(objMessage, origin);
          } catch(_) {
            // Fallback to wildcard if strict origin not available
            window.opener.postMessage(objMessage, '*');
          }
          // Also send string format for compatibility
          try {
            window.opener.postMessage(strMessage, '*');
          } catch(_) {}
          // Give the parent a moment to handle the message before closing
          setTimeout(function(){ try { window.close(); } catch(e) {} }, 150);
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
