# Mintomics — Product Requirements Document

> **Version:** 1.0 · **Status:** Draft – In Review · **Date:** April 2026 · **CONFIDENTIAL**

| Field | Value |
|---|---|
| **Author** | Dawid Bubernak (Founder) |
| **Version** | 1.0 |
| **Last Updated** | April 2026 |
| **Target Launch** | Q3 2026 (Beta) |
| **Document Type** | Product Requirements Document (PRD) |

---

## 1. Executive Summary

Mintomics is a web-based SaaS tool that allows Web3 founders to design, simulate, and validate their token economics in minutes — without needing to hire a token engineer. By combining AI with domain expertise in token engineering, Mintomics generates complete mintomics models including allocation tables, vesting schedules, emission curves, sell pressure analysis, and investor red flag reports.

### The Core Problem

Every Web3 project needs a mintomics model. Designing one correctly requires expertise most founders don't have.

Hiring a token engineer costs **$5,000–$15,000** per engagement. Most early-stage projects can't afford this.

Existing tools (Cenit Finance, TokenSPICE, FinDaS) are built for token engineers — not for founders.

The result: poorly designed mintomics that collapse projects, destroy investor trust, and kill communities.

### The Solution

A founder fills out a structured 3-step form covering project basics, supply/funding, allocation hints, and vesting preferences.

Mintomics generates a complete, professional mintomics model in **under 60 seconds**.

The output includes visual charts, a downloadable PDF report, and an investor-ready summary.

**Price: $49/month** — vs. $5,000–$15,000 for a token engineer. **100x cheaper.**

---

## 2. Market & Opportunity

### 2.1 Market Size

The Web3 market is valued at $4.97B in 2026, projected to reach $29.97B by 2031 — a 43% CAGR. Thousands of new Web3 projects launch every month across DeFi, GameFi, DAOs, RWA tokenization, and infrastructure. Each one requires a mintomics model.

| Metric | Value |
|---|---|
| Web3 Market Size (2026) | $4.97 Billion |
| Web3 Market Size (2031) | $29.97 Billion |
| Market CAGR | 43.21% |
| New Web3 Projects (monthly est.) | 2,000–5,000+ |
| Token Engineer Cost (per project) | $5,000–$15,000 |
| Mintomics Price | $49–$149/month |
| Cost Advantage | **100x cheaper** than a token engineer |

### 2.2 Competitive Landscape

No direct competitor targets Web3 founders with an AI-powered, non-technical mintomics design tool. The current landscape:

| Competitor | Why We Win |
|---|---|
| Cenit Finance Simulator | Technical tool for token engineers. No AI. Not founder-friendly. |
| TokenSPICE | Agent-based simulation. Requires Python knowledge. No UI. |
| FinDaS / InnMind | Calculators only. No AI recommendations. No red flag analysis. |
| Token Engineering Labs | Consulting firm, not a product. $10K+ per engagement. |
| **Mintomics** | **AI-powered. Founder-friendly UI. 60-second output. $49/month.** |

---

## 3. Target Users & Personas

### Persona A — The Web3 Founder

| Field | Detail |
|---|---|
| **Name** | Alex, 28–38 years old |
| **Role** | Co-founder of a DeFi / GameFi / DAO / RWA project |
| **Technical Level** | Mid-level developer or non-technical business founder |
| **Pain** | Needs mintomics to raise a seed round. Can't afford a token engineer. |
| **Goal** | Get investor-ready mintomics in 24 hours, not 2 weeks. |
| **Willingness to Pay** | $49–$149/month without hesitation if product works |
| **Where to Find Them** | Twitter/X, Discord (Web3 accelerators), LinkedIn, Telegram |

### Persona B — The Crypto Consultant / Advisor

| Field | Detail |
|---|---|
| **Name** | Maria, 30–45 years old |
| **Role** | Freelance Web3 advisor or mintomics consultant |
| **Pain** | Uses spreadsheets and manual calculations for every client. Slow process. |
| **Goal** | Deliver professional mintomics reports to clients faster, with higher margins. |
| **Willingness to Pay** | $149/month (Agency tier) — passes cost to clients |
| **Where to Find Them** | LinkedIn, Token Engineering Community, Crypto Twitter |

---

## 4. Core User Journey (Happy Path)

The entire experience from landing on the site to downloading a report must take **under 10 minutes** for a first-time user.

