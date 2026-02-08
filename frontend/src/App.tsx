// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import { api } from "./api/client";
import SummaryCards from "./components/SummaryCards";
import DriversChart from "./components/DriversChart";
import RiskTable from "./components/RiskTable";
import Recommendations from "./components/Recommendations";
import RevenueTrend from "./components/RevenueTrend";
import {
  Container,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";

/* ================= TYPES ================= */

interface SummaryApiResponse {
  quarter: string;
  currentQuarterRevenue: number;
  target: number;
  gapPercent: number;
  qoqChangePercent: number;
}

/* ----- Risk Factors API types ----- */

interface StaleDeal {
  deal_id: string;
  dealName?: string;
  accountName: string;
  amount: number;
  daysSinceActivity: number;
}

interface UnderperformingRep {
  rep_id: string;
  repName: string;
  revenue: number;
  target: number;
  percentOfTarget: number;
}

interface LowActivityAccount {
  account_id: string;
  accountName: string;
  activityCount: number;
  daysSinceLastActivity: number | null;
}

interface RiskFactorsApiResponse {
  staleDeals: StaleDeal[];
  underperformingReps: UnderperformingRep[];
  lowActivityAccounts: LowActivityAccount[];
}

/* ================= APP ================= */

function App() {
  const [summary, setSummary] = useState<any>(null);
  const [drivers, setDrivers] = useState<any>(null);
  const [riskFactors, setRiskFactors] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          rawSummary,
          driversData,
          rawRiskData,
          recData,
        ] = await Promise.all([
          api.getSummary(),
          api.getDrivers(),
          api.getRiskFactors(),
          api.getRecommendations(),
        ]);

        /* ================= SUMMARY ================= */

        const summaryData = rawSummary as SummaryApiResponse;

        setSummary({
          quarter: summaryData.quarter,
          currentRevenue: summaryData.currentQuarterRevenue ?? 0,
          targetRevenue: summaryData.target ?? 0,
          gapPercent: summaryData.gapPercent ?? 0,
          changeQoQ: summaryData.qoqChangePercent ?? 0,
        });

        /* ================= RISK FACTORS ================= */

        const riskData = rawRiskData as RiskFactorsApiResponse;

        setRiskFactors({
          staleDeals: {
            count: riskData.staleDeals?.length ?? 0,
            thresholdDays: 30,
            items: riskData.staleDeals ?? [],
          },
          underperformingReps: {
            count: riskData.underperformingReps?.length ?? 0,
            items: riskData.underperformingReps ?? [],
          },
          lowActivityAccounts: {
            count: riskData.lowActivityAccounts?.length ?? 0,
            thresholdDays: 14,
            items: riskData.lowActivityAccounts ?? [],
          },
        });

        setDrivers(driversData);
        setRecommendations(recData);

      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Container sx={{ padding: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading Revenue Intelligence Console...
        </Typography>
      </Container>
    );
  }

  /* ================= RENDER ================= */

  return (
    <Container maxWidth="xl" sx={{ padding: 3 }}>

      {/* ================= SUMMARY ================= */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {summary && <SummaryCards {...summary} />}
        </Grid>
      </Grid>

      {/* ================= MAIN CONTENT ================= */}
      <Grid container spacing={3} sx={{ marginTop: 1 }}>

        {/* LEFT COLUMN – Drivers */}
        <Grid item xs={12} md={3}>
          {drivers && <DriversChart monthly={drivers.monthly} />}
        </Grid>

        {/* RIGHT AREA – Risk, Reco, Trend */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>

            {/* Row 1 */}
            <Grid item xs={12} md={6}>
              {riskFactors && (
                <RiskTable
                  staleDeals={riskFactors.staleDeals}
                  underperformingReps={riskFactors.underperformingReps}
                  lowActivityAccounts={riskFactors.lowActivityAccounts}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {recommendations && (
                <Recommendations recommendations={recommendations} />
              )}
            </Grid>

            {/* Row 2 – Revenue Trend (FIXED POSITION) */}
            <Grid item xs={12}>
              {drivers && (
                <RevenueTrend data={drivers.monthly.slice(-6)} />
              )}
            </Grid>

          </Grid>
        </Grid>

      </Grid>

    </Container>
  );
}

export default App;
