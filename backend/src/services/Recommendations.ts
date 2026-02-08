import { getRiskFactors } from "./riskFactors";

/* ---------- main recommendations service ---------- */
export async function getRecommendations() {
  const recommendations: string[] = [];

  const risks = await getRiskFactors();

  /* ================= STALE DEALS ================= */
  if (risks.staleDeals.count > 0) {
    const veryStale = risks.staleDeals.items.filter(
      d => d.daysSinceActivity > 45
    );

    recommendations.push(
      veryStale.length > 0
        ? `Urgently review ${veryStale.length} deals idle for over 45 days`
        : `Focus on ${risks.staleDeals.count} stale deals with no recent activity`
    );
  }

  /* ================= UNDERPERFORMING REPS ================= */
  if (risks.underperformingReps.count > 0) {
    const criticalReps = risks.underperformingReps.items.filter(
      r => r.percentOfTarget < 50
    );

    criticalReps.slice(0, 2).forEach(rep => {
      recommendations.push(
        `Coach ${rep.repName} to improve performance (${rep.percentOfTarget}% of target)`
      );
    });
  }

  /* ================= LOW ACTIVITY ACCOUNTS ================= */
  if (risks.lowActivityAccounts.count > 0) {
    const worstAccounts = risks.lowActivityAccounts.items
      .filter(a => a.activityCount < 2)
      .slice(0, 1);

    worstAccounts.forEach(acc => {
      recommendations.push(
        `Increase engagement with ${acc.accountName} (very low recent activity)`
      );
    });
  }

  /* ================= FALLBACK ================= */
  if (recommendations.length === 0) {
    recommendations.push(
      "Pipeline execution is healthy — maintain current momentum"
    );
  }

  return recommendations.slice(0, 7);
}