| Step | What Happens |
|---|---|
| **1. Landing Page** | Founder arrives via Twitter link, ProductHunt, or Google. Sees headline, demo, and pricing. Clicks 'Start Free'. |
| **2. Sign Up** | Email + password or Google OAuth. No credit card required for free tier. |
| **3. Project Setup Form** | Completes a 3-step wizard covering project basics, token supply/funding, allocation hints, and vesting preferences. |
| **4. AI Processing** | Mintomics generates the model. Progress bar shown. Takes 15–45 seconds. |
| **5. Results Dashboard** | Sees: allocation pie chart, vesting timeline, emission curve, sell pressure table, red flags list. |
| **6. Iterate** | Adjusts sliders (team %, cliff length, etc.) and regenerates in real time. |
| **7. Export** | Downloads PDF report (Pro) or copies summary (Free). Shares link with co-founders or investors. |
| **8. Upgrade** | Hits free tier limit or wants PDF export. Upgrades to Pro ($49/month) via Stripe Checkout. |

---

## 5. MVP Feature Scope

> **MVP Scope Rule (Senior Dev Principle)**
>
> Build only what is required to generate value and validate willingness to pay.
> Everything not on the IN list below is explicitly OUT of MVP.
> Ship in 10 weeks. Iterate based on real user feedback.

### 5.1 IN Scope (MVP)

- Project setup wizard with required inputs + optional allocation / vesting preferences
- AI mintomics generation engine (Claude 3.5 Sonnet via Vercel AI SDK)
- Token allocation chart (pie chart — Recharts)
- Vesting schedule table + timeline chart
- Monthly emission schedule table
- Sell pressure analysis (at 3 price scenarios)
- Investor red flags checklist (AI-generated)
- PDF export of full report (Pro tier only)
- User auth (Clerk — Google + email)
- Subscription billing (Stripe Checkout + webhooks)
- Landing page with demo

### 5.2 OUT of Scope (Post-MVP)

- Multi-chain specific modeling (post-MVP v2)
- Team collaboration features
- API access for developers
- White-label reports (Agency tier — v2)
- Smart contract integration / on-chain data
- Competitive benchmarking against live projects

---

## 6. Technical Architecture

### 6.1 Tech Stack Decision

Chosen for: minimal infrastructure overhead, fast development, zero DevOps complexity. Vercel free tier covers MVP traffic.

| Layer | Technology + Rationale |
|---|---|
| **Frontend** | Next.js 14 + Tailwind CSS — SSR, fast, Vercel-native |
| **Backend** | Next.js Route Handlers — no separate server needed for MVP |
| **AI Engine** | Claude 3.5 Sonnet via Vercel AI SDK — best reasoning for structured financial output |
| **Charts** | Recharts — lightweight, React-native, no extra bundle cost |
| **Auth** | Clerk — handles Google OAuth + email, free up to 10K MAU |
| **Payments** | Stripe — hosted Checkout, webhook support, optional Stripe Tax if needed |
| **PDF Generation** | jsPDF + html2canvas for MVP — fast client-side export from the report view |
| **Hosting** | Vercel — free tier, automatic deploys from GitHub |
| **Database** | Vercel Postgres (or PlanetScale free) — store projects + user data |

### 6.2 AI Prompt Architecture

The AI engine is the core of the product. It uses a structured system prompt encoding token engineering domain knowledge, plus a dynamic user prompt built from the form inputs. Output is enforced as JSON schema for reliable parsing into charts and tables.

**System Prompt Strategy:**

- **Role:** Expert token engineer with 7+ years designing mintomics for DeFi, GameFi, and DAO projects
- **Knowledge encoded:** allocation industry benchmarks, vesting best practices, emission curve patterns, common failure modes
- **Output format:** strict JSON schema — `allocation[]`, `vestingSchedules[]`, `emissionCurve[]`, `sellPressure[]`, `redFlags[]`, plus summary fields
- **Validation:** AI output is validated against business rules before display (e.g., allocations must sum to 100%)

---

## 7. UX/UI Design Principles

Target: a founder who is not a token engineer should be able to generate a professional mintomics model with **zero prior knowledge**. Every design decision serves this goal.

### 7.1 Design Rules (Non-Negotiable)

- **Zero jargon in the UI** — every label has a tooltip explaining what it means in plain English
- **Progressive disclosure** — show only what the user needs at each step, not everything at once
- **< 60 seconds from form submit to results** — if AI takes longer, show real-time progress
- **Mobile-responsive** — many Web3 founders work from phones and tablets
- **Dark mode default** — Web3 audience expectation
- **Charts first** — lead with visuals, not tables. Tables are secondary

