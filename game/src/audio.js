// audio.js — all sound for Gobble Run, synthesized with WebAudio.
// No audio files: every gobble, thud and jingle is built from oscillators.
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var musicTimer = null;
  var musicStep = 0;

  // A bouncy autumnal bass line the game hums while you run.
  var MELODY = [262, 0, 330, 392, 0, 330, 294, 0, 220, 0, 262, 294, 330, 0, 392, 0];

  function ensureCtx() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function gobble() {
    tone(520, 0.09, 'sawtooth', 0.10, 0, 300);
    tone(430, 0.09, 'sawtooth', 0.10, 0.10, 260);
    tone(620, 0.14, 'sawtooth', 0.12, 0.20, 340);
  }

  function jumpSound() { tone(280, 0.16, 'sine', 0.14, 0, 620); }
  function pickupSound() { tone(880, 0.08, 'sine', 0.12); tone(1320, 0.12, 'sine', 0.10, 0.07); }
  function hideSound() { tone(180, 0.25, 'triangle', 0.10, 0, 90); }
  function stumbleSound() { tone(160, 0.25, 'sawtooth', 0.16, 0, 60); tone(90, 0.2, 'square', 0.10, 0.05, 50); }
  function spottedSound() {
    tone(740, 0.10, 'square', 0.14); tone(740, 0.10, 'square', 0.14, 0.12);
    tone(988, 0.22, 'square', 0.14, 0.24);
  }
  function caughtSound() {
    tone(392, 0.18, 'sawtooth', 0.16); tone(311, 0.18, 'sawtooth', 0.16, 0.18);
    tone(233, 0.4, 'sawtooth', 0.16, 0.36, 110);
  }
  function escapeSound() {
    var notes = [523, 659, 784, 1047, 784, 1047];
    for (var i = 0; i < notes.length; i++) tone(notes[i], 0.22, 'triangle', 0.14, i * 0.14);
  }
  function clickSound() { tone(660, 0.05, 'sine', 0.08); }

  function startMusic() {
    if (musicTimer || muted) return;
    ensureCtx();
    musicStep = 0;
    musicTimer = setInterval(function () {
      if (muted) return;
      var note = MELODY[musicStep % MELODY.length];
      if (note) tone(note, 0.16, 'triangle', 0.05);
      musicStep++;
    }, 170);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) stopMusic();
    return muted;
  }

  window.GobbleAudio = {
    gobble: gobble, jump: jumpSound, pickup: pickupSound, hide: hideSound,
    stumble: stumbleSound, spotted: spottedSound, caught: caughtSound,
    escape: escapeSound, click: clickSound,
    startMusic: startMusic, stopMusic: stopMusic, toggleMute: toggleMute,
    isMuted: function () { return muted; }, unlock: ensureCtx
  };
})();
