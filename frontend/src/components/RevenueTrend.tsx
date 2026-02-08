import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface RevenueMonth {
  month: string;
  revenue: number;
  target: number;
  gap: number; // Added to match your backend response
}

interface RevenueTrendProps {
  data: RevenueMonth[];
  title?: string;
}

const RevenueTrend: React.FC<RevenueTrendProps> = ({ data, title }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    // 1. Setup Canvas
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const containerWidth = ref.current.parentElement!.getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const width = containerWidth;

    // 2. Scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    // Find the highest value between revenue and target to set the Y-axis limit
    const yMax = d3.max(data, (d) => Math.max(d.revenue, d.target)) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1]) // Add 10% padding at the top
      .range([height - margin.bottom, margin.top]);

    // 3. Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr("color", "#666");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `$${(Number(d) / 1000)}k`))
      .attr("color", "#666");

    // 4. Draw Bars (Revenue)
    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.month)!)
      .attr("y", (d) => y(d.revenue))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.revenue))
      .attr("fill", "#1976d2") // Professional Blue
      .attr("rx", 4)
      .on("mousemove", (event, d) => {
        const [mx, my] = d3.pointer(event);
        setTooltip({ 
          x: mx, 
          y: my, 
          content: `Revenue: $${d.revenue.toLocaleString()}\nGap: $${d.gap.toLocaleString()}` 
        });
      })
      .on("mouseleave", () => setTooltip(null));

    // 5. Draw Line (Target)
    const lineGenerator = d3
      .line<RevenueMonth>()
      .x((d) => x(d.month)! + x.bandwidth() / 2)
      .y((d) => y(d.target))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ff9800") // Orange Target Line
      .attr("stroke-width", 3)
      .attr("d", lineGenerator);

    // 6. Draw Dots (Target Points)
    svg
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.month)! + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.target))
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#ff9800")
      .attr("stroke-width", 2)
      .on("mousemove", (event, d) => {
        const [mx, my] = d3.pointer(event);
        setTooltip({ 
          x: mx, 
          y: my, 
          content: `Target: $${d.target.toLocaleString()}` 
        });
      })
      .on("mouseleave", () => setTooltip(null));

  }, [data]);

  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="textSecondary">
          {title ?? "Revenue vs Target Trend"}
        </Typography>
        
        {/* Simple Legend */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
          <LegendItem color="#1976d2" label="Revenue (Bar)" />
          <LegendItem color="#ff9800" label="Target (Line)" />
        </Box>

        <div style={{ position: "relative" }}>
          <svg ref={ref} width="100%" height={300}></svg>
          {tooltip && (
            <div
              style={{
                position: "absolute",
                top: tooltip.y - 60,
                left: tooltip.x + 10,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#fff",
                padding: "8px",
                borderRadius: "4px",
                pointerEvents: "none",
                fontSize: "12px",
                whiteSpace: "pre-line",
                zIndex: 10,
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Small helper for the legend
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: '2px' }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

export default RevenueTrend;