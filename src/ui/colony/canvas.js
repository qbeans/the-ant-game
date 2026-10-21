// The animated cross-section of the colony: tunnels, chambers, and ants walking between them.

import { era, isBuffActive, workersHome } from '../../core/index.js';
import { byId } from '../dom.js';
import { store } from '../store.js';
import { drawAnt } from './ant.js';
import { drawProps, drawSky } from './scenery.js';

const MAX_VISIBLE_CHAMBERS = 14;
const MAX_ANTS_DRAWN = 140;

// Tunnel graph in 0..1 coordinates of the underground area (y = 0 is the surface). `parent` links each node to the tunnel it hangs off.
// Nodes 0-3 always exist (entrance, queen chamber, sugar pile, field); chambers from index 4 appear as you dig.
const NODE_LAYOUT = [
  { x: 0.5, y: 0, parent: -1, kind: 'gate' }, { x: 0.5, y: 0.6, parent: 0, kind: 'queen' },
  { x: 0.87, y: 0, parent: 0, kind: 'pile', surface: true }, { x: 0.13, y: 0, parent: 0, kind: 'field', surface: true },
  { x: 0.3, y: 0.28, parent: 0 }, { x: 0.72, y: 0.3, parent: 0 }, { x: 0.18, y: 0.6, parent: 4 }, { x: 0.84, y: 0.62, parent: 5 },
  { x: 0.36, y: 0.88, parent: 1 }, { x: 0.64, y: 0.9, parent: 1 }, { x: 0.07, y: 0.86, parent: 6 }, { x: 0.94, y: 0.9, parent: 7 },
  { x: 0.12, y: 0.32, parent: 4 }, { x: 0.88, y: 0.3, parent: 5 }, { x: 0.5, y: 0.95, parent: 1 }, { x: 0.25, y: 0.95, parent: 8 },
  { x: 0.77, y: 0.97, parent: 9 }, { x: 0.6, y: 0.2, parent: 0 },
];
const GATE = 0, QUEEN_CHAMBER = 1;

const view = { dirty: true, ants: [], width: 0, height: 0, dpr: 1, background: null, nodes: [], links: [], signature: '', generation: -1 };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFrame = performance.now();

export const markColonyDirty = () => { view.dirty = true; };

export function startColony() {
  addEventListener('resize', markColonyDirty);
  requestAnimationFrame(drawFrame);
}

/** Anything that changes the static background. */
function backgroundSignature(s) {
  return [Math.min(MAX_VISIBLE_CHAMBERS, s.chambers + 1), s.owned.queen > 0, s.owned.aphid > 0, s.owned.ladybug > 0,
    s.owned.fungus > 0, s.owned.picnic > 0, era(s), !!s.milestones.picnic].join();
}

function seeded(seed) {
  let x = seed;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

function layout(canvas, s) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  Object.assign(view, { width: w, height: h, dpr });

  const surface = Math.round(h * 0.22), depth = h - surface - 22;
  const visible = 4 + Math.min(MAX_VISIBLE_CHAMBERS, s.chambers + 1);
  view.nodes = NODE_LAYOUT.slice(0, visible).map((n, i) => ({
    ...n, index: i, X: 18 + n.x * (w - 36), Y: n.surface ? surface - 4 : surface + 12 + n.y * depth,
  }));
  const edges = view.nodes.filter(n => n.parent >= 0).map(n => [n.parent, n.index]);
  view.links = view.nodes.map(() => []);
  for (const [a, b] of edges) { view.links[a].push(b); view.links[b].push(a); }

  view.background = paintBackground(canvas, s, w, h, dpr, surface, edges);
  view.dirty = false;
  view.signature = backgroundSignature(s);
}

