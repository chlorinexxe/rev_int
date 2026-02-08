// frontend/src/components/SummaryCards.tsx
import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface SummaryData {
  quarter?: string;
  currentRevenue: number;
  targetRevenue: number;
  gapPercent: number;
  changeQoQ: number;
}

const SummaryCards: React.FC<SummaryData> = ({
  quarter,
  currentRevenue = 0,
  targetRevenue = 0,
  gapPercent = 0,
  changeQoQ = 0,
}) => {
  const currency = (v: number) => `$${v.toLocaleString()}`;
  const percent = (v: number) => `${v.toFixed(1)}%`;

  const positive = (v: number) => v >= 0;

  const cards = [
    {
      label: "Current Revenue",
      value: currency(currentRevenue),
      sub: quarter,
    },
    {
      label: "Target",
      value: currency(targetRevenue),
    },
    {
      label: "Gap",
      value: percent(gapPercent),
      color: positive(gapPercent) ? "success.main" : "error.main",
    },
    {
      label: "QoQ Change",
      value: percent(changeQoQ),
      color: positive(changeQoQ) ? "success.main" : "error.main",
      icon: positive(changeQoQ) ? TrendingUpIcon : TrendingDownIcon,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} md={3} key={c.label}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {c.label}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {c.icon && <c.icon sx={{ color: c.color }} />}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: c.color }}
                >
                  {c.value}
                </Typography>
              </Box>

              {c.sub && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ marginTop: 0.5, display: "block" }}
                >
                  {c.sub}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
