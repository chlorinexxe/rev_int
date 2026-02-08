import { db } from "../db";

function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

/* ---------- date helpers ---------- */
function getQuarterInfo(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth + 1, 0);
  return {
    label: `Q${quarter} ${year}`,
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/* ---------- service ---------- */
export async function getRiskFactors() {
  const latestDeal = await dbGet<{ latest: string }>(
    "SELECT MAX(COALESCE(closed_at, created_at)) as latest FROM deals"
  );

  if (!latestDeal?.latest) {
    return {
      staleDeals: { count: 0, thresholdDays: 30, items: [] },
      underperformingReps: { count: 0, items: [] },
      lowActivityAccounts: { count: 0, thresholdDays: 30, items: [] },
    };
  }

  const { start, end } = getQuarterInfo(new Date(latestDeal.latest));

  /* ================= STALE DEALS ================= */
  const staleDeals = await dbAll<{
    deal_id: string;
    dealName: string;
    account_id: string;
    accountName: string;
    stage: string;
    amount: number;
    daysSinceActivity: number;
  }>(`
    SELECT
      d.deal_id,
      d.deal_id AS dealName,
      d.account_id,
      ac.name AS accountName,
      d.stage,
      d.amount,
      CAST(
        julianday('now') - julianday(
          COALESCE(MAX(a.timestamp), d.created_at)
        ) AS INTEGER
      ) AS daysSinceActivity
    FROM deals d
    LEFT JOIN activities a ON d.deal_id = a.deal_id
    LEFT JOIN accounts ac ON d.account_id = ac.account_id
    WHERE d.stage NOT IN ('Closed Won', 'Closed Lost')
    GROUP BY d.deal_id
    HAVING daysSinceActivity > 30
    ORDER BY daysSinceActivity DESC
  `);

  /* ================= UNDERPERFORMING REPS ================= */
  const underperformingReps = await dbAll<{
    rep_id: string;
    repName: string;
    revenue: number;
    target: number;
    percentOfTarget: number;
  }>(
    `
    SELECT
      r.rep_id,
      r.name AS repName,
      SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END) AS revenue,
      COALESCE(SUM(t.target), 0) AS target,
      CASE
        WHEN COALESCE(SUM(t.target), 0) > 0
        THEN ROUND(
          (SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END) * 100.0)
          / SUM(t.target),
          1
        )
        ELSE 0
      END AS percentOfTarget
    FROM reps r
    LEFT JOIN deals d ON d.rep_id = r.rep_id
      AND d.closed_at BETWEEN ? AND ?
    LEFT JOIN targets t
      ON t.month IN (
        strftime('%Y-%m', ?),
        strftime('%Y-%m', date(?, '+1 month')),
        strftime('%Y-%m', date(?, '+2 month'))
      )
    GROUP BY r.rep_id
    HAVING percentOfTarget < 80
    ORDER BY percentOfTarget ASC
    `,
    [start, end, start, start, start]
  );

  /* ================= LOW ACTIVITY ACCOUNTS ================= */
  const lowActivityAccounts = await dbAll<{
    account_id: string;
    accountName: string;
    lastActivity: string | null;
    activityCount: number;
    daysSinceLastActivity: number | null;
  }>(`
    SELECT
      ac.account_id,
      ac.name AS accountName,
      MAX(a.timestamp) AS lastActivity,
      COUNT(a.activity_id) AS activityCount,
      CAST(
        julianday('now') - julianday(MAX(a.timestamp))
        AS INTEGER
      ) AS daysSinceLastActivity
    FROM accounts ac
    LEFT JOIN deals d ON d.account_id = ac.account_id
    LEFT JOIN activities a ON a.deal_id = d.deal_id
    GROUP BY ac.account_id
    HAVING
      lastActivity IS NULL
      OR daysSinceLastActivity > 30
      OR activityCount < 3
    ORDER BY activityCount ASC
  `);

  return {
    staleDeals: {
      count: staleDeals.length,
      thresholdDays: 30,
      items: staleDeals,
    },
    underperformingReps: {
      count: underperformingReps.length,
      items: underperformingReps,
    },
    lowActivityAccounts: {
      count: lowActivityAccounts.length,
      thresholdDays: 30,
      items: lowActivityAccounts,
    },
  };
}
