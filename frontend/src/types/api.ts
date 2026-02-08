export interface Summary {
  currentRevenue: number;
  targetRevenue: number;
  gapPercent: number;
  changePercent: number;
}

export interface Drivers {
  pipelineSize: number;
  winRate: number;
  avgDealSize: number;
  salesCycleDays: number;
}

export interface RiskFactor {
  type: "STALE_DEAL" | "REP_PERFORMANCE" | "LOW_ACTIVITY";
  label: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface Recommendation {
  message: string;
}
