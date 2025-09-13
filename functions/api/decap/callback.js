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
  const token = data.access_token;

  const html = `<!DOCTYPE html><html><body><script>
    (function(){
      function sendToken(tok){
        // Decap CMS expects a postMessage in the form 'authorization:github:<token>'
        var message = tok ? ('authorization:github:' + tok) : 'authorization:github:null';
        if (window.opener) {
          // Use '*' for broad compatibility; CMS validates origin internally
          window.opener.postMessage(message, '*');
          try { window.close(); } catch(e) {}
        } else {
          // Fallback: navigate back to admin with token in hash
          var p = new URLSearchParams();
          if (tok) p.set('token', tok);
          window.location.href = '/admin/#' + p.toString();
        }
      }
      var token = ${JSON.stringify(token || '')};
      sendToken(token);
    })();
  <\/script></body></html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
