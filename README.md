# Mintomics 🔮

> AI-powered mintomics design for Web3 founders. Professional token allocation, vesting schedules, emission curves, and investor red flag analysis — in 60 seconds.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in OPENROUTER_API_KEY and POSTGRES_URL to run generation + project history

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
tokenforge-ai/
├── app/
│   ├── page.tsx              # Landing page
│   ├── generate/page.tsx     # Main generation UI
│   ├── layout.tsx            # Root layout
│   └── api/
│       └── generate/route.ts # Streaming AI endpoint ← core logic
├── components/
│   ├── forms/
│   │   └── TokenomicsForm.tsx  # 3-step wizard
│   ├── charts/               # Week 5: Recharts visualizations
│   └── results/              # Week 5: Results dashboard
├── lib/
│   ├── ai/
│   │   ├── prompts.ts        # System prompt + user prompt builder ← MOST IMPORTANT
│   │   └── schema.ts         # Zod validation schema
│   └── mintomics/           # Business logic, validators
├── types/
│   └── mintomics.ts         # TypeScript types for all data
├── docs/
│   └── TokenForge_AI_PRD.docx  # Full Product Requirements Document
└── .env.example              # Required environment variables
```

---

## Architecture Decisions

### Why Streaming (not regular API calls)?
Vercel serverless functions have a **10-second timeout** on the Hobby plan. AI mintomics generation takes 20-60 seconds. Using `streamText` from the Vercel AI SDK keeps the connection alive by streaming tokens as they arrive — no timeout, better UX.

### Why Claude 3.5 Sonnet?
Best reasoning for structured financial/mathematical output. Consistent JSON with complex nested calculations (48 months × multiple categories). GPT-4o is an acceptable alternative.

### Why Lemon Squeezy over Stripe?
Lemon Squeezy is a **Merchant of Record** — it handles EU VAT automatically. This means you don't need to register for VAT in every EU country. Huge simplification for a solo founder.

---

## Development Roadmap

| Week | Focus |
|------|-------|
| ✅ 1-2 | AI engine: prompts, schema, streaming API |
| ✅ 3-4 | UI: form wizard, generate page |
| 🔲 5-6 | Charts: Recharts (allocation pie, vesting timeline, emission curve) |
| 🔲 7   | Auth: Clerk integration |
| 🔲 8   | Payments: Lemon Squeezy + tier gating |
| 🔲 9   | Landing page polish + SEO |
| 🔲 10  | Beta testing with real Web3 founders |
| 🔲 11-12 | ProductHunt launch |

---

## Environment Variables

See `.env.example` for all required variables.

**Minimum to run locally:**
- `OPENROUTER_API_KEY` — from [openrouter.ai/keys](https://openrouter.ai/keys)
- `POSTGRES_URL` — from your PostgreSQL provider (Neon/Vercel Postgres)

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (dark mode)
- **AI**: Vercel AI SDK + OpenRouter (OpenAI-compatible endpoint)
- **Charts**: Recharts (Week 5)
- **Auth**: Clerk (Week 7)
- **Payments**: Lemon Squeezy (Week 8)
- **Hosting**: Vercel
- **Language**: TypeScript (strict mode)

---

*Built by Dawid Bubernak · Mintomics · 2026*
