// Static drawings for the colony background: the sky details per era, and the surface props per producer.

/** Sky details that change as the colony's reach grows: a house, a city, the Moon, a galaxy. */
export function drawSky(g, w, surface, era, rand) {
  if (era >= 6) drawGalaxy(g, w, surface);
  if (era >= 5) drawMoonAndRocket(g, w, surface);
  if (era >= 4) drawSkyline(g, w, surface, rand);
  if (era >= 3) drawHouse(g, w, surface);
}

function drawGalaxy(g, w, surface) {
  const gx = w * 0.5, gy = surface * 0.38;
  const glow = g.createRadialGradient(gx, gy, 0, gx, gy, surface * 0.5);
  glow.addColorStop(0, 'rgba(220,200,255,.55)');
  glow.addColorStop(1, 'rgba(120,90,200,0)');
  g.fillStyle = glow;
  g.beginPath(); g.ellipse(gx, gy, surface * 0.9, surface * 0.28, -0.3, 0, 7); g.fill();
  g.fillStyle = '#efe6ff';
  g.globalAlpha = 0.6;
  for (let i = 0; i < 60; i++) {
    const angle = i * 0.45, distance = i * 0.9;
    g.fillRect(gx + Math.cos(angle) * distance * 1.6, gy + Math.sin(angle) * distance * 0.5, 1, 1);
  }
  g.globalAlpha = 1;
}

function drawMoonAndRocket(g, w, surface) {
  const mx = w * 0.16, my = surface * 0.36;
  g.fillStyle = '#ece5d6';
  g.beginPath(); g.arc(mx, my, 11, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,.12)';
  for (const [dx, dy, r] of [[-3, -2, 2.5], [4, 3, 2], [1, 6, 1.5]]) { g.beginPath(); g.arc(mx + dx, my + dy, r, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(244,183,64,.7)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(w * 0.26, surface * 0.75); g.quadraticCurveTo(w * 0.28, surface * 0.4, w * 0.33, surface * 0.2); g.stroke();
  g.fillStyle = '#f4ece1';
  g.beginPath(); g.moveTo(w * 0.33, surface * 0.12); g.lineTo(w * 0.338, surface * 0.26); g.lineTo(w * 0.322, surface * 0.26); g.fill();
}

function drawSkyline(g, w, surface, rand) {
  let x = 0;
  while (x < w * 0.42) {
    const bw = 8 + rand() * 14, bh = surface * (0.25 + rand() * 0.45);
    g.fillStyle = '#211c37';
    g.fillRect(x, surface - bh, bw, bh);
    g.fillStyle = 'rgba(244,183,64,.55)';
    for (let j = 0; j < 3; j++) if (rand() < 0.5) g.fillRect(x + 2 + rand() * (bw - 4), surface - bh + 3 + rand() * (bh - 6), 1.5, 1.5);
    x += bw + 2;
  }
}

function drawHouse(g, w, surface) {
  const hx = w * 0.6, hw = Math.min(70, w * 0.16), hh = surface * 0.5;
  g.fillStyle = '#2a2342';
  g.fillRect(hx, surface - hh, hw, hh);
  g.beginPath(); g.moveTo(hx - 5, surface - hh); g.lineTo(hx + hw / 2, surface - hh - surface * 0.28); g.lineTo(hx + hw + 5, surface - hh); g.fill();
  g.fillStyle = 'rgba(244,183,64,.8)';
  g.fillRect(hx + hw * 0.18, surface - hh * 0.7, hw * 0.22, hh * 0.25);
  g.fillRect(hx + hw * 0.6, surface - hh * 0.7, hw * 0.22, hh * 0.25);
}

/** Small surface and chamber props that appear once you own the matching producer. */
export function drawProps(g, w, surface, nodes, s) {
  if (s.owned.fungus && nodes[4]) {
    const n = nodes[4];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = '#e8dccb'; g.fillRect(n.X - 9 + i * 6, n.Y, 1.6, 5);
      g.fillStyle = '#c9845a'; g.beginPath(); g.ellipse(n.X - 8 + i * 6, n.Y, 3.2, 2.2, 0, Math.PI, 0); g.fill();
    }
  }
  const pile = nodes[2];
  g.fillStyle = '#fbf6ec';
  for (let i = 0; i < 9; i++) {
    const px = pile.X - 12 + (i % 4) * 6 + (i > 3 ? 3 : 0) + (i > 6 ? 3 : 0), py = surface - 6 - (i > 3 ? 5 : 0) - (i > 6 ? 5 : 0);
    g.fillRect(px, py, 5, 5);
  }
  if (s.owned.aphid) {
    const field = nodes[3];
    g.strokeStyle = '#5b8040'; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const x = field.X - 10 + i * 10;
      g.beginPath(); g.moveTo(x, surface); g.lineTo(x + 2, surface - 26 + i * 4); g.stroke();
      g.fillStyle = '#93c46e';
      for (let j = 0; j < 3; j++) { g.beginPath(); g.ellipse(x + 2.5, surface - 8 - j * 6 + i * 2, 2.4, 1.6, 0, 0, 7); g.fill(); }
    }
  }
  if (s.owned.ladybug) {
    for (let i = 0; i < 3; i++) {
      const x = w * 0.66 + i * 13, y = surface - 5;
      g.fillStyle = '#e8513f'; g.beginPath(); g.arc(x, y, 4, Math.PI, 0); g.fill();
      g.fillStyle = '#17100b'; g.beginPath(); g.arc(x + 4.5, y - 1, 1.8, 0, 7); g.fill();
    }
  }
  if (s.owned.picnic) {
    const bx = w - 46, by = surface - 9;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? '#e8513f' : '#fff4ea';
      g.fillRect(bx + i * 7, by + j * 4, 7, 4);
    }
    if (s.milestones.picnic) {
      g.strokeStyle = '#d6c7b3'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(bx + 20, by); g.lineTo(bx + 20, by - 22); g.stroke();
      g.fillStyle = '#f3ecdf'; g.fillRect(bx + 21, by - 22, 11, 7);
    }
  }
}
