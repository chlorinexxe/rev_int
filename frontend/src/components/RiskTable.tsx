import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

/* ================= TYPES ================= */

interface StaleDeal {
  deal_id: string;
  dealName?: string;
  accountName: string;
  amount: number;
  daysSinceActivity: number;
}

interface UnderperformingRep {
  rep_id: string;
  repName: string;
  revenue: number;
  target: number;
  percentOfTarget: number;
}

interface LowActivityAccount {
  account_id: string;
  accountName: string;
  activityCount: number;
  daysSinceLastActivity: number | null;
}

interface RiskTableProps {
  staleDeals: {
    items: { count: number; thresholdDays: number; items: StaleDeal[] };
  };
  underperformingReps: {
    items: { count: number; items: UnderperformingRep[] };
  };
  lowActivityAccounts: {
    items: { count: number; thresholdDays: number; items: LowActivityAccount[] };
  };
}

/* ================= HELPERS ================= */

const formatCurrency = (val: number) =>
  `$${val.toLocaleString()}`;

const safeArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? val : [];

/* ================= COMPONENT ================= */

const RiskTable: React.FC<RiskTableProps> = ({
  staleDeals,
  underperformingReps,
  lowActivityAccounts,
}) => {
  // Extract the count from within the `items` object for each category
  const staleCount = staleDeals.items.count;
  const repCount = underperformingReps.items.count;
  const accountCount = lowActivityAccounts.items.count;

  // Extract the items for rendering
  const staleItems = safeArray<StaleDeal>(staleDeals.items.items || []);
  const repItems = safeArray<UnderperformingRep>(underperformingReps.items.items || []);
  const accountItems = safeArray<LowActivityAccount>(lowActivityAccounts.items.items || []);


  return (
    <Card>
      <CardContent sx={{ p: 1 }}> {/* Reduced padding for the whole content */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          ⚠️ Risk Factors
        </Typography>

        {/* ================= STALE DEALS ================= */}
        <Box mb={0.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ mb: 0 }}>
              Stale Deals
            </Typography>
            <Chip
              label={staleCount}
              color={staleCount > 0 ? "error" : "success"}
              size="small"
              sx={{ marginLeft: 0 }}
            />
          </Box>

          {/* Display No activity only when daysSinceActivity exceeds thresholdDays */}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {staleCount > 0 ? 
              `No activity for ${staleDeals.items.thresholdDays}+ days` : 
              "No stale deals 🎉"
            }
          </Typography>

          <List dense sx={{ p: 0, m: 0 }}>
            {staleCount > 0 ? (
              staleItems.slice(0, 1).map((deal) => (
                <ListItem key={deal.deal_id} disableGutters sx={{ px: 0 }}>
                  <ListItemText
                    primary={deal.accountName}
                    secondary={`${deal.dealName ?? "Deal"} • ${deal.daysSinceActivity} days • ${formatCurrency(deal.amount)}`}
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                No stale deals 🎉
              </Typography>
            )}
          </List>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* ================= UNDERPERFORMING REPS ================= */}
        <Box mb={0.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ mb: 0 }}>
              Underperforming Reps
            </Typography>
            <Chip
              label={repCount}
              color={repCount > 0 ? "warning" : "success"}
              size="small"
              sx={{ marginLeft: 0 }}
            />
          </Box>

          <List dense sx={{ p: 0, m: 0 }}>
            {repCount > 0 ? (
              repItems.slice(0, 1).map((rep) => (
                <ListItem key={rep.rep_id} disableGutters sx={{ px: 0 }}>
                  <ListItemText
                    primary={rep.repName}
                    secondary={`${rep.percentOfTarget}% of target • ${formatCurrency(rep.revenue)} / ${formatCurrency(rep.target)}`}
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                All reps on track 💪
              </Typography>
            )}
          </List>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* ================= LOW ACTIVITY ACCOUNTS ================= */}
        <Box mb={0.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ mb: 0 }}>
              Low Activity Accounts
            </Typography>
            <Chip
              label={accountCount}
              color={accountCount > 0 ? "warning" : "success"}
              size="small"
              sx={{ marginLeft: 0 }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {accountCount > 0 ? `Minimal engagement in last ${lowActivityAccounts.items.thresholdDays} days` : "Engagement healthy 👍"}
          </Typography>

          <List dense sx={{ p: 0, m: 0 }}>
            {accountCount > 0 ? (
              accountItems.slice(0, 1).map((acc) => (
                <ListItem key={acc.account_id} disableGutters sx={{ px: 0 }}>
                  <ListItemText
                    primary={acc.accountName}
                    secondary={`Activities: ${acc.activityCount} • Last active ${acc.daysSinceLastActivity ? `${acc.daysSinceLastActivity} days ago` : "No recent activity"}`}
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                Engagement healthy 👍
              </Typography>
            )}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RiskTable;
