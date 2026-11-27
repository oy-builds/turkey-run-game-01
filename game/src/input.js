// input.js — keyboard + mouse input for Gobble Run.
// One job: turn raw key presses and canvas clicks into game intents.
(function () {
  'use strict';

  var keys = {};
  var pressed = {}; // edge-triggered: true only on the frame the key went down
  var mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };

  var KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    ArrowDown: 'hide', KeyS: 'hide',
    Enter: 'confirm', KeyR: 'restart', KeyP: 'pause', KeyM: 'mute'
  };

  function onKeyDown(e) {
    var action = KEYMAP[e.code];
    if (!action) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault();
    if (!keys[action]) pressed[action] = true;
    keys[action] = true;
  }

  function onKeyUp(e) {
    var action = KEYMAP[e.code];
    if (!action) return;
    keys[action] = false;
  }

  function onMouseMove(e) {
    var r = e.target.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (960 / r.width);
    mouse.y = (e.clientY - r.top) * (540 / r.height);
  }

  function onMouseDown(e) {
    onMouseMove(e);
    mouse.clicked = true;
    mouse.clickX = mouse.x;
    mouse.clickY = mouse.y;
  }

  function attach(canvas) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
  }

  function held(action) { return !!keys[action]; }
  function wasPressed(action) { return !!pressed[action]; }
  function endFrame() {
    pressed = {};
    mouse.clicked = false;
  }

  function consumeClick() {
    if (!mouse.clicked) return null;
    mouse.clicked = false;
    return { x: mouse.clickX, y: mouse.clickY };
  }

  function insideButton(click, bx, by, bw, bh) {
    return click && click.x >= bx && click.x <= bx + bw && click.y >= by && click.y <= by + bh;
  }

  window.GobbleInput = { attach: attach, held: held, wasPressed: wasPressed, endFrame: endFrame, consumeClick: consumeClick, insideButton: insideButton, mouse: mouse };
})();
