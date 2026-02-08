To make this functional for a CRO, you should treat Q4 2025 (Oct, Nov, Dec) as your "Current Quarter" for the analysis. Why? Because that is the last period where you have both Target data and Actual revenue data to compare against.Here is how you should handle the logic for your /api/summary endpoint:1. Defining "Current Quarter"Since you are currently in Feb 2026 (according to our system time) but targets stop at Dec 2025, you must explicitly state in your THINKING.md:"Analysis is performed on Q4 2025 as it is the most recent period with complete Target vs. Actual data."Logic for Metrics:Current Quarter Revenue: Sum of amount from deals where stage = 'Closed Won' and closed_at falls between 2025-10-01 and 2025-12-31.Target: Sum of target from targets.json for months 2025-10, 2025-11, and 2025-12.Gap (%): $$\frac{\text{Actual Revenue} - \text{Target}}{\text{Target}} \times 100$$(Note: A negative result means you are behind target).QoQ Change: Compare Q4 2025 Revenue vs. Q3 2025 (July–Sept) Revenue.2. Handling the "2026 Deals"The deals closed in March 2026 are your "Pipeline" or "Future Revenue." * In the Summary, don't count them as "Current" revenue.In the Revenue Drivers or Recommendations, use them to show why you might be "ahead" or "behind" (e.g., "High slippage: $X amount of revenue pushed from Q4 2025 into Q1 2026").3. Recommended API StrategyDon't just write raw SQL queries; create a Service Layer to handle the date logic.Example Data Aggregation Logic (Node.js/TS):TypeScript// Define your dates
const Q4_START = '2025-10-01';
const Q4_END = '2025-12-31';
const Q3_START = '2025-07-01';

// 1. Calculate Revenue
const currentRev = deals
  .filter(d => d.stage === 'Closed Won' && d.closed_at >= Q4_START && d.closed_at <= Q4_END)
  .reduce((sum, d) => sum + d.amount, 0);

// 2. Calculate Targets
const currentTarget = targets
  .filter(t => t.month >= '2025-10' && t.month <= '2025-12')
  .reduce((sum, t) => sum + t.target, 0);

// 3. QoQ Change
const prevRev = deals
  .filter(d => d.stage === 'Closed Won' && d.closed_at >= Q3_START && d.closed_at < Q4_START)
  .reduce((sum, d) => sum + d.amount, 0);

const qoqChange = ((currentRev - prevRev) / prevRev) * 100;
4. Next Step: The "Risk Factors" EndpointOnce the summary is done, you need to tackle /api/risk-factors. Since you have activities.json, this is your best friend.How to find a "Stale Deal":Find deals where stage is NOT "Closed Won" or "Closed Lost."Join with activities and find the max(timestamp).If max(timestamp) is more than 30 days ago, flag it as High Risk.