function paintBackground(canvas, s, w, h, dpr, surface, edges) {
  const bg = document.createElement('canvas');
  bg.width = canvas.width; bg.height = canvas.height;
  const g = bg.getContext('2d');
  g.scale(dpr, dpr);
  const e = era(s), rand = seeded(7);

  // Sky, stars, era scenery
  const sky = g.createLinearGradient(0, 0, 0, surface);
  sky.addColorStop(0, e >= 5 ? '#06060f' : '#151a35');
  sky.addColorStop(1, e >= 5 ? '#1d1838' : '#3a3355');
  g.fillStyle = sky; g.fillRect(0, 0, w, surface);
  g.fillStyle = '#f3ecdf';
  for (let i = 0; i < 28; i++) { g.globalAlpha = 0.2 + rand() * 0.6; g.fillRect(rand() * w, rand() * surface * 0.7, 1.2, 1.2); }
  g.globalAlpha = 1;
  drawSky(g, w, surface, e, rand);

  // Soil layers and pebbles
  ['#4a3322', '#3e2b1d', '#342418', '#2b1e14'].forEach((color, i) => {
    g.fillStyle = color; g.fillRect(0, surface + i * (h - surface) / 4, w, (h - surface) / 4 + 1);
  });
  for (let i = 0; i < 90; i++) {
    g.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,.22)' : 'rgba(255,220,180,.07)';
    g.beginPath(); g.ellipse(rand() * w, surface + 6 + rand() * (h - surface), 1 + rand() * 4, 1 + rand() * 2.5, rand() * 3, 0, 7); g.fill();
  }

  // Grass
  g.fillStyle = '#3d5a2a'; g.fillRect(0, surface - 3, w, 5);
  g.strokeStyle = '#5b8040'; g.lineWidth = 1.2;
  for (let x = 2; x < w; x += 5 + rand() * 6) { g.beginPath(); g.moveTo(x, surface); g.lineTo(x + (rand() - 0.5) * 4, surface - 4 - rand() * 7); g.stroke(); }

  // Tunnels and chambers
  g.lineCap = 'round'; g.strokeStyle = '#8a6744'; g.lineWidth = 7;
  for (const [a, b] of edges) {
    const A = view.nodes[a], B = view.nodes[b];
    if (A.surface || B.surface) continue;
    g.beginPath(); g.moveTo(A.X, A.Y); g.lineTo(B.X, B.Y); g.stroke();
  }
  for (const n of view.nodes) {
    if (n.surface || n.kind === 'gate') continue;
    const big = n.kind === 'queen';
    g.fillStyle = '#8a6744'; g.beginPath(); g.ellipse(n.X, n.Y, big ? 30 : 19, big ? 14 : 10, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(n.X, n.Y + 4, big ? 26 : 15, big ? 7 : 5, 0, 0, 7); g.fill();
  }

  // Mound and entrance
  const gate = view.nodes[GATE];
  g.fillStyle = '#a07a50'; g.beginPath(); g.moveTo(gate.X - 34, surface + 1); g.quadraticCurveTo(gate.X, surface - 30, gate.X + 34, surface + 1); g.fill();
  g.fillStyle = '#5b412a'; g.beginPath(); g.ellipse(gate.X, surface - 10, 4, 3, 0, 0, 7); g.fill();
  g.strokeStyle = '#8a6744'; g.lineWidth = 7; g.beginPath(); g.moveTo(gate.X, surface - 8); g.lineTo(gate.X, surface + 12); g.stroke();

  drawProps(g, w, surface, view.nodes, s);
  return bg;
}

/** Keeps roughly one drawn ant per few real ones, capped for performance. */
function syncAnts(s) {
  const home = workersHome(s);
  const wanted = home + s.owned.queen > 0 ? Math.min(MAX_ANTS_DRAWN, Math.max(1, Math.round(Math.sqrt(home) * 6))) : 0;
  while (view.ants.length < wanted) {
    const exits = view.links[GATE];
    view.ants.push({ from: GATE, to: exits[Math.floor(Math.random() * exits.length)], t: Math.random(), speed: 0.25 + Math.random() * 0.35, carrying: false, phase: Math.random() * 6 });
  }
  view.ants.length = Math.min(view.ants.length, wanted);
  const count = view.nodes.length;
  for (const ant of view.ants) if (ant.from >= count || ant.to >= count) { ant.from = GATE; ant.to = QUEEN_CHAMBER; }
}

/** At the end of a tunnel: pick up sugar at the pile, drop it in a chamber, and choose the next tunnel. */
function chooseNextTunnel(ant) {
  const arrived = view.nodes[ant.to];
  if (arrived.kind === 'pile') ant.carrying = true;
  if (arrived.kind === 'queen' || arrived.kind === undefined) ant.carrying = false;
  const onward = view.links[ant.to].filter(n => n !== ant.from);
  let next;
  if (ant.carrying) {
    // Carrying sugar: head for the entrance, then down to the queen.
    if (ant.to === GATE) next = QUEEN_CHAMBER;
    else next = view.links[ant.to].includes(GATE) ? GATE : onward[0];
  }
  if (next === undefined) next = onward.length ? onward[Math.floor(Math.random() * onward.length)] : view.links[ant.to][0];
  ant.from = ant.to;
  ant.to = next;
  ant.t = 0;
}

function drawFrame(now) {
  requestAnimationFrame(drawFrame);
  const canvas = byId('colony'), s = store.state;
  if (!canvas.offsetParent || !s) return;
  if (view.generation !== store.generation) { view.generation = store.generation; view.ants = []; view.dirty = true; }
  if (view.dirty || canvas.clientWidth !== view.width || view.signature !== backgroundSignature(s)) layout(canvas, s);
  if (!view.background) return;

  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  syncAnts(s);
  const c = canvas.getContext('2d');
  c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  c.drawImage(view.background, 0, 0, view.width, view.height);

  if (s.owned.queen) {
    const q = view.nodes[QUEEN_CHAMBER];
    drawAnt(c, q.X + 6, q.Y - 1, Math.PI, false, 2.1, now / 600);
  }
  const hurry = isBuffActive(s, 'rush') || isBuffActive(s, 'basket') ? 2 : 1;
  for (const ant of view.ants) {
    const A = view.nodes[ant.from], B = view.nodes[ant.to];
    const length = Math.hypot(B.X - A.X, B.Y - A.Y) || 1;
    if (!reduceMotion) ant.t += dt * ant.speed * 60 / length * hurry;
    if (ant.t >= 1) chooseNextTunnel(ant);
    const P = view.nodes[ant.from], Q = view.nodes[ant.to];
    const dx = Q.X - P.X, dy = Q.Y - P.Y, L = Math.hypot(dx, dy) || 1, wobble = Math.sin(ant.t * 9 + ant.phase) * 1.4;
    drawAnt(c, P.X + dx * ant.t - dy / L * wobble, P.Y + dy * ant.t + dx / L * wobble, Math.atan2(dy, dx), ant.carrying, 1, now / 90 + ant.phase);
  }
}
