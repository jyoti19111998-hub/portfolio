/**
 * Shared lightweight force-directed graph renderer (canvas 2D).
 * Used by both the Knowledge Graph and the Skills Galaxy — same physics,
 * different node sets / styling, so the simulation code isn't duplicated.
 */
window.createForceGraph = function createForceGraph(canvas, rawNodes, rawLinks, opts = {}) {
  const ctx = canvas.getContext('2d');
  const {
    colorFor = () => '#5ce1ff',
    getLabel = (n) => n.label,
    getSize = (n) => n.size || 16,
    getTooltip = null,
    linkColor = 'rgba(155,92,255,0.35)',
    draggable = true,
    idleDrift = true,
    linkDistance = null,
  } = opts;

  let width, height, dpr;
  const nodes = rawNodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = rawLinks.map(([a, b]) => ({ source: nodeById[a], target: nodeById[b] })).filter((l) => l.source && l.target);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Seed positions roughly around center in a circle, then let simulation settle
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const r = Math.min(width, height) * 0.32;
    n.x = width / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 40;
    n.y = height / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40;
  });

  function step() {
    const cx = width / 2, cy = height / 2;
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let distSq = dx * dx + dy * dy || 0.01;
        const dist = Math.sqrt(distSq);
        const minDist = (getSize(a) + getSize(b)) * 3.6;
        if (dist < minDist * 3) {
          const force = (minDist * minDist * 4) / distSq;
          const fx = (dx / dist) * force * 0.02;
          const fy = (dy / dist) * force * 0.02;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }
    }
    // Springs (links)
    links.forEach(({ source, target }) => {
      const dx = target.x - source.x, dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const targetDist = linkDistance || Math.max(90, Math.min(width, height) / Math.max(3, Math.sqrt(nodes.length) * 1.3));
      const force = (dist - targetDist) * 0.02;
      const fx = (dx / dist) * force, fy = (dy / dist) * force;
      source.vx += fx; source.vy += fy;
      target.vx -= fx; target.vy -= fy;
    });
    // Centering
    nodes.forEach((n) => {
      n.vx += (cx - n.x) * 0.0012;
      n.vy += (cy - n.y) * 0.0012;
      n.vx *= 0.82; n.vy *= 0.82;
      if (n !== dragNode) { n.x += n.vx; n.y += n.vy; }
      const pad = getSize(n) + 10;
      n.x = Math.max(pad, Math.min(width - pad, n.x));
      n.y = Math.max(pad, Math.min(height - pad, n.y));
    });
  }

  let hoverNode = null;
  let dragNode = null;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Links
    links.forEach(({ source, target }) => {
      const highlight = hoverNode && (source === hoverNode || target === hoverNode);
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = highlight ? 'rgba(92,225,255,0.8)' : linkColor;
      ctx.lineWidth = highlight ? 1.6 : 1;
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((n) => {
      const isHover = n === hoverNode;
      const baseSize = getSize(n);
      const size = isHover ? baseSize * 1.35 : baseSize;
      const color = colorFor(n);

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 2.2);
      grad.addColorStop(0, color + (isHover ? 'aa' : '55'));
      grad.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, size * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.stroke();

      ctx.font = `${isHover ? 700 : 500} ${Math.max(11, size * 0.62)}px Inter, sans-serif`;
      ctx.fillStyle = isHover ? '#ffffff' : 'rgba(255,255,255,0.82)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getLabel(n), n.x, n.y + size + 14);
    });
  }

  let rafId;
  function tick() {
    t += 1;
    step();
    draw();
    rafId = requestAnimationFrame(tick);
  }
  tick();

  function getNodeAt(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const size = getSize(n) * 1.4;
      if ((x - n.x) ** 2 + (y - n.y) ** 2 < size * size) return n;
    }
    return null;
  }

  function localPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  const tooltip = getTooltip ? document.createElement('div') : null;
  if (tooltip) {
    tooltip.className = canvas.id === 'skills-canvas' ? 'kg-tooltip' : 'kg-tooltip';
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(tooltip);
  }

  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = localPos(e);
    if (dragNode) {
      dragNode.x = x; dragNode.y = y; dragNode.vx = 0; dragNode.vy = 0;
      return;
    }
    const n = getNodeAt(x, y);
    hoverNode = n;
    canvas.style.cursor = n ? 'pointer' : (draggable ? 'grab' : 'default');
    if (tooltip) {
      if (n) {
        tooltip.textContent = getTooltip(n);
        tooltip.style.left = n.x + 'px';
        tooltip.style.top = n.y + 'px';
        tooltip.style.opacity = 1;
        tooltip.style.background = colorFor(n) + '22';
        tooltip.style.borderColor = colorFor(n);
        tooltip.style.color = '#fff';
      } else {
        tooltip.style.opacity = 0;
      }
    }
  });
  canvas.addEventListener('mouseleave', () => { hoverNode = null; if (tooltip) tooltip.style.opacity = 0; });

  if (draggable) {
    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = localPos(e);
      dragNode = getNodeAt(x, y);
      if (dragNode) canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => { dragNode = null; });
  }

  return {
    destroy() { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); },
  };
};
