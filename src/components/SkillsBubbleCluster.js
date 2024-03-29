import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './SkillsBubbleCluster.css';

const SkillsBubbleCluster = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("width", "75%")
      .attr("height", "75%")
      .attr("viewBox", `0 0 800 800`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("style", "font: 10px sans-serif");

    const width = 800;
    const height = 800;

    const pack = data => d3.pack()
      .size([width - 2, height - 2])
      .padding(10)
      (d3.hierarchy({ children: data })
        .sum(d => d.value));

    const root = pack(data);

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

    const simulation = d3.forceSimulation(root.leaves())
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide(d => d.r + 6))
      .on('tick', ticked);

    function ticked() {
      leaf
        .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    leaf.append("circle")
      .attr("class", "skill-bubble-d3")
      .attr("r", d => d.r)
      .attr("fill-opacity", 0.7)
      .attr("fill", "url(#grad)")
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .attr("r", d.r * 1.1);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(300)
          .attr("r", d.r);
      })
      .on('click', (event, d) => {
        const isSelected = d3.select(event.currentTarget).classed("selected");

        d3.select(event.currentTarget)
          .classed("selected", !isSelected)
          .transition()
          .duration(500)
          .attr("r", d.r * 1.3)
          .attr("fill", isSelected ? "url(#grad)" : "#FFF")
          .attr("stroke", "url(#grad)")
          .attr("stroke-width", 3)
          .transition()
          .duration(800)
          .attr("r", d.r);

        simulation.force('collide', d3.forceCollide(d => d === d3.select(event.currentTarget).data()[0] ? d.r * 1.3 : d.r + 1));
        simulation.alpha(0.3).restart();

        d3.select(event.currentTarget.parentNode).select("text")
          .transition()
          .duration(500)
          .attr("fill", !isSelected ? "url(#grad)" : "white");
      });


    leaf.append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", "25px")
      .text(d => d.data.name);

    const resize = () => {
      const width = svg.node().clientWidth;
      const height = svg.node().clientHeight;
      svg.attr("width", width).attr("height", height);
    }

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [data]);

  return (
    <svg ref={svgRef} width="75%" height="75%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#84fab0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8fd3f4', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SkillsBubbleCluster;
