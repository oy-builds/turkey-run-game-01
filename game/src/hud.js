// hud.js — the HUD (score, distance, lives, stage, corn, farmer bar, dash)
// and the full-screen title / pause / caught / escaped screens.

import { VIEW, RUN } from './config.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 150, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function drawHud(ctx, s) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // Top-left: score + distance
  panel(ctx, 14, 12, 218, 64);
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText(`SCORE ${s.score}`, 26, 38);
  ctx.fillStyle = '#fff4d6';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText(`${Math.floor(s.distance)} m  ·  ${s.stageName}`, 26, 62);

  // Top-right: lives + corn
  panel(ctx, VIEW.width - 232, 12, 218, 64);
  ctx.fillStyle = '#ff6a5e';
  ctx.font = '20px "Trebuchet MS", sans-serif';
  let hearts = '';
  for (let i = 0; i < 3; i++) hearts += i < s.lives ? '♥ ' : '♡ ';
  ctx.fillText(hearts, VIEW.width - 220, 38);
  ctx.fillStyle = '#fff4d6';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText(`🌽 ${s.corn}   🪶 ${s.feathers}`, VIEW.width - 220, 62);

  // Farmer proximity bar, bottom centre (above the page hint line)
  const barW = 320, barX = (VIEW.width - barW) / 2, barY = VIEW.height - 56;
  const danger = 1 - (s.farmerGap - RUN.farmerCatchGap) / (RUN.farmerStartGap - RUN.farmerCatchGap);
  const clamped = Math.max(0, Math.min(1, danger));
  panel(ctx, barX - 8, barY - 8, barW + 16, 30);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(barX, barY, barW, 14);
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, '#7ac74f');
  grad.addColorStop(0.6, '#f2c230');
  grad.addColorStop(1, '#d9382b');
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, barW * clamped, 14);
  ctx.fillStyle = '#fff4d6';
  ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(clamped > 0.66 ? 'BRAM IS RIGHT BEHIND YOU!' : 'FARMER BRAM', barX + barW / 2, barY - 14 + 8);
  ctx.textAlign = 'left';

  // Dash cooldown pip
  if (s.dashCooldown > 0) {
    ctx.fillStyle = 'rgba(255, 244, 214, 0.6)';
    ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
    ctx.fillText(`DASH ${s.dashCooldown.toFixed(1)}s`, 26, VIEW.height - 16);
  } else {
    ctx.fillStyle = '#7ac74f';
    ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
    ctx.fillText('DASH READY — SHIFT', 26, VIEW.height - 16);
  }
  ctx.restore();
}

function bigScreen(ctx, title, titleColor, lines, button) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 16, 8, 0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 54px "Trebuchet MS", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
  ctx.fillText(title, VIEW.width / 2, 150);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff4d6';
  ctx.font = '20px "Trebuchet MS", sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW.width / 2, 205 + i * 32));
  if (button) {
    const bw = 260, bh = 54, bx = (VIEW.width - bw) / 2, by = 330;
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff4d6';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText(button, VIEW.width / 2, by + 36);
  }
  ctx.restore();
}

export function drawTitle(ctx, best) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 16, 8, 0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 12;
  ctx.fillText('TURKEY TROT', VIEW.width / 2, 120);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff4d6';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText('— The Thanksgiving Breakout —', VIEW.width / 2, 162);
  ctx.font = '19px "Trebuchet MS", sans-serif';
  ctx.fillText('Thanksgiving dinner is coming for Tilly. Run, jump, duck, dash —', VIEW.width / 2, 214);
  ctx.fillText('outrun Farmer Bram, dodge the oven and the carving knife,', VIEW.width / 2, 242);
  ctx.fillText('and reach the woods 1,500 m away.', VIEW.width / 2, 270);
  ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#ffd94a';
  ctx.fillText('SPACE / CLICK — jump (twice in the air!)    ↓ — duck    SHIFT — dash', VIEW.width / 2, 322);
  ctx.fillStyle = '#fff4d6';
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.fillText('Press SPACE or CLICK to start', VIEW.width / 2, 372);
  if (best > 0) {
    ctx.font = '17px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#ffb35c';
    ctx.fillText(`Best escape so far: ${best} points`, VIEW.width / 2, 410);
  }
  ctx.restore();
}

export function drawPause(ctx) {
  bigScreen(ctx, 'PAUSED', '#ffd94a', ['Take a breath. Bram is waiting.', 'P — resume    R — restart'], null);
}

export function drawCaught(ctx, s) {
  bigScreen(ctx, 'CAUGHT!', '#ff6a5e', [
    'Farmer Bram grabbed Tilly. Dinner is served...',
    `You ran ${Math.floor(s.distance)} m and scored ${s.score} points.`,
    `Corn eaten: ${s.corn}   ·   Best: ${s.best}`,
  ], 'RUN AGAIN  (R)');
}

export function drawEscaped(ctx, s) {
  bigScreen(ctx, 'ESCAPED!', '#7ac74f', [
    'Tilly vanished into the woods. No turkey dinner this year!',
    `Escape bonus +${1000}  ·  Final score ${s.score}`,
    `Corn eaten: ${s.corn}   ·   Best: ${s.best}`,
  ], 'RUN AGAIN  (R)');
}
