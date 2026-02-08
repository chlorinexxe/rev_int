import React, { useEffect, useRef } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import * as d3 from "d3";

/* ================= TYPES ================= */

interface MonthlyDriver {
  month: string;              // YYYY-MM
  pipelineValue: number;
  winRate: number | null;     // 0–1 or null
}

interface RevenueTrendProps {
  data: MonthlyDriver[];      // already sliced to last 6 months
}

/* ================= COMPONENT ================= */

const RevenueTrend: React.FC<RevenueTrendProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    /* ---------- SETUP ---------- */

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = 820 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 820 300`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    /* ---------- TRANSFORM DATA ---------- */

    const parseMonth = d3.timeParse("%Y-%m");

    const chartData = data.map((d) => ({
      month: parseMonth(d.month)!,
      label: d.month,
      pipeline: d.pipelineValue,
      weightedRevenue: Math.round(
        d.pipelineValue * (d.winRate ?? 0)
      ),
    }));

    /* ---------- SCALES ---------- */

    const xScale = d3
      .scaleBand<Date>()
      .domain(chartData.map((d) => d.month))
      .range([0, width])
      .padding(0.3);

    const yMax = d3.max(chartData, (d) =>
      Math.max(d.pipeline, d.weightedRevenue)
    ) as number;

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .range([height, 0]);

    /* ---------- AXES ---------- */

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale).tickFormat((d) =>
          d instanceof Date ? d3.timeFormat("%b")(d) : ""
        )
      );

    svg.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `₹${d3.format(",")(d as number)}`)
    );

    /* ---------- PIPELINE BARS ---------- */

    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.month)!)
      .attr("y", (d) => yScale(d.pipeline))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.pipeline))
      .attr("fill", "#6fb7ff")
      .attr("rx", 4);

    /* ---------- WEIGHTED REVENUE LINE ---------- */

    const line = d3
      .line<typeof chartData[0]>()
      .x((d) => xScale(d.month)! + xScale.bandwidth() / 2)
      .y((d) => yScale(d.weightedRevenue));

    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#f5a623")
      .attr("stroke-width", 2)
      .attr("d", line);

    /* ---------- LINE DOTS ---------- */

    svg
      .selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr(
        "cx",
        (d) => xScale(d.month)! + xScale.bandwidth() / 2
      )
      .attr("cy", (d) => yScale(d.weightedRevenue))
      .attr("r", 4)
      .attr("fill", "#f5a623");

    /* ---------- TOOLTIP ---------- */

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "6px 8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        const datum = d as typeof chartData[0];
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${datum.label}</strong><br/>
             Pipeline: ₹${d3.format(",")(datum.pipeline)}<br/>
             Weighted: ₹${d3.format(",")(datum.weightedRevenue)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

  }, [data]);

  /* ================= RENDER ================= */

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue Trend (Last 6 Months)
        </Typography>
        <svg ref={svgRef} width="100%" height={300} />
      </CardContent>
    </Card>
  );
};

export default RevenueTrend;
