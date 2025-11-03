'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ActivityPreferenceChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  recentActivities?: Array<{ text: string; hobby_category?: string; created_at?: string }>;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: { name: string; value: number; date?: string } | null;
}

export default function ActivityPreferenceChart({ data, recentActivities = [] }: ActivityPreferenceChartProps) {
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

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create pie layout
    const pie = d3
      .pie<{ name: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    // Create arc generators - outer ring for categories
    const outerArc = d3
      .arc<d3.PieArcDatum<{ name: string; value: number; color: string }>>()
      .innerRadius(radius * 0.65)
      .outerRadius(radius);

    const outerHoverArc = d3
      .arc<d3.PieArcDatum<{ name: string; value: number; color: string }>>()
      .innerRadius(radius * 0.65)
      .outerRadius(radius + 15);

    // Inner ring for recent activities
    const innerArc = d3
      .arc<any>()
      .innerRadius(radius * 0.35)
      .outerRadius(radius * 0.6);

    const innerHoverArc = d3
      .arc<any>()
      .innerRadius(radius * 0.35)
      .outerRadius(radius * 0.63);

    // Draw outer arcs (categories)
    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add paths with animation
    arcs
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .attr('d', outerArc)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 150)
      .attr('opacity', 1)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return outerArc(interpolate(t) as any) || '';
        };
      });

    // Add hover effects
    arcs
      .selectAll('path')
      .on('mouseenter', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', outerHoverArc as any)
          .attr('opacity', 0.9);

        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content: {
            name: d.data.name,
            value: d.data.value,
          },
        });
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', outerArc as any)
          .attr('opacity', 1);

        setTooltip({
          visible: false,
          x: 0,
          y: 0,
          content: null,
        });
      });

    // Add labels
    arcs
      .append('text')
      .attr('transform', (d) => `translate(${outerArc.centroid(d as any)})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text((d) => (d.data.value > 8 ? d.data.name : ''))
      .transition()
      .duration(600)
      .delay((d, i) => 1000 + i * 150)
      .attr('opacity', 1);

    // Add percentage labels
    arcs
      .append('text')
      .attr('transform', (d) => {
        const pos = outerArc.centroid(d as any);
        return `translate(${pos[0]}, ${pos[1] + 16})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text((d) => (d.data.value > 8 ? `${d.data.value.toFixed(0)}%` : ''))
      .transition()
      .duration(600)
      .delay((d, i) => 1000 + i * 150)
      .attr('opacity', 0.9);

    // Draw inner ring with recent activities
    if (recentActivities && recentActivities.length > 0) {
      console.log('🔍 Drawing inner ring with', recentActivities.length, 'activities');
      console.log('🔍 Recent activities data:', recentActivities);

      const activityData = recentActivities.slice(0, 8).map((activity, index) => ({
        text: activity.text || 'Activity',
        created_at: activity.created_at,
        value: 1,
        index: index + 1,
      }));

      console.log('🔍 Processed activity data:', activityData);

      const innerPie = d3
        .pie<any>()
        .value((d) => d.value)
        .sort(null);

      const innerArcData = innerPie(activityData);
      console.log('🔍 Inner arc data:', innerArcData);
      console.log('🔍 Inner arc dimensions:', {
        innerRadius: radius * 0.35,
        outerRadius: radius * 0.6,
        hoverOuterRadius: radius * 0.63
      });

      // Draw inner ring as groups with paths
      const innerGroups = svg
        .selectAll('.inner-arc-group')
        .data(innerArcData)
        .enter()
        .append('g')
        .attr('class', 'inner-arc-group')
        .style('cursor', 'pointer');

      console.log('🔍 Created', innerGroups.size(), 'inner ring groups');

      const innerPaths = innerGroups
        .append('path')
        .attr('class', 'inner-arc-path')
        .attr('fill', (d, i) => {
          // Rotate through category colors with lighter shade
          const categoryIndex = i % data.length;
          const baseColor = d3.color(data[categoryIndex].color);
          return baseColor ? baseColor.brighter(0.8).toString() : '#e5e7eb';
        })
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9);

      // Add hover events on groups (so labels don't block events)
      console.log('🔍 Attaching hover events to inner ring groups...');

      innerGroups
        .on('mouseover', function (event, d: any) {
          console.log('🎯 INNER RING HOVER TRIGGERED!');
          console.log('🎯 Event:', event);
          console.log('🎯 Data:', d.data);
          console.log('🎯 Mouse position:', event.pageX, event.pageY);

          d3.select(this).select('path')
            .transition()
            .duration(200)
            .attr('d', innerHoverArc(d) as any)
            .attr('opacity', 1)
            .attr('stroke-width', 3);

          const dateStr = d.data.created_at
            ? new Date(d.data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Recent';

          const tooltipContent = {
            visible: true,
            x: event.clientX + 10,
            y: event.clientY - 10,
            content: {
              name: `#${d.data.index}: ${d.data.text}`,
              value: -1,
              date: dateStr,
            },
          };

          console.log('🎯 Setting tooltip:', tooltipContent);
          setTooltip(tooltipContent);
        })
        .on('mouseout', function (event, d: any) {
          console.log('🎯 INNER RING MOUSEOUT TRIGGERED');

          d3.select(this).select('path')
            .transition()
            .duration(200)
            .attr('d', innerArc(d) as any)
            .attr('opacity', 0.9)
            .attr('stroke-width', 2);

          setTooltip({
            visible: false,
            x: 0,
            y: 0,
            content: null,
          });
        })
        .on('mousemove', function (event, d: any) {
          // Update tooltip position as mouse moves
          setTooltip(prev => prev.visible ? {
            ...prev,
            x: event.clientX + 10,
            y: event.clientY - 10,
          } : prev);
        });

      console.log('✅ Inner ring hover events attached successfully');

      // Animate the inner ring
      innerPaths
        .attr('d', (d) => {
          const startAngle = d.startAngle;
          return innerArc({ ...d, endAngle: startAngle }) as any;
        })
        .transition()
        .duration(600)
        .delay((d, i) => 1500 + i * 80)
        .attr('d', (d) => innerArc(d) as any);

      // Add number labels on inner ring segments (within the groups)
      innerGroups
        .append('text')
        .attr('class', 'inner-label')
        .attr('transform', (d) => {
          const [x, y] = innerArc.centroid(d as any);
          return `translate(${x}, ${y})`;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0)
        .text((d) => d.data.index)
        .style('pointer-events', 'none')
        .transition()
        .duration(400)
        .delay((d, i) => 1800 + i * 80)
        .attr('opacity', 0.9);
    }

    // Center text
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', -10)
      .attr('fill', '#374151')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text('Activity')
      .transition()
      .duration(600)
      .delay(800)
      .attr('opacity', 1);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', 10)
      .attr('fill', '#6b7280')
      .attr('font-size', '13px')
      .attr('opacity', 0)
      .text('Focus')
      .transition()
      .duration(600)
      .delay(900)
      .attr('opacity', 1);

    // Inner ring label (if activities exist)
    if (recentActivities && recentActivities.length > 0) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', 30)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .attr('opacity', 0)
        .text('(Recent Activities)')
        .transition()
        .duration(600)
        .delay(1000)
        .attr('opacity', 0.8);
    }

  }, [data, recentActivities]);

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
          <div className="font-bold text-gray-900 mb-1 text-sm">{tooltip.content.name}</div>
          {tooltip.content.value > 0 && (
            <div className="text-sm text-gray-600">{tooltip.content.value.toFixed(1)}%</div>
          )}
          {tooltip.content.date && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>📅</span>
              {tooltip.content.date}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-700 mb-1">Inner Ring: Your Recent Activities</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Each numbered segment (#1-{Math.min(recentActivities.length, 8)}) represents one of your most recent activities.
                Hover over any segment to see the full activity details and date.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
