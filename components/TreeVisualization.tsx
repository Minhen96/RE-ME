'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';

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
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
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

    // Enhanced trunk sizing with better minimum for new users
    const trunkHeight = Math.min(300 + totalGrowth * 2.2, 480);
    const trunkWidth = Math.min(40 + totalLevel * 3, 100);

    // Sky gradient background
    const bgGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'bgGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fefefe');
    bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ecfdf5');

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bgGradient)');

    // Enhanced bark texture pattern
    const barkPattern = svg
      .append('defs')
      .append('pattern')
      .attr('id', 'barkTexture')
      .attr('width', 6)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse');

    barkPattern
      .append('rect')
      .attr('width', 6)
      .attr('height', 24)
      .attr('fill', '#4a3426');

    // Multiple texture lines for realism
    [0, 2, 4].forEach((x) => {
      barkPattern
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', 24)
        .attr('stroke', '#3e2723')
        .attr('stroke-width', 0.8);
    });

    // Ground line with better visibility
    svg
      .append('line')
      .attr('x1', centerX - 350)
      .attr('y1', groundY)
      .attr('x2', centerX + 350)
      .attr('y2', groundY)
      .attr('stroke', '#92784d')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 0.6);

    // Enhanced grass with varied heights
    for (let i = -180; i < 180; i += 6) {
      const grassHeight = 6 + Math.random() * 8;
      svg
        .append('line')
        .attr('x1', centerX + i)
        .attr('y1', groundY - 2)
        .attr('x2', centerX + i + (Math.random() - 0.5) * 4)
        .attr('y2', groundY - grassHeight)
        .attr('stroke', i % 2 === 0 ? '#86efac' : '#6ee7b7')
        .attr('stroke-width', 1.8)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .delay(800 + Math.abs(i) * 1.5)
        .attr('opacity', 0.5);
    }

    // Multi-layer trunk gradients for depth
    const trunkGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'trunkGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    trunkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#2d1f1a');
    trunkGradient.append('stop').attr('offset', '15%').attr('stop-color', '#4a3426');
    trunkGradient.append('stop').attr('offset', '50%').attr('stop-color', '#5d4037');
    trunkGradient.append('stop').attr('offset', '85%').attr('stop-color', '#4a3426');
    trunkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#2d1f1a');

    // Enhanced shadow
    svg
      .append('defs')
      .append('filter')
      .attr('id', 'trunkShadow')
      .append('feDropShadow')
      .attr('dx', 4)
      .attr('dy', 4)
      .attr('stdDeviation', 5)
      .attr('flood-opacity', 0.35);

    // Glow filter for milestones
    svg
      .append('defs')
      .append('filter')
      .attr('id', 'milestoneGlow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('stdDeviation', 8)
      .attr('flood-color', '#fbbf24')
      .attr('flood-opacity', 0.8);

    const trunkTop = groundY - trunkHeight;

    // Draw realistic trunk with organic curve
    const trunkPath = `
      M ${centerX - trunkWidth / 2} ${groundY}
      Q ${centerX - trunkWidth / 2.3} ${groundY - trunkHeight * 0.25} ${centerX - trunkWidth / 2.8} ${groundY - trunkHeight * 0.5}
      Q ${centerX - trunkWidth / 3.5} ${trunkTop + 30} ${centerX - trunkWidth / 6} ${trunkTop}
      L ${centerX + trunkWidth / 6} ${trunkTop}
      Q ${centerX + trunkWidth / 3.5} ${trunkTop + 30} ${centerX + trunkWidth / 2.8} ${groundY - trunkHeight * 0.5}
      Q ${centerX + trunkWidth / 2.3} ${groundY - trunkHeight * 0.25} ${centerX + trunkWidth / 2} ${groundY}
      Z
    `;

    svg
      .append('path')
      .attr('d', trunkPath)
      .attr('fill', 'url(#trunkGradient)')
      .attr('stroke', '#2d1f1a')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#trunkShadow)')
      .attr('opacity', 0)
      .transition()
      .duration(1200)
      .attr('opacity', 1);

    // Bark texture overlay
    svg
      .append('path')
      .attr('d', trunkPath)
      .attr('fill', 'url(#barkTexture)')
      .attr('opacity', 0)
      .transition()
      .duration(1200)
      .attr('opacity', 0.2);

    // Enhanced growth rings with glow at milestones
    const milestones = [10, 25, 50, 100];
    milestones.forEach((milestone, i) => {
      if (totalGrowth >= milestone) {
        const ringY = groundY - 80 - i * 60;

        // Glow for milestone achievement
        svg
          .append('ellipse')
          .attr('cx', centerX + (i % 2 === 0 ? -trunkWidth / 6 : trunkWidth / 6))
          .attr('cy', ringY)
          .attr('rx', 0)
          .attr('ry', 0)
          .attr('fill', '#fbbf24')
          .attr('opacity', 0.4)
          .transition()
          .duration(800)
          .delay(1400 + i * 200)
          .attr('rx', 16)
          .attr('ry', 20);

        // Knot circle
        svg
          .append('ellipse')
          .attr('cx', centerX + (i % 2 === 0 ? -trunkWidth / 6 : trunkWidth / 6))
          .attr('cy', ringY)
          .attr('rx', 9)
          .attr('ry', 13)
          .attr('fill', '#2d1f1a')
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .delay(1400 + i * 200)
          .attr('opacity', 0.5);

        // Highlight
        svg
          .append('ellipse')
          .attr('cx', centerX + (i % 2 === 0 ? -trunkWidth / 6 : trunkWidth / 6) - 2)
          .attr('cy', ringY - 3)
          .attr('rx', 4)
          .attr('ry', 5)
          .attr('fill', '#8b6f47')
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .delay(1400 + i * 200)
          .attr('opacity', 0.7);
      }
    });

    // Tooltip helper
    function showTooltip(data: any, type: string) {
      setHoveredItem({ ...data, type });
    }

    function hideTooltip() {
      setHoveredItem(null);
    }

    // Enhanced leaf shape with multiple layers
    function getEnhancedLeafPath(size: number = 20) {
      return `
        M 0,0
        Q ${size * 0.65},${-size * 0.85} ${size},${-size}
        Q ${size * 0.85},${-size * 0.5} ${size * 0.6},0
        Q ${size * 0.85},${size * 0.5} ${size},${size}
        Q ${size * 0.65},${size * 0.85} 0,0
        Z
      `;
    }

    // Branch data storage for intelligent flower/fruit placement
    interface BranchInfo {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      controlX1: number;
      controlY1: number;
      controlX2: number;
      controlY2: number;
      color: string;
      hobby: any;
    }
    const branchesInfo: BranchInfo[] = [];

    // Draw branches - one for each hobby
    const numHobbies = hobbies.length || 1; // Ensure at least 1 for ghost branch
    const hasNoHobbies = hobbies.length === 0;

    (hasNoHobbies ? [{ id: 'ghost', name: 'Your first hobby awaits!', level: 1, category: 'Other' }] : hobbies).forEach((hobby, hobbyIndex) => {
      const isGhost = hobby.id === 'ghost';

      // Calculate branch angle
      const spreadRange = Math.PI / 2.2;
      const baseAngle = Math.PI / 2;
      const angleOffset = numHobbies === 1 ? 0 : (hobbyIndex / (numHobbies - 1) - 0.5) * spreadRange;
      const branchAngle = baseAngle + angleOffset;

      // Branch starting point
      const branchStartX = centerX + (Math.random() - 0.5) * (trunkWidth / 4);
      const branchStartY = trunkTop + 40 + (hobbyIndex % 3) * 20;

      // Branch length based on hobby level (longer for higher levels)
      const branchLength = 140 + (hobby.level || 1) * 25;

      // Calculate control points for smooth Bezier curve
      const midPointDistance = branchLength * 0.65;
      const controlX1 = branchStartX + midPointDistance * 0.45 * Math.cos(branchAngle);
      const controlY1 = branchStartY - midPointDistance * 0.45 * Math.sin(branchAngle);
      const controlX2 = branchStartX + midPointDistance * Math.cos(branchAngle + 0.12);
      const controlY2 = branchStartY - midPointDistance * Math.sin(branchAngle + 0.12);

      // Branch end point
      const branchEndX = branchStartX + branchLength * Math.cos(branchAngle);
      const branchEndY = branchStartY - branchLength * Math.sin(branchAngle);

      // Category color mapping with achievement progression
      const categoryColors: Record<string, string> = {
        Creative: '#ec4899',
        Physical: '#f97316',
        Intellectual: '#8b5cf6',
        Social: '#06b6d4',
        Other: '#10b981',
      };

      let branchColor = categoryColors[hobby.category] || '#65a30d';

      // Achievement color progression
      if (!isGhost) {
        if (hobby.level >= 20) branchColor = '#fbbf24'; // Gold
        else if (hobby.level >= 10) branchColor = '#d1d5db'; // Silver
        else if (hobby.level >= 5) branchColor = '#cd7f32'; // Bronze
      }

      const branchBaseWidth = 10 + (hobby.level || 1) * 1.8;

      // Store branch info for later flower/fruit placement
      if (!isGhost) {
        branchesInfo.push({
          startX: branchStartX,
          startY: branchStartY,
          endX: branchEndX,
          endY: branchEndY,
          controlX1,
          controlY1,
          controlX2,
          controlY2,
          color: branchColor,
          hobby,
        });
      }

      // Create clickable branch group (except for ghost)
      const branchGroup = svg.append('g')
        .style('cursor', isGhost ? 'default' : 'pointer')
        .on('click', () => {
          if (!isGhost) {
            router.push(`/hobby/${hobby.id}`);
          }
        });

      // Branch gradient
      const branchGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', `branchGrad-${hobby.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      branchGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4a3426');
      branchGradient.append('stop').attr('offset', '50%').attr('stop-color', branchColor);
      branchGradient.append('stop').attr('offset', '100%').attr('stop-color', branchColor).attr('stop-opacity', 0.85);

      // Main branch path
      const branchPath = branchGroup
        .append('path')
        .attr('d', `M ${branchStartX},${branchStartY} L ${branchStartX},${branchStartY}`)
        .attr('stroke', `url(#branchGrad-${hobby.id})`)
        .attr('stroke-width', branchBaseWidth)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')
        .attr('filter', 'url(#trunkShadow)')
        .attr('opacity', isGhost ? 0.2 : 1)
        .attr('stroke-dasharray', isGhost ? '5,5' : '0')
        .on('mouseover', () => !isGhost && showTooltip(hobby, 'hobby'))
        .on('mouseout', hideTooltip);

      // Animate branch growth with Bezier curve
      branchPath
        .transition()
        .duration(1000)
        .delay(1800 + hobbyIndex * 200)
        .attr('d', `M ${branchStartX},${branchStartY}
                    C ${controlX1},${controlY1}
                      ${controlX2},${controlY2}
                      ${branchEndX},${branchEndY}`)
        .attrTween('stroke-width', function() {
          return function(t: number) {
            return String(branchBaseWidth * (1 - t * 0.6));
          };
        });

      // Glow filter for high-level branches
      if (!isGhost && hobby.level >= 5) {
        svg
          .append('defs')
          .append('filter')
          .attr('id', `branchGlow-${hobby.id}`)
          .append('feDropShadow')
          .attr('dx', 0)
          .attr('dy', 0)
          .attr('stdDeviation', hobby.level >= 10 ? 10 : 7)
          .attr('flood-color', branchColor)
          .attr('flood-opacity', hobby.level >= 10 ? 0.9 : 0.7);

        // Hover glow effect
        branchGroup
          .on('mouseenter', function() {
            d3.select(this)
              .select('path')
              .transition()
              .duration(200)
              .attr('filter', `url(#branchGlow-${hobby.id})`);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .select('path')
              .transition()
              .duration(200)
              .attr('filter', 'url(#trunkShadow)');
          });
      }

      // Level badge on branch
      if (!isGhost) {
        const badgeX = branchStartX + (branchEndX - branchStartX) * 0.35;
        const badgeY = branchStartY + (branchEndY - branchStartY) * 0.35;

        // Badge glow for high level
        if (hobby.level >= 5) {
          branchGroup
            .append('circle')
            .attr('cx', badgeX)
            .attr('cy', badgeY)
            .attr('r', 0)
            .attr('fill', branchColor)
            .attr('opacity', 0.4)
            .transition()
            .duration(800)
            .delay(2500 + hobbyIndex * 200)
            .attr('r', 22);
        }

        // Badge circle
        branchGroup
          .append('circle')
          .attr('cx', badgeX)
          .attr('cy', badgeY)
          .attr('r', 0)
          .attr('fill', 'white')
          .attr('stroke', branchColor)
          .attr('stroke-width', 2.5)
          .transition()
          .duration(500)
          .delay(2500 + hobbyIndex * 200)
          .attr('r', 14);

        // Badge level text
        branchGroup
          .append('text')
          .attr('x', badgeX)
          .attr('y', badgeY + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', branchColor)
          .attr('opacity', 0)
          .text(hobby.level)
          .transition()
          .duration(500)
          .delay(2700 + hobbyIndex * 200)
          .attr('opacity', 1);
      }

      // Hobby name label
      branchGroup
        .append('text')
        .attr('x', branchEndX)
        .attr('y', branchEndY - 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', isGhost ? '12px' : '14px')
        .attr('font-weight', 'bold')
        .attr('fill', isGhost ? '#9ca3af' : branchColor)
        .attr('opacity', 0)
        .text(hobby.name)
        .transition()
        .duration(500)
        .delay(2800 + hobbyIndex * 200)
        .attr('opacity', isGhost ? 0.4 : 1);

      // Get activities for this hobby
      if (!isGhost) {
        const hobbyActivities = activities.filter((a) => a.hobby_id === hobby.id);
        const maxLeaves = Math.min(25, hobbyActivities.length);

        // Add starter leaves even with no activities (for new users)
        const leafCount = Math.max(maxLeaves, hobby.level >= 1 ? 3 : 0);
        const activitiesToShow = hobbyActivities.slice(0, maxLeaves);

        // Fill with dummy leaves if needed for visual appeal
        const dummyLeaves = leafCount - activitiesToShow.length;
        for (let i = 0; i < dummyLeaves; i++) {
          activitiesToShow.push({ isDummy: true });
        }

        // Draw enhanced leaf shapes along the branch
        activitiesToShow.forEach((activity, activityIndex) => {
          const t = (activityIndex + 1) / (leafCount + 1);

          // Calculate position along Bezier curve
          const curveT = t;
          const leafX =
            Math.pow(1 - curveT, 3) * branchStartX +
            3 * Math.pow(1 - curveT, 2) * curveT * controlX1 +
            3 * (1 - curveT) * Math.pow(curveT, 2) * controlX2 +
            Math.pow(curveT, 3) * branchEndX;

          const leafY =
            Math.pow(1 - curveT, 3) * branchStartY +
            3 * Math.pow(1 - curveT, 2) * curveT * controlY1 +
            3 * (1 - curveT) * Math.pow(curveT, 2) * controlY2 +
            Math.pow(curveT, 3) * branchEndY;

          // Add offset for natural clustering
          const offsetX = (Math.random() - 0.5) * 30;
          const offsetY = (Math.random() - 0.5) * 30;
          const finalX = leafX + offsetX;
          const finalY = leafY + offsetY;

          // Enhanced leaf visuals
          const leafColors = ['#22c55e', '#16a34a', '#15803d', '#10b981'];
          const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
          const leafSize = 18 + Math.random() * 7; // MUCH LARGER
          const leafRotation = Math.random() * 360;

          // Create leaf gradient for depth
          const leafGradient = svg
            .append('defs')
            .append('radialGradient')
            .attr('id', `leafGrad-${hobby.id}-${activityIndex}`)
            .attr('cx', '40%')
            .attr('cy', '40%');

          leafGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6ee7b7');
          leafGradient.append('stop').attr('offset', '100%').attr('stop-color', leafColor);

          // Draw enhanced leaf
          const leaf = branchGroup
            .append('path')
            .attr('d', getEnhancedLeafPath(leafSize))
            .attr('transform', `translate(${finalX}, ${finalY}) rotate(${leafRotation})`)
            .attr('fill', `url(#leafGrad-${hobby.id}-${activityIndex})`)
            .attr('opacity', 0)
            .style('cursor', activity.isDummy ? 'default' : 'pointer')
            .on('mouseover', () => !activity.isDummy && showTooltip(activity, 'activity'))
            .on('mouseout', hideTooltip);

          // Transparent hover zone (MUCH LARGER for easy hovering)
          if (!activity.isDummy) {
            branchGroup
              .append('circle')
              .attr('cx', finalX)
              .attr('cy', finalY)
              .attr('r', 18) // 35px diameter hover zone
              .attr('fill', 'transparent')
              .style('cursor', 'pointer')
              .on('mouseover', () => showTooltip(activity, 'activity'))
              .on('mouseout', hideTooltip)
              .on('mouseenter', function() {
                d3.select(leaf.node())
                  .transition()
                  .duration(200)
                  .attr('transform', `translate(${finalX}, ${finalY}) rotate(${leafRotation}) scale(1.3)`);
              })
              .on('mouseleave', function() {
                d3.select(leaf.node())
                  .transition()
                  .duration(200)
                  .attr('transform', `translate(${finalX}, ${finalY}) rotate(${leafRotation}) scale(1)`);
              });
          }

          // Leaf vein for realism
          branchGroup
            .append('line')
            .attr('x1', finalX)
            .attr('y1', finalY - leafSize * 0.7)
            .attr('x2', finalX)
            .attr('y2', finalY + leafSize * 0.7)
            .attr('stroke', '#065f46')
            .attr('stroke-width', 0.8)
            .attr('opacity', 0)
            .transition()
            .duration(300)
            .delay(3000 + hobbyIndex * 200 + activityIndex * 30)
            .attr('opacity', 0.5);

          // Animate leaf appearance with wind sway
          leaf
            .transition()
            .duration(400)
            .delay(3000 + hobbyIndex * 200 + activityIndex * 30)
            .attr('opacity', 0.95);
        });

        // Draw sub-branches for high-level hobbies
        if (hobby.level >= 3) {
          [0.5, 0.75].forEach((t, subIndex) => {
            const subStartX =
              Math.pow(1 - t, 3) * branchStartX +
              3 * Math.pow(1 - t, 2) * t * controlX1 +
              3 * (1 - t) * Math.pow(t, 2) * controlX2 +
              Math.pow(t, 3) * branchEndX;

            const subStartY =
              Math.pow(1 - t, 3) * branchStartY +
              3 * Math.pow(1 - t, 2) * t * controlY1 +
              3 * (1 - t) * Math.pow(t, 2) * controlY2 +
              Math.pow(t, 3) * branchEndY;

            const subAngle = branchAngle + (subIndex === 0 ? 0.5 : -0.5);
            const subLength = branchLength * 0.4;
            const subEndX = subStartX + subLength * Math.cos(subAngle);
            const subEndY = subStartY - subLength * Math.sin(subAngle);

            branchGroup
              .append('path')
              .attr('d', `M ${subStartX},${subStartY} L ${subStartX},${subStartY}`)
              .attr('stroke', branchColor)
              .attr('stroke-width', 5)
              .attr('stroke-linecap', 'round')
              .attr('fill', 'none')
              .attr('opacity', 0.8)
              .transition()
              .duration(600)
              .delay(2400 + hobbyIndex * 200 + subIndex * 200)
              .attr('d', `M ${subStartX},${subStartY} L ${subEndX},${subEndY}`)
              .attrTween('stroke-width', function() {
                return function(t: number) {
                  return String(5 * (1 - t * 0.7));
                };
              });
          });
        }
      }
    });

    // INTELLIGENT flower placement - cluster near branch connections
    if (branchesInfo.length > 0) {
      reflections.slice(0, Math.min(30, reflections.length)).forEach((reflection, index) => {
        // Pick a random branch
        const branch = branchesInfo[index % branchesInfo.length];

        // Position near branch base or middle (not random)
        const t = 0.2 + Math.random() * 0.4; // 20-60% along branch
        const flowerX =
          Math.pow(1 - t, 3) * branch.startX +
          3 * Math.pow(1 - t, 2) * t * branch.controlX1 +
          3 * (1 - t) * Math.pow(t, 2) * branch.controlX2 +
          Math.pow(t, 3) * branch.endX;

        const flowerY =
          Math.pow(1 - t, 3) * branch.startY +
          3 * Math.pow(1 - t, 2) * t * branch.controlY1 +
          3 * (1 - t) * Math.pow(t, 2) * branch.controlY2 +
          Math.pow(t, 3) * branch.endY;

        // Small offset for natural look
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;

        svg
          .append('text')
          .attr('x', flowerX + offsetX)
          .attr('y', flowerY + offsetY)
          .attr('font-size', '24px')
          .attr('opacity', 0)
          .text('🌸')
          .style('cursor', 'pointer')
          .on('mouseover', () => showTooltip(reflection, 'reflection'))
          .on('mouseout', hideTooltip)
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('font-size', '32px');
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('font-size', '24px');
          })
          .transition()
          .duration(500)
          .delay(3500 + index * 80)
          .attr('opacity', 1);
      });
    }

    // INTELLIGENT fruit placement - hang from branch tips with stems
    if (branchesInfo.length > 0) {
      moments.slice(0, Math.min(30, moments.length)).forEach((moment, index) => {
        // Pick a random branch
        const branch = branchesInfo[index % branchesInfo.length];

        // Position near branch tip (80-95% along branch)
        const t = 0.75 + Math.random() * 0.2;
        const stemTopX =
          Math.pow(1 - t, 3) * branch.startX +
          3 * Math.pow(1 - t, 2) * t * branch.controlX1 +
          3 * (1 - t) * Math.pow(t, 2) * branch.controlX2 +
          Math.pow(t, 3) * branch.endX;

        const stemTopY =
          Math.pow(1 - t, 3) * branch.startY +
          3 * Math.pow(1 - t, 2) * t * branch.controlY1 +
          3 * (1 - t) * Math.pow(t, 2) * branch.controlY2 +
          Math.pow(t, 3) * branch.endY;

        // Small horizontal offset
        const offsetX = (Math.random() - 0.5) * 12;
        const fruitX = stemTopX + offsetX;

        // Hang down with stem
        const stemLength = 12 + Math.random() * 8;
        const fruitY = stemTopY + stemLength;

        // Draw stem
        const stem = svg
          .append('line')
          .attr('x1', stemTopX)
          .attr('y1', stemTopY)
          .attr('x2', stemTopX)
          .attr('y2', stemTopY)
          .attr('stroke', '#4a3426')
          .attr('stroke-width', 1.5)
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0);

        // Draw fruit
        const apple = svg
          .append('text')
          .attr('x', fruitX)
          .attr('y', fruitY)
          .attr('font-size', '28px')
          .attr('opacity', 0)
          .text('🍎')
          .style('cursor', 'pointer')
          .on('mouseover', () => showTooltip(moment, 'moment'))
          .on('mouseout', hideTooltip);

        // Animate stem growth then fruit appearance
        stem
          .transition()
          .duration(400)
          .delay(4000 + index * 80)
          .attr('x2', fruitX)
          .attr('y2', fruitY)
          .attr('opacity', 0.7);

        apple
          .transition()
          .duration(500)
          .delay(4200 + index * 80)
          .attr('opacity', 1);

        // Gentle swing on hover with stem
        apple
          .on('mouseenter', function() {
            const swingAngle = 8;
            d3.select(this)
              .transition()
              .duration(400)
              .attr('transform', `rotate(${-swingAngle}, ${stemTopX}, ${stemTopY})`)
              .attr('font-size', '34px')
              .transition()
              .duration(400)
              .attr('transform', `rotate(${swingAngle}, ${stemTopX}, ${stemTopY})`)
              .transition()
              .duration(400)
              .attr('transform', `rotate(0, ${stemTopX}, ${stemTopY})`);

            d3.select(stem.node())
              .transition()
              .duration(400)
              .attr('transform', `rotate(${-swingAngle}, ${stemTopX}, ${stemTopY})`)
              .transition()
              .duration(400)
              .attr('transform', `rotate(${swingAngle}, ${stemTopX}, ${stemTopY})`)
              .transition()
              .duration(400)
              .attr('transform', `rotate(0, ${stemTopX}, ${stemTopY})`);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('font-size', '28px');
          });
      });
    }

    // Add CSS animation for subtle wind sway
    const style = document.createElement('style');
    style.textContent = `
      @keyframes windSway {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        25% { transform: translateX(2px) rotate(1deg); }
        75% { transform: translateX(-2px) rotate(-1deg); }
      }
    `;
    document.head.appendChild(style);

  }, [hobbies, activities, reflections, moments, router]);

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

  return (
    <div className="relative">
      <div className="flex items-center justify-center bg-gradient-to-b from-white to-green-50 rounded-2xl p-8 relative">
        <svg ref={svgRef}></svg>

        {/* Enhanced Tooltip */}
        {hoveredItem && (
          <div
            ref={tooltipRef}
            className="absolute bg-white rounded-xl shadow-2xl p-5 max-w-sm border-2 pointer-events-none z-50 animate-in fade-in slide-in-from-top-4 duration-300"
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
                  <span className="text-3xl">🌿</span>
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
                  💡 Click branch to view details
                </p>
              </div>
            )}

            {hoveredItem.type === 'activity' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🍃</span>
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
                  <span className="text-3xl">🌸</span>
                  <h3 className="font-bold text-lg text-gray-900">Reflection</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{hoveredItem.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    {new Date(hoveredItem.created_at).toLocaleDateString()}
                  </p>
                  {hoveredItem.emotion && (
                    <span className="text-xs text-indigo-600 font-semibold">
                      {hoveredItem.emotion}
                    </span>
                  )}
                </div>
              </div>
            )}

            {hoveredItem.type === 'moment' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🍎</span>
                  <h3 className="font-bold text-lg text-gray-900">Happy Moment</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{hoveredItem.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    {new Date(hoveredItem.created_at).toLocaleDateString()}
                  </p>
                  {hoveredItem.emotion && (
                    <span className="text-xs text-red-600 font-semibold">
                      {hoveredItem.emotion}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-gray-700 font-medium">Branches = Hobbies (Click to view)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍃</span>
          <span className="text-gray-700 font-medium">Leaves = Activities</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-gray-700 font-medium">Flowers = Reflections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍎</span>
          <span className="text-gray-700 font-medium">Apples = Happy Moments</span>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        🌳 Your tree grows with every action • Hover to explore • Click branches to dive deeper
      </div>
    </div>
  );
}
