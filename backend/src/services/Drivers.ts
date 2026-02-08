import { db } from "../db";

function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

async function getTargetYear(): Promise<number> {
  const rows = await dbAll<{ month: string }>("SELECT month FROM targets ORDER BY month DESC LIMIT 1");
  if (rows.length === 0) throw new Error("No targets data");
  return parseInt(rows[0].month.split("-")[0], 10);
}

function generateYearMonths(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

export async function getRevenueDrivers() {
  const year = await getTargetYear();

  const months = generateYearMonths(year);

  // 1. Pipeline values per month (sum of open deals created before or on month end)
  const pipelineRows = await dbAll<{
    month: string;
    pipelineValue: number;
  }>(
    `
    SELECT
      strftime('%Y-%m', created_at) AS month,
      SUM(amount) AS pipelineValue
    FROM deals
    WHERE stage IN ('Prospecting', 'Negotiation')
      AND created_at <= date(?, 'start of month', '+1 month', '-1 day')
    GROUP BY month
    `,
    [year + "-12-31"]
  );

  // Map pipeline by month, but this query only returns months with created_at dates, need full 12 months
  const pipelineMap = new Map<string, number>();
  for (const row of pipelineRows) {
    pipelineMap.set(row.month, row.pipelineValue ?? 0);
  }

  // 2. Closed deals stats grouped by closed_at month: winAmount, lostAmount, avgDealSize, avgSalesCycle
  const closedDealsRows = await dbAll<{
    month: string;
    wonAmount: number;
    lostAmount: number;
    avgDealSize: number;
    avgSalesCycleDays: number;
  }>(
    `
    SELECT
      strftime('%Y-%m', closed_at) AS month,
      SUM(CASE WHEN stage = 'Closed Won' THEN amount ELSE 0 END) AS wonAmount,
      SUM(CASE WHEN stage = 'Closed Lost' THEN amount ELSE 0 END) AS lostAmount,
      AVG(CASE WHEN stage = 'Closed Won' THEN amount ELSE NULL END) AS avgDealSize,
      AVG(CASE WHEN stage = 'Closed Won' THEN julianday(closed_at) - julianday(created_at) ELSE NULL END) AS avgSalesCycleDays
    FROM deals
    WHERE stage IN ('Closed Won', 'Closed Lost')
      AND closed_at BETWEEN ? AND ?
    GROUP BY month
    `,
    [`${year}-01-01`, `${year}-12-31`]
  );

  // Map closed deals stats by month
  const closedMap = new Map<string, typeof closedDealsRows[0]>();
  for (const row of closedDealsRows) {
    closedMap.set(row.month, row);
  }

  // Build final array per month for whole year
  const monthly = months.map((month) => {
    const closed = closedMap.get(month);
    const wonAmount = closed?.wonAmount ?? 0;
    const lostAmount = closed?.lostAmount ?? 0;
    const winRate = wonAmount + lostAmount > 0 ? wonAmount / (wonAmount + lostAmount) : null;

    return {
      month,
      pipelineValue: pipelineMap.get(month) ?? 0,
      winRate,
      avgDealSize: closed?.avgDealSize ?? 0,
      salesCycleDays: closed?.avgSalesCycleDays ? Math.round(closed.avgSalesCycleDays) : 0
    };
  });

  return {
    year,
    monthly
  };
}
