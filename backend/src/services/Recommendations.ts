import { getRiskFactors } from "./riskFactors";

/* ---------- db helpers (only if needed for extra queries) ---------- */
function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    import("../db").then(({ db }) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  });
}

/* ---------- main recommendations service ---------- */
export async function getRecommendations() {
  const recommendations: string[] = [];

  // 1️⃣ Get risk factors
  const risks = await getRiskFactors();

  // 2️⃣ Focus on stale deals older than 30 days
  const staleDeals30 = risks.staleDeals.filter(d => d.daysSinceUpdate > 30);
  if (staleDeals30.length > 0) {
    recommendations.push(
      `Focus on ${staleDeals30.length} deals older than 30 days`
    );
  }

  // 3️⃣ Coach underperforming reps (<50% target)
  risks.underperformingReps.forEach(rep => {
    if (rep.percentOfTarget < 50) {
      recommendations.push(`Coach Rep ${rep.rep_id} to improve win rate`);
    }
  });

  // 4️⃣ Increase activity for low-activity accounts
  risks.lowActivityAccounts.forEach(acc => {
    recommendations.push(
      `Increase engagement for account ${acc.accountName} (recent activity: ${acc.recentActivity})`
    );
  });

  // 5️⃣ Prioritize negotiation deals at risk of delay
  const lowRevenueNegotiations = risks.staleDeals.filter(
    d => d.stage === "Negotiation" && d.daysSinceUpdate > 30
  );
  if (lowRevenueNegotiations.length > 0) {
    recommendations.push(
      `Prioritize ${lowRevenueNegotiations.length} Negotiation deals at risk of delay`
    );
  }

  // Limit to max 5 recommendations
  return recommendations.slice(0, 5);
}
