# Repurpose MVP

[![CI](https://github.com/ChudiNnorukam/repurpose-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/ChudiNnorukam/repurpose-mvp/actions/workflows/ci.yml)

AI-powered social media content repurposing platform. Automatically adapt your content for Twitter, LinkedIn, and Instagram with intelligent scheduling.

## Features

- 🤖 AI-powered content adaptation using OpenAI GPT-4
- 📅 Smart scheduling with QStash
- 🔐 Secure OAuth 2.0 authentication (Twitter, LinkedIn)
- 📊 Post analytics and status tracking
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- ⚡ Built with Next.js 15 and React 19

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth 2.0 (PKCE)
- **Job Scheduling**: Upstash QStash
- **AI**: OpenAI GPT-4
- **Rate Limiting**: Upstash Redis
- **UI**: Tailwind CSS, shadcn/ui
- **Testing**: Jest, Playwright
- **Monitoring**: Sentry (configured)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key
- Upstash account (QStash + Redis)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChudiNnorukam/repurpose-mvp.git
cd repurpose-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in the required environment variables in `.env.local`:
- Supabase credentials
- OpenAI API key
- Twitter/LinkedIn OAuth credentials
- QStash tokens

4. Run database migrations:
```bash
npx supabase db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npx tsc --noEmit` - Type check

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Auth pages
│   └── (dashboard)/      # Protected dashboard pages
├── components/            # React components
├── lib/                  # Utilities and services
│   ├── social-media/    # Platform integrations
│   ├── api/             # API helpers
│   └── __tests__/       # Unit tests
├── public/               # Static assets
└── supabase/            # Database migrations
```

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Lint**: ESLint with Next.js rules
- **Type Check**: TypeScript compiler
- **Test**: Jest unit tests with coverage
- **Build**: Production build verification
- **Security**: npm audit + secret scanning

## Deployment

The app is deployed on Vercel:

```bash
vercel deploy --prod
```

Environment variables must be configured in Vercel dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.
