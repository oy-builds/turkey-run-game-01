// audio.js — all sound is synthesized with WebAudio; no audio files, no network.
// A tiny gobble-and-dash soundscape: jump chirp, corn ding, knife whoosh,
// stumble thud, caught sting, escape fanfare, plus a soft banjo-ish pluck loop.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.16, slideTo = null, delay = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A two-note gobble: the turkey's own voice.
  function gobble() {
    tone(520, 0.09, 'square', 0.10, 380);
    tone(660, 0.08, 'square', 0.09, 480, 0.09);
    tone(440, 0.12, 'square', 0.10, 300, 0.18);
  }

  const MELODY = [392, 0, 440, 523, 0, 440, 392, 330, 0, 392, 440, 0, 523, 587, 0, 0];
  function startMusic() {
    if (musicTimer) return;
    musicTimer = setInterval(() => {
      if (muted) return;
      const note = MELODY[musicStep % MELODY.length];
      musicStep += 1;
      if (note) tone(note, 0.16, 'triangle', 0.045);
      if (musicStep % 8 === 0) tone(196, 0.3, 'sine', 0.05);
    }, 170);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    jump() { tone(420, 0.14, 'sine', 0.14, 760); },
    doubleJump() { tone(560, 0.12, 'sine', 0.12, 940); },
    dash() { tone(300, 0.18, 'sawtooth', 0.08, 900); },
    corn() { tone(880, 0.09, 'sine', 0.14); tone(1318, 0.12, 'sine', 0.12, null, 0.07); },
    feather() { [660, 880, 1100, 1318].forEach((f, i) => tone(f, 0.1, 'sine', 0.12, null, i * 0.06)); },
    nearMiss() { tone(1200, 0.06, 'sine', 0.08, 1600); },
    stumble() { tone(180, 0.25, 'sawtooth', 0.18, 70); gobble(); },
    knife() { tone(1400, 0.22, 'sawtooth', 0.05, 300); },
    caught() {
      stopMusic();
      [392, 370, 349, 311].forEach((f, i) => tone(f, 0.28, 'sawtooth', 0.14, null, i * 0.22));
      gobble();
    },
    escaped() {
      stopMusic();
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, null, i * 0.12));
      gobble();
    },
    startMusic,
    stopMusic,
  };
}
