export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('Missing GITHUB_CLIENT_ID env var', { status: 500 });
  }

  // Build redirect_uri and propagate optional state param from the CMS
  const redirectUri = `${origin}/api/decap/callback`;
  const incomingState = new URL(request.url).searchParams.get('state') || '';
  // Permissions: broaden to full 'repo' + 'user:email' to ensure write access while we finalize
  const scope = 'repo user:email';

  const ghAuthorize = new URL('https://github.com/login/oauth/authorize');
  ghAuthorize.searchParams.set('client_id', clientId);
  ghAuthorize.searchParams.set('redirect_uri', redirectUri);
  ghAuthorize.searchParams.set('scope', scope);
  if (incomingState) ghAuthorize.searchParams.set('state', incomingState);

  return Response.redirect(ghAuthorize.toString(), 302);
}
