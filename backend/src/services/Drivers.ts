import { db } from "../db";

/* ---------- helpers ---------- */

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
    end: end.toISOString().slice(0, 10)
  };
}

/* ---------- service ---------- */

export async function getRevenueDrivers() {
  // 1️⃣ Find latest closed deal to anchor the quarter
  const latestDeal = await dbGet<{ latest: string }>(
    "SELECT MAX(closed_at) as latest FROM deals WHERE closed_at IS NOT NULL"
  );

  if (!latestDeal?.latest) {
    return {
      quarter: null,
      pipeline: { value: 0, dealCount: 0 },
      winRate: { value: null, closedWon: 0, closedLost: 0 },
      averageDealSize: { value: 0 },
      salesCycle: { avgDays: 0 }
    };
  }

  const { label, start, end } = getQuarterInfo(
    new Date(latestDeal.latest)
  );

  /* ---------- Pipeline Size ---------- */
  const pipelineRow = await dbGet<{
    value: number;
    count: number;
  }>(
    `
    SELECT
      SUM(amount) as value,
      COUNT(*) as count
    FROM deals
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
    `
  );

  /* ---------- Win Rate ---------- */
  const winRateRow = await dbGet<{
    won: number;
    lost: number;
  }>(
    `
    SELECT
      SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
      SUM(CASE WHEN stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
    FROM deals
    WHERE stage IN ('Closed Won', 'Closed Lost')
      AND closed_at BETWEEN ? AND ?
    `,
    [start, end]
  );

  const closedWon = winRateRow?.won ?? 0;
  const closedLost = winRateRow?.lost ?? 0;

  const winRate =
    closedWon + closedLost > 0
      ? closedWon / (closedWon + closedLost)
      : null;

  /* ---------- Average Deal Size ---------- */
  const avgDealRow = await dbGet<{ avg: number }>(
    `
    SELECT AVG(amount) as avg
    FROM deals
    WHERE stage = 'Closed Won'
      AND closed_at BETWEEN ? AND ?
    `,
    [start, end]
  );

  /* ---------- Sales Cycle Time ---------- */
  const salesCycleRow = await dbGet<{ avgDays: number }>(
    `
    SELECT AVG(
      julianday(closed_at) - julianday(created_at)
    ) as avgDays
    FROM deals
    WHERE stage = 'Closed Won'
      AND closed_at BETWEEN ? AND ?
    `,
    [start, end]
  );

  return {
    quarter: label,

    pipeline: {
      value: pipelineRow?.value ?? 0,
      dealCount: pipelineRow?.count ?? 0
    },

    winRate: {
      value: winRate,
      closedWon,
      closedLost
    },

    averageDealSize: {
      value: avgDealRow?.avg ?? 0
    },

    salesCycle: {
      avgDays: salesCycleRow?.avgDays
        ? Math.round(salesCycleRow.avgDays)
        : 0
    }
  };
}
