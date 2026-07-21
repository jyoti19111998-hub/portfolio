/* Skills Galaxy: full skill set as glowing connected nodes, draggable, hover to enlarge */
(function () {
  const canvas = document.getElementById('skills-canvas');
  if (!canvas || !window.createForceGraph) return;
  const { nodes, links } = window.PORTFOLIO_DATA.skills;

  const groupColor = {
    core: '#c084fc',
    ai: '#4d7dff',
    automation: '#5ce1ff',
    law: '#9b5cff',
    research: '#7ee0a8',
  };

  window.createForceGraph(canvas, nodes, links, {
    colorFor: (n) => groupColor[n.group] || '#5ce1ff',
    getTooltip: (n) => n.label,
    linkColor: 'rgba(255,255,255,0.10)',
  });
})();
