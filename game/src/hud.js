// hud.js — the HUD and every menu screen of Gobble Run.
// One job: draw the score/distance/lives/stage bar and the title, pause,
// caught and escaped screens, and report which button the mouse clicked.
(function () {
  'use strict';

  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(43,26,14,0.82)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#f7c873';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }

  function button(ctx, x, y, w, h, label, hover) {
    ctx.fillStyle = hover ? '#e08a2e' : '#c96a24';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 7);
    ctx.textAlign = 'left';
    return { x: x, y: y, w: w, h: h };
  }

  function drawHUD(ctx, s, mouse) {
    // top bar
    ctx.fillStyle = 'rgba(43,26,14,0.85)';
    ctx.fillRect(0, 0, 960, 46);
    ctx.fillStyle = '#f7c873';
    ctx.font = 'bold 19px Georgia';
    ctx.fillText('SCORE ' + s.score, 14, 30);
    ctx.fillText('CORN ' + s.corn + ' 🌽', 190, 30);
    ctx.fillText('DIST ' + Math.floor(s.distance) + ' m', 340, 30);
    ctx.fillStyle = '#ffd23e';
    ctx.fillText(s.stageName, 500, 30);
    // lives as hearts
    ctx.font = '22px Georgia';
    var hearts = '';
    for (var i = 0; i < 3; i++) hearts += i < s.lives ? '❤' : '♡';
    ctx.fillStyle = '#ff5a5a';
    ctx.fillText(hearts, 830, 31);
    // farmer proximity meter
    var gap = Math.max(0, Math.min(1, s.farmerGap / 220));
    ctx.fillStyle = '#2b1a0e';
    ctx.fillRect(14, 52, 220, 12);
    ctx.fillStyle = gap > 0.5 ? '#7ec850' : gap > 0.25 ? '#ffd23e' : '#c0392b';
    ctx.fillRect(14, 52, 220 * gap, 12);
    ctx.strokeStyle = '#f7c873';
    ctx.strokeRect(14, 52, 220, 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Georgia';
    ctx.fillText(s.farmerGap < 60 ? '⚠ FARMER RIGHT BEHIND YOU!' : 'FARMER DISTANCE', 240, 63);
    // flash messages
    if (s.flash && s.flashTimer > 0) {
      ctx.fillStyle = s.flashColor || '#fff';
      ctx.font = 'bold 26px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(s.flash, 480, 110);
      ctx.textAlign = 'left';
    }
    // mute + pause hints
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '12px Georgia';
    ctx.textAlign = 'right';
    ctx.fillText((s.muted ? 'MUTED (M)' : 'SOUND ON (M)') + '   ·   P pause', 950, 530);
    ctx.textAlign = 'left';
  }

  function drawTitle(ctx, mouse, best) {
    ctx.fillStyle = 'rgba(43,26,14,0.55)';
    ctx.fillRect(0, 0, 960, 540);
    panel(ctx, 180, 60, 600, 420);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 52px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('GOBBLE RUN', 480, 140);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Georgia';
    ctx.fillText('The Great Turkey Escape', 480, 178);
    ctx.font = '16px Georgia';
    ctx.fillStyle = '#f3d9a4';
    ctx.fillText('Thanksgiving is coming. Jed the farmer has the oven on,', 480, 215);
    ctx.fillText('the carving knife sharpened — and your name on the menu.', 480, 238);
    ctx.fillText('Run from the farmyard, through the barn, past the kitchen,', 480, 261);
    ctx.fillText('and reach the woods 1800 m away. Hide in the hay when he', 480, 284);
    ctx.fillText('gets close. Eat corn. Do NOT become dinner.', 480, 307);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Georgia';
    ctx.fillText('← → run · SPACE jump · ↓ hide in hay · P pause', 480, 340);
    var start = button(ctx, 380, 360, 200, 48, '▶  START RUN', mouse.x > 380 && mouse.x < 580 && mouse.y > 360 && mouse.y < 408);
    var how = button(ctx, 380, 420, 200, 40, 'HOW TO PLAY', mouse.x > 380 && mouse.x < 580 && mouse.y > 420 && mouse.y < 460);
    if (best > 0) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 15px Georgia';
      ctx.fillText('Best escape: ' + best + ' points', 480, 500 - 12);
    }
    ctx.textAlign = 'left';
    return { start: start, how: how };
  }

  function drawHowTo(ctx, mouse) {
    ctx.fillStyle = 'rgba(43,26,14,0.6)';
    ctx.fillRect(0, 0, 960, 540);
    panel(ctx, 180, 70, 600, 400);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 30px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('HOW TO PLAY', 480, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Georgia';
    var lines = [
      'You are Tom, a turkey with places to be (anywhere but the oven).',
      '',
      '← → or A / D — dart left and right.  SPACE / ↑ / W — jump fences,',
      'pumpkins, hay bales and roasting pans.',
      '↓ / S — dive into a haystack when one is beside you; Jed will',
      'search the hay and lose your trail. Corn is +50 points.',
      '',
      'Hitting a fence, a bale, a pumpkin, a knife or a pan costs a life',
      'and lets Jed gain on you. Lose all 3 lives — or let Jed grab you',
      '— and you are Thanksgiving dinner.',
      '',
      'Three stages, each faster: the farmyard, the barn, the kitchen.',
      'Reach 1800 m and the woods, and Tom lives to gobble another day.',
      '',
      'Click START or press ENTER to run.'
    ];
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 480, 152 + i * 24);
    var back = button(ctx, 380, 420, 200, 40, '← BACK', mouse.x > 380 && mouse.x < 580 && mouse.y > 420 && mouse.y < 460);
    ctx.textAlign = 'left';
    return { back: back };
  }

  function drawPaused(ctx, mouse) {
    ctx.fillStyle = 'rgba(43,26,14,0.6)';
    ctx.fillRect(0, 0, 960, 540);
    panel(ctx, 280, 180, 400, 180);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 480, 240);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Georgia';
    ctx.fillText('Tom is catching his breath. Jed is not.', 480, 272);
    var resume = button(ctx, 380, 292, 200, 44, 'RESUME', mouse.x > 380 && mouse.x < 580 && mouse.y > 292 && mouse.y < 336);
    ctx.textAlign = 'left';
    return { resume: resume };
  }

  function drawEnd(ctx, s, mouse) {
    var escaped = s.state === 'escaped';
    ctx.fillStyle = escaped ? 'rgba(20,60,25,0.55)' : 'rgba(60,10,10,0.55)';
    ctx.fillRect(0, 0, 960, 540);
    panel(ctx, 180, 90, 600, 360);
    ctx.fillStyle = escaped ? '#7ec850' : '#ff8a7a';
    ctx.font = 'bold 46px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(escaped ? '🦃 ESCAPED!' : '🍗 CAUGHT!', 480, 165);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Georgia';
    ctx.fillText(escaped
      ? 'Tom burst into the woods, free at last —'
      : 'Jed got him. The oven was already warm.',
      480, 205);
    ctx.fillText(escaped
      ? 'and somewhere behind him, a very confused farmer.'
      : 'But Tom left corn crumbs all the way. Run again?',
      480, 232);
    ctx.font = 'bold 18px Georgia';
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('SCORE ' + s.score + '   ·   DISTANCE ' + Math.floor(s.distance) + ' m   ·   CORN ' + s.corn, 480, 285);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Georgia';
    ctx.fillText('Best score: ' + s.best, 480, 315);
    if (s.newBest) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 18px Georgia';
      ctx.fillText('★ NEW BEST SCORE! ★', 480, 345);
    }
    var again = button(ctx, 370, 372, 220, 48, '↻  RUN AGAIN (R)', mouse.x > 370 && mouse.x < 590 && mouse.y > 372 && mouse.y < 420);
    ctx.textAlign = 'left';
    return { again: again };
  }

  window.GobbleHUD = {
    drawHUD: drawHUD, drawTitle: drawTitle, drawHowTo: drawHowTo,
    drawPaused: drawPaused, drawEnd: drawEnd
  };
})();
