import type { TokenomicsInput } from "@/types/mintomics";

export function createDefaultTokenomicsInput(): TokenomicsInput {
  return {
    projectName: "",
    projectType: "defi_dex",
    projectDescription: "",
    totalSupply: 1_000_000_000,
    tokenSymbol: "",
    fundingStage: "seed",
    targetRaiseUsd: 2_000_000,
    tokenPriceUsd: 0.05,
    teamPercent: 0,
    investorsPercent: 0,
    communityPercent: 0,
    treasuryPercent: 0,
    ecosystemPercent: 0,
    publicSalePercent: 0,
    teamCliffMonths: 12,
    teamVestingMonths: 36,
    investorCliffMonths: 6,
    investorVestingMonths: 24,
    launchTimelineMonths: 6,
    mainUseCase: "",
  };
}