### 7.2 Key Screens (MVP)

| Screen | Purpose |
|---|---|
| **Landing Page** | Hero + demo GIF + pricing + 3 testimonials (bootstrap with beta users) + CTA |
| **Onboarding Form** | Step-by-step wizard (3 steps) with progressive disclosure. Progress bar. Tooltip on every critical field. |
| **Loading / Processing** | Animated progress with 'What we're calculating...' copy — reduces perceived wait time |
| **Results Dashboard** | Left: charts (allocation pie, vesting timeline). Right: red flags + recommendations panel. |
| **PDF Preview** | Clean, branded report. Founder's project name on cover. Ready to send to VCs. |
| **Pricing Page** | 3 tiers. Free / Pro $49 / Agency $149. Annual discount (2 months free). |

---

## 8. Pricing & Business Model

### Tiers

| | Free | Pro *(Recommended)* | Agency |
|---|---|---|---|
| **Price** | $0/month | $49/month or $399/year | $149/month or $1,199/year |
| **Projects** | 1 per month | Unlimited | Unlimited + client management |
| **PDF Export** | ✗ | ✓ Full branded report | ✓ |
| **Red Flags Report** | Partial (3 flags) | Full (all flags + recommendations) | Full |
| **Iterations** | Limited | Unlimited regenerations | Unlimited |
| **White-label** | ✗ | ✗ | Post-MVP v2 |
| **API Access** | ✗ | ✗ | Post-MVP v2 |
| **Purpose** | Lead generation | Primary revenue driver | Crypto consultants & advisors |

### Revenue Projections (Conservative)

| Timeline | Users | Est. MRR |
|---|---|---|
| Month 3 (Beta) | 20 Pro users | ~$980 |
| Month 6 | 60 Pro users | ~$2,940 |
| Month 12 | 150 Pro + 10 Agency | ~$8,840 |
| Month 18 | 300 Pro + 25 Agency | ~$18,425 |

---

## 9. Go-To-Market Strategy

### Phase 1 — Beta (Weeks 9–10): 0 to 20 users

- Direct outreach to Web3 founders in personal network — offer free Pro access for 30 days in exchange for feedback
- Post in Token Engineering Community Discord (global Web3 practitioner hub)
- Post in Alliance DAO and Outlier Ventures communities
- One detailed Twitter/X thread: *"I built a mintomics tool that does what a $10K token engineer does for $49/month"*

### Phase 2 — Launch (Week 11–12): ProductHunt + Content

- ProductHunt launch — prepare assets 2 weeks in advance, launch on Tuesday morning UTC
- Post detailed case study: *"Here's a real mintomics model generated by AI — here's what a token engineer said about it"*
- Reddit: r/ethdev, r/CryptoStartups, r/defi — educational posts, not promotional
- YouTube/Twitter demo video: 60-second screen recording of the full flow

### Phase 3 — Growth (Month 3+): SEO + Partnerships

- SEO: target keywords like *"mintomics design"*, *"token allocation template"*, *"vesting schedule generator"*
- Partner with Web3 accelerators — offer their cohort companies free access in exchange for testimonials
- Affiliate program: token engineering consultants earn 20% recurring for referrals

---

## 10. Development Timeline

Based on 4–8 hours per week. Timeline is aggressive but achievable for a senior developer working with AI tools.

| Week | Deliverable |
|---|---|
| **Week 1–2** | AI engine: system prompt + JSON schema + validation logic. Core mintomics knowledge encoded. |
| **Week 3–4** | Onboarding form (3-step wizard) + basic results page. Working end-to-end flow without auth. |
| **Week 5–6** | Charts (Recharts): allocation pie, vesting timeline, emission curve. Sell pressure table. |
| **Week 7** | Auth (Clerk) + database (Vercel Postgres) + project save/load functionality. |
| **Week 8** | Payments (Stripe) + tier gating. PDF export (Pro tier). Free vs Pro feature locks. |
| **Week 9** | Landing page + pricing page + SEO meta. UI polish. Mobile responsiveness. |
| **Week 10** | Beta testing with 5–10 real Web3 founders. Fix critical bugs. Collect feedback. |
| **Week 11–12** | ProductHunt preparation + launch. Reddit posts. Twitter launch thread. |

---

## 11. Success Metrics (KPIs)

