// art.js — every picture in Gobble Run, drawn fresh on canvas.
// One job: the turkey, the farmer, the farmyard, the barn and the kitchen.
// Autumn palette: burnt orange, harvest gold, barn red, deep brown.
(function () {
  'use strict';

  var SKY = ['#f7c873', '#f2b95c', '#e8a94b']; // farmyard, barn, kitchen tints

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- The turkey: Tom the runaway, brown body, fanned tail, red wattle. ---
  function drawTurkey(ctx, x, y, scale, opts) {
    opts = opts || {};
    var run = opts.runPhase || 0;
    var hiding = !!opts.hiding;
    var legSwing = Math.sin(run) * 8 * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    if (hiding) ctx.globalAlpha = 0.92;

    // tail feathers, fanned
    var featherColors = ['#a34d1e', '#c96a24', '#e08a2e', '#8f3d16', '#d99a35'];
    for (var i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate(i * 0.34);
      ctx.fillStyle = featherColors[i + 2];
      ctx.beginPath();
      ctx.ellipse(-16, -26, 7, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7c873';
      ctx.beginPath();
      ctx.ellipse(-16, -44, 3.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // legs
    ctx.strokeStyle = '#e8a13c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 8); ctx.lineTo(-4 + legSwing, 26);
    ctx.moveTo(5, 8); ctx.lineTo(5 - legSwing, 26);
    ctx.stroke();
    // body
    ctx.fillStyle = '#7a4a1f';
    ellipse(ctx, 0, -6, 22, 18);
    ctx.fillStyle = '#8f5a28';
    ellipse(ctx, 2, -8, 17, 14);
    // wing
    ctx.fillStyle = '#5e3a16';
    ctx.beginPath();
    ctx.ellipse(2, -6, 12, 8, -0.4 + Math.sin(run) * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // neck + head
    ctx.fillStyle = '#8f5a28';
    ctx.fillRect(14, -30, 8, 18);
    ctx.fillStyle = '#6b4423';
    ctx.beginPath(); ctx.arc(19, -32, 9, 0, Math.PI * 2); ctx.fill();
    // beak
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.moveTo(26, -34); ctx.lineTo(36, -30); ctx.lineTo(26, -28);
    ctx.closePath(); ctx.fill();
    // wattle — the red giveaway
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(28, -25, 3.5, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // eye: wide, panicked, comic
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(21, -35, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(22.5, -35, 1.7, 0, Math.PI * 2); ctx.fill();
    // sweat drop when the farmer is close
    if (opts.scared) {
      ctx.fillStyle = '#7ec8e3';
      ctx.beginPath();
      ctx.ellipse(8, -48, 3, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- The farmer: Jed, overalls, straw hat, pitchfork, very determined. ---
  function drawFarmer(ctx, x, y, scale, opts) {
    opts = opts || {};
    var run = opts.runPhase || 0;
    var armSwing = Math.sin(run) * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    var legSwing = Math.sin(run) * 9;
    // legs (dark trousers)
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -34); ctx.lineTo(-6 + legSwing, 0);
    ctx.moveTo(6, -34); ctx.lineTo(6 - legSwing, 0);
    ctx.stroke();
    // overalls
    ctx.fillStyle = '#2f5d8a';
    ctx.fillRect(-13, -72, 26, 40);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-13, -72, 26, 7); // shirt stripe
    // arms reaching forward, one gripping the pitchfork
    ctx.strokeStyle = '#e8b98a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(10, -64); ctx.lineTo(26, -52 + armSwing * 6);
    ctx.moveTo(-10, -64); ctx.lineTo(-24, -50 - armSwing * 6);
    ctx.stroke();
    // pitchfork
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(28, -86); ctx.lineTo(34, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(22, -88); ctx.lineTo(28, -86);
    ctx.moveTo(28, -90); ctx.lineTo(28, -86);
    ctx.moveTo(34, -88); ctx.lineTo(28, -86);
    ctx.stroke();
    // head + beard + straw hat
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath(); ctx.arc(0, -82, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8d8d8';
    ctx.beginPath(); ctx.arc(0, -75, 9, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath(); ctx.ellipse(0, -90, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(0, -91, 9, Math.PI, 0); ctx.fill();
    // angry eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-7, -86, 4, 2);
    ctx.fillRect(3, -86, 4, 2);
    ctx.restore();
  }

  // --- Backgrounds: parallax farmyard, barn interior, farmhouse kitchen. ---
  function drawBackground(ctx, stage, scrollX, t) {
    var w = 960, h = 540, groundY = 460;
    var sky = ctx.createLinearGradient(0, 0, 0, groundY);
    if (stage === 0) { sky.addColorStop(0, '#f7c873'); sky.addColorStop(1, '#f2b95c'); }
    else if (stage === 1) { sky.addColorStop(0, '#d98a4a'); sky.addColorStop(1, '#b96a2e'); }
    else { sky.addColorStop(0, '#e8c9a0'); sky.addColorStop(1, '#d9a86c'); }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, groundY);
    // sun
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(830, 70, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe98a';
    ctx.beginPath(); ctx.arc(830, 70, 26, 0, Math.PI * 2); ctx.fill();

    if (stage === 0) {
      // distant barn + silo
      var bx = 120 - (scrollX * 0.15 % 960);
      ctx.fillStyle = '#a93226';
      ctx.fillRect(bx, 300, 150, 120);
      ctx.fillStyle = '#7a241a';
      ctx.beginPath(); ctx.moveTo(bx - 8, 302); ctx.lineTo(bx + 75, 240); ctx.lineTo(bx + 158, 302); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7f3e8';
      ctx.fillRect(bx + 62, 350, 26, 70);
      ctx.fillStyle = '#c9c9c9';
      ctx.fillRect(bx + 190, 260, 44, 160);
      ctx.beginPath(); ctx.ellipse(bx + 212, 256, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
      // trees
      for (var i = 0; i < 4; i++) {
        var tx = ((i * 260 + 60 - scrollX * 0.3) % 1100 + 1100) % 1100 - 70;
        ctx.fillStyle = '#7a4a1f';
        ctx.fillRect(tx + 8, 360, 8, 60);
        ctx.fillStyle = i % 2 ? '#c96a24' : '#d98a2e';
        ctx.beginPath(); ctx.arc(tx + 12, 340, 30, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx - 8, 355, 20, 0, Math.PI * 2); ctx.fill();
      }
      // drifting leaves
      ctx.fillStyle = 'rgba(200,110,30,0.7)';
      for (var l = 0; l < 8; l++) {
        var lx = (l * 137 + t * 30) % 960;
        var ly = 60 + ((l * 61) % 200) + Math.sin(t * 2 + l) * 8;
        ctx.beginPath(); ctx.ellipse(lx, ly, 5, 3, 0.6, 0, Math.PI * 2); ctx.fill();
      }
    } else if (stage === 1) {
      // barn interior: wooden beams and hanging lanterns
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(0, 0, w, 26);
      ctx.fillRect(0, 120, w, 14);
      for (var b = 0; b < 5; b++) ctx.fillRect(b * 220 - (scrollX * 0.2 % 220), 26, 16, 110);
      ctx.fillStyle = '#ffe9a8';
      for (var ln = 0; ln < 3; ln++) {
        var lxx = 180 + ln * 300;
        ctx.fillRect(lxx - 1, 26, 2, 26);
        ctx.beginPath(); ctx.arc(lxx, 66, 12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(0, 380, w, 80);
    } else {
      // farmhouse kitchen: checkered wall, oven glow, hanging pans
      ctx.fillStyle = '#f3e2c7';
      for (var cx = 0; cx < 12; cx++) for (var cy = 0; cy < 5; cy++) {
        if ((cx + cy) % 2 === 0) { ctx.fillStyle = '#e8cfa8'; ctx.fillRect(cx * 80, cy * 60, 80, 60); ctx.fillStyle = '#f3e2c7'; }
      }
      ctx.fillStyle = '#7a4a1f';
      ctx.fillRect(0, 300, w, 10);
      // big oven with glowing door
      var ox = 700 - (scrollX * 0.1 % 960);
      ctx.fillStyle = '#3d3d3d';
      ctx.fillRect(ox, 180, 180, 220);
      ctx.fillStyle = '#ff8c2e';
      ctx.fillRect(ox + 30, 230, 120, 110);
      ctx.fillStyle = '#ffd23e';
      ctx.fillRect(ox + 45, 245, 90, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px Georgia';
      ctx.fillText('OVEN', ox + 66, 200);
      // hanging pans
      ctx.strokeStyle = '#5e3a16';
      ctx.lineWidth = 3;
      for (var p = 0; p < 3; p++) {
        ctx.beginPath(); ctx.arc(140 + p * 90, 150, 26, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(140 + p * 90, 124); ctx.lineTo(140 + p * 90, 100); ctx.stroke();
      }
      // window with the woods beyond — the way out
      ctx.fillStyle = '#7ec8e3';
      ctx.fillRect(60, 90, 150, 120);
      ctx.fillStyle = '#2f7a3d';
      ctx.beginPath(); ctx.moveTo(60, 210); ctx.lineTo(110, 130); ctx.lineTo(160, 210); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(140, 210); ctx.lineTo(180, 140); ctx.lineTo(210, 210); ctx.closePath(); ctx.fill();
    }

    // ground
    var g = ctx.createLinearGradient(0, groundY, 0, h);
    if (stage === 2) { g.addColorStop(0, '#b98a5a'); g.addColorStop(1, '#8a5f33'); }
    else { g.addColorStop(0, '#c98a3e'); g.addColorStop(1, '#9c6a28'); }
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var d = 0; d < 24; d++) {
      var dx = (d * 97 - scrollX) % 960;
      if (dx < 0) dx += 960;
      ctx.fillRect(dx, groundY + 12 + (d % 4) * 16, 26, 3);
    }
  }

  // --- Obstacles & pickups, drawn in the world. ---
  function drawFence(ctx, x, y) {
    ctx.fillStyle = '#5e3a16';
    ctx.fillRect(x, y - 46, 8, 46);
    ctx.fillRect(x + 34, y - 46, 8, 46);
    ctx.fillStyle = '#f3e2c7';
    ctx.fillRect(x - 4, y - 42, 50, 8);
    ctx.fillRect(x - 4, y - 24, 50, 8);
    ctx.fillStyle = '#c96a24';
    ctx.fillRect(x - 4, y - 42, 50, 3);
  }

  function drawHayBale(ctx, x, y) {
    ctx.fillStyle = '#d9a83e';
    ctx.beginPath(); ctx.arc(x + 26, y - 24, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a87c1e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 26, y - 24, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 26, y - 24, 9, 0, Math.PI * 2); ctx.stroke();
  }

  function drawPumpkin(ctx, x, y, r) {
    ctx.fillStyle = '#e07b1f';
    ctx.beginPath(); ctx.ellipse(x, y - r, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b85c10';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y - r, r * 0.5, r * 0.85, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3d7a2e';
    ctx.fillRect(x - 3, y - r * 2 - 4, 6, 8);
  }

  function drawCorn(ctx, x, y, t) {
    var bob = Math.sin(t * 4 + x) * 4;
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath(); ctx.ellipse(x, y + bob, 9, 16, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1.5;
    for (var k = -1; k <= 1; k++) {
      ctx.beginPath(); ctx.moveTo(x + k * 5, y - 12 + bob); ctx.lineTo(x + k * 5, y + 12 + bob); ctx.stroke();
    }
    ctx.fillStyle = '#7ec850';
    ctx.beginPath(); ctx.moveTo(x - 8, y + 8 + bob); ctx.lineTo(x + 8, y + 8 + bob); ctx.lineTo(x, y + 20 + bob); ctx.closePath(); ctx.fill();
  }

  function drawKnife(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#c9d1d9';
    ctx.beginPath();
    ctx.moveTo(0, -26); ctx.lineTo(10, 4); ctx.lineTo(0, 12); ctx.lineTo(-10, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5e3a16';
    ctx.fillRect(-5, 12, 10, 16);
    ctx.restore();
  }

  function drawOvenHazard(ctx, x, y, t) {
    // a roasting pan left on the floor, flames licking up
    ctx.fillStyle = '#3d3d3d';
    rr(ctx, x, y - 18, 70, 18, 6); ctx.fill();
    for (var f = 0; f < 3; f++) {
      ctx.fillStyle = f % 2 ? '#ff8c2e' : '#ffd23e';
      var fh = 18 + Math.sin(t * 9 + f * 2) * 7;
      ctx.beginPath();
      ctx.ellipse(x + 14 + f * 20, y - 18 - fh / 2, 7, fh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHaystack(ctx, x, y) {
    ctx.fillStyle = '#e8b93e';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30, y - 52);
    ctx.lineTo(x + 60, y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b8922e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 8); ctx.lineTo(x + 24, y - 34);
    ctx.moveTo(x + 48, y - 8); ctx.lineTo(x + 36, y - 34);
    ctx.stroke();
    ctx.fillStyle = '#7a4a1f';
    ctx.font = 'bold 12px Georgia';
    ctx.fillText('HIDE!', x + 14, y - 58);
  }

  window.GobbleArt = {
    drawTurkey: drawTurkey, drawFarmer: drawFarmer, drawBackground: drawBackground,
    drawFence: drawFence, drawHayBale: drawHayBale, drawPumpkin: drawPumpkin,
    drawCorn: drawCorn, drawKnife: drawKnife, drawOvenHazard: drawOvenHazard,
    drawHaystack: drawHaystack, rr: rr
  };
})();
