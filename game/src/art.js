// art.js — every drawn thing that is not the turkey or the farmer:
// sky, parallax scenery, obstacles (fence, hay, knife, oven, puddle, beam),
// pickups (corn, golden feather), and the finish-line woods.

import { VIEW, STAGES } from './config.js';
import { stageFor } from './world.js';

export function drawBackground(ctx, scrollX, distance) {
  const stage = stageFor(distance);
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  g.addColorStop(0, stage.sky[0]);
  g.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // Sun
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(820, 74, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(820, 74, 52, 0, Math.PI * 2);
  ctx.fill();

  // Clouds drift slowly
  ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
  for (const [cx, cy, s] of [[140, 70, 1], [430, 46, 0.7], [660, 96, 0.85]]) {
    const x = ((cx - scrollX * 0.08) % (VIEW.width + 240) + VIEW.width + 240) % (VIEW.width + 240) - 120;
    ctx.beginPath();
    ctx.ellipse(x, cy, 42 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 26 * s, cy + 4, 30 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawScenery(ctx, scenery, scrollX, distance) {
  const stage = stageFor(distance);
  for (const s of scenery) {
    const x = s.x - scrollX * 0.55;
    if (x < -160 || x > VIEW.width + 160) continue;
    ctx.save();
    ctx.fillStyle = stage.far;
    ctx.strokeStyle = stage.far;
    if (s.kind === 'tree') {
      ctx.fillRect(x - 4, VIEW.groundY - 84, 9, 84);
      ctx.beginPath();
      ctx.arc(x, VIEW.groundY - 104, 30 + s.variant * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stage.near;
      ctx.beginPath();
      ctx.arc(x - 12, VIEW.groundY - 92, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.kind === 'barn') {
      ctx.fillRect(x, VIEW.groundY - 110, 120, 110);
      ctx.beginPath();
      ctx.moveTo(x - 8, VIEW.groundY - 110);
      ctx.lineTo(x + 60, VIEW.groundY - 152);
      ctx.lineTo(x + 128, VIEW.groundY - 110);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = stage.near;
      ctx.fillRect(x + 44, VIEW.groundY - 62, 32, 62);
    } else if (s.kind === 'pumpkin') {
      ctx.fillStyle = '#d96a1e';
      ctx.beginPath();
      ctx.ellipse(x, VIEW.groundY - 14, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5f8a4a';
      ctx.fillRect(x - 2, VIEW.groundY - 34, 4, 10);
    } else if (s.kind === 'haystack') {
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.moveTo(x - 34, VIEW.groundY);
      ctx.quadraticCurveTo(x, VIEW.groundY - 66, x + 34, VIEW.groundY);
      ctx.closePath();
      ctx.fill();
    } else if (s.kind === 'fence-post') {
      ctx.fillRect(x, VIEW.groundY - 40, 6, 40);
      ctx.fillRect(x + 26, VIEW.groundY - 40, 6, 40);
      ctx.fillRect(x - 6, VIEW.groundY - 34, 44, 5);
    } else if (s.kind === 'window') {
      ctx.fillStyle = '#f7e3b0';
      ctx.fillRect(x, VIEW.groundY - 150, 54, 70);
      ctx.strokeStyle = stage.far;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, VIEW.groundY - 150, 54, 70);
      ctx.beginPath();
      ctx.moveTo(x + 27, VIEW.groundY - 150);
      ctx.lineTo(x + 27, VIEW.groundY - 80);
      ctx.stroke();
    } else if (s.kind === 'pot') {
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.ellipse(x, VIEW.groundY - 18, 24, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Ground
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, VIEW.groundY, VIEW.width, VIEW.height - VIEW.groundY);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, VIEW.groundY, VIEW.width, 6);
  // Speed lines on the dirt
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 173 - scrollX * 1.4) % (VIEW.width + 200) + VIEW.width + 200) % (VIEW.width + 200) - 100;
    ctx.fillRect(x, VIEW.groundY + 24 + i * 9, 46, 3);
  }
}

export function drawObstacle(ctx, ob, scrollX) {
  const x = ob.x - scrollX;
  if (x < -140 || x > VIEW.width + 140) return;
  ctx.save();
  if (ob.kind === 'fence') {
    ctx.fillStyle = '#7a4a22';
    ctx.fillRect(x, ob.y, 6, ob.h);
    ctx.fillRect(x + 20, ob.y, 6, ob.h);
    ctx.fillRect(x - 6, ob.y + 8, 38, 6);
    ctx.fillRect(x - 6, ob.y + 28, 38, 6);
    ctx.fillStyle = '#5d3418';
    ctx.fillRect(x - 6, ob.y + 8, 38, 2);
  } else if (ob.kind === 'hay') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(x + 26, ob.y + 24, 27, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a4713a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + 26, ob.y + 24, 18, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (ob.kind === 'knife') {
    const swing = Math.sin(ob.swingPhase) * 42;
    ctx.strokeStyle = '#4a2a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + swing + 7, 0);
    ctx.lineTo(x + swing + 7, 96);
    ctx.stroke();
    // Blade: a big carving knife swinging from a rope
    ctx.save();
    ctx.translate(x + swing + 7, 150);
    ctx.rotate(Math.sin(ob.swingPhase) * 0.5);
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(7, -52);
    ctx.lineTo(7, 34);
    ctx.lineTo(0, 52);
    ctx.lineTo(-7, 34);
    ctx.lineTo(-7, -52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d3418';
    ctx.fillRect(-8, -66, 16, 16);
    ctx.restore();
  } else if (ob.kind === 'oven') {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, ob.y, ob.w, ob.h);
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 6, ob.y + 8, ob.w - 12, 26);
    ctx.fillStyle = '#ff9a3c';
    ctx.fillRect(x + 10, ob.y + 12, ob.w - 20, 18);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x + 16, ob.y + 50, 4, 0, Math.PI * 2);
    ctx.arc(x + 30, ob.y + 50, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5a2a';
    ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
    ctx.fillText('HOT!', x + 44, ob.y + 54);
    // Heat shimmer
    ctx.fillStyle = 'rgba(255, 120, 40, 0.25)';
    ctx.fillRect(x - 4, ob.y - 14, ob.w + 8, 14);
  } else if (ob.kind === 'puddle') {
    ctx.fillStyle = '#7a5a3a';
    ctx.beginPath();
    ctx.ellipse(x + 35, VIEW.groundY - 3, 36, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 28, VIEW.groundY - 4, 16, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (ob.kind === 'beam') {
    ctx.fillStyle = '#5d3418';
    ctx.fillRect(x, 150, ob.w, 12);
    ctx.fillStyle = '#7a4a22';
    ctx.fillRect(x, 162, ob.w, 6);
    ctx.fillStyle = '#d9382b';
    ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    ctx.fillText('DUCK!', x + 8, 146);
  }
  ctx.restore();
}

export function drawPickup(ctx, p, scrollX, time) {
  const x = p.x - scrollX;
  if (x < -40 || x > VIEW.width + 40) return;
  const bob = Math.sin(time * 4 + p.x * 0.05) * 4;
  ctx.save();
  if (p.kind === 'corn') {
    ctx.translate(x, p.y + bob);
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a41e';
    ctx.lineWidth = 1.5;
    for (const dy of [-7, 0, 7]) {
      ctx.beginPath();
      ctx.moveTo(-7, dy);
      ctx.lineTo(7, dy);
      ctx.stroke();
    }
    ctx.fillStyle = '#5f8a4a';
    ctx.beginPath();
    ctx.moveTo(0, 13);
    ctx.lineTo(-5, 22);
    ctx.lineTo(5, 22);
    ctx.closePath();
    ctx.fill();
  } else {
    // Golden feather
    ctx.translate(x, p.y + bob);
    ctx.rotate(Math.sin(time * 2 + p.x) * 0.3);
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c98a1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(-2, -8, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// The woods at the end of the run: a green gate of trees and a "FREE!" sign.
export function drawFinish(ctx, scrollX, distance) {
  const finishWorldX = 1500 / 0.055; // world px where the escape line sits
  const x = finishWorldX - scrollX;
  if (x < -200 || x > VIEW.width + 200) return;
  ctx.save();
  ctx.fillStyle = '#2c4f24';
  for (const dx of [-30, 30]) {
    ctx.fillRect(x + dx - 6, VIEW.groundY - 150, 12, 150);
    ctx.beginPath();
    ctx.arc(x + dx, VIEW.groundY - 170, 44, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f4e3c2';
  ctx.fillRect(x - 58, VIEW.groundY - 210, 116, 40);
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 58, VIEW.groundY - 210, 116, 40);
  ctx.fillStyle = '#2c4f24';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREE!', x, VIEW.groundY - 182);
  ctx.textAlign = 'left';
  ctx.restore();
}
