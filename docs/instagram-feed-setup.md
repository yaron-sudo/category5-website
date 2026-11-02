# Category 5 website — Community page (Instagram feed) setup

The page **/community** ("קהילה") shows the brand's Instagram reels and posts,
and optionally posts the brand was **tagged** in, in the site's own design.
It reads Instagram through Meta's official API via a small server function
(`/api/instagram`) that caches the feed for 30 minutes, so Instagram is never
called per visitor and the page keeps working during Instagram outages (it
serves the last good copy).

Until a token is configured the page shows a "follow us" state instead of a
feed. With `PUBLIC_INSTAGRAM_DEMO=true` it shows clearly labelled sample cards
for design review.

## What you need

- The brand's Instagram account must be a **Professional account** (Business
  or Creator). Personal accounts cannot use the API.
- A Meta developer account (free): https://developers.facebook.com

## Step 1 — Create a Meta app with "Instagram API with Instagram Login"

1. Go to https://developers.facebook.com/apps → **Create App**.
   Use case: *Other* → type **Business**. Name it `Category 5 website`.
2. In the app dashboard, under **Add products**, add **Instagram** → choose
   **API setup with Instagram login**.
3. In that product's setup page, section **Generate access tokens**:
   **Add account** → log in with the brand's Instagram account and authorise.
   Then click **Generate token** next to the account and copy the token.
   This is a **long-lived token (60 days)**.
4. Note the **Instagram user ID** shown next to the account (optional for the
   site; it defaults to `/me`).

## Step 2 — Add the values in Vercel

Vercel project → **Settings → Environment Variables** (Production + Preview):

| Name                     | Value                                   |
|--------------------------|-----------------------------------------|
| `INSTAGRAM_ACCESS_TOKEN` | the token from step 1                   |
| `INSTAGRAM_USER_ID`      | (optional) the Instagram user ID        |

Remove `PUBLIC_INSTAGRAM_DEMO` if it was set. Then **Deployments → Redeploy**.
Open /community — reels and posts appear within a minute.

## Step 3 — Keep the token alive (important)

Long-lived tokens expire after **60 days**. Before that, refresh it:

```
GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<current token>
```

The response contains a new token valid for another 60 days; paste it into
Vercel (`INSTAGRAM_ACCESS_TOKEN`) and redeploy. A calendar reminder every
50 days is the simplest way. (If the token expires, the page falls back to
the "follow us" state — nothing breaks.)

## Optional — posts the brand is tagged in ("מהקהילה")

Tagged media is only available through the Instagram Graph API with a
Facebook Page:

1. Connect the Instagram account to the brand's Facebook Page (Instagram
   settings → Accounts Center → Facebook).
2. In the Meta app add **Facebook Login for Business** and request the
   permissions `instagram_basic`, `pages_show_list`, `pages_read_engagement`.
3. Generate a Page access token (Graph API Explorer → select the Page →
   generate; exchange for a long-lived one). Find the Instagram business ID:
   `GET /{page-id}?fields=instagram_business_account`.
4. In Vercel add `INSTAGRAM_GRAPH_TOKEN` (the Page token) and
   `INSTAGRAM_BUSINESS_ID`. Redeploy. The page then shows a **מהקהילה** filter
   with posts where the brand was tagged.

Instagram only exposes tagged posts from public accounts, and reels tagged
in a story are not included.

## Notes

- Nothing on the page is posted or changed on Instagram; the token is used
  for reading only.
- Reels play inside the page (direct video from Instagram's CDN) with a link
  to the original; posts and carousels open on Instagram.
- The feed is cached for 30 minutes on Vercel's CDN; a new reel appears on
  the site within that window.
