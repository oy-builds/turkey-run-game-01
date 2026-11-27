// shots.js — deterministic screenshot poses. The game reads ?shot=start |
// ?shot=play | ?shot=caught | ?shot=escaped (and &seed=N) and jumps straight
// into a fixed, lively frame of that state, so the screenshots are real
// renders of the game's own code.

import { RUN } from './config.js';

export function parseShotQuery(search) {
  const q = new URLSearchParams(search);
  const shot = q.get('shot');
  if (!shot) return null;
  return { shot, seed: Number(q.get('seed') || 7) };
}

// Drive the state into the requested pose. Called once at boot. Posed shots
// are frozen: the game renders one fixed frame instead of running on, so the
// turkey never stumbles mid-screenshot.
export function applyShotPose(state, shot, seed) {
  state.frozen = true;
  if (shot === 'start') {
    state.screen = 'title';
    state.farmer.gap = 520; // Bram waits off-screen for the title
    return;
  }
  if (shot === 'play') {
    // A mid-run frame in the kitchen: 1150 m in, oven and knife ahead,
    // Tilly mid-jump over a fence, Bram closing in, corn on the ground.
    state.screen = 'play';
    state.distance = 1150;
    state.world.scrollX = 1150 / RUN.metresPerPixel;
    state.world.nextSpawnX = state.world.scrollX + 900;
    state.turkey.y = 120;
    state.turkey.vy = -220;
    state.turkey.runPhase = 2.4;
    state.farmer.gap = 150;
    state.farmer.grumble = 0;
    state.lives = 3;
    state.score = 2140;
    state.corn = 14;
    state.feathers = 1;
    seedWorld(state, seed);
    return;
  }
  if (shot === 'caught') {
    state.screen = 'caught';
    state.distance = 812;
    state.score = 1875;
    state.corn = 12;
    state.feathers = 1;
    state.lives = 0;
    state.best = 1875;
    state.farmer.gap = RUN.farmerCatchGap;
    state.world.scrollX = 812 / RUN.metresPerPixel;
    seedWorld(state, seed);
    return;
  }
  if (shot === 'escaped') {
    state.screen = 'escaped';
    state.distance = 1500;
    state.score = 3420;
    state.corn = 21;
    state.feathers = 2;
    state.lives = 2;
    state.best = 3420;
    state.farmer.gap = 520; // Bram lost her in the trees
    // Pull the scroll back a little so the FREE! gate sits on-screen.
    state.world.scrollX = 1500 / RUN.metresPerPixel - 260;
    seedWorld(state, seed);
  }
}

// Fill the visible stretch with a fixed, photogenic set of obstacles:
// a knife and an oven ahead, a fence further on, corn and a feather below.
function seedWorld(state, seed) {
  const w = state.world;
  const base = w.scrollX;
  w.obstacles = [
    { kind: 'knife', x: base + 430, w: 16, h: 96, y: 0, passed: false, swingPhase: 0.8 },
    { kind: 'oven', x: base + 640, w: 74, h: 78, y: 452 - 78, passed: false, swingPhase: 0 },
    { kind: 'fence', x: base + 860, w: 26, h: 52, y: 452 - 52, passed: false, swingPhase: 0 },
  ];
  w.pickups = [
    { kind: 'corn', x: base + 300, y: 452 - 44, taken: false },
    { kind: 'corn', x: base + 334, y: 452 - 70, taken: false },
    { kind: 'corn', x: base + 368, y: 452 - 44, taken: false },
    { kind: 'feather', x: base + 540, y: 452 - 150, taken: false },
  ];
  w.scenery = [
    { x: base + 60, kind: 'tree', variant: 1 },
    { x: base + 330, kind: 'window', variant: 0 },
    { x: base + 920, kind: 'pumpkin', variant: 0 },
  ];
}
