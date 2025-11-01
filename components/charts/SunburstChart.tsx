'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SunburstChartProps {
  data: any;
}

export default function SunburstChart({ data }: SunburstChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create hierarchy
    const root = d3
      .hierarchy(data)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create partition layout
    const partition = d3.partition<any>().size([2 * Math.PI, radius]);

    partition(root);

    // Create arc generator
    const arc = d3
      .arc<any>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - 1);

    // Draw arcs
    const paths = svg
      .selectAll('path')
      .data(root.descendants().filter((d) => d.depth > 0))
      .join('path')
      .attr('fill', (d: any) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', (d) => (d.depth === 1 ? 0.6 : 0.9))
      .attr('d', arc as any)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add hover effects
    paths
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 1);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', d.depth === 1 ? 0.6 : 0.9);
      });

    // Add labels for categories (depth 1)
    svg
      .selectAll('text')
      .data(root.descendants().filter((d) => d.depth === 1))
      .join('text')
      .attr('transform', (d: any) => {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d: any) => d.data.name);

    // Add center label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text('Hobbies');

  }, [data]);

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
}
