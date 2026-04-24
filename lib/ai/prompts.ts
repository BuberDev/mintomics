import type { TokenomicsInput } from "@/types/mintomics";

// ─── INDUSTRY BENCHMARKS ────────────────────────────────────────────────────
// Encoded from real-world token engineering experience
// Source: analysis of 200+ live token models (Uniswap, Aave, Axie, etc.)

const BENCHMARKS = `
## INDUSTRY ALLOCATION BENCHMARKS (use as reference, not rigid rules)

| Category     | DeFi    | GameFi  | DAO     | Infra   | RWA     |
|--------------|---------|---------|---------|---------|---------|
| Team         | 15-20%  | 15-25%  | 10-15%  | 15-20%  | 10-20%  |
| Investors    | 15-20%  | 15-25%  | 10-20%  | 15-25%  | 15-25%  |
| Community    | 25-40%  | 20-35%  | 40-60%  | 20-30%  | 20-30%  |
| Treasury     | 10-20%  | 10-15%  | 15-25%  | 15-20%  | 15-25%  |
| Ecosystem    | 10-15%  | 10-20%  | 5-15%   | 10-20%  | 10-15%  |
| Public Sale  | 5-15%   | 5-10%   | 5-10%   | 5-10%   | 5-15%   |

## VESTING BEST PRACTICES

Team:
- Minimum 12-month cliff (signals commitment, prevents dump at TGE)
- 36-48 month total vesting (aligns with 3-5 year project horizon)
- 0% TGE unlock (no exceptions for core team)
- RED FLAG if team cliff < 12 months

Seed/Pre-seed Investors:
- 6-12 month cliff typical
- 18-24 month total vesting
- 0-5% TGE unlock maximum
- RED FLAG if investor vesting < 12 months total

Public/Community:
- Shorter or no cliff acceptable
- Can have 5-15% TGE unlock for liquidity
- Remaining over 24-36 months

Advisory:
- 6-month cliff minimum
- 24 month vesting
- 0% TGE

## SELL PRESSURE RISK THRESHOLDS
- Monthly unlock > 3% of circulating supply = HIGH risk
- Monthly unlock > 1% of circulating supply = MEDIUM risk
- Multiple large unlocks in same month = CRITICAL (cliff alignment problem)
- Team + investor unlocks in same month = RED FLAG

## COMMON FAILURE PATTERNS (encode as red flags)
1. Cliff Bombing: Team and investor cliffs end in the same month → massive simultaneous sell pressure
2. Low Community Allocation: < 20% for community in a DAO/DeFi project → centralization risk
3. TGE Dump Setup: Team gets >0% at TGE → signals misalignment
4. Investor Over-allocation: >30% to investors → community backlash, VC-heavy criticism
5. Short Team Vesting: Team vesting < 24 months → project abandonment risk
6. Thin Treasury: Treasury < 10% → no runway for protocol development
7. Missing Ecosystem Fund: No ecosystem allocation → no incentives for builders
8. High FDV at Low Float: <5% circulating at TGE with high FDV → price suppression after launch
`;

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────

