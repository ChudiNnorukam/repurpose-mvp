This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Configuration

Set the following environment variables before running OAuth flows or publishing to social platforms:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key used by background jobs |
| `OPENAI_API_KEY` | OpenAI API key for content adaptation |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | Twitter (X) OAuth credentials |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth credentials |
| `META_APP_ID` / `META_APP_SECRET` | Meta app credentials for Instagram Graph API |
| `QSTASH_TOKEN` | Upstash QStash token for scheduled job execution |
| `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | Upstash signing keys for webhook validation |
| `NEXT_PUBLIC_APP_URL` | Fully-qualified application URL used in OAuth callbacks |
| `INSTAGRAM_DEFAULT_IMAGE_URL` *(optional)* | Publicly accessible image URL used when an Instagram post does not provide media |

### Instagram Graph API Permissions

Grant your Meta app the following permissions when submitting for review to enable publishing:

- `pages_show_list`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_manage_insights`
- `instagram_content_publish`

The OAuth callback URL should be `https://<your-domain>/api/auth/instagram/callback` and must be registered in the Meta Developer portal alongside the Twitter and LinkedIn callbacks.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
