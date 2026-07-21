/* Knowledge Graph: how Law, AI, IP, Automation, and Research connect */
(function () {
  const canvas = document.getElementById('knowledge-graph-canvas');
  if (!canvas || !window.createForceGraph) return;
  const { nodes: allNodes, links: allLinks } = window.PORTFOLIO_DATA.skills;

  const coreIds = ['law', 'ai', 'ip', 'automation', 'research'];
  const nodes = allNodes.filter((n) => coreIds.includes(n.id)).map((n) => ({ ...n, size: n.size * 1.15 }));
  const links = allLinks.filter(([a, b]) => coreIds.includes(a) && coreIds.includes(b));

  const descriptions = {
    law: 'LL.B. (Hons.) — legal research, drafting, regulatory interpretation',
    ai: 'Claude, GPT-4, agentic workflows & prompt engineering',
    ip: 'Intellectual Property & Technology Law specialisation',
    automation: 'Make, Zapier, n8n, Python — reliable unattended systems',
    research: 'Structured knowledge systems & judgment tracking',
  };

  const colors = { law: '#9b5cff', ai: '#4d7dff', ip: '#c084fc', automation: '#5ce1ff', research: '#7ee0a8' };

  window.createForceGraph(canvas, nodes, links, {
    colorFor: (n) => colors[n.id] || '#5ce1ff',
    getTooltip: (n) => descriptions[n.id] || n.label,
    linkColor: 'rgba(155,92,255,0.3)',
    linkDistance: 210,
  });
})();
