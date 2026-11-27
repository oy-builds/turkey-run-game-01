// main.js — Turkey Trot: bootstrap, game loop, state machine, scoring,
// collisions and the glue between turkey, farmer, world, art and HUD.

import { VIEW, RUN, SCORE } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createTurkey, updateTurkey, drawTurkey, turkeySpeedMultiplier } from './turkey.js';
import { createFarmer, updateFarmer, farmerStumble, farmerReward, drawFarmer } from './farmer.js';
import { createWorld, updateWorld, stageFor, obstacleHitBox, turkeyHitBox, boxesOverlap } from './world.js';
import { drawBackground, drawScenery, drawObstacle, drawPickup, drawFinish } from './art.js';
import { drawHud, drawTitle, drawPause, drawCaught, drawEscaped } from './hud.js';
import { parseShotQuery, applyShotPose } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();

const state = {
  screen: 'title',        // title | play | paused | caught | escaped
  score: 0,
  distance: 0,
  lives: 3,
  corn: 0,
  feathers: 0,
  best: 0,
  speed: RUN.baseSpeed,
  time: 0,
  dashCooldown: 0,
  turkey: createTurkey(),
  farmer: createFarmer(),
  world: createWorld(11),
  flashMessage: '',
  flashTime: 0,
  frozen: false,        // screenshot poses freeze the simulation
};

function resetRun() {
  state.score = 0;
  state.distance = 0;
  state.lives = 3;
  state.corn = 0;
  state.feathers = 0;
  state.speed = RUN.baseSpeed;
  state.turkey = createTurkey();
  state.farmer = createFarmer();
  state.world = createWorld((Math.random() * 1e9) | 0);
  state.screen = 'play';
  audio.startMusic();
}

function endRun(escaped) {
  if (escaped) {
    state.score += SCORE.escapeBonus;
    audio.escaped();
  } else {
    audio.caught();
  }
  state.best = Math.max(state.best, state.score);
  state.screen = escaped ? 'escaped' : 'caught';
  audio.stopMusic();
}

function stumble(ob) {
  const t = state.turkey;
  if (t.invincible > 0) return;
  t.invincible = RUN.stumbleInvincible;
  t.stumbleFlash = 0.5;
  state.lives -= 1;
  farmerStumble(state.farmer);
  audio.stumble();
  state.flashMessage = ob.kind === 'knife' ? 'THE KNIFE!' : ob.kind === 'oven' ? 'TOO HOT!' : 'STUMBLE!';
  state.flashTime = 1.0;
  if (state.lives <= 0) endRun(false);
}

function stepPlay(dt) {
  const t = state.turkey;
  const f = state.farmer;

  state.time += dt;
  state.speed = Math.min(RUN.maxSpeed, RUN.baseSpeed + state.distance * RUN.speedRampPerMetre);
  const speed = state.speed * turkeySpeedMultiplier(t);

  updateTurkey(t, input, dt,
    () => audio.jump(),
    () => audio.doubleJump(),
    () => { audio.dash(); farmerReward(f, RUN.farmerLoseOnDash); });
  state.dashCooldown = t.dashCooldown;

  updateWorld(state.world, dt, speed, state.distance, false);
  state.distance = state.world.scrollX * RUN.metresPerPixel;
  state.score += speed * dt * RUN.metresPerPixel * SCORE.metre;

  // Farmer chase
  const caught = updateFarmer(f, dt, speed, t.dashing > 0);
  if (caught) { endRun(false); return; }

  // Collisions
  const tb = turkeyHitBox(t);
  for (const ob of state.world.obstacles) {
    const hb = obstacleHitBox(ob);
    const screenX = ob.x - state.world.scrollX;
    if (screenX < -160 || screenX > VIEW.width + 160) continue;
    const hit = { ...hb, x: screenX };
    if (!ob.passed && screenX + hb.w < t.x - 20) {
      ob.passed = true;
      if (ob.kind !== 'puddle') {
        state.score += SCORE.nearMiss;
        audio.nearMiss();
      }
    }
    if (boxesOverlap(tb, hit)) {
      if (ob.kind === 'puddle') {
        state.speed = Math.max(RUN.baseSpeed * 0.7, state.speed * 0.98);
      } else {
        stumble(ob);
        if (state.screen !== 'play') return;
      }
    }
  }

  // Pickups
  for (const p of state.world.pickups) {
    if (p.taken) continue;
    const px = p.x - state.world.scrollX;
    const py = p.y;
    const dx = px - t.x;
    const dy = py - (VIEW.groundY - t.y - 30);
    if (Math.abs(dx) < 36 && Math.abs(dy) < 42) {
      p.taken = true;
      if (p.kind === 'corn') {
        state.corn += 1;
        state.score += SCORE.corn;
        farmerReward(f, RUN.farmerLosePerCorn);
        audio.corn();
      } else {
        state.feathers += 1;
        state.score += SCORE.feather;
        farmerReward(f, RUN.farmerLosePerCorn * 3);
        audio.feather();
      }
    }
  }

  // Escape!
  if (state.distance >= RUN.escapeDistance) { endRun(true); return; }

  if (state.flashTime > 0) state.flashTime -= dt;
  if (input.wasPressed('pause')) { state.screen = 'paused'; audio.stopMusic(); }
}

