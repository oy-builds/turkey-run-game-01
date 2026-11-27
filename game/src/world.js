// world.js — the road ahead: obstacle + pickup spawning per stage, movement,
// collision with Tilly, and the parallax farm/barn/kitchen scenery.

import { RUN, STAGES, SPAWN, VIEW } from './config.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stageFor(distance) {
  for (const s of STAGES) if (distance >= s.from && distance < s.to) return s;
  return STAGES[STAGES.length - 1];
}

const OBSTACLE_KINDS = {
  fence:   { w: 26, h: 52, duckable: false, jump: true },
  hay:     { w: 52, h: 42, duckable: false, jump: true },
  knife:   { w: 16, h: 96, duckable: true,  jump: false, swing: true },
  oven:    { w: 74, h: 78, duckable: false, jump: true },
  puddle:  { w: 70, h: 10, duckable: false, jump: true, slow: true },
  beam:    { w: 60, h: 40, duckable: true,  jump: false, hang: true },
};

function kindsForStage(stageName) {
  if (stageName === 'FARMYARD') return ['fence', 'hay', 'puddle'];
  if (stageName === 'BARN') return ['fence', 'hay', 'beam', 'puddle'];
  if (stageName === 'KITCHEN') return ['oven', 'knife', 'beam', 'fence'];
  return ['fence', 'hay', 'knife'];
}

export function createWorld(seed = 1) {
  return {
    rng: mulberry32(seed),
    seed,
    obstacles: [],
    pickups: [],
    nextSpawnX: VIEW.width + 120,
    scrollX: 0,
    scenery: [],       // {x, kind, variant} parallax props, x in world px
    nextSceneryX: 0,
  };
}

function spawnObstacle(w, x, distance, speed) {
  const stage = stageFor(distance);
  const kinds = kindsForStage(stage.name);
  const kind = kinds[Math.floor(w.rng() * kinds.length)];
  const def = OBSTACLE_KINDS[kind];
  const ob = {
    kind, x, w: def.w, h: def.h,
    passed: false,
    swingPhase: w.rng() * Math.PI * 2,
    slow: !!def.slow,
  };
  // Knives and beams hang from the top; the rest sit on the ground.
  ob.y = (kind === 'knife' || kind === 'beam') ? 0 : VIEW.groundY - def.h;
  w.obstacles.push(ob);
}

function spawnPickups(w, x) {
  const r = w.rng();
  if (r < SPAWN.featherChance) {
    w.pickups.push({ kind: 'feather', x, y: VIEW.groundY - 150, taken: false });
  } else if (r < SPAWN.cornChance) {
    const n = 2 + Math.floor(w.rng() * 3);
    for (let i = 0; i < n; i++) {
      w.pickups.push({ kind: 'corn', x: x + i * 34, y: VIEW.groundY - 44 - (i % 2) * 26, taken: false });
    }
  }
}

function spawnScenery(w) {
  const kinds = ['tree', 'barn', 'fence-post', 'pumpkin', 'haystack', 'window', 'pot'];
  const kind = kinds[Math.floor(w.rng() * kinds.length)];
  w.scenery.push({ x: w.nextSceneryX, kind, variant: Math.floor(w.rng() * 3) });
  w.nextSceneryX += 180 + w.rng() * 260;
}

export function updateWorld(w, dt, speed, distance, paused) {
  if (paused) return;
  const dx = speed * dt;
  w.scrollX += dx;

  while (w.nextSceneryX < w.scrollX + VIEW.width + 300) spawnScenery(w);
  w.scenery = w.scenery.filter((s) => s.x > w.scrollX - 260);

  // Spawn ahead of the right edge; gap shrinks as speed grows.
  const gap = SPAWN.minGapPx + (SPAWN.maxGapPx - SPAWN.minGapPx) * (1 - (speed - RUN.baseSpeed) / (RUN.maxSpeed - RUN.baseSpeed));
  while (w.nextSpawnX < w.scrollX + VIEW.width + 200) {
    spawnObstacle(w, w.nextSpawnX, distance, speed);
    spawnPickups(w, w.nextSpawnX + 90);
    w.nextSpawnX += gap * (0.85 + w.rng() * 0.5);
  }

  for (const ob of w.obstacles) ob.swingPhase += dt * 3.2;
  w.obstacles = w.obstacles.filter((ob) => ob.x > w.scrollX - 200);
  w.pickups = w.pickups.filter((p) => p.x > w.scrollX - 120 && !p.taken);
}

// AABB overlap between Tilly and an obstacle. Knives sweep, so use their
// blade position at this instant; beams only hit a standing turkey.
export function obstacleHitBox(ob) {
  if (ob.kind === 'knife') {
    const swing = Math.sin(ob.swingPhase) * 42;
    return { x: ob.x + swing, y: 96, w: 14, h: 150 };
  }
  if (ob.kind === 'beam') {
    return { x: ob.x, y: 150, w: ob.w, h: 44 };
  }
  if (ob.kind === 'puddle') {
    return { x: ob.x, y: VIEW.groundY - 8, w: ob.w, h: 8 };
  }
  return { x: ob.x, y: ob.y, w: ob.w, h: ob.h };
}

export function turkeyHitBox(t) {
  const h = t.ducking ? RUN.duckHeight : t.height;
  return { x: t.x - 20, y: VIEW.groundY - t.y - h, w: 46, h };
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
