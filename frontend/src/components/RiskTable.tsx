// frontend/src/components/RiskTable.tsx
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
    count: number;
    thresholdDays: number;
    items: StaleDeal[];
  };
  underperformingReps: {
    count: number;
    items: UnderperformingRep[];
  };
  lowActivityAccounts: {
    count: number;
    thresholdDays: number;
    items: LowActivityAccount[];
  };
}

/* ================= HELPERS ================= */

const formatCurrency = (val: number) =>
  `$${Math.round(val).toLocaleString()}`;

const safeArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? val : [];

/* ================= COMPONENT ================= */

const RiskTable: React.FC<RiskTableProps> = ({
  staleDeals,
  underperformingReps,
  lowActivityAccounts,
}) => {
  const staleItems = safeArray<StaleDeal>(staleDeals?.items);
  const repItems = safeArray<UnderperformingRep>(underperformingReps?.items);
  const accountItems = safeArray<LowActivityAccount>(lowActivityAccounts?.items);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ⚠️ Risk Factors
        </Typography>

        {/* ================= STALE DEALS ================= */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1">Stale Deals</Typography>
            <Chip
              label={staleDeals.count}
              color={staleDeals.count > 0 ? "error" : "success"}
              size="small"
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            No activity for {staleDeals.thresholdDays}+ days
          </Typography>

          <List dense>
            {staleItems.slice(0, 5).map((deal) => (
              <ListItem key={deal.deal_id} disableGutters>
                <ListItemText
                  primary={deal.accountName}
                  secondary={`${deal.dealName ?? "Deal"} • ${
                    deal.daysSinceActivity
                  } days • ${formatCurrency(deal.amount)}`}
                />
              </ListItem>
            ))}

            {staleDeals.count === 0 && (
              <Typography variant="body2" color="text.secondary">
                No stale deals 🎉
              </Typography>
            )}
          </List>
        </Box>

        <Divider />

        {/* ================= UNDERPERFORMING REPS ================= */}
        <Box my={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1">Underperforming Reps</Typography>
            <Chip
              label={underperformingReps.count}
              color={underperformingReps.count > 0 ? "warning" : "success"}
              size="small"
            />
          </Box>

          <List dense>
            {repItems.slice(0, 5).map((rep) => (
              <ListItem key={rep.rep_id} disableGutters>
                <ListItemText
                  primary={rep.repName}
                  secondary={`${rep.percentOfTarget}% of target • ${formatCurrency(
                    rep.revenue
                  )} / ${formatCurrency(rep.target)}`}
                />
              </ListItem>
            ))}

            {underperformingReps.count === 0 && (
              <Typography variant="body2" color="text.secondary">
                All reps on track 💪
              </Typography>
            )}
          </List>
        </Box>

        <Divider />

        {/* ================= LOW ACTIVITY ACCOUNTS ================= */}
        <Box mt={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1">Low Activity Accounts</Typography>
            <Chip
              label={lowActivityAccounts.count}
              color={lowActivityAccounts.count > 0 ? "warning" : "success"}
              size="small"
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Minimal engagement in last {lowActivityAccounts.thresholdDays} days
          </Typography>

          <List dense>
            {accountItems.slice(0, 5).map((acc) => (
              <ListItem key={acc.account_id} disableGutters>
                <ListItemText
                  primary={acc.accountName}
                  secondary={`Activities: ${acc.activityCount}${
                    acc.daysSinceLastActivity
                      ? ` • Last active ${acc.daysSinceLastActivity} days ago`
                      : ""
                  }`}
                />
              </ListItem>
            ))}

            {lowActivityAccounts.count === 0 && (
              <Typography variant="body2" color="text.secondary">
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
