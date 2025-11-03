'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface PersonalityTraitsChartProps {
  data: Array<{ trait: string; value: number; description: string }>;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: { trait: string; description: string; value: number } | null;
}

export default function PersonalityTraitsChart({ data }: PersonalityTraitsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 40, bottom: 20, left: 140 };

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.trait))
      .range([0, chartHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);

    // Center line at 50
    g.append('line')
      .attr('x1', xScale(50))
      .attr('x2', xScale(50))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', xScale(50))
      .attr('y', (d) => yScale(d.trait)!)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => {
        // Gradient based on distance from center
        const distance = Math.abs(d.value - 50);
        if (distance > 30) return '#10b981';
        if (distance > 15) return '#6366f1';
        return '#94a3b8';
      })
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d: any) {
        d3.select(this).attr('opacity', 0.8);

        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: {
            trait: d.trait,
            description: d.description,
            value: d.value,
          },
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1);

        setTooltip({
          visible: false,
          x: 0,
          y: 0,
          content: null,
        });
      });

    // Animate bars
    bars
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('x', (d) => (d.value >= 50 ? xScale(50) : xScale(d.value)))
      .attr('width', (d) => Math.abs(xScale(d.value) - xScale(50)));

    // Y-axis labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', (d) => yScale(d.trait)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .text((d) => d.trait)
      .transition()
      .duration(600)
      .delay((d, i) => i * 100)
      .attr('opacity', 1);

    // Value labels on bars
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => (d.value >= 50 ? xScale(d.value) + 8 : xScale(d.value) - 8))
      .attr('y', (d) => yScale(d.trait)! + yScale.bandwidth() / 2)
      .attr('text-anchor', (d) => (d.value >= 50 ? 'start' : 'end'))
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text((d) => d.value.toFixed(0))
      .transition()
      .duration(600)
      .delay((d, i) => 400 + i * 100)
      .attr('opacity', 1);

  }, [data]);

  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <svg ref={svgRef}></svg>
      </div>
      {tooltip.visible && tooltip.content && (
        <div
          className="fixed bg-white rounded-lg shadow-xl p-3 border-2 border-gray-200 pointer-events-none z-50 max-w-xs"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="font-bold text-gray-900 mb-1">{tooltip.content.trait}</div>
          <div className="text-sm text-gray-600 mb-2">{tooltip.content.description}</div>
          <div className="text-xs text-gray-500">Score: {tooltip.content.value.toFixed(0)}/100</div>
        </div>
      )}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>
          Strong preference
          <span className="inline-block w-3 h-3 bg-indigo-500 rounded ml-3 mr-1"></span>
          Moderate preference
          <span className="inline-block w-3 h-3 bg-gray-400 rounded ml-3 mr-1"></span>
          Balanced
        </p>
      </div>
    </div>
  );
}
