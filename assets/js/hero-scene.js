/* Three.js hero background: drifting neural-network-like point cloud with connecting edges,
   plus subtle mouse parallax on the camera. Degrades gracefully if THREE isn't available. */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 34;

  const NODE_COUNT = window.innerWidth < 700 ? 55 : 110;
  const RADIUS = 26;
  const nodes = [];
  const positions = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * RADIUS * 2,
      (Math.random() - 0.5) * RADIUS * 1.2,
      (Math.random() - 0.5) * RADIUS
    );
    nodes.push({ pos: v, vel: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01) });
    positions.set([v.x, v.y, v.z], i * 3);
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({ color: 0x8fd6ff, size: 0.45, transparent: true, opacity: 0.85, sizeAttenuation: true });
  const pointCloud = new THREE.Points(pointsGeo, pointsMat);
  scene.add(pointCloud);

  // Line connections (rebuilt each frame from a proximity graph, capped for perf)
  const MAX_LINES = NODE_COUNT * 3;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(MAX_LINES * 2 * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.18 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const CONNECT_DIST = 8.5;

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.4;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.25;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (prefersReduced) { renderer.render(scene, camera); return; }

    const posAttr = pointsGeo.attributes.position;
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      n.pos.add(n.vel);
      ['x', 'y', 'z'].forEach((axis) => {
        const limit = axis === 'y' ? RADIUS * 0.6 : RADIUS;
        if (n.pos[axis] > limit || n.pos[axis] < -limit) n.vel[axis] *= -1;
      });
      posAttr.array[i * 3] = n.pos.x;
      posAttr.array[i * 3 + 1] = n.pos.y;
      posAttr.array[i * 3 + 2] = n.pos.z;
    }
    posAttr.needsUpdate = true;

    // Rebuild connections
    let lineIdx = 0;
    outer:
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (lineIdx >= MAX_LINES) break outer;
        const d = nodes[i].pos.distanceTo(nodes[j].pos);
        if (d < CONNECT_DIST) {
          const base = lineIdx * 6;
          linePositions[base] = nodes[i].pos.x; linePositions[base + 1] = nodes[i].pos.y; linePositions[base + 2] = nodes[i].pos.z;
          linePositions[base + 3] = nodes[j].pos.x; linePositions[base + 4] = nodes[j].pos.y; linePositions[base + 5] = nodes[j].pos.z;
          lineIdx++;
        }
      }
    }
    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;

    scene.rotation.y += (targetRotY - scene.rotation.y) * 0.04;
    scene.rotation.x += (targetRotX - scene.rotation.x) * 0.04;
    scene.rotation.y += 0.0006;

    renderer.render(scene, camera);
  }
  animate();
})();
