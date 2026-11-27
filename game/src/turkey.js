// turkey.js — Tom the turkey: running, jumping, hiding, stumbling.
// One job: the player's body, physics and state. Drawing lives in art.js.
(function () {
  'use strict';

  var GROUND_Y = 460;
  var GRAVITY = 2100;
  var JUMP_V = 760;

  function createTurkey() {
    return {
      x: 220, y: GROUND_Y, vy: 0,
      w: 44, h: 52,
      onGround: true,
      hiding: false,
      hideTimer: 0,
      stumbleTimer: 0,
      runPhase: 0,
      speed: 0,
      scared: false,
      dead: false
    };
  }

  function resetTurkey(t) {
    t.x = 220; t.y = GROUND_Y; t.vy = 0;
    t.onGround = true; t.hiding = false; t.hideTimer = 0;
    t.stumbleTimer = 0; t.runPhase = 0; t.dead = false;
  }

  // Returns 'jumped' | 'hid' | null for sound/feedback hooks.
  function updateTurkey(t, input, dt, baseSpeed, canHide) {
    var event = null;
    if (t.stumbleTimer > 0) t.stumbleTimer -= dt;

    if (t.hiding) {
      t.hideTimer -= dt;
      if (t.hideTimer <= 0 || input.wasPressed('jump')) {
        t.hiding = false;
        t.hideTimer = 0;
        if (input.wasPressed('jump')) event = 'jumped';
      }
      return event;
    }

    // horizontal shuffle: the turkey can dart left/right a little
    var move = 0;
    if (input.held('left')) move -= 1;
    if (input.held('right')) move += 1;
    t.x += move * 260 * dt;
    if (t.x < 60) t.x = 60;
    if (t.x > 720) t.x = 720;

    // jump
    if (input.wasPressed('jump') && t.onGround && t.stumbleTimer <= 0) {
      t.vy = -JUMP_V;
      t.onGround = false;
      event = 'jumped';
    }

    // hide in a haystack (only when one is right beside the turkey)
    if (input.wasPressed('hide') && t.onGround && canHide) {
      t.hiding = true;
      t.hideTimer = 2.2;
      event = 'hid';
    }

    // gravity
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y) {
      t.y = GROUND_Y;
      t.vy = 0;
      t.onGround = true;
    }

    t.speed = baseSpeed;
    t.runPhase += dt * (t.onGround ? 11 : 4);
    return event;
  }

  function stumble(t) {
    t.stumbleTimer = 0.7;
    t.vy = -260;
    t.onGround = false;
  }

  function drawTurkey(t, art, ctx) {
    art.drawTurkey(ctx, t.x, t.y, 1, {
      runPhase: t.runPhase,
      hiding: t.hiding,
      scared: t.scared
    });
    if (t.hiding) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.font = 'bold 14px Georgia';
      ctx.fillText('SHHH…', t.x - 22, t.y - 62);
    }
  }

  window.GobbleTurkey = {
    create: createTurkey, reset: resetTurkey, update: updateTurkey,
    stumble: stumble, draw: drawTurkey, GROUND_Y: GROUND_Y
  };
})();
