import { db } from "../db";

function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

/* ---------- helper to get last 6 target months ---------- */
async function getLast6Months(): Promise<{ month: string; target: number }[]> {
  const rows = await dbAll<{ month: string; target: number }>(
    `
    SELECT month, target
    FROM targets
    ORDER BY month DESC
    LIMIT 6
    `
  );
  // Reverse to get chronological order
  return rows.reverse();
}

/* ---------- get revenue trend ---------- */
export async function getRevenueTrend() {
  const last6Months = await getLast6Months();
  if (!last6Months || last6Months.length === 0) return { months: [] };

  const monthStartEnd = last6Months.map((t) => {
    const [year, month] = t.month.split("-");
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`; // simple month-end approximation
    return { month: t.month, start, end, target: t.target };
  });

  // Build array to hold final data
  const result = [];

  for (const m of monthStartEnd) {
    // Sum of closed won deals for that month
    const revenueRow = await dbAll<{ revenue: number }>(
      `
      SELECT SUM(amount) as revenue
      FROM deals
      WHERE stage = 'Closed Won'
        AND closed_at BETWEEN ? AND ?
      `,
      [m.start, m.end]
    );

    const revenue = revenueRow[0]?.revenue ?? 0;
    const gap = revenue - m.target;

    result.push({
      month: m.month,
      revenue,
      target: m.target,
      gap
    });
  }

  return { months: result };
}
