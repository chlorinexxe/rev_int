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

/* ---------- date helpers ---------- */

function getQuarterInfo(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
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

function getPreviousQuarterInfo(date: Date) {
  const prev = new Date(date);
  prev.setMonth(prev.getMonth() - 3);
  return getQuarterInfo(prev);
}

/* ---------- service ---------- */

export async function getSummary() {
  // 1️⃣ Check deals exist
  const countRow = await dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM deals"
  );

  if (!countRow || countRow.count === 0) {
    return {
      quarter: null,
      currentQuarterRevenue: 0,
      target: 0,
      gapPercent: 0,
      qoqChangePercent: null
    };
  }

  // 2️⃣ Latest closed deal
  const latestDeal = await dbGet<{ latest: string }>(
    "SELECT MAX(closed_at) as latest FROM deals WHERE closed_at IS NOT NULL"
  );

  if (!latestDeal?.latest) {
    return {
      quarter: null,
      currentQuarterRevenue: 0,
      target: 0,
      gapPercent: 0,
      qoqChangePercent: null
    };
  }

  const latestDate = new Date(latestDeal.latest);
  const currentQuarter = getQuarterInfo(latestDate);
  const prevQuarter = getPreviousQuarterInfo(latestDate);

  // 3️⃣ Current quarter revenue
  const revenueRow = await dbGet<{ revenue: number }>(
    `
    SELECT SUM(amount) as revenue
    FROM deals
    WHERE stage = 'Closed Won'
      AND closed_at BETWEEN ? AND ?
    `,
    [currentQuarter.start, currentQuarter.end]
  );
  console.log("Current Quarter:", currentQuarter );
  console.log("Revenue Row:", revenueRow);
  console.log("prevQuarter:", prevQuarter);

  const revenue = revenueRow?.revenue ?? 0;

  // 4️⃣ Target
  const quarterMonths: string[] = [];
  const startDate = new Date(currentQuarter.start);

  for (let i = 0; i < 3; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    quarterMonths.push(d.toISOString().slice(0, 7));
  }

  const targetRow = await dbGet<{ target: number }>(
    `
    SELECT SUM(target) as target
    FROM targets
    WHERE month IN (${quarterMonths.map(() => "?").join(",")})
    `,
    quarterMonths
  );
  console.log("Target Row:", targetRow);
  console.log("quarterMonths:", quarterMonths);
  console.log("Quarter Months Placeholders:",quarterMonths);


  const target = targetRow?.target ?? 0;

  const gapPercent =
    target > 0 ? ((revenue - target) / target) * 100 : 0;

  // 5️⃣ QoQ
  const prevRevenueRow = await dbGet<{ revenue: number }>(
    `
    SELECT SUM(amount) as revenue
    FROM deals
    WHERE stage = 'Closed Won'
      AND closed_at BETWEEN ? AND ?
    `,
    [prevQuarter.start, prevQuarter.end]
  );

  const prevRevenue = prevRevenueRow?.revenue ?? 0;

  const qoqChangePercent =
    prevRevenue > 0
      ? ((revenue - prevRevenue) / prevRevenue) * 100
      : null;

  return {
    quarter: currentQuarter.label,
    currentQuarterRevenue: revenue,
    target,
    gapPercent,
    qoqChangePercent
  };
}
