// turkey.js — Tilly the turkey: run cycle, jump / double-jump, duck, dash,
// stumble feedback, and her hand-drawn canvas portrait.

import { RUN } from './config.js';

export function createTurkey() {
  return {
    x: 190,
    y: 0,                 // feet offset above the ground (0 = on the ground)
    vy: 0,
    jumpsUsed: 0,
    ducking: false,
    dashing: 0,           // seconds of dash left
    dashCooldown: 0,
    invincible: 0,        // mercy seconds after a stumble
    stumbleFlash: 0,
    runPhase: 0,          // leg-cycle animation clock
    width: 56,
    height: 58,
  };
}

export function turkeyBodyHeight(t) {
  return t.ducking ? RUN.duckHeight : t.height;
}

export function updateTurkey(t, input, dt, onJump, onDoubleJump, onDash) {
  t.runPhase += dt * 14;
  if (t.invincible > 0) t.invincible -= dt;
  if (t.stumbleFlash > 0) t.stumbleFlash -= dt;
  if (t.dashCooldown > 0) t.dashCooldown -= dt;
  if (t.dashing > 0) t.dashing -= dt;

  t.ducking = input.isHeld('duck') && t.y === 0 && t.dashing <= 0;

  if (input.wasPressed('jump')) {
    if (t.y === 0) {
      t.vy = RUN.jumpVelocity;
      t.jumpsUsed = 1;
      onJump();
    } else if (t.jumpsUsed === 1) {
      t.vy = RUN.doubleJumpVelocity;
      t.jumpsUsed = 2;
      onDoubleJump();
    }
  }
  if (input.wasPressed('dash') && t.dashCooldown <= 0 && t.dashing <= 0) {
    t.dashing = RUN.dashTime;
    t.dashCooldown = RUN.dashCooldown;
    onDash();
  }

  if (t.y > 0 || t.vy !== 0) {
    t.vy += RUN.gravity * dt;
    t.y += t.vy * dt;
    if (t.y <= 0) { t.y = 0; t.vy = 0; t.jumpsUsed = 0; }
  }
}

export function turkeySpeedMultiplier(t) {
  return t.dashing > 0 ? RUN.dashSpeed / RUN.baseSpeed : 1;
}

// Draw Tilly facing right: brown body, fanned tail, red wattle, beak, legs.
export function drawTurkey(ctx, t, groundY) {
  const h = turkeyBodyHeight(t);
  const cx = t.x;
  const feetY = groundY - t.y;
  const bodyY = feetY - h * 0.55;
  const blink = (t.invincible > 0 && Math.floor(t.invincible * 12) % 2 === 0);
  if (blink) ctx.globalAlpha = 0.35;

  const legSwing = Math.sin(t.runPhase) * (t.y === 0 ? 9 : 4);
  const dashTilt = t.dashing > 0 ? 0.22 : 0;

  ctx.save();
  ctx.translate(cx, bodyY);
  ctx.rotate(dashTilt);

  // Tail fan
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-20, -14, 7, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c98a4b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-20, -14, 4, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Legs
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, 8); ctx.lineTo(-4 + legSwing, feetY - bodyY);
  ctx.moveTo(6, 8); ctx.lineTo(6 - legSwing, feetY - bodyY);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#7a4a22';
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a4713a';
  ctx.beginPath();
  ctx.ellipse(2, 3, 18, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = '#5d3418';
  ctx.beginPath();
  ctx.ellipse(-2, -2, 13, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Neck + head
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(14, -h * 0.42 - 12, 9, 18);
  ctx.fillStyle = '#c98a4b';
  ctx.beginPath();
  ctx.arc(19, -h * 0.42 - 14, 9, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#e8a13c';
  ctx.beginPath();
  ctx.moveTo(26, -h * 0.42 - 16);
  ctx.lineTo(38, -h * 0.42 - 12);
  ctx.lineTo(26, -h * 0.42 - 9);
  ctx.closePath();
  ctx.fill();
  // Wattle
  ctx.fillStyle = '#d9382b';
  ctx.beginPath();
  ctx.ellipse(26, -h * 0.42 - 6, 3.5, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(21, -h * 0.42 - 17, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(22, -h * 0.42 - 18, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.globalAlpha = 1;
}
