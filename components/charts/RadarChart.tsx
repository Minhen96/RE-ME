'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RadarChartProps {
  data: Array<{ skill: string; value: number }>;
}

export default function RadarChart({ data }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 400;
    const height = 400;
    const margin = 80;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Number of axes
    const numAxes = data.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Scales
    const maxValue = d3.max(data, d => d.value) || 10;
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Draw circular grid lines
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;

      // Draw circle
      svg
        .append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      // Draw level label
      svg
        .append('text')
        .attr('x', 5)
        .attr('y', -levelRadius)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .text(((maxValue / levels) * i).toFixed(0));
    }

    // Draw axis lines and labels
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Draw axis line
      svg
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      // Draw axis label
      const labelX = (radius + 20) * Math.cos(angle);
      const labelY = (radius + 20) * Math.sin(angle);

      svg
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(d.skill);
    });

    // Draw data area
    const radarLine = d3
      .lineRadial<{ skill: string; value: number }>()
      .radius(d => rScale(d.value))
      .angle((d, i) => angleSlice * i)
      .curve(d3.curveLinearClosed);

    svg
      .append('path')
      .datum(data)
      .attr('d', radarLine as any)
      .attr('fill', '#6366f1')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 2);

    // Draw data points
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = rScale(d.value);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      svg
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .attr('fill', '#6366f1')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    });
  }, [data]);

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
}
