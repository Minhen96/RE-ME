'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

interface LifeTreeViewProps {
data: TreeNode;
}

export default function LifeTreeView({ data }: LifeTreeViewProps) {
const svgRef = useRef<SVGSVGElement>(null);
const [animationKey, setAnimationKey] = useState(0);

useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    // Create SVG with zoom capability
    const svg = d3.select(svgRef.current)
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

    // Background gradient
    const bgGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'tree-bg-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f0fdf4');
    bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#dbeafe');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#tree-bg-gradient)');

    const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
    .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
    .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    const root = d3.hierarchy(data);
    treeLayout(root);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
        g.attr('transform', `translate(${margin.left},${margin.top}) ${event.transform}`);
    });

    svg.call(zoom);

    // Custom curved path generator for organic branches
    function customLink(d: any) {
      const sourceX = d.source.y;
      const sourceY = d.source.x;
      const targetX = d.target.y;
      const targetY = d.target.x;

      const midX = (sourceX + targetX) / 2;

      return `M ${sourceX},${sourceY}
              C ${midX},${sourceY}
                ${midX},${targetY}
                ${targetX},${targetY}`;
    }

    // Draw links with animation
    const links = g.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', customLink)
    .attr('fill', 'none')
    .attr('stroke', (d) => {
        if (d.target.data.type === 'hobby') return '#16a34a';
        if (d.target.data.type === 'activity') return '#4ade80';
        if (d.target.data.type === 'reflection') return '#fbbf24';
        if (d.target.data.type === 'moment') return '#f87171';
        return '#94a3b8';
    })
    .attr('stroke-width', (d) => {
        if (d.target.data.type === 'root') return 6;
        if (d.target.data.type === 'hobby') return 4;
        return 2;
    })
    .attr('stroke-opacity', 0)
    .attr('stroke-linecap', 'round')
    .transition()
    .duration(800)
    .delay((d, i) => i * 50)
    .attr('stroke-opacity', 0.7);

    // Draw nodes
    const nodes = g.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.y},${d.x})`)
    .attr('opacity', 0);

    // Animate nodes appearance
    nodes.transition()
      .duration(600)
      .delay((d, i) => 400 + i * 50)
      .attr('opacity', 1);

    // Node glow effect
    const glowFilter = svg.append('defs')
      .append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 3)
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Node circles with glow
    nodes.append('circle')
    .attr('r', (d) => {
        if (d.data.type === 'root') return 14;
        if (d.data.type === 'hobby') return 10;
        return 6;
    })
    .attr('fill', (d) => {
        if (d.data.type === 'root') return '#15803d';
        if (d.data.type === 'hobby') return '#22c55e';
        if (d.data.type === 'activity') return '#86efac';
        if (d.data.type === 'reflection') return '#fbbf24';
        if (d.data.type === 'moment') return '#f87171';
        return '#cbd5e1';
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('filter', 'url(#node-glow)')
    .style('cursor', 'pointer')
    .on('mouseenter', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d) => {
          if (d.data.type === 'root') return 18;
          if (d.data.type === 'hobby') return 13;
          return 9;
        });
    })
    .on('mouseleave', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d) => {
          if (d.data.type === 'root') return 14;
          if (d.data.type === 'hobby') return 10;
          return 6;
        });
    });

    // Node labels with background
    const labels = nodes.append('g')
      .attr('class', 'label-group');

    labels.append('rect')
      .attr('x', (d) => d.children ? -80 : 16)
      .attr('y', -12)
      .attr('width', (d) => Math.max(60, d.data.name.length * 7))
      .attr('height', 24)
      .attr('rx', 4)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0.9)
      .attr('stroke', (d) => {
        if (d.data.type === 'root') return '#15803d';
        if (d.data.type === 'hobby') return '#22c55e';
        if (d.data.type === 'activity') return '#86efac';
        if (d.data.type === 'reflection') return '#fbbf24';
        if (d.data.type === 'moment') return '#f87171';
        return '#cbd5e1';
      })
      .attr('stroke-width', 2);

    labels.append('text')
    .attr('dy', '0.35em')
    .attr('x', (d) => d.children ? -50 : 25)
    .attr('text-anchor', (d) => d.children ? 'end' : 'start')
    .text((d) => d.data.name.length > 15 ? d.data.name.substring(0, 15) + '...' : d.data.name)
    .attr('font-size', '13px')
    .attr('font-weight', (d) => d.data.type === 'root' || d.data.type === 'hobby' ? 'bold' : 'normal')
    .attr('fill', '#1f2937');

}, [data, animationKey]);

return (
    <div className="w-full bg-gradient-to-b from-green-50 to-blue-50 rounded-lg shadow-lg p-6 overflow-hidden">
    <div className="mb-4 flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Life Tree 🌳</h2>
        <p className="text-sm text-gray-600">
        Trunk = Total Growth | Branches = Hobbies | Leaves = Activities | Flowers = Reflections | Fruits = Happy Moments
        </p>
        <p className="text-xs text-gray-500 mt-1">Scroll to zoom, drag to pan</p>
        </div>
        <button
          onClick={() => setAnimationKey(prev => prev + 1)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Replay
        </button>
    </div>
    <svg ref={svgRef} className="w-full" />
    </div>
);
}