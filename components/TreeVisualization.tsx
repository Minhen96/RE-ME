'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { RotateCcw } from 'lucide-react';

interface TreeVisualizationProps {
  hobbies: any[];
  activities: any[];
  reflections: any[];
  moments: any[];
}

export default function TreeVisualization({
  hobbies,
  activities,
  reflections,
  moments,
}: TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [customHour, setCustomHour] = useState(12);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 900;
    const height = 750;
    const centerX = width / 2;
    const groundY = height - 80;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Calculate total growth
    const totalLevel = hobbies.reduce((sum, h) => sum + (h.level || 1), 0);
    const totalActivities = activities.length;
    const totalGrowth = totalLevel + totalActivities;

    // Sky gradient - dynamic based on time
    const currentHour = useLocalTime ? new Date().getHours() : customHour;
    const isNight = currentHour >= 18 || currentHour <= 6;
    const isMorning = currentHour > 6 && currentHour <= 12;
    
    const bgGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'bgGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    if (isNight) {
      bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1e293b');
      bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#334155');
    } else if (isMorning) {
      bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fef3c7');
      bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#dbeafe');
    } else {
      bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#bfdbfe');
      bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ddd6fe');
    }

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bgGradient)');

    // Ground with grass
    const groundGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'groundGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    groundGradient.append('stop').attr('offset', '0%').attr('stop-color', '#22c55e');
    groundGradient.append('stop').attr('offset', '100%').attr('stop-color', '#15803d');

    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', groundY)
      .attr('width', width)
      .attr('height', 80)
      .attr('fill', 'url(#groundGradient)')
      .attr('opacity', 0.3);

    // Enhanced grass
    for (let i = 0; i < width; i += 8) {
      const grassHeight = 8 + Math.random() * 12;
      svg
        .append('line')
        .attr('x1', i)
        .attr('y1', groundY)
        .attr('x2', i + (Math.random() - 0.5) * 6)
        .attr('y2', groundY - grassHeight)
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(500 + i * 0.5)
        .attr('opacity', 0.4 + Math.random() * 0.3);
    }

    // Trunk parameters
    const trunkHeight = Math.min(280 + totalGrowth * 2, 420);
    const trunkWidth = 60;
    const trunkTop = groundY - trunkHeight;

    // Trunk gradient
    const trunkGradient = svg
      .append('defs')
      .append('radialGradient')
      .attr('id', 'trunkGradient')
      .attr('cx', '30%')
      .attr('cy', '50%');

    trunkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#78350f');
    trunkGradient.append('stop').attr('offset', '50%').attr('stop-color', '#92400e');
    trunkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#451a03');

    // Shadow filter
    const shadowFilter = svg
      .append('defs')
      .append('filter')
      .attr('id', 'shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    shadowFilter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3);

    shadowFilter
      .append('feOffset')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetblur');

    const feMerge = shadowFilter.append('feMerge');
    feMerge.append('feMergeNode');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw trunk
    const trunkPath = `
      M ${centerX - trunkWidth / 2} ${groundY}
      Q ${centerX - trunkWidth / 2.5} ${groundY - trunkHeight * 0.3} ${centerX - trunkWidth / 3} ${groundY - trunkHeight * 0.6}
      L ${centerX - trunkWidth / 6} ${trunkTop}
      L ${centerX + trunkWidth / 6} ${trunkTop}
      Q ${centerX + trunkWidth / 3} ${groundY - trunkHeight * 0.6} ${centerX + trunkWidth / 2.5} ${groundY - trunkHeight * 0.3}
      L ${centerX + trunkWidth / 2} ${groundY}
      Z
    `;

    svg
      .append('path')
      .attr('d', trunkPath)
      .attr('fill', 'url(#trunkGradient)')
      .attr('stroke', '#451a03')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#shadow)')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // Tooltip helper
    function showTooltip(data: any, type: string) {
      setHoveredItem({ ...data, type });
    }

    function hideTooltip() {
      setHoveredItem(null);
    }

    // Category colors
    const categoryColors: Record<string, string> = {
      Creative: '#ec4899',
      Physical: '#f97316',
      Intellectual: '#8b5cf6',
      Social: '#06b6d4',
      Other: '#10b981',
    };

    // Create canopy zones - circular layers for hobbies
    const numHobbies = hobbies.length || 1;
    const hasNoHobbies = hobbies.length === 0;
    const canopyRadius = 200 + totalGrowth * 1.5;
    const canopyCenterY = trunkTop - 80;

    // Draw large foliage clusters for each hobby
    (hasNoHobbies ? [{ id: 'ghost', name: 'Your first hobby awaits!', level: 1, category: 'Other' }] : hobbies).forEach((hobby, hobbyIndex) => {
      const isGhost = hobby.id === 'ghost';

      // Position hobbies in a circular pattern
      const angle = (hobbyIndex / numHobbies) * Math.PI * 2 - Math.PI / 2;
      const distance = canopyRadius * 0.6;
      const hobbyX = centerX + Math.cos(angle) * distance;
      const hobbyY = canopyCenterY + Math.sin(angle) * distance * 0.7;

      let branchColor = categoryColors[hobby.category] || '#10b981';
      if (!isGhost) {
        if (hobby.level >= 20) branchColor = '#fbbf24';
        else if (hobby.level >= 10) branchColor = '#d1d5db';
        else if (hobby.level >= 5) branchColor = '#cd7f32';
      }

      // Create hobby group
      const hobbyGroup = svg
        .append('g')
        .style('cursor', isGhost ? 'default' : 'pointer')
        .on('click', () => {
          if (!isGhost) {
            router.push(`/hobby/${hobby.id}`);
          }
        });

      // Draw connecting branch from trunk to hobby cluster
      const branchPath = `
        M ${centerX} ${trunkTop + 40}
        Q ${centerX + (hobbyX - centerX) * 0.3} ${trunkTop + 20}
          ${centerX + (hobbyX - centerX) * 0.6} ${canopyCenterY + (hobbyY - canopyCenterY) * 0.5}
        T ${hobbyX} ${hobbyY}
      `;

      hobbyGroup
        .append('path')
        .attr('d', branchPath)
        .attr('stroke', '#78350f')
        .attr('stroke-width', 0)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('opacity', isGhost ? 0.2 : 0.6)
        .transition()
        .duration(800)
        .delay(1200 + hobbyIndex * 150)
        .attr('stroke-width', 6 + hobby.level * 0.8);

      // Create foliage cluster gradient
      const foliageGradient = svg
        .append('defs')
        .append('radialGradient')
        .attr('id', `foliage-${hobby.id}`)
        .attr('cx', '40%')
        .attr('cy', '40%');

      foliageGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6ee7b7');
      foliageGradient.append('stop').attr('offset', '60%').attr('stop-color', '#10b981');
      foliageGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

      // Main foliage cluster
      const clusterSize = 60 + hobby.level * 8;
      
      // Multiple overlapping circles for organic look
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * clusterSize * 0.4;
        const offsetY = (Math.random() - 0.5) * clusterSize * 0.4;
        
        hobbyGroup
          .append('circle')
          .attr('cx', hobbyX + offsetX)
          .attr('cy', hobbyY + offsetY)
          .attr('r', 0)
          .attr('fill', `url(#foliage-${hobby.id})`)
          .attr('opacity', isGhost ? 0.2 : 0.75)
          .transition()
          .duration(600)
          .delay(1500 + hobbyIndex * 150 + i * 80)
          .attr('r', clusterSize * (0.7 + Math.random() * 0.3));
      }

      // Hobby badge on cluster
      if (!isGhost) {
        // Glow effect
        hobbyGroup
          .append('circle')
          .attr('cx', hobbyX)
          .attr('cy', hobbyY)
          .attr('r', 0)
          .attr('fill', branchColor)
          .attr('opacity', 0.3)
          .transition()
          .duration(600)
          .delay(2000 + hobbyIndex * 150)
          .attr('r', 35);

        // Badge background
        hobbyGroup
          .append('circle')
          .attr('cx', hobbyX)
          .attr('cy', hobbyY)
          .attr('r', 0)
          .attr('fill', 'white')
          .attr('stroke', branchColor)
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .on('mouseover', () => showTooltip(hobby, 'hobby'))
          .on('mouseout', hideTooltip)
          .transition()
          .duration(500)
          .delay(2100 + hobbyIndex * 150)
          .attr('r', 24);

        // Level text
        hobbyGroup
          .append('text')
          .attr('x', hobbyX)
          .attr('y', hobbyY + 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('fill', branchColor)
          .attr('opacity', 0)
          .text(hobby.level)
          .style('cursor', 'pointer')
          .on('mouseover', () => showTooltip(hobby, 'hobby'))
          .on('mouseout', hideTooltip)
          .transition()
          .duration(400)
          .delay(2300 + hobbyIndex * 150)
          .attr('opacity', 1);

        // Hobby name label
        hobbyGroup
          .append('text')
          .attr('x', hobbyX)
          .attr('y', hobbyY + clusterSize + 25)
          .attr('text-anchor', 'middle')
          .attr('font-size', '15px')
          .attr('font-weight', 'bold')
          .attr('fill', branchColor)
          .attr('opacity', 0)
          .text(hobby.name)
          .style('cursor', 'pointer')
          .on('mouseover', () => showTooltip(hobby, 'hobby'))
          .on('mouseout', hideTooltip)
          .transition()
          .duration(400)
          .delay(2400 + hobbyIndex * 150)
          .attr('opacity', 1);

        // Activities as fruits/flowers within the foliage
        const hobbyActivities = activities.filter((a) => a.hobby_id === hobby.id);
        const maxActivities = Math.min(20, hobbyActivities.length);
        const activitiesToShow = hobbyActivities.slice(0, maxActivities);

        activitiesToShow.forEach((activity, activityIndex) => {
          // Distribute activities within the cluster area
          const activityAngle = (activityIndex / maxActivities) * Math.PI * 2;
          const activityDistance = 30 + Math.random() * (clusterSize - 30);
          const activityX = hobbyX + Math.cos(activityAngle) * activityDistance;
          const activityY = hobbyY + Math.sin(activityAngle) * activityDistance * 0.8;

          // Activity as small fruit/berry
          const fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥝'];
          const fruitEmoji = fruitEmojis[activityIndex % fruitEmojis.length];

          hobbyGroup
            .append('text')
            .attr('x', activityX)
            .attr('y', activityY)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('opacity', 0)
            .text(fruitEmoji)
            .style('cursor', 'pointer')
            .on('mouseover', () => showTooltip(activity, 'activity'))
            .on('mouseout', hideTooltip)
            .on('mouseenter', function () {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('font-size', '24px');
            })
            .on('mouseleave', function () {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('font-size', '18px');
            })
            .transition()
            .duration(400)
            .delay(2600 + hobbyIndex * 150 + activityIndex * 50)
            .attr('opacity', 1);
        });
      }
    });

    // Reflections in sky - bigger clouds/stars representing user reflections
    reflections.slice(0, Math.min(12, reflections.length)).forEach((reflection, index) => {
      const starX = 100 + (index % 6) * 140 + Math.random() * 30;
      const starY = 60 + Math.floor(index / 6) * 140 + Math.random() * 40;
      const starSize = 48 + Math.random() * 16; // Much bigger: 48-64px

      const icon = isNight ? '⭐' : isMorning ? '☁️' : '☁️'; // Use clouds for day/morning

      const star = svg
        .append('text')
        .attr('x', starX)
        .attr('y', starY)
        .attr('font-size', `${starSize}px`)
        .attr('opacity', 0)
        .attr('text-anchor', 'middle')
        .text(icon)
        .style('cursor', 'pointer')
        .on('mouseover', () => showTooltip(reflection, 'reflection'))
        .on('mouseout', hideTooltip)
        .on('mouseenter', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('font-size', `${starSize + 12}px`);
        })
        .on('mouseleave', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('font-size', `${starSize}px`);
        });

      star
        .transition()
        .duration(600)
        .delay(3000 + index * 100)
        .attr('opacity', isNight ? 0.9 : 0.8);
    });

    // Happy moments as flowers on ground
    moments.slice(0, Math.min(15, moments.length)).forEach((moment, index) => {
      const flowerX = centerX - 300 + (index % 10) * 65 + (Math.random() - 0.5) * 30;
      const flowerY = groundY - 5;

      const flowerEmojis = ['🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '💐'];
      const flowerEmoji = flowerEmojis[index % flowerEmojis.length];
      const flowerSize = 36 + Math.random() * 16;
      
      const flower = svg
        .append('text')
        .attr('x', flowerX)
        .attr('y', flowerY)
        .attr('font-size', `${flowerSize}px`)
        .attr('opacity', 0)
        .attr('text-anchor', 'middle')
        .text(flowerEmoji)
        .style('cursor', 'pointer')
        .on('mouseover', () => showTooltip(moment, 'moment'))
        .on('mouseout', hideTooltip)
        .on('mouseenter', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('font-size', `${flowerSize + 12}px`);
        })
        .on('mouseleave', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('font-size', `${flowerSize}px`);
        });

      flower
        .transition()
        .duration(500)
        .delay(3500 + index * 80)
        .attr('opacity', 1);
    });


    // Sun rays (daytime only)
    if (!isNight && !isMorning) {
      const sunX = width - 120;
      const sunY = 100;

      // Sun
      svg
        .append('circle')
        .attr('cx', sunX)
        .attr('cy', sunY)
        .attr('r', 0)
        .attr('fill', '#fbbf24')
        .attr('opacity', 0.8)
        .transition()
        .duration(1000)
        .delay(500)
        .attr('r', 40);

      // Sun rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayLength = 60;

        svg
          .append('line')
          .attr('x1', sunX + Math.cos(angle) * 45)
          .attr('y1', sunY + Math.sin(angle) * 45)
          .attr('x2', sunX + Math.cos(angle) * 45)
          .attr('y2', sunY + Math.sin(angle) * 45)
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 4)
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0.6)
          .transition()
          .duration(800)
          .delay(800 + i * 50)
          .attr('x2', sunX + Math.cos(angle) * (45 + rayLength))
          .attr('y2', sunY + Math.sin(angle) * (45 + rayLength));
      }
    }


    // Falling leaves animation
    function createFallingLeaf() {
      const leafEmojis = ['🍃', '🍂'];
      const leaf = svg
        .append('text')
        .attr('x', centerX - 150 + Math.random() * 300)
        .attr('y', canopyCenterY - 50)
        .attr('font-size', '20px')
        .attr('opacity', 0.8)
        .text(leafEmojis[Math.floor(Math.random() * leafEmojis.length)])
        .style('pointer-events', 'none');

      leaf
        .transition()
        .duration(4000 + Math.random() * 2000)
        .ease(d3.easeCubicInOut)
        .attr('x', centerX - 200 + Math.random() * 400)
        .attr('y', groundY)
        .attr('opacity', 0)
        .on('end', () => leaf.remove());
    }

    // Create occasional falling leaves
    const leafInterval = setInterval(() => {
      if (Math.random() > 0.7) createFallingLeaf();
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(leafInterval);

  }, [hobbies, activities, reflections, moments, router, animationKey, useLocalTime, customHour]);

  if (hobbies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4 animate-bounce">🌱</p>
        <p className="text-gray-700 text-xl font-semibold mb-3">
          Plant Your First Seed
        </p>
        <p className="text-gray-600 text-base mb-2">
          Your magnificent life tree awaits its first branch.
        </p>
        <p className="text-gray-500 text-sm">
          Add a hobby to watch your tree flourish and grow!
        </p>
      </div>
    );
  }

  // Get time of day label
  const getTimeLabel = () => {
    const hour = useLocalTime ? new Date().getHours() : customHour;
    if (hour >= 18 || hour <= 6) return '🌙 Night';
    if (hour > 6 && hour <= 12) return '🌅 Morning';
    if (hour > 12 && hour < 18) return '☀️ Afternoon';
    return '🌆 Evening';
  };

  return (
    <div className="relative">
      {/* Time Controls */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Time of Day Settings</h3>

        {/* Checkbox for local time */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="useLocalTime"
            checked={useLocalTime}
            onChange={(e) => setUseLocalTime(e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="useLocalTime" className="text-sm font-medium text-gray-700 cursor-pointer">
            Use Local Time (Current: {new Date().getHours()}:00)
          </label>
        </div>

        {/* Time slider */}
        {!useLocalTime && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="timeSlider" className="text-sm font-medium text-gray-700">
                Custom Time: {customHour}:00
              </label>
              <span className="text-sm font-semibold text-primary-600">
                {getTimeLabel()}
              </span>
            </div>
            <input
              type="range"
              id="timeSlider"
              min="0"
              max="23"
              value={customHour}
              onChange={(e) => setCustomHour(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-indigo-900 via-blue-400 to-indigo-900 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  #1e293b 0%,
                  #1e293b 25%,
                  #fef3c7 30%,
                  #dbeafe 35%,
                  #bfdbfe 50%,
                  #dbeafe 65%,
                  #fef3c7 70%,
                  #1e293b 75%,
                  #1e293b 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0:00 (Midnight)</span>
              <span>6:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Dusk)</span>
              <span>23:00</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center bg-gradient-to-b from-white to-green-50 rounded-2xl p-8 relative overflow-hidden">
        <svg ref={svgRef}></svg>

        {/* Tooltip */}
        {hoveredItem && (
          <div
            ref={tooltipRef}
            className="absolute bg-white rounded-xl shadow-2xl p-5 max-w-sm border-2 pointer-events-none z-50"
            style={{
              left: '50%',
              top: '30px',
              transform: 'translateX(-50%)',
              borderColor: hoveredItem.type === 'hobby' ? '#10b981' : '#e5e7eb',
            }}
          >
            {hoveredItem.type === 'hobby' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🌳</span>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{hoveredItem.name}</h3>
                    <p className="text-xs text-gray-500">{hoveredItem.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-green-50 px-3 py-1 rounded-full">
                    <p className="text-sm font-semibold text-green-700">
                      Level {hoveredItem.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {hoveredItem.exp} / {hoveredItem.meta?.level_thresholds?.[hoveredItem.level] || 100} EXP
                    </p>
                  </div>
                </div>
                {hoveredItem.description && (
                  <p className="text-sm text-gray-600 italic mb-2">{hoveredItem.description}</p>
                )}
                <p className="text-xs text-primary-600 font-semibold mt-3">
                  💡 Click to view details
                </p>
              </div>
            )}

            {hoveredItem.type === 'activity' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🍎</span>
                  <h3 className="font-bold text-lg text-gray-900">Activity</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{hoveredItem.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    {new Date(hoveredItem.created_at).toLocaleDateString()}
                  </p>
                  {hoveredItem.exp_gained && (
                    <span className="bg-green-50 px-2 py-1 rounded text-xs text-green-700 font-semibold">
                      +{hoveredItem.exp_gained} EXP
                    </span>
                  )}
                </div>
              </div>
            )}

            {hoveredItem.type === 'reflection' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">⭐</span>
                  <h3 className="font-bold text-lg text-gray-900">Reflection</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{hoveredItem.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    {new Date(hoveredItem.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {hoveredItem.type === 'moment' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🌺</span>
                  <h3 className="font-bold text-lg text-gray-900">Happy Moment</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{hoveredItem.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    {new Date(hoveredItem.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-gray-700 font-medium">Foliage Clusters = Hobbies</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍎</span>
          <span className="text-gray-700 font-medium">Fruits = Activities</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">☁️</span>
          <span className="text-gray-700 font-medium">Clouds/Stars = Reflections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌺</span>
          <span className="text-gray-700 font-medium">Ground Flowers = Moments</span>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        🌳 Your life tree grows with every journey • Hover to explore • Click clusters for details
      </div>

      {/* Replay Animation Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setAnimationKey(prev => prev + 1)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Replay Animation
        </button>
      </div>
    </div>
  );
}