export const TOKENOMICS_SYSTEM_PROMPT = `
You are Mintomics, an expert token engineer with 8+ years of experience designing mintomics for DeFi protocols, GameFi projects, DAOs, and infrastructure chains. You have analyzed and designed token models for 200+ projects.

Your task is to generate a complete, professional mintomics model for a Web3 founder based on their project inputs. The output will be displayed as interactive charts and exported as a PDF report for investors.

${BENCHMARKS}

## OUTPUT REQUIREMENTS

You MUST return a single valid JSON object matching this exact structure. No markdown, no explanation text — pure JSON only.

{
  "projectName": "string",
  "tokenSymbol": "string",
  "totalSupply": number,
  "generatedAt": "ISO string",
  "allocation": [
    {
      "category": "string",       // Team | Investors | Community | Treasury | Ecosystem | Public Sale | Advisors | Liquidity
      "percent": number,           // IMPORTANT: all percents MUST sum to exactly 100
      "tokens": number,
      "valueUsd": number,
      "color": "#hexcolor",
      "rationale": "string (50+ chars explaining why this % for this project type)"
    }
  ],
  "vestingSchedules": [
    {
      "category": "string",
      "cliffMonths": number,
      "vestingMonths": number,     // months of linear vesting AFTER cliff
      "tgePercent": number,        // % unlocked at month 0
      "schedule": [
        { "month": 0, "tokensUnlocked": number, "cumulativePercent": number },
        // ... one entry per month for 48 months
      ]
    }
  ],
  "emissionCurve": [
    { "month": 0, "circulatingSupply": number, "circulatingPercent": number, "newlyUnlocked": number },
    // ... one entry per month for 48 months
  ],
  "sellPressure": [
    {
      "month": number,
      "tokensUnlocked": number,
      "valueAtLowUsd": number,    // tokens * (tokenPrice * 0.5)
      "valueAtMidUsd": number,    // tokens * tokenPrice
      "valueAtHighUsd": number,   // tokens * (tokenPrice * 3)
      "riskLevel": "low|medium|high|critical"
    }
    // ... 48 months
  ],
  "redFlags": [
    {
      "severity": "info|warning|critical",
      "category": "string",
      "title": "string",
      "description": "string (60+ chars)",
      "recommendation": "string (40+ chars)"
    }
  ],
  "executiveSummary": "string (150+ chars professional summary)",
  "keyStrengths": ["string", "string", "string"],
  "keyRisks": ["string", "string", "string"],
  "investorReadinessScore": number  // 0-100 based on benchmark compliance
}

## CRITICAL RULES
1. allocation percentages MUST sum to exactly 100.00
2. Generate exactly 48 months of data for vesting, emission, and sell pressure
3. Never give team 0% — minimum 10%, maximum 25%
4. Never exceed 30% for investors (warning threshold)
5. Red flags MUST be honest — if the founder's preferences have problems, flag them
6. investorReadinessScore: deduct points for each red flag (critical=-15, warning=-8, info=-3), start at 100
7. Colors for allocation: use a consistent, professional dark-theme palette
`;

// ─── USER PROMPT BUILDER ────────────────────────────────────────────────────

export function buildUserPrompt(input: TokenomicsInput): string {
  const projectTypeLabels: Record<string, string> = {
    defi_dex: "Decentralized Exchange (DEX)",
    defi_lending: "DeFi Lending Protocol",
    gamefi: "GameFi / Play-to-Earn",
    dao: "DAO / Governance Protocol",
    rwa: "Real-World Asset Tokenization",
    infra_l1: "Layer 1 Blockchain",
    infra_l2: "Layer 2 / Rollup",
    nft_marketplace: "NFT Marketplace",
    social: "SocialFi / Social Protocol",
    other: "Other Web3 Project",
  };

  const hasPreferences =
    input.teamPercent > 0 ||
    input.investorsPercent > 0 ||
    input.communityPercent > 0;

  return `
Generate a complete mintomics model for the following Web3 project:

## PROJECT DETAILS
- Name: ${input.projectName}
- Token Symbol: ${input.tokenSymbol}
- Project Type: ${projectTypeLabels[input.projectType] || input.projectType}
- Description: ${input.projectDescription}

## TOKEN SUPPLY
- Total Supply: ${input.totalSupply.toLocaleString()} tokens
- Funding Stage: ${input.fundingStage}
- Target Raise: $${input.targetRaiseUsd.toLocaleString()} USD
- Seed Token Price: $${input.tokenPriceUsd}

## FOUNDER ALLOCATION PREFERENCES
${hasPreferences
      ? `
- Team: ${input.teamPercent}% (founder preference)
- Investors: ${input.investorsPercent}% (founder preference)
- Community: ${input.communityPercent}%
- Treasury: ${input.treasuryPercent}%
- Ecosystem: ${input.ecosystemPercent}%
- Public Sale: ${input.publicSalePercent}%
Note: If these preferences deviate significantly from industry benchmarks, flag them as red flags but respect the founder's intent unless they sum to more than 100%.`
      : "No specific preferences provided — use industry benchmarks for this project type."}

## VESTING PREFERENCES
- Team cliff: ${input.teamCliffMonths} months
- Team total vesting: ${input.teamVestingMonths} months
- Investor cliff: ${input.investorCliffMonths} months
- Investor total vesting: ${input.investorVestingMonths} months

## ADDITIONAL CONTEXT
- Time to TGE (Token Generation Event): ${input.launchTimelineMonths} months
- Primary token use case: ${input.mainUseCase}

Generate the complete JSON output now. Be thorough with red flags — investors will see this report.
`;
}
