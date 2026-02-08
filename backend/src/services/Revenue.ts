// backend/src/services/revenue.ts
import { db } from "../db";

function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

// Helper: last 6 months
async function getLast6Months(): Promise<{ month: string; target: number }[]> {
  const rows = await dbAll<{ month: string; target: number }>(
    `SELECT month, target FROM targets ORDER BY month DESC LIMIT 6`
  );
  return rows.reverse(); // chronological order
}

export async function getRevenueTrend() {
  const last6Months = await getLast6Months();
  if (!last6Months || last6Months.length === 0) return { months: [], legend: [] };

  const result = [];

  for (const t of last6Months) {
    const [year, month] = t.month.split("-");
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;

    const revenueRow = await dbAll<{ revenue: number }>(
      `SELECT SUM(amount) as revenue
       FROM deals
       WHERE stage = 'Closed Won' AND closed_at BETWEEN ? AND ?`,
      [start, end]
    );

    const revenue = revenueRow[0]?.revenue ?? 0;
    const gap = revenue - t.target;

    result.push({
      month: t.month,
      revenue,
      target: t.target,
      gap,
    });
  }

  const legend = [
    { key: 'revenue', label: 'Revenue', color: '#1976d2' },
    { key: 'target', label: 'Target', color: '#ff9800' },
    { key: 'gap', label: 'Gap', color: '#d32f2f' },
  ];

  return { months: result, legend };
}
