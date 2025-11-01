'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/lib/types';

interface LifeTreeViewProps {
data: TreeNode;
}

export default function LifeTreeView({ data }: LifeTreeViewProps) {
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Create SVG with zoom capability
    const svg = d3.select(svgRef.current)
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(data);
    treeLayout(root);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
        g.attr('transform', event.transform);
    });

    svg.call(zoom);

    // Draw links
    g.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal<any, any>()
        .x((d) => d.y)
        .y((d) => d.x)
    )
    .attr('fill', 'none')
    .attr('stroke', (d) => {
        if (d.target.data.type === 'hobby') return '#22c55e';
        if (d.target.data.type === 'activity') return '#86efac';
        if (d.target.data.type === 'reflection') return '#fbbf24';
        if (d.target.data.type === 'moment') return '#f87171';
        return '#cbd5e1';
    })
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.6);

    // Draw nodes
    const nodes = g.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.y},${d.x})`);

    // Node circles
    nodes.append('circle')
    .attr('r', (d) => {
        if (d.data.type === 'root') return 12;
        if (d.data.type === 'hobby') return 8;
        return 5;
    })
    .attr('fill', (d) => {
        if (d.data.type === 'root') return '#166534';
        if (d.data.type === 'hobby') return '#22c55e';
        if (d.data.type === 'activity') return '#86efac';
        if (d.data.type === 'reflection') return '#fbbf24';
        if (d.data.type === 'moment') return '#f87171';
        return '#cbd5e1';
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

    // Node labels
    nodes.append('text')
    .attr('dy', '.31em')
    .attr('x', (d) => d.children ? -13 : 13)
    .attr('text-anchor', (d) => d.children ? 'end' : 'start')
    .text((d) => d.data.name)
    .attr('font-size', '12px')
    .attr('fill', '#374151');

}, [data]);

return (
    <div className="w-full bg-gradient-to-b from-green-50 to-blue-50 rounded-lg shadow-lg p-6 overflow-hidden">
    <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Life Tree 🌳</h2>
        <p className="text-sm text-gray-600">
        Trunk = Total Growth | Branches = Hobbies | Leaves = Activities | Flowers = Reflections | Fruits = Happy
Moments
        </p>
        <p className="text-xs text-gray-500 mt-1">Scroll to zoom, drag to pan</p>
    </div>
    <svg ref={svgRef} className="w-full" />
    </div>
);
}