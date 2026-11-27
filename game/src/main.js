// main.js — Gobble Run: the game loop and state machine.
// One job: own the run (title → play → caught/escaped), wire every module
// together, and advance score, lives and the farmer chase each frame.
(function () {
  'use strict';

  var W = 960, H = 540;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  var input = window.GobbleInput;
  var audio = window.GobbleAudio;
  var art = window.GobbleArt;
  var Turkey = window.GobbleTurkey;
  var Farmer = window.GobbleFarmer;
  var Kitchen = window.GobbleKitchen;
  var HUD = window.GobbleHUD;

  var BEST_KEY = 'gobble-run-best';

  function loadBest() {
    try { return parseInt(window.localStorage.getItem(BEST_KEY), 10) || 0; }
    catch (e) { return 0; }
  }

  function saveBest(v) {
    try { window.localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* offline-safe */ }
  }

  var game = {
    state: 'title', // title | howto | play | paused | caught | escaped
    turkey: Turkey.create(),
    farmer: Farmer.create(),
    world: Kitchen.create(),
    score: 0,
    corn: 0,
    lives: 3,
    distance: 0,
    scrollX: 0,
    flash: '',
    flashTimer: 0,
    flashColor: '#fff',
    best: loadBest(),
    newBest: false,
    muted: false,
    shotMode: null,
    time: 0
  };

  function startRun() {
    Turkey.reset(game.turkey);
    Farmer.reset(game.farmer);
    Kitchen.reset(game.world);
    game.score = 0;
    game.corn = 0;
    game.lives = 3;
    game.distance = 0;
    game.flash = '';
    game.flashTimer = 0;
    game.newBest = false;
    game.state = 'play';
    audio.unlock();
    audio.startMusic();
    audio.gobble();
  }

  function endRun(how) {
    game.state = how; // 'caught' or 'escaped'
    audio.stopMusic();
    if (how === 'caught') audio.caught();
    else audio.escape();
    if (game.score > game.best) {
      game.best = game.score;
      game.newBest = true;
      saveBest(game.best);
    }
  }

  function setFlash(text, color, secs) {
    game.flash = text;
    game.flashColor = color || '#fff';
    game.flashTimer = secs || 2;
  }

  function updatePlay(dt) {
    var stage = Kitchen.stageFor(game.world.distance);
    var baseSpeed = Kitchen.STAGES[stage].speed;
    var t = game.turkey;

    // hide only counts when a haystack is beside the turkey
    var nearHay = null;
    for (var i = 0; i < game.world.haystacks.length; i++) {
      var hs = game.world.haystacks[i];
      if (!hs.used && Math.abs(hs.x + 30 - t.x) < 60 && t.onGround) nearHay = hs;
    }

    var ev = Turkey.update(game.turkey, input, dt, baseSpeed, !!nearHay);
    if (ev === 'jumped') audio.jump();
    if (ev === 'hid') {
      audio.hide();
      setFlash('HIDDEN IN THE HAY!', '#7ec850', 1.6);
      if (nearHay) nearHay.used = true;
      Farmer.loseGround(game.farmer, 90);
    }

    var stageChanged = Kitchen.update(game.world, dt, baseSpeed, t);
    if (stageChanged) {
      var names = ['STAGE 2 — THE BARN', 'STAGE 3 — THE KITCHEN'];
      var idx = Math.min(game.world.stage - 1, names.length - 1);
      if (idx >= 0) setFlash(names[idx], '#ffd23e', 2.2);
      audio.spotted();
      Farmer.loseGround(game.farmer, 50);
    }

    game.distance = game.world.distance;
    game.scrollX += baseSpeed * dt;

    // farmer AI
    var events = Farmer.update(game.farmer, t, dt, baseSpeed, t.hiding);
    for (var e = 0; e < events.length; e++) {
      if (events[e] === 'spotted') { audio.spotted(); setFlash('SPOTTED! RUN!', '#ff8a7a', 1.4); }
      if (events[e] === 'searching') { audio.hide(); setFlash('JED IS SEARCHING THE HAY…', '#7ec850', 1.8); }
    }
    t.scared = Farmer.gapTo(game.farmer, t) < 110;

    // collisions
    var col = Kitchen.checkCollisions(game.world, t);
    if (col.corn > 0) {
      game.corn += col.corn;
      game.score += 50 * col.corn;
      audio.pickup();
      Farmer.loseGround(game.farmer, 8 * col.corn);
    }
    if (col.cleared > 0) game.score += 25 * col.cleared;
    if (col.hit) {
      if (col.hit === 'puddle') {
        setFlash('SPLASH! SLOWED DOWN!', '#7ec8e3', 1.2);
        Farmer.gainGround(game.farmer, 40);
        audio.stumble();
      } else {
        game.lives -= 1;
        Turkey.stumble(t);
        Farmer.gainGround(game.farmer, 70);
        audio.stumble();
        setFlash(col.hit === 'knife' ? 'OUCH! CARVING KNIFE!' : col.hit === 'oven' ? 'HOT! THE OVEN!' : 'TRIPPED!', '#ff8a7a', 1.4);
        if (game.lives <= 0) { endRun('caught'); return; }
      }
    }

    // caught by the farmer?
    if (Farmer.gapTo(game.farmer, t) <= 4) { endRun('caught'); return; }

    // score trickles in with distance; escape at 1800 m
    game.score += dt * 12;
    if (game.world.distance >= Kitchen.ESCAPE_DISTANCE) { endRun('escaped'); return; }

    if (game.flashTimer > 0) game.flashTimer -= dt;
  }

  function draw() {
    var stage = Kitchen.stageFor(game.world.distance);
    art.drawBackground(ctx, game.state === 'title' || game.state === 'howto' ? 0 : stage, game.scrollX, game.time);
    var mouse = input.mouse;

    if (game.state === 'title') {
      art.drawTurkey(ctx, 300, 400, 1.3, { runPhase: game.time * 6 });
      art.drawFarmer(ctx, 120, 460, 1.15, { runPhase: game.time * 6 });
      var btns = HUD.drawTitle(ctx, mouse, game.best);
      game.titleButtons = btns;
    } else if (game.state === 'howto') {
      game.howButtons = HUD.drawHowTo(ctx, mouse);
    } else if (game.state === 'paused') {
      Kitchen.draw(game.world, art, ctx);
      Turkey.draw(game.turkey, art, ctx);
      Farmer.draw(game.farmer, art, ctx, game.turkey.hiding);
      HUD.drawHUD(ctx, hudState(), mouse);
      game.pauseButtons = HUD.drawPaused(ctx, mouse);
    } else if (game.state === 'play') {
      Kitchen.draw(game.world, art, ctx);
      Turkey.draw(game.turkey, art, ctx);
      Farmer.draw(game.farmer, art, ctx, game.turkey.hiding);
      HUD.drawHUD(ctx, hudState(), mouse);
    } else {
      // caught / escaped end screens over the frozen scene
      Kitchen.draw(game.world, art, ctx);
      Turkey.draw(game.turkey, art, ctx);
      Farmer.draw(game.farmer, art, ctx, false);
      game.endButtons = HUD.drawEnd(ctx, {
        state: game.state, score: Math.floor(game.score),
        distance: game.distance, corn: game.corn,
        best: game.best, newBest: game.newBest
      }, mouse);
    }
  }

  function hudState() {
    return {
      score: Math.floor(game.score),
      corn: game.corn,
      distance: game.distance,
      stageName: Kitchen.STAGES[game.world.stage].name,
      lives: game.lives,
      farmerGap: Farmer.gapTo(game.farmer, game.turkey),
      flash: game.flash,
      flashTimer: game.flashTimer,
      flashColor: game.flashColor,
      muted: game.muted
    };
  }

  function handleClicks() {
    var click = input.consumeClick();
    if (input.wasPressed('mute')) {
      game.muted = audio.toggleMute();
      if (!game.muted && game.state === 'play') audio.startMusic();
    }
    if (game.state === 'title') {
      if (input.wasPressed('confirm')) { audio.click(); startRun(); return; }
      if (click && game.titleButtons) {
        if (input.insideButton(click, game.titleButtons.start.x, game.titleButtons.start.y, game.titleButtons.start.w, game.titleButtons.start.h)) { audio.click(); startRun(); return; }
        if (input.insideButton(click, game.titleButtons.how.x, game.titleButtons.how.y, game.titleButtons.how.w, game.titleButtons.how.h)) { audio.click(); game.state = 'howto'; return; }
      }
    } else if (game.state === 'howto') {
      if (input.wasPressed('confirm')) { game.state = 'title'; return; }
      if (click && game.howButtons && input.insideButton(click, game.howButtons.back.x, game.howButtons.back.y, game.howButtons.back.w, game.howButtons.back.h)) game.state = 'title';
    } else if (game.state === 'play') {
      if (input.wasPressed('pause')) { game.state = 'paused'; audio.stopMusic(); }
    } else if (game.state === 'paused') {
      if (input.wasPressed('pause') || input.wasPressed('confirm')) { game.state = 'play'; audio.startMusic(); return; }
      if (click && game.pauseButtons && input.insideButton(click, game.pauseButtons.resume.x, game.pauseButtons.resume.y, game.pauseButtons.resume.w, game.pauseButtons.resume.h)) { game.state = 'play'; audio.startMusic(); }
    } else if (game.state === 'caught' || game.state === 'escaped') {
      if (input.wasPressed('restart') || input.wasPressed('confirm')) { startRun(); return; }
      if (click && game.endButtons && input.insideButton(click, game.endButtons.again.x, game.endButtons.again.y, game.endButtons.again.w, game.endButtons.again.h)) startRun();
    }
  }

  var last = 0;
  function frame(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    game.time += dt;
    handleClicks();
    if (game.state === 'play' && !game.shotMode) updatePlay(dt);
    // In shot mode the scene is frozen for a clean screenshot, except the
    // play shot which lets the world idle so feathers and flames animate.
    if (game.state === 'play' && game.shotMode === 'play') {
      game.time += dt;
      game.turkey.runPhase += dt * 8;
      game.farmer.runPhase += dt * 8;
    }
    draw();
    input.endFrame();
    window.requestAnimationFrame(frame);
  }

  input.attach(canvas);
  game.startRun = startRun;
  game.endRun = endRun;
  window.GobbleGame = game;
  window.GobbleShots.apply(game);
  window.requestAnimationFrame(frame);
})();
