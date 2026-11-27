// input.js — keyboard + mouse, with edge-triggered presses the game reads once.

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  let mousePressed = false;

  const KEYMAP = {
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump',
    ArrowDown: 'duck', KeyS: 'duck',
    ShiftLeft: 'dash', ShiftRight: 'dash', KeyX: 'dash',
    KeyP: 'pause', KeyM: 'mute', KeyR: 'restart', Enter: 'confirm',
  };

  function onKeyDown(e) {
    const action = KEYMAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (!held.has(action)) pressed.add(action);
    held.add(action);
  }
  function onKeyUp(e) {
    const action = KEYMAP[e.code];
    if (action) held.delete(action);
  }
  function onMouseDown(e) {
    e.preventDefault();
    mousePressed = true;
    pressed.add('jump');
  }
  function onBlur() { held.clear(); }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    isHeld(action) { return held.has(action); },
    wasPressed(action) { return pressed.has(action); },
    consumeMouse() { const m = mousePressed; mousePressed = false; return m; },
    endFrame() { pressed.clear(); },
  };
}
