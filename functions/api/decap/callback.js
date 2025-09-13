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
      function send(msg){
        if (window.opener){
          window.opener.postMessage(msg, '${origin}');
          window.close();
        } else {
          // Fallback: navigate back to admin with token
          var p = new URLSearchParams();
          if (msg.token) p.set('token', msg.token);
          window.location.href = '/admin/#' + p.toString();
        }
      }
      var token = ${JSON.stringify(token || '')};
      if (token) {
        send({ type: 'authorization:github', token: token });
      } else {
        send({ type: 'authorization_github', token: null });
      }
    })();
  <\/script></body></html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