These metrics determine whether we continue, pivot, or kill the product. Reviewed monthly.

| Metric | Target (Month 3) |
|---|---|
| Monthly Active Users | 50+ |
| Free → Pro Conversion Rate | > 8% |
| MRR | > $980 |
| Monthly Churn Rate | < 8% |
| NPS Score | > 40 |
| Avg. Time to First Result | < 5 min |
| PDF Downloads (Pro) | > 80% of Pro users |

### Kill Criteria

> If MRR < $500 after 4 months of active marketing → **pivot or kill**.
>
> If free-to-paid conversion < 3% after 100 free signups → pricing or product problem, investigate.
>
> If NPS < 20 after first 20 users → fundamental product-market fit issue.

---

## 12. Risk Register

| Risk | Probability | Mitigation |
|---|---|---|
| AI output quality insufficient for professional use | Medium | Prompt engineering + output validation layer + human review option |
| Market too small (not enough Web3 founders) | Low–Medium | Expand to crypto consultants (Persona B) and adjacent markets |
| Competitor copies the product quickly | Medium | Speed to market + community trust + distribution moat |
| Claude/OpenAI API cost too high per user | Low | Monitor cost/generation, cap free tier usage |
| Web3 market downturn reduces new projects | Medium | Pivot marketing to consultants serving existing projects |

---

## 13. Detailed MVP Requirements

### 13.1 Required Inputs

The MVP form should collect enough context to generate a credible first-pass mintomics model, while keeping the experience lightweight for non-experts.

| Input Group | Fields | Requirement |
|---|---|---|
| **Project Basics** | `projectName`, `tokenSymbol`, `projectType`, `projectDescription` | Required. `projectDescription` must provide enough context for the AI to tailor recommendations. |
| **Supply & Funding** | `totalSupply`, `fundingStage`, `targetRaiseUsd`, `tokenPriceUsd`, `launchTimelineMonths`, `mainUseCase` | Required, except `launchTimelineMonths` can be prefilled with a sensible default. Numeric inputs must be positive. |
| **Allocation Hints** | `teamPercent`, `investorsPercent`, `communityPercent`, `treasuryPercent`, `ecosystemPercent`, `publicSalePercent` | Optional. `0` means "let AI decide". If user enters preferences, the combined total must not exceed 100%. |
| **Vesting Preferences** | `teamCliffMonths`, `teamVestingMonths`, `investorCliffMonths`, `investorVestingMonths` | Optional but prefilled with benchmark defaults. Must stay within valid month ranges. |

### 13.2 Required Outputs

Every successful generation must return a structured result that can be rendered without manual editing.

| Output | Requirement |
|---|---|
| **Allocation Model** | 4-8 allocation categories. Percentages must sum to 100% within rounding tolerance. |
| **Vesting Schedules** | At least team and investor schedules, including cliff, vesting period, TGE unlock, and monthly unlock table. |
| **Emission Curve** | Monthly circulating supply projection for at least 12 months, ideally 48 months for investor-grade reporting. |
| **Sell Pressure Analysis** | Monthly unlocked token value under 3 price scenarios: low, base, high. Each month tagged with a risk level. |
| **Red Flags** | At least 1 issue with severity, explanation, and recommended action. |
| **Executive Summary** | Plain-English summary, key strengths, key risks, and investor readiness score (0-100). |

### 13.3 Validation Rules

- AI output must conform to a strict JSON schema before it can be rendered.
- Allocation totals must validate to 100% before results are shown to the user.
- If validation fails, the system must return a clear retry path instead of displaying broken or partial charts.
- Founder preferences should guide the model, but the system may override clearly unsafe inputs and explain why.
- Sell pressure scenarios should be anchored to transparent assumptions so users can understand the logic.

---

## 14. User Stories & Acceptance Criteria

### Story 1 — Generate a model from scratch

**As a Web3 founder**, I want to complete a short guided wizard so that I can receive a mintomics model without hiring an expert.

**Acceptance Criteria**

- User can move across all 3 steps without losing already entered data.
- Required fields are validated before generation starts.
- Submitting the form triggers AI generation in one clear action.

### Story 2 — Understand the result immediately

**As a founder**, I want to see charts first and explanations second so that I can quickly understand whether the model looks investor-ready.

**Acceptance Criteria**

- Results dashboard shows allocation chart, vesting view, emission curve, sell pressure table, and red flags in one session.
- Executive summary and investor readiness score are visible above the fold on desktop.
- If generation fails, the user sees an error state with a retry action.

