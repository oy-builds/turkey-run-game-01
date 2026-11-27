// shots.js — screenshot hooks for Gobble Run.
// One job: let the maker drive the game into a named state from the URL
// (?shot=title|play|caught|escaped) so screenshots are real renders of
// the game's own code. No gameplay effect without the query parameter.
(function () {
  'use strict';

  function shotParam() {
    try {
      var m = window.location.search.match(/[?&]shot=([a-z]+)/);
      return m ? m[1] : null;
    } catch (e) { return null; }
  }

  // Called once at boot; returns the requested shot name or null.
  function applyShot(game) {
    var shot = shotParam();
    if (!shot) return null;
    if (shot === 'title') {
      game.state = 'title';
    } else if (shot === 'play') {
      game.startRun();
      // a busy, readable mid-run frame: stage 2, farmer close, corn + hay in view
      game.world.distance = 850;
      game.distance = 850;
      game.world.stage = 1;
      game.score = 1250;
      game.corn = 6;
      game.farmer.gap = 80;
      game.farmer.x = 150;
      game.turkey.x = 230;
      game.world.obstacles.push({ kind: 'fence', x: 620, y: 460, w: 42, h: 50, passed: false, hit: false });
      game.world.obstacles.push({ kind: 'pumpkin', x: 780, y: 460, w: 40, h: 34, vx: 0, passed: false, hit: false });
      game.world.pickups.push({ x: 480, y: 380, taken: false });
      game.world.pickups.push({ x: 540, y: 360, taken: false });
      game.world.haystacks.push({ x: 860, y: 460, used: false });
      game.flash = 'STAGE 2 — THE BARN';
      game.flashTimer = 99;
      game.flashColor = '#ffd23e';
    } else if (shot === 'caught') {
      game.startRun();
      game.score = 940;
      game.corn = 4;
      game.world.distance = 612;
      game.distance = 612;
      game.lives = 0;
      game.endRun('caught');
      game.farmer.gap = 20; // Jed right on top of Tom
      game.farmer.x = 210;
      game.turkey.x = 230;
    } else if (shot === 'escaped') {
      game.startRun();
      game.score = 3420;
      game.corn = 14;
      game.world.distance = 1800;
      game.distance = 1800;
      game.endRun('escaped');
    }
    game.shotMode = shot;
    return shot;
  }

  window.GobbleShots = { apply: applyShot, param: shotParam };
})();
