// kitchen.js — the three stages and everything that tries to stop the turkey.
// One job: spawn and move fences, hay, pumpkins, knives, ovens and corn;
// know which stage the run is in and when the escape is won.
(function () {
  'use strict';

  var STAGES = [
    { name: 'STAGE 1 — THE FARMYARD', until: 600, speed: 300, spawnGap: 1.15 },
    { name: 'STAGE 2 — THE BARN', until: 1200, speed: 360, spawnGap: 0.95 },
    { name: 'STAGE 3 — THE KITCHEN', until: 1800, speed: 420, spawnGap: 0.8 }
  ];
  var ESCAPE_DISTANCE = 1800;

  function stageFor(distance) {
    for (var i = 0; i < STAGES.length; i++) {
      if (distance < STAGES[i].until) return i;
    }
    return STAGES.length - 1;
  }

  function createWorld() {
    return {
      distance: 0,
      stage: 0,
      obstacles: [],   // {kind, x, y, w, h, vx, passed, hit}
      pickups: [],     // {x, y, taken}
      haystacks: [],   // {x, y, used}
      spawnTimer: 0.8,
      cornTimer: 1.4,
      hayTimer: 6,
      knifeTimer: 2.5,
      time: 0
    };
  }

  function resetWorld(w) {
    w.distance = 0; w.stage = 0;
    w.obstacles = []; w.pickups = []; w.haystacks = [];
    w.spawnTimer = 0.8; w.cornTimer = 1.4; w.hayTimer = 6; w.knifeTimer = 2.5; w.time = 0;
  }

  function pickKind(stage) {
    var roll = Math.random();
    if (stage === 0) return roll < 0.45 ? 'fence' : roll < 0.75 ? 'pumpkin' : 'bale';
    if (stage === 1) return roll < 0.35 ? 'fence' : roll < 0.6 ? 'bale' : roll < 0.85 ? 'pumpkin' : 'puddle';
    return roll < 0.25 ? 'fence' : roll < 0.45 ? 'oven' : roll < 0.65 ? 'puddle' : roll < 0.85 ? 'bale' : 'pumpkin';
  }

  function spawnObstacle(w, stage) {
    var kind = pickKind(stage);
    var base = { kind: kind, x: 1000, passed: false, hit: false };
    if (kind === 'fence') { base.y = 460; base.w = 42; base.h = 50; }
    else if (kind === 'bale') { base.y = 460; base.w = 52; base.h = 52; }
    else if (kind === 'pumpkin') { base.y = 460; base.w = 40; base.h = 34; base.vx = -140; }
    else if (kind === 'puddle') { base.y = 460; base.w = 70; base.h = 12; }
    else if (kind === 'oven') { base.y = 460; base.w = 70; base.h = 46; }
    w.obstacles.push(base);
  }

  function updateWorld(w, dt, turkeySpeed, turkey) {
    w.time += dt;
    var newStage = stageFor(w.distance);
    var stageChanged = newStage !== w.stage;
    w.stage = newStage;
    var cfg = STAGES[w.stage];
    var scroll = turkeySpeed * dt;
    w.distance += scroll * 0.055; // metres, roughly

    // spawn cadence quickens per stage
    w.spawnTimer -= dt;
    if (w.spawnTimer <= 0) {
      spawnObstacle(w, w.stage);
      w.spawnTimer = cfg.spawnGap * (0.85 + Math.random() * 0.4);
    }
    w.cornTimer -= dt;
    if (w.cornTimer <= 0) {
      w.pickups.push({ x: 1000, y: 380 + Math.random() * 60, taken: false });
      w.cornTimer = 1.6 + Math.random() * 1.6;
    }
    w.hayTimer -= dt;
    if (w.hayTimer <= 0) {
      w.haystacks.push({ x: 1000, y: 460, used: false });
      w.hayTimer = 7 + Math.random() * 4;
    }
    // kitchen stage: carving knives drop from above
    if (w.stage === 2) {
      w.knifeTimer -= dt;
      if (w.knifeTimer <= 0) {
        w.obstacles.push({ kind: 'knife', x: turkey.x + 60 + Math.random() * 260, y: -30, w: 24, h: 44, vy: 520, passed: false, hit: false });
        w.knifeTimer = 1.8 + Math.random() * 1.2;
      }
    }

    // move everything left with the world
    var i, o;
    for (i = w.obstacles.length - 1; i >= 0; i--) {
      o = w.obstacles[i];
      if (o.kind === 'knife') { o.y += o.vy * dt; if (o.y > 470) o.y = 470; }
      else {
        o.x -= scroll;
        if (o.kind === 'pumpkin') o.x += o.vx * dt;
      }
      if (o.x < -120 || o.y > 480) w.obstacles.splice(i, 1);
    }
    for (i = w.pickups.length - 1; i >= 0; i--) {
      w.pickups[i].x -= scroll;
      if (w.pickups[i].x < -40) w.pickups.splice(i, 1);
    }
    for (i = w.haystacks.length - 1; i >= 0; i--) {
      w.haystacks[i].x -= scroll;
      if (w.haystacks[i].x < -100) w.haystacks.splice(i, 1);
    }
    return stageChanged;
  }

  function turkeyRect(t) {
    return { x: t.x - 20, y: t.y - 52, w: 40, h: 52 };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Returns {hit: kind|null, corn: n, nearHay: bool, cleared: n}
  function checkCollisions(w, turkey) {
    var result = { hit: null, corn: 0, nearHay: false, cleared: 0 };
    var tr = turkeyRect(turkey);
    // generous hitbox forgiveness: shrink obstacles a touch — a narrow escape is fair
    for (var i = 0; i < w.obstacles.length; i++) {
      var o = w.obstacles[i];
      if (o.hit) continue;
      var box = { x: o.x + 4, y: o.y - o.h + 4, w: o.w - 8, h: o.h - 6 };
      if (o.kind === 'knife') box = { x: o.x - 8, y: o.y - 20, w: 16, h: 40 };
      if (overlaps(tr, box)) {
        if (o.kind === 'puddle') {
          // puddles only slow you — no life lost, but the farmer gains
          o.hit = true;
          result.hit = 'puddle';
          continue;
        }
        o.hit = true;
        result.hit = o.kind;
        return result;
      }
      if (!o.passed && o.x + o.w < tr.x) { o.passed = true; result.cleared++; }
    }
    for (var j = 0; j < w.pickups.length; j++) {
      var p = w.pickups[j];
      if (!p.taken && Math.abs(p.x - turkey.x) < 34 && Math.abs(p.y - (turkey.y - 26)) < 40) {
        p.taken = true;
        result.corn++;
      }
    }
    for (var k = 0; k < w.haystacks.length; k++) {
      var hs = w.haystacks[k];
      if (!hs.used && Math.abs(hs.x + 30 - turkey.x) < 60 && turkey.onGround) {
        result.nearHay = hs;
      }
    }
    return result;
  }

  function drawWorld(w, art, ctx) {
    var i;
    for (i = 0; i < w.haystacks.length; i++) {
      if (!w.haystacks[i].used) art.drawHaystack(ctx, w.haystacks[i].x, w.haystacks[i].y);
    }
    for (i = 0; i < w.obstacles.length; i++) {
      var o = w.obstacles[i];
      if (o.hit) continue;
      if (o.kind === 'fence') art.drawFence(ctx, o.x, o.y);
      else if (o.kind === 'bale') art.drawHayBale(ctx, o.x, o.y);
      else if (o.kind === 'pumpkin') art.drawPumpkin(ctx, o.x + 20, o.y, 20);
      else if (o.kind === 'oven') art.drawOvenHazard(ctx, o.x, o.y, w.time);
      else if (o.kind === 'knife') art.drawKnife(ctx, o.x, o.y, 0);
      else if (o.kind === 'puddle') {
        ctx.fillStyle = 'rgba(90,140,200,0.75)';
        ctx.beginPath(); ctx.ellipse(o.x + 35, o.y - 4, 36, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (i = 0; i < w.pickups.length; i++) {
      if (!w.pickups[i].taken) art.drawCorn(ctx, w.pickups[i].x, w.pickups[i].y, w.time);
    }
  }

  window.GobbleKitchen = {
    STAGES: STAGES, ESCAPE_DISTANCE: ESCAPE_DISTANCE, stageFor: stageFor,
    create: createWorld, reset: resetWorld, update: updateWorld,
    checkCollisions: checkCollisions, draw: drawWorld
  };
})();
