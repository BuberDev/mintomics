# Mintomics 🔮

> AI-powered mintomics design for Web3 founders. Professional token allocation, vesting schedules, emission curves, and investor red flag analysis — in 60 seconds.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in OPENROUTER_API_KEY, Supabase database envs, and STRIPE_* if you want billing

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
Mintomics-ai/
├── app/
│   ├── page.tsx              # Landing page
│   ├── pricing/page.tsx      # Pricing page + billing handoff
│   ├── terms/page.tsx        # Terms of Service
│   ├── privacy/page.tsx      # Privacy Policy
│   ├── disclaimer/page.tsx   # Not financial advice disclaimer
│   ├── generate/page.tsx     # Main generation UI
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── generate/route.ts # AI generation endpoint ← core logic
│       ├── billing/route.ts  # Stripe Checkout handoff
│       └── events/route.ts   # Analytics event capture
├── components/
│   ├── forms/
│   │   └── TokenomicsForm.tsx  # 3-step wizard
│   ├── charts/               # Week 5: Recharts visualizations
│   └── results/              # Week 5: Results dashboard
├── lib/
│   ├── ai/
│   │   ├── prompts.ts        # System prompt + user prompt builder ← MOST IMPORTANT
│   │   └── schema.ts         # Zod validation schema
│   ├── mintomics/            # Business logic, validators
│   ├── analytics/            # Client analytics helpers
│   └── db/                   # Persistence layer
├── types/
│   └── mintomics.ts         # TypeScript types for all data
├── docs/
│   └── Mintomics_AI_PRD.docx  # Full Product Requirements Document
└── .env.example              # Required environment variables
```

---

## Architecture Decisions

### Why normalize AI output?
LLM output is good at language, but tokenomics needs strict structure. The app now validates and normalizes AI output so the charts, schedules, and investor summary always match the required schema.

### Why Claude 3.5 Sonnet?
Best reasoning for structured financial/mathematical output. Consistent JSON with complex nested calculations (48 months × multiple categories). GPT-4o is an acceptable alternative.

### Why Stripe?
Stripe gives us hosted Checkout, flexible subscription pricing, and first-class webhook handling without adding another payment vendor on top.

---

## Development Roadmap

| Week | Focus |
|------|-------|
| ✅ 1-2 | AI engine: prompts, schema, streaming API |
| ✅ 3-4 | UI: form wizard, generate page |
| 🔲 5-6 | Charts: Recharts (allocation pie, vesting timeline, emission curve) |
| 🔲 7   | Auth: Clerk integration |
| 🔲 8   | Payments: Stripe + tier gating |
| 🔲 9   | Landing page polish + SEO |
| 🔲 10  | Beta testing with real Web3 founders |
| 🔲 11-12 | ProductHunt launch |

---

## Environment Variables

See `.env.example` for all required variables.

**Minimum to run locally:**
- `OPENROUTER_API_KEY` — from [openrouter.ai/keys](https://openrouter.ai/keys)
- `DATABASE_URL` or `POSTGRES_URL` — from your Supabase database settings
- `POSTGRES_URL_NON_POOLING` — optional direct connection string if you prefer it
- If your Supabase URL includes `sslmode=require`, the app strips it automatically for local development
- `STRIPE_SECRET_KEY` — server-side Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret
- `STRIPE_PRO_MONTHLY_PRICE_ID` and `STRIPE_PRO_ANNUAL_PRICE_ID` — Pro subscription prices
- Agency is offered as a sales-assisted tier from the pricing page and routes to contact sales.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (dark mode)
- **AI**: Vercel AI SDK + OpenRouter (OpenAI-compatible endpoint)
- **Charts**: Recharts (Week 5)
- **Auth**: Clerk (Week 7)
- **Payments**: Stripe (Week 8)
- **Hosting**: Vercel
- **Language**: TypeScript (strict mode)

---

*Built by Dawid Bubernak · Mintomics · 2026*
