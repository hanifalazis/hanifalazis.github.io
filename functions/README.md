Cloudflare Pages Functions for Decap CMS OAuth
================================================

This site is hosted on Cloudflare Pages and uses Decap CMS with GitHub backend. To handle OAuth securely, we define two Pages Functions:

- `/api/decap/auth`: Redirects the user to GitHub's authorize URL with your Client ID
- `/api/decap/callback`: Exchanges the `code` for an access token and posts it back to the CMS window

Environment Variables (set in Cloudflare Pages project settings → Environment variables):

- `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret

Admin config (`admin/index.html`) references these endpoints by setting the CMS backend `base_url` to `window.location.origin` and `auth_endpoint` to `/api/decap/auth`.

After setting the variables, deploy and access `/admin/` to login.
