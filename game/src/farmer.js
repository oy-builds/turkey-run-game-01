// farmer.js — Jed the farmer: chases, searches, corners.
// One job: the pursuer's AI. He never teleports; the GAP between him and
// the turkey is the game's clock: clean running widens it, every stumble
// closes it, and at zero he grabs the turkey.
(function () {
  'use strict';

  var MAX_GAP = 230;

  function createFarmer() {
    return {
      x: 40,            // screen x, derived from gap each frame
      gap: 190,         // pixels behind the turkey; 0 = caught
      runPhase: 0,
      state: 'chase',   // chase | search | corner | grab
      stateTimer: 0,
      searchX: 0,
      speedBonus: 0,
      lunged: false
    };
  }

  function resetFarmer(f) {
    f.x = 30; f.gap = 190; f.runPhase = 0; f.state = 'chase'; f.stateTimer = 0; f.lunged = false; f.speedBonus = 0;
  }

  // Returns events for sound/feedback.
  function updateFarmer(f, turkey, dt, turkeySpeed, turkeyHiding) {
    var events = [];
    f.runPhase += dt * 11;

    if (f.state === 'search') {
      f.stateTimer -= dt;
      // Jed paces back and forth, peering into the hay.
      f.x = turkey.x - f.gap + Math.sin(f.stateTimer * 3) * 18;
      if (f.stateTimer <= 0) {
        f.state = 'chase';
        f.gap = Math.max(70, f.gap - 40); // he comes back angrier
        events.push('searchOver');
      }
      return events;
    }

    if (turkeyHiding && f.state === 'chase') {
      f.state = 'search';
      f.stateTimer = 2.2;
      f.searchX = turkey.x;
      events.push('searching');
      return events;
    }

    if (f.state === 'corner') {
      // The lunge: Jed sprints at the turkey for a beat.
      f.stateTimer -= dt;
      f.gap -= 130 * dt;
      if (f.gap < 24) f.gap = 24; // a lunge alone never grabs; the grab needs a real catch
      if (f.stateTimer <= 0) {
        f.state = 'chase';
        f.lunged = true;
        f.gap = Math.max(60, f.gap);
      }
    } else {
      // Clean running slowly pulls away; the gap is the pressure gauge.
      f.gap = Math.min(MAX_GAP, f.gap + 12 * dt);
      if (f.gap < 90) {
        f.state = 'corner';
        f.stateTimer = 0.55;
        events.push('spotted'); // "HEY! GET BACK HERE!"
      }
    }

    f.x = turkey.x - f.gap;
    return events;
  }

  // Called when the turkey stumbles: Jed closes in fast.
  function gainGround(f, px) { f.gap = Math.max(0, f.gap - px); }

  // Called when the turkey grabs corn or escapes a stage: breathing room.
  function loseGround(f, px) { f.gap = Math.min(MAX_GAP, f.gap + px); }

  function gapTo(f, turkey) { return f.gap; }

  function drawFarmer(f, art, ctx, turkeyHiding) {
    if (turkeyHiding && f.state === 'search') {
      // Jed stands at the haystack, scratching his head.
      art.drawFarmer(ctx, f.x, 460, 1.15, { runPhase: 0 });
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Georgia';
      ctx.fillText('?', f.x + 18, 360);
      return;
    }
    art.drawFarmer(ctx, f.x, 460, 1.15, { runPhase: f.runPhase });
    if (f.state === 'corner') {
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText('HEY! GET BACK HERE!', f.x - 20, 350);
    }
  }

  window.GobbleFarmer = {
    create: createFarmer, reset: resetFarmer, update: updateFarmer,
    gainGround: gainGround, loseGround: loseGround, gapTo: gapTo, draw: drawFarmer
  };
})();