### Story 3 — Iterate without starting over

**As a founder**, I want to tweak assumptions and regenerate so that I can compare different token design options quickly.

**Acceptance Criteria**

- Previously entered form values remain editable after a generation.
- Regeneration can be triggered without re-entering the whole project.
- Updated results replace the old version only after the new generation succeeds.

### Story 4 — Export a shareable report

**As a Pro user**, I want to export a clean PDF so that I can send the output to co-founders, advisors, or investors.

**Acceptance Criteria**

- PDF contains project name, generation date, executive summary, charts, and key tables.
- Exported report is readable on desktop and mobile screens.
- Free users who click export are routed to an upgrade flow instead of receiving the file.

### Story 5 — Understand why to upgrade

**As a free user**, I want to understand what additional value Pro unlocks so that the paywall feels justified, not arbitrary.

**Acceptance Criteria**

- Free tier clearly shows what is limited vs. unlocked in Pro.
- Upgrade prompt is shown at the moment of highest intent: full red flags, PDF export, or usage limit reached.
- Billing handoff to Stripe Checkout feels seamless and trustworthy.

---

## 15. Non-Functional Requirements

### 15.1 Performance & Reliability

| Requirement Area | MVP Standard |
|---|---|
| **Time to First Result** | Median user should receive a complete result in under 60 seconds. |
| **Perceived Responsiveness** | Loading state must start immediately and explain what the system is calculating. |
| **Error Handling** | AI, schema, and export failures must show clear recovery messaging. No silent failures. |
| **Availability** | App should remain usable during normal MVP traffic without manual ops intervention. |

### 15.2 Security, Privacy, and Trust

- API keys must never be exposed client-side.
- User projects must be isolated by account once auth and persistence are enabled.
- Mintomics must clearly state that outputs are decision-support materials, not financial advice.
- Sensitive billing and authentication flows should be delegated to trusted third-party infrastructure (Clerk, Stripe).

### 15.3 UX Quality Bar

- Wizard must be fully usable on mobile widths down to 360px.
- Charts must always have a text/table fallback so the data remains understandable.
- Copy must explain mintomics concepts in plain English.
- The UI should prioritize confidence and clarity over "crypto-native complexity".

### 15.4 Observability

- Log AI failures, schema validation failures, export failures, and upgrade drop-offs.
- Track generation latency and completion rate by project type and plan tier.
- Product team should be able to identify where users abandon the flow without reading raw server logs.

---

## 16. Analytics & Instrumentation

### 16.1 Core Events

| Event | When It Fires | Why It Matters |
|---|---|---|
| `landing_viewed` | User opens homepage | Measures acquisition volume |
| `cta_clicked` | User clicks primary CTA | Measures landing page effectiveness |
| `signup_started` | User starts auth flow | Top-of-funnel conversion |
| `signup_completed` | Account created successfully | Activation baseline |
| `wizard_step_completed` | User advances from a form step | Finds friction inside onboarding |
| `generation_started` | User submits wizard | Core intent signal |
| `generation_completed` | Valid result returned | Core success metric |
| `generation_failed` | Generation or validation fails | Reliability metric |
| `paywall_viewed` | User sees upgrade wall | Monetization trigger |
| `upgrade_started` | User clicks billing CTA | Purchase intent |
| `upgrade_completed` | Successful paid conversion | Revenue metric |
| `pdf_exported` | PDF download succeeds | Pro value realization |

### 16.2 MVP Dashboards

- **Acquisition Funnel:** landing view -> CTA -> signup -> first generation
- **Activation Funnel:** generation started -> generation completed -> results viewed -> regeneration
- **Monetization Funnel:** paywall viewed -> upgrade started -> upgrade completed
- **Product Quality Dashboard:** generation latency, validation failure rate, export success rate, churn risk indicators

---

## 17. Launch Readiness Checklist

Mintomics is ready for beta only when all items below are true:

- Prompt + schema produce valid outputs across at least 20 representative project scenarios.
- No critical UI blockers exist in the wizard, results dashboard, or export flow.
- Analytics events are firing correctly for onboarding, generation, and upgrades.
- Pricing page, billing handoff, and Pro gating are tested end-to-end.
- Legal basics are present: Terms, Privacy Policy, and "not financial advice" disclaimer.
- At least 5 beta users have completed the flow and provided feedback.

---

*Mintomics · PRD v1.0 · April 2026 · CONFIDENTIAL*
