import { Router } from "express";
import { getSummary } from "../services/summaryService";
import { getRevenueDrivers } from "../services/Drivers";
import { getRiskFactors } from "../services/riskFactors";
import { getRecommendations } from "../services/Recommendations";
import { getRevenueTrend } from "../services/Revenue";
const router = Router();

router.get("/summary", async (_req, res) => {
  const summary = await getSummary();
  res.json(summary);
});

router.get("/drivers", async (_req, res) => {
  const drivers = await getRevenueDrivers();
  res.json(drivers);
});

router.get("/risk-factors", async (_req, res) => {
  const riskFactors = await getRiskFactors();
  res.json(riskFactors);
});
router.get("/recommendations", async (_req, res) => {
  const recommendations = await getRecommendations();
  res.json(recommendations);
});

router.get("/revenue-trend", async (_req, res) => {
  const trend = await getRevenueTrend();
  res.json(trend);
});
export default router;