function render() {
  const w = state.world;
  const stage = stageFor(state.distance);
  drawBackground(ctx, w.scrollX, state.distance);
  drawScenery(ctx, w.scenery, w.scrollX, state.distance);
  drawFinish(ctx, w.scrollX, state.distance);
  for (const p of w.pickups) drawPickup(ctx, p, w.scrollX, state.time);
  for (const ob of w.obstacles) drawObstacle(ctx, ob, w.scrollX);
  drawFarmer(ctx, state.farmer, state.turkey.x, VIEW.groundY);
  drawTurkey(ctx, state.turkey, VIEW.groundY);

  if (state.screen === 'play' || state.screen === 'paused') {
    drawHud(ctx, {
      score: Math.floor(state.score),
      distance: state.distance,
      lives: state.lives,
      stageName: stage.name,
      corn: state.corn,
      feathers: state.feathers,
      farmerGap: state.farmer.gap,
      dashCooldown: state.dashCooldown,
    });
  }
  if (state.flashTime > 0 && state.screen === 'play') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6a5e';
    ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
    ctx.fillText(state.flashMessage, VIEW.width / 2, 150);
    ctx.restore();
  }
  if (state.screen === 'title') drawTitle(ctx, state.best);
  if (state.screen === 'paused') drawPause(ctx);
  if (state.screen === 'caught') drawCaught(ctx, { ...state, score: Math.floor(state.score) });
  if (state.screen === 'escaped') drawEscaped(ctx, { ...state, score: Math.floor(state.score) });
}

function handleGlobalKeys() {
  if (input.wasPressed('mute')) {
    const muted = audio.toggleMute();
    state.flashMessage = muted ? 'MUTED' : 'SOUND ON';
    state.flashTime = 0.8;
  }
  if (state.screen === 'title' && (input.wasPressed('jump') || input.wasPressed('confirm') || input.consumeMouse())) {
    audio.unlock();
    resetRun();
  } else if ((state.screen === 'caught' || state.screen === 'escaped') &&
      (input.wasPressed('restart') || input.wasPressed('jump') || input.wasPressed('confirm') || input.consumeMouse())) {
    resetRun();
  } else if (state.screen === 'paused' && (input.wasPressed('pause') || input.wasPressed('jump'))) {
    state.screen = 'play';
    audio.startMusic();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleGlobalKeys();
  if (state.screen === 'play' && !state.frozen) stepPlay(dt);
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

// Screenshot poses (?shot=...) jump straight into a fixed frame.
const shot = parseShotQuery(window.location.search);
if (shot) applyShotPose(state, shot.shot, shot.seed);

// Debug hook for play-testing: read-only view of the live state.
window.__turkeyTrot = state;

requestAnimationFrame(frame);
