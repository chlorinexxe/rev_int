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
  // Latest deal to determine quarter
  const latestDeal = await dbGet<{ latest: string }>(
    "SELECT MAX(closed_at) as latest FROM deals WHERE closed_at IS NOT NULL"
  );
  if (!latestDeal?.latest) {
    return { staleDeals: [], underperformingReps: [], lowActivityAccounts: [] };
  }

  const { start, end } = getQuarterInfo(new Date(latestDeal.latest));

  /* ---------- Stale Deals ---------- */
  // deals not updated via activity in last 30 days
  const staleDeals = await dbAll<{
    deal_id: string;
    account_id: string;
    rep_id: string;
    stage: string;
    daysSinceUpdate: number;
  }>(
    `
    SELECT d.deal_id, d.account_id, d.rep_id, d.stage,
      CAST(julianday('now') - julianday(
        COALESCE(a.last_activity, d.created_at)
      ) AS INTEGER) AS daysSinceUpdate
    FROM deals d
    LEFT JOIN (
      SELECT deal_id, MAX(timestamp) AS last_activity
      FROM activities
      GROUP BY deal_id
    ) a ON d.deal_id = a.deal_id
    WHERE d.stage NOT IN ('Closed Won', 'Closed Lost')
      AND (julianday('now') - julianday(COALESCE(a.last_activity, d.created_at))) > 30
    ORDER BY daysSinceUpdate DESC
    LIMIT 50
    `
  );

  /* ---------- Underperforming Reps ---------- */
  const underperformingReps = await dbAll<{
    rep_id: string;
    revenue: number;
    target: number;
    percentOfTarget: number;
  }>(
    `
    SELECT d.rep_id,
           SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END) AS revenue,
           COALESCE(SUM(t.target),0) AS target,
           CASE WHEN COALESCE(SUM(t.target),0) > 0 THEN
             (SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END) * 100.0) / SUM(t.target)
           ELSE 0 END AS percentOfTarget
    FROM deals d
    LEFT JOIN targets t
      ON t.month IN (
           strftime('%Y-%m', ?),
           strftime('%Y-%m', date(?, '+1 month')),
           strftime('%Y-%m', date(?, '+2 month'))
         )
    WHERE d.closed_at BETWEEN ? AND ?
    GROUP BY d.rep_id
    HAVING percentOfTarget < 80
    ORDER BY percentOfTarget ASC
    LIMIT 20
    `,
    [start, start, start, start, end]
  );

  /* ---------- Low Activity Accounts ---------- */
  const lowActivityAccounts = await dbAll<{
    account_id: string;
    accountName: string;
    recentActivity: number;
  }>(
    `
    SELECT d.account_id,
           MAX(a.timestamp) AS last_activity,
           COUNT(a.activity_id) AS recentActivity,
           MAX(ac.name) AS accountName
    FROM deals d
    LEFT JOIN activities a ON d.deal_id = a.deal_id
    LEFT JOIN accounts ac ON d.account_id = ac.account_id
    WHERE julianday('now') - julianday(a.timestamp) <= 30
    GROUP BY d.account_id
    HAVING recentActivity < 3
    ORDER BY recentActivity ASC
    LIMIT 50
    `
  );

  return { staleDeals, underperformingReps, lowActivityAccounts };
}
