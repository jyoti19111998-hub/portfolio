/**
 * Stylised interactive "network globe" world map — an equirectangular dot
 * grid (not literal coastlines, styled deliberately as a network diagram)
 * with pins plotted at real lat/lng for the regions she's open to working
 * with remotely, connected back to her home base in India.
 */
(function () {
  const svg = document.getElementById('world-map-svg');
  const tooltip = document.getElementById('map-tooltip');
  if (!svg) return;
  const regions = window.PORTFOLIO_DATA.openToRegions;

  const W = 1000, H = 500;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  function project(lat, lng) {
    const x = (lng + 180) / 360 * W;
    const y = (90 - lat) / 180 * H;
    return { x, y };
  }

  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs) => {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };

  // Dot grid background
  const gridGroup = make('g', { opacity: '0.5' });
  for (let x = 0; x <= W; x += 20) {
    for (let y = 0; y <= H; y += 20) {
      // fade dots near poles for a globe-like feel
      const distFromMid = Math.abs(y - H / 2) / (H / 2);
      const r = Math.random() > 0.4 ? 1 : 0;
      if (!r) continue;
      gridGroup.appendChild(make('circle', { cx: x, cy: y, r: 1.1, fill: `rgba(120,150,255,${0.5 - distFromMid * 0.3})` }));
    }
  }
  svg.appendChild(gridGroup);

  const home = regions[0];
  const homePos = project(home.lat, home.lng);

  // Arcs from home to each other region
  const arcsGroup = make('g', {});
  regions.slice(1).forEach((r) => {
    const p = project(r.lat, r.lng);
    const mx = (homePos.x + p.x) / 2;
    const my = Math.min(homePos.y, p.y) - 60;
    const path = make('path', {
      d: `M ${homePos.x} ${homePos.y} Q ${mx} ${my} ${p.x} ${p.y}`,
      fill: 'none', stroke: 'url(#arcGrad)', 'stroke-width': 1.4, 'stroke-dasharray': '4 5', opacity: 0.55,
    });
    arcsGroup.appendChild(path);
  });
  svg.appendChild(arcsGroup);

  const defs = make('defs', {});
  const grad = make('linearGradient', { id: 'arcGrad', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
  grad.appendChild(make('stop', { offset: '0%', 'stop-color': '#5ce1ff' }));
  grad.appendChild(make('stop', { offset: '100%', 'stop-color': '#9b5cff' }));
  defs.appendChild(grad);
  svg.insertBefore(defs, svg.firstChild);

  // Pins
  regions.forEach((r, i) => {
    const p = project(r.lat, r.lng);
    const g = make('g', { class: 'map-pin', 'data-name': r.name, 'data-note': r.note });
    const isHome = i === 0;
    g.appendChild(make('circle', { class: 'ring', cx: p.x, cy: p.y, r: 6, fill: 'none', stroke: isHome ? '#5ce1ff' : '#9b5cff', 'stroke-width': 1.4 }));
    g.appendChild(make('circle', { class: 'core', cx: p.x, cy: p.y, r: isHome ? 6 : 5, fill: isHome ? '#5ce1ff' : '#c084fc' }));
    g.appendChild(make('text', { x: p.x, y: p.y - 12, 'text-anchor': 'middle', fill: 'rgba(255,255,255,0.85)', 'font-size': 10, 'font-family': 'Space Grotesk, sans-serif' , 'font-weight': 600}));
    g.lastChild.textContent = r.name;
    svg.appendChild(g);

    g.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      tooltip.textContent = `${r.name} — ${r.note}`;
      tooltip.style.left = (e.clientX - rect.left) + 'px';
      tooltip.style.top = (e.clientY - rect.top) + 'px';
      tooltip.style.opacity = 1;
      tooltip.style.borderColor = isHome ? '#5ce1ff' : '#9b5cff';
    });
    g.addEventListener('mouseleave', () => { tooltip.style.opacity = 0; });
  });
})();
