// farmer.js — Farmer Bram: the chase. He trails Tilly by a gap that shrinks
// on every stumble and slowly creeps in on its own; dashes and corn push him
// back. When the gap closes, dinner is served.

import { RUN } from './config.js';

export function createFarmer() {
  return {
    gap: RUN.farmerStartGap,   // px behind the turkey
    runPhase: 0,
    grumble: 0,                // seconds of "HEY!" bubble left
  };
}

export function updateFarmer(f, dt, speed, dashing) {
  f.runPhase += dt * 11;
  f.gap += RUN.farmerGainPerSecond * dt;
  if (dashing) f.gap += RUN.farmerLoseOnDash * dt * 0.35;
  if (f.grumble > 0) f.grumble -= dt;
  return f.gap <= RUN.farmerCatchGap;
}

export function farmerStumble(f) {
  f.gap -= RUN.farmerGainOnStumble;
  f.grumble = 1.2;
}

export function farmerReward(f, px) {
  f.gap = Math.min(RUN.farmerStartGap, f.gap + px);
}

// Bram, mid-stride, pitchfork in hand, flat cap and red braces.
export function drawFarmer(ctx, f, turkeyX, groundY) {
  const x = turkeyX - f.gap;
  const legSwing = Math.sin(f.runPhase) * 10;
  const bob = Math.abs(Math.sin(f.runPhase)) * 3;

  ctx.save();
  ctx.translate(x, groundY - bob);

  // Legs
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -34); ctx.lineTo(-4 + legSwing, 0);
  ctx.moveTo(6, -34); ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();

  // Body: checked shirt + braces
  ctx.fillStyle = '#b03a2e';
  ctx.fillRect(-14, -66, 30, 34);
  ctx.fillStyle = '#f4e3c2';
  ctx.fillRect(-14, -66, 30, 5);
  ctx.fillStyle = '#2e4a7a';
  ctx.fillRect(-8, -66, 4, 34);
  ctx.fillRect(6, -66, 4, 34);

  // Arm reaching forward, pitchfork
  ctx.strokeStyle = '#b03a2e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(8, -58); ctx.lineTo(30, -44);
  ctx.stroke();
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, -44); ctx.lineTo(46, -78);
  ctx.stroke();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  for (const dx of [-3, 0, 3]) {
    ctx.beginPath();
    ctx.moveTo(46 + dx, -78);
    ctx.lineTo(50 + dx, -88);
    ctx.stroke();
  }

  // Head + cap + moustache
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(4, -74, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e4a7a';
  ctx.beginPath();
  ctx.arc(4, -78, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(4, -80, 14, 4);
  ctx.fillStyle = '#5d3418';
  ctx.fillRect(-2, -70, 12, 3);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(8, -76, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // "HEY! COME BACK!" bubble when he gains on a stumble
  if (f.grumble > 0) {
    ctx.save();
    ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
    const text = 'HEY! COME BACK HERE!';
    const w = ctx.measureText(text).width + 18;
    const bx = x - w / 2 + 10;
    const by = groundY - 132;
    ctx.fillStyle = 'rgba(255, 250, 230, 0.95)';
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 20, by + 26);
    ctx.lineTo(bx + 28, by + 36);
    ctx.lineTo(bx + 34, by + 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a2a1a';
    ctx.fillText(text, bx + 9, by + 18);
    ctx.restore();
  }
}
