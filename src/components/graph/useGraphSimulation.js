import { useEffect } from 'react';

// ── Constantes de layout (exportées pour le canvas) ──────────────────────────
export const W  = 1000;
export const H  = 680;
export const CX = W / 2;
export const CY = H / 2;

// ── Constantes simulation physique ───────────────────────────────────────────
const BOUNDARY     = 80;
const REPULSION    = 14000;
const SPRING_LEN   = 210;
const SPRING_K     = 0.035;
const DAMPING      = 0.78;
const CENTER_PULL  = 0.012;
const MAX_SPEED    = 14;
const MAX_STEPS    = 500;
const KE_THRESHOLD = 0.15;

function simStep(positions, edges, centralId = null) {
  const ids = Object.keys(positions);
  const forces = {};
  ids.forEach(id => { forces[id] = { fx: 0, fy: 0 }; });

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = positions[ids[i]], b = positions[ids[j]];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = REPULSION / (dist * dist);
      forces[ids[i]].fx -= (dx / dist) * f;  forces[ids[i]].fy -= (dy / dist) * f;
      forces[ids[j]].fx += (dx / dist) * f;  forces[ids[j]].fy += (dy / dist) * f;
    }
  }
  edges.forEach(({ fromId, toId, springLen: sl }) => {
    const a = positions[fromId], b = positions[toId];
    if (!a || !b) return;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = SPRING_K * (dist - (sl ?? SPRING_LEN));
    forces[fromId].fx += (dx / dist) * f;  forces[fromId].fy += (dy / dist) * f;
    forces[toId].fx   -= (dx / dist) * f;  forces[toId].fy   -= (dy / dist) * f;
  });

  const next = {};
  ids.forEach(id => {
    if (centralId !== null && id === centralId) {
      next[id] = { ...positions[id], vx: 0, vy: 0 };
      return;
    }
    const p = positions[id], f = forces[id];
    let vx = (p.vx + f.fx + (CX - p.x) * CENTER_PULL) * DAMPING;
    let vy = (p.vy + f.fy + (CY - p.y) * CENTER_PULL) * DAMPING;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_SPEED) { vx = vx / speed * MAX_SPEED; vy = vy / speed * MAX_SPEED; }
    next[id] = {
      x: Math.max(BOUNDARY, Math.min(W - BOUNDARY, p.x + vx)),
      y: Math.max(BOUNDARY, Math.min(H - BOUNDARY, p.y + vy)),
      vx, vy,
    };
  });
  return next;
}

function runSimulation(init, edges, centralId, setPositions, posRef) {
  posRef.current = init;
  setPositions({ ...init });
  let frameId, step = 0;
  const tick = () => {
    step++;
    const next = simStep(posRef.current, edges, centralId);
    posRef.current = next;
    if (step % 3 === 0) setPositions({ ...next });
    const ke = Object.values(next).reduce((s, p) => s + p.vx * p.vx + p.vy * p.vy, 0);
    if (ke > KE_THRESHOLD && step < MAX_STEPS) frameId = requestAnimationFrame(tick);
    else setPositions({ ...next });
  };
  frameId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frameId);
}

export function useGraphSimulation({ graph, setPositions, posRef }) {
  useEffect(() => {
    if (!graph) return;
    const N    = graph.satellites.length;
    const NRel = (graph.relNodes ?? []).length;
    const init = { [graph.central.id]: { x: CX, y: CY, vx: 0, vy: 0 } };
    graph.satellites.forEach((node, i) => {
      const angle = (i / Math.max(N, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = Math.min(290, Math.max(230, N * 16));
      init[node.id] = {
        x: CX + r * Math.cos(angle) + (Math.random() - 0.5) * 30,
        y: CY + r * Math.sin(angle) + (Math.random() - 0.5) * 30,
        vx: 0, vy: 0,
      };
    });
    (graph.relNodes ?? []).forEach((relNode, i) => {
      const angle = (i / Math.max(NRel, 1)) * 2 * Math.PI - Math.PI / 2;
      init[relNode.id] = {
        x: CX + 120 * Math.cos(angle) + (Math.random() - 0.5) * 20,
        y: CY + 120 * Math.sin(angle) + (Math.random() - 0.5) * 20,
        vx: 0, vy: 0,
      };
    });
    return runSimulation(init, graph.edges, graph.central.id, setPositions, posRef);
  }, [graph]);
}
