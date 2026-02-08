import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

interface MonthlyData {
  month: string;
  pipelineValue: number;
  winRate: number | null;
  avgDealSize: number;
  salesCycleDays: number;
}

interface DriversChartProps {
  monthly: MonthlyData[];
}

const DriversChart: React.FC<DriversChartProps> = ({ monthly }) => {
  const totalPipeline = d3.sum(monthly, d => d.pipelineValue);
  const avgWinRate =
    d3.mean(monthly, d => d.winRate ?? 0) ?? 0;
  const avgDealSize =
    d3.mean(monthly, d => d.avgDealSize) ?? 0;
  const avgSalesCycle =
    d3.mean(monthly, d => d.salesCycleDays) ?? 0;

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Revenue Drivers
      </Typography>

      <Grid container direction="column" spacing={2}>
        {/* Pipeline Value */}
        <DriverCard
          title="Pipeline Value"
          summary={`$${(totalPipeline / 1_000_000).toFixed(1)}M`}
          chart={
            <SparkLine
              data={monthly.map(m => m.pipelineValue)}
            />
          }
        />

        {/* Win Rate */}
        <DriverCard
          title="Win Rate"
          summary={`${(avgWinRate * 100).toFixed(1)}%`}
          chart={
            <SparkBar
              data={monthly.map(m => m.winRate ?? 0)}
            />
          }
        />

        {/* Avg Deal Size */}
        <DriverCard
          title="Avg Deal Size"
          summary={`$${(avgDealSize / 1_000).toFixed(0)}k`}
          chart={
            <SparkLine
              data={monthly.map(m => m.avgDealSize)}
            />
          }
        />

        {/* Sales Cycle */}
        <DriverCard
          title="Sales Cycle"
          summary={`${avgSalesCycle.toFixed(0)} days`}
          chart={
            <SparkLine
              data={monthly.map(m => m.salesCycleDays)}
            />
          }
        />
      </Grid>
    </div>
  );
};

/* ================= CARD WRAPPER ================= */

const DriverCard: React.FC<{
  title: string;
  summary: string;
  chart: React.ReactNode;
}> = ({ title, summary, chart }) => (
  <Grid item>
    <Card sx={{ height: 180 }}>
      <CardContent>
        <Typography color="textSecondary">
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{ fontWeight: 600, marginBottom: 1 }}
        >
          {summary}
        </Typography>

        <Box>{chart}</Box>
      </CardContent>
    </Card>
  </Grid>
);

/* ================= SPARK LINE ================= */

const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.parentElement!.getBoundingClientRect().width;
    const height = 60;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };

    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data)! * 0.95,
        d3.max(data)! * 1.05,
      ])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<number>()
      .curve(d3.curveMonotoneX)
      .x((_, i) => x(i))
      .y(d => y(d));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4dabf5")
      .attr("stroke-width", 2)
      .attr("d", line);

  }, [data]);

  return <svg ref={ref} width="100%" height={60} />;
};

/* ================= SPARK BAR ================= */

const SparkBar: React.FC<{ data: number[] }> = ({ data }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.parentElement!.getBoundingClientRect().width;
    const height = 60;

    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, width])
      .padding(0.35);

    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_, i) => x(i.toString())!)
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d))
      .attr("rx", 2)
      .attr("fill", "#4dabf5");

  }, [data]);

  return <svg ref={ref} width="100%" height={60} />;
};

export default DriversChart